import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const savedJobs = await prisma.savedJob.findMany({
      where: { userId: session.user.id },
      include: {
        job: {
          include: { company: { select: { id: true, name: true, logo: true } } },
        },
      },
    });

    return NextResponse.json(savedJobs);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { jobId } = await req.json();

    const existing = await prisma.savedJob.findUnique({
      where: { userId_jobId: { userId: session.user.id, jobId } },
    });

    if (existing) {
      await prisma.savedJob.delete({ where: { id: existing.id } });
      return NextResponse.json({ saved: false });
    }

    await prisma.savedJob.create({ data: { userId: session.user.id, jobId } });
    return NextResponse.json({ saved: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
