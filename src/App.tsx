import React, { useState, useEffect } from 'react';
import { Category, ExtraOption, MenuItem, CartItem, Order } from './types';
import { DEFAULT_MENU } from './data/defaultMenu';

// Firebase Database helpers
import { 
  isFirebaseConnected, 
  subscribeToMenu, 
  subscribeToOrders, 
  uploadMenuToFirebase, 
  uploadAllOrdersToFirebase 
} from './lib/firebase';

// Components
import Header from './components/Header';
import MenuGrid from './components/MenuGrid';
import CartPanel from './components/CartPanel';
import CustomizerModal from './components/CustomizerModal';
import CheckoutModal from './components/CheckoutModal';
import ReceiptModal from './components/ReceiptModal';
import HistoryPanel from './components/HistoryPanel';
import MenuManagerPanel from './components/MenuManagerPanel';
import DashboardPanel from './components/DashboardPanel';
import WaitingRoomPanel from './components/WaitingRoomPanel';
import ConfirmModal from './components/ConfirmModal';
import DbSyncModal from './components/DbSyncModal';

export default function App() {
  // Tabs & Filters
  const [currentTab, setCurrentTab] = useState<'cashier' | 'waiting-room' | 'history' | 'menu-manager' | 'reports'>('cashier');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartMobileOpen, setIsCartMobileOpen] = useState(false);

  // Custom Confirmation Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
  } | null>(null);

  const showConfirm = (config: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
  }) => {
    setConfirmConfig({
      isOpen: true,
      ...config,
    });
  };

  // Core POS States
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const storedMenu = localStorage.getItem('outpost_menu');
    if (storedMenu) {
      try {
        const parsed = JSON.parse(storedMenu);
        if (parsed && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_MENU;
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => {
    const storedOrders = localStorage.getItem('outpost_orders');
    if (storedOrders) {
      try {
        const parsed = JSON.parse(storedOrders);
        if (parsed && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [];
  });
  const [pendingOrderForCheckout, setPendingOrderForCheckout] = useState<Order | null>(null);

  const formatIDR = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  // Customization & Checkout overlays states
  const [activeMenuItemForCustomization, setActiveMenuItemForCustomization] = useState<MenuItem | null>(null);
  const [activeCartItemForCustomization, setActiveCartItemForCustomization] = useState<CartItem | null>(null);
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);

  // Active Discounts/Promo state passed to checkout
  const [activeDiscountAmount, setActiveDiscountAmount] = useState<number>(0);
  const [activeDiscountLabel, setActiveDiscountLabel] = useState<string>('');

  // Database Connection & PWA install states
  const [isDbConnected, setIsDbConnected] = useState(isFirebaseConnected());
  const [isDbSyncModalOpen, setIsDbSyncModalOpen] = useState(false);
  const [firebaseTrigger, setFirebaseTrigger] = useState(0);

  // PWA Install prompt states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also check if already running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const handleFirebaseConfigChanged = () => {
    const connected = isFirebaseConnected();
    setIsDbConnected(connected);
    setFirebaseTrigger((prev) => prev + 1);

    // If we just connected, upload existing local data to Firebase so we don't start empty
    if (connected) {
      const storedMenu = localStorage.getItem('outpost_menu');
      if (storedMenu) {
        try {
          const parsed = JSON.parse(storedMenu);
          if (parsed && parsed.length > 0) {
            uploadMenuToFirebase(parsed);
          }
        } catch (e) {}
      }

      const storedOrders = localStorage.getItem('outpost_orders');
      if (storedOrders) {
        try {
          const parsed = JSON.parse(storedOrders);
          if (parsed && parsed.length > 0) {
            uploadAllOrdersToFirebase(parsed);
          }
        } catch (e) {}
      }
    }
  };

  // 1. Initial Load & Firebase Synchronization
  useEffect(() => {
    const active = isFirebaseConnected();
    setIsDbConnected(active);

    if (active) {
      // Subscribe to real-time Menu updates
      const unsubscribeMenu = subscribeToMenu((fbMenu) => {
        if (fbMenu && fbMenu.length > 0) {
          setMenu(fbMenu);
          localStorage.setItem('outpost_menu', JSON.stringify(fbMenu));
        } else {
          // Firestore menu collection is empty! Check local storage or DEFAULT_MENU to seed it.
          const storedMenu = localStorage.getItem('outpost_menu');
          let localMenu = DEFAULT_MENU;
          if (storedMenu) {
            try {
              const parsed = JSON.parse(storedMenu);
              if (parsed && parsed.length > 0) {
                localMenu = parsed;
              }
            } catch (e) {}
          }
          setMenu(localMenu);
          localStorage.setItem('outpost_menu', JSON.stringify(localMenu));
          uploadMenuToFirebase(localMenu);
        }
      });

      // Subscribe to real-time Orders updates
      const unsubscribeOrders = subscribeToOrders((fbOrders) => {
        if (fbOrders && fbOrders.length > 0) {
          setOrders(fbOrders);
          localStorage.setItem('outpost_orders', JSON.stringify(fbOrders));
        } else {
          // Firestore orders collection is empty! Check if we have local orders to seed it.
          const storedOrders = localStorage.getItem('outpost_orders');
          if (storedOrders) {
            try {
              const parsed = JSON.parse(storedOrders);
              if (parsed && parsed.length > 0) {
                setOrders(parsed);
                uploadAllOrdersToFirebase(parsed);
                return;
              }
            } catch (e) {}
          }
          setOrders([]);
        }
      });

      return () => {
        unsubscribeMenu();
        unsubscribeOrders();
      };
    } else {
      // Fallback local storage load
      const storedMenu = localStorage.getItem('outpost_menu');
      if (storedMenu) {
        try {
          setMenu(JSON.parse(storedMenu));
        } catch (e) {
          setMenu(DEFAULT_MENU);
        }
      } else {
        setMenu(DEFAULT_MENU);
        localStorage.setItem('outpost_menu', JSON.stringify(DEFAULT_MENU));
      }

      const storedOrders = localStorage.getItem('outpost_orders');
      if (storedOrders) {
        try {
          setOrders(JSON.parse(storedOrders));
        } catch (e) {
          setOrders([]);
        }
      }
    }
  }, [firebaseTrigger]);

  // Sync menu state to storage
  const syncMenuToLocalStorage = (newMenu: MenuItem[]) => {
    setMenu(newMenu);
    localStorage.setItem('outpost_menu', JSON.stringify(newMenu));
    if (isFirebaseConnected()) {
      uploadMenuToFirebase(newMenu);
    }
  };

  // Sync orders state to storage
  const syncOrdersToLocalStorage = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('outpost_orders', JSON.stringify(newOrders));
    if (isFirebaseConnected()) {
      uploadAllOrdersToFirebase(newOrders);
    }
  };

  // 2. Cart Operations
  const handleSelectItem = (item: MenuItem) => {
    const existingCustomerName = cart.length > 0 ? (cart.find((c) => c.customerName)?.customerName || '') : '';
    
    if (existingCustomerName) {
      // Direct add to cart using existing customer name and default options to save time
      const defaultTemp = item.options?.temperatures && item.options.temperatures.length > 0
        ? item.options.temperatures[0]
        : undefined;
      const defaultSweet = item.options?.sweetness && item.options.sweetness.length > 0
        ? item.options.sweetness[0]
        : undefined;
      const defaultIce = item.options?.iceLevels && item.options.iceLevels.length > 0
        ? item.options.iceLevels[0]
        : undefined;
      
      const notes = '';
      const customId = `${item.id}_${notes}_${existingCustomerName}`;
      
      const customizedItem: CartItem = {
        id: customId,
        menuItem: item,
        quantity: 1,
        temperature: defaultTemp,
        sweetness: defaultSweet,
        iceLevel: defaultIce,
        selectedExtras: [],
        notes,
        customerName: existingCustomerName,
      };

      const existingMerge = cart.find((c) => c.id === customId);
      if (existingMerge) {
        setCart(cart.map((c) => c.id === customId ? { ...c, quantity: c.quantity + 1 } : c));
      } else {
        setCart([...cart, customizedItem]);
      }
    } else {
      // If no customer name is set yet, open the customization modal to ask for the name
      setActiveMenuItemForCustomization(item);
      setActiveCartItemForCustomization(null);
    }
  };

  const handleOpenCustomizerForEdit = (cartItem: CartItem) => {
    setActiveCartItemForCustomization(cartItem);
    setActiveMenuItemForCustomization(null);
  };

  const handleSaveCustomization = (
    menuItem: MenuItem,
    quantity: number,
    temperature?: 'Hot' | 'Ice',
    sweetness?: 'Normal' | 'Less Sweet' | 'Extra Sweet',
    iceLevel?: 'Normal' | 'Less Ice' | 'No Ice',
    selectedExtras: ExtraOption[] = [],
    notes: string = '',
    customerName: string = ''
  ) => {
    // Generate an incredibly unique ID combining item id, notes, and customer name
    const customId = `${menuItem.id}_${notes}_${customerName}`;

    // Create customized CartItem
    const customizedItem: CartItem = {
      id: customId,
      menuItem,
      quantity,
      temperature,
      sweetness,
      iceLevel,
      selectedExtras,
      notes,
      customerName,
    };

    if (activeCartItemForCustomization) {
      // Editing an existing cart item:
      const oldId = activeCartItemForCustomization.id;
      let newCart = [...cart];

      if (oldId === customId) {
        // Just updated details, keep slot
        newCart = newCart.map((c) => c.id === oldId ? customizedItem : c);
      } else {
        // Choices changed: remove old item, merge new one if already exists
        newCart = newCart.filter((c) => c.id !== oldId);
        const existingMerge = newCart.find((c) => c.id === customId);
        if (existingMerge) {
          newCart = newCart.map((c) => c.id === customId ? { ...c, quantity: c.quantity + quantity } : c);
        } else {
          newCart.push(customizedItem);
        }
      }
      setCart(newCart);
    } else {
      // Adding a fresh customized item
      const existingMerge = cart.find((c) => c.id === customId);
      if (existingMerge) {
        setCart(cart.map((c) => c.id === customId ? { ...c, quantity: c.quantity + quantity } : c));
      } else {
        setCart([...cart, customizedItem]);
      }
    }

    // Reset overlay triggers
    setActiveMenuItemForCustomization(null);
    setActiveCartItemForCustomization(null);
  };

  const handleIncrementQuantity = (id: string) => {
    setCart(cart.map((c) => c.id === id ? { ...c, quantity: c.quantity + 1 } : c));
  };

  const handleDecrementQuantity = (id: string) => {
    const item = cart.find((c) => c.id === id);
    if (item && item.quantity > 1) {
      setCart(cart.map((c) => c.id === id ? { ...c, quantity: c.quantity - 1 } : c));
    } else {
      handleRemoveItem(id);
    }
  };

  const handleRemoveItem = (id: string) => {
    setCart(cart.filter((c) => c.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
    setActiveDiscountAmount(0);
    setActiveDiscountLabel('');
  };

  // 3. Checkout flow
  const handleProceedToCheckout = (discount: number, label: string) => {
    setActiveDiscountAmount(discount);
    setActiveDiscountLabel(label);
    setIsCheckoutOpen(true);
  };

  const handleCompleteOrder = (checkoutDetails: {
    customerName: string;
    orderType: 'Dine-in' | 'Takeaway';
    tableNumber?: string;
    paymentMethod?: 'Cash' | 'QRIS' | 'Debit';
    amountPaid?: number;
    change?: number;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    status: 'Pending' | 'Completed';
    existingPendingOrderId?: string;
  }) => {
    if (checkoutDetails.existingPendingOrderId) {
      // Find and update the existing order
      const updatedOrders = orders.map((o) => {
        if (o.id === checkoutDetails.existingPendingOrderId) {
          return {
            ...o,
            customerName: checkoutDetails.customerName,
            orderType: checkoutDetails.orderType,
            tableNumber: checkoutDetails.tableNumber,
            paymentMethod: checkoutDetails.paymentMethod,
            amountPaid: checkoutDetails.amountPaid,
            change: checkoutDetails.change,
            status: 'Completed' as const, // Complete the order!
          };
        }
        return o;
      });
      syncOrdersToLocalStorage(updatedOrders);
      setIsCheckoutOpen(false);
      setPendingOrderForCheckout(null);

      // Open receipt modal automatically
      const updatedOrder = updatedOrders.find(o => o.id === checkoutDetails.existingPendingOrderId);
      if (updatedOrder) {
        setSelectedOrderForReceipt(updatedOrder);
        setIsReceiptOpen(true);
      }
    } else {
      // Generate order ID
      const count = orders.length + 1;
      const pad = String(count).padStart(4, '0');
      
      // Generate current formatted date for prefix, e.g. OUT-1001 or date-based
      const today = new Date();
      const yy = String(today.getFullYear()).slice(-2);
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      
      const generatedId = `OUT-${yy}${mm}${dd}-${pad}`;

      const newOrder: Order = {
        id: generatedId,
        items: [...cart],
        date: new Date().toISOString(),
        customerName: checkoutDetails.customerName,
        orderType: checkoutDetails.orderType,
        tableNumber: checkoutDetails.tableNumber,
        paymentMethod: checkoutDetails.paymentMethod,
        amountPaid: checkoutDetails.amountPaid,
        change: checkoutDetails.change,
        subtotal: checkoutDetails.subtotal,
        tax: checkoutDetails.tax,
        discount: checkoutDetails.discount,
        total: checkoutDetails.total,
        status: checkoutDetails.status,
      };

      // Append, Sync & Clear
      const updatedOrders = [...orders, newOrder];
      syncOrdersToLocalStorage(updatedOrders);
      setCart([]);
      setIsCheckoutOpen(false);

      if (checkoutDetails.status === 'Completed') {
        // Open receipt modal automatically
        setSelectedOrderForReceipt(newOrder);
        setIsReceiptOpen(true);
      } else {
        // Switch to Ruang Tunggu tab so they see it there
        setCurrentTab('waiting-room');
      }
    }
  };

  // 4. History logs Refund / Reprint
  const handleReprintOrder = (order: Order) => {
    setSelectedOrderForReceipt(order);
    setIsReceiptOpen(true);
  };

  const handleRefundOrder = (orderId: string) => {
    const updatedOrders = orders.map((o) =>
      o.id === orderId ? { ...o, status: 'Refunded' as const } : o
    );
    syncOrdersToLocalStorage(updatedOrders);
  };

  // 5. Menu Management Actions
  const handleAddMenuItem = (item: MenuItem) => {
    const updated = [...menu, item];
    syncMenuToLocalStorage(updated);
  };

  const handleUpdateMenuItem = (item: MenuItem) => {
    const updated = menu.map((m) => m.id === item.id ? item : m);
    syncMenuToLocalStorage(updated);
  };

  const handleDeleteMenuItem = (id: string) => {
    const updated = menu.filter((m) => m.id !== id);
    syncMenuToLocalStorage(updated);
  };

  const handleResetToDefaultMenu = () => {
    syncMenuToLocalStorage(DEFAULT_MENU);
  };

  const handleResetHistory = () => {
    showConfirm({
      title: 'Reset Riwayat Transaksi?',
      message: 'Apakah Anda yakin ingin menghapus semua riwayat transaksi? Daftar menu, antrean, dan isi keranjang Anda tidak akan ikut terhapus.',
      confirmText: 'Ya, Reset Riwayat',
      cancelText: 'Batal',
      variant: 'danger',
      onConfirm: () => {
        syncOrdersToLocalStorage([]);
      },
    });
  };

  const handleResetAllData = () => {
    showConfirm({
      title: 'Reset Semua Data?',
      message: 'Apakah Anda yakin ingin RESET semua data? Semua riwayat transaksi, antrean, isi keranjang, dan daftar menu akan dihapus & dikembalikan ke kondisi awal yang bersih.',
      confirmText: 'Ya, Reset',
      cancelText: 'Batal',
      variant: 'danger',
      onConfirm: () => {
        setCart([]);
        setOrders([]);
        setMenu(DEFAULT_MENU);
        localStorage.removeItem('outpost_menu');
        localStorage.removeItem('outpost_orders');
        localStorage.setItem('outpost_menu', JSON.stringify(DEFAULT_MENU));
        localStorage.setItem('outpost_orders', JSON.stringify([]));
        setCurrentTab('cashier');
      },
    });
  };

  return (
    <div className="min-h-screen bg-brand-cream-100 flex flex-col font-sans select-none antialiased">
      
      {/* Global Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeCartCount={cart.reduce((sum, c) => sum + c.quantity, 0)}
        pendingOrdersCount={orders.filter((o) => o.status === 'Pending').length}
        isDbConnected={isDbConnected}
        onOpenDbSync={() => setIsDbSyncModalOpen(true)}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col overflow-hidden max-h-[calc(100vh-80px)]">
        
        {currentTab === 'cashier' ? (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
            {/* Left Section: Catalog Grid */}
            <div className="flex-1 p-4 sm:p-6 bg-white overflow-hidden flex flex-col h-full border-r border-stone-200/50">
              <MenuGrid
                menu={menu}
                onSelectItem={handleSelectItem}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>

            {/* Right Section: Bill/Cart Panel - Responsive Overlay on mobile/tablet, Sidebar on desktop */}
            <div className={`
              fixed inset-0 z-45 bg-black/40 backdrop-blur-xs lg:static lg:bg-transparent lg:backdrop-blur-none
              transition-opacity duration-200 lg:transition-none
              ${isCartMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'}
            `} onClick={() => setIsCartMobileOpen(false)}>
              <div 
                className={`
                  absolute right-0 top-0 bottom-0 w-full max-w-md sm:max-w-lg lg:max-w-none lg:static h-full flex justify-end
                  transition-transform duration-200 lg:transition-none
                  ${isCartMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                `}
                onClick={(e) => e.stopPropagation()}
              >
                <CartPanel
                  cart={cart}
                  onIncrementQuantity={handleIncrementQuantity}
                  onDecrementQuantity={handleDecrementQuantity}
                  onRemoveItem={handleRemoveItem}
                  onClearCart={handleClearCart}
                  onCheckout={handleProceedToCheckout}
                  onOpenCustomizer={handleOpenCustomizerForEdit}
                  isMobile={true}
                  onCloseMobile={() => setIsCartMobileOpen(false)}
                />
              </div>
            </div>

            {/* Floating Mobile Cart Button */}
            {cart.length > 0 && (
              <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-3rem)] max-w-md">
                <button
                  onClick={() => setIsCartMobileOpen(true)}
                  className="w-full bg-brand-green-900 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl flex items-center justify-between hover:bg-brand-green-950 transition-all duration-150 active:scale-98 cursor-pointer border border-brand-green-800/10"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6.5 h-6.5 rounded-lg bg-white/20 flex items-center justify-center text-[11px] font-extrabold text-white">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                    <span className="text-sm font-bold tracking-wide">Keranjang Belanja</span>
                  </div>
                  <span className="text-sm font-extrabold font-mono">
                    {formatIDR(cart.reduce((sum, item) => sum + (item.menuItem.price + item.selectedExtras.reduce((s, e) => s + e.price, 0)) * item.quantity, 0))}
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Settings / Management tabs */
          <div className="flex-1 p-4 md:p-6 overflow-y-auto lg:overflow-hidden flex flex-col h-full">
            {currentTab === 'waiting-room' && (
              <WaitingRoomPanel
                orders={orders}
                onConfirmPayment={(order) => {
                  setPendingOrderForCheckout(order);
                  setIsCheckoutOpen(true);
                }}
                onCancelOrder={(orderId) => {
                  showConfirm({
                    title: 'Batalkan Pesanan?',
                    message: 'Apakah Anda yakin ingin membatalkan pesanan ini dari antrean?',
                    confirmText: 'Ya, Batalkan',
                    cancelText: 'Kembali',
                    variant: 'danger',
                    onConfirm: () => {
                      const updated = orders.filter((o) => o.id !== orderId);
                      syncOrdersToLocalStorage(updated);
                    }
                  });
                }}
                onPrintReceipt={(order) => {
                  setSelectedOrderForReceipt(order);
                  setIsReceiptOpen(true);
                }}
              />
            )}

            {currentTab === 'history' && (
              <HistoryPanel
                orders={orders}
                onReprint={handleReprintOrder}
                onRefund={handleRefundOrder}
                onResetAllData={handleResetHistory}
                onConfirmRequest={showConfirm}
              />
            )}
            
            {currentTab === 'menu-manager' && (
              <MenuManagerPanel
                menu={menu}
                onAddMenuItem={handleAddMenuItem}
                onUpdateMenuItem={handleUpdateMenuItem}
                onDeleteMenuItem={handleDeleteMenuItem}
                onResetToDefault={handleResetToDefaultMenu}
                onResetAllData={handleResetAllData}
                onConfirmRequest={showConfirm}
              />
            )}

            {currentTab === 'reports' && (
              <DashboardPanel orders={orders} />
            )}
          </div>
        )}

      </main>

      {/* --- OVERLAY MODALS --- */}
      
      {/* 1. Options Customization Modal */}
      {(activeMenuItemForCustomization || activeCartItemForCustomization) && (
        <CustomizerModal
          item={activeMenuItemForCustomization}
          existingCartItem={activeCartItemForCustomization}
          defaultCustomerName={cart.find((c) => c.customerName)?.customerName || ''}
          onClose={() => {
            setActiveMenuItemForCustomization(null);
            setActiveCartItemForCustomization(null);
          }}
          onSave={handleSaveCustomization}
        />
      )}

      {/* 2. Customer details & Payment checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          cart={cart}
          discountAmount={activeDiscountAmount}
          discountLabel={activeDiscountLabel}
          onClose={() => {
            setIsCheckoutOpen(false);
            setPendingOrderForCheckout(null);
          }}
          existingPendingOrder={pendingOrderForCheckout}
          onCompleteOrder={handleCompleteOrder}
        />
      )}

      {/* 3. Printed Thermal Receipt Visual Modal */}
      {isReceiptOpen && (
        <ReceiptModal
          order={selectedOrderForReceipt}
          onClose={() => {
            setIsReceiptOpen(false);
            setSelectedOrderForReceipt(null);
          }}
        />
      )}

      {/* 4. Global Custom Confirmation Modal */}
      {confirmConfig && (
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          variant={confirmConfig.variant}
          onConfirm={confirmConfig.onConfirm}
          onClose={() => setConfirmConfig(null)}
        />
      )}

      {/* 5. Database Connection and PWA Install Modal */}
      <DbSyncModal
        isOpen={isDbSyncModalOpen}
        onClose={() => setIsDbSyncModalOpen(false)}
        onConfigChanged={handleFirebaseConfigChanged}
        isInstallable={isInstallable}
        onInstall={handleInstallPwa}
      />

    </div>
  );
}
