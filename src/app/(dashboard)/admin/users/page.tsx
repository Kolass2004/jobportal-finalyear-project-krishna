'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/Toast';
import { Search, Trash2, AlertTriangle, X } from 'lucide-react';

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
        addToast(`${deleteTarget.name} has been deleted`, 'success');
      } else {
        addToast(data.error || 'Failed to delete user', 'error');
      }
    } catch {
      addToast('Failed to delete user', 'error');
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const initials = (name: string) => name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const roleBadge = (role: string) => {
    if (role === 'ADMIN') return 'bg-notion-red-bg text-notion-red';
    if (role === 'RECRUITER') return 'bg-notion-purple-bg text-notion-purple';
    return 'bg-notion-blue-bg text-notion-blue';
  };

  const isCurrentUser = (userId: string) => session?.user?.id === userId;

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
                    <div className="flex items-center gap-2">
                      <select value={u.role} onChange={e => updateRole(u.id, e.target.value)} className="notion-select text-xs py-1 w-auto">
                        <option value="JOBSEEKER">Jobseeker</option>
                        <option value="RECRUITER">Recruiter</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      <button
                        onClick={() => setDeleteTarget(u)}
                        disabled={isCurrentUser(u.id)}
                        title={isCurrentUser(u.id) ? "You can't delete yourself" : `Delete ${u.name}`}
                        className={`p-1.5 rounded-md transition-colors ${
                          isCurrentUser(u.id)
                            ? 'text-notion-text-tertiary/40 cursor-not-allowed'
                            : 'text-notion-text-tertiary hover:text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95">
            <button onClick={() => !deleting && setDeleteTarget(null)} className="absolute top-4 right-4 p-1 text-notion-text-tertiary hover:text-notion-text rounded-md transition-colors">
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-notion-text">Delete User</h2>
            </div>

            <p className="text-sm text-notion-text-secondary mb-2">
              Are you sure you want to delete <strong className="text-notion-text">{deleteTarget.name}</strong>?
            </p>
            <p className="text-sm text-notion-text-tertiary mb-1">
              <span className="text-notion-text-secondary">{deleteTarget.email}</span> · <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${roleBadge(deleteTarget.role)}`}>{deleteTarget.role}</span>
            </p>
            <p className="text-xs text-red-500 mt-3 mb-6">
              This action is permanent and will remove all their data including jobs, applications, posts, and messages.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleting ? (
                  <div className="spinner w-4 h-4 border-2 border-white/30 border-t-white" />
                ) : (
                  <Trash2 size={14} />
                )}
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

