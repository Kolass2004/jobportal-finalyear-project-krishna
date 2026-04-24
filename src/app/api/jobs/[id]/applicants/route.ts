import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const role = (session.user as any).role;
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    if (role !== 'ADMIN' && job.recruiterId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const applicants = await prisma.application.findMany({
      where: { jobId: id },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, location: true, bio: true },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    return NextResponse.json(applicants);
  } catch (error) {
    console.error('Applicants GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
