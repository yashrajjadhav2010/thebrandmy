import * as THREE from 'three';
import type { HQSharedMaterials } from './buildHQDetails';
import type { HQTextureSet } from './hqTextures';

/**
 * Builds the sacred Chhatrapati Shivaji Maharaj Royal Singhasan & Maratha Regalia
 * Monument at the center of the NEXUS Global HQ forecourt—symbolizing courage,
 * sovereignty, Swarajya heritage, and fearless global expansion.
 *
 * Sculpted with museum-grade 3D detail directly inspired by the royal Maratha regalia:
 * - Stepped circular water-cascade amphitheater base with golden LED step strips
 * - Chamfered octagonal dark-basalt & burnished-gold pedestal engraved
 *   "॥ छत्रपती शिवाजी महाराज ॥"
 * - Royal Maratha Singhasan (Throne) with embossed antique-gold base frieze,
 *   deep crimson-maroon velvet cushion & twin cylindrical bolsters (Takya)
 * - Monumental 24-petal carved antique-gold Lotus-Sunburst Backrest (Prabhavali)
 *   with scalloped floral perimeter & Kirtimukh crown apex
 * - Ornate brass Chaurang stand & gold-trimmed velvet cushion elevating the
 *   iconic Bhagwa Saffron & Gold-Zari Jiretop / Pagdi with folded Turra peak,
 *   jeweled diamond-and-gold Sirpech crown brooch, and sacred white Kavadyaanchi Maal
 * - Crimson-scabbarded Bhavani Talwar sword with silver knuckle-bow hilt resting
 *   across the throne behind the Jiretop, flanked by a folded royal purple-gold
 *   Shela shawl and a pair of golden Maratha Mojari.
 */
