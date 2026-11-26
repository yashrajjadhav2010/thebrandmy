import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Pre-allocated math helpers outside render loop (Zero GC per frame)
const _mouse = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();
const _dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const _intersectPt = new THREE.Vector3();
const _vDir = new THREE.Vector3();
const _vUp = new THREE.Vector3(0, -1, 0);
const _quat = new THREE.Quaternion();
const _ropeCurvePts = [
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
];

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

/**
 * Procedural organic citrus peel textures (albedo + dimpled bump map)
 */
function createLemonTextures(maxAnisotropy: number) {
  const size = 512;

  // Albedo canvas
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d');

  // Bump canvas (oil gland dimples)
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');

  if (cCtx && bCtx) {
    // Rich, saturated sun-ripe lemon yellow with warm golden shading & subtle green polar tips
    const grad = cCtx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0.0, '#999c0a');
    grad.addColorStop(0.12, '#e6b800');
    grad.addColorStop(0.48, '#ffd000');
    grad.addColorStop(0.84, '#e5aa00');
    grad.addColorStop(1.0, '#a67b00');
    cCtx.fillStyle = grad;
    cCtx.fillRect(0, 0, size, size);

    bCtx.fillStyle = '#909090';
    bCtx.fillRect(0, 0, size, size);

    // Deterministic organic citrus oil-gland pores
    let seed = 4219;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let i = 0; i < 4200; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const r = 1.1 + rand() * 2.1;

      // Vivid warm citrus pore contrast on albedo
      cCtx.fillStyle =
        rand() > 0.45
          ? 'rgba(176, 112, 0, 0.24)'
          : 'rgba(255, 224, 30, 0.22)';
      cCtx.beginPath();
      cCtx.arc(x, y, r, 0, Math.PI * 2);
      cCtx.fill();

      // Pitted dimple on bump map (dark center, lighter rim)
      const pGrad = bCtx.createRadialGradient(x, y, 0, x, y, r * 1.4);
      pGrad.addColorStop(0, 'rgba(35, 35, 35, 0.85)');
      pGrad.addColorStop(0.65, 'rgba(130, 130, 130, 0.45)');
      pGrad.addColorStop(1, 'rgba(200, 200, 200, 0)');
      bCtx.fillStyle = pGrad;
      bCtx.beginPath();
      bCtx.arc(x, y, r * 1.4, 0, Math.PI * 2);
      bCtx.fill();
    }
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.ClampToEdgeWrapping;
  map.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.ClampToEdgeWrapping;
  bumpMap.anisotropy = maxAnisotropy;

  return { map, bumpMap };
}

/**
 * Procedural waxy green chili albedo + subtle longitudinal skin variation
 */
