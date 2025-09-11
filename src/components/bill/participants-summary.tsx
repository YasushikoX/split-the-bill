'use client';

import { BillItem, Participant } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AddParticipantForm } from './add-participant-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';

type ParticipantsSummaryProps = {
  participants: Participant[];
  items: BillItem[];
  addParticipant: (name: string) => void;
  removeParticipant: (id: string) => void;
};

export function ParticipantsSummary({ participants, items, addParticipant, removeParticipant }: ParticipantsSummaryProps) {
  const participantTotals = new Map<string, number>();
  let grandTotal = 0;

  items.forEach(item => {
    grandTotal += item.price;
    let participantIdsForItem = item.participantIds;

    // If an item has no assigned participants and there are participants in the bill,
    // assign it to everyone by default.
    if (item.participantIds.length === 0 && participants.length > 0) {
      participantIdsForItem = participants.map(p => p.id);
    }

    if (participantIdsForItem.length > 0) {
      const splitPrice = item.price / participantIdsForItem.length;
      participantIdsForItem.forEach(pId => {
        participantTotals.set(pId, (participantTotals.get(pId) || 0) + splitPrice);
      });
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="font-headline">Participants</CardTitle>
        <CardDescription>Add participants and see their totals.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <AddParticipantForm addParticipant={addParticipant} />
        <Separator />
        <ScrollArea className="h-64">
          <div className="flex flex-col gap-4 pr-4">
            {participants.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No participants added yet.</p>
            ) : (
              participants.map(participant => (
                <div key={participant.id} className="group flex items-center justify-between gap-4 transition-colors p-2 rounded-lg hover:bg-secondary">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{participant.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{participant.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">{formatCurrency(participantTotals.get(participant.id) || 0)}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeParticipant(participant.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2 pt-4">
         <Separator />
         <div className="flex justify-between items-center pt-4">
            <p className="text-lg font-bold font-headline">Grand Total</p>
            <p className="text-lg font-bold font-headline text-accent">{formatCurrency(grandTotal)}</p>
         </div>
      </CardFooter>
    </Card>
  );
}
