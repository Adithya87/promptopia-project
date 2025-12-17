"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LikeButton from "./like-button";
import type { PromptData } from "@/types/prompt"; // ✅ FIXED

interface ImageCardProps {
  prompt: PromptData; // ✅ FIXED
  onView: (prompt: PromptData) => void;
}

export default function ImageCard({ prompt, onView }: ImageCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col animate-in fade-in zoom-in-95 duration-500">
      <CardHeader className="p-0">
        <div className="relative h-64 bg-card">
          <Image
            src={prompt.imageUrl}
            alt={prompt.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain"
          />
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-xl mb-1">
          {prompt.title}
        </CardTitle>
        {/* Show categories as badges with gap */}
        {prompt.category && (
          <div className="flex flex-wrap gap-2 mt-1">
            {Array.isArray(prompt.category) ? (
              prompt.category.map((cat: string) => (
                <Badge key={cat} variant="secondary">
                  {cat}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary">{prompt.category}</Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          onClick={() => onView(prompt)}
          className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Eye className="mr-2 h-4 w-4" />
          View Prompt
        </Button>
        <LikeButton
          promptId={prompt._id}
          initialLikes={prompt.likes}
          initialLikedBy={prompt.likedBy}
        />
      </CardFooter>
    </Card>
  );
}
