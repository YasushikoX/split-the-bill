'use client';

import { createBillSession } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus2, History } from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import { useEffect, useState } from 'react';
import { HistoryDialog } from '@/components/bill/history-dialog';

export default function Home() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="items-center text-center">
          <Logo className="h-16 w-16 mb-4" />
          <CardTitle className="font-headline text-4xl font-bold text-primary">Split The Bill</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            The simplest way to divide expenses with friends.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 pt-2">
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Create a session, add your items, and share the link. It's that easy.
          </p>
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <form action={createBillSession} className="w-full flex-1">
              <Button size="lg" className="w-full text-lg font-semibold h-full" variant="default">
                <FilePlus2 className="mr-2 h-5 w-5" />
                New Bill
              </Button>
            </form>
            <Button size="lg" variant="outline" className="text-lg flex-1 h-full" onClick={() => setIsHistoryOpen(true)}>
              <History className="mr-2 h-5 w-5" />
              History
            </Button>
          </div>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {year} Stable Co. All rights reserved.</p>
      </footer>
      <HistoryDialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen} />
    </div>
  );
}
