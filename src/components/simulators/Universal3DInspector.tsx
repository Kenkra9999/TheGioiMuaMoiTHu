import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { LuxuryItem } from '../../data/items';
import { soundManager } from '../../utils/audio';
import { HouseGenerator } from '../../3d/houses/HouseGenerator';
import { CarGenerator } from '../../3d/vehicles/CarGenerator';
import { materialLib } from '../../3d/materials/MaterialLibrary';
import { 
  ArrowLeft, RotateCw, 
  Layers, Play, Key, Info, Home, Sparkles
} from 'lucide-react';

interface Universal3DInspectorProps {
  item: LuxuryItem;
  currency: 'USD' | 'VND';
  userBalanceUsd: number;
  onClose: () => void;
  onBuy: (item: LuxuryItem) => void;
  onLaunchSimulator: (item: LuxuryItem) => void;
}

type StudioLightingPreset = 'royal-gold' | 'neon-cyber' | 'golden-sunset' | 'diamond-crystal' | 'studio-white';

const COLOR_PRESETS = [
  { name: 'Mặc Định', hex: null },
  { name: 'Đỏ Ruby Metallic', hex: '#dc2626' },
  { name: 'Vàng Hoàng Gia 24K', hex: '#f59e0b' },
  { name: 'Xanh Cyber Cyan', hex: '#06b6d4' },
  { name: 'Trắng Ngọc Trai Pearl', hex: '#f8fafc' },
  { name: 'Ngọc Lục Bảo Emerald', hex: '#059669' },
  { name: 'Vàng Hồng Rose Gold', hex: '#fb7185' },
  { name: 'Xanh Navy Luxury', hex: '#1d4ed8' },
];

// Multi-Directional High Clarity Studio Lighting Setup (Zero dark spots)
function setupStudioLighting(scene: THREE.Scene, preset: StudioLightingPreset) {
  const isStudioWhite = preset === 'studio-white';

  // 1. Omnidirectional Hemisphere Light
  const hemi = new THREE.HemisphereLight(
    isStudioWhite ? 0xffffff : 0xe0f2fe,
    isStudioWhite ? 0x94a3b8 : 0x1e293b,
    isStudioWhite ? 3.0 : 2.5
  );
  scene.add(hemi);

  // 2. Ambient Light
  const amb = new THREE.AmbientLight(0xffffff, 1.8);
  scene.add(amb);

  if (preset === 'royal-gold') {
    const key = new THREE.DirectionalLight(0xffedd5, 3.8);
    key.position.set(16, 26, 20);
    key.castShadow = true;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xd97706, 2.4);
    fill.position.set(-16, 16, -20);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xf59e0b, 2.2);
    rim.position.set(0, 18, -25);
    scene.add(rim);

  } else if (preset === 'neon-cyber') {
    const key = new THREE.DirectionalLight(0x38bdf8, 3.6);
    key.position.set(16, 24, 20);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xec4899, 3.0);
    fill.position.set(-16, 18, -20);
    scene.add(fill);

    const cyanRim = new THREE.DirectionalLight(0x06b6d4, 2.5);
    cyanRim.position.set(0, 15, -25);
    scene.add(cyanRim);

  } else if (preset === 'golden-sunset') {
    const sun = new THREE.DirectionalLight(0xf97316, 4.2);
    sun.position.set(24, 18, 16);
    sun.castShadow = true;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xa855f7, 2.4);
    fill.position.set(-16, 14, -16);
    scene.add(fill);

  } else if (preset === 'diamond-crystal') {
    [
      [14, 18, 14, 0x38bdf8],
      [-14, 18, -14, 0xc084fc],
      [14, 12, -14, 0xf472b6],
      [-14, 12, 14, 0xfacc15]
    ].forEach(([x, y, z, col]) => {
      const spot = new THREE.SpotLight(col as number, 4.5, 60, Math.PI / 4, 0.25);
      spot.position.set(x as number, y as number, z as number);
      scene.add(spot);
    });

  } else {
    // Pure White Studio
    const key = new THREE.DirectionalLight(0xffffff, 4.2);
    key.position.set(16, 28, 20);
    key.castShadow = true;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xf1f5f9, 3.2);
    fill.position.set(-16, 18, -20);
    scene.add(fill);

    const bottomLight = new THREE.DirectionalLight(0xffffff, 2.5);
    bottomLight.position.set(0, -15, 0);
    scene.add(bottomLight);
  }
}

