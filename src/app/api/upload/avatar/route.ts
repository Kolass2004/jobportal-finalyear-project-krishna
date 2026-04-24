import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, or WebP.' }, { status: 400 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 5MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
    const filename = `${session.user.id}-${Date.now()}.${ext}`;

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    await mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const avatarUrl = `/uploads/avatars/${filename}`;

    // Update user avatar in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: avatarUrl },
    });

    return NextResponse.json({ avatar: avatarUrl }, { status: 200 });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 });
  }
}
