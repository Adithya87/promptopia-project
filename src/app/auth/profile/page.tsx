"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uploadImageAction } from "@/lib/upload-action";

export default function CompleteProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    
    // If profile is already complete, redirect to home
    if (status === "authenticated" && (session?.user as any)?.profileComplete) {
      router.push("/");
      return;
    }
    
    if (session?.user) {
      setName(session.user.name || "");
      setImagePreview(session.user.image || "");
    }
  }, [session, status, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!name.trim()) {
        setError("Name is required");
        setIsLoading(false);
        return;
      }

      let imageUrl = imagePreview;

      if (image) {
        const buffer = Buffer.from(await image.arrayBuffer());
        const uploadRes = await uploadImageAction(buffer);
        imageUrl = uploadRes.secure_url;
      }

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          image: imageUrl,
          email: session?.user?.email,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      // Redirect to home or dashboard
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-md">
        <div className="glass-dark p-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">✨ Complete Your Profile</h1>
          <p className="text-gray-300 mb-8 font-light">Set up your creator profile to start uploading amazing prompts</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                📷 Profile Picture
              </label>
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-900 to-pink-900 border-4 border-purple-500/50 ring-2 ring-purple-500/30">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">
                      <span className="text-2xl">📷</span>
                    </div>
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm bg-white/5 border-white/20 text-gray-300 file:bg-gradient-to-r file:from-purple-600 file:to-pink-600 file:text-white file:border-0"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="bg-white/5 border-white/20 text-white focus:ring-purple-500"
                required
              />
            </div>

            {/* Email (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="bg-white/5 border-white/20 text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio (Optional)
              </label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself and your creative process..."
                className="bg-white/5 border-white/20 text-white resize-none focus:ring-purple-500"
                rows={3}
              />
            </div>

            {error && (
              <div className="bg-gray-800/30 border border-gray-600/50 text-gray-300 px-4 py-3 rounded-lg backdrop-blur-sm">
                ⚠️ {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="gradient-btn w-full text-white font-semibold py-6 transition-all duration-300"
            >
              {isLoading ? "✨ Setting up..." : "🚀 Complete Profile"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <Button
              onClick={() => signOut()}
              variant="ghost"
              className="w-full text-gray-400 hover:text-gray-300 transition"
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
