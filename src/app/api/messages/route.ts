import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Get conversations
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId: session.user.id } },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Add unread count
    const convosWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: session.user.id },
            read: false,
          },
        });
        return { ...conv, unreadCount };
      })
    );

    return NextResponse.json(convosWithUnread);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Start new conversation
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { recipientId, message } = await req.json();
    if (!recipientId) return NextResponse.json({ error: 'Recipient required' }, { status: 400 });

    // Check if conversation already exists
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: session.user.id } } },
          { participants: { some: { userId: recipientId } } },
        ],
      },
    });

    if (existing) {
      if (message) {
        await prisma.message.create({
          data: { conversationId: existing.id, senderId: session.user.id, content: message },
        });
        await prisma.conversation.update({ where: { id: existing.id }, data: { updatedAt: new Date() } });
      }
      return NextResponse.json({ conversationId: existing.id });
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: session.user.id }, { userId: recipientId }],
        },
        ...(message && {
          messages: {
            create: { senderId: session.user.id, content: message },
          },
        }),
      },
    });

    return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
