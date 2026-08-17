import { Link, useParams } from 'react-router-dom';
import { useProject, useProjectCandidates } from '../hooks/useProjects.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import Badge from '../components/common/Badge.jsx';
import { SkeletonTable } from '../components/common/Skeleton.jsx';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError, refetch } = useProject(id);
  const {
    data: candidatesData,
    isLoading: candidatesLoading,
    isError: candidatesError,
    refetch: refetchCandidates,
  } = useProjectCandidates(id);

  if (isError) return <div className="animate-fade-in"><ErrorBanner message="Couldn't load this project." onRetry={refetch} /></div>;
  if (isLoading) return <LoadingSpinner label="Loading project…" />;

  const { project, requiredSkills, staff, teamName } = data;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Project Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{project.name}</h1>
            <p className="text-slate-500">{project.client_name}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">{project.description}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            {teamName ?? 'Unassigned team'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            {project.start_date} → {project.end_date}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            Priority {project.priority}/5
          </span>
          {project.budget && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ${project.budget?.toLocaleString('en-US')}
            </span>
          )}
        </div>
      </div>

      {/* Required Skills */}
      <section className="animate-slide-up">
        <h2 className="mb-4 section-heading">Required skills</h2>
        {requiredSkills.filter((s) => s.skillId).length === 0 ? (
          <EmptyState title="No skill requirements set" icon="⚡" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {requiredSkills
              .filter((s) => s.skillId)
              .map((skill) => (
                <Link
                  key={skill.skillId}
                  to={`/skills/${skill.skillId}`}
                  className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm transition-all hover:border-brand-300 hover:bg-brand-50"
                >
                  <span className="font-medium text-slate-700 group-hover:text-brand-700">{skill.name}</span>
                  <span className="text-xs text-slate-400">
                    L{skill.minProficiency} · {skill.seniorityNeeded}
                  </span>
                </Link>
              ))}
          </div>
        )}
      </section>

      {/* Current Staff */}
      <section className="animate-slide-up">
        <h2 className="mb-4 section-heading">Current staff</h2>
        {staff.filter((s) => s.personId).length === 0 ? (
          <EmptyState
            title="No one staffed yet"
            description="Check the recommended candidates below to find the right people."
            icon="👥"
          />
        ) : (
          <ul className="list-container">
            {staff
              .filter((s) => s.personId)
              .map((person) => (
                <li key={person.personId} className="list-item">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                      {person.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <Link to={`/people/${person.personId}`} className="font-medium text-slate-800 hover:text-brand-700 transition-colors">
                        {person.name}
                      </Link>
                      <p className="text-xs text-slate-400">{person.role} · {person.allocationPct}% allocation</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{person.endDate ? `ended ${person.endDate}` : 'active'}</span>
                </li>
              ))}
          </ul>
        )}
      </section>

      {/* Recommended Candidates */}
      <section className="animate-slide-up">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="section-heading">Recommended candidates</h2>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Ranked by matching &amp; closely related skills, availability, and prior collaboration with people already on this
          project.
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
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Rank</th>
                    <th className="px-4 py-3 font-medium">Person</th>
                    <th className="px-4 py-3 font-medium">Skills</th>
                    <th className="px-4 py-3 font-medium">Proficiency</th>
                    <th className="px-4 py-3 font-medium">Team fit</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidatesData.candidates.map((c, index) => (
                    <tr key={c.person.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          index === 0 ? 'bg-amber-100 text-amber-700' :
                          index === 1 ? 'bg-slate-200 text-slate-600' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                            {c.person.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <Link to={`/people/${c.person.id}`} className="font-medium text-slate-800 hover:text-brand-700 transition-colors">
                              {c.person.name}
                            </Link>
                            <p className="text-xs text-slate-400">{c.person.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge color="brand">{c.matchedSkills} matched</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-brand-500"
                              style={{ width: `${(c.avgProficiency / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">{c.avgProficiency?.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {c.teamFitBonus > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                            {c.teamFitBonus} colleague{c.teamFitBonus === 1 ? '' : 's'}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-bold text-brand-700">
                          {c.totalScore?.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
