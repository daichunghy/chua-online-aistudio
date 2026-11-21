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
    // KHU CUỐI ĐƯỜNG BÊN PHẢI CHÙA VĨNH TRÀNG (x = 36.8..56.8, z = -41.4..-10)
    // 1) NHÀ LƯU NIỆM · CỬA HÀNG VĂN HÓA PHẨM PHẬT GIÁO (tòa nhà kín 4 vách,
    //    mái ngói dốc truyền thống, bố trí lối đi & dãy kệ theo hàng dọc Bắc-Nam,
    //    sản phẩm 3D nhiều chi tiết có nhãn tiếng Việt chân thực).
    // 2) Khu sân vườn nghỉ chân & Trạm Trà Đá Miễn Phí phía Đông dẫn vào Giảng Đường.
    // =========================================================================
    const M = this.MAT;

    // Helper: create crisp printed Vietnamese packaging/label CanvasTextures
    const makeProductLabelTex = (bgHex, accentHex, title, subtitle = '') => {
      const cv = document.createElement('canvas');
      cv.width = 256;
      cv.height = 128;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = bgHex;
      ctx.fillRect(0, 0, 256, 128);
      ctx.fillStyle = accentHex;
      ctx.fillRect(0, 0, 256, 22);
      ctx.fillRect(0, 106, 256, 22);
      ctx.strokeStyle = '#F6D372';
      ctx.lineWidth = 4;
      ctx.strokeRect(8, 28, 240, 72);
      ctx.fillStyle = '#FFF9E8';
      ctx.font = 'bold 24px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(title, 128, subtitle ? 55 : 66);
      if (subtitle) {
        ctx.fillStyle = '#FDE5A8';
        ctx.font = '600 16px sans-serif';
        ctx.fillText(subtitle, 128, 82);
      }
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const creamWallMat = new THREE.MeshStandardMaterial({
      color: 0xF3E6C8,
      map: this.limeWallTex,
      bumpMap: this.stoneBumpTex,
      bumpScale: 0.015,
      roughness: 0.84
    });
    const pilasterMat = new THREE.MeshStandardMaterial({
      color: 0xE6D3AA,
      map: this.limeWallTex,
      bumpMap: this.stoneBumpTex,
      bumpScale: 0.016,
      roughness: 0.78
    });
    const wainscotWoodMat = new THREE.MeshStandardMaterial({
      color: 0x5E361C,
      map: this.woodGrainTex,
      bumpMap: this.woodBumpTex,
      bumpScale: 0.018,
      roughness: 0.64
    });
    const shelfWoodMat = new THREE.MeshStandardMaterial({
      color: 0x7A4824,
      map: this.woodGrainTex,
      bumpMap: this.woodBumpTex,
      bumpScale: 0.014,
      roughness: 0.56
    });
    const darkTrimWoodMat = new THREE.MeshStandardMaterial({
      color: 0x3F2212,
      map: this.woodGrainTex,
      roughness: 0.68
    });
    const shutterGreenMat = new THREE.MeshStandardMaterial({
      color: 0x1F563A,
      map: this.woodGrainTex,
      roughness: 0.58
    });
    const roofTileMat = new THREE.MeshStandardMaterial({
      map: this.roofTex,
      bumpMap: this.roofBumpTex,
      bumpScale: 0.025,
      color: 0xB84A2C,
      roughness: 0.68
    });
    const ridgeCreamMat = new THREE.MeshStandardMaterial({
      color: 0xEBDCC0,
      map: this.graniteLightTex || this.limeWallTex,
      roughness: 0.72
    });
    const floorTileMat = new THREE.MeshStandardMaterial({
      map: this.gachBongTex || this.pavingTex,
      bumpMap: this.gachTauBumpTex || this.stoneBumpTex,
      bumpScale: 0.01,
      color: 0xF0E8D8,
      roughness: 0.52
    });
    const stoneStepMat = M.stoneLight;
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xD9F0F6,
      roughness: 0.1,
      metalness: 0.18,
      transparent: true,
      opacity: 0.36
    });
    const aluMat = new THREE.MeshStandardMaterial({ color: 0xCFD6DC, roughness: 0.3, metalness: 0.7 });
    const velvetTrayMat = new THREE.MeshStandardMaterial({ color: 0x7D1F1D, roughness: 0.88 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xE5B53A, roughness: 0.28, metalness: 0.64 });
    const bronzeMat = M.bronzeBurner;
    const porcelainMat = new THREE.MeshStandardMaterial({ color: 0xF7F5EE, roughness: 0.22, metalness: 0.04 });

    // Product-specific labeled materials
    const khoQuetLabelMat = new THREE.MeshStandardMaterial({
      map: makeProductLabelTex('#6A2414', '#C63D22', 'KHO QUẸT CHAY', 'Mỹ Tho · 250g'),
      roughness: 0.36
    });
    const chaoLabelMat = new THREE.MeshStandardMaterial({
      map: makeProductLabelTex('#A86E1D', '#2D6B44', 'CHAO MÔN CHAY', 'Béo Thơm · 300g'),
      roughness: 0.38
    });
    const banhPiaLabelMat = new THREE.MeshStandardMaterial({
      map: makeProductLabelTex('#B32C22', '#D89E2A', 'BÁNH PÍA CHAY', 'Đậu Xanh Sầu Riêng'),
      roughness: 0.48
    });
    const traSenLabelMat = new THREE.MeshStandardMaterial({
      map: makeProductLabelTex('#1D5E3C', '#D8A438', 'TRÀ SEN CỔ TỰ', 'Hương Sen Thanh Tịnh'),
      roughness: 0.46
    });
    const nhangTramLabelMat = new THREE.MeshStandardMaterial({
      map: makeProductLabelTex('#8E2118', '#E0B244', 'NHANG TRẦM SẠCH', '100% Tự Nhiên'),
      roughness: 0.44
    });
    const kinhSachLabelMat = new THREE.MeshStandardMaterial({
      map: makeProductLabelTex('#78201C', '#CFA13E', 'KINH NHẬT TỤNG', 'Chùa Vĩnh Tràng'),
      roughness: 0.62
    });
    const jarGlassDarkMat = new THREE.MeshStandardMaterial({ color: 0x4C2210, roughness: 0.16, metalness: 0.08 });
    const jarGlassCreamMat = new THREE.MeshStandardMaterial({ color: 0xE7D29B, roughness: 0.22 });
    const jarCapRedMat = new THREE.MeshStandardMaterial({ color: 0xB82D24, roughness: 0.32 });
    const jarCapGoldMat = new THREE.MeshStandardMaterial({ color: 0xD9A234, roughness: 0.28, metalness: 0.42 });
    const coconutWoodMat = new THREE.MeshStandardMaterial({ color: 0x6A3A1E, map: this.woodGrainTex, roughness: 0.42 });

    // =========================================================================
    // 1. TÒA NHÀ LƯU NIỆM · CỬA HÀNG VĂN HÓA PHẨM PHẬT GIÁO (10.8m × 16.4m)
    //    Bố trí KÍN 4 VÁCH, cửa chính mở rộng 3.2m quay về hướng Nam (+Z),
    //    bên trong chia 2 lối đi dọc thông thoáng (Tây & Đông) dọc kệ giữa hàng dọc.
    // =========================================================================
    const W = 10.8; // East-West width
    const D = 16.4; // North-South depth (longitudinal "theo hàng dọc")
    const H = 4.25; // Wall height
    const halfW = W * 0.5; // 5.4
    const halfD = D * 0.5; // 8.2

    const kiosk = new THREE.Group();
    kiosk.position.set(42.2, 0, -33.2);
    kiosk.userData.stallType = 'all';
    kiosk.userData.stallTitle = 'Nhà Lưu Niệm · Cửa Hàng Văn Hóa Phẩm Vĩnh Tràng';

    // 1a. Nền móng đá + sàn gạch bông cổ toàn bộ bên trong + bậc tam cấp cửa trước
    const foundation = new THREE.Mesh(new THREE.BoxGeometry(W + 0.55, 0.22, D + 0.55), stoneStepMat);
    foundation.position.set(0, 0.11, 0);
    foundation.receiveShadow = true;
    kiosk.add(foundation);

    const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(W - 0.16, 0.04, D - 0.16), floorTileMat);
    floorMesh.position.set(0, 0.23, 0);
    floorMesh.receiveShadow = true;
    kiosk.add(floorMesh);

    const entryStep1 = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.12, 0.72), stoneStepMat);
    entryStep1.position.set(0, 0.06, halfD + 0.55);
    entryStep1.receiveShadow = true;
    kiosk.add(entryStep1);

    const entryMat = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.025, 0.95),
      new THREE.MeshStandardMaterial({ color: 0x7E241C, roughness: 0.9 })
    );
    entryMat.position.set(0, 0.26, halfD - 0.55);
    kiosk.add(entryMat);

    // 1b. TƯỜNG BAO KÍN 4 MẶT (Bắc, Tây, Đông, và Mặt Tiền Nam có cửa đôi 3.2m + 2 cửa kính trưng bày)
    // --- Tường Bắc (sau, z = -halfD) ---
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.26), creamWallMat);
    northWall.position.set(0, 0.22 + H * 0.5, -halfD + 0.13);
    northWall.castShadow = true;
    northWall.receiveShadow = true;
    kiosk.add(northWall);

    const northWainscot = new THREE.Mesh(new THREE.BoxGeometry(W - 0.3, 1.15, 0.08), wainscotWoodMat);
    northWainscot.position.set(0, 0.8, -halfD + 0.28);
    kiosk.add(northWainscot);

    // --- Tường Tây (x = -halfW) & Tường Đông (x = +halfW): Kín hoàn toàn, có 3 cửa sổ kính khung gỗ xanh mỗi bên ---
    const winZs = [-4.6, 0.0, 4.6];
    for (const side of [-1, 1]) {
      const wx = side * (halfW - 0.13);
      // Lower solid wall below windows (height 1.25m)
      const sideLower = new THREE.Mesh(new THREE.BoxGeometry(0.26, 1.25, D), creamWallMat);
      sideLower.position.set(wx, 0.22 + 0.625, 0);
      sideLower.castShadow = true;
      sideLower.receiveShadow = true;
      kiosk.add(sideLower);

      const sideWainscot = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.12, D - 0.4), wainscotWoodMat);
      sideWainscot.position.set(wx - side * 0.14, 0.78, 0);
      kiosk.add(sideWainscot);

      // Upper header wall above windows (y = 3.05..4.47)
      const sideUpper = new THREE.Mesh(new THREE.BoxGeometry(0.26, 1.42, D), creamWallMat);
      sideUpper.position.set(wx, 0.22 + 2.83 + 0.71, 0);
      sideUpper.castShadow = true;
      kiosk.add(sideUpper);

      // Solid wall piers between the 3 windows
      const pierSegments = [
        [-8.2, -5.55],
        [-3.65, -0.95],
        [0.95, 3.65],
        [5.55, 8.2]
      ];
      for (const [z0, z1] of pierSegments) {
        const len = z1 - z0;
        const pier = new THREE.Mesh(new THREE.BoxGeometry(0.26, 1.62, len), creamWallMat);
        pier.position.set(wx, 0.22 + 1.25 + 0.81, (z0 + z1) * 0.5);
        pier.castShadow = true;
        kiosk.add(pier);
      }

      // Exterior classical pilasters along the long walls
      for (const pz of [-8.0, -3.2, 0.0, 3.2, 8.0]) {
        const pil = new THREE.Mesh(new THREE.BoxGeometry(0.36, H, 0.36), pilasterMat);
        pil.position.set(wx, 0.22 + H * 0.5, pz);
        kiosk.add(pil);
      }

      // 3 Windows with wooden frames, glass panes & exterior green louvered shutters
      for (const wz of winZs) {
        const frameTop = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 2.02), shutterGreenMat);
        frameTop.position.set(wx, 3.06, wz);
        kiosk.add(frameTop);
        const frameBot = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.1, 2.04), pilasterMat);
        frameBot.position.set(wx, 1.47, wz);
        kiosk.add(frameBot);
        const pane = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.52, 1.88), glassMat);
        pane.position.set(wx, 2.26, wz);
        kiosk.add(pane);
        const mullionV = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.54, 0.07), shutterGreenMat);
        mullionV.position.set(wx, 2.26, wz);
        kiosk.add(mullionV);
        const mullionH = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 1.88), shutterGreenMat);
        mullionH.position.set(wx, 2.26, wz);
        kiosk.add(mullionH);

        // Open exterior wooden louvered shutters flanking each window
        for (const shDir of [-1, 1]) {
          const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.54, 0.58), shutterGreenMat);
          shutter.position.set(wx + side * 0.17, 2.26, wz + shDir * 1.24);
          kiosk.add(shutter);
        }
      }
    }

    // --- Tường Mặt Tiền Nam (z = +halfD): Kín 2 cánh + cửa đôi rộng 3.2m + 2 cửa kính trưng bày ---
    const frontZ = halfD - 0.13;
    // Transom wall above front doorway & display windows (y = 3.05..4.47)
    const frontHeader = new THREE.Mesh(new THREE.BoxGeometry(W, 1.42, 0.28), creamWallMat);
    frontHeader.position.set(0, 0.22 + 2.83 + 0.71, frontZ);
    frontHeader.castShadow = true;
    kiosk.add(frontHeader);

    // Left & Right front wall wings (each x = ±1.6 .. ±5.4, with a 2.1m wide glass shopfront window)
    for (const side of [-1, 1]) {
      // Lower plinth wall under front shopfront window (height 0.92m)
      const fLower = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.92, 0.28), creamWallMat);
      fLower.position.set(side * 3.5, 0.22 + 0.46, frontZ);
      fLower.castShadow = true;
      kiosk.add(fLower);

      // Doorway jamb column (x = ±1.76)
      const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.34, 2.86, 0.34), pilasterMat);
      jamb.position.set(side * 1.76, 0.22 + 1.43, frontZ);
      jamb.castShadow = true;
      kiosk.add(jamb);

      // Corner front wall pier (x = ±5.02)
      const cornerPier = new THREE.Mesh(new THREE.BoxGeometry(0.76, 2.86, 0.28), creamWallMat);
      cornerPier.position.set(side * 5.02, 0.22 + 1.43, frontZ);
      cornerPier.castShadow = true;
      kiosk.add(cornerPier);

      // Glass shopfront display window (x = ±3.35, width 2.7m)
      const shopWinGlass = new THREE.Mesh(new THREE.BoxGeometry(2.72, 1.9, 0.06), glassMat);
      shopWinGlass.position.set(side * 3.32, 0.22 + 0.92 + 0.95, frontZ);
      kiosk.add(shopWinGlass);
      for (const mx of [-0.9, 0, 0.9]) {
        const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.92, 0.1), darkTrimWoodMat);
        mullion.position.set(side * 3.32 + mx, 0.22 + 0.92 + 0.95, frontZ);
        kiosk.add(mullion);
      }
      const winSill = new THREE.Mesh(new THREE.BoxGeometry(2.84, 0.1, 0.36), pilasterMat);
      winSill.position.set(side * 3.32, 0.22 + 0.94, frontZ);
      kiosk.add(winSill);

      // Open double timber-glass entry doors folded neatly inward at doorway edges (x = ±1.56)
      const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.74, 1.25), darkTrimWoodMat);
      doorLeaf.position.set(side * 1.54, 0.22 + 1.37, frontZ - 0.68);
      kiosk.add(doorLeaf);
      const doorGlassInset = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.45, 0.92), glassMat);
      doorGlassInset.position.set(side * 1.54, 0.22 + 1.85, frontZ - 0.68);
      kiosk.add(doorGlassInset);
    }

    // Wooden carved lintel over the 3.2m front entrance
    const doorLintel = new THREE.Mesh(new THREE.BoxGeometry(3.85, 0.18, 0.36), darkTrimWoodMat);
    doorLintel.position.set(0, 0.22 + 2.86, frontZ);
    kiosk.add(doorLintel);

    // Interior timber ceiling beam grid (visible when walking inside!)
    const ceilingSlab = new THREE.Mesh(
      new THREE.BoxGeometry(W - 0.2, 0.12, D - 0.2),
      new THREE.MeshStandardMaterial({ color: 0xEADCC2, roughness: 0.85 })
    );
    ceilingSlab.position.set(0, 0.22 + H - 0.06, 0);
    kiosk.add(ceilingSlab);
    for (const bz of [-6.0, -3.0, 0, 3.0, 6.0]) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(W - 0.4, 0.22, 0.18), darkTrimWoodMat);
      beam.position.set(0, 0.22 + H - 0.2, bz);
      kiosk.add(beam);
    }

    // 1c. MÁI NGÓI DỐC TRUYỀN THỐNG + MÁI HIÊN CHỐNG NẮNG CỬA CHÍNH
    const mainRoof = makeHippedRoofMesh(W + 1.5, D + 1.5, 2.45, roofTileMat);
    mainRoof.position.set(0, 0.22 + H + 1.2, 0);
    mainRoof.castShadow = true;
    kiosk.add(mainRoof);

    const roofRidge = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, D - 4.4), ridgeCreamMat);
    roofRidge.position.set(0, 0.22 + H + 2.46, 0);
    kiosk.add(roofRidge);

    const frontAwning = new THREE.Mesh(new THREE.BoxGeometry(W + 0.8, 0.12, 1.95), roofTileMat);
    frontAwning.position.set(0, 3.55, halfD + 0.88);
    frontAwning.rotation.x = 0.24;
    frontAwning.castShadow = true;
    kiosk.add(frontAwning);

    // 2 front porch support columns outside doorway edges (x = ±2.15, z = halfD + 1.65)
    for (const side of [-1, 1]) {
      const porchCol = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 3.15, 12), pilasterMat);
      porchCol.position.set(side * 2.15, 0.22 + 1.57, halfD + 1.55);
      porchCol.castShadow = true;
      kiosk.add(porchCol);
    }

    // 1d. BẢNG HIỆU MẶT TIỀN TRANG NHÃ + 6 ĐÈN LỒNG GỖ ẤM BÊN TRONG DỌC 2 LỐI ĐI
    const mainSign = new THREE.Mesh(
      new THREE.BoxGeometry(8.8, 0.96, 0.16),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('NHÀ LƯU NIỆM · VĂN HÓA PHẨM CHÙA VĨNH TRÀNG', {
          w: 1800,
          h: 200,
          bg: '#194F32',
          border: '#F3CA68',
          color: '#FFF8E4',
          size: 48
        }),
        roughness: 0.36
      })
    );
    mainSign.position.set(0, 4.02, halfD + 0.18);
    kiosk.add(mainSign);

    const doorSign = new THREE.Mesh(
      new THREE.BoxGeometry(2.85, 0.48, 0.08),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('MỜI VÀO CHỌN ĐỒ · GIAO SHOPEE TOÀN QUỐC', {
          w: 980,
          h: 150,
          bg: '#C4381A',
          border: '#F7D472',
          color: '#FFF8E4',
          size: 34
        }),
        roughness: 0.38
      })
    );
    doorSign.position.set(0, 3.24, halfD + 0.12);
    kiosk.add(doorSign);

    // 2 Bảng đứng giới thiệu sản phẩm bán chạy đặt gọn hai bên hiên (không chắn lối vào 3.2m!)
    const makePorchStandee = (x, labelLine1, labelLine2, bgHex, stallType, stallTitle) => {
      const standee = new THREE.Group();
      standee.position.set(x, 0.0, halfD + 1.18);
      standee.rotation.y = x < 0 ? 0.18 : -0.18;
      standee.userData.stallType = stallType;
      standee.userData.stallTitle = stallTitle;

      const frameMat = darkTrimWoodMat;
      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.48, 0.06), frameMat);
      legL.position.set(-0.48, 0.74, 0.06);
      legL.rotation.x = -0.12;
      standee.add(legL);
      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.48, 0.06), frameMat);
      legR.position.set(0.48, 0.74, 0.06);
      legR.rotation.x = -0.12;
      standee.add(legR);
      const backLegL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.38, 0.05), frameMat);
      backLegL.position.set(-0.46, 0.68, -0.22);
      backLegL.rotation.x = 0.22;
      standee.add(backLegL);
      const backLegR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.38, 0.05), frameMat);
      backLegR.position.set(0.46, 0.68, -0.22);
      backLegR.rotation.x = 0.22;
      standee.add(backLegR);

      const posterTex = makeTextTex(`${labelLine1}`, {
        w: 760,
        h: 920,
        bg: bgHex,
        border: '#F6D16A',
        color: '#FFF9E8',
        size: 40
      });
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(0.94, 1.16, 0.05),
        new THREE.MeshStandardMaterial({ map: posterTex, roughness: 0.34 })
      );
      board.position.set(0, 0.86, 0.06);
      board.rotation.x = -0.12;
      board.userData.stallType = stallType;
      board.userData.stallTitle = stallTitle;
      standee.add(board);

      const headerRibbon = new THREE.Mesh(
        new THREE.BoxGeometry(0.96, 0.24, 0.07),
        new THREE.MeshStandardMaterial({
          map: makeTextTex(labelLine2, {
            w: 620,
            h: 120,
            bg: '#EE4D2D',
            border: '#FFE28A',
            color: '#FFFFFF',
            size: 30
          }),
          roughness: 0.3
        })
      );
      headerRibbon.position.set(0, 1.46, -0.01);
      headerRibbon.rotation.x = -0.12;
      headerRibbon.userData.stallType = stallType;
      headerRibbon.userData.stallTitle = stallTitle;
      standee.add(headerRibbon);

      kiosk.add(standee);
      return board;
    };

    const leftStandeeBoard = makePorchStandee(
      -2.95,
      'ĐẶC SẢN CHAY MỸ THO · KHO QUẸT 65K · BÁNH PÍA 65K · TRÀ SEN 125K',
      'BÁN CHẠY · ĐẶT GIAO SHOPEE',
      '#7B2016',
      'am_thuc_chay',
      'Quầy Kho Quẹt & Đặc Sản Chay Mỹ Tho'
    );
    const rightStandeeBoard = makePorchStandee(
      2.95,
      'VĂN HÓA PHẨM · NHANG TRẦM 25K · TRÀNG HẠT 160K · ÁO TRÀNG 260K',
      'COMBO QUÀ BIẾU TIẾT KIỆM',
      '#1A5234',
      'all',
      'Nhà Lưu Niệm · Bán Chạy & Combo Quà Biếu'
    );

    // 2 Bàn trưng bày sát kính mặt tiền (nhìn từ ngoài sân đã thấy rõ hũ đặc sản & nhang trầm!)
    for (const side of [-1, 1]) {
      const winTable = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.72, 0.62), shelfWoodMat);
      winTable.position.set(side * 3.32, 0.22 + 0.36, halfD - 0.62);
      winTable.userData.stallType = side < 0 ? 'am_thuc_chay' : 'huong_hoa';
      winTable.userData.stallTitle =
        side < 0 ? 'Quầy Kho Quẹt & Đặc Sản Chay Mỹ Tho' : 'Quầy Nhang Trầm & Hương Hoa Lễ';
      kiosk.add(winTable);
      for (let wi = 0; wi < 4; wi++) {
        const wx = side * 3.32 - 0.84 + wi * 0.56;
        const propBox = new THREE.Mesh(
          new THREE.BoxGeometry(0.32, 0.28, 0.32),
          side < 0
            ? wi % 2 === 0
              ? banhPiaLabelMat
              : traSenLabelMat
            : wi % 2 === 0
              ? nhangTramLabelMat
              : kinhSachLabelMat
        );
        propBox.position.set(wx, 0.22 + 0.72 + 0.14, halfD - 0.62);
        kiosk.add(propBox);
      }
    }

    const warmBulbMat = new THREE.MeshStandardMaterial({
      color: 0xFFF5D4,
      emissive: 0xFFD47A,
      emissiveIntensity: 0.95,
      roughness: 0.2
    });
    for (const lx of [-2.45, 2.45]) {
      for (const lz of [-4.6, 0.0, 4.6]) {
        const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.65, 5), darkTrimWoodMat);
        cord.position.set(lx, 3.98, lz);
        kiosk.add(cord);
        const lanternFrame = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.28, 6), warmBulbMat);
        lanternFrame.position.set(lx, 3.56, lz);
        kiosk.add(lanternFrame);
        const capTop = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.09, 6), darkTrimWoodMat);
        capTop.position.set(lx, 3.74, lz);
        kiosk.add(capTop);
      }
    }
    const shopLightFront = new THREE.PointLight(0xFFE7BA, 2.1, 16.0, 1.25);
    shopLightFront.position.set(0, 3.45, 3.0);
    kiosk.add(shopLightFront);
    const shopLightBack = new THREE.PointLight(0xFFE7BA, 1.9, 15.0, 1.25);
    shopLightBack.position.set(0, 3.45, -3.5);
    kiosk.add(shopLightBack);

    // =========================================================================
    // 1e. DÃY KỆ DỌC VÁCH TÂY (x = -4.78, z = -6.8 .. +6.4 — DÀI 13.2m THEO HÀNG DỌC!)
    //     4 tầng gỗ dày chắc chắn chứa Hũ Kho Quẹt Chay, Chao Môn, Hộp Bánh Pía,
    //     Hộp Trà Sen, Ống Nhang Trầm Hương & Bộ Kinh Sách Nhật Tụng
    // =========================================================================
    const westShelfLen = 13.2;
    const westShelfX = -4.76;
    const shelfLevels = [0.68, 1.26, 1.84, 2.42];
    for (let pz = -6.6; pz <= 6.7; pz += 2.2) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.86, 0.08), darkTrimWoodMat);
      post.position.set(westShelfX + 0.34, 0.22 + 1.43, pz);
      kiosk.add(post);
    }
    for (const sy of shelfLevels) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.06, westShelfLen), shelfWoodMat);
      plank.position.set(westShelfX, sy, -0.2);
      plank.receiveShadow = true;
      kiosk.add(plank);
    }
    // Shelf top cornice + category header plaque facing East (+X into West Aisle)
    const westSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.44, 6.2),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('ĐẶC SẢN CHAY MIỀN TÂY · KHO QUẸT · CHAO MÔN · BÁNH PÍA · TRÀ SEN', {
          w: 1400, h: 120, bg: '#842318', border: '#F4CC6A', color: '#FFF7E0', size: 32
        }),
        roughness: 0.4
      })
    );
    westSign.position.set(westShelfX + 0.34, 3.02, 2.2);
    westSign.userData.stallType = 'am_thuc_chay';
    westSign.userData.stallTitle = 'Quầy Kho Quẹt & Đặc Sản Chay Mỹ Tho';
    kiosk.add(westSign);

    const westSign2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.44, 4.8),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('NHANG TRẦM HƯƠNG · KINH SÁCH · MỸ NGHỆ GỖ DỪA', {
          w: 1200, h: 120, bg: '#1B5535', border: '#F4CC6A', color: '#FFF7E0', size: 32
        }),
        roughness: 0.4
      })
    );
    westSign2.position.set(westShelfX + 0.34, 3.02, -4.0);
    westSign2.userData.stallType = 'huong_hoa';
    westSign2.userData.stallTitle = 'Quầy Nhang Trầm, Hương Đèn & Kinh Sách';
    kiosk.add(westSign2);

    // Helper: realistic multi-part Vietnamese product builders
    const addLabeledJar = (parent, x, y, z, isKhoQuet) => {
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.085, 0.09, 0.2, 12),
        isKhoQuet ? jarGlassDarkMat : jarGlassCreamMat
      );
      body.position.set(x, y + 0.1, z);
      parent.add(body);
      const labelBand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.089, 0.092, 0.11, 12, 1, true),
        isKhoQuet ? khoQuetLabelMat : chaoLabelMat
      );
      labelBand.position.set(x, y + 0.1, z);
      parent.add(labelBand);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.08, 0.03, 12), porcelainMat);
      neck.position.set(x, y + 0.215, z);
      parent.add(neck);
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.072, 0.072, 0.038, 12),
        isKhoQuet ? jarCapRedMat : jarCapGoldMat
      );
      cap.position.set(x, y + 0.245, z);
      parent.add(cap);
    };

    const addLabeledBox = (parent, x, y, z, w, h, d, mat, rotY = 0) => {
      const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      box.position.set(x, y + h * 0.5, z);
      box.rotation.y = rotY;
      parent.add(box);
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(w + 0.008, 0.025, d + 0.008), goldMat);
      ribbon.position.set(x, y + h * 0.82, z);
      ribbon.rotation.y = rotY;
      parent.add(ribbon);
    };

    const addIncenseTube = (parent, x, y, z) => {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.34, 12), nhangTramLabelMat);
      tube.position.set(x, y + 0.17, z);
      parent.add(tube);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.03, 12), goldMat);
      rim.position.set(x, y + 0.34, z);
      parent.add(rim);
      const sticks = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.042, 0.07, 10), jarCapRedMat);
      sticks.position.set(x, y + 0.38, z);
      parent.add(sticks);
    };

    // Populate West Wall Shelves (front-to-back along Z!)
    // Bay 1 & 2 (z = -0.2 .. +6.0): Kho Quẹt, Chao Môn, Bánh Pía, Trà Sen
    for (let i = 0; i < 16; i++) {
      const pz = 0.0 + i * 0.38;
      addLabeledJar(kiosk, westShelfX + 0.1, 1.29, pz, true);
      addLabeledJar(kiosk, westShelfX + 0.1, 1.87, pz, false);
    }
    for (let i = 0; i < 10; i++) {
      const pz = 0.25 + i * 0.6;
      addLabeledBox(kiosk, westShelfX + 0.04, 0.71, pz, 0.36, 0.26, 0.44, banhPiaLabelMat, Math.PI / 2);
      addLabeledBox(kiosk, westShelfX + 0.04, 2.45, pz, 0.32, 0.24, 0.4, traSenLabelMat, Math.PI / 2);
    }
    // Bay 3 & 4 (z = -6.4 .. -0.6): Nhang Trầm, Kinh Sách, Bát gỗ dừa, Tượng nhỏ
    for (let i = 0; i < 14; i++) {
      const pz = -6.2 + i * 0.38;
      addIncenseTube(kiosk, westShelfX + 0.1, 1.29, pz);
    }
    const bookColors = [0x8E2420, 0xC98B28, 0x23523B, 0x7A241E, 0xA85E24, 0xDFC78A];
    for (let bi = 0; bi < 24; bi++) {
      const bh = 0.26 + (bi % 3) * 0.04;
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, bh, 0.14),
        bi % 4 === 0 ? kinhSachLabelMat : new THREE.MeshStandardMaterial({ color: bookColors[bi % bookColors.length], roughness: 0.64 })
      );
      book.position.set(westShelfX + 0.05, 1.87 + bh * 0.5, -6.3 + bi * 0.22);
      kiosk.add(book);
    }
    for (let i = 0; i < 9; i++) {
      const pz = -6.1 + i * 0.64;
      const bowl = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 12, 8, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55),
        coconutWoodMat
      );
      bowl.position.set(westShelfX + 0.06, 2.58, pz);
      kiosk.add(bowl);
      addLabeledBox(kiosk, westShelfX + 0.04, 0.71, pz, 0.36, 0.28, 0.46, nhangTramLabelMat, Math.PI / 2);
    }

    // =========================================================================
    // 1f. KỆ ĐẢO 2 MẶT CHẠY DỌC GIỮA NHÀ ("THEO HÀNG DỌC", x = 0, z = -4.2 .. +4.0)
    //     Chia cửa hàng thành 2 hành lang mua sắm song song rộng > 3.2m mỗi bên!
    // =========================================================================
    const gondolaLen = 8.2;
    const gondolaBase = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.38, gondolaLen), wainscotWoodMat);
    gondolaBase.position.set(0, 0.22 + 0.19, -0.1);
    gondolaBase.castShadow = true;
    kiosk.add(gondolaBase);

    const gondolaSpine = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.48, gondolaLen - 0.12), darkTrimWoodMat);
    gondolaSpine.position.set(0, 0.22 + 0.38 + 0.74, -0.1);
    kiosk.add(gondolaSpine);

    // 3 tiered shelves on both West & East sides of the longitudinal center gondola
    for (const [sy, sw] of [[0.62, 1.14], [1.08, 0.96], [1.54, 0.78]]) {
      const gPlank = new THREE.Mesh(new THREE.BoxGeometry(sw, 0.05, gondolaLen), shelfWoodMat);
      gPlank.position.set(0, sy, -0.1);
      gPlank.receiveShadow = true;
      kiosk.add(gPlank);
    }
    const gondolaHeader = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.34, 4.4),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('QUÀ LƯU NIỆM · TRÀ SEN · BỒ ĐOÀN · PHÁP KHÍ', {
          w: 1120, h: 110, bg: '#FFF7E0', border: '#8C251E', color: '#7A1F16', size: 34
        }),
        roughness: 0.4
      })
    );
    gondolaHeader.position.set(0, 2.08, -0.1);
    kiosk.add(gondolaHeader);

    // Populate West face of center gondola (x = -0.30): Tea boxes, Vegetarian jars, Incense coils
    for (let i = 0; i < 11; i++) {
      const pz = -3.7 + i * 0.72;
      addLabeledBox(kiosk, -0.32, 0.65, pz, 0.32, 0.24, 0.42, i % 2 === 0 ? traSenLabelMat : banhPiaLabelMat, Math.PI / 2);
      addLabeledJar(kiosk, -0.26, 1.11, pz, i % 2 === 0);
      const coil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.12, 14),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xC63526 : 0xD89B2C, roughness: 0.46 })
      );
      coil.position.set(-0.22, 1.63, pz);
      kiosk.add(coil);
    }
    // Populate East face of center gondola (x = +0.30): Bồ đoàn cushions, Wooden Mokugyo, Lotus Candles, Mini Statues
    for (let i = 0; i < 10; i++) {
      const pz = -3.5 + i * 0.76;
      const cushion = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.22, 0.11, 14),
        i % 2 === 0 ? velvetTrayMat : shutterGreenMat
      );
      cushion.position.set(0.32, 0.7, pz);
      kiosk.add(cushion);

      // Carved wooden Mokugyo (Mõ gỗ mít) on red ring pad
      const pad = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 8, 14), velvetTrayMat);
      pad.rotation.x = Math.PI / 2;
      pad.position.set(0.26, 1.13, pz);
      kiosk.add(pad);
      const moBody = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), coconutWoodMat);
      moBody.scale.set(1.1, 0.85, 0.95);
      moBody.position.set(0.26, 1.22, pz);
      kiosk.add(moBody);

      // Lotus glass candle / bronze mini incense burner on top tier
      const candleBase = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.08, 12), i % 2 === 0 ? bronzeMat : goldMat);
      candleBase.position.set(0.22, 1.61, pz);
      kiosk.add(candleBase);
      const lotusTop = new THREE.Mesh(
        new THREE.ConeGeometry(0.11, 0.1, 10),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xF29CAE : 0xF6D574, roughness: 0.35 })
      );
      lotusTop.rotation.x = Math.PI;
      lotusTop.position.set(0.22, 1.68, pz);
      kiosk.add(lotusTop);
    }

    // =========================================================================
    // 1g. DÃY VÁCH ĐÔNG (x = +4.45): QUẦY THU NGÂN & TỦ KÍNH TRÀNG HẠT (phía trước)
    //     + GIÁ TREO PHÁP PHỤC ÁO TRÀNG & NÓN LÁ (giữa) + TỦ MÁT GIẢI KHÁT (phía sau)
    // =========================================================================
    // Quầy thu ngân + Tủ kính trưng bày tràng hạt (z = +2.2 .. +6.4)
    const sideCounter = new THREE.Mesh(new THREE.BoxGeometry(0.96, 1.04, 4.4), shelfWoodMat);
    sideCounter.position.set(4.52, 0.22 + 0.52, 4.2);
    sideCounter.castShadow = true;
    kiosk.add(sideCounter);

    const showcaseGlass = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.58, 3.3), glassMat);
    showcaseGlass.position.set(4.52, 0.22 + 1.04 + 0.29, 3.7);
    kiosk.add(showcaseGlass);
    const showcaseFrame = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.04, 3.36), aluMat);
    showcaseFrame.position.set(4.52, 0.22 + 1.64, 3.7);
    kiosk.add(showcaseFrame);

    const beadMats = [
      new THREE.MeshStandardMaterial({ color: 0x5E3118, roughness: 0.42 }),
      new THREE.MeshStandardMaterial({ color: 0x2E7D5A, roughness: 0.24 }),
      new THREE.MeshStandardMaterial({ color: 0xD9A234, roughness: 0.28 }),
      new THREE.MeshStandardMaterial({ color: 0x8C2A24, roughness: 0.34 })
    ];
    for (let ti = 0; ti < 4; ti++) {
      const tz = 2.45 + ti * 0.82;
      const tray = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.04, 0.64), velvetTrayMat);
      tray.position.set(4.52, 1.28, tz);
      kiosk.add(tray);
      for (let bi = -1; bi <= 1; bi++) {
        const beads = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.022, 8, 16), beadMats[(ti + bi + 4) % beadMats.length]);
        beads.rotation.x = Math.PI / 2;
        beads.position.set(4.52, 1.33, tz + bi * 0.18);
        kiosk.add(beads);
      }
    }

    const shopeeBoard = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.68, 2.55),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('QUẦY THU NGÂN · ĐẶT GIAO SHOPEE TẬN NHÀ', {
          w: 840, h: 210, bg: '#C83B1B', border: '#F6D372', color: '#FFF8E4', size: 34
        }),
        roughness: 0.36
      })
    );
    shopeeBoard.position.set(5.18, 2.58, 4.2);
    shopeeBoard.userData.stallType = 'thu_cong';
    shopeeBoard.userData.stallTitle = 'Quầy Tràng Hạt, Đồ Thủ Công & Giao Shopee';
    sideCounter.userData.stallType = 'thu_cong';
    sideCounter.userData.stallTitle = 'Quầy Tràng Hạt, Đồ Thủ Công & Giao Shopee';
    showcaseGlass.userData.stallType = 'thu_cong';
    showcaseGlass.userData.stallTitle = 'Quầy Tràng Hạt, Đồ Thủ Công & Giao Shopee';
    kiosk.add(shopeeBoard);

    // Giá treo Pháp Phục (Áo Tràng Lam, Áo Nâu) + Kệ Nón Lá & Túi Vải Sen (z = -2.4 .. +1.6)
    const rackBar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.9, 8), aluMat);
    rackBar.rotation.x = Math.PI / 2;
    rackBar.position.set(4.65, 2.08, -0.4);
    rackBar.userData.stallType = 'phap_phuc';
    rackBar.userData.stallTitle = 'Gian Pháp Phục Áo Tràng & Bồ Đoàn';
    kiosk.add(rackBar);
    const robeCols = [0x868B96, 0x7689A0, 0x8F7866, 0x6F8474, 0x9A897A, 0x7A8798, 0x8C7D72];
    const robeClickMeshes = [];
    for (let ri = 0; ri < 7; ri++) {
      const rz = -2.0 + ri * 0.52;
      const robeBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.96, 0.42),
        new THREE.MeshStandardMaterial({ color: robeCols[ri], roughness: 0.8 })
      );
      robeBody.position.set(4.65, 1.54, rz);
      robeBody.userData.stallType = 'phap_phuc';
      robeBody.userData.stallTitle = 'Gian Pháp Phục Áo Tràng & Bồ Đoàn';
      kiosk.add(robeBody);
      robeClickMeshes.push(robeBody);
      const collar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.24), darkTrimWoodMat);
      collar.position.set(4.65, 1.98, rz);
      kiosk.add(collar);
    }
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xE8D4A4, roughness: 0.78, side: THREE.DoubleSide });
    for (let hi = 0; hi < 5; hi++) {
      const hat = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.16, 16, 1, true), hatMat);
      hat.position.set(4.65, 2.68, -1.6 + hi * 0.62);
      kiosk.add(hat);
    }

    // Tủ mát 2 cánh nước giải khát (z = -6.2 .. -3.4) quay mặt sang Tây (-X)
    const fridge = new THREE.Group();
    fridge.position.set(4.68, 0.22, -4.8);
    fridge.rotation.y = -Math.PI / 2;
    const fridgeBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 2.24, 0.86),
      new THREE.MeshStandardMaterial({ color: 0xF1F5F8, roughness: 0.28, metalness: 0.14 })
    );
    fridgeBody.position.y = 1.12;
    fridge.add(fridgeBody);
    const fridgeHeader = new THREE.Mesh(
      new THREE.BoxGeometry(2.14, 0.28, 0.05),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('DỪA XIÊM · TRÀ TẮC · SÂM BÍ ĐAO ƯỚP LẠNH', {
          w: 680, h: 110, bg: '#1668B8', border: '#FFFFFF', color: '#FFFFFF', size: 26
        }),
        roughness: 0.32
      })
    );
    fridgeHeader.position.set(0, 2.06, 0.44);
    fridge.add(fridgeHeader);
    const fridgeInterior = new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 1.66),
      new THREE.MeshBasicMaterial({ color: 0xD2F2FF })
    );
    fridgeInterior.position.set(0, 1.02, 0.445);
    fridge.add(fridgeInterior);
    const bottleColors = [0x24944A, 0xD63B2A, 0xE6A826, 0x2276C8, 0x5CB338, 0xEFECE2];
    for (let r = 0; r < 4; r++) {
      for (let b = 0; b < 8; b++) {
        const bx = -0.82 + b * 0.23;
        const by = 0.42 + r * 0.38;
        const bottle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.038, 0.044, 0.22, 8),
          new THREE.MeshStandardMaterial({ color: bottleColors[(r + b) % bottleColors.length], roughness: 0.22 })
        );
        bottle.position.set(bx, by, 0.47);
        fridge.add(bottle);
        const bCap = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.035, 8), porcelainMat);
        bCap.position.set(bx, by + 0.125, 0.47);
        fridge.add(bCap);
      }
    }
    kiosk.add(fridge);

    // =========================================================================
    // 1h. TỦ KÍNH TƯỢNG PHẬT & PHÁP KHÍ CAO CẤP CUỐI LỐI ĐI BẮC (z = -7.38)
    // =========================================================================
    const backCabinet = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.06, 0.82), wainscotWoodMat);
    backCabinet.position.set(0, 0.22 + 0.53, -7.38);
    kiosk.add(backCabinet);
    const backGlass = new THREE.Mesh(new THREE.BoxGeometry(5.05, 1.48, 0.72), glassMat);
    backGlass.position.set(0, 0.22 + 1.06 + 0.74, -7.38);
    kiosk.add(backGlass);
    const backShelfMid = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.05, 0.68), shelfWoodMat);
    backShelfMid.position.set(0, 0.22 + 1.76, -7.38);
    kiosk.add(backShelfMid);
    const backCabinetCap = new THREE.Mesh(new THREE.BoxGeometry(5.32, 0.14, 0.9), darkTrimWoodMat);
    backCabinetCap.position.set(0, 0.22 + 2.58, -7.38);
    kiosk.add(backCabinetCap);

    // Multi-part miniature Buddha statues & bronze tripod censers inside the back glass cabinet
    for (let si = 0; si < 7; si++) {
      const sx = -2.1 + si * 0.7;
      const isGold = si % 2 === 0;
      const mat = isGold ? goldMat : porcelainMat;
      // Top tier: miniature seated Buddha on lotus base + aureole halo
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.08, 12), darkTrimWoodMat);
      stand.position.set(sx, 2.04, -7.38);
      kiosk.add(stand);
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.26, 12), mat);
      body.position.set(sx, 2.21, -7.38);
      kiosk.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.058, 10, 8), mat);
      head.position.set(sx, 2.38, -7.38);
      kiosk.add(head);
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.014, 8, 16), goldMat);
      halo.position.set(sx, 2.36, -7.46);
      kiosk.add(halo);

      // Lower tier: bronze censer / porcelain vase
      const censer = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), si % 2 === 0 ? bronzeMat : porcelainMat);
      censer.scale.set(1, 0.78, 1);
      censer.position.set(sx, 1.4, -7.38);
      kiosk.add(censer);
      const censerLid = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.1, 12), si % 2 === 0 ? bronzeMat : goldMat);
      censerLid.position.set(sx, 1.53, -7.38);
      kiosk.add(censerLid);
    }

    const trigRing = new THREE.Mesh(
      new THREE.RingGeometry(0.95, 1.28, 28),
      new THREE.MeshBasicMaterial({ color: 0xFFD166, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
    );
    trigRing.rotation.x = -Math.PI / 2;
    trigRing.position.set(0, 0.27, 6.2);
    kiosk.add(trigRing);

    fridgeBody.userData.stallType = 'am_thuc_chay';
    fridgeBody.userData.stallTitle = 'Tủ Mát Giải Khát & Đặc Sản Chay Mỹ Tho';
    backCabinet.userData.stallType = 'thu_cong';
    backCabinet.userData.stallTitle = 'Tủ Kính Văn Hóa Phẩm & Tượng Lưu Niệm';
    gondolaBase.userData.stallType = 'all';
    gondolaBase.userData.stallTitle = 'Nhà Lưu Niệm · Quầy Kệ Giữa & Bán Chạy';
    gondolaHeader.userData.stallType = 'all';
    gondolaHeader.userData.stallTitle = 'Nhà Lưu Niệm · Quầy Kệ Giữa & Bán Chạy';

    this.exteriorGroup.add(kiosk);
    this.stallAnchors.push(kiosk);
    this.stallClickTargets.push(
      sideCounter,
      showcaseGlass,
      gondolaBase,
      gondolaHeader,
      backCabinet,
      mainSign,
      doorSign,
      mainRoof,
      frontAwning,
      fridgeBody,
      shopeeBoard,
      westSign,
      westSign2,
      leftStandeeBoard,
      rightStandeeBoard,
      rackBar,
      ...robeClickMeshes,
      trigRing
    );

    // Vùng tương tác bao trùm toàn bộ bên trong và trước cửa Nhà Lưu Niệm
    this.stallTriggers.push({
      x: 42.2,
      z: -31.8,
      radius: 10.2,
      stallType: 'all',
      title: 'Nhà Lưu Niệm · Cửa Hàng Văn Hóa Phẩm Vĩnh Tràng'
    });

    // Colliders BỌC KÍN 4 TƯỜNG + KỆ DỌC GIỮA — CHỪA CỬA ĐÔI 3.4m (x = 40.5..43.9) & 2 LỐI ĐI DỌC RỘNG RÃI!
    // North back wall + glass cabinet (world z = -41.6 .. -40.1)
    this.addRectObstacle(36.6, 47.8, -41.6, -40.1);
    // West wall + longitudinal shelves (world x = 36.6 .. 38.05)
    this.addRectObstacle(36.6, 38.05, -41.6, -24.8);
    // East wall + counter/rack/fridge (world x = 46.1 .. 47.8)
    this.addRectObstacle(46.1, 47.8, -41.6, -24.8);
    // South front wall left wing (world x = 36.6 .. 40.45, z = -25.4 .. -24.7)
    this.addRectObstacle(36.6, 40.45, -25.4, -24.7);
    // South front wall right wing (world x = 43.95 .. 47.8, z = -25.4 .. -24.7)
    this.addRectObstacle(43.95, 47.8, -25.4, -24.7);
    // Center longitudinal gondola (world x = 41.55 .. 42.85, z = -37.5 .. -29.1)
    this.addRectObstacle(41.55, 42.85, -37.5, -29.1);

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

    const tsStand = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.82, 0.72), shelfWoodMat);
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
    const altarRedMat = new THREE.MeshStandardMaterial({ color: 0x7A1E15, roughness: 0.46, metalness: 0.08 });
    const matCrimson = new THREE.MeshStandardMaterial({ color: 0x8F2018, roughness: 0.8 });
    const matGold = new THREE.MeshStandardMaterial({ color: 0xE6B84C, roughness: 0.34, metalness: 0.52 });
    const emberMat = new THREE.MeshStandardMaterial({ color: 0xFF8C3B, emissive: 0xFF5722, emissiveIntensity: 0.95 });
    const porcelainBlue = new THREE.MeshStandardMaterial({ color: 0xEDEFF4, roughness: 0.24, metalness: 0.08 });
    const lotusPinkMat = new THREE.MeshStandardMaterial({ color: 0xF078AA, roughness: 0.46 });

    // Shared helper: Carved Stone Temple Lantern (Đèn Đá Chùa Cổ)
    const makeStoneLantern = (lx, ly, lz, scale = 1.0) => {
      const g = new THREE.Group();
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.44, 0.28, 6), M.stoneDark);
      base.position.y = 0.14;
      g.add(base);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 1.15, 6), M.stoneLight);
      shaft.position.y = 0.85;
      shaft.castShadow = true;
      g.add(shaft);
      const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.22, 0.16, 6), M.stoneLight);
      tray.position.y = 1.5;
      g.add(tray);
      const lampCore = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.36, 6), M.lanternGlow);
      lampCore.position.y = 1.76;
      g.add(lampCore);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.56, 0.36, 6), M.stoneDark);
      roof.position.y = 2.12;
      g.add(roof);
      const finial = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), M.goldAccent);
      finial.position.y = 2.34;
      g.add(finial);
      g.scale.setScalar(scale);
      g.position.set(lx, ly, lz);
      return g;
    };

    // Shared helper: Solemn Ceremonial Outdoor Worship Sanctuary (Đài Đá + Bàn Thờ Lộ Thiên Y Môn + Bộ Ngũ Sự + Đỉnh Đồng Tam Túc + Chiếu Lạy Bồ Đoàn)
    const addOutdoorWorshipSanctuary = (parent, { zAltar = 7.8, zMats = 10.6, width = 4.2, matCount = 4, yBase = 0.16 } = {}) => {
      const sanct = new THREE.Group();
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xFFE484 });

      // Bệ đá hoa cương phẳng nâng nhẹ cho khu vực bàn thờ & đỉnh đồng thêm phần trang nghiêm
      const dais = new THREE.Mesh(new THREE.BoxGeometry(width + 2.6, 0.12, 3.2), M.stoneDark);
      dais.position.set(0, yBase + 0.06, zAltar + 0.65);
      dais.receiveShadow = true;
      sanct.add(dais);
      const yTop = yBase + 0.12;

      // Bàn Thờ Lộ Thiên đá hoa cương & sơn son thếp vàng có Y Môn đỏ thêu chữ vàng
      const altarBody = new THREE.Mesh(new THREE.BoxGeometry(width, 1.08, 1.16), altarRedMat);
      altarBody.position.set(0, yTop + 0.54, zAltar);
      altarBody.castShadow = true;
      altarBody.receiveShadow = true;
      sanct.add(altarBody);
      const altarSlab = new THREE.Mesh(new THREE.BoxGeometry(width + 0.28, 0.12, 1.34), M.stoneLight);
      altarSlab.position.set(0, yTop + 1.12, zAltar);
      sanct.add(altarSlab);
      const altarTrim = new THREE.Mesh(new THREE.BoxGeometry(width + 0.1, 0.075, 1.22), matGold);
      altarTrim.position.set(0, yTop + 1.02, zAltar);
      sanct.add(altarTrim);

      const yMonFront = new THREE.Mesh(
        new THREE.PlaneGeometry(width * 0.72, 0.74),
        new THREE.MeshBasicMaterial({
          map: makeTextTex('NAM MÔ A DI ĐÀ PHẬT · THÀNH TÂM LỄ BÁI', {
            w: 1024, h: 200, bg: '#7B150F', border: '#F5CB5C', color: '#FFEBA0', size: 38
          })
        })
      );
      yMonFront.position.set(0, yTop + 0.56, zAltar + 0.59);
      sanct.add(yMonFront);

      // Bát hương đồng trung tâm trên bàn thờ + 3 chén nước tịnh phía trước
      const altarCenser = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.24, 16), M.bronzeBurner);
      altarCenser.position.set(0, yTop + 1.3, zAltar + 0.12);
      sanct.add(altarCenser);
      const altarCenserRim = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 8, 16), matGold);
      altarCenserRim.rotation.x = Math.PI / 2;
      altarCenserRim.position.set(0, yTop + 1.42, zAltar + 0.12);
      sanct.add(altarCenserRim);
      for (const cx of [-0.22, 0, 0.22]) {
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.038, 0.085, 10), porcelainBlue);
        cup.position.set(cx, yTop + 1.22, zAltar + 0.48);
        sanct.add(cup);
      }

      // Bộ Ngũ Sự đối xứng chuẩn mực: Đôi bình hoa sen sứ + Đôi chân đèn đồng có ngọn nến + Đôi mâm ngũ quả + Đôi chậu kiểng
      const fruitColors = [0x4CAF50, 0xFF9800, 0xE53935, 0xFDD835];
      for (const sgn of [-1, 1]) {
        const vx = sgn * (width * 0.40);
        const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 0.52, 12), porcelainBlue);
        vase.position.set(vx, yTop + 1.44, zAltar - 0.12);
        sanct.add(vase);
        for (let fi = 0; fi < 3; fi++) {
          const fl = new THREE.Mesh(new THREE.SphereGeometry(0.095, 8, 6), lotusPinkMat);
          fl.position.set(vx + (fi - 1) * 0.11, yTop + 1.8 + (fi === 1 ? 0.11 : 0), zAltar - 0.12);
          sanct.add(fl);
        }

        const candleX = sgn * (width * 0.25);
        const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.1, 0.42, 10), matGold);
        candle.position.set(candleX, yTop + 1.39, zAltar + 0.22);
        sanct.add(candle);
        const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.032, 0.2, 8), M.redColumn);
        wax.position.set(candleX, yTop + 1.68, zAltar + 0.22);
        sanct.add(wax);
        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.085, 6), flameMat);
        flame.position.set(candleX, yTop + 1.82, zAltar + 0.22);
        sanct.add(flame);

        const fx = sgn * (width * 0.15);
        const fruitDish = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.13, 0.13, 14), matGold);
        fruitDish.position.set(fx, yTop + 1.24, zAltar - 0.24);
        sanct.add(fruitDish);
        for (let fr = 0; fr < 4; fr++) {
          const fa = (fr / 4) * Math.PI * 2;
          const fruit = new THREE.Mesh(
            new THREE.SphereGeometry(0.075, 8, 6),
            new THREE.MeshStandardMaterial({ color: fruitColors[fr], roughness: 0.42 })
          );
          fruit.position.set(fx + Math.cos(fa) * 0.11, yTop + 1.35, zAltar - 0.24 + Math.sin(fa) * 0.11);
          sanct.add(fruit);
        }

        // Chậu cây kiểng gốm sứ đặt cân xứng hai đầu đài thờ
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.22, 0.44, 10), M.terracottaPot);
        pot.position.set(sgn * (width * 0.5 + 0.72), yTop + 0.22, zAltar + 0.15);
        sanct.add(pot);
        const foliage = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), M.foliageMid);
        foliage.scale.set(1.0, 1.15, 1.0);
        foliage.position.set(sgn * (width * 0.5 + 0.72), yTop + 0.68, zAltar + 0.15);
        sanct.add(foliage);
      }

      // Đỉnh Đồng Tam Túc lớn đặt trang nghiêm chính trục phía trước bàn thờ (Lư Hương Lộ Thiên)
      const cauldronZ = zAltar + 1.36;
      const cPlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.9, 0.3, 8), M.stoneLight);
      cPlinth.position.set(0, yTop + 0.15, cauldronZ);
      sanct.add(cPlinth);
      for (let li = 0; li < 3; li++) {
        const la = (li / 3) * Math.PI * 2 + Math.PI / 6;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.56, 8), M.bronzeBurner);
        leg.position.set(Math.cos(la) * 0.38, yTop + 0.52, cauldronZ + Math.sin(la) * 0.38);
        sanct.add(leg);
      }
      const cBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.48, 0.64, 18), M.bronzeBurner);
      cBowl.position.set(0, yTop + 1.0, cauldronZ);
      cBowl.castShadow = true;
      sanct.add(cBowl);
      const cRim = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.06, 8, 18), matGold);
      cRim.rotation.x = Math.PI / 2;
      cRim.position.set(0, yTop + 1.32, cauldronZ);
      sanct.add(cRim);
      for (const sgn of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.045, 6, 12), M.bronzeBurner);
        ear.position.set(sgn * 0.74, yTop + 1.16, cauldronZ);
        sanct.add(ear);
      }
      const ashBed = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 0.08, 16),
        new THREE.MeshStandardMaterial({ color: 0xC8BFA8, roughness: 0.94 })
      );
      ashBed.position.set(0, yTop + 1.28, cauldronZ);
      sanct.add(ashBed);
      for (let si = -3; si <= 3; si++) {
        const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.48, 5), M.redColumn);
        stick.position.set(si * 0.075, yTop + 1.5, cauldronZ + ((si % 2) * 0.06));
        stick.rotation.z = si * 0.04;
        sanct.add(stick);
        const tip = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), emberMat);
        tip.position.set(si * 0.085, yTop + 1.74, cauldronZ + ((si % 2) * 0.06));
        sanct.add(tip);
      }

      // Hàng chiếu lạy & bồ đoàn đỏ viền vàng xếp thẳng tắp, thoáng đẹp cho Phật tử quỳ lễ trang nghiêm
      const spacing = 1.36;
      const startX = -((matCount - 1) * spacing) / 2;
      const matZ = Math.max(zMats, cauldronZ + 1.65);
      for (let mi = 0; mi < matCount; mi++) {
        const mx = startX + mi * spacing;
        const matBase = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.05, 1.08), matCrimson);
        matBase.position.set(mx, yBase + 0.025, matZ);
        matBase.receiveShadow = true;
        sanct.add(matBase);
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.11, 14), altarRedMat);
        pad.position.set(mx, yBase + 0.09, matZ + 0.16);
        sanct.add(pad);
        const trim = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.022, 6, 14), matGold);
        trim.rotation.x = Math.PI / 2;
        trim.position.set(mx, yBase + 0.14, matZ + 0.16);
        sanct.add(trim);
      }

      parent.add(sanct);
      return sanct;
    };

    // =========================================================================
    // 1. ĐẠI TƯỢNG PHẬT A DI ĐÀ (-9.5, 0, -23.5) — SÂN HÀNH LỄ ĐÁ HOA CƯƠNG, LAN CAN ĐÁ, BÀN THỜ LỘ THIÊN & ĐỈNH ĐỒNG
    // =========================================================================
    this.adidaGroup = new THREE.Group();
    this.adidaGroup.position.set(-9.5, 0, -23.5);

    // Sân đá rộng 19.6m × 22.0m trang nghiêm bao quanh Đại Tượng Phật A Di Đà
    const adidaSquareCourt = new THREE.Mesh(new THREE.BoxGeometry(18.8, 0.16, 21.4), M.stoneLight);
    adidaSquareCourt.position.set(0, 0.08, 2.2);
    adidaSquareCourt.receiveShadow = true;
    this.adidaGroup.add(adidaSquareCourt);

    const adidaPlaza = new THREE.Mesh(new THREE.CylinderGeometry(7.9, 8.3, 0.24, 16), M.stoneLight);
    adidaPlaza.position.y = 0.24;
    adidaPlaza.receiveShadow = true;
    this.adidaGroup.add(adidaPlaza);

    const adidaTerrace = new THREE.Mesh(new THREE.CylinderGeometry(5.8, 6.4, 0.56, 16), M.stoneDark);
    adidaTerrace.position.y = 0.54;
    adidaTerrace.receiveShadow = true;
    this.adidaGroup.add(adidaTerrace);

    const adidaGoldCollar = new THREE.Mesh(new THREE.TorusGeometry(5.85, 0.1, 8, 24), matGold);
    adidaGoldCollar.rotation.x = Math.PI / 2;
    adidaGoldCollar.position.y = 0.84;
    this.adidaGroup.add(adidaGoldCollar);

    // Lan can đá chạm hoa sen hình bán nguyệt ôm phía sau & hai bên đài tượng (mở rộng mặt tiền phía Nam +Z)
    for (let bi = 0; bi <= 10; bi++) {
      const ang = -Math.PI * 0.72 + (bi / 10) * (Math.PI * 1.44); // wraps West -> North -> East
      const bx = Math.sin(ang) * 7.8;
      const bz = -Math.cos(ang) * 7.8;
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.96, 0.32), M.stoneLight);
      pillar.position.set(bx, 0.68, bz);
      pillar.castShadow = true;
      this.adidaGroup.add(pillar);
      const lotusCap = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), lotusPinkMat);
      lotusCap.position.set(bx, 1.24, bz);
      this.adidaGroup.add(lotusCap);
    }

    // Tam cấp đá mặt tiền phía Nam dẫn lên đài
    for (let st = 0; st < 3; st++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.22, 0.48), M.stoneLight);
      step.position.set(0, 0.22 + st * 0.2, 7.6 - st * 0.44);
      step.receiveShadow = true;
      this.adidaGroup.add(step);
    }

    const adidaFrontSign = new THREE.Mesh(
      new THREE.BoxGeometry(5.8, 0.78, 0.16),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('NAM MÔ A DI ĐÀ PHẬT · ĐẠI TƯỢNG 25M', {
          w: 1600, h: 200, bg: '#5A1610', border: '#F4C95D', color: '#FFF5DA', size: 48
        })
      })
    );
    adidaFrontSign.position.set(0, 1.18, 5.95);
    this.adidaGroup.add(adidaFrontSign);

    // Bàn Thờ Lộ Thiên + Đỉnh Đồng Tam Túc + 4 Bồ Đoàn Chiếu Lạy trang nghiêm phía trước tượng
    addOutdoorWorshipSanctuary(this.adidaGroup, { zAltar: 8.6, zMats: 11.4, width: 4.0, matCount: 4, yBase: 0.16 });
    for (const [lx, lz] of [[-4.8, 8.2], [4.8, 8.2], [-6.8, 12.2], [6.8, 12.2]]) {
      this.adidaGroup.add(makeStoneLantern(lx, 0.16, lz, 1.05));
    }

    // Four tropical shade trees framing the sanctuary without obscuring the silhouette
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const tx = Math.sin(ang) * 10.6;
      const tz = -Math.cos(ang) * 9.8;
      const t = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 3.8, 10), M.trunk);
      trunk.position.y = 1.9;
      t.add(trunk);
      const crown = new THREE.Mesh(new THREE.SphereGeometry(1.75, 14, 10), M.foliageDark);
      crown.position.y = 4.0;
      crown.scale.set(1.18, 0.92, 1.12);
      t.add(crown);
      t.position.set(tx, 0, tz);
      this.adidaGroup.add(t);
    }
    this.exteriorGroup.add(this.adidaGroup);
    this.addObstacle(-9.5, -23.5, 6.2);
    this.addRectObstacle(-11.8, -7.2, -15.6, -13.2); // Outdoor altar + cauldron collider

    // =========================================================================
    // 2. ĐẠI TƯỢNG PHẬT DI LẶC (-26.5, 0, 4.0) — KHỐI ĐẾ KIẾN TRÚC BAN TRỊ SỰ VÒM CỔ ĐIỂN + SÂN HÀNH LỄ TRANG NGHIÊM
    // =========================================================================
    this.dilacGroup = new THREE.Group();
    this.dilacGroup.position.set(-26.5, 0, 4.0);

    // Sân đá rộng phía Nam tượng Di Lặc cho khu vực dâng hương & quỳ lạy
    const dilacForecourt = new THREE.Mesh(new THREE.BoxGeometry(28.0, 0.14, 14.5), M.stoneLight);
    dilacForecourt.position.set(0, 0.07, 17.6);
    dilacForecourt.receiveShadow = true;
    this.dilacGroup.add(dilacForecourt);

    const dilacTerrace = new THREE.Mesh(new THREE.BoxGeometry(27.0, 4.8, 18.2), M.pedestalRed);
    dilacTerrace.position.set(0, 2.4, 1.8);
    dilacTerrace.receiveShadow = true;
    dilacTerrace.castShadow = true;
    this.dilacGroup.add(dilacTerrace);

    const dilacPlinthBand = new THREE.Mesh(new THREE.BoxGeometry(27.6, 0.72, 18.8), M.stoneDark);
    dilacPlinthBand.position.set(0, 0.36, 1.8);
    this.dilacGroup.add(dilacPlinthBand);

    const dilacCap = new THREE.Mesh(new THREE.BoxGeometry(27.8, 0.32, 19.0), M.stoneLight);
    dilacCap.position.set(0, 4.86, 1.8);
    dilacCap.receiveShadow = true;
    this.dilacGroup.add(dilacCap);

    // Kiến trúc mặt tiền khối đế Di Lặc (mô phỏng công trình Văn Phòng Ban Trị Sự dưới chân tượng thực tế!)
    for (let pi = -4; pi <= 4; pi++) {
      const px = pi * 3.1;
      const pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.46, 4.4, 0.34), M.creamTrim);
      pilaster.position.set(px, 2.52, 10.96);
      this.dilacGroup.add(pilaster);
      if (pi < 4 && Math.abs(pi + 0.5) > 1.2) {
        const wx = px + 1.55;
        const archRecess = new THREE.Mesh(new THREE.BoxGeometry(1.65, 2.25, 0.14), M.darkOpening);
        archRecess.position.set(wx, 1.88, 10.94);
        this.dilacGroup.add(archRecess);
        const archFrame = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.16, 0.24), M.creamTrim);
        archFrame.position.set(wx, 3.04, 10.98);
        this.dilacGroup.add(archFrame);
      }
    }

    // Lan can đá chạm hoa sen chạy quanh mép sân thượng tầng trên
    for (let ri = -6; ri <= 6; ri++) {
      if (Math.abs(ri) <= 2) continue; // mở lối cầu thang chính giữa
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.92, 0.28), M.creamTrim);
      post.position.set(ri * 2.1, 5.42, 11.0);
      this.dilacGroup.add(post);
    }
    for (const sgn of [-1, 1]) {
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.14, 0.24), M.stoneLight);
      topRail.position.set(sgn * 8.4, 5.82, 11.0);
      this.dilacGroup.add(topRail);
    }

    // Cầu thang đá 7 bậc rộng có 2 thành cầu thang xây đá chạm sen uy nghiêm (bỏ ống sắt thô!)
    for (let st = 0; st < 7; st++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(13.2, 0.58, 0.62),
        st % 2 === 0 ? M.stoneLight : M.creamTrim
      );
      step.position.set(0, 0.29 + st * 0.64, 16.2 - st * 0.44);
      step.receiveShadow = true;
      this.dilacGroup.add(step);
    }
    const stairLanding = new THREE.Mesh(new THREE.BoxGeometry(16.0, 0.56, 3.4), M.stoneLight);
    stairLanding.position.set(0, 4.62, 12.1);
    stairLanding.receiveShadow = true;
    this.dilacGroup.add(stairLanding);

    for (const hx of [-6.95, 6.95]) {
      const cheekWall = new THREE.Mesh(new THREE.BoxGeometry(0.58, 1.35, 5.6), M.stoneLight);
      cheekWall.position.set(hx, 2.5, 14.3);
      cheekWall.rotation.x = 0.62;
      cheekWall.castShadow = true;
      this.dilacGroup.add(cheekWall);
      const botPillar = new THREE.Mesh(new THREE.BoxGeometry(0.76, 1.45, 0.76), M.stoneLight);
      botPillar.position.set(hx, 0.78, 16.8);
      this.dilacGroup.add(botPillar);
      const botLotus = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), lotusPinkMat);
      botLotus.position.set(hx, 1.62, 16.8);
      this.dilacGroup.add(botLotus);
    }

    const dilacBlackBand = new THREE.Mesh(
      new THREE.BoxGeometry(24.8, 1.12, 0.28),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('當 來 彌 勒 大 佛', {
          w: 1800, h: 190, bg: '#231915', border: '#D4A53B', color: '#F3CA62', size: 84
        }),
        roughness: 0.76
      })
    );
    dilacBlackBand.position.set(0, 4.18, 11.08);
    this.dilacGroup.add(dilacBlackBand);

    const dilacRedBand = new THREE.Mesh(
      new THREE.BoxGeometry(15.2, 0.86, 0.28),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('NAM MÔ ĐƯƠNG LAI HẠ SANH DI LẶC TÔN PHẬT', {
          w: 1800, h: 170, bg: '#7E2419', border: '#E8B84B', color: '#FFE59A', size: 48
        }),
        roughness: 0.68
      })
    );
    dilacRedBand.position.set(0, 3.22, 11.12);
    this.dilacGroup.add(dilacRedBand);

    // Khu hành lễ lộ thiên trang nghiêm ngay chân cầu thang tượng Phật Di Lặc
    addOutdoorWorshipSanctuary(this.dilacGroup, { zAltar: 18.4, zMats: 21.4, width: 4.4, matCount: 5, yBase: 0.14 });
    for (const [lx, lz] of [[-8.6, 17.2], [8.6, 17.2], [-8.6, 22.8], [8.6, 22.8]]) {
      this.dilacGroup.add(makeStoneLantern(lx, 0.14, lz, 1.15));
    }

    this.exteriorGroup.add(this.dilacGroup);
    this.addRectObstacle(-40.5, -12.5, -4.5, 14.9);
    this.addRectObstacle(-29.0, -24.0, 21.6, 24.2); // Di Lặc outdoor altar + cauldron collider

    // West garden plaza: low planters and clipped tropical shrubs frame the Di Lặc courtyard.
    for (const wx of [-38.2, -15.2]) {
      for (let zi = 0; zi < 4; zi++) {
        const wz = 24.0 + zi * 4.4;
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

    // =========================================================================
    // 3. ĐẠI TƯỢNG PHẬT THÍCH CA NHẬP NIẾT BÀN (14.5, 0, -49.0) — BỆ ĐÁ 3 TẦNG + LAN CAN SEN + SÂN LỄ PHẬT 6 BỒ ĐOÀN
    // =========================================================================
    this.nietBanGroup = new THREE.Group();
    this.nietBanGroup.position.set(14.5, 0, -49.0);

    // Sân đá rộng chạy dọc phía Nam cho Phật tử chiêm bái tượng Phật Nằm 32m
    const nbForecourt = new THREE.Mesh(new THREE.BoxGeometry(36.0, 0.14, 9.2), M.stoneLight);
    nbForecourt.position.set(0, 0.07, 13.4);
    nbForecourt.receiveShadow = true;
    this.nietBanGroup.add(nbForecourt);

    const nbTier1 = new THREE.Mesh(new THREE.BoxGeometry(35.0, 1.2, 18.0), M.stoneDark);
    nbTier1.position.y = 0.6;
    nbTier1.receiveShadow = true;
    nbTier1.castShadow = true;
    this.nietBanGroup.add(nbTier1);
    const nbTier2 = new THREE.Mesh(new THREE.BoxGeometry(34.2, 1.2, 17.2), M.pedestalRed);
    nbTier2.position.y = 1.8;
    nbTier2.receiveShadow = true;
    nbTier2.castShadow = true;
    this.nietBanGroup.add(nbTier2);
    const nbGoldTrim = new THREE.Mesh(new THREE.BoxGeometry(34.4, 0.16, 17.4), matGold);
    nbGoldTrim.position.y = 2.42;
    this.nietBanGroup.add(nbGoldTrim);
    const nbTier3 = new THREE.Mesh(new THREE.BoxGeometry(33.6, 1.2, 16.6), M.stoneLight);
    nbTier3.position.y = 3.0;
    nbTier3.receiveShadow = true;
    nbTier3.castShadow = true;
    this.nietBanGroup.add(nbTier3);

    // Trụ lan can đá chạm hoa sen dọc mặt tiền tầng trên
    for (let bi = -7; bi <= 7; bi++) {
      if (Math.abs(bi) <= 1) continue;
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.86, 0.3), M.creamTrim);
      post.position.set(bi * 2.25, 4.02, 8.1);
      this.nietBanGroup.add(post);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), lotusPinkMat);
      cap.position.set(bi * 2.25, 4.52, 8.1);
      this.nietBanGroup.add(cap);
    }

    // Tam cấp đá chính giữa + 2 thành cầu thang đá
    for (let st = 0; st < 5; st++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.44, 0.55), M.stoneLight);
      step.position.set(0, 0.22 + st * 0.42, 9.95 - st * 0.42);
      step.receiveShadow = true;
      this.nietBanGroup.add(step);
    }
    for (const sgn of [-1, 1]) {
      const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.54, 1.05, 2.8), M.stoneDark);
      cheek.position.set(sgn * 4.85, 0.72, 9.3);
      cheek.rotation.x = 0.52;
      this.nietBanGroup.add(cheek);
    }

    const nbSign = new THREE.Mesh(
      new THREE.BoxGeometry(13.2, 1.15, 0.18),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('NAM MÔ BỔN SƯ THÍCH CA MÂU NI PHẬT', {
          w: 1600, h: 200, bg: '#52150F', border: '#F0C558', color: '#FFE79E', size: 54
        })
      })
    );
    nbSign.position.set(0, 2.18, 9.15);
    this.nietBanGroup.add(nbSign);

    // Bàn Thờ Lộ Thiên + Đỉnh Đồng + 6 Bồ Đoàn Chiếu Lạy + 6 Đèn Đá Cổ dọc sân Phật Niết Bàn
    addOutdoorWorshipSanctuary(this.nietBanGroup, { zAltar: 11.4, zMats: 14.3, width: 4.8, matCount: 6, yBase: 0.14 });
    for (const [lx, lz] of [[-11.5, 11.2], [-6.2, 11.2], [6.2, 11.2], [11.5, 11.2], [-11.5, 16.0], [11.5, 16.0]]) {
      this.nietBanGroup.add(makeStoneLantern(lx, 0.14, lz, 1.1));
    }

    this.exteriorGroup.add(this.nietBanGroup);
    this.addRectObstacle(-3.0, 32.0, -58.0, -40.0);
    this.addRectObstacle(11.6, 17.4, -38.4, -35.8); // Phật Niết Bàn outdoor altar + cauldron collider

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
