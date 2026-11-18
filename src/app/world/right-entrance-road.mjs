/**
 * Toàn bộ kiến trúc, cảnh quan thực tế dọc trục lối vào bên phải từ Cổng Phụ "Tịnh Độ Huyền Môn"
 * (x = 34..66.5, z = +42 -> -28) dựa theo ảnh thật Chùa Vĩnh Tràng (image_bb72a8b0.png, image_97204806.png).
 *
 * Gồm:
 * 1) Hàng rào sắt sơn đỏ + bồn hoa thấp dọc sườn Đông Chánh Điện + mái hiên xanh "TỦ SÁCH VĨNH TRÀNG"
 * 2) Sân gạch tàu trước-phải, hàng 4 tượng Phật/Bồ Tát đá trắng trên bệ kem, mái che & xe 2 bánh
 * 3) Hàng cột đèn cổ điển, cột điện bê tông + dây điện mảnh uốn võng thực tế
 * 4) Quầy nước dừa xiêm · hương hoa dưới dù xanh & tán cây nhiệt đới cao thoáng (không che mặt đường)
 * 5) Hàng dừa / cau cao ven sân & Trai Đường · Nhà Khách nền gạch kem-vàng lùi gọn phía sau
 *
 * Gọi từ buildTempleGroundsV8: buildRightEntranceRoadProps.call(this).
 */
import * as THREE from 'three';
import { makeTextTex, makeHippedRoofMesh } from './shared.mjs';
import { createSculptedSeatedBuddha, createSeatedBodhisattva } from '../sculpted-buddhas.mjs';

