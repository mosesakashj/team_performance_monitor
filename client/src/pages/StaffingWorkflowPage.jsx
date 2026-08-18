import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useProjectsList } from '../hooks/useProjects.js';
import { usePeopleList } from '../hooks/usePeople.js';
import { useStaffingSummary, useCreateProposal, useApproveProposal } from '../hooks/useStaffing.js';
import * as staffingApi from '../api/staffing.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import { useToast } from '../hooks/useToast.jsx';

function useProjectProposals(projectId) {
  return useQuery({
    queryKey: ['staffing-proposals', projectId],
    queryFn: () => staffingApi.getProjectProposals(projectId),
    enabled: true,
  });
}

function ProposalForm({ onSuccess }) {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [proposedRole, setProposedRole] = useState('Engineer');
  const [proposedAllocation, setProposedAllocation] = useState(50);
  const [notes, setNotes] = useState('');

  const { data: projectsData } = useProjectsList({ status: 'active', limit: 100 });
  const { data: peopleData } = usePeopleList({ limit: 100 });
  const createProposal = useCreateProposal();
  const toast = useToast();

  const projects = projectsData?.projects ?? [];
  const people = peopleData?.people ?? [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProject || !selectedPerson) {
      toast.error('Please select both a project and a person');
      return;
    }
    createProposal.mutate(
      { projectId: selectedProject, personId: selectedPerson, proposedRole, proposedAllocation: Number(proposedAllocation), notes },
      { onSuccess: () => { setSelectedProject(''); setSelectedPerson(''); setNotes(''); onSuccess?.(); } }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Create Staffing Proposal</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
          <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
            <option value="">Select a project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Person</label>
          <select value={selectedPerson} onChange={(e) => setSelectedPerson(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
            <option value="">Select a person</option>
            {people.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
          <input type="text" value={proposedRole} onChange={(e) => setProposedRole(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Allocation %</label>
          <input type="number" min="10" max="100" step="10" value={proposedAllocation} onChange={(e) => setProposedAllocation(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="Optional notes about this proposal..." />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button type="submit" disabled={createProposal.isPending} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-50">
          {createProposal.isPending ? 'Submitting...' : 'Submit Proposal'}
        </button>
      </div>
    </form>
  );
}

function ProposalCard({ proposal }) {
  const approveProposal = useApproveProposal();
  const [showConfirm, setShowConfirm] = useState(false);

  const statusStyles = {
    pending: 'bg-amber-50 border-amber-200 text-amber-700',
    approved: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    rejected: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <Link to={`/people/${proposal.person.id}`} className="font-semibold text-slate-900 hover:text-brand-600">{proposal.person.name}</Link>
          <p className="text-sm text-slate-500">{proposal.person.title} · {proposal.person.seniority}</p>
        </div>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[proposal.proposal.status] || ''}`}>
          {proposal.proposal.status}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
        <span>Role: <span className="font-medium text-slate-700">{proposal.proposal.proposedRole}</span></span>
        <span>·</span>
        <span>Allocation: <span className="font-medium text-slate-700">{proposal.proposal.proposedAllocation}%</span></span>
      </div>
      {proposal.proposal.notes && <p className="mt-2 text-sm text-slate-500 italic">"{proposal.proposal.notes}"</p>}
      {proposal.proposal.status === 'pending' && (
        <div className="mt-3 flex gap-2">
          <button onClick={() => setShowConfirm(true)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors">
            Approve
          </button>
        </div>
      )}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => { approveProposal.mutate(proposal.proposal.id); setShowConfirm(false); }}
        title="Approve Proposal"
        message={`Staff ${proposal.person.name} on this project? This will create a WORKED_ON relationship.`}
        confirmLabel="Approve"
        variant="danger"
      />
    </div>
  );
}

export default function StaffingWorkflowPage() {
  const [selectedProject, setSelectedProject] = useState('');
  const { data: projectsData } = useProjectsList({ status: 'active', limit: 100 });
  const { data: proposalsData, isLoading, isError } = useProjectProposals(selectedProject);
  const { data: summaryData } = useStaffingSummary();

  const projects = projectsData?.projects ?? [];
  const proposals = proposalsData?.proposals ?? [];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="page-heading">Staffing Workflow</h1>
        <p className="page-description">Create staffing proposals, review pending requests, and manage team assignments.</p>
      </div>

      {summaryData?.summary?.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {['pending', 'approved', 'rejected'].map((status) => {
            const count = summaryData.summary.filter((s) => s.status === status).reduce((sum, s) => sum + s.count, 0);
            return (
              <div key={status} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500 capitalize">{status} Proposals</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{count}</p>
              </div>
            );
          })}
        </div>
      )}

      <ProposalForm />

      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-slate-900">Proposals by Project</h2>
          <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
            <option value="">All projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {isError ? (
          <ErrorBanner message="Couldn't load proposals." />
        ) : isLoading ? (
          <LoadingSpinner label="Loading proposals..." />
        ) : proposals.length === 0 ? (
          <EmptyState title="No proposals found" description={selectedProject ? 'No proposals for this project yet.' : 'Create a staffing proposal above to get started.'} icon="📋" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {proposals.map((p) => <ProposalCard key={p.proposal.id} proposal={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
