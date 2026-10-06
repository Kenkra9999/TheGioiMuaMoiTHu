import * as THREE from 'three';
import { materialLib } from '../materials/MaterialLibrary';
import { HouseGenerator } from '../houses/HouseGenerator';

export type LightingTheme = 'day' | 'sunset' | 'night' | 'studio';

export interface SceneLightingResult {
  hemiLight: THREE.HemisphereLight;
  sunLight: THREE.DirectionalLight;
  fillLights: THREE.Light[];
}

/**
 * EnvironmentGenerator: Creates atmospheric 3D environments, rich highway corridors,
 * dynamic skylines, luxury estate surroundings, and multi-directional studio lighting rigs (zero black spots).
 */
export class EnvironmentGenerator {
  /**
   * Sets up 4-point omnidirectional lighting rig to eliminate any unlit or pitch-black crevices.
   */
  public static setupLighting(scene: THREE.Scene, theme: LightingTheme = 'night'): SceneLightingResult {
    // 1. Omnidirectional Ambient / Hemisphere light (Ensures zero black spots under chassis or eaves)
    let skyColor = 0xffffff;
    let groundColor = 0x64748b;
    let hemiIntensity = 2.4;
    let sunColor = 0xffffff;
    let sunIntensity = 2.8;

    if (theme === 'night') {
      skyColor = 0x60a5fa;
      groundColor = 0x1e293b;
      hemiIntensity = 1.8;
      sunColor = 0x93c5fd;
      sunIntensity = 1.6;
    } else if (theme === 'sunset') {
      skyColor = 0xfdba74;
      groundColor = 0x475569;
      hemiIntensity = 2.2;
      sunColor = 0xf97316;
      sunIntensity = 3.2;
    } else if (theme === 'studio') {
      skyColor = 0xffffff;
      groundColor = 0x94a3b8;
      hemiIntensity = 2.8;
      sunColor = 0xffffff;
      sunIntensity = 2.5;
    }

    const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, hemiIntensity);
    scene.add(hemiLight);

    // 2. Primary Key Sunlight with Soft Shadows
    const sunLight = new THREE.DirectionalLight(sunColor, sunIntensity);
    sunLight.position.set(30, 45, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -40;
    sunLight.shadow.camera.right = 40;
    sunLight.shadow.camera.top = 40;
    sunLight.shadow.camera.bottom = -40;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);

    // 3. Fill Lights (Counter-Key & Rim Lights)
    const fillLights: THREE.Light[] = [];

    // Left Fill Light
    const fill1 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    fill1.position.set(-30, 20, -20);
    scene.add(fill1);
    fillLights.push(fill1);

    // Rear Rim Light (Gives edge highlights to cars & roofs)
    const rim = new THREE.DirectionalLight(0xffedd5, 1.4);
    rim.position.set(0, 25, -40);
    scene.add(rim);
    fillLights.push(rim);

    // Ground Bounce Light (Prevents black undersides)
    const bounce = new THREE.DirectionalLight(0xe2e8f0, 0.8);
    bounce.position.set(0, -10, 0);
    scene.add(bounce);
    fillLights.push(bounce);

