import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, RotateCcw, AlertTriangle, X, Check, Coffee } from 'lucide-react';
import { MenuItem, Category } from '../types';

interface MenuManagerPanelProps {
  menu: MenuItem[];
  onAddMenuItem: (item: MenuItem) => void;
  onUpdateMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
  onResetToDefault: () => void;
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

export default function MenuManagerPanel({
  menu,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  onResetToDefault,
  onResetAllData,
  onConfirmRequest,
}: MenuManagerPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form Fields
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [category, setCategory] = useState<Category>('Coffee');
  const [image, setImage] = useState('☕');
  const [isAvailable, setIsAvailable] = useState(true);

  // Suggested Emojis
  const emojis = ['☕', '🥛', '🍵', '🍫', '🍑', '🍓', '🍋', '🧋', '🥐', '🍩', '🌀', '🥞', '🍳', '🍝', '🍱', '🍟', '🍰', '🧁', '🍉'];

  const formatIDR = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const resetForm = () => {
    setName('');
    setPrice(0);
    setCategory('Coffee');
    setImage('☕');
    setIsAvailable(true);
    setId('');
  };

  const handleOpenAddForm = () => {
    resetForm();
    setEditingItem(null);
    setShowAddForm(true);
  };

  const handleOpenEditForm = (item: MenuItem) => {
    setEditingItem(item);
    setShowAddForm(false);
    
    // Fill values
    setId(item.id);
    setName(item.name);
    setPrice(item.price);
    setCategory(item.category);
    setImage(item.image);
    setIsAvailable(item.isAvailable);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0) return;

    if (editingItem) {
      // Edit mode
      const updated: MenuItem = {
        ...editingItem,
        name: name.trim(),
        price,
        category,
        image,
        isAvailable,
      };
      onUpdateMenuItem(updated);
      setEditingItem(null);
    } else {
      // Add mode
      const newItem: MenuItem = {
        id: 'item_' + Date.now(),
        name: name.trim(),
        price,
        category,
        image,
        color: 'from-amber-100 to-amber-200',
        isAvailable: true,
        options: {
          temperatures: ['Hot', 'Ice'],
          sweetness: ['Normal', 'Less Sweet', 'Extra Sweet'],
          iceLevels: ['Normal', 'Less Ice', 'No Ice'],
          extras: [
            { name: 'Espresso Shot', price: 5000 },
            { name: 'Syrup Flavour', price: 4000 }
          ]
        }
      };
      onAddMenuItem(newItem);
      setShowAddForm(false);
    }
    resetForm();
  };

  const handleToggleStock = (item: MenuItem) => {
    const updated = { ...item, isAvailable: !item.isAvailable };
    onUpdateMenuItem(updated);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-5 overflow-hidden h-full font-sans">
      
      {/* Left panel: List of all menu items */}
      <div className="flex-1 bg-white border border-brand-cream-200 rounded-2xl p-4 flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-brand-cream-200">
          <div>
            <h3 className="font-bold text-stone-800 text-sm tracking-wide uppercase">Daftar Menu Aktif</h3>
            <p className="text-[10px] text-stone-500">Terdapat {menu.length} item menu yang terdaftar di sistem.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddForm}
              className="px-3 py-2 bg-brand-green-900 hover:bg-brand-green-950 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Menu</span>
            </button>
          </div>
        </div>

