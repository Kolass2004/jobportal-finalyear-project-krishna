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

    // Fetch application, job details, and user profile
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

    // Verify the jobseeker owns this application
    if (application.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const job = application.job;
    const profile = application.user.jobseekerProfile;

    const prompt = `You are an expert career coach helping a jobseeker prepare for an interview for a specific job.

JOB DETAILS:
- Title: ${job.title}
- Required Skills: ${job.skills || 'Not specified'}
- Job Description: ${job.description}

JOBSEEKER DETAILS:
- Name: ${application.user.name}
- Headline: ${profile?.headline || 'Not specified'}
- Skills: ${profile?.skills || 'Not specified'}

Based on the job requirements and the jobseeker's profile, generate 5 highly tailored practice interview questions. 
For each question, provide a short tip on how the jobseeker should approach answering it, highlighting their specific strengths if possible.

Format the output clearly in Markdown. Do not include introductory fluff, just the questions and tips. Use bullet points or numbered lists.`;

    const prepGuide = await generateText(prompt);

    return NextResponse.json({ prepGuide });
  } catch (error: any) {
    console.error('AI Interview Prep error:', error);
    return NextResponse.json({ error: 'Failed to generate interview prep' }, { status: 500 });
  }
}
