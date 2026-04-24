import { GET, PUT, DELETE } from '@/app/api/jobs/[id]/route';
import { GET as GET_ALL, POST } from '@/app/api/jobs/route';
import { NextRequest } from 'next/server';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

vi.mock('@/lib/prisma', () => ({
  default: {
    job: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    company: {
      findFirst: vi.fn(),
    },
    application: {
      findUnique: vi.fn(),
    },
    savedJob: {
      findUnique: vi.fn(),
    }
  }
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('/api/jobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET All', () => {
    it('returns jobs list', async () => {
      const mockJobs = [{ id: '1', title: 'Test Job' }];
      vi.mocked(prisma.job.findMany).mockResolvedValue(mockJobs as any);

      const req = new NextRequest('http://localhost:3000/api/jobs');
      const res = await GET_ALL(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.jobs).toEqual(mockJobs);
    });
  });

  describe('POST', () => {
    it('creates a job if recruiter', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: 'user1', role: 'RECRUITER' } } as any);
      const newJob = { id: '1', title: 'New Job' };
      vi.mocked(prisma.company.findFirst).mockResolvedValue({ id: 'c1' } as any);
      vi.mocked(prisma.job.create).mockResolvedValue(newJob as any);

      const req = new NextRequest('http://localhost:3000/api/jobs', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Job', companyId: 'c1', description: 'desc' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json).toEqual(newJob);
    });

    it('rejects if unauthorized', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/jobs', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Job' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
    });
  });
});

describe('/api/jobs/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('returns job details and application status', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
      vi.mocked(prisma.job.findUnique).mockResolvedValue({ id: 'j1', title: 'Job 1' } as any);
      vi.mocked(prisma.application.findUnique).mockResolvedValue({ id: 'app1' } as any);
      vi.mocked(prisma.savedJob.findUnique).mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/jobs/j1');
      const res = await GET(req, { params: Promise.resolve({ id: 'j1' }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.hasApplied).toBe(true);
      expect(json.isSaved).toBe(false);
      expect(json.title).toBe('Job 1');
    });

    it('returns 404 if not found', async () => {
      vi.mocked(prisma.job.findUnique).mockResolvedValue(null);
      const req = new NextRequest('http://localhost/api/jobs/j1');
      const res = await GET(req, { params: Promise.resolve({ id: 'j1' }) });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE', () => {
    it('deletes job if owner', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: 'rec1', role: 'RECRUITER' } } as any);
      vi.mocked(prisma.job.findUnique).mockResolvedValue({ id: 'j1', recruiterId: 'rec1' } as any);
      vi.mocked(prisma.job.delete).mockResolvedValue({} as any);

      const req = new NextRequest('http://localhost/api/jobs/j1', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({ id: 'j1' }) });
      
      expect(res.status).toBe(200);
      expect(prisma.job.delete).toHaveBeenCalledWith({ where: { id: 'j1' } });
    });
  });
});
