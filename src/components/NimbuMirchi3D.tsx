import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

// Pre-allocated math helpers outside render loop (Zero GC per frame)
const _mouse = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();
const _dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const _intersectPt = new THREE.Vector3();
const _vDir = new THREE.Vector3();
const _vUp = new THREE.Vector3(0, -1, 0);
const _quat = new THREE.Quaternion();
const _ropeCurvePts = Array.from({ length: 10 }, () => new THREE.Vector3());

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
 * Deterministic PRNG for repeatable photorealistic procedural surface maps
 */
function createSeededRandom(seedStart: number) {
  let seed = seedStart % 2147483647;
  if (seed <= 0) seed += 2147483646;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/**
 * Converts a scalar heightfield into a crisp tangent-space Normal Map DataTexture
 * using wrap-around Sobel derivatives (linear NoColorSpace).
 */
function heightFieldToNormalTexture(
  height: Float32Array,
  width: number,
  heightPx: number,
  strength: number,
  maxAnisotropy: number,
  wrapT: THREE.Wrapping = THREE.ClampToEdgeWrapping
): THREE.DataTexture {
  const data = new Uint8Array(width * heightPx * 4);

  const sample = (x: number, y: number) => {
    const wx = ((x % width) + width) % width;
    const wy =
      wrapT === THREE.RepeatWrapping
        ? ((y % heightPx) + heightPx) % heightPx
        : Math.max(0, Math.min(heightPx - 1, y));
    return height[wy * width + wx];
  };

  for (let y = 0; y < heightPx; y++) {
    for (let x = 0; x < width; x++) {
      const tl = sample(x - 1, y - 1);
      const t = sample(x, y - 1);
      const tr = sample(x + 1, y - 1);
      const l = sample(x - 1, y);
      const r = sample(x + 1, y);
      const bl = sample(x - 1, y + 1);
      const b = sample(x, y + 1);
      const br = sample(x + 1, y + 1);

      const dx = (tr + 2 * r + br - (tl + 2 * l + bl)) * strength;
      const dy = (bl + 2 * b + br - (tl + 2 * t + tr)) * strength;

      const nx = -dx;
      const ny = dy;
      const nz = 1.0;
      const invLen = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);

      const idx = (y * width + x) * 4;
      data[idx] = Math.round((nx * invLen * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.round((ny * invLen * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.round((nz * invLen * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  const tex = new THREE.DataTexture(data, width, heightPx, THREE.RGBAFormat);
  tex.flipY = true;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = wrapT;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Injects lightweight organic Subsurface Scattering (backlit translucency + warm wrap)
 * directly into Three.js MeshPhysicalMaterial so botanical flesh glows naturally under light.
 */
function applyBotanicalSubsurface(
  material: THREE.MeshPhysicalMaterial,
  sssColorHex: number,
  strength: number
) {
  const sssColor = new THREE.Color(sssColorHex);
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uSssColor = { value: sssColor };
    shader.uniforms.uSssStrength = { value: strength };
    shader.uniforms.uBackLightDir = {
      value: new THREE.Vector3(-0.42, 0.55, -0.72).normalize(),
    };
    shader.uniforms.uKeyLightDir = {
      value: new THREE.Vector3(0.46, 0.62, 0.63).normalize(),
    };

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform vec3 uSssColor;
        uniform float uSssStrength;
        uniform vec3 uBackLightDir;
        uniform vec3 uKeyLightDir;`
      )
      .replace(
        '#include <lights_fragment_end>',
        `#include <lights_fragment_end>
        vec3 sssViewDir = normalize(vViewPosition);
        vec3 sssNormal = normalize(normal);
        vec3 backDirView = normalize((viewMatrix * vec4(uBackLightDir, 0.0)).xyz);
        vec3 keyDirView = normalize((viewMatrix * vec4(uKeyLightDir, 0.0)).xyz);
        float backScatter = pow(clamp(dot(sssViewDir, -normalize(backDirView + sssNormal * 0.38)), 0.0, 1.0), 2.4);
        float rimThin = pow(1.0 - clamp(dot(sssNormal, sssViewDir), 0.0, 1.0), 2.1);
        float wrapKey = clamp((dot(sssNormal, keyDirView) + 0.55) / 1.55, 0.0, 1.0);
        reflectedLight.directDiffuse += uSssColor * uSssStrength * (backScatter * 0.72 + rimThin * 0.34 + wrapKey * 0.16);`
      );
  };
  material.customProgramCacheKey = () =>
    `botanical-sss-${sssColorHex.toString(16)}-${strength.toFixed(2)}`;
}

/**
 * High-detail procedural Indian Kagzi Lemon PBR maps:
 * - Albedo (SRGB): sun-ripened yellow gradient, lime-green polar tint, pore tint, micro orchard freckles
 * - Normal Map (Linear): Sobel tangent-space oil-gland dimples + organic rind wave
 * - Roughness Map (Linear): matte oil-gland pits vs glossy waxy ridges between pores
 */
function createLemonPBRMaps(maxAnisotropy: number) {
  const size = 512;
  const rand = createSeededRandom(4219);

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d');

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d');

  const height = new Float32Array(size * size);

  // Base organic low-frequency rind undulation
  for (let y = 0; y < size; y++) {
    const v = y / size;
    const poleFactor = Math.sin(v * Math.PI);
    for (let x = 0; x < size; x++) {
      const u = (x / size) * Math.PI * 2;
      const wave =
        Math.sin(u * 5 + v * 7) * 0.06 +
        Math.cos(u * 9 - v * 11) * 0.04 +
        Math.sin(u * 14 + v * 19) * 0.025;
      // Subtle radiating pucker creases near top and bottom poles
      const polarCrease =
        (1 - poleFactor) *
        (1 - poleFactor) *
        (Math.sin(u * 13) * 0.18 + Math.cos(u * 21) * 0.1);
      height[y * size + x] = 0.62 + wave * poleFactor + polarCrease;
    }
  }

  if (cCtx && rCtx) {
    // Rich, deep sun-ripened Indian Nimbu albedo with layered golden-yellow shades
    const grad = cCtx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0.0, '#7c5600');
    grad.addColorStop(0.08, '#b88400');
    grad.addColorStop(0.24, '#d9a100');
    grad.addColorStop(0.48, '#e8b600');
    grad.addColorStop(0.74, '#d29600');
    grad.addColorStop(0.92, '#9e6d00');
    grad.addColorStop(1.0, '#5e3e00');
    cCtx.fillStyle = grad;
    cCtx.fillRect(0, 0, size, size);

    // Subtle organic longitudinal yellow-gold rind bands for deeper multi-shade realism
    for (let i = 0; i < 24; i++) {
      const bx = rand() * size;
      const bw = 18 + rand() * 44;
      const bandGrad = cCtx.createLinearGradient(bx - bw, 0, bx + bw, 0);
      const isWarmDark = rand() > 0.45;
      bandGrad.addColorStop(0, 'rgba(180, 120, 0, 0)');
      bandGrad.addColorStop(
        0.5,
        isWarmDark ? 'rgba(146, 90, 0, 0.14)' : 'rgba(246, 194, 0, 0.13)'
      );
      bandGrad.addColorStop(1, 'rgba(180, 120, 0, 0)');
      cCtx.fillStyle = bandGrad;
      cCtx.fillRect(bx - bw, 0, bw * 2, size);
    }

    // Multi-tonal sun-ripened yellow, honey-gold & deep ochre mottled patches across the skin
    for (let i = 0; i < 90; i++) {
      const px = rand() * size;
      const py = (0.08 + rand() * 0.84) * size;
      const pr = 20 + rand() * 52;
      const patchGrad = cCtx.createRadialGradient(px, py, 0, px, py, pr);
      const toneRoll = rand();
      if (toneRoll > 0.62) {
        patchGrad.addColorStop(0, 'rgba(245, 192, 0, 0.22)');
        patchGrad.addColorStop(1, 'rgba(245, 192, 0, 0)');
      } else if (toneRoll > 0.28) {
        patchGrad.addColorStop(0, 'rgba(196, 130, 0, 0.22)');
        patchGrad.addColorStop(1, 'rgba(196, 130, 0, 0)');
      } else {
        patchGrad.addColorStop(0, 'rgba(144, 88, 0, 0.20)');
        patchGrad.addColorStop(1, 'rgba(144, 88, 0, 0)');
      }
      cCtx.fillStyle = patchGrad;
      cCtx.beginPath();
      cCtx.arc(px, py, pr, 0, Math.PI * 2);
      cCtx.fill();
    }

    // Waxy natural citrus base roughness (~0.30 -> 78/255)
    rCtx.fillStyle = 'rgb(78, 78, 78)';
    rCtx.fillRect(0, 0, size, size);

    // 4,600 realistic concave citrus oil-gland dimples stamped into albedo, roughness, and heightfield
    for (let i = 0; i < 4600; i++) {
      const cx = rand() * size;
      const cy = rand() * size;
      const v = cy / size;
      const latScale = 0.65 + Math.sin(v * Math.PI) * 0.45;
      const r = (1.35 + rand() * 2.05) * latScale;
      const depth = 0.24 + rand() * 0.26;

      // Stamp concave dimple with slightly raised waxy collar into heightfield
      const rInt = Math.ceil(r * 1.65);
      const x0 = Math.floor(cx);
      const y0 = Math.floor(cy);
      for (let oy = -rInt; oy <= rInt; oy++) {
        const py = y0 + oy;
        if (py < 0 || py >= size) continue;
        for (let ox = -rInt; ox <= rInt; ox++) {
          const px = ((x0 + ox) % size + size) % size;
          const dist = Math.sqrt(ox * ox + oy * oy) / r;
          if (dist < 1.0) {
            const pit = (1 - dist * dist) * depth;
            height[py * size + px] -= pit;
          } else if (dist < 1.55) {
            const rim = Math.sin(((dist - 1.0) / 0.55) * Math.PI) * depth * 0.22;
            height[py * size + px] += rim;
          }
        }
      }

      // Rich dark amber-ochre oil-gland pore recess tint on albedo
      const poreGrad = cCtx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.3);
      poreGrad.addColorStop(0, 'rgba(92, 48, 0, 0.44)');
      poreGrad.addColorStop(0.55, 'rgba(148, 84, 0, 0.18)');
      poreGrad.addColorStop(1, 'rgba(232, 174, 0, 0)');
      cCtx.fillStyle = poreGrad;
      cCtx.beginPath();
      cCtx.arc(cx, cy, r * 1.3, 0, Math.PI * 2);
      cCtx.fill();

      // Pores are slightly rougher (more matte inside pits, shinier on raised ridges)
      rCtx.fillStyle = 'rgba(164, 164, 164, 0.50)';
      rCtx.beginPath();
      rCtx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
      rCtx.fill();
    }

    // Authentic subtle orchard micro-speckles & tiny natural brown pinpoints
    for (let i = 0; i < 48; i++) {
      const fx = rand() * size;
      const fy = (0.14 + rand() * 0.72) * size;
      const fr = 0.8 + rand() * 1.9;
      cCtx.fillStyle = `rgba(92, 54, 10, ${0.28 + rand() * 0.30})`;
      cCtx.beginPath();
      cCtx.arc(fx, fy, fr, 0, Math.PI * 2);
      cCtx.fill();

      rCtx.fillStyle = 'rgba(195, 195, 195, 0.65)';
      rCtx.beginPath();
      rCtx.arc(fx, fy, fr * 1.2, 0, Math.PI * 2);
      rCtx.fill();
    }

    // Subtle darkened puncture rings at exact top & bottom thread pierce poles
    const topPin = cCtx.createLinearGradient(0, 0, 0, size * 0.055);
    topPin.addColorStop(0, 'rgba(42, 36, 12, 0.72)');
    topPin.addColorStop(1, 'rgba(42, 36, 12, 0)');
    cCtx.fillStyle = topPin;
    cCtx.fillRect(0, 0, size, size * 0.055);

    const botPin = cCtx.createLinearGradient(0, size * 0.945, 0, size);
    botPin.addColorStop(0, 'rgba(46, 38, 12, 0)');
    botPin.addColorStop(1, 'rgba(46, 38, 12, 0.65)');
    cCtx.fillStyle = botPin;
    cCtx.fillRect(0, size * 0.945, size, size * 0.055);
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.ClampToEdgeWrapping;
  map.anisotropy = maxAnisotropy;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.ClampToEdgeWrapping;
  roughnessMap.anisotropy = maxAnisotropy;

  const normalMap = heightFieldToNormalTexture(
    height,
    size,
    size,
    1.85,
    maxAnisotropy,
    THREE.ClampToEdgeWrapping
  );

  return { map, normalMap, roughnessMap };
}

/**
 * Photorealistic waxy green Indian chili PBR maps (Albedo + Normal + Roughness)
 */
function createChiliPBRMaps(
  baseHex: string,
  highlightHex: string,
  tipHex: string,
  seed: number,
  maxAnisotropy: number
) {
  const w = 512;
  const h = 256;
  const rand = createSeededRandom(seed);

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = w;
  colorCanvas.height = h;
  const cCtx = colorCanvas.getContext('2d');

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = w;
  roughCanvas.height = h;
  const rCtx = roughCanvas.getContext('2d');

  const height = new Float32Array(w * h);

  // Sculpt longitudinal natural pepper flutes + fine shoulder wrinkles + organic surface ripples
  for (let y = 0; y < h; y++) {
    const theta = (y / h) * Math.PI * 2;
    for (let x = 0; x < w; x++) {
      const t = x / w; // 0 = pointed tip, 1 = calyx shoulder
      const shoulderMask = Math.max(0, (t - 0.68) / 0.32);
      const midMask = Math.sin(t * Math.PI);

      // Gentle 3-4 longitudinal ribs + natural subtle transverse crease ripples
      const ribs =
        Math.sin(theta * 3 + t * 1.8) * 0.14 * midMask +
        Math.cos(theta * 5 - t * 2.4) * 0.06 * midMask;
      const shoulderWrinkles =
        shoulderMask *
        shoulderMask *
        (Math.sin(theta * 14 + t * 9) * 0.16 + Math.cos(t * 48) * 0.07);
      const fineRipple =
        Math.sin(t * 28 + Math.sin(theta * 2) * 1.5) * 0.045 * midMask;

      height[y * w + x] = 0.5 + ribs + shoulderWrinkles + fineRipple;
    }
  }

  if (cCtx && rCtx) {
    // Deep, rich dark botanical green gradient along chili length (tip -> body -> shoulder)
    const grad = cCtx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0.0, tipHex);
    grad.addColorStop(0.16, baseHex);
    grad.addColorStop(0.54, highlightHex);
    grad.addColorStop(0.82, baseHex);
    grad.addColorStop(1.0, '#041d04');
    cCtx.fillStyle = grad;
    cCtx.fillRect(0, 0, w, h);

    // Organic dark-green mottling patches for realistic multi-shade depth
    for (let i = 0; i < 45; i++) {
      const px = (0.08 + rand() * 0.84) * w;
      const py = rand() * h;
      const pr = 16 + rand() * 38;
      const mg = cCtx.createRadialGradient(px, py, 0, px, py, pr);
      if (rand() > 0.45) {
        mg.addColorStop(0, 'rgba(3, 28, 5, 0.24)');
        mg.addColorStop(1, 'rgba(3, 28, 5, 0)');
      } else {
        mg.addColorStop(0, 'rgba(32, 118, 22, 0.16)');
        mg.addColorStop(1, 'rgba(32, 118, 22, 0)');
      }
      cCtx.fillStyle = mg;
      cCtx.beginPath();
      cCtx.arc(px, py, pr, 0, Math.PI * 2);
      cCtx.fill();
    }

    // Deep botanical chlorophyll striations along the length
    for (let i = 0; i < 72; i++) {
      const sy = rand() * h;
      const sh = 1.5 + rand() * 4.5;
      cCtx.fillStyle =
        rand() > 0.42
          ? 'rgba(42, 132, 24, 0.12)'
          : 'rgba(2, 20, 4, 0.24)';
      cCtx.fillRect(0, sy, w, sh);
    }

    // Subtle rich emerald mid-body depth glow (avoids neon lime washout)
    const sunGrad = cCtx.createRadialGradient(
      w * 0.52,
      h * 0.35,
      8,
      w * 0.52,
      h * 0.35,
      w * 0.36
    );
    sunGrad.addColorStop(0, 'rgba(46, 138, 22, 0.15)');
    sunGrad.addColorStop(1, 'rgba(46, 138, 22, 0)');
    cCtx.fillStyle = sunGrad;
    cCtx.fillRect(0, 0, w, h);

    // Natural organic dark micro-flecks & subtle maturity lines
    for (let i = 0; i < 34; i++) {
      const cx = (0.12 + rand() * 0.76) * w;
      const cy = rand() * h;
      cCtx.fillStyle = 'rgba(4, 22, 4, 0.34)';
      cCtx.beginPath();
      cCtx.arc(cx, cy, 0.7 + rand() * 1.4, 0, Math.PI * 2);
      cCtx.fill();
    }

    // Subtle darkened needle-pierce shadow right around middle belly where thread passes through
    const pierceX = w * 0.57;
    for (const py of [h * 0.25, h * 0.75]) {
      const pGrad = cCtx.createRadialGradient(pierceX, py, 0, pierceX, py, 14);
      pGrad.addColorStop(0, 'rgba(3, 12, 3, 0.68)');
      pGrad.addColorStop(1, 'rgba(3, 12, 3, 0)');
      cCtx.fillStyle = pGrad;
      cCtx.beginPath();
      cCtx.arc(pierceX, py, 14, 0, Math.PI * 2);
      cCtx.fill();
    }

    // Waxy smooth roughness map (glossy 0.16 belly, slightly more matte 0.36 at tip & shoulder)
    const rGrad = rCtx.createLinearGradient(0, 0, w, 0);
    rGrad.addColorStop(0.0, 'rgb(108, 108, 108)');
    rGrad.addColorStop(0.18, 'rgb(44, 44, 44)');
    rGrad.addColorStop(0.75, 'rgb(40, 40, 40)');
    rGrad.addColorStop(1.0, 'rgb(112, 112, 112)');
    rCtx.fillStyle = rGrad;
    rCtx.fillRect(0, 0, w, h);

    // Organic waxy sheen variation patches
    for (let i = 0; i < 38; i++) {
      const rx = rand() * w;
      const ry = rand() * h;
      const rr = 14 + rand() * 34;
      const rg = rCtx.createRadialGradient(rx, ry, 0, rx, ry, rr);
      rg.addColorStop(
        0,
        rand() > 0.5 ? 'rgba(92, 92, 92, 0.32)' : 'rgba(26, 26, 26, 0.35)'
      );
      rg.addColorStop(1, 'rgba(50, 50, 50, 0)');
      rCtx.fillStyle = rg;
      rCtx.beginPath();
      rCtx.arc(rx, ry, rr, 0, Math.PI * 2);
      rCtx.fill();
    }
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.ClampToEdgeWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = maxAnisotropy;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.ClampToEdgeWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.anisotropy = maxAnisotropy;

  const normalMap = heightFieldToNormalTexture(
    height,
    w,
    h,
    1.15,
    maxAnisotropy,
    THREE.RepeatWrapping
  );

  return { map, normalMap, roughnessMap };
}

/**
 * Multi-ply twisted black cotton thread PBR maps (Albedo + Normal Map)
 */
function createBraidedThreadPBRMaps(maxAnisotropy: number) {
  const size = 256;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d');

  const height = new Float32Array(size * size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Multi-strand 3-ply twisted cotton cord height pattern
      const u = (x / size) * Math.PI * 2;
      const v = (y / size) * Math.PI * 2;
      const strand = Math.sin(u * 3 + v * 6) * 0.5 + 0.5;
      const microFiber = Math.sin(u * 18 - v * 24) * 0.14;
      height[y * size + x] = Math.pow(strand, 0.65) + microFiber;
    }
  }

  if (cCtx) {
    cCtx.fillStyle = '#15171c';
    cCtx.fillRect(0, 0, size, size);

    for (let i = -size; i < size * 2; i += 16) {
      cCtx.strokeStyle = '#2d313d';
      cCtx.lineWidth = 6;
      cCtx.beginPath();
      cCtx.moveTo(i, 0);
      cCtx.lineTo(i + size, size);
      cCtx.stroke();

      cCtx.strokeStyle = '#090a0d';
      cCtx.lineWidth = 3;
      cCtx.beginPath();
      cCtx.moveTo(i + 6, 0);
      cCtx.lineTo(i + size + 6, size);
      cCtx.stroke();
    }
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 18);
  map.anisotropy = maxAnisotropy;

  const normalMap = heightFieldToNormalTexture(
    height,
    size,
    size,
    2.2,
    maxAnisotropy,
    THREE.RepeatWrapping
  );
  normalMap.repeat.set(2, 18);

  return { map, normalMap };
}

/**
 * Adds subtle glistening fresh water dewdrops onto an organic fruit surface
 */
function addWaterDewdrops(
  parent: THREE.Object3D,
  spots: Array<{ pos: [number, number, number]; radius: number; normal: [number, number, number] }>,
  dewMat: THREE.Material,
  disposables: { geometries: THREE.BufferGeometry[] }
) {
  const dropGeo = new THREE.SphereGeometry(1, 14, 10);
  disposables.geometries.push(dropGeo);

  const up = new THREE.Vector3(0, 1, 0);
  const nVec = new THREE.Vector3();
  const q = new THREE.Quaternion();

  for (const spot of spots) {
    const drop = new THREE.Mesh(dropGeo, dewMat);
    drop.position.set(spot.pos[0], spot.pos[1], spot.pos[2]);
    nVec.set(spot.normal[0], spot.normal[1], spot.normal[2]).normalize();
    q.setFromUnitVectors(up, nVec);
    drop.quaternion.copy(q);
    // Slightly flattened meniscus hugging the waxy fruit skin
    drop.scale.set(spot.radius, spot.radius * 0.56, spot.radius * 1.08);
    parent.add(drop);
  }
}

/**
 * Builds a photorealistic multi-part Indian green chili:
 * 1. Organically sculpted curved & fluted tapered body with subtle S-bend
 * 2. Scalloped 5-petal matte calyx crown gripping the shoulder seamlessly
 * 3. Tapered, ridged, curved woody stem with tan cut-tip end face
 * 4. Optional fresh water dewdrops
 */
function buildRealisticChili(
  length: number,
  maxRadius: number,
  curveBend: number,
  sCurve: number,
  bodyMat: THREE.Material,
  calyxMat: THREE.Material,
  stemMat: THREE.Material,
  cutTipMat: THREE.Material,
  dewMat: THREE.Material | null,
  disposables: { geometries: THREE.BufferGeometry[] }
): THREE.Group {
  const group = new THREE.Group();

  // 1. Sculpted Organic Tapered Curved Body
  const rings = 40;
  const radialSegs = 26;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const xStart = -length * 0.57;
  const xEnd = length * 0.43;

  const spinePoint = (t: number) => {
    const x = THREE.MathUtils.lerp(xStart, xEnd, t);
    // Natural graceful tip hook + gentle belly sag + organic S-twist
    const y =
      Math.pow(1 - t, 2.35) * curveBend -
      Math.sin(t * Math.PI) * curveBend * 0.34;
    const z = Math.sin(t * Math.PI * 1.45) * sCurve;
    return { x, y, z };
  };

  for (let i = 0; i <= rings; i++) {
    const t = i / rings; // 0 = pointed tip, 1 = shoulder base
    const { x, y: centerY, z: centerZ } = spinePoint(t);

    // Authentic Indian Hari Mirch slender tapered profile
    let r: number;
    if (t < 0.05) {
      // Smooth rounded micro-tip (no sharp polygonal spike)
      const u = t / 0.05;
      r = maxRadius * (0.015 + Math.sqrt(u) * 0.16);
    } else if (t < 0.8) {
      const u = (t - 0.05) / 0.75;
      r = maxRadius * (0.175 + Math.pow(u, 0.76) * 0.825);
    } else {
      // Plump rounded shoulder tucking cleanly into the calyx crown
      const u = (t - 0.8) / 0.2;
      r = maxRadius * Math.cos(u * Math.PI * 0.46);
    }

    for (let j = 0; j <= radialSegs; j++) {
      const v = j / radialSegs;
      const theta = v * Math.PI * 2;
      const midEnv = Math.sin(t * Math.PI);
      // Natural 3-lobe + subtle organic longitudinal ridges & slight cross-section ovality
      const lobe =
        1 +
        0.055 * Math.sin(theta * 3 + t * 2.1) * midEnv +
        0.024 * Math.cos(theta * 5 - t * 3.2) * midEnv +
        0.018 * Math.sin(t * 16) * midEnv;
      const localR = r * lobe;

      const py = centerY + Math.sin(theta) * localR * 0.93;
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
  bodyGeo.computeTangents();
  disposables.geometries.push(bodyGeo);

  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  const shoulderPos = spinePoint(0.96);

  // 2. Sculpted Matte Botanical Calyx Crown (tight flared cup + 5 curved organic sepals)
  const calyxGroup = new THREE.Group();
  calyxGroup.position.set(shoulderPos.x, shoulderPos.y, shoulderPos.z);

  const cupPts = [
    new THREE.Vector2(maxRadius * 0.17, 0.11),
    new THREE.Vector2(maxRadius * 0.34, 0.06),
    new THREE.Vector2(maxRadius * 0.78, -0.02),
    new THREE.Vector2(maxRadius * 0.96, -0.11),
    new THREE.Vector2(maxRadius * 0.82, -0.15),
    new THREE.Vector2(0.01, -0.05),
  ];
  const calyxCupGeo = new THREE.LatheGeometry(cupPts, 18);
  calyxCupGeo.rotateZ(-Math.PI / 2);
  calyxCupGeo.computeVertexNormals();
  disposables.geometries.push(calyxCupGeo);
  const calyxCup = new THREE.Mesh(calyxCupGeo, calyxMat);
  calyxCup.castShadow = true;
  calyxGroup.add(calyxCup);

  // Curved organic sepal petals hugging the chili shoulder (instead of rigid cones)
  const sepalShape = new THREE.Shape();
  sepalShape.moveTo(0, -maxRadius * 0.22);
  sepalShape.quadraticCurveTo(
    -maxRadius * 0.25,
    -maxRadius * 0.24,
    -maxRadius * 0.56,
    0
  );
  sepalShape.quadraticCurveTo(
    -maxRadius * 0.25,
    maxRadius * 0.24,
    0,
    maxRadius * 0.22
  );
  sepalShape.closePath();

  const sepalGeo = new THREE.ExtrudeGeometry(sepalShape, {
    depth: maxRadius * 0.08,
    bevelEnabled: true,
    bevelThickness: maxRadius * 0.025,
    bevelSize: maxRadius * 0.02,
    bevelSegments: 2,
  });
  sepalGeo.translate(0, 0, -maxRadius * 0.04);
  disposables.geometries.push(sepalGeo);

  for (let s = 0; s < 5; s++) {
    const angle = (s / 5) * Math.PI * 2 + 0.25;
    const sepalHolder = new THREE.Group();
    sepalHolder.rotation.x = angle;
    const sepal = new THREE.Mesh(sepalGeo, calyxMat);
    sepal.position.set(-maxRadius * 0.06, 0, maxRadius * 0.82);
    sepal.rotation.y = 0.22; // Hugs curvature of shoulder
    sepalHolder.add(sepal);
    calyxGroup.add(sepalHolder);
  }
  group.add(calyxGroup);

  // 3. Curved Tapered Woody Pedicel (Stem) with Natural Snapped Tan Cut Tip
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(shoulderPos.x + 0.01, shoulderPos.y, shoulderPos.z),
    new THREE.Vector3(
      shoulderPos.x + length * 0.11,
      shoulderPos.y - 0.025,
      shoulderPos.z + 0.02
    ),
    new THREE.Vector3(
      shoulderPos.x + length * 0.24,
      shoulderPos.y - 0.075,
      shoulderPos.z - 0.015
    ),
    new THREE.Vector3(
      shoulderPos.x + length * 0.34,
      shoulderPos.y - 0.04,
      shoulderPos.z + 0.012
    ),
  ]);
  const stemGeo = new THREE.TubeGeometry(
    stemCurve,
    16,
    maxRadius * 0.135,
    9,
    false
  );
  // Subtle organic thickness flare near calyx & slight woody taper toward tip
  const sPos = stemGeo.attributes.position;
  const _cPt = new THREE.Vector3();
  const _vPt = new THREE.Vector3();
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    stemCurve.getPoint(t, _cPt);
    const scale = t < 0.2 ? 1.25 - t * 1.4 : 0.97 - (t - 0.2) * 0.22;
    for (let j = 0; j <= 9; j++) {
      const idx = i * 10 + j;
      _vPt.fromBufferAttribute(sPos, idx).sub(_cPt).multiplyScalar(scale).add(_cPt);
      sPos.setXYZ(idx, _vPt.x, _vPt.y, _vPt.z);
    }
  }
  sPos.needsUpdate = true;
  stemGeo.computeVertexNormals();
  disposables.geometries.push(stemGeo);

  const stemMesh = new THREE.Mesh(stemGeo, stemMat);
  stemMesh.castShadow = true;
  group.add(stemMesh);

  // Snapped dry woody stem cut end cap
  const endPt = stemCurve.getPoint(1);
  const endTan = stemCurve.getTangent(1).normalize();
  const stemTipGeo = new THREE.CylinderGeometry(
    maxRadius * 0.11,
    maxRadius * 0.13,
    maxRadius * 0.07,
    8
  );
  disposables.geometries.push(stemTipGeo);
  const stemTip = new THREE.Mesh(stemTipGeo, cutTipMat);
  stemTip.position.copy(endPt);
  stemTip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), endTan);
  group.add(stemTip);

  // 4. Optional fresh glistening micro-dewdrops on hero chilies
  if (dewMat) {
    const p1 = spinePoint(0.54);
    const p2 = spinePoint(0.32);
    addWaterDewdrops(
      group,
      [
        {
          pos: [p1.x, p1.y + maxRadius * 0.62, p1.z + maxRadius * 0.65],
          radius: 0.022,
          normal: [0, 0.7, 0.72],
        },
        {
          pos: [p2.x, p2.y + maxRadius * 0.42, p2.z + maxRadius * 0.44],
          radius: 0.017,
          normal: [0, 0.68, 0.74],
        },
      ],
      dewMat,
      disposables
    );
  }

  return group;
}

/**
 * Builds a photorealistic multi-part Indian Kagzi Lemon:
 * 1. Asymmetric organic citrus body with smooth surface lobes, polar nipple & top recess
 * 2. Woody olive-brown pedicel calyx button at top pole
 * 3. Dried botanical tip scar at bottom pole
 * 4. 5 tiny glistening condensation water droplets
 */
function buildRealisticLemon(
  lemonMat: THREE.Material,
  calyxButtonMat: THREE.Material,
  woodyScarMat: THREE.Material,
  dewMat: THREE.Material,
  disposables: { geometries: THREE.BufferGeometry[] }
): THREE.Group {
  const group = new THREE.Group();

  const pts: THREE.Vector2[] = [];
  const segs = 44;
  const rx = 0.61;
  const ry = 0.76;

  for (let i = 0; i <= segs; i++) {
    const t = i / segs; // 0 = bottom pole, 1 = top pole
    const angle = t * Math.PI;
    // Characteristic citrus nipple pinch at bottom and subtle tapered crown at top
    const bottomPinch = Math.exp(-Math.pow((t - 0.075) * 11, 2)) * 0.055;
    const topPinch = Math.exp(-Math.pow((t - 0.93) * 11, 2)) * 0.042;
    const radius = Math.max(
      0.005,
      Math.sin(angle) * rx - (bottomPinch + topPinch) * 0.28
    );
    let y = -Math.cos(angle) * ry;
    if (t < 0.09) y -= (0.09 - t) * 0.58;
    if (t > 0.92) y += (t - 0.92) * 0.42;
    pts.push(new THREE.Vector2(radius, y));
  }

  const lemonGeo = new THREE.LatheGeometry(pts, 52);

  // Organic non-symmetrical fruit sculpting (real lemons are never mathematically perfect!)
  const pos = lemonGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const rXZ = Math.sqrt(x * x + z * z);
    if (rXZ > 0.01) {
      const theta = Math.atan2(z, x);
      const ny = y / ry;
      const env = Math.max(0, 1 - ny * ny * 0.85);
      // Gentle natural 4-section citrus bulge + subtle organic asymmetry
      const asym =
        1 +
        0.022 * Math.sin(theta * 2 + 0.6) * env +
        0.015 * Math.cos(theta * 3 - ny * 1.4) * env +
        0.012 * Math.sin(theta * 5 + ny * 2.2) * env;
      pos.setXYZ(i, x * asym, y, z * asym);
    }
  }
  pos.needsUpdate = true;
  lemonGeo.computeVertexNormals();
  lemonGeo.computeTangents();
  disposables.geometries.push(lemonGeo);

  const lemonMesh = new THREE.Mesh(lemonGeo, lemonMat);
  lemonMesh.castShadow = true;
  lemonMesh.receiveShadow = true;
  group.add(lemonMesh);

  // Top woody-green pedicel button scar where the lemon grew from the branch
  const buttonGeo = new THREE.CylinderGeometry(0.085, 0.125, 0.045, 10);
  disposables.geometries.push(buttonGeo);
  const topButton = new THREE.Mesh(buttonGeo, calyxButtonMat);
  topButton.position.set(0, ry + 0.02, 0);
  group.add(topButton);

  // Scalloped mini calyx ring around top button
  const miniRingGeo = new THREE.TorusGeometry(0.105, 0.022, 6, 12);
  miniRingGeo.rotateX(Math.PI / 2);
  disposables.geometries.push(miniRingGeo);
  const topRing = new THREE.Mesh(miniRingGeo, calyxButtonMat);
  topRing.position.set(0, ry + 0.005, 0);
  group.add(topRing);

  // Tiny dried bottom umbilicus scar right where the black thread exits
  const bottomScarGeo = new THREE.CylinderGeometry(0.055, 0.04, 0.03, 9);
  disposables.geometries.push(bottomScarGeo);
  const bottomScar = new THREE.Mesh(bottomScarGeo, woodyScarMat);
  bottomScar.position.set(0, -ry - 0.042, 0);
  group.add(bottomScar);

  // 5 fresh micro water dewdrops clinging naturally to the waxy dimpled skin
  addWaterDewdrops(
    group,
    [
      { pos: [0.34, 0.28, 0.44], radius: 0.032, normal: [0.55, 0.36, 0.74] },
      { pos: [0.43, -0.08, 0.41], radius: 0.024, normal: [0.7, -0.1, 0.7] },
      { pos: [-0.28, 0.35, 0.43], radius: 0.027, normal: [-0.46, 0.45, 0.76] },
      { pos: [0.16, -0.34, 0.48], radius: 0.022, normal: [0.26, -0.46, 0.85] },
      { pos: [-0.42, -0.16, 0.38], radius: 0.02, normal: [-0.72, -0.22, 0.65] },
    ],
    dewMat,
    disposables
  );

  return group;
}

/**
 * Builds a realistic multi-wrap hand-tied braided cotton thread knot
 */
function buildThreadKnot(
  scale: number,
  threadMat: THREE.Material,
  disposables: { geometries: THREE.BufferGeometry[] }
): THREE.Group {
  const knotGroup = new THREE.Group();
  const torusGeo = new THREE.TorusGeometry(0.095 * scale, 0.036 * scale, 10, 22);
  disposables.geometries.push(torusGeo);

  const loopA = new THREE.Mesh(torusGeo, threadMat);
  loopA.rotation.set(0.75, 0.35, 0.22);

  const loopB = new THREE.Mesh(torusGeo, threadMat);
  loopB.rotation.set(-0.65, 1.15, 0.58);
  loopB.position.set(0.018 * scale, -0.026 * scale, 0.01 * scale);

  const loopC = new THREE.Mesh(torusGeo, threadMat);
  loopC.rotation.set(1.22, -0.52, 0.88);
  loopC.position.set(-0.018 * scale, 0.022 * scale, -0.01 * scale);

  const collarGeo = new THREE.TorusGeometry(0.062 * scale, 0.028 * scale, 8, 18);
  collarGeo.rotateX(Math.PI / 2);
  disposables.geometries.push(collarGeo);
  const collar = new THREE.Mesh(collarGeo, threadMat);
  collar.position.set(0, -0.055 * scale, 0);

  knotGroup.add(loopA, loopB, loopC, collar);
  return knotGroup;
}

/**
 * Builds realistic splayed frayed cotton tassel strands below the bottom knot
 */
function buildFrayedTassel(
  threadMat: THREE.Material,
  disposables: { geometries: THREE.BufferGeometry[] }
): THREE.Group {
  const tassel = new THREE.Group();
  const strandDefs = [
    { dx: -0.055, dz: 0.035, len: 0.32, r: 0.012 },
    { dx: 0.048, dz: 0.042, len: 0.36, r: 0.011 },
    { dx: -0.024, dz: -0.052, len: 0.29, r: 0.01 },
    { dx: 0.062, dz: -0.028, len: 0.26, r: 0.0095 },
    { dx: 0.008, dz: 0.015, len: 0.38, r: 0.012 },
  ];

  for (const s of strandDefs) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(s.dx * 0.35, -s.len * 0.42, s.dz * 0.35),
      new THREE.Vector3(s.dx * 0.85, -s.len * 0.78, s.dz * 0.85),
      new THREE.Vector3(s.dx * 1.15, -s.len, s.dz * 1.15),
    ]);
    const geo = new THREE.TubeGeometry(curve, 10, s.r, 6, false);
    disposables.geometries.push(geo);
    const mesh = new THREE.Mesh(geo, threadMat);
    tassel.add(mesh);
  }
  return tassel;
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
    renderer.toneMappingExposure = 0.94;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);

    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Procedural Studio Environment Map (always generated for crisp dielectric reflections)
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 40);
    camera.position.set(0, 0.15, 8.5);
    camera.lookAt(0, 0.15, 0);

    // =========================================================================
    // MACRO STUDIO PHOTOGRAPHY LIGHTING RIG (Rich Contrast Key + Soft Fill + Rim)
    // =========================================================================
    const hemiLight = new THREE.HemisphereLight(0xd4e5ff, 0x120e08, 0.32);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1d6, 1.88);
    keyLight.position.set(3.6, 5.1, 5.4);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(2048, 2048);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 16;
      const d = 3.4;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0004;
      keyLight.shadow.normalBias = 0.018;
      keyLight.shadow.radius = 3.5;
    }
    scene.add(keyLight);

    // Subtle cool opposite bounce fill preserving rich deep shadow modeling
    const fillLight = new THREE.DirectionalLight(0x8cb0ff, 0.24);
    fillLight.position.set(-4.6, 0.8, 3.6);
    scene.add(fillLight);

    // Warm crisp studio rim backlight to sculpt translucent dark-green tips & golden lemon edges
    const rimLight = new THREE.PointLight(0xfff2d6, 4.6, 16, 1.6);
    rimLight.position.set(-2.4, 3.1, -3.4);
    scene.add(rimLight);

    // Secondary softbox specular highlights across glossy waxy skins (GPU only)
    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softboxKey = new THREE.RectAreaLight(0xfff5e0, 1.95, 2.8, 4.2);
      softboxKey.position.set(3.4, 2.2, 4.2);
      softboxKey.lookAt(0, 0.1, 0);
      scene.add(softboxKey);

      const softboxRim = new THREE.RectAreaLight(0xd4e2ff, 0.95, 2.0, 3.8);
      softboxRim.position.set(-3.6, 1.4, 2.8);
      softboxRim.lookAt(0, 0.0, 0);
      scene.add(softboxRim);
    }

    const disposables: {
      geometries: THREE.BufferGeometry[];
      materials: THREE.Material[];
      textures: THREE.Texture[];
    } = { geometries: [], materials: [], textures: [] };

    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    // =========================================================================
    // PROCEDURAL BOTANICAL PBR TEXTURES & MATERIALS
    // =========================================================================
    const lemonMaps = createLemonPBRMaps(maxAniso);
    const threadMaps = createBraidedThreadPBRMaps(maxAniso);

    // 7 distinct deep, dark market-fresh Indian Hari Mirch green color/normal/roughness variants
    const chiliPalettes: Array<[string, string, string, number]> = [
      ['#0a480b', '#186b12', '#032104', 1103],
      ['#063b09', '#12590f', '#021a03', 2207],
      ['#0e520c', '#1e7614', '#042605', 3313],
      ['#08420a', '#156211', '#031e04', 4421],
      ['#0c4c0b', '#1b7013', '#042405', 5527],
      ['#053408', '#0e500d', '#021503', 6637],
      ['#0d500c', '#1c7314', '#042505', 7741],
    ];

    const chiliMapsList = chiliPalettes.map(([base, hi, tip, seed]) =>
      createChiliPBRMaps(base, hi, tip, seed, maxAniso)
    );

    disposables.textures.push(
      lemonMaps.map,
      lemonMaps.normalMap,
      lemonMaps.roughnessMap,
      threadMaps.map,
      threadMaps.normalMap
    );
    chiliMapsList.forEach((m) =>
      disposables.textures.push(m.map, m.normalMap, m.roughnessMap)
    );

    // Cotton braided thread with fibrous velvet sheen
    const threadMat = new THREE.MeshPhysicalMaterial({
      map: threadMaps.map,
      normalMap: threadMaps.normalMap,
      normalScale: new THREE.Vector2(1.15, 1.15),
      color: 0x1a1c24,
      roughness: 0.94,
      metalness: 0.0,
      sheen: 0.65,
      sheenRoughness: 0.86,
      sheenColor: new THREE.Color(0x5a6270),
      envMapIntensity: 0.2,
    });

    // Matte fibrous dark olive-green calyx & woody stem (rich roughness contrast vs glossy chili body)
    const calyxMat = new THREE.MeshStandardMaterial({
      color: 0x1b3b0d,
      roughness: 0.85,
      metalness: 0.0,
      envMapIntensity: 0.2,
    });

    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x244a11,
      roughness: 0.83,
      metalness: 0.0,
      envMapIntensity: 0.2,
    });

    const cutTipMat = new THREE.MeshStandardMaterial({
      color: 0x6b5c37,
      roughness: 0.94,
      metalness: 0.0,
      envMapIntensity: 0.16,
    });

    const lemonCalyxButtonMat = new THREE.MeshStandardMaterial({
      color: 0x3a4314,
      roughness: 0.88,
      metalness: 0.0,
      envMapIntensity: 0.18,
    });

    const lemonScarMat = new THREE.MeshStandardMaterial({
      color: 0x433114,
      roughness: 0.92,
      metalness: 0.0,
      envMapIntensity: 0.16,
    });

    // Fresh glistening condensation water droplets
    const dewMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.03,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      ior: 1.33,
      reflectivity: 0.9,
      transparent: true,
      opacity: 0.68,
      envMapIntensity: 1.45,
      depthWrite: false,
    });

    // Deep dark glossy waxy Indian green chili PBR materials + rich forest-emerald backlit SSS
    const chiliMats = chiliMapsList.map((maps) => {
      const mat = new THREE.MeshPhysicalMaterial({
        map: maps.map,
        normalMap: maps.normalMap,
        normalScale: new THREE.Vector2(0.95, 0.95),
        roughnessMap: maps.roughnessMap,
        roughness: 1.0,
        metalness: 0.0,
        clearcoat: 0.72,
        clearcoatRoughness: 0.15,
        specularIntensity: 0.8,
        envMapIntensity: 0.26,
      });
      applyBotanicalSubsurface(mat, 0x1e8010, 0.15);
      return mat;
    });

    // Dimpled waxy deep golden-yellow lemon PBR material + rich warm amber-gold backlit SSS
    const lemonMat = new THREE.MeshPhysicalMaterial({
      map: lemonMaps.map,
      normalMap: lemonMaps.normalMap,
      normalScale: new THREE.Vector2(1.22, 1.22),
      roughnessMap: lemonMaps.roughnessMap,
      roughness: 1.0,
      metalness: 0.0,
      clearcoat: 0.34,
      clearcoatRoughness: 0.28,
      specularIntensity: 0.68,
      envMapIntensity: 0.24,
    });
    applyBotanicalSubsurface(lemonMat, 0xc96e00, 0.16);

    disposables.materials.push(
      threadMat,
      calyxMat,
      stemMat,
      cutTipMat,
      lemonCalyxButtonMat,
      lemonScarMat,
      dewMat,
      lemonMat,
      ...chiliMats
    );

    // =========================================================================
    // AUTHENTIC 7-CHILI + 1-LEMON COUPLED PENDULUM CHAIN HIERARCHY
    // Anchor at top edge (y = +2.98) -> 7 alternating fresh green chilies -> plump lemon -> knot + frayed tassel
    // =========================================================================
    const ANCHOR_Y = 2.98;

    // 10 Physics Nodes:
    // 0: Ceiling Anchor (pinned)
    // 1..7: 7 Traditional Stacked Indian Green Chilies
    // 8: Plump Sun-Ripe Kagzi Lemon (Heavy bob)
    // 9: Bottom Knot + Frayed Cotton Tassel Tail
    const restLengths = [0.98, 0.28, 0.27, 0.27, 0.26, 0.26, 0.26, 0.95, 0.62];
    const nodeMasses = [0, 0.85, 0.9, 0.9, 0.88, 0.88, 0.85, 0.85, 2.75, 0.32];

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

    // Dynamic Multi-Ply Braided Thread Mesh updated in-place along CatmullRomCurve3
    const ropeSegments = 36;
    const ropeRadial = 8;
    const ropeRadius = 0.03;
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
    ropeMesh.castShadow = true;
    ropeMesh.frustumCulled = false;
    scene.add(ropeMesh);

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

        const r = t > 0.92 ? ropeRadius * (1 - (t - 0.92) * 7.5) : ropeRadius;

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

    // Hand-tied Top Knot right above Chili 1
    const topKnot = buildThreadKnot(1.0, threadMat, disposables);
    scene.add(topKnot);

    // Assemble 7 Natural Alternating Indian Green Chilies (organic criss-cross spiral)
    const chiliSpecs = [
      { length: 1.98, radius: 0.195, bend: 0.2, sCurve: 0.04, baseYaw: 0.12, baseRoll: -0.07, basePitch: 0.04, offsetX: -0.04, dew: true },
      { length: 1.88, radius: 0.21, bend: 0.17, sCurve: -0.035, baseYaw: Math.PI - 0.22, baseRoll: 0.05, basePitch: -0.03, offsetX: 0.04, dew: false },
      { length: 1.76, radius: 0.19, bend: 0.18, sCurve: 0.045, baseYaw: -0.32, baseRoll: -0.05, basePitch: 0.06, offsetX: -0.02, dew: true },
      { length: 1.84, radius: 0.205, bend: 0.16, sCurve: -0.04, baseYaw: Math.PI + 0.34, baseRoll: 0.06, basePitch: -0.04, offsetX: 0.03, dew: false },
      { length: 1.66, radius: 0.185, bend: 0.15, sCurve: 0.035, baseYaw: 0.56, baseRoll: -0.04, basePitch: 0.05, offsetX: -0.02, dew: false },
      { length: 1.58, radius: 0.195, bend: 0.14, sCurve: -0.03, baseYaw: -Math.PI + 0.58, baseRoll: 0.04, basePitch: -0.06, offsetX: 0.02, dew: false },
      { length: 1.44, radius: 0.185, bend: 0.13, sCurve: 0.03, baseYaw: 1.18, baseRoll: 0.07, basePitch: 0.12, offsetX: -0.01, dew: true },
    ];

    const chiliAnchors: THREE.Group[] = chiliSpecs.map((spec, idx) => {
      const holder = new THREE.Group();
      const chili = buildRealisticChili(
        spec.length,
        spec.radius,
        spec.bend,
        spec.sCurve,
        chiliMats[idx],
        calyxMat,
        stemMat,
        cutTipMat,
        spec.dew ? dewMat : null,
        disposables
      );
      chili.position.x = spec.offsetX;
      chili.rotation.set(spec.basePitch, spec.baseYaw, spec.baseRoll);
      holder.add(chili);
      scene.add(holder);
      return holder;
    });

    // Assemble Photorealistic Lemon + Permanently Anchored Bottom Knot + Frayed Cotton Tassel
    const lemonHolder = new THREE.Group();
    const lemonGroup = buildRealisticLemon(
      lemonMat,
      lemonCalyxButtonMat,
      lemonScarMat,
      dewMat,
      disposables
    );
    lemonHolder.add(lemonGroup);

    const bottomKnot = buildThreadKnot(0.92, threadMat, disposables);
    bottomKnot.position.set(0, -0.82, 0);
    lemonHolder.add(bottomKnot);

    const tassel = buildFrayedTassel(threadMat, disposables);
    tassel.position.set(0, -0.88, 0);
    lemonHolder.add(tassel);

    scene.add(lemonHolder);

    // Generous Invisible Collision Proxy for Effortless Grabbing & Hover Breeze
    const hitProxyGeo = new THREE.CylinderGeometry(1.15, 0.95, 4.7, 12);
    const hitProxyMat = new THREE.MeshBasicMaterial({ visible: false });
    disposables.geometries.push(hitProxyGeo);
    disposables.materials.push(hitProxyMat);
    const hitProxy = new THREE.Mesh(hitProxyGeo, hitProxyMat);
    hitProxy.position.set(0, -0.35, 0);
    scene.add(hitProxy);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // =========================================================================
    // INTERACTIVE PHYSICS STATE (Drag, Flick, Twist Spin, Hover Breeze)
    // =========================================================================
    let dragging = false;
    let activePointerId: number | null = null;
    let grabbedNodeIndex = 8; // Default lemon bob
    const dragTarget = new THREE.Vector3();
    const lastDragWorld = new THREE.Vector3();
    const pointerVelocity = new THREE.Vector3();
    let lastPointerTime = performance.now();

    let twistAngle = 0;
    let twistVelocity = prefersReducedMotion ? 0 : 0.42;
    let lastHoverX = 0;
    let wasHoveringMesh = false;

    const applyImpulse = (vx: number, vz: number, spin: number) => {
      for (let i = 1; i < chain.length; i++) {
        const weight = i / (chain.length - 1);
        chain[i].prev.x -= vx * weight * 0.08;
        chain[i].prev.z -= vz * weight * 0.06;
      }
      twistVelocity = THREE.MathUtils.clamp(twistVelocity + spin, -7, 7);
    };
    impulseRef.current = applyImpulse;

    if (!prefersReducedMotion) {
      applyImpulse(0.9, 0.25, 0.55);
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
        let bestIdx = 8;
        let bestDist = Infinity;
        for (let i = 1; i <= 8; i++) {
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

          dragTarget.copy(_intersectPt);
          dragTarget.x = THREE.MathUtils.clamp(dragTarget.x, -4.4, 4.4);
          dragTarget.y = THREE.MathUtils.clamp(dragTarget.y, -2.2, 2.3);

          twistVelocity += pointerVelocity.x * 0.012;

          lastDragWorld.copy(_intersectPt);
          lastPointerTime = now;
        }
        return;
      }

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
          const nudge = THREE.MathUtils.clamp(dx * 0.024, -0.85, 0.85);
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
      const gravity = -19.2;
      const damping = 0.992;

      for (let step = 0; step < subSteps; step++) {
        for (let i = 1; i < chain.length; i++) {
          const node = chain[i];
          const vx = (node.pos.x - node.prev.x) * damping;
          const vy = (node.pos.y - node.prev.y) * damping;
          const vz = (node.pos.z - node.prev.z) * damping;

          node.prev.copy(node.pos);

          const breeze =
            !dragging && !prefersReducedMotion
              ? Math.sin(elapsed * 1.1 + i * 0.32) * 0.22
              : 0;

          node.pos.x += vx + breeze * subDt * subDt;
          node.pos.y += vy + gravity * subDt * subDt;
          node.pos.z += vz + Math.cos(elapsed * 0.8 + i * 0.4) * 0.09 * subDt * subDt;
        }

        if (dragging) {
          const grabbed = chain[grabbedNodeIndex];
          grabbed.pos.lerp(dragTarget, 0.45);
          grabbed.prev.lerp(dragTarget, 0.35);
        }

        // 6 constraint iterations for taut natural cotton cord hang
        for (let iter = 0; iter < 6; iter++) {
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
      const twistSpring = -2.5 * twistAngle - 1.3 * twistVelocity;
      twistVelocity += twistSpring * Math.min(dt, 0.033);
      twistAngle += twistVelocity * Math.min(dt, 0.033);

      // Keep bottom tail node cleanly trailing below the lemon axis
      _vDir.subVectors(chain[8].pos, chain[7].pos).normalize();
      chain[9].pos.lerp(
        _pt.copy(chain[8].pos).addScaledVector(_vDir, restLengths[8]),
        0.55
      );

      updateRopeGeometry();

      // Top Knot locked accurately along rope tangent just above Chili 1
      _vDir.subVectors(chain[0].pos, chain[1].pos).normalize();
      topKnot.position.copy(chain[1].pos).addScaledVector(_vDir, 0.22);
      topKnot.rotation.y = twistAngle * 0.45;

      // Orient each of the 7 chilies cleanly perpendicular to local thread tangent + torsional spin
      for (let c = 0; c < chiliAnchors.length; c++) {
        const nodeIdx = c + 1;
        const holder = chiliAnchors[c];
        holder.position.copy(chain[nodeIdx].pos);

        _vDir.subVectors(chain[nodeIdx + 1].pos, chain[nodeIdx - 1].pos).normalize();
        _quat.setFromUnitVectors(_vUp, _vDir);
        holder.quaternion.copy(_quat);
        holder.rotateY(twistAngle * (0.55 + c * 0.08));
      }

      // Lemon Bob (with anchored Bottom Knot & Frayed Tassel) aligned to lower rope tangent
      lemonHolder.position.copy(chain[8].pos);
      _vDir.subVectors(chain[8].pos, chain[7].pos).normalize();
      _quat.setFromUnitVectors(_vUp, _vDir);
      lemonHolder.quaternion.copy(_quat);
      lemonHolder.rotateY(twistAngle * 1.15);

      hitProxy.position.set(
        (chain[3].pos.x + chain[8].pos.x) * 0.5,
        (chain[1].pos.y + chain[8].pos.y) * 0.5,
        (chain[3].pos.z + chain[8].pos.z) * 0.5
      );
    };

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
