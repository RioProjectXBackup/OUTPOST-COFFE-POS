import { MenuItem } from '../types';

export const DEFAULT_MENU: MenuItem[] = [
  // --- COFFEE ---
  {
    id: 'c1',
    name: 'Kopi Susu Gula Aren',
    price: 22000,
    category: 'Coffee',
    image: '☕',
    color: 'from-amber-100 to-amber-200',
    isAvailable: true,
    options: {
      temperatures: ['Hot', 'Ice'],
      sweetness: ['Normal', 'Less Sweet', 'Extra Sweet'],
      iceLevels: ['Normal', 'Less Ice', 'No Ice'],
      extras: [
        { name: 'Espresso Shot', price: 5000 },
        { name: 'Oat Milk', price: 8000 },
        { name: 'Caramel Syrup', price: 4000 }
      ]
    }
  },
  {
    id: 'c2',
    name: 'Cafe Latte',
    price: 24000,
    category: 'Coffee',
    image: '🥛',
    color: 'from-yellow-50 to-amber-100',
    isAvailable: true,
    options: {
      temperatures: ['Hot', 'Ice'],
      sweetness: ['Normal', 'Less Sweet'],
      iceLevels: ['Normal', 'Less Ice'],
      extras: [
        { name: 'Espresso Shot', price: 5000 },
        { name: 'Vanilla Syrup', price: 4000 },
        { name: 'Caramel Syrup', price: 4000 }
      ]
    }
  },
  {
    id: 'c3',
    name: 'Cappuccino',
    price: 24000,
    category: 'Coffee',
    image: '🎨',
    color: 'from-amber-50 to-orange-100',
    isAvailable: true,
    options: {
      temperatures: ['Hot', 'Ice'],
      sweetness: ['Normal', 'Less Sweet'],
      iceLevels: ['Normal', 'Less Ice'],
      extras: [
        { name: 'Espresso Shot', price: 5000 },
        { name: 'Cinnamon Powder', price: 2000 }
      ]
    }
  },
  {
    id: 'c4',
    name: 'Americano',
    price: 18000,
    category: 'Coffee',
    image: '🖤',
    color: 'from-stone-100 to-stone-200',
    isAvailable: true,
    options: {
      temperatures: ['Hot', 'Ice'],
      sweetness: ['Normal', 'Less Sweet'],
      iceLevels: ['Normal', 'Less Ice'],
      extras: [
        { name: 'Espresso Shot', price: 5000 }
      ]
    }
  },
  {
    id: 'c5',
    name: 'Caramel Macchiato',
    price: 28000,
    category: 'Coffee',
    image: '🍯',
    color: 'from-orange-50 to-yellow-100',
    isAvailable: true,
    options: {
      temperatures: ['Hot', 'Ice'],
      sweetness: ['Normal', 'Less Sweet', 'Extra Sweet'],
      iceLevels: ['Normal', 'Less Ice'],
      extras: [
        { name: 'Espresso Shot', price: 5000 },
        { name: 'Extra Caramel Drizzle', price: 3000 }
      ]
    }
  },

  // --- NON-COFFEE ---
  {
    id: 'nc1',
    name: 'Matcha Latte Premium',
    price: 25000,
    category: 'Non-Coffee',
    image: '🍵',
    color: 'from-emerald-50 to-green-100',
    isAvailable: true,
    options: {
      temperatures: ['Hot', 'Ice'],
      sweetness: ['Normal', 'Less Sweet', 'Extra Sweet'],
      iceLevels: ['Normal', 'Less Ice'],
      extras: [
        { name: 'Oat Milk', price: 8000 },
        { name: 'Matcha Shot', price: 6000 }
      ]
    }
  },
  {
    id: 'nc2',
    name: 'Signature Chocolate',
    price: 24000,
    category: 'Non-Coffee',
    image: '🍫',
    color: 'from-amber-100 to-amber-200',
    isAvailable: true,
    options: {
      temperatures: ['Hot', 'Ice'],
      sweetness: ['Normal', 'Less Sweet', 'Extra Sweet'],
      iceLevels: ['Normal', 'Less Ice'],
      extras: [
        { name: 'Whipped Cream', price: 4000 },
        { name: 'Oat Milk', price: 8000 }
      ]
    }
  },
  {
    id: 'nc3',
    name: 'Lychee Tea',
    price: 20000,
    category: 'Non-Coffee',
    image: '🍑',
    color: 'from-red-50 to-pink-100',
    isAvailable: true,
    options: {
      temperatures: ['Ice'],
      sweetness: ['Normal', 'Less Sweet'],
      iceLevels: ['Normal', 'Less Ice'],
      extras: [
        { name: 'Extra Lychee Fruit (2pcs)', price: 5000 }
      ]
    }
  },
  {
    id: 'nc4',
    name: 'Strawberry Mojito',
    price: 22000,
    category: 'Non-Coffee',
    image: '🍓',
    color: 'from-red-50 to-red-100',
    isAvailable: true,
    options: {
      temperatures: ['Ice'],
      sweetness: ['Normal', 'Less Sweet'],
      iceLevels: ['Normal', 'Less Ice']
    }
  }
];
