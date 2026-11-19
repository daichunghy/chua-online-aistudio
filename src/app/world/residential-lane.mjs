/**
 * Khu dân cư phía Đông chùa: hẻm nhựa, vỉa hè, cột điện, nhà dân + quán Hủ tiếu / Bánh bèo,
 * xe máy, cây vườn. Thay thế các sạp chợ mặt tiền cũ (xem tag archive/vinh-trang-residential-neighborhood).
 * Gọi từ VinhTrang3DWorld: buildResidentialFoodHouses.call(this).
 * Click/Phím E ở quán -> stallType 'local_eatery' -> openLocalEateryModal() trong app.
 */
import * as THREE from 'three';
import { makeHippedRoofMesh, makeTextTex } from './shared.mjs';

export function buildResidentialFoodHouses() {
  const M = this.MAT;
  const pavementMat = new THREE.MeshStandardMaterial({ color: 0xBDB6A8, roughness: 0.9 });
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x8E8A80, roughness: 0.92 });
  const timberMat = new THREE.MeshStandardMaterial({ map: this.woodGrainTex, color: 0x69452D, roughness: 0.78 });
  const darkTimberMat = new THREE.MeshStandardMaterial({ color: 0x3D2A20, roughness: 0.84 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x9DB5B2, roughness: 0.2, metalness: 0.12 });
  const shutterMat = new THREE.MeshStandardMaterial({ color: 0x3E6A50, roughness: 0.76 });
  const bowlMat = new THREE.MeshStandardMaterial({ color: 0xE9E1D0, roughness: 0.36 });
  const foodMat = new THREE.MeshStandardMaterial({ color: 0xD8B96F, roughness: 0.72 });

  // Family eateries now sit directly along the East sidewalk (x = 47.6..51.6) of the straight approach road
  // leading into Cổng Phụ Chùa Vĩnh Tràng — no detached separate rural lane needed!

  const addPotPlant = (parent, x, z, flowerColor = 0xE783A8) => {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.48, 12), M.terracottaPot);
    pot.position.set(x, 0.24, z);
    parent.add(pot);
    const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.035, 10), darkTimberMat);
    soil.position.set(x, 0.49, z);
    parent.add(soil);
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 8, 7),
        i % 2 === 0 ? M.foliageLight : M.foliageMid
      );
      leaf.scale.set(0.72, 0.42, 1.35);
      leaf.position.set(x + Math.cos(angle) * 0.2, 0.82 + (i % 2) * 0.12, z + Math.sin(angle) * 0.2);
      parent.add(leaf);
    }
    const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 7), new THREE.MeshStandardMaterial({ color: flowerColor, roughness: 0.55 }));
    bloom.position.set(x + 0.05, 1.0, z);
    parent.add(bloom);
  };

  const buildDiningTable = (parent, tx, tz, tableColor = 0x785236) => {
    const tableMat = new THREE.MeshStandardMaterial({ color: tableColor, map: this.woodGrainTex, roughness: 0.76 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.12, 0.95), tableMat);
    top.position.set(tx, 0.9, tz);
    top.castShadow = true;
    parent.add(top);
    for (const dx of [-0.66, 0.66]) {
      for (const dz of [-0.36, 0.36]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.82, 0.09), tableMat);
        leg.position.set(tx + dx, 0.45, tz + dz);
        parent.add(leg);
      }
    }
    for (const dx of [-1.05, 1.05]) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.86), timberMat);
      bench.position.set(tx + dx, 0.35, tz);
      parent.add(bench);
      const benchLegA = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.32, 0.07), timberMat);
      benchLegA.position.set(tx + dx, 0.16, tz - 0.3);
      parent.add(benchLegA);
      const benchLegB = benchLegA.clone();
      benchLegB.position.z = tz + 0.3;
      parent.add(benchLegB);
    }
  };

  const addBowl = (parent, x, y, z, foodColor = 0xD7BD7B) => {
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.11, 14), bowlMat);
    bowl.position.set(x, y, z);
    parent.add(bowl);
    const food = new THREE.Mesh(new THREE.CircleGeometry(0.16, 12), new THREE.MeshStandardMaterial({ color: foodColor, roughness: 0.82 }));
    food.rotation.x = -Math.PI / 2;
    food.position.set(x, y + 0.062, z);
    parent.add(food);
    for (let i = 0; i < 3; i++) {
      const herb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), M.foliageLight);
      herb.position.set(x - 0.06 + i * 0.06, y + 0.09, z + (i % 2) * 0.05);
      parent.add(herb);
    }
  };

  const buildFamilyEatery = (id, title, x, z, variant = 'hut_tieu') => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = -Math.PI / 2;
    g.userData.stallType = 'local_eatery';
    g.userData.stallTitle = title;
    g.userData.eateryId = id;
    g.userData.localEateryId = id;

    const wallColor = variant === 'hut_tieu' ? 0xE9DFC9 : 0xE6E7D7;
    const wallMat = new THREE.MeshStandardMaterial({ map: this.limeWallTex, color: wallColor, roughness: 0.88 });
    const floorMat = new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xD9D0C0, roughness: 0.88 });
    const roofMat = new THREE.MeshStandardMaterial({ map: this.tinRoofTex, color: variant === 'hut_tieu' ? 0x8C4435 : 0x426B5A, roughness: 0.72, metalness: 0.08 });
    const trimMat = new THREE.MeshStandardMaterial({ color: variant === 'hut_tieu' ? 0xB88D5C : 0xB5A27E, roughness: 0.8 });

    const floor = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.18, 10.8), floorMat);
    floor.position.set(0, 0.09, 0.25);
    floor.receiveShadow = true;
    g.add(floor);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(9.6, 3.3, 0.24), wallMat);
    backWall.position.set(0, 1.76, -4.7);
    backWall.castShadow = true;
    g.add(backWall);

    for (const sx of [-4.7, 4.7]) {
      const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.3, 9.4), wallMat);
      sideWall.position.set(sx, 1.76, 0);
      sideWall.castShadow = true;
      g.add(sideWall);
    }

    // The front remains open like a family dining room; there is no market counter or street-facing stall.
    for (const sx of [-4.05, 4.05]) {
      const frontPier = new THREE.Mesh(new THREE.BoxGeometry(1.3, 3.25, 0.28), trimMat);
      frontPier.position.set(sx, 1.72, 4.62);
      g.add(frontPier);
    }
    for (const sx of [-4.55, 0, 4.55]) {
      const column = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.05, 0.2), timberMat);
      column.position.set(sx, 1.55, 5.25);
      g.add(column);
    }

    const roof = makeHippedRoofMesh(11.1, 12.0, 1.8, roofMat);
    roof.position.set(0, 4.0, 0.15);
    roof.castShadow = true;
    g.add(roof);
    const eaveBeam = new THREE.Mesh(new THREE.BoxGeometry(10.3, 0.16, 0.18), timberMat);
    eaveBeam.position.set(0, 3.12, 4.72);
    g.add(eaveBeam);
    const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.12, 2.55), roofMat);
    porchRoof.position.set(0, 3.0, 5.75);
    porchRoof.rotation.x = 0.08;
    porchRoof.castShadow = true;
    g.add(porchRoof);

    // Open wooden double doors and modest front windows.
    for (const sx of [-1.05, 1.05]) {
      const door = new THREE.Mesh(new THREE.BoxGeometry(1.85, 2.3, 0.12), timberMat);
      door.position.set(sx, 1.22, 4.55);
      door.rotation.y = sx < 0 ? -0.18 : 0.18;
      g.add(door);
    }
    for (const sx of [-3.75, 3.75]) {
      const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.3, 0.16), darkTimberMat);
      windowFrame.position.set(sx, 1.9, 4.7);
      g.add(windowFrame);
      const windowGlass = new THREE.Mesh(new THREE.BoxGeometry(1.38, 1.04, 0.08), glassMat);
      windowGlass.position.set(sx, 1.92, 4.79);
      g.add(windowGlass);
      for (const side of [-1, 1]) {
        const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.18, 0.12), shutterMat);
        shutter.position.set(sx + side * 0.82, 1.9, 4.76);
        g.add(shutter);
      }
    }

    // A small hand-painted wooden name board, attached to the house rather than a freestanding stall.
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(3.55, 0.56, 0.12),
      new THREE.MeshStandardMaterial({
        map: makeTextTex(variant === 'hut_tieu' ? 'HỦ TIẾU MỸ THO' : 'BÁNH BÈO · CHÈ NHÀ',
          { w: 900, h: 150, bg: '#60452E', border: '#C9AD7A', color: '#F4E6C7', size: 48 }),
        roughness: 0.78
      })
    );
    sign.position.set(0, 3.05, 6.55);
    g.add(sign);

    const kitchenCounter = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.86, 0.85), timberMat);
    kitchenCounter.position.set(0, 0.58, -3.45);
    g.add(kitchenCounter);
    const kitchenBack = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.15, 0.12), wallMat);
    kitchenBack.position.set(0, 1.48, -4.12);
    g.add(kitchenBack);

    // A compact family kitchen visible through the open front.
    const stove = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.56, 0.8), darkTimberMat);
    stove.position.set(2.75, 0.42, -3.25);
    g.add(stove);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.29, 0.42, 12), new THREE.MeshStandardMaterial({ color: 0x8E9897, metalness: 0.52, roughness: 0.42 }));
    pot.position.set(2.75, 0.92, -3.25);
    g.add(pot);
    const potLid = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.045, 12), curbMat);
    potLid.position.set(2.75, 1.15, -3.25);
    g.add(potLid);

    buildDiningTable(g, -2.05, 0.6, variant === 'hut_tieu' ? 0x765037 : 0x73573A);
    buildDiningTable(g, 2.05, 0.6, variant === 'hut_tieu' ? 0x765037 : 0x73573A);
    if (variant === 'hut_tieu') {
      addBowl(g, -2.05, 1.02, 0.6, 0xD7B66C);
      addBowl(g, 2.05, 1.02, 0.6, 0xD7B66C);
    } else {
      for (const [bx, bz] of [[-2.25, 0.55], [-1.85, 0.55], [1.85, 0.55], [2.25, 0.55]]) {
        const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.06, 12), bowlMat);
        tray.position.set(bx, 1.0, bz);
        g.add(tray);
        const cake = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.08, 10), foodMat);
        cake.position.set(bx, 1.07, bz);
        g.add(cake);
      }
    }

    const ceilingLamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 7), new THREE.MeshBasicMaterial({ color: 0xFFE2A8 }));
    ceilingLamp.position.set(0, 2.75, 0.1);
    g.add(ceilingLamp);
    const warmLight = new THREE.PointLight(0xFFD99B, 0.48, 13);
    warmLight.position.set(0, 2.55, -0.2);
    g.add(warmLight);

    addPotPlant(g, -4.1, 5.9, 0xE985A7);
    addPotPlant(g, 4.1, 5.9, 0xE8B36F);
    const waterJar = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10), M.terracottaPot);
    waterJar.scale.set(0.95, 1.15, 0.95);
    waterJar.position.set(-4.2, 0.43, 4.55);
    g.add(waterJar);

    this.exteriorGroup.add(g);
    this.stallClickTargets.push(g);
    this.stallTriggers.push({
      x: x - 5.6,
      z,
      radius: 5.6,
      stallType: 'local_eatery',
      eateryId: id,
      title
    });

    // Axis-aligned collision around the side and back walls; the wide front doorway stays walkable.
    this.addRectObstacle(x + 4.45, x + 4.95, z - 4.7, z + 4.7);
    this.addRectObstacle(x - 4.85, x + 4.45, z - 4.95, z - 4.45);
    this.addRectObstacle(x - 4.85, x + 4.45, z + 4.45, z + 4.95);
    this.addRectObstacle(x - 4.95, x - 4.45, z - 4.7, z - 2.85);
    this.addRectObstacle(x - 4.95, x - 4.45, z + 2.85, z + 4.7);

    // A short concrete apron links the house veranda to the footpath.
    const apron = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.08, 5.6), pavementMat);
    apron.position.set(x - 6.05, 0.035, z);
    apron.receiveShadow = true;
    this.exteriorGroup.add(apron);
  };

  buildFamilyEatery('hut_tieu_co_ba', 'Nhà Cô Ba · Hủ tiếu Mỹ Tho', 58.2, 75.0, 'hut_tieu');
  buildFamilyEatery('banh_beo_di_sau', 'Bếp Dì Sáu · Bánh bèo & chè', 58.2, 89.0, 'banh_beo');

  // Two parked neighbor motorbikes neatly on the East eatery veranda edge
  const addNeighbourMotorbike = (mx, mz, color) => {
    const bike = new THREE.Group();
    const rubber = new THREE.MeshStandardMaterial({ color: 0x202225, roughness: 0.88 });
    const paint = new THREE.MeshStandardMaterial({ color, roughness: 0.42, metalness: 0.12 });
    for (const wz of [-0.58, 0.58]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.1, 12), rubber);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(0, 0.24, wz);
      bike.add(wheel);
    }
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.92), paint);
    body.position.set(0, 0.55, 0);
    bike.add(body);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.13, 0.58), darkTimberMat);
    seat.position.set(0, 0.82, -0.1);
    bike.add(seat);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.08), curbMat);
    handle.position.set(0, 1.0, 0.43);
    bike.add(handle);
    bike.position.set(mx, 0, mz);
    bike.rotation.y = Math.PI / 2;
    this.exteriorGroup.add(bike);
  };
  addNeighbourMotorbike(51.2, 70.6, 0x8D2D27);
  addNeighbourMotorbike(51.2, 84.5, 0x345C83);
}
