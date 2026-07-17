import React, { useState } from 'react';
import { Search, RotateCcw, Printer, AlertTriangle, ArrowRight, ClipboardList, TrendingUp, CheckCircle, Ban, Trash2 } from 'lucide-react';
import { Order } from '../types';

interface HistoryPanelProps {
  orders: Order[];
  onReprint: (order: Order) => void;
  onRefund: (orderId: string) => void;
  onResetAllData?: () => void;
  onConfirmRequest?: (config: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
  }) => void;
}

export default function HistoryPanel({ orders, onReprint, onRefund, onResetAllData, onConfirmRequest }: HistoryPanelProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Dine-in' | 'Takeaway'>('All');
  const [filterPayment, setFilterPayment] = useState<'All' | 'Cash' | 'QRIS' | 'Debit'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Completed' | 'Refunded'>('All');

  const formatIDR = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ' ' + 
           d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || 
                          o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || o.orderType === filterType;
    const matchesPayment = filterPayment === 'All' || o.paymentMethod === filterPayment;
    const matchesStatus = filterStatus === 'All' || o.status === filterStatus;
    
    return matchesSearch && matchesType && matchesPayment && matchesStatus;
  }).reverse(); // Latest first

  // Summary Metrics
  const activeOrdersCount = orders.filter(o => o.status === 'Completed').length;
  const refundCount = orders.filter(o => o.status === 'Refunded').length;
  const totalRevenue = orders.reduce((sum, o) => o.status === 'Completed' ? sum + o.total : sum, 0);

  return (
    <div className="flex-1 flex flex-col gap-5 overflow-hidden h-full font-sans">
      
      {/* Upper Metrics Grid */}
      <div className="bg-white border border-brand-cream-200 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-brand-green-50 flex items-center justify-center text-brand-green-800 border border-brand-green-100 shrink-0">
            <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider block truncate">
              Jumlah Transaksi Berhasil
            </span>
            <span className="text-xs sm:text-lg font-extrabold text-stone-800 font-mono block truncate">
              {activeOrdersCount} Struk
            </span>
          </div>
        </div>

        {onResetAllData && (
          <button
            onClick={onResetAllData}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-2xs sm:text-xs flex items-center gap-1.5 transition-colors border border-rose-200/50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Riwayat</span>
          </button>
        )}
      </div>

      {/* Filter and Control Row */}
      <div className="flex flex-col xl:flex-row gap-3 items-stretch justify-between bg-white p-4 border border-brand-cream-200 rounded-2xl">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ID Struk atau nama pelanggan..."
            className="w-full bg-stone-50 border border-brand-cream-200 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-brand-green-700 focus:bg-white transition-all font-sans"
          />
        </div>
      </div>

      {/* History List Table container */}
      <div className="flex-1 bg-white border border-brand-cream-200 rounded-2xl overflow-hidden flex flex-col h-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-cream-50 text-[10px] font-bold text-stone-500 uppercase tracking-wider border-b border-brand-cream-200">
                <th className="px-6 py-3.5">ID Struk</th>
                <th className="px-6 py-3.5">Tanggal & Jam</th>
                <th className="px-6 py-3.5">Pelanggan</th>
                <th className="px-6 py-3.5">Tipe Order</th>
                <th className="px-6 py-3.5">Pembayaran</th>
                <th className="px-6 py-3.5">Total Bayar</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-cream-200 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-stone-400 font-sans">
                    <ClipboardList className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                    <p className="font-semibold text-stone-600">Tidak ada riwayat transaksi</p>
                    <p className="text-2xs text-stone-400 mt-1">Data penjualan belum dimasukkan atau terhapus.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-brand-cream-50/40 transition-colors ${
                        order.status === 'Refunded' ? 'bg-red-50/20 text-stone-500' : 'text-stone-700'
                      }`}
                    >
                      {/* ID */}
                      <td className="px-6 py-4 font-bold font-mono text-brand-green-950">
                        {order.id}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 font-mono">
                        {formatDate(order.date)}
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-stone-800">{order.customerName}</div>
                        <div className="text-[10px] text-stone-400">{itemsCount} item dipesan</div>
                      </td>

                      {/* Order Type */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          order.orderType === 'Dine-in'
                            ? 'bg-amber-50 text-amber-800 border-amber-100'
                            : 'bg-teal-50 text-teal-800 border-teal-100'
                        }`}>
                          {order.orderType === 'Dine-in' ? (order.tableNumber ? `Makan Sini (${order.tableNumber})` : 'Makan Sini') : 'Takeaway'}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-[10px] uppercase font-mono bg-stone-100 text-stone-700 border border-stone-200 px-2 py-0.5 rounded">
                          {order.paymentMethod}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4 font-bold font-mono text-stone-900">
                        {formatIDR(order.total)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          order.status === 'Completed'
                            ? 'bg-brand-green-50 text-brand-green-800'
                            : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            order.status === 'Completed' ? 'bg-brand-green-700' : 'bg-red-600'
                          }`}></span>
                          {order.status === 'Completed' ? 'Selesai' : 'Void/Refund'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex gap-1.5">
                          {/* Reprint */}
                          <button
                            onClick={() => onReprint(order)}
                            title="Cetak Ulang Struk"
                            className="p-1.5 bg-white border border-brand-cream-200 text-stone-600 hover:text-brand-green-900 hover:bg-brand-cream-50 hover:border-brand-cream-600 rounded-lg cursor-pointer transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Refund/Void */}
                          {order.status === 'Completed' ? (
                            <button
                              onClick={() => {
                                if (onConfirmRequest) {
                                  onConfirmRequest({
                                    title: 'Hapus / Batalkan Transaksi?',
                                    message: `Apakah Anda yakin ingin menghapus / membatalkan transaksi ${order.id}?`,
                                    confirmText: 'Ya, Batalkan',
                                    cancelText: 'Kembali',
                                    variant: 'danger',
                                    onConfirm: () => onRefund(order.id),
                                  });
                                } else {
                                  onRefund(order.id);
                                }
                              }}
                              title="Hapus / Batalkan Transaksi"
                              className="p-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              disabled
                              title="Transaksi telah dihapus / di-void"
                              className="p-1.5 bg-stone-100 border border-stone-200 text-stone-300 rounded-lg cursor-not-allowed"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
