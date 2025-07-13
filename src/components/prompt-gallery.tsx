"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ImageCard from './image-card';
import Pagination from './pagination';
import CopyButton from './copy-button';
import type { PromptData } from '@/types/prompt';

const ITEMS_PER_PAGE = 20;

export default function PromptGallery() {
  const [allPrompts, setAllPrompts] = useState<PromptData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const res = await fetch('/api/prompts/all');
        const data = await res.json();
        setAllPrompts(data);
      } catch (err) {
        console.error('Failed to fetch prompts:', err);
      }
    };

    fetchPrompts();
  }, []);

  const paginatedPrompts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return allPrompts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [allPrompts, currentPage]);

  const totalPages = Math.ceil(allPrompts.length / ITEMS_PER_PAGE);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {paginatedPrompts.map((prompt) => (
          <ImageCard key={prompt._id} prompt={prompt} onView={setSelectedPrompt} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}

      <Dialog open={!!selectedPrompt} onOpenChange={(isOpen) => !isOpen && setSelectedPrompt(null)}>
        <DialogContent className="sm:max-w-3xl p-0">
          {selectedPrompt && (
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative h-96 md:h-auto bg-card">
                <Image
                  src={selectedPrompt.imageUrl}
                  alt={selectedPrompt.title}
                  priority
                  fill
                  className="object-contain rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                />
              </div>
              <div className="p-6 flex flex-col">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl mb-2">{selectedPrompt.title}</DialogTitle>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto pr-2 text-muted-foreground my-4">
                  <p className="text-sm leading-relaxed">{selectedPrompt.prompt}</p>
                </div>
                <div className="mt-auto pt-4">
                  <CopyButton textToCopy={selectedPrompt.prompt} className="w-full" />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
