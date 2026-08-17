import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSkillAdjacent } from '../hooks/useSkills.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Badge from '../components/common/Badge.jsx';
import SkillGraph from '../components/graphs/SkillGraph.jsx';

const CATEGORY_ICONS = {
  Language: '💻',
  Framework: '🔧',
  Cloud: '☁️',
  Data: '📊',
  'Soft Skill': '🤝',
  Domain: '🏢',
};

const CATEGORY_COLORS = {
  Language: 'from-blue-500 to-blue-600',
  Framework: 'from-violet-500 to-violet-600',
  Cloud: 'from-cyan-500 to-cyan-600',
  Data: 'from-amber-500 to-amber-600',
  'Soft Skill': 'from-emerald-500 to-emerald-600',
  Domain: 'from-rose-500 to-rose-600',
};

export default function SkillDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useSkillAdjacent(id);

  if (isError) return <div className="animate-fade-in"><ErrorBanner message="Couldn't load this skill." onRetry={refetch} /></div>;
  if (isLoading) return <LoadingSpinner label="Loading skill…" />;

  const { skill, related, peopleCount } = data;
  const relatedSkills = related.filter((r) => r.skillId).sort((a, b) => b.strength - a.strength);

  const graphSkills = [
    { id: skill.id, name: skill.name, category: skill.category, peopleCount, related: relatedSkills.map((r) => ({ skillId: r.skillId, strength: r.strength })) },
    ...relatedSkills.map((r) => ({ id: r.skillId, name: r.name, category: skill.category, peopleCount: 0, related: [] })),
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Skill Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-violet-50" />
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-100/30 blur-3xl" />
        <div className="relative p-8">
          <div className="flex items-start gap-5">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${CATEGORY_COLORS[skill.category] || 'from-slate-400 to-slate-500'} text-2xl shadow-xl shadow-brand-200`}>
              {CATEGORY_ICONS[skill.category] || '⚡'}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">{skill.name}</h1>
                  <p className="text-lg text-slate-500 mt-1">{skill.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-brand-50 border border-brand-200 px-4 py-2 text-center">
                    <div className="text-2xl font-bold text-brand-700">{peopleCount}</div>
                    <div className="text-xs font-medium text-brand-500">people</div>
                  </div>
                  <div className="rounded-xl bg-violet-50 border border-violet-200 px-4 py-2 text-center">
                    <div className="text-2xl font-bold text-violet-700">{relatedSkills.length}</div>
                    <div className="text-xs font-medium text-violet-500">related</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Graph Visualization */}
        <section className="animate-slide-up">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Skill Adjacency Graph</h2>
          <p className="mb-4 text-sm text-slate-500">
            Interactive visualization of how {skill.name} relates to other skills. Click nodes to navigate.
          </p>
          <SkillGraph
            skills={graphSkills}
            centerSkillId={skill.id}
            onNodeClick={(nodeId) => navigate(`/skills/${nodeId}`)}
          />
        </section>

        {/* Related Skills List */}
        <section className="animate-slide-up">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Related Skills</h2>
          <p className="mb-4 text-sm text-slate-500">
            Skills commonly found together with {skill.name} — used to widen staffing candidate matches beyond an exact skill.
          </p>
          {relatedSkills.length === 0 ? (
            <EmptyState title="No related skills mapped yet" icon="🔗" />
          ) : (
            <div className="space-y-2">
              {relatedSkills.map((rel, index) => (
                <Link
                  key={rel.skillId}
                  to={`/skills/${rel.skillId}`}
                  className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all hover:border-brand-300 hover:shadow-sm"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-700">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800 group-hover:text-brand-700 transition-colors">{rel.name}</p>
                    <div className="mt-1.5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all"
                        style={{ width: `${rel.strength * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-700">
                    {Math.round(rel.strength * 100)}%
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
