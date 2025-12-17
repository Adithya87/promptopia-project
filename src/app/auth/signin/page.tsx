"use client";

import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Check if profile is already complete
      if (session.user.profileComplete) {
        // Profile already exists, go to home
        router.push("/");
      } else {
        // New user or incomplete profile, go to profile completion
        router.push("/auth/profile");
      }
    }
  }, [session, status, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", { redirect: false });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md">
        <div className="glass-dark p-8 text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-black gradient-text mb-2">Promptopia</h1>
            <p className="text-gray-300 text-lg font-light">✨ Your Ultimate AI Image Prompt Gallery</p>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-gray-300 text-sm font-light leading-relaxed">
                🚀 Sign in with your Google account to upload prompts, like your favorite creations, and build your creator profile.
              </p>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full gradient-btn text-white font-semibold py-6 transition-all duration-300 text-lg"
            >
              <Mail className="mr-2 h-5 w-5" />
              {isLoading ? "✨ Signing in..." : "🔐 Sign in with Google"}
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-xs text-gray-500 font-light">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
