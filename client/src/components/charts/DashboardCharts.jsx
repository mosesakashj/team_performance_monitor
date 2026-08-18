import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PieChart, Pie } from 'recharts';

const CATEGORY_COLORS = {
  Language: '#3b82f6',
  Framework: '#8b5cf6',
  Cloud: '#06b6d4',
  Data: '#f59e0b',
  'Soft Skill': '#10b981',
  Domain: '#ec4899',
};

export function SkillsDistributionChart({ skills }) {
  if (!skills || skills.length === 0) return null;

  const categoryCounts = {};
  skills.forEach((s) => {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
  });

  const sorted = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([category, count]) => ({ category, count }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sorted}>
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ProjectStatusChart({ projects }) {
  if (!projects || projects.length === 0) return null;

  const statusCounts = {};
  projects.forEach((p) => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  });

  const total = projects.length;
  const entries = Object.entries(statusCounts).sort((a, b) => b[1] - a[1]);

  const data = entries.map(([status, count]) => ({
    name: status,
    value: count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart data={data}>
        <Pie
          dataKey="value"
          nameKey="name"
          label={(props) => {
            const { name, percent, value } = props;
            if (percent < 0.1) return null;
            return (
              <>
                <tspan x={0} y={0}>{percent.toFixed(0)}%</tspan>
                <tspan x={0} y={15}>{name}</tspan>
              </>
            );
          }}
          outerRadius={80}
        />
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TeamUtilizationChart({ teams }) {
  if (!teams || teams.length === 0) return null;

  const sorted = [...teams].sort((a, b) => b.memberCount - a.memberCount);

  const data = sorted.map((team) => ({
    name: team.name,
    memberCount: team.memberCount,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <XAxis dataKey="memberCount" type="number" tickFormatter={(val) => `${val} members`} />
        <YAxis dataKey="name" />
        <Tooltip />
        <Legend />
        <Bar dataKey="memberCount" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}