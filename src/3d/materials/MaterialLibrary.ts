import * as THREE from 'three';

/**
 * MaterialLibrary: Centralized, reusable PBR material repository.
 * Caches materials by key to prevent redundant object creation and memory leaks.
 */
class MaterialLibrary {
  private cache: Map<string, THREE.Material> = new Map();

  // Wall Materials
  getWallMaterial(colorHex: number = 0xfef3c7, roughness: number = 0.35, metalness: number = 0.05): THREE.MeshStandardMaterial {
    const key = `wall_${colorHex}_${roughness}_${metalness}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness,
        metalness
      }));
    }
    return this.cache.get(key) as THREE.MeshStandardMaterial;
  }

  // White Stucco / Concrete
  getStuccoMaterial(colorHex: number = 0xf8fafc): THREE.MeshStandardMaterial {
    const key = `stucco_${colorHex}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.25,
        metalness: 0.05
      }));
    }
    return this.cache.get(key) as THREE.MeshStandardMaterial;
  }

  // Calacatta / Polished Marble
  getMarbleMaterial(colorHex: number = 0xf8fafc): THREE.MeshStandardMaterial {
    const key = `marble_${colorHex}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.1,
        metalness: 0.15
      }));
    }
    return this.cache.get(key) as THREE.MeshStandardMaterial;
  }

  // Hardwood / Cedar / Teak
  getWoodMaterial(type: 'teak' | 'walnut' | 'oak' | 'pine' = 'teak'): THREE.MeshStandardMaterial {
    const key = `wood_${type}`;
    if (!this.cache.has(key)) {
      const colors = {
        teak: 0x78350f,
        walnut: 0x451a03,
        oak: 0x92400e,
        pine: 0xb45309
      };
      this.cache.set(key, new THREE.MeshStandardMaterial({
        color: colors[type],
        roughness: 0.6,
        metalness: 0.05
      }));
    }
    return this.cache.get(key) as THREE.MeshStandardMaterial;
  }

  // Architectural Glass (Transparent, Reflective)
  getGlassMaterial(tint: number = 0x0284c7, opacity: number = 0.75): THREE.MeshStandardMaterial {
    const key = `glass_${tint}_${opacity}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new THREE.MeshStandardMaterial({
        color: tint,
        metalness: 0.95,
        roughness: 0.05,
        transparent: true,
        opacity
      }));
    }
    return this.cache.get(key) as THREE.MeshStandardMaterial;
  }

  // Glowing Interior Window (Simulates warm living space inside)
  getGlowWindowMaterial(glowHex: number = 0xfef08a, intensity: number = 0.5): THREE.MeshStandardMaterial {
    const key = `glow_win_${glowHex}_${intensity}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new THREE.MeshStandardMaterial({
        color: glowHex,
        emissive: glowHex,
        emissiveIntensity: intensity,
        roughness: 0.1,
        metalness: 0.1
      }));
    }
    return this.cache.get(key) as THREE.MeshStandardMaterial;
  }

  // Slate / Mansard Roof
  getRoofMaterial(colorHex: number = 0x1e293b, roughness: number = 0.4): THREE.MeshStandardMaterial {
    const key = `roof_${colorHex}_${roughness}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness,
        metalness: 0.2
      }));
    }
    return this.cache.get(key) as THREE.MeshStandardMaterial;
  }

  // Swimming Pool Water (Glowing Caustic Turquoise)
  getPoolWaterMaterial(): THREE.MeshStandardMaterial {
    const key = 'pool_water';
    if (!this.cache.has(key)) {
      this.cache.set(key, new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.45,
        roughness: 0.05,
        metalness: 0.8,
        transparent: true,
        opacity: 0.88
      }));
    }
    return this.cache.get(key) as THREE.MeshStandardMaterial;
  }

  // Fieldstone / Masonry Foundation
  getStoneMaterial(colorHex: number = 0x64748b): THREE.MeshStandardMaterial {
    const key = `stone_${colorHex}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.85,
        metalness: 0.1
      }));
    }
    return this.cache.get(key) as THREE.MeshStandardMaterial;
  }

  // Architectural Metals (Chrome, Steel, Bronze, Brass)
  getMetalMaterial(type: 'chrome' | 'steel' | 'bronze' | 'gold' | 'darkSteel' = 'steel'): THREE.MeshStandardMaterial {
    const key = `metal_${type}`;
    if (!this.cache.has(key)) {
      const configs = {
        chrome: { color: 0xffffff, metalness: 0.98, roughness: 0.05 },
        steel: { color: 0xd4d4d8, metalness: 0.92, roughness: 0.15 },
        bronze: { color: 0xd97706, metalness: 0.85, roughness: 0.25 },
        gold: { color: 0xf59e0b, metalness: 0.98, roughness: 0.08 },
        darkSteel: { color: 0x334155, metalness: 0.88, roughness: 0.3 }
      };
      const cfg = configs[type];
      this.cache.set(key, new THREE.MeshStandardMaterial(cfg));
    }
    return this.cache.get(key) as THREE.MeshStandardMaterial;
  }

  // High-Gloss Automotive Paint
  getCarPaintMaterial(color: string | THREE.Color = '#dc2626', metallic: number = 0.92, roughness: number = 0.12): THREE.MeshStandardMaterial {
    const hexStr = typeof color === 'string' ? color : `#${color.getHexString()}`;
    const key = `car_paint_${hexStr}_${metallic}_${roughness}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        metalness: metallic,
        roughness
      }));
    }
    return this.cache.get(key) as THREE.MeshStandardMaterial;
  }

  // Rubber Tire
  getTireMaterial(): THREE.MeshStandardMaterial {
    const key = 'tire_rubber';
    if (!this.cache.has(key)) {
      this.cache.set(key, new THREE.MeshStandardMaterial({
        color: 0x09090b,
        roughness: 0.85,
        metalness: 0.05
      }));
    }
    return this.cache.get(key) as THREE.MeshStandardMaterial;
  }

  // Tree & Plant Foliage
  getFoliageMaterial(type: 'palm' | 'pine' | 'hedge' | 'lawn' = 'hedge'): THREE.MeshStandardMaterial {
    const key = `foliage_${type}`;
    if (!this.cache.has(key)) {
      const colors = {
        palm: 0x16a34a,
        pine: 0x14532d,
        hedge: 0x15803d,
        lawn: 0x166534
      };
      this.cache.set(key, new THREE.MeshStandardMaterial({
        color: colors[type],
        roughness: 0.85,
        metalness: 0.05
      }));
    }
    return this.cache.get(key) as THREE.MeshStandardMaterial;
  }

  // Asphalt Road
  getAsphaltMaterial(): THREE.MeshStandardMaterial {
    const key = 'road_asphalt';
    if (!this.cache.has(key)) {
      this.cache.set(key, new THREE.MeshStandardMaterial({
        color: 0x16181f,
        roughness: 0.75,
        metalness: 0.15
      }));
    }
    return this.cache.get(key) as THREE.MeshStandardMaterial;
  }

  // Light Emissive (Headlights, Neon)
  getEmissiveMaterial(colorHex: number = 0xffffff): THREE.MeshBasicMaterial {
    const key = `basic_emissive_${colorHex}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new THREE.MeshBasicMaterial({ color: colorHex }));
    }
    return this.cache.get(key) as THREE.MeshBasicMaterial;
  }

  dispose() {
    this.cache.forEach(mat => mat.dispose());
    this.cache.clear();
  }
}

export const materialLib = new MaterialLibrary();
