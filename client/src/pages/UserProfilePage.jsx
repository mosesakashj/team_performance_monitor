import { useState } from 'react';
import { Link } from 'react-router-dom';

const MOCK_USER = {
  name: 'Alex Morgan',
  email: 'alex.morgan@company.com',
  role: 'Engineering Manager',
  department: 'Engineering',
  location: 'San Francisco, CA',
  timezone: 'PST (UTC-8)',
  initials: 'AM',
  joinDate: '2023-01-15',
  phone: '+1 (555) 123-4567',
};

const PREFERENCES = [
  { key: 'emailNotifications', label: 'Email notifications', description: 'Receive email updates about project assignments and team changes.' },
  { key: 'darkMode', label: 'Dark mode', description: 'Switch between light and dark themes.' },
  { key: 'compactView', label: 'Compact view', description: 'Show more items per page in list views.' },
  { key: 'showAvailability', label: 'Show availability badges', description: 'Display availability status on people cards.' },
];

function InfoRow({ label, value, editable }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-slate-500">{label}</span>
      {editable ? (
        <input
          type="text"
          defaultValue={value}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-right text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 w-64"
        />
      ) : (
        <span className="text-sm font-medium text-slate-900">{value}</span>
      )}
    </div>
  );
}

export default function UserProfilePage() {
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    darkMode: false,
    compactView: false,
    showAvailability: true,
  });

  function togglePref(key) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <div className="mb-8">
        <h1 className="page-heading">Profile & Settings</h1>
        <p className="page-description">Manage your account information and preferences.</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-2xl font-bold text-white shadow-lg shadow-brand-200">
              {MOCK_USER.initials}
            </div>
            <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-slate-600 shadow-sm transition-colors hover:bg-brand-50 hover:text-brand-600">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">{MOCK_USER.name}</h2>
            <p className="text-slate-500">{MOCK_USER.role}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="badge-base bg-brand-50 text-brand-700">{MOCK_USER.department}</span>
              <span className="badge-base bg-emerald-50 text-emerald-700">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="section-heading mb-4">Personal information</h3>
        <div className="divide-y divide-slate-100">
          <InfoRow label="Full name" value={MOCK_USER.name} editable />
          <InfoRow label="Email" value={MOCK_USER.email} editable />
          <InfoRow label="Phone" value={MOCK_USER.phone} editable />
          <InfoRow label="Location" value={MOCK_USER.location} editable />
          <InfoRow label="Timezone" value={MOCK_USER.timezone} />
          <InfoRow label="Department" value={MOCK_USER.department} />
          <InfoRow label="Role" value={MOCK_USER.role} />
          <InfoRow label="Joined" value={new Date(MOCK_USER.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button type="button" className="btn-secondary">Cancel</button>
          <button type="button" className="btn-primary">Save changes</button>
        </div>
      </div>

      {/* Preferences */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="section-heading mb-4">Preferences</h3>
        <div className="divide-y divide-slate-100">
          {PREFERENCES.map((pref) => (
            <div key={pref.key} className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium text-slate-900">{pref.label}</p>
                <p className="text-xs text-slate-500">{pref.description}</p>
              </div>
              <button
                type="button"
                onClick={() => togglePref(pref.key)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                  prefs[pref.key] ? 'bg-brand-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    prefs[pref.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="section-heading mb-4">Quick links</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/people" className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition-all hover:border-brand-300 hover:bg-brand-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.25 0 015.25 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">My team</p>
              <p className="text-xs text-slate-500">View your team roster</p>
            </div>
          </Link>
          <Link to="/projects" className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition-all hover:border-brand-300 hover:bg-brand-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">My projects</p>
              <p className="text-xs text-slate-500">View assigned projects</p>
            </div>
          </Link>
          <Link to="/skills" className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition-all hover:border-brand-300 hover:bg-brand-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">My skills</p>
              <p className="text-xs text-slate-500">Manage your skill profile</p>
            </div>
          </Link>
          <Link to="/connections" className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition-all hover:border-brand-300 hover:bg-brand-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Find connections</p>
              <p className="text-xs text-slate-500">Trace paths between people</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
