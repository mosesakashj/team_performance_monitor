import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import AppShell from './components/layout/AppShell.jsx';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';

const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const PeopleListPage = lazy(() => import('./pages/PeopleListPage.jsx'));
const PersonDetailPage = lazy(() => import('./pages/PersonDetailPage.jsx'));
const ProjectsListPage = lazy(() => import('./pages/ProjectsListPage.jsx'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage.jsx'));
const TeamsListPage = lazy(() => import('./pages/TeamsListPage.jsx'));
const TeamDetailPage = lazy(() => import('./pages/TeamDetailPage.jsx'));
const SkillsExplorerPage = lazy(() => import('./pages/SkillsExplorerPage.jsx'));
const SkillDetailPage = lazy(() => import('./pages/SkillDetailPage.jsx'));
const ConnectionFinderPage = lazy(() => import('./pages/ConnectionFinderPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <LoadingSpinner />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="people" element={<PeopleListPage />} />
            <Route path="people/:id" element={<PersonDetailPage />} />
            <Route path="projects" element={<ProjectsListPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="teams" element={<TeamsListPage />} />
            <Route path="teams/:id" element={<TeamDetailPage />} />
            <Route path="skills" element={<SkillsExplorerPage />} />
            <Route path="skills/:id" element={<SkillDetailPage />} />
            <Route path="connections" element={<ConnectionFinderPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
