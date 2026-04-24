import { POST } from '@/app/api/jobs/[id]/apply/route';
import { NextRequest } from 'next/server';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

vi.mock('@/lib/prisma', () => ({
  default: {
    job: { findUnique: vi.fn() },
    application: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn() },
    notification: { create: vi.fn() }
  }
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('/api/jobs/[id]/applications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('allows jobseeker to apply', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: 'u1', role: 'JOBSEEKER', name: 'User 1' } } as any);
      vi.mocked(prisma.job.findUnique).mockResolvedValue({ id: 'j1', title: 'Dev', recruiterId: 'r1', status: 'ACTIVE' } as any);
      vi.mocked(prisma.application.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.application.create).mockResolvedValue({ id: 'app1' } as any);

      const req = new NextRequest('http://localhost/api/jobs/j1/applications', {
        method: 'POST',
        body: JSON.stringify({ coverLetter: 'Hi!' })
      });

      const res = await POST(req, { params: Promise.resolve({ id: 'j1' }) });
      expect(res.status).toBe(201);
      expect(prisma.application.create).toBeCalled();
      expect(prisma.notification.create).toBeCalled();
    });

    it('prevents duplicate applications', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: 'u1', role: 'JOBSEEKER' } } as any);
      vi.mocked(prisma.job.findUnique).mockResolvedValue({ id: 'j1', title: 'Dev', status: 'ACTIVE' } as any);
      vi.mocked(prisma.application.findUnique).mockResolvedValue({ id: 'app1' } as any); // Already applied

      const req = new NextRequest('http://localhost/api/jobs/j1/applications', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const res = await POST(req, { params: Promise.resolve({ id: 'j1' }) });
      expect(res.status).toBe(400);
    });
  });
});
