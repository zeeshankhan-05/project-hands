interface ChartPoint {
  label: string;
  value: number;
}

export function LineChart({
  points,
  label,
  suffix = "",
  color = "#12606b",
  maximumValue,
}: {
  points: ChartPoint[];
  label: string;
  suffix?: string;
  color?: string;
  maximumValue?: number;
}) {
  if (!points.length) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-2xl bg-[#f4f5f2] text-sm text-[var(--muted)]">
        No measurements available.
      </div>
    );
  }

  const width = 640;
  const height = 240;
  const padding = { top: 26, right: 30, bottom: 42, left: 48 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const values = points.map((point) => point.value);
  const rawMinimum = Math.min(...values);
  const rawMaximum = Math.max(...values);
  const spread = Math.max(rawMaximum - rawMinimum, 1);
  const minimum = Math.max(0, rawMinimum - spread * 0.25);
  const maximum = maximumValue ?? rawMaximum + spread * 0.25;
  const range = Math.max(maximum - minimum, 1);

  const coordinates = points.map((point, index) => ({
    ...point,
    x:
      padding.left +
      (points.length === 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth),
    y: padding.top + plotHeight - ((point.value - minimum) / range) * plotHeight,
  }));
  const polyline = coordinates.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-60 w-full overflow-visible"
        role="img"
        aria-label={`${label}: ${points.map((point) => `${point.label}, ${point.value}${suffix}`).join("; ")}`}
      >
        {[0, 0.5, 1].map((position) => {
          const y = padding.top + plotHeight * position;
          const value = maximum - range * position;
          return (
            <g key={position}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#dce3e0" strokeWidth="1" />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#66777a">
                {Math.round(value)}{suffix}
              </text>
            </g>
          );
        })}
        <polyline points={polyline} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {coordinates.map((point) => (
          <g key={`${point.label}-${point.x}`}>
            <circle cx={point.x} cy={point.y} r="7" fill="white" stroke={color} strokeWidth="4" />
            <text x={point.x} y={height - 13} textAnchor="middle" fontSize="12" fill="#66777a">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
      <table className="sr-only">
        <caption>{label}</caption>
        <thead><tr><th>Date</th><th>Value</th></tr></thead>
        <tbody>
          {points.map((point, index) => (
            <tr key={`${point.label}-${index}`}><td>{point.label}</td><td>{point.value}{suffix}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
