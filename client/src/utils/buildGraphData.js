const LEVEL_COLORS = [
  { bg: '#3568f7', border: '#2249ec', light: '#eff6ff', text: '#1e40af' },
  { bg: '#6366f1', border: '#4f46e5', light: '#eef2ff', text: '#3730a3' },
  { bg: '#8b5cf6', border: '#7c3aed', light: '#f5f3ff', text: '#5b21b6' },
  { bg: '#a78bfa', border: '#8b5cf6', light: '#f5f3ff', text: '#6d28d9' },
];

export { LEVEL_COLORS };

export default function buildGraphData(topLevel, byManager) {
  const nodes = [];
  const edges = [];

  function addNode(person, level, parentId) {
    const hasReports = byManager[person.id]?.reports?.length > 0;
    const reportCount = hasReports ? byManager[person.id].reports.length : 0;
    const initials = person.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
    const color = LEVEL_COLORS[Math.min(level, LEVEL_COLORS.length - 1)];

    const labelLines = [
      `${initials}  ${person.name}`,
      `  ${person.title || 'No title'}`,
    ];
    if (reportCount > 0) {
      labelLines.push(`  ${reportCount} direct report${reportCount !== 1 ? 's' : ''}`);
    }

    nodes.push({
      id: person.id,
      label: labelLines.join('\n'),
      shape: 'box',
      level: level,
      margin: { top: 12, bottom: 12, left: 14, right: 14 },
      padding: 14,
      color: {
        background: '#ffffff',
        border: color.border,
        highlight: { background: '#eff6ff', border: '#3568f7' },
        hover: { background: '#f8fafc', border: '#60a5fa' },
      },
      font: {
        multi: 'html',
        color: '#1e293b',
        face: 'Inter, system-ui, -apple-system, sans-serif',
        size: 13,
        bold: {
          color: '#0f172a',
          face: 'Inter, system-ui, -apple-system, sans-serif',
          size: 14,
          vadjust: 0,
        },
        ital: {
          color: '#64748b',
          face: 'Inter, system-ui, -apple-system, sans-serif',
          size: 12,
          vadjust: 0,
        },
      },
      borderWidth: 2,
      shadow: {
        enabled: true,
        color: 'rgba(0,0,0,0.06)',
        size: 10,
        x: 0,
        y: 4,
      },
      borderWidthSelected: 3,
    });

    if (parentId !== null) {
      edges.push({
        from: parentId,
        to: person.id,
        color: { color: '#cbd5e1', highlight: '#3568f7', hover: '#60a5fa' },
        width: 2,
        smooth: { type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.4 },
        arrows: { to: { enabled: true, scaleFactor: 0.5 } },
      });
    }

    if (hasReports) {
      byManager[person.id].reports.forEach((report) => {
        addNode(report, level + 1, person.id);
      });
    }
  }

  topLevel.forEach((person) => addNode(person, 0, null));

  return { nodes, edges };
}
