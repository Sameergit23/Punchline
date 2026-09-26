import type { ReactNode } from "react";
import { tilt } from "../lib/ui";

const POINTS = 12;
const STAR = Array.from({ length: POINTS * 2 }, (_, i) => {
  const r = i % 2 ? 39 : 50;
  const a = (Math.PI * i) / POINTS - Math.PI / 2;
  return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
}).join(" ");

/** Yellow 12-point starburst sticker. */
export function Starburst({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`tilt ${className}`} style={tilt(3)}>
      <svg
        viewBox="0 0 100 100"
        className="size-full overflow-visible drop-shadow-[4px_4px_0_var(--color-ink)]"
        aria-hidden
      >
        <polygon
          points={STAR}
          fill="var(--color-yellow)"
          stroke="var(--color-ink)"
          strokeWidth={3}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <p className="absolute inset-0 grid place-content-center text-center font-display text-ink">
        {children}
      </p>
    </div>
  );
}
