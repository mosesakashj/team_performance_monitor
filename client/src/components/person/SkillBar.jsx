import { Link } from 'react-router-dom';

const SKILL_COLORS = {
  Language: 'from-blue-500 to-blue-600',
  Framework: 'from-violet-500 to-violet-600',
  Cloud: 'from-cyan-500 to-cyan-600',
  Data: 'from-amber-500 to-amber-600',
  'Soft Skill': 'from-emerald-500 to-emerald-600',
  Domain: 'from-rose-500 to-rose-600',
};

export default function SkillBar({ skill, maxProficiency = 5 }) {
  const width = (skill.proficiency / maxProficiency) * 100;
  const colorClass = SKILL_COLORS[skill.category] || 'from-slate-400 to-slate-500';

  return (
    <Link to={`/skills/${skill.skillId}`} className="group flex items-center gap-3 py-2">
      <div className="w-28 shrink-0 text-right">
        <span className="text-sm font-medium text-slate-700 group-hover:text-brand-600 transition-colors">{skill.name}</span>
      </div>
      <div className="flex-1">
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-700 ease-out`}
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
      <div className="w-16 shrink-0 flex items-center gap-1.5">
        <span className="text-xs font-bold text-slate-600">{skill.proficiency}/5</span>
        <span className="text-[10px] text-slate-400">{skill.yearsExperience}y</span>
      </div>
    </Link>
  );
}
