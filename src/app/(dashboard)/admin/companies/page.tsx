'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';
import { Building2, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminCompaniesPage() {
  const { addToast } = useToast();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/companies').then(r => r.json()).then(setCompanies).finally(() => setLoading(false));
  }, []);

  const deleteCompany = async (id: string) => {
    if (!confirm('Delete this company and all its jobs?')) return;
    const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCompanies(prev => prev.filter(c => c.id !== id));
      addToast('Company deleted', 'success');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="spinner w-8 h-8 border-[3px]" /></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-notion-text mb-2">Manage Companies</h1>
      <p className="text-notion-text-secondary mb-8">{companies.length} companies registered</p>

      <div className="border border-notion-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-notion-bg-secondary border-b border-notion-border">
              <th className="px-4 py-3 text-left text-xs font-semibold text-notion-text-tertiary uppercase tracking-wider">Company</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-notion-text-tertiary uppercase tracking-wider">Industry</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-notion-text-tertiary uppercase tracking-wider">Location</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-notion-text-tertiary uppercase tracking-wider">Jobs</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-notion-text-tertiary uppercase tracking-wider">Owner</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-notion-text-tertiary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(c => (
              <tr key={c.id} className="border-b border-notion-border-light hover:bg-notion-bg-hover">
                <td className="px-4 py-3">
                  <Link href={`/companies/${c.id}`} className="flex items-center gap-2 text-sm font-medium text-notion-text hover:text-notion-blue">
                    <div className="w-8 h-8 rounded-lg bg-notion-bg-tertiary flex items-center justify-center text-notion-blue font-bold text-sm">{c.name[0]}</div>
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-notion-text-secondary">{c.industry || '-'}</td>
                <td className="px-4 py-3 text-sm text-notion-text-secondary">{c.location || '-'}</td>
                <td className="px-4 py-3 text-sm text-notion-text-secondary">{c._count?.jobs || 0}</td>
                <td className="px-4 py-3 text-sm text-notion-text-secondary">{c.recruiter?.name}</td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteCompany(c.id)} className="p-1.5 rounded-md hover:bg-notion-red-bg text-notion-red"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
