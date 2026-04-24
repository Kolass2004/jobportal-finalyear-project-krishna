import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Get messages in a conversation
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: id, userId: session.user.id } },
    });
    if (!participant) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    // Mark messages as read
    await prisma.message.updateMany({
      where: { conversationId: id, senderId: { not: session.user.id }, read: false },
      data: { read: true },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Send message
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 });

    const message = await prisma.message.create({
      data: { conversationId: id, senderId: session.user.id, content },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });

    await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
