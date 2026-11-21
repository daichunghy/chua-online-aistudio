/**
 * Bầu trời, núi, đường phố, nhà dân Mekong, cổng chùa mặt tiền (một method rất dài).
 *
 * Mixin của VinhTrang3DWorld: 1 method (buildSkyDomeAndMountains … buildSkyDomeAndMountains).
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, makeTextTex } from './shared.mjs';

export const exteriorTownMethods = {
  buildSkyDomeAndMountains() {
    // Morning Pilgrimage Sky (7:30 AM Mỹ Tho / Mekong Delta — golden-mist horizon fading to clear cerulean)
    const skyTex = this._buildSkyTextureForPreset('morning');
    const skyDome = new THREE.Mesh(
      new THREE.SphereGeometry(360, 36, 20),
      new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })
    );
    this.skyDome = skyDome;
    this.scene.add(skyDome);

    const M = this.MAT;
    const extGround = new THREE.Mesh(
      new THREE.PlaneGeometry(560, 560),
      new THREE.MeshStandardMaterial({ map: this.mekongEarthTex, color: 0xffffff, roughness: 0.96 })
    );
    extGround.rotation.x = -Math.PI / 2;
    extGround.position.set(0, -0.09, 55);
    extGround.receiveShadow = true;
    this.exteriorGroup.add(extGround);

    // Rustic Mekong Delta Country Houses ("Nhà cấp 4 mái tôn miền Tây" — veranda columns, bạt che nắng & lu nước mưa)
    const tinRoofColors = [0x336791, 0x924438, 0x7F8891, 0x2F7064];
    const roofMaterials = tinRoofColors.map(
      (col) => new THREE.MeshStandardMaterial({ map: this.tinRoofTex, color: col, roughness: 0.56, metalness: 0.22 })
    );
    const wallPalette = [0xEFE4CC, 0xDCE6E8, 0xF0DEC4, 0xE1E5D2, 0xEADBC4];
    const woodPostMat = new THREE.MeshStandardMaterial({ map: this.woodGrainTex, color: 0x6A482E, roughness: 0.78 });
    const shutterMat = new THREE.MeshStandardMaterial({ color: 0x2E624A, roughness: 0.68 });
    const zincMat = new THREE.MeshStandardMaterial({ color: 0xC2C8CE, roughness: 0.42, metalness: 0.48 });

    const awningCanvas = document.createElement('canvas');
    awningCanvas.width = 128;
    awningCanvas.height = 64;
    const actx = awningCanvas.getContext('2d');
    for (let x = 0; x < 128; x += 16) {
      actx.fillStyle = (x / 16) % 2 === 0 ? '#2C639E' : '#F4EEE0';
      actx.fillRect(x, 0, 16, 64);
    }
    const stripedAwningTex = new THREE.CanvasTexture(awningCanvas);
    stripedAwningTex.colorSpace = THREE.SRGBColorSpace;
    const stripedAwningMat = new THREE.MeshStandardMaterial({ map: stripedAwningTex, roughness: 0.68, side: THREE.DoubleSide });

    const addMekongCountryHouse = (hx, hz, w, d, h, rotY = 0, wallIdx = 0, roofIdx = 0, hasAwning = true) => {
      const hg = new THREE.Group();
      const wallColor = wallPalette[wallIdx % wallPalette.length];
      const wallMat = new THREE.MeshStandardMaterial({ map: this.limeWallTex, color: wallColor, roughness: 0.84 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
      body.position.y = h / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      hg.add(body);

      // Veranda tiled plinth + wooden porch columns (hàng hiên nhà miền Tây)
      const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.3, 0.22, d + 1.5),
        new THREE.MeshStandardMaterial({ color: 0x9C6B50, roughness: 0.82 })
      );
      plinth.position.set(0, 0.11, 0.7);
      hg.add(plinth);

      for (const cx of [-w * 0.44, 0, w * 0.44]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.095, 2.85, 8), woodPostMat);
        col.position.set(cx, 1.48, d / 2 + 1.2);
        hg.add(col);
      }

      // Shuttered double door + flanking louvered windows
      const door = new THREE.Mesh(new THREE.BoxGeometry(1.45, 2.15, 0.09), woodPostMat);
      door.position.set(0, 1.24, d / 2 + 0.04);
      hg.add(door);
      for (const wx of [-w * 0.3, w * 0.3]) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.05, 0.09), shutterMat);
        win.position.set(wx, 1.65, d / 2 + 0.04);
        hg.add(win);
      }

      // True 2-slope pitched corrugated tin roof ("mái tôn 2 mái nhà cấp 4 miền Tây") + gable triangles + porch lean-to
      const rMat = roofMaterials[roofIdx % roofMaterials.length];
      const roofPeakH = 1.45;
      const slopeHalfD = (d + 1.0) * 0.52;
      const slopeAngle = Math.atan2(roofPeakH, d * 0.5);
      const slopeLen = Math.hypot(roofPeakH, slopeHalfD);
      for (const side of [-1, 1]) {
        const slope = new THREE.Mesh(new THREE.BoxGeometry(w + 1.1, 0.08, slopeLen), rMat);
        slope.position.set(0, h + roofPeakH * 0.5, side * slopeHalfD * 0.5);
        slope.rotation.x = side * slopeAngle;
        slope.castShadow = true;
        hg.add(slope);
      }
      // Gable triangular end walls
      const gableShape = new THREE.Shape();
      gableShape.moveTo(-d * 0.5, 0);
      gableShape.lineTo(0, roofPeakH);
      gableShape.lineTo(d * 0.5, 0);
      gableShape.closePath();
      const gableGeom = new THREE.ShapeGeometry(gableShape);
      for (const side of [-1, 1]) {
        const gable = new THREE.Mesh(gableGeom, wallMat);
        gable.position.set(side * (w * 0.5 - 0.01), h, 0);
        gable.rotation.y = side * (Math.PI / 2);
        hg.add(gable);
      }

      const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.7, 0.08, 1.6), rMat);
      porchRoof.position.set(0, 2.9, d / 2 + 0.72);
      porchRoof.rotation.x = 0.2;
      hg.add(porchRoof);

      const ridge = new THREE.Mesh(new THREE.BoxGeometry(w + 1.14, 0.1, 0.24), zincMat);
      ridge.position.y = h + roofPeakH;
      hg.add(ridge);

      if (hasAwning) {
        const bat = new THREE.Mesh(new THREE.BoxGeometry(w + 0.35, 0.05, 1.75), stripedAwningMat);
        bat.position.set(0, 2.52, d / 2 + 1.45);
        bat.rotation.x = 0.34;
        hg.add(bat);
      }

      // Terracotta rainwater jar ("Lu nước mưa miền Tây") tucked by porch corner
      for (const lx of [-w * 0.38, -w * 0.28]) {
        const lu = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 10), M.terracottaPot);
        lu.scale.set(0.95, 1.15, 0.95);
        lu.position.set(lx, 0.46, d / 2 + 0.65);
        hg.add(lu);
        const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 10), woodPostMat);
        lid.position.set(lx, 0.88, d / 2 + 0.65);
        hg.add(lid);
      }

      hg.position.set(hx, 0, hz);
      hg.rotation.y = rotY;
      this.exteriorGroup.add(hg);
    };

    // Bustling Vietnamese Pilgrimage Market Street ("Con đường vào chùa rộn ràng hàng quán hành hương")
    const marketPalette = [
      { bg: '#9E2A20', roof: 0x336791, text: '#FFE27A', accent: 0xD94B3D },
      { bg: '#1F6A40', roof: 0x2F7064, text: '#FFF2B2', accent: 0x2F855A },
      { bg: '#8B501E', roof: 0x924438, text: '#FFE8A3', accent: 0xD9822B },
      { bg: '#2B4C7E', roof: 0x336791, text: '#FFF6D6', accent: 0x3A6EA5 },
      { bg: '#6E324B', roof: 0x7F8891, text: '#FFE2D1', accent: 0xC95D7A }
    ];
    const lotusPetalMat = new THREE.MeshStandardMaterial({ color: 0xEC6C9A, roughness: 0.45 });
    const fruitPomeloMat = new THREE.MeshStandardMaterial({ color: 0x6AA84F, roughness: 0.52 });
    const fruitOrangeMat = new THREE.MeshStandardMaterial({ color: 0xF08B2D, roughness: 0.48 });
    const cakeYellowMat = new THREE.MeshStandardMaterial({ color: 0xF5D25B, roughness: 0.56 });
    const hatStrawMat = new THREE.MeshStandardMaterial({ color: 0xE6D3A3, roughness: 0.72, side: THREE.DoubleSide });
    const clothRackColors = [0x9A8F99, 0x7E96AC, 0xDF8DA8, 0xE7D5AE, 0x6B8E76, 0xC69A64];

    const addPilgrimageStreetShop = (sx, sz, rotY, cfg) => {
      const sg = new THREE.Group();
      const pal = marketPalette[cfg.palIdx % marketPalette.length];
      const w = cfg.w || 4.8;
      const d = cfg.d || 3.4;
      const h = 2.95;

      // Raised concrete shop platform
      const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.5, 0.14, d + 1.8),
        new THREE.MeshStandardMaterial({ color: 0xC9BEB0, roughness: 0.85 })
      );
      plinth.position.set(0, 0.07, 0.55);
      plinth.receiveShadow = true;
      sg.add(plinth);

      // Rear timber/lime shop kiosk walls
      const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, 0.24),
        new THREE.MeshStandardMaterial({ map: this.limeWallTex, color: 0xF2E7CF, roughness: 0.84 })
      );
      backWall.position.set(0, h / 2 + 0.12, -d * 0.45);
      backWall.castShadow = true;
      sg.add(backWall);

      for (const px of [-w * 0.46, w * 0.46]) {
        const sideWall = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, h, d * 0.9),
          new THREE.MeshStandardMaterial({ map: this.limeWallTex, color: 0xEAE0C8, roughness: 0.84 })
        );
        sideWall.position.set(px, h / 2 + 0.12, 0);
        sg.add(sideWall);
        const frontPost = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, h + 0.1, 8), woodPostMat);
        frontPost.position.set(px, (h + 0.1) / 2, d * 0.52);
        sg.add(frontPost);
      }

      // Sloped corrugated tin roof + striped extended market canvas ("bạt che sạp chợ chùa")
      const tinRoof = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.65, 0.08, d + 1.15),
        new THREE.MeshStandardMaterial({ map: this.tinRoofTex, color: pal.roof, roughness: 0.54, metalness: 0.22 })
      );
      tinRoof.position.set(0, h + 0.25, 0.15);
      tinRoof.rotation.x = 0.18;
      tinRoof.castShadow = true;
      sg.add(tinRoof);

      const frontTarp = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.5, 0.04, 1.55),
        stripedAwningMat
      );
      frontTarp.position.set(0, 2.55, d * 0.5 + 0.72);
      frontTarp.rotation.x = 0.32;
      sg.add(frontTarp);

      // Vibrant shop signboard
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.92, 0.68, 0.1),
        new THREE.MeshStandardMaterial({
          map: makeTextTex(cfg.sign, { w: 1024, h: 170, bg: pal.bg, border: '#FFE082', color: pal.text, size: 42 }),
          roughness: 0.42
        })
      );
      sign.position.set(0, 2.98, d * 0.52);
      sg.add(sign);

      // Warm hanging string bulbs under eaves
      for (let bi = -2; bi <= 2; bi++) {
        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.065, 7, 6),
          new THREE.MeshBasicMaterial({ color: bi % 2 === 0 ? 0xFFE382 : 0xFF9F5A })
        );
        bulb.position.set(bi * (w * 0.19), 2.58, d * 0.55);
        sg.add(bulb);
      }

      // Display table & themed merchandise
      const table = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.88, 0.76, 1.05),
        woodPostMat
      );
      table.position.set(0, 0.48, d * 0.24);
      table.castShadow = true;
      sg.add(table);

      const cloth = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.9, 0.08, 1.12),
        new THREE.MeshStandardMaterial({ color: pal.accent, roughness: 0.78 })
      );
      cloth.position.set(0, 0.87, d * 0.24);
      sg.add(cloth);

      if (cfg.cat === 'huong_hoa') {
        // Buckets of fresh pink lotus stems, marigolds, incense packs
        for (let i = -2; i <= 2; i++) {
          const bucket = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.14, 0.36, 10),
            new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x2D7648 : 0xB83A2E, roughness: 0.55 })
          );
          bucket.position.set(i * 0.68, 1.08, d * 0.26);
          sg.add(bucket);
          for (let f = 0; f < 4; f++) {
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.36, 5), M.foliageLight);
            stem.position.set(i * 0.68 + (f - 1.5) * 0.06, 1.32, d * 0.26 + (f % 2) * 0.06);
            sg.add(stem);
            const fl = new THREE.Mesh(
              new THREE.ConeGeometry(0.07, 0.14, 7),
              i % 2 === 0 ? lotusPetalMat : fruitOrangeMat
            );
            fl.position.set(stem.position.x, 1.5, stem.position.z);
            fl.rotation.x = Math.PI;
            sg.add(fl);
          }
        }
        // Incense bundles stacked on shelf
        for (let p = 0; p < 5; p++) {
          const pack = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 0.42, 8),
            new THREE.MeshStandardMaterial({ color: p % 2 === 0 ? 0xC62828 : 0xD9962E, roughness: 0.6 })
          );
          pack.rotation.x = Math.PI / 2;
          pack.position.set(-1.3 + p * 0.25, 0.96, d * 0.42);
          sg.add(pack);
        }
      } else if (cfg.cat === 'thu_cong') {
        // Bamboo pole displaying stacked conical nón lá + hanging áo lam garment rail
        const hatPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 2.2, 6), woodPostMat);
        hatPole.position.set(-w * 0.38, 1.25, d * 0.56);
        sg.add(hatPole);
        for (let hi = 0; hi < 5; hi++) {
          const hat = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.15, 14, 1, true), hatStrawMat);
          hat.position.set(-w * 0.38, 1.1 + hi * 0.22, d * 0.56);
          hat.rotation.x = 0.25;
          sg.add(hat);
        }
        // Horizontal clothing bar with colorful áo lam / áo bà ba
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, w * 0.75, 8), zincMat);
        bar.rotation.z = Math.PI / 2;
        bar.position.set(0.25, 2.22, -d * 0.12);
        sg.add(bar);
        for (let gi = 0; gi < 5; gi++) {
          const robe = new THREE.Mesh(
            new THREE.BoxGeometry(0.38, 0.72, 0.12),
            new THREE.MeshStandardMaterial({ color: clothRackColors[(gi + cfg.palIdx) % clothRackColors.length], roughness: 0.72 })
          );
          robe.position.set(-w * 0.18 + gi * 0.48, 1.78, -d * 0.12);
          sg.add(robe);
        }
        // Rattan baskets & wooden beads trays on counter
        for (let bi = -1; bi <= 1; bi++) {
          const bsk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.26, 0.2, 0.2, 12),
            new THREE.MeshStandardMaterial({ color: 0xC69A58, roughness: 0.76 })
          );
          bsk.position.set(bi * 0.9, 1.0, d * 0.24);
          sg.add(bsk);
        }
      } else {
        // Glass street food showcase + fruit pyramids (bưởi, cam, dừa xiêm, bánh bò) + ice box + ghế cóc stools
        const glassCase = new THREE.Mesh(
          new THREE.BoxGeometry(1.55, 0.65, 0.72),
          new THREE.MeshStandardMaterial({ color: 0xDCF2F8, roughness: 0.18, transparent: true, opacity: 0.66 })
        );
        glassCase.position.set(-0.75, 1.24, d * 0.24);
        sg.add(glassCase);
        for (let fi = 0; fi < 5; fi++) {
          const item = new THREE.Mesh(
            new THREE.SphereGeometry(0.14, 9, 8),
            fi % 3 === 0 ? fruitPomeloMat : fi % 3 === 1 ? cakeYellowMat : fruitOrangeMat
          );
          item.position.set(0.45 + (fi % 3) * 0.34, 1.04 + Math.floor(fi / 3) * 0.2, d * 0.24);
          sg.add(item);
        }
        const redCooler = new THREE.Mesh(
          new THREE.BoxGeometry(0.62, 0.48, 0.44),
          new THREE.MeshStandardMaterial({ color: 0xC6352B, roughness: 0.45 })
        );
        redCooler.position.set(w * 0.35, 0.36, d * 0.62);
        sg.add(redCooler);
        for (const [stx, col] of [
          [-0.85, 0xC9382B],
          [0.05, 0x2867B2],
          [0.95, 0xC9382B]
        ]) {
          const stool = new THREE.Mesh(
            new THREE.CylinderGeometry(0.19, 0.22, 0.34, 8),
            new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 })
          );
          stool.position.set(stx, 0.22, d * 0.78);
          sg.add(stool);
        }
      }

      sg.userData.stallType = cfg.cat;
      sg.userData.stallTitle = cfg.title;
      sg.position.set(sx, 0, sz);
      sg.rotation.y = rotY;
      this.exteriorGroup.add(sg);
      this.stallClickTargets.push(sg);
      this.stallTriggers.push({
        x: sx + Math.sin(rotY) * (d * 0.8),
        z: sz + Math.cos(rotY) * (d * 0.8),
        radius: 3.8,
        stallType: cfg.cat,
        title: cfg.title
      });
    };

    // Keep the frontage road open. Local food and daily-life activity belongs to family-house porches,
    // not to continuous rows of temporary market kiosks.

    // =========================================================================================
    // AUTHENTIC TP. MỸ THO URBAN STREETSCAPE & CÔNG VIÊN VĨNH TRÀNG (OSM GeoJSON way/266761436)
    // Replaces rural shacks, muddy front ditches & countryside hills with real urban Phường 8, Mỹ Tho!
    // =========================================================================================
    const urbanConcreteMat = new THREE.MeshStandardMaterial({ color: 0xB8B1A4, roughness: 0.90 });
    const urbanCurbMat = new THREE.MeshStandardMaterial({ color: 0x9C978E, roughness: 0.88 });
    const parkLawnMat = new THREE.MeshStandardMaterial({ color: 0x4A7D40, roughness: 0.94 });
    const parkHedgeMat = new THREE.MeshStandardMaterial({ color: 0x305F2F, roughness: 0.86 });
    const parkTileTex = this.pavingTex.clone();
    parkTileTex.needsUpdate = true;
    parkTileTex.repeat.set(14, 14);
    const parkPathMat = new THREE.MeshStandardMaterial({ map: parkTileTex, color: 0xC6B9A3, roughness: 0.88 });
    const ironRailingMat = new THREE.MeshStandardMaterial({ color: 0x2E343A, roughness: 0.48, metalness: 0.55 });
    const windowGlassMat = new THREE.MeshStandardMaterial({ color: 0x5C849A, roughness: 0.18, metalness: 0.25 });
    const rollingDoorMat = new THREE.MeshStandardMaterial({ color: 0xB4BCC2, roughness: 0.52, metalness: 0.35 });
    const urbanRoofTileMat = new THREE.MeshStandardMaterial({ color: 0x9E4632, roughness: 0.68 });
    const urbanBlueRoofMat = new THREE.MeshStandardMaterial({ color: 0x3B5E7D, roughness: 0.62, metalness: 0.15 });
    const facadeColors = [0xF3ECE0, 0xECE3C8, 0xDCE5E3, 0xEEDFD2, 0xE6EAEF, 0xF1E8D5];

    // Helper: Clean Urban Shade Tree in Tiled Sidewalk Tree Pit (cây dầu / bằng lăng đô thị)
    const addUrbanShadeTree = (tx, tz, scale = 1.0, inPit = true) => {
      const tg = new THREE.Group();
      if (inPit) {
        const pitCurb = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.16, 1.55), urbanCurbMat);
        pitCurb.position.y = 0.08;
        tg.add(pitCurb);
        const soil = new THREE.Mesh(
          new THREE.BoxGeometry(1.25, 0.17, 1.25),
          new THREE.MeshStandardMaterial({ color: 0x5A4736, roughness: 0.94 })
        );
        soil.position.y = 0.085;
        tg.add(soil);
      }
      const trunkH = 3.2 * scale;
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14 * scale, 0.22 * scale, trunkH, 9),
        M.trunk
      );
      trunk.position.y = trunkH * 0.5;
      trunk.castShadow = true;
      tg.add(trunk);
      const crownOffsets = [
        [0, trunkH + 1.15 * scale, 0, 1.85 * scale],
        [0.95 * scale, trunkH + 0.65 * scale, 0.5 * scale, 1.28 * scale],
        [-0.95 * scale, trunkH + 0.72 * scale, -0.45 * scale, 1.25 * scale],
        [0.35 * scale, trunkH + 0.82 * scale, -0.85 * scale, 1.18 * scale],
        [-0.45 * scale, trunkH + 0.68 * scale, 0.82 * scale, 1.16 * scale]
      ];
      crownOffsets.forEach(([cx, cy, cz, r], idx) => {
        const puff = new THREE.Mesh(
          new THREE.DodecahedronGeometry(r, 1),
          idx % 2 === 0 ? M.foliageMid : M.foliageLight
        );
        puff.scale.set(1.12, 0.78, 1.12);
        puff.position.set(cx, cy, cz);
        puff.castShadow = true;
        tg.add(puff);
      });
      tg.position.set(tx, 0, tz);
      this.exteriorGroup.add(tg);
    };

    // Helper: Classic Urban Park / Street Double-Globe Lamp Post (đèn công viên đô thị)
    const addUrbanParkLamp = (lx, lz, height = 4.6) => {
      const lg = new THREE.Group();
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 0.7, 10), ironRailingMat);
      base.position.y = 0.35;
      lg.add(base);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.085, height, 8), ironRailingMat);
      pole.position.y = height * 0.5;
      lg.add(pole);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 0.06), ironRailingMat);
      arm.position.y = height - 0.12;
      lg.add(arm);
      const globeMat = new THREE.MeshStandardMaterial({
        color: 0xFFF7E2,
        emissive: 0xFFE3A6,
        emissiveIntensity: 0.45,
        roughness: 0.22
      });
      for (const gx of [-0.52, 0.52]) {
        const globe = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), globeMat);
        globe.position.set(gx, height + 0.04, 0);
        lg.add(globe);
      }
      lg.position.set(lx, 0, lz);
      this.exteriorGroup.add(lg);
    };

    // Helper: Urban Park Granite Stone Bench (ghế đá công viên Mỹ Tho)
    const addParkStoneBench = (bx, bz, rotY = 0) => {
      const bg = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.1, 0.52), M.stoneLight);
      seat.position.set(0, 0.46, 0);
      seat.castShadow = true;
      bg.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.42, 0.08), M.stoneLight);
      back.position.set(0, 0.72, -0.22);
      back.rotation.x = -0.14;
      bg.add(back);
      for (const sx of [-0.62, 0.62]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.46, 0.44), urbanCurbMat);
        leg.position.set(sx, 0.23, 0);
        bg.add(leg);
      }
      bg.position.set(bx, 0, bz);
      bg.rotation.y = rotY;
      this.exteriorGroup.add(bg);
    };

    // Helper: Authentic TP. Mỹ Tho 2-to-3 Story Vietnamese Urban Townhouse / Shophouse (Nhà phố đô thị)
    const addUrbanTownhouse = (hx, hz, w, d, floors = 2, rotY = 0, cfg = {}) => {
      const hg = new THREE.Group();
      const floorH = 3.25;
      const totalH = floors * floorH;
      const facadeMat = new THREE.MeshStandardMaterial({
        map: this.limeWallTex,
        color: facadeColors[(cfg.colorIdx || 0) % facadeColors.length],
        roughness: 0.82
      });
      const trimMat = new THREE.MeshStandardMaterial({ color: 0xF6F3EC, roughness: 0.74 });
      const awningMat = new THREE.MeshStandardMaterial({
        color: cfg.awningColor || 0x295B82,
        roughness: 0.66
      });

      // Raised tiled urban porch apron
      const apron = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.18, d + 1.4), urbanConcreteMat);
      apron.position.set(0, 0.09, 0.5);
      apron.receiveShadow = true;
      hg.add(apron);

      // Main multi-story concrete structure
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, totalH, d), facadeMat);
      body.position.y = totalH * 0.5 + 0.12;
      body.castShadow = true;
      body.receiveShadow = true;
      hg.add(body);

      // Ground-floor urban storefront: rolling shutter / glass shopfront + retractable awning + signage
      const frontZ = d * 0.5 + 0.04;
      const doorW = Math.min(w * 0.68, 4.4);
      const shopDoor = new THREE.Mesh(
        new THREE.BoxGeometry(doorW, 2.55, 0.1),
        cfg.glassFront ? windowGlassMat : rollingDoorMat
      );
      shopDoor.position.set(0, 1.42, frontZ);
      hg.add(shopDoor);
      // Side framing pilasters
      for (const sx of [-w * 0.44, w * 0.44]) {
        const pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.42, totalH, 0.16), trimMat);
        pilaster.position.set(sx, totalH * 0.5 + 0.12, frontZ);
        hg.add(pilaster);
      }

      // Ground-floor cantilevered concrete awning / shop canopy
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(w + 0.15, 0.16, 1.35), awningMat);
      canopy.position.set(0, floorH - 0.12, d * 0.5 + 0.62);
      canopy.rotation.x = 0.08;
      canopy.castShadow = true;
      hg.add(canopy);

      if (cfg.sign) {
        const signMesh = new THREE.Mesh(
          new THREE.BoxGeometry(Math.min(w * 0.88, 5.8), 0.72, 0.12),
          new THREE.MeshStandardMaterial({
            map: makeTextTex(cfg.sign, {
              w: 960,
              h: 160,
              bg: cfg.signBg || '#1E4C7A',
              border: '#F2E5C4',
              color: cfg.signColor || '#FFFFFF',
              size: 40
            }),
            roughness: 0.4
          })
        );
        signMesh.position.set(0, floorH + 0.22, d * 0.5 + 1.24);
        hg.add(signMesh);
      }

      // Upper stories (2nd & 3rd floor): recessed balconies, iron railings, glass windows & concrete sun-hoods
      for (let fl = 1; fl < floors; fl++) {
        const fy = fl * floorH + 0.14;
        const slab = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.18, 1.05), trimMat);
        slab.position.set(0, fy, d * 0.5 + 0.48);
        hg.add(slab);
        const railTop = new THREE.Mesh(new THREE.BoxGeometry(w - 0.35, 0.07, 0.07), ironRailingMat);
        railTop.position.set(0, fy + 0.92, d * 0.5 + 0.94);
        hg.add(railTop);
        for (let rx = -w * 0.42; rx <= w * 0.43; rx += 0.55) {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.86, 0.045), ironRailingMat);
          post.position.set(rx, fy + 0.48, d * 0.5 + 0.94);
          hg.add(post);
        }
        // Balcony door + upper windows
        const bDoor = new THREE.Mesh(new THREE.BoxGeometry(1.35, 2.05, 0.1), windowGlassMat);
        bDoor.position.set(-w * 0.18, fy + 1.15, frontZ);
        hg.add(bDoor);
        const bWin = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.28, 0.1), windowGlassMat);
        bWin.position.set(w * 0.22, fy + 1.42, frontZ);
        hg.add(bWin);
        const hood = new THREE.Mesh(new THREE.BoxGeometry(w * 0.92, 0.12, 0.58), trimMat);
        hood.position.set(0, fy + 2.48, d * 0.5 + 0.28);
        hg.add(hood);
        // AC outdoor condenser unit
        const acUnit = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.44, 0.28), urbanConcreteMat);
        acUnit.position.set(w * 0.36, fy + 0.55, d * 0.5 + 0.2);
        hg.add(acUnit);
      }

      // Clean urban parapet cornice + pitched tile roof cap
      const parapet = new THREE.Mesh(new THREE.BoxGeometry(w + 0.26, 0.55, d + 0.26), trimMat);
      parapet.position.set(0, totalH + 0.38, 0);
      hg.add(parapet);
      const roofCap = new THREE.Mesh(
        new THREE.ConeGeometry(Math.max(w, d) * 0.62, 1.35, 4),
        (cfg.roofIdx || 0) % 2 === 0 ? urbanRoofTileMat : urbanBlueRoofMat
      );
      roofCap.rotation.y = Math.PI / 4;
      roofCap.scale.set((w + 0.5) / Math.max(w, d), 1, (d + 0.5) / Math.max(w, d));
      roofCap.position.set(0, totalH + 1.18, 0);
      hg.add(roofCap);

      hg.position.set(hx, 0, hz);
      hg.rotation.y = rotY;
      this.exteriorGroup.add(hg);
    };

    // =========================================================================================
    // 1. CÔNG VIÊN VĨNH TRÀNG — THIẾT KẾ THỰC TẾ PHƯỜNG 8, TP. MỸ THO (OSM way/266761436)
    //    Nằm bên phải khi từ Cổng Phụ nhìn thẳng ra đường (x = -26.0 .. +31.2, z = 54.0 .. 168.0).
    //    Gồm: Quảng trường tròn lát gạch bông terrazzo, đài phun nước hoa sen có tia nước,
    //    bồn hoa gạch đỏ trồng bông giấy & vạn thọ, chòi nghỉ mát mái ngói đỏ, khu dụng cụ
    //    tập thể dục công viên ngoài trời (vàng-xanh đặc trưng VN), hàng cau cảnh & cây dầu cổ thụ!
    // =========================================================================================
    const parkGroup = new THREE.Group();
    const parkBrickMat = new THREE.MeshStandardMaterial({ map: this.sideBrickTex, color: 0xB5684A, roughness: 0.84 });
    const parkTerrazzoMat = new THREE.MeshStandardMaterial({ map: parkTileTex, color: 0xC8BCAA, roughness: 0.82 });
    const parkGymYellow = new THREE.MeshStandardMaterial({ color: 0xE2A61E, roughness: 0.36, metalness: 0.38 });
    const parkGymBlue = new THREE.MeshStandardMaterial({ color: 0x1D5D9B, roughness: 0.36, metalness: 0.4 });
    const parkSoilMat = new THREE.MeshStandardMaterial({ color: 0x59422E, roughness: 0.95 });

    const parkLawn = new THREE.Mesh(new THREE.BoxGeometry(57.2, 0.14, 114.0), parkLawnMat);
    parkLawn.position.set(2.6, 0.01, 111.0);
    parkLawn.receiveShadow = true;
    parkGroup.add(parkLawn);

    // Đường dạo viền gạch đỏ ôm quanh công viên + hàng bồn hoa giấy nở rực mặt tiền công viên
    const perimeterEastWalk = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.09, 113.4), parkTerrazzoMat);
    perimeterEastWalk.position.set(29.2, 0.06, 111.0);
    perimeterEastWalk.receiveShadow = true;
    parkGroup.add(perimeterEastWalk);

    const perimeterNorthWalk = new THREE.Mesh(new THREE.BoxGeometry(56.6, 0.09, 3.2), parkTerrazzoMat);
    perimeterNorthWalk.position.set(2.6, 0.06, 56.2);
    perimeterNorthWalk.receiveShadow = true;
    parkGroup.add(perimeterNorthWalk);

    // Bồn hoa gạch đỏ viền công viên + bụi hoa giấy hồng / cam / vàng đặc trưng TP. Mỹ Tho
    const bougainvilleaMats = [
      new THREE.MeshStandardMaterial({ color: 0xD83878, roughness: 0.72 }),
      new THREE.MeshStandardMaterial({ color: 0xE86A2A, roughness: 0.72 }),
      new THREE.MeshStandardMaterial({ color: 0xF2B832, roughness: 0.72 }),
      new THREE.MeshStandardMaterial({ color: 0xC93636, roughness: 0.72 })
    ];
    const addParkFlowerBed = (fx, fz, fw, fd, colorIdx = 0) => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(fw, 0.34, fd), parkBrickMat);
      curb.position.set(fx, 0.17, fz);
      curb.castShadow = true;
      parkGroup.add(curb);
      const soil = new THREE.Mesh(new THREE.BoxGeometry(fw - 0.3, 0.36, fd - 0.3), parkSoilMat);
      soil.position.set(fx, 0.18, fz);
      parkGroup.add(soil);
      const count = Math.max(3, Math.floor(Math.max(fw, fd) / 1.45));
      for (let i = 0; i < count; i++) {
        const t = count === 1 ? 0 : (i / (count - 1)) - 0.5;
        const bx = fw >= fd ? fx + t * (fw - 1.1) : fx;
        const bz = fd > fw ? fz + t * (fd - 1.1) : fz;
        const leaf = new THREE.Mesh(new THREE.DodecahedronGeometry(0.46, 0), parkHedgeMat);
        leaf.scale.set(1.15, 0.72, 1.15);
        leaf.position.set(bx, 0.52, bz);
        parkGroup.add(leaf);
        const bloom = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.32, 0),
          bougainvilleaMats[(colorIdx + i) % bougainvilleaMats.length]
        );
        bloom.position.set(bx + ((i % 2) ? 0.12 : -0.12), 0.72, bz);
        parkGroup.add(bloom);
      }
    };
    addParkFlowerBed(-9.5, 59.0, 14.0, 1.5, 0);
    addParkFlowerBed(18.5, 59.0, 11.5, 1.5, 1);
    addParkFlowerBed(26.5, 79.0, 1.5, 10.0, 2);
    addParkFlowerBed(26.5, 121.0, 1.5, 11.0, 3);
    addParkFlowerBed(26.5, 152.0, 1.5, 9.5, 0);

    // Biển đá chào mừng "CÔNG VIÊN VĨNH TRÀNG · TP. MỸ THO" đặt trên bồn hoa góc Đông-Bắc
    const parkSignBase = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.65, 5.4), parkBrickMat);
    parkSignBase.position.set(27.8, 0.33, 62.0);
    parkGroup.add(parkSignBase);
    const parkSignSlab = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 1.25, 0.24),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('CÔNG VIÊN VĨNH TRÀNG · TP. MỸ THO', {
          w: 1100, h: 280, bg: '#1B5A38', border: '#F0D388', color: '#FFFDF2', size: 46
        }),
        roughness: 0.42
      })
    );
    parkSignSlab.position.set(27.8, 1.32, 62.0);
    parkSignSlab.rotation.y = Math.PI / 2;
    parkGroup.add(parkSignSlab);

    // Quảng trường tròn trung tâm (OSM way/1147384259) lát gạch terrazzo & viền gạch tàu đỏ
    const plazaX = 8.0;
    const plazaZ = 104.0;
    const plazaRing = new THREE.Mesh(new THREE.RingGeometry(5.8, 13.6, 48), parkTerrazzoMat);
    plazaRing.rotation.x = -Math.PI / 2;
    plazaRing.position.set(plazaX, 0.095, plazaZ);
    plazaRing.receiveShadow = true;
    parkGroup.add(plazaRing);

    const plazaBrickAccent = new THREE.Mesh(new THREE.RingGeometry(12.6, 13.6, 48), parkBrickMat);
    plazaBrickAccent.rotation.x = -Math.PI / 2;
    plazaBrickAccent.position.set(plazaX, 0.102, plazaZ);
    parkGroup.add(plazaBrickAccent);

    // =========================================================================
    // ĐẠI TƯỢNG PHẬT LỚN TRONG CÔNG VIÊN VĂN HÓA VĨNH TRÀNG (plazaX = 8.0, plazaZ = 104.0)
    // Quay mặt hướng Đông (+X) thẳng ra cổng chính Công viên & đường vào Chùa Vĩnh Tràng!
    // =========================================================================
    const parkBuddhaGroup = new THREE.Group();
    parkBuddhaGroup.position.set(plazaX, 0, plazaZ);
    parkBuddhaGroup.rotation.y = Math.PI / 2; // Local +Z faces East (+X) toward main road & park gate!
    this.parkBuddhaGroup = parkBuddhaGroup;

    // 3-tier solemn granite & crimson-lacquered lotus pedestal (total height 3.2m)
    const pbStep1 = new THREE.Mesh(new THREE.CylinderGeometry(5.8, 6.25, 0.45, 16), M.stoneLight);
    pbStep1.position.y = 0.225;
    pbStep1.receiveShadow = true;
    parkBuddhaGroup.add(pbStep1);

    const pbTier1 = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.95, 1.15, 12), M.stoneDark);
    pbTier1.position.y = 1.02;
    pbTier1.castShadow = true;
    pbTier1.receiveShadow = true;
    parkBuddhaGroup.add(pbTier1);

    const pbTier2 = new THREE.Mesh(new THREE.CylinderGeometry(3.45, 3.85, 1.12, 12), M.pedestalRed);
    pbTier2.position.y = 2.15;
    pbTier2.castShadow = true;
    parkBuddhaGroup.add(pbTier2);

    const pbGoldCollar = new THREE.Mesh(new THREE.TorusGeometry(3.52, 0.11, 8, 24), M.goldAccent);
    pbGoldCollar.rotation.x = Math.PI / 2;
    pbGoldCollar.position.y = 2.74;
    parkBuddhaGroup.add(pbGoldCollar);

    const pbLotusCap = new THREE.Mesh(new THREE.CylinderGeometry(2.85, 3.35, 0.52, 16), M.stoneLight);
    pbLotusCap.position.y = 2.96;
    parkBuddhaGroup.add(pbLotusCap);

    // Carved pink lotus petals encircling the upper pedestal rim
    for (let lp = 0; lp < 16; lp++) {
      const la = (lp / 16) * Math.PI * 2;
      const pet = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.92, 6), lotusPetalMat);
      pet.position.set(Math.cos(la) * 2.95, 3.22, Math.sin(la) * 2.95);
      pet.rotation.z = -Math.cos(la) * 0.48;
      pet.rotation.x = Math.sin(la) * 0.48;
      parkBuddhaGroup.add(pet);
    }

    // Semicircular carved stone balustrade wrapping rear & flanks (leaves front East staircase open)
    for (let bi = 0; bi <= 10; bi++) {
      const ang = -Math.PI * 0.72 + (bi / 10) * (Math.PI * 1.44);
      const bx = Math.sin(ang) * 5.75;
      const bz = -Math.cos(ang) * 5.75;
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.92, 0.28), M.stoneLight);
      post.position.set(bx, 0.88, bz);
      parkBuddhaGroup.add(post);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), lotusPetalMat);
      cap.position.set(bx, 1.42, bz);
      parkBuddhaGroup.add(cap);
    }

    // Front granite staircase & golden nameplate facing East (+X)
    for (let st = 0; st < 3; st++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.2, 0.44), M.stoneLight);
      step.position.set(0, 0.22 + st * 0.18, 5.75 - st * 0.42);
      step.receiveShadow = true;
      parkBuddhaGroup.add(step);
    }
    const pbPlaque = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 0.72, 0.16),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('NAM MÔ A DI ĐÀ PHẬT · CÔNG VIÊN VĨNH TRÀNG', {
          w: 1400, h: 200, bg: '#5A1610', border: '#F4C95D', color: '#FFF5DA', size: 44
        }),
        roughness: 0.44
      })
    );
    pbPlaque.position.set(0, 1.98, 3.92);
    parkBuddhaGroup.add(pbPlaque);

    // Anchor where glb-loading.mjs mounts the 16.5m Monumental Giant Buddha GLB (with clean temporary fallback)
    const parkBuddhaStatueAnchor = new THREE.Group();
    parkBuddhaStatueAnchor.position.set(0, 3.22, 0);
    const pbFallback = new THREE.Group();
    const pbFBody = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.85, 8.8, 16), M.statueWhite);
    pbFBody.position.y = 4.4;
    pbFallback.add(pbFBody);
    const pbFHead = new THREE.Mesh(new THREE.SphereGeometry(0.95, 14, 12), M.statueWhite);
    pbFHead.position.y = 9.8;
    pbFallback.add(pbFHead);
    parkBuddhaStatueAnchor.add(pbFallback);
    parkBuddhaGroup.add(parkBuddhaStatueAnchor);
    this.parkBuddhaStatueAnchor = parkBuddhaStatueAnchor;
    this.parkBuddhaFallback = pbFallback;

    // Solemn Outdoor Worship Sanctuary (Bàn Thờ Lộ Thiên + Đỉnh Đồng Tam Túc + Chiếu Lạy + Đèn Đá) in front of Park Giant Buddha
    const pbAltarRed = new THREE.MeshStandardMaterial({ color: 0x7A1B14, roughness: 0.56 });
    const pbPorcelain = new THREE.MeshStandardMaterial({ color: 0xF0EFE8, roughness: 0.24 });
    const pbEmber = new THREE.MeshBasicMaterial({ color: 0xFF6A2B });
    const pbFlame = new THREE.MeshBasicMaterial({ color: 0xFFE38A });

    const pbAltarZ = 7.1;
    const pbAltarBody = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.06, 1.08), pbAltarRed);
    pbAltarBody.position.set(0, 0.62, pbAltarZ);
    pbAltarBody.castShadow = true;
    parkBuddhaGroup.add(pbAltarBody);
    const pbAltarSlab = new THREE.Mesh(new THREE.BoxGeometry(4.02, 0.12, 1.24), M.stoneLight);
    pbAltarSlab.position.set(0, 1.2, pbAltarZ);
    parkBuddhaGroup.add(pbAltarSlab);
    const pbAltarCloth = new THREE.Mesh(
      new THREE.PlaneGeometry(2.65, 0.68),
      new THREE.MeshBasicMaterial({
        map: makeTextTex('THÀNH TÂM LỄ PHẬT', {
          w: 760, h: 180, bg: '#7E1610', border: '#F4CA5E', color: '#FFE99A', size: 48
        })
      })
    );
    pbAltarCloth.position.set(0, 0.64, pbAltarZ + 0.56);
    parkBuddhaGroup.add(pbAltarCloth);
    for (const sgn of [-1, 1]) {
      const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.46, 12), pbPorcelain);
      vase.position.set(sgn * 1.48, 1.48, pbAltarZ - 0.1);
      parkBuddhaGroup.add(vase);
      for (let fi = -1; fi <= 1; fi++) {
        const fl = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), lotusPetalMat);
        fl.position.set(sgn * 1.48 + fi * 0.1, 1.8 + (fi === 0 ? 0.08 : 0), pbAltarZ - 0.1);
        parkBuddhaGroup.add(fl);
      }
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.09, 0.36, 10), M.goldAccent);
      candle.position.set(sgn * 0.88, 1.44, pbAltarZ + 0.18);
      parkBuddhaGroup.add(candle);
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.08, 6), pbFlame);
      flame.position.set(sgn * 0.88, 1.66, pbAltarZ + 0.18);
      parkBuddhaGroup.add(flame);
    }
    const pbCenser = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.24, 14), M.bronzeBurner);
    pbCenser.position.set(0, 1.38, pbAltarZ + 0.08);
    parkBuddhaGroup.add(pbCenser);

    // Centered Bronze Cauldron (Đỉnh Đồng Tam Túc)
    const pbCauldronZ = 8.45;
    const pbCPlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.82, 0.28, 8), M.stoneDark);
    pbCPlinth.position.set(0, 0.24, pbCauldronZ);
    parkBuddhaGroup.add(pbCPlinth);
    const pbCBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.44, 0.58, 16), M.bronzeBurner);
    pbCBowl.position.set(0, 0.94, pbCauldronZ);
    parkBuddhaGroup.add(pbCBowl);
    const pbCRim = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.055, 8, 16), M.goldAccent);
    pbCRim.rotation.x = Math.PI / 2;
    pbCRim.position.set(0, 1.24, pbCauldronZ);
    parkBuddhaGroup.add(pbCRim);
    for (let si = -2; si <= 2; si++) {
      const stk = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.42, 5), M.redColumn);
      stk.position.set(si * 0.07, 1.44, pbCauldronZ);
      parkBuddhaGroup.add(stk);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), pbEmber);
      tip.position.set(si * 0.075, 1.66, pbCauldronZ);
      parkBuddhaGroup.add(tip);
    }

    // 4 neat crimson-gold kneeling prayer mats facing the Park Giant Buddha
    for (let mi = 0; mi < 4; mi++) {
      const mx = (mi - 1.5) * 1.28;
      const mat = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.05, 1.02), pbAltarRed);
      mat.position.set(mx, 0.13, 10.35);
      parkBuddhaGroup.add(mat);
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.1, 12), M.redColumn);
      pad.position.set(mx, 0.2, 10.5);
      parkBuddhaGroup.add(pad);
    }

    parkGroup.add(parkBuddhaGroup);
    this.addObstacle(plazaX, plazaZ, 5.4);
    this.addRectObstacle(plazaX + 6.3, plazaX + 9.2, plazaZ - 2.4, plazaZ + 2.4);

    // =========================================================================
    // HÀNG RÀO CAO BAO QUANH CÔNG VIÊN VĂN HÓA VĨNH TRÀNG (~2.55m)
    // Tường bệ xây kem vàng + Trụ cột cổ điển đầu búp sen + Song sắt đen mũi giáo,
    // mở rộng 5 cổng vào thông thoáng tại các trục đường đi bộ!
    // =========================================================================
    const fenceWallMat = new THREE.MeshStandardMaterial({
      color: 0xEFE2C4,
      map: this.limeWallTex,
      roughness: 0.8
    });
    const fenceCapMat = new THREE.MeshStandardMaterial({ color: 0xD8C6A2, roughness: 0.72 });
    const fenceIronMat = new THREE.MeshStandardMaterial({ color: 0x202624, roughness: 0.42, metalness: 0.65 });

    // Collect vertical wrought-iron pickets + masonry pillars/caps/finials into 4 fast InstancedMeshes
    const picketMatrices = [];
    const pillarMatrices = [];
    const capMatrices = [];
    const finialMatrices = [];
    const instDummy = new THREE.Object3D();

    const addFenceSpan = (x1, z1, x2, z2, registerCollider = true) => {
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      if (len < 0.8) return;
      const midX = (x1 + x2) * 0.5;
      const midZ = (z1 + z2) * 0.5;
      const angle = Math.atan2(dx, dz); // Local +Z runs along the span

      const spanGrp = new THREE.Group();
      spanGrp.position.set(midX, 0, midZ);
      spanGrp.rotation.y = angle;

      // Solid plastered masonry base plinth wall (height 0.78m) + coping cap
      const baseWall = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.78, len), fenceWallMat);
      baseWall.position.y = 0.39;
      baseWall.receiveShadow = true;
      spanGrp.add(baseWall);

      const baseCap = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.08, len + 0.06), fenceCapMat);
      baseCap.position.y = 0.82;
      spanGrp.add(baseCap);

      // Horizontal wrought-iron rails (y = 1.0, 1.65, 2.34)
      for (const ry of [1.0, 1.65, 2.34]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.055, len), fenceIronMat);
        rail.position.y = ry;
        spanGrp.add(rail);
      }

      const nx = dx / len;
      const nz = dz / len;

      // Tall classical masonry fence pillars spaced every ~7.5m (instanced!)
      const bayCount = Math.max(1, Math.round(len / 7.5));
      for (let bi = 0; bi <= bayCount; bi++) {
        const d = (bi / bayCount) * len;
        const px = x1 + nx * d;
        const pz = z1 + nz * d;
        instDummy.rotation.set(0, angle, 0);
        instDummy.scale.set(1, 1, 1);

        instDummy.position.set(px, 1.26, pz);
        instDummy.updateMatrix();
        pillarMatrices.push(instDummy.matrix.clone());

        instDummy.position.set(px, 2.58, pz);
        instDummy.updateMatrix();
        capMatrices.push(instDummy.matrix.clone());

        instDummy.position.set(px, 2.75, pz);
        instDummy.updateMatrix();
        finialMatrices.push(instDummy.matrix.clone());
      }

      // Vertical wrought-iron pickets every 0.85m along the span (instanced!)
      const pCount = Math.floor(len / 0.85);
      for (let pi = 1; pi < pCount; pi++) {
        const d = (pi / pCount) * len;
        const px = x1 + nx * d;
        const pz = z1 + nz * d;
        instDummy.position.set(px, 1.68, pz);
        instDummy.rotation.set(0, 0, 0);
        instDummy.scale.set(1, 1, 1);
        instDummy.updateMatrix();
        picketMatrices.push(instDummy.matrix.clone());
      }

      parkGroup.add(spanGrp);
      if (registerCollider) {
        const minX = Math.min(x1, x2) - 0.35;
        const maxX = Math.max(x1, x2) + 0.35;
        const minZ = Math.min(z1, z2) - 0.35;
        const maxZ = Math.max(z1, z2) + 0.35;
        this.addRectObstacle(minX, maxX, minZ, maxZ);
      }
    };

    // East perimeter fence (x = 30.8) with 3 wide open gates at z = 70, 104 (main), 138
    addFenceSpan(30.8, 54.4, 30.8, 66.2);
    addFenceSpan(30.8, 73.8, 30.8, 99.2);
    addFenceSpan(30.8, 108.8, 30.8, 134.2);
    addFenceSpan(30.8, 141.8, 30.8, 167.6);

    // North perimeter fence (z = 54.4) with wide open North gate at x = 8.0
    addFenceSpan(-25.6, 54.4, 4.2, 54.4);
    addFenceSpan(11.8, 54.4, 30.8, 54.4);

    // West perimeter fence (x = -25.6, continuous)
    addFenceSpan(-25.6, 54.4, -25.6, 167.6);

    // South perimeter fence (z = 167.6) with wide open South gate at x = 8.0
    addFenceSpan(-25.6, 167.6, 4.2, 167.6);
    addFenceSpan(11.8, 167.6, 30.8, 167.6);

    const buildInstanced = (geo, mat, matrices) => {
      if (!matrices.length) return;
      const inst = new THREE.InstancedMesh(geo, mat, matrices.length);
      for (let i = 0; i < matrices.length; i++) inst.setMatrixAt(i, matrices[i]);
      inst.instanceMatrix.needsUpdate = true;
      parkGroup.add(inst);
    };
    buildInstanced(new THREE.BoxGeometry(0.5, 2.52, 0.5), fenceWallMat, pillarMatrices);
    buildInstanced(new THREE.BoxGeometry(0.62, 0.14, 0.62), fenceCapMat, capMatrices);
    buildInstanced(new THREE.SphereGeometry(0.14, 7, 5), M.goldAccent, finialMatrices);
    buildInstanced(new THREE.CylinderGeometry(0.024, 0.028, 1.68, 4), fenceIronMat, picketMatrices);

    // Grand Ceremonial East Entrance Gate Archway at (x = 30.8, z = 104.0) framing the view straight to the Park Giant Buddha!
    const mainGateGrp = new THREE.Group();
    mainGateGrp.position.set(30.8, 0, 104.0);
    for (const gz of [-4.8, 4.8]) {
      const gCol = new THREE.Mesh(new THREE.BoxGeometry(0.82, 4.35, 0.82), fenceWallMat);
      gCol.position.set(0, 2.18, gz);
      gCol.castShadow = true;
      mainGateGrp.add(gCol);
      const gCap = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.24, 1.06), M.roofTile);
      gCap.position.set(0, 4.46, gz);
      mainGateGrp.add(gCap);
      const gLotus = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), M.goldAccent);
      gLotus.position.set(0, 4.78, gz);
      mainGateGrp.add(gLotus);
    }
    const gLintel = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.72, 10.6), fenceWallMat);
    gLintel.position.set(0, 4.42, 0);
    mainGateGrp.add(gLintel);
    const gRoof = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.42, 11.4), M.roofTile);
    gRoof.position.set(0, 4.98, 0);
    mainGateGrp.add(gRoof);
    const gSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.84, 0.64, 7.6),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('CÔNG VIÊN VĂN HÓA VĨNH TRÀNG', {
          w: 1280, h: 160, bg: '#1B5233', border: '#F5CD67', color: '#FFF8E4', size: 54
        }),
        roughness: 0.4
      })
    );
    gSign.position.set(0, 4.42, 0);
    mainGateGrp.add(gSign);
    parkGroup.add(mainGateGrp);

    // Lối dạo lát đá gọn gàng trục Bắc–Nam & 3 lối ngang Đông–Tây
    const perimeterWestWalk = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.09, 113.4), parkTerrazzoMat);
    perimeterWestWalk.position.set(-23.4, 0.06, 111.0);
    perimeterWestWalk.receiveShadow = true;
    parkGroup.add(perimeterWestWalk);

    const perimeterSouthWalk = new THREE.Mesh(new THREE.BoxGeometry(56.6, 0.09, 3.0), parkTerrazzoMat);
    perimeterSouthWalk.position.set(2.6, 0.06, 165.4);
    perimeterSouthWalk.receiveShadow = true;
    parkGroup.add(perimeterSouthWalk);

    const nsParkPath = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.08, 114.0), parkPathMat);
    nsParkPath.position.set(plazaX, 0.06, 111.0);
    nsParkPath.receiveShadow = true;
    parkGroup.add(nsParkPath);

    for (const pz of [70.0, 104.0, 138.0]) {
      const ewPath = new THREE.Mesh(new THREE.BoxGeometry(57.2, 0.08, pz === 104.0 ? 4.8 : 3.4), parkPathMat);
      ewPath.position.set(2.6, 0.058, pz);
      ewPath.receiveShadow = true;
      parkGroup.add(ewPath);
    }

    // Vạch qua đường đi bộ nối từ đường vào Chùa Vĩnh Tràng sang Công Viên Văn Hóa Vĩnh Tràng
    const zebraMat = new THREE.MeshStandardMaterial({ color: 0xF3F0E6, roughness: 0.72 });
    for (const cz of [70.0, 104.0, 138.0]) {
      for (let zi = -2; zi <= 2; zi++) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.025, 0.42), zebraMat);
        stripe.position.set(34.5, 0.04, cz + zi * 0.78);
        parkGroup.add(stripe);
      }
    }

    // Bảng chỉ dẫn bên trong cổng chính Công Viên Văn Hóa Vĩnh Tràng
    const gatePlinth = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.05, 3.8), M.stoneLight);
    gatePlinth.position.set(27.8, 0.52, 95.8);
    gatePlinth.castShadow = true;
    parkGroup.add(gatePlinth);
    const parkMapBoard = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 1.18, 3.5),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('CÔNG VIÊN VĂN HÓA VĨNH TRÀNG\nĐẠI TƯỢNG PHẬT · HỒ SEN · NHÀ THỦY TẠ', {
          w: 1080, h: 320, bg: '#1D4D33', border: '#E8C563', color: '#FFF9E8', size: 36
        }),
        roughness: 0.44
      })
    );
    parkMapBoard.position.set(27.8, 1.62, 95.8);
    parkGroup.add(parkMapBoard);

    // HỒ SEN CẢNH QUAN MIỀN TÂY + CẦU GỖ VÒNG CUNG (thay thế hoàn toàn khu tập thể dục xanh-vàng lạc tông!)
    const parkPondX = 16.5;
    const parkPondZ = 84.5;
    const parkPondRim = new THREE.Mesh(new THREE.CylinderGeometry(8.2, 8.6, 0.36, 28), M.stoneLight);
    parkPondRim.scale.set(1.0, 1.0, 1.22);
    parkPondRim.position.set(parkPondX, 0.18, parkPondZ);
    parkPondRim.receiveShadow = true;
    parkGroup.add(parkPondRim);

    const parkPondWater = new THREE.Mesh(
      new THREE.CylinderGeometry(7.55, 7.55, 0.3, 28),
      M.pondWater
    );
    parkPondWater.scale.set(1.0, 1.0, 1.22);
    parkPondWater.position.set(parkPondX, 0.24, parkPondZ);
    parkGroup.add(parkPondWater);

    // Lá sen & hoa sen hồng nở trên mặt hồ công viên
    for (let li = 0; li < 16; li++) {
      const la = (li / 16) * Math.PI * 2;
      const lr = 2.6 + (li % 3) * 1.65;
      const lx = parkPondX + Math.cos(la) * lr;
      const lz = parkPondZ + Math.sin(la) * lr * 1.12;
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.03, 12), M.lotusLeaf);
      pad.position.set(lx, 0.41, lz);
      parkGroup.add(pad);
      if (li % 3 === 0) {
        const fl = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), lotusPetalMat);
        fl.position.set(lx, 0.52, lz);
        parkGroup.add(fl);
      }
    }

    // Cầu gỗ cong sơn nâu gụ bắc ngang hồ sen công viên
    const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.16, 15.8), M.darkWood);
    bridgeDeck.position.set(parkPondX, 0.62, parkPondZ);
    bridgeDeck.castShadow = true;
    parkGroup.add(bridgeDeck);
    for (const sgn of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 15.6), M.redColumn);
      rail.position.set(parkPondX + sgn * 0.98, 1.28, parkPondZ);
      parkGroup.add(rail);
      for (let bp = -3; bp <= 3; bp++) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.72, 0.11), M.darkWood);
        post.position.set(parkPondX + sgn * 0.98, 0.96, parkPondZ + bp * 2.4);
        parkGroup.add(post);
      }
    }

    // NHÀ THỦY TẠ BÁT GIÁC 2 TẦNG MÁI NGÓI ĐỎ TRUYỀN THỐNG (x = -8.5, z = 82.0)
    const gazebo = new THREE.Group();
    gazebo.position.set(-8.5, 0, 82.0);
    const gzBase = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 5.2, 0.44, 8), M.stoneLight);
    gzBase.position.y = 0.22;
    gzBase.receiveShadow = true;
    gazebo.add(gzBase);
    for (let gi = 0; gi < 8; gi++) {
      const ga = (gi / 8) * Math.PI * 2;
      const gPlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.24, 8), M.stoneDark);
      gPlinth.position.set(Math.cos(ga) * 3.7, 0.54, Math.sin(ga) * 3.7);
      gazebo.add(gPlinth);
      const gCol = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 3.25, 10), M.redColumn);
      gCol.position.set(Math.cos(ga) * 3.7, 2.25, Math.sin(ga) * 3.7);
      gCol.castShadow = true;
      gazebo.add(gCol);
    }
    const gzRoofLower = new THREE.Mesh(new THREE.ConeGeometry(5.5, 1.55, 8), M.roofTile);
    gzRoofLower.position.y = 4.45;
    gzRoofLower.castShadow = true;
    gazebo.add(gzRoofLower);
    const gzUpperNeck = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 2.3, 0.65, 8), M.redColumn);
    gzUpperNeck.position.y = 5.25;
    gazebo.add(gzUpperNeck);
    const gzRoofUpper = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.45, 8), M.roofTile);
    gzRoofUpper.position.y = 6.22;
    gzRoofUpper.castShadow = true;
    gazebo.add(gzRoofUpper);
    const gzFinial = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), M.goldAccent);
    gzFinial.position.y = 7.05;
    gazebo.add(gzFinial);
    const gzBench = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.24, 6, 8), M.stoneLight);
    gzBench.rotation.x = Math.PI / 2;
    gzBench.position.y = 0.78;
    gazebo.add(gzBench);
    parkGroup.add(gazebo);

    // Hàng cau vua & dừa kiểng miền Tây thanh mảnh dọc lối vào công viên và quanh hồ sen
    const addParkPalm = (px, pz, h = 6.4) => {
      const pg = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.18, h, 8), M.trunk);
      trunk.position.y = h * 0.5;
      trunk.castShadow = true;
      pg.add(trunk);
      for (let fi = 0; fi < 7; fi++) {
        const fa = (fi / 7) * Math.PI * 2;
        const frond = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.06, 2.35), M.foliageLight);
        frond.position.set(Math.cos(fa) * 0.98, h + 0.15, Math.sin(fa) * 0.98);
        frond.rotation.y = -fa + Math.PI / 2;
        frond.rotation.x = 0.34;
        pg.add(frond);
      }
      pg.position.set(px, 0, pz);
      parkGroup.add(pg);
    };
    [
      [25.6, 66.5, 6.4], [25.6, 74.0, 6.0], [25.6, 100.5, 6.6],
      [25.6, 108.5, 6.2], [25.6, 134.5, 6.4], [25.6, 142.0, 6.0],
      [5.5, 74.0, 6.2], [5.5, 95.0, 6.4], [3.5, 142.0, 6.2], [12.5, 142.0, 5.9],
      [-18.0, 74.0, 6.6], [-18.0, 106.0, 6.4], [-18.0, 138.0, 6.2]
    ].forEach(([px, pz, h]) => addParkPalm(px, pz, h));

    this.exteriorGroup.add(parkGroup);

    // Ghế đá công viên, đèn cầu cổ điển & cây bóng mát xanh rợp khắp Công viên Văn hóa Vĩnh Tràng
    [
      [21.5, 67.4, 0], [15.5, 72.6, Math.PI],
      [plazaX - 13.0, plazaZ - 4.2, Math.PI * 0.35],
      [plazaX + 13.0, plazaZ - 4.2, -Math.PI * 0.35],
      [plazaX - 13.0, plazaZ + 4.2, Math.PI * 0.65],
      [plazaX + 13.0, plazaZ + 4.2, -Math.PI * 0.65],
      [24.5, 101.2, 0], [24.5, 108.4, Math.PI],
      [21.5, 135.4, 0], [15.5, 140.6, Math.PI],
      [4.2, 84.0, Math.PI / 2], [11.8, 124.0, -Math.PI / 2],
      [15.0, 58.2, 0], [-2.0, 58.2, 0]
    ].forEach(([bx, bz, ry]) => addParkStoneBench(bx, bz, ry));

    [
      [28.5, 67.4], [28.5, 72.6], [28.5, 100.8], [28.5, 107.2], [28.5, 135.4], [28.5, 140.6],
      [plazaX - 12.2, plazaZ - 8.2], [plazaX + 12.2, plazaZ - 8.2],
      [plazaX - 12.2, plazaZ + 8.2], [plazaX + 12.2, plazaZ + 8.2],
      [6.0, 62.0], [11.0, 154.0], [16.5, 96.5]
    ].forEach(([lx, lz]) => addUrbanParkLamp(lx, lz, 4.6));

    [
      [-18.0, 62.0, 1.18], [-3.0, 63.5, 1.14], [17.5, 63.0, 1.10],
      [-18.0, 92.0, 1.22], [-18.0, 122.0, 1.18], [-5.5, 122.5, 1.14], [20.5, 124.0, 1.16],
      [-17.5, 152.0, 1.18], [-4.0, 154.0, 1.12], [20.5, 152.5, 1.15],
      [19.0, 162.5, 1.08], [-10.0, 163.0, 1.10]
    ].forEach(([tx, tz, sc]) => addUrbanShadeTree(tx, tz, sc, false));

    // =========================================================================================
    // 2. KHU DÂN CƯ NHÀ VƯỜN XÃ MỸ PHONG · TP. MỸ THO XUNG QUANH CHÙA VĨNH TRÀNG
    //    Thay tường nhà phố 3 tầng san sát bằng nhà vườn miền Tây 1–2 tầng mái ngói/mái xanh,
    //    xen kẽ vườn dừa, cây ăn trái đặc trưng vùng Mỹ Tho quanh Chùa Vĩnh Tràng thực tế!
    // =========================================================================================
    const urbanTownhouses = [
      // DỌC LỀ ĐÔNG ĐƯỜNG VÀO CHÙA (quán giải khát, hoa tươi, tạp hóa 1–2 tầng thân thiện miền Tây)
      [57.2, 52.5, 9.6, 9.8, 1, -Math.PI / 2, { colorIdx: 0, roofIdx: 0, glassFront: true, awningColor: 0x1E6A46, sign: 'CÀ PHÊ · GIẢI KHÁT', signBg: '#1D5C3B' }],
      [57.2, 63.8, 9.6, 9.8, 2, -Math.PI / 2, { colorIdx: 2, roofIdx: 1, glassFront: false, awningColor: 0x8F2D24, sign: 'HOA TƯƠI · NHANG ĐÈN', signBg: '#8F2D24' }],
      [57.2, 146.5, 9.8, 9.8, 1, -Math.PI / 2, { colorIdx: 1, roofIdx: 0, glassFront: true, awningColor: 0x266A46, sign: 'NƯỚC DỪA XIÊM · GIẢI KHÁT', signBg: '#1D5C3B' }],
      [57.2, 158.0, 9.6, 9.8, 2, -Math.PI / 2, { colorIdx: 4, roofIdx: 1, glassFront: false, awningColor: 0x2F6E4E, sign: 'TẠP HÓA MỸ PHONG', signBg: '#255F40' }],
      [57.2, 169.5, 9.6, 9.8, 1, -Math.PI / 2, { colorIdx: 3, roofIdx: 0, glassFront: true, awningColor: 0x7A4922, sign: 'QUÁN CHAY · NƯỚC MÁT', signBg: '#6B3E1C' }],
      [57.2, 182.0, 9.8, 9.8, 2, -Math.PI / 2, { colorIdx: 5, roofIdx: 0, glassFront: true, awningColor: 0x6E241C, sign: 'VẬT PHẨM PHẬT GIÁO', signBg: '#6E241C' }],

      // PHÍA NAM CÔNG VIÊN VĂN HÓA VĨNH TRÀNG (nhà vườn & quán hủ tiếu Mỹ Tho 1–2 tầng)
      [25.2, 176.5, 9.8, 9.6, 1, Math.PI / 2, { colorIdx: 2, roofIdx: 0, glassFront: true, awningColor: 0x22577A, sign: 'CÀ PHÊ VƯỜN · ĐIỂM TÂM', signBg: '#22577A' }],
      [25.2, 188.0, 9.8, 9.6, 2, Math.PI / 2, { colorIdx: 1, roofIdx: 1, glassFront: true, awningColor: 0x8F3426, sign: 'HỦ TIẾU MỸ THO', signBg: '#7E261C' }],

      // PHÍA TÂY CÔNG VIÊN (nhà vườn miền Tây 1–2 tầng thoáng đãng xen giữa vườn cây thay vì bức tường 3 tầng)
      [-39.5, 68.0, 10.6, 9.4, 1, Math.PI / 2, { colorIdx: 0, roofIdx: 0, glassFront: false, awningColor: 0x1E6A46 }],
      [-39.5, 90.0, 10.8, 9.4, 2, Math.PI / 2, { colorIdx: 3, roofIdx: 1, glassFront: false, awningColor: 0x7A4922 }],
      [-39.5, 114.0, 10.6, 9.4, 1, Math.PI / 2, { colorIdx: 1, roofIdx: 0, glassFront: false, awningColor: 0x266A46 }],
      [-39.5, 138.0, 10.8, 9.4, 2, Math.PI / 2, { colorIdx: 2, roofIdx: 1, glassFront: false, awningColor: 0x8F3426 }],
      [-39.5, 160.0, 10.6, 9.4, 1, Math.PI / 2, { colorIdx: 0, roofIdx: 0, glassFront: false, awningColor: 0x1E6A46 }],

      // MẶT ĐƯỜNG NGUYỄN TRUNG TRỰC PHÍA NAM (nhà phố 2 tầng nhẹ nhàng không áp bức chân trời)
      [-14.0, 221.5, 11.4, 9.8, 2, Math.PI, { colorIdx: 2, roofIdx: 1 }],
      [2.0, 221.5, 11.6, 9.8, 1, Math.PI, { colorIdx: 0, roofIdx: 0 }],
      [18.0, 221.5, 11.4, 9.8, 2, Math.PI, { colorIdx: 1, roofIdx: 0, glassFront: true, sign: 'NHÀ HÀNG CHAY', signBg: '#1D5C3B' }],
      [36.0, 221.5, 11.8, 9.8, 2, Math.PI, { colorIdx: 3, roofIdx: 1, glassFront: true, sign: 'ĐẶC SẢN TIỀN GIANG', signBg: '#1D5C3B' }],
      [54.0, 221.5, 11.6, 9.8, 2, Math.PI, { colorIdx: 0, roofIdx: 0, glassFront: true, sign: 'CÀ PHÊ MỸ THO', signBg: '#6B3E1C' }],
      [72.0, 221.5, 11.4, 9.8, 1, Math.PI, { colorIdx: 5, roofIdx: 1 }],

      // NHÀ VƯỜN XÃ MỸ PHONG BAO QUANH 3 MẶT TÂY – ĐÔNG – BẮC CHÙA VĨNH TRÀNG (1 tầng mái ngói giữa vườn cây ăn trái!)
      [-82.0, 36.0, 10.2, 9.2, 1, Math.PI / 2, { colorIdx: 1, roofIdx: 0 }],
      [-82.0, 2.0, 10.4, 9.2, 1, Math.PI / 2, { colorIdx: 0, roofIdx: 0 }],
      [-82.0, -34.0, 10.2, 9.2, 1, Math.PI / 2, { colorIdx: 2, roofIdx: 0 }],
      [82.0, 22.0, 10.2, 9.2, 1, -Math.PI / 2, { colorIdx: 1, roofIdx: 0 }],
      [82.0, -14.0, 10.4, 9.2, 1, -Math.PI / 2, { colorIdx: 3, roofIdx: 0 }],
      [82.0, -46.0, 10.2, 9.2, 1, -Math.PI / 2, { colorIdx: 0, roofIdx: 0 }],
      [-32.0, -86.0, 10.8, 9.4, 1, 0, { colorIdx: 2, roofIdx: 0 }],
      [6.0, -88.0, 11.0, 9.4, 1, 0, { colorIdx: 0, roofIdx: 0 }],
      [42.0, -86.0, 10.8, 9.4, 1, 0, { colorIdx: 3, roofIdx: 0 }]
    ];
    for (const args of urbanTownhouses) addUrbanTownhouse(...args);

    // Vườn cây ăn trái & hàng dừa xanh mướt xã Mỹ Phong bao quanh chùa & công viên
    [
      [-37.5, 79.0, 1.24], [-37.5, 102.0, 1.28], [-37.5, 126.0, 1.22], [-37.5, 149.0, 1.26],
      [-75.0, 18.0, 1.32], [-75.0, -18.0, 1.35], [-75.0, -52.0, 1.28],
      [75.0, 6.0, 1.30], [75.0, -30.0, 1.32], [75.0, -60.0, 1.26],
      [-14.0, -82.0, 1.34], [24.0, -82.0, 1.32], [-52.0, -78.0, 1.28]
    ].forEach(([ox, oz, sc]) => addUrbanShadeTree(ox, oz, sc, false));

    // Urban Shade Trees neatly lining BOTH sides of the 170m straight approach road!
    // West side (Công viên Vĩnh Tràng promenade, x = 32.2) — keeps park sign (z=61.5) & entrances (z=70,104,138) clear
    for (const wz of [54.6, 66.8, 79, 93, 115, 129, 147, 161, 175, 189]) {
      addUrbanShadeTree(32.2, wz, 0.92, true);
    }
    // East side (urban sidewalk, x = 48.6) — skips open parking driveway z = 102..138
    for (const ez of [56, 68, 82, 96, 144, 158, 172, 186]) {
      addUrbanShadeTree(48.6, ez, 0.88, true);
    }

    // Modern Urban Streetlight Poles + Overhead Service Lines neatly aligned down the East edge (x = 48.0) of the 170m straight road!
    const wirePoleMat = new THREE.MeshStandardMaterial({ color: 0x8F9499, roughness: 0.72, metalness: 0.25 });
    const wireMat = new THREE.LineBasicMaterial({ color: 0x3A3D42, transparent: true, opacity: 0.42 });
    const poleZs = [52, 72, 92, 112, 132, 152, 172, 192];
    for (let i = 0; i < poleZs.length; i++) {
      const pz = poleZs[i];
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 8.2, 8), wirePoleMat);
      pole.position.set(48.0, 4.1, pz);
      this.exteriorGroup.add(pole);
      // Curved urban LED streetlamp arm extending West over the straight approach road
      const lampArm = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.1, 0.1), wirePoleMat);
      lampArm.position.set(47.1, 7.85, pz);
      this.exteriorGroup.add(lampArm);
      const lampHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.1, 0.32),
        new THREE.MeshStandardMaterial({ color: 0xECEEF0, emissive: 0xFFF3D1, emissiveIntensity: 0.35 })
      );
      lampHead.position.set(46.25, 7.78, pz);
      this.exteriorGroup.add(lampHead);
      if (i > 0) {
        const prevZ = poleZs[i - 1];
        for (const wx of [47.82, 48.18]) {
          const pts = [
            new THREE.Vector3(wx, 7.45, prevZ),
            new THREE.Vector3(wx, 7.08, (prevZ + pz) * 0.5),
            new THREE.Vector3(wx, 7.45, pz)
          ];
          this.exteriorGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wireMat));
        }
      }
    }

    // Vinh Trang frontage transport: private cars stop in the roadside lay-by;
    // motorbikes enter through the open right-side gate and park inside the compound.
    const vehicleTireMat = new THREE.MeshStandardMaterial({ color: 0x202326, roughness: 0.94 });
    const vehicleRimMat = new THREE.MeshStandardMaterial({ color: 0xAEB8BE, metalness: 0.78, roughness: 0.26 });
    const vehicleChromeMat = new THREE.MeshStandardMaterial({ color: 0xB8C0C5, metalness: 0.76, roughness: 0.24 });
    const vehicleGlassMat = new THREE.MeshStandardMaterial({ color: 0x263B47, metalness: 0.22, roughness: 0.17 });
    const vehicleLampMat = new THREE.MeshStandardMaterial({
      color: 0xF7F1D9, emissive: 0xD9C58A, emissiveIntensity: 0.18, roughness: 0.25
    });
    const vehicleAmberMat = new THREE.MeshStandardMaterial({ color: 0xE69B36, emissive: 0x8A4A12, emissiveIntensity: 0.12 });
    const vehicleTailMat = new THREE.MeshStandardMaterial({ color: 0xA62922, emissive: 0x65100C, emissiveIntensity: 0.16 });
    const vehicleBlackMat = new THREE.MeshStandardMaterial({ color: 0x25282A, roughness: 0.84 });
    const vehiclePlateMat = new THREE.MeshStandardMaterial({ color: 0xE9ECEB, roughness: 0.48 });

    const addVehicleBeam = (parent, a, b, radius, material, radialSegments = 8) => {
      const direction = new THREE.Vector3().subVectors(b, a);
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, direction.length(), radialSegments),
        material
      );
      beam.position.copy(a).add(b).multiplyScalar(0.5);
      beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
      parent.add(beam);
      return beam;
    };

    // Detailed Vietnamese automatic scooter: molded fairings, alloy wheels, fork, mirrors, lamps and exhaust.
    const buildParkedMotorbike = (mx, mz, yaw = Math.PI, bodyColor = 0x9C2C26) => {
      const mg = new THREE.Group();
      const paintMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.34, metalness: 0.2 });
      const darkPaintMat = new THREE.MeshStandardMaterial({ color: 0x34383B, roughness: 0.48, metalness: 0.16 });
      const seatMat = new THREE.MeshStandardMaterial({ color: 0x211F1D, roughness: 0.76 });
      const wheelRadius = 0.265;
      const wheelGroups = [];

      const addWheel = (wheelZ) => {
        const wheelGroup = new THREE.Group();
        wheelGroup.position.set(0, wheelRadius + 0.015, wheelZ);
        mg.add(wheelGroup);
        wheelGroups.push(wheelGroup);

        const tire = new THREE.Mesh(new THREE.TorusGeometry(wheelRadius - 0.015, 0.048, 9, 22), vehicleTireMat);
        tire.rotation.y = Math.PI / 2;
        tire.castShadow = true;
        wheelGroup.add(tire);

        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.178, 0.178, 0.145, 18), vehicleRimMat);
        rim.rotation.z = Math.PI / 2;
        wheelGroup.add(rim);

        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.17, 12), vehicleChromeMat);
        hub.rotation.z = Math.PI / 2;
        wheelGroup.add(hub);

        for (const side of [-1, 1]) {
          for (let spoke = 0; spoke < 8; spoke++) {
            const angle = (spoke / 8) * Math.PI * 2;
            const a = new THREE.Vector3(side * 0.09, 0, 0);
            const b = new THREE.Vector3(
              side * 0.09,
              Math.cos(angle) * 0.135,
              Math.sin(angle) * 0.135
            );
            addVehicleBeam(wheelGroup, a, b, 0.009, vehicleRimMat, 5);
          }
        }
      };

      addWheel(0.66);
      addWheel(-0.66);

      // One-piece sculpted side profile; extrusion creates the scooter's real body volume.
      const shellShape = new THREE.Shape();
      shellShape.moveTo(-0.72, 0.36);
      shellShape.quadraticCurveTo(-0.65, 0.46, -0.52, 0.76);
      shellShape.quadraticCurveTo(-0.43, 0.99, -0.19, 1.02);
      shellShape.quadraticCurveTo(0.12, 1.02, 0.39, 0.88);
      shellShape.quadraticCurveTo(0.63, 0.76, 0.70, 0.53);
      shellShape.quadraticCurveTo(0.73, 0.41, 0.58, 0.37);
      shellShape.lineTo(-0.58, 0.34);
      shellShape.closePath();
      const shellGeometry = new THREE.ExtrudeGeometry(shellShape, {
        depth: 0.43, bevelEnabled: true, bevelSegments: 3,
        steps: 1, bevelSize: 0.035, bevelThickness: 0.035, curveSegments: 10
      });
      shellGeometry.translate(0, 0, -0.215);
      shellGeometry.rotateY(-Math.PI / 2);
      const shell = new THREE.Mesh(shellGeometry, paintMat);
      shell.castShadow = true;
      shell.receiveShadow = true;
      mg.add(shell);

      const footboard = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.12, 0.62), vehicleBlackMat);
      footboard.position.set(0, 0.43, -0.02);
      mg.add(footboard);
      const sidePanel = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), darkPaintMat);
      sidePanel.scale.set(0.22, 0.19, 0.34);
      sidePanel.position.set(0.19, 0.56, -0.23);
      mg.add(sidePanel);

      // Engine casing, rear swingarm and twin front fork legs.
      const engine = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), vehicleChromeMat);
      engine.scale.set(0.18, 0.17, 0.24);
      engine.position.set(0.19, 0.39, -0.34);
      mg.add(engine);
      addVehicleBeam(mg, new THREE.Vector3(0, 0.34, -0.64), new THREE.Vector3(0.12, 0.55, -0.28), 0.035, vehicleBlackMat);
      for (const side of [-1, 1]) {
        addVehicleBeam(
          mg,
          new THREE.Vector3(side * 0.105, 0.29, 0.66),
          new THREE.Vector3(side * 0.12, 0.84, 0.48),
          0.035,
          vehicleChromeMat
        );
        addVehicleBeam(
          mg,
          new THREE.Vector3(side * 0.17, 0.32, -0.52),
          new THREE.Vector3(side * 0.17, 0.77, -0.36),
          0.026,
          vehicleChromeMat
        );
      }

      const frontMudguard = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 9), paintMat);
      frontMudguard.scale.set(0.29, 0.105, 0.39);
      frontMudguard.position.set(0, 0.54, 0.65);
      mg.add(frontMudguard);

      // Seat and rear grab rail.
      const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.12, 0.58), vehicleBlackMat);
      seatBase.position.set(0, 0.84, -0.22);
      mg.add(seatBase);
      const seat = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), seatMat);
      seat.scale.set(0.205, 0.09, 0.39);
      seat.position.set(0, 0.92, -0.2);
      mg.add(seat);
      addVehicleBeam(mg, new THREE.Vector3(-0.17, 0.89, -0.53), new THREE.Vector3(-0.17, 0.96, -0.72), 0.018, vehicleChromeMat);
      addVehicleBeam(mg, new THREE.Vector3(0.17, 0.89, -0.53), new THREE.Vector3(0.17, 0.96, -0.72), 0.018, vehicleChromeMat);
      addVehicleBeam(mg, new THREE.Vector3(-0.17, 0.96, -0.72), new THREE.Vector3(0.17, 0.96, -0.72), 0.018, vehicleChromeMat);

      // Handlebar, rear-view mirrors, headlamp and turn signals.
      const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.58, 8), vehicleChromeMat);
      handlebar.rotation.z = Math.PI / 2;
      handlebar.position.set(0, 1.02, 0.46);
      mg.add(handlebar);
      for (const side of [-1, 1]) {
        addVehicleBeam(
          mg,
          new THREE.Vector3(side * 0.19, 1.04, 0.46),
          new THREE.Vector3(side * 0.32, 1.34, 0.52),
          0.012,
          vehicleChromeMat
        );
        const mirror = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), vehicleBlackMat);
        mirror.scale.set(0.105, 0.065, 0.035);
        mirror.position.set(side * 0.32, 1.37, 0.52);
        mg.add(mirror);
        const indicator = new THREE.Mesh(new THREE.SphereGeometry(0.055, 9, 7), vehicleAmberMat);
        indicator.scale.set(1.1, 0.7, 0.6);
        indicator.position.set(side * 0.22, 0.76, 0.73);
        mg.add(indicator);
      }
      const headlamp = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), vehicleLampMat);
      headlamp.scale.set(0.13, 0.095, 0.045);
      headlamp.position.set(0, 0.84, 0.755);
      mg.add(headlamp);
      const tailLamp = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), vehicleTailMat);
      tailLamp.scale.set(1, 0.75, 0.6);
      tailLamp.position.set(0, 0.78, -0.72);
      mg.add(tailLamp);

      // Exhaust silencer and registration plate.
      const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.55, 10), vehicleBlackMat);
      exhaust.rotation.x = Math.PI / 2;
      exhaust.position.set(0.25, 0.34, -0.43);
      mg.add(exhaust);
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.025), vehiclePlateMat);
      plate.position.set(0, 0.52, -0.77);
      mg.add(plate);

      mg.position.set(mx, 0, mz);
      mg.rotation.y = yaw;
      mg.userData.wheelGroups = wheelGroups;
      mg.userData.ownedMaterials = [paintMat, darkPaintMat, seatMat];
      this.exteriorGroup.add(mg);
      return mg;
    };

    // Compact sedan / passenger van with separate cabin, glazing, alloy wheels and road lights.
    const buildRoadCar = (cx, cz, yaw, bodyColor, kind = 'sedan') => {
      const isVan = kind === 'van';
      const halfLength = isVan ? 2.68 : 2.38;
      const bodyWidth = isVan ? 1.94 : 1.86;
      const bodyMat = new THREE.MeshStandardMaterial({
        color: bodyColor, roughness: 0.34, metalness: 0.28
      });
      const lowerShape = new THREE.Shape();
      lowerShape.moveTo(-halfLength, 0.43);
      lowerShape.quadraticCurveTo(-halfLength - 0.04, 0.48, -halfLength, 0.72);
      lowerShape.lineTo(-halfLength + 0.18, 1.02);
      lowerShape.quadraticCurveTo(-halfLength + 0.34, 1.14, -halfLength + 0.62, 1.14);
      lowerShape.lineTo(halfLength - 0.38, 1.14);
      lowerShape.quadraticCurveTo(halfLength, 1.10, halfLength, 0.82);
      lowerShape.lineTo(halfLength, 0.58);
      lowerShape.quadraticCurveTo(halfLength - 0.08, 0.43, halfLength - 0.28, 0.43);
      lowerShape.closePath();
      const lowerGeometry = new THREE.ExtrudeGeometry(lowerShape, {
        depth: bodyWidth, bevelEnabled: true, bevelSegments: 3,
        steps: 1, bevelSize: 0.055, bevelThickness: 0.04, curveSegments: 10
      });
      lowerGeometry.translate(0, 0, -bodyWidth / 2);
      lowerGeometry.rotateY(-Math.PI / 2);
      const lowerBody = new THREE.Mesh(lowerGeometry, bodyMat);
      lowerBody.castShadow = true;
      lowerBody.receiveShadow = true;
      const cg = new THREE.Group();
      cg.add(lowerBody);

      const cabinShape = new THREE.Shape();
      if (isVan) {
        cabinShape.moveTo(-2.02, 1.10);
        cabinShape.quadraticCurveTo(-2.0, 1.55, -1.88, 2.02);
        cabinShape.lineTo(1.78, 2.02);
        cabinShape.quadraticCurveTo(2.12, 1.83, 2.38, 1.10);
      } else {
        cabinShape.moveTo(-1.34, 1.10);
        cabinShape.lineTo(-0.82, 1.83);
        cabinShape.quadraticCurveTo(-0.72, 1.91, -0.54, 1.91);
        cabinShape.lineTo(0.74, 1.91);
        cabinShape.quadraticCurveTo(0.92, 1.91, 1.02, 1.78);
        cabinShape.lineTo(1.42, 1.10);
      }
      cabinShape.closePath();
      const cabinGeometry = new THREE.ExtrudeGeometry(cabinShape, {
        depth: bodyWidth - 0.22, bevelEnabled: true, bevelSegments: 3,
        steps: 1, bevelSize: 0.035, bevelThickness: 0.03, curveSegments: 10
      });
      cabinGeometry.translate(0, 0, -(bodyWidth - 0.22) / 2);
      cabinGeometry.rotateY(-Math.PI / 2);
      const cabin = new THREE.Mesh(cabinGeometry, bodyMat);
      cabin.castShadow = true;
      cg.add(cabin);

      const axleZ = isVan ? 1.82 : 1.52;
      const wheelGroups = [];
      for (const side of [-1, 1]) {
        for (const wheelZ of [-axleZ, axleZ]) {
          const wheelGroup = new THREE.Group();
          wheelGroup.position.set(side * (bodyWidth / 2 + 0.015), 0.405, wheelZ);
          cg.add(wheelGroup);
          wheelGroups.push(wheelGroup);

          const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.365, 0.365, 0.25, 20), vehicleTireMat);
          tire.rotation.z = Math.PI / 2;
          tire.castShadow = true;
          wheelGroup.add(tire);
          const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.265, 18), vehicleRimMat);
          rim.rotation.z = Math.PI / 2;
          wheelGroup.add(rim);
          const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.28, 12), vehicleChromeMat);
          hub.rotation.z = Math.PI / 2;
          wheelGroup.add(hub);
        }
      }

      // Tinted side windows: two per side on the sedan, three on the passenger van.
      const sideWindowZs = isVan ? [-1.22, -0.12, 0.98] : [-0.53, 0.52];
      for (const side of [-1, 1]) {
        for (const wz of sideWindowZs) {
          const windowMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.028, isVan ? 0.64 : 0.48, isVan ? 0.86 : 0.91),
            vehicleGlassMat
          );
          windowMesh.position.set(side * (bodyWidth / 2 + 0.012), isVan ? 1.64 : 1.52, wz);
          cg.add(windowMesh);
        }
        // Door seams, handles and side mirrors.
        const doorSeam = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.55, 0.018), vehicleBlackMat);
        doorSeam.position.set(side * (bodyWidth / 2 + 0.02), 0.88, isVan ? -0.55 : -0.02);
        cg.add(doorSeam);
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.055, 0.22), vehicleChromeMat);
        handle.position.set(side * (bodyWidth / 2 + 0.03), 1.08, isVan ? -0.35 : -0.18);
        cg.add(handle);
        const mirrorStem = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.12), vehicleChromeMat);
        mirrorStem.position.set(side * (bodyWidth / 2 + 0.08), 1.35, 0.92);
        cg.add(mirrorStem);
        const mirror = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), vehicleBlackMat);
        mirror.scale.set(1.2, 0.7, 0.55);
        mirror.position.set(side * (bodyWidth / 2 + 0.14), 1.39, 0.98);
        cg.add(mirror);
      }

      const windshield = new THREE.Mesh(
        new THREE.PlaneGeometry(bodyWidth - 0.34, isVan ? 0.74 : 0.62),
        vehicleGlassMat
      );
      windshield.position.set(0, isVan ? 1.57 : 1.48, isVan ? 2.15 : 1.18);
      windshield.rotation.x = isVan ? -0.24 : -0.58;
      cg.add(windshield);
      const rearGlass = new THREE.Mesh(
        new THREE.PlaneGeometry(bodyWidth - 0.38, isVan ? 0.66 : 0.56),
        vehicleGlassMat
      );
      rearGlass.position.set(0, isVan ? 1.56 : 1.48, isVan ? -1.9 : -1.18);
      rearGlass.rotation.x = isVan ? 0.16 : 0.55;
      cg.add(rearGlass);

      const frontZ = halfLength + 0.025;
      const rearZ = -halfLength - 0.025;
      const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth * 0.9, 0.13, 0.13), vehicleChromeMat);
      frontBumper.position.set(0, 0.52, frontZ);
      cg.add(frontBumper);
      const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth * 0.9, 0.13, 0.13), vehicleChromeMat);
      rearBumper.position.set(0, 0.52, rearZ);
      cg.add(rearBumper);
      const grille = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.19, 0.045), vehicleBlackMat);
      grille.position.set(0, 0.79, frontZ + 0.035);
      cg.add(grille);
      for (const side of [-1, 1]) {
        const headlight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.17, 0.07), vehicleLampMat);
        headlight.position.set(side * 0.62, 0.91, frontZ + 0.035);
        cg.add(headlight);
        const tailLight = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.07), vehicleTailMat);
        tailLight.position.set(side * 0.67, 0.88, rearZ - 0.025);
        cg.add(tailLight);
        const indicator = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.055), vehicleAmberMat);
        indicator.position.set(side * 0.79, 0.78, frontZ + 0.035);
        cg.add(indicator);
      }
      const frontPlate = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.13, 0.025), vehiclePlateMat);
      frontPlate.position.set(0, 0.63, frontZ + 0.05);
      cg.add(frontPlate);
      const rearPlate = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.025), vehiclePlateMat);
      rearPlate.position.set(0, 0.64, rearZ - 0.05);
      cg.add(rearPlate);

      if (isVan) {
        // Simple roof rails identify a local passenger shuttle without turning it into a tour coach.
        for (const side of [-1, 1]) {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 3.1), vehicleChromeMat);
          rail.position.set(side * 0.66, 2.08, -0.02);
          cg.add(rail);
        }
      }

      cg.position.set(cx, 0, cz);
      cg.rotation.y = yaw;
      cg.userData.wheelGroups = wheelGroups;
      cg.userData.ownedMaterials = [bodyMat];
      this.exteriorGroup.add(cg);
      return cg;
    };

    // Shared vehicle factory: auto-aligns Meshy GLB long axis along local Z so vehicles NEVER turn sideways!
    const buildGLBRoadVehicle = (sceneObj, cx, cz, yaw, targetLength) => {
      const wrap = new THREE.Group();
      const inner = sceneObj.clone(true);
      inner.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
          if (o.geometry && !o.geometry.getAttribute('normal')) {
            o.geometry.computeVertexNormals();
          }
        }
      });
      // Detect natural forward/long axis before rotating: only rotate +PI/2 when model length lies along X
      const rawBox = new THREE.Box3().setFromObject(inner);
      const rawSz = new THREE.Vector3();
      rawBox.getSize(rawSz);
      if (rawSz.x > rawSz.z) {
        inner.rotation.y = Math.PI / 2;
      }
      const box = new THREE.Box3().setFromObject(inner);
      const sz = new THREE.Vector3();
      box.getSize(sz);
      const scale = targetLength / Math.max(0.1, sz.z);
      inner.scale.setScalar(scale);
      const box2 = new THREE.Box3().setFromObject(inner);
      inner.position.set(
        -(box2.min.x + box2.max.x) * 0.5,
        -box2.min.y,
        -(box2.min.z + box2.max.z) * 0.5
      );
      wrap.add(inner);
      wrap.position.set(cx, 0, cz);
      wrap.rotation.y = yaw;
      wrap.userData.wheelGroups = [];
      wrap.userData.ownedMaterials = [];
      this.exteriorGroup.add(wrap);
      return wrap;
    };
    this.buildGLBRoadVehicle = buildGLBRoadVehicle;

    this.spawnRoadTrafficVehicle = ({ kind = 'sedan', x, z, direction = 1, speed = 7, color = 0xAEB9C1 }) => {
      const yaw = direction > 0 ? Math.PI / 2 : -Math.PI / 2;
      let group;
      if (kind === 'bike') {
        group = buildParkedMotorbike(x, z, yaw, color);
      } else if (kind === 'van' && this.archMeshCache.xe_khach) {
        group = buildGLBRoadVehicle(this.archMeshCache.xe_khach, x, z, yaw, 5.8);
      } else if (kind !== 'van' && this.archMeshCache.xe_oto) {
        group = buildGLBRoadVehicle(this.archMeshCache.xe_oto, x, z, yaw, 4.45);
      } else {
        group = buildRoadCar(x, z, yaw, color, kind === 'van' ? 'van' : 'sedan');
      }
      return {
        group,
        kind,
        direction,
        speed,
        wheelRadius: kind === 'bike' ? 0.265 : 0.365,
        wheelGroups: group.userData.wheelGroups || [],
        state: 'passing'
      };
    };

    // =========================================================================================
    // 3. OUTER PARKING LOT ("BÃI GIỮ XE Ô TÔ · XE DU LỊCH") & PEAK-SEASON ROADSIDE PARKING
    //    Located outside the temple along the East flank of the 170m straight road (z = 102..138)
    //    so cars & tour buses park outside while pilgrims walk straight into Chùa Vĩnh Tràng!
    // =========================================================================================
    const parkingLineMat = new THREE.MeshBasicMaterial({ color: 0xF1EDE2 });
    const outerParkingPad = new THREE.Mesh(
      new THREE.BoxGeometry(28.0, 0.08, 36.0),
      new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xC6C2B8, roughness: 0.90 })
    );
    outerParkingPad.position.set(62.5, 0.015, 120.0);
    outerParkingPad.receiveShadow = true;
    this.exteriorGroup.add(outerParkingPad);

    // Tall Vietnamese blue-yellow parking lot signboard facing the straight approach road
    const parkLotSignGroup = new THREE.Group();
    parkLotSignGroup.position.set(49.2, 0, 102.6);
    for (const px of [-1.45, 1.45]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 3.6, 8), wirePoleMat);
      post.position.set(px, 1.8, 0);
      parkLotSignGroup.add(post);
    }
    const parkLotBoard = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 1.15, 0.12),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('BÃI GIỮ XE Ô TÔ · XE DU LỊCH', {
          w: 960,
          h: 320,
          bg: '#155084',
          border: '#F7D55C',
          color: '#FFFFFF',
          size: 46
        }),
        roughness: 0.4
      })
    );
    parkLotBoard.position.set(0, 3.1, 0);
    parkLotSignGroup.add(parkLotBoard);
    parkLotSignGroup.rotation.y = -0.22;
    this.exteriorGroup.add(parkLotSignGroup);

    // Corrugated metal motorbike shelter along the back of the outer parking yard (x = 70.5, z = 106..134)
    const bikeCanopyRoof = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 0.12, 26.0),
      new THREE.MeshStandardMaterial({ map: this.tinRoofTex, color: 0x2F5E85, roughness: 0.58, metalness: 0.2 })
    );
    bikeCanopyRoof.position.set(71.2, 2.85, 120.0);
    bikeCanopyRoof.rotation.z = -0.08;
    bikeCanopyRoof.castShadow = true;
    this.exteriorGroup.add(bikeCanopyRoof);
    for (const pz of [107.8, 116.0, 124.0, 132.2]) {
      for (const px of [68.8, 73.6]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 2.85, 8), wirePoleMat);
        col.position.set(px, 1.42, pz);
        this.exteriorGroup.add(col);
      }
    }
    for (let bi = 0; bi < 10; bi++) {
      const bz = 108.4 + bi * 2.55;
      const bColors = [0x9C2C26, 0x254E8A, 0x3D434A, 0xB89342, 0xE2DDD2];
      buildParkedMotorbike(70.8, bz, -Math.PI / 2, bColors[bi % bColors.length]);
    }

    // Parked Tour Vans & Family Sedans neatly angled inside Bãi Giữ Xe (x = 58.0, z = 107..132)
    const lotVehicleSpecs = [
      { kind: 'van', x: 58.2, z: 108.0, yaw: -Math.PI / 2, color: 0xE2E6E8, targetLength: 5.8 },
      { kind: 'van', x: 58.2, z: 116.0, yaw: -Math.PI / 2, color: 0xD2D8D9, targetLength: 5.8 },
      { kind: 'sedan', x: 58.2, z: 124.0, yaw: -Math.PI / 2, color: 0xAEB9C1, targetLength: 4.45 },
      { kind: 'sedan', x: 58.2, z: 132.0, yaw: -Math.PI / 2, color: 0xF0EEE8, targetLength: 4.45 },
      // Peak-season / Tết vehicles parked parallel along outer straight road edges (far from gate, z = 144..176)
      { kind: 'van', x: 35.8, z: 146.0, yaw: Math.PI, color: 0xDCE1E4, targetLength: 5.8 },
      { kind: 'sedan', x: 35.8, z: 156.5, yaw: Math.PI, color: 0x7A8A96, targetLength: 4.45 },
      { kind: 'sedan', x: 45.2, z: 164.0, yaw: 0, color: 0xEFECE4, targetLength: 4.45 },
      { kind: 'van', x: 35.8, z: 174.0, yaw: Math.PI, color: 0xCBD4DA, targetLength: 5.8 }
    ];
    for (const vs of lotVehicleSpecs) {
      const fb = buildRoadCar(vs.x, vs.z, vs.yaw, vs.color, vs.kind);
      this.parkedVehicleAnchors.push({
        kind: vs.kind,
        x: vs.x,
        z: vs.z,
        yaw: vs.yaw,
        targetLength: vs.targetLength,
        fallback: fb
      });
    }

    // Motorbike parking inside the pagoda grounds (beyond Cổng Phụ)
    const motorbikeParkingPad = new THREE.Mesh(
      new THREE.BoxGeometry(7.6, 0.07, 4.0),
      new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xC9C0B0, roughness: 0.9 })
    );
    motorbikeParkingPad.position.set(57.1, 0.026, 35.3);
    motorbikeParkingPad.receiveShadow = true;
    this.exteriorGroup.add(motorbikeParkingPad);
    for (const lx of [53.3, 55.2, 57.1, 59.0, 60.9]) {
      const bayLine = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.018, 3.45), parkingLineMat);
      bayLine.position.set(lx, 0.068, 35.3);
      this.exteriorGroup.add(bayLine);
    }
    buildParkedMotorbike(54.25, 35.3, Math.PI, 0x9C2C26);
    buildParkedMotorbike(56.15, 35.3, Math.PI, 0x254E8A);
    buildParkedMotorbike(58.05, 35.3, Math.PI, 0x3D434A);
    buildParkedMotorbike(59.95, 35.3, Math.PI, 0xB89342);

    // Authentic Curved Mekong Coconut Palms ("Cây dừa nghiêng"), Banana Clumps ("Bụi chuối") & Bamboo Groves ("Bụi tre")
    const trunkMat = M.trunk;
    const palmLeafMat = M.foliageLight;
    const palmInnerMat = M.foliageMid;
    const orchardMat = M.foliageDark;
    const coconutMat = new THREE.MeshStandardMaterial({ color: 0x5E8232, roughness: 0.62 });

    const addBgCoconutPalm = (px, pz, h = 9.5, lean = 0.12) => {
      const pg = new THREE.Group();
      let curX = 0;
      let curY = 0;
      const segs = 4;
      const segH = h / segs;
      for (let s = 0; s < segs; s++) {
        const tilt = lean * (s + 0.5) * 0.85;
        const rBot = 0.25 - s * 0.028;
        const rTop = 0.22 - s * 0.028;
        const tr = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, segH + 0.08, 7), trunkMat);
        tr.position.set(curX + Math.sin(tilt) * segH * 0.5, curY + segH * 0.5, 0);
        tr.rotation.z = -tilt;
        pg.add(tr);
        curX += Math.sin(tilt) * segH;
        curY += Math.cos(tilt) * segH;
      }
      for (let c = 0; c < 4; c++) {
        const ca = (c / 4) * Math.PI * 2;
        const nut = new THREE.Mesh(new THREE.SphereGeometry(0.18, 7, 6), coconutMat);
        nut.position.set(curX + Math.cos(ca) * 0.22, curY - 0.12, Math.sin(ca) * 0.22);
        pg.add(nut);
      }
      for (let fi = 0; fi < 9; fi++) {
        const a = (fi / 9) * Math.PI * 2 + lean * 2;
        const fg = new THREE.Group();
        fg.position.set(curX, curY, 0);
        fg.rotation.y = a;
        const inner = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.06, 0.56), fi % 2 === 0 ? palmLeafMat : palmInnerMat);
        inner.position.set(0.92, 0.18, 0);
        inner.rotation.z = 0.22;
        fg.add(inner);
        const outer = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.05, 0.42), palmLeafMat);
        outer.position.set(2.45, -0.15, 0);
        outer.rotation.z = -0.45;
        fg.add(outer);
        pg.add(fg);
      }
      pg.position.set(px, 0, pz);
      this.exteriorGroup.add(pg);
    };

    const addBananaClump = (bx, bz) => {
      const bg = new THREE.Group();
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x5C7E38, roughness: 0.78 });
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x62943C, roughness: 0.65, side: THREE.DoubleSide });
      const budMat = new THREE.MeshStandardMaterial({ color: 0x7A2A3B, roughness: 0.58 });
      for (let i = 0; i < 4; i++) {
        const a = i * 1.6;
        const h = 2.0 + (i % 2) * 0.7;
        const sx = Math.cos(a) * 0.34;
        const sz = Math.sin(a) * 0.34;
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, h, 7), stemMat);
        stem.position.set(sx, h / 2, sz);
        bg.add(stem);
        for (let li = 0; li < 6; li++) {
          const la = a + (li / 6) * Math.PI * 2;
          const leafGroup = new THREE.Group();
          leafGroup.position.set(sx, h - (li % 2) * 0.25, sz);
          leafGroup.rotation.y = la;
          const innerBlade = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.42), leafMat);
          innerBlade.rotation.x = -Math.PI / 2;
          innerBlade.position.set(0.55, 0.28, 0);
          innerBlade.rotation.z = 0.26;
          leafGroup.add(innerBlade);
          const outerBlade = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.36), leafMat);
          outerBlade.rotation.x = -Math.PI / 2;
          outerBlade.position.set(1.42, 0.12, 0);
          outerBlade.rotation.z = -0.32;
          leafGroup.add(outerBlade);
          bg.add(leafGroup);
        }
      }
      const bud = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 6), budMat);
      bud.position.set(0.42, 1.55, 0.18);
      bud.rotation.x = Math.PI;
      bg.add(bud);
      bg.position.set(bx, 0, bz);
      this.exteriorGroup.add(bg);
    };

    const addBambooGrove = (gx, gz) => {
      const gg = new THREE.Group();
      const bambooMat = new THREE.MeshStandardMaterial({ color: 0x769244, roughness: 0.62 });
      const bambooLeafMat = new THREE.MeshStandardMaterial({ color: 0x5B863A, roughness: 0.72, side: THREE.DoubleSide });
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const rad = 0.25 + (i % 3) * 0.24;
        const bh = 5.6 + (i % 4) * 0.95;
        const culm = new THREE.Group();
        culm.position.set(Math.cos(a) * rad, 0, Math.sin(a) * rad);
        culm.rotation.z = -Math.cos(a) * (0.1 + (i % 3) * 0.03);
        culm.rotation.x = Math.sin(a) * (0.1 + (i % 3) * 0.03);
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.072, bh, 6), bambooMat);
        stalk.position.y = bh / 2;
        culm.add(stalk);
        for (let k = 0; k < 4; k++) {
          const ly = bh * (0.58 + k * 0.11);
          const spray = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.95, 5), bambooLeafMat);
          spray.scale.set(1.25, 0.38, 0.85);
          spray.position.set(Math.cos(a + k) * 0.35, ly, Math.sin(a + k) * 0.35);
          spray.rotation.z = -0.7;
          spray.rotation.y = a + k * 1.4;
          culm.add(spray);
        }
        gg.add(culm);
      }
      gg.position.set(gx, 0, gz);
      this.exteriorGroup.add(gg);
    };

    // Keep subtle tropical garden trees strictly behind rear/side boundaries (NEVER rural bamboo/hills in front street!)
    [
      [-76, -24],
      [78, -26],
      [-74, -56],
      [76, -54]
    ].forEach(([bx, bz]) => addBananaClump(bx, bz));

    // Distant TP. Mỹ Tho urban city tree-line + subtle low-rise neighborhood skyline on the far horizon (clear of 170m approach road!)
    const skylinePalette = [0xD9D4C8, 0xCFD8DC, 0xE2D8C8, 0xC8D2CE];
    for (let i = 0; i < 64; i++) {
      const ang = (i / 64) * Math.PI * 2;
      const dist = 148 + (i % 4) * 18;
      const ox = Math.cos(ang) * dist + 15;
      const oz = Math.sin(ang) * dist + 60;
      if (oz > 38 && oz < 238 && ox > -52 && ox < 105) continue;
      if (i % 3 === 0) {
        addBgCoconutPalm(ox, oz, 8.2 + (i % 3) * 1.4, ((i % 3) - 1) * 0.08);
      } else {
        const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(3.2 + (i % 3) * 0.8, 1), orchardMat);
        canopy.scale.set(1.25, 0.72, 1.25);
        canopy.position.set(ox, 2.4, oz);
        this.exteriorGroup.add(canopy);
      }
    }
    for (let i = 0; i < 44; i++) {
      const ang = (i / 44) * Math.PI * 2 + 0.04;
      const ox = Math.cos(ang) * 238 + 15;
      const oz = Math.sin(ang) * 238 + 60;
      const bw = 11.0 + (i % 4) * 3.0;
      const bh = 7.0 + (i % 3) * 3.4;
      const bd = 9.0 + (i % 3) * 2.0;
      const bldg = new THREE.Mesh(
        new THREE.BoxGeometry(bw, bh, bd),
        new THREE.MeshStandardMaterial({ color: skylinePalette[i % skylinePalette.length], roughness: 0.9 })
      );
      bldg.position.set(ox, bh * 0.5, oz);
      bldg.rotation.y = -ang;
      this.exteriorGroup.add(bldg);
    }
  }
};
