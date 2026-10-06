import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { LuxuryItem } from '../../data/items';
import { soundManager } from '../../utils/audio';
import { ArrowLeft, Volume2, VolumeX, Flame } from 'lucide-react';

interface YachtJetSimulator3DProps {
  item: LuxuryItem;
  onClose: () => void;
  currency: 'USD' | 'VND';
}

export const YachtJetSimulator3D: React.FC<YachtJetSimulator3DProps> = ({ item, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isJet = item.category === 'aviation-marine' && item.id.includes('gulfstream');
  const [speed, setSpeed] = useState(isJet ? 400 : 25);
  const [altitude, setAltitude] = useState(isJet ? 10000 : 0);
  const [isMuted, setIsMuted] = useState(false);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const animFrameId = useRef<number | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const craftGroupRef = useRef<THREE.Group | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);

  const stateRef = useRef({
    speed: isJet ? 650 : 35,
    maxSpeed: isJet ? 1140 : 80,
    heading: 0,
    roll: 0,
    posX: 0,
    posY: isJet ? 8 : 0.8,
    posZ: 0,
    distance: 0
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current[k] = true;
      keysPressed.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current[k] = false;
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth || window.innerWidth || 1280;
    const height = containerRef.current.clientHeight || window.innerHeight || 720;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const bgColor = isJet ? 0x0f172a : 0x082f49;
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, 0.005);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 5, -12);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height, true);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';

    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xf59e0b, 2.5);
    sunLight.position.set(40, 50, 40);
    scene.add(sunLight);

    // 5. Ocean Water Plane / Cloud Bed
    const waterGeo = new THREE.PlaneGeometry(800, 800, 64, 64);
    const waterMat = new THREE.MeshStandardMaterial({
      color: isJet ? 0x1e293b : 0x0369a1,
      roughness: 0.1,
      metalness: 0.8,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0;
    scene.add(water);
    waterMeshRef.current = water;

    // 6. Build Craft
    const craftGroup = new THREE.Group();
    craftGroupRef.current = craftGroup;
    scene.add(craftGroup);

    if (isJet) {
      const jetBodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.15 });
      const fuselageGeo = new THREE.CylinderGeometry(0.9, 0.9, 8, 32);
      const fuselage = new THREE.Mesh(fuselageGeo, jetBodyMat);
      fuselage.rotation.x = Math.PI / 2;
      craftGroup.add(fuselage);

      const noseGeo = new THREE.ConeGeometry(0.9, 2.2, 32);
      const nose = new THREE.Mesh(noseGeo, jetBodyMat);
      nose.rotation.x = -Math.PI / 2;
      nose.position.z = 5.1;
      craftGroup.add(nose);

      const wingGeo = new THREE.BoxGeometry(11, 0.08, 2.2);
      const wing = new THREE.Mesh(wingGeo, jetBodyMat);
      wing.position.set(0, 0, 0.5);
      craftGroup.add(wing);

      const tailFinGeo = new THREE.BoxGeometry(0.1, 2.0, 1.6);
      const tailFin = new THREE.Mesh(tailFinGeo, jetBodyMat);
      tailFin.position.set(0, 1.2, -3.4);
      craftGroup.add(tailFin);

      const goldTrim = new THREE.Mesh(
        new THREE.TorusGeometry(0.92, 0.04, 16, 32),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.98 })
      );
      goldTrim.position.z = 2.5;
      craftGroup.add(goldTrim);
    } else {
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.98, roughness: 0.1 });
      const hullGeo = new THREE.BoxGeometry(3.6, 1.4, 10);
      const hull = new THREE.Mesh(hullGeo, goldMat);
      hull.position.y = 0.5;
      craftGroup.add(hull);

      const cabinGeo = new THREE.BoxGeometry(2.6, 1.2, 5.5);
      const cabinMat = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.9, roughness: 0.1 });
      const cabin = new THREE.Mesh(cabinGeo, cabinMat);
      cabin.position.set(0, 1.6, -0.5);
      craftGroup.add(cabin);

      const heliGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.08, 24);
      const heli = new THREE.Mesh(heliGeo, goldMat);
      heli.position.set(0, 1.25, -3.6);
      craftGroup.add(heli);
    }

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

    let lastTime = performance.now();

    const animate = (time: number) => {
      animFrameId.current = requestAnimationFrame(animate);
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      const keys = keysPressed.current;
      const state = stateRef.current;

      const isUp = keys['w'] || keys['arrowup'] || keys['KeyW'] || keys['ArrowUp'];
      const isDown = keys['s'] || keys['arrowdown'] || keys['KeyS'] || keys['ArrowDown'];
      const isLeft = keys['a'] || keys['arrowleft'] || keys['KeyA'] || keys['ArrowLeft'];
      const isRight = keys['d'] || keys['arrowright'] || keys['KeyD'] || keys['ArrowRight'];

      if (isUp) state.speed = Math.min(state.maxSpeed, state.speed + delta * 120);
      if (isDown) state.speed = Math.max(10, state.speed - delta * 80);

      // Steering physics (Left moves -X, Right moves +X)
      if (isLeft) {
        state.heading = Math.max(-0.6, state.heading - delta * 0.8);
        state.posX = Math.max(-15, state.posX - delta * 12);
        state.roll = THREE.MathUtils.lerp(state.roll, 0.35, 0.1);
      } else if (isRight) {
        state.heading = Math.min(0.6, state.heading + delta * 0.8);
        state.posX = Math.min(15, state.posX + delta * 12);
        state.roll = THREE.MathUtils.lerp(state.roll, -0.35, 0.1);
      } else {
        state.heading = THREE.MathUtils.lerp(state.heading, 0, 0.08);
        state.roll = THREE.MathUtils.lerp(state.roll, 0, 0.1);
      }

      state.distance += state.speed * delta;

      if (craftGroupRef.current) {
        craftGroupRef.current.position.set(
          state.posX,
          state.posY + (isJet ? Math.sin(time * 0.002) * 0.5 : Math.sin(time * 0.003) * 0.2),
          0
        );
        craftGroupRef.current.rotation.y = state.heading;
        craftGroupRef.current.rotation.z = state.roll;
      }

      if (cameraRef.current && craftGroupRef.current) {
        const cPos = craftGroupRef.current.position;
        cameraRef.current.position.set(cPos.x * 0.7, cPos.y + 3.5, cPos.z - 11);
        cameraRef.current.lookAt(cPos.x, cPos.y + 1, cPos.z + 15);
      }

      setSpeed(Math.round(state.speed));
      setAltitude(isJet ? Math.round(10000 + Math.sin(time * 0.001) * 200) : 0);

      renderer.render(scene, camera);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [isJet]);

  const setKeyStatus = (key: string, pressed: boolean) => {
    keysPressed.current[key] = pressed;
    keysPressed.current[key.toLowerCase()] = pressed;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090b10] select-none overflow-hidden animate-fadeIn" style={{ width: '100vw', height: '100vh' }}>
      <div 
        ref={containerRef} 
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" 
        style={{ width: '100vw', height: '100vh', position: 'absolute', inset: 0 }}
      />
        
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-sm">Thoát Điều Khiển</span>
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
            <p className="text-xs text-slate-400">
              {isJet ? 'Hành trình vượt mây liên lục địa' : 'Hải trình vượt biển Caribe đẳng cấp quý tộc'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md transition-all"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Instruments HUD */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
        <div className="p-5 rounded-2xl glass-panel border border-slate-700/70 shadow-2xl backdrop-blur-xl flex items-center gap-6">
          <div className="flex flex-col items-center justify-center w-28 h-28 rounded-full border-4 border-slate-800 bg-slate-950/80">
            <span className="text-3xl font-extrabold font-mono text-cyan-400">
              {speed}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              {isJet ? 'KM / H' : 'KNOTS'}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="flex justify-between gap-6">
              <span className="text-slate-400">Trạng Thái:</span>
              <span className="text-emerald-400 font-bold">{isJet ? 'Cruising at Mach 0.9' : 'Ocean Luxury Cruise'}</span>
            </div>
            {isJet && (
              <div className="flex justify-between gap-6">
                <span className="text-slate-400">Độ Cao Bay:</span>
                <span className="text-cyan-400 font-bold">{altitude.toLocaleString()} FT (FL350)</span>
              </div>
            )}
            <div className="flex justify-between gap-6">
              <span className="text-slate-400">Điều Khiển:</span>
              <span className="text-amber-400">Phím W/S (Ga) • A/D (Lượn Trái/Phải)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Touch Steering Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex items-end gap-3 pointer-events-auto">
        <button
          onPointerDown={() => setKeyStatus('a', true)}
          onPointerUp={() => setKeyStatus('a', false)}
          onPointerLeave={() => setKeyStatus('a', false)}
          onPointerCancel={() => setKeyStatus('a', false)}
          className="w-14 h-14 rounded-2xl bg-slate-900/80 hover:bg-slate-800 active:bg-amber-500 active:text-black text-slate-200 border border-slate-700/80 flex items-center justify-center font-bold text-lg shadow-xl"
        >
          ◄
        </button>

        <button
          onPointerDown={() => setKeyStatus('d', true)}
          onPointerUp={() => setKeyStatus('d', false)}
          onPointerLeave={() => setKeyStatus('d', false)}
          onPointerCancel={() => setKeyStatus('d', false)}
          className="w-14 h-14 rounded-2xl bg-slate-900/80 hover:bg-slate-800 active:bg-amber-500 active:text-black text-slate-200 border border-slate-700/80 flex items-center justify-center font-bold text-lg shadow-xl"
        >
          ►
        </button>

        <button
          onPointerDown={() => setKeyStatus('s', true)}
          onPointerUp={() => setKeyStatus('s', false)}
          onPointerLeave={() => setKeyStatus('s', false)}
          onPointerCancel={() => setKeyStatus('s', false)}
          className="w-14 h-16 rounded-2xl bg-rose-950/80 hover:bg-rose-900 active:bg-rose-600 text-rose-200 border border-rose-700/80 flex flex-col items-center justify-center font-bold text-xs shadow-xl active:scale-95"
        >
          <span>GIẢM</span>
        </button>

        <button
          onPointerDown={() => setKeyStatus('w', true)}
          onPointerUp={() => setKeyStatus('w', false)}
          onPointerLeave={() => setKeyStatus('w', false)}
          onPointerCancel={() => setKeyStatus('w', false)}
          className="w-16 h-20 rounded-2xl bg-gradient-to-t from-emerald-600 to-teal-500 text-black font-extrabold border border-emerald-400 flex flex-col items-center justify-center shadow-2xl active:scale-95 text-xs"
        >
          <Flame className="w-5 h-5 fill-black" />
          <span>TĂNG GA</span>
        </button>
      </div>
    </div>
  );
};
