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
  Martini,
  Beef,
  Trophy,
  Sandwich,
  Cake,
} from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  // Food & Drink
  pizza: Pizza,
  food: Pizza,
  burger: Sandwich,
  sandwich: Sandwich,
  sushi: Beef,
  tacos: Beef,
  snack: Cake,
  dessert: Cake,
  water: GlassWater,
  drinks: GlassWater,
  wine: Wine,
  beer: Beer,
  cocktail: Martini,
  bar: Martini,
  coffee: Coffee,

  // Transportation
  taxi: Car,
  uber: Car,
  lyft: Car,
  cab: Car,
  parking: Car,
  fuel: Car,
  flights: Plane,
  plane: Plane,

  // Entertainment & Activities
  tickets: Ticket,
  movie: Film,
  concert: Ticket,
  show: Ticket,
  bowling: Trophy,
  activity: Trophy,

  // Accommodation
  hotel: Hotel,
  accommodation: Hotel,
  
  // Shopping & Gifts
  groceries: ShoppingBasket,
  shopping: ShoppingBasket,
  store: ShoppingBasket,
  gift: Gift,
  present: Gift,
  clothes: Shirt,

  // Default
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
