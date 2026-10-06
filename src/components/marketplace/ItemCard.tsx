import React, { useState } from 'react';
import { LuxuryItem } from '../../data/items';
import { soundManager } from '../../utils/audio';
import { 
  Building2, Car, Bike, Gem, Ship, Eye, 
  Sparkles, CheckCircle2, TrendingUp,
  Key, Play, Rotate3D
} from 'lucide-react';

interface ItemCardProps {
  item: LuxuryItem;
  ownedCount: number;
  currency: 'USD' | 'VND';
  userBalanceUsd: number;
  onBuy: (item: LuxuryItem) => void;
  onSell: (item: LuxuryItem) => void;
  onInteract: (item: LuxuryItem) => void;
  onInspect3D: (item: LuxuryItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  ownedCount,
  currency,
  userBalanceUsd,
  onBuy,
  onSell,
  onInteract,
  onInspect3D,
}) => {
  const [imgSrc] = useState<string>(item.image);
  const [imgError, setImgError] = useState<boolean>(false);
  const canAfford = userBalanceUsd >= item.priceUsd;

  const formattedPriceVnd = (price: number) => {
    if (price >= 1000000000000) {
      return `${(price / 1000000000000).toFixed(1)} Triệu Tỷ ₫`;
    }
    if (price >= 1000000000) {
      return `${(price / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tỷ ₫`;
    }
    if (price >= 1000000) {
      return `${(price / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Triệu ₫`;
    }
    return `${price.toLocaleString('vi-VN')} ₫`;
  };

  const formattedPriceUsd = (price: number) => {
    if (price >= 1000000000) {
      return `$${(price / 1000000000).toFixed(2)}B`;
    }
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(2)}M`;
    }
    return `$${price.toLocaleString()}`;
  };

  const getCategoryIcon = () => {
    switch (item.category) {
      case 'real-estate': return <Building2 className="w-4 h-4 text-emerald-400" />;
      case 'supercars': return <Car className="w-4 h-4 text-cyan-400" />;
      case 'motorbikes': return <Bike className="w-4 h-4 text-amber-400" />;
      case 'jewelry-gold': return <Gem className="w-4 h-4 text-yellow-300" />;
      case 'aviation-marine': return <Ship className="w-4 h-4 text-blue-400" />;
    }
  };

  const getCategoryEmoji = () => {
    switch (item.category) {
      case 'real-estate': return '🏰';
      case 'supercars': return '🏎️';
      case 'motorbikes': return '🏍️';
      case 'jewelry-gold': return '💎';
      case 'aviation-marine': return '🛥️';
    }
  };

  const getInteractButtonText = () => {
    switch (item.interactiveType) {
      case 'car-drive': return 'Lái Thử Siêu Xe 3D';
      case 'bike-ride': return 'Chạy Thử Mô Tô 3D';
      case 'house-tour': return 'Đi Vào Tham Quan 3D';
      case 'jewelry-inspect': return 'Chiêm Ngưỡng & Đeo Thử';
      case 'yacht-cruise': return 'Lái Du Thuyền 3D';
      case 'jet-flight': return 'Lái Chuyên Cơ 3D';
    }
  };

  return (
    <div className="group relative flex flex-col rounded-3xl glass-card overflow-hidden transition-all duration-300 border border-slate-800 hover:border-amber-500/40 hover:shadow-2xl">
      
      {/* Image & Badges Container */}
      <div className="relative w-full h-56 overflow-hidden bg-slate-950 flex items-center justify-center">
        {!imgError ? (
          <img
            src={imgSrc}
            alt={item.name}
            onError={() => {
              setImgError(true);
            }}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-90 group-hover:brightness-100"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-[#182032] to-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-2">
            <span className="text-5xl drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">{getCategoryEmoji()}</span>
            <h4 className="text-sm font-black text-amber-300">{item.name}</h4>
            <span className="text-[10px] text-slate-400">{item.subCategory}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-transparent to-black/40 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-slate-200">
            {getCategoryIcon()}
            <span>{item.subCategory}</span>
          </div>

          {item.badge && (
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-extrabold shadow-lg">
              {item.badge}
            </div>
          )}
        </div>

        {/* Owned Counter Badge */}
        {ownedCount > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/90 text-black font-extrabold text-xs shadow-lg backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4" />
            <span>ĐÃ SỞ HỮU ({ownedCount})</span>
          </div>
        )}

        {/* Passive Rental Yield Badge */}
        {item.rentalIncomePerSec && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold backdrop-blur-md">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{((item.rentalIncomePerSec * 3600) / 1000000).toFixed(0)}M₫/h</span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Title & Description */}
        <div>
          <h3 className="text-base md:text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
            {item.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Specs Pill List */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
          {Object.entries(item.specs).slice(0, 4).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 truncate pr-1">{key}:</span>
              <span className="font-semibold text-slate-200 truncate">{val}</span>
            </div>
          ))}
        </div>

        {/* Dual Price Section */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Giá Niêm Yết:</span>
            <div className="text-lg md:text-xl font-black font-mono text-amber-400 tracking-tight">
              {currency === 'USD' ? formattedPriceUsd(item.priceUsd) : formattedPriceVnd(item.priceVnd)}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              ≈ {currency === 'USD' ? formattedPriceVnd(item.priceVnd) : formattedPriceUsd(item.priceUsd)}
            </div>
          </div>
        </div>

        {/* Action Buttons: 3D Studio Inspect + Simulator + Buy */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                onInspect3D(item);
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 hover:border-amber-400"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Ngắm 3D 360°</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onInteract(item);
              }}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-purple-500/20 hover:from-sky-500/30 hover:via-indigo-500/30 hover:to-purple-500/30 text-sky-300 border border-sky-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-sky-400 text-sky-400" />
              <span className="truncate">{getInteractButtonText()}</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onBuy(item)}
              disabled={!canAfford}
              className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-95 ${
                canAfford
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>{canAfford ? 'MUA NGAY' : 'CHƯA ĐỦ TIỀN'}</span>
            </button>

            {ownedCount > 0 && (
              <button
                onClick={() => onSell(item)}
                className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs transition-all active:scale-95"
                title="Bán lại thu hồi 100% tiền mặt"
              >
                Bán Lại
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
