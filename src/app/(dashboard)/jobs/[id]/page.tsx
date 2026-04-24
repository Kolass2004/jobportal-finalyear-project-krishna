'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/Toast';
import { ArrowLeft, MapPin, Briefcase, Clock, Wifi, DollarSign, Users, Bookmark, BookmarkCheck, Send, Building2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  const role = (session?.user as any)?.role;

  useEffect(() => {
    fetch(`/api/jobs/${id}`).then((r) => r.json()).then(setJob).finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      const res = await fetch(`/api/jobs/${id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverLetter }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Application submitted successfully!', 'success');
        setJob({ ...job, hasApplied: true });
        setShowApplyModal(false);
      } else {
        addToast(data.error || 'Failed to apply', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
    }
    setApplying(false);
  };

  const toggleSave = async () => {
    const res = await fetch('/api/saved-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: id }),
    });
    const data = await res.json();
    setJob({ ...job, isSaved: data.saved });
    addToast(data.saved ? 'Job saved' : 'Job removed from saved', 'info');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner w-8 h-8 border-[3px]" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-notion-text mb-2">Job not found</h2>
        <button onClick={() => router.push('/jobs')} className="btn-primary mt-4">Browse Jobs</button>
      </div>
    );
  }

  // Simple markdown-like renderer for job description
  const renderDescription = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-semibold mt-6 mb-3 text-notion-text">{line.slice(3)}</h2>;
      if (line.startsWith('- ')) return <li key={i} className="ml-6 list-disc text-notion-text mb-1">{line.slice(2)}</li>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-notion-text mb-2 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="max-w-[900px]">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-notion-text-secondary text-sm mb-5 hover:text-notion-text transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        {/* Main Content */}
        <div>
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-notion-bg-tertiary border border-notion-border-light flex items-center justify-center text-notion-blue font-bold text-xl flex-shrink-0">
              {job.company?.name?.[0] || 'C'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-notion-text mb-1">{job.title}</h1>
              <Link href={`/companies/${job.company?.id}`} className="text-notion-blue hover:underline text-base">
                {job.company?.name}
              </Link>
              <div className="flex flex-wrap gap-3 mt-3 text-sm text-notion-text-tertiary">
                <span className="flex items-center gap-1"><MapPin size={14} /> {job.location || 'Not specified'}</span>
                <span className="flex items-center gap-1"><Briefcase size={14} /> {job.type?.replace('_', ' ')}</span>
                {job.remote && <span className="flex items-center gap-1"><Wifi size={14} /> Remote</span>}
                <span className="flex items-center gap-1"><Clock size={14} /> Posted {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            {role === 'JOBSEEKER' && (
              <>
                {job.hasApplied ? (
                  <button disabled className="btn-success">
                    <Send size={16} /> Applied
                  </button>
                ) : (
                  <button onClick={() => setShowApplyModal(true)} className="btn-primary">
                    <Send size={16} /> Apply Now
                  </button>
                )}
                <button onClick={toggleSave} className="btn-secondary">
                  {job.isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  {job.isSaved ? 'Saved' : 'Save'}
                </button>
              </>
            )}
            {role === 'RECRUITER' && job.recruiterId === session?.user?.id && (
              <>
                <Link href={`/jobs/${id}/edit`} className="btn-primary">Edit Job</Link>
                <Link href={`/jobs/${id}/applicants`} className="btn-secondary">
                  <Users size={16} /> View Applicants ({job._count?.applications || 0})
                </Link>
              </>
            )}
          </div>

          {/* Description */}
          <div className="border-t border-notion-border pt-6">
            <div className="prose prose-notion max-w-none text-[15px] leading-relaxed">
              {renderDescription(job.description)}
            </div>
          </div>

          {/* Skills */}
          {job.skills && (
            <div className="mt-6 pt-6 border-t border-notion-border">
              <h3 className="text-lg font-semibold text-notion-text mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.split(',').map((skill: string) => (
                  <span key={skill} className="px-3 py-1 rounded-md text-sm font-medium bg-notion-blue-bg text-notion-blue">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="bg-notion-bg-secondary border border-notion-border rounded-lg p-5 space-y-4 sticky top-6">
          <h3 className="font-semibold text-notion-text">Job Details</h3>

          {job.salaryMin && job.salaryMax && (
            <div className="flex items-center gap-3 text-sm">
              <DollarSign size={16} className="text-notion-green" />
              <div>
                <div className="text-notion-text-tertiary text-xs">Salary</div>
                <div className="font-semibold text-notion-green">${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <Briefcase size={16} className="text-notion-text-tertiary" />
            <div>
              <div className="text-notion-text-tertiary text-xs">Type</div>
              <div className="font-medium text-notion-text">{job.type?.replace('_', ' ')}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <MapPin size={16} className="text-notion-text-tertiary" />
            <div>
              <div className="text-notion-text-tertiary text-xs">Location</div>
              <div className="font-medium text-notion-text">{job.location || 'Not specified'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Users size={16} className="text-notion-text-tertiary" />
            <div>
              <div className="text-notion-text-tertiary text-xs">Applicants</div>
              <div className="font-medium text-notion-text">{job._count?.applications || 0}</div>
            </div>
          </div>

          {job.deadline && (
            <div className="flex items-center gap-3 text-sm">
              <Clock size={16} className="text-notion-text-tertiary" />
              <div>
                <div className="text-notion-text-tertiary text-xs">Deadline</div>
                <div className="font-medium text-notion-text">{new Date(job.deadline).toLocaleDateString()}</div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-notion-border">
            <h4 className="text-sm font-medium text-notion-text mb-2">About {job.company?.name}</h4>
            <Link href={`/companies/${job.company?.id}`} className="text-sm text-notion-blue hover:underline flex items-center gap-1">
              <Building2 size={14} /> View Company Profile <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-6" onClick={() => setShowApplyModal(false)}>
          <div className="bg-notion-bg border border-notion-border rounded-xl w-full max-w-[500px] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-notion-border">
              <h2 className="text-lg font-semibold text-notion-text">Apply for {job.title}</h2>
              <button onClick={() => setShowApplyModal(false)} className="text-notion-text-tertiary hover:text-notion-text">✕</button>
            </div>
            <div className="p-5">
              <label className="block text-sm font-medium text-notion-text mb-2">Cover Letter (optional)</label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="notion-textarea min-h-[150px]"
                placeholder="Tell the recruiter why you're a great fit for this role..."
              />
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-notion-border">
              <button onClick={() => setShowApplyModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleApply} disabled={applying} className="btn-primary">
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
