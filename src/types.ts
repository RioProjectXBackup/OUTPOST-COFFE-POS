export type Category = 'Coffee' | 'Non-Coffee';

export interface ExtraOption {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: Category;
  image: string; // Emoji or URL
  color: string; // Tailind card accent
  isAvailable: boolean;
  options?: {
    temperatures?: ('Hot' | 'Ice')[];
    sweetness?: ('Normal' | 'Less Sweet' | 'Extra Sweet')[];
    iceLevels?: ('Normal' | 'Less Ice' | 'No Ice')[];
    extras?: ExtraOption[];
  };
}

export interface CartItem {
  id: string; // Generated based on item ID and selections to separate different configs
  menuItem: MenuItem;
  quantity: number;
  temperature?: 'Hot' | 'Ice';
  sweetness?: 'Normal' | 'Less Sweet' | 'Extra Sweet';
  iceLevel?: 'Normal' | 'Less Ice' | 'No Ice';
  selectedExtras: ExtraOption[];
  notes?: string;
  customerName?: string;
}

export interface Order {
  id: string; // OUT-XXXX
  items: CartItem[];
  date: string; // ISO string
  customerName: string;
  orderType: 'Dine-in' | 'Takeaway';
  tableNumber?: string;
  paymentMethod?: 'Cash' | 'QRIS' | 'Debit';
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amountPaid?: number;
  change?: number;
  status: 'Pending' | 'Completed' | 'Refunded';
}

export interface SalesReport {
  totalRevenue: number;
  totalTransactions: number;
  byCategory: Record<Category, number>;
  byPaymentMethod: Record<string, number>;
  popularItems: { name: string; count: number; revenue: number }[];
}
