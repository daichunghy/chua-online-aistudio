/**
 * Đợt 2 — Thế Giới Sống & Khí Quyển Điện Ảnh Siêu Thực (Cảm hứng GTA 6):
 * 1. Tia nắng xiên (Volumetric Sunshafts) cho Sáng công phu & Chiều vàng Mỹ Tho
 * 2. Bụi nắng lấp lánh (ban ngày) & Đom đóm Hồ Sen dịu nhẹ (buổi tối) — zero-GC Points
 * 3. Lá Bồ Đề & Cánh hoa giấy rơi lả tả theo chiều gió (zero-GC pooled meshes)
 * 4. Vòng gợn sóng động trên mặt Hồ Sen (cá Koi quẫy đuôi, giọt mưa rơi, rắc thức ăn)
 * 5. Đèn rọi điểm nhấn di sản buổi chiều & tối (Cổng Phụ khảm sành sứ, Mặt tiền Chánh Điện, Di Lặc)
 * 6. Ngồi nghỉ ghế đá & góc máy điện ảnh ngắm cảnh (Diegetic Bench Rest)
 *
 * Mixin của VinhTrang3DWorld. Được gắn vào class qua applyMixins().
 */
import { THREE } from './shared.mjs';
import {
  SCENIC_BENCHES,
  computeAtmosphericLightingParams
} from '../../logic/modules/living-world.mjs';
import { RANDOM_ENCOUNTERS, CONG_QUA_TASKS } from '../../logic/modules/pilgrimage-depth.mjs';

const MAIN_POND_CENTER_X = 3.5;
const MAIN_POND_CENTER_Z = 33.0;
const MAIN_POND_HALF_W = 6.4;
const MAIN_POND_HALF_D = 7.2;
const MAIN_POND_WATER_Y = 0.606;

