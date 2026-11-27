import * as THREE from 'three';
import { HQ_ZONES } from './hqData';
import { createHQTextures } from './hqTextures';
import { buildCampusAmenities, buildHQInteriors } from './buildHQDetails';
import { buildShivajiMonument } from './buildShivajiStatue';

function createSeededRandom(seedStart: number) {
  let seed = seedStart % 2147483647;
  if (seed <= 0) seed += 2147483646;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function buildEllipseRingShape(
  outerRx: number,
  outerRz: number,
  innerRx: number,
  innerRz: number,
  segments = 56
): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const x = Math.cos(a) * outerRx;
    const y = Math.sin(a) * outerRz;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const hole = new THREE.Path();
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const x = Math.cos(a) * innerRx;
    const y = Math.sin(a) * innerRz;
    if (i === 0) hole.moveTo(x, y);
    else hole.lineTo(x, y);
  }
  shape.holes.push(hole);
  return shape;
}

export interface BuiltHQScene {
  root: THREE.Group;
  hitProxies: THREE.Object3D[];
  updateEnvironment: (
    nightMix: number,
    interiorMix: number,
    elapsed: number,
    dt: number,
    hoveredZoneId: string | null,
    selectedZoneId: string | null,
    holoFocusMix?: number
  ) => void;
  dispose: () => void;
}

// Pre-allocated color helpers for zero-GC smooth Daylight <-> Twilight interpolation
const _skyDayTop = new THREE.Color('#7ca3cc');
const _skyDayHorizon = new THREE.Color('#dce6ef');
const _skyNightTop = new THREE.Color('#09132b');
const _skyNightHorizon = new THREE.Color('#25375c');

const _fogDay = new THREE.Color('#d4e0ec');
const _fogNight = new THREE.Color('#131e36');

const _sunDayColor = new THREE.Color('#fff5e4');
const _sunNightColor = new THREE.Color('#9ec0f5');

const _hemiSkyDay = new THREE.Color('#cbe0f8');
const _hemiGroundDay = new THREE.Color('#8f887d');
const _hemiSkyNight = new THREE.Color('#3b558a');
const _hemiGroundNight = new THREE.Color('#211a14');

const _fillDay = new THREE.Color('#b6d0f2');
const _fillNight = new THREE.Color('#4769a6');

const _waterDay = new THREE.Color('#274257');
const _waterNight = new THREE.Color('#0c182c');

const _plazaDay = new THREE.Color('#d6d0c6');
const _plazaNight = new THREE.Color('#474c58');

const _highlightHoverColor = new THREE.Color('#dbe6f6');
const _highlightSelectColor = new THREE.Color('#f0cf91');

