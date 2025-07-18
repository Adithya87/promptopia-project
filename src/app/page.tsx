import Link from 'next/link';
import PromptGallery from '@/components/prompt-gallery';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <header className="text-center mb-12">
          <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-bold text-primary">
            Promptopia
          </h1>
          <p className="text-muted-foreground mt-2 text-lg sm:text-xl" aria-label="App description">
            Your Ultimate AI Image Prompt Gallery
          </p>
        </header>

        <PromptGallery />
      </div>

      <footer className="text-center p-4 text-muted-foreground">
        Built with love for AI art.{' '}
        <Link
          href="/admin/login"
          className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm ml-1"
        >
          Admin
        </Link>
      </footer>
    </main>
  );
}
