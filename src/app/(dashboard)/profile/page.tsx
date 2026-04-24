'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/Toast';
import { User, MapPin, Mail, Phone, Globe, Briefcase, GraduationCap, Loader2, Save } from 'lucide-react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});

  const role = (session?.user as any)?.role;

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/users/${session.user.id}`).then(r => r.json()).then(data => {
        setUser(data);
        setForm({
          name: data.name || '',
          bio: data.bio || '',
          phone: data.phone || '',
          location: data.location || '',
          headline: data.jobseekerProfile?.headline || '',
          skills: data.jobseekerProfile?.skills || '',
          portfolioUrl: data.jobseekerProfile?.portfolioUrl || '',
        });
      }).finally(() => setLoading(false));
    }
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/users/${session?.user?.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      addToast('Profile updated!', 'success');
      setEditing(false);
      const updated = await fetch(`/api/users/${session?.user?.id}`).then(r => r.json());
      setUser(updated);
    } else {
      addToast('Failed to update profile', 'error');
    }
    setSaving(false);
  };

  const initials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="spinner w-8 h-8 border-[3px]" /></div>;

  return (
    <div className="max-w-[700px]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-notion-text">My Profile</h1>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="btn-primary">Edit Profile</button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save
            </button>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start gap-5 pb-6 border-b border-notion-border mb-6">
        <div className="w-20 h-20 rounded-full bg-notion-blue-bg text-notion-blue flex items-center justify-center text-2xl font-bold flex-shrink-0">
          {initials(user?.name)}
        </div>
        <div className="flex-1">
          {editing ? (
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="notion-input text-xl font-bold mb-2" />
          ) : (
            <h2 className="text-2xl font-bold tracking-tight text-notion-text mb-1">{user?.name}</h2>
          )}
          {role === 'JOBSEEKER' && (
            editing ? (
              <input value={form.headline} onChange={e => setForm({...form, headline: e.target.value})} className="notion-input text-sm mb-2" placeholder="Your headline, e.g. Full-Stack Developer" />
            ) : (
              <p className="text-notion-text-secondary mb-2">{user?.jobseekerProfile?.headline || 'No headline set'}</p>
            )
          )}
          <div className="flex flex-wrap gap-3 text-sm text-notion-text-tertiary">
            <span className="flex items-center gap-1"><Mail size={14} /> {user?.email}</span>
            {user?.location && <span className="flex items-center gap-1"><MapPin size={14} /> {user?.location}</span>}
            {user?.phone && <span className="flex items-center gap-1"><Phone size={14} /> {user?.phone}</span>}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-notion-text mb-3">About</h3>
        {editing ? (
          <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="notion-textarea" placeholder="Tell us about yourself..." />
        ) : (
          <p className="text-notion-text-secondary leading-relaxed">{user?.bio || 'No bio added yet'}</p>
        )}
      </div>

      {/* Contact */}
      {editing && (
        <div className="mb-8 space-y-4">
          <h3 className="text-lg font-semibold text-notion-text mb-3">Contact Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-notion-text mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="notion-input" placeholder="+1-555-0000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-notion-text mb-1">Location</label>
              <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="notion-input" placeholder="City, State" />
            </div>
          </div>
        </div>
      )}

      {/* Jobseeker Details */}
      {role === 'JOBSEEKER' && (
        <>
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-notion-text mb-3">Skills</h3>
            {editing ? (
              <input value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} className="notion-input" placeholder="React, Node.js, TypeScript (comma-separated)" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {user?.jobseekerProfile?.skills?.split(',').filter(Boolean).map((skill: string) => (
                  <span key={skill} className="px-3 py-1 rounded-md text-sm font-medium bg-notion-blue-bg text-notion-blue">{skill.trim()}</span>
                )) || <span className="text-sm text-notion-text-tertiary">No skills added</span>}
              </div>
            )}
          </div>

          {/* Experience */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-notion-text mb-3">Experience</h3>
            {user?.jobseekerProfile?.experience ? (
              <div className="space-y-4">
                {JSON.parse(user.jobseekerProfile.experience).map((exp: any, i: number) => (
                  <div key={i} className="flex gap-3 pb-4 border-b border-notion-border-light last:border-b-0">
                    <div className="w-10 h-10 rounded-lg bg-notion-bg-tertiary flex items-center justify-center text-notion-text-tertiary flex-shrink-0">
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-notion-text">{exp.title}</h4>
                      <p className="text-sm text-notion-text-secondary">{exp.company}</p>
                      <p className="text-xs text-notion-text-tertiary">{exp.duration}</p>
                      {exp.description && <p className="text-sm mt-1 text-notion-text-secondary">{exp.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-notion-text-tertiary">No experience added</p>}
          </div>

          {/* Education */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-notion-text mb-3">Education</h3>
            {user?.jobseekerProfile?.education ? (
              <div className="space-y-4">
                {JSON.parse(user.jobseekerProfile.education).map((edu: any, i: number) => (
                  <div key={i} className="flex gap-3 pb-4 border-b border-notion-border-light last:border-b-0">
                    <div className="w-10 h-10 rounded-lg bg-notion-bg-tertiary flex items-center justify-center text-notion-text-tertiary flex-shrink-0">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-notion-text">{edu.degree}</h4>
                      <p className="text-sm text-notion-text-secondary">{edu.school}</p>
                      <p className="text-xs text-notion-text-tertiary">{edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-notion-text-tertiary">No education added</p>}
          </div>

          {editing && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-notion-text mb-1">Portfolio URL</label>
              <input value={form.portfolioUrl} onChange={e => setForm({...form, portfolioUrl: e.target.value})} className="notion-input" placeholder="https://your-portfolio.com" />
            </div>
          )}
        </>
      )}

      {/* Recruiter Companies */}
      {role === 'RECRUITER' && user?.companies?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-notion-text mb-3">My Companies</h3>
          <div className="space-y-2">
            {user.companies.map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 p-3 border border-notion-border rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-notion-bg-tertiary flex items-center justify-center text-notion-blue font-bold text-sm">{c.name[0]}</div>
                <span className="text-sm font-medium text-notion-text">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
