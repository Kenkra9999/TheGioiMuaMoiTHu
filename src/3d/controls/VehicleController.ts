import * as THREE from 'three';
import { VehicleBuildResult } from '../vehicles/CarGenerator';

export interface VehiclePhysicsConfig {
  topSpeed: number;        // km/h
  acceleration: number;    // 0-100 time in seconds
  handling: number;        // 1 to 10 scale
  nitroCapacity: number;
  bodyType?: string;
  isBike?: boolean;
}

export interface VehicleState {
  currentSpeed: number;     // km/h
  maxSpeed: number;
  steeringYaw: number;      // vehicle heading angle (radians)
  rollAngle: number;        // chassis roll/bank angle (radians)
  wheelSteerAngle: number;  // front wheel pivot angle (radians)
  posX: number;             // lateral position (-9.5 to +9.5)
  roadDistance: number;     // accumulated distance
  nitroAmount: number;
  isNitro: boolean;
  isBraking: boolean;
  isDrifting: boolean;
  rpm: number;
  gear: string;
}

/**
 * VehicleController: Robust physics engine for 3D vehicle dynamics and camera tracking.
 * Strictly implements correct left/right orientation and responsive steering.
 */
export class VehicleController {
  public state: VehicleState;
  public config: VehiclePhysicsConfig;
  private keysPressed: { [key: string]: boolean } = {};
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundBlur: () => void;

  constructor(config: VehiclePhysicsConfig) {
    this.config = config;
    this.state = {
      currentSpeed: 25, // Start rolling smoothly
      maxSpeed: config.topSpeed,
      steeringYaw: 0,
      rollAngle: 0,
      wheelSteerAngle: 0,
      posX: 0,
      roadDistance: 0,
      nitroAmount: 100,
      isNitro: false,
      isBraking: false,
      isDrifting: false,
      rpm: 1000,
      gear: '1'
    };

    this.boundKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      this.keysPressed[k] = true;
      this.keysPressed[e.code] = true;
    };