function createChiliTexture(
  baseHex: string,
  highlightHex: string,
  tipHex: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const w = 256;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, tipHex);
    grad.addColorStop(0.28, baseHex);
    grad.addColorStop(0.62, highlightHex);
    grad.addColorStop(0.88, baseHex);
    grad.addColorStop(1, '#09380b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle organic botanical streaks along length of pepper
    for (let i = 0; i < 42; i++) {
      const y = (i / 42) * h;
      ctx.fillStyle =
        i % 2 === 0
          ? 'rgba(90, 220, 45, 0.08)'
          : 'rgba(4, 34, 6, 0.12)';
      ctx.fillRect(0, y, w, 3);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

/**
 * Procedural twisted black braided cotton thread texture
 */
function createBraidedThreadTextures(maxAnisotropy: number) {
  const size = 256;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');

  if (cCtx && bCtx) {
    cCtx.fillStyle = '#181a20';
    cCtx.fillRect(0, 0, size, size);
    bCtx.fillStyle = '#404040';
    bCtx.fillRect(0, 0, size, size);

    // Diagonal twisted braided yarn strands
    for (let i = -size; i < size * 2; i += 14) {
      cCtx.strokeStyle = '#2d313d';
      cCtx.lineWidth = 5;
      cCtx.beginPath();
      cCtx.moveTo(i, 0);
      cCtx.lineTo(i + size, size);
      cCtx.stroke();

      cCtx.strokeStyle = '#0d0e12';
      cCtx.lineWidth = 2;
      cCtx.beginPath();
      cCtx.moveTo(i + 5, 0);
      cCtx.lineTo(i + size + 5, size);
      cCtx.stroke();

      bCtx.strokeStyle = '#dcdcdc';
      bCtx.lineWidth = 5;
      bCtx.beginPath();
      bCtx.moveTo(i, 0);
      bCtx.lineTo(i + size, size);
      bCtx.stroke();
    }
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 16);
  map.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 16);
  bumpMap.anisotropy = maxAnisotropy;

  return { map, bumpMap };
}

/**
 * Builds an organically sculpted 3D green chili (body + calyx crown + curved woody stem)
 */
function buildOrganicChili(
  length: number,
  maxRadius: number,
  curveBend: number,
  bodyMat: THREE.Material,
  calyxMat: THREE.Material,
  stemMat: THREE.Material,
  disposables: { geometries: THREE.BufferGeometry[] }
): THREE.Group {
  const group = new THREE.Group();

  // 1. Sculpted Organic Tapered Curved Body (custom swept geometry along curve)
  const rings = 34;
  const radialSegs = 22;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Spine goes from x = -length*0.58 (pointed tip) to x = +length*0.42 (calyx shoulder)
  const xStart = -length * 0.58;
  const xEnd = length * 0.42;

  for (let i = 0; i <= rings; i++) {
    const t = i / rings; // 0 = pointed tip, 1 = shoulder base
    const x = THREE.MathUtils.lerp(xStart, xEnd, t);
    // Natural slight upward hook at the tip + gentle organic belly dip
    const centerY =
      Math.pow(1 - t, 2.2) * curveBend - Math.sin(t * Math.PI) * curveBend * 0.28;
    const centerZ = Math.sin(t * Math.PI * 1.1) * curveBend * 0.04;

    // Authentic chili cross-section radius profile
    let r: number;
    if (t < 0.06) {
      r = maxRadius * (0.04 + (t / 0.06) * 0.18);
    } else if (t < 0.78) {
      const u = (t - 0.06) / 0.72;
      r = maxRadius * (0.22 + Math.pow(u, 0.72) * 0.78);
    } else {
      // Rounded plump shoulder tapering neatly into the calyx
      const u = (t - 0.78) / 0.22;
      r = maxRadius * Math.cos(u * Math.PI * 0.44);
    }

    for (let j = 0; j <= radialSegs; j++) {
      const v = j / radialSegs;
      const theta = v * Math.PI * 2;
      // Subtle organic 3-lobe pepper undulation
      const lobe = 1 + 0.045 * Math.sin(theta * 3 + t * 1.4) * Math.sin(t * Math.PI);
      const localR = r * lobe;

      const py = centerY + Math.sin(theta) * localR * 0.94;
      const pz = centerZ + Math.cos(theta) * localR;

      positions.push(x, py, pz);
      uvs.push(t, v);
    }
  }

  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * (radialSegs + 1) + j;
      const b = a + radialSegs + 1;
      const c = b + 1;
      const d = a + 1;
      indices.push(a, d, b);
      indices.push(b, d, c);
    }
  }

  const bodyGeo = new THREE.BufferGeometry();
  bodyGeo.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );
  bodyGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  bodyGeo.setIndex(indices);
  bodyGeo.computeVertexNormals();
  disposables.geometries.push(bodyGeo);

  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // 2. Flared Matte Calyx Crown (5 overlapping sepals gripping the shoulder)
  const calyxGroup = new THREE.Group();
  calyxGroup.position.set(xEnd - maxRadius * 0.14, 0, 0);

  const cupPts = [
    new THREE.Vector2(maxRadius * 0.16, 0.12),
    new THREE.Vector2(maxRadius * 0.52, 0.06),
    new THREE.Vector2(maxRadius * 0.9, -0.08),
    new THREE.Vector2(maxRadius * 0.72, -0.14),
    new THREE.Vector2(0.01, -0.05),
  ];
  const calyxCupGeo = new THREE.LatheGeometry(cupPts, 16);
  calyxCupGeo.rotateZ(-Math.PI / 2);
  disposables.geometries.push(calyxCupGeo);
  const calyxCup = new THREE.Mesh(calyxCupGeo, calyxMat);
  calyxGroup.add(calyxCup);

  const sepalGeo = new THREE.ConeGeometry(maxRadius * 0.24, maxRadius * 0.65, 5);
  sepalGeo.rotateZ(Math.PI / 2.25);
  disposables.geometries.push(sepalGeo);

  for (let s = 0; s < 5; s++) {
    const a = (s / 5) * Math.PI * 2;
    const sepal = new THREE.Mesh(sepalGeo, calyxMat);
    sepal.position.set(
      -maxRadius * 0.16,
      Math.sin(a) * maxRadius * 0.68,
      Math.cos(a) * maxRadius * 0.68
    );
    sepal.rotation.x = -a;
    calyxGroup.add(sepal);
  }
  group.add(calyxGroup);

  // 3. Curved Woody Stem extending cleanly past calyx
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(xEnd - 0.02, 0, 0),
    new THREE.Vector3(xEnd + length * 0.12, -0.03, 0.02),
    new THREE.Vector3(xEnd + length * 0.24, -0.08, -0.02),
    new THREE.Vector3(xEnd + length * 0.32, -0.04, 0.01),
  ]);
  const stemGeo = new THREE.TubeGeometry(stemCurve, 14, maxRadius * 0.13, 8, false);
  disposables.geometries.push(stemGeo);
  const stemMesh = new THREE.Mesh(stemGeo, stemMat);
  group.add(stemMesh);

  // Small woody end cap bulge
  const stemTipGeo = new THREE.SphereGeometry(maxRadius * 0.16, 8, 8);
  disposables.geometries.push(stemTipGeo);
  const stemTip = new THREE.Mesh(stemTipGeo, stemMat);
  stemTip.position.set(xEnd + length * 0.32, -0.04, 0.01);
  group.add(stemTip);

  return group;
}

