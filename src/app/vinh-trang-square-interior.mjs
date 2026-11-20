function makeLocalCanvasTex(THREE, drawFn, w = 512, h = 512, repeatX = 1, repeatY = 1) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  drawFn(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeatX > 1 || repeatY > 1) {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeatX, repeatY);
  }
  t.anisotropy = 8;
  return t;
}

/**
 * Builds the authentic unified Chùa Vĩnh Tràng Chữ Quốc ("Hình Vuông") interior:
 * - Center: Open-sky Hồ Sen Bộ & Hòn Non Bộ (x ∈ [-10.6, +10.6], z ∈ [-10.6, +10.6]) ringed by yellow Franco-Khmer arches.
 * - West Side (facing across Hồ Sen Bộ, x = -15.2 .. -36.5):
 *     * Sunlit covered veranda outside the carved wooden Tam Môn Bức Bàn Chánh Điện doorway (x = -15.2)
 *     * Shoe-removal racks + sandals + "BỎ GIÀY DÉP NGOÀI CỬA" outside the door
 *     * Meshy PBR Trống Bát Nhã right beside the doorway (+Z) & Tháp Đèn Cầu An symmetrically (-Z)
 *     * Grand Main Chánh Điện Hall (21.3m × 23.6m): exposed timber vì kèo trusses, gilded Bao Lam GLB,
 *       wide-spaced Long Trụ GLBs, uncluttered Ban Thờ Tam Bảo with sculpted gilded GLB Buddhas,
 *       Đại Hồng Chung & Mõ Gỗ tucked cleanly to the sides, and 18 Vị La Hán on North/South wall plinths inside!
 * - North Edge (z = -10.6 .. -20.8): Spacious, wide-open Tổ Đường (Ban Thờ Tổ Sư Đạt Ma GLB) with >6m unobstructed walkway.
 * - East Corridor (x = +10.6 .. +32.0, z = +20.8 .. -38.0):
 *     * Extended ~59m long corridor & widened open East veranda/reception pavilion (+X out to 32.0)
 *     * 8 authentic sculpted GLB Buddha/Bodhisattva shrines lining the corridor (zero handmade primitive statues!)
 *     * Sunlit open 3-arch North Exit Portal (z = -37.8) looking directly out to the outdoor Buddha garden & transitioning outside.
 */
