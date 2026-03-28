import { useEffect, useState } from "react";
import { differenceInSeconds } from "date-fns";

interface CounterDownProps {
  startTime: number; // timestamp (ms)
  onEndTimer?: () => void;
}

/**
 * CounterDown — countdown timer matching old app's format.
 * Displays hours:minutes:seconds with blinking colons.
 */
export const CounterDown = ({ startTime, onEndTimer }: CounterDownProps) => {
  const [now, setNow] = useState(() => Date.now());
  const [areDotsVisible, setAreDotsVisible] = useState(true);

  const getTimeDifferenceElements = (start: number, end: number) => {
    const dif = differenceInSeconds(new Date(end), new Date(start));
    if (dif <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    const hours = Math.floor(dif / 3600);
    const minutes = Math.floor((dif - hours * 3600) / 60);
    const seconds = Math.floor(dif - hours * 3600 - minutes * 60);
    return { hours, minutes, seconds };
  };

  const time = getTimeDifferenceElements(now, startTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
      setAreDotsVisible((prev) => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (time.hours === 0 && time.minutes === 0 && time.seconds === 0) {
      onEndTimer?.();
    }
  }, [time.hours, time.minutes, time.seconds, onEndTimer]);

  if (time.hours === 0 && time.minutes === 0 && time.seconds === 0)
    return null;

  return (
    <span style={{ direction: "ltr", display: "inline-block" }}>
      {`${time.hours}`}
      <span
        style={{
          display: "inline-block",
          position: "relative",
          top: "-3px",
          opacity: areDotsVisible ? "50%" : "100%",
        }}
      >
        :
      </span>
      {`${time.minutes < 10 ? "0" : ""}${time.minutes}`}
      <span
        style={{
          display: "inline-block",
          position: "relative",
          top: "-3px",
          opacity: areDotsVisible ? "50%" : "100%",
        }}
      >
        :
      </span>
      {`${time.seconds < 10 ? "0" : ""}${time.seconds}`}
    </span>
  );
};
