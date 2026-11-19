/**
 * Hiệu ứng nghi lễ Dâng hương & Dâng hoa sen 3D mượt mà (ngoài sân lẫn trong Chánh điện).
 *
 * Mixin của VinhTrang3DWorld: startIncenseOfferingSequence, startLotusOfferingSequence,
 * stepOfferingAnimations. Được gắn vào class qua applyMixins().
 */
import { THREE } from './shared.mjs';

// Scratch vectors dùng lại hoàn toàn — tuyệt đối không tạo Vector3 mới trong animate()
const _vStart = new THREE.Vector3();
const _vCtrl = new THREE.Vector3();
const _vEnd = new THREE.Vector3();
const _vPos = new THREE.Vector3();

const EXTERIOR_BURNERS = [
  { x: 23.0, y: 1.38, z: 12.0 }, // Lư hương chính Sân Cờ
  { x: 15.8, y: 1.05, z: 17.5 }, // Lư hương Phật A Di Đà
  { x: -24.5, y: 2.85, z: 17.2 }, // Lư hương Phật Di Lặc
  { x: -24.5, y: 0.95, z: -13.5 }, // Lư hương Phật Niết Bàn
  { x: 34.5, y: 0.88, z: 22.5 } // Lư hương Đài Quán Âm
];

const INTERIOR_BURNERS = [
  { x: -32.24, y: 1.38, z: 0.0 }, // Bàn thờ Tam Bảo (Chánh Điện chính cạnh Tây)
  { x: -2.0, y: 1.36, z: -18.83 }, // Bàn thờ Tổ Đạt Ma (Tổ Đường cạnh Bắc)
  { x: 22.42, y: 1.24, z: 12.6 }, // Hộ Pháp Vi Đà
  { x: 22.42, y: 1.24, z: 6.2 }, // Phật Bà Nghìn Mắt Nghìn Tay
  { x: 22.42, y: 1.24, z: -0.2 }, // Quán Thế Âm Nam Hải
  { x: 22.36, y: 1.18, z: -6.6 }, // Chỗ Ngủ Của Phật
  { x: 22.42, y: 1.24, z: -13.0 }, // Phật A Di Đà
  { x: 22.42, y: 1.24, z: -19.4 }, // Phật Di Lặc
  { x: 22.42, y: 1.24, z: -25.8 }, // Phật Dược Sư
  { x: 22.42, y: 1.24, z: -32.2 } // Tiêu Diện Đại Sĩ
];

function findNearestPoint(px, pz, list, maxDist = Infinity) {
  let best = list[0];
  let bestD = Infinity;
  for (let i = 0; i < list.length; i++) {
    const pt = list[i];
    const d = Math.hypot(pt.x - px, pt.z - pz);
    if (d < bestD) {
      bestD = d;
      best = pt;
    }
  }
  return bestD <= maxDist ? best : list[0];
}

function disposeTempGroup(group) {
  if (!group) return;
  if (group.parent) group.parent.remove(group);
  group.traverse((obj) => {
    if (obj.isMesh && obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose?.());
      else obj.material.dispose?.();
    }
  });
}

