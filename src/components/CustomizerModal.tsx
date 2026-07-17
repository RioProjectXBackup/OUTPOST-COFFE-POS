import React, { useState, useEffect } from 'react';
import { X, User, NotebookPen } from 'lucide-react';
import { MenuItem, CartItem, ExtraOption } from '../types';

interface CustomizerModalProps {
  item: MenuItem | null; // For adding a new item
  existingCartItem: CartItem | null; // For editing an existing item
  defaultCustomerName?: string;
  onClose: () => void;
  onSave: (
    item: MenuItem,
    quantity: number,
    temperature?: 'Hot' | 'Ice',
    sweetness?: 'Normal' | 'Less Sweet' | 'Extra Sweet',
    iceLevel?: 'Normal' | 'Less Ice' | 'No Ice',
    selectedExtras?: ExtraOption[],
    notes?: string,
    customerName?: string
  ) => void;
}

export default function CustomizerModal({
  item,
  existingCartItem,
  defaultCustomerName,
  onClose,
  onSave,
}: CustomizerModalProps) {
  const activeMenuItem = existingCartItem ? existingCartItem.menuItem : item;

  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');

  // Hydrate states if editing or set defaults if adding
  useEffect(() => {
    if (existingCartItem) {
      setQuantity(existingCartItem.quantity);
      setCustomerName(existingCartItem.customerName || '');
      setNotes(existingCartItem.notes || '');
    } else if (item) {
      setQuantity(1);
      setCustomerName(defaultCustomerName || '');
      setNotes('');
    }
  }, [item, existingCartItem, defaultCustomerName]);

  if (!activeMenuItem) return null;

  const formatIDR = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const handleSave = () => {
    onSave(
      activeMenuItem,
      quantity,
      undefined,
      undefined,
      undefined,
      [],
      notes.trim(),
      customerName.trim()
    );
  };

  const totalProductPrice = activeMenuItem.price * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-brand-cream-100 border-b border-brand-cream-200 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div>
              <h3 className="font-bold text-stone-800 text-base">
                {existingCartItem ? 'Ubah Pesanan' : 'Detail Pesanan'}
              </h3>
              <p className="text-2xs text-brand-green-900/80 font-bold">{activeMenuItem.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white border border-brand-cream-200 text-stone-500 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Customer Name Input (Required/Preferred) */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-stone-700 tracking-wide uppercase flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand-green-900" />
              Nama Pemesan
            </span>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Masukkan nama pelanggan..."
              className="w-full bg-white border border-brand-cream-200 rounded-xl px-3.5 py-3 text-xs outline-none focus:border-brand-green-900 font-sans focus:ring-1 focus:ring-brand-green-900/20"
            />
          </div>

          {/* Notes Input */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-stone-700 tracking-wide uppercase flex items-center gap-1.5">
              <NotebookPen className="w-4 h-4 text-brand-green-900" />
              Catatan Pesanan
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Sendok dipisah, es dikurangi, dll..."
              rows={3}
              maxLength={150}
              className="w-full bg-white border border-brand-cream-200 rounded-xl p-3 text-xs outline-none focus:border-brand-green-900 font-sans resize-none focus:ring-1 focus:ring-brand-green-900/20"
            />
          </div>

          {/* Quantity selector */}
          <div className="flex items-center justify-between py-4 border-t border-dashed border-brand-cream-200 mt-2">
            <span className="text-xs font-bold text-stone-700 uppercase">Jumlah</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 rounded-lg border border-brand-cream-200 bg-white hover:bg-brand-cream-200 flex items-center justify-center font-bold text-stone-600 cursor-pointer active:scale-95 transition-transform"
              >
                -
              </button>
              <span className="font-mono text-base font-bold text-stone-800 w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 rounded-lg border border-brand-cream-200 bg-white hover:bg-brand-cream-200 flex items-center justify-center font-bold text-stone-600 cursor-pointer active:scale-95 transition-transform"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer with Pricing */}
        <div className="px-6 py-4 bg-brand-cream-50 border-t border-brand-cream-200 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-3xs font-semibold text-stone-500 uppercase tracking-wider">Total Harga</span>
            <span className="text-base font-extrabold text-brand-green-950 font-mono">{formatIDR(totalProductPrice)}</span>
          </div>

          <button
            onClick={handleSave}
            className="bg-brand-green-900 text-white hover:bg-brand-green-950 font-bold px-5 py-3 rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-98 text-xs"
          >
            {existingCartItem ? 'Update Pesanan' : 'Tambahkan Pesanan'}
          </button>
        </div>

      </div>
    </div>
  );
}
