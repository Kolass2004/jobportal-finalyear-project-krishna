import { NextResponse } from 'next/server';
import { generateText } from '@/lib/gemini';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;

    // Fetch the application, job, and user profile
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        user: { include: { jobseekerProfile: true } }
      }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Verify the recruiter owns the job
    if (application.job.recruiterId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const job = application.job;
    const profile = application.user.jobseekerProfile;

    const prompt = `You are an expert technical recruiter preparing for an interview with a candidate.

JOB DETAILS:
- Title: ${job.title}
- Required Skills: ${job.skills || 'Not specified'}

CANDIDATE DETAILS:
- Name: ${application.user.name}
- Headline: ${profile?.headline || 'Not specified'}
- Skills: ${profile?.skills || 'Not specified'}
- Experience: ${profile?.experience ? JSON.stringify(profile.experience) : 'Not specified'}

Please generate 5 tailored interview questions to ask this specific candidate.
The questions should probe into their relevant experience and address any potential skill gaps compared to the job requirements.
For each question, provide a brief note on *what to listen for* in their answer.

Format the output clearly in Markdown. Do not include introductory filler. Use bullet points or numbered lists.`;

    const questions = await generateText(prompt);

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('AI Recruiter Questions error:', error);
    return NextResponse.json({ error: 'Failed to generate interview questions' }, { status: 500 });
  }
}
