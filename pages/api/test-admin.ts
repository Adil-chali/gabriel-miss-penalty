import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebase-admin.js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const ref = db.ref('test/admin-check');
    await ref.set({ timestamp: new Date().toISOString() });
    const snap = await ref.once('value');
    await ref.remove();
    res.status(200).json({ success: true, data: snap.val() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}