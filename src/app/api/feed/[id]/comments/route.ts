import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 });

    const comment = await prisma.comment.create({
      data: { postId: id, userId: session.user.id, content },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
