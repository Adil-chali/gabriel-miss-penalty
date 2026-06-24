import { useState, useEffect } from 'react';
import { realtimeDB } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';

export default function TotalViews() {
  const [total, setTotal] = useState<number | null>(null);

  // Listen to the real‑time total from Firebase
  useEffect(() => {
    const totalRef = ref(realtimeDB, 'views/total');
    const unsubscribe = onValue(totalRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null) setTotal(val);
    });
    return () => unsubscribe();
  }, []);

  // Fire the increment API once on mount (no need to await the result)
  useEffect(() => {
    fetch('/api/increment-view', { method: 'POST' }).catch(() => {});
  }, []);

  // While the number is loading, show a placeholder
  if (total === null) {
    return <div className="text-white text-lg">--- All Time Jerkers</div>;
  }

  // Once loaded, show the real count
  return (
    <div className="text-white text-lg">
      {total.toLocaleString()} All Time Jerkers
    </div>
  );
}