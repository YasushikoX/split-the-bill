'use client';

import { BillItem, Participant } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AddParticipantForm } from './add-participant-form';
import { Separator } from '@/components/ui/separator';
import { Button } from '../ui/button';
import { ArrowRight, Trash2, UserPlus, Users } from 'lucide-react';
import { useMemo } from 'react';

type ParticipantsSummaryProps = {
  participants: Participant[];
  items: BillItem[];
  addParticipant: (name: string) => void;
  removeParticipant: (id: string) => void;
};

type Balance = {
  paid: number;
  consumed: number;
  net: number;
}

export function ParticipantsSummary({ participants, items, addParticipant, removeParticipant }: ParticipantsSummaryProps) {
  
  const { grandTotal, settlements } = useMemo(() => {
    const balances = new Map<string, Balance>();
    let grandTotal = 0;

    participants.forEach(p => {
      balances.set(p.id, { paid: 0, consumed: 0, net: 0 });
    });

    items.forEach(item => {
      grandTotal += item.price;
      
      const payerBalance = balances.get(item.paidById);
      if (payerBalance) {
        payerBalance.paid += item.price;
      }

      let consumers = item.participantIds;
      if (consumers.length === 0 && participants.length > 0) {
        consumers = participants.map(p => p.id);
      }

      if (consumers.length > 0) {
        const costPerPerson = item.price / consumers.length;
        consumers.forEach(consumerId => {
          const consumerBalance = balances.get(consumerId);
          if (consumerBalance) {
            consumerBalance.consumed += costPerPerson;
          }
        });
      }
    });

    balances.forEach((balance) => {
      balance.net = balance.paid - balance.consumed;
    });

    const debtors = Array.from(balances.entries()).filter(([,b]) => b.net < 0).sort((a,b) => a[1].net - b[1].net);
    const creditors = Array.from(balances.entries()).filter(([,b]) => b.net > 0).sort((a,b) => b[1].net - a[1].net);

    const settlements: {from: string, fromId: string, to: string, amount: number}[] = [];

    let debtorIndex = 0;
    let creditorIndex = 0;

    while(debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const [debtorId, debtorBalance] = debtors[debtorIndex];
      const [creditorId, creditorBalance] = creditors[creditorIndex];

      const debtorOwes = -debtorBalance.net;
      const creditorIsOwed = creditorBalance.net;

      const settlementAmount = Math.min(debtorOwes, creditorIsOwed);

      settlements.push({
        from: participants.find(p => p.id === debtorId)?.name ?? 'Unknown',
        fromId: debtorId,
        to: participants.find(p => p.id === creditorId)?.name ?? 'Unknown',
        amount: settlementAmount,
      });

      debtorBalance.net += settlementAmount;
      creditorBalance.net -= settlementAmount;

      if(Math.abs(debtorBalance.net) < 0.01) debtorIndex++;
      if(Math.abs(creditorBalance.net) < 0.01) creditorIndex++;
    }

    return { grandTotal, settlements };
  }, [items, participants]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="font-headline">Summary</CardTitle>
        <CardDescription>Add participants and see how to settle up.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <AddParticipantForm addParticipant={addParticipant} />
        {participants.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {participants.length} participant{participants.length === 1 ? '' : 's'}: {participants.map(p => p.name).join(', ')}
          </div>
        )}
        
        {settlements.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-headline text-sm font-medium">How to Settle Up:</h3>
              <div className="flex flex-col gap-2 text-sm">
                {settlements.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                    <span className="font-medium">{s.from}</span>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ArrowRight className="h-4 w-4"/>
                       <span className="font-mono text-primary bg-background px-2 py-0.5 rounded-md">{formatCurrency(s.amount)}</span>
                      <ArrowRight className="h-4 w-4"/>
                    </div>
                    <span className="font-medium">{s.to}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
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
