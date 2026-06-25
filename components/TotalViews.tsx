import { useState, useEffect, useRef, useCallback } from 'react';
import { realtimeDB } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';

declare global {
  interface Window {
    turnstile?: {
      render: (selector: string, options: any) => string | number;
      execute: (widgetId: string | number) => void;
      remove: (widgetId: string | number) => void;
      reset: (widgetId: string | number) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
const TOKEN_REFRESH_INTERVAL = 4 * 60 * 1000; // refresh 1 minute before 5-min expiry

export default function TotalViews() {
  const [total, setTotal] = useState<number | null>(null);
  const widgetIdRef = useRef<string | number | undefined>(undefined);
  const tokenRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Function to call the increment API with the token
  const incrementView = useCallback(async (token: string) => {
    try {
      await fetch('/api/increment-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
    } catch {
      // silently ignore errors
    }
  }, []);

  // Function to obtain a fresh token (invisible, no interaction for trusted users)
  const getToken = useCallback(() => {
    if (!window.turnstile) return;
    if (widgetIdRef.current === undefined) return;

    // Reset the widget to get a new token
    window.turnstile.reset(widgetIdRef.current);
    // Execute invisible challenge
    window.turnstile.execute(widgetIdRef.current);
  }, []);

  useEffect(() => {
    if (!window.turnstile || !SITE_KEY) return;

    // Render invisible widget (hidden, size 'invisible')
    widgetIdRef.current = window.turnstile.render('#turnstile-widget', {
      sitekey: SITE_KEY,
      size: 'invisible',
      callback: (token: string) => {
        // Store the fresh token
        tokenRef.current = token;
        // Use it for the view count
        incrementView(token);
      },
      'refresh-expired': 'manual', // we control refresh
    });

    // Immediately execute to get first token (no user interaction for trusted users)
    window.turnstile.execute(widgetIdRef.current);

    // Set up auto-refresh before token expires
    refreshTimerRef.current = setInterval(() => {
      if (widgetIdRef.current !== undefined) {
        getToken();
      }
    }, TOKEN_REFRESH_INTERVAL);

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (widgetIdRef.current !== undefined && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = undefined;
      }
    };
  }, [incrementView, getToken]);

  // Real-time listener for total views
  useEffect(() => {
    const totalRef = ref(realtimeDB, 'views/total');
    const unsubscribe = onValue(totalRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null) setTotal(val);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="text-white text-lg">
      {/* Hidden container for the invisible Turnstile widget */}
      <div id="turnstile-widget" style={{ display: 'none' }}></div>
      {total === null ? '--- All Time Jerkers' : `${total.toLocaleString()} All Time Jerkers`}
    </div>
  );
}