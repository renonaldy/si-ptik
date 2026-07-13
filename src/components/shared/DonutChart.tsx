import { MODULE_VAR, type ModuleKey } from "@/lib/moduleColors";

interface DonutChartProps {
  data: { key: ModuleKey; value: number }[];
  total: number;
}

// Inline-SVG donut. Each slice uses its domain hue; a 2px gap (dasharray shrink)
// separates adjacent slices. Center shows the total. Identity is reinforced by the
// accompanying legend in the parent, never color-alone.
export function DonutChart({ data, total }: DonutChartProps) {
  const size = 180;
  const r = 70;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  const sum = Math.max(total, 1);
  let off = 0;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-44 w-44">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="18" />
      {data
        .filter((d) => d.value > 0)
        .map((d) => {
          const len = (d.value / sum) * C;
          const seg = (
            <circle
              key={d.key}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={`hsl(var(${MODULE_VAR[d.key]}))`}
              strokeWidth="18"
              strokeDasharray={`${Math.max(len - 2, 0)} ${C - Math.max(len - 2, 0)}`}
              strokeDashoffset={-off}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          );
          off += len;
          return seg;
        })}
      <text x={cx} y={cy - 4} textAnchor="middle" className="fill-foreground font-display text-2xl font-medium tabular-nums">
        {total}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" className="fill-muted-foreground text-[11px]">
        Total data
      </text>
    </svg>
  );
}
