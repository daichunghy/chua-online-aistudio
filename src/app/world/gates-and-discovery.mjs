/**
 * Các điểm khám phá mở rộng, hàng rào, Tam Quan, cổng phụ khảm gốm.
 *
 * Mixin của VinhTrang3DWorld: 5 method (buildExpandedDiscoveryZones … buildSideMosaicGate).
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, createSculptedBodhisattva, createSculptedGardenArhat, makeCanvasTex, makeTextTex, makeHippedRoofMesh } from './shared.mjs';

export const gatesAndDiscoveryMethods = {
  buildExpandedDiscoveryZones() {
    const M = this.MAT;
    const pathMat = new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xDCD0B8, roughness: 0.82 });
    const lawnMat = new THREE.MeshStandardMaterial({ color: 0x548342, roughness: 0.9 });
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x6A6760, roughness: 0.88 });
    const mossMat = new THREE.MeshStandardMaterial({ color: 0x4C7338, roughness: 0.85 });
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x2F6E66,
      roughness: 0.16,
      metalness: 0.25,
      transparent: true,
      opacity: 0.92
    });
    const ribbonRedMat = new THREE.MeshStandardMaterial({ color: 0xC92A2A, roughness: 0.65, side: THREE.DoubleSide });
    const ribbonGoldMat = new THREE.MeshStandardMaterial({ color: 0xE6B84C, roughness: 0.55, side: THREE.DoubleSide });

    // Garden connecting walkways across West (-65..-36), North (-70..-42), and East (50..66) discovery wings
    const addWalkStrip = (x, z, w, d) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.11, d), pathMat);
      m.position.set(x, 0.005, z);
      m.receiveShadow = true;
      this.exteriorGroup.add(m);
    };
    addWalkStrip(-44.0, 8.0, 5.4, 72.0); // West promenade path linking Vườn Lâm Tỳ Ni -> Non Bộ -> Vườn La Hán -> Tháp Chuông
    addWalkStrip(-10.0, -45.5, 76.0, 5.2); // North promenade linking Tháp Chuông -> Hồ Phóng Sinh -> Bảo Tháp -> Nhà Tổ -> Lầu Trống
    addWalkStrip(51.5, -12.0, 4.8, 66.0); // East tea garden path linking Cổng Phụ garden -> Lầu Trà Thiền -> Lầu Trống
    addWalkStrip(54.5, -18.0, 14.0, 4.4); // Connector from widened left-turn plaza into shifted Giảng Đường (66.5, -18)
    addWalkStrip(-40.5, 29.0, 18.0, 4.4); // Connector from Di Lặc Plaza into Vườn Lâm Tỳ Ni

    // 1. VƯỜN LÂM TỲ NI & CÂY BỒ ĐỀ CỔ THỤ (-53.5, 22.0)
    const ltyn = new THREE.Group();
    ltyn.position.set(-53.5, 0, 22.0);
    const lawn = new THREE.Mesh(new THREE.CylinderGeometry(9.6, 10.2, 0.16, 24), lawnMat);
    lawn.position.y = 0.08;
    ltyn.add(lawn);
    const stoneRing = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.6, 0.42, 16), M.stoneLight);
    stoneRing.position.y = 0.25;
    ltyn.add(stoneRing);
    // Golden Newborn Buddha (Thái Tử Đản Sanh) atop blooming 7-step lotus pedestal
    const lotusBase = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.35, 0.72, 16), M.mosaicRed);
    lotusBase.position.y = 0.82;
    ltyn.add(lotusBase);
    const lotusCap = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.75, 0.35, 16), M.lotusBlue);
    lotusCap.position.y = 1.32;
    ltyn.add(lotusCap);
    const infantBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 1.05, 12), M.goldAccent);
    infantBody.position.y = 2.02;
    ltyn.add(infantBody);
    const infantHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), M.goldAccent);
    infantHead.position.y = 2.7;
    ltyn.add(infantHead);
    const rightArmUp = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.65, 8), M.goldAccent);
    rightArmUp.position.set(0.28, 2.75, 0);
    ltyn.add(rightArmUp);
    // Ancient Bodhi tree ("Cây Bồ Đề Cổ Thụ") with wish ribbons
    const bodhiTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.88, 4.6, 12), M.trunk);
    bodhiTrunk.position.set(-4.2, 2.3, -3.2);
    bodhiTrunk.castShadow = true;
    ltyn.add(bodhiTrunk);
    for (const [cx, cy, cz, r] of [
      [-4.2, 5.6, -3.2, 3.2],
      [-6.2, 4.8, -2.2, 2.2],
      [-2.1, 5.0, -3.5, 2.3],
      [-4.4, 5.2, -5.2, 2.1]
    ]) {
      const cr = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), M.foliageLight);
      cr.position.set(cx, cy, cz);
      cr.castShadow = true;
      ltyn.add(cr);
    }
    for (let ri = 0; ri < 14; ri++) {
      const a = (ri / 14) * Math.PI * 2;
      const rib = new THREE.Mesh(
        new THREE.PlaneGeometry(0.14, 0.95),
        ri % 2 === 0 ? ribbonRedMat : ribbonGoldMat
      );
      rib.position.set(-4.2 + Math.cos(a) * 2.2, 3.6 + (ri % 3) * 0.25, -3.2 + Math.sin(a) * 2.2);
      ltyn.add(rib);
    }
    const ltynSign = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.72, 0.14),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('VƯỜN LÂM TỲ NI · CÂY BỒ ĐỀ', { w: 960, h: 180, bg: '#1C5A34', border: '#FFD875', color: '#FFF6E5', size: 48 })
      })
    );
    ltynSign.position.set(4.5, 1.15, 4.5);
    ltynSign.rotation.y = 0.65;
    ltyn.add(ltynSign);
    this.exteriorGroup.add(ltyn);
    this.addObstacle(-53.5, 22.0, 4.4);
    this.addObstacle(-57.7, 18.8, 1.8);

    // 2. HÒN NON BỘ & ĐỘNG QUÁN THẾ ÂM (-54.0, -4.0)
    const nonBo = new THREE.Group();
    nonBo.position.set(-54.0, 0, -4.0);
    const basinCurb = new THREE.Mesh(new THREE.CylinderGeometry(8.2, 8.6, 0.62, 24), M.stoneDark);
    basinCurb.position.y = 0.31;
    nonBo.add(basinCurb);
    const poolWater = new THREE.Mesh(new THREE.CylinderGeometry(7.6, 7.6, 0.56, 24), waterMat);
    poolWater.position.y = 0.34;
    nonBo.add(poolWater);
    // Sculpted layered limestone peaks + grotto arch + cascading waterfall
    for (const [rx, ry, rz, sx, sy, sz] of [
      [-1.4, 2.2, -1.2, 2.8, 4.4, 2.6],
      [1.8, 1.8, -1.5, 2.4, 3.6, 2.2],
      [-2.8, 1.1, 1.0, 1.9, 2.2, 1.8],
      [2.6, 1.0, 1.2, 1.7, 2.0, 1.7],
      [0.0, 3.4, -2.0, 2.2, 5.2, 2.1]
    ]) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.0, 1), rockMat);
      rock.scale.set(sx, sy, sz);
      rock.position.set(rx, ry, rz);
      rock.castShadow = true;
      nonBo.add(rock);
      const moss = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 6), mossMat);
      moss.scale.set(sx * 0.72, 0.32, sz * 0.72);
      moss.position.set(rx, ry + sy * 0.68, rz);
      nonBo.add(moss);
    }
    const waterfall = new THREE.Mesh(
      new THREE.PlaneGeometry(1.25, 3.8),
      new THREE.MeshBasicMaterial({ color: 0xB8F0FA, transparent: true, opacity: 0.78, side: THREE.DoubleSide })
    );
    waterfall.position.set(-0.2, 2.25, -0.3);
    waterfall.rotation.x = 0.14;
    nonBo.add(waterfall);
    // Sculpted White Quán Thế Âm standing inside Non Bộ niche
    const qaSculpt = createSculptedBodhisattva(THREE, { variant: 'quan_am', ivory: true, scale: 0.72 });
    qaSculpt.position.set(0.2, 1.8, 0.65);
    nonBo.add(qaSculpt);
    // Arched stone footbridge in front of Non Bộ
    const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.18, 4.2), M.creamTrim);
    bridgeDeck.position.set(5.4, 0.85, 0);
    nonBo.add(bridgeDeck);
    const nbPlaque = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.68, 0.14),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('HÒN NON BỘ · ĐỘNG QUÁN ÂM', { w: 960, h: 180, bg: '#5C1B12', border: '#FFD875', color: '#FFE08A', size: 46 })
      })
    );
    nbPlaque.position.set(6.8, 1.05, 2.8);
    nbPlaque.rotation.y = Math.PI / 2;
    nonBo.add(nbPlaque);
    this.exteriorGroup.add(nonBo);
    this.addObstacle(-54.0, -4.0, 8.6);

    // 3. VƯỜN LA HÁN NGOÀI TRỜI & CÂY SA LA (-49.5, -24.0)
    const arhatGarden = new THREE.Group();
    arhatGarden.position.set(-49.5, 0, -24.0);
    const agPlaza = new THREE.Mesh(new THREE.CylinderGeometry(7.8, 8.2, 0.24, 24), M.stoneLight);
    agPlaza.position.y = 0.12;
    agPlaza.receiveShadow = true;
    arhatGarden.add(agPlaza);
    for (let ai = 0; ai < 4; ai++) {
      const ang = (ai / 4) * Math.PI * 2 + Math.PI / 4;
      const px = Math.cos(ang) * 4.4;
      const pz = Math.sin(ang) * 4.4;
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.82, 0.72, 12), M.stoneDark);
      ped.position.set(px, 0.48, pz);
      arhatGarden.add(ped);
      const stat = createSculptedGardenArhat(THREE, ai, { scale: 1.08 });
      stat.position.set(px, 0.84, pz);
      stat.rotation.y = Math.atan2(-px, -pz);
      stat.userData.arhatIndex = ai;
      arhatGarden.add(stat);
    }
    const agSign = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 0.72, 0.14),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('VƯỜN LA HÁN · CÂY SA LA', { w: 960, h: 180, bg: '#1C5A34', border: '#FFD875', color: '#FFF6E5', size: 46 })
      })
    );
    agSign.position.set(5.4, 1.18, 2.8);
    agSign.rotation.y = Math.PI / 2;
    arhatGarden.add(agSign);
    this.outdoorArhatPlaza = arhatGarden;
    this.exteriorGroup.add(arhatGarden);
    this.addObstacle(-49.5, -24.0, 5.2);

    // 4. HỒ PHÓNG SINH LỚN & CẦU GỖ CHỮ Z (-28.0, -58.5)
    const releasePond = this.buildLotusPond(20.0, 13.5, 16, false);
    releasePond.position.set(-28.0, 0, -58.5);
    this.exteriorGroup.add(releasePond);
    this.addRectObstacle(-38.5, -17.5, -65.5, -51.5);
    // Zig-zag wooden bridge over Hồ Phóng Sinh
    const zBridge = new THREE.Group();
    const woodRed = new THREE.MeshStandardMaterial({ color: 0x8A3224, roughness: 0.64 });
    const bridgeSeg1 = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.16, 1.45), woodRed);
    bridgeSeg1.position.set(-4.5, 0.88, 2.2);
    zBridge.add(bridgeSeg1);
    const bridgeSeg2 = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.16, 5.6), woodRed);
    bridgeSeg2.position.set(-0.5, 0.88, 0.0);
    zBridge.add(bridgeSeg2);
    const bridgeSeg3 = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.16, 1.45), woodRed);
    bridgeSeg3.position.set(3.5, 0.88, -2.2);
    zBridge.add(bridgeSeg3);
    zBridge.position.set(-28.0, 0, -58.5);
    this.exteriorGroup.add(zBridge);

    // 5. THÁP ĐẠI HỒNG CHUNG (-44, -56) & LẦU TRỐNG BÁT NHÃ (46, -56)
    const buildBellDrumTower = (tx, tz, labelText, isBell = true) => {
      const tg = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.9, 6.4), M.stoneLight);
      base.position.y = 0.45;
      base.receiveShadow = true;
      tg.add(base);
      for (const px of [-2.3, 2.3]) {
        for (const pz of [-2.3, 2.3]) {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 6.8, 10), M.redColumn);
          col.position.set(px, 4.2, pz);
          col.castShadow = true;
          tg.add(col);
        }
      }
      const floor2 = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.35, 6.0), M.goldWall);
      floor2.position.y = 4.6;
      tg.add(floor2);
      const roof1 = makeHippedRoofMesh(7.6, 7.6, 1.75, M.roofTile);
      roof1.position.y = 5.5;
      tg.add(roof1);
      const roof2 = makeHippedRoofMesh(5.6, 5.6, 1.95, M.roofTile);
      roof2.position.y = 8.45;
      tg.add(roof2);
      if (isBell) {
        const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.85, 1.55, 16), M.bronzeBurner);
        bell.position.y = 6.35;
        tg.add(bell);
        this.bellTowerArchAnchors.push({ group: tg, placeholder: bell, y: 5.55, targetH: 1.72 });
        this.bellTowerClickTargets.push(tg);
      } else {
        const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 1.35, 16), M.mosaicRed);
        drum.rotation.z = Math.PI / 2;
        drum.position.y = 6.25;
        tg.add(drum);
        this.drumTowerArchAnchors.push({ group: tg, placeholder: drum, y: 5.5, targetH: 1.5 });
      }
      const plaque = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 0.68, 0.14),
        new THREE.MeshStandardMaterial({
          map: makeTextTex(labelText, { w: 960, h: 180, bg: '#5C1B12', border: '#FFD875', color: '#FFD970', size: 46 })
        })
      );
      plaque.position.set(0, 3.85, 2.55);
      tg.add(plaque);
      tg.position.set(tx, 0, tz);
      this.exteriorGroup.add(tg);
      this.addRectObstacle(tx - 3.6, tx + 3.6, tz - 3.6, tz + 3.6);
    };
    buildBellDrumTower(-44.0, -56.0, 'LẦU ĐẠI HỒNG CHUNG', true);
    buildBellDrumTower(46.0, -56.0, 'LẦU TRỐNG BÁT NHÃ', false);

    // 6. HẬU TỔ · NHÀ THỜ TỔ MIỀN NAM (14.5, -72.0 — phía sau vườn Phật Niết Bàn)
    const nhaTo = new THREE.Group();
    nhaTo.position.set(14.5, 0, -72.0);
    const ntPlinth = new THREE.Mesh(new THREE.BoxGeometry(20.5, 0.68, 11.5), M.stoneLight);
    ntPlinth.position.y = 0.34;
    ntPlinth.receiveShadow = true;
    nhaTo.add(ntPlinth);
    const ntBody = new THREE.Mesh(new THREE.BoxGeometry(18.5, 4.6, 9.2), M.goldWall);
    ntBody.position.y = 2.95;
    ntBody.castShadow = true;
    nhaTo.add(ntBody);
    for (let ci = -3; ci <= 3; ci++) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 4.6, 10), M.darkWood);
      col.position.set(ci * 2.8, 2.95, 5.1);
      nhaTo.add(col);
    }
    const ntRoof = makeHippedRoofMesh(21.4, 12.2, 3.1, M.roofTile);
    ntRoof.position.y = 6.75;
    ntRoof.castShadow = true;
    nhaTo.add(ntRoof);
    const ntPlaque = new THREE.Mesh(
      new THREE.BoxGeometry(6.8, 0.95, 0.16),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('TỔ ĐƯỜNG VĨNH TRÀNG', { w: 1200, h: 200, bg: '#32140A', border: '#FFD875', color: '#FFD970', size: 62 })
      })
    );
    ntPlaque.position.set(0, 5.2, 5.25);
    nhaTo.add(ntPlaque);
    const ntBurner = this.buildIncenseBurner(0.66);
    ntBurner.position.set(0, 0.68, 6.2);
    nhaTo.add(ntBurner);
    this.exteriorGroup.add(nhaTo);
    this.addRectObstacle(4.1, 24.9, -78.0, -65.5);

    // 6b. KHU NHÀ VỆ SINH NAM — NỮ SÂN SAU CHÙA (35.5, -66.5 — sạch sẽ, rộng rãi, đông khách hành hương!)
    const restroomGroup = new THREE.Group();
    restroomGroup.position.set(35.5, 0, -66.5);
    const rrCeramicMat = new THREE.MeshStandardMaterial({ color: 0xC9DDD8, roughness: 0.36 });
    const rrWallMat = new THREE.MeshStandardMaterial({ map: this.limeWallTex, color: 0xF1E5C8, roughness: 0.82 });
    const rrTileApronMat = new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xC5BAA6, roughness: 0.82 });
    const rrChromeMat = new THREE.MeshStandardMaterial({ color: 0xDCE2E8, roughness: 0.2, metalness: 0.82 });
    const rrMirrorMat = new THREE.MeshStandardMaterial({ color: 0xB8D8E6, roughness: 0.1, metalness: 0.72 });
    const rrDoorDarkMat = new THREE.MeshStandardMaterial({ color: 0x4E3222, roughness: 0.65 });

    // Sân lát gạch rộng phía trước nhà vệ sinh nối ra lối đi sân sau
    const rrApron = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.1, 10.6), rrTileApronMat);
    rrApron.position.set(0, 0.05, 3.6);
    rrApron.receiveShadow = true;
    restroomGroup.add(rrApron);

    // Khối nhà chính 12.6m x 4.8m tường kem-vàng + gạch ốp chân tường xanh ngọc sạch sẽ
    const rrPlinth = new THREE.Mesh(new THREE.BoxGeometry(12.8, 0.24, 5.2), M.stoneLight);
    rrPlinth.position.set(0, 0.12, 0);
    restroomGroup.add(rrPlinth);

    const rrDado = new THREE.Mesh(new THREE.BoxGeometry(12.4, 1.35, 4.6), rrCeramicMat);
    rrDado.position.set(0, 0.915, 0);
    rrDado.castShadow = true;
    restroomGroup.add(rrDado);

    const rrUpper = new THREE.Mesh(new THREE.BoxGeometry(12.4, 1.95, 4.56), rrWallMat);
    rrUpper.position.set(0, 2.56, 0);
    rrUpper.castShadow = true;
    restroomGroup.add(rrUpper);

    // Ô gạch bông gió thoáng khí dọc trên cao
    for (let vi = -5; vi <= 5; vi++) {
      const vent = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.42, 0.12), M.stoneDark);
      vent.position.set(vi * 1.02, 3.05, 2.28);
      restroomGroup.add(vent);
    }

    // Mái ngói đỏ 2 mái truyền thống + mái hiên che nắng mưa phía trước
    const rrRoof = makeHippedRoofMesh(13.8, 6.2, 1.75, M.roofTile);
    rrRoof.position.set(0, 4.35, 0);
    rrRoof.castShadow = true;
    restroomGroup.add(rrRoof);

    const rrEave = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.12, 2.4), M.roofTile);
    rrEave.position.set(0, 3.36, 3.25);
    rrEave.rotation.x = 0.16;
    rrEave.castShadow = true;
    restroomGroup.add(rrEave);

    for (const cx of [-5.8, -2.2, 2.2, 5.8]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 3.25, 8), M.creamTrim);
      col.position.set(cx, 1.72, 4.15);
      col.castShadow = true;
      restroomGroup.add(col);
    }

    // Lối vào riêng biệt NAM (bên trái) & NỮ (bên phải) có vách ngăn lịch sự và biển hiệu rõ ràng
    const maleDoor = new THREE.Mesh(new THREE.BoxGeometry(1.45, 2.2, 0.16), rrDoorDarkMat);
    maleDoor.position.set(-4.0, 1.32, 2.28);
    restroomGroup.add(maleDoor);
    const maleScreen = new THREE.Mesh(new THREE.BoxGeometry(1.75, 2.05, 0.14), rrCeramicMat);
    maleScreen.position.set(-4.0, 1.24, 3.15);
    restroomGroup.add(maleScreen);
    const maleSign = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.62, 0.1),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('🚹 NHÀ VỆ SINH NAM', {
          w: 720, h: 170, bg: '#155B9E', border: '#FFFFFF', color: '#FFFFFF', size: 44
        }),
        roughness: 0.35
      })
    );
    maleSign.position.set(-4.0, 2.86, 4.18);
    restroomGroup.add(maleSign);

    const femaleDoor = new THREE.Mesh(new THREE.BoxGeometry(1.45, 2.2, 0.16), rrDoorDarkMat);
    femaleDoor.position.set(4.0, 1.32, 2.28);
    restroomGroup.add(femaleDoor);
    const femaleScreen = new THREE.Mesh(new THREE.BoxGeometry(1.75, 2.05, 0.14), rrCeramicMat);
    femaleScreen.position.set(4.0, 1.24, 3.15);
    restroomGroup.add(femaleScreen);
    const femaleSign = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.62, 0.1),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('🚺 NHÀ VỆ SINH NỮ', {
          w: 720, h: 170, bg: '#B92E5D', border: '#FFFFFF', color: '#FFFFFF', size: 44
        }),
        roughness: 0.35
      })
    );
    femaleSign.position.set(4.0, 2.86, 4.18);
    restroomGroup.add(femaleSign);

    // Biển tổng trên mái hiên
    const rrMainSign = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.68, 0.12),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('KHU VỆ SINH · BỒN RỬA TAY', {
          w: 1100, h: 160, bg: '#1E5B3A', border: '#F2D178', color: '#FFFDF2', size: 46
        }),
        roughness: 0.38
      })
    );
    rrMainSign.position.set(0, 3.68, 4.25);
    restroomGroup.add(rrMainSign);

    // Khu Bồn Rửa Tay ngoài trời ở giữa (4 bồn sứ, vòi inox, gương soi lớn)
    const washCounter = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.82, 0.68), M.stoneLight);
    washCounter.position.set(0, 0.56, 2.68);
    restroomGroup.add(washCounter);
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.92, 0.05), rrMirrorMat);
    mirror.position.set(0, 1.68, 2.34);
    restroomGroup.add(mirror);
    for (const bx of [-1.2, -0.4, 0.4, 1.2]) {
      const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.16, 12), M.statueWhite);
      basin.position.set(bx, 1.0, 2.74);
      restroomGroup.add(basin);
      const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 6), rrChromeMat);
      faucet.position.set(bx, 1.12, 2.52);
      restroomGroup.add(faucet);
    }

    // Bình nước uống inox miễn phí bên cạnh cho khách hành hương
    const waterTank = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.92, 14), rrChromeMat);
    waterTank.position.set(-6.05, 1.18, 3.25);
    restroomGroup.add(waterTank);
    const waterStand = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.62), M.stoneDark);
    waterStand.position.set(-6.05, 0.36, 3.25);
    restroomGroup.add(waterStand);
    const waterLabel = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.34, 0.06),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('NƯỚC UỐNG MIỄN PHÍ', {
          w: 512, h: 140, bg: '#155B9E', border: '#FFFFFF', color: '#FFFFFF', size: 32
        })
      })
    );
    waterLabel.position.set(-6.05, 1.92, 3.28);
    restroomGroup.add(waterLabel);

    // 2 ghế đá chờ dưới bóng cây trước sân nhà vệ sinh
    for (const bx of [-4.2, 4.2]) {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.12, 0.56), M.stoneLight);
      seat.position.set(bx, 0.5, 7.6);
      restroomGroup.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.44, 0.08), M.stoneLight);
      back.position.set(bx, 0.78, 7.86);
      restroomGroup.add(back);
      for (const lx of [-0.75, 0.75]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.48, 0.48), M.stoneDark);
        leg.position.set(bx + lx, 0.24, 7.6);
        restroomGroup.add(leg);
      }
    }

    this.exteriorGroup.add(restroomGroup);
    this.addRectObstacle(29.0, 42.0, -69.2, -62.8);

    // 7. LẦU TRÀ THIỀN & VƯỜN LAN CỔ TỰ (58.0, -12.0)
    const teaGroup = new THREE.Group();
    teaGroup.position.set(58.0, 0, -12.0);
    const teaBase = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.8, 0.45, 8), M.stoneLight);
    teaBase.position.y = 0.225;
    teaGroup.add(teaBase);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 3.6, 8), M.darkWood);
      post.position.set(Math.cos(a) * 3.4, 2.2, Math.sin(a) * 3.4);
      teaGroup.add(post);
    }
    const teaRoof = new THREE.Mesh(new THREE.ConeGeometry(4.8, 1.9, 8), M.roofTile);
    teaRoof.position.y = 4.95;
    teaRoof.castShadow = true;
    teaGroup.add(teaRoof);
    const teaTable = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.72, 0.74, 12), M.stoneDark);
    teaTable.position.y = 0.82;
    teaGroup.add(teaTable);
    const teaPot = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), M.terracottaPot);
    teaPot.position.y = 1.32;
    teaGroup.add(teaPot);
    for (let s = 0; s < 4; s++) {
      const sa = (s / 4) * Math.PI * 2 + 0.4;
      const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.45, 10), M.stoneLight);
      stool.position.set(Math.cos(sa) * 1.55, 0.68, Math.sin(sa) * 1.55);
      teaGroup.add(stool);
    }
    // Orchid trellis pergola behind Lầu Trà Thiền
    const orchidArch = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.18, 9.0), M.darkWood);
    orchidArch.position.set(0, 3.35, -8.5);
    teaGroup.add(orchidArch);
    for (const pz of [-12.0, -5.0]) {
      for (const px of [-2.1, 2.1]) {
        const oPost = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 3.4, 8), M.darkWood);
        oPost.position.set(px, 1.7, pz);
        teaGroup.add(oPost);
      }
    }
    for (let oi = 0; oi < 8; oi++) {
      const oz = -11.5 + oi * 0.9;
      const ox = (oi % 2 === 0 ? -1 : 1) * 1.1;
      const bloom = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 6),
        new THREE.MeshStandardMaterial({ color: oi % 2 === 0 ? 0xCE78C8 : 0xFFF2F8, roughness: 0.5 })
      );
      bloom.position.set(ox, 2.72, oz);
      teaGroup.add(bloom);
    }
    const teaSign = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.65, 0.12),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('LẦU TRÀ THIỀN · VƯỜN LAN', { w: 960, h: 180, bg: '#1C5A34', border: '#FFD875', color: '#FFF6E5', size: 46 })
      })
    );
    teaSign.position.set(-3.8, 3.15, 0);
    teaSign.rotation.y = -Math.PI / 2;
    teaGroup.add(teaSign);
    this.exteriorGroup.add(teaGroup);
    this.addObstacle(58.0, -12.0, 4.4);
  },

  buildFenceAndGateWall() {
    const M = this.MAT;
    const g = new THREE.Group();
    const baseMat = M.goldWall;
    const barMat = M.goldAccent;

    const addWallSeg = (x1, z1, x2, z2) => {
      const len = Math.hypot(x2 - x1, z2 - z1);
      const ang = Math.atan2(x2 - x1, z2 - z1);
      const seg = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.85, len), baseMat);
      base.position.y = 0.425;
      seg.add(base);
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, len), barMat);
      topRail.position.y = 2.05;
      seg.add(topRail);
      const posts = Math.max(2, Math.floor(len / 4.5));
      for (let i = 0; i <= posts; i++) {
        const pz = -len / 2 + (i / posts) * len;
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.55, 2.35, 0.55), baseMat);
        post.position.set(0, 1.175, pz);
        seg.add(post);
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), M.lotusBlue);
        cap.position.set(0, 2.48, pz);
        seg.add(cap);
      }
      seg.position.set((x1 + x2) / 2, 0, (z1 + z2) / 2);
      seg.rotation.y = ang;
      g.add(seg);
    };

    // Expanded Perimeter walls (-68..68, -92..41.5), leaving ONLY Cổng Phụ (x=35.8..45.2) open!
    addWallSeg(-68, 41.5, 17, 41.5);
    addWallSeg(29, 41.5, 35.8, 41.5);
    addWallSeg(45.2, 41.5, 68, 41.5);
    addWallSeg(-68, -92, -68, 41.5);
    addWallSeg(68, -92, 68, 41.5);
    addWallSeg(-68, -92, 68, -92);

    this.addRectObstacle(-68.5, 17.2, 40.9, 42.1);
    this.addRectObstacle(28.8, 36.6, 40.9, 42.1);
    this.addRectObstacle(44.4, 68.5, 40.9, 42.1);
    this.addRectObstacle(-68.8, -67.2, -92.5, 42.0);
    this.addRectObstacle(67.2, 68.8, -92.5, 42.0);
    this.addRectObstacle(-68.5, 68.5, -92.8, -91.2);

    this.exteriorGroup.add(g);
  },

  buildTamQuanGate(signText = 'CHÙA VĨNH TRÀNG', isMainGate = false) {
    const M = this.MAT;
    const g = new THREE.Group();
    const structGroup = new THREE.Group();
    g.add(structGroup);
    if (isMainGate) {
      this.tamQuanProceduralParts.push(structGroup);
    }
    const pillarPositions = [-5.8, -2.5, 2.5, 5.8];
    const pillarHeights = [6.2, 8.2, 8.2, 6.2];

    const tamQuanMosaicMat = new THREE.MeshStandardMaterial({
      map: this.makeMosaicShardTex(),
      roughness: 0.38,
      metalness: 0.1
    });

    pillarPositions.forEach((px, i) => {
      const h = pillarHeights[i];
      const p = new THREE.Mesh(new THREE.BoxGeometry(1.15, h, 1.15), M.goldWall);
      p.position.set(px, h / 2, 0);
      p.castShadow = true;
      structGroup.add(p);

      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.75, h - 1.2, 1.2), tamQuanMosaicMat);
      strip.position.set(px, h / 2, 0);
      structGroup.add(strip);

      const finial = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.3, 8), M.mosaicRed);
      finial.position.set(px, h + 0.65, 0);
      structGroup.add(finial);
    });

    const beam = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.5, 1.35), M.goldWall);
    beam.position.set(0, 6.4, 0);
    structGroup.add(beam);

    const signTex = makeTextTex(signText, {
      w: 1500,
      h: 210,
      bg: '#233D75',
      border: '#D9A441',
      color: '#FFE08A',
      size: 38
    });
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(4.95, 0.92, 1.42),
      new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.4 })
    );
    sign.position.set(0, 6.45, 0);
    g.add(sign);

    for (const sx of [-4.15, 4.15]) {
      const sb = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.0, 1.15), M.goldWall);
      sb.position.set(sx, 4.7, 0);
      structGroup.add(sb);
      const sr = makeHippedRoofMesh(3.6, 2.0, 1.05, M.roofTile);
      sr.position.set(sx, 5.7, 0);
      structGroup.add(sr);
    }

    if (isMainGate) {
      for (const upx of [-1.85, 1.85]) {
        const upCol = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.8, 0.95), M.goldWall);
        upCol.position.set(upx, 8.35, 0);
        structGroup.add(upCol);
      }
      const upperLintel = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.65, 1.15), M.goldWall);
      upperLintel.position.set(0, 9.75, 0);
      structGroup.add(upperLintel);

      const nicheStand = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.56, 0.36, 12), M.statueWhite);
      nicheStand.position.set(0, 7.15, 0);
      structGroup.add(nicheStand);
      const buddhaLower = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.36, 0.92, 12), M.statueWhite);
      buddhaLower.position.set(0, 7.78, 0);
      structGroup.add(buddhaLower);
      const buddhaTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.64, 12), M.statueWhite);
      buddhaTorso.position.set(0, 8.5, 0);
      structGroup.add(buddhaTorso);
      const buddhaShoulders = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), M.statueWhite);
      buddhaShoulders.scale.set(1.28, 0.55, 0.72);
      buddhaShoulders.position.set(0, 8.76, 0);
      structGroup.add(buddhaShoulders);
      const buddhaHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), M.statueWhite);
      buddhaHead.position.set(0, 9.16, 0);
      structGroup.add(buddhaHead);
      const buddhaHalo = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.035, 8, 20), M.goldAccent);
      buddhaHalo.position.set(0, 9.12, -0.14);
      structGroup.add(buddhaHalo);

      for (let t = 0; t < 2; t++) {
        const w = 6.8 - t * 1.9;
        const roof = makeHippedRoofMesh(w, 2.5 - t * 0.45, 1.2, M.roofTile);
        roof.position.set(0, 10.35 + t * 1.18, 0);
        structGroup.add(roof);
      }

      // Main Gate (Cổng Chính) wrought-iron leaves CLOSED ceremonially across the archway
      const ironMat = new THREE.MeshStandardMaterial({ color: 0xC6933A, metalness: 0.62, roughness: 0.34 });
      for (const side of [-1, 1]) {
        const wingPivot = new THREE.Group();
        wingPivot.position.set(side * 1.92, 0, -0.12);
        wingPivot.rotation.y = 0; // Shut closed across center
        const frameTop = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.1, 0.08), ironMat);
        frameTop.position.set(-side * 0.95, 2.95, 0);
        wingPivot.add(frameTop);
        const frameMid = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.1, 0.08), ironMat);
        frameMid.position.set(-side * 0.95, 1.55, 0);
        wingPivot.add(frameMid);
        const frameBot = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, 0.08), ironMat);
        frameBot.position.set(-side * 0.95, 0.25, 0);
        wingPivot.add(frameBot);
        for (let bi = 0; bi < 8; bi++) {
          const bx = -side * (0.14 + bi * 0.24);
          const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.8, 6), ironMat);
          bar.position.set(bx, 1.6, 0);
          wingPivot.add(bar);
          const spear = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 6), ironMat);
          spear.position.set(bx, 3.08, 0);
          wingPivot.add(spear);
        }
        g.add(wingPivot);
        this.closedMainGateClickTargets.push(wingPivot);
      }

      // Center padlock bar + polite notice sign guiding visitors to open Cổng Phụ
      const lockBox = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.42, 0.18), M.goldAccent);
      lockBox.position.set(0, 1.55, -0.05);
      g.add(lockBox);

      const closedNotice = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 0.62, 0.1),
        new THREE.MeshStandardMaterial({
          map: makeTextTex('CỔNG CHÍNH ĐÓNG · MỜI ĐI CỔNG PHỤ →', {
            w: 1024,
            h: 190,
            bg: '#6E2219',
            border: '#FFD875',
            color: '#FFF6E5',
            size: 46
          }),
          roughness: 0.4
        })
      );
      closedNotice.position.set(0, 1.98, 0.08);
      g.add(closedNotice);
      this.closedMainGateClickTargets.push(closedNotice);

      // Physical barrier across Cổng Chính (x = 17.2..28.8, z = 40.7..42.3)
      this.addRectObstacle(17.2, 28.8, 40.7, 42.3);
    } else {
      for (let t = 0; t < 2; t++) {
        const w = 7.4 - t * 2.0;
        const roof = makeHippedRoofMesh(w, 2.7 - t * 0.5, 1.3, M.roofTile);
        roof.position.set(0, 7.6 + t * 1.3, 0);
        g.add(roof);
      }
    }
    return g;
  },

  makeMosaicShardTex() {
    // Antique cream lime-stucco inlaid with organic broken-porcelain floral clusters (khảm sành sứ Vĩnh Tràng)
    return makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#E6D6B8';
        g.fillRect(0, 0, w, h);

        // Subtle lime-plaster mottling
        for (let i = 0; i < 42; i++) {
          const mx = ((Math.sin(i * 41.3) * 0.5 + 0.5) * w);
          const my = ((Math.cos(i * 19.7) * 0.5 + 0.5) * h);
          g.fillStyle = i % 2 === 0 ? 'rgba(210,190,152,0.28)' : 'rgba(252,246,232,0.28)';
          g.beginPath();
          g.arc(mx, my, 12 + (i % 16), 0, Math.PI * 2);
          g.fill();
        }

        // Porcelain floral medallions & organic irregular ceramic shards
        const shardColors = ['#2D4C7E', '#3B6E5C', '#9E3E2E', '#D9A441', '#F4EFE4', '#6E91AA'];
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 4; col++) {
            const cx = col * 64 + 32;
            const cy = row * 64 + 32;
            // Thin gold-cream framing line
            g.strokeStyle = 'rgba(175, 138, 72, 0.35)';
            g.lineWidth = 2;
            g.strokeRect(col * 64 + 4, row * 64 + 4, 56, 56);

            // 5-petal porcelain blossom
            const petalColor = shardColors[(row + col) % 3];
            for (let p = 0; p < 5; p++) {
              const ang = (p / 5) * Math.PI * 2 + row * 0.25;
              const px = cx + Math.cos(ang) * 12;
              const py = cy + Math.sin(ang) * 12;
              g.fillStyle = petalColor;
              g.beginPath();
              g.ellipse(px, py, 7.5, 4.5, ang, 0, Math.PI * 2);
              g.fill();
              g.strokeStyle = '#E8DEC8';
              g.lineWidth = 1.2;
              g.stroke();
            }
            // Terracotta / gold pistil center
            g.fillStyle = '#D9A441';
            g.beginPath();
            g.arc(cx, cy, 4.5, 0, Math.PI * 2);
            g.fill();
          }
        }

        // Fine broken-porcelain background scatter
        for (let s = 0; s < 96; s++) {
          const sx = ((Math.sin(s * 17.9 + 1.2) * 0.5 + 0.5) * (w - 14)) + 7;
          const sy = ((Math.cos(s * 31.1 + 0.7) * 0.5 + 0.5) * (h - 14)) + 7;
          const r = 3 + (s % 4);
          g.fillStyle = shardColors[s % shardColors.length];
          g.beginPath();
          g.moveTo(sx - r, sy - r * 0.5);
          g.lineTo(sx + r * 0.8, sy - r);
          g.lineTo(sx + r, sy + r * 0.7);
          g.lineTo(sx - r * 0.6, sy + r * 0.9);
          g.closePath();
          g.fill();
        }
      },
      256,
      256,
      1,
      2
    );
  },

  buildSideMosaicGate() {
    // Authentic porcelain-mosaic Cổng Phụ ("TỊNH ĐỘ HUYỀN MÔN" — image_bb72a8b0.png!)
    // Clear 6.6m wide walkable roadway (x = 37.2..43.8) with gate wings swung wide open
    const M = this.MAT;
    const g = new THREE.Group();
    const mosaicTex = this.makeMosaicShardTex();
    const mosaicMat = new THREE.MeshStandardMaterial({ map: mosaicTex, roughness: 0.36, metalness: 0.12 });

    // Flanking main porcelain-mosaic piers (placed outside walkable 6.4m gap: +-3.8m)
    for (const px of [-3.85, 3.85]) {
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.35, 1.45), M.goldWall);
      base.position.set(px, 0.675, 0);
      base.castShadow = true;
      g.add(base);

      const pier = new THREE.Mesh(new THREE.BoxGeometry(1.28, 6.1, 1.15), M.goldLight);
      pier.position.set(px, 4.35, 0);
      pier.castShadow = true;
      g.add(pier);

      const mosaicStrip = new THREE.Mesh(new THREE.BoxGeometry(0.86, 5.4, 1.2), mosaicMat);
      mosaicStrip.position.set(px, 4.35, 0);
      g.add(mosaicStrip);

      // Ornate curved arch spandrel connecting piers cleanly
      const flankWall = new THREE.Mesh(new THREE.BoxGeometry(1.45, 2.85, 0.55), M.goldWall);
      flankWall.position.set(px + (px < 0 ? -1.3 : 1.3), 1.42, 0);
      g.add(flankWall);
      const flankMosaic = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.8, 0.62), mosaicMat);
      flankMosaic.position.set(px + (px < 0 ? -1.3 : 1.3), 1.75, 0);
      g.add(flankMosaic);
      const lotusCap = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), M.mosaicRed);
      lotusCap.position.set(px + (px < 0 ? -1.95 : 1.95), 3.05, 0);
      g.add(lotusCap);
    }

    // Blue "4 BÁNH" directional plaque on lower-left masonry plinth matching image_bb72a8b0.png!
    const sign4Banh = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.58, 0.1),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('4 BÁNH', { w: 256, h: 160, bg: '#1F3B6E', border: '#E8EDF5', color: '#FFFFFF', size: 54 }),
        roughness: 0.4
      })
    );
    sign4Banh.position.set(-5.08, 0.78, 0.56);
    g.add(sign4Banh);

    // Arch crown & main mosaic transom beam ("TỊNH ĐỘ HUYỀN MÔN")
    const mainBeam = new THREE.Mesh(new THREE.BoxGeometry(8.8, 1.55, 1.25), mosaicMat);
    mainBeam.position.set(0, 6.45, 0);
    mainBeam.castShadow = true;
    g.add(mainBeam);

    const archHeaderTex = makeTextTex('淨 土 玄 門 · TỊNH ĐỘ HUYỀN MÔN', {
      w: 1400,
      h: 210,
      bg: '#214A34',
      border: '#E8C164',
      color: '#FFE496',
      size: 56
    });
    const archHeader = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 0.88, 1.32),
      new THREE.MeshStandardMaterial({ map: archHeaderTex, roughness: 0.34 })
    );
    archHeader.position.set(0, 6.48, 0);
    g.add(archHeader);

    // Upper gallery: Triple-niche standing White Buddha flanked by 2 guardian statues (image_bb72a8b0.png)
    for (const ux of [-3.1, -1.35, 1.35, 3.1]) {
      const uCol = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.1, 0.95), M.goldWall);
      uCol.position.set(ux, 8.75, 0);
      g.add(uCol);
      const uTile = new THREE.Mesh(new THREE.BoxGeometry(0.36, 2.75, 1.0), mosaicMat);
      uTile.position.set(ux, 8.75, 0);
      g.add(uTile);
    }
    const upperLintel = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.65, 1.15), M.goldWall);
    upperLintel.position.set(0, 10.45, 0);
    g.add(upperLintel);

    // Center standing White Buddha
    const bStand = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.62, 0.4, 12), M.statueWhite);
    bStand.position.set(0, 7.42, 0);
    g.add(bStand);
    const bBody = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 1.65, 12), M.statueWhite);
    bBody.position.set(0, 8.42, 0);
    g.add(bBody);
    const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), M.statueWhite);
    bHead.position.set(0, 9.46, 0);
    g.add(bHead);

    // Two flanking guardian statues in side arches
    for (const gx of [-2.22, 2.22]) {
      const gBody = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.35, 10), M.statueWhite);
      gBody.position.set(gx, 8.15, 0);
      g.add(gBody);
      const gHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), M.statueWhite);
      gHead.position.set(gx, 9.0, 0);
      g.add(gHead);
    }

    // Two-tier ornate terracotta pagoda roofs + ceramic ridge dragon finials
    for (let t = 0; t < 2; t++) {
      const rw = 8.9 - t * 2.4;
      const roof = makeHippedRoofMesh(rw, 2.7 - t * 0.5, 1.25, M.roofTile);
      roof.position.set(0, 11.1 + t * 1.25, 0);
      roof.castShadow = true;
      g.add(roof);
    }
    for (const dx of [-2.4, 2.4]) {
      const dragonFinial = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.95, 7), M.mosaicBlue);
      dragonFinial.position.set(dx, 13.1, 0);
      dragonFinial.rotation.z = dx < 0 ? 0.35 : -0.35;
      g.add(dragonFinial);
    }

    // Gold-painted wrought-iron gate wings swung WIDE OPEN inward along inner piers (clear 6.4m driveway!)
    const ironMat = new THREE.MeshStandardMaterial({ color: 0xC6933A, metalness: 0.62, roughness: 0.34 });
    for (const side of [-1, 1]) {
      const wingPivot = new THREE.Group();
      wingPivot.position.set(side * 3.12, 0, -0.2);
      wingPivot.rotation.y = side * 1.44; // Folded cleanly wide open into the temple courtyard
      for (const fy of [0.25, 1.55, 2.95]) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.09, 0.08), ironMat);
        bar.position.set(-side * 1.28, fy, 0);
        wingPivot.add(bar);
      }
      for (let bi = 0; bi < 9; bi++) {
        const bx = -side * (0.15 + bi * 0.28);
        const picket = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 2.8, 6), ironMat);
        picket.position.set(bx, 1.6, 0);
        wingPivot.add(picket);
      }
      g.add(wingPivot);
    }

    // Physical colliders ONLY on the flanking piers (central archway x = 37.3..43.7 is 100% OPEN!)
    this.addRectObstacle(35.8, 37.3, 40.6, 42.4);
    this.addRectObstacle(43.7, 45.2, 40.6, 42.4);
    return g;
  }
};
