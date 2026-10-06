import * as THREE from 'three';
import { materialLib } from '../materials/MaterialLibrary';

/**
 * Architectural House Generator
 * Creates game-ready, multi-layered architectural 3D models with high structural detail,
 * warm interior lighting, detailed fenestration, trims, balconies, and landscaping props.
 */
export class HouseGenerator {
  /**
   * Generates a complete house model matching the given item id / preset or procedural seed.
   */
  public static generateHouse(id: string = 'house-thaodien', seed: number = 1): THREE.Group {
    const houseGroup = new THREE.Group();
    houseGroup.name = `House_${id}`;

    switch (id) {
      case 'house-landmark81':
        return this.buildLandmark81();
      case 'house-thaodien':
        return this.buildThaoDienVilla();
      case 'house-chateau':
        return this.buildThanhThangChateau();
      case 'house-metropole':
        return this.buildMetropolePenthouse();
      case 'house-dalat':
        return this.buildDalatPineVilla();
      default:
        return this.buildProceduralVilla(seed);
    }
  }

  // =========================================================================
  // 1. BIỆT THỰ THẢO ĐIỀN (Modernist Cantilever Luxury Villa)
  // =========================================================================
  public static buildThaoDienVilla(): THREE.Group {
    const root = new THREE.Group();

    // 1. Ground Podia & Manicured Lawn
    const baseGeo = new THREE.BoxGeometry(26, 0.6, 22);
    const baseMat = materialLib.getStoneMaterial(0x475569);
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.3;
    base.receiveShadow = true;
    root.add(base);

    const lawnGeo = new THREE.BoxGeometry(25.6, 0.1, 21.6);
    const lawnMat = materialLib.getFoliageMaterial('lawn');
    const lawn = new THREE.Mesh(lawnGeo, lawnMat);
    lawn.position.y = 0.05;
    lawn.receiveShadow = true;
    root.add(lawn);

    // Driveway & Travertine Pathways
    const pathGeo = new THREE.BoxGeometry(6, 0.12, 10);
    const pathMat = materialLib.getMarbleMaterial(0xe2e8f0);
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.position.set(-7, 0.06, 6);
    path.receiveShadow = true;
    root.add(path);

    // 2. Ground Floor Living Pavilion (White Stucco & Teak Paneling)
    const gfGeo = new THREE.BoxGeometry(14, 3.8, 12);
    const gfMat = materialLib.getStuccoMaterial(0xf8fafc);
    const gf = new THREE.Mesh(gfGeo, gfMat);
    gf.position.set(0, 1.9, 0);
    gf.castShadow = true;
    gf.receiveShadow = true;
    root.add(gf);

    // Recessed Entrance Portal
    const portalGeo = new THREE.BoxGeometry(3.6, 3.2, 0.5);
    const portalMat = materialLib.getWoodMaterial('teak');
    const portal = new THREE.Mesh(portalGeo, portalMat);
    portal.position.set(-2.5, 1.6, 6.01);
    root.add(portal);

    // Pivot Front Door with Gold Long Bar Handle
    const doorGeo = new THREE.BoxGeometry(1.8, 2.8, 0.12);
    const doorMat = materialLib.getWoodMaterial('walnut');
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(-2.5, 1.4, 6.1);
    root.add(door);

    const handleGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.2, 16);
    const handleMat = materialLib.getMetalMaterial('gold');
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(-1.8, 1.4, 6.2);
    root.add(handle);

    // Ground Floor Floor-to-Ceiling Glass Curtain Walls
    const gfGlass1 = this.createGlassCurtainWall(7, 3.2, true);
    gfGlass1.position.set(3, 1.8, 6.02);
    root.add(gfGlass1);

    const gfGlassSide = this.createGlassCurtainWall(8, 3.2, true);
    gfGlassSide.rotation.y = Math.PI / 2;
    gfGlassSide.position.set(7.02, 1.8, 0);
    root.add(gfGlassSide);

    // 3. Cantilevered Upper Floor (Floating Teak & Charcoal Volume)
    const ufGeo = new THREE.BoxGeometry(16, 3.6, 13);
    const ufMat = materialLib.getWoodMaterial('teak');
    const uf = new THREE.Mesh(ufGeo, ufMat);
    uf.position.set(-1.5, 5.6, 0.5);
    uf.castShadow = true;
    uf.receiveShadow = true;
    root.add(uf);

    // Upper Master Suite Glass Facade & Shading Louvers
    const ufGlass = this.createGlassCurtainWall(10, 3.0, true);
    ufGlass.position.set(-1.5, 5.5, 7.02);
    root.add(ufGlass);

    // Teak Vertical Privacy Louvers
    for (let i = 0; i < 12; i++) {
      const louverGeo = new THREE.BoxGeometry(0.08, 3.2, 0.3);
      const louver = new THREE.Mesh(louverGeo, materialLib.getWoodMaterial('walnut'));
      louver.position.set(-6.5 + i * 0.35, 5.5, 7.15);
      louver.castShadow = true;
      root.add(louver);
    }

    // Wrap-Around Glass Balcony with Steel Handrails
    const balconyFloor = new THREE.Mesh(
      new THREE.BoxGeometry(16.4, 0.25, 2.2),
      materialLib.getStuccoMaterial(0x334155)
    );
    balconyFloor.position.set(-1.5, 3.75, 7.5);
    balconyFloor.castShadow = true;
    balconyFloor.receiveShadow = true;
    root.add(balconyFloor);

    const balconyGlass = new THREE.Mesh(
      new THREE.BoxGeometry(16.4, 1.1, 0.08),
      materialLib.getGlassMaterial(0x38bdf8, 0.45)
    );
    balconyGlass.position.set(-1.5, 4.4, 8.55);
    root.add(balconyGlass);

