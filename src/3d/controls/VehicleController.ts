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
 * Strictly guarantees accurate Left/Right steering, continuous cruise momentum, and smooth arcade physics.
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
      currentSpeed: 65, // Start rolling with brisk highway speed immediately
      maxSpeed: config.topSpeed || 300,
      steeringYaw: 0,
      rollAngle: 0,
      wheelSteerAngle: 0,
      posX: 0,
      roadDistance: 0,
      nitroAmount: 100,
      isNitro: false,
      isBraking: false,
      isDrifting: false,
      rpm: 2500,
      gear: '2'
    };

    this.boundKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      this.keysPressed[k] = true;
      this.keysPressed[e.code] = true;
      this.keysPressed[e.key] = true;
    };

    this.boundKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      this.keysPressed[k] = false;
      this.keysPressed[e.code] = false;
      this.keysPressed[e.key] = false;
    };

    this.boundBlur = () => {
      // Clear steering keys but keep rolling momentum
      this.keysPressed['a'] = false;
      this.keysPressed['d'] = false;
      this.keysPressed['arrowleft'] = false;
      this.keysPressed['arrowright'] = false;
      this.keysPressed['KeyA'] = false;
      this.keysPressed['KeyD'] = false;
      this.keysPressed['ArrowLeft'] = false;
      this.keysPressed['ArrowRight'] = false;
      this.keysPressed['shift'] = false;
      this.keysPressed['ShiftLeft'] = false;
      this.keysPressed['ShiftRight'] = false;
    };

    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    window.addEventListener('blur', this.boundBlur);
  }

  /**
   * Direct key control method for UI Touch buttons
   */
  public setKey(key: string, isDown: boolean): void {
    const k = key.toLowerCase();
    this.keysPressed[k] = isDown;
    this.keysPressed[key] = isDown;
    if (k === 'a' || k === 'arrowleft') {
      this.keysPressed['a'] = isDown;
      this.keysPressed['arrowleft'] = isDown;
      this.keysPressed['KeyA'] = isDown;
      this.keysPressed['ArrowLeft'] = isDown;
    } else if (k === 'd' || k === 'arrowright') {
      this.keysPressed['d'] = isDown;
      this.keysPressed['arrowright'] = isDown;
      this.keysPressed['KeyD'] = isDown;
      this.keysPressed['ArrowRight'] = isDown;
    } else if (k === 'w' || k === 'arrowup') {
      this.keysPressed['w'] = isDown;
      this.keysPressed['arrowup'] = isDown;
      this.keysPressed['KeyW'] = isDown;
      this.keysPressed['ArrowUp'] = isDown;
    } else if (k === 's' || k === 'arrowdown') {
      this.keysPressed['s'] = isDown;
      this.keysPressed['arrowdown'] = isDown;
      this.keysPressed['KeyS'] = isDown;
      this.keysPressed['ArrowDown'] = isDown;
    } else if (k === 'shift') {
      this.keysPressed['shift'] = isDown;
      this.keysPressed['ShiftLeft'] = isDown;
      this.keysPressed['ShiftRight'] = isDown;
    }
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
    const isUp = keys['w'] || keys['arrowup'] || keys['KeyW'] || keys['ArrowUp'] || keys['W'];
    const isDown = keys['s'] || keys['arrowdown'] || keys['KeyS'] || keys['ArrowDown'] || keys['S'];
    const isLeft = keys['a'] || keys['arrowleft'] || keys['KeyA'] || keys['ArrowLeft'] || keys['A'];
    const isRight = keys['d'] || keys['arrowright'] || keys['KeyD'] || keys['ArrowRight'] || keys['D'];
    const isSpace = keys[' '] || keys['Space'];
    const isShift = keys['shift'] || keys['ShiftLeft'] || keys['ShiftRight'] || keys['Shift'];

    // 1. Nitro Boost
    if (isShift && this.state.nitroAmount > 0 && !isDown) {
      this.state.isNitro = true;
      this.state.nitroAmount = Math.max(0, this.state.nitroAmount - delta * 35);
    } else {
      this.state.isNitro = false;
      this.state.nitroAmount = Math.min(100, this.state.nitroAmount + delta * 12);
    }

    const nitroBoost = this.state.isNitro ? 1.85 : 1.0;
    const effectiveMaxSpeed = this.state.maxSpeed * (this.state.isNitro ? 1.25 : 1.0);
    const accelRate = (500 / Math.max(1.5, this.config.acceleration)) * 0.06;
    const cruiseSpeed = 50; // Natural highway cruising idle speed

    // 2. Longitudinal Acceleration & Braking
    if (isUp || this.state.isNitro) {
      // Accelerating forward
      this.state.currentSpeed = Math.min(
        effectiveMaxSpeed,
        this.state.currentSpeed + accelRate * nitroBoost * (1 - this.state.currentSpeed / (effectiveMaxSpeed * 1.1)) * delta * 60
      );
    } else if (isDown) {
      // Braking or reversing
      if (this.state.currentSpeed > 5) {
        this.state.currentSpeed *= Math.pow(0.92, delta * 60); // Strong braking
      } else {
        this.state.currentSpeed = Math.max(-30, this.state.currentSpeed - delta * 40); // Reverse gear
      }
    } else if (isSpace) {
      // Handbrake
      this.state.currentSpeed *= Math.pow(0.88, delta * 60);
    } else {
      // Natural rolling momentum towards cruise speed (never completely dead unless braked)
      if (this.state.currentSpeed < cruiseSpeed) {
        this.state.currentSpeed = THREE.MathUtils.lerp(this.state.currentSpeed, cruiseSpeed, delta * 1.5);
      } else {
        this.state.currentSpeed = THREE.MathUtils.lerp(this.state.currentSpeed, cruiseSpeed, delta * 0.4);
      }
    }

    this.state.isBraking = isDown || isSpace;

    // 3. Lateral Steering & Turning Dynamics
    // Target steer input: Left = -1 (moves to -X), Right = +1 (moves to +X)
    let targetSteer = 0;
    if (isLeft) targetSteer -= 1;
    if (isRight) targetSteer += 1;

    const speedMag = Math.max(15, Math.abs(this.state.currentSpeed));
    const speedSteerFactor = Math.min(1.0, speedMag / 40);
    const steerSpeed = (this.config.handling / 10) * 12.0 * speedSteerFactor * delta;

    // Lateral position on road (-9.5 to +9.5)
    if (targetSteer !== 0) {
      this.state.posX += targetSteer * steerSpeed * (this.config.isBike ? 1.15 : 1.0);
      this.state.posX = Math.max(-9.5, Math.min(9.5, this.state.posX));
    }

    // Vehicle Heading Yaw Angle:
    // Left (targetSteer = -1) => Negative yaw (points vehicle nose to the left / -X)
    // Right (targetSteer = +1) => Positive yaw (points vehicle nose to the right / +X)
    const targetYaw = targetSteer * (this.config.isBike ? 0.22 : 0.26);
    this.state.steeringYaw = THREE.MathUtils.lerp(this.state.steeringYaw, targetYaw, delta * 12);

    // Chassis Roll / Banking Angle into curves:
    // Left turn => Lean Left
    // Right turn => Lean Right
    const targetRoll = -targetSteer * (this.config.isBike ? 0.35 : 0.07);
    this.state.rollAngle = THREE.MathUtils.lerp(this.state.rollAngle, targetRoll, delta * 10);

    // Front Wheels Visual Steer Angle
    const targetWheelAngle = targetSteer * 0.45;
    this.state.wheelSteerAngle = THREE.MathUtils.lerp(this.state.wheelSteerAngle, targetWheelAngle, delta * 15);

    // Drift Detection
    this.state.isDrifting = Math.abs(targetSteer) > 0 && speedMag > 70;

    // 4. Apply Transforms to 3D Vehicle Root & Moving Components
    const root = vehicleData.root;
    root.position.x = THREE.MathUtils.lerp(root.position.x, this.state.posX, delta * 18);
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
    } else if (s < 5) {
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
   * Guarantees 100% natural perspective alignment so left is always left and right is always right.
   */
  public updateCamera(
    camera: THREE.PerspectiveCamera,
    vehicleRoot: THREE.Group,
    mode: 'chase' | 'cockpit' | 'top'
  ): void {
    const vPos = vehicleRoot.position;
    const speedRatio = Math.min(1.0, Math.abs(this.state.currentSpeed) / this.state.maxSpeed);

    if (mode === 'chase') {
      const shake = (Math.random() - 0.5) * speedRatio * 0.06;
      // Camera stays directly behind the vehicle with slight smooth lag
      const targetCamX = vPos.x;
      const targetCamY = (this.config.isBike ? 2.4 : 2.0) + speedRatio * 0.2 + shake;
      const targetCamZ = -6.2 - speedRatio * 1.5;

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.15);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.15);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.15);

      // Look straight ahead along the car's path and into the apex of the turn
      const lookTargetX = vPos.x + this.state.steeringYaw * 4.0;
      const lookTargetY = vPos.y + (this.config.isBike ? 1.0 : 0.7);
      const lookTargetZ = vPos.z + 18.0;

      camera.lookAt(lookTargetX, lookTargetY, lookTargetZ);
      camera.fov = 60 + speedRatio * 12 + (this.state.isNitro ? 8 : 0);
      camera.updateProjectionMatrix();

    } else if (mode === 'cockpit') {
      camera.position.set(
        vPos.x + (this.config.isBike ? 0 : -0.35),
        vPos.y + (this.config.isBike ? 1.45 : 1.15),
        vPos.z + (this.config.isBike ? 0.3 : 0.2)
      );
      camera.lookAt(vPos.x + this.state.steeringYaw * 8.0, vPos.y + 0.9, vPos.z + 30);
      camera.fov = 70 + speedRatio * 10;
      camera.updateProjectionMatrix();

    } else {
      // Top / Drone View
      camera.position.set(vPos.x * 0.6, 16, vPos.z - 4);
      camera.lookAt(vPos.x * 0.6, 0, vPos.z + 10);
      camera.fov = 60;
      camera.updateProjectionMatrix();
    }
  }
}
