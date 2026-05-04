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

    const prompt = `You are an expert career coach helping a jobseeker write a tailored cover letter.
Write a professional, concise, and persuasive cover letter for this specific job application.

JOB DETAILS:
- Title: ${job.title}
- Company: ${job.company.name}
- Required Skills: ${job.skills || 'Not specified'}
- Job Description: ${job.description}

JOBSEEKER DETAILS:
- Name: ${user.name}
- Headline: ${profile?.headline || 'Not specified'}
- Skills: ${profile?.skills || 'Not specified'}
- Experience: ${profile?.experience ? JSON.stringify(profile.experience) : 'Not specified'}

The cover letter should:
1. Be directly addressed to the Hiring Manager at ${job.company.name}.
2. Express enthusiasm for the ${job.title} role.
3. Highlight 1-2 relevant experiences or skills from the jobseeker's profile that match the job requirements.
4. Be no longer than 3 short paragraphs.
5. Have a professional sign-off with the jobseeker's name.

Do NOT use Markdown formatting. Output plain text with standard paragraph breaks.`;

    const coverLetter = await generateText(prompt);

    return NextResponse.json({ coverLetter });
  } catch (error: any) {
    console.error('AI Cover Letter error:', error);
    return NextResponse.json({ error: 'Failed to generate cover letter' }, { status: 500 });
  }
}
