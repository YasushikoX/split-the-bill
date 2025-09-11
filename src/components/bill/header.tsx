import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bill } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { ShareButton } from './share-button';
import { ThemeToggleButton } from './theme-toggle-button';
import Link from 'next/link';

type HeaderProps = {
  bill: Bill | null;
  updateBill: (updates: Partial<Bill>) => void;
};

export function Header({ bill, updateBill }: HeaderProps) {
  
  if (!bill) {
    return (
      <header className="flex items-center justify-between pb-4 border-b">
         {/* Skeleton Loader */}
      </header>
    );
  }

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b gap-4">
      <div className="flex-grow flex items-center gap-2 w-full">
        <Link href="/" aria-label="Go back to homepage">
            <Button variant="outline" size="icon" className="h-10 w-10 flex-shrink-0">
                <ArrowLeft className="h-5 w-5" />
            </Button>
        </Link>
        <div className="flex-grow">
            <Input
                value={bill.title}
                onChange={(e) => updateBill({ title: e.target.value })}
                placeholder="Untitled Bill"
                className="text-2xl md:text-3xl font-bold font-headline h-auto p-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <div className="flex flex-wrap items-center gap-2 mt-2">
                <Popover>
                <PopoverTrigger asChild>
                    <Button
                    variant={'outline'}
                    size="sm"
                    className={cn(
                        'w-full sm:w-[200px] justify-start text-left font-normal',
                        !bill.date && 'text-muted-foreground'
                    )}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {bill.date ? format(new Date(bill.date), 'PPP') : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                    mode="single"
                    selected={bill.date ? new Date(bill.date) : undefined}
                    onSelect={(date) => updateBill({ date: date?.toISOString() })}
                    initialFocus
                    />
                </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-1 rounded-md">ID: {bill.id}</p>
            </div>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-center">
        <ShareButton />
        <ThemeToggleButton />
      </div>
    </header>
  );
}
