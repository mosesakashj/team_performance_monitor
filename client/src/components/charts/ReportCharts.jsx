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

export function UtilizationChart({ people }) {
  if (!people || people.length === 0) return null;

  const data = people.map((p) => ({
    name: p.name,
    utilization: p.utilization,
    team: p.team?.name ?? 'N/A',
    color: getUtilizationColor(p.utilization),
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <XAxis dataKey="name" tick={{ angle: -45, fontSize: 10 }} />
        <YAxis dataKey="utilization" tick={{ fontSize: 10 }} />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Bar dataKey="utilization" fill="#8884d8" />
        <YAxis domain={[0, 100]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SkillInventoryChart({ skills }) {
  if (!skills || skills.length === 0) return null;

  const sorted = [...skills].sort((a, b) => b.holderCount - a.holderCount).slice(0, 10);

  const data = sorted.map((s) => ({
    skill: s.skill.name,
    category: s.skill.category,
    holders: s.holderCount,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <XAxis dataKey="skill" tick={{ angle: -45, fontSize: 10 }} />
        <YAxis dataKey="holders" tick={{ fontSize: 10 }} />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Bar dataKey="holders" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ProjectHealthChart({ projects }) {
  if (!projects || projects.length === 0) return null;

  const data = projects.map((p) => ({
    name: p.name,
    coverage: p.coverageRatio * 100,
    staff: p.staff.length,
    required: p.requiredCount,
    status: p.status,
  }));

  return (
    <ResponsiveContainer width="100%" height={500}>
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ angle: -45, fontSize: 10 }} />
        <YAxis dataKey="coverage" tick={{ fontSize: 10 }} />
        <CartesianGrid />
        <Area
          dataKey="coverage"
          type="monotone"
          stroke="#8884d8"
          fill="#8884d8"
          opacity={0.6}
        />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="coverage" stroke="#8884d8" fill="#8884d8" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function EndorsementChart({ people }) {
  if (!people || people.length === 0) return null;

  const sorted = [...people].sort((a, b) => b.endorsementCount - a.endorsementCount).slice(0, 8);

  const data = sorted.map((p) => ({
    name: p.name,
    endorsements: p.endorsementCount,
    avgRating: p.avgRating ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <XAxis dataKey="name" tick={{ angle: -45, fontSize: 10 }} />
        <YAxis dataKey="endorsements" tick={{ fontSize: 10 }} />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Bar dataKey="endorsements" fill="#3b82f6" />
        <YAxis domain={[0, Math.max(...data.map((d) => d.endorsements)) * 1.2]} />
      </BarChart>
    </ResponsiveContainer>
  );
}