import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { industry: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const companies = await prisma.company.findMany({
      where,
      include: {
        recruiter: { select: { id: true, name: true } },
        _count: { select: { jobs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error('Companies GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Only recruiters can create companies' }, { status: 403 });
    }

    const body = await req.json();
    const company = await prisma.company.create({
      data: {
        name: body.name,
        description: body.description || null,
        website: body.website || null,
        location: body.location || null,
        industry: body.industry || null,
        size: body.size || null,
        foundedYear: body.foundedYear ? parseInt(body.foundedYear) : null,
        recruiterId: session.user.id,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Companies POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
