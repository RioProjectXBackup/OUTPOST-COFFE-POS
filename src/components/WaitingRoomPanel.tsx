import React from 'react';
import { Clock, Utensils, ShoppingBag, Banknote, Trash2, Printer } from 'lucide-react';
import { Order } from '../types';

interface WaitingRoomPanelProps {
  orders: Order[];
  onConfirmPayment: (order: Order) => void;
  onCancelOrder: (orderId: string) => void;
  onPrintReceipt: (order: Order) => void;
}

export default function WaitingRoomPanel({
  orders,
  onConfirmPayment,
  onCancelOrder,
  onPrintReceipt,
}: WaitingRoomPanelProps) {
  // Filter only pending/waiting orders
  const pendingOrders = orders.filter((order) => order.status === 'Pending');

  const formatIDR = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const getElapsedTime = (isoString: string) => {
    const orderTime = new Date(isoString).getTime();
    const now = new Date().getTime();
    const diffMs = now - orderTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} jam lalu`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-5 border-b border-brand-green-900/10">
        <div>
          <h2 className="font-extrabold text-sm sm:text-xl text-stone-800 tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 sm:w-5.5 sm:h-5.5 text-amber-500 animate-pulse" />
            Ruang Tunggu & Pesanan Masuk
          </h2>
          <p className="text-[10px] sm:text-xs text-stone-500 mt-0.5 sm:mt-1">
            Daftar pesanan pelanggan yang belum membayar. Selesaikan pembayaran setelah pelanggan membayar.
          </p>
        </div>
        <div className="bg-amber-100 border border-amber-200 text-amber-800 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
          <span>Menunggu Pembayaran:</span>
          <span className="font-mono text-sm font-extrabold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-300">
            {pendingOrders.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-6">
        {pendingOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-stone-400 gap-4 py-24 bg-white/50 border border-dashed border-brand-green-900/10 rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-brand-cream-100/80 flex items-center justify-center text-brand-green-900/40">
              <Clock className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="font-bold text-stone-700">Tidak ada pesanan di ruang tunggu</p>
              <p className="text-xs text-stone-400 mt-1">Semua pesanan baru telah selesai dibayar atau belum diinput.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-brand-green-900/10 hover:border-brand-green-900/20 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Card Header */}
                <div className="px-5 py-4 bg-brand-cream-50 border-b border-brand-cream-200 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold text-stone-400 font-mono block mb-0.5">
                      {order.id}
                    </span>
                    <h3 className="font-bold text-stone-800 text-sm flex items-center gap-1.5">
                      👤 {order.customerName}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Belum Bayar
                  </span>
                </div>

                {/* Order Details */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    {/* Order Meta (Type, Table, Time) */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-3">
                      <span className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded bg-stone-100 text-stone-700 border border-stone-200">
                        {order.orderType === 'Dine-in' ? (
                          <>
                            <Utensils className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-brand-green-800" />
                            Makan Sini {order.tableNumber ? `- ${order.tableNumber}` : ''}
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-brand-green-800" />
                            Bawa Pulang
                          </>
                        )}
                      </span>
                      <span className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded bg-stone-100 text-stone-700 border border-stone-200 ml-auto font-sans">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-stone-400" />
                        {getElapsedTime(order.date)}
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-extrabold text-stone-400 tracking-wider uppercase block">
                        Detail Pesanan
                      </span>
                      <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1 no-scrollbar">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="text-xs bg-brand-cream-50/40 border border-brand-cream-100 rounded-lg p-2 flex flex-col gap-0.5"
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-stone-800">
                                <span className="font-bold text-brand-green-900 mr-1">{item.quantity}x</span>
                                {item.menuItem.name}
                              </span>
                              <span className="font-mono text-3xs text-stone-500 font-bold">
                                {formatIDR(item.menuItem.price * item.quantity)}
                              </span>
                            </div>
                            {item.notes && (
                              <p className="text-[10px] italic text-brand-cream-900 pl-4 mt-0.5 bg-amber-50/50 py-0.5 rounded border border-amber-100/30">
                                📝 {item.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Total Tag */}
                  <div className="border-t border-dashed border-stone-200 pt-3 flex justify-between items-center">
                    <span className="text-2xs font-bold text-stone-500 uppercase tracking-wide">Total Harus Bayar</span>
                    <span className="text-base font-extrabold text-brand-green-900 font-mono">
                      {formatIDR(order.total)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons footer */}
                <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-100 flex gap-2">
                  <button
                    onClick={() => onCancelOrder(order.id)}
                    className="p-2.5 rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                    title="Batalkan Pesanan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onPrintReceipt(order)}
                    className="p-2.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition-all cursor-pointer"
                    title="Cetak Slip Order"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onConfirmPayment(order)}
                    className="flex-1 bg-brand-green-900 hover:bg-brand-green-950 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-98"
                  >
                    <Banknote className="w-4 h-4" />
                    Konfirmasi Bayar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
