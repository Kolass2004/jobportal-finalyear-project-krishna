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
        user: {
          include: {
            jobseekerProfile: true,
          },
        },
      },
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

    const prompt = `You are an expert HR AI assistant evaluating a candidate's fit for a job.
Analyze the following candidate's profile against the job description.

JOB DETAILS:
- Title: ${job.title}
- Skills Required: ${job.skills || 'Not specified'}
- Description: ${job.description}

CANDIDATE DETAILS:
- Name: ${application.user.name}
- Headline: ${profile?.headline || 'Not specified'}
- Skills: ${profile?.skills || 'Not specified'}
- Experience: ${profile?.experience ? JSON.stringify(profile.experience) : 'Not specified'}
- Education: ${profile?.education ? JSON.stringify(profile.education) : 'Not specified'}
- Cover Letter: ${application.coverLetter || 'Not provided'}

Please provide a brief assessment of how well the candidate fits the role. 
Format your response as a JSON object with two fields:
1. "score": An integer from 0 to 100 representing the fit score.
2. "summary": A short 2-3 sentence paragraph explaining the strengths and gaps.

Return ONLY the valid JSON object, no markdown wrappers like \`\`\`json.`;

    const generatedResponse = await generateText(prompt);
    
    // Parse the JSON from the response
    let result;
    try {
      const cleanJson = generatedResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      result = JSON.parse(cleanJson);
    } catch (e) {
      console.error('Failed to parse AI JSON response:', generatedResponse);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI Fit Analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze candidate fit' }, { status: 500 });
  }
}
