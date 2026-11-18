/**
 * Tiệm tạp hóa cuối đường, nhà hai bên, giảng đường, tháp 7 tầng, bệ tượng.
 *
 * Mixin của VinhTrang3DWorld: 7 method (buildVietnameseGroceryHouse … buildStatuePedestals).
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, makeTextTex, makeHippedRoofMesh } from './shared.mjs';

export const groceryHallsStatuesMethods = {
  buildVietnameseGroceryHouse() {
    // Cool Tree-Shaded End-of-Road Grocery & Buddhist Souvenir Shophouse ("TIỆM TẠP HÓA & LƯU NIỆM CUỐI ĐƯỜNG MÁT RƯỢI")
    // Placed down at the shaded end of the lengthened straight lane from Cổng Phụ (x = 54.8, z = -21.5), opening a spacious plaza across from Chánh Điện!
    const M = this.MAT;
    const house = new THREE.Group();
    house.position.set(54.8, 0, -21.5);
    house.rotation.y = -Math.PI * 0.5; // Front open shutter faces -X onto the shaded end-of-road plaza
    house.userData.stallType = 'am_thuc_chay';
    house.userData.stallTitle = 'Tiệm Tạp Hóa · Lưu Niệm Cuối Đường Mát';

    const masonryMat = new THREE.MeshStandardMaterial({ color: 0xEFE1B8, map: this.limeWallTex, roughness: 0.72 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xD7C192, roughness: 0.68 });
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xCFC5B4, roughness: 0.45 });
    const awningMat = new THREE.MeshStandardMaterial({ color: 0x1E6A4E, roughness: 0.42, metalness: 0.22 });
    const shutterMat = new THREE.MeshStandardMaterial({ color: 0x8F99A3, roughness: 0.36, metalness: 0.55 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x7A4824, map: this.woodGrainTex, roughness: 0.65 });

    // 1. Raised tiled concrete floor slab + solid masonry side/back walls (W=9.4m storefront, D=4.4m room depth)
    const floor = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.22, 6.2), floorMat);
    floor.position.set(0, 0.11, 0.7);
    floor.receiveShadow = true;
    house.add(floor);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(9.4, 3.65, 0.35), masonryMat);
    backWall.position.set(0, 1.92, -2.0);
    backWall.castShadow = true;
    house.add(backWall);

    for (const sx of [-4.55, 4.55]) {
      const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.65, 4.4), masonryMat);
      sideWall.position.set(sx, 1.92, 0.05);
      sideWall.castShadow = true;
      house.add(sideWall);
      const frontPier = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.7, 0.5), trimMat);
      frontPier.position.set(sx, 1.95, 2.05);
      house.add(frontPier);
    }

    // Main pitched terracotta-red Vietnamese shophouse roof + rolled-up silver shutter box above open storefront
    const mainRoof = makeHippedRoofMesh(10.2, 5.2, 1.55, M.roofTile);
    mainRoof.position.set(0, 4.45, -0.05);
    mainRoof.castShadow = true;
    house.add(mainRoof);

    const shutterBox = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.55, 0.42), shutterMat);
    shutterBox.position.set(0, 3.35, 2.05);
    house.add(shutterBox);

    // 2. Protruding Slanted Corrugated Tôn Veranda Awning ("Mái hiên nhà tạp hóa") + metal veranda posts
    const awning = new THREE.Mesh(new THREE.BoxGeometry(9.9, 0.1, 3.0), awningMat);
    awning.position.set(0, 2.9, 3.25);
    awning.rotation.x = 0.2;
    awning.castShadow = true;
    house.add(awning);

    const steelPostMat = new THREE.MeshStandardMaterial({ color: 0xD2D8E0, metalness: 0.68, roughness: 0.28 });
    for (const px of [-4.4, 0, 4.4]) {
      const vPost = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 2.65, 8), steelPostMat);
      vPost.position.set(px, 1.325, 4.48);
      house.add(vPost);
    }

    // 3. Large Glowing Glass-Door Beverage Cooler Fridge ("Tủ mát nước giải khát") inside storefront
    const fridgeBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 2.15, 0.85),
      new THREE.MeshStandardMaterial({ color: 0xEFF4F8, roughness: 0.3 })
    );
    fridgeBody.position.set(-3.3, 1.25, -1.25);
    house.add(fridgeBody);
    const fridgeGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.25, 1.65),
      new THREE.MeshBasicMaterial({ color: 0xBCE8FF })
    );
    fridgeGlow.position.set(-3.3, 1.35, -0.81);
    house.add(fridgeGlow);
    for (let r = 0; r < 4; r++) {
      for (let b = 0; b < 5; b++) {
        const bottle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.045, 0.05, 0.24, 6),
          new THREE.MeshStandardMaterial({ color: b % 2 === 0 ? 0x269448 : 0xD63E2A, roughness: 0.28 })
        );
        bottle.position.set(-3.75 + b * 0.22, 0.72 + r * 0.36, -0.78);
        house.add(bottle);
      }
    }

    // 4. Wall-to-wall 3-tier Grocery Shelving ("Kệ hàng tạp hóa") filled with incense boxes, snacks, water packs
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x4E5B6B, metalness: 0.4, roughness: 0.55 });
    for (const sy of [0.85, 1.55, 2.25]) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.08, 0.62), shelfMat);
      plank.position.set(0.85, sy, -1.42);
      house.add(plank);
      for (let gi = 0; gi < 9; gi++) {
        const boxCol = gi % 3 === 0 ? 0xC63428 : gi % 3 === 1 ? 0xE6B038 : 0x2A784C;
        const pkg = new THREE.Mesh(
          new THREE.BoxGeometry(0.38, 0.32, 0.32),
          new THREE.MeshStandardMaterial({ color: boxCol, roughness: 0.5 })
        );
        pkg.position.set(-1.5 + gi * 0.58, sy + 0.2, -1.4);
        house.add(pkg);
      }
    }

    // 5. Front Shopkeeper Wooden-Glass Counter + Conical Hats, Incense Bundles & Fresh Lotus Buckets
    const counter = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.02, 0.88), woodMat);
    counter.position.set(-0.8, 0.68, 1.35);
    counter.castShadow = true;
    house.add(counter);

    const glassTop = new THREE.Mesh(
      new THREE.BoxGeometry(5.64, 0.06, 0.92),
      new THREE.MeshStandardMaterial({ color: 0xD9F0F8, roughness: 0.16, metalness: 0.18 })
    );
    glassTop.position.set(-0.8, 1.21, 1.35);
    house.add(glassTop);

    for (let hi = 0; hi < 4; hi++) {
      const hat = new THREE.Mesh(
        new THREE.ConeGeometry(0.28, 0.16, 16),
        new THREE.MeshStandardMaterial({ color: 0xEAD6AA, roughness: 0.78 })
      );
      hat.position.set(-2.6 + hi * 0.72, 1.38, 1.35);
      house.add(hat);
    }
    const lotusBucket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.19, 0.42, 12),
      new THREE.MeshStandardMaterial({ color: 0x2F7E56, roughness: 0.42 })
    );
    lotusBucket.position.set(1.25, 1.42, 1.35);
    house.add(lotusBucket);
    for (let li = -1; li <= 1; li++) {
      const fl = this.makeLotusFlower3D(false);
      fl.scale.setScalar(0.95);
      fl.position.set(1.25 + li * 0.12, 1.68, 1.35);
      house.add(fl);
    }

    // 6. Red "Thùng Đá" Ice Chest + Plastic Tea Tables & Stools under the Veranda Shade
    const iceChest = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.62, 0.58),
      new THREE.MeshStandardMaterial({ color: 0xC83226, roughness: 0.34 })
    );
    iceChest.position.set(2.9, 0.52, 2.35);
    house.add(iceChest);

    for (const tz of [-1.8, 1.6]) {
      const pTable = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.5, 0.68),
        new THREE.MeshStandardMaterial({ color: 0x266BC4, roughness: 0.35 })
      );
      pTable.position.set(tz, 0.44, 3.45);
      house.add(pTable);
      for (const [ox, oz, cHex] of [
        [-0.65, 0, 0xD33A2C],
        [0.65, 0, 0x266BC4]
      ]) {
        const stool = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.3, 0.3),
          new THREE.MeshStandardMaterial({ color: cHex, roughness: 0.35 })
        );
        stool.position.set(tz + ox, 0.34, 3.45 + oz);
        house.add(stool);
      }
    }

    // 7. Bold Storefront Signboard across veranda eaves + Interactive Trigger Ring
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(8.6, 0.88, 0.14),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('TIỆM TẠP HÓA · ĐỒ LƯU NIỆM & NƯỚC MÁT CUỐI ĐƯỜNG', {
          w: 1600,
          h: 180,
          bg: '#FFF3D4',
          border: '#1C5A34',
          color: '#9E241C',
          size: 44
        }),
        roughness: 0.38
      })
    );
    signBoard.position.set(0, 2.95, 4.55);
    house.add(signBoard);

    const trigRing = new THREE.Mesh(
      new THREE.RingGeometry(0.75, 1.05, 28),
      new THREE.MeshBasicMaterial({ color: 0xFFD166, side: THREE.DoubleSide, transparent: true, opacity: 0.68 })
    );
    trigRing.rotation.x = -Math.PI / 2;
    trigRing.position.set(0, 0.05, 5.4);
    house.add(trigRing);

    this.exteriorGroup.add(house);
    this.stallAnchors.push(house);
    this.stallClickTargets.push(counter, awning, signBoard, fridgeBody, trigRing, mainRoof);

    // Physical house footprint collider East of the widened end-of-road left-turn plaza
    this.addRectObstacle(51.8, 59.4, -26.8, -16.2);

    // End-of-Lane Shaded Buddhist Souvenir & Cold Sugarcane Kiosk pushed North to z = -37.5 so the left-turn plaza is wide open!
    const souvenirKiosk = new THREE.Group();
    souvenirKiosk.position.set(41.8, 0, -37.5);
    souvenirKiosk.userData.stallType = 'phap_khi';
    souvenirKiosk.userData.stallTitle = 'Quầy Lưu Niệm Phật Giáo · Chuỗi Hạt & Quà Mỹ Tho';
    const skRoof = makeHippedRoofMesh(8.4, 4.2, 1.25, awningMat);
    skRoof.position.set(0, 3.45, 0);
    skRoof.castShadow = true;
    souvenirKiosk.add(skRoof);
    for (const px of [-3.6, 0, 3.6]) {
      const pCol = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 3.1, 8), woodMat);
      pCol.position.set(px, 1.55, 1.55);
      souvenirKiosk.add(pCol);
    }
    const skCounter = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.98, 0.95), woodMat);
    skCounter.position.set(0, 0.49, 0.65);
    souvenirKiosk.add(skCounter);
    for (let si = -3; si <= 3; si++) {
      const disp = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.16, 0.26, 10),
        new THREE.MeshStandardMaterial({ color: si % 2 === 0 ? 0xD99B26 : 0xB83B28, roughness: 0.4 })
      );
      disp.position.set(si * 0.85, 1.12, 0.65);
      souvenirKiosk.add(disp);
    }
    const skSign = new THREE.Mesh(
      new THREE.BoxGeometry(7.6, 0.84, 0.12),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('QUẦY LƯU NIỆM PHẬT GIÁO · TRÀNG HẠT · TƯỢNG NHỎ · NƯỚC MÁT', {
          w: 1600,
          h: 180,
          bg: '#1E5B3A',
          border: '#FFD875',
          color: '#FFF8E7',
          size: 40
        }),
        roughness: 0.36
      })
    );
    skSign.position.set(0, 2.95, 1.85);
    souvenirKiosk.add(skSign);
    this.exteriorGroup.add(souvenirKiosk);
    this.stallClickTargets.push(skCounter, skSign, skRoof);
    this.addRectObstacle(37.6, 46.0, -39.5, -35.8);

    // Secondary authentic ice-cream / cold-drinks cart just outside Cổng Phụ
    const cart = new THREE.Group();
    cart.position.set(46.2, 0, 44.8);
    cart.rotation.y = -Math.PI * 0.5;
    cart.userData.stallType = 'am_thuc_chay';
    cart.userData.stallTitle = 'Quầy Nước Mát · Cà Rem Cổng Phụ';
    const cartBox = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 1.05, 1.05),
      new THREE.MeshStandardMaterial({ color: 0xF5EFE2, roughness: 0.4 })
    );
    cartBox.position.y = 0.72;
    cart.add(cartBox);
    const cartSign = new THREE.Mesh(
      new THREE.BoxGeometry(1.65, 0.65, 0.08),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('CÀ REM MỸ THO · DỪA XIÊM', {
          w: 640,
          h: 220,
          bg: '#FFF8EC',
          border: '#C9382B',
          color: '#B8251C',
          size: 46
        })
      })
    );
    cartSign.position.set(0, 0.74, 0.54);
    cart.add(cartSign);
    this.exteriorGroup.add(cart);
    this.stallClickTargets.push(cartBox, cartSign);
    this.addRectObstacle(45.2, 47.4, 43.4, 46.2);

    this.stallTriggers.push(
      {
        x: 48.4,
        z: -21.5,
        radius: 6.8,
        stallType: 'am_thuc_chay',
        title: 'Tiệm Tạp Hóa · Lưu Niệm Cuối Đường Mát',
        ring: trigRing
      },
      {
        x: 41.8,
        z: -33.5,
        radius: 5.5,
        stallType: 'phap_khi',
        title: 'Quầy Lưu Niệm Phật Giáo · Quà Chùa Vĩnh Tràng',
        ring: trigRing
      },
      {
        x: 43.6,
        z: 44.8,
        radius: 4.5,
        stallType: 'am_thuc_chay',
        title: 'Quầy Nước Mát · Cà Rem Cổng Phụ',
        ring: trigRing
      }
    );
  },

  makeBonsai72(scale = 1) {
    const M = this.MAT;
    const g = new THREE.Group();
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 0.45, 12), M.stoneDark);
    stand.position.y = 0.225;
    g.add(stand);
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.78, 0.52, 0.68, 16),
      M.terracottaPot
    );
    pot.position.y = 0.78;
    pot.castShadow = true;
    g.add(pot);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.78, 0.07, 8, 18),
      M.terracottaPot
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.12;
    g.add(rim);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, 1.9, 10), M.trunk);
    trunk.position.y = 1.95;
    trunk.rotation.z = 0.08;
    g.add(trunk);
    const pads = [
      [0, 1.55, 0, 0.85],
      [-0.58, 1.95, 0.15, 0.68],
      [0.58, 2.15, -0.1, 0.68],
      [-0.38, 2.55, -0.1, 0.56],
      [0.35, 2.7, 0.12, 0.54],
      [0, 3.05, 0, 0.52]
    ];
    for (const [px, py, pz, r] of pads) {
      const pad = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), M.foliageMid);
      pad.scale.set(1.35, 0.42, 1.15);
      pad.position.set(px, py, pz);
      pad.castShadow = true;
      g.add(pad);
    }
    g.scale.setScalar(scale);
    return g;
  },

  buildSideHall(w, d, h, wallMat) {
    const M = this.MAT;
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    body.position.y = h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);
    const roof = makeHippedRoofMesh(w + 1.1, d + 1.1, 2.2, M.roofTile);
    roof.position.y = h + 1.05;
    roof.castShadow = true;
    g.add(roof);
    return g;
  },

  buildIncenseStallAndBookRoom() {
    // Handled by buildVietnameseGroceryHouse() along the Cổng Phụ entry plaza
  },

  buildGiangDuong() {
    const M = this.MAT;
    const g = new THREE.Group();
    const f1 = new THREE.Mesh(new THREE.BoxGeometry(9.6, 4.2, 18.8), M.goldWall);
    f1.position.y = 2.1;
    f1.castShadow = true;
    f1.receiveShadow = true;
    g.add(f1);
    const f2 = new THREE.Mesh(new THREE.BoxGeometry(9.2, 3.8, 18.2), M.creamTrim);
    f2.position.y = 6.1;
    f2.castShadow = true;
    g.add(f2);
    const roof = makeHippedRoofMesh(10.8, 20.0, 2.8, M.roofTile);
    roof.position.y = 9.3;
    roof.castShadow = true;
    g.add(roof);
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(5.8, 0.95, 0.18),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('GIẢNG ĐƯỜNG PHẬT PHÁP', { w: 1024, h: 200, size: 68 })
      })
    );
    sign.rotation.y = -Math.PI / 2;
    sign.position.set(-4.85, 4.2, 0);
    g.add(sign);
    return g;
  },

  buildSevenTierStupa() {
    const M = this.MAT;
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.6, 1.4, 8), M.stoneDark);
    base.position.y = 0.7;
    base.receiveShadow = true;
    g.add(base);
    let y = 1.4;
    for (let i = 0; i < 7; i++) {
      const r = 3.0 - i * 0.28;
      const h = 2.2 - i * 0.1;
      const body = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.88, r, h, 8), M.stupaBody);
      body.position.y = y + h / 2;
      body.castShadow = true;
      g.add(body);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(r * 1.32, 0.78, 8), M.stupaRoof);
      roof.position.y = y + h + 0.35;
      roof.castShadow = true;
      g.add(roof);
      y += h + 0.45;
    }
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.38, 2.8, 12), M.goldAccent);
    spire.position.y = y + 1.4;
    g.add(spire);
    return g;
  },

  buildStatuePedestals() {
    const M = this.MAT;

    // 1. Đại tượng Phật A Di Đà — hoa viên lệch Tây để giữ trục Tam Quan -> Chánh Điện thông thoáng.
    // Tư liệu thực tế: thân tượng 18m, đài sen và bệ khoảng 7m, tổng chiều cao khoảng 25m.
    this.adidaGroup = new THREE.Group();
    this.adidaGroup.position.set(8.5, 0, 17.5);
    const adidaPlaza = new THREE.Mesh(
      new THREE.CylinderGeometry(8.8, 9.2, 0.18, 32),
      M.stoneLight
    );
    adidaPlaza.position.y = 0.09;
    adidaPlaza.receiveShadow = true;
    this.adidaGroup.add(adidaPlaza);
    const adidaTerrace = new THREE.Mesh(
      new THREE.CylinderGeometry(6.4, 7.0, 0.42, 24),
      M.stoneDark
    );
    adidaTerrace.position.y = 0.21;
    adidaTerrace.receiveShadow = true;
    this.adidaGroup.add(adidaTerrace);

    const adidaFrontSign = new THREE.Mesh(
      new THREE.BoxGeometry(5.8, 0.78, 0.16),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('PHẬT A DI ĐÀ · TƯỢNG 18M · ĐÀI SEN/BỆ 7M', { w: 1600, h: 200, size: 46 })
      })
    );
    adidaFrontSign.position.set(0, 0.82, 5.55);
    this.adidaGroup.add(adidaFrontSign);

    // Four tropical shade trees frame the flower garden without hiding the statue silhouette.
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const tx = Math.sin(ang) * 9.6;
      const tz = -Math.cos(ang) * 9.6;
      const t = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 3.8, 10), M.trunk);
      trunk.position.y = 1.9;
      t.add(trunk);
      const crown = new THREE.Mesh(new THREE.SphereGeometry(1.9, 16, 12), M.foliageDark);
      crown.position.y = 4.0;
      crown.scale.set(1.18, 0.92, 1.12);
      t.add(crown);
      t.position.set(tx, 0, tz);
      this.adidaGroup.add(t);
    }
    this.exteriorGroup.add(this.adidaGroup);
    this.addObstacle(8.5, 17.5, 6.8);

    // 2. Đại tượng Phật Di Lặc — công viên bên tay phải chùa khi nhìn từ trong ra.
    // Tượng thực tế dài 27m, rộng 18m, cao 20m; khối đế là công trình kiến trúc bên dưới tượng.
    this.dilacGroup = new THREE.Group();
    this.dilacGroup.position.set(-24.5, 0, 4.0);
    const dilacTerrace = new THREE.Mesh(new THREE.BoxGeometry(27.0, 4.8, 18.2), M.pedestalRed);
    dilacTerrace.position.set(0, 2.4, 1.8);
    dilacTerrace.receiveShadow = true;
    dilacTerrace.castShadow = true;
    this.dilacGroup.add(dilacTerrace);
    const dilacCap = new THREE.Mesh(new THREE.BoxGeometry(27.4, 0.22, 18.6), M.stoneLight);
    dilacCap.position.set(0, 4.81, 1.8);
    dilacCap.receiveShadow = true;
    this.dilacGroup.add(dilacCap);

    for (let st = 0; st < 7; st++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(15.0, 0.6, 0.62),
        st % 2 === 0 ? M.stoneLight : M.creamTrim
      );
      step.position.set(0, 0.3 + st * 0.65, 16.5 - st * 0.42);
      step.receiveShadow = true;
      this.dilacGroup.add(step);
    }
    const stairLanding = new THREE.Mesh(new THREE.BoxGeometry(18.0, 0.6, 3.6), M.creamTrim);
    stairLanding.position.set(0, 4.62, 12.3);
    stairLanding.receiveShadow = true;
    this.dilacGroup.add(stairLanding);

    const railMetal = new THREE.MeshStandardMaterial({ color: 0xD8DCE2, metalness: 0.72, roughness: 0.32 });
    for (const hx of [-7.0, 7.0]) {
      const postBot = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), railMetal);
      postBot.position.set(hx, 0.75, 16.6);
      this.dilacGroup.add(postBot);
      const postTop = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), railMetal);
      postTop.position.set(hx, 4.45, 12.8);
      this.dilacGroup.add(postTop);
      const railBar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 5.7, 8), railMetal);
      railBar.position.set(hx, 2.55, 14.7);
      railBar.rotation.x = Math.PI / 2 - 0.62;
      this.dilacGroup.add(railBar);
    }

    const dilacBlackBand = new THREE.Mesh(
      new THREE.BoxGeometry(25.5, 1.25, 0.34),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('當 來 彌 勒 大 佛', {
          w: 1800,
          h: 190,
          bg: '#1C1E21',
          border: '#3C3E42',
          color: '#E7B448',
          size: 86
        }),
        roughness: 0.82
      })
    );
    dilacBlackBand.position.set(0, 3.55, 11.02);
    this.dilacGroup.add(dilacBlackBand);

    const dilacRedBand = new THREE.Mesh(
      new THREE.BoxGeometry(25.5, 1.0, 0.38),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('NAM MÔ ĐƯƠNG LAI DI LẶC TÔN PHẬT', {
          w: 1800,
          h: 170,
          bg: '#A6432B',
          border: '#7E2B19',
          color: '#FFD76E',
          size: 56
        }),
        roughness: 0.72
      })
    );
    dilacRedBand.position.set(0, 2.42, 11.05);
    this.dilacGroup.add(dilacRedBand);

    this.exteriorGroup.add(this.dilacGroup);
    this.addRectObstacle(-38.5, -10.5, -4.5, 14.9);

    // West garden plaza: low planters and clipped tropical shrubs frame the Di Lặc courtyard.
    for (const wx of [-36.2, -13.2]) {
      for (let zi = 0; zi < 4; zi++) {
        const wz = 22.5 + zi * 4.8;
        const bushPot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.42, 0.52, 12), M.terracottaPot);
        bushPot.position.set(wx, 0.26, wz);
        this.exteriorGroup.add(bushPot);
        const bush = new THREE.Mesh(new THREE.SphereGeometry(0.75, 10, 8), M.foliageMid);
        bush.scale.set(1.05, 0.78, 1.0);
        bush.position.set(wx, 0.78, wz);
        bush.castShadow = true;
        this.exteriorGroup.add(bush);
      }
    }

    // 3. Đại tượng Phật Thích Ca nhập Niết Bàn — khu vườn phía sau Chánh điện.
    // Bệ đá 3 tầng cao 3.6m cùng 5 bậc tam cấp phía Nam hướng Phật tử.
    this.nietBanGroup = new THREE.Group();
    this.nietBanGroup.position.set(-24.5, 0, -24.0);
    const nbTier1 = new THREE.Mesh(new THREE.BoxGeometry(35.0, 1.2, 18.0), M.stoneDark);
    nbTier1.position.y = 0.6;
    nbTier1.receiveShadow = true;
    nbTier1.castShadow = true;
    this.nietBanGroup.add(nbTier1);
    const nbTier2 = new THREE.Mesh(new THREE.BoxGeometry(34.2, 1.2, 17.2), M.creamTrim);
    nbTier2.position.y = 1.8;
    nbTier2.receiveShadow = true;
    nbTier2.castShadow = true;
    this.nietBanGroup.add(nbTier2);
    const nbTier3 = new THREE.Mesh(new THREE.BoxGeometry(33.6, 1.2, 16.6), M.stoneLight);
    nbTier3.position.y = 3.0;
    nbTier3.receiveShadow = true;
    nbTier3.castShadow = true;
    this.nietBanGroup.add(nbTier3);
    for (let st = 0; st < 5; st++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.44, 0.55), M.stoneLight);
      step.position.set(0, 0.22 + st * 0.42, 9.8 - st * 0.4);
      step.receiveShadow = true;
      this.nietBanGroup.add(step);
    }

    const nbSign = new THREE.Mesh(
      new THREE.BoxGeometry(12.5, 1.15, 0.18),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('NAM MÔ BỔN SƯ THÍCH CA MÂU NI PHẬT', {
          w: 1600,
          h: 200,
          bg: '#4E5054',
          border: '#C9962E',
          color: '#FFE08A',
          size: 56
        })
      })
    );
    nbSign.position.set(0, 2.2, 9.15);
    this.nietBanGroup.add(nbSign);
    this.exteriorGroup.add(this.nietBanGroup);
    this.addRectObstacle(-42.0, -7.0, -33.0, -15.0);

    // 4. Đài Quán Thế Âm Bồ Tát near entrance — oriented INWARD (-X / -Z toward inner temple courtyard & Chánh Điện)
    this.quanAmGroup = new THREE.Group();
    this.quanAmGroup.position.set(32.8, 0, 23.5);
    this.quanAmGroup.rotation.y = -Math.PI * 0.62;
    const qaPool = new THREE.Mesh(new THREE.CylinderGeometry(2.65, 2.95, 0.52, 8), M.creamTrim);
    qaPool.position.y = 0.26;
    qaPool.receiveShadow = true;
    this.quanAmGroup.add(qaPool);
    const qaWater = new THREE.Mesh(
      new THREE.CylinderGeometry(2.35, 2.35, 0.44, 16),
      new THREE.MeshStandardMaterial({ color: 0x357E70, roughness: 0.18, metalness: 0.15 })
    );
    qaWater.position.y = 0.3;
    this.quanAmGroup.add(qaWater);

    const qaPlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.18, 1.35, 8), M.statueWhite);
    qaPlinth.position.y = 1.15;
    qaPlinth.castShadow = true;
    this.quanAmGroup.add(qaPlinth);

    const lotusBaseMat = new THREE.MeshStandardMaterial({ color: 0xF596B8, roughness: 0.42 });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const pet = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.52, 6), lotusBaseMat);
      pet.position.set(Math.cos(a) * 0.85, 1.98, Math.sin(a) * 0.85);
      pet.rotation.z = -Math.cos(a) * 0.6;
      pet.rotation.x = Math.sin(a) * 0.6;
      this.quanAmGroup.add(pet);
    }

    const qaRobeLower = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.72, 2.15, 16), M.statueWhite);
    qaRobeLower.position.y = 3.05;
    qaRobeLower.castShadow = true;
    this.quanAmGroup.add(qaRobeLower);
    const qaTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.48, 1.25, 14), M.statueWhite);
    qaTorso.position.y = 4.68;
    qaTorso.castShadow = true;
    this.quanAmGroup.add(qaTorso);
    const qaHead = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), M.statueWhite);
    qaHead.position.y = 5.56;
    this.quanAmGroup.add(qaHead);
    const qaCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.36, 10), M.statueWhite);
    qaCrown.position.y = 5.88;
    this.quanAmGroup.add(qaCrown);
    const qaVeil = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.56, 1.25, 10, 1, true, Math.PI * 0.45, Math.PI * 1.1), M.statueWhite);
    qaVeil.position.set(0, 5.25, -0.06);
    this.quanAmGroup.add(qaVeil);
    const qaLeftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.75, 8), M.statueWhite);
    qaLeftArm.position.set(-0.34, 4.65, 0.22);
    qaLeftArm.rotation.set(-0.7, 0, -0.25);
    this.quanAmGroup.add(qaLeftArm);
    const camLoVase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.13, 0.34, 12),
      new THREE.MeshStandardMaterial({ color: 0xCFE8D5, roughness: 0.25, metalness: 0.1 })
    );
    camLoVase.position.set(-0.28, 4.55, 0.52);
    this.quanAmGroup.add(camLoVase);
    const qaRightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.75, 8), M.statueWhite);
    qaRightArm.position.set(0.34, 4.82, 0.22);
    qaRightArm.rotation.set(-0.95, 0, 0.2);
    this.quanAmGroup.add(qaRightArm);
    this.quanAmPlaceholderParts.push(qaRobeLower, qaTorso, qaHead, qaCrown, qaVeil, qaLeftArm, camLoVase, qaRightArm);
    const qaHalo = new THREE.Mesh(
      new THREE.RingGeometry(0.58, 0.72, 24),
      new THREE.MeshBasicMaterial({ color: 0xFFE296, side: THREE.DoubleSide })
    );
    qaHalo.position.set(0, 5.62, -0.18);
    this.quanAmGroup.add(qaHalo);

    const qaSign = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.52, 0.12),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('ĐÀI QUÁN THẾ ÂM BỒ TÁT', { w: 768, h: 160, bg: '#1C5A34', border: '#FFD875', color: '#FFF6E5', size: 46 })
      })
    );
    qaSign.position.set(0, 0.65, 2.7);
    this.quanAmGroup.add(qaSign);

    this.exteriorGroup.add(this.quanAmGroup);
    this.addObstacle(32.8, 22.5, 2.6);
  }
};
