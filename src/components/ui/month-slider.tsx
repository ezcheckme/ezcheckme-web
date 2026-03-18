/**
 * MonthSlider — Custom draggable range slider with floating bubble tooltip.
 * MUI-style: blue track, black circular balloon above thumb.
 *
 * Usage:
 *   <MonthSlider months={months} value={currentMonth} onChange={setCurrentMonth} />
 */

import { useRef } from "react";
import { format } from "date-fns";
import { theme } from "@/config/theme";

interface MonthSliderProps {
  months: Date[];
  value: Date;
  onChange: (month: Date) => void;
  width?: number;
}

export function MonthSlider({
  months,
  value,
  onChange,
  width = 300,
}: MonthSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const currentIndex = months.findIndex(
    (m) =>
      m.getFullYear() === value.getFullYear() &&
      m.getMonth() === value.getMonth(),
  );
  const pct =
    months.length > 1 ? (currentIndex / (months.length - 1)) * 100 : 50;

  const resolveIndex = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / rect.width),
    );
    const idx = Math.round(ratio * (months.length - 1));
    onChange(months[idx]);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    resolveIndex(e.clientX);
    const onMove = (ev: MouseEvent) => resolveIndex(ev.clientX);
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  if (months.length <= 1) return null;

  return (
    <div
      ref={trackRef}
      onMouseDown={handleMouseDown}
      style={{
        position: "relative",
        width,
        height: 4,
        background: theme.colors.slider.inactive,
        borderRadius: 2,
        cursor: "pointer",
        marginTop: 44,
      }}
    >
      {/* Active track */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: 4,
          width: `${pct}%`,
          background: theme.colors.slider.track,
          borderRadius: 2,
          pointerEvents: "none",
        }}
      />

      {/* Thumb + bubble */}
      <div
        style={{
          position: "absolute",
          left: `${pct}%`,
          top: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "grab",
        }}
      >
        {/* Bubble tooltip */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            background: theme.colors.slider.bubble,
            color: theme.colors.text.white,
            borderRadius: "50% 50% 50% 0",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: theme.font.size.xs,
            fontWeight: theme.font.weight.semibold,
            whiteSpace: "nowrap",
            transform: "rotate(-45deg)",
            boxShadow: theme.shadow.md,
          }}
        >
          <span
            style={{
              transform: "rotate(45deg)",
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            {format(value, "MMM")}
            <br />
            {format(value, "yyyy")}
          </span>
        </div>

        {/* Blue dot */}
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: theme.radius.round,
            background: theme.colors.slider.track,
            boxShadow: theme.shadow.sm,
          }}
        />
      </div>
    </div>
  );
}
