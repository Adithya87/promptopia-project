"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useMobileBackDialogClose } from "@/hooks/use-mobile-back-dialog-close";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import ImageCard from "./image-card";
import Pagination from "./pagination";
import CopyButton from "./copy-button";
import LikeButton from "./like-button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { PromptData } from "@/types/prompt";
import { CATEGORIES } from "@/lib/constants/categories";

const ITEMS_PER_PAGE = 20;
let debounceTimeout: NodeJS.Timeout;

const categories = ["All", ...CATEGORIES];

export default function PromptGallery() {
  const [allPrompts, setAllPrompts] = useState<PromptData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null);
  // Close dialog handler for mobile back key
  useMobileBackDialogClose(
    !!selectedPrompt,
    useCallback(() => setSelectedPrompt(null), [])
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(false);

  const fetchPrompts = async (search = "", category = "All") => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category !== "All") params.append("category", category);
      const query = params.toString();

      const res = await fetch(`/api/prompts/all${query ? `?${query}` : ""}`);
      const data = await res.json();
      setAllPrompts(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch prompts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      fetchPrompts(searchQuery, category);
    }, 500);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, category]);

  const paginatedPrompts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return allPrompts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [allPrompts, currentPage]);

  const totalPages = Math.ceil(allPrompts.length / ITEMS_PER_PAGE);

  return (
    <>
      {/* Search & Category Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center mb-8 w-full">
        <input
          type="text"
          placeholder="🔍 Search prompts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-0 px-4 py-3 rounded-lg bg-white/5 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm transition-all"
        />

        <div className="w-full sm:w-60 flex-shrink-0 relative mb-32 sm:mb-0">
          <label htmlFor="category-select" className="sr-only">
            Filter by category
          </label>
          <select
            id="category-select"
            aria-label="Filter by category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border-2 border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-400 backdrop-blur-sm transition-all hover:border-purple-500 cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-300 text-center mb-6 font-light">
        {isLoading
          ? "✨ Loading amazing prompts..."
          : allPrompts.length > 0
          ? `🎨 ${allPrompts.length} result${
              allPrompts.length > 1 ? "s" : ""
            } found`
          : searchQuery || category !== "All"
          ? "No results found"
          : ""}
      </p>

      {/* Prompt Grid */}
      {paginatedPrompts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {paginatedPrompts.map((prompt) => (
              <ImageCard
                key={prompt._id}
                prompt={prompt}
                onView={setSelectedPrompt}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      ) : (
        !isLoading && (
          <div className="text-center text-muted-foreground py-12 text-lg">
            No prompts match your search.
          </div>
        )
      )}

      {/* Dialog Prompt View */}
      <Dialog
        open={!!selectedPrompt}
        onOpenChange={(isOpen) => !isOpen && setSelectedPrompt(null)}
      >
        <DialogContent className="sm:max-w-3xl p-0 bg-gradient-to-br from-slate-900 to-slate-800 border-white/20">
          {selectedPrompt && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="relative h-96 md:h-auto bg-slate-800">
                <Image
                  src={selectedPrompt.imageUrl}
                  alt={selectedPrompt.title}
                  priority
                  fill
                  className="object-contain rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                />
              </div>
              <div className="p-6 flex flex-col bg-gradient-to-br from-slate-800 to-slate-900">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl mb-2 text-white">
                    {selectedPrompt.title}
                  </DialogTitle>
                </DialogHeader>
                
                {/* Creator Info - Clickable */}
                {selectedPrompt.creatorName && (
                  <Link
                    href={`/creator/${encodeURIComponent(selectedPrompt.createdBy || "")}`}
                    className="flex items-center gap-2 mb-4 hover:opacity-80 transition p-3 rounded-lg bg-white/5 hover:bg-white/10"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-purple-500/50">
                      <AvatarImage src={selectedPrompt.creatorImage} alt={selectedPrompt.creatorName} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-pink-500">
                        {selectedPrompt.creatorName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs text-gray-400">By</p>
                      <p className="text-sm text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text font-medium">
                        {selectedPrompt.creatorName}
                      </p>
                    </div>
                  </Link>
                )}
                
                {selectedPrompt.category && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Array.isArray(selectedPrompt.category) ? (
                      selectedPrompt.category.map((cat: string) => (
                        <Badge key={cat} variant="secondary" className="badge-gradient">
                          {cat}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary" className="badge-gradient">{selectedPrompt.category}</Badge>
                    )}
                  </div>
                )}
                <div className="flex-grow overflow-y-auto pr-2 text-gray-300 my-4">
                  <p className="text-sm leading-relaxed font-light">
                    {selectedPrompt.prompt}
                  </p>
                </div>
                <div className="mt-auto pt-4 flex gap-2">
                  <CopyButton
                    textToCopy={selectedPrompt.prompt}
                    className="flex-1 gradient-btn"
                  />
                  <LikeButton
                    promptId={selectedPrompt._id}
                    initialLikes={selectedPrompt.likes}
                    initialLikedBy={selectedPrompt.likedBy}
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