/**
 * Builds an authentic multi-part plump lemon (LatheGeometry with subtle citrus poles)
 */
function buildOrganicLemon(
  lemonMat: THREE.Material,
  disposables: { geometries: THREE.BufferGeometry[] }
): THREE.Mesh {
  const pts: THREE.Vector2[] = [];
  const segs = 36;
  const rx = 0.64;
  const ry = 0.78;

  for (let i = 0; i <= segs; i++) {
    const t = i / segs; // 0 = bottom pole, 1 = top pole
    const angle = t * Math.PI;
    // Slight citrus pole pinch / nipple at top and bottom
    const polePinch =
      Math.exp(-Math.pow((t - 0.06) * 10, 2)) * 0.045 +
      Math.exp(-Math.pow((t - 0.94) * 10, 2)) * 0.04;
    const radius = Math.max(0.004, Math.sin(angle) * rx - polePinch * 0.25);
    let y = -Math.cos(angle) * ry;
    // Slight organic elongation at poles
    if (t < 0.08) y -= (0.08 - t) * 0.55;
    if (t > 0.92) y += (t - 0.92) * 0.45;
    pts.push(new THREE.Vector2(radius, y));
  }

  const lemonGeo = new THREE.LatheGeometry(pts, 44);
  lemonGeo.computeVertexNormals();
  disposables.geometries.push(lemonGeo);

  const lemonMesh = new THREE.Mesh(lemonGeo, lemonMat);
  lemonMesh.castShadow = true;
  lemonMesh.receiveShadow = true;
  return lemonMesh;
}

/**
 * Builds a realistic coiled braided thread knot
 */
function buildThreadKnot(
  scale: number,
  threadMat: THREE.Material,
  disposables: { geometries: THREE.BufferGeometry[] }
): THREE.Group {
  const knotGroup = new THREE.Group();
  const torusGeo = new THREE.TorusGeometry(0.11 * scale, 0.042 * scale, 10, 20);
  disposables.geometries.push(torusGeo);

  const loopA = new THREE.Mesh(torusGeo, threadMat);
  loopA.rotation.set(0.7, 0.3, 0.2);

  const loopB = new THREE.Mesh(torusGeo, threadMat);
  loopB.rotation.set(-0.6, 1.1, 0.6);
  loopB.position.set(0.02 * scale, -0.03 * scale, 0.01 * scale);

  const loopC = new THREE.Mesh(torusGeo, threadMat);
  loopC.rotation.set(1.2, -0.5, 0.9);
  loopC.position.set(-0.02 * scale, 0.02 * scale, -0.01 * scale);

  knotGroup.add(loopA, loopB, loopC);
  return knotGroup;
}

