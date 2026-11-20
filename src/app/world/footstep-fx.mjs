/**
 * Zero-GC grounded footstep particle feedback system.
 * Spawns subtle surface-specific micro-particles right at shoe height (y < 0.35)
 * on grass, temple tile, Chánh Điện wood floor, and approach gravel.
 * No floating ambient particles in the air.
 */
import * as THREE from 'three';
import { getSurfaceFeedbackProfile } from '../../logic/chua-online-logic.mjs';

const POOL_SIZE = 48;

export const footstepFxMethods = {
  initFootstepFX() {
    if (this._footstepFxReady) return;
    this._footstepFxReady = true;

    const group = new THREE.Group();
    group.name = 'FootstepSurfaceParticles';
    this.scene.add(group);
    this._footstepGroup = group;

    const bladeGeo = new THREE.BoxGeometry(0.022, 0.068, 0.012);
    const puffGeo = new THREE.OctahedronGeometry(0.036, 0);
    const pebbleGeo = new THREE.DodecahedronGeometry(0.024, 0);

    this._footstepGeos = { blade: bladeGeo, puff: puffGeo, pebble: pebbleGeo };
    this._footstepPool = [];
    this._footstepCursor = 0;

    for (let i = 0; i < POOL_SIZE; i += 1) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xd5c4a8,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(puffGeo, mat);
      mesh.visible = false;
      mesh.frustumCulled = true;
      group.add(mesh);

      this._footstepPool.push({
        mesh,
        mat,
        active: false,
        age: 0,
        life: 0.4,
        vx: 0,
        vy: 0,
        vz: 0,
        gravity: 2.4,
        rotSpeedX: 0,
        rotSpeedZ: 0,
        baseScale: 1,
        baseOpacity: 0.7,
      });
    }
  },

  spawnFootstepBurst(x, y, z, yaw = 0, surface = 'tile') {
    if (!this._footstepPool) this.initFootstepFX();
    const profile = getSurfaceFeedbackProfile(surface);
    const count = this.isSoftwareGl ? Math.max(1, Math.min(2, profile.count - 1)) : profile.count;
    const geo = this._footstepGeos[profile.shape] || this._footstepGeos.puff;
    const colors = profile.particleColors;
    const backX = -Math.sin(yaw);
    const backZ = -Math.cos(yaw);

    for (let i = 0; i < count; i += 1) {
      const slot = this._footstepPool[this._footstepCursor];
      this._footstepCursor = (this._footstepCursor + 1) % POOL_SIZE;

      slot.mesh.geometry = geo;
      slot.mat.color.setHex(colors[i % colors.length]);
      slot.baseOpacity = surface === 'wood' ? 0.36 : surface === 'tile' ? 0.44 : 0.78;
      slot.mat.opacity = slot.baseOpacity;

      const angle = (Math.random() - 0.5) * Math.PI * 2;
      const offsetR = Math.random() * profile.spread;
      const startY = Math.max(0.03, (Number.isFinite(y) ? y : 0) + 0.04);

      slot.mesh.position.set(
        x + backX * 0.14 + Math.cos(angle) * offsetR,
        startY,
        z + backZ * 0.14 + Math.sin(angle) * offsetR
      );
      slot.mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      slot.baseScale = (profile.size / 0.036) * (0.75 + Math.random() * 0.5);
      slot.mesh.scale.setScalar(slot.baseScale);

      slot.vx = backX * profile.speedOut * 0.6 + Math.cos(angle) * profile.speedOut * (0.4 + Math.random() * 0.7);
      slot.vy = profile.speedUp * (0.6 + Math.random() * 0.55);
      slot.vz = backZ * profile.speedOut * 0.6 + Math.sin(angle) * profile.speedOut * (0.4 + Math.random() * 0.7);
      slot.gravity = profile.gravity;
      slot.life = profile.life * (0.85 + Math.random() * 0.3);
      slot.age = 0;
      slot.rotSpeedX = (Math.random() - 0.5) * 6;
      slot.rotSpeedZ = (Math.random() - 0.5) * 6;
      slot.active = true;
      slot.mesh.visible = true;
    }
  },

  stepFootstepFX(dt) {
    if (!this._footstepPool) return;
    const stepDt = Math.min(dt, 0.06);
    for (let i = 0; i < POOL_SIZE; i += 1) {
      const p = this._footstepPool[i];
      if (!p.active) continue;
      p.age += stepDt;
      if (p.age >= p.life) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }
      const t = p.age / p.life;
      p.vy -= p.gravity * stepDt;
      p.mesh.position.x += p.vx * stepDt;
      p.mesh.position.y = Math.max(0.015, p.mesh.position.y + p.vy * stepDt);
      p.mesh.position.z += p.vz * stepDt;

      // Clamp max height low to the ground so particles never float up
      if (p.mesh.position.y > 0.34) {
        p.mesh.position.y = 0.34;
        if (p.vy > 0) p.vy *= 0.2;
      }

      p.mesh.rotation.x += p.rotSpeedX * stepDt;
      p.mesh.rotation.z += p.rotSpeedZ * stepDt;

      const scaleFade = p.baseScale * (1 - t * 0.55);
      p.mesh.scale.setScalar(Math.max(0.05, scaleFade));
      p.mat.opacity = p.baseOpacity * (1 - t);
    }
  },
};
