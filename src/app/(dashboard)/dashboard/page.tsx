'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Building2, Users, FileText, TrendingUp, Clock, BookmarkCheck, Eye, ArrowRight, Zap, Sparkles, Bot, Loader2 } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function DashboardPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const [stats, setStats] = useState<any>(null);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingAdvice, setGeneratingAdvice] = useState(false);
  const [careerAdvice, setCareerAdvice] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, jobsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/jobs?limit=5'),
        ]);
        const statsData = await statsRes.json();
        const jobsData = await jobsRes.json();
        setStats(statsData);
        setRecentJobs(jobsData.jobs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const generateCareerAdvice = async () => {
    setGeneratingAdvice(true);
    try {
      const res = await fetch('/api/profile/ai-career-advice', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setCareerAdvice(data.advice);
        addToast('Career advice generated!', 'success');
      } else {
        addToast(data.error || 'Failed to generate', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
    }
    setGeneratingAdvice(false);
  };

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('### ')) return <h5 key={i} className="font-semibold mt-4 mb-2 text-notion-text">{line.slice(4)}</h5>;
      if (line.startsWith('- ') || line.match(/^\d+\.\s/)) return <li key={i} className="ml-4 list-disc mb-1">{line.replace(/^(- |\d+\.\s)/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>;
      if (line.trim() === '') return <div key={i} className="h-2" />;
      
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="mb-2 leading-relaxed text-notion-text-secondary">
          {parts.map((part, j) => 
            part.startsWith('**') && part.endsWith('**') 
              ? <strong key={j} className="text-notion-text">{part.slice(2, -2)}</strong> 
              : part
          )}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner w-8 h-8 border-[3px]" />
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-notion-text mb-2">
          {greeting()}, {session?.user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-notion-text-secondary">
          {role === 'ADMIN' && 'Here\'s an overview of your platform.'}
          {role === 'RECRUITER' && 'Manage your job postings and find great talent.'}
          {role === 'JOBSEEKER' && 'Discover opportunities that match your skills.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {role === 'ADMIN' && (
          <>
            <StatCard icon={Users} label="Total Users" value={stats?.totalUsers || 0} color="blue" />
            <StatCard icon={Briefcase} label="Active Jobs" value={stats?.activeJobs || 0} color="green" />
            <StatCard icon={Building2} label="Companies" value={stats?.totalCompanies || 0} color="purple" />
            <StatCard icon={FileText} label="Applications" value={stats?.totalApplications || 0} color="orange" />
          </>
        )}
        {role === 'RECRUITER' && (
          <>
            <StatCard icon={Briefcase} label="My Job Posts" value={stats?.myJobs || 0} color="blue" />
            <StatCard icon={FileText} label="Applications" value={stats?.myApplications || 0} color="green" />
            <StatCard icon={Building2} label="My Companies" value={stats?.myCompanies || 0} color="purple" />
            <StatCard icon={Eye} label="Profile Views" value={stats?.profileViews || 0} color="orange" />
          </>
        )}
        {role === 'JOBSEEKER' && (
          <>
            <StatCard icon={FileText} label="Applications" value={stats?.myApplications || 0} color="blue" />
            <StatCard icon={BookmarkCheck} label="Saved Jobs" value={stats?.savedJobs || 0} color="green" />
            <StatCard icon={Briefcase} label="Available Jobs" value={stats?.activeJobs || 0} color="purple" />
            <StatCard icon={TrendingUp} label="Profile Views" value={stats?.profileViews || 0} color="orange" />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-notion-text mb-4 tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {role === 'RECRUITER' && (
            <>
              <QuickAction href="/jobs/new" icon={Zap} title="Post a New Job" desc="Create a job listing" />
              <QuickAction href="/my-jobs" icon={Briefcase} title="Manage Jobs" desc="View and edit your posts" />
              <QuickAction href="/messages" icon={Users} title="Messages" desc="Chat with candidates" />
            </>
          )}
          {role === 'JOBSEEKER' && (
            <>
              <QuickAction href="/jobs" icon={Briefcase} title="Browse Jobs" desc="Find your next role" />
              <QuickAction href="/applications" icon={FileText} title="My Applications" desc="Track your progress" />
              <QuickAction href="/profile" icon={Users} title="Update Profile" desc="Stand out to recruiters" />
            </>
          )}
          {role === 'ADMIN' && (
            <>
              <QuickAction href="/admin/users" icon={Users} title="Manage Users" desc="View all platform users" />
              <QuickAction href="/admin/jobs" icon={Briefcase} title="Moderate Jobs" desc="Review job postings" />
              <QuickAction href="/admin/companies" icon={Building2} title="Companies" desc="Manage company profiles" />
            </>
          )}
        </div>
      </div>

      {/* AI Career Advice */}
      {role === 'JOBSEEKER' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-notion-text tracking-tight">AI Career Counselor</h2>
            <button
              onClick={generateCareerAdvice}
              disabled={generatingAdvice}
              className="text-sm flex items-center gap-2 text-notion-purple font-medium hover:text-notion-purple/80 transition-colors"
            >
              {generatingAdvice ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {generatingAdvice ? 'Analyzing Profile...' : '✨ Get Career Advice'}
            </button>
          </div>
          
          {careerAdvice ? (
            <div className="p-6 bg-notion-purple-bg/30 border border-notion-purple/20 rounded-xl text-sm">
              <div className="flex items-center gap-2 mb-4 text-notion-purple font-semibold text-base">
                <Bot size={20} /> Your Personalized Career Paths
              </div>
              <div className="space-y-1">
                {renderMarkdown(careerAdvice)}
              </div>
            </div>
          ) : (
            <div className="p-6 border border-dashed border-notion-border rounded-xl text-center bg-notion-bg">
              <Sparkles size={24} className="mx-auto mb-3 text-notion-purple/50" />
              <p className="text-sm text-notion-text-secondary mb-2">Want to know what roles you should target next?</p>
              <button onClick={generateCareerAdvice} disabled={generatingAdvice} className="text-sm text-notion-purple font-medium hover:underline">
                Generate AI Career Advice based on your profile
              </button>
            </div>
          )}
        </div>
      )}

      {/* Recent Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-notion-text tracking-tight">Recent Jobs</h2>
          <Link href="/jobs" className="text-sm text-notion-blue hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {recentJobs.map((job: any) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="flex items-center gap-4 p-4 border border-notion-border rounded-lg hover:shadow-md hover:border-notion-blue transition-all group bg-notion-bg"
            >
              <div className="w-11 h-11 rounded-lg bg-notion-bg-tertiary border border-notion-border-light flex items-center justify-center text-notion-blue font-bold text-base flex-shrink-0">
                {job.company?.name?.[0] || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-semibold text-notion-text group-hover:text-notion-blue transition-colors truncate">
                  {job.title}
                </h3>
                <p className="text-sm text-notion-text-secondary truncate">
                  {job.company?.name} · {job.location || 'Remote'} · {job.type?.replace('_', ' ')}
                </p>
              </div>
              <div className="text-right flex-shrink-0 hidden sm:block">
                {job.salaryMin && job.salaryMax && (
                  <p className="text-sm font-semibold text-notion-green">
                    ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                  </p>
                )}
                <p className="text-xs text-notion-text-tertiary flex items-center gap-1 justify-end">
                  <Clock size={12} />
                  {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
          {recentJobs.length === 0 && (
            <div className="text-center py-12 text-notion-text-tertiary">
              <Briefcase size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No jobs posted yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-notion-blue-bg text-notion-blue',
    green: 'bg-notion-green-bg text-notion-green',
    purple: 'bg-notion-purple-bg text-notion-purple',
    orange: 'bg-notion-orange-bg text-notion-orange',
  };

  return (
    <div className="bg-notion-bg border border-notion-border rounded-lg p-5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
      <div className="text-3xl font-bold tracking-tight text-notion-text">{value}</div>
      <div className="text-sm text-notion-text-secondary mt-1">{label}</div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, title, desc }: { href: string; icon: any; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 border border-notion-border rounded-lg hover:shadow-sm hover:border-notion-blue/50 transition-all bg-notion-bg group"
    >
      <div className="w-9 h-9 rounded-lg bg-notion-blue-bg text-notion-blue flex items-center justify-center flex-shrink-0 group-hover:bg-notion-blue group-hover:text-white transition-colors">
        <Icon size={18} />
      </div>
      <div>
        <h3 className="text-sm font-medium text-notion-text">{title}</h3>
        <p className="text-xs text-notion-text-tertiary">{desc}</p>
      </div>
    </Link>
  );
}
