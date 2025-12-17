"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import EditPromptModal from "@/components/admin/edit-prompt-modal";

export default function ManagePromptsPage() {
  const router = useRouter();
  const handleLogout = () => {
    // In a real app, this would call your logout function
    router.push("/admin/login");
  };
  const [prompts, setPrompts] = useState<any[]>([]);
  const [editingPrompt, setEditingPrompt] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetch("/api/prompts/all")
      .then((res) => res.json())
      .then((data) => setPrompts(data))
      .finally(() => setLoading(false));
  }, []);

  // Memoized, efficient search
  const filteredPrompts = useMemo(() => {
    if (!search.trim()) return prompts;
    const searchLower = search.toLowerCase();
    return prompts.filter((p) => {
      const title = (p.title || "").toLowerCase();
      const categories = Array.isArray(p.category)
        ? p.category.map((cat: string) => (cat || "").toLowerCase())
        : typeof p.category === "string"
        ? [(p.category || "").toLowerCase()]
        : [];
      return (
        title.includes(searchLower) ||
        categories.some((cat: string) => cat.includes(searchLower))
      );
    });
  }, [prompts, search]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredPrompts.length / PAGE_SIZE));
  const paginatedPrompts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredPrompts.slice(start, start + PAGE_SIZE);
  }, [filteredPrompts, page]);

  // Reset to first page when search/filter changes
  // Only reset to first page when search changes, not when prompts update
  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-white/10 backdrop-blur-xl bg-black/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Gallery
            </Button>
          </Link>
          <h1 className="text-2xl font-bold gradient-text">Manage Prompts</h1>
          <div className="flex gap-2 items-center">
            <a
              href="/admin/upload"
              className="text-primary underline hover:text-primary/80 text-sm font-medium"
            >
              Upload Prompts
            </a>
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-8">
        <div className="max-w-3xl mx-auto">
          <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Manage Prompts</CardTitle>
            <CardDescription>
              View, search, edit, or update all prompts in the gallery.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search by title or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredPrompts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No prompts found.
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedPrompts.map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded overflow-hidden border bg-card">
                          <Image
                            src={p.imageUrl}
                            alt={p.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-secondary-foreground truncate pr-4">
                            {p.title}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-xs">
                            {p.prompt}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Array.isArray(p.category)
                              ? p.category.map((cat: string) => (
                                  <Badge key={cat} variant="secondary">
                                    {cat}
                                  </Badge>
                                ))
                              : p.category && (
                                  <Badge variant="secondary">
                                    {p.category}
                                  </Badge>
                                )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingPrompt(p)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            if (
                              !window.confirm(
                                "Are you sure you want to delete this prompt?"
                              )
                            )
                              return;
                            try {
                              const res = await fetch(`/api/prompts/${p._id}`, {
                                method: "DELETE",
                              });
                              if (!res.ok) throw new Error("Failed to delete");
                              setPrompts((prev) =>
                                prev.filter((item) => item._id !== p._id)
                              );
                            } catch (err) {
                              alert("Failed to delete prompt.");
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Simple Pagination: up to 5 consecutive page numbers centered on current page */}
                <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
                  {(() => {
                    let start = Math.max(1, page - 2);
                    let end = Math.min(totalPages, start + 4);
                    if (end - start < 4) {
                      start = Math.max(1, end - 4);
                    }
                    const pageNumbers = [];
                    for (let i = start; i <= end; i++) {
                      pageNumbers.push(i);
                    }
                    return pageNumbers.map((num) => (
                      <Button
                        key={num}
                        size="sm"
                        variant={num === page ? "default" : "outline"}
                        onClick={() => setPage(num)}
                        className={num === page ? "font-bold" : ""}
                      >
                        {num}
                      </Button>
                    ));
                  })()}
                </div>
              </>
            )}
          </CardContent>
        </Card>
        {editingPrompt && (
          <EditPromptModal
            prompt={editingPrompt}
            onClose={() => setEditingPrompt(null)}
            onUpdated={(updatedPrompt) => {
              setPrompts((prev) =>
                prev.map((p) =>
                  p._id === updatedPrompt._id ? updatedPrompt : p
                )
              );
              setEditingPrompt(null);
            }}
          />
        )}
        </div>
      </div>
    </div>
  );
}