export const offeringRitualFxMethods = {
  _ensureInteriorOfferingGroups() {
    if (!this.interiorIncenseGroup) {
      this.interiorIncenseGroup = new THREE.Group();
      this.interiorGroup.add(this.interiorIncenseGroup);
    } else if (!this.interiorIncenseGroup.parent) {
      this.interiorGroup.add(this.interiorIncenseGroup);
    }

    if (!this.interiorOfferedLotusesGroup) {
      this.interiorOfferedLotusesGroup = new THREE.Group();
      this.interiorGroup.add(this.interiorOfferedLotusesGroup);
    } else if (!this.interiorOfferedLotusesGroup.parent) {
      this.interiorGroup.add(this.interiorOfferedLotusesGroup);
    }
  },

  _getHandStartWorldPos(outVec) {
    const px = this.playerState.x || 0;
    const pz = this.playerState.z || 0;
    const yaw = this.playerState.yaw || 0;
    const baseY = this.playerElevationY || 0;
    // Điểm trước ngực / hai bàn tay chắp của nhân vật
    outVec.set(
      px + Math.sin(yaw) * 0.42,
      baseY + 1.18,
      pz + Math.cos(yaw) * 0.42
    );
    return outVec;
  },

  _commitPermanentIncenseCluster(targetWorld, inInterior) {
    if (inInterior) {
      this._ensureInteriorOfferingGroups();
      const grp = this.interiorIncenseGroup;
      while (grp.children.length >= 10) {
        grp.remove(grp.children[0]);
      }
      const n = grp.children.length;
      const cluster = new THREE.Group();
      for (let i = -1; i <= 1; i++) {
        const stick = new THREE.Group();
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.009, 0.009, 0.36, 6),
          new THREE.MeshStandardMaterial({ color: 0xA8241C, roughness: 0.72 })
        );
        stem.position.y = 0.18;
        stick.add(stem);
        const tip = new THREE.Mesh(
          new THREE.SphereGeometry(0.018, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0xFF7034 })
        );
        tip.position.y = 0.36;
        stick.add(tip);
        stick.position.x = i * 0.028;
        stick.rotation.z = i * -0.05;
        cluster.add(stick);
      }
      const spreadX = ((n % 5) - 2) * 0.09;
      const spreadZ = (Math.floor(n / 5) - 0.5) * 0.07;
      cluster.position.set(targetWorld.x + spreadX, targetWorld.y, targetWorld.z + spreadZ);
      grp.add(cluster);
      return;
    }

    // Exterior: ưu tiên giữ số nén hương vừa mắt trên lư hương
    const grp = this.incenseSticksGroup;
    while (grp.children.length >= 14) {
      grp.remove(grp.children[0]);
    }
    const basePos = grp.position;
    const n = grp.children.length;
    const cluster = new THREE.Group();
    for (let i = -1; i <= 1; i++) {
      const stick = new THREE.Group();
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.011, 0.011, 0.44, 6),
        new THREE.MeshStandardMaterial({ color: 0xA8241C, roughness: 0.72 })
      );
      stem.position.y = 0.22;
      stick.add(stem);
      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.021, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xFF6A2B })
      );
      tip.position.y = 0.44;
      stick.add(tip);
      stick.position.x = i * 0.032;
      stick.rotation.z = i * -0.055;
      cluster.add(stick);
    }
    const ox = targetWorld.x - basePos.x + ((n % 5) - 2) * 0.07;
    const oy = targetWorld.y - basePos.y;
    const oz = targetWorld.z - basePos.z + (Math.floor(n / 5) - 1) * 0.06;
    cluster.position.set(ox, oy, oz);
    grp.add(cluster);
  },

  _commitPermanentLotus(targetWorld, inInterior) {
    const fl = this.makeLotusFlower3D(false, true);
    if (inInterior) {
      this._ensureInteriorOfferingGroups();
      const grp = this.interiorOfferedLotusesGroup;
      while (grp.children.length >= 8) {
        grp.remove(grp.children[0]);
      }
      const sc = targetWorld.onPond ? 1.45 : 1.35;
      fl.scale.setScalar(sc);
      fl.position.set(targetWorld.x, targetWorld.y, targetWorld.z);
      if (this.pondLotusAnims.length > 0) {
        this.pondLotusAnims[this.pondLotusAnims.length - 1].baseScale = sc;
      }
      grp.add(fl);
      return;
    }

    const grp = this.offeredLotusesGroup;
    while (grp.children.length >= 10) {
      grp.remove(grp.children[0]);
    }
    fl.scale.setScalar(1.85);
    fl.position.set(
      targetWorld.x - grp.position.x,
      targetWorld.y - grp.position.y,
      targetWorld.z - grp.position.z
    );
    if (this.pondLotusAnims.length > 0) {
      this.pondLotusAnims[this.pondLotusAnims.length - 1].baseScale = 1.85;
    }
    grp.add(fl);
  },

  startIncenseOfferingSequence() {
    if (!this.activeOfferingAnimations) this.activeOfferingAnimations = [];
    if (this.activeOfferingAnimations.some((a) => a.type === 'incense' && a.timer < 0.4)) {
      return;
    }
    this.triggerActionAnimation('Thắp nhang');

    const inInterior = Boolean(this.inInterior);
    const px = this.playerState.x || 0;
    const pz = this.playerState.z || 0;
    const yaw = this.playerState.yaw || 0;
    const rawTarget = inInterior
      ? findNearestPoint(px, pz, INTERIOR_BURNERS, 18)
      : findNearestPoint(px, pz, EXTERIOR_BURNERS, 26);

    this._getHandStartWorldPos(_vStart);
    const start = { x: _vStart.x, y: _vStart.y, z: _vStart.z };

    // Nếu người chơi đứng quá xa lư hương, tạo điểm xuất phát gần tầm nhìn hơn một chút để quỹ đạo bay rõ đẹp trong khung hình
    const dTotal = Math.hypot(rawTarget.x - start.x, rawTarget.z - start.z);
    if (dTotal > 18) {
      const k = (dTotal - 14) / dTotal;
      start.x += (rawTarget.x - start.x) * k;
      start.z += (rawTarget.z - start.z) * k;
    }

    const slotJitter = ((this.incenseSticksGroup?.children?.length || 0) % 5) - 2;
    const end = {
      x: rawTarget.x + slotJitter * 0.05,
      y: rawTarget.y,
      z: rawTarget.z + (slotJitter % 2) * 0.04
    };
    const ctrl = {
      x: (start.x + end.x) * 0.5,
      y: Math.max(start.y, end.y) + 1.05,
      z: (start.z + end.z) * 0.5
    };

    const fxGroup = new THREE.Group();
    const bundle = new THREE.Group();
    const emberMats = [];
    for (let i = -1; i <= 1; i++) {
      const stick = new THREE.Group();
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.44, 6),
        new THREE.MeshStandardMaterial({ color: 0xAA261D, roughness: 0.7 })
      );
      stem.position.y = 0.22;
      stick.add(stem);

      const emberMat = new THREE.MeshBasicMaterial({ color: 0xFF7A33 });
      emberMats.push(emberMat);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 6), emberMat);
      tip.position.y = 0.44;
      stick.add(tip);

      stick.position.x = i * 0.032;
      stick.rotation.z = i * -0.06;
      bundle.add(stick);
    }

    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xFFB74D,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), haloMat);
    halo.position.y = 0.45;
    bundle.add(halo);

    const glowLight = new THREE.PointLight(0xFFB35C, 0.85, 8.5, 1.5);
    glowLight.position.set(0, 0.48, 0);
    bundle.add(glowLight);

    bundle.position.set(start.x, start.y, start.z);
    bundle.rotation.y = yaw;
    fxGroup.add(bundle);

    // 14 hạt khói trầm hương uốn lượn bay lên nhẹ nhàng khi cắm nhang
    const puffs = [];
    for (let i = 0; i < 14; i++) {
      const pMat = new THREE.MeshBasicMaterial({
        color: 0xF5EFE6,
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.055 + (i % 3) * 0.018, 7, 6), pMat);
      puff.visible = false;
      fxGroup.add(puff);
      puffs.push({
        mesh: puff,
        mat: pMat,
        delay: 1.38 + i * 0.09,
        life: 1.55 + (i % 4) * 0.22,
        phase: i * 0.85,
        driftX: ((i % 3) - 1) * 0.14
      });
    }

    const parentGroup = inInterior ? this.interiorGroup : this.exteriorGroup;
    parentGroup.add(fxGroup);

    this.activeOfferingAnimations.push({
      type: 'incense',
      inInterior,
      timer: 0,
      duration: 3.1,
      committed: false,
      fxGroup,
      bundle,
      halo,
      haloMat,
      glowLight,
      emberMats,
      puffs,
      start,
      ctrl,
      end,
      baseYaw: yaw
    });
  },

  startLotusOfferingSequence() {
    if (!this.activeOfferingAnimations) this.activeOfferingAnimations = [];
    if (this.activeOfferingAnimations.some((a) => a.type === 'lotus' && a.timer < 0.4)) {
      return;
    }
    this.triggerActionAnimation('Chắp tay');
    this.lotusBloomState.active = true;
    this.lotusBloomState.timer = 0;

    const inInterior = Boolean(this.inInterior);
    const px = this.playerState.x || 0;
    const pz = this.playerState.z || 0;
    const yaw = this.playerState.yaw || 0;

    this._getHandStartWorldPos(_vStart);
    const start = { x: _vStart.x, y: _vStart.y - 0.06, z: _vStart.z };

    let targetWorld;
    if (inInterior) {
      const distCenter = Math.hypot(px, pz);
      const nInt = this.interiorOfferedLotusesGroup?.children?.length || 0;
      if (distCenter < 11.5) {
        // Thả nhẹ xuống mặt nước Hồ Sen Bộ trung tâm (tránh hòn non bộ trung tâm bán kính ~2.1m)
        const ang = ((nInt % 8) / 8) * Math.PI * 2 + 0.35;
        const rad = 3.1 + (nInt % 2) * 0.85;
        targetWorld = {
          x: Math.cos(ang) * rad,
          y: 0.51,
          z: Math.sin(ang) * rad,
          onPond: true
        };
      } else {
        // Dâng lên hai bên mặt bàn thờ Tam Bảo
        const side = nInt % 2 === 0 ? -1 : 1;
        targetWorld = {
          x: side * (1.28 + Math.floor(nInt / 2) * 0.28),
          y: 1.44,
          z: -16.88,
          onPond: false
        };
      }
    } else {
      const nExt = this.offeredLotusesGroup?.children?.length || 0;
      targetWorld = {
        x: 5.4 + ((nExt % 4) - 1.5) * 0.65,
        y: 0.63,
        z: 33.0 + (Math.floor(nExt / 4) - 1) * 0.65,
        onPond: true
      };
      // Nếu đứng xa hồ sen chính, rút ngắn đoạn khởi đầu để người chơi luôn thấy đóa sen bay đến hồ
      const dTotal = Math.hypot(targetWorld.x - start.x, targetWorld.z - start.z);
      if (dTotal > 18) {
        const k = (dTotal - 14) / dTotal;
        start.x += (targetWorld.x - start.x) * k;
        start.z += (targetWorld.z - start.z) * k;
      }
    }

    const ctrl = {
      x: (start.x + targetWorld.x) * 0.5,
      y: Math.max(start.y, targetWorld.y) + 1.35,
      z: (start.z + targetWorld.z) * 0.5
    };

    const fxGroup = new THREE.Group();
    const lotus = this.makeLotusFlower3D(false, false);
    const targetScale = inInterior ? (targetWorld.onPond ? 1.45 : 1.35) : 1.85;
    lotus.scale.setScalar(targetScale * 0.68);
    lotus.position.set(start.x, start.y, start.z);
    fxGroup.add(lotus);

    // Khép búp nụ sen ban đầu rồi hé nở dọc đường dâng hoa
    const refs = lotus.userData?.lotusAnimRefs;
    if (refs) {
      for (const p of refs.outerPivots) p.rotation.x = 0.14;
      for (const p of refs.innerPivots) p.rotation.x = 0.08;
    }

    const glowLight = new THREE.PointLight(0xFFD685, 0.9, 10, 1.4);
    glowLight.position.set(0, 0.25, 0);
    lotus.add(glowLight);

    // 2 vòng gợn sóng vàng-hồng tỏa ra khi hoa sen chạm mặt nước / bệ thờ
    const ripples = [];
    for (let ri = 0; ri < 2; ri++) {
      const rMat = new THREE.MeshBasicMaterial({
        color: ri === 0 ? 0xFFE39B : 0xFF9AC0,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.28, 32), rMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(targetWorld.x, targetWorld.y + 0.03, targetWorld.z);
      ring.visible = false;
      fxGroup.add(ring);
      ripples.push({ mesh: ring, mat: rMat, delay: 1.56 + ri * 0.28 });
    }

    // 10 hạt sáng vàng kim bừng nhẹ lên trời
    const motes = [];
    for (let mi = 0; mi < 10; mi++) {
      const mMat = new THREE.MeshBasicMaterial({
        color: mi % 2 === 0 ? 0xFFE38C : 0xFFB0CE,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const mote = new THREE.Mesh(new THREE.SphereGeometry(0.038, 6, 5), mMat);
      mote.visible = false;
      fxGroup.add(mote);
      const ang = (mi / 10) * Math.PI * 2;
      motes.push({
        mesh: mote,
        mat: mMat,
        ang,
        rad: 0.25 + (mi % 3) * 0.18,
        speedY: 0.65 + (mi % 4) * 0.18,
        delay: 1.42 + mi * 0.06
      });
    }

    const parentGroup = inInterior ? this.interiorGroup : this.exteriorGroup;
    parentGroup.add(fxGroup);

    this.activeOfferingAnimations.push({
      type: 'lotus',
      inInterior,
      timer: 0,
      duration: 3.2,
      committed: false,
      fxGroup,
      lotus,
      refs,
      targetScale,
      glowLight,
      ripples,
      motes,
      start,
      ctrl,
      end: targetWorld,
      baseYaw: yaw
    });
  },

  stepOfferingAnimations(dt = 0.016) {
    const list = this.activeOfferingAnimations;
    if (!list || list.length === 0) return;

    for (let idx = list.length - 1; idx >= 0; idx--) {
      const fx = list[idx];
      fx.timer += dt;
      const t = fx.timer;

      if (fx.type === 'incense') {
        if (t < 0.52) {
          // Giai đoạn 1: nâng nhang ngang trán khấn nguyện & hơi cúi nhẹ
          const u = Math.min(1, t / 0.52);
          const ease = u * u * (3 - 2 * u);
          fx.bundle.position.set(
            fx.start.x,
            fx.start.y + ease * 0.42,
            fx.start.z
          );
          fx.bundle.rotation.x = THREE.MathUtils.lerp(0.55, 0.16, ease);
          fx.glowLight.intensity = 0.65 + ease * 0.45;
        } else if (t < 1.48) {
          // Giai đoạn 2: lướt cong êm ái đến lư hương
          const rawU = Math.min(1, (t - 0.52) / 0.96);
          const u = rawU * rawU * (3 - 2 * rawU);
          _vStart.set(fx.start.x, fx.start.y + 0.42, fx.start.z);
          _vCtrl.set(fx.ctrl.x, fx.ctrl.y, fx.ctrl.z);
          _vEnd.set(fx.end.x, fx.end.y + 0.16, fx.end.z);

          const inv = 1 - u;
          _vPos
            .copy(_vStart).multiplyScalar(inv * inv)
            .addScaledVector(_vCtrl, 2 * inv * u)
            .addScaledVector(_vEnd, u * u);
          fx.bundle.position.copy(_vPos);
          fx.bundle.rotation.x = THREE.MathUtils.lerp(0.16, 0, u);
          fx.glowLight.intensity = 1.1 + Math.sin(u * Math.PI) * 0.9;
        } else {
          // Giai đoạn 3: cắm êm xuống tro hương + tỏa sáng + làn khói uốn lượn
          const settleU = Math.min(1, (t - 1.48) / 0.24);
          const settleEase = 1 - Math.pow(1 - settleU, 3);
          const dropY = THREE.MathUtils.lerp(fx.end.y + 0.16, fx.end.y, settleEase);
          fx.bundle.position.set(fx.end.x, dropY, fx.end.z);
          fx.bundle.rotation.x = 0;

          if (!fx.committed && settleU >= 1) {
            fx.committed = true;
            this._commitPermanentIncenseCluster(fx.end, fx.inInterior);
            fx.bundle.visible = false;
          }

          const fadeAfter = Math.max(0, 1 - (t - 1.48) / 1.4);
          fx.glowLight.intensity = 1.85 * fadeAfter;
          fx.haloMat.opacity = 0.52 * fadeAfter;
          fx.halo.scale.setScalar(1 + (1 - fadeAfter) * 1.4);
        }

        // Cập nhật 14 làn khói bay bổng
        for (let pi = 0; pi < fx.puffs.length; pi++) {
          const p = fx.puffs[pi];
          const age = t - p.delay;
          if (age < 0 || age > p.life) {
            p.mesh.visible = false;
            continue;
          }
          p.mesh.visible = true;
          const pu = age / p.life;
          p.mesh.position.set(
            fx.end.x + Math.sin(pu * 4.5 + p.phase) * 0.08 + p.driftX * pu,
            fx.end.y + 0.46 + pu * 1.45,
            fx.end.z + Math.cos(pu * 3.8 + p.phase) * 0.07
          );
          p.mesh.scale.setScalar(0.75 + pu * 1.65);
          p.mat.opacity = Math.sin(pu * Math.PI) * 0.42;
        }
      } else if (fx.type === 'lotus') {
        if (t < 0.45) {
          const u = Math.min(1, t / 0.45);
          const ease = u * u * (3 - 2 * u);
          fx.lotus.position.set(fx.start.x, fx.start.y + ease * 0.36, fx.start.z);
          const sc = THREE.MathUtils.lerp(fx.targetScale * 0.68, fx.targetScale * 0.85, ease);
          fx.lotus.scale.setScalar(sc);
          fx.lotus.rotation.y = ease * 0.6;
        } else if (t < 1.56) {
          const rawU = Math.min(1, (t - 0.45) / 1.11);
          const u = rawU * rawU * (3 - 2 * rawU);
          _vStart.set(fx.start.x, fx.start.y + 0.36, fx.start.z);
          _vCtrl.set(fx.ctrl.x, fx.ctrl.y, fx.ctrl.z);
          _vEnd.set(fx.end.x, fx.end.y + 0.04, fx.end.z);

          const inv = 1 - u;
          _vPos
            .copy(_vStart).multiplyScalar(inv * inv)
            .addScaledVector(_vCtrl, 2 * inv * u)
            .addScaledVector(_vEnd, u * u);
          fx.lotus.position.copy(_vPos);
          fx.lotus.rotation.y = 0.6 + u * Math.PI * 1.4;
          fx.lotus.scale.setScalar(THREE.MathUtils.lerp(fx.targetScale * 0.85, fx.targetScale, u));

          // Hé nở dần từng lớp cánh sen mượt mà
          if (fx.refs) {
            const outerA = THREE.MathUtils.lerp(0.14, 0.96, u);
            const innerA = THREE.MathUtils.lerp(0.08, 0.58, u);
            for (const p of fx.refs.outerPivots) p.rotation.x = outerA;
            for (const p of fx.refs.innerPivots) p.rotation.x = innerA;
            fx.refs.petalMat.emissiveIntensity = 0.08 + u * 0.62;
            fx.refs.innerMat.emissiveIntensity = 0.1 + u * 0.72;
            fx.refs.centerMat.emissiveIntensity = 0.15 + u * 0.85;
          }
          fx.glowLight.intensity = 1.1 + u * 1.35;
        } else {
          const postU = Math.min(1, (t - 1.56) / 1.5);
          fx.lotus.position.set(
            fx.end.x,
            fx.end.y + Math.sin(postU * Math.PI * 2) * (fx.end.onPond ? 0.025 : 0.008),
            fx.end.z
          );
          if (!fx.committed && t >= 1.72) {
            fx.committed = true;
            this._commitPermanentLotus(fx.end, fx.inInterior);
            fx.lotus.visible = false;
          }
          fx.glowLight.intensity = 2.4 * Math.max(0, 1 - postU * 1.15);
        }

        // Gợn sóng mặt nước / vòng hào quang tỏa tròn
        for (let ri = 0; ri < fx.ripples.length; ri++) {
          const r = fx.ripples[ri];
          const rage = t - r.delay;
          if (rage < 0 || rage > 1.35) {
            r.mesh.visible = false;
            continue;
          }
          r.mesh.visible = true;
          const ru = rage / 1.35;
          r.mesh.scale.setScalar(1 + ru * 4.8);
          r.mat.opacity = (1 - ru) * 0.72;
        }

        // Hạt sáng vàng kim bay nhẹ lên
        for (let mi = 0; mi < fx.motes.length; mi++) {
          const m = fx.motes[mi];
          const mage = t - m.delay;
          if (mage < 0 || mage > 1.45) {
            m.mesh.visible = false;
            continue;
          }
          m.mesh.visible = true;
          const mu = mage / 1.45;
          const rad = m.rad + mu * 0.55;
          const a = m.ang + mu * 1.6;
          m.mesh.position.set(
            fx.end.x + Math.cos(a) * rad,
            fx.end.y + 0.14 + mu * m.speedY * 1.6,
            fx.end.z + Math.sin(a) * rad
          );
          m.mat.opacity = Math.sin(mu * Math.PI) * 0.88;
        }
      }

      if (t >= fx.duration) {
        disposeTempGroup(fx.fxGroup);
        list.splice(idx, 1);
      }
    }
  }
};
