import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        recruiter: { select: { id: true, name: true, email: true, avatar: true } },
        _count: { select: { applications: true } },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if current user has applied
    const session = await auth();
    let hasApplied = false;
    let isSaved = false;
    if (session?.user) {
      const application = await prisma.application.findUnique({
        where: { jobId_userId: { jobId: id, userId: session.user.id } },
      });
      hasApplied = !!application;

      const saved = await prisma.savedJob.findUnique({
        where: { userId_jobId: { userId: session.user.id, jobId: id } },
      });
      isSaved = !!saved;
    }

    return NextResponse.json({ ...job, hasApplied, isSaved });
  } catch (error) {
    console.error('Job GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const role = (session.user as any).role;

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (role !== 'ADMIN' && job.recruiterId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updated = await prisma.job.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        location: body.location,
        salaryMin: body.salaryMin ? parseInt(body.salaryMin) : null,
        salaryMax: body.salaryMax ? parseInt(body.salaryMax) : null,
        remote: body.remote,
        skills: body.skills,
        status: body.status,
        deadline: body.deadline ? new Date(body.deadline) : null,
      },
      include: { company: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Job PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    await prisma.job.delete({ where: { id } });
    return NextResponse.json({ message: 'Job deleted' });
  } catch (error) {
    console.error('Job DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
