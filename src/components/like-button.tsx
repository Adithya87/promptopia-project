"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LikeButtonProps {
  promptId: string;
  initialLikes?: number;
  initialLikedBy?: string[];
}

export default function LikeButton({
  promptId,
  initialLikes = 0,
  initialLikedBy = [],
}: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get or create a persistent user ID (in localStorage for demo)
  useEffect(() => {
    let id = localStorage.getItem("promptopia_user_id");
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("promptopia_user_id", id);
    }
    setUserId(id);

    // Check if user already liked this prompt
    setIsLiked(initialLikedBy.includes(id));
  }, [initialLikedBy]);

  const handleLike = async () => {
    if (!userId || isLoading) return;

    setIsLoading(true);
    try {
      const method = isLiked ? "DELETE" : "POST";
      const res = await fetch(`/api/prompts/${promptId}/like`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error(error.error);
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      setLikes(data.likes);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLike}
      disabled={isLoading || !userId}
      variant="ghost"
      size="sm"
      className={`gap-2 ${
        isLiked ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"
      }`}
    >
      <Heart
        className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`}
      />
      <span>{likes}</span>
    </Button>
  );
}
