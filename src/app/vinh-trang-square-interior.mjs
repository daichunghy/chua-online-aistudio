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
 * Builds the unified Square ("Hình Vuông", 45.8m × 41.6m) interior of Chùa Vĩnh Tràng:
 * - Bottom-Right Corner Entrance (+15.5, +20.45) opening into a spacious East Reception Lounge & Dharma Bookcase Wing
 * - Enclosed Franco-Khmer East Wall (x = +25.0) with tall arched louvered shutter windows & dark timber wainscot
 * - Uncluttered Right Shrine Wall (x = +22.8): ONLY Nghìn Mắt Nghìn Tay (z = +2.0) & Chỗ Ngủ Của Phật (z = -6.5)
 * - Top Edge of Square = Chính Điện Đại Hùng Bửu Điện (z = -12.45 .. -20.8):
 *     Trống Bát Nhã (+2.95, -11.55) & Tháp Đèn Cầu An (-2.95, -11.65) right outside the main wooden door facing Hòn Non Bộ
 * - Center of Square = Hồ Sen Bộ (0, 0, 0) & Left/Bottom Galleries (18 La Hán, Tổ Đạt Ma, Hộ Pháp, Tiêu Diện)
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

  // Materials grounded in real Chùa Vĩnh Tràng photography:
  // Deep, muted antique timber, warm aged earth-ochre plaster, and dark umber-slate floor (NO sky-blue glare or dead-black crush!)
  const slateTileTex = makeLocalCanvasTex(
    THREE,
    (ctx, w, h) => {
      ctx.fillStyle = '#36261C';
      ctx.fillRect(0, 0, w, h);
      const step = w / 4;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const jitter = ((r * 7 + c * 11) % 11) - 5;
          const R = 74 + jitter;
          const G = 54 + Math.round(jitter * 0.7);
          const B = 41 + Math.round(jitter * 0.5);
          ctx.fillStyle = `rgb(${R}, ${G}, ${B})`;
          ctx.fillRect(c * step + 3, r * step + 3, step - 6, step - 6);
          ctx.strokeStyle = 'rgba(28, 17, 11, 0.55)';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(c * step + 3.5, r * step + 3.5, step - 7, step - 7);
        }
      }
    },
    512,
    512,
    30,
    24
  );
  const slateFloorMat = new THREE.MeshStandardMaterial({
    map: slateTileTex,
    roughness: 0.58,
    metalness: 0.02,
    envMapIntensity: 0.28
  });
  const gachTauMat = new THREE.MeshStandardMaterial({
    map: world.gachTauTex,
    color: 0xCF7F5C,
    roughness: 0.56,
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
      grad.addColorStop(0, '#6E533A');
      grad.addColorStop(0.55, '#7F6246');
      grad.addColorStop(1, '#5D442F');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 180; i++) {
        const px = ((i * 193) % w);
        const pw = 6 + (i % 18);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(48, 30, 16, 0.04)' : 'rgba(156, 122, 86, 0.035)';
        ctx.fillRect(px, 0, pw, h);
      }
      for (let j = 0; j < 900; j++) {
        const gx = (j * 269 + (j % 17) * 13) % w;
        const gy = (j * 419 + (j % 23) * 19) % h;
        ctx.fillStyle = j % 3 === 0 ? 'rgba(40, 24, 12, 0.06)' : 'rgba(148, 118, 84, 0.045)';
        ctx.fillRect(gx, gy, 3 + (j % 4), 2);
      }
    },
    512,
    512,
    3,
    1
  );
  const creamPlasterMat = new THREE.MeshStandardMaterial({
    map: agedWallTex,
    color: 0xFFFFFF,
    roughness: 0.82,
    metalness: 0.02,
    envMapIntensity: 0.22
  });
  const frenchOchreMat = new THREE.MeshStandardMaterial({
    color: 0xCFA042,
    roughness: 0.54,
    envMapIntensity: 0.25
  });
  const frenchCreamMat = new THREE.MeshStandardMaterial({
    color: 0xE5D5B5,
    roughness: 0.56,
    envMapIntensity: 0.24
  });
  const terraTrimMat = new THREE.MeshStandardMaterial({
    color: 0xA84B2A,
    roughness: 0.54,
    envMapIntensity: 0.24
  });
  const darkLacquerColMat = new THREE.MeshStandardMaterial({
    color: 0x5E2D16,
    map: world.woodGrainTex,
    roughness: 0.38,
    metalness: 0.05,
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
        ctx.strokeStyle = 'rgba(54, 26, 12, 0.35)';
        ctx.lineWidth = 1;
        for (let g = 1; g <= 3; g++) {
          ctx.beginPath();
          ctx.moveTo(i * pw + (pw * g) / 4, 0);
          ctx.lineTo(i * pw + (pw * g) / 4 + 2, h);
          ctx.stroke();
        }
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
    emissiveIntensity: 0.34,
    envMapIntensity: 0.28
  });
  const ceilingWoodMat = new THREE.MeshStandardMaterial({
    map: ceilingPlankTex,
    color: 0xFFFFFF,
    roughness: 0.62,
    emissive: 0x241207,
    emissiveIntensity: 0.36,
    envMapIntensity: 0.28
  });

  // 1. UNIFIED FLOOR: Main Square [-20.8, +20.8] + Spacious East Reception & Library Wing [+20.8, +25.0]
  const squareFloor = new THREE.Mesh(new THREE.PlaneGeometry(46.0, 41.6), slateFloorMat);
  squareFloor.rotation.x = -Math.PI / 2;
  squareFloor.position.set(2.1, 0, 0);
  squareFloor.receiveShadow = true;
  g.add(squareFloor);

  // Open-sky Center Courtyard terracotta paving ("Sân Thiên Tỉnh Hình Vuông" — 21.2m × 21.2m)
  const centerTerracotta = new THREE.Mesh(new THREE.PlaneGeometry(21.2, 21.2), gachTauMat);
  centerTerracotta.rotation.x = -Math.PI / 2;
  centerTerracotta.position.set(0, 0.016, 0);
  centerTerracotta.receiveShadow = true;
  g.add(centerTerracotta);

  // Subtle crimson lotus carpet runner along the Spacious East Arrival Corridor
  const carpetRunnerMat = new THREE.MeshStandardMaterial({
    color: 0x7C1D16,
    roughness: 0.82
  });
  const rightGalleryRunner = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 33.0), carpetRunnerMat);
  rightGalleryRunner.rotation.x = -Math.PI / 2;
  rightGalleryRunner.position.set(15.2, 0.014, 1.0);
  rightGalleryRunner.receiveShadow = true;
  g.add(rightGalleryRunner);

  // 2. OUTER PERIMETER WALLS (Main Square [-20.8..+25.0])
  // North Back Wall (z = -20.8) behind Chính Điện & East Wing
  const northWall = new THREE.Mesh(new THREE.BoxGeometry(46.2, 9.2, 0.48), wallWoodMat);
  northWall.position.set(2.1, 4.6, -20.8);
  northWall.receiveShadow = true;
  g.add(northWall);

  // West Wall (x = -20.8) behind 18 La Hán Gallery with deep dark timber wainscot & pilasters
  const westWall = registerCutaway(
    new THREE.Mesh(new THREE.BoxGeometry(0.48, 8.8, 41.8), creamPlasterMat)
  );
  westWall.position.set(-20.8, 4.4, 0);
  westWall.receiveShadow = true;
  g.add(westWall);
  const westWainscot = registerCutaway(
    new THREE.Mesh(new THREE.BoxGeometry(0.54, 1.85, 41.4), wallWoodMat)
  );
  westWainscot.position.set(-20.72, 0.92, 0);
  g.add(westWainscot);
  for (let pz = -18.0; pz <= 18.0; pz += 6.0) {
    const pilaster = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(0.24, 8.8, 0.34), wallWoodMat));
    pilaster.position.set(-20.52, 4.4, pz);
    g.add(pilaster);
  }

  // South Wall (z = +20.8) with Bottom-Right Corner Entrance Portal at x = +15.5
  const southWallLeft = registerCutaway(
    new THREE.Mesh(new THREE.BoxGeometry(34.2, 8.8, 0.48), creamPlasterMat)
  );
  southWallLeft.position.set(-3.7, 4.4, 20.8);
  g.add(southWallLeft);
  const southWallRightCorner = registerCutaway(
    new THREE.Mesh(new THREE.BoxGeometry(7.8, 8.8, 0.48), creamPlasterMat)
  );
  southWallRightCorner.position.set(21.35, 4.4, 20.8);
  g.add(southWallRightCorner);
  const southWainscotL = registerCutaway(
    new THREE.Mesh(new THREE.BoxGeometry(34.0, 1.85, 0.54), wallWoodMat)
  );
  southWainscotL.position.set(-3.7, 0.92, 20.72);
  g.add(southWainscotL);
  const southWainscotR = registerCutaway(
    new THREE.Mesh(new THREE.BoxGeometry(7.6, 1.85, 0.54), wallWoodMat)
  );
  southWainscotR.position.set(21.35, 0.92, 20.72);
  g.add(southWainscotR);
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

  // Authentic Enclosed Franco-Khmer East Perimeter Wall at x = +25.0 (replacing unrealistic open dining/monk beds)
  const farEastWall = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(0.48, 8.8, 41.8), creamPlasterMat));
  farEastWall.position.set(25.0, 4.4, 0);
  farEastWall.receiveShadow = true;
  g.add(farEastWall);
  const farEastWainscot = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(0.54, 1.85, 41.4), wallWoodMat));
  farEastWainscot.position.set(24.92, 0.92, 0);
  g.add(farEastWainscot);
  for (let pz = -18.0; pz <= 18.0; pz += 6.0) {
    const pilaster = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(0.24, 8.8, 0.34), wallWoodMat));
    pilaster.position.set(24.72, 4.4, pz);
    g.add(pilaster);
  }
  // 6 Tall Arched French-Colonial Louvered Green Shutter Windows along East Wall (letting soft garden light in)
  const shutterGreenMat = new THREE.MeshStandardMaterial({ color: 0x26543A, roughness: 0.55 });
  const daylightGlassMat = new THREE.MeshBasicMaterial({ color: 0xE8F3DF });
  for (const wz of [-15.0, -9.0, -3.0, 3.0, 9.0, 15.0]) {
    const winGrp = new THREE.Group();
    winGrp.position.set(24.72, 3.35, wz);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.75, 1.48), frenchCreamMat);
    winGrp.add(frame);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.38, 1.16), daylightGlassMat);
    winGrp.add(glass);
    const archTop = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.09, 8, 16, Math.PI), frenchOchreMat);
    archTop.rotation.y = Math.PI / 2;
    archTop.position.set(-0.04, 1.32, 0);
    winGrp.add(archTop);
    for (const sz of [-0.72, 0.72]) {
      const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.42, 0.54), shutterGreenMat);
      shutter.position.set(-0.22, 0, sz + (sz < 0 ? -0.18 : 0.18));
      shutter.rotation.y = sz < 0 ? -0.45 : 0.45;
      winGrp.add(shutter);
    }
    registerCutaway(winGrp);
    g.add(winGrp);
  }

  // Solid perimeter wall obstacles (East wall cleanly at x = 25.0)
  world.interiorRectObstacles.push(
    { minX: -21.2, maxX: 25.4, minZ: -21.2, maxZ: -20.3 },
    { minX: -21.2, maxX: -20.3, minZ: -21.2, maxZ: 21.2 },
    { minX: -21.2, maxX: 13.4, minZ: 20.3, maxZ: 21.2 },
    { minX: 17.6, maxX: 25.4, minZ: 20.3, maxZ: 21.2 },
    { minX: 24.6, maxX: 25.4, minZ: -21.2, maxZ: 21.2 }
  );

  // 3. COVERED ROOF CEILINGS & TRADITIONAL WOODEN RAFTERS AROUND ALL GALLERY WINGS
  const roofSlabs = [
    { w: 45.8, d: 10.4, x: 2.1, z: -15.6 },
    { w: 45.8, d: 10.4, x: 2.1, z: 15.6 },
    { w: 10.4, d: 21.2, x: -15.6, z: 0 },
    { w: 14.4, d: 21.2, x: 17.8, z: 0 }
  ];
  for (const rs of roofSlabs) {
    const ceil = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(rs.w, 0.28, rs.d), ceilingWoodMat));
    ceil.position.set(rs.x, 8.85, rs.z);
    g.add(ceil);
  }
  for (let z = -19.5; z <= 19.5; z += 3.25) {
    if (Math.abs(z) > 10.5) {
      const beam = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(45.4, 0.24, 0.24), rafterMat));
      beam.position.set(2.1, 8.55, z);
      g.add(beam);
    } else {
      const westBeam = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.24, 0.22), rafterMat));
      westBeam.position.set(-15.6, 8.55, z);
      g.add(westBeam);
      const eastBeam = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(14.0, 0.24, 0.22), rafterMat));
      eastBeam.position.set(17.8, 8.55, z);
      g.add(eastBeam);
    }
  }
  // Longitudinal purlins ("Đòn tay") running North-South along the ceiling
  for (const px of [-17.5, -14.0, 14.0, 18.2, 22.4]) {
    const purlin = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 41.0), rafterMat));
    purlin.position.set(px, 8.34, 0);
    g.add(purlin);
  }

  // Structural dark-lacquer heritage columns lining the interior corridors
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

  // Helper to build a realistic Vietnamese Temple Shoe Rack + Sandals/Slippers left outside doors
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
          sole.rotation.y = (p % 2 === 0 ? 0.05 : -0.05);
          rg.add(sole);
          const strap = new THREE.Mesh(new THREE.BoxGeometry(0.088, 0.026, 0.07), frameWood);
          strap.position.set(px + foot, sy + 0.046, 0.02);
          rg.add(strap);
        }
      }
    }
    // Neat extra slippers left on woven coir mat right beside/in front of rack
    const matMesh = new THREE.Mesh(new THREE.BoxGeometry(rackW * 0.92, 0.018, 0.52), coirMat);
    matMesh.position.set(0, 0.009, 0.48);
    rg.add(matMesh);
    for (let s = 0; s < 3; s++) {
      const sx = -0.42 + s * 0.42;
      const slipMat = new THREE.MeshStandardMaterial({ color: sandalColors[(s + 2) % sandalColors.length], roughness: 0.7 });
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

  // 4. ENTRANCE DOORWAY WITH OUTER SUNLIT SHOE-REMOVAL VERANDA (+15.5, 0, +20.45)
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

  // Traditional wooden threshold sill ("Ngưỡng cửa gỗ") + open double carved wooden door leaves
  const entrySill = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.09, 0.28), wallWoodMat);
  entrySill.position.set(0, 0.045, 0);
  cornerDoorGroup.add(entrySill);
  for (const side of [-1, 1]) {
    const leafPivot = new THREE.Group();
    leafPivot.position.set(side * 1.65, 0, -0.05);
    leafPivot.rotation.y = side * -1.12; // Swung wide open inward/outward cleanly
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

  // Sunlit Outer Tiled Veranda visible right outside the open wooden entrance door (with shoe racks & sandals left outside!)
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

  const outerVerandaLight = new THREE.PointLight(0xFFF1C9, 1.45, 8.5, 1.5);
  outerVerandaLight.position.set(0, 3.4, 1.5);
  cornerDoorGroup.add(outerVerandaLight);

  for (const rx of [-1.25, 1.25]) {
    const outerRack = buildShoeRackUnit(1.35, 3);
    outerRack.position.set(rx, 0.02, 1.18);
    outerRack.rotation.y = rx < 0 ? 0.35 : -0.35;
    cornerDoorGroup.add(outerRack);
  }
  const shoeNoticeOuter = new THREE.Mesh(
    new THREE.PlaneGeometry(2.65, 0.44),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('👟 VUI LÒNG ĐỂ GIÀY DÉP BÊN NGOÀI TRƯỚC KHI VÀO ĐIỆN', {
        w: 980,
        h: 150,
        bg: '#5B1810',
        border: '#F3C654',
        color: '#FFF6DE',
        size: 28
      }),
      side: THREE.DoubleSide
    })
  );
  shoeNoticeOuter.rotation.y = Math.PI;
  shoeNoticeOuter.position.set(0, 3.58, 0.62);
  cornerDoorGroup.add(shoeNoticeOuter);

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
  world.interiorDoorClickTargets.push(exitHitbox, outerGardenBackdrop, exitSign);

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

  // 6. SPACIOUS EAST ARRIVAL CORRIDOR & RECEPTION WING (FEWER, WELL-SPACED SHRINES + PROPER SEATING)
  // Pilgrim enters at (+15.5, +20.45) into an open, airy reception & corridor with carved rosewood seating and bookcases.
  // Only 2 iconic shrines sit deeply against the East wall (x = 22.8) well to the North (z = +2.0 & z = -6.5).
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

  // Shrine 1 (x = 22.8, z = +2.0): TƯỢNG PHẬT NGHÌN MẮT NGHÌN TAY (spaced well north of entrance!)
  const nghinMatGroup = new THREE.Group();
  nghinMatGroup.position.set(22.8, 0, 2.0);
  nghinMatGroup.rotation.y = -Math.PI / 2; // Local +Z points West (-X) directly toward corridor!
  const nmAltar = buildSideGalleryAltarBase(3.4, 1.45, 1.06);
  nghinMatGroup.add(nmAltar);

  for (const fx of [-1.62, 1.62]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 3.85, 10), baoLamMat);
    post.position.set(fx, 2.95, -0.68);
    nghinMatGroup.add(post);
  }
  const nmTopArch = new THREE.Mesh(new THREE.BoxGeometry(3.45, 0.24, 0.18), goldLeafMat);
  nmTopArch.position.set(0, 4.85, -0.68);
  nghinMatGroup.add(nmTopArch);
  const nmLowRail = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.38, 0.14), baoLamMat);
  nmLowRail.position.set(0, 1.25, -0.68);
  nghinMatGroup.add(nmLowRail);
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
  nmCushion.position.set(20.2, 0, 2.0);
  g.add(nmCushion);
  world.interiorRectObstacles.push({ minX: 21.85, maxX: 24.15, minZ: 0.15, maxZ: 3.85 });

  // Shrine 2 (x = 22.8, z = -6.5): CHỖ NGỦ CỦA PHẬT (Đức Phật Nhập Niết Bàn · Giường Long Sàng Sơn Son Thếp Vàng)
  const choNguGroup = new THREE.Group();
  choNguGroup.position.set(22.8, 0, -6.5);
  choNguGroup.rotation.y = -Math.PI / 2;
  const sleepingShrine = createIndoorSleepingBuddhaBed(THREE, { scale: 1.0 });
  choNguGroup.add(sleepingShrine);

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
  cnCushion.position.set(20.1, 0, -6.5);
  g.add(cnCushion);
  world.interiorRectObstacles.push({ minX: 21.55, maxX: 24.25, minZ: -8.35, maxZ: -4.65 });

  // Warm ambient gallery lanterns along the Spacious East Corridor
  for (const lz of [17.2, 11.2, 4.0, -3.5, -10.0]) {
    const pl = new THREE.PointLight(0xFFC978, 2.8, 15, 1.05);
    pl.position.set(16.8, 5.4, lz);
    g.add(pl);
  }

  // 7. AUTHENTIC EAST RECEPTION PARLOR, DHARMA BOOKCASES & PROPER CARVED WOODEN SEATING
  //    ("Phòng Tiếp Khách · Tủ Kinh Sách Vĩnh Tràng" + Bộ Bàn Ghế Trường Kỷ & Băng Ghế Hành Lang)
  const tdGroup = new THREE.Group();
  tdGroup.position.set(0, 0, 0);
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
  const ceramicBowlMat = new THREE.MeshStandardMaterial({
    color: 0xEAE2D2,
    roughness: 0.3,
    envMapIntensity: 0.32
  });
  const cushionFabricMat = new THREE.MeshStandardMaterial({
    color: 0x8F2B20,
    roughness: 0.78
  });

  // Helper: Carved Rosewood Long Bench ("Băng Ghế Gỗ Trường Kỷ Có Tựa Lưng")
  const buildCarvedBench = (px, pz, rotY = 0, w = 2.25, registerObs = true) => {
    const bg = new THREE.Group();
    bg.position.set(px, 0, pz);
    bg.rotation.y = rotY;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(w, 0.09, 0.66), polishedSlabWoodMat);
    seat.position.set(0, 0.45, 0);
    seat.castShadow = true;
    seat.receiveShadow = true;
    bg.add(seat);
    const backFrame = new THREE.Mesh(new THREE.BoxGeometry(w - 0.08, 0.62, 0.08), darkTimberMat);
    backFrame.position.set(0, 0.78, -0.29);
    backFrame.castShadow = true;
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

  // Helper: Formal Vietnamese Reception Salon Set ("Bộ Bàn Ghế Trường Kỷ Tiếp Khách & Bàn Trà")
  const buildReceptionSalon = (px, pz, rotY = -Math.PI / 2) => {
    const sg = new THREE.Group();
    sg.position.set(px, 0, pz);
    sg.rotation.y = rotY;

    // Central carved tea table
    const tblTop = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.08, 0.86), polishedSlabWoodMat);
    tblTop.position.set(0, 0.64, 0);
    tblTop.castShadow = true;
    sg.add(tblTop);
    for (const lx of [-0.58, 0.58]) {
      for (const lz of [-0.34, 0.34]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.62, 0.08), darkTimberMat);
        leg.position.set(lx, 0.31, lz);
        sg.add(leg);
      }
    }
    // Porcelain teapot + lotus teacup tray on table
    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.03, 0.32), darkTimberMat);
    tray.position.set(0, 0.695, 0);
    sg.add(tray);
    const teapot = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.09, 0.14, 12), ceramicBowlMat);
    teapot.position.set(-0.08, 0.77, 0);
    sg.add(teapot);
    for (const [cx, cz] of [[0.08, -0.07], [0.08, 0.07], [0.17, 0]]) {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.05, 10), ceramicBowlMat);
      cup.position.set(cx, 0.735, cz);
      sg.add(cup);
    }

    // Main Trường Kỷ bench behind table + 2 flanking armchairs
    const sofaSeat = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.09, 0.66), polishedSlabWoodMat);
    sofaSeat.position.set(0, 0.45, -1.02);
    sg.add(sofaSeat);
    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.06, 0.68, 0.09), darkTimberMat);
    sofaBack.position.set(0, 0.82, -1.32);
    sg.add(sofaBack);
    for (const ax of [-0.98, 0.98]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.32, 0.66), darkTimberMat);
      arm.position.set(ax, 0.64, -1.02);
      sg.add(arm);
      for (const lz of [-1.28, -0.74]) {
        const sLeg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.44, 0.08), darkTimberMat);
        sLeg.position.set(ax, 0.22, lz);
        sg.add(sLeg);
      }
    }
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
      for (const lx of [-0.26, 0.26]) {
        for (const lz of [-0.24, 0.24]) {
          const cLeg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.44, 0.07), darkTimberMat);
          cLeg.position.set(cx + lx, 0.22, lz);
          sg.add(cLeg);
        }
      }
    }

    tdGroup.add(sg);
    world.interiorRectObstacles.push({ minX: px - 1.55, maxX: px + 1.55, minZ: pz - 1.65, maxZ: pz + 1.65 });
  };

  // Helper: Tall Glass-Fronted Dharma Sutra Bookcase ("Tủ Kinh Sách Chùa Vĩnh Tràng")
  const buildDharmaBookcase = (px, pz) => {
    const bk = new THREE.Group();
    bk.position.set(px, 0, pz);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.68, 2.75, 2.1), darkTimberMat);
    frame.position.set(0, 1.38, 0);
    frame.castShadow = true;
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

  // Place 2 tall Dharma Bookcases cleanly against the East Wall (x = 24.15)
  buildDharmaBookcase(24.15, 15.8);
  buildDharmaBookcase(24.15, 11.4);

  // Place 2 dignified Reception Salon Sets ("Bộ Bàn Ghế Trường Kỷ Tiếp Khách") in the Spacious East Lounge
  buildReceptionSalon(21.0, 15.4, -Math.PI / 2);
  buildReceptionSalon(21.0, 9.8, -Math.PI / 2);

  // Add proper Corridor Resting Benches ("Băng Ghế Gỗ Có Tựa Lưng") matching real arched veranda corridors!
  buildCarvedBench(12.6, 14.8, Math.PI / 2, 2.25, true);  // East arrival corridor facing East lounge
  buildCarvedBench(12.6, 2.0, Math.PI / 2, 2.25, true);   // Facing Nghìn Mắt Nghìn Tay across wide aisle
  buildCarvedBench(12.6, -6.5, Math.PI / 2, 2.25, true);  // Facing Chỗ Ngủ Của Phật across wide aisle
  buildCarvedBench(-3.2, 13.0, Math.PI, 2.35, true);      // South gallery facing Hồ Sen Bộ
  buildCarvedBench(3.2, 13.0, Math.PI, 2.35, true);       // South gallery facing Hồ Sen Bộ

  // Reception Parlor Plaque mounted cleanly on the East Wall above the Dharma Bookcases
  const tdSign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 0.52),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('PHÒNG TIẾP KHÁCH · TỦ KINH SÁCH VĨNH TRÀNG', {
        w: 980,
        h: 150,
        bg: '#3B1D0F',
        border: '#E5B24C',
        color: '#FFECC7',
        size: 30
      }),
      side: THREE.DoubleSide
    })
  );
  tdSign.rotation.y = -Math.PI / 2;
  tdSign.position.set(24.68, 4.15, 13.6);
  tdGroup.add(tdSign);

  // Warm overhead lighting in the East Reception & Bookcase Lounge
  for (const lz of [15.4, 9.8]) {
    const tdWarmLight = new THREE.PointLight(0xFFD28E, 3.0, 14, 1.05);
    tdWarmLight.position.set(21.0, 5.2, lz);
    tdGroup.add(tdWarmLight);
  }

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
  // 8. TOP EDGE OF THE SQUARE (z = -12.45 .. -20.8): CHÍNH ĐIỆN (ĐẠI HÙNG BỬU ĐIỆN)
  // =========================================================================================

  // 8A. Full Traditional Carved Wooden Front Door Facade ("Hệ Cửa Gỗ Bức Bàn Tam Môn Trước Chánh Điện" + Bỏ Giày Dép Bên Ngoài)
  // Placed at z = -12.45 with Trống Bát Nhã & Tháp Đèn Cầu An flanking the central door facing Hòn Non Bộ!
  const partitionGroup = new THREE.Group();
  partitionGroup.position.set(0, 0, -12.45);

  const doorTeakMat = new THREE.MeshStandardMaterial({
    color: 0x7A411F,
    emissive: 0x221005,
    roughness: 0.46,
    metalness: 0.08
  });
  const doorCarvedReliefMat = new THREE.MeshStandardMaterial({
    color: 0xA65E2E,
    emissive: 0x2B1406,
    roughness: 0.4,
    metalness: 0.14
  });

  const upperHeaderWall = new THREE.Mesh(new THREE.BoxGeometry(25.2, 4.45, 0.24), doorTeakMat);
  upperHeaderWall.position.set(0, 6.62, -0.04);
  partitionGroup.add(upperHeaderWall);

  const transomBeam = new THREE.Mesh(new THREE.BoxGeometry(24.6, 1.15, 0.28), doorCarvedReliefMat);
  transomBeam.position.set(0, 4.82, 0.04);
  partitionGroup.add(transomBeam);

  const goldFriezeLine = new THREE.Mesh(new THREE.BoxGeometry(24.8, 0.14, 0.32), goldLeafMat);
  goldFriezeLine.position.set(0, 4.24, 0.06);
  partitionGroup.add(goldFriezeLine);

  for (const sx of [-10.3, 10.3]) {
    const sidePanelWall = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.35, 0.22), doorTeakMat);
    sidePanelWall.position.set(sx, 2.18, 0);
    partitionGroup.add(sidePanelWall);
    const sideRelief = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.2, 0.26), doorCarvedReliefMat);
    sideRelief.position.set(sx, 2.45, 0.04);
    partitionGroup.add(sideRelief);
    world.interiorRectObstacles.push({ minX: sx - 2.1, maxX: sx + 2.1, minZ: -12.65, maxZ: -12.25 });
  }
  for (const mx of [-3.05, 3.05]) {
    const midWall = new THREE.Mesh(new THREE.BoxGeometry(2.1, 4.35, 0.22), doorTeakMat);
    midWall.position.set(mx, 2.18, 0);
    partitionGroup.add(midWall);
    const midWindowFrame = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.85, 0.26), doorCarvedReliefMat);
    midWindowFrame.position.set(mx, 2.55, 0.04);
    partitionGroup.add(midWindowFrame);
    for (let b = -2; b <= 2; b++) {
      const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 1.65, 8), goldLeafMat);
      spindle.position.set(mx + b * 0.24, 2.55, 0.08);
      partitionGroup.add(spindle);
    }
    world.interiorRectObstacles.push({ minX: mx - 1.05, maxX: mx + 1.05, minZ: -12.65, maxZ: -12.25 });
  }

  const hoanhPhi = new THREE.Mesh(
    new THREE.BoxGeometry(4.15, 1.08, 0.16),
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
  hoanhPhi.position.set(0, 5.38, 0.28);
  hoanhPhi.rotation.x = 0.22;
  partitionGroup.add(hoanhPhi);

  const doorBays = [
    { cx: -5.9, width: 3.1 },
    { cx: 0, width: 3.5 },
    { cx: 5.9, width: 3.1 }
  ];
  for (const bay of doorBays) {
    const sill = new THREE.Mesh(new THREE.BoxGeometry(bay.width + 0.2, 0.1, 0.3), doorTeakMat);
    sill.position.set(bay.cx, 0.05, 0);
    partitionGroup.add(sill);

    for (const side of [-1, 1]) {
      const jx = bay.cx + side * (bay.width / 2 + 0.12);
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.26, 4.4, 0.32), doorTeakMat);
      post.position.set(jx, 2.2, 0);
      partitionGroup.add(post);
      world.interiorObstacles.push({ x: jx, z: -12.45, r: 0.24 });

      const leafW = bay.width * 0.44;
      const leafPivot = new THREE.Group();
      leafPivot.position.set(jx - side * 0.08, 0.08, 0.14);
      leafPivot.rotation.y = side * -1.05;
      const lowerPanel = new THREE.Mesh(new THREE.BoxGeometry(leafW, 1.55, 0.08), doorTeakMat);
      lowerPanel.position.set(-side * (leafW / 2), 0.78, 0);
      leafPivot.add(lowerPanel);
      const carvedInset = new THREE.Mesh(new THREE.BoxGeometry(leafW * 0.78, 1.15, 0.1), doorCarvedReliefMat);
      carvedInset.position.set(-side * (leafW / 2), 0.78, 0);
      leafPivot.add(carvedInset);
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(leafW, 0.22, 0.08), doorTeakMat);
      topRail.position.set(-side * (leafW / 2), 3.92, 0);
      leafPivot.add(topRail);
      const midRail = new THREE.Mesh(new THREE.BoxGeometry(leafW, 0.18, 0.08), doorTeakMat);
      midRail.position.set(-side * (leafW / 2), 1.62, 0);
      leafPivot.add(midRail);
      for (const edge of [-1, 1]) {
        const stile = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.08), doorTeakMat);
        stile.position.set(-side * (leafW / 2) + edge * (leafW / 2 - 0.06), 2.78, 0);
        leafPivot.add(stile);
      }
      for (let sb = -2; sb <= 2; sb++) {
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.18, 8), goldLeafMat);
        bar.position.set(-side * (leafW / 2) + sb * (leafW * 0.16), 2.78, 0);
        leafPivot.add(bar);
      }
      partitionGroup.add(leafPivot);
    }
  }

  // Outer Shoe-Removal Racks tucked cleanly beside the side doors/piers (keeping central ±3m clear for Tháp Đèn & Trống Bát Nhã!)
  if (typeof world._buildShoeRackUnit === 'function') {
    for (const rx of [-9.55, 9.55]) {
      const rack = world._buildShoeRackUnit(1.55, 3);
      rack.position.set(rx, 0, 0.68);
      partitionGroup.add(rack);
    }
  }
  const chanhDienShoeSign = new THREE.Mesh(
    new THREE.BoxGeometry(3.35, 0.42, 0.08),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('👟 BỎ GIÀY DÉP BÊN NGOÀI CỬA TRƯỚC KHI VÀO CHÁNH ĐIỆN', {
        w: 1080,
        h: 150,
        bg: '#4E160F',
        border: '#F3C654',
        color: '#FFF6DE',
        size: 28
      })
    })
  );
  chanhDienShoeSign.position.set(0, 4.02, 0.24);
  partitionGroup.add(chanhDienShoeSign);

  const couplets = [
    [-1.92, 'PHẬT NHẬT TĂNG HUY'],
    [1.92, 'PHÁP LUÂN THƯỜNG CHUYỂN']
  ];
  for (const [cx, text] of couplets) {
    const cp = new THREE.Mesh(
      new THREE.PlaneGeometry(0.32, 3.6),
      new THREE.MeshBasicMaterial({ map: world.makeVerticalCalligraphyTex(text) })
    );
    cp.position.set(cx, 2.45, 0.22);
    partitionGroup.add(cp);
  }
  ctx.registerCutaway(upperHeaderWall);
  g.add(partitionGroup);

  // 8B. THÁP ĐÈN CẦU AN / VẠN PHẬT ("Ghi Tên Cầu Phước" — image_d3dcebc6.png)
  // Positioned on the LEFT side right beside the main wooden door facing Hòn Non Bộ (-2.95, 0, -11.65)
  const btGroup = new THREE.Group();
  btGroup.position.set(-2.95, 0, -11.65);
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
  world.interiorObstacles.push({ x: -2.95, z: -11.65, r: 0.72 });

  // 8B-2. TRỐNG BÁT NHÃ (+2.95, 0, -11.55) RIGHT BESIDE THE CHÁNH ĐIỆN DOOR FACING HÒN NON BỘ (+Z)!
  const drumGroup = new THREE.Group();
  drumGroup.position.set(2.95, 0, -11.55);
  for (const dx of [-0.66, 0.66]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.105, 1.72, 10), crimsonWoodMat);
    post.position.set(dx, 0.86, 0);
    drumGroup.add(post);
  }
  const drumBaseBar = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.14, 0.56), crimsonWoodMat);
  drumBaseBar.position.set(0, 0.07, 0);
  drumGroup.add(drumBaseBar);
  const drumPlaceholder = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 1.12, 20), crimsonWoodMat);
  drumPlaceholder.rotation.x = Math.PI / 2; // Drumhead faces +Z directly toward Hòn Non Bộ!
  drumPlaceholder.position.set(0, 1.56, 0);
  const drumHeadFront = new THREE.Mesh(
    new THREE.CircleGeometry(0.52, 20),
    new THREE.MeshStandardMaterial({ color: 0xEAD4AA, roughness: 0.65 })
  );
  drumHeadFront.rotation.x = -Math.PI / 2;
  drumHeadFront.position.set(0, 0.565, 0);
  drumPlaceholder.add(drumHeadFront);
  drumGroup.add(drumPlaceholder);
  const drumSign = new THREE.Mesh(
    new THREE.BoxGeometry(1.62, 0.34, 0.08),
    new THREE.MeshBasicMaterial({
      map: world.makeSignTexture('🥁 TRỐNG BÁT NHÃ · ĐỐI DIỆN NON BỘ', {
        w: 720,
        h: 140,
        bg: '#5B180E',
        border: '#FFD269',
        color: '#FFF6DE',
        size: 27
      })
    })
  );
  drumSign.position.set(0, 2.52, 0.1);
  drumGroup.add(drumSign);
  g.add(drumGroup);
  world.interiorDrumAnchor = { group: drumGroup, placeholder: drumPlaceholder };
  world.interiorDrumClickTargets.push(drumGroup);
  world.interiorObstacles.push({ x: 2.95, z: -11.55, r: 0.86 });

  // 8C. PAIR OF COILED-DRAGON LONG TRỤ (±4.6, 0, -15.2), GILDED BAO LAM & 4 SPIRAL INCENSE COILS
  for (const sideSign of [-1, 1]) {
    const lx = sideSign * 4.6;
    const lz = -15.2;
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

  const baoLamBeam = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.96, 0.22), goldLeafMat);
  baoLamBeam.position.set(0, 6.25, -15.2);
  g.add(baoLamBeam);
  for (const sx of [-3.9, 3.9]) {
    const dropScroll = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.85, 0.16), goldLeafMat);
    dropScroll.position.set(sx, 5.15, -15.2);
    g.add(dropScroll);
  }

  for (const [ix, iz] of [[-2.8, -13.8], [2.8, -13.8], [-5.6, -15.8], [5.6, -15.8]]) {
    const anc = new THREE.Group();
    anc.position.set(ix, 6.85, iz);
    const spiral = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.72, 16, 1, true), bronzePatinaMat);
    spiral.position.y = -0.36;
    anc.add(spiral);
    g.add(anc);
    world.spiralIncenseAnchors.push(anc);
  }

  // 8D. ĐẠI HỒNG CHUNG (+6.8, 0, -14.4), CHUÔNG GIA TRÌ (+2.65, 0, -15.2) & MÕ GỖ (-2.65, 0, -15.2)
  const bellGroup = new THREE.Group();
  bellGroup.position.set(6.8, 0, -14.4);
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
  world.interiorObstacles.push({ x: 6.8, z: -14.4, r: 0.92 });

  const giaTriStand = new THREE.Group();
  giaTriStand.position.set(2.65, 0, -15.2);
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
  world.interiorObstacles.push({ x: 2.65, z: -15.2, r: 0.52 });

  const moStand = new THREE.Group();
  moStand.position.set(-2.65, 0, -15.2);
  const moPed = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.68, 0.68), crimsonWoodMat);
  moPed.position.y = 0.34;
  moStand.add(moPed);
  const moBody = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 12), crimsonWoodMat);
  moBody.scale.set(1.18, 0.88, 1.05);
  moBody.position.y = 0.88;
  moStand.add(moBody);
  g.add(moStand);
  world.interiorDrumClickTargets.push(moStand);
  world.interiorObstacles.push({ x: -2.65, z: -15.2, r: 0.52 });

  for (const bx of [-1.28, 0, 1.28]) {
    const cush = world.makeKneelingCushion();
    cush.position.set(bx, 0, -14.6);
    g.add(cush);
  }

  // 8E. CENTRAL TAM BẢO SANCTUARY ALTAR (0, 0, -18.3)
  const tamBaoGroup = new THREE.Group();
  tamBaoGroup.position.set(0, 0, -18.3);
  world.tamBaoAltarGroup = tamBaoGroup;

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
  standingPatriarch.rotation.y = Math.PI * 0.82;
  tamBaoGroup.add(standingPatriarch);

  const craneTortoiseAnchor = new THREE.Group();
  craneTortoiseAnchor.position.set(0, 1.4, 0.95);
  tamBaoGroup.add(craneTortoiseAnchor);
  world.craneTortoiseAnchor = craneTortoiseAnchor;

  const sanctLightMain = new THREE.PointLight(0xFFC266, 1.95, 15, 1.45);
  sanctLightMain.position.set(0, 5.8, 2.4);
  tamBaoGroup.add(sanctLightMain);
  const sanctLightHalo = new THREE.PointLight(0xFFB347, 1.25, 10, 1.6);
  sanctLightHalo.position.set(0, 4.8, -0.6);
  tamBaoGroup.add(sanctLightHalo);

  g.add(tamBaoGroup);
  world.interiorRectObstacles.push({ minX: -4.55, maxX: 4.55, minZ: -20.5, maxZ: -16.45 });

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

  // Bottom Edge Altar 2 (+4.2, 0, +18.8, facing -Z): BÀN GHI SỔ VÀNG CÔNG ĐỨC & LỊCH SỬ CỔ TỰ (1849) — shifted West so right-corner entry stays wide open
  const meritDesk = new THREE.Group();
  meritDesk.position.set(4.2, 0, 18.8);
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
  world.interiorRectObstacles.push({ minX: 2.7, maxX: 5.7, minZ: 17.8, maxZ: 20.4 });

  for (const bz of [-7.0, 0.0, 7.5]) {
    const bl = new THREE.PointLight(0xFFC875, 0.85, 11, 1.7);
    bl.position.set(bz, 5.2, 15.6);
    g.add(bl);
  }
}
