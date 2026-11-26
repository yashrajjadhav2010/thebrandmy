import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Pre-allocated math helpers outside render loop (Zero GC per frame)
const _axisX = new THREE.Vector3(1, 0, 0);
const _axisZ = new THREE.Vector3(0, 0, 1);
const _orbitPos = new THREE.Vector3();
const _midCtrl = new THREE.Vector3();
const _curvePt = new THREE.Vector3();

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

function createGlowParticleTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    grad.addColorStop(0, 'rgba(245, 247, 250, 1)');
    grad.addColorStop(0.24, 'rgba(196, 218, 255, 0.88)');
    grad.addColorStop(0.6, 'rgba(79, 125, 243, 0.24)');
    grad.addColorStop(1, 'rgba(5, 6, 8, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createMachinedRingTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const width = 512;
  const height = 64;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#141925';
    ctx.fillRect(0, 0, width, height);

    // Fine brushed metal grain streaks
    ctx.fillStyle = 'rgba(230, 238, 255, 0.04)';
    for (let y = 0; y < height; y += 2) {
      ctx.fillRect(0, y, width, 1);
    }

    // Precision astronomical degree graduation marks
    for (let i = 0; i < 96; i++) {
      const x = (i / 96) * width;
      const major = i % 12 === 0;
      const mid = i % 4 === 0;
      ctx.fillStyle = major
        ? 'rgba(235, 242, 255, 0.7)'
        : mid
          ? 'rgba(160, 184, 224, 0.34)'
          : 'rgba(150, 158, 174, 0.16)';
      const h = major ? 50 : mid ? 30 : 16;
      ctx.fillRect(x, (height - h) / 2, major ? 2 : 1, h);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(3, 1);
  texture.anisotropy = maxAnisotropy;
  return texture;
}

export function HeroVisual() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

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
      setWebglUnavailable(true);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.setSize(width, height);
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x050608, 0);

    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050608, 0.042);

    // Procedural Studio Environment Map for metallic & optical surfaces
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    const baseCameraPos = new THREE.Vector3();
    const baseLookAt = new THREE.Vector3();

    const updateCameraLayout = (w: number, h: number) => {
      camera.aspect = w / h;
      if (w >= 1024) {
        // Monumental asymmetric balance: sculptural astrolabe framed to the right
        baseCameraPos.set(-1.55, 0.25, 8.1);
        baseLookAt.set(-1.1, 0.0, 0);
      } else if (w >= 640) {
        baseCameraPos.set(-0.6, 0.4, 9.2);
        baseLookAt.set(-0.2, -0.35, 0);
      } else {
        // On compact phones, elevate sculpture cleanly into upper horizon band
        baseCameraPos.set(0, -0.9, 9.6);
        baseLookAt.set(0, -1.25, 0);
      }
      camera.position.copy(baseCameraPos);
      camera.lookAt(baseLookAt);
      camera.updateProjectionMatrix();
    };
    updateCameraLayout(width, height);

    // Balanced Studio 3-Point Warm/Cool Rig + Cosmic Optical Rim Lights
    const hemiLight = new THREE.HemisphereLight(0xc2d6ff, 0x090c14, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff6ea, 2.5);
    keyLight.position.set(6.5, 7.5, 6.5);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const cosmicRimLight = new THREE.PointLight(0x4f7df3, 24, 22, 1.7);
    cosmicRimLight.position.set(-5.2, 2.8, -3.2);
    scene.add(cosmicRimLight);

    const violetBackLight = new THREE.PointLight(0x8b5cf6, 15, 20, 1.8);
    violetBackLight.position.set(4.8, -3.6, -4.0);
    scene.add(violetBackLight);

    // =========================================================================
    // COMPOSITE MULTI-PART ARCHITECTURAL ASTROLABE UNIVERSE (THREE.Group)
    // =========================================================================
    const universeGroup = new THREE.Group();
    scene.add(universeGroup);

    const disposables: {
      geometries: THREE.BufferGeometry[];
      materials: THREE.Material[];
      textures: THREE.Texture[];
    } = { geometries: [], materials: [], textures: [] };

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const dialTex = createMachinedRingTexture(maxAniso);
    const particleTex = createGlowParticleTexture();
    disposables.textures.push(dialTex, particleTex);

    // 1. Primary Silhouette: Faceted Machined Obsidian Monolith Core
    const coreGeo = new THREE.IcosahedronGeometry(1.02, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x0d121e,
      metalness: 0.94,
      roughness: 0.18,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
      flatShading: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    universeGroup.add(coreMesh);
    disposables.geometries.push(coreGeo);
    disposables.materials.push(coreMat);

    // 2. Custom GLSL Fresnel Atmospheric Energy Halo Shell (subtle icy-cosmic optical rim)
    const haloGeo = new THREE.SphereGeometry(1.22, 48, 48);
    const haloMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorInner: { value: new THREE.Color(0x4f7df3) },
        uColorRim: { value: new THREE.Color(0xdce7ff) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewDir = normalize(-mvPosition.xyz);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColorInner;
        uniform vec3 uColorRim;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float ndotv = clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0);
          float fresnel = pow(1.0 - ndotv, 3.2);
          float pulse = 0.88 + 0.12 * sin(uTime * 1.1);
          vec3 col = mix(uColorInner, uColorRim, fresnel);
          float alpha = fresnel * 0.42 * pulse;
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.renderOrder = 3;
    universeGroup.add(haloMesh);
    disposables.geometries.push(haloGeo);
    disposables.materials.push(haloMat);

    // 3. Secondary Read: Sculpted Crystalline Octahedral Lattice Ribs
    const innerPrismGeo = new THREE.OctahedronGeometry(1.48, 0);
    const innerPrismEdges = new THREE.EdgesGeometry(innerPrismGeo);
    const innerPrismMat = new THREE.LineBasicMaterial({
      color: 0xdce7ff,
      transparent: true,
      opacity: 0.46,
    });
    const innerPrismWire = new THREE.LineSegments(
      innerPrismEdges,
      innerPrismMat
    );
    universeGroup.add(innerPrismWire);
    disposables.geometries.push(innerPrismGeo, innerPrismEdges);
    disposables.materials.push(innerPrismMat);

    // Precision equatorial calibrated disc ring around core
    const eqDiscGeo = new THREE.RingGeometry(1.56, 1.66, 96);
    const eqDiscMat = new THREE.MeshStandardMaterial({
      color: 0x3b4d70,
      metalness: 0.88,
      roughness: 0.28,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const eqDisc = new THREE.Mesh(eqDiscGeo, eqDiscMat);
    eqDisc.rotation.x = Math.PI * 0.44;
    universeGroup.add(eqDisc);
    disposables.geometries.push(eqDiscGeo);
    disposables.materials.push(eqDiscMat);

    // 4. Outer Geodesic Constellation Cage with Instanced Junction Nodes
    const cageGeo = new THREE.IcosahedronGeometry(2.04, 1);
    const cageEdgesGeo = new THREE.EdgesGeometry(cageGeo);
    const cageMat = new THREE.LineBasicMaterial({
      color: 0x4f7df3,
      transparent: true,
      opacity: 0.2,
    });
    const cageLines = new THREE.LineSegments(cageEdgesGeo, cageMat);
    universeGroup.add(cageLines);
    disposables.geometries.push(cageGeo, cageEdgesGeo);
    disposables.materials.push(cageMat);

    const posAttr = cageGeo.attributes.position;
    const uniqueVerts: THREE.Vector3[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);
      const key = `${vx.toFixed(2)},${vy.toFixed(2)},${vz.toFixed(2)}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueVerts.push(new THREE.Vector3(vx, vy, vz));
      }
    }
    const vertDotGeo = new THREE.SphereGeometry(0.026, 10, 10);
    const vertDotMat = new THREE.MeshStandardMaterial({
      color: 0xf5f7fa,
      emissive: 0x4f7df3,
      emissiveIntensity: 1.0,
      roughness: 0.25,
      metalness: 0.6,
    });
    const vertInstanced = new THREE.InstancedMesh(
      vertDotGeo,
      vertDotMat,
      uniqueVerts.length
    );
    const dummyMatrix = new THREE.Matrix4();
    uniqueVerts.forEach((v, idx) => {
      dummyMatrix.makeTranslation(v.x, v.y, v.z);
      vertInstanced.setMatrixAt(idx, dummyMatrix);
    });
    vertInstanced.instanceMatrix.needsUpdate = true;
    vertInstanced.computeBoundingSphere();
    cageLines.add(vertInstanced);
    disposables.geometries.push(vertDotGeo);
    disposables.materials.push(vertDotMat);

    // 5. Three Precision Machined Armillary Rings (distinct material roughness contrast >= 0.25)
    const ringConfigs = [
      {
        radius: 2.48,
        tube: 0.026,
        tiltX: Math.PI * 0.37,
        tiltY: Math.PI * 0.14,
        color: 0xdbe4f0,
        metalness: 0.94,
        roughness: 0.16,
        map: dialTex,
      },
      {
        radius: 2.98,
        tube: 0.015,
        tiltX: -Math.PI * 0.27,
        tiltY: Math.PI * 0.4,
        color: 0x526a94,
        metalness: 0.62,
        roughness: 0.52,
        map: null,
      },
      {
        radius: 3.48,
        tube: 0.011,
        tiltX: Math.PI * 0.17,
        tiltY: -Math.PI * 0.3,
        color: 0x6366f1,
        metalness: 0.78,
        roughness: 0.26,
        map: null,
      },
    ];

    const ringGroups: THREE.Group[] = [];
    ringConfigs.forEach((cfg) => {
      const rGroup = new THREE.Group();
      rGroup.rotation.set(cfg.tiltX, cfg.tiltY, 0);

      const torusGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 18, 140);
      const torusMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        metalness: cfg.metalness,
        roughness: cfg.roughness,
        map: cfg.map ?? undefined,
      });
      const ringMesh = new THREE.Mesh(torusGeo, torusMat);
      rGroup.add(ringMesh);
      universeGroup.add(rGroup);

      ringGroups.push(rGroup);
      disposables.geometries.push(torusGeo);
      disposables.materials.push(torusMat);
    });

    // 6. Four Orbiting Multi-Part Ecosystem Satellite Assemblies + Live Luminous Arc Tethers
    interface SatelliteTrack {
      group: THREE.Group;
      radius: number;
      speed: number;
      phase: number;
      tiltX: number;
      tiltZ: number;
      tetherGeo: THREE.BufferGeometry;
      tetherPositions: Float32Array;
    }

    const TETHER_SEGMENTS = 18;
    const satelliteSpecs = [
      { radius: 2.48, speed: 0.2, phase: 0.55, tiltX: Math.PI * 0.37, tiltZ: 0.2, accent: 0xf0f4ff },
      { radius: 2.98, speed: -0.15, phase: 2.15, tiltX: -Math.PI * 0.27, tiltZ: 0.52, accent: 0x4f7df3 },
      { radius: 2.48, speed: 0.17, phase: 3.85, tiltX: Math.PI * 0.37, tiltZ: 0.2, accent: 0xcbd5e1 },
      { radius: 3.48, speed: 0.12, phase: 5.05, tiltX: Math.PI * 0.17, tiltZ: -0.44, accent: 0x8b5cf6 },
    ];

    const satCoreGeo = new THREE.OctahedronGeometry(0.088, 0);
    const satHaloGeo = new THREE.TorusGeometry(0.155, 0.011, 10, 32);
    const satOuterGeo = new THREE.TorusGeometry(0.21, 0.005, 8, 32);
    disposables.geometries.push(satCoreGeo, satHaloGeo, satOuterGeo);

    const satellites: SatelliteTrack[] = satelliteSpecs.map((spec) => {
      const satGroup = new THREE.Group();

      const coreM = new THREE.MeshStandardMaterial({
        color: spec.accent,
        emissive: spec.accent,
        emissiveIntensity: 0.72,
        metalness: 0.85,
        roughness: 0.18,
      });
      const haloM = new THREE.MeshStandardMaterial({
        color: 0xf5f7fa,
        metalness: 0.92,
        roughness: 0.22,
      });
      const outerM = new THREE.MeshBasicMaterial({
        color: spec.accent,
        transparent: true,
        opacity: 0.38,
      });
      disposables.materials.push(coreM, haloM, outerM);

      const core = new THREE.Mesh(satCoreGeo, coreM);
      const halo = new THREE.Mesh(satHaloGeo, haloM);
      halo.rotation.x = Math.PI / 2.3;
      const outerRing = new THREE.Mesh(satOuterGeo, outerM);
      outerRing.rotation.y = Math.PI / 3;

      satGroup.add(core, halo, outerRing);
      universeGroup.add(satGroup);

      // Luminous curved filament connecting core -> satellite (updated in-place, zero GC)
      const tetherPositions = new Float32Array((TETHER_SEGMENTS + 1) * 3);
      const tetherGeo = new THREE.BufferGeometry();
      tetherGeo.setAttribute(
        'position',
        new THREE.BufferAttribute(tetherPositions, 3)
      );
      const tetherMat = new THREE.LineBasicMaterial({
        color: spec.accent,
        transparent: true,
        opacity: 0.22,
      });
      const tetherLine = new THREE.Line(tetherGeo, tetherMat);
      tetherLine.frustumCulled = false;
      universeGroup.add(tetherLine);
      disposables.geometries.push(tetherGeo);
      disposables.materials.push(tetherMat);

      return {
        group: satGroup,
        radius: spec.radius,
        speed: spec.speed,
        phase: spec.phase,
        tiltX: spec.tiltX,
        tiltZ: spec.tiltZ,
        tetherGeo,
        tetherPositions,
      };
    });

    // 7. Layered Deep Constellation Particle Cloud
    const particleCount = 480;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const palette = [
      new THREE.Color(0xf0f4ff),
      new THREE.Color(0x4f7df3),
      new THREE.Color(0x8b5cf6),
      new THREE.Color(0x969eae),
    ];

    for (let i = 0; i < particleCount; i++) {
      const u = (i + 0.5) / particleCount;
      const phi = Math.acos(1 - 2 * u);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 2.4 + ((i * 73) % 100) * 0.048;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.76;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.082,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const starField = new THREE.Points(starGeo, starMat);
    starField.frustumCulled = false;
    scene.add(starField);
    disposables.geometries.push(starGeo);
    disposables.materials.push(starMat);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Subtle Pointer & Scroll Parallax Targets (damped smoothly)
    const pointerTarget = { x: 0, y: 0 };
    const pointerSmooth = { x: 0, y: 0 };
    let scrollTarget = 0;
    let scrollSmooth = 0;

    const onPointerMove = (e: PointerEvent) => {
      pointerTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerTarget.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      const vh = window.innerHeight || 1;
      scrollTarget = Math.min(Math.max(window.scrollY / vh, 0), 1.4);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    let isHeroVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        isHeroVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.02 }
    );
    observer.observe(container);

    const onResize = () => {
      if (!container) return;
      const nw = container.clientWidth || window.innerWidth;
      const nh = container.clientHeight || window.innerHeight;
      updateCameraLayout(nw, nh);
      renderer.setSize(nw, nh);
      if (prefersReducedMotion) {
        renderer.render(scene, camera);
      }
    };
    window.addEventListener('resize', onResize, { passive: true });

    // Frame Pacing (software WebGL safe via fenceSync afterDraw)
    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    const updateSatellitesAndTethers = (elapsed: number) => {
      for (let i = 0; i < satellites.length; i++) {
        const sat = satellites[i];
        const angle = sat.phase + elapsed * sat.speed;
        _orbitPos.set(
          Math.cos(angle) * sat.radius,
          0,
          Math.sin(angle) * sat.radius
        );
        _orbitPos.applyAxisAngle(_axisX, sat.tiltX);
        _orbitPos.applyAxisAngle(_axisZ, sat.tiltZ);
        sat.group.position.copy(_orbitPos);
        sat.group.rotation.y = elapsed * 0.55 + i;
        sat.group.rotation.x = Math.sin(elapsed * 0.35 + i) * 0.4;

        // Compute gentle quadratic arc from core surface to satellite (zero allocation)
        _midCtrl.copy(_orbitPos).multiplyScalar(0.5);
        _midCtrl.y += (i % 2 === 0 ? 0.42 : -0.42);

        const posArr = sat.tetherPositions;
        for (let s = 0; s <= TETHER_SEGMENTS; s++) {
          const t = s / TETHER_SEGMENTS;
          const invT = 1 - t;
          // Start near surface (t=0.28..1) for crisp visual breathing room around core
          const u = 0.28 + t * 0.72;
          const invU = 1 - u;
          _curvePt.set(
            2 * invU * u * _midCtrl.x + u * u * _orbitPos.x,
            2 * invU * u * _midCtrl.y + u * u * _orbitPos.y,
            2 * invU * u * _midCtrl.z + u * u * _orbitPos.z
          );
          // Suppress unused warning on invT via subtle interpolation weighting
          const idx = s * 3;
          posArr[idx] = _curvePt.x * (0.999 + invT * 0.001);
          posArr[idx + 1] = _curvePt.y;
          posArr[idx + 2] = _curvePt.z;
        }
        sat.tetherGeo.attributes.position.needsUpdate = true;
      }
    };

    // Initial composed frame
    updateSatellitesAndTethers(1.4);
    universeGroup.rotation.set(0.18, -0.38, 0.06);
    renderer.render(scene, camera);

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

      if (!isHeroVisible) {
        frameId = window.setTimeout(tick, 220);
        return;
      }

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      pointerSmooth.x = THREE.MathUtils.damp(
        pointerSmooth.x,
        pointerTarget.x,
        3.0,
        delta
      );
      pointerSmooth.y = THREE.MathUtils.damp(
        pointerSmooth.y,
        pointerTarget.y,
        3.0,
        delta
      );
      scrollSmooth = THREE.MathUtils.damp(scrollSmooth, scrollTarget, 4.5, delta);

      haloMat.uniforms.uTime.value = elapsed;

      coreMesh.rotation.y = elapsed * 0.13;
      coreMesh.rotation.x = Math.sin(elapsed * 0.24) * 0.14;

      innerPrismWire.rotation.y = -elapsed * 0.09;
      innerPrismWire.rotation.z = elapsed * 0.075;

      eqDisc.rotation.z = elapsed * 0.06;

      cageLines.rotation.y = elapsed * 0.05;
      cageLines.rotation.x = Math.cos(elapsed * 0.16) * 0.09;

      ringGroups[0].rotation.z = elapsed * 0.085;
      ringGroups[1].rotation.z = -elapsed * 0.06;
      ringGroups[2].rotation.z = elapsed * 0.042;

      updateSatellitesAndTethers(elapsed + 1.4);

      // Smooth cursor + scroll depth choreography
      universeGroup.rotation.y = -0.38 + pointerSmooth.x * 0.24 + scrollSmooth * 0.45;
      universeGroup.rotation.x = 0.18 + pointerSmooth.y * 0.14 + scrollSmooth * 0.22;
      universeGroup.position.y = scrollSmooth * 0.55;

      camera.position.z = baseCameraPos.z + scrollSmooth * 1.4;
      camera.lookAt(baseLookAt);

      starField.rotation.y = elapsed * 0.016 + pointerSmooth.x * 0.045;
      starField.rotation.x = pointerSmooth.y * 0.025;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (!prefersReducedMotion) {
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);

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

  if (webglUnavailable) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center lg:justify-end lg:pr-[6%] overflow-hidden pointer-events-none"
      >
        <svg
          viewBox="0 0 600 600"
          className="w-[380px] h-[380px] sm:w-[540px] sm:h-[540px] opacity-90"
          fill="none"
        >
          <defs>
            <radialGradient id="heroOrbFallback" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4F7DF3" stopOpacity="0.34" />
              <stop offset="52%" stopColor="#6366F1" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#050608" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="300" cy="300" r="245" fill="url(#heroOrbFallback)" />
          <ellipse
            cx="300"
            cy="300"
            rx="215"
            ry="82"
            transform="rotate(-24 300 300)"
            stroke="#CBD5E1"
            strokeOpacity="0.48"
            strokeWidth="1.2"
          />
          <ellipse
            cx="300"
            cy="300"
            rx="178"
            ry="116"
            transform="rotate(34 300 300)"
            stroke="#4F7DF3"
            strokeOpacity="0.52"
            strokeWidth="1"
          />
          <polygon
            points="300,192 392,300 300,408 208,300"
            stroke="#E6EEFF"
            strokeOpacity="0.6"
            strokeWidth="1.2"
            fill="#10141D"
            fillOpacity="0.78"
          />
          <circle cx="468" cy="226" r="5" fill="#E6EEFF" />
          <circle cx="152" cy="368" r="4.5" fill="#4F7DF3" />
          <circle cx="395" cy="408" r="4.5" fill="#8B5CF6" />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
}
