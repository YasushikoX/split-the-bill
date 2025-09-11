'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ShareButton() {
  const { toast } = useToast();
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link Copied!',
      description: "You can now share the bill with your friends.",
    });
  };

  return (
    <Button onClick={copyToClipboard} variant="outline">
      <Share2 className="mr-2 h-4 w-4" />
      Share
    </Button>
  );
}
