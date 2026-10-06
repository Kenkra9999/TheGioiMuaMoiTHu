import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { LuxuryItem } from '../../data/items';
import { soundManager } from '../../utils/audio';
import { materialLib } from '../../3d/materials/MaterialLibrary';
import { 
  ArrowLeft, Sun, Volume2, VolumeX,
  Compass, MapPin, Award, ShieldCheck, Home
} from 'lucide-react';

interface HouseTour3DProps {
  item: LuxuryItem;
  onClose: () => void;
  currency: 'USD' | 'VND';
}

type RoomLocation = 'living' | 'terrace' | 'bedroom' | 'garage';

export const HouseTour3D: React.FC<HouseTour3DProps> = ({ item, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentRoom, setCurrentRoom] = useState<RoomLocation>('living');
  const [lightingMode, setLightingMode] = useState<'warm' | 'cyber' | 'day'>('warm');
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [showDeed, setShowDeed] = useState(false);
  const [, setIsWalking] = useState(false);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const mouseState = useRef({ isDown: false, prevX: 0, prevY: 0, yaw: 0, pitch: 0 });
  const animFrameId = useRef<number | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointLightsRef = useRef<THREE.PointLight[]>([]);

  const playerPos = useRef(new THREE.Vector3(0, 1.7, 2));
  const targetCamPos = useRef(new THREE.Vector3(0, 1.7, 2));

  const roomCoordinates: Record<RoomLocation, { pos: THREE.Vector3; lookAt: THREE.Vector3; name: string }> = {
    living: {
      pos: new THREE.Vector3(0, 1.7, 2),
      lookAt: new THREE.Vector3(0, 1.7, 10),
      name: 'Phòng Khách Hoàng Gia'
    },
    terrace: {
      pos: new THREE.Vector3(0, 1.7, 16),
      lookAt: new THREE.Vector3(0, 1.7, 30),
      name: 'Ban Công & Hồ Bơi Vô Cực'
    },
    bedroom: {
      pos: new THREE.Vector3(-14, 1.7, 0),
      lookAt: new THREE.Vector3(-14, 1.7, 8),
      name: 'Phòng Ngủ Master King Suite'
    },
    garage: {
      pos: new THREE.Vector3(14, 1.7, -2),
      lookAt: new THREE.Vector3(14, 1.7, 8),
      name: 'Hầm Siêu Xe & Kho Két Sắt'
    }
  };

  const teleportToRoom = (room: RoomLocation) => {
    soundManager.playDoorOpen();
    setCurrentRoom(room);
    const target = roomCoordinates[room];
    playerPos.current.copy(target.pos);
    targetCamPos.current.copy(target.pos);
    mouseState.current.yaw = 0;
    mouseState.current.pitch = 0;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      keysPressed.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
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
    let timer: NodeJS.Timeout;
    if (isMusicPlaying) {
      timer = setInterval(() => {
        soundManager.playSparkle();
      }, 7000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [isMusicPlaying]);

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth || window.innerWidth || 1280;
    const height = containerRef.current.clientHeight || window.innerHeight || 720;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const bgColor = lightingMode === 'cyber' ? 0x070914 : lightingMode === 'warm' ? 0x18101a : 0x7dd3fc;
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, 0.008);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 500);
    cameraRef.current = camera;
    camera.position.set(0, 1.7, 2);

    // 3. Renderer with high brightness & clarity
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height, true);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';

    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);

    // 4. Build Full Multi-Room Estate Architecture (Bright, Lavish, Crystal Clear)
    pointLightsRef.current = [];
    buildLuxuryEstate(scene, pointLightsRef.current, lightingMode);

    // 5. Mouse / Touch Look Around Handlers
    const dom = renderer.domElement;
    const onMouseDown = (e: MouseEvent) => {
      mouseState.current.isDown = true;
      mouseState.current.prevX = e.clientX;
      mouseState.current.prevY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!mouseState.current.isDown) return;
      const deltaX = e.clientX - mouseState.current.prevX;
      const deltaY = e.clientY - mouseState.current.prevY;
      mouseState.current.prevX = e.clientX;
      mouseState.current.prevY = e.clientY;

      mouseState.current.yaw -= deltaX * 0.0035;
      mouseState.current.pitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, mouseState.current.pitch - deltaY * 0.0035));
    };
    const onMouseUp = () => {
      mouseState.current.isDown = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseState.current.isDown = true;
        mouseState.current.prevX = e.touches[0].clientX;
        mouseState.current.prevY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!mouseState.current.isDown || e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - mouseState.current.prevX;
      const deltaY = e.touches[0].clientY - mouseState.current.prevY;
      mouseState.current.prevX = e.touches[0].clientX;
      mouseState.current.prevY = e.touches[0].clientY;

      mouseState.current.yaw -= deltaX * 0.004;
      mouseState.current.pitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, mouseState.current.pitch - deltaY * 0.004));
    };
    const onTouchEnd = () => {
      mouseState.current.isDown = false;
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

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

    function buildLuxuryEstate(scene: THREE.Scene, lights: THREE.PointLight[], mode: 'warm' | 'cyber' | 'day') {
      const isCyber = mode === 'cyber';
      const isWarm = mode === 'warm';

      const lightColor = isCyber ? 0x38bdf8 : isWarm ? 0xfff3d6 : 0xffffff;

      // 1. Balanced Hemisphere Light (Zero dark corners)
      const hemi = new THREE.HemisphereLight(0xffffff, 0x64748b, isCyber ? 2.2 : 3.0);
      scene.add(hemi);

      const amb = new THREE.AmbientLight(0xffffff, 2.0);
      scene.add(amb);

      const dirLight = new THREE.DirectionalLight(lightColor, 3.5);
      dirLight.position.set(15, 35, 25);
      dirLight.castShadow = true;
      scene.add(dirLight);

      // ==================== 1. LIVING ROOM ====================
      const marbleGeo = new THREE.PlaneGeometry(18, 18);
      const livingFloor = new THREE.Mesh(marbleGeo, materialLib.getMarbleMaterial(0xf8fafc));
      livingFloor.rotation.x = -Math.PI / 2;
      livingFloor.position.set(0, 0, 4);
      livingFloor.receiveShadow = true;
      scene.add(livingFloor);

      const ceilingMat = materialLib.getStuccoMaterial(0xffffff);
      const ceiling = new THREE.Mesh(marbleGeo, ceilingMat);
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.set(0, 4.2, 4);
      scene.add(ceiling);

      // Grand Golden Chandelier
      const chandGeo = new THREE.CylinderGeometry(1.4, 0.5, 0.9, 24);
      const chandMat = materialLib.getMetalMaterial('gold');
      const chandelier = new THREE.Mesh(chandGeo, chandMat);
      chandelier.position.set(0, 3.8, 4);
      scene.add(chandelier);

      const chandLight = new THREE.PointLight(lightColor, 5.0, 25);
      chandLight.position.set(0, 3.4, 4);
      scene.add(chandLight);
      lights.push(chandLight);

      // Walls
      const wallMat = materialLib.getWallMaterial(0xfef3c7, 0.4, 0.05);
      
      const backWallGeo = new THREE.BoxGeometry(18, 4.2, 0.4);
      const backWall = new THREE.Mesh(backWallGeo, wallMat);
      backWall.position.set(0, 2.1, -4);
      backWall.receiveShadow = true;
      scene.add(backWall);

      // 98" OLED TV
      const tvScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(6.2, 3.2), 
        materialLib.getEmissiveMaterial(isCyber ? 0x0284c7 : 0xf59e0b)
      );
      tvScreen.position.set(0, 2.4, -3.78);
      scene.add(tvScreen);

      // Modern Linear LED Fireplace
      const fireplace = new THREE.Mesh(
        new THREE.BoxGeometry(5.0, 0.65, 0.6), 
        materialLib.getEmissiveMaterial(0xf97316)
      );
      fireplace.position.set(0, 0.45, -3.65);
      scene.add(fireplace);

      // Plush Royal Blue Velvet Curved Sofa
      const sofaMat = materialLib.getWallMaterial(0x1e3a8a, 0.7, 0.05);
      const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.5, 2.4), sofaMat);
      sofaBase.position.set(0, 0.25, 3);
      sofaBase.castShadow = true;
      scene.add(sofaBase);

      const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.7, 0.4), sofaMat);
      sofaBack.position.set(0, 0.75, 1.8);
      scene.add(sofaBack);

      // Marble & Glass Coffee Table
      const tableGeo = new THREE.BoxGeometry(3.6, 0.4, 1.4);
      const tableMat = materialLib.getMarbleMaterial(0xffffff);
      const table = new THREE.Mesh(tableGeo, tableMat);
      table.position.set(0, 0.25, 5);
      table.castShadow = true;
      scene.add(table);

      // ==================== 2. TERRACE & INFINITY SKY POOL ====================
      const deckGeo = new THREE.PlaneGeometry(26, 20);
      const deckMat = materialLib.getWoodMaterial('teak');
      const deck = new THREE.Mesh(deckGeo, deckMat);
      deck.rotation.x = -Math.PI / 2;
      deck.position.set(0, -0.02, 20);
      deck.receiveShadow = true;
      scene.add(deck);

      const poolGeo = new THREE.PlaneGeometry(18, 11);
      const poolMat = materialLib.getPoolWaterMaterial();
      const poolWater = new THREE.Mesh(poolGeo, poolMat);
      poolWater.rotation.x = -Math.PI / 2;
      poolWater.position.set(0, -0.08, 23);
      scene.add(poolWater);

      const poolLight = new THREE.PointLight(0x38bdf8, 5.5, 22);
      poolLight.position.set(0, 0.6, 23);
      scene.add(poolLight);

      // Glass Balustrade Edge
      const glassRailing = new THREE.Mesh(
        new THREE.BoxGeometry(24, 1.2, 0.1), 
        materialLib.getGlassMaterial(0xffffff, 0.4)
      );
      glassRailing.position.set(0, 0.6, 28.5);
      scene.add(glassRailing);

      // Distant City Skyline Towers with Warm Lights
      for (let i = -4; i <= 4; i++) {
        const h = 45 + (Math.abs(i) * 8);
        const towerGeo = new THREE.BoxGeometry(12, h, 14);
        const towerMat = materialLib.getWallMaterial(0x0f172a, 0.2, 0.8);
        const tower = new THREE.Mesh(towerGeo, towerMat);
        tower.position.set(i * 22, h / 2 - 15, 60);
        scene.add(tower);
      }

      // ==================== 3. MASTER BEDROOM KING SUITE ====================
      const bedFloor = new THREE.Mesh(new THREE.PlaneGeometry(14, 16), materialLib.getWoodMaterial('oak'));
      bedFloor.rotation.x = -Math.PI / 2;
      bedFloor.position.set(-14, 0, 2);
      bedFloor.receiveShadow = true;
      scene.add(bedFloor);

      const bedCeiling = new THREE.Mesh(new THREE.PlaneGeometry(14, 16), ceilingMat);
      bedCeiling.rotation.x = Math.PI / 2;
      bedCeiling.position.set(-14, 4.2, 2);
      scene.add(bedCeiling);

      const bedLight = new THREE.PointLight(0xfef08a, 4.5, 18);
      bedLight.position.set(-14, 3.5, 2);
      scene.add(bedLight);

      // King Size Bed
      const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.55, 4.6), materialLib.getStuccoMaterial(0x475569));
      bedFrame.position.set(-14, 0.28, 4);
      scene.add(bedFrame);

      const mattress = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.45, 4.2), materialLib.getStuccoMaterial(0xffffff));
      mattress.position.set(-14, 0.75, 4);
      scene.add(mattress);

      const satinDuvet = new THREE.Mesh(
        new THREE.BoxGeometry(4.25, 0.15, 2.8), 
        materialLib.getMetalMaterial('gold')
      );
      satinDuvet.position.set(-14, 0.98, 3.2);
      scene.add(satinDuvet);

      // Armored Vault Safe with 24K Gold Bars
      const safe = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 2.4, 1.5), 
        materialLib.getMetalMaterial('darkSteel')
      );
      safe.position.set(-18, 1.2, -2);
      scene.add(safe);

      for (let g = 0; g < 4; g++) {
        const goldBar = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.25, 0.4), 
          materialLib.getMetalMaterial('gold')
        );
        goldBar.position.set(-18, 0.8 + g * 0.28, -1.8);
        scene.add(goldBar);
      }

      // ==================== 4. UNDERGROUND SUPERCAR SHOWROOM ====================
      const garageFloorMat = materialLib.getMetalMaterial('darkSteel');
      const garageFloor = new THREE.Mesh(new THREE.PlaneGeometry(14, 18), garageFloorMat);
      garageFloor.rotation.x = -Math.PI / 2;
      garageFloor.position.set(14, 0, 0);
      garageFloor.receiveShadow = true;
      scene.add(garageFloor);

      const garageCeiling = new THREE.Mesh(new THREE.PlaneGeometry(14, 18), ceilingMat);
      garageCeiling.rotation.x = Math.PI / 2;
      garageCeiling.position.set(14, 4.2, 0);
      scene.add(garageCeiling);

      const hexLight = new THREE.PointLight(0x38bdf8, 5.0, 20);
      hexLight.position.set(14, 3.6, 2);
      scene.add(hexLight);

      // Revolving Platform
      const platform = new THREE.Mesh(
        new THREE.CylinderGeometry(3.8, 3.8, 0.2, 32), 
        materialLib.getMetalMaterial('chrome')
      );
      platform.position.set(14, 0.1, 2);
      scene.add(platform);

      // Hypercar on Display
      const showCar = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.65, 4.4), 
        materialLib.getCarPaintMaterial('#dc2626', 0.95, 0.1)
      );
      showCar.position.set(14, 0.55, 2);
      scene.add(showCar);

      const showCarCabin = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.45, 2.0), 
        materialLib.getGlassMaterial(0x090d16, 0.8)
      );
      showCarCabin.position.set(14, 0.95, 1.8);
      scene.add(showCarCabin);
    }

    let lastStepTime = 0;

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);

      const keys = keysPressed.current;
      const isUp = keys['w'] || keys['arrowup'] || keys['KeyW'] || keys['ArrowUp'];
      const isDown = keys['s'] || keys['arrowdown'] || keys['KeyS'] || keys['ArrowDown'];
      const isLeft = keys['a'] || keys['arrowleft'] || keys['KeyA'] || keys['ArrowLeft'];
      const isRight = keys['d'] || keys['arrowright'] || keys['KeyD'] || keys['ArrowRight'];

      const moveVector = new THREE.Vector3(0, 0, 0);
      const walkSpeed = 0.09;

      if (isUp) moveVector.z += walkSpeed;
      if (isDown) moveVector.z -= walkSpeed;
      if (isLeft) moveVector.x -= walkSpeed;
      if (isRight) moveVector.x += walkSpeed;

      const moving = isUp || isDown || isLeft || isRight;
      setIsWalking(moving);

      if (moving) {
        const yaw = mouseState.current.yaw;
        const forwardX = Math.sin(yaw);
        const forwardZ = Math.cos(yaw);
        const rightX = Math.cos(yaw);
        const rightZ = -Math.sin(yaw);

        playerPos.current.x += moveVector.z * forwardX + moveVector.x * rightX;
        playerPos.current.z += moveVector.z * forwardZ + moveVector.x * rightZ;

        const now = performance.now();
        if (now - lastStepTime > 400) {
          soundManager.playFootstep();
          lastStepTime = now;
        }
      }

      targetCamPos.current.lerp(playerPos.current, 0.2);
      camera.position.copy(targetCamPos.current);

      const yaw = mouseState.current.yaw;
      const pitch = mouseState.current.pitch;
      const targetLook = new THREE.Vector3(
        camera.position.x + Math.sin(yaw) * Math.cos(pitch) * 10,
        camera.position.y + Math.sin(pitch) * 10,
        camera.position.z + Math.cos(yaw) * Math.cos(pitch) * 10
      );
      camera.lookAt(targetLook);

      renderer.render(scene, camera);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [lightingMode]);

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e] select-none overflow-hidden animate-fadeIn" style={{ width: '100vw', height: '100vh' }}>
      
      {/* 3D Canvas Viewport */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" 
        style={{ width: '100vw', height: '100vh', position: 'absolute', inset: 0 }}
      />

      {/* Top Header Navigation */}
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
            <span className="font-semibold text-sm">Thoát Tham Quan</span>
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
            <p className="text-xs text-slate-300 font-mono flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{item.locationOrOrigin} • Đang ở: {roomCoordinates[currentRoom].name}</span>
            </p>
          </div>
        </div>

        {/* Right Header Options */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setLightingMode(prev => prev === 'warm' ? 'cyber' : prev === 'cyber' ? 'day' : 'warm');
            }}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-slate-700/60 backdrop-blur-md transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            title="Đổi phong cách ánh sáng"
          >
            <Sun className="w-4 h-4" />
            <span className="hidden sm:inline">{lightingMode === 'warm' ? 'Ánh Sáng Ấm' : lightingMode === 'cyber' ? 'Cyber Neon' : 'Ban Ngày'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setShowDeed(!showDeed);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>Sổ Đỏ Bất Động Sản</span>
          </button>

          <button
            onClick={() => setIsMusicPlaying(!isMusicPlaying)}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md transition-all cursor-pointer"
          >
            {isMusicPlaying ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>
        </div>
      </div>

      {/* Left Room Teleport Selector */}
      <div className="absolute left-6 top-24 z-20 space-y-2 pointer-events-auto max-w-[220px]">
        <div className="p-3 rounded-2xl glass-panel border border-slate-700/80 backdrop-blur-xl space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" /> Chuyển Phòng Nhanh
          </span>
          {(Object.keys(roomCoordinates) as RoomLocation[]).map((rKey) => (
            <button
              key={rKey}
              onClick={() => teleportToRoom(rKey)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                currentRoom === rKey 
                  ? 'bg-amber-500 text-black font-bold shadow-md' 
                  : 'bg-slate-900/90 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{roomCoordinates[rKey].name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Floating Walking Controls Guide */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
        <div className="p-4 rounded-2xl glass-panel border border-slate-700/80 shadow-2xl backdrop-blur-xl flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
            <Home className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-300 space-y-0.5 font-mono">
            <p className="font-bold text-white">Hướng Dẫn Tham Quan 3D:</p>
            <p>• Dùng chuột/ngón tay rê màn hình để nhìn 360 độ</p>
            <p>• Phím <strong>W / A / S / D</strong> để bước đi trong phòng</p>
          </div>
        </div>
      </div>

      {/* Real Estate Title Deed (Sổ Đỏ Hoàng Gia) Modal */}
      {showDeed && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#1e1a14] via-[#120f0d] to-[#0a0807] border-2 border-amber-500/80 max-w-lg w-full text-slate-100 space-y-4 shadow-2xl animate-scaleUp">
            <div className="text-center space-y-1">
              <span className="text-4xl">👑</span>
              <h3 className="text-xl font-black font-luxury text-amber-400 uppercase tracking-wider">
                GIẤY CHỨNG NHẬN QUYỀN SỞ HỮU BẤT ĐỘNG SẢN
              </h3>
              <p className="text-[11px] text-amber-200/80 uppercase font-mono tracking-widest">
                SỔ ĐỎ ĐỘC BẢN • BILLIONAIRE TYCOON CERTIFIED
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2 text-xs">
              <div className="flex justify-between border-b border-amber-500/20 pb-1">
                <span className="text-slate-400">Tên Tài Sản:</span>
                <span className="font-bold text-amber-300">{item.name}</span>
              </div>
              <div className="flex justify-between border-b border-amber-500/20 pb-1">
                <span className="text-slate-400">Vị Trí:</span>
                <span className="font-bold text-slate-200">{item.locationOrOrigin}</span>
              </div>
              <div className="flex justify-between border-b border-amber-500/20 pb-1">
                <span className="text-slate-400">Diện Tích Sử Dụng:</span>
                <span className="font-bold text-slate-200">{item.specs['Diện Tích'] || '1,000 m²'}</span>
              </div>
              <div className="flex justify-between border-b border-amber-500/20 pb-1">
                <span className="text-slate-400">Doanh Thu Thuê:</span>
                <span className="font-bold text-emerald-400">+{((item.rentalIncomePerSec || 0) * 3600 / 1000000).toFixed(0)} Triệu ₫ / giờ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tình Trạng Pháp Lý:</span>
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-amber-400" /> Sở Hữu Vĩnh Viễn 100%
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowDeed(false)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs shadow-lg active:scale-95 cursor-pointer"
              >
                Đóng Sổ Đỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
