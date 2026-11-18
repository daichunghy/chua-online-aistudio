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
    const key = ['morning', 'midday', 'evening'].includes(presetKey) ? presetKey : 'morning';
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
            lanternEmissive: 1.55,
            porchIntensity: 7.4,
            interiorBoost: 1.32
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
    if (this.exteriorEnvTex && (!this.inInterior || this.interiorCutaway)) {
      this.scene.environment = this.exteriorEnvTex;
    }
    if (this.inInterior && !this.interiorCutaway) {
      this.applyInteriorAtmosphere();
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
      this.hemiLight.color.setHex(0xFFE0B8);
      this.hemiLight.groundColor.setHex(0x6B462B);
      this.hemiLight.intensity = 1.05;
    }
    if (this.sunLight) {
      this.sunLight.color.setHex(0xFFE6BD);
      this.sunLight.intensity = 0.62;
      this.sunLight.position.set(2, 46, 2);
    }
    if (this.frontFillLight) {
      this.frontFillLight.color.setHex(0xFFC98B);
      this.frontFillLight.intensity = 0.32;
    }
    if (this.renderer) {
      this.renderer.toneMappingExposure = 1.04;
    }
  },

  syncBlessingTowerLamps(entries = []) {
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
      if (!mesh.material) continue;
      if (entry) {
        mesh.material.color.setHex(0xFFF3BA);
        mesh.material.emissive.set(entry.colorHex || '#FFA733');
        mesh.material.emissiveIntensity = 1.68;
        mesh.scale.set(1.06, 1.44, 0.66);
      } else {
        mesh.material.color.setHex(0xD89E5C);
        mesh.material.emissive.setHex(0x7A3212);
        mesh.material.emissiveIntensity = 0.32;
        mesh.scale.set(0.92, 1.28, 0.52);
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
    const ax = -18.5;
    const az = -11.9 + idx * 1.5;
    if (!this.inInterior) {
      this.toggleInterior(true, 'right');
    }
    this.ensureInteriorAssetsLoaded().catch(() => {});
    this.cancelAutoWalk();
    this.playerElevationY = 0;
    const px = -15.0;
    const pz = az;
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
    this.ensureInteriorAssetsLoaded().catch(() => {});
    if (this.inInterior) {
      if (typeof onEntered === 'function') onEntered();
      return true;
    }
    this.lastDoorSide = 'right';
    // Walk straight down the cool tree-shaded lane (x = 40.5) to the end of the road (z = -14.5),
    // then turn LEFT (-X) onto the Shoe-Removal Veranda (x = 37.8 -> 35.6) and step through the wooden door!
    const verandaApproachX = 38.2;
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

    if (dist > 3.6) {
      const pts = this.buildPerimeterSafeWaypoints(
        this.playerState.x,
        this.playerState.z,
        verandaApproachX,
        verandaZ,
        [
          [40.5, 32.0],
          [40.5, 8.0],
          [40.5, -14.5]
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
    if (side === 'left' || side === 'right') {
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
    if (side === 'left' || side === 'right') {
      this.lastDoorSide = side;
    }
    this._doorCooldownUntil = performance.now() + 2200;
    this.inInterior = Boolean(enter ?? !this.inInterior);
    if (this.inInterior) {
      this.ensureInteriorAssetsLoaded().catch(() => {});
    }
    this.exteriorGroup.visible = !this.inInterior;
    this.interiorGroup.visible = this.inInterior;
    this.playerElevationY = 0;
    if (!this.inInterior && this.interiorCutaway) {
      this.setInteriorCutaway(false);
    }
    if (this.inInterior) {
      this.applyInteriorAtmosphere();
      this.playerState.x = 14.5;
      this.playerState.z = 16.0;
      const startYaw = Math.PI - 0.34;
      this.playerState.yaw = startYaw;
      this.cameraBaseYaw = startYaw;
    } else {
      this.setTimeOfDay(this.timeOfDay, false);
      this.playerState.x = 38.8;
      this.playerState.z = -14.5;
      this.playerState.yaw = Math.PI * 0.5;
      this.cameraBaseYaw = Math.PI * 0.5;
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
    if (px > 20.4) return 'trai_duong';
    if (Math.abs(px) < 10.6 && Math.abs(pz) < 10.6) return 'ho_sen_bo';
    if (pz <= -10.8 && px > -11.5 && px < 12.2) return 'chanh_dien';
    if (px >= 10.6) return 'day_ban_tho_phai';
    if (px <= -10.6 && pz < 14.5) return 'hanh_lang_trai';
    return 'hanh_lang_duoi';
  },

  goToInteriorZone(rawZoneKey = 'day_ban_tho_phai') {
    const zoneKey = this.normalizeInteriorZoneKey(rawZoneKey);
    if (!this.inInterior) {
      this.toggleInterior(true, 'right');
    }
    this.ensureInteriorAssetsLoaded().catch(() => {});
    this.cancelAutoWalk();
    this.playerElevationY = 0;
    if (zoneKey === 'day_ban_tho_phai') {
      this.playerState.x = 14.5;
      this.playerState.z = 16.0;
      const yaw = Math.PI - 0.34;
      this.playerState.yaw = yaw;
      this.cameraBaseYaw = yaw;
    } else if (zoneKey === 'nghin_mat_nghin_tay') {
      this.playerState.x = 14.6;
      this.playerState.z = 14.8;
      this.playerState.yaw = Math.PI / 2;
      this.cameraBaseYaw = Math.PI / 2;
    } else if (zoneKey === 'cho_ngu_cua_phat') {
      this.playerState.x = 14.4;
      this.playerState.z = 9.0;
      this.playerState.yaw = Math.PI / 2;
      this.cameraBaseYaw = Math.PI / 2;
    } else if (zoneKey === 'ho_sen_bo') {
      this.playerState.x = -5.4;
      this.playerState.z = 6.8;
      const lookYaw = Math.atan2(0 - -5.4, 0 - 6.8);
      this.playerState.yaw = lookYaw;
      this.cameraBaseYaw = lookYaw;
    } else if (zoneKey === 'hanh_lang_trai') {
      this.playerState.x = -14.8;
      this.playerState.z = -14.2;
      const yaw = Math.PI;
      this.playerState.yaw = yaw;
      this.cameraBaseYaw = yaw;
    } else if (zoneKey === 'hanh_lang_duoi') {
      this.playerState.x = -4.2;
      this.playerState.z = 14.8;
      const yaw = -0.22;
      this.playerState.yaw = yaw;
      this.cameraBaseYaw = yaw;
    } else if (zoneKey === 'trai_duong') {
      this.playerState.x = 22.8;
      this.playerState.z = 5.8;
      this.playerElevationY = 0;
      this.playerState.yaw = Math.PI * 0.42;
      this.cameraBaseYaw = Math.PI * 0.42;
    } else {
      // Top Edge of Square = Chính Điện Lễ Phật
      this.playerState.x = 0.0;
      this.playerState.z = -13.85;
      this.playerState.yaw = Math.PI;
      this.cameraBaseYaw = Math.PI;
    }
    this.playerState.moving = false;
    this.cameraAzimuthOffset = 0;
    this.syncPlayerTransform();
    this.renderFrame();
    const zKey = this.getInteriorZoneKey();
    this._lastInteriorZone = zKey;
    this.onInteriorZoneChange(zKey);
    return zKey;
  }
};
