import { Logo } from '@/components/icons/logo';
import { ShareButton } from './share-button';

export function Header() {
  return (
    <header className="flex items-center justify-between pb-8">
      <div className="flex items-center gap-3">
        <Logo className="h-10 w-10" />
        <h1 className="text-2xl md:text-3xl font-bold font-headline text-accent">
          Split The Bill
        </h1>
      </div>
      <ShareButton />
    </header>
  );
}