    const handrail = new THREE.Mesh(
      new THREE.BoxGeometry(16.4, 0.06, 0.12),
      materialLib.getMetalMaterial('darkSteel')
    );
    handrail.position.set(-1.5, 4.95, 8.55);
    root.add(handrail);

    // 4. Ultra-Luxury Infinity Pool with Glowing Turquoise Water
    const pool = this.createInfinityPool(10, 5, 1.2);
    pool.position.set(5.5, 0.1, -4.5);
    root.add(pool);

    // Sun Loungers by the pool
    const lounger1 = this.createSunLounger();
    lounger1.position.set(7.5, 0.15, -0.5);
    lounger1.rotation.y = Math.PI / 2;
    root.add(lounger1);

    const lounger2 = this.createSunLounger();
    lounger2.position.set(9.5, 0.15, -0.5);
    lounger2.rotation.y = Math.PI / 2;
    root.add(lounger2);

    // 5. Landscaping - Palm Trees and Architectural Hedges
    const palm1 = this.createPalmTree(4.5);
    palm1.position.set(-10, 0, 7);
    root.add(palm1);

    const palm2 = this.createPalmTree(5.5);
    palm2.position.set(10.5, 0, 8);
    root.add(palm2);

    const palm3 = this.createPalmTree(4.0);
    palm3.position.set(11, 0, -8);
    root.add(palm3);

    // Perimeter Boxwood Hedges
    for (let x = -12; x <= 12; x += 2) {
      if (Math.abs(x - (-7)) < 3.5) continue; // Skip driveway opening
      const hedge = this.createHedge(1.9, 1.2, 0.8);
      hedge.position.set(x, 0.6, 10.4);
      root.add(hedge);
    }

    // 6. Wall Sconce Lights (Warm Architectural Glow)
    const sconce1 = this.createSconce(0xfbbf24);
    sconce1.position.set(-3.7, 2.2, 6.05);
    root.add(sconce1);

    const sconce2 = this.createSconce(0xfbbf24);
    sconce2.position.set(-1.3, 2.2, 6.05);
    root.add(sconce2);

    // AC Compressors on the side service ledge
    const ac1 = this.createACUnit();
    ac1.position.set(-7.2, 1.0, -2);
    ac1.rotation.y = -Math.PI / 2;
    root.add(ac1);

