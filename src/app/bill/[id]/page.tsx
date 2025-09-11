'use client';

import BillSplitterView from "@/components/bill/bill-splitter-view";

type BillPageProps = {
  params: {
    id: string;
  };
};

export default function BillPage({ params }: BillPageProps) {
  const billId = params.id;

  return (
      <main className="container mx-auto max-w-7xl p-4 md:p-8">
        <BillSplitterView billId={billId} />
      </main>
  );
}
