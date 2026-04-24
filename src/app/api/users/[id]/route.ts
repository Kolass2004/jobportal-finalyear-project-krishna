import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true, avatar: true, bio: true,
        phone: true, location: true, createdAt: true,
        jobseekerProfile: true,
        companies: { select: { id: true, name: true } },
      },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const role = (session.user as any).role;

    if (role !== 'ADMIN' && session.user.id !== id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();

    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;
    if (body.password) updateData.password = await hash(body.password, 12);

    // Admin can change role
    if (role === 'ADMIN' && body.role) updateData.role = body.role;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, bio: true, phone: true, location: true, avatar: true },
    });

    // Update jobseeker profile if applicable
    if (body.headline !== undefined || body.skills !== undefined || body.portfolioUrl !== undefined || body.experience !== undefined || body.education !== undefined) {
      await prisma.jobseekerProfile.upsert({
        where: { userId: id },
        update: {
          headline: body.headline,
          skills: body.skills,
          portfolioUrl: body.portfolioUrl,
          experience: body.experience,
          education: body.education,
        },
        create: {
          userId: id,
          headline: body.headline,
          skills: body.skills,
          portfolioUrl: body.portfolioUrl,
          experience: body.experience,
          education: body.education,
        },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('User PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
