/**
 * Lazy-build Chánh Điện, phân vùng không gian & occlusion / frustum culling zero-GC.
 *
 * Mixin của VinhTrang3DWorld.
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE } from './shared.mjs';
import { getVisibleInteriorZones } from '../../logic/modules/pathfinding-and-collision.mjs';

const _frustum = new THREE.Frustum();
const _projScreenMatrix = new THREE.Matrix4();
const _tmpBox = new THREE.Box3();
const _tmpCenter = new THREE.Vector3();
const _tmpSize = new THREE.Vector3();
const _tmpSphere = new THREE.Sphere();

export const occlusionCullingMethods = {
  /**
   * Lazily constructs the Chánh Điện interior architectural shell on first entry (or idle),
   * preventing startup lag while the pilgrim is outdoors.
   */
  ensureInteriorBuilt() {
    if (this._interiorBuilt) return true;
    this._interiorBuilt = true;
    this.buildInteriorChanhDienV8();
    this.registerInteriorOcclusionZones();
    // Apply current time-of-day interior light scaling immediately once built
    const boost = this.timeOfDay === 'evening' ? 1.32 : 1.0;
    this.interiorGroup?.traverse?.((o) => {
      if (o.isPointLight) {
        if (typeof o.userData.baseIntensity !== 'number') {
          o.userData.baseIntensity = o.intensity;
        }
        o.intensity = o.userData.baseIntensity * boost;
      }
    });
    return true;
  },

  /**
   * Freezes matrix transforms on static meshes/statues after placement to eliminate
   * redundant per-frame matrixWorld recomputation across hundreds of static objects.
   */
  freezeStaticSubtree(root) {
    if (!root) return;
    root.updateMatrixWorld(true);
    root.traverse((o) => {
      if (o.isMesh) {
        o.frustumCulled = true;
        o.matrixAutoUpdate = false;
        o.updateMatrix();
      }
    });
  },

  /**
   * Classifies all direct children of interiorGroup into spatial PVS occlusion buckets
   * while keeping floors, ceilings, perimeter walls, and cutaway targets in shared_shell.
   */
  registerInteriorOcclusionZones() {
    const buckets = {
      shared_shell: [],
      east_corridor: [],
      center_courtyard: [],
      west_chanh_dien: [],
      north_gallery: [],
      south_gallery: []
    };
    this.interiorZoneBuckets = buckets;
    this._interiorOccludedArhats = [];
    if (!this.interiorGroup) return;

    const cutawaySet = new Set(this.cutawayTargets || []);
    const explicitZoneMap = new Map();
    if (this.tamBaoAltarGroup) explicitZoneMap.set(this.tamBaoAltarGroup, 'west_chanh_dien');
    if (this.baoLamAnchor) explicitZoneMap.set(this.baoLamAnchor, 'west_chanh_dien');
    if (this.interiorBellAnchor?.group) explicitZoneMap.set(this.interiorBellAnchor.group, 'west_chanh_dien');
    for (const ph of this.longTruPlaceholders || []) {
      if (ph?.group) explicitZoneMap.set(ph.group, 'west_chanh_dien');
    }
    for (const anc of this.spiralIncenseAnchors || []) {
      if (anc) explicitZoneMap.set(anc, 'west_chanh_dien');
    }
    if (this.khuThoAltarGroup) explicitZoneMap.set(this.khuThoAltarGroup, 'north_gallery');
    if (this.interiorDrumAnchor?.group) explicitZoneMap.set(this.interiorDrumAnchor.group, 'center_courtyard');

    this.interiorGroup.updateMatrixWorld(true);

    for (const child of this.interiorGroup.children) {
      if (!child) continue;
      // Keep structural cutaway targets, incense/lotus FX groups, and lights attached to root safe
      if (
        cutawaySet.has(child) ||
        child === this.interiorIncenseGroup ||
        child === this.interiorOfferedLotusesGroup
      ) {
        buckets.shared_shell.push(child);
        continue;
      }

      const explicitZone = explicitZoneMap.get(child);
      if (explicitZone) {
        child.userData.occlusionZone = explicitZone;
        buckets[explicitZone].push(child);
        continue;
      }

      _tmpBox.setFromObject(child);
      if (_tmpBox.isEmpty()) {
        buckets.shared_shell.push(child);
        continue;
      }
      _tmpBox.getSize(_tmpSize);
      _tmpBox.getCenter(_tmpCenter);

      // Large architectural spans (floors, perimeter walls, long carpets) remain in shared_shell
      if (_tmpSize.x > 28 || _tmpSize.z > 28) {
        buckets.shared_shell.push(child);
        continue;
      }

      const cx = _tmpCenter.x;
      const cz = _tmpCenter.z;
      let zone = 'shared_shell';
      if (cx <= -15.0 && Math.abs(cz) <= 12.6) {
        zone = 'west_chanh_dien';
      } else if (cx >= 10.6) {
        zone = 'east_corridor';
      } else if (Math.abs(cx) <= 11.2 && Math.abs(cz) <= 11.2) {
        zone = 'center_courtyard';
      } else if (cz <= -10.8 && cx > -15.5 && cx < 10.6) {
        zone = 'north_gallery';
      } else if (cz >= 10.8 && cx > -15.5 && cx < 10.6) {
        zone = 'south_gallery';
      }

      child.userData.occlusionZone = zone;
      buckets[zone].push(child);
    }

    // Freeze static world matrices on non-animated interior shell geometry
    const animatedSet = new Set([
      ...(this.lotusSwayGroups || []).map((ls) => ls.group),
      ...(this.koiList || []).map((k) => k.mesh),
      this.interiorIncenseGroup,
      this.interiorOfferedLotusesGroup
    ]);
    for (const child of this.interiorGroup.children) {
      if (!child || animatedSet.has(child) || child.userData.occlusionZone === 'center_courtyard') {
        continue;
      }
      if (child.isMesh) {
        child.frustumCulled = true;
        child.matrixAutoUpdate = false;
        child.updateMatrix();
      }
    }
  },

  /**
   * Registers a dynamically mounted interior GLB (such as an Arhat statue) into its PVS bucket.
   */
  registerInteriorObjectInZone(obj, zoneKey = 'west_chanh_dien') {
    if (!obj) return;
    this.freezeStaticSubtree(obj);
    obj.userData.occlusionZone = zoneKey;
    if (this.interiorZoneBuckets && this.interiorZoneBuckets[zoneKey]) {
      this.interiorZoneBuckets[zoneKey].push(obj);
    }
    if (zoneKey === 'west_chanh_dien' && obj.userData.arhatIndex !== undefined) {
      _tmpBox.setFromObject(obj);
      const center = _tmpBox.getCenter(new THREE.Vector3());
      const radius = Math.max(1.2, _tmpBox.getSize(_tmpSize).length() * 0.55);
      obj.userData._cullCenter = center;
      obj.userData._cullRadius = radius;
    }
  },

  /**
   * Zero-GC per-frame spatial occlusion + frustum culling pass.
   * Dramatically reduces draw calls & skinned-mesh CPU updates indoors and outdoors.
   */
  updateSceneOcclusionCulling() {
    if (!this.camera) return;

    this.camera.updateMatrixWorld();
    _projScreenMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    _frustum.setFromProjectionMatrix(_projScreenMatrix);

    const px = this.playerState?.x || 0;
    const pz = this.playerState?.z || 0;

    if (this.inInterior) {
      // Interior needs no exterior directional shadow map
      if (this.sunLight && this.sunLight.castShadow) {
        this.sunLight.castShadow = false;
      }

      const activeZone = this.getInteriorZoneKey();
      const pvs = getVisibleInteriorZones(activeZone, px, pz, Boolean(this.interiorCutaway));

      // Trigger on-demand lazy loading for any zone entering the visible set
      if (this._interiorZonesLoaded) {
        if (pvs.west_chanh_dien && !this._interiorZonesLoaded.west_chanh_dien) {
          this.ensureInteriorZoneLoaded?.('west_chanh_dien').catch(() => {});
        }
        if (pvs.east_corridor && !this._interiorZonesLoaded.east_corridor) {
          this.ensureInteriorZoneLoaded?.('east_corridor').catch(() => {});
        }
        if ((pvs.center_courtyard || pvs.north_gallery) && !this._interiorZonesLoaded.center_and_north) {
          this.ensureInteriorZoneLoaded?.('center_and_north').catch(() => {});
        }
      }

      const buckets = this.interiorZoneBuckets;
      if (buckets) {
        const zoneNames = ['east_corridor', 'center_courtyard', 'west_chanh_dien', 'north_gallery', 'south_gallery'];
        for (let z = 0; z < zoneNames.length; z++) {
          const zName = zoneNames[z];
          const zoneVisible = Boolean(pvs[zName]);
          const items = buckets[zName];
          if (!items) continue;
          for (let i = 0; i < items.length; i++) {
            const obj = items[i];
            if (!obj) continue;
            if (!zoneVisible) {
              obj.visible = false;
              continue;
            }
            // Extra frustum culling for individual 18 Arhat statues when West hall is visible
            if (obj.userData._cullCenter && !this.interiorCutaway) {
              _tmpSphere.center.copy(obj.userData._cullCenter);
              _tmpSphere.radius = obj.userData._cullRadius || 1.6;
              obj.visible = _frustum.intersectsSphere(_tmpSphere);
            } else {
              obj.visible = true;
            }
          }
        }
      }

      // Frustum & distance cull individual East Corridor shrine statues when corridor is visible
      if (pvs.east_corridor && Array.isArray(this.eastCorridorShrines) && !this.interiorCutaway) {
        for (let i = 0; i < this.eastCorridorShrines.length; i++) {
          const spec = this.eastCorridorShrines[i];
          if (!spec?.anchor) continue;
          const distSq = (spec.x - px) * (spec.x - px) + (spec.z - pz) * (spec.z - pz);
          if (distSq > 38 * 38) {
            spec.anchor.visible = false;
          } else {
            _tmpSphere.center.set(spec.x, 1.8, spec.z);
            _tmpSphere.radius = 3.2;
            spec.anchor.visible = _frustum.intersectsSphere(_tmpSphere);
          }
        }
      }

      // Cull distant / off-zone interior NPCs so their AnimationMixers skip CPU skinning
      const cullNpcList = (list) => {
        if (!Array.isArray(list)) return;
        for (let i = 0; i < list.length; i++) {
          const entry = list[i];
          const root = entry?.rec?.root || entry?.root;
          if (!root) continue;
          const dx = root.position.x - px;
          const dz = root.position.z - pz;
          const distSq = dx * dx + dz * dz;
          const inWest = root.position.x < -14.5;
          const inEast = root.position.x > 10.6;
          let vis = true;
          if (!this.interiorCutaway) {
            if (inWest && !pvs.west_chanh_dien) vis = false;
            else if (inEast && !pvs.east_corridor) vis = false;
            else if (distSq > 34 * 34) vis = false;
            else {
              _tmpSphere.center.set(root.position.x, 1.0, root.position.z);
              _tmpSphere.radius = 1.6;
              vis = _frustum.intersectsSphere(_tmpSphere);
            }
          }
          root.visible = vis;
          entry._culled = !vis;
        }
      };
      cullNpcList(this.interiorKneelingRecords);
      cullNpcList(this.interiorWalkingRecords);
      return;
    }

    // Outdoor mode: restore directional shadows (when hardware GL) and distance/frustum cull far NPCs
    if (this.sunLight && !this.isSoftwareGl && !this.sunLight.castShadow) {
      this.sunLight.castShadow = true;
    }

    const cullOutdoorNpcs = (list, maxDist = 66) => {
      if (!Array.isArray(list)) return;
      const maxDistSq = maxDist * maxDist;
      for (let i = 0; i < list.length; i++) {
        const entry = list[i];
        const root = entry?.rec?.root || entry?.root;
        if (!root) continue;
        const dx = root.position.x - px;
        const dz = root.position.z - pz;
        const distSq = dx * dx + dz * dz;
        let vis = distSq <= maxDistSq;
        if (vis && distSq > 22 * 22) {
          _tmpSphere.center.set(root.position.x, 1.0, root.position.z);
          _tmpSphere.radius = 1.8;
          vis = _frustum.intersectsSphere(_tmpSphere);
        }
        root.visible = vis;
        entry._culled = !vis;
      }
    };
    cullOutdoorNpcs(this.riggedNpcRecords, 68);
    cullOutdoorNpcs(this.vendorNpcRecords, 58);
  }
};
