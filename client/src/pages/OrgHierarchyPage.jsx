import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Network } from 'vis-network';
import { useOrgHierarchy } from '../hooks/useHierarchy.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

const LEVEL_COLORS = [
  { bg: '#3568f7', border: '#2249ec', light: '#eff6ff', text: '#1e40af' },
  { bg: '#6366f1', border: '#4f46e5', light: '#eef2ff', text: '#3730a3' },
  { bg: '#8b5cf6', border: '#7c3aed', light: '#f5f3ff', text: '#5b21b6' },
  { bg: '#a78bfa', border: '#8b5cf6', light: '#f5f3ff', text: '#6d28d9' },
];

function buildGraphData(topLevel, byManager) {
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

export default function OrgHierarchyPage() {
  const { data, isLoading, isError, refetch } = useOrgHierarchy();
  const [selectedNode, setSelectedNode] = useState(null);
  const [view, setView] = useState('graph');
  const networkRef = useRef(null);
  const containerRef = useRef(null);

  const graphData = useMemo(() => {
    if (!data?.topLevel || !data?.byManager) return null;
    return buildGraphData(data.topLevel, data.byManager);
  }, [data]);

  useEffect(() => {
    if (!containerRef.current || !graphData || view !== 'graph') return;

    const options = {
      layout: {
        hierarchical: {
          enabled: true,
          direction: 'UD',
          sortMethod: 'directed',
          levelSeparation: 180,
          nodeSpacing: 200,
          treeSpacing: 240,
          blockShifting: true,
          edgeMinimization: true,
        },
      },
      physics: { enabled: false },
      interaction: {
        hover: true,
        tooltipDelay: 300,
        navigationButtons: false,
        keyboard: { enabled: true },
        zoomView: true,
        dragView: true,
        dragNodes: true,
        hideEdgesOnDrag: true,
        multiselect: false,
      },
      edges: {
        smooth: { type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.4 },
      },
    };

    const network = new Network(containerRef.current, graphData, options);
    networkRef.current = network;

    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        setSelectedNode(params.nodes[0]);
      } else {
        setSelectedNode(null);
      }
    });

    network.on('doubleClick', (params) => {
      if (params.nodes.length > 0) {
        window.location.href = `/people/${params.nodes[0]}`;
      }
    });

    network.once('stabilizationIterationsDone', () => {
      network.fit({ animation: { duration: 400, easingFunction: 'easeOutQuad' } });
    });

    return () => {
      network.destroy();
      networkRef.current = null;
    };
  }, [graphData, view]);

  const handleZoomIn = useCallback(() => {
    networkRef.current?.moveTo({ scale: (networkRef.current.getScale() || 1) * 1.3, animation: { duration: 200 } });
  }, []);

  const handleZoomOut = useCallback(() => {
    networkRef.current?.moveTo({ scale: (networkRef.current.getScale() || 1) * 0.7, animation: { duration: 200 } });
  }, []);

  const handleFit = useCallback(() => {
    networkRef.current?.fit({ animation: { duration: 400, easingFunction: 'easeOutQuad' } });
  }, []);

  if (isError) return <div className="animate-fade-in"><ErrorBanner message="Couldn't load org hierarchy." onRetry={refetch} /></div>;
  if (isLoading) return <LoadingSpinner label="Loading org hierarchy..." />;
  if (!data || !data.employees?.length) {
    return (
      <div className="animate-fade-in">
        <EmptyState
          title="No hierarchy data"
          description="No manager-report relationships found in the database."
          icon={<svg className="h-12 w-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>}
        />
      </div>
    );
  }

  const { topLevel, byManager, employees } = data;
  const selectedPerson = selectedNode ? employees.find((e) => e.id === selectedNode) : null;
  const selectedReports = selectedNode ? (byManager[selectedNode]?.reports || []) : [];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-heading">Organization Hierarchy</h1>
          <p className="page-description">Interactive org chart with full employee details. Click a node to inspect, double-click to view profile.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('graph')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${view === 'graph' ? 'bg-brand-600 text-white shadow-sm' : 'border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
              Graph
            </span>
          </button>
          <button
            onClick={() => setView('tree')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${view === 'tree' ? 'bg-brand-600 text-white shadow-sm' : 'border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>
              Tree
            </span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Employees', value: employees.length },
          { label: 'Top-Level Directors', value: topLevel.length },
          { label: 'Max Depth', value: (() => {
            function getDepth(id, level = 0) {
              const reports = byManager[id]?.reports || [];
              if (reports.length === 0) return level;
              return Math.max(...reports.map((r) => getDepth(r.id, level + 1)));
            }
            return Math.max(...topLevel.map((p) => getDepth(p.id, 0)));
          })() },
          { label: 'Total Managers', value: Object.keys(byManager).length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Graph / Tree */}
        <div className={selectedPerson ? 'lg:col-span-3' : 'lg:col-span-4'}>
          {view === 'graph' ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/30">
                    <svg className="h-5 w-5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-slate-100">Interactive Org Chart</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Scroll to zoom · Drag to pan · Click to select · Double-click for profile</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={handleZoomIn} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-600" title="Zoom in">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  </button>
                  <button onClick={handleZoomOut} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-600" title="Zoom out">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>
                  </button>
                  <button onClick={handleFit} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-600" title="Fit to screen">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                  </button>
                </div>
              </div>
              <div ref={containerRef} className="h-[600px] w-full bg-slate-50/50 dark:bg-slate-900/50" />
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/30">
                  <svg className="h-5 w-5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100">Tree View</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{topLevel.length} root director{topLevel.length !== 1 ? 's' : ''} · Click to expand/collapse</p>
                </div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {topLevel.map((person) => (
                  <TreeViewNode key={person.id} person={person} byManager={byManager} level={0} selectedNode={selectedNode} onSelect={setSelectedNode} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedPerson && (
          <div className="lg:col-span-1 animate-slide-up">
            <div className="sticky top-24 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <Link
                  to={`/people/${selectedPerson.id}`}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-lg font-bold text-white shadow-lg shadow-brand-200 dark:shadow-brand-900/40 hover:shadow-xl transition-shadow"
                >
                  {selectedPerson.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </Link>
                <Link to={`/people/${selectedPerson.id}`} className="mt-3 font-bold text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  {selectedPerson.name}
                </Link>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedPerson.title}</p>
                {selectedReports.length > 0 && (
                  <span className="mt-2 rounded-full bg-brand-50 dark:bg-brand-900/30 px-3 py-1 text-xs font-medium text-brand-700 dark:text-brand-300">
                    {selectedReports.length} direct report{selectedReports.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {selectedReports.length > 0 && (
                <div className="mt-5 border-t border-slate-100 dark:border-slate-700 pt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Direct Reports</p>
                  <div className="space-y-2">
                    {selectedReports.map((report) => (
                      <Link
                        key={report.id}
                        to={`/people/${report.id}`}
                        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-800/50 text-xs font-semibold text-brand-700 dark:text-brand-300">
                          {report.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{report.name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{report.title}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <Link
                to={`/people/${selectedPerson.id}`}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-50 dark:bg-brand-900/30 px-4 py-2.5 text-sm font-medium text-brand-700 dark:text-brand-300 transition-colors hover:bg-brand-100 dark:hover:bg-brand-900/50"
              >
                View full profile
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TreeViewNode({ person, byManager, level, selectedNode, onSelect }) {
  const [expanded, setExpanded] = useState(level < 2);
  const reports = byManager[person.id]?.reports || [];
  const hasReports = reports.length > 0;
  const isSelected = selectedNode === person.id;
  const initials = person.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  const color = LEVEL_COLORS[Math.min(level, LEVEL_COLORS.length - 1)];

  return (
    <div>
      <button
        onClick={() => {
          onSelect(person.id);
          if (hasReports) setExpanded(!expanded);
        }}
        className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-all ${
          isSelected
            ? 'bg-brand-50 dark:bg-brand-900/30'
            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
        }`}
        style={{ paddingLeft: `${level * 32 + 16}px` }}
      >
        {hasReports ? (
          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
            expanded ? 'border-brand-300 bg-brand-50 text-brand-600 dark:border-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500'
          }`}>
            <svg className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        ) : (
          <div className="h-5 w-5 shrink-0" />
        )}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm"
          style={{ background: `linear-gradient(135deg, ${color.bg}, ${color.border})` }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold truncate ${isSelected ? 'text-brand-700 dark:text-brand-300' : 'text-slate-800 dark:text-slate-200'}`}>
            {person.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{person.title}</p>
        </div>
        {hasReports && (
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            isSelected ? 'bg-brand-100 text-brand-700 dark:bg-brand-800/50 dark:text-brand-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
          }`}>
            {reports.length}
          </span>
        )}
      </button>
      {expanded && hasReports && (
        <div>
          {reports.map((report) => (
            <TreeViewNode
              key={report.id}
              person={report}
              byManager={byManager}
              level={level + 1}
              selectedNode={selectedNode}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
