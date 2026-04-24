import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { email: { contains: q } },
      ],
    },
    select: { id: true, name: true, email: true, role: true, avatar: true },
    take: 10,
  });

  return NextResponse.json(users);
}
