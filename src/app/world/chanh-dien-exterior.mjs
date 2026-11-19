/**
 * Mặt tiền Chánh điện 13 vòm.
 *
 * Mixin của VinhTrang3DWorld: 1 method (buildChanhDien13Arches … buildChanhDien13Arches).
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, makeTextTex, makeHippedRoofMesh } from './shared.mjs';

export const chanhDienExteriorMethods = {
  buildChanhDien13Arches() {
    const M = this.MAT;
    const g = new THREE.Group();
    const ironwork = new THREE.MeshStandardMaterial({ color: 0x28231F, metalness: 0.68, roughness: 0.4 });
    const W = 26.9;
    const D = 14.3;

    const plinth = new THREE.Mesh(new THREE.BoxGeometry(W + 1.2, 1.25, D + 1.6), M.stoneLight);
    plinth.position.set(0, 0.625, 0);
    plinth.receiveShadow = true;
    plinth.castShadow = true;

    const shell = new THREE.Group();
    this.chanhDienProceduralShell = shell;
    this.chanhDienFacadeGroup = g;
    g.add(shell);
    shell.add(plinth);

    // Broad central stone staircase, matching the real front approach visible in site photographs.
    const stairWidth = 8.6;
    const stairRun = 0.48;
    const stairRise = 0.18;
    for (let s = 0; s < 7; s++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(stairWidth, stairRise, stairRun),
        s % 2 === 0 ? M.stoneLight : M.creamTrim
      );
      step.position.set(0, stairRise * (s + 0.5), D / 2 + 4.05 - s * stairRun);
      step.receiveShadow = true;
      step.castShadow = true;
      shell.add(step);
    }
    for (const side of [-1, 1]) {
      const railX = side * 4.62;
      const railBase = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.9, 3.55), M.creamTrim);
      railBase.position.set(railX, 0.88, D / 2 + 2.65);
      shell.add(railBase);
      for (let i = 0; i < 6; i++) {
        const baluster = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.72, 8), M.creamTrim);
        baluster.position.set(railX, 0.92, D / 2 + 4.05 - i * 0.56);
        shell.add(baluster);
      }
      const handrail = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 3.8), M.goldAccent);
      handrail.position.set(railX, 1.42, D / 2 + 2.65);
      shell.add(handrail);
      for (const endZ of [D / 2 + 0.8, D / 2 + 4.5]) {
        const finial = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), M.goldAccent);
        finial.position.set(railX, 1.55, endZ);
        shell.add(finial);
      }
    }

    // Inviting Front Main Entrance Welcome Mat, Subtle Amber Glow & Direct Click Target ("Cửa Trước Chánh Điện")
    this.frontDoorClickTargets = this.frontDoorClickTargets || [];
    const frontCarpet = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 3.6),
      new THREE.MeshStandardMaterial({ color: 0x8F1D18, roughness: 0.86 })
    );
    frontCarpet.rotation.x = -Math.PI / 2 - 0.34;
    frontCarpet.position.set(0, 0.72, D / 2 + 2.65);
    g.add(frontCarpet);

    const frontDoorGlow = new THREE.PointLight(0xFFD07A, 1.8, 8.5);
    frontDoorGlow.position.set(0, 3.2, D / 2 + 1.6);
    g.add(frontDoorGlow);

    const frontDoorHit = new THREE.Mesh(
      new THREE.BoxGeometry(8.2, 4.4, 4.2),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    frontDoorHit.position.set(0, 2.3, D / 2 + 2.2);
    frontDoorHit.userData.doorSide = 'front_tam_quan';
    g.add(frontDoorHit);
    this.frontDoorClickTargets.push(frontDoorHit);

    // END-OF-ROAD LEFT-TURN COVERED SHOE-REMOVAL VERANDA & CARVED WOODEN ENTRANCE DOOR INTO CHÁNH ĐIỆN
    // Mounted on `g` (world origin (23, 0, 1)) at local (12.2, 0, -15.5) => world (35.2, 0, -14.5),
    // facing East (+X) directly onto the cool tree-shaded end-of-road souvenir plaza ("đi xuống cuối đường rồi rẽ vào, bỏ dép bên ngoài mới vào chánh điện")!
    const rightCornerGate = new THREE.Group();
    rightCornerGate.position.set(12.2, 0, -15.5);
    rightCornerGate.rotation.y = Math.PI * 0.5; // Local +Z faces East (+X) toward the straight shaded lane x = 40.5!

    const rcWingBody = new THREE.Mesh(new THREE.BoxGeometry(8.6, 5.2, 2.6), M.goldWall);
    rcWingBody.position.set(0, 2.6, -1.1);
    rcWingBody.castShadow = true;
    rcWingBody.receiveShadow = true;
    rightCornerGate.add(rcWingBody);
    const rcWingCornice = new THREE.Mesh(new THREE.BoxGeometry(8.9, 0.28, 2.8), M.creamTrim);
    rcWingCornice.position.set(0, 5.25, -1.1);
    rightCornerGate.add(rcWingCornice);

    // Wide terracotta-tiled Shoe-Removal Veranda ("Hiên Để Giày Dép Bên Ngoài Trước Cửa Chánh Điện")
    const rcStep = new THREE.Mesh(
      new THREE.BoxGeometry(9.2, 0.16, 4.2),
      new THREE.MeshStandardMaterial({ color: 0xC8734F, roughness: 0.65 })
    );
    rcStep.position.set(0, 0.08, 1.85);
    rcStep.receiveShadow = true;
    rightCornerGate.add(rcStep);

    for (const px of [-3.55, 3.55]) {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(0.54, 4.1, 0.58), M.goldWall);
      pier.position.set(px, 2.05, 0.25);
      pier.castShadow = true;
      rightCornerGate.add(pier);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 3.65, 12), M.redColumn);
      col.position.set(px, 1.95, 3.25);
      rightCornerGate.add(col);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.18, 0.48), M.goldAccent);
      cap.position.set(px, 3.82, 3.25);
      rightCornerGate.add(cap);
    }

    // Framed Double-Leaf Carved Wooden Temple Doors ("Cửa Gỗ Bức Bàn Mở Cánh") + Wooden Threshold Sill
    const doorWoodMat = new THREE.MeshStandardMaterial({
      color: 0x7A421E,
      emissive: 0x1E0D04,
      map: this.woodGrainTex,
      roughness: 0.48
    });
    const doorCarvedMat = new THREE.MeshStandardMaterial({
      color: 0x9C582B,
      emissive: 0x241005,
      roughness: 0.44
    });
    const doorSill = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.14, 0.28), doorWoodMat);
    doorSill.position.set(0, 0.23, 0.24);
    rightCornerGate.add(doorSill);
    const doorFrameTop = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.34, 0.34), doorWoodMat);
    doorFrameTop.position.set(0, 3.68, 0.24);
    rightCornerGate.add(doorFrameTop);

    for (const side of [-1, 1]) {
      const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.55, 0.32), doorWoodMat);
      jamb.position.set(side * 1.62, 1.9, 0.24);
      rightCornerGate.add(jamb);

      // Open double wooden door leaves ("thượng song hạ bản" — solid carved bottom + lattice top)
      const leafPiv = new THREE.Group();
      leafPiv.position.set(side * 1.48, 0.24, 0.32);
      leafPiv.rotation.y = side * 1.12;
      const lowerLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.38, 1.45, 0.08), doorWoodMat);
      lowerLeaf.position.set(-side * 0.69, 0.72, 0);
      leafPiv.add(lowerLeaf);
      const lowerInset = new THREE.Mesh(new THREE.BoxGeometry(1.06, 1.05, 0.1), doorCarvedMat);
      lowerInset.position.set(-side * 0.69, 0.72, 0);
      leafPiv.add(lowerInset);
      const topLeafRail = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.2, 0.08), doorWoodMat);
      topLeafRail.position.set(-side * 0.69, 3.15, 0);
      leafPiv.add(topLeafRail);
      for (const edge of [-1, 1]) {
        const stile = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.85, 0.08), doorWoodMat);
        stile.position.set(-side * 0.69 + edge * 0.63, 2.32, 0);
        leafPiv.add(stile);
      }
      for (let sb = -2; sb <= 2; sb++) {
        const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.62, 8), M.goldAccent);
        spindle.position.set(-side * 0.69 + sb * 0.22, 2.32, 0);
        leafPiv.add(spindle);
      }
      rightCornerGate.add(leafPiv);
    }

    // Warm amber-lit temple interior vestibule portal right inside the open wooden doors
    const rcInnerVestibule = new THREE.Mesh(
      new THREE.BoxGeometry(3.02, 3.36, 0.28),
      new THREE.MeshStandardMaterial({
        color: 0x2B1509,
        emissive: 0x3A1B08,
        roughness: 0.78
      })
    );
    rcInnerVestibule.position.set(0, 1.9, 0.22);
    rightCornerGate.add(rcInnerVestibule);
    const rcInnerCarpet = new THREE.Mesh(
      new THREE.PlaneGeometry(1.55, 0.95),
      new THREE.MeshStandardMaterial({ color: 0x8F1D18, roughness: 0.85 })
    );
    rcInnerCarpet.rotation.x = -Math.PI / 2;
    rcInnerCarpet.position.set(0, 0.168, 0.62);
    rightCornerGate.add(rcInnerCarpet);

    // 2 Multi-Tier Wooden Shoe Racks + Coir Mat + Neat Pairs of Sandals/Slippers OUTSIDE on Veranda!
    const sandalPalette = [0xC84B31, 0x295F8A, 0xD9A441, 0x3D6E52, 0xE6DAC3, 0x7A3E2E];
    const coirMat = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.025, 0.85),
      new THREE.MeshStandardMaterial({ color: 0x9E7543, roughness: 0.92 })
    );
    coirMat.position.set(0, 0.175, 1.18);
    rightCornerGate.add(coirMat);

    for (const rx of [-3.05, 3.05]) {
      const rack = new THREE.Group();
      rack.position.set(rx, 0.16, 1.55);
      rack.rotation.y = rx < 0 ? 0.18 : -0.18;
      for (const lx of [-0.68, 0.68]) {
        for (const lz of [-0.18, 0.18]) {
          const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.78, 0.05), doorWoodMat);
          rLeg.position.set(lx, 0.39, lz);
          rack.add(rLeg);
        }
      }
      for (let tier = 0; tier < 3; tier++) {
        const ty = 0.14 + tier * 0.24;
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.03, 0.4), doorWoodMat);
        shelf.position.set(0, ty, 0);
        rack.add(shelf);
        for (let p = 0; p < 4; p++) {
          const sx = -0.48 + p * 0.32;
          const sMat = new THREE.MeshStandardMaterial({
            color: sandalPalette[(tier * 4 + p + (rx > 0 ? 2 : 0)) % sandalPalette.length],
            roughness: 0.65
          });
          for (const f of [-0.052, 0.052]) {
            const sole = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.024, 0.21), sMat);
            sole.position.set(sx + f, ty + 0.026, 0);
            rack.add(sole);
          }
        }
      }
      rightCornerGate.add(rack);
    }

    // Two courtyard stone-and-timber benches flanking the widened veranda edge for resting & changing shoes
    for (const bx of [-4.05, 4.05]) {
      const bench = new THREE.Group();
      bench.position.set(bx, 0, 4.35);
      for (const lx of [-0.72, 0.72]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.48), M.creamTrim);
        leg.position.set(lx, 0.22, 0);
        bench.add(leg);
      }
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.09, 0.52), doorWoodMat);
      seat.position.set(0, 0.46, 0);
      seat.castShadow = true;
      bench.add(seat);
      const backRest = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.38, 0.08), doorCarvedMat);
      backRest.position.set(0, 0.72, -0.22);
      backRest.rotation.x = -0.1;
      bench.add(backRest);
      rightCornerGate.add(bench);
    }

    const rcCanopyRoof = makeHippedRoofMesh(9.8, 6.2, 1.45, M.roofTile);
    rcCanopyRoof.position.set(0, 4.72, 1.05);
    rightCornerGate.add(rcCanopyRoof);

    const rcSign = new THREE.Mesh(
      new THREE.BoxGeometry(6.0, 0.72, 0.12),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('CỬA VÀO CHÁNH ĐIỆN · VUI LÒNG BỎ GIÀY DÉP BÊN NGOÀI', {
          w: 1280,
          h: 180,
          bg: '#4A150D',
          border: '#E5B23D',
          color: '#FFE594',
          size: 38
        }),
        roughness: 0.35
      })
    );
    rcSign.position.set(0, 3.56, 3.48);
    rightCornerGate.add(rcSign);

    const rcGlow = new THREE.PointLight(0xFFC96B, 2.2, 9.5);
    rcGlow.position.set(0, 3.3, 2.1);
    rightCornerGate.add(rcGlow);

    const rcHit = new THREE.Mesh(
      new THREE.BoxGeometry(8.4, 4.4, 4.0),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    rcHit.position.set(0, 2.2, 1.6);
    rcHit.userData.doorSide = 'right';
    rightCornerGate.add(rcHit);
    g.add(rightCornerGate);
    this.sideDoorClickTargets.push(rcHit);

    // Decorative front terrace staircases (closed wooden doors — entry is strictly via Bottom-Right Corner Gate!)
    for (const sx of [-7.2, 7.2]) {
      for (let s = 0; s < 5; s++) {
        const step = new THREE.Mesh(
          new THREE.BoxGeometry(3.2, 0.25, 0.52),
          s % 2 === 0 ? M.stoneLight : M.stoneDark
        );
        step.position.set(sx, 0.125 + s * 0.25, D / 2 + 0.8 + (4 - s) * 0.45);
        step.receiveShadow = true;
        shell.add(step);
      }
      for (const rx of [sx - 1.7, sx + 1.7]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.35, 2.4), M.goldWall);
        rail.position.set(rx, 0.8, D / 2 + 1.55);
        shell.add(rail);
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), M.goldAccent);
        ball.position.set(rx, 1.62, D / 2 + 2.65);
        shell.add(ball);
      }
      const sideDoor = new THREE.Mesh(new THREE.BoxGeometry(1.55, 2.75, 0.09), M.darkWood);
      sideDoor.position.set(sx, 2.72, D / 2 + 0.22);
      shell.add(sideDoor);
    }

    const bodyH = 6.2;
    const body = new THREE.Mesh(new THREE.BoxGeometry(W, bodyH, D), M.goldWall);
    body.position.set(0, 1.25 + bodyH / 2, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    shell.add(body);

    const upperCream = new THREE.Mesh(new THREE.BoxGeometry(W + 0.25, 1.65, 0.85), M.creamTrim);
    upperCream.position.set(0, 1.25 + bodyH - 0.82, D / 2 - 0.1);
    shell.add(upperCream);

    const fz = D / 2 + 0.35;
    const colXs = [-13.0, -11.0, -9.0, -7.0, -5.0, -3.2, -1.65, 1.65, 3.2, 5.0, 7.0, 9.0, 11.0, 13.0];
    for (let i = 0; i < colXs.length; i++) {
      const x = colXs[i];
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.24, 4.3, 18), M.redColumn);
      col.position.set(x, 3.4, fz);
      col.castShadow = true;
      shell.add(col);
      const baseLower = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.2, 0.72), M.creamTrim);
      baseLower.position.set(x, 1.38, fz);
      shell.add(baseLower);
      const baseUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.34, 0.16, 16), M.goldAccent);
      baseUpper.position.set(x, 1.56, fz);
      shell.add(baseUpper);
      const baseCap = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.12, 0.56), M.goldLight);
      baseCap.position.set(x, 1.7, fz);
      shell.add(baseCap);
      const capital = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.25, 0.24, 16), M.goldAccent);
      capital.position.set(x, 5.58, fz);
      shell.add(capital);
      const capitalTop = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.16, 0.72), M.creamTrim);
      capitalTop.position.set(x, 5.78, fz);
      shell.add(capitalTop);
      const capitalAbacus = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.12, 0.84), M.goldAccent);
      capitalAbacus.position.set(x, 5.92, fz);
      shell.add(capitalAbacus);
      for (let flute = -1; flute <= 1; flute++) {
        const groove = new THREE.Mesh(new THREE.BoxGeometry(0.025, 3.35, 0.025), M.goldLight);
        groove.position.set(x + flute * 0.075, 3.4, fz + 0.225);
        shell.add(groove);
      }
      const pil = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.35, 0.3), M.goldLight);
      pil.position.set(x, 6.62, fz - 0.12);
      shell.add(pil);

      if (i < colXs.length - 1) {
        const nextX = colXs[i + 1];
        const span = nextX - x;
        const cx = (x + nextX) / 2;
        const openingW = Math.max(0.95, span - 0.42);
        const openingR = openingW * 0.5;
        const openingBase = 2.05;
        const springY = 2.42;
        const isSideDoor = Math.abs(Math.abs(cx) - 8.0) < 0.35;
        const isMainDoor = Math.abs(cx) < 0.2;
        const archShape = new THREE.Shape();
        archShape.moveTo(-openingR, 0);
        archShape.lineTo(openingR, 0);
        archShape.lineTo(openingR, springY);
        archShape.absarc(0, springY, openingR, 0, Math.PI, false);
        archShape.closePath();
        const opening = new THREE.Mesh(new THREE.ShapeGeometry(archShape), M.darkOpening);
        opening.position.set(cx, openingBase, fz - 0.18);
        shell.add(opening);
        const archOuter = new THREE.Mesh(
          new THREE.TorusGeometry(openingR + 0.07, 0.11, 10, 28, Math.PI),
          M.creamTrim
        );
        archOuter.position.set(cx, openingBase + springY, fz + 0.035);
        shell.add(archOuter);
        const archInner = new THREE.Mesh(
          new THREE.TorusGeometry(Math.max(0.3, openingR - 0.08), 0.045, 8, 24, Math.PI),
          M.goldAccent
        );
        archInner.position.set(cx, openingBase + springY, fz + 0.075);
        shell.add(archInner);
        for (const side of [-1, 1]) {
          const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.16, springY, 0.22), M.creamTrim);
          jamb.position.set(cx + side * (openingR + 0.035), openingBase + springY * 0.5, fz + 0.03);
          shell.add(jamb);
        }
        if (isSideDoor || isMainDoor) {
          const door = new THREE.Mesh(new THREE.ShapeGeometry(archShape.clone()), M.darkWood);
          door.position.set(cx, openingBase, fz - 0.085);
          shell.add(door);
          const seam = new THREE.Mesh(new THREE.BoxGeometry(0.045, 2.35, 0.055), M.goldAccent);
          seam.position.set(cx, openingBase + 1.18, fz + 0.015);
          shell.add(seam);
          for (const side of [-1, 1]) {
            const panel = new THREE.Mesh(new THREE.BoxGeometry(openingR * 0.62, 1.35, 0.045), M.darkWood);
            panel.position.set(cx + side * openingR * 0.48, openingBase + 1.28, fz + 0.02);
            shell.add(panel);
            const handle = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), M.goldAccent);
            handle.position.set(cx + side * 0.13, openingBase + 1.12, fz + 0.09);
            shell.add(handle);
          }
        } else {
          for (let barIndex = 0; barIndex < 5; barIndex++) {
            const bx = cx - openingR * 0.72 + barIndex * (openingR * 1.44 / 4);
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 2.25, 6), ironwork);
            bar.position.set(bx, openingBase + 1.22, fz + 0.055);
            shell.add(bar);
          }
          for (let row = 0; row < 4; row++) {
            const bar = new THREE.Mesh(new THREE.BoxGeometry(openingW * 0.84, 0.045, 0.055), ironwork);
            bar.position.set(cx, openingBase + 0.5 + row * 0.54, fz + 0.06);
            shell.add(bar);
          }
          const grilleRosette = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.028, 6, 18), M.goldAccent);
          grilleRosette.position.set(cx, openingBase + 1.7, fz + 0.09);
          shell.add(grilleRosette);
          const sill = new THREE.Mesh(new THREE.BoxGeometry(openingW + 0.22, 0.16, 0.38), M.creamTrim);
          sill.position.set(cx, 1.94, fz + 0.12);
          shell.add(sill);
          for (let bal = -2; bal <= 2; bal++) {
            const baluster = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.46, 6), M.creamTrim);
            baluster.position.set(cx + bal * (openingW / 5.2), 1.7, fz + 0.12);
            shell.add(baluster);
          }
        }
      }
    }

    // Center sanctuary double-leaf timber doors with a recessed veneration niche behind them.
    const innerGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 4.0),
      new THREE.MeshBasicMaterial({ color: 0x6A3A14 })
    );
    innerGlow.position.set(0, 3.3, fz - 1.15);
    shell.add(innerGlow);

    this.chanhDienPorchAltar = new THREE.Group();
    this.chanhDienPorchAltar.position.set(0, 1.25, fz - 0.52);
    const porchTable = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.95, 0.85), M.redColumn);
    porchTable.position.y = 0.48;
    this.chanhDienPorchAltar.add(porchTable);
    const porchTrim = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.14, 0.92), M.goldAccent);
    porchTrim.position.y = 0.96;
    this.chanhDienPorchAltar.add(porchTrim);
    const porchGlow = new THREE.PointLight(0xFFE082, 4.8, 12);
    porchGlow.position.set(0, 2.55, 0.75);
    this.porchGlowLight = porchGlow;
    this.chanhDienPorchAltar.add(porchGlow);
    g.add(this.chanhDienPorchAltar);

    const cornice1 = new THREE.Mesh(new THREE.BoxGeometry(W + 1.0, 0.42, D + 1.2), M.goldLight);
    cornice1.position.set(0, 5.85, 0);
    shell.add(cornice1);

    const mosaicBand = new THREE.Mesh(new THREE.BoxGeometry(W + 0.6, 0.48, D + 0.6), M.creamTrim);
    mosaicBand.position.set(0, 7.55, 0);
    shell.add(mosaicBand);

    const cornice2 = new THREE.Mesh(new THREE.BoxGeometry(W + 1.3, 0.46, D + 1.4), M.creamTrim);
    cornice2.position.set(0, 7.95, 0);
    shell.add(cornice2);

    // Recessed ceramic panels with small rosettes, inspired by the real sành-sứ and coloured-tile work.
    const pastelCeramic = new THREE.MeshStandardMaterial({ color: 0x4D879E, roughness: 0.42, metalness: 0.08 });
    const jadeCeramic = new THREE.MeshStandardMaterial({ color: 0x3F7865, roughness: 0.44, metalness: 0.06 });
    for (let bi = -4; bi <= 4; bi++) {
      const bx = bi * 2.9;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.48, 0.94, 0.34), M.creamTrim);
      frame.position.set(bx, 6.65, fz + 0.25);
      shell.add(frame);
      const inlay = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.66, 0.12), bi % 2 === 0 ? pastelCeramic : jadeCeramic);
      inlay.position.set(bx, 6.65, fz + 0.46);
      shell.add(inlay);
      const rosette = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.055, 8, 20), M.goldAccent);
      rosette.position.set(bx, 6.65, fz + 0.55);
      shell.add(rosette);
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), M.creamTrim);
      core.scale.set(1, 1, 0.28);
      core.position.set(bx, 6.65, fz + 0.57);
      shell.add(core);
      for (let petal = 0; petal < 8; petal++) {
        const angle = petal * Math.PI / 4;
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 6), M.goldAccent);
        leaf.scale.set(0.62, 1.55, 0.32);
        leaf.position.set(bx + Math.cos(angle) * 0.31, 6.65 + Math.sin(angle) * 0.31, fz + 0.56);
        leaf.rotation.z = angle - Math.PI / 2;
        shell.add(leaf);
      }
    }
    for (let tile = -13; tile <= 13; tile++) {
      const diamond = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.28, 0.09),
        tile % 3 === 0 ? jadeCeramic : tile % 3 === 1 ? pastelCeramic : M.mosaicRed
      );
      diamond.rotation.z = Math.PI / 4;
      diamond.position.set(tile * 1.0, 7.55, fz + 0.48);
      shell.add(diamond);
    }

    // Three sculpted gables: a taller central crown and two lower side crowns.
    for (const [gx, gw, gh] of [
      [-8.5, 5.4, 2.8],
      [0, 7.8, 4.2],
      [8.5, 5.4, 2.8]
    ]) {
      const baseY = 8.2;
      const faceZ = D / 2 - 0.28;
      const pedimentShape = new THREE.Shape();
      pedimentShape.moveTo(-gw / 2, 0);
      pedimentShape.lineTo(-gw / 2 + 0.38, gh * 0.54);
      pedimentShape.quadraticCurveTo(0, gh * 1.16, gw / 2 - 0.38, gh * 0.54);
      pedimentShape.lineTo(gw / 2, 0);
      pedimentShape.closePath();
      const pediment = new THREE.Mesh(new THREE.ShapeGeometry(pedimentShape), M.goldLight);
      pediment.position.set(gx, baseY, faceZ);
      pediment.castShadow = true;
      shell.add(pediment);

      const innerShape = new THREE.Shape();
      innerShape.moveTo(-gw * 0.34, 0.18);
      innerShape.lineTo(-gw * 0.28, gh * 0.48);
      innerShape.quadraticCurveTo(0, gh * 0.96, gw * 0.28, gh * 0.48);
      innerShape.lineTo(gw * 0.34, 0.18);
      innerShape.closePath();
      const inlay = new THREE.Mesh(new THREE.ShapeGeometry(innerShape), pastelCeramic);
      inlay.position.set(gx, baseY + 0.04, faceZ + 0.045);
      shell.add(inlay);

      const crestCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(gx - gw / 2, baseY + 0.02, faceZ + 0.11),
        new THREE.Vector3(gx - gw / 2 + 0.38, baseY + gh * 0.54, faceZ + 0.11),
        new THREE.Vector3(gx, baseY + gh * 1.16, faceZ + 0.11),
        new THREE.Vector3(gx + gw / 2 - 0.38, baseY + gh * 0.54, faceZ + 0.11),
        new THREE.Vector3(gx + gw / 2, baseY + 0.02, faceZ + 0.11)
      ]);
      const crestTrim = new THREE.Mesh(new THREE.TubeGeometry(crestCurve, 36, 0.075, 8, false), M.creamTrim);
      shell.add(crestTrim);

      const medallion = new THREE.Mesh(
        new THREE.TorusGeometry(gx === 0 ? 0.62 : 0.38, 0.075, 8, 24),
        M.goldAccent
      );
      medallion.position.set(gx, baseY + gh * 0.47, faceZ + 0.16);
      shell.add(medallion);
      const medallionCore = new THREE.Mesh(
        new THREE.SphereGeometry(gx === 0 ? 0.25 : 0.16, 12, 10),
        jadeCeramic
      );
      medallionCore.scale.set(1, 1, 0.28);
      medallionCore.position.copy(medallion.position);
      shell.add(medallionCore);
      for (let petal = 0; petal < 8; petal++) {
        const angle = petal * Math.PI / 4;
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), M.goldAccent);
        leaf.scale.set(0.62, 1.5, 0.32);
        leaf.position.set(
          gx + Math.cos(angle) * (gx === 0 ? 0.42 : 0.25),
          baseY + gh * 0.47 + Math.sin(angle) * (gx === 0 ? 0.42 : 0.25),
          faceZ + 0.18
        );
        leaf.rotation.z = angle - Math.PI / 2;
        shell.add(leaf);
      }
      const spire = new THREE.Mesh(new THREE.ConeGeometry(gx === 0 ? 0.28 : 0.2, gx === 0 ? 1.0 : 0.72, 10), M.goldAccent);
      spire.position.set(gx, baseY + gh + (gx === 0 ? 0.5 : 0.36), faceZ);
      shell.add(spire);
    }

    const targetParent = shell;
    // Note: keep porch altar directly on `g` while procedural architectural shell elements move to `shell`
    const roof1 = makeHippedRoofMesh(W + 2.4, D + 1.6, 2.6, M.roofTile);
    roof1.position.set(0, 9.45, -0.3);
    roof1.castShadow = true;
    targetParent.add(roof1);

    const roof2 = makeHippedRoofMesh(W - 4.8, D - 3.2, 2.3, M.roofTile);
    roof2.position.set(0, 11.2, -0.5);
    roof2.castShadow = true;
    targetParent.add(roof2);

    const ridgeMaterial = new THREE.MeshStandardMaterial({ color: 0x783D30, roughness: 0.72 });
    const lowerRidge = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, W + 1.0, 12), ridgeMaterial);
    lowerRidge.rotation.z = Math.PI / 2;
    lowerRidge.position.set(0, 10.72, -0.3);
    targetParent.add(lowerRidge);
    const upperRidge = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, W - 4.8, 12), ridgeMaterial);
    upperRidge.rotation.z = Math.PI / 2;
    upperRidge.position.set(0, 12.34, -0.5);
    targetParent.add(upperRidge);
    for (const side of [-1, 1]) {
      for (const roofZ of [-D / 2 - 0.65, D / 2 + 0.65]) {
        const eaveFinial = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), M.goldAccent);
        eaveFinial.position.set(side * (W / 2 + 0.8), 9.85, roofZ);
        targetParent.add(eaveFinial);
        const finialTip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.52, 8), M.goldAccent);
        finialTip.position.set(side * (W / 2 + 0.8), 10.18, roofZ);
        targetParent.add(finialTip);
      }
    }

    for (const tx of [-15.6, 15.6]) {
      const tBase = new THREE.Mesh(new THREE.BoxGeometry(3.6, 7.6, 3.6), M.goldWall);
      tBase.position.set(tx, 3.8, D / 2 - 1.4);
      tBase.castShadow = true;
      targetParent.add(tBase);

      const tTop = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.8, 3.0), M.goldLight);
      tTop.position.set(tx, 9.0, D / 2 - 1.4);
      targetParent.add(tTop);

      const tRoof = makeHippedRoofMesh(3.8, 3.8, 1.8, M.roofTile);
      tRoof.position.set(tx, 11.3, D / 2 - 1.4);
      targetParent.add(tRoof);
    }

    for (const bx of [-5.8, 5.8]) {
      const b = this.makeBonsai72(1.18);
      b.position.set(bx, 0, D / 2 + 2.1);
      g.add(b);
    }
    for (const bx of [-8.8, 8.8]) {
      const b = this.makeBonsai72(0.82);
      b.position.set(bx, 0, D / 2 + 1.9);
      g.add(b);
    }

    // Keep the front stair landings walkable; colliders begin behind the lowest stair tread.
    this.addRectObstacle(9.5, 13.8, -6.5, 7.75);
    this.addRectObstacle(17.8, 28.2, -6.5, 7.75);
    this.addRectObstacle(32.2, 36.5, -6.5, 7.75);
    this.addRectObstacle(9.5, 36.5, -6.5, 0.5);
    return g;
  }
};
