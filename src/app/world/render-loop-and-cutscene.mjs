/**
 * Vòng animate, cutscene xe tới, bạn đồng hành, hoa đăng.
 *
 * Mixin của VinhTrang3DWorld: 11 method (updateAutoWalk … afterDraw).
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, findCharacterBones, _koiPos, _koiTan, normalizeAnimKey, CHAR_HEIGHTS } from './shared.mjs';

export const renderLoopAndCutsceneMethods = {
  updateAutoWalk(dt) {
    if (!this.autoWalkWaypoints.length) return;
    const wp = this.autoWalkWaypoints[0];
    const dx = wp.x - this.playerState.x;
    const dz = wp.z - this.playerState.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.45) {
      this.autoWalkWaypoints.shift();
      if (this.autoWalkWaypoints.length === 0) {
        this.playerState.moving = false;
        if (wp.lookAt) {
          this.playerState.yaw = Math.atan2(
            wp.lookAt.x - this.playerState.x,
            wp.lookAt.z - this.playerState.z
          );
          this.cameraBaseYaw = this.playerState.yaw;
          this.cameraAzimuthOffset = 0;
        }
        if (this.walkTargetRing) this.walkTargetRing.visible = false;
        if (this.walkPathLine) this.walkPathLine.visible = false;
        const arrivedSt = this.autoWalkStation;
        const cb = this.autoWalkCallback;
        this.autoWalkStation = null;
        this.autoWalkCallback = null;
        this.syncPlayerTransform();
        this.checkStationProximity();
        this.checkInteriorDoorTransition();
        this.onAutoWalkTargetChange(null);
        if (cb) cb(arrivedSt);
        this.onAutoWalkArrival(arrivedSt);
        return;
      }
      this.updateWalkPathLine();
      return;
    }

    const stepSpeed = Math.min(dist, dt * 5.2);
    const nx = dx / dist;
    const nz = dz / dist;
    const moved = this.tryMove(
      this.playerState.x + nx * stepSpeed,
      this.playerState.z + nz * stepSpeed
    );
    this.playerState.x = moved.x;
    this.playerState.z = moved.z;
    this.playerState.yaw = this.lerpAngle(this.playerState.yaw, Math.atan2(nx, nz), dt * 10);
    this.playerState.moving = true;
    this.syncPlayerTransform();
    this.checkStationProximity();
    this.checkInteriorDoorTransition();
  },

  stepInteriorTransition(trDt) {
    if (!this.interiorTransition) return;
    const tr = this.interiorTransition;
    tr.timer += trDt;
    const t = Math.min(1, tr.timer / Math.max(0.01, tr.duration));
    if (tr.phase === 'climb_side_door') {
      this.playerState.x = tr.startX + (tr.targetX - tr.startX) * t;
      this.playerState.z = tr.startZ + (tr.targetZ - tr.startZ) * t;
      this.playerElevationY = 0;
      this.playerState.moving = true;
      this.syncPlayerTransform();
      if (t >= 1) {
        this.onTransitionFade(true);
        this.interiorTransition = {
          phase: 'enter_veil',
          timer: 0,
          duration: 0.24,
          side: 'right',
          onEntered: tr.onEntered
        };
      }
    } else if (tr.phase === 'enter_veil') {
      if (t >= 1) {
        this.inInterior = true;
        this.ensureInteriorAssetsLoaded().catch(() => {});
        this.exteriorGroup.visible = false;
        this.interiorGroup.visible = true;
        this.applyInteriorAtmosphere();
        this.playerElevationY = 0;
        this._doorCooldownUntil = performance.now() + 2600;
        const entryYaw = Math.PI - 0.34;
        this.playerState.x = 15.1;
        this.playerState.z = 18.8;
        this.playerState.yaw = entryYaw;
        this.cameraBaseYaw = entryYaw;
        this.cameraAzimuthOffset = 0;
        this.nearestStallTrigger = null;
        this.onStallProximity(null);
        this.checkStationProximity();
        this.onInteriorStateChange(true);
        this.onTransitionFade(false);
        this.interiorTransition = {
          phase: 'walk_aisle',
          timer: 0,
          duration: 0.85,
          startX: 15.1,
          startZ: 18.8,
          targetX: 14.5,
          targetZ: 16.0,
          onEntered: tr.onEntered
        };
      }
    } else if (tr.phase === 'walk_aisle') {
      this.playerState.x = tr.startX + (tr.targetX - tr.startX) * t;
      this.playerState.z = tr.startZ + (tr.targetZ - tr.startZ) * t;
      const entryYaw = Math.PI - 0.34;
      this.playerState.yaw = entryYaw;
      this.cameraBaseYaw = entryYaw;
      this.playerState.moving = true;
      this.syncPlayerTransform();
      this.checkStationProximity();
      if (t >= 1) {
        const doneCb = tr.onEntered;
        this.playerState.moving = false;
        this.interiorTransition = null;
        this._doorCooldownUntil = performance.now() + 1800;
        this.syncPlayerTransform();
        this.checkStationProximity();
        if (typeof doneCb === 'function') doneCb();
      }
    } else if (tr.phase === 'exit_veil') {
      if (t >= 1) {
        if (this.interiorCutaway) {
          this.setInteriorCutaway(false);
        }
        this.inInterior = false;
        this.exteriorGroup.visible = true;
        this.interiorGroup.visible = false;
        this.setTimeOfDay(this.timeOfDay, false);
        this.playerElevationY = 0;
        this._doorCooldownUntil = performance.now() + 2400;
        if (tr.side === 'north_buddha') {
          this.playerState.x = -24.5;
          this.playerState.z = -10.5;
          this.playerState.yaw = Math.PI;
          this.cameraBaseYaw = Math.PI;
        } else {
          this.playerState.x = 38.8;
          this.playerState.z = -14.5;
          this.playerState.yaw = Math.PI * 0.5;
          this.cameraBaseYaw = Math.PI * 0.5;
        }
        this.playerState.moving = false;
        this.cameraAzimuthOffset = 0;
        this.onInteriorStateChange(false);
        this.onTransitionFade(false);
        this.interiorTransition = null;
        this.syncPlayerTransform();
        this.checkStationProximity();
      }
    }
  },

  animate() {
    if (this._renderPaused || this.lectureHallMode || this.contextLost || this.renderer?.getContext?.()?.isContextLost?.()) {
      window.setTimeout(() => this.animate(), 400);
      return;
    }

    const rawDelta = this.clock.getDelta();
    const dt = Math.min(rawDelta, 0.05);
    const trDt = this.isSoftwareGl ? Math.max(dt, Math.min(rawDelta, 0.35)) : dt;
    const elapsed = this.clock.elapsedTime;

    if (this.interiorTransition) {
      this.stepInteriorTransition(trDt);
    } else {
      const walkDt = this.isSoftwareGl ? Math.max(dt, Math.min(rawDelta, 0.25)) : dt;
      this.updateHeldMovement(walkDt);
      this.updateAutoWalk(walkDt);
    }

    // Damped Entrance Camera Tour along Tam Quan -> Yellow Banner & Vietnamese Stalls -> Right Bougainvillea Path
    const tourStep = this.isSoftwareGl ? Math.max(dt, 0.14) : dt;
    this.stepArrivalCutscene(tourStep);
    this.stepEntranceTour(tourStep);
    this.stepRoadTraffic(this.isSoftwareGl ? trDt : dt);

    if (this.activePlayerRecord) {
      if (this.playerState.moving) {
        this.playerState.moveBlend = Math.min(1, this.playerState.moveBlend + dt * 6);
        this.playClipCrossfade(this.activePlayerRecord, 'Di bo', 0.15, false);
        if (this.activePlayerRecord.activeAction) {
          this.activePlayerRecord.activeAction.paused = false;
          this.activePlayerRecord.activeAction.timeScale =
            0.55 + 0.65 * this.playerState.moveBlend;
        }
        this.activePlayerRecord.mixer.update(dt);
        if (!this.arrivalCutscene?.active) {
          this._stepAudioTimer += dt;
          if (this._stepAudioTimer >= 0.42) {
            this._stepAudioTimer = 0;
            this.onStepSound(this.inInterior ? 'interior' : 'stone');
          }
        }
      } else {
        this.playerState.moveBlend = Math.max(0, this.playerState.moveBlend - dt * 7);
        this._stepAudioTimer = 0.25;
        const activeName = normalizeAnimKey(this.activePlayerRecord.activeClipName);
        if ((activeName === 'di bo' || activeName === 'walk') && !this.proceduralPoseState?.action) {
          this.playClipCrossfade(this.activePlayerRecord, 'Dung', 0.2, false);
        }
        if (this.activePlayerRecord.activeAction) {
          this.activePlayerRecord.activeAction.paused = false;
        }
        this.activePlayerRecord.mixer.update(dt);
      }
      this.updateProceduralPoseFallback(dt);
    }

    this.stepPilgrimageCompanions(dt);

    if (this.guidedBeaconGroup?.visible && this.guidedBeaconGroup.userData?.diamond) {
      this.guidedBeaconGroup.userData.diamond.rotation.y = elapsed * 1.4;
      this.guidedBeaconGroup.userData.diamond.position.y = 5.2 + Math.sin(elapsed * 2.6) * 0.38;
    }

    if (!this.inInterior) {
      this.stepNpcRecordList(this.riggedNpcRecords, this.exteriorGroup, dt);
    } else {
      for (const kr of this.interiorKneelingRecords) {
        kr.mixer.update(dt * 0.72);
      }
      if (this.interiorWalkingRecords?.length) {
        this.stepNpcRecordList(this.interiorWalkingRecords, this.interiorGroup, dt);
      }
    }

    for (const vRec of this.vendorNpcRecords) {
      vRec.mixer.update(dt * 0.7);
    }

    for (const sc of this.smokeColumns) {
      sc.update(dt, elapsed);
    }
    for (const ls of this.lotusSwayGroups) {
      ls.group.rotation.z = Math.sin(elapsed * 1.4 + ls.phase) * 0.045;
      ls.group.rotation.x = Math.cos(elapsed * 1.1 + ls.phase) * 0.035;
    }
    if (this.floatingLanterns?.length && !this.inInterior) {
      for (const fl of this.floatingLanterns) {
        fl.mesh.position.y = 0.04 + Math.sin(elapsed * 1.7 + fl.phase) * 0.025;
        fl.mesh.rotation.y += dt * 0.14;
        fl.mesh.rotation.z = Math.sin(elapsed * 1.3 + fl.phase) * 0.06;
        if (fl.flameMat) {
          fl.flameMat.emissiveIntensity = 0.85 + Math.sin(elapsed * 7.5 + fl.phase) * 0.28;
        }
      }
    }

    // Animate Dâng hoa blooming & glowing lotus effect in the pond + active Dâng hương / Dâng hoa sequences (zero GC)
    const ritualDt = this.isSoftwareGl ? Math.max(dt, 0.12) : dt;
    this.stepLotusBloom(ritualDt);
    this.stepOfferingAnimations?.(ritualDt);

    for (const k of this.koiList) {
      if (k.curve) {
        const u = ((elapsed * k.speed) + k.phase) % 1;
        k.curve.getPointAt(u, _koiPos);
        k.curve.getTangentAt(u, _koiTan);
        k.mesh.position.copy(_koiPos);
        k.mesh.rotation.y = Math.atan2(_koiTan.x, _koiTan.z);
        if (k.bodyPivot) {
          k.bodyPivot.rotation.y = Math.sin(elapsed * 7.5 + k.phase * 12) * 0.08;
        }
        if (k.tail) {
          k.tail.rotation.y = Math.sin(elapsed * 11 + k.phase * 12) * 0.45;
        }
      }
    }
    for (const p of this.pigeons) {
      const distToPlayer = Math.hypot(
        this.playerState.x - p.group.position.x,
        this.playerState.z - p.group.position.z
      );
      if (distToPlayer < 3.2 && !p.flying) {
        p.flying = true;
        p.flyTimer = 0;
      }
      if (p.flying) {
        p.flyTimer += dt;
        p.group.position.y = Math.min(5.5, p.flyTimer * 2.8);
        p.group.position.x += Math.sin(p.phase) * dt * 2.4;
        p.group.position.z -= Math.cos(p.phase) * dt * 2.4;
        if (p.wL && p.wR) {
          const flap = Math.sin(elapsed * 26) * 0.65;
          p.wL.rotation.z = flap;
          p.wR.rotation.z = -flap;
        }
        if (p.flyTimer > 4.5) {
          p.flying = false;
          p.group.position.set(p.baseX, 0, p.baseZ);
          if (p.wL && p.wR) {
            p.wL.rotation.z = 0;
            p.wR.rotation.z = 0;
          }
        }
      } else {
        p.group.position.y = Math.abs(Math.sin(elapsed * 3.2 + p.phase)) * 0.04;
        p.group.rotation.y = Math.sin(elapsed * 0.7 + p.phase) * 0.6;
      }
    }

    for (const grp of this.courtyardLeafMeshes.values()) {
      if (!grp.visible) continue;
      grp.position.y = 0.025 + Math.sin(elapsed * 2.2 + (grp.userData.phase || 0)) * 0.015;
    }

    this.updateProjectedPins();
    this.updateCourtyardNpcInteraction();
    try {
      this.renderer.render(this.scene, this.camera);
    } catch {}
    if (this.isSoftwareGl) {
      const activeClip = normalizeAnimKey(this.activePlayerRecord?.activeClipName || '');
      const hasNonIdleAction =
        activeClip &&
        activeClip !== 'dung' &&
        Boolean(this.activePlayerRecord?.activeAction && !this.activePlayerRecord.activeAction.paused);
      const isActivelyAnimating =
        this.playerState.moving ||
        this.heldDirs.size > 0 ||
        this.autoWalkWaypoints.length > 0 ||
        this.entranceTour.active ||
        Boolean(this.arrivalCutscene?.active) ||
        Boolean(this.proceduralPoseState?.action) ||
        this.lotusBloomState.active ||
        Boolean(this.activeOfferingAnimations?.length) ||
        Boolean(this.interiorTransition) ||
        hasNonIdleAction;
      this.afterDraw(() => this.animate(), isActivelyAnimating ? 120 : 520);
    } else {
      requestAnimationFrame(() => this.animate());
    }
  },

  updateProceduralPoseFallback(dt) {
    const st = this.proceduralPoseState;
    if (!st || !st.action || !this.activePlayerRecord?.root) return;
    st.timer += dt;
    const p = Math.min(1, st.timer / Math.max(0.2, st.duration || 2.5));
    const curve = Math.sin(p * Math.PI);
    const bones = findCharacterBones(this.activePlayerRecord.root);
    const act = normalizeAnimKey(st.action);

    if (act === 'quy') {
      this.activePlayerRecord.root.position.y =
        (this.activePlayerRecord.baseY || 0) - 0.34 * curve;
      if (bones.spine) bones.spine.rotation.x += 0.32 * curve;
      if (bones.head) bones.head.rotation.x += 0.25 * curve;
    } else if (act === 'vai') {
      if (bones.spine) bones.spine.rotation.x += 0.44 * curve;
      if (bones.chest && bones.chest !== bones.spine) bones.chest.rotation.x += 0.18 * curve;
      if (bones.head) bones.head.rotation.x += 0.3 * curve;
    } else if (act === 'thap nhang' || act === 'chap tay') {
      if (bones.spine) bones.spine.rotation.x += 0.16 * curve;
      if (bones.head) bones.head.rotation.x += 0.2 * curve;
      if (bones.leftForearm) bones.leftForearm.rotation.x -= 0.55 * curve;
      if (bones.rightForearm) bones.rightForearm.rotation.x -= 0.55 * curve;
    }

    if (p >= 1) {
      st.action = null;
      st.timer = 0;
      this.activePlayerRecord.root.position.y = this.activePlayerRecord.baseY || 0;
    }
  },

  playArrivalCutscene({ vehicleKind = 'sedan', onCue = () => {}, onComplete = () => {} } = {}) {
    this.skipArrivalCutscene(true);
    this.cancelEntranceTour();
    this.cancelAutoWalk();
    if (this.inInterior) this.toggleInterior(false);

    const isCoach = vehicleKind === 'van' || vehicleKind === 'doan_xe_buyt';
    const vehColor = isCoach ? 0xD7DFE4 : 0xEFEBE2;
    const vehicle = this.spawnRoadTrafficVehicle({
      kind: isCoach ? 'van' : 'sedan',
      x: 92,
      z: 59.4,
      direction: -1,
      speed: 8.5,
      color: vehColor
    });
    if (vehicle?.group) {
      vehicle.group.userData.isCutsceneVehicle = true;
    }

    // Temporarily tuck player inside drop-off spot while car pulls up
    this.playerState.x = 58.0;
    this.playerState.z = 52.5;
    this.playerState.yaw = Math.PI;
    this.playerState.moving = false;
    this.playerContainer.visible = false;

    this.arrivalCutscene = {
      active: true,
      timer: 0,
      phase: 'drive_in',
      vehicle,
      vehicleKind: isCoach ? 'van' : 'sedan',
      onCue,
      onComplete,
      cuedArrival: false,
      cuedWalkIn: false
    };
    onCue('drive_in');
  },

  skipArrivalCutscene(silent = false) {
    const cs = this.arrivalCutscene;
    if (!cs) return;
    if (cs.vehicle) {
      this.disposeRoadTrafficVehicle(cs.vehicle);
    }
    this.arrivalCutscene = null;
    this.playerContainer.visible = true;
    this.playerState.x = 40.5;
    this.playerState.z = 43.8;
    this.playerState.yaw = Math.PI;
    this.playerState.moving = false;
    this.cameraBaseYaw = Math.PI;
    this.cameraAzimuthOffset = 0;
    this.syncPlayerTransform();
    if (!silent && typeof cs.onComplete === 'function') {
      cs.onComplete();
    }
  },

  stepArrivalCutscene(dt) {
    const cs = this.arrivalCutscene;
    if (!cs || !cs.active || this.inInterior) return;
    cs.timer += dt;
    const vGrp = cs.vehicle?.group;

    // 0 -> 2.8s: car cruises west along Nguyễn Trung Trực road and pulls into Cổng Phụ curb
    if (cs.timer < 2.8) {
      const u = Math.min(1, cs.timer / 2.8);
      const ease = 1 - Math.pow(1 - u, 3);
      if (vGrp) {
        vGrp.position.x = THREE.MathUtils.lerp(92, 51.5, ease);
        vGrp.position.z = THREE.MathUtils.lerp(59.4, 53.6, Math.max(0, (u - 0.45) / 0.55));
        vGrp.rotation.y = Math.PI + (u > 0.45 && u < 0.92 ? -0.26 : 0);
      }
      this.camera.position.set(
        THREE.MathUtils.lerp(66, 44.5, ease),
        THREE.MathUtils.lerp(5.2, 3.6, ease),
        THREE.MathUtils.lerp(69, 63.5, ease)
      );
      this.camera.lookAt(
        THREE.MathUtils.lerp(72, 48.0, ease),
        1.7,
        THREE.MathUtils.lerp(57, 50.5, ease)
      );
      return;
    }

    // 2.8 -> 6.8s: step out of vehicle onto plaza & align straight into Cổng Phụ looking down the shaded lane
    if (!cs.cuedArrival) {
      cs.cuedArrival = true;
      this.playerContainer.visible = true;
      this.playerState.x = 49.5;
      this.playerState.z = 51.2;
      cs.onCue('step_out');
    }
    if (cs.timer < 6.8) {
      const w = (cs.timer - 2.8) / 4.0;
      const sx = THREE.MathUtils.lerp(49.5, 40.5, w);
      const sz = THREE.MathUtils.lerp(51.2, 43.8, w);
      this.playerState.yaw = THREE.MathUtils.lerp(Math.atan2(40.5 - 49.5, 43.8 - 51.2), Math.PI, Math.min(1, w * 1.35));
      this.playerState.x = sx;
      this.playerState.z = sz;
      this.playerState.moving = true;
      this.playerContainer.position.set(sx, 0, sz);
      this.playerContainer.rotation.y = this.playerState.yaw;
      if (!cs.cuedWalkIn && w > 0.35) {
        cs.cuedWalkIn = true;
        cs.onCue('enter_gate');
      }
      this.camera.position.set(
        THREE.MathUtils.lerp(44.5, 40.5, w),
        THREE.MathUtils.lerp(3.6, 2.1, w),
        THREE.MathUtils.lerp(63.5, 50.8, w)
      );
      this.camera.lookAt(
        40.5,
        THREE.MathUtils.lerp(2.6, 3.2, w),
        THREE.MathUtils.lerp(41.5, 20.0, w)
      );
      return;
    }

    this.skipArrivalCutscene(false);
  },

  setPilgrimageCompanions(modeConfig = {}, nationalityId = 'vn') {
    for (const c of this.companionRecords) {
      if (c.rec?.root?.parent) c.rec.root.parent.remove(c.rec.root);
    }
    this.companionRecords = [];

    const specs = Array.isArray(modeConfig?.companions) ? modeConfig.companions : [];
    const tintByNat = {
      vn: [0.68, 0.72, 0.78],
      us: [0.46, 0.56, 0.74],
      intl: [0.48, 0.60, 0.74],
      jp: [0.58, 0.52, 0.68],
      kr: [0.78, 0.74, 0.82],
      tw: [0.62, 0.45, 0.34],
      fr: [0.56, 0.62, 0.54],
      th: [0.82, 0.74, 0.44]
    };
    const toRgbTuple = (val) => {
      if (Array.isArray(val) && val.length >= 3) return val;
      if (typeof val === 'string' && /^#[0-9a-f]{6}$/i.test(val.trim())) {
        const hex = val.trim().slice(1);
        return [
          parseInt(hex.slice(0, 2), 16) / 255,
          parseInt(hex.slice(2, 4), 16) / 255,
          parseInt(hex.slice(4, 6), 16) / 255
        ];
      }
      return null;
    };

    for (let i = 0; i < specs.length; i++) {
      const sp = specs[i];
      const charKey = sp.charKey || 'nu_ao_lam';
      if (!this.charDataCache[charKey]?.scene) {
        this.loadCharacterGLB(charKey).then((loaded) => {
          if (loaded?.scene && this.companionRecords?.some((cr) => cr._requestedCharKey === charKey && !cr._upgraded)) {
            this.setPilgrimageCompanions(modeConfig, nationalityId);
          }
        });
      }
      const resolvedKey = this.charDataCache[charKey]?.scene ? charKey : (this.charDataCache.nu_ao_lam?.scene ? 'nu_ao_lam' : 'nu');
      const height = CHAR_HEIGHTS[resolvedKey] || 1.62;
      const rec = this.cloneAnimatedCharacter(resolvedKey, height);
      if (!rec) continue;
      const rgbTint = toRgbTuple(sp.tint) || tintByNat[nationalityId] || null;
      if (rgbTint) {
        this.recolorPastelDress(rec.root, rgbTint);
      }
      this.equipNpcProps(rec, resolvedKey, height, {
        hat: Boolean(sp.hat),
        bag: sp.bag || null,
        scarf: Boolean(sp.scarf),
        hand: sp.hand || 'hoa_sen'
      });

      const angleOffset = (i === 0 ? 1 : -1) * (0.9 + Math.floor(i / 2) * 0.55);
      const backDist = 1.55 + Math.floor(i / 2) * 1.15;
      const startX = this.playerState.x - Math.sin(this.playerState.yaw + angleOffset) * backDist;
      const startZ = this.playerState.z - Math.cos(this.playerState.yaw + angleOffset) * backDist;
      rec.root.position.set(startX, rec.baseY, startZ);
      rec.root.rotation.y = this.playerState.yaw;
      this.playClipCrossfade(rec, 'Dung', 0.1, false);
      this.scene.add(rec.root);
      this.companionRecords.push({
        rec,
        _requestedCharKey: charKey,
        _upgraded: resolvedKey === charKey,
        roleLabel: sp.roleLabel || sp.label || 'Bạn đồng hành',
        sideOffset: (i % 2 === 0 ? -1.15 : 1.15) * (1 + Math.floor(i / 2) * 0.45),
        backOffset: -1.45 - Math.floor(i / 2) * 1.05,
        state: 'Dung',
        yaw: this.playerState.yaw
      });
    }
  },

  stepPilgrimageCompanions(dt) {
    if (!this.companionRecords?.length) return;
    const hideCompanions = Boolean(this.arrivalCutscene?.active && !this.playerContainer.visible);
    const pYaw = this.playerState.yaw || 0;
    const fwdX = Math.sin(pYaw);
    const fwdZ = Math.cos(pYaw);
    const rightX = -fwdZ;
    const rightZ = fwdX;

    for (const c of this.companionRecords) {
      c.rec.root.visible = !hideCompanions;
      if (hideCompanions) continue;

      const targetX = this.playerState.x + fwdX * c.backOffset + rightX * c.sideOffset;
      const targetZ = this.playerState.z + fwdZ * c.backOffset + rightZ * c.sideOffset;
      const pos = c.rec.root.position;
      pos.y = (this.playerElevationY || 0) + (c.rec.baseY || 0);
      const dx = targetX - pos.x;
      const dz = targetZ - pos.z;
      const d = Math.hypot(dx, dz);

      if (d > 0.35) {
        const moveStep = Math.min(d, dt * (d > 3.5 ? 5.8 : 4.4));
        pos.x += (dx / d) * moveStep;
        pos.z += (dz / d) * moveStep;
        const moveYaw = Math.atan2(dx, dz);
        c.yaw = this.lerpAngle(c.yaw, moveYaw, dt * 8.0);
        c.rec.root.rotation.y = c.yaw;
        if (c.state !== 'Di bo') {
          c.state = 'Di bo';
          this.playClipCrossfade(c.rec, 'Di bo', 0.16, false);
        }
        c.rec.mixer.update(dt);
      } else {
        c.yaw = this.lerpAngle(c.yaw, pYaw, dt * 6.0);
        c.rec.root.rotation.y = c.yaw;
        if (c.state !== 'Dung') {
          c.state = 'Dung';
          this.playClipCrossfade(c.rec, 'Dung', 0.2, false);
        }
        c.rec.mixer.update(dt);
      }
    }
  },

  renderFloatingLanterns(wishes = []) {
    if (!this.lanternWishesGroup) return;
    while (this.lanternWishesGroup.children.length > 0) {
      this.lanternWishesGroup.remove(this.lanternWishesGroup.children[0]);
    }
    this.floatingLanterns = [];
    const list = Array.isArray(wishes) ? wishes.slice(0, 18) : [];

    for (let i = 0; i < list.length; i++) {
      const w = list[i];
      const ang = (i / Math.max(1, list.length)) * Math.PI * 2 + i * 0.42;
      const rad = 1.6 + (i % 4) * 1.15;
      const holder = new THREE.Group();
      holder.position.set(Math.cos(ang) * rad, 0.04, Math.sin(ang) * rad);

      let mesh = null;
      if (this.propMeshCache.den_hoa_dang) {
        mesh = this.fitProp(this.propMeshCache.den_hoa_dang, 0.44);
      } else {
        mesh = new THREE.Group();
        const petalMat = new THREE.MeshStandardMaterial({
          color: w.colorHex ? new THREE.Color(w.colorHex) : 0xFF8AA8,
          emissive: 0xFF7B3B,
          emissiveIntensity: 0.32,
          roughness: 0.4
        });
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.08, 8), petalMat);
        base.position.y = 0.04;
        mesh.add(base);
        for (let p = 0; p < 6; p++) {
          const pa = (p / 6) * Math.PI * 2;
          const petal = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 4), petalMat);
          petal.position.set(Math.cos(pa) * 0.14, 0.11, Math.sin(pa) * 0.14);
          petal.rotation.z = -Math.cos(pa) * 0.4;
          petal.rotation.x = Math.sin(pa) * 0.4;
          mesh.add(petal);
        }
      }
      const flameMat = new THREE.MeshStandardMaterial({
        color: 0xFFE58F,
        emissive: 0xFF9F2E,
        emissiveIntensity: 0.95
      });
      const flame = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 6), flameMat);
      flame.position.y = 0.18;
      mesh.add(flame);

      holder.add(mesh);
      holder.userData.wishId = w.id;
      holder.userData.wishLabel = w.wish || w.categoryLabel || 'Hoa Đăng Nguyện Ước';
      this.lanternWishesGroup.add(holder);
      this.floatingLanterns.push({
        mesh: holder,
        flameMat,
        phase: i * 1.15
      });
    }
  },

  afterDraw(cb, delayMs = 80) {
    const gl = this.renderer.getContext();
    if (!gl || typeof gl.fenceSync !== 'function') {
      window.setTimeout(cb, delayMs);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    if (!sync) {
      window.setTimeout(cb, delayMs);
      return;
    }
    let polls = 0;
    const poll = () => {
      polls += 1;
      const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED && polls < 60) {
        window.setTimeout(poll, 8);
      } else {
        gl.deleteSync(sync);
        window.setTimeout(cb, delayMs);
      }
    };
    window.setTimeout(poll, 8);
  },

  stepNpcRecordList(list, parentGroup, dt) {
    if (!Array.isArray(list) || !list.length) return;
    for (let ni = 0; ni < list.length; ni++) {
      const npc = list[ni];
      const pos = npc.rec.root.position;
      if (npc.pauseTimer > 0) {
        npc.pauseTimer -= dt;
        if (npc.pauseTimer <= 0 && npc.temporary && npc.removeAfterPause) {
          parentGroup?.remove(npc.rec.root);
          list.splice(ni, 1);
          ni -= 1;
          continue;
        }
        const desiredClip = npc.pauseClip === 'Chắp tay' ? 'Chắp tay' : 'Dung';
        if (npc.state !== desiredClip) {
          npc.state = desiredClip;
          this.playClipCrossfade(npc.rec, desiredClip, 0.24, false);
        }
        if (npc.lookX !== null && npc.lookZ !== null) {
          const lookYaw = Math.atan2(npc.lookX - pos.x, npc.lookZ - pos.z);
          npc.yaw = this.lerpAngle(npc.yaw, lookYaw, dt * 5.0);
          npc.rec.root.rotation.y = npc.yaw;
        }
        npc.rec.mixer.update(dt * 0.75);
        continue;
      }

      const target = npc.pts[npc.idx];
      const dx = target.x - pos.x;
      const dz = target.z - pos.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.42) {
        if (npc.temporary && npc.idx >= npc.pts.length - 1) {
          if (target.wait > 0) {
            npc.pauseTimer = target.wait;
            npc.pauseClip = target.action === 'chap_tay' ? 'Chắp tay' : 'Dung';
            npc.lookX = target.lookX;
            npc.lookZ = target.lookZ;
            npc.removeAfterPause = true;
            npc.state = npc.pauseClip;
            this.playClipCrossfade(npc.rec, npc.pauseClip, 0.24, false);
            npc.rec.mixer.update(dt);
          } else {
            parentGroup?.remove(npc.rec.root);
            list.splice(ni, 1);
            ni -= 1;
          }
          continue;
        }
        npc.idx = (npc.idx + 1) % npc.pts.length;
        if (target.wait > 0 && target.action !== 'pass') {
          npc.pauseTimer = target.wait;
          npc.pauseClip = target.action === 'chap_tay' ? 'Chắp tay' : 'Dung';
          npc.lookX = target.lookX;
          npc.lookZ = target.lookZ;
          npc.state = npc.pauseClip;
          this.playClipCrossfade(npc.rec, npc.pauseClip, 0.24, false);
          npc.rec.mixer.update(dt);
          continue;
        }
        npc.lookX = null;
        npc.lookZ = null;
      }

      const nextTarget = npc.pts[npc.idx];
      const tx = nextTarget.x - pos.x;
      const tz = nextTarget.z - pos.z;
      const td = Math.hypot(tx, tz) || 1;
      let dirX = tx / td;
      let dirZ = tz / td;

      // Gentle personal-space separation from other moving NPCs & the player
      const pdx = pos.x - this.playerState.x;
      const pdz = pos.z - this.playerState.z;
      const pDist = Math.hypot(pdx, pdz);
      if (pDist > 0.01 && pDist < 1.05) {
        const push = (1.05 - pDist) * 0.65;
        dirX += (pdx / pDist) * push;
        dirZ += (pdz / pDist) * push;
      }
      for (let oi = 0; oi < list.length; oi++) {
        if (oi === ni) continue;
        const other = list[oi].rec.root.position;
        const odx = pos.x - other.x;
        const odz = pos.z - other.z;
        const oDist = Math.hypot(odx, odz);
        if (oDist > 0.01 && oDist < 0.88) {
          const push = (0.88 - oDist) * 0.55;
          dirX += (odx / oDist) * push;
          dirZ += (odz / oDist) * push;
        }
      }
      const dNorm = Math.hypot(dirX, dirZ) || 1;
      dirX /= dNorm;
      dirZ /= dNorm;

      const step = Math.min(td, dt * npc.speed);
      pos.x += dirX * step;
      pos.z += dirZ * step;
      const targetYaw = Math.atan2(dirX, dirZ);
      npc.yaw = this.lerpAngle(npc.yaw, targetYaw, dt * 6.5);
      npc.rec.root.rotation.y = npc.yaw;
      if (npc.state !== 'walk') {
        npc.state = 'walk';
        this.playClipCrossfade(npc.rec, 'Di bo', 0.2, false);
      }
      if (npc.rec.activeAction) {
        npc.rec.activeAction.timeScale = 0.74 * npc.speed;
      }
      npc.rec.mixer.update(dt);
    }
  }
};
