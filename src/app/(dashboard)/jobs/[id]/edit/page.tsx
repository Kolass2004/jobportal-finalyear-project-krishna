'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function EditJobPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    fetch(`/api/jobs/${id}`).then(r => r.json()).then(job => {
      setForm({
        title: job.title || '', description: job.description || '',
        type: job.type || 'FULL_TIME', location: job.location || '',
        salaryMin: job.salaryMin?.toString() || '', salaryMax: job.salaryMax?.toString() || '',
        remote: job.remote || false, skills: job.skills || '',
        status: job.status || 'ACTIVE', deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
      });
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) { addToast('Job updated!', 'success'); router.push(`/jobs/${id}`); }
    else addToast('Failed to update', 'error');
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="spinner w-8 h-8 border-[3px]" /></div>;

  return (
    <div className="max-w-[700px]">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-notion-text-secondary text-sm mb-5 hover:text-notion-text"><ArrowLeft size={16} /> Back</button>
      <h1 className="text-3xl font-bold tracking-tight text-notion-text mb-8">Edit Job</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-notion-text mb-2">Job Title</label>
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="notion-input" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-notion-text mb-2">Description</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="notion-textarea min-h-[200px]" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-notion-text mb-2">Type</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="notion-select">
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-notion-text mb-2">Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="notion-select">
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-notion-text mb-2">Location</label>
          <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="notion-input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-notion-text mb-2">Min Salary ($)</label>
            <input type="number" value={form.salaryMin} onChange={e => setForm({...form, salaryMin: e.target.value})} className="notion-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-notion-text mb-2">Max Salary ($)</label>
            <input type="number" value={form.salaryMax} onChange={e => setForm({...form, salaryMax: e.target.value})} className="notion-input" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-notion-text mb-2">Skills</label>
          <input value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} className="notion-input" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.remote} onChange={e => setForm({...form, remote: e.target.checked})} className="w-4 h-4 rounded" />
          <span className="text-sm text-notion-text">Remote position</span>
        </label>
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Loader2 size={16} className="animate-spin" />} {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
