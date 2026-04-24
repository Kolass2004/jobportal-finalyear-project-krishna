'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/Toast';
import { MapPin, Mail, Phone, Briefcase, GraduationCap, Loader2, Save, Plus, Trash2, X } from 'lucide-react';

interface ExperienceEntry {
  title: string;
  company: string;
  duration: string;
  description: string;
}

interface EducationEntry {
  degree: string;
  school: string;
  year: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([]);
  const [educations, setEducations] = useState<EducationEntry[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  const role = (session?.user as any)?.role;

  const parseJsonSafe = (val: string | null | undefined, fallback: any[] = []) => {
    if (!val) return fallback;
    try { return JSON.parse(val); } catch { return fallback; }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/users/${session.user.id}`).then(r => r.json()).then(data => {
        setUser(data);
        const parsedSkills = (data.jobseekerProfile?.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean);
        const parsedExp = parseJsonSafe(data.jobseekerProfile?.experience);
        const parsedEdu = parseJsonSafe(data.jobseekerProfile?.education);
        setSkills(parsedSkills);
        setExperiences(parsedExp);
        setEducations(parsedEdu);
        setForm({
          name: data.name || '',
          bio: data.bio || '',
          phone: data.phone || '',
          location: data.location || '',
          headline: data.jobseekerProfile?.headline || '',
          portfolioUrl: data.jobseekerProfile?.portfolioUrl || '',
        });
      }).finally(() => setLoading(false));
    }
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      skills: skills.join(','),
      experience: JSON.stringify(experiences),
      education: JSON.stringify(educations),
    };
    const res = await fetch(`/api/users/${session?.user?.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      addToast('Profile updated!', 'success');
      setEditing(false);
      const updated = await fetch(`/api/users/${session?.user?.id}`).then(r => r.json());
      setUser(updated);
      setSkills((updated.jobseekerProfile?.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean));
      setExperiences(parseJsonSafe(updated.jobseekerProfile?.experience));
      setEducations(parseJsonSafe(updated.jobseekerProfile?.education));
    } else {
      addToast('Failed to update profile', 'error');
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset to original data
    const parsedSkills = (user?.jobseekerProfile?.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    setSkills(parsedSkills);
    setExperiences(parseJsonSafe(user?.jobseekerProfile?.experience));
    setEducations(parseJsonSafe(user?.jobseekerProfile?.education));
    setSkillInput('');
    setForm({
      name: user?.name || '',
      bio: user?.bio || '',
      phone: user?.phone || '',
      location: user?.location || '',
      headline: user?.jobseekerProfile?.headline || '',
      portfolioUrl: user?.jobseekerProfile?.portfolioUrl || '',
    });
  };

  // Skills helpers
  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    } else if (e.key === 'Backspace' && skillInput === '' && skills.length > 0) {
      removeSkill(skills.length - 1);
    }
  };

  // Experience helpers
  const addExperience = () => {
    setExperiences([...experiences, { title: '', company: '', duration: '', description: '' }]);
  };

  const updateExperience = (index: number, field: keyof ExperienceEntry, value: string) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  // Education helpers
  const addEducation = () => {
    setEducations([...educations, { degree: '', school: '', year: '' }]);
  };

  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: value };
    setEducations(updated);
  };

  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
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
            <button onClick={handleCancel} className="btn-secondary">Cancel</button>
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
          {/* Skills */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-notion-text mb-3">Skills</h3>
            {editing ? (
              <div>
                <div className="flex flex-wrap gap-2 p-3 border border-notion-border rounded-lg bg-white min-h-[44px] cursor-text focus-within:border-notion-blue focus-within:ring-1 focus-within:ring-notion-blue transition-all"
                  onClick={() => document.getElementById('skill-input')?.focus()}
                >
                  {skills.map((skill, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-medium bg-notion-blue-bg text-notion-blue">
                      {skill}
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeSkill(i); }}
                        className="hover:bg-notion-blue/20 rounded-full p-0.5 transition-colors">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    id="skill-input"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    onBlur={() => { if (skillInput.trim()) addSkill(); }}
                    className="flex-1 min-w-[120px] outline-none border-none text-sm bg-transparent text-notion-text placeholder:text-notion-text-tertiary"
                    placeholder={skills.length === 0 ? "Type a skill and press Enter..." : "Add more..."}
                  />
                </div>
                <p className="text-xs text-notion-text-tertiary mt-1.5">Press Enter or comma to add a skill. Backspace to remove the last.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 rounded-md text-sm font-medium bg-notion-blue-bg text-notion-blue">{skill}</span>
                )) : <span className="text-sm text-notion-text-tertiary">No skills added</span>}
              </div>
            )}
          </div>

          {/* Experience */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-notion-text">Experience</h3>
              {editing && (
                <button onClick={addExperience} className="inline-flex items-center gap-1 text-sm font-medium text-notion-blue hover:text-notion-blue/80 transition-colors">
                  <Plus size={16} /> Add
                </button>
              )}
            </div>
            {editing ? (
              experiences.length > 0 ? (
                <div className="space-y-4">
                  {experiences.map((exp, i) => (
                    <div key={i} className="relative p-4 border border-notion-border rounded-lg bg-notion-bg-secondary">
                      <button onClick={() => removeExperience(i)}
                        className="absolute top-3 right-3 p-1.5 text-notion-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Remove experience">
                        <Trash2 size={14} />
                      </button>
                      <div className="grid grid-cols-2 gap-3 pr-8">
                        <div>
                          <label className="block text-xs font-medium text-notion-text-secondary mb-1">Job Title *</label>
                          <input value={exp.title} onChange={e => updateExperience(i, 'title', e.target.value)}
                            className="notion-input text-sm" placeholder="e.g. Software Engineer" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-notion-text-secondary mb-1">Company *</label>
                          <input value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)}
                            className="notion-input text-sm" placeholder="e.g. Google" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-notion-text-secondary mb-1">Duration</label>
                          <input value={exp.duration} onChange={e => updateExperience(i, 'duration', e.target.value)}
                            className="notion-input text-sm" placeholder="e.g. 2023-Present" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-notion-text-secondary mb-1">Description</label>
                          <input value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)}
                            className="notion-input text-sm" placeholder="What you did..." />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <button onClick={addExperience}
                  className="w-full py-8 border-2 border-dashed border-notion-border rounded-lg text-notion-text-tertiary hover:text-notion-blue hover:border-notion-blue/40 hover:bg-notion-blue-bg/30 transition-all flex flex-col items-center gap-2">
                  <Plus size={20} />
                  <span className="text-sm font-medium">Add your first experience</span>
                </button>
              )
            ) : (
              experiences.length > 0 ? (
                <div className="space-y-4">
                  {experiences.map((exp, i) => (
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
              ) : <p className="text-sm text-notion-text-tertiary">No experience added</p>
            )}
          </div>

          {/* Education */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-notion-text">Education</h3>
              {editing && (
                <button onClick={addEducation} className="inline-flex items-center gap-1 text-sm font-medium text-notion-blue hover:text-notion-blue/80 transition-colors">
                  <Plus size={16} /> Add
                </button>
              )}
            </div>
            {editing ? (
              educations.length > 0 ? (
                <div className="space-y-4">
                  {educations.map((edu, i) => (
                    <div key={i} className="relative p-4 border border-notion-border rounded-lg bg-notion-bg-secondary">
                      <button onClick={() => removeEducation(i)}
                        className="absolute top-3 right-3 p-1.5 text-notion-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Remove education">
                        <Trash2 size={14} />
                      </button>
                      <div className="grid grid-cols-3 gap-3 pr-8">
                        <div>
                          <label className="block text-xs font-medium text-notion-text-secondary mb-1">Degree *</label>
                          <input value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)}
                            className="notion-input text-sm" placeholder="e.g. B.S. Computer Science" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-notion-text-secondary mb-1">School *</label>
                          <input value={edu.school} onChange={e => updateEducation(i, 'school', e.target.value)}
                            className="notion-input text-sm" placeholder="e.g. MIT" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-notion-text-secondary mb-1">Year</label>
                          <input value={edu.year} onChange={e => updateEducation(i, 'year', e.target.value)}
                            className="notion-input text-sm" placeholder="e.g. 2023" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <button onClick={addEducation}
                  className="w-full py-8 border-2 border-dashed border-notion-border rounded-lg text-notion-text-tertiary hover:text-notion-blue hover:border-notion-blue/40 hover:bg-notion-blue-bg/30 transition-all flex flex-col items-center gap-2">
                  <Plus size={20} />
                  <span className="text-sm font-medium">Add your first education</span>
                </button>
              )
            ) : (
              educations.length > 0 ? (
                <div className="space-y-4">
                  {educations.map((edu, i) => (
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
              ) : <p className="text-sm text-notion-text-tertiary">No education added</p>
            )}
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
