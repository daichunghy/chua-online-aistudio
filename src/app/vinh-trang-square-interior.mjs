import {
  createSculptedSeatedBuddha,
  createSeatedBodhisattva,
  createSculptedGuardian,
  createSculptedPatriarch,
  createStandingCrimsonMonkStatue,
  createThousandArmedQuanAm,
  createIndoorSleepingBuddhaBed
} from './sculpted-buddhas.mjs';

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
 * Builds the unified Square ("Hình Vuông", 41.6m × 41.6m) interior of Chùa Vĩnh Tràng:
 * - Bottom-Right Corner Entrance (+15.6, +20.45)
 * - Straight Right-Side Multi-Altar Gallery (x = +14.8 .. +19.5):
 *     1. Tượng Phật Nghìn Mắt Nghìn Tay (z = +14.8)
 *     2. Chỗ Ngủ Của Phật · Phật Nhập Niết Bàn (z = +9.0)
 *     3. Lối sang Nhà Sàn Gỗ Trai Đường (z = +4.0)
 *     4. Bàn Thờ Đức Phật Dược Sư (z = -0.8)
 *     5. Bàn Thờ Địa Tạng Vương Bồ Tát (z = -6.2)
 *     6. Bàn Thờ Văn Thù & Phổ Hiền Bồ Tát (z = -11.6)
 * - Top Edge of Square = Chính Điện Đại Hùng Bửu Điện (z = -11.0 .. -20.8):
 *     Tam Bảo Altar, 3 Bồ đoàn lạy Phật, Tháp Đèn Cầu An, Cặp Long Trụ, Đại Hồng Chung, Trống Bát Nhã
 * - Center of Square = Hồ Sen Bộ (0, 0, 0):
 *     4-sided French-colonial arched balustrade surrounding Lotus Pond + 36 Lotuses + 10 Koi + Hòn Non Bộ
 * - Left & Bottom Galleries: Ban Tổ Đạt Ma, 18 Vị La Hán, Hộ Pháp Vi Đà, Tiêu Diện Đại Sĩ, Án Tiền Hiền
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

  // Reset all interior interaction arrays & obstacle lists
  world.arhatGroups = [];
  world.interiorDoorClickTargets = [];
  world.interiorNonBoClickTargets = [];
  world.interiorKhuThoClickTargets = [];
  world.interiorTraiDuongClickTargets = [];
  world.interiorBellClickTargets = [];
  world.interiorDrumClickTargets = [];
  world.blessingTowerClickTargets = [];
  world.blessingTowerLampMeshes = [];
  world.longTruClickTargets = [];
  world.nghinMatClickTargets = [];
  world.choNguClickTargets = [];
  world.rightGalleryClickTargets = [];
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
      ctx.fillStyle = '#2A3036';
      ctx.fillRect(0, 0, w, h);
      const step = w / 4;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const shade = 38 + ((r * 3 + c * 5) % 10);
          ctx.fillStyle = `rgb(${shade}, ${shade + 5}, ${shade + 9})`;
          ctx.fillRect(c * step + 3, r * step + 3, step - 6, step - 6);
          ctx.strokeStyle = 'rgba(185, 200, 210, 0.12)';
          ctx.lineWidth = 2;
          ctx.strokeRect(c * step + 4, r * step + 4, step - 8, step - 8);
        }
      }
    },
    512,
    512,
    24,
    24
  );
  const slateFloorMat = new THREE.MeshStandardMaterial({
    map: slateTileTex,
    roughness: 0.24,
    metalness: 0.08
  });
  const gachTauMat = new THREE.MeshStandardMaterial({
    map: world.gachTauTex,
    color: 0xDC8764,
    roughness: 0.52,
    metalness: 0.03
  });
  const wallWoodMat = new THREE.MeshStandardMaterial({
    color: 0x2D170C,
    map: world.woodGrainTex,
    roughness: 0.48
  });
  const creamPlasterMat = new THREE.MeshStandardMaterial({
    color: 0xE2D3B1,
    roughness: 0.66
  });
  const frenchOchreMat = new THREE.MeshStandardMaterial({
    color: 0xDFAC42,
    roughness: 0.55
  });
  const frenchCreamMat = new THREE.MeshStandardMaterial({
    color: 0xF5E9CE,
    roughness: 0.52
  });
  const terraTrimMat = new THREE.MeshStandardMaterial({
    color: 0xAD4A28,
    roughness: 0.54
  });
  const darkLacquerColMat = new THREE.MeshStandardMaterial({
    color: 0x1D0E08,
    roughness: 0.24,
    metalness: 0.12
  });
  const goldLeafMat = new THREE.MeshStandardMaterial({
    color: 0xE6B33D,
    metalness: 0.68,
    roughness: 0.22
  });
  const bronzePatinaMat = new THREE.MeshStandardMaterial({
    color: 0x7A5A2E,
    metalness: 0.58,
    roughness: 0.34
  });
  const crimsonWoodMat = new THREE.MeshStandardMaterial({
    color: 0x6E1B14,
    roughness: 0.38,
    metalness: 0.08
  });
  const baoLamMat = new THREE.MeshStandardMaterial({
    color: 0x3B1A0E,
    roughness: 0.34,
    metalness: 0.18
  });
  const rafterMat = new THREE.MeshStandardMaterial({
    color: 0x3D1E10,
    map: world.woodGrainTex,
    roughness: 0.58
  });
  const ceilingWoodMat = new THREE.MeshStandardMaterial({
    color: 0x261209,
    map: world.woodGrainTex,
    roughness: 0.68
  });

  // 1. UNIFIED SQUARE FLOOR (41.6m × 41.6m: X ∈ [-20.8, +20.8], Z ∈ [-20.8, +20.8])
  const squareFloor = new THREE.Mesh(new THREE.PlaneGeometry(41.6, 41.6), slateFloorMat);
  squareFloor.rotation.x = -Math.PI / 2;
  squareFloor.receiveShadow = true;
  g.add(squareFloor);

  // Open-sky Center Courtyard terracotta paving ("Sân Thiên Tỉnh Hình Vuông" — 21.2m × 21.2m)
  const centerTerracotta = new THREE.Mesh(new THREE.PlaneGeometry(21.2, 21.2), gachTauMat);
  centerTerracotta.rotation.x = -Math.PI / 2;
  centerTerracotta.position.set(0, 0.016, 0);
  centerTerracotta.receiveShadow = true;
  g.add(centerTerracotta);

  // Subtle golden lotus carpet runner along Right Shrine Gallery & Top Chính Điện approach
  const carpetRunnerMat = new THREE.MeshStandardMaterial({
    color: 0x7C1D16,
    roughness: 0.82
  });
  const rightGalleryRunner = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 30.0), carpetRunnerMat);
  rightGalleryRunner.rotation.x = -Math.PI / 2;
  rightGalleryRunner.position.set(14.8, 0.014, 3.0);
  rightGalleryRunner.receiveShadow = true;
  g.add(rightGalleryRunner);

  // 2. OUTER PERIMETER WALLS OF THE 41.6m SQUARE
  // North Back Wall (z = -20.8) behind Chính Điện
  const northWall = new THREE.Mesh(new THREE.BoxGeometry(41.8, 9.2, 0.48), wallWoodMat);
  northWall.position.set(0, 4.6, -20.8);
  northWall.receiveShadow = true;
  g.add(northWall);

  // West Wall (x = -20.8) behind 18 La Hán Gallery (cutaway-enabled so isometric cutaway looks clean)
  const westWall = registerCutaway(
    new THREE.Mesh(new THREE.BoxGeometry(0.48, 8.8, 41.8), creamPlasterMat)
  );
  westWall.position.set(-20.8, 4.4, 0);
  westWall.receiveShadow = true;
  g.add(westWall);
  const westWainscot = registerCutaway(
    new THREE.Mesh(new THREE.BoxGeometry(0.54, 1.45, 41.4), wallWoodMat)
  );
  westWainscot.position.set(-20.72, 0.72, 0);
  g.add(westWainscot);

  // South Wall (z = +20.8) with Bottom-Right Corner Entrance Portal at x = +15.6!
  const southWallLeft = registerCutaway(
    new THREE.Mesh(new THREE.BoxGeometry(34.2, 8.8, 0.48), creamPlasterMat)
  );
  southWallLeft.position.set(-3.7, 4.4, 20.8);
  g.add(southWallLeft);
  const southWallRightCorner = registerCutaway(
    new THREE.Mesh(new THREE.BoxGeometry(3.2, 8.8, 0.48), creamPlasterMat)
  );
  southWallRightCorner.position.set(19.2, 4.4, 20.8);
  g.add(southWallRightCorner);
  const southPortalHeader = registerCutaway(
    new THREE.Mesh(new THREE.BoxGeometry(4.4, 4.6, 0.5), creamPlasterMat)
  );
  southPortalHeader.position.set(15.5, 6.5, 20.8);
  g.add(southPortalHeader);

  // Decorative closed ceremonial front doors at (0, 0, +20.48) so pilgrims understand front doors stay closed
  const closedFrontGroup = new THREE.Group();
  closedFrontGroup.position.set(0, 0, 20.48);
  const cfFrame = new THREE.Mesh(new THREE.BoxGeometry(5.6, 4.6, 0.28), wallWoodMat);
  cfFrame.position.y = 2.3;
  closedFrontGroup.add(cfFrame);
  const cfPanel = new THREE.Mesh(new THREE.BoxGeometry(4.8, 4.1, 0.34), crimsonWoodMat);
  cfPanel.position.y = 2.08;
  closedFrontGroup.add(cfPanel);
  const cfNote = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 0.52),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('CỬA CHÍNH NGHI LỄ · LỐI VÀO/RA Ở GÓC DƯỚI BÊN PHẢI →', {
        w: 960,
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

  // East Wall (x = +20.8) behind Right Multi-Altar Gallery, with open archway at z ∈ [+2.2, +5.8] to Nhà Sàn Trai Đường
  const eastWallSouth = new THREE.Mesh(new THREE.BoxGeometry(0.48, 8.8, 15.0), creamPlasterMat);
  eastWallSouth.position.set(20.8, 4.4, 13.3);
  g.add(eastWallSouth);
  const eastWallNorth = new THREE.Mesh(new THREE.BoxGeometry(0.48, 8.8, 23.0), creamPlasterMat);
  eastWallNorth.position.set(20.8, 4.4, -9.3);
  g.add(eastWallNorth);
  const eastArchHeader = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.5, 3.8), creamPlasterMat);
  eastArchHeader.position.set(20.8, 6.55, 4.0);
  g.add(eastArchHeader);
  const eastWainscotS = new THREE.Mesh(new THREE.BoxGeometry(0.54, 1.35, 14.8), wallWoodMat);
  eastWainscotS.position.set(20.7, 0.68, 13.3);
  g.add(eastWainscotS);
  const eastWainscotN = new THREE.Mesh(new THREE.BoxGeometry(0.54, 1.35, 22.8), wallWoodMat);
  eastWainscotN.position.set(20.7, 0.68, -9.3);
  g.add(eastWainscotN);

  // Solid perimeter wall obstacles (leaving East archway z ∈ [+2.2, +5.8] open for Trai Đường)
  world.interiorRectObstacles.push(
    { minX: -21.2, maxX: 21.2, minZ: -21.2, maxZ: -20.3 },
    { minX: -21.2, maxX: -20.3, minZ: -21.2, maxZ: 21.2 },
    { minX: -21.2, maxX: 13.4, minZ: 20.3, maxZ: 21.2 },
    { minX: 17.6, maxX: 21.2, minZ: 20.3, maxZ: 21.2 },
    { minX: 20.3, maxX: 21.2, minZ: 5.85, maxZ: 21.2 },
    { minX: 20.3, maxX: 21.2, minZ: -21.2, maxZ: 2.15 }
  );

  // 3. COVERED ROOF CEILINGS & TRADITIONAL WOODEN RAFTERS AROUND ALL 4 GALLERY WINGS (Open Sky at Center!)
  // Top (North) Roof over Chính Điện, Bottom (South) Roof, Left (West) Roof, Right (East) Roof
  const roofSlabs = [
    { w: 41.6, d: 10.4, x: 0, z: -15.6 },
    { w: 41.6, d: 10.4, x: 0, z: 15.6 },
    { w: 10.4, d: 21.2, x: -15.6, z: 0 },
    { w: 10.4, d: 21.2, x: 15.6, z: 0 }
  ];
  for (const rs of roofSlabs) {
    const ceil = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(rs.w, 0.28, rs.d), ceilingWoodMat));
    ceil.position.set(rs.x, 8.85, rs.z);
    g.add(ceil);
  }
  for (let z = -19.5; z <= 19.5; z += 3.25) {
    if (Math.abs(z) > 10.5) {
      const beam = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(41.2, 0.22, 0.24), rafterMat));
      beam.position.set(0, 8.55, z);
      g.add(beam);
    } else {
      for (const sx of [-15.6, 15.6]) {
        const sideBeam = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.22, 0.22), rafterMat));
        sideBeam.position.set(sx, 8.55, z);
        g.add(sideBeam);
      }
    }
  }

  // Structural dark-lacquer heritage columns lining the 4 interior corridors
  const addLacquerColumn = (cx, cz, radius = 0.27, height = 8.6, withObstacle = true) => {
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(radius * 2.8, 0.34, radius * 2.8), M.stoneLight);
    plinth.position.set(cx, 0.17, cz);
    g.add(plinth);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.9, radius, height, 18), darkLacquerColMat);
    shaft.position.set(cx, 0.34 + height / 2, cz);
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    g.add(shaft);
    const goldBand = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.04, radius * 1.04, 0.16, 18), goldLeafMat);
    goldBand.position.set(cx, 7.6, cz);
    g.add(goldBand);
    if (withObstacle) {
      world.interiorObstacles.push({ x: cx, z: cz, r: radius + 0.16 });
    }
  };
  for (const cx of [-12.2, 12.2]) {
    for (const cz of [-16.2, -11.2, 12.2, 16.8]) {
      addLacquerColumn(cx, cz, 0.26, 8.4, true);
    }
  }

  // 4. BOTTOM-RIGHT CORNER ENTRANCE / EXIT PORTAL (+15.5, 0, +20.45)
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
  const daylightPortal = new THREE.Mesh(
    new THREE.PlaneGeometry(3.3, 4.0),
    new THREE.MeshBasicMaterial({ color: 0xFFE9BA, side: THREE.DoubleSide })
  );
  daylightPortal.position.set(0, 2.02, 0.12);
  daylightPortal.userData.exitSide = 'right';
  cornerDoorGroup.add(daylightPortal);

  const exitSign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 0.56),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('← RA SÂN CHÙA (LỐI GÓC DƯỚI BÊN PHẢI)', {
        w: 920,
        h: 160,
        bg: '#1E462B',
        border: '#F3C85F',
        color: '#FFF8E5',
        size: 32
      })
    })
  );
  exitSign.rotation.y = Math.PI;
  exitSign.position.set(0, 4.72, -0.18);
  exitSign.userData.exitSide = 'right';
  cornerDoorGroup.add(exitSign);

  // Directional welcome banner Overhead at Bottom-Right Corner pointing straight North along the Altar Gallery
  const guideBanner = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 0.62),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('↑ ĐI THẲNG: DẢI BÀN THỜ · NGHÌN MẮT NGHÌN TAY · CHỖ NGỦ CỦA PHẬT → LÊN CHÍNH ĐIỆN', {
        w: 1180,
        h: 170,
        bg: '#4E1812',
        border: '#F6CA63',
        color: '#FFF6DE',
        size: 27
      }),
      side: THREE.DoubleSide
    })
  );
  guideBanner.rotation.y = Math.PI;
  guideBanner.position.set(15.0, 4.85, 16.9);
  g.add(guideBanner);

  const exitHitbox = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 4.4, 1.1),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  exitHitbox.position.set(0, 2.2, 0);
  exitHitbox.userData.exitSide = 'right';
  cornerDoorGroup.add(exitHitbox);
  g.add(cornerDoorGroup);
  world.interiorDoorClickTargets.push(exitHitbox, daylightPortal, exitSign);

  // 5. CENTER OF THE SQUARE: OPEN-SKY "HỒ SEN BỘ" (X ∈ [-10.6, +10.6], Z ∈ [-10.6, +10.6])
  const centerGroup = new THREE.Group();
  centerGroup.position.set(0, 0, 0);
  g.add(centerGroup);

  // Sky daylight opening above the central square courtyard so natural sky glow bathes the lotus pond & rockery
  const skyOpening = new THREE.Mesh(
    new THREE.PlaneGeometry(20.6, 20.6),
    new THREE.MeshBasicMaterial({ color: 0xCBE8FF, side: THREE.DoubleSide })
  );
  skyOpening.rotation.x = Math.PI / 2;
  skyOpening.position.set(0, 9.6, 0);
  registerCutaway(skyOpening);
  centerGroup.add(skyOpening);

  const courtyardSun = new THREE.PointLight(0xFFF6DF, 1.75, 28, 1.35);
  courtyardSun.position.set(0, 8.2, 0);
  centerGroup.add(courtyardSun);

  // 4-Sided French-Colonial Yellow & Cream Arched Balustrade Colonnade (7 bays × 3.0m = 21.0m per side)
  // Open walkthrough bays at bi = 1, 3, 5 (offsets -6.0m, 0.0m, +6.0m); decorative carved balustrade at bi = 0, 2, 4, 6!
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

      // Twin fluted yellow-ochre columns on Left/Right of each bay
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

      // Roman-French semi-circular arch & upper Baroque cornice crest (matching image_0806c07c.png)
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
        // Low cream-and-ochre balustrade railing with vase balusters
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

        // Register solid obstacle for non-open balustrade bay
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
        // Register slim column obstacles at jambs so player walks smoothly through the 2.2m arch!
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

  buildCourtyardArcadeSide('z', -10.6); // North arcade opening directly to Chính Điện!
  buildCourtyardArcadeSide('z', 10.6);  // South arcade
  buildCourtyardArcadeSide('x', -10.6); // West arcade opening to 18 La Hán gallery
  buildCourtyardArcadeSide('x', 10.6);  // East arcade opening to Right Multi-Altar gallery

  // CENTRAL "HỒ SEN BỘ" (Octagonal/Circular Yellow-Ochre & Brick Lotus Pond + Koi + Blooming Lotuses + Hòn Non Bộ)
  const pondGroup = new THREE.Group();
  pondGroup.position.set(0, 0, 0);
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

  // Miniature arched stone bridge spanning from South rim toward central Hòn Non Bộ island
  const miniBridge = new THREE.Group();
  miniBridge.position.set(0, 0.52, 3.65);
  const bridgeDeck = new THREE.Mesh(
    new THREE.BoxGeometry(1.18, 0.14, 2.25),
    M.stoneLight
  );
  bridgeDeck.position.y = 0.18;
  miniBridge.add(bridgeDeck);
  for (const bx of [-0.54, 0.54]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 2.25), frenchCreamMat);
    rail.position.set(bx, 0.38, 0);
    miniBridge.add(rail);
  }
  pondGroup.add(miniBridge);

  // 28 Floating Green Lotus Pads + 36 Blooming 3D Pink & White Lotus Flowers in the moat around Hòn Non Bộ
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

  // 10 Articulated Swimming 3D Koi Fish inside Central Hồ Sen Bộ
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

  // Central Octagonal Yellow-Ochre Island Pedestal + Hòn Non Bộ Rockery Anchor
  const islandPedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(2.42, 2.58, 1.15, 8),
    frenchOchreMat
  );
  islandPedestal.position.y = 0.58;
  islandPedestal.castShadow = true;
  islandPedestal.receiveShadow = true;
  pondGroup.add(islandPedestal);

  const islandCap = new THREE.Mesh(
    new THREE.CylinderGeometry(2.54, 2.54, 0.14, 8),
    terraTrimMat
  );
  islandCap.position.y = 1.18;
  pondGroup.add(islandCap);

  const innerNonBoRockAnchor = new THREE.Group();
  innerNonBoRockAnchor.position.set(0, 1.24, 0);
  pondGroup.add(innerNonBoRockAnchor);
  world.innerNonBoRockAnchor = innerNonBoRockAnchor;

  // Procedural multi-peak limestone Hòn Non Bộ fallback (replaced seamlessly when hon-non-bo-thien-tinh.glb loads)
  const procRocks = new THREE.Group();
  const darkCragMat = new THREE.MeshStandardMaterial({ color: 0x3D3A36, roughness: 0.88 });
  const peakSpecs = [
    [0, 1.65, 0, 0.95, 3.3],
    [-0.95, 1.15, 0.25, 0.72, 2.3],
    [0.98, 1.22, 0.18, 0.74, 2.45],
    [-0.55, 0.9, -0.75, 0.65, 1.8],
    [0.62, 0.95, -0.7, 0.66, 1.9]
  ];
  for (const [rx, ry, rz, rr, rh] of peakSpecs) {
    const crag = new THREE.Mesh(new THREE.ConeGeometry(rr, rh, 7), darkCragMat);
    crag.position.set(rx, ry, rz);
    crag.castShadow = true;
    procRocks.add(crag);
  }
  const miniPavilion = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.38, 6), goldLeafMat);
  miniPavilion.position.set(0, 1.05, 0.85);
  procRocks.add(miniPavilion);
  innerNonBoRockAnchor.add(procRocks);
  world.innerNonBoProceduralRocks = procRocks;

  // 8 Blue-and-White Porcelain Bonsai Pots & 2 Vintage 5-Globe Streetlamps around the Hồ Sen Bộ
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
    for (const [gx, gy, gz] of [[0, 3.78, 0], [-0.38, 3.48, 0], [0.38, 3.48, 0], [0, 3.48, -0.38], [0, 3.48, 0.38]]) {
      const glb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), globeMat);
      glb.position.set(gx, gy, gz);
      lampGrp.add(glb);
    }
    centerGroup.add(lampGrp);
    world.interiorObstacles.push({ x: lx, z: -5.8, r: 0.32 });
  }

  world.interiorNonBoClickTargets.push(pondGroup);
  world.interiorObstacles.push({ x: 0, z: 0, r: 6.12 });

  // 6. STRAIGHT RIGHT-SIDE MULTI-ALTAR GALLERY ("đi một đường thẳng có nhiều cái bàn thờ")
  // Pilgrim enters at (+15.0, +18.2) facing North (-Z) and walks straight from z = +18 -> -12!
  const buildSideGalleryAltarBase = (width = 3.2, depth = 1.35, height = 1.08) => {
    const ag = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), crimsonWoodMat);
    body.position.y = height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    ag.add(body);
    const topSlab = new THREE.Mesh(new THREE.BoxGeometry(width + 0.14, 0.08, depth + 0.14), goldLeafMat);
    topSlab.position.y = height + 0.04;
    ag.add(topSlab);
    const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.24, 14), bronzePatinaMat);
    burner.position.set(0, height + 0.2, depth * 0.28);
    ag.add(burner);
    for (const side of [-1, 1]) {
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 0.44, 10), bronzePatinaMat);
      candle.position.set(side * (width * 0.34), height + 0.3, depth * 0.26);
      ag.add(candle);
      const lotusBouquet = world.makeLotusFlower3D(false, true);
      lotusBouquet.scale.setScalar(1.35);
      lotusBouquet.position.set(side * (width * 0.42), height + 0.26, -depth * 0.05);
      ag.add(lotusBouquet);
    }
    return ag;
  };

  // Shrine 1 (z = +14.8): TƯỢNG PHẬT NGHÌN MẮT NGHÌN TAY (Thiên Thủ Thiên Nhãn Quán Thế Âm)
  const nghinMatGroup = new THREE.Group();
  nghinMatGroup.position.set(18.55, 0, 14.8);
  nghinMatGroup.rotation.y = -Math.PI / 2; // Local +Z points West (-X) directly toward pilgrim!
  const nmAltar = buildSideGalleryAltarBase(3.4, 1.45, 1.06);
  nghinMatGroup.add(nmAltar);

  // Carved gilded canopy frame behind Nghìn Mắt Nghìn Tay
  const nmBackFrame = new THREE.Mesh(new THREE.BoxGeometry(3.55, 3.85, 0.16), baoLamMat);
  nmBackFrame.position.set(0, 2.95, -0.68);
  nghinMatGroup.add(nmBackFrame);
  const nmSign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.9, 0.46),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('PHẬT BÀ NGHÌN MẮT NGHÌN TAY · THIÊN THỦ THIÊN NHÃN', {
        w: 960,
        h: 150,
        bg: '#4A1510',
        border: '#F5C85B',
        color: '#FFF6DC',
        size: 30
      })
    })
  );
  nmSign.position.set(0, 4.65, 0.15);
  nghinMatGroup.add(nmSign);

  const nghinMatAnchor = new THREE.Group();
  nghinMatAnchor.position.set(0, 1.1, -0.08);
  const nghinMatProc = createThousandArmedQuanAm(THREE, { scale: 1.16 });
  nghinMatAnchor.add(nghinMatProc);
  nghinMatGroup.add(nghinMatAnchor);
  world.nghinMatNghinTayAnchor = nghinMatAnchor;
  world.nghinMatProceduralGroup = nghinMatProc;

  const nmLight = new THREE.PointLight(0xFFD27D, 1.45, 9.5, 1.6);
  nmLight.position.set(0, 3.8, 1.8);
  nghinMatGroup.add(nmLight);
  g.add(nghinMatGroup);
  world.nghinMatClickTargets.push(nghinMatGroup);

  const nmCushion = world.makeKneelingCushion();
  nmCushion.position.set(16.2, 0, 14.8);
  g.add(nmCushion);
  world.interiorRectObstacles.push({ minX: 17.65, maxX: 20.5, minZ: 12.95, maxZ: 16.65 });

  // Shrine 2 (z = +9.0): CHỖ NGỦ CỦA PHẬT (Đức Phật Nhập Niết Bàn · Giường Long Sàng Sơn Son Thếp Vàng)
  const choNguGroup = new THREE.Group();
  choNguGroup.position.set(18.65, 0, 9.0);
  choNguGroup.rotation.y = -Math.PI / 2; // Local +Z points West (-X) directly toward pilgrim!
  const sleepingShrine = createIndoorSleepingBuddhaBed(THREE, { scale: 1.0 });
  choNguGroup.add(sleepingShrine);

  // Fore-offering incense table in front of the Sleeping Buddha canopy bed
  const cnForeTable = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.82, 0.56), crimsonWoodMat);
  cnForeTable.position.set(0, 0.41, 1.06);
  choNguGroup.add(cnForeTable);
  const cnBurner = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.22, 14), bronzePatinaMat);
  cnBurner.position.set(0, 0.94, 1.06);
  choNguGroup.add(cnBurner);

  const cnSign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.1, 0.46),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('CHỖ NGỦ CỦA PHẬT · ĐỨC PHẬT NHẬP NIẾT BÀN', {
        w: 960,
        h: 150,
        bg: '#4A1510',
        border: '#F5C85B',
        color: '#FFF6DC',
        size: 31
      })
    })
  );
  cnSign.position.set(0, 3.72, 0.76);
  choNguGroup.add(cnSign);

  const choNguAnchor = new THREE.Group();
  choNguAnchor.position.set(0, 1.06, 0.04);
  choNguGroup.add(choNguAnchor);
  world.choNguCuaPhatAnchor = choNguAnchor;
  world.choNguPlaceholderBody = sleepingShrine.userData.placeholderBody;

  const cnLight = new THREE.PointLight(0xFFCC78, 1.35, 9.5, 1.6);
  cnLight.position.set(0, 3.5, 1.9);
  choNguGroup.add(cnLight);
  g.add(choNguGroup);
  world.choNguClickTargets.push(choNguGroup);

  const cnCushion = world.makeKneelingCushion();
  cnCushion.position.set(16.05, 0, 9.0);
  g.add(cnCushion);
  world.interiorRectObstacles.push({ minX: 17.35, maxX: 20.5, minZ: 7.15, maxZ: 10.85 });

  // Shrines 3, 4, 5 continuing straight North along the Right Altar Gallery (z = -0.8, -6.2, -11.6)
  const extraRightShrines = [
    {
      z: -0.8,
      title: 'ĐỨC PHẬT DƯỢC SƯ LƯU LY QUANG',
      toastDesc: 'Ban thờ Đức Phật Dược Sư Lưu Ly Quang Vương — nguyện cầu thân tâm an khang, tật bệnh tiêu trừ.',
      makeStatue: () => createSculptedSeatedBuddha(THREE, { scale: 0.96 })
    },
    {
      z: -6.2,
      title: 'ĐỊA TẠNG VƯƠNG BỒ TÁT · BÁO HIẾU TỨ ÂN',
      toastDesc: 'Ban thờ Đức Địa Tạng Vương Bồ Tát cầm tích trượng và minh châu cứu độ chúng sanh, trọn đạo hiếu hạnh.',
      makeStatue: () => createSeatedBodhisattva(THREE, { variant: 'the_chi', scale: 0.98 })
    },
    {
      z: -11.6,
      title: 'VĂN THÙ SƯ LỢI & PHỔ HIỀN BỒ TÁT',
      toastDesc: 'Ban thờ Đại Trí Văn Thù Sư Lợi và Đại Hạnh Phổ Hiền Bồ Tát dẫn bước người con Phật tiến vào Chính Điện.',
      makeStatue: () => createSeatedBodhisattva(THREE, { variant: 'quan_am', scale: 0.98 })
    }
  ];
  for (const sh of extraRightShrines) {
    const sg = new THREE.Group();
    sg.position.set(18.65, 0, sh.z);
    sg.rotation.y = -Math.PI / 2;
    sg.userData.shrineTitle = `🙏 ${sh.title}`;
    sg.userData.shrineDesc = sh.toastDesc;
    const base = buildSideGalleryAltarBase(2.95, 1.32, 1.04);
    sg.add(base);
    const statue = sh.makeStatue();
    statue.position.set(0, 1.08, -0.06);
    sg.add(statue);
    const plaque = new THREE.Mesh(
      new THREE.PlaneGeometry(2.65, 0.42),
      new THREE.MeshBasicMaterial({
        map: world.makeSignTexture(sh.title, {
          w: 900,
          h: 140,
          bg: '#4A1510',
          border: '#F5C85B',
          color: '#FFF6DC',
          size: 28
        })
      })
    );
    plaque.position.set(0, 3.58, 0.25);
    sg.add(plaque);
    g.add(sg);
    world.rightGalleryClickTargets.push(sg);
    const mat = world.makeKneelingCushion();
    mat.position.set(16.25, 0, sh.z);
    g.add(mat);
    world.interiorRectObstacles.push({ minX: 17.75, maxX: 20.5, minZ: sh.z - 1.55, maxZ: sh.z + 1.55 });
  }

  // Warm ambient gallery lanterns along the Straight Right Altar Gallery
  for (const lz of [17.2, 11.8, 4.0, -3.5, -9.2]) {
    const pl = new THREE.PointLight(0xFFC978, 0.92, 11, 1.7);
    pl.position.set(15.2, 5.4, lz);
    g.add(pl);
  }

  // 7. EAST MEKONG STILT PAVILION: NHÀ SÀN GỖ TRAI ĐƯỜNG (connected at z = +4.0, x ∈ [21.4, 32.0])
  const tdGroup = new THREE.Group();
  tdGroup.position.set(26.8, 0, 4.0);
  g.add(tdGroup);

  const tdWater = new THREE.Mesh(
    new THREE.PlaneGeometry(11.6, 15.6),
    new THREE.MeshStandardMaterial({ color: 0x1D4F45, roughness: 0.2, metalness: 0.14 })
  );
  tdWater.rotation.x = -Math.PI / 2;
  tdWater.position.set(0, 0.04, 0);
  tdGroup.add(tdWater);

  const tdDeck = new THREE.Mesh(
    new THREE.BoxGeometry(10.8, 0.22, 14.4),
    new THREE.MeshStandardMaterial({ color: 0x5C341B, map: world.woodGrainTex, roughness: 0.55 })
  );
  tdDeck.position.set(0, 0.74, 0);
  tdDeck.receiveShadow = true;
  tdGroup.add(tdDeck);

  // Wooden ramp connecting Right Gallery archway (x = 20.8, y = 0) smoothly up to Trai Đường deck (x = 22.0, y = 0.85)
  const tdRamp = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.16, 3.2), rafterMat);
  tdRamp.position.set(-5.4, 0.42, 0);
  tdRamp.rotation.z = 0.44;
  tdGroup.add(tdRamp);

  const tdSign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8, 0.52),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('🍚 NHÀ SÀN GỖ TRAI ĐƯỜNG →', {
        w: 860,
        h: 160,
        bg: '#1C5A34',
        border: '#FFD875',
        color: '#FFF6E5',
        size: 34
      }),
      side: THREE.DoubleSide
    })
  );
  tdSign.rotation.y = -Math.PI / 2;
  tdSign.position.set(-6.15, 4.15, 0);
  tdGroup.add(tdSign);

  // Dining tables & vegetarian tea/rice counter inside Trai Đường
  for (const tz of [-4.2, 0, 4.2]) {
    const tbl = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 1.15), rafterMat);
    tbl.position.set(0.6, 1.23, tz);
    tdGroup.add(tbl);
    world.interiorRectObstacles.push({ minX: 25.9, maxX: 28.9, minZ: 4.0 + tz - 0.7, maxZ: 4.0 + tz + 0.7 });
  }
  const tdRoof = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.28, 15.0), ceilingWoodMat));
  tdRoof.position.set(0, 5.4, 0);
  tdGroup.add(tdRoof);
  const tdLight = new THREE.PointLight(0xFFD996, 1.25, 14, 1.6);
  tdLight.position.set(0, 4.6, 0);
  tdGroup.add(tdLight);
  world.interiorTraiDuongClickTargets.push(tdGroup);

  buildTopChinhDienAndLeftBottomGalleries(world, THREE, {
    g,
    M,
    registerCutaway,
    wallWoodMat,
    darkLacquerColMat,
    goldLeafMat,
    bronzePatinaMat,
    crimsonWoodMat,
    baoLamMat
  });
}

