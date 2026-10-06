import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  LUXURY_ITEMS, CATEGORIES, LuxuryItem, EXCHANGE_RATE_USD_VND 
} from './data/items';
import { soundManager } from './utils/audio';
import { Header } from './components/layout/Header';
import { ItemCard } from './components/marketplace/ItemCard';
import { DrivingSimulator3D } from './components/simulators/DrivingSimulator3D';
import { HouseTour3D } from './components/simulators/HouseTour3D';
import { JewelryInspector3D } from './components/simulators/JewelryInspector3D';
import { YachtJetSimulator3D } from './components/simulators/YachtJetSimulator3D';
import { Universal3DInspector } from './components/simulators/Universal3DInspector';
import { LuckyWheelModal } from './components/modals/LuckyWheelModal';
import { CashInjectionModal } from './components/modals/CashInjectionModal';
import { PortfolioModal } from './components/modals/PortfolioModal';
import { 
  Search, Sparkles, Building2, 
  Car, CheckCircle2, Eye
} from 'lucide-react';

export default function App() {
  // Financial & Inventory States
  const [balanceUsd, setBalanceUsd] = useState<number>(() => {
    const saved = localStorage.getItem('bt_balance_usd');
    return saved ? parseFloat(saved) : 50000000;
  });

  const [currency, setCurrency] = useState<'USD' | 'VND'>('VND');

  const [inventory, setInventory] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('bt_inventory');
    return saved ? JSON.parse(saved) : { 'bike-wave-alpha': 1 }; // Free starting Wave Alpha!
  });

  // UI States
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');

  // Modals & Simulator States
  const [activeSimulatorItem, setActiveSimulatorItem] = useState<LuxuryItem | null>(null);
  const [active3DInspectItem, setActive3DInspectItem] = useState<LuxuryItem | null>(null);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isWheelModalOpen, setIsWheelModalOpen] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'gold' } | null>(null);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('bt_balance_usd', balanceUsd.toString());
  }, [balanceUsd]);

  useEffect(() => {
    localStorage.setItem('bt_inventory', JSON.stringify(inventory));
  }, [inventory]);

  // Show Toast Helper
  const showToast = (message: string, type: 'success' | 'info' | 'gold' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Passive Rental Income Generator (Every 4 seconds)
  const totalPassiveIncomePerSec = useMemo(() => {
    return LUXURY_ITEMS.reduce((acc, item) => {
      const count = inventory[item.id] || 0;
      return acc + (item.rentalIncomePerSec || 0) * count;
    }, 0);
  }, [inventory]);

  useEffect(() => {
    if (totalPassiveIncomePerSec <= 0) return;
    const interval = setInterval(() => {
      const addedVnd = totalPassiveIncomePerSec * 4;
      const addedUsd = addedVnd / EXCHANGE_RATE_USD_VND;
      setBalanceUsd(prev => prev + addedUsd);
    }, 4000);
    return () => clearInterval(interval);
  }, [totalPassiveIncomePerSec]);

  // Total Portfolio Valuation
  const totalAssetValueUsd = useMemo(() => {
    return LUXURY_ITEMS.reduce((acc, item) => {
      const count = inventory[item.id] || 0;
      return acc + item.priceUsd * count;
    }, 0);
  }, [inventory]);

  const netWorthUsd = balanceUsd + totalAssetValueUsd;
  const totalInventoryCount = Object.values(inventory).reduce((a, b) => a + b, 0);

  // Buy Handler
  const handleBuyItem = (item: LuxuryItem) => {
    if (balanceUsd < item.priceUsd) {
      showToast('Số dư của bạn không đủ để mua món đồ này! Hãy bơm thêm tiền nhé.', 'info');
      setIsCashModalOpen(true);
      return;
    }

    setBalanceUsd(prev => prev - item.priceUsd);
    setInventory(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));

    soundManager.playBuySuccess();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    showToast(`🎉 Chúc mừng! Bạn đã sở hữu thành công "${item.name}"!`, 'gold');
  };

  // Sell Handler (Liquidate back to cash at 100% price)
  const handleSellItem = (item: LuxuryItem) => {
    const currentCount = inventory[item.id] || 0;
    if (currentCount <= 0) return;

    setBalanceUsd(prev => prev + item.priceUsd);
    setInventory(prev => {
      const next = { ...prev };
      if (next[item.id] > 1) {
        next[item.id] -= 1;
      } else {
        delete next[item.id];
      }
      return next;
    });

    soundManager.playSellSuccess();
    showToast(`💵 Đã thanh lý "${item.name}" và thu hồi ${currency === 'USD' ? `$${item.priceUsd.toLocaleString()}` : `${item.priceVnd.toLocaleString('vi-VN')} ₫`} tiền mặt!`, 'success');
  };

  // Reward from wheel / cash bonus
  const handleCashReward = (usdAmount: number) => {
    setBalanceUsd(prev => prev + usdAmount);
    showToast(`🎁 Đã cộng +$${usdAmount.toLocaleString()} (${(usdAmount * EXCHANGE_RATE_USD_VND).toLocaleString('vi-VN')}₫) vào tài khoản!`, 'gold');
  };

  // Filter & Search Items
  const filteredItems = useMemo(() => {
    return LUXURY_ITEMS.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subCategory.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.priceUsd - b.priceUsd;
      if (sortBy === 'price-desc') return b.priceUsd - a.priceUsd;
      return 0; // popular default
    });
  }, [activeCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      
      {/* 1. Header with Balances, Currency Switch & Actions */}
      <Header
        balanceUsd={balanceUsd}
        netWorthUsd={netWorthUsd}
        totalPassiveIncomePerSec={totalPassiveIncomePerSec}
        currency={currency}
        inventoryCount={totalInventoryCount}
        onToggleCurrency={() => setCurrency(prev => prev === 'USD' ? 'VND' : 'USD')}
        onOpenCashModal={() => setIsCashModalOpen(true)}
        onOpenWheelModal={() => setIsWheelModalOpen(true)}
        onOpenInventory={() => setIsPortfolioModalOpen(true)}
        onOpen3DShowroom={() => setActive3DInspectItem(LUXURY_ITEMS[0])}
      />

      {/* 2. Hero Luxury Banner Showcase */}
      <section className="relative overflow-hidden pt-8 pb-12 px-4 sm:px-6">
        {/* Background glow flares */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Text */}
          <div className="space-y-4 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>SÀN GIAO DỊCH XA XỈ PHẨM & TRẢI NGHIỆM 3D SỐ 1</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-luxury text-white tracking-tight leading-[1.15]">
              SỞ HỮU BIỆT THỰ, <br />
              <span className="text-gold-gradient">SIÊU XE & VÀNG BẠC</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
              Thỏa sức chiêm ngưỡng 3D 360°, mua sắm các căn Sky Villa Landmark 81, siêu xe Bugatti, Wave Alpha quốc dân, Vespa Dior, Patek Philippe và thỏi vàng SJC. 
              <strong> Đi vào tham quan nhà 3D, lái xe thực tế và thanh lý thu hồi tiền bất cứ lúc nào!</strong>
            </p>

            {/* Quick Hero CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActive3DInspectItem(LUXURY_ITEMS[7]); // Bugatti in 3D Studio
                }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>Chiêm Ngưỡng 3D Studio 360°</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveSimulatorItem(LUXURY_ITEMS[7]); // Drive Bugatti Chiron
                }}
                className="px-6 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold text-xs sm:text-sm flex items-center gap-2 backdrop-blur-md active:scale-95 transition-all"
              >
                <Car className="w-4 h-4 text-cyan-400" />
                <span>Lái Thử Siêu Xe 490 km/h</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveSimulatorItem(LUXURY_ITEMS[0]); // Tour Landmark 81
                }}
                className="px-6 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold text-xs sm:text-sm flex items-center gap-2 backdrop-blur-md active:scale-95 transition-all"
              >
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Tham Quan Landmark 81</span>
              </button>
            </div>
          </div>

          {/* Right Highlights Card / Stats */}
          <div className="w-full lg:w-auto grid grid-cols-2 gap-3 min-w-[300px]">
            <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
              <span className="text-2xl font-black font-mono text-amber-400">30+</span>
              <p className="text-xs text-slate-400">Tài sản xa hoa niêm yết</p>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
              <span className="text-2xl font-black font-mono text-emerald-400">100%</span>
              <p className="text-xs text-slate-400">Thanh khoản bán lại tức thì</p>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
              <span className="text-2xl font-black font-mono text-cyan-400">360° Studio</span>
              <p className="text-xs text-slate-400">Ngắm 3D mọi góc cạnh</p>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
              <span className="text-2xl font-black font-mono text-purple-400">USD & VNĐ</span>
              <p className="text-xs text-slate-400">Đa tiền tệ tỷ giá thực</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Filter & Category Selector Toolbar */}
      <section className="sticky top-[69px] z-30 bg-[#090b10]/95 backdrop-blur-md border-y border-slate-800/80 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Category Horizontal Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundManager.playClick();
                    setActiveCategory(cat.id);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/20'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-black/20 text-black' : 'bg-slate-800 text-slate-400'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Row */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm biệt thự, xe, vàng..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => {
                  soundManager.playClick();
                  setSortBy(e.target.value as any);
                }}
                aria-label="Sắp xếp danh sách"
                className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-bold text-slate-300 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="popular">Nổi Bật Nhất</option>
                <option value="price-asc">Giá: Thấp Đến Cao</option>
                <option value="price-desc">Giá: Cao Đến Thấp</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Luxury Marketplace Items Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {filteredItems.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <div className="text-5xl">🔍</div>
            <h3 className="text-lg font-bold text-white">Không tìm thấy món đồ phù hợp</h3>
            <p className="text-xs text-slate-400">Hãy thử tìm kiếm với từ khóa khác như: "Wave", "Rolls", "Landmark", "Vàng"...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                ownedCount={inventory[item.id] || 0}
                currency={currency}
                userBalanceUsd={balanceUsd}
                onBuy={handleBuyItem}
                onSell={handleSellItem}
                onInteract={(it) => setActiveSimulatorItem(it)}
                onInspect3D={(it) => setActive3DInspectItem(it)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 5. Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-4 sm:px-6 text-center text-xs text-slate-400 space-y-2">
        <p className="font-semibold text-slate-300">
          BILLIONAIRE TYCOON © 2026 • Nền Tảng Mô Phỏng Cuộc Sống Thượng Lưu & 3D Interactive Web App
        </p>
        <p>Hỗ trợ lái thử xe trơn tru, tham quan biệt thự ảo 3D, phòng trưng bày 360° Studio, giao dịch vàng bạc & bất động sản tỷ giá thực USD / VNĐ</p>
      </footer>

      {/* 6. Universal 3D Studio Inspector Overlay */}
      {active3DInspectItem && (
        <Universal3DInspector
          item={active3DInspectItem}
          currency={currency}
          userBalanceUsd={balanceUsd}
          onClose={() => setActive3DInspectItem(null)}
          onBuy={handleBuyItem}
          onLaunchSimulator={(item) => {
            setActive3DInspectItem(null);
            setActiveSimulatorItem(item);
          }}
        />
      )}

      {/* 7. Active 3D Simulator Full-Screen Overlay */}
      {activeSimulatorItem && (
        <>
          {(activeSimulatorItem.interactiveType === 'car-drive' || activeSimulatorItem.interactiveType === 'bike-ride') && (
            <DrivingSimulator3D
              item={activeSimulatorItem}
              currency={currency}
              onClose={() => setActiveSimulatorItem(null)}
            />
          )}

          {activeSimulatorItem.interactiveType === 'house-tour' && (
            <HouseTour3D
              item={activeSimulatorItem}
              currency={currency}
              onClose={() => setActiveSimulatorItem(null)}
            />
          )}

          {activeSimulatorItem.interactiveType === 'jewelry-inspect' && (
            <JewelryInspector3D
              item={activeSimulatorItem}
              currency={currency}
              onClose={() => setActiveSimulatorItem(null)}
            />
          )}

          {(activeSimulatorItem.interactiveType === 'yacht-cruise' || activeSimulatorItem.interactiveType === 'jet-flight') && (
            <YachtJetSimulator3D
              item={activeSimulatorItem}
              currency={currency}
              onClose={() => setActiveSimulatorItem(null)}
            />
          )}
        </>
      )}

      {/* 8. Modals */}
      {isCashModalOpen && (
        <CashInjectionModal
          currency={currency}
          onClose={() => setIsCashModalOpen(false)}
          onAddCash={(usd) => handleCashReward(usd)}
        />
      )}

      {isWheelModalOpen && (
        <LuckyWheelModal
          currency={currency}
          onClose={() => setIsWheelModalOpen(false)}
          onReward={(usd) => handleCashReward(usd)}
        />
      )}

      {isPortfolioModalOpen && (
        <PortfolioModal
          inventory={inventory}
          allItems={LUXURY_ITEMS}
          currency={currency}
          onClose={() => setIsPortfolioModalOpen(false)}
          onSell={handleSellItem}
          onInteract={(item) => setActiveSimulatorItem(item)}
          onInspect3D={(item) => setActive3DInspectItem(item)}
        />
      )}

      {/* 9. Toast Alert Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <div className={`px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 text-xs sm:text-sm font-bold ${
            toast.type === 'gold' 
              ? 'bg-amber-950/90 border-amber-500/80 text-amber-200' 
              : toast.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200' 
              : 'bg-slate-900/90 border-slate-700 text-slate-200'
          }`}>
            <CheckCircle2 className={`w-5 h-5 ${toast.type === 'gold' ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
