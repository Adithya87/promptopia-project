import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Prompt from '@/lib/models/prompt';
import { uploadImage, deleteImage } from '@/lib/cloudinary';

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const promptText = formData.get('prompt') as string;
    const image = formData.get('image') as File;

    if (!title || !promptText || !image) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const uploadRes = await uploadImage(buffer);

    const newPrompt = await Prompt.create({
      title,
      prompt: promptText,
      imageUrl: uploadRes.secure_url,
      cloudinaryId: uploadRes.public_id,
    });

    return NextResponse.json(newPrompt, { status: 201 });
  } catch (error) {
    console.error('[POST ERROR]', error);
    return NextResponse.json({ error: 'Failed to upload prompt' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    const prompt = await Prompt.findById(id);
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    await deleteImage(prompt.cloudinaryId);
    await Prompt.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Prompt deleted' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE ERROR]', error);
    return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 });
  }
}
