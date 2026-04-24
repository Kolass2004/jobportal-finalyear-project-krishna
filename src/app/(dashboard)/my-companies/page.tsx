'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/Toast';
import {
  Building2, Plus, MapPin, Globe, Users, Briefcase, Pencil,
  Trash2, X, AlertTriangle, Loader2, Save, Calendar
} from 'lucide-react';
import Link from 'next/link';

interface CompanyForm {
  name: string;
  description: string;
  website: string;
  location: string;
  industry: string;
  size: string;
  foundedYear: string;
}

const emptyForm: CompanyForm = {
  name: '', description: '', website: '', location: '',
  industry: '', size: '', foundedYear: '',
};

const sizeOptions = [
  { value: '', label: 'Select size...' },
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

export default function MyCompaniesPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    const res = await fetch('/api/companies');
    const data = await res.json();
    // Filter only current user's companies
    const mine = data.filter((c: any) => c.recruiterId === session?.user?.id);
    setCompanies(mine);
    setLoading(false);
  };

  useEffect(() => {
    if (session?.user?.id) fetchCompanies();
  }, [session]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (company: any) => {
    setEditingId(company.id);
    setForm({
      name: company.name || '',
      description: company.description || '',
      website: company.website || '',
      location: company.location || '',
      industry: company.industry || '',
      size: company.size || '',
      foundedYear: company.foundedYear?.toString() || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      addToast('Company name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/companies/${editingId}` : '/api/companies';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        addToast(editingId ? 'Company updated!' : 'Company created!', 'success');
        closeModal();
        fetchCompanies();
      } else {
        const data = await res.json();
        addToast(data.error || 'Something went wrong', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/companies/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        setCompanies(prev => prev.filter(c => c.id !== deleteTarget.id));
        addToast(`${deleteTarget.name} deleted`, 'success');
      } else {
        const data = await res.json();
        addToast(data.error || 'Failed to delete', 'error');
      }
    } catch {
      addToast('Failed to delete company', 'error');
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const updateField = (field: keyof CompanyForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-notion-text mb-2">My Companies</h1>
          <p className="text-notion-text-secondary">{companies.length} {companies.length === 1 ? 'company' : 'companies'} registered</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> New Company
        </button>
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
      ) : companies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companies.map((company) => (
            <div
              key={company.id}
              className="flex gap-4 items-start p-5 border border-notion-border rounded-lg bg-notion-bg hover:shadow-md transition-all group"
            >
              <div className="w-14 h-14 rounded-lg bg-notion-bg-tertiary border border-notion-border-light flex items-center justify-center text-notion-blue font-bold text-xl flex-shrink-0">
                {company.name?.[0] || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/companies/${company.id}`} className="text-[15px] font-semibold text-notion-text hover:text-notion-blue transition-colors mb-1 block">
                    {company.name}
                  </Link>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(company)}
                      className="p-1.5 rounded-md text-notion-text-tertiary hover:text-notion-blue hover:bg-notion-blue-bg transition-colors"
                      title="Edit company"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(company)}
                      className="p-1.5 rounded-md text-notion-text-tertiary hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete company"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {company.description && (
                  <p className="text-sm text-notion-text-secondary line-clamp-2 mb-2">{company.description}</p>
                )}
                <div className="flex flex-wrap gap-3 text-xs text-notion-text-tertiary">
                  {company.location && <span className="flex items-center gap-1"><MapPin size={12} /> {company.location}</span>}
                  {company.industry && <span className="flex items-center gap-1"><Building2 size={12} /> {company.industry}</span>}
                  {company.size && <span className="flex items-center gap-1"><Users size={12} /> {company.size}</span>}
                  {company.foundedYear && <span className="flex items-center gap-1"><Calendar size={12} /> Est. {company.foundedYear}</span>}
                  <span className="flex items-center gap-1"><Briefcase size={12} /> {company._count?.jobs || 0} jobs</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Building2 size={48} className="mx-auto mb-4 text-notion-text-tertiary opacity-30" />
          <h3 className="text-lg font-semibold text-notion-text mb-2">No companies yet</h3>
          <p className="text-sm text-notion-text-secondary mb-6">Create your first company to start posting jobs.</p>
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Create Company
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !saving && closeModal()} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-notion-border px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-lg font-semibold text-notion-text">
                {editingId ? 'Edit Company' : 'New Company'}
              </h2>
              <button onClick={() => !saving && closeModal()} className="p-1 text-notion-text-tertiary hover:text-notion-text rounded-md transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-notion-text mb-1">Company Name *</label>
                <input
                  value={form.name}
                  onChange={e => updateField('name', e.target.value)}
                  className="notion-input"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-notion-text mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => updateField('description', e.target.value)}
                  className="notion-textarea"
                  placeholder="What does your company do?"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-notion-text mb-1">Location</label>
                  <input
                    value={form.location}
                    onChange={e => updateField('location', e.target.value)}
                    className="notion-input"
                    placeholder="e.g. Bengaluru, Karnataka"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-notion-text mb-1">Industry</label>
                  <input
                    value={form.industry}
                    onChange={e => updateField('industry', e.target.value)}
                    className="notion-input"
                    placeholder="e.g. Information Technology"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-notion-text mb-1">Company Size</label>
                  <select
                    value={form.size}
                    onChange={e => updateField('size', e.target.value)}
                    className="notion-select"
                  >
                    {sizeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-notion-text mb-1">Founded Year</label>
                  <input
                    type="number"
                    value={form.foundedYear}
                    onChange={e => updateField('foundedYear', e.target.value)}
                    className="notion-input"
                    placeholder="e.g. 2020"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-notion-text mb-1">Website</label>
                <input
                  value={form.website}
                  onChange={e => updateField('website', e.target.value)}
                  className="notion-input"
                  placeholder="https://www.example.com"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-notion-border px-6 py-4 flex justify-end gap-3 rounded-b-xl">
              <button onClick={closeModal} disabled={saving} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {editingId ? 'Save Changes' : 'Create Company'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <button onClick={() => !deleting && setDeleteTarget(null)} className="absolute top-4 right-4 p-1 text-notion-text-tertiary hover:text-notion-text rounded-md transition-colors">
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-notion-text">Delete Company</h2>
            </div>

            <p className="text-sm text-notion-text-secondary mb-2">
              Are you sure you want to delete <strong className="text-notion-text">{deleteTarget.name}</strong>?
            </p>
            <p className="text-xs text-red-500 mt-3 mb-6">
              This will permanently delete the company and all its job postings, including any associated applications.
            </p>

            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="btn-secondary">Cancel</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleting ? <div className="spinner w-4 h-4 border-2 border-white/30 border-t-white" /> : <Trash2 size={14} />}
                Delete Company
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
