import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { LuxuryItem } from '../../data/items';
import { soundManager } from '../../utils/audio';
import { 
  ArrowLeft, RotateCw, ZoomIn, ZoomOut, Sparkles, 
  ShieldCheck, Award, Eye, CheckCircle2, Clock
} from 'lucide-react';

interface JewelryInspector3DProps {
  item: LuxuryItem;
  onClose: () => void;
  currency: 'USD' | 'VND';
}

export const JewelryInspector3D: React.FC<JewelryInspector3DProps> = ({ item, onClose, currency }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWearingOnWrist, setIsWearingOnWrist] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [isRotating, setIsRotating] = useState(true);

  const animFrameId = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const itemGroupRef = useRef<THREE.Group | null>(null);
  const secondHandRef = useRef<THREE.Mesh | null>(null);
  const tourbillonRef = useRef<THREE.Mesh | null>(null);

  const mouseState = useRef({ isDown: false, prevX: 0, prevY: 0 });

  const jCfg = item.jewelryConfig || {
    type: 'watch',
    material: 'gold',
    sparkleIntensity: 8,
    hasMovingParts: true
  };

  useEffect(() => {
    let tickInterval: NodeJS.Timeout;
    if (jCfg.type === 'watch') {
      tickInterval = setInterval(() => {
        soundManager.playWatchTick();
      }, 1000);
    }
    return () => {
      if (tickInterval) clearInterval(tickInterval);
    };
  }, [jCfg.type]);

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth || window.innerWidth || 1280;
    const height = containerRef.current.clientHeight || window.innerHeight || 720;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x07090e);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    camera.position.set(0, 0, isWearingOnWrist ? 5.5 : 4.2);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height, true);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';

    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);

    // 4. Lighting Setup (Multi-directional crystal sparkle)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x64748b, 2.5);
    scene.add(hemiLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2.2);
    scene.add(ambientLight);

    const keyLight = new THREE.SpotLight(0xfff5e6, 6.5, 35, Math.PI / 3, 0.2);
    keyLight.position.set(6, 10, 6);
    scene.add(keyLight);

    const rimLight = new THREE.SpotLight(0x38bdf8, 5.0, 35, Math.PI / 3, 0.2);
    rimLight.position.set(-6, -6, -5);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xf59e0b, 4.5, 25);
    fillLight.position.set(0, -4, 5);
    scene.add(fillLight);

    // 5. Build 3D Luxury Item Object
    const itemGroup = new THREE.Group();
    itemGroupRef.current = itemGroup;
    scene.add(itemGroup);

    build3DJewelry(itemGroup, item, jCfg, isWearingOnWrist);

    // 6. Mouse orbital rotation
    const dom = renderer.domElement;
    const onMouseDown = (e: MouseEvent) => {
      mouseState.current.isDown = true;
      mouseState.current.prevX = e.clientX;
      mouseState.current.prevY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!mouseState.current.isDown || !itemGroupRef.current) return;
      const deltaX = e.clientX - mouseState.current.prevX;
      const deltaY = e.clientY - mouseState.current.prevY;
      mouseState.current.prevX = e.clientX;
      mouseState.current.prevY = e.clientY;

      itemGroupRef.current.rotation.y += deltaX * 0.01;
      itemGroupRef.current.rotation.x += deltaY * 0.01;
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
      if (!mouseState.current.isDown || e.touches.length === 0 || !itemGroupRef.current) return;
      const deltaX = e.touches[0].clientX - mouseState.current.prevX;
      const deltaY = e.touches[0].clientY - mouseState.current.prevY;
      mouseState.current.prevX = e.touches[0].clientX;
      mouseState.current.prevY = e.touches[0].clientY;

      itemGroupRef.current.rotation.y += deltaX * 0.01;
      itemGroupRef.current.rotation.x += deltaY * 0.01;
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

    function build3DJewelry(
      group: THREE.Group,
      item: LuxuryItem,
      cfg: NonNullable<LuxuryItem['jewelryConfig']>,
      onWrist: boolean
    ) {
      if (onWrist) {
        const armGeo = new THREE.CylinderGeometry(0.7, 0.85, 5, 32);
        const armMat = new THREE.MeshStandardMaterial({
          color: 0xdfa77b,
          roughness: 0.7,
          metalness: 0.05
        });
        const arm = new THREE.Mesh(armGeo, armMat);
        arm.rotation.z = Math.PI / 2;
        group.add(arm);
      }

      if (cfg.type === 'watch') {
        const isRoseGold = cfg.material === 'rose-gold';
        const isPlatinum = cfg.material === 'platinum';
        const caseColor = isRoseGold ? 0xec4899 : isPlatinum ? 0xe2e8f0 : 0xf59e0b;

        const caseMat = new THREE.MeshStandardMaterial({
          color: caseColor,
          metalness: 0.95,
          roughness: 0.15,
        });

        const caseGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.28, 48);
        const watchCase = new THREE.Mesh(caseGeo, caseMat);
        watchCase.rotation.x = Math.PI / 2;
        group.add(watchCase);

        if (item.id.includes('rainbow')) {
          for (let i = 0; i < 36; i++) {
            const angle = (i / 36) * Math.PI * 2;
            const hue = (i / 36);
            const gemMat = new THREE.MeshStandardMaterial({
              color: new THREE.Color().setHSL(hue, 1, 0.5),
              metalness: 0.3,
              roughness: 0.05
            });
            const gem = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.15), gemMat);
            gem.position.set(Math.cos(angle) * 1.05, Math.sin(angle) * 1.05, 0.1);
            group.add(gem);
          }
        }

        const dialGeo = new THREE.CircleGeometry(0.92, 48);
        const dialMat = new THREE.MeshStandardMaterial({
          color: isPlatinum ? 0x090d16 : 0x0f172a,
          roughness: 0.3,
          metalness: 0.8
        });
        const dial = new THREE.Mesh(dialGeo, dialMat);
        dial.position.z = 0.15;
        group.add(dial);

        for (let h = 0; h < 12; h++) {
          const angle = (h / 12) * Math.PI * 2;
          const markerMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
          const marker = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.15, 0.02), markerMat);
          marker.position.set(Math.sin(angle) * 0.78, Math.cos(angle) * 0.78, 0.16);
          marker.rotation.z = -angle;
          group.add(marker);
        }

        const tourbillonGeo = new THREE.RingGeometry(0.15, 0.32, 24);
        const tourbillonMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95 });
        const tourbillon = new THREE.Mesh(tourbillonGeo, tourbillonMat);
        tourbillon.position.set(0, -0.4, 0.16);
        group.add(tourbillon);
        tourbillonRef.current = tourbillon;

        const hourHand = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.45, 0.02),
          new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 })
        );
        hourHand.position.set(0, 0.2, 0.17);
        hourHand.rotation.z = 0.8;
        group.add(hourHand);

        const minuteHand = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.65, 0.02),
          new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 })
        );
        minuteHand.position.set(0, 0.3, 0.18);
        minuteHand.rotation.z = -1.2;
        group.add(minuteHand);

        const secHand = new THREE.Mesh(
          new THREE.BoxGeometry(0.02, 0.75, 0.02),
          new THREE.MeshBasicMaterial({ color: 0xef4444 })
        );
        secHand.position.set(0, 0.35, 0.19);
        group.add(secHand);
        secondHandRef.current = secHand;

        const glassGeo = new THREE.CylinderGeometry(1.02, 1.02, 0.05, 32);
        const glassMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.25,
          roughness: 0.02,
          metalness: 0.1
        });
        const glass = new THREE.Mesh(glassGeo, glassMat);
        glass.rotation.x = Math.PI / 2;
        glass.position.z = 0.22;
        group.add(glass);

        const strapMat = new THREE.MeshStandardMaterial({
          color: isPlatinum ? 0xd4d4d8 : isRoseGold ? 0x3b1c1c : 0x18181b,
          roughness: 0.6,
          metalness: isPlatinum ? 0.9 : 0.2
        });
        const topStrap = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.8, 0.14), strapMat);
        topStrap.position.set(0, 1.8, -0.05);
        group.add(topStrap);
        const btmStrap = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.8, 0.14), strapMat);
        btmStrap.position.set(0, -1.8, -0.05);
        group.add(btmStrap);

      } else if (cfg.type === 'gold-bar') {
        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          metalness: 0.98,
          roughness: 0.12,
        });

        const barGeo = new THREE.BoxGeometry(2.4, 1.3, 0.6);
        const goldBar = new THREE.Mesh(barGeo, goldMat);
        group.add(goldBar);

        const stampMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.95 });
        const stamp = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.8), stampMat);
        stamp.position.z = 0.31;
        group.add(stamp);

      } else if (cfg.type === 'diamond-ring') {
        const ringGeo = new THREE.TorusGeometry(1.2, 0.16, 24, 64);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0xf1f5f9,
          metalness: 0.98,
          roughness: 0.08
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        group.add(ring);

        const diamondGeo = new THREE.OctahedronGeometry(0.85, 2);
        const diamondMat = new THREE.MeshStandardMaterial({
          color: item.id.includes('pink') ? 0xf472b6 : 0xe0f2fe,
          metalness: 0.2,
          roughness: 0.02,
          transparent: true,
          opacity: 0.88
        });
        const diamond = new THREE.Mesh(diamondGeo, diamondMat);
        diamond.position.y = 1.4;
        group.add(diamond);

      } else {
        const neckGeo = new THREE.TorusGeometry(1.6, 0.25, 24, 64);
        const neckMat = new THREE.MeshStandardMaterial({
          color: cfg.material === 'emerald' ? 0x10b981 : 0xf59e0b,
          metalness: 0.95,
          roughness: 0.15
        });
        const necklace = new THREE.Mesh(neckGeo, neckMat);
        group.add(necklace);
      }
    }

    let lastTime = performance.now();

    const animate = (time: number) => {
      animFrameId.current = requestAnimationFrame(animate);
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isRotating && !mouseState.current.isDown && itemGroupRef.current) {
        itemGroupRef.current.rotation.y += 0.008;
      }

      if (secondHandRef.current) {
        secondHandRef.current.rotation.z -= delta * (Math.PI * 2 / 60);
      }
      if (tourbillonRef.current) {
        tourbillonRef.current.rotation.z += delta * 4.0;
      }

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
  }, [isRotating, isWearingOnWrist, item, jCfg]);

  return (
    <div className="fixed inset-0 z-50 bg-[#090b10] select-none overflow-hidden animate-fadeIn" style={{ width: '100vw', height: '100vh' }}>
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-sm">Thoát Chiêm Ngưỡng</span>
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
              Xuất xứ: {item.locationOrOrigin || 'Thụy Sĩ / Việt Nam'} • Chế tác thủ công độc bản
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setShowCertificate(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 backdrop-blur-md transition-all text-xs font-semibold"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Chứng Thư Giám Định</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setIsWearingOnWrist(!isWearingOnWrist);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border backdrop-blur-md transition-all text-xs font-semibold ${
              isWearingOnWrist 
                ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-lg' 
                : 'bg-slate-900/80 text-slate-200 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{isWearingOnWrist ? 'Tháo Khỏi Cổ Tay' : 'Đeo Thử Lên Tay'}</span>
          </button>

          <button
            onClick={() => soundManager.playSparkle()}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-400 border border-slate-700/60 backdrop-blur-md transition-all"
            title="Phát tia sáng lấp lánh"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Specifications Overlay */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-none max-w-sm">
        <div className="p-5 rounded-2xl glass-panel border border-slate-700/70 shadow-2xl backdrop-blur-xl space-y-3">
          <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Thông Số Kỹ Thuật & Giám Định</span>
          </h3>
          <div className="space-y-1.5 text-xs">
            {Object.entries(item.specs).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4">
                <span className="text-slate-400">{key}:</span>
                <span className="font-semibold text-slate-200 text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-[#18181b] to-[#09090b] border-2 border-amber-500/50 rounded-3xl p-6 md:p-8 text-slate-100 shadow-2xl space-y-6">
            <div className="text-center space-y-2 border-b border-amber-500/20 pb-4">
              <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 mb-1">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-black font-luxury text-amber-400 tracking-wider">
                CHỨNG THƯ GIÁM ĐỊNH KIM HOÀN QUỐC TẾ
              </h3>
              <p className="text-xs text-amber-200/70 font-mono tracking-widest">
                GIA / SJC GEMOLOGICAL INSTITUTE CERTIFICATION
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Tác Phẩm:</span>
                <span className="font-bold text-white text-right">{item.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Mã Số Giám Định:</span>
                <span className="font-mono text-amber-400">GIA-2026-VVIP-{item.id.toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Độ Tinh Khiết / Chất Liệu:</span>
                <span className="font-bold text-emerald-400">Chuẩn 100% Hoàn Hảo (Top 0.01% Thế Giới)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Định Giá Thị Trường:</span>
                <span className="font-bold text-amber-400">
                  {currency === 'USD' ? `$${item.priceUsd.toLocaleString()}` : `${item.priceVnd.toLocaleString('vi-VN')} ₫`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-5 h-5" />
                <span>Bảo Chứng Vĩnh Viễn Toàn Cầu</span>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowCertificate(false);
                }}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-sm shadow-lg transition-all"
              >
                Xác Nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
