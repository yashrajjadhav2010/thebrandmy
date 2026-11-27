import * as THREE from 'three';
import type { HQTextureSet } from './hqTextures';

export interface HQSharedMaterials {
  travertineMat: THREE.MeshStandardMaterial;
  darkTitaniumMat: THREE.MeshStandardMaterial;
  satinSilverMat: THREE.MeshPhysicalMaterial;
  champagneMat: THREE.MeshPhysicalMaterial;
  warmTimberMat: THREE.MeshStandardMaterial;
  gardenFoliageMat: THREE.MeshStandardMaterial;
  archLightStripMat: THREE.MeshStandardMaterial;
  clearCanopyGlassMat: THREE.MeshPhysicalMaterial;
}

export interface BuiltHQDetails {
  updateDetails: (elapsed: number, nightMix: number, interiorMix: number) => void;
}

const _dummy = new THREE.Object3D();
const _tmpColor = new THREE.Color();

/**
 * Builds Ceremonial Indian National Flag Plaza, Animated Garden Fountains,
 * Kinetic Tech Sculptures, Formal Botanical Parterre Gardens, Benches,
 * and Architectural Terrace Balustrades.
 */
export function buildCampusAmenities(
  root: THREE.Group,
  mats: HQSharedMaterials,
  textures: HQTextureSet,
  trackGeo: <T extends THREE.BufferGeometry>(g: T) => T,
  trackMat: <T extends THREE.Material>(m: T) => T,
  isSoftwareGl: boolean,
  isMobile: boolean
): (elapsed: number, nightMix: number) => void {
  const amenitiesGroup = new THREE.Group();
  root.add(amenitiesGroup);

  const basaltMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1c222b,
      roughness: 0.62,
      metalness: 0.14,
      envMapIntensity: 0.55,
    })
  );

  const waterJetMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xdaf0ff,
      emissive: new THREE.Color(0x9fc9ec),
      emissiveIntensity: 0.14,
      roughness: 0.08,
      metalness: 0.05,
      transparent: true,
      opacity: 0.72,
      clearcoat: 1.0,
      depthWrite: false,
    })
  );

  const waterRippleMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0xd9eeff,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );

  const crystalCoreMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xd8e8ff,
      emissive: new THREE.Color(0x5d8df2),
      emissiveIntensity: 0.32,
      roughness: 0.12,
      metalness: 0.15,
      clearcoat: 1.0,
      envMapIntensity: 1.4,
    })
  );

  // =========================================================================
  // 1. CEREMONIAL INDIAN NATIONAL FLAG PLAZA (TIRANGA COURTYARD — SW FORECOURT)
  // =========================================================================
  const flagPlaza = new THREE.Group();
  flagPlaza.position.set(-20.4, 0.24, 21.6);
  amenitiesGroup.add(flagPlaza);

  // 3-tier circular white travertine & dark basalt ceremonial pedestal
  const pTier1 = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(3.6, 3.85, 0.26, 40)),
    mats.travertineMat
  );
  pTier1.position.y = 0.13;
  pTier1.receiveShadow = true;
  pTier1.castShadow = !isSoftwareGl;

  const pTier2 = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(2.55, 2.75, 0.28, 36)),
    basaltMat
  );
  pTier2.position.y = 0.4;
  pTier2.receiveShadow = true;
  pTier2.castShadow = !isSoftwareGl;

  const pTier3 = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(1.42, 1.62, 0.42, 32)),
    mats.travertineMat
  );
  pTier3.position.y = 0.75;
  pTier3.castShadow = !isSoftwareGl;

  // Brushed champagne ceremonial inlay ring around tier 2
  const flagTrimRing = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(2.6, 0.05, 8, 40)),
    mats.champagneMat
  );
  flagTrimRing.rotation.x = Math.PI / 2;
  flagTrimRing.position.y = 0.55;

  // 4 architectural night uplight pods aimed respectfully at the Indian flag
  const uplightHousingGeo = trackGeo(new THREE.CylinderGeometry(0.14, 0.18, 0.24, 10));
  const uplightLensGeo = trackGeo(new THREE.CircleGeometry(0.12, 12));
  uplightLensGeo.rotateX(-Math.PI / 2);
  for (let u = 0; u < 4; u++) {
    const a = (u / 4) * Math.PI * 2 + Math.PI / 4;
    const ux = Math.cos(a) * 1.95;
    const uz = Math.sin(a) * 1.95;
    const pod = new THREE.Mesh(uplightHousingGeo, mats.darkTitaniumMat);
    pod.position.set(ux, 0.62, uz);
    const lens = new THREE.Mesh(uplightLensGeo, mats.archLightStripMat);
    lens.position.set(ux, 0.75, uz);
    flagPlaza.add(pod, lens);
  }

  // Monumental Tapered Satin-Silver Flagpole (height = 14.0 units)
  const poleHeight = 14.0;
  const poleGeo = trackGeo(new THREE.CylinderGeometry(0.085, 0.22, poleHeight, 16));
  const poleMesh = new THREE.Mesh(poleGeo, mats.satinSilverMat);
  poleMesh.position.y = 0.95 + poleHeight / 2;
  poleMesh.castShadow = !isSoftwareGl;

  // Polished Champagne Finial Orb & Collar
  const finialCollar = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.16, 0.11, 0.24, 12)),
    mats.champagneMat
  );
  finialCollar.position.y = 0.95 + poleHeight + 0.08;

  const finialOrb = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.24, 18, 14)),
    mats.champagneMat
  );
  finialOrb.position.y = 0.95 + poleHeight + 0.34;

  // Official 3:2 Waving 3D Cloth Indian National Flag (4.5 x 3.0)
  const flagW = 4.5;
  const flagH = 3.0;
  const flagSegX = isMobile ? 18 : 28;
  const flagSegY = isMobile ? 10 : 14;
  const flagGeo = trackGeo(new THREE.PlaneGeometry(flagW, flagH, flagSegX, flagSegY));
  // Shift geometry so hoist edge (x = 0) attaches directly to the flagpole
  flagGeo.translate(flagW / 2 + 0.08, -flagH / 2, 0);

  const flagBasePos = new Float32Array(flagGeo.attributes.position.array);

  const flagMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: textures.indianFlagMap,
      roughness: 0.72,
      metalness: 0.02,
      side: THREE.DoubleSide,
      envMapIntensity: 0.32,
    })
  );
  const flagMesh = new THREE.Mesh(flagGeo, flagMat);
  flagMesh.position.set(0, 0.95 + poleHeight - 0.16, 0);
  flagMesh.rotation.y = 0.38; // Angled gracefully toward the hero vista
  flagMesh.castShadow = !isSoftwareGl;

  // Respectful soft flag spotlight in Night Mode
  const flagSpotLight = new THREE.PointLight(0xfff1d6, 0.1, 16, 1.5);
  flagSpotLight.position.set(1.8, 12.6, 2.2);
  flagPlaza.add(
    pTier1,
    pTier2,
    pTier3,
    flagTrimRing,
    poleMesh,
    finialCollar,
    finialOrb,
    flagMesh,
    flagSpotLight
  );

  // =========================================================================
  // 2. SOARING ILLUMINATED FOUNTAINS FLANKING CHHATRAPATI SHIVAJI MAHARAJ PLAZA
  // =========================================================================
  const fountainPositions: Array<{ pos: [number, number, number]; scale: number }> = [
    { pos: [-7.6, 0.29, 13.6], scale: 1.18 },
    { pos: [7.6, 0.29, 13.6], scale: 1.18 },
    { pos: [-11.4, 0.29, 14.4], scale: 0.96 },
    { pos: [11.4, 0.29, 14.4], scale: 0.96 },
  ];

  const rippleRings: Array<{ mesh: THREE.Mesh; phase: number; baseScale: number }> = [];
  const sprayOrigins: Array<{ x: number; y: number; z: number; scale: number }> = [];

  for (let fi = 0; fi < fountainPositions.length; fi++) {
    const fDef = fountainPositions[fi];
    const fGroup = new THREE.Group();
    fGroup.position.set(fDef.pos[0], fDef.pos[1], fDef.pos[2]);
    fGroup.scale.setScalar(fDef.scale);
    amenitiesGroup.add(fGroup);

    // Tiered dark basalt & champagne fountain bowls
    const baseBowl = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(1.75, 1.35, 0.56, 28)),
      basaltMat
    );
    baseBowl.position.y = 0.34;
    baseBowl.castShadow = !isSoftwareGl;

    const midPedestal = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.42, 0.58, 1.15, 18)),
      mats.travertineMat
    );
    midPedestal.position.y = 0.95;

    const upperBowl = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(1.12, 0.48, 0.38, 24)),
      mats.travertineMat
    );
    upperBowl.position.y = 1.56;
    upperBowl.castShadow = !isSoftwareGl;

    const bowlLip = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(1.12, 0.045, 8, 28)),
      mats.champagneMat
    );
    bowlLip.rotation.x = Math.PI / 2;
    bowlLip.position.y = 1.74;

    const nozzle = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.11, 0.16, 0.48, 12)),
      mats.champagneMat
    );
    nozzle.position.y = 1.92;

    // Warm underwater fountain accent ring
    const underLight = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(1.52, 0.045, 6, 28)),
      mats.archLightStripMat
    );
    underLight.rotation.x = Math.PI / 2;
    underLight.position.y = 0.62;

    // High soaring central sculpted water plume (echoes dramatic illuminated jets)
    const plumeGeo = trackGeo(new THREE.CylinderGeometry(0.28, 0.1, 3.65, 12, 1, true));
    const plumeMesh = new THREE.Mesh(plumeGeo, waterJetMat);
    plumeMesh.position.y = 3.85;

    // 8 Graceful Parabolic Arching Water Jets curving from outer nozzles into the basin
    const jetCount = 8;
    for (let j = 0; j < jetCount; j++) {
      const a = (j / jetCount) * Math.PI * 2;
      const cosA = Math.cos(a);
      const sinA = Math.sin(a);
      const jetCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(cosA * 0.25, 2.05, sinA * 0.25),
        new THREE.Vector3(cosA * 1.15, 3.2, sinA * 1.15),
        new THREE.Vector3(cosA * 2.15, 0.32, sinA * 2.15)
      );
      const jetGeo = trackGeo(new THREE.TubeGeometry(jetCurve, 14, 0.042, 6, false));
      const jetMesh = new THREE.Mesh(jetGeo, waterJetMat);
      fGroup.add(jetMesh);
    }

    // 2 Expanding Animated Surface Ripple Rings per fountain
    for (let r = 0; r < 2; r++) {
      const rGeo = trackGeo(new THREE.RingGeometry(1.85, 2.02, 32));
      rGeo.rotateX(-Math.PI / 2);
      const rMesh = new THREE.Mesh(rGeo, waterRippleMat);
      rMesh.position.y = 0.04;
      fGroup.add(rMesh);
      rippleRings.push({
        mesh: rMesh,
        phase: fi * 0.37 + r * 0.5,
        baseScale: 1.0,
      });
    }

    fGroup.add(baseBowl, midPedestal, upperBowl, bowlLip, nozzle, underLight, plumeMesh);
    sprayOrigins.push({
      x: fDef.pos[0],
      y: fDef.pos[1] + 2.15 * fDef.scale,
      z: fDef.pos[2],
      scale: fDef.scale,
    });
  }

  // Instanced Shimmering Water Spray Droplets across all 3 fountains (Zero GC loop)
  const dropsPerFountain = isMobile ? 20 : 32;
  const totalDrops = dropsPerFountain * sprayOrigins.length;
  const dropGeo = trackGeo(new THREE.SphereGeometry(0.068, 6, 5));
  const sprayInst = new THREE.InstancedMesh(dropGeo, waterJetMat, totalDrops);
  sprayInst.frustumCulled = false;
  amenitiesGroup.add(sprayInst);

  const dropParams: Array<{
    originIdx: number;
    angle: number;
    speedR: number;
    speedY: number;
    phase: number;
  }> = [];
  for (let oi = 0; oi < sprayOrigins.length; oi++) {
    for (let d = 0; d < dropsPerFountain; d++) {
      dropParams.push({
        originIdx: oi,
        angle: (d / dropsPerFountain) * Math.PI * 2 + oi * 0.7,
        speedR: 1.15 + (d % 5) * 0.24,
        speedY: 2.4 + (d % 4) * 0.45,
        phase: (d / dropsPerFountain) + (d % 3) * 0.21,
      });
    }
  }

  // =========================================================================
  // 3. KINETIC TECH SCULPTURES, GATEWAY RINGS & NEXUS PROMENADE BANNERS
  // =========================================================================
  // Sculpture A: Orbital Data-Sphere Gyroscope (SE Ceremonial Lawn — Balances Flag Plaza)
  const gyroGroup = new THREE.Group();
  gyroGroup.position.set(20.4, 0.24, 21.6);
  amenitiesGroup.add(gyroGroup);

  const gyroPlinthA = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(2.4, 2.7, 0.34, 8)),
    mats.travertineMat
  );
  gyroPlinthA.position.y = 0.17;
  const gyroPlinthB = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(1.45, 1.7, 0.56, 8)),
    basaltMat
  );
  gyroPlinthB.position.y = 0.62;
  const gyroStem = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.18, 0.32, 1.3, 12)),
    mats.darkTitaniumMat
  );
  gyroStem.position.y = 1.48;

  const gyroPivot = new THREE.Group();
  gyroPivot.position.y = 3.55;

  const gyroOuter = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(1.78, 0.085, 12, 48)),
    mats.champagneMat
  );
  const gyroMid = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(1.32, 0.07, 10, 42)),
    mats.satinSilverMat
  );
  const gyroInner = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.88, 0.055, 10, 36)),
    mats.darkTitaniumMat
  );
  const gyroCore = new THREE.Mesh(
    trackGeo(new THREE.OctahedronGeometry(0.46, 1)),
    crystalCoreMat
  );
  gyroOuter.castShadow = !isSoftwareGl;
  gyroMid.castShadow = !isSoftwareGl;
  gyroPivot.add(gyroOuter, gyroMid, gyroInner, gyroCore);

  const gyroLightRing = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(1.52, 0.04, 6, 32)),
    mats.archLightStripMat
  );
  gyroLightRing.rotation.x = Math.PI / 2;
  gyroLightRing.position.y = 0.92;
  gyroGroup.add(gyroPlinthA, gyroPlinthB, gyroStem, gyroPivot, gyroLightRing);

  // Twin Sculptural Illuminated Circular Gateway Arch Rings flanking the Statue Court
  for (const side of [-1, 1]) {
    const ringArch = new THREE.Group();
    ringArch.position.set(side * 12.6, 0.24, 17.6);
    ringArch.rotation.y = side * 0.24;
    const outerArc = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(2.15, 0.14, 10, 36, Math.PI * 1.48)),
      mats.champagneMat
    );
    outerArc.position.y = 2.15;
    outerArc.rotation.z = -Math.PI * 0.24;
    const innerLedArc = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(1.94, 0.055, 8, 36, Math.PI * 1.48)),
      mats.archLightStripMat
    );
    innerLedArc.position.y = 2.15;
    innerLedArc.rotation.z = -Math.PI * 0.24;
    ringArch.add(outerArc, innerLedArc);
    amenitiesGroup.add(ringArch);
  }

  // 4 Illuminated NEXUS Ceremonial Promenade Banner Pylons framing the Grand Arrival Axis
  const bannerMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: textures.nexusBannerMap,
      emissiveMap: textures.nexusBannerMap,
      emissive: new THREE.Color(0xffdfa8),
      emissiveIntensity: 0.55,
      roughness: 0.35,
      metalness: 0.15,
      side: THREE.DoubleSide,
    })
  );
  const pylonBaseGeo = trackGeo(new THREE.BoxGeometry(1.25, 0.55, 0.65));
  const pylonPostGeo = trackGeo(new THREE.CylinderGeometry(0.06, 0.075, 4.4, 8));
  const bannerPlaneGeo = trackGeo(new THREE.PlaneGeometry(1.12, 2.55));
  const bannerSpecs: Array<[number, number, number]> = [
    [-6.6, 0.24, 24.4],
    [6.6, 0.24, 24.4],
    [-14.2, 0.24, 20.6],
    [14.2, 0.24, 20.6],
  ];
  for (const [bx, by, bz] of bannerSpecs) {
    const pGrp = new THREE.Group();
    pGrp.position.set(bx, by, bz);
    const base = new THREE.Mesh(pylonBaseGeo, mats.darkTitaniumMat);
    base.position.y = 0.28;
    const postL = new THREE.Mesh(pylonPostGeo, mats.champagneMat);
    postL.position.set(-0.62, 2.2, 0);
    const postR = new THREE.Mesh(pylonPostGeo, mats.champagneMat);
    postR.position.set(0.62, 2.2, 0);
    const panel = new THREE.Mesh(bannerPlaneGeo, bannerMat);
    panel.position.set(0, 2.45, 0);
    const baseGlow = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.18, 0.06, 0.7)),
      mats.archLightStripMat
    );
    baseGlow.position.y = 0.56;
    pGrp.add(base, postL, postR, panel, baseGlow);
    amenitiesGroup.add(pGrp);
  }

  // Sculpture B: Twin Helical Neural Ribbon Spire (West Park Promenade)
  const helixGroup = new THREE.Group();
  helixGroup.position.set(-26.8, 0.22, 11.2);
  amenitiesGroup.add(helixGroup);

  const helixPlinth = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(1.85, 2.1, 0.44, 28)),
    mats.travertineMat
  );
  helixPlinth.position.y = 0.22;
  const helixBed = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(1.55, 1.55, 0.16, 24)),
    basaltMat
  );
  helixBed.position.y = 0.46;
  helixGroup.add(helixPlinth, helixBed);

  for (let strand = 0; strand < 2; strand++) {
    const pts: THREE.Vector3[] = [];
    for (let s = 0; s <= 24; s++) {
      const t = s / 24;
      const a = t * Math.PI * 3.2 + strand * Math.PI;
      const rad = 0.85 * (1 - t * 0.62);
      pts.push(new THREE.Vector3(Math.cos(a) * rad, 0.5 + t * 6.4, Math.sin(a) * rad));
    }
    const ribbonCurve = new THREE.CatmullRomCurve3(pts);
    const ribbonGeo = trackGeo(new THREE.TubeGeometry(ribbonCurve, 36, 0.095, 8, false));
    const ribbonMesh = new THREE.Mesh(
      ribbonGeo,
      strand === 0 ? mats.satinSilverMat : mats.champagneMat
    );
    ribbonMesh.castShadow = !isSoftwareGl;
    helixGroup.add(ribbonMesh);
  }

  // Horizontal neural connecting rungs between the twin helix ribbons
  const rungGeo = trackGeo(new THREE.CylinderGeometry(0.035, 0.035, 1.0, 6));
  rungGeo.rotateZ(Math.PI / 2);
  for (let r = 2; r <= 10; r++) {
    const t = r / 12;
    const a = t * Math.PI * 3.2;
    const rad = 0.85 * (1 - t * 0.62);
    const rung = new THREE.Mesh(rungGeo, mats.archLightStripMat);
    rung.position.set(0, 0.5 + t * 6.4, 0);
    rung.rotation.y = -a;
    rung.scale.set(rad * 1.9, 1, 1);
    helixGroup.add(rung);
  }

  // =========================================================================
  // 4. FORMAL BOTANICAL GARDENS, FLORAL BEDS, BENCHES & GLASS BALUSTRADES
  // =========================================================================
  // Symmetrical manicured boxwood parterre hedge beds framing the grand arrival plaza
  const hedgeGeo = trackGeo(new THREE.BoxGeometry(1, 0.48, 1));
  const hedgeSpecs: Array<{ pos: [number, number, number]; scale: [number, number, number]; rotY?: number }> = [
    { pos: [-7.2, 0.46, 26.8], scale: [4.6, 1, 1.55] },
    { pos: [7.2, 0.46, 26.8], scale: [4.6, 1, 1.55] },
    { pos: [-14.2, 0.46, 23.6], scale: [3.8, 1, 1.45], rotY: 0.22 },
    { pos: [14.2, 0.46, 23.6], scale: [3.8, 1, 1.45], rotY: -0.22 },
    { pos: [-16.6, 0.44, 16.5], scale: [3.2, 1, 1.35], rotY: 0.45 },
    { pos: [16.6, 0.44, 16.5], scale: [3.2, 1, 1.35], rotY: -0.45 },
    { pos: [-9.2, 0.44, 31.4], scale: [5.4, 1, 1.5] },
    { pos: [9.2, 0.44, 31.4], scale: [5.4, 1, 1.5] },
  ];

  const curbGeo = trackGeo(new THREE.BoxGeometry(1, 0.16, 1));
  for (const h of hedgeSpecs) {
    const curb = new THREE.Mesh(curbGeo, mats.travertineMat);
    curb.position.set(h.pos[0], h.pos[1] - 0.18, h.pos[2]);
    curb.scale.set(h.scale[0] + 0.34, 1, h.scale[2] + 0.34);
    if (h.rotY) curb.rotation.y = h.rotY;

    const hedge = new THREE.Mesh(hedgeGeo, mats.gardenFoliageMat);
    hedge.position.set(h.pos[0], h.pos[1], h.pos[2]);
    hedge.scale.set(h.scale[0], h.scale[1], h.scale[2]);
    if (h.rotY) hedge.rotation.y = h.rotY;
    hedge.castShadow = !isSoftwareGl;
    hedge.receiveShadow = true;
    amenitiesGroup.add(curb, hedge);
  }

  // Subtle Seasonal Botanical Flower Accents (Instanced muted lavender, marigold & white)
  const flowerCount = 64;
  const flowerGeo = trackGeo(new THREE.DodecahedronGeometry(0.18, 0));
  const flowerMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.78,
      metalness: 0.0,
    })
  );
  const flowerInst = new THREE.InstancedMesh(flowerGeo, flowerMat, flowerCount);
  const bloomColors = [0xdba046, 0x9b86c9, 0xeae5db, 0xc87f4f];
  for (let i = 0; i < flowerCount; i++) {
    const h = hedgeSpecs[i % hedgeSpecs.length];
    const t = ((i * 37) % 100) / 100 - 0.5;
    const s = ((i * 53) % 100) / 100 - 0.5;
    _dummy.position.set(
      h.pos[0] + t * h.scale[0] * 0.72,
      h.pos[1] + 0.28,
      h.pos[2] + s * h.scale[2] * 0.62
    );
    _dummy.rotation.set(0, i * 0.8, 0);
    _dummy.scale.set(1.1, 0.65, 1.1);
    _dummy.updateMatrix();
    flowerInst.setMatrixAt(i, _dummy.matrix);
    _tmpColor.setHex(bloomColors[i % bloomColors.length]);
    flowerInst.setColorAt(i, _tmpColor);
  }
  flowerInst.instanceMatrix.needsUpdate = true;
  if (flowerInst.instanceColor) flowerInst.instanceColor.needsUpdate = true;
  flowerInst.computeBoundingSphere();
  amenitiesGroup.add(flowerInst);

  // Architectural Travertine & Warm Timber Promenade Benches (8 placements)
  const benchBaseGeo = trackGeo(new THREE.BoxGeometry(2.1, 0.34, 0.58));
  const benchSeatGeo = trackGeo(new THREE.BoxGeometry(2.26, 0.1, 0.66));
  const benchCoords: Array<[number, number, number, number]> = [
    [-5.2, 0.24, 19.6, Math.PI / 2],
    [5.2, 0.24, 19.6, -Math.PI / 2],
    [-8.6, 0.24, 24.4, 0.42],
    [8.6, 0.24, 24.4, -0.42],
    [-14.8, 0.24, 14.6, 0.72],
    [14.8, 0.24, 14.6, -0.72],
    [-22.5, 0.24, 15.8, 0.55],
    [22.5, 0.24, 15.8, -0.55],
  ];
  for (const [bx, by, bz, rotY] of benchCoords) {
    const bGrp = new THREE.Group();
    bGrp.position.set(bx, by, bz);
    bGrp.rotation.y = rotY;
    const base = new THREE.Mesh(benchBaseGeo, mats.travertineMat);
    base.position.y = 0.17;
    const seat = new THREE.Mesh(benchSeatGeo, mats.warmTimberMat);
    seat.position.y = 0.39;
    bGrp.add(base, seat);
    amenitiesGroup.add(bGrp);
  }

  // =========================================================================
  // ANIMATION UPDATER FOR FLAG CLOTH, FOUNTAINS & KINETIC SCULPTURES (ZERO GC)
  // =========================================================================
  return (elapsed: number, nightMix: number) => {
    // 1. Natural traveling sinusoidal cloth breeze on the Indian National Flag
    const posAttr = flagGeo.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < posAttr.count; i++) {
      const i3 = i * 3;
      const bx = flagBasePos[i3];
      const by = flagBasePos[i3 + 1];
      const u = Math.max(0, (bx - 0.08) / flagW); // 0 at pole -> 1 at fly edge
      const wave1 = Math.sin(u * 5.2 - elapsed * 3.1 + by * 0.45) * 0.24 * Math.pow(u, 1.18);
      const wave2 = Math.cos(u * 9.0 - elapsed * 4.7) * 0.065 * u * u;
      arr[i3] = bx - Math.abs(wave1) * 0.14;
      arr[i3 + 1] = by + Math.sin(u * 3.4 - elapsed * 2.2) * 0.04 * u;
      arr[i3 + 2] = wave1 + wave2;
    }
    posAttr.needsUpdate = true;
    flagGeo.computeVertexNormals();
    flagSpotLight.intensity = THREE.MathUtils.lerp(0.15, 7.5, nightMix);

    // 2. Animated Fountain Ripples & Parabolic Spray Droplets
    for (const r of rippleRings) {
      const cycle = (elapsed * 0.58 + r.phase) % 1;
      const sc = 0.58 + cycle * 0.92;
      r.mesh.scale.set(sc, 1, sc);
    }
    waterRippleMat.opacity = 0.34 + Math.sin(elapsed * 2.4) * 0.08;
    waterJetMat.emissiveIntensity = THREE.MathUtils.lerp(0.14, 0.58, nightMix);

    const gravity = 4.9;
    for (let i = 0; i < totalDrops; i++) {
      const p = dropParams[i];
      const orig = sprayOrigins[p.originIdx];
      const life = (elapsed * 0.72 + p.phase) % 1;
      const t = life * 1.15;
      const rDist = p.speedR * t * orig.scale;
      const yOffset = (p.speedY * t - 0.5 * gravity * t * t) * orig.scale;
      const x = orig.x + Math.cos(p.angle) * rDist;
      const z = orig.z + Math.sin(p.angle) * rDist;
      const y = Math.max(0.32, orig.y + yOffset);
      const s = (1 - Math.abs(life - 0.5) * 1.4) * orig.scale;
      _dummy.position.set(x, y, z);
      _dummy.rotation.set(0, 0, 0);
      _dummy.scale.setScalar(Math.max(0.25, s));
      _dummy.updateMatrix();
      sprayInst.setMatrixAt(i, _dummy.matrix);
    }
    sprayInst.instanceMatrix.needsUpdate = true;

    // 3. Smooth Kinetic Rotation on the Orbital Tech Sculpture
    gyroOuter.rotation.set(elapsed * 0.22, elapsed * 0.35, 0.2);
    gyroMid.rotation.set(-elapsed * 0.32, elapsed * 0.24, elapsed * 0.18);
    gyroInner.rotation.set(elapsed * 0.45, -elapsed * 0.38, 0.5);
    gyroCore.rotation.y = elapsed * 0.65;
    crystalCoreMat.emissiveIntensity = THREE.MathUtils.lerp(0.28, 0.95, nightMix);
  };
}

