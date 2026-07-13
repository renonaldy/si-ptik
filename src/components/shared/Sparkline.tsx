import { useId } from "react";

interface SparklineProps {
  data: number[];
  className?: string;
}

// Inline-SVG sparkline. Reads `hsl(var(--ma))` from the nearest styled ancestor,
// so it is theme- and accent-aware with zero JS branching and no chart deps.
export function Sparkline({ data, className }: SparklineProps) {
  const gid = useId();
  const w = 100;
  const h = 32;
  const p = 2;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const x = (i: number) => p + (i * (w - p * 2)) / Math.max(data.length - 1, 1);
  const y = (v: number) => h - p - ((v - min) / Math.max(max - min, 1)) * (h - p * 2);
  const line = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const fill = `${line} L${x(data.length - 1).toFixed(1)},${h} L${x(0).toFixed(1)},${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--ma))" stopOpacity="0.28" />
          <stop offset="100%" stopColor="hsl(var(--ma))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#${gid})`} />
      <path
        d={line}
        fill="none"
        stroke="hsl(var(--ma))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
