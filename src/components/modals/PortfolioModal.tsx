import React from 'react';
import { LuxuryItem, EXCHANGE_RATE_USD_VND } from '../../data/items';
import { soundManager } from '../../utils/audio';
import { 
  X, Briefcase, Play, DollarSign, Eye
} from 'lucide-react';

interface PortfolioModalProps {
  inventory: Record<string, number>;
  allItems: LuxuryItem[];
  currency: 'USD' | 'VND';
  onClose: () => void;
  onSell: (item: LuxuryItem) => void;
  onInteract: (item: LuxuryItem) => void;
  onInspect3D: (item: LuxuryItem) => void;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  inventory,
  allItems,
  currency,
  onClose,
  onSell,
  onInteract,
  onInspect3D,
}) => {
  const ownedItems = allItems.filter(item => (inventory[item.id] || 0) > 0);

  const totalAssetValueUsd = ownedItems.reduce((acc, item) => {
    return acc + item.priceUsd * (inventory[item.id] || 0);
  }, 0);

  const totalRentalIncomePerHour = ownedItems.reduce((acc, item) => {
    return acc + (item.rentalIncomePerSec || 0) * 3600 * (inventory[item.id] || 0);
  }, 0);

  const formatPrice = (usd: number) => {
    if (currency === 'USD') {
      if (usd >= 1000000000) return `$${(usd / 1000000000).toFixed(2)}B`;
      if (usd >= 1000000) return `$${(usd / 1000000).toFixed(2)}M`;
      return `$${usd.toLocaleString()}`;
    } else {
      const vnd = usd * EXCHANGE_RATE_USD_VND;
      if (vnd >= 1000000000000) return `${(vnd / 1000000000000).toFixed(1)} Triệu Tỷ ₫`;
      if (vnd >= 1000000000) return `${(vnd / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tỷ ₫`;
      return `${vnd.toLocaleString('vi-VN')} ₫`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#141b2d] to-[#090b10] border border-cyan-500/40 rounded-3xl p-6 md:p-8 text-slate-100 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Portfolio Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-black font-luxury text-cyan-400">
                DANH MỤC TÀI SẢN ĐANG SỞ HỮU
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Quản lý, ngắm nhìn 3D Studio, trải nghiệm thực tế hoặc thanh lý thu hồi tiền mặt
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex gap-3">
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Giá Trị Tài Sản</span>
              <span className="text-base font-black font-mono text-cyan-400">
                {formatPrice(totalAssetValueUsd)}
              </span>
            </div>

            {totalRentalIncomePerHour > 0 && (
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30">
                <span className="text-[10px] text-amber-300 uppercase font-semibold block">Dòng Tiền Thuê</span>
                <span className="text-base font-black font-mono text-emerald-400">
                  +{(totalRentalIncomePerHour / 1000000).toFixed(0)}M₫/h
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Assets List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {ownedItems.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="text-5xl">🛍️</div>
              <h4 className="text-base font-bold text-slate-300">Bạn chưa sở hữu tài sản nào!</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Hãy ghé qua sàn giao dịch để mua những căn biệt thự, siêu xe Bugatti, Vespa Dior hoặc thỏi vàng SJC đầu tiên của bạn!
              </p>
            </div>
          ) : (
            ownedItems.map((item) => {
              const count = inventory[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all"
                >
                  {/* Item Details */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{item.name}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                          x{count}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{item.subCategory} • {item.locationOrOrigin}</p>
                      <div className="text-xs font-mono font-bold text-amber-400 mt-1">
                        Giá: {formatPrice(item.priceUsd * count)}
                      </div>
                    </div>
                  </div>

                  {/* Actions: 3D Inspect + Simulator + Sell */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        onInspect3D(item);
                        onClose();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ngắm 3D Studio</span>
                    </button>

                    <button
                      onClick={() => {
                        soundManager.playClick();
                        onInteract(item);
                        onClose();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Trải Nghiệm</span>
                    </button>

                    <button
                      onClick={() => onSell(item)}
                      className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Bán</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
