import { useId } from "react";

const NEON = {
  cyan: "#22d3ee",
  blue: "#3b82f6",
  purple: "#a855f7",
  magenta: "#e879f9",
  emerald: "#34d399",
  amber: "#fbbf24",
  pink: "#f472b6",
  indigo: "#818cf8",
};

const DONUT_COLORS = [NEON.purple, NEON.emerald, NEON.blue, NEON.cyan, NEON.magenta, NEON.amber];

function ChartShell({ title, subtitle, children, className = "" }) {
  return (
    <div className={`dashboard-chart ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold tracking-tight text-slate-100">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

/** Catmull-Rom → cubic Bezier smooth path through points */
function smoothPath(pts) {
  if (pts.length < 2) return "";
  if (pts.length === 2) {
    return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;
  }
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function BarChart({ title, subtitle, labels = [], values = [], color = NEON.cyan }) {
  const hasData = Array.isArray(values) && values.length > 0 && Array.isArray(labels) && labels.length > 0;
  const safeValues = hasData ? values.map(Number) : [];
  const safeLabels = hasData ? labels : [];
  const max = Math.max(...safeValues, 1);

  return (
    <ChartShell title={title} subtitle={subtitle}>
      {!hasData ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-500">No data yet</div>
      ) : (
        <div className="flex h-48 items-end gap-2.5 md:gap-3.5">
          {safeValues.map((value, index) => {
            const height = Math.max(10, (Number(value) / max) * 100);
            return (
              <div key={`${safeLabels[index]}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <span className="text-[10px] font-semibold tabular-nums text-slate-300">{value}</span>
                <div className="flex w-full items-end justify-center" style={{ height: "132px" }}>
                  <div
                    className="dashboard-bar w-[55%] max-w-[36px] rounded-t-xl"
                    style={{
                      height: `${height}%`,
                      background: `linear-gradient(180deg, ${color} 0%, ${color}99 42%, ${color}18 100%)`,
                      boxShadow: `0 0 18px ${color}55, 0 0 4px ${color}88`,
                    }}
                  />
                </div>
                <span className="w-full truncate text-center text-[10px] text-slate-400">{safeLabels[index]}</span>
              </div>
            );
          })}
        </div>
      )}
    </ChartShell>
  );
}

function LineChart({ title, subtitle, labels = [], values = [], color = NEON.cyan, unit = "" }) {
  const uid = useId().replace(/:/g, "");
  const hasData = Array.isArray(values) && values.length > 0 && Array.isArray(labels) && labels.length > 0;
  const safeValues = hasData ? values.map(Number) : [];
  const safeLabels = hasData ? labels : [];

  if (!hasData) {
    return (
      <ChartShell title={title} subtitle={subtitle}>
        <div className="flex h-48 items-center justify-center text-sm text-slate-500">No data yet</div>
      </ChartShell>
    );
  }

  const max = Math.max(...safeValues, 1);
  const min = Math.min(...safeValues, 0);
  const range = max - min || 1;
  const padX = 2;
  const padTop = 8;
  const padBottom = 12;
  const plotH = 100 - padTop - padBottom;

  const pts = safeValues.map((value, index) => ({
    x: padX + (index / Math.max(safeValues.length - 1, 1)) * (100 - padX * 2),
    y: padTop + plotH - ((value - min) / range) * plotH,
  }));

  const line = smoothPath(pts);
  const area = `${line} L ${pts[pts.length - 1].x} 100 L ${pts[0].x} 100 Z`;
  const gradId = `area-${uid}`;
  const glowId = `glow-${uid}`;

  return (
    <ChartShell title={title} subtitle={subtitle}>
      <svg viewBox="0 0 100 100" className="h-48 w-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.45" />
            <stop offset="55%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[20, 40, 60, 80].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="rgba(148,163,184,0.1)"
            strokeWidth="0.35"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={area} fill={`url(#${gradId})`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2.4"
          strokeLinejoin="round"
          strokeLinecap="round"
          filter={`url(#${glowId})`}
          vectorEffect="non-scaling-stroke"
        />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1.35"
            fill="#0a0e14"
            stroke={color}
            strokeWidth="0.9"
            filter={`url(#${glowId})`}
            vectorEffect="non-scaling-stroke"
          >
            <title>
              {safeLabels[i]}: {safeValues[i]}
              {unit}
            </title>
          </circle>
        ))}
      </svg>
      <div
        className="mt-1 grid gap-1 text-center text-[10px] text-slate-400"
        style={{ gridTemplateColumns: `repeat(${safeLabels.length}, minmax(0, 1fr))` }}
      >
        {safeLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </ChartShell>
  );
}

