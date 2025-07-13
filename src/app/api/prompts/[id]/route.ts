import { connectToDatabase } from '@/lib/mongodb';
import Prompt from '@/models/prompt';
import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary'; // ✅ FIXED

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

    // ✅ Delete image from Cloudinary
    if (prompt.cloudinaryId) {
      await cloudinary.uploader.destroy(prompt.cloudinaryId);
    }

    // ✅ Delete prompt from MongoDB
    await Prompt.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    console.error('[DELETE ERROR]', error);
    return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 });
  }
}
