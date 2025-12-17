import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Prompt from '@/lib/models/prompt';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { id } = await params;
    const prompt = await Prompt.findById(id);
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Check if user already liked this prompt
    if (prompt.likedBy.includes(userId)) {
      return NextResponse.json(
        { error: 'Already liked' },
        { status: 400 }
      );
    }

    // Add like
    prompt.likes = (prompt.likes || 0) + 1;
    prompt.likedBy.push(userId);
    await prompt.save();

    return NextResponse.json({
      likes: prompt.likes,
      likedBy: prompt.likedBy,
    });
  } catch (error) {
    console.error('[LIKE POST ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to like prompt' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { id } = await params;
    const prompt = await Prompt.findById(id);
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Check if user has liked this prompt
    const likeIndex = prompt.likedBy.indexOf(userId);
    if (likeIndex === -1) {
      return NextResponse.json(
        { error: 'Not liked yet' },
        { status: 400 }
      );
    }

    // Remove like
    prompt.likes = Math.max(0, (prompt.likes || 0) - 1);
    prompt.likedBy.splice(likeIndex, 1);
    await prompt.save();

    return NextResponse.json({
      likes: prompt.likes,
      likedBy: prompt.likedBy,
    });
  } catch (error) {
    console.error('[LIKE DELETE ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to unlike prompt' },
      { status: 500 }
    );
  }
}
