"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CATEGORIES } from "@/lib/constants/categories";
import Image from "next/image";

interface EditPromptModalProps {
  prompt: any;
  onClose: () => void;
  onUpdated: (updated: any) => void;
}

export default function EditPromptModal({
  prompt,
  onClose,
  onUpdated,
}: EditPromptModalProps) {
  const { toast } = useToast();

  const [title, setTitle] = useState(prompt.title || "");
  const [promptText, setPromptText] = useState(prompt.prompt || "");
  const [categories, setCategories] = useState<string[]>(
    Array.isArray(prompt.category)
      ? prompt.category
      : [prompt.category].filter(Boolean)
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setPreviewUrl(null);
    }
  };

  const handleUpdate = async () => {
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("prompt", promptText);
      categories.forEach((cat) => formData.append("category", cat));
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`/api/prompts/${prompt._id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error();

      const updated = await res.json();
      toast({
        title: "Prompt Updated",
        description: "Changes saved successfully.",
      });
      onUpdated(updated);
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Something went wrong while saving changes.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Prompt</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={5}
              required
            />
          </div>

          <div>
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
                    id={`cat-edit-${cat}`}
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

          <div>
            <Label htmlFor="image">Image (optional)</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file:text-primary file:font-medium"
            />
            {(previewUrl || prompt.image) && (
              <div className="mt-3 relative w-full h-64 rounded overflow-hidden border">
                <Image
                  src={previewUrl || prompt.image}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
