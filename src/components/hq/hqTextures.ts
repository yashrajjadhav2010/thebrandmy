import * as THREE from 'three';

function createSeededRandom(seedStart: number) {
  let seed = seedStart % 2147483647;
  if (seed <= 0) seed += 2147483646;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export interface HQTextureSet {
  glassMap: THREE.CanvasTexture;
  glassEmissiveMap: THREE.CanvasTexture;
  glassRoughnessMap: THREE.CanvasTexture;
  stoneMap: THREE.CanvasTexture;
  stoneRoughnessMap: THREE.CanvasTexture;
  titaniumMap: THREE.CanvasTexture;
  titaniumRoughnessMap: THREE.CanvasTexture;
  solarMap: THREE.CanvasTexture;
  plazaMap: THREE.CanvasTexture;
  indianFlagMap: THREE.CanvasTexture;
  galleryArtMap: THREE.CanvasTexture;
  monitorScreenMap: THREE.CanvasTexture;
  commandScreenMap: THREE.CanvasTexture;
  serverRackFrontMap: THREE.CanvasTexture;
  holoProjectionMap: THREE.CanvasTexture;
  nexusSpireLogoMap: THREE.CanvasTexture;
  nexusLeftFacadeMap: THREE.CanvasTexture;
  nexusRightFacadeMap: THREE.CanvasTexture;
  nexusBannerMap: THREE.CanvasTexture;
  shivajiPlaqueMap: THREE.CanvasTexture;
  shivajiFaceMap: THREE.CanvasTexture;
  shivajiFaceBumpMap: THREE.CanvasTexture;
  shivajiArmorMap: THREE.CanvasTexture;
  shivajiArmorBumpMap: THREE.CanvasTexture;
  jiretopSilkMap: THREE.CanvasTexture;
  jiretopSilkBumpMap: THREE.CanvasTexture;
  prabhavaliBrassMap: THREE.CanvasTexture;
  prabhavaliBrassBumpMap: THREE.CanvasTexture;
  moonMap: THREE.CanvasTexture;
  waterNormalMap: THREE.DataTexture;
  dispose: () => void;
}

/**
 * Generates all architectural PBR textures procedurally in-memory (Zero external URLs / 404s)
 */
export function createHQTextures(maxAnisotropy: number): HQTextureSet {
  const rand = createSeededRandom(9081);

  // 1. ARCHITECTURAL CURTAIN-WALL GLASS (Albedo + Night Interior Emissive + Roughness)
  const gW = 512;
  const gH = 512;
  const glassCanvas = document.createElement('canvas');
  glassCanvas.width = gW;
  glassCanvas.height = gH;
  const gCtx = glassCanvas.getContext('2d')!;

  const emissiveCanvas = document.createElement('canvas');
  emissiveCanvas.width = gW;
  emissiveCanvas.height = gH;
  const eCtx = emissiveCanvas.getContext('2d')!;

  const gRoughCanvas = document.createElement('canvas');
  gRoughCanvas.width = gW;
  gRoughCanvas.height = gH;
  const grCtx = gRoughCanvas.getContext('2d')!;

  // Base cool architectural low-iron reflective glass tint
  const gGrad = gCtx.createLinearGradient(0, 0, 0, gH);
  gGrad.addColorStop(0, '#506478');
  gGrad.addColorStop(0.5, '#3b4e63');
  gGrad.addColorStop(1, '#2b394a');
  gCtx.fillStyle = gGrad;
  gCtx.fillRect(0, 0, gW, gH);

  eCtx.fillStyle = '#000000';
  eCtx.fillRect(0, 0, gW, gH);

  // Smooth glass baseline roughness (~0.10)
  grCtx.fillStyle = 'rgb(28, 28, 28)';
  grCtx.fillRect(0, 0, gW, gH);

  const floors = 8;
  const bays = 16;
  const floorH = gH / floors;
  const bayW = gW / bays;

  for (let f = 0; f < floors; f++) {
    const y = f * floorH;
    // Floor slab spandrel band (darker anodized titanium behind glass)
    gCtx.fillStyle = '#1b222c';
    gCtx.fillRect(0, y, gW, floorH * 0.22);

    // Subtle champagne horizontal transom line
    gCtx.fillStyle = '#7e7668';
    gCtx.fillRect(0, y + floorH * 0.22, gW, 2);

    // Spandrels are matte compared to clear vision glass
    grCtx.fillStyle = 'rgb(122, 122, 122)';
    grCtx.fillRect(0, y, gW, floorH * 0.24);

    // Realistic architectural interior floor glow (calm warm daylight-balanced office interiors)
    for (let b = 0; b < bays; b++) {
      const x = b * bayW;
      const litChance = rand();

      // Subtle daytime depth variation per window bay
      const tintShift = Math.round((rand() - 0.5) * 14);
      gCtx.fillStyle = `rgba(${68 + tintShift}, ${90 + tintShift}, ${114 + tintShift}, 0.35)`;
      gCtx.fillRect(x + 2, y + floorH * 0.24, bayW - 4, floorH * 0.74);

      // Architectural warm interior illumination visible in night mode
      if (litChance > 0.28) {
        const brightness = litChance > 0.72 ? 0.92 : litChance > 0.48 ? 0.56 : 0.28;
        const innerY = y + floorH * 0.26;
        const innerH = floorH * 0.70;
        const roomGrad = eCtx.createLinearGradient(0, innerY, 0, innerY + innerH);
        // Warm recessed architectural ceiling wash fading gently toward floor
        const rCol = Math.round(255 * brightness);
        const gCol = Math.round(218 * brightness);
        const bCol = Math.round(162 * brightness);
        roomGrad.addColorStop(0.0, `rgb(${rCol}, ${gCol}, ${bCol})`);
        roomGrad.addColorStop(0.45, `rgb(${Math.round(rCol * 0.78)}, ${Math.round(gCol * 0.76)}, ${Math.round(bCol * 0.72)})`);
        roomGrad.addColorStop(1.0, `rgb(${Math.round(rCol * 0.34)}, ${Math.round(gCol * 0.35)}, ${Math.round(bCol * 0.38)})`);
        eCtx.fillStyle = roomGrad;
        eCtx.fillRect(x + 2.5, innerY, bayW - 5, innerH);
      }
    }
  }

  // Crisp vertical architectural curtain-wall mullions
  for (let b = 0; b <= bays; b++) {
    const x = b * bayW;
    const isMajor = b % 4 === 0;
    const w = isMajor ? 4 : 2;
    gCtx.fillStyle = isMajor ? '#242a33' : '#3a4350';
    gCtx.fillRect(x - w / 2, 0, w, gH);

    eCtx.fillStyle = '#000000';
    eCtx.fillRect(x - w / 2, 0, w, gH);

    grCtx.fillStyle = 'rgb(148, 148, 148)';
    grCtx.fillRect(x - w / 2, 0, w, gH);
  }

  const glassMap = new THREE.CanvasTexture(glassCanvas);
  glassMap.colorSpace = THREE.SRGBColorSpace;
  glassMap.wrapS = THREE.RepeatWrapping;
  glassMap.wrapT = THREE.RepeatWrapping;
  glassMap.anisotropy = maxAnisotropy;

  const glassEmissiveMap = new THREE.CanvasTexture(emissiveCanvas);
  glassEmissiveMap.colorSpace = THREE.SRGBColorSpace;
  glassEmissiveMap.wrapS = THREE.RepeatWrapping;
  glassEmissiveMap.wrapT = THREE.RepeatWrapping;
  glassEmissiveMap.anisotropy = maxAnisotropy;

  const glassRoughnessMap = new THREE.CanvasTexture(gRoughCanvas);
  glassRoughnessMap.wrapS = THREE.RepeatWrapping;
  glassRoughnessMap.wrapT = THREE.RepeatWrapping;
  glassRoughnessMap.anisotropy = maxAnisotropy;

  // 2. WARM ARCHITECTURAL TRAVERTINE STONE (Albedo + Roughness)
  const sSize = 512;
  const stoneCanvas = document.createElement('canvas');
  stoneCanvas.width = sSize;
  stoneCanvas.height = sSize;
  const sCtx = stoneCanvas.getContext('2d')!;

  const sRoughCanvas = document.createElement('canvas');
  sRoughCanvas.width = sSize;
  sRoughCanvas.height = sSize;
  const srCtx = sRoughCanvas.getContext('2d')!;

  sCtx.fillStyle = '#ddd7cc';
  sCtx.fillRect(0, 0, sSize, sSize);

  srCtx.fillStyle = 'rgb(184, 184, 184)';
  srCtx.fillRect(0, 0, sSize, sSize);

  // Subtle horizontal travertine sedimentary veining
  for (let i = 0; i < 160; i++) {
    const vy = rand() * sSize;
    const vh = 1 + rand() * 5;
    sCtx.fillStyle =
      rand() > 0.5 ? 'rgba(186, 178, 165, 0.24)' : 'rgba(246, 243, 236, 0.26)';
    sCtx.fillRect(0, vy, sSize, vh);
  }

  // Fine architectural ashlar stone joint grid
  const rows = 8;
  const cols = 4;
  const rH = sSize / rows;
  const cW = sSize / cols;
  sCtx.strokeStyle = 'rgba(128, 122, 112, 0.26)';
  sCtx.lineWidth = 1.5;
  srCtx.strokeStyle = 'rgb(228, 228, 228)';
  srCtx.lineWidth = 2;

  for (let r = 0; r < rows; r++) {
    const y = r * rH;
    sCtx.beginPath();
    sCtx.moveTo(0, y);
    sCtx.lineTo(sSize, y);
    sCtx.stroke();

    srCtx.beginPath();
    srCtx.moveTo(0, y);
    srCtx.lineTo(sSize, y);
    srCtx.stroke();

    const offset = (r % 2) * (cW * 0.5);
    for (let c = 0; c <= cols; c++) {
      const x = (c * cW + offset) % sSize;
      // Subtle block tone variation
      const delta = Math.round((rand() - 0.5) * 10);
      sCtx.fillStyle = `rgba(${216 + delta}, ${210 + delta}, ${200 + delta}, 0.25)`;
      sCtx.fillRect(x + 1, y + 1, cW - 2, rH - 2);

      sCtx.beginPath();
      sCtx.moveTo(x, y);
      sCtx.lineTo(x, y + rH);
      sCtx.stroke();
    }
  }

  const stoneMap = new THREE.CanvasTexture(stoneCanvas);
  stoneMap.colorSpace = THREE.SRGBColorSpace;
  stoneMap.wrapS = THREE.RepeatWrapping;
  stoneMap.wrapT = THREE.RepeatWrapping;
  stoneMap.repeat.set(3, 3);
  stoneMap.anisotropy = maxAnisotropy;

  const stoneRoughnessMap = new THREE.CanvasTexture(sRoughCanvas);
  stoneRoughnessMap.wrapS = THREE.RepeatWrapping;
  stoneRoughnessMap.wrapT = THREE.RepeatWrapping;
  stoneRoughnessMap.repeat.set(3, 3);
  stoneRoughnessMap.anisotropy = maxAnisotropy;

  // 3. BRUSHED DARK TITANIUM ARCHITECTURAL CLADDING
  const tSize = 256;
  const tiCanvas = document.createElement('canvas');
  tiCanvas.width = tSize;
  tiCanvas.height = tSize;
  const tiCtx = tiCanvas.getContext('2d')!;

  const tiRoughCanvas = document.createElement('canvas');
  tiRoughCanvas.width = tSize;
  tiRoughCanvas.height = tSize;
  const tirCtx = tiRoughCanvas.getContext('2d')!;

  tiCtx.fillStyle = '#262c36';
  tiCtx.fillRect(0, 0, tSize, tSize);

  tirCtx.fillStyle = 'rgb(96, 96, 96)';
  tirCtx.fillRect(0, 0, tSize, tSize);

  // Anisotropic brushed metal micro-streaks
  for (let i = 0; i < 240; i++) {
    const x = rand() * tSize;
    tiCtx.fillStyle =
      rand() > 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.06)';
    tiCtx.fillRect(x, 0, 1.2, tSize);

    tirCtx.fillStyle =
      rand() > 0.5 ? 'rgba(130,130,130,0.22)' : 'rgba(65,65,65,0.22)';
    tirCtx.fillRect(x, 0, 1.5, tSize);
  }

  // Architectural metal cladding panel seams
  tiCtx.strokeStyle = 'rgba(10, 13, 18, 0.55)';
  tiCtx.lineWidth = 1.5;
  for (let p = 0; p < 4; p++) {
    const pos = (p * tSize) / 4;
    tiCtx.beginPath();
    tiCtx.moveTo(0, pos);
    tiCtx.lineTo(tSize, pos);
    tiCtx.stroke();
    tiCtx.beginPath();
    tiCtx.moveTo(pos, 0);
    tiCtx.lineTo(pos, tSize);
    tiCtx.stroke();
  }

  const titaniumMap = new THREE.CanvasTexture(tiCanvas);
  titaniumMap.colorSpace = THREE.SRGBColorSpace;
  titaniumMap.wrapS = THREE.RepeatWrapping;
  titaniumMap.wrapT = THREE.RepeatWrapping;
  titaniumMap.repeat.set(2, 2);
  titaniumMap.anisotropy = maxAnisotropy;

  const titaniumRoughnessMap = new THREE.CanvasTexture(tiRoughCanvas);
  titaniumRoughnessMap.wrapS = THREE.RepeatWrapping;
  titaniumRoughnessMap.wrapT = THREE.RepeatWrapping;
  titaniumRoughnessMap.repeat.set(2, 2);
  titaniumRoughnessMap.anisotropy = maxAnisotropy;

  // 4. ARCHITECTURAL PHOTOVOLTAIC SOLAR LOUVER TEXTURE
  const solSize = 256;
  const solCanvas = document.createElement('canvas');
  solCanvas.width = solSize;
  solCanvas.height = solSize;
  const solCtx = solCanvas.getContext('2d')!;

  solCtx.fillStyle = '#141d2e';
  solCtx.fillRect(0, 0, solSize, solSize);

  const cellStep = 32;
  for (let y = 0; y < solSize; y += cellStep) {
    for (let x = 0; x < solSize; x += cellStep) {
      solCtx.fillStyle = '#19253b';
      solCtx.fillRect(x + 2, y + 2, cellStep - 4, cellStep - 4);
      // Subtle champagne-silver solar busbar lines
      solCtx.fillStyle = 'rgba(196, 182, 152, 0.25)';
      solCtx.fillRect(x + cellStep * 0.33, y + 2, 1, cellStep - 4);
      solCtx.fillRect(x + cellStep * 0.66, y + 2, 1, cellStep - 4);
    }
  }

  const solarMap = new THREE.CanvasTexture(solCanvas);
  solarMap.colorSpace = THREE.SRGBColorSpace;
  solarMap.wrapS = THREE.RepeatWrapping;
  solarMap.wrapT = THREE.RepeatWrapping;
  solarMap.repeat.set(4, 2);
  solarMap.anisotropy = maxAnisotropy;

  // 5. RADIAL ARCHITECTURAL PLAZA PAVING MAP
  const pSize = 512;
  const plazaCanvas = document.createElement('canvas');
  plazaCanvas.width = pSize;
  plazaCanvas.height = pSize;
  const pCtx = plazaCanvas.getContext('2d')!;

  pCtx.fillStyle = '#cbc4b8';
  pCtx.fillRect(0, 0, pSize, pSize);

  // Subtle concentric paving courses & stone grain
  const cx = pSize / 2;
  const cy = pSize / 2;
  pCtx.strokeStyle = 'rgba(116, 110, 102, 0.24)';
  pCtx.lineWidth = 1.4;
  for (let r = 24; r < pSize * 0.5; r += 22) {
    pCtx.beginPath();
    pCtx.arc(cx, cy, r, 0, Math.PI * 2);
    pCtx.stroke();
  }
  for (let a = 0; a < 36; a++) {
    const theta = (a / 36) * Math.PI * 2;
    pCtx.beginPath();
    pCtx.moveTo(cx + Math.cos(theta) * 24, cy + Math.sin(theta) * 24);
    pCtx.lineTo(cx + Math.cos(theta) * (pSize * 0.5), cy + Math.sin(theta) * (pSize * 0.5));
    pCtx.stroke();
  }

  const plazaMap = new THREE.CanvasTexture(plazaCanvas);
  plazaMap.colorSpace = THREE.SRGBColorSpace;
  plazaMap.anisotropy = maxAnisotropy;

  // 6. SUBTLE ARCHITECTURAL REFLECTING WATER NORMAL MAP (DataTexture)
  const wSize = 128;
  const wData = new Uint8Array(wSize * wSize * 4);
  for (let y = 0; y < wSize; y++) {
    for (let x = 0; x < wSize; x++) {
      const u = (x / wSize) * Math.PI * 2;
      const v = (y / wSize) * Math.PI * 2;
      const dx =
        (Math.cos(u * 4 + v * 2) * 0.08 + Math.cos(u * 9 - v * 5) * 0.04) * 0.5;
      const dy =
        (Math.sin(u * 3 + v * 5) * 0.08 + Math.sin(u * 7 + v * 8) * 0.04) * 0.5;
      const nx = -dx;
      const ny = dy;
      const nz = 1.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      const idx = (y * wSize + x) * 4;
      wData[idx] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      wData[idx + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      wData[idx + 2] = Math.round(((nz / len) * 0.5 + 0.5) * 255);
      wData[idx + 3] = 255;
    }
  }
  const waterNormalMap = new THREE.DataTexture(
    wData,
    wSize,
    wSize,
    THREE.RGBAFormat
  );
  waterNormalMap.flipY = true;
  waterNormalMap.wrapS = THREE.RepeatWrapping;
  waterNormalMap.wrapT = THREE.RepeatWrapping;
  waterNormalMap.repeat.set(6, 6);
  waterNormalMap.needsUpdate = true;

  // 7. OFFICIAL 3:2 INDIAN NATIONAL FLAG (TIRANGA WITH 24-SPOKE ASHOKA CHAKRA)
  const fW = 540;
  const fH = 360;
  const flagCanvas = document.createElement('canvas');
  flagCanvas.width = fW;
  flagCanvas.height = fH;
  const fCtx = flagCanvas.getContext('2d')!;

  const bandH = fH / 3;
  // Deep Saffron (Kesari), Pure White, India Green
  fCtx.fillStyle = '#FF9933';
  fCtx.fillRect(0, 0, fW, bandH);
  fCtx.fillStyle = '#FAFAFA';
  fCtx.fillRect(0, bandH, fW, bandH);
  fCtx.fillStyle = '#138808';
  fCtx.fillRect(0, bandH * 2, fW, bandH);

  // Subtle natural woven khadi cotton fabric grain
  fCtx.fillStyle = 'rgba(0, 0, 0, 0.025)';
  for (let y = 0; y < fH; y += 3) {
    fCtx.fillRect(0, y, fW, 1);
  }
  fCtx.fillStyle = 'rgba(255, 255, 255, 0.022)';
  for (let x = 0; x < fW; x += 4) {
    fCtx.fillRect(x, 0, 1, fH);
  }

  // Navy Blue 24-Spoke Ashoka Chakra centered in the white band
  const fcx = fW / 2;
  const fcy = fH / 2;
  const chakraR = bandH * 0.41;
  fCtx.strokeStyle = '#000080';
  fCtx.fillStyle = '#000080';
  fCtx.lineWidth = 4.6;
  fCtx.beginPath();
  fCtx.arc(fcx, fcy, chakraR, 0, Math.PI * 2);
  fCtx.stroke();

  // Inner hub
  fCtx.beginPath();
  fCtx.arc(fcx, fcy, chakraR * 0.16, 0, Math.PI * 2);
  fCtx.fill();

  // 24 spokes + subtle inner rim beading
  for (let s = 0; s < 24; s++) {
    const a = (s / 24) * Math.PI * 2;
    const midA = a + Math.PI / 24;
    fCtx.lineWidth = 2.1;
    fCtx.beginPath();
    fCtx.moveTo(fcx + Math.cos(a) * chakraR * 0.16, fcy + Math.sin(a) * chakraR * 0.16);
    fCtx.lineTo(fcx + Math.cos(a) * (chakraR - 2.5), fcy + Math.sin(a) * (chakraR - 2.5));
    fCtx.stroke();

    // Small decorative dot along inner rim between spokes
    fCtx.beginPath();
    fCtx.arc(
      fcx + Math.cos(midA) * (chakraR - 4.2),
      fcy + Math.sin(midA) * (chakraR - 4.2),
      1.8,
      0,
      Math.PI * 2
    );
    fCtx.fill();
  }

  const indianFlagMap = new THREE.CanvasTexture(flagCanvas);
  indianFlagMap.colorSpace = THREE.SRGBColorSpace;
  indianFlagMap.anisotropy = maxAnisotropy;

  // 8. MINIMAL ARCHITECTURAL GALLERY ARTWORK TEXTURE (East Pavilion Interior)
  const artCanvas = document.createElement('canvas');
  artCanvas.width = 256;
  artCanvas.height = 192;
  const aCtx = artCanvas.getContext('2d')!;
  aCtx.fillStyle = '#121824';
  aCtx.fillRect(0, 0, 256, 192);
  const aGrad = aCtx.createLinearGradient(0, 0, 256, 192);
  aGrad.addColorStop(0, '#cbb692');
  aGrad.addColorStop(0.55, '#4f7df3');
  aGrad.addColorStop(1, '#1d273b');
  aCtx.strokeStyle = aGrad;
  aCtx.lineWidth = 3;
  aCtx.beginPath();
  aCtx.arc(128, 96, 54, 0, Math.PI * 2);
  aCtx.stroke();
  aCtx.fillStyle = 'rgba(203, 182, 146, 0.28)';
  aCtx.beginPath();
  aCtx.arc(128, 96, 30, 0, Math.PI * 2);
  aCtx.fill();

  const galleryArtMap = new THREE.CanvasTexture(artCanvas);
  galleryArtMap.colorSpace = THREE.SRGBColorSpace;
  galleryArtMap.anisotropy = maxAnisotropy;

  // 9. HQ COMPUTER WORKSTATION MONITOR SCREEN UI (IDE + Analytics + CAD)
  const monCanvas = document.createElement('canvas');
  monCanvas.width = 512;
  monCanvas.height = 256;
  const mCtx = monCanvas.getContext('2d')!;
  mCtx.fillStyle = '#090e1a';
  mCtx.fillRect(0, 0, 512, 256);

  // Top OS / App bar
  mCtx.fillStyle = '#121b2e';
  mCtx.fillRect(0, 0, 512, 24);
  mCtx.fillStyle = '#4f7df3';
  mCtx.fillRect(10, 8, 8, 8);
  mCtx.fillStyle = '#e2c799';
  mCtx.fillRect(24, 8, 8, 8);
  mCtx.fillStyle = '#38bdf8';
  mCtx.fillRect(38, 8, 8, 8);

  // Left sidebar explorer
  mCtx.fillStyle = '#0d1424';
  mCtx.fillRect(0, 24, 92, 232);
  for (let row = 0; row < 10; row++) {
    mCtx.fillStyle = row === 2 ? '#4f7df3' : '#2a3954';
    mCtx.fillRect(12, 38 + row * 20, 48 + (row % 3) * 10, 7);
  }

  // Center Code / Engineering Editor pane
  mCtx.fillStyle = '#0b1120';
  mCtx.fillRect(98, 30, 208, 218);
  const codeColors = ['#60a5fa', '#e2c799', '#94a3b8', '#38bdf8', '#c084fc'];
  for (let line = 0; line < 14; line++) {
    const indent = (line % 4) * 10;
    const ly = 42 + line * 14;
    mCtx.fillStyle = codeColors[line % codeColors.length];
    mCtx.fillRect(108 + indent, ly, 36 + ((line * 29) % 72), 5);
    if (line % 2 === 0) {
      mCtx.fillStyle = '#475569';
      mCtx.fillRect(160 + indent, ly, 30 + ((line * 17) % 45), 5);
    }
  }

  // Right Live Analytics & 3D Architecture Preview pane
  mCtx.fillStyle = '#0e1729';
  mCtx.fillRect(314, 30, 190, 114);
  // Chart bars
  for (let bar = 0; bar < 8; bar++) {
    const bh = 24 + ((bar * 37) % 68);
    mCtx.fillStyle = bar % 2 === 0 ? '#4f7df3' : '#e2c799';
    mCtx.fillRect(328 + bar * 21, 134 - bh, 13, bh);
  }
  // Bottom right wireframe radar / CAD widget
  mCtx.fillStyle = '#0e1729';
  mCtx.fillRect(314, 152, 190, 96);
  mCtx.strokeStyle = '#38bdf8';
  mCtx.lineWidth = 2;
  mCtx.beginPath();
  mCtx.moveTo(324, 224);
  mCtx.lineTo(358, 196);
  mCtx.lineTo(392, 208);
  mCtx.lineTo(426, 174);
  mCtx.lineTo(460, 186);
  mCtx.lineTo(494, 164);
  mCtx.stroke();

  const monitorScreenMap = new THREE.CanvasTexture(monCanvas);
  monitorScreenMap.colorSpace = THREE.SRGBColorSpace;
  monitorScreenMap.anisotropy = maxAnisotropy;

  // 10. PANORAMIC COMMAND WALL & BOARDROOM PRESENTATION DISPLAY
  const cmdCanvas = document.createElement('canvas');
  cmdCanvas.width = 512;
  cmdCanvas.height = 192;
  const cCtx = cmdCanvas.getContext('2d')!;
  cCtx.fillStyle = '#070c17';
  cCtx.fillRect(0, 0, 512, 192);

  // Subtle architectural telemetry grid
  cCtx.strokeStyle = 'rgba(79, 125, 243, 0.18)';
  cCtx.lineWidth = 1;
  for (let x = 0; x <= 512; x += 32) {
    cCtx.beginPath();
    cCtx.moveTo(x, 0);
    cCtx.lineTo(x, 192);
    cCtx.stroke();
  }
  for (let y = 0; y <= 192; y += 32) {
    cCtx.beginPath();
    cCtx.moveTo(0, y);
    cCtx.lineTo(512, y);
    cCtx.stroke();
  }

  // Left & Right KPI columns
  for (const panelX of [16, 392]) {
    cCtx.fillStyle = 'rgba(18, 29, 52, 0.85)';
    cCtx.fillRect(panelX, 18, 104, 156);
    cCtx.strokeStyle = 'rgba(226, 199, 153, 0.45)';
    cCtx.strokeRect(panelX, 18, 104, 156);
    for (let k = 0; k < 5; k++) {
      cCtx.fillStyle = k === 0 ? '#e2c799' : '#60a5fa';
      cCtx.fillRect(panelX + 10, 32 + k * 28, 48 + (k % 3) * 14, 7);
      cCtx.fillStyle = '#334155';
      cCtx.fillRect(panelX + 10, 44 + k * 28, 82, 4);
    }
  }

  // Center Global Network Arcs & Orbital Nodes
  cCtx.strokeStyle = '#60a5fa';
  cCtx.lineWidth = 2;
  cCtx.beginPath();
  cCtx.ellipse(256, 96, 106, 56, 0, 0, Math.PI * 2);
  cCtx.stroke();
  cCtx.strokeStyle = 'rgba(226, 199, 153, 0.72)';
  cCtx.beginPath();
  cCtx.ellipse(256, 96, 68, 36, 0.25, 0, Math.PI * 2);
  cCtx.stroke();

  const nodes: Array<[number, number]> = [
    [186, 82],
    [232, 64],
    [274, 106],
    [322, 84],
    [252, 128],
    [214, 114],
  ];
  cCtx.strokeStyle = 'rgba(125, 211, 252, 0.65)';
  cCtx.lineWidth = 1.4;
  for (let i = 0; i < nodes.length; i++) {
    const [nx, ny] = nodes[i];
    const [mx, my] = nodes[(i + 1) % nodes.length];
    cCtx.beginPath();
    cCtx.moveTo(nx, ny);
    cCtx.lineTo(mx, my);
    cCtx.stroke();
    cCtx.fillStyle = i % 2 === 0 ? '#e2c799' : '#38bdf8';
    cCtx.beginPath();
    cCtx.arc(nx, ny, 4.2, 0, Math.PI * 2);
    cCtx.fill();
  }

  const commandScreenMap = new THREE.CanvasTexture(cmdCanvas);
  commandScreenMap.colorSpace = THREE.SRGBColorSpace;
  commandScreenMap.anisotropy = maxAnisotropy;

  // Helper to draw the iconic golden-champagne architectural "N" ribbon monogram
  const drawNexusMonogram = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number
  ) => {
    ctx.save();
    ctx.translate(cx, cy);
    const half = size * 0.5;
    const strokeW = size * 0.16;
    const grad = ctx.createLinearGradient(-half, -half, half, half);
    grad.addColorStop(0, '#fff7e6');
    grad.addColorStop(0.5, '#f5d79c');
    grad.addColorStop(1, '#d4aa6a');
    ctx.fillStyle = grad;

    // Left vertical pillar
    ctx.fillRect(-half, -half, strokeW, size);
    // Right vertical pillar
    ctx.fillRect(half - strokeW, -half, strokeW, size);
    // Bold diagonal ribbon with subtle architectural notch
    ctx.beginPath();
    ctx.moveTo(-half, -half);
    ctx.lineTo(-half + strokeW * 1.15, -half);
    ctx.lineTo(half, half);
    ctx.lineTo(half - strokeW * 1.15, half);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // 11. CENTRAL SPIRE ILLUMINATED "N / NEXUS" LOGO TEXTURE (Transparent Alpha)
  const spLogoCanvas = document.createElement('canvas');
  spLogoCanvas.width = 512;
  spLogoCanvas.height = 384;
  const slCtx = spLogoCanvas.getContext('2d')!;
  slCtx.clearRect(0, 0, 512, 384);
  slCtx.shadowColor = 'rgba(255, 224, 166, 0.72)';
  slCtx.shadowBlur = 18;
  drawNexusMonogram(slCtx, 256, 128, 124);
  slCtx.fillStyle = '#fff9ee';
  slCtx.font = '600 84px "Outfit", system-ui, sans-serif';
  slCtx.textAlign = 'center';
  slCtx.textBaseline = 'middle';
  slCtx.fillText('NEXUS', 256, 286);
  const nexusSpireLogoMap = new THREE.CanvasTexture(spLogoCanvas);
  nexusSpireLogoMap.colorSpace = THREE.SRGBColorSpace;
  nexusSpireLogoMap.anisotropy = maxAnisotropy;

  // 12. LEFT WING CURVED GLASS FACADE SIGNAGE ("N / NEXUS / Build · Innovate · Inspire")
  const leftFacCanvas = document.createElement('canvas');
  leftFacCanvas.width = 768;
  leftFacCanvas.height = 384;
  const lfCtx = leftFacCanvas.getContext('2d')!;
  lfCtx.clearRect(0, 0, 768, 384);
  lfCtx.shadowColor = 'rgba(255, 226, 170, 0.65)';
  lfCtx.shadowBlur = 16;
  drawNexusMonogram(lfCtx, 384, 108, 102);
  lfCtx.fillStyle = '#fffaf0';
  lfCtx.font = '600 88px "Outfit", system-ui, sans-serif';
  lfCtx.textAlign = 'center';
  lfCtx.textBaseline = 'middle';
  lfCtx.fillText('NEXUS', 384, 232);
  lfCtx.shadowBlur = 8;
  lfCtx.fillStyle = '#eedcb8';
  lfCtx.font = '500 34px "Manrope", system-ui, sans-serif';
  lfCtx.fillText('Build · Innovate · Inspire', 384, 316);
  const nexusLeftFacadeMap = new THREE.CanvasTexture(leftFacCanvas);
  nexusLeftFacadeMap.colorSpace = THREE.SRGBColorSpace;
  nexusLeftFacadeMap.anisotropy = maxAnisotropy;

  // 13. RIGHT WING CURVED GLASS FACADE SIGNAGE ("A Global Ecosystem / for a Greater Tomorrow")
  const rightFacCanvas = document.createElement('canvas');
  rightFacCanvas.width = 768;
  rightFacCanvas.height = 384;
  const rfCtx = rightFacCanvas.getContext('2d')!;
  rfCtx.clearRect(0, 0, 768, 384);
  rfCtx.shadowColor = 'rgba(255, 228, 178, 0.55)';
  rfCtx.shadowBlur = 14;
  rfCtx.fillStyle = '#fff9ee';
  rfCtx.font = '500 54px "Outfit", system-ui, sans-serif';
  rfCtx.textAlign = 'center';
  rfCtx.textBaseline = 'middle';
  rfCtx.fillText('A Global Ecosystem', 384, 154);
  rfCtx.fillStyle = '#eedcb8';
  rfCtx.font = '500 48px "Manrope", system-ui, sans-serif';
  rfCtx.fillText('for a Greater Tomorrow', 384, 230);
  const nexusRightFacadeMap = new THREE.CanvasTexture(rightFacCanvas);
  nexusRightFacadeMap.colorSpace = THREE.SRGBColorSpace;
  nexusRightFacadeMap.anisotropy = maxAnisotropy;

  // 14. CEREMONIAL PROMENADE BANNER PYLON TEXTURE
  const banCanvas = document.createElement('canvas');
  banCanvas.width = 256;
  banCanvas.height = 512;
  const bCtx = banCanvas.getContext('2d')!;
  const banGrad = bCtx.createLinearGradient(0, 0, 0, 512);
  banGrad.addColorStop(0, '#0b1222');
  banGrad.addColorStop(0.5, '#111c33');
  banGrad.addColorStop(1, '#080e1a');
  bCtx.fillStyle = banGrad;
  bCtx.fillRect(0, 0, 256, 512);
  bCtx.strokeStyle = '#e2c287';
  bCtx.lineWidth = 6;
  bCtx.strokeRect(12, 12, 232, 488);
  bCtx.shadowColor = 'rgba(255, 218, 148, 0.65)';
  bCtx.shadowBlur = 12;
  drawNexusMonogram(bCtx, 128, 186, 86);
  bCtx.fillStyle = '#fff6e3';
  bCtx.font = '600 32px "Outfit", system-ui, sans-serif';
  bCtx.textAlign = 'center';
  bCtx.fillText('NEXUS', 128, 294);
  bCtx.fillStyle = '#d4b57c';
  bCtx.font = '500 15px "Manrope", system-ui, sans-serif';
  bCtx.fillText('GLOBAL HQ', 128, 332);
  const nexusBannerMap = new THREE.CanvasTexture(banCanvas);
  nexusBannerMap.colorSpace = THREE.SRGBColorSpace;
  nexusBannerMap.anisotropy = maxAnisotropy;

  // 15. CHHATRAPATI SHIVAJI MAHARAJ ENGRAVED GOLDEN BRONZE PEDESTAL PLAQUE
  const plqCanvas = document.createElement('canvas');
  plqCanvas.width = 768;
  plqCanvas.height = 320;
  const pqCtx = plqCanvas.getContext('2d')!;
  const pqBg = pqCtx.createLinearGradient(0, 0, 0, 320);
  pqBg.addColorStop(0, '#211912');
  pqBg.addColorStop(0.5, '#16110c');
  pqBg.addColorStop(1, '#261d14');
  pqCtx.fillStyle = pqBg;
  pqCtx.fillRect(0, 0, 768, 320);

  // Ornate double gold architectural frame border
  pqCtx.strokeStyle = '#e5be73';
  pqCtx.lineWidth = 6;
  pqCtx.strokeRect(16, 16, 736, 288);
  pqCtx.strokeStyle = 'rgba(229, 190, 115, 0.45)';
  pqCtx.lineWidth = 2;
  pqCtx.strokeRect(28, 28, 712, 264);

  // Warm radiant engraved Devanagari gold calligraphy: ॥ छत्रपती शिवाजी महाराज ॥
  pqCtx.shadowColor = 'rgba(255, 200, 96, 0.72)';
  pqCtx.shadowBlur = 14;
  pqCtx.fillStyle = '#ffdf96';
  pqCtx.textAlign = 'center';
  pqCtx.textBaseline = 'middle';
  pqCtx.font = '700 64px "Noto Sans Devanagari", "Kohinoor Devanagari", system-ui, sans-serif';
  pqCtx.fillText('॥ छत्रपती ॥', 384, 108);
  pqCtx.font = '700 72px "Noto Sans Devanagari", "Kohinoor Devanagari", system-ui, sans-serif';
  pqCtx.fillText('शिवाजी महाराज', 384, 194);
  pqCtx.shadowBlur = 6;
  pqCtx.fillStyle = '#d9b571';
  pqCtx.font = '600 20px "Outfit", system-ui, sans-serif';
  pqCtx.fillText('SYMBOL OF COURAGE & EXPANSION', 384, 264);

  const shivajiPlaqueMap = new THREE.CanvasTexture(plqCanvas);
  shivajiPlaqueMap.colorSpace = THREE.SRGBColorSpace;
  shivajiPlaqueMap.anisotropy = maxAnisotropy;

  // 16. REALISTIC FULL MOON DISC TEXTURE (Twilight Sky)
  const moonCanvas = document.createElement('canvas');
  moonCanvas.width = 256;
  moonCanvas.height = 256;
  const mnCtx = moonCanvas.getContext('2d')!;
  mnCtx.clearRect(0, 0, 256, 256);
  const glowGrad = mnCtx.createRadialGradient(128, 128, 42, 128, 128, 126);
  glowGrad.addColorStop(0, 'rgba(255, 252, 240, 1.0)');
  glowGrad.addColorStop(0.42, 'rgba(240, 244, 255, 0.96)');
  glowGrad.addColorStop(0.5, 'rgba(186, 212, 255, 0.28)');
  glowGrad.addColorStop(1, 'rgba(140, 180, 255, 0.0)');
  mnCtx.fillStyle = glowGrad;
  mnCtx.fillRect(0, 0, 256, 256);

  // Subtle lunar maria shading inside the moon disc
  mnCtx.save();
  mnCtx.beginPath();
  mnCtx.arc(128, 128, 56, 0, Math.PI * 2);
  mnCtx.clip();
  const craters: Array<[number, number, number, number]> = [
    [108, 108, 22, 0.14],
    [146, 118, 18, 0.12],
    [122, 146, 20, 0.11],
    [98, 136, 14, 0.1],
    [152, 144, 15, 0.09],
  ];
  for (const [mx, my, mr, ma] of craters) {
    mnCtx.fillStyle = `rgba(110, 124, 148, ${ma})`;
    mnCtx.beginPath();
    mnCtx.arc(mx, my, mr, 0, Math.PI * 2);
    mnCtx.fill();
  }
  mnCtx.restore();

  const moonMap = new THREE.CanvasTexture(moonCanvas);
  moonMap.colorSpace = THREE.SRGBColorSpace;
  moonMap.anisotropy = maxAnisotropy;

  // 17. CHHATRAPATI SHIVAJI MAHARAJ BRONZE PORTRAIT FACE ALBEDO & BUMP MAPS
  // UV Layout: u = 0.5 is vertical facial centerline (+Z), v = 0.5 is eye/nose-bridge level
  // Note: Canvas y = 0 corresponds to top of head (v = 1), y = 512 corresponds to bottom of chin (v = 0)
  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = 512;
  faceCanvas.height = 512;
  const sfCtx = faceCanvas.getContext('2d')!;

  const faceBumpCanvas = document.createElement('canvas');
  faceBumpCanvas.width = 512;
  faceBumpCanvas.height = 512;
  const sfbCtx = faceBumpCanvas.getContext('2d')!;

  // Rich antique dark burnished copper-bronze skin patina gradient
  const fBaseGrad = sfCtx.createRadialGradient(256, 238, 22, 256, 256, 240);
  fBaseGrad.addColorStop(0, '#b57b48'); // Warm burnished copper highlight on nose/cheeks/brow
  fBaseGrad.addColorStop(0.42, '#8b5932');
  fBaseGrad.addColorStop(0.75, '#59361e');
  fBaseGrad.addColorStop(1, '#362011');
  sfCtx.fillStyle = fBaseGrad;
  sfCtx.fillRect(0, 0, 512, 512);

  sfbCtx.fillStyle = '#808080';
  sfbCtx.fillRect(0, 0, 512, 512);

  // Subtle hammered bronze micro-grain across the head
  for (let g = 0; g < 1200; g++) {
    const gx = rand() * 512;
    const gy = rand() * 512;
    const ga = 0.03 + rand() * 0.04;
    sfCtx.fillStyle = rand() > 0.5 ? `rgba(220,165,105,${ga})` : `rgba(28,16,8,${ga})`;
    sfCtx.fillRect(gx, gy, 2.5, 2.5);
  }

  // Sculpted Forehead Highlight + Dignified Brow Ridge Shading
  const foreheadGrad = sfCtx.createRadialGradient(256, 178, 12, 256, 178, 72);
  foreheadGrad.addColorStop(0, 'rgba(218, 158, 98, 0.45)');
  foreheadGrad.addColorStop(1, 'rgba(218, 158, 98, 0)');
  sfCtx.fillStyle = foreheadGrad;
  sfCtx.fillRect(160, 110, 192, 120);

  // ICONIC MARATHA FOREHEAD TILAK (Matches reference bronze sculpture: silver-ash Tripundra + vermilion Chandrakor)
  // Exact UV registration: vNorm = 0.34..0.38 -> y = 174..195, uNorm = 0.5 +/- 0.047 -> x = 256 +/- 24
  sfCtx.save();
  sfCtx.strokeStyle = 'rgba(236, 230, 218, 0.95)';
  sfCtx.lineCap = 'round';
  sfCtx.lineWidth = 4.5;
  sfCtx.beginPath();
  sfCtx.moveTo(234, 178);
  sfCtx.quadraticCurveTo(256, 175.5, 278, 178);
  sfCtx.stroke();
  sfCtx.lineWidth = 2.8;
  sfCtx.strokeStyle = 'rgba(225, 217, 204, 0.82)';
  sfCtx.beginPath();
  sfCtx.moveTo(236, 185);
  sfCtx.quadraticCurveTo(256, 183, 276, 185);
  sfCtx.stroke();

  // Bright sacred saffron-vermilion Chandrakor (crescent) & vertical Tilak mark centered between brows
  sfCtx.fillStyle = '#ff5714';
  sfCtx.beginPath();
  sfCtx.arc(256, 193, 6.2, 0.15 * Math.PI, 0.85 * Math.PI, false);
  sfCtx.quadraticCurveTo(256, 196.5, 250.4, 195.8);
  sfCtx.fill();

  sfCtx.fillStyle = '#ff6a1a';
  sfCtx.beginPath();
  sfCtx.moveTo(256, 173);
  sfCtx.quadraticCurveTo(260.2, 184, 256, 195);
  sfCtx.quadraticCurveTo(251.8, 184, 256, 173);
  sfCtx.fill();

  sfCtx.fillStyle = '#ff3b08';
  sfCtx.beginPath();
  sfCtx.arc(256, 186, 2.8, 0, Math.PI * 2);
  sfCtx.fill();
  sfCtx.restore();

  sfbCtx.fillStyle = '#d4d4d4';
  sfbCtx.fillRect(234, 175, 44, 12);

  // Sculpted Arched Dark-Patina Eyebrows & Deep-Set Resolute Eyes
  // Exact UV registration: alpha = +/-0.25 rad -> x = 256 +/- 20.4 px; vNorm = 0.452 -> y = 231 px
  for (const side of [-1, 1]) {
    const ex = 256 + side * 20.5;

    // Sculpted eyebrow arch (vNorm = 0.415 -> y = 212)
    sfCtx.strokeStyle = '#24140a';
    sfCtx.lineWidth = 4.8;
    sfCtx.lineCap = 'round';
    sfCtx.beginPath();
    sfCtx.moveTo(256 + side * 7, 214);
    sfCtx.quadraticCurveTo(ex, 207, 256 + side * 34, 216);
    sfCtx.stroke();

    sfbCtx.strokeStyle = '#d8d8d8';
    sfbCtx.lineWidth = 5.5;
    sfbCtx.beginPath();
    sfCtx.moveTo(256 + side * 7, 214);
    sfCtx.quadraticCurveTo(ex, 207, 256 + side * 34, 216);
    sfbCtx.stroke();

    // Soft orbital recess shadow around eye socket
    const orbGrad = sfCtx.createRadialGradient(ex, 231, 3, ex, 231, 16);
    orbGrad.addColorStop(0, 'rgba(34, 18, 9, 0.72)');
    orbGrad.addColorStop(1, 'rgba(34, 18, 9, 0)');
    sfCtx.fillStyle = orbGrad;
    sfCtx.beginPath();
    sfCtx.arc(ex, 231, 16, 0, Math.PI * 2);
    sfCtx.fill();

    // Almond sculpted bronze eye & dignified resolute dark iris
    sfCtx.fillStyle = '#a47246';
    sfCtx.beginPath();
    sfCtx.moveTo(ex - 9.5, 231);
    sfCtx.quadraticCurveTo(ex, 224.5, ex + 9.5, 231);
    sfCtx.quadraticCurveTo(ex, 237, ex - 9.5, 231);
    sfCtx.fill();

    // Upper eyelid bold sculpted patina crease
    sfCtx.strokeStyle = '#1e1007';
    sfCtx.lineWidth = 2.6;
    sfCtx.beginPath();
    sfCtx.moveTo(ex - 10.5, 231);
    sfCtx.quadraticCurveTo(ex, 224, ex + 10.5, 231);
    sfCtx.stroke();

    // Subtle lower eyelid rim
    sfCtx.strokeStyle = '#3b2212';
    sfCtx.lineWidth = 1.4;
    sfCtx.beginPath();
    sfCtx.moveTo(ex - 8.5, 232);
    sfCtx.quadraticCurveTo(ex, 236.5, ex + 8.5, 232);
    sfCtx.stroke();

    // Dark sculpted iris & subtle warm bronze catchlight
    sfCtx.fillStyle = '#1b0f08';
    sfCtx.beginPath();
    sfCtx.arc(ex, 230.8, 3.8, 0, Math.PI * 2);
    sfCtx.fill();
    sfCtx.fillStyle = '#d49d64';
    sfCtx.beginPath();
    sfCtx.arc(ex + 1.2, 229.6, 1.2, 0, Math.PI * 2);
    sfCtx.fill();

    // Cheekbone warm copper-bronze highlight (alpha = +/-0.44 -> x = 256 +/- 36, vNorm = 0.525 -> y = 269)
    const cheekGrad = sfCtx.createRadialGradient(256 + side * 35, 268, 3, 256 + side * 35, 268, 19);
    cheekGrad.addColorStop(0, 'rgba(222, 158, 98, 0.46)');
    cheekGrad.addColorStop(1, 'rgba(222, 158, 98, 0)');
    sfCtx.fillStyle = cheekGrad;
    sfCtx.beginPath();
    sfCtx.arc(256 + side * 35, 268, 19, 0, Math.PI * 2);
    sfCtx.fill();
  }

  // Aquiline Nose Bridge Highlight & Sculpted Nostril Shadows (vNorm = 0.44..0.55 -> y = 225..282)
  const noseGrad = sfCtx.createLinearGradient(249, 226, 263, 226);
  noseGrad.addColorStop(0, 'rgba(42, 23, 11, 0.42)');
  noseGrad.addColorStop(0.5, 'rgba(232, 174, 112, 0.6)');
  noseGrad.addColorStop(1, 'rgba(42, 23, 11, 0.42)');
  sfCtx.fillStyle = noseGrad;
  sfCtx.fillRect(249, 224, 14, 56);

  sfCtx.fillStyle = '#241309';
  sfCtx.beginPath();
  sfCtx.ellipse(249, 281, 3.8, 2.4, -0.2, 0, Math.PI * 2);
  sfCtx.ellipse(263, 281, 3.8, 2.4, 0.2, 0, Math.PI * 2);
  sfCtx.fill();

  // Iconic Curled Royal Maratha Mustache (vNorm = 0.585 -> y = 299)
  for (const side of [-1, 1]) {
    sfCtx.strokeStyle = '#231309';
    sfCtx.lineWidth = 6.5;
    sfCtx.lineCap = 'round';
    sfCtx.beginPath();
    sfCtx.moveTo(256 + side * 2, 297);
    sfCtx.bezierCurveTo(
      256 + side * 14,
      295,
      256 + side * 28,
      306,
      256 + side * 37,
      296
    );
    sfCtx.stroke();

    sfCtx.strokeStyle = '#b47a46';
    sfCtx.lineWidth = 1.8;
    sfCtx.beginPath();
    sfCtx.moveTo(256 + side * 3, 295.5);
    sfCtx.bezierCurveTo(
      256 + side * 14,
      293.5,
      256 + side * 27,
      303,
      256 + side * 35.5,
      294.5
    );
    sfCtx.stroke();

    sfbCtx.strokeStyle = '#eaeaea';
    sfbCtx.lineWidth = 7;
    sfbCtx.beginPath();
    sfbCtx.moveTo(256 + side * 2, 297);
    sfCtx.bezierCurveTo(
      256 + side * 14,
      295,
      256 + side * 28,
      306,
      256 + side * 37,
      296
    );
    sfbCtx.stroke();
  }

  // Calm Composed Lower Lip under the Mustache (vNorm = 0.635 -> y = 324)
  sfCtx.fillStyle = '#a87040';
  sfCtx.beginPath();
  sfCtx.ellipse(256, 323, 11, 4.4, 0, 0, Math.PI * 2);
  sfCtx.fill();
  sfCtx.strokeStyle = '#2c170b';
  sfCtx.lineWidth = 1.8;
  sfCtx.beginPath();
  sfCtx.moveTo(244, 318);
  sfCtx.quadraticCurveTo(256, 321, 268, 318);
  sfCtx.stroke();

  // Authentic Full Trimmed Royal Maratha Beard & Sideburns framing the Jaw (alpha = +/-0.62 -> x = 256 +/- 50, y = 238..424)
  sfCtx.save();
  sfCtx.beginPath();
  sfCtx.moveTo(202, 238);
  sfCtx.quadraticCurveTo(206, 344, 232, 396);
  sfCtx.quadraticCurveTo(256, 424, 280, 396);
  sfCtx.quadraticCurveTo(306, 344, 310, 238);
  sfCtx.lineTo(298, 244);
  sfCtx.quadraticCurveTo(293, 322, 272, 336);
  sfCtx.quadraticCurveTo(256, 328, 240, 336);
  sfCtx.quadraticCurveTo(219, 322, 214, 244);
  sfCtx.closePath();
  const beardGrad = sfCtx.createLinearGradient(256, 260, 256, 424);
  beardGrad.addColorStop(0, '#361f11');
  beardGrad.addColorStop(0.55, '#2b180c');
  beardGrad.addColorStop(1, '#1e1007');
  sfCtx.fillStyle = beardGrad;
  sfCtx.fill();

  // Carved bronze beard hair strokes for crisp sculptural relief
  sfCtx.clip();
  for (let bh = 0; bh < 85; bh++) {
    const bx = 204 + (bh / 84) * 104;
    const distCenter = Math.abs(bx - 256) / 54;
    const byTop = 250 + (1 - distCenter) * 76;
    const byBot = 420 - distCenter * 52;
    sfCtx.strokeStyle = bh % 3 === 0 ? 'rgba(182, 124, 72, 0.48)' : 'rgba(22, 12, 6, 0.65)';
    sfCtx.lineWidth = 1.4;
    sfCtx.beginPath();
    sfCtx.moveTo(bx, byTop);
    sfCtx.quadraticCurveTo(bx + (bx < 256 ? 3 : -3), (byTop + byBot) * 0.5, bx + (256 - bx) * 0.14, byBot);
    sfCtx.stroke();

    sfbCtx.strokeStyle = bh % 2 === 0 ? '#c8c8c8' : '#505050';
    sfbCtx.lineWidth = 1.8;
    sfbCtx.beginPath();
    sfbCtx.moveTo(bx, byTop);
    sfbCtx.lineTo(bx + (256 - bx) * 0.14, byBot);
    sfbCtx.stroke();
  }
  sfCtx.restore();

  const shivajiFaceMap = new THREE.CanvasTexture(faceCanvas);
  shivajiFaceMap.colorSpace = THREE.SRGBColorSpace;
  shivajiFaceMap.anisotropy = maxAnisotropy;

  const shivajiFaceBumpMap = new THREE.CanvasTexture(faceBumpCanvas);
  shivajiFaceBumpMap.anisotropy = maxAnisotropy;

  // 18. ORNATE EMBOSSED MARATHA BROCADE & CHILKHAT ARMOR BRONZE TEXTURE + BUMP
  // Matches the richly carved dark-bronze floral scrollwork on the reference statue
  const armCanvas = document.createElement('canvas');
  armCanvas.width = 512;
  armCanvas.height = 512;
  const arCtx = armCanvas.getContext('2d')!;

  const armBumpCanvas = document.createElement('canvas');
  armBumpCanvas.width = 512;
  armBumpCanvas.height = 512;
  const arbCtx = armBumpCanvas.getContext('2d')!;

  arCtx.fillStyle = '#2f1e12';
  arCtx.fillRect(0, 0, 512, 512);
  arbCtx.fillStyle = '#484848';
  arbCtx.fillRect(0, 0, 512, 512);

  // Embossed repeating Maratha lotus medallions & golden-copper scrollwork lattice
  const cell = 64;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cx = col * cell + (row % 2 === 0 ? cell * 0.5 : 0);
      const cy = row * cell + cell * 0.5;

      // Diamond trellis border
      arCtx.strokeStyle = '#9c6738';
      arCtx.lineWidth = 2.2;
      arCtx.beginPath();
      arCtx.moveTo(cx, cy - 28);
      arCtx.lineTo(cx + 28, cy);
      arCtx.lineTo(cx, cy + 28);
      arCtx.lineTo(cx - 28, cy);
      arCtx.closePath();
      arCtx.stroke();

      arbCtx.strokeStyle = '#c8c8c8';
      arbCtx.lineWidth = 3;
      arbCtx.beginPath();
      arbCtx.moveTo(cx, cy - 28);
      arbCtx.lineTo(cx + 28, cy);
      arbCtx.lineTo(cx, cy + 28);
      arbCtx.lineTo(cx - 28, cy);
      arbCtx.closePath();
      arbCtx.stroke();

      // Central lotus rosette petals
      for (let p = 0; p < 8; p++) {
        const pa = (p / 8) * Math.PI * 2;
        const px = cx + Math.cos(pa) * 12;
        const py = cy + Math.sin(pa) * 12;
        arCtx.fillStyle = '#b97e48';
        arCtx.beginPath();
        arCtx.arc(px, py, 4.4, 0, Math.PI * 2);
        arCtx.fill();

        arbCtx.fillStyle = '#e5e5e5';
        arbCtx.beginPath();
        arbCtx.arc(px, py, 4.4, 0, Math.PI * 2);
        arbCtx.fill();
      }
      arCtx.fillStyle = '#d6995b';
      arCtx.beginPath();
      arCtx.arc(cx, cy, 5.2, 0, Math.PI * 2);
      arCtx.fill();
      arbCtx.fillStyle = '#ffffff';
      arbCtx.beginPath();
      arbCtx.arc(cx, cy, 5.2, 0, Math.PI * 2);
      arbCtx.fill();
    }
  }

  const shivajiArmorMap = new THREE.CanvasTexture(armCanvas);
  shivajiArmorMap.wrapS = THREE.RepeatWrapping;
  shivajiArmorMap.wrapT = THREE.RepeatWrapping;
  shivajiArmorMap.repeat.set(2.5, 2.5);
  shivajiArmorMap.colorSpace = THREE.SRGBColorSpace;
  shivajiArmorMap.anisotropy = maxAnisotropy;

  const shivajiArmorBumpMap = new THREE.CanvasTexture(armBumpCanvas);
  shivajiArmorBumpMap.wrapS = THREE.RepeatWrapping;
  shivajiArmorBumpMap.wrapT = THREE.RepeatWrapping;
  shivajiArmorBumpMap.repeat.set(2.5, 2.5);
  shivajiArmorBumpMap.anisotropy = maxAnisotropy;

  // 19. ROYAL BHAGWA SAFFRON SILK & GOLD ZARI JIRETOP / PAGDI TEXTURE + BUMP
  const jirCanvas = document.createElement('canvas');
  jirCanvas.width = 512;
  jirCanvas.height = 512;
  const jCtx = jirCanvas.getContext('2d')!;

  const jirBumpCanvas = document.createElement('canvas');
  jirBumpCanvas.width = 512;
  jirBumpCanvas.height = 512;
  const jbCtx = jirBumpCanvas.getContext('2d')!;

  // Rich Bhagwa saffron-orange silk gradient base
  const jBase = jCtx.createLinearGradient(0, 0, 512, 512);
  jBase.addColorStop(0, '#c83908');
  jBase.addColorStop(0.5, '#e8520e');
  jBase.addColorStop(1, '#b82e06');
  jCtx.fillStyle = jBase;
  jCtx.fillRect(0, 0, 512, 512);

  jbCtx.fillStyle = '#707070';
  jbCtx.fillRect(0, 0, 512, 512);

  // Diagonal wrapped silk pleats + gleaming woven golden zari ribbons (Gota)
  for (let band = -6; band < 16; band++) {
    const offset = band * 52;
    // Soft cloth fold crease shadow
    jCtx.strokeStyle = 'rgba(72, 14, 2, 0.58)';
    jCtx.lineWidth = 10;
    jCtx.beginPath();
    jCtx.moveTo(-40, offset);
    jCtx.lineTo(552, offset - 210);
    jCtx.stroke();

    jbCtx.strokeStyle = '#303030';
    jbCtx.lineWidth = 10;
    jbCtx.beginPath();
    jbCtx.moveTo(-40, offset);
    jbCtx.lineTo(552, offset - 210);
    jbCtx.stroke();

    // Raised bright saffron silk ridge
    jCtx.strokeStyle = 'rgba(255, 118, 42, 0.45)';
    jCtx.lineWidth = 16;
    jCtx.beginPath();
    jCtx.moveTo(-40, offset + 14);
    jCtx.lineTo(552, offset - 196);
    jCtx.stroke();

    jbCtx.strokeStyle = '#b4b4b4';
    jbCtx.lineWidth = 16;
    jbCtx.beginPath();
    jbCtx.moveTo(-40, offset + 14);
    jbCtx.lineTo(552, offset - 196);
    jbCtx.stroke();

    // Gleaming embroidered gold zari strip along each wrap
    jCtx.strokeStyle = '#e8b954';
    jCtx.lineWidth = 8.5;
    jCtx.beginPath();
    jCtx.moveTo(-40, offset + 28);
    jCtx.lineTo(552, offset - 182);
    jCtx.stroke();

    jCtx.strokeStyle = '#fff0b3';
    jCtx.lineWidth = 2.2;
    jCtx.setLineDash([6, 4]);
    jCtx.beginPath();
    jCtx.moveTo(-40, offset + 28);
    jCtx.lineTo(552, offset - 182);
    jCtx.stroke();
    jCtx.setLineDash([]);

    jbCtx.strokeStyle = '#ededed';
    jbCtx.lineWidth = 8;
    jbCtx.beginPath();
    jbCtx.moveTo(-40, offset + 28);
    jbCtx.lineTo(552, offset - 182);
    jbCtx.stroke();
  }

  const jiretopSilkMap = new THREE.CanvasTexture(jirCanvas);
  jiretopSilkMap.wrapS = THREE.RepeatWrapping;
  jiretopSilkMap.wrapT = THREE.RepeatWrapping;
  jiretopSilkMap.colorSpace = THREE.SRGBColorSpace;
  jiretopSilkMap.anisotropy = maxAnisotropy;

  const jiretopSilkBumpMap = new THREE.CanvasTexture(jirBumpCanvas);
  jiretopSilkBumpMap.wrapS = THREE.RepeatWrapping;
  jiretopSilkBumpMap.wrapT = THREE.RepeatWrapping;
  jiretopSilkBumpMap.anisotropy = maxAnisotropy;

  // 20. ORNATE CARVED 24-PETAL ANTIQUE-GOLD LOTUS SUNBURST PRABHAVALI (Throne Backrest)
  const prabCanvas = document.createElement('canvas');
  prabCanvas.width = 512;
  prabCanvas.height = 512;
  const prCtx = prabCanvas.getContext('2d')!;

  const prabBumpCanvas = document.createElement('canvas');
  prabBumpCanvas.width = 512;
  prabBumpCanvas.height = 512;
  const pbCtx = prabBumpCanvas.getContext('2d')!;

  prCtx.fillStyle = '#24170c';
  prCtx.fillRect(0, 0, 512, 512);
  pbCtx.fillStyle = '#282828';
  pbCtx.fillRect(0, 0, 512, 512);

  // Outer carved brass rim & concentric beaded rings
  const prabBg = prCtx.createRadialGradient(256, 256, 18, 256, 256, 248);
  prabBg.addColorStop(0, '#f2ca78');
  prabBg.addColorStop(0.55, '#a87638');
  prabBg.addColorStop(0.84, '#6e4920');
  prabBg.addColorStop(1, '#2c1b0c');
  prCtx.fillStyle = prabBg;
  prCtx.beginPath();
  prCtx.arc(256, 256, 248, 0, Math.PI * 2);
  prCtx.fill();

  // 24 Deeply Sculpted Radiating Lotus Petals (matches royal Singhasan backrest!)
  const petalCount = 24;
  for (let i = 0; i < petalCount; i++) {
    const a = (i / petalCount) * Math.PI * 2;
    prCtx.save();
    prCtx.translate(256, 256);
    prCtx.rotate(a);

    // Sculpted raised golden petal body
    const petGrad = prCtx.createLinearGradient(28, -14, 178, 14);
    petGrad.addColorStop(0, '#5a3a18');
    petGrad.addColorStop(0.42, '#e3b562');
    petGrad.addColorStop(0.55, '#fff0ba');
    petGrad.addColorStop(0.7, '#9c6b30');
    petGrad.addColorStop(1, '#3d250f');
    prCtx.fillStyle = petGrad;
    prCtx.beginPath();
    prCtx.moveTo(28, 0);
    prCtx.quadraticCurveTo(105, -22, 168, -11);
    prCtx.quadraticCurveTo(186, 0, 168, 11);
    prCtx.quadraticCurveTo(105, 22, 28, 0);
    prCtx.fill();

    // Crisp recessed antique patina outline between petals
    prCtx.strokeStyle = '#211308';
    prCtx.lineWidth = 3;
    prCtx.stroke();

    // Central raised spine vein down each lotus petal
    prCtx.strokeStyle = '#fae09e';
    prCtx.lineWidth = 2.2;
    prCtx.beginPath();
    prCtx.moveTo(34, 0);
    prCtx.lineTo(172, 0);
    prCtx.stroke();
    prCtx.restore();

    // Matching high-contrast bump relief for each lotus petal
    pbCtx.save();
    pbCtx.translate(256, 256);
    pbCtx.rotate(a);
    pbCtx.fillStyle = '#d4d4d4';
    pbCtx.beginPath();
    pbCtx.moveTo(28, 0);
    pbCtx.quadraticCurveTo(105, -20, 168, -10);
    pbCtx.quadraticCurveTo(184, 0, 168, 10);
    pbCtx.quadraticCurveTo(105, 20, 28, 0);
    pbCtx.fill();
    pbCtx.strokeStyle = '#181818';
    pbCtx.lineWidth = 4;
    pbCtx.stroke();
    pbCtx.strokeStyle = '#ffffff';
    pbCtx.lineWidth = 3;
    pbCtx.beginPath();
    pbCtx.moveTo(36, 0);
    pbCtx.lineTo(170, 0);
    pbCtx.stroke();
    pbCtx.restore();
  }

  // Concentric antique-gold borders & beaded pearl ring (r = 190..236)
  for (const [r, lw, col, bCol] of [
    [186, 7, '#d8a954', '#e5e5e5'],
    [198, 4, '#241408', '#202020'],
    [224, 6, '#e5b864', '#eeeeee'],
    [240, 5, '#2c190a', '#222222'],
  ] as const) {
    prCtx.strokeStyle = col;
    prCtx.lineWidth = lw;
    prCtx.beginPath();
    prCtx.arc(256, 256, r, 0, Math.PI * 2);
    prCtx.stroke();

    pbCtx.strokeStyle = bCol;
    pbCtx.lineWidth = lw;
    pbCtx.beginPath();
    pbCtx.arc(256, 256, r, 0, Math.PI * 2);
    pbCtx.stroke();
  }

  // 48 embossed golden beads encircling the outer band
  for (let b = 0; b < 48; b++) {
    const a = (b / 48) * Math.PI * 2;
    const bx = 256 + Math.cos(a) * 211;
    const by = 256 + Math.sin(a) * 211;
    prCtx.fillStyle = '#f3cd7e';
    prCtx.beginPath();
    prCtx.arc(bx, by, 5.2, 0, Math.PI * 2);
    prCtx.fill();

    pbCtx.fillStyle = '#ffffff';
    pbCtx.beginPath();
    pbCtx.arc(bx, by, 5.2, 0, Math.PI * 2);
    pbCtx.fill();
  }

  // Central golden lotus boss
  const bossGrad = prCtx.createRadialGradient(252, 252, 4, 256, 256, 30);
  bossGrad.addColorStop(0, '#fff3c4');
  bossGrad.addColorStop(0.65, '#c8923e');
  bossGrad.addColorStop(1, '#3b240e');
  prCtx.fillStyle = bossGrad;
  prCtx.beginPath();
  prCtx.arc(256, 256, 30, 0, Math.PI * 2);
  prCtx.fill();

  pbCtx.fillStyle = '#ffffff';
  pbCtx.beginPath();
  pbCtx.arc(256, 256, 28, 0, Math.PI * 2);
  pbCtx.fill();

  const prabhavaliBrassMap = new THREE.CanvasTexture(prabCanvas);
  prabhavaliBrassMap.colorSpace = THREE.SRGBColorSpace;
  prabhavaliBrassMap.anisotropy = maxAnisotropy;

  const prabhavaliBrassBumpMap = new THREE.CanvasTexture(prabBumpCanvas);
  prabhavaliBrassBumpMap.anisotropy = maxAnisotropy;

  // 21. HIGH-DENSITY ENTERPRISE SERVER RACK FRONT PANEL TEXTURE (Blade Slots & Telemetry LEDs)
  const srCanvas = document.createElement('canvas');
  srCanvas.width = 256;
  srCanvas.height = 512;
  const srvCtx = srCanvas.getContext('2d')!;
  srvCtx.fillStyle = '#0c111a';
  srvCtx.fillRect(0, 0, 256, 512);

  // Left & Right anodized rack mounting rails
  srvCtx.fillStyle = '#1e2736';
  srvCtx.fillRect(0, 0, 18, 512);
  srvCtx.fillRect(238, 0, 18, 512);
  srvCtx.fillStyle = '#3b485e';
  for (let y = 10; y < 504; y += 16) {
    srvCtx.fillRect(6, y, 6, 4);
    srvCtx.fillRect(244, y, 6, 4);
  }

  // 16 stacked server blade units with perforated mesh, silver pull handles & status LEDs
  const units = 16;
  const unitH = 480 / units;
  for (let u = 0; u < units; u++) {
    const uy = 16 + u * unitH;
    // Blade chassis face
    srvCtx.fillStyle = u % 4 === 0 ? '#182131' : '#121824';
    srvCtx.fillRect(20, uy + 2, 216, unitH - 4);

    // Subtle brushed silver horizontal bezel divider
    srvCtx.fillStyle = '#2d3a4f';
    srvCtx.fillRect(20, uy + 1, 216, 1.5);

    // Perforated airflow drive bays (left-center)
    for (let col = 0; col < 10; col++) {
      srvCtx.fillStyle = col % 2 === 0 ? '#090d14' : '#0f1622';
      srvCtx.fillRect(28 + col * 13, uy + 6, 9, unitH - 12);
    }

    // Illuminated fiber patch / compute telemetry bars & status LEDs (right side)
    const isHotNode = u === 2 || u === 6 || u === 10 || u === 13;
    srvCtx.fillStyle = isHotNode ? '#38bdf8' : '#60a5fa';
    srvCtx.fillRect(166, uy + 8, 34, 4);
    srvCtx.fillStyle = u % 3 === 0 ? '#f5d28c' : '#38bdf8';
    srvCtx.fillRect(166, uy + 15, 22 + ((u * 7) % 16), 3);

    // Status LED micro-dots (cyan, ice-white, warm champagne)
    const ledPalette = ['#38bdf8', '#7dd3fc', '#f5d28c', '#34d399'];
    for (let d = 0; d < 4; d++) {
      srvCtx.fillStyle = ledPalette[(u + d) % ledPalette.length];
      srvCtx.beginPath();
      srvCtx.arc(210 + d * 6, uy + unitH * 0.5, 2.0, 0, Math.PI * 2);
      srvCtx.fill();
    }
  }

  // Top rack cooling header badge with glowing cyan telemetry strip
  srvCtx.fillStyle = '#38bdf8';
  srvCtx.fillRect(24, 6, 208, 4);

  const serverRackFrontMap = new THREE.CanvasTexture(srCanvas);
  serverRackFrontMap.colorSpace = THREE.SRGBColorSpace;
  serverRackFrontMap.anisotropy = maxAnisotropy;

  // 22. STYLIZED HOLOGRAPHIC DESK & CAD HUD PROJECTION TEXTURE (Transparent Alpha)
  const hCanvas = document.createElement('canvas');
  hCanvas.width = 512;
  hCanvas.height = 512;
  const hCtx = hCanvas.getContext('2d')!;
  hCtx.clearRect(0, 0, 512, 512);

  // Soft radial holographic field glow
  const hGlow = hCtx.createRadialGradient(256, 256, 18, 256, 256, 246);
  hGlow.addColorStop(0, 'rgba(56, 189, 248, 0.34)');
  hGlow.addColorStop(0.55, 'rgba(56, 189, 248, 0.14)');
  hGlow.addColorStop(0.86, 'rgba(226, 199, 153, 0.08)');
  hGlow.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
  hCtx.fillStyle = hGlow;
  hCtx.fillRect(0, 0, 512, 512);

  // Concentric technical telemetry rings & orbital arcs
  const ringSpecs: Array<[number, number, string, number[]]> = [
    [232, 3, 'rgba(125, 211, 252, 0.85)', [18, 10]],
    [198, 2, 'rgba(245, 210, 140, 0.78)', []],
    [156, 2.5, 'rgba(56, 189, 248, 0.9)', [10, 8]],
    [108, 1.8, 'rgba(186, 230, 253, 0.85)', []],
    [62, 2, 'rgba(245, 210, 140, 0.9)', [6, 6]],
  ];
  for (const [rad, lw, col, dash] of ringSpecs) {
    hCtx.save();
    hCtx.strokeStyle = col;
    hCtx.lineWidth = lw;
    hCtx.setLineDash(dash);
    hCtx.beginPath();
    hCtx.arc(256, 256, rad, 0, Math.PI * 2);
    hCtx.stroke();
    hCtx.restore();
  }

  // Radial degree tick marks & crosshair axes
  hCtx.strokeStyle = 'rgba(125, 211, 252, 0.55)';
  for (let t = 0; t < 36; t++) {
    const a = (t / 36) * Math.PI * 2;
    const innerR = t % 3 === 0 ? 186 : 192;
    hCtx.lineWidth = t % 3 === 0 ? 2.2 : 1.2;
    hCtx.beginPath();
    hCtx.moveTo(256 + Math.cos(a) * innerR, 256 + Math.sin(a) * innerR);
    hCtx.lineTo(256 + Math.cos(a) * 208, 256 + Math.sin(a) * 208);
    hCtx.stroke();
  }
  // Crosshair vectors
  hCtx.strokeStyle = 'rgba(56, 189, 248, 0.42)';
  hCtx.lineWidth = 1.5;
  hCtx.beginPath();
  hCtx.moveTo(24, 256);
  hCtx.lineTo(488, 256);
  hCtx.moveTo(256, 24);
  hCtx.lineTo(256, 488);
  hCtx.stroke();

  // Holographic neural telemetry nodes & data arc segments
  const hNodes: Array<[number, number]> = [
    [256, 100],
    [388, 182],
    [354, 344],
    [164, 356],
    [122, 194],
  ];
  hCtx.strokeStyle = 'rgba(245, 210, 140, 0.72)';
  hCtx.lineWidth = 1.8;
  hCtx.beginPath();
  for (let i = 0; i < hNodes.length; i++) {
    const [nx, ny] = hNodes[i];
    if (i === 0) hCtx.moveTo(nx, ny);
    else hCtx.lineTo(nx, ny);
  }
  hCtx.closePath();
  hCtx.stroke();

  for (let i = 0; i < hNodes.length; i++) {
    const [nx, ny] = hNodes[i];
    hCtx.fillStyle = i % 2 === 0 ? '#7dd3fc' : '#f5d28c';
    hCtx.beginPath();
    hCtx.arc(nx, ny, 7, 0, Math.PI * 2);
    hCtx.fill();
  }

  // Stylized floating HUD bar graphs in corners
  for (let b = 0; b < 6; b++) {
    const bh = 16 + ((b * 13) % 34);
    hCtx.fillStyle = b % 2 === 0 ? 'rgba(56, 189, 248, 0.78)' : 'rgba(245, 210, 140, 0.78)';
    hCtx.fillRect(62 + b * 11, 102 - bh, 7, bh);
    hCtx.fillRect(386 + b * 11, 434 - bh, 7, bh);
  }

  const holoProjectionMap = new THREE.CanvasTexture(hCanvas);
  holoProjectionMap.colorSpace = THREE.SRGBColorSpace;
  holoProjectionMap.anisotropy = maxAnisotropy;

  return {
    glassMap,
    glassEmissiveMap,
    glassRoughnessMap,
    stoneMap,
    stoneRoughnessMap,
    titaniumMap,
    titaniumRoughnessMap,
    solarMap,
    plazaMap,
    indianFlagMap,
    galleryArtMap,
    monitorScreenMap,
    commandScreenMap,
    serverRackFrontMap,
    holoProjectionMap,
    nexusSpireLogoMap,
    nexusLeftFacadeMap,
    nexusRightFacadeMap,
    nexusBannerMap,
    shivajiPlaqueMap,
    shivajiFaceMap,
    shivajiFaceBumpMap,
    shivajiArmorMap,
    shivajiArmorBumpMap,
    jiretopSilkMap,
    jiretopSilkBumpMap,
    prabhavaliBrassMap,
    prabhavaliBrassBumpMap,
    moonMap,
    waterNormalMap,
    dispose: () => {
      glassMap.dispose();
      glassEmissiveMap.dispose();
      glassRoughnessMap.dispose();
      stoneMap.dispose();
      stoneRoughnessMap.dispose();
      titaniumMap.dispose();
      titaniumRoughnessMap.dispose();
      solarMap.dispose();
      plazaMap.dispose();
      indianFlagMap.dispose();
      galleryArtMap.dispose();
      monitorScreenMap.dispose();
      commandScreenMap.dispose();
      serverRackFrontMap.dispose();
      holoProjectionMap.dispose();
      nexusSpireLogoMap.dispose();
      nexusLeftFacadeMap.dispose();
      nexusRightFacadeMap.dispose();
      nexusBannerMap.dispose();
      shivajiPlaqueMap.dispose();
      shivajiFaceMap.dispose();
      shivajiFaceBumpMap.dispose();
      shivajiArmorMap.dispose();
      shivajiArmorBumpMap.dispose();
      jiretopSilkMap.dispose();
      jiretopSilkBumpMap.dispose();
      prabhavaliBrassMap.dispose();
      prabhavaliBrassBumpMap.dispose();
      moonMap.dispose();
      waterNormalMap.dispose();
    },
  };
}