export function buildShivajiMonument(
  root: THREE.Group,
  mats: HQSharedMaterials,
  textures: HQTextureSet,
  trackGeo: <T extends THREE.BufferGeometry>(g: T) => T,
  trackMat: <T extends THREE.Material>(m: T) => T,
  isSoftwareGl: boolean
): (elapsed: number, nightMix: number) => void {
  const monument = new THREE.Group();
  monument.position.set(0, 0.24, 15.8);
  root.add(monument);

  // =========================================================================
  // 1. ROYAL MARATHA PBR MATERIAL PALETTE (Antique Brass, Velvet, Bhagwa Silk)
  // =========================================================================
  const antiqueBrassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xc99642,
      roughness: 0.26,
      metalness: 0.92,
      clearcoat: 0.45,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.65,
    })
  );

  const brightGoldMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xf2c96b,
      roughness: 0.2,
      metalness: 0.96,
      clearcoat: 0.6,
      clearcoatRoughness: 0.14,
      envMapIntensity: 1.85,
    })
  );

  const deepPatinaBronzeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x352214,
      roughness: 0.44,
      metalness: 0.84,
      envMapIntensity: 1.1,
    })
  );

  const embossedBrassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      map: textures.shivajiArmorMap,
      bumpMap: textures.shivajiArmorBumpMap,
      bumpScale: 0.036,
      color: 0xe3b468,
      roughness: 0.3,
      metalness: 0.88,
      clearcoat: 0.38,
      envMapIntensity: 1.5,
    })
  );

  const prabhavaliMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      map: textures.prabhavaliBrassMap,
      bumpMap: textures.prabhavaliBrassBumpMap,
      bumpScale: 0.055,
      color: 0xf2cd7e,
      roughness: 0.28,
      metalness: 0.9,
      clearcoat: 0.42,
      clearcoatRoughness: 0.22,
      envMapIntensity: 1.75,
    })
  );

  const royalVelvetMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x4c0c18,
      roughness: 0.88,
      metalness: 0.04,
      sheen: 0.9,
      sheenRoughness: 0.55,
      sheenColor: new THREE.Color(0x9e2138),
      envMapIntensity: 0.65,
    })
  );

  const jiretopSilkMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      map: textures.jiretopSilkMap,
      bumpMap: textures.jiretopSilkBumpMap,
      bumpScale: 0.035,
      color: 0xffede0,
      roughness: 0.58,
      metalness: 0.12,
      sheen: 0.8,
      sheenRoughness: 0.42,
      sheenColor: new THREE.Color(0xff9b45),
      envMapIntensity: 0.85,
    })
  );

  const saffronFoldMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xe3490b,
      roughness: 0.64,
      metalness: 0.06,
      sheen: 0.78,
      sheenRoughness: 0.45,
      sheenColor: new THREE.Color(0xff8c38),
    })
  );

  const purpleShelaMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x4f1763,
      roughness: 0.74,
      metalness: 0.08,
      sheen: 0.85,
      sheenRoughness: 0.42,
      sheenColor: new THREE.Color(0x9b45bf),
    })
  );

  const crimsonScabbardMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xa6160e,
      roughness: 0.28,
      metalness: 0.12,
      clearcoat: 0.72,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.1,
    })
  );

  const silverSteelMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xe4eaf2,
      roughness: 0.14,
      metalness: 0.96,
      clearcoat: 0.65,
      envMapIntensity: 1.8,
    })
  );

  const cowriePearlMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xf4ece0,
      roughness: 0.22,
      metalness: 0.08,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.2,
    })
  );

  const diamondJewelMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(0xffe9b5),
      emissiveIntensity: 0.65,
      roughness: 0.05,
      metalness: 0.25,
      clearcoat: 1.0,
    })
  );

  const darkGraniteMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1e1d1c,
      roughness: 0.58,
      metalness: 0.16,
      envMapIntensity: 0.6,
    })
  );

  const pedestalStoneMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x2b2520,
      roughness: 0.62,
      metalness: 0.2,
      envMapIntensity: 0.65,
    })
  );

  const plaqueMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: textures.shivajiPlaqueMap,
      emissiveMap: textures.shivajiPlaqueMap,
      emissive: new THREE.Color(0xffcf7a),
      emissiveIntensity: 0.42,
      roughness: 0.34,
      metalness: 0.6,
    })
  );

  const cascadeWaterMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xd6eeff,
      emissive: new THREE.Color(0x9bcaff),
      emissiveIntensity: 0.3,
      roughness: 0.08,
      metalness: 0.1,
      transparent: true,
      opacity: 0.78,
      clearcoat: 1.0,
      depthWrite: false,
    })
  );

  // =========================================================================
  // 2. GRAND STEPPED CIRCULAR WATER-CASCADE BASE & GOLDEN RIM STEPS
  // =========================================================================
  for (let s = 0; s < 3; s++) {
    const rOuter = 6.2 - s * 0.55;
    const stepH = 0.2;
    const stepMesh = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(rOuter, rOuter + 0.12, stepH, 48)),
      darkGraniteMat
    );
    stepMesh.position.y = s * stepH + stepH * 0.5;
    stepMesh.receiveShadow = true;
    monument.add(stepMesh);

    const ledRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(rOuter + 0.04, 0.036, 6, 48)),
      mats.archLightStripMat
    );
    ledRing.rotation.x = Math.PI / 2;
    ledRing.position.y = s * stepH + 0.16;
    monument.add(ledRing);
  }

  const moatWater = new THREE.Mesh(
    trackGeo(new THREE.RingGeometry(3.75, 5.05, 48)),
    trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x162b40,
        roughness: 0.06,
        metalness: 0.2,
        clearcoat: 1.0,
        envMapIntensity: 1.35,
      })
    )
  );
  moatWater.rotation.x = -Math.PI / 2;
  moatWater.position.y = 0.62;
  monument.add(moatWater);

  const cascadeAngles = [0, -0.58, 0.58];
  const cascadeMeshes: THREE.Mesh[] = [];
  for (const ang of cascadeAngles) {
    const cMesh = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.55, 0.58, 0.14)),
      cascadeWaterMat
    );
    cMesh.position.set(Math.sin(ang) * 5.08, 0.34, Math.cos(ang) * 5.08);
    cMesh.rotation.y = ang;
    monument.add(cMesh);
    cascadeMeshes.push(cMesh);
  }

  const collarHedge = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(3.45, 0.36, 10, 40)),
    mats.gardenFoliageMat
  );
  collarHedge.rotation.x = Math.PI / 2;
  collarHedge.scale.set(1, 1, 0.72);
  collarHedge.position.y = 0.78;
  monument.add(collarHedge);

  const flowerGeo = trackGeo(new THREE.DodecahedronGeometry(0.14, 0));
  const marigoldMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xe69a2e,
      roughness: 0.72,
      metalness: 0.0,
    })
  );
  const flowerCount = 24;
  const flowerInst = new THREE.InstancedMesh(flowerGeo, marigoldMat, flowerCount);
  const fDummy = new THREE.Object3D();
  for (let i = 0; i < flowerCount; i++) {
    const a = (i / flowerCount) * Math.PI * 2;
    const rad = 3.42 + (i % 2 === 0 ? 0.12 : -0.1);
    fDummy.position.set(Math.cos(a) * rad, 1.02, Math.sin(a) * rad);
    fDummy.scale.set(1.1, 0.7, 1.1);
    fDummy.updateMatrix();
    flowerInst.setMatrixAt(i, fDummy.matrix);
  }
  flowerInst.instanceMatrix.needsUpdate = true;
  flowerInst.computeBoundingSphere();
  monument.add(flowerInst);

  // =========================================================================
  // 3. MONUMENTAL CHAMFERED OCTAGONAL STONE & BURNISHED-GOLD PEDESTAL
  // =========================================================================
  const pedTier1 = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(2.85, 3.32, 0.78, 8)),
    pedestalStoneMat
  );
  pedTier1.position.y = 1.02;
  pedTier1.rotation.y = Math.PI / 8;
  pedTier1.castShadow = !isSoftwareGl;
  pedTier1.receiveShadow = true;

  const pedTier2 = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(2.22, 2.72, 2.02, 8)),
    darkGraniteMat
  );
  pedTier2.position.y = 2.4;
  pedTier2.rotation.y = Math.PI / 8;
  pedTier2.castShadow = !isSoftwareGl;
  pedTier2.receiveShadow = true;

  const pedTier3 = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(2.58, 2.16, 0.42, 8)),
    pedestalStoneMat
  );
  pedTier3.position.y = 3.6;
  pedTier3.rotation.y = Math.PI / 8;
  pedTier3.castShadow = !isSoftwareGl;

  const pedCap = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(2.38, 2.52, 0.24, 8)),
    deepPatinaBronzeMat
  );
  pedCap.position.y = 3.92;
  pedCap.rotation.y = Math.PI / 8;

  const moldings: Array<{ r: number; y: number }> = [
    { r: 2.92, y: 1.42 },
    { r: 2.58, y: 3.4 },
    { r: 2.62, y: 3.8 },
  ];
  for (const m of moldings) {
    const trim = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(m.r, m.r, 0.08, 8)),
      antiqueBrassMat
    );
    trim.position.y = m.y;
    trim.rotation.y = Math.PI / 8;
    monument.add(trim);
  }

  // Front & Rear Engraved Golden Devanagari Plaques ("॥ छत्रपती शिवाजी महाराज ॥")
  const plaqueGeo = trackGeo(new THREE.BoxGeometry(2.2, 0.96, 0.08));
  const frontPlaque = new THREE.Mesh(plaqueGeo, plaqueMat);
  frontPlaque.position.set(0, 2.4, 2.3);
  frontPlaque.rotation.x = -0.24;

  const rearPlaque = new THREE.Mesh(plaqueGeo, plaqueMat);
  rearPlaque.position.set(0, 2.4, -2.3);
  rearPlaque.rotation.y = Math.PI;
  rearPlaque.rotation.x = -0.24;

  monument.add(pedTier1, pedTier2, pedTier3, pedCap, frontPlaque, rearPlaque);

  // =========================================================================
  // 4. ROYAL MARATHA SINGHASAN (THRONE), PRABHAVALI, BHAGWA JIRETOP & BHAVANI TALWAR
  // =========================================================================
  const singhasan = new THREE.Group();
  singhasan.position.set(0, 4.04, 0);
  monument.add(singhasan);

  // --- A. CARVED ANTIQUE-GOLD THRONE BASE & DEEP CRIMSON VELVET CUSHION ---
  const throneFrieze = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.15, 0.54, 2.65)),
    embossedBrassMat
  );
  throneFrieze.position.set(0, 0.27, 0);

  const throneUpperTrim = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.32, 0.09, 2.82)),
    antiqueBrassMat
  );
  throneUpperTrim.position.set(0, 0.56, 0);

  const throneLowerTrim = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.28, 0.08, 2.78)),
    antiqueBrassMat
  );
  throneLowerTrim.position.set(0, 0.04, 0);
  singhasan.add(throneFrieze, throneUpperTrim, throneLowerTrim);

  // Scalloped antique-gold lotus apron medallions along the front edge of the throne
  const apronPetalGeo = trackGeo(new THREE.SphereGeometry(0.14, 10, 8));
  for (let i = 0; i < 11; i++) {
    const px = -1.9 + i * 0.38;
    const petal = new THREE.Mesh(apronPetalGeo, antiqueBrassMat);
    petal.scale.set(1.15, 1.25, 0.45);
    petal.position.set(px, 0.46, 1.38);
    singhasan.add(petal);
  }

  // Plush Deep Crimson-Maroon Velvet Seat Cushion (Gadi)
  const seatCushion = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.88, 0.34, 2.38)),
    royalVelvetMat
  );
  seatCushion.position.set(0, 0.76, 0.02);

  // Rounded front velvet edge drape for soft realistic cushion profile
  const seatFrontRoll = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.17, 0.17, 3.86, 16)),
    royalVelvetMat
  );
  seatFrontRoll.rotation.z = Math.PI / 2;
  seatFrontRoll.position.set(0, 0.76, 1.2);

  // Twin Royal Crimson Velvet Cylindrical Bolsters (Takya) with Embossed Gold End Medallions
  for (const side of [-1, 1]) {
    const bolster = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.36, 0.36, 2.18, 20)),
      royalVelvetMat
    );
    bolster.rotation.x = Math.PI / 2;
    bolster.position.set(side * 1.72, 1.12, 0.04);
    singhasan.add(bolster);

    // Front & rear carved antique-gold sunburst bolster caps
    for (const endZ of [-1.06, 1.14]) {
      const cap = new THREE.Mesh(
        trackGeo(new THREE.SphereGeometry(0.28, 16, 12)),
        prabhavaliMat
      );
      cap.scale.set(1.0, 1.0, 0.35);
      cap.position.set(side * 1.72, 1.12, endZ);
      const capRing = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(0.31, 0.032, 8, 20)),
        antiqueBrassMat
      );
      capRing.position.set(side * 1.72, 1.12, endZ);
      singhasan.add(cap, capRing);
    }
  }
  singhasan.add(seatCushion, seatFrontRoll);

  // --- B. MONUMENTAL 24-PETAL CARVED GOLD LOTUS-SUNBURST BACKREST (PRABHAVALI) ---
  const prabhavaliGrp = new THREE.Group();
  prabhavaliGrp.position.set(0, 2.52, -0.96);
  singhasan.add(prabhavaliGrp);

  // Main Sculpted Circular Lotus-Sunburst Brass Disc (double-faced cleanly for 360° orbit!)
  const prabDiscGeo = trackGeo(new THREE.CylinderGeometry(1.74, 1.74, 0.14, 48));
  prabDiscGeo.rotateX(Math.PI / 2);
  const prabDisc = new THREE.Mesh(prabDiscGeo, prabhavaliMat);
  prabhavaliGrp.add(prabDisc);

  // Heavy Sculpted Concentric 3D Brass Relief Rings framing the Lotus Sunburst
  const prabOuterRing = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(1.74, 0.11, 12, 48)),
    antiqueBrassMat
  );
  const prabMidRing = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(1.32, 0.055, 8, 44)),
    brightGoldMat
  );
  prabMidRing.position.z = 0.07;

  // Glowing Central Domed Golden Lotus Boss (front & rear)
  const prabBossFront = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.24, 18, 12)),
    brightGoldMat
  );
  prabBossFront.scale.set(1, 1, 0.45);
  prabBossFront.position.z = 0.08;
  const prabBossBack = prabBossFront.clone();
  prabBossBack.position.z = -0.08;
  prabhavaliGrp.add(prabOuterRing, prabMidRing, prabBossFront, prabBossBack);

  // 32 3D Carved Scalloped Floral Scroll Teeth ringing the Prabhavali perimeter!
  const scrollToothGeo = trackGeo(new THREE.SphereGeometry(0.115, 10, 8));
  for (let t = 0; t < 32; t++) {
    const a = (t / 32) * Math.PI * 2;
    const tooth = new THREE.Mesh(scrollToothGeo, antiqueBrassMat);
    tooth.scale.set(0.9, 1.35, 0.52);
    tooth.position.set(Math.cos(a) * 1.86, Math.sin(a) * 1.86, 0);
    tooth.rotation.z = a - Math.PI / 2;
    prabhavaliGrp.add(tooth);
  }

  // Ornate Pointed Crown Apex Finial (Kirtimukh / Floral Crest atop the Prabhavali!)
  const apexCrest = new THREE.Group();
  apexCrest.position.set(0, 2.02, 0);
  const apexPeak = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(0.32, 0.56, 8)),
    brightGoldMat
  );
  apexPeak.scale.set(1.0, 1.0, 0.36);
  const apexScrollL = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.16, 0.045, 8, 16)),
    antiqueBrassMat
  );
  apexScrollL.position.set(-0.26, -0.14, 0);
  const apexScrollR = apexScrollL.clone();
  apexScrollR.position.x = 0.26;
  const apexJewel = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.09, 10, 8)),
    brightGoldMat
  );
  apexJewel.position.set(0, -0.08, 0.08);
  apexCrest.add(apexPeak, apexScrollL, apexScrollR, apexJewel);
  prabhavaliGrp.add(apexCrest);

  // Subtle warm halo ring tucked right behind the Prabhavali so it glows dramatically at twilight
  const prabBackGlow = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(1.78, 0.032, 6, 48)),
    mats.archLightStripMat
  );
  prabBackGlow.position.z = -0.11;
  prabhavaliGrp.add(prabBackGlow);

  // --- C. ORNATE SCALLOPED BRASS CHAURANG STAND & GOLD-TRIMMED VELVET CUSHION ---
  const chaurangGrp = new THREE.Group();
  chaurangGrp.position.set(0, 0.93, 0.14);
  singhasan.add(chaurangGrp);

  // Ornate Scalloped Burnished-Brass Chaurang Ring & Top Deck
  const chaurangRim = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.88, 0.94, 0.24, 32)),
    antiqueBrassMat
  );
  chaurangRim.position.y = 0.36;

  const chaurangLaceRing = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.92, 0.035, 8, 32)),
    brightGoldMat
  );
  chaurangLaceRing.rotation.x = Math.PI / 2;
  chaurangLaceRing.position.y = 0.25;
  chaurangGrp.add(chaurangRim, chaurangLaceRing);

  // 8 Sculpted Carved Brass Chaurang Cabriole Legs with Pointed Arch Tips
  const legGeo = trackGeo(new THREE.ConeGeometry(0.09, 0.34, 6));
  for (let l = 0; l < 8; l++) {
    const a = (l / 8) * Math.PI * 2 + Math.PI / 8;
    const leg = new THREE.Mesh(legGeo, antiqueBrassMat);
    leg.rotation.x = Math.PI;
    leg.position.set(Math.cos(a) * 0.86, 0.16, Math.sin(a) * 0.86);
    chaurangGrp.add(leg);
  }

  // Plush Deep Maroon Velvet Circular Cushion (Gadi) atop the Brass Chaurang
  const gadiCushion = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.82, 0.84, 0.24, 32)),
    royalVelvetMat
  );
  gadiCushion.position.y = 0.6;
  const gadiTopDome = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.82, 28, 12, 0, Math.PI * 2, 0, Math.PI * 0.42)),
    royalVelvetMat
  );
  gadiTopDome.scale.set(1, 0.2, 1);
  gadiTopDome.position.y = 0.68;

  // Twin gleaming gold-zari trim borders around the velvet cushion
  for (const ty of [0.5, 0.7]) {
    const zariTrim = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.835, 0.022, 8, 36)),
      brightGoldMat
    );
    zariTrim.rotation.x = Math.PI / 2;
    zariTrim.position.y = ty;
    chaurangGrp.add(zariTrim);
  }
  chaurangGrp.add(gadiCushion, gadiTopDome);

  // --- D. ICONIC BHAGWA SAFFRON & GOLD-ZARI MARATHA JIRETOP / PAGDI (HERO CENTERPIECE!) ---
  const jiretopGrp = new THREE.Group();
  jiretopGrp.position.set(0, 0.78, 0.02);
  chaurangGrp.add(jiretopGrp);

  // Sculpted Asymmetrical Tapered Turban Core (exact iconic Maratha tilted silhouette!)
  const jiretopSegU = 36;
  const jiretopSegV = 24;
  const jPos: number[] = [];
  const jUvs: number[] = [];
  const jIdx: number[] = [];

  for (let iv = 0; iv <= jiretopSegV; iv++) {
    const t = iv / jiretopSegV; // 0 = base -> 1 = tilted saffron crown peak
    const y = t * 1.18;
    // Slight noble asymmetric tilt toward upper-left-back matching Chhaava/historical Maratha pagdi!
    const cx = -Math.pow(t, 1.35) * 0.22;
    const cz = -Math.pow(t, 1.25) * 0.14;
    // Full rounded base tapering smoothly to the upper crown knot
    const profile =
      t < 0.22
        ? THREE.MathUtils.lerp(0.56, 0.68, Math.sin((t / 0.22) * (Math.PI / 2)))
        : THREE.MathUtils.lerp(0.68, 0.24, Math.pow((t - 0.22) / 0.78, 1.18));
    // Subtle cloth-wrap ripple ridges along height
    const pleat = Math.sin(t * Math.PI * 12) * 0.018 * (1 - t * 0.5);

    for (let iu = 0; iu <= jiretopSegU; iu++) {
      const u = iu / jiretopSegU;
      const a = u * Math.PI * 2;
      const rx = (profile + pleat) * 1.04;
      const rz = (profile + pleat) * 0.96;
      jPos.push(cx + Math.cos(a) * rx, y, cz + Math.sin(a) * rz);
      jUvs.push(u * 2.0, t * 1.6);
    }
  }
  for (let iv = 0; iv < jiretopSegV; iv++) {
    for (let iu = 0; iu < jiretopSegU; iu++) {
      const a = iv * (jiretopSegU + 1) + iu;
      const b = a + jiretopSegU + 1;
      const c = b + 1;
      const d = a + 1;
      jIdx.push(a, b, d);
      jIdx.push(b, c, d);
    }
  }
  const jiretopCoreGeo = trackGeo(new THREE.BufferGeometry());
  jiretopCoreGeo.setAttribute('position', new THREE.Float32BufferAttribute(jPos, 3));
  jiretopCoreGeo.setAttribute('uv', new THREE.Float32BufferAttribute(jUvs, 2));
  jiretopCoreGeo.setIndex(jIdx);
  jiretopCoreGeo.computeVertexNormals();

  const jiretopCoreMesh = new THREE.Mesh(jiretopCoreGeo, jiretopSilkMat);
  jiretopGrp.add(jiretopCoreMesh);

  // 6 Layered 3D Sculpted Diagonal Saffron & Gold-Zari Cloth Bands for Rich Volumetric Relief
  for (let f = 0; f < 6; f++) {
    const t = 0.14 + f * 0.14;
    const rBand = THREE.MathUtils.lerp(0.65, 0.34, t);
    const foldRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(rBand, 0.055 - t * 0.015, 10, 32)),
      f % 2 === 0 ? saffronFoldMat : jiretopSilkMat
    );
    foldRing.position.set(-t * 0.2, 0.14 + t * 0.96, -t * 0.11);
    foldRing.rotation.set(Math.PI / 2 - 0.24, 0.16, 0.14);
    jiretopGrp.add(foldRing);

    // Delicate gleaming gold zari piping hugging each diagonal cloth fold
    const zariPiping = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(rBand + 0.025, 0.016, 6, 32)),
      brightGoldMat
    );
    zariPiping.position.copy(foldRing.position).add(new THREE.Vector3(0, 0.032, 0.01));
    zariPiping.rotation.copy(foldRing.rotation);
    jiretopGrp.add(zariPiping);
  }

  // Iconic Folded Saffron Turra (Cloth Peak Fan) crowning the upper-left apex of the Jiretop!
  const turraGrp = new THREE.Group();
  turraGrp.position.set(-0.24, 1.18, -0.14);
  turraGrp.rotation.set(-0.18, 0.25, 0.42);
  const turraCollar = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.18, 0.032, 8, 20)),
    brightGoldMat
  );
  turraCollar.rotation.x = Math.PI / 2;
  const turraFan = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.28, 0.16, 0.3, 16)),
    saffronFoldMat
  );
  turraFan.scale.set(1.22, 1.0, 0.62);
  turraFan.position.y = 0.14;
  turraGrp.add(turraCollar, turraFan);
  jiretopGrp.add(turraGrp);

  // INTRICATE JEWELED GOLD & DIAMOND SIRPECH / KALGI ORNAMENT (Front Brow of Jiretop!)
  const sirpechGrp = new THREE.Group();
  sirpechGrp.position.set(0.02, 0.46, 0.59);
  sirpechGrp.rotation.x = -0.22;
  jiretopGrp.add(sirpechGrp);

  // Curved golden filigree chevron wing arms hugging the front of the turban
  for (const side of [-1, 1]) {
    const wingCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.02, 0.04),
      new THREE.Vector3(side * 0.22, -0.02, 0.01),
      new THREE.Vector3(side * 0.4, -0.12, -0.12),
    ]);
    const wingBase = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(wingCurve, 12, 0.044, 8, false)),
      brightGoldMat
    );
    wingBase.scale.set(1, 1.15, 0.55);
    sirpechGrp.add(wingBase);

    // Sparkling diamond/pearl studs inlaid along each filigree wing
    for (let d = 1; d <= 4; d++) {
      const pt = wingCurve.getPoint(d / 4.4);
      const stud = new THREE.Mesh(
        trackGeo(new THREE.SphereGeometry(0.022, 8, 6)),
        diamondJewelMat
      );
      stud.position.copy(pt).add(new THREE.Vector3(0, 0, 0.024));
      sirpechGrp.add(stud);
    }
  }

  // Upright Jeweled Central Sirpech Plume / Crest Finial
  const plumeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.02, 0.05),
    new THREE.Vector3(0.01, 0.2, 0.02),
    new THREE.Vector3(0.04, 0.36, -0.05),
  ]);
  const plumeStem = new THREE.Mesh(
    trackGeo(new THREE.TubeGeometry(plumeCurve, 10, 0.048, 8, false)),
    brightGoldMat
  );
  plumeStem.scale.set(1.1, 1.0, 0.52);
  const centralDiamond = new THREE.Mesh(
    trackGeo(new THREE.OctahedronGeometry(0.056, 1)),
    diamondJewelMat
  );
  centralDiamond.scale.set(0.9, 1.25, 0.55);
  centralDiamond.position.set(0, 0.03, 0.075);
  const topDiamond = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.032, 8, 8)),
    diamondJewelMat
  );
  topDiamond.position.set(0.03, 0.28, 0.015);
  sirpechGrp.add(plumeStem, centralDiamond, topDiamond);

  // SACRED WHITE KAVADYAANCHI MAAL (Cowrie-Shell / Pearl Garland draping around the Jiretop base!)
  const cowrieGeo = trackGeo(new THREE.SphereGeometry(0.055, 10, 8));
  const cowrieCount = 26;
  for (let c = 0; c < cowrieCount; c++) {
    const u = c / (cowrieCount - 1);
    const ang = -Math.PI * 0.72 + u * Math.PI * 1.62;
    const rad = 0.67 + (u > 0.78 ? (u - 0.78) * 0.72 : 0);
    const bead = new THREE.Mesh(cowrieGeo, cowriePearlMat);
    bead.scale.set(1.12, 0.78, 0.88);
    bead.position.set(
      Math.sin(ang) * rad,
      0.04 - (u > 0.82 ? (u - 0.82) * 0.35 : 0),
      Math.cos(ang) * rad
    );
    bead.rotation.y = ang;
    jiretopGrp.add(bead);
  }

  // --- E. BHAVANI TALWAR SWORD IN CRIMSON SCABBARD RESTING ACROSS THE THRONE ---
  const swordGrp = new THREE.Group();
  swordGrp.position.set(0.06, 1.32, -0.58);
  swordGrp.rotation.y = 0.04;
  singhasan.add(swordGrp);

  // Gently Curved Crimson Velvet/Lacquer Scabbard (Myaan) spanning across the bolsters
  const scabbardCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.82, 0.04, 0.06),
    new THREE.Vector3(-0.6, 0.0, 0.01),
    new THREE.Vector3(0.55, 0.0, 0.0),
    new THREE.Vector3(1.18, 0.03, 0.02),
  ]);
  const scabbardMesh = new THREE.Mesh(
    trackGeo(new THREE.TubeGeometry(scabbardCurve, 22, 0.065, 10, false)),
    crimsonScabbardMat
  );
  scabbardMesh.scale.set(1, 1.35, 0.56);

  // Polished Silver-Steel Scabbard Tip (Chape) on left & Throat Locket on right
  const silverChape = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(0.062, 0.36, 10)),
    silverSteelMat
  );
  silverChape.rotation.z = Math.PI / 2 + 0.04;
  silverChape.scale.set(1.25, 1, 0.58);
  silverChape.position.set(-1.92, 0.05, 0.07);

  const silverLocket = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.078, 0.075, 0.34, 12)),
    silverSteelMat
  );
  silverLocket.rotation.z = Math.PI / 2;
  silverLocket.scale.set(1.3, 1, 0.62);
  silverLocket.position.set(1.04, 0.03, 0.02);

  // Authentic Maratha Talwar Hilt (Silver Crossguard, Crimson-Lined Knuckle Bow, Gold Grip & Disc Pommel!)
  const hiltGrp = new THREE.Group();
  hiltGrp.position.set(1.26, 0.03, 0.02);
  const crossGuard = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.07, 0.36, 0.08)),
    silverSteelMat
  );
  const hiltGrip = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.044, 0.048, 0.42, 12)),
    brightGoldMat
  );
  hiltGrip.rotation.z = Math.PI / 2;
  hiltGrip.position.x = 0.22;

  const discPommel = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.135, 0.135, 0.04, 18)),
    silverSteelMat
  );
  discPommel.rotation.z = Math.PI / 2;
  discPommel.position.x = 0.44;

  const knuckleBow = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.22, 0.028, 8, 18, Math.PI)),
    silverSteelMat
  );
  knuckleBow.position.set(0.22, 0.03, 0);
  // Crimson velvet inner padding inside the curved Maratha knuckle guard (exact detail from Image 1!)
  const bowVelvet = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.19, 0.026, 8, 16, Math.PI * 0.92)),
    crimsonScabbardMat
  );
  bowVelvet.position.set(0.22, 0.03, 0);

  hiltGrp.add(crossGuard, hiltGrip, discPommel, knuckleBow, bowVelvet);
  swordGrp.add(scabbardMesh, silverChape, silverLocket, hiltGrp);

  // --- F. FOLDED ROYAL PURPLE-AND-GOLD SHELA SHAWL (LEFT) & GOLDEN MOJARI (RIGHT) ---
  // Folded Purple Brocade Shela draping gracefully over the left front of the velvet seat (Image 1!)
  const shelaGrp = new THREE.Group();
  shelaGrp.position.set(-1.12, 0.96, 0.68);
  shelaGrp.rotation.y = 0.08;
  const shelaTop = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.68, 0.09, 1.18)),
    purpleShelaMat
  );
  const shelaDrape = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.68, 0.56, 0.08)),
    purpleShelaMat
  );
  shelaDrape.position.set(0, -0.28, 0.58);
  shelaDrape.rotation.x = -0.1;
  // Woven gold zari border strips across the purple Shela
  const shelaGoldBand = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.69, 0.06, 0.1)),
    brightGoldMat
  );
  shelaGoldBand.position.set(0, -0.44, 0.6);
  const shelaGoldStripe = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.69, 0.095, 0.08)),
    brightGoldMat
  );
  shelaGoldStripe.position.set(0, 0.005, 0.24);
  shelaGrp.add(shelaTop, shelaDrape, shelaGoldBand, shelaGoldStripe);
  singhasan.add(shelaGrp);

  // Pair of Golden Royal Maratha Mojari Footwear resting reverently on the right (Images 2 & 3!)
  const buildMojari = () => {
    const shoe = new THREE.Group();
    const sole = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.22, 0.09, 0.46)),
      antiqueBrassMat
    );
    sole.position.y = 0.05;
    const innerVelvet = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.16, 0.07, 0.28)),
      royalVelvetMat
    );
    innerVelvet.position.set(0, 0.08, -0.06);
    const vamp = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.115, 12, 10)),
      brightGoldMat
    );
    vamp.scale.set(1.0, 0.72, 1.35);
    vamp.position.set(0, 0.08, 0.14);
    // Signature upturned curled Maratha Mojari toe tip
    const curlCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.06, 0.22),
      new THREE.Vector3(0, 0.12, 0.34),
      new THREE.Vector3(0, 0.24, 0.32),
    ]);
    const curlToe = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(curlCurve, 10, 0.032, 8, false)),
      brightGoldMat
    );
    shoe.add(sole, innerVelvet, vamp, curlToe);
    return shoe;
  };

  const mojariL = buildMojari();
  mojariL.position.set(1.04, 0.94, 0.78);
  mojariL.rotation.y = -0.26;
  const mojariR = buildMojari();
  mojariR.position.set(1.32, 0.94, 0.68);
  mojariR.rotation.y = -0.14;
  singhasan.add(mojariL, mojariR);

  if (!isSoftwareGl) {
    singhasan.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
      }
    });
  }

  // =========================================================================
  // 5. DEDICATED ROYAL MUSEUM SPOTLIGHTING (Highlights Saffron Jiretop & Gold Prabhavali)
  // =========================================================================
  const singhasanKeyLight = new THREE.PointLight(0xffd68e, 2.0, 22, 1.4);
  singhasanKeyLight.position.set(0.6, 7.6, 4.6);
  const jiretopAccentLight = new THREE.PointLight(0xffe9bf, 2.2, 12, 1.45);
  jiretopAccentLight.position.set(-0.6, 6.9, 2.6);
  const prabhavaliRimLight = new THREE.PointLight(0xffc970, 1.2, 16, 1.4);
  prabhavaliRimLight.position.set(0, 8.6, -2.4);
  monument.add(singhasanKeyLight, jiretopAccentLight, prabhavaliRimLight);

  return (elapsed: number, nightMix: number) => {
    singhasanKeyLight.intensity = THREE.MathUtils.lerp(2.2, 15.5, nightMix);
    jiretopAccentLight.intensity = THREE.MathUtils.lerp(2.4, 8.8, nightMix);
    prabhavaliRimLight.intensity = THREE.MathUtils.lerp(1.2, 10.2, nightMix);
    plaqueMat.emissiveIntensity = THREE.MathUtils.lerp(0.24, 1.15, nightMix);
    diamondJewelMat.emissiveIntensity =
      THREE.MathUtils.lerp(0.35, 0.95, nightMix) + Math.sin(elapsed * 3.2) * 0.14;
    cascadeWaterMat.emissiveIntensity = THREE.MathUtils.lerp(0.16, 0.72, nightMix);

    for (let i = 0; i < cascadeMeshes.length; i++) {
      cascadeMeshes[i].scale.y = 0.96 + Math.sin(elapsed * 4.5 + i * 1.4) * 0.04;
    }
  };
}
