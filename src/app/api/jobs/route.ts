import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const location = searchParams.get('location') || '';
    const remote = searchParams.get('remote');
    const status = searchParams.get('status') || 'ACTIVE';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const recruiterId = searchParams.get('recruiterId') || '';

    const where: any = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (remote === 'true') where.remote = true;
    if (recruiterId) where.recruiterId = recruiterId;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { skills: { contains: search } },
        { company: { name: { contains: search } } },
      ];
    }

    if (location) {
      where.location = { contains: location };
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: { select: { id: true, name: true, logo: true, location: true } },
          recruiter: { select: { id: true, name: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({ jobs, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Jobs GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, companyId, type, location, salaryMin, salaryMax, remote, skills, status, deadline } = body;

    if (!title || !description || !companyId) {
      return NextResponse.json({ error: 'Title, description, and company are required' }, { status: 400 });
    }

    const company = await prisma.company.findFirst({
      where: { id: companyId, recruiterId: session.user.id },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found or unauthorized' }, { status: 404 });
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        companyId,
        recruiterId: session.user.id,
        type: type || 'FULL_TIME',
        location,
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        remote: remote || false,
        skills,
        status: status || 'ACTIVE',
        deadline: deadline ? new Date(deadline) : null,
      },
      include: { company: true },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Jobs POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
