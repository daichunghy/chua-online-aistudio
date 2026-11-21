/**
 * Hành động lễ bái, đồ trang bị, đồng bộ vị trí, gần trạm/quán, chạm để đi.
 *
 * Mixin của VinhTrang3DWorld: 11 method (triggerActionAnimation … handleResize).
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, PILGRIMAGE_STATIONS, DISCOVERY_ZONES, attachStorePropsToCharacterRig, CHAR_HEIGHTS } from './shared.mjs';
import { computeFirstPersonEyePose, findNearestStreetEncounter } from '../../logic/modules/world-atmosphere.mjs';
import { findNearestScenicBench } from '../../logic/modules/living-world.mjs';
import { findNearestRandomEncounter, findNearestCongQuaTask } from '../../logic/modules/pilgrimage-depth.mjs';

export const playerAndInteractionMethods = {
  triggerActionAnimation(clipName = 'Vái', opts = {}) {
    const mapName = {
      Vai: 'Vái',
      Vái: 'Vái',
      vai: 'Vái',
      'Chap tay': 'Chắp tay',
      'Chắp tay': 'Chắp tay',
      chap_tay: 'Chắp tay',
      'Thap nhang': 'Thắp nhang',
      'Thắp nhang': 'Thắp nhang',
      thap_nhang: 'Thắp nhang',
      Quy: 'Quỳ',
      Quỳ: 'Quỳ',
      quy: 'Quỳ',
      ngoi_thien: 'Ngồi thiền',
      'Ngồi thiền': 'Ngồi thiền',
      'Di bo': 'Di bo',
      'Đi bộ': 'Di bo',
      Dung: 'Dung',
      chup_anh: 'Chụp ảnh',
      'Chụp ảnh': 'Chụp ảnh',
      selfie: 'Selfie',
      Selfie: 'Selfie',
      tro_chuyen: 'Trò chuyện',
      'Trò chuyện': 'Trò chuyện',
      vay_tay: 'Vẫy tay',
      'Vẫy tay': 'Vẫy tay',
      quat_mat: 'Ngắm cảnh',
      'Ngắm cảnh': 'Ngắm cảnh'
    };
    const resolved = mapName[clipName] || 'Vái';
    const isCustomGesture = [
      'Chụp ảnh',
      'Selfie',
      'Trò chuyện',
      'Vẫy tay',
      'Ngắm cảnh',
      'Ngồi thiền'
    ].includes(resolved);
    const isContinuous = Boolean(opts?.continuous) || resolved === 'Ngồi thiền';
    const dur =
      Number(opts?.duration) ||
      (resolved === 'Selfie'
        ? 3.4
        : resolved === 'Trò chuyện'
        ? 4.2
        : resolved === 'Quỳ'
        ? 3.0
        : resolved === 'Chụp ảnh'
        ? 2.8
        : 2.6);

    clearTimeout(this._poseReturnTimer);
    if (resolved === 'Dung') {
      this.playerState.pose = 'Dung';
      this.proceduralPoseState = { action: null, timer: 0, duration: 0, continuous: false, partnerNpc: null };
      if (this.activePlayerRecord) {
        this.playClipCrossfade(this.activePlayerRecord, 'Dung', 0.22, false);
      }
      return;
    }

    if (isContinuous) {
      this.cancelAutoWalk?.();
      this.playerState.moving = false;
      if (this.playerPhysics) {
        this.playerPhysics.vx = 0;
        this.playerPhysics.vz = 0;
        this.playerPhysics.speed = 0;
        this.playerPhysics.actualSpeed = 0;
      }
    }

    this.playerState.pose = resolved;
    this.proceduralPoseState = {
      action: resolved === 'Di bo' ? null : resolved,
      timer: 0,
      duration: dur,
      continuous: isContinuous,
      partnerNpc: opts?.partnerNpc || null
    };
    if (this.activePlayerRecord) {
      this.playClipCrossfade(this.activePlayerRecord, isCustomGesture ? 'Dung' : resolved, 0.2, !isCustomGesture && !isContinuous);
      if (!isContinuous) {
        this._poseReturnTimer = setTimeout(() => {
          if (!this.playerState.moving && this.activePlayerRecord && !this.proceduralPoseState?.continuous) {
            this.playerState.pose = 'Dung';
            if (this.proceduralPoseState) this.proceduralPoseState.action = null;
            this.playClipCrossfade(this.activePlayerRecord, 'Dung', 0.25, false);
          }
        }, Math.round(dur * 1000) + 180);
      }
    }
  },

  addIncenseStickVisual() {
    const stick = new THREE.Group();
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.45, 6),
      new THREE.MeshStandardMaterial({ color: 0xA8241C })
    );
    stem.position.y = 0.22;
    stick.add(stem);
    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xFF5722 })
    );
    tip.position.y = 0.45;
    stick.add(tip);
    const count = this.incenseSticksGroup.children.length;
    stick.position.set(((count % 5) - 2) * 0.06, 0, Math.floor(count / 5) * 0.05);
    this.incenseSticksGroup.add(stick);
  },

  addLotusOfferingVisual() {
    const fl = this.makeLotusFlower3D(false, true);
    fl.scale.setScalar(1.85);
    const c = this.offeredLotusesGroup.children.length;
    fl.position.set(((c % 4) - 1.5) * 0.65, 0.06, (Math.floor(c / 4) - 1) * 0.65);
    if (this.pondLotusAnims.length > 0) {
      this.pondLotusAnims[this.pondLotusAnims.length - 1].baseScale = 1.85;
    }
    this.offeredLotusesGroup.add(fl);
  },

  syncRiggedPlayerWearables() {
    if (!this.activePlayerRecord?.root) return;
    const eq = this.lastEquippedState || {};
    const st = this.activeStorePreview || {};
    const merged = {
      ...st,
      hat: Boolean(st.hat ?? eq.hat),
      bag: st.bag ?? eq.bag ?? null,
      handProp: st.handProp ?? (eq.hand === 'hoa_sen_trang_nghiem' ? 'hoa_sen_trang_nghiem' : eq.hand || null),
      scarf: Boolean(st.scarf ?? eq.scarf),
      malaId: st.malaId ?? eq.malaId ?? null
    };
    const h = CHAR_HEIGHTS[this.playerState.charKey] || 1.64;
    if (this.equipmentGroup) {
      while (this.equipmentGroup.children.length > 0) {
        this.equipmentGroup.remove(this.equipmentGroup.children[0]);
      }
    }
    attachStorePropsToCharacterRig(THREE, this.activePlayerRecord, merged, {
      h,
      propMeshCache: this.propMeshCache,
      fitPropFn: (obj, sz) => this.fitProp(obj, sz),
      groundGroup: this.storePreviewGroup,
      isMoving: Boolean(this.playerState.moving),
      isKneeling: this.playerState.pose === 'Quỳ',
      previewMode: Boolean(this.activeStorePreview && Object.keys(this.activeStorePreview).length > 0)
    });
  },

  updateEquippedItems(equipped = {}) {
    this.lastEquippedState = equipped;
    this.syncRiggedPlayerWearables();
    this.renderFrame();
  },

  applyStoreVisualsToPlayer(storeVisual = {}) {
    this.activeStorePreview = storeVisual;
    this.syncRiggedPlayerWearables();
    this.renderFrame();
  },

  setTitlePanMode(active) {
    this._titlePanActive = Boolean(active);
    if (!this._titlePanActive) {
      this.syncPlayerTransform();
    }
  },

  setCameraViewMode(mode = 'third', immediate = false) {
    const next = mode === 'first' ? 'first' : 'third';
    if (this.cameraViewMode === next && !immediate) return next;
    this.cameraViewMode = next;
    if (next === 'first') {
      this.selfieCamActive = false;
      this.firstPersonPitch = 0.06;
      this.cameraBaseYaw = this.playerState.yaw;
      this.cameraAzimuthOffset = 0;
    }
    this.syncPlayerTransform();
    if (immediate) {
      if (this.camera) {
        const targetFov = next === 'first' ? 66 : 48;
        const targetNear = next === 'first' ? 0.12 : 0.25;
        if (Math.abs(this.camera.fov - targetFov) > 0.05 || Math.abs(this.camera.near - targetNear) > 0.005) {
          this.camera.fov = targetFov;
          this.camera.near = targetNear;
          this.camera.updateProjectionMatrix();
        }
      }
      this.snapCameraImmediate();
    }
    this.onCameraModeChange?.(next);
    return next;
  },

  toggleCameraViewMode() {
    return this.setCameraViewMode(this.cameraViewMode === 'first' ? 'third' : 'first');
  },

  snapCameraImmediate() {
    this.syncPlayerTransform();
    this._camCurrentPos.copy(this._camDesiredPos);
    this._camCurrentLook.copy(this._camDesiredLook);
    this._camInitialized = true;
    this.camera.position.copy(this._camCurrentPos);
    this.camera.lookAt(this._camCurrentLook);
  },

  updateCameraDamped(dt = 0.016) {
    if (this.entranceTour?.active || this.arrivalCutscene?.active) return;

    const isFpActive =
      this.cameraViewMode === 'first' &&
      !this._titlePanActive &&
      !this.selfieCamActive &&
      !(this.inInterior && this.interiorCutaway);

    // Smoothly widen FOV (66°) and tighten near clip (0.12m) in 1st-person for natural interior & plaza clarity
    if (this.camera) {
      const desiredFov = isFpActive ? 66 : 48;
      const desiredNear = isFpActive ? 0.12 : 0.25;
      if (Math.abs(this.camera.fov - desiredFov) > 0.08 || Math.abs(this.camera.near - desiredNear) > 0.005) {
        const blend = 1 - Math.exp(-8.5 * Math.min(0.12, dt));
        this.camera.fov += (desiredFov - this.camera.fov) * blend;
        if (Math.abs(this.camera.fov - desiredFov) <= 0.1) this.camera.fov = desiredFov;
        this.camera.near = desiredNear;
        this.camera.updateProjectionMatrix();
      }
    }

    if (this._titlePanActive && !this.inInterior) {
      this._titlePanTime = (this._titlePanTime || 0) + dt;
      const sway = Math.sin(this._titlePanTime * 0.22) * 3.8;
      const elev = 4.2 + Math.sin(this._titlePanTime * 0.16) * 0.45;
      this._camDesiredPos.set(40.5 + sway, elev, 52.8);
      this._camDesiredLook.set(34.0, 4.1, 18.0);
    } else {
      this.syncPlayerTransform();
    }

    if (!this._camInitialized) {
      this._camCurrentPos.copy(this._camDesiredPos);
      this._camCurrentLook.copy(this._camDesiredLook);
      this._camInitialized = true;
    } else {
      // Crisper camera response in first-person prevents swimmy/disorienting lag when turning
      const posRate = isFpActive ? 14.0 : 7.5;
      const lookRate = isFpActive ? 16.0 : 8.5;
      const posFactor = 1 - Math.exp(-posRate * Math.min(0.12, dt));
      const lookFactor = 1 - Math.exp(-lookRate * Math.min(0.12, dt));
      this._camCurrentPos.lerp(this._camDesiredPos, posFactor);
      this._camCurrentLook.lerp(this._camDesiredLook, lookFactor);
    }

    this.camera.position.copy(this._camCurrentPos);
    this.camera.lookAt(this._camCurrentLook);
  },

  syncPlayerTransform(instant = false) {
    this.playerContainer.position.set(
      this.playerState.x,
      this.playerElevationY || 0,
      this.playerState.z
    );
    this.playerContainer.rotation.y = this.playerState.yaw;

    if (this.entranceTour?.active || this.arrivalCutscene?.active) return;

    const isFirstPersonActive =
      this.cameraViewMode === 'first' &&
      !this._titlePanActive &&
      !this.selfieCamActive &&
      !(this.inInterior && this.interiorCutaway);
    if (this.playerContainer) {
      this.playerContainer.visible = !isFirstPersonActive;
    }

    if (this.inInterior && this.interiorCutaway) {
      const cutAngle = Math.PI * 0.82 + this.cameraAzimuthOffset;
      const cutDist = Math.max(20.0, 35.5 + (this.cameraZoomOffset || 0));
      const cutHeight = Math.max(16.0, 26.5 + (this.cameraPitchOffset || 0));
      const focusX = this.playerState.x * 0.22;
      const focusZ = Math.max(-12.0, Math.min(12.0, this.playerState.z * 0.22));
      this._camDesiredPos.set(
        focusX - Math.sin(cutAngle) * cutDist,
        cutHeight,
        focusZ - Math.cos(cutAngle) * cutDist
      );
      this._camDesiredLook.set(focusX, 1.8, focusZ - 1.5);
      const zKey = this.getInteriorZoneKey();
      if (zKey !== this._lastInteriorZone) {
        this._lastInteriorZone = zKey;
        this.onInteriorZoneChange(zKey);
      }
      return;
    }

    // Front-facing Selfie Camera Mode (positions camera in front-right of player looking back with scenic temple backdrop)
    if (this.selfieCamActive) {
      const pYaw = this.playerState.yaw || 0;
      const fwdX = Math.sin(pYaw);
      const fwdZ = Math.cos(pYaw);
      const rightX = -fwdZ;
      const rightZ = fwdX;
      const camX = this.playerState.x + fwdX * 2.25 + rightX * 0.42;
      const camZ = this.playerState.z + fwdZ * 2.25 + rightZ * 0.42;
      const baseH = (this.playerElevationY || 0) + 1.66;
      this._camDesiredPos.set(camX, baseH, camZ);
      this._camDesiredLook.set(
        this.playerState.x - fwdX * 0.65,
        (this.playerElevationY || 0) + 1.46,
        this.playerState.z - fwdZ * 0.65
      );
      return;
    }

    // Immersive First-Person Eye-Level Mode (V key) — works standing AND while seated on a scenic bench
    if (isFirstPersonActive) {
      const lookAngle = this.cameraBaseYaw + this.cameraAzimuthOffset;
      const fpPose = computeFirstPersonEyePose({
        x: this.playerState.x,
        z: this.playerState.z,
        elevationY: (this.playerElevationY || 0) - (this.seatedBench ? 0.44 : 0),
        charHeight: CHAR_HEIGHTS[this.playerState.charKey] || 1.64,
        yaw: lookAngle,
        pitchRad: this.firstPersonPitch || 0,
        stridePhase: this.playerPhysics?.stridePhase || 0,
        moveSpeed: this.playerState.moving ? this.playerPhysics?.actualSpeed || 2.0 : 0
      });
      this._camDesiredPos.set(fpPose.pos.x, fpPose.pos.y, fpPose.pos.z);
      this._camDesiredLook.set(fpPose.look.x, fpPose.look.y, fpPose.look.z);
      if (instant || !this._camInitialized) {
        this._camCurrentPos.copy(this._camDesiredPos);
        this._camCurrentLook.copy(this._camDesiredLook);
        this._camInitialized = true;
        this.camera.position.copy(this._camCurrentPos);
        this.camera.lookAt(this._camCurrentLook);
      }
      if (this.inInterior) {
        const zKey = this.getInteriorZoneKey();
        if (zKey !== this._lastInteriorZone) {
          this._lastInteriorZone = zKey;
          this.onInteriorZoneChange(zKey);
        }
      }
      return;
    }

    // Diegetic Cinematic Bench Rest Camera (gentle scenic sweep looking across the temple vista)
    if (this.seatedBench && !this.inInterior) {
      const b = this.seatedBench;
      const sway = Math.sin(this._benchCamOrbitAngle || 0) * 0.42 + (this.cameraAzimuthOffset || 0);
      const orbitAngle = b.seatYaw + Math.PI + sway * 0.65;
      const dist = Math.max(2.8, Math.min(8.5, 4.4 + (this.cameraZoomOffset || 0) * 0.5));
      this._camDesiredPos.set(
        b.x + Math.sin(orbitAngle) * dist,
        2.15 + Math.sin((this._benchCamOrbitAngle || 0) * 0.6) * 0.14,
        b.z + Math.cos(orbitAngle) * dist
      );
      const look = b.lookAt || { x: b.x + Math.sin(b.seatYaw) * 8, y: 1.8, z: b.z + Math.cos(b.seatYaw) * 8 };
      this._camDesiredLook.set(
        b.x * 0.35 + look.x * 0.65,
        Math.max(1.2, look.y * 0.72),
        b.z * 0.35 + look.z * 0.65
      );
      return;
    }

    const isAdidaPlaza =
      !this.inInterior &&
      (this.currentStationId === 2 ||
        Math.hypot(this.playerState.x - -9.5, this.playerState.z - -12.8) < 9.5);
    const isMonumental =
      !this.inInterior &&
      ([2, 3, 8].includes(this.currentStationId) ||
        isAdidaPlaza ||
        Math.hypot(this.playerState.x - -26.5, this.playerState.z - 22.8) < 8.5 ||
        Math.hypot(this.playerState.x - 14.5, this.playerState.z - -37.2) < 9.0);

    const transitionPull = this.interiorTransition?.phase === 'climb_side_door' ? 1.8 : 0;
    const baseDist = this.inInterior
      ? 4.35
      : (isAdidaPlaza ? 9.0 : isMonumental ? 8.6 : 6.6) - transitionPull;
    const camDist = Math.max(2.6, Math.min(18.5, baseDist + (this.cameraZoomOffset || 0)));
    const camHeight = Math.max(
      1.35,
      (this.inInterior
        ? 2.28 + (this.playerElevationY || 0) * 0.9
        : (isAdidaPlaza ? 2.85 : isMonumental ? 2.8 : 2.72) + (this.playerElevationY || 0) * 0.7) +
        (this.cameraPitchOffset || 0) * 0.55
    );
    const lookY = Math.max(
      0.85,
      (this.inInterior
        ? 1.92 + (this.playerElevationY || 0) * 0.85
        : isAdidaPlaza
        ? 4.6
        : isMonumental
        ? 4.2
        : 1.88) -
        (this.cameraPitchOffset || 0) * 0.65
    );
    const lookAngle = this.cameraBaseYaw + this.cameraAzimuthOffset;
    const sideOffset = this.inInterior ? 0 : isMonumental ? 0.28 : 0.30;
    let cx =
      this.playerState.x - Math.sin(lookAngle) * camDist - Math.cos(lookAngle) * sideOffset;
    let cz =
      this.playerState.z - Math.cos(lookAngle) * camDist + Math.sin(lookAngle) * sideOffset;
    if (this.inInterior) {
      const px = this.playerState.x;
      const pz = this.playerState.z;
      const maxCamX = 31.1;
      cx = Math.max(-61.4, Math.min(maxCamX, cx));
      cz = Math.max(-55.2, Math.min(20.05, cz));
      if (px > 10.9 && px <= 31.1 && cx < 11.15 && Math.sin(lookAngle) > 0.25) {
        cx = 11.15;
      } else if (px < -15.4 && cx > -15.65 && Math.sin(lookAngle) < -0.25) {
        cx = -15.65;
      }
      if (px >= -15.2 && px <= 10.6 && cz < -20.15) {
        cz = -20.15;
      }
    }
    this._camDesiredPos.set(cx, camHeight, cz);
    this._camDesiredLook.set(
      this.playerState.x + Math.sin(lookAngle) * 10.5,
      lookY,
      this.playerState.z + Math.cos(lookAngle) * 10.5
    );
    if (instant || !this._camInitialized) {
      this._camCurrentPos.copy(this._camDesiredPos);
      this._camCurrentLook.copy(this._camDesiredLook);
      this._camInitialized = true;
      this.camera.position.copy(this._camCurrentPos);
      this.camera.lookAt(this._camCurrentLook);
    }
    if (this.inInterior) {
      const zKey = this.getInteriorZoneKey();
      if (zKey !== this._lastInteriorZone) {
        this._lastInteriorZone = zKey;
        this.onInteriorZoneChange(zKey);
      }
    }
  },

  checkStationProximity() {
    if (this.inInterior) {
      if (this.nearestStallTrigger) {
        this.nearestStallTrigger = null;
        this.onStallProximity(null);
      }
      const px = this.playerState.x;
      const pz = this.playerState.z;
      let intPrompt = null;
      if (Math.hypot(px - 13.6, pz - 14.8) <= 3.6) {
        intPrompt = {
          kind: 'xin_xam',
          label: '🎋 [E] Xin Xăm · Xem Quẻ Quan Âm'
        };
      } else if (Math.hypot(px - 20.4, pz - 4.2) <= 3.4) {
        intPrompt = {
          kind: 'nghin_mat_nghin_tay',
          label: '🙏 [E] Chiêm Bái Tượng Phật Nghìn Mắt Nghìn Tay'
        };
      } else if (Math.hypot(px - 20.4, pz - -13.4) <= 3.4) {
        intPrompt = {
          kind: 'cho_ngu_cua_phat',
          label: '🪷 [E] Chiêm Bái Chỗ Ngủ Của Phật · Phật Nhập Niết Bàn'
        };
      } else if (Math.hypot(px - -13.6, pz - 4.8) <= 3.6) {
        intPrompt = {
          kind: 'trong_bat_nha',
          label: '🥁 [E] Khởi Hồi Trống Bát Nhã Ngoài Cửa Chánh Điện'
        };
      } else if (
        Math.hypot(px - -27.8, pz - -7.6) <= 3.8 ||
        Math.hypot(px - -27.2, pz - 7.8) <= 3.2
      ) {
        intPrompt = {
          kind: 'chanh_dien_bell',
          label: '🔔 [E] Nhờ Sư Thầy thỉnh Đại Hồng Chung'
        };
      } else if (px >= 12.2 && px <= 19.0 && pz >= 18.2) {
        intPrompt = {
          kind: 'exit_interior',
          exitSide: 'right',
          label: '🚪 [E] Ra Hiên bỏ dép & Sân chùa'
        };
      } else if (px >= 12.2 && px <= 22.0 && pz <= -51.5) {
        intPrompt = {
          kind: 'exit_interior',
          exitSide: 'north_buddha',
          label: '🚪 [E] Ra Vườn Phật Niết Bàn & Bảo Tháp'
        };
      } else if (px <= -59.6 && Math.abs(pz) <= 4.5) {
        intPrompt = {
          kind: 'exit_interior',
          exitSide: 'front_tam_quan',
          label: '🚪 [E] Ra Sân trước Chánh Điện & Tháp Đèn'
        };
      }
      const prevKey = this.nearestInteractPrompt
        ? `${this.nearestInteractPrompt.kind}:${this.nearestInteractPrompt.exitSide || ''}`
        : '';
      const nextKey = intPrompt ? `${intPrompt.kind}:${intPrompt.exitSide || ''}` : '';
      if (prevKey !== nextKey) {
        this.nearestInteractPrompt = intPrompt;
        this.onInteractProximity(intPrompt);
      }
      return;
    }
    let best = PILGRIMAGE_STATIONS[0];
    let bestDist = Infinity;
    for (const st of PILGRIMAGE_STATIONS) {
      const tx = st.standPos ? st.standPos.x : st.pos.x;
      const tz = st.standPos ? st.standPos.z : st.pos.z;
      const d = Math.hypot(this.playerState.x - tx, this.playerState.z - tz);
      if (d < bestDist) {
        bestDist = d;
        best = st;
      }
    }
    if (best.id !== this.currentStationId || bestDist < 12.0) {
      this.currentStationId = best.id;
      this.onStationProximity(best, bestDist);
    }

    // Trigger-based marketplace stall proximity check
    let nearestStall = null;
    let nearestStallDist = Infinity;
    for (const trig of this.stallTriggers) {
      const d = Math.hypot(this.playerState.x - trig.x, this.playerState.z - trig.z);
      if (d <= trig.radius && d < nearestStallDist) {
        nearestStallDist = d;
        nearestStall = trig;
      }
    }
    if (nearestStall !== this.nearestStallTrigger) {
      this.nearestStallTrigger = nearestStall;
      this.onStallProximity(nearestStall);
    }

    // Unified courtyard activity proximity check (Leaves, Garden Plots, Bell Tower, Koi Pond)
    let interactPrompt = null;
    for (const [leafId, grp] of this.courtyardLeafMeshes.entries()) {
      if (!grp.visible) continue;
      const d = Math.hypot(this.playerState.x - grp.position.x, this.playerState.z - grp.position.z);
      if (d <= 2.75) {
        interactPrompt = {
          kind: 'leaf',
          leafId,
          label: '🍂 [E] Quét Lá Bồ Đề Vàng (+XP & Công Đức)'
        };
        break;
      }
    }
    if (!interactPrompt) {
      for (const [slotIndex, rec] of this.gardenPlotGroups.entries()) {
        const sx = rec.slot.pos?.x ?? rec.slot.x ?? 0;
        const sz = rec.slot.pos?.z ?? rec.slot.z ?? 0;
        const d = Math.hypot(this.playerState.x - sx, this.playerState.z - sz);
        if (d <= 3.6) {
          interactPrompt = {
            kind: 'garden',
            slotIndex,
            label: `🌱 [E] Chăm Sóc ${rec.slot.label}`
          };
          break;
        }
      }
    }
    if (!interactPrompt) {
      const streetEnc = findNearestStreetEncounter(this.playerState.x, this.playerState.z);
      if (streetEnc) {
        interactPrompt = {
          kind: 'street_encounter',
          encounterId: streetEnc.id,
          label: streetEnc.promptLabel
        };
      }
    }
    if (!interactPrompt) {
      const randEnc = findNearestRandomEncounter(this.playerState.x, this.playerState.z);
      if (randEnc) {
        interactPrompt = {
          kind: 'random_encounter',
          encounterId: randEnc.id,
          label: `${randEnc.icon} [E] ${randEnc.shortLabel}`
        };
      }
    }
    if (!interactPrompt) {
      const cqTask = findNearestCongQuaTask(this.playerState.x, this.playerState.z);
      if (cqTask) {
        interactPrompt = {
          kind: 'cong_qua_task',
          taskId: cqTask.id,
          label: `${cqTask.icon} [E] Công quả: ${cqTask.shortLabel}`
        };
      }
    }
    if (!interactPrompt) {
      const towerDist = Math.hypot(this.playerState.x - 28.2, this.playerState.z - 15.2);
      if (towerDist <= 4.6) {
        interactPrompt = {
          kind: 'blessing_tower',
          label: '🏮 [E] Tháp Đèn Cầu An · Ghi Tên Cầu Phước'
        };
      }
    }
    if (!interactPrompt) {
      if (
        this.playerState.x >= 18.0 &&
        this.playerState.x <= 26.8 &&
        this.playerState.z >= 7.2 &&
        this.playerState.z <= 13.8
      ) {
        interactPrompt = {
          kind: 'enter_chanh_dien_front',
          label: '🚪 [E] Vào Chánh Điện (Cổng chính)'
        };
      }
    }
    if (!interactPrompt && !this.seatedBench) {
      const nearBench = findNearestScenicBench(this.playerState, 2.75);
      if (nearBench) {
        interactPrompt = {
          kind: 'scenic_bench',
          benchId: nearBench.id,
          label: `🪑 [E] Ngồi nghỉ ${nearBench.name}`
        };
      }
    }
    if (!interactPrompt) {
      const bellDist = Math.hypot(this.playerState.x - -44.0, this.playerState.z - -56.0);
      if (bellDist <= 7.5) {
        interactPrompt = {
          kind: 'bell_rhythm',
          label: '🔔 [E] Thỉnh Đại Hồng Chung · Gõ Mõ Chánh Niệm'
        };
      } else {
        const koiDist = Math.hypot(this.playerState.x - 3.5, this.playerState.z - 33.0);
        if (koiDist <= 10.2) {
          interactPrompt = {
            kind: 'koi_pond',
            label: '🐟 [E] Cho Cá Koi Ăn · Tĩnh Tâm Hồ Sen'
          };
        }
      }
    }
    if (this.seatedBench) {
      interactPrompt = {
        kind: 'stand_up_bench',
        benchId: this.seatedBench.id,
        label: '🚶 [E] Đứng dậy tiếp tục vãn cảnh'
      };
    }
    const prevKey = this.nearestInteractPrompt
      ? `${this.nearestInteractPrompt.kind}:${this.nearestInteractPrompt.leafId || this.nearestInteractPrompt.slotIndex || this.nearestInteractPrompt.encounterId || this.nearestInteractPrompt.taskId || this.nearestInteractPrompt.benchId || ''}`
      : '';
    const nextKey = interactPrompt
      ? `${interactPrompt.kind}:${interactPrompt.leafId || interactPrompt.slotIndex || interactPrompt.encounterId || interactPrompt.taskId || interactPrompt.benchId || ''}`
      : '';
    if (prevKey !== nextKey) {
      this.nearestInteractPrompt = interactPrompt;
      this.onInteractProximity(interactPrompt);
    }
  },

  initPointerAndWheelControls() {
    let dragging = false;
    let downX = 0;
    let downY = 0;
    let movedDrag = false;

    this.canvas.addEventListener('pointerdown', (e) => {
      dragging = true;
      movedDrag = false;
      downX = e.clientX;
      downY = e.clientY;
    });

    this.canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.cancelEntranceTour();
        this.cameraZoomOffset = THREE.MathUtils.clamp(
          (this.cameraZoomOffset || 0) + e.deltaY * 0.005,
          -3.0,
          7.0
        );
        this.syncPlayerTransform();
      },
      { passive: false }
    );

    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - downX;
      const dy = e.clientY - downY;
      if (Math.hypot(dx, dy) > 6) {
        movedDrag = true;
        this.cancelEntranceTour();
        this._lastCamDragAt = performance.now();
        this.cameraAzimuthOffset -= dx * 0.0045;
        if (this.cameraViewMode === 'first' && !this.selfieCamActive && !(this.inInterior && this.interiorCutaway)) {
          this.firstPersonPitch = THREE.MathUtils.clamp(
            (this.firstPersonPitch || 0) - dy * 0.0036,
            -0.56,
            0.92
          );
        } else {
          this.cameraPitchOffset = THREE.MathUtils.clamp(
            (this.cameraPitchOffset || 0) + dy * 0.012,
            -2.2,
            5.5
          );
        }
        downX = e.clientX;
        downY = e.clientY;
        this.syncPlayerTransform();
      }
    });

    // Double-click canvas in first-person view to cleanly re-level horizon
    this.canvas.addEventListener('dblclick', () => {
      if (this.cameraViewMode === 'first' && !this.selfieCamActive) {
        this.firstPersonPitch = 0.06;
        this.cameraAzimuthOffset = 0;
        this.syncPlayerTransform();
      }
    });

    window.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      if (!movedDrag && e.target === this.canvas) {
        this.cancelEntranceTour();
        this.handleCanvasTapToWalk(e);
      }
    });
  },

  handleCanvasTapToWalk(e) {
    const rect = this.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, this.camera);

    if (this.inInterior) {
      if (this.interiorFortuneClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.interiorFortuneClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('OPEN_XIN_XAM');
          return;
        }
      }
      if (this.nghinMatClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.nghinMatClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('PRAY_NGHIN_MAT_NGHIN_TAY');
          return;
        }
      }
      if (this.choNguClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.choNguClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('PRAY_CHO_NGU_CUA_PHAT');
          return;
        }
      }
      if (this.rightGalleryClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.rightGalleryClickTargets, true);
        if (hits.length > 0) {
          let cur = hits[0].object;
          let shrineTitle = '🙏 Ban Thờ Hành Lang Phải';
          let shrineDesc = 'Dải bàn thờ dọc lối vào góc dưới bên phải dẫn thẳng lên Chính Điện lễ Phật.';
          while (cur) {
            if (cur.userData?.shrineTitle) {
              shrineTitle = cur.userData.shrineTitle;
              shrineDesc = cur.userData.shrineDesc || shrineDesc;
              break;
            }
            cur = cur.parent;
          }
          this.onObjectClick('TOAST', { title: shrineTitle, desc: shrineDesc });
          return;
        }
      }
      if (this.blessingTowerClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.blessingTowerClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('OPEN_BLESSING_TOWER');
          return;
        }
      }
      if (this.interiorBellClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.interiorBellClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('RING_CHUONG_CHANH_DIEN');
          return;
        }
      }
      if (this.interiorDrumClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.interiorDrumClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('STRIKE_TRONG_BAT_NHA');
          return;
        }
      }
      if (this.interiorDoorClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.interiorDoorClickTargets, true);
        if (hits.length > 0) {
          const exitSide = hits[0].object?.userData?.exitSide || 'right';
          const doorSpecs = {
            right: { x: 15.6, z: 18.6, walkX: 15.6, walkZ: 17.8, label: 'Cửa hông Chánh điện' },
            north_buddha: { x: 17.3, z: -55.2, walkX: 17.3, walkZ: -52.5, label: 'Cổng cuối hành lang ra vườn tượng' },
            front_tam_quan: { x: -61.6, z: 0.0, walkX: -58.6, walkZ: 0.0, label: 'Cửa chính mặt tiền' }
          };
          const spec = doorSpecs[exitSide] || doorSpecs.right;
          const distToDoor = Math.hypot(this.playerState.x - spec.x, this.playerState.z - spec.z);
          if (distToDoor <= 4.2) {
            this.exitInteriorGradual(exitSide);
          } else {
            // Clicking a distant gate/end of corridor walks inside toward it instead of abruptly exiting outside
            this.walkToPoint(spec.walkX, spec.walkZ, spec.label);
          }
          return;
        }
      }
      if (this.arhatGroups?.length) {
        const hits = raycaster.intersectObjects(this.arhatGroups, true);
        if (hits.length > 0) {
          let cur = hits[0].object;
          let arhatIndex = 0;
          while (cur) {
            if (cur.userData?.arhatIndex !== undefined) {
              arhatIndex = cur.userData.arhatIndex;
              break;
            }
            cur = cur.parent;
          }
          this.onObjectClick('OPEN_ARHAT', { arhatIndex });
          return;
        }
      }
      if (this.longTruClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.longTruClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('TOAST', {
            title: '🐉 Cặp Long Trụ Rồng Cuốn Gian Chính Điện',
            desc: 'Hai cột gỗ lim lớn chạm rồng uốn lượn thếp vàng tại cạnh trên Hình Vuông (Chính Điện Chùa Vĩnh Tràng).'
          });
          return;
        }
      }
      if (this.tamBaoAltarGroup) {
        const hits = raycaster.intersectObjects([this.tamBaoAltarGroup], true);
        if (hits.length > 0) {
          this.onObjectClick('LE_PHAT');
          return;
        }
      }
      if (this.interiorNonBoClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.interiorNonBoClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('TOAST', {
            title: '🪷 Hồ Sen Bộ & Hòn Non Bộ Giữa Lòng Hình Vuông',
            desc: 'Không gian thiên tỉnh mở bầu trời ngay trung tâm khuôn viên Hình Vuông của chùa: hồ sen cá Koi nở rộ, cầu đá nhỏ, hàng cột vòm Á – Âu 4 phía và Hòn Non Bộ cổ kính.'
          });
          return;
        }
      }
      if (this.interiorKhuThoClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.interiorKhuThoClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('DANG_HUONG');
          return;
        }
      }
      if (this.interiorTraiDuongClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.interiorTraiDuongClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('TOAST', {
            title: '🪑 Phòng Tiếp Khách · Tủ Kinh Sách Chùa Vĩnh Tràng',
            desc: 'Không gian tiếp khách & đọc kinh sách rộng thoáng bên vách Đông với cửa sổ vòm lá sách xanh, bộ bàn ghế trường kỷ gỗ trắc và ghế nghỉ chân cho Phật tử.'
          });
          return;
        }
      }
    } else {
      if (this.blessingTowerClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.blessingTowerClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('OPEN_BLESSING_TOWER');
          return;
        }
      }
      if (this.streetEncounterClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.streetEncounterClickTargets, false);
        if (hits.length > 0) {
          const encounterId = hits[0].object?.userData?.streetEncounterId;
          if (encounterId) {
            this.onObjectClick('OPEN_STREET_ENCOUNTER', { encounterId });
            return;
          }
        }
      }
      if (this.depthInteractTargets?.length) {
        const hits = raycaster.intersectObjects(this.depthInteractTargets, false);
        if (hits.length > 0) {
          const ud = hits[0].object?.userData || {};
          if (ud.depthKind === 'random_encounter' && ud.depthId) {
            this.onObjectClick('OPEN_RANDOM_ENCOUNTER', { encounterId: ud.depthId });
            return;
          }
          if (ud.depthKind === 'cong_qua_task' && ud.depthId) {
            this.onObjectClick('OPEN_CONG_QUA_TASK', { taskId: ud.depthId });
            return;
          }
        }
      }
      if (this.benchClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.benchClickTargets, false);
        if (hits.length > 0) {
          const benchId = hits[0].object?.userData?.benchId;
          if (benchId) {
            this.onObjectClick('SIT_SCENIC_BENCH', { benchId });
            return;
          }
        }
      }
      if (this.lanternClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.lanternClickTargets, false);
        if (hits.length > 0) {
          const wish = hits[0].object?.userData?.lanternWish;
          if (wish) {
            this.onObjectClick('OPEN_LANTERN_WISH', { wish });
            return;
          }
        }
      }
      if (this.courtyardLeafClickTargets?.length) {
        const visibleLeaves = this.courtyardLeafClickTargets.filter((t) => t.parent?.visible);
        if (visibleLeaves.length) {
          const hits = raycaster.intersectObjects(visibleLeaves, false);
          if (hits.length > 0) {
            const leafId = hits[0].object?.userData?.leafId;
            if (leafId) {
              this.onObjectClick('COLLECT_LEAF', { leafId });
              return;
            }
          }
        }
      }
      if (this.gardenPlotClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.gardenPlotClickTargets, false);
        if (hits.length > 0) {
          const slotIndex = hits[0].object?.userData?.slotIndex ?? 0;
          this.onObjectClick('OPEN_GARDEN_PLOT', { slotIndex });
          return;
        }
      }
      if (this.lectureClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.lectureClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('OPEN_LECTURE');
          return;
        }
      }
      if (this.frontDoorClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.frontDoorClickTargets, true);
        if (hits.length > 0) {
          this.enterInteriorGradual('front_tam_quan');
          return;
        }
      }
      if (this.sideDoorClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.sideDoorClickTargets, true);
        if (hits.length > 0) {
          this.enterInteriorGradual('right');
          return;
        }
      }
      if (this.mainCompoundClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.mainCompoundClickTargets, true);
        if (hits.length > 0) {
          const preferFront = this.playerState.z > -4.0 && this.playerState.x < 34.0;
          this.enterInteriorGradual(preferFront ? 'front_tam_quan' : 'right');
          return;
        }
      }
      if (this.stiltDiningClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.stiltDiningClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('TOAST', {
            title: '🍚 Nhà Sàn Gỗ Trai Đường · Kiến trúc Miền Tây',
            desc: 'Bước lên cầu thang gỗ bên hông Tây để vào khu ăn chay của Phật tử dựng trên hệ cột sàn gỗ căm xe và hồ sen.'
          });
          return;
        }
      }
      if (this.closedMainGateClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.closedMainGateClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('CLOSED_MAIN_GATE');
          return;
        }
      }
      if (this.bellTowerClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.bellTowerClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('RING_BIG_BELL');
          return;
        }
      }
      if (this.stallClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.stallClickTargets, true);
        if (hits.length > 0) {
          let cur = hits[0].object;
          let stallType = 'huong_hoa';
          let stallTitle = 'Nhà Tạp Hóa Cổng Chùa Vĩnh Tràng';
          let eateryId = null;
          while (cur) {
            if (cur.userData && cur.userData.stallType) {
              stallType = cur.userData.stallType;
              stallTitle = cur.userData.stallTitle || stallTitle;
              eateryId = cur.userData.eateryId || cur.userData.localEateryId || null;
              break;
            }
            cur = cur.parent;
          }
          if (stallType === 'local_eatery' && eateryId) {
            this.onObjectClick('OPEN_LOCAL_EATERY', { eateryId, title: stallTitle });
          } else {
            this.onObjectClick('OPEN_MARKET_STALL', { category: stallType, title: stallTitle });
          }
          return;
        }
      }
    }

    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(groundPlane, hit)) {
      if (!this.inInterior) {
        for (const st of [...PILGRIMAGE_STATIONS, ...DISCOVERY_ZONES]) {
          const dPos = Math.hypot(hit.x - st.pos.x, hit.z - st.pos.z);
          const dStand = st.standPos
            ? Math.hypot(hit.x - st.standPos.x, hit.z - st.standPos.z)
            : Infinity;
          if (Math.min(dPos, dStand) < 4.2) {
            this.walkToStation(st);
            return;
          }
        }
      }
      const clamped = this.tryMove(hit.x, hit.z);
      const pts = this.computeSmartWaypoints(
        this.playerState.x,
        this.playerState.z,
        clamped.x,
        clamped.z
      );
      this.autoWalkWaypoints = pts;
      this.autoWalkCallback = null;
      this.autoWalkStation = null;
      this._stuckTracker = {
        lastX: this.playerState.x,
        lastZ: this.playerState.z,
        timer: 0,
        rerouted: false
      };
      const finalPt = pts[pts.length - 1] || clamped;
      this.walkTargetRing.position.set(finalPt.x, 0.06, finalPt.z);
      this.walkTargetRing.visible = true;
      this.updateWalkPathLine();
    }
  },

  handleResize(shouldRender = true) {
    const w = this.canvas.clientWidth || window.innerWidth || 1280;
    const h = this.canvas.clientHeight || window.innerHeight || 720;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.renderer.setSize(w, h, false);
    }
    this.syncPlayerTransform();
    if (shouldRender) this.renderFrame();
  }
};
