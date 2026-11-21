/**
 * Tải & đặt các model GLB (tượng, kiến trúc, đạo cụ), khói hương.
 *
 * Mixin của VinhTrang3DWorld: 9 method (loadGLB … initSmokeColumns).
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, CHAR_GLB_PATHS, CHAR_HEIGHTS, STATUE_GLB_PATHS, ARHAT_GLB_PATHS, ARCH_GLB_PATHS, PROP_GLB_PATHS, SmokeColumn } from './shared.mjs';

export const glbLoadingMethods = {
  loadGLB(url) {
    if (!url) return Promise.resolve(null);
    const encoded = encodeURI(url);
    if (this.glbPromiseCache.has(encoded)) {
      return this.glbPromiseCache.get(encoded);
    }
    const p = new Promise((resolve) => {
      this.gltfLoader.load(
        encoded,
        (gltf) => resolve(gltf),
        undefined,
        () => resolve(null)
      );
    });
    this.glbPromiseCache.set(encoded, p);
    return p;
  },

  cleanStatueScene(gltfScene, matOverride = null, preserveGround = false) {
    const root = gltfScene.clone(true);
    const toRemove = [];
    root.traverse((o) => {
      if (!preserveGround && /ground|plane|floor|shadow/i.test(o.name || '')) {
        toRemove.push(o);
        return;
      }
      if (o.isMesh && o.geometry) {
        if (!o.geometry.getAttribute('normal')) {
          o.geometry.computeVertexNormals();
        }
        o.geometry.computeBoundingBox();
        const bb = o.geometry.boundingBox;
        if (bb && (bb.max.x - bb.min.x > 120 || bb.max.z - bb.min.z > 120)) {
          toRemove.push(o);
          return;
        }
        o.castShadow = true;
        o.receiveShadow = true;
        if (matOverride) {
          o.material = matOverride;
        } else if (o.material) {
          o.material = o.material.clone();
          if (o.geometry.getAttribute('color')) {
            o.material.vertexColors = true;
          }
          // Keep the cast-concrete finish matte and lightly weathered; preserve lotus and inscription colors.
          const matName = (o.material.name || '').toLowerCase();
          if (/white|statue|body|robe|skin/i.test(matName) || !matName) {
            o.material.bumpMap = this.stoneBumpTex;
            o.material.bumpScale = 0.018;
            o.material.roughness = Math.max(0.72, o.material.roughness ?? 0.78);
            o.material.metalness = 0.0;
          } else {
            o.material.roughness = Math.min(0.78, Math.max(0.34, o.material.roughness ?? 0.58));
          }
        }
      }
    });
    for (const r of toRemove) {
      if (r.parent) r.parent.remove(r);
    }
    return root;
  },

  async loadCharacterGLB(charKey) {
    const path = CHAR_GLB_PATHS[charKey];
    if (!path) return null;
    if (this.charDataCache[charKey]?.scene) return this.charDataCache[charKey];
    const gltf = await this.loadGLB(path);
    if (gltf?.scene) this.charDataCache[charKey] = gltf;
    return gltf;
  },

  async loadAllGLBAssets() {
    const initialKey = this.playerState.charKey || 'nu';
    const coreCharKeys = this.isSoftwareGl
      ? Array.from(new Set(['nu', initialKey]))
      : Array.from(new Set(['nu', 'nam', 'tre_em', initialKey]));

    // Phase 1: Critical Courtyard Statues, Architecture, Core Characters & Exterior Props
    const [
      adidaGltf,
      dilacGltf,
      phatNamGltf,
      banThoGltf,
      quanAmGltf,
      matTienGltf,
      tamQuanGltf,
      baoThapGltf,
      thapDenGltf,
      denLongGltf,
      chumSenGltf,
      mamNguQuaGltf,
      moGoGltf,
      banThoPropGltf,
      boDoanGltf,
      boDoanTronGltf,
      chieuCoiGltf,
      duaXiemGltf,
      banhBoGltf,
      banhDaLonGltf,
      quatNanGltf,
      gioMayGltf,
      denHoaDangGltf,
      nenSenGltf,
      nonLaGltf,
      tuiSenGltf,
      chimBoCauGltf,
      khanRanGltf,
      trangHatGltf,
      vongMayGltf,
      cayBoDeGltf,
      caySalaGltf,
      ...coreChars
    ] = await Promise.all([
      this.loadGLB(STATUE_GLB_PATHS.adida),
      this.loadGLB(STATUE_GLB_PATHS.dilac),
      this.loadGLB(STATUE_GLB_PATHS.phatnam),
      STATUE_GLB_PATHS.bantho ? this.loadGLB(STATUE_GLB_PATHS.bantho) : Promise.resolve(null),
      this.loadGLB(STATUE_GLB_PATHS.quanAm),
      this.loadGLB(ARCH_GLB_PATHS.mat_tien),
      this.loadGLB(ARCH_GLB_PATHS.tam_quan),
      this.loadGLB(ARCH_GLB_PATHS.bao_thap),
      this.loadGLB(ARCH_GLB_PATHS.thap_den_cau_an),
      this.loadGLB(PROP_GLB_PATHS.den_long),
      this.loadGLB(PROP_GLB_PATHS.chum_sen),
      this.loadGLB(PROP_GLB_PATHS.mam_ngu_qua),
      this.loadGLB(PROP_GLB_PATHS.mo_go),
      this.loadGLB(PROP_GLB_PATHS.ban_tho),
      this.loadGLB(PROP_GLB_PATHS.bo_doan),
      this.loadGLB(PROP_GLB_PATHS.bo_doan_tron),
      this.loadGLB(PROP_GLB_PATHS.chieu_coi_thien),
      this.loadGLB(PROP_GLB_PATHS.trai_dua_xiem),
      this.loadGLB(PROP_GLB_PATHS.dia_banh_bo),
      this.loadGLB(PROP_GLB_PATHS.dia_banh_da_lon),
      this.loadGLB(PROP_GLB_PATHS.quat_nan_la_dua),
      this.loadGLB(PROP_GLB_PATHS.gio_may_tre),
      this.loadGLB(PROP_GLB_PATHS.den_hoa_dang),
      this.loadGLB(PROP_GLB_PATHS.nen_hoa_sen),
      this.loadGLB(PROP_GLB_PATHS.non_la),
      this.loadGLB(PROP_GLB_PATHS.tui_sen),
      this.loadGLB(PROP_GLB_PATHS.chim_bo_cau),
      this.loadGLB(PROP_GLB_PATHS.khan_ran),
      this.loadGLB(PROP_GLB_PATHS.trang_hat),
      this.loadGLB(PROP_GLB_PATHS.vong_may),
      this.loadGLB(PROP_GLB_PATHS.cay_bo_de),
      this.loadGLB(PROP_GLB_PATHS.cay_sala),
      ...coreCharKeys.map((ck) => this.loadCharacterGLB(ck))
    ]);

    coreCharKeys.forEach((ck, idx) => {
      if (coreChars[idx]?.scene) this.charDataCache[ck] = coreChars[idx];
    });
    if (tamQuanGltf?.scene) this.archMeshCache.tam_quan = tamQuanGltf.scene;
    if (baoThapGltf?.scene) this.archMeshCache.bao_thap = baoThapGltf.scene;
    if (thapDenGltf?.scene) {
      this.archMeshCache.thap_den_cau_an = thapDenGltf.scene;
      if (this.blessingTowerBodyAnchor && !this.blessingTowerBodyAnchor.userData._glbMounted) {
        this.blessingTowerBodyAnchor.userData._glbMounted = true;
        const btModel = thapDenGltf.scene.clone(true);
        btModel.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
            if (o.geometry && !o.geometry.getAttribute('normal')) o.geometry.computeVertexNormals();
            if (o.material) {
              o.material = o.material.clone();
              o.material.emissive = new THREE.Color(0x5A1C08);
              o.material.emissiveIntensity = 0.22;
            }
          }
        });
        const box = new THREE.Box3().setFromObject(btModel);
        const sz = box.getSize(new THREE.Vector3());
        const radScale = 1.12 / Math.max(0.1, sz.x, sz.z);
        btModel.scale.set(radScale, 2.62 / Math.max(0.1, sz.y), radScale);
        const b2 = new THREE.Box3().setFromObject(btModel);
        btModel.position.set(-(b2.min.x + b2.max.x) / 2, -b2.min.y, -(b2.min.z + b2.max.z) / 2);
        if (this.blessingTowerProceduralCore) this.blessingTowerProceduralCore.visible = false;
        this.blessingTowerBodyAnchor.add(btModel);
        this.freezeStaticSubtree?.(btModel);
      }
    }
    if (banThoGltf?.scene) this.archMeshCache._bantho_fallback = banThoGltf.scene;

    // 0A. Mount custom sculpted Tam Quan Vĩnh Tràng GLB onto main entrance gate while retaining plaque + iron gates
    if (this.archMeshCache.tam_quan && this.tamQuanMainGroup) {
      const tq = this.archMeshCache.tam_quan.clone(true);
      tq.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
          if (o.geometry && !o.geometry.getAttribute('normal')) o.geometry.computeVertexNormals();
        }
      });
      const box = new THREE.Box3().setFromObject(tq);
      const sz = new THREE.Vector3();
      box.getSize(sz);
      tq.scale.setScalar(13.6 / Math.max(0.2, sz.x));
      const b2 = new THREE.Box3().setFromObject(tq);
      tq.position.set(-(b2.min.x + b2.max.x) / 2, -b2.min.y, -(b2.min.z + b2.max.z) / 2);
      for (const p of this.tamQuanProceduralParts) p.visible = false;
      this.tamQuanMainGroup.add(tq);
    }

    // 0B. Replace procedural Chánh Điện facade with sculpted mat-tien-vinh-trang.glb (strip 'Sân' ground plane)
    if (matTienGltf?.scene && this.chanhDienFacadeGroup) {
      const facade = matTienGltf.scene.clone(true);
      const removeNodes = [];
      facade.traverse((o) => {
        if (/^sân\b|^san\b|ground|terrain/i.test(o.name || '')) {
          removeNodes.push(o);
          return;
        }
        if (o.isMesh && o.geometry) {
          if (!o.geometry.getAttribute('normal')) o.geometry.computeVertexNormals();
          o.geometry.computeBoundingBox();
          const bb = o.geometry.boundingBox;
          if (bb && (bb.max.x - bb.min.x > 48 || bb.max.z - bb.min.z > 48) && bb.max.y - bb.min.y < 0.8) {
            removeNodes.push(o);
            return;
          }
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
      for (const rn of removeNodes) {
        if (rn.parent) rn.parent.remove(rn);
      }
      const box = new THREE.Box3().setFromObject(facade);
      const sz = new THREE.Vector3();
      box.getSize(sz);
      facade.scale.set(
        28.4 / Math.max(0.5, sz.x),
        11.2 / Math.max(0.5, sz.y),
        13.2 / Math.max(0.5, sz.z)
      );
      const box2 = new THREE.Box3().setFromObject(facade);
      facade.position.set(
        -(box2.min.x + box2.max.x) / 2,
        0.02 - box2.min.y,
        3.25 - box2.max.z
      );
      this.chanhDienFacadeGroup.add(facade);
      if (this.chanhDienProceduralShell) this.chanhDienProceduralShell.visible = false;
    }

    // 1. Đại tượng Phật A Di Đà in the front garden plaza (18m statue + 7m lotus/pedestal = 25m total).
    if (adidaGltf?.scene) {
      const s = this.cleanStatueScene(adidaGltf.scene, null);
      const box = new THREE.Box3().setFromObject(s);
      const h = Math.max(0.1, box.max.y - box.min.y);
      const scale = 25.0 / h;
      s.scale.setScalar(scale);
      const box2 = new THREE.Box3().setFromObject(s);
      s.position.set(
        -(box2.min.x + box2.max.x) / 2,
        0.42 - box2.min.y,
        -(box2.min.z + box2.max.z) / 2
      );
      s.rotation.y = 0;
      this.adidaGroup.add(s);

      // 1B. Đại Tượng Phật Lớn bên trong Công Viên Văn Hóa Vĩnh Tràng (16.5m trên bệ 3.2m = ~19.7m!)
      if (this.parkBuddhaStatueAnchor && !this.parkBuddhaStatueAnchor.userData._glbMounted) {
        this.parkBuddhaStatueAnchor.userData._glbMounted = true;
        if (this.parkBuddhaFallback?.parent) {
          this.parkBuddhaFallback.parent.remove(this.parkBuddhaFallback);
        }
        const ps = this.cleanStatueScene(adidaGltf.scene, null);
        const pBox = new THREE.Box3().setFromObject(ps);
        const pH = Math.max(0.1, pBox.max.y - pBox.min.y);
        ps.scale.setScalar(16.5 / pH);
        const pBox2 = new THREE.Box3().setFromObject(ps);
        ps.position.set(
          -(pBox2.min.x + pBox2.max.x) / 2,
          -pBox2.min.y,
          -(pBox2.min.z + pBox2.max.z) / 2
        );
        ps.rotation.y = 0;
        if (this.isSoftwareGl) {
          ps.traverse((c) => {
            if (c.isMesh) {
              c.castShadow = false;
              c.receiveShadow = false;
            }
          });
        }
        this.parkBuddhaStatueAnchor.add(ps);
      }
    }

    // 2. Đại tượng Phật Di Lặc — uniform proportional scale (~15.2m statue atop 4.8m terrace = 20m total)
    if (dilacGltf?.scene) {
      const s = this.cleanStatueScene(dilacGltf.scene, null);
      const box = new THREE.Box3().setFromObject(s);
      const h = Math.max(0.1, box.max.y - box.min.y);
      s.scale.setScalar(15.2 / h);
      const box2 = new THREE.Box3().setFromObject(s);
      s.position.set(
        -(box2.min.x + box2.max.x) / 2,
        4.94 - box2.min.y,
        -(box2.min.z + box2.max.z) / 2 - 2.4
      );
      s.rotation.y = 0;
      this.dilacGroup.add(s);
    }

    // 3. Đại tượng Phật nhập Niết Bàn — fit 32m body cleanly atop the 3.6m multi-tier stone plinth
    if (phatNamGltf?.scene) {
      const s = this.cleanStatueScene(phatNamGltf.scene, null);
      const box = new THREE.Box3().setFromObject(s);
      const w = Math.max(0.1, box.max.x - box.min.x, box.max.z - box.min.z);
      const scale = 32.0 / w;
      s.scale.setScalar(scale);
      const box2 = new THREE.Box3().setFromObject(s);
      s.position.set(
        -(box2.min.x + box2.max.x) / 2,
        3.62 - box2.min.y,
        -(box2.min.z + box2.max.z) / 2
      );
      s.rotation.y = 0;
      this.nietBanGroup.add(s);
    }

    // 4. Porch Buddha Altar + Bảo Tháp
    if (banThoGltf?.scene && this.chanhDienPorchAltar) {
      const porchBuddha = this.cleanStatueScene(banThoGltf.scene, null);
      const box = new THREE.Box3().setFromObject(porchBuddha);
      const h = Math.max(0.1, box.max.y - box.min.y);
      porchBuddha.scale.setScalar(2.15 / h);
      const pb = new THREE.Box3().setFromObject(porchBuddha);
      porchBuddha.position.set(
        -(pb.min.x + pb.max.x) / 2,
        1.03 - pb.min.y,
        -(pb.min.z + pb.max.z) / 2
      );
      porchBuddha.rotation.y = 0;
      this.chanhDienPorchAltar.add(porchBuddha);
    }

    // 5. Tượng Quán Thế Âm Nam Hải replacing placeholder cylinder/sphere
    if (quanAmGltf?.scene && this.quanAmGroup) {
      for (const p of this.quanAmPlaceholderParts) {
        if (p.parent) p.parent.remove(p);
      }
      const qa = this.cleanStatueScene(quanAmGltf.scene, null);
      const box = new THREE.Box3().setFromObject(qa);
      const h = Math.max(0.1, box.max.y - box.min.y);
      qa.scale.setScalar(3.35 / h);
      const box2 = new THREE.Box3().setFromObject(qa);
      qa.position.set(
        -(box2.min.x + box2.max.x) / 2,
        1.82 - box2.min.y,
        -(box2.min.z + box2.max.z) / 2
      );
      this.quanAmGroup.add(qa);
    }

    if (this.archMeshCache.bao_thap && this.stupaGroup) {
      while (this.stupaGroup.children.length > 0) this.stupaGroup.remove(this.stupaGroup.children[0]);
      const stupa = this.fitProp(this.archMeshCache.bao_thap, 35.0);
      const sb = new THREE.Box3().setFromObject(stupa);
      stupa.position.set(-(sb.min.x + sb.max.x) / 2, -sb.min.y, -(sb.min.z + sb.max.z) / 2);
      this.stupaGroup.add(stupa);
    }

    if (denLongGltf?.scene) this.propMeshCache.den_long = denLongGltf.scene;
    if (chumSenGltf?.scene) this.propMeshCache.chum_sen = chumSenGltf.scene;
    if (mamNguQuaGltf?.scene) this.propMeshCache.mam_ngu_qua = mamNguQuaGltf.scene;
    if (moGoGltf?.scene) {
      this.propMeshCache.mo_go = moGoGltf.scene;
      this.propMeshCache.mo_go_tung_kinh = moGoGltf.scene;
    }
    if (banThoPropGltf?.scene) {
      this.propMeshCache.ban_tho = banThoPropGltf.scene;
      this.propMeshCache.bat_nhang_tram = banThoPropGltf.scene;
    }
    if (boDoanGltf?.scene) this.propMeshCache.bo_doan = boDoanGltf.scene;
    if (boDoanTronGltf?.scene) this.propMeshCache.bo_doan_tron = boDoanTronGltf.scene;
    if (chieuCoiGltf?.scene) this.propMeshCache.chieu_coi_thien = chieuCoiGltf.scene;
    if (duaXiemGltf?.scene) this.propMeshCache.trai_dua_xiem = duaXiemGltf.scene;
    if (banhBoGltf?.scene) this.propMeshCache.dia_banh_bo = banhBoGltf.scene;
    if (banhDaLonGltf?.scene) this.propMeshCache.dia_banh_da_lon = banhDaLonGltf.scene;
    if (quatNanGltf?.scene) this.propMeshCache.quat_nan_la_dua = quatNanGltf.scene;
    if (gioMayGltf?.scene) this.propMeshCache.gio_may_tre = gioMayGltf.scene;
    if (denHoaDangGltf?.scene) this.propMeshCache.den_hoa_dang = denHoaDangGltf.scene;
    if (nenSenGltf?.scene) {
      this.propMeshCache.nen_hoa_sen = nenSenGltf.scene;
      this.propMeshCache.hoa_sen = nenSenGltf.scene;
    }
    if (nonLaGltf?.scene) this.propMeshCache.non_la = nonLaGltf.scene;
    if (tuiSenGltf?.scene) this.propMeshCache.tui_sen = tuiSenGltf.scene;
    if (chimBoCauGltf?.scene) this.propMeshCache.chim_bo_cau = chimBoCauGltf.scene;
    if (khanRanGltf?.scene) this.propMeshCache.khan_ran = khanRanGltf.scene;
    if (trangHatGltf?.scene) this.propMeshCache.trang_hat = trangHatGltf.scene;
    if (vongMayGltf?.scene) this.propMeshCache.vong_may = vongMayGltf.scene;
    if (cayBoDeGltf?.scene) this.propMeshCache.cay_bo_de = cayBoDeGltf.scene;
    if (caySalaGltf?.scene) this.propMeshCache.cay_sala = caySalaGltf.scene;

    this.placeLoaded3DPropsInWorld();
    this.setCharacter(this.playerState.charKey || initialKey);
    this.spawnMonksAndPilgrimsV8();
    this.initSmokeColumns();
    this.renderFrame();
    this.loaded = true;
    this.onLoaded();

    // Phase 2: Stagger bell/drum/vehicle exterior props & diverse NPC characters without stalling boot
    window.setTimeout(() => {
      this._loadPhase2ExteriorExtras().catch(() => {});
    }, this.isSoftwareGl ? 6500 : 400);
  },

  async _loadPhase2ExteriorExtras() {
    if (this._phase2Started) return;
    this._phase2Started = true;
    const yieldFrame = () => new Promise((r) => window.setTimeout(r, this.isSoftwareGl ? 420 : 25));
    let daiHongChungGltf = null;
    let trongBatNhaGltf = null;
    let xeKhachGltf = null;
    let xeOtoGltf = null;
    if (this.isSoftwareGl) {
      daiHongChungGltf = await this.loadGLB(ARCH_GLB_PATHS.dai_hong_chung);
      await yieldFrame();
      trongBatNhaGltf = await this.loadGLB(ARCH_GLB_PATHS.trong_bat_nha);
      await yieldFrame();
      xeKhachGltf = await this.loadGLB(ARCH_GLB_PATHS.xe_khach);
      await yieldFrame();
      xeOtoGltf = await this.loadGLB(ARCH_GLB_PATHS.xe_oto);
    } else {
      [daiHongChungGltf, trongBatNhaGltf, xeKhachGltf, xeOtoGltf] = await Promise.all([
        this.loadGLB(ARCH_GLB_PATHS.dai_hong_chung),
        this.loadGLB(ARCH_GLB_PATHS.trong_bat_nha),
        this.loadGLB(ARCH_GLB_PATHS.xe_khach),
        this.loadGLB(ARCH_GLB_PATHS.xe_oto)
      ]);
    }

    if (daiHongChungGltf?.scene) {
      this.archMeshCache.dai_hong_chung = daiHongChungGltf.scene;
      for (const anchor of this.bellTowerArchAnchors) {
        if (anchor.placeholder?.parent) anchor.placeholder.parent.remove(anchor.placeholder);
        const bell = this.fitProp(daiHongChungGltf.scene, anchor.targetH || 1.85);
        const bb = new THREE.Box3().setFromObject(bell);
        bell.position.set(-(bb.min.x + bb.max.x) / 2, anchor.y - bb.min.y, -(bb.min.z + bb.max.z) / 2);
        anchor.group.add(bell);
      }
    }
    if (trongBatNhaGltf?.scene) {
      this.archMeshCache.trong_bat_nha = trongBatNhaGltf.scene;
      for (const anchor of this.drumTowerArchAnchors) {
        if (anchor.placeholder?.parent) anchor.placeholder.parent.remove(anchor.placeholder);
        const drum = this.fitProp(trongBatNhaGltf.scene, anchor.targetH || 1.72);
        const db = new THREE.Box3().setFromObject(drum);
        drum.position.set(-(db.min.x + db.max.x) / 2, anchor.y - db.min.y, -(db.min.z + db.max.z) / 2);
        anchor.group.add(drum);
      }
    }
    if (xeKhachGltf?.scene) this.archMeshCache.xe_khach = xeKhachGltf.scene;
    if (xeOtoGltf?.scene) this.archMeshCache.xe_oto = xeOtoGltf.scene;
    for (const pa of this.parkedVehicleAnchors) {
      const model = pa.kind === 'van' ? this.archMeshCache.xe_khach : this.archMeshCache.xe_oto;
      if (model && this.buildGLBRoadVehicle && !pa._upgraded) {
        pa._upgraded = true;
        if (pa.fallback?.parent) pa.fallback.parent.remove(pa.fallback);
        this.buildGLBRoadVehicle(model, pa.x, pa.z, pa.yaw, pa.targetLength);
      }
    }
    this.renderFrame();

    // Phase 2B: Stagger-load diverse NPC character GLBs (Nữ áo lam, Nam áo nâu, Sư thầy, Du khách quốc tế)
    // without blocking initial boot, then refresh diverse courtyard visitors
    const extraCharKeys = ['nam', 'tre_em', 'nu_ao_lam', 'nam_ao_nau', 'su_thay', 'du_khach'];
    let loadedAnyExtraChar = false;
    for (const ck of extraCharKeys) {
      if (this.charDataCache[ck]?.scene) continue;
      await yieldFrame();
      const loaded = await this.loadCharacterGLB(ck);
      if (loaded?.scene) loadedAnyExtraChar = true;
    }
    if (loadedAnyExtraChar && typeof this.spawnMonksAndPilgrimsV8 === 'function' && !this._diverseNpcsRefreshed) {
      this._diverseNpcsRefreshed = true;
      // Add 4 diverse NPCs showcasing newly loaded Meshy character models around Tháp Đèn & Sân Chánh Điện
      const bonusSpecs = [
        {
          charKey: 'su_thay',
          name: 'Sư Thầy Thiện Tâm',
          scaleVar: 1.03,
          speed: 0.72,
          pts: [
            { x: 24.5, z: 16.5, wait: 3.5, action: 'chap_tay', lookX: 28.2, lookZ: 15.2 },
            { x: 18.0, z: 19.0, wait: 2.5, action: 'dung', lookX: 14.0, lookZ: 15.0 }
          ]
        },
        {
          charKey: 'nu_ao_lam',
          name: 'Phật tử Diệu Hoa',
          scaleVar: 0.98,
          speed: 0.85,
          pts: [
            { x: 31.2, z: 16.8, wait: 4.0, action: 'chap_tay', lookX: 28.2, lookZ: 15.2 },
            { x: 26.8, z: 22.5, wait: 2.8, action: 'dung', lookX: 28.2, lookZ: 15.2 }
          ]
        },
        {
          charKey: 'nam_ao_nau',
          name: 'Đạo hữu Minh Đức',
          scaleVar: 1.05,
          speed: 0.9,
          pts: [
            { x: 25.2, z: 12.2, wait: 3.2, action: 'chap_tay', lookX: 28.2, lookZ: 15.2 },
            { x: 20.5, z: 14.5, wait: 2.4, action: 'dung', lookX: 28.2, lookZ: 15.2 }
          ]
        },
        {
          charKey: 'du_khach',
          name: 'Du khách quốc tế',
          scaleVar: 1.06,
          speed: 0.82,
          pts: [
            { x: 32.5, z: 20.2, wait: 3.8, action: 'dung', lookX: 28.2, lookZ: 15.2 },
            { x: 28.5, z: 25.5, wait: 3.0, action: 'dung', lookX: 16.0, lookZ: 16.0 }
          ]
        }
      ];
      for (const sp of bonusSpecs) {
        if (!this.charDataCache[sp.charKey]?.scene) continue;
        const targetH = (CHAR_HEIGHTS[sp.charKey] || 1.66) * (sp.scaleVar || 1);
        const rec = this.cloneAnimatedCharacter?.(sp.charKey, targetH);
        if (!rec?.root) continue;
        rec.root.position.set(sp.pts[0].x, rec.baseY || 0, sp.pts[0].z);
        rec.npcMeta = {
          id: `courtyard_diverse_${sp.charKey}`,
          role: sp.charKey === 'su_thay' ? 'monk' : 'pilgrim',
          charKey: sp.charKey,
          label: sp.name,
          headHeight: targetH
        };
        this.exteriorGroup?.add(rec.root);
        this.playClipCrossfade?.(rec, 'Di bo', 0.15, false);
        this.riggedNpcRecords?.push({
          rec,
          pts: sp.pts,
          idx: 0,
          speed: sp.speed,
          yaw: 0,
          state: 'walk',
          pauseTimer: 1.2,
          pauseClip: 'Dung',
          pauseGesture: '',
          lookX: sp.pts[0].lookX,
          lookZ: sp.pts[0].lookZ
        });
      }
      this.renderFrame();
    }

    // Phase 3 (Gentle Idle Cache Warmup): Only pre-fetch light priority interior assets when player is idle
    window.setTimeout(() => {
      this._preloadInteriorAssetsIdle().catch(() => {});
    }, this.isSoftwareGl ? 4200 : 2600);
  },

  async _preloadInteriorAssetsIdle() {
    if (this._interiorIdlePreloadStarted || this._interiorGLBsMounted) return;
    this._interiorIdlePreloadStarted = true;
    // Pre-fetch ONLY the East Corridor arrival zone lightly during idle so first entry is instant without spiking memory
    const lightEntryUrls = [
      STATUE_GLB_PATHS.hoPhap,
      STATUE_GLB_PATHS.nghinMatNghinTay,
      STATUE_GLB_PATHS.quanAm,
      STATUE_GLB_PATHS.choNguCuaPhat,
      ARCH_GLB_PATHS.hon_non_bo
    ];
    for (const url of lightEntryUrls) {
      if (this.inInterior || this._interiorGLBsMounted) return;
      // Pause preloading while the user is actively moving to keep outdoor frame times flat
      while (this.playerState?.moving && !this.inInterior) {
        await new Promise((r) => window.setTimeout(r, 320));
      }
      if (this.inInterior) return;
      await this.loadGLB(url);
      await new Promise((r) => window.setTimeout(r, this.isSoftwareGl ? 420 : 240));
    }
  },

  _getInteriorSharedMaterials() {
    if (this._interiorSharedMats) return this._interiorSharedMats;
    this._interiorSharedMats = {
      gilded_gold: new THREE.MeshStandardMaterial({
        color: 0xE2B03C,
        metalness: 0.68,
        roughness: 0.26,
        envMapIntensity: 0.65
      }),
      antique_bronze: new THREE.MeshStandardMaterial({
        color: 0xB88236,
        metalness: 0.58,
        roughness: 0.34,
        envMapIntensity: 0.55
      }),
      jackfruit_wood: new THREE.MeshStandardMaterial({
        color: 0x8F4C24,
        metalness: 0.22,
        roughness: 0.42,
        envMapIntensity: 0.42
      }),
      dark_bronze: new THREE.MeshStandardMaterial({
        color: 0x5E3E20,
        metalness: 0.48,
        roughness: 0.38,
        envMapIntensity: 0.48
      })
    };
    return this._interiorSharedMats;
  },

  _yieldInteriorFrame(extraMs = 0) {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(() => {
          if (extraMs > 0) window.setTimeout(resolve, extraMs);
          else resolve();
        });
      } else {
        window.setTimeout(resolve, Math.max(16, extraMs));
      }
    });
  },

  _mountInteriorStatue(sceneObj, anchor, opts = {}) {
    if (!sceneObj || !anchor) return null;
    const mats = this._getInteriorSharedMaterials();
    const matOverride = mats[opts.matKind] || null;
    const mesh = this.cleanStatueScene(sceneObj, matOverride, true);
    if (opts.matKind === 'keep_gold_pbr') {
      mesh.traverse((o) => {
        if (o.isMesh && o.material) {
          o.material.roughness = Math.min(0.42, o.material.roughness ?? 0.34);
          o.material.metalness = Math.max(0.42, o.material.metalness ?? 0.48);
        }
      });
    }
    const rawBox = new THREE.Box3().setFromObject(mesh);
    const rawSz = rawBox.getSize(new THREE.Vector3());
    if (opts.alignWideX && rawSz.z > rawSz.x * 1.18) {
      mesh.rotation.y = Math.PI / 2;
    }
    if (opts.rotY) {
      mesh.rotation.y += opts.rotY;
    }
    const box = new THREE.Box3().setFromObject(mesh);
    const sz = box.getSize(new THREE.Vector3());
    const scale = opts.targetW
      ? opts.targetW / Math.max(0.1, sz.x)
      : (opts.targetH || 1.9) / Math.max(0.1, sz.y);
    mesh.scale.setScalar(scale);
    const b2 = new THREE.Box3().setFromObject(mesh);
    mesh.position.set(
      (opts.offsetX || 0) - (b2.min.x + b2.max.x) / 2,
      (opts.offsetY || 0) - b2.min.y,
      (opts.offsetZ || 0) - (b2.min.z + b2.max.z) / 2
    );
    mesh.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = false;
        o.receiveShadow = false;
      }
    });
    anchor.add(mesh);
    this.freezeStaticSubtree?.(mesh);
    return mesh;
  },

  /**
   * Zone-prioritized lazy loader for Chánh Điện interior GLBs.
   * Mounts ONLY the active entry zone immediately (spread across rAF frames so FPS never stalls),
   * while deferring occluded halls (e.g. 18 Arhats behind walls) until approached or gently streamed.
   */
  async ensureInteriorZoneLoaded(zoneKey = 'east_corridor') {
    this.ensureInteriorBuilt?.();
    if (!this._interiorZonesLoaded) {
      this._interiorZonesLoaded = {
        east_corridor: false,
        center_and_north: false,
        west_chanh_dien: false
      };
    }
    if (!this._interiorZonePromises) this._interiorZonePromises = {};
    if (this._interiorZonesLoaded[zoneKey]) return true;
    if (this._interiorZonePromises[zoneKey]) return this._interiorZonePromises[zoneKey];

    const stripCastShadow = (root) => {
      if (!root) return;
      root.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = false;
          o.receiveShadow = false;
        }
      });
    };

    const delayMs = this.isSoftwareGl ? 24 : 8;

    const job = (async () => {
      if (zoneKey === 'east_corridor') {
        const [
          hoPhapGltf,
          nghinMatGltf,
          quanAmGltf,
          choNguGltf,
          adidaGltf,
          dilacGltf,
          hangLongGltf,
          tieuDienGltf,
          phatNamGltf
        ] = await Promise.all([
          this.loadGLB(STATUE_GLB_PATHS.hoPhap),
          this.loadGLB(STATUE_GLB_PATHS.nghinMatNghinTay),
          this.loadGLB(STATUE_GLB_PATHS.quanAm),
          this.loadGLB(STATUE_GLB_PATHS.choNguCuaPhat),
          this.loadGLB(STATUE_GLB_PATHS.adida),
          this.loadGLB(STATUE_GLB_PATHS.dilac),
          this.loadGLB(ARHAT_GLB_PATHS.hangLong),
          this.loadGLB(STATUE_GLB_PATHS.tieuDien),
          this.loadGLB(STATUE_GLB_PATHS.phatnam)
        ]);

        const eastShrineGltfMap = {
          hoPhap: hoPhapGltf?.scene,
          nghinMat: nghinMatGltf?.scene,
          quanAm: quanAmGltf?.scene,
          choNgu: choNguGltf?.scene,
          adida: adidaGltf?.scene,
          dilac: dilacGltf?.scene,
          duocSu: hangLongGltf?.scene,
          tieuDien: tieuDienGltf?.scene
        };

        const shrines = this.eastCorridorShrines || [];
        for (let i = 0; i < shrines.length; i++) {
          const spec = shrines[i];
          const modelScene = eastShrineGltfMap[spec.key];
          if (!modelScene || !spec.anchor || spec.anchor.userData._glbMounted) continue;
          spec.anchor.userData._glbMounted = true;
          this._mountInteriorStatue(modelScene, spec.anchor, {
            targetH: spec.targetH,
            targetW: spec.targetW,
            matKind: spec.matKind,
            alignWideX: Boolean(spec.isBed),
            offsetY: spec.isBed ? 0.02 : 0
          });
          // Yield every 2 shrines so frame time stays smooth
          if (i % 2 === 1) await this._yieldInteriorFrame(delayMs);
        }

        if (phatNamGltf?.scene && this.northExitOutdoorBuddhaAnchor && !this.northExitOutdoorBuddhaAnchor.userData._glbMounted) {
          this.northExitOutdoorBuddhaAnchor.userData._glbMounted = true;
          this._mountInteriorStatue(phatNamGltf.scene, this.northExitOutdoorBuddhaAnchor, {
            targetW: 5.4,
            alignWideX: true,
            rotY: Math.PI
          });
        }
        this._interiorZonesLoaded.east_corridor = true;
      } else if (zoneKey === 'center_and_north') {
        const [thapDenGltf, honNonBoGltf, trongBatNhaGltf, toDatMaGltf] = await Promise.all([
          this.loadGLB(ARCH_GLB_PATHS.thap_den_cau_an),
          this.loadGLB(ARCH_GLB_PATHS.hon_non_bo),
          this.loadGLB(ARCH_GLB_PATHS.trong_bat_nha),
          this.loadGLB(STATUE_GLB_PATHS.toDatMa)
        ]);
        if (thapDenGltf?.scene) this.archMeshCache.thap_den_cau_an = thapDenGltf.scene;
        if (honNonBoGltf?.scene) this.archMeshCache.hon_non_bo = honNonBoGltf.scene;
        if (trongBatNhaGltf?.scene) this.archMeshCache.trong_bat_nha = trongBatNhaGltf.scene;

        if (this.archMeshCache.thap_den_cau_an && this.blessingTowerBodyAnchor && !this.blessingTowerBodyAnchor.userData._glbMounted) {
          this.blessingTowerBodyAnchor.userData._glbMounted = true;
          const btModel = this.archMeshCache.thap_den_cau_an.clone(true);
          btModel.traverse((o) => {
            if (o.isMesh) {
              o.castShadow = false;
              o.receiveShadow = false;
              if (o.geometry && !o.geometry.getAttribute('normal')) o.geometry.computeVertexNormals();
              if (o.material) {
                o.material = o.material.clone();
                o.material.emissive = new THREE.Color(0x6E240A);
                o.material.emissiveIntensity = 0.28;
              }
            }
          });
          const box = new THREE.Box3().setFromObject(btModel);
          const sz = box.getSize(new THREE.Vector3());
          const radScale = 1.1 / Math.max(0.1, sz.x, sz.z);
          btModel.scale.set(radScale, 2.45 / Math.max(0.1, sz.y), radScale);
          const b2 = new THREE.Box3().setFromObject(btModel);
          btModel.position.set(-(b2.min.x + b2.max.x) / 2, -b2.min.y, -(b2.min.z + b2.max.z) / 2);
          if (this.blessingTowerProceduralCore) this.blessingTowerProceduralCore.visible = false;
          this.blessingTowerBodyAnchor.add(btModel);
          this.freezeStaticSubtree?.(btModel);
        }
        await this._yieldInteriorFrame(delayMs);

        if (this.archMeshCache.hon_non_bo && this.innerNonBoRockAnchor && !this.innerNonBoRockAnchor.userData._glbMounted) {
          this.innerNonBoRockAnchor.userData._glbMounted = true;
          const nbModel = this.archMeshCache.hon_non_bo.clone(true);
          nbModel.traverse((o) => {
            if (o.isMesh) {
              o.castShadow = false;
              o.receiveShadow = false;
              if (o.geometry && !o.geometry.getAttribute('normal')) o.geometry.computeVertexNormals();
            }
          });
          const box = new THREE.Box3().setFromObject(nbModel);
          const sz = box.getSize(new THREE.Vector3());
          const xzScale = 4.65 / Math.max(0.2, sz.x, sz.z);
          nbModel.scale.set(xzScale, 4.45 / Math.max(0.2, sz.y), xzScale);
          const b2 = new THREE.Box3().setFromObject(nbModel);
          nbModel.position.set(-(b2.min.x + b2.max.x) / 2, -b2.min.y, -0.15 - (b2.min.z + b2.max.z) / 2);
          if (this.innerNonBoProceduralRocks) this.innerNonBoProceduralRocks.visible = false;
          this.innerNonBoRockAnchor.add(nbModel);
          this.freezeStaticSubtree?.(nbModel);
        }
        await this._yieldInteriorFrame(delayMs);

        if (this.archMeshCache.trong_bat_nha && this.interiorDrumAnchor?.group && !this.interiorDrumAnchor.group.userData._glbMounted) {
          this.interiorDrumAnchor.group.userData._glbMounted = true;
          if (this.interiorDrumAnchor.placeholder?.parent) {
            this.interiorDrumAnchor.placeholder.parent.remove(this.interiorDrumAnchor.placeholder);
          }
          const drumRaw = this.archMeshCache.trong_bat_nha.clone(true);
          drumRaw.traverse((o) => {
            if (o.isMesh) {
              o.castShadow = false;
              o.receiveShadow = false;
              if (o.geometry && !o.geometry.getAttribute('normal')) o.geometry.computeVertexNormals();
            }
          });
          drumRaw.rotation.x = Math.PI * 0.42;
          const idrum = new THREE.Group();
          idrum.add(drumRaw);
          const rawBox = new THREE.Box3().setFromObject(idrum);
          const rawSz = rawBox.getSize(new THREE.Vector3());
          const scale = 1.48 / Math.max(0.05, rawSz.x, rawSz.y, rawSz.z);
          idrum.scale.setScalar(scale);
          const db = new THREE.Box3().setFromObject(idrum);
          idrum.position.set(-(db.min.x + db.max.x) / 2, 0.72 - db.min.y, -(db.min.z + db.max.z) / 2);
          this.interiorDrumAnchor.group.add(idrum);
          this.freezeStaticSubtree?.(idrum);
        }

        if (toDatMaGltf?.scene && this.toDatMaAnchor && !this.toDatMaAnchor.userData._glbMounted) {
          this.toDatMaAnchor.userData._glbMounted = true;
          this._mountInteriorStatue(toDatMaGltf.scene, this.toDatMaAnchor, {
            targetH: 2.15,
            matKind: 'jackfruit_wood'
          });
        }
        this._interiorZonesLoaded.center_and_north = true;
      } else if (zoneKey === 'west_chanh_dien') {
        const mats = this._getInteriorSharedMaterials();
        // Batch A: Primary Tam Bảo altar triad + Bao Lam + Long Trụ + Bell + Ritual Props
        const [
          thienDinhGltf,
          quanAmGltf,
          adidaGltf,
          baoLamGltf,
          longTruGltf,
          daiHongChungGltf,
          capHacRuaGltf,
          nhangKhoanhDongGltf
        ] = await Promise.all([
          this.loadGLB(ARHAT_GLB_PATHS.thienDinh),
          this.loadGLB(STATUE_GLB_PATHS.quanAm),
          this.loadGLB(STATUE_GLB_PATHS.adida),
          this.loadGLB(ARCH_GLB_PATHS.bao_lam),
          this.loadGLB(ARCH_GLB_PATHS.long_tru),
          this.loadGLB(ARCH_GLB_PATHS.dai_hong_chung),
          this.loadGLB(PROP_GLB_PATHS.cap_hac_rua),
          this.loadGLB(PROP_GLB_PATHS.nhang_khoanh_dong)
        ]);

        if (longTruGltf?.scene) this.archMeshCache.long_tru = longTruGltf.scene;
        if (baoLamGltf?.scene) this.archMeshCache.bao_lam = baoLamGltf.scene;
        if (daiHongChungGltf?.scene) this.archMeshCache.dai_hong_chung = daiHongChungGltf.scene;
        if (capHacRuaGltf?.scene) this.propMeshCache.cap_hac_rua = capHacRuaGltf.scene;
        if (nhangKhoanhDongGltf?.scene) this.propMeshCache.nhang_khoanh_dong = nhangKhoanhDongGltf.scene;

        const clearPlaceholders = (anchor) => {
          for (let i = anchor.children.length - 1; i >= 0; i--) {
            if (anchor.children[i]?.userData?._placeholder) anchor.remove(anchor.children[i]);
          }
        };

        if (this.tamBaoMainAnchor && thienDinhGltf?.scene && !this.tamBaoMainAnchor.userData._glbMounted) {
          this.tamBaoMainAnchor.userData._glbMounted = true;
          clearPlaceholders(this.tamBaoMainAnchor);
          this._mountInteriorStatue(thienDinhGltf.scene, this.tamBaoMainAnchor, { targetH: 3.1, matKind: 'gilded_gold' });
        }
        if (this.tamBaoLeftAnchor && quanAmGltf?.scene && !this.tamBaoLeftAnchor.userData._glbMounted) {
          this.tamBaoLeftAnchor.userData._glbMounted = true;
          clearPlaceholders(this.tamBaoLeftAnchor);
          this._mountInteriorStatue(quanAmGltf.scene, this.tamBaoLeftAnchor, { targetH: 2.55, matKind: 'gilded_gold' });
        }
        if (this.tamBaoRightAnchor && adidaGltf?.scene && !this.tamBaoRightAnchor.userData._glbMounted) {
          this.tamBaoRightAnchor.userData._glbMounted = true;
          clearPlaceholders(this.tamBaoRightAnchor);
          this._mountInteriorStatue(adidaGltf.scene, this.tamBaoRightAnchor, { targetH: 2.55, matKind: 'gilded_gold' });
        }
        await this._yieldInteriorFrame(delayMs);

        // Authentic Chùa Vĩnh Tràng Chánh Điện uses an open high gilded Bao Lam & slender lacquered columns
        // built architecturally in vinh-trang-square-interior.mjs — do NOT mount enclosed miếu bao_lam or chunky long_tru GLBs.
        if (this.archMeshCache.dai_hong_chung && this.interiorBellAnchor?.group && !this.interiorBellAnchor.group.userData._glbMounted) {
          this.interiorBellAnchor.group.userData._glbMounted = true;
          if (this.interiorBellAnchor.placeholder?.parent) {
            this.interiorBellAnchor.placeholder.parent.remove(this.interiorBellAnchor.placeholder);
          }
          const ibell = this.cleanStatueScene(this.archMeshCache.dai_hong_chung, mats.dark_bronze, true);
          const box = new THREE.Box3().setFromObject(ibell);
          const sz = box.getSize(new THREE.Vector3());
          ibell.scale.setScalar(2.45 / Math.max(0.1, sz.y));
          const bb = new THREE.Box3().setFromObject(ibell);
          ibell.position.set(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
          stripCastShadow(ibell);
          this.interiorBellAnchor.group.add(ibell);
          this.freezeStaticSubtree?.(ibell);
        }
        if (this.propMeshCache.nhang_khoanh_dong && this.spiralIncenseAnchors?.length) {
          for (const anc of this.spiralIncenseAnchors) {
            if (anc.userData._glbMounted) continue;
            anc.userData._glbMounted = true;
            while (anc.children.length > 0) anc.remove(anc.children[0]);
            const coil = this.fitProp(this.propMeshCache.nhang_khoanh_dong, 1.02);
            const cb = new THREE.Box3().setFromObject(coil);
            coil.position.set(-(cb.min.x + cb.max.x) / 2, -cb.max.y, -(cb.min.z + cb.max.z) / 2);
            stripCastShadow(coil);
            anc.add(coil);
            this.freezeStaticSubtree?.(coil);
          }
        }
        if (this.propMeshCache.cap_hac_rua && this.craneTortoiseAnchor && !this.craneTortoiseAnchor.userData._glbMounted) {
          this.craneTortoiseAnchor.userData._glbMounted = true;
          while (this.craneTortoiseAnchor.children.length > 0) {
            this.craneTortoiseAnchor.remove(this.craneTortoiseAnchor.children[0]);
          }
          for (const cx of [-3.05, 3.05]) {
            const crane = this.fitProp(this.propMeshCache.cap_hac_rua, 1.55);
            const cb = new THREE.Box3().setFromObject(crane);
            crane.position.set(cx - (cb.min.x + cb.max.x) / 2, -cb.min.y, -(cb.min.z + cb.max.z) / 2);
            crane.rotation.y = cx < 0 ? 0.16 : -0.16;
            stripCastShadow(crane);
            this.craneTortoiseAnchor.add(crane);
            this.freezeStaticSubtree?.(crane);
          }
        }
        await this._yieldInteriorFrame(delayMs);

        // Batch B: 18 Thập Bát La Hán streamed progressively (2 statues per animation frame -> zero frame spikes!)
        const [
          kyTuongGltf,
          toaLocGltf,
          phucHoGltf,
          hangLongGltf,
          hoanHiGltf,
          phucHo2Gltf,
          cuBatGltf,
          thacThapGltf,
          khaiTamGltf,
          tieuSuGltf
        ] = await Promise.all([
          this.loadGLB(ARHAT_GLB_PATHS.kyTuong),
          this.loadGLB(ARHAT_GLB_PATHS.toaLoc),
          this.loadGLB(ARHAT_GLB_PATHS.phucHo),
          this.loadGLB(ARHAT_GLB_PATHS.hangLong),
          this.loadGLB(ARHAT_GLB_PATHS.hoanHi),
          this.loadGLB(ARHAT_GLB_PATHS.phucHo2),
          this.loadGLB(ARHAT_GLB_PATHS.cuBat),
          this.loadGLB(ARHAT_GLB_PATHS.thacThap),
          this.loadGLB(ARHAT_GLB_PATHS.khaiTam),
          this.loadGLB(ARHAT_GLB_PATHS.tieuSu)
        ]);

        const arhatRoster = [
          { index: 0, title: 'Tọa Lộc La Hán', gltf: toaLocGltf, matKind: null },
          { index: 1, title: 'Khánh Hỷ La Hán', gltf: tieuSuGltf, matKind: null },
          { index: 2, title: 'Cử Bát La Hán', gltf: cuBatGltf, matKind: null },
          { index: 3, title: 'Hoan Hỉ La Hán', gltf: hoanHiGltf, matKind: 'jackfruit_wood' },
          { index: 4, title: 'Bố Đại La Hán', gltf: hoanHiGltf, matKind: 'antique_bronze' },
          { index: 5, title: 'Ba Tiêu La Hán', gltf: khaiTamGltf, matKind: null },
          { index: 6, title: 'Kỵ Tượng La Hán', gltf: kyTuongGltf, matKind: null },
          { index: 7, title: 'Tiếu Sư La Hán', gltf: tieuSuGltf, matKind: null },
          { index: 8, title: 'Thiền Định La Hán', gltf: thienDinhGltf, matKind: 'antique_bronze' },
          { index: 9, title: 'Trầm Tư La Hán', gltf: phucHo2Gltf, matKind: 'jackfruit_wood' },
          { index: 10, title: 'Thám Thủ La Hán', gltf: hangLongGltf, matKind: 'jackfruit_wood' },
          { index: 11, title: 'Khai Tâm La Hán', gltf: khaiTamGltf, matKind: null },
          { index: 12, title: 'Phục Hổ Tôn Giả', gltf: phucHo2Gltf, matKind: 'antique_bronze' },
          { index: 13, title: 'Thác Tháp La Hán', gltf: thacThapGltf, matKind: null },
          { index: 14, title: 'Khoái Nhĩ La Hán', gltf: cuBatGltf, matKind: null },
          { index: 15, title: 'Trường Mi La Hán', gltf: toaLocGltf, matKind: null },
          { index: 16, title: 'Hàng Long La Hán', gltf: hangLongGltf, matKind: 'antique_bronze' },
          { index: 17, title: 'Phục Hổ La Hán', gltf: phucHoGltf, matKind: null }
        ];
        const slots = this.arhatSlotSpecs || [];
        if (this.arhatGroups.length < 18) {
          for (let i = 0; i < Math.min(18, slots.length); i++) {
            const item = arhatRoster[i];
            const slot = slots[i];
            const srcScene = item.gltf?.scene || kyTuongGltf?.scene || cuBatGltf?.scene;
            if (!srcScene) continue;
            const matOverride = mats[item.matKind] || null;
            const statue = this.cleanStatueScene(srcScene, matOverride, true);
            const initialBounds = new THREE.Box3().setFromObject(statue);
            const height = Math.max(0.1, initialBounds.max.y - initialBounds.min.y);
            statue.scale.setScalar(1.78 / height);
            statue.rotation.y = slot.facing;
            const bounds = new THREE.Box3().setFromObject(statue);
            statue.position.set(
              slot.x - (bounds.min.x + bounds.max.x) / 2,
              slot.y - bounds.min.y,
              slot.z - (bounds.min.z + bounds.max.z) / 2
            );
            stripCastShadow(statue);
            statue.userData.arhatIndex = item.index;
            statue.userData.arhatTitle = item.title;
            this.interiorGroup.add(statue);
            this.arhatGroups.push(statue);
            this.registerInteriorObjectInZone?.(statue, 'west_chanh_dien');
            if (i % 2 === 1) await this._yieldInteriorFrame(delayMs);
          }
        }
        this._interiorZonesLoaded.west_chanh_dien = true;
      }

      if (
        this._interiorZonesLoaded.east_corridor &&
        this._interiorZonesLoaded.center_and_north &&
        this._interiorZonesLoaded.west_chanh_dien
      ) {
        this._interiorGLBsMounted = true;
      }
      this.updateSceneOcclusionCulling?.();
      this.renderFrame();
      return true;
    })();

    this._interiorZonePromises[zoneKey] = job;
    return job;
  },

  ensureInteriorAssetsLoaded(priorityZone = 'east_corridor') {
    this.ensureInteriorBuilt?.();
    const first =
      priorityZone === 'west_chanh_dien'
        ? 'west_chanh_dien'
        : priorityZone === 'center_and_north'
        ? 'center_and_north'
        : 'east_corridor';

    const p = this.ensureInteriorZoneLoaded(first).then(async () => {
      if (!this._interiorWorshippersSpawned) {
        this._interiorWorshippersSpawned = true;
        this.spawnInteriorWorshippersV8();
      }
      // Gently warm adjacent center courtyard + Tổ Đường right after entry zone completes
      if (!this._interiorZonesLoaded.center_and_north) {
        await this._yieldInteriorFrame(this.isSoftwareGl ? 120 : 60);
        if (this.inInterior) {
          this.ensureInteriorZoneLoaded('center_and_north').catch(() => {});
        }
      }
    });
    this._interiorLoadPromise = p;
    return p;
  },

  fitProp(sceneObj, targetSize) {
    const clone = sceneObj.clone(true);
    clone.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.geometry && !o.geometry.getAttribute('normal')) {
          o.geometry.computeVertexNormals();
        }
      }
    });
    const box = new THREE.Box3().setFromObject(clone);
    const sz = new THREE.Vector3();
    box.getSize(sz);
    const maxDim = Math.max(0.05, sz.x, sz.y, sz.z);
    clone.scale.setScalar(targetSize / maxDim);
    const box2 = new THREE.Box3().setFromObject(clone);
    clone.position.y = -box2.min.y;
    return clone;
  },

  placeLoaded3DPropsInWorld() {
    const fitProp = (sceneObj, targetSize) => this.fitProp(sceneObj, targetSize);

    // Upgrade courtyard pigeons with upright Meshy chim-bo-cau-3d.glb
    if (this.propMeshCache.chim_bo_cau && this.pigeons.length > 0) {
      const rawBox = new THREE.Box3().setFromObject(this.propMeshCache.chim_bo_cau);
      const rawSz = rawBox.getSize(new THREE.Vector3());
      const isFlatSheet = rawSz.z < rawSz.y * 0.25;
      for (const p of this.pigeons) {
        while (p.group.children.length > 0) p.group.remove(p.group.children[0]);
        const dove = fitProp(this.propMeshCache.chim_bo_cau, 0.36);
        dove.rotation.x = isFlatSheet ? -Math.PI / 2 : 0;
        const db = new THREE.Box3().setFromObject(dove);
        dove.position.set(-(db.min.x + db.max.x) / 2, -db.min.y, -(db.min.z + db.max.z) / 2);
        p.group.add(dove);
        p.wL = null;
        p.wR = null;
      }
    }

    // Interior sacred implements: Nhang Khoanh Đồng coils & Cặp Hạc Rùa Đồng on Tam Bảo
    if (this.propMeshCache.nhang_khoanh_dong && this.spiralIncenseAnchors?.length) {
      for (const anc of this.spiralIncenseAnchors) {
        while (anc.children.length > 0) anc.remove(anc.children[0]);
        const coil = fitProp(this.propMeshCache.nhang_khoanh_dong, 1.05);
        const cb = new THREE.Box3().setFromObject(coil);
        coil.position.set(-(cb.min.x + cb.max.x) / 2, -cb.max.y, -(cb.min.z + cb.max.z) / 2);
        anc.add(coil);
      }
    }
    if (this.propMeshCache.cap_hac_rua && this.craneTortoiseAnchor) {
      while (this.craneTortoiseAnchor.children.length > 0) {
        this.craneTortoiseAnchor.remove(this.craneTortoiseAnchor.children[0]);
      }
      for (const cx of [-2.8, 2.8]) {
        const crane = fitProp(this.propMeshCache.cap_hac_rua, 1.75);
        const cb = new THREE.Box3().setFromObject(crane);
        crane.position.set(cx - (cb.min.x + cb.max.x) / 2, -cb.min.y, -(cb.min.z + cb.max.z) / 2);
        crane.rotation.y = cx < 0 ? 0.16 : -0.16;
        this.craneTortoiseAnchor.add(crane);
      }
    }

    // Living Sala flowering tree beside Outdoor Arhat Plaza
    if (this.propMeshCache.cay_sala && this.outdoorArhatPlaza) {
      const sala = fitProp(this.propMeshCache.cay_sala, 5.8);
      sala.position.set(-4.2, 0, -4.6);
      this.outdoorArhatPlaza.add(sala);
    }

    // Place hexagonal lanterns at Chánh Điện porch & Shop Pavilion
    if (this.propMeshCache.den_long) {
      for (const lx of [19.8, 26.2]) {
        const l = fitProp(this.propMeshCache.den_long, 0.85);
        l.position.set(lx, 4.8, 6.6);
        this.exteriorGroup.add(l);
      }
      if (this.proceduralShopGroup) {
        for (const sx of [-1.85, 1.85]) {
          const l = fitProp(this.propMeshCache.den_long, 0.68);
          l.position.set(sx, 2.35, 1.65);
          this.proceduralShopGroup.add(l);
        }
      }
    }

    // Place lotus urns (chum_sanh_hoa_sen) beside Chánh Điện side stairs & Shop Pavilion
    if (this.propMeshCache.chum_sen) {
      for (const ux of [13.2, 32.8]) {
        const urn = fitProp(this.propMeshCache.chum_sen, 1.15);
        urn.position.set(ux, 0, 8.8);
        this.exteriorGroup.add(urn);
      }
      if (this.proceduralShopGroup) {
        const urn = fitProp(this.propMeshCache.chum_sen, 1.1);
        urn.position.set(2.85, 0, 1.5);
        this.proceduralShopGroup.add(urn);
      }
    }

    // Populate Marketplace stalls by category with real local GLB props
    for (let i = 0; i < this.stallAnchors.length; i++) {
      const stall = this.stallAnchors[i];
      const stype = stall.userData.stallType || 'thu_cong';

      if (stype === 'huong_hoa') {
        if (this.propMeshCache.ban_tho) {
          const bowl = fitProp(this.propMeshCache.ban_tho, 0.44);
          bowl.position.set(-1.15, 1.16, 0.56);
          stall.add(bowl);
          this.stallClickTargets.push(bowl);
        }
        if (this.propMeshCache.chum_sen) {
          const vase = fitProp(this.propMeshCache.chum_sen, 0.62);
          vase.position.set(-0.28, 1.16, 0.54);
          stall.add(vase);
          this.stallClickTargets.push(vase);
        }
        if (this.propMeshCache.mam_ngu_qua) {
          const fruit = fitProp(this.propMeshCache.mam_ngu_qua, 0.52);
          fruit.position.set(0.55, 1.16, 0.54);
          stall.add(fruit);
          this.stallClickTargets.push(fruit);
        }
        if (this.propMeshCache.nen_hoa_sen) {
          const lotusCandle = fitProp(this.propMeshCache.nen_hoa_sen, 0.34);
          lotusCandle.position.set(1.32, 1.16, 0.56);
          stall.add(lotusCandle);
          this.stallClickTargets.push(lotusCandle);
        }
        if (this.propMeshCache.den_hoa_dang) {
          const hd = fitProp(this.propMeshCache.den_hoa_dang, 0.42);
          hd.position.set(0.95, 1.56, -0.78);
          stall.add(hd);
        }
      } else if (stype === 'thu_cong') {
        if (this.propMeshCache.non_la) {
          for (const nx of [-1.25, -0.75]) {
            const hat = fitProp(this.propMeshCache.non_la, 0.48);
            hat.position.set(nx, 1.16, 0.56);
            stall.add(hat);
            this.stallClickTargets.push(hat);
          }
        }
        if (this.propMeshCache.quat_nan_la_dua) {
          for (const fx of [-0.05, 0.48]) {
            const fan = fitProp(this.propMeshCache.quat_nan_la_dua, 0.48);
            fan.position.set(fx, 1.16, 0.56);
            stall.add(fan);
            this.stallClickTargets.push(fan);
          }
        }
        if (this.propMeshCache.gio_may_tre) {
          const basket = fitProp(this.propMeshCache.gio_may_tre, 0.62);
          basket.position.set(i % 2 === 0 ? -1.45 : 1.45, 0.16, 1.18);
          stall.add(basket);
          this.stallClickTargets.push(basket);
          const basketTop = fitProp(this.propMeshCache.gio_may_tre, 0.5);
          basketTop.position.set(1.22, 1.16, 0.54);
          stall.add(basketTop);
          this.stallClickTargets.push(basketTop);
        }
      } else {
        if (this.propMeshCache.trai_dua_xiem) {
          for (const ox of [-1.35, -0.95, -0.55]) {
            const coco = fitProp(this.propMeshCache.trai_dua_xiem, 0.38);
            coco.position.set(ox, 1.16, 0.56);
            stall.add(coco);
            this.stallClickTargets.push(coco);
          }
        }
        if (this.propMeshCache.dia_banh_bo) {
          const bo = fitProp(this.propMeshCache.dia_banh_bo, 0.46);
          bo.position.set(0.22, 1.16, 0.56);
          stall.add(bo);
          this.stallClickTargets.push(bo);
        }
        if (this.propMeshCache.dia_banh_da_lon) {
          const dl = fitProp(this.propMeshCache.dia_banh_da_lon, 0.46);
          dl.position.set(1.05, 1.16, 0.56);
          stall.add(dl);
          this.stallClickTargets.push(dl);
        }
      }

      if (this.propMeshCache.den_long) {
        const lamp = fitProp(this.propMeshCache.den_long, 0.56);
        lamp.position.set(0, 2.22, 1.35);
        stall.add(lamp);
      }
    }

    // Place five-fruit tray (mam_ngu_qua), wooden fish (mo_go), and incense bowl (ban_tho) on Tam Bảo Altar
    if (this.propMeshCache.mam_ngu_qua && this.tamBaoAltarGroup) {
      const tray = fitProp(this.propMeshCache.mam_ngu_qua, 0.72);
      tray.position.set(-1.35, 1.26, 0.88);
      this.tamBaoAltarGroup.add(tray);
    }
    if (this.propMeshCache.mo_go && this.tamBaoAltarGroup) {
      const mogo = fitProp(this.propMeshCache.mo_go, 0.56);
      mogo.position.set(1.35, 1.26, 0.88);
      this.tamBaoAltarGroup.add(mogo);
    }
    if (this.propMeshCache.ban_tho && this.tamBaoAltarGroup) {
      const bowl = fitProp(this.propMeshCache.ban_tho, 0.7);
      bowl.position.set(0, 1.26, 0.96);
      this.tamBaoAltarGroup.add(bowl);
    }
  },

  initSmokeColumns() {
    const origins = [
      new THREE.Vector3(23.0, 1.32, 12.0),
      new THREE.Vector3(15.8, 1.15, 17.5),
      new THREE.Vector3(-24.5, 2.85, 17.2),
      new THREE.Vector3(34.5, 0.98, 22.5),
      new THREE.Vector3(-24.5, 0.98, -13.5)
    ];
    for (const orig of origins) {
      const sc = new SmokeColumn(orig, 42, 0.26, 3.4);
      this.exteriorGroup.add(sc.points);
      this.smokeColumns.push(sc);
    }
  }
};
