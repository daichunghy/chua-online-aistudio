/**
 * Di chuyển, va chạm, tự đi tới trạm (walkToStation) và đường dẫn.
 *
 * Mixin của VinhTrang3DWorld: 12 method (tryMove … walkToPoint).
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, findAnyTempleDestination, WORLD_BOUNDS } from './shared.mjs';

export const movementMethods = {
  tryMove(nx, nz, radius = 0.42) {
    const curX = this.playerState.x;
    const curZ = this.playerState.z;
    let bounds;
    if (this.inInterior) {
      bounds = {
        minX: -20.1,
        maxX: 24.3,
        minZ: -20.1,
        maxZ: 20.35
      };
    } else {
      bounds = WORLD_BOUNDS;
    }
    let x = Math.max(bounds.minX, Math.min(bounds.maxX, nx));
    let z = Math.max(bounds.minZ, Math.min(bounds.maxZ, nz));

    const circles = this.inInterior ? this.interiorObstacles : this.obstacles;
    const rects = this.inInterior ? this.interiorRectObstacles : this.rectObstacles;

    for (const c of circles) {
      const dx = x - c.x;
      const dz = z - c.z;
      const dist = Math.hypot(dx, dz);
      const minD = c.r + radius;
      if (dist < minD) {
        const prevDist = Math.hypot(curX - c.x, curZ - c.z);
        if (prevDist < minD && dist > prevDist) {
          continue;
        }
        const nLen = dist || 0.001;
        x = c.x + (dx / nLen) * minD;
        z = c.z + (dz / nLen) * minD;
      }
    }

    for (const b of rects) {
      if (
        x > b.minX - radius &&
        x < b.maxX + radius &&
        z > b.minZ - radius &&
        z < b.maxZ + radius
      ) {
        const prevInside =
          curX > b.minX - radius &&
          curX < b.maxX + radius &&
          curZ > b.minZ - radius &&
          curZ < b.maxZ + radius;
        if (prevInside) continue;
        const canX = !(
          x > b.minX - radius &&
          x < b.maxX + radius &&
          curZ > b.minZ - radius &&
          curZ < b.maxZ + radius
        );
        const canZ = !(
          curX > b.minX - radius &&
          curX < b.maxX + radius &&
          z > b.minZ - radius &&
          z < b.maxZ + radius
        );
        if (canX) z = curZ;
        else if (canZ) x = curX;
        else {
          x = curX;
          z = curZ;
        }
      }
    }

    if (this.inInterior) {
      this.playerElevationY = 0;
    } else if (x >= 54.4 && x <= 64.6 && z >= 7.6 && z <= 21.4) {
      this.playerElevationY = 1.14;
    } else if (x >= 52.0 && x < 54.4 && z >= 12.6 && z <= 16.4) {
      this.playerElevationY = ((x - 52.0) / 2.4) * 1.14;
    } else {
      this.playerElevationY = 0;
    }

    return { x, z };
  },

  lerpAngle(a, b, t) {
    let diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (diff < -Math.PI) diff += Math.PI * 2;
    return a + diff * Math.min(1, t);
  },

  buildPerimeterSafeWaypoints(fromX, fromZ, toX, toZ, via = null, lookAt = null) {
    const pts = [];
    const curOutside = fromZ > 42.1;
    const destInside = toZ < 40.9;
    const curInside = fromZ < 40.9;
    const destOutside = toZ > 42.1;

    if (curOutside && destInside) {
      if (Math.hypot(fromX - 40.5, fromZ - 45.2) > 1.8) pts.push({ x: 40.5, z: 45.2 });
      pts.push({ x: 40.5, z: 41.5 });
      pts.push({ x: 39.2, z: 35.8 });
    } else if (curInside && destOutside) {
      if (Math.hypot(fromX - 39.2, fromZ - 35.8) > 1.8) pts.push({ x: 39.2, z: 35.8 });
      pts.push({ x: 40.5, z: 41.5 });
      pts.push({ x: 40.5, z: 45.2 });
    }

    if (Array.isArray(via)) {
      const distToDest = Math.hypot(toX - fromX, toZ - fromZ);
      for (const [vx, vz] of via) {
        if ((vx === 40.5 && vz === 41.5) && pts.some((p) => p.x === 40.5 && p.z === 41.5)) {
          continue;
        }
        const lastPt = pts.length ? pts[pts.length - 1] : { x: fromX, z: fromZ };
        const dFromLast = Math.hypot(vx - lastPt.x, vz - lastPt.z);
        const wpToDest = Math.hypot(toX - vx, toZ - vz);
        if (dFromLast > 1.6 && (pts.length > 0 || wpToDest < distToDest - 1.2)) {
          pts.push({ x: vx, z: vz });
        }
      }
    }
    pts.push({ x: toX, z: toZ, lookAt });
    return pts;
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
    const pts = this.buildPerimeterSafeWaypoints(
      this.playerState.x,
      this.playerState.z,
      tx,
      tz,
      st.via,
      st.lookAt
    );

    this.autoWalkWaypoints = pts;
    this.autoWalkCallback = onArrival;
    this.autoWalkStation = st;
    this.walkTargetRing.position.set(tx, 0.06, tz);
    this.walkTargetRing.visible = true;
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
    const points = [new THREE.Vector3(this.playerState.x, 0.08, this.playerState.z)];
    for (const wp of this.autoWalkWaypoints) {
      points.push(new THREE.Vector3(wp.x, 0.08, wp.z));
    }
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: 0xFFD166, transparent: true, opacity: 0.85 });
    this.walkPathLine = new THREE.Line(geom, mat);
    this.scene.add(this.walkPathLine);
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
      if (this.heldDirs.size === 0 && this.autoWalkWaypoints.length === 0) {
        this.playerState.moving = false;
      }
    }, 360);
    this.syncPlayerTransform();
    this.checkStationProximity();
    this.checkInteriorDoorTransition();
    return this.playerState;
  },

  updateHeldMovement(dt) {
    if (!this.heldDirs || this.heldDirs.size === 0) return;
    let ix = 0;
    let iz = 0;
    if (this.heldDirs.has('up')) iz -= 1;
    if (this.heldDirs.has('down')) iz += 1;
    if (this.heldDirs.has('left')) ix -= 1;
    if (this.heldDirs.has('right')) ix += 1;
    if (ix === 0 && iz === 0) return;

    const len = Math.hypot(ix, iz) || 1;
    ix /= len;
    iz /= len;

    const angle = this.cameraBaseYaw + this.cameraAzimuthOffset;
    const forwardX = Math.sin(angle);
    const forwardZ = Math.cos(angle);
    const rightX = -forwardZ;
    const rightZ = forwardX;

    const worldDx = forwardX * (-iz) + rightX * ix;
    const worldDz = forwardZ * (-iz) + rightZ * ix;
    const speed = 5.4 * dt;
    const moved = this.tryMove(
      this.playerState.x + worldDx * speed,
      this.playerState.z + worldDz * speed
    );
    this.playerState.x = moved.x;
    this.playerState.z = moved.z;
    this.playerState.yaw = this.lerpAngle(
      this.playerState.yaw,
      Math.atan2(worldDx, worldDz),
      Math.min(1, dt * 12)
    );
    this.playerState.moving = true;
    this.syncPlayerTransform();
    this.checkStationProximity();
    this.checkInteriorDoorTransition();
  },

  checkInteriorDoorTransition() {
    if (this.interiorTransition || performance.now() < (this._doorCooldownUntil || 0)) return;
    const px = this.playerState.x;
    const pz = this.playerState.z;
    if (this.inInterior) {
      if (px >= 13.5 && px <= 17.5 && pz >= 19.65) {
        this.exitInteriorGradual('right');
      }
    } else {
      // Stepping onto the widened End-of-Road Left-Turn Shoe-Removal Veranda & Wooden Door (x = 34.0..38.0, z = -18.4..-10.6)
      if (pz >= -18.4 && pz <= -10.6 && px >= 34.0 && px <= 38.0) {
        this.enterInteriorGradual('right');
      }
    }
  },

  stopMoving() {
    if (this.autoWalkWaypoints.length === 0 && this.heldDirs.size === 0) {
      this.playerState.moving = false;
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
    this.checkStationProximity();
    this.onStationProximity(st, 0);
  },

  walkToPoint(x, z, label = '') {
    const tx = Number(x);
    const tz = Number(z);
    if (!Number.isFinite(tx) || !Number.isFinite(tz)) return;
    this.cancelEntranceTour();
    if (this.inInterior) {
      this.toggleInterior(false, this.lastDoorSide);
    }
    const pts = this.buildPerimeterSafeWaypoints(
      this.playerState.x,
      this.playerState.z,
      tx,
      tz,
      null,
      { x: tx, y: 1.2, z: tz }
    );
    this.autoWalkWaypoints = pts;
    this.autoWalkCallback = null;
    this.autoWalkStation = label ? { name: label, key: 'walk_point' } : null;
    if (this.walkTargetRing) {
      this.walkTargetRing.position.set(tx, 0.06, tz);
      this.walkTargetRing.visible = true;
    }
    this.updateWalkPathLine();
    this.onAutoWalkTargetChange(this.autoWalkStation);
  }
};
