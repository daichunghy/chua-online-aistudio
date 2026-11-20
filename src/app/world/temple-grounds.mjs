/**
 * Va chạm (addObstacle) và dựng toàn bộ sân chùa (buildTempleGroundsV8).
 *
 * Mixin của VinhTrang3DWorld: 3 method (addObstacle … buildTempleGroundsV8).
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, makeTextTex, makeHippedRoofMesh } from './shared.mjs';

import { buildResidentialFoodHouses } from './residential-lane.mjs';
import { buildRightEntranceRoadProps } from './right-entrance-road.mjs';

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
      new THREE.PlaneGeometry(540, 540),
      new THREE.MeshStandardMaterial({ map: this.mekongEarthTex, color: 0xffffff, roughness: 0.95 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(0, -0.05, 55);
    grass.receiveShadow = true;
    this.exteriorGroup.add(grass);

    const regWet = (mat, opts) => {
      this.registerWettableMaterial?.(mat, opts);
      return mat;
    };

    // Expanded Stone Courtyard spanning full 136m x 134m (~18,200 m² sanctuary covering rear hall)
    const courtyardMat = regWet(
      new THREE.MeshStandardMaterial({
        map: this.pavingTex,
        bumpMap: this.pavingBumpTex,
        bumpScale: 0.028,
        roughnessMap: this.pavingRoughTex,
        color: 0xD9D0BF,
        roughness: 0.88
      }),
      { minRoughness: 0.2, darkenStrength: 0.22 }
    );
    const courtyard = new THREE.Mesh(new THREE.BoxGeometry(136, 0.1, 134), courtyardMat);
    courtyard.position.set(0.0, -0.04, -25.5);
    courtyard.receiveShadow = true;
    this.exteriorGroup.add(courtyard);

    // Front Plaza Axis (Cổng Tam Quan -> Sân Cờ -> Chánh Điện; terminates cleanly at gate line z = 41.5)
    const mainRoadMat = regWet(
      new THREE.MeshStandardMaterial({
        map: this.pavingTex,
        bumpMap: this.pavingBumpTex,
        bumpScale: 0.026,
        roughnessMap: this.pavingRoughTex,
        color: 0xC6BBA6,
        roughness: 0.88
      }),
      { minRoughness: 0.2, darkenStrength: 0.24 }
    );
    const mainRoad = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.12, 32.5), mainRoadMat);
    mainRoad.position.set(23, 0.0, 25.25);
    mainRoad.receiveShadow = true;
    this.exteriorGroup.add(mainRoad);

    // RIGHT (East) Tourist Arrival Road inside compound (warm weathered concrete stone, zero glare)
    const rightArrivalRoadMat = regWet(
      new THREE.MeshStandardMaterial({
        map: this.concreteRoadTex,
        bumpMap: this.stoneBumpTex,
        bumpScale: 0.018,
        color: 0xB8AE9B,
        roughness: 0.90
      }),
      { minRoughness: 0.22, darkenStrength: 0.25 }
    );
    const rightArrivalRoad = new THREE.Mesh(
      new THREE.BoxGeometry(12.4, 0.12, 34.5),
      rightArrivalRoadMat
    );
    rightArrivalRoad.position.set(41.8, 0.002, 24.25);
    rightArrivalRoad.receiveShadow = true;
    this.exteriorGroup.add(rightArrivalRoad);

    // Long, Wide Weathered Stone-Concrete Entrance Road inside Cổng Phụ Tịnh Độ Huyền Môn (x = 35.5..48.1, z = +41.5 -> -42)
    // + Spacious Left-Turn Plaza at End of Road (z = -14.5) leading onto the Shoe-Removal Veranda of Chánh Điện!
    const sideWalkwayMat = regWet(
      new THREE.MeshStandardMaterial({
        map: this.concreteRoadTex,
        bumpMap: this.stoneBumpTex,
        bumpScale: 0.018,
        color: 0xBDB3A0,
        roughness: 0.90
      }),
      { minRoughness: 0.22, darkenStrength: 0.24 }
    );
    const sideWalkway = new THREE.Mesh(new THREE.BoxGeometry(12.6, 0.12, 83.5), sideWalkwayMat);
    sideWalkway.position.set(41.8, 0.006, -0.25);
    sideWalkway.receiveShadow = true;
    this.exteriorGroup.add(sideWalkway);

    const endTurnPlazaMat = regWet(
      new THREE.MeshStandardMaterial({
        map: this.sideBrickTex,
        bumpMap: this.pavingBumpTex,
        bumpScale: 0.022,
        color: 0xC9B39A,
        roughness: 0.86
      }),
      { minRoughness: 0.24, darkenStrength: 0.24 }
    );
    const endTurnPlaza = new THREE.Mesh(new THREE.BoxGeometry(17.6, 0.13, 27.0), endTurnPlazaMat);
    endTurnPlaza.position.set(42.5, 0.008, -21.5);
    endTurnPlaza.receiveShadow = true;
    this.exteriorGroup.add(endTurnPlaza);

    // Lối lát đá rộng nối từ sân rẽ trái xuyên giữa 2 bồn cây kiểng thẳng vào Văn Phòng Ban Trị Sự · Giảng Đường Huệ Đăng
    const giangDuongWalkwayMat = regWet(
      new THREE.MeshStandardMaterial({
        map: this.pavingTex,
        bumpMap: this.pavingBumpTex,
        bumpScale: 0.024,
        color: 0xC4B8A3,
        roughness: 0.88
      }),
      { minRoughness: 0.22, darkenStrength: 0.24 }
    );
    const giangDuongWalkway = new THREE.Mesh(
      new THREE.BoxGeometry(10.6, 0.12, 5.4),
      giangDuongWalkwayMat
    );
    giangDuongWalkway.position.set(54.2, 0.007, -18.0);
    giangDuongWalkway.receiveShadow = true;
    this.exteriorGroup.add(giangDuongWalkway);

    this.buildFenceAndGateWall();
    this.buildCongPhuStreetLife?.();

    // =========================================================================================
    // REAL CHÙA VĨNH TRÀNG AGED, DUSTY, UNEVEN MỸ THO APPROACH ROAD (170m LONG)
    // Verified against real Mỹ Tho photos & OSM GeoJSON (way/266761436):
    // Old worn Mekong asphalt with tar patches, cracks, dusty ochre-brown dirt shoulders,
    // uneven surface undulations & shallow wheel ruts — zero painted lane stripes!
    // =========================================================================================
    const plainAsphaltCanvas = document.createElement('canvas');
    plainAsphaltCanvas.width = 512;
    plainAsphaltCanvas.height = 512;
    const pactx = plainAsphaltCanvas.getContext('2d');
    // Sun-faded, aged dusty warm-grey asphalt base
    pactx.fillStyle = '#7A756C';
    pactx.fillRect(0, 0, 512, 512);

    // Dusty ochre-brown Mekong dirt creeping inward from both outer shoulders
    const leftDustGrad = pactx.createLinearGradient(0, 0, 118, 0);
    leftDustGrad.addColorStop(0, 'rgba(148, 116, 78, 0.72)');
    leftDustGrad.addColorStop(0.5, 'rgba(138, 112, 80, 0.32)');
    leftDustGrad.addColorStop(1, 'rgba(138, 112, 80, 0)');
    pactx.fillStyle = leftDustGrad;
    pactx.fillRect(0, 0, 118, 512);

    const rightDustGrad = pactx.createLinearGradient(512, 0, 394, 0);
    rightDustGrad.addColorStop(0, 'rgba(148, 116, 78, 0.72)');
    rightDustGrad.addColorStop(0.5, 'rgba(138, 112, 80, 0.32)');
    rightDustGrad.addColorStop(1, 'rgba(138, 112, 80, 0)');
    pactx.fillStyle = rightDustGrad;
    pactx.fillRect(394, 0, 118, 512);

    // Uneven darker aged asphalt patches ("vá đường cũ")
    for (let p = 0; p < 14; p++) {
      const px = 48 + ((p * 97) % 340);
      const py = (p * 113) % 450;
      const pw = 42 + ((p * 29) % 74);
      const ph = 34 + ((p * 41) % 68);
      pactx.fillStyle = p % 2 === 0 ? 'rgba(72, 70, 68, 0.34)' : 'rgba(146, 122, 92, 0.24)';
      pactx.beginPath();
      pactx.ellipse(px + pw * 0.5, py + ph * 0.5, pw * 0.55, ph * 0.48, (p % 5) * 0.3, 0, Math.PI * 2);
      pactx.fill();
    }

    // Coarse worn stone aggregate, dust speckles & loose gravel
    for (let i = 0; i < 6200; i++) {
      const gx = (i * 89) % 512;
      const gy = (i * 173) % 512;
      const isEdge = gx < 82 || gx > 430;
      if (isEdge && i % 2 === 0) {
        const r = 132 + ((i * 23) % 46);
        const g = 104 + ((i * 19) % 38);
        const b = 74 + ((i * 17) % 30);
        pactx.fillStyle = `rgb(${r},${g},${b})`;
        pactx.fillRect(gx, gy, 2 + (i % 3), 2 + ((i >> 1) % 3));
      } else {
        const v = 86 + ((i * 37) % 48);
        pactx.fillStyle = `rgb(${v + 4},${v + 1},${v - 3})`;
        pactx.fillRect(gx, gy, 2 + (i % 2), 2 + ((i >> 1) % 2));
      }
    }

    // Worn wheel-rut dusty sheen (NO lane markings!)
    pactx.fillStyle = 'rgba(164, 146, 120, 0.14)';
    pactx.fillRect(118, 0, 72, 512);
    pactx.fillRect(322, 0, 72, 512);

    // Branched weathered cracks in old asphalt
    pactx.strokeStyle = 'rgba(54, 48, 42, 0.42)';
    pactx.lineWidth = 1.6;
    for (let k = 0; k < 16; k++) {
      pactx.beginPath();
      let cx = 36 + ((k * 71) % 440);
      let cy = (k * 61) % 512;
      pactx.moveTo(cx, cy);
      for (let s = 0; s < 6; s++) {
        cx += ((k + s) % 2 === 0 ? 1 : -1) * (10 + ((k * 7 + s * 5) % 14));
        cy += 18 + ((k + s * 3) % 18);
        pactx.lineTo(cx, cy);
      }
      pactx.stroke();
    }

    const straightAsphaltTex = new THREE.CanvasTexture(plainAsphaltCanvas);
    straightAsphaltTex.colorSpace = THREE.SRGBColorSpace;
    straightAsphaltTex.wrapS = THREE.RepeatWrapping;
    straightAsphaltTex.wrapT = THREE.RepeatWrapping;
    straightAsphaltTex.repeat.set(1, 22);
    const straightAsphaltMat = regWet(
      new THREE.MeshStandardMaterial({
        map: straightAsphaltTex,
        bumpMap: this.stoneBumpTex,
        bumpScale: 0.022,
        color: 0xD2C8B8,
        roughness: 0.94,
        metalness: 0.0
      }),
      { minRoughness: 0.18, darkenStrength: 0.30 }
    );

    const apronAsphaltTex = straightAsphaltTex.clone();
    apronAsphaltTex.needsUpdate = true;
    apronAsphaltTex.repeat.set(8, 2);
    const apronAsphaltMat = regWet(
      new THREE.MeshStandardMaterial({
        map: apronAsphaltTex,
        bumpMap: this.stoneBumpTex,
        bumpScale: 0.022,
        color: 0xD4CBB9,
        roughness: 0.93,
        metalness: 0.0
      }),
      { minRoughness: 0.18, darkenStrength: 0.30 }
    );

    // Dusty red-brown Mekong compacted earth & gravel verge texture ("lề đường đất bụi Mỹ Tho")
    const dirtVergeCanvas = document.createElement('canvas');
    dirtVergeCanvas.width = 256;
    dirtVergeCanvas.height = 256;
    const dctx = dirtVergeCanvas.getContext('2d');
    dctx.fillStyle = '#9C7E5A';
    dctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 3200; i++) {
      const dx = (i * 53) % 256;
      const dy = (i * 127) % 256;
      const tone = i % 3;
      if (tone === 0) dctx.fillStyle = '#B5956B';
      else if (tone === 1) dctx.fillStyle = '#7D6345';
      else dctx.fillStyle = '#C4B196';
      dctx.fillRect(dx, dy, 2 + (i % 3), 2 + ((i >> 1) % 3));
    }
    const dirtVergeTex = new THREE.CanvasTexture(dirtVergeCanvas);
    dirtVergeTex.colorSpace = THREE.SRGBColorSpace;
    dirtVergeTex.wrapS = THREE.RepeatWrapping;
    dirtVergeTex.wrapT = THREE.RepeatWrapping;
    dirtVergeTex.repeat.set(1, 38);
    const dirtVergeMat = regWet(
      new THREE.MeshStandardMaterial({
        map: dirtVergeTex,
        color: 0xC9B393,
        roughness: 0.98
      }),
      { minRoughness: 0.52, darkenStrength: 0.28 }
    );

    const urbanSidewalkTex = this.pavingTex.clone();
    urbanSidewalkTex.needsUpdate = true;
    urbanSidewalkTex.repeat.set(2, 34);
    const urbanSidewalkMat = regWet(
      new THREE.MeshStandardMaterial({
        map: urbanSidewalkTex,
        bumpMap: this.pavingBumpTex,
        bumpScale: 0.024,
        color: 0xD0C3AE,
        roughness: 0.90
      }),
      { minRoughness: 0.22, darkenStrength: 0.24 }
    );
    const frontWalkTex = this.pavingTex.clone();
    frontWalkTex.needsUpdate = true;
    frontWalkTex.repeat.set(18, 2);
    const frontWalkMat = regWet(
      new THREE.MeshStandardMaterial({
        map: frontWalkTex,
        bumpMap: this.pavingBumpTex,
        bumpScale: 0.024,
        color: 0xD2C6B2,
        roughness: 0.88
      }),
      { minRoughness: 0.22, darkenStrength: 0.24 }
    );
    const urbanCurbMat = new THREE.MeshStandardMaterial({ color: 0xA99E8E, roughness: 0.93 });

    // Helper: create bumpy, weathered uneven ground/road strip with subtle real-world undulations
    const makeUnevenRoadGeo = (w, d, segX, segZ, bumpScale = 0.052, hasRuts = true) => {
      const geo = new THREE.PlaneGeometry(w, d, segX, segZ);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vz = pos.getZ(i);
        const nx = vx / (w * 0.5);
        // Subtle aged crown (center slightly higher, edges worn down toward dusty verges)
        let h = (1 - nx * nx) * 0.042;
        if (hasRuts) {
          const leftRut = Math.exp(-Math.pow((nx + 0.42) * 4.4, 2));
          const rightRut = Math.exp(-Math.pow((nx - 0.42) * 4.4, 2));
          h -= (leftRut + rightRut) * 0.032;
        }
        // Deterministic multi-frequency old-road potholes/ripples
        const ripple =
          Math.sin(vz * 0.23 + vx * 0.52) * 0.48 +
          Math.cos(vz * 0.57 - vx * 0.88) * 0.32 +
          Math.sin(vz * 1.13 + vx * 1.45) * 0.20;
        h += ripple * bumpScale;
        pos.setY(i, h);
      }
      geo.computeVertexNormals();
      return geo;
    };

    // 1. Aged Uneven Front Forecourt right outside Cổng Tam Quan & Cổng Phụ (x = -28..+47.4, z = 41.5..54.0)
    const frontApron = new THREE.Mesh(
      makeUnevenRoadGeo(75.4, 12.5, 42, 10, 0.028, false),
      apronAsphaltMat
    );
    frontApron.position.set(9.7, 0.015, 47.75);
    frontApron.receiveShadow = true;
    this.exteriorGroup.add(frontApron);

    // Narrow paved urban apron along far-West temple fence (x = -82..-28, z = 41.6..54.0)
    const westFenceWalk = new THREE.Mesh(new THREE.BoxGeometry(54.0, 0.11, 12.4), frontWalkMat);
    westFenceWalk.position.set(-55.0, -0.005, 47.8);
    westFenceWalk.receiveShadow = true;
    this.exteriorGroup.add(westFenceWalk);

    // 2. MAIN 170-METER AGED UNEVEN MỸ THO APPROACH ROAD (x = 33.7 .. 47.3, z = 41.5 .. 212.0)
    // Uneven bumpy surface, dusty edges, tar patches — ZERO painted lane dividers!
    const straightApproachRoad = new THREE.Mesh(
      makeUnevenRoadGeo(13.6, 170.5, 18, 96, 0.056, true),
      straightAsphaltMat
    );
    straightApproachRoad.position.set(40.5, 0.018, 126.75);
    straightApproachRoad.receiveShadow = true;
    this.exteriorGroup.add(straightApproachRoad);

    // Dusty red-brown Mekong dirt & gravel verges flanking both edges of the approach road ("lề đất bụi")
    const westDirtVerge = new THREE.Mesh(
      makeUnevenRoadGeo(2.3, 148.0, 5, 64, 0.045, false),
      dirtVergeMat
    );
    westDirtVerge.position.set(33.35, 0.024, 126.5);
    westDirtVerge.receiveShadow = true;
    this.exteriorGroup.add(westDirtVerge);

    const eastDirtVerge = new THREE.Mesh(
      makeUnevenRoadGeo(2.3, 152.0, 5, 64, 0.045, false),
      dirtVergeMat
    );
    eastDirtVerge.position.set(47.65, 0.024, 122.0);
    eastDirtVerge.receiveShadow = true;
    this.exteriorGroup.add(eastDirtVerge);

    // Scattered small gravel mounds, worn patch stones & hardy roadside grass tufts along dusty shoulders
    const roadDustWeedMat = new THREE.MeshStandardMaterial({ color: 0x627A40, roughness: 0.92 });
    const gravelPatchMat = new THREE.MeshStandardMaterial({ color: 0x9E8768, roughness: 0.96 });
    for (let rz = 56; rz <= 194; rz += 6.8) {
      for (const side of [-1, 1]) {
        const edgeX = side < 0 ? 33.15 + ((rz * 7) % 10) * 0.06 : 47.85 - ((rz * 11) % 10) * 0.06;
        // Skip open driveway at outer parking lot on East side (z = 102..138)
        if (side > 0 && rz > 101 && rz < 139) continue;
        const pebblePatch = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.28 + ((rz * 3) % 4) * 0.06, 0),
          gravelPatchMat
        );
        pebblePatch.scale.set(1.8, 0.22, 2.2);
        pebblePatch.position.set(edgeX, 0.03, rz);
        pebblePatch.rotation.y = (rz * 0.7) % Math.PI;
        this.exteriorGroup.add(pebblePatch);

        if (Math.floor(rz) % 2 === 0) {
          const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.34, 5), roadDustWeedMat);
          tuft.position.set(edgeX + side * 0.42, 0.14, rz + 1.4);
          tuft.rotation.z = side * 0.18;
          this.exteriorGroup.add(tuft);
        }
      }
    }

    // Weathered, slightly uneven segmented concrete curbs along both verges
    for (let z = 54.5; z < 197.5; z += 5.2) {
      const jitterY = ((Math.sin(z * 1.7) * 0.025));
      const westCurbSeg = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.14, 4.92), urbanCurbMat);
      westCurbSeg.position.set(32.55, 0.035 + jitterY, z + 2.5);
      westCurbSeg.rotation.z = Math.cos(z * 0.9) * 0.035;
      westCurbSeg.receiveShadow = true;
      this.exteriorGroup.add(westCurbSeg);
    }

    // Worn West pedestrian sidewalk along Công viên Vĩnh Tràng (x = 30.4 .. 32.4, z = 54.0 .. 198.5)
    const westRoadSidewalk = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.10, 144.5), urbanSidewalkMat);
    westRoadSidewalk.position.set(31.45, 0.005, 126.25);
    westRoadSidewalk.receiveShadow = true;
    this.exteriorGroup.add(westRoadSidewalk);

    // Weathered East curb segments (leaving open driveway at outer parking lot z = 102..138!)
    for (const [cz0, cz1] of [[44.5, 102.0], [138.0, 198.0]]) {
      for (let z = cz0; z < cz1; z += 5.2) {
        const segL = Math.min(4.92, cz1 - z);
        if (segL < 0.8) continue;
        const eastCurb = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.14, segL), urbanCurbMat);
        eastCurb.position.set(48.45, 0.035 + Math.cos(z * 1.4) * 0.022, z + segL * 0.5);
        eastCurb.rotation.z = Math.sin(z * 0.8) * 0.035;
        eastCurb.receiveShadow = true;
        this.exteriorGroup.add(eastCurb);
      }
    }

    // Continuous East storefront pedestrian sidewalk (x = 48.6 .. 52.4, z = 41.6 .. 198.5)
    const eastRoadSidewalk = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.10, 156.9), urbanSidewalkMat);
    eastRoadSidewalk.position.set(50.5, 0.005, 120.05);
    eastRoadSidewalk.receiveShadow = true;
    this.exteriorGroup.add(eastRoadSidewalk);

    // 3. Far-South Main Urban Arterial Cross-Street: Đường Nguyễn Trung Trực (z = 198.5 .. 212.0, 165m from gate!)
    const mainAvenueTex = straightAsphaltTex.clone();
    mainAvenueTex.needsUpdate = true;
    mainAvenueTex.repeat.set(28, 2);
    const mainAvenueRoad = new THREE.Mesh(
      new THREE.BoxGeometry(280, 0.085, 13.5),
      new THREE.MeshStandardMaterial({ map: mainAvenueTex, color: 0xCFD3D6, roughness: 0.90 })
    );
    mainAvenueRoad.position.set(25.0, -0.022, 205.25);
    mainAvenueRoad.receiveShadow = true;
    this.exteriorGroup.add(mainAvenueRoad);

    const farSouthWalk = new THREE.Mesh(new THREE.BoxGeometry(280, 0.11, 4.6), frontWalkMat);
    farSouthWalk.position.set(25.0, 0.0, 214.3);
    farSouthWalk.receiveShadow = true;
    this.exteriorGroup.add(farSouthWalk);

    // Clean Vietnamese blue urban street sign at entrance edge ("ĐƯỜNG VÀO CHÙA VĨNH TRÀNG")
    const streetPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.055, 3.1, 8),
      new THREE.MeshStandardMaterial({ color: 0x5A646D, metalness: 0.4, roughness: 0.5 })
    );
    streetPost.position.set(48.1, 1.55, 48.2);
    this.exteriorGroup.add(streetPost);
    const streetSignBoard = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.44, 0.06),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('ĐƯỜNG VÀO CHÙA VĨNH TRÀNG', {
          w: 820,
          h: 190,
          bg: '#134C8A',
          border: '#F4F7FA',
          color: '#FFFFFF',
          size: 38
        }),
        roughness: 0.42
      })
    );
    streetSignBoard.position.set(48.1, 2.95, 48.2);
    streetSignBoard.rotation.y = -Math.PI / 6;
    this.exteriorGroup.add(streetSignBoard);

    // Distant junction sign ("ĐƯỜNG NGUYỄN TRUNG TRỰC") where the 170m approach road meets the main avenue
    const farSignPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.06, 3.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x5A646D, metalness: 0.4, roughness: 0.5 })
    );
    farSignPost.position.set(48.2, 1.7, 196.5);
    this.exteriorGroup.add(farSignPost);
    const farSignBoard = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.46, 0.06),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('ĐƯỜNG NGUYỄN TRUNG TRỰC', {
          w: 820,
          h: 190,
          bg: '#134C8A',
          border: '#F4F7FA',
          color: '#FFFFFF',
          size: 38
        }),
        roughness: 0.42
      })
    );
    farSignBoard.position.set(48.2, 3.25, 196.5);
    farSignBoard.rotation.y = Math.PI;
    this.exteriorGroup.add(farSignBoard);

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
    const palmCrown = new THREE.Group();
    palmCrown.position.y = 9.5;
    for (let fi = 0; fi < 11; fi++) {
      const ang = (fi / 11) * Math.PI * 2;
      const anchor = new THREE.Group();
      anchor.rotation.y = ang;
      const mat = fi % 2 === 0 ? M.foliageMid : M.foliageLight;
      const seg1 = new THREE.Mesh(new THREE.ConeGeometry(0.36, 1.9, 5), mat);
      seg1.scale.set(0.7, 1.0, 0.2);
      seg1.position.set(0.82, 0.24, 0);
      seg1.rotation.z = -Math.PI * 0.36;
      anchor.add(seg1);

      const seg2 = new THREE.Mesh(new THREE.ConeGeometry(0.3, 2.0, 5), mat);
      seg2.scale.set(0.62, 1.0, 0.18);
      seg2.position.set(2.08, -0.22, 0);
      seg2.rotation.z = -Math.PI * 0.8;
      anchor.add(seg2);
      palmCrown.add(anchor);
    }
    palmGrp.add(palmCrown);
    this.exteriorGroup.add(palmGrp);

    // Yellow Overhead Welcome Banner spanning between curbs inside Cổng Phụ (matching real photo height)
    const rightBannerGroup = new THREE.Group();
    rightBannerGroup.position.set(41.8, 0, 34.5);
    for (const px of [-5.8, 5.8]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.085, 5.5, 8), M.goldAccent);
      pole.position.set(px, 2.75, 0);
      pole.castShadow = true;
      rightBannerGroup.add(pole);
    }
    const rightBannerBoard = new THREE.Mesh(
      new THREE.BoxGeometry(11.6, 0.96, 0.14),
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
    rightBannerBoard.position.set(0, 4.82, 0);
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
      const rearZ = -34.5;
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
        { z: -27.5, depth: 11.6 }
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
        { z: -28.0, depth: 12.6 }
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
          for (let z = 6.0; z >= -33.0; z -= 4.0) {
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
        for (let z = 6.0; z >= -32.0; z -= 2.0) {
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

      // Tiền đường is the 13-arch front hall; Chánh điện + rear skywell end at z = -34.5 so Phật Nằm rises right behind the red roofs!
      addCrossHall(-14.1, 14.8, 16.2, 5.0, 5, 2.45);  // Chánh điện

      // Rear Non Bộ skywell directly behind Chánh Điện
      const basin = new THREE.Mesh(
        new THREE.CylinderGeometry(3.0, 3.2, 0.42, 24), M.stoneDark
      );
      basin.position.set(centerX, 1.28, -27.5);
      comp.add(basin);
      const water = new THREE.Mesh(
        new THREE.CylinderGeometry(2.7, 2.7, 0.08, 24), M.water
      );
      water.position.set(centerX, 1.52, -27.5);
      comp.add(water);

      for (const [x, y, z, sx, sy, sz] of [
        [22.1, 2.35, -27.7, 1.15, 1.95, 0.95],
        [24.0, 2.05, -27.3, 0.98, 1.62, 0.85],
        [21.3, 1.85, -26.4, 0.78, 1.18, 0.72],
        [24.8, 1.82, -28.3, 0.72, 1.12, 0.68]
      ]) {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 1), rockMat);
        rock.scale.set(sx, sy, sz);
        rock.position.set(x, y, z);
        rock.castShadow = true;
        comp.add(rock);

        const moss = new THREE.Mesh(new THREE.SphereGeometry(0.46, 9, 7), mossMat);
        moss.scale.set(sx * 0.72, 0.24, sz * 0.72);
        moss.position.set(x, y + sy * 0.72, z);
        comp.add(moss);
      }

      const cascade = new THREE.Mesh(
        new THREE.PlaneGeometry(0.68, 1.75),
        new THREE.MeshBasicMaterial({
          color: 0xB8F0FA, transparent: true, opacity: 0.64, side: THREE.DoubleSide
        })
      );
      cascade.position.set(22.8, 2.05, -26.75);
      cascade.rotation.x = 0.12;
      comp.add(cascade);

      for (const [x, z] of [[18.8, -24.2], [27.2, -24.2], [18.8, -31.2], [27.2, -31.2]]) {
        const bonsai = this.makeBonsai72(0.64);
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

    // Toàn bộ lối vào bên phải theo ảnh thực tế (hàng rào sắt đỏ, hàng tượng trắng, nhà giữ xe, quầy dù xanh, Trai Đường)
    buildRightEntranceRoadProps.call(this);

    // Văn Phòng Ban Trị Sự · Giảng Đường Huệ Đăng phía Đông (mặt tiền hành lang hướng Tây về sân rẽ trái)
    const giangDuong = this.buildGiangDuong();
    giangDuong.position.set(64.5, 0, -18.0);
    for (let st = 0; st < 3; st++) {
      const gdStep = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.16, 4.2), M.stoneLight);
      gdStep.position.set(-5.7 - (2 - st) * 0.42, 0.08 + st * 0.15, 0);
      gdStep.receiveShadow = true;
      giangDuong.add(gdStep);
    }
    this.exteriorGroup.add(giangDuong);
    this.lectureClickTargets.push(giangDuong);
    this.addRectObstacle(59.0, 70.2, -28.2, -7.8);

    // 7-Tier Terracotta Bảo Tháp directly behind Tượng Phật A Di Đà on the real North-Center axis
    this.stupaGroup = this.buildSevenTierStupa();
    this.stupaGroup.position.set(-9.5, 0, -44.5);
    this.exteriorGroup.add(this.stupaGroup);
    this.addObstacle(-9.5, -44.5, 4.2);

    this.buildStatuePedestals();

    // Large South-Center Lotus Pond right west of Tam Quan courtyard
    const pond1 = this.buildLotusPond(14.5, 16.5, 16, true);
    pond1.position.set(3.5, 0, 33.0);
    this.exteriorGroup.add(pond1);
    this.addRectObstacle(-4.2, 11.2, 24.4, 41.6);

    this.lanternWishesGroup.position.set(3.5, 0.56, 33.0);
    this.exteriorGroup.add(this.lanternWishesGroup);

    // Wide open central stone avenue between Di Lặc and Chánh Điện (matching real aerial photo — NO blocking inner pond!)

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

    // Incense burner centered in front of Tượng Phật A Di Đà (real North-Center axis)
    const burnerAdida = this.buildIncenseBurner(0.75);
    burnerAdida.position.set(-9.5, 0, -15.8);
    this.exteriorGroup.add(burnerAdida);
    this.addObstacle(-9.5, -15.8, 0.9);

    // Incense burner centered at Di Lặc stepped staircase
    const burnerDiLac = this.buildIncenseBurner(0.78);
    burnerDiLac.position.set(-26.5, 1.72, 17.2);
    this.exteriorGroup.add(burnerDiLac);

    // Incense burner at the visitor approach to the reclining Buddha behind Chánh Điện
    const burnerNietBan = this.buildIncenseBurner(0.68);
    burnerNietBan.position.set(14.5, 0, -38.8);
    this.exteriorGroup.add(burnerNietBan);
    this.addObstacle(14.5, -38.8, 0.82);

    // Incense burner beside Đài Quán Thế Âm on the RIGHT side pathway
    const burnerQuanAm = this.buildIncenseBurner(0.62);
    burnerQuanAm.position.set(34.5, 0, 22.5);
    this.exteriorGroup.add(burnerQuanAm);
    this.addObstacle(34.5, 22.5, 0.72);

    const cushionCoords = [
      [21.4, 13.4, Math.PI],
      [24.6, 13.4, Math.PI],
      [-9.5, -14.0, Math.PI],
      [-26.5, 21.8, Math.PI],
      [35.2, 22.5, -Math.PI / 2],
      [14.5, -37.2, Math.PI]
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
