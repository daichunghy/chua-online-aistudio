/**
 * Vòng animate, cutscene xe tới, bạn đồng hành, hoa đăng.
 *
 * Mixin của VinhTrang3DWorld: 11 method (updateAutoWalk … afterDraw).
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, findCharacterBones, _koiPos, _koiTan, normalizeAnimKey, CHAR_HEIGHTS } from './shared.mjs';
import {
  stepWalkingPhysics,
  getTerrainGroundHeight
} from '../../logic/modules/pathfinding-and-collision.mjs';
import { evaluatePigeonState } from '../../logic/modules/living-world.mjs';
import { detectGroundSurface } from '../../logic/modules/surface-footsteps.mjs';

function smoothstep01(t) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

export const renderLoopAndCutsceneMethods = {
  updateAutoWalk(dt) {
    if (!this.autoWalkWaypoints.length) return;
    if (!this.playerPhysics) {
      this.playerPhysics = { vx: 0, vz: 0, speed: 0, stridePhase: 0, gaitMode: 'normal', actualSpeed: 0 };
    }
    const wp = this.autoWalkWaypoints[0];
    const dx = wp.x - this.playerState.x;
    const dz = wp.z - this.playerState.z;
    const dist = Math.hypot(dx, dz);
    const isFinalWp = this.autoWalkWaypoints.length === 1;
    const reachRadius = isFinalWp ? 0.42 : 0.72;

    if (dist < reachRadius) {
      this.autoWalkWaypoints.shift();
      if (this._stuckTracker) {
        this._stuckTracker.timer = 0;
        this._stuckTracker.lastX = this.playerState.x;
        this._stuckTracker.lastZ = this.playerState.z;
      }
      if (this.autoWalkWaypoints.length === 0) {
        this.playerState.moving = false;
        this.playerPhysics.vx = 0;
        this.playerPhysics.vz = 0;
        this.playerPhysics.speed = 0;
        this.playerPhysics.actualSpeed = 0;
        if (wp.lookAt) {
          const ldx = wp.lookAt.x - this.playerState.x;
          const ldz = wp.lookAt.z - this.playerState.z;
          if (Math.hypot(ldx, ldz) > 0.75) {
            this.playerState.yaw = Math.atan2(ldx, ldz);
            this.cameraBaseYaw = this.playerState.yaw;
            this.cameraAzimuthOffset = 0;
          }
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

    const finalWp = this.autoWalkWaypoints[this.autoWalkWaypoints.length - 1];
    const distToFinal = isFinalWp
      ? dist
      : Math.hypot(finalWp.x - this.playerState.x, finalWp.z - this.playerState.z);

    const nx = dx / dist;
    const nz = dz / dist;
    const maxSpeed = this.getMaxWalkSpeed ? this.getMaxWalkSpeed() : (this.inInterior ? 3.85 : 4.65);
    const phys = stepWalkingPhysics(this.playerPhysics, nx, nz, {
      dt,
      maxSpeed,
      accel: this.playerPhysics.gaitMode === 'thien_hanh' ? 6.5 : 10.5,
      decel: 14.0,
      distToFinal,
      strideLength: this.playerPhysics.gaitMode === 'thien_hanh' ? 1.05 : 1.38
    });
    this.playerPhysics.vx = phys.vx;
    this.playerPhysics.vz = phys.vz;
    this.playerPhysics.speed = phys.speed;
    this.playerPhysics.stridePhase = phys.stridePhase;

    // Clamp single-frame step so we never overshoot the current waypoint
    const stepMag = Math.hypot(phys.stepDx, phys.stepDz);
    const stepScale = stepMag > dist && stepMag > 1e-4 ? dist / stepMag : 1;
    const prevX = this.playerState.x;
    const prevZ = this.playerState.z;
    const moved = this.tryMove(
      prevX + phys.stepDx * stepScale,
      prevZ + phys.stepDz * stepScale,
      0.52,
      dt
    );
    const actualDx = moved.x - prevX;
    const actualDz = moved.z - prevZ;
    const actualDist = Math.hypot(actualDx, actualDz);
    this.playerPhysics.actualSpeed = actualDist / Math.max(0.004, dt);
    this.playerState.x = moved.x;
    this.playerState.z = moved.z;

    // Face actual movement direction (with smooth corner lookahead when approaching intermediate waypoint)
    let steerX = actualDist > 0.01 ? actualDx / actualDist : nx;
    let steerZ = actualDist > 0.01 ? actualDz / actualDist : nz;
    if (dist < 1.65 && this.autoWalkWaypoints.length > 1) {
      const nextWp = this.autoWalkWaypoints[1];
      const ndx = nextWp.x - moved.x;
      const ndz = nextWp.z - moved.z;
      const nLen = Math.hypot(ndx, ndz);
      if (nLen > 0.2) {
        const blend = Math.max(0, Math.min(0.6, (1.65 - dist) / 1.65));
        steerX = steerX * (1 - blend) + (ndx / nLen) * blend;
        steerZ = steerZ * (1 - blend) + (ndz / nLen) * blend;
      }
    }
    const desiredYaw = Math.atan2(steerX, steerZ);
    this.playerState.yaw = this.lerpAngle(this.playerState.yaw, desiredYaw, 1 - Math.exp(-9.5 * dt));
    this.playerState.moving = true;

    if (phys.footstepTriggered && !this.arrivalCutscene?.active && this.playerPhysics.actualSpeed > 0.35) {
      const surface = detectGroundSurface(this.playerState.x, this.playerState.z, this.inInterior);
      this.onStepSound(surface);
      this.spawnFootstepBurst?.(this.playerState.x, this.playerElevationY || 0, this.playerState.z, this.playerState.yaw, surface);
    }

    // Smooth camera auto-follow along the walking heading (unless user just dragged the camera)
    const manualDragRecent = performance.now() - (this._lastCamDragAt || 0) < 2200;
    if (!manualDragRecent) {
      this.cameraBaseYaw = this.lerpAngle(this.cameraBaseYaw, this.playerState.yaw, 1 - Math.exp(-3.1 * dt));
      this.cameraAzimuthOffset *= Math.exp(-2.8 * dt);
    }

    // Stuck detector: re-route via A* once if blocked, or stop gracefully
    if (!this._stuckTracker) {
      this._stuckTracker = { lastX: moved.x, lastZ: moved.z, timer: 0, rerouted: false };
    }
    const progress = Math.hypot(moved.x - this._stuckTracker.lastX, moved.z - this._stuckTracker.lastZ);
    if (progress > 0.22) {
      this._stuckTracker.lastX = moved.x;
      this._stuckTracker.lastZ = moved.z;
      this._stuckTracker.timer = 0;
    } else {
      this._stuckTracker.timer += dt;
      if (this._stuckTracker.timer > 1.15) {
        const lastTargetWp = this.autoWalkWaypoints[this.autoWalkWaypoints.length - 1];
        if (!this._stuckTracker.rerouted && lastTargetWp) {
          this._stuckTracker.rerouted = true;
          this._stuckTracker.timer = 0;
          this.autoWalkWaypoints = this.computeSmartWaypoints(
            this.playerState.x,
            this.playerState.z,
            lastTargetWp.x,
            lastTargetWp.z,
            lastTargetWp.lookAt || null
          );
          this.updateWalkPathLine();
        } else {
          this.cancelAutoWalk();
          this.playerState.moving = false;
          this.playerPhysics.vx = 0;
          this.playerPhysics.vz = 0;
          this.playerPhysics.speed = 0;
          this.playerPhysics.actualSpeed = 0;
          return;
        }
      }
    }

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
          side: tr.side || 'right',
          onEntered: tr.onEntered
        };
      }
    } else if (tr.phase === 'enter_veil') {
      if (t >= 1) {
        this.ensureInteriorBuilt?.();
        this.inInterior = true;
        const entryPriority = tr.side === 'front_tam_quan' ? 'west_chanh_dien' : 'east_corridor';
        this.ensureInteriorAssetsLoaded(entryPriority).catch(() => {});
        this.exteriorGroup.visible = false;
        this.interiorGroup.visible = true;
        this.applyInteriorAtmosphere();
        this.playerElevationY = 0;
        if (this.playerPhysics) {
          this.playerPhysics.vx = 0;
          this.playerPhysics.vz = 0;
          this.playerPhysics.speed = 0;
          this.playerPhysics.actualSpeed = 0;
        }
        this._doorCooldownUntil = performance.now() + 2600;
        const isFront = tr.side === 'front_tam_quan';
        const entryYaw = isFront ? Math.PI * 0.5 : Math.PI - 0.34;
        const startX = isFront ? -36.2 : 15.1;
        const startZ = isFront ? 0.0 : 18.8;
        const targetX = isFront ? -33.6 : 14.5;
        const targetZ = isFront ? 0.0 : 16.0;
        this.playerState.x = startX;
        this.playerState.z = startZ;
        this.playerState.yaw = entryYaw;
        this.cameraBaseYaw = entryYaw;
        this.cameraAzimuthOffset = 0;
        this.snapCameraImmediate();
        this.updateSceneOcclusionCulling?.();
        this.nearestStallTrigger = null;
        this.onStallProximity(null);
        this.checkStationProximity();
        this.onInteriorStateChange(true);
        this.onTransitionFade(false);
        this.interiorTransition = {
          phase: 'walk_aisle',
          side: tr.side || 'right',
          entryYaw,
          timer: 0,
          duration: 0.85,
          startX,
          startZ,
          targetX,
          targetZ,
          onEntered: tr.onEntered
        };
      }
    } else if (tr.phase === 'walk_aisle') {
      this.playerState.x = tr.startX + (tr.targetX - tr.startX) * t;
      this.playerState.z = tr.startZ + (tr.targetZ - tr.startZ) * t;
      const entryYaw = typeof tr.entryYaw === 'number' ? tr.entryYaw : Math.PI - 0.34;
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
          this.playerState.x = 14.5;
          this.playerState.z = -37.2;
          this.playerState.yaw = Math.PI;
          this.cameraBaseYaw = Math.PI;
        } else if (tr.side === 'front_tam_quan') {
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
        this.playerState.moving = false;
        this.cameraAzimuthOffset = 0;
        this.onInteriorStateChange(false);
        this.onTransitionFade(false);
        this.interiorTransition = null;
        this.syncPlayerTransform();
        this.snapCameraImmediate();
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

    if (this.seatedBench && (this.heldDirs.size > 0 || Math.hypot(this.joystickVec?.x || 0, this.joystickVec?.z || 0) > 0.15)) {
      this.standUpFromBench?.();
    }

    if (this.interiorTransition) {
      this.stepInteriorTransition(trDt);
    } else {
      const walkDt = this.isSoftwareGl ? Math.max(dt, Math.min(rawDelta, 0.25)) : dt;
      this.updateHeldMovement(walkDt);
      this.updateAutoWalk(walkDt);
    }

    // Smooth damped camera gimbal every frame (eliminates 1-frame height/angle jumps)
    this.updateCameraDamped(this.isSoftwareGl ? trDt : dt);

    // Run zero-GC spatial occlusion & frustum culling BEFORE updating NPC mixers & rendering
    this.updateSceneOcclusionCulling?.();

    // Outdoor-only entrance camera tour & road traffic (completely paused while inside Chánh Điện!)
    if (!this.inInterior) {
      const tourStep = this.isSoftwareGl ? Math.max(dt, 0.14) : dt;
      this.stepArrivalCutscene(tourStep);
      this.stepEntranceTour(tourStep);
      this.stepRoadTraffic(this.isSoftwareGl ? trDt : dt);
    }

    if (this.activePlayerRecord) {
      if (this.playerState.moving) {
        // Gracefully cancel any stationary gesture (including meditation) when player starts walking
        if (this.proceduralPoseState?.action) {
          this.proceduralPoseState.action = null;
          this.proceduralPoseState.continuous = false;
          this.proceduralPoseState.timer = 0;
          this.activePlayerRecord.root.position.y = this.activePlayerRecord.baseY || 0;
          if (this.activePlayerRecord._handheldPhone) {
            this.activePlayerRecord._handheldPhone.visible = false;
          }
        }
        const physSpeed = this.playerPhysics?.actualSpeed || (this.arrivalCutscene?.active ? 3.2 : 4.2);
        const speedRatio = Math.max(0.28, Math.min(1.28, physSpeed / 4.2));
        this.playerState.moveBlend = Math.min(1, this.playerState.moveBlend + dt * 7.5);
        this.playClipCrossfade(this.activePlayerRecord, 'Di bo', 0.16, false);
        if (this.activePlayerRecord.activeAction) {
          this.activePlayerRecord.activeAction.paused = false;
          // Velocity-synced animation cadence eliminates foot sliding during accel, braking, or Thiền hành
          this.activePlayerRecord.activeAction.timeScale = speedRatio * (0.45 + 0.55 * this.playerState.moveBlend);
        }
        this.activePlayerRecord.mixer.update(dt);
      } else {
        this.playerState.moveBlend = Math.max(0, this.playerState.moveBlend - dt * 8.0);
        const activeName = normalizeAnimKey(this.activePlayerRecord.activeClipName);
        if ((activeName === 'di bo' || activeName === 'walk') && !this.proceduralPoseState?.action) {
          this.playClipCrossfade(this.activePlayerRecord, 'Dung', 0.22, false);
        }
        if (this.activePlayerRecord.activeAction) {
          this.activePlayerRecord.activeAction.paused = false;
          this.activePlayerRecord.activeAction.timeScale = 1.0;
        }
        this.activePlayerRecord.mixer.update(dt);
      }
      this.updateProceduralPoseFallback(dt);
    }

    this.stepPilgrimageCompanions(dt);

    if (!this.inInterior) {
      if (this.guidedBeaconGroup?.visible && this.guidedBeaconGroup.userData?.diamond) {
        this.guidedBeaconGroup.userData.diamond.rotation.y = elapsed * 1.4;
        this.guidedBeaconGroup.userData.diamond.position.y = 5.2 + Math.sin(elapsed * 2.6) * 0.38;
      }

      this.stepNpcRecordList(this.riggedNpcRecords, this.exteriorGroup, dt);

      for (let vi = 0; vi < this.vendorNpcRecords.length; vi++) {
        const vRec = this.vendorNpcRecords[vi];
        if (vRec._culled) continue;
        vRec.mixer.update(dt * 0.7);
      }

      for (let si = 0; si < this.smokeColumns.length; si++) {
        this.smokeColumns[si].update(dt, elapsed);
      }
      for (let li = 0; li < this.lotusSwayGroups.length; li++) {
        const ls = this.lotusSwayGroups[li];
        if (!ls.group.visible) continue;
        ls.group.rotation.z = Math.sin(elapsed * 1.4 + ls.phase) * 0.045;
        ls.group.rotation.x = Math.cos(elapsed * 1.1 + ls.phase) * 0.035;
      }
      if (this.floatingLanterns?.length) {
        for (let fi = 0; fi < this.floatingLanterns.length; fi++) {
          const fl = this.floatingLanterns[fi];
          fl.mesh.position.y = 0.04 + Math.sin(elapsed * 1.7 + fl.phase) * 0.025;
          fl.mesh.rotation.y += dt * 0.14;
          fl.mesh.rotation.z = Math.sin(elapsed * 1.3 + fl.phase) * 0.06;
          if (fl.flameMat) {
            fl.flameMat.emissiveIntensity = 0.85 + Math.sin(elapsed * 7.5 + fl.phase) * 0.28;
          }
        }
      }

      for (let ki = 0; ki < this.koiList.length; ki++) {
        const k = this.koiList[ki];
        if (k.curve && k.mesh?.visible !== false) {
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
      const isRainingNow = (this.weatherState?.rainIntensity || 0) > 0.25;
      const playerSnapshot = {
        x: this.playerState.x,
        z: this.playerState.z,
        speed: this.playerState.moving ? this.playerPhysics?.actualSpeed || 2.8 : 0,
        isMindful: this.playerPhysics?.gaitMode === 'thien_hanh' || !this.playerState.moving
      };
      for (let pi = 0; pi < this.pigeons.length; pi++) {
        const p = this.pigeons[pi];
        const nextP = evaluatePigeonState(
          {
            baseX: p.baseX,
            baseZ: p.baseZ,
            x: p.group.position.x,
            y: p.group.position.y,
            z: p.group.position.z,
            yaw: p.group.rotation.y,
            phase: p.phase,
            flying: p.flying,
            flyTimer: p.flyTimer
          },
          playerSnapshot,
          dt,
          isRainingNow,
          elapsed
        );
        p.flying = nextP.flying;
        p.flyTimer = nextP.flyTimer;
        p.group.position.set(nextP.x, nextP.y, nextP.z);
        p.group.rotation.y = nextP.yaw;
        if (p.wL && p.wR) {
          p.wL.rotation.z = nextP.wingAngle;
          p.wR.rotation.z = -nextP.wingAngle;
        }
      }

      for (const grp of this.courtyardLeafMeshes.values()) {
        if (!grp.visible) continue;
        grp.position.y = 0.025 + Math.sin(elapsed * 2.2 + (grp.userData.phase || 0)) * 0.015;
      }
    } else {
      // Interior-only updates: only tick non-culled worshippers & visible interior lotus/koi
      for (let ki = 0; ki < this.interiorKneelingRecords.length; ki++) {
        const kr = this.interiorKneelingRecords[ki];
        if (kr._culled) continue;
        kr.mixer.update(dt * 0.72);
      }
      if (this.interiorWalkingRecords?.length) {
        this.stepNpcRecordList(this.interiorWalkingRecords, this.interiorGroup, dt);
      }
      this.stepInteriorBellMonk?.(dt, elapsed);
    }

    // Animate Dâng hoa blooming & glowing lotus effect + active Dâng hương / Dâng hoa sequences + Mekong weather + Living World (zero GC)
    const ritualDt = this.isSoftwareGl ? Math.max(dt, 0.12) : dt;
    this.stepLotusBloom(ritualDt);
    this.stepOfferingAnimations?.(ritualDt);
    this.stepWeatherSystem?.(dt);
    this.stepLivingWorld3D?.(dt, elapsed);
    this.stepFootstepFX?.(dt);

    this.updateProjectedPins();
    this.updateCourtyardNpcInteraction();
    if (this.isSoftwareGl && document.querySelector('.modal-backdrop.open')) {
      window.setTimeout(() => this.animate(), 420);
      return;
    }
    try {
      this.renderer.render(this.scene, this.camera);
    } catch {}
    if (this.isSoftwareGl) {
      const activeClip = normalizeAnimKey(this.activePlayerRecord?.activeClipName || '');
      const hasNonIdleAction =
        activeClip &&
        activeClip !== 'dung' &&
        Boolean(this.activePlayerRecord?.activeAction && !this.activePlayerRecord.activeAction.paused);
      const isRaining = (this.weatherState?.rainIntensity || 0) > 0.05;
      const isActivelyAnimating =
        this.playerState.moving ||
        this.heldDirs.size > 0 ||
        this.autoWalkWaypoints.length > 0 ||
        this.entranceTour.active ||
        Boolean(this.arrivalCutscene?.active) ||
        Boolean(this.proceduralPoseState?.action) ||
        Boolean(this.seatedBench) ||
        this.lotusBloomState.active ||
        Boolean(this.activeOfferingAnimations?.length) ||
        Boolean(this.interiorTransition) ||
        isRaining ||
        hasNonIdleAction;
      this.afterDraw(() => this.animate(), isActivelyAnimating ? 120 : 520);
    } else {
      requestAnimationFrame(() => this.animate());
    }
  },

  triggerInteriorBellMonkStrike(immediate = true) {
    const bm = this.interiorBellMonk;
    if (!bm) return;
    bm.striking = true;
    bm.strikeTimer = 0;
    bm.strikeImpactFired = false;
    bm.cooldown = immediate ? 14.5 : bm.cooldown;
  },

  stepInteriorBellMonk(dt, elapsed) {
    const bm = this.interiorBellMonk;
    if (!bm || !bm.rec?.root) return;
    bm.rec.mixer?.update(dt * 0.75);

    if (!bm.striking) {
      bm.cooldown -= dt;
      if (bm.cooldown <= 0) {
        bm.striking = true;
        bm.strikeTimer = 0;
        bm.strikeImpactFired = false;
        bm.cooldown = 14.0 + Math.random() * 4.5;
      }
    }

    let swingAngle = 0;
    let bodyLean = 0;
    if (bm.striking) {
      bm.strikeTimer += dt;
      const dur = 2.2;
      const p = Math.min(1, bm.strikeTimer / dur);
      if (p < 0.35) {
        // Pull back the wooden striker gently
        const t = smoothstep01(p / 0.35);
        swingAngle = -0.42 * t;
        bodyLean = -0.06 * t;
      } else if (p < 0.56) {
        // Forward strike onto Đại Hồng Chung
        const t = smoothstep01((p - 0.35) / 0.21);
        swingAngle = THREE.MathUtils.lerp(-0.42, 0.56, t);
        bodyLean = THREE.MathUtils.lerp(-0.06, 0.16, t);
      } else {
        // Return calmly to serene posture
        const t = smoothstep01((p - 0.56) / 0.44);
        swingAngle = THREE.MathUtils.lerp(0.56, 0, t);
        bodyLean = THREE.MathUtils.lerp(0.16, 0, t);
      }

      if (!bm.strikeImpactFired && p >= 0.52) {
        bm.strikeImpactFired = true;
        bm.ringTimer = 0.001;
        if (bm.waveRing) {
          bm.waveRing.visible = true;
          bm.waveRing.scale.setScalar(0.5);
          if (bm.waveRing.material) bm.waveRing.material.opacity = 0.72;
        }
        const dist = Math.hypot(
          (this.playerState?.x || 0) - (-27.2),
          (this.playerState?.z || 0) - (-7.8)
        );
        this.onBellMonkStrike?.(dist);
      }

      if (p >= 1) {
        bm.striking = false;
        bm.strikeTimer = 0;
      }
    }

    // Apply pose to monk bones or striker pivot
    const bones = bm.rec._bones || (bm.rec._bones = findCharacterBones(bm.rec.root));
    if (bones.rightArm) {
      bones.rightArm.rotation.x = -0.58 - swingAngle * 0.95;
      bones.rightArm.rotation.z = -0.14;
    }
    if (bones.rightForearm) {
      bones.rightForearm.rotation.x = -0.52 - swingAngle * 0.45;
    }
    if (bones.spine) {
      bones.spine.rotation.x = 0.05 + bodyLean;
    }
    if (bm.strikerPivot) {
      bm.strikerPivot.rotation.x = swingAngle * 0.85;
    }
    if (this.interiorBellAnchor && bm.ringTimer > 0) {
      // Gentle physical bell resonance sway
      this.interiorBellAnchor.rotation.z = Math.sin(elapsed * 9.5) * 0.025 * Math.max(0, 1 - bm.ringTimer / 2.6);
    }

    // Expand golden soundwave ring around Đại Hồng Chung
    if (bm.ringTimer > 0 && bm.waveRing) {
      bm.ringTimer += dt;
      const rt = bm.ringTimer / 2.6;
      if (rt >= 1) {
        bm.ringTimer = 0;
        bm.waveRing.visible = false;
        if (this.interiorBellAnchor) this.interiorBellAnchor.rotation.z = 0;
      } else {
        bm.waveRing.scale.setScalar(0.55 + rt * 3.8);
        if (bm.waveRing.material) bm.waveRing.material.opacity = (1 - rt) * (1 - rt) * 0.68;
      }
    }
  },

  ensureHandheldPhoneProp(record) {
    if (!record?.root) return null;
    if (record._handheldPhone) return record._handheldPhone;
    const bones = record._bones || (record._bones = findCharacterBones(record.root));
    const parentBone = bones.rightHand || bones.rightForearm || record.root;
    const phone = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.085, 0.165, 0.014),
      new THREE.MeshStandardMaterial({ color: 0x1E222B, roughness: 0.35, metalness: 0.45 })
    );
    phone.add(body);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.072, 0.145),
      new THREE.MeshBasicMaterial({ color: 0xCBE8FF })
    );
    screen.position.z = 0.008;
    phone.add(screen);
    if (parentBone === record.root) {
      phone.position.set(0.24, 1.32, 0.44);
    } else {
      phone.position.set(0.02, 0.06, 0.05);
    }
    phone.visible = false;
    parentBone.add(phone);
    record._handheldPhone = phone;
    return phone;
  },

  applyExpressiveGesturePose(record, gestureKey, phaseTime, strength = 1.0, isMoving = false) {
    if (!record?.root) return;
    // Cache skeleton bone lookup once per character record (zero per-frame traversal!)
    const bones = record._bones || (record._bones = findCharacterBones(record.root));
    const g = normalizeAnimKey(gestureKey || '');
    const showPhone = g === 'chup anh' || g === 'chup_anh' || g === 'selfie';
    if (record._handheldPhone || showPhone) {
      const phone = this.ensureHandheldPhoneProp(record);
      if (phone) phone.visible = Boolean(showPhone && strength > 0.12);
    }

    if (!record._gesturePrev) record._gesturePrev = {};
    const deltas = {
      spine: [0, 0, 0],
      chest: [0, 0, 0],
      head: [0, 0, 0],
      rightArm: [0, 0, 0],
      leftArm: [0, 0, 0],
      rightForearm: [0, 0, 0],
      leftForearm: [0, 0, 0]
    };

    const s = Math.max(0, Math.min(1, strength));
    if (isMoving && this.playerPhysics?.gaitMode === 'thien_hanh' && record === this.activePlayerRecord) {
      // Mindful walking ("Thiền hành"): serene upright posture with forearms gently clasped at abdomen
      deltas.spine[0] = 0.04;
      deltas.head[0] = 0.06;
      deltas.rightArm[0] = -0.34;
      deltas.leftArm[0] = -0.34;
      deltas.rightArm[2] = -0.14;
      deltas.leftArm[2] = 0.14;
      deltas.rightForearm[0] = -0.58;
      deltas.leftForearm[0] = -0.58;
    } else if (!isMoving && !g) {
      // Subtle organic idle breathing & soft gaze when standing still
      const breath = Math.sin(phaseTime * 1.9);
      const glance = Math.sin(phaseTime * 0.55) * 0.11;
      deltas.chest[0] = breath * 0.024;
      deltas.head[1] = glance;
      deltas.head[0] = Math.sin(phaseTime * 0.9) * 0.026;
    } else if (s > 0.01 && g) {
      if (g === 'ngoi thien' || g === 'ngoi_thien') {
        // Seated peaceful meditation ("Ngồi thiền"): lowered torso, straight spine, hands resting on lap, slow breath
        const breath = Math.sin(phaseTime * 1.15);
        record.root.position.y = (record.baseY || 0) - 0.52 * s;
        deltas.spine[0] = 0.05 * s;
        deltas.chest[0] = breath * 0.028 * s;
        deltas.head[0] = (0.11 + breath * 0.018) * s;
        deltas.rightArm[0] = -0.36 * s;
        deltas.leftArm[0] = -0.36 * s;
        deltas.rightArm[2] = -0.18 * s;
        deltas.leftArm[2] = 0.18 * s;
        deltas.rightForearm[0] = -0.68 * s;
        deltas.leftForearm[0] = -0.68 * s;
      } else if (g === 'chup anh' || g === 'chup_anh') {
        deltas.rightArm[0] = -0.82 * s;
        deltas.rightArm[2] = -0.16 * s;
        deltas.leftArm[0] = -0.76 * s;
        deltas.leftArm[2] = 0.18 * s;
        deltas.rightForearm[0] = -0.58 * s;
        deltas.leftForearm[0] = -0.54 * s;
        deltas.head[0] = -0.05 * s;
        deltas.head[2] = Math.sin(phaseTime * 1.6) * 0.03 * s;
      } else if (g === 'selfie') {
        deltas.rightArm[0] = -1.12 * s;
        deltas.rightArm[2] = -0.22 * s;
        deltas.rightForearm[0] = -0.26 * s;
        deltas.leftArm[0] = -0.54 * s;
        deltas.leftArm[2] = 0.30 * s;
        deltas.leftForearm[2] = (0.24 + Math.sin(phaseTime * 5.2) * 0.10) * s;
        deltas.head[2] = -0.09 * s;
        deltas.head[1] = 0.08 * s;
      } else if (g === 'tro chuyen' || g === 'tro_chuyen') {
        const nod = Math.sin(phaseTime * 3.6) * 0.10 * s;
        const g1 = Math.sin(phaseTime * 4.2) * 0.20 * s;
        const g2 = Math.cos(phaseTime * 3.4) * 0.16 * s;
        deltas.head[0] = nod;
        deltas.head[1] = Math.sin(phaseTime * 1.4) * 0.09 * s;
        deltas.spine[1] = Math.sin(phaseTime * 1.6) * 0.05 * s;
        deltas.rightArm[0] = -(0.42 + g1) * s;
        deltas.rightForearm[0] = -(0.48 + g2) * s;
        deltas.leftArm[0] = -(0.34 - g1 * 0.7) * s;
        deltas.leftForearm[0] = -(0.38 - g2 * 0.6) * s;
      } else if (g === 'vay tay' || g === 'vay_tay') {
        const wave = Math.sin(phaseTime * 9.5) * 0.34 * s;
        deltas.rightArm[0] = -1.18 * s;
        deltas.rightArm[2] = -(0.34 + wave * 0.35) * s;
        deltas.rightForearm[2] = -wave;
        deltas.head[2] = 0.06 * s;
      } else if (g === 'ngam canh' || g === 'quat mat' || g === 'quat_mat') {
        const fan = Math.sin(phaseTime * 6.8) * 0.26 * s;
        deltas.rightArm[0] = -0.45 * s;
        deltas.rightForearm[2] = fan;
        deltas.head[1] = Math.sin(phaseTime * 1.15) * 0.30 * s;
        deltas.head[0] = -0.12 * s;
      } else if (g === 'quy') {
        record.root.position.y = (record.baseY || 0) - 0.34 * s;
        deltas.spine[0] = 0.32 * s;
        deltas.head[0] = 0.24 * s;
        deltas.leftArm[0] = -0.42 * s;
        deltas.rightArm[0] = -0.42 * s;
        deltas.leftForearm[0] = -0.56 * s;
        deltas.rightForearm[0] = -0.56 * s;
      } else if (g === 'vai') {
        // Respectful Vietnamese temple bow: palms joined at chest + dignified forward bow
        deltas.spine[0] = 0.42 * s;
        if (bones.chest && bones.chest !== bones.spine) deltas.chest[0] = 0.16 * s;
        deltas.head[0] = 0.26 * s;
        deltas.leftArm[0] = -0.48 * s;
        deltas.rightArm[0] = -0.48 * s;
        deltas.leftArm[2] = 0.22 * s;
        deltas.rightArm[2] = -0.22 * s;
        deltas.leftForearm[0] = -0.62 * s;
        deltas.rightForearm[0] = -0.62 * s;
      } else if (g === 'thap nhang' || g === 'chap tay' || g === 'chap_tay') {
        deltas.spine[0] = 0.14 * s;
        deltas.head[0] = 0.16 * s;
        deltas.leftArm[0] = -0.42 * s;
        deltas.rightArm[0] = -0.42 * s;
        deltas.leftArm[2] = 0.20 * s;
        deltas.rightArm[2] = -0.20 * s;
        deltas.leftForearm[0] = -0.62 * s;
        deltas.rightForearm[0] = -0.62 * s;
      }
    }

    const boneKeys = ['spine', 'chest', 'head', 'rightArm', 'leftArm', 'rightForearm', 'leftForearm'];
    for (let i = 0; i < boneKeys.length; i++) {
      const k = boneKeys[i];
      const bone = bones[k];
      if (!bone || (k === 'chest' && bone === bones.spine)) continue;
      const prev = record._gesturePrev[k];
      if (
        prev &&
        Math.abs(bone.rotation.x - prev.postX) < 1e-4 &&
        Math.abs(bone.rotation.y - prev.postY) < 1e-4 &&
        Math.abs(bone.rotation.z - prev.postZ) < 1e-4
      ) {
        bone.rotation.x = prev.baseX;
        bone.rotation.y = prev.baseY;
        bone.rotation.z = prev.baseZ;
      }
      const baseX = bone.rotation.x;
      const baseY = bone.rotation.y;
      const baseZ = bone.rotation.z;
      const [dx, dy, dz] = deltas[k];
      bone.rotation.x = baseX + dx;
      bone.rotation.y = baseY + dy;
      bone.rotation.z = baseZ + dz;
      record._gesturePrev[k] = {
        baseX,
        baseY,
        baseZ,
        postX: bone.rotation.x,
        postY: bone.rotation.y,
        postZ: bone.rotation.z
      };
    }
  },

  updateProceduralPoseFallback(dt) {
    if (!this.activePlayerRecord?.root) return;
    const elapsed = this.clock?.elapsedTime || 0;
    const st = this.proceduralPoseState;
    if (!st || !st.action) {
      if (this.activePlayerRecord._handheldPhone) {
        this.activePlayerRecord._handheldPhone.visible = false;
      }
      if (Math.abs(this.activePlayerRecord.root.position.y - (this.activePlayerRecord.baseY || 0)) > 0.002) {
        this.activePlayerRecord.root.position.y = THREE.MathUtils.lerp(
          this.activePlayerRecord.root.position.y,
          this.activePlayerRecord.baseY || 0,
          1 - Math.exp(-10 * dt)
        );
      }
      this.applyExpressiveGesturePose(this.activePlayerRecord, '', elapsed, 1.0, this.playerState.moving);
      return;
    }

    st.timer += dt;
    if (st.continuous) {
      const rampIn = smoothstep01(st.timer / 0.55);
      this.applyExpressiveGesturePose(this.activePlayerRecord, st.action, elapsed, rampIn, false);
      return;
    }

    const dur = Math.max(0.25, st.duration || 2.6);
    const p = Math.min(1, st.timer / dur);
    const rampIn = smoothstep01(p / 0.18);
    const rampOut = smoothstep01((1 - p) / 0.20);
    const act = normalizeAnimKey(st.action);
    const curve =
      act === 'vai' || act === 'quy' || act === 'thap nhang'
        ? Math.sin(smoothstep01(p) * Math.PI)
        : Math.min(rampIn, rampOut);

    this.applyExpressiveGesturePose(this.activePlayerRecord, st.action, elapsed + st.timer, curve, false);

    if (p >= 1) {
      st.action = null;
      st.timer = 0;
      st.partnerNpc = null;
      this.activePlayerRecord.root.position.y = this.activePlayerRecord.baseY || 0;
      if (this.activePlayerRecord._handheldPhone) {
        this.activePlayerRecord._handheldPhone.visible = false;
      }
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
      x: 42.6,
      z: 126.0,
      direction: -1,
      speed: 8.5,
      color: vehColor
    });
    if (vehicle?.group) {
      vehicle.group.rotation.y = Math.PI;
      vehicle.group.userData.isCutsceneVehicle = true;
    }

    // Temporarily tuck player inside drop-off spot while car drives straight North up the approach road
    this.playerState.x = 46.2;
    this.playerState.z = 56.5;
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

    // 0 -> 2.8s: vehicle drives straight North up the long straight approach road toward Cổng Phụ and pulls neatly beside the East curb
    if (cs.timer < 2.8) {
      const u = Math.min(1, cs.timer / 2.8);
      const ease = 1 - Math.pow(1 - u, 3);
      const pullT = Math.max(0, Math.min(1, (u - 0.5) / 0.48));
      const smoothPull = pullT * pullT * (3 - 2 * pullT);
      if (vGrp) {
        vGrp.position.x = THREE.MathUtils.lerp(42.6, 44.8, smoothPull);
        vGrp.position.z = THREE.MathUtils.lerp(126.0, 56.5, ease);
        const steerAngle = Math.sin(pullT * Math.PI) * 0.12;
        vGrp.rotation.y = Math.PI - steerAngle;
      }
      this.camera.position.set(
        THREE.MathUtils.lerp(36.5, 38.0, ease),
        THREE.MathUtils.lerp(4.8, 3.4, ease),
        THREE.MathUtils.lerp(136.0, 68.5, ease)
      );
      this.camera.lookAt(
        THREE.MathUtils.lerp(42.0, 41.2, ease),
        2.1,
        THREE.MathUtils.lerp(92.0, 41.5, ease)
      );
      return;
    }

    // 2.8 -> 6.8s: step out of vehicle onto the straight road centerline (x = 40.5) & walk strictly straight North into Cổng Phụ
    if (!cs.cuedArrival) {
      cs.cuedArrival = true;
      if (vGrp) {
        vGrp.position.set(44.8, 0, 56.5);
        vGrp.rotation.y = Math.PI;
      }
      this.playerContainer.visible = true;
      this.playerState.x = 40.5;
      this.playerState.z = 56.5;
      this.playerState.yaw = Math.PI;
      cs.onCue('step_out');
    }
    if (cs.timer < 6.8) {
      const w = (cs.timer - 2.8) / 4.0;
      const smoothW = w < 0.15 ? (w * w) / 0.15 : w > 0.85 ? 1 - ((1 - w) * (1 - w)) / 0.15 : w;
      const sx = 40.5;
      const sz = THREE.MathUtils.lerp(56.5, 43.8, smoothW);
      const sy = getTerrainGroundHeight(sx, sz, false);
      this.playerState.yaw = Math.PI;
      this.playerState.x = sx;
      this.playerState.z = sz;
      this.playerElevationY = sy;
      this.playerState.moving = true;
      if (this.playerPhysics) this.playerPhysics.actualSpeed = 3.2;
      this.playerContainer.position.set(sx, sy, sz);
      this.playerContainer.rotation.y = Math.PI;
      if (!cs.cuedWalkIn && w > 0.35) {
        cs.cuedWalkIn = true;
        cs.onCue('enter_gate');
      }
      this.camera.position.set(
        THREE.MathUtils.lerp(38.8, 40.5, w),
        THREE.MathUtils.lerp(3.2, 2.1, w),
        THREE.MathUtils.lerp(66.5, 50.8, w)
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

    const specs = (Array.isArray(modeConfig?.companions) ? modeConfig.companions : []).filter(
      (sp) => sp && sp.charKey !== 'du_khach'
    );
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
    const elapsed = this.clock?.elapsedTime || 0;
    const pYaw = this.playerState.yaw || 0;
    const fwdX = Math.sin(pYaw);
    const fwdZ = Math.cos(pYaw);
    const rightX = -fwdZ;
    const rightZ = fwdX;
    const playerPose = normalizeAnimKey(this.proceduralPoseState?.action || '');
    const isChatting = playerPose === 'tro chuyen' || playerPose === 'tro_chuyen';
    const isSelfie = playerPose === 'selfie';

    // Landmarks companions naturally glance toward when pausing in the courtyard
    const landmarks = [
      { x: 23.0, z: 1.0 },
      { x: -26.5, z: 4.0 },
      { x: -9.5, z: -23.5 },
      { x: 14.5, z: -49.0 }
    ];

    for (let ci = 0; ci < this.companionRecords.length; ci++) {
      const c = this.companionRecords[ci];
      c.rec.root.visible = !hideCompanions;
      if (hideCompanions) continue;

      // Comfortable side-by-side / gentle companion spacing; gather warmly close for Selfie or Family Chat!
      const sideScale = isSelfie ? 0.68 : isChatting ? 0.82 : 1.15;
      const backVal = isSelfie ? -0.32 : isChatting ? 0.95 : c.backOffset;
      let targetX = this.playerState.x + fwdX * backVal + rightX * (c.sideOffset * sideScale);
      let targetZ = this.playerState.z + fwdZ * backVal + rightZ * (c.sideOffset * sideScale);

      const pos = c.rec.root.position;
      pos.y = (this.playerElevationY || 0) + (c.rec.baseY || 0);
      const dx = targetX - pos.x;
      const dz = targetZ - pos.z;
      const d = Math.hypot(dx, dz);

      // Hysteresis stop threshold prevents jittery micro-following whenever player adjusts angle
      const startWalkDist = c.state === 'Di bo' ? 0.45 : 1.15;
      if (d > startWalkDist) {
        const speed = d > 4.0 ? 5.4 : d > 2.0 ? 4.2 : 2.9;
        const moveStep = Math.min(d, dt * speed);
        const nx = pos.x + (dx / d) * moveStep;
        const nz = pos.z + (dz / d) * moveStep;
        if (!this.checkCollision || !this.checkCollision(nx, nz)) {
          pos.x = nx;
          pos.z = nz;
        }
        const moveYaw = Math.atan2(dx, dz);
        c.yaw = this.lerpAngle(c.yaw, moveYaw, 1 - Math.exp(-7.0 * dt));
        c.rec.root.rotation.y = c.yaw;
        if (c.state !== 'Di bo') {
          c.state = 'Di bo';
          this.playClipCrossfade(c.rec, 'Di bo', 0.22, false);
        }
        if (c.rec.activeAction) c.rec.activeAction.timeScale = 0.72 + Math.min(0.32, d * 0.08);
        c.rec.mixer.update(dt);
      } else {
        let desiredYaw = pYaw;
        if (isChatting) {
          desiredYaw = Math.atan2(this.playerState.x - pos.x, this.playerState.z - pos.z);
        } else if (!this.inInterior && !isSelfie) {
          // Turn naturally toward the nearest grand statue/hall to admire it instead of staring blankly at player's back
          let bestLm = null;
          let bestD = Infinity;
          for (const lm of landmarks) {
            const ld = Math.hypot(lm.x - pos.x, lm.z - pos.z);
            if (ld < bestD) {
              bestD = ld;
              bestLm = lm;
            }
          }
          if (bestLm && bestD < 34) {
            desiredYaw = Math.atan2(bestLm.x - pos.x, bestLm.z - pos.z);
          }
        }
        c.yaw = this.lerpAngle(c.yaw, desiredYaw, 1 - Math.exp(-4.8 * dt));
        c.rec.root.rotation.y = c.yaw;
        if (c.state !== 'Dung') {
          c.state = 'Dung';
          this.playClipCrossfade(c.rec, 'Dung', 0.24, false);
        }
        c.rec.mixer.update(dt * 0.85);
        // Reciprocate family gestures naturally (chatting, waving for selfie, gentle sightseeing)
        const compGesture = isChatting
          ? 'tro_chuyen'
          : isSelfie
          ? 'vay_tay'
          : playerPose === 'vai' || playerPose === 'chap tay'
          ? 'chap_tay'
          : '';
        this.applyExpressiveGesturePose(c.rec, compGesture, elapsed + ci * 1.7, 0.92, false);
      }
    }
  },

  renderFloatingLanterns(wishes = []) {
    if (!this.lanternWishesGroup) return;
    while (this.lanternWishesGroup.children.length > 0) {
      this.lanternWishesGroup.remove(this.lanternWishesGroup.children[0]);
    }
    this.floatingLanterns = [];
    this.lanternClickTargets = [];
    const list = Array.isArray(wishes) ? wishes.slice(0, 24) : [];

    for (let i = 0; i < list.length; i++) {
      const w = list[i];
      const ang = (i / Math.max(1, list.length)) * Math.PI * 2 + i * 0.42;
      const rad = 1.6 + (i % 4) * 1.15;
      const lx = Number.isFinite(w.pondX) ? Math.max(-5.8, Math.min(5.8, w.pondX)) : Math.cos(ang) * rad;
      const lz = Number.isFinite(w.pondZ) ? Math.max(-5.8, Math.min(5.8, w.pondZ)) : Math.sin(ang) * rad;
      const holder = new THREE.Group();
      holder.position.set(lx, 0.04, lz);

      let mesh = null;
      if (this.propMeshCache.den_hoa_dang) {
        mesh = this.fitProp(this.propMeshCache.den_hoa_dang, 0.44);
      } else {
        mesh = new THREE.Group();
        const petalMat = new THREE.MeshStandardMaterial({
          color: w.colorHex ? new THREE.Color(w.colorHex) : 0xFF8AA8,
          emissive: 0xFF7B3B,
          emissiveIntensity: 0.34,
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

      // Generous invisible hit sphere so elderly users can tap floating lanterns easily
      const hitMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.46, 8, 6),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitMesh.position.y = 0.16;
      hitMesh.userData.lanternWish = w;
      holder.add(hitMesh);
      this.lanternClickTargets.push(hitMesh);

      holder.add(mesh);
      holder.userData.wishId = w.id;
      holder.userData.wishLabel = w.wishText || w.wish || w.categoryLabel || 'Hoa Đăng Nguyện Ước';
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
      if (state === gl.UNSIGNALED && polls < 400) {
        window.setTimeout(poll, 24);
      } else {
        gl.deleteSync(sync);
        const modalOpen = Boolean(document.querySelector('.modal-backdrop.open'));
        const nextDelay = modalOpen && this.isSoftwareGl ? Math.max(delayMs, 1100) : delayMs;
        window.setTimeout(cb, nextDelay);
      }
    };
    window.setTimeout(poll, 24);
  },

  stepNpcRecordList(list, parentGroup, dt) {
    if (!Array.isArray(list) || !list.length) return;
    const elapsed = this.clock?.elapsedTime || 0;
    for (let ni = 0; ni < list.length; ni++) {
      const npc = list[ni];
      const pos = npc.rec.root.position;
      const isCulled = Boolean(npc._culled);
      if (npc.pauseTimer > 0) {
        npc.pauseTimer -= dt;
        if (npc.pauseTimer <= 0 && npc.temporary && npc.removeAfterPause) {
          parentGroup?.remove(npc.rec.root);
          list.splice(ni, 1);
          ni -= 1;
          continue;
        }
        if (isCulled) continue;
        const desiredClip = npc.pauseClip === 'Chắp tay' ? 'Chắp tay' : 'Dung';
        if (npc.state !== desiredClip) {
          npc.state = desiredClip;
          this.playClipCrossfade(npc.rec, desiredClip, 0.24, false);
        }
        if (npc.lookX !== null && npc.lookZ !== null) {
          const lookYaw = Math.atan2(npc.lookX - pos.x, npc.lookZ - pos.z);
          npc.yaw = this.lerpAngle(npc.yaw, lookYaw, 1 - Math.exp(-5.0 * dt));
          npc.rec.root.rotation.y = npc.yaw;
        }
        npc.rec.mixer.update(dt * 0.75);
        this.applyExpressiveGesturePose(
          npc.rec,
          npc.pauseGesture || '',
          elapsed + ni * 1.37,
          0.95,
          false
        );
        continue;
      }

      if (npc.rec._handheldPhone) {
        npc.rec._handheldPhone.visible = false;
      }

      const target = npc.pts[npc.idx];
      const dx = target.x - pos.x;
      const dz = target.z - pos.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.45) {
        if (npc.temporary && npc.idx >= npc.pts.length - 1) {
          if (target.wait > 0) {
            npc.pauseTimer = target.wait;
            npc.pauseClip = target.action === 'chap_tay' ? 'Chắp tay' : 'Dung';
            npc.pauseGesture = target.action && target.action !== 'dung' ? target.action : '';
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
          npc.pauseGesture = target.action && target.action !== 'dung' ? target.action : '';
          npc.lookX = target.lookX;
          npc.lookZ = target.lookZ;
          npc.state = npc.pauseClip;
          this.playClipCrossfade(npc.rec, npc.pauseClip, 0.24, false);
          npc.rec.mixer.update(dt);
          continue;
        }
        npc.pauseGesture = '';
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
      if (pDist > 0.01 && pDist < 1.15) {
        const push = (1.15 - pDist) * 0.72;
        dirX += (pdx / pDist) * push;
        dirZ += (pdz / pDist) * push;
      }
      for (let oi = 0; oi < list.length; oi++) {
        if (oi === ni) continue;
        const other = list[oi].rec.root.position;
        const odx = pos.x - other.x;
        const odz = pos.z - other.z;
        const oDist = Math.hypot(odx, odz);
        if (oDist > 0.01 && oDist < 0.92) {
          const push = (0.92 - oDist) * 0.58;
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
      npc.yaw = this.lerpAngle(npc.yaw, targetYaw, 1 - Math.exp(-6.0 * dt));
      npc.rec.root.rotation.y = npc.yaw;
      if (npc.state !== 'walk') {
        npc.state = 'walk';
        this.playClipCrossfade(npc.rec, 'Di bo', 0.22, false);
      }
      if (npc.rec.activeAction) {
        npc.rec.activeAction.timeScale = 0.74 * npc.speed;
      }
      npc.rec.mixer.update(dt);
    }
  }
};
