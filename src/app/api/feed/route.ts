import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
        likes: { select: { userId: true } },
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

    const post = await prisma.post.create({
      data: { authorId: session.user.id, content },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
        likes: { select: { userId: true } },
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
