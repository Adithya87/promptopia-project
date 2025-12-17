export type PromptData = {
  _id: string;
  title: string;
  prompt: string;
  imageUrl: string;
  cloudinaryId: string;
  category: string[]; // ✅ Now supports multiple categories
  likes?: number;
  likedBy?: string[];
  createdBy?: string;
  creatorName?: string;
  creatorImage?: string;
  aiHint?: string;
};
