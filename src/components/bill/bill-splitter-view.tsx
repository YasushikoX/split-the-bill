'use client';

import { useBillState } from '@/hooks/use-bill-state';
import { AddItemForm } from './add-item-form';
import { BillItemsList } from './bill-items-list';
import { Header } from './header';
import { ParticipantsSummary } from './participants-summary';
import { Skeleton } from '../ui/skeleton';

type BillSplitterViewProps = {
  billId: string;
};

export default function BillSplitterView({ billId }: BillSplitterViewProps) {
  const {
    items,
    participants,
    addParticipant,
    removeParticipant,
    addItem,
    removeItem,
    toggleItemParticipant,
    assignItemToAll,
  } = useBillState(billId);

  return (
    <div className="space-y-8">
      <Header billId={billId} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <AddItemForm addItem={addItem} disabled={participants.length === 0} />
          <BillItemsList 
            items={items} 
            participants={participants} 
            removeItem={removeItem} 
            toggleItemParticipant={toggleItemParticipant}
            assignItemToAll={assignItemToAll}
          />
        </div>
        <div className="md:col-span-1">
          <ParticipantsSummary 
            participants={participants} 
            items={items} 
            addParticipant={addParticipant} 
            removeParticipant={removeParticipant}
          />
        </div>
      </div>
    </div>
  );
}


function LoadingSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between pb-8">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <Skeleton className="h-10 w-24" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
                <div className="md:col-span-1">
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        </div>
    )
}
