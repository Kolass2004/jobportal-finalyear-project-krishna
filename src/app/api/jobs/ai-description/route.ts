import { NextResponse } from 'next/server';
import { generateText } from '@/lib/gemini';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, type, skills } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Job title is required to generate a description' }, { status: 400 });
    }

    const prompt = `You are an expert technical recruiter and copywriter.
Please write a professional, engaging, and detailed job description for the following position:
- Job Title: ${title}
- Job Type: ${type ? type.replace('_', ' ') : 'Not specified'}
- Required Skills: ${skills || 'Not specified'}

The job description should include:
1. A brief introduction about the role.
2. Responsibilities (use bullet points).
3. Requirements (use bullet points, incorporate the requested skills).
4. What we offer / Benefits (generic professional benefits).

Format the output in clear, readable Markdown. Do NOT use placeholder text like [Company Name], just refer to "our company", "we", or "us". Keep it concise but comprehensive (around 200-300 words).`;

    const generatedDescription = await generateText(prompt);

    return NextResponse.json({ description: generatedDescription });
  } catch (error: any) {
    console.error('AI Description error:', error);
    return NextResponse.json({ error: 'Failed to generate job description' }, { status: 500 });
  }
}
