import { type LucideIcon } from "lucide-react";

export interface Bill {
  id: string;
  title: string;
  date: string;
  createdAt: string;
  expireAt: string;
}

export interface BillItem {
  id: string;
  name: string;
  price: number;
  icon: LucideIcon | null;
  participantIds: string[];
  paidById: string;
}

export interface Participant {
  id:string;
  name: string;
}

export interface BillHistoryEntry {
    id: string;
    title: string;
    date: string;
    accessedAt: string;
}
