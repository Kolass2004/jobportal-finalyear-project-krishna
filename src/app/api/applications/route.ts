import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: { userId: session.user.id },
      include: {
        job: {
          include: {
            company: { select: { id: true, name: true, logo: true } },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Applications GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
