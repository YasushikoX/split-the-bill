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
  Soup,
  Fish,
  UtensilsCrossed,
  Salad,
  Egg,
  Grape,
  IceCream,
  Popcorn,
  Train,
  Bus,
  Ship,
  GasPump,
  ParkingCircle,
  Clapperboard,
  Music,
  Paintbrush,
  BookOpen,
  FerrisWheel,
  Landmark,
  Heart,
  Briefcase,
  Store,
} from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  // --- Food & Drink ---
  
  // Generic
  food: UtensilsCrossed,
  eat: UtensilsCrossed,
  restaurant: UtensilsCrossed,
  meal: UtensilsCrossed,
  dinner: UtensilsCrossed,
  lunch: UtensilsCrossed,
  
  // Main Dishes
  pizza: Pizza,
  burger: Sandwich,
  sandwich: Sandwich,
  wrap: Sandwich,
  hotdog: Sandwich,
  kebab: Sandwich,
  steak: Beef,
  meat: Beef,
  bbq: Beef,
  ramen: Soup,
  noodles: Soup,
  pho: Soup,
  soup: Soup,
  pasta: Soup,
  spaghetti: Soup,
  sushi: Fish,
  seafood: Fish,
  fish: Fish,
  tacos: Beef,
  burrito: Beef,
  salad: Salad,

  // Breakfast/Brunch
  breakfast: Egg,
  brunch: Egg,
  eggs: Egg,
  pancakes: Cake,
  waffles: Cake,
  croissant: Cake,
  
  // Snacks & Sides
  snack: Popcorn,
  popcorn: Popcorn,
  appetizer: Popcorn,
  fries: Popcorn,
  chips: Popcorn,
  dessert: IceCream,
  cake: Cake,
  'ice cream': IceCream,
  gelato: IceCream,
  pastry: Cake,
  donut: Cake,
  cookie: Cake,
  fruit: Grape,
  
  // Beverages (Non-alcoholic)
  water: GlassWater,
  soda: GlassWater,
  juice: GlassWater,
  drink: GlassWater,
  beverage: GlassWater,
  
  // Beverages (Alcoholic)
  drinks: Martini,
  cocktail: Martini,
  bar: Martini,
  pub: Martini,
  liquor: Martini,
  wine: Wine,
  beer: Beer,
  
  // Hot Beverages
  coffee: Coffee,
  tea: Coffee,
  cafe: Coffee,

  // --- Transportation ---
  taxi: Car,
  uber: Car,
  lyft: Car,
  cab: Car,
  ride: Car,
  car: Car,
  parking: ParkingCircle,
  fuel: GasPump,
  gas: GasPump,
  train: Train,
  metro: Train,
  subway: Train,
  bus: Bus,
  flights: Plane,
  plane: Plane,
  airline: Plane,
  boat: Ship,
  ferry: Ship,

  // --- Entertainment & Activities ---
  tickets: Ticket,
  movie: Clapperboard,
  cinema: Clapperboard,
  film: Film,
  concert: Music,
  show: Music,
  gig: Music,
  music: Music,
  bowling: Trophy,
  activity: Trophy,
  game: Trophy,
  arcade: Trophy,
  sports: Trophy,
  museum: Landmark,
  tour: Landmark,
  landmark: Landmark,
  art: Paintbrush,
  gallery: Paintbrush,
  park: FerrisWheel,
  amusement: FerrisWheel,

  // --- Accommodation ---
  hotel: Hotel,
  motel: Hotel,
  hostel: Hotel,
  airbnb: Hotel,
  accommodation: Hotel,
  lodging: Hotel,
  stay: Hotel,
  
  // --- Shopping & Errands ---
  groceries: ShoppingBasket,
  supermarket: ShoppingBasket,
  shopping: Store,
  store: Store,
  mall: Store,
  market: Store,
  clothes: Shirt,
  fashion: Shirt,
  gift: Gift,
  present: Gift,
  souvenir: Gift,
  pharmacy: Briefcase,
  chemist: Briefcase,
  book: BookOpen,
  magazine: BookOpen,
  
  // --- Health & Wellness ---
  donation: Heart,
  charity: Heart,

  // --- Miscellaneous ---
  misc: ReceiptText,
  miscellaneous: ReceiptText,
  other: ReceiptText,
  fee: ReceiptText,
  tax: ReceiptText,

  // Default
  default: ReceiptText,
};

export function getIconForItem(itemName: string): LucideIcon {
  const lowerCaseItemName = itemName.toLowerCase();
  
  // Check for exact multi-word matches first
  for (const keyword in iconMap) {
    if (keyword.includes(' ') && lowerCaseItemName.includes(keyword)) {
      return iconMap[keyword];
    }
  }
  
  // Then check for single-word matches
  const words = lowerCaseItemName.split(/\s+/);
  for (const word of words) {
    if (iconMap[word]) {
      return iconMap[word];
    }
  }

  // Fallback to checking if any part of the name contains a keyword
  for (const keyword in iconMap) {
    if (!keyword.includes(' ') && lowerCaseItemName.includes(keyword)) {
      return iconMap[keyword];
    }
  }

  return iconMap.default;
}
