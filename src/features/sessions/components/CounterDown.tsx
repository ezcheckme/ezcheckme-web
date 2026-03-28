/**
 * CounterDown — elapsed-time counter
 * Mirrors legacy CounterDown.js.
 * Shows HH:MM:SS elapsed since `startTime` with blinking colon separators.
 */

import { useState, useEffect } from "react";

interface CounterDownProps {
  startTime: number;
  className?: string;
}

function getTimeDiff(now: number, start: number) {
  const diff = Math.max(0, Math.floor((now - start) / 1000));
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  return { hours, minutes, seconds };
}

export function CounterDown({ startTime, className }: CounterDownProps) {
  const [now, setNow] = useState(() => Date.now());
  const [dotsVisible, setDotsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
      setDotsVisible((prev) => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const time = getTimeDiff(now, startTime);

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return (
    <div style={{ direction: "ltr" }} className={className}>
      {time.hours}
      <span
        style={{
          display: "inline-block",
          position: "relative",
          top: "-3px",
          opacity: dotsVisible ? 0.5 : 1,
        }}
      >
        :
      </span>
      {pad(time.minutes)}
      <span
        style={{
          display: "inline-block",
          position: "relative",
          top: "-3px",
          opacity: dotsVisible ? 0.5 : 1,
        }}
      >
        :
      </span>
      {pad(time.seconds)}
    </div>
  );
}
