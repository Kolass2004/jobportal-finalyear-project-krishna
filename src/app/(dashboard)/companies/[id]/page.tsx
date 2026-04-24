'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Globe, Users, Calendar, Building2, Briefcase, Clock, ExternalLink } from 'lucide-react';

export default function CompanyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/companies/${id}`).then(r => r.json()).then(setCompany).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="spinner w-8 h-8 border-[3px]" /></div>;
  if (!company) return <div className="text-center py-16"><h2 className="text-xl font-semibold">Company not found</h2></div>;

  return (
    <div className="max-w-[800px]">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-notion-text-secondary text-sm mb-5 hover:text-notion-text">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div className="flex items-start gap-5 mb-8 pb-6 border-b border-notion-border">
        <div className="w-16 h-16 rounded-xl bg-notion-bg-tertiary border border-notion-border-light flex items-center justify-center text-notion-blue font-bold text-2xl flex-shrink-0">
          {company.name?.[0]}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-notion-text mb-1">{company.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-notion-text-tertiary">
            {company.location && <span className="flex items-center gap-1"><MapPin size={14} /> {company.location}</span>}
            {company.industry && <span className="flex items-center gap-1"><Building2 size={14} /> {company.industry}</span>}
            {company.size && <span className="flex items-center gap-1"><Users size={14} /> {company.size} employees</span>}
            {company.foundedYear && <span className="flex items-center gap-1"><Calendar size={14} /> Founded {company.foundedYear}</span>}
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener" className="flex items-center gap-1 text-notion-blue hover:underline">
                <Globe size={14} /> Website <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* About */}
      {company.description && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-notion-text mb-3">About</h2>
          <p className="text-notion-text-secondary leading-relaxed whitespace-pre-wrap">{company.description}</p>
        </div>
      )}

      {/* Open Positions */}
      <div>
        <h2 className="text-lg font-semibold text-notion-text mb-4">Open Positions ({company.jobs?.length || 0})</h2>
        <div className="space-y-3">
          {company.jobs?.map((job: any) => (
            <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center gap-4 p-4 border border-notion-border rounded-lg hover:shadow-md hover:border-notion-blue transition-all group bg-notion-bg">
              <div className="flex-1">
                <h3 className="text-[15px] font-semibold text-notion-text group-hover:text-notion-blue">{job.title}</h3>
                <div className="flex gap-3 text-xs text-notion-text-tertiary mt-1">
                  <span>{job.type?.replace('_', ' ')}</span>
                  <span>{job.location || 'Remote'}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <span className="text-xs text-notion-text-tertiary">{job._count?.applications || 0} applicants</span>
            </Link>
          ))}
          {(!company.jobs || company.jobs.length === 0) && (
            <p className="text-sm text-notion-text-tertiary text-center py-8">No open positions at the moment</p>
          )}
        </div>
      </div>
    </div>
  );
}
