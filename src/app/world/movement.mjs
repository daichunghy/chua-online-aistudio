/**
 * Di chuyển, giải va chạm đa lượt (MTV), tìm đường A* tránh vật cản và soft joystick.
 *
 * Mixin của VinhTrang3DWorld.
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, findAnyTempleDestination, WORLD_BOUNDS } from './shared.mjs';
import {
  resolveMultiPassCollision,
  buildNavigationGrid,
  optimizeEntrancePath,
  getTerrainGroundHeight,
  stepWalkingPhysics
} from '../../logic/modules/pathfinding-and-collision.mjs';
import { detectGroundSurface } from '../../logic/modules/surface-footsteps.mjs';

const INTERIOR_BOUNDS = {
  minX: -61.5,
  maxX: 31.3,
  minZ: -55.6,
  maxZ: 20.35
};

export const movementMethods = {
  getActiveBounds() {
    return this.inInterior ? INTERIOR_BOUNDS : WORLD_BOUNDS;
  },

  setGaitMode(mode = 'normal') {
    const next = mode === 'thien_hanh' ? 'thien_hanh' : 'normal';
    if (!this.playerPhysics) {
      this.playerPhysics = { vx: 0, vz: 0, speed: 0, stridePhase: 0, gaitMode: next, actualSpeed: 0 };
    } else {
      this.playerPhysics.gaitMode = next;
    }
    return next;
  },

  getMaxWalkSpeed() {
    if (this.playerPhysics?.gaitMode === 'thien_hanh') {
      return this.inInterior ? 1.55 : 1.75;
    }
    return this.inInterior ? 3.85 : 4.65;
  },

  getNavigationGrid() {
    if (this.inInterior) {
      if (!this.navGridInterior) {
        this.navGridInterior = buildNavigationGrid({
          bounds: INTERIOR_BOUNDS,
          cellSize: 0.95,
          circles: this.interiorObstacles || [],
          rects: this.interiorRectObstacles || [],
          agentRadius: 0.54,
          clearance: 0.14
        });
      }
      return this.navGridInterior;
    }
    if (!this.navGridExterior) {
      this.navGridExterior = buildNavigationGrid({
        bounds: WORLD_BOUNDS,
        cellSize: 1.45,
        circles: this.obstacles || [],
        rects: this.rectObstacles || [],
        agentRadius: 0.56,
        clearance: 0.18
      });
    }
    return this.navGridExterior;
  },

  tryMove(nx, nz, radius = 0.52, dt = 0.016) {
    const curX = this.playerState.x;
    const curZ = this.playerState.z;
    const bounds = this.getActiveBounds();
    const circles = this.inInterior ? this.interiorObstacles : this.obstacles;
    const rects = this.inInterior ? this.interiorRectObstacles : this.rectObstacles;

    const solved = resolveMultiPassCollision(curX, curZ, nx, nz, {
      radius,
      bounds,
      circles,
      rects,
      passes: 3
    });
    const x = solved.x;
    const z = solved.z;

    const targetElevation = getTerrainGroundHeight(x, z, this.inInterior);
    const curElev = Number.isFinite(this.playerElevationY) ? this.playerElevationY : 0;
    const dampT = 1 - Math.exp(-16 * Math.max(0.008, dt));
    this.playerElevationY = curElev + (targetElevation - curElev) * dampT;

    return { x, z, collided: solved.collided };
  },

  lerpAngle(a, b, t) {
    const diff = Math.atan2(Math.sin(b - a), Math.cos(b - a));
    return a + diff * Math.min(1, Math.max(0, t));
  },

  computeSmartWaypoints(fromX, fromZ, toX, toZ, lookAt = null) {
    const grid = this.getNavigationGrid();
    const finalPts = optimizeEntrancePath(grid, fromX, fromZ, toX, toZ, this.inInterior);

    // Drop jittery / backwards initial waypoints snapped to a cell behind the player
    while (finalPts.length > 1) {
      const p0 = finalPts[0];
      const p1 = finalPts[1];
      const d0 = Math.hypot(p0.x - fromX, p0.z - fromZ);
      if (d0 < 0.95) {
        finalPts.shift();
        continue;
      }
      const vx0 = p0.x - fromX;
      const vz0 = p0.z - fromZ;
      const vx1 = p1.x - fromX;
      const vz1 = p1.z - fromZ;
      const dot = vx0 * vx1 + vz0 * vz1;
      if (dot < -0.15 && d0 < 2.6) {
        finalPts.shift();
        continue;
      }
      break;
    }

    if (finalPts.length === 0) {
      finalPts.push({ x: toX, z: toZ });
    }
    if (lookAt) {
      finalPts[finalPts.length - 1].lookAt = lookAt;
    }
    return finalPts;
  },

  buildPerimeterSafeWaypoints(fromX, fromZ, toX, toZ, via = null, lookAt = null) {
    return this.computeSmartWaypoints(fromX, fromZ, toX, toZ, lookAt);
  },

  walkToStation(stationOrId, onArrival = null) {
    this.cancelEntranceTour();
    const st =
      typeof stationOrId === 'object'
        ? stationOrId
        : findAnyTempleDestination(stationOrId);
    if (!st) return;

    if (this.inInterior) {
      this.toggleInterior(false, this.lastDoorSide);
    }

    const tx = st.standPos ? st.standPos.x : st.pos.x;
    const tz = st.standPos ? st.standPos.z : st.pos.z;
    const pts = this.computeSmartWaypoints(
      this.playerState.x,
      this.playerState.z,
      tx,
      tz,
      st.lookAt
    );

    this.autoWalkWaypoints = pts;
    this.autoWalkCallback = onArrival;
    this.autoWalkStation = st;
    this._stuckTracker = {
      lastX: this.playerState.x,
      lastZ: this.playerState.z,
      timer: 0,
      rerouted: false
    };
    const finalTarget = pts[pts.length - 1] || { x: tx, z: tz };
    if (this.walkTargetRing) {
      this.walkTargetRing.position.set(
        finalTarget.x,
        getTerrainGroundHeight(finalTarget.x, finalTarget.z, this.inInterior) + 0.06,
        finalTarget.z
      );
      this.walkTargetRing.visible = true;
    }
    this.updateWalkPathLine();
    this.onAutoWalkTargetChange(st);
  },

  cancelAutoWalk() {
    if (this.autoWalkWaypoints.length > 0 || this.autoWalkStation) {
      this.autoWalkWaypoints = [];
      this.autoWalkCallback = null;
      this.autoWalkStation = null;
      if (this.walkTargetRing) this.walkTargetRing.visible = false;
      if (this.walkPathLine) this.walkPathLine.visible = false;
      this.onAutoWalkTargetChange(null);
    }
  },

  updateWalkPathLine() {
    if (this.walkPathLine) {
      this.scene.remove(this.walkPathLine);
      this.walkPathLine.geometry.dispose();
      this.walkPathLine = null;
    }
    if (!this.autoWalkWaypoints.length) return;
    const curY = getTerrainGroundHeight(this.playerState.x, this.playerState.z, this.inInterior) + 0.09;
    const points = [new THREE.Vector3(this.playerState.x, curY, this.playerState.z)];
    for (const wp of this.autoWalkWaypoints) {
      const wy = getTerrainGroundHeight(wp.x, wp.z, this.inInterior) + 0.09;
      points.push(new THREE.Vector3(wp.x, wy, wp.z));
    }
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: 0xFFD166, transparent: true, opacity: 0.85 });
    this.walkPathLine = new THREE.Line(geom, mat);
    this.scene.add(this.walkPathLine);
  },

  setJoystickInput(vx = 0, vz = 0) {
    const mag = Math.hypot(vx, vz);
    if (mag > 0.08) {
      this.cancelEntranceTour();
      this.cancelAutoWalk();
      this.joystickVec.x = Math.max(-1, Math.min(1, vx));
      this.joystickVec.z = Math.max(-1, Math.min(1, vz));
    } else {
      this.joystickVec.x = 0;
      this.joystickVec.z = 0;
      this.stopMoving();
    }
  },

  moveStep(dx, dz, speed = 0.22) {
    if (dx !== 0 || dz !== 0) {
      this.cancelEntranceTour();
      this.cancelAutoWalk();
    }
    const len = Math.hypot(dx, dz);
    if (len < 0.001) {
      this.playerState.moving = false;
      return this.playerState;
    }
    const nx = dx / len;
    const nz = dz / len;
    const targetX = this.playerState.x + nx * speed;
    const targetZ = this.playerState.z + nz * speed;
    const moved = this.tryMove(targetX, targetZ);
    this.playerState.x = moved.x;
    this.playerState.z = moved.z;
    const targetYaw = Math.atan2(nx, nz);
    this.playerState.yaw = this.lerpAngle(this.playerState.yaw, targetYaw, 0.32);
    this.playerState.moving = true;
    clearTimeout(this._nudgeStopTimer);
    this._nudgeStopTimer = setTimeout(() => {
      if (
        this.heldDirs.size === 0 &&
        this.autoWalkWaypoints.length === 0 &&
        Math.hypot(this.joystickVec?.x || 0, this.joystickVec?.z || 0) <= 0.08
      ) {
        this.playerState.moving = false;
      }
    }, 360);
    this.syncPlayerTransform();
    this.checkStationProximity();
    this.checkInteriorDoorTransition();
    return this.playerState;
  },

  updateHeldMovement(dt) {
    if (!this.playerPhysics) {
      this.playerPhysics = { vx: 0, vz: 0, speed: 0, stridePhase: 0, gaitMode: 'normal', actualSpeed: 0 };
    }
    let ix = 0;
    let iz = 0;
    if (this.heldDirs && this.heldDirs.size > 0) {
      if (this.heldDirs.has('up')) iz -= 1;
      if (this.heldDirs.has('down')) iz += 1;
      if (this.heldDirs.has('left')) ix -= 1;
      if (this.heldDirs.has('right')) ix += 1;
    }

    const jx = this.joystickVec?.x || 0;
    const jz = this.joystickVec?.z || 0;
    const jMag = Math.hypot(jx, jz);
    if (ix === 0 && iz === 0 && jMag > 0.08) {
      ix = jx;
      iz = jz;
    }

    const inputMag = Math.hypot(ix, iz);
    if (inputMag < 0.05) {
      // Smooth braking deceleration when keys/joystick released (if not auto-walking)
      if (!this.autoWalkWaypoints?.length && this.playerPhysics.speed > 0.04) {
        const res = stepWalkingPhysics(this.playerPhysics, 0, 0, {
          dt,
          maxSpeed: this.getMaxWalkSpeed(),
          decel: 16.0
        });
        this.playerPhysics.vx = res.vx;
        this.playerPhysics.vz = res.vz;
        this.playerPhysics.speed = res.speed;
        this.playerPhysics.stridePhase = res.stridePhase;
        if (res.moving) {
          const prevX = this.playerState.x;
          const prevZ = this.playerState.z;
          const moved = this.tryMove(prevX + res.stepDx, prevZ + res.stepDz, 0.52, dt);
          this.playerState.x = moved.x;
          this.playerState.z = moved.z;
          this.playerPhysics.actualSpeed = Math.hypot(moved.x - prevX, moved.z - prevZ) / Math.max(0.004, dt);
          this.playerState.moving = this.playerPhysics.actualSpeed > 0.14;
          this.syncPlayerTransform();
        } else {
          this.playerPhysics.actualSpeed = 0;
          this.playerState.moving = false;
        }
      }
      return;
    }

    const clampedMag = Math.min(1, inputMag);
    const normX = ix / inputMag;
    const normZ = iz / inputMag;

    const angle = this.cameraBaseYaw + this.cameraAzimuthOffset;
    const forwardX = Math.sin(angle);
    const forwardZ = Math.cos(angle);
    const rightX = -forwardZ;
    const rightZ = forwardX;

    const worldDx = forwardX * (-normZ) + rightX * normX;
    const worldDz = forwardZ * (-normZ) + rightZ * normX;

    const maxSpeed = this.getMaxWalkSpeed();
    const phys = stepWalkingPhysics(this.playerPhysics, worldDx, worldDz, {
      dt,
      maxSpeed,
      accel: this.playerPhysics.gaitMode === 'thien_hanh' ? 6.5 : 11.5,
      decel: 15.0,
      inputScale: clampedMag,
      strideLength: this.playerPhysics.gaitMode === 'thien_hanh' ? 1.05 : 1.38
    });
    this.playerPhysics.vx = phys.vx;
    this.playerPhysics.vz = phys.vz;
    this.playerPhysics.speed = phys.speed;
    this.playerPhysics.stridePhase = phys.stridePhase;

    const prevX = this.playerState.x;
    const prevZ = this.playerState.z;
    const moved = this.tryMove(prevX + phys.stepDx, prevZ + phys.stepDz, 0.52, dt);
    const actualDx = moved.x - prevX;
    const actualDz = moved.z - prevZ;
    const actualDist = Math.hypot(actualDx, actualDz);
    this.playerPhysics.actualSpeed = actualDist / Math.max(0.004, dt);

    // Prevent velocity wind-up against walls
    if (moved.collided && actualDist < phys.speed * dt * 0.45) {
      this.playerPhysics.vx = actualDx / Math.max(0.004, dt);
      this.playerPhysics.vz = actualDz / Math.max(0.004, dt);
      this.playerPhysics.speed = this.playerPhysics.actualSpeed;
    }

    this.playerState.x = moved.x;
    this.playerState.z = moved.z;
    const targetYaw = Math.atan2(worldDx, worldDz);
    this.playerState.yaw = this.lerpAngle(
      this.playerState.yaw,
      targetYaw,
      1 - Math.exp(-9.5 * dt)
    );
    this.playerState.moving = true;

    if (phys.footstepTriggered && !this.arrivalCutscene?.active && this.playerPhysics.actualSpeed > 0.35) {
      const surface = detectGroundSurface(this.playerState.x, this.playerState.z, this.inInterior);
      this.onStepSound(surface);
      this.spawnFootstepBurst?.(this.playerState.x, this.playerElevationY || 0, this.playerState.z, this.playerState.yaw, surface);
    }

    // Only auto-follow camera yaw when walking predominantly forward (never fight A/D strafing or reverse)
    const manualDragRecent = performance.now() - (this._lastCamDragAt || 0) < 2600;
    if (!manualDragRecent && normZ < -0.55 && Math.abs(normX) < 0.45) {
      const followRate = 1 - Math.exp(-1.55 * dt);
      this.cameraBaseYaw = this.lerpAngle(this.cameraBaseYaw, this.playerState.yaw, followRate);
      this.cameraAzimuthOffset *= Math.exp(-2.2 * dt);
    }

    this.syncPlayerTransform();
    this.checkStationProximity();
    this.checkInteriorDoorTransition();
  },

  checkInteriorDoorTransition() {
    if (this.interiorTransition || performance.now() < (this._doorCooldownUntil || 0)) return;
    const px = this.playerState.x;
    const pz = this.playerState.z;
    if (this.inInterior) {
      return;
    }
    if (this.autoWalkWaypoints?.length > 0 && this.autoWalkStation?.key !== 'chanh_dien') {
      return;
    }
    if (pz >= -18.4 && pz <= -10.6 && px >= 34.0 && px <= 37.2) {
      this.enterInteriorGradual('right');
    } else if (px >= 20.4 && px <= 25.6 && pz >= 7.6 && pz <= 9.1) {
      this.enterInteriorGradual('front_tam_quan');
    }
  },

  stopMoving() {
    const jMag = Math.hypot(this.joystickVec?.x || 0, this.joystickVec?.z || 0);
    if (this.autoWalkWaypoints.length === 0 && this.heldDirs.size === 0 && jMag <= 0.08) {
      this.playerState.moving = false;
      if (this.playerPhysics) {
        this.playerPhysics.vx = 0;
        this.playerPhysics.vz = 0;
        this.playerPhysics.speed = 0;
        this.playerPhysics.actualSpeed = 0;
      }
    }
  },

  teleportToStation(stationId) {
    this.cancelEntranceTour();
    const st = findAnyTempleDestination(stationId);
    if (!st) return;
    this.cancelAutoWalk();
    if (this.inInterior) this.toggleInterior(false, this.lastDoorSide);
    const sx = st.standPos ? st.standPos.x : st.pos.x;
    const sz = st.standPos ? st.standPos.z : st.pos.z;
    this.playerState.x = sx;
    this.playerState.z = sz;
    if (st.lookAt) {
      this.playerState.yaw = Math.atan2(st.lookAt.x - sx, st.lookAt.z - sz);
      this.cameraBaseYaw = this.playerState.yaw;
      this.cameraAzimuthOffset = 0;
    }
    this.playerState.moving = false;
    this.currentStationId = st.id;
    this.syncPlayerTransform();
    this.snapCameraImmediate();
    this.checkStationProximity();
    this.onStationProximity(st, 0);
  },

  walkToPoint(x, z, label = '') {
    const tx = Number(x);
    const tz = Number(z);
    if (!Number.isFinite(tx) || !Number.isFinite(tz)) return;
    this.cancelEntranceTour();
    const pts = this.computeSmartWaypoints(
      this.playerState.x,
      this.playerState.z,
      tx,
      tz,
      { x: tx, y: 1.2, z: tz }
    );
    this.autoWalkWaypoints = pts;
    this.autoWalkCallback = null;
    this.autoWalkStation = label ? { name: label, key: 'walk_point' } : null;
    this._stuckTracker = {
      lastX: this.playerState.x,
      lastZ: this.playerState.z,
      timer: 0,
      rerouted: false
    };
    const finalTarget = pts[pts.length - 1] || { x: tx, z: tz };
    if (this.walkTargetRing) {
      this.walkTargetRing.position.set(finalTarget.x, 0.06, finalTarget.z);
      this.walkTargetRing.visible = true;
    }
    this.updateWalkPathLine();
    this.onAutoWalkTargetChange(this.autoWalkStation);
  }
};
