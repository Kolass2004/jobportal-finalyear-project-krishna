'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { ArrowLeft, Check, X, User, Sparkles, Loader2, Bot, Mail, MessageSquare } from 'lucide-react';

export default function ApplicantsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingFit, setAnalyzingFit] = useState<Record<string, boolean>>({});
  const [generatingQuestions, setGeneratingQuestions] = useState<Record<string, boolean>>({});
  const [draftingMessage, setDraftingMessage] = useState<Record<string, boolean>>({});

  const analyzeFit = async (appId: string) => {
    setAnalyzingFit(prev => ({ ...prev, [appId]: true }));
    try {
      const res = await fetch(`/api/applications/${appId}/ai-fit`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setApplicants(prev => prev.map(a => a.id === appId ? { ...a, aiFit: data } : a));
      } else {
        addToast(data.error || 'Failed to analyze fit', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
    }
    setAnalyzingFit(prev => ({ ...prev, [appId]: false }));
  };

  const generateQuestions = async (appId: string) => {
    setGeneratingQuestions(prev => ({ ...prev, [appId]: true }));
    try {
      const res = await fetch(`/api/applications/${appId}/ai-recruiter-questions`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setApplicants(prev => prev.map(a => a.id === appId ? { ...a, aiQuestions: data.questions } : a));
        addToast('Interview questions generated!', 'success');
      } else {
        addToast(data.error || 'Failed to generate questions', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
    }
    setGeneratingQuestions(prev => ({ ...prev, [appId]: false }));
  };

  const draftOutreach = async (appId: string, type: 'INTERVIEW' | 'REJECTION') => {
    setDraftingMessage(prev => ({ ...prev, [appId]: true }));
    try {
      const res = await fetch(`/api/applications/${appId}/ai-outreach`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (res.ok) {
        setApplicants(prev => prev.map(a => a.id === appId ? { ...a, aiMessage: data.message } : a));
        addToast('Draft created!', 'success');
      } else {
        addToast(data.error || 'Failed to draft message', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
    }
    setDraftingMessage(prev => ({ ...prev, [appId]: false }));
  };

  useEffect(() => {
    fetch(`/api/jobs/${id}/applicants`).then(r => r.json()).then(setApplicants).finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (appId: string, status: string) => {
    const res = await fetch(`/api/applications/${appId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      addToast(`Application ${status.toLowerCase()}`, 'success');
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'badge-pending', REVIEWED: 'badge-reviewed', SHORTLISTED: 'badge-shortlisted',
      ACCEPTED: 'badge-accepted', REJECTED: 'badge-rejected',
    };
    return map[status] || 'badge-pending';
  };

  if (loading) return <div className="flex items-center justify-center min-h-[300px]"><div className="spinner w-8 h-8 border-[3px]" /></div>;

  return (
    <div className="max-w-[800px]">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-notion-text-secondary text-sm mb-5 hover:text-notion-text">
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="text-3xl font-bold tracking-tight text-notion-text mb-2">Applicants</h1>
      <p className="text-notion-text-secondary mb-8">{applicants.length} applications received</p>

      <div className="space-y-3">
        {applicants.map((app) => (
          <div key={app.id} className="flex items-center gap-4 p-4 border border-notion-border rounded-lg bg-notion-bg hover:shadow-sm transition-all">
            <div className="w-10 h-10 rounded-full bg-notion-blue-bg text-notion-blue flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {app.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-notion-text">{app.user?.name}</h3>
              <p className="text-xs text-notion-text-secondary">{app.user?.email} · {app.user?.location || 'No location'}</p>
              {app.coverLetter && (
                <p className="text-xs text-notion-text-tertiary mt-1 line-clamp-2">{app.coverLetter}</p>
              )}
              {app.aiFit && (
                <div className="mt-2 bg-notion-bg-secondary p-2 rounded text-xs border border-notion-border-light">
                  <div className="font-semibold text-notion-purple flex items-center gap-1 mb-1">
                    <Sparkles size={12} /> Fit Score: {app.aiFit.score}%
                  </div>
                  <p className="text-notion-text-secondary leading-relaxed">{app.aiFit.summary}</p>
                </div>
              )}
              {app.aiQuestions && (
                <div className="mt-2 bg-notion-purple-bg/30 p-3 rounded-lg text-xs border border-notion-purple/20 text-notion-text-secondary">
                  <div className="font-semibold text-notion-purple flex items-center gap-1 mb-2">
                    <Bot size={12} /> Interview Questions
                  </div>
                  <div className="whitespace-pre-wrap">{app.aiQuestions}</div>
                </div>
              )}
              {app.aiMessage && (
                <div className="mt-2 bg-notion-blue-bg/30 p-3 rounded-lg text-xs border border-notion-blue/20 text-notion-text-secondary">
                  <div className="font-semibold text-notion-blue flex items-center gap-1 mb-2">
                    <Mail size={12} /> Outreach Draft
                  </div>
                  <div className="whitespace-pre-wrap">{app.aiMessage}</div>
                </div>
              )}
            </div>
            <span className={statusBadge(app.status)}>{app.status}</span>
            <div className="flex flex-col gap-2 items-end">
              <button 
                onClick={() => analyzeFit(app.id)} 
                disabled={analyzingFit[app.id]}
                className="text-xs flex items-center gap-1 text-notion-purple hover:text-notion-purple/80 font-medium"
              >
                {analyzingFit[app.id] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {analyzingFit[app.id] ? 'Analyzing...' : '✨ Analyze Fit'}
              </button>
              <button 
                onClick={() => generateQuestions(app.id)} 
                disabled={generatingQuestions[app.id]}
                className="text-xs flex items-center gap-1 text-notion-purple hover:text-notion-purple/80 font-medium"
              >
                {generatingQuestions[app.id] ? <Loader2 size={12} className="animate-spin" /> : <MessageSquare size={12} />}
                {generatingQuestions[app.id] ? 'Generating...' : '✨ Prep Questions'}
              </button>
              
              <div className="flex gap-2 items-center text-xs text-notion-purple font-medium">
                <Mail size={12} /> ✨ Draft:
                <button disabled={draftingMessage[app.id]} onClick={() => draftOutreach(app.id, 'INTERVIEW')} className="hover:underline">Invite</button>
                <span>|</span>
                <button disabled={draftingMessage[app.id]} onClick={() => draftOutreach(app.id, 'REJECTION')} className="hover:underline">Reject</button>
                {draftingMessage[app.id] && <Loader2 size={12} className="animate-spin ml-1" />}
              </div>
              <div className="flex gap-1">
              <select
                value={app.status}
                onChange={(e) => updateStatus(app.id, e.target.value)}
                className="notion-select text-xs py-1 w-auto"
              >
                <option value="PENDING">Pending</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <button onClick={() => router.push(`/users/${app.user?.id}`)} className="btn-ghost p-1.5" title="View Profile">
                <User size={14} />
              </button>
              </div>
            </div>
          </div>
        ))}
        {applicants.length === 0 && (
          <div className="text-center py-16">
            <User size={40} className="mx-auto mb-4 text-notion-text-tertiary opacity-40" />
            <h3 className="text-lg font-semibold text-notion-text mb-2">No applicants yet</h3>
            <p className="text-sm text-notion-text-secondary">Applications will appear here once candidates apply</p>
          </div>
        )}
      </div>
    </div>
  );
}