        {/* Menu Scroller Table */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
            {menu.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  item.isAvailable
                    ? 'bg-brand-cream-50/50 border-brand-cream-200 hover:border-brand-cream-600'
                    : 'bg-stone-50 border-stone-200 opacity-70'
                }`}
              >
                {/* Details layout */}
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[9px] font-bold tracking-wider text-stone-400 uppercase font-mono block">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-xs text-stone-800 line-clamp-1">{item.name}</h4>
                    <span className="text-2xs font-extrabold text-brand-green-900 font-mono mt-0.5 block">
                      {formatIDR(item.price)}
                    </span>
                  </div>
                </div>

                {/* Operations buttons */}
                <div className="flex items-center gap-1.5">
                  {/* Stock Toggle */}
                  <button
                    onClick={() => handleToggleStock(item)}
                    title={item.isAvailable ? 'Sembunyikan / Kosongkan Stok' : 'Aktifkan Stok'}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      item.isAvailable
                        ? 'bg-white border-brand-green-200 text-brand-green-800 hover:bg-brand-green-50'
                        : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    {item.isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEditForm(item)}
                    title="Ubah Detail Menu"
                    className="p-1.5 bg-white border border-brand-cream-200 text-stone-600 hover:border-brand-cream-600 hover:bg-brand-cream-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (onConfirmRequest) {
                        onConfirmRequest({
                          title: 'Hapus Menu?',
                          message: `Apakah Anda yakin ingin menghapus ${item.name} dari daftar menu?`,
                          confirmText: 'Ya, Hapus',
                          cancelText: 'Batal',
                          variant: 'danger',
                          onConfirm: () => {
                            onDeleteMenuItem(item.id);
                            if (editingItem?.id === item.id) {
                              setEditingItem(null);
                            }
                          },
                        });
                      } else {
                        onDeleteMenuItem(item.id);
                        if (editingItem?.id === item.id) {
                          setEditingItem(null);
                        }
                      }
                    }}
                    title="Hapus Menu"
                    className="p-1.5 bg-white border border-red-100 text-red-600 hover:border-red-200 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel: Editor / Form block */}
      {(showAddForm || editingItem) && (
        <div className="w-full md:w-80 bg-white border border-brand-cream-200 rounded-2xl p-5 h-fit shadow-xs animate-in slide-in-from-right-4 duration-150">
          <div className="flex justify-between items-center mb-4 pb-1 border-b border-brand-cream-200">
            <h3 className="font-bold text-xs tracking-wider uppercase text-stone-800">
              {editingItem ? 'Edit Detail Menu' : 'Tambah Menu Baru'}
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingItem(null);
              }}
              className="p-1 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
            {/* Name */}
            <div>
              <label className="text-3xs font-bold text-stone-500 uppercase tracking-wide mb-1 block">
                Nama Produk *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Kopi Caramel, Croissant Coklat..."
                className="w-full bg-stone-50 border border-brand-cream-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-green-700 focus:bg-white transition-all font-sans"
              />
            </div>

            {/* Price & Category Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-3xs font-bold text-stone-500 uppercase tracking-wide mb-1 block">
                  Harga (Rp) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={price || ''}
                  onChange={(e) => setPrice(parseInt(e.target.value, 10))}
                  placeholder="25000"
                  className="w-full bg-stone-50 border border-brand-cream-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-green-700 focus:bg-white transition-all font-sans font-mono"
                />
              </div>

              <div>
                <label className="text-3xs font-bold text-stone-500 uppercase tracking-wide mb-1 block">
                  Kategori *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-stone-50 border border-brand-cream-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-brand-green-700 focus:bg-white transition-all font-sans cursor-pointer font-semibold text-stone-700"
                >
                  <option value="Coffee">Coffee</option>
                  <option value="Non-Coffee">Non-Coffee</option>
                </select>
              </div>
            </div>

            {/* If Edit Mode, Show Stock Availability Switcher */}
            {editingItem && (
              <div className="flex items-center justify-between p-2.5 border border-brand-cream-200 rounded-xl bg-stone-50">
                <span className="font-bold text-stone-700">Tersedia di Stok:</span>
                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`px-3 py-1.5 rounded-lg text-3xs font-bold uppercase cursor-pointer transition-all ${
                    isAvailable
                      ? 'bg-brand-green-900 text-white shadow-xs'
                      : 'bg-red-50 border border-red-200 text-red-600'
                  }`}
                >
                  {isAvailable ? 'Tersedia' : 'Kosong'}
                </button>
              </div>
            )}

            {/* Form actions */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-2 border border-stone-300 hover:border-stone-400 text-stone-600 font-bold rounded-lg cursor-pointer hover:bg-stone-50 transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-brand-green-900 hover:bg-brand-green-950 text-white font-bold rounded-lg cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5 stroke-[3px]" />
                <span>Simpan</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
