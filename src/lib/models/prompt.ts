import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface PromptDocument extends Document {
  title: string;
  prompt: string;
  imageUrl: string;
  cloudinaryId: string;
  category: string[]; // <-- Now supports multiple categories
  likes: number;
  likedBy: string[]; // Array of user IDs who liked
  createdAt: Date;
  updatedAt: Date;
}

const PromptSchema = new Schema<PromptDocument>(
  {
    title: { type: String, required: true },
    prompt: { type: String, required: true },
    imageUrl: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
    category: { type: [String], required: true }, // <-- Array of strings
    likes: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] }, // Store user IDs/identifiers
  },
  {
    timestamps: true,
  }
);

// Avoid model overwrite error in dev mode
const Prompt = models.Prompt || model<PromptDocument>('Prompt', PromptSchema);

export default Prompt;
