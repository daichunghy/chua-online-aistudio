/**
 * Cửa hàng 3D, lễ Phật/dâng hương/hoa/niệm Phật, sản phẩm & giỏ hàng.
 *
 * Mixin của ChuaOnlineApp: 12 method (build3DShopKiosk … openCartModal).
 * Được gắn vào class trong chua-online-app.mjs qua applyMixins().
 */
import { CHARACTER_PROFILES, SHOP_CATALOG, performSpiritualAction, filterShopCatalog, addToCart, updateCartQuantity, calculateCartSummary, validateOrderForm, recordDailyMissionMetric } from './shared.mjs';

export const shopAndRitualsMethods = {
  /* ========================================================================
     THREE.JS 3D PROCEDURAL BUILDERS (3D Shop Kiosk + 20 3D Items + 3 Rigged GLBs)
     ======================================================================== */
  build3DShopKiosk(THREE) {
    const kiosk = new THREE.Group();
    kiosk.name = 'kiosk_cua_hang_3d';

    const woodDark = new THREE.MeshStandardMaterial({ color: 0x6b3e1e, roughness: 0.65 });
    const woodWarm = new THREE.MeshStandardMaterial({ color: 0x9c5e2c, roughness: 0.55 });
    const tileTerracotta = new THREE.MeshStandardMaterial({ color: 0xc85a28, roughness: 0.5 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xe6b84c, roughness: 0.3, metalness: 0.65 });
    const pinkLanternMat = new THREE.MeshStandardMaterial({
      color: 0xf78fb3,
      roughness: 0.4,
      emissive: 0xff6b9d,
      emissiveIntensity: 0.45
    });

    // Base platform & wooden counter
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.9), woodDark);
    base.position.y = 0.04;
    kiosk.add(base);

    const counter = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.38, 0.48), woodWarm);
    counter.position.set(0, 0.25, 0.14);
    kiosk.add(counter);

    // 4 Timber Columns
    [
      [-0.62, 0.34],
      [0.62, 0.34],
      [-0.62, -0.32],
      [0.62, -0.32]
    ].forEach(([cx, cz]) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 1.05, 16), woodDark);
      col.position.set(cx, 0.56, cz);
      kiosk.add(col);
    });

    // Back display shelves with items & central Golden Buddha statue
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.68, 0.12), woodDark);
    backWall.position.set(0, 0.68, -0.28);
    kiosk.add(backWall);

    const buddha = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.26, 16), goldMat);
    buddha.position.set(0, 0.72, -0.18);
    kiosk.add(buddha);
    const buddhaHead = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 14), goldMat);
    buddhaHead.position.set(0, 0.88, -0.18);
    kiosk.add(buddhaHead);

    // Curved Terracotta Roof + Signboard "Cửa hàng lưu niệm"
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.18, 0.42, 4), tileTerracotta);
    roof.position.set(0, 1.28, 0);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.25, 1, 0.88);
    kiosk.add(roof);

    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.24, 0.05), woodDark);
    signBoard.position.set(0, 1.02, 0.36);
    kiosk.add(signBoard);

    // 2 Hanging Pink Lotus Lanterns on Left & Right
    [-0.52, 0.52].forEach((lx) => {
      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 12), pinkLanternMat);
      lantern.scale.set(1, 0.82, 1);
      lantern.position.set(lx, 0.92, 0.36);
      kiosk.add(lantern);
    });

    // Emerald Glazed Lotus Urn beside the kiosk
    const urn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.1, 0.26, 20),
      new THREE.MeshStandardMaterial({ color: 0x2b6e46, roughness: 0.25, metalness: 0.2 })
    );
    urn.position.set(0.82, 0.17, 0.22);
    kiosk.add(urn);

    return kiosk;
  },

  build3DItemMesh(THREE, itemId) {
    if (itemId === 'kiosk_cua_hang_3d' || itemId === 'mo_hinh_cua_hang_3d') {
      const k = this.build3DShopKiosk(THREE);
      k.scale.setScalar(0.55);
      return k;
    }

    const g = new THREE.Group();
    if (itemId === 'non_la_theu_sen') {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.24, 0.24, 32, 1, true),
        new THREE.MeshStandardMaterial({ color: 0xe8d9b5, roughness: 0.82, side: THREE.DoubleSide })
      );
      cone.position.y = 0.12;
      g.add(cone);
      const lotusDecal = new THREE.Mesh(
        new THREE.SphereGeometry(0.038, 12, 10),
        new THREE.MeshStandardMaterial({ color: 0xf48fb1, roughness: 0.5 })
      );
      lotusDecal.scale.set(1.2, 0.5, 1);
      lotusDecal.position.set(0, 0.12, 0.13);
      g.add(lotusDecal);
    } else if (itemId === 'trang_hat_bo_de' || itemId === 'trang_hat_go') {
      const beadMat = new THREE.MeshStandardMaterial({ color: 0x6b3a1e, roughness: 0.35 });
      const count = 36;
      for (let i = 0; i < count; i++) {
        const a = (2 * Math.PI * i) / count;
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), beadMat);
        b.position.set(0.18 * Math.cos(a), 0.18 + 0.18 * Math.sin(a), 0);
        g.add(b);
      }
      const tassel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.022, 0.12, 12),
        new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.8 })
      );
      tassel.position.set(0, -0.05, 0);
      g.add(tassel);
    } else if (itemId === 'so_tay_hoa_sen' || itemId === 'bo_kinh_phap_cu') {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 0.36, 0.045),
        new THREE.MeshStandardMaterial({ color: 0x9b2c2c, roughness: 0.6 })
      );
      book.position.y = 0.2;
      g.add(book);
      const goldBand = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, 0.365, 0.05),
        new THREE.MeshStandardMaterial({ color: 0xe6b84c, metalness: 0.6, roughness: 0.3 })
      );
      goldBand.position.set(0.09, 0.2, 0);
      g.add(goldBand);
      const lotus = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 14, 12),
        new THREE.MeshStandardMaterial({ color: 0xf78fb3, roughness: 0.4 })
      );
      lotus.scale.set(1.1, 0.9, 0.3);
      lotus.position.set(-0.01, 0.22, 0.025);
      g.add(lotus);
    } else if (itemId === 'hoa_sen_tuoi' || itemId === 'binh_gom_hoa_sen_3d') {
      const vase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.07, 0.22, 20),
        new THREE.MeshStandardMaterial({ color: 0x529471, roughness: 0.3 })
      );
      vase.position.y = 0.11;
      g.add(vase);
      const bud = new THREE.Mesh(
        new THREE.ConeGeometry(0.075, 0.16, 16),
        new THREE.MeshStandardMaterial({ color: 0xf48fb1, roughness: 0.45 })
      );
      bud.position.y = 0.3;
      g.add(bud);
    } else {
      // Ornate Golden Lotus Pedestal & Temple Relic
      const relic = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.18, 0.28, 24),
        new THREE.MeshStandardMaterial({ color: 0xd49b38, roughness: 0.35, metalness: 0.6 })
      );
      relic.position.y = 0.15;
      g.add(relic);
    }
    return g;
  },

  async loadRiggedCharacterGLB(THREE, charKey = 'nu') {
    const profile = CHARACTER_PROFILES.find((c) => c.key === charKey) || CHARACTER_PROFILES[0];
    try {
      const SkeletonUtils = await import('three/addons/utils/SkeletonUtils.js');
      let gltf = this.world3d?.charDataCache?.[charKey] || this.cachedGLBCharacters[charKey];
      if (!gltf?.scene) {
        const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
        const loader = new GLTFLoader();
        gltf = await loader.loadAsync(profile.glb);
        this.cachedGLBCharacters[charKey] = gltf;
      }
      const model = SkeletonUtils.clone(gltf.scene);
      let bbox = null;
      model.traverse((o) => {
        if (o.isMesh || o.isSkinnedMesh) {
          if (o.geometry) {
            if (!o.geometry.getAttribute('normal')) o.geometry.computeVertexNormals();
            o.geometry.computeBoundingBox();
            if (o.isSkinnedMesh && o.geometry.boundingBox) {
              if (!bbox) {
                bbox = o.geometry.boundingBox.clone();
              } else {
                bbox.union(o.geometry.boundingBox);
              }
            }
          }
          o.material = o.material
            ? o.material.clone()
            : new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
          if (o.geometry?.getAttribute('color')) o.material.vertexColors = true;
          o.material.metalness = 0.0;
          o.material.roughness = 0.86;
          o.frustumCulled = false;
        }
      });
      if (!bbox) bbox = new THREE.Box3().setFromObject(model);
      const h = profile.heightMeters || 1.62;
      const scale = (h * 0.72) / Math.max(0.2, bbox.max.y - bbox.min.y);
      model.scale.setScalar(scale);
      model.position.y = -bbox.min.y * scale - 0.34;
      return model;
    } catch {
      return null;
    }
  },

  /* ========================================================================
     4 SPIRITUAL ACTION MODALS & INTERACTIONS (Lễ Phật, Dâng hương, Dâng hoa, Niệm Phật)
     ======================================================================== */
  triggerLePhat(opts = {}) {
    const pos = this.world3d?.playerPos || this.playerPos;
    const nearOutdoorStatue =
      Math.hypot((pos?.x || 0) - 23.0, (pos?.z || 0) - 39.0) < 11.5 ||
      Math.hypot((pos?.x || 0) - -24.5, (pos?.z || 0) - 22.0) < 8.5 ||
      Math.hypot((pos?.x || 0) - 35.2, (pos?.z || 0) - 22.5) < 5.5 ||
      Math.hypot((pos?.x || 0) - -24.5, (pos?.z || 0) - -10.5) < 8.5;

    if (!opts.skipWalk && this.world3d && !this.world3d.insideInterior && !nearOutdoorStatue) {
      this.toggleInteriorHallIn3D(true, () => {
        this.world3d?.goToInteriorZone?.('chanh_dien');
        this.triggerLePhat({ skipWalk: true });
      });
      return;
    }

    const res = performSpiritualAction(this.spiritual, 'LE_PHAT');
    this.spiritual = res.state;
    this.grantPilgrimXp(10, 'Lễ Phật Tam Bái');
    this.saveState();
    this.updateActionBadges();
    this.world3d?.playPlayerBowAnimation();
    if (this.world3d?.insideInterior || !nearOutdoorStatue) {
      this.playChanhDienBellCadence({ force: true });
    } else {
      this.playBellTone(216, 3.0);
    }
    this.playVoiceAudio(res.audioFile);
    this.showToast(res.title, res.message, 5200, true);

    const charProf = CHARACTER_PROFILES.find((c) => c.key === this.characterModelKey) || CHARACTER_PROFILES[0];

    this.openModal(
      nearOutdoorStatue && !this.world3d?.insideInterior
        ? 'Chiêm bái & Lễ Phật tại Tôn Tượng'
        : 'Lễ Phật tại Chánh điện',
      `
      <div style="display:grid;grid-template-columns:220px 1fr;gap:18px;align-items:center;">
        <div style="background:#3E2413;color:#fff8ea;padding:16px;border-radius:20px;text-align:center;">
          <img src="${charProf.previewImg}" alt="${charProf.name}" style="width:124px;height:165px;object-fit:cover;border-radius:14px;border:2px solid rgba(255,215,140,0.45);margin-bottom:8px;" />
          <div style="font-size:15.5px;font-weight:700;color:#f6cd72;">${charProf.name}</div>
          <div style="font-size:13px;opacity:0.9;margin-top:3px;">Đã lễ: <strong>${this.spiritual.bowCount} lạy</strong></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div style="background:#fffdf8;border:1px solid rgba(150,110,60,0.25);padding:11px 15px;border-radius:14px;">
            <strong style="color:#5C381F;">Lạy thứ nhất — Kính lễ Phật:</strong>
            <p style="font-size:13.5px;color:#4a2f18;margin-top:3px;">Nhớ ơn Đức Phật, bậc thầy sáng suốt chỉ lối sống hiền lành và tỉnh thức.</p>
          </div>
          <div style="background:#fffdf8;border:1px solid rgba(150,110,60,0.25);padding:11px 15px;border-radius:14px;">
            <strong style="color:#5C381F;">Lạy thứ hai — Kính lễ Pháp:</strong>
            <p style="font-size:13.5px;color:#4a2f18;margin-top:3px;">Nương theo lời Phật dạy để giữ lòng yên ổn và bớt phiền muộn.</p>
          </div>
          <div style="background:#fffdf8;border:1px solid rgba(150,110,60,0.25);padding:11px 15px;border-radius:14px;">
            <strong style="color:#5C381F;">Lạy thứ ba — Kính lễ Tăng:</strong>
            <p style="font-size:13.5px;color:#4a2f18;margin-top:3px;">Quý trọng chư Tăng Ni và những người cùng giữ nếp sống thiện lành.</p>
          </div>
          <div style="display:flex;gap:10px;margin-top:4px;flex-wrap:wrap;">
            <button id="btn-bow-again" class="product-detail-btn" style="flex:1;">Lạy thêm 3 lạy</button>
            <button id="btn-open-arhats-from-bow" class="product-detail-btn" style="flex:1;background:#784820;">${this.world3d?.insideInterior ? 'Ngắm 18 vị La Hán' : 'Vào Chánh điện'}</button>
            <button id="btn-open-ugc-from-bow" class="product-detail-btn" style="flex:1.2;background:linear-gradient(180deg,#d96b27 0%,#9e3810 100%);">Lưu ảnh kỷ niệm</button>
          </div>
        </div>
      </div>
      `
    );

    document.getElementById('btn-bow-again')?.addEventListener('click', () => {
      this.triggerLePhat({ skipWalk: true });
    });
    document.getElementById('btn-open-arhats-from-bow')?.addEventListener('click', () => {
      if (this.world3d?.insideInterior) {
        this.openExploreModal('arhats');
      } else {
        this.closeModal();
        this.toggleInteriorHallIn3D(true);
      }
    });
    document.getElementById('btn-open-ugc-from-bow')?.addEventListener('click', () => {
      this.openUGCStudioModal();
    });
  },

  triggerDangHuong() {
    const res = performSpiritualAction(this.spiritual, 'DANG_HUONG_STEP');
    this.spiritual = res.state;
    this.saveState();
    this.updateActionBadges();
    this.world3d?.setIncenseBoost(true);
    this.playBellTone(288, 2.0);
    this.playVoiceAudio('s2_thap_nhang.mp3');
    this.renderDangHuongModal();
  },

  renderDangHuongModal() {
    const step = this.spiritual.incenseStep || 1;
    const steps = [
      { n: 1, title: 'Xin 3 nén tâm hương', desc: 'Hương Giới — Hương Định — Hương Tuệ (không thắp quá nhiều gây khói ngạt).' },
      { n: 2, title: 'Châm lửa & Phẩy nhẹ bằng tay', desc: 'Dùng bàn tay phẩy nhẹ cho tắt ngọn lửa, tuyệt đối không dùng miệng thổi.' },
      { n: 3, title: 'Nâng hương ngang trán khấn nguyện', desc: 'Chắp tay nâng hương ngang mày, gửi tâm từ bi cầu quốc thái dân an, gia đạo bình yên.' },
      { n: 4, title: 'Cắm hương ngay ngắn vào lư đồng', desc: 'Cắm ba nén hương thẳng đứng vào lư hương sân Chánh điện và xá 3 xá.' }
    ];

    this.openModal(
      'Dâng hương trước Chánh điện',
      `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
          ${steps
            .map(
              (s) => `
            <div style="padding:12px;border-radius:16px;border:2px solid ${
              s.n <= step ? '#5C381F' : 'rgba(140,100,60,0.25)'
            };background:${s.n === step ? '#F6E9D2' : '#fffdf8'};">
              <div style="font-size:13px;font-weight:700;color:${s.n <= step ? '#5C381F' : '#7a5838'};">Bước ${s.n}/4</div>
              <div style="font-size:15px;font-weight:800;margin:4px 0;">${s.title}</div>
              <div style="font-size:13px;color:#52361c;line-height:1.4;">${s.desc}</div>
            </div>
          `
            )
            .join('')}
        </div>

        <div style="background:#3E2413;color:#fff8ea;padding:16px 20px;border-radius:18px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">
          <div>
            <div style="font-size:16px;font-weight:700;color:#f6cd72;">Đã dâng hương ${this.spiritual.incenseOfferings} lần</div>
            <div style="font-size:14px;opacity:0.92;margin-top:3px;">Làn khói nhang trầm đang bay nhẹ trước sân chùa.</div>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button id="btn-incense-next-step" class="product-detail-btn" style="width:auto;padding:0 22px;background:#d96d38;">
              ${step < 4 ? `Sang bước ${step + 1}/4` : 'Dâng lại từ đầu'}
            </button>
            <button id="btn-incense-complete-now" class="product-detail-btn" style="width:auto;padding:0 20px;">
              Cắm hương ngay
            </button>
            <button id="btn-open-ugc-from-incense" class="product-detail-btn" style="width:auto;padding:0 18px;background:#8c4b1e;">
              Lưu ảnh kỷ niệm
            </button>
          </div>
        </div>
      </div>
      `
    );

    document.getElementById('btn-incense-next-step')?.addEventListener('click', () => {
      const r = performSpiritualAction(this.spiritual, 'DANG_HUONG_STEP');
      this.spiritual = r.state;
      if ((this.spiritual.incenseStep || 1) >= 4) {
        this.activityHub = recordDailyMissionMetric(this.activityHub, 'dailyIncense', 1);
      }
      this.saveState();
      this.updateActionBadges();
      this.world3d?.setIncenseBoost(true);
      this.playBellTone(288, 1.8);
      this.renderDangHuongModal();
    });

    document.getElementById('btn-incense-complete-now')?.addEventListener('click', () => {
      const r = performSpiritualAction(this.spiritual, 'DANG_HUONG_COMPLETE');
      this.spiritual = r.state;
      this.activityHub = recordDailyMissionMetric(this.activityHub, 'dailyIncense', 1);
      this.saveState();
      this.updateActionBadges();
      this.world3d?.setIncenseBoost(true);
      this.playBellTone(216, 2.8);
      this.closeModal();
      this.showToast(r.title, r.message, 5200, true);
    });

    document.getElementById('btn-open-ugc-from-incense')?.addEventListener('click', () => {
      const r = performSpiritualAction(this.spiritual, 'DANG_HUONG_COMPLETE');
      this.spiritual = r.state;
      this.activityHub = recordDailyMissionMetric(this.activityHub, 'dailyIncense', 1);
      this.saveState();
      this.updateActionBadges();
      this.openUGCStudioModal();
    });
  },

  triggerDangHoa() {
    const res = performSpiritualAction(this.spiritual, 'DANG_HOA');
    this.spiritual = res.state;
    this.activityHub = recordDailyMissionMetric(this.activityHub, 'dailyLotus', 1);
    this.grantPilgrimXp(10, 'Dâng hoa sen');
    this.saveState();
    this.updateActionBadges();
    this.updateEquippedTags();
    this.world3d?.placeLotusOfferingIn3D();
    this.playBellTone(324, 2.4);
    this.playVoiceAudio(res.audioFile);
    this.showToast(
      res.title,
      `${res.message} Đóa sen trong hồ nước đang khẽ hé nở và tỏa ánh sáng vàng hồng ấm áp.`,
      5500,
      true
    );

    this.openModal(
      'Dâng hoa sen & Gửi lời cầu nguyện',
      `
      <div style="display:grid;grid-template-columns:220px 1fr;gap:18px;align-items:center;">
        <div style="background:#fffdf8;border:1.5px solid rgba(150,110,60,0.28);border-radius:20px;padding:14px;text-align:center;">
          <img src="/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_chum_sanh_hoa_sen.png" alt="Chum sành hoa sen" style="width:100%;height:165px;object-fit:contain;border-radius:12px;" />
          <div style="font-weight:700;color:#5C381F;margin-top:8px;">Đã dâng: ${this.spiritual.lotusOfferings} bình hoa</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <p style="font-size:15px;line-height:1.5;color:#3d2410;">
            Chọn một lời cầu nguyện bình an để gửi cùng đóa hoa sen dâng lên Phật đài:
          </p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            ${[
              'Cầu cho cha mẹ khỏe mạnh, sống lâu bên con cháu',
              'Cầu cho gia đình hòa thuận, con cháu học hành chăm ngoan',
              'Cầu cho công việc thuận lợi, gặp nhiều người tốt',
              'Cầu cho mọi người đều được bình an, bớt lo âu'
            ]
              .map(
                (wish, idx) => `
              <button class="wish-choice-btn" data-wish="${wish}" style="padding:11px 14px;border-radius:14px;border:1.5px solid rgba(92,56,31,0.35);background:${
                idx === 0 ? '#F6E9D2' : '#fffdf8'
              };color:#3E2413;font-size:13.5px;font-weight:700;text-align:left;cursor:pointer;">
                ${wish}
              </button>
            `
              )
              .join('')}
          </div>
          <div style="display:flex;gap:10px;margin-top:6px;flex-wrap:wrap;">
            <input id="custom-prayer-input" type="text" placeholder="Hoặc viết lời cầu nguyện riêng của bạn..." style="flex:1;min-width:220px;padding:11px 14px;border-radius:12px;border:1.5px solid rgba(140,100,60,0.35);font-size:14px;" />
            <button id="btn-submit-prayer" class="product-detail-btn" style="width:auto;padding:0 22px;">Gửi lời cầu nguyện</button>
            <button id="btn-open-ugc-from-flower" class="product-detail-btn" style="width:auto;padding:0 18px;background:linear-gradient(180deg,#d96b27 0%,#9e3810 100%);">Lưu ảnh kỷ niệm</button>
          </div>
        </div>
      </div>
      `
    );

    document.querySelectorAll('.wish-choice-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const w = btn.getAttribute('data-wish');
        const inp = document.getElementById('custom-prayer-input');
        if (inp && w) inp.value = w;
      });
    });

    document.getElementById('btn-submit-prayer')?.addEventListener('click', () => {
      const inp = document.getElementById('custom-prayer-input');
      const text = (inp?.value || 'Nguyện cầu bình an và trí tuệ cho gia quyến').trim();
      this.spiritual.prayers.unshift({ text, time: new Date().toLocaleDateString('vi-VN') });
      this.saveState();
      this.playBellTone(324, 2.5);
      this.closeModal();
      this.showToast('🪷 Đã dâng hoa & lời nguyện', `"${text}"`, 5000, true);
    });

    document.getElementById('btn-open-ugc-from-flower')?.addEventListener('click', () => {
      this.openUGCStudioModal();
    });
  },

  triggerNiemPhat() {
    this.playMokugyoTap();
    this.renderNiemPhatModal();
  },

  renderNiemPhatModal() {
    const chants = [
      'Nam Mô A Di Đà Phật',
      'Nam Mô Quán Thế Âm Bồ Tát',
      'Nam Mô Bổn Sư Thích Ca Mâu Ni Phật',
      'Án Ma Ni Bát Di Hồng'
    ];
    const eqMala = this.storeProfile?.equipped?.mala || 'trang_hat_bo_de_108_store';
    const isTram = String(eqMala).includes('tram');
    const woodDark = isTram ? '#3E2212' : '#7D4E28';
    const woodLight = isTram ? '#6B3E23' : '#A9713E';
    const woodDone = '#C9962E';

    const curBeads = this.spiritual.malaBeads || 0;
    const totalShownBeads = 54;
    const activeBeadPos = curBeads % totalShownBeads;
    const cx = 132;
    const cy = 122;
    const rad = 98;
    const beadsSvg = Array.from({ length: totalShownBeads }, (_, i) => {
      const angle = ((i + 0.5) / totalShownBeads) * Math.PI * 2 + Math.PI / 2;
      const bx = (cx + Math.cos(angle) * rad).toFixed(1);
      const by = (cy + Math.sin(angle) * rad).toFixed(1);
      const isActive = i === activeBeadPos;
      const isPassed = i < activeBeadPos;
      const isDivider = i === 13 || i === 27 || i === 40;
      const rBead = isActive ? 7.4 : isDivider ? 6.2 : 5.0;
      const fill = isActive ? '#FFE082' : isPassed ? woodDone : isDivider ? '#8C5327' : woodLight;
      const stroke = isActive ? '#B84518' : woodDark;
      return `<circle cx="${bx}" cy="${by}" r="${rBead}" fill="${fill}" stroke="${stroke}" stroke-width="${isActive ? 2.2 : 1.1}"/>`;
    }).join('');

    const fmtSec = (sec) => {
      const m = Math.floor(Math.max(0, sec) / 60);
      const s = Math.floor(Math.max(0, sec) % 60);
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };
    const dailyMindfulSec = this.activityHub?.dailyMetrics?.dailyMindfulSeconds || 0;
    const mindfulPct = Math.min(100, Math.round((dailyMindfulSec / 300) * 100));

    this.openModal(
      'Niệm Phật · Lần Tràng Hạt 108 & Thiền 5 Phút',
      `
      <div class="mala-modal-grid">
        <div class="mala-real-stage">
          <div class="mala-wood-tag">
            ${isTram ? '🟤 Tràng hạt Trầm Hương 108' : '📿 Tràng hạt gỗ Bồ Đề 108'}
          </div>
          <div class="mala-svg-wrap" id="btn-pull-bead" role="button" tabindex="0" title="Chạm lần từng hạt chuỗi">
            <svg viewBox="0 0 264 268" width="250" height="254" class="mala-svg-ring">
              <circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="#8C6239" stroke-width="2.2" stroke-dasharray="3 2"/>
              ${beadsSvg}
              <!-- Guru Bead (Hạt Cái) + Crimson Silk Tassel at bottom 6 o'clock -->
              <circle cx="${cx}" cy="${cy + rad + 2}" r="9.5" fill="#8C5327" stroke="#FFD875" stroke-width="2.2"/>
              <path d="M ${cx - 4} ${cy + rad + 12} L ${cx - 11} ${cy + rad + 42} L ${cx} ${cy + rad + 38} L ${cx + 11} ${cy + rad + 42} L ${cx + 4} ${cy + rad + 12} Z" fill="#B82925" stroke="#7E1714" stroke-width="1.2"/>
              <path d="M ${cx} ${cy + rad + 12} L ${cx} ${cy + rad + 41}" stroke="#F6CD72" stroke-width="1.4"/>
            </svg>
            <div class="mala-center-readout">
              <span class="mala-big-num" id="mala-bead-num">${curBeads}/108</span>
              <span class="mala-tap-hint">👆 Chạm lần hạt</span>
              <span class="mala-cycles-lbl">Đủ ${this.spiritual.malaCycles} vòng</span>
            </div>
          </div>

          <div class="mala-actions-row">
            <button id="btn-strike-bell" class="product-detail-btn" style="flex:1;min-height:44px;font-size:14px;background:#8c4b1e;">🔔 Thỉnh chuông</button>
            <button id="btn-auto-108" class="product-detail-btn" style="flex:1;min-height:44px;font-size:14px;background:#5C381F;">📿 Lần 10 hạt</button>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:12px;">
          <div class="mindfulness-timer-card">
            <div class="mindful-head">
              <div>
                <div class="mindful-title">🧘 Thực hành Chánh Niệm 5 Phút mỗi ngày</div>
                <div class="mindful-sub">Hôm nay: <strong id="mindful-daily-sec">${Math.floor(dailyMindfulSec / 60)} phút ${dailyMindfulSec % 60} giây</strong> / 5 phút (${mindfulPct}%)</div>
              </div>
              <div class="mindful-clock" id="mindful-clock-display">${fmtSec(this.mindfulnessTimer.remainingSec)}</div>
            </div>
            <div class="quest-progress-track" style="margin:6px 0 8px;">
              <div class="quest-progress-fill" id="mindful-progress-bar" style="width:${mindfulPct}%"></div>
            </div>
            <div class="mindful-breath-cue" id="mindful-breath-cue">
              Hít vào nhẹ nhàng trong 4 nhịp · Thở ra thư thả buông lo âu.
            </div>
            <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
              <button type="button" id="btn-mindful-toggle" class="quest-claim-btn" style="flex:1;min-height:44px;font-size:14px;">
                ${this.mindfulnessTimer.running ? '⏸ Tạm dừng thiền' : this.mindfulnessTimer.remainingSec < 300 && this.mindfulnessTimer.remainingSec > 0 ? '▶ Tiếp tục thiền 5 phút' : '🧘 Bắt đầu thiền 5 phút'}
              </button>
              <button type="button" id="btn-mindful-reset" class="quest-go-btn" style="min-height:44px;padding:0 16px;">↺ Đặt lại</button>
            </div>
          </div>

          <div>
            <div style="font-size:14px;font-weight:800;color:#5c3a1d;margin-bottom:6px;">Chọn câu niệm Phật:</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              ${chants
                .map(
                  (c) => `
                <button class="chant-select-btn" data-chant="${c}" style="min-height:44px;padding:9px 12px;border-radius:12px;border:1.5px solid ${
                    this.spiritual.activeChant === c ? '#5C381F' : 'rgba(130,90,50,0.28)'
                  };background:${
                    this.spiritual.activeChant === c ? '#5C381F' : '#fffdf8'
                  };color:${this.spiritual.activeChant === c ? '#fff' : '#241409'};font-weight:700;font-size:13.5px;cursor:pointer;">
                  ${c}
                </button>
              `
                )
                .join('')}
            </div>
          </div>

          <div style="background:#fffdf8;border:1px solid rgba(150,110,60,0.25);padding:12px 15px;border-radius:14px;">
            <div style="font-size:14.5px;font-weight:800;color:#5C381F;margin-bottom:4px;">Lời kệ niệm Phật</div>
            <p style="font-size:13.5px;line-height:1.5;color:#4a2f18;">
              "A Di Đà Phật thân sắc vàng, tướng tốt không gì sánh ngang. Hào quang chiếu khắp mười phương cõi, nhiếp thụ chúng sanh niệm danh Ngài."
            </p>
          </div>

          <button id="btn-play-chant-audio" class="product-detail-btn" style="width:100%;min-height:44px;background:#6e3c16;">
            🔊 Nghe tiếng niệm Phật &amp; chuông mõ đạo tràng
          </button>
        </div>
      </div>
      `
    );

    const stopMindfulLoop = () => {
      if (this.mindfulnessTimer.intervalId) {
        clearInterval(this.mindfulnessTimer.intervalId);
        this.mindfulnessTimer.intervalId = null;
      }
      this.mindfulnessTimer.running = false;
    };

    const startMindfulLoop = () => {
      stopMindfulLoop();
      this.mindfulnessTimer.running = true;
      if (this.mindfulnessTimer.remainingSec <= 0) {
        this.mindfulnessTimer.remainingSec = 300;
      }
      this.playBellTone(216, 2.2);
      this.mindfulnessTimer.intervalId = setInterval(() => {
        if (!document.getElementById('mindful-clock-display')) {
          stopMindfulLoop();
          return;
        }
        this.mindfulnessTimer.remainingSec = Math.max(0, this.mindfulnessTimer.remainingSec - 1);
        this.activityHub = recordDailyMissionMetric(this.activityHub, 'dailyMindfulSeconds', 1);
        const curSec = this.activityHub?.dailyMetrics?.dailyMindfulSeconds || 0;
        const pct = Math.min(100, Math.round((curSec / 300) * 100));

        const clk = document.getElementById('mindful-clock-display');
        if (clk) clk.textContent = fmtSec(this.mindfulnessTimer.remainingSec);
        const secEl = document.getElementById('mindful-daily-sec');
        if (secEl) secEl.textContent = `${Math.floor(curSec / 60)} phút ${curSec % 60} giây`;
        const barEl = document.getElementById('mindful-progress-bar');
        if (barEl) barEl.style.width = `${pct}%`;
        const cueEl = document.getElementById('mindful-breath-cue');
        if (cueEl) {
          const phase = this.mindfulnessTimer.remainingSec % 8;
          cueEl.textContent = phase >= 4
            ? '🌬️ Hít vào thật sâu, cảm nhận hơi thở an lành đang vào...'
            : '🍃 Thở ra chậm rãi, buông nhẹ mọi muộn phiền...';
        }
        if (this.mindfulnessTimer.remainingSec > 0 && this.mindfulnessTimer.remainingSec % 60 === 0) {
          this.playBellTone(260, 2.0);
        }
        if (this.mindfulnessTimer.remainingSec <= 0) {
          stopMindfulLoop();
          this.saveState();
          this.updateActivityHubBadge();
          this.playBellTone(216, 3.6);
          const tog = document.getElementById('btn-mindful-toggle');
          if (tog) tog.textContent = '✓ Hoàn thành 5 phút Chánh Niệm!';
          this.showToast('🧘 Viên mãn 5 phút Chánh Niệm', 'Cô bác có thể mở Hành trình → Nhiệm vụ để nhận lộc công đức hôm nay!', 4600, false);
        } else if (curSec % 5 === 0) {
          this.saveState();
          this.updateActivityHubBadge();
        }
      }, 1000);
    };

    document.getElementById('btn-mindful-toggle')?.addEventListener('click', () => {
      if (this.mindfulnessTimer.running) {
        stopMindfulLoop();
        this.saveState();
        this.renderNiemPhatModal();
      } else {
        startMindfulLoop();
        const tog = document.getElementById('btn-mindful-toggle');
        if (tog) tog.textContent = '⏸ Tạm dừng thiền';
      }
    });

    document.getElementById('btn-mindful-reset')?.addEventListener('click', () => {
      stopMindfulLoop();
      this.mindfulnessTimer.remainingSec = 300;
      this.renderNiemPhatModal();
    });

    const pullBead = (count) => {
      const r = performSpiritualAction(this.spiritual, 'NIEM_PHAT_BEAD', { count });
      this.spiritual = r.state;
      this.activityHub = recordDailyMissionMetric(this.activityHub, 'dailyBeads', count);
      if (count >= 10 || this.spiritual.malaBeads === 0) {
        this.grantPilgrimXp(8, 'Niệm Phật Tràng Hạt');
      }
      this.saveState();
      this.updateActionBadges();
      this.playMokugyoTap();
      if (this.spiritual.malaBeads === 0 || this.spiritual.malaBeads % 27 === 0 || count >= 10) {
        this.playBellTone(216, 2.4);
      }
      this.renderNiemPhatModal();
    };

    document.getElementById('btn-pull-bead')?.addEventListener('click', () => pullBead(1));
    document.getElementById('btn-auto-108')?.addEventListener('click', () => pullBead(10));

    document.getElementById('btn-strike-bell')?.addEventListener('click', () => {
      const r = performSpiritualAction(this.spiritual, 'RING_BELL');
      this.spiritual = r.state;
      this.saveState();
      this.playBellTone(196, 3.4);
    });

    document.querySelectorAll('.chant-select-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const chant = btn.getAttribute('data-chant');
        if (chant) {
          this.spiritual.activeChant = chant;
          this.saveState();
          this.renderNiemPhatModal();
        }
      });
    });

    document.getElementById('btn-play-chant-audio')?.addEventListener('click', () => {
      if (this.audioPlaying) {
        this.pauseVoiceAudio();
      } else {
        this.playVoiceAudio('niem_phat_xa.mp3');
      }
    });
  },

  /* ========================================================================
     CỬA HÀNG LƯU NIỆM & VẬT PHẨM 3D RENDERING (Reference Image 2)
     ======================================================================== */
  renderShopProducts() {
    const grid = document.getElementById('shop-products-grid');
    if (!grid) return;

    document.querySelectorAll('.shop-tab-pill').forEach((tabBtn) => {
      tabBtn.classList.toggle('active', tabBtn.getAttribute('data-shop-tab') === this.shopTab);
    });

    const items = filterShopCatalog(this.shopTab);
    grid.innerHTML = items
      .map((item) => {
        const thumbHTML = item.cropStyle
          ? `<div class="product-thumb-crop" style="background-image:url('${item.cropStyle.bgImage}');background-size:${item.cropStyle.bgSize};background-position:${item.cropStyle.bgPos};"></div>`
          : `<img class="product-thumb-img" src="${item.image}" alt="${item.name}" />`;

        return `
        <article class="shop-product-card" data-product-id="${item.id}">
          <div class="product-thumb-box">
            ${thumbHTML}
            <span class="product-price-tag">${item.price.toLocaleString('vi-VN')}đ</span>
          </div>
          <h2 class="product-card-title">${item.name}</h2>
          <div class="product-delivery-row">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="4" width="15" height="12" rx="1"/>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            <span>${item.deliveryText}</span>
          </div>
          <button class="product-detail-btn" data-detail-id="${item.id}">Xem chi tiết</button>
        </article>
      `;
      })
      .join('');

    grid.querySelectorAll('[data-detail-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-detail-id');
        if (id) this.openProductDetailModal(id);
      });
    });

    this.updateActionBadges();
  },

  openProductDetailModal(productId, previewCharKey = null) {
    const item = SHOP_CATALOG.find((p) => p.id === productId);
    if (!item) return;

    const activeChar = previewCharKey || this.characterModelKey;
    const isEquipped = Object.values(this.spiritual.equippedItems).includes(item.id);

    this.openModal(
      `${item.name} — Xem 3D & Thử lên nhân vật`,
      `
      <div style="display:grid;grid-template-columns:1.1fr 1fr;gap:20px;align-items:start;">
        <div>
          <div class="viewer3d-stage" id="product-3d-stage" style="height:300px;">
            <canvas class="viewer3d-canvas" id="product-3d-canvas"></canvas>
            <div style="position:absolute;top:8px;left:10px;display:flex;gap:6px;">
              ${CHARACTER_PROFILES.map(
                (c) => `
                <button class="tryon-char-btn" data-char="${c.key}" style="padding:4px 10px;border-radius:999px;border:1px solid #5C381F;background:${
                  activeChar === c.key ? '#5C381F' : 'rgba(255,255,255,0.92)'
                };color:${
                  activeChar === c.key ? '#fff' : '#5C381F'
                };font-size:11.5px;font-weight:700;cursor:pointer;">
                  Thử: ${c.name.split('(')[0].trim()}
                </button>
              `
              ).join('')}
            </div>
            <div style="position:absolute;bottom:8px;left:10px;right:10px;display:flex;justify-content:space-between;align-items:center;pointer-events:none;">
              <span style="background:rgba(71,41,21,0.9);color:#fff;font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:999px;">
                Kéo để xoay xem các mặt
              </span>
              <span style="background:rgba(90,52,20,0.88);color:#ffe9c2;font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:999px;">
                ${item.price.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:10px;">
            <button id="btn-equip-3d-item" class="product-detail-btn" style="flex:1;height:42px;font-size:14px;background:${
              isEquipped ? '#8a3918' : '#5C381F'
            };">
              ${isEquipped ? '✓ Đang mang trên người' : 'Mang thử lên nhân vật'}
            </button>
            <a href="${item.zip}" download style="display:inline-flex;align-items:center;justify-content:center;padding:0 14px;height:42px;border-radius:999px;background:#f0dbc0;color:#4e3016;font-size:13px;font-weight:700;text-decoration:none;">
              Tải mẫu 3D (.zip)
            </a>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;">
          <div style="font-size:22px;font-weight:800;color:#472915;">${item.name}</div>
          <div style="font-size:14.5px;color:#5b3b1e;font-weight:600;">${item.subtitle}</div>
          <div style="font-size:20px;font-weight:800;color:#b84518;">${item.price.toLocaleString('vi-VN')} VNĐ <span style="font-size:13px;font-weight:600;color:#5C381F;">(Giao tận nhà toàn quốc)</span></div>

          <div style="background:#fffdf8;border:1px solid rgba(150,110,60,0.25);border-radius:14px;padding:12px 14px;font-size:13.5px;line-height:1.5;">
            <div><strong>Kích thước:</strong> ${item.dimensions}</div>
            <div style="margin-top:4px;"><strong>Chất liệu:</strong> ${item.material}</div>
            <div style="margin-top:6px;color:#3d2410;"><strong>Ý nghĩa:</strong> ${item.meaning}</div>
          </div>

          <div style="display:flex;gap:10px;margin-top:6px;">
            <button id="btn-add-to-cart-modal" class="shop-cart-cta" style="margin:0;height:48px;font-size:17px;">
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
      `
    );

    this.mountInteractive3DStage('product-3d-canvas', {
      item,
      charKey: previewCharKey
    });

    document.querySelectorAll('.tryon-char-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ck = btn.getAttribute('data-char') || 'nu';
        this.characterModelKey = ck;
        this.saveState();
        this.updateEquippedTags();
        this.openProductDetailModal(productId, ck);
      });
    });

    document.getElementById('btn-equip-3d-item')?.addEventListener('click', () => {
      const r = performSpiritualAction(this.spiritual, 'EQUIP_ITEM', {
        slot: item.equipSlot || 'hand',
        itemKey: item.id
      });
      this.spiritual = r.state;
      this.saveState();
      this.syncStoreVisualsTo3D();
      this.updateEquippedTags();
      this.playBellTone(320, 1.5);
      this.openProductDetailModal(productId, activeChar);
      this.showToast('✨ Đã cập nhật vật phẩm 3D', `Đã gắn "${item.name}" lên nhân vật Phật tử.`, 3600);
    });

    document.getElementById('btn-add-to-cart-modal')?.addEventListener('click', () => {
      this.cart = addToCart(this.cart, item.id, 1);
      this.saveState();
      this.updateActionBadges();
      this.closeModal();
      this.openCartModal();
    });
  },

  openCartModal() {
    const summary = calculateCartSummary(this.cart);

    this.openModal(
      'Giỏ hàng lưu niệm',
      `
      <div style="display:grid;grid-template-columns:1.1fr 1fr;gap:20px;align-items:start;">
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div style="font-size:16px;font-weight:800;color:#472915;">Vật phẩm đã chọn (${summary.totalCount})</div>
          ${
            this.cart.length === 0
              ? `<div style="padding:24px;background:#fffdf8;border-radius:16px;text-align:center;color:#6b4a2b;">Giỏ hàng đang trống. Mời bạn chọn món quà lưu niệm tại cửa hàng.</div>`
              : this.cart
                  .map(
                    (c) => `
                <div style="display:flex;align-items:center;justify-content:space-between;background:#fffdf8;border:1px solid rgba(150,110,60,0.25);padding:10px 14px;border-radius:14px;gap:10px;">
                  <div>
                    <div style="font-weight:800;font-size:15px;">${c.name}</div>
                    <div style="font-size:13px;color:#7a4e25;">${c.price.toLocaleString('vi-VN')}đ × ${c.qty}</div>
                  </div>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <button class="cart-qty-btn" data-id="${c.id}" data-delta="-1" style="width:28px;height:28px;border-radius:8px;border:1px solid #8a623c;background:#f5e6cf;cursor:pointer;font-weight:800;">-</button>
                    <span style="min-width:22px;text-align:center;font-weight:800;">${c.qty}</span>
                    <button class="cart-qty-btn" data-id="${c.id}" data-delta="1" style="width:28px;height:28px;border-radius:8px;border:1px solid #8a623c;background:#f5e6cf;cursor:pointer;font-weight:800;">+</button>
                  </div>
                </div>
              `
                  )
                  .join('')
          }

          <div style="background:#f3e3c9;padding:12px 16px;border-radius:14px;font-size:14px;">
            <div style="display:flex;justify-content:space-between;"><span>Tạm tính:</span><strong>${summary.subtotal.toLocaleString('vi-VN')}đ</strong></div>
            <div style="display:flex;justify-content:space-between;margin-top:4px;"><span>Phí giao hàng (Miễn phí đơn từ 300k):</span><strong>${summary.shippingFee.toLocaleString('vi-VN')}đ</strong></div>
            <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:17px;color:#a53b16;"><span>Tổng cộng:</span><strong>${summary.grandTotal.toLocaleString('vi-VN')}đ</strong></div>
          </div>
        </div>

        <form id="checkout-order-form" style="background:#fffdf8;border:1px solid rgba(150,110,60,0.28);padding:16px;border-radius:18px;display:flex;flex-direction:column;gap:10px;">
          <div style="font-size:16px;font-weight:800;color:#472915;">Thông tin nhận quà</div>
          <input id="order-name" type="text" placeholder="Họ và tên người nhận *" required style="padding:10px 12px;border-radius:10px;border:1px solid #bfa07a;font-size:14px;" />
          <input id="order-phone" type="tel" placeholder="Số điện thoại liên hệ (VD: 0912345678) *" required style="padding:10px 12px;border-radius:10px;border:1px solid #bfa07a;font-size:14px;" />
          <textarea id="order-address" rows="2" placeholder="Địa chỉ nhận hàng *" required style="padding:10px 12px;border-radius:10px;border:1px solid #bfa07a;font-size:14px;"></textarea>
          <input id="order-note" type="text" placeholder="Lời chúc hoặc ghi chú (tùy chọn)" style="padding:10px 12px;border-radius:10px;border:1px solid #bfa07a;font-size:14px;" />
          <div id="order-error-msg" style="color:#b91c1c;font-size:13px;font-weight:700;display:none;"></div>
          <button type="submit" class="shop-cart-cta" style="margin:4px 0 0;height:48px;font-size:17px;max-width:none;">
            Xác nhận đặt quà
          </button>
        </form>
      </div>
      `
    );

    document.querySelectorAll('.cart-qty-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const delta = Number(btn.getAttribute('data-delta') || 0);
        if (id) {
          this.cart = updateCartQuantity(this.cart, id, delta);
          this.saveState();
          this.updateActionBadges();
          this.openCartModal();
        }
      });
    });

    document.getElementById('checkout-order-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.cart.length === 0) return;
      const form = {
        name: document.getElementById('order-name')?.value,
        phone: document.getElementById('order-phone')?.value,
        address: document.getElementById('order-address')?.value,
        note: document.getElementById('order-note')?.value
      };
      const check = validateOrderForm(form);
      const errEl = document.getElementById('order-error-msg');
      if (!check.valid) {
        if (errEl) {
          errEl.style.display = 'block';
          errEl.textContent = Object.values(check.errors).join(' ');
        }
        return;
      }
      const orderCode = `VT-${Date.now().toString().slice(-6)}`;
      this.orders.unshift({
        code: orderCode,
        ...form,
        items: [...this.cart],
        total: calculateCartSummary(this.cart).grandTotal,
        createdAt: new Date().toLocaleString('vi-VN')
      });
      this.cart = [];
      this.saveState();
      this.updateActionBadges();
      this.playBellTone(288, 2.5);
      this.openModal(
        'Đã ghi nhận đơn quà lưu niệm',
        `
        <div style="text-align:center;padding:14px;">
          <div style="font-size:22px;font-weight:800;color:#472915;margin-bottom:8px;">Mã đơn: ${orderCode}</div>
          <p style="font-size:15px;color:#4a2f18;line-height:1.5;max-width:520px;margin:0 auto 16px;">
            Quầy lưu niệm Chùa Vĩnh Tràng đã nhận đơn của <strong>${form.name}</strong> (${form.phone}). Quà sẽ được gói cẩn thận và gửi về địa chỉ: <em>${form.address}</em>.
          </p>
          <button id="btn-done-order" class="product-detail-btn" style="max-width:260px;">Đóng lại</button>
        </div>
        `
      );
      document.getElementById('btn-done-order')?.addEventListener('click', () => this.closeModal());
    });
  }
};
