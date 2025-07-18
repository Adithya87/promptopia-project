'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/context/admin-auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/constants/categories';

export default function EditPromptPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { isAdmin, isMounted } = useAdminAuth();

  const [title, setTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  const [category, setCategory] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect non-admins
  useEffect(() => {
    if (isMounted && !isAdmin) router.push('/admin/login');
  }, [isAdmin, isMounted, router]);

  // Fetch prompt data
  useEffect(() => {
    const fetchPrompt = async () => {
      const res = await fetch(`/api/prompts/${params.id}`);
      if (!res.ok) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load prompt.',
        });
        router.push('/admin/upload');
        return;
      }
      const data = await res.json();
      setTitle(data.title);
      setPromptText(data.prompt);
      setCategory(data.category);
      setImagePreview(data.imageUrl);
    };

    if (isAdmin && params.id) {
      fetchPrompt();
    }
  }, [isAdmin, params.id, router, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('prompt', promptText);
    formData.append('category', category);
    if (imageFile) formData.append('image', imageFile);

    setLoading(true);

    try {
      const res = await fetch(`/api/prompts/${params.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) throw new Error();

      toast({
        title: 'Prompt Updated',
        description: 'Changes have been saved.',
      });

      router.push('/admin/upload');
    } catch {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Button variant="outline" className="mb-6" onClick={() => router.push('/admin/upload')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Upload
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Prompt</CardTitle>
          <CardDescription>Modify the details and update the image (optional).</CardDescription>
        </CardHeader>

        <form onSubmit={handleUpdate}>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
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
                name="category"
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
              <Label htmlFor="image">Replace Image (optional)</Label>
              <Input
                id="image"
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="relative h-64 w-full max-w-sm mx-auto rounded-md overflow-hidden border mt-4">
                  <Image src={imagePreview} alt="Prompt image" fill className="object-contain" />
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
