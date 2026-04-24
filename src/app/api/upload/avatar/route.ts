import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Image upload not configured' }, { status: 500 });
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

    // Convert to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    // Upload to imgBB
    const imgbbForm = new FormData();
    imgbbForm.append('key', apiKey);
    imgbbForm.append('image', base64);
    imgbbForm.append('name', `avatar-${session.user.id}-${Date.now()}`);

    const imgbbRes = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbForm,
    });

    const imgbbData = await imgbbRes.json();

    if (!imgbbData.success) {
      console.error('imgBB upload failed:', imgbbData);
      return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
    }

    const avatarUrl = imgbbData.data.display_url;

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
