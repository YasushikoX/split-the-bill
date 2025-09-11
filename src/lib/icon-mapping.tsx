import {
  ReceiptText,
  Pizza,
  GlassWater,
  Wine,
  Beer,
  Coffee,
  ShoppingBasket,
  Ticket,
  Car,
  Hotel,
  Plane,
  Gift,
  Film,
  LucideIcon,
  Shirt,
} from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  pizza: Pizza,
  food: Pizza,
  water: GlassWater,
  drinks: GlassWater,
  wine: Wine,
  beer: Beer,
  coffee: Coffee,
  groceries: ShoppingBasket,
  tickets: Ticket,
  movie: Film,
  taxi: Car,
  parking: Car,
  fuel: Car,
  hotel: Hotel,
  accommodation: Hotel,
  flights: Plane,
  plane: Plane,
  gift: Gift,
  present: Gift,
  clothes: Shirt,
  default: ReceiptText,
};

export function getIconForItem(itemName: string): LucideIcon {
  const lowerCaseItemName = itemName.toLowerCase();
  for (const keyword in iconMap) {
    if (lowerCaseItemName.includes(keyword)) {
      return iconMap[keyword];
    }
  }
  return iconMap.default;
}
