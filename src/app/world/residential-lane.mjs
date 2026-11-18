/**
 * Khu dân cư phía Đông chùa: hẻm nhựa, vỉa hè, cột điện, nhà dân + quán Hủ tiếu / Bánh bèo,
 * xe máy, cây vườn. Thay thế các sạp chợ mặt tiền cũ (xem tag archive/vinh-trang-residential-neighborhood).
 * Gọi từ VinhTrang3DWorld: buildResidentialFoodHouses.call(this).
 * Click/Phím E ở quán -> stallType 'local_eatery' -> openLocalEateryModal() trong app.
 */
import * as THREE from 'three';

export function buildResidentialFoodHouses() {
  const M = this.MAT;
  const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x5B5C57, roughness: 0.96 });
  const pavementMat = new THREE.MeshStandardMaterial({ color: 0xBDB6A8, roughness: 0.9 });
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x8E8A80, roughness: 0.92 });
  const drainMat = new THREE.MeshStandardMaterial({ color: 0x4B514A, roughness: 0.98 });
  const timberMat = new THREE.MeshStandardMaterial({ map: this.woodGrainTex, color: 0x69452D, roughness: 0.78 });
  const darkTimberMat = new THREE.MeshStandardMaterial({ color: 0x3D2A20, roughness: 0.84 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x9DB5B2, roughness: 0.2, metalness: 0.12 });
  const shutterMat = new THREE.MeshStandardMaterial({ color: 0x3E6A50, roughness: 0.76 });
  const bowlMat = new THREE.MeshStandardMaterial({ color: 0xE9E1D0, roughness: 0.36 });
  const foodMat = new THREE.MeshStandardMaterial({ color: 0xD8B96F, roughness: 0.72 });

  // A narrow neighbourhood lane branches from the Nguyễn Trung Trực approach.
  // It is intentionally modest: patched asphalt, shallow drains, concrete footpath and overhead wires.
  const junction = new THREE.Mesh(new THREE.BoxGeometry(19, 0.12, 8.4), asphaltMat);
  junction.position.set(73.5, 0.015, 50.4);
  junction.receiveShadow = true;
  this.exteriorGroup.add(junction);

  const lane = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.12, 62), asphaltMat);
  lane.position.set(77.5, 0.02, 81);
  lane.receiveShadow = true;
  this.exteriorGroup.add(lane);

  const westCurb = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 62), curbMat);
  westCurb.position.set(73.75, 0.08, 81);
  this.exteriorGroup.add(westCurb);
  const eastCurb = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 62), curbMat);
  eastCurb.position.set(81.25, 0.08, 81);
  this.exteriorGroup.add(eastCurb);

  const footpath = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 62), pavementMat);
  footpath.position.set(82.7, 0.04, 81);
  footpath.receiveShadow = true;
  this.exteriorGroup.add(footpath);

  const drain = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 61.5), drainMat);
  drain.position.set(72.95, 0.03, 81);
  this.exteriorGroup.add(drain);
  for (let z = 53; z <= 109; z += 2.4) {
    const grate = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 0.08), curbMat);
    grate.position.set(72.95, 0.14, z);
    this.exteriorGroup.add(grate);
  }

  // Faded edge marks, not a modern multilane road.
  const edgeMarkMat = new THREE.MeshBasicMaterial({ color: 0xC8C3B7, transparent: true, opacity: 0.48 });
  for (const x of [74.0, 81.0]) {
    const mark = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.015, 60), edgeMarkMat);
    mark.position.set(x, 0.09, 81);
    this.exteriorGroup.add(mark);
  }

  // Three weathered utility poles and loose overhead service wires.
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x817C70, roughness: 0.88 });
  const wireMat = new THREE.LineBasicMaterial({ color: 0x303538, transparent: true, opacity: 0.62 });
  const poleZs = [57, 78, 99];
  for (const pz of poleZs) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.17, 7.6, 8), poleMat);
    pole.position.set(72.25, 3.8, pz);
    pole.castShadow = true;
    this.exteriorGroup.add(pole);
    const crossbar = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.12, 0.14), poleMat);
    crossbar.position.set(72.25, 7.25, pz);
    this.exteriorGroup.add(crossbar);
  }
  for (let i = 0; i < poleZs.length - 1; i++) {
    const z1 = poleZs[i];
    const z2 = poleZs[i + 1];
    for (const x of [71.85, 72.25, 72.65]) {
      const pts = [
        new THREE.Vector3(x, 7.25, z1),
        new THREE.Vector3(x + 0.08, 6.72, (z1 + z2) * 0.5),
        new THREE.Vector3(x, 7.25, z2)
      ];
      this.exteriorGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wireMat));
    }
  }

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

  buildFamilyEatery('hut_tieu_co_ba', 'Nhà Cô Ba · Hủ tiếu Mỹ Tho', 91, 60, 'hut_tieu');
  buildFamilyEatery('banh_beo_di_sau', 'Bếp Dì Sáu · Bánh bèo & chè', 91, 80, 'banh_beo');

  // An ordinary family home completes the short lane: closed timber doors, a tiny garden and a clothesline.
  const home = new THREE.Group();
  home.position.set(91, 0, 100);
  home.rotation.y = -Math.PI / 2;
  const homeWall = new THREE.MeshStandardMaterial({ map: this.limeWallTex, color: 0xE6E1D2, roughness: 0.9 });
  const homeRoofMat = new THREE.MeshStandardMaterial({ map: this.tinRoofTex, color: 0x536F78, roughness: 0.76, metalness: 0.1 });
  const homeFloor = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.18, 10.4), pavementMat);
  homeFloor.position.set(0, 0.09, 0.2);
  home.add(homeFloor);
  const homeBody = new THREE.Mesh(new THREE.BoxGeometry(9.2, 3.25, 8.8), homeWall);
  homeBody.position.set(0, 1.72, -0.1);
  home.add(homeBody);
  const homeRoof = makeHippedRoofMesh(10.8, 11.3, 1.7, homeRoofMat);
  homeRoof.position.set(0, 3.95, 0);
  home.add(homeRoof);
  const homePorch = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.12, 2.3), homeRoofMat);
  homePorch.position.set(0, 3.0, 5.15);
  homePorch.rotation.x = 0.08;
  home.add(homePorch);
  for (const sx of [-4.2, 0, 4.2]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.8, 0.18), timberMat);
    post.position.set(sx, 1.45, 5.7);
    home.add(post);
  }
  const frontDoor = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.2, 0.12), timberMat);
  frontDoor.position.set(0, 1.2, 4.35);
  home.add(frontDoor);
  for (const sx of [-3.0, 3.0]) {
    const window = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.15, 0.12), glassMat);
    window.position.set(sx, 1.85, 4.4);
    home.add(window);
    const shutter = new THREE.Mesh(new THREE.BoxGeometry(1.48, 1.28, 0.12), shutterMat);
    shutter.position.set(sx, 1.85, 4.48);
    home.add(shutter);
  }
  addPotPlant(home, -4.1, 5.9, 0xE58D9C);
  addPotPlant(home, 4.1, 5.9, 0xD7A75D);
  const clothesPoleA = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 2.8, 7), timberMat);
  clothesPoleA.position.set(-5.4, 1.4, -1.8);
  home.add(clothesPoleA);
  const clothesPoleB = clothesPoleA.clone();
  clothesPoleB.position.x = 5.4;
  home.add(clothesPoleB);
  const clothesLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-5.4, 2.65, -1.8), new THREE.Vector3(5.4, 2.65, -1.8)]),
    new THREE.LineBasicMaterial({ color: 0x6D6A61 })
  );
  home.add(clothesLine);
  for (let i = 0; i < 4; i++) {
    const cloth = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.75, 0.05),
      new THREE.MeshStandardMaterial({ color: [0xE6D8C1, 0xA7C3B4, 0xD9A0A1, 0xE6C76C][i], roughness: 0.86, side: THREE.DoubleSide })
    );
    cloth.position.set(-3.2 + i * 1.9, 2.05, -1.8);
    home.add(cloth);
  }
  this.exteriorGroup.add(home);
  this.addRectObstacle(95.45, 95.95, 95.4, 104.6);
  this.addRectObstacle(86.05, 95.45, 95.0, 95.5);
  this.addRectObstacle(86.05, 95.45, 104.5, 105.0);

  // Two parked motorbikes and a few household objects make the lane feel lived-in, not commercial.
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
  addNeighbourMotorbike(84.4, 64.2, 0x8D2D27);
  addNeighbourMotorbike(84.4, 84.1, 0x345C83);

  // Low garden tree and banana clump soften the edge of the residential lane.
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.25, 3.2, 8), M.trunk);
  trunk.position.y = 1.6;
  tree.add(trunk);
  for (let i = 0; i < 7; i++) {
    const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.45, 1), i % 2 ? M.foliageLight : M.foliageMid);
    crown.scale.set(1.15, 0.72, 1.1);
    crown.position.set(Math.cos(i * 0.9) * 0.72, 3.15 + (i % 3) * 0.25, Math.sin(i * 0.9) * 0.72);
    tree.add(crown);
  }
  tree.position.set(84.2, 0, 94.0);
  this.exteriorGroup.add(tree);
}
