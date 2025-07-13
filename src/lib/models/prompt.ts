import mongoose, { Schema, models } from 'mongoose';

const PromptSchema = new Schema(
  {
    title: { type: String, required: true },
    prompt: { type: String, required: true },
    imageUrl: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Prompt || mongoose.model('Prompt', PromptSchema);
