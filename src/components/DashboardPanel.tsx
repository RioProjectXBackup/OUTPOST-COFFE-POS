import React, { useState } from 'react';
import { Award, ShoppingBag, Calendar, Activity, ChevronRight, TrendingUp, DollarSign, ArrowUpRight, BarChart3 } from 'lucide-react';
import { Order, Category } from '../types';

interface DashboardPanelProps {
  orders: Order[];
}

export default function DashboardPanel({ orders }: DashboardPanelProps) {
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [daysRange, setDaysRange] = useState<7 | 30>(7);

  const formatIDR = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const completedOrders = orders.filter((o) => o.status === 'Completed');

  // Date parsing helpers for local time (YYYY-MM-DD)
  const getLocalDateString = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${date}`;
    } catch (e) {
      return '';
    }
  };

  // 1. Get dates for Today and Yesterday
  const now = new Date();
  const todayStr = getLocalDateString(now.toISOString());

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday.toISOString());

  // Calculate Today's and Yesterday's metrics
  const todayOrders = completedOrders.filter((o) => getLocalDateString(o.date) === todayStr);
  const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const todayCount = todayOrders.length;

  const yesterdayOrders = completedOrders.filter((o) => getLocalDateString(o.date) === yesterdayStr);
  const yesterdaySales = yesterdayOrders.reduce((sum, o) => sum + o.total, 0);
  const yesterdayCount = yesterdayOrders.length;

  // Percentage change today vs yesterday
  let salesChangePct = 0;
  if (yesterdaySales > 0) {
    salesChangePct = ((todaySales - yesterdaySales) / yesterdaySales) * 100;
  }

  // 2. Generate list of dates for the chart based on selected range (7 or 30 days)
  const selectedRangeDays = Array.from({ length: daysRange }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - ((daysRange - 1) - i));
    return getLocalDateString(d.toISOString());
  });

  // Calculate real sales per day
  const dailySalesMap: Record<string, number> = {};
  selectedRangeDays.forEach((date) => {
    dailySalesMap[date] = 0;
  });

  completedOrders.forEach((o) => {
    const oDate = getLocalDateString(o.date);
    if (oDate in dailySalesMap) {
      dailySalesMap[oDate] += o.total;
    }
  });

  // Generate hybrid chart data (combining realistic baseline with real POS data)
  const chartData = selectedRangeDays.map((dateStr, index) => {
    const realRevenue = dailySalesMap[dateStr] || 0;
    const totalRevenue = realRevenue; // Set baseRevenue to 0 to only show real transactions

    // Format date labels (e.g. "16 Jul")
    const d = new Date(dateStr);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const label = `${d.getDate()} ${monthNames[d.getMonth()]}`;

    return {
      date: dateStr,
      label,
      revenue: totalRevenue,
      realRevenue,
    };
  });

  const totalRangeSales = chartData.reduce((sum, d) => sum + d.revenue, 0);

  // 3. Category Sales Breakdown (real stats only for clean state)
  const categoryStats: Record<Category, { count: number; revenue: number; icon: string; color: string; hoverColor: string }> = {
    'Coffee': { count: 0, revenue: 0, icon: '☕', color: 'bg-amber-600', hoverColor: 'hover:bg-amber-700' },
    'Non-Coffee': { count: 0, revenue: 0, icon: '🥤', color: 'bg-teal-600', hoverColor: 'hover:bg-teal-700' },
  };

  // Add real completed orders to the category sales
  completedOrders.forEach((order) => {
    order.items.forEach((item) => {
      const cat = item.menuItem.category;
      if (cat in categoryStats) {
        const extrasPrice = item.selectedExtras.reduce((sum, ext) => sum + ext.price, 0);
        const totalItemPrice = (item.menuItem.price + extrasPrice) * item.quantity;
        categoryStats[cat].count += item.quantity;
        categoryStats[cat].revenue += totalItemPrice;
      }
    });
  });

  // Sort categories by total units sold to find the Best Seller
  const sortedCategories = Object.entries(categoryStats)
    .map(([name, data]) => ({ name: name as Category, ...data }))
    .sort((a, b) => b.count - a.count);

  const bestCategory = sortedCategories[0] || { name: 'Belum Ada', count: 0, icon: '☕', revenue: 0 };
  const totalCategoryUnits = sortedCategories.reduce((sum, c) => sum + c.count, 0) || 1;

  // 4. Best Selling Products (Top 5)
  const productSalesMap: Record<string, { count: number; revenue: number; category: Category; image: string }> = {};

  completedOrders.forEach((order) => {
    order.items.forEach((item) => {
      const name = item.menuItem.name;
      const extrasPrice = item.selectedExtras.reduce((sum, ext) => sum + ext.price, 0);
      const totalItemPrice = (item.menuItem.price + extrasPrice) * item.quantity;
      
      if (productSalesMap[name]) {
        productSalesMap[name].count += item.quantity;
        productSalesMap[name].revenue += totalItemPrice;
      } else {
        productSalesMap[name] = {
          count: item.quantity,
          revenue: totalItemPrice,
          category: item.menuItem.category,
          image: item.menuItem.image,
        };
      }
    });
  });

  const popularItems = Object.entries(productSalesMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxProductCount = popularItems.length > 0 ? Math.max(...popularItems.map((p) => p.count)) : 1;

  // Chart layout calculations
  const chartHeight = 180;
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue)) * 1.1 || 1000000;

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 h-full pb-8 font-sans">
      
      {/* 1. Header & Title block */}
      <div className="flex flex-col gap-1.5 border-b border-brand-cream-200/60 pb-4">
        <h2 className="text-sm font-extrabold text-stone-800 tracking-wider uppercase flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-green-800" />
          Analisis & Laporan Penjualan
        </h2>
        <p className="text-xs text-stone-500">
          Performa kedai kopi Anda dalam 30 hari terakhir. Pendapatan dihitung secara real-time.
        </p>
      </div>

      {/* 2. Key Metrics Grid (Today, Yesterday, Monthly, Best Category) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Card 1: Today's Sales */}
        <div className="bg-gradient-to-br from-emerald-900 to-brand-green-950 text-white p-4.5 rounded-2xl shadow-sm border border-brand-green-800 relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 text-sm font-bold">
            ☀️
          </div>
          <span className="text-[10px] font-extrabold text-emerald-300/80 uppercase tracking-widest block mb-1">
            Penjualan Hari Ini
          </span>
          <div className="flex flex-col mt-1">
            <span className="text-lg font-extrabold font-mono tracking-tight">
              {formatIDR(todaySales)}
            </span>
            <span className="text-[10px] text-emerald-200/80 mt-1.5 flex items-center gap-1">
              <span className="font-bold">{todayCount}</span> transaksi selesai hari ini
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500/20" />
        </div>

        {/* Card 2: Yesterday's Sales */}
        <div className="bg-white border border-brand-cream-200 p-4.5 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 text-sm">
            🌙
          </div>
          <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest block mb-1">
            Penjualan Semalam / Kemarin
          </span>
          <div className="flex flex-col mt-1">
            <span className="text-lg font-extrabold text-stone-800 font-mono tracking-tight">
              {formatIDR(yesterdaySales)}
            </span>
            <div className="mt-1.5 flex items-center gap-1.5">
              {salesChangePct > 0 ? (
                <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                  ▲ +{salesChangePct.toFixed(0)}%
                </span>
              ) : salesChangePct < 0 ? (
                <span className="text-[10px] font-bold text-rose-600 flex items-center">
                  ▼ {salesChangePct.toFixed(0)}%
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-stone-500">
                  Stabil
                </span>
              )}
              <span className="text-[10px] text-stone-400">
                dibanding kemarin ({yesterdayCount} struk)
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Sales Days Range */}
        <div className="bg-white border border-brand-cream-200 p-4.5 rounded-2xl shadow-xs">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-brand-green-800 text-sm">
            📅
          </div>
          <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest block mb-1">
            Total Omzet ({daysRange} Hari)
          </span>
          <div className="flex flex-col mt-1">
            <span className="text-lg font-extrabold text-stone-800 font-mono tracking-tight">
              {formatIDR(totalRangeSales)}
            </span>
            <span className="text-[10px] text-stone-400 mt-1.5">
              Akumulasi omzet berjalan nyata
            </span>
          </div>
        </div>

        {/* Card 4: Best-Selling Category Highlight */}
        <div className="bg-amber-50/70 border border-amber-200 p-4.5 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 text-sm">
            👑
          </div>
          <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest block mb-1">
            Kategori Terlaris
          </span>
          <div className="flex flex-col mt-1">
            <span className="text-base font-extrabold text-stone-800 flex items-center gap-1.5">
              <span>{bestCategory.icon}</span>
              <span>{bestCategory.name}</span>
            </span>
            <span className="text-[10px] text-amber-900 mt-1.5 font-medium">
              <span className="font-extrabold">{bestCategory.count} unit</span> terjual ({((bestCategory.count / totalCategoryUnits) * 100).toFixed(0)}% dari total)
            </span>
          </div>
        </div>

      </div>

      {/* 3. Main Dashboard Content (Chart and Lists) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Grid (Span 2): Dynamic Sales Trend Chart */}
        <div className="xl:col-span-2 bg-white border border-brand-cream-200 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-brand-cream-200/60">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4.5 h-4.5 text-brand-green-800" />
                <h3 className="font-bold text-xs text-stone-800 tracking-wide uppercase">
                  Tren Penjualan {daysRange} Hari Terakhir
                </h3>
              </div>
              
              {/* Range Selector Toggle Button */}
              <div className="flex bg-stone-100 p-0.5 rounded-lg border border-brand-cream-200/50 text-[10px] font-bold text-stone-700">
                <button
                  onClick={() => {
                    setDaysRange(7);
                    setHoveredBarIndex(null);
                  }}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    daysRange === 7
                      ? 'bg-brand-green-900 text-white shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  7 Hari
                </button>
                <button
                  onClick={() => {
                    setDaysRange(30);
                    setHoveredBarIndex(null);
                  }}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    daysRange === 30
                      ? 'bg-brand-green-900 text-white shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  30 Hari
                </button>
              </div>
            </div>

            {/* Interactive Custom SVG Line Chart */}
            <div className="relative mt-6">
              {/* Tooltip Overlay */}
              {hoveredBarIndex !== null && hoveredBarIndex < daysRange && (
                <div 
                  className="absolute z-10 bg-stone-900 text-white rounded-lg px-2.5 py-1.5 text-[10px] pointer-events-none shadow-md font-sans -top-12 flex flex-col gap-0.5 border border-stone-800"
                  style={{
                    left: `${(((35 + (hoveredBarIndex / (daysRange - 1 || 1)) * (600 - 35 - 15)) / 600) * 100).toFixed(1)}%`,
                    transform: 'translateX(-50%)',
                    transition: 'left 0.1s ease-out'
                  }}
                >
                  <span className="font-bold text-stone-300">{chartData[hoveredBarIndex].label}</span>
                  <span className="font-mono text-emerald-400 font-extrabold">{formatIDR(chartData[hoveredBarIndex].revenue)}</span>
                  {chartData[hoveredBarIndex].realRevenue > 0 && (
                    <span className="text-[9px] text-stone-400">Order Kasir: {formatIDR(chartData[hoveredBarIndex].realRevenue)}</span>
                  )}
                </div>
              )}

              {/* SVG Graphic */}
              <div className="w-full h-[180px]">
                <svg className="w-full h-full overflow-visible" viewBox={`0 0 600 ${chartHeight}`}>
                  <defs>
                    <linearGradient id="chart-line-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2D4F1E" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#2D4F1E" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = chartHeight - 15 - ratio * (chartHeight - 25);
                    const val = Math.round(ratio * maxRevenue);
                    return (
                      <g key={idx} className="opacity-40">
                        <line 
                          x1="35" 
                          y1={y} 
                          x2="585" 
                          y2={y} 
                          stroke="#EFEBE4" 
                          strokeWidth="1" 
                          strokeDasharray="4,4" 
                        />
                        <text 
                          x="0" 
                          y={y + 3} 
                          fill="#a8a29e" 
                          className="text-[9px] font-mono font-semibold"
                        >
                          {ratio > 0 ? (val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${val / 1000}k`) : '0'}
                        </text>
                      </g>
                    );
                  })}

                  {/* Gradient Area under the line */}
                  <path
                    d={chartData.map((d, index) => {
                      const x = 35 + (index / (daysRange - 1 || 1)) * (600 - 35 - 15);
                      const y = chartHeight - 15 - (d.revenue / maxRevenue) * (chartHeight - 25);
                      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                    }).join(' ') + ` L ${(35 + (daysRange - 1) / (daysRange - 1 || 1) * (600 - 35 - 15)).toFixed(1)} ${(chartHeight - 15).toFixed(1)} L 35.0 ${(chartHeight - 15).toFixed(1)} Z`}
                    fill="url(#chart-line-gradient)"
                  />

                  {/* Main Line */}
                  <path
                    d={chartData.map((d, index) => {
                      const x = 35 + (index / (daysRange - 1 || 1)) * (600 - 35 - 15);
                      const y = chartHeight - 15 - (d.revenue / maxRevenue) * (chartHeight - 25);
                      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#2D4F1E"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Interactive Dot and Hover Target Areas */}
                  {chartData.map((d, index) => {
                    const x = 35 + (index / (daysRange - 1 || 1)) * (600 - 35 - 15);
                    const y = chartHeight - 15 - (d.revenue / maxRevenue) * (chartHeight - 25);
                    const isHovered = hoveredBarIndex === index;
                    const sliceWidth = (600 - 35 - 15) / (daysRange - 1 || 1);

                    return (
                      <g key={index}>
                        {/* Interactive Invisible Slice */}
                        <rect
                          x={x - sliceWidth / 2}
                          y="0"
                          width={sliceWidth}
                          height={chartHeight}
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredBarIndex(index)}
                          onMouseLeave={() => setHoveredBarIndex(null)}
                        />

                        {/* Point Marker Circle */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isHovered ? 6 : 4}
                          className={`transition-all duration-150 ${
                            isHovered 
                              ? 'fill-brand-green-900 stroke-white stroke-[2px] filter brightness-110' 
                              : d.realRevenue > 0
                                ? 'fill-emerald-600 stroke-white stroke-[1.5px]'
                                : 'fill-brand-green-800/60 stroke-white stroke-[1.5px]'
                          }`}
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* X-Axis labels for selected anchor days */}
              <div className="flex justify-between mt-2.5 px-1 border-t border-brand-cream-200/50 pt-1.5 text-[9px] font-bold text-stone-400 tracking-wider font-mono">
                <span>{chartData[0].label}</span>
                {daysRange === 30 && <span>{chartData[15].label}</span>}
                <span>{chartData[chartData.length - 1].label}</span>
              </div>
            </div>
          </div>

          {/* Revenue list per date below chart */}
          <div className="mt-4 border-t border-brand-cream-200/60 pt-3">
            <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider block mb-2">
              Pendapatan per Tanggal
            </span>
            <div className="flex gap-1.5 overflow-x-auto custom-scrollbar-dark pb-2">
              {chartData.map((d, index) => {
                const isHovered = hoveredBarIndex === index;
                const formattedRevenue = d.revenue === 0 ? '0k' : `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(d.revenue / 1000))}k`;
                return (
                  <div 
                    key={index}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-all duration-150 cursor-pointer shrink-0 ${
                      isHovered 
                        ? 'bg-brand-green-900 border-brand-green-950 text-white shadow-3xs' 
                        : 'bg-stone-50 border-brand-cream-200/60 text-stone-700 hover:bg-stone-100'
                    }`}
                    onMouseEnter={() => setHoveredBarIndex(index)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    <span className={`font-extrabold uppercase ${isHovered ? 'text-white/80' : 'text-stone-500'}`}>{d.label}</span>
                    <span className={isHovered ? 'text-white/40' : 'text-stone-300'}>:</span>
                    <span className="font-bold font-mono">{formattedRevenue}</span>
                  </div>
                );
              })}
            </div>
          </div>


        </div>

        {/* Right Grid (Span 1): Best-Selling Category & Top Products */}
        <div className="flex flex-col gap-6">
          
          {/* Best-Selling Categories Share */}
          <div className="bg-white border border-brand-cream-200 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-brand-cream-200/60">
                <Award className="w-4.5 h-4.5 text-brand-green-800" />
                <h3 className="font-bold text-xs text-stone-800 tracking-wide uppercase">
                  Kategori Terlaris (Share)
                </h3>
              </div>

              <div className="flex flex-col gap-3.5">
                {sortedCategories.map((cat, idx) => {
                  const pct = totalCategoryUnits > 0 ? (cat.count / totalCategoryUnits) * 100 : 0;
                  return (
                    <div key={cat.name} className="flex flex-col gap-1 text-[11px] text-stone-600">
                      <div className="flex justify-between items-center font-bold">
                        <div className="flex items-center gap-1.5">
                          <span>{cat.icon}</span>
                          <span className={idx === 0 ? 'text-brand-green-900 font-extrabold' : 'text-stone-700'}>
                            {cat.name} {idx === 0 && '👑'}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-stone-500">
                          {cat.count} unit ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full bg-gradient-to-r ${cat.color} rounded-full`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top 5 Products List */}
          <div className="bg-white border border-brand-cream-200 p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-brand-cream-200/60">
              <ShoppingBag className="w-4.5 h-4.5 text-brand-green-800" />
              <h3 className="font-bold text-xs text-stone-800 tracking-wide uppercase">
                Menu Terlaris (Top Products)
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              {popularItems.map((prod, idx) => (
                <div key={prod.name} className="flex items-center justify-between text-[11px] border-b border-stone-50/50 pb-2 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-4.5 h-4.5 rounded-md bg-stone-50 border border-stone-100 flex items-center justify-center text-xs shrink-0 font-sans">
                      {idx + 1}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-stone-800 truncate">{prod.name}</span>
                      <span className="text-[10px] text-stone-400 font-medium">{prod.category}</span>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[10px] shrink-0 font-semibold text-stone-600 pl-2">
                    <span className="font-extrabold text-stone-800 block">{prod.count}x</span>
                    <span>{formatIDR(prod.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
