import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center animate-fade-in">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-4xl">
        🔍
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Page not found</h1>
      <p className="max-w-sm text-slate-500">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary mt-2">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
        Back to dashboard
      </Link>
    </div>
  );
}
