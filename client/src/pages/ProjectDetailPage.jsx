import { Link, useParams } from 'react-router-dom';
import { useProject, useProjectCandidates } from '../hooks/useProjects.js';
import { useProjectSkillGaps } from '../hooks/useAnalytics.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { SkeletonTable } from '../components/common/Skeleton.jsx';

function PriorityStars({ priority, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <svg key={i} className={`h-4 w-4 ${i < priority ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function GanttBar({ startDate, endDate, status }) {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  const totalDays = (end - start) / (1000 * 60 * 60 * 24);
  const elapsedDays = Math.max(0, Math.min(totalDays, (now - start) / (1000 * 60 * 60 * 24)));
  const progress = totalDays > 0 ? Math.min(100, (elapsedDays / totalDays) * 100) : 0;

  const statusColors = {
    active: 'from-blue-500 to-blue-600',
    completed: 'from-emerald-500 to-emerald-600',
    proposed: 'from-slate-400 to-slate-500',
    on_hold: 'from-amber-500 to-amber-600',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-slate-500">{startDate}</span>
        <span className="font-medium text-slate-700">{Math.round(progress)}% elapsed</span>
        <span className="text-slate-500">{endDate}</span>
      </div>
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${statusColors[status] || 'from-slate-400 to-slate-500'} transition-all duration-1000`} style={{ width: `${progress}%` }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-white drop-shadow-sm">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}

function SkillGapCard({ gap }) {
  const isCovered = gap.coverageCount > 0;
  return (
    <div className={`rounded-xl border p-4 transition-all ${isCovered ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/skills/${gap.id}`} className="font-semibold text-slate-800 hover:text-brand-600 transition-colors">
            {gap.name}
          </Link>
          <p className="text-xs text-slate-400 mt-0.5">{gap.category} · L{gap.min_proficiency} · {gap.seniority_needed}</p>
        </div>
        {isCovered ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Covered
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            Gap
          </span>
        )}
      </div>
      {isCovered && gap.coveredBy && (
        <div className="mt-2 flex flex-wrap gap-1">
          {gap.coveredBy.slice(0, 3).map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
              {c.name} · L{c.proficiency}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function CandidateCard({ candidate, rank }) {
  const rankStyles = [
    'border-amber-300 bg-gradient-to-br from-amber-50 to-white shadow-amber-100',
    'border-slate-300 bg-gradient-to-br from-slate-50 to-white shadow-slate-100',
    'border-orange-300 bg-gradient-to-br from-orange-50 to-white shadow-orange-100',
  ];
  const rankBadge = [
    'bg-amber-100 text-amber-700',
    'bg-slate-200 text-slate-600',
    'bg-orange-100 text-orange-700',
  ];

  return (
    <div className={`rounded-xl border-2 p-5 shadow-md transition-all hover:shadow-lg animate-scale-in ${rankStyles[rank] || 'border-slate-200 bg-white'}`}>
      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-lg font-bold text-white shadow-lg shadow-brand-200">
            {candidate.person.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div className={`absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shadow-sm ${rankBadge[rank] || 'bg-slate-100 text-slate-500'}`}>
            #{rank + 1}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <Link to={`/people/${candidate.person.id}`} className="text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors">
            {candidate.person.name}
          </Link>
          <p className="text-sm text-slate-500">{candidate.person.title} · {candidate.person.seniority}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-brand-600">{candidate.totalScore?.toFixed(1)}</div>
          <div className="text-[10px] font-medium text-slate-400 uppercase">score</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-slate-50 p-2.5 text-center">
          <div className="text-lg font-bold text-blue-600">{candidate.matchedSkills}</div>
          <div className="text-[10px] font-medium text-slate-400">skills matched</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-2.5 text-center">
          <div className="text-lg font-bold text-violet-600">{candidate.avgProficiency?.toFixed(1)}</div>
          <div className="text-[10px] font-medium text-slate-400">avg proficiency</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-2.5 text-center">
          <div className={`text-lg font-bold ${candidate.teamFitBonus > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>{candidate.teamFitBonus}</div>
          <div className="text-[10px] font-medium text-slate-400">team connections</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-500">{candidate.person.current_utilization_pct}% utilized</span>
        </div>
        {candidate.teamFitBonus > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.25 0 015.25 0z" />
            </svg>
            Knows {candidate.teamFitBonus} colleague{candidate.teamFitBonus === 1 ? '' : 's'}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError, refetch } = useProject(id);
  const { data: candidatesData, isLoading: candidatesLoading, isError: candidatesError, refetch: refetchCandidates } = useProjectCandidates(id);
  const { data: skillGaps } = useProjectSkillGaps(id);

  if (isError) return <div className="animate-fade-in"><ErrorBanner message="Couldn't load this project." onRetry={refetch} /></div>;
  if (isLoading) return <LoadingSpinner label="Loading project…" />;

  const { project, requiredSkills, staff, teamName } = data;
  const validSkills = requiredSkills.filter((s) => s.skillId);
  const validStaff = staff.filter((s) => s.personId);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-violet-50" />
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-100/30 blur-3xl" />
        <div className="relative p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={project.status} />
                <PriorityStars priority={project.priority} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">{project.name}</h1>
              <p className="text-lg text-slate-500 mt-1">{project.client_name}</p>
            </div>
            {project.budget && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-3 text-right">
                <div className="text-2xl font-bold text-emerald-700">${project.budget?.toLocaleString('en-US')}</div>
                <div className="text-xs font-medium text-emerald-500">budget</div>
              </div>
            )}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 max-w-3xl">{project.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {teamName && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-slate-200 px-3 py-1 text-sm text-slate-600 shadow-sm">
                👥 {teamName}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-slate-200 px-3 py-1 text-sm text-slate-600 shadow-sm">
              📅 {project.start_date} → {project.end_date}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-slate-200 px-3 py-1 text-sm text-slate-600 shadow-sm">
              ⭐ Priority {project.priority}/5
            </span>
          </div>
        </div>
      </div>

      {/* Gantt Timeline */}
      <section className="animate-slide-up">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Project Timeline</h2>
        <GanttBar startDate={project.start_date} endDate={project.end_date} status={project.status} />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Skill Gap Analysis */}
        <section className="animate-slide-up">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Skill Coverage Analysis</h2>
          {skillGaps?.gaps?.length > 0 ? (
            <div className="space-y-3">
              {skillGaps.gaps.map((gap) => (
                <SkillGapCard key={gap.id} gap={gap} />
              ))}
            </div>
          ) : validSkills.length > 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {validSkills.map((skill) => (
                  <Link
                    key={skill.skillId}
                    to={`/skills/${skill.skillId}`}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm transition-all hover:border-brand-300 hover:bg-brand-50"
                  >
                    <span className="font-medium text-slate-700">{skill.name}</span>
                    <span className="text-xs text-slate-400">L{skill.minProficiency} · {skill.seniorityNeeded}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="No skill requirements set" icon="⚡" />
          )}
        </section>

        {/* Current Staff */}
        <section className="animate-slide-up">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Current Staff ({validStaff.length})</h2>
          {validStaff.length === 0 ? (
            <EmptyState
              title="No one staffed yet"
              description="Check the recommended candidates below to find the right people."
              icon="👥"
            />
          ) : (
            <div className="space-y-2">
              {validStaff.map((person) => (
                <Link
                  key={person.personId}
                  to={`/people/${person.personId}`}
                  className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-bold text-white shadow-md shadow-brand-200">
                    {person.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">{person.name}</p>
                    <p className="text-xs text-slate-400">{person.role} · {person.allocationPct}% allocation</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-600">{person.allocationPct}%</div>
                    <div className="text-[10px] text-slate-400">allocation</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Recommended Candidates */}
      <section className="animate-slide-up">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recommended Candidates</h2>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Ranked by matching & closely related skills, availability, and prior collaboration with people already on this project.
        </p>
        {candidatesError ? (
          <ErrorBanner message="Couldn't load candidate recommendations." onRetry={refetchCandidates} />
        ) : candidatesLoading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : candidatesData.candidates.length === 0 ? (
          <EmptyState
            title="No candidates found"
            description="No one available right now matches this project's required or related skills."
            icon="🔍"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {candidatesData.candidates.map((c, index) => (
              <CandidateCard key={c.person.id} candidate={c} rank={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
