'use client';

import BillSplitterView from "@/components/bill/bill-splitter-view";
import { useEffect, useState } from "react";

type BillPageProps = {
  params: {
    id: string;
  };
};

export default function BillPage({ params }: BillPageProps) {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <>
      <main className="container mx-auto max-w-7xl p-4 md:p-8">
        <BillSplitterView params={params} />
      </main>
      <footer className="mt-8 text-center text-sm text-muted-foreground pb-8">
        <p>&copy; {year} Stable Co. All rights reserved.</p>
      </footer>
    </>
  );
}
