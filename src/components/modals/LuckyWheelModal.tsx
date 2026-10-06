import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/audio';
import { X, Sparkles, Gift, Flame, Trophy, Coins } from 'lucide-react';
import { EXCHANGE_RATE_USD_VND } from '../../data/items';

interface LuckyWheelModalProps {
  onClose: () => void;
  onReward: (usdAmount: number, itemName?: string) => void;
  currency: 'USD' | 'VND';
}

const PRIZES = [
  { label: '10 TỶ VNĐ', usd: 400000, color: '#f59e0b', bg: '#78350f', icon: '💰' },
  { label: 'WAVE ALPHA ĐỎ', usd: 750, color: '#ef4444', bg: '#7f1d1d', icon: '🏍️' },
  { label: '50 TỶ VNĐ', usd: 2000000, color: '#38bdf8', bg: '#0c4a6e', icon: '💎' },
  { label: 'THỎI VÀNG 1KG SJC', usd: 92000, color: '#fbbf24', bg: '#78350f', icon: '🌟' },
  { label: '100 TỶ VNĐ (JACKPOT)', usd: 4000000, color: '#ec4899', bg: '#831843', icon: '👑' },
  { label: 'BUGATTI CHIRON', usd: 3800000, color: '#a855f7', bg: '#581c87', icon: '🏎️' },
  { label: '500 TỶ VNĐ', usd: 20000000, color: '#10b981', bg: '#064e3b', icon: '💸' },
  { label: '1 TRIỆU USD TIỀN TƯƠI', usd: 1000000, color: '#22c55e', bg: '#14532d', icon: '💵' },
];

export const LuckyWheelModal: React.FC<LuckyWheelModalProps> = ({ onClose, onReward, currency }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<typeof PRIZES[0] | null>(null);

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonPrize(null);
    soundManager.playClick();

    // Pick random prize index
    const randomIndex = Math.floor(Math.random() * PRIZES.length);
    const sliceAngle = 360 / PRIZES.length;
    // Calculate target rotation (at least 5 full spins = 1800 deg)
    const extraSpins = 5 * 360;
    const targetAngle = extraSpins + (360 - randomIndex * sliceAngle - sliceAngle / 2);

    setRotation(prev => prev + targetAngle);

    // Play ticking sound while spinning
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      soundManager.playWatchTick();
      tickCount++;
      if (tickCount > 25) clearInterval(tickInterval);
    }, 150);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      const selected = PRIZES[randomIndex];
      setWonPrize(selected);
      soundManager.playBuySuccess();

      // Confetti burst
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      onReward(selected.usd, selected.label);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#141b2d] to-[#090b10] border border-amber-500/40 rounded-3xl p-6 text-slate-100 shadow-2xl flex flex-col items-center">
        
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
        <div className="text-center space-y-1 mb-4">
          <div className="inline-flex p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-xl md:text-2xl font-black font-luxury text-amber-400">
            VÒNG QUAY TỶ PHÚ MAY MẮN
          </h3>
          <p className="text-xs text-slate-400">
            Quay ngay - 100% trúng siêu xe, vàng miếng hoặc tiền mặt khủng!
          </p>
        </div>

        {/* Wheel Graphic */}
        <div className="relative w-64 h-64 my-4 flex items-center justify-center">
          {/* Wheel Pointer */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]" />

          {/* Wheel Disc */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] relative overflow-hidden transition-all duration-[4500ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(
                #78350f 0deg 45deg,
                #7f1d1d 45deg 90deg,
                #0c4a6e 90deg 135deg,
                #78350f 135deg 180deg,
                #831843 180deg 225deg,
                #581c87 225deg 270deg,
                #064e3b 270deg 315deg,
                #14532d 315deg 360deg
              )`
            }}
          >
            {/* Prize Labels */}
            {PRIZES.map((prize, idx) => {
              const angle = idx * 45 + 22.5;
              return (
                <div
                  key={idx}
                  className="absolute top-0 left-1/2 -translate-x-1/2 origin-bottom h-32 flex flex-col items-center pt-2 text-center select-none"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <span className="text-sm">{prize.icon}</span>
                  <span className="text-[10px] font-extrabold text-white leading-tight drop-shadow px-1 max-w-[55px]">
                    {prize.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Center Hub */}
          <div className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-white shadow-xl flex items-center justify-center font-black text-xs text-black">
            💎
          </div>
        </div>

        {/* Won Prize Display */}
        {wonPrize && (
          <div className="w-full p-3 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-center animate-bounce mb-3">
            <span className="text-xs text-amber-300 font-bold">🎉 CHÚC MỪNG BẠN ĐÃ TRÚNG:</span>
            <p className="text-lg font-black text-white">{wonPrize.label}</p>
          </div>
        )}

        {/* Spin Action Button */}
        <button
          onClick={spinWheel}
          disabled={isSpinning}
          className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2 ${
            isSpinning
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-500 text-black shadow-amber-500/25 active:scale-95'
          }`}
        >
          <Sparkles className="w-5 h-5 fill-current" />
          <span>{isSpinning ? 'ĐANG QUAY...' : 'QUAY MIỄN PHÍ NGAY!'}</span>
        </button>
      </div>
    </div>
  );
};
