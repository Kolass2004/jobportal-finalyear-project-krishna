'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';
import { Users, Search, Shield, Briefcase, User } from 'lucide-react';

export default function AdminUsersPage() {
  const { addToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(search)}`);
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const updateRole = async (userId: string, role: string) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      addToast('User role updated', 'success');
    }
  };

  const initials = (name: string) => name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const roleBadge = (role: string) => {
    if (role === 'ADMIN') return 'bg-notion-red-bg text-notion-red';
    if (role === 'RECRUITER') return 'bg-notion-purple-bg text-notion-purple';
    return 'bg-notion-blue-bg text-notion-blue';
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-notion-text mb-2">Manage Users</h1>
      <p className="text-notion-text-secondary mb-8">{users.length} users on the platform</p>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-notion-text-tertiary" />
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchUsers()} className="notion-input pl-9" placeholder="Search users..." />
        </div>
        <button onClick={fetchUsers} className="btn-primary"><Search size={16} /></button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]"><div className="spinner w-8 h-8 border-[3px]" /></div>
      ) : (
        <div className="border border-notion-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-notion-bg-secondary border-b border-notion-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-notion-text-tertiary uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-notion-text-tertiary uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-notion-text-tertiary uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-notion-text-tertiary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-notion-border-light hover:bg-notion-bg-hover transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-notion-blue-bg text-notion-blue flex items-center justify-center text-xs font-semibold">{initials(u.name)}</div>
                      <span className="text-sm font-medium text-notion-text">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-notion-text-secondary">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${roleBadge(u.role)}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={u.role} onChange={e => updateRole(u.id, e.target.value)} className="notion-select text-xs py-1 w-auto">
                      <option value="JOBSEEKER">Jobseeker</option>
                      <option value="RECRUITER">Recruiter</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12 text-notion-text-tertiary">No users found</div>
          )}
        </div>
      )}
    </div>
  );
}
