'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Briefcase, Users, Clock, MoreVertical } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function MyJobsPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/jobs?recruiterId=${session.user.id}&status=`).then(r => r.json()).then(data => setJobs(data.jobs || [])).finally(() => setLoading(false));
    }
  }, [session]);

  const deleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setJobs(prev => prev.filter(j => j.id !== id));
      addToast('Job deleted', 'success');
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { ACTIVE: 'badge-accepted', CLOSED: 'badge-rejected', DRAFT: 'bg-notion-bg-tertiary text-notion-text-tertiary px-2.5 py-0.5 rounded-full text-[11px] font-semibold' };
    return map[status] || '';
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="spinner w-8 h-8 border-[3px]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-notion-text mb-2">My Job Posts</h1>
          <p className="text-notion-text-secondary">{jobs.length} total job postings</p>
        </div>
        <Link href="/jobs/new" className="btn-primary">+ Post New Job</Link>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="flex items-center gap-4 p-4 border border-notion-border rounded-lg bg-notion-bg hover:shadow-sm transition-all">
            <div className="w-11 h-11 rounded-lg bg-notion-bg-tertiary border border-notion-border-light flex items-center justify-center text-notion-blue font-bold flex-shrink-0">
              {job.company?.name?.[0] || 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/jobs/${job.id}`} className="text-[15px] font-semibold text-notion-text hover:text-notion-blue transition-colors">{job.title}</Link>
              <div className="flex items-center gap-3 text-sm text-notion-text-secondary">
                <span>{job.company?.name}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <span className={statusBadge(job.status)}>{job.status}</span>
            <Link href={`/jobs/${job.id}/applicants`} className="btn-ghost text-xs flex items-center gap-1">
              <Users size={14} /> {job._count?.applications || 0}
            </Link>
            <div className="flex gap-1">
              <Link href={`/jobs/${job.id}/edit`} className="btn-ghost text-xs">Edit</Link>
              <button onClick={() => deleteJob(job.id)} className="btn-ghost text-xs text-notion-red">Delete</button>
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="text-center py-16">
            <Briefcase size={40} className="mx-auto mb-4 text-notion-text-tertiary opacity-40" />
            <h3 className="text-lg font-semibold text-notion-text mb-2">No jobs posted yet</h3>
            <p className="text-sm text-notion-text-secondary mb-4">Create your first job posting to start finding talent</p>
            <Link href="/jobs/new" className="btn-primary">Post a Job</Link>
          </div>
        )}
      </div>
    </div>
  );
}
