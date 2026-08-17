import { Link, useParams } from 'react-router-dom';
import { useSkillAdjacent } from '../hooks/useSkills.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Badge from '../components/common/Badge.jsx';

const CATEGORY_ICONS = {
  Language: '💻',
  Framework: '🔧',
  Cloud: '☁️',
  Data: '📊',
  'Soft Skill': '🤝',
  Domain: '🏢',
};

export default function SkillDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError, refetch } = useSkillAdjacent(id);

  if (isError) return <div className="animate-fade-in"><ErrorBanner message="Couldn't load this skill." onRetry={refetch} /></div>;
  if (isLoading) return <LoadingSpinner label="Loading skill…" />;

  const { skill, related, peopleCount } = data;
  const relatedSkills = related.filter((r) => r.skillId).sort((a, b) => b.strength - a.strength);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Skill Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-2xl shadow-lg shadow-brand-200">
            {CATEGORY_ICONS[skill.category] || '⚡'}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{skill.name}</h1>
                <p className="text-slate-500">{skill.category}</p>
              </div>
              <Badge color="brand">
                {peopleCount} {peopleCount === 1 ? 'person' : 'people'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Related Skills */}
      <section className="animate-slide-up">
        <h2 className="mb-2 section-heading">Related skills</h2>
        <p className="mb-4 text-sm text-slate-500">
          Skills commonly found together with {skill.name} — used to widen staffing candidate matches beyond an exact skill.
        </p>
        {relatedSkills.length === 0 ? (
          <EmptyState title="No related skills mapped yet" icon="🔗" />
        ) : (
          <div className="flex flex-col gap-3">
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
  );
}
