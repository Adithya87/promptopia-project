"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ImageCard from './image-card';
import Pagination from './pagination';
import CopyButton from './copy-button';
import { prompts as allPrompts, type PromptData } from '@/lib/data';

const ITEMS_PER_PAGE = 20;

export default function PromptGallery() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null);

  const paginatedPrompts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return allPrompts.slice(startIndex, endIndex);
  }, [currentPage]);

  const totalPages = Math.ceil(allPrompts.length / ITEMS_PER_PAGE);

  const handleViewPrompt = (prompt: PromptData) => {
    setSelectedPrompt(prompt);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {paginatedPrompts.map((prompt) => (
          <ImageCard key={prompt.id} prompt={prompt} onView={handleViewPrompt} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <Dialog open={!!selectedPrompt} onOpenChange={(isOpen) => !isOpen && setSelectedPrompt(null)}>
        <DialogContent className="sm:max-w-3xl p-0">
          {selectedPrompt && (
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative h-96 md:h-auto bg-card">
                <Image
                  src={selectedPrompt.imageUrl}
                  alt={selectedPrompt.title}
                  priority={true}
                  fill
                  className="object-contain rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                  data-ai-hint={selectedPrompt.aiHint}
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
