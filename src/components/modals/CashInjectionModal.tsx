import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/audio';
import { X, DollarSign, Sparkles, TrendingUp, Zap, CreditCard, Building2 } from 'lucide-react';
import { EXCHANGE_RATE_USD_VND } from '../../data/items';

interface CashInjectionModalProps {
  onClose: () => void;
  onAddCash: (usdAmount: number) => void;
  currency: 'USD' | 'VND';
}

const CASH_PRESETS = [
  { label: '💰 Nhận Thừa Kế 10 Tỷ', vnd: 10000000000, usd: 400000, desc: 'Khoản tiền khởi nghiệp đầu đời' },
  { label: '🎰 Trúng Vietlott 100 Tỷ', vnd: 100000000000, usd: 4000000, desc: 'Giải Jackpot Power 6/55' },
  { label: '🏆 Triệu Phú Đô La ($50M)', vnd: 1270000000000, usd: 50000000, desc: 'Tài phiệt sở hữu chuỗi bất động sản' },
  { label: '👑 Tỷ Phú Đô La ($1 Tỷ)', vnd: 25400000000000, usd: 1000000000, desc: 'Top 1% người giàu nhất hành tinh' },
  { label: '🚀 Elon Musk Mode ($100 Tỷ)', vnd: 2540000000000000, usd: 100000000000, desc: 'Tiền không bao giờ có thể tiêu hết!' },
];

export const CashInjectionModal: React.FC<CashInjectionModalProps> = ({ onClose, onAddCash, currency }) => {
  const [customAmount, setCustomAmount] = useState<string>('');

  const handlePresetSelect = (usd: number) => {
    soundManager.playBuySuccess();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.5 }
    });
    onAddCash(usd);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customAmount.replace(/,/g, ''));
    if (!isNaN(val) && val > 0) {
      const usdToAdd = currency === 'VND' ? val / EXCHANGE_RATE_USD_VND : val;
      soundManager.playBuySuccess();
      confetti({ particleCount: 100, spread: 70 });
      onAddCash(usdToAdd);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#161c2d] to-[#090b10] border border-amber-500/40 rounded-3xl p-6 md:p-8 text-slate-100 shadow-2xl space-y-6">
        
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

        {/* Title */}
        <div className="text-center space-y-1">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
            <CreditCard className="w-7 h-7" />
          </div>
          <h3 className="text-xl md:text-2xl font-black font-luxury text-amber-400">
            KHO TIỀN TỶ PHÚ & BƠM VỐN ĐẦU TƯ
          </h3>
          <p className="text-xs text-slate-400">
            Nạp thêm tiền mặt không giới hạn vào tài khoản để mua bất cứ thứ gì bạn thích!
          </p>
        </div>

        {/* Preset Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CASH_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetSelect(preset.usd)}
              className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-98 ${
                idx === 4 
                  ? 'sm:col-span-2 bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-yellow-500/20 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                  : 'bg-slate-900/80 hover:bg-slate-850 border-slate-700/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-sm text-white">{preset.label}</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xs text-slate-400">{preset.desc}</p>
              <div className="mt-2 text-xs font-mono font-bold text-emerald-400">
                +{currency === 'USD' ? `$${preset.usd.toLocaleString()}` : `${preset.vnd.toLocaleString('vi-VN')} ₫`}
              </div>
            </button>
          ))}
        </div>

        {/* Custom Amount Input Form */}
        <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-slate-800 space-y-3">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Hoặc nhập số tiền mong muốn ({currency}):</span>
            <span className="text-amber-400 font-mono">Tùy ý không giới hạn</span>
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder={`Ví dụ: 100000000 (${currency})`}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-sm transition-all shadow-lg active:scale-95"
            >
              Bơm Tiền
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
