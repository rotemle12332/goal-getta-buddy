export function LineChart({
  data,
  height = 160,
  showDots = true,
  highlightLast = false,
  labels,
}: {
  data: number[];
  height?: number;
  showDots?: boolean;
  highlightLast?: boolean;
  labels?: string[];
}) {
  const w = 320;
  const h = height;
  const pad = 16;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = (w - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => [pad + i * stepX, h - pad - ((v - min) / range) * (h - pad * 2)] as const);

  // smooth path
  const path = pts.reduce((acc, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = pts[i - 1];
    const cx = (px + x) / 2;
    return `${acc} Q ${cx} ${py} ${cx} ${(py + y) / 2} T ${x} ${y}`;
  }, "");

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.82 0.16 210 / 30%)" />
            <stop offset="100%" stopColor="oklch(0.82 0.16 210 / 0%)" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((p) => (
          <line key={p} x1={pad} x2={w - pad} y1={h * p} y2={h * p} stroke="oklch(0.3 0.03 240 / 40%)" strokeDasharray="2 4" />
        ))}
        <path d={`${path} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`} fill="url(#lineFill)" />
        <path d={path} stroke="oklch(0.82 0.16 210)" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        {showDots &&
          pts.map(([x, y], i) => {
            const last = i === pts.length - 1 && highlightLast;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={last ? 6 : 3.5} fill="oklch(0.82 0.16 210)" />
                {last && <circle cx={x} cy={y} r={3} fill="oklch(0.18 0.02 240)" />}
              </g>
            );
          })}
      </svg>
      {labels && (
        <div className="flex justify-between px-3 mt-1 text-[10px] text-muted-foreground tracking-wider">
          {labels.map((l, i) => (
            <span key={i} className={highlightLast && i === labels.length - 1 ? "text-primary font-medium" : ""}>
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
