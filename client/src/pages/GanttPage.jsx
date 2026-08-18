import { useProjectTimeline } from '../hooks/useAnalytics.js';
import GanttChart from '../components/charts/GanttChart.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';

export default function GanttPage() {
  const { data, isLoading, isError, refetch } = useProjectTimeline();

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="page-heading">Project Timeline</h1>
        <p className="page-description">Gantt chart view of all projects with their date ranges and status.</p>
      </div>

      {isError ? (
        <ErrorBanner message="Couldn't load project timeline." onRetry={refetch} />
      ) : isLoading ? (
        <LoadingSpinner label="Loading timeline..." />
      ) : (
        <GanttChart projects={data?.timeline ?? []} />
      )}
    </div>
  );
}
