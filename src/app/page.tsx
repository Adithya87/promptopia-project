import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import PromptGallery from '@/components/prompt-gallery';
import Image from 'next/image';
import { UploadCloud, LogOut, User } from 'lucide-react';

async function AuthButtons() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex items-center gap-4">
      {session?.user ? (
        <>
          <Link href="/user/upload">
            <Button className="bg-accent hover:bg-accent/90">
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload Prompt
            </Button>
          </Link>
          <Link href="/user/profile">
            <Button variant="outline" className="border-zinc-600 text-gray-300 hover:bg-zinc-800">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </Link>
        </>
      ) : (
        <Link href="/auth/signin">
          <Button className="bg-accent hover:bg-accent/90">
            Sign in
          </Button>
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header with Title and Auth Buttons */}
      <div className="border-b border-white/10 backdrop-blur-xl bg-black/40">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex-1" />
          <h1 className="font-headline text-5xl font-black flex-1 text-center gradient-text">
            Promptopia
          </h1>
          <div className="flex-1 flex justify-end">
            <AuthButtons />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <p className="text-lg sm:text-xl text-gray-300 font-light tracking-wide">
            🎨 Your Ultimate AI Image Prompt Gallery
          </p>
        </header>

        <PromptGallery />
      </div>

      <footer className="text-center p-8 text-gray-400 border-t border-white/10 backdrop-blur-md">
        <p className="font-light">Built with ❤️ for AI art creators.</p>
        <Link
          href="/admin/login"
          className="text-xs text-gray-500 hover:text-purple-400 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm mt-2 inline-block"
        >
          Admin
        </Link>
      </footer>
    </main>
  );
}
