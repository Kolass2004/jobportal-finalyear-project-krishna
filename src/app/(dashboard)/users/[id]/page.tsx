'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Mail, Phone, Briefcase, GraduationCap, MessageSquare, Globe } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function PublicProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${id}`).then(r => r.json()).then(setUser).finally(() => setLoading(false));
  }, [id]);

  const startChat = async () => {
    const res = await fetch('/api/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId: id }),
    });
    if (res.ok) {
      router.push('/messages');
    }
  };

  const initials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="spinner w-8 h-8 border-[3px]" /></div>;
  if (!user) return <div className="text-center py-16"><h2 className="text-xl font-semibold">User not found</h2></div>;

  return (
    <div className="max-w-[700px]">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-notion-text-secondary text-sm mb-5 hover:text-notion-text">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-start gap-5 pb-6 border-b border-notion-border mb-6">
        <div className="w-20 h-20 rounded-full bg-notion-blue-bg text-notion-blue flex items-center justify-center text-2xl font-bold flex-shrink-0">
          {initials(user.name)}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight text-notion-text mb-1">{user.name}</h2>
          {user.jobseekerProfile?.headline && <p className="text-notion-text-secondary mb-2">{user.jobseekerProfile.headline}</p>}
          <div className="flex flex-wrap gap-3 text-sm text-notion-text-tertiary mb-3">
            <span className="flex items-center gap-1"><Mail size={14} /> {user.email}</span>
            {user.location && <span className="flex items-center gap-1"><MapPin size={14} /> {user.location}</span>}
          </div>
          {session?.user?.id !== id && (
            <button onClick={startChat} className="btn-primary text-sm">
              <MessageSquare size={14} /> Message
            </button>
          )}
        </div>
      </div>

      {user.bio && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-notion-text mb-3">About</h3>
          <p className="text-notion-text-secondary leading-relaxed">{user.bio}</p>
        </div>
      )}

      {user.jobseekerProfile?.skills && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-notion-text mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {user.jobseekerProfile.skills.split(',').map((s: string) => (
              <span key={s} className="px-3 py-1 rounded-md text-sm font-medium bg-notion-blue-bg text-notion-blue">{s.trim()}</span>
            ))}
          </div>
        </div>
      )}

      {user.jobseekerProfile?.experience && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-notion-text mb-3">Experience</h3>
          {JSON.parse(user.jobseekerProfile.experience).map((exp: any, i: number) => (
            <div key={i} className="flex gap-3 pb-4 border-b border-notion-border-light last:border-b-0 mb-2">
              <div className="w-10 h-10 rounded-lg bg-notion-bg-tertiary flex items-center justify-center text-notion-text-tertiary flex-shrink-0"><Briefcase size={18} /></div>
              <div>
                <h4 className="text-sm font-semibold text-notion-text">{exp.title}</h4>
                <p className="text-sm text-notion-text-secondary">{exp.company} · {exp.duration}</p>
                {exp.description && <p className="text-sm mt-1 text-notion-text-secondary">{exp.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {user.jobseekerProfile?.education && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-notion-text mb-3">Education</h3>
          {JSON.parse(user.jobseekerProfile.education).map((edu: any, i: number) => (
            <div key={i} className="flex gap-3 pb-4 border-b border-notion-border-light last:border-b-0 mb-2">
              <div className="w-10 h-10 rounded-lg bg-notion-bg-tertiary flex items-center justify-center text-notion-text-tertiary flex-shrink-0"><GraduationCap size={18} /></div>
              <div>
                <h4 className="text-sm font-semibold text-notion-text">{edu.degree}</h4>
                <p className="text-sm text-notion-text-secondary">{edu.school} · {edu.year}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