/**
 * Builds detailed 3D architectural interiors inside every HQ wing so switching to
 * "Interior View" reveals stacked floors furnished with computer workstations
 * (dual/ultrawide monitors, keyboards, mice, desk lamps, ergonomic office chairs),
 * conference tables with open laptops, lounge sofas & coffee tables, concierge
 * reception computers, indoor potted trees, spiral atrium stair, moving glass
 * elevators, innovation globe hall, R&D lab & robotics bay, creative studio desks,
 * and a multi-console server command center.
 */
export function buildHQInteriors(
  root: THREE.Group,
  mats: HQSharedMaterials,
  textures: HQTextureSet,
  trackGeo: <T extends THREE.BufferGeometry>(g: T) => T,
  trackMat: <T extends THREE.Material>(m: T) => T
): (
  elapsed: number,
  nightMix: number,
  interiorMix: number,
  holoFocusMix?: number
) => void {
  const interiorsGroup = new THREE.Group();
  root.add(interiorsGroup);

  // =========================================================================
  // SHARED INTERIOR MATERIALS & REUSABLE MULTI-PART FURNITURE GEOMETRIES
  // =========================================================================
  const floorSlabMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xd9d4ca,
      roughness: 0.72,
      metalness: 0.06,
    })
  );

  const carbonDeskMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x161c26,
      roughness: 0.24,
      metalness: 0.68,
      clearcoat: 0.65,
      clearcoatRoughness: 0.16,
      envMapIntensity: 1.1,
    })
  );

  const glassDeskSurfaceMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x1d344d,
      emissive: new THREE.Color(0x2899d6),
      emissiveIntensity: 0.22,
      roughness: 0.08,
      metalness: 0.18,
      transparent: true,
      opacity: 0.72,
      clearcoat: 1.0,
      depthWrite: false,
    })
  );

  const monitorScreenMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: textures.monitorScreenMap,
      emissiveMap: textures.monitorScreenMap,
      emissive: new THREE.Color(0xcde2ff),
      emissiveIntensity: 0.95,
      roughness: 0.16,
      metalness: 0.12,
    })
  );

  const commandWallMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: textures.commandScreenMap,
      emissiveMap: textures.commandScreenMap,
      emissive: new THREE.Color(0xcce2ff),
      emissiveIntensity: 0.95,
      roughness: 0.2,
      metalness: 0.15,
    })
  );

  const interiorAccentScreenMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x3b67b8,
      emissive: new THREE.Color(0x5f95f5),
      emissiveIntensity: 0.6,
      roughness: 0.22,
      metalness: 0.2,
    })
  );

  // Stylized Holographic Projection Materials (Additive-feel Cyan & Warm Champagne)
  const holoCyanWireMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0x67d4ff,
      wireframe: true,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
    })
  );

  const holoGoldWireMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0xf4cf87,
      wireframe: true,
      transparent: true,
      opacity: 0.76,
      depthWrite: false,
    })
  );

  const holoHudDiscMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: textures.holoProjectionMap,
      color: 0x9be7ff,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );

  const holoBeamConeMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );

  const holoEdgeCyanMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xb8f0ff,
      emissive: new THREE.Color(0x38bdf8),
      emissiveIntensity: 1.35,
      roughness: 0.18,
      metalness: 0.1,
    })
  );

  const archWarmLinearMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfff5e0,
      emissive: new THREE.Color(0xffd285),
      emissiveIntensity: 1.25,
      roughness: 0.2,
      metalness: 0.0,
    })
  );

  const archCoolLinearMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xdff5ff,
      emissive: new THREE.Color(0x52c7ff),
      emissiveIntensity: 1.15,
      roughness: 0.2,
      metalness: 0.0,
    })
  );

  const serverRackFrontMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: textures.serverRackFrontMap,
      emissiveMap: textures.serverRackFrontMap,
      emissive: new THREE.Color(0x9bdcff),
      emissiveIntensity: 0.92,
      roughness: 0.28,
      metalness: 0.42,
    })
  );

  const smokedGlassDoorMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x0c1624,
      roughness: 0.12,
      metalness: 0.15,
      transparent: true,
      opacity: 0.34,
      clearcoat: 1.0,
      depthWrite: false,
    })
  );

  const elevatorCabMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xffe2b8,
      emissive: new THREE.Color(0xffc980),
      emissiveIntensity: 0.65,
      roughness: 0.18,
      metalness: 0.45,
      clearcoat: 0.8,
    })
  );

  const galleryWallMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xebe8e1,
      roughness: 0.82,
      metalness: 0.02,
    })
  );

  const artPrintMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: textures.galleryArtMap,
      roughness: 0.35,
      metalness: 0.08,
    })
  );

  const serverLedMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x8bc1ff,
      emissive: new THREE.Color(0x38bdf8),
      emissiveIntensity: 0.95,
      roughness: 0.2,
    })
  );

  const chairFabricMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x262d38,
      roughness: 0.86,
      metalness: 0.06,
    })
  );

  const sofaFabricMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x4b5566,
      roughness: 0.9,
      metalness: 0.02,
    })
  );

  const rugMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x363d4a,
      roughness: 0.95,
      metalness: 0.0,
    })
  );

  const deskLightMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfff0d4,
      emissive: new THREE.Color(0xffd79b),
      emissiveIntensity: 0.85,
      roughness: 0.25,
    })
  );

  const whiteboardGlassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xeaf0f7,
      emissive: new THREE.Color(0xdbe8f8),
      emissiveIntensity: 0.18,
      roughness: 0.18,
      metalness: 0.05,
    })
  );

  // Track animated holographic elements (Zero GC per frame!)
  const animatedSpinners: Array<{
    obj: THREE.Object3D;
    speedY: number;
    speedX?: number;
    bobBaseY?: number;
    bobAmp?: number;
    phase: number;
  }> = [];

  // Shared micro-geometries for crisp multi-part furniture (reused across all rooms)
  const deskTopGeo = trackGeo(new THREE.BoxGeometry(1.38, 0.06, 0.68));
  const deskLegGeo = trackGeo(new THREE.BoxGeometry(0.055, 0.56, 0.58));
  const deskModestyGeo = trackGeo(new THREE.BoxGeometry(1.24, 0.24, 0.035));
  const monBaseGeo = trackGeo(new THREE.BoxGeometry(0.24, 0.022, 0.16));
  const monNeckGeo = trackGeo(new THREE.BoxGeometry(0.045, 0.22, 0.04));
  const monFrameWideGeo = trackGeo(new THREE.BoxGeometry(0.68, 0.34, 0.035));
  const monScreenWideGeo = trackGeo(new THREE.PlaneGeometry(0.63, 0.29));
  const monFrameSingleGeo = trackGeo(new THREE.BoxGeometry(0.46, 0.3, 0.032));
  const monScreenSingleGeo = trackGeo(new THREE.PlaneGeometry(0.42, 0.26));
  const keyboardGeo = trackGeo(new THREE.BoxGeometry(0.36, 0.018, 0.12));
  const mousePadGeo = trackGeo(new THREE.BoxGeometry(0.14, 0.01, 0.16));
  const mouseGeo = trackGeo(new THREE.BoxGeometry(0.05, 0.022, 0.08));
  const cpuTowerGeo = trackGeo(new THREE.BoxGeometry(0.16, 0.36, 0.32));
  const lampStemGeo = trackGeo(new THREE.CylinderGeometry(0.014, 0.018, 0.32, 6));
  const lampHeadGeo = trackGeo(new THREE.BoxGeometry(0.16, 0.028, 0.055));

  // Shared Holographic Desk geometries
  const holoDeskWingGeo = trackGeo(new THREE.BoxGeometry(1.56, 0.065, 0.78));
  const holoDeskGlassGeo = trackGeo(new THREE.BoxGeometry(1.38, 0.024, 0.56));
  const holoDeskStripGeo = trackGeo(new THREE.BoxGeometry(1.58, 0.026, 0.04));
  const holoPedestalGeo = trackGeo(new THREE.BoxGeometry(0.14, 0.55, 0.58));
  const holoEmitterRingGeo = trackGeo(new THREE.TorusGeometry(0.21, 0.022, 8, 24));
  const holoMiniConeGeo = trackGeo(new THREE.CylinderGeometry(0.34, 0.16, 0.44, 18, 1, true));
  const holoMiniCoreGeo = trackGeo(new THREE.OctahedronGeometry(0.15, 1));
  const holoMiniOrbRingGeo = trackGeo(new THREE.TorusGeometry(0.24, 0.014, 6, 24));
  const holoPaneCurvedGeo = trackGeo(
    new THREE.CylinderGeometry(0.68, 0.68, 0.44, 16, 1, true, -0.78, 1.56)
  );
  const holoSidePaneGeo = trackGeo(new THREE.PlaneGeometry(0.42, 0.3));
  const holoDiscGeo = trackGeo(new THREE.PlaneGeometry(1.0, 1.0));
  holoDiscGeo.rotateX(-Math.PI / 2);

  // Shared Multi-Part Server Rack geometries
  const rackShellGeo = trackGeo(new THREE.BoxGeometry(0.84, 2.72, 1.12));
  const rackCapGeo = trackGeo(new THREE.BoxGeometry(0.88, 0.1, 1.16));
  const rackPlinthGeo = trackGeo(new THREE.BoxGeometry(0.88, 0.12, 1.16));
  const rackFrontPanelGeo = trackGeo(new THREE.PlaneGeometry(0.74, 2.48));
  const rackDoorGlassGeo = trackGeo(new THREE.BoxGeometry(0.78, 2.52, 0.028));
  const rackEdgeLedGeo = trackGeo(new THREE.BoxGeometry(0.032, 2.48, 0.036));
  const rackManifoldGeo = trackGeo(new THREE.CylinderGeometry(0.075, 0.075, 0.24, 10));

  // Ergonomic Office Chair parts (bottom-center grounded at y = 0)
  const chairBaseGeo = trackGeo(new THREE.CylinderGeometry(0.24, 0.26, 0.04, 6));
  const chairStemGeo = trackGeo(new THREE.CylinderGeometry(0.032, 0.036, 0.28, 8));
  const chairSeatGeo = trackGeo(new THREE.BoxGeometry(0.42, 0.065, 0.4));
  const chairBackGeo = trackGeo(new THREE.BoxGeometry(0.4, 0.44, 0.055));
  const chairArmGeo = trackGeo(new THREE.BoxGeometry(0.04, 0.16, 0.28));

  // Open Laptop parts
  const laptopBaseGeo = trackGeo(new THREE.BoxGeometry(0.32, 0.018, 0.22));
  const laptopLidGeo = trackGeo(new THREE.BoxGeometry(0.32, 0.21, 0.016));
  const laptopScreenGeo = trackGeo(new THREE.PlaneGeometry(0.28, 0.18));

  // Indoor Planter parts
  const potGeo = trackGeo(new THREE.CylinderGeometry(0.24, 0.18, 0.42, 12));
  const potStemGeo = trackGeo(new THREE.CylinderGeometry(0.03, 0.045, 0.48, 6));
  const potLeafGeo = trackGeo(new THREE.DodecahedronGeometry(0.24, 1));

  // Lounge Sofa & Coffee Table parts
  const sofaBaseGeo = trackGeo(new THREE.BoxGeometry(1.56, 0.26, 0.66));
  const sofaBackGeo = trackGeo(new THREE.BoxGeometry(1.56, 0.38, 0.15));
  const sofaArmGeo = trackGeo(new THREE.BoxGeometry(0.15, 0.36, 0.66));
  const coffeeTopGeo = trackGeo(new THREE.BoxGeometry(1.02, 0.055, 0.56));
  const coffeeLegGeo = trackGeo(new THREE.BoxGeometry(0.82, 0.24, 0.36));

  // Reusable furniture builders (local pivot at y = 0 floor surface)
  const buildOfficeChair = (scale = 1, executive = false): THREE.Group => {
    const ch = new THREE.Group();
    const base = new THREE.Mesh(chairBaseGeo, mats.satinSilverMat);
    base.position.y = 0.025;
    const stem = new THREE.Mesh(chairStemGeo, mats.darkTitaniumMat);
    stem.position.y = 0.18;
    const seat = new THREE.Mesh(
      chairSeatGeo,
      executive ? mats.champagneMat : chairFabricMat
    );
    seat.position.y = 0.34;
    const back = new THREE.Mesh(chairBackGeo, chairFabricMat);
    back.position.set(0, 0.58, -0.18);
    back.rotation.x = -0.12;
    const armL = new THREE.Mesh(chairArmGeo, mats.darkTitaniumMat);
    armL.position.set(-0.21, 0.45, -0.02);
    const armR = new THREE.Mesh(chairArmGeo, mats.darkTitaniumMat);
    armR.position.set(0.21, 0.45, -0.02);
    ch.add(base, stem, seat, back, armL, armR);
    if (scale !== 1) ch.scale.setScalar(scale);
    return ch;
  };

  const buildLaptop = (): THREE.Group => {
    const lap = new THREE.Group();
    const base = new THREE.Mesh(laptopBaseGeo, mats.satinSilverMat);
    base.position.y = 0.01;
    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, 0.02, -0.105);
    lidPivot.rotation.x = -0.28;
    const lid = new THREE.Mesh(laptopLidGeo, mats.satinSilverMat);
    lid.position.y = 0.105;
    const scr = new THREE.Mesh(laptopScreenGeo, monitorScreenMat);
    scr.position.set(0, 0.105, 0.01);
    lidPivot.add(lid, scr);
    lap.add(base, lidPivot);
    return lap;
  };

  const buildIndoorPlanter = (scale = 1): THREE.Group => {
    const pl = new THREE.Group();
    const pot = new THREE.Mesh(potGeo, mats.travertineMat);
    pot.position.y = 0.21;
    const trunk = new THREE.Mesh(potStemGeo, mats.warmTimberMat);
    trunk.position.y = 0.56;
    const foliageA = new THREE.Mesh(potLeafGeo, mats.gardenFoliageMat);
    foliageA.position.set(0, 0.88, 0);
    foliageA.scale.set(1.15, 0.95, 1.15);
    const foliageB = new THREE.Mesh(potLeafGeo, mats.gardenFoliageMat);
    foliageB.position.set(0.14, 0.72, 0.1);
    foliageB.scale.set(0.75, 0.68, 0.75);
    pl.add(pot, trunk, foliageA, foliageB);
    if (scale !== 1) pl.scale.setScalar(scale);
    return pl;
  };

  /**
   * Builds a composite 10-part Stylized Holographic Desk:
   * sculpted obsidian-titanium cantilevered desk, glowing edge accent bar,
   * capacitive illuminated glass control deck, emitter ring + volumetric cone,
   * rotating 3D holographic wireframe core, floating curved holographic HUD panes,
   * and executive ergonomic chair.
   */
  const addHolographicDesk = (
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    rotY: number,
    options?: { scale?: number; accent?: 'cyan' | 'gold'; phase?: number }
  ) => {
    const scale = options?.scale ?? 1.0;
    const isGold = options?.accent === 'gold';
    const phase = options?.phase ?? (x * 0.37 + z * 0.21);

    const hd = new THREE.Group();
    hd.position.set(x, y, z);
    hd.rotation.y = rotY;
    if (scale !== 1) hd.scale.setScalar(scale);

    // Sculpted cantilevered desk base + carbon tabletop
    const mainTop = new THREE.Mesh(holoDeskWingGeo, carbonDeskMat);
    mainTop.position.y = 0.58;
    const glassPad = new THREE.Mesh(holoDeskGlassGeo, glassDeskSurfaceMat);
    glassPad.position.set(0, 0.625, 0.02);

    // Glowing architectural edge-light strip along front and rear lips
    const stripMat = isGold ? archWarmLinearMat : holoEdgeCyanMat;
    const frontStrip = new THREE.Mesh(holoDeskStripGeo, stripMat);
    frontStrip.position.set(0, 0.58, 0.395);
    const rearStrip = new THREE.Mesh(holoDeskStripGeo, stripMat);
    rearStrip.position.set(0, 0.58, -0.395);

    // Sculpted angled satin-silver & titanium pedestal legs
    const pedL = new THREE.Mesh(holoPedestalGeo, mats.satinSilverMat);
    pedL.position.set(-0.62, 0.28, -0.02);
    pedL.rotation.z = 0.14;
    const pedR = new THREE.Mesh(holoPedestalGeo, mats.satinSilverMat);
    pedR.position.set(0.62, 0.28, -0.02);
    pedR.rotation.z = -0.14;

    // Tabletop Holographic Emitter Ring + Volumetric Light Cone
    const emitter = new THREE.Mesh(holoEmitterRingGeo, stripMat);
    emitter.rotation.x = Math.PI / 2;
    emitter.position.set(0, 0.642, -0.06);

    const beamCone = new THREE.Mesh(holoMiniConeGeo, holoBeamConeMat);
    beamCone.position.set(0, 0.87, -0.06);

    // Hovering rotating 3D Holographic Core & Orbital Ring
    const holoSpinner = new THREE.Group();
    holoSpinner.position.set(0, 1.02, -0.06);
    const core = new THREE.Mesh(
      holoMiniCoreGeo,
      isGold ? holoGoldWireMat : holoCyanWireMat
    );
    const orbRing = new THREE.Mesh(
      holoMiniOrbRingGeo,
      isGold ? archWarmLinearMat : holoEdgeCyanMat
    );
    orbRing.rotation.x = 1.15;
    holoSpinner.add(core, orbRing);
    animatedSpinners.push({
      obj: holoSpinner,
      speedY: 0.72,
      speedX: 0.22,
      bobBaseY: 1.02,
      bobAmp: 0.045,
      phase,
    });

    // Floating Translucent Curved Holographic Main HUD Arc + Twin Angled Wing Panes
    const curvedHud = new THREE.Mesh(holoPaneCurvedGeo, holoHudDiscMat);
    curvedHud.position.set(0, 1.06, 0.36);
    curvedHud.rotation.y = Math.PI;

    for (const side of [-1, 1]) {
      const sidePane = new THREE.Mesh(holoSidePaneGeo, holoHudDiscMat);
      sidePane.position.set(side * 0.56, 1.02, -0.16);
      sidePane.rotation.y = -side * 0.38;
      hd.add(sidePane);
    }

    // Holographic Tabletop Radial Blueprint Disc
    const deskHudDisc = new THREE.Mesh(holoDiscGeo, holoHudDiscMat);
    deskHudDisc.scale.setScalar(0.54);
    deskHudDisc.position.set(0, 0.65, -0.06);
    animatedSpinners.push({
      obj: deskHudDisc,
      speedY: -0.35,
      phase: phase + 0.6,
    });

    // Executive chair facing the holographic interface
    const chair = buildOfficeChair(1.0, true);
    chair.position.set(0, 0, 0.64);
    chair.rotation.y = Math.PI;

    hd.add(
      mainTop,
      glassPad,
      frontStrip,
      rearStrip,
      pedL,
      pedR,
      emitter,
      beamCone,
      holoSpinner,
      curvedHud,
      deskHudDisc,
      chair
    );
    parent.add(hd);
    return hd;
  };

  /**
   * Builds a hovering Spatial Holographic Projection Assembly over a conference
   * or command table (emitter ring, translucent beam cone, rotating radial HUD disc,
   * and crystalline/architectural 3D holographic wireframe with orbiting rings).
   */
  const addHolographicProjection = (
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    radius = 0.65,
    accent: 'cyan' | 'gold' = 'cyan',
    phase = 0
  ) => {
    const grp = new THREE.Group();
    grp.position.set(x, y, z);

    const isGold = accent === 'gold';
    const emitterRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(radius * 0.56, 0.025, 8, 28)),
      isGold ? archWarmLinearMat : holoEdgeCyanMat
    );
    emitterRing.rotation.x = Math.PI / 2;
    emitterRing.position.y = 0.02;

    const beam = new THREE.Mesh(
      trackGeo(
        new THREE.CylinderGeometry(radius * 0.92, radius * 0.45, radius * 1.15, 20, 1, true)
      ),
      holoBeamConeMat
    );
    beam.position.y = radius * 0.62;

    const hudPlane = new THREE.Mesh(holoDiscGeo, holoHudDiscMat);
    hudPlane.scale.setScalar(radius * 2.15);
    hudPlane.position.y = 0.06;
    animatedSpinners.push({ obj: hudPlane, speedY: 0.28, phase });

    const spinner = new THREE.Group();
    spinner.position.y = radius * 1.12;
    const holoMesh = new THREE.Mesh(
      trackGeo(new THREE.IcosahedronGeometry(radius * 0.52, 1)),
      isGold ? holoGoldWireMat : holoCyanWireMat
    );
    const orbitA = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(radius * 0.82, 0.018, 6, 32)),
      isGold ? archWarmLinearMat : holoEdgeCyanMat
    );
    orbitA.rotation.x = 1.15;
    const orbitB = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(radius * 0.68, 0.014, 6, 28)),
      isGold ? holoEdgeCyanMat : archWarmLinearMat
    );
    orbitB.rotation.set(0.65, 0.8, 0.4);
    spinner.add(holoMesh, orbitA, orbitB);

    animatedSpinners.push({
      obj: spinner,
      speedY: 0.58,
      bobBaseY: radius * 1.12,
      bobAmp: 0.06,
      phase: phase + 1.2,
    });

    grp.add(emitterRing, beam, hudPlane, spinner);
    parent.add(grp);
    return grp;
  };

  /**
   * Builds a composite 7-part High-Density Enterprise Server Rack Cabinet:
   * anodized dark-titanium chassis, plinth & satin-silver cooling crown,
   * glowing blade array front texture, smoked glass door, vertical cyan edge strip,
   * and top cooling manifold port.
   */
  const buildServerRack = (facingDirZ: 1 | -1 = 1, scale = 1.0): THREE.Group => {
    const rGrp = new THREE.Group();
    if (scale !== 1) rGrp.scale.setScalar(scale);

    const plinth = new THREE.Mesh(rackPlinthGeo, mats.satinSilverMat);
    plinth.position.y = 0.06;

    const shell = new THREE.Mesh(rackShellGeo, mats.darkTitaniumMat);
    shell.position.y = 1.44;

    const cap = new THREE.Mesh(rackCapGeo, mats.satinSilverMat);
    cap.position.y = 2.84;

    const manifold = new THREE.Mesh(rackManifoldGeo, mats.champagneMat);
    manifold.position.set(0, 2.98, 0);

    const frontFace = new THREE.Mesh(rackFrontPanelGeo, serverRackFrontMat);
    frontFace.position.set(0, 1.44, facingDirZ * 0.568);
    if (facingDirZ === -1) frontFace.rotation.y = Math.PI;

    const glassDoor = new THREE.Mesh(rackDoorGlassGeo, smokedGlassDoorMat);
    glassDoor.position.set(0, 1.44, facingDirZ * 0.592);

    const edgeLedL = new THREE.Mesh(rackEdgeLedGeo, serverLedMat);
    edgeLedL.position.set(-0.39, 1.44, facingDirZ * 0.578);
    const edgeLedR = new THREE.Mesh(rackEdgeLedGeo, serverLedMat);
    edgeLedR.position.set(0.39, 1.44, facingDirZ * 0.578);

    rGrp.add(plinth, shell, cap, manifold, frontFace, glassDoor, edgeLedL, edgeLedR);
    return rGrp;
  };

  /**
   * Builds a suspended Architectural Ring & Radial Beam Ceiling Light Fixture
   * to give every wing dramatic, museum-grade high-tech ceiling illumination.
   */
  const addArchitecturalCeilingRing = (
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    outerR: number,
    scaleX = 1.0,
    scaleZ = 1.0,
    coolAccent = false
  ) => {
    const fix = new THREE.Group();
    fix.position.set(x, y, z);

    const housingRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(outerR, 0.09, 8, 40)),
      mats.darkTitaniumMat
    );
    housingRing.rotation.x = Math.PI / 2;
    housingRing.scale.set(scaleX, scaleZ, 1);

    const warmGlow = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(outerR * 0.96, 0.048, 8, 40)),
      archWarmLinearMat
    );
    warmGlow.rotation.x = Math.PI / 2;
    warmGlow.scale.set(scaleX, scaleZ, 1);
    warmGlow.position.y = -0.055;

    const innerRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(outerR * 0.52, 0.036, 8, 32)),
      coolAccent ? archCoolLinearMat : archWarmLinearMat
    );
    innerRing.rotation.x = Math.PI / 2;
    innerRing.scale.set(scaleX, scaleZ, 1);
    innerRing.position.y = -0.08;

    // 4 sleek satin-silver radial architectural suspension struts
    const spokeGeo = trackGeo(new THREE.BoxGeometry(outerR * 1.92, 0.045, 0.055));
    for (let s = 0; s < 2; s++) {
      const spoke = new THREE.Mesh(spokeGeo, mats.satinSilverMat);
      spoke.rotation.y = (s * Math.PI) / 2;
      spoke.scale.set(s === 0 ? scaleX : scaleZ, 1, 1);
      spoke.position.y = 0.03;
      fix.add(spoke);
    }

    fix.add(housingRing, warmGlow, innerRing);
    parent.add(fix);
    return fix;
  };

  /**
   * Builds a complete HQ Computer Workstation:
   * architectural desk, legs, dual or ultrawide monitor with glowing UI screen,
   * keyboard, mouse, CPU tower, desk lamp, and ergonomic office chair facing the screen.
   */
  const addComputerWorkstation = (
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    rotY: number,
    options?: { dual?: boolean; scale?: number; timberTop?: boolean }
  ) => {
    const dual = options?.dual ?? true;
    const scale = options?.scale ?? 1.0;
    const ws = new THREE.Group();
    ws.position.set(x, y, z);
    ws.rotation.y = rotY;
    if (scale !== 1) ws.scale.setScalar(scale);

    // Desk frame & tabletop (top sits at y = 0.59)
    const top = new THREE.Mesh(
      deskTopGeo,
      options?.timberTop === false ? mats.travertineMat : mats.warmTimberMat
    );
    top.position.y = 0.57;
    const legL = new THREE.Mesh(deskLegGeo, mats.darkTitaniumMat);
    legL.position.set(-0.62, 0.28, 0);
    const legR = new THREE.Mesh(deskLegGeo, mats.darkTitaniumMat);
    legR.position.set(0.62, 0.28, 0);
    const modesty = new THREE.Mesh(deskModestyGeo, mats.darkTitaniumMat);
    modesty.position.set(0, 0.42, -0.26);
    ws.add(top, legL, legR, modesty);

    // Computer Monitor(s) facing +Z (where the user chair sits)
    if (dual) {
      for (const side of [-1, 1]) {
        const mGrp = new THREE.Group();
        mGrp.position.set(side * 0.245, 0.6, -0.16);
        mGrp.rotation.y = -side * 0.16;
        const mBase = new THREE.Mesh(monBaseGeo, mats.satinSilverMat);
        mBase.position.y = 0.011;
        const mNeck = new THREE.Mesh(monNeckGeo, mats.satinSilverMat);
        mNeck.position.set(0, 0.12, -0.04);
        const mFrame = new THREE.Mesh(monFrameSingleGeo, mats.darkTitaniumMat);
        mFrame.position.set(0, 0.28, 0);
        const mScreen = new THREE.Mesh(monScreenSingleGeo, monitorScreenMat);
        mScreen.position.set(0, 0.28, 0.019);
        mGrp.add(mBase, mNeck, mFrame, mScreen);
        ws.add(mGrp);
      }
    } else {
      const mBase = new THREE.Mesh(monBaseGeo, mats.satinSilverMat);
      mBase.position.set(0, 0.611, -0.16);
      const mNeck = new THREE.Mesh(monNeckGeo, mats.satinSilverMat);
      mNeck.position.set(0, 0.72, -0.2);
      const mFrame = new THREE.Mesh(monFrameWideGeo, mats.darkTitaniumMat);
      mFrame.position.set(0, 0.89, -0.15);
      const mScreen = new THREE.Mesh(monScreenWideGeo, monitorScreenMat);
      mScreen.position.set(0, 0.89, -0.13);
      ws.add(mBase, mNeck, mFrame, mScreen);
    }

    // Keyboard, mouse pad, mouse, desktop workstation CPU tower, and warm desk lamp
    const kb = new THREE.Mesh(keyboardGeo, mats.darkTitaniumMat);
    kb.position.set(-0.04, 0.609, 0.12);
    const pad = new THREE.Mesh(mousePadGeo, chairFabricMat);
    pad.position.set(0.28, 0.605, 0.12);
    const mouse = new THREE.Mesh(mouseGeo, mats.satinSilverMat);
    mouse.position.set(0.28, 0.62, 0.12);
    const tower = new THREE.Mesh(cpuTowerGeo, mats.darkTitaniumMat);
    tower.position.set(0.46, 0.19, -0.06);
    const lampStem = new THREE.Mesh(lampStemGeo, mats.champagneMat);
    lampStem.position.set(-0.54, 0.75, -0.18);
    const lampHead = new THREE.Mesh(lampHeadGeo, deskLightMat);
    lampHead.position.set(-0.48, 0.91, -0.14);
    lampHead.rotation.z = -0.2;
    ws.add(kb, pad, mouse, tower, lampStem, lampHead);

    // Ergonomic Office Chair facing the desk (-Z)
    const chair = buildOfficeChair(1.0, false);
    chair.position.set(0, 0, 0.56);
    chair.rotation.y = Math.PI;
    ws.add(chair);

    parent.add(ws);
    return ws;
  };

  /**
   * Builds a modern HQ Lounge Seating Pod: area rug, architectural sofa,
   * coffee table, and optional indoor potted tree.
   */
  const addLoungePod = (
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    rotY: number,
    scale = 1.0
  ) => {
    const pod = new THREE.Group();
    pod.position.set(x, y, z);
    pod.rotation.y = rotY;
    if (scale !== 1) pod.scale.setScalar(scale);

    const rug = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(2.1, 0.025, 1.8)),
      rugMat
    );
    rug.position.y = 0.02;

    const sofa = new THREE.Group();
    sofa.position.set(0, 0.04, -0.46);
    const sBase = new THREE.Mesh(sofaBaseGeo, sofaFabricMat);
    sBase.position.y = 0.17;
    const sBack = new THREE.Mesh(sofaBackGeo, sofaFabricMat);
    sBack.position.set(0, 0.44, -0.25);
    const sArmL = new THREE.Mesh(sofaArmGeo, sofaFabricMat);
    sArmL.position.set(-0.71, 0.34, 0);
    const sArmR = new THREE.Mesh(sofaArmGeo, sofaFabricMat);
    sArmR.position.set(0.71, 0.34, 0);
    sofa.add(sBase, sBack, sArmL, sArmR);

    const tableTop = new THREE.Mesh(coffeeTopGeo, mats.travertineMat);
    tableTop.position.set(0, 0.32, 0.35);
    const tableLeg = new THREE.Mesh(coffeeLegGeo, mats.darkTitaniumMat);
    tableLeg.position.set(0, 0.15, 0.35);

    const planter = buildIndoorPlanter(0.92);
    planter.position.set(1.06, 0.03, -0.45);

    pod.add(rug, sofa, tableTop, tableLeg, planter);
    parent.add(pod);
    return pod;
  };

  // =========================================================================
  // 1. INSIDE CENTRAL HELICAL SPIRE (HOLO-DECKS, INNOVATION HALL & CROWN)
  // =========================================================================
  const spireInterior = new THREE.Group();
  spireInterior.position.set(0, 1.02, 0);
  interiorsGroup.add(spireInterior);

  // Central illuminated architectural elevator shaft core
  const shaftFrameGeo = trackGeo(
    new THREE.CylinderGeometry(0.95, 1.04, 19.6, 12, 1, true)
  );
  const shaftGlass = new THREE.Mesh(shaftFrameGeo, mats.clearCanopyGlassMat);
  shaftGlass.position.y = 9.9;
  spireInterior.add(shaftGlass);

  // 4 vertical titanium elevator guide rails + illuminated architectural light columns
  const railGeo = trackGeo(new THREE.CylinderGeometry(0.05, 0.05, 19.8, 6));
  const shaftLedGeo = trackGeo(new THREE.BoxGeometry(0.036, 19.4, 0.036));
  for (let r = 0; r < 4; r++) {
    const a = (r / 4) * Math.PI * 2 + Math.PI / 4;
    const rail = new THREE.Mesh(railGeo, mats.darkTitaniumMat);
    rail.position.set(Math.cos(a) * 1.04, 9.9, Math.sin(a) * 1.04);
    const ledCol = new THREE.Mesh(
      shaftLedGeo,
      r % 2 === 0 ? archWarmLinearMat : archCoolLinearMat
    );
    ledCol.position.set(Math.cos(a) * 1.12, 9.9, Math.sin(a) * 1.12);
    spireInterior.add(rail, ledCol);
  }

  // 2 Animated Panoramic Glass Elevator Cabs
  const cabGeo = trackGeo(new THREE.BoxGeometry(0.68, 1.05, 0.68));
  const elevatorA = new THREE.Mesh(cabGeo, elevatorCabMat);
  const elevatorB = new THREE.Mesh(cabGeo, elevatorCabMat);
  spireInterior.add(elevatorA, elevatorB);

  // 6 Interior Atrium Floor Decks sized to sit cleanly inside the tapered Cathedral Spire
  const interiorLevels = [2.6, 5.6, 8.6, 11.4, 17.4, 20.0];
  for (let i = 0; i < interiorLevels.length; i++) {
    const ly = interiorLevels[i];
    const t = ly / 26.8;
    const baseFlare = 1.0 + 0.22 * Math.pow(1 - t, 2.2);
    const taper = Math.pow(1 - t * 0.72, 0.82);
    const maxRx = 5.8 * taper * baseFlare * 0.82;
    const maxRz = 4.5 * taper * baseFlare * 0.82;
    const outerR = Math.min(maxRx, maxRz);
    const ringGeo = trackGeo(new THREE.RingGeometry(1.22, outerR, 32));
    ringGeo.rotateX(-Math.PI / 2);
    const deck = new THREE.Mesh(ringGeo, floorSlabMat);
    deck.scale.set(maxRx / outerR, 1, 1);
    deck.position.y = ly;
    spireInterior.add(deck);

    // Warm recessed floor-edge light cove + cool inner shaft halo ring
    const coveGeo = trackGeo(new THREE.TorusGeometry(outerR * 0.94, 0.042, 6, 32));
    coveGeo.rotateX(Math.PI / 2);
    const cove = new THREE.Mesh(coveGeo, archWarmLinearMat);
    cove.scale.set(maxRx / outerR, 1, 1);
    cove.position.y = ly - 0.06;

    const innerCoveGeo = trackGeo(new THREE.TorusGeometry(1.26, 0.032, 6, 24));
    innerCoveGeo.rotateX(Math.PI / 2);
    const innerCove = new THREE.Mesh(innerCoveGeo, archCoolLinearMat);
    innerCove.position.y = ly - 0.04;
    spireInterior.add(cove, innerCove);

    // Furnish each Spire floor cleanly inside the elliptical floor ring
    const deskRx = Math.min(2.65, maxRx * 0.66);
    const deskRz = Math.min(2.15, maxRz * 0.64);
    if (i === 0 || i === 1 || i === 3) {
      // Engineering, Product & AI Studio Decks: alternating Holographic & Dual-Monitor desks
      const deskCount = 4;
      for (let d = 0; d < deskCount; d++) {
        const a = (d / deskCount) * Math.PI * 2 + i * 0.45 + 0.35;
        const dx = Math.cos(a) * deskRx;
        const dz = Math.sin(a) * deskRz;
        if (d % 2 === 0) {
          addHolographicDesk(spireInterior, dx, ly + 0.02, dz, -a + Math.PI / 2, {
            scale: 0.76,
            accent: i === 3 ? 'cyan' : 'gold',
            phase: i * 1.1 + d * 0.8,
          });
        } else {
          addComputerWorkstation(spireInterior, dx, ly + 0.02, dz, -a + Math.PI / 2, {
            dual: true,
            scale: 0.78,
            timberTop: i !== 3,
          });
        }
      }
      const pA = 0.9 + i * 0.5;
      const p1 = buildIndoorPlanter(0.72);
      p1.position.set(
        Math.cos(pA) * (maxRx * 0.78),
        ly + 0.02,
        Math.sin(pA) * (maxRz * 0.78)
      );
      spireInterior.add(p1);
    } else if (i === 2) {
      // Level 3: Innovation Globe Hall + 2 flanking Stylized Holographic Analyst Desks & Glass Wall
      addHolographicDesk(spireInterior, -2.35, ly + 0.02, -0.3, 1.35, {
        scale: 0.78,
        accent: 'cyan',
        phase: 0.4,
      });
      addHolographicDesk(spireInterior, 2.35, ly + 0.02, -0.3, -1.35, {
        scale: 0.78,
        accent: 'cyan',
        phase: 2.1,
      });
      const wb = new THREE.Group();
      wb.position.set(0, ly + 0.02, -2.05);
      const wbFrame = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.65, 0.96, 0.06)),
        mats.darkTitaniumMat
      );
      wbFrame.position.y = 0.86;
      const wbFace = new THREE.Mesh(
        trackGeo(new THREE.PlaneGeometry(1.52, 0.84)),
        whiteboardGlassMat
      );
      wbFace.position.set(0, 0.86, 0.036);
      const wbLegL = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 6)),
        mats.satinSilverMat
      );
      wbLegL.position.set(-0.66, 0.21, 0);
      const wbLegR = wbLegL.clone();
      wbLegR.position.x = 0.66;
      wb.add(wbFrame, wbFace, wbLegL, wbLegR);
      spireInterior.add(wb);
    } else if (i === 4) {
      // Level 5 (Above Halo): Executive Leadership Holographic Desks
      addHolographicDesk(spireInterior, -1.75, ly + 0.02, 0.25, 1.35, {
        scale: 0.7,
        accent: 'gold',
        phase: 1.4,
      });
      addHolographicDesk(spireInterior, 1.75, ly + 0.02, -0.25, -1.75, {
        scale: 0.7,
        accent: 'cyan',
        phase: 2.8,
      });
      const ep1 = buildIndoorPlanter(0.68);
      ep1.position.set(0, ly + 0.02, 1.55);
      spireInterior.add(ep1);
    } else if (i === 5) {
      // Level 6 (Upper Spire Briefing Lounge): holographic huddle table + laptops
      const huddleTop = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.56, 0.56, 0.06, 20)),
        carbonDeskMat
      );
      huddleTop.position.set(0, ly + 0.52, 1.25);
      const huddleLeg = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.1, 0.22, 0.5, 12)),
        mats.darkTitaniumMat
      );
      huddleLeg.position.set(0, ly + 0.25, 1.25);
      spireInterior.add(huddleTop, huddleLeg);
      addHolographicProjection(spireInterior, 0, ly + 0.56, 1.25, 0.34, 'gold', 3.1);
      for (let c = 0; c < 4; c++) {
        const ca = (c / 4) * Math.PI * 2 + 0.4;
        const hc = buildOfficeChair(0.65, true);
        hc.position.set(
          Math.cos(ca) * 0.74,
          ly + 0.02,
          1.25 + Math.sin(ca) * 0.74
        );
        hc.rotation.y = -ca - Math.PI / 2;
        spireInterior.add(hc);
      }
      const lap = buildLaptop();
      lap.position.set(0.28, ly + 0.56, 1.06);
      lap.rotation.y = -0.6;
      spireInterior.add(lap);
    }
  }

  // Sculptural Helical Spiral Atrium Staircase (Levels 1 -> 4)
  const stairPts: THREE.Vector3[] = [];
  const treadGeo = trackGeo(new THREE.BoxGeometry(0.95, 0.08, 0.34));
  const stairSteps = 44;
  for (let s = 0; s <= stairSteps; s++) {
    const u = s / stairSteps;
    const a = u * Math.PI * 4.5;
    const sy = 0.4 + u * 11.2;
    const sr = 1.62;
    stairPts.push(new THREE.Vector3(Math.cos(a) * sr, sy, Math.sin(a) * sr));
    if (s < stairSteps) {
      const tread = new THREE.Mesh(treadGeo, mats.warmTimberMat);
      tread.position.set(Math.cos(a) * sr, sy, Math.sin(a) * sr);
      tread.rotation.y = -a;
      spireInterior.add(tread);
    }
  }
  const stringerCurve = new THREE.CatmullRomCurve3(stairPts);
  const stringerGeo = trackGeo(
    new THREE.TubeGeometry(stringerCurve, 48, 0.065, 6, false)
  );
  const stringer = new THREE.Mesh(stringerGeo, mats.champagneMat);
  spireInterior.add(stringer);

  // Innovation Hall Interactive Holographic Globe & Volumetric Table (at y = 8.6)
  const holoGroup = new THREE.Group();
  holoGroup.position.set(0, 8.72, 2.05);
  const tableBase = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(1.08, 0.82, 0.48, 24)),
    carbonDeskMat
  );
  tableBase.position.y = 0.24;
  const tableRim = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(1.08, 0.045, 8, 28)),
    holoEdgeCyanMat
  );
  tableRim.rotation.x = Math.PI / 2;
  tableRim.position.y = 0.48;
  const tableBeam = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.96, 0.42, 1.08, 22, 1, true)),
    holoBeamConeMat
  );
  tableBeam.position.y = 1.04;
  const tableHud = new THREE.Mesh(holoDiscGeo, holoHudDiscMat);
  tableHud.scale.setScalar(2.1);
  tableHud.position.y = 0.54;
  animatedSpinners.push({ obj: tableHud, speedY: -0.25, phase: 0.2 });

  const holoGlobe = new THREE.Mesh(
    trackGeo(new THREE.IcosahedronGeometry(0.72, 2)),
    holoCyanWireMat
  );
  holoGlobe.position.y = 1.54;
  const holoRing = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.98, 0.028, 6, 32)),
    archWarmLinearMat
  );
  holoRing.position.y = 1.54;
  holoRing.rotation.x = 1.1;
  holoGroup.add(tableBase, tableRim, tableBeam, tableHud, holoGlobe, holoRing);
  spireInterior.add(holoGroup);

  // Executive Strategy Boardroom inside the Mid-Spire Golden Halo Level (y = 14.15)
  const boardroom = new THREE.Group();
  boardroom.position.set(0, 14.15, 0);
  boardroom.scale.setScalar(0.84);
  const brSlabGeo = trackGeo(new THREE.CylinderGeometry(3.85, 3.85, 0.14, 36));
  brSlabGeo.scale(1.12, 1, 0.84);
  const brSlab = new THREE.Mesh(brSlabGeo, floorSlabMat);
  brSlab.position.y = -0.07;
  boardroom.add(brSlab);

  const execTableGeo = trackGeo(new THREE.CylinderGeometry(1.65, 1.45, 0.12, 28));
  execTableGeo.scale(1.32, 1, 0.82);
  const execTable = new THREE.Mesh(execTableGeo, mats.warmTimberMat);
  execTable.position.y = 0.58;
  const execInlayGeo = trackGeo(new THREE.CylinderGeometry(0.95, 0.95, 0.13, 24));
  execInlayGeo.scale(1.35, 1, 0.35);
  const execInlay = new THREE.Mesh(execInlayGeo, carbonDeskMat);
  execInlay.position.y = 0.585;
  const execPedestal = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.58, 0.78, 0.55, 16)),
    mats.darkTitaniumMat
  );
  execPedestal.position.y = 0.275;
  boardroom.add(execTable, execInlay, execPedestal);

  // Centerpiece Hovering Holographic Strategy Projection above the Boardroom Table
  addHolographicProjection(boardroom, 0, 0.66, 0, 0.76, 'gold', 1.2);

  // Overhead Architectural Halo Chandelier inside the Executive Boardroom
  addArchitecturalCeilingRing(boardroom, 0, 2.75, 0, 2.45, 1.15, 0.84, true);

  // 10 Multi-Part Ergonomic Executive Chairs + Open Laptops around the Boardroom Table
  for (let c = 0; c < 10; c++) {
    const a = (c / 10) * Math.PI * 2;
    const ch = buildOfficeChair(0.92, true);
    ch.position.set(Math.cos(a) * 2.52, 0.02, Math.sin(a) * 1.66);
    ch.rotation.y = -a - Math.PI / 2;
    boardroom.add(ch);

    if (c % 2 === 0) {
      const lap = buildLaptop();
      lap.position.set(Math.cos(a) * 1.55, 0.65, Math.sin(a) * 1.0);
      lap.rotation.y = -a - Math.PI / 2;
      boardroom.add(lap);
    }
  }

  // Panoramic Strategy Presentation Display & 2 Indoor Planters inside Halo Boardroom
  const crownDisplayFrame = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.6, 1.05, 0.08)),
    mats.darkTitaniumMat
  );
  crownDisplayFrame.position.set(0, 1.12, -2.35);
  const crownDisplayFace = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(2.44, 0.92)),
    commandWallMat
  );
  crownDisplayFace.position.set(0, 1.12, -2.3);
  boardroom.add(crownDisplayFrame, crownDisplayFace);

  for (const px of [-2.75, 2.75]) {
    const bp = buildIndoorPlanter(0.9);
    bp.position.set(px, 0.02, -1.45);
    boardroom.add(bp);
  }
  spireInterior.add(boardroom);

  // =========================================================================
  // 2. INSIDE GRAND ATRIUM (HOLO RECEPTION, CHANDELIER & STUDY FORUM)
  // =========================================================================
  const atriumInt = new THREE.Group();
  atriumInt.position.set(0, 0.72, 5.4);
  interiorsGroup.add(atriumInt);

  // Recessed Glowing Architectural Floor Guide Ring circling the Atrium Rotunda
  const atriumFloorRing = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(4.15, 0.042, 6, 48)),
    archWarmLinearMat
  );
  atriumFloorRing.rotation.x = Math.PI / 2;
  atriumFloorRing.scale.set(1.18, 0.84, 1);
  atriumFloorRing.position.y = 0.04;
  atriumInt.add(atriumFloorRing);

  // Curved Knowledge Library Shelving Wall along the north arc with warm top cove strips
  const shelfGeo = trackGeo(new THREE.BoxGeometry(0.45, 2.35, 0.92));
  const shelfCapLedGeo = trackGeo(new THREE.BoxGeometry(0.48, 0.045, 0.88));
  for (let b = 0; b < 7; b++) {
    const a = -Math.PI * 0.42 + (b / 6) * Math.PI * 0.84;
    const sx = Math.sin(a) * 3.35;
    const sz = -Math.cos(a) * 2.35;
    const shelf = new THREE.Mesh(shelfGeo, mats.warmTimberMat);
    shelf.position.set(sx, 1.2, sz);
    shelf.rotation.y = -a;
    const capLed = new THREE.Mesh(shelfCapLedGeo, archWarmLinearMat);
    capLed.position.set(sx, 2.4, sz);
    capLed.rotation.y = -a;
    atriumInt.add(shelf, capLed);
  }

  // Architectural Concierge Reception Desk with Dual Computers & Hovering Holographic Directory
  const receptionGroup = new THREE.Group();
  receptionGroup.position.set(0, 0.02, 1.05);
  const receptionFront = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.2, 0.82, 0.78)),
    mats.travertineMat
  );
  receptionFront.position.y = 0.41;
  const receptionCap = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.32, 0.07, 0.86)),
    carbonDeskMat
  );
  receptionCap.position.y = 0.84;
  const receptionGlow = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.9, 0.055, 0.045)),
    holoEdgeCyanMat
  );
  receptionGlow.position.set(0, 0.14, 0.4);
  const receptionTopTrim = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.24, 0.032, 0.04)),
    archWarmLinearMat
  );
  receptionTopTrim.position.set(0, 0.82, 0.43);
  receptionGroup.add(receptionFront, receptionCap, receptionGlow, receptionTopTrim);

  // Floating Holographic Campus Directory hovering at the center of the Concierge Counter
  addHolographicProjection(receptionGroup, 0, 0.89, 0.05, 0.42, 'cyan', 0.8);

  // 2 Concierge Computer Monitors + Chairs behind the reception counter
  for (const rx of [-0.96, 0.96]) {
    const mBase = new THREE.Mesh(monBaseGeo, mats.satinSilverMat);
    mBase.position.set(rx, 0.89, -0.05);
    const mNeck = new THREE.Mesh(monNeckGeo, mats.satinSilverMat);
    mNeck.position.set(rx, 0.99, -0.02);
    const mFrame = new THREE.Mesh(monFrameSingleGeo, mats.darkTitaniumMat);
    mFrame.position.set(rx, 1.14, -0.04);
    const mScreen = new THREE.Mesh(monScreenSingleGeo, monitorScreenMat);
    mScreen.position.set(rx, 1.14, -0.06);
    mScreen.rotation.y = Math.PI;
    const rChair = buildOfficeChair(0.9, false);
    rChair.position.set(rx, 0, -0.78);
    receptionGroup.add(mBase, mNeck, mFrame, mScreen, rChair);
  }
  atriumInt.add(receptionGroup);

  // 2 Flanking Visitor Waiting Lounges (Sofas, Coffee Tables & Indoor Planters)
  addLoungePod(atriumInt, -2.85, 0.02, 0.45, 0.62, 0.82);
  addLoungePod(atriumInt, 2.85, 0.02, 0.45, -0.62, 0.82);

  // 2 Collaborative Study Tables with Open Laptops & Chairs near the Library Wall
  for (const sx of [-1.45, 1.45]) {
    const stGrp = new THREE.Group();
    stGrp.position.set(sx, 0.02, -0.95);
    const stTop = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.32, 0.06, 0.72)),
      mats.warmTimberMat
    );
    stTop.position.y = 0.57;
    const stLegL = new THREE.Mesh(deskLegGeo, mats.darkTitaniumMat);
    stLegL.position.set(-0.56, 0.28, 0);
    const stLegR = new THREE.Mesh(deskLegGeo, mats.darkTitaniumMat);
    stLegR.position.set(0.56, 0.28, 0);
    const l1 = buildLaptop();
    l1.position.set(-0.28, 0.605, 0.05);
    const l2 = buildLaptop();
    l2.position.set(0.28, 0.605, -0.05);
    l2.rotation.y = Math.PI;
    const c1 = buildOfficeChair(0.86, false);
    c1.position.set(-0.28, 0, 0.56);
    c1.rotation.y = Math.PI;
    const c2 = buildOfficeChair(0.86, false);
    c2.position.set(0.28, 0, -0.56);
    stGrp.add(stTop, stLegL, stLegR, l1, l2, c1, c2);
    atriumInt.add(stGrp);
  }

  // Sculptural Multi-Tier Suspended Architectural Chandelier Halo overhead
  addArchitecturalCeilingRing(atriumInt, 0, 3.42, 0.1, 2.35, 1.16, 0.86, true);
  // Slim satin-silver suspension rods anchoring chandelier into the Atrium ceiling
  const rodGeo = trackGeo(new THREE.CylinderGeometry(0.018, 0.018, 1.35, 6));
  for (let r = 0; r < 4; r++) {
    const a = (r / 4) * Math.PI * 2 + Math.PI / 4;
    const rod = new THREE.Mesh(rodGeo, mats.satinSilverMat);
    rod.position.set(Math.cos(a) * 2.35 * 1.16, 4.1, 0.1 + Math.sin(a) * 2.35 * 0.86);
    atriumInt.add(rod);
  }

  // =========================================================================
  // 3. INSIDE SYMMETRICAL WEST WING (HOLO R&D LAB, COMPUTE RACKS & ROBOTICS)
  // =========================================================================
  const westInt = new THREE.Group();
  westInt.position.set(-17.5, 0.92, 4.2);
  interiorsGroup.add(westInt);

  // Architectural Ceiling Light Rings & Illuminated Column Piers (Level 1 & Level 2)
  addArchitecturalCeilingRing(westInt, 0, 4.78, 0, 3.85, 1.15, 0.84, true);
  addArchitecturalCeilingRing(westInt, 0, 9.55, 0, 3.65, 1.15, 0.84, true);

  // 4 Vertical Illuminated Architectural Light Columns framing the R&D Perimeter
  const wingLightColGeo = trackGeo(new THREE.BoxGeometry(0.08, 9.6, 0.08));
  for (let p = 0; p < 4; p++) {
    const a = (p / 4) * Math.PI * 2 + Math.PI / 4;
    const col = new THREE.Mesh(wingLightColGeo, archCoolLinearMat);
    col.position.set(Math.cos(a) * 6.45 * 1.14, 4.9, Math.sin(a) * 6.45 * 0.82);
    westInt.add(col);
  }

  // Level 1 Ground Floor R&D Engineering Ring: alternating Holographic & Dual-Monitor Desks
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.35;
    if (k === 1 || k === 3 || k === 5) {
      addHolographicDesk(
        westInt,
        Math.cos(a) * 4.4,
        0.04,
        Math.sin(a) * 3.25,
        -a + Math.PI / 2,
        { scale: 0.94, accent: 'cyan', phase: k * 0.9 }
      );
    } else {
      addComputerWorkstation(
        westInt,
        Math.cos(a) * 4.4,
        0.04,
        Math.sin(a) * 3.25,
        -a + Math.PI / 2,
        { dual: true, scale: 0.96, timberTop: false }
      );
    }
  }

  // 4 Edge-Compute Liquid-Cooled R&D Server Racks tucked cleanly along the rear West Lab arc
  for (let sr = 0; sr < 4; sr++) {
    const a = -Math.PI * 0.72 + (sr / 3) * Math.PI * 0.44;
    const rack = buildServerRack(1, 0.82);
    rack.position.set(Math.cos(a) * 5.85, 0.04, Math.sin(a) * 4.15);
    rack.rotation.y = -a - Math.PI / 2;
    westInt.add(rack);
  }

  // Level 1 Central R&D Spatial Holographic Collaboration Table + Laptops & Chairs
  const rdTable = new THREE.Group();
  rdTable.position.set(0, 0.04, 0.2);
  const rdTop = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.6, 0.08, 1.15)),
    carbonDeskMat
  );
  rdTop.position.y = 0.58;
  const rdRimLed = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.64, 0.032, 1.19)),
    holoEdgeCyanMat
  );
  rdRimLed.position.y = 0.58;
  const rdLegA = new THREE.Mesh(deskLegGeo, mats.satinSilverMat);
  rdLegA.position.set(-0.98, 0.28, 0);
  const rdLegB = new THREE.Mesh(deskLegGeo, mats.satinSilverMat);
  rdLegB.position.set(0.98, 0.28, 0);
  rdTable.add(rdTop, rdRimLed, rdLegA, rdLegB);

  // Floating 3D Holographic CAD Prototype projected above the R&D Table
  addHolographicProjection(rdTable, 0, 0.64, 0, 0.62, 'cyan', 1.7);

  for (const cx of [-0.78, 0.78]) {
    const lapA = buildLaptop();
    lapA.position.set(cx, 0.63, 0.22);
    const chA = buildOfficeChair(0.9, false);
    chA.position.set(cx, 0, 0.82);
    chA.rotation.y = Math.PI;
    const chB = buildOfficeChair(0.9, false);
    chB.position.set(cx, 0, -0.82);
    rdTable.add(lapA, chA, chB);
  }
  westInt.add(rdTable);

  // Level 2 Prototyping & Robotics Floor (y = 5.16): Holographic Desks + Articulated Robotics Arm
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + 0.2;
    if (k % 2 === 0) {
      addHolographicDesk(
        westInt,
        Math.cos(a) * 4.2,
        5.16,
        Math.sin(a) * 3.1,
        -a + Math.PI / 2,
        { scale: 0.92, accent: 'cyan', phase: 2.0 + k }
      );
    } else {
      addComputerWorkstation(
        westInt,
        Math.cos(a) * 4.2,
        5.16,
        Math.sin(a) * 3.1,
        -a + Math.PI / 2,
        { dual: true, scale: 0.94, timberTop: true }
      );
    }
  }

  // Sculptural Articulated Robotics Prototyping Arm on Level 2 Cleanroom Center Bay + Floor Light Halo
  const roboHalo = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(1.18, 0.04, 6, 32)),
    holoEdgeCyanMat
  );
  roboHalo.rotation.x = Math.PI / 2;
  roboHalo.position.set(0, 5.2, 0);
  const roboBase = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.65, 0.8, 0.36, 16)),
    mats.champagneMat
  );
  roboBase.position.set(0, 5.34, 0);
  const roboArmPivot = new THREE.Group();
  roboArmPivot.position.set(0, 5.54, 0);
  const roboSeg1 = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.24, 1.55, 0.24)),
    mats.satinSilverMat
  );
  roboSeg1.position.set(0.26, 0.7, 0);
  roboSeg1.rotation.z = -0.32;
  const roboSeg2 = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.2, 1.25, 0.2)),
    mats.darkTitaniumMat
  );
  roboSeg2.position.set(0.8, 1.48, 0);
  roboSeg2.rotation.z = -1.05;
  const roboHead = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.18, 10, 10)),
    holoEdgeCyanMat
  );
  roboHead.position.set(1.32, 1.66, 0);
  roboArmPivot.add(roboSeg1, roboSeg2, roboHead);
  westInt.add(roboHalo, roboBase, roboArmPivot);

  const rdPlanter = buildIndoorPlanter(1.0);
  rdPlanter.position.set(-2.4, 5.16, 1.9);
  westInt.add(rdPlanter);

  // =========================================================================
  // 4. INSIDE SYMMETRICAL EAST WING (HOLO CREATIVE STUDIO, GALLERY & LIGHTING)
  // =========================================================================
  const eastInt = new THREE.Group();
  eastInt.position.set(17.5, 0.92, 4.2);
  interiorsGroup.add(eastInt);

  // Warm Architectural Ceiling Light Rings & Vertical Champagne Light Columns
  addArchitecturalCeilingRing(eastInt, 0, 4.78, 0, 3.85, 1.15, 0.84, false);
  addArchitecturalCeilingRing(eastInt, 0, 9.55, 0, 3.65, 1.15, 0.84, false);

  for (let p = 0; p < 4; p++) {
    const a = (p / 4) * Math.PI * 2 + Math.PI / 4;
    const col = new THREE.Mesh(wingLightColGeo, archWarmLinearMat);
    col.position.set(Math.cos(a) * 6.45 * 1.14, 4.9, Math.sin(a) * 6.45 * 0.82);
    eastInt.add(col);
  }

  // 2 Sculptural Exhibition Gallery Walls with Framed Artworks & Linear Picture Lights
  const wallGeo = trackGeo(new THREE.BoxGeometry(2.35, 1.95, 0.14));
  const frameGeo = trackGeo(new THREE.BoxGeometry(1.6, 1.08, 0.05));
  const picLightGeo = trackGeo(new THREE.BoxGeometry(1.35, 0.045, 0.14));
  const wallSpecs: Array<[number, number, number, number]> = [
    [-2.8, 1.0, -2.1, 0.55],
    [2.8, 1.0, -2.1, -0.55],
  ];
  for (const [wx, wy, wz, rot] of wallSpecs) {
    const wGrp = new THREE.Group();
    wGrp.position.set(wx, wy, wz);
    wGrp.rotation.y = rot;
    const wall = new THREE.Mesh(wallGeo, galleryWallMat);
    const frame = new THREE.Mesh(frameGeo, artPrintMat);
    frame.position.set(0, 0.06, 0.09);
    const picLight = new THREE.Mesh(picLightGeo, archWarmLinearMat);
    picLight.position.set(0, 0.74, 0.15);
    wGrp.add(wall, frame, picLight);
    eastInt.add(wGrp);
  }

  // 2 Stylized Holographic Creative Desks + 2 Dual-Monitor Editing Workstations on Ground Floor
  addHolographicDesk(eastInt, -3.6, 0.04, 1.25, 1.1, {
    scale: 0.94,
    accent: 'gold',
    phase: 0.5,
  });
  addHolographicDesk(eastInt, 3.6, 0.04, 1.25, -1.1, {
    scale: 0.94,
    accent: 'gold',
    phase: 1.9,
  });
  addComputerWorkstation(eastInt, -1.4, 0.04, -2.5, 0.2, {
    dual: false,
    scale: 0.96,
    timberTop: true,
  });
  addComputerWorkstation(eastInt, 1.4, 0.04, -2.5, -0.2, {
    dual: false,
    scale: 0.96,
    timberTop: true,
  });

  // Ground Floor Creative Lounge Sofa & Coffee Table
  addLoungePod(eastInt, 0, 0.04, 1.85, Math.PI, 0.96);

  // Level 2 Mezzanine Studio Floor (y = 5.16): Spatial 3D Holographic Design Table + Softboxes + Cafe
  const mezY = 5.16;
  const studioTableTop = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(1.48, 1.42, 0.1, 28)),
    carbonDeskMat
  );
  studioTableTop.position.set(0, mezY + 0.58, 0);
  const studioTableRim = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(1.48, 0.036, 8, 32)),
    archWarmLinearMat
  );
  studioTableRim.rotation.x = Math.PI / 2;
  studioTableRim.position.set(0, mezY + 0.59, 0);
  const studioTableLeg = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.28, 0.42, 0.54, 14)),
    mats.darkTitaniumMat
  );
  studioTableLeg.position.set(0, mezY + 0.28, 0);
  eastInt.add(studioTableTop, studioTableRim, studioTableLeg);

  // Floating 3D Holographic Design Sculpture above the Creative Critique Table
  addHolographicProjection(eastInt, 0, mezY + 0.65, 0, 0.7, 'gold', 2.4);

  for (let c = 0; c < 6; c++) {
    const a = (c / 6) * Math.PI * 2;
    const ch = buildOfficeChair(0.9, c % 2 === 0);
    ch.position.set(Math.cos(a) * 1.9, mezY + 0.02, Math.sin(a) * 1.9);
    ch.rotation.y = -a - Math.PI / 2;
    eastInt.add(ch);
    if (c % 2 === 0) {
      const lap = buildLaptop();
      lap.position.set(Math.cos(a) * 1.02, mezY + 0.64, Math.sin(a) * 1.02);
      lap.rotation.y = -a - Math.PI / 2;
      eastInt.add(lap);
    }
  }

  // Twin Photo/Video Studio Softbox Stands + Coffee/Espresso Bar Counter on Level 2
  const softboxGeo = trackGeo(new THREE.BoxGeometry(0.56, 0.76, 0.12));
  const standGeo = trackGeo(new THREE.CylinderGeometry(0.035, 0.052, 1.56, 6));
  for (const sx of [-3.4, 3.4]) {
    const stand = new THREE.Mesh(standGeo, mats.darkTitaniumMat);
    stand.position.set(sx, mezY + 0.78, 0.85);
    const softbox = new THREE.Mesh(softboxGeo, archWarmLinearMat);
    softbox.position.set(sx, mezY + 1.55, 0.85);
    softbox.rotation.y = sx > 0 ? -0.55 : 0.55;
    eastInt.add(stand, softbox);
  }
  const coffeeBar = new THREE.Group();
  coffeeBar.position.set(0, mezY + 0.02, -3.15);
  const barCounter = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.15, 0.82, 0.58)),
    mats.travertineMat
  );
  barCounter.position.y = 0.41;
  const barLed = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.02, 0.04, 0.04)),
    archWarmLinearMat
  );
  barLed.position.set(0, 0.14, 0.3);
  const espressoMachine = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.46, 0.34, 0.3)),
    mats.satinSilverMat
  );
  espressoMachine.position.set(-0.38, 0.98, 0);
  coffeeBar.add(barCounter, barLed, espressoMachine);
  eastInt.add(coffeeBar);

  // =========================================================================
  // 5. INSIDE NORTH TITANIUM CORE (HIGH-DENSITY SERVER HALL & HOLO MISSION CONTROL)
  // =========================================================================
  const northInt = new THREE.Group();
  northInt.position.set(0, 1.32, -13.2);
  interiorsGroup.add(northInt);

  // 12 Detailed Multi-Part Enterprise Server Racks facing the Illuminated Cold Aisle (Level 1)
  for (let row = 0; row < 2; row++) {
    const zPos = row === 0 ? -1.42 : 1.42;
    const facingDir: 1 | -1 = row === 0 ? 1 : -1;
    for (let col = 0; col < 6; col++) {
      const xPos = -3.45 + col * 1.38;
      const rack = buildServerRack(facingDir, 1.0);
      rack.position.set(xPos, 0.02, zPos);
      northInt.add(rack);
    }

    // Overhead Satin-Silver Fiber-Optic Cable Trays & Illuminated Coolant Bus Bars
    const tray = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(8.2, 0.08, 0.42)),
      mats.satinSilverMat
    );
    tray.position.set(0, 3.12, zPos);
    const busLed = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(8.1, 0.036, 0.045)),
      archCoolLinearMat
    );
    busLed.position.set(0, 3.06, zPos + facingDir * 0.22);
    northInt.add(tray, busLed);
  }

  // Twin Illuminated Cold-Aisle Floor Light Channels running down the Server Corridor
  const aisleStripGeo = trackGeo(new THREE.BoxGeometry(8.4, 0.03, 0.09));
  for (const az of [-0.56, 0.56]) {
    const strip = new THREE.Mesh(aisleStripGeo, archCoolLinearMat);
    strip.position.set(0, 0.035, az);
    northInt.add(strip);
  }

  // Overhead Cold-Aisle Containment Arch Ribs framing the Server Hall
  const archSpanGeo = trackGeo(new THREE.BoxGeometry(0.12, 0.09, 2.86));
  const archLedGeo = trackGeo(new THREE.BoxGeometry(0.06, 0.04, 2.7));
  for (let a = 0; a < 5; a++) {
    const ax = -3.2 + a * 1.6;
    const span = new THREE.Mesh(archSpanGeo, mats.darkTitaniumMat);
    span.position.set(ax, 3.38, 0);
    const spanLed = new THREE.Mesh(archLedGeo, archCoolLinearMat);
    spanLed.position.set(ax, 3.32, 0);
    northInt.add(span, spanLed);
  }

  // Ground-Floor Server Aisle Diagnostic Holographic Terminal
  addHolographicDesk(northInt, 0, 0.02, 0, 0, {
    scale: 0.72,
    accent: 'cyan',
    phase: 0.9,
  });

  // Level 2 Operations Deck Floor + Glowing Perimeter Safety Edge
  const opsDeck = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(8.9, 0.16, 4.5)),
    floorSlabMat
  );
  opsDeck.position.set(0, 3.65, 0);
  const opsDeckRim = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(8.96, 0.05, 0.06)),
    archCoolLinearMat
  );
  opsDeckRim.position.set(0, 3.7, 2.26);
  northInt.add(opsDeck, opsDeckRim);

  // 4 Stylized Holographic Operator Consoles facing the North Command Wall (-Z)
  for (let op = 0; op < 4; op++) {
    const ox = -2.85 + op * 1.9;
    addHolographicDesk(northInt, ox, 3.74, 0.58, 0, {
      scale: 0.88,
      accent: op === 1 || op === 2 ? 'cyan' : 'gold',
      phase: op * 0.85,
    });
  }

  // Suspended Linear Architectural Light Troffers over the Mission Control Deck
  const trofferFrameGeo = trackGeo(new THREE.BoxGeometry(7.6, 0.07, 0.24));
  const trofferLedGeo = trackGeo(new THREE.BoxGeometry(7.45, 0.035, 0.14));
  for (const tz of [-0.95, 0.25, 1.35]) {
    const trFrame = new THREE.Mesh(trofferFrameGeo, mats.darkTitaniumMat);
    trFrame.position.set(0, 6.72, tz);
    const trLed = new THREE.Mesh(
      trofferLedGeo,
      tz < 0 ? archCoolLinearMat : archWarmLinearMat
    );
    trLed.position.set(0, 6.67, tz);
    northInt.add(trFrame, trLed);
  }

  // Panoramic Command Display Wall with Live Global Telemetry Map & Flanking Status Pillars
  const cmdWallFrame = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(6.9, 2.28, 0.16)),
    mats.darkTitaniumMat
  );
  cmdWallFrame.position.set(0, 5.25, -1.78);
  const cmdWallScreen = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(6.52, 2.04)),
    commandWallMat
  );
  cmdWallScreen.position.set(0, 5.25, -1.69);
  const cmdTopLight = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(6.7, 0.055, 0.08)),
    archCoolLinearMat
  );
  cmdTopLight.position.set(0, 6.42, -1.72);
  northInt.add(cmdWallFrame, cmdWallScreen, cmdTopLight);

  // =========================================================================
  // 6. ARCHITECTURAL WALKWAY LIGHTING INSIDE ELEVATED SKYBRIDGES
  // =========================================================================
  const skybridgeSpans: Array<[THREE.Vector3, THREE.Vector3, THREE.Vector3]> = [
    [
      new THREE.Vector3(-8.4, 11.15, 1.4),
      new THREE.Vector3(-12.6, 11.35, 2.8),
      new THREE.Vector3(-16.6, 10.35, 4.0),
    ],
    [
      new THREE.Vector3(8.4, 11.15, 1.4),
      new THREE.Vector3(12.6, 11.35, 2.8),
      new THREE.Vector3(16.6, 10.35, 4.0),
    ],
    [
      new THREE.Vector3(0, 5.95, -4.4),
      new THREE.Vector3(0, 6.15, -7.8),
      new THREE.Vector3(0, 5.95, -10.6),
    ],
  ];
  for (const [p0, pMid, p1] of skybridgeSpans) {
    const curve = new THREE.QuadraticBezierCurve3(p0, pMid, p1);
    const guideTube = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(curve, 14, 0.05, 6, false)),
      archCoolLinearMat
    );
    interiorsGroup.add(guideTube);
  }

  // =========================================================================
  // INTERIOR ANIMATION UPDATER (Elevators, Holograms, Server Telemetry & Lighting)
  // =========================================================================
  return (
    elapsed: number,
    nightMix: number,
    interiorMix: number,
    holoFocusMix = 0
  ) => {
    // Smoothly glide twin glass elevators along the Central Spire core
    const liftA = (Math.sin(elapsed * 0.42) * 0.5 + 0.5) * 16.8 + 1.6;
    const liftB = (Math.cos(elapsed * 0.36 + 1.1) * 0.5 + 0.5) * 16.8 + 1.6;
    elevatorA.position.set(0.55, liftA, 0.55);
    elevatorB.position.set(-0.55, liftB, -0.55);

    // Gentle rotation on Innovation Hall holographic globe & robotics arm
    holoGlobe.rotation.y = elapsed * 0.52;
    holoRing.rotation.z = -elapsed * 0.42;
    roboArmPivot.rotation.y = Math.sin(elapsed * 0.55) * 0.65;

    // Smooth zero-GC rotation & subtle levitation for all holographic desks & projections
    for (let i = 0; i < animatedSpinners.length; i++) {
      const s = animatedSpinners[i];
      s.obj.rotation.y = elapsed * s.speedY + s.phase;
      if (s.speedX) {
        s.obj.rotation.x = Math.sin(elapsed * s.speedX + s.phase) * 0.25;
      }
      if (s.bobBaseY !== undefined && s.bobAmp !== undefined) {
        s.obj.position.y =
          s.bobBaseY + Math.sin(elapsed * 1.6 + s.phase) * s.bobAmp;
      }
    }

    // Boost architectural interior lighting, holographic projections & server telemetry cleanly
    const clarityBoost = Math.max(nightMix * 0.78, interiorMix);
    const holoBoost = THREE.MathUtils.lerp(1.0, 1.42, holoFocusMix);
    const serverPulse = 0.92 + Math.sin(elapsed * 2.2) * 0.08;

    monitorScreenMat.emissiveIntensity =
      THREE.MathUtils.lerp(0.65, 1.38, clarityBoost) * holoBoost;
    commandWallMat.emissiveIntensity =
      THREE.MathUtils.lerp(0.68, 1.48, clarityBoost) * holoBoost;
    interiorAccentScreenMat.emissiveIntensity =
      THREE.MathUtils.lerp(0.35, 1.18, clarityBoost) * holoBoost;

    serverRackFrontMat.emissiveIntensity =
      THREE.MathUtils.lerp(0.5, 1.32, clarityBoost) * serverPulse * holoBoost;
    serverLedMat.emissiveIntensity =
      THREE.MathUtils.lerp(0.45, 1.52, clarityBoost) * serverPulse * holoBoost;

    holoEdgeCyanMat.emissiveIntensity =
      THREE.MathUtils.lerp(0.6, 1.75, clarityBoost) * holoBoost;
    archCoolLinearMat.emissiveIntensity =
      THREE.MathUtils.lerp(0.45, 1.48, clarityBoost) * holoBoost;
    archWarmLinearMat.emissiveIntensity = THREE.MathUtils.lerp(
      0.45,
      THREE.MathUtils.lerp(1.52, 0.85, holoFocusMix),
      clarityBoost
    );

    elevatorCabMat.emissiveIntensity = THREE.MathUtils.lerp(0.45, 1.25, clarityBoost);
    deskLightMat.emissiveIntensity = THREE.MathUtils.lerp(0.4, 1.3, clarityBoost);

    holoCyanWireMat.opacity = THREE.MathUtils.clamp(
      THREE.MathUtils.lerp(0.36, 0.9, clarityBoost) * holoBoost,
      0.3,
      0.98
    );
    holoGoldWireMat.opacity = THREE.MathUtils.clamp(
      THREE.MathUtils.lerp(0.32, 0.85, clarityBoost) * holoBoost,
      0.28,
      0.95
    );
    holoHudDiscMat.opacity = THREE.MathUtils.clamp(
      THREE.MathUtils.lerp(0.38, 0.88, clarityBoost) * holoBoost,
      0.32,
      0.96
    );
    holoBeamConeMat.opacity = THREE.MathUtils.lerp(
      0.06,
      THREE.MathUtils.lerp(0.16, 0.24, holoFocusMix),
      clarityBoost
    );
  };
}
