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
    const updatedPrompt = await Prompt.findByIdAndUpdate(
      id,
      {
        $inc: { likes: 1 },
        $push: { likedBy: userId },
      },
      { new: true, runValidators: false }
    );

    return NextResponse.json({
      likes: updatedPrompt.likes,
      likedBy: updatedPrompt.likedBy,
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
    
    // Check if user has already liked (to give proper error message)
    const prompt = await Prompt.findById(id);
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    if (!prompt.likedBy.includes(userId)) {
      return NextResponse.json(
        { error: 'Not liked yet' },
        { status: 400 }
      );
    }

    // Check if other people have also liked - prevent unlike if there are other likes
    if (prompt.likedBy.length > 1) {
      return NextResponse.json(
        { error: 'Cannot unlike when other people have liked this prompt' },
        { status: 400 }
      );
    }

    // Remove like
    const updatedPrompt = await Prompt.findByIdAndUpdate(
      id,
      {
        $inc: { likes: -1 },
        $pull: { likedBy: userId },
      },
      { new: true, runValidators: false }
    );

    return NextResponse.json({
      likes: Math.max(0, updatedPrompt.likes),
      likedBy: updatedPrompt.likedBy,
    });
  } catch (error) {
    console.error('[LIKE DELETE ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to unlike prompt' },
      { status: 500 }
    );
  }
}
