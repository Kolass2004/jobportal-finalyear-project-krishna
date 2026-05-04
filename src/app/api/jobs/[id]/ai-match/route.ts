import { NextResponse } from 'next/server';
import { generateText } from '@/lib/gemini';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'JOBSEEKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;

    // Fetch job details and user profile
    const [job, user] = await Promise.all([
      prisma.job.findUnique({ where: { id }, include: { company: true } }),
      prisma.user.findUnique({ where: { id: session.user.id }, include: { jobseekerProfile: true } })
    ]);

    if (!job || !user) {
      return NextResponse.json({ error: 'Data not found' }, { status: 404 });
    }

    const profile = user.jobseekerProfile;

    const prompt = `You are an expert career counselor. Analyze the fit between the following job and the jobseeker.

JOB DETAILS:
- Title: ${job.title}
- Required Skills: ${job.skills || 'Not specified'}
- Description: ${job.description}

JOBSEEKER DETAILS:
- Name: ${user.name}
- Headline: ${profile?.headline || 'Not specified'}
- Skills: ${profile?.skills || 'Not specified'}
- Experience: ${profile?.experience ? JSON.stringify(profile.experience) : 'Not specified'}

Analyze the match and provide your response as a JSON object with two fields:
1. "score": An integer from 0 to 100 representing the match percentage.
2. "insights": A short summary explaining WHY they are a good match, highlighting matching skills and any potential gaps they should be aware of.

Return ONLY the valid JSON object, no markdown wrappers like \`\`\`json.`;

    const generatedResponse = await generateText(prompt);

    // Parse the JSON from the response
    let result;
    try {
      const cleanJson = generatedResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      result = JSON.parse(cleanJson);
    } catch (e) {
      console.error('Failed to parse AI Match JSON response:', generatedResponse);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI Match error:', error);
    return NextResponse.json({ error: 'Failed to generate match insights' }, { status: 500 });
  }
}
