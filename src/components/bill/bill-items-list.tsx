'use client';

import { BillItem, Participant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ReceiptText, Trash2, Users } from 'lucide-react';
import { Badge } from '../ui/badge';

type BillItemsListProps = {
  items: BillItem[];
  participants: Participant[];
  removeItem: (id: string) => void;
  toggleItemParticipant: (itemId: string, participantId: string) => void;
  assignItemToAll: (itemId: string) => void;
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export function BillItemsList({ items, participants, removeItem, toggleItemParticipant, assignItemToAll }: BillItemsListProps) {
  
  const getParticipantNames = (participantIds: string[]) => {
    if (participantIds.length === participants.length || (participantIds.length === 0 && participants.length > 0)) return 'Everyone';
    if (participantIds.length === 0) return 'Unassigned';
    if (participantIds.length > 2) return `${participantIds.length} people`;
    return participants
      .filter(p => participantIds.includes(p.id))
      .map(p => p.name.split(' ')[0])
      .join(', ');
  };
  
  const getPayerName = (paidById: string) => {
    return participants.find(p => p.id === paidById)?.name || 'N/A';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Bill Items</CardTitle>
        <CardDescription>Manage items and assign them to participants.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="min-h-48 max-h-[450px] pr-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground p-8">
                <ReceiptText className="w-16 h-16 mb-4" />
                <p className="font-semibold">No items added yet</p>
                <p className="text-sm">Use the form above to add items to the bill.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => {
                const Icon = item.icon || ReceiptText;
                return (
                  <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-secondary transition-all animate-in fade-in-0 zoom-in-95">
                    <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>

                    <div className="flex-grow">
                      <p className="font-semibold">{item.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Consumed by: {getParticipantNames(item.participantIds) || 'Unassigned'}</span>
                        <Separator orientation='vertical' className="h-4" />
                        <span>Paid by: <Badge variant="secondary">{getPayerName(item.paidById)}</Badge></span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-accent w-24 text-right">{formatCurrency(item.price)}</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="icon" className="h-9 w-9">
                            <Users className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium leading-none font-headline">Split Item</h4>
                              <p className="text-sm text-muted-foreground">
                                Assign this item to participants.
                              </p>
                            </div>
                            <Separator />
                             <Button variant="ghost" size="sm" onClick={() => assignItemToAll(item.id)} className="justify-start -mx-2">
                                 Assign to Everyone
                             </Button>
                             <Separator />
                            <div className="grid gap-2">
                              {participants.map(p => (
                                <div key={p.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-secondary transition-colors">
                                  <Checkbox
                                    id={`check-${item.id}-${p.id}`}
                                    checked={item.participantIds.includes(p.id)}
                                    onCheckedChange={() => toggleItemParticipant(item.id, p.id)}
                                  />
                                  <label htmlFor={`check-${item.id}-${p.id}`} className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {p.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-9 w-9" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
