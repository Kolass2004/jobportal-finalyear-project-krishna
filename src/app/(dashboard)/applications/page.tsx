'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { FileText, Clock, Building2, Sparkles, Bot, Loader2 } from 'lucide-react';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [preparing, setPreparing] = useState<Record<string, boolean>>({});
  const { addToast } = useToast();

  const generatePrep = async (appId: string) => {
    setPreparing(prev => ({ ...prev, [appId]: true }));
    try {
      const res = await fetch(`/api/applications/${appId}/ai-interview-prep`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, aiPrep: data.prepGuide } : a));
        addToast('Interview Prep generated!', 'success');
      } else {
        addToast(data.error || 'Failed to generate prep guide', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
    }
    setPreparing(prev => ({ ...prev, [appId]: false }));
  };

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h4 key={i} className="font-semibold mt-3 mb-1 text-notion-text">{line.slice(3)}</h4>;
      if (line.startsWith('### ')) return <h5 key={i} className="font-semibold mt-2 mb-1 text-notion-text">{line.slice(4)}</h5>;
      if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc mb-1">{line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>;
      if (line.match(/^\d+\.\s/)) return <li key={i} className="ml-4 list-decimal mb-1">{line.replace(/^\d+\.\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>;
      if (line.trim() === '') return <div key={i} className="h-2" />;
      
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="mb-1 leading-relaxed">
          {parts.map((part, j) => 
            part.startsWith('**') && part.endsWith('**') 
              ? <strong key={j}>{part.slice(2, -2)}</strong> 
              : part
          )}
        </p>
      );
    });
  };

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
          <div key={app.id} className="p-4 border border-notion-border rounded-lg bg-notion-bg hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-notion-bg-tertiary border border-notion-border-light flex items-center justify-center text-notion-blue font-bold flex-shrink-0">
                {app.job.company?.name?.[0] || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/jobs/${app.job.id}`} className="text-[15px] font-semibold text-notion-text hover:text-notion-blue transition-colors inline-block">{app.job.title}</Link>
                <div className="flex items-center gap-3 text-sm text-notion-text-secondary mt-1">
                  <span className="flex items-center gap-1"><Building2 size={12} /> {app.job.company?.name}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className={statusBadge(app.status)}>{app.status}</span>
                <button 
                  onClick={() => generatePrep(app.id)}
                  disabled={preparing[app.id]}
                  className="text-xs flex items-center gap-1 text-notion-purple hover:text-notion-purple/80 font-medium bg-notion-purple-bg px-2 py-1 rounded"
                >
                  {preparing[app.id] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  {preparing[app.id] ? 'Preparing...' : '✨ Interview Prep'}
                </button>
              </div>
            </div>
            {app.aiPrep && (
              <div className="mt-4 p-5 bg-notion-purple-bg/30 border border-notion-purple/20 rounded-xl text-sm text-notion-text-secondary leading-relaxed">
                <div className="flex items-center gap-2 mb-3 text-notion-purple font-semibold text-base">
                  <Bot size={18} /> AI Interview Prep Guide
                </div>
                <div>{renderMarkdown(app.aiPrep)}</div>
              </div>
            )}
          </div>
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