    return root;
  }

  // =========================================================================
  // 2. LANDMARK 81 SKY VILLA (Iconic Stepped Skyscraper Spire)
  // =========================================================================
  public static buildLandmark81(): THREE.Group {
    const root = new THREE.Group();

    // Tower Podium Base with Grand Plaza
    const plazaGeo = new THREE.BoxGeometry(24, 0.8, 24);
    const plaza = new THREE.Mesh(plazaGeo, materialLib.getStoneMaterial(0x1e293b));
    plaza.position.y = -0.4;
    plaza.receiveShadow = true;
    root.add(plaza);

    // Water Mirror Fountains at entrance
    const fountainPlaza = this.createInfinityPool(18, 4, 0.4);
    fountainPlaza.position.set(0, 0.05, 9);
    root.add(fountainPlaza);

    // Stepped Monolith Bundles (Bamboo Bundle Architectural Concept)
    const tubePositions = [
      { x: -4, z: -4, h: 26 },
      { x: 0, z: -4, h: 32 },
      { x: 4, z: -4, h: 28 },
      { x: -4, z: 0, h: 34 },
      { x: 0, z: 0, h: 42 }, // Main Tower Center
      { x: 4, z: 0, h: 36 },
      { x: -4, z: 4, h: 22 },
      { x: 0, z: 4, h: 28 },
      { x: 4, z: 4, h: 24 }
    ];

    tubePositions.forEach(tube => {
      const geo = new THREE.BoxGeometry(3.8, tube.h, 3.8);
      const mesh = new THREE.Mesh(geo, materialLib.getGlassMaterial(0x0284c7, 0.85));
      mesh.position.set(tube.x, tube.h / 2, tube.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      root.add(mesh);

      // Floor Spandrels and Glowing Windows
      const floors = Math.floor(tube.h / 1.8);
      for (let f = 1; f < floors; f++) {
        const slabGeo = new THREE.BoxGeometry(3.9, 0.15, 3.9);
        const slab = new THREE.Mesh(slabGeo, materialLib.getMetalMaterial('steel'));
        slab.position.set(tube.x, f * 1.8, tube.z);
        root.add(slab);

        // Internal warm lit floor core
        const coreGeo = new THREE.BoxGeometry(3.5, 1.4, 3.5);
        const core = new THREE.Mesh(coreGeo, materialLib.getGlowWindowMaterial(0xfef08a, 0.4));
        core.position.set(tube.x, f * 1.8 - 0.9, tube.z);
        root.add(core);
      }

      // Crown Parapet
      const crownGeo = new THREE.BoxGeometry(3.9, 0.6, 3.9);
      const crown = new THREE.Mesh(crownGeo, materialLib.getMetalMaterial('darkSteel'));
      crown.position.set(tube.x, tube.h + 0.3, tube.z);
      root.add(crown);
    });

    // Central Spire Beacon (Iconic Crown needle)
    const spireGeo = new THREE.CylinderGeometry(0.15, 0.8, 12, 16);
    const spire = new THREE.Mesh(spireGeo, materialLib.getMetalMaterial('chrome'));
    spire.position.set(0, 48, 0);
    spire.castShadow = true;
    root.add(spire);

    // Glowing Red Aviation Warning Beacon at pinnacle
    const beaconGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const beacon = new THREE.Mesh(beaconGeo, materialLib.getEmissiveMaterial(0xef4444));
    beacon.position.set(0, 54.2, 0);
    root.add(beacon);

    // Skydeck Helipad on highest terrace
    const helipadLedge = new THREE.Mesh(
      new THREE.CylinderGeometry(4.2, 4.2, 0.4, 32),
      materialLib.getStuccoMaterial(0x334155)
    );
    helipadLedge.position.set(0, 42.2, 0);
    root.add(helipadLedge);

    // Helipad 'H' Marking
    const hMarkGeo = new THREE.BoxGeometry(2.4, 0.05, 0.4);
    const hMarkMat = materialLib.getEmissiveMaterial(0xfacc15);
    const h1 = new THREE.Mesh(hMarkGeo, hMarkMat);
    h1.position.set(0, 42.45, 0);
    root.add(h1);

    const h2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 2.4), hMarkMat);
    h2.position.set(-1.0, 42.45, 0);
    root.add(h2);

    const h3 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 2.4), hMarkMat);
    h3.position.set(1.0, 42.45, 0);
    root.add(h3);

    return root;
  }

  // =========================================================================
  // 3. LÂU ĐÀI THÀNH THẮNG (Neoclassical French Chateau & Classical Colonnade)
  // =========================================================================
  public static buildThanhThangChateau(): THREE.Group {
    const root = new THREE.Group();

    // 1. Classical Terraced Stone Base with Symmetrical Balustrades
    const terraceGeo = new THREE.BoxGeometry(26, 0.8, 20);
    const terraceMat = materialLib.getStoneMaterial(0x94a3b8);
    const terrace = new THREE.Mesh(terraceGeo, terraceMat);
    terrace.position.y = -0.4;
    terrace.receiveShadow = true;
    root.add(terrace);

    // Grand Central Imperial Steps
    for (let s = 0; s < 4; s++) {
      const stepGeo = new THREE.BoxGeometry(8 - s * 0.8, 0.2, 3 - s * 0.5);
      const step = new THREE.Mesh(stepGeo, materialLib.getMarbleMaterial(0xf1f5f9));
      step.position.set(0, 0.1 + s * 0.2, 10 + s * 0.4);
      step.receiveShadow = true;
      root.add(step);
    }

    // 2. Main Chateau Facade (Sandstone / Warm Limestone)
    const facadeGeo = new THREE.BoxGeometry(20, 6.8, 12);
    const facadeMat = materialLib.getWallMaterial(0xfef3c7, 0.4, 0.05); // Cream Limestone
    const facade = new THREE.Mesh(facadeGeo, facadeMat);
    facade.position.set(0, 3.4, 0);
    facade.castShadow = true;
    facade.receiveShadow = true;
    root.add(facade);

    // Symmetrical Corinthian / Classical Colonnade Portico
    for (let c = -3; c <= 3; c += 2) {
      const colGeo = new THREE.CylinderGeometry(0.3, 0.35, 6.2, 16);
      const col = new THREE.Mesh(colGeo, materialLib.getMarbleMaterial(0xffffff));
      col.position.set(c * 1.5, 3.1, 6.4);
      col.castShadow = true;
      root.add(col);

      // Capital & Base Trim
      const capGeo = new THREE.BoxGeometry(0.8, 0.25, 0.8);
      const cap = new THREE.Mesh(capGeo, materialLib.getMarbleMaterial(0xffffff));
      cap.position.set(c * 1.5, 6.2, 6.4);
      root.add(cap);

      const baseTrim = new THREE.Mesh(capGeo, materialLib.getMarbleMaterial(0xffffff));
      baseTrim.position.set(c * 1.5, 0.12, 6.4);
      root.add(baseTrim);
    }

    // Triangular Pediment over Portico
    const pedimentShape = new THREE.Shape();
    pedimentShape.moveTo(-5.5, 0);
    pedimentShape.lineTo(5.5, 0);
    pedimentShape.lineTo(0, 2.5);
    pedimentShape.closePath();

    const extrudeSettings = { depth: 0.8, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
    const pedimentGeo = new THREE.ExtrudeGeometry(pedimentShape, extrudeSettings);
    const pediment = new THREE.Mesh(pedimentGeo, materialLib.getMarbleMaterial(0xffffff));
    pediment.position.set(0, 6.8, 6.0);
    pediment.castShadow = true;
    root.add(pediment);

    // 3. Multi-Tiered French Mansard Slate Roof
    const roofBaseGeo = new THREE.BoxGeometry(20.8, 0.6, 12.8);
    const roofEntablature = new THREE.Mesh(roofBaseGeo, materialLib.getMarbleMaterial(0xffffff));
    roofEntablature.position.set(0, 7.1, 0);
    root.add(roofEntablature);

    const mansardGeo = new THREE.ConeGeometry(13, 4.5, 4);
    const mansardMat = materialLib.getRoofMaterial(0x1e293b, 0.35); // Blue-Slate Mansard
    const mansard = new THREE.Mesh(mansardGeo, mansardMat);
    mansard.position.set(0, 9.5, 0);
    mansard.rotation.y = Math.PI / 4;
    mansard.scale.set(1.4, 1.0, 0.9);
    mansard.castShadow = true;
    root.add(mansard);

    // Dormer Windows with Arched Gables on the Mansard
    for (let d = -2; d <= 2; d += 2) {
      const dormer = this.createDormerWindow();
      dormer.position.set(d * 3.5, 8.6, 4.8);
      root.add(dormer);
    }

    // Central Ornate Baroque Dome with Gold Finial
    const domeGeo = new THREE.SphereGeometry(2.8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = materialLib.getRoofMaterial(0x0f172a, 0.3);
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.set(0, 11.2, 0);
    dome.castShadow = true;
    root.add(dome);

    const finialGeo = new THREE.CylinderGeometry(0.06, 0.2, 2.0, 16);
    const finial = new THREE.Mesh(finialGeo, materialLib.getMetalMaterial('gold'));
    finial.position.set(0, 14.8, 0);
    root.add(finial);

    // 4. Detailed Arched Windows with Mullions and Sills
    for (let w = -3; w <= 3; w += 2) {
      if (Math.abs(w) === 1) continue; // Skip behind colonnade entrance
      // Ground Floor Windows
      const gfWin = this.createArchedWindow();
      gfWin.position.set(w * 2.6, 2.2, 6.05);
      root.add(gfWin);

      // Upper Floor Windows
      const ufWin = this.createArchedWindow();
      ufWin.position.set(w * 2.6, 5.0, 6.05);
      root.add(ufWin);
    }

    // Double Royal Entrance Door with Wrought Iron Grille
    const royalDoor = this.createRoyalDoor();
    royalDoor.position.set(0, 1.6, 6.05);
    root.add(royalDoor);

    // 5. Tiered Classical Marble Fountain in Front Courtyard
    const fountain = this.createTieredFountain();
    fountain.position.set(0, 0, 14);
    root.add(fountain);

    // Topiary Cone Shrubs
    for (let i = -1; i <= 1; i += 2) {
      const topiary = this.createTopiaryCone();
      topiary.position.set(i * 6, 0.4, 11);
      root.add(topiary);
    }

    return root;
  }

  // =========================================================================
  // 4. PENTHOUSE THE METROPOLE (Stepped Glass Sky Condominium with Sky Garden)
  // =========================================================================
  public static buildMetropolePenthouse(): THREE.Group {
    const root = new THREE.Group();

    // High-tech Podium
    const baseGeo = new THREE.BoxGeometry(22, 0.8, 18);
    const base = new THREE.Mesh(baseGeo, materialLib.getStoneMaterial(0x334155));
    base.position.y = -0.4;
    root.add(base);

    // Tiered Stepped High-Rise Condominium Structure
    const floors = [
      { y: 2.2, h: 4.4, w: 18, d: 14, glassW: 16 },
      { y: 6.6, h: 4.4, w: 15, d: 12, glassW: 13 },
      { y: 11.0, h: 4.4, w: 12, d: 10, glassW: 10 }
    ];

    floors.forEach((fl, idx) => {
      // Concrete Core and Columns
      const coreGeo = new THREE.BoxGeometry(fl.w, fl.h, fl.d);
      const coreMat = materialLib.getStuccoMaterial(0xf8fafc);
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(0, fl.y, 0);
      core.castShadow = true;
      core.receiveShadow = true;
      root.add(core);

      // Glass Curtain Wall
      const glass = this.createGlassCurtainWall(fl.glassW, fl.h - 0.6, true);
      glass.position.set(0, fl.y, fl.d / 2 + 0.05);
      root.add(glass);

      // Floor Divider Slabs with perimeter LED strips
      const slabGeo = new THREE.BoxGeometry(fl.w + 0.6, 0.35, fl.d + 0.6);
      const slab = new THREE.Mesh(slabGeo, materialLib.getMetalMaterial('darkSteel'));
      slab.position.set(0, fl.y + fl.h / 2, 0);
      root.add(slab);

      // Stepped Garden Terrace Balcony on tiers
      if (idx > 0) {
        const terraceRoof = new THREE.Mesh(
          new THREE.BoxGeometry(fl.w + 2, 0.2, 3),
          materialLib.getFoliageMaterial('lawn')
        );
        terraceRoof.position.set(0, fl.y - fl.h / 2 + 0.1, fl.d / 2 + 1.5);
        root.add(terraceRoof);

        // Glass Railing
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(fl.w + 2, 1.0, 0.05),
          materialLib.getGlassMaterial(0x38bdf8, 0.4)
        );
        rail.position.set(0, fl.y - fl.h / 2 + 0.6, fl.d / 2 + 3.0);
        root.add(rail);

        // Planter Boxes with flowers
        for (let p = -2; p <= 2; p++) {
          const planter = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.5, 0.5),
            materialLib.getFoliageMaterial('hedge')
          );
          planter.position.set(p * 2.2, fl.y - fl.h / 2 + 0.4, fl.d / 2 + 2.2);
          root.add(planter);
        }
      }
    });

    // Rooftop Sky Jacuzzi & Observation Lounge
    const jacuzzi = this.createInfinityPool(4, 3, 0.8);
    jacuzzi.position.set(2, 13.5, 1);
    root.add(jacuzzi);

    // Rooftop Pergola Canopy
    for (let b = 0; b < 6; b++) {
      const beamGeo = new THREE.BoxGeometry(6, 0.15, 0.2);
      const beam = new THREE.Mesh(beamGeo, materialLib.getWoodMaterial('teak'));
      beam.position.set(-2, 16.2, -2 + b * 0.8);
      root.add(beam);
    }

    return root;
  }

  // =========================================================================
  // 5. BIỆT THỰ ĐỒI THÔNG ĐÀ LẠT (Nordic A-Frame Pine Chalet & Stone Chimney)
  // =========================================================================
  public static buildDalatPineVilla(): THREE.Group {
    const root = new THREE.Group();

    // 1. Natural Stone Foundation & Hillside Decking
    const foundGeo = new THREE.BoxGeometry(22, 1.2, 18);
    const foundMat = materialLib.getStoneMaterial(0x475569);
    const foundation = new THREE.Mesh(foundGeo, foundMat);
    foundation.position.y = -0.6;
    foundation.receiveShadow = true;
    root.add(foundation);

    const deckGeo = new THREE.BoxGeometry(20, 0.25, 16);
    const deckMat = materialLib.getWoodMaterial('pine');
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.y = 0.12;
    deck.receiveShadow = true;
    root.add(deck);

    // 2. Steep Nordic A-Frame Timber Roof & Glass Gable
    const aFrameShape = new THREE.Shape();
    aFrameShape.moveTo(-7, 0);
    aFrameShape.lineTo(7, 0);
    aFrameShape.lineTo(0, 9.5);
    aFrameShape.closePath();

    const extrudeSettings = { depth: 12, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.1, bevelThickness: 0.1 };
    const aFrameGeo = new THREE.ExtrudeGeometry(aFrameShape, extrudeSettings);
    const roofMat = materialLib.getRoofMaterial(0x1e293b, 0.4);
    const aFrameMesh = new THREE.Mesh(aFrameGeo, roofMat);
    aFrameMesh.position.set(0, 0.2, -6);
    aFrameMesh.castShadow = true;
    aFrameMesh.receiveShadow = true;
    root.add(aFrameMesh);

    // Giant Triangular Glass Gable Facade (Floor-to-Ceiling Front View)
    const frontGlassShape = new THREE.Shape();
    frontGlassShape.moveTo(-6.6, 0);
    frontGlassShape.lineTo(6.6, 0);
    frontGlassShape.lineTo(0, 9.1);
    frontGlassShape.closePath();

    const frontGlassGeo = new THREE.ShapeGeometry(frontGlassShape);
    const frontGlass = new THREE.Mesh(frontGlassGeo, materialLib.getGlassMaterial(0x38bdf8, 0.65));
    frontGlass.position.set(0, 0.3, 6.05);
    root.add(frontGlass);

    // Internal Warm Glow & Timber Trusses
    const warmCore = new THREE.Mesh(frontGlassGeo, materialLib.getGlowWindowMaterial(0xfef08a, 0.45));
    warmCore.position.set(0, 0.3, 5.95);
    root.add(warmCore);

    // Timber Cross Mullions
    for (let y = 2.5; y <= 7.5; y += 2.5) {
      const w = 13.2 * (1 - y / 9.5);
      const mullion = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.12, 0.12),
        materialLib.getWoodMaterial('oak')
      );
      mullion.position.set(0, y, 6.1);
      root.add(mullion);
    }

    // 3. Heavy Stone Fireplace Chimney with Glowing Hearth
    const chimneyGeo = new THREE.BoxGeometry(2.2, 12.5, 2.2);
    const chimneyMat = materialLib.getStoneMaterial(0x334155);
    const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
    chimney.position.set(-5.5, 6.0, 0);
    chimney.castShadow = true;
    root.add(chimney);

    const chimneyCap = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.3, 2.6),
      materialLib.getMetalMaterial('darkSteel')
    );
    chimneyCap.position.set(-5.5, 12.3, 0);
    root.add(chimneyCap);

    // 4. Outdoor Firepit Deck & Wooden Adirondack Lounge Chairs
    const firepitBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.4, 0.4, 24),
      materialLib.getStoneMaterial(0x1e293b)
    );
    firepitBase.position.set(0, 0.3, 9.5);
    root.add(firepitBase);

    const fireGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      materialLib.getEmissiveMaterial(0xf97316)
    );
    fireGlow.position.set(0, 0.6, 9.5);
    root.add(fireGlow);

    // 5. Pine Forest Environment (Surrounding Layered Conifers)
    const pinePositions = [
      { x: -9, z: 8, h: 7 },
      { x: -10, z: -4, h: 8.5 },
      { x: 9, z: 7, h: 7.5 },
      { x: 10, z: -5, h: 9 },
      { x: 8, z: -9, h: 6.5 },
      { x: -8, z: -9, h: 7 }
    ];

    pinePositions.forEach(pos => {
      const pine = this.createPineTree(pos.h);
      pine.position.set(pos.x, 0, pos.z);
      root.add(pine);
    });

    return root;
  }

  // =========================================================================
  // 6. PROCEDURAL RESIDENTIAL VILLA GENERATOR (For Rich Neighborhood Variation)
  // =========================================================================
  public static buildProceduralVilla(seed: number): THREE.Group {
    const root = new THREE.Group();
    const rng = (offset: number) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

    // Determine Architectural Archetype
    const floors = 1 + Math.floor(rng(1) * 3); // 1 to 3 floors
    const width = 10 + rng(2) * 6; // 10 to 16
    const depth = 9 + rng(3) * 5;  // 9 to 14
    const wallColors = [0xf8fafc, 0xfef3c7, 0xe2e8f0, 0xfde68a, 0xf1f5f9];
    const wallColor = wallColors[Math.floor(rng(4) * wallColors.length)];

    // 1. Foundation Base
    const baseGeo = new THREE.BoxGeometry(width + 4, 0.4, depth + 4);
    const base = new THREE.Mesh(baseGeo, materialLib.getStoneMaterial(0x64748b));
    base.position.y = -0.2;
    base.receiveShadow = true;
    root.add(base);

    // 2. Multi-Story Main Volumes
    let currentY = 0;
    const floorH = 3.2;

    for (let f = 0; f < floors; f++) {
      currentY += floorH / 2;
      const fWidth = f === 0 ? width : width - rng(f * 2) * 2;
      const fDepth = f === 0 ? depth : depth - rng(f * 3) * 1.5;

      const flGeo = new THREE.BoxGeometry(fWidth, floorH, fDepth);
      const flMat = materialLib.getWallMaterial(wallColor, 0.35, 0.05);
      const flMesh = new THREE.Mesh(flGeo, flMat);
      flMesh.position.set(0, currentY, 0);
      flMesh.castShadow = true;
      flMesh.receiveShadow = true;
      root.add(flMesh);

      // Cornice Band between floors
      const corniceGeo = new THREE.BoxGeometry(fWidth + 0.3, 0.2, fDepth + 0.3);
      const cornice = new THREE.Mesh(corniceGeo, materialLib.getStuccoMaterial(0xffffff));
      cornice.position.set(0, currentY + floorH / 2, 0);
      root.add(cornice);

      // Windows on front facade
      const winCount = 2 + Math.floor(rng(f * 5) * 2);
      const spacing = fWidth / (winCount + 1);
      for (let w = 1; w <= winCount; w++) {
        if (f === 0 && w === 1) continue; // Reserve for Door
        const win = this.createFramedWindow(1.4, 1.8);
        win.position.set(-fWidth / 2 + w * spacing, currentY, fDepth / 2 + 0.02);
        root.add(win);
      }

      currentY += floorH / 2;
    }

    // 3. Roof System (Gabled vs Hip vs Flat Deck)
    const roofType = Math.floor(rng(9) * 3);
    if (roofType === 0) {
      // Gabled Roof
      const roofMesh = new THREE.Mesh(
        new THREE.ConeGeometry(width * 0.75, 2.5, 4),
        materialLib.getRoofMaterial(0x1e293b)
      );
      roofMesh.position.set(0, currentY + 1.25, 0);
      roofMesh.rotation.y = Math.PI / 4;
      roofMesh.castShadow = true;
      root.add(roofMesh);
    } else if (roofType === 1) {
      // Modern Parapet Flat Roof with Skylight
      const parapet = new THREE.Mesh(
        new THREE.BoxGeometry(width + 0.2, 0.6, depth + 0.2),
        materialLib.getStuccoMaterial(0x334155)
      );
      parapet.position.set(0, currentY + 0.3, 0);
      root.add(parapet);

      const skylight = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.4, 0.3, depth * 0.4),
        materialLib.getGlassMaterial(0x38bdf8, 0.8)
      );
      skylight.position.set(0, currentY + 0.3, 0);
      root.add(skylight);
    } else {
      // Hipped Roof
      const hipMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(width * 0.2, width * 0.7, 2.0, 4),
        materialLib.getRoofMaterial(0x78350f)
      );
      hipMesh.position.set(0, currentY + 1.0, 0);
      hipMesh.rotation.y = Math.PI / 4;
      hipMesh.castShadow = true;
      root.add(hipMesh);
    }

    // 4. Entrance Door & Canopy
    const door = this.createModernDoor();
    door.position.set(-width / 4, 1.1, depth / 2 + 0.05);
    root.add(door);

    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.12, 1.4),
      materialLib.getMetalMaterial('darkSteel')
    );
    canopy.position.set(-width / 4, 2.4, depth / 2 + 0.7);
    root.add(canopy);

    // 5. Landscaping Accents
    const tree = rng(10) > 0.5 ? this.createPalmTree(4.0) : this.createPineTree(5.0);
    tree.position.set(width / 2 + 1.5, 0, depth / 2 - 1.0);
    root.add(tree);

    return root;
  }

  // =========================================================================
  // REUSABLE ARCHITECTURAL SUB-ASSEMBLIES & PROPS
  // =========================================================================

  /**
   * High-detail Floor-to-Ceiling Glass Curtain Wall with Dark Bronze Mullions
   */
  public static createGlassCurtainWall(width: number, height: number, withGlow: boolean = true): THREE.Group {
    const wall = new THREE.Group();

    // Outer Glass Pane
    const glassGeo = new THREE.BoxGeometry(width, height, 0.06);
    const glassMat = materialLib.getGlassMaterial(0x0284c7, 0.55);
    const glass = new THREE.Mesh(glassGeo, glassMat);
    wall.add(glass);

    // Warm Interior Glow Backing (Gives feeling of an occupied luxury interior)
    if (withGlow) {
      const glowGeo = new THREE.BoxGeometry(width - 0.1, height - 0.1, 0.02);
      const glowMat = materialLib.getGlowWindowMaterial(0xfef08a, 0.35);
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.z = -0.05;
      wall.add(glow);
    }

    // Outer Structural Mullion Frame
    const frameGeo = new THREE.BoxGeometry(width + 0.08, height + 0.08, 0.14);
    // Wireframe-like thin structural border
    const borderTop = new THREE.Mesh(new THREE.BoxGeometry(width, 0.08, 0.14), materialLib.getMetalMaterial('darkSteel'));
    borderTop.position.y = height / 2;
    wall.add(borderTop);

    const borderBot = borderTop.clone();
    borderBot.position.y = -height / 2;
    wall.add(borderBot);

    // Vertical Mullion Dividers
    const divisions = Math.max(2, Math.floor(width / 1.5));
    const step = width / divisions;
    for (let i = 0; i <= divisions; i++) {
      const mul = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, height, 0.12),
        materialLib.getMetalMaterial('darkSteel')
      );
      mul.position.x = -width / 2 + i * step;
      wall.add(mul);
    }

    return wall;
  }

  /**
   * Recessed Window with Molded Frame, Sill, Mullions, and Glass
   */
  public static createFramedWindow(width: number = 1.4, height: number = 1.8): THREE.Group {
    const win = new THREE.Group();

    // Window Frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, 0.12),
      materialLib.getMetalMaterial('darkSteel')
    );
    win.add(frame);

    // Glass & Glow Core
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(width - 0.16, height - 0.16, 0.04),
      materialLib.getGlassMaterial(0x38bdf8, 0.7)
    );
    win.add(glass);

    const glow = new THREE.Mesh(
      new THREE.BoxGeometry(width - 0.2, height - 0.2, 0.02),
      materialLib.getGlowWindowMaterial(0xfef08a, 0.4)
    );
    glow.position.z = -0.02;
    win.add(glow);

    // Projecting Window Sill
    const sill = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.2, 0.08, 0.25),
      materialLib.getStuccoMaterial(0xffffff)
    );
    sill.position.set(0, -height / 2 - 0.04, 0.06);
    win.add(sill);

    // Cross Mullions
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(width - 0.16, 0.03, 0.06), materialLib.getMetalMaterial('darkSteel'));
    win.add(crossH);
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.03, height - 0.16, 0.06), materialLib.getMetalMaterial('darkSteel'));
    win.add(crossV);

    return win;
  }

  /**
   * Classical Arched French Window with Keystone
   */
  public static createArchedWindow(): THREE.Group {
    const win = new THREE.Group();

    // Rectangular Lower Frame
    const lower = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 2.0, 0.12),
      materialLib.getMarbleMaterial(0xffffff)
    );
    win.add(lower);

    // Arched Top
    const arch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 0.12, 16, 1, false, 0, Math.PI),
      materialLib.getMarbleMaterial(0xffffff)
    );
    arch.rotation.z = Math.PI / 2;
    arch.position.y = 1.0;
    win.add(arch);

    // Warm Interior Glowing Glass
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.8, 0.04),
      materialLib.getGlowWindowMaterial(0xfef08a, 0.5)
    );
    glass.position.y = -0.1;
    win.add(glass);

    // Keystone Accent
    const keystone = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.35, 0.18),
      materialLib.getMarbleMaterial(0xffffff)
    );
    keystone.position.set(0, 1.7, 0.04);
    win.add(keystone);

    return win;
  }

  /**
   * Mansard Dormer Window with Curved Pediment
   */
  public static createDormerWindow(): THREE.Group {
    const dormer = new THREE.Group();

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.8, 1.2),
      materialLib.getStuccoMaterial(0xffffff)
    );
    box.castShadow = true;
    dormer.add(box);

    const win = this.createFramedWindow(1.0, 1.2);
    win.position.set(0, 0, 0.61);
    dormer.add(win);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(1.2, 0.8, 4),
      materialLib.getRoofMaterial(0x1e293b)
    );
    roof.position.set(0, 1.3, 0);
    roof.rotation.y = Math.PI / 4;
    dormer.add(roof);

    return dormer;
  }

  /**
   * Modern Flush Wood Door with Transom Glass
   */
  public static createModernDoor(): THREE.Group {
    const doorGroup = new THREE.Group();

    // Frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 2.4, 0.1),
      materialLib.getMetalMaterial('darkSteel')
    );
    doorGroup.add(frame);

    // Wood Leaf
    const leaf = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 2.2, 0.06),
      materialLib.getWoodMaterial('walnut')
    );
    doorGroup.add(leaf);

    // Chrome Long Handle
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 1.0, 16),
      materialLib.getMetalMaterial('chrome')
    );
    handle.position.set(0.45, 0, 0.06);
    doorGroup.add(handle);

    return doorGroup;
  }

  /**
   * Royal Double Chateau Door with Gold Appliques
   */
  public static createRoyalDoor(): THREE.Group {
    const royal = new THREE.Group();

    // Marble Arch Surround
    const surround = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 3.4, 0.25),
      materialLib.getMarbleMaterial(0xffffff)
    );
    royal.add(surround);

    // Deep Mahogany Double Doors
    const doorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 3.0, 0.1),
      materialLib.getWoodMaterial('walnut')
    );
    doorMesh.position.z = 0.08;
    royal.add(doorMesh);

    // Gold Lion Knocker Accents
    for (let k = -1; k <= 1; k += 2) {
      const knocker = new THREE.Mesh(
        new THREE.TorusGeometry(0.08, 0.02, 8, 16),
        materialLib.getMetalMaterial('gold')
      );
      knocker.position.set(k * 0.45, 0.1, 0.15);
      royal.add(knocker);
    }

    return royal;
  }

  /**
   * Ultra-Realistic Infinity Swimming Pool with Mosaic Borders & Caustic Glow Water
   */
  public static createInfinityPool(width: number = 10, length: number = 5, depth: number = 1.2): THREE.Group {
    const pool = new THREE.Group();

    // Pool Coping / Surrounding Deck
    const deckGeo = new THREE.BoxGeometry(width + 1.2, 0.2, length + 1.2);
    const deckMat = materialLib.getMarbleMaterial(0xf1f5f9);
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.y = -0.1;
    deck.receiveShadow = true;
    pool.add(deck);

    // Recessed Blue Basin Walls
    const basinGeo = new THREE.BoxGeometry(width, depth, length);
    const basinMat = materialLib.getStuccoMaterial(0x0284c7);
    const basin = new THREE.Mesh(basinGeo, basinMat);
    basin.position.y = -depth / 2;
    pool.add(basin);

    // Glowing Crystal Water Surface
    const waterGeo = new THREE.PlaneGeometry(width - 0.1, length - 0.1);
    const waterMat = materialLib.getPoolWaterMaterial();
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.05;
    pool.add(water);

    // Underwater Pool Illumination Strip
    const lightStrip = new THREE.Mesh(
      new THREE.BoxGeometry(width - 0.2, 0.05, 0.05),
      materialLib.getEmissiveMaterial(0x38bdf8)
    );
    lightStrip.position.set(0, -depth + 0.2, -length / 2 + 0.05);
    pool.add(lightStrip);

    return pool;
  }

  /**
   * Classical 3-Tier Fountain with Water Jet
   */
  public static createTieredFountain(): THREE.Group {
    const fountain = new THREE.Group();

    // Basin 1 (Base)
    const b1 = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.2, 0.5, 32), materialLib.getMarbleMaterial(0xf1f5f9));
    b1.position.y = 0.25;
    fountain.add(b1);

    const w1 = new THREE.Mesh(new THREE.CircleGeometry(2.8, 32), materialLib.getPoolWaterMaterial());
    w1.rotation.x = -Math.PI / 2;
    w1.position.y = 0.48;
    fountain.add(w1);

    // Central Pillar 1
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 1.2, 16), materialLib.getMarbleMaterial(0xf1f5f9));
    p1.position.y = 1.0;
    fountain.add(p1);

    // Basin 2 (Mid)
    const b2 = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.9, 0.35, 32), materialLib.getMarbleMaterial(0xf1f5f9));
    b2.position.y = 1.7;
    fountain.add(b2);

    // Basin 3 (Top Spire)
    const b3 = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.25, 32), materialLib.getMarbleMaterial(0xf1f5f9));
    b3.position.y = 2.4;
    fountain.add(b3);

    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 16), materialLib.getMarbleMaterial(0xffffff));
    spire.position.y = 2.9;
    fountain.add(spire);

    return fountain;
  }

  /**
   * Realistic Tropical Palm Tree with Curved Segmented Trunk and Foliage Fronds
   */
  public static createPalmTree(height: number = 5.0): THREE.Group {
    const palm = new THREE.Group();

    // Segmented Trunk with slight natural curve
    const segments = 8;
    const segH = height / segments;
    let currentY = 0;

    for (let s = 0; s < segments; s++) {
      const radius = 0.25 * (1 - (s / segments) * 0.4);
      const segGeo = new THREE.CylinderGeometry(radius * 0.9, radius, segH, 12);
      const segMat = materialLib.getWoodMaterial('oak');
      const seg = new THREE.Mesh(segGeo, segMat);
      seg.position.set(Math.sin(s * 0.2) * 0.15, currentY + segH / 2, 0);
      seg.rotation.z = Math.sin(s * 0.3) * 0.05;
      seg.castShadow = true;
      palm.add(seg);
      currentY += segH;
    }

    // Radial Palm Fronds
    const frondMat = materialLib.getFoliageMaterial('palm');
    for (let f = 0; f < 9; f++) {
      const angle = (f / 9) * Math.PI * 2;
      const frondGeo = new THREE.ConeGeometry(0.8, 2.8, 4);
      const frond = new THREE.Mesh(frondGeo, frondMat);
      frond.position.set(Math.cos(angle) * 1.2, currentY - 0.2, Math.sin(angle) * 1.2);
      frond.rotation.set(Math.sin(angle) * 0.9, angle, -Math.cos(angle) * 0.9);
      frond.castShadow = true;
      palm.add(frond);
    }

    return palm;
  }

  /**
   * Conifer / Pine Tree with Layered Cone Boughs and Timber Trunk
   */
  public static createPineTree(height: number = 7.0): THREE.Group {
    const pine = new THREE.Group();

    // Trunk
    const trunkH = height * 0.3;
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.35, trunkH, 12),
      materialLib.getWoodMaterial('walnut')
    );
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    pine.add(trunk);

    // Multi-Layered Conical Foliage
    const tiers = 4;
    const folMat = materialLib.getFoliageMaterial('pine');
    for (let t = 0; t < tiers; t++) {
      const tierR = (tiers - t + 1) * 0.8;
      const tierH = (height - trunkH) / tiers * 1.4;
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(tierR, tierH, 8),
        folMat
      );
      cone.position.y = trunkH + t * ((height - trunkH) / tiers);
      cone.castShadow = true;
      pine.add(cone);
    }

    return pine;
  }

  /**
   * Topiary Cone Shrub for Classical Gardens
   */
  public static createTopiaryCone(): THREE.Group {
    const topiary = new THREE.Group();

    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.3, 0.6, 16),
      materialLib.getStuccoMaterial(0xffffff)
    );
    pot.position.y = 0.3;
    topiary.add(pot);

    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.6, 1.8, 12),
      materialLib.getFoliageMaterial('hedge')
    );
    cone.position.y = 1.5;
    cone.castShadow = true;
    topiary.add(cone);

    return topiary;
  }

  /**
   * Manicured Boxwood Hedge Mesh
   */
  public static createHedge(w: number = 2.0, h: number = 1.2, d: number = 0.8): THREE.Mesh {
    const hedge = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      materialLib.getFoliageMaterial('hedge')
    );
    hedge.castShadow = true;
    hedge.receiveShadow = true;
    return hedge;
  }

  /**
   * Sun Lounger Chair with Cushion
   */
  public static createSunLounger(): THREE.Group {
    const lounger = new THREE.Group();

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.15, 2.0),
      materialLib.getWoodMaterial('teak')
    );
    frame.position.y = 0.15;
    lounger.add(frame);

    const backrest = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.1, 0.8),
      materialLib.getStuccoMaterial(0xffffff)
    );
    backrest.position.set(0, 0.4, -0.6);
    backrest.rotation.x = -0.5;
    lounger.add(backrest);

    return lounger;
  }

  /**
   * Warm Glow Wall Sconce Fixture
   */
  public static createSconce(colorHex: number = 0xfbbf24): THREE.Group {
    const sconce = new THREE.Group();

    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.25, 0.04),
      materialLib.getMetalMaterial('darkSteel')
    );
    sconce.add(plate);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 12),
      materialLib.getEmissiveMaterial(colorHex)
    );
    bulb.position.z = 0.08;
    sconce.add(bulb);

    return sconce;
  }

  /**
   * Exterior AC Compressor Unit
   */
  public static createACUnit(): THREE.Group {
    const ac = new THREE.Group();

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.6, 0.4),
      materialLib.getStuccoMaterial(0x94a3b8)
    );
    ac.add(box);

    const grill = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.02, 16),
      materialLib.getMetalMaterial('darkSteel')
    );
    grill.rotation.x = Math.PI / 2;
    grill.position.z = 0.21;
    ac.add(grill);

    return ac;
  }
}
