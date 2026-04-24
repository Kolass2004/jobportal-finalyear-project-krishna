'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { Search, Briefcase, Clock, Trash2 } from 'lucide-react';

export default function AdminJobsPage() {
  const { addToast } = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs?status=&limit=100').then(r => r.json()).then(data => setJobs(data.jobs || [])).finally(() => setLoading(false));
  }, []);

  const deleteJob = async (id: string) => {
    if (!confirm('Delete this job?')) return;
    const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setJobs(prev => prev.filter(j => j.id !== id));
      addToast('Job deleted', 'success');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/jobs/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
    addToast('Job status updated', 'success');
  };

  const statusBadge = (status: string) => {
    if (status === 'ACTIVE') return 'badge-accepted';
    if (status === 'CLOSED') return 'badge-rejected';
    return 'bg-notion-bg-tertiary text-notion-text-tertiary px-2.5 py-0.5 rounded-full text-[11px] font-semibold';
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="spinner w-8 h-8 border-[3px]" /></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-notion-text mb-2">Manage Jobs</h1>
      <p className="text-notion-text-secondary mb-8">{jobs.length} total job postings</p>

      <div className="border border-notion-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-notion-bg-secondary border-b border-notion-border">
              <th className="px-4 py-3 text-left text-xs font-semibold text-notion-text-tertiary uppercase tracking-wider">Job</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-notion-text-tertiary uppercase tracking-wider">Company</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-notion-text-tertiary uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-notion-text-tertiary uppercase tracking-wider">Apps</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-notion-text-tertiary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id} className="border-b border-notion-border-light hover:bg-notion-bg-hover">
                <td className="px-4 py-3">
                  <Link href={`/jobs/${job.id}`} className="text-sm font-medium text-notion-text hover:text-notion-blue">{job.title}</Link>
                  <p className="text-xs text-notion-text-tertiary">{job.type?.replace('_', ' ')} · {job.location || 'Remote'}</p>
                </td>
                <td className="px-4 py-3 text-sm text-notion-text-secondary">{job.company?.name}</td>
                <td className="px-4 py-3"><span className={statusBadge(job.status)}>{job.status}</span></td>
                <td className="px-4 py-3 text-sm text-notion-text-secondary">{job._count?.applications || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 items-center">
                    <select value={job.status} onChange={e => updateStatus(job.id, e.target.value)} className="notion-select text-xs py-1 w-auto">
                      <option value="ACTIVE">Active</option>
                      <option value="CLOSED">Closed</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                    <button onClick={() => deleteJob(job.id)} className="p-1.5 rounded-md hover:bg-notion-red-bg text-notion-red" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
