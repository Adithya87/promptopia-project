"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ImageCard from "./image-card";
import Pagination from "./pagination";
import CopyButton from "./copy-button";
import type { PromptData } from "@/types/prompt";
import { CATEGORIES } from "@/lib/constants/categories";

const ITEMS_PER_PAGE = 20;
let debounceTimeout: NodeJS.Timeout;

const categories = ["All", ...CATEGORIES];

export default function PromptGallery() {
  const [allPrompts, setAllPrompts] = useState<PromptData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null);
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
      <div className="flex flex-col items-center justify-center mb-8 gap-4 sm:flex-row">
        <input
          type="text"
          placeholder="Search prompts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-80 px-4 py-2 rounded-lg bg-zinc-900 text-white placeholder-gray-400 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <div className="w-full sm:w-60 relative">
          <label htmlFor="category-select" className="sr-only">
            Filter by category
          </label>
          <select
            id="category-select"
            aria-label="Filter by category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-zinc-900 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary"
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
      <p className="text-sm text-gray-400 text-center mb-4">
        {isLoading
          ? "Loading..."
          : allPrompts.length > 0
          ? `${allPrompts.length} result${allPrompts.length > 1 ? "s" : ""} found`
          : searchQuery || category !== "All"
          ? "No results found"
          : ""}
      </p>

      {/* Prompt Grid */}
      {paginatedPrompts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {paginatedPrompts.map((prompt) => (
              <ImageCard key={prompt._id} prompt={prompt} onView={setSelectedPrompt} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </>
      ) : (
        !isLoading && (
          <div className="text-center text-muted-foreground py-12 text-lg">No prompts match your search.</div>
        )
      )}

      {/* Dialog Prompt View */}
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
                  <DialogTitle className="font-headline text-2xl mb-2">
                    {selectedPrompt.title}
                  </DialogTitle>
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
