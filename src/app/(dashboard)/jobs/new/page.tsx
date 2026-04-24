'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/Toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function NewJobPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', companyId: '', type: 'FULL_TIME',
    location: '', salaryMin: '', salaryMax: '', remote: false, skills: '', deadline: '',
  });
  const [newCompany, setNewCompany] = useState({ name: '', industry: '', location: '', website: '', size: '' });

  useEffect(() => {
    fetch('/api/companies').then(r => r.json()).then(data => {
      const mine = data.filter((c: any) => c.recruiterId === session?.user?.id);
      setCompanies(mine);
      if (mine.length > 0) setForm(f => ({ ...f, companyId: mine[0].id }));
    });
  }, [session]);

  const createCompany = async () => {
    const res = await fetch('/api/companies', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCompany),
    });
    if (res.ok) {
      const company = await res.json();
      setCompanies(prev => [...prev, company]);
      setForm(f => ({ ...f, companyId: company.id }));
      setShowNewCompany(false);
      addToast('Company created!', 'success');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyId) { addToast('Please select or create a company first', 'error'); return; }
    setLoading(true);
    const res = await fetch('/api/jobs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      addToast('Job posted successfully!', 'success');
      router.push('/my-jobs');
    } else {
      const data = await res.json();
      addToast(data.error || 'Failed to post job', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-[700px]">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-notion-text-secondary text-sm mb-5 hover:text-notion-text">
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="text-3xl font-bold tracking-tight text-notion-text mb-2">Post a New Job</h1>
      <p className="text-notion-text-secondary mb-8">Fill in the details to create a job listing</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-notion-text mb-2">Company *</label>
          {companies.length > 0 ? (
            <select value={form.companyId} onChange={(e) => setForm({...form, companyId: e.target.value})} className="notion-select">
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          ) : (
            <p className="text-sm text-notion-text-tertiary mb-2">No companies yet.</p>
          )}
          <button type="button" onClick={() => setShowNewCompany(!showNewCompany)} className="text-sm text-notion-blue hover:underline mt-2">
            + Create new company
          </button>
        </div>

        {showNewCompany && (
          <div className="bg-notion-bg-secondary border border-notion-border rounded-lg p-4 space-y-3">
            <input placeholder="Company Name *" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} className="notion-input" />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Industry" value={newCompany.industry} onChange={e => setNewCompany({...newCompany, industry: e.target.value})} className="notion-input" />
              <input placeholder="Location" value={newCompany.location} onChange={e => setNewCompany({...newCompany, location: e.target.value})} className="notion-input" />
            </div>
            <input placeholder="Website" value={newCompany.website} onChange={e => setNewCompany({...newCompany, website: e.target.value})} className="notion-input" />
            <button type="button" onClick={createCompany} disabled={!newCompany.name} className="btn-primary">Create Company</button>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-notion-text mb-2">Job Title *</label>
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="notion-input" placeholder="e.g. Senior Full-Stack Engineer" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-notion-text mb-2">Description *</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="notion-textarea min-h-[200px]" placeholder="Use ## for headings, - for bullet points" required />
          <p className="text-xs text-notion-text-tertiary mt-1">Supports basic markdown: ## Heading, - list item</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-notion-text mb-2">Job Type</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="notion-select">
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-notion-text mb-2">Location</label>
            <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="notion-input" placeholder="e.g. San Francisco, CA" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-notion-text mb-2">Min Salary ($)</label>
            <input type="number" value={form.salaryMin} onChange={e => setForm({...form, salaryMin: e.target.value})} className="notion-input" placeholder="e.g. 100000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-notion-text mb-2">Max Salary ($)</label>
            <input type="number" value={form.salaryMax} onChange={e => setForm({...form, salaryMax: e.target.value})} className="notion-input" placeholder="e.g. 150000" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-notion-text mb-2">Skills</label>
          <input value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} className="notion-input" placeholder="React, Node.js, TypeScript (comma-separated)" />
        </div>

        <div>
          <label className="block text-sm font-medium text-notion-text mb-2">Application Deadline</label>
          <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="notion-input" />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.remote} onChange={e => setForm({...form, remote: e.target.checked})} className="w-4 h-4 rounded border-notion-border" />
          <span className="text-sm text-notion-text">This is a remote position</span>
        </label>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Posting...' : 'Post Job'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