function buildTopChinhDienAndLeftBottomGalleries(world, THREE, ctx) {
  const {
    g,
    M,
    wallWoodMat,
    darkLacquerColMat,
    goldLeafMat,
    bronzePatinaMat,
    crimsonWoodMat,
    baoLamMat
  } = ctx;

  // =========================================================================================
  // 8. TOP EDGE OF THE SQUARE (z = -11.4 .. -20.8): CHÍNH ĐIỆN (ĐẠI HÙNG BỬU ĐIỆN)
  // =========================================================================================

  // 8A. Carved wooden folding lattice doors ("Cửa gỗ chấn song gấp mở" — image_d3dcebc6.png)
  // Placed at z = -11.5 with 3 wide open portals at x = 0, x = -6.0, x = +6.0
  const partitionGroup = new THREE.Group();
  partitionGroup.position.set(0, 0, -11.55);
  const transomBeam = new THREE.Mesh(new THREE.BoxGeometry(19.6, 1.35, 0.24), baoLamMat);
  transomBeam.position.set(0, 5.15, 0);
  partitionGroup.add(transomBeam);

  // Tilted crimson-and-gold Hoành Phi ("ĐẠI HÙNG BỬU ĐIỆN") above central portal
  const hoanhPhi = new THREE.Mesh(
    new THREE.BoxGeometry(3.85, 1.05, 0.14),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('ĐẠI HÙNG BỬU ĐIỆN', {
        w: 920,
        h: 240,
        bg: '#5B140E',
        border: '#F3C654',
        color: '#FFE380',
        size: 62
      })
    })
  );
  hoanhPhi.position.set(0, 5.42, 0.26);
  hoanhPhi.rotation.x = 0.22;
  partitionGroup.add(hoanhPhi);

  for (const px of [-9.4, -7.4, -4.4, -1.85, 1.85, 4.4, 7.4, 9.4]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 5.6, 0.28), darkLacquerColMat);
    post.position.set(px, 2.8, 0);
    partitionGroup.add(post);

    // Folded wooden lattice leaf beside each doorway jamb
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.55, 4.15, 0.08), wallWoodMat);
    leaf.position.set(px + (px < 0 ? 0.18 : -0.18), 2.1, 0.22);
    leaf.rotation.y = px < 0 ? 0.42 : -0.42;
    partitionGroup.add(leaf);
    world.interiorObstacles.push({ x: px, z: -11.55, r: 0.26 });
  }
  // Vertical calligraphy couplets ("Câu đối sơn son thếp vàng") on central portal jambs
  const couplets = [
    [-1.85, 'PHẬT NHẬT TĂNG HUY'],
    [1.85, 'PHÁP LUÂN THƯỜNG CHUYỂN']
  ];
  for (const [cx, text] of couplets) {
    const cp = new THREE.Mesh(
      new THREE.PlaneGeometry(0.32, 3.6),
      new THREE.MeshBasicMaterial({ map: world.makeVerticalCalligraphyTex(text) })
    );
    cp.position.set(cx, 2.45, 0.18);
    partitionGroup.add(cp);
  }
  g.add(partitionGroup);

  // 8B. THÁP ĐÈN CẦU AN / VẠN PHẬT ("Ghi Tên Cầu Phước" — image_d3dcebc6.png)
  // Positioned right beside the main wooden doorway of Chính Điện at (-3.35, 0, -11.95)
  const btGroup = new THREE.Group();
  btGroup.position.set(-3.35, 0, -11.95);
  world.blessingTowerGroup = btGroup;

  const btStand = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.64, 0.62, 12), darkLacquerColMat);
  btStand.position.y = 0.31;
  btGroup.add(btStand);
  const btLotusBase = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.52, 0.22, 16), goldLeafMat);
  btLotusBase.position.y = 0.72;
  btGroup.add(btLotusBase);

  const btBodyAnchor = new THREE.Group();
  btBodyAnchor.position.y = 0.82;
  btGroup.add(btBodyAnchor);
  world.blessingTowerBodyAnchor = btBodyAnchor;

  const btCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.54, 2.34, 20),
    new THREE.MeshStandardMaterial({
      color: 0xD96B1B,
      emissive: 0x8A320A,
      emissiveIntensity: 0.48,
      roughness: 0.36
    })
  );
  btCore.position.y = 1.17;
  btBodyAnchor.add(btCore);
  world.blessingTowerProceduralCore = btCore;

  // 108 illuminated prayer-name niche lamps spiralling up 9 tiers × 12 niches
  let slotCounter = 1;
  for (let tier = 0; tier < 9; tier++) {
    const ty = 1.02 + tier * 0.215;
    const tr = 0.375 - tier * 0.008;
    for (let k = 0; k < 12; k++) {
      const ang = (k / 12) * Math.PI * 2 + (tier % 2) * (Math.PI / 12);
      const lampMat = new THREE.MeshStandardMaterial({
        color: 0xD89E5C,
        emissive: 0x7A3212,
        emissiveIntensity: 0.35,
        roughness: 0.3
      });
      const niche = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 6), lampMat);
      niche.scale.set(0.92, 1.25, 0.58);
      niche.position.set(Math.cos(ang) * tr, ty, Math.sin(ang) * tr);
      niche.userData.slotNumber = slotCounter++;
      btGroup.add(niche);
      world.blessingTowerLampMeshes.push(niche);
    }
  }
  const btCanopy = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.28, 12), crimsonWoodMat);
  btCanopy.position.y = 3.38;
  btGroup.add(btCanopy);
  const btGlow = new THREE.PointLight(0xFFA94D, 1.35, 6.5, 1.7);
  btGlow.position.set(0, 2.1, 0.35);
  btGroup.add(btGlow);

  const btSign = new THREE.Mesh(
    new THREE.BoxGeometry(1.78, 0.36, 0.08),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('🏮 THÁP ĐÈN CẦU AN · GHI TÊN CẦU PHƯỚC', {
        w: 760,
        h: 140,
        bg: '#5B180E',
        border: '#FFD269',
        color: '#FFF6DE',
        size: 28
      })
    })
  );
  btSign.position.set(0, 3.82, 0);
  btGroup.add(btSign);
  g.add(btGroup);
  world.blessingTowerClickTargets.push(btGroup);
  world.interiorObstacles.push({ x: -3.35, z: -11.95, r: 0.72 });

  // 8C. PAIR OF COILED-DRAGON LONG TRỤ (±4.6, 0, -14.6), GILDED BAO LAM & 4 SPIRAL INCENSE COILS
  for (const sideSign of [-1, 1]) {
    const lx = sideSign * 4.6;
    const lz = -14.6;
    const ltGrp = new THREE.Group();
    ltGrp.position.set(lx, 0, lz);
    const ped = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.65, 0.86), M.stoneLight);
    ped.position.y = 0.325;
    ltGrp.add(ped);
    const colShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 7.45, 18), darkLacquerColMat);
    colShaft.position.y = 4.38;
    colShaft.castShadow = true;
    ltGrp.add(colShaft);

    const replaceParts = [colShaft];
    for (let s = 0; s < 14; s++) {
      const ang = (s / 14) * Math.PI * 3.5 * sideSign;
      const coil = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), goldLeafMat);
      coil.scale.set(1.3, 0.9, 1.3);
      coil.position.set(Math.cos(ang) * 0.38, 1.35 + s * 0.38, Math.sin(ang) * 0.38);
      ltGrp.add(coil);
      replaceParts.push(coil);
    }
    g.add(ltGrp);
    world.longTruPlaceholders.push({ group: ltGrp, replaceParts, sideSign });
    world.longTruClickTargets.push(ltGrp);
    world.interiorObstacles.push({ x: lx, z: lz, r: 0.56 });
  }

  // Carved Openwork Gilded Bao Lam spanning across Top Sanctuary (z = -14.6)
  const baoLamBeam = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.96, 0.22), goldLeafMat);
  baoLamBeam.position.set(0, 6.25, -14.6);
  g.add(baoLamBeam);
  for (const sx of [-3.9, 3.9]) {
    const dropScroll = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.85, 0.16), goldLeafMat);
    dropScroll.position.set(sx, 5.15, -14.6);
    g.add(dropScroll);
  }

  // 4 Hanging Bronze Spiral Incense Coils ("Nhang Vòng Đồng") under Chính Điện ceiling
  for (const [ix, iz] of [[-2.8, -13.2], [2.8, -13.2], [-5.6, -15.4], [5.6, -15.4]]) {
    const anc = new THREE.Group();
    anc.position.set(ix, 6.85, iz);
    const spiral = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.72, 16, 1, true), bronzePatinaMat);
    spiral.position.y = -0.36;
    anc.add(spiral);
    g.add(anc);
    world.spiralIncenseAnchors.push(anc);
  }

  // 8D. ĐẠI HỒNG CHUNG (+6.8, 0, -13.6), TRỐNG BÁT NHÃ (-6.8, 0, -13.6), CHUÔNG GIA TRÌ & MÕ GỖ
  const bellGroup = new THREE.Group();
  bellGroup.position.set(6.8, 0, -13.6);
  const bellFrame = new THREE.Mesh(new THREE.BoxGeometry(1.68, 2.75, 1.1), crimsonWoodMat);
  bellFrame.position.y = 1.38;
  // Hollow frame posts + top beam
  bellGroup.remove(bellFrame);
  for (const bx of [-0.72, 0.72]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 2.85, 10), crimsonWoodMat);
    post.position.set(bx, 1.42, 0);
    bellGroup.add(post);
  }
  const bellCross = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.22, 0.34), goldLeafMat);
  bellCross.position.set(0, 2.82, 0);
  bellGroup.add(bellCross);
  const bellPlaceholder = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.54, 1.28, 18), bronzePatinaMat);
  bellPlaceholder.position.set(0, 1.72, 0);
  bellGroup.add(bellPlaceholder);
  g.add(bellGroup);
  world.interiorBellAnchor = { group: bellGroup, placeholder: bellPlaceholder };
  world.interiorBellClickTargets.push(bellGroup);
  world.interiorObstacles.push({ x: 6.8, z: -13.6, r: 0.92 });

  const drumGroup = new THREE.Group();
  drumGroup.position.set(-6.8, 0, -13.6);
  for (const dx of [-0.68, 0.68]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.65, 10), crimsonWoodMat);
    post.position.set(dx, 0.82, 0);
    drumGroup.add(post);
  }
  const drumPlaceholder = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 1.16, 20), crimsonWoodMat);
  drumPlaceholder.rotation.x = Math.PI / 2;
  drumPlaceholder.position.set(0, 1.72, 0);
  drumGroup.add(drumPlaceholder);
  g.add(drumGroup);
  world.interiorDrumAnchor = { group: drumGroup, placeholder: drumPlaceholder };
  world.interiorDrumClickTargets.push(drumGroup);
  world.interiorObstacles.push({ x: -6.8, z: -13.6, r: 0.92 });

  // Chuông Gia Trì (+2.65, 0, -14.5) & Mõ Gỗ Lớn (-2.65, 0, -14.5) flanking the 3 kneeling cushions
  const giaTriStand = new THREE.Group();
  giaTriStand.position.set(2.65, 0, -14.5);
  const gtPed = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.68, 0.68), crimsonWoodMat);
  gtPed.position.y = 0.34;
  giaTriStand.add(gtPed);
  const gtBowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 16, 12, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.58),
    bronzePatinaMat
  );
  gtBowl.position.y = 0.88;
  giaTriStand.add(gtBowl);
  g.add(giaTriStand);
  world.interiorBellClickTargets.push(giaTriStand);
  world.interiorObstacles.push({ x: 2.65, z: -14.5, r: 0.52 });

  const moStand = new THREE.Group();
  moStand.position.set(-2.65, 0, -14.5);
  const moPed = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.68, 0.68), crimsonWoodMat);
  moPed.position.y = 0.34;
  moStand.add(moPed);
  const moBody = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 12), crimsonWoodMat);
  moBody.scale.set(1.18, 0.88, 1.05);
  moBody.position.y = 0.88;
  moStand.add(moBody);
  g.add(moStand);
  world.interiorDrumClickTargets.push(moStand);
  world.interiorObstacles.push({ x: -2.65, z: -14.5, r: 0.52 });

  // 3 Kneeling Cushions ("Bồ đoàn lạy Phật") directly in front of Tam Bảo Altar
  for (const bx of [-1.28, 0, 1.28]) {
    const cush = world.makeKneelingCushion();
    cush.position.set(bx, 0, -13.85);
    g.add(cush);
  }

  // 8E. CENTRAL TAM BẢO SANCTUARY ALTAR (0, 0, -18.0 — grounded in image_d908b99f.png)
  const tamBaoGroup = new THREE.Group();
  tamBaoGroup.position.set(0, 0, -18.0);
  world.tamBaoAltarGroup = tamBaoGroup;

  // Golden auspicious cloud mural backdrop + Concentric Rainbow Dharma Wheel Halo
  const muralTex = makeLocalCanvasTex(
    THREE,
    (c2d, w, h) => {
      const grad = c2d.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#4E170E');
      grad.addColorStop(0.45, '#9C4218');
      grad.addColorStop(1, '#3A120B');
      c2d.fillStyle = grad;
      c2d.fillRect(0, 0, w, h);
      c2d.fillStyle = 'rgba(255, 206, 108, 0.28)';
      for (let i = 0; i < 28; i++) {
        c2d.beginPath();
        c2d.arc(((i * 97) % w), ((i * 67) % h), 36 + (i % 4) * 18, 0, Math.PI * 2);
        c2d.fill();
      }
    },
    512,
    512
  );
  const backdropPanel = new THREE.Mesh(
    new THREE.BoxGeometry(8.8, 7.2, 0.18),
    new THREE.MeshStandardMaterial({ map: muralTex, roughness: 0.48 })
  );
  backdropPanel.position.set(0, 3.8, -1.95);
  tamBaoGroup.add(backdropPanel);

  // Concentric glowing Dharma halo behind main Shakyamuni Buddha (image_d908b99f.png)
  const haloColors = [0xFF5252, 0xFFB74D, 0xFFF176, 0x81D4FA, 0xFFFFFF];
  haloColors.forEach((hex, idx) => {
    const rIn = 0.52 + idx * 0.17;
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(rIn, rIn + 0.085, 36),
      new THREE.MeshBasicMaterial({ color: hex, side: THREE.DoubleSide })
    );
    ring.position.set(0, 5.45, -1.78 + idx * 0.005);
    tamBaoGroup.add(ring);
  });

  // 3-Tiered Dark Rosewood & Gold-Leaf Tam Bảo Altar Throne
  const tier1 = new THREE.Mesh(new THREE.BoxGeometry(8.6, 1.36, 3.2), darkLacquerColMat);
  tier1.position.set(0, 0.68, 0.15);
  tier1.castShadow = true;
  tier1.receiveShadow = true;
  tamBaoGroup.add(tier1);
  const tier1Rim = new THREE.Mesh(new THREE.BoxGeometry(8.76, 0.09, 3.32), goldLeafMat);
  tier1Rim.position.set(0, 1.38, 0.15);
  tamBaoGroup.add(tier1Rim);

  const tier2 = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.88, 2.1), crimsonWoodMat);
  tier2.position.set(0, 1.82, -0.35);
  tamBaoGroup.add(tier2);

  const tier3 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.74, 1.45), darkLacquerColMat);
  tier3.position.set(0, 2.62, -0.82);
  tamBaoGroup.add(tier3);

  // Seated Bodhisattvas on middle tier + Armored Guardians + Standing Crimson-Robed Patriarch (image_d908b99f.png)
  const leftBodhi = createSeatedBodhisattva(THREE, { variant: 'quan_am', scale: 0.94 });
  leftBodhi.position.set(-1.95, 2.26, -0.22);
  tamBaoGroup.add(leftBodhi);

  const rightBodhi = createSeatedBodhisattva(THREE, { variant: 'the_chi', scale: 0.94 });
  rightBodhi.position.set(1.95, 2.26, -0.22);
  tamBaoGroup.add(rightBodhi);

  const centerLowerBuddha = createSculptedSeatedBuddha(THREE, { scale: 0.88 });
  centerLowerBuddha.position.set(0, 2.26, -0.1);
  tamBaoGroup.add(centerLowerBuddha);

  for (const side of [-1, 1]) {
    const guard = createSculptedGuardian(THREE, {
      variant: side < 0 ? 'ho_phap' : 'tieu_dien',
      scale: 0.92
    });
    guard.position.set(side * 3.45, 1.4, -0.15);
    tamBaoGroup.add(guard);

    const candleStand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.24, 1.12, 12), bronzePatinaMat);
    candleStand.position.set(side * 2.1, 1.96, 1.18);
    tamBaoGroup.add(candleStand);

    const bouquet = world.makeLotusFlower3D(false, true);
    bouquet.scale.setScalar(1.65);
    bouquet.position.set(side * 1.05, 1.56, 1.15);
    tamBaoGroup.add(bouquet);
  }

  const standingPatriarch = createStandingCrimsonMonkStatue(THREE, { scale: 0.96 });
  standingPatriarch.position.set(0.95, 0.02, 1.92);
  standingPatriarch.rotation.y = Math.PI * 0.82; // Facing respectfully toward the Buddha as in image_d908b99f.png
  tamBaoGroup.add(standingPatriarch);

  const craneTortoiseAnchor = new THREE.Group();
  craneTortoiseAnchor.position.set(0, 1.4, 0.95);
  tamBaoGroup.add(craneTortoiseAnchor);
  world.craneTortoiseAnchor = craneTortoiseAnchor;

  // Warm sanctuary golden lighting (moody & reverent — no harsh white glare!)
  const sanctLightMain = new THREE.PointLight(0xFFC266, 1.95, 15, 1.45);
  sanctLightMain.position.set(0, 5.8, 2.4);
  tamBaoGroup.add(sanctLightMain);
  const sanctLightHalo = new THREE.PointLight(0xFFB347, 1.25, 10, 1.6);
  sanctLightHalo.position.set(0, 4.8, -0.6);
  tamBaoGroup.add(sanctLightHalo);

  g.add(tamBaoGroup);
  world.interiorRectObstacles.push({ minX: -4.55, maxX: 4.55, minZ: -20.2, maxZ: -16.15 });

  // 8F. NORTHWEST CORNER SHRINE (-14.8, 0, -18.2): BAN THỜ TỔ SƯ ĐẠT MA & CHƯ VỊ TỔ SƯ
  const khuThoGroup = new THREE.Group();
  khuThoGroup.position.set(-14.8, 0, -18.2);
  world.khuThoAltarGroup = khuThoGroup;
  const ktBase = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.22, 1.6), darkLacquerColMat);
  ktBase.position.y = 0.61;
  khuThoGroup.add(ktBase);
  const ktUpper = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.08, 1.05), crimsonWoodMat);
  ktUpper.position.set(0, 1.76, -0.18);
  khuThoGroup.add(ktUpper);
  const ktProc = createSculptedPatriarch(THREE, { scale: 0.92 });
  ktProc.position.set(0, 2.32, -0.18);
  khuThoGroup.add(ktProc);
  world.khuThoPlaceholderParts.push(ktProc);

  const ktSign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.1, 0.46),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('TỔ ĐƯỜNG · SƠ TỔ BỒ ĐỀ ĐẠT MA & CHƯ TỔ SƯ', {
        w: 940,
        h: 150,
        bg: '#4A1510',
        border: '#F5C85B',
        color: '#FFF6DC',
        size: 30
      })
    })
  );
  ktSign.position.set(0, 4.35, 0.25);
  khuThoGroup.add(ktSign);
  const ktCush = world.makeKneelingCushion();
  ktCush.position.set(-14.8, 0, -15.6);
  g.add(ktCush);
  g.add(khuThoGroup);
  world.interiorKhuThoClickTargets.push(khuThoGroup);
  world.interiorRectObstacles.push({ minX: -16.9, maxX: -12.7, minZ: -19.8, maxZ: -17.1 });

  // 8G. NORTHEAST CORNER SHRINE (+14.8, 0, -18.2): BAN THỜ QUÁN THẾ ÂM TỪ BI CỨU KHỔ
  const neShrine = new THREE.Group();
  neShrine.position.set(14.8, 0, -18.2);
  neShrine.userData.shrineTitle = '🪷 Ban Thờ Bồ Tát Quán Thế Âm Cứu Khổ';
  neShrine.userData.shrineDesc = 'Nơi Phật tử đi hết dải bàn thờ bên phải dừng chân chắp tay niệm danh hiệu Đức Quán Thế Âm trước khi rẽ vào Chính Điện lạy Phật.';
  const neBase = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.18, 1.55), crimsonWoodMat);
  neBase.position.y = 0.59;
  neShrine.add(neBase);
  const neStatue = createSeatedBodhisattva(THREE, { variant: 'quan_am', scale: 1.05 });
  neStatue.position.set(0, 1.2, -0.05);
  neShrine.add(neStatue);
  const neSign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.0, 0.44),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('NAM MÔ ĐẠI TỪ ĐẠI BI QUÁN THẾ ÂM BỒ TÁT', {
        w: 940,
        h: 150,
        bg: '#4A1510',
        border: '#F5C85B',
        color: '#FFF6DC',
        size: 29
      })
    })
  );
  neSign.position.set(0, 4.2, 0.25);
  neShrine.add(neSign);
  g.add(neShrine);
  world.rightGalleryClickTargets.push(neShrine);
  world.interiorRectObstacles.push({ minX: 12.9, maxX: 16.7, minZ: -19.8, maxZ: -17.1 });

  // =========================================================================================
  // 9. LEFT GALLERY (18 VỊ LA HÁN + HỘ PHÁP VI ĐÀ) & BOTTOM GALLERY (TIÊU DIỆN + TIỀN HIỀN)
  // =========================================================================================

  // Overhead Gallery Sign for 18 Arhats along Left Wall (x = -18.5, z = -11.9 .. +13.6)
  const arhatBanner = new THREE.Mesh(
    new THREE.PlaneGeometry(3.5, 0.54),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('THẬP BÁT LA HÁN ĐƯỜNG · 18 VỊ TÔN GIẢ HỘ TRÌ CHÁNH PHÁP', {
        w: 1020,
        h: 160,
        bg: '#4A1510',
        border: '#F5C85B',
        color: '#FFF6DC',
        size: 29
      }),
      side: THREE.DoubleSide
    })
  );
  arhatBanner.rotation.y = Math.PI / 2;
  arhatBanner.position.set(-19.6, 4.5, 0.8);
  g.add(arhatBanner);

  for (const lz of [-9.0, 0.0, 9.0, 16.5]) {
    const wl = new THREE.PointLight(0xFFC875, 0.88, 11, 1.7);
    wl.position.set(-15.4, 5.4, lz);
    g.add(wl);
  }

  // Southwest Guardian Altar (-18.3, 0, +16.8, facing +X): HỘ PHÁP VI ĐÀ TÔN THIÊN BỒ TÁT
  const hoPhapAltar = new THREE.Group();
  hoPhapAltar.position.set(-18.3, 0, 16.8);
  hoPhapAltar.rotation.y = Math.PI / 2;
  const hpPed = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.16, 1.5), crimsonWoodMat);
  hpPed.position.y = 0.58;
  hoPhapAltar.add(hpPed);
  const hpProc = createSculptedGuardian(THREE, { variant: 'ho_phap', scale: 1.04 });
  hpProc.position.set(0, 1.18, -0.1);
  hoPhapAltar.add(hpProc);
  const hpSign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 0.42),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('VI ĐÀ HỘ PHÁP TÔN THIÊN', {
        w: 780,
        h: 140,
        bg: '#4A1510',
        border: '#F5C85B',
        color: '#FFF6DC',
        size: 30
      })
    })
  );
  hpSign.position.set(0, 3.85, 0.2);
  hoPhapAltar.add(hpSign);
  g.add(hoPhapAltar);
  world.hoPhapPlaceholder = { altar: hoPhapAltar, parts: [hpProc] };
  world.interiorRectObstacles.push({ minX: -20.4, maxX: -17.3, minZ: 15.4, maxZ: 18.2 });

  // Bottom Edge Altar 1 (-7.2, 0, +18.6, facing -Z): TIÊU DIỆN ĐẠI SĨ BỒ TÁT
  const tieuDienAltar = new THREE.Group();
  tieuDienAltar.position.set(-7.2, 0, 18.6);
  tieuDienAltar.rotation.y = Math.PI;
  const tdPed = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.16, 1.5), crimsonWoodMat);
  tdPed.position.y = 0.58;
  tieuDienAltar.add(tdPed);
  const tdProc = createSculptedGuardian(THREE, { variant: 'tieu_dien', scale: 1.04 });
  tdProc.position.set(0, 1.18, -0.1);
  tieuDienAltar.add(tdProc);
  const tdSignBoard = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 0.42),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('TIÊU DIỆN ĐẠI SĨ BỒ TÁT', {
        w: 780,
        h: 140,
        bg: '#4A1510',
        border: '#F5C85B',
        color: '#FFF6DC',
        size: 30
      })
    })
  );
  tdSignBoard.position.set(0, 3.85, 0.2);
  tieuDienAltar.add(tdSignBoard);
  g.add(tieuDienAltar);
  world.tieuDienPlaceholder = { altar: tieuDienAltar, parts: [tdProc] };
  world.interiorRectObstacles.push({ minX: -8.6, maxX: -5.8, minZ: 17.6, maxZ: 20.4 });

  // Bottom Edge Altar 2 (+7.2, 0, +18.6, facing -Z): BÀN GHI SỔ VÀNG CÔNG ĐỨC & LỊCH SỬ CỔ TỰ (1849)
  const meritDesk = new THREE.Group();
  meritDesk.position.set(7.2, 0, 18.6);
  meritDesk.rotation.y = Math.PI;
  meritDesk.userData.shrineTitle = '📜 Bia Lịch Sử Cổ Tự Vĩnh Tràng (1849) & Bàn Ghi Công Đức';
  meritDesk.userData.shrineDesc = 'Chùa Vĩnh Tràng khởi dựng từ thế kỷ XIX tại Mỹ Tho, kết hợp tinh hoa kiến trúc Á – Âu với hành lang Hình Vuông ôm lấy Hồ Sen Bộ thanh tịnh giữa chùa.';
  const mdBody = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.96, 1.15), darkLacquerColMat);
  mdBody.position.y = 0.48;
  meritDesk.add(mdBody);
  const mdStele = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.85, 0.18), M.stoneDark);
  mdStele.position.set(0, 1.88, -0.32);
  meritDesk.add(mdStele);
  const mdSign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 0.42),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('BIA CỔ TỰ VĨNH TRÀNG (1849) · SỔ VÀNG CÔNG ĐỨC', {
        w: 880,
        h: 140,
        bg: '#4A1510',
        border: '#F5C85B',
        color: '#FFF6DC',
        size: 28
      })
    })
  );
  mdSign.position.set(0, 3.35, 0.2);
  meritDesk.add(mdSign);
  g.add(meritDesk);
  world.rightGalleryClickTargets.push(meritDesk);
  world.interiorRectObstacles.push({ minX: 5.7, maxX: 8.7, minZ: 17.8, maxZ: 20.4 });

  for (const bz of [-7.0, 0.0, 7.5]) {
    const bl = new THREE.PointLight(0xFFC875, 0.85, 11, 1.7);
    bl.position.set(bz, 5.2, 15.6);
    g.add(bl);
  }
}
