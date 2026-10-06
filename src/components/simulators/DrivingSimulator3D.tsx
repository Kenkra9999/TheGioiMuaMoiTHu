import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { LuxuryItem } from '../../data/items';
import { soundManager, VehicleAudioEngine } from '../../utils/audio';
import { 
  Volume2, VolumeX, Eye, Zap, Flame, 
  ArrowLeft, Compass, AlertCircle, Sparkles
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
  const [dayNight, setDayNight] = useState<'night' | 'sunset' | 'day'>('night');

  const engineRef = useRef<VehicleAudioEngine | null>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const animFrameId = useRef<number | null>(null);

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
  const vehicleMeshRef = useRef<THREE.Group | null>(null);
  const frontWheelsGroupRef = useRef<THREE.Group[]>([]);
  const spinningWheelsRef = useRef<THREE.Mesh[]>([]);
  const brakeLightsRef = useRef<THREE.Mesh[]>([]);
  const nitroParticlesRef = useRef<THREE.Points | null>(null);
  const tireSmokeParticlesRef = useRef<THREE.Points | null>(null);
  const sceneryGroupRef = useRef<THREE.Group | null>(null);

  // Vehicle state
  const stateRef = useRef({
    currentSpeed: 30, // Start rolling smoothly
    maxSpeed: vehicleCfg.topSpeed,
    accelerationRate: (450 / vehicleCfg.acceleration) * 0.05,
    decelerationRate: 0.988,
    brakeRate: 0.93,
    steeringAngle: 0, // Actual vehicle yaw angle
    rollAngle: 0,     // Vehicle roll/banking angle
    wheelSteerAngle: 0, // Front wheels visual steer angle
    posX: 0,          // Lateral road position (-9.5 to +9.5)
    roadDistance: 0,
    nitroAmount: 100,
    isNitro: false,
    cameraMode: 'chase' as 'chase' | 'cockpit' | 'top'
  });

  stateRef.current.cameraMode = cameraMode;

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

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current[key] = true;
      keysPressed.current[e.code] = true;

      if (key === 'h') {
        triggerHorn();
      }
      if (key === 'c') {
        setCameraMode(prev => prev === 'chase' ? 'cockpit' : prev === 'cockpit' ? 'top' : 'chase');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current[key] = false;
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [triggerHorn]);

  // Three.js Scene Setup & Loop
  useEffect(() => {
    if (!containerRef.current) return;
    
    const width = containerRef.current.clientWidth || window.innerWidth || 1280;
    const height = containerRef.current.clientHeight || window.innerHeight || 720;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const skyColor = dayNight === 'night' ? 0x050814 : dayNight === 'sunset' ? 0x2b1020 : 0x60a5fa;
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
    const ambientLight = new THREE.AmbientLight(0xffffff, dayNight === 'night' ? 1.0 : dayNight === 'sunset' ? 1.4 : 2.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(dayNight === 'sunset' ? 0xf97316 : 0xffffff, dayNight === 'night' ? 1.2 : 2.5);
    dirLight.position.set(25, 45, -30);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // 5. Scenery Group (Road, Guardrails, Buildings, Neon Trees, Streetlights)
    const sceneryGroup = new THREE.Group();
    scene.add(sceneryGroup);
    sceneryGroupRef.current = sceneryGroup;

    // Road Plane (5 lanes)
    const roadWidth = 24;
    const roadLength = 800;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength, 1, 10);
    const roadMat = new THREE.MeshStandardMaterial({ 
      color: 0x16181f, 
      roughness: 0.75,
      metalness: 0.15
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.z = 200;
    sceneryGroup.add(road);

    // Guardrails on both sides
    [-12.2, 12.2].forEach(gx => {
      const railGeo = new THREE.BoxGeometry(0.3, 0.8, roadLength);
      const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(gx, 0.4, 200);
      sceneryGroup.add(rail);

      // Guardrail warning stripes
      for (let rz = -200; rz < 600; rz += 8) {
        const stripeGeo = new THREE.BoxGeometry(0.32, 0.2, 2.5);
        const stripeMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.set(gx, 0.5, rz);
        sceneryGroup.add(stripe);
      }
    });

    // Side grass / city terrain
    const groundGeo = new THREE.PlaneGeometry(300, roadLength);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: dayNight === 'night' ? 0x060810 : dayNight === 'sunset' ? 0x1a0f18 : 0x166534, 
      roughness: 0.95 
    });
    const groundLeft = new THREE.Mesh(groundGeo, groundMat);
    groundLeft.rotation.x = -Math.PI / 2;
    groundLeft.position.set(-162, -0.05, 200);
    sceneryGroup.add(groundLeft);

    const groundRight = new THREE.Mesh(groundGeo, groundMat);
    groundRight.rotation.x = -Math.PI / 2;
    groundRight.position.set(162, -0.05, 200);
    sceneryGroup.add(groundRight);

    // Lane Markings
    const laneLinesGroup = new THREE.Group();
    sceneryGroup.add(laneLinesGroup);
    for (let z = -200; z < 600; z += 12) {
      [-6, 0, 6].forEach(x => {
        const lineGeo = new THREE.BoxGeometry(0.35, 0.05, 5);
        const lineMat = new THREE.MeshBasicMaterial({ 
          color: x === 0 ? 0xf59e0b : 0xffffff 
        });
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.position.set(x, 0.02, z);
        laneLinesGroup.add(line);
      });
    }

    // Street Lamps & City Skyscrapers
    for (let z = -150; z < 550; z += 35) {
      const lampL = createStreetLamp(-13, z, 0x38bdf8);
      sceneryGroup.add(lampL);

      const lampR = createStreetLamp(13, z, 0xf59e0b);
      lampR.rotation.y = Math.PI;
      sceneryGroup.add(lampR);

      // Distant Skyscrapers Left
      const bldgHeightL = 35 + (Math.sin(z * 0.1) * 0.5 + 0.5) * 80;
      const bldgGeoL = new THREE.BoxGeometry(18, bldgHeightL, 22);
      const bldgMatL = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.3,
        metalness: 0.8,
        emissive: (z % 70 === 0) ? 0x1e3a8a : 0x000000,
        emissiveIntensity: 0.4
      });
      const bldgL = new THREE.Mesh(bldgGeoL, bldgMatL);
      bldgL.position.set(-38, bldgHeightL / 2, z);
      sceneryGroup.add(bldgL);

      // Distant Skyscrapers Right
      const bldgHeightR = 35 + (Math.cos(z * 0.1) * 0.5 + 0.5) * 80;
      const bldgGeoR = new THREE.BoxGeometry(18, bldgHeightR, 22);
      const bldgMatR = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.3,
        metalness: 0.8,
        emissive: (z % 70 === 0) ? 0x831843 : 0x000000,
        emissiveIntensity: 0.4
      });
      const bldgR = new THREE.Mesh(bldgGeoR, bldgMatR);
      bldgR.position.set(38, bldgHeightR / 2, z);
      sceneryGroup.add(bldgR);
    }

    // 6. Build 3D Vehicle Model
    const vehicleGroup = new THREE.Group();
    vehicleMeshRef.current = vehicleGroup;
    scene.add(vehicleGroup);
    
    frontWheelsGroupRef.current = [];
    spinningWheelsRef.current = [];
    brakeLightsRef.current = [];

    build3DVehicle(
      vehicleGroup, 
      item, 
      vehicleCfg, 
      frontWheelsGroupRef.current, 
      spinningWheelsRef.current,
      brakeLightsRef.current
    );

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
    vehicleGroup.add(nitroParticles);
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
    vehicleGroup.add(tireSmoke);
    tireSmoke.position.set(0, 0.2, -1.8);
    tireSmoke.visible = false;

    // Helper: Streetlamp builder
    function createStreetLamp(x: number, z: number, glowColor: number) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      const poleGeo = new THREE.CylinderGeometry(0.12, 0.15, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 4;
      group.add(pole);

      const armGeo = new THREE.BoxGeometry(2.5, 0.1, 0.1);
      const arm = new THREE.Mesh(armGeo, poleMat);
      arm.position.set(1.2, 7.8, 0);
      group.add(arm);

      const headGeo = new THREE.SphereGeometry(0.3, 12, 12);
      const headMat = new THREE.MeshBasicMaterial({ color: glowColor });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(2.4, 7.6, 0);
      group.add(head);

      const spot = new THREE.SpotLight(glowColor, 2.0, 25, Math.PI / 4, 0.5);
      spot.position.set(2.4, 7.6, 0);
      spot.target.position.set(2.4, 0, 0);
      group.add(spot);
      group.add(spot.target);

      return group;
    }

    // Helper: 3D Vehicle Builder with high details
    function build3DVehicle(
      group: THREE.Group, 
      item: LuxuryItem, 
      cfg: NonNullable<LuxuryItem['vehicleConfig']>, 
      frontWheelGroups: THREE.Group[],
      spinningWheels: THREE.Mesh[],
      brakes: THREE.Mesh[]
    ) {
      const isMotorbike = item.category === 'motorbikes';
      const mainColor = new THREE.Color(cfg.color || '#0284c7');

      if (isMotorbike) {
        // ==================== MOTORBIKES ====================
        const isWave = item.id.includes('wave') || item.id.includes('dream');
        const isDucati = item.id.includes('ducati') || item.id.includes('ninja');
        const isExciter = item.id.includes('exciter');
        const isVespa = item.id.includes('vespa');
        const isSH = item.id.includes('sh350');

        // Main Frame / Engine block
        const frameGeo = new THREE.BoxGeometry(0.36, 0.55, 1.6);
        const frameMat = new THREE.MeshStandardMaterial({ 
          color: isDucati ? 0xdc2626 : isWave ? (item.id.includes('dream') ? 0x78350f : 0xef4444) : isVespa ? 0xfef08a : isExciter ? 0x2563eb : mainColor, 
          metalness: isVespa ? 0.7 : 0.85, 
          roughness: 0.25 
        });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.set(0, 0.68, 0);
        group.add(frame);

        // Fuel Tank / Fairing
        let tankGeo: THREE.BufferGeometry;
        if (isDucati || isExciter) {
          tankGeo = new THREE.ConeGeometry(0.42, 1.1, 8);
        } else if (isVespa) {
          tankGeo = new THREE.SphereGeometry(0.35, 16, 16);
        } else {
          tankGeo = new THREE.BoxGeometry(0.38, 0.35, 0.9);
        }
        const tank = new THREE.Mesh(tankGeo, frameMat);
        tank.rotation.x = Math.PI / 2;
        tank.position.set(0, 0.95, 0.2);
        group.add(tank);

        // Classic Front Basket for Wave Alpha
        if (item.id.includes('wave')) {
          const basketGeo = new THREE.BoxGeometry(0.42, 0.3, 0.35);
          const basketMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, wireframe: true });
          const basket = new THREE.Mesh(basketGeo, basketMat);
          basket.position.set(0, 0.85, 0.8);
          group.add(basket);
        }

        // Saddle / Seat
        const seatGeo = new THREE.BoxGeometry(0.34, 0.12, 0.8);
        const seatMat = new THREE.MeshStandardMaterial({ 
          color: item.id.includes('dream') ? 0x451a03 : isVespa ? 0x1e293b : 0x111827, 
          roughness: 0.9 
        });
        const seat = new THREE.Mesh(seatGeo, seatMat);
        seat.position.set(0, 0.88, -0.35);
        group.add(seat);

        // Handlebar & Front Fork (Pivots with steering)
        const frontAssembly = new THREE.Group();
        frontAssembly.position.set(0, 0.42, 0.85);
        group.add(frontAssembly);
        frontWheelGroups.push(frontAssembly);

        const forkGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.85);
        const forkMat = new THREE.MeshStandardMaterial({ 
          color: isDucati ? 0xf59e0b : 0xd4d4d8, 
          metalness: 0.95, 
          roughness: 0.1 
        });
        [-0.15, 0.15].forEach(fx => {
          const fork = new THREE.Mesh(forkGeo, forkMat);
          fork.position.set(fx, 0.3, 0);
          fork.rotation.x = -0.2;
          frontAssembly.add(fork);
        });

        const handleGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.88);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.rotation.z = Math.PI / 2;
        handle.position.set(0, 0.72, -0.05);
        frontAssembly.add(handle);

        // Headlight
        const headGeo = isVespa ? new THREE.SphereGeometry(0.16, 16, 16) : new THREE.BoxGeometry(0.25, 0.16, 0.15);
        const headMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const headlight = new THREE.Mesh(headGeo, headMat);
        headlight.position.set(0, 0.55, 0.15);
        frontAssembly.add(headlight);

        const bikeLight = new THREE.SpotLight(0xfff5e0, 5, 80, Math.PI / 6, 0.3);
        bikeLight.position.set(0, 0.55, 0.2);
        bikeLight.target.position.set(0, 0.2, 20);
        frontAssembly.add(bikeLight);
        frontAssembly.add(bikeLight.target);

        // Front Wheel (Inside pivoting assembly)
        const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.12, 24);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.9 });
        const rimGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.13, 16);
        const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });

        const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
        frontWheel.rotation.z = Math.PI / 2;
        const frontRim = new THREE.Mesh(rimGeo, rimMat);
        frontWheel.add(frontRim);
        frontAssembly.add(frontWheel);
        spinningWheels.push(frontWheel);

        // Rear Wheel
        const rearWheel = new THREE.Mesh(wheelGeo, wheelMat);
        rearWheel.rotation.z = Math.PI / 2;
        rearWheel.position.set(0, 0.42, -0.85);
        const rearRim = new THREE.Mesh(rimGeo, rimMat);
        rearWheel.add(rearRim);
        group.add(rearWheel);
        spinningWheels.push(rearWheel);

        // Exhaust pipe
        const pipeGeo = new THREE.CylinderGeometry(0.06, 0.09, 1.2);
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.98, roughness: 0.1 });
        const pipe = new THREE.Mesh(pipeGeo, pipeMat);
        pipe.rotation.x = Math.PI / 2.3;
        pipe.position.set(0.24, 0.35, -0.6);
        group.add(pipe);

        // Rider Mesh
        const riderGroup = new THREE.Group();
        group.add(riderGroup);
        const torsoGeo = new THREE.BoxGeometry(0.36, 0.55, 0.25);
        const torsoMat = new THREE.MeshStandardMaterial({ color: isDucati ? 0x991b1b : 0x1e293b });
        const torso = new THREE.Mesh(torsoGeo, torsoMat);
        torso.position.set(0, 1.25, -0.2);
        torso.rotation.x = isDucati ? 0.45 : 0.18;
        riderGroup.add(torso);

        const helmetGeo = new THREE.SphereGeometry(0.18, 16, 16);
        const helmetMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 });
        const helmet = new THREE.Mesh(helmetGeo, helmetMat);
        helmet.position.set(0, isDucati ? 1.45 : 1.6, isDucati ? -0.05 : -0.2);
        riderGroup.add(helmet);

        // Tail / Brake light
        const tailGeo = new THREE.BoxGeometry(0.18, 0.08, 0.08);
        const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1e1e });
        const tailLight = new THREE.Mesh(tailGeo, tailMat);
        tailLight.position.set(0, 0.8, -0.85);
        group.add(tailLight);
        brakes.push(tailLight);

      } else {
        // ==================== SUPERCARS & HYPERCARS ====================
        const isTruck = cfg.bodyType === 'truck' || item.id.includes('cybertruck');
        const isSedan = cfg.bodyType === 'sedan' || item.id.includes('rolls');
        const isJesko = item.id.includes('jesko');
        const isBugatti = item.id.includes('bugatti');
        const isPorsche = item.id.includes('porsche') || item.id.includes('gt3');

        // Car Main Body
        let bodyGeo: THREE.BufferGeometry;
        if (isTruck) {
          bodyGeo = new THREE.BoxGeometry(2.15, 1.05, 4.9);
        } else if (isSedan) {
          bodyGeo = new THREE.BoxGeometry(2.05, 0.88, 4.8);
        } else {
          bodyGeo = new THREE.BoxGeometry(2.0, 0.62, 4.5);
        }

        const bodyMat = new THREE.MeshStandardMaterial({
          color: isTruck ? 0x94a3b8 : mainColor,
          metalness: isTruck ? 0.95 : 0.88,
          roughness: isTruck ? 0.2 : 0.15,
        });
        const carBody = new THREE.Mesh(bodyGeo, bodyMat);
        carBody.position.y = 0.62;
        group.add(carBody);

        // Glass Cockpit / Cabin
        let cabinGeo: THREE.BufferGeometry;
        if (isTruck) {
          cabinGeo = new THREE.ConeGeometry(1.65, 1.0, 4);
        } else if (isSedan) {
          cabinGeo = new THREE.BoxGeometry(1.7, 0.65, 2.5);
        } else {
          cabinGeo = new THREE.BoxGeometry(1.55, 0.52, 2.2);
        }

        const glassMat = new THREE.MeshStandardMaterial({
          color: 0x090d16,
          metalness: 0.95,
          roughness: 0.05,
          transparent: true,
          opacity: 0.8
        });
        const cabin = new THREE.Mesh(cabinGeo, glassMat);
        cabin.position.set(0, isSedan ? 1.25 : 1.12, -0.15);
        group.add(cabin);

        // Bugatti Horseshoe Grille / Rolls Royce Pantheon Grille
        if (isBugatti) {
          const horseshoeGeo = new THREE.TorusGeometry(0.35, 0.08, 16, 24, Math.PI);
          const horseshoeMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.98 });
          const horseshoe = new THREE.Mesh(horseshoeGeo, horseshoeMat);
          horseshoe.rotation.z = Math.PI;
          horseshoe.position.set(0, 0.5, 2.26);
          group.add(horseshoe);
        } else if (isSedan) {
          const grilleGeo = new THREE.BoxGeometry(0.9, 0.6, 0.08);
          const grilleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.98, roughness: 0.05 });
          const grille = new THREE.Mesh(grilleGeo, grilleMat);
          grille.position.set(0, 0.7, 2.41);
          group.add(grille);
        }

        // GT Rear Wings / Spoilers
        if (!isTruck && !isSedan) {
          const wingWidth = isJesko || isPorsche ? 2.1 : 1.85;
          const wingGeo = new THREE.BoxGeometry(wingWidth, 0.06, 0.45);
          const wingMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
          const wing = new THREE.Mesh(wingGeo, wingMat);
          wing.position.set(0, isPorsche || isJesko ? 1.35 : 1.15, -2.05);
          group.add(wing);

          // Wing struts
          [-0.65, 0.65].forEach(x => {
            const strutGeo = new THREE.BoxGeometry(0.04, isPorsche || isJesko ? 0.45 : 0.28, 0.15);
            const strut = new THREE.Mesh(strutGeo, wingMat);
            strut.position.set(x, isPorsche || isJesko ? 1.1 : 0.95, -2.05);
            group.add(strut);
          });
        }

        // Headlights & Light projection
        [-0.75, 0.75].forEach(x => {
          const lightGeo = new THREE.BoxGeometry(0.35, 0.12, 0.1);
          const lightMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
          const light = new THREE.Mesh(lightGeo, lightMat);
          light.position.set(x, 0.62, 2.26);
          group.add(light);

          const spot = new THREE.SpotLight(0xffffff, 4.5, 90, Math.PI / 5, 0.3);
          spot.position.set(x, 0.62, 2.3);
          spot.target.position.set(x, 0.2, 40);
          group.add(spot);
          group.add(spot.target);
        });

        // Rear Taillights / Brake lights
        [-0.75, 0.75].forEach(x => {
          const tailGeo = new THREE.BoxGeometry(0.45, 0.1, 0.08);
          const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1e1e });
          const tail = new THREE.Mesh(tailGeo, tailMat);
          tail.position.set(x, 0.68, -2.26);
          group.add(tail);
          brakes.push(tail);
        });

        // Wheels: Front (Articulated Steering) & Rear (Fixed)
        const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 24);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.85 });
        const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.3, 16);
        const rimMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.15 });

        // Front Left & Right (In steering pivot groups)
        [-0.98, 0.98].forEach(x => {
          const frontPivot = new THREE.Group();
          frontPivot.position.set(x, 0.38, 1.45);
          group.add(frontPivot);
          frontWheelGroups.push(frontPivot);

          const wheel = new THREE.Mesh(wheelGeo, wheelMat);
          wheel.rotation.z = Math.PI / 2;
          const rim = new THREE.Mesh(rimGeo, rimMat);
          wheel.add(rim);
          frontPivot.add(wheel);
          spinningWheels.push(wheel);
        });

        // Rear Left & Right
        [-0.98, 0.98].forEach(x => {
          const wheel = new THREE.Mesh(wheelGeo, wheelMat);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(x, 0.38, -1.45);
          const rim = new THREE.Mesh(rimGeo, rimMat);
          wheel.add(rim);
          group.add(wheel);
          spinningWheels.push(wheel);
        });
      }
    }

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

    // 9. Main Physics & Render Game Loop
    let lastTime = performance.now();

    const animate = (time: number) => {
      animFrameId.current = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const keys = keysPressed.current;
      const state = stateRef.current;

      const isUp = keys['w'] || keys['arrowup'] || keys['KeyW'] || keys['ArrowUp'];
      const isDown = keys['s'] || keys['arrowdown'] || keys['KeyS'] || keys['ArrowDown'];
      const isLeft = keys['a'] || keys['arrowleft'] || keys['KeyA'] || keys['ArrowLeft'];
      const isRight = keys['d'] || keys['arrowright'] || keys['KeyD'] || keys['ArrowRight'];
      const isSpace = keys[' '] || keys['Space'];
      const isShift = keys['shift'] || keys['ShiftLeft'] || keys['ShiftRight'];

      // Nitro Handling
      if (isShift && state.nitroAmount > 0 && isUp) {
        state.isNitro = true;
        state.nitroAmount = Math.max(0, state.nitroAmount - delta * 30);
        if (nitroParticlesRef.current) nitroParticlesRef.current.visible = true;
      } else {
        state.isNitro = false;
        state.nitroAmount = Math.min(100, state.nitroAmount + delta * 10);
        if (nitroParticlesRef.current) nitroParticlesRef.current.visible = false;
      }

      setIsNitroActive(state.isNitro);
      setNitro(Math.round(state.nitroAmount));

      // Acceleration / Braking
      const nitroBoost = state.isNitro ? 1.7 : 1.0;
      const effectiveMaxSpeed = state.maxSpeed * (state.isNitro ? 1.25 : 1.0);

      if (isUp) {
        state.currentSpeed = Math.min(
          effectiveMaxSpeed, 
          state.currentSpeed + state.accelerationRate * nitroBoost * (1 - state.currentSpeed / (effectiveMaxSpeed * 1.15)) * delta * 60
        );
      } else if (isDown) {
        if (state.currentSpeed > 5) {
          state.currentSpeed *= state.brakeRate;
        } else {
          state.currentSpeed = Math.max(-25, state.currentSpeed - delta * 25);
        }
      } else if (isSpace) {
        state.currentSpeed *= 0.92;
      } else {
        state.currentSpeed *= state.decelerationRate;
        if (Math.abs(state.currentSpeed) < 0.1) state.currentSpeed = 0;
      }

      // Brake lights activation
      const isBraking = isDown || isSpace;
      brakeLightsRef.current.forEach(bl => {
        (bl.material as THREE.MeshBasicMaterial).color.setHex(isBraking ? 0xff0000 : 0xaa1010);
      });

      // ==================== STEERING & TURNING PHYSICS ====================
      // Steering authority: responsive even at low speeds with smooth velocity scaling
      const speedMagnitude = Math.abs(state.currentSpeed);
      const speedSteerFactor = Math.max(0.4, Math.min(1.0, speedMagnitude / 25));
      const steerSpeed = (vehicleCfg.handling / 10) * 11.0 * speedSteerFactor * delta;

      let targetSteer = 0;
      if (isLeft) {
        targetSteer = -1; // Negative X direction = Left
        state.posX = Math.max(-9.6, state.posX - steerSpeed * (isBike ? 1.1 : 1.0));
      } else if (isRight) {
        targetSteer = 1;  // Positive X direction = Right
        state.posX = Math.min(9.6, state.posX + steerSpeed * (isBike ? 1.1 : 1.0));
      }

      // Correct coordinate rotation:
      // Turn LEFT (targetSteer < 0) => Yaw angle negative (points nose to -X)
      // Turn RIGHT (targetSteer > 0) => Yaw angle positive (points nose to +X)
      const targetYawAngle = targetSteer * (isBike ? 0.22 : 0.28);
      state.steeringAngle = THREE.MathUtils.lerp(state.steeringAngle, targetYawAngle, 0.18);

      // Roll / Bank angle into turns:
      // Turn LEFT (targetSteer < 0) => Lean LEFT (positive Z rotation around forward axis)
      // Turn RIGHT (targetSteer > 0) => Lean RIGHT (negative Z rotation around forward axis)
      const targetRoll = -targetSteer * (isBike ? 0.35 : 0.08);
      state.rollAngle = THREE.MathUtils.lerp(state.rollAngle, targetRoll, 0.16);

      // Front wheels steering angle
      const targetWheelAngle = targetSteer * 0.45;
      state.wheelSteerAngle = THREE.MathUtils.lerp(state.wheelSteerAngle, targetWheelAngle, 0.25);

      // Apply to vehicle 3D mesh
      if (vehicleMeshRef.current) {
        vehicleMeshRef.current.position.x = THREE.MathUtils.lerp(vehicleMeshRef.current.position.x, state.posX, 0.25);
        vehicleMeshRef.current.rotation.y = state.steeringAngle;
        vehicleMeshRef.current.rotation.z = state.rollAngle;
      }

      // Articulate front wheels steering
      frontWheelsGroupRef.current.forEach(pivot => {
        pivot.rotation.y = state.wheelSteerAngle;
      });

      // Tire smoke on hard turning / drifting or hard braking
      const isHardSteer = Math.abs(targetSteer) > 0 && speedMagnitude > 80;
      if (tireSmokeParticlesRef.current) {
        tireSmokeParticlesRef.current.visible = isHardSteer || (isBraking && speedMagnitude > 60);
      }

      // Rotate wheels forward with speed
      const wheelRotSpeed = (state.currentSpeed * delta * 0.85);
      spinningWheelsRef.current.forEach(w => {
        w.rotation.x += wheelRotSpeed;
      });

      // Scroll infinite road & scenery
      state.roadDistance += state.currentSpeed * delta * 0.55;
      if (sceneryGroupRef.current) {
        sceneryGroupRef.current.position.z = -(state.roadDistance % 100);
      }

      // Dynamic Camera chase & shake
      if (cameraRef.current && vehicleMeshRef.current) {
        const vPos = vehicleMeshRef.current.position;
        const speedRatio = speedMagnitude / state.maxSpeed;

        if (state.cameraMode === 'chase') {
          const targetCamX = vPos.x * 0.7;
          const targetCamY = isBike ? 2.6 : 2.3 + (state.isNitro ? 0.2 : 0);
          const targetCamZ = -5.8 - speedRatio * 1.8;
          cameraRef.current.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.14);
          cameraRef.current.lookAt(vPos.x * 0.9, vPos.y + (isBike ? 1.0 : 0.8), vPos.z + 14);

          // Speed FOV expansion (speed warp sensation)
          cameraRef.current.fov = 60 + speedRatio * 15 + (state.isNitro ? 8 : 0);
          cameraRef.current.updateProjectionMatrix();

        } else if (state.cameraMode === 'cockpit') {
          cameraRef.current.position.set(vPos.x, vPos.y + (isBike ? 1.45 : 1.08), vPos.z + (isBike ? 0.2 : 0.4));
          cameraRef.current.lookAt(vPos.x + state.steeringAngle * 5, vPos.y + 1.0, vPos.z + 30);
          cameraRef.current.fov = 70 + speedRatio * 10;
          cameraRef.current.updateProjectionMatrix();

        } else {
          // Top-down / Heli cam
          cameraRef.current.position.set(vPos.x * 0.3, 16, vPos.z - 4);
          cameraRef.current.lookAt(vPos.x, 0, vPos.z + 16);
          cameraRef.current.fov = 60;
          cameraRef.current.updateProjectionMatrix();
        }
      }

      // Audio engine update
      if (!isMuted && engineRef.current) {
        const speedRatio = speedMagnitude / state.maxSpeed;
        engineRef.current.update(speedRatio, isUp || state.isNitro);
      }

      // HUD updates
      const displaySpeed = Math.max(0, Math.round(state.currentSpeed));
      setSpeed(displaySpeed);

      const maxSpd = state.maxSpeed;
      let calculatedGear = 'N';
      if (displaySpeed === 0) calculatedGear = 'N';
      else if (displaySpeed < maxSpd * 0.15) calculatedGear = '1';
      else if (displaySpeed < maxSpd * 0.3) calculatedGear = '2';
      else if (displaySpeed < maxSpd * 0.48) calculatedGear = '3';
      else if (displaySpeed < maxSpd * 0.68) calculatedGear = '4';
      else if (displaySpeed < maxSpd * 0.85) calculatedGear = '5';
      else calculatedGear = '6';
      setGear(calculatedGear);

      const gearRatio = displaySpeed > 0 ? (displaySpeed % (maxSpd / 6)) / (maxSpd / 6) : 0;
      const calcRpm = Math.min(9500, Math.round(1200 + gearRatio * 7500 + (state.isNitro ? 1000 : 0)));
      setRpm(calcRpm);

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
  }, [dayNight, isBike, isMuted, item, vehicleCfg]);

  const setKeyStatus = (key: string, pressed: boolean) => {
    keysPressed.current[key] = pressed;
    keysPressed.current[key.toLowerCase()] = pressed;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090b10] select-none overflow-hidden animate-fadeIn" style={{ width: '100vw', height: '100vh' }}>
      {/* 3D Canvas Viewport */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" 
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md transition-all shadow-lg hover:scale-105 active:scale-95"
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
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md transition-all"
            title="Đổi thời gian"
          >
            <Compass className="w-5 h-5 text-amber-400" />
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setCameraMode(prev => prev === 'chase' ? 'cockpit' : prev === 'cockpit' ? 'top' : 'chase');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md transition-all text-xs font-semibold"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>{cameraMode === 'chase' ? 'Góc Nhìn Sau' : cameraMode === 'cockpit' ? 'Góc Lái FPV' : 'Toàn Cảnh'}</span>
          </button>

          <button
            onClick={() => {
              setIsMuted(!isMuted);
            }}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md transition-all"
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
              <span>Phím W/S (Ga/Phanh) • A/D (Lái) • Shift (Nitro) • H (Còi)</span>
            </div>
          </div>
        </div>
      </div>

      {/* On-Screen Mobile / Touch Controls Overlay */}
      <div className="absolute bottom-6 right-6 z-20 flex items-end gap-3 pointer-events-auto">
        <button
          onPointerDown={triggerHorn}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center border font-bold text-xs transition-all shadow-xl active:scale-90 ${isHornActive ? 'bg-amber-500 text-black border-amber-300' : 'bg-slate-900/80 text-amber-400 border-slate-700/80'}`}
        >
          BÍP!
        </button>

        <button
          onPointerDown={() => setKeyStatus('shift', true)}
          onPointerUp={() => setKeyStatus('shift', false)}
          onPointerLeave={() => setKeyStatus('shift', false)}
          onPointerCancel={() => setKeyStatus('shift', false)}
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border transition-all shadow-xl active:scale-90 ${isNitroActive ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_20px_#00e5ff]' : 'bg-slate-900/80 text-cyan-400 border-slate-700/80'}`}
        >
          <Zap className="w-5 h-5 fill-current" />
          <span className="text-[10px] font-bold">NITRO</span>
        </button>

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
          <span>PHANH</span>
        </button>

        <button
          onPointerDown={() => setKeyStatus('w', true)}
          onPointerUp={() => setKeyStatus('w', false)}
          onPointerLeave={() => setKeyStatus('w', false)}
          onPointerCancel={() => setKeyStatus('w', false)}
          className="w-16 h-20 rounded-2xl bg-gradient-to-t from-emerald-600 to-teal-500 text-black font-extrabold border border-emerald-400 flex flex-col items-center justify-center shadow-2xl active:scale-95 text-xs"
        >
          <Flame className="w-5 h-5 fill-black" />
          <span>ĐẠP GA</span>
        </button>
      </div>
    </div>
  );
};
