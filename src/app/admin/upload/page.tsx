'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, Loader2, Trash2 } from 'lucide-react';

import { useAdminAuth } from '@/context/admin-auth-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CATEGORIES } from '@/lib/constants/categories';
import EditPromptModal from '@/components/admin/edit-prompt-modal'; // ✅ modal component

export default function AdminUploadPage() {
  const { isAdmin, logout, isMounted } = useAdminAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<any | null>(null); // ✅ modal state

  useEffect(() => {
    if (isMounted && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isMounted, router]);

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/prompts/all')
        .then(res => res.json())
        .then(data => setPrompts(data))
        .catch(err => console.error('Failed to fetch prompts:', err));
    }
  }, [isAdmin]);

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
        variant: 'destructive',
        title: 'Image Required',
        description: 'Please select an image to upload.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('prompt', promptText);
    formData.append('category', category);
    formData.append('image', imageFile);

    try {
      setLoading(true);
      const res = await fetch('/api/prompts', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const newPrompt = await res.json();
      setPrompts(prev => [newPrompt, ...prev]);

      toast({
        title: 'Upload Successful',
        description: 'The new prompt has been added to the gallery.',
      });

      setTitle('');
      setPromptText('');
      setCategory('');
      setImageFile(null);
      setImagePreview(null);
      (document.getElementById('image') as HTMLInputElement).value = '';
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'An error occurred during upload.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error();

      setPrompts(prev => prev.filter(p => p._id !== id));

      toast({
        title: 'Prompt Deleted',
        description: 'Prompt removed from the gallery.',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
      });
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

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
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Upload New Prompt</CardTitle>
            <CardDescription>Add a new image prompt to the gallery.</CardDescription>
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
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  aria-label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                >
                  <option value="" disabled>Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
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
                    <Image src={imagePreview} alt="Image preview" fill className="object-contain" />
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

        <Separator />

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Manage Prompts</CardTitle>
            <CardDescription>Delete or edit existing prompts in the gallery.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prompts.length > 0 ? (
                prompts.map((p) => (
                  <div key={p._id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <span className="font-medium text-secondary-foreground truncate pr-4">{p.title}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPrompt(p)} // ✅ open modal
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(p._id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center">No prompts in the gallery yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ✅ Modal UI for editing */}
      {editingPrompt && (
        <EditPromptModal
          prompt={editingPrompt}
          onClose={() => setEditingPrompt(null)}
          onUpdated={(updatedPrompt) => {
            setPrompts((prev) =>
              prev.map((p) => (p._id === updatedPrompt._id ? updatedPrompt : p))
            );
            setEditingPrompt(null);
          }}
        />
      )}
    </div>
  );
}
