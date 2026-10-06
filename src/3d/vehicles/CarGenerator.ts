import * as THREE from 'three';
import { materialLib } from '../materials/MaterialLibrary';
import { LuxuryItem } from '../../data/items';

export interface VehicleBuildResult {
  root: THREE.Group;
  frontWheelPivots: THREE.Group[];
  spinningWheels: THREE.Mesh[];
  brakeLights: THREE.Mesh[];
  headlights: THREE.Mesh[];
}

/**
 * CarGenerator: Game-ready procedural vehicle geometry builder.
 * Generates highly detailed supercars, hypercars, luxury sedans, trucks/SUVs, and iconic motorbikes
 * with separate articulated steering pivots, rotating wheels, calipers, glowing lighting, and cockpit interiors.
 */
export class CarGenerator {
  /**
   * Generates a fully rigged vehicle model based on item metadata and configuration.
   */
  public static generateVehicle(
    item: Partial<LuxuryItem> & { id: string; name?: string; category?: string; vehicleConfig?: LuxuryItem['vehicleConfig'] },
    customColor?: string
  ): VehicleBuildResult {
    const root = new THREE.Group();
    root.name = `Vehicle_${item.id}`;

    const frontWheelPivots: THREE.Group[] = [];
    const spinningWheels: THREE.Mesh[] = [];
    const brakeLights: THREE.Mesh[] = [];
    const headlights: THREE.Mesh[] = [];

    const cfg = item.vehicleConfig || {
      topSpeed: 300,
      acceleration: 3.5,
      handling: 9.0,
      color: customColor || '#0284c7',
      bodyType: 'supercar',
      engineSound: 'supercar',
      nitroCapacity: 100
    };

    const colorHex = customColor || cfg.color || '#0284c7';
    const isBike = item.category === 'motorbikes';
    const id = item.id.toLowerCase();

    if (isBike) {
      if (id.includes('wave')) {
        this.buildWaveAlpha(root, colorHex, frontWheelPivots, spinningWheels, brakeLights, headlights);
      } else if (id.includes('dream')) {
        this.buildDreamII(root, colorHex, frontWheelPivots, spinningWheels, brakeLights, headlights);
      } else if (id.includes('vespa')) {
        this.buildVespaDior(root, colorHex, frontWheelPivots, spinningWheels, brakeLights, headlights);
      } else if (id.includes('sh350') || id.includes('sh-')) {
        this.buildSH350i(root, colorHex, frontWheelPivots, spinningWheels, brakeLights, headlights);
      } else if (id.includes('ducati') || id.includes('panigale')) {
        this.buildDucatiPanigale(root, colorHex, frontWheelPivots, spinningWheels, brakeLights, headlights);
      } else {
        this.buildGenericSportBike(root, colorHex, frontWheelPivots, spinningWheels, brakeLights, headlights);
      }
    } else {
      if (id.includes('cybertruck')) {
        this.buildCybertruck(root, colorHex, frontWheelPivots, spinningWheels, brakeLights, headlights);
      } else if (id.includes('rolls') || id.includes('maybach') || cfg.bodyType === 'sedan') {
        this.buildLuxurySedan(root, colorHex, frontWheelPivots, spinningWheels, brakeLights, headlights);
      } else if (id.includes('g63') || id.includes('vf9') || cfg.bodyType === 'suv' || cfg.bodyType === 'truck') {
        this.buildLuxurySUV(root, colorHex, frontWheelPivots, spinningWheels, brakeLights, headlights);
      } else if (id.includes('bugatti')) {
        this.buildBugattiChiron(root, colorHex, frontWheelPivots, spinningWheels, brakeLights, headlights);
      } else if (id.includes('porsche') || id.includes('gt3')) {
        this.buildPorscheGT3RS(root, colorHex, frontWheelPivots, spinningWheels, brakeLights, headlights);
      } else if (id.includes('jesko') || id.includes('valkyrie') || id.includes('p1') || cfg.bodyType === 'hypercar') {
        this.buildKoenigseggHypercar(root, colorHex, frontWheelPivots, spinningWheels, brakeLights, headlights);
      } else {
        this.buildGenericSupercar(root, colorHex, frontWheelPivots, spinningWheels, brakeLights, headlights);
      }
    }

    return { root, frontWheelPivots, spinningWheels, brakeLights, headlights };
  }

  // =========================================================================
  // 1. SUPERCARS & HYPERCARS
  // =========================================================================