// Studio Pedestal / Showroom Floor
function setupStudioFloor(scene: THREE.Scene, preset: StudioLightingPreset, isRealEstate: boolean) {
  const isWhite = preset === 'studio-white';
  const floorRadius = isRealEstate ? 32 : 18;
  const floorGeo = new THREE.CylinderGeometry(floorRadius, floorRadius, 0.4, 64);
  const floorMat = new THREE.MeshStandardMaterial({
    color: isWhite ? 0xffffff : isRealEstate ? 0x1e293b : 0x111827,
    roughness: 0.15,
    metalness: isWhite ? 0.05 : 0.85,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = isRealEstate ? -0.2 : -1.8;
  floor.receiveShadow = true;
  scene.add(floor);

  // Glowing Pedestal Ring
  const ringGeo = new THREE.TorusGeometry(floorRadius + 0.05, 0.1, 16, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: preset === 'neon-cyber' ? 0x06b6d4 : preset === 'golden-sunset' ? 0xf97316 : 0xf59e0b
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = isRealEstate ? 0 : -1.6;
  scene.add(ring);
}

// Universal 3D Model Builder with High Architectural & Mechanical Details
function buildUniversal3DModel(
  group: THREE.Group, 
  item: LuxuryItem, 
  customColor: string | null, 
  _openParts: boolean,
  animParts: THREE.Object3D[]
) {
  if (item.category === 'real-estate') {
    // Build architectural grade estate using HouseGenerator
    const houseModel = HouseGenerator.generateHouse(item.id);
    group.add(houseModel);

  } else if (item.category === 'supercars' || item.category === 'motorbikes') {
    // Build high-detail vehicle using CarGenerator
    const vehicleResult = CarGenerator.generateVehicle(item, customColor || undefined);
    group.add(vehicleResult.root);

  } else if (item.category === 'jewelry-gold') {
    const isGoldBar = item.id.includes('gold-1kg');
    const isWatch = item.jewelryConfig?.type === 'watch';

    if (isGoldBar) {
      const barGeo = new THREE.BoxGeometry(3.2, 0.7, 1.8);
      const goldMat = materialLib.getMetalMaterial('gold');
      const bar = new THREE.Mesh(barGeo, goldMat);
      bar.castShadow = true;
      group.add(bar);

      const seal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32), 
        materialLib.getMetalMaterial('gold')
      );
      seal.position.set(0, 0.36, 0);
      group.add(seal);

    } else if (isWatch) {
      const caseMat = materialLib.getMetalMaterial('gold');
      const watchCase = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.35, 48), caseMat);
      watchCase.rotation.x = Math.PI / 2;
      watchCase.castShadow = true;
      group.add(watchCase);

      const dial = new THREE.Mesh(
        new THREE.CircleGeometry(1.0, 48), 
        new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.8, roughness: 0.2 })
      );
      dial.position.z = 0.18;
      group.add(dial);

      const tourbillon = new THREE.Mesh(
        new THREE.RingGeometry(0.18, 0.35, 24), 
        materialLib.getMetalMaterial('gold')
      );
      tourbillon.name = 'tourbillon';
      tourbillon.position.set(0, -0.4, 0.19);
      group.add(tourbillon);
      animParts.push(tourbillon);

      [-1.8, 1.8].forEach(sy => {
        const strap = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 1.4, 0.18), 
          materialLib.getWoodMaterial('walnut')
        );
        strap.position.set(0, sy, 0);
        group.add(strap);
      });

    } else {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.1, 0.14, 24, 64), 
        materialLib.getMetalMaterial('chrome')
      );
      ring.castShadow = true;
      group.add(ring);

      const gem = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.65, 2), 
        new THREE.MeshStandardMaterial({
          color: item.id.includes('pink') ? 0xf472b6 : item.id.includes('panthere') ? 0x10b981 : 0x38bdf8,
          metalness: 0.2,
          roughness: 0.02,
          transparent: true,
          opacity: 0.9
        })
      );
      gem.position.set(0, 1.25, 0);
      group.add(gem);
    }

  } else if (item.category === 'aviation-marine') {
    const isJet = item.id.includes('gulfstream');

    if (isJet) {
      const jetMat = materialLib.getStuccoMaterial(0xffffff);
      const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 7.5, 32), jetMat);
      fuselage.rotation.x = Math.PI / 2;
      fuselage.castShadow = true;
      group.add(fuselage);

      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.0, 32), jetMat);
      nose.rotation.x = -Math.PI / 2;
      nose.position.z = 4.75;
      group.add(nose);

      const wings = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.08, 2.2), jetMat);
      wings.position.set(0, 0, 0.2);
      group.add(wings);

      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 1.4), jetMat);
      tail.position.set(0, 1.1, -3.2);
      group.add(tail);

    } else {
      const hullMat = materialLib.getMetalMaterial('gold');
      const hull = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.4, 9.5), hullMat);
      hull.castShadow = true;
      group.add(hull);

      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1.1, 5.0), 
        materialLib.getGlassMaterial(0x0284c7, 0.85)
      );
      cabin.position.set(0, 1.0, -0.5);
      group.add(cabin);

      const rotor = new THREE.Mesh(
        new THREE.BoxGeometry(3.0, 0.04, 0.2), 
        materialLib.getMetalMaterial('steel')
      );
      rotor.name = 'rotor';
      rotor.position.set(0, 1.2, -3.5);
      group.add(rotor);
      animParts.push(rotor);
    }
  }
}

