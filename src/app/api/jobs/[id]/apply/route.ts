import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'JOBSEEKER') {
      return NextResponse.json({ error: 'Only jobseekers can apply' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job || job.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Job not found or not accepting applications' }, { status: 404 });
    }

    const existing = await prisma.application.findUnique({
      where: { jobId_userId: { jobId: id, userId: session.user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Already applied to this job' }, { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        jobId: id,
        userId: session.user.id,
        coverLetter: body.coverLetter || null,
        resume: body.resume || null,
      },
    });

    // Create notification for recruiter
    await prisma.notification.create({
      data: {
        userId: job.recruiterId,
        type: 'APPLICATION',
        title: 'New Application',
        message: `${session.user.name} applied for ${job.title}`,
        link: `/jobs/${id}/applicants`,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Apply error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
