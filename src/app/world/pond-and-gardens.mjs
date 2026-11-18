/**
 * Hoa sen, hồ sen & cá koi, lư hương, vườn cây, cờ Phật giáo, bồ câu.
 *
 * Mixin của VinhTrang3DWorld: 10 method (makeLotusFlower3D … buildCourtyardPigeons).
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, makeCanvasTex, makeTextTex, makeHippedRoofMesh } from './shared.mjs';

export const pondAndGardensMethods = {
  makeLotusFlower3D(isWhite = false, trackAnim = false) {
    const g = new THREE.Group();
    const petalMat = isWhite
      ? new THREE.MeshStandardMaterial({
          color: 0xFFF7EC,
          emissive: 0xFFD97D,
          emissiveIntensity: 0.04,
          roughness: 0.42,
          side: THREE.DoubleSide
        })
      : new THREE.MeshStandardMaterial({
          color: 0xF478A8,
          emissive: 0xFF9AC0,
          emissiveIntensity: 0.05,
          roughness: 0.42,
          side: THREE.DoubleSide
        });
    const innerMat = isWhite
      ? petalMat
      : new THREE.MeshStandardMaterial({
          color: 0xFF9AC0,
          emissive: 0xFFD166,
          emissiveIntensity: 0.05,
          roughness: 0.38,
          side: THREE.DoubleSide
        });
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0xF4C430,
      emissive: 0xFFE07A,
      emissiveIntensity: 0.08,
      roughness: 0.45
    });
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.045, 0.09, 10), centerMat);
    pod.position.y = 0.08;
    g.add(pod);

    const outerPivots = [];
    const innerPivots = [];

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const ringAnchor = new THREE.Group();
      ringAnchor.rotation.y = -a + Math.PI / 2;
      const hinge = new THREE.Group();
      hinge.position.set(0, 0.05, 0.08);
      hinge.rotation.x = 0.46;
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 8, 6, 0, Math.PI, 0, Math.PI * 0.72),
        petalMat
      );
      p.scale.set(0.65, 1.35, 0.35);
      p.position.set(0, 0.04, 0.02);
      hinge.add(p);
      ringAnchor.add(hinge);
      g.add(ringAnchor);
      outerPivots.push(hinge);
    }

    for (let i = 0; i < 6; i++) {
      const a = ((i + 0.5) / 6) * Math.PI * 2;
      const ringAnchor = new THREE.Group();
      ringAnchor.rotation.y = -a + Math.PI / 2;
      const hinge = new THREE.Group();
      hinge.position.set(0, 0.08, 0.05);
      hinge.rotation.x = 0.22;
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 6, 0, Math.PI, 0, Math.PI * 0.7),
        innerMat
      );
      p.scale.set(0.55, 1.45, 0.32);
      p.position.set(0, 0.035, 0.015);
      hinge.add(p);
      ringAnchor.add(hinge);
      g.add(ringAnchor);
      innerPivots.push(hinge);
    }

    if (trackAnim) {
      this.pondLotusAnims.push({
        group: g,
        outerPivots,
        innerPivots,
        petalMat,
        innerMat,
        centerMat,
        baseScale: 1.0
      });
    }
    return g;
  },

  makeKoiPatternTex(variant = 0) {
    return makeCanvasTex((g, w, h) => {
      if (variant === 2) {
        g.fillStyle = '#F5B82E';
        g.fillRect(0, 0, w, h);
        g.fillStyle = '#FFE07A';
        g.fillRect(0, h * 0.22, w, h * 0.56);
      } else {
        g.fillStyle = '#FFF9F0';
        g.fillRect(0, 0, w, h);
        g.fillStyle = variant === 0 ? '#E84A24' : '#F25F29';
        for (const [cx, cy, rx, ry] of [
          [w * 0.32, h * 0.5, 28, 22],
          [w * 0.62, h * 0.45, 22, 18],
          [w * 0.78, h * 0.55, 14, 14]
        ]) {
          g.beginPath();
          g.ellipse(cx, cy, rx, ry, 0.3, 0, Math.PI * 2);
          g.fill();
        }
        if (variant === 1) {
          g.fillStyle = '#201F24';
          for (const [cx, cy, r] of [
            [w * 0.44, h * 0.36, 9],
            [w * 0.68, h * 0.62, 7]
          ]) {
            g.beginPath();
            g.arc(cx, cy, r, 0, Math.PI * 2);
            g.fill();
          }
        }
      }
    }, 128, 128, 1, 1);
  },

  makeNotchedLilyPadGeo(radius = 0.45) {
    const shape = new THREE.Shape();
    const startAngle = 0.24;
    const endAngle = Math.PI * 2 - 0.24;
    shape.moveTo(0, 0);
    shape.absarc(0, 0, radius, startAngle, endAngle, false);
    shape.lineTo(0, 0);
    const geo = new THREE.ShapeGeometry(shape, 18);
    geo.rotateX(-Math.PI / 2);
    return geo;
  },

  buildLotusPond(w, d, koiCount = 12, showPalmFlagDecor = false) {
    const M = this.MAT;
    const g = new THREE.Group();
    const wallH = 0.64;
    const wallT = 0.42;

    for (const sz of [-(d / 2 + wallT / 2), d / 2 + wallT / 2]) {
      const wWall = new THREE.Mesh(new THREE.BoxGeometry(w + wallT * 2, wallH, wallT), M.stoneLight);
      wWall.position.set(0, wallH / 2, sz);
      wWall.receiveShadow = true;
      g.add(wWall);
    }
    for (const sx of [-(w / 2 + wallT / 2), w / 2 + wallT / 2]) {
      const sWall = new THREE.Mesh(new THREE.BoxGeometry(wallT, wallH, d), M.stoneLight);
      sWall.position.set(sx, wallH / 2, 0);
      sWall.receiveShadow = true;
      g.add(sWall);
    }

    const bed = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.14, d),
      new THREE.MeshStandardMaterial({ color: 0x1D3327, roughness: 0.94 })
    );
    bed.position.y = 0.14;
    bed.receiveShadow = true;
    g.add(bed);

    const rockMat = new THREE.MeshStandardMaterial({ color: 0x5E625B, roughness: 0.88 });
    for (let i = 0; i < 8; i++) {
      const rx = ((i * 2.93) % (w - 2.4)) - (w - 2.4) / 2;
      const rz = ((i * 3.71) % (d - 2.0)) - (d - 2.0) / 2;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32 + (i % 3) * 0.12, 0), rockMat);
      rock.scale.set(1.3, 0.65, 1.1);
      rock.position.set(rx, 0.26, rz);
      g.add(rock);
    }

    const waterMat = new THREE.MeshPhysicalMaterial({
      map: this.waterTex,
      color: 0x3C8A7C,
      roughness: 0.14,
      metalness: 0.08,
      clearcoat: 0.82,
      clearcoatRoughness: 0.14,
      transparent: true,
      opacity: 0.72
    });
    const water = new THREE.Mesh(new THREE.PlaneGeometry(w, d), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = wallH - 0.05;
    water.renderOrder = 2;
    g.add(water);

    const step = 1.6;
    for (let x = -w / 2; x <= w / 2; x += step) {
      for (const z of [-d / 2 - 0.2, d / 2 + 0.2]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.58, 0.18), M.creamTrim);
        post.position.set(x, wallH + 0.29, z);
        g.add(post);
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), M.goldAccent);
        cap.position.set(x, wallH + 0.62, z);
        g.add(cap);
      }
    }

    // Keep Main Lotus Pond open & serene with stone corner lanterns instead of crude cone palms or mid-air flags
    if (showPalmFlagDecor) {
      for (const [lx, lz] of [
        [-w / 2 - 0.5, d / 2 + 0.4],
        [w / 2 + 0.5, d / 2 + 0.4],
        [-w / 2 - 0.5, -d / 2 - 0.4],
        [w / 2 + 0.5, -d / 2 - 0.4]
      ]) {
        const cLantern = this.makeStoneLantern();
        cLantern.scale.setScalar(0.76);
        cLantern.position.set(lx, 0, lz);
        g.add(cLantern);
      }
    }

    const padMat = new THREE.MeshStandardMaterial({
      map: this.lotusPadTex,
      roughness: 0.55,
      side: THREE.DoubleSide
    });
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x3B6E30, roughness: 0.7 });
    const clusterCenters = [
      [-w * 0.28, -d * 0.22],
      [w * 0.25, -d * 0.18],
      [-w * 0.2, d * 0.24],
      [w * 0.28, d * 0.2],
      [0, 0]
    ];
    for (let cIdx = 0; cIdx < clusterCenters.length; cIdx++) {
      const [cx, cz] = clusterCenters[cIdx];
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 + cIdx * 0.7;
        const dist = 0.45 + (i % 3) * 0.62;
        const lx = Math.max(-w / 2 + 0.9, Math.min(w / 2 - 0.9, cx + Math.cos(ang) * dist));
        const lz = Math.max(-d / 2 + 0.9, Math.min(d / 2 - 0.9, cz + Math.sin(ang) * dist));
        const r = 0.34 + ((i + cIdx) % 4) * 0.08;
        const pad = new THREE.Mesh(this.makeNotchedLilyPadGeo(r), padMat);
        pad.position.set(lx, wallH - 0.025, lz);
        pad.rotation.y = ang * 1.7;
        g.add(pad);

        if (i % 2 === 0) {
          const lotusPivot = new THREE.Group();
          const stemH = 0.18 + ((i + cIdx) % 3) * 0.14;
          lotusPivot.position.set(lx + 0.08, wallH - 0.03, lz - 0.05);
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, stemH, 6), stemMat);
          stem.position.y = stemH / 2;
          lotusPivot.add(stem);
          const fl = this.makeLotusFlower3D((i + cIdx) % 5 === 0, true);
          const baseSc = 1.05 + (i % 2) * 0.22;
          fl.position.y = stemH;
          fl.scale.setScalar(baseSc);
          if (this.pondLotusAnims.length > 0) {
            this.pondLotusAnims[this.pondLotusAnims.length - 1].baseScale = baseSc;
          }
          lotusPivot.add(fl);
          g.add(lotusPivot);
          this.lotusSwayGroups.push({ group: lotusPivot, phase: i * 1.1 + cIdx });
        }
      }
    }

    // Articulated sculpted & patterned Koi swimming along smooth closed CatmullRomCurve3 splines under water
    if (!this._koiTexSet) {
      this._koiTexSet = [0, 1, 2].map((v) => this.makeKoiPatternTex(v));
    }
    if (!this._koiBodyGeo) {
      // Smooth curved Koi profile (head -> broad shoulder -> tapered peduncle)
      const pts = [
        new THREE.Vector2(0.005, 0.28),
        new THREE.Vector2(0.068, 0.22),
        new THREE.Vector2(0.095, 0.10),
        new THREE.Vector2(0.072, -0.05),
        new THREE.Vector2(0.032, -0.20),
        new THREE.Vector2(0.012, -0.27)
      ];
      const lathe = new THREE.LatheGeometry(pts, 12);
      lathe.rotateX(Math.PI / 2);
      lathe.scale(0.86, 0.68, 1.0);
      this._koiBodyGeo = lathe;
    }

    const finMat = new THREE.MeshStandardMaterial({
      color: 0xFFF4E0,
      transparent: true,
      opacity: 0.86,
      roughness: 0.35,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < koiCount; i++) {
      const fishGroup = new THREE.Group();
      const bodyPivot = new THREE.Group();
      fishGroup.add(bodyPivot);

      const skinTex = this._koiTexSet[i % this._koiTexSet.length];
      const bodyMat = new THREE.MeshStandardMaterial({
        map: skinTex,
        roughness: 0.24,
        metalness: i % 3 === 2 ? 0.22 : 0.05
      });
      const body = new THREE.Mesh(this._koiBodyGeo, bodyMat);
      bodyPivot.add(body);

      const dorsal = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.075), finMat);
      dorsal.rotation.y = Math.PI / 2;
      dorsal.position.set(0, 0.08, -0.02);
      bodyPivot.add(dorsal);

      for (const side of [-1, 1]) {
        const pec = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.08), finMat);
        pec.rotation.x = -Math.PI / 2;
        pec.rotation.z = side * 0.45;
        pec.position.set(side * 0.09, -0.01, 0.08);
        bodyPivot.add(pec);
      }

      const tailPivot = new THREE.Group();
      tailPivot.position.set(0, 0, -0.25);
      const tailGeo = new THREE.ShapeGeometry(
        (() => {
          const s = new THREE.Shape();
          s.moveTo(0, 0);
          s.lineTo(-0.16, 0.08);
          s.lineTo(-0.12, 0);
          s.lineTo(-0.16, -0.08);
          s.closePath();
          return s;
        })()
      );
      tailGeo.rotateY(Math.PI / 2);
      const tailMesh = new THREE.Mesh(tailGeo, finMat);
      tailPivot.add(tailMesh);
      bodyPivot.add(tailPivot);

      const koiScale = 0.85 + (i % 4) * 0.14;
      fishGroup.scale.setScalar(koiScale);
      g.add(fishGroup);

      // Build unique organic closed figure-8 / meandering curve inside pond walls
      const mx = w * 0.36;
      const mz = d * 0.34;
      const a0 = (i / Math.max(1, koiCount)) * Math.PI * 2;
      const ctrl = [];
      const nPts = 6;
      for (let p = 0; p < nPts; p++) {
        const th = a0 + (p / nPts) * Math.PI * 2;
        const radScale = 0.48 + 0.38 * Math.sin(p * 1.9 + i);
        const px = Math.cos(th) * mx * radScale;
        const pz = Math.sin(th * (i % 2 === 0 ? 1 : 2)) * mz * (0.45 + 0.35 * Math.cos(p + i));
        const py = wallH - 0.17 - ((p + i) % 3) * 0.03;
        ctrl.push(new THREE.Vector3(px, py, pz));
      }
      const curve = new THREE.CatmullRomCurve3(ctrl, true, 'catmullrom', 0.5);

      this.koiList.push({
        mesh: fishGroup,
        bodyPivot,
        tail: tailPivot,
        curve,
        speed: 0.032 + (i % 5) * 0.007,
        phase: (i * 0.17) % 1
      });
    }
    return g;
  },

  buildIncenseBurner(scale = 1) {
    const M = this.MAT;
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.22, 0.38, 12), M.stoneDark);
    base.position.y = 0.19;
    g.add(base);
    // 3 Bronze tripod legs
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.55, 8), M.bronzeBurner);
      leg.position.set(Math.cos(a) * 0.55, 0.52, Math.sin(a) * 0.55);
      g.add(leg);
    }
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.64, 0.96, 20), M.bronzeBurner);
    body.position.y = 1.02;
    body.castShadow = true;
    g.add(body);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.83, 0.09, 10, 24), M.goldAccent);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.48;
    g.add(rim);
    // Dragon handles on left and right of burner
    for (const sx of [-0.92, 0.92]) {
      const ear = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 8, 14), M.goldAccent);
      ear.position.set(sx, 1.22, 0);
      g.add(ear);
    }
    // Oil lamp on small ritual table beside main burner
    const lampStand = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.95, 10), M.stoneDark);
    lampStand.position.set(1.28, 0.475, 0.35);
    g.add(lampStand);
    const oilFlame = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.22, 8),
      new THREE.MeshBasicMaterial({ color: 0xFF9800 })
    );
    oilFlame.position.set(1.28, 1.06, 0.35);
    g.add(oilFlame);

    const ash = new THREE.Mesh(
      new THREE.CylinderGeometry(0.74, 0.74, 0.1, 16),
      new THREE.MeshStandardMaterial({ color: 0xC9BD9F, roughness: 0.95 })
    );
    ash.position.y = 1.44;
    g.add(ash);
    g.scale.setScalar(scale);
    return g;
  },

  makeKneelingCushion() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x9E241C, roughness: 0.72 });
    const trim = this.MAT.goldAccent;
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.5, 0.14, 16), mat);
    pad.position.y = 0.07;
    pad.receiveShadow = true;
    g.add(pad);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.03, 8, 18), trim);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.13;
    g.add(ring);
    return g;
  },

  makeStoneLantern() {
    const M = this.MAT;
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.35, 0.78), M.stoneDark);
    base.position.y = 0.175;
    g.add(base);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.25, 8), M.stoneLight);
    shaft.position.y = 0.95;
    shaft.castShadow = true;
    g.add(shaft);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.42, 0.46), M.lanternGlow);
    lamp.position.y = 1.78;
    g.add(lamp);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.42, 4), M.stoneDark);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 2.18;
    g.add(roof);
    return g;
  },

  buildGardensTreesAndFlags() {
    const M = this.MAT;

    // 1. Flag Courtyard Banners: Vietnam Red Flag left (x = 18.2) & 5-Color Buddhist Flag right (x = 27.8) on round yellow tiers (image_97204806.png)
    const buildFlagPole = (fx, fz, isVietnam) => {
      const grp = new THREE.Group();
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.38, 0.42, 16), M.goldWall);
      base.position.y = 0.21;
      grp.add(base);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.02, 0.34, 16), M.creamTrim);
      rim.position.y = 0.58;
      grp.add(rim);
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.085, 8.8, 10),
        new THREE.MeshStandardMaterial({ color: 0xD8DCE4, metalness: 0.72, roughness: 0.28 })
      );
      pole.position.y = 4.6;
      grp.add(pole);
      const flagTex = isVietnam
        ? makeCanvasTex((ctx, w, h) => {
            ctx.fillStyle = '#D9261C';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            const cx = w * 0.5;
            const cy = h * 0.5;
            const outerR = h * 0.28;
            const innerR = outerR * 0.382;
            for (let i = 0; i < 10; i++) {
              const r = i % 2 === 0 ? outerR : innerR;
              const a = (i * Math.PI) / 5 - Math.PI / 2;
              if (i === 0) ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
              else ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
            }
            ctx.closePath();
            ctx.fill();
          }, 256, 170)
        : this.flagTex72;
      const cloth = new THREE.Mesh(
        new THREE.PlaneGeometry(2.35, 1.55),
        new THREE.MeshStandardMaterial({ map: flagTex, side: THREE.DoubleSide, roughness: 0.5 })
      );
      cloth.position.set(1.2, 7.95, 0);
      grp.add(cloth);
      grp.position.set(fx, 0, fz);
      this.exteriorGroup.add(grp);
      this.addObstacle(fx, fz, 1.25);
    };
    buildFlagPole(18.2, 25.5, true);
    buildFlagPole(27.8, 25.5, false);

    // 2. Low hedge frames the West plaza edge without obstructing the main sightline to Chánh Điện.
    const midHedge = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 18.0), M.foliageDark);
    midHedge.position.set(-10.5, 0.325, 16.5);
    this.exteriorGroup.add(midHedge);

    // 3. Straight Cool Tree-Shaded Lane (x = 40.5, z = +36 -> -24): Bougainvillea planters lining outer curbs (35.2 & 45.4)
    const bougCoords = [
      [35.2, 29.8, 0.92],
      [35.2, 18.2, 0.92],
      [35.2, 4.5, 0.92],
      [35.2, -6.5, 0.92],
      [45.4, 28.5, 0.92],
      [45.4, 15.0, 0.92],
      [45.4, 1.5, 0.92],
      [45.4, -9.5, 0.92]
    ];
    const makeOrganicClusterGeo = (rad, seed) => {
      const geo = new THREE.IcosahedronGeometry(rad, 2);
      const pos = geo.attributes.position;
      for (let vi = 0; vi < pos.count; vi++) {
        const vx = pos.getX(vi);
        const vy = pos.getY(vi);
        const vz = pos.getZ(vi);
        const j = 0.88 + 0.22 * Math.abs(Math.sin((vx * 4.7 + vy * 3.1 + vz * 5.3 + seed) * 1.9));
        pos.setXYZ(vi, vx * j, vy * (0.78 + 0.18 * j), vz * j);
      }
      geo.computeVertexNormals();
      return geo;
    };
    const bougBlossomMat1 = new THREE.MeshStandardMaterial({ color: 0xD92B7B, roughness: 0.74 });
    const bougBlossomMat2 = new THREE.MeshStandardMaterial({ color: 0xEF6BA4, roughness: 0.76 });
    for (let bi = 0; bi < bougCoords.length; bi++) {
      const [bx, bz, sc] = bougCoords[bi];
      const pot = new THREE.Group();
      const pMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.58, 0.38, 0.56, 14),
        M.terracottaPot
      );
      pMesh.position.y = 0.28;
      pMesh.castShadow = true;
      pot.add(pMesh);
      const soilRim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.52, 0.52, 0.06, 12),
        M.trunk
      );
      soilRim.position.y = 0.54;
      pot.add(soilRim);
      // Twisted woody bougainvillea canes
      for (const [ang, lean] of [[0, 0.16], [2.1, 0.22], [4.2, 0.18]]) {
        const cane = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.068, 1.35, 6), M.trunk);
        cane.position.set(Math.cos(ang) * 0.14, 1.12, Math.sin(ang) * 0.14);
        cane.rotation.z = Math.cos(ang) * lean;
        cane.rotation.x = Math.sin(ang) * lean;
        pot.add(cane);
      }
      for (const [ci, [ox, oy, oz, r]] of [
        [0, 1.88, 0, 0.52],
        [-0.44, 1.66, 0.22, 0.42],
        [0.44, 1.72, -0.18, 0.43],
        [-0.2, 2.22, -0.15, 0.38],
        [0.24, 2.12, 0.22, 0.37],
        [0.52, 1.36, 0.18, 0.32],
        [-0.48, 1.32, -0.2, 0.30]
      ].entries()) {
        const foliage = new THREE.Mesh(makeOrganicClusterGeo(r, bi * 7 + ci), ci % 2 === 0 ? M.foliageMid : M.foliageDark);
        foliage.position.set(ox, oy, oz);
        foliage.castShadow = true;
        pot.add(foliage);
        // Cascading bougainvillea flower sprays instead of solid spheres
        for (let fi = 0; fi < 4; fi++) {
          const fa = (fi / 4) * Math.PI * 2 + ci * 0.7;
          const petalCluster = new THREE.Mesh(
            makeOrganicClusterGeo(r * 0.28, bi * 13 + fi + ci),
            fi % 2 === 0 ? bougBlossomMat1 : bougBlossomMat2
          );
          petalCluster.position.set(
            ox + Math.cos(fa) * r * 0.55,
            oy + 0.12 - (fi % 2) * 0.1,
            oz + Math.sin(fa) * r * 0.55
          );
          pot.add(petalCluster);
        }
      }
      pot.position.set(bx, 0, bz);
      pot.scale.setScalar(sc || 1);
      this.exteriorGroup.add(pot);
      this.addObstacle(bx, bz, 0.6);
    }

    const redFenceMat = new THREE.MeshStandardMaterial({ color: 0xB82924, roughness: 0.48 });
    const lampPostMat = new THREE.MeshStandardMaterial({ color: 0xE8B95E, roughness: 0.48 });
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0xFFFBF0,
      emissive: 0xFFF2C8,
      emissiveIntensity: 0.65,
      roughness: 0.22
    });

    // Low stone curbs, globe lamps & lush overarching shade trees lining the Straight Side Lane (x = 35.6 .. 45.4, z = +34 -> -24)
    for (const [sideX, minZ, maxZ] of [
      [35.6, -9.8, 34.0],
      [45.4, -10.5, 34.0]
    ]) {
      const len = maxZ - minZ;
      const midZ = (minZ + maxZ) * 0.5;
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, len), M.goldLight);
      curb.position.set(sideX, 0.12, midZ);
      curb.receiveShadow = true;
      this.exteriorGroup.add(curb);
    }

    // Overarching Tropical Shade Trees ("Hàng cây bóng mát rượi dọc lối xuống tiệm lưu niệm cuối đường")
    for (const [tx, tz, sc] of [
      [35.0, 24.0, 1.25],
      [35.0, 10.5, 1.3],
      [35.0, -2.5, 1.32],
      [46.2, 31.0, 1.28],
      [46.2, 18.5, 1.35],
      [46.2, 5.5, 1.35],
      [46.2, -6.5, 1.38],
      [44.2, -23.5, 1.42],
      [36.2, -22.5, 1.36]
    ]) {
      const shTree = new THREE.Group();
      const trk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.36, 4.1, 10), M.trunk);
      trk.position.y = 2.05;
      trk.castShadow = true;
      shTree.add(trk);
      for (const [cx, cy, cz, cr, cMat] of [
        [0, 4.65, 0, 2.35, M.foliageMid],
        [-1.15, 4.25, 0.5, 1.75, M.foliageDark],
        [1.15, 4.35, -0.45, 1.8, M.foliageLight],
        [0, 5.45, 0, 1.65, M.foliageLight]
      ]) {
        const crown = new THREE.Mesh(new THREE.SphereGeometry(cr, 10, 8), cMat);
        crown.scale.set(1.25, 0.68, 1.22);
        crown.position.set(cx, cy, cz);
        crown.castShadow = true;
        shTree.add(crown);
      }
      shTree.position.set(tx, 0, tz);
      shTree.scale.setScalar(sc);
      this.exteriorGroup.add(shTree);
      this.addObstacle(tx, tz, 0.52);
    }

    // Yellow square-post white-globe lamps along Straight Shaded Lane
    for (const [lx, lz] of [
      [35.6, 26.0],
      [35.6, 12.0],
      [35.6, -1.0],
      [45.4, 22.0],
      [45.4, 8.0],
      [45.4, -5.0]
    ]) {
      const ped = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.35, 0.42), M.goldWall);
      ped.position.set(lx, 0.675, lz);
      this.exteriorGroup.add(ped);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 1.35, 8), lampPostMat);
      pole.position.set(lx, 1.98, lz);
      this.exteriorGroup.add(pole);
      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), globeMat);
      globe.position.set(lx, 2.75, lz);
      this.exteriorGroup.add(globe);
    }

    // Directional signposts guiding pilgrims straight down the cool lane to the Souvenir Plaza & Left-Turn Chánh Điện Door
    for (const [sx, sz, rotY, labelTxt] of [
      [44.6, 30.5, -0.22, '↑ ĐI THẲNG CUỐI ĐƯỜNG: TIỆM LƯU NIỆM & LỐI VÀO CHÁNH ĐIỆN'],
      [43.8, -8.5, -0.35, '← RẼ TRÁI BỎ GIÀY DÉP VÀO CỬA CHÁNH ĐIỆN · TIỆM TẠP HÓA ↓']
    ]) {
      const dirSignGroup = new THREE.Group();
      dirSignGroup.position.set(sx, 0, sz);
      const dirPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.65, 8), M.darkWood);
      dirPost.position.y = 0.825;
      dirSignGroup.add(dirPost);
      const dirBoard = new THREE.Mesh(
        new THREE.BoxGeometry(3.15, 0.54, 0.1),
        new THREE.MeshStandardMaterial({
          map: makeTextTex(labelTxt, {
            w: 1120,
            h: 170,
            bg: '#1C5A34',
            border: '#FFD875',
            color: '#FFF6E5',
            size: 36
          }),
          roughness: 0.4
        })
      );
      dirBoard.position.set(0, 1.56, 0);
      dirBoard.rotation.y = rotY;
      dirSignGroup.add(dirBoard);
      this.exteriorGroup.add(dirSignGroup);
    }

    // Outer-right garden remains open beside the side-gate grocery house; no duplicate statue row.

    // Low ornamental bonsai urns neatly framing the outer Chánh Điện porch corners without blocking the 13-arch facade
    for (const bx of [13.2, 32.8]) {
      const bPot = this.makeBonsai72(0.72);
      bPot.position.set(bx, 0, 11.4);
      this.exteriorGroup.add(bPot);
      this.addObstacle(bx, 11.4, 0.65);
    }

    for (const [sx, sz, rotY] of [
      [35.0, 18.0, Math.PI / 2],
      [35.0, 13.0, Math.PI / 2],
      [14.2, 15.5, Math.PI / 2]
    ]) {
      const bench = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.12, 0.55), M.stoneLight);
      seat.position.y = 0.48;
      seat.castShadow = true;
      bench.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.45, 0.1), M.stoneLight);
      back.position.set(0, 0.72, -0.22);
      bench.add(back);
      for (const lx of [-0.72, 0.72]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.48, 0.48), M.stoneDark);
        leg.position.set(lx, 0.24, 0);
        bench.add(leg);
      }
      bench.position.set(sx, 0, sz);
      bench.rotation.y = rotY;
      this.exteriorGroup.add(bench);
    }

    // Lush Street & Courtyard Shade Trees (shifted clear of Nhà Tạp Hóa Vĩnh Tràng roof, with forked branches & multi-tone foliage)
    const treePositions = [
      [-6, 36, 1.3],
      [-28, 38, 1.4],
      [-34, 14, 1.35],
      [-33, -16, 1.4],
      [-18, -26, 1.3],
      [51.5, 43.5, 1.35],
      [52.8, 30.5, 1.4],
      [49.5, 22, 1.45],
      [48.5, 10, 1.4],
      [48, -32, 1.45],
      [32.5, 35.5, 1.25]
    ];
    for (const [tx, tz, sc] of treePositions) {
      const tree = new THREE.Group();
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.42, 3.8, 10), M.trunk);
      tr.position.y = 1.9;
      tr.castShadow = true;
      tree.add(tr);
      // Angled forked limbs
      for (const [bx, bz, rotZ, rotX] of [
        [-0.55, 0.25, 0.52, -0.22],
        [0.52, -0.28, -0.48, 0.22]
      ]) {
        const limb = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.18, 1.75, 7), M.trunk);
        limb.position.set(bx, 3.25, bz);
        limb.rotation.z = rotZ;
        limb.rotation.x = rotX;
        tree.add(limb);
      }
      const foliagePalette = [M.foliageLight, M.foliageMid, M.foliageDark];
      [
        [0, 4.45, 0, 2.0, 0],
        [-1.25, 3.85, 0.65, 1.45, 1],
        [1.22, 3.92, -0.55, 1.45, 2],
        [0.35, 5.25, 0.25, 1.42, 0]
      ].forEach(([cx, cy, cz, r, mIdx]) => {
        const cr = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), foliagePalette[mIdx]);
        cr.position.set(cx, cy, cz);
        cr.castShadow = true;
        tree.add(cr);
      });
      tree.position.set(tx, 0, tz);
      tree.scale.setScalar(sc);
      this.exteriorGroup.add(tree);
      this.addObstacle(tx, tz, 0.8);
    }

    const flagMat = new THREE.MeshBasicMaterial({ map: this.flagTex72, side: THREE.DoubleSide });
    // Vertical festive "cờ phướn" pilgrimage banners neatly on poles at Cổng Phụ entrance lane (no floating mid-air flag strings)
    for (const [fx, fz] of [
      [36.2, 43.2],
      [44.8, 43.2],
      [36.2, 32.5],
      [44.8, 32.5]
    ]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 4.6, 6), M.goldAccent);
      pole.position.set(fx, 2.3, fz);
      this.exteriorGroup.add(pole);
      const banner = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 2.1), flagMat);
      banner.position.set(fx, 3.45, fz + 0.25);
      banner.rotation.y = Math.PI / 2;
      this.exteriorGroup.add(banner);
    }
  },

  buildProceduralShopPavilion() {
    const M = this.MAT;
    const g = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(5.8, 0.26, 4.4),
      M.darkWood
    );
    base.position.y = 0.13;
    g.add(base);
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(4.9, 1.02, 1.35),
      new THREE.MeshStandardMaterial({ color: 0x8C5532, map: this.woodGrainTex, roughness: 0.58 })
    );
    counter.position.set(0, 0.72, 1.0);
    counter.castShadow = true;
    g.add(counter);
    for (const [px, pz] of [
      [-2.35, -1.65],
      [2.35, -1.65],
      [-2.35, 1.65],
      [2.35, 1.65]
    ]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 3.1, 12), M.redColumn);
      col.position.set(px, 1.65, pz);
      col.castShadow = true;
      g.add(col);
    }
    const roof = makeHippedRoofMesh(5.8, 4.4, 1.5, M.roofTile);
    roof.position.y = 3.72;
    roof.castShadow = true;
    g.add(roof);
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.78, 0.15),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('CỬA HÀNG LƯU NIỆM', { w: 1024, h: 220, size: 74 })
      })
    );
    sign.position.set(0, 2.9, 1.75);
    g.add(sign);
    this.proceduralShopGroup = g;
    this.shopKioskAnchor.add(g);
  },

  buildCourtyardPigeons() {
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xDCE0E6, roughness: 0.55 });
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x9BA4B0, roughness: 0.6 });
    const spots = [
      [20.2, 23.5],
      [21.0, 24.1],
      [25.5, 19.2],
      [26.1, 18.7],
      [19.4, 14.2],
      [22.4, 25.0],
      [24.0, 24.6],
      [18.2, 19.5]
    ];
    for (const [px, pz] of spots) {
      const bird = new THREE.Group();
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), bodyMat);
      b.scale.set(1, 0.8, 1.45);
      b.position.y = 0.14;
      bird.add(b);
      const h = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), bodyMat);
      h.position.set(0, 0.24, 0.14);
      bird.add(h);
      const wL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.16), wingMat);
      wL.position.set(-0.12, 0.16, 0);
      bird.add(wL);
      const wR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.16), wingMat);
      wR.position.set(0.12, 0.16, 0);
      bird.add(wR);
      bird.position.set(px, 0, pz);
      this.exteriorGroup.add(bird);
      this.pigeons.push({
        group: bird,
        wL,
        wR,
        baseX: px,
        baseZ: pz,
        phase: Math.random() * 6.28,
        flying: false,
        flyTimer: 0
      });
    }
  }
};
