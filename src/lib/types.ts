import { type LucideIcon } from "lucide-react";

export interface BillItem {
  id: string;
  name: string;
  price: number;
  icon: LucideIcon | null;
  participantIds: string[];
  paidById: string;
}

export interface Participant {
  id: string;
  name: string;
}