export function buildRightEntranceRoadProps() {
  const M = this.MAT;

  // =========================================================================
  // 1. BÊN TRÁI LỐI VÀO (x = 34.4..36.0): Hàng rào sắt đỏ + bồn kiểng thấp
  //    Giữ thoáng 100% tầm nhìn sang mặt bên Chánh Điện vòm vàng-kem & mái ngói đỏ!
  // =========================================================================
  const redIronMat = new THREE.MeshStandardMaterial({
    color: 0xB82A24,
    roughness: 0.42,
    metalness: 0.32
  });
  const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x457536, roughness: 0.8 });

  const addRedIronFenceSpan = (x, zStart, zEnd) => {
    const grp = new THREE.Group();
    const len = Math.abs(zEnd - zStart);
    const midZ = (zStart + zEnd) * 0.5;
    // Bệ gờ xi măng vàng kem thấp
    const lowWall = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, len), M.goldLight);
    lowWall.position.set(x, 0.17, midZ);
    lowWall.receiveShadow = true;
    grp.add(lowWall);

    // Thanh ngang sắt đỏ trên & dưới
    for (const ry of [0.46, 1.18]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, len), redIronMat);
      rail.position.set(x, ry, midZ);
      grp.add(rail);
    }

    // Song đứng + vòng trang trí nhỏ mỗi 0.32m
    const step = 0.34;
    const minZ = Math.min(zStart, zEnd);
    const maxZ = Math.max(zStart, zEnd);
    for (let z = minZ + 0.18; z <= maxZ - 0.18; z += step) {
      const picket = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.78, 6), redIronMat);
      picket.position.set(x, 0.82, z);
      grp.add(picket);
      const spear = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.1, 4), M.goldAccent);
      spear.position.set(x, 1.24, z);
      grp.add(spear);
    }

    // Trụ gạch vàng đầu/giữa/cuối đoạn hàng rào
    const posts = Math.max(2, Math.round(len / 4.2) + 1);
    for (let pi = 0; pi < posts; pi++) {
      const pz = minZ + (pi / Math.max(1, posts - 1)) * len;
      const pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.38, 0.38), M.creamTrim);
      pilaster.position.set(x, 0.69, pz);
      pilaster.castShadow = true;
      grp.add(pilaster);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), M.terracottaPot);
      cap.position.set(x, 1.44, pz);
      grp.add(cap);
    }

    this.exteriorGroup.add(grp);
  };

  // Đoạn hàng rào sắt đỏ dọc sườn Đông Chánh Điện (chừa lối đi vào sân Đài Quán Âm z = 19.5..25.5 & cửa Chánh Điện z < -9.5)
  addRedIronFenceSpan(35.3, 18.8, -8.8);
  addRedIronFenceSpan(35.3, 39.2, 26.8);

  // Bồn hoa giấy & cây kiểng thấp ven chân tường rào trái (không che vòm Chánh Điện)
  const lowBed = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.28, 26.8), M.goldLight);
  lowBed.position.set(34.7, 0.14, 5.0);
  this.exteriorGroup.add(lowBed);

  // Mái hiên xanh "TỦ SÁCH VĨNH TRÀNG · PHÁT HÀNH KINH SÁCH" bên hông Đông Chánh Điện (ảnh flycam image_97204806.png)
  const bookWingGroup = new THREE.Group();
  bookWingGroup.position.set(34.35, 0, -2.5);
  const blueAwningMat = new THREE.MeshStandardMaterial({ color: 0x1653A8, roughness: 0.44, metalness: 0.14 });
  const awning = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.08, 6.2), blueAwningMat);
  awning.position.set(0.55, 3.05, 0);
  awning.rotation.z = -0.22;
  awning.castShadow = true;
  bookWingGroup.add(awning);
  const bookSign = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.64, 5.4),
    new THREE.MeshStandardMaterial({
      map: makeTextTex('TỦ SÁCH VĨNH TRÀNG · PHÁT HÀNH KINH SÁCH', {
        w: 1200,
        h: 150,
        bg: '#134996',
        border: '#FFD875',
        color: '#FFFFFF',
        size: 42
      }),
      roughness: 0.36
    })
  );
  bookSign.position.set(1.26, 2.75, 0);
  bookWingGroup.add(bookSign);
  const bookFrontHeader = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 0.56, 0.12),
    new THREE.MeshStandardMaterial({
      map: makeTextTex('TỦ SÁCH VĨNH TRÀNG', {
        w: 640,
        h: 160,
        bg: '#134996',
        border: '#FFD875',
        color: '#FFFFFF',
        size: 46
      }),
      roughness: 0.36
    })
  );
  bookFrontHeader.position.set(0.58, 2.82, 3.05);
  bookWingGroup.add(bookFrontHeader);
  this.exteriorGroup.add(bookWingGroup);

  // =========================================================================
  // 2. GÓC TRƯỚC PHẢI (x = 48.2..68.8, z = 24.8..40.4):
  //    Sân gạch tàu sáng + Hàng 4 tượng Phật/Bồ Tát đá trắng + Nhà giữ xe 2 bánh
  // =========================================================================
  const frontRightBrickApron = new THREE.Mesh(
    new THREE.BoxGeometry(20.6, 0.11, 15.6),
    new THREE.MeshStandardMaterial({ map: this.sideBrickTex, color: 0xE7B79D, roughness: 0.8 })
  );
  frontRightBrickApron.position.set(58.5, 0.004, 32.6);
  frontRightBrickApron.receiveShadow = true;
  this.exteriorGroup.add(frontRightBrickApron);

  // Bồn đá kem viền thấp trưng bày Hàng Tượng Trắng bên tay phải ngay sau Cổng Phụ (ảnh image_bb72a8b0.png & image_97204806.png)
  const statuePlanter = new THREE.Group();
  const islandCurb = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.32, 7.6), M.creamTrim);
  islandCurb.position.set(54.4, 0.16, 29.2);
  islandCurb.receiveShadow = true;
  statuePlanter.add(islandCurb);
  const islandLawn = new THREE.Mesh(new THREE.BoxGeometry(11.1, 0.36, 6.9), hedgeMat);
  islandLawn.position.set(54.4, 0.18, 29.2);
  statuePlanter.add(islandLawn);

  const statueSpots = [
    { x: 50.0, z: 30.8, isBodhi: false, rotY: -0.62 },
    { x: 52.6, z: 28.6, isBodhi: true, rotY: -0.58 },
    { x: 55.3, z: 27.3, isBodhi: false, rotY: -0.52 },
    { x: 58.1, z: 26.8, isBodhi: true, rotY: -0.45 }
  ];
  for (const sp of statueSpots) {
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.96, 1.52), M.creamTrim);
    plinth.position.set(sp.x, 0.66, sp.z);
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    statuePlanter.add(plinth);
    const plinthTrim = new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.14, 1.66), M.goldLight);
    plinthTrim.position.set(sp.x, 1.18, sp.z);
    statuePlanter.add(plinthTrim);

    const statue = sp.isBodhi
      ? createSeatedBodhisattva(THREE, {
          variant: 'quan_am',
          bodyMat: M.statueWhite,
          trimMat: M.creamTrim,
          crimsonMat: M.stoneLight,
          scale: 0.78
        })
      : createSculptedSeatedBuddha(THREE, {
          bodyMat: M.statueWhite,
          innerMat: M.creamTrim,
          crimsonMat: M.stoneLight,
          hairMat: M.statueWhite,
          scale: 0.78
        });
    statue.position.set(sp.x, 1.24, sp.z);
    statue.rotation.y = sp.rotY;
    statuePlanter.add(statue);

    // Chậu cây nhỏ trang trí hai bên bệ tượng
    const accentBush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 1), M.foliageLight);
    accentBush.position.set(sp.x - 0.85, 0.68, sp.z + 0.95);
    statuePlanter.add(accentBush);
  }
  this.exteriorGroup.add(statuePlanter);
  this.addRectObstacle(48.5, 60.3, 25.3, 33.1);

  // Nhà Giữ Xe 2 Bánh góc ngoài phải (khớp bảng xanh "CHO XE 2 BÁNH VÀO CHÙA" tại cổng)
  const parkingShed = new THREE.Group();
  parkingShed.position.set(63.8, 0, 35.6);
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x3F4E5A, metalness: 0.55, roughness: 0.42 });
  const shedRoofMat = new THREE.MeshStandardMaterial({
    map: this.tinRoofTex,
    color: 0x2F7054,
    roughness: 0.48,
    metalness: 0.18
  });
  for (const sx of [-3.4, 0, 3.4]) {
    for (const sz of [-2.1, 2.1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 2.75, 8), steelMat);
      post.position.set(sx, 1.375, sz);
      post.castShadow = true;
      parkingShed.add(post);
    }
  }
  const shedRoof = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.1, 5.4), shedRoofMat);
  shedRoof.position.set(0, 2.85, 0);
  shedRoof.rotation.x = 0.09;
  shedRoof.castShadow = true;
  parkingShed.add(shedRoof);

  const shedSign = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 0.58, 0.1),
    new THREE.MeshStandardMaterial({
      map: makeTextTex('NHÀ GIỮ XE 2 BÁNH PHẬT TỬ', {
        w: 960,
        h: 160,
        bg: '#165E9E',
        border: '#FFFFFF',
        color: '#FFFFFF',
        size: 46
      }),
      roughness: 0.36
    })
  );
  shedSign.position.set(-4.05, 2.55, 0);
  shedSign.rotation.y = -Math.PI * 0.5;
  parkingShed.add(shedSign);

  // 5 xe máy dựng gọn dưới mái che
  const bikeColors = [0x9E2620, 0x234A7C, 0xD8D4CC, 0x3D4249, 0xA83C28];
  for (let bi = 0; bi < 5; bi++) {
    const bike = new THREE.Group();
    bike.position.set(-2.6 + bi * 1.3, 0, 0.35);
    const frameMat = new THREE.MeshStandardMaterial({ color: bikeColors[bi], roughness: 0.38, metalness: 0.35 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x222528, roughness: 0.85 });
    for (const wz of [-0.52, 0.52]) {
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.065, 8, 14), tireMat);
      wheel.rotation.y = Math.PI / 2;
      wheel.position.set(0, 0.3, wz);
      bike.add(wheel);
    }
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.42, 1.15), frameMat);
    body.position.set(0, 0.62, -0.05);
    bike.add(body);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.62), tireMat);
    seat.position.set(0, 0.85, -0.18);
    bike.add(seat);
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.58, 0.14), frameMat);
    shield.position.set(0, 0.78, 0.42);
    shield.rotation.x = -0.25;
    bike.add(shield);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.54, 6), steelMat);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 1.06, 0.34);
    bike.add(bar);
    parkingShed.add(bike);
  }
  this.exteriorGroup.add(parkingShed);
  this.addRectObstacle(59.8, 68.2, 32.6, 38.6);

  // =========================================================================
  // 3. QUẦY NƯỚC DỪA XIÊM · HƯƠNG HOA DÙ XANH DƯỚI BÓNG CÂY (x = 54.2, z = 18.0)
  //    Theo đúng bố cục ảnh flycam image_97204806.png giữa lối vào bên phải
  // =========================================================================
  const cocoStall = new THREE.Group();
  cocoStall.position.set(54.2, 0, 18.0);
  cocoStall.rotation.y = -Math.PI * 0.5; // Quay mặt ra đường bê tông (-X)
  cocoStall.userData.stallType = 'am_thuc_chay';
  cocoStall.userData.stallTitle = 'Quầy Dừa Xiêm · Nước Mát Ven Đường';

  const thatchMat = new THREE.MeshStandardMaterial({ color: 0x8F7246, roughness: 0.9 });
  const counterWoodMat = new THREE.MeshStandardMaterial({ color: 0x7A4B28, map: this.woodGrainTex, roughness: 0.62 });
  const blueUmbrellaMat = new THREE.MeshStandardMaterial({ color: 0x1E6AC4, roughness: 0.55, side: THREE.DoubleSide });

  const kFloor = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.12, 3.6), M.stoneLight);
  kFloor.position.y = 0.06;
  cocoStall.add(kFloor);
  for (const px of [-1.85, 1.85]) {
    for (const pz of [-1.35, 1.35]) {
      const kp = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 2.45, 7), M.darkWood);
      kp.position.set(px, 1.28, pz);
      kp.castShadow = true;
      cocoStall.add(kp);
    }
  }
  const kRoof = makeHippedRoofMesh(4.9, 4.1, 1.15, thatchMat);
  kRoof.position.set(0, 2.85, 0);
  kRoof.castShadow = true;
  cocoStall.add(kRoof);

  const kCounter = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.88, 0.72), counterWoodMat);
  kCounter.position.set(0, 0.5, 0.95);
  cocoStall.add(kCounter);

  // Rổ dừa xiêm xanh trên quầy
  const cocoMat = new THREE.MeshStandardMaterial({ color: 0x5E963C, roughness: 0.6 });
  for (let ci = 0; ci < 5; ci++) {
    const coco = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 7), cocoMat);
    coco.position.set(-0.95 + ci * 0.25, 1.04, 0.95);
    cocoStall.add(coco);
  }

  // Cây dù xanh dương lớn che bàn ghế trước quầy (chi tiết đặc trưng trong ảnh thật!)
  const umbPole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 2.55, 8), steelMat);
  umbPole.position.set(-1.35, 1.28, 2.45);
  cocoStall.add(umbPole);
  const umbCanopy = new THREE.Mesh(new THREE.ConeGeometry(1.65, 0.58, 8, 1, true), blueUmbrellaMat);
  umbCanopy.position.set(-1.35, 2.48, 2.45);
  umbCanopy.castShadow = true;
  cocoStall.add(umbCanopy);

  const pBlueMat = new THREE.MeshStandardMaterial({ color: 0x2268C2, roughness: 0.4 });
  const smallTbl = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.38, 0.54, 10), pBlueMat);
  smallTbl.position.set(-1.35, 0.27, 2.45);
  cocoStall.add(smallTbl);

  const kSign = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.52, 0.1),
    new THREE.MeshStandardMaterial({
      map: makeTextTex('DỪA XIÊM MỸ THO · NƯỚC MÁT · HƯƠNG HOA', {
        w: 1024,
        h: 160,
        bg: '#FFF6DE',
        border: '#1E6A4E',
        color: '#194D33',
        size: 40
      })
    })
  );
  kSign.position.set(0, 2.28, 1.55);
  cocoStall.add(kSign);

  this.exteriorGroup.add(cocoStall);
  this.stallAnchors.push(cocoStall);
  this.stallClickTargets.push(kCounter, kSign, umbCanopy, kRoof);
  this.addRectObstacle(51.8, 56.8, 15.6, 20.5);
  this.stallTriggers.push({
    x: 49.6,
    z: 18.0,
    radius: 4.8,
    stallType: 'am_thuc_chay',
    title: 'Quầy Dừa Xiêm · Nước Mát Ven Đường',
    ring: null
  });

  // =========================================================================
  // 4. TRAI ĐƯỜNG · NHÀ KHÁCH BỔN TỰ (nền gạch kem lùi gọn ở x = 65.5, z = 11.5)
  //    Thay thế cho nhà sàn gỗ đóng cọc dưới kênh không đúng thực tế
  // =========================================================================
  const guestHall = new THREE.Group();
  guestHall.position.set(65.5, 0, 11.5);
  const hallFloor = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.24, 14.0), M.stoneLight);
  hallFloor.position.y = 0.12;
  hallFloor.receiveShadow = true;
  guestHall.add(hallFloor);

  const hallBody = new THREE.Mesh(new THREE.BoxGeometry(7.2, 3.65, 13.0), M.goldLight);
  hallBody.position.set(0.3, 2.04, 0);
  hallBody.castShadow = true;
  hallBody.receiveShadow = true;
  guestHall.add(hallBody);

  // Hàng cột hiên kem phía Tây hướng ra đường
  for (let cz = -5.2; cz <= 5.2; cz += 2.6) {
    const verCol = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 3.35, 10), M.creamTrim);
    verCol.position.set(-3.7, 1.9, cz);
    verCol.castShadow = true;
    guestHall.add(verCol);
  }
  for (const wz of [-4.2, -1.4, 1.4, 4.2]) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.45, 1.15), M.darkWood);
    win.position.set(-3.32, 2.15, wz);
    guestHall.add(win);
  }
  const hallRoof = makeHippedRoofMesh(9.4, 14.8, 1.85, M.roofTile);
  hallRoof.position.set(0, 4.7, 0);
  hallRoof.castShadow = true;
  guestHall.add(hallRoof);

  const hallSign = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.72, 5.2),
    new THREE.MeshStandardMaterial({
      map: makeTextTex('TRAI ĐƯỜNG · NHÀ KHÁCH BỔN TỰ', {
        w: 1120,
        h: 170,
        bg: '#5C1610',
        border: '#FFD875',
        color: '#FFF2B2',
        size: 50
      })
    })
  );
  hallSign.position.set(-3.92, 3.48, 0);
  guestHall.add(hallSign);

  this.exteriorGroup.add(guestHall);
  this.stiltDiningClickTargets.push(hallSign, hallBody, hallRoof);
  this.addRectObstacle(60.8, 69.8, 4.2, 18.8);

  // =========================================================================
  // 5. ĐÈN ĐƯỜNG CỔ ĐIỂN + CỘT ĐIỆN BÊ TÔNG & DÂY ĐIỆN + CÂY CAO TÁN THOÁNG
  // =========================================================================
  const poleGreyMat = new THREE.MeshStandardMaterial({ color: 0x8C887E, roughness: 0.85 });
  const ironLampMat = new THREE.MeshStandardMaterial({ color: 0x2F322E, roughness: 0.5, metalness: 0.55 });
  const warmBulbMat = new THREE.MeshStandardMaterial({
    color: 0xFFF7DC,
    emissive: 0xFFD98A,
    emissiveIntensity: 0.55,
    roughness: 0.25
  });

  // Đèn đường tay cong dọc mép lề phải (x = 48.35)
  for (const lz of [31.5, 19.5, 7.5, -4.5, -16.5, -28.5]) {
    const lPost = new THREE.Group();
    lPost.position.set(48.35, 0, lz);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.45, 8), ironLampMat);
    base.position.y = 0.225;
    lPost.add(base);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.075, 4.1, 8), ironLampMat);
    shaft.position.y = 2.45;
    lPost.add(shaft);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.038, 1.05, 6), ironLampMat);
    arm.rotation.z = Math.PI * 0.36;
    arm.position.set(-0.42, 4.55, 0);
    lPost.add(arm);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.16, 8), warmBulbMat);
    head.position.set(-0.84, 4.68, 0);
    lPost.add(head);
    this.exteriorGroup.add(lPost);
  }

  // Cột điện bê tông mảnh & dây điện nhẹ vắt dọc ven đường (rất đặc trưng trong ảnh Cổng Phụ image_bb72a8b0.png!)
  const utilityZs = [38.2, 19.5, 0.5, -18.5];
  for (const uz of utilityZs) {
    const uPole = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 7.4, 8), poleGreyMat);
    uPole.position.set(49.35, 3.7, uz);
    uPole.castShadow = true;
    this.exteriorGroup.add(uPole);
    const crossArm = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.09, 0.1), ironLampMat);
    crossArm.position.set(49.35, 7.05, uz);
    this.exteriorGroup.add(crossArm);
  }
  const wireLineMat = new THREE.LineBasicMaterial({ color: 0x35393D, transparent: true, opacity: 0.52 });
  for (let i = 0; i < utilityZs.length - 1; i++) {
    const z1 = utilityZs[i];
    const z2 = utilityZs[i + 1];
    for (const wx of [49.0, 49.35, 49.7]) {
      const pts = [
        new THREE.Vector3(wx, 7.05, z1),
        new THREE.Vector3(wx + 0.05, 6.58, (z1 + z2) * 0.5),
        new THREE.Vector3(wx, 7.05, z2)
      ];
      this.exteriorGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wireLineMat));
    }
  }

  // Cây dừa & cau cao ven sân phải (image_97204806.png)
  const addCoconutPalm = (px, pz, height = 8.4, leanX = 0.08) => {
    const p = new THREE.Group();
    p.position.set(px, 0, pz);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, height, 9), M.trunk);
    trunk.position.y = height * 0.5;
    trunk.rotation.z = leanX;
    trunk.castShadow = true;
    p.add(trunk);
    const topX = -Math.sin(leanX) * height;
    const topY = Math.cos(leanX) * height - 0.12;
    const crown = new THREE.Group();
    crown.position.set(topX, topY, 0);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const frondAnchor = new THREE.Group();
      frondAnchor.rotation.y = a;
      const mat = i % 2 === 0 ? M.foliageLight : M.foliageMid;
      const innerSeg = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.75, 5), mat);
      innerSeg.scale.set(0.7, 1.0, 0.2);
      innerSeg.position.set(0.75, 0.25, 0);
      innerSeg.rotation.z = -Math.PI * 0.36;
      frondAnchor.add(innerSeg);

      const outerSeg = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.85, 5), mat);
      outerSeg.scale.set(0.65, 1.0, 0.18);
      outerSeg.position.set(1.92, -0.18, 0);
      outerSeg.rotation.z = -Math.PI * 0.78;
      frondAnchor.add(outerSeg);
      crown.add(frondAnchor);
    }
    p.add(crown);
    this.exteriorGroup.add(p);
    this.addObstacle(px, pz, 0.45);
  };

  addCoconutPalm(58.0, 37.8, 8.8, 0.1);
  addCoconutPalm(66.0, 29.5, 9.4, -0.06);
  addCoconutPalm(57.2, 22.8, 8.2, 0.08);
  addCoconutPalm(57.8, -3.5, 9.1, -0.07);

  // 4 cây bóng mát thân cao tán rợp đặt sâu về phía phải (tán bắt đầu từ y >= 5.2m nên con đường luôn sáng thoáng!)
  const addTallCanopyTree = (tx, tz, sc = 1.0) => {
    const tGrp = new THREE.Group();
    tGrp.position.set(tx, 0, tz);
    tGrp.scale.setScalar(sc);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.36, 4.9, 10), M.trunk);
    trunk.position.y = 2.45;
    trunk.castShadow = true;
    tGrp.add(trunk);

    for (const [bx, bz, rz, rx] of [
      [-0.65, 0.32, 0.48, -0.22],
      [0.62, -0.28, -0.45, 0.24],
      [-0.25, -0.6, 0.24, 0.44]
    ]) {
      const limb = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.16, 2.2, 7), M.trunk);
      limb.position.set(bx, 4.45, bz);
      limb.rotation.z = rz;
      limb.rotation.x = rx;
      tGrp.add(limb);
    }

    for (const [cx, cy, cz, r, mat] of [
      [0, 6.2, 0, 2.25, M.foliageMid],
      [-1.45, 5.75, 0.65, 1.68, M.foliageDark],
      [1.35, 5.85, -0.55, 1.65, M.foliageLight],
      [0.15, 7.0, 0.25, 1.55, M.foliageLight]
    ]) {
      const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), mat);
      crown.scale.set(1.18, 0.68, 1.15);
      crown.position.set(cx, cy, cz);
      crown.castShadow = true;
      tGrp.add(crown);
    }
    this.exteriorGroup.add(tGrp);
    this.addObstacle(tx, tz, 0.58);
  };

  addTallCanopyTree(55.2, 21.5, 1.08);
  addTallCanopyTree(56.0, 10.5, 1.12);
  addTallCanopyTree(55.5, -1.5, 1.1);
  addTallCanopyTree(54.0, 2.5, 1.02);

  // Hai cây thấp gọn lùi sâu ra rìa sau bãi rẽ trái (giữ ngã rẽ vào Chánh Điện rộng thoáng & nhiều nắng!)
  addTallCanopyTree(34.6, -34.0, 0.92);
  addTallCanopyTree(49.5, -35.5, 0.96);

  // Dây cờ Phật giáo trang trí căng cao (y = 5.65m) ngang lối vào rộng 12.6m — không vướng tầm mắt
  const buntingMat = new THREE.MeshBasicMaterial({ map: this.flagTex72, side: THREE.DoubleSide });
  for (const bz of [23.8, 5.5]) {
    const wire = new THREE.Mesh(new THREE.BoxGeometry(12.6, 0.025, 0.025), ironLampMat);
    wire.position.set(41.8, 5.65, bz);
    this.exteriorGroup.add(wire);
    for (let fi = -4; fi <= 4; fi++) {
      const pennant = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.34), buntingMat);
      pennant.position.set(41.8 + fi * 1.18, 5.45 - Math.abs(fi) * 0.02, bz);
      this.exteriorGroup.add(pennant);
    }
  }
}