function makeSoftBeamTex() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.0, 'rgba(255, 224, 152, 0.0)');
  grad.addColorStop(0.18, 'rgba(255, 226, 158, 0.42)');
  grad.addColorStop(0.65, 'rgba(255, 210, 128, 0.22)');
  grad.addColorStop(1.0, 'rgba(255, 198, 112, 0.0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeGlowParticleTex() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0.0, 'rgba(255, 255, 240, 1.0)');
  grad.addColorStop(0.4, 'rgba(255, 236, 165, 0.65)');
  grad.addColorStop(1.0, 'rgba(255, 220, 120, 0.0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export const livingWorld3dMethods = {
  initLivingWorld3D() {
    this._livingWorldState = {
      sunshafts: [],
      dustPoints: null,
      dustSeeds: null,
      dustMat: null,
      driftingLeaves: [],
      pondRipples: [],
      rippleCooldown: 0.4,
      monumentLights: [],
      lastAtmoKey: ''
    };
    this.seatedBench = null;
    this._benchCamOrbitAngle = 0;

    this._buildVolumetricSunshafts();
    // Outdoor floating tiny dust/mote specks intentionally disabled per visual clarity requirement
    this._buildDriftingCourtyardLeaves();
    this._buildLotusPondRipples();
    this._buildEveningMonumentLights();
    this._buildExtraScenicBenchesAndHitboxes();
    this._buildPhase3DepthProps();
    this._syncLivingWorldAtmosphere();
  },

  _buildVolumetricSunshafts() {
    const beamTex = makeSoftBeamTex();
    const beamMat = new THREE.MeshBasicMaterial({
      map: beamTex,
      color: 0xFFD995,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const beamGeo = new THREE.CylinderGeometry(1.15, 3.6, 26, 12, 1, true);
    const placements = [
      { x: 40.5, y: 11.2, z: 38.0, rx: 0.16, rz: -0.34, sc: 1.0 }, // Qua Cổng Phụ Tịnh Độ Huyền Môn
      { x: 23.0, y: 12.2, z: 16.0, rx: 0.14, rz: -0.36, sc: 1.25 }, // Sân trước Chánh Điện 13 vòm
      { x: 4.5, y: 11.5, z: 32.5, rx: 0.12, rz: -0.32, sc: 1.1 }, // Chiếu xiên xuống Hồ Sen
      { x: -24.5, y: 13.5, z: 9.0, rx: 0.16, rz: -0.38, sc: 1.45 }, // Vầng sáng quanh Tượng Phật Di Lặc
      { x: -9.5, y: 13.5, z: -18.0, rx: 0.15, rz: -0.35, sc: 1.3 } // Tượng A Di Đà
    ];
    for (let i = 0; i < placements.length; i++) {
      const p = placements[i];
      const m = new THREE.Mesh(beamGeo, beamMat);
      m.position.set(p.x, p.y, p.z);
      m.rotation.set(p.rx, 0, p.rz);
      m.scale.set(p.sc, 1.0, p.sc);
      m.renderOrder = 3;
      this.exteriorGroup.add(m);
      this._livingWorldState.sunshafts.push({ mesh: m, baseRz: p.rz, phase: i * 1.1 });
    }
    this._livingWorldState.sunshaftMat = beamMat;
  },

  _buildSunlitDustAndFireflies() {
    this._livingWorldState.dustPoints = null;
    this._livingWorldState.dustSeeds = null;
    this._livingWorldState.dustMat = null;
  },

  _buildDriftingCourtyardLeaves() {
    const count = 34;
    const leafGeo = new THREE.PlaneGeometry(0.14, 0.085);
    const palette = [0xE6B948, 0xD9963B, 0xE86A9C, 0xD94E86, 0x8AA64B];
    const mats = palette.map(
      (hex) =>
        new THREE.MeshBasicMaterial({
          color: hex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9
        })
    );
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(leafGeo, mats[i % mats.length]);
      const baseX = i < 16 ? 35.5 + Math.random() * 11.0 : -18 + Math.random() * 54;
      const baseZ = i < 16 ? 12.0 + Math.random() * 34.0 : -12 + Math.random() * 52;
      const y = 0.8 + Math.random() * 6.5;
      mesh.position.set(baseX, y, baseZ);
      this.exteriorGroup.add(mesh);
      this._livingWorldState.driftingLeaves.push({
        mesh,
        baseX,
        baseZ,
        y,
        maxY: 5.5 + (i % 4) * 1.1,
        fallSpeed: 0.36 + (i % 5) * 0.08,
        phase: i * 0.93
      });
    }
  },

  _buildLotusPondRipples() {
    const ringGeo = new THREE.RingGeometry(0.12, 0.17, 24);
    ringGeo.rotateX(-Math.PI / 2);
    for (let i = 0; i < 18; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xE6F8F5,
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(ringGeo, mat);
      mesh.position.set(MAIN_POND_CENTER_X, MAIN_POND_WATER_Y, MAIN_POND_CENTER_Z);
      mesh.visible = false;
      mesh.renderOrder = 3;
      this.exteriorGroup.add(mesh);
      this._livingWorldState.pondRipples.push({
        mesh,
        mat,
        active: false,
        age: 0,
        duration: 1.5,
        maxScale: 4.5
      });
    }
  },

  _spawnPondRipple(wx, wz, { colorHex = 0xE6F8F5, maxScale = 4.6, duration = 1.5 } = {}) {
    const list = this._livingWorldState?.pondRipples;
    if (!list?.length) return;
    for (let i = 0; i < list.length; i++) {
      const r = list[i];
      if (!r.active) {
        r.active = true;
        r.age = 0;
        r.duration = duration;
        r.maxScale = maxScale;
        r.mat.color.setHex(colorHex);
        r.mat.opacity = 0.52;
        r.mesh.position.set(wx, MAIN_POND_WATER_Y, wz);
        r.mesh.scale.setScalar(0.6);
        r.mesh.visible = true;
        return;
      }
    }
  },

  triggerPondFeedingRipples() {
    for (let i = 0; i < 5; i++) {
      const ox = (Math.random() - 0.5) * 4.2;
      const oz = (Math.random() - 0.5) * 4.2;
      this._spawnPondRipple(MAIN_POND_CENTER_X + ox, MAIN_POND_CENTER_Z + oz, {
        colorHex: 0xFFE699,
        maxScale: 6.4,
        duration: 2.1
      });
    }
  },

  _buildEveningMonumentLights() {
    const specs = [
      { x: 40.5, y: 5.4, z: 43.2, color: 0xFFC57A, dist: 24 }, // Cổng Phụ Tịnh Độ Huyền Môn khảm sành sứ
      { x: 23.0, y: 6.8, z: 11.2, color: 0xFFBE6B, dist: 32 }, // Mặt tiền 13 vòm Chánh Điện
      { x: -26.5, y: 5.2, z: 12.2, color: 0xFFD28E, dist: 34 } // Đại tượng Phật Di Lặc
    ];
    for (const sp of specs) {
      const light = new THREE.PointLight(sp.color, 0, sp.dist, 1.5);
      light.position.set(sp.x, sp.y, sp.z);
      this.exteriorGroup.add(light);
      this._livingWorldState.monumentLights.push(light);
    }
  },

  _buildExtraScenicBenchesAndHitboxes() {
    const M = this.MAT;
    if (!this.benchClickTargets) this.benchClickTargets = [];
    const terrazzoSeatMat = new THREE.MeshStandardMaterial({
      color: 0xD8D0C0,
      map: this.pavingTex || null,
      bumpMap: this.pavingBumpTex || null,
      bumpScale: 0.012,
      roughness: 0.42,
      metalness: 0.06
    });
    const benchLegMat = M.stoneDark || new THREE.MeshStandardMaterial({ color: 0x7A7368, roughness: 0.85 });
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    });

    for (const b of SCENIC_BENCHES) {
      if (!b.builtInWorld) {
        const grp = new THREE.Group();
        const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.15, 16), shadowMat);
        shadow.rotation.x = -Math.PI / 2;
        shadow.scale.set(1.2, 0.65, 1);
        shadow.position.y = 0.025;
        grp.add(shadow);

        const seat = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.11, 0.56), terrazzoSeatMat);
        seat.position.y = 0.46;
        seat.castShadow = true;
        seat.receiveShadow = true;
        grp.add(seat);

        const back = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.44, 0.09), terrazzoSeatMat);
        back.position.set(0, 0.72, -0.24);
        back.rotation.x = -0.14;
        back.castShadow = true;
        grp.add(back);

        for (const lx of [-0.74, 0.74]) {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.46, 0.5), benchLegMat);
          leg.position.set(lx, 0.23, 0);
          leg.castShadow = true;
          grp.add(leg);
          const arm = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.18, 0.48), terrazzoSeatMat);
          arm.position.set(lx * 1.18, 0.58, -0.02);
          grp.add(arm);
        }

        grp.position.set(b.x, 0, b.z);
        grp.rotation.y = b.seatYaw;
        this.exteriorGroup.add(grp);
        this.addObstacle(b.x, b.z, 0.72);
      }

      // Click hitbox for every scenic bench (both pre-existing and newly added)
      const hit = new THREE.Mesh(
        new THREE.BoxGeometry(2.15, 1.15, 0.95),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hit.position.set(b.x, 0.58, b.z);
      hit.rotation.y = b.seatYaw;
      hit.userData.benchId = b.id;
      hit.userData.benchName = b.name;
      this.exteriorGroup.add(hit);
      this.benchClickTargets.push(hit);
    }
  },

  _buildPhase3DepthProps() {
    this.depthInteractTargets = [];
    const M = this.MAT;
    const woodMat = M.woodWarm || new THREE.MeshStandardMaterial({ color: 0x6D4525, roughness: 0.72 });
    const goldMat = M.gold || new THREE.MeshStandardMaterial({ color: 0xD8A236, roughness: 0.32, metalness: 0.65 });
    const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xF5EFE2, roughness: 0.35, metalness: 0.05 });
    const jadeMat = new THREE.MeshStandardMaterial({ color: 0x2F6E4A, roughness: 0.45, metalness: 0.1 });
    const clothMat = new THREE.MeshStandardMaterial({ color: 0xC83A28, roughness: 0.8 });

    const registerDepthTarget = (x, z, kind, id, label) => {
      const hit = new THREE.Mesh(
        new THREE.BoxGeometry(1.9, 1.8, 1.9),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hit.position.set(x, 0.9, z);
      hit.userData.depthKind = kind;
      hit.userData.depthId = id;
      hit.userData.depthLabel = label;
      this.exteriorGroup.add(hit);
      this.depthInteractTargets.push(hit);
    };

    // 1. Three Random Encounter grounded story props
    for (const enc of RANDOM_ENCOUNTERS) {
      const grp = new THREE.Group();
      if (enc.id === 'ba_cu_trang_hat') {
        // Dropped wooden Bodhi mala ring & bamboo basket near Lotus Pond
        const mala = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.045, 10, 22), goldMat);
        mala.rotation.x = Math.PI / 2;
        mala.position.set(0, 0.06, 0);
        grp.add(mala);
        const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.2, 0.24, 14), woodMat);
        basket.position.set(0.45, 0.12, -0.2);
        basket.castShadow = true;
        grp.add(basket);
      } else if (enc.id === 'du_khach_quoc_te') {
        // Heritage architecture information lectern beside 13-arch facade courtyard
        const stand = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.05, 0.16), woodMat);
        stand.position.y = 0.52;
        stand.castShadow = true;
        grp.add(stand);
        const board = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.56, 0.06), woodMat);
        board.position.set(0, 1.08, 0);
        board.rotation.x = -0.35;
        board.castShadow = true;
        grp.add(board);
        const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.44, 0.07), ceramicMat);
        plaque.position.set(0, 1.09, 0.01);
        plaque.rotation.x = -0.35;
        grp.add(plaque);
      } else if (enc.id === 'su_thay_tra_sen') {
        // Low lotus tea table with ceramic teapot & two cups near Giảng Đường
        const table = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.52, 0.68), woodMat);
        table.position.y = 0.26;
        table.castShadow = true;
        grp.add(table);
        const pot = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 12), ceramicMat);
        pot.scale.set(1, 0.85, 1);
        pot.position.set(0, 0.61, 0);
        grp.add(pot);
        for (const cx of [-0.24, 0.24]) {
          const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.036, 0.07, 10), ceramicMat);
          cup.position.set(cx, 0.555, 0.12);
          grp.add(cup);
        }
      }
      grp.position.set(enc.pos.x, 0, enc.pos.z);
      this.exteriorGroup.add(grp);
      registerDepthTarget(enc.pos.x, enc.pos.z, 'random_encounter', enc.id, enc.title);
    }

    // 2. Three Công Quả grounded temple service props
    for (const task of CONG_QUA_TASKS) {
      const grp = new THREE.Group();
      if (task.id === 'danh_bong_lu_huong') {
        // Small wooden stool + brass bowl & red polishing cloth near incense burner
        const stool = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.36, 0.42), woodMat);
        stool.position.set(1.25, 0.18, 0.4);
        stool.castShadow = true;
        grp.add(stool);
        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.1, 14), goldMat);
        bowl.position.set(1.16, 0.41, 0.4);
        grp.add(bowl);
        const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.18), clothMat);
        cloth.position.set(1.38, 0.38, 0.42);
        grp.add(cloth);
      } else if (task.id === 'tuoi_vuon_cay_kieng') {
        // Green watering can & terracotta planter pot at Công Viên Vĩnh Tràng
        const can = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.34, 14), jadeMat);
        can.position.set(0, 0.17, 0);
        can.castShadow = true;
        grp.add(can);
        const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.045, 0.36, 8), jadeMat);
        spout.position.set(0.22, 0.24, 0);
        spout.rotation.z = -0.85;
        grp.add(spout);
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.2, 0.36, 14), clothMat);
        pot.position.set(-0.55, 0.18, -0.2);
        pot.castShadow = true;
        grp.add(pot);
      } else if (task.id === 'phu_don_trai_duong') {
        // Wooden dining tray with neat ceramic bowls & kettle outside Trai Đường
        const table = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.72, 0.68), woodMat);
        table.position.y = 0.36;
        table.castShadow = true;
        grp.add(table);
        for (const bx of [-0.3, 0, 0.3]) {
          const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.075, 0.16, 12), ceramicMat);
          stack.position.set(bx, 0.8, 0);
          grp.add(stack);
        }
      }
      grp.position.set(task.pos.x, 0, task.pos.z);
      this.exteriorGroup.add(grp);
      registerDepthTarget(task.pos.x, task.pos.z, 'cong_qua_task', task.id, task.title);
    }
  },

  _syncLivingWorldAtmosphere() {
    const lw = this._livingWorldState;
    if (!lw) return;
    const rain = this.weatherState?.rainIntensity || 0;
    const params = computeAtmosphericLightingParams(this.timeOfDay || 'morning', rain);

    if (lw.sunshaftMat) {
      lw.sunshaftMat.opacity = params.sunshaftOpacity;
      lw.sunshaftMat.color.setHex(this.timeOfDay === 'sunset' ? 0xFFA458 : 0xFFE2A4);
    }
    for (let i = 0; i < lw.sunshafts.length; i++) {
      const s = lw.sunshafts[i];
      s.mesh.visible = params.sunshaftOpacity > 0.01 && !this.inInterior;
      s.mesh.rotation.z = this.timeOfDay === 'sunset' ? -0.52 : s.baseRz;
    }

    if (lw.dustMat) {
      const isFireflies = params.dustMode === 'fireflies';
      lw.dustMat.color.setHex(
        isFireflies ? 0xE2FF7A : this.timeOfDay === 'sunset' ? 0xFFC078 : 0xFFF2C8
      );
      lw.dustMat.size = isFireflies ? 0.34 : 0.22;
      lw.dustMat.opacity = params.dustOpacity;
    }

    for (let i = 0; i < lw.monumentLights.length; i++) {
      lw.monumentLights[i].intensity = this.inInterior ? 0 : params.monumentLightIntensity;
    }
    if (this.MAT?.lanternGlow && !this.inInterior) {
      this.MAT.lanternGlow.emissiveIntensity = params.lanternGlow;
    }
  },

  sitOnScenicBench(benchId) {
    if (this.inInterior) return false;
    const bench = SCENIC_BENCHES.find((b) => b.id === benchId) || SCENIC_BENCHES[0];
    if (!bench) return false;

    this.cancelAutoWalk();
    this.heldDirs.clear();
    this.playerState.moving = false;
    if (this.playerPhysics) {
      this.playerPhysics.vx = 0;
      this.playerPhysics.vz = 0;
      this.playerPhysics.speed = 0;
      this.playerPhysics.actualSpeed = 0;
    }

    // Seat player neatly on the front edge of the granite bench facing outward
    const fwdX = Math.sin(bench.seatYaw);
    const fwdZ = Math.cos(bench.seatYaw);
    this.playerState.x = bench.x + fwdX * 0.14;
    this.playerState.z = bench.z + fwdZ * 0.14;
    this.playerState.yaw = bench.seatYaw;
    this.cameraBaseYaw = bench.seatYaw;
    this.cameraAzimuthOffset = 0;
    this.seatedBench = bench;
    this._benchCamOrbitAngle = 0;

    // Trigger continuous peaceful seated posture
    this.proceduralPoseState = {
      action: 'ngoi_thien',
      timer: 0,
      duration: 9999,
      continuous: true
    };
    if (this.activePlayerRecord) {
      this.playClipCrossfade(this.activePlayerRecord, 'Dung', 0.2, false);
    }

    this.syncPlayerTransform();
    this.onBenchStateChange?.(bench);
    this.renderFrame();
    return true;
  },

  standUpFromBench(silent = false) {
    if (!this.seatedBench) return false;
    const prev = this.seatedBench;
    const fwdX = Math.sin(prev.seatYaw);
    const fwdZ = Math.cos(prev.seatYaw);
    this.seatedBench = null;
    this.playerState.x = prev.x + fwdX * 0.85;
    this.playerState.z = prev.z + fwdZ * 0.85;
    if (this.proceduralPoseState?.action === 'ngoi_thien') {
      this.proceduralPoseState.action = null;
      this.proceduralPoseState.continuous = false;
      this.proceduralPoseState.timer = 0;
    }
    if (this.activePlayerRecord?.root) {
      this.activePlayerRecord.root.position.y = this.activePlayerRecord.baseY || 0;
    }
    this.syncPlayerTransform();
    this.checkStationProximity();
    if (!silent) {
      this.onBenchStateChange?.(null);
    }
    this.renderFrame();
    return true;
  },

  stepLivingWorld3D(dt, elapsed) {
    const lw = this._livingWorldState;
    if (!lw || this.inInterior) return;

    const rain = this.weatherState?.rainIntensity || 0;
    const atmoSig = `${this.timeOfDay}:${Math.round(rain * 10)}`;
    if (lw.lastAtmoKey !== atmoSig) {
      lw.lastAtmoKey = atmoSig;
      this._syncLivingWorldAtmosphere();
    }

    // 1. Subtle breathing shimmer on volumetric sunshafts
    if (lw.sunshaftMat && lw.sunshaftMat.opacity > 0.01) {
      for (let i = 0; i < lw.sunshafts.length; i++) {
        const s = lw.sunshafts[i];
        s.mesh.rotation.y = Math.sin(elapsed * 0.18 + s.phase) * 0.12;
      }
    }

    // 2. Zero-GC sunlit dust motes / evening fireflies around player
    if (lw.dustPoints && lw.dustSeeds && lw.dustMat.opacity > 0.02) {
      const attr = lw.dustPoints.geometry.getAttribute('position');
      const arr = attr.array;
      const seeds = lw.dustSeeds;
      const isFireflies = this.timeOfDay === 'evening';
      const anchorX = isFireflies ? (this.playerState.x * 0.55 + MAIN_POND_CENTER_X * 0.45) : this.playerState.x;
      const anchorZ = isFireflies ? (this.playerState.z * 0.55 + MAIN_POND_CENTER_Z * 0.45) : this.playerState.z;
      const count = seeds.length / 4;
      for (let i = 0; i < count; i++) {
        const ph = seeds[i * 4 + 3];
        const driftX = Math.sin(elapsed * (isFireflies ? 0.85 : 0.35) + ph) * (isFireflies ? 1.4 : 0.7);
        const driftY = Math.cos(elapsed * (isFireflies ? 1.15 : 0.48) + ph * 1.3) * 0.45;
        const driftZ = Math.cos(elapsed * (isFireflies ? 0.72 : 0.31) + ph) * (isFireflies ? 1.4 : 0.7);
        arr[i * 3] = anchorX + seeds[i * 4] + driftX;
        arr[i * 3 + 1] = Math.max(0.45, seeds[i * 4 + 1] + driftY);
        arr[i * 3 + 2] = anchorZ + seeds[i * 4 + 2] + driftZ;
      }
      attr.needsUpdate = true;
    }

    // 3. Drifting golden Bodhi leaves & pink bougainvillea petals in Mekong breeze
    for (let i = 0; i < lw.driftingLeaves.length; i++) {
      const lf = lw.driftingLeaves[i];
      lf.y -= lf.fallSpeed * dt;
      if (lf.y < 0.08) {
        lf.y = lf.maxY;
      }
      const sway = elapsed * 1.35 + lf.phase;
      lf.mesh.position.set(
        lf.baseX + Math.sin(sway) * 1.35,
        lf.y,
        lf.baseZ + Math.cos(sway * 0.8) * 1.15
      );
      lf.mesh.rotation.set(sway * 1.6, sway * 1.1, Math.sin(sway) * 0.9);
    }

    // 4. Lotus Pond dynamic ripples (Koi + Mekong Raindrops)
    lw.rippleCooldown -= dt;
    const rippleInterval = rain > 0.25 ? 0.14 : 0.85;
    if (lw.rippleCooldown <= 0) {
      lw.rippleCooldown = rippleInterval;
      const rx = MAIN_POND_CENTER_X + (Math.random() - 0.5) * (MAIN_POND_HALF_W * 1.8);
      const rz = MAIN_POND_CENTER_Z + (Math.random() - 0.5) * (MAIN_POND_HALF_D * 1.8);
      this._spawnPondRipple(rx, rz, {
        colorHex: rain > 0.25 ? 0xD8EEF8 : 0xE8FBF4,
        maxScale: rain > 0.25 ? 2.6 : 4.2,
        duration: rain > 0.25 ? 0.95 : 1.7
      });
    }
    for (let i = 0; i < lw.pondRipples.length; i++) {
      const r = lw.pondRipples[i];
      if (!r.active) continue;
      r.age += dt;
      const t = r.age / r.duration;
      if (t >= 1) {
        r.active = false;
        r.mesh.visible = false;
      } else {
        const sc = 0.55 + t * r.maxScale;
        r.mesh.scale.setScalar(sc);
        r.mat.opacity = (1 - t) * (1 - t) * 0.48;
      }
    }

    // 5. Slow cinematic orbit while seated on a scenic bench
    if (this.seatedBench) {
      this._benchCamOrbitAngle += dt * 0.18;
      this.syncPlayerTransform();
    }
  }
};
