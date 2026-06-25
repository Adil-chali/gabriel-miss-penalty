import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebase-admin.js';

// Rate limit: 1 increment per 5 seconds per IP
const RATE_LIMIT_SECONDS = 15;

// Verify a Turnstile token with Cloudflare
async function verifyTurnstile(token: string, secret: string): Promise<boolean> {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token }),
  });
  const data = await res.json();
  return data.success === true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Check Turnstile token
  const token = req.body.token as string | undefined;
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!token || !secret) {
    return res.status(400).json({ error: 'Missing token or server secret' });
  }

  const verify = await verifyTurnstile(token, secret);
  if (!verify) {
    return res.status(403).json({ error: 'Turnstile verification failed' });
  }

  // Get client IP 
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress) || 'unknown';

  try {
    // Rate limiting: check if this IP already incremented recently
    const rateRef = db.ref(`ratelimit/${encodeURIComponent(ip)}`);
    const rateSnap = await rateRef.once('value');
    const now = Date.now();

    if (rateSnap.exists()) {
      const lastIncrement = rateSnap.val();
      if (now - lastIncrement < RATE_LIMIT_SECONDS * 1000) {
        return res.status(429).json({ error: 'Too many requests' });
      }
    }

    // Update the rate limit timestamp
    await rateRef.set(now);

    // Increment the total views using a transaction (safe for concurrent writes)
    const totalRef = db.ref('views/total');
    let newTotal = 0;
    await totalRef.transaction((current: number) => {
      newTotal = (current || 0) + 1;
      return newTotal;
    });

    return res.status(200).json({ total: newTotal });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}