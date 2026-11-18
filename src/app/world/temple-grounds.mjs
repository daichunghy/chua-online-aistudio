/**
 * Va chạm (addObstacle) và dựng toàn bộ sân chùa (buildTempleGroundsV8).
 *
 * Mixin của VinhTrang3DWorld: 3 method (addObstacle … buildTempleGroundsV8).
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, makeTextTex, makeHippedRoofMesh } from './shared.mjs';

import { buildResidentialFoodHouses } from './residential-lane.mjs';

export const templeGroundsMethods = {
  addObstacle(x, z, r) {
    this.obstacles.push({ x, z, r });
  },

  addRectObstacle(minX, maxX, minZ, maxZ) {
    this.rectObstacles.push({ minX, maxX, minZ, maxZ });
  },

  buildTempleGroundsV8() {
    const M = this.MAT;

    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(320, 320),
      new THREE.MeshStandardMaterial({ map: this.mekongEarthTex, color: 0xffffff, roughness: 0.95 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.05;
    grass.receiveShadow = true;
    this.exteriorGroup.add(grass);

    // Expanded Stone Courtyard spanning full 136m x 134m (~18,200 m² sanctuary covering rear hall)
    const courtyard = new THREE.Mesh(
      new THREE.BoxGeometry(136, 0.1, 134),
      new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xD9D0BF, roughness: 0.86 })
    );
    courtyard.position.set(0.0, -0.04, -25.5);
    courtyard.receiveShadow = true;
    this.exteriorGroup.add(courtyard);

    // Front Plaza Axis (Cổng Tam Quan -> Sân Cờ -> Chánh Điện)
    const mainRoad = new THREE.Mesh(
      new THREE.BoxGeometry(10.8, 0.12, 48),
      new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xDFD5C3, roughness: 0.78 })
    );
    mainRoad.position.set(23, 0.0, 33);
    mainRoad.receiveShadow = true;
    this.exteriorGroup.add(mainRoad);

    // RIGHT (East) Tourist Arrival Road along +X flank (through open Cổng Phụ x=40.5 -> Yellow Banner -> Bougainvillea Side Path)
    const rightArrivalRoad = new THREE.Mesh(
      new THREE.BoxGeometry(9.2, 0.12, 54),
      new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xE5D8C3, roughness: 0.78 })
    );
    rightArrivalRoad.position.set(40.5, 0.002, 34);
    rightArrivalRoad.receiveShadow = true;
    this.exteriorGroup.add(rightArrivalRoad);

    // Long Straight Cool Tree-Shaded Lane from Cổng Phụ Tịnh Độ Huyền Môn (x = 40.5, z = +42 -> -27)
    // + Left-Turn Apron at End of Road (z = -14.5) leading onto the Shoe-Removal Veranda of Chánh Điện!
    const sideWalkway = new THREE.Mesh(
      new THREE.BoxGeometry(9.4, 0.12, 69.5),
      new THREE.MeshStandardMaterial({ map: this.asphaltTex, color: 0xD8D4CA, roughness: 0.84 })
    );
    sideWalkway.position.set(40.5, 0.006, 7.25);
    sideWalkway.receiveShadow = true;
    this.exteriorGroup.add(sideWalkway);

    const endTurnPlaza = new THREE.Mesh(
      new THREE.BoxGeometry(11.6, 0.13, 12.5),
      new THREE.MeshStandardMaterial({ map: this.sideBrickTex, color: 0xEAD6C0, roughness: 0.78 })
    );
    endTurnPlaza.position.set(39.8, 0.008, -16.5);
    endTurnPlaza.receiveShadow = true;
    this.exteriorGroup.add(endTurnPlaza);

    this.buildFenceAndGateWall();

    // Expanded Pagoda Front Brick/Stone Apron + Rustic Unpaved Mekong Dirt Lanes & Shoulders
    const frontSidewalk = new THREE.Mesh(
      new THREE.BoxGeometry(136, 0.1, 9.8),
      new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xD7CEBC, roughness: 0.85 })
    );
    frontSidewalk.position.set(0.0, -0.004, 46.5);
    frontSidewalk.receiveShadow = true;
    this.exteriorGroup.add(frontSidewalk);

    const dirtShoulderTex = this.dirtRoadTex.clone();
    dirtShoulderTex.needsUpdate = true;
    dirtShoulderTex.repeat.set(34, 1);
    const dirtShoulderMat = new THREE.MeshStandardMaterial({ map: dirtShoulderTex, color: 0xffffff, roughness: 0.94 });

    const dirtLaneTex = this.dirtRoadTex.clone();
    dirtLaneTex.needsUpdate = true;
    dirtLaneTex.repeat.set(12, 2);
    const dirtLaneMat = new THREE.MeshStandardMaterial({ map: dirtLaneTex, color: 0xffffff, roughness: 0.94 });

    // Continuous rustic red-brown dirt shoulder along the north & south sides of Đường Nguyễn Trung Trực
    const dirtShoulderNorth = new THREE.Mesh(new THREE.BoxGeometry(220, 0.08, 2.4), dirtShoulderMat);
    dirtShoulderNorth.position.set(10.0, -0.014, 52.1);
    dirtShoulderNorth.receiveShadow = true;
    this.exteriorGroup.add(dirtShoulderNorth);

    const dirtShoulderSouth = new THREE.Mesh(new THREE.BoxGeometry(220, 0.08, 4.2), dirtShoulderMat);
    dirtShoulderSouth.position.set(10.0, -0.014, 63.6);
    dirtShoulderSouth.receiveShadow = true;
    this.exteriorGroup.add(dirtShoulderSouth);

    // Unpaved rural dirt lanes extending West & East beyond the pagoda front brick apron
    const dirtLaneWest = new THREE.Mesh(new THREE.BoxGeometry(76, 0.08, 9.0), dirtLaneMat);
    dirtLaneWest.position.set(-54, -0.012, 46.5);
    dirtLaneWest.receiveShadow = true;
    this.exteriorGroup.add(dirtLaneWest);

    const dirtLaneEast = new THREE.Mesh(new THREE.BoxGeometry(64, 0.08, 9.0), dirtLaneMat);
    dirtLaneEast.position.set(88, -0.012, 46.5);
    dirtLaneEast.receiveShadow = true;
    this.exteriorGroup.add(dirtLaneEast);

    const road = new THREE.Mesh(
      new THREE.BoxGeometry(220, 0.08, 10.2),
      new THREE.MeshStandardMaterial({ map: this.asphaltTex, color: 0xffffff, roughness: 0.9 })
    );
    road.position.set(10.0, -0.025, 57.5);
    road.receiveShadow = true;
    this.exteriorGroup.add(road);

    const dashMat = new THREE.MeshBasicMaterial({ color: 0xEAE3CF });
    for (let dx = -80; dx <= 100; dx += 8) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.16), dashMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(dx, 0.018, 57.5);
      this.exteriorGroup.add(dash);
    }

    // 1. Cổng Chính Tam Quan (CLOSED ceremonially, calm & quiet at x = 23, z = 41.5)
    const gateEast = this.buildTamQuanGate('CHÙA VĨNH TRÀNG', true);
    gateEast.position.set(23, 0, 41.5);
    this.tamQuanMainGroup = gateEast;
    this.exteriorGroup.add(gateEast);

    // 2. Ornate Ceramic-Mosaic Cổng Phụ ("TỊNH ĐỘ HUYỀN MÔN" — WIDE OPEN & BUSTLING at x = 40.5, z = 41.5)
    const sideGate = this.buildSideMosaicGate();
    sideGate.position.set(40.5, 0, 41.5);
    this.exteriorGroup.add(sideGate);

    // Authentic Blue Metal A-Frame Sign ("CHO XE 2 BÁNH VÀO CHÙA") & Tall Royal Palm beside right gate pillar (photo ref!)
    const blueGateSignGrp = new THREE.Group();
    blueGateSignGrp.position.set(44.18, 0, 43.45);
    blueGateSignGrp.rotation.y = -0.1;
    for (const lx of [-0.36, 0.36]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.38, 0.05), M.darkWood);
      leg.position.set(lx, 0.68, 0);
      blueGateSignGrp.add(leg);
    }
    const blueBoard = new THREE.Mesh(
      new THREE.BoxGeometry(0.86, 0.96, 0.06),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('CHO XE 2 BÁNH VÀO CHÙA', {
          w: 420,
          h: 460,
          bg: '#1668C4',
          border: '#E8F2FF',
          color: '#FFFFFF',
          size: 42
        }),
        roughness: 0.36
      })
    );
    blueBoard.position.set(0, 0.92, 0.02);
    blueGateSignGrp.add(blueBoard);
    this.exteriorGroup.add(blueGateSignGrp);

    const palmGrp = new THREE.Group();
    palmGrp.position.set(46.8, 0, 42.9);
    const palmTrunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.34, 9.6, 12),
      new THREE.MeshStandardMaterial({ color: 0x9C9484, roughness: 0.85 })
    );
    palmTrunk.position.y = 4.8;
    palmTrunk.castShadow = true;
    palmGrp.add(palmTrunk);
    for (let fi = 0; fi < 10; fi++) {
      const ang = (fi / 10) * Math.PI * 2;
      const frond = new THREE.Mesh(new THREE.ConeGeometry(0.46, 3.2, 5), M.foliageMid);
      frond.scale.set(0.55, 1.0, 0.18);
      frond.position.set(Math.cos(ang) * 1.25, 9.45, Math.sin(ang) * 1.25);
      frond.rotation.z = -Math.cos(ang) * 1.18;
      frond.rotation.x = Math.sin(ang) * 1.18;
      palmGrp.add(frond);
    }
    this.exteriorGroup.add(palmGrp);

    // Yellow Overhead Welcome Banner just inside Cổng Phụ
    const rightBannerGroup = new THREE.Group();
    rightBannerGroup.position.set(40.5, 0, 34.5);
    for (const px of [-3.6, 3.6]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.095, 5.2, 8), M.goldAccent);
      pole.position.set(px, 2.6, 0);
      pole.castShadow = true;
      rightBannerGroup.add(pole);
    }
    const rightBannerBoard = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 0.95, 0.16),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('CHÀO MỪNG QUÝ QUAN KHÁCH VÀ QUÝ PHẬT TỬ THÂN LÂM', {
          w: 1600,
          h: 200,
          bg: '#F8EA8C',
          border: '#1C5A34',
          color: '#9E241C',
          size: 40
        }),
        roughness: 0.42
      })
    );
    rightBannerBoard.position.set(0, 4.55, 0);
    rightBannerGroup.add(rightBannerBoard);
    this.exteriorGroup.add(rightBannerGroup);

    this.buildVietnameseGroceryHouse();
    buildResidentialFoodHouses.call(this); // khu dân cư + quán ăn phía Đông (world/residential-lane.mjs)

    const chanhDien = this.buildChanhDien13Arches();
    chanhDien.position.set(23, 0, 1.0);
    this.exteriorGroup.add(chanhDien);

    // Connected Main Temple Complex ("Chùa Chính" chữ Quốc layout centered seamlessly on x = 23.0)
    const buildMainTempleCompound = () => {
      const comp = new THREE.Group();
      const centerX = 23.0;
      const frontZ = 7.15;
      const rearZ = -82.0;
      const totalDepth = frontZ - rearZ;
      const centerZ = (frontZ + rearZ) * 0.5;
      const darkWoodBeam = new THREE.MeshStandardMaterial({
        color: 0x3D2114, map: this.woodGrainTex, roughness: 0.6
      });
      const ceramicJade = new THREE.MeshStandardMaterial({ color: 0x3F7865, roughness: 0.44 });
      const ceramicBlue = new THREE.MeshStandardMaterial({ color: 0x4D879E, roughness: 0.42 });
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x676B66, roughness: 0.92, flatShading: true });
      const mossMat = new THREE.MeshStandardMaterial({ color: 0x3D7A3C, roughness: 0.85 });
      const floorMat = new THREE.MeshStandardMaterial({
        map: this.pavingTex, color: 0xD6C3A5, roughness: 0.82
      });

      const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(22.4, 0.96, totalDepth),
        M.stoneLight
      );
      plinth.position.set(centerX, 0.48, centerZ);
      plinth.receiveShadow = true;
      plinth.castShadow = true;
      comp.add(plinth);

      const skywells = [
        { z: -30.5, depth: 16.6 },
        { z: -60.75, depth: 15.5 }
      ];
      for (const court of skywells) {
        const courtFloor = new THREE.Mesh(
          new THREE.BoxGeometry(14.8, 0.22, court.depth),
          floorMat
        );
        courtFloor.position.set(centerX, 1.07, court.z);
        courtFloor.receiveShadow = true;
        comp.add(courtFloor);
      }

      const galleryZones = [
        { z: -7.525, depth: 29.35 },
        { z: -30.5, depth: 16.6 },
        { z: -45.9, depth: 14.2 },
        { z: -60.75, depth: 15.5 },
        { z: -75.25, depth: 13.5 }
      ];
      for (const sideX of [13.8, 32.2]) {
        const galleryFloor = new THREE.Mesh(
          new THREE.BoxGeometry(3.8, 0.22, totalDepth),
          M.stoneLight
        );
        galleryFloor.position.set(sideX, 1.07, centerZ);
        galleryFloor.receiveShadow = true;
        comp.add(galleryFloor);

        for (const zone of galleryZones) {
          const galleryRoof = makeHippedRoofMesh(
            4.85, zone.depth + 0.8, 1.45, M.roofTile
          );
          galleryRoof.position.set(sideX, 5.72, zone.z);
          galleryRoof.castShadow = true;
          comp.add(galleryRoof);
        }

        for (const edge of [-1, 1]) {
          const colX = sideX + edge * 1.55;
          for (let z = 6.0; z >= -80.0; z -= 4.0) {
            const base = new THREE.Mesh(
              new THREE.BoxGeometry(0.46, 0.22, 0.46), M.creamTrim
            );
            base.position.set(colX, 1.19, z);
            comp.add(base);

            const column = new THREE.Mesh(
              new THREE.CylinderGeometry(0.14, 0.18, 3.78, 12), M.redColumn
            );
            column.position.set(colX, 3.19, z);
            column.castShadow = true;
            comp.add(column);

            const capital = new THREE.Mesh(
              new THREE.BoxGeometry(0.5, 0.2, 0.5), M.goldAccent
            );
            capital.position.set(colX, 5.18, z);
            comp.add(capital);
          }
        }
      }

      for (const edgeX of [12.25, 33.75]) {
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.62, totalDepth - 1.2), M.creamTrim
        );
        rail.position.set(edgeX, 1.55, centerZ);
        comp.add(rail);
        for (let z = 6.0; z >= -78.0; z -= 2.0) {
          const baluster = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.045, 0.54, 6), M.creamTrim
          );
          baluster.position.set(edgeX, 1.55, z);
          comp.add(baluster);
        }
      }

      // Cross-halls have timber side walls, a rear wall, carved front colonnades and tiled roofs.
      const addCrossHall = (z, width, depth, height, doorCount, roofRise = 2.35) => {
        const hall = new THREE.Group();
        hall.position.set(centerX, 0, z);

        const floor = new THREE.Mesh(
          new THREE.BoxGeometry(width + 0.8, 0.28, depth + 0.8), M.stoneLight
        );
        floor.position.y = 1.1;
        floor.receiveShadow = true;
        hall.add(floor);

        for (const side of [-1, 1]) {
          const sideWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.34, height, depth), M.goldWall
          );
          sideWall.position.set(side * width * 0.5, 1.24 + height * 0.5, 0);
          sideWall.castShadow = true;
          sideWall.receiveShadow = true;
          hall.add(sideWall);

          // Narrow timber-framed side windows keep the long elevations from reading as blank boxes.
          for (const wz of [-depth * 0.28, depth * 0.28]) {
            const windowFrame = new THREE.Mesh(
              new THREE.BoxGeometry(0.1, 1.2, 1.5), M.creamTrim
            );
            windowFrame.position.set(side * (width * 0.5 + 0.02), 3.75, wz);
            hall.add(windowFrame);
            for (let slat = 0; slat < 4; slat++) {
              const louver = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.055, 1.34), darkWoodBeam
              );
              louver.position.set(side * (width * 0.5 + 0.08), 3.28 + slat * 0.28, wz);
              hall.add(louver);
            }
          }
        }

        const rearWall = new THREE.Mesh(
          new THREE.BoxGeometry(width, height, 0.34), M.goldWall
        );
        rearWall.position.set(0, 1.24 + height * 0.5, -depth * 0.5);
        rearWall.castShadow = true;
        hall.add(rearWall);

        const frontZ = depth * 0.5 + 0.08;
        const beam = new THREE.Mesh(
          new THREE.BoxGeometry(width + 0.5, 0.28, 0.34), darkWoodBeam
        );
        beam.position.set(0, 5.12, frontZ);
        hall.add(beam);

        for (let i = 0; i <= doorCount; i++) {
          const x = -width * 0.5 + (width / doorCount) * i;
          const base = new THREE.Mesh(
            new THREE.BoxGeometry(0.48, 0.22, 0.48), M.stoneLight
          );
          base.position.set(x, 1.22, frontZ);
          hall.add(base);

          const column = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.18, 3.75, 12), M.redColumn
          );
          column.position.set(x, 3.19, frontZ);
          column.castShadow = true;
          hall.add(column);

          const capital = new THREE.Mesh(
            new THREE.BoxGeometry(0.52, 0.2, 0.52), M.goldAccent
          );
          capital.position.set(x, 5.08, frontZ);
          hall.add(capital);
        }

        for (let i = 0; i < doorCount; i++) {
          const bayWidth = width / doorCount;
          const x = -width * 0.5 + bayWidth * (i + 0.5);
          const doorWidth = Math.min(1.75, bayWidth * 0.62);
          const frame = new THREE.Mesh(
            new THREE.BoxGeometry(doorWidth + 0.24, 3.08, 0.16), M.creamTrim
          );
          frame.position.set(x, 2.72, frontZ + 0.06);
          hall.add(frame);

          const leaf = new THREE.Mesh(
            new THREE.BoxGeometry(doorWidth, 2.76, 0.09), M.darkWood
          );
          leaf.position.set(x, 2.66, frontZ + 0.16);
          hall.add(leaf);

          const centerSeam = new THREE.Mesh(
            new THREE.BoxGeometry(0.035, 2.58, 0.045), M.goldAccent
          );
          centerSeam.position.set(x, 2.66, frontZ + 0.22);
          hall.add(centerSeam);

          const transom = new THREE.Mesh(
            new THREE.BoxGeometry(doorWidth, 0.34, 0.06), darkWoodBeam
          );
          transom.position.set(x, 4.42, frontZ + 0.12);
          hall.add(transom);
          for (let bar = -2; bar <= 2; bar++) {
            const lattice = new THREE.Mesh(
              new THREE.BoxGeometry(0.035, 0.28, 0.035), M.goldAccent
            );
            lattice.position.set(x + bar * (doorWidth / 6), 4.42, frontZ + 0.16);
            hall.add(lattice);
          }
        }

        // A restrained blue-green ceramic frieze recalls the real mosaic work without over-gilding it.
        const frieze = new THREE.Mesh(
          new THREE.BoxGeometry(width + 0.4, 0.34, 0.12), ceramicJade
        );
        frieze.position.set(0, 5.48, frontZ + 0.02);
        hall.add(frieze);
        for (let i = 0; i < doorCount; i++) {
          const tile = new THREE.Mesh(
            new THREE.BoxGeometry(0.22, 0.22, 0.06),
            i % 2 === 0 ? ceramicBlue : M.mosaicRed
          );
          tile.position.set(-width * 0.5 + (i + 0.5) * (width / doorCount), 5.48, frontZ + 0.1);
          hall.add(tile);
        }

        const roof = makeHippedRoofMesh(
          width + 2.0, depth + 1.8, roofRise, M.roofTile
        );
        roof.position.set(0, 6.05, -0.12);
        roof.castShadow = true;
        hall.add(roof);

        const ridge = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, width + 0.8, 12),
          new THREE.MeshStandardMaterial({ color: 0x783D30, roughness: 0.72 })
        );
        ridge.rotation.z = Math.PI / 2;
        ridge.position.set(0, 7.55, -0.12);
        hall.add(ridge);

        comp.add(hall);
      };

      // Tiền đường is the existing 13-arch front hall; these halls continue the same central axis.
      addCrossHall(-14.1, 14.8, 16.2, 5.0, 5, 2.45);  // Chánh điện
      addCrossHall(-45.9, 14.8, 14.2, 4.9, 5, 2.3);   // Nhà tổ
      addCrossHall(-75.25, 16.0, 13.5, 5.0, 5, 2.35); // Nhà hậu

      // The first skywell contains the single non bộ between Chánh điện and Nhà tổ.
      const basin = new THREE.Mesh(
        new THREE.CylinderGeometry(3.25, 3.45, 0.42, 24), M.stoneDark
      );
      basin.position.set(centerX, 1.28, -30.5);
      comp.add(basin);
      const water = new THREE.Mesh(
        new THREE.CylinderGeometry(2.92, 2.92, 0.08, 24), M.water
      );
      water.position.set(centerX, 1.52, -30.5);
      comp.add(water);

      for (const [x, y, z, sx, sy, sz] of [
        [22.0, 2.45, -30.7, 1.25, 2.15, 1.0],
        [24.1, 2.1, -30.3, 1.05, 1.75, 0.9],
        [21.2, 1.9, -29.2, 0.82, 1.25, 0.78],
        [25.0, 1.85, -31.3, 0.76, 1.2, 0.72]
      ]) {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 1), rockMat);
        rock.scale.set(sx, sy, sz);
        rock.position.set(x, y, z);
        rock.castShadow = true;
        comp.add(rock);

        const moss = new THREE.Mesh(new THREE.SphereGeometry(0.48, 9, 7), mossMat);
        moss.scale.set(sx * 0.72, 0.24, sz * 0.72);
        moss.position.set(x, y + sy * 0.72, z);
        comp.add(moss);
      }

      const cascade = new THREE.Mesh(
        new THREE.PlaneGeometry(0.72, 1.9),
        new THREE.MeshBasicMaterial({
          color: 0xB8F0FA, transparent: true, opacity: 0.64, side: THREE.DoubleSide
        })
      );
      cascade.position.set(22.8, 2.1, -29.65);
      cascade.rotation.x = 0.12;
      comp.add(cascade);

      for (const [x, z] of [[18.8, -26.4], [27.2, -26.4], [18.8, -34.6], [27.2, -34.6]]) {
        const bonsai = this.makeBonsai72(0.68);
        bonsai.position.set(x, 1.18, z);
        comp.add(bonsai);
      }

      // The second skywell stays open, with only corner bonsai rather than a duplicate rockery.
      for (const [x, z] of [[18.8, -56.8], [27.2, -56.8], [18.8, -64.7], [27.2, -64.7]]) {
        const bonsai = this.makeBonsai72(0.62);
        bonsai.position.set(x, 1.18, z);
        comp.add(bonsai);
      }

      // Invisible selection volume spans the complete compound for the exterior-to-interior interaction.
      const compoundHit = new THREE.Mesh(
        new THREE.BoxGeometry(22.4, 10.5, totalDepth),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      compoundHit.position.set(centerX, 5.4, centerZ);
      comp.add(compoundHit);
      this.mainCompoundClickTargets.push(compoundHit);

      this.exteriorGroup.add(comp);
      // Front façade colliders already protect the entrance; leave the stair and side-door approaches clear.
      this.addRectObstacle(11.8, 34.2, rearZ, -6.5);
    };

    buildMainTempleCompound();

    // EXTERIOR MEKONG WOODEN STILT DINING HALL ("Nhà Sàn Gỗ Truyền Thống Miền Tây · Khu Ăn Phật Tử")
    // Placed East of walkway (center 59.5, 0, 14.5; x = 54.0..65.0, z = 7.0..22.0) with open West stairs at z = 12.8..16.2!
    const buildMekongStiltDiningPavilion = () => {
      const stilt = new THREE.Group();
      stilt.position.set(59.5, 0, 14.5);

      const stiltWoodMat = new THREE.MeshStandardMaterial({ color: 0x4E2C16, map: this.woodGrainTex, roughness: 0.68 });
      const plankDeckMat = new THREE.MeshStandardMaterial({ color: 0x784722, map: this.woodGrainTex, roughness: 0.56 });
      const railWoodMat = new THREE.MeshStandardMaterial({ color: 0x5E3419, roughness: 0.6 });
      const tableMat = new THREE.MeshStandardMaterial({ color: 0x6A3A1A, roughness: 0.48 });
      const bowlMat = new THREE.MeshStandardMaterial({ color: 0xFFFDF8, roughness: 0.25 });
      const potMat = new THREE.MeshStandardMaterial({ color: 0xC9D1D8, metalness: 0.55, roughness: 0.28 });

      // 1. Calm lotus canal pond basin underneath the stilts
      const basinCurb = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.42, 15.6), M.stoneDark);
      basinCurb.position.y = 0.21;
      stilt.add(basinCurb);
      const canalWater = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.34, 14.8), M.water);
      canalWater.position.y = 0.27;
      stilt.add(canalWater);

      // Lotus blossoms & pads floating around the stilts beneath the deck
      for (const [lx, lz] of [[-4.8, -5.8], [-4.9, 5.2], [4.7, -5.5], [4.8, 5.8], [-4.7, -2.5], [4.7, 2.2]]) {
        const pad = new THREE.Mesh(
          new THREE.CylinderGeometry(0.42, 0.42, 0.04, 12),
          new THREE.MeshStandardMaterial({ color: 0x3A7B3B, roughness: 0.72 })
        );
        pad.position.set(lx, 0.46, lz);
        stilt.add(pad);
        const bloom = new THREE.Mesh(
          new THREE.ConeGeometry(0.2, 0.26, 7),
          new THREE.MeshStandardMaterial({ color: 0xF579A8, roughness: 0.45 })
        );
        bloom.rotation.x = Math.PI;
        bloom.position.set(lx, 0.62, lz);
        stilt.add(bloom);
      }

      // 2. Ironwood stilts seated on stone column footings in water + under-floor bearers
      for (const sx of [-4.2, -1.4, 1.4, 4.2]) {
        for (const sz of [-6.0, -2.0, 2.0, 6.0]) {
          const footing = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 0.48, 10), M.stoneLight);
          footing.position.set(sx, 0.24, sz);
          stilt.add(footing);
          const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 1.08, 10), stiltWoodMat);
          pile.position.set(sx, 0.6, sz);
          pile.castShadow = true;
          stilt.add(pile);
        }
        const bearer = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 13.6), stiltWoodMat);
        bearer.position.set(sx, 0.96, 0);
        stilt.add(bearer);
      }

      // 3. Elevated hardwood plank floor deck at y = +1.05m (10.2m x 14.0m)
      const deck = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.18, 14.0), plankDeckMat);
      deck.position.set(0, 1.05, 0);
      deck.receiveShadow = true;
      deck.castShadow = true;
      stilt.add(deck);

      // Planking seam lines across the hardwood floor
      for (let pz = -6.6; pz <= 6.6; pz += 0.65) {
        const seam = new THREE.Mesh(
          new THREE.BoxGeometry(10.0, 0.02, 0.04),
          new THREE.MeshStandardMaterial({ color: 0x3B2010, roughness: 0.85 })
        );
        seam.position.set(0, 1.14, pz);
        stilt.add(seam);
      }

      // 4. Open-Air Balustrades (Lan can gỗ truyền thống) with West Bridge Stair Opening (z = -1.7..+1.7)
      const addBalustrade = (x1, z1, x2, z2) => {
        const dx = x2 - x1;
        const dz = z2 - z1;
        const len = Math.hypot(dx, dz);
        const railGroup = new THREE.Group();
        const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, len), railWoodMat);
        topBar.position.y = 0.85;
        railGroup.add(topBar);
        const midBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, len), railWoodMat);
        midBar.position.y = 0.42;
        railGroup.add(midBar);
        const nSpindle = Math.max(2, Math.floor(len / 0.55));
        for (let si = 0; si <= nSpindle; si++) {
          const sp = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.84, 0.07), railWoodMat);
          sp.position.set(0, 0.42, -len / 2 + (si / nSpindle) * len);
          railGroup.add(sp);
        }
        railGroup.position.set((x1 + x2) / 2, 1.12, (z1 + z2) / 2);
        railGroup.rotation.y = Math.atan2(dx, dz);
        stilt.add(railGroup);
      };
      addBalustrade(-4.95, -6.85, 4.95, -6.85);
      addBalustrade(-4.95, 6.85, 4.95, 6.85);
      addBalustrade(4.95, -6.85, 4.95, 6.85);
      addBalustrade(-4.95, -6.85, -4.95, -1.7);
      addBalustrade(-4.95, 1.7, -4.95, 6.85);

      // Wide West Wooden Entrance Stairway/Bridge climbing smoothly onto Nhà Sàn (x_world = 52.2..54.6, z_world = 14.5)
      for (let stIdx = 0; stIdx < 5; stIdx++) {
        const tread = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.22, 3.4), plankDeckMat);
        tread.position.set(-7.2 + stIdx * 0.52, 0.11 + stIdx * 0.22, 0);
        tread.castShadow = true;
        tread.receiveShadow = true;
        stilt.add(tread);
      }
      for (const rz of [-1.75, 1.75]) {
        const stairRail = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.09, 0.1), railWoodMat);
        stairRail.position.set(-6.15, 1.38, rz);
        stairRail.rotation.z = 0.38;
        stilt.add(stairRail);
      }

      // 5. Traditional Mekong Timber Columns, Exposed Vì Kèo Rafters & Two-Tier Southern Roof
      for (const cx of [-4.4, 4.4]) {
        for (const cz of [-6.0, -2.0, 2.0, 6.0]) {
          const uCol = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 3.55, 10), stiltWoodMat);
          uCol.position.set(cx, 2.9, cz);
          uCol.castShadow = true;
          stilt.add(uCol);
        }
      }
      for (const rz of [-6.0, -2.0, 2.0, 6.0]) {
        const tieBeam = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.18, 0.16), stiltWoodMat);
        tieBeam.position.set(0, 4.62, rz);
        stilt.add(tieBeam);
        const kingPost = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.25, 0.16), stiltWoodMat);
        kingPost.position.set(0, 5.25, rz);
        stilt.add(kingPost);
        for (const sSign of [-1, 1]) {
          const strut = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.13, 0.13), stiltWoodMat);
          strut.position.set(sSign * 2.15, 5.18, rz);
          strut.rotation.z = sSign * -0.26;
          stilt.add(strut);
        }
      }
      const lowerRoof = makeHippedRoofMesh(12.2, 16.0, 1.9, M.roofTile);
      lowerRoof.position.set(0, 5.65, 0);
      lowerRoof.castShadow = true;
      stilt.add(lowerRoof);
      const upperMonitor = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.65, 10.6), stiltWoodMat);
      upperMonitor.position.set(0, 6.55, 0);
      stilt.add(upperMonitor);
      const upperRoof = makeHippedRoofMesh(8.4, 11.8, 1.35, M.roofTile);
      upperRoof.position.set(0, 7.35, 0);
      upperRoof.castShadow = true;
      stilt.add(upperRoof);

      // 6. Long Wooden Dining Tables, Benches, Serving Counter & Mekong Earthenware Water Urns
      for (const tx of [-1.2, 2.2]) {
        for (const tz of [-3.9, 3.9]) {
          const tbl = new THREE.Group();
          tbl.position.set(tx, 1.14, tz);
          const top = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 3.6), tableMat);
          top.position.y = 0.72;
          tbl.add(top);
          for (const lx of [-0.5, 0.5]) {
            for (const lz of [-1.5, 1.5]) {
              const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.08), tableMat);
              leg.position.set(lx, 0.36, lz);
              tbl.add(leg);
            }
          }
          for (const bx of [-0.9, 0.9]) {
            const bench = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 3.4), tableMat);
            bench.position.set(bx, 0.42, 0);
            tbl.add(bench);
          }
          for (const bPos of [-1.1, -0.35, 0.35, 1.1]) {
            const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.06, 0.08, 10), bowlMat);
            bowl.position.set(0, 0.8, bPos);
            tbl.add(bowl);
          }
          stilt.add(tbl);
        }
      }

      // Serving counter & Mekong water urn ("Lu nước mát & nồi canh chay") on East side
      const serveCounter = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 4.6), M.redColumn);
      serveCounter.position.set(3.9, 1.58, 0);
      stilt.add(serveCounter);
      for (const pz of [-1.4, 0, 1.4]) {
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.26, 0.32, 12), potMat);
        pot.position.set(3.9, 2.18, pz);
        stilt.add(pot);
      }
      const luNuoc = new THREE.Mesh(new THREE.SphereGeometry(0.45, 14, 12), M.terracottaPot);
      luNuoc.scale.set(1.0, 1.18, 1.0);
      luNuoc.position.set(3.8, 1.65, -5.6);
      stilt.add(luNuoc);

      const stiltSign = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.76, 5.2),
        new THREE.MeshStandardMaterial({
          map: makeTextTex('NHÀ SÀN TRAI ĐƯỜNG · KHU ĂN PHẬT TỬ', {
            w: 1120,
            h: 180,
            bg: '#5C1610',
            border: '#FFD875',
            color: '#FFF2B2',
            size: 50
          })
        })
      );
      stiltSign.position.set(-4.62, 3.95, 0);
      stilt.add(stiltSign);

      this.exteriorGroup.add(stilt);
      this.stiltDiningClickTargets.push(stiltSign, deck, serveCounter);

      // Perimeter pond rail colliders leaving ONLY West stair opening (z = 12.8..16.2) walkable onto deck!
      this.addRectObstacle(53.7, 65.4, 6.6, 7.6);
      this.addRectObstacle(53.7, 65.4, 21.4, 22.4);
      this.addRectObstacle(64.4, 65.4, 7.2, 21.8);
      this.addRectObstacle(53.6, 54.6, 7.2, 12.6);
      this.addRectObstacle(53.6, 54.6, 16.4, 21.8);
    };
    buildMekongStiltDiningPavilion();

    // Giảng đường Phật pháp (East Sanctuary Pavilion shifted cleanly to (58.5, 0, -18.0) so straight lane x = 40.5 stays 100% open!)
    const giangDuong = this.buildGiangDuong();
    giangDuong.position.set(58.5, 0, -18.0);
    const gdSteps = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 3.6), M.stoneLight);
    gdSteps.position.set(-5.2, 0.175, 0);
    giangDuong.add(gdSteps);
    this.exteriorGroup.add(giangDuong);
    this.lectureClickTargets.push(giangDuong);
    this.addRectObstacle(53.4, 63.8, -27.5, -8.5);

    // 7-Tier Terracotta Bảo Tháp in the rear garden near the reclining Buddha (upgraded with bao-thap-7-tang.glb on load).
    this.stupaGroup = this.buildSevenTierStupa();
    this.stupaGroup.position.set(-8.0, 0, -37.0);
    this.exteriorGroup.add(this.stupaGroup);
    this.addObstacle(-8.0, -37.0, 4.2);

    this.buildStatuePedestals();

    // Large South-Center Lotus Pond right west of Tam Quan courtyard
    const pond1 = this.buildLotusPond(14.5, 16.5, 16, true);
    pond1.position.set(3.5, 0, 33.0);
    this.exteriorGroup.add(pond1);
    this.addRectObstacle(-4.2, 11.2, 24.4, 41.6);

    this.lanternWishesGroup.position.set(3.5, 0.56, 33.0);
    this.exteriorGroup.add(this.lanternWishesGroup);

    // Secondary Inner Lotus Basin beside the central monastic hall
    const pond2 = this.buildLotusPond(8.0, 10.5, 8, false);
    pond2.position.set(2.0, 0, -1.5);
    this.exteriorGroup.add(pond2);
    this.addRectObstacle(-2.4, 6.4, -7.2, 4.2);

    // Twin Three-Tier White-Gold Stupas in Middle Plaza
    for (const tz of [20.5, 25.0]) {
      const miniStupa = new THREE.Group();
      for (let t = 0; t < 3; t++) {
        const w = 1.85 - t * 0.42;
        const h = 1.45 - t * 0.2;
        const tier = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), M.creamTrim);
        tier.position.y = 0.72 + t * 1.38;
        tier.castShadow = true;
        miniStupa.add(tier);
        const eaves = makeHippedRoofMesh(w + 0.45, w + 0.45, 0.48, M.goldAccent);
        eaves.position.y = 1.55 + t * 1.38;
        miniStupa.add(eaves);
      }
      const finial = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.9, 8), M.goldAccent);
      finial.position.y = 5.1;
      miniStupa.add(finial);
      miniStupa.position.set(-5.8, 0, tz);
      this.exteriorGroup.add(miniStupa);
      this.addObstacle(-5.8, tz, 1.3);
    }

    // Incense burner in Flag Courtyard + bloom light/ring anchored in Main Lotus Pond
    const mainBurner = this.buildIncenseBurner(0.88);
    mainBurner.position.set(23.0, 0, 12.0);
    this.exteriorGroup.add(mainBurner);
    this.addObstacle(23.0, 12.0, 1.05);
    this.incenseSticksGroup.position.set(23.0, 1.32, 12.0);
    this.exteriorGroup.add(this.incenseSticksGroup);

    this.offeredLotusesGroup.position.set(5.4, 0.62, 33.0);
    this.exteriorGroup.add(this.offeredLotusesGroup);

    const bloomLight = new THREE.PointLight(0xFFD97D, 0, 24);
    bloomLight.position.set(4.5, 2.8, 33.0);
    this.exteriorGroup.add(bloomLight);
    this.lotusBloomState.burstLight = bloomLight;

    const bloomRing = new THREE.Mesh(
      new THREE.RingGeometry(1.0, 1.55, 36),
      new THREE.MeshBasicMaterial({
        color: 0xFFE699,
        side: THREE.DoubleSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0
      })
    );
    bloomRing.rotation.x = -Math.PI / 2;
    bloomRing.position.set(5.4, 0.72, 33.0);
    this.exteriorGroup.add(bloomRing);
    this.lotusBloomState.burstRing = bloomRing;

    const burnerAdida = this.buildIncenseBurner(0.75);
    burnerAdida.position.set(15.8, 0, 17.5);
    this.exteriorGroup.add(burnerAdida);
    this.addObstacle(15.8, 17.5, 0.9);

    // Incense burner centered at Di Lặc stepped staircase
    const burnerDiLac = this.buildIncenseBurner(0.78);
    burnerDiLac.position.set(-24.5, 1.72, 17.2);
    this.exteriorGroup.add(burnerDiLac);

    // Incense burner at the visitor approach to the reclining Buddha.
    const burnerNietBan = this.buildIncenseBurner(0.68);
    burnerNietBan.position.set(-24.5, 0, -13.5);
    this.exteriorGroup.add(burnerNietBan);
    this.addObstacle(-24.5, -13.5, 0.82);

    // Incense burner beside Đài Quán Thế Âm on the RIGHT side pathway
    const burnerQuanAm = this.buildIncenseBurner(0.62);
    burnerQuanAm.position.set(34.5, 0, 22.5);
    this.exteriorGroup.add(burnerQuanAm);
    this.addObstacle(34.5, 22.5, 0.72);

    const cushionCoords = [
      [21.4, 13.4, Math.PI],
      [24.6, 13.4, Math.PI],
      [14.2, 17.5, -Math.PI / 2],
      [-24.5, 21.8, Math.PI],
      [35.2, 22.5, -Math.PI / 2],
      [-24.5, -10.5, 0]
    ];
    for (const [kx, kz, kyaw] of cushionCoords) {
      const c = this.makeKneelingCushion();
      c.position.set(kx, 0, kz);
      c.rotation.y = kyaw;
      this.exteriorGroup.add(c);
    }

    const lanternZ = [29, 35];
    for (const z of lanternZ) {
      for (const x of [19.4, 26.8]) {
        const l = this.makeStoneLantern();
        l.position.set(x, 0, z);
        this.exteriorGroup.add(l);
        this.addObstacle(x, z, 0.65);
      }
    }

    this.buildGardensTreesAndFlags();
    this.buildExpandedDiscoveryZones();
    this.buildCourtyardPigeons();
    this.buildInteractiveCourtyardLeaves();
    this.buildInteractiveGardenPlots();
  }
};
