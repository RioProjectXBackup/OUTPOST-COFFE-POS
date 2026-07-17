import React, { useState, useEffect } from 'react';
import { Coffee, Receipt, Settings, BarChart3, Clock, Circle, Cloud } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: 'cashier' | 'waiting-room' | 'history' | 'menu-manager' | 'reports') => void;
  activeCartCount: number;
  pendingOrdersCount?: number;
  isDbConnected?: boolean;
  onOpenDbSync?: () => void;
}

export default function Header({ 
  currentTab, 
  setCurrentTab, 
  activeCartCount, 
  pendingOrdersCount = 0,
  isDbConnected = false,
  onOpenDbSync
}: HeaderProps) {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }));
    };
    
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-brand-green-900 text-white px-4 md:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 shadow-md shrink-0">
      {/* Brand Logo & Title */}
      <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">
                OUTPOST <span className="font-light opacity-80">Coffee</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-white border border-white/20">
                <Circle className="w-1.5 h-1.5 fill-green-400 text-green-400 animate-pulse" />
                Kasir
              </span>
            </div>
            <p className="text-[9px] text-white/60 tracking-wider font-sans uppercase">Point of Sale</p>
          </div>
        </div>

        {/* Compact clock for mobile view, hidden on lg where large clock is shown */}
        <div className="lg:hidden flex flex-col items-end text-right shrink-0">
          <span className="text-xs font-bold text-white font-mono tracking-wide">{time.split(':').slice(0, 2).join(':')}</span>
          <span className="text-[9px] text-white/70 font-semibold">{date.split(',')[1] || date}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar pb-1.5 md:pb-1 whitespace-nowrap bg-white/10 border border-white/10 p-1 rounded-xl w-full md:w-auto gap-1">
        <button
          onClick={() => setCurrentTab('cashier')}
          className={`flex-1 md:flex-initial shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
            currentTab === 'cashier'
              ? 'bg-white text-brand-green-900 shadow-xs'
              : 'text-white/85 hover:text-white hover:bg-white/10'
          }`}
        >
          <Coffee className="w-3.5 h-3.5 shrink-0" />
          <span>Kasir</span>
          {activeCartCount > 0 && (
            <span className={`ml-1 px-1.5 py-0.5 text-[9px] font-extrabold rounded-full ${
              currentTab === 'cashier' ? 'bg-brand-green-900 text-white' : 'bg-white text-brand-green-900'
            }`}>
              {activeCartCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setCurrentTab('waiting-room')}
          className={`flex-1 md:flex-initial shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer relative ${
            currentTab === 'waiting-room'
              ? 'bg-white text-brand-green-900 shadow-xs'
              : 'text-white/85 hover:text-white hover:bg-white/10'
          }`}
        >
          <Clock className="w-3.5 h-3.5 shrink-0 text-amber-500 animate-pulse-slow" />
          <span>Ruang Tunggu</span>
          {pendingOrdersCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[9px] font-extrabold rounded-full bg-amber-500 text-white animate-bounce">
              {pendingOrdersCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setCurrentTab('history')}
          className={`flex-1 md:flex-initial shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
            currentTab === 'history'
              ? 'bg-white text-brand-green-900 shadow-xs'
              : 'text-white/85 hover:text-white hover:bg-white/10'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 shrink-0" />
          <span>Riwayat</span>
        </button>
        <button
          onClick={() => setCurrentTab('menu-manager')}
          className={`flex-1 md:flex-initial shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
            currentTab === 'menu-manager'
              ? 'bg-white text-brand-green-900 shadow-xs'
              : 'text-white/85 hover:text-white hover:bg-white/10'
          }`}
        >
          <Settings className="w-3.5 h-3.5 shrink-0" />
          <span>Kelola Menu</span>
        </button>
        <button
          onClick={() => setCurrentTab('reports')}
          className={`flex-1 md:flex-initial shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
            currentTab === 'reports'
              ? 'bg-white text-brand-green-900 shadow-xs'
              : 'text-white/85 hover:text-white hover:bg-white/10'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 shrink-0" />
          <span>Laporan</span>
        </button>
      </div>

      {/* Cloud Sync Status & Clock Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {onOpenDbSync && (
          <button
            onClick={onOpenDbSync}
            className={`hidden items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all duration-150 cursor-pointer ${
              isDbConnected
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-white/10 hover:bg-white/15 text-stone-200 border-white/10'
            }`}
            title={isDbConnected ? 'Terkoneksi ke Firebase Cloud Firestore' : 'Mode Lokal (Klik untuk mengkoneksikan database)'}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDbConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isDbConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <Cloud className="w-3.5 h-3.5" />
            <span>{isDbConnected ? 'Cloud Sync' : 'Lokal Mode'}</span>
          </button>
        )}

        {/* Clock & Date for desktop (lg) */}
        <div className="hidden lg:flex items-center gap-3 text-right">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white font-mono tracking-wide">{time}</span>
            <span className="text-[10px] text-white/70 font-semibold">{date}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-white shadow-xs shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