export function buildSquareChanhDienInterior(world, THREE) {
  const M = world.MAT;
  const g = world.interiorGroup;

  if (typeof world.makeSignTexture !== 'function') {
    world.makeSignTexture = (text, opts = {}) => {
      const w = opts.w || 860;
      const h = opts.h || 140;
      const bg = opts.bg || '#4A120E';
      const border = opts.border || '#D9A93E';
      const color = opts.color || '#FFE8A3';
      const size = opts.size || 32;
      return makeLocalCanvasTex(
        THREE,
        (ctx) => {
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = border;
          ctx.lineWidth = Math.max(4, Math.round(h * 0.045));
          ctx.strokeRect(8, 8, w - 16, h - 16);
          ctx.lineWidth = 2;
          ctx.strokeRect(16, 16, w - 32, h - 32);
          ctx.fillStyle = color;
          ctx.font = `700 ${size}px "Noto Serif", "Times New Roman", Georgia, serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(text || ''), w / 2, h / 2 + 2, w - 48);
        },
        w,
        h
      );
    };
  }

  if (typeof world.makeVerticalCalligraphyTex !== 'function') {
    world.makeVerticalCalligraphyTex = (text) => {
      const w = 160;
      const h = 960;
      return makeLocalCanvasTex(
        THREE,
        (ctx) => {
          ctx.fillStyle = '#3B0F0B';
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = '#E0AF42';
          ctx.lineWidth = 6;
          ctx.strokeRect(8, 8, w - 16, h - 16);
          ctx.fillStyle = '#FFE48F';
          const words = String(text || '').trim().split(/\s+/).filter(Boolean);
          const step = (h - 120) / Math.max(1, words.length);
          ctx.font = '700 34px "Noto Serif", "Times New Roman", Georgia, serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          words.forEach((word, idx) => {
            ctx.fillText(word, w / 2, 60 + step * (idx + 0.5), w - 28);
          });
        },
        w,
        h
      );
    };
  }

  // Reset all interior interaction arrays, anchors & obstacle lists
  world.arhatGroups = [];
  world.arhatSlotSpecs = [];
  world.interiorDoorClickTargets = [];
  world.interiorNonBoClickTargets = [];
  world.interiorKhuThoClickTargets = [];
  world.interiorTraiDuongClickTargets = [];
  world.interiorBellClickTargets = [];
  world.interiorDrumClickTargets = [];
  world.longTruClickTargets = [];
  world.nghinMatClickTargets = [];
  world.choNguClickTargets = [];
  world.rightGalleryClickTargets = [];
  world.eastCorridorShrines = [];
  world.cutawayTargets = [];
  world.spiralIncenseAnchors = [];
  world.longTruPlaceholders = [];
  world.khuThoPlaceholderParts = [];
  world.interiorObstacles = [];
  world.interiorRectObstacles = [];

  const registerCutaway = (obj) => {
    world.cutawayTargets.push(obj);
    return obj;
  };

  // Materials grounded in real Chùa Vĩnh Tràng photography
  const slateTileTex = makeLocalCanvasTex(
    THREE,
    (ctx, w, h) => {
      ctx.fillStyle = '#36261C';
      ctx.fillRect(0, 0, w, h);
      const step = w / 4;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const jitter = ((r * 7 + c * 11) % 11) - 5;
          const R = 82 + jitter;
          const G = 60 + Math.round(jitter * 0.7);
          const B = 45 + Math.round(jitter * 0.5);
          ctx.fillStyle = `rgb(${R}, ${G}, ${B})`;
          ctx.fillRect(c * step + 3, r * step + 3, step - 6, step - 6);
          ctx.strokeStyle = 'rgba(28, 17, 11, 0.52)';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(c * step + 3.5, r * step + 3.5, step - 7, step - 7);
        }
      }
    },
    512,
    512,
    34,
    34
  );
  const slateFloorMat = new THREE.MeshStandardMaterial({
    map: slateTileTex,
    roughness: 0.56,
    metalness: 0.02,
    envMapIntensity: 0.28
  });
  const gachTauMat = new THREE.MeshStandardMaterial({
    map: world.gachTauTex,
    color: 0xCF7F5C,
    roughness: 0.54,
    metalness: 0.02,
    envMapIntensity: 0.3
  });
  const wallWoodMat = new THREE.MeshStandardMaterial({
    color: 0x5C331C,
    map: world.woodGrainTex,
    roughness: 0.5,
    envMapIntensity: 0.28
  });
  const agedWallTex = makeLocalCanvasTex(
    THREE,
    (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#7A5E42');
      grad.addColorStop(0.55, '#8F7152');
      grad.addColorStop(1, '#684E37');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 180; i++) {
        const px = (i * 193) % w;
        const pw = 6 + (i % 18);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(48, 30, 16, 0.038)' : 'rgba(170, 136, 98, 0.035)';
        ctx.fillRect(px, 0, pw, h);
      }
    },
    512,
    512,
    3,
    1
  );
  const creamPlasterMat = new THREE.MeshStandardMaterial({
    map: agedWallTex,
    color: 0xFFF7E8,
    roughness: 0.8,
    metalness: 0.02,
    envMapIntensity: 0.24
  });
  const frenchOchreMat = new THREE.MeshStandardMaterial({
    color: 0xCFA042,
    roughness: 0.54,
    envMapIntensity: 0.25
  });
  const frenchCreamMat = new THREE.MeshStandardMaterial({
    color: 0xE7D8BA,
    roughness: 0.56,
    envMapIntensity: 0.24
  });
  const terraTrimMat = new THREE.MeshStandardMaterial({
    color: 0xA84B2A,
    roughness: 0.54,
    envMapIntensity: 0.24
  });
  const darkLacquerColMat = new THREE.MeshStandardMaterial({
    color: 0x5A2A14,
    map: world.woodGrainTex,
    roughness: 0.36,
    metalness: 0.06,
    envMapIntensity: 0.34
  });
  const goldLeafMat = new THREE.MeshStandardMaterial({
    color: 0xE5B43D,
    metalness: 0.65,
    roughness: 0.24,
    envMapIntensity: 0.52
  });
  const bronzePatinaMat = new THREE.MeshStandardMaterial({
    color: 0x876434,
    metalness: 0.52,
    roughness: 0.36,
    envMapIntensity: 0.4
  });
  const crimsonWoodMat = new THREE.MeshStandardMaterial({
    color: 0x721E15,
    roughness: 0.42,
    metalness: 0.05,
    envMapIntensity: 0.28
  });
  const baoLamMat = new THREE.MeshStandardMaterial({
    color: 0x582815,
    roughness: 0.38,
    metalness: 0.12,
    envMapIntensity: 0.32
  });
  const ceilingPlankTex = makeLocalCanvasTex(
    THREE,
    (ctx, w, h) => {
      ctx.fillStyle = '#6B3B1E';
      ctx.fillRect(0, 0, w, h);
      const planks = 8;
      const pw = w / planks;
      for (let i = 0; i < planks; i++) {
        const shade = (i % 3) * 7;
        ctx.fillStyle = `rgb(${112 + shade}, ${62 + Math.round(shade * 0.6)}, ${32 + Math.round(shade * 0.4)})`;
        ctx.fillRect(i * pw + 2, 0, pw - 4, h);
        ctx.fillStyle = '#3E200F';
        ctx.fillRect(i * pw, 0, 3, h);
      }
    },
    512,
    512,
    6,
    6
  );
  const rafterMat = new THREE.MeshStandardMaterial({
    color: 0x874B28,
    map: world.woodGrainTex,
    roughness: 0.52,
    emissive: 0x261207,
    emissiveIntensity: 0.32,
    envMapIntensity: 0.28
  });
  const ceilingWoodMat = new THREE.MeshStandardMaterial({
    map: ceilingPlankTex,
    color: 0xFFFFFF,
    roughness: 0.62,
    emissive: 0x241207,
    emissiveIntensity: 0.34,
    envMapIntensity: 0.28
  });
  const carpetRunnerMat = new THREE.MeshStandardMaterial({
    color: 0x7C1D16,
    roughness: 0.82
  });
  const shutterGreenMat = new THREE.MeshStandardMaterial({ color: 0x26543A, roughness: 0.55 });
  const daylightGlassMat = new THREE.MeshBasicMaterial({ color: 0xEDF6E4 });

  // =========================================================================================
  // 1. UNIFIED FLOORING FOR ALL 4 WINGS
  //    - Central Square + North/South Galleries + Wide East Wing: x ∈ [-15.5, +32.0], z ∈ [-21.0, +21.0]
  //    - Extended North-East Corridor Wing: x ∈ [+10.6, +32.0], z ∈ [-56.6, -21.0] (~77m total length matching GeoJSON way/695981299!)
  //    - West Grand Chánh Điện Hall (with center Buddha facing outward toward Cổng Tam Quan + walkaround aisles):
  //      x ∈ [-41.6, -15.2], z ∈ [-11.8, +11.8]
  // =========================================================================================
  const mainSquareFloor = new THREE.Mesh(new THREE.PlaneGeometry(47.8, 42.0), slateFloorMat);
  mainSquareFloor.rotation.x = -Math.PI / 2;
  mainSquareFloor.position.set(8.3, 0, 0);
  mainSquareFloor.receiveShadow = true;
  g.add(mainSquareFloor);

  const eastNorthExtFloor = new THREE.Mesh(new THREE.PlaneGeometry(21.6, 35.6), slateFloorMat);
  eastNorthExtFloor.rotation.x = -Math.PI / 2;
  eastNorthExtFloor.position.set(21.4, 0, -38.8);
  eastNorthExtFloor.receiveShadow = true;
  g.add(eastNorthExtFloor);

  // Grand Chánh Điện Hall warm terracotta tile floor — MỞ RỘNG CHỨA 100+ PHẬT TỬ (x ∈ [-62.6, -15.2], z ∈ [-21.0, +21.0])
  const chanhDienFloor = new THREE.Mesh(new THREE.PlaneGeometry(47.8, 42.2), gachTauMat);
  chanhDienFloor.rotation.x = -Math.PI / 2;
  chanhDienFloor.position.set(-38.9, 0.012, 0);
  chanhDienFloor.receiveShadow = true;
  g.add(chanhDienFloor);

  // Ceremonial crimson carpet runner in FRONT of the outward-facing Buddha (x = -61.8 to Tam Bảo front x = -26.8)
  const chanhDienRunner = new THREE.Mesh(new THREE.PlaneGeometry(35.2, 4.4), carpetRunnerMat);
  chanhDienRunner.rotation.x = -Math.PI / 2;
  chanhDienRunner.position.set(-44.3, 0.018, 0);
  chanhDienRunner.receiveShadow = true;
  g.add(chanhDienRunner);

  // Side ceremonial carpet aisles flanking the 112-cushion worship blocks (z = ±10.5)
  for (const aisleZ of [-10.5, 10.5]) {
    const sideAisleRunner = new THREE.Mesh(new THREE.PlaneGeometry(39.0, 2.2), carpetRunnerMat);
    sideAisleRunner.rotation.x = -Math.PI / 2;
    sideAisleRunner.position.set(-41.5, 0.017, aisleZ);
    sideAisleRunner.receiveShadow = true;
    g.add(sideAisleRunner);
  }

  // Guiding crimson walkaround runners ("Lối đi vòng hai bên vào Chánh Điện chiêm bái Phật")
  const rearVestibuleRunner = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 23.0), carpetRunnerMat);
  rearVestibuleRunner.rotation.x = -Math.PI / 2;
  rearVestibuleRunner.position.set(-18.6, 0.017, 0);
  rearVestibuleRunner.receiveShadow = true;
  g.add(rearVestibuleRunner);
  const rearDoorEntryStrip = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.2), carpetRunnerMat);
  rearDoorEntryStrip.rotation.x = -Math.PI / 2;
  rearDoorEntryStrip.position.set(-16.9, 0.017, 0);
  rearDoorEntryStrip.receiveShadow = true;
  g.add(rearDoorEntryStrip);

  // Open-sky Center Courtyard terracotta paving ("Sân Thiên Tỉnh Hình Vuông" — 21.2m × 21.2m)
  const centerTerracotta = new THREE.Mesh(new THREE.PlaneGeometry(21.2, 21.2), gachTauMat);
  centerTerracotta.rotation.x = -Math.PI / 2;
  centerTerracotta.position.set(0, 0.016, 0);
  centerTerracotta.receiveShadow = true;
  g.add(centerTerracotta);

  // Continuous crimson lotus carpet runner along the ENTIRE ~74m Extended East Arrival Corridor
  const rightGalleryRunner = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 74.0), carpetRunnerMat);
  rightGalleryRunner.rotation.x = -Math.PI / 2;
  rightGalleryRunner.position.set(16.0, 0.014, -17.8);
  rightGalleryRunner.receiveShadow = true;
  g.add(rightGalleryRunner);

  // =========================================================================================
  // 2. OUTER PERIMETER WALLS, WINDOWS & COLLISION BOXES (WATERTIGHT)
  // =========================================================================================

  // 2A. North Wall of Main Square (z = -20.8, x ∈ [-15.5 .. +10.6]) behind spacious Tổ Đường
  const northSquareWall = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(26.4, 8.8, 0.48), creamPlasterMat));
  northSquareWall.position.set(-2.4, 4.4, -20.8);
  northSquareWall.receiveShadow = true;
  g.add(northSquareWall);
  const northSquareWainscot = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(26.2, 1.85, 0.54), wallWoodMat));
  northSquareWainscot.position.set(-2.4, 0.92, -20.72);
  g.add(northSquareWainscot);
  for (let px = -13.2; px <= 9.2; px += 4.4) {
    const nPilaster = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(0.26, 8.8, 0.34), wallWoodMat));
    nPilaster.position.set(px, 4.4, -20.55);
    g.add(nPilaster);
  }

  // 2B. West Closure Walls flanking the Chánh Điện Entrance (x = -15.5 for z ∈ [-20.8..-11.8] and z ∈ [+11.8..+20.8])
  for (const wz of [-16.3, 16.3]) {
    const wCap = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(0.48, 8.8, 9.2), creamPlasterMat));
    wCap.position.set(-15.5, 4.4, wz);
    wCap.receiveShadow = true;
    g.add(wCap);
    const wWain = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(0.54, 1.85, 9.0), wallWoodMat));
    wWain.position.set(-15.42, 0.92, wz);
    g.add(wWain);
  }

  // 2C. South Wall (z = +20.8, x ∈ [-15.5 .. +32.0]) with Bottom-Right Entrance Portal at x = +15.5
  const southWallLeft = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(29.0, 8.8, 0.48), creamPlasterMat));
  southWallLeft.position.set(-1.0, 4.4, 20.8);
  g.add(southWallLeft);
  const southWainscotL = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(28.8, 1.85, 0.54), wallWoodMat));
  southWainscotL.position.set(-1.0, 0.92, 20.72);
  g.add(southWainscotL);

  const southWallRight = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(14.8, 8.8, 0.48), creamPlasterMat));
  southWallRight.position.set(24.9, 4.4, 20.8);
  g.add(southWallRight);
  const southWainscotR = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(14.6, 1.85, 0.54), wallWoodMat));
  southWainscotR.position.set(24.9, 0.92, 20.72);
  g.add(southWainscotR);

  const southPortalHeader = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(4.4, 4.6, 0.5), creamPlasterMat));
  southPortalHeader.position.set(15.5, 6.5, 20.8);
  g.add(southPortalHeader);

  // Decorative closed ceremonial front doors at (0, 0, +20.48)
  const closedFrontGroup = new THREE.Group();
  closedFrontGroup.position.set(0, 0, 20.48);
  const cfFrame = new THREE.Mesh(new THREE.BoxGeometry(5.6, 4.6, 0.28), wallWoodMat);
  cfFrame.position.y = 2.3;
  closedFrontGroup.add(cfFrame);
  const cfPanel = new THREE.Mesh(new THREE.BoxGeometry(4.8, 4.1, 0.34), crimsonWoodMat);
  cfPanel.position.y = 2.08;
  closedFrontGroup.add(cfPanel);
  const cfNote = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 0.52),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('CỬA CHÍNH NGHI LỄ · LỐI VÀO/RA Ở GÓC DƯỚI BÊN PHẢI →', {
        w: 980,
        h: 160,
        bg: '#4A1812',
        border: '#E6B84C',
        color: '#FFF4D6',
        size: 30
      })
    })
  );
  cfNote.rotation.y = Math.PI;
  cfNote.position.set(0, 3.85, -0.2);
  closedFrontGroup.add(cfNote);
  registerCutaway(closedFrontGroup);
  g.add(closedFrontGroup);

  // 2D. Far East Perimeter Wall pushed wide to x = +32.0 (z ∈ [-56.4 .. +20.8], length 77.2m matching GeoJSON!)
  const farEastWall = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(0.48, 8.8, 77.6), creamPlasterMat));
  farEastWall.position.set(32.0, 4.4, -17.8);
  farEastWall.receiveShadow = true;
  g.add(farEastWall);
  const farEastWainscot = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(0.54, 1.85, 77.2), wallWoodMat));
  farEastWainscot.position.set(31.92, 0.92, -17.8);
  g.add(farEastWainscot);
  for (let pz = -54.0; pz <= 18.0; pz += 6.0) {
    const pilaster = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(0.24, 8.8, 0.34), wallWoodMat));
    pilaster.position.set(31.72, 4.4, pz);
    g.add(pilaster);
  }
  // 12 Tall Arched French-Colonial Green Shutter Windows along Far East Wall (sunlight pouring in!)
  for (const wz of [-51.0, -45.0, -39.0, -33.0, -27.0, -21.0, -15.0, -9.0, -3.0, 3.0, 9.0, 15.0]) {
    const winGrp = new THREE.Group();
    winGrp.position.set(31.72, 3.35, wz);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.85, 1.56), frenchCreamMat);
    winGrp.add(frame);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.48, 1.24), daylightGlassMat);
    winGrp.add(glass);
    const archTop = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.09, 8, 16, Math.PI), frenchOchreMat);
    archTop.rotation.y = Math.PI / 2;
    archTop.position.set(-0.04, 1.38, 0);
    winGrp.add(archTop);
    for (const sz of [-0.76, 0.76]) {
      const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.5, 0.56), shutterGreenMat);
      shutter.position.set(-0.22, 0, sz + (sz < 0 ? -0.18 : 0.18));
      shutter.rotation.y = sz < 0 ? -0.45 : 0.45;
      winGrp.add(shutter);
    }
    registerCutaway(winGrp);
    g.add(winGrp);
  }

  // 2E. West Wall of the Extended North-East Corridor Wing (x = +10.6, z ∈ [-56.4 .. -20.8])
  //     Features sunlit yellow-and-cream Franco-Khmer arched garden windows overlooking the Northern garden!
  const extWestWall = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(0.46, 8.8, 35.8), frenchCreamMat));
  extWestWall.position.set(10.6, 4.4, -38.6);
  extWestWall.receiveShadow = true;
  g.add(extWestWall);
  const extWestWain = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(0.52, 1.5, 35.6), frenchOchreMat));
  extWestWain.position.set(10.66, 0.75, -38.6);
  g.add(extWestWain);
  for (const wz of [-24.0, -30.0, -36.0, -42.0, -48.0, -53.2]) {
    const gWin = new THREE.Group();
    gWin.position.set(10.82, 3.25, wz);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.9, 2.2), frenchOchreMat);
    gWin.add(frame);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.5, 1.85), daylightGlassMat);
    gWin.add(glass);
    const archTop = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.1, 8, 18, Math.PI), frenchOchreMat);
    archTop.rotation.y = Math.PI / 2;
    archTop.position.set(0.05, 1.25, 0);
    gWin.add(archTop);
    registerCutaway(gWin);
    g.add(gWin);
  }

  // Solid perimeter wall obstacles (matching the exact 77m extended footprint!)
  world.interiorRectObstacles.push(
    // North wall of main square (left of East corridor)
    { minX: -16.0, maxX: 10.6, minZ: -21.2, maxZ: -20.3 },
    // West wall of Extended North-East Corridor
    { minX: 10.1, maxX: 11.0, minZ: -56.6, maxZ: -20.5 },
    // West closure caps north & south of Chánh Điện Hall
    { minX: -16.0, maxX: -15.1, minZ: -21.2, maxZ: -11.6 },
    { minX: -16.0, maxX: -15.1, minZ: 11.6, maxZ: 21.2 },
    // South wall (leaving entrance portal open at x ∈ [13.4, 17.6])
    { minX: -16.0, maxX: 13.4, minZ: 20.3, maxZ: 21.2 },
    { minX: 17.6, maxX: 32.4, minZ: 20.3, maxZ: 21.2 },
    // Far East perimeter wall (x = +32.0)
    { minX: 31.6, maxX: 32.5, minZ: -56.6, maxZ: 21.2 },
    // Grand Chánh Điện outer walls — MỞ RỘNG 100+ PHẬT TỬ (North z = -20.8, South z = +20.8, West Front Facade x = -62.4)
    { minX: -63.0, maxX: -15.2, minZ: -21.4, maxZ: -20.4 },
    { minX: -63.0, maxX: -15.2, minZ: 20.4, maxZ: 21.4 },
    { minX: -63.0, maxX: -61.8, minZ: -21.4, maxZ: 21.4 },
    // North wall flanking the Open Sunlit Exit Archway at z = -56.0 (open x ∈ [12.5, 22.0])
    { minX: 10.2, maxX: 12.6, minZ: -56.6, maxZ: -55.4 },
    { minX: 22.0, maxX: 32.4, minZ: -56.6, maxZ: -55.4 }
  );

  // =========================================================================================
  // 3. COVERED ROOF CEILINGS & TRADITIONAL WOODEN RAFTERS
  // =========================================================================================
  const roofSlabs = [
    // North gallery roof (above Tổ Đường)
    { w: 26.2, d: 10.4, x: -2.4, z: -15.7 },
    // South gallery roof
    { w: 26.2, d: 10.4, x: -2.4, z: 15.7 },
    // West veranda roof between Hồ Sen Bộ (-10.6) and Chánh Điện doors (-15.4)
    { w: 5.0, d: 21.2, x: -13.0, z: 0 },
    // Entire Wide Extended East Wing roof (x = +10.6 .. +32.2, z = -56.6 .. +21.0)
    { w: 21.8, d: 77.8, x: 21.4, z: -17.8 },
    // Grand West Chánh Điện Hall roof — 100+ Pilgrim Nave (x = -62.8 .. -15.2, z = -21.0 .. +21.0)
    { w: 48.0, d: 42.4, x: -39.0, z: 0 }
  ];
  for (const rs of roofSlabs) {
    const ceil = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(rs.w, 0.28, rs.d), ceilingWoodMat));
    ceil.position.set(rs.x, 8.85, rs.z);
    g.add(ceil);
  }
  // Transverse rafters across the full 77m Extended East Wing
  for (let z = -54.8; z <= 19.5; z += 3.55) {
    const eastBeam = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(21.2, 0.24, 0.22), rafterMat));
    eastBeam.position.set(21.3, 8.55, z);
    g.add(eastBeam);
  }
  for (const px of [14.0, 18.8, 24.6, 29.2]) {
    const purlin = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 77.0), rafterMat));
    purlin.position.set(px, 8.34, -17.8);
    g.add(purlin);
  }

  // Structural dark-lacquer heritage columns framing the open aisles (spaced cleanly, never blocking traffic!)
  const addLacquerColumn = (cx, cz, radius = 0.25, height = 8.4, withObstacle = true) => {
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(radius * 2.7, 0.32, radius * 2.7), M.stoneLight);
    plinth.position.set(cx, 0.16, cz);
    g.add(plinth);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.9, radius, height, 18), darkLacquerColMat);
    shaft.position.set(cx, 0.32 + height / 2, cz);
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    g.add(shaft);
    const goldBand = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.04, radius * 1.04, 0.15, 18), goldLeafMat);
    goldBand.position.set(cx, 7.6, cz);
    g.add(goldBand);
    if (withObstacle) {
      world.interiorObstacles.push({ x: cx, z: cz, r: radius + 0.14 });
    }
  };
  for (const cz of [-16.2, 16.2]) {
    addLacquerColumn(-12.0, cz, 0.24, 8.3, true);
    addLacquerColumn(11.6, cz, 0.24, 8.3, true);
  }
  // Rhythmic left-side columns extending along the long North-East corridor wing
  for (const cz of [-27.0, -37.8, -48.6]) {
    addLacquerColumn(11.6, cz, 0.23, 8.3, true);
  }
  // Open arcade columns separating East Shrine aisle (x = 22.8) from the bright spacious East Veranda (x = 25..31.8)
  for (let cz = -52.8; cz <= 16.5; cz += 8.8) {
    addLacquerColumn(25.2, cz, 0.23, 8.3, true);
  }

  // Helper: Realistic Vietnamese Temple Shoe Rack + Sandals/Slippers left outside doors
  const buildShoeRackUnit = (rackW = 1.65, tiers = 3) => {
    const rg = new THREE.Group();
    const frameWood = new THREE.MeshStandardMaterial({ color: 0x5C341B, roughness: 0.58 });
    const coirMat = new THREE.MeshStandardMaterial({ color: 0x9C7444, roughness: 0.92 });
    const sandalColors = [0xC84B31, 0x2D5A7B, 0xD9A441, 0x4E6E58, 0xEAE0CC, 0x6E3B2B];
    for (const sx of [-rackW / 2 + 0.06, rackW / 2 - 0.06]) {
      for (const sz of [-0.18, 0.18]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, tiers * 0.24 + 0.08, 0.05), frameWood);
        leg.position.set(sx, (tiers * 0.24 + 0.08) / 2, sz);
        rg.add(leg);
      }
    }
    for (let t = 0; t < tiers; t++) {
      const sy = 0.12 + t * 0.23;
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(rackW, 0.03, 0.4), frameWood);
      shelf.position.set(0, sy, 0);
      rg.add(shelf);
      const pairCount = Math.max(2, Math.floor(rackW / 0.36));
      for (let p = 0; p < pairCount; p++) {
        const px = -rackW * 0.38 + (p / Math.max(1, pairCount - 1)) * (rackW * 0.76);
        const sMat = new THREE.MeshStandardMaterial({
          color: sandalColors[(t * 5 + p) % sandalColors.length],
          roughness: 0.65
        });
        for (const foot of [-0.055, 0.055]) {
          const sole = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.024, 0.22), sMat);
          sole.position.set(px + foot, sy + 0.028, 0);
          sole.rotation.y = p % 2 === 0 ? 0.05 : -0.05;
          rg.add(sole);
          const strap = new THREE.Mesh(new THREE.BoxGeometry(0.088, 0.026, 0.07), frameWood);
          strap.position.set(px + foot, sy + 0.046, 0.02);
          rg.add(strap);
        }
      }
    }
    const matMesh = new THREE.Mesh(new THREE.BoxGeometry(rackW * 0.92, 0.018, 0.52), coirMat);
    matMesh.position.set(0, 0.009, 0.48);
    rg.add(matMesh);
    for (let s = 0; s < 3; s++) {
      const sx = -0.42 + s * 0.42;
      const slipMat = new THREE.MeshStandardMaterial({
        color: sandalColors[(s + 2) % sandalColors.length],
        roughness: 0.7
      });
      for (const foot of [-0.055, 0.055]) {
        const slip = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.022, 0.22), slipMat);
        slip.position.set(sx + foot, 0.026, 0.48);
        slip.rotation.y = 0.08 * (s - 1);
        rg.add(slip);
      }
    }
    return rg;
  };
  world._buildShoeRackUnit = buildShoeRackUnit;

  // =========================================================================================
  // 4. SOUTH-EAST ARRIVAL ENTRANCE DOORWAY (+15.5, 0, +20.45) WITH SHOE-REMOVAL VERANDA
  // =========================================================================================
  const cornerDoorGroup = new THREE.Group();
  cornerDoorGroup.position.set(15.5, 0, 20.45);
  for (const dx of [-1.85, 1.85]) {
    const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.36, 4.2, 0.44), crimsonWoodMat);
    jamb.position.set(dx, 2.1, 0);
    cornerDoorGroup.add(jamb);
  }
  const doorLintel = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.46, 0.5), goldLeafMat);
  doorLintel.position.set(0, 4.25, 0);
  cornerDoorGroup.add(doorLintel);
  const entrySill = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.09, 0.28), wallWoodMat);
  entrySill.position.set(0, 0.045, 0);
  cornerDoorGroup.add(entrySill);
  for (const side of [-1, 1]) {
    const leafPivot = new THREE.Group();
    leafPivot.position.set(side * 1.65, 0, -0.05);
    leafPivot.rotation.y = side * -1.12;
    const leafBoard = new THREE.Mesh(new THREE.BoxGeometry(1.52, 3.92, 0.09), wallWoodMat);
    leafBoard.position.set(-side * 0.76, 2.02, 0);
    leafPivot.add(leafBoard);
    const leafTrim = new THREE.Mesh(new THREE.BoxGeometry(1.32, 1.25, 0.11), baoLamMat);
    leafTrim.position.set(-side * 0.76, 1.05, 0);
    leafPivot.add(leafTrim);
    for (let b = -2; b <= 2; b++) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.75, 8), goldLeafMat);
      bar.position.set(-side * 0.76 + b * 0.22, 2.85, 0);
      leafPivot.add(bar);
    }
    cornerDoorGroup.add(leafPivot);
  }
  const outerVerandaFloor = new THREE.Mesh(
    new THREE.BoxGeometry(5.6, 0.12, 3.2),
    new THREE.MeshStandardMaterial({ color: 0xC97653, roughness: 0.62 })
  );
  outerVerandaFloor.position.set(0, -0.04, 1.65);
  cornerDoorGroup.add(outerVerandaFloor);
  const outerGardenBackdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(5.6, 4.4),
    new THREE.MeshBasicMaterial({ color: 0xD8ECC8, side: THREE.DoubleSide })
  );
  outerGardenBackdrop.position.set(0, 2.15, 3.15);
  outerGardenBackdrop.userData.exitSide = 'right';
  cornerDoorGroup.add(outerGardenBackdrop);
  for (const rx of [-1.25, 1.25]) {
    const outerRack = buildShoeRackUnit(1.35, 3);
    outerRack.position.set(rx, 0.02, 1.18);
    outerRack.rotation.y = rx < 0 ? 0.35 : -0.35;
    cornerDoorGroup.add(outerRack);
  }
  const exitSign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.5, 0.56),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('← RA HIÊN BỎ DÉP & TIỆM LƯU NIỆM CUỐI ĐƯỜNG', {
        w: 1020,
        h: 160,
        bg: '#1E462B',
        border: '#F3C85F',
        color: '#FFF8E5',
        size: 30
      })
    })
  );
  exitSign.rotation.y = Math.PI;
  exitSign.position.set(0, 4.72, -0.18);
  exitSign.userData.exitSide = 'right';
  cornerDoorGroup.add(exitSign);
  const exitHitbox = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 4.4, 1.4),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  exitHitbox.position.set(0, 2.2, 0.2);
  exitHitbox.userData.exitSide = 'right';
  cornerDoorGroup.add(exitHitbox);
  g.add(cornerDoorGroup);
  world.interiorDoorClickTargets.push(exitHitbox, exitSign);

  // =========================================================================================
  // 5. CENTER OF THE SQUARE: OPEN-SKY "HỒ SEN BỘ" & HÒN NON BỘ (x ∈ [-10.6..+10.6], z ∈ [-10.6..+10.6])
  // =========================================================================================
  const centerGroup = new THREE.Group();
  centerGroup.position.set(0, 0, 0);
  g.add(centerGroup);

  const skyOpening = new THREE.Mesh(
    new THREE.PlaneGeometry(20.6, 20.6),
    new THREE.MeshBasicMaterial({ color: 0xCBE8FF, side: THREE.DoubleSide })
  );
  skyOpening.rotation.x = Math.PI / 2;
  skyOpening.position.set(0, 9.6, 0);
  registerCutaway(skyOpening);
  centerGroup.add(skyOpening);

  const courtyardSun = new THREE.PointLight(0xFFF6DF, 2.2, 42, 1.0);
  courtyardSun.position.set(0, 8.2, 0);
  centerGroup.add(courtyardSun);

  const buildCourtyardArcadeSide = (axis, fixedCoord) => {
    const sideGrp = new THREE.Group();
    const bayW = 3.0;
    for (let bi = 0; bi < 7; bi++) {
      const u = -9.0 + bi * bayW;
      const isOpenWalkway = bi === 1 || bi === 3 || bi === 5;
      const bay = new THREE.Group();
      if (axis === 'z') {
        bay.position.set(u, 0, fixedCoord);
      } else {
        bay.position.set(fixedCoord, 0, u);
        bay.rotation.y = Math.PI / 2;
      }
      for (const sx of [-bayW / 2 + 0.2, bayW / 2 - 0.2]) {
        const ped = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.88, 0.52), frenchOchreMat);
        ped.position.set(sx, 0.44, 0);
        bay.add(ped);
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 2.75, 14), frenchOchreMat);
        col.position.set(sx, 2.26, 0);
        col.castShadow = true;
        bay.add(col);
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.15, 0.24, 14), terraTrimMat);
        cap.position.set(sx, 3.72, 0);
        bay.add(cap);
      }
      const archRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.12, 0.15, 10, 22, Math.PI),
        frenchOchreMat
      );
      archRing.position.set(0, 3.76, 0);
      bay.add(archRing);
      const spandrel = new THREE.Mesh(new THREE.BoxGeometry(bayW, 1.35, 0.36), frenchCreamMat);
      spandrel.position.set(0, 5.15, 0);
      bay.add(spandrel);
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(bayW + 0.06, 0.28, 0.56), terraTrimMat);
      cornice.position.set(0, 5.92, 0);
      bay.add(cornice);
      const attic = new THREE.Mesh(new THREE.BoxGeometry(bayW, 1.15, 0.34), frenchOchreMat);
      attic.position.set(0, 6.62, 0);
      bay.add(attic);
      if (bi % 2 === 1) {
        const baroqueCrest = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.72, 0.58, 8), frenchCreamMat);
        baroqueCrest.scale.set(1.2, 1.0, 0.35);
        baroqueCrest.position.set(0, 7.45, 0);
        bay.add(baroqueCrest);
      }

      if (!isOpenWalkway) {
        const lowBase = new THREE.Mesh(new THREE.BoxGeometry(bayW - 0.5, 0.26, 0.38), frenchOchreMat);
        lowBase.position.set(0, 0.13, 0);
        bay.add(lowBase);
        for (let k = -2; k <= 2; k++) {
          const bal = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.085, 0.52, 8), frenchCreamMat);
          bal.position.set(k * 0.42, 0.52, 0);
          bay.add(bal);
        }
        const topRail = new THREE.Mesh(new THREE.BoxGeometry(bayW - 0.44, 0.14, 0.44), frenchOchreMat);
        topRail.position.set(0, 0.84, 0);
        bay.add(topRail);

        if (axis === 'z') {
          world.interiorRectObstacles.push({
            minX: u - bayW / 2,
            maxX: u + bayW / 2,
            minZ: fixedCoord - 0.32,
            maxZ: fixedCoord + 0.32
          });
        } else {
          world.interiorRectObstacles.push({
            minX: fixedCoord - 0.32,
            maxX: fixedCoord + 0.32,
            minZ: u - bayW / 2,
            maxZ: u + bayW / 2
          });
        }
      } else {
        for (const off of [-1.32, 1.32]) {
          if (axis === 'z') {
            world.interiorObstacles.push({ x: u + off, z: fixedCoord, r: 0.25 });
          } else {
            world.interiorObstacles.push({ x: fixedCoord, z: u + off, r: 0.25 });
          }
        }
      }
      sideGrp.add(bay);
    }
    centerGroup.add(sideGrp);
  };

  buildCourtyardArcadeSide('z', -10.6); // North arcade -> spacious Tổ Đường
  buildCourtyardArcadeSide('z', 10.6);  // South arcade
  buildCourtyardArcadeSide('x', -10.6); // West arcade -> Grand Chánh Điện Doorway, Shoe Racks & Trống Bát Nhã!
  buildCourtyardArcadeSide('x', 10.6);  // East arcade -> Extended 8-Shrine Right Corridor

  // Central Hồ Sen Bộ + Hòn Non Bộ
  const pondGroup = new THREE.Group();
  centerGroup.add(pondGroup);

  const pondOuterR = 5.85;
  const pondInnerR = 5.32;
  const pondWallH = 0.62;
  const outerRim = new THREE.Mesh(
    new THREE.CylinderGeometry(pondOuterR, pondOuterR + 0.14, pondWallH, 16, 1, true),
    frenchOchreMat
  );
  outerRim.position.y = pondWallH / 2;
  outerRim.receiveShadow = true;
  outerRim.castShadow = true;
  pondGroup.add(outerRim);
  const innerRimWall = new THREE.Mesh(
    new THREE.CylinderGeometry(pondInnerR, pondInnerR, pondWallH, 16, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x8F682C, roughness: 0.72, side: THREE.BackSide })
  );
  innerRimWall.position.y = pondWallH / 2;
  pondGroup.add(innerRimWall);
  const brickCapping = new THREE.Mesh(
    new THREE.RingGeometry(pondInnerR - 0.06, pondOuterR + 0.08, 16),
    new THREE.MeshStandardMaterial({ color: 0xA84B31, roughness: 0.58, side: THREE.DoubleSide })
  );
  brickCapping.rotation.x = -Math.PI / 2;
  brickCapping.position.y = pondWallH + 0.01;
  pondGroup.add(brickCapping);
  const pondFloor = new THREE.Mesh(
    new THREE.CircleGeometry(pondInnerR, 24),
    new THREE.MeshStandardMaterial({ color: 0x162E28, roughness: 0.85 })
  );
  pondFloor.rotation.x = -Math.PI / 2;
  pondFloor.position.y = 0.06;
  pondGroup.add(pondFloor);
  const pondWater = new THREE.Mesh(
    new THREE.CircleGeometry(pondInnerR, 32),
    new THREE.MeshStandardMaterial({
      color: 0x1F5E53,
      roughness: 0.14,
      metalness: 0.18,
      transparent: true,
      opacity: 0.88
    })
  );
  pondWater.rotation.x = -Math.PI / 2;
  pondWater.position.y = 0.46;
  pondGroup.add(pondWater);

  const miniBridge = new THREE.Group();
  miniBridge.position.set(0, 0.52, 3.65);
  const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.14, 2.25), M.stoneLight);
  bridgeDeck.position.y = 0.18;
  miniBridge.add(bridgeDeck);
  for (const bx of [-0.54, 0.54]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 2.25), frenchCreamMat);
    rail.position.set(bx, 0.38, 0);
    miniBridge.add(rail);
  }
  pondGroup.add(miniBridge);

  const padMat = new THREE.MeshStandardMaterial({ color: 0x2F743A, roughness: 0.58, side: THREE.DoubleSide });
  for (let i = 0; i < 28; i++) {
    const ang = (i / 28) * Math.PI * 2 + (i % 3) * 0.08;
    if (Math.abs(Math.sin(ang)) < 0.22 && Math.cos(ang) > 0 && i % 4 === 0) continue;
    const rad = 2.95 + ((i * 7) % 10) * 0.2;
    const padR = 0.24 + (i % 4) * 0.06;
    const pad = new THREE.Mesh(new THREE.CircleGeometry(padR, 14, 0, Math.PI * 1.88), padMat);
    pad.rotation.x = -Math.PI / 2;
    pad.rotation.z = ang * 1.7;
    pad.position.set(Math.cos(ang) * rad, 0.475 + (i % 3) * 0.004, Math.sin(ang) * rad);
    pondGroup.add(pad);
  }
  for (let i = 0; i < 36; i++) {
    const ang = (i / 36) * Math.PI * 2 + 0.09;
    const rad = 2.85 + ((i * 5) % 9) * 0.22;
    const lotusPivot = new THREE.Group();
    lotusPivot.position.set(Math.cos(ang) * rad, 0.49, Math.sin(ang) * rad);
    const fl = world.makeLotusFlower3D(i % 4 === 0, i % 5 !== 0);
    fl.scale.setScalar(1.18 + (i % 3) * 0.16);
    lotusPivot.add(fl);
    pondGroup.add(lotusPivot);
    world.lotusSwayGroups.push({ group: lotusPivot, phase: i * 0.85 });
  }

  if (!world._koiTexSet) {
    world._koiTexSet = [0, 1, 2].map((v) => world.makeKoiPatternTex(v));
  }
  if (world._koiBodyGeo) {
    const koiFinMat = new THREE.MeshStandardMaterial({
      color: 0xFFF4E0,
      transparent: true,
      opacity: 0.85,
      roughness: 0.35,
      side: THREE.DoubleSide
    });
    for (let i = 0; i < 10; i++) {
      const fishGroup = new THREE.Group();
      const bodyPivot = new THREE.Group();
      fishGroup.add(bodyPivot);
      const bodyMat = new THREE.MeshStandardMaterial({
        map: world._koiTexSet[i % world._koiTexSet.length],
        roughness: 0.24,
        metalness: i % 3 === 2 ? 0.22 : 0.05
      });
      bodyPivot.add(new THREE.Mesh(world._koiBodyGeo, bodyMat));
      const tailPivot = new THREE.Group();
      tailPivot.position.set(0, 0, -0.25);
      const tailMesh = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 4), koiFinMat);
      tailMesh.rotation.x = Math.PI / 2;
      tailPivot.add(tailMesh);
      bodyPivot.add(tailPivot);
      fishGroup.scale.setScalar(0.88 + (i % 3) * 0.12);
      pondGroup.add(fishGroup);

      const ctrl = [];
      const baseR = 3.35 + (i % 3) * 0.55;
      const dir = i % 2 === 0 ? 1 : -1;
      for (let p = 0; p < 8; p++) {
        const th = (i / 10) * Math.PI * 2 + dir * (p / 8) * Math.PI * 2;
        const rr = baseR + Math.sin(p * 2 + i) * 0.38;
        ctrl.push(new THREE.Vector3(Math.cos(th) * rr, 0.34 - (p % 2) * 0.03, Math.sin(th) * rr));
      }
      const curve = new THREE.CatmullRomCurve3(ctrl, true, 'catmullrom', 0.5);
      world.koiList.push({
        mesh: fishGroup,
        bodyPivot,
        tail: tailPivot,
        curve,
        speed: 0.034 + (i % 4) * 0.006,
        phase: (i * 0.13) % 1
      });
    }
  }

  const islandPedestal = new THREE.Mesh(new THREE.CylinderGeometry(2.42, 2.58, 1.15, 8), frenchOchreMat);
  islandPedestal.position.y = 0.58;
  islandPedestal.castShadow = true;
  islandPedestal.receiveShadow = true;
  pondGroup.add(islandPedestal);
  const islandCap = new THREE.Mesh(new THREE.CylinderGeometry(2.54, 2.54, 0.14, 8), terraTrimMat);
  islandCap.position.y = 1.18;
  pondGroup.add(islandCap);

  const innerNonBoRockAnchor = new THREE.Group();
  innerNonBoRockAnchor.position.set(0, 1.24, 0);
  pondGroup.add(innerNonBoRockAnchor);
  world.innerNonBoRockAnchor = innerNonBoRockAnchor;

  const procRocks = new THREE.Group();
  const darkCragMat = new THREE.MeshStandardMaterial({ color: 0x3D3A36, roughness: 0.88 });
  for (const [rx, ry, rz, rr, rh] of [
    [0, 1.65, 0, 0.95, 3.3],
    [-0.95, 1.15, 0.25, 0.72, 2.3],
    [0.98, 1.22, 0.18, 0.74, 2.45],
    [-0.55, 0.9, -0.75, 0.65, 1.8],
    [0.62, 0.95, -0.7, 0.66, 1.9]
  ]) {
    const crag = new THREE.Mesh(new THREE.ConeGeometry(rr, rh, 7), darkCragMat);
    crag.position.set(rx, ry, rz);
    crag.castShadow = true;
    procRocks.add(crag);
  }
  innerNonBoRockAnchor.add(procRocks);
  world.innerNonBoProceduralRocks = procRocks;

  const porcelainMat = new THREE.MeshStandardMaterial({ color: 0xDFECFA, roughness: 0.28 });
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2D6A35, roughness: 0.72 });
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const bx = Math.cos(ang) * 5.58;
    const bz = Math.sin(ang) * 5.58;
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.2, 0.34, 12), porcelainMat);
    pot.position.set(bx, 0.8, bz);
    pondGroup.add(pot);
    const bush = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), foliageMat);
    bush.scale.set(1.15, 0.85, 1.15);
    bush.position.set(bx, 1.14, bz);
    pondGroup.add(bush);
  }
  const postBlackMat = new THREE.MeshStandardMaterial({ color: 0x1E2226, metalness: 0.55, roughness: 0.38 });
  const globeMat = new THREE.MeshBasicMaterial({ color: 0xFFF3CE });
  for (const lx of [-5.8, 5.8]) {
    const lampGrp = new THREE.Group();
    lampGrp.position.set(lx, 0, -5.8);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, 3.6, 10), postBlackMat);
    pole.position.y = 1.8;
    lampGrp.add(pole);
    for (const [gx, gy, gz] of [
      [0, 3.78, 0],
      [-0.38, 3.48, 0],
      [0.38, 3.48, 0],
      [0, 3.48, -0.38],
      [0, 3.48, 0.38]
    ]) {
      const glb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), globeMat);
      glb.position.set(gx, gy, gz);
      lampGrp.add(glb);
    }
    centerGroup.add(lampGrp);
    world.interiorObstacles.push({ x: lx, z: -5.8, r: 0.32 });
  }
  world.interiorNonBoClickTargets.push(pondGroup);
  world.interiorObstacles.push({ x: 0, z: 0, r: 6.12 });

  // =========================================================================================
  // 6. EXTENDED & WIDENED EAST ARRIVAL CORRIDOR (x = +10.6 .. +32.0, z = +20.8 .. -38.0)
  //    - 8 Authentic Sculpted GLB Buddha/Bodhisattva Shrines (>6!) along x = +22.8
  //    - Wide open right-side space (+X = +24.8 .. +31.8) with reception lounge, bookcases & daylight windows
  //    - Sunlit Open 3-Arch North Exit Portal (z = -37.8) looking directly out to the outdoor Buddha statues!
  // =========================================================================================
  const buildSideGalleryAltarBase = (width = 3.1, depth = 1.25, height = 1.04) => {
    const ag = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), crimsonWoodMat);
    body.position.y = height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    ag.add(body);
    const topSlab = new THREE.Mesh(new THREE.BoxGeometry(width + 0.14, 0.08, depth + 0.14), goldLeafMat);
    topSlab.position.y = height + 0.04;
    ag.add(topSlab);
    const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.22, 14), bronzePatinaMat);
    burner.position.set(0, height + 0.18, depth * 0.3);
    ag.add(burner);
    for (const side of [-1, 1]) {
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.08, 0.38, 10), bronzePatinaMat);
      candle.position.set(side * (width * 0.34), height + 0.26, depth * 0.26);
      ag.add(candle);
      const lotusBouquet = world.makeLotusFlower3D(false, true);
      lotusBouquet.scale.setScalar(1.25);
      lotusBouquet.position.set(side * (width * 0.42), height + 0.24, -depth * 0.05);
      ag.add(lotusBouquet);
    }
    return ag;
  };

  // 8 Authentic Sculpted GLB Shrines gracefully spaced every 8.8m along the full 77m East Corridor
  const eastShrineCatalog = [
    {
      key: 'hoPhap',
      z: 13.0,
      title: 'HỘ PHÁP VI ĐÀ TÔN THIÊN',
      desc: 'Tôn tượng Đức Hộ Pháp Vi Đà trấn giữ cửa thiền môn, hộ trì Chánh Pháp ngay đầu dải bàn thờ lối vào.',
      targetH: 2.45,
      matKind: 'antique_bronze'
    },
    {
      key: 'nghinMat',
      z: 4.2,
      title: 'PHẬT BÀ NGHÌN MẮT NGHÌN TAY · THIÊN THỦ THIÊN NHÃN',
      desc: 'Ngàn mắt soi thấu nỗi khổ thế gian, ngàn tay từ bi cứu độ chúng sinh — tôn tượng thếp vàng rực rỡ.',
      targetH: 2.68,
      matKind: 'keep_gold_pbr'
    },
    {
      key: 'quanAm',
      z: -4.6,
      title: 'QUÁN THẾ ÂM NAM HẢI BỒ TÁT',
      desc: 'Đức Quán Thế Âm Bồ Tát tay cầm tịnh bình cam lồ rưới mát tâm tư khách hành hương.',
      targetH: 2.45,
      matKind: 'gilded_gold'
    },
    {
      key: 'choNgu',
      z: -13.4,
      title: 'CHỖ NGỦ CỦA PHẬT · ĐỨC PHẬT NHẬP NIẾT BÀN',
      desc: 'Khám thờ long sàng sơn son thếp vàng tôn trí kim thân Đức Phật an nhiên thị hiện Cát Tường Ngoạ.',
      targetW: 2.95,
      matKind: 'keep_gold_pbr',
      isBed: true
    },
    {
      key: 'adida',
      z: -22.2,
      title: 'ĐỨC PHẬT A DI ĐÀ TIẾP DẪN',
      desc: 'Tôn tượng Đức Phật A Di Đà phóng quang tiếp dẫn chúng sinh về miền Cực Lạc thanh tịnh.',
      targetH: 2.52,
      matKind: 'gilded_gold'
    },
    {
      key: 'dilac',
      z: -31.0,
      title: 'ĐỨC PHẬT DI LẶC HOAN HỶ',
      desc: 'Đức Phật Di Lặc nụ cười hoan hỷ bao dung, mang lại bình an và phước lành cho muôn nhà.',
      targetH: 2.28,
      matKind: 'gilded_gold'
    },
    {
      key: 'duocSu',
      z: -39.8,
      title: 'ĐỨC PHẬT DƯỢC SƯ LƯU LY QUANG',
      desc: 'Đức Phật Dược Sư phát mười hai đại nguyện tiêu trừ bệnh khổ, ban phúc thọ an khang.',
      targetH: 2.35,
      matKind: 'gilded_gold'
    },
    {
      key: 'tieuDien',
      z: -48.6,
      title: 'TIÊU DIỆN ĐẠI SĨ · HỘ TRÌ CỬA BẮC',
      desc: 'Tôn tượng Tiêu Diện Đại Sĩ uy nghiêm hàng phục ma chướng ngay trước lối mở ra vườn tượng Phật ngoài trời.',
      targetH: 2.45,
      matKind: 'antique_bronze'
    }
  ];

  for (const spec of eastShrineCatalog) {
    const sGrp = new THREE.Group();
    sGrp.position.set(22.8, 0, spec.z);
    sGrp.rotation.y = -Math.PI / 2; // Local +Z points West (-X) toward the main walkway!
    sGrp.userData.shrineKey = spec.key;
    sGrp.userData.shrineTitle = `🙏 ${spec.title}`;
    sGrp.userData.shrineDesc = spec.desc;

    // Sleek open wooden frame (NO solid wall blocking sightlines into the wide East veranda at x = 25..31.8!)
    const altarW = spec.isBed ? 3.2 : 2.95;
    const altarD = spec.isBed ? 1.45 : 1.25;
    const altarBase = buildSideGalleryAltarBase(altarW, altarD, spec.isBed ? 0.96 : 1.04);
    sGrp.add(altarBase);

    for (const fx of [-altarW / 2 + 0.1, altarW / 2 - 0.1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.082, 3.85, 10), baoLamMat);
      post.position.set(fx, 2.95, -altarD * 0.44);
      sGrp.add(post);
    }
    const topArch = new THREE.Mesh(new THREE.BoxGeometry(altarW + 0.16, 0.22, 0.18), goldLeafMat);
    topArch.position.set(0, 4.82, -altarD * 0.44);
    sGrp.add(topArch);

    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(2.85, 0.42),
      new THREE.MeshBasicMaterial({
        map: world.makeSignTexture(spec.title, {
          w: 960,
          h: 140,
          bg: '#4A1510',
          border: '#F5C85B',
          color: '#FFF6DC',
          size: 28
        }),
        side: THREE.DoubleSide
      })
    );
    sign.position.set(0, 4.62, 0.18);
    sGrp.add(sign);

    // GLB Statue Anchor (strictly populated with real sculpted GLB in glb-loading.mjs — ZERO procedural body!)
    const statueAnchor = new THREE.Group();
    statueAnchor.position.set(0, spec.isBed ? 1.0 : 1.08, -0.04);
    sGrp.add(statueAnchor);

    g.add(sGrp);

    // Kneeling cushion cleanly in front of each shrine (leaving wide aisle at x = 12..19.5)
    const cushion = world.makeKneelingCushion();
    cushion.position.set(20.4, 0, spec.z);
    g.add(cushion);

    // Compact collision box around the altar only (players can walk around and behind into the open right veranda!)
    world.interiorRectObstacles.push({
      minX: 21.9,
      maxX: 23.75,
      minZ: spec.z - altarW / 2 - 0.1,
      maxZ: spec.z + altarW / 2 + 0.1
    });

    world.eastCorridorShrines.push({ ...spec, group: sGrp, anchor: statueAnchor });
    if (spec.key === 'nghinMat') {
      world.nghinMatNghinTayAnchor = statueAnchor;
      world.nghinMatProceduralGroup = null;
      world.nghinMatClickTargets.push(sGrp);
    } else if (spec.key === 'choNgu') {
      world.choNguCuaPhatAnchor = statueAnchor;
      world.choNguPlaceholderBody = null;
      world.choNguClickTargets.push(sGrp);
    } else {
      world.rightGalleryClickTargets.push(sGrp);
    }
  }

  // Single wide-range warm corridor light (replaces 17 per-bay PointLights for 60fps rendering)
  const eastCorridorLight = new THREE.PointLight(0xFFD48E, 2.6, 52.0, 1.0);
  eastCorridorLight.position.set(16.6, 6.2, -16.0);
  g.add(eastCorridorLight);

  // =========================================================================================
  // 6B. OPEN SUNLIT NORTH EXIT PORTAL AT END OF 77m EAST CORRIDOR (z = -56.0) -> OUTDOOR BUDDHAS!
  //     Fully sealed roof fascia & left/right wing caps (zero sky slits above the archway!)
  // =========================================================================================
  const northExitGroup = new THREE.Group();
  northExitGroup.position.set(17.3, 0, -56.0);

  // 3-Bay Open Franco-Khmer Yellow Archway spanning x = 12.6 .. 22.0 (width 9.4m!)
  for (const ax of [-4.6, -1.65, 1.65, 4.6]) {
    const colPed = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.0, 0.68), frenchOchreMat);
    colPed.position.set(ax, 0.5, 0);
    northExitGroup.add(colPed);
    const colShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 3.8, 16), frenchOchreMat);
    colShaft.position.set(ax, 2.9, 0);
    northExitGroup.add(colShaft);
    const colCap = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.22, 0.28, 16), terraTrimMat);
    colCap.position.set(ax, 4.9, 0);
    northExitGroup.add(colCap);
  }
  for (const [cx, rad] of [[-3.12, 1.38], [0, 1.56], [3.12, 1.38]]) {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.18, 10, 24, Math.PI), frenchOchreMat);
    arch.position.set(cx, 4.95, 0);
    northExitGroup.add(arch);
  }
  // Spandrel wall fill between arches and cornice so only the 3 arched doorways open to daylight
  const spandrelBand = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.65, 0.44), frenchCreamMat);
  spandrelBand.position.set(0, 6.22, 0);
  northExitGroup.add(spandrelBand);

  const exitCornice = new THREE.Mesh(new THREE.BoxGeometry(10.4, 0.42, 0.76), terraTrimMat);
  exitCornice.position.set(0, 6.65, 0);
  northExitGroup.add(exitCornice);
  // Full-height header wall extending seamlessly up to the ceiling slab (y = 8.95) — zero open sky slit!
  const exitHeaderWall = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(10.6, 2.42, 0.5), frenchCreamMat));
  exitHeaderWall.position.set(0, 7.82, 0);
  northExitGroup.add(exitHeaderWall);
  const exitCeilingTrim = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(21.4, 0.34, 0.42), rafterMat));
  exitCeilingTrim.position.set(4.1, 8.62, 0.12);
  northExitGroup.add(exitCeilingTrim);

  // Clear overhead temple sign pointing straight out to the outdoor Buddha garden
  const northExitSign = new THREE.Mesh(
    new THREE.PlaneGeometry(5.6, 0.72),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('☀ LỐI RA VƯỜN TƯỢNG PHẬT NGOÀI TRỜI (PHẬT NIẾT BÀN & DI LẶC) ↑', {
        w: 1120,
        h: 150,
        bg: '#1B4B2D',
        border: '#F7CE65',
        color: '#FFF9E6',
        size: 30
      }),
      side: THREE.DoubleSide
    })
  );
  northExitSign.position.set(0, 5.78, 0.38);
  northExitSign.userData.exitSide = 'north_buddha';
  northExitGroup.add(northExitSign);

  // Sunlit Outdoor Courtyard Vista right outside the open North Archway (z = -56 .. -76)
  const outdoorPlazaMat = new THREE.MeshStandardMaterial({ color: 0xC6B79B, roughness: 0.72 });
  const outdoorPlaza = new THREE.Mesh(new THREE.PlaneGeometry(26.0, 22.0), outdoorPlazaMat);
  outdoorPlaza.rotation.x = -Math.PI / 2;
  outdoorPlaza.position.set(0, -0.02, -11.0);
  northExitGroup.add(outdoorPlaza);

  const skyVistaBackdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(26.0, 15.0),
    new THREE.MeshBasicMaterial({ color: 0x89C6F5, side: THREE.DoubleSide })
  );
  skyVistaBackdrop.position.set(0, 7.2, -21.0);
  skyVistaBackdrop.userData.exitSide = 'north_buddha';
  northExitGroup.add(skyVistaBackdrop);

  // Tropical garden greenery + sunlit outdoor Buddha preview statue visible straight down the 77m corridor!
  const treeLeafMat = new THREE.MeshStandardMaterial({ color: 0x3A7434, roughness: 0.78 });
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5B3F28, roughness: 0.85 });
  for (const [tx, tz] of [[-7.2, -8.0], [7.2, -8.0], [-5.5, -14.8], [5.8, -14.8]]) {
    const trk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.36, 4.2, 10), trunkMat);
    trk.position.set(tx, 2.1, tz);
    northExitGroup.add(trk);
    const crn = new THREE.Mesh(new THREE.SphereGeometry(2.35, 12, 10), treeLeafMat);
    crn.scale.set(1.2, 0.85, 1.2);
    crn.position.set(tx, 4.9, tz);
    northExitGroup.add(crn);
  }
  const vistaPlinth = new THREE.Mesh(new THREE.BoxGeometry(6.2, 1.15, 2.6), M.stoneLight);
  vistaPlinth.position.set(0, 0.58, -12.0);
  northExitGroup.add(vistaPlinth);
  const northExitOutdoorBuddhaAnchor = new THREE.Group();
  northExitOutdoorBuddhaAnchor.position.set(0, 1.16, -12.0);
  northExitGroup.add(northExitOutdoorBuddhaAnchor);
  world.northExitOutdoorBuddhaAnchor = northExitOutdoorBuddhaAnchor;

  // Clickable portal hitbox so clicking the sunlit exit archway transitions right outside to the outdoor Buddhas
  const northExitHitbox = new THREE.Mesh(
    new THREE.BoxGeometry(9.2, 6.2, 2.0),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  northExitHitbox.position.set(0, 3.1, -0.4);
  northExitHitbox.userData.exitSide = 'north_buddha';
  northExitGroup.add(northExitHitbox);

  // Solid side walls flanking BOTH left (x ∈ [10.4..12.8]) and right (x ∈ [21.9..32.2]) of the archway on z = -56.0
  const northWestWingCap = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(2.5, 8.9, 0.52), frenchCreamMat));
  northWestWingCap.position.set(11.6, 4.45, -56.0);
  g.add(northWestWingCap);
  const northWestWainCap = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(2.52, 1.5, 0.56), frenchOchreMat));
  northWestWainCap.position.set(11.6, 0.75, -56.0);
  g.add(northWestWainCap);

  const northEastWingCap = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(10.4, 8.9, 0.52), creamPlasterMat));
  northEastWingCap.position.set(27.0, 4.45, -56.0);
  g.add(northEastWingCap);

  g.add(northExitGroup);
  world.interiorDoorClickTargets.push(northExitHitbox, northExitSign);

  // =========================================================================================
  // 7. SPACIOUS EAST VERANDA, RECEPTION PARLOR & DHARMA BOOKCASES (x = +25.0 .. +31.8)
  //    Makes the right side of the East corridor feel genuinely wide, open & sunlit!
  // =========================================================================================
  const tdGroup = new THREE.Group();
  g.add(tdGroup);

  const polishedSlabWoodMat = new THREE.MeshStandardMaterial({
    color: 0x7A411F,
    map: world.woodGrainTex,
    roughness: 0.38,
    metalness: 0.05,
    envMapIntensity: 0.36
  });
  const darkTimberMat = new THREE.MeshStandardMaterial({
    color: 0x4E2915,
    map: world.woodGrainTex,
    roughness: 0.52,
    envMapIntensity: 0.28
  });
  const ceramicBowlMat = new THREE.MeshStandardMaterial({ color: 0xEAE2D2, roughness: 0.3 });
  const cushionFabricMat = new THREE.MeshStandardMaterial({ color: 0x8F2B20, roughness: 0.78 });

  const buildCarvedBench = (px, pz, rotY = 0, w = 2.25, registerObs = true) => {
    const bg = new THREE.Group();
    bg.position.set(px, 0, pz);
    bg.rotation.y = rotY;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(w, 0.09, 0.66), polishedSlabWoodMat);
    seat.position.set(0, 0.45, 0);
    seat.castShadow = true;
    bg.add(seat);
    const backFrame = new THREE.Mesh(new THREE.BoxGeometry(w - 0.08, 0.62, 0.08), darkTimberMat);
    backFrame.position.set(0, 0.78, -0.29);
    bg.add(backFrame);
    for (let sx = -w * 0.38; sx <= w * 0.39; sx += 0.32) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.44, 0.1), polishedSlabWoodMat);
      slat.position.set(sx, 0.78, -0.28);
      bg.add(slat);
    }
    for (const ax of [-w / 2 + 0.06, w / 2 - 0.06]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.28, 0.62), darkTimberMat);
      arm.position.set(ax, 0.62, 0);
      bg.add(arm);
      for (const lz of [-0.26, 0.26]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.44, 0.08), darkTimberMat);
        leg.position.set(ax, 0.22, lz);
        bg.add(leg);
      }
    }
    tdGroup.add(bg);
    if (registerObs) {
      const horiz = Math.abs(Math.sin(rotY)) < 0.707;
      const hx = horiz ? w / 2 + 0.08 : 0.42;
      const hz = horiz ? 0.42 : w / 2 + 0.08;
      world.interiorRectObstacles.push({ minX: px - hx, maxX: px + hx, minZ: pz - hz, maxZ: pz + hz });
    }
    return bg;
  };

  const buildReceptionSalon = (px, pz, rotY = -Math.PI / 2) => {
    const sg = new THREE.Group();
    sg.position.set(px, 0, pz);
    sg.rotation.y = rotY;
    const tblTop = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.08, 0.86), polishedSlabWoodMat);
    tblTop.position.set(0, 0.64, 0);
    sg.add(tblTop);
    for (const lx of [-0.58, 0.58]) {
      for (const lz of [-0.34, 0.34]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.62, 0.08), darkTimberMat);
        leg.position.set(lx, 0.31, lz);
        sg.add(leg);
      }
    }
    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.03, 0.32), darkTimberMat);
    tray.position.set(0, 0.695, 0);
    sg.add(tray);
    const teapot = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.09, 0.14, 12), ceramicBowlMat);
    teapot.position.set(-0.08, 0.77, 0);
    sg.add(teapot);
    const sofaSeat = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.09, 0.66), polishedSlabWoodMat);
    sofaSeat.position.set(0, 0.45, -1.02);
    sg.add(sofaSeat);
    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.06, 0.68, 0.09), darkTimberMat);
    sofaBack.position.set(0, 0.82, -1.32);
    sg.add(sofaBack);
    for (const cx of [-1.18, 1.18]) {
      const cSeat = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.08, 0.62), polishedSlabWoodMat);
      cSeat.position.set(cx, 0.45, 0);
      sg.add(cSeat);
      const cPad = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.05, 0.52), cushionFabricMat);
      cPad.position.set(cx, 0.51, 0);
      sg.add(cPad);
      const cBack = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.62, 0.62), darkTimberMat);
      cBack.position.set(cx + (cx < 0 ? -0.3 : 0.3), 0.78, 0);
      sg.add(cBack);
    }
    tdGroup.add(sg);
    world.interiorRectObstacles.push({ minX: px - 1.45, maxX: px + 1.45, minZ: pz - 1.55, maxZ: pz + 1.55 });
  };

  const buildDharmaBookcase = (px, pz) => {
    const bk = new THREE.Group();
    bk.position.set(px, 0, pz);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.68, 2.75, 2.1), darkTimberMat);
    frame.position.set(0, 1.38, 0);
    bk.add(frame);
    const crown = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.16, 2.24), polishedSlabWoodMat);
    crown.position.set(0, 2.8, 0);
    bk.add(crown);
    const spineColors = [0x9E261E, 0xC89328, 0x26543A, 0x7A4E22, 0xB84A2A];
    for (let shelf = 0; shelf < 4; shelf++) {
      const sy = 0.52 + shelf * 0.56;
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.05, 1.92), polishedSlabWoodMat);
      board.position.set(-0.08, sy, 0);
      bk.add(board);
      for (let b = 0; b < 11; b++) {
        const bh = 0.28 + (b % 3) * 0.04;
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(0.24, bh, 0.11),
          new THREE.MeshStandardMaterial({ color: spineColors[(shelf * 5 + b) % spineColors.length], roughness: 0.55 })
        );
        book.position.set(-0.22, sy + 0.03 + bh / 2, -0.78 + b * 0.155);
        bk.add(book);
      }
    }
    tdGroup.add(bk);
    world.interiorRectObstacles.push({ minX: px - 0.45, maxX: px + 0.45, minZ: pz - 1.15, maxZ: pz + 1.15 });
  };

  // Spacious East Veranda Lounge (x = 27.5 .. 31.2) — generously open along the full 77m corridor!
  buildDharmaBookcase(31.15, 15.8);
  buildDharmaBookcase(31.15, 11.2);
  buildDharmaBookcase(31.15, -18.5);
  buildDharmaBookcase(31.15, -39.5);
  buildReceptionSalon(28.2, 15.2, -Math.PI / 2);
  buildReceptionSalon(28.2, 9.2, -Math.PI / 2);
  buildReceptionSalon(28.2, -13.0, -Math.PI / 2);
  buildReceptionSalon(28.2, -34.0, -Math.PI / 2);

  // Resting benches spaced naturally along the full 77m East Corridor & open East veranda
  buildCarvedBench(12.2, 14.5, Math.PI / 2, 2.25, true);
  buildCarvedBench(12.2, 2.0, Math.PI / 2, 2.25, true);
  buildCarvedBench(12.2, -11.0, Math.PI / 2, 2.25, true);
  buildCarvedBench(12.2, -24.5, Math.PI / 2, 2.25, true);
  buildCarvedBench(12.2, -37.5, Math.PI / 2, 2.25, true);
  buildCarvedBench(12.2, -49.5, Math.PI / 2, 2.25, true);
  buildCarvedBench(30.6, -2.5, -Math.PI / 2, 2.4, true);
  buildCarvedBench(30.6, -25.8, -Math.PI / 2, 2.4, true);
  buildCarvedBench(30.6, -48.0, -Math.PI / 2, 2.4, true);
  buildCarvedBench(-3.2, 13.0, Math.PI, 2.35, true);
  buildCarvedBench(3.2, 13.0, Math.PI, 2.35, true);

  const tdSign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 0.52),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('PHÒNG TIẾP KHÁCH · TỦ KINH SÁCH & HÀNH LANG ĐÔNG', {
        w: 980,
        h: 150,
        bg: '#3B1D0F',
        border: '#E5B24C',
        color: '#FFECC7',
        size: 29
      }),
      side: THREE.DoubleSide
    })
  );
  tdSign.rotation.y = -Math.PI / 2;
  tdSign.position.set(31.68, 4.15, 13.5);
  tdGroup.add(tdSign);

  const traiDuongLight = new THREE.PointLight(0xFFE0A8, 2.0, 42.0, 1.0);
  traiDuongLight.position.set(28.0, 5.8, -16.0);
  tdGroup.add(traiDuongLight);
  world.interiorTraiDuongClickTargets.push(tdGroup);

  // =========================================================================================
  // 8. WEST GRAND CHÁNH ĐIỆN (x = -15.2 .. -36.5) & NORTH SPACIOUS TỔ ĐƯỜNG (z = -12.6 .. -20.8)
  // =========================================================================================
  buildWestGrandChanhDienAndNorthToDuong(world, THREE, {
    g,
    M,
    registerCutaway,
    wallWoodMat,
    darkLacquerColMat,
    goldLeafMat,
    bronzePatinaMat,
    crimsonWoodMat,
    baoLamMat,
    rafterMat,
    frenchOchreMat,
    frenchCreamMat,
    terraTrimMat,
    daylightGlassMat,
    buildShoeRackUnit
  });
}

function buildWestGrandChanhDienAndNorthToDuong(world, THREE, ctx) {
  const {
    g,
    M,
    registerCutaway,
    wallWoodMat,
    darkLacquerColMat,
    goldLeafMat,
    bronzePatinaMat,
    crimsonWoodMat,
    baoLamMat,
    rafterMat,
    frenchOchreMat,
    frenchCreamMat,
    terraTrimMat,
    daylightGlassMat,
    buildShoeRackUnit
  } = ctx;

  // =========================================================================================
  // A. WEST SIDE ACROSS HỒ SEN BỘ: CARVED WOODEN BỨC BÀN ENTRANCE TO GRAND CHÁNH ĐIỆN (x = -15.2)
  //    - Matches real Chùa Vĩnh Tràng (image_d3dcebc6.png) & user request for Ảnh 2:
  //      * Entrance doorway to Main Chánh Điện facing East (+X) across Hồ Sen Bộ
  //      * Shoe-removal racks & sandals outside the doorway ("bỏ dép ngoài đây")
  //      * Trống Bát Nhã right next to the doorway (+Z) & Tháp Đèn Cầu An on the other side (-Z)
  //      * Grand timber-truss Chánh Điện hall inside with Bao Lam, Long Trụ, Tam Bảo & 18 La Hán!
  // =========================================================================================
  const doorTeakMat = new THREE.MeshStandardMaterial({
    color: 0x6E381A,
    map: world.woodGrainTex,
    roughness: 0.44,
    metalness: 0.06,
    envMapIntensity: 0.34
  });
  const doorRedLacquerMat = new THREE.MeshStandardMaterial({
    color: 0x7A1E15,
    roughness: 0.38,
    metalness: 0.08,
    envMapIntensity: 0.32
  });

  // Facade group at x = -15.2, rotated +PI/2 so local +Z faces East (+X) toward Hồ Sen Bộ!
  const chanhDienEntrance = new THREE.Group();
  chanhDienEntrance.position.set(-15.2, 0, 0);
  chanhDienEntrance.rotation.y = Math.PI / 2;

  // Wide central portal opening: local x ∈ [-2.5, +2.5], height 4.15m
  // Two side doorways: local x ∈ [-7.6, -5.4] and [+5.4, +7.6]
  const wallPostSpecs = [
    { x: -9.6, w: 4.0 },
    { x: -4.0, w: 2.8 },
    { x: 4.0, w: 2.8 },
    { x: 9.6, w: 4.0 }
  ];
  for (const ps of wallPostSpecs) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(ps.w, 4.4, 0.32), doorTeakMat);
    panel.position.set(ps.x, 2.2, 0);
    panel.castShadow = true;
    panel.receiveShadow = true;
    chanhDienEntrance.add(panel);
    const redInset = new THREE.Mesh(new THREE.BoxGeometry(ps.w - 0.36, 2.4, 0.36), doorRedLacquerMat);
    redInset.position.set(ps.x, 2.25, 0);
    chanhDienEntrance.add(redInset);
    const goldBorder = new THREE.Mesh(new THREE.BoxGeometry(ps.w - 0.24, 0.1, 0.38), goldLeafMat);
    goldBorder.position.set(ps.x, 3.55, 0);
    chanhDienEntrance.add(goldBorder);
  }
  // Upper carved lintel & frieze across entire 23.2m facade (y = 4.3 .. 8.75)
  const upperTransom = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(23.4, 4.45, 0.34), doorTeakMat));
  upperTransom.position.set(0, 6.52, 0);
  chanhDienEntrance.add(upperTransom);
  const goldEaveBeam = new THREE.Mesh(new THREE.BoxGeometry(23.2, 0.24, 0.44), goldLeafMat);
  goldEaveBeam.position.set(0, 4.38, 0.04);
  chanhDienEntrance.add(goldEaveBeam);

  // Carved wooden door leaves neatly folded back flat against the portal pillars (NEVER blocking walking!)
  for (const side of [-1, 1]) {
    const jambPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.22, 4.45, 16), darkLacquerColMat);
    jambPillar.position.set(side * 2.55, 2.22, 0.16);
    chanhDienEntrance.add(jambPillar);

    const foldedLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.18, 4.05, 0.1), doorRedLacquerMat);
    foldedLeaf.position.set(side * 3.18, 2.04, 0.22);
    chanhDienEntrance.add(foldedLeaf);
    const leafGoldFrame = new THREE.Mesh(new THREE.BoxGeometry(1.02, 1.55, 0.12), goldLeafMat);
    leafGoldFrame.position.set(side * 3.18, 2.65, 0.23);
    chanhDienEntrance.add(leafGoldFrame);
  }
  // Traditional low wooden threshold sill ("Ngưỡng cửa Chánh Điện")
  const thresholdSill = new THREE.Mesh(new THREE.BoxGeometry(5.1, 0.07, 0.34), doorTeakMat);
  thresholdSill.position.set(0, 0.035, 0);
  chanhDienEntrance.add(thresholdSill);

  // Grand Hoành Phi "ĐẠI HÙNG BỬU ĐIỆN" right over the entrance portal facing Hồ Sen Bộ
  const mainHoanhPhi = new THREE.Mesh(
    new THREE.BoxGeometry(5.6, 1.12, 0.14),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('ĐẠI HÙNG BỬU ĐIỆN · CHÙA VĨNH TRÀNG', {
        w: 1120,
        h: 220,
        bg: '#4A0E0A',
        border: '#F2C14B',
        color: '#FFE78A',
        size: 50
      })
    })
  );
  mainHoanhPhi.position.set(0, 5.15, 0.26);
  chanhDienEntrance.add(mainHoanhPhi);

  // Red-gold vertical Câu Đối flanking the central entrance portal
  const couplLeft = new THREE.Mesh(
    new THREE.PlaneGeometry(0.48, 3.2),
    new THREE.MeshBasicMaterial({
      map: world.makeVerticalCalligraphyTex('VĨNH TRÀNG THIỀN VIỆN TỪ BI PHỔ ĐỘ')
    })
  );
  couplLeft.position.set(-2.95, 2.45, 0.32);
  chanhDienEntrance.add(couplLeft);
  const couplRight = new THREE.Mesh(
    new THREE.PlaneGeometry(0.48, 3.2),
    new THREE.MeshBasicMaterial({
      map: world.makeVerticalCalligraphyTex('PHẬT NHẬT TĂNG HUY PHÁP LUÂN THƯỜNG CHUYỂN')
    })
  );
  couplRight.position.set(2.95, 2.45, 0.32);
  chanhDienEntrance.add(couplRight);

  // Shoe-Removal Notice Banner cleanly above the doorway entrance
  const shoeNoticeChanhDien = new THREE.Mesh(
    new THREE.PlaneGeometry(4.4, 0.46),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('👟 XIN BỎ GIÀY DÉP NGOÀI CỬA TRƯỚC KHI VÀO CHÁNH ĐIỆN', {
        w: 1080,
        h: 130,
        bg: '#5B1810',
        border: '#F3C654',
        color: '#FFF6DE',
        size: 29
      })
    })
  );
  shoeNoticeChanhDien.position.set(0, 4.02, 0.26);
  chanhDienEntrance.add(shoeNoticeChanhDien);

  // Neat Shoe Racks + Sandals placed RIGHT OUTSIDE the Chánh Điện wooden doorway (local z = +0.62 -> world x = -14.58)
  for (const sx of [-3.95, 3.95]) {
    const rack = buildShoeRackUnit(1.55, 3);
    rack.position.set(sx, 0, 0.62);
    chanhDienEntrance.add(rack);
  }
  g.add(chanhDienEntrance);

  // Collision boxes for the solid sections of the Chánh Điện entrance wall at x = -15.2
  // Leaves WIDE open central doorway (z ∈ [-2.4, +2.4]) and side doorways (z ∈ [-7.6, -5.4] & [+5.4, +7.6])!
  world.interiorRectObstacles.push(
    { minX: -15.48, maxX: -14.85, minZ: -11.6, maxZ: -7.65 },
    { minX: -15.48, maxX: -14.85, minZ: -5.35, maxZ: -2.55 },
    { minX: -15.48, maxX: -14.85, minZ: 2.55, maxZ: 5.35 },
    { minX: -15.48, maxX: -14.85, minZ: 7.65, maxZ: 11.6 }
  );

  // A1. TRỐNG BÁT NHÃ RIGHT BESIDE THE CHÁNH ĐIỆN DOORWAY (x = -13.6, z = +4.8, facing +X across Hồ Sen Bộ!)
  //     Matches user request: "ở đây mới có cái cửa đi vào chánh điện và bỏ dép ngoài đây. Rồi kế bên có một cái trống luôn."
  const drumGroup = new THREE.Group();
  drumGroup.position.set(-13.6, 0, 4.8);
  drumGroup.rotation.y = Math.PI / 2;
  const drumBasePlinth = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.16, 1.56), doorTeakMat);
  drumBasePlinth.position.y = 0.08;
  drumGroup.add(drumBasePlinth);
  const drumBaseRim = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.05, 1.62), goldLeafMat);
  drumBaseRim.position.y = 0.17;
  drumGroup.add(drumBaseRim);
  // Carved 4-post wooden drum cradle ("Giá đỡ Trống Bát Nhã")
  for (const lx of [-0.64, 0.64]) {
    for (const lz of [-0.52, 0.52]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.08, 0.92, 10), crimsonWoodMat);
      post.position.set(lx, 0.62, lz);
      drumGroup.add(post);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.07, 0.08, 10), goldLeafMat);
      cap.position.set(lx, 1.08, lz);
      drumGroup.add(cap);
    }
    const sideRail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 1.16), doorTeakMat);
    sideRail.position.set(lx, 0.52, 0);
    drumGroup.add(sideRail);
  }
  for (const cz of [-0.48, 0.48]) {
    const cradleBeam = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.14, 0.12), crimsonWoodMat);
    cradleBeam.position.set(0, 0.82, cz);
    drumGroup.add(cradleBeam);
  }
  // Ceremonial drum mallet ("Dùi trống Bát Nhã") resting on side hook
  const malletStick = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.56, 8), doorTeakMat);
  malletStick.position.set(0.74, 0.92, 0.25);
  malletStick.rotation.x = 0.35;
  drumGroup.add(malletStick);
  const malletHead = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), crimsonWoodMat);
  malletHead.position.set(0.74, 1.18, 0.34);
  drumGroup.add(malletHead);

  const drumSign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.75, 0.36),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('🥁 TRỐNG BÁT NHÃ · KHAI TRỐNG LỄ PHẬT', {
        w: 840,
        h: 140,
        bg: '#5B140E',
        border: '#F5C954',
        color: '#FFF5D6',
        size: 29
      }),
      side: THREE.DoubleSide
    })
  );
  drumSign.position.set(0, 3.45, 0.55);
  drumGroup.add(drumSign);

  const drumPlaceholder = new THREE.Group();
  drumGroup.add(drumPlaceholder);
  g.add(drumGroup);
  world.interiorDrumAnchor = { group: drumGroup, placeholder: drumPlaceholder };
  world.interiorDrumClickTargets.push(drumGroup);
  world.interiorObstacles.push({ x: -13.6, z: 4.8, r: 0.92 });

  // Note: Tháp Đèn Cầu An has been relocated outside the front gate of Chánh Điện (exterior plaza at 28.2, 0, 15.2)
  // along the Buddha's outward facing direction for sunlit clarity and stability.

  // =========================================================================================
  // B. INSIDE THE GRAND MAIN CHÁNH ĐIỆN HALL — MỞ RỘNG ĐẠI HÙNG BỬU ĐIỆN 100+ PHẬT TỬ
  //    (x = -15.4 .. -62.4, z = -20.8 .. +20.8 — 47.0m × 41.6m ≈ 1,955 m²)
  //    - Central Ban Thờ Tam Bảo (x = -25.2, z = 0) faces OUTWARD (-X, toward Cổng Tam Quan!)
  //    - 112 Plush Crimson-Gold Kneeling Cushions (7 rows × 16 columns via 3 InstancedMeshes!)
  //      comfortably accommodate 100+ simultaneous pilgrims with wide central & side aisles!
  //    - 18 Vị La Hán line both grand North (z = -19.55) & South (z = +19.55) gallery walls!
  // =========================================================================================

  // B1. Authentic Dark Timber Side Walls (North z = -20.8, South z = +20.8) + Sunlit Front Tam Quan Arch Facade (x = -62.4)
  for (const sideZ of [-20.8, 20.8]) {
    const cdSideWall = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(47.4, 8.95, 0.46), wallWoodMat));
    cdSideWall.position.set(-38.9, 4.48, sideZ);
    cdSideWall.receiveShadow = true;
    g.add(cdSideWall);
    const cdSideUpper = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(47.2, 2.6, 0.5), frenchCreamMat));
    cdSideUpper.position.set(-38.9, 7.2, sideZ);
    g.add(cdSideUpper);
  }

  // Sunlit West Front Facade at x = -62.4 (9 Franco-Khmer golden arches looking out toward Front Courtyard & Cổng Tam Quan!)
  const frontTamQuanFacade = new THREE.Group();
  frontTamQuanFacade.position.set(-62.4, 0, 0);
  frontTamQuanFacade.rotation.y = Math.PI / 2;

  const ironGrilleMat = new THREE.MeshStandardMaterial({ color: 0x2A231E, metalness: 0.65, roughness: 0.38 });
  const frontUpperHeader = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(41.8, 3.35, 0.44), frenchCreamMat));
  frontUpperHeader.position.set(0, 7.15, 0);
  frontTamQuanFacade.add(frontUpperHeader);
  const frontCornice = new THREE.Mesh(new THREE.BoxGeometry(42.0, 0.32, 0.62), terraTrimMat);
  frontCornice.position.set(0, 5.45, 0);
  frontTamQuanFacade.add(frontCornice);

  // 9 Franco-Khmer yellow-ochre arched portals spanning z = -18.0 .. +18.0 (bay width 4.5m)
  for (let bi = -4; bi <= 4; bi++) {
    const u = bi * 4.5;
    const isCenterDoor = bi === 0;
    for (const px of [-2.2, 2.2]) {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(0.46, 5.4, 0.52), frenchOchreMat);
      pier.position.set(u + px, 2.7, 0);
      frontTamQuanFacade.add(pier);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.2, 0.62), terraTrimMat);
      cap.position.set(u + px, 5.32, 0);
      frontTamQuanFacade.add(cap);
    }
    const archRing = new THREE.Mesh(new THREE.TorusGeometry(1.78, 0.17, 10, 24, Math.PI), frenchOchreMat);
    archRing.position.set(u, 3.68, 0);
    frontTamQuanFacade.add(archRing);

    if (isCenterDoor) {
      for (const side of [-1, 1]) {
        const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.25, 3.95, 0.1), doorRedLacquerMat);
        doorLeaf.position.set(side * 1.62, 1.98, 0.35);
        doorLeaf.rotation.y = side * 0.85;
        frontTamQuanFacade.add(doorLeaf);
      }
      const frontHitbox = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 4.9, 1.2),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      frontHitbox.position.set(0, 2.45, -0.35);
      frontHitbox.userData.exitSide = 'front_tam_quan';
      frontTamQuanFacade.add(frontHitbox);
      world.interiorDoorClickTargets.push(frontHitbox);
    } else {
      const lowWall = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.05, 0.36), frenchCreamMat);
      lowWall.position.set(u, 0.52, 0);
      frontTamQuanFacade.add(lowWall);
      for (let bar = -4; bar <= 4; bar++) {
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 3.25, 6), ironGrilleMat);
        rod.position.set(u + bar * 0.42, 2.7, 0);
        frontTamQuanFacade.add(rod);
      }
      const midBar = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.06, 0.06), goldLeafMat);
      midBar.position.set(u, 2.65, 0);
      frontTamQuanFacade.add(midBar);
    }
  }

  const frontTamQuanSign = new THREE.Mesh(
    new THREE.PlaneGeometry(7.2, 0.64),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('☀ CỔNG CHÍNH CHÁNH ĐIỆN · RA SÂN TRƯỚC & THÁP ĐÈN', {
        w: 1120,
        h: 120,
        bg: '#4A120E',
        border: '#F3C85A',
        color: '#FFF6DC',
        size: 30
      }),
      side: THREE.DoubleSide
    })
  );
  frontTamQuanSign.position.set(0, 5.95, 0.32);
  frontTamQuanSign.userData.exitSide = 'front_tam_quan';
  frontTamQuanFacade.add(frontTamQuanSign);
  world.interiorDoorClickTargets.push(frontTamQuanSign);

  const frontPorchFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(42.0, 16.0),
    new THREE.MeshStandardMaterial({ color: 0xD2C3A5, roughness: 0.72 })
  );
  frontPorchFloor.rotation.x = -Math.PI / 2;
  frontPorchFloor.position.set(0, -0.02, -8.2);
  frontTamQuanFacade.add(frontPorchFloor);

  // Sunlit exterior vista preview of Tháp Đèn Cầu An standing outside the front gate along the Buddha's gaze
  const vistaTower = new THREE.Group();
  vistaTower.position.set(4.8, 0, -5.2);
  const vtBase = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.08, 0.72, 8), crimsonWoodMat);
  vtBase.position.y = 0.36;
  vistaTower.add(vtBase);
  const vtBody = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.56, 2.35, 10), crimsonWoodMat);
  vtBody.position.y = 1.9;
  vistaTower.add(vtBody);
  const vtRoof = new THREE.Mesh(new THREE.ConeGeometry(0.88, 0.68, 8), goldLeafMat);
  vtRoof.position.y = 3.35;
  vistaTower.add(vtRoof);
  frontTamQuanFacade.add(vistaTower);

  const frontSkyVista = new THREE.Mesh(
    new THREE.PlaneGeometry(46.0, 16.0),
    new THREE.MeshBasicMaterial({ color: 0x87C8FA, side: THREE.DoubleSide })
  );
  frontSkyVista.position.set(0, 6.8, -15.6);
  frontTamQuanFacade.add(frontSkyVista);

  const vistaGateGrp = new THREE.Group();
  vistaGateGrp.position.set(0, 0, -13.2);
  for (const gx of [-3.4, -1.45, 1.45, 3.4]) {
    const gp = new THREE.Mesh(new THREE.BoxGeometry(0.44, 4.6, 0.44), frenchOchreMat);
    gp.position.set(gx, 2.3, 0);
    vistaGateGrp.add(gp);
  }
  const gateRoof1 = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.58, 0.92), terraTrimMat);
  gateRoof1.position.set(0, 4.75, 0);
  vistaGateGrp.add(gateRoof1);
  const gateUpper = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.5, 0.68), frenchCreamMat);
  gateUpper.position.set(0, 5.7, 0);
  vistaGateGrp.add(gateUpper);
  const gateRoof2 = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.5, 0.88), terraTrimMat);
  gateRoof2.position.set(0, 6.65, 0);
  vistaGateGrp.add(gateRoof2);
  frontTamQuanFacade.add(vistaGateGrp);
  g.add(frontTamQuanFacade);

  // B2. Exposed Vietnamese Timber Roof Trusses ("Hệ vì kèo chồng rường / kẻ truyền") spanning full 40.8m width
  const addTimberViKeoTrussX = (xPos) => {
    const truss = registerCutaway(new THREE.Group());
    truss.position.set(xPos, 6.5, 0);
    const spanW = 40.6;
    const apexH = 2.2;
    const tieBeam = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, spanW), rafterMat);
    truss.add(tieBeam);
    const kingPost = new THREE.Mesh(new THREE.BoxGeometry(0.24, apexH, 0.24), rafterMat);
    kingPost.position.y = apexH * 0.5;
    truss.add(kingPost);
    for (const qz of [-10.4, 10.4]) {
      const qH = apexH * 0.56;
      const qp = new THREE.Mesh(new THREE.BoxGeometry(0.2, qH, 0.2), rafterMat);
      qp.position.set(0, qH * 0.5, qz);
      truss.add(qp);
    }
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 21.4), rafterMat);
    collar.position.y = apexH * 0.56;
    truss.add(collar);
    const halfSpan = spanW * 0.5;
    const rafLen = Math.hypot(halfSpan, apexH);
    const slope = Math.atan2(apexH, halfSpan);
    for (const sSign of [-1, 1]) {
      const raf = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, rafLen), rafterMat);
      raf.position.set(0, apexH * 0.5, sSign * halfSpan * 0.5);
      raf.rotation.x = sSign * slope;
      truss.add(raf);
    }
    g.add(truss);
  };
  for (const tx of [-18.5, -24.5, -30.5, -36.5, -42.5, -48.5, -54.5, -60.0]) {
    addTimberViKeoTrussX(tx);
  }

  // Grand colonnade along z = ±10.4 framing the 20.8m unobstructed central nave & twin side worship wings!
  for (const cx of [-18.5, -24.5, -36.5, -43.5, -50.5, -57.5]) {
    for (const cz of [-10.4, 10.4]) {
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.36, 0.76), M.stoneLight);
      plinth.position.set(cx, 0.18, cz);
      g.add(plinth);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.29, 6.4, 16), darkLacquerColMat);
      col.position.set(cx, 3.55, cz);
      col.castShadow = true;
      g.add(col);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.18, 16), goldLeafMat);
      band.position.set(cx, 6.1, cz);
      g.add(band);
      world.interiorObstacles.push({ x: cx, z: cz, r: 0.44 });
    }
  }

  // B3. Grand Carved Gilded Bao Lam Arch (`bao-lam-thep-vang.glb`) framing the FRONT of Ban Thờ Tam Bảo at x = -29.8
  const baoLamAnchor = new THREE.Group();
  baoLamAnchor.position.set(-29.8, 0, 0);
  baoLamAnchor.rotation.y = -Math.PI / 2;
  g.add(baoLamAnchor);
  world.baoLamAnchor = baoLamAnchor;

  // B4. Pair of Carved Gilded Long Trụ (`long-tru-rong-cuon.glb`) flanking the front worship nave (z = ±5.4)
  for (const sideSign of [-1, 1]) {
    const ltGrp = new THREE.Group();
    ltGrp.position.set(-30.6, 0, sideSign * 5.4);
    const basePlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.64, 0.44, 12), M.stoneLight);
    basePlinth.position.y = 0.22;
    ltGrp.add(basePlinth);
    const placeholderShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.29, 6.2, 14), crimsonWoodMat);
    placeholderShaft.position.y = 3.54;
    ltGrp.add(placeholderShaft);
    g.add(ltGrp);
    world.longTruPlaceholders.push({ group: ltGrp, replaceParts: [placeholderShaft], sideSign });
    world.longTruClickTargets.push(ltGrp);
    world.interiorObstacles.push({ x: -30.6, z: sideSign * 5.4, r: 0.6 });
  }

  // B5. Hanging Spiral Incense Coils (`nhang-khoanh-dong.glb`) suspended across the vast 100-pilgrim worship hall
  for (const [ix, iz] of [
    [-33.5, -3.4], [-33.5, 3.4],
    [-41.5, -3.4], [-41.5, 3.4],
    [-49.5, -3.4], [-49.5, 3.4]
  ]) {
    const anc = new THREE.Group();
    anc.position.set(ix, 6.45, iz);
    g.add(anc);
    world.spiralIncenseAnchors.push(anc);
  }

  // B6. 112 PLUSH GOLDEN-CRIMSON BỒ ĐOÀN (7 ROWS × 16 COLUMNS) — ĐỦ SỨC CHỨA 100+ NGƯỜI CHƠI LỄ PHẬT CÙNG LÚC!
  //     Rendered with 3 InstancedMeshes (only 3 draw calls total!) with wide central & side aisles!
  {
    const rowXs = [-33.4, -37.0, -40.6, -44.2, -47.8, -51.4, -55.0];
    const colZs = [
      -17.2, -15.6, -14.0, -12.4, // North outer wing (4 cols)
      -8.5, -6.8, -5.1, -3.4,     // North inner nave (4 cols)
      3.4, 5.1, 6.8, 8.5,         // South inner nave (4 cols)
      12.4, 14.0, 15.6, 17.2      // South outer wing (4 cols)
    ];
    const totalMats = rowXs.length * colZs.length; // 112 bồ đoàn!
    const matBaseGeo = new THREE.BoxGeometry(0.96, 0.04, 0.96);
    const matBaseMat = new THREE.MeshStandardMaterial({ color: 0x6E1B16, roughness: 0.85 });
    const padGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.13, 14);
    const padMat = new THREE.MeshStandardMaterial({ color: 0xA8291E, roughness: 0.72 });
    const trimGeo = new THREE.TorusGeometry(0.31, 0.025, 6, 16);
    trimGeo.rotateX(Math.PI / 2);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xE6B84C, roughness: 0.35, metalness: 0.45 });

    const matInst = new THREE.InstancedMesh(matBaseGeo, matBaseMat, totalMats);
    const padInst = new THREE.InstancedMesh(padGeo, padMat, totalMats);
    const trimInst = new THREE.InstancedMesh(trimGeo, trimMat, totalMats);
    matInst.receiveShadow = true;
    padInst.castShadow = false;
    padInst.receiveShadow = true;

    const dummy = new THREE.Object3D();
    let idx = 0;
    for (const kx of rowXs) {
      for (const kz of colZs) {
        dummy.position.set(kx, 0.032, kz);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        matInst.setMatrixAt(idx, dummy.matrix);

        dummy.position.set(kx + 0.08, 0.11, kz);
        dummy.updateMatrix();
        padInst.setMatrixAt(idx, dummy.matrix);

        dummy.position.set(kx + 0.08, 0.165, kz);
        dummy.updateMatrix();
        trimInst.setMatrixAt(idx, dummy.matrix);
        idx++;
      }
    }
    matInst.instanceMatrix.needsUpdate = true;
    padInst.instanceMatrix.needsUpdate = true;
    trimInst.instanceMatrix.needsUpdate = true;
    g.add(matInst, padInst, trimInst);

    // Single wide warm sanctuary light bathing the entire 112-mat congregation hall (fast fragment shader cost)
    const hallLightMid = new THREE.PointLight(0xFFDDA2, 2.8, 66.0, 0.9);
    hallLightMid.position.set(-45.5, 6.8, 0);
    g.add(hallLightMid);
  }

  // B7. CENTRAL BAN THỜ TAM BẢO (x = -25.2, z = 0) — PHẬT Ở GIỮA, QUAY RA NGOÀI HƯỚNG RA CỔNG TAM QUAN (-X)!
  //     When entering from Hòn Non Bộ doorway (x = -15.2), you see the carved lacquered back screen behind Tam Bảo
  //     and walk around ("đi vòng") via the wide North/South aisles lined by 18 Arhats to worship in front!
  const tamBaoGroup = new THREE.Group();
  tamBaoGroup.position.set(-25.2, 0, 0);
  tamBaoGroup.rotation.y = -Math.PI / 2; // Local +Z points West (-X) OUTWARD toward Front Facade & Cổng Tam Quan!
  world.tamBaoAltarGroup = tamBaoGroup;

  // Crimson & gold ceremonial backdrop separating the front sanctuary from the rear walkaround vestibule
  const backdropPanel = new THREE.Mesh(new THREE.BoxGeometry(8.6, 5.8, 0.32), crimsonWoodMat);
  backdropPanel.position.set(0, 3.05, -1.45);
  backdropPanel.castShadow = true;
  backdropPanel.receiveShadow = true;
  tamBaoGroup.add(backdropPanel);
  const backdropGoldCrown = new THREE.Mesh(new THREE.BoxGeometry(8.9, 0.24, 0.44), goldLeafMat);
  backdropGoldCrown.position.set(0, 5.95, -1.45);
  tamBaoGroup.add(backdropGoldCrown);

  // Ornate Rear Lacquer Screen ("Bình Phong Hậu Bệ Tam Bảo") facing East (+X) toward the Hòn Non Bộ entrance!
  const rearFrame = new THREE.Mesh(new THREE.BoxGeometry(7.8, 4.9, 0.08), doorTeakMat);
  rearFrame.position.set(0, 2.95, -1.63);
  tamBaoGroup.add(rearFrame);
  for (const rx of [-3.1, 0, 3.1]) {
    const rearInset = new THREE.Mesh(new THREE.BoxGeometry(2.15, 3.4, 0.1), doorRedLacquerMat);
    rearInset.position.set(rx, 2.75, -1.66);
    tamBaoGroup.add(rearInset);
    const rearGoldBorder = new THREE.Mesh(new THREE.BoxGeometry(2.26, 0.08, 0.12), goldLeafMat);
    rearGoldBorder.position.set(rx, 4.46, -1.67);
    tamBaoGroup.add(rearGoldBorder);
  }
  const rearGuideSign = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 0.72),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('← ĐI VÒNG HAI BÊN LÊN CHÁNH ĐIỆN · CHIÊM BÁI PHẬT (QUAY RA CỔNG TAM QUAN) →', {
        w: 1200,
        h: 140,
        bg: '#4A0E0A',
        border: '#F5C954',
        color: '#FFE99A',
        size: 28
      })
    })
  );
  rearGuideSign.rotation.y = Math.PI; // Faces local -Z = world +X toward Hòn Non Bộ doorway!
  rearGuideSign.position.set(0, 3.95, -1.72);
  tamBaoGroup.add(rearGuideSign);
  const rearSubSign = new THREE.Mesh(
    new THREE.PlaneGeometry(4.8, 0.46),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('PHẬT Ở GIỮA QUAY RA CỔNG TAM QUAN · 18 VỊ LA HÁN XUNG QUANH', {
        w: 1020,
        h: 110,
        bg: '#5B1A12',
        border: '#E5B24C',
        color: '#FFF4D4',
        size: 26
      })
    })
  );
  rearSubSign.rotation.y = Math.PI;
  rearSubSign.position.set(0, 2.25, -1.72);
  tamBaoGroup.add(rearSubSign);

  // Subtle multi-ring radiant Dharma halo behind the center Buddha (proportioned for grand 3.35m statue)
  const haloColors = [0xFFD54F, 0xFF9800, 0xE53935, 0x42A5F5, 0x66BB6A];
  haloColors.forEach((col, idx) => {
    const rOuter = 1.98 - idx * 0.2;
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(rOuter - 0.15, rOuter, 36),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.42, side: THREE.DoubleSide })
    );
    ring.position.set(0, 4.25, -1.24 + idx * 0.01);
    tamBaoGroup.add(ring);
  });

  // Clean 3-tier red-and-gold lacquered sanctuary altar facing outward (-X)
  const tier1 = new THREE.Mesh(new THREE.BoxGeometry(8.2, 1.18, 2.65), crimsonWoodMat);
  tier1.position.set(0, 0.59, 0.05);
  tier1.castShadow = true;
  tier1.receiveShadow = true;
  tamBaoGroup.add(tier1);
  const tier1Rim = new THREE.Mesh(new THREE.BoxGeometry(8.36, 0.1, 2.8), goldLeafMat);
  tier1Rim.position.set(0, 1.22, 0.05);
  tamBaoGroup.add(tier1Rim);

  const tier2 = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.68, 1.65), crimsonWoodMat);
  tier2.position.set(0, 1.58, -0.35);
  tamBaoGroup.add(tier2);
  const tier2Rim = new THREE.Mesh(new THREE.BoxGeometry(6.94, 0.08, 1.76), goldLeafMat);
  tier2Rim.position.set(0, 1.94, -0.35);
  tamBaoGroup.add(tier2Rim);

  const tier3 = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.54, 1.18), goldLeafMat);
  tier3.position.set(0, 2.24, -0.58);
  tamBaoGroup.add(tier3);

  // Sacred GLB Statue Anchors on Tam Bảo (all automatically face -X outward toward Cổng Tam Quan!)
  const makeTamBaoPlaceholder = (scale = 1.0) => {
    const ph = new THREE.Group();
    ph.userData._placeholder = true;
    const lotus = new THREE.Mesh(new THREE.CylinderGeometry(0.62 * scale, 0.72 * scale, 0.32 * scale, 16), goldLeafMat);
    lotus.position.y = 0.16 * scale;
    ph.add(lotus);
    const robe = new THREE.Mesh(new THREE.ConeGeometry(0.56 * scale, 1.15 * scale, 14), goldLeafMat);
    robe.position.y = 0.86 * scale;
    ph.add(robe);
    const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.28 * scale, 0.4 * scale, 0.56 * scale, 12), goldLeafMat);
    chest.position.y = 1.38 * scale;
    ph.add(chest);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24 * scale, 14, 12), goldLeafMat);
    head.position.y = 1.84 * scale;
    ph.add(head);
    const ushnisha = new THREE.Mesh(new THREE.SphereGeometry(0.11 * scale, 10, 8), goldLeafMat);
    ushnisha.position.y = 2.08 * scale;
    ph.add(ushnisha);
    return ph;
  };

  const tamBaoMainAnchor = new THREE.Group();
  tamBaoMainAnchor.position.set(0, 2.52, -0.58);
  tamBaoMainAnchor.add(makeTamBaoPlaceholder(1.48));
  tamBaoGroup.add(tamBaoMainAnchor);
  world.tamBaoMainAnchor = tamBaoMainAnchor;

  const tamBaoLeftAnchor = new THREE.Group();
  tamBaoLeftAnchor.position.set(-2.55, 1.98, -0.35);
  tamBaoLeftAnchor.add(makeTamBaoPlaceholder(1.18));
  tamBaoGroup.add(tamBaoLeftAnchor);
  world.tamBaoLeftAnchor = tamBaoLeftAnchor;

  const tamBaoRightAnchor = new THREE.Group();
  tamBaoRightAnchor.position.set(2.55, 1.98, -0.35);
  tamBaoRightAnchor.add(makeTamBaoPlaceholder(1.18));
  tamBaoGroup.add(tamBaoRightAnchor);
  world.tamBaoRightAnchor = tamBaoRightAnchor;

  // Ritual brass candle stands & lotus flower vases on lower tier
  for (const sx of [-3.2, 3.2]) {
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.11, 0.58, 12), bronzePatinaMat);
    candle.position.set(sx, 1.54, 0.92);
    tamBaoGroup.add(candle);
    const bouquet = world.makeLotusFlower3D(false, true);
    bouquet.scale.setScalar(1.65);
    bouquet.position.set(sx * 0.82, 1.48, 0.85);
    tamBaoGroup.add(bouquet);
  }

  // Anchor for Cặp Hạc Rùa Đồng (`cap-hac-rua.glb`) flanking the front of Tam Bảo neatly
  const craneTortoiseAnchor = new THREE.Group();
  craneTortoiseAnchor.position.set(0, 0, 1.75);
  tamBaoGroup.add(craneTortoiseAnchor);
  world.craneTortoiseAnchor = craneTortoiseAnchor;

  // Single wide-range golden sanctuary light bathing Grand Chánh Điện Tam Bảo & walkaround nave
  const sanctLightMain = new THREE.PointLight(0xFFD68A, 3.2, 44.0, 1.0);
  sanctLightMain.position.set(0, 6.4, 1.8);
  tamBaoGroup.add(sanctLightMain);

  g.add(tamBaoGroup);
  // Central island collision box around Tam Bảo — leaves >5m wide unobstructed walkaround aisles on BOTH sides (z = ±4.5..±9.8)!
  world.interiorRectObstacles.push({ minX: -26.75, maxX: -23.45, minZ: -4.45, maxZ: 4.45 });

  // B8. ĐẠI HỒNG CHUNG & MÕ GỖ TUCKED CLEANLY AT THE FLANKS OF THE CENTRAL SANCTUARY (NEVER BLOCKING WALKAROUND AISLES!)
  const bellGroup = new THREE.Group();
  bellGroup.position.set(-27.2, 0, -7.8);
  bellGroup.rotation.y = -Math.PI / 4;
  const bellPlaceholder = new THREE.Group();
  bellGroup.add(bellPlaceholder);
  g.add(bellGroup);
  world.interiorBellAnchor = { group: bellGroup, placeholder: bellPlaceholder };
  world.interiorBellClickTargets.push(bellGroup);
  world.interiorObstacles.push({ x: -27.2, z: -7.8, r: 0.92 });

  // Side Chuông Gia Trì & Mõ Gỗ wooden stand symmetrically on South side (x = -27.2, z = +7.8)
  const moStand = new THREE.Group();
  moStand.position.set(-27.2, 0, 7.8);
  const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 0.78, 12), crimsonWoodMat);
  standBase.position.y = 0.39;
  moStand.add(standBase);
  const standPad = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.38, 0.14, 12), goldLeafMat);
  standPad.position.y = 0.84;
  moStand.add(standPad);
  const brassBowl = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.65), bronzePatinaMat);
  brassBowl.position.y = 1.05;
  moStand.add(brassBowl);
  g.add(moStand);
  world.interiorBellClickTargets.push(moStand);
  world.interiorObstacles.push({ x: -27.2, z: 7.8, r: 0.65 });

  // B9. 18 VỊ LA HÁN GALLERY PLINTHS SURROUNDING THE ENTIRE 100-PILGRIM CHÁNH ĐIỆN (NORTH z = -19.55 & SOUTH z = +19.55!)
  for (const sideZ of [-19.55, 19.55]) {
    const benchPlinth = new THREE.Mesh(new THREE.BoxGeometry(40.8, 0.66, 1.35), doorTeakMat);
    benchPlinth.position.set(-38.6, 0.33, sideZ);
    benchPlinth.receiveShadow = true;
    g.add(benchPlinth);
    const benchTrim = new THREE.Mesh(new THREE.BoxGeometry(41.0, 0.07, 1.42), goldLeafMat);
    benchTrim.position.set(-38.6, 0.68, sideZ);
    g.add(benchTrim);

    const sideSign = new THREE.Mesh(
      new THREE.PlaneGeometry(6.4, 0.62),
      new THREE.MeshBasicMaterial({
        map: world.makeSignTexture(
          sideZ < 0 ? 'THẬP BÁT LA HÁN GỖ MÍT 1907 · DÃY BẮC (9 VỊ)' : 'THẬP BÁT LA HÁN GỖ MÍT 1907 · DÃY NAM (9 VỊ)',
          {
            w: 1120,
            h: 130,
            bg: '#4A120E',
            border: '#E5B24C',
            color: '#FFECC7',
            size: 32
          }
        )
      })
    );
    sideSign.position.set(-38.6, 3.85, sideZ + (sideZ < 0 ? 0.92 : -0.92));
    sideSign.rotation.y = sideZ < 0 ? 0 : Math.PI;
    g.add(sideSign);

    world.interiorRectObstacles.push({
      minX: -59.2,
      maxX: -18.0,
      minZ: sideZ - 0.78,
      maxZ: sideZ + 0.78
    });
  }

  // Register exact slot coordinates for all 18 sculpted GLB Arhats along the expanded grand hall (4.4m spacious spacing!)
  for (let i = 0; i < 18; i++) {
    const isNorth = i < 9;
    const colIdx = i % 9;
    const ax = -20.8 - colIdx * 4.4;
    const az = isNorth ? -19.55 : 19.55;
    const facing = isNorth ? 0 : Math.PI;
    world.arhatSlotSpecs.push({ index: i, x: ax, y: 0.72, z: az, facing });
  }

  // =========================================================================================
  // C. NORTH GALLERY (z = -10.6 .. -20.8, x = -15.2 .. +10.6): SPACIOUS, UNCLUTTERED TỔ ĐƯỜNG
  //    Fixes Ảnh 1 completely: >6.2m wide clear walking gallery, zero extra tables,
  //    single dignified Tổ Sư Đạt Ma sculpted GLB altar against North wall!
  // =========================================================================================
  const khuThoGroup = new THREE.Group();
  khuThoGroup.position.set(-2.0, 0, -19.25);
  world.khuThoAltarGroup = khuThoGroup;

  const ktBase = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.16, 1.48), crimsonWoodMat);
  ktBase.position.y = 0.58;
  ktBase.castShadow = true;
  ktBase.receiveShadow = true;
  khuThoGroup.add(ktBase);
  const ktTopTrim = new THREE.Mesh(new THREE.BoxGeometry(4.74, 0.08, 1.6), goldLeafMat);
  ktTopTrim.position.y = 1.2;
  khuThoGroup.add(ktTopTrim);
  const ktUpper = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.42, 0.96), goldLeafMat);
  ktUpper.position.set(0, 1.45, -0.18);
  khuThoGroup.add(ktUpper);

  const ktBurner = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.24, 14), bronzePatinaMat);
  ktBurner.position.set(0, 1.36, 0.42);
  khuThoGroup.add(ktBurner);
  for (const sx of [-1.65, 1.65]) {
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.085, 0.42, 10), bronzePatinaMat);
    candle.position.set(sx, 1.44, 0.38);
    khuThoGroup.add(candle);
    const lotus = world.makeLotusFlower3D(false, true);
    lotus.scale.setScalar(1.3);
    lotus.position.set(sx * 0.72, 1.38, 0.32);
    khuThoGroup.add(lotus);
  }

  // Anchor for sculpted Tổ Sư Đạt Ma GLB (NO procedural placeholder!)
  const toDatMaAnchor = new THREE.Group();
  toDatMaAnchor.position.set(0, 1.66, -0.18);
  khuThoGroup.add(toDatMaAnchor);
  world.toDatMaAnchor = toDatMaAnchor;

  // Carved crimson-and-gold wood backdrop & vertical couplets mounted flush on the North wall behind Tổ Đường
  const ktBackdrop = new THREE.Mesh(new THREE.BoxGeometry(5.6, 4.8, 0.16), crimsonWoodMat);
  ktBackdrop.position.set(0, 2.55, -1.12);
  khuThoGroup.add(ktBackdrop);
  const ktBackdropTrim = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.14, 0.22), goldLeafMat);
  ktBackdropTrim.position.set(0, 4.92, -1.1);
  khuThoGroup.add(ktBackdropTrim);
  for (const [cx, text] of [
    [-2.42, 'TỔ ẤN TRUYỀN ĐĂNG MINH TÂM KIẾN TÁNH'],
    [2.42, 'THIỀN PHONG VĨNH TRÀNG TIẾP DẪN HẬU LAI']
  ]) {
    const cpl = new THREE.Mesh(
      new THREE.PlaneGeometry(0.42, 2.85),
      new THREE.MeshBasicMaterial({ map: world.makeVerticalCalligraphyTex(text) })
    );
    cpl.position.set(cx, 2.75, -0.98);
    khuThoGroup.add(cpl);
  }

  const ktSign = new THREE.Mesh(
    new THREE.PlaneGeometry(4.4, 0.58),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('TỔ ĐƯỜNG · BAN THỜ TỔ SƯ ĐẠT MA & CHƯ TỔ KHAI SƠN', {
        w: 1020,
        h: 150,
        bg: '#4A120E',
        border: '#E6B84C',
        color: '#FFECC7',
        size: 31
      })
    })
  );
  ktSign.position.set(0, 4.35, -0.92);
  khuThoGroup.add(ktSign);

  const ktLight = new THREE.PointLight(0xFFD68C, 2.3, 34.0, 1.0);
  ktLight.position.set(0, 5.4, 3.2);
  khuThoGroup.add(ktLight);
  g.add(khuThoGroup);
  world.interiorKhuThoClickTargets.push(khuThoGroup);

  // Single kneeling cushion cleanly in front of Tổ Đường — leaves 6+ meters of open floor!
  const ktCushion = world.makeKneelingCushion();
  ktCushion.position.set(-2.0, 0, -16.8);
  g.add(ktCushion);
  world.interiorRectObstacles.push({ minX: -4.45, maxX: 0.45, minZ: -20.2, maxZ: -18.35 });

  // Clear unused legacy guardian anchors so glb-loading never looks for removed South-gallery placeholders
  world.hoPhapPlaceholder = null;
  world.tieuDienPlaceholder = null;
}
