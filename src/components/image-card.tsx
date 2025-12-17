"use client";

import Image from "next/image";
import Link from "next/link";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import LikeButton from "./like-button";
import type { PromptData } from "@/types/prompt"; // ✅ FIXED

interface ImageCardProps {
  prompt: PromptData; // ✅ FIXED
  onView: (prompt: PromptData) => void;
}

export default function ImageCard({ prompt, onView }: ImageCardProps) {
  return (
    <Card className="overflow-hidden hover-lift bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 flex flex-col animate-in fade-in zoom-in-95 duration-500 group">
      <CardHeader className="p-0 relative overflow-hidden">
        <div className="relative h-64 bg-slate-800">
          <Image
            src={prompt.imageUrl}
            alt={prompt.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </CardHeader>

      <CardContent className="p-5 flex-grow">
        <CardTitle className="font-headline text-xl mb-3 text-white line-clamp-2">
          {prompt.title}
        </CardTitle>
        
        {/* Creator Info - Clickable */}
        {prompt.creatorName && (
          <Link
            href={`/creator/${encodeURIComponent(prompt.createdBy || "")}`}
            className="flex items-center gap-2 mb-4 hover:opacity-100 opacity-80 transition-all group/creator"
          >
            <Avatar className="h-7 w-7 ring-2 ring-purple-500/50 group-hover/creator:ring-purple-500">
              <AvatarImage src={prompt.creatorImage} alt={prompt.creatorName} />
              <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-pink-500">
                {prompt.creatorName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 leading-none">Creator</p>
              <p className="text-sm text-gray-300 group-hover/creator:text-transparent group-hover/creator:bg-gradient-to-r group-hover/creator:from-purple-400 group-hover/creator:to-pink-400 group-hover/creator:bg-clip-text font-medium transition truncate">
                {prompt.creatorName}
              </p>
            </div>
          </Link>
        )}

        {/* Show categories as badges with gap */}
        {prompt.category && (
          <div className="flex flex-wrap gap-2 mt-3">
            {Array.isArray(prompt.category) ? (
              prompt.category.map((cat: string) => (
                <Badge key={cat} variant="secondary" className="badge-gradient hover:bg-purple-500/30 transition">
                  {cat}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary" className="badge-gradient">{prompt.category}</Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          onClick={() => onView(prompt)}
          className="flex-1 btn-yellow"
        >
          <Eye className="mr-2 h-4 w-4" />
          View
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