export function buildHQScene(
  scene: THREE.Scene,
  maxAnisotropy: number,
  isSoftwareGl: boolean,
  isMobile: boolean
): BuiltHQScene {
  const rand = createSeededRandom(2049);
  const root = new THREE.Group();
  scene.add(root);

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures = createHQTextures(maxAnisotropy);

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  // =========================================================================
  // 1. PROCEDURAL BLUE-HOUR TWILIGHT / DAYLIGHT SKY DOME + FULL MOON
  // =========================================================================
  const skyUniforms = {
    uTopColor: { value: _skyNightTop.clone() },
    uHorizonColor: { value: _skyNightHorizon.clone() },
    uNightMix: { value: 1.0 },
  };
  const skyGeo = trackGeo(new THREE.SphereGeometry(155, 32, 20));
  const skyMat = trackMat(
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: skyUniforms,
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 uTopColor;
        uniform vec3 uHorizonColor;
        uniform float uNightMix;
        varying vec3 vWorldPos;
        void main() {
          vec3 dir = normalize(vWorldPos);
          float h = clamp(dir.y, 0.0, 1.0);
          vec3 col = mix(uHorizonColor, uTopColor, pow(h, 0.54));
          // Soft twilight/solar horizon warmth
          float band = exp(-pow((h - 0.05) * 6.5, 2.0));
          vec3 horizonTint = mix(vec3(1.0, 0.96, 0.90), vec3(0.45, 0.34, 0.32), uNightMix);
          col = mix(col, horizonTint, band * 0.34);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })
  );
  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  skyDome.renderOrder = -10;
  scene.add(skyDome);

  // Crisp glowing Full Moon upper-right in the Twilight sky (matches reference vista)
  const moonMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: textures.moonMap,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      fog: false,
    })
  );
  const moonMesh = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(11.5, 11.5)), moonMat);
  moonMesh.position.set(42, 37, -58);
  moonMesh.lookAt(0, 10, 44);
  scene.add(moonMesh);

  const fog = new THREE.FogExp2(_fogNight.getHex(), 0.0054);
  scene.fog = fog;
  scene.background = _fogNight.clone();

  // =========================================================================
  // 2. ARCHITECTURAL LIGHTING RIG (Rich Twilight Blue/Gold <-> Crisp Daylight)
  // =========================================================================
  const hemiLight = new THREE.HemisphereLight(
    _hemiSkyNight.getHex(),
    _hemiGroundNight.getHex(),
    0.58
  );
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(_sunNightColor.getHex(), 1.15);
  sunLight.position.set(32, 42, 34);
  if (!isSoftwareGl) {
    sunLight.castShadow = true;
    const mapSize = isMobile ? 1024 : 2048;
    sunLight.shadow.mapSize.set(mapSize, mapSize);
    sunLight.shadow.camera.near = 6;
    sunLight.shadow.camera.far = 120;
    const d = 38;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.normalBias = 0.03;
    sunLight.shadow.radius = 2.6;
  }
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(_fillNight.getHex(), 0.52);
  fillLight.position.set(-34, 22, -24);
  scene.add(fillLight);

  // Warm golden architectural wash pools across the grand facade, atrium & wings
  const atriumLight = new THREE.PointLight(0xffcf82, 8.5, 34, 1.45);
  atriumLight.position.set(0, 5.4, 7.6);
  scene.add(atriumLight);

  const crownGlowLight = new THREE.PointLight(0xffdca0, 7.2, 28, 1.5);
  crownGlowLight.position.set(0, 19.5, 5.2);
  scene.add(crownGlowLight);

  // Dedicated architectural interior fill lights (boosted during Interior View)
  const spireInteriorLight = new THREE.PointLight(0xfff1dc, 0.0, 34, 1.35);
  spireInteriorLight.position.set(0, 12.2, 0);
  scene.add(spireInteriorLight);

  const westInteriorLight = new THREE.PointLight(0xd8f0ff, 0.0, 30, 1.35);
  westInteriorLight.position.set(-17.5, 6.2, 4.2);
  scene.add(westInteriorLight);

  const eastInteriorLight = new THREE.PointLight(0xffe8cb, 0.0, 30, 1.35);
  eastInteriorLight.position.set(17.5, 6.2, 4.2);
  scene.add(eastInteriorLight);

  const northInteriorLight = new THREE.PointLight(0x88d4ff, 0.0, 28, 1.35);
  northInteriorLight.position.set(0, 4.8, -13.2);
  scene.add(northInteriorLight);

  // =========================================================================
  // 3. ARCHITECTURAL MATERIAL PALETTE (Satin Silver, Champagne Gold, Reflective Glass)
  // =========================================================================
  const travertineMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: textures.stoneMap,
      roughnessMap: textures.stoneRoughnessMap,
      color: 0xe6e0d5,
      roughness: 0.72,
      metalness: 0.08,
      envMapIntensity: 0.65,
    })
  );

  // Sleek reflective architectural granite plaza (looks wet-mirrored at twilight!)
  const plazaStoneMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      map: textures.plazaMap,
      color: _plazaNight.clone(),
      roughness: 0.24,
      metalness: 0.16,
      clearcoat: 0.72,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.05,
    })
  );

  const darkTitaniumMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: textures.titaniumMap,
      roughnessMap: textures.titaniumRoughnessMap,
      color: 0x262e3c,
      roughness: 0.32,
      metalness: 0.86,
      envMapIntensity: 1.05,
    })
  );

  const satinSilverMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xd8dfe8,
      roughness: 0.22,
      metalness: 0.88,
      clearcoat: 0.35,
      clearcoatRoughness: 0.22,
      envMapIntensity: 1.25,
    })
  );

  const champagneMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xdfc18c,
      roughness: 0.22,
      metalness: 0.9,
      clearcoat: 0.4,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.35,
    })
  );

  const warmTimberMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x8e6b4a,
      roughness: 0.7,
      metalness: 0.06,
      envMapIntensity: 0.42,
    })
  );

  const solarLouverMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      map: textures.solarMap,
      color: 0x1d2d4a,
      roughness: 0.18,
      metalness: 0.48,
      clearcoat: 0.85,
      clearcoatRoughness: 0.14,
      envMapIntensity: 1.15,
    })
  );

  // Main reflective curved curtain-wall glass with warm golden floor-by-floor interior glow
  const curtainGlassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      map: textures.glassMap,
      roughnessMap: textures.glassRoughnessMap,
      emissiveMap: textures.glassEmissiveMap,
      emissive: new THREE.Color(0xffd28e),
      emissiveIntensity: 1.05,
      color: 0x83a4c7,
      roughness: 0.1,
      metalness: 0.24,
      reflectivity: 0.98,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.4,
    })
  );

  const clearCanopyGlassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xb9d4ee,
      roughness: 0.08,
      metalness: 0.1,
      transparent: true,
      opacity: 0.42,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.4,
      depthWrite: false,
    })
  );

  // Warm golden-champagne architectural ribbon LED lighting (signature halo & cornice glow)
  const archLightStripMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfff1d4,
      emissive: new THREE.Color(0xffc970),
      emissiveIntensity: 1.65,
      roughness: 0.22,
      metalness: 0.0,
    })
  );

  const interiorCoreGlowMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xefe3ce,
      emissive: new THREE.Color(0xffcc82),
      emissiveIntensity: 0.95,
      roughness: 0.62,
      metalness: 0.0,
    })
  );

  const lawnMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x3b5435,
      roughness: 0.92,
      metalness: 0.0,
      envMapIntensity: 0.24,
    })
  );

  const gardenFoliageMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x3a5b32,
      roughness: 0.84,
      metalness: 0.0,
      envMapIntensity: 0.28,
    })
  );

  const waterMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: _waterNight.clone(),
      normalMap: textures.waterNormalMap,
      normalScale: new THREE.Vector2(0.16, 0.16),
      roughness: 0.05,
      metalness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 1.0,
      envMapIntensity: 1.45,
    })
  );

  // Illuminated architectural facade signage materials (clean alpha, crisp glow)
  const spireSignMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: textures.nexusSpireLogoMap,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    })
  );
  const leftSignMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: textures.nexusLeftFacadeMap,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    })
  );
  const rightSignMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: textures.nexusRightFacadeMap,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    })
  );

  // =========================================================================
  // 4. LAYER 1: MONUMENTAL CEREMONIAL PLAZA, GOLDEN PROMENADE & WATER SANCTUARY
  // =========================================================================
  const landscapeGroup = new THREE.Group();
  root.add(landscapeGroup);

  // Contoured outer landscape extending naturally into horizon fog
  const terrainGeo = trackGeo(new THREE.CircleGeometry(142, 72));
  terrainGeo.rotateX(-Math.PI / 2);
  const tPos = terrainGeo.attributes.position;
  for (let i = 0; i < tPos.count; i++) {
    const x = tPos.getX(i);
    const z = tPos.getZ(i);
    const dist = Math.sqrt(x * x + z * z);
    let y = 0;
    if (dist > 38) {
      const env = Math.min(1, (dist - 38) / 36);
      const angle = Math.atan2(z, x);
      y =
        env *
        env *
        (2.4 +
          Math.sin(angle * 3 + dist * 0.05) * 1.5 +
          Math.cos(angle * 5 - dist * 0.04) * 0.8);
    }
    tPos.setY(i, y);
  }
  terrainGeo.computeVertexNormals();
  const terrainMesh = new THREE.Mesh(terrainGeo, lawnMat);
  terrainMesh.receiveShadow = true;
  landscapeGroup.add(terrainMesh);

  // Vast Grand Ceremonial Plaza Disc (y = 0.22) supporting wings, statue, fountains & promenade
  const outerPlinthGeo = trackGeo(new THREE.CylinderGeometry(35.5, 36.8, 0.24, 72));
  outerPlinthGeo.scale(1.06, 1, 0.96);
  const outerPlinth = new THREE.Mesh(outerPlinthGeo, plazaStoneMat);
  outerPlinth.position.set(0, 0.12, 3.2);
  outerPlinth.receiveShadow = true;
  landscapeGroup.add(outerPlinth);

  // Architectural Mirror Water Reflecting Basins flanking Left & Right behind the Statue
  for (const side of [-1, 1]) {
    const basinGeo = trackGeo(new THREE.CylinderGeometry(5.6, 5.8, 0.12, 32));
    basinGeo.scale(1.25, 1, 0.72);
    const basin = new THREE.Mesh(basinGeo, waterMat);
    basin.position.set(side * 9.8, 0.27, 13.8);
    landscapeGroup.add(basin);

    const rimGeo = trackGeo(new THREE.TorusGeometry(5.7, 0.14, 8, 36));
    rimGeo.rotateX(Math.PI / 2);
    rimGeo.scale(1.25, 1, 0.72);
    const rim = new THREE.Mesh(rimGeo, travertineMat);
    rim.position.set(side * 9.8, 0.28, 13.8);
    landscapeGroup.add(rim);
  }

  // Grand Golden Linear Illuminated Promenade Strips leading toward Chhatrapati Shivaji Maharaj
  const promLineGeo = trackGeo(new THREE.BoxGeometry(0.14, 0.03, 18.5));
  for (const lx of [-5.2, -3.4, 3.4, 5.2]) {
    const strip = new THREE.Mesh(promLineGeo, archLightStripMat);
    strip.position.set(lx, 0.255, 29.8);
    landscapeGroup.add(strip);
  }

  // Elevated Building Podium Platform under Central Spire & Symmetrical Wings (y = 0.24 -> 0.90)
  const mainPodiumGeo = trackGeo(new THREE.BoxGeometry(46.0, 0.66, 17.5));
  const mainPodium = new THREE.Mesh(mainPodiumGeo, travertineMat);
  mainPodium.position.set(0, 0.57, 1.0);
  mainPodium.receiveShadow = true;
  mainPodium.castShadow = !isSoftwareGl;
  landscapeGroup.add(mainPodium);

  // Grand Wide Illuminated Civic Steps rising from behind the Statue up to the Main Atrium
  for (let st = 0; st < 5; st++) {
    const stepW = 14.0 - st * 0.5;
    const stepMesh = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(stepW, 0.14, 0.62)),
      travertineMat
    );
    stepMesh.position.set(0, 0.31 + st * 0.13, 10.2 - st * 0.55);
    stepMesh.receiveShadow = true;
    const stepLed = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(stepW - 0.2, 0.03, 0.05)),
      archLightStripMat
    );
    stepLed.position.set(0, 0.36 + st * 0.13, 10.52 - st * 0.55);
    landscapeGroup.add(stepMesh, stepLed);
  }

  // =========================================================================
  // 5. LAYER 2: MONUMENTAL CENTRAL CATHEDRAL-ARCH SPIRE ("NEXUS" CROWN TOWER)
  // =========================================================================
  const spireGroup = new THREE.Group();
  spireGroup.position.set(0, 0.9, 0);
  root.add(spireGroup);

  const SPIRE_HEIGHT = 26.8;
  const spireRings = 34;
  const spireSegs = 44;
  const spPositions: number[] = [];
  const spUvs: number[] = [];
  const spIndices: number[] = [];

  // Tapered sculptural cathedral-spire profile (flared wide glass base -> soaring pointed crown)
  const cathedralRadiusAt = (t: number): { rx: number; rz: number } => {
    const baseFlare = 1.0 + 0.22 * Math.pow(1 - t, 2.2);
    const taper = Math.pow(1 - t * 0.72, 0.82);
    return {
      rx: 5.8 * taper * baseFlare,
      rz: 4.5 * taper * baseFlare,
    };
  };

  for (let i = 0; i <= spireRings; i++) {
    const t = i / spireRings;
    const y = t * SPIRE_HEIGHT;
    const { rx, rz } = cathedralRadiusAt(t);
    for (let j = 0; j <= spireSegs; j++) {
      const u = j / spireSegs;
      const theta = u * Math.PI * 2;
      const wx = Math.cos(theta) * rx;
      const wz = Math.sin(theta) * rz;
      spPositions.push(wx, y, wz);
      spUvs.push(u * 4.5, t * 2.6);
    }
  }
  for (let i = 0; i < spireRings; i++) {
    for (let j = 0; j < spireSegs; j++) {
      const a = i * (spireSegs + 1) + j;
      const b = a + spireSegs + 1;
      const c = b + 1;
      const d = a + 1;
      spIndices.push(a, b, d);
      spIndices.push(b, c, d);
    }
  }
  const spireGlassGeo = trackGeo(new THREE.BufferGeometry());
  spireGlassGeo.setAttribute('position', new THREE.Float32BufferAttribute(spPositions, 3));
  spireGlassGeo.setAttribute('uv', new THREE.Float32BufferAttribute(spUvs, 2));
  spireGlassGeo.setIndex(spIndices);
  spireGlassGeo.computeVertexNormals();

  const spireGlassMesh = new THREE.Mesh(spireGlassGeo, curtainGlassMat);
  spireGlassMesh.castShadow = !isSoftwareGl;
  spireGlassMesh.receiveShadow = true;
  spireGroup.add(spireGlassMesh);

  // Signature Twin Soaring Gothic-Futuristic Silver & Gold Arch Blade Fins converging at the Crown!
  for (const side of [-1, 1]) {
    // Primary tall outer cathedral arch blade sweeping gracefully into the unified crown keystone
    const archCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 7.6, 0.0, 2.4),
      new THREE.Vector3(side * 6.4, 8.8, 3.1),
      new THREE.Vector3(side * 4.4, 17.8, 2.8),
      new THREE.Vector3(side * 2.05, 24.8, 1.45),
      new THREE.Vector3(side * 0.14, 29.15, 0.0),
    ]);
    const mainBlade = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(archCurve, 36, 0.32, 8, false)),
      satinSilverMat
    );
    mainBlade.castShadow = !isSoftwareGl;
    spireGroup.add(mainBlade);

    // Warm golden LED trim hugging the inner curve of each soaring blade fin
    const glowCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 7.25, 0.2, 2.55),
      new THREE.Vector3(side * 6.08, 8.8, 3.22),
      new THREE.Vector3(side * 4.1, 17.8, 2.92),
      new THREE.Vector3(side * 1.82, 24.6, 1.56),
      new THREE.Vector3(side * 0.12, 28.85, 0.08),
    ]);
    const glowRib = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(glowCurve, 34, 0.075, 6, false)),
      archLightStripMat
    );
    spireGroup.add(glowRib);

    // Secondary dramatic pointed outer spire pinnacle flanking left & right of central crown
    const secFinCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 8.4, 4.2, -0.4),
      new THREE.Vector3(side * 6.9, 13.5, 0.15),
      new THREE.Vector3(side * 4.5, 22.4, 0.05),
      new THREE.Vector3(side * 3.45, 26.4, -0.1),
    ]);
    const secFin = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(secFinCurve, 28, 0.22, 8, false)),
      champagneMat
    );
    secFin.castShadow = !isSoftwareGl;
    spireGroup.add(secFin);

    // Tapered pointed champagne-gold finial needle capping each outer pinnacle cleanly
    const secTip = new THREE.Mesh(
      trackGeo(new THREE.ConeGeometry(0.22, 2.35, 8)),
      champagneMat
    );
    secTip.position.set(side * 3.22, 27.5, -0.13);
    secTip.rotation.z = side * 0.2;
    secTip.castShadow = !isSoftwareGl;
    spireGroup.add(secTip);

    // Sleek champagne-gold structural sky-braces tying outer pinnacles firmly into the crown collar
    for (const [braceY, innerX, outerX] of [
      [23.2, 2.55, 4.35],
      [26.2, 2.02, 3.48],
    ] as const) {
      const braceCurve = new THREE.LineCurve3(
        new THREE.Vector3(side * innerX, braceY, -0.05),
        new THREE.Vector3(side * outerX, braceY, -0.08)
      );
      const brace = new THREE.Mesh(
        trackGeo(new THREE.TubeGeometry(braceCurve, 4, 0.1, 6, false)),
        satinSilverMat
      );
      spireGroup.add(brace);
    }
  }

  // Rear structural cathedral ribs curving smoothly into the closed summit crown collar
  for (let r = 0; r < 6; r++) {
    const th = Math.PI * 0.72 + (r / 5) * Math.PI * 1.56;
    const pts: THREE.Vector3[] = [];
    for (let s = 0; s <= 12; s++) {
      const t = s / 12;
      const { rx, rz } = cathedralRadiusAt(t);
      pts.push(new THREE.Vector3(Math.cos(th) * (rx + 0.14), t * SPIRE_HEIGHT, Math.sin(th) * (rz + 0.14)));
    }
    const rib = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 22, 0.14, 6, false)),
      r % 2 === 0 ? darkTitaniumMat : satinSilverMat
    );
    spireGroup.add(rib);
  }

  // =========================================================================
  // ARCHITECTURAL SUMMIT CROWN, FACETED SKYLIGHT DOME & LANDMARK APEX SPIRE
  // (Seals the cathedral top with a signature sculptural skyline silhouette!)
  // =========================================================================
  const crownGroup = new THREE.Group();
  crownGroup.position.set(0, SPIRE_HEIGHT, 0);
  spireGroup.add(crownGroup);

  // 1. Sculpted Satin-Silver & Dark-Titanium Elliptical Crown Cornice Collar sealing the glass rim
  const crownBaseSlab = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(2.12, 2.18, 0.36, 36)),
    darkTitaniumMat
  );
  crownBaseSlab.scale.set(1.06, 1, 0.82);
  crownBaseSlab.position.y = 0.02;

  const crownRimRing = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(2.2, 0.16, 10, 44)),
    satinSilverMat
  );
  crownRimRing.rotation.x = Math.PI / 2;
  crownRimRing.scale.set(1.06, 0.82, 1);
  crownRimRing.position.y = 0.14;

  // Warm illuminated architectural LED ring crowning the summit cornice
  const crownLedRing = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(2.28, 0.055, 8, 44)),
    archLightStripMat
  );
  crownLedRing.rotation.x = Math.PI / 2;
  crownLedRing.scale.set(1.06, 0.82, 1);
  crownLedRing.position.y = 0.24;
  crownGroup.add(crownBaseSlab, crownRimRing, crownLedRing);

  // 2. Sculpted Reflective Glass Skylight Observatory Dome rising cleanly above the collar
  const skylightDome = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(2.05, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.52)),
    curtainGlassMat
  );
  skylightDome.scale.set(1.05, 1.08, 0.8);
  skylightDome.position.y = 0.14;
  crownGroup.add(skylightDome);

  // 6 Curved Geodesic Satin-Silver Dome Ribs converging to the Apex Keystone Hub
  for (let d = 0; d < 6; d++) {
    const a = (d / 6) * Math.PI * 2;
    const ribPts: THREE.Vector3[] = [];
    for (let k = 0; k <= 8; k++) {
      const phi = (k / 8) * (Math.PI * 0.5);
      const rCos = Math.cos(phi);
      const rSin = Math.sin(phi);
      ribPts.push(
        new THREE.Vector3(
          Math.cos(a) * rCos * 2.18,
          0.14 + rSin * 2.26,
          Math.sin(a) * rCos * 1.68
        )
      );
    }
    const domeRib = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ribPts), 14, 0.085, 6, false)),
      d % 2 === 0 ? satinSilverMat : champagneMat
    );
    crownGroup.add(domeRib);
  }

  // 3. Elevated Floating Golden Crown Halo encircling the Summit Observatory Dome
  const upperHaloOuter = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(2.92, 0.11, 10, 48)),
    satinSilverMat
  );
  upperHaloOuter.rotation.x = Math.PI / 2;
  upperHaloOuter.scale.set(1.06, 0.82, 1);
  upperHaloOuter.position.y = 1.05;

  const upperHaloLed = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(2.76, 0.048, 8, 44)),
    archLightStripMat
  );
  upperHaloLed.rotation.x = Math.PI / 2;
  upperHaloLed.scale.set(1.06, 0.82, 1);
  upperHaloLed.position.y = 1.02;
  crownGroup.add(upperHaloOuter, upperHaloLed);

  // 4. Unified Apex Keystone Crest & Soaring Architectural Landmark Spire Needle (y = 29.0 -> 34.5)
  const apexKeystone = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.42, 0.68, 0.65, 16)),
    champagneMat
  );
  apexKeystone.position.y = 2.42;

  const apexSpireMast = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.035, 0.28, 5.2, 14)),
    satinSilverMat
  );
  apexSpireMast.position.y = 5.25;
  apexSpireMast.castShadow = !isSoftwareGl;

  // 3 Diminishing Illuminated Golden Beacon Rings ascending the Landmark Spire Needle
  for (const [ry, rr] of [
    [3.35, 0.56],
    [4.55, 0.38],
    [5.75, 0.24],
  ] as const) {
    const bRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(rr, 0.042, 8, 24)),
      archLightStripMat
    );
    bRing.rotation.x = Math.PI / 2;
    bRing.position.y = ry;
    crownGroup.add(bRing);
  }

  // Radiant Architectural Apex Crystal Tip at the Summit Peak
  const apexBeaconTip = new THREE.Mesh(
    trackGeo(new THREE.OctahedronGeometry(0.24, 1)),
    archLightStripMat
  );
  apexBeaconTip.scale.set(0.85, 1.6, 0.85);
  apexBeaconTip.position.y = 7.95;

  crownGroup.add(apexKeystone, apexSpireMast, apexBeaconTip);

  // Illuminated "N / NEXUS" Emblem glowing proudly on the Upper Central Spire Facade!
  const spireLogoPlane = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(5.6, 4.2)),
    spireSignMat
  );
  spireLogoPlane.position.set(0, 20.6, 3.05);
  spireLogoPlane.rotation.x = -0.14;
  spireGroup.add(spireLogoPlane);

  // SIGNATURE FLOATING GOLDEN-LIT ELLIPTICAL HALO RING MID-SPIRE (Behind Shivaji Maharaj's Sword!)
  const midHaloGroup = new THREE.Group();
  midHaloGroup.position.set(0, 14.2, 1.35);
  spireGroup.add(midHaloGroup);

  const haloShape = buildEllipseRingShape(6.25, 4.4, 4.85, 3.35, 52);
  const haloGeo = trackGeo(
    new THREE.ExtrudeGeometry(haloShape, {
      depth: 0.46,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 2,
    })
  );
  haloGeo.rotateX(Math.PI / 2);
  const midHaloMesh = new THREE.Mesh(haloGeo, satinSilverMat);
  midHaloMesh.castShadow = !isSoftwareGl;
  midHaloGroup.add(midHaloMesh);

  // Double glowing golden architectural light rings framing the mid-tower halo
  const haloOuterLed = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(6.26, 0.085, 8, 56)),
    archLightStripMat
  );
  haloOuterLed.rotation.x = Math.PI / 2;
  haloOuterLed.scale.set(1, 1, 4.4 / 6.25);
  haloOuterLed.position.y = -0.22;

  const haloInnerLed = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(4.86, 0.065, 8, 48)),
    archLightStripMat
  );
  haloInnerLed.rotation.x = Math.PI / 2;
  haloInnerLed.scale.set(1, 1, 3.35 / 4.85);
  haloInnerLed.position.y = -0.34;
  midHaloGroup.add(haloOuterLed, haloInnerLed);

  // Twin Terraced Mid-Tower Curved Shoulder Volumes flanking the Spire (Levels 1-5)
  for (const side of [-1, 1]) {
    const shGroup = new THREE.Group();
    shGroup.position.set(side * 8.2, 0, -0.4);
    spireGroup.add(shGroup);

    const shGlassGeo = trackGeo(new THREE.CylinderGeometry(4.8, 5.6, 13.8, 28));
    shGlassGeo.scale(1.18, 1, 0.85);
    const shGlass = new THREE.Mesh(shGlassGeo, curtainGlassMat);
    shGlass.position.y = 6.9;
    shGlass.castShadow = !isSoftwareGl;
    shGroup.add(shGlass);

    // Horizontal warm-lit architectural floor cornice bands along the shoulders
    for (let fl = 1; fl <= 4; fl++) {
      const bandY = fl * 3.15;
      const bandR = THREE.MathUtils.lerp(5.65, 4.9, fl / 4);
      const band = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(bandR, 0.11, 6, 32)),
        fl === 4 ? satinSilverMat : champagneMat
      );
      band.rotation.x = Math.PI / 2;
      band.scale.set(1.18, 1, 0.85);
      band.position.y = bandY;
      shGroup.add(band);
    }

    // Lush rooftop botanical garden cap atop each shoulder tower!
    const shRoofSlab = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(5.1, 5.0, 0.34, 28)),
      satinSilverMat
    );
    shRoofSlab.scale.set(1.18, 1, 0.85);
    shRoofSlab.position.y = 13.95;
    shGroup.add(shRoofSlab);

    const shGarden = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(4.5, 4.7, 0.42, 24)),
      gardenFoliageMat
    );
    shGarden.scale.set(1.15, 1, 0.82);
    shGarden.position.y = 14.32;
    shGroup.add(shGarden);
  }

  // =========================================================================
  // 6. LAYER 3: SYMMETRICAL SWEEPING DOUBLE-WING CURVED GLASS PAVILIONS
  //    (West Wing = R&D + "NEXUS / Build · Innovate · Inspire",
  //     East Wing = Creative Studio + "A Global Ecosystem for a Greater Tomorrow")
  // =========================================================================
  const wingShellMats: THREE.MeshPhysicalMaterial[] = [];

  for (const side of [-1, 1]) {
    const wingGroup = new THREE.Group();
    wingGroup.position.set(side * 17.5, 0.9, 4.2);
    root.add(wingGroup);

    // Tall sweeping curved glass drum facade (two monumental double-height levels)
    const wingGlassGeo = trackGeo(new THREE.CylinderGeometry(6.8, 7.1, 10.2, 42));
    wingGlassGeo.scale(1.15, 1, 0.84);
    const wingGlass = new THREE.Mesh(wingGlassGeo, curtainGlassMat);
    wingGlass.position.y = 5.1;
    wingGlass.castShadow = !isSoftwareGl;
    wingGlass.receiveShadow = true;
    wingGroup.add(wingGlass);

    // Mid-height travertine/silver architectural floor deck inside the wing
    const wingMidDeckGeo = trackGeo(new THREE.CylinderGeometry(6.55, 6.65, 0.28, 38));
    wingMidDeckGeo.scale(1.14, 1, 0.83);
    const wingMidDeck = new THREE.Mesh(wingMidDeckGeo, travertineMat);
    wingMidDeck.position.y = 5.0;
    wingGroup.add(wingMidDeck);

    // Overhanging Curved Satin-Silver Roof Parapet Canopy (fades softly in Interior Cutaway)
    const wingRoofMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xdce3ec,
        roughness: 0.28,
        metalness: 0.72,
        clearcoat: 0.35,
        envMapIntensity: 1.1,
      })
    );
    wingShellMats.push(wingRoofMat);

    const wingRoofGeo = trackGeo(new THREE.CylinderGeometry(7.35, 7.15, 0.52, 42));
    wingRoofGeo.scale(1.16, 1, 0.86);
    const wingRoof = new THREE.Mesh(wingRoofGeo, wingRoofMat);
    wingRoof.position.y = 10.35;
    wingRoof.castShadow = !isSoftwareGl;
    wingGroup.add(wingRoof);

    // Glowing Golden Roof Rim & Mid-Facade Architectural Cornice Strips
    for (const [ry, rScale] of [
      [10.12, 7.36],
      [5.05, 7.14],
      [0.24, 7.22],
    ]) {
      const wLed = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(rScale, 0.085, 8, 48)),
        archLightStripMat
      );
      wLed.rotation.x = Math.PI / 2;
      wLed.scale.set(1.16, 1, 0.86);
      wLed.position.y = ry;
      wingGroup.add(wLed);
    }

    // Lush Rooftop Botanical Park Terrace atop each Wing!
    const wingGarden = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(6.55, 6.7, 0.45, 34)),
      gardenFoliageMat
    );
    wingGarden.scale.set(1.13, 1, 0.82);
    wingGarden.position.y = 10.78;
    wingGroup.add(wingGarden);

    // Signature Sculptural Outer Wing Roof Fin Spire (matching the sweeping crest on both sides!)
    const crestCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-side * 4.5, 10.5, 0.2),
      new THREE.Vector3(side * 1.2, 12.6, 0.1),
      new THREE.Vector3(side * 4.6, 15.2, -0.2),
    ]);
    const wingCrest = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(crestCurve, 22, 0.26, 8, false)),
      satinSilverMat
    );
    wingCrest.castShadow = !isSoftwareGl;
    const wingCrestLed = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(crestCurve, 22, 0.09, 6, false)),
      archLightStripMat
    );
    wingCrestLed.position.y = -0.2;
    wingGroup.add(wingCrest, wingCrestLed);

    // Vertical dark-titanium curved facade structural mullions framing the glass
    const mulGeo = trackGeo(new THREE.BoxGeometry(0.18, 10.1, 0.34));
    for (let m = 0; m < 10; m++) {
      const a = (m / 10) * Math.PI * 2;
      const mul = new THREE.Mesh(mulGeo, darkTitaniumMat);
      mul.position.set(Math.cos(a) * 6.95 * 1.15, 5.1, Math.sin(a) * 6.95 * 0.84);
      mul.rotation.y = -a + Math.PI / 2;
      wingGroup.add(mul);
    }

    // CURVED ILLUMINATED ARCHITECTURAL FACADE TYPOGRAPHY (Conforms cleanly to front glass arc!)
    // Cylinder arc segment facing +Z (thetaStart = -0.44, thetaLength = 0.88 centered at +Z)
    const signArcGeo = trackGeo(
      new THREE.CylinderGeometry(7.05, 7.05, 4.85, 24, 1, true, -0.46, 0.92)
    );
    signArcGeo.scale(1.16, 1, 0.86);
    const signMesh = new THREE.Mesh(
      signArcGeo,
      side === -1 ? leftSignMat : rightSignMat
    );
    signMesh.position.set(0, 6.2, 0.12);
    wingGroup.add(signMesh);
  }

  // =========================================================================
  // 7. SIGNATURE CONTINUOUS FLOWING S-CURVE ARCHITECTURAL FACADE RIBBON
  //    (Sweeping organically from West Wing -> Grand Entrance Canopy -> East Wing!)
  // =========================================================================
  const ribbonPts = [
    new THREE.Vector3(-25.4, 10.5, 4.4),
    new THREE.Vector3(-20.2, 11.4, 9.9),
    new THREE.Vector3(-13.4, 9.2, 9.6),
    new THREE.Vector3(-8.2, 6.2, 8.8),
    new THREE.Vector3(0.0, 5.6, 10.4),
    new THREE.Vector3(8.2, 6.2, 8.8),
    new THREE.Vector3(13.4, 9.2, 9.6),
    new THREE.Vector3(20.2, 11.4, 9.9),
    new THREE.Vector3(25.4, 10.5, 4.4),
  ];
  const ribbonCurve = new THREE.CatmullRomCurve3(ribbonPts);
  const mainRibbonMesh = new THREE.Mesh(
    trackGeo(new THREE.TubeGeometry(ribbonCurve, 72, 0.44, 10, false)),
    satinSilverMat
  );
  mainRibbonMesh.castShadow = !isSoftwareGl;
  root.add(mainRibbonMesh);

  // Continuous glowing golden LED light strip running beneath the sweeping S-curve ribbon!
  const ribbonLedPts = ribbonPts.map((p) => p.clone().add(new THREE.Vector3(0, -0.44, 0.12)));
  const ribbonLedMesh = new THREE.Mesh(
    trackGeo(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ribbonLedPts), 72, 0.1, 6, false)),
    archLightStripMat
  );
  root.add(ribbonLedMesh);

  // Twin Soaring Diagonal Illuminated Forecourt Buttress Struts (Left & Right)
  for (const side of [-1, 1]) {
    const strutCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 10.2, 0.35, 13.8),
      new THREE.Vector3(side * 14.2, 3.6, 12.2),
      new THREE.Vector3(side * 18.8, 7.8, 10.6),
    ]);
    const strut = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(strutCurve, 20, 0.22, 8, false)),
      satinSilverMat
    );
    strut.castShadow = !isSoftwareGl;
    const strutLed = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(strutCurve, 20, 0.08, 6, false)),
      archLightStripMat
    );
    strutLed.position.y = 0.16;
    root.add(strut, strutLed);
  }

  // =========================================================================
  // 8. GRAND CENTRAL CIRCULAR GLASS ATRIUM & CANTILEVERED GOLDEN CANOPY RING
  // =========================================================================
  const atriumGroup = new THREE.Group();
  atriumGroup.position.set(0, 0.72, 5.4);
  root.add(atriumGroup);

  // Double-height transparent circular glazed atrium rotunda
  const lobbyGeo = trackGeo(new THREE.CylinderGeometry(5.6, 5.9, 4.7, 36));
  lobbyGeo.scale(1.22, 1, 0.88);
  const lobbyMesh = new THREE.Mesh(lobbyGeo, curtainGlassMat);
  lobbyMesh.position.set(0, 2.45, 0);
  atriumGroup.add(lobbyMesh);

  // Warm interior glow core (fades cleanly to transparent in Interior Cutaway)
  const lanternMat = trackMat(interiorCoreGlowMat.clone());
  const lanternGeo = trackGeo(new THREE.CylinderGeometry(2.6, 2.8, 3.6, 24));
  const lanternMesh = new THREE.Mesh(lanternGeo, lanternMat);
  lanternMesh.position.set(0, 2.0, -1.2);
  atriumGroup.add(lanternMesh);

  // Iconic Wide Cantilevered Elliptical Entrance Canopy Ring with Double Golden Light Halos!
  const entryHaloShape = buildEllipseRingShape(8.4, 5.6, 4.8, 3.2, 56);
  const entryHaloGeo = trackGeo(
    new THREE.ExtrudeGeometry(entryHaloShape, {
      depth: 0.42,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 2,
    })
  );
  entryHaloGeo.rotateX(Math.PI / 2);
  const entryCanopy = new THREE.Mesh(entryHaloGeo, satinSilverMat);
  entryCanopy.position.set(0, 5.15, 0.8);
  entryCanopy.castShadow = !isSoftwareGl;
  atriumGroup.add(entryCanopy);

  const entryLedOuter = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(8.38, 0.085, 8, 56)),
    archLightStripMat
  );
  entryLedOuter.rotation.x = Math.PI / 2;
  entryLedOuter.scale.set(1, 1, 5.6 / 8.4);
  entryLedOuter.position.set(0, 4.84, 0.8);

  const entryLedInner = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(4.85, 0.065, 8, 48)),
    archLightStripMat
  );
  entryLedInner.rotation.x = Math.PI / 2;
  entryLedInner.scale.set(1, 1, 3.2 / 4.8);
  entryLedInner.position.set(0, 4.84, 0.8);
  atriumGroup.add(entryLedOuter, entryLedInner);

  // Lush cantilevered sky-garden greenery atop the entrance canopy ring
  const canopyGardenGeo = trackGeo(new THREE.TorusGeometry(6.6, 0.42, 8, 44));
  canopyGardenGeo.rotateX(Math.PI / 2);
  canopyGardenGeo.scale(1, 1, 0.66);
  const canopyGarden = new THREE.Mesh(canopyGardenGeo, gardenFoliageMat);
  canopyGarden.position.set(0, 5.42, 0.8);
  atriumGroup.add(canopyGarden);

  // =========================================================================
  // 9. SYMMETRICAL ELEVATED GLAZED SKYBRIDGES (West, East & North)
  // =========================================================================
  const buildSkybridge = (
    p0: THREE.Vector3,
    pMid: THREE.Vector3,
    p1: THREE.Vector3,
    width: number,
    height: number
  ) => {
    const bridgeGroup = new THREE.Group();
    const curve = new THREE.QuadraticBezierCurve3(p0, pMid, p1);
    const segs = 16;

    const deckGeo = trackGeo(new THREE.TubeGeometry(curve, segs, height * 0.5, 8, false));
    deckGeo.scale(1, 0.86, 1);
    const glassTube = new THREE.Mesh(deckGeo, curtainGlassMat);
    glassTube.castShadow = !isSoftwareGl;
    bridgeGroup.add(glassTube);

    const bottomCurve = new THREE.QuadraticBezierCurve3(
      p0.clone().add(new THREE.Vector3(0, -height * 0.48, 0)),
      pMid.clone().add(new THREE.Vector3(0, -height * 0.54, 0)),
      p1.clone().add(new THREE.Vector3(0, -height * 0.48, 0))
    );
    const spineMesh = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(bottomCurve, segs, width * 0.16, 8, false)),
      satinSilverMat
    );
    bridgeGroup.add(spineMesh);

    const soffitCurve = new THREE.QuadraticBezierCurve3(
      p0.clone().add(new THREE.Vector3(0, -height * 0.6, 0)),
      pMid.clone().add(new THREE.Vector3(0, -height * 0.66, 0)),
      p1.clone().add(new THREE.Vector3(0, -height * 0.6, 0))
    );
    const soffitMesh = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(soffitCurve, segs, 0.065, 6, false)),
      archLightStripMat
    );
    bridgeGroup.add(soffitMesh);

    const ringGeo = trackGeo(new THREE.TorusGeometry(height * 0.55, 0.055, 6, 16));
    const tan = new THREE.Vector3();
    const upAxis = new THREE.Vector3(0, 0, 1);
    for (let i = 1; i < 6; i++) {
      const t = i / 6;
      const pt = curve.getPoint(t);
      curve.getTangent(t, tan).normalize();
      const ring = new THREE.Mesh(ringGeo, champagneMat);
      ring.position.copy(pt);
      ring.quaternion.setFromUnitVectors(upAxis, tan);
      bridgeGroup.add(ring);
    }
    root.add(bridgeGroup);
  };

  // Symmetrical Upper Glazed Skybridges linking Central Spire Shoulders to West & East Wings
  buildSkybridge(
    new THREE.Vector3(-8.4, 11.4, 1.4),
    new THREE.Vector3(-12.6, 11.6, 2.8),
    new THREE.Vector3(-16.6, 10.6, 4.0),
    1.55,
    1.48
  );
  buildSkybridge(
    new THREE.Vector3(8.4, 11.4, 1.4),
    new THREE.Vector3(12.6, 11.6, 2.8),
    new THREE.Vector3(16.6, 10.6, 4.0),
    1.55,
    1.48
  );
  // North Operations Sky-Gallery connecting Central Spire to North Titanium Core
  buildSkybridge(
    new THREE.Vector3(0, 6.2, -4.4),
    new THREE.Vector3(0, 6.4, -7.8),
    new THREE.Vector3(0, 6.2, -10.6),
    1.45,
    1.35
  );

  // =========================================================================
  // 10. NORTH TITANIUM INFRASTRUCTURE CORE ("DIGITAL OPERATIONS" — Rear Wing)
  // =========================================================================
  const northGroup = new THREE.Group();
  northGroup.position.set(0, 1.02, -13.2);
  root.add(northGroup);

  const northShape = new THREE.Shape();
  northShape.moveTo(-5.0, -2.6);
  northShape.lineTo(5.0, -2.6);
  northShape.lineTo(5.8, 0.4);
  northShape.lineTo(3.8, 2.8);
  northShape.lineTo(-3.8, 2.8);
  northShape.lineTo(-5.8, 0.4);
  northShape.closePath();

  const northBaseGeo = trackGeo(
    new THREE.ExtrudeGeometry(northShape, {
      depth: 7.4,
      bevelEnabled: true,
      bevelThickness: 0.18,
      bevelSize: 0.18,
      bevelSegments: 2,
    })
  );
  northBaseGeo.rotateX(-Math.PI / 2);
  const northShellMat = trackMat(darkTitaniumMat.clone());
  const northMonolith = new THREE.Mesh(northBaseGeo, northShellMat);
  northMonolith.castShadow = !isSoftwareGl;
  northMonolith.receiveShadow = true;
  northGroup.add(northMonolith);

  const louverBandGeo = trackGeo(new THREE.BoxGeometry(11.2, 0.12, 5.5));
  for (let l = 1; l <= 6; l++) {
    const band = new THREE.Mesh(louverBandGeo, l % 2 === 0 ? satinSilverMat : champagneMat);
    band.position.set(0, l * 1.12, 0.1);
    northGroup.add(band);
  }
  const northSolar = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(8.4, 0.12, 3.8)),
    solarLouverMat
  );
  northSolar.position.set(0, 8.05, -0.35);
  northSolar.rotation.x = 0.16;
  northGroup.add(northSolar);

  // =========================================================================
  // 11. TWO SLEEK AUTONOMOUS FUTURISTIC AERIAL SHUTTLES (Cruising High Over HQ)
  // =========================================================================
  const shuttles: Array<{
    group: THREE.Group;
    centerX: number;
    centerZ: number;
    radiusX: number;
    radiusZ: number;
    altitude: number;
    speed: number;
    phase: number;
  }> = [];

  const buildAerialShuttle = (): THREE.Group => {
    const sGrp = new THREE.Group();
    const hull = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.95, 16, 12)),
      satinSilverMat
    );
    hull.scale.set(2.1, 0.42, 0.92);
    const canopy = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.7, 14, 10)),
      darkTitaniumMat
    );
    canopy.scale.set(1.75, 0.34, 0.78);
    canopy.position.y = 0.16;
    const navRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(1.12, 0.045, 6, 28)),
      archLightStripMat
    );
    navRing.rotation.x = Math.PI / 2;
    navRing.scale.set(1.65, 0.76, 1);
    navRing.position.y = -0.06;
    sGrp.add(hull, canopy, navRing);
    return sGrp;
  };

  const shuttleConfigs = [
    { centerX: -16.5, centerZ: 1.5, radiusX: 4.5, radiusZ: 3.2, altitude: 21.8, speed: 0.24, phase: 0.2 },
    { centerX: 18.5, centerZ: -1.0, radiusX: 4.8, radiusZ: 3.4, altitude: 23.2, speed: -0.21, phase: 2.1 },
  ];
  for (const cfg of shuttleConfigs) {
    const sh = buildAerialShuttle();
    root.add(sh);
    shuttles.push({ group: sh, ...cfg });
  }

  // =========================================================================
  // 12. INSTANCED BOTANICAL PARK TREES & ROOFTOP GARDEN TREES
  // =========================================================================
  const treeCoords: Array<{ x: number; y: number; z: number; scale: number }> = [];

  // Perimeter park groves framing left, right & rear (keeping grand front statue vista wide open)
  const targetTrees = isMobile ? 64 : 108;
  for (let i = 0; i < targetTrees; i++) {
    const angle = rand() * Math.PI * 2;
    const distFromFront = Math.abs(
      Math.atan2(Math.sin(angle - Math.PI * 0.5), Math.cos(angle - Math.PI * 0.5))
    );
    if (distFromFront < 0.42) continue;

    const radius = 34.0 + rand() * 20.0;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    let y = 0;
    if (radius > 38) {
      const env = Math.min(1, (radius - 38) / 36);
      y = env * env * (2.4 + Math.sin(angle * 3 + radius * 0.05) * 1.5);
    }
    treeCoords.push({ x, y, z, scale: 0.8 + rand() * 0.65 });
  }

  // Forecourt warm-lit promenade trees flanking left & right (like the golden-lit avenue in reference!)
  const avenueTrees: Array<[number, number, number, number]> = [
    [-25.5, 0.24, 15.5, 0.95],
    [-26.8, 0.24, 21.0, 1.05],
    [-22.5, 0.24, 27.2, 0.98],
    [25.5, 0.24, 15.5, 0.95],
    [26.8, 0.24, 21.0, 1.05],
    [22.5, 0.24, 27.2, 0.98],
    // Rooftop trees lining BOTH West & East Wings & Mid-Tower Shoulders!
    [-21.2, 11.75, 5.2, 0.44],
    [-18.2, 11.75, 7.6, 0.42],
    [-14.6, 11.75, 6.8, 0.4],
    [-16.8, 11.75, 1.6, 0.42],
    [21.2, 11.75, 5.2, 0.44],
    [18.2, 11.75, 7.6, 0.42],
    [14.6, 11.75, 6.8, 0.4],
    [16.8, 11.75, 1.6, 0.42],
    [-10.4, 15.3, 1.8, 0.36],
    [-7.6, 15.3, 2.4, 0.35],
    [10.4, 15.3, 1.8, 0.36],
    [7.6, 15.3, 2.4, 0.35],
    [-10.8, 0.9, 8.8, 0.62],
    [10.8, 0.9, 8.8, 0.62],
  ];
  for (const [x, y, z, scale] of avenueTrees) {
    treeCoords.push({ x, y, z, scale });
  }

  const trunkGeo = trackGeo(new THREE.CylinderGeometry(0.11, 0.18, 1.6, 7));
  trunkGeo.translate(0, 0.8, 0);
  const trunkMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x564638, roughness: 0.92, metalness: 0.0 })
  );
  const treeCrownGeo = trackGeo(new THREE.IcosahedronGeometry(1.15, 1));
  const canopyMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.82,
      metalness: 0.0,
      envMapIntensity: 0.3,
    })
  );

  const count = treeCoords.length;
  const trunkInst = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
  const canopyAInst = new THREE.InstancedMesh(treeCrownGeo, canopyMat, count);
  const canopyBInst = new THREE.InstancedMesh(treeCrownGeo, canopyMat, count);
  trunkInst.castShadow = !isSoftwareGl;
  canopyAInst.castShadow = !isSoftwareGl;
  canopyAInst.receiveShadow = true;
  canopyBInst.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const cTmp = new THREE.Color();
  const foliagePalette = [0x3b5f31, 0x4b7039, 0x2f4f28, 0x57783e, 0x426634];

  for (let i = 0; i < count; i++) {
    const t = treeCoords[i];
    dummy.position.set(t.x, t.y, t.z);
    dummy.rotation.set(0, rand() * Math.PI * 2, 0);
    dummy.scale.setScalar(t.scale);
    dummy.updateMatrix();
    trunkInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(t.x, t.y + 2.05 * t.scale, t.z);
    dummy.scale.set(t.scale * 1.15, t.scale * 0.92, t.scale * 1.05);
    dummy.updateMatrix();
    canopyAInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(
      t.x + (rand() - 0.5) * 0.65 * t.scale,
      t.y + 2.65 * t.scale,
      t.z + (rand() - 0.5) * 0.65 * t.scale
    );
    dummy.scale.set(t.scale * 0.82, t.scale * 0.72, t.scale * 0.84);
    dummy.updateMatrix();
    canopyBInst.setMatrixAt(i, dummy.matrix);

    cTmp.setHex(foliagePalette[i % foliagePalette.length]);
    cTmp.offsetHSL((rand() - 0.5) * 0.02, (rand() - 0.5) * 0.06, (rand() - 0.5) * 0.05);
    canopyAInst.setColorAt(i, cTmp);
    cTmp.offsetHSL(0, 0.02, 0.05);
    canopyBInst.setColorAt(i, cTmp);
  }
  trunkInst.instanceMatrix.needsUpdate = true;
  canopyAInst.instanceMatrix.needsUpdate = true;
  canopyBInst.instanceMatrix.needsUpdate = true;
  if (canopyAInst.instanceColor) canopyAInst.instanceColor.needsUpdate = true;
  if (canopyBInst.instanceColor) canopyBInst.instanceColor.needsUpdate = true;
  trunkInst.computeBoundingSphere();
  canopyAInst.computeBoundingSphere();
  canopyBInst.computeBoundingSphere();
  landscapeGroup.add(trunkInst, canopyAInst, canopyBInst);

  // =========================================================================
  // 13. CHHATRAPATI SHIVAJI MAHARAJ MONUMENT, FOUNTAINS, FLAG PLAZA & 3D INTERIORS
  // =========================================================================
  const sharedMats = {
    travertineMat,
    darkTitaniumMat,
    satinSilverMat,
    champagneMat,
    warmTimberMat,
    gardenFoliageMat,
    archLightStripMat,
    clearCanopyGlassMat,
  };

  const updateShivaji = buildShivajiMonument(
    root,
    sharedMats,
    textures,
    trackGeo,
    trackMat,
    isSoftwareGl
  );

  const updateAmenities = buildCampusAmenities(
    root,
    sharedMats,
    textures,
    trackGeo,
    trackMat,
    isSoftwareGl,
    isMobile
  );

  const updateInteriors = buildHQInteriors(
    root,
    sharedMats,
    textures,
    trackGeo,
    trackMat
  );

  // =========================================================================
  // 14. INTERACTIVE ZONE HIT PROXIES & SUBTLE ARCHITECTURAL HIGHLIGHT RINGS
  // =========================================================================
  const hitProxies: THREE.Object3D[] = [];
  const zoneHighlights: Record<
    string,
    { ringMat: THREE.MeshBasicMaterial; haloMat: THREE.MeshBasicMaterial; ring: THREE.Mesh; currentAlpha: number }
  > = {};

  const proxyMat = trackMat(new THREE.MeshBasicMaterial({ visible: false }));

  const proxySpecs: Record<
    string,
    { pos: [number, number, number]; scale: [number, number, number] }
  > = {
    'shivaji-monument': { pos: [0, 5.2, 15.8], scale: [11.5, 10.6, 11.5] },
    'innovation-centre': { pos: [0, 14.5, 0], scale: [13.0, 24.0, 10.5] },
    'research-development': { pos: [-17.5, 6.2, 4.2], scale: [15.0, 11.5, 12.2] },
    'creative-studio': { pos: [17.5, 6.2, 4.2], scale: [15.0, 11.5, 12.2] },
    'global-collaboration': { pos: [-12.4, 11.4, 2.8], scale: [8.5, 3.6, 4.2] },
    'learning-knowledge': { pos: [0, 3.4, 5.8], scale: [14.5, 6.2, 9.5] },
    'executive-strategy': { pos: [0, 23.2, 0], scale: [11.5, 7.2, 9.2] },
    'sustainability-energy': { pos: [9.8, 3.0, 14.2], scale: [11.0, 6.5, 9.5] },
    'digital-operations': { pos: [0, 4.8, -13.2], scale: [11.8, 8.8, 6.6] },
    'indian-flag-plaza': { pos: [-20.4, 7.6, 21.6], scale: [8.6, 15.6, 8.6] },
  };

  const unitBoxGeo = trackGeo(new THREE.BoxGeometry(1, 1, 1));

  for (const zone of HQ_ZONES) {
    const spec = proxySpecs[zone.id];
    if (spec) {
      const proxy = new THREE.Mesh(unitBoxGeo, proxyMat);
      proxy.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);
      proxy.scale.set(spec.scale[0], spec.scale[1], spec.scale[2]);
      proxy.userData.zoneId = zone.id;
      root.add(proxy);
      hitProxies.push(proxy);
    }

    const ringGeo = trackGeo(
      new THREE.RingGeometry(zone.highlightRadius * 0.96, zone.highlightRadius, 56)
    );
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: _highlightHoverColor.clone(),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(
      zone.cameraTarget[0],
      Math.max(0.46, zone.anchor[1] - 1.2),
      zone.cameraTarget[2]
    );

    const haloGeo = trackGeo(
      new THREE.CylinderGeometry(
        zone.highlightRadius,
        zone.highlightRadius * 0.98,
        1.1,
        48,
        1,
        true
      )
    );
    const haloMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: _highlightHoverColor.clone(),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.y = 0.55;
    ringMesh.add(haloMesh);
    root.add(ringMesh);

    zoneHighlights[zone.id] = {
      ringMat,
      haloMat,
      ring: ringMesh,
      currentAlpha: 0,
    };
  }

  // =========================================================================
  // 15. SMOOTH ENVIRONMENT, TWILIGHT/DAYLIGHT & INTERIOR CUTAWAY UPDATER
  // =========================================================================
  const updateEnvironment = (
    nightMix: number,
    interiorMix: number,
    elapsed: number,
    dt: number,
    hoveredZoneId: string | null,
    selectedZoneId: string | null,
    holoFocusMix = 0
  ) => {
    // Sky dome gradient, horizon fog & moon visibility
    skyUniforms.uTopColor.value.lerpColors(_skyDayTop, _skyNightTop, nightMix);
    skyUniforms.uHorizonColor.value.lerpColors(
      _skyDayHorizon,
      _skyNightHorizon,
      nightMix
    );
    skyUniforms.uNightMix.value = nightMix;
    moonMat.opacity = THREE.MathUtils.lerp(0.08, 0.96, nightMix);
    moonMesh.visible = nightMix > 0.08;

    fog.color.lerpColors(_fogDay, _fogNight, nightMix);
    fog.density = THREE.MathUtils.lerp(0.0048, 0.0056, nightMix);
    if (scene.background instanceof THREE.Color) {
      scene.background.copy(fog.color);
    }

    // Lighting & plaza wet-mirror tint
    sunLight.color.lerpColors(_sunDayColor, _sunNightColor, nightMix);
    sunLight.intensity = THREE.MathUtils.lerp(2.4, 1.05, nightMix);

    hemiLight.color.lerpColors(_hemiSkyDay, _hemiSkyNight, nightMix);
    hemiLight.groundColor.lerpColors(_hemiGroundDay, _hemiGroundNight, nightMix);
    hemiLight.intensity = THREE.MathUtils.lerp(0.88, 0.56, nightMix);

    fillLight.color.lerpColors(_fillDay, _fillNight, nightMix);
    fillLight.intensity = THREE.MathUtils.lerp(0.55, 0.48, nightMix);

    plazaStoneMat.color.lerpColors(_plazaDay, _plazaNight, nightMix);
    plazaStoneMat.roughness = THREE.MathUtils.lerp(0.72, 0.22, nightMix);

    // Warm golden architectural façade illumination (signature NEXUS twilight glow!)
    const glassEmissiveBase = THREE.MathUtils.lerp(0.08, 1.12, nightMix);
    curtainGlassMat.emissiveIntensity = glassEmissiveBase * (1 - interiorMix * 0.78);
    archLightStripMat.emissiveIntensity = THREE.MathUtils.lerp(
      0.24,
      1.85,
      Math.max(nightMix, interiorMix * 0.75)
    );
    interiorCoreGlowMat.emissiveIntensity = THREE.MathUtils.lerp(0.14, 1.15, nightMix);
    lanternMat.emissiveIntensity =
      interiorCoreGlowMat.emissiveIntensity * (1 - interiorMix);

    atriumLight.intensity = THREE.MathUtils.lerp(
      0.4,
      8.5,
      Math.max(nightMix, interiorMix * 0.75)
    );
    crownGlowLight.intensity = THREE.MathUtils.lerp(
      0.3,
      7.2,
      Math.max(nightMix, interiorMix * 0.75)
    );
    const warmFillScale = THREE.MathUtils.lerp(1.0, 0.58, holoFocusMix);
    const coolTechScale = THREE.MathUtils.lerp(1.0, 1.38, holoFocusMix);
    spireInteriorLight.intensity =
      THREE.MathUtils.lerp(0.0, 9.6, interiorMix) * warmFillScale;
    westInteriorLight.intensity =
      THREE.MathUtils.lerp(0.0, 8.8, interiorMix) * coolTechScale;
    eastInteriorLight.intensity =
      THREE.MathUtils.lerp(0.0, 8.8, interiorMix) * warmFillScale;
    northInteriorLight.intensity =
      THREE.MathUtils.lerp(0.0, 10.2, interiorMix) * coolTechScale;

    // Smooth Exterior <-> Interior Cutaway Glazing Transition
    const isCutaway = interiorMix > 0.015;
    if (curtainGlassMat.transparent !== isCutaway) {
      curtainGlassMat.transparent = isCutaway;
      curtainGlassMat.needsUpdate = true;
    }
    curtainGlassMat.opacity = THREE.MathUtils.lerp(1.0, 0.09, interiorMix);
    curtainGlassMat.depthWrite = interiorMix < 0.08;

    for (const wMat of wingShellMats) {
      if (wMat.transparent !== isCutaway) {
        wMat.transparent = isCutaway;
        wMat.needsUpdate = true;
      }
      wMat.opacity = THREE.MathUtils.lerp(1.0, 0.14, interiorMix);
      wMat.depthWrite = interiorMix < 0.08;
    }

    if (northShellMat.transparent !== isCutaway) {
      northShellMat.transparent = isCutaway;
      northShellMat.needsUpdate = true;
    }
    northShellMat.opacity = THREE.MathUtils.lerp(1.0, 0.1, interiorMix);
    northShellMat.depthWrite = interiorMix < 0.08;

    if (lanternMat.transparent !== isCutaway) {
      lanternMat.transparent = isCutaway;
      lanternMat.needsUpdate = true;
    }
    lanternMat.opacity = THREE.MathUtils.lerp(1.0, 0.04, interiorMix);
    lanternMat.depthWrite = interiorMix < 0.08;
    lanternMesh.visible = interiorMix < 0.92;

    // Fade outer facade text gently when exploring inside the glass wings
    const signAlpha = THREE.MathUtils.lerp(1.0, 0.22, interiorMix);
    spireSignMat.opacity = signAlpha;
    leftSignMat.opacity = signAlpha;
    rightSignMat.opacity = signAlpha;

    // Gentle autonomous aerial shuttle glide in the upper sky
    for (const sh of shuttles) {
      const a = elapsed * sh.speed + sh.phase;
      const nx = sh.centerX + Math.cos(a) * sh.radiusX;
      const nz = sh.centerZ + Math.sin(a) * sh.radiusZ;
      const ny = sh.altitude + Math.sin(elapsed * 0.9 + sh.phase) * 0.35;
      sh.group.position.set(nx, ny, nz);
      sh.group.rotation.y = -a + (sh.speed > 0 ? 0 : Math.PI);
    }

    // Subtle water shimmer drift
    waterMat.color.lerpColors(_waterDay, _waterNight, nightMix);
    textures.waterNormalMap.offset.set(elapsed * 0.012, elapsed * 0.009);

    // Animate Chhatrapati Shivaji Maharaj Monument, Indian Flag, Fountains, Sculptures & 3D Interiors
    updateShivaji(elapsed, nightMix);
    updateAmenities(elapsed, nightMix);
    updateInteriors(elapsed, nightMix, interiorMix, holoFocusMix);

    // Smooth zone hover/selection highlight rings
    for (const zone of HQ_ZONES) {
      const hl = zoneHighlights[zone.id];
      if (!hl) continue;
      const isSelected = zone.id === selectedZoneId;
      const isHovered = zone.id === hoveredZoneId;
      const targetAlpha = isSelected ? 0.52 : isHovered ? 0.28 : 0.0;
      hl.currentAlpha = THREE.MathUtils.damp(hl.currentAlpha, targetAlpha, 7.5, dt);

      const targetColor = isSelected ? _highlightSelectColor : _highlightHoverColor;
      hl.ringMat.color.lerp(targetColor, Math.min(1, dt * 8));
      hl.haloMat.color.lerp(targetColor, Math.min(1, dt * 8));

      hl.ringMat.opacity = hl.currentAlpha;
      hl.haloMat.opacity = hl.currentAlpha * 0.16;
      hl.ring.visible = hl.currentAlpha > 0.01;
      if (hl.ring.visible) {
        hl.ring.rotation.y = elapsed * 0.18;
      }
    }
  };

  return {
    root,
    hitProxies,
    updateEnvironment,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.dispose();
    },
  };
}
