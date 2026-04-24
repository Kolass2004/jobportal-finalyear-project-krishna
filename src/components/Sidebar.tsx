'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from './ThemeProvider';
import {
  Home, Briefcase, Building2, Rss, MessageSquare, User, Settings,
  LogOut, Sun, Moon, ChevronLeft, LayoutDashboard, Users, BookmarkCheck,
  FileText, Menu, X, Zap
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggle } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = (session?.user as any)?.role || 'JOBSEEKER';
  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';

  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const jobseekerLinks = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/jobs', label: 'Browse Jobs', icon: Briefcase },
    { href: '/companies', label: 'Companies', icon: Building2 },
    { href: '/applications', label: 'My Applications', icon: FileText },
    { href: '/saved-jobs', label: 'Saved Jobs', icon: BookmarkCheck },
    { href: '/feed', label: 'Feed', icon: Rss },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const recruiterLinks = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/my-jobs', label: 'My Job Posts', icon: Briefcase },
    { href: '/jobs/new', label: 'Post a Job', icon: Zap },
    { href: '/my-companies', label: 'My Companies', icon: Building2 },
    { href: '/companies', label: 'Browse Companies', icon: Building2 },
    { href: '/feed', label: 'Feed', icon: Rss },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const adminLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Manage Users', icon: Users },
    { href: '/admin/jobs', label: 'Manage Jobs', icon: Briefcase },
    { href: '/admin/companies', label: 'Manage Companies', icon: Building2 },
    { href: '/jobs', label: 'Browse Jobs', icon: Briefcase },
    { href: '/feed', label: 'Feed', icon: Rss },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
  ];

  const links = role === 'ADMIN' ? adminLinks : role === 'RECRUITER' ? recruiterLinks : jobseekerLinks;

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-[150] p-2 rounded-lg bg-notion-bg border border-notion-border shadow-sm md:hidden"
      >
        <Menu size={18} />
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[190] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-[200] flex flex-col bg-notion-sidebar border-r border-notion-border transition-all duration-200 overflow-y-auto overflow-x-hidden
          ${collapsed ? 'w-[60px]' : 'w-[260px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between min-h-[45px] ${collapsed ? 'px-2 py-3' : 'px-4 py-3'}`}>
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-[15px] text-notion-text tracking-tight">
              <div className="w-6 h-6 bg-notion-blue rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                H
              </div>
              HireFlow
            </Link>
          )}
          <button
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
            className="p-1 rounded hover:bg-notion-bg-hover text-notion-text-tertiary hidden md:flex"
          >
            <ChevronLeft size={16} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded hover:bg-notion-bg-hover text-notion-text-tertiary md:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-1">
          {!collapsed && (
            <div className="px-3 py-2 text-[11px] font-semibold text-notion-text-tertiary uppercase tracking-wider">
              {role === 'ADMIN' ? 'Admin' : role === 'RECRUITER' ? 'Recruiting' : 'Job Search'}
            </div>
          )}
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? link.label : undefined}
              >
                <span className="flex items-center justify-center w-5 h-5 flex-shrink-0 opacity-70">
                  <Icon size={18} />
                </span>
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`mt-auto border-t border-notion-border ${collapsed ? 'p-2' : 'p-2'}`}>
          <button onClick={toggle} className={`sidebar-item ${collapsed ? 'justify-center px-2' : ''}`} title="Toggle theme">
            <span className="flex items-center justify-center w-5 h-5 flex-shrink-0 opacity-70">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </span>
            {!collapsed && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
          </button>

          <button onClick={() => signOut({ callbackUrl: '/login' })} className={`sidebar-item text-notion-red ${collapsed ? 'justify-center px-2' : ''}`} title="Sign out">
            <span className="flex items-center justify-center w-5 h-5 flex-shrink-0 opacity-70">
              <LogOut size={18} />
            </span>
            {!collapsed && <span>Sign Out</span>}
          </button>

          {/* User info */}
          <Link
            href="/profile"
            className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors hover:bg-notion-bg-hover mt-1 ${collapsed ? 'justify-center px-2' : ''}`}
          >
            {(session?.user as any)?.image ? (
              <img src={(session?.user as any)?.image} alt={userName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-notion-blue-bg text-notion-blue flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {initials}
              </div>
            )}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-notion-text truncate">{userName}</div>
                <div className="text-[11px] text-notion-text-tertiary truncate">{userEmail}</div>
              </div>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}
