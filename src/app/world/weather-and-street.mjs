/**
 * Thời tiết động Miền Tây (Nắng đẹp ↔ Mưa rào, mặt sân ướt bóng, NPC bung dù che mưa)
 * và Cảnh sinh hoạt thực tế ngoài Cổng Phụ Tịnh Độ Huyền Môn (Xe Cà Rem Mỹ Tho, Cô Bán Nón Lá)
 * đối chiếu từ ảnh thực tế image_bb72a8b0.png.
 *
 * Mixin của VinhTrang3DWorld. Được gắn vào class qua applyMixins().
 */
import { THREE, makeTextTex } from './shared.mjs';
import {
  createWeatherAtmosphereState,
  stepWeatherAtmosphere,
  computeWetMaterialParams,
  resolveSpatialAudioZone
} from '../../logic/modules/world-atmosphere.mjs';

const UMBRELLA_PALETTE = [0x9C2B3A, 0x2B5B84, 0x2F6B4E, 0xB8732A, 0x6A3F7A, 0x3D6E7A];

// Pre-allocated scratch Color for zero-GC weather interpolation
const _weatherColorA = new THREE.Color();
const _weatherColorB = new THREE.Color();

export const weatherAndStreetMethods = {
  registerWettableMaterial(mat, opts = {}) {
    if (!mat) return mat;
    if (!this.wettableMaterials) this.wettableMaterials = [];
    this.wettableMaterials.push({
      mat,
      baseRoughness: typeof mat.roughness === 'number' ? mat.roughness : 0.88,
      baseColor: mat.color ? mat.color.clone() : new THREE.Color(0xffffff),
      minRoughness: Number.isFinite(opts.minRoughness) ? opts.minRoughness : 0.22,
      darkenStrength: Number.isFinite(opts.darkenStrength) ? opts.darkenStrength : 0.24
    });
    return mat;
  },

  initWeatherSystem() {
    this.weatherState = createWeatherAtmosphereState('clear');
    this._lastAppliedWetness = -1;
    this._lastAppliedOvercast = -1;
    this._lastSpatialAudioZone = null;
    this._lastAudioRainBucket = -1;

    // Zero-GC pooled rain streaks around the player (320 vertical slanted Mekong raindrops)
    const count = 320;
    const positions = new Float32Array(count * 6);
    const seeds = new Float32Array(count * 4); // xOff, y, zOff, speed
    for (let i = 0; i < count; i++) {
      seeds[i * 4] = (Math.random() - 0.5) * 34;
      seeds[i * 4 + 1] = Math.random() * 18;
      seeds[i * 4 + 2] = (Math.random() - 0.5) * 34;
      seeds[i * 4 + 3] = 14 + Math.random() * 6;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({
      color: 0xD8E8F5,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });
    const rainLines = new THREE.LineSegments(geo, mat);
    rainLines.frustumCulled = false;
    rainLines.visible = false;
    this.scene.add(rainLines);
    this._rainSystem = {
      mesh: rainLines,
      mat,
      positions,
      seeds,
      count
    };
  },

  setWeatherPreset(presetKey = 'clear', immediate = false) {
    if (!this.weatherState) this.initWeatherSystem();
    const valid = ['clear', 'overcast', 'rain'].includes(presetKey) ? presetKey : 'clear';
    this.weatherState.preset = valid;
    if (immediate) {
      this.weatherState = createWeatherAtmosphereState(valid);
    }
    this._applyWeatherVisuals(true);
    this.onWeatherChange?.(this.weatherState.preset, this.weatherState);
    if (immediate) this.renderFrame();
    return this.weatherState.preset;
  },

  getWeatherPreset() {
    return this.weatherState?.preset || 'clear';
  },

  _createNpcUmbrellaMesh(colorHex = 0x2B5B84) {
    const grp = new THREE.Group();
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x3A2E26, roughness: 0.55, metalness: 0.45 });
    const canopyMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.42,
      metalness: 0.06,
      side: THREE.DoubleSide
    });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.92, 6), poleMat);
    pole.position.y = 0.46;
    grp.add(pole);

    const canopy = new THREE.Mesh(
      new THREE.ConeGeometry(0.56, 0.24, 10, 1, true),
      canopyMat
    );
    canopy.position.y = 0.90;
    canopy.castShadow = !this.isSoftwareGl;
    grp.add(canopy);

    const ferrule = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.09, 6), poleMat);
    ferrule.position.y = 1.05;
    grp.add(ferrule);

    grp.visible = false;
    return grp;
  },

  _syncNpcRainUmbrellas(rainIntensity) {
    const showUmbrella = !this.inInterior && rainIntensity > 0.22;
    const openScale = showUmbrella ? Math.min(1, (rainIntensity - 0.22) / 0.35) : 0;
    const list = this.riggedNpcRecords || [];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const rec = item?.rec;
      if (!rec?.root) continue;
      if (showUmbrella && !rec._rainUmbrella) {
        const umb = this._createNpcUmbrellaMesh(UMBRELLA_PALETTE[i % UMBRELLA_PALETTE.length]);
        const invS = 1 / (rec.root.scale.x || 1);
        const h = item.npcMeta?.headHeight || 1.64;
        umb.scale.setScalar(invS);
        umb.position.set(0.18 * invS, (h - 0.52) * invS, 0.06 * invS);
        umb.rotation.z = -0.08;
        rec.root.add(umb);
        rec._rainUmbrella = umb;
        rec._rainUmbrellaBaseScale = invS;
      }
      if (rec._rainUmbrella) {
        rec._rainUmbrella.visible = showUmbrella;
        if (showUmbrella) {
          const s = (rec._rainUmbrellaBaseScale || 1) * (0.35 + 0.65 * openScale);
          rec._rainUmbrella.scale.setScalar(s);
        }
      }
    }
  },

  _applyWeatherVisuals(force = false) {
    if (!this.weatherState) return;
    const { rainIntensity, overcastFactor, wetness } = this.weatherState;

    // 1. Update wet ground PBR materials cleanly when wetness changes
    if (force || Math.abs(wetness - (this._lastAppliedWetness ?? -1)) > 0.008) {
      this._lastAppliedWetness = wetness;
      for (const entry of this.wettableMaterials || []) {
        const params = computeWetMaterialParams(entry.baseRoughness, wetness, {
          minRoughness: entry.minRoughness,
          darkenStrength: entry.darkenStrength
        });
        entry.mat.roughness = params.roughness;
        entry.mat.envMapIntensity = params.envMapIntensity;
        if (entry.mat.color && entry.baseColor) {
          entry.mat.color.copy(entry.baseColor).multiplyScalar(params.albedoScale);
        }
      }
    }

    // 2. Update sky dome, fog, and sun/hemi lighting when outside Chánh điện
    if (
      !this.inInterior &&
      (force || Math.abs(overcastFactor - (this._lastAppliedOvercast ?? -1)) > 0.01)
    ) {
      this._lastAppliedOvercast = overcastFactor;
      const isNight = this.timeOfDay === 'evening';
      if (this.skyDome?.material) {
        const targetSkyKey = overcastFactor > 0.45 && !isNight ? 'rain' : this.timeOfDay || 'morning';
        const targetSky = this._buildSkyTextureForPreset(targetSkyKey);
        if (this.skyDome.material.map !== targetSky) {
          this.skyDome.material.map = targetSky;
          this.skyDome.material.needsUpdate = true;
        }
      }

      if (!isNight) {
        const isSunset = this.timeOfDay === 'sunset';
        const isMidday = this.timeOfDay === 'midday';
        const baseBgHex = isMidday ? 0x8FC7F6 : isSunset ? 0xD8875E : 0xA6D0F0;
        const baseFogHex = isMidday ? 0xDCEBFA : isSunset ? 0xE29E6E : 0xEADBC4;
        const baseSunInt = isMidday ? 2.15 : isSunset ? 2.08 : 1.82;
        const baseHemiInt = isMidday ? 1.32 : isSunset ? 1.06 : 1.18;
        const baseFogDens = isMidday ? 0.0022 : isSunset ? 0.0036 : 0.0033;

        _weatherColorA.setHex(baseBgHex);
        _weatherColorB.setHex(0x7B8D9B);
        if (this.scene.background?.copy) {
          this.scene.background.copy(_weatherColorA).lerp(_weatherColorB, overcastFactor);
        }

        _weatherColorA.setHex(baseFogHex);
        _weatherColorB.setHex(0x9BAAB6);
        if (this.scene.fog) {
          this.scene.fog.color.copy(_weatherColorA).lerp(_weatherColorB, overcastFactor);
          this.scene.fog.density = baseFogDens + overcastFactor * 0.0026;
        }

        if (this.sunLight) {
          this.sunLight.intensity = baseSunInt * (1 - 0.56 * overcastFactor);
        }
        if (this.hemiLight) {
          this.hemiLight.intensity = baseHemiInt * (1 - 0.14 * overcastFactor);
        }
        if (this.renderer) {
          this.renderer.toneMappingExposure = 1.08 - overcastFactor * 0.10;
        }
      }
    }

    // 3. NPC Umbrellas
    this._syncNpcRainUmbrellas(rainIntensity);
  },

  stepWeatherSystem(dt = 0.016) {
    if (!this.weatherState) return;
    this.weatherState = stepWeatherAtmosphere(this.weatherState, dt);
    this._applyWeatherVisuals(false);

    // Emit 3-zone spatial audio & rain intensity updates when changed
    const nextZone = resolveSpatialAudioZone({
      x: this.playerState.x,
      z: this.playerState.z,
      inInterior: this.inInterior
    });
    const rainBucket = Math.round((this.weatherState.rainIntensity || 0) * 20);
    if (nextZone !== this._lastSpatialAudioZone || rainBucket !== this._lastAudioRainBucket) {
      this._lastSpatialAudioZone = nextZone;
      this._lastAudioRainBucket = rainBucket;
      this.onSpatialAudioUpdate?.({
        zone: nextZone,
        rainIntensity: this.weatherState.rainIntensity || 0
      });
    }

    // Update pooled falling rain streaks in-place around player
    const sys = this._rainSystem;
    if (!sys) return;
    const activeRain = !this.inInterior && this.weatherState.rainIntensity > 0.03;
    sys.mesh.visible = activeRain;
    if (!activeRain) return;

    sys.mat.opacity = Math.min(0.62, this.weatherState.rainIntensity * 0.62);
    const px = this.playerState.x;
    const pz = this.playerState.z;
    const streakLen = 0.62 + this.weatherState.rainIntensity * 0.35;
    const windSlantX = 0.14;
    const pos = sys.positions;
    const seeds = sys.seeds;
    const stepDt = this.isSoftwareGl ? Math.max(dt, 0.06) : dt;

    for (let i = 0; i < sys.count; i++) {
      const s4 = i * 4;
      let y = seeds[s4 + 1] - seeds[s4 + 3] * stepDt;
      if (y < 0.05) {
        y = 14 + (i % 5) * 0.9;
      }
      seeds[s4 + 1] = y;
      const rx = px + seeds[s4];
      const rz = pz + seeds[s4 + 2];
      const p6 = i * 6;
      pos[p6] = rx;
      pos[p6 + 1] = y;
      pos[p6 + 2] = rz;
      pos[p6 + 3] = rx - windSlantX;
      pos[p6 + 4] = y - streakLen;
      pos[p6 + 5] = rz;
    }
    sys.mesh.geometry.attributes.position.needsUpdate = true;
  },

  /**
   * Builds authentic real-photo street life right beside the East pier of Cổng Phụ
   * ("Tịnh Độ Huyền Môn" — verified directly against image_bb72a8b0.png):
   * 1. Xe Cà Rem Mỹ Tho pushcart at (46.2, 0, 44.6)
   * 2. Cô Bán Nón Lá Ven Cổng with stacked conical hats at (45.2, 0, 46.8)
   * Both sit cleanly outside the open 6.4m gateway (x = 37.3..43.7).
   */
  buildCongPhuStreetLife() {
    if (!this.streetEncounterClickTargets) this.streetEncounterClickTargets = [];
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x1A140E,
      transparent: true,
      opacity: 0.28,
      depthWrite: false
    });

    // =========================================================================
    // 1. XE CÀ REM MỸ THO (Pushcart with bicycle wheels, cooler box, red-yellow sign & umbrella)
    // =========================================================================
    const cart = new THREE.Group();
    cart.position.set(46.2, 0, 44.6);
    cart.rotation.y = -Math.PI * 0.62; // Angled welcomingly toward visitors arriving at Cổng Phụ

    const cartShadow = new THREE.Mesh(new THREE.CircleGeometry(0.95, 18), shadowMat);
    cartShadow.rotation.x = -Math.PI / 2;
    cartShadow.position.y = 0.02;
    cart.add(cartShadow);

    const stainlessMat = new THREE.MeshStandardMaterial({
      color: 0xD6DEE6,
      roughness: 0.28,
      metalness: 0.68
    });
    const cartRedMat = new THREE.MeshStandardMaterial({ color: 0xC62828, roughness: 0.42 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x22252A, roughness: 0.85 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xE5ECF2, metalness: 0.8, roughness: 0.2 });

    // Lower steel frame & push handles
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.08, 0.72), cartRedMat);
    frame.position.y = 0.38;
    cart.add(frame);

    // Two spoked bicycle wheels on flanks + front support kickstand
    for (const wz of [-0.41, 0.41]) {
      const wheel = new THREE.Group();
      wheel.position.set(-0.08, 0.34, wz);
      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.032, 8, 20), tireMat);
      wheel.add(tire);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.015, 6, 18), chromeMat);
      wheel.add(rim);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.08, 10), chromeMat);
      hub.rotation.x = Math.PI / 2;
      wheel.add(hub);
      for (let sp = 0; sp < 4; sp++) {
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.56, 4), chromeMat);
        spoke.rotation.z = (sp / 4) * Math.PI;
        wheel.add(spoke);
      }
      cart.add(wheel);
    }
    for (const kz of [-0.26, 0.26]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.38, 6), chromeMat);
      leg.position.set(0.46, 0.19, kz);
      cart.add(leg);
    }

    // Insulated stainless-steel ice cream chest + red lid + hand-painted signboard
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.68, 0.68), stainlessMat);
    box.position.set(0.02, 0.76, 0);
    box.castShadow = true;
    cart.add(box);

    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.10, 0.07, 0.72), cartRedMat);
    lid.position.set(0.02, 1.13, 0);
    cart.add(lid);

    const signTex = makeTextTex('CÀ REM MỸ THO · ICE CREAM', {
      w: 640,
      h: 220,
      bg: '#C82522',
      border: '#FFD95A',
      color: '#FFF6D4',
      size: 40
    });
    const signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.38 });
    const frontSign = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.44), signMat);
    frontSign.position.set(0.02, 0.78, 0.348);
    cart.add(frontSign);
    const backSign = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.44), signMat);
    backSign.position.set(0.02, 0.78, -0.348);
    backSign.rotation.y = Math.PI;
    cart.add(backSign);

    // Push handlebar + brass vendor bell
    for (const hz of [-0.28, 0.28]) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.45, 6), chromeMat);
      bar.position.set(-0.66, 0.94, hz);
      bar.rotation.z = 0.78;
      cart.add(bar);
    }
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.62, 8), tireMat);
    grip.rotation.x = Math.PI / 2;
    grip.position.set(-0.82, 1.06, 0);
    cart.add(grip);

    const bell = new THREE.Mesh(
      new THREE.ConeGeometry(0.055, 0.09, 10),
      new THREE.MeshStandardMaterial({ color: 0xD9A441, metalness: 0.75, roughness: 0.25 })
    );
    bell.position.set(-0.56, 1.18, 0.26);
    cart.add(bell);

    // Tall Mekong colorful shade umbrella over the cart
    const umbPole = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.026, 2.28, 8), chromeMat);
    umbPole.position.set(0.32, 1.16, -0.22);
    cart.add(umbPole);
    const umbTop = new THREE.Mesh(
      new THREE.ConeGeometry(1.18, 0.44, 12, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0x1E6BB8,
        roughness: 0.45,
        side: THREE.DoubleSide
      })
    );
    umbTop.position.set(0.32, 2.34, -0.22);
    umbTop.castShadow = true;
    cart.add(umbTop);
    const umbTrim = new THREE.Mesh(
      new THREE.TorusGeometry(1.16, 0.032, 6, 20),
      new THREE.MeshStandardMaterial({ color: 0xF5C842, roughness: 0.5 })
    );
    umbTrim.rotation.x = Math.PI / 2;
    umbTrim.position.set(0.32, 2.13, -0.22);
    cart.add(umbTrim);

    // Click hitbox for Xe Cà Rem
    const cartHit = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 2.4, 1.4),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    cartHit.position.set(0, 1.2, 0);
    cartHit.userData.streetEncounterId = 'xe_ca_rem';
    cart.add(cartHit);
    this.streetEncounterClickTargets.push(cartHit);
    this.exteriorGroup.add(cart);
    this.addObstacle(46.2, 44.6, 1.05);

    // =========================================================================
    // 2. CÔ BÁN NÓN LÁ VEN CỔNG (Traditional conical hat vendor from image_bb72a8b0.png)
    // =========================================================================
    const hatGroup = new THREE.Group();
    hatGroup.position.set(45.2, 0, 46.8);
    hatGroup.rotation.y = -Math.PI * 0.45;

    const hatShadow = new THREE.Mesh(new THREE.CircleGeometry(0.85, 16), shadowMat);
    hatShadow.rotation.x = -Math.PI / 2;
    hatShadow.position.y = 0.02;
    hatGroup.add(hatShadow);

    // Articulated Southern Vietnamese lady wearing pastel áo bà ba & nón lá
    const vendorFig = this.makeArticulatedFigure({
      height: 1.58,
      robeHex: 0xD98B9E,
      hairType: 'bun',
      hat: true
    });
    vendorFig.root.position.set(-0.22, 0, 0);
    vendorFig.armL.rotation.x = -0.58;
    vendorFig.armR.rotation.x = -0.52;
    hatGroup.add(vendorFig.root);

    // Woven bamboo stool + stack of 9 handcrafted Vietnamese conical hats (Nón Lá)
    const bambooMat = new THREE.MeshStandardMaterial({ color: 0xB8935A, roughness: 0.78 });
    const leafHatMat = new THREE.MeshStandardMaterial({
      color: 0xE7D5A7,
      roughness: 0.72,
      side: THREE.DoubleSide
    });
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xC93B6B, roughness: 0.55 });

    const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.42, 12), bambooMat);
    stool.position.set(0.32, 0.21, 0.14);
    stool.castShadow = true;
    hatGroup.add(stool);

    for (let hi = 0; hi < 7; hi++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.17, 18, 1, true), leafHatMat);
      cone.position.set(0.32, 0.48 + hi * 0.065, 0.14);
      cone.castShadow = hi === 6;
      hatGroup.add(cone);
    }
    // Handheld stack of 4 conical hats held warmly by the vendor
    for (let hi = 0; hi < 4; hi++) {
      const handCone = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.15, 16, 1, true), leafHatMat);
      handCone.position.set(-0.02, 0.94 + hi * 0.055, 0.34);
      handCone.rotation.x = 0.22;
      hatGroup.add(handCone);
    }
    // Silk chin strap detail hanging softly from top hat
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.008, 5, 12, Math.PI), ribbonMat);
    strap.position.set(0.32, 0.86, 0.14);
    strap.rotation.z = Math.PI;
    hatGroup.add(strap);

    // Small welcoming plaque beside the bamboo hat stand
    const hatSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.32, 0.05),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('NÓN LÁ MỸ THO', {
          w: 384,
          h: 160,
          bg: '#26593C',
          border: '#F2CE74',
          color: '#FFF7DF',
          size: 40
        }),
        roughness: 0.45
      })
    );
    hatSign.position.set(0.32, 0.24, 0.42);
    hatGroup.add(hatSign);

    const hatHit = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 1.9, 1.2),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hatHit.position.set(0.05, 0.95, 0.1);
    hatHit.userData.streetEncounterId = 'co_ban_non_la';
    hatGroup.add(hatHit);
    this.streetEncounterClickTargets.push(hatHit);
    this.exteriorGroup.add(hatGroup);
    this.addObstacle(45.2, 46.8, 0.88);
  }
};