    return { hemiLight, sunLight, fillLights };
  }

  /**
   * Generates a dynamic infinite-looping highway city environment for the Driving Simulator.
   */
  public static buildDrivingWorld(theme: LightingTheme = 'night'): THREE.Group {
    const scenery = new THREE.Group();
    const roadLength = 1200;

    // 1. Multi-Lane Asphalt Expressway
    const roadGeo = new THREE.PlaneGeometry(24, roadLength);
    const roadMat = materialLib.getAsphaltMaterial();
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, 200);
    road.receiveShadow = true;
    scenery.add(road);

    // Concrete Curbs and Guardrails
    [-12.2, 12.2].forEach(gx => {
      const curbGeo = new THREE.BoxGeometry(0.6, 0.4, roadLength);
      const curb = new THREE.Mesh(curbGeo, materialLib.getStuccoMaterial(0x64748b));
      curb.position.set(gx, 0.15, 200);
      curb.receiveShadow = true;
      scenery.add(curb);

      const railGeo = new THREE.BoxGeometry(0.2, 0.5, roadLength);
      const rail = new THREE.Mesh(railGeo, materialLib.getMetalMaterial('steel'));
      rail.position.set(gx, 0.6, 200);
      scenery.add(rail);
    });

    // Outer Terrain Grass / Ground
    const groundGeo = new THREE.PlaneGeometry(350, roadLength);
    const groundMat = materialLib.getStoneMaterial(theme === 'night' ? 0x090d16 : 0x166534);
    const groundL = new THREE.Mesh(groundGeo, groundMat);
    groundL.rotation.x = -Math.PI / 2;
    groundL.position.set(-187, -0.05, 200);
    groundL.receiveShadow = true;
    scenery.add(groundL);

    const groundR = new THREE.Mesh(groundGeo, groundMat);
    groundR.rotation.x = -Math.PI / 2;
    groundR.position.set(187, -0.05, 200);
    groundR.receiveShadow = true;
    scenery.add(groundR);

    // Lane Markings
    for (let z = -200; z < 600; z += 12) {
      [-6, 0, 6].forEach(x => {
        const lineGeo = new THREE.BoxGeometry(0.35, 0.05, 5.5);
        const lineMat = materialLib.getEmissiveMaterial(x === 0 ? 0xf59e0b : 0xffffff);
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.position.set(x, 0.02, z);
        scenery.add(line);
      });
    }

    // Street Lamps, Palm Trees, and Distant Futuristic Towers
    for (let z = -150; z < 550; z += 35) {
      // Modern Curved Overhead Streetlamp Left
      const lampL = this.createOverheadStreetLamp(-14, z, 0x38bdf8);
      scenery.add(lampL);

      // Streetlamp Right
      const lampR = this.createOverheadStreetLamp(14, z, 0xf59e0b);
      lampR.rotation.y = Math.PI;
      scenery.add(lampR);

      // Roadside Palm Trees
      const palmL = HouseGenerator.createPalmTree(5.5);
      palmL.position.set(-17, 0, z + 15);
      scenery.add(palmL);

      const palmR = HouseGenerator.createPalmTree(5.5);
      palmR.position.set(17, 0, z + 15);
      scenery.add(palmR);

      // Skyscrapers & Architectural Landmarks flanking the highway
      const hL = 40 + Math.sin(z * 0.15) * 45;
      const bldgL = this.createCyberSkyscraper(18, hL, 22, 0x0f172a, 0x0284c7);
      bldgL.position.set(-45, hL / 2, z);
      scenery.add(bldgL);

      const hR = 40 + Math.cos(z * 0.15) * 45;
      const bldgR = this.createCyberSkyscraper(18, hR, 22, 0x0f172a, 0xec4899);
      bldgR.position.set(45, hR / 2, z);
      scenery.add(bldgR);
    }

    // Overhead Highway Electronic Gantry
    for (let z = 0; z < 500; z += 180) {
      const gantry = this.createOverheadGantry();
      gantry.position.set(0, 0, z);
      scenery.add(gantry);
    }

    return scenery;
  }

  /**
   * Modern Overhead Highway Streetlamp with Point Spotlight
   */
  public static createOverheadStreetLamp(x: number, z: number, glowHex: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.18, 9, 16),
      materialLib.getMetalMaterial('darkSteel')
    );
    pole.position.y = 4.5;
    group.add(pole);

    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.1, 0.15),
      materialLib.getMetalMaterial('darkSteel')
    );
    arm.position.set(1.6, 8.8, 0);
    group.add(arm);

    const luminaire = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.1, 0.3),
      materialLib.getEmissiveMaterial(glowHex)
    );
    luminaire.position.set(3.2, 8.7, 0);
    group.add(luminaire);

    return group;
  }

  /**
   * Overhead Highway Sign Gantry with Illuminated LED Billboard
   */
  public static createOverheadGantry(): THREE.Group {
    const gantry = new THREE.Group();

    // Steel Pillars on Left and Right
    [-13.5, 13.5].forEach(x => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 9.5, 16), materialLib.getMetalMaterial('steel'));
      p.position.set(x, 4.75, 0);
      gantry.add(p);
    });

    // Cross Truss
    const truss = new THREE.Mesh(new THREE.BoxGeometry(27.5, 0.6, 0.8), materialLib.getMetalMaterial('steel'));
    truss.position.set(0, 9.2, 0);
    gantry.add(truss);

    // Glowing Sign Board
    const board = new THREE.Mesh(new THREE.BoxGeometry(16, 2.2, 0.2), materialLib.getEmissiveMaterial(0x0284c7));
    board.position.set(0, 8.2, 0.4);
    gantry.add(board);

    return gantry;
  }

  /**
   * Distant City Skyscraper with glowing window bands
   */
  public static createCyberSkyscraper(
    w: number,
    h: number,
    d: number,
    baseColor: number,
    neonColor: number
  ): THREE.Group {
    const bldg = new THREE.Group();

    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      materialLib.getWallMaterial(baseColor, 0.2, 0.8)
    );
    tower.castShadow = true;
    bldg.add(tower);

    // Neon Vertical Accent Strips
    [-w / 2 + 0.2, w / 2 - 0.2].forEach(x => {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, h, 0.2),
        materialLib.getEmissiveMaterial(neonColor)
      );
      strip.position.set(x, 0, d / 2 + 0.1);
      bldg.add(strip);
    });

    return bldg;
  }
}
