'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-notion-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner w-8 h-8 border-[3px]" />
          <p className="text-sm text-notion-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen bg-notion-bg">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-[260px] min-h-screen">
        <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
