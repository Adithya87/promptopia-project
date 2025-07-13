"use client";

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { PromptData } from '@/lib/data';
import { Eye } from 'lucide-react';

interface ImageCardProps {
  prompt: PromptData;
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
            data-ai-hint={prompt.aiHint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-xl mb-2">{prompt.title}</CardTitle>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => onView(prompt)}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Eye className="mr-2 h-4 w-4" />
          View Prompt
        </Button>
      </CardFooter>
    </Card>
  );
}
