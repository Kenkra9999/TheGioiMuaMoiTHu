import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { LuxuryItem } from '../../data/items';
import { soundManager } from '../../utils/audio';
import { 
  ArrowLeft, RotateCw, 
  Sun, Layers, Palette, Play, Key, Info, Home, Sparkles
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
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth || window.innerWidth || 1280;
    const height = containerRef.current.clientHeight || window.innerHeight || 720;

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
      orbitState.current.distance = 18.0;
      orbitState.current.targetDistance = 18.0;
    } else if (item.category === 'aviation-marine') {
      orbitState.current.distance = 16.0;
      orbitState.current.targetDistance = 16.0;
    } else if (item.category === 'jewelry-gold') {
      orbitState.current.distance = 4.8;
      orbitState.current.targetDistance = 4.8;
    } else {
      orbitState.current.distance = 8.0;
      orbitState.current.targetDistance = 8.0;
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

    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);

    // 4. Multi-Directional High Clarity Studio Lighting (No pitch-black spots!)
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

      orbitState.current.rotY += dx * 0.008;
      orbitState.current.rotX = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, orbitState.current.rotX + dy * 0.008));
    };

    const onPointerUp = () => {
      orbitState.current.isDown = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const minD = item.category === 'jewelry-gold' ? 1.8 : item.category === 'real-estate' ? 5.0 : 2.5;
      const maxD = item.category === 'real-estate' ? 40.0 : 25.0;
      orbitState.current.targetDistance = Math.max(minD, Math.min(maxD, orbitState.current.targetDistance + e.deltaY * 0.008));
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // 8. Resize Handler
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

    // 9. Animation Loop
    let lastTime = performance.now();

    const animate = (time: number) => {
      animFrameId.current = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const state = orbitState.current;

      if (isAutoRotate && !state.isDown) {
        state.rotY += delta * 0.28;
      }

      state.distance = THREE.MathUtils.lerp(state.distance, state.targetDistance, 0.1);

      const cx = state.distance * Math.sin(state.rotY) * Math.cos(state.rotX);
      const cy = state.distance * Math.sin(state.rotX);
      const cz = state.distance * Math.cos(state.rotY) * Math.cos(state.rotX);

      camera.position.set(cx, cy, cz);
      const targetLookY = item.category === 'real-estate' ? 2.5 : 0;
      camera.lookAt(0, targetLookY, 0);

      // Sub part animations
      animatedPartsRef.current.forEach((part) => {
        if (part.name === 'tourbillon') {
          part.rotation.z += delta * 3.5;
        } else if (part.name === 'rotor') {
          part.rotation.y += delta * 10.0;
        } else if (part.name === 'fountain') {
          part.rotation.y += delta * 1.5;
        }
      });

      renderer.render(scene, camera);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [item, lightingPreset, selectedColor, isAutoRotate, isOpenParts]);

  // Bright, Balanced Multi-Directional Lighting Studio
  function setupStudioLighting(scene: THREE.Scene, preset: StudioLightingPreset) {
    // 1. Omnidirectional Hemisphere Light (Eliminates pitch-black undersides & crevices)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x64748b, 2.8);
    scene.add(hemiLight);

    // 2. Ambient Light for overall minimum brightness
    const amb = new THREE.AmbientLight(0xffffff, preset === 'studio-white' ? 2.5 : 1.8);
    scene.add(amb);

    if (preset === 'royal-gold') {
      const spotMain = new THREE.SpotLight(0xfef08a, 6.5, 60, Math.PI / 3, 0.25);
      spotMain.position.set(14, 18, 14);
      spotMain.castShadow = true;
      scene.add(spotMain);

      const spotFill = new THREE.SpotLight(0x93c5fd, 4.5, 60, Math.PI / 3, 0.3);
      spotFill.position.set(-14, 12, -14);
      scene.add(spotFill);

      const warmRim = new THREE.DirectionalLight(0xf59e0b, 3.5);
      warmRim.position.set(0, 20, -15);
      scene.add(warmRim);

      const floorBounce = new THREE.DirectionalLight(0xffedd5, 2.0);
      floorBounce.position.set(0, -10, 5);
      scene.add(floorBounce);

    } else if (preset === 'neon-cyber') {
      const spotCyan = new THREE.SpotLight(0x06b6d4, 8.0, 50, Math.PI / 3, 0.2);
      spotCyan.position.set(14, 16, 10);
      scene.add(spotCyan);

      const spotPink = new THREE.SpotLight(0xf43f5e, 8.0, 50, Math.PI / 3, 0.2);
      spotPink.position.set(-14, 14, -10);
      scene.add(spotPink);

      const topGlow = new THREE.DirectionalLight(0x818cf8, 4.0);
      topGlow.position.set(0, 22, 0);
      scene.add(topGlow);

    } else if (preset === 'golden-sunset') {
      const sun = new THREE.DirectionalLight(0xf97316, 6.5);
      sun.position.set(18, 16, 14);
      sun.castShadow = true;
      scene.add(sun);

      const fill = new THREE.SpotLight(0xfb7185, 4.5, 50);
      fill.position.set(-14, 10, -14);
      scene.add(fill);

      const warmHaze = new THREE.AmbientLight(0xffedd5, 2.0);
      scene.add(warmHaze);

    } else if (preset === 'diamond-crystal') {
      [
        [12, 16, 12, 0x38bdf8],
        [-12, 16, -12, 0xc084fc],
        [12, 10, -12, 0xf472b6],
        [-12, 10, 12, 0xfacc15]
      ].forEach(([x, y, z, col]) => {
        const spot = new THREE.SpotLight(col as number, 5.0, 50, Math.PI / 4, 0.2);
        spot.position.set(x as number, y as number, z as number);
        scene.add(spot);
      });

    } else {
      // Pure White Studio
      const key = new THREE.DirectionalLight(0xffffff, 4.0);
      key.position.set(16, 26, 20);
      key.castShadow = true;
      scene.add(key);

      const fill = new THREE.DirectionalLight(0xf1f5f9, 3.0);
      fill.position.set(-16, 16, -20);
      scene.add(fill);

      const bottomLight = new THREE.DirectionalLight(0xffffff, 2.5);
      bottomLight.position.set(0, -15, 0);
      scene.add(bottomLight);
    }
  }

  // Studio Pedestal / Showroom Floor
  function setupStudioFloor(scene: THREE.Scene, preset: StudioLightingPreset, isRealEstate: boolean) {
    const isWhite = preset === 'studio-white';
    const floorRadius = isRealEstate ? 28 : 16;
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
    openParts: boolean,
    animParts: THREE.Object3D[]
  ) {
    const primaryColor = customColor ? new THREE.Color(customColor) : new THREE.Color(item.vehicleConfig?.color || '#0284c7');

    if (item.category === 'real-estate') {
      // =========================================================================
      // ==================== BẤT ĐỘNG SẢN & BIỆT THỰ & PENTHOUSE ====================
      // =========================================================================
      const isLandmarkOrNY = item.id.includes('landmark') || item.id.includes('manhattan');
      const isClassicManor = item.id.includes('riverside') || item.houseConfig?.style === 'classic-manor';
      const isMetropole = item.id.includes('metropole');
      const isPineVilla = item.id.includes('dalat');

      if (isLandmarkOrNY) {
        // ==================== 1. LANDMARK 81 & MANHATTAN SKY VILLA PENTHOUSE ====================
        const towerGroup = new THREE.Group();
        group.add(towerGroup);

        // Tower Base Stepped Monoliths
        const glassCurtainMat = new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          emissive: 0x0369a1,
          emissiveIntensity: 0.25,
          metalness: 0.95,
          roughness: 0.08,
          transparent: true,
          opacity: 0.88
        });
        const steelFrameMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.1 });
        const warmRoomGlowMat = new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xfde047,
          emissiveIntensity: 0.6,
          roughness: 0.2
        });

        // 4 Clustered Tiered Skyscrapers of varying heights (Landmark 81 Architecture)
        const towerTiers = [
          { w: 4.2, d: 4.2, h: 5.5, x: -1.8, z: -1.8 },
          { w: 4.2, d: 4.2, h: 7.0, x: 1.8, z: -1.8 },
          { w: 4.2, d: 4.2, h: 6.2, x: -1.8, z: 1.8 },
          { w: 4.8, d: 4.8, h: 9.5, x: 1.2, z: 1.2 } // Tallest central tower
        ];

        towerTiers.forEach(tier => {
          const tMesh = new THREE.Mesh(new THREE.BoxGeometry(tier.w, tier.h, tier.d), glassCurtainMat);
          tMesh.position.set(tier.x, tier.h / 2, tier.z);
          towerGroup.add(tMesh);

          // Steel floor slabs & mullion grid
          for (let fy = 1.0; fy < tier.h; fy += 1.2) {
            const slab = new THREE.Mesh(new THREE.BoxGeometry(tier.w + 0.1, 0.15, tier.d + 0.1), steelFrameMat);
            slab.position.set(tier.x, fy, tier.z);
            towerGroup.add(slab);
          }

          // Illuminated Penthouse Suites inside
          const litRoom = new THREE.Mesh(new THREE.BoxGeometry(tier.w * 0.7, 0.8, tier.d * 0.7), warmRoomGlowMat);
          litRoom.position.set(tier.x, tier.h - 1.2, tier.z);
          towerGroup.add(litRoom);
        });

        // Top Crown Spire (Landmark 81 iconic top)
        const spireBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 1.2, 4.0, 16), steelFrameMat);
        spireBase.position.set(1.2, 11.5, 1.2);
        towerGroup.add(spireBase);

        const spireAntenna = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 5.0, 16), steelFrameMat);
        spireAntenna.position.set(1.2, 15.5, 1.2);
        towerGroup.add(spireAntenna);

        const beaconTip = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
        beaconTip.position.set(1.2, 18.1, 1.2);
        towerGroup.add(beaconTip);

        // Sky Pool on Cantilevered Terrace (Tier 3)
        const poolDeck = new THREE.Mesh(
          new THREE.BoxGeometry(5.0, 0.4, 4.0), 
          new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 })
        );
        poolDeck.position.set(-1.8, 6.4, 1.8);
        towerGroup.add(poolDeck);

        const poolWater = new THREE.Mesh(
          new THREE.BoxGeometry(4.2, 0.2, 3.2), 
          new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.5, roughness: 0.05, transparent: true, opacity: 0.9 })
        );
        poolWater.position.set(-1.8, 6.6, 1.8);
        towerGroup.add(poolWater);

        // Glass balcony railing for pool
        const poolRailing = new THREE.Mesh(
          new THREE.BoxGeometry(4.8, 0.9, 3.8), 
          new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, wireframe: true })
        );
        poolRailing.position.set(-1.8, 7.0, 1.8);
        towerGroup.add(poolRailing);

        // Rooftop Helipad with Luxury Helicopter (Tier 2)
        const helipad = new THREE.Mesh(
          new THREE.CylinderGeometry(2.4, 2.4, 0.25, 32), 
          new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
        );
        helipad.position.set(1.8, 7.2, -1.8);
        towerGroup.add(helipad);

        const hMark = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.8, 32), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
        hMark.rotation.x = -Math.PI / 2;
        hMark.position.set(1.8, 7.35, -1.8);
        towerGroup.add(hMark);

        // Helicopter on Helipad
        const heliBody = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.75, 2.0), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 }));
        heliBody.position.set(1.8, 7.9, -1.8);
        towerGroup.add(heliBody);

        const heliRotor = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.04, 0.2), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
        heliRotor.name = 'rotor';
        heliRotor.position.set(1.8, 8.4, -1.8);
        towerGroup.add(heliRotor);
        animParts.push(heliRotor);

      } else if (isMetropole) {
        // ==================== 2. THE METROPOLE THỦ THIÊM SUITE ====================
        const condoGroup = new THREE.Group();
        group.add(condoGroup);

        const facadeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.15 });
        const bronzeLouverMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 });
        const glassMat = new THREE.MeshStandardMaterial({ 
          color: 0x0284c7, 
          emissive: 0xfde047, 
          emissiveIntensity: 0.4, 
          roughness: 0.05, 
          transparent: true, 
          opacity: 0.85 
        });

        // 4-Floor Staggered Luxury Condominium Tower
        for (let floor = 0; floor < 4; floor++) {
          const y = floor * 2.2 + 1.1;

          // Main Suite Living Space
          const suite = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1.9, 6.0), glassMat);
          suite.position.set(0, y, 0);
          condoGroup.add(suite);

          // Floor Slabs
          const slab = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.3, 7.5), facadeMat);
          slab.position.set(0, y - 0.95, 0.5);
          condoGroup.add(slab);

          // Balcony with Glass Balustrade & Vertical Gardens
          const balcGlass = new THREE.Mesh(
            new THREE.BoxGeometry(8.8, 0.8, 0.08), 
            new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 })
          );
          balcGlass.position.set(0, y - 0.45, 4.2);
          condoGroup.add(balcGlass);

          // Green Planter Boxes on Balconies
          for (let px = -3.5; px <= 3.5; px += 1.4) {
            const shrub = new THREE.Mesh(
              new THREE.SphereGeometry(0.35, 12, 12), 
              new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 })
            );
            shrub.position.set(px, y - 0.5, 3.8);
            condoGroup.add(shrub);
          }

          // Architectural Bronze Sun Louvers on side
          for (let lz = -2.0; lz <= 2.0; lz += 0.8) {
            const louver = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 0.4), bronzeLouverMat);
            louver.position.set(4.35, y, lz);
            condoGroup.add(louver);
          }
        }

        // Rooftop Sky Garden & Jacuzzi
        const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.4, 7.5), facadeMat);
        roofSlab.position.y = 9.8;
        condoGroup.add(roofSlab);

        const jacuzzi = new THREE.Mesh(
          new THREE.CylinderGeometry(1.8, 1.8, 0.35, 24), 
          new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.6 })
        );
        jacuzzi.position.set(0, 10.1, 0);
        condoGroup.add(jacuzzi);

      } else if (isClassicManor) {
        // ==================== 3. VINHOMES RIVERSIDE ROYAL MANOR ====================
        const manorGroup = new THREE.Group();
        group.add(manorGroup);

        const sandstoneMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.25 }); // French Cream Stone
        const mansardMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35 }); // Dark Slate Roof
        const goldAccentMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.98, roughness: 0.08 });

        // Central Symmetrical Grand Palace Body
        const mainBuilding = new THREE.Mesh(new THREE.BoxGeometry(9.5, 3.6, 6.0), sandstoneMat);
        mainBuilding.position.y = 1.8;
        manorGroup.add(mainBuilding);

        // Side Wings (Left & Right)
        [-5.8, 5.8].forEach(wx => {
          const wing = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.0, 5.0), sandstoneMat);
          wing.position.set(wx, 1.5, -0.5);
          manorGroup.add(wing);

          const wingRoof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 2.0, 4), mansardMat);
          wingRoof.rotation.y = Math.PI / 4;
          wingRoof.position.set(wx, 4.0, -0.5);
          manorGroup.add(wingRoof);
        });

        // Classical Mansard Roof with Dormer Windows
        const roof = new THREE.Mesh(new THREE.ConeGeometry(6.8, 3.0, 4), mansardMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.set(0, 5.1, 0);
        manorGroup.add(roof);

        // Grand Corinthian Entrance Portico with 6 Marble Columns
        [-2.4, -1.4, -0.5, 0.5, 1.4, 2.4].forEach(cx => {
          const column = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.22, 3.6, 16), 
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15 })
          );
          column.position.set(cx, 1.8, 3.2);
          manorGroup.add(column);
        });

        // Classical Triangular Pediment
        const pediment = new THREE.Mesh(
          new THREE.ConeGeometry(3.2, 1.2, 4), 
          sandstoneMat
        );
        pediment.rotation.y = Math.PI / 4;
        pediment.position.set(0, 4.2, 3.2);
        manorGroup.add(pediment);

        // Royal Golden Balcony
        const balcony = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.3, 1.4), sandstoneMat);
        balcony.position.set(0, 3.6, 3.2);
        manorGroup.add(balcony);

        const goldRailing = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.8, 0.08), goldAccentMat);
        goldRailing.position.set(0, 4.15, 3.85);
        manorGroup.add(goldRailing);

        // Glowing Arched Windows revealing Golden Chandeliers inside
        const archedGlassMat = new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xfbbf24,
          emissiveIntensity: 0.65,
          roughness: 0.1
        });
        const grandWindow = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.6), archedGlassMat);
        grandWindow.position.set(0, 2.2, 3.02);
        manorGroup.add(grandWindow);

        // Front Courtyard Marble Fountain with cascading water
        const fountainBase = new THREE.Mesh(
          new THREE.CylinderGeometry(2.0, 2.2, 0.45, 32), 
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15 })
        );
        fountainBase.position.set(0, 0.22, 6.8);
        manorGroup.add(fountainBase);

        const fountainWater = new THREE.Mesh(
          new THREE.CylinderGeometry(1.8, 1.8, 0.2, 32), 
          new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.5 })
        );
        fountainWater.position.set(0, 0.38, 6.8);
        fountainWater.name = 'fountain';
        manorGroup.add(fountainWater);
        animParts.push(fountainWater);

      } else if (isPineVilla) {
        // ==================== 4. BIỆT THỰ ĐỒI THÔNG ĐÀ LẠT ====================
        const pineGroup = new THREE.Group();
        group.add(pineGroup);

        const timberMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
        const darkRoofMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.35 });
        const fieldstoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });

        // Rustic Fieldstone Foundation
        const foundation = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.8, 6.0), fieldstoneMat);
        foundation.position.y = 0.4;
        pineGroup.add(foundation);

        // Timber Chalet Main Structure
        const chaletBody = new THREE.Mesh(new THREE.BoxGeometry(7.5, 3.0, 5.5), timberMat);
        chaletBody.position.y = 2.2;
        pineGroup.add(chaletBody);

        // High-Pitched Alpine A-Frame Roof
        const roof = new THREE.Mesh(new THREE.ConeGeometry(5.8, 3.6, 4), darkRoofMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.set(0, 4.8, 0);
        pineGroup.add(roof);

        // Stone Chimney with Warm Glow
        const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.0, 5.8, 1.0), fieldstoneMat);
        chimney.position.set(2.8, 3.2, -1.8);
        pineGroup.add(chimney);

        // Large Floor-To-Ceiling Triangular Great Room Windows
        const warmGlass = new THREE.Mesh(
          new THREE.PlaneGeometry(3.6, 2.5), 
          new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.7 })
        );
        warmGlass.position.set(0, 2.2, 2.76);
        pineGroup.add(warmGlass);

        // Wooden Wraparound Deck with Firepit
        const deck = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.3, 4.0), timberMat);
        deck.position.set(0, 0.75, 4.5);
        pineGroup.add(deck);

        // 6 Surrounding Dense Pine Trees
        [
          [-5.5, 2.0, 3.0], [5.5, 2.0, 2.5], 
          [-4.8, 2.0, -3.5], [4.8, 2.0, -3.8],
          [-6.5, 2.0, 0.0], [6.5, 2.0, 0.0]
        ].forEach(([tx, ty, tz]) => {
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.6), timberMat);
          trunk.position.set(tx, 0.8, tz);
          pineGroup.add(trunk);

          const foliage = new THREE.Mesh(
            new THREE.ConeGeometry(1.5, 3.8, 8), 
            new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.9 })
          );
          foliage.position.set(tx, 2.8, tz);
          pineGroup.add(foliage);
        });

      } else {
        // ==================== 5. THẢO ĐIỀN & BEVERLY HILLS ULTRA-MODERN VILLA ====================
        const villaGroup = new THREE.Group();
        group.add(villaGroup);

        const whiteStuccoMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.15 });
        const teakWoodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.5 });
        const poolWaterMat = new THREE.MeshStandardMaterial({ 
          color: 0x06b6d4, 
          emissive: 0x0284c7, 
          emissiveIntensity: 0.5, 
          roughness: 0.05, 
          transparent: true, 
          opacity: 0.88 
        });

        // 1st Floor Living Lounge & Open Kitchen
        const groundFloor = new THREE.Mesh(new THREE.BoxGeometry(9.0, 2.4, 5.5), whiteStuccoMat);
        groundFloor.position.set(0, 1.2, 0);
        villaGroup.add(groundFloor);

        // Glowing Panoramic Floor-to-Ceiling Glass Doors
        const groundGlass = new THREE.Mesh(
          new THREE.PlaneGeometry(7.5, 2.0), 
          new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0xfde047, emissiveIntensity: 0.45 })
        );
        groundGlass.position.set(0, 1.2, 2.76);
        villaGroup.add(groundGlass);

        // Cantilevered 2nd Floor Master Suite Block
        const upperFloor = new THREE.Mesh(new THREE.BoxGeometry(8.0, 2.2, 6.8), whiteStuccoMat);
        upperFloor.position.set(-1.0, 3.4, 0.8);
        villaGroup.add(upperFloor);

        // Teak Wood Vertical Sun Louvers
        for (let lx = 0.8; lx <= 2.6; lx += 0.35) {
          const louver = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.0, 0.5), teakWoodMat);
          louver.position.set(lx, 3.4, 4.25);
          villaGroup.add(louver);
        }

        // L-Shaped Infinity Swimming Pool & Sun Deck
        const poolDeck = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.35, 4.8), new THREE.MeshStandardMaterial({ color: 0x451a03 }));
        poolDeck.position.set(0, 0.18, 5.0);
        villaGroup.add(poolDeck);

        const poolWater = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.18, 3.6), poolWaterMat);
        poolWater.position.set(0, 0.35, 5.0);
        villaGroup.add(poolWater);

        // Glass Garage Showcasing Red Supercar inside
        const garageGlass = new THREE.Mesh(
          new THREE.BoxGeometry(3.5, 2.0, 3.0), 
          new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.35 })
        );
        garageGlass.position.set(4.5, 1.1, -0.8);
        villaGroup.add(garageGlass);

        const garageCar = new THREE.Mesh(
          new THREE.BoxGeometry(1.8, 0.6, 2.6), 
          new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.95, roughness: 0.1 })
        );
        garageCar.position.set(4.5, 0.5, -0.8);
        villaGroup.add(garageCar);

        // Tropical Palm Trees
        [[-5.8, 0, 4.5], [5.8, 0, 4.5]].forEach(([px, py, pz]) => {
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 3.5, 8), new THREE.MeshStandardMaterial({ color: 0x78350f }));
          trunk.position.set(px, 1.75, pz);
          trunk.rotation.z = px < 0 ? -0.15 : 0.15;
          villaGroup.add(trunk);

          const fronds = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 8), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
          fronds.position.set(px, 3.6, pz);
          fronds.scale.set(1.6, 0.4, 1.6);
          villaGroup.add(fronds);
        });
      }

    } else if (item.category === 'supercars') {
      // ==================== SUPERCARS & HYPERCARS ====================
      const isTruck = item.id.includes('cybertruck');
      const isSedan = item.id.includes('rolls');
      const isJesko = item.id.includes('jesko');
      const isPorsche = item.id.includes('porsche');

      const bodyGeo = isTruck 
        ? new THREE.BoxGeometry(2.2, 1.1, 4.9) 
        : isSedan 
        ? new THREE.BoxGeometry(2.1, 0.9, 4.8) 
        : new THREE.BoxGeometry(2.0, 0.62, 4.5);

      const bodyMat = new THREE.MeshStandardMaterial({
        color: isTruck ? (customColor ? primaryColor : new THREE.Color(0xd1d5db)) : primaryColor,
        metalness: 0.92,
        roughness: 0.12,
      });
      const carBody = new THREE.Mesh(bodyGeo, bodyMat);
      carBody.position.y = 0;
      carBody.castShadow = true;
      group.add(carBody);

      // Cabin Glass
      const cabinGeo = isTruck ? new THREE.ConeGeometry(1.65, 1.0, 4) : new THREE.BoxGeometry(1.55, 0.55, 2.2);
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x090d16,
        metalness: 0.95,
        roughness: 0.05,
        transparent: true,
        opacity: 0.75
      });
      const cabin = new THREE.Mesh(cabinGeo, glassMat);
      cabin.position.set(0, 0.52, -0.15);
      group.add(cabin);

      // Scissor Doors
      if (!isTruck && !isSedan) {
        [-0.95, 0.95].forEach((doorX, idx) => {
          const doorPivot = new THREE.Group();
          doorPivot.position.set(doorX, 0.2, 0.5);
          group.add(doorPivot);

          const door = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 1.2), bodyMat);
          door.position.set(0, 0, -0.5);
          doorPivot.add(door);

          if (openParts) {
            doorPivot.rotation.x = -Math.PI / 4;
            doorPivot.rotation.y = (idx === 0 ? -1 : 1) * Math.PI / 3;
          }
        });
      }

      // GT Rear Wing
      if (!isTruck && !isSedan) {
        const wingGeo = new THREE.BoxGeometry(isJesko || isPorsche ? 2.2 : 1.85, 0.06, 0.45);
        const wingMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95, roughness: 0.1 });
        const wing = new THREE.Mesh(wingGeo, wingMat);
        wing.position.set(0, isPorsche ? 0.85 : 0.65, -2.05);
        group.add(wing);
      }

      // Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 32);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.8 });
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
      const rimGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.32, 16);

      [
        [-1.0, -0.25, 1.45],
        [1.0, -0.25, 1.45],
        [-1.0, -0.25, -1.45],
        [1.0, -0.25, -1.45],
      ].forEach(([wx, wy, wz]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, wy, wz);
        const rim = new THREE.Mesh(rimGeo, rimMat);
        wheel.add(rim);
        group.add(wheel);
      });

    } else if (item.category === 'motorbikes') {
      // ==================== MOTORBIKES ====================
      const isDucati = item.id.includes('ducati') || item.id.includes('ninja');
      const isVespa = item.id.includes('vespa');

      const frameGeo = new THREE.BoxGeometry(0.35, 0.6, 1.8);
      const frameMat = new THREE.MeshStandardMaterial({
        color: customColor ? primaryColor : isDucati ? new THREE.Color(0xdc2626) : isVespa ? new THREE.Color(0xfef08a) : primaryColor,
        metalness: 0.85,
        roughness: 0.2
      });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.set(0, 0, 0);
      group.add(frame);

      const tankGeo = isDucati ? new THREE.ConeGeometry(0.42, 1.2, 8) : new THREE.BoxGeometry(0.4, 0.38, 0.9);
      const tank = new THREE.Mesh(tankGeo, frameMat);
      tank.rotation.x = Math.PI / 2;
      tank.position.set(0, 0.35, 0.2);
      group.add(tank);

      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.12, 0.85), 
        new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 })
      );
      seat.position.set(0, 0.32, -0.4);
      group.add(seat);

      if (item.id.includes('wave')) {
        const basket = new THREE.Mesh(
          new THREE.BoxGeometry(0.45, 0.3, 0.35), 
          new THREE.MeshStandardMaterial({ color: 0x1e293b, wireframe: true })
        );
        basket.position.set(0, 0.25, 0.9);
        group.add(basket);
      }

      const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.14, 32);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.85 });
      const rimGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 16);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.15 });

      [0.9, -0.9].forEach(wz => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(0, -0.28, wz);
        const rim = new THREE.Mesh(rimGeo, rimMat);
        wheel.add(rim);
        group.add(wheel);
      });

    } else if (item.category === 'jewelry-gold') {
      // ==================== JEWELRY & GOLD ====================
      const isGoldBar = item.id.includes('gold-1kg');
      const isWatch = item.jewelryConfig?.type === 'watch';

      if (isGoldBar) {
        const barGeo = new THREE.BoxGeometry(3.2, 0.7, 1.8);
        const goldMat = new THREE.MeshStandardMaterial({
          color: customColor ? primaryColor : new THREE.Color(0xf59e0b),
          metalness: 0.99,
          roughness: 0.06,
        });
        const bar = new THREE.Mesh(barGeo, goldMat);
        group.add(bar);

        const seal = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32), 
          new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.99, roughness: 0.05 })
        );
        seal.position.set(0, 0.36, 0);
        group.add(seal);

      } else if (isWatch) {
        const caseMat = new THREE.MeshStandardMaterial({
          color: customColor ? primaryColor : item.id.includes('patek') ? new THREE.Color(0xe2e8f0) : new THREE.Color(0xf59e0b),
          metalness: 0.95,
          roughness: 0.1
        });
        const watchCase = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.35, 48), caseMat);
        watchCase.rotation.x = Math.PI / 2;
        group.add(watchCase);

        const dial = new THREE.Mesh(
          new THREE.CircleGeometry(1.0, 48), 
          new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.8, roughness: 0.2 })
        );
        dial.position.z = 0.18;
        group.add(dial);

        const tourbillon = new THREE.Mesh(
          new THREE.RingGeometry(0.18, 0.35, 24), 
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.98 })
        );
        tourbillon.name = 'tourbillon';
        tourbillon.position.set(0, -0.4, 0.19);
        group.add(tourbillon);
        animParts.push(tourbillon);

        [-1.8, 1.8].forEach(sy => {
          const strap = new THREE.Mesh(
            new THREE.BoxGeometry(0.9, 1.4, 0.18), 
            new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 })
          );
          strap.position.set(0, sy, 0);
          group.add(strap);
        });

      } else {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(1.1, 0.14, 24, 64), 
          new THREE.MeshStandardMaterial({ color: customColor ? primaryColor : new THREE.Color(0xe2e8f0), metalness: 0.98, roughness: 0.05 })
        );
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
      // ==================== AVIATION & MARINE ====================
      const isJet = item.id.includes('gulfstream');

      if (isJet) {
        const jetMat = new THREE.MeshStandardMaterial({
          color: customColor ? primaryColor : new THREE.Color(0xffffff),
          metalness: 0.9,
          roughness: 0.15
        });
        const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 7.5, 32), jetMat);
        fuselage.rotation.x = Math.PI / 2;
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
        const hullMat = new THREE.MeshStandardMaterial({
          color: customColor ? primaryColor : new THREE.Color(0xf59e0b),
          metalness: 0.95,
          roughness: 0.1
        });
        const hull = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.4, 9.5), hullMat);
        group.add(hull);

        const cabin = new THREE.Mesh(
          new THREE.BoxGeometry(2.5, 1.1, 5.0), 
          new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 })
        );
        cabin.position.set(0, 1.0, -0.5);
        group.add(cabin);

        const rotor = new THREE.Mesh(
          new THREE.BoxGeometry(3.0, 0.04, 0.2), 
          new THREE.MeshStandardMaterial({ color: 0xd4d4d8 })
        );
        rotor.name = 'rotor';
        rotor.position.set(0, 1.2, -3.5);
        group.add(rotor);
        animParts.push(rotor);
      }
    }
  }

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
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md transition-all shadow-lg hover:scale-105 active:scale-95"
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
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-slate-700/60 backdrop-blur-md transition-all text-xs font-bold"
          >
            <Info className="w-4 h-4" />
            <span>Hồ Sơ Chi Tiết</span>
          </button>
        </div>
      </div>

      {/* Left Floating Studio Toolbar */}
      <div className="absolute left-6 top-24 z-20 space-y-3 pointer-events-auto">
        
        {/* Lighting Studio Presets */}
        <div className="p-3.5 rounded-2xl glass-panel border border-slate-700/80 backdrop-blur-xl space-y-2 max-w-[200px]">
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" /> Ánh Sáng Studio
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { id: 'royal-gold', label: '👑 Hoàng Gia' },
              { id: 'neon-cyber', label: '🏙️ Cyber Neon' },
              { id: 'golden-sunset', label: '☀️ Hoàng Hôn' },
              { id: 'diamond-crystal', label: '💎 Kim Cương' },
              { id: 'studio-white', label: '⚪ Studio Trắng' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => {
                  soundManager.playClick();
                  setLightingPreset(p.id as StudioLightingPreset);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold text-left transition-all ${
                  lightingPreset === p.id 
                    ? 'bg-amber-500 text-black font-bold shadow-md' 
                    : 'bg-slate-900/90 text-slate-200 hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette Switcher */}
        <div className="p-3.5 rounded-2xl glass-panel border border-slate-700/80 backdrop-blur-xl space-y-2 max-w-[200px]">
          <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-cyan-400" /> Tùy Chỉnh Màu Sắc
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {COLOR_PRESETS.map((c, i) => (
              <button
                key={i}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedColor(c.hex);
                }}
                className={`w-8 h-8 rounded-lg border transition-all ${
                  (c.hex === null && selectedColor === null) || selectedColor === c.hex
                    ? 'border-amber-400 scale-110 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                    : 'border-slate-700 hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex || item.vehicleConfig?.color || '#0284c7' }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Action Toggle (Auto Rotate & Open Doors) */}
        <div className="p-3.5 rounded-2xl glass-panel border border-slate-700/80 backdrop-blur-xl space-y-2 max-w-[200px]">
          <button
            onClick={() => {
              soundManager.playClick();
              setIsAutoRotate(!isAutoRotate);
            }}
            className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              isAutoRotate ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-300'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} />
            <span>{isAutoRotate ? 'Tự Động Xoay: BẬT' : 'Tự Động Xoay: TẮT'}</span>
          </button>

          {item.category === 'supercars' && (
            <button
              onClick={() => {
                soundManager.playClick();
                setIsOpenParts(!isOpenParts);
              }}
              className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                isOpenParts ? 'bg-amber-500 text-black font-extrabold' : 'bg-slate-900 text-slate-300 border border-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isOpenParts ? 'Đóng Cửa Xe' : 'Mở Cửa Cắt Kéo'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Floating Price & CTA Panel */}
      <div className="absolute bottom-6 left-6 right-6 z-20 pointer-events-none flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left: Price card */}
        <div className="pointer-events-auto p-4 rounded-2xl glass-panel border border-slate-700/80 shadow-2xl backdrop-blur-xl flex items-center gap-5">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Giá Sở Hữu Niêm Yết</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">
              {formattedPrice(item.priceUsd, item.priceVnd)}
            </div>
            <div className="text-xs text-slate-300 font-mono">
              {item.locationOrOrigin || 'Bảo chứng tài phiệt quốc tế'}
            </div>
          </div>
        </div>

        {/* Right: Launch Simulator & Buy Buttons */}
        <div className="pointer-events-auto flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
              onLaunchSimulator(item);
            }}
            className="flex-1 sm:flex-initial px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>
              {item.category === 'supercars' || item.category === 'motorbikes' ? 'Lái Thử Xe Thực Tế' :
               item.category === 'real-estate' ? 'Đi Vào Tham Quan Nhà' :
               item.category === 'jewelry-gold' ? 'Đeo Thử & Khám Phá' : 'Lái Du Thuyền'}
            </span>
          </button>

          <button
            onClick={() => {
              onBuy(item);
            }}
            disabled={!canAfford}
            className={`flex-1 sm:flex-initial px-6 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all ${
              canAfford
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-amber-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>{canAfford ? 'MUA NGAY' : 'CHƯA ĐỦ TIỀN'}</span>
          </button>
        </div>
      </div>

      {/* Full Specs Modal Overlay */}
      {showSpecsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl glass-panel border border-slate-700 max-w-lg w-full space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Home className="w-5 h-5 text-amber-400" />
                <span>Hồ Sơ Kỹ Thuật & Giám Định</span>
              </h3>
              <button
                onClick={() => setShowSpecsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {item.description}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {Object.entries(item.specs).map(([k, v]) => (
                <div key={k} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{k}</span>
                  <span className="text-xs font-bold text-amber-300">{v}</span>
                </div>
              ))}
            </div>

            <div className="pt-3">
              <button
                onClick={() => setShowSpecsModal(false)}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs"
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
