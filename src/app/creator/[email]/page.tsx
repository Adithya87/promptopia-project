"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail } from "lucide-react";
import type { PromptData } from "@/types/prompt";

interface CreatorProfilePageProps {
  params: { email: string };
}

export default function CreatorProfilePage({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [creator, setCreator] = useState<any>(null);
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    params.then((p) => {
      const decodedEmail = decodeURIComponent(p.email);
      setEmail(decodedEmail);
      fetchCreatorData(decodedEmail);
    });
  }, [params]);

  const fetchCreatorData = async (creatorEmail: string) => {
    try {
      setIsLoading(true);
      // Fetch creator profile
      const profileRes = await fetch(`/api/user/profile?email=${encodeURIComponent(creatorEmail)}`);
      if (profileRes.ok) {
        const userData = await profileRes.json();
        setCreator(userData);
      }

      // Fetch all prompts by this creator
      const promptsRes = await fetch(`/api/prompts/creator?email=${encodeURIComponent(creatorEmail)}`);
      if (promptsRes.ok) {
        const promptData = await promptsRes.json();
        setPrompts(promptData);
      }
    } catch (err) {
      console.error("Failed to fetch creator data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Loading creator profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <div className="border-b border-white/10 backdrop-blur-xl bg-black/40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white hover:bg-white/10 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold gradient-text">Creator Profile</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {creator ? (
          <>
            {/* Creator Info Card */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 mb-8 hover-lift">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24 ring-4 ring-purple-500/50">
                    <AvatarImage src={creator.image} alt={creator.name} />
                    <AvatarFallback className="text-xl bg-gradient-to-br from-purple-500 to-pink-500">
                      {creator.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <h2 className="text-3xl font-bold gradient-text mb-2">
                      {creator.name || "Unknown Creator"}
                    </h2>
                    <div className="flex items-center gap-2 text-gray-400 mb-4">
                      <Mail className="h-4 w-4" />
                      <p className="text-sm">{creator.email}</p>
                    </div>
                    {creator.bio && (
                      <p className="text-gray-300 mb-6 font-light">{creator.bio}</p>
                    )}
                    <div className="flex gap-8">
                      <div>
                        <p className="text-3xl font-bold gradient-text">
                          {prompts.length}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">Prompts Created</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold gradient-text">
                          {prompts.reduce((sum, p) => sum + (p.likes || 0), 0)}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">Total Likes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prompts Grid */}
            <div>
              <h3 className="text-2xl font-bold gradient-text mb-8">
                ✨ All Prompts by {creator.name || "This Creator"}
              </h3>
              {prompts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {prompts.map((prompt) => (
                    <Card
                      key={prompt._id}
                      className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 overflow-hidden hover-lift cursor-pointer group"
                      onClick={() => router.push(`/prompts/${prompt._id}`)}
                    >
                      <div className="relative h-48 bg-slate-800 overflow-hidden">
                        <Image
                          src={prompt.imageUrl}
                          alt={prompt.title}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <CardTitle className="text-lg mb-2 text-white line-clamp-2">
                          {prompt.title}
                        </CardTitle>
                        {prompt.category && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Array.isArray(prompt.category) ? (
                              prompt.category.slice(0, 2).map((cat: string) => (
                                <Badge key={cat} variant="secondary" className="badge-gradient text-xs">
                                  {cat}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="secondary" className="badge-gradient text-xs">
                                {prompt.category}
                              </Badge>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                          <span className="text-sm text-gray-400">❤️ {prompt.likes || 0}</span>
                          <span className="text-xs text-gray-500">View Details →</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-lg">No prompts from this creator yet.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-gray-400 py-12">
            <p className="text-lg">Creator not found</p>
          </div>
        )}
      </div>
    </div>
  );
}
