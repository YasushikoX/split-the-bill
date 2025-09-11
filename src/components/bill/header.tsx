import { Logo } from '@/components/icons/logo';
import { ShareButton } from './share-button';

export function Header({ billId }: { billId: string }) {
  return (
    <header className="flex items-center justify-between pb-4 border-b">
      <div className="flex items-center gap-3">
        <Logo className="h-10 w-10" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline text-accent">
            Split The Bill
          </h1>
          <p className="text-xs text-muted-foreground font-mono">ID: {billId}</p>
        </div>
      </div>
      <ShareButton />
    </header>
  );
}
