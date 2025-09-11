'use client';

import { BillItem, Participant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ReceiptText, Trash2, Users } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

type BillItemsListProps = {
  items: BillItem[];
  participants: Participant[];
  removeItem: (id: string) => void;
  toggleItemParticipant: (itemId: string, participantId: string) => void;
  assignItemToAll: (itemId: string) => void;
  updateItem: (id: string, updates: Partial<BillItem>) => void;
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export function BillItemsList({ items, participants, removeItem, toggleItemParticipant, assignItemToAll, updateItem }: BillItemsListProps) {
  
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
        <ScrollArea className="h-[450px] -mx-4 sm:mx-0 sm:pr-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                <ReceiptText className="w-16 h-16 mb-4" />
                <p className="font-semibold">No items added yet</p>
                <p className="text-sm">Use the form above to add items to the bill.</p>
            </div>
          ) : (
            <div className="space-y-3 px-4 sm:px-0">
              {items.map(item => {
                const Icon = item.icon || ReceiptText;
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-secondary transition-all animate-in fade-in-0 zoom-in-95">
                    <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-secondary flex items-center justify-center">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>

                    <div className="flex-grow overflow-hidden">
                      <p className="font-semibold truncate">{item.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Paid by {getPayerName(item.paidById)} &middot; Split among {getParticipantNames(item.participantIds) || 'Unassigned'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="font-bold text-base sm:text-lg text-accent-foreground w-20 sm:w-24 text-right">{formatCurrency(item.price)}</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0">
                            <Users className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium leading-none font-headline">Assign Participants</h4>
                              <p className="text-sm text-muted-foreground">
                                Select who consumed and who paid for this item.
                              </p>
                            </div>
                            <Separator />
                            <div>
                                <h5 className="mb-2 text-sm font-medium">Paid By</h5>
                                <RadioGroup
                                    value={item.paidById}
                                    onValueChange={(newPaidById) => updateItem(item.id, { paidById: newPaidById })}
                                    className="gap-2"
                                >
                                    {participants.map(p => (
                                        <div key={`paid-${p.id}`} className="flex items-center space-x-2">
                                            <RadioGroupItem value={p.id} id={`paid-${item.id}-${p.id}`} />
                                            <Label htmlFor={`paid-${item.id}-${p.id}`}>{p.name}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                            <Separator />
                             <div>
                                <h5 className="mb-2 text-sm font-medium">Split With</h5>
                                <div className="grid gap-2">
                                  {participants.map(p => (
                                    <div key={`check-${p.id}`} className="flex items-center space-x-2 p-2 rounded-md hover:bg-secondary transition-colors -mx-2">
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
                                <Button variant="ghost" size="sm" onClick={() => assignItemToAll(item.id)} className="justify-start -mx-2 mt-2 w-full">
                                     Assign to Everyone
                                </Button>
                             </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0" onClick={() => removeItem(item.id)}>
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
