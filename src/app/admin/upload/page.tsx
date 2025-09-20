"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, UploadCloud, Loader2 } from "lucide-react";
import { useAdminAuth } from "@/context/admin-auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/constants/categories";

export default function AdminUploadPage() {
  const { isAdmin, logout, isMounted } = useAdminAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [promptText, setPromptText] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if not admin
  if (isMounted && !isAdmin) {
    router.push("/admin/login");
    return null;
  }
  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4">Loading...</p>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast({
        variant: "destructive",
        title: "Image Required",
        description: "Please select an image to upload.",
      });
      return;
    }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("prompt", promptText);
    categories.forEach((cat) => formData.append("category", cat));
    formData.append("image", imageFile);
    try {
      setLoading(true);
      const res = await fetch("/api/prompts", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      setTitle("");
      setPromptText("");
      setCategories([]);
      setImageFile(null);
      setImagePreview(null);
      (document.getElementById("image") as HTMLInputElement).value = "";
      toast({
        title: "Upload Successful",
        description: "The new prompt has been added to the gallery.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "An error occurred during upload.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Gallery
            </Link>
          </Button>
          <div className="flex gap-2 items-center">
            <a
              href="/admin/manage"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80 text-sm font-medium"
            >
              Manage Prompts
            </a>
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Upload New Prompt</CardTitle>
            <CardDescription>
              Add a new image prompt to the gallery.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Cosmic Ocean"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Enter the full AI prompt here..."
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  required
                  rows={5}
                />
              </div>
              <div className="grid gap-2">
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={categories.includes(cat)}
                        onChange={(e) => {
                          setCategories((prev) =>
                            e.target.checked
                              ? [...prev, cat]
                              : prev.filter((c) => c !== cat)
                          );
                        }}
                        id={`cat-${cat}`}
                        className="accent-primary"
                      />
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          categories.includes(cat)
                            ? "bg-primary text-primary-foreground"
                            : "border-input text-foreground"
                        }`}
                      >
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  Select one or more categories.
                </span>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  onChange={handleImageChange}
                  accept="image/jpeg, image/png, image/jpg"
                  required
                  className="file:text-primary file:font-medium"
                />
                {imagePreview && (
                  <div className="mt-4 relative h-64 w-full max-w-sm mx-auto rounded-md overflow-hidden border">
                    <Image
                      src={imagePreview}
                      alt="Image preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <CardContent>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload Prompt
                  </>
                )}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
