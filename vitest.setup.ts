import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Next Auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: { user: { id: 'test-id', name: 'Test User', role: 'ADMIN' } },
    status: 'authenticated',
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Global fetch mock placeholder if needed
global.fetch = vi.fn();
