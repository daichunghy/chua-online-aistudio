/**
 * Tiệm tạp hóa cuối đường, nhà hai bên, giảng đường, tháp 7 tầng, bệ tượng.
 *
 * Mixin của VinhTrang3DWorld: 7 method (buildVietnameseGroceryHouse … buildStatuePedestals).
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, makeTextTex, makeHippedRoofMesh } from './shared.mjs';

export const groceryHallsStatuesMethods = {
  buildVietnameseGroceryHouse() {
    // =========================================================================
    // KHU CUỐI ĐƯỜNG BÊN PHẢI CHÙA VĨNH TRÀNG (x = 37..57, z = -37..-10)
    // Dựa trên ảnh thực tế Chùa Vĩnh Tràng (image_97204806.png):
    // 1) Phía cuối trục đường (x = 42.2, z = -33.5): Căn nhà ki-ốt dựng tạm kín đáo
    //    "QUẦY LƯU NIỆM · VĂN HÓA PHẨM PHẬT GIÁO" đầy đủ vách, mái tôn, cửa chống,
    //    kệ 4 tầng nhang trầm/kinh sách/tượng nhỏ, tủ mát nước giải khát, tủ kính tràng hạt,
    //    hàng nón lá & túi vải treo hiên, thùng đá dừa xiêm và bàn ghế nghỉ chân.
    // 2) Bên phải sân rẽ trái (x = 50.8..56.8): Không đặt tiệm tạp hóa trùng lặp hay
    //    quầy cúng dường; bố trí 2 bồn vườn cây kiểng xanh mát, ghế đá công viên chùa,
    //    Trạm Trà Đá Miễn Phí đặc trưng chùa miền Tây & lối lát đá rộng dẫn thẳng vào
    //    Văn Phòng Ban Trị Sự · Giảng Đường Huệ Đăng phía Đông.
    // =========================================================================
    const M = this.MAT;

    // Shared PBR materials with distinct roughness / metalness contrast
    const steelFrameMat = new THREE.MeshStandardMaterial({ color: 0x244B3A, roughness: 0.4, metalness: 0.52 });
    const aluMat = new THREE.MeshStandardMaterial({ color: 0xCFD6DC, roughness: 0.3, metalness: 0.72 });
    const creamPanelMat = new THREE.MeshStandardMaterial({ color: 0xF3E8CE, map: this.limeWallTex, roughness: 0.8 });
    const wainscotWoodMat = new THREE.MeshStandardMaterial({ color: 0x7A4925, map: this.woodGrainTex, roughness: 0.66 });
    const counterWoodMat = new THREE.MeshStandardMaterial({ color: 0x8B562E, map: this.woodGrainTex, roughness: 0.56 });
    const darkTrimWoodMat = new THREE.MeshStandardMaterial({ color: 0x4E2C16, roughness: 0.72 });
    const roofGreenMat = new THREE.MeshStandardMaterial({
      map: this.tinRoofTex,
      color: 0x1E6B4A,
      roughness: 0.44,
      metalness: 0.24
    });
    const floorTileMat = new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xD8CFC0, roughness: 0.62 });
    const glassShowcaseMat = new THREE.MeshStandardMaterial({
      color: 0xD9F2F8,
      roughness: 0.12,
      metalness: 0.14,
      transparent: true,
      opacity: 0.42
    });
    const shelfMetalMat = new THREE.MeshStandardMaterial({ color: 0x56626E, roughness: 0.48, metalness: 0.45 });
    const velvetTrayMat = new THREE.MeshStandardMaterial({ color: 0x7D1F1D, roughness: 0.88 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xE5B53A, roughness: 0.28, metalness: 0.62 });
    const porcelainMat = new THREE.MeshStandardMaterial({ color: 0xF5F3EC, roughness: 0.26, metalness: 0.05 });

    // =========================================================================
    // 1. NHÀ LƯU NIỆM · ĐẶC SẢN CHAY CHÙA VĨNH TRÀNG (ĐI BỘ VÀO BÊN TRONG MUA ĐỒ!)
    //    Vị trí: (42.2, 0, -33.5), mặt tiền MỞ RỘNG 8.2m quay về hướng Nam (+Z)
    //    Khách hành hương đi thẳng vào bên trong ngắm kệ Kho Quẹt Chay, Chao Môn,
    //    Tràng Hạt, Tượng Phật nhỏ, Mỹ Nghệ Gỗ Dừa, Kinh Sách & Nước Mát!
    // =========================================================================
    const kiosk = new THREE.Group();
    kiosk.position.set(42.2, 0, -33.5);
    kiosk.userData.stallType = 'phap_khi';
    kiosk.userData.stallTitle = 'Nhà Lưu Niệm · Đặc Sản Chay Chùa Vĩnh Tràng';

    const ceramicFloorMat = new THREE.MeshStandardMaterial({
      map: this.pavingTex,
      color: 0xD2C2A8,
      roughness: 0.58
    });
    const jarCapRedMat = new THREE.MeshStandardMaterial({ color: 0xB82D24, roughness: 0.36 });
    const jarCapGoldMat = new THREE.MeshStandardMaterial({ color: 0xD9A234, roughness: 0.34, metalness: 0.35 });
    const khoQuetJarMat = new THREE.MeshStandardMaterial({ color: 0x5C2C14, roughness: 0.22, metalness: 0.08 });
    const chaoJarMat = new THREE.MeshStandardMaterial({ color: 0xE8D49E, roughness: 0.28 });
    const coconutWoodMat = new THREE.MeshStandardMaterial({ color: 0x6A3A1E, roughness: 0.44 });

    // 1a. Nền gạch men rộng đi bộ phẳng mượt từ sân gạch vào hẳn trong nhà (11.4m x 7.4m)
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.1, 7.4), ceramicFloorMat);
    plinth.position.set(0, 0.05, 0.1);
    plinth.receiveShadow = true;
    kiosk.add(plinth);

    const welcomeMat = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.025, 0.95),
      new THREE.MeshStandardMaterial({ color: 0x7A241E, roughness: 0.9 })
    );
    welcomeMat.position.set(0, 0.11, 3.35);
    kiosk.add(welcomeMat);

    // 1b. Khung cột nhà rộng thoáng (mở toang mặt trước 8.4m không chắn lối đi!)
    const postCoords = [
      [-5.45, -3.35], [-1.8, -3.35], [1.8, -3.35], [5.45, -3.35],
      [-5.45, 0.2], [5.45, 0.2],
      [-5.45, 3.65], [5.45, 3.65]
    ];
    for (const [px, pz] of postCoords) {
      const h = pz < 2.0 ? 3.55 : 3.25;
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, h, 0.16), steelFrameMat);
      post.position.set(px, 0.1 + h * 0.5, pz);
      post.castShadow = true;
      kiosk.add(post);
    }
    const eaveBeam = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.14, 0.14), steelFrameMat);
    eaveBeam.position.set(0, 3.35, 3.65);
    kiosk.add(eaveBeam);

    // 1c. Vách tường 3 mặt (Sau, Trái, Phải) có lamri gỗ ấm & cửa sổ thoáng khí (Mặt trước mở hoàn toàn!)
    const backWallLower = new THREE.Mesh(new THREE.BoxGeometry(11.0, 1.15, 0.18), wainscotWoodMat);
    backWallLower.position.set(0, 0.675, -3.38);
    backWallLower.castShadow = true;
    kiosk.add(backWallLower);

    const backWallUpper = new THREE.Mesh(new THREE.BoxGeometry(11.0, 2.45, 0.16), creamPanelMat);
    backWallUpper.position.set(0, 2.45, -3.38);
    backWallUpper.castShadow = true;
    kiosk.add(backWallUpper);

    for (const side of [-1, 1]) {
      const sx = side * 5.48;
      const sideLower = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.15, 7.0), wainscotWoodMat);
      sideLower.position.set(sx, 0.675, 0.1);
      sideLower.castShadow = true;
      kiosk.add(sideLower);

      const sideBackCol = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.45, 2.3), creamPanelMat);
      sideBackCol.position.set(sx, 2.45, -2.25);
      kiosk.add(sideBackCol);

      const sideFrontCol = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.45, 1.65), creamPanelMat);
      sideFrontCol.position.set(sx, 2.45, 2.75);
      kiosk.add(sideFrontCol);

      const sideTopStrip = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.62, 3.1), creamPanelMat);
      sideTopStrip.position.set(sx, 3.35, 0.42);
      kiosk.add(sideTopStrip);

      // Cửa sổ chống mái che bên hông thoáng mát
      const proppedShutter = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.07, 2.95), roofGreenMat);
      proppedShutter.position.set(sx + side * 0.56, 2.86, 0.42);
      proppedShutter.rotation.z = side * -0.45;
      kiosk.add(proppedShutter);
    }

    // 1d. Mái ngói / tôn xanh cổ tự 2 mái cao thoáng + mái hiên đón khách
    const mainRoof = makeHippedRoofMesh(12.2, 8.2, 1.85, roofGreenMat);
    mainRoof.position.set(0, 4.55, 0.15);
    mainRoof.castShadow = true;
    kiosk.add(mainRoof);

    const roofRidge = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.14, 0.2), aluMat);
    roofRidge.position.set(0, 5.48, 0.15);
    kiosk.add(roofRidge);

    const frontAwning = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.1, 2.2), roofGreenMat);
    frontAwning.position.set(0, 3.42, 4.45);
    frontAwning.rotation.x = 0.22;
    frontAwning.castShadow = true;
    kiosk.add(frontAwning);

    // 1e. Đèn treo ấm áp bên trong phòng trưng bày (emissive sáng rõ, chỉ 1 PointLight chung)
    const warmBulbMat = new THREE.MeshStandardMaterial({
      color: 0xFFF5D4,
      emissive: 0xFFD47A,
      emissiveIntensity: 0.95,
      roughness: 0.2
    });
    for (const lx of [-2.8, 0, 2.8]) {
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 5), darkTrimWoodMat);
      cord.position.set(lx, 3.45, 0.2);
      kiosk.add(cord);
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.12, 10, 1, true), roofGreenMat);
      shade.position.set(lx, 3.18, 0.2);
      kiosk.add(shade);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 7), warmBulbMat);
      bulb.position.set(lx, 3.08, 0.2);
      kiosk.add(bulb);
    }

    // 1f. VÁCH SAU (z = -2.9): KỆ ĐẶC SẢN CHAY (KHO QUẸT CHAY · CHAO MÔN) & VĂN HÓA PHẨM PHẬT GIÁO
    const shelfWidth = 9.4;
    for (const postX of [-4.6, -2.3, 0, 2.3, 4.6]) {
      const upright = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.7, 0.06), shelfMetalMat);
      upright.position.set(postX, 1.45, -2.85);
      kiosk.add(upright);
    }
    for (const ty of [0.62, 1.18, 1.76, 2.34]) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(shelfWidth, 0.055, 0.62), counterWoodMat);
      plank.position.set(0, ty, -2.92);
      kiosk.add(plank);
    }

    // Bảng phân khu trên vách sau bên trong nhà lưu niệm
    const backZoneSignLeft = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.44, 0.06),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('KHO QUẸT CHAY · CHAO MÔN · BÁNH CHAY', {
          w: 960, h: 120, bg: '#8A2B1D', border: '#F4CC6A', color: '#FFF7E0', size: 36
        }),
        roughness: 0.4
      })
    );
    backZoneSignLeft.position.set(-2.4, 2.95, -3.26);
    kiosk.add(backZoneSignLeft);

    const backZoneSignRight = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.44, 0.06),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('TRÀNG HẠT · TƯỢNG PHẬT · KINH SÁCH', {
          w: 960, h: 120, bg: '#1B5836', border: '#F4CC6A', color: '#FFF7E0', size: 36
        }),
        roughness: 0.4
      })
    );
    backZoneSignRight.position.set(2.4, 2.95, -3.26);
    kiosk.add(backZoneSignRight);

    // Kệ trái vách sau (x = -4.3 .. -0.3): HŨ KHO QUẸT CHAY, HŨ CHAO MÔN, HỘP BÁNH PÍA CHAY & HẠT SEN
    for (let ji = 0; ji < 12; ji++) {
      const jx = -4.25 + ji * 0.34;
      // Tầng 2: Hũ Kho Quẹt Chay nắp đỏ bóng
      const kqJar = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.09, 0.2, 10), khoQuetJarMat);
      kqJar.position.set(jx, 1.31, -2.86);
      kiosk.add(kqJar);
      const kqCap = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 10), jarCapRedMat);
      kqCap.position.set(jx, 1.43, -2.86);
      kiosk.add(kqCap);
      // Tầng 3: Hũ Chao Môn Chay & Muối Mè nắp vàng
      const chaoJar = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.09, 0.21, 10), chaoJarMat);
      chaoJar.position.set(jx, 1.89, -2.86);
      kiosk.add(chaoJar);
      const chaoCap = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 10), jarCapGoldMat);
      chaoCap.position.set(jx, 2.02, -2.86);
      kiosk.add(chaoCap);
    }
    // Tầng 1 & Tầng 4 bên trái: Hộp bánh pía chay & giỏ quà đặc sản Tiền Giang
    const foodBoxCols = [0xC9462C, 0xD89B28, 0x2B7348, 0xA83628];
    for (let i = 0; i < 7; i++) {
      const bx = -4.15 + i * 0.62;
      const box1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.32, 0.36),
        new THREE.MeshStandardMaterial({ color: foodBoxCols[i % foodBoxCols.length], roughness: 0.56 })
      );
      box1.position.set(bx, 0.81, -2.88);
      kiosk.add(box1);
      const box4 = new THREE.Mesh(
        new THREE.BoxGeometry(0.44, 0.28, 0.32),
        new THREE.MeshStandardMaterial({ color: foodBoxCols[(i + 2) % foodBoxCols.length], roughness: 0.52 })
      );
      box4.position.set(bx, 2.51, -2.88);
      kiosk.add(box4);
    }

    // Kệ phải vách sau (x = 0.2 .. 4.4): KINH SÁCH, NHANG TRẦM, TƯỢNG PHẬT MINI & MỸ NGHỆ GỖ DỪA
    const bookColors = [0x8E2420, 0xC98B28, 0x23523B, 0x264878, 0xA84C24, 0xDFC78A];
    for (let bi = 0; bi < 16; bi++) {
      const bh = 0.24 + (bi % 3) * 0.04;
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, bh, 0.24),
        new THREE.MeshStandardMaterial({ color: bookColors[bi % bookColors.length], roughness: 0.68 })
      );
      book.position.set(0.35 + bi * 0.16, 1.21 + bh * 0.5, -2.88);
      kiosk.add(book);
    }
    for (let ci = 0; ci < 4; ci++) {
      const coilBox = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 0.14, 14),
        new THREE.MeshStandardMaterial({ color: ci % 2 === 0 ? 0xC83A28 : 0xDBA030, roughness: 0.5 })
      );
      coilBox.position.set(3.15 + ci * 0.38, 1.28, -2.88);
      kiosk.add(coilBox);
    }
    for (let si = 0; si < 6; si++) {
      const sx = 0.55 + si * 0.72;
      const isGold = si % 2 === 0;
      const miniStand = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.26), darkTrimWoodMat);
      miniStand.position.set(sx, 1.82, -2.88);
      kiosk.add(miniStand);
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 10), isGold ? goldMat : porcelainMat);
      body.position.set(sx, 1.99, -2.88);
      kiosk.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 7), isGold ? goldMat : porcelainMat);
      head.position.set(sx, 2.16, -2.88);
      kiosk.add(head);
    }
    // Mỹ nghệ gỗ dừa (chén gỗ dừa & đèn hoa sen tầng 4)
    for (let wi = 0; wi < 6; wi++) {
      const wx = 0.6 + wi * 0.7;
      const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55), coconutWoodMat);
      bowl.position.set(wx, 2.48, -2.88);
      kiosk.add(bowl);
      const incenseBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, 0.3, 0.34),
        new THREE.MeshStandardMaterial({ color: wi % 2 === 0 ? 0xB92D24 : 0xD89B28, roughness: 0.56 })
      );
      incenseBox.position.set(wx, 0.8, -2.88);
      kiosk.add(incenseBox);
    }

    // 1g. VÁCH TRÁI (x = -4.9): TỦ MÁT NƯỚC GIẢI KHÁT + KỆ PHÁP PHỤC ÁO LAM & TÚI VẢI HOA SEN
    const fridge = new THREE.Group();
    fridge.position.set(-4.85, 0.1, -1.55);
    fridge.rotation.y = Math.PI / 2;
    const fridgeBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.42, 2.12, 0.78),
      new THREE.MeshStandardMaterial({ color: 0xF1F5F8, roughness: 0.28, metalness: 0.14 })
    );
    fridgeBody.position.y = 1.06;
    fridge.add(fridgeBody);
    const fridgeHeader = new THREE.Mesh(
      new THREE.BoxGeometry(1.32, 0.26, 0.05),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('NƯỚC MÁT · TRÀ SEN ƯỚP LẠNH', {
          w: 512, h: 110, bg: '#1668B8', border: '#FFFFFF', color: '#FFFFFF', size: 28
        }),
        roughness: 0.32
      })
    );
    fridgeHeader.position.set(0, 1.96, 0.39);
    fridge.add(fridgeHeader);
    const fridgeInterior = new THREE.Mesh(
      new THREE.PlaneGeometry(1.18, 1.56),
      new THREE.MeshBasicMaterial({ color: 0xCBEFFF })
    );
    fridgeInterior.position.set(0, 0.98, 0.4);
    fridge.add(fridgeInterior);
    const bottleColors = [0x24944A, 0xD63B2A, 0xE6A826, 0x2276C8, 0x5CB338, 0xF0EFE8];
    for (let r = 0; r < 4; r++) {
      for (let b = 0; b < 5; b++) {
        const bottle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.038, 0.044, 0.22, 7),
          new THREE.MeshStandardMaterial({ color: bottleColors[(r + b) % bottleColors.length], roughness: 0.25 })
        );
        bottle.position.set(-0.42 + b * 0.21, 0.42 + r * 0.37, 0.42);
        fridge.add(bottle);
      }
    }
    kiosk.add(fridge);

    // Giá treo Pháp Phục Áo Lam & Nón Lá dọc vách trái phía trước (z = 0.2 .. 2.8)
    const rackBar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.75, 8), aluMat);
    rackBar.rotation.x = Math.PI / 2;
    rackBar.position.set(-4.88, 1.88, 1.45);
    kiosk.add(rackBar);
    const robeCols = [0x8E8995, 0x7A8EA4, 0x9B8674, 0xB898A8, 0x748D7A];
    for (let ri = 0; ri < 5; ri++) {
      const robe = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.86, 0.42),
        new THREE.MeshStandardMaterial({ color: robeCols[ri], roughness: 0.78 })
      );
      robe.position.set(-4.88, 1.38, 0.45 + ri * 0.5);
      kiosk.add(robe);
    }

    // 1h. VÁCH PHẢI (x = +4.45): QUẦY THU NGÂN & TỦ KÍNH TRÀNG HẠT (Gọn bên hông phải, KHÔNG chặn lối vào!)
    const sideCounter = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.08, 4.6), counterWoodMat);
    sideCounter.position.set(4.45, 0.64, 0.3);
    sideCounter.castShadow = true;
    kiosk.add(sideCounter);

    const showcaseGlass = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.58, 3.1), glassShowcaseMat);
    showcaseGlass.position.set(4.45, 1.47, 0.95);
    kiosk.add(showcaseGlass);
    const showcaseTopFrame = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.045, 3.16), aluMat);
    showcaseTopFrame.position.set(4.45, 1.77, 0.95);
    kiosk.add(showcaseTopFrame);

    const beadMats = [
      new THREE.MeshStandardMaterial({ color: 0x5E3118, roughness: 0.42 }),
      new THREE.MeshStandardMaterial({ color: 0x2E7D5A, roughness: 0.25 }),
      new THREE.MeshStandardMaterial({ color: 0xD9A234, roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0x8C2A24, roughness: 0.36 })
    ];
    for (let ti = 0; ti < 4; ti++) {
      const tz = -0.25 + ti * 0.78;
      const tray = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.62), velvetTrayMat);
      tray.position.set(4.45, 1.22, tz);
      kiosk.add(tray);
      for (let bi = -1; bi <= 1; bi++) {
        const beads = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 7, 14), beadMats[(ti + bi + 4) % beadMats.length]);
        beads.rotation.x = Math.PI / 2;
        beads.position.set(4.45, 1.26, tz + bi * 0.18);
        kiosk.add(beads);
      }
    }

    // 1i. BÀN TRƯNG BÀY ĐẢO GIỮA THẤP (1.75m x 0.95m) — Khách đi vòng xung quanh chọn Kho Quẹt Chay & Quà Lưu Niệm!
    const islandTable = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.78, 0.95), counterWoodMat);
    islandTable.position.set(-0.2, 0.49, 0.25);
    islandTable.castShadow = true;
    kiosk.add(islandTable);
    const islandCloth = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.05, 1.0),
      new THREE.MeshStandardMaterial({ color: 0x8C251E, roughness: 0.85 })
    );
    islandCloth.position.set(-0.2, 0.9, 0.25);
    kiosk.add(islandCloth);
    // Bày hũ kho quẹt chay, hũ chao môn & khay tràng hạt nổi bật ngay bàn đảo giữa
    for (let ii = 0; ii < 5; ii++) {
      const ix = -0.85 + ii * 0.32;
      const sampleJar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.08, 0.19, 10),
        ii % 2 === 0 ? khoQuetJarMat : chaoJarMat
      );
      sampleJar.position.set(ix, 1.02, 0.08);
      kiosk.add(sampleJar);
      const sampleCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.068, 0.068, 0.035, 10),
        ii % 2 === 0 ? jarCapRedMat : jarCapGoldMat
      );
      sampleCap.position.set(ix, 1.13, 0.08);
      kiosk.add(sampleCap);
    }
    const islandSign = new THREE.Mesh(
      new THREE.BoxGeometry(1.42, 0.34, 0.05),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('KHO QUẸT CHAY · QUÀ CHÙA', {
          w: 640, h: 160, bg: '#FFF7E0', border: '#8C251E', color: '#7A1F16', size: 38
        }),
        roughness: 0.4
      })
    );
    islandSign.position.set(-0.2, 1.16, 0.56);
    islandSign.rotation.x = -0.22;
    kiosk.add(islandSign);

    // 1j. ĐỒ TREO DƯỚI MÁI HIÊN: NÓN LÁ, TÚI VẢI HOA SEN & KHÁNH BÌNH AN (cao > 2.4m không chắn người đi vào!)
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xE8D4A4, roughness: 0.8, side: THREE.DoubleSide });
    for (const hx of [-4.75, -4.15]) {
      for (let hi = 0; hi < 3; hi++) {
        const hat = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.15, 14, 1, true), hatMat);
        hat.position.set(hx, 2.88 - hi * 0.2, 3.65);
        kiosk.add(hat);
      }
    }
    const bagCols = [0xEFE4C8, 0xDCE6D4, 0xF2D8DC];
    for (let bi = 0; bi < 3; bi++) {
      const bag = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.34, 0.06),
        new THREE.MeshStandardMaterial({ color: bagCols[bi], roughness: 0.85 })
      );
      bag.position.set(3.2 + bi * 0.44, 2.75, 3.65);
      kiosk.add(bag);
    }
    for (let ti = 0; ti < 9; ti++) {
      const tx = -3.0 + ti * 0.74;
      const charm = new THREE.Mesh(new THREE.OctahedronGeometry(0.055, 0), goldMat);
      charm.position.set(tx, 3.12, 3.72);
      kiosk.add(charm);
      const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.024, 0.22, 6), velvetTrayMat);
      tassel.position.set(tx, 2.94, 3.72);
      kiosk.add(tassel);
    }

    // 1k. BẢNG HIỆU CHÍNH TRANG NHÃ (tiếng Việt chuẩn chùa Việt)
    const mainSign = new THREE.Mesh(
      new THREE.BoxGeometry(9.6, 0.92, 0.14),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('NHÀ LƯU NIỆM · ĐẶC SẢN CHAY CHÙA VĨNH TRÀNG', {
          w: 1800,
          h: 180,
          bg: '#1B5836',
          border: '#F4CC6A',
          color: '#FFF8E5',
          size: 48
        }),
        roughness: 0.36
      })
    );
    mainSign.position.set(0, 3.68, 3.82);
    kiosk.add(mainSign);

    const subMenuBoard = new THREE.Mesh(
      new THREE.BoxGeometry(1.45, 0.68, 0.08),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('KHO QUẸT CHAY · TRÀNG HẠT · ĐỒ CHÙA', {
          w: 840,
          h: 220,
          bg: '#FFF6DE',
          border: '#1B5836',
          color: '#7A2418',
          size: 36
        }),
        roughness: 0.42
      })
    );
    subMenuBoard.position.set(4.55, 2.42, 3.74);
    kiosk.add(subMenuBoard);

    const trigRing = new THREE.Mesh(
      new THREE.RingGeometry(0.75, 1.08, 28),
      new THREE.MeshBasicMaterial({ color: 0xFFD166, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
    );
    trigRing.rotation.x = -Math.PI / 2;
    trigRing.position.set(0, 0.12, 2.1);
    kiosk.add(trigRing);

    this.exteriorGroup.add(kiosk);
    this.stallAnchors.push(kiosk);
    this.stallClickTargets.push(sideCounter, showcaseGlass, islandTable, mainSign, mainRoof, frontAwning, fridgeBody, trigRing);

    // Đăng ký vùng tương tác bao trùm cả trong và trước cửa Nhà Lưu Niệm để vào trong là mở cửa hàng ngay!
    this.stallTriggers.push({
      x: 42.2,
      z: -32.2,
      radius: 6.2,
      stallType: 'phap_khi',
      title: 'Nhà Lưu Niệm · Đặc Sản Chay Chùa Vĩnh Tràng'
    });

    // Colliders CHỈ BỌC 3 VÁCH TƯỜNG + BÀN ĐẢO GIỮA — MỞ TOANG TOÀN BỘ LỐI ĐI VÀO TRONG NHÀ LƯU NIỆM!
    // Back wall & shelves (world z = -37.2 .. -35.8)
    this.addRectObstacle(36.5, 47.9, -37.2, -35.85);
    // Left wall, fridge & robe rack (world x = 36.5 .. 38.0)
    this.addRectObstacle(36.5, 38.05, -37.2, -29.8);
    // Right wall & side checkout counter (world x = 46.0 .. 47.9)
    this.addRectObstacle(46.0, 47.9, -37.2, -29.8);
    // Compact central display island (walkable all around!)
    this.addRectObstacle(41.15, 42.85, -33.75, -32.75);

    // =========================================================================
    // 2. BÊN PHẢI SÂN RẼ TRÁI (x = 50.8..56.8, z = -27.5..-10.0):
    //    KHÔNG đặt quầy cúng dường hay tiệm tạp hóa trùng lặp!
    //    Bố trí đúng khuôn viên thực tế Chùa Vĩnh Tràng (ảnh flycam image_97204806.png):
    //    - 2 bồn vườn cây kiểng viền đá kem kẹp hai bên lối lát đá rộng dẫn thẳng vào
    //      Văn Phòng Ban Trị Sự · Giảng Đường Huệ Đăng (z = -20.8..-15.4 thông thoáng 100%)
    //    - 3 băng ghế đá công viên chùa dưới bóng cây cho cô bác nghỉ chân
    //    - Trạm "TRÀ ĐÁ MIỄN PHÍ · KÍNH MỜI PHẬT TỬ" đậm tình nghĩa chùa miền Tây
    // =========================================================================
    const lawnMat = new THREE.MeshStandardMaterial({ color: 0x457A38, roughness: 0.84 });
    const stainlessMat = new THREE.MeshStandardMaterial({ color: 0xDDE4EA, roughness: 0.22, metalness: 0.82 });

    const makePagodaStoneBench = (bx, bz, rotY) => {
      const bench = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.11, 0.56), M.stoneLight);
      seat.position.y = 0.46;
      seat.castShadow = true;
      seat.receiveShadow = true;
      bench.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.44, 0.09), M.stoneLight);
      back.position.set(0, 0.72, -0.23);
      back.rotation.x = -0.1;
      back.castShadow = true;
      bench.add(back);
      for (const lx of [-0.72, 0.72]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.44, 0.46), M.stoneDark);
        leg.position.set(lx, 0.22, 0);
        bench.add(leg);
      }
      bench.position.set(bx, 0, bz);
      bench.rotation.y = rotY;
      this.exteriorGroup.add(bench);
    };

    const buildRightGardenBed = (cx, cz, w, d) => {
      const bed = new THREE.Group();
      bed.position.set(cx, 0, cz);
      const curb = new THREE.Mesh(new THREE.BoxGeometry(w, 0.34, d), M.creamTrim);
      curb.position.y = 0.17;
      curb.receiveShadow = true;
      curb.castShadow = true;
      bed.add(curb);
      const soil = new THREE.Mesh(new THREE.BoxGeometry(w - 0.52, 0.38, d - 0.52), lawnMat);
      soil.position.y = 0.19;
      soil.receiveShadow = true;
      bed.add(soil);
      this.exteriorGroup.add(bed);
      return bed;
    };

    // 2a. Bồn cây kiểng phía Nam lối vào Giảng Đường (x = 51.0..56.8, z = -15.0..-10.2)
    buildRightGardenBed(53.9, -12.6, 5.8, 4.8);
    const southBonsai = this.makeBonsai72(0.84);
    southBonsai.position.set(55.2, 0.35, -11.4);
    this.exteriorGroup.add(southBonsai);

    // Trạm Trà Đá Miễn Phí (góc Tây-Nam bồn cây, quay mặt ra sân rẽ trái -X)
    const teaStation = new THREE.Group();
    teaStation.position.set(52.4, 0, -13.3);
    teaStation.rotation.y = -Math.PI * 0.5;
    teaStation.userData.stallType = 'am_thuc_chay';
    teaStation.userData.stallTitle = 'Trạm Trà Đá Miễn Phí · Quà Chay Chùa Vĩnh Tràng';

    const tsPad = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.22, 1.7), M.stoneLight);
    tsPad.position.y = 0.11;
    tsPad.receiveShadow = true;
    teaStation.add(tsPad);
    for (const px of [-0.95, 0.95]) {
      for (const pz of [-0.62, 0.62]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 2.28, 8), darkTrimWoodMat);
        post.position.set(px, 1.32, pz);
        post.castShadow = true;
        teaStation.add(post);
      }
    }
    const tsRoof = makeHippedRoofMesh(2.8, 2.05, 0.68, M.roofTile);
    tsRoof.position.y = 2.74;
    tsRoof.castShadow = true;
    teaStation.add(tsRoof);

    const tsStand = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.82, 0.72), counterWoodMat);
    tsStand.position.set(0, 0.62, 0.05);
    tsStand.castShadow = true;
    teaStation.add(tsStand);

    // Bình trà đá inox bóng sạch có vòi rót & khay ly uống nước
    const urnBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.56, 16), stainlessMat);
    urnBody.position.set(-0.34, 1.31, 0.05);
    urnBody.castShadow = true;
    teaStation.add(urnBody);
    const urnLid = new THREE.Mesh(new THREE.CylinderGeometry(0.255, 0.255, 0.06, 16), stainlessMat);
    urnLid.position.set(-0.34, 1.62, 0.05);
    teaStation.add(urnLid);
    const urnTap = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.12), darkTrimWoodMat);
    urnTap.position.set(-0.34, 1.12, 0.3);
    teaStation.add(urnTap);

    const cupTray = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.04, 0.36), stainlessMat);
    cupTray.position.set(0.38, 1.06, 0.06);
    teaStation.add(cupTray);
    for (let ci = 0; ci < 3; ci++) {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.032, 0.11, 10), porcelainMat);
      cup.position.set(0.22 + ci * 0.16, 1.13, 0.06);
      teaStation.add(cup);
    }

    const tsSign = new THREE.Mesh(
      new THREE.BoxGeometry(2.25, 0.44, 0.08),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('TRÀ ĐÁ MIỄN PHÍ · KÍNH MỜI PHẬT TỬ', {
          w: 960,
          h: 170,
          bg: '#FFF6DE',
          border: '#1B5836',
          color: '#174A2E',
          size: 38
        }),
        roughness: 0.38
      })
    );
    tsSign.position.set(0, 2.28, 0.82);
    teaStation.add(tsSign);

    this.exteriorGroup.add(teaStation);
    this.stallClickTargets.push(tsStand, urnBody, tsSign, tsRoof);
    this.addRectObstacle(50.8, 56.8, -15.0, -10.2);

    // Ghế đá nghỉ chân đặt gọn cạnh bồn cây phía Nam
    makePagodaStoneBench(50.35, -11.4, -Math.PI * 0.5);

    // 2b. Bồn cây kiểng phía Bắc lối vào Giảng Đường (x = 51.0..56.8, z = -27.4..-21.0)
    buildRightGardenBed(53.9, -24.2, 5.8, 6.4);
    const northBonsaiA = this.makeBonsai72(0.88);
    northBonsaiA.position.set(54.8, 0.35, -22.5);
    this.exteriorGroup.add(northBonsaiA);
    const northBonsaiB = this.makeBonsai72(0.76);
    northBonsaiB.position.set(54.6, 0.35, -25.8);
    this.exteriorGroup.add(northBonsaiB);

    const gardenLantern = this.makeStoneLantern();
    gardenLantern.position.set(52.3, 0.34, -24.2);
    this.exteriorGroup.add(gardenLantern);

    // Bụi hoa kiểng nở rực rỡ ven bồn cây
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xDF487E, roughness: 0.72 });
    for (const [fx, fz] of [
      [52.5, -22.0], [52.6, -26.3], [55.2, -14.0], [53.6, -10.9]
    ]) {
      const shrub = new THREE.Mesh(new THREE.DodecahedronGeometry(0.46, 1), M.foliageMid);
      shrub.scale.set(1.15, 0.72, 1.15);
      shrub.position.set(fx, 0.62, fz);
      this.exteriorGroup.add(shrub);
      const bloom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 1), flowerMat);
      bloom.position.set(fx + 0.12, 0.92, fz - 0.08);
      this.exteriorGroup.add(bloom);
    }

    // 2 băng ghế đá công viên chùa đặt sát rìa bồn cây phía Bắc hướng ra sân
    makePagodaStoneBench(50.35, -22.8, -Math.PI * 0.5);
    makePagodaStoneBench(50.35, -25.6, -Math.PI * 0.5);
    this.addRectObstacle(50.0, 56.8, -27.4, -21.0);

    // =========================================================================
    // 3. XE CÀ REM MỸ THO · DỪA XIÊM NGOÀI CỔNG PHỤ (khớp ảnh thật image_bb72a8b0.png)
    // =========================================================================
    const cart = new THREE.Group();
    cart.position.set(46.2, 0, 44.8);
    cart.rotation.y = -Math.PI * 0.5;
    cart.userData.stallType = 'am_thuc_chay';
    cart.userData.stallTitle = 'Xe Cà Rem Mỹ Tho · Dừa Xiêm Cổng Phụ';
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
        x: 42.2,
        z: -28.6,
        radius: 5.8,
        stallType: 'phap_khi',
        title: 'Quầy Lưu Niệm · Văn Hóa Phẩm Phật Giáo',
        ring: trigRing
      },
      {
        x: 49.4,
        z: -13.3,
        radius: 4.2,
        stallType: 'am_thuc_chay',
        title: 'Trạm Trà Đá Miễn Phí · Quà Chay Chùa Vĩnh Tràng',
        ring: null
      },
      {
        x: 43.6,
        z: 44.8,
        radius: 4.5,
        stallType: 'am_thuc_chay',
        title: 'Xe Cà Rem Mỹ Tho · Dừa Xiêm Cổng Phụ',
        ring: null
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
    // Dãy Văn Phòng Ban Trị Sự · Giảng Đường Huệ Đăng phía Đông (khớp dáng nhà mái dài tường vàng kem
    // trong ảnh flycam thực tế Chùa Vĩnh Tràng image_97204806.png)
    const M = this.MAT;
    const g = new THREE.Group();

    const slateRoofMat = new THREE.MeshStandardMaterial({
      map: this.tinRoofTex,
      color: 0x5C534A,
      roughness: 0.64,
      metalness: 0.16
    });
    const shutterGreenMat = new THREE.MeshStandardMaterial({ color: 0x2F5E48, roughness: 0.68 });
    const doorWoodMat = new THREE.MeshStandardMaterial({ color: 0x62361D, map: this.woodGrainTex, roughness: 0.58 });
    const goldWheelMat = new THREE.MeshStandardMaterial({ color: 0xE6B83E, roughness: 0.3, metalness: 0.58 });

    // Nền hiên đá nâng cao
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.48, 20.2), M.stoneLight);
    plinth.position.y = 0.24;
    plinth.receiveShadow = true;
    plinth.castShadow = true;
    g.add(plinth);

    // Khối nhà chính 1 trệt 1 lầu tường vàng kem phào chỉ Nam Bộ
    const f1 = new THREE.Mesh(new THREE.BoxGeometry(8.2, 4.1, 18.8), M.goldWall);
    f1.position.set(0.85, 2.53, 0);
    f1.castShadow = true;
    f1.receiveShadow = true;
    g.add(f1);

    const midCornice = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.26, 19.6), M.creamTrim);
    midCornice.position.set(0.1, 4.66, 0);
    g.add(midCornice);

    const f2 = new THREE.Mesh(new THREE.BoxGeometry(8.6, 3.3, 18.4), M.goldLight);
    f2.position.set(0.65, 6.44, 0);
    f2.castShadow = true;
    g.add(f2);

    // Hàng cột hành lang mặt Tây (-X) hướng ra vườn cây kiểng & sân rẽ trái
    for (let ci = 0; ci < 7; ci++) {
      const cz = -8.4 + ci * 2.8;
      const colBase = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.32, 0.46), M.creamTrim);
      colBase.position.set(-4.65, 0.64, cz);
      g.add(colBase);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 3.7, 12), M.creamTrim);
      col.position.set(-4.65, 2.65, cz);
      col.castShadow = true;
      g.add(col);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.2, 0.48), M.goldAccent);
      cap.position.set(-4.65, 4.52, cz);
      g.add(cap);
    }

    // Lan can con tiện dọc hiên (chừa rộng cửa chính z = -2.0..+2.0)
    for (const [minZ, maxZ] of [[-8.4, -2.1], [2.1, 8.4]]) {
      const span = maxZ - minZ;
      const midZ = (minZ + maxZ) * 0.5;
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.68, span), M.creamTrim);
      rail.position.set(-4.65, 0.92, midZ);
      g.add(rail);
    }

    // Cửa chính 2 cánh gỗ lớn + cửa sổ lá sách xanh Nam Bộ cả 2 tầng
    const mainDoorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.05, 3.1), M.creamTrim);
    mainDoorFrame.position.set(-3.26, 2.02, 0);
    g.add(mainDoorFrame);
    const mainDoor = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.75, 2.7), doorWoodMat);
    mainDoor.position.set(-3.32, 1.9, 0);
    g.add(mainDoor);

    for (const wz of [-6.8, -4.0, 4.0, 6.8]) {
      // Cửa sổ trệt
      const win1Frame = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.65, 1.35), M.creamTrim);
      win1Frame.position.set(-3.26, 2.55, wz);
      g.add(win1Frame);
      const win1Leaf = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.42, 1.12), shutterGreenMat);
      win1Leaf.position.set(-3.32, 2.55, wz);
      g.add(win1Leaf);
    }
    for (const wz of [-6.8, -3.4, 0, 3.4, 6.8]) {
      // Cửa sổ lầu trên
      const win2Frame = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.5, 1.35), M.creamTrim);
      win2Frame.position.set(-3.66, 6.4, wz);
      g.add(win2Frame);
      const win2Leaf = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.28, 1.12), shutterGreenMat);
      win2Leaf.position.set(-3.72, 6.4, wz);
      g.add(win2Leaf);
    }

    // Mái dốc xám nâu cổ điển + đầu hồi tam giác gắn Bánh Xe Pháp Luân vàng
    const roof = makeHippedRoofMesh(11.6, 21.0, 2.75, slateRoofMat);
    roof.position.set(0.35, 9.42, 0);
    roof.castShadow = true;
    g.add(roof);

    const roofRidge = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 13.8), M.creamTrim);
    roofRidge.position.set(0.35, 10.78, 0);
    g.add(roofRidge);

    const frontPediment = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.45, 5.2), M.creamTrim);
    frontPediment.position.set(-3.85, 8.75, 0);
    g.add(frontPediment);
    const dharmaWheel = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 8, 16), goldWheelMat);
    dharmaWheel.rotation.y = Math.PI / 2;
    dharmaWheel.position.set(-4.04, 8.78, 0);
    g.add(dharmaWheel);
    const dharmaHub = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), goldWheelMat);
    dharmaHub.position.set(-4.04, 8.78, 0);
    g.add(dharmaHub);

    // Biển hiệu trang nghiêm trên mái hiên
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(7.6, 0.92, 0.16),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('VĂN PHÒNG BAN TRỊ SỰ · GIẢNG ĐƯỜNG HUỆ ĐĂNG', {
          w: 1600,
          h: 200,
          bg: '#5C1610',
          border: '#FFD875',
          color: '#FFF4C8',
          size: 48
        }),
        roughness: 0.4
      })
    );
    sign.rotation.y = -Math.PI / 2;
    sign.position.set(-4.95, 4.92, 0);
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

    // 1. Đại tượng Phật A Di Đà — đặt đúng trên trục vườn giữa phía trước Bảo Tháp 7 tầng (khớp ảnh flycam image_97204806.png)
    // Tư liệu thực tế: thân tượng 18m, đài sen và bệ khoảng 7m, tổng chiều cao khoảng 25m.
    this.adidaGroup = new THREE.Group();
    this.adidaGroup.position.set(-9.5, 0, -23.5);
    const adidaPlaza = new THREE.Mesh(
      new THREE.CylinderGeometry(7.8, 8.2, 0.18, 32),
      M.stoneLight
    );
    adidaPlaza.position.y = 0.09;
    adidaPlaza.receiveShadow = true;
    this.adidaGroup.add(adidaPlaza);
    const adidaTerrace = new THREE.Mesh(
      new THREE.CylinderGeometry(5.6, 6.2, 0.42, 24),
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
      const tx = Math.sin(ang) * 8.6;
      const tz = -Math.cos(ang) * 8.6;
      const t = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 3.8, 10), M.trunk);
      trunk.position.y = 1.9;
      t.add(trunk);
      const crown = new THREE.Mesh(new THREE.SphereGeometry(1.75, 16, 12), M.foliageDark);
      crown.position.y = 4.0;
      crown.scale.set(1.18, 0.92, 1.12);
      t.add(crown);
      t.position.set(tx, 0, tz);
      this.adidaGroup.add(t);
    }
    this.exteriorGroup.add(this.adidaGroup);
    this.addObstacle(-9.5, -23.5, 6.2);

    // 2. Đại tượng Phật Di Lặc — công viên phía Tây Nam (bên trái khi từ cổng nhìn vào, khớp image_97204806.png).
    // Tượng thực tế dài 27m, rộng 18m, cao 20m; khối đế là công trình kiến trúc bên dưới tượng.
    this.dilacGroup = new THREE.Group();
    this.dilacGroup.position.set(-26.5, 0, 4.0);
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
    this.addRectObstacle(-40.5, -12.5, -4.5, 14.9);

    // West garden plaza: low planters and clipped tropical shrubs frame the Di Lặc courtyard.
    for (const wx of [-38.2, -15.2]) {
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

    // 3. Đại tượng Phật Thích Ca nhập Niết Bàn — ngay phía sau mái ngói Chánh điện, bên phải Bảo Tháp 7 tầng (khớp image_97204806.png!).
    // Bệ đá 3 tầng cao 3.6m cùng 5 bậc tam cấp phía Nam hướng Phật tử.
    this.nietBanGroup = new THREE.Group();
    this.nietBanGroup.position.set(14.5, 0, -49.0);
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
    this.addRectObstacle(-3.0, 32.0, -58.0, -40.0);

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
    const qaHalo = new THREE.Mesh(
      new THREE.RingGeometry(0.58, 0.72, 24),
      new THREE.MeshBasicMaterial({ color: 0xFFE296, side: THREE.DoubleSide })
    );
    qaHalo.position.set(0, 5.62, -0.18);
    this.quanAmGroup.add(qaHalo);
    this.quanAmPlaceholderParts.push(qaRobeLower, qaTorso, qaHead, qaCrown, qaVeil, qaLeftArm, camLoVase, qaRightArm, qaHalo);

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