export const Universal3DInspector: React.FC<Universal3DInspectorProps> = ({
  item,
  currency,
  userBalanceUsd,
  onClose,
  onBuy,
  onLaunchSimulator,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightingPreset, setLightingPreset] = useState<StudioLightingPreset>('royal-gold');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isOpenParts, setIsOpenParts] = useState(false);
  const [showSpecsModal, setShowSpecsModal] = useState(false);

  const animFrameId = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rootObjectGroupRef = useRef<THREE.Group | null>(null);
  const animatedPartsRef = useRef<THREE.Object3D[]>([]);

  // Orbital Camera control state
  const orbitState = useRef({
    isDown: false,
    prevX: 0,
    prevY: 0,
    rotX: 0.32,
    rotY: 0.55,
    distance: 12.0,
    targetDistance: 12.0,
  });

  const canAfford = userBalanceUsd >= item.priceUsd;

  const formattedPrice = (usd: number, vnd: number) => {
    if (currency === 'USD') {
      if (usd >= 1000000000) return `$${(usd / 1000000000).toFixed(2)}B`;
      if (usd >= 1000000) return `$${(usd / 1000000).toFixed(2)}M`;
      return `$${usd.toLocaleString()}`;
    } else {
      if (vnd >= 1000000000000) return `${(vnd / 1000000000000).toFixed(1)} Triệu Tỷ ₫`;
      if (vnd >= 1000000000) return `${(vnd / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tỷ ₫`;
      if (vnd >= 1000000) return `${(vnd / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Triệu ₫`;
      return `${vnd.toLocaleString('vi-VN')} ₫`;
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const width = container.clientWidth || window.innerWidth || 1280;
    const height = container.clientHeight || window.innerHeight || 720;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const bgColors: Record<StudioLightingPreset, number> = {
      'royal-gold': 0x0c101c,
      'neon-cyber': 0x080816,
      'golden-sunset': 0x22131c,
      'diamond-crystal': 0x0c1626,
      'studio-white': 0xf8fafc,
    };
    scene.background = new THREE.Color(bgColors[lightingPreset]);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 300);
    cameraRef.current = camera;

    // Optimal camera framing distances per item category
    if (item.category === 'real-estate') {
      orbitState.current.distance = 22.0;
      orbitState.current.targetDistance = 22.0;
      orbitState.current.rotX = 0.45;
    } else if (item.category === 'aviation-marine') {
      orbitState.current.distance = 16.0;
      orbitState.current.targetDistance = 16.0;
    } else if (item.category === 'jewelry-gold') {
      orbitState.current.distance = 4.8;
      orbitState.current.targetDistance = 4.8;
    } else {
      orbitState.current.distance = 8.5;
      orbitState.current.targetDistance = 8.5;
    }

    // 3. Renderer with high dynamic range tone mapping & soft shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height, true);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = lightingPreset === 'studio-white' ? 1.15 : 1.45;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Multi-Directional High Clarity Studio Lighting (Zero pitch-black spots!)
    setupStudioLighting(scene, lightingPreset);

    // 5. Studio Pedestal / Showroom Floor
    setupStudioFloor(scene, lightingPreset, item.category === 'real-estate');

    // 6. Build High-Fidelity 3D Model
    const modelGroup = new THREE.Group();
    rootObjectGroupRef.current = modelGroup;
    scene.add(modelGroup);

    animatedPartsRef.current = [];
    buildUniversal3DModel(modelGroup, item, selectedColor, isOpenParts, animatedPartsRef.current);

    // 7. Mouse & Touch Orbit Handlers
    const dom = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      orbitState.current.isDown = true;
      orbitState.current.prevX = e.clientX;
      orbitState.current.prevY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!orbitState.current.isDown) return;
      const dx = e.clientX - orbitState.current.prevX;
      const dy = e.clientY - orbitState.current.prevY;
      orbitState.current.prevX = e.clientX;
      orbitState.current.prevY = e.clientY;

      orbitState.current.rotY += dx * 0.006;
      orbitState.current.rotX = Math.max(0.05, Math.min(Math.PI / 2.2, orbitState.current.rotX + dy * 0.006));
    };

    const onPointerUp = () => {
      orbitState.current.isDown = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const minD = item.category === 'jewelry-gold' ? 2.5 : item.category === 'real-estate' ? 10 : 4;
      const maxD = item.category === 'real-estate' ? 55 : 30;
      orbitState.current.targetDistance = Math.max(minD, Math.min(maxD, orbitState.current.targetDistance + e.deltaY * 0.015));
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // 8. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, true);
      }
    };
    window.addEventListener('resize', handleResize);

    // 9. Render & Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth zoom distance lerp
      orbitState.current.distance = THREE.MathUtils.lerp(
        orbitState.current.distance,
        orbitState.current.targetDistance,
        0.12
      );

      // Auto-rotation when user is not dragging
      if (isAutoRotate && !orbitState.current.isDown) {
        orbitState.current.rotY += delta * 0.35;
      }

      // Compute spherical coordinates
      const { rotX, rotY, distance } = orbitState.current;
      const camY = Math.sin(rotX) * distance;
      const camRadius = Math.cos(rotX) * distance;
      const camX = Math.sin(rotY) * camRadius;
      const camZ = Math.cos(rotY) * camRadius;

      camera.position.set(camX, camY + (item.category === 'real-estate' ? 3 : 0), camZ);
      camera.lookAt(0, item.category === 'real-estate' ? 3 : 0, 0);

      // Subtle dynamic animations for components
      animatedPartsRef.current.forEach(part => {
        if (part.name === 'rotor') {
          part.rotation.y += delta * 12;
        } else if (part.name === 'tourbillon') {
          part.rotation.z += delta * 4;
        } else if (part.name === 'fountain') {
          part.scale.y = 1 + Math.sin(time * 6) * 0.08;
        }
      });

      renderer.render(scene, camera);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [item, lightingPreset, selectedColor, isAutoRotate, isOpenParts]);

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e] select-none overflow-hidden animate-fadeIn" style={{ width: '100vw', height: '100vh' }}>
      
      {/* 3D Canvas Viewport */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" 
        style={{ width: '100vw', height: '100vh', position: 'absolute', inset: 0 }}
      />

      {/* Top Navigation Bar */}
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
            <span className="font-semibold text-sm">Đóng Studio 3D</span>
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
            <p className="text-xs text-slate-300 font-mono">
              3D Kiến Trúc & Chi Tiết Hoàn Hảo • Xoay 360° & Đổi Ánh Sáng / Màu Sắc
            </p>
          </div>
        </div>

        {/* Right Action Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setShowSpecsModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-slate-700/60 backdrop-blur-md transition-all text-xs font-bold cursor-pointer"
          >
            <Info className="w-4 h-4" />
            <span>Hồ Sơ Chi Tiết</span>
          </button>

          {item.category === 'real-estate' ? (
            <button
              onClick={() => {
                soundManager.playDoorOpen();
                onLaunchSimulator(item);
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Tham Quan Tour 3D</span>
            </button>
          ) : item.vehicleConfig ? (
            <button
              onClick={() => {
                soundManager.playEngineStart();
                onLaunchSimulator(item);
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Lái Thử Simulator</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Floating Left Control Toolbar */}
      <div className="absolute left-6 top-28 z-20 flex flex-col gap-3 pointer-events-auto">
        <div className="p-3 rounded-2xl glass-panel border border-slate-700/60 shadow-2xl backdrop-blur-xl flex flex-col gap-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Studio Ánh Sáng
          </div>
          
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { id: 'royal-gold', name: 'Hoàng Gia 24K', icon: '👑' },
              { id: 'neon-cyber', name: 'Cyber Neon', icon: '⚡' },
              { id: 'golden-sunset', name: 'Hoàng Hôn Vàng', icon: '🌅' },
              { id: 'diamond-crystal', name: 'Kim Cương Crystal', icon: '💎' },
              { id: 'studio-white', name: 'Studio Trắng Pro', icon: '💡' },
            ].map(preset => (
              <button
                key={preset.id}
                onClick={() => {
                  soundManager.playClick();
                  setLightingPreset(preset.id as StudioLightingPreset);
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  lightingPreset === preset.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <span>{preset.icon}</span>
                <span>{preset.name}</span>
              </button>
            ))}
          </div>

          <hr className="border-slate-700/60 my-1" />

          {/* Color Switcher for Supercars/Motorbikes/Tech */}
          {item.category !== 'real-estate' && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">
                Màu Sơn & Chất Liệu
              </div>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_PRESETS.map((col, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedColor(col.hex);
                    }}
                    className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 cursor-pointer ${
                      selectedColor === col.hex || (col.hex === null && selectedColor === null)
                        ? 'border-amber-400 scale-110 shadow-[0_0_10px_#f59e0b]'
                        : 'border-slate-600 hover:border-slate-400'
                    }`}
                    style={{ backgroundColor: col.hex || item.vehicleConfig?.color || '#3b82f6' }}
                    title={col.name}
                  />
                ))}
              </div>
            </div>
          )}

          <hr className="border-slate-700/60 my-1" />

          {/* Feature toggles */}
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => {
                soundManager.playClick();
                setIsAutoRotate(!isAutoRotate);
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isAutoRotate ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Tự Động Xoay</span>
              </span>
              <span className="text-[10px] font-mono">{isAutoRotate ? 'BẬT' : 'TẮT'}</span>
            </button>

            {item.category === 'supercars' && (
              <button
                onClick={() => {
                  soundManager.playDoorOpen();
                  setIsOpenParts(!isOpenParts);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isOpenParts ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Mở Cửa Cắt Kéo</span>
                </span>
                <span className="text-[10px] font-mono">{isOpenParts ? 'MỞ' : 'ĐÓNG'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar & Quick Purchase */}
      <div className="absolute bottom-6 left-6 right-6 z-20 pointer-events-auto flex items-center justify-between p-4 md:p-5 rounded-2xl glass-panel border border-slate-700/60 shadow-2xl backdrop-blur-xl bg-slate-950/80">
        <div className="flex items-center gap-6">
          <div className="hidden sm:block">
            <div className="text-xs text-slate-400">Giá Niêm Yết Độc Quyền</div>
            <div className="text-2xl font-extrabold text-amber-400 font-mono">
              {formattedPrice(item.priceUsd, item.priceVnd)}
            </div>
          </div>
          <div className="h-8 w-[1px] bg-slate-700 hidden sm:block" />
          <div>
            <div className="text-xs text-slate-400">Tình Trạng</div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Sẵn Sàng Giao Ngay Hôm Nay</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (canAfford) {
                soundManager.playCashRegister();
                onBuy(item);
              } else {
                soundManager.playError();
                alert('Số dư của bạn không đủ để thanh toán siêu phẩm này! Hãy nạp thêm tiền hoặc quay Vòng Quay May Mắn.');
              }
            }}
            disabled={!canAfford}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all cursor-pointer ${
              canAfford 
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black shadow-amber-500/25 hover:scale-105 active:scale-95' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>{canAfford ? 'Xác Nhận Mua Ngay' : 'Không Đủ Tiền'}</span>
          </button>
        </div>
      </div>

      {/* Full Specs Modal Overlay */}
      {showSpecsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn pointer-events-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>{item.name}</span>
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </h3>
                <p className="text-sm text-amber-400 font-mono mt-1">
                  {formattedPrice(item.priceUsd, item.priceVnd)}
                </p>
              </div>
              <button
                onClick={() => setShowSpecsModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {item.description}
            </p>

            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thông Số Kỹ Thuật Chi Tiết</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(item.specs).map(([key, val], idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-[11px] text-slate-400">{key}</div>
                    <div className="text-sm font-semibold text-slate-200 mt-0.5">{val}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowSpecsModal(false)}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm cursor-pointer"
            >
              Đóng Bảng Thông Số
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
