import { connectToDatabase } from '@/lib/mongodb';
import Prompt from '@/lib/models/prompt';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();

    const prompts = await Prompt.find().sort({ createdAt: -1 });

    return NextResponse.json(prompts, { status: 200 });
  } catch (error) {
    console.error('❌ Failed to fetch prompts:', error);
    return NextResponse.json({ message: 'Failed to fetch prompts' }, { status: 500 });
  }
}