export function NimbuMirchi3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const impulseRef = useRef<((vx: number, vz: number, spin: number) => void) | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let renderer: THREE.WebGLRenderer;
    const isSoftwareGl = detectSoftwareWebGL();

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const width = container.clientWidth || 420;
    const height = container.clientHeight || 460;

    renderer.setSize(width, height);
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.96;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);

    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Procedural Studio Environment Map (restrained intensity so rich botanical colors never bleach out)
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 40);
    camera.position.set(0, 0.05, 8.4);
    camera.lookAt(0, 0.05, 0);

    // Sculpted High-Contrast Studio Lighting Rig (keeps yellows vivid & greens lush)
    const hemiLight = new THREE.HemisphereLight(0xdbe8ff, 0x0e1018, 0.36);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e0, 1.85);
    keyLight.position.set(3.8, 5.2, 6.2);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x9cbcff, 0.3);
    fillLight.position.set(-4.5, 1.2, 3.8);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffffff, 4.4, 18, 1.7);
    rimLight.position.set(-2.5, 3.2, -3.5);
    scene.add(rimLight);

    const disposables: {
      geometries: THREE.BufferGeometry[];
      materials: THREE.Material[];
      textures: THREE.Texture[];
    } = { geometries: [], materials: [], textures: [] };

    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    // Rich, Vivid, Saturated Organic Botanical PBR Textures
    const lemonTex = createLemonTextures(maxAniso);
    const threadTex = createBraidedThreadTextures(maxAniso);
    const chiliTex1 = createChiliTexture('#1c9918', '#42c422', '#0d570c', maxAniso);
    const chiliTex2 = createChiliTexture('#0a7e12', '#1fa61c', '#064709', maxAniso);
    const chiliTex3 = createChiliTexture('#229c19', '#49c724', '#0f5e0c', maxAniso);
    const chiliTex4 = createChiliTexture('#127a15', '#2ca620', '#08450a', maxAniso);

    disposables.textures.push(
      lemonTex.map,
      lemonTex.bumpMap,
      threadTex.map,
      threadTex.bumpMap,
      chiliTex1,
      chiliTex2,
      chiliTex3,
      chiliTex4
    );

    // PBR Materials with controlled envMapIntensity so pigments stay vibrant and juicy
    const threadMat = new THREE.MeshStandardMaterial({
      map: threadTex.map,
      bumpMap: threadTex.bumpMap,
      bumpScale: 0.04,
      color: 0x22252e,
      roughness: 0.92,
      metalness: 0.02,
      envMapIntensity: 0.25,
    });

    const calyxMat = new THREE.MeshStandardMaterial({
      color: 0x245616,
      roughness: 0.72,
      metalness: 0.02,
      envMapIntensity: 0.22,
    });

    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x2d611b,
      roughness: 0.76,
      metalness: 0.02,
      envMapIntensity: 0.22,
    });

    const chiliMats = [chiliTex1, chiliTex2, chiliTex3, chiliTex4].map(
      (tex) =>
        new THREE.MeshPhysicalMaterial({
          map: tex,
          roughness: 0.26,
          metalness: 0.0,
          clearcoat: 0.65,
          clearcoatRoughness: 0.18,
          envMapIntensity: 0.28,
        })
    );

    const lemonMat = new THREE.MeshPhysicalMaterial({
      map: lemonTex.map,
      bumpMap: lemonTex.bumpMap,
      bumpScale: 0.032,
      roughness: 0.42,
      metalness: 0.0,
      clearcoat: 0.22,
      clearcoatRoughness: 0.45,
      envMapIntensity: 0.2,
    });

    disposables.materials.push(threadMat, calyxMat, stemMat, lemonMat, ...chiliMats);

    // =========================================================================
    // COUPLED PENDULUM CHAIN HIERARCHY (Authentic Reference Proportions)
    // Anchor at top edge (y = +2.85) dropping cleanly through 4 chilies -> lemon -> bottom knot
    // =========================================================================
    const ANCHOR_Y = 2.85;

    // 7 Chain Physics Nodes:
    // 0: Ceiling Anchor (pinned)
    // 1: Top Knot + Chili 1 (Top long chili)
    // 2: Chili 2 (Plump vibrant green chili)
    // 3: Chili 3 (Medium tilted chili)
    // 4: Chili 4 (Foreshortened front-pointing chili above lemon)
    // 5: Lemon Center (Heavy bob)
    // 6: Bottom Knot & Frayed Tail
    const restLengths = [1.38, 0.56, 0.5, 0.42, 0.92, 1.12];
    const nodeMasses = [0, 1.0, 1.05, 0.95, 0.9, 2.2, 0.4];

    interface ChainNode {
      pos: THREE.Vector3;
      prev: THREE.Vector3;
      restY: number;
    }

    const chain: ChainNode[] = [];
    let accY = ANCHOR_Y;
    for (let i = 0; i <= restLengths.length; i++) {
      if (i > 0) accY -= restLengths[i - 1];
      chain.push({
        pos: new THREE.Vector3(0, accY, 0),
        prev: new THREE.Vector3(0, accY, 0),
        restY: accY,
      });
    }

    // Dynamic Rope Mesh (smooth cylindrical tube updated along chain points)
    const ropeSegments = 28;
    const ropeRadial = 8;
    const ropeRadius = 0.036;
    const ropeGeo = new THREE.CylinderGeometry(
      ropeRadius,
      ropeRadius,
      1,
      ropeRadial,
      ropeSegments,
      false
    );
    disposables.geometries.push(ropeGeo);
    const ropeMesh = new THREE.Mesh(ropeGeo, threadMat);
    ropeMesh.frustumCulled = false;
    scene.add(ropeMesh);

    // Helper to update rope geometry vertices in-place along CatmullRomCurve3 (no geometry rebuild!)
    const ropeCurve = new THREE.CatmullRomCurve3(_ropeCurvePts);
    const _pt = new THREE.Vector3();
    const _tan = new THREE.Vector3();
    const _norm = new THREE.Vector3();
    const _binorm = new THREE.Vector3();
    const _refAxis = new THREE.Vector3(0, 0, 1);

    const updateRopeGeometry = () => {
      for (let i = 0; i < chain.length; i++) {
        _ropeCurvePts[i].copy(chain[i].pos);
      }
      const posAttr = ropeGeo.attributes.position;
      const radialStride = ropeRadial + 1;

      for (let i = 0; i <= ropeSegments; i++) {
        const t = i / ropeSegments;
        ropeCurve.getPoint(t, _pt);
        ropeCurve.getTangent(t, _tan).normalize();

        _norm.crossVectors(_tan, _refAxis);
        if (_norm.lengthSq() < 0.0001) {
          _norm.set(1, 0, 0);
        } else {
          _norm.normalize();
        }
        _binorm.crossVectors(_tan, _norm).normalize();

        // Slightly taper the frayed tail at very bottom
        const r = t > 0.94 ? ropeRadius * (1 - (t - 0.94) * 9) : ropeRadius;

        for (let j = 0; j <= ropeRadial; j++) {
          const theta = (j / ropeRadial) * Math.PI * 2;
          const cos = Math.cos(theta) * r;
          const sin = Math.sin(theta) * r;
          const idx = i * radialStride + j;
          posAttr.setXYZ(
            idx,
            _pt.x + _norm.x * cos + _binorm.x * sin,
            _pt.y + _norm.y * cos + _binorm.y * sin,
            _pt.z + _norm.z * cos + _binorm.z * sin
          );
        }
      }
      posAttr.needsUpdate = true;
      ropeGeo.computeVertexNormals();
    };

    // Assemble Top Knot
    const topKnot = buildThreadKnot(1.05, threadMat, disposables);
    scene.add(topKnot);

    // Assemble 4 Distinctive Plump Organic Chilies matching the Reference Silhouette
    const chiliSpecs = [
      { length: 2.12, radius: 0.27, bend: 0.18, baseYaw: 0.04, baseRoll: -0.07, basePitch: 0.04, offsetX: -0.04 },
      { length: 2.02, radius: 0.3, bend: 0.15, baseYaw: -0.1, baseRoll: -0.04, basePitch: -0.04, offsetX: 0.03 },
      { length: 1.54, radius: 0.26, bend: 0.13, baseYaw: 0.24, baseRoll: 0.01, basePitch: 0.08, offsetX: -0.02 },
      { length: 1.28, radius: 0.25, bend: 0.11, baseYaw: 1.38, baseRoll: 0.1, basePitch: 0.16, offsetX: -0.02 },
    ];

    const chiliAnchors: THREE.Group[] = chiliSpecs.map((spec, idx) => {
      const holder = new THREE.Group();
      const chili = buildOrganicChili(
        spec.length,
        spec.radius,
        spec.bend,
        chiliMats[idx],
        calyxMat,
        stemMat,
        disposables
      );
      chili.position.x = spec.offsetX;
      chili.rotation.set(spec.basePitch, spec.baseYaw, spec.baseRoll);
      holder.add(chili);
      scene.add(holder);
      return holder;
    });

    // Assemble Plump Dimpled Yellow Lemon with Bottom Knot permanently locked to its base pole
    const lemonHolder = new THREE.Group();
    const lemonMesh = buildOrganicLemon(lemonMat, disposables);
    lemonHolder.add(lemonMesh);

    const bottomKnot = buildThreadKnot(0.95, threadMat, disposables);
    bottomKnot.position.set(0, -0.82, 0);
    lemonHolder.add(bottomKnot);
    scene.add(lemonHolder);

    // Generous Invisible Collision Proxy for Effortless Grabbing & Hover Detection
    const hitProxyGeo = new THREE.CylinderGeometry(1.15, 0.95, 4.4, 12);
    const hitProxyMat = new THREE.MeshBasicMaterial({ visible: false });
    disposables.geometries.push(hitProxyGeo);
    disposables.materials.push(hitProxyMat);
    const hitProxy = new THREE.Mesh(hitProxyGeo, hitProxyMat);
    hitProxy.position.set(0, -0.55, 0);
    scene.add(hitProxy);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // =========================================================================
    // INTERACTIVE PHYSICS STATE (Drag, Flick, Twist Spin, Hover Breeze)
    // =========================================================================
    let dragging = false;
    let activePointerId: number | null = null;
    let grabbedNodeIndex = 5; // Default lemon bob
    const dragTarget = new THREE.Vector3();
    const lastDragWorld = new THREE.Vector3();
    const pointerVelocity = new THREE.Vector3();
    let lastPointerTime = performance.now();

    let twistAngle = 0;
    let twistVelocity = prefersReducedMotion ? 0 : 0.45;
    let lastHoverX = 0;
    let wasHoveringMesh = false;

    const applyImpulse = (vx: number, vz: number, spin: number) => {
      for (let i = 1; i < chain.length; i++) {
        const weight = i / (chain.length - 1);
        chain[i].prev.x -= vx * weight * 0.085;
        chain[i].prev.z -= vz * weight * 0.065;
      }
      twistVelocity = THREE.MathUtils.clamp(twistVelocity + spin, -7, 7);
    };
    impulseRef.current = applyImpulse;

    // Give a gentle welcoming sway on mount (unless reduced motion)
    if (!prefersReducedMotion) {
      applyImpulse(0.95, 0.25, 0.6);
    }

    const updateMouseNDC = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e: PointerEvent) => {
      updateMouseNDC(e.clientX, e.clientY);
      _raycaster.setFromCamera(_mouse, camera);
      const hits = _raycaster.intersectObject(hitProxy, false);

      if (hits.length > 0) {
        dragging = true;
        activePointerId = e.pointerId;
        setIsDragging(true);
        renderer.domElement.setPointerCapture(e.pointerId);

        const hitPoint = hits[0].point;
        // Pick closest movable chain node (between Chili 1 and Lemon)
        let bestIdx = 5;
        let bestDist = Infinity;
        for (let i = 1; i <= 5; i++) {
          const d = Math.abs(chain[i].pos.y - hitPoint.y);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = i;
          }
        }
        grabbedNodeIndex = bestIdx;

        _dragPlane.constant = -chain[grabbedNodeIndex].pos.z;
        _raycaster.ray.intersectPlane(_dragPlane, dragTarget);
        lastDragWorld.copy(dragTarget);
        pointerVelocity.set(0, 0, 0);
        lastPointerTime = performance.now();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      updateMouseNDC(e.clientX, e.clientY);
      _raycaster.setFromCamera(_mouse, camera);

      if (dragging && e.pointerId === activePointerId) {
        if (_raycaster.ray.intersectPlane(_dragPlane, _intersectPt)) {
          const now = performance.now();
          const dt = Math.max((now - lastPointerTime) / 1000, 0.008);
          pointerVelocity
            .subVectors(_intersectPt, lastDragWorld)
            .divideScalar(dt)
            .clampLength(0, 18);

          // Clamp max drag stretch cleanly so it swings freely across the full footer stage
          dragTarget.copy(_intersectPt);
          dragTarget.x = THREE.MathUtils.clamp(dragTarget.x, -4.4, 4.4);
          dragTarget.y = THREE.MathUtils.clamp(dragTarget.y, -2.2, 2.2);

          // Gentle rotational twist coupled to horizontal drag
          twistVelocity += pointerVelocity.x * 0.012;

          lastDragWorld.copy(_intersectPt);
          lastPointerTime = now;
        }
        return;
      }

      // Hover detection + subtle playful brush breeze when swiping across it
      const hits = _raycaster.intersectObject(hitProxy, false);
      const hovering = hits.length > 0;
      if (hovering !== wasHoveringMesh) {
        wasHoveringMesh = hovering;
        setIsHovered(hovering);
        lastHoverX = e.clientX;
      } else if (hovering) {
        const dx = e.clientX - lastHoverX;
        lastHoverX = e.clientX;
        if (Math.abs(dx) > 3) {
          const nudge = THREE.MathUtils.clamp(dx * 0.025, -0.85, 0.85);
          applyImpulse(nudge, -Math.abs(nudge) * 0.2, nudge * 0.35);
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== activePointerId) return;
      dragging = false;
      activePointerId = null;
      setIsDragging(false);
      if (renderer.domElement.hasPointerCapture(e.pointerId)) {
        renderer.domElement.releasePointerCapture(e.pointerId);
      }

      // If it was a crisp tap/click with minimal movement, give a fun playful poke!
      if (pointerVelocity.length() < 0.7) {
        const dir = dragTarget.x >= 0 ? -1 : 1;
        applyImpulse(dir * 2.1, 0.55, dir * 2.2);
      } else {
        applyImpulse(
          pointerVelocity.x * 0.32,
          -Math.abs(pointerVelocity.x) * 0.08,
          pointerVelocity.x * 0.24
        );
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Pause animation when scrolled away from footer
    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.02 }
    );
    observer.observe(container);

    const onResize = () => {
      if (!container) return;
      const nw = container.clientWidth || 420;
      const nh = container.clientHeight || 460;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      renderer.render(scene, camera);
    };
    window.addEventListener('resize', onResize, { passive: true });

    // Physics Integration & Scene Placement
    const stepPhysics = (dt: number, elapsed: number) => {
      const subSteps = 4;
      const subDt = Math.min(dt, 0.033) / subSteps;
      const gravity = -18.5;
      const damping = 0.992;

      for (let step = 0; step < subSteps; step++) {
        // Verlet integration on movable nodes
        for (let i = 1; i < chain.length; i++) {
          const node = chain[i];
          const vx = (node.pos.x - node.prev.x) * damping;
          const vy = (node.pos.y - node.prev.y) * damping;
          const vz = (node.pos.z - node.prev.z) * damping;

          node.prev.copy(node.pos);

          // Whisper-quiet ambient air draft when idle
          const breeze =
            !dragging && !prefersReducedMotion
              ? Math.sin(elapsed * 1.15 + i * 0.45) * 0.24
              : 0;

          node.pos.x += vx + breeze * subDt * subDt;
          node.pos.y += vy + gravity * subDt * subDt;
          node.pos.z += vz + Math.cos(elapsed * 0.85 + i) * 0.1 * subDt * subDt;
        }

        // Apply active pointer drag pull cleanly
        if (dragging) {
          const grabbed = chain[grabbedNodeIndex];
          grabbed.pos.lerp(dragTarget, 0.45);
          grabbed.prev.lerp(dragTarget, 0.35);
        }

        // Distance constraints along the thread (5 solver iterations for crisp tautness)
        for (let iter = 0; iter < 5; iter++) {
          chain[0].pos.set(0, ANCHOR_Y, 0);

          for (let i = 0; i < restLengths.length; i++) {
            const a = chain[i];
            const b = chain[i + 1];
            const targetLen = restLengths[i];

            _vDir.subVectors(b.pos, a.pos);
            const dist = _vDir.length() || 0.0001;
            const diff = (dist - targetLen) / dist;

            if (i === 0) {
              b.pos.addScaledVector(_vDir, -diff);
            } else {
              const invA = 1 / nodeMasses[i];
              const invB = 1 / nodeMasses[i + 1];
              const sum = invA + invB;
              a.pos.addScaledVector(_vDir, diff * (invA / sum));
              b.pos.addScaledVector(_vDir, -diff * (invB / sum));
            }
          }
        }
      }

      // Torsional rotational twist spring around vertical axis
      const twistSpring = -2.6 * twistAngle - 1.35 * twistVelocity;
      twistVelocity += twistSpring * Math.min(dt, 0.033);
      twistAngle += twistVelocity * Math.min(dt, 0.033);

      // Keep bottom tail node cleanly trailing below the lemon axis (never flips above lemon)
      _vDir.subVectors(chain[5].pos, chain[4].pos).normalize();
      chain[6].pos.lerp(
        _pt.copy(chain[5].pos).addScaledVector(_vDir, restLengths[5]),
        0.55
      );

      // Update Rope & All Attached 3D Props
      updateRopeGeometry();

      // Top Knot locked accurately along rope tangent just above Chili 1
      _vDir.subVectors(chain[0].pos, chain[1].pos).normalize();
      topKnot.position.copy(chain[1].pos).addScaledVector(_vDir, 0.28);
      topKnot.rotation.y = twistAngle * 0.5;

      // Orient each chili cleanly perpendicular to its local thread tangent + torsional spin
      for (let c = 0; c < chiliAnchors.length; c++) {
        const nodeIdx = c + 1;
        const holder = chiliAnchors[c];
        holder.position.copy(chain[nodeIdx].pos);

        _vDir.subVectors(chain[nodeIdx + 1].pos, chain[nodeIdx - 1].pos).normalize();
        _quat.setFromUnitVectors(_vUp, _vDir);
        holder.quaternion.copy(_quat);
        holder.rotateY(twistAngle * (0.65 + c * 0.14));
      }

      // Lemon Bob (with permanently anchored Bottom Knot) aligned to lower rope tangent
      lemonHolder.position.copy(chain[5].pos);
      _vDir.subVectors(chain[5].pos, chain[4].pos).normalize();
      _quat.setFromUnitVectors(_vUp, _vDir);
      lemonHolder.quaternion.copy(_quat);
      lemonHolder.rotateY(twistAngle * 1.15);

      // Keep collision proxy synced with the moving chain center
      hitProxy.position.set(
        (chain[2].pos.x + chain[5].pos.x) * 0.5,
        (chain[1].pos.y + chain[5].pos.y) * 0.5,
        (chain[2].pos.z + chain[5].pos.z) * 0.5
      );
    };

    // Initial render frame
    stepPhysics(0.016, 0);
    renderer.render(scene, camera);

    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    const afterDraw = (cb: () => void) => {
      if (disposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 8);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 8);
    };

    const tick = () => {
      if (disposed) return;

      if (!isVisible && !dragging) {
        frameId = window.setTimeout(tick, 220);
        return;
      }

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      stepPhysics(delta, elapsed);
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      impulseRef.current = null;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      observer.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('resize', onResize);

      disposables.geometries.forEach((g) => g.dispose());
      disposables.materials.forEach((m) => m.dispose());
      disposables.textures.forEach((t) => t.dispose());
      envTexture.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleKeyboardSwing = () => {
    impulseRef.current?.(2.6, 0.5, 2.4);
  };

  if (webglFailed) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-xs text-[#969EAE]">
          3D Nimbu Mirchi requires WebGL support.
        </p>
      </div>
    );
  }

  return (
    <div
      role="application"
      tabIndex={0}
      aria-label="Interactive 3D Nimbu Mirchi hanging charm — drag, flick, or press Enter to swing"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleKeyboardSwing();
        }
      }}
      className={`relative h-full w-full select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F7DF3] ${
        isDragging
          ? 'cursor-grabbing'
          : isHovered
            ? 'cursor-grab'
            : 'cursor-default'
      }`}
    >
      <div ref={mountRef} className="h-full w-full" />
    </div>
  );
}
