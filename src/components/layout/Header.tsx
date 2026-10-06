import React from 'react';
import { soundManager } from '../../utils/audio';
import { 
  Sparkles, Wallet, Plus, Trophy, Briefcase, 
  RefreshCw, Crown, Eye
} from 'lucide-react';
import { EXCHANGE_RATE_USD_VND } from '../../data/items';

interface HeaderProps {
  balanceUsd: number;
  netWorthUsd: number;
  totalPassiveIncomePerSec: number;
  currency: 'USD' | 'VND';
  inventoryCount: number;
  onToggleCurrency: () => void;
  onOpenCashModal: () => void;
  onOpenWheelModal: () => void;
  onOpenInventory: () => void;
  onOpen3DShowroom: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  balanceUsd,
  netWorthUsd,
  totalPassiveIncomePerSec,
  currency,
  inventoryCount,
  onToggleCurrency,
  onOpenCashModal,
  onOpenWheelModal,
  onOpenInventory,
  onOpen3DShowroom,
}) => {
  const balanceVnd = balanceUsd * EXCHANGE_RATE_USD_VND;
  const netWorthVnd = netWorthUsd * EXCHANGE_RATE_USD_VND;

  const formatMoney = (val: number, curr: 'USD' | 'VND') => {
    if (curr === 'USD') {
      if (val >= 1000000000) return `$${(val / 1000000000).toFixed(2)} Tỷ`;
      if (val >= 1000000) return `$${(val / 1000000).toFixed(2)} Tr`;
      return `$${Math.round(val).toLocaleString()}`;
    } else {
      if (val >= 1000000000000) return `${(val / 1000000000000).toFixed(2)} Triệu Tỷ ₫`;
      if (val >= 1000000000) return `${(val / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tỷ ₫`;
      if (val >= 1000000) return `${(val / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tr ₫`;
      return `${Math.round(val).toLocaleString('vi-VN')} ₫`;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Slogan */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-black font-black text-xl shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              👑
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black font-luxury tracking-wider text-gold-gradient leading-none">
                BILLIONAIRE TYCOON
              </h1>
              <p className="text-[10px] text-slate-400 tracking-widest uppercase font-medium">
                Đế Chế Thượng Lưu • Mua & Trải Nghiệm Mọi Thứ
              </p>
            </div>
          </div>

          {/* Mobile Net Worth Badge */}
          <div className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>{formatMoney(currency === 'USD' ? netWorthUsd : netWorthVnd, currency)}</span>
          </div>
        </div>

        {/* Wealth Balances & Dual Currency Box */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
          
          {/* Liquid Cash Box */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-inner">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <span>Số Dư Tiền Mặt</span>
                {totalPassiveIncomePerSec > 0 && (
                  <span className="text-emerald-400 font-bold font-mono animate-pulse">
                    (+{((totalPassiveIncomePerSec * 3600) / 1000000).toFixed(0)}M/h)
                  </span>
                )}
              </div>
              <div className="text-base sm:text-lg font-black font-mono text-emerald-400 tracking-tight leading-tight">
                {currency === 'USD' ? formatMoney(balanceUsd, 'USD') : formatMoney(balanceVnd, 'VND')}
              </div>
            </div>

            {/* Quick Toggle USD / VND */}
            <button
              onClick={() => {
                soundManager.playClick();
                onToggleCurrency();
              }}
              className="ml-2 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 text-xs font-bold font-mono flex items-center gap-1 transition-all"
              title="Chuyển đổi USD / VND"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{currency === 'USD' ? 'USD ($)' : 'VNĐ (₫)'}</span>
            </button>
          </div>

          {/* Total Net Worth Box (Desktop) */}
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/90 border border-amber-500/30">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-amber-300 uppercase font-semibold">
                Tổng Tài Sản (Net Worth)
              </div>
              <div className="text-base font-black font-mono text-amber-400 leading-tight">
                {currency === 'USD' ? formatMoney(netWorthUsd, 'USD') : formatMoney(netWorthVnd, 'VND')}
              </div>
            </div>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex items-center gap-2">
            
            {/* 3D Showroom Studio Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpen3DShowroom();
              }}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:to-indigo-500/30 text-sky-300 border border-sky-500/40 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
            >
              <Eye className="w-4 h-4 text-sky-400" />
              <span>Phòng 3D</span>
            </button>

            {/* Add Cash / Inject Wealth Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenCashModal();
              }}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Bơm Tiền</span>
            </button>

            {/* Lucky Wheel Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenWheelModal();
              }}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
            >
              <Trophy className="w-4 h-4 text-yellow-300" />
              <span className="hidden sm:inline">Vòng Quay</span>
            </button>

            {/* My Portfolio / Assets Drawer Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenInventory();
              }}
              className="relative px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Tài Sản</span>
              {inventoryCount > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-cyan-500 text-black font-extrabold text-[10px]">
                  {inventoryCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
