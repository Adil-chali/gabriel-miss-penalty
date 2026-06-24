import { useState, useEffect } from 'react';
import { realtimeDB } from '../lib/firebase';
import { ref, set, onDisconnect, remove, onValue } from 'firebase/database';

// Unique ID for this browser tab (stored in sessionStorage)
function getSessionId(): string {
  let id = sessionStorage.getItem('sessionId');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('sessionId', id);
  }
  return id;
}

export default function ActiveViewers() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sessionId = getSessionId();
    const presenceRef = ref(realtimeDB, `presence/${sessionId}`);

    // Function to mark the user as present
    const markPresent = () => {
      set(presenceRef, { timestamp: Date.now() });
      // When the client disconnects, remove this entry
      onDisconnect(presenceRef).remove();
    };

    // Function to mark the user as away (remove entry)
    const markAway = () => {
      remove(presenceRef);
    };

    // First call: mark present if the tab is visible, else mark away
    if (document.visibilityState === 'visible') {
      markPresent();
    } else {
      markAway();
    }

    // Listen to tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        markPresent();
      } else {
        markAway();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen to the entire /presence node to compute the count
    const allPresenceRef = ref(realtimeDB, 'presence');
    const unsubscribe = onValue(allPresenceRef, (snapshot) => {
      const data = snapshot.val() || {};
      setCount(Object.keys(data).length);
    });

    // Cleanup on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      unsubscribe(); // stop Firebase listener
      markAway();    // ensure we're removed when the component unmounts
    };
  }, []);

  return (
    <div className="text-white text-lg sm:text-xl">
      🟢 {count} currently viewing
    </div>
  );
}