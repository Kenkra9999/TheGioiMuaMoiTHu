// Web Audio API Sound Synthesizer for Billionaire Life Simulator
// 100% Client-side synthesized audio with Zero latency

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const soundManager = {
  // Cash register / purchase sound effect (Cha-ching!)
  playBuySuccess() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Bell chime
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);

    // Secondary coin shower
    setTimeout(() => {
      if (!ctx) return;
      const coinTime = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const cOsc = ctx.createOscillator();
        const cGain = ctx.createGain();
        cOsc.type = 'sine';
        cOsc.frequency.setValueAtTime(2000 + i * 400, coinTime + i * 0.06);
        cGain.gain.setValueAtTime(0.2, coinTime + i * 0.06);
        cGain.gain.exponentialRampToValueAtTime(0.001, coinTime + i * 0.06 + 0.25);
        cOsc.connect(cGain);
        cGain.connect(ctx.destination);
        cOsc.start(coinTime + i * 0.06);
        cOsc.stop(coinTime + i * 0.06 + 0.25);
      }
    }, 50);
  },

  // Sell sound (Crisp metallic coins collected)
  playSellSuccess() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.25);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  },

  // UI Button Click (Crisp luxury glass haptic)
  playClick() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  },

  // Jewelry Sparkle / Crystal Chime
  playSparkle() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [2400, 3200, 4800, 6000];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.1, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.4);
    });
  },

  // Watch Tick
  playWatchTick() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2200, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.015);
  },

  // Vehicle Horn
  playHorn(type: 'wave' | 'supercar' | 'luxury' | 'scooter' | 'bike' = 'supercar') {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'wave' || type === 'scooter') {
      // Classic motorbike beep beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'supercar' || type === 'bike') {
      // Dual tone Euro horn
      [420, 520].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      });
    } else {
      // Luxury deep acoustic horn
      [310, 370].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
      });
    }
  },

  // Nitro Boost whoosh
  playNitro() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.3);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  },

  // Door Open / Room Entrance
  playDoorOpen() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  },

  // Footstep for house tour
  playFootstep() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }
};

// Continuous Engine Synthesizer for Driving Simulator
export class VehicleAudioEngine {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isRunning: boolean = false;
  private vehicleType: string = 'supercar';

  constructor(vehicleType: string = 'supercar') {
    this.vehicleType = vehicleType;
  }

  start() {
    if (this.isRunning) return;
    this.ctx = getAudioContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.08, now);

    this.osc1 = this.ctx.createOscillator();
    this.osc2 = this.ctx.createOscillator();
    this.subOsc = this.ctx.createOscillator();

    if (this.vehicleType.includes('wave') || this.vehicleType.includes('cub')) {
      // Sputtering 110cc single cylinder
      this.osc1.type = 'sawtooth';
      this.osc2.type = 'square';
      this.subOsc.type = 'triangle';
      this.osc1.frequency.setValueAtTime(55, now);
      this.osc2.frequency.setValueAtTime(110, now);
      this.subOsc.frequency.setValueAtTime(27.5, now);
    } else if (this.vehicleType.includes('sh') || this.vehicleType.includes('scooter') || this.vehicleType.includes('exciter')) {
      // High-rev scooter / 150cc engine
      this.osc1.type = 'sawtooth';
      this.osc2.type = 'triangle';
      this.subOsc.type = 'sine';
      this.osc1.frequency.setValueAtTime(70, now);
      this.osc2.frequency.setValueAtTime(140, now);
      this.subOsc.frequency.setValueAtTime(35, now);
    } else if (this.vehicleType.includes('ducati') || this.vehicleType.includes('ninja') || this.vehicleType.includes('s1000rr')) {
      // Screaming Superbike V4 / Inline 4
      this.osc1.type = 'sawtooth';
      this.osc2.type = 'sawtooth';
      this.subOsc.type = 'triangle';
      this.osc1.frequency.setValueAtTime(90, now);
      this.osc2.frequency.setValueAtTime(180, now);
      this.subOsc.frequency.setValueAtTime(45, now);
    } else if (this.vehicleType.includes('cybertruck') || this.vehicleType.includes('electric')) {
      // EV hum
      this.osc1.type = 'sine';
      this.osc2.type = 'triangle';
      this.subOsc.type = 'sine';
      this.osc1.frequency.setValueAtTime(120, now);
      this.osc2.frequency.setValueAtTime(240, now);
      this.subOsc.frequency.setValueAtTime(60, now);
    } else {
      // V12 / W16 Roaring Supercar (Bugatti, Lambo, Ferrari, Rolls)
      this.osc1.type = 'sawtooth';
      this.osc2.type = 'triangle';
      this.subOsc.type = 'square';
      this.osc1.frequency.setValueAtTime(65, now);
      this.osc2.frequency.setValueAtTime(130, now);
      this.subOsc.frequency.setValueAtTime(32.5, now);
    }

    this.osc1.connect(this.gainNode);
    this.osc2.connect(this.gainNode);
    this.subOsc.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    this.osc1.start(now);
    this.osc2.start(now);
    this.subOsc.start(now);

    this.isRunning = true;
  }

  update(speedRatio: number, isAccelerating: boolean) {
    if (!this.isRunning || !this.ctx || !this.osc1 || !this.osc2 || !this.gainNode) return;
    const now = this.ctx.currentTime;

    const baseFreq = this.vehicleType.includes('ducati') || this.vehicleType.includes('ninja') ? 110 :
                     this.vehicleType.includes('wave') ? 60 : 70;
    const maxFreq = this.vehicleType.includes('ducati') || this.vehicleType.includes('ninja') ? 580 :
                    this.vehicleType.includes('wave') ? 260 : 420;

    const targetFreq = baseFreq + (maxFreq - baseFreq) * Math.min(speedRatio, 1);

    this.osc1.frequency.setTargetAtTime(targetFreq, now, 0.08);
    this.osc2.frequency.setTargetAtTime(targetFreq * 2, now, 0.08);

    const targetVolume = isAccelerating ? 0.14 : 0.06 + speedRatio * 0.06;
    this.gainNode.gain.setTargetAtTime(targetVolume, now, 0.05);
  }

  stop() {
    if (!this.isRunning) return;
    try {
      this.osc1?.stop();
      this.osc2?.stop();
      this.subOsc?.stop();
      this.osc1?.disconnect();
      this.osc2?.disconnect();
      this.subOsc?.disconnect();
      this.gainNode?.disconnect();
    } catch {
      // ignore
    }
    this.isRunning = false;
  }
}
