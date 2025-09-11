'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, QrCode, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import QRCode from 'qrcode.react';

export function ShareButton() {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);

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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="font-headline flex items-center gap-2"><QrCode /> Share Bill</DialogTitle>
                <DialogDescription>
                    Anyone with this link or QR code can view and edit this bill.
                </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center space-y-4 p-4">
                <div className="p-4 bg-white rounded-lg border">
                  <QRCode value={url} size={200} level="H" />
                </div>
                <p className="text-xs text-muted-foreground break-all">{url}</p>
            </div>
            <Button onClick={copyToClipboard} className="w-full">
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
            </Button>
        </DialogContent>
    </Dialog>
  );
}
