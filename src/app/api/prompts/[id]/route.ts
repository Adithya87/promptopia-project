import { connectToDatabase } from '@/lib/mongodb';
import Prompt from '@/lib/models/prompt';
import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const prompt = await Prompt.findById(params.id);
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('[GET ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch prompt' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const promptText = formData.get('prompt') as string;
    const category = formData.get('category') as string;
    const image = formData.get('image') as File | null;

    const existingPrompt = await Prompt.findById(params.id);
    if (!existingPrompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    let updatedImageUrl = existingPrompt.image;
    let updatedCloudinaryId = existingPrompt.cloudinaryId;

    if (image && image.size > 0) {
      if (existingPrompt.cloudinaryId) {
        await cloudinary.uploader.destroy(existingPrompt.cloudinaryId);
      }

      const buffer = Buffer.from(await image.arrayBuffer());
      const base64 = buffer.toString('base64');

      const uploadResult = await cloudinary.uploader.upload(
        `data:${image.type};base64,${base64}`,
        { folder: 'prompts' }
      );

      updatedImageUrl = uploadResult.secure_url;
      updatedCloudinaryId = uploadResult.public_id;
    }

    const updated = await Prompt.findByIdAndUpdate(
      params.id,
      {
        title,
        prompt: promptText,
        category,
        image: updatedImageUrl,
        cloudinaryId: updatedCloudinaryId,
      },
      { new: true }
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PUT ERROR]', error);
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const prompt = await Prompt.findById(params.id);
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    if (prompt.cloudinaryId) {
      await cloudinary.uploader.destroy(prompt.cloudinaryId);
    }

    await Prompt.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    console.error('[DELETE ERROR]', error);
    return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 });
  }
}
