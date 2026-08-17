import { useRef, useEffect, useState } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';

const CATEGORY_COLORS = {
  Language: '#3b82f6',
  Framework: '#8b5cf6',
  Cloud: '#06b6d4',
  Data: '#f59e0b',
  'Soft Skill': '#10b981',
  Domain: '#f43f5e',
};

export default function SkillGraph({ skills, centerSkillId, onNodeClick }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (!containerRef.current || !skills?.length) return;

    const nodes = new DataSet(
      skills.map((skill) => ({
        id: skill.id || skill.skillId,
        label: skill.name,
        color: {
          background: CATEGORY_COLORS[skill.category] || '#6b7280',
          border: CATEGORY_COLORS[skill.category] || '#6b7280',
          highlight: { background: '#fbbf24', border: '#f59e0b' },
        },
        font: { color: '#1e293b', size: 12, face: 'Inter, system-ui, sans-serif' },
        shape: skill.id === centerSkillId || skill.skillId === centerSkillId ? 'diamond' : 'dot',
        size: skill.id === centerSkillId || skill.skillId === centerSkillId ? 25 : 15,
        borderWidth: skill.id === centerSkillId || skill.skillId === centerSkillId ? 3 : 1,
        title: `${skill.name}\nCategory: ${skill.category}\nPeople: ${skill.peopleCount ?? 'N/A'}`,
      }))
    );

    const edges = new DataSet([]);
    for (const skill of skills) {
      if (skill.related) {
        for (const rel of skill.related) {
          const fromId = skill.id || skill.skillId;
          const toId = rel.skillId || rel.id;
          if (fromId && toId && fromId !== toId) {
            edges.add({
              from: fromId,
              to: toId,
              color: { color: '#cbd5e1', highlight: '#f59e0b' },
              width: rel.strength ? Math.max(1, rel.strength) : 1,
              smooth: { type: 'continuous' },
            });
          }
        }
      }
    }

    const options = {
      nodes: {
        borderWidth: 1,
        shadow: { enabled: true, color: 'rgba(0,0,0,0.1)', size: 5 },
      },
      edges: {
        smooth: { type: 'continuous', roundness: 0.5 },
        arrows: { to: false },
      },
      physics: {
        barnesHut: {
          gravitationalConstant: -3000,
          centralGravity: 0.3,
          springLength: 150,
          springConstant: 0.04,
          damping: 0.09,
        },
        stabilization: { iterations: 100 },
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
        zoomView: true,
        dragView: true,
        navigationButtons: true,
        keyboard: true,
      },
      layout: { improvedLayout: true },
    };

    const network = new Network(containerRef.current, { nodes, edges }, options);
    networkRef.current = network;

    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        setSelectedNode(nodeId);
        if (onNodeClick) onNodeClick(nodeId);
      }
    });

    network.on('stabilizationIterationsDone', () => {
      network.setOptions({ physics: false });
    });

    return () => {
      network.destroy();
      networkRef.current = null;
    };
  }, [skills, centerSkillId]);

  return (
    <div className="relative">
      <div ref={containerRef} className="h-[400px] w-full rounded-xl border border-slate-200 bg-white shadow-sm" />
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-slate-600 shadow-sm border border-slate-200">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            {cat}
          </div>
        ))}
      </div>
    </div>
  );
}
