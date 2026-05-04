import { NextResponse } from 'next/server';
import { generateText } from '@/lib/gemini';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'JOBSEEKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profileData = await req.json();

    const prompt = `You are an expert career coach and resume reviewer.
Analyze the following user profile and provide actionable, encouraging feedback on how they can improve it to attract more recruiters.

CURRENT PROFILE:
- Name: ${profileData.name}
- Headline: ${profileData.headline || 'Not provided'}
- Bio: ${profileData.bio || 'Not provided'}
- Skills: ${profileData.skills || 'Not provided'}
- Experience: ${profileData.experience || 'Not provided'}
- Education: ${profileData.education || 'Not provided'}

Please provide a brief assessment (about 3-4 short paragraphs or bullet points).
Highlight what looks good, and give 2-3 specific suggestions for improvement (e.g., adding more quantifiable achievements, improving the headline, adding specific skills).
Format the output in clean, readable Markdown.`;

    const suggestion = await generateText(prompt);

    return NextResponse.json({ suggestion });
  } catch (error: any) {
    console.error('AI Profile Optimize error:', error);
    return NextResponse.json({ error: 'Failed to generate profile suggestions' }, { status: 500 });
  }
}
