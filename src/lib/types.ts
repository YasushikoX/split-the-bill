export interface BillItem {
  id: string;
  name: string;
  price: number;
  iconDataUri: string | null;
  participantIds: string[];
  isIconLoading: boolean;
}

export interface Participant {
  id: string;
  name: string;
}
