'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './Toast';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
