"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadImageAction } from "@/lib/upload-action";
import { ArrowLeft, Camera, Loader2, Edit2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UserProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [promptCount, setPromptCount] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);

  // Load user profile
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user?.email) {
      fetchUserProfile();
      fetchUserStats();
    }
  }, [session, status, router]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`/api/user/profile?email=${session?.user?.email}`);
      if (res.ok) {
        const user = await res.json();
        setName(user.name || "");
        setBio(user.bio || "");
        setImage(user.image || "");
        setImagePreview(user.image || "");
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const res = await fetch(`/api/user/stats?email=${session?.user?.email}`);
      if (res.ok) {
        const stats = await res.json();
        setPromptCount(stats.promptCount || 0);
        setTotalLikes(stats.totalLikes || 0);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl = image;

      if (imageFile) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
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

      setImage(imageUrl);
      setImageFile(null);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <div className="border-b border-white/10 backdrop-blur-xl bg-black/40 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-300 hover:text-white transition">
            <ArrowLeft className="h-5 w-5" />
            Back
          </Link>
          <h1 className="text-2xl font-bold gradient-text">My Profile</h1>
          <div className="w-12" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Profile Card */}
          <div className="md:col-span-1">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 sticky top-20">
              <CardContent className="p-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500 mb-4 bg-slate-800 ring-2 ring-purple-500/50">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-400">
                        <Camera className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <label className="mb-4">
                      <div className="cursor-pointer px-4 py-2 gradient-btn rounded-lg transition text-sm text-white font-medium">
                        📷 Change Photo
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}

                  {/* Email */}
                  <p className="text-gray-400 text-sm text-center">{session?.user?.email}</p>

                  {/* Stats */}
                  <div className="mt-6 w-full space-y-4 pt-6 border-t border-white/10">
                    <div className="text-center">
                      <p className="text-3xl font-bold gradient-text">{promptCount}</p>
                      <p className="text-xs text-gray-400 mt-1">Prompts Created</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold gradient-text">{totalLikes}</p>
                      <p className="text-xs text-gray-400 mt-1">Total Likes</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 w-full space-y-2">
                    {!isEditing ? (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="gradient-btn w-full text-white"
                      >
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isLoading}
                          className="gradient-btn w-full text-white"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditing(false);
                            setImageFile(null);
                            setImagePreview(image);
                          }}
                          variant="outline"
                          className="w-full border-white/20 text-gray-300 hover:bg-white/10"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Sign Out */}
                  <Button
                    onClick={() => signOut()}
                    variant="ghost"
                    className="w-full mt-2 text-gray-400 hover:text-gray-300 transition"
                  >
                    Sign out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Edit Form */}
          <div className="md:col-span-2">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">{isEditing ? "✏️ Edit Profile" : "Profile Information"}</CardTitle>
                <CardDescription className="text-gray-400">
                  {isEditing ? "Update your profile details" : "Your public profile information"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="bg-white/5 border-white/20 text-white focus:ring-purple-500"
                      disabled={isLoading}
                    />
                  ) : (
                    <p className="text-white text-lg">{name || "Not set"}</p>
                  )}
                </div>

                {/* Email (readonly) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <p className="text-gray-400">{session?.user?.email}</p>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="bg-white/5 border-white/20 text-white resize-none focus:ring-purple-500"
                      rows={4}
                      disabled={isLoading}
                    />
                  ) : (
                    <p className="text-gray-400">{bio || "No bio added yet"}</p>
                  )}
                </div>

                {/* Quick Links */}
                <div className="pt-6 border-t border-white/10 space-y-3">
                  <h3 className="text-sm font-medium text-gray-300">Quick Actions</h3>
                  <Link href="/user/upload">
                    <Button className="gradient-btn w-full text-white">
                      ⬆️ Upload New Prompt
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="w-full border-white/20 text-gray-300 hover:bg-white/10">
                      🏠 Browse Gallery
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
