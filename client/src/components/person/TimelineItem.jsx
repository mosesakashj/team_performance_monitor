import { Link } from 'react-router-dom';

export default function TimelineItem({ item, isLast }) {
  const colors = {
    project: 'bg-blue-500',
    team: 'bg-violet-500',
    endorsement: 'bg-amber-500',
  };
  const icons = {
    project: (
      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
    team: (
      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    endorsement: (
      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  };

  const link = item.type === 'project' ? `/projects/${item.projectId}`
    : item.type === 'team' ? `/teams/${item.teamId}`
    : item.type === 'endorsement' ? `/people/${item.endorserId}`
    : '#';

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colors[item.type]} shadow-md`}>
          {icons[item.type]}
        </div>
        {!isLast && <div className="w-px flex-1 bg-slate-200 mt-2" />}
      </div>
      <div className="pb-6 flex-1 min-w-0">
        <Link to={link} className="text-sm font-semibold text-slate-800 hover:text-brand-600 transition-colors">
          {item.type === 'endorsement' ? `${item.endorser} endorsed this person` : item.name}
        </Link>
        <p className="text-xs text-slate-400 mt-0.5">
          {item.role && `${item.role} · `}
          {item.startDate && `${item.startDate}${item.endDate ? ` → ${item.endDate}` : ' → present'}`}
          {item.date && item.date}
          {item.allocation && ` · ${item.allocation}% allocation`}
        </p>
        {item.note && <p className="text-xs text-slate-500 mt-1 italic">"{item.note}"</p>}
      </div>
    </div>
  );
}
