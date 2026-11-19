/**
 * Vòng mô phỏng, xe cộ trên đường & đoàn xe đưa đón khách.
 *
 * Mixin của VinhTrang3DWorld: 5 method (stepSimulation … renderFrame).
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { CHAR_HEIGHTS } from './shared.mjs';

export const roadTrafficMethods = {
  stepSimulation(dt = 0.016) {
    const safeDt = Math.max(0.001, Math.min(Number(dt) || 0.016, 0.4));
    if (this.interiorTransition) {
      this.stepInteriorTransition(safeDt);
    } else {
      this.updateHeldMovement(safeDt);
      this.updateAutoWalk(safeDt);
    }
    this.stepArrivalCutscene(safeDt);
    this.stepEntranceTour(safeDt);
    this.stepLotusBloom(safeDt);
    this.stepOfferingAnimations?.(safeDt);
    this.stepRoadTraffic(safeDt);
    this.stepPilgrimageCompanions(safeDt);
    if (!this.inInterior) {
      this.stepNpcRecordList?.(this.riggedNpcRecords, this.exteriorGroup, safeDt);
    } else {
      for (const kr of this.interiorKneelingRecords || []) {
        kr.mixer?.update?.(safeDt * 0.72);
      }
      if (this.interiorWalkingRecords?.length) {
        this.stepNpcRecordList?.(this.interiorWalkingRecords, this.interiorGroup, safeDt);
      }
    }
    if (this.activePlayerRecord?.mixer) {
      this.activePlayerRecord.mixer.update(safeDt);
      this.updateProceduralPoseFallback(safeDt);
    }
    this.checkStationProximity();
    this.updateCourtyardNpcInteraction?.();
  },

  spawnVisitorConvoyPassengers() {
    if (!this.charDataCache.nu || !this.charDataCache.nam) return;
    const convoyId = ++this.visitorGroupSequence;
    const visitors = [
      { charKey: 'nu', tint: [0.84, 0.70, 0.76], hat: true, bag: 'tui_sen', hand: 'hoa_sen', offset: -1.05, speed: 0.98 },
      { charKey: 'nam', tint: [0.54, 0.62, 0.72], scarf: true, hand: 'nhang', offset: -0.32, speed: 0.94 },
      { charKey: 'tre_em', tint: [0.92, 0.78, 0.62], offset: 0.36, speed: 1.08 },
      { charKey: 'nu', tint: [0.76, 0.82, 0.70], hat: true, bag: 'gio_may', hand: 'quat', offset: 1.08, speed: 0.92 }
    ];

    for (let i = 0; i < visitors.length; i++) {
      const spec = visitors[i];
      const height = CHAR_HEIGHTS[spec.charKey] || 1.64;
      const rec = this.cloneAnimatedCharacter(spec.charKey, height);
      if (!rec) continue;
      if (spec.tint) this.recolorPastelDress(rec.root, spec.tint);
      this.equipNpcProps(rec, spec.charKey, height, spec);

      const startX = 49.0 + (i % 2) * 0.45;
      const startZ = 111.5 + spec.offset * 0.9;
      const xOffset = spec.offset * 0.95;
      const pts = [
        { x: startX, z: startZ, action: 'pass', wait: 0, lookX: null, lookZ: null },
        { x: 43.2 + xOffset * 0.6, z: 106.0, action: 'pass', wait: 0, lookX: null, lookZ: null },
        { x: 42.4 + xOffset * 0.5, z: 74.0, action: 'pass', wait: 0, lookX: null, lookZ: null },
        { x: 41.2 + xOffset * 0.4, z: 48.0, action: 'pass', wait: 0, lookX: null, lookZ: null },
        { x: 40.8 + xOffset * 0.25, z: 41.5, action: 'pass', wait: 0, lookX: null, lookZ: null },
        { x: 39.2 + xOffset * 0.16, z: 33.5, action: 'pass', wait: 0, lookX: null, lookZ: null },
        { x: 36.1, z: 23.5 + spec.offset * 0.12, action: 'dung', wait: 3.2, lookX: 32.5, lookZ: 22.5 }
      ];
      const first = pts[0];
      const next = pts[1];
      const yaw = Math.atan2(next.x - first.x, next.z - first.z);
      rec.root.position.set(startX, rec.baseY, startZ);
      rec.root.rotation.y = yaw;
      this.playClipCrossfade(rec, 'Dung', 0.12, false);
      this.exteriorGroup.add(rec.root);
      this.riggedNpcRecords.push({
        rec,
        pts,
        idx: 1,
        speed: spec.speed,
        pauseTimer: 0.75 + i * 0.34,
        yaw,
        state: 'Dung',
        pauseClip: 'Dung',
        lookX: null,
        lookZ: null,
        temporary: true,
        removeAfterPause: false,
        convoyId,
        npcMeta: {
          id: `courtyard_convoy_${convoyId}_${i}`,
          role: spec.charKey === 'tre_em' ? 'novice' : 'pilgrim',
          charKey: spec.charKey,
          headHeight: height
        }
      });
    }
  },

  disposeRoadTrafficVehicle(vehicle) {
    if (!vehicle?.group) return;
    this.exteriorGroup.remove(vehicle.group);
    vehicle.group.traverse((obj) => {
      if (obj.isMesh && obj.geometry) obj.geometry.dispose();
    });
    for (const material of vehicle.group.userData.ownedMaterials || []) {
      material.dispose();
    }
  },

  stepRoadTraffic(dt = 0.016) {
    if (!this.trafficVehicleRecords) return;

    // Distant urban passing traffic flows smoothly along Đường Nguyễn Trung Trực (z = 202.2 / 208.2),
    // keeping the 170m straight pagoda approach road calm & pedestrian-first.
    this.trafficSpawnTimer -= dt;
    if (this.trafficSpawnTimer <= 0) {
      const direction = Math.random() < 0.5 ? 1 : -1;
      const count = Math.random() < 0.35 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const kindRoll = Math.random();
        const kind = kindRoll < 0.45 ? 'bike' : kindRoll < 0.85 ? 'sedan' : 'van';
        this.trafficSpawnQueue.push({
          wait: i === 0 ? 0 : 2.0 + Math.random() * 1.1,
          direction,
          kind
        });
      }
      this.trafficSpawnTimer = 18 + Math.random() * 20;
    }

    for (let i = this.trafficSpawnQueue.length - 1; i >= 0; i--) {
      const queued = this.trafficSpawnQueue[i];
      queued.wait -= dt;
      if (queued.wait > 0) continue;
      const direction = queued.direction;
      const kind = queued.kind;
      const colors = kind === 'bike'
        ? [0x9C2C26, 0x254E8A, 0x3D434A, 0xB89342, 0xE6E1D6]
        : [0xD2D8D9, 0xAEB9C1, 0x6E7D88, 0xB7A58B, 0xF0EEE8];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const laneZ = direction > 0 ? 202.2 : 208.2;
      const startX = direction > 0 ? -105 : 155;
      const speed = kind === 'bike'
        ? 6.4 + Math.random() * 1.45
        : 7.4 + Math.random() * 1.65;
      const record = this.spawnRoadTrafficVehicle({
        kind, x: startX, z: laneZ, direction, speed, color
      });
      this.trafficVehicleRecords.push(record);
      this.trafficSpawnQueue.splice(i, 1);
    }

    // Occasional visitor shuttle enters from Đường Nguyễn Trung Trực up the straight road into Bãi Giữ Xe (z = 114),
    // drops off pilgrims who walk straight up to Cổng Phụ, then departs South.
    this.visitorConvoyTimer -= dt;
    if (
      this.visitorConvoyTimer <= 0 &&
      !this.activeVisitorShuttle &&
      !this.inInterior &&
      this.charDataCache.nu &&
      this.charDataCache.nam
    ) {
      const group = this.spawnRoadTrafficVehicle({
        kind: 'van',
        x: 43.2,
        z: 198.0,
        direction: -1,
        speed: 6.4,
        color: 0xD9DEE0
      });
      if (group?.group) group.group.rotation.y = Math.PI;
      group.kind = 'visitor_shuttle';
      group.state = 'arriving';
      group.path = [{ x: 43.2, z: 120.0 }, { x: 52.0, z: 114.0 }];
      group.pathIndex = 0;
      group.dwellTimer = 0;
      this.activeVisitorShuttle = group;
      this.trafficVehicleRecords.push(group);
      this.visitorConvoyTimer = 92 + Math.random() * 48;
    }

    for (let i = this.trafficVehicleRecords.length - 1; i >= 0; i--) {
      const vehicle = this.trafficVehicleRecords[i];
      const pos = vehicle.group.position;

      if (vehicle.state === 'arriving' || vehicle.state === 'departing') {
        const target = vehicle.path[vehicle.pathIndex];
        const dx = target.x - pos.x;
        const dz = target.z - pos.z;
        const distance = Math.hypot(dx, dz);
        if (distance < 0.42) {
          if (vehicle.pathIndex < vehicle.path.length - 1) {
            vehicle.pathIndex += 1;
          } else if (vehicle.state === 'arriving') {
            vehicle.state = 'parked';
            vehicle.dwellTimer = 7.5;
            this.spawnVisitorConvoyPassengers();
          } else {
            this.disposeRoadTrafficVehicle(vehicle);
            this.trafficVehicleRecords.splice(i, 1);
            this.activeVisitorShuttle = null;
            continue;
          }
        } else {
          const dirX = dx / distance;
          const dirZ = dz / distance;
          const step = Math.min(distance, vehicle.speed * dt);
          pos.x += dirX * step;
          pos.z += dirZ * step;
          const targetYaw = Math.atan2(dirX, dirZ);
          vehicle.group.rotation.y = this.lerpAngle(vehicle.group.rotation.y, targetYaw, Math.min(1, dt * 3.8));
        }
      } else if (vehicle.state === 'parked') {
        vehicle.dwellTimer -= dt;
        if (vehicle.dwellTimer <= 0) {
          vehicle.state = 'departing';
          vehicle.path = [{ x: 43.2, z: 124.0 }, { x: 43.2, z: 204.0 }];
          vehicle.pathIndex = 0;
          vehicle.speed = 6.8;
        }
      } else {
        pos.x += vehicle.direction * vehicle.speed * dt;
        if ((vehicle.direction > 0 && pos.x > 160) || (vehicle.direction < 0 && pos.x < -112)) {
          this.disposeRoadTrafficVehicle(vehicle);
          this.trafficVehicleRecords.splice(i, 1);
          continue;
        }
      }

      if (vehicle.state !== 'parked') {
        for (const wheel of vehicle.wheelGroups || []) {
          wheel.rotation.x -= (vehicle.speed * dt) / Math.max(0.1, vehicle.wheelRadius);
        }
      }
    }
  },

  renderFrame() {
    this.updateProjectedPins();
    const gl = this.renderer?.getContext?.();
    if (this.contextLost || !gl || gl.isContextLost?.()) return;
    try {
      this.renderer.render(this.scene, this.camera);
    } catch {}
  }
};
