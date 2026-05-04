import { NextResponse } from 'next/server';
import { generateText } from '@/lib/gemini';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // Fetch active jobs for context (limit to 20 to avoid exceeding prompt limits)
    const activeJobs = await prisma.job.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        company: { select: { name: true } }
      }
    });

    // Format the jobs into a readable string
    const jobsContext = activeJobs.map(job => 
      `- Title: ${job.title} | Company: ${job.company?.name || 'Unknown'} | Location: ${job.location || 'Remote'} | Salary: ${job.salaryMin ? `$${job.salaryMin}-$${job.salaryMax}` : 'Not specified'} | Skills: ${job.skills || 'Not specified'} | Type: ${job.type} | ID: ${job.id}`
    ).join('\n');

    // Convert chat history into a single prompt for Gemini
    let conversationStr = '';
    for (const msg of messages) {
      if (msg.role === 'user') {
        conversationStr += `\nUser: ${msg.content}`;
      } else if (msg.role === 'assistant') {
        conversationStr += `\nAssistant: ${msg.content}`;
      }
    }

    const systemPrompt = `You are a helpful and professional Job Portal Assistant chatbot.
Your goal is to help users find jobs, understand job requirements, and navigate the platform.

Here is the list of currently active jobs on our platform:
${jobsContext || 'No active jobs available at the moment.'}

Use the job information provided above to answer the user's questions accurately. 
If a user asks about a job, refer to the details above. If they ask for something not in the list, kindly inform them you can only see the latest 20 active jobs. Do NOT invent jobs that are not in the list.
Provide your response in clean Markdown. Keep responses concise and helpful.

Here is the conversation history:${conversationStr}
Assistant:`;

    const response = await generateText(systemPrompt);

    return NextResponse.json({ text: response });
  } catch (error: any) {
    console.error('Chatbot API error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
