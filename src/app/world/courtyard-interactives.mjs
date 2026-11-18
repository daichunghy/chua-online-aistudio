/**
 * Lá bồ đề thu nhặt, vườn thiền, câu đối, chùm đèn chỉ đường.
 *
 * Mixin của VinhTrang3DWorld: 8 method (buildInteractiveCourtyardLeaves … buildStationBeacons).
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, PILGRIMAGE_STATIONS, DISCOVERY_ZONES, COURTYARD_LEAF_SPOTS, TEMPLE_GARDEN_SLOTS, buildSquareChanhDienInterior, makeTextTex } from './shared.mjs';

export const courtyardInteractivesMethods = {
  buildInteractiveCourtyardLeaves() {
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0.22);
    leafShape.quadraticCurveTo(0.16, 0.05, 0.12, -0.14);
    leafShape.quadraticCurveTo(0.03, -0.22, 0, -0.28);
    leafShape.quadraticCurveTo(-0.03, -0.22, -0.12, -0.14);
    leafShape.quadraticCurveTo(-0.16, 0.05, 0, 0.22);
    const leafGeo = new THREE.ShapeGeometry(leafShape);
    const leafMatGold = new THREE.MeshStandardMaterial({
      color: 0xE6AD3A,
      emissive: 0x6A4408,
      emissiveIntensity: 0.22,
      roughness: 0.58,
      side: THREE.DoubleSide
    });
    const leafMatAmber = new THREE.MeshStandardMaterial({
      color: 0xC98328,
      roughness: 0.65,
      side: THREE.DoubleSide
    });
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xFFE38C,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let i = 0; i < COURTYARD_LEAF_SPOTS.length; i++) {
      const spot = COURTYARD_LEAF_SPOTS[i];
      const lx = spot.pos?.x ?? spot.x ?? 0;
      const lz = spot.pos?.z ?? spot.z ?? 0;
      const cluster = new THREE.Group();
      cluster.position.set(lx, 0.025, lz);
      cluster.userData.leafId = spot.id;
      cluster.userData.phase = i * 0.9;

      const glowRing = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.56, 20), ringMat);
      glowRing.rotation.x = -Math.PI / 2;
      glowRing.position.y = 0.006;
      cluster.add(glowRing);

      for (let j = 0; j < 5; j++) {
        const ang = (j / 5) * Math.PI * 2 + i * 0.4;
        const dist = j === 0 ? 0.04 : 0.22;
        const leaf = new THREE.Mesh(leafGeo, j % 2 === 0 ? leafMatGold : leafMatAmber);
        leaf.rotation.x = -Math.PI / 2 + (j % 2 === 0 ? 0.08 : -0.06);
        leaf.rotation.z = ang;
        leaf.position.set(Math.cos(ang) * dist, 0.02 + j * 0.008, Math.sin(ang) * dist);
        leaf.scale.setScalar(0.9 + (j % 3) * 0.14);
        leaf.userData.leafId = spot.id;
        cluster.add(leaf);
      }

      const hitDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.75, 0.45, 12),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      hitDisc.position.y = 0.22;
      hitDisc.userData.leafId = spot.id;
      cluster.add(hitDisc);

      this.exteriorGroup.add(cluster);
      this.courtyardLeafMeshes.set(spot.id, cluster);
      this.courtyardLeafClickTargets.push(hitDisc);
    }
  },

  syncCourtyardLeaves(collectedIds = []) {
    const doneSet = new Set(Array.isArray(collectedIds) ? collectedIds : []);
    for (const [leafId, grp] of this.courtyardLeafMeshes.entries()) {
      grp.visible = !doneSet.has(leafId);
    }
    this.renderFrame();
  },

  buildInteractiveGardenPlots() {
    const M = this.MAT;
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x4A3423, roughness: 0.92 });
    const readySoilMat = new THREE.MeshStandardMaterial({
      color: 0x3A5B2C,
      emissive: 0x2F6B1E,
      emissiveIntensity: 0.2,
      roughness: 0.8
    });

    for (let i = 0; i < TEMPLE_GARDEN_SLOTS.length; i++) {
      const slot = TEMPLE_GARDEN_SLOTS[i];
      const sx = slot.pos?.x ?? slot.x ?? 0;
      const sz = slot.pos?.z ?? slot.z ?? 0;
      const grp = new THREE.Group();
      grp.position.set(sx, 0, sz);
      grp.userData.slotIndex = i;

      const rim = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.34, 2.35), M.stoneLight);
      rim.position.y = 0.17;
      rim.receiveShadow = true;
      rim.castShadow = true;
      grp.add(rim);

      const soil = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.38, 1.96), soilMat);
      soil.position.y = 0.19;
      soil.userData.slotIndex = i;
      grp.add(soil);

      const plantAnchor = new THREE.Group();
      plantAnchor.position.set(0, 0.36, 0);
      grp.add(plantAnchor);

      const plaque = new THREE.Mesh(
        new THREE.BoxGeometry(1.45, 0.32, 0.08),
        new THREE.MeshStandardMaterial({
          map: makeTextTex(slot.label || `Ô Đất ${i + 1}`, {
            w: 440,
            h: 110,
            bg: '#234C2F',
            border: '#E9C46A',
            color: '#FFF6DE',
            size: 32
          })
        })
      );
      plaque.position.set(0, 0.42, 1.18);
      grp.add(plaque);

      const hitBox = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 2.2, 2.5),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      hitBox.position.y = 1.1;
      hitBox.userData.slotIndex = i;
      grp.add(hitBox);

      this.exteriorGroup.add(grp);
      this.addObstacle(sx, sz, 1.35);
      this.gardenPlotGroups.set(i, {
        group: grp,
        soil,
        soilMat,
        readySoilMat,
        plantAnchor,
        slot
      });
      this.gardenPlotClickTargets.push(hitBox);
    }
  },

  syncTempleGardenVisuals(gardenSlots = []) {
    const M = this.MAT;
    for (let i = 0; i < TEMPLE_GARDEN_SLOTS.length; i++) {
      const rec = this.gardenPlotGroups.get(i);
      if (!rec) continue;
      const st = gardenSlots[i] || null;
      while (rec.plantAnchor.children.length > 0) {
        rec.plantAnchor.remove(rec.plantAnchor.children[0]);
      }
      const stage = Math.max(0, Number(st?.stage) || 0);
      const isReady = stage >= 3;
      rec.soil.material = isReady ? rec.readySoilMat : rec.soilMat;
      if (!st || !st.speciesId) {
        // Subtle wooden marker stake showing empty plot ready to sow
        const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.45, 6), M.trunk);
        stake.position.y = 0.22;
        rec.plantAnchor.add(stake);
        continue;
      }

      const treeKey =
        st.speciesId === 'cay_sala'
          ? 'cay_sala'
          : st.speciesId === 'cay_bo_de'
          ? 'cay_bo_de'
          : st.speciesId === 'chum_sen'
          ? 'chum_sen'
          : null;
      if (treeKey && this.propMeshCache[treeKey] && stage >= 1) {
        const targetH =
          treeKey === 'chum_sen'
            ? isReady
              ? 1.18
              : stage === 2
              ? 0.92
              : 0.68
            : isReady
            ? 2.65
            : stage === 2
            ? 1.85
            : 1.12;
        const treeObj = this.fitProp(this.propMeshCache[treeKey], targetH);
        rec.plantAnchor.add(treeObj);
      } else {
        const stemH = isReady ? 1.45 : 0.35 + stage * 0.38;
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.08, stemH, 8), M.trunk);
        stem.position.y = stemH * 0.5;
        rec.plantAnchor.add(stem);
        const leafMat = st.speciesId === 'cay_sala' ? M.foliageLight : st.speciesId === 'chum_sen' ? M.foliageMid : M.foliageDark;
        const crown = new THREE.Mesh(
          new THREE.IcosahedronGeometry(isReady ? 0.62 : 0.24 + stage * 0.14, 2),
          leafMat
        );
        crown.position.y = stemH + 0.14;
        rec.plantAnchor.add(crown);
        if (isReady || st.speciesId === 'chum_sen') {
          const flColor = st.speciesId === 'cay_sala' ? 0xFFB74D : st.speciesId === 'chum_sen' ? 0xF478A8 : 0xFFE066;
          const blossom = new THREE.Mesh(
            new THREE.SphereGeometry(0.16, 10, 8),
            new THREE.MeshStandardMaterial({ color: flColor, emissive: flColor, emissiveIntensity: 0.32, roughness: 0.4 })
          );
          blossom.position.y = stemH + 0.48;
          rec.plantAnchor.add(blossom);
        }
      }
      if (isReady) {
        const halo = new THREE.Mesh(
          new THREE.RingGeometry(0.75, 0.92, 24),
          new THREE.MeshBasicMaterial({ color: 0xFFE17D, transparent: true, opacity: 0.72, side: THREE.DoubleSide })
        );
        halo.rotation.x = -Math.PI / 2;
        halo.position.y = 0.04;
        rec.plantAnchor.add(halo);
      }
    }
    this.renderFrame();
  },

  setTempleStateSync(state = {}) {
    if (Array.isArray(state.collectedLeafIds)) {
      this.syncCourtyardLeaves(state.collectedLeafIds);
    }
    if (Array.isArray(state.gardenSlots)) {
      this.syncTempleGardenVisuals(state.gardenSlots);
    }
  },

  makeCoupletTex(textStr) {
    const c = document.createElement('canvas');
    c.width = 160;
    c.height = 1024;
    const g = c.getContext('2d');
    g.fillStyle = '#1E110B';
    g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = '#D49E3B';
    g.lineWidth = 8;
    g.strokeRect(8, 8, c.width - 16, c.height - 16);
    g.fillStyle = '#F7CA5C';
    g.font = 'bold 64px "Noto Serif SC", "Noto Serif", Georgia, serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const chars = Array.from(textStr);
    const step = (c.height - 120) / Math.max(1, chars.length);
    for (let i = 0; i < chars.length; i++) {
      g.fillText(chars[i], c.width / 2, 72 + step * (i + 0.45));
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  },

  buildInteriorChanhDienV8() {
    buildSquareChanhDienInterior(this, THREE);
  },

  buildStationBeacons() {
    this.stationMarkers = [];
    for (const st of [...PILGRIMAGE_STATIONS, ...DISCOVERY_ZONES]) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.65, 0.92, 32),
        new THREE.MeshBasicMaterial({
          color: st.id >= 100 ? 0x8BE0B0 : 0xFFD166,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.82
        })
      );
      ring.rotation.x = -Math.PI / 2;
      const sx = st.standPos ? st.standPos.x : st.pos.x;
      const sz = st.standPos ? st.standPos.z : st.pos.z;
      ring.position.set(sx, 0.05, sz);
      this.exteriorGroup.add(ring);
      this.stationMarkers.push({ station: st, ring });
    }

    this.walkTargetRing = new THREE.Mesh(
      new THREE.RingGeometry(0.35, 0.58, 24),
      new THREE.MeshBasicMaterial({
        color: 0xFFE066,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.92
      })
    );
    this.walkTargetRing.rotation.x = -Math.PI / 2;
    this.walkTargetRing.visible = false;
    this.scene.add(this.walkTargetRing);
  }
};
