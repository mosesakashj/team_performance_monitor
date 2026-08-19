import { useId } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
  CartesianGrid,
  Area,
  Cell,
} from 'recharts';

const UTILIZATION_COLORS = {
  low: '#ef4444',
  medium: '#f59e0b',
  high: '#10b981',
};

const getUtilizationColor = (util) => {
  if (util > 90) return UTILIZATION_COLORS.high;
  if (util > 75) return UTILIZATION_COLORS.medium;
  return UTILIZATION_COLORS.low;
};

const SKILL_GRADIENTS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'];
const PROJECT_GRADIENT = { start: '#f59e0b', end: '#f97316' };
const ENDORSEMENT_GRADIENT = { start: '#8b5cf6', end: '#a78bfa' };

function PremiumTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-600 dark:text-slate-300">{entry.name}:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {formatter ? formatter(entry.value, entry.name) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartGradients({ id, colors }) {
  return (
    <defs>
      {colors.map((color, i) => (
        <linearGradient key={i} id={`${id}-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.9} />
          <stop offset="100%" stopColor={color} stopOpacity={0.6} />
        </linearGradient>
      ))}
    </defs>
  );
}

const axisTickStyle = {
  fontSize: 11,
  fill: '#94a3b8',
};

const gridStyle = {
  strokeDasharray: '3 3',
  stroke: '#e2e8f0',
  strokeOpacity: 0.6,
};

const darkGridStyle = {
  strokeDasharray: '3 3',
  stroke: '#334155',
  strokeOpacity: 0.6,
};

export function UtilizationChart({ people }) {
  const gradientId = useId();
  if (!people || people.length === 0) return null;

  const data = people.map((p) => ({
    name: p.name,
    utilization: p.utilization,
    team: p.team?.name ?? 'N/A',
    color: getUtilizationColor(p.utilization),
  }));

  const colors = data.map((d) => d.color);

  return (
    <ResponsiveContainer width="100%" height={420}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
        <ChartGradients id={gradientId} colors={[...new Set(colors)]} />
        <CartesianGrid {...gridStyle} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ ...axisTickStyle, angle: -45, textAnchor: 'end' }}
          axisLine={{ stroke: '#e2e8f0' }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={axisTickStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<PremiumTooltip formatter={(v) => `${v}%`} />} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
        <Bar
          dataKey="utilization"
          name="Utilization"
          radius={[6, 6, 0, 0]}
          maxBarSize={48}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SkillInventoryChart({ skills }) {
  const gradientId = useId();
  if (!skills || skills.length === 0) return null;

  const sorted = [...skills].sort((a, b) => b.holderCount - a.holderCount).slice(0, 10);

  const data = sorted.map((s, i) => ({
    skill: s.skill.name,
    category: s.skill.category,
    holders: s.holderCount,
    fill: SKILL_GRADIENTS[i % SKILL_GRADIENTS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={420}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
        <ChartGradients id={gradientId} colors={SKILL_GRADIENTS} />
        <CartesianGrid {...gridStyle} vertical={false} />
        <XAxis
          dataKey="skill"
          tick={{ ...axisTickStyle, angle: -45, textAnchor: 'end' }}
          axisLine={{ stroke: '#e2e8f0' }}
          tickLine={false}
        />
        <YAxis
          tick={axisTickStyle}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={<PremiumTooltip />}
          cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
        />
        <Bar
          dataKey="holders"
          name="Holders"
          radius={[6, 6, 0, 0]}
          maxBarSize={52}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ProjectHealthChart({ projects }) {
  const gradientId = useId();
  if (!projects || projects.length === 0) return null;

  const data = projects.map((p) => ({
    name: p.name,
    coverage: Math.round(p.coverageRatio * 100),
    staff: p.staff.length,
    required: p.requiredCount,
    status: p.status,
  }));

  return (
    <ResponsiveContainer width="100%" height={440}>
      <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
        <defs>
          <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PROJECT_GRADIENT.start} stopOpacity={0.3} />
            <stop offset="100%" stopColor={PROJECT_GRADIENT.end} stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id={`${gradientId}-line`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={PROJECT_GRADIENT.start} />
            <stop offset="100%" stopColor={PROJECT_GRADIENT.end} />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridStyle} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ ...axisTickStyle, angle: -45, textAnchor: 'end' }}
          axisLine={{ stroke: '#e2e8f0' }}
          tickLine={false}
        />
        <YAxis
          tick={axisTickStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
          domain={[0, 120]}
        />
        <Tooltip
          content={<PremiumTooltip formatter={(v, name) => name === 'coverage' ? `${v}%` : v} />}
          cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
        />
        <Area
          type="monotone"
          dataKey="coverage"
          name="Coverage"
          stroke={PROJECT_GRADIENT.start}
          strokeWidth={2.5}
          fill={`url(#${gradientId}-area)`}
        />
        <Line
          type="monotone"
          dataKey="coverage"
          name="Coverage Line"
          stroke={`url(#${gradientId}-line)`}
          strokeWidth={2.5}
          dot={{ fill: PROJECT_GRADIENT.start, strokeWidth: 2, r: 4, stroke: '#fff' }}
          activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function EndorsementChart({ people }) {
  const gradientId = useId();
  if (!people || people.length === 0) return null;

  const sorted = [...people].sort((a, b) => b.endorsementCount - a.endorsementCount).slice(0, 8);

  const data = sorted.map((p) => ({
    name: p.name,
    endorsements: p.endorsementCount,
    avgRating: p.avgRating ?? 0,
  }));

  const maxVal = Math.max(...data.map((d) => d.endorsements));

  return (
    <ResponsiveContainer width="100%" height={420}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
        <defs>
          <linearGradient id={`${gradientId}-bar`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ENDORSEMENT_GRADIENT.start} stopOpacity={0.95} />
            <stop offset="100%" stopColor={ENDORSEMENT_GRADIENT.end} stopOpacity={0.7} />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridStyle} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ ...axisTickStyle, angle: -45, textAnchor: 'end' }}
          axisLine={{ stroke: '#e2e8f0' }}
          tickLine={false}
        />
        <YAxis
          tick={axisTickStyle}
          axisLine={false}
          tickLine={false}
          domain={[0, Math.ceil(maxVal * 1.15)]}
        />
        <Tooltip
          content={<PremiumTooltip formatter={(v, name) => name === 'endorsements' ? `${v} endorsements` : v} />}
          cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
        />
        <Bar
          dataKey="endorsements"
          name="Endorsements"
          fill={`url(#${gradientId}-bar)`}
          radius={[6, 6, 0, 0]}
          maxBarSize={52}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
