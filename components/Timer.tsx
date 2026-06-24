import { useState, useEffect } from 'react';

const START_DATE = Date.UTC(2026, 4, 30, 18, 21, 0); 
const PLACEHOLDER = '00:00:00:00';


function getElapsed(now: number) {
  const diff = now - START_DATE;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds };
}

function pad(num: number): string {
  return num.toString().padStart(2, '0');
}

function format(e: ReturnType<typeof getElapsed>): string {
  return `${pad(e.days)}:${pad(e.hours)}:${pad(e.minutes)}:${pad(e.seconds)}`;
}

export default function Timer() {
  const [display, setDisplay] = useState(PLACEHOLDER);

  useEffect(() => {
    setDisplay(format(getElapsed(Date.now())));

   const interval = setInterval(() => {
      setDisplay(format(getElapsed(Date.now())));
    }, 1000);



    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-white font-mono text-2xl sm:text-4xl md:text-6xl">
      {display}
    </div>
  );
}