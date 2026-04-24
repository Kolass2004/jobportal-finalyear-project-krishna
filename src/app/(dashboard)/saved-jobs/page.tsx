'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookmarkCheck, Clock, MapPin, Briefcase } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function SavedJobsPage() {
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetch('/api/saved-jobs').then(r => r.json()).then(setSaved).finally(() => setLoading(false));
  }, []);

  const unsave = async (jobId: string) => {
    await fetch('/api/saved-jobs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    });
    setSaved(prev => prev.filter(s => s.jobId !== jobId));
    addToast('Job removed from saved', 'info');
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="spinner w-8 h-8 border-[3px]" /></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-notion-text mb-2">Saved Jobs</h1>
      <p className="text-notion-text-secondary mb-8">{saved.length} jobs saved</p>

      <div className="space-y-3">
        {saved.map((s) => (
          <div key={s.id} className="flex items-center gap-4 p-4 border border-notion-border rounded-lg bg-notion-bg hover:shadow-sm transition-all">
            <div className="w-11 h-11 rounded-lg bg-notion-bg-tertiary border border-notion-border-light flex items-center justify-center text-notion-blue font-bold flex-shrink-0">
              {s.job.company?.name?.[0] || 'C'}
            </div>
            <Link href={`/jobs/${s.job.id}`} className="flex-1 min-w-0">
              <h3 className="text-[15px] font-semibold text-notion-text hover:text-notion-blue transition-colors">{s.job.title}</h3>
              <div className="flex items-center gap-3 text-sm text-notion-text-secondary">
                <span>{s.job.company?.name}</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {s.job.location || 'Remote'}</span>
                <span className="flex items-center gap-1"><Briefcase size={12} /> {s.job.type?.replace('_', ' ')}</span>
              </div>
            </Link>
            <button onClick={() => unsave(s.jobId)} className="btn-ghost text-xs text-notion-red">Remove</button>
          </div>
        ))}
        {saved.length === 0 && (
          <div className="text-center py-16">
            <BookmarkCheck size={40} className="mx-auto mb-4 text-notion-text-tertiary opacity-40" />
            <h3 className="text-lg font-semibold text-notion-text mb-2">No saved jobs</h3>
            <p className="text-sm text-notion-text-secondary mb-4">Save interesting jobs to view them later</p>
            <Link href="/jobs" className="btn-primary">Browse Jobs</Link>
          </div>
        )}
      </div>
    </div>
  );
}
