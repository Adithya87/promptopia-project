import { connectToDatabase } from '@/lib/mongodb';
import Prompt from '@/models/prompt';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();

    const prompts = await Prompt.find().sort({ createdAt: -1 }); // newest first

    return NextResponse.json(prompts, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch all prompts:', error);
    return NextResponse.json({ message: 'Failed to fetch prompts' }, { status: 500 });
  }
}
