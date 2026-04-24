import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    const userId = session.user.id;

    if (role === 'ADMIN') {
      const [totalUsers, activeJobs, totalCompanies, totalApplications] = await Promise.all([
        prisma.user.count(),
        prisma.job.count({ where: { status: 'ACTIVE' } }),
        prisma.company.count(),
        prisma.application.count(),
      ]);
      return NextResponse.json({ totalUsers, activeJobs, totalCompanies, totalApplications });
    }

    if (role === 'RECRUITER') {
      const [myJobs, myApplications, myCompanies] = await Promise.all([
        prisma.job.count({ where: { recruiterId: userId } }),
        prisma.application.count({ where: { job: { recruiterId: userId } } }),
        prisma.company.count({ where: { recruiterId: userId } }),
      ]);
      return NextResponse.json({ myJobs, myApplications, myCompanies, profileViews: 0 });
    }

    // JOBSEEKER
    const [myApplications, savedJobs, activeJobs] = await Promise.all([
      prisma.application.count({ where: { userId } }),
      prisma.savedJob.count({ where: { userId } }),
      prisma.job.count({ where: { status: 'ACTIVE' } }),
    ]);
    return NextResponse.json({ myApplications, savedJobs, activeJobs, profileViews: 0 });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
