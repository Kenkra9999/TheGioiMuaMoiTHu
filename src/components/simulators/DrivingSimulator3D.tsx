import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { LuxuryItem } from '../../data/items';
import { soundManager, VehicleAudioEngine } from '../../utils/audio';
import { CarGenerator, VehicleBuildResult } from '../../3d/vehicles/CarGenerator';
import { VehicleController } from '../../3d/controls/VehicleController';
import { EnvironmentGenerator, LightingTheme } from '../../3d/environment/EnvironmentGenerator';
import { 
  Volume2, VolumeX, Eye, Zap, Flame, 
  ArrowLeft, Compass, AlertCircle
} from 'lucide-react';

interface DrivingSimulator3DProps {
  item: LuxuryItem;
  onClose: () => void;
  currency: 'USD' | 'VND';
}

export const DrivingSimulator3D: React.FC<DrivingSimulator3DProps> = ({ item, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [speed, setSpeed] = useState(0);
  const [rpm, setRpm] = useState(1000);
  const [gear, setGear] = useState('1');
  const [nitro, setNitro] = useState(100);
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [cameraMode, setCameraMode] = useState<'chase' | 'cockpit' | 'top'>('chase');
  const [isMuted, setIsMuted] = useState(false);
  const [isHornActive, setIsHornActive] = useState(false);
  const [dayNight, setDayNight] = useState<LightingTheme>('night');

  const engineRef = useRef<VehicleAudioEngine | null>(null);
  const animFrameId = useRef<number | null>(null);
  const controllerRef = useRef<VehicleController | null>(null);

  const vehicleCfg = item.vehicleConfig || {
    topSpeed: 300,
    acceleration: 3.5,
    handling: 9.0,
    color: '#0284c7',
    bodyType: 'supercar',
    engineSound: 'supercar',
    nitroCapacity: 100
  };

  const isBike = item.category === 'motorbikes';

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const vehicleDataRef = useRef<VehicleBuildResult | null>(null);
  const sceneryGroupRef = useRef<THREE.Group | null>(null);
  const nitroParticlesRef = useRef<THREE.Points | null>(null);
  const tireSmokeParticlesRef = useRef<THREE.Points | null>(null);

  // Initialize Sound
  useEffect(() => {
    const engineSoundType = vehicleCfg.engineSound || (isBike ? 'wave' : 'supercar');
    engineRef.current = new VehicleAudioEngine(engineSoundType);
    if (!isMuted) {
      engineRef.current.start();
    }
    return () => {
      engineRef.current?.stop();
    };
  }, [isMuted, vehicleCfg.engineSound, isBike]);

  // Handle Horn
  const triggerHorn = useCallback(() => {
    setIsHornActive(true);
    const hornType = isBike ? (item.id.includes('wave') || item.id.includes('dream') ? 'wave' : 'scooter') : 'supercar';
    soundManager.playHorn(hornType);
    setTimeout(() => setIsHornActive(false), 350);
  }, [isBike, item.id]);

  // Three.js Scene Setup & Animation Loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const width = container.clientWidth || window.innerWidth || 1280;
    const height = container.clientHeight || window.innerHeight || 720;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const skyColors: Record<LightingTheme, number> = {
      night: 0x050814,
      sunset: 0x2b1020,
      day: 0x60a5fa,
      studio: 0x0f172a
    };
    const skyColor = skyColors[dayNight];
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.FogExp2(skyColor, 0.0035);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 3, -7);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height, true);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);
    container.focus();

    // 4. Omnidirectional Lighting Rig (Zero pitch-black underside spots)
    EnvironmentGenerator.setupLighting(scene, dayNight);

    // 5. Infinite Highway World Scenery
    const sceneryGroup = EnvironmentGenerator.buildDrivingWorld(dayNight);
    scene.add(sceneryGroup);
    sceneryGroupRef.current = sceneryGroup;

    // 6. Build High-Detail 3D Vehicle Model with steering & wheels
    const vehicleResult = CarGenerator.generateVehicle(item, vehicleCfg.color);
    vehicleDataRef.current = vehicleResult;
    scene.add(vehicleResult.root);

    // 7. Nitro Particle System
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      particlePositions[i] = 0;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.45,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const nitroParticles = new THREE.Points(particleGeo, particleMat);
    nitroParticlesRef.current = nitroParticles;
    vehicleResult.root.add(nitroParticles);
    nitroParticles.position.set(0, 0.45, -2.1);
    nitroParticles.visible = false;

    // 8. Tire Smoke System
    const smokeCount = 50;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePositions = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount * 3; i++) {
      smokePositions[i] = 0;
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0xd1d5db,
      size: 0.6,
      transparent: true,
      opacity: 0.6,
      blending: THREE.NormalBlending
    });
    const tireSmoke = new THREE.Points(smokeGeo, smokeMat);
    tireSmokeParticlesRef.current = tireSmoke;
    vehicleResult.root.add(tireSmoke);
    tireSmoke.position.set(0, 0.2, -1.8);
    tireSmoke.visible = false;

    // 9. Initialize Vehicle Physics Controller
    const controller = new VehicleController({
      topSpeed: vehicleCfg.topSpeed,
      acceleration: vehicleCfg.acceleration,
      handling: vehicleCfg.handling,
      nitroCapacity: vehicleCfg.nitroCapacity || 100,
      bodyType: vehicleCfg.bodyType,
      isBike
    });
    controllerRef.current = controller;

    // 10. Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, true);
      }
    };
    window.addEventListener('resize', handleResize);

    // 11. Main Physics & Render Loop
    let lastTime = performance.now();

    const animate = (time: number) => {
      animFrameId.current = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (controllerRef.current && vehicleDataRef.current) {
        controllerRef.current.update(delta, vehicleDataRef.current);
        const state = controllerRef.current.state;

        // Visual effects updates
        if (nitroParticlesRef.current) {
          nitroParticlesRef.current.visible = state.isNitro;
        }
        if (tireSmokeParticlesRef.current) {
          tireSmokeParticlesRef.current.visible = state.isDrifting || (state.isBraking && state.currentSpeed > 50);
        }

        // Scroll infinite highway
        if (sceneryGroupRef.current) {
          sceneryGroupRef.current.position.z = -(state.roadDistance % 100);
        }

        // Update Camera
        if (cameraRef.current) {
          controllerRef.current.updateCamera(cameraRef.current, vehicleDataRef.current.root, cameraMode, delta);
        }

        // Update audio engine
        if (!isMuted && engineRef.current) {
          const speedRatio = Math.abs(state.currentSpeed) / state.maxSpeed;
          engineRef.current.update(speedRatio, state.currentSpeed > 10 || state.isNitro);
        }

        // Sync React HUD state
        setSpeed(Math.max(0, Math.round(state.currentSpeed)));
        setRpm(state.rpm);
        setGear(state.gear);
        setNitro(Math.round(state.nitroAmount));
        setIsNitroActive(state.isNitro);
      }

      renderer.render(scene, camera);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      controllerRef.current?.dispose();
      renderer.dispose();
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [dayNight, isBike, isMuted, item, cameraMode]);

  // Touch / On-screen key simulator
  const sendKey = (key: string, isDown: boolean) => {
    controllerRef.current?.setKey(key, isDown);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090b10] select-none overflow-hidden animate-fadeIn" style={{ width: '100vw', height: '100vh' }}>
      {/* 3D Canvas Viewport */}
      <div 
        ref={containerRef} 
        tabIndex={0}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing outline-none" 
        style={{ width: '100vw', height: '100vh', position: 'absolute', inset: 0 }}
      />
        
      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-sm">Thoát Lái Thử</span>
          </button>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span>{item.name}</span>
              {item.badge && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {item.badge}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Tốc độ tối đa: {vehicleCfg.topSpeed} km/h • 0-100: {vehicleCfg.acceleration}s • Mã Lực: {item.specs['Công Suất'] || 'Khủng'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setDayNight(prev => prev === 'night' ? 'sunset' : prev === 'sunset' ? 'day' : 'night');
            }}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md transition-all cursor-pointer"
            title="Đổi thời gian / ánh sáng"
          >
            <Compass className="w-5 h-5 text-amber-400" />
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setCameraMode(prev => prev === 'chase' ? 'cockpit' : prev === 'cockpit' ? 'top' : 'chase');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md transition-all text-xs font-semibold cursor-pointer"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>{cameraMode === 'chase' ? 'Góc Nhìn Sau' : cameraMode === 'cockpit' ? 'Góc Lái FPV' : 'Toàn Cảnh'}</span>
          </button>

          <button
            onClick={() => {
              setIsMuted(!isMuted);
            }}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Dynamic HUD & Speedometer Display */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
        <div className="p-5 rounded-2xl glass-panel border border-slate-700/60 shadow-2xl backdrop-blur-xl flex items-center gap-6">
          <div className="relative flex flex-col items-center justify-center w-28 h-28 rounded-full border-4 border-slate-800 bg-slate-950/80">
            <span className={`text-4xl font-extrabold font-mono tracking-tighter ${speed > vehicleCfg.topSpeed * 0.8 ? 'text-amber-400 animate-pulse' : 'text-white'}`}>
              {speed}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">KM / H</span>
            
            <div className="absolute -bottom-2 px-2.5 py-0.5 rounded-md bg-amber-500 text-black font-extrabold text-xs shadow-md">
              GEAR {gear}
            </div>
          </div>

          <div className="space-y-3 min-w-[160px]">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>RPM</span>
                <span className={rpm > 7500 ? 'text-rose-400 font-bold' : 'text-slate-300'}>{rpm}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-75"
                  style={{ width: `${(rpm / 9500) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span className="flex items-center gap-1 text-cyan-400 font-bold">
                  <Zap className="w-3.5 h-3.5 fill-cyan-400" /> NITRO BOOST
                </span>
                <span className="text-cyan-300 font-bold">{nitro}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-75 ${isNitroActive ? 'bg-cyan-300 shadow-[0_0_12px_#00e5ff] animate-pulse' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
                  style={{ width: `${nitro}%` }}
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Phím W/S (Ga/Phanh) • A/D (Lái Trái/Phải) • Shift (Nitro) • H (Còi)</span>
            </div>
          </div>
        </div>
      </div>

      {/* On-Screen Mobile / Touch Controls Overlay */}
      <div className="absolute bottom-6 right-6 z-20 flex items-end gap-3 pointer-events-auto">
        <button
          onPointerDown={triggerHorn}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center border font-bold text-xs transition-all shadow-xl active:scale-90 cursor-pointer ${isHornActive ? 'bg-amber-500 text-black border-amber-300' : 'bg-slate-900/80 text-amber-400 border-slate-700/80'}`}
        >
          BÍP!
        </button>

        <button
          onPointerDown={() => sendKey('Shift', true)}
          onPointerUp={() => sendKey('Shift', false)}
          onPointerLeave={() => sendKey('Shift', false)}
          onPointerCancel={() => sendKey('Shift', false)}
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border transition-all shadow-xl active:scale-90 cursor-pointer ${isNitroActive ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_20px_#00e5ff]' : 'bg-slate-900/80 text-cyan-400 border-slate-700/80'}`}
        >
          <Zap className="w-5 h-5 fill-current" />
          <span className="text-[10px] font-bold">NITRO</span>
        </button>

        <button
          onPointerDown={() => sendKey('a', true)}
          onPointerUp={() => sendKey('a', false)}
          onPointerLeave={() => sendKey('a', false)}
          onPointerCancel={() => sendKey('a', false)}
          className="w-14 h-14 rounded-2xl bg-slate-900/80 hover:bg-slate-800 active:bg-amber-500 active:text-black text-slate-200 border border-slate-700/80 flex items-center justify-center font-bold text-lg shadow-xl cursor-pointer"
        >
          ◄
        </button>

        <button
          onPointerDown={() => sendKey('d', true)}
          onPointerUp={() => sendKey('d', false)}
          onPointerLeave={() => sendKey('d', false)}
          onPointerCancel={() => sendKey('d', false)}
          className="w-14 h-14 rounded-2xl bg-slate-900/80 hover:bg-slate-800 active:bg-amber-500 active:text-black text-slate-200 border border-slate-700/80 flex items-center justify-center font-bold text-lg shadow-xl cursor-pointer"
        >
          ►
        </button>

        <button
          onPointerDown={() => sendKey('s', true)}
          onPointerUp={() => sendKey('s', false)}
          onPointerLeave={() => sendKey('s', false)}
          onPointerCancel={() => sendKey('s', false)}
          className="w-14 h-16 rounded-2xl bg-rose-950/80 hover:bg-rose-900 active:bg-rose-600 text-rose-200 border border-rose-700/80 flex flex-col items-center justify-center font-bold text-xs shadow-xl active:scale-95 cursor-pointer"
        >
          <span>PHANH</span>
        </button>

        <button
          onPointerDown={() => sendKey('w', true)}
          onPointerUp={() => sendKey('w', false)}
          onPointerLeave={() => sendKey('w', false)}
          onPointerCancel={() => sendKey('w', false)}
          className="w-16 h-20 rounded-2xl bg-gradient-to-t from-emerald-600 to-teal-500 text-black font-extrabold border border-emerald-400 flex flex-col items-center justify-center shadow-2xl active:scale-95 text-xs cursor-pointer"
        >
          <Flame className="w-5 h-5 fill-black" />
          <span>ĐẠP GA</span>
        </button>
      </div>
    </div>
  );
};
