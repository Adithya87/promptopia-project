import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Prompt from '@/lib/models/prompt';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(req: Request) {
  try {
    console.log('⏳ Connecting to DB...');
    await connectToDatabase();

   const formData = await req.formData();
const title = formData.get('title')?.toString();
const promptText = formData.get('prompt')?.toString();
const rawCategory = formData.get('category')?.toString() || '';
const image = formData.get('image') as File;

if (!title || !promptText || !image || !rawCategory) {
  console.warn('[Validation Error] Missing fields:', { title, promptText, image, rawCategory });
  return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
}

// 🧠 Normalize category to Title Case
const category =
  rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase();

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
  category,
});

console.log('✅ Prompt saved:', newPrompt);

return NextResponse.json(newPrompt, { status: 201 });


  } catch (error) {
    console.error('[POST ERROR]', error);
    return NextResponse.json({ error: 'Failed to upload prompt' }, { status: 500 });
  }
}
