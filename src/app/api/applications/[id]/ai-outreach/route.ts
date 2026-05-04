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
    const body = await req.json();
    const type = body.type || 'INTERVIEW'; // 'INTERVIEW' or 'REJECTION'

    // Fetch the application
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: { include: { company: true } },
        user: true
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
    const candidate = application.user;

    const prompt = `You are a professional technical recruiter working for ${job.company.name}.
Please draft an email to a candidate named ${candidate.name} who applied for the "${job.title}" role.

The email type is: ${type === 'INTERVIEW' ? 'INVITATION TO INTERVIEW' : 'REJECTION'}.

${type === 'INTERVIEW' ? 
  'The email should be warm, express excitement about their application, and ask for their availability for a 30-minute introductory call.' : 
  'The email should be polite, thank them for their time, but inform them that the team is moving forward with other candidates who more closely match the current needs. Wish them well.'}

Include a subject line at the top. Keep the email concise and professional. Do NOT use markdown wrappers.
Sign off as "The ${job.company.name} Recruiting Team".`;

    const message = await generateText(prompt);

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error('AI Outreach Draft error:', error);
    return NextResponse.json({ error: 'Failed to generate outreach message' }, { status: 500 });
  }
}