function DonutChart({ title, subtitle, labels = [], values = [], colors = DONUT_COLORS }) {
  const hasData = Array.isArray(values) && values.length > 0 && Array.isArray(labels) && labels.length > 0;
  if (!hasData) {
    return (
      <ChartShell title={title} subtitle={subtitle}>
        <div className="flex h-48 items-center justify-center text-sm text-slate-500">No data yet</div>
      </ChartShell>
    );
  }

  const safeValues = values.map(Number);
  const safeLabels = labels;
  const total = safeValues.reduce((s, v) => s + v, 0) || 1;
  const r = 36;
  const stroke = 14;
  const c = 2 * Math.PI * r;
  let offset = 0;

  const segments = safeValues.map((value, index) => {
    const len = (value / total) * c;
    const seg = {
      color: colors[index % colors.length],
      dash: `${len} ${c - len}`,
      offset,
      value,
      label: safeLabels[index],
      pct: Math.round((value / total) * 100),
    };
    offset -= len;
    return seg;
  });

  return (
    <ChartShell title={title} subtitle={subtitle}>
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative shrink-0">
          <svg width="168" height="168" viewBox="0 0 100 100" className="dashboard-donut -rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth={stroke} />
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeDasharray={seg.dash}
                strokeDashoffset={seg.offset}
                strokeLinecap="butt"
                style={{ filter: `drop-shadow(0 0 6px ${seg.color}88)` }}
              />
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-bold tabular-nums text-white">{total}</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Total</span>
          </div>
        </div>
        <ul className="flex w-full flex-col gap-2.5 sm:max-w-[52%]">
          {segments.map((seg) => (
            <li key={seg.label} className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: seg.color, boxShadow: `0 0 8px ${seg.color}` }}
                />
                <span className="truncate text-xs text-slate-300">{seg.label}</span>
              </span>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-100">
                {seg.value}
                <span className="ml-1.5 font-normal text-slate-500">{seg.pct}%</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ChartShell>
  );
}

export function AdminDashboardCharts({ stats }) {
  const charts = stats?.charts || {};
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <BarChart
        title="Campus overview"
        subtitle="Current campus records from the database"
        labels={charts.overview?.labels}
        values={charts.overview?.values}
        color={NEON.blue}
      />
      <LineChart
        title="Monthly enrollments"
        subtitle="New enrollments by month"
        labels={charts.enrollments?.labels}
        values={charts.enrollments?.values}
        color={NEON.cyan}
      />
      <LineChart
        title="Attendance rate"
        subtitle="Present % by month"
        labels={charts.attendance?.labels}
        values={charts.attendance?.values}
        color={NEON.emerald}
        unit="%"
      />
      <LineChart
        title="Assignments & submissions"
        subtitle="Activity over recent months"
        labels={charts.submissions?.labels || charts.assignments?.labels}
        values={charts.submissions?.values || charts.assignments?.values}
        color={NEON.purple}
      />
      {charts.byClass?.labels?.length ? (
        <DonutChart
          title="Students by class"
          subtitle="Active enrollments per class"
          labels={charts.byClass.labels}
          values={charts.byClass.values}
        />
      ) : null}
      {charts.fees?.labels?.length ? (
        <BarChart
          title="Fee collection"
          subtitle="Amount collected by month"
          labels={charts.fees.labels}
          values={charts.fees.values}
          color={NEON.cyan}
        />
      ) : null}
    </section>
  );
}

export function TeacherDashboardCharts({ stats }) {
  const charts = stats?.charts || {};
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <BarChart
        title="Class overview"
        subtitle="Your classes from the database"
        labels={charts.overview?.labels}
        values={charts.overview?.values}
        color={NEON.emerald}
      />
      <LineChart
        title="Attendance trend"
        subtitle="Present % by month"
        labels={charts.attendance?.labels}
        values={charts.attendance?.values}
        color={NEON.cyan}
        unit="%"
      />
      {charts.byClass?.labels?.length ? (
        <DonutChart
          title="Students by class"
          subtitle="Learners in your allotted classes"
          labels={charts.byClass.labels}
          values={charts.byClass.values}
        />
      ) : null}
      {charts.assignments?.labels?.length ? (
        <LineChart
          title="Assignment activity"
          subtitle="Tasks created by month"
          labels={charts.assignments.labels}
          values={charts.assignments.values}
          color={NEON.purple}
        />
      ) : null}
    </section>
  );
}

export function StudentDashboardCharts({ stats }) {
  const charts = stats?.charts || {};
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <BarChart
        title="My progress"
        subtitle="Courses and academic activity"
        labels={charts.overview?.labels}
        values={charts.overview?.values}
        color={NEON.blue}
      />
      <LineChart
        title="Attendance trend"
        subtitle="Present % by month"
        labels={charts.attendance?.labels}
        values={charts.attendance?.values}
        color={NEON.cyan}
        unit="%"
      />
      {charts.marks?.labels?.length ? (
        <LineChart
          title="Marks trend"
          subtitle="Scores recorded by month"
          labels={charts.marks.labels}
          values={charts.marks.values}
          color={NEON.magenta}
        />
      ) : null}
    </section>
  );
}

