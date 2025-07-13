"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

interface CopyButtonProps extends React.ComponentProps<typeof Button> {
  textToCopy: string;
}

export default function CopyButton({ textToCopy, className, ...props }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "The prompt is now in your clipboard.",
      })
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        variant: "destructive",
        title: "Oops! Something went wrong.",
        description: "Could not copy the prompt.",
      })
    }
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <Button
      onClick={handleCopy}
      variant="default"
      className="bg-accent text-accent-foreground hover:bg-accent/90"
      {...props}
    >
      {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
      {isCopied ? 'Copied!' : 'Copy Prompt'}
    </Button>
  );
}
