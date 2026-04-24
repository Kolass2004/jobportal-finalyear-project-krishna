'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Clock, Briefcase, Wifi, Filter, X } from 'lucide-react';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [remote, setRemote] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchJobs = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (type) params.set('type', type);
    if (remote) params.set('remote', remote);
    params.set('page', page.toString());
    params.set('limit', '12');

    const res = await fetch(`/api/jobs?${params}`);
    const data = await res.json();
    setJobs(data.jobs || []);
    setTotal(data.total || 0);
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, [page, type, remote]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-notion-text mb-2">Browse Jobs</h1>
        <p className="text-notion-text-secondary">Find your next opportunity from {total} active positions</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-notion-bg-secondary border border-notion-border rounded-lg p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-notion-text-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, skills, companies..."
              className="notion-input pl-9"
            />
          </div>
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="notion-select w-auto min-w-[140px]">
            <option value="">All Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
          <select value={remote} onChange={(e) => { setRemote(e.target.value); setPage(1); }} className="notion-select w-auto min-w-[120px]">
            <option value="">All Locations</option>
            <option value="true">Remote Only</option>
          </select>
          <button type="submit" className="btn-primary">
            <Search size={16} /> Search
          </button>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-notion-border rounded-lg p-5">
              <div className="flex gap-3 mb-3">
                <div className="w-11 h-11 rounded-lg skeleton" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 skeleton mb-2" />
                  <div className="h-3 w-1/2 skeleton" />
                </div>
              </div>
              <div className="h-3 w-full skeleton mb-2" />
              <div className="h-3 w-2/3 skeleton" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="border border-notion-border rounded-lg p-5 hover:shadow-md hover:border-notion-blue transition-all group bg-notion-bg flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-lg bg-notion-bg-tertiary border border-notion-border-light flex items-center justify-center text-notion-blue font-bold flex-shrink-0">
                    {job.company?.name?.[0] || 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-notion-text group-hover:text-notion-blue transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-sm text-notion-text-secondary">{job.company?.name}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-notion-text-tertiary">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {job.location || 'Remote'}</span>
                  <span className="flex items-center gap-1"><Briefcase size={12} /> {job.type?.replace('_', ' ')}</span>
                  {job.remote && <span className="flex items-center gap-1"><Wifi size={12} /> Remote</span>}
                  <span className="flex items-center gap-1"><Clock size={12} /> {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>

                {job.skills && (
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.split(',').slice(0, 4).map((skill: string) => (
                      <span key={skill} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-notion-blue-bg text-notion-blue">
                        {skill.trim()}
                      </span>
                    ))}
                    {job.skills.split(',').length > 4 && (
                      <span className="text-[11px] text-notion-text-tertiary">+{job.skills.split(',').length - 4} more</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-notion-border-light">
                  {job.salaryMin && job.salaryMax ? (
                    <span className="text-sm font-semibold text-notion-green">
                      ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                    </span>
                  ) : (
                    <span className="text-xs text-notion-text-tertiary">Salary not specified</span>
                  )}
                  <span className="text-xs text-notion-text-tertiary">
                    {job._count?.applications || 0} applicants
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {jobs.length === 0 && (
            <div className="text-center py-16">
              <Briefcase size={40} className="mx-auto mb-4 text-notion-text-tertiary opacity-40" />
              <h3 className="text-lg font-semibold text-notion-text mb-2">No jobs found</h3>
              <p className="text-sm text-notion-text-secondary">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {total > 12 && (
            <div className="flex items-center justify-center gap-1 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-sm disabled:opacity-30">
                Previous
              </button>
              <span className="px-4 py-1.5 text-sm text-notion-text-secondary">
                Page {page} of {Math.ceil(total / 12)}
              </span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 12)} className="btn-ghost text-sm disabled:opacity-30">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
