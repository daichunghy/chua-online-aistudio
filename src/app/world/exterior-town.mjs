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
      new THREE.SphereGeometry(260, 36, 20),
      new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })
    );
    this.skyDome = skyDome;
    this.scene.add(skyDome);

    const M = this.MAT;
    const extGround = new THREE.Mesh(
      new THREE.PlaneGeometry(360, 360),
      new THREE.MeshStandardMaterial({ map: this.mekongEarthTex, color: 0xffffff, roughness: 0.96 })
    );
    extGround.rotation.x = -Math.PI / 2;
    extGround.position.y = -0.09;
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

    // Low-rise Mekong family houses beyond the frontage road and temple boundary.
    const sideBackHouses = [
      [-42, 83.5, 9.8, 7.8, 3.8, Math.PI, 0, 0, false],
      [-16, 84.5, 10.4, 8.0, 4.0, Math.PI, 1, 2, false],
      [14, 83.5, 9.6, 7.8, 3.7, Math.PI, 2, 1, false],
      [44, 84.0, 10.2, 8.0, 3.9, Math.PI, 3, 0, false],
      [-80, 26, 9.5, 8.2, 3.7, Math.PI / 2, 1, 2, false],
      [-82, -6, 10.8, 8.6, 4.0, Math.PI / 2, 0, 1, true],
      [-80, -38, 9.4, 8.0, 3.6, Math.PI / 2, 3, 2, false],
      [80, 24, 9.6, 8.0, 3.9, -Math.PI / 2, 0, 0, true],
      [82, -10, 10.8, 8.6, 4.0, -Math.PI / 2, 1, 1, false],
      [80, -42, 9.4, 8.0, 3.6, -Math.PI / 2, 3, 0, false],
      [-30, -84, 10.0, 8.2, 3.6, 0, 2, 2, false],
      [4, -86, 11.0, 8.4, 3.8, 0, 0, 1, false],
      [36, -84, 10.0, 8.0, 3.7, 0, 4, 0, false]
    ];
    for (const hArgs of sideBackHouses) addMekongCountryHouse(...hArgs);

    // No separate roadside carts: the outer approach remains a quiet residential lane.

    // Mekong Alluvial Ditch & Wooden Plank Bridge ("Mương rạch phù sa, lục bình & cầu ván")
    const addMekongCanalDitch = (cx, cz, length = 34, width = 3.2, rotY = 0) => {
      const dg = new THREE.Group();
      const bankMat = new THREE.MeshStandardMaterial({ map: this.dirtRoadTex, color: 0x6F563B, roughness: 0.94 });
      for (const side of [-1, 1]) {
        const bank = new THREE.Mesh(new THREE.BoxGeometry(length, 0.22, 1.05), bankMat);
        bank.position.set(0, -0.01, side * (width * 0.5 + 0.42));
        dg.add(bank);
      }
      const water = new THREE.Mesh(
        new THREE.PlaneGeometry(length, width),
        new THREE.MeshStandardMaterial({ color: 0x626842, roughness: 0.22, metalness: 0.3 })
      );
      water.rotation.x = -Math.PI / 2;
      water.position.y = 0.015;
      dg.add(water);
      // Floating water hyacinth ("lục bình") clusters with pale-lavender blossoms
      const hyacinthLeafMat = new THREE.MeshStandardMaterial({ color: 0x4E823E, roughness: 0.78 });
      const hyacinthFlowerMat = new THREE.MeshStandardMaterial({ color: 0xBE9CD8, roughness: 0.65 });
      for (let i = 0; i < 16; i++) {
        const hx = -length * 0.44 + (i * length * 0.88) / 15;
        const hz = ((i % 3) - 1) * (width * 0.24);
        const pad = new THREE.Mesh(new THREE.SphereGeometry(0.42, 7, 5), hyacinthLeafMat);
        pad.scale.set(1.3, 0.35, 1.1);
        pad.position.set(hx, 0.05, hz);
        dg.add(pad);
        if (i % 3 === 0) {
          const fl = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 6), hyacinthFlowerMat);
          fl.position.set(hx + 0.08, 0.19, hz);
          dg.add(fl);
        }
      }
      // Rustic wooden footbridge spanning the ditch
      for (const bx of [-0.55, 0.55]) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, width + 1.5), woodPostMat);
        beam.position.set(bx, 0.16, 0);
        dg.add(beam);
      }
      for (let pz = -width * 0.5 - 0.5; pz <= width * 0.5 + 0.5; pz += 0.28) {
        const plank = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.06, 0.22), woodPostMat);
        plank.position.set(0, 0.24, pz);
        dg.add(plank);
      }
      dg.position.set(cx, 0, cz);
      dg.rotation.y = rotY;
      this.exteriorGroup.add(dg);
    };
    // Visible Mekong canal ditch running along West roadside & East orchard outside expanded fences
    addMekongCanalDitch(-54, 51.6, 26, 2.7, 0);
    addMekongCanalDitch(74.5, 12, 46, 3.0, Math.PI / 2);

    // Street utility poles + sagging overhead power wires outside front fence
    const wirePoleMat = new THREE.MeshStandardMaterial({ color: 0x8F8C84, roughness: 0.78 });
    const wireMat = new THREE.LineBasicMaterial({ color: 0x3A3D42, transparent: true, opacity: 0.58 });
    const poleXs = [-46, -24, -2, 18, 36, 56, 78];
    for (let i = 0; i < poleXs.length; i++) {
      const px = poleXs[i];
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.19, 8.2, 8), wirePoleMat);
      pole.position.set(px, 4.1, 61.8);
      this.exteriorGroup.add(pole);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 1.5), wirePoleMat);
      bar.position.set(px, 7.6, 61.8);
      this.exteriorGroup.add(bar);
      if (i > 0) {
        const prevX = poleXs[i - 1];
        for (const wz of [61.3, 62.3]) {
          const pts = [
            new THREE.Vector3(prevX, 7.6, wz),
            new THREE.Vector3((prevX + px) / 2, 7.05, wz),
            new THREE.Vector3(px, 7.6, wz)
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

    // Shared vehicle factory: uses Meshy GLB cars/shuttles when loaded, falling back to procedural geometry.
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
      // Meshy vehicle GLBs face along +X; rotate +PI/2 around Y so vehicle length aligns along local Z
      inner.rotation.y = Math.PI / 2;
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

    // Small paved lay-by on the pagoda side of Nguyễn Trung Trực; keep both gates unobstructed.
    const frontCarParkingPad = new THREE.Mesh(
      new THREE.BoxGeometry(16.0, 0.07, 3.7),
      new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xC8BFAE, roughness: 0.9 })
    );
    frontCarParkingPad.position.set(-14.0, 0.026, 52.2);
    frontCarParkingPad.receiveShadow = true;
    this.exteriorGroup.add(frontCarParkingPad);
    const parkingLineMat = new THREE.MeshBasicMaterial({ color: 0xE9E4D8 });
    for (const lx of [-22.0, -14.0, -6.0]) {
      const bayLine = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.018, 3.2), parkingLineMat);
      bayLine.position.set(lx, 0.068, 52.2);
      this.exteriorGroup.add(bayLine);
    }
    const parkedVan = buildRoadCar(-18.0, 52.2, -Math.PI / 2, 0xD2D8D9, 'van');
    const parkedSedan = buildRoadCar(-10.0, 52.2, -Math.PI / 2, 0xAEB9C1, 'sedan');
    this.parkedVehicleAnchors.push(
      { kind: 'van', x: -18.0, z: 52.2, yaw: -Math.PI / 2, targetLength: 5.8, fallback: parkedVan },
      { kind: 'sedan', x: -10.0, z: 52.2, yaw: -Math.PI / 2, targetLength: 4.45, fallback: parkedSedan }
    );

    // Occasional visitor-shuttle pull-in on the far east end of the frontage; does not block either gate.
    const visitorDropoffPad = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 0.07, 5.2),
      new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xC8BFAE, roughness: 0.9 })
    );
    visitorDropoffPad.position.set(63.0, 0.026, 50.6);
    visitorDropoffPad.receiveShadow = true;
    this.exteriorGroup.add(visitorDropoffPad);
    const dropoffEdge = new THREE.Mesh(
      new THREE.BoxGeometry(5.8, 0.025, 0.08),
      new THREE.MeshBasicMaterial({ color: 0xE9E4D8 })
    );
    dropoffEdge.position.set(63.0, 0.07, 48.05);
    this.exteriorGroup.add(dropoffEdge);

    // Motorbike parking sits beyond the right-side entrance and grocery/souvenir frontage, inside the pagoda grounds.
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

    // Place signature banana clumps & bamboo strictly OUTSIDE the expanded x=-68..68, z=-72..41.5 sanctuary wall
    [
      [-72, 48.5],
      [-74, 30],
      [-74, -12],
      [73, 38],
      [74, 6],
      [-60, 74.5],
      [72, 54]
    ].forEach(([bx, bz]) => addBananaClump(bx, bz));
    [
      [-73, 52],
      [75, 64],
      [-75, -24],
      [76, -24]
    ].forEach(([gx, gz]) => addBambooGrove(gx, gz));

    for (let i = 0; i < 76; i++) {
      const ang = (i / 76) * Math.PI * 2;
      const dist = 84 + (i % 5) * 16;
      const ox = Math.cos(ang) * dist;
      const oz = Math.sin(ang) * dist - 10;
      if (oz > 46 && oz < 76 && ox > -64 && ox < 84) continue;
      if (i % 2 === 0) {
        addBgCoconutPalm(ox, oz, 8.5 + (i % 4) * 1.6, ((i % 3) - 1) * 0.1);
      } else {
        const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(3.4 + (i % 3) * 0.9, 1), orchardMat);
        canopy.scale.set(1.35, 0.62, 1.35);
        canopy.position.set(ox, 2.3, oz);
        this.exteriorGroup.add(canopy);
      }
    }
    for (let i = 0; i < 48; i++) {
      const ang = (i / 48) * Math.PI * 2 + 0.06;
      const ox = Math.cos(ang) * 136;
      const oz = Math.sin(ang) * 136;
      const mound = new THREE.Mesh(new THREE.DodecahedronGeometry(8.5 + (i % 3) * 2.2, 1), orchardMat);
      mound.scale.set(1.6, 0.36, 1.6);
      mound.position.set(ox, 1.15, oz);
      this.exteriorGroup.add(mound);
    }
  }
};
