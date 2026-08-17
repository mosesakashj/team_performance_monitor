import { useRef, useEffect } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';

const NODE_COLORS = {
  Person: '#3b82f6',
  Skill: '#10b981',
  Project: '#8b5cf6',
  Team: '#f59e0b',
};

const NODE_SHAPES = {
  Person: 'dot',
  Skill: 'diamond',
  Project: 'square',
  Team: 'triangle',
};

export default function NetworkGraph({ nodes: rawNodes, edges: rawEdges, centerNodeId, onNodeClick, height = 400 }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !rawNodes?.length) return;

    const nodes = new DataSet(
      rawNodes.map((n) => ({
        id: n.id,
        label: n.name || n.label,
        color: {
          background: n.id === centerNodeId ? '#fbbf24' : (NODE_COLORS[n.type] || '#6b7280'),
          border: n.id === centerNodeId ? '#f59e0b' : (NODE_COLORS[n.type] || '#6b7280'),
          highlight: { background: '#fbbf24', border: '#f59e0b' },
        },
        font: { color: '#1e293b', size: 11, face: 'Inter, system-ui, sans-serif' },
        shape: NODE_SHAPES[n.type] || 'dot',
        size: n.id === centerNodeId ? 25 : 12,
        borderWidth: n.id === centerNodeId ? 3 : 1,
        title: `${n.name || n.label}\nType: ${n.type}`,
      }))
    );

    const edges = new DataSet(
      (rawEdges || []).map((e) => ({
        from: e.from,
        to: e.to,
        label: e.label || '',
        color: { color: '#94a3b8', highlight: '#f59e0b' },
        font: { size: 9, color: '#94a3b8', strokeWidth: 0 },
        smooth: { type: 'continuous', roundness: 0.3 },
        width: e.weight || 1,
        arrows: e.directed ? { to: { enabled: true, scaleFactor: 0.5 } } : undefined,
      }))
    );

    const options = {
      nodes: {
        shadow: { enabled: true, color: 'rgba(0,0,0,0.1)', size: 5 },
      },
      edges: {
        smooth: { type: 'continuous', roundness: 0.3 },
      },
      physics: {
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 120,
          springConstant: 0.03,
          damping: 0.09,
        },
        stabilization: { iterations: 80 },
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
      if (params.nodes.length > 0 && onNodeClick) {
        onNodeClick(params.nodes[0]);
      }
    });

    network.on('stabilizationIterationsDone', () => {
      network.setOptions({ physics: false });
    });

    return () => {
      network.destroy();
      networkRef.current = null;
    };
  }, [rawNodes, rawEdges, centerNodeId]);

  return (
    <div className="relative">
      <div ref={containerRef} style={{ height }} className="w-full rounded-xl border border-slate-200 bg-white shadow-sm" />
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
        {Object.entries(NODE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-slate-600 shadow-sm border border-slate-200">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            {type}
          </div>
        ))}
      </div>
    </div>
  );
}
