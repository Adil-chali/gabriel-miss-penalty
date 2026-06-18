import { useEffect, useState } from 'react';
import { realtimeDB } from '../lib/firebase';
import { ref, set, get, remove } from 'firebase/database';

export default function TestClient() {
  const [status, setStatus] = useState('Testing...');

  
  useEffect(() => {
    const testRef = ref(realtimeDB, 'presence/test-client-check');
    set(testRef, { timestamp: new Date().toISOString() })
      .then(() => get(testRef))
      .then((snapshot) => {
        remove(testRef);
        setStatus(`Success: ${JSON.stringify(snapshot.val())}`);
      })
      .catch((err: Error) => setStatus(`Error: ${err.message}`));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <h1 className="text-2xl">{status}</h1>
    </div>
  );
}