import React, { useState, useEffect } from 'react';
import { X, Check, Wallet, CreditCard, Banknote, Utensils, ShoppingBag, Clock } from 'lucide-react';
import { CartItem, Order } from '../types';

interface CheckoutModalProps {
  cart: CartItem[];
  discountAmount: number;
  discountLabel: string;
  onClose: () => void;
  existingPendingOrder?: Order | null;
  onCompleteOrder: (orderData: {
    customerName: string;
    orderType: 'Dine-in' | 'Takeaway';
    tableNumber?: string;
    paymentMethod: 'Cash' | 'QRIS' | 'Debit';
    amountPaid: number;
    change: number;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    status: 'Pending' | 'Completed';
    existingPendingOrderId?: string;
  }) => void;
}

export default function CheckoutModal({
  cart,
  discountAmount,
  discountLabel,
  onClose,
  existingPendingOrder,
  onCompleteOrder,
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState<'Dine-in' | 'Takeaway'>('Dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'QRIS' | 'Debit'>('Cash');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [customPaidInput, setCustomPaidInput] = useState<string>('');

  const formatIDR = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  // Determine active items to list and calculate
  const activeItems = existingPendingOrder ? existingPendingOrder.items : cart;

  // Hydrate form fields if pre-filled order is passed or from cart names
  useEffect(() => {
    if (existingPendingOrder) {
      setCustomerName(existingPendingOrder.customerName);
      setOrderType(existingPendingOrder.orderType);
      setTableNumber(existingPendingOrder.tableNumber || '');
      // If payment details exist, use them
      if (existingPendingOrder.paymentMethod) {
        setPaymentMethod(existingPendingOrder.paymentMethod);
      }
    } else {
      // Find if there's any customerName in the cart items to prefill
      const cartName = cart.find(c => c.customerName)?.customerName || '';
      setCustomerName(cartName);
      setOrderType('Dine-in');
      setTableNumber('');
    }
  }, [existingPendingOrder, cart]);

  // Calculations
  const calculateItemPrice = (item: CartItem) => {
    const extrasTotal = item.selectedExtras ? item.selectedExtras.reduce((sum, ext) => sum + ext.price, 0) : 0;
    return (item.menuItem.price + extrasTotal) * item.quantity;
  };

  const subtotal = activeItems.reduce((sum, item) => sum + calculateItemPrice(item), 0);
  const tax = 0;
  const grandTotal = subtotal;

  // Realtime change
  const change = amountPaid - grandTotal;
  const isPaidSufficient = amountPaid >= grandTotal;

  // Pre-fill cash suggestion values
  const cashSuggestions = [
    grandTotal,
    Math.ceil(grandTotal / 5000) * 5000,
    Math.ceil(grandTotal / 10000) * 10000,
    Math.ceil(grandTotal / 20000) * 20000,
    Math.ceil(grandTotal / 50000) * 50000,
    Math.ceil(grandTotal / 100000) * 100000,
  ].filter((val, idx, self) => val >= grandTotal && self.indexOf(val) === idx).slice(0, 5);

  const handleCashSelection = (val: number) => {
    setAmountPaid(val);
    setCustomPaidInput(val.toString());
  };

  const handleCustomPaidChange = (val: string) => {
    setCustomPaidInput(val);
    const parsed = parseInt(val.replace(/\D/g, ''), 10);
    setAmountPaid(isNaN(parsed) ? 0 : parsed);
  };

  // 1. Confirm and complete direct checkout
  const handleConfirmCheckout = (status: 'Pending' | 'Completed', selectedOrderType?: 'Dine-in' | 'Takeaway') => {
    if (!customerName.trim()) return;
    const finalOrderType = selectedOrderType || orderType;

    if (status === 'Pending') {
      onCompleteOrder({
        customerName: customerName.trim(),
        orderType: finalOrderType,
        tableNumber: undefined,
        paymentMethod: 'Cash', // Placeholder
        amountPaid: 0,
        change: 0,
        subtotal,
        tax,
        discount: 0,
        total: grandTotal,
        status: 'Pending',
        existingPendingOrderId: existingPendingOrder?.id
      });
    } else {
      if (paymentMethod === 'Cash' && !isPaidSufficient) return;

      onCompleteOrder({
        customerName: customerName.trim(),
        orderType: finalOrderType,
        tableNumber: undefined,
        paymentMethod,
        amountPaid: paymentMethod === 'Cash' ? amountPaid : grandTotal,
        change: paymentMethod === 'Cash' ? (change > 0 ? change : 0) : 0,
        subtotal,
        tax,
        discount: discountAmount,
        total: grandTotal,
        status: 'Completed',
        existingPendingOrderId: existingPendingOrder?.id
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
        
        {/* Left side: Order details summary */}
        <div className="flex-1 bg-brand-cream-50 p-6 border-r border-brand-cream-200 flex flex-col justify-between overflow-y-auto max-h-[40vh] md:max-h-none">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-stone-800 text-sm tracking-wide uppercase">Detail Belanja</h3>
              <span className="text-2xs text-brand-green-800 bg-brand-green-100 font-semibold px-2.5 py-0.5 rounded-full">
                {activeItems.length} Menu
              </span>
            </div>

            {/* List */}
            <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-1 no-scrollbar mb-4">
              {activeItems.map((item) => {
                const itemPriceSingle = item.menuItem.price;
                return (
                  <div key={item.id} className="flex justify-between text-xs py-1.5 border-b border-brand-cream-200 last:border-0">
                    <div className="flex gap-2">
                      <span className="text-stone-500 font-bold">{item.quantity}x</span>
                      <div>
                        <span className="font-semibold text-stone-800">{item.menuItem.name}</span>
                        {item.customerName && (
                          <div className="text-[10px] text-brand-green-900 font-bold mt-0.5">
                            👤 {item.customerName}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-[10px] text-amber-800 italic mt-0.5">
                            📝 {item.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="font-mono font-medium text-stone-800">
                      {formatIDR(itemPriceSingle * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="border-t border-brand-cream-200/80 pt-4 mt-auto">
            <div className="flex justify-between items-baseline p-3 bg-brand-green-50 border border-brand-green-100 rounded-xl">
              <span className="text-xs font-bold text-brand-green-950">Total Pembayaran</span>
              <span className="text-xl font-extrabold text-brand-green-900 font-mono">
                {formatIDR(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Customer & Payment Form */}
        <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto max-h-[55vh] md:max-h-none">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg text-stone-800 font-display">
                {existingPendingOrder ? 'Konfirmasi Pembayaran' : 'Buat Pesanan Baru'}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 md:hidden cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-extrabold text-stone-400 tracking-wider uppercase mb-1 block">
                  Nama Pelanggan *
                </label>
                <input
                  type="text"
                  required
                  disabled={!!existingPendingOrder}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Masukkan nama pelanggan..."
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none transition-all font-sans ${
                    existingPendingOrder
                      ? 'bg-stone-100 border-stone-200 text-stone-500 cursor-not-allowed'
                      : 'bg-stone-50 border-brand-cream-200 focus:border-brand-green-700 focus:bg-white'
                  }`}
                />
              </div>

              {/* If existing pending order, just show its type as read-only */}
              {existingPendingOrder ? (
                <div>
                  <label className="text-[10px] font-extrabold text-stone-400 tracking-wider uppercase mb-1 block">
                    Tipe Pesanan
                  </label>
                  <div className="py-2 px-3 bg-stone-100 border border-stone-200 rounded-xl font-bold text-xs text-stone-700 flex items-center gap-1.5">
                    {orderType === 'Dine-in' ? (
                      <>
                        <Utensils className="w-3.5 h-3.5 text-stone-500" />
                        <span>Makan Sini (Dine-in)</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5 text-stone-500" />
                        <span>Bawa Pulang (Takeaway)</span>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                /* Instant Waiting Room Action Buttons */
                <div className="flex flex-col gap-2 mt-1">
                  <label className="text-[10px] font-extrabold text-stone-400 tracking-wider uppercase">
                    Pilih Layanan (Kirim ke Ruang Tunggu)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={!customerName.trim()}
                      onClick={() => handleConfirmCheckout('Pending', 'Dine-in')}
                      className={`py-3 px-4 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all ${
                        customerName.trim()
                          ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 border-amber-500 cursor-pointer hover:scale-[1.01] active:scale-98 shadow-sm shadow-amber-400/10'
                          : 'bg-stone-50 border-stone-150 text-stone-400 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <Utensils className="w-5 h-5 text-amber-900" />
                      <span>Dine-in (Makan Sini)</span>
                    </button>
                    <button
                      type="button"
                      disabled={!customerName.trim()}
                      onClick={() => handleConfirmCheckout('Pending', 'Takeaway')}
                      className={`py-3 px-4 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all ${
                        customerName.trim()
                          ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 border-amber-500 cursor-pointer hover:scale-[1.01] active:scale-98 shadow-sm shadow-amber-400/10'
                          : 'bg-stone-50 border-stone-150 text-stone-400 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <ShoppingBag className="w-5 h-5 text-amber-900" />
                      <span>Takeaway (Bawa Pulang)</span>
                    </button>
                  </div>
                  {!customerName.trim() && (
                    <p className="text-[10px] text-stone-500 italic mt-1 text-center">
                      💡 Tulis nama pelanggan di atas terlebih dahulu untuk mengirim ke Ruang Tunggu.
                    </p>
                  )}
                </div>
              )}
            </div>

            {existingPendingOrder && (
              <>
                {/* Payment Method */}
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-2xs font-bold text-stone-500 tracking-wider uppercase block">
                    Metode Pembayaran
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Cash')}
                      className={`py-2 px-2.5 rounded-xl border font-semibold text-xs flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        paymentMethod === 'Cash'
                          ? 'bg-brand-green-900 border-brand-green-900 text-white'
                          : 'bg-white border-brand-cream-200 text-stone-600 hover:border-brand-cream-600'
                      }`}
                    >
                      <Banknote className="w-4 h-4" />
                      Tunai / Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('QRIS')}
                      className={`py-2 px-2.5 rounded-xl border font-semibold text-xs flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        paymentMethod === 'QRIS'
                          ? 'bg-brand-green-900 border-brand-green-900 text-white'
                          : 'bg-white border-brand-cream-200 text-stone-600 hover:border-brand-cream-600'
                      }`}
                    >
                      <Wallet className="w-4 h-4" />
                      QRIS E-Wallet
                    </button>
                  </div>
                </div>

                {/* Tunai/Cash Details atau QRIS */}
                {paymentMethod === 'Cash' ? (
                  <div className="bg-brand-cream-50 p-3 rounded-xl border border-brand-cream-200 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-stone-700">Tunai Diterima:</span>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500 font-mono">Rp</span>
                        <input
                          type="text"
                          value={customPaidInput}
                          onChange={(e) => handleCustomPaidChange(e.target.value)}
                          placeholder="0"
                          className="w-32 bg-white border border-brand-cream-200 rounded-lg pl-8 pr-2.5 py-1 text-sm text-right font-bold font-mono outline-none focus:border-brand-green-800"
                        />
                      </div>
                    </div>

                    {/* Cash suggestions */}
                    <div className="flex flex-wrap gap-1.5 mt-1 justify-end">
                      {cashSuggestions.map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleCashSelection(val)}
                          className={`px-2 py-1 text-2xs font-bold font-mono rounded border cursor-pointer transition-all ${
                            amountPaid === val
                              ? 'bg-brand-green-800 border-brand-green-800 text-white shadow-xs'
                              : 'bg-white border-stone-300 text-stone-700 hover:border-stone-500'
                          }`}
                        >
                          {val === grandTotal ? 'Uang Pas' : formatIDR(val).replace('Rp ', '')}
                        </button>
                      ))}
                    </div>

                    {/* Change calculation */}
                    <div className="flex justify-between items-center pt-2 border-t border-brand-cream-200 border-dashed mt-1.5">
                      <span className="text-xs font-bold text-stone-700">Uang Kembalian:</span>
                      <span className={`text-sm font-extrabold font-mono ${isPaidSufficient ? 'text-brand-green-900' : 'text-red-600'}`}>
                        {isPaidSufficient ? formatIDR(change) : `Kurang ${formatIDR(Math.abs(change))}`}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Simulated QRIS */
                  <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 flex flex-col items-center gap-2">
                    {/* QR code frame */}
                    <div className="w-28 h-28 bg-white p-2 rounded-lg border border-stone-200 flex flex-col justify-between shadow-xs">
                      <div className="flex justify-between">
                        <div className="w-6 h-6 bg-stone-900 rounded-sm flex items-center justify-center"><div className="w-3 h-3 bg-white rounded-2xs"></div></div>
                        <div className="w-6 h-6 bg-stone-900 rounded-sm flex items-center justify-center"><div className="w-3 h-3 bg-white rounded-2xs"></div></div>
                      </div>
                      {/* Visual QR lines */}
                      <div className="flex-1 flex flex-col justify-center gap-1 px-1 py-1.5">
                        <div className="h-1 bg-stone-800 rounded-full w-full"></div>
                        <div className="h-1 bg-stone-800 rounded-full w-4/5 self-end"></div>
                        <div className="h-1 bg-stone-800 rounded-full w-5/6"></div>
                        <div className="h-1 bg-stone-800 rounded-full w-2/3 self-end"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="w-6 h-6 bg-stone-900 rounded-sm flex items-center justify-center"><div className="w-3 h-3 bg-white rounded-2xs"></div></div>
                        <div className="w-3 h-3 bg-stone-900 rounded-2xs self-end"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-2xs font-extrabold text-brand-green-900 tracking-wider">OUTPOST PAY QRIS NMID</span>
                      <p className="text-[10px] text-stone-500 mt-0.5">Tunjukkan QR ke pelanggan untuk discan.</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4 mt-4 border-t border-brand-cream-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-stone-300 hover:border-stone-400 text-stone-700 font-bold text-xs rounded-xl hover:bg-stone-50 cursor-pointer transition-colors"
            >
              Batal
            </button>
            
            {existingPendingOrder && (
              <button
                type="button"
                onClick={() => handleConfirmCheckout('Completed')}
                disabled={
                  !customerName.trim() ||
                  (paymentMethod === 'Cash' && !isPaidSufficient)
                }
                className={`flex-1 py-2.5 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all ${
                  customerName.trim() &&
                  (paymentMethod !== 'Cash' || isPaidSufficient)
                    ? 'bg-brand-green-900 hover:bg-brand-green-950 active:scale-98'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3px]" />
                <span>Konfirmasi Bayar</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
