export type PromptData = {
  _id: string;
  title: string;
  prompt: string;
  imageUrl: string;
  cloudinaryId: string;
  category: string; // ✅ Required for filtering and display
  aiHint?: string;
};
