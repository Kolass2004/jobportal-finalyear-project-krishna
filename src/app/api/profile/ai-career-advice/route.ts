import { NextResponse } from 'next/server';
import { generateText } from '@/lib/gemini';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'JOBSEEKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { jobseekerProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profile = user.jobseekerProfile;

    const prompt = `You are an expert AI Career Counselor. Based on the user's current profile, suggest 3 potential career paths they could pursue and exactly what they need to learn to get there.

USER PROFILE:
- Name: ${user.name}
- Headline: ${profile?.headline || 'Not specified'}
- Skills: ${profile?.skills || 'Not specified'}
- Experience: ${profile?.experience ? JSON.stringify(profile.experience) : 'Not specified'}

Please provide a structured response. For each of the 3 career paths, include:
1. The Job Title.
2. Why it's a good fit based on their current profile.
3. 2-3 specific skills they need to learn or improve to achieve this role.

Format the output cleanly in Markdown. Do not include an introduction or conclusion, just the 3 paths. Use headers (###) for the Job Titles.`;

    const advice = await generateText(prompt);

    return NextResponse.json({ advice });
  } catch (error: any) {
    console.error('AI Career Advice error:', error);
    return NextResponse.json({ error: 'Failed to generate career advice' }, { status: 500 });
  }
}
