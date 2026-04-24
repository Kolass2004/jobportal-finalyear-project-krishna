'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Building2, MapPin, Globe, Users, Briefcase } from 'lucide-react';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCompanies = async () => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`/api/companies${params}`);
    const data = await res.json();
    setCompanies(data);
    setLoading(false);
  };

  useEffect(() => { fetchCompanies(); }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-notion-text mb-2">Companies</h1>
      <p className="text-notion-text-secondary mb-8">Explore companies hiring on HireFlow</p>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-notion-text-tertiary" />
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchCompanies()}
            className="notion-input pl-9" placeholder="Search companies..."
          />
        </div>
        <button onClick={fetchCompanies} className="btn-primary"><Search size={16} /> Search</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-notion-border rounded-lg p-5">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-lg skeleton" />
                <div className="flex-1"><div className="h-4 w-3/4 skeleton mb-2" /><div className="h-3 w-full skeleton" /></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.id}`}
              className="flex gap-4 items-start p-5 border border-notion-border rounded-lg bg-notion-bg hover:shadow-md hover:border-notion-blue transition-all group"
            >
              <div className="w-14 h-14 rounded-lg bg-notion-bg-tertiary border border-notion-border-light flex items-center justify-center text-notion-blue font-bold text-xl flex-shrink-0">
                {company.name?.[0] || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-semibold text-notion-text group-hover:text-notion-blue transition-colors mb-1">{company.name}</h3>
                {company.description && (
                  <p className="text-sm text-notion-text-secondary line-clamp-2 mb-2">{company.description}</p>
                )}
                <div className="flex flex-wrap gap-3 text-xs text-notion-text-tertiary">
                  {company.location && <span className="flex items-center gap-1"><MapPin size={12} /> {company.location}</span>}
                  {company.industry && <span className="flex items-center gap-1"><Building2 size={12} /> {company.industry}</span>}
                  {company.size && <span className="flex items-center gap-1"><Users size={12} /> {company.size} employees</span>}
                  <span className="flex items-center gap-1"><Briefcase size={12} /> {company._count?.jobs || 0} open jobs</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && companies.length === 0 && (
        <div className="text-center py-16">
          <Building2 size={40} className="mx-auto mb-4 text-notion-text-tertiary opacity-40" />
          <h3 className="text-lg font-semibold text-notion-text mb-2">No companies found</h3>
          <p className="text-sm text-notion-text-secondary">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