    this.boundKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      this.keysPressed[k] = false;
      this.keysPressed[e.code] = false;
    };

    this.boundBlur = () => {
      this.keysPressed = {};
    };

    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    window.addEventListener('blur', this.boundBlur);
  }

  public dispose(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    window.removeEventListener('blur', this.boundBlur);
  }

  /**
   * Updates physics, steering, engine telemetry, and applies transforms to the vehicle 3D model.
   */
  public update(delta: number, vehicleData: VehicleBuildResult): void {
    const keys = this.keysPressed;
    const isUp = keys['w'] || keys['arrowup'] || keys['KeyW'] || keys['ArrowUp'];
    const isDown = keys['s'] || keys['arrowdown'] || keys['KeyS'] || keys['ArrowDown'];
    const isLeft = keys['a'] || keys['arrowleft'] || keys['KeyA'] || keys['ArrowLeft'];
    const isRight = keys['d'] || keys['arrowright'] || keys['KeyD'] || keys['ArrowRight'];
    const isSpace = keys[' '] || keys['Space'];
    const isShift = keys['shift'] || keys['ShiftLeft'] || keys['ShiftRight'];

    // 1. Nitro Handling
    if (isShift && this.state.nitroAmount > 0 && isUp) {
      this.state.isNitro = true;
      this.state.nitroAmount = Math.max(0, this.state.nitroAmount - delta * 35);
    } else {
      this.state.isNitro = false;
      this.state.nitroAmount = Math.min(100, this.state.nitroAmount + delta * 12);
    }

    const nitroBoost = this.state.isNitro ? 1.75 : 1.0;
    const effectiveMaxSpeed = this.state.maxSpeed * (this.state.isNitro ? 1.25 : 1.0);
    const accelRate = (480 / Math.max(1.5, this.config.acceleration)) * 0.055;

    // 2. Longitudinal Acceleration & Braking
    if (isUp) {
      this.state.currentSpeed = Math.min(
        effectiveMaxSpeed,
        this.state.currentSpeed + accelRate * nitroBoost * (1 - this.state.currentSpeed / (effectiveMaxSpeed * 1.15)) * delta * 60
      );
    } else if (isDown) {
      if (this.state.currentSpeed > 5) {
        this.state.currentSpeed *= 0.93; // Hard brake
      } else {
        this.state.currentSpeed = Math.max(-25, this.state.currentSpeed - delta * 30); // Reverse
      }
    } else if (isSpace) {
      this.state.currentSpeed *= 0.91; // Handbrake
    } else {
      this.state.currentSpeed *= 0.988; // Natural road drag
      if (Math.abs(this.state.currentSpeed) < 0.1) this.state.currentSpeed = 0;
    }

    this.state.isBraking = isDown || isSpace;

    // 3. Lateral Steering & Turning Dynamics
    // Target steer input: Left = -1, Right = +1
    let targetSteer = 0;
    if (isLeft) targetSteer -= 1;
    if (isRight) targetSteer += 1;

    const speedMag = Math.abs(this.state.currentSpeed);
    const speedSteerFactor = Math.max(0.4, Math.min(1.0, speedMag / 25));
    const steerResponsiveness = (this.config.handling / 10) * 11.5 * speedSteerFactor * delta;

    // Lateral displacement on road
    if (targetSteer !== 0) {
      this.state.posX += targetSteer * steerResponsiveness * (this.config.isBike ? 1.15 : 1.0);
      this.state.posX = Math.max(-9.5, Math.min(9.5, this.state.posX));
    }

    // Heading Yaw Angle:
    // Left (targetSteer = -1) -> Negative yaw (points vehicle nose towards -X)
    // Right (targetSteer = +1) -> Positive yaw (points vehicle nose towards +X)
    const targetYaw = targetSteer * (this.config.isBike ? 0.24 : 0.28);
    this.state.steeringYaw = THREE.MathUtils.lerp(this.state.steeringYaw, targetYaw, 0.18);

    // Chassis Roll / Banking into turns:
    // Left turn -> Lean Left (-Z rotation in Three.js when looking +Z)
    const targetRoll = -targetSteer * (this.config.isBike ? 0.38 : 0.08);
    this.state.rollAngle = THREE.MathUtils.lerp(this.state.rollAngle, targetRoll, 0.16);

    // Front Wheels Steering Angle
    const targetWheelAngle = targetSteer * 0.45;
    this.state.wheelSteerAngle = THREE.MathUtils.lerp(this.state.wheelSteerAngle, targetWheelAngle, 0.25);

    // Drift Detection
    this.state.isDrifting = Math.abs(targetSteer) > 0 && speedMag > 75;

    // 4. Apply Transforms to 3D Vehicle Root & Sub-assemblies
    const root = vehicleData.root;
    root.position.x = THREE.MathUtils.lerp(root.position.x, this.state.posX, 0.25);
    root.rotation.y = this.state.steeringYaw;
    root.rotation.z = this.state.rollAngle;

    // Articulate front wheels steering pivots
    vehicleData.frontWheelPivots.forEach(pivot => {
      pivot.rotation.y = this.state.wheelSteerAngle;
    });

    // Spin wheels forward proportionally to road velocity
    const wheelRotDelta = (this.state.currentSpeed * delta * 0.85);
    vehicleData.spinningWheels.forEach(wheel => {
      wheel.rotation.x += wheelRotDelta;
    });

    // Illuminate brake lights
    vehicleData.brakeLights.forEach(bl => {
      (bl.material as THREE.MeshBasicMaterial).color.setHex(this.state.isBraking ? 0xff0000 : 0x770a0a);
    });

    // 5. Accumulate Distance & Calculate Transmission Telemetry
    this.state.roadDistance += this.state.currentSpeed * delta * 0.55;

    // Gear & RPM simulation
    const s = this.state.currentSpeed;
    if (s < 0) {
      this.state.gear = 'R';
      this.state.rpm = Math.min(6000, 1000 + Math.abs(s) * 180);
    } else if (s < 1) {
      this.state.gear = 'N';
      this.state.rpm = 950 + Math.sin(Date.now() * 0.005) * 50;
    } else if (s < 55) {
      this.state.gear = '1';
      this.state.rpm = 1500 + (s / 55) * 5500;
    } else if (s < 105) {
      this.state.gear = '2';
      this.state.rpm = 2500 + ((s - 55) / 50) * 5000;
    } else if (s < 165) {
      this.state.gear = '3';
      this.state.rpm = 3000 + ((s - 105) / 60) * 4800;
    } else if (s < 230) {
      this.state.gear = '4';
      this.state.rpm = 3500 + ((s - 165) / 65) * 4500;
    } else if (s < 300) {
      this.state.gear = '5';
      this.state.rpm = 3800 + ((s - 230) / 70) * 4400;
    } else {
      this.state.gear = '6';
      this.state.rpm = 4200 + ((s - 300) / 100) * 4500;
    }
  }

  /**
   * Smoothly updates camera position and target according to the active mode.
   */
  public updateCamera(
    camera: THREE.PerspectiveCamera,
    vehicleRoot: THREE.Group,
    mode: 'chase' | 'cockpit' | 'top'
  ): void {
    const vPos = vehicleRoot.position;
    const speedRatio = Math.min(1.0, this.state.currentSpeed / this.state.maxSpeed);

    if (mode === 'chase') {
      const shake = (Math.random() - 0.5) * speedRatio * 0.08;
      const targetCamX = vPos.x * 0.75 + this.state.steeringYaw * 1.5;
      const targetCamY = (this.config.isBike ? 2.5 : 2.2) + speedRatio * 0.3 + shake;
      const targetCamZ = -6.5 - speedRatio * 1.5;

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.12);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.12);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.12);

      const lookTarget = new THREE.Vector3(
        vPos.x * 0.3,
        this.config.isBike ? 1.2 : 0.8,
        vPos.z + 12
      );
      camera.lookAt(lookTarget);
    } else if (mode === 'cockpit') {
      camera.position.set(
        vPos.x + (this.config.isBike ? 0 : -0.35),
        vPos.y + (this.config.isBike ? 1.45 : 1.15),
        vPos.z + (this.config.isBike ? 0.3 : 0.2)
      );
      camera.lookAt(vPos.x, vPos.y + 0.9, vPos.z + 25);
    } else {
      // Top / Drone View
      camera.position.set(vPos.x * 0.5, 16, vPos.z - 4);
      camera.lookAt(vPos.x, 0, vPos.z + 10);
    }
  }
}
