
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAdminAuth } from '@/context/admin-auth-context';
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { prompts } from '@/lib/data';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, Loader2, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function AdminUploadPage() {
  const { isAdmin, logout, isMounted } = useAdminAuth();
  const router = useRouter();
  const { toast } = useToast()

  const [title, setTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // State to force re-render when prompts array is mutated
  const [promptsVersion, setPromptsVersion] = useState(0);

  useEffect(() => {
    if (isMounted && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isMounted, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
        setImageFile(null);
        setImagePreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
        toast({
            variant: 'destructive',
            title: 'Image Required',
            description: 'Please select an image to upload.',
        });
        return;
    }
    
    const newId = prompts.length > 0 ? Math.max(...prompts.map(p => p.id)) + 1 : 1;
    const newPrompt = {
      id: newId,
      title,
      prompt: promptText,
      imageUrl: imagePreview,
      aiHint: title.toLowerCase().split(' ').slice(0, 2).join(' '),
    };
    prompts.unshift(newPrompt);
    setPromptsVersion(v => v + 1);
    
    toast({
      title: "Upload Successful",
      description: "The new prompt has been added to the gallery.",
    })

    // Reset form
    setTitle('');
    setPromptText('');
    setImageFile(null);
    setImagePreview(null);
    // Reset file input visually
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleDelete = (idToDelete: number) => {
    const promptIndex = prompts.findIndex(p => p.id === idToDelete);
    if (promptIndex > -1) {
      const deletedTitle = prompts[promptIndex].title;
      prompts.splice(promptIndex, 1);
      setPromptsVersion(v => v + 1); // Trigger re-render
      toast({
        title: "Prompt Deleted",
        description: `"${deletedTitle}" has been removed from the gallery.`,
      })
    }
  }

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
                <Button variant="ghost" onClick={handleLogout}>Logout</Button>
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
                        <Button type="submit" className="w-full">
                            <UploadCloud className="mr-2 h-4 w-4" />
                            Upload Prompt
                        </Button>
                    </CardContent>
                </form>
            </Card>

            <Separator />

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="text-2xl">Manage Prompts</CardTitle>
                    <CardDescription>Delete existing prompts from the gallery.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {prompts.length > 0 ? (
                            prompts.map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                    <span className="font-medium text-secondary-foreground truncate pr-4">{p.title}</span>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center">No prompts in the gallery yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
