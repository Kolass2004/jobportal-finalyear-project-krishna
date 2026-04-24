import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const role = (session.user as any).role;
    const { status } = await req.json();

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (role !== 'ADMIN' && application.job.recruiterId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status },
    });

    // Notify the applicant
    const statusMessages: Record<string, string> = {
      REVIEWED: 'Your application has been reviewed',
      SHORTLISTED: 'Congratulations! You\'ve been shortlisted',
      ACCEPTED: 'Great news! Your application has been accepted',
      REJECTED: 'Your application status has been updated',
    };

    await prisma.notification.create({
      data: {
        userId: application.userId,
        type: 'APPLICATION',
        title: `Application ${status.toLowerCase()}`,
        message: `${statusMessages[status] || 'Application status updated'} for ${application.job.title}`,
        link: '/applications',
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Application PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
