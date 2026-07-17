import React from 'react';
import { Search, ShoppingBag, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { MenuItem, Category } from '../types';

interface MenuGridProps {
  menu: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
  selectedCategory: Category | 'All';
  setSelectedCategory: (category: Category | 'All') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function MenuGrid({
  menu,
  onSelectItem,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
}: MenuGridProps) {
  const categories: (Category | 'All')[] = ['All', 'Coffee', 'Non-Coffee'];

  const filteredMenu = menu.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatIDR = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
      {/* Search and Category Filter Header */}
      <div className="flex flex-col gap-3 shrink-0">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari menu kopi, minuman, atau makanan..."
            className="w-full bg-white border border-brand-green-900/10 rounded-xl pl-11 pr-4 py-2 text-xs md:text-sm outline-none focus:border-brand-green-800 transition-all font-sans text-stone-800 placeholder-stone-400 shadow-3xs"
          />
        </div>

        {/* Category Scroll Bar */}
        <div className="flex flex-col gap-1">
          <div className="flex overflow-x-auto custom-scrollbar-dark pb-1.5 whitespace-nowrap gap-2">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1 sm:px-4 sm:py-2 rounded-lg text-[9px] sm:text-xs font-bold transition-all duration-150 cursor-pointer shrink-0 border ${
                    isActive
                      ? 'bg-brand-green-900 text-white border-brand-green-900 shadow-xs'
                      : 'bg-white text-stone-600 border-brand-green-900/10 hover:bg-stone-50'
                  }`}
                >
                  {cat === 'All' ? 'Semua Menu' : cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid container */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredMenu.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400 gap-3 bg-white/40 border border-dashed border-brand-green-900/10 rounded-2xl">
            <AlertCircle className="w-10 h-10 text-stone-300" />
            <div className="text-center">
              <p className="font-semibold text-stone-600">Menu tidak ditemukan</p>
              <p className="text-xs text-stone-400 mt-1">Coba gunakan kata kunci pencarian atau kategori lain.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredMenu.map((item) => {
              const hasOptions = item.options && (
                (item.options.temperatures && item.options.temperatures.length > 0) ||
                (item.options.sweetness && item.options.sweetness.length > 0) ||
                (item.options.extras && item.options.extras.length > 0)
              );

              return (
                <button
                  key={item.id}
                  onClick={() => item.isAvailable && onSelectItem(item)}
                  disabled={!item.isAvailable}
                  className={`group relative flex flex-col bg-white rounded-xl border border-brand-green-900/10 p-3 sm:p-4 text-left transition-all ${
                    item.isAvailable
                      ? 'hover:shadow-md hover:border-brand-green-900 cursor-pointer active:scale-98 hover:ring-2 hover:ring-brand-green-900/10'
                      : 'opacity-65 cursor-not-allowed'
                  }`}
                >
                  {/* Info details */}
                  <div className="flex-1 flex flex-col justify-between w-full">
                    <div>
                      <div className="flex justify-between items-center gap-1 mb-1 sm:mb-1.5">
                        <span className="text-[8.5px] sm:text-[9px] font-bold tracking-wider uppercase text-brand-green-900/60 font-sans">
                          {item.category}
                        </span>
                        {!item.isAvailable && (
                          <span className="text-[8px] font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-100">
                            Habis
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-[10px] sm:text-xs text-stone-800 leading-snug group-hover:text-brand-green-900 transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                    </div>
                    <div className="mt-2 sm:mt-2.5 flex items-baseline justify-between">
                      <span className="text-[9px] sm:text-[11px] font-bold text-brand-green-900 font-sans">
                        {formatIDR(item.price)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
