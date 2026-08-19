import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { PieChart, Pie } from 'recharts';

const CATEGORY_COLORS = {
  Language: '#3568f7',
  Framework: '#8b5cf6',
  Cloud: '#06b6d4',
  Data: '#f59e0b',
  'Soft Skill': '#10b981',
  Domain: '#ec4899',
};

const STATUS_COLORS = {
  active: '#10b981',
  completed: '#3568f7',
  planning: '#f59e0b',
  on_hold: '#f97316',
  cancelled: '#ef4444',
};

const CHART_PALETTE = ['#3568f7', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#f97316', '#14b8a6'];

function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
      {label && (
        <p className="mb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      )}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-600 dark:text-slate-300">{entry.name}:</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {formatter ? formatter(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm transition-shadow hover:shadow-md ${className}`}>
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function CustomLegend({ payload }) {
  return (
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
      {payload?.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-slate-500 dark:text-slate-400">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function SkillsDistributionChart({ skills }) {
  const sorted = useMemo(() => {
    if (!skills || skills.length === 0) return [];
    const categoryCounts = {};
    skills.forEach((s) => {
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    });
    return Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([category, count]) => ({ category, count }));
  }, [skills]);

  if (sorted.length === 0) return null;

  return (
    <ChartCard title="Skills Distribution" subtitle="Skills by category">
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} barCategoryGap="20%">
            <defs>
              {sorted.map((entry, i) => (
                <linearGradient key={i} id={`skillGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_PALETTE[i % CHART_PALETTE.length]} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={CHART_PALETTE[i % CHART_PALETTE.length]} stopOpacity={0.5} />
                </linearGradient>
              ))}
            </defs>
            <XAxis
              dataKey="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              dx={-4}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
            <Bar
              dataKey="count"
              name="Skills"
              radius={[6, 6, 0, 0]}
              animationDuration={1200}
              animationEasing="ease-out"
            >
              {sorted.map((_, i) => (
                <Cell key={i} fill={`url(#skillGrad-${i})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function ProjectStatusChart({ projects }) {
  const { data, total, entries } = useMemo(() => {
    if (!projects || projects.length === 0) return { data: [], total: 0, entries: [] };
    const statusCounts = {};
    projects.forEach((p) => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });
    const sorted = Object.entries(statusCounts).sort((a, b) => b[1] - a[1]);
    const chartData = sorted.map(([status, count]) => ({
      name: status.replace('_', ' '),
      value: count,
      rawStatus: status,
    }));
    return { data: chartData, total: projects.length, entries: sorted };
  }, [projects]);

  if (data.length === 0) return null;

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.08) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ChartCard title="Project Status" subtitle={`${total} projects tracked`}>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              label={renderLabel}
              labelLine={false}
              animationDuration={1200}
              animationEasing="ease-out"
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.rawStatus}
                  fill={STATUS_COLORS[entry.rawStatus] || '#94a3b8'}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0];
                return (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 shadow-xl">
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: d.payload.fill || d.color }}
                      />
                      <span className="font-semibold text-slate-900 dark:text-slate-100 capitalize">
                        {d.name}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {d.value}
                      </span>
                    </div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
        {data.map((entry) => (
          <div key={entry.rawStatus} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[entry.rawStatus] || '#94a3b8' }}
            />
            <span className="text-xs capitalize text-slate-500 dark:text-slate-400">
              {entry.name}
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

export function TeamUtilizationChart({ teams }) {
  const data = useMemo(() => {
    if (!teams || teams.length === 0) return [];
    return [...teams]
      .sort((a, b) => b.memberCount - a.memberCount)
      .slice(0, 8)
      .map((team) => ({
        name: team.name.length > 14 ? team.name.slice(0, 14) + '…' : team.name,
        fullName: team.name,
        members: team.memberCount,
      }));
  }, [teams]);

  if (data.length === 0) return null;

  return (
    <ChartCard title="Team Size" subtitle="Members per team">
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barCategoryGap="18%">
            <defs>
              <linearGradient id="teamBarGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3568f7" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              dy={4}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={100}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              dx={-4}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 shadow-xl">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{d.fullName}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-brand-600 dark:text-brand-400">{d.members}</span> members
                    </p>
                  </div>
                );
              }}
              cursor={{ fill: 'rgba(148,163,184,0.06)' }}
            />
            <Bar
              dataKey="members"
              name="Members"
              fill="url(#teamBarGrad)"
              radius={[0, 6, 6, 0]}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
