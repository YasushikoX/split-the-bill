'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BillHistoryEntry } from '@/lib/types';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format, formatDistanceToNow, isValid } from 'date-fns';
import { History, Trash2 } from 'lucide-react';

type HistoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function HistoryDialog({ open, onOpenChange }: HistoryDialogProps) {
  const [history, setHistory] = useState<BillHistoryEntry[]>([]);

  useEffect(() => {
    if (open) {
      const storedHistory = localStorage.getItem('billHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    }
  }, [open]);

  const clearHistory = () => {
    localStorage.removeItem('billHistory');
    setHistory([]);
    onOpenChange(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'MMMM d, yyyy') : 'Invalid date';
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : '';
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline">
             <History className="h-6 w-6" /> Bill History
          </DialogTitle>
          <DialogDescription>
            Here are the recent bills you've accessed on this device.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] -mx-6 px-6">
            {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-16">
                    <History className="w-16 h-16 mb-4" />
                    <p className="font-semibold">No History Found</p>
                    <p className="text-sm">Create a new bill to start your history.</p>
                </div>
            ) : (
                <div className="space-y-2 py-2">
                    {history.map(entry => (
                    <div key={entry.id}>
                        <Link href={`/bill/${entry.id}`} passHref>
                            <div
                                onClick={() => onOpenChange(false)}
                                className="flex justify-between items-center p-3 rounded-lg border bg-card hover:bg-secondary transition-colors cursor-pointer"
                            >
                                <div className="flex-grow">
                                    <p className="font-semibold truncate">{entry.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(entry.date)} &middot;{' '}
                                        <span className="italic">
                                            {formatRelativeDate(entry.accessedAt)}
                                        </span>
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground font-mono ml-4">{entry.id}</p>
                            </div>
                        </Link>
                    </div>
                    ))}
                </div>
            )}
        </ScrollArea>
        {history.length > 0 && (
          <div className="pt-4 flex justify-end">
            <Button variant="destructive" size="sm" onClick={clearHistory}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear History
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
