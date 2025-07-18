import { connectToDatabase } from '@/lib/mongodb';
import Prompt from '@/lib/models/prompt';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const rawCategory = searchParams.get('category')?.trim() || '';

    const query: any = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (rawCategory && rawCategory !== 'All') {
      // Normalize category to Title Case (to match stored format)
      const normalizedCategory =
        rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase();
      query.category = normalizedCategory;
    }

    const prompts = await Prompt.find(query).sort({ createdAt: -1 });

    return NextResponse.json(prompts, { status: 200 });
  } catch (error) {
    console.error('❌ Failed to fetch prompts:', error);
    return NextResponse.json({ message: 'Failed to fetch prompts' }, { status: 500 });
  }
}
