import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        recruiter: { select: { id: true, name: true, email: true } },
        jobs: {
          where: { status: 'ACTIVE' },
          include: { _count: { select: { applications: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const role = (session.user as any).role;

    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    if (role !== 'ADMIN' && company.recruiterId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updated = await prisma.company.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        website: body.website,
        location: body.location,
        industry: body.industry,
        size: body.size,
        foundedYear: body.foundedYear ? parseInt(body.foundedYear) : null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const role = (session.user as any).role;
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    if (role !== 'ADMIN' && company.recruiterId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.company.delete({ where: { id } });
    return NextResponse.json({ message: 'Company deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
