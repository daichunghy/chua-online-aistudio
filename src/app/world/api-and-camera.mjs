/**
 * API công khai của world: vị trí người chơi, tour camera lối vào, vào/ra chánh điện, phím di chuyển, hoa sen nở, pin 2D.
 *
 * Mixin của VinhTrang3DWorld: 21 method (init … updateProjectedPins).
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, PILGRIMAGE_STATIONS, _tourPos, _tourLook, _projVec } from './shared.mjs';

export const apiAndCameraMethods = {
  // Compatibility getters & methods for ChuaOnlineApp
  init() {
    this.handleResize(false);
    this.syncPlayerTransform();
    if (!this._animateStarted) {
      this._animateStarted = true;
      this.animate();
    }
  },

  get playerPos() {
    return { x: this.playerState.x, z: this.playerState.z };
  },

  get playerYaw() {
    return this.playerState.yaw;
  },

  get playerMoving() {
    return this.playerState.moving;
  },

  get insideInterior() {
    return this.inInterior;
  },

  setPlayerPose(x, z, yaw = Math.PI) {
    this.cancelEntranceTour();
    this.cancelAutoWalk();
    this.playerState.x = x;
    this.playerState.z = z;
    this.playerState.yaw = yaw;
    this.playerState.moving = false;
    this.cameraBaseYaw = yaw;
    this.cameraAzimuthOffset = 0;
    this.syncPlayerTransform();
    this.checkStationProximity();
    this.renderFrame();
  },

  startEntranceCameraTour() {
    if (this.inInterior) return;
    if (!this.entranceTour.posCurve) {
      // Tour path:
      // 1) Quiet closed Cổng Chính -> 2) Wide-open ceramic mosaic Cổng Phụ ("Tịnh Độ Huyền Môn")
      // -> 3) Glide straight down the tree-shaded lane (x = 40.5) to the souvenir plaza & left-turn shoe veranda (z = -14.5)
      // -> 4) Settle behind player at Cổng Phụ (x = 40.5, z = 43.8) facing straight down the entrance lane
      this.entranceTour.posCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(24.5, 3.0, 54.5),
        new THREE.Vector3(38.5, 3.5, 51.5),
        new THREE.Vector3(40.5, 3.0, 41.0),
        new THREE.Vector3(40.5, 2.8, 18.0),
        new THREE.Vector3(40.5, 2.6, -12.0),
        new THREE.Vector3(40.5, 2.4, 32.0),
        new THREE.Vector3(40.5, 2.1, 50.8)
      ]);
      this.entranceTour.lookCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(23.0, 4.4, 41.5),
        new THREE.Vector3(40.5, 4.2, 41.5),
        new THREE.Vector3(40.5, 2.8, 22.0),
        new THREE.Vector3(40.5, 2.4, -14.5),
        new THREE.Vector3(35.2, 2.4, -14.5),
        new THREE.Vector3(40.5, 2.8, 12.0),
        new THREE.Vector3(40.5, 3.2, 20.0)
      ]);
    }
    this.entranceTour.active = true;
    this.entranceTour.timer = 0;
    this.onEntranceTourChange(true);
    this.stepEntranceTour(0.01);
  },

  cancelEntranceTour() {
    if (this.entranceTour.active) {
      this.entranceTour.active = false;
      this.onEntranceTourChange(false);
      this.syncPlayerTransform();
    }
  },

  enterInteriorHall(instant = false, onEntered = null) {
    this.cancelEntranceTour();
    if (instant) {
      const ok = this.toggleInterior(true);
      if (typeof onEntered === 'function') onEntered();
      return ok;
    }
    return this.enterInteriorGradual('right', onEntered);
  },

  exitInteriorHall(instant = false) {
    if (instant) {
      return this.toggleInterior(false);
    }
    return this.exitInteriorGradual();
  },

  switchCharacter(charKey) {
    this.setCharacter(charKey);
  },

  playPlayerBowAnimation() {
    this.triggerActionAnimation('Vái');
  },

  setIncenseBoost() {
    if (typeof this.startIncenseOfferingSequence === 'function') {
      this.startIncenseOfferingSequence();
      return;
    }
    this.addIncenseStickVisual();
    this.triggerActionAnimation('Thắp nhang');
  },

  placeLotusOfferingIn3D() {
    if (typeof this.startLotusOfferingSequence === 'function') {
      this.startLotusOfferingSequence();
      return;
    }
    this.addLotusOfferingVisual();
    this.lotusBloomState.active = true;
    this.lotusBloomState.timer = 0;
    this.triggerActionAnimation('Chắp tay');
  },

  captureSnapshotDataURL() {
    try {
      const gl = this.renderer?.getContext?.();
      if (this.contextLost || gl?.isContextLost?.()) return null;
      this.renderer.render(this.scene, this.camera);
      return this.canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  },

  setHeldDirection(dir, active) {
    if (!dir) return;
    if (active) {
      this.cancelEntranceTour();
      this.heldDirs.add(dir);
      this.cancelAutoWalk();
    } else {
      this.heldDirs.delete(dir);
      if (this.heldDirs.size === 0 && this.autoWalkWaypoints.length === 0) {
        this.playerState.moving = false;
      }
    }
  },

  clearHeldDirections() {
    this.heldDirs.clear();
    if (this.autoWalkWaypoints.length === 0) {
      this.playerState.moving = false;
    }
  },

  nudgeDirection(dir, dist = 1.35) {
    const dirMap = {
      up: { dx: 0, dz: -1 },
      down: { dx: 0, dz: 1 },
      left: { dx: -1, dz: 0 },
      right: { dx: 1, dz: 0 }
    };
    const v = dirMap[dir];
    if (!v) return;
    const angle = this.cameraBaseYaw + this.cameraAzimuthOffset;
    const forwardX = Math.sin(angle);
    const forwardZ = Math.cos(angle);
    const rightX = -forwardZ;
    const rightZ = forwardX;
    const worldDx = forwardX * (-v.dz) + rightX * v.dx;
    const worldDz = forwardZ * (-v.dz) + rightZ * v.dx;
    this.moveStep(worldDx, worldDz, dist * 0.55);
  },

  stepEntranceTour(dt) {
    if (!this.entranceTour?.active || this.inInterior || !this.entranceTour.posCurve) return;
    this.entranceTour.timer += dt;
    const rawU = Math.min(1, this.entranceTour.timer / this.entranceTour.duration);
    const u = rawU * rawU * (3 - 2 * rawU);
    this.entranceTour.posCurve.getPointAt(u, _tourPos);
    this.entranceTour.lookCurve.getPointAt(u, _tourLook);
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, _tourPos.x, 7.5, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, _tourPos.y, 7.5, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, _tourPos.z, 7.5, dt);
    this.camera.lookAt(_tourLook);
    if (rawU >= 1) {
      this.entranceTour.active = false;
      this.onEntranceTourChange(false);
      this.syncPlayerTransform();
    }
  },

  stepLotusBloom(dt) {
    const bloom = this.lotusBloomState;
    if (!bloom?.active) return;
    bloom.timer += dt;
    const p = Math.min(1, bloom.timer / bloom.duration);
    const pulse = Math.sin(p * Math.PI);
    const outerAngle = THREE.MathUtils.lerp(0.46, 1.18, pulse);
    const innerAngle = THREE.MathUtils.lerp(0.22, 0.72, pulse);
    const glowLevel = 0.05 + pulse * 1.15;
    const scaleFactor = 1.0 + pulse * 0.42;
    for (let i = 0; i < this.pondLotusAnims.length; i++) {
      const la = this.pondLotusAnims[i];
      la.group.scale.setScalar(la.baseScale * scaleFactor);
      la.petalMat.emissiveIntensity = glowLevel;
      la.innerMat.emissiveIntensity = glowLevel * 1.2;
      la.centerMat.emissiveIntensity = 0.14 + pulse * 1.1;
      for (let j = 0; j < la.outerPivots.length; j++) {
        la.outerPivots[j].rotation.x = outerAngle;
      }
      for (let j = 0; j < la.innerPivots.length; j++) {
        la.innerPivots[j].rotation.x = innerAngle;
      }
    }
    if (bloom.burstLight) {
      bloom.burstLight.intensity = pulse * 5.2;
    }
    if (bloom.burstRing) {
      bloom.burstRing.scale.setScalar(1.0 + p * 4.2);
      bloom.burstRing.material.opacity = (1 - p) * 0.85;
    }
    if (p >= 1) {
      bloom.active = false;
      if (bloom.burstLight) bloom.burstLight.intensity = 0;
      if (bloom.burstRing) bloom.burstRing.material.opacity = 0;
    }
  },

  updateProjectedPins() {
    const w = this.canvas.clientWidth || window.innerWidth || 1280;
    const h = this.canvas.clientHeight || window.innerHeight || 720;
    const focalKey = this.autoWalkStation?.key || 'chanh_dien';
    const focalSt =
      PILGRIMAGE_STATIONS.find((s) => s.key === focalKey) ||
      PILGRIMAGE_STATIONS.find((s) => s.key === 'chanh_dien');
    const projectedList = [];
    if (focalSt && !this.inInterior && !this.entranceTour?.active) {
      const tx = focalSt.key === 'chanh_dien' ? 23.0 : focalSt.lookAt?.x ?? focalSt.pos.x;
      const ty = focalSt.key === 'chanh_dien' ? 5.4 : (focalSt.lookAt?.y ?? 3.8) + 1.1;
      const tz = focalSt.key === 'chanh_dien' ? 8.4 : focalSt.lookAt?.z ?? focalSt.pos.z;
      const distToCam = Math.hypot(this.camera.position.x - tx, this.camera.position.z - tz);
      const showNearEntrance =
        focalSt.key !== 'chanh_dien' ||
        distToCam < 44 ||
        [0, 4, 5, 6].includes(this.currentStationId);
      if (showNearEntrance) {
        _projVec.set(tx, ty, tz);
        _projVec.project(this.camera);
        const visible =
          _projVec.z < 1 &&
          _projVec.z > -1 &&
          _projVec.x >= -0.92 &&
          _projVec.x <= 0.92 &&
          _projVec.y >= -0.9 &&
          _projVec.y <= 0.9;
        const px = (_projVec.x * 0.5 + 0.5) * w;
        const py = (-_projVec.y * 0.5 + 0.5) * h;
        projectedList.push({
          key: focalSt.key,
          visible,
          x: px,
          y: py,
          label: focalSt.pinLabel
        });
      }
    }
    this.onUpdateProjectedPins(projectedList);
  }
};
