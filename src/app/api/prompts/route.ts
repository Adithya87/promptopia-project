import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Prompt from '@/lib/models/prompt';
import User from '@/lib/models/user';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(req: Request) {
  try {
    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('⏳ Connecting to DB...');
    await connectToDatabase();

    // Get user info
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const title = formData.get('title')?.toString();
    const promptText = formData.get('prompt')?.toString();
    const rawCategories = formData.getAll('category').map(c => c.toString()).filter(Boolean);
    const image = formData.get('image') as File;

    if (!title || !promptText || !image || !rawCategories.length) {
      console.warn('[Validation Error] Missing fields:', { title, promptText, image, rawCategories });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 🧠 Normalize categories to Title Case
    const categories = rawCategories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase());

    console.log('📸 Converting image to buffer...');
    const buffer = Buffer.from(await image.arrayBuffer());

    console.log('⬆️ Uploading to Cloudinary...');
    const uploadRes = await uploadImage(buffer);

    if (!uploadRes?.secure_url) {
      console.error('[Cloudinary Error] Missing URL:', uploadRes);
      return NextResponse.json({ error: 'Cloudinary upload failed' }, { status: 500 });
    }

    const newPrompt = await Prompt.create({
      title,
      prompt: promptText,
      imageUrl: uploadRes.secure_url,
      cloudinaryId: uploadRes.public_id,
      category: categories,
      createdBy: session.user.email,
      creatorName: user.name || session.user.email,
      creatorImage: user.image || '',
    });

    console.log('✅ Prompt saved:', newPrompt);

    return NextResponse.json(newPrompt, { status: 201 });


  } catch (error) {
    console.error('[POST ERROR]', error);
    return NextResponse.json({ error: 'Failed to upload prompt' }, { status: 500 });
  }
}
