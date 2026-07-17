import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Tag, NotebookPen, Percent, Receipt, X, Clock } from 'lucide-react';
import { CartItem } from '../types';

interface CartPanelProps {
  cart: CartItem[];
  onIncrementQuantity: (id: string) => void;
  onDecrementQuantity: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onCheckout: (discountAmount: number, discountLabel: string) => void;
  onOpenCustomizer: (item: CartItem) => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function CartPanel({
  cart,
  onIncrementQuantity,
  onDecrementQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onOpenCustomizer,
  isMobile = false,
  onCloseMobile,
}: CartPanelProps) {
  const [showNotesInputId, setShowNotesInputId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  const formatIDR = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  // Calculate Subtotal
  const calculateItemPrice = (item: CartItem) => {
    const extrasTotal = item.selectedExtras.reduce((sum, ext) => sum + ext.price, 0);
    return (item.menuItem.price + extrasTotal) * item.quantity;
  };

  const subtotal = cart.reduce((sum, item) => sum + calculateItemPrice(item), 0);

  // Apply promo or manual discount - ALWAYS 0 as requested
  const discountAmount = 0;
  const discountLabel = '';

  const tax = 0;
  const grandTotal = subtotal;

  return (
    <div className="w-full lg:w-96 bg-white border-l border-brand-green-900/10 flex flex-col h-full shadow-lg">
      {/* Panel Header */}
      <div className="p-4 border-b border-brand-green-900/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-brand-green-900" />
          <h2 className="font-bold text-base text-stone-800">Daftar Pesanan</h2>
          <span className="px-2 py-0.5 text-xs font-semibold bg-brand-green-100 text-brand-green-800 rounded-full">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {cart.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-stone-400 hover:text-red-600 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
          {isMobile && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-400 gap-3 py-16">
            <div className="w-16 h-16 rounded-full bg-brand-cream-100 flex items-center justify-center text-brand-cream-800">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-stone-700">Keranjang Kosong</p>
              <p className="text-xs text-stone-400 mt-1">Pilih menu di sebelah kiri untuk ditambahkan.</p>
            </div>
          </div>
        ) : (
          cart.map((item) => {
            const hasOptions = item.temperature || item.sweetness || item.iceLevel || item.selectedExtras.length > 0;
            const itemPriceSingle = item.menuItem.price + item.selectedExtras.reduce((sum, ext) => sum + ext.price, 0);

            return (
              <div
                key={item.id}
                className="group flex flex-col bg-brand-cream-50 hover:bg-brand-cream-100/50 border border-brand-cream-200 rounded-xl p-2.5 transition-all"
              >
                {/* Upper line: name, single total price */}
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-semibold text-[11px] text-stone-800 line-clamp-1">{item.menuItem.name}</h4>
                      {item.customerName && (
                        <span className="px-1 py-0.5 rounded bg-brand-green-900/10 text-brand-green-950 font-bold text-[8px] uppercase tracking-wide">
                          👤 {item.customerName}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-brand-green-800 font-mono font-medium block mt-0.5">
                      {formatIDR(itemPriceSingle)}
                    </span>
                  </div>
                  <span className="font-bold text-[11px] text-stone-900 font-sans">
                    {formatIDR(calculateItemPrice(item))}
                  </span>
                </div>

                {/* Subdetails/Customizations */}
                {hasOptions && (
                  <div className="mt-1 flex flex-wrap gap-1 text-[9px] text-stone-500">
                    {item.temperature && (
                      <span className="bg-white border border-brand-cream-200 px-1 py-0.5 rounded text-stone-600 font-medium">
                        {item.temperature}
                      </span>
                    )}
                    {item.sweetness && (
                      <span className="bg-white border border-brand-cream-200 px-1 py-0.5 rounded text-stone-600 font-medium">
                        {item.sweetness}
                      </span>
                    )}
                    {item.iceLevel && (
                      <span className="bg-white border border-brand-cream-200 px-1 py-0.5 rounded text-stone-600 font-medium">
                        Es: {item.iceLevel}
                      </span>
                    )}
                    {item.selectedExtras.map((ext) => (
                      <span
                        key={ext.name}
                        className="bg-brand-green-50 text-brand-green-800 border border-brand-green-100 px-1 py-0.5 rounded font-medium"
                      >
                        +{ext.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes bar */}
                {item.notes ? (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[9px] italic text-brand-cream-900 bg-amber-50/50 py-0.5 px-1.5 rounded border border-amber-100/40">
                    <NotebookPen className="w-2.5 h-2.5 text-brand-cream-800" />
                    <span className="truncate flex-1">{item.notes}</span>
                    <button
                      onClick={() => onOpenCustomizer(item)}
                      className="text-[9px] font-semibold text-stone-500 hover:text-stone-700"
                    >
                      Ubah
                    </button>
                  </div>
                ) : null}

                {/* Controls row */}
                <div className="mt-2 flex items-center justify-between gap-2">
                  {/* Edit Customization Trigger */}
                  <button
                    onClick={() => onOpenCustomizer(item)}
                    className="text-[9px] text-brand-green-800 hover:text-brand-green-950 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <NotebookPen className="w-2.5 h-2.5" />
                    <span>Ubah Detail</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onDecrementQuantity(item.id)}
                      className="w-5.5 h-5.5 rounded-lg border border-brand-cream-200 bg-white hover:bg-brand-cream-200/50 flex items-center justify-center text-stone-500 transition-colors cursor-pointer"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-[11px] font-bold text-stone-800 w-3 text-center font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onIncrementQuantity(item.id)}
                      className="w-5.5 h-5.5 rounded-lg border border-brand-cream-200 bg-white hover:bg-brand-cream-200/50 flex items-center justify-center text-stone-500 transition-colors cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="w-5.5 h-5.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 transition-colors ml-1 cursor-pointer"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bill summary */}
      <div className="p-4 bg-brand-cream-100/50 border-t border-brand-green-900/10 flex flex-col gap-3 font-sans">
        {/* Calculation Rows */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-brand-green-900/10 text-xs text-brand-cream-900">
          <div className="flex justify-between">
            <span className="opacity-85">Subtotal</span>
            <span className="font-mono font-bold text-stone-800">{formatIDR(subtotal)}</span>
          </div>

          <div className="flex justify-between text-stone-900 font-bold text-sm pt-2.5 border-t border-dashed border-brand-green-900/10">
            <span className="font-extrabold">Total Bayar</span>
            <span className="font-mono text-brand-green-900 text-lg font-extrabold">{formatIDR(grandTotal)}</span>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={() => cart.length > 0 && onCheckout(discountAmount, discountLabel)}
          disabled={cart.length === 0}
          className={`mt-2 w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all duration-150 uppercase tracking-widest text-xs ${
            cart.length > 0
              ? 'bg-amber-500 hover:bg-amber-600 text-amber-950 active:scale-98 shadow-amber-500/10 hover:shadow-lg'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-950" />
          <span>Buat Pesanan (Ruang Tunggu)</span>
        </button>
      </div>
    </div>
  );
}
