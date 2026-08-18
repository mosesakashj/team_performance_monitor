import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { useDarkMode } from '../hooks/useDarkMode.js';
import * as authApi from '../api/auth.js';

export default function UserProfilePage() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await authApi.updateMe({ name, email });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <div className="mb-8">
        <h1 className="page-heading">Profile & Settings</h1>
        <p className="page-description">Manage your account information and preferences.</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-2xl font-bold text-white shadow-lg shadow-brand-200 dark:shadow-brand-900/40">
              {initials}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user?.name || 'User'}</h2>
            <p className="text-slate-500 dark:text-slate-400">{user?.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="badge-base bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 capitalize">{user?.role || 'member'}</span>
              <span className="badge-base bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <form onSubmit={handleSave} className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h3 className="section-heading mb-4">Personal information</h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">Full name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 text-sm text-right text-slate-900 dark:text-slate-100 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 w-64"
            />
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 text-sm text-right text-slate-900 dark:text-slate-100 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 w-64"
            />
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">Role</span>
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">{user?.role || 'member'}</span>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={logout} className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            Sign out
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>

      {/* Preferences */}
      <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h3 className="section-heading mb-4">Preferences</h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Dark mode</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark themes.</p>
            </div>
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                darkMode ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h3 className="section-heading mb-4">Quick links</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/people" className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3 transition-all hover:border-brand-300 dark:hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.25 0 015.25 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Browse people</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">View team roster</p>
            </div>
          </Link>
          <Link to="/projects" className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3 transition-all hover:border-brand-300 dark:hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Browse projects</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">View project list</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
