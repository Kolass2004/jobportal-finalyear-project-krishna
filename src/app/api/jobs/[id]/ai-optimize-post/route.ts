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

    const job = await prisma.job.findUnique({
      where: { id }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Verify ownership
    if (job.recruiterId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const prompt = `You are an expert technical recruiter and copywriter.
Please analyze the following job description and provide an optimized, more engaging version.

CURRENT TITLE: ${body.title || job.title}
CURRENT DESCRIPTION:
${body.description || job.description}

Your goal is to:
1. Make the description more engaging, inclusive, and professional.
2. Structure it clearly with headers (e.g., About the Role, Responsibilities, Requirements, Benefits).
3. Ensure the tone is exciting but clear.

Return ONLY the new optimized job description formatted cleanly in Markdown. Do not include introductory text like "Here is the optimized version:".`;

    const optimized = await generateText(prompt);

    return NextResponse.json({ optimized });
  } catch (error: any) {
    console.error('AI Job Optimizer error:', error);
    return NextResponse.json({ error: 'Failed to optimize job post' }, { status: 500 });
  }
}
