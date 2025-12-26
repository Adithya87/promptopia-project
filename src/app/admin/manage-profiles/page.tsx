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
import EditProfileModal from "@/components/admin/edit-profile-modal";

interface UserProfile {
  _id: string;
  email: string;
  name: string;
  image?: string;
  bio?: string;
  createdAt: string;
}

export default function ManageProfilesPage() {
  const router = useRouter();
  const handleLogout = () => {
    router.push("/admin/login");
  };
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setProfiles(data))
      .finally(() => setLoading(false));
  }, []);

  // Memoized, efficient search
  const filteredProfiles = useMemo(() => {
    if (!search.trim()) return profiles;
    const searchLower = search.toLowerCase();
    return profiles.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const email = (p.email || "").toLowerCase();
      return name.includes(searchLower) || email.includes(searchLower);
    });
  }, [profiles, search]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredProfiles.length / PAGE_SIZE));
  const paginatedProfiles = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProfiles.slice(start, start + PAGE_SIZE);
  }, [filteredProfiles, page]);

  // Reset to first page when search/filter changes
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
          <h1 className="text-2xl font-bold gradient-text">Manage Profiles</h1>
          <div className="flex gap-2 items-center">
            <a
              href="/admin/upload"
              className="text-primary underline hover:text-primary/80 text-sm font-medium"
            >
              Upload Prompts
            </a>
            <a
              href="/admin/manage"
              className="text-primary underline hover:text-primary/80 text-sm font-medium"
            >
              Manage Prompts
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
              <CardTitle className="text-2xl">Manage Profiles</CardTitle>
              <CardDescription>
                View, search, edit, or delete all user profiles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : filteredProfiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No profiles found.
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {paginatedProfiles.map((p) => (
                      <div
                        key={p._id}
                        className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-full overflow-hidden border bg-card">
                            {p.image ? (
                              <Image
                                src={p.image}
                                alt={p.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                {(p.name || "U")[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-secondary-foreground truncate pr-4">
                              {p.name || "No Name"}
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              {p.email}
                            </div>
                            {p.bio && (
                              <div className="text-xs text-muted-foreground truncate max-w-xs mt-1">
                                {p.bio}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">
                              Joined: {new Date(p.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingProfile(p)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              if (
                                !window.confirm(
                                  "Are you sure you want to delete this profile?"
                                )
                              )
                                return;
                              try {
                                const res = await fetch(`/api/admin/users/${p._id}`, {
                                  method: "DELETE",
                                });
                                if (!res.ok) throw new Error("Failed to delete");
                                setProfiles((prev) =>
                                  prev.filter((item) => item._id !== p._id)
                                );
                              } catch (err) {
                                alert("Failed to delete profile.");
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
          {editingProfile && (
            <EditProfileModal
              profile={editingProfile}
              onClose={() => setEditingProfile(null)}
              onUpdated={(updatedProfile) => {
                setProfiles((prev) =>
                  prev.map((p) =>
                    p._id === updatedProfile._id ? updatedProfile : p
                  )
                );
                setEditingProfile(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
