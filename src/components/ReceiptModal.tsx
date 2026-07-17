import React, { useState } from 'react';
import { X, Printer, CheckCircle, RefreshCw } from 'lucide-react';
import { Order } from '../types';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function ReceiptModal({ order, onClose }: ReceiptModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);

  if (!order) return null;

  const formatIDR = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setPrintSuccess(false);

    // Simulate printing latency
    setTimeout(() => {
      setIsPrinting(false);
      setPrintSuccess(true);
      
      // Let browser trigger printing only the receipt if needed,
      // but for simulated purposes we show a beautiful feedback.
      // Also we can call window.print() but iframe constraints might block.
      // A beautiful overlay success screen is more reliable in AI Studio.
      setTimeout(() => setPrintSuccess(false), 2500);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in-50 zoom-in-95 duration-200">
        
        {/* Header Options */}
        <div className="p-4 bg-brand-cream-50 border-b border-brand-cream-200 flex justify-between items-center">
          <h3 className="font-bold text-stone-800 text-xs tracking-wider uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-green-700 animate-pulse"></span>
            Transaksi Berhasil
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Paper Receipt Box */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-100 flex justify-center">
          
          {/* Thermal Receipt Paper representation */}
          <div className="bg-white w-full max-w-[280px] p-5 shadow-md border border-stone-200 text-stone-800 font-mono text-2xs flex flex-col relative">
            
            {/* Top jagged paper serration simulation */}
            <div className="absolute top-0 left-0 right-0 h-1.5 flex justify-between overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="w-3 h-3 bg-stone-100 rotate-45 transform -translate-y-2 border border-stone-200"></div>
              ))}
            </div>

            {/* Receipt Header */}
            <div className="text-center pt-3 pb-4 border-b border-dashed border-stone-300">
              <h2 className="text-sm font-bold font-display text-stone-900 tracking-tight uppercase">OUTPOST COFFEE</h2>
              <p className="text-[9px] text-stone-500 mt-1">Seni Rasa & Ruang Temu</p>
              <p className="text-[9px] text-stone-400 mt-0.5 font-sans leading-tight">Jl. Harmonika Baru, Titi Rantai, Kec. Medan Baru, Kota Medan, Sumatera Utara 20132</p>
              <p className="text-[9px] text-stone-400 mt-1 font-sans">No. HP: +62 852-6122-0186</p>
            </div>

            {/* Receipt metadata */}
            <div className="py-3 border-b border-dashed border-stone-300 flex flex-col gap-1 text-[10px]">
              <div className="flex justify-between">
                <span>Struk No:</span>
                <span className="font-bold text-stone-900">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span>{formatDate(order.date)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tipe Order:</span>
                <span className="font-bold uppercase text-stone-900">
                  {order.orderType === 'Dine-in' ? (order.tableNumber ? `Dine-In (${order.tableNumber})` : 'Dine-In') : 'Takeaway'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span className="font-bold text-stone-900">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>System POS</span>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="py-3 border-b border-dashed border-stone-300 flex flex-col gap-2">
              {order.items.map((item) => {
                const singleExtrasPrice = item.selectedExtras.reduce((sum, ext) => sum + ext.price, 0);
                const itemUnitPrice = item.menuItem.price + singleExtrasPrice;
                const totalItemPrice = itemUnitPrice * item.quantity;

                return (
                  <div key={item.id} className="flex flex-col gap-0.5 text-[10px]">
                    <div className="flex justify-between font-bold text-stone-900">
                      <span>{item.menuItem.name}</span>
                      <span>{formatIDR(totalItemPrice)}</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-stone-500">
                      <span>
                        {item.quantity} x {formatIDR(itemUnitPrice)}
                      </span>
                    </div>
                    
                    {/* Selected Options detailed rows */}
                    {(item.temperature || item.sweetness || item.selectedExtras.length > 0) && (
                      <div className="text-[8px] text-stone-400 pl-2">
                        {item.temperature && <div>- {item.temperature}</div>}
                        {item.sweetness && <div>- Sweetness: {item.sweetness}</div>}
                        {item.iceLevel && item.temperature === 'Ice' && <div>- Ice: {item.iceLevel}</div>}
                        {item.selectedExtras.map((ext) => (
                          <div key={ext.name}>- +{ext.name} (+{formatIDR(ext.price)})</div>
                        ))}
                        {item.notes && <div className="italic">- Catatan: "{item.notes}"</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Total Math box */}
            <div className="py-3 border-b border-dashed border-stone-300 flex flex-col gap-1 text-[10px]">
              <div className="flex justify-between text-xs font-bold text-stone-950">
                <span>Total Bayar</span>
                <span>{formatIDR(order.total)}</span>
              </div>
            </div>

            {/* Payment Details (Cash Paid & Change) */}
            <div className="py-3 flex flex-col gap-1 text-[10px]">
              <div className="flex justify-between">
                <span>Metode Bayar:</span>
                <span className="font-bold">{order.paymentMethod === 'Cash' ? 'TUNAI/CASH' : order.paymentMethod === 'QRIS' ? 'QRIS NMID' : 'EDC DEBIT CARD'}</span>
              </div>
              <div className="flex justify-between">
                <span>Bayar:</span>
                <span>{formatIDR(order.amountPaid)}</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900">
                <span>Kembalian:</span>
                <span>{formatIDR(order.change)}</span>
              </div>
            </div>

            {/* Slogan Footer */}
            <div className="text-center pt-4 pb-1 border-t border-dashed border-stone-300 mt-2 text-[9px] text-stone-500">
              <p className="font-semibold text-stone-600">TERIMA KASIH</p>
              <p className="mt-1 leading-relaxed">Nikmati harimu dengan secangkir kopi terbaik kami.</p>
              <p className="mt-2 text-[8px] text-stone-400">--- OUTPOST COFFEE ---</p>
            </div>

            {/* Bottom jagged paper serration simulation */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 flex justify-between overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="w-3 h-3 bg-stone-100 rotate-45 transform translate-y-2 border border-stone-200"></div>
              ))}
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-brand-cream-50 border-t border-brand-cream-200 flex flex-col gap-2">
          {/* Print simulator notification */}
          {printSuccess && (
            <div className="flex items-center gap-2 bg-brand-green-900 text-white rounded-lg px-3 py-2 text-xs font-semibold animate-bounce shadow-md">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Struk dicetak dengan sukses!</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className={`flex-1 py-3 px-4 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                isPrinting
                  ? 'bg-white border-stone-300 text-stone-400 cursor-not-allowed'
                  : 'bg-white border-brand-green-800 text-brand-green-900 hover:bg-brand-green-50'
              }`}
            >
              {isPrinting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              <span>{isPrinting ? 'Mencetak...' : 'Cetak Struk'}</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-brand-green-900 text-white hover:bg-brand-green-950 font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer shadow-md transition-all active:scale-98"
            >
              Transaksi Baru
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
