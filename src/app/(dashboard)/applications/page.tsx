'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Clock, Building2 } from 'lucide-react';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/applications').then(r => r.json()).then(setApplications).finally(() => setLoading(false));
  }, []);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'badge-pending', REVIEWED: 'badge-reviewed', SHORTLISTED: 'badge-shortlisted',
      ACCEPTED: 'badge-accepted', REJECTED: 'badge-rejected',
    };
    return map[status] || 'badge-pending';
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="spinner w-8 h-8 border-[3px]" /></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-notion-text mb-2">My Applications</h1>
      <p className="text-notion-text-secondary mb-8">Track the status of your job applications</p>

      <div className="space-y-3">
        {applications.map((app) => (
          <Link
            key={app.id}
            href={`/jobs/${app.job.id}`}
            className="flex items-center gap-4 p-4 border border-notion-border rounded-lg bg-notion-bg hover:shadow-md hover:border-notion-blue transition-all group"
          >
            <div className="w-11 h-11 rounded-lg bg-notion-bg-tertiary border border-notion-border-light flex items-center justify-center text-notion-blue font-bold flex-shrink-0">
              {app.job.company?.name?.[0] || 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-semibold text-notion-text group-hover:text-notion-blue transition-colors">{app.job.title}</h3>
              <div className="flex items-center gap-3 text-sm text-notion-text-secondary">
                <span className="flex items-center gap-1"><Building2 size={12} /> {app.job.company?.name}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
              </div>
            </div>
            <span className={statusBadge(app.status)}>{app.status}</span>
          </Link>
        ))}
        {applications.length === 0 && (
          <div className="text-center py-16">
            <FileText size={40} className="mx-auto mb-4 text-notion-text-tertiary opacity-40" />
            <h3 className="text-lg font-semibold text-notion-text mb-2">No applications yet</h3>
            <p className="text-sm text-notion-text-secondary mb-4">Start applying to jobs to track them here</p>
            <Link href="/jobs" className="btn-primary">Browse Jobs</Link>
          </div>
        )}
      </div>
    </div>
  );
}