  /**
   * High-detail Bugatti Chiron / Tourbillon Hypercar
   */
  public static buildBugattiChiron(
    root: THREE.Group,
    colorHex: string,
    frontPivots: THREE.Group[],
    spinningWheels: THREE.Mesh[],
    brakes: THREE.Mesh[],
    headlights: THREE.Mesh[]
  ): void {
    const paintMat = materialLib.getCarPaintMaterial(colorHex, 0.92, 0.12);
    const carbonMat = materialLib.getMetalMaterial('darkSteel');
    const glassMat = materialLib.getGlassMaterial(0x0284c7, 0.85);

    // 1. Lower Aerodynamic Monocoque Chassis
    const underbody = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.22, 4.6), carbonMat);
    underbody.position.y = 0.28;
    underbody.castShadow = true;
    underbody.receiveShadow = true;
    root.add(underbody);

    // Front Splitter & Carbon Diffuser
    const splitter = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.08, 0.8), carbonMat);
    splitter.position.set(0, 0.22, 2.2);
    root.add(splitter);

    const diffuser = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.18, 0.6), carbonMat);
    diffuser.position.set(0, 0.32, -2.25);
    root.add(diffuser);

    // 2. Main Sculpted Body & Signature Bugatti 'C-Line' Side Profile
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.52, 4.2), paintMat);
    mainBody.position.set(0, 0.54, 0);
    mainBody.castShadow = true;
    root.add(mainBody);

    // Sculpted Hood / Bonnet
    const hoodGeo = new THREE.BoxGeometry(1.6, 0.22, 1.6);
    const hood = new THREE.Mesh(hoodGeo, paintMat);
    hood.position.set(0, 0.68, 1.2);
    hood.rotation.x = 0.12;
    root.add(hood);

    // Bugatti Horseshoe Horseshoe Chrome Grille
    const horseshoeGeo = new THREE.TorusGeometry(0.32, 0.06, 16, 24, Math.PI);
    const horseshoe = new THREE.Mesh(horseshoeGeo, materialLib.getMetalMaterial('chrome'));
    horseshoe.rotation.z = Math.PI;
    horseshoe.position.set(0, 0.48, 2.32);
    root.add(horseshoe);

    // Chrome Mesh inside Grille
    const meshInner = new THREE.Mesh(new THREE.CircleGeometry(0.28, 16, 0, Math.PI), carbonMat);
    meshInner.position.set(0, 0.48, 2.31);
    root.add(meshInner);

    // 3. Iconic Teardrop Glass Cockpit & Interior
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.48, 2.1), glassMat);
    cabin.position.set(0, 1.0, -0.15);
    cabin.castShadow = true;
    root.add(cabin);

    // Interior: Sport Steering Wheel & Leather Bucket Seats
    const interior = this.createCarInterior();
    interior.position.set(0, 0.5, 0);
    root.add(interior);

    // 4. Quad-LED Projector Headlights (Signature 4-dot Bugatti cluster)
    [-0.72, 0.72].forEach(hx => {
      const cluster = new THREE.Group();
      cluster.position.set(hx, 0.62, 2.22);
      for (let i = 0; i < 4; i++) {
        const dot = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.05), materialLib.getEmissiveMaterial(0x38bdf8));
        dot.position.x = (i - 1.5) * 0.08;
        cluster.add(dot);
        headlights.push(dot);
      }
      root.add(cluster);
    });

    // 5. Full-Width Continuous Horizon LED Tail Light
    const tailBar = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.06, 0.08), materialLib.getEmissiveMaterial(0xff1e1e));
    tailBar.position.set(0, 0.72, -2.28);
    root.add(tailBar);
    brakes.push(tailBar);

    // Quad Exhaust Tips (Titanium Inconel Exhaust)
    [-0.15, 0.15].forEach(ex => {
      const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.25, 16), materialLib.getMetalMaterial('chrome'));
      tip.rotation.x = Math.PI / 2;
      tip.position.set(ex, 0.42, -2.32);
      root.add(tip);
    });

    // 6. Active Aerodynamic Rear Wing
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.05, 0.38), carbonMat);
    wing.position.set(0, 1.08, -1.95);
    wing.rotation.x = -0.05;
    root.add(wing);

    // 7. Rigged Wheels with Alloy Rims, Calipers & Discs
    this.attachCarWheels(root, 1.55, -1.55, 0.98, 0.38, 0.28, frontPivots, spinningWheels, 0xfacc15); // Yellow calipers
  }

  /**
   * Porsche 911 GT3 RS Track Weapon (Swan-Neck Wing, Fender Louvers)
   */
  public static buildPorscheGT3RS(
    root: THREE.Group,
    colorHex: string,
    frontPivots: THREE.Group[],
    spinningWheels: THREE.Mesh[],
    brakes: THREE.Mesh[],
    headlights: THREE.Mesh[]
  ): void {
    const paintMat = materialLib.getCarPaintMaterial(colorHex, 0.9, 0.15);
    const carbonMat = materialLib.getMetalMaterial('darkSteel');
    const glassMat = materialLib.getGlassMaterial(0x0284c7, 0.85);

    // Main Chassis Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.55, 4.4), paintMat);
    body.position.set(0, 0.54, 0);
    body.castShadow = true;
    root.add(body);

    // Front Sloping 911 Hood with Carbon Extraction Vents
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.22, 1.7), paintMat);
    hood.position.set(0, 0.65, 1.25);
    hood.rotation.x = 0.18;
    root.add(hood);

    // Carbon Louvers on Front Fenders
    [-0.78, 0.78].forEach(fx => {
      for (let l = 0; l < 4; l++) {
        const louver = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.06), carbonMat);
        louver.position.set(fx, 0.74, 1.2 + l * 0.1);
        louver.rotation.x = 0.2;
        root.add(louver);
      }
    });

    // Glass Greenhouse / Cabin (Curved 911 Silhouette)
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.52, 2.3), glassMat);
    cabin.position.set(0, 1.05, -0.2);
    root.add(cabin);

    // Interior Roll Cage & Seats
    const rollCage = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.3), materialLib.getMetalMaterial('steel'));
    rollCage.position.set(0, 1.0, -0.6);
    rollCage.rotation.z = Math.PI / 4;
    root.add(rollCage);

    const interior = this.createCarInterior();
    interior.position.set(0, 0.5, 0);
    root.add(interior);

    // Iconic Round Porsche Matrix Headlights
    [-0.68, 0.68].forEach(hx => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 12, 24), materialLib.getEmissiveMaterial(0xffffff));
      ring.position.set(hx, 0.68, 2.15);
      ring.rotation.x = 0.25;
      root.add(ring);
      headlights.push(ring);
    });

    // Giant Swan-Neck Carbon Rear Wing
    const wing = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.06, 0.45), carbonMat);
    wing.position.set(0, 1.45, -1.95);
    root.add(wing);

    [-0.55, 0.55].forEach(sx => {
      const swanStrut = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.2), carbonMat);
      swanStrut.position.set(sx, 1.2, -1.95);
      swanStrut.rotation.x = -0.15;
      root.add(swanStrut);
    });

    // Slim Continuous Red Taillight
    const tail = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.06), materialLib.getEmissiveMaterial(0xff1e1e));
    tail.position.set(0, 0.72, -2.22);
    root.add(tail);
    brakes.push(tail);

    // Rigged Wheels with Red Brembo Calipers
    this.attachCarWheels(root, 1.45, -1.45, 0.95, 0.38, 0.28, frontPivots, spinningWheels, 0xdc2626);
  }

  /**
   * Ultra-Aerodynamic Koenigsegg / Valkyrie Hypercar
   */
  public static buildKoenigseggHypercar(
    root: THREE.Group,
    colorHex: string,
    frontPivots: THREE.Group[],
    spinningWheels: THREE.Mesh[],
    brakes: THREE.Mesh[],
    headlights: THREE.Mesh[]
  ): void {
    const paintMat = materialLib.getCarPaintMaterial(colorHex, 0.95, 0.08);
    const carbonMat = materialLib.getMetalMaterial('darkSteel');
    const glassMat = materialLib.getGlassMaterial(0x0284c7, 0.85);

    // Low-slung Le Mans Hypercar Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.08, 0.46, 4.6), paintMat);
    body.position.set(0, 0.48, 0);
    body.castShadow = true;
    root.add(body);

    // Center Cockpit Dome Bubble Canopy
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), glassMat);
    canopy.position.set(0, 0.7, -0.1);
    canopy.scale.set(0.8, 0.65, 1.6);
    root.add(canopy);

    // Roof Air Scoop
    const scoop = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.8), carbonMat);
    scoop.position.set(0, 1.22, -0.5);
    root.add(scoop);

    // Top-Mounted Dual Boomerang Rear Wing
    const wing = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.06, 0.42), carbonMat);
    wing.position.set(0, 1.38, -2.1);
    root.add(wing);

    // Vertical Shark Fin
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.4, 1.4), carbonMat);
    fin.position.set(0, 1.15, -1.3);
    root.add(fin);

    // Rigged Wheels with Ceramic Calipers
    this.attachCarWheels(root, 1.6, -1.6, 1.02, 0.38, 0.3, frontPivots, spinningWheels, 0xf97316);

    // Headlights and Taillights
    [-0.75, 0.75].forEach(x => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, 0.1), materialLib.getEmissiveMaterial(0x38bdf8));
      hl.position.set(x, 0.55, 2.25);
      root.add(hl);
      headlights.push(hl);

      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.08), materialLib.getEmissiveMaterial(0xff1e1e));
      tl.position.set(x, 0.62, -2.25);
      root.add(tl);
      brakes.push(tl);
    });
  }

  /**
   * Generic High-Performance Supercar (Ferrari / Lamborghini style)
   */
  public static buildGenericSupercar(
    root: THREE.Group,
    colorHex: string,
    frontPivots: THREE.Group[],
    spinningWheels: THREE.Mesh[],
    brakes: THREE.Mesh[],
    headlights: THREE.Mesh[]
  ): void {
    const paintMat = materialLib.getCarPaintMaterial(colorHex, 0.88, 0.15);
    const carbonMat = materialLib.getMetalMaterial('darkSteel');
    const glassMat = materialLib.getGlassMaterial(0x0284c7, 0.85);

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.58, 4.4), paintMat);
    body.position.set(0, 0.56, 0);
    body.castShadow = true;
    root.add(body);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.52, 2.2), glassMat);
    cabin.position.set(0, 1.05, -0.15);
    root.add(cabin);

    const interior = this.createCarInterior();
    interior.position.set(0, 0.5, 0);
    root.add(interior);

    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.05, 0.35), carbonMat);
    wing.position.set(0, 1.15, -2.05);
    root.add(wing);

    [-0.72, 0.72].forEach(x => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 0.1), materialLib.getEmissiveMaterial(0xffffff));
      hl.position.set(x, 0.6, 2.22);
      root.add(hl);
      headlights.push(hl);

      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.1, 0.08), materialLib.getEmissiveMaterial(0xff1e1e));
      tl.position.set(x, 0.68, -2.22);
      root.add(tl);
      brakes.push(tl);
    });

    this.attachCarWheels(root, 1.45, -1.45, 0.96, 0.38, 0.28, frontPivots, spinningWheels, 0xdc2626);
  }

  // =========================================================================
  // 2. LUXURY SEDANS & SUVS
  // =========================================================================

  /**
   * Ultra-Luxury Executive Sedan (Rolls-Royce Phantom / Maybach S680)
   */
  public static buildLuxurySedan(
    root: THREE.Group,
    colorHex: string,
    frontPivots: THREE.Group[],
    spinningWheels: THREE.Mesh[],
    brakes: THREE.Mesh[],
    headlights: THREE.Mesh[]
  ): void {
    const paintMat = materialLib.getCarPaintMaterial(colorHex, 0.95, 0.05); // Deep Piano Mirror Gloss
    const chromeMat = materialLib.getMetalMaterial('chrome');
    const glassMat = materialLib.getGlassMaterial(0x0284c7, 0.9);

    // Stately, Monolithic Extended Sedan Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.72, 5.2), paintMat);
    body.position.set(0, 0.66, 0);
    body.castShadow = true;
    root.add(body);

    // Elongated Luxury Greenhouse / Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.65, 2.8), glassMat);
    cabin.position.set(0, 1.3, -0.2);
    root.add(cabin);

    // Chrome Window Surrounds
    const chromeSurround = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.04, 2.84), chromeMat);
    chromeSurround.position.set(0, 1.62, -0.2);
    root.add(chromeSurround);

    // Imposing Vertical Pantheon Chrome Grille
    const grille = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.68, 0.12), chromeMat);
    grille.position.set(0, 0.76, 2.62);
    root.add(grille);

    // Spirit of Ecstasy / Hood Ornament
    const ornament = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), chromeMat);
    ornament.position.set(0, 1.12, 2.58);
    root.add(ornament);

    // Laser Headlights with Daytime Running Light Brows
    [-0.78, 0.78].forEach(x => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.15, 0.1), materialLib.getEmissiveMaterial(0xffffff));
      hl.position.set(x, 0.75, 2.58);
      root.add(hl);
      headlights.push(hl);

      const drl = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.03, 0.02), materialLib.getEmissiveMaterial(0x38bdf8));
      drl.position.set(x, 0.84, 2.64);
      root.add(drl);

      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.35, 0.08), materialLib.getEmissiveMaterial(0xff1e1e));
      tl.position.set(x, 0.75, -2.62);
      root.add(tl);
      brakes.push(tl);
    });

    // Plush VIP Interior (Dual Executive Lounge Rear Seats & Starry Headliner)
    const interior = this.createCarInterior(true);
    interior.position.set(0, 0.55, -0.2);
    root.add(interior);

    // 22-Inch Chrome Forged Dish Wheels
    this.attachCarWheels(root, 1.7, -1.7, 1.02, 0.42, 0.28, frontPivots, spinningWheels, 0x1e293b, true);
  }

  /**
   * Tesla Cybertruck Angular Exoskeleton
   */
  public static buildCybertruck(
    root: THREE.Group,
    _colorHex: string,
    frontPivots: THREE.Group[],
    spinningWheels: THREE.Mesh[],
    brakes: THREE.Mesh[],
    headlights: THREE.Mesh[]
  ): void {
    const stainlessMat = materialLib.getMetalMaterial('steel');
    const tintedGlassMat = materialLib.getGlassMaterial(0x0f172a, 0.95);

    // Triangular Origami Exoskeleton Body
    const bodyGeo = new THREE.BoxGeometry(2.18, 0.95, 5.1);
    const body = new THREE.Mesh(bodyGeo, stainlessMat);
    body.position.set(0, 0.82, 0);
    body.castShadow = true;
    root.add(body);

    // Peak Roof Peak (Apex at B-Pillar)
    const apexGeo = new THREE.ConeGeometry(1.6, 0.85, 4);
    const apex = new THREE.Mesh(apexGeo, stainlessMat);
    apex.rotation.y = Math.PI / 4;
    apex.position.set(0, 1.65, 0.1);
    root.add(apex);

    // Angular Glass Roof
    const glassApex = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.4, 2.6), tintedGlassMat);
    glassApex.position.set(0, 1.45, 0.1);
    root.add(glassApex);

    // Continuous Front LED Lightbar
    const lightBar = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.05, 0.06), materialLib.getEmissiveMaterial(0xffffff));
    lightBar.position.set(0, 1.15, 2.56);
    root.add(lightBar);
    headlights.push(lightBar);

    // Full-Width Red Rear Lightbar
    const rearBar = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.05, 0.06), materialLib.getEmissiveMaterial(0xff1e1e));
    rearBar.position.set(0, 1.25, -2.56);
    root.add(rearBar);
    brakes.push(rearBar);

    // 35-inch All-Terrain Cyber Wheels
    this.attachCarWheels(root, 1.7, -1.7, 1.05, 0.46, 0.32, frontPivots, spinningWheels, 0x0f172a);
  }

  /**
   * Rugged Luxury SUV (Mercedes G-Wagen G63 / VinFast VF9)
   */
  public static buildLuxurySUV(
    root: THREE.Group,
    colorHex: string,
    frontPivots: THREE.Group[],
    spinningWheels: THREE.Mesh[],
    brakes: THREE.Mesh[],
    headlights: THREE.Mesh[]
  ): void {
    const paintMat = materialLib.getCarPaintMaterial(colorHex, 0.85, 0.2);
    const blackMat = materialLib.getMetalMaterial('darkSteel');
    const glassMat = materialLib.getGlassMaterial(0x0284c7, 0.85);

    // Boxy Tall Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.15, 1.1, 4.8), paintMat);
    body.position.set(0, 0.95, 0);
    body.castShadow = true;
    root.add(body);

    // Glass Windows
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.7, 3.2), glassMat);
    cabin.position.set(0, 1.75, -0.3);
    root.add(cabin);

    // Flared Off-Road Fender Arches
    [-1.12, 1.12].forEach(fx => {
      [1.5, -1.5].forEach(fz => {
        const arch = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.4, 0.95), blackMat);
        arch.position.set(fx, 0.75, fz);
        root.add(arch);
      });
    });

    // Rear Mounted Spare Tire Cover
    const spare = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.25, 24), blackMat);
    spare.rotation.x = Math.PI / 2;
    spare.position.set(0, 1.25, -2.52);
    root.add(spare);

    // Round Bull-Bar Headlights
    [-0.75, 0.75].forEach(x => {
      const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 16), materialLib.getEmissiveMaterial(0xffffff));
      hl.rotation.x = Math.PI / 2;
      hl.position.set(x, 1.05, 2.42);
      root.add(hl);
      headlights.push(hl);

      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.08), materialLib.getEmissiveMaterial(0xff1e1e));
      tl.position.set(x, 0.8, -2.42);
      root.add(tl);
      brakes.push(tl);
    });

    this.attachCarWheels(root, 1.5, -1.5, 1.08, 0.44, 0.32, frontPivots, spinningWheels, 0xdc2626);
  }

  // =========================================================================
  // 3. ICONIC MOTORBIKES & SCOOTERS
  // =========================================================================

  /**
   * Honda Wave Alpha 110cc (National Icon with Wire Front Basket)
   */
  public static buildWaveAlpha(
    root: THREE.Group,
    _colorHex: string,
    frontPivots: THREE.Group[],
    spinningWheels: THREE.Mesh[],
    brakes: THREE.Mesh[],
    headlights: THREE.Mesh[]
  ): void {
    const redMat = materialLib.getCarPaintMaterial('#dc2626', 0.85, 0.2);
    const chromeMat = materialLib.getMetalMaterial('chrome');
    const blackMat = materialLib.getMetalMaterial('darkSteel');

    // Underbone Spine Frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.45, 1.5), redMat);
    frame.position.set(0, 0.65, 0);
    root.add(frame);

    // Legshields / Front Plastic Apron
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.6, 0.1), materialLib.getStuccoMaterial(0xffffff));
    shield.position.set(0, 0.72, 0.45);
    shield.rotation.x = 0.2;
    root.add(shield);

    // Wire Mesh Front Basket (Iconic Vietnamese Wave Alpha feature)
    const basket = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.32), blackMat);
    basket.position.set(0, 0.82, 0.82);
    root.add(basket);

    // Long Dual Vinyl Saddle
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.82), materialLib.getMetalMaterial('darkSteel'));
    seat.position.set(0, 0.88, -0.32);
    root.add(seat);

    // Rear Chrome Luggage Rack
    const rack = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.05, 0.35), chromeMat);
    rack.position.set(0, 0.9, -0.85);
    root.add(rack);

    // Chrome Kick-Down Exhaust Pipe
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 1.1, 16), chromeMat);
    exhaust.rotation.x = Math.PI / 2.2;
    exhaust.position.set(0.2, 0.32, -0.45);
    root.add(exhaust);

    // Front Steering Assembly (Handlebars, Headlight, Front Fork, Front Wheel)
    const frontAssembly = new THREE.Group();
    frontAssembly.position.set(0, 0.42, 0.85);
    root.add(frontAssembly);
    frontPivots.push(frontAssembly);

    // Chrome Dual Telescopic Fork
    [-0.12, 0.12].forEach(fx => {
      const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.85), chromeMat);
      fork.position.set(fx, 0.28, 0);
      fork.rotation.x = -0.22;
      frontAssembly.add(fork);
    });

    // Handlebar & Halogen Headlight
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.78), blackMat);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(0, 0.72, -0.05);
    frontAssembly.add(handle);

    const headlight = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.12), materialLib.getEmissiveMaterial(0xfffbeb));
    headlight.position.set(0, 0.58, 0.12);
    frontAssembly.add(headlight);
    headlights.push(headlight);

    // Thin 17-Inch Spoke Wheels
    const frontWheel = this.createMotorbikeWheel(0.42, 0.08, true);
    frontAssembly.add(frontWheel);
    spinningWheels.push(frontWheel);

    const rearWheel = this.createMotorbikeWheel(0.42, 0.08, true);
    rearWheel.position.set(0, 0.42, -0.85);
    root.add(rearWheel);
    spinningWheels.push(rearWheel);

    // Rear Taillight & Amber Indicators
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.08), materialLib.getEmissiveMaterial(0xff1e1e));
    tail.position.set(0, 0.78, -0.88);
    root.add(tail);
    brakes.push(tail);

    // Sitting Commuter Rider
    const rider = this.createRider(false);
    rider.position.set(0, 0, 0);
    root.add(rider);
  }

  /**
   * Honda Dream II (Legendary Classic with Rectangular Headlight & Brown Saddle)
   */
  public static buildDreamII(
    root: THREE.Group,
    _colorHex: string,
    frontPivots: THREE.Group[],
    spinningWheels: THREE.Mesh[],
    brakes: THREE.Mesh[],
    headlights: THREE.Mesh[]
  ): void {
    const maroonMat = materialLib.getCarPaintMaterial('#451a03', 0.85, 0.15); // Deep Maroon Dream II Color
    const chromeMat = materialLib.getMetalMaterial('chrome');
    const goldMat = materialLib.getMetalMaterial('gold');

    // Step-Through Frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.48, 1.5), maroonMat);
    frame.position.set(0, 0.65, 0);
    root.add(frame);

    // Classic Dream Gold Wing Stripe
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.06, 0.8), goldMat);
    stripe.position.set(0, 0.78, 0.1);
    root.add(stripe);

    // Classic Brown Stitched Saddle
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.85), materialLib.getWoodMaterial('walnut'));
    seat.position.set(0, 0.89, -0.32);
    root.add(seat);

    // Front Steering with Rectangular Headlight
    const frontAssembly = new THREE.Group();
    frontAssembly.position.set(0, 0.42, 0.85);
    root.add(frontAssembly);
    frontPivots.push(frontAssembly);

    [-0.12, 0.12].forEach(fx => {
      const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.85), chromeMat);
      fork.position.set(fx, 0.28, 0);
      fork.rotation.x = -0.22;
      frontAssembly.add(fork);
    });

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.78), chromeMat);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(0, 0.72, -0.05);
    frontAssembly.add(handle);

    // Rectangular Dream Headlight
    const headlight = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.14), materialLib.getEmissiveMaterial(0xfffbeb));
    headlight.position.set(0, 0.62, 0.12);
    frontAssembly.add(headlight);
    headlights.push(headlight);

    // Spoke Wheels
    const frontWheel = this.createMotorbikeWheel(0.42, 0.08, true);
    frontAssembly.add(frontWheel);
    spinningWheels.push(frontWheel);

    const rearWheel = this.createMotorbikeWheel(0.42, 0.08, true);
    rearWheel.position.set(0, 0.42, -0.85);
    root.add(rearWheel);
    spinningWheels.push(rearWheel);

    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.08), materialLib.getEmissiveMaterial(0xff1e1e));
    tail.position.set(0, 0.78, -0.88);
    root.add(tail);
    brakes.push(tail);

    const rider = this.createRider(false);
    root.add(rider);
  }

  /**
   * Vespa 946 Christian Dior (Sculpted Italian Monocoque & Floating Saddle)
   */
  public static buildVespaDior(
    root: THREE.Group,
    _colorHex: string,
    frontPivots: THREE.Group[],
    spinningWheels: THREE.Mesh[],
    brakes: THREE.Mesh[],
    headlights: THREE.Mesh[]
  ): void {
    const creamMat = materialLib.getCarPaintMaterial('#fef3c7', 0.9, 0.1); // Dior Warm Beige
    const goldMat = materialLib.getMetalMaterial('gold');

    // Curvaceous Vespa Steel Monocoque Shell
    const bodyGeo = new THREE.SphereGeometry(0.45, 16, 16);
    const body = new THREE.Mesh(bodyGeo, creamMat);
    body.position.set(0, 0.7, -0.15);
    body.scale.set(0.65, 0.7, 1.8);
    root.add(body);

    // Floating Cantilever Saddle
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.65), materialLib.getWoodMaterial('oak'));
    seat.position.set(0, 0.92, -0.3);
    seat.rotation.x = -0.12;
    root.add(seat);

    // Dior Gold Pattern Side Accents
    [-0.32, 0.32].forEach(sx => {
      const goldTrim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.02, 8, 16), goldMat);
      goldTrim.position.set(sx, 0.65, -0.3);
      goldTrim.rotation.y = Math.PI / 2;
      root.add(goldTrim);
    });

    // Front Steering & Vintage Round Headlight
    const frontAssembly = new THREE.Group();
    frontAssembly.position.set(0, 0.38, 0.8);
    root.add(frontAssembly);
    frontPivots.push(frontAssembly);

    const roundLight = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), materialLib.getEmissiveMaterial(0xffffff));
    roundLight.position.set(0, 0.68, 0.12);
    frontAssembly.add(roundLight);
    headlights.push(roundLight);

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.72), goldMat);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(0, 0.7, 0);
    frontAssembly.add(handle);

    // 12-inch Alloy Scooter Wheels
    const frontWheel = this.createMotorbikeWheel(0.35, 0.12, false);
    frontAssembly.add(frontWheel);
    spinningWheels.push(frontWheel);

    const rearWheel = this.createMotorbikeWheel(0.35, 0.12, false);
    rearWheel.position.set(0, 0.35, -0.8);
    root.add(rearWheel);
    spinningWheels.push(rearWheel);

    const tail = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), materialLib.getEmissiveMaterial(0xff1e1e));
    tail.position.set(0, 0.75, -0.92);
    root.add(tail);
    brakes.push(tail);

    const rider = this.createRider(false);
    root.add(rider);
  }

  /**
   * Honda SH 350i Luxury Maxi Scooter
   */
  public static buildSH350i(
    root: THREE.Group,
    _colorHex: string,
    frontPivots: THREE.Group[],
    spinningWheels: THREE.Mesh[],
    brakes: THREE.Mesh[],
    headlights: THREE.Mesh[]
  ): void {
    const silverMat = materialLib.getCarPaintMaterial('#d4d4d8', 0.92, 0.15);
    const blackMat = materialLib.getMetalMaterial('darkSteel');

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.6, 1.8), silverMat);
    body.position.set(0, 0.7, 0);
    root.add(body);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.9), blackMat);
    seat.position.set(0, 0.92, -0.25);
    root.add(seat);

    const frontAssembly = new THREE.Group();
    frontAssembly.position.set(0, 0.42, 0.9);
    root.add(frontAssembly);
    frontPivots.push(frontAssembly);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.18, 0.15), materialLib.getEmissiveMaterial(0xffffff));
    head.position.set(0, 0.65, 0.1);
    frontAssembly.add(head);
    headlights.push(head);

    const frontWheel = this.createMotorbikeWheel(0.42, 0.12, false);
    frontAssembly.add(frontWheel);
    spinningWheels.push(frontWheel);

    const rearWheel = this.createMotorbikeWheel(0.42, 0.12, false);
    rearWheel.position.set(0, 0.42, -0.85);
    root.add(rearWheel);
    spinningWheels.push(rearWheel);

    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.08), materialLib.getEmissiveMaterial(0xff1e1e));
    tail.position.set(0, 0.8, -0.92);
    root.add(tail);
    brakes.push(tail);

    const rider = this.createRider(false);
    root.add(rider);
  }

  /**
   * Ducati Panigale V4 S Superbike (Racing Winglets & Aggressive Leaning Rider)
   */
  public static buildDucatiPanigale(
    root: THREE.Group,
    _colorHex: string,
    frontPivots: THREE.Group[],
    spinningWheels: THREE.Mesh[],
    brakes: THREE.Mesh[],
    headlights: THREE.Mesh[]
  ): void {
    const rossoMat = materialLib.getCarPaintMaterial('#dc2626', 0.95, 0.08); // Ducati Corse Red
    const goldMat = materialLib.getMetalMaterial('gold'); // Öhlins Gold Forks
    const carbonMat = materialLib.getMetalMaterial('darkSteel');

    // Trellis Frame & Sculpted Fairings
    const fairing = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.65, 1.7), rossoMat);
    fairing.position.set(0, 0.72, 0);
    root.add(fairing);

    // Aerodynamic Biplane Winglets
    [-0.28, 0.28].forEach(wx => {
      const winglet = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.25), carbonMat);
      winglet.position.set(wx, 0.85, 0.5);
      winglet.rotation.z = wx > 0 ? -0.2 : 0.2;
      root.add(winglet);
    });

    // Front Öhlins Fork & Clip-On Bars
    const frontAssembly = new THREE.Group();
    frontAssembly.position.set(0, 0.42, 0.85);
    root.add(frontAssembly);
    frontPivots.push(frontAssembly);

    [-0.14, 0.14].forEach(fx => {
      const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.85), goldMat);
      fork.position.set(fx, 0.28, 0);
      fork.rotation.x = -0.25;
      frontAssembly.add(fork);
    });

    // Twin Slit LED Headlights
    [-0.1, 0.1].forEach(lx => {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.08), materialLib.getEmissiveMaterial(0xffffff));
      eye.position.set(lx, 0.62, 0.18);
      frontAssembly.add(eye);
      headlights.push(eye);
    });

    // 17-inch Forged Racing Wheels
    const frontWheel = this.createMotorbikeWheel(0.42, 0.14, false);
    frontAssembly.add(frontWheel);
    spinningWheels.push(frontWheel);

    const rearWheel = this.createMotorbikeWheel(0.42, 0.18, false); // Wide 200/55 Rear Tire
    rearWheel.position.set(0, 0.42, -0.85);
    root.add(rearWheel);
    spinningWheels.push(rearWheel);

    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.06, 0.06), materialLib.getEmissiveMaterial(0xff1e1e));
    tail.position.set(0, 0.88, -0.85);
    root.add(tail);
    brakes.push(tail);

    // Crouching Track Racer
    const racer = this.createRider(true);
    root.add(racer);
  }

  public static buildGenericSportBike(
    root: THREE.Group,
    colorHex: string,
    frontPivots: THREE.Group[],
    spinningWheels: THREE.Mesh[],
    brakes: THREE.Mesh[],
    headlights: THREE.Mesh[]
  ): void {
    this.buildDucatiPanigale(root, colorHex, frontPivots, spinningWheels, brakes, headlights);
  }

  // =========================================================================
  // HELPER SUB-ASSEMBLIES & WHEELS
  // =========================================================================

  /**
   * Creates 4 complete car wheel assemblies (Tire, Alloy Rim, Brake Disc, Caliper)
   * Front wheels are attached to steering pivot groups.
   */
  private static attachCarWheels(
    root: THREE.Group,
    frontZ: number,
    rearZ: number,
    trackX: number,
    radius: number,
    width: number,
    frontPivots: THREE.Group[],
    spinningWheels: THREE.Mesh[],
    caliperColorHex: number = 0xdc2626,
    isChromeDish: boolean = false
  ): void {
    const tireMat = materialLib.getTireMaterial();
    const rimMat = isChromeDish ? materialLib.getMetalMaterial('chrome') : materialLib.getMetalMaterial('steel');
    const caliperMat = materialLib.getCarPaintMaterial(new THREE.Color(caliperColorHex), 0.9, 0.2);

    // Front Left & Right (In steering pivot groups)
    [-trackX, trackX].forEach((x, idx) => {
      const frontPivot = new THREE.Group();
      frontPivot.name = `FrontWheelPivot_${idx === 0 ? 'L' : 'R'}`;
      frontPivot.position.set(x, radius, frontZ);
      root.add(frontPivot);
      frontPivots.push(frontPivot);

      const wheelMesh = this.buildWheelMesh(radius, width, tireMat, rimMat, caliperMat, isChromeDish);
      frontPivot.add(wheelMesh);
      spinningWheels.push(wheelMesh);
    });

    // Rear Left & Right (Fixed axle)
    [-trackX, trackX].forEach((x, idx) => {
      const rearMount = new THREE.Group();
      rearMount.name = `RearWheelMount_${idx === 0 ? 'L' : 'R'}`;
      rearMount.position.set(x, radius, rearZ);
      root.add(rearMount);

      const wheelMesh = this.buildWheelMesh(radius, width * 1.15, tireMat, rimMat, caliperMat, isChromeDish);
      rearMount.add(wheelMesh);
      spinningWheels.push(wheelMesh);
    });
  }

  private static buildWheelMesh(
    radius: number,
    width: number,
    tireMat: THREE.Material,
    rimMat: THREE.Material,
    caliperMat: THREE.Material,
    isDish: boolean
  ): THREE.Mesh {
    const wheelGeo = new THREE.CylinderGeometry(radius, radius, width, 24);
    const wheel = new THREE.Mesh(wheelGeo, tireMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.castShadow = true;

    // Alloy Rim
    const rimRadius = radius * 0.65;
    const rimGeo = new THREE.CylinderGeometry(rimRadius, rimRadius, width + 0.02, isDish ? 24 : 16);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    wheel.add(rim);

    // Multi-Spoke Pattern
    if (!isDish) {
      for (let s = 0; s < 5; s++) {
        const spokeGeo = new THREE.BoxGeometry(0.04, rimRadius * 1.8, width + 0.03);
        const spoke = new THREE.Mesh(spokeGeo, rimMat);
        spoke.rotation.y = (s / 5) * Math.PI;
        wheel.add(spoke);
      }
    }

    // Brake Disc
    const discGeo = new THREE.CylinderGeometry(rimRadius * 0.8, rimRadius * 0.8, width * 0.5, 16);
    const disc = new THREE.Mesh(discGeo, materialLib.getMetalMaterial('steel'));
    wheel.add(disc);

    // Performance Caliper
    const caliperGeo = new THREE.BoxGeometry(0.12, 0.22, width * 0.6);
    const caliper = new THREE.Mesh(caliperGeo, caliperMat);
    caliper.position.set(0, rimRadius * 0.7, 0);
    wheel.add(caliper);

    return wheel;
  }

  /**
   * Motorbike Wheel Builder
   */
  private static createMotorbikeWheel(radius: number, width: number, isSpokes: boolean): THREE.Mesh {
    const wheelGeo = new THREE.CylinderGeometry(radius, radius, width, 24);
    const wheel = new THREE.Mesh(wheelGeo, materialLib.getTireMaterial());
    wheel.rotation.z = Math.PI / 2;

    const rimGeo = new THREE.CylinderGeometry(radius * 0.75, radius * 0.75, width + 0.02, 16);
    const rim = new THREE.Mesh(rimGeo, materialLib.getMetalMaterial(isSpokes ? 'chrome' : 'steel'));
    wheel.add(rim);

    if (isSpokes) {
      for (let s = 0; s < 8; s++) {
        const spoke = new THREE.Mesh(
          new THREE.BoxGeometry(0.015, radius * 1.4, 0.015),
          materialLib.getMetalMaterial('chrome')
        );
        spoke.rotation.y = (s / 8) * Math.PI;
        wheel.add(spoke);
      }
    }

    return wheel;
  }

  /**
   * Detailed Car Interior (Steering Wheel, Dashboard, Leather Seats)
   */
  private static createCarInterior(isLimo: boolean = false): THREE.Group {
    const interior = new THREE.Group();

    // Dashboard
    const dash = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.25, 0.6),
      materialLib.getMetalMaterial('darkSteel')
    );
    dash.position.set(0, 0.45, 0.6);
    interior.add(dash);

    // Sport Steering Wheel
    const wheelTorus = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.025, 12, 24),
      materialLib.getMetalMaterial('darkSteel')
    );
    wheelTorus.position.set(-0.35, 0.55, 0.35);
    wheelTorus.rotation.x = -0.4;
    interior.add(wheelTorus);

    // Front Bucket Seats
    [-0.35, 0.35].forEach(sx => {
      const seatBottom = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.15, 0.55),
        materialLib.getWoodMaterial('walnut')
      );
      seatBottom.position.set(sx, 0.2, 0);
      interior.add(seatBottom);

      const seatBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.55, 0.15),
        materialLib.getWoodMaterial('walnut')
      );
      seatBack.position.set(sx, 0.5, -0.22);
      seatBack.rotation.x = -0.15;
      interior.add(seatBack);
    });

    // Rear Executive Seats for Limo
    if (isLimo) {
      const rearBench = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.4, 0.6),
        materialLib.getWoodMaterial('walnut')
      );
      rearBench.position.set(0, 0.3, -0.9);
      interior.add(rearBench);
    }

    return interior;
  }

  /**
   * Motorbike Rider Model
   */
  private static createRider(isAggressiveTuck: boolean = false): THREE.Group {
    const rider = new THREE.Group();

    const suitMat = materialLib.getWallMaterial(isAggressiveTuck ? 0x991b1b : 0x1e293b, 0.5, 0.1);
    const helmetMat = materialLib.getCarPaintMaterial('#0f172a', 0.9, 0.15);

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.55, 0.25), suitMat);
    torso.position.set(0, isAggressiveTuck ? 1.15 : 1.25, isAggressiveTuck ? 0.0 : -0.2);
    torso.rotation.x = isAggressiveTuck ? 0.55 : 0.18;
    rider.add(torso);

    // Helmet
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), helmetMat);
    helmet.position.set(0, isAggressiveTuck ? 1.35 : 1.6, isAggressiveTuck ? 0.18 : -0.2);
    rider.add(helmet);

    // Helmet Dark Visor
    const visor = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 12, 12, 0, Math.PI),
      materialLib.getGlassMaterial(0x0284c7, 0.95)
    );
    visor.position.set(0, isAggressiveTuck ? 1.35 : 1.6, isAggressiveTuck ? 0.3 : -0.08);
    rider.add(visor);

    return rider;
  }
}
