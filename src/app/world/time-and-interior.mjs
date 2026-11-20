/**
 * Giờ trong ngày, không khí nội thất, vào/ra Chánh điện, chuyển khu trong điện.
 *
 * Mixin của VinhTrang3DWorld: 13 method (setLectureHallMode … goToInteriorZone).
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, findAnyTempleDestination } from './shared.mjs';

export const timeAndInteriorMethods = {
  setLectureHallMode(enabled = false) {
    const next = Boolean(enabled);
    if (this.lectureHallMode === next) return;
    this.lectureHallMode = next;
    if (!next) {
      this.renderFrame();
    }
  },

  setTimeOfDay(presetKey = 'morning', immediate = false) {
    const key = ['morning', 'midday', 'sunset', 'evening'].includes(presetKey) ? presetKey : 'morning';
    this.timeOfDay = key;

    const cfg =
      key === 'evening'
        ? {
            bg: 0x111E3B,
            fogColor: 0x15223D,
            fogDensity: 0.0046,
            hemiSky: 0x4A639E,
            hemiGround: 0x261E18,
            hemiIntensity: 0.72,
            sunColor: 0x9BB5EA,
            sunIntensity: 0.78,
            sunPos: [26, 34, -22],
            fillColor: 0xFFB86C,
            fillIntensity: 0.42,
            exposure: 0.98,
            lanternEmissive: 1.65,
            porchIntensity: 7.4,
            interiorBoost: 1.32
          }
        : key === 'sunset'
        ? {
            bg: 0xD8875E,
            fogColor: 0xE29E6E,
            fogDensity: 0.0036,
            hemiSky: 0x93A6D6,
            hemiGround: 0x5E3B24,
            hemiIntensity: 1.06,
            sunColor: 0xFF9F54,
            sunIntensity: 2.08,
            sunPos: [-48, 13.5, 22],
            fillColor: 0xFFC582,
            fillIntensity: 0.56,
            exposure: 1.06,
            lanternEmissive: 0.95,
            porchIntensity: 6.2,
            interiorBoost: 1.15
          }
        : key === 'midday'
        ? {
            bg: 0x8FC7F6,
            fogColor: 0xDCEBFA,
            fogDensity: 0.0022,
            hemiSky: 0xDFF2FF,
            hemiGround: 0x8C7052,
            hemiIntensity: 1.32,
            sunColor: 0xFFF6E0,
            sunIntensity: 2.15,
            sunPos: [10, 56, 18],
            fillColor: 0xFFFFFF,
            fillIntensity: 0.62,
            exposure: 1.12,
            lanternEmissive: 0.18,
            porchIntensity: 2.0,
            interiorBoost: 1.0
          }
        : {
            bg: 0xA6D0F0,
            fogColor: 0xEADBC4,
            fogDensity: 0.0033,
            hemiSky: 0xBFE2FF,
            hemiGround: 0x7A5E3E,
            hemiIntensity: 1.18,
            sunColor: 0xFFD99E,
            sunIntensity: 1.82,
            sunPos: [-34, 24, 24],
            fillColor: 0xFFF3D8,
            fillIntensity: 0.48,
            exposure: 1.08,
            lanternEmissive: 0.55,
            porchIntensity: 4.8,
            interiorBoost: 1.0
          };

    if (this.scene.background?.setHex) this.scene.background.setHex(cfg.bg);
    if (this.scene.fog) {
      this.scene.fog.color?.setHex(cfg.fogColor);
      this.scene.fog.density = cfg.fogDensity;
    }
    if (this.hemiLight) {
      this.hemiLight.color.setHex(cfg.hemiSky);
      this.hemiLight.groundColor.setHex(cfg.hemiGround);
      this.hemiLight.intensity = cfg.hemiIntensity;
    }
    if (this.sunLight) {
      this.sunLight.color.setHex(cfg.sunColor);
      this.sunLight.intensity = cfg.sunIntensity;
      this.sunLight.position.set(cfg.sunPos[0], cfg.sunPos[1], cfg.sunPos[2]);
    }
    if (this.frontFillLight) {
      this.frontFillLight.color.setHex(cfg.fillColor);
      this.frontFillLight.intensity = cfg.fillIntensity;
    }
    if (this.renderer) {
      this.renderer.toneMappingExposure = cfg.exposure;
    }
    if (this.skyDome?.material) {
      const nextSky = this._buildSkyTextureForPreset(key);
      if (this.skyDome.material.map !== nextSky) {
        this.skyDome.material.map = nextSky;
        this.skyDome.material.needsUpdate = true;
      }
    }
    if (this.MAT?.lanternGlow) {
      this.MAT.lanternGlow.emissiveIntensity = cfg.lanternEmissive;
    }
    if (this.porchGlowLight) {
      this.porchGlowLight.intensity = cfg.porchIntensity;
    }
    this.interiorGroup?.traverse?.((o) => {
      if (o.isPointLight) {
        if (typeof o.userData.baseIntensity !== 'number') {
          o.userData.baseIntensity = o.intensity;
        }
        o.intensity = o.userData.baseIntensity * cfg.interiorBoost;
      }
    });
    if (!this.inInterior || this.interiorCutaway) {
      const targetEnv =
        key === 'sunset' && this.sunsetEnvTex
          ? this.sunsetEnvTex
          : key === 'evening' && this.eveningEnvTex
          ? this.eveningEnvTex
          : this.exteriorEnvTex;
      if (targetEnv) this.scene.environment = targetEnv;
    }
    if (this.inInterior && !this.interiorCutaway) {
      this.applyInteriorAtmosphere();
    } else {
      this._applyWeatherVisuals?.(true);
      this._syncLivingWorldAtmosphere?.();
    }
    if (immediate || !this.lectureHallMode) {
      this.renderFrame();
    }
  },

  applyInteriorAtmosphere() {
    if (!this.inInterior || this.interiorCutaway) return;
    if (this.interiorEnvTex) {
      this.scene.environment = this.interiorEnvTex;
    }
    if (this.scene.background?.setHex) this.scene.background.setHex(0x1C110A);
    if (this.scene.fog) {
      this.scene.fog.color?.setHex(0x2B1A0F);
      this.scene.fog.density = 0.0028;
    }
    if (this.hemiLight) {
      this.hemiLight.color.setHex(0xFFE7C2);
      this.hemiLight.groundColor.setHex(0x825735);
      this.hemiLight.intensity = 1.52;
    }
    if (this.sunLight) {
      this.sunLight.color.setHex(0xFFE8BF);
      this.sunLight.intensity = 0.88;
      this.sunLight.position.set(2, 46, 2);
    }
    if (this.frontFillLight) {
      this.frontFillLight.color.setHex(0xFFD094);
      this.frontFillLight.intensity = 0.48;
    }
    if (this.renderer) {
      this.renderer.toneMappingExposure = 1.08;
    }
  },

  updateBlessingTowerNameBoard(entries = []) {
    const canvas = this._blessingTowerBoardCanvas;
    const tex = this.blessingTowerNameBoardTex;
    if (!canvas || !tex) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#4B120C';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#E8BE52';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    ctx.fillStyle = '#FFE8A3';
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillText('BẢNG GHI TÊN CẦU AN', w / 2, 64);

    ctx.fillStyle = '#E8BE52';
    ctx.font = '600 18px sans-serif';
    const list = Array.isArray(entries) ? entries : [];
    ctx.fillText(`Đã thắp sáng ${list.length} / 108 ô đèn`, w / 2, 96);

    ctx.strokeStyle = 'rgba(232, 190, 82, 0.45)';
    ctx.beginPath();
    ctx.moveTo(42, 114);
    ctx.lineTo(w - 42, 114);
    ctx.stroke();

    ctx.textAlign = 'left';
    const visible = list.slice(0, 8);
    if (!visible.length) {
      ctx.fillStyle = '#F7E7C4';
      ctx.textAlign = 'center';
      ctx.font = 'italic 20px Georgia, serif';
      ctx.fillText('Chạm vào Tháp để ghi tên cầu bình an', w / 2, 260);
    } else {
      visible.forEach((item, idx) => {
        const y = 152 + idx * 46;
        ctx.fillStyle = item.isUserOwned ? '#FFD966' : '#FFF4DC';
        ctx.font = item.isUserOwned ? 'bold 21px sans-serif' : '600 19px sans-serif';
        const rawName = String(item.devoteeName || 'Phật tử').slice(0, 26);
        const slotTag = `#${item.slotNumber || idx + 1}`;
        ctx.fillText(`${slotTag} · ${rawName}`, 36, y);

        ctx.fillStyle = 'rgba(255, 232, 178, 0.72)';
        ctx.font = '14px sans-serif';
        const sub = item.familyNote
          ? String(item.familyNote).slice(0, 38)
          : String(item.wishText || 'Cầu bình an').slice(0, 38);
        ctx.fillText(sub, 36, y + 18);
      });
    }

    ctx.fillStyle = '#F0C968';
    ctx.textAlign = 'center';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText('[E] hoặc Chạm Tháp để Ghi Tên Cầu Phước', w / 2, h - 32);

    tex.needsUpdate = true;
  },

  syncBlessingTowerLamps(entries = []) {
    this.updateBlessingTowerNameBoard(entries);
    if (!Array.isArray(this.blessingTowerLampMeshes) || !this.blessingTowerLampMeshes.length) return;
    const bySlot = new Map();
    for (const item of Array.isArray(entries) ? entries : []) {
      const slot = Number(item?.slotNumber);
      if (Number.isFinite(slot) && slot >= 1 && slot <= 108 && !bySlot.has(slot)) {
        bySlot.set(slot, item);
      }
    }
    for (let i = 0; i < this.blessingTowerLampMeshes.length; i++) {
      const mesh = this.blessingTowerLampMeshes[i];
      const slot = mesh.userData?.slotNumber || i + 1;
      const entry = bySlot.get(slot);
      if (entry) {
        if (this._btLampLitMat) mesh.material = this._btLampLitMat;
        mesh.scale.setScalar(1.22);
      } else {
        if (this._btLampDimMat) mesh.material = this._btLampDimMat;
        mesh.scale.setScalar(0.88);
      }
    }
    this.renderFrame();
  },

  setGuidedBeacon(stationKey = null) {
    this.guidedBeaconKey = stationKey || null;
    if (!stationKey) {
      if (this.guidedBeaconGroup) this.guidedBeaconGroup.visible = false;
      this.renderFrame();
      return;
    }
    const dest = findAnyTempleDestination(stationKey);
    if (!dest?.pos) {
      if (this.guidedBeaconGroup) this.guidedBeaconGroup.visible = false;
      return;
    }
    if (!this.guidedBeaconGroup) {
      const grp = new THREE.Group();
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.72, 26, 16, 1, true),
        new THREE.MeshBasicMaterial({
          color: 0xFFD966,
          transparent: true,
          opacity: 0.34,
          side: THREE.DoubleSide,
          depthWrite: false
        })
      );
      beam.position.y = 13.0;
      grp.add(beam);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.95, 1.38, 32),
        new THREE.MeshBasicMaterial({
          color: 0xFFE382,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.08;
      grp.add(ring);

      const diamond = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.55, 0),
        new THREE.MeshBasicMaterial({ color: 0xFFE27A })
      );
      diamond.position.y = 5.2;
      grp.add(diamond);
      grp.userData.diamond = diamond;
      this.guidedBeaconGroup = grp;
      this.exteriorGroup.add(grp);
    }
    const sx = dest.standPos ? dest.standPos.x : dest.pos.x;
    const sz = dest.standPos ? dest.standPos.z : dest.pos.z;
    this.guidedBeaconGroup.position.set(sx, 0, sz);
    this.guidedBeaconGroup.visible = true;
    this.renderFrame();
  },

  focusInteriorArhat(arhatIdx = 0) {
    const idx = Math.max(0, Math.min(17, Number(arhatIdx) || 0));
    const isNorth = idx < 9;
    const colIdx = idx % 9;
    const ax = -18.8 - colIdx * 2.4;
    const az = isNorth ? -10.65 : 10.65;
    if (!this.inInterior) {
      this.toggleInterior(true, 'right');
    }
    this.ensureInteriorBuilt();
    this.ensureInteriorAssetsLoaded('west_chanh_dien').catch(() => {});
    this.cancelAutoWalk();
    this.playerElevationY = 0;
    const px = ax;
    const pz = isNorth ? -7.2 : 7.2;
    const yaw = Math.atan2(ax - px, az - pz);
    this.playerState.x = px;
    this.playerState.z = pz;
    this.playerState.yaw = yaw;
    this.playerState.moving = false;
    this.cameraBaseYaw = yaw;
    this.cameraAzimuthOffset = 0;
    this.syncPlayerTransform();
    this.renderFrame();
    const zKey = this.getInteriorZoneKey();
    this._lastInteriorZone = zKey;
    this.onInteriorZoneChange(zKey);
  },

  enterInteriorGradual(side = 'right', onEntered = null) {
    this.cancelEntranceTour();
    const priorityZone = side === 'front_tam_quan' ? 'west_chanh_dien' : 'east_corridor';
    this.ensureInteriorBuilt();
    this.ensureInteriorAssetsLoaded(priorityZone).catch(() => {});
    if (this.inInterior) {
      if (typeof onEntered === 'function') onEntered();
      return true;
    }
    const useFront = side === 'front_tam_quan';
    this.lastDoorSide = useFront ? 'front_tam_quan' : 'right';

    if (useFront) {
      const frontApproachX = 23.0;
      const frontApproachZ = 11.4;
      const distFront = Math.hypot(this.playerState.x - frontApproachX, this.playerState.z - frontApproachZ);
      const startFrontClimb = () => {
        this.cancelAutoWalk();
        this.interiorTransition = {
          phase: 'climb_side_door',
          side: 'front_tam_quan',
          timer: 0,
          duration: 0.65,
          startX: this.playerState.x,
          startZ: this.playerState.z,
          targetX: 23.0,
          targetZ: 8.2,
          onEntered
        };
        this.playerState.moving = true;
        this.playerState.yaw = Math.PI;
      };
      if (distFront > 3.6) {
        const pts = this.buildPerimeterSafeWaypoints(
          this.playerState.x,
          this.playerState.z,
          frontApproachX,
          frontApproachZ,
          [[23.0, 14.2]],
          { x: 23.0, y: 2.4, z: 7.5 }
        );
        this.autoWalkWaypoints = pts;
        this.autoWalkCallback = () => startFrontClimb();
        this.autoWalkStation = { name: 'Cửa trước Chánh Điện · Bậc thềm Tam Bảo', key: 'chanh_dien' };
        if (this.walkTargetRing) {
          this.walkTargetRing.position.set(frontApproachX, 0.06, frontApproachZ);
          this.walkTargetRing.visible = true;
        }
        this.updateWalkPathLine();
        this.onAutoWalkTargetChange(this.autoWalkStation);
      } else {
        startFrontClimb();
      }
      return true;
    }

    const verandaApproachX = 38.6;
    const verandaZ = -14.5;
    const dist = Math.hypot(this.playerState.x - verandaApproachX, this.playerState.z - verandaZ);

    const startApproach = () => {
      this.cancelAutoWalk();
      this.interiorTransition = {
        phase: 'climb_side_door',
        side: 'right',
        timer: 0,
        duration: 0.68,
        startX: this.playerState.x,
        startZ: this.playerState.z,
        targetX: 35.6,
        targetZ: verandaZ,
        onEntered
      };
      this.playerState.moving = true;
      this.playerState.yaw = -Math.PI * 0.5;
    };

    if (dist > 3.8) {
      const pts = this.buildPerimeterSafeWaypoints(
        this.playerState.x,
        this.playerState.z,
        verandaApproachX,
        verandaZ,
        [
          [41.8, 32.0],
          [41.8, 8.0],
          [41.8, -14.5]
        ],
        { x: 35.2, y: 2.2, z: verandaZ }
      );
      this.autoWalkWaypoints = pts;
      this.autoWalkCallback = () => startApproach();
      this.autoWalkStation = { name: 'Cuối đường rẽ trái · Hiên bỏ dép vào Chánh điện', key: 'chanh_dien' };
      if (this.walkTargetRing) {
        this.walkTargetRing.position.set(verandaApproachX, 0.06, verandaZ);
        this.walkTargetRing.visible = true;
      }
      this.updateWalkPathLine();
      this.onAutoWalkTargetChange(this.autoWalkStation);
    } else {
      startApproach();
    }
    return true;
  },

  exitInteriorGradual(side = null) {
    if (!this.inInterior) return false;
    this.cancelAutoWalk();
    if (side === 'left' || side === 'right' || side === 'north_buddha' || side === 'front_tam_quan') {
      this.lastDoorSide = side;
    }
    this._doorCooldownUntil = performance.now() + 2400;
    this.onTransitionFade(true);
    this.interiorTransition = {
      phase: 'exit_veil',
      side: this.lastDoorSide || 'right',
      timer: 0,
      duration: 0.22
    };
    return false;
  },

  setInteriorCutaway(enabled = null) {
    this.onTransitionFade(false);
    const next = enabled !== null ? Boolean(enabled) : !this.interiorCutaway;
    this.interiorCutaway = next;
    for (let i = 0; i < this.cutawayTargets.length; i++) {
      const obj = this.cutawayTargets[i];
      if (obj) obj.visible = !next;
    }
    if (this.inInterior) {
      if (next) {
        this.setTimeOfDay(this.timeOfDay, false);
      } else {
        this.applyInteriorAtmosphere();
      }
    }
    this.syncPlayerTransform();
    this.renderFrame();
    return this.interiorCutaway;
  },

  toggleInterior(enter, side = null) {
    this.cancelEntranceTour();
    this.cancelAutoWalk();
    this.interiorTransition = null;
    this.onTransitionFade(false);
    if (side === 'left' || side === 'right' || side === 'north_buddha' || side === 'front_tam_quan') {
      this.lastDoorSide = side;
    }
    this._doorCooldownUntil = performance.now() + 2200;
    this.inInterior = Boolean(enter ?? !this.inInterior);
    if (this.inInterior) {
      this.ensureInteriorBuilt();
      const priorityZone = this.lastDoorSide === 'front_tam_quan' ? 'west_chanh_dien' : 'east_corridor';
      this.ensureInteriorAssetsLoaded(priorityZone).catch(() => {});
    }
    this.exteriorGroup.visible = !this.inInterior;
    this.interiorGroup.visible = this.inInterior;
    this.playerElevationY = 0;
    if (this.playerPhysics) {
      this.playerPhysics.vx = 0;
      this.playerPhysics.vz = 0;
      this.playerPhysics.speed = 0;
    }
    if (!this.inInterior && this.interiorCutaway) {
      this.setInteriorCutaway(false);
    }
    if (this.inInterior) {
      this.applyInteriorAtmosphere();
      if (this.lastDoorSide === 'front_tam_quan') {
        this.playerState.x = -35.5;
        this.playerState.z = 0.0;
        this.playerState.yaw = Math.PI * 0.5;
        this.cameraBaseYaw = Math.PI * 0.5;
      } else {
        this.playerState.x = 15.2;
        this.playerState.z = 16.5;
        const startYaw = Math.PI - 0.18;
        this.playerState.yaw = startYaw;
        this.cameraBaseYaw = startYaw;
      }
    } else {
      this.setTimeOfDay(this.timeOfDay, false);
      if (this.lastDoorSide === 'north_buddha') {
        this.playerState.x = 14.5;
        this.playerState.z = -37.2;
        this.playerState.yaw = Math.PI;
        this.cameraBaseYaw = Math.PI;
      } else if (this.lastDoorSide === 'front_tam_quan') {
        this.playerState.x = 23.0;
        this.playerState.z = 14.5;
        this.playerState.yaw = 0;
        this.cameraBaseYaw = 0;
      } else {
        this.playerState.x = 38.8;
        this.playerState.z = -14.5;
        this.playerState.yaw = Math.PI * 0.5;
        this.cameraBaseYaw = Math.PI * 0.5;
      }
    }
    this.cameraAzimuthOffset = 0;
    this.syncPlayerTransform();
    if (this.inInterior) {
      this.nearestStallTrigger = null;
      this.onStallProximity(null);
      this.checkStationProximity();
    } else {
      this.checkStationProximity();
    }
    this.onInteriorStateChange(this.inInterior);
    this.updateSceneOcclusionCulling?.();
    this.renderFrame();
    return this.inInterior;
  },

  normalizeInteriorZoneKey(zoneKey = 'day_ban_tho_phai') {
    if (zoneKey === 'tien_duong') return 'day_ban_tho_phai';
    if (zoneKey === 'chanh_dien_noi_that') return 'chanh_dien';
    if (zoneKey === 'san_thien_tinh_1' || zoneKey === 'san_thien_tinh_2' || zoneKey === 'non_bo_giua') {
      return 'ho_sen_bo';
    }
    if (zoneKey === 'nha_to' || zoneKey === 'khu_tho') return 'hanh_lang_trai';
    if (zoneKey === 'nha_hau') return 'hanh_lang_duoi';
    return zoneKey;
  },

  getInteriorZoneKey() {
    if (!this.inInterior) return 'exterior';
    const px = this.playerState.x;
    const pz = this.playerState.z;
    if (px > 24.4) return 'trai_duong';
    if (Math.abs(px) < 10.6 && Math.abs(pz) < 10.6) return 'ho_sen_bo';
    if (px <= -15.2 && Math.abs(pz) <= 21.0) return 'chanh_dien';
    if (px >= 10.6) return 'day_ban_tho_phai';
    if (pz <= -10.6 && px > -15.5 && px < 10.6) return 'hanh_lang_trai';
    return 'hanh_lang_duoi';
  },

  goToInteriorZone(rawZoneKey = 'day_ban_tho_phai') {
    const zoneKey = this.normalizeInteriorZoneKey(rawZoneKey);
    if (!this.inInterior) {
      this.toggleInterior(true, zoneKey === 'chanh_dien' ? 'front_tam_quan' : 'right');
    }
    this.ensureInteriorBuilt();
    const priorityZone =
      zoneKey === 'chanh_dien'
        ? 'west_chanh_dien'
        : zoneKey === 'ho_sen_bo' || zoneKey === 'hanh_lang_trai'
        ? 'center_and_north'
        : 'east_corridor';
    this.ensureInteriorAssetsLoaded(priorityZone).catch(() => {});
    this.cancelAutoWalk();
    this.playerElevationY = 0;
    if (zoneKey === 'day_ban_tho_phai') {
      this.playerState.x = 15.8;
      this.playerState.z = 16.5;
      const yaw = Math.PI - 0.16;
      this.playerState.yaw = yaw;
      this.cameraBaseYaw = yaw;
    } else if (zoneKey === 'nghin_mat_nghin_tay') {
      this.playerState.x = 17.6;
      this.playerState.z = 4.2;
      this.playerState.yaw = Math.PI / 2;
      this.cameraBaseYaw = Math.PI / 2;
    } else if (zoneKey === 'cho_ngu_cua_phat') {
      this.playerState.x = 17.6;
      this.playerState.z = -13.4;
      this.playerState.yaw = Math.PI / 2;
      this.cameraBaseYaw = Math.PI / 2;
    } else if (zoneKey === 'ho_sen_bo') {
      // Unobstructed view across Hồ Sen Bộ & Hòn Non Bộ straight toward the Chánh Điện doorway, shoe racks & Trống Bát Nhã
      this.playerState.x = 7.4;
      this.playerState.z = 2.4;
      const lookYaw = Math.atan2(-15.2 - 7.4, 0.0 - 2.4);
      this.playerState.yaw = lookYaw;
      this.cameraBaseYaw = lookYaw;
    } else if (zoneKey === 'hanh_lang_trai') {
      // Wide, uncluttered North Gallery facing Ban Thờ Tổ Sư Đạt Ma
      this.playerState.x = -2.0;
      this.playerState.z = -14.8;
      const yaw = Math.PI;
      this.playerState.yaw = yaw;
      this.cameraBaseYaw = yaw;
    } else if (zoneKey === 'hanh_lang_duoi') {
      this.playerState.x = -3.2;
      this.playerState.z = 15.0;
      const yaw = 0.0;
      this.playerState.yaw = yaw;
      this.cameraBaseYaw = yaw;
    } else if (zoneKey === 'trai_duong') {
      this.playerState.x = 25.8;
      this.playerState.z = 12.5;
      this.playerElevationY = 0;
      this.playerState.yaw = Math.PI * 0.44;
      this.cameraBaseYaw = Math.PI * 0.44;
    } else {
      // Grand 100+ Pilgrim Worship Nave of Chánh Điện:
      // Standing along the central crimson carpet looking East (+X) across 112 bồ đoàn toward Tam Bảo, Bao Lam & 18 La Hán!
      this.playerState.x = -46.0;
      this.playerState.z = 0.0;
      this.playerState.yaw = Math.PI / 2;
      this.cameraBaseYaw = Math.PI / 2;
    }
    this.playerState.moving = false;
    this.cameraAzimuthOffset = 0;
    this.syncPlayerTransform(true);
    this.updateSceneOcclusionCulling?.();
    this.renderFrame();
    const zKey = this.getInteriorZoneKey();
    this._lastInteriorZone = zKey;
    this.onInteriorZoneChange(zKey);
    return zKey;
  }
};
