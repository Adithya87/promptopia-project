export type PromptData = {
  _id: string;
  title: string;
  prompt: string;
  imageUrl: string;
  cloudinaryId: string;
  category: string[]; // ✅ Now supports multiple categories
  likes?: number;
  likedBy?: string[];
  aiHint?: string;
};
