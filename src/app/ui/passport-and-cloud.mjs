/**
 * Mixin Sổ Hành Hương Liên Chùa (keyed by templeId), Đồng Bộ Đám Mây Google/Firestore,
 * Hoa Đăng Cộng Đồng, Quẻ Bình An Mỗi Ngày, Chụp Ảnh Sạch HUD, Joystick mềm & Điều hướng 1 chạm.
 */
import {
  DEFAULT_TEMPLE_ID,
  TEMPLE_CATALOG,
  PASSPORT_GARDEN_SPECIES,
  HERITAGE_RELICS,
  EIGHTEEN_ARHATS,
  DHARMA_JOURNAL_MOODS,
  PILGRIMAGE_STATIONS,
  getLocalDateKey,
  getActiveTempleRecord,
  stampTempleStation,
  stampTempleHeritage,
  stampTempleArhat,
  getNextGuidedDestination,
  getTodayPeaceOracle,
  drawDailyPeaceOracle,
  plantPassportGardenSlot,
  waterRealDayGardenSlot,
  harvestPassportGardenSlot,
  addTempleJournalEntry,
  addTempleMemoryPhoto,
  mergeCloudPassportState,
  matchHeritagePhotoSpot,
  recordHeritagePhoto,
  HERITAGE_PHOTO_SPOTS,
  mergeBlessingTowerEntries
} from './shared.mjs';

import {
  subscribeAuthState,
  signInWithGooglePopup,
  signOutGoogleAccount,
  loadCloudPassport,
  saveCloudPilgrimProfile,
  saveCloudTempleProgress,
  saveCloudJournalEntry,
  subscribeCommunityLanterns,
  postCommunityLantern,
  blessCommunityLantern,
  subscribeCloudBlessingTower,
  postCloudBlessingTowerEntry,
  saveCloudPublicProfile,
  postCloudGiftTransaction,
  postCloudCommunityPost
} from '../firebase-sync.mjs';

const QUICK_PRAYER_TEMPLATES = [
  'Cầu mong gia đình bình an, mạnh khỏe, thuận hòa.',
  'Nguyện tâm luôn an lạc, bớt âu lo, thêm từ bi.',
  'Cầu cho cha mẹ sống lâu khỏe mạnh, con cháu hiếu thảo.',
  'Hôm nay lòng nhẹ nhàng khi nghe tiếng chuông chùa.'
];

const GARDEN_STAGE_META = [
  { label: 'Chậu trống', icon: '🪴', hint: 'Chọn giống hoa để gieo hạt' },
  { label: 'Mới gieo hạt', icon: '🌱', hint: 'Tưới nước 1 lần mỗi ngày' },
  { label: 'Nảy mầm xanh', icon: '🌿', hint: 'Chăm tưới ngày thứ 2' },
  { label: 'Kết nụ sen', icon: '🌷', hint: 'Tưới thêm 1 ngày nữa sẽ nở rộ' },
  { label: 'Mãn khai rực rỡ', icon: '🪷', hint: 'Có thể lưu vào Sổ Hành Hương' }
];

function escapeHtml(raw) {
  return String(raw ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fontScaleToNumeric(scale) {
  if (scale === 'xlarge') return 1.34;
  if (scale === 'large') return 1.18;
  return 1.0;
}

function numericToFontScale(num) {
  const n = Number(num);
  if (!Number.isFinite(n)) return 'normal';
  if (n >= 1.28) return 'xlarge';
  if (n >= 1.1) return 'large';
  return 'normal';
}

export const passportAndCloudMethods = {
  /* ========================================================================
     1. FIREBASE AUTH & FIRESTORE CLOUD SYNC + REAL-TIME COMMUNITY LANTERNS
     ======================================================================== */
  async initFirebaseAndCloudSync() {
    if (this._firebaseSyncInitialized) return;
    this._firebaseSyncInitialized = true;

    try {
      this._unsubAuth = await subscribeAuthState(async (user) => {
        this.cloudUser = user
          ? {
              uid: user.uid,
              displayName: user.displayName || this.studentName || 'Phật tử hữu duyên',
              email: user.email || '',
              photoURL: user.photoURL || ''
            }
          : null;

        if (this.cloudUser && this.cloudUser.displayName) {
          this.studentName = this.cloudUser.displayName;
        }

        this.refreshCloudAuthUI();

        if (this.cloudUser?.uid) {
          const cloudBundle = await loadCloudPassport(this.cloudUser.uid);
          if (cloudBundle) {
            this.passport = mergeCloudPassportState(this.passport, cloudBundle);
            if (cloudBundle.profile) {
              if (cloudBundle.profile.displayName) {
                this.studentName = cloudBundle.profile.displayName;
              }
              if (cloudBundle.profile.elderFontScale) {
                const mapped = numericToFontScale(cloudBundle.profile.elderFontScale);
                this.applyElderFontScale?.(mapped, false);
              }
              if (cloudBundle.profile.readAlongRate) {
                this.readAlongRate = Number(cloudBundle.profile.readAlongRate) <= 0.9 ? 0.85 : 1.0;
              }
            }
            this.saveState();
            this.refreshTopStampSummary();
            this.refreshGuidedNextButton();
            this.refreshCloudAuthUI();
          }
          // Push union-merged local state back up safely
          this.scheduleCloudSync({ profile: true, temple: true });
        }
      });

      this._unsubLanterns = await subscribeCommunityLanterns(
        this.passport?.activeTempleId || DEFAULT_TEMPLE_ID,
        (lanterns) => {
          this.communityLanterns = Array.isArray(lanterns) ? lanterns : [];
          this.syncCombinedLanternsTo3D();
        }
      );

      this._unsubBlessingTower = await subscribeCloudBlessingTower(
        this.passport?.activeTempleId || DEFAULT_TEMPLE_ID,
        (cloudEntries) => {
          if (Array.isArray(cloudEntries) && cloudEntries.length > 0) {
            this.blessingTower = mergeBlessingTowerEntries(this.blessingTower, cloudEntries);
            this.saveState();
            this.syncBlessingTowerTo3D?.();
          }
        }
      );
    } catch (err) {
      console.warn('[passport-and-cloud] Offline fallback active:', err?.message || err);
    }
  },

  async syncBlessingTowerEntryToCloud(entry) {
    if (!this.cloudUser?.uid || !entry) return false;
    return postCloudBlessingTowerEntry(this.cloudUser.uid, {
      ...entry,
      templeId: this.passport?.activeTempleId || DEFAULT_TEMPLE_ID
    });
  },

  async syncSocialCloudRecord(kind, payload) {
    if (!this.cloudUser?.uid || !payload) return false;
    if (kind === 'profile') {
      return saveCloudPublicProfile(this.cloudUser.uid, payload);
    }
    if (kind === 'gift') {
      return postCloudGiftTransaction(this.cloudUser.uid, payload);
    }
    if (kind === 'post') {
      return postCloudCommunityPost(this.cloudUser.uid, {
        ...payload,
        templeId: this.passport?.activeTempleId || DEFAULT_TEMPLE_ID
      });
    }
    return false;
  },

  syncCombinedLanternsTo3D() {
    const cloudList = Array.isArray(this.communityLanterns) ? this.communityLanterns : [];
    const localList = Array.isArray(this.hoaDangWishes) ? this.hoaDangWishes : [];
    const merged = cloudList.length > 0 ? [...cloudList, ...localList.slice(0, 6)] : localList;
    if (this.world3d?.renderFloatingLanterns) {
      this.world3d.renderFloatingLanterns(merged.slice(0, 28));
    }
  },

  scheduleCloudSync({ profile = false, temple = true } = {}) {
    if (!this.cloudUser?.uid) return;
    if (profile) this._pendingCloudProfileSync = true;
    if (temple) this._pendingCloudTempleSync = true;
    if (this._cloudSyncTimer) clearTimeout(this._cloudSyncTimer);
    this._cloudSyncTimer = setTimeout(() => {
      this._cloudSyncTimer = null;
      const uid = this.cloudUser?.uid;
      if (!uid) return;
      if (this._pendingCloudProfileSync) {
        this._pendingCloudProfileSync = false;
        saveCloudPilgrimProfile(uid, {
          displayName: this.studentName || this.cloudUser.displayName,
          characterModelKey: this.characterModelKey,
          nationalityId: this.nationalityId,
          elderFontScale: fontScaleToNumeric(this.elderFontScale),
          readAlongRate: this.readAlongRate,
          activeTempleId: this.passport?.activeTempleId || DEFAULT_TEMPLE_ID
        });
      }
      if (this._pendingCloudTempleSync) {
        this._pendingCloudTempleSync = false;
        const tid = this.passport?.activeTempleId || DEFAULT_TEMPLE_ID;
        const rec = getActiveTempleRecord(this.passport, tid);
        saveCloudTempleProgress(uid, tid, rec);
      }
    }, 650);
  },

  async handleGoogleSignIn() {
    try {
      const user = await signInWithGooglePopup();
      if (user) {
        this.playBellTone?.(288, 1.8);
        this.showToast(
          '☁️ Đã đăng nhập Google thành công',
          `Xin chào ${user.displayName || 'Phật tử'}. Sổ Hành Hương sẽ tự động lưu giữ an toàn trên mây.`,
          4200,
          false
        );
      }
    } catch (err) {
      const msg = err?.code === 'auth/popup-closed-by-user'
        ? 'Cô bác đã đóng cửa sổ đăng nhập Google.'
        : 'Chưa thể đăng nhập Google lúc này. Mọi dấu mộc vẫn được lưu an toàn trên máy.';
      this.showToast('Đăng nhập Google', msg, 3800, false);
    }
  },

  async handleGoogleSignOut() {
    try {
      await signOutGoogleAccount();
      this.showToast(
        'Đã đăng xuất tài khoản Google',
        'Sổ Hành Hương trên máy vẫn được giữ nguyên. Cô bác có thể đăng nhập lại bất cứ lúc nào.',
        3600,
        false
      );
    } catch {}
  },

  refreshCloudAuthUI() {
    const user = this.cloudUser;
    const shortName = user?.displayName
      ? String(user.displayName).split(' ').slice(-2).join(' ')
      : 'Đăng nhập';

    const topAuthLabel = document.getElementById('nav-auth-label');
    if (topAuthLabel) {
      topAuthLabel.textContent = user ? shortName : 'Đăng nhập';
    }
    const topAuthBtn = document.getElementById('nav-btn-auth');
    if (topAuthBtn) {
      topAuthBtn.classList.toggle('is-signed-in', Boolean(user));
      topAuthBtn.title = user
        ? `Đang đồng bộ Sổ Hành Hương (${user.displayName})`
        : 'Đăng nhập Google để lưu Sổ Hành Hương';
    }

    const titleAuthBtn = document.getElementById('btn-title-google-signin');
    if (titleAuthBtn) {
      titleAuthBtn.textContent = user
        ? `☁️ Đã đăng nhập: ${shortName}`
        : '☁️ Đăng nhập Google (Lưu Sổ Hành Hương)';
    }

    const drawerAuthStatus = document.getElementById('drawer-cloud-status');
    const drawerAuthBtn = document.getElementById('btn-drawer-cloud-auth');
    if (drawerAuthStatus) {
      drawerAuthStatus.textContent = user
        ? `Đang đồng bộ đám mây · ${user.displayName}`
        : 'Chưa đăng nhập · Đang lưu trên thiết bị này';
    }
    if (drawerAuthBtn) {
      drawerAuthBtn.textContent = user ? 'Đăng xuất Google' : 'Đăng nhập Google';
    }
  },

  /* ========================================================================
     2. LIVE 3D TITLE OVERLAY, ZEN HUD COLLAPSE, UTILITY DRAWER & SOFT JOYSTICK
     ======================================================================== */
  enterTempleFromTitleOverlay() {
    if (this.titleOverlayDismissed) return;
    this.titleOverlayDismissed = true;
    this.arrivalCompleted = true;

    const overlay = document.getElementById('temple-title-overlay');
    if (overlay) {
      overlay.classList.add('is-dismissed');
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 420);
    }
    document.body.classList.remove('title-overlay-active');

    this.world3d?.setTitlePanMode?.(false);
    this.world3d?.snapCameraImmediate?.();
    this.syncPilgrimageCompanionsTo3D?.();
    this.ensureAudioContext?.();
    this.playBellTone?.(256, 2.2);
    this.refreshGuidedNextButton();
    this.refreshTopStampSummary();
    this.saveState();
  },

  toggleZenHudMode(forceCollapsed = null) {
    const next = forceCollapsed !== null ? Boolean(forceCollapsed) : !this.zenHudCollapsed;
    this.zenHudCollapsed = next;
    document.body.classList.toggle('zen-hud-collapsed', next);
    const btn = document.getElementById('btn-dock-zen-toggle');
    if (btn) {
      btn.setAttribute('aria-expanded', next ? 'false' : 'true');
      btn.textContent = next ? '▴ Hiện nút' : '▾ Ẩn nút';
    }
  },

  toggleUtilityDrawer(forceOpen = null) {
    const drawer = document.getElementById('temple-utility-drawer');
    const backdrop = document.getElementById('utility-drawer-backdrop');
    const triggerBtn = document.getElementById('nav-btn-utility-drawer');
    if (!drawer) return;
    const isOpen = drawer.classList.contains('open');
    const next = forceOpen !== null ? Boolean(forceOpen) : !isOpen;
    drawer.classList.toggle('open', next);
    drawer.setAttribute('aria-hidden', next ? 'false' : 'true');
    if (backdrop) backdrop.classList.toggle('open', next);
    if (triggerBtn) triggerBtn.setAttribute('aria-expanded', next ? 'true' : 'false');
    if (next) {
      this.refreshCloudAuthUI();
      const drawerInteriorBtn = document.getElementById('btn-drawer-interior');
      if (drawerInteriorBtn) {
        drawerInteriorBtn.textContent = this.world3d?.insideInterior
          ? '← Ra sân chùa (Hiên bỏ dép)'
          : '🚪 Vào trong Chánh Điện';
      }
    }
  },

  bindSoftJoystick() {
    const zone = document.getElementById('soft-joystick-zone');
    const base = document.getElementById('soft-joystick-base');
    const knob = document.getElementById('soft-joystick-knob');
    if (!zone || !base || !knob || zone.dataset.bound === '1') return;
    zone.dataset.bound = '1';

    const maxRadius = 40;
    let activePointerId = null;

    const resetStick = () => {
      activePointerId = null;
      zone.classList.remove('active');
      knob.style.transform = 'translate(0px, 0px)';
      this.world3d?.setJoystickInput?.(0, 0);
    };

    const updateStickFromEvent = (e) => {
      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const clamped = Math.min(maxRadius, dist);
      const nx = dist > 0.001 ? dx / dist : 0;
      const ny = dist > 0.001 ? dy / dist : 0;
      const ox = nx * clamped;
      const oy = ny * clamped;

      knob.style.transform = `translate(${ox.toFixed(1)}px, ${oy.toFixed(1)}px)`;

      const mag = clamped / maxRadius;
      if (mag < 0.12) {
        this.world3d?.setJoystickInput?.(0, 0);
      } else {
        this.world3d?.setJoystickInput?.(nx * mag, ny * mag);
      }
    };

    zone.addEventListener('pointerdown', (e) => {
      if (this.activeScreen !== 'courtyard' || !this.titleOverlayDismissed) return;
      e.preventDefault();
      e.stopPropagation();
      activePointerId = e.pointerId;
      zone.classList.add('active');
      try {
        zone.setPointerCapture(e.pointerId);
      } catch {}
      updateStickFromEvent(e);
    });

    zone.addEventListener('pointermove', (e) => {
      if (activePointerId === null || e.pointerId !== activePointerId) return;
      e.preventDefault();
      updateStickFromEvent(e);
    });

    const onRelease = (e) => {
      if (activePointerId === null || e.pointerId !== activePointerId) return;
      resetStick();
    };
    zone.addEventListener('pointerup', onRelease);
    zone.addEventListener('pointercancel', onRelease);
    zone.addEventListener('lostpointercapture', resetStick);
    window.addEventListener('blur', resetStick);
  },

  /* ========================================================================
     3. 1-TAP GUIDED WALK & ELDERLY RITUAL QUICK SHEET
     ======================================================================== */
  refreshTopStampSummary() {
    const el = document.getElementById('hud-stamp-summary');
    if (!el || !this.passport) return;
    const rec = getActiveTempleRecord(this.passport, this.passport.activeTempleId || DEFAULT_TEMPLE_ID);
    const stamps = (rec.heritageStamps?.length || 0);
    el.textContent = `Dấu mộc ${stamps}/10`;
  },

  refreshGuidedNextButton() {
    const labelEl = document.getElementById('btn-guided-next-label');
    if (!labelEl || !this.passport) return;
    const next = getNextGuidedDestination(
      this.passport,
      this.activeStationKey,
      Boolean(this.world3d?.insideInterior)
    );
    if (next) {
      labelEl.textContent = `Đi tiếp: ${next.label}`;
    } else {
      labelEl.textContent = 'Đi tiếp: Chánh Điện';
    }
  },

  executeGuidedNextStep() {
    if (!this.titleOverlayDismissed) {
      this.enterTempleFromTitleOverlay();
    }
    const next = getNextGuidedDestination(
      this.passport,
      this.activeStationKey,
      Boolean(this.world3d?.insideInterior)
    );
    if (!next) return;

    if (next.key === 'chanh_dien') {
      if (!this.world3d?.insideInterior) {
        this.toggleInteriorHallIn3D(true);
      } else {
        this.world3d?.goToInteriorZone?.('chanh_dien');
      }
      return;
    }

    if (this.world3d?.insideInterior) {
      this.toggleInteriorHallIn3D(false);
      setTimeout(() => {
        this.walkToStationIn3D(next.key);
      }, 450);
      return;
    }

    this.walkToStationIn3D(next.key);
  },

  openRitualQuickSheet() {
    if (!this.titleOverlayDismissed) {
      this.enterTempleFromTitleOverlay();
    }
    const st = PILGRIMAGE_STATIONS.find((s) => s.key === this.activeStationKey);
    const locName = this.world3d?.insideInterior ? 'Chánh Điện Đại Hùng Bửu Điện' : (st?.name || 'Sân Chùa Vĩnh Tràng');

    this.openModal(
      'Nghi thức Lễ Phật & Dâng hương',
      `
      <div class="elder-ritual-sheet">
        <p class="elder-sheet-subtitle">Đang đứng tại: <strong>${escapeHtml(locName)}</strong>. Mời cô bác chọn nghi thức thành tâm:</p>
        <div class="elder-ritual-grid">
          <button type="button" class="elder-ritual-card" data-quick-ritual="le_phat">
            <span class="elder-ritual-icon" aria-hidden="true">🙏</span>
            <span class="elder-ritual-title">Lễ Phật Tam Bái</span>
            <span class="elder-ritual-desc">Chắp tay cúi lạy thành kính trước Tam Bảo</span>
          </button>
          <button type="button" class="elder-ritual-card" data-quick-ritual="dang_huong">
            <span class="elder-ritual-icon" aria-hidden="true">🕯️</span>
            <span class="elder-ritual-title">Dâng Hương Trầm</span>
            <span class="elder-ritual-desc">Thắp ba nén tâm hương cầu gia đạo bình an</span>
          </button>
          <button type="button" class="elder-ritual-card" data-quick-ritual="dang_hoa">
            <span class="elder-ritual-icon" aria-hidden="true">🪷</span>
            <span class="elder-ritual-title">Dâng Hoa Sen</span>
            <span class="elder-ritual-desc">Cúng dường đóa sen tươi thanh khiết</span>
          </button>
          <button type="button" class="elder-ritual-card" data-quick-ritual="niem_phat">
            <span class="elder-ritual-icon" aria-hidden="true">📿</span>
            <span class="elder-ritual-title">Niệm Phật Tĩnh Tâm</span>
            <span class="elder-ritual-desc">Lần chuỗi hạt và lắng nghe tiếng chuông mõ</span>
          </button>
        </div>
        <div class="elder-sheet-footer-row">
          <button type="button" class="elder-soft-btn" id="btn-ritual-open-oracle">🎋 Rút Quẻ Bình An hôm nay</button>
          <button type="button" class="elder-soft-btn" id="btn-ritual-open-lantern">🏮 Thả Hoa Đăng Hồ Sen</button>
        </div>
      </div>
      `
    );

    document.querySelectorAll('[data-quick-ritual]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const kind = btn.getAttribute('data-quick-ritual');
        this.closeModal();
        const tid = this.passport?.activeTempleId || DEFAULT_TEMPLE_ID;
        stampTempleStation(this.passport, this.activeStationKey || 'lu_huong_san', tid);
        this.saveState();
        this.scheduleCloudSync({ temple: true });
        this.refreshGuidedNextButton();

        if (kind === 'le_phat') this.triggerLePhat?.();
        else if (kind === 'dang_huong') this.triggerDangHuong?.();
        else if (kind === 'dang_hoa') this.triggerDangHoa?.();
        else if (kind === 'niem_phat') this.triggerNiemPhat?.();
      });
    });

    document.getElementById('btn-ritual-open-oracle')?.addEventListener('click', () => {
      this.openDailyPeaceOracleModal();
    });
    document.getElementById('btn-ritual-open-lantern')?.addEventListener('click', () => {
      this.openCommunityLanternModal(null);
    });
  },

  /* ========================================================================
     4. SỔ HÀNH HƯƠNG LIÊN CHÙA (MULTI-TEMPLE PASSPORT BOOK)
     ======================================================================== */
  openPilgrimagePassportModal(initialTab = 'overview', selectedTempleId = null) {
    if (!this.titleOverlayDismissed) {
      this.enterTempleFromTitleOverlay();
    }
    this.toggleUtilityDrawer(false);
    const activeTab = ['overview', 'stamps', 'journal', 'garden', 'oracle_photos'].includes(initialTab)
      ? initialTab
      : 'overview';
    const templeId = selectedTempleId || this.passport?.activeTempleId || DEFAULT_TEMPLE_ID;
    const templeMeta = TEMPLE_CATALOG.find((t) => t.id === templeId) || TEMPLE_CATALOG[0];
    const rec = getActiveTempleRecord(this.passport, templeId);
    const todayKey = getLocalDateKey();

    const tabsHtml = `
      <div class="passport-tabs" role="tablist">
        <button type="button" class="passport-tab-btn ${activeTab === 'overview' ? 'active' : ''}" data-passport-tab="overview">🏛️ Mục lục Chùa</button>
        <button type="button" class="passport-tab-btn ${activeTab === 'stamps' ? 'active' : ''}" data-passport-tab="stamps">🧧 Dấu Mộc</button>
        <button type="button" class="passport-tab-btn ${activeTab === 'journal' ? 'active' : ''}" data-passport-tab="journal">✍️ Nhật Ký</button>
        <button type="button" class="passport-tab-btn ${activeTab === 'garden' ? 'active' : ''}" data-passport-tab="garden">🪷 Vườn Sen</button>
        <button type="button" class="passport-tab-btn ${activeTab === 'oracle_photos' ? 'active' : ''}" data-passport-tab="oracle_photos">🎋 Quẻ &amp; Ảnh</button>
      </div>
    `;

    let bodyHtml = '';

    if (activeTab === 'overview') {
      const user = this.cloudUser;
      bodyHtml = `
        <div class="passport-cloud-banner">
          <div>
            <strong>${user ? `☁️ Đang đồng bộ: ${escapeHtml(user.displayName)}` : '📖 Sổ Hành Hương cá nhân'}</strong>
            <p>${user ? 'Mọi dấu mộc, nhật ký và vườn sen của cô bác đang được sao lưu an toàn trên Google Cloud.' : 'Đăng nhập Google để lưu giữ Sổ Hành Hương xuyên suốt nhiều ngôi chùa và không bị mất khi đổi máy.'}</p>
          </div>
          <button type="button" class="passport-primary-btn" id="btn-passport-cloud-auth">
            ${user ? 'Đăng xuất' : 'Đăng nhập Google'}
          </button>
        </div>

        <div class="passport-summary-strip">
          <div class="passport-stat">
            <span class="passport-stat-num">${rec.heritageStamps.length}/${templeMeta.heritageCount}</span>
            <span class="passport-stat-lbl">Dấu mộc Di sản</span>
          </div>
          <div class="passport-stat">
            <span class="passport-stat-num">${rec.arhatStamps.length}/${templeMeta.arhatCount || 18}</span>
            <span class="passport-stat-lbl">18 Vị La Hán</span>
          </div>
          <div class="passport-stat">
            <span class="passport-stat-num">${rec.practicedDays.length}</span>
            <span class="passport-stat-lbl">Ngày đi chùa</span>
          </div>
          <div class="passport-stat">
            <span class="passport-stat-num">${(this.passport.journalEntries || []).filter((e) => e.templeId === templeId).length}</span>
            <span class="passport-stat-lbl">Lời cầu nguyện</span>
          </div>
        </div>

        <h4 class="passport-section-heading">Hành trình các ngôi cổ tự Việt Nam</h4>
        <div class="passport-temple-grid">
          ${TEMPLE_CATALOG.map((t) => {
            const tRec = getActiveTempleRecord(this.passport, t.id);
            const isSelected = t.id === templeId;
            const isComingSoon = t.status !== 'active';
            return `
              <div class="passport-temple-card ${isSelected ? 'selected' : ''} ${isComingSoon ? 'coming-soon' : ''}">
                <div class="passport-temple-head">
                  <div>
                    <div class="passport-temple-name">${escapeHtml(t.name)}</div>
                    <div class="passport-temple-region">${escapeHtml(t.region)} · Năm ${t.foundedYear}</div>
                  </div>
                  <span class="passport-seal-mini ${tRec.visitedStations.length > 0 ? 'stamped' : ''}">
                    ${isComingSoon ? 'Sắp mở' : escapeHtml(t.sealText)}
                  </span>
                </div>
                <p class="passport-temple-desc">${escapeHtml(t.description)}</p>
                <div class="passport-temple-foot">
                  <span>Dấu mộc: ${tRec.heritageStamps.length}/${t.heritageCount}</span>
                  ${
                    isComingSoon
                      ? `<span class="passport-soon-note">Đang xây dựng 3D</span>`
                      : `<button type="button" class="passport-outline-btn" data-select-temple="${t.id}">${isSelected ? 'Đang xem sổ này' : 'Mở trang chùa'}</button>`
                  }
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else if (activeTab === 'stamps') {
      bodyHtml = `
        <h4 class="passport-section-heading">Dấu mộc 10 Di Sản ${escapeHtml(templeMeta.name)} (${rec.heritageStamps.length}/${HERITAGE_RELICS.length})</h4>
        <div class="passport-stamps-grid">
          ${HERITAGE_RELICS.map((r) => {
            const stamped = rec.heritageStamps.includes(r.id);
            return `
              <div class="passport-stamp-card ${stamped ? 'stamped' : ''}">
                <div class="passport-stamp-top">
                  <span class="passport-stamp-title">${escapeHtml(r.name)}</span>
                  <span class="passport-vermilion-seal ${stamped ? 'passport-seal-stamped' : ''}">
                    ${stamped ? 'ĐÃ ĐÓNG DẤU' : 'Chưa ghé'}
                  </span>
                </div>
                <p class="passport-stamp-desc">${escapeHtml(r.story || r.subtitle || '')}</p>
                <div class="passport-stamp-actions">
                  ${
                    r.stationKey
                      ? `<button type="button" class="passport-outline-btn" data-passport-walk="${escapeHtml(r.stationKey)}">🚶 Đi tới nơi này</button>`
                      : ''
                  }
                  <button type="button" class="passport-soft-inline-btn" data-passport-read="${escapeHtml(r.name + '. ' + (r.story || r.subtitle || ''))}">🔊 Nghe đọc chậm</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <h4 class="passport-section-heading" style="margin-top:20px;">Bộ Tượng 18 Vị La Hán Gỗ Mít 1907 (${rec.arhatStamps.length}/18)</h4>
        <div class="passport-arhats-grid">
          ${EIGHTEEN_ARHATS.map((a) => {
            const arhatKey = `arhat_${a.id}`;
            const stamped = rec.arhatStamps.includes(arhatKey);
            return `
              <button type="button" class="passport-arhat-chip ${stamped ? 'stamped' : ''}" data-passport-arhat="${a.id}">
                <span class="arhat-chip-num">Vị ${a.id}</span>
                <strong class="arhat-chip-title">${escapeHtml(a.title)}</strong>
                <span class="arhat-chip-status">${stamped ? '🧧 Đã đóng dấu' : 'Chạm để nghe & đóng dấu'}</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
    } else if (activeTab === 'journal') {
      const entries = (this.passport.journalEntries || []).filter((e) => e.templeId === templeId);
      const selectedMood = this._passportSelectedMood || 'an_lac';
      bodyHtml = `
        <div class="passport-journal-composer">
          <div class="passport-journal-moods">
            ${DHARMA_JOURNAL_MOODS.map((m) => `
              <button type="button" class="passport-mood-btn ${selectedMood === m.id ? 'active' : ''}" data-passport-mood="${m.id}" data-mood-label="${escapeHtml(m.label)}">
                ${m.icon} ${escapeHtml(m.label)}
              </button>
            `).join('')}
          </div>
          <div class="passport-prayer-templates">
            ${QUICK_PRAYER_TEMPLATES.map((tpl) => `
              <button type="button" class="passport-tpl-btn" data-prayer-tpl="${escapeHtml(tpl)}">${escapeHtml(tpl)}</button>
            `).join('')}
          </div>
          <textarea id="passport-journal-input" class="passport-journal-textarea" rows="3" maxlength="600" placeholder="Viết vài dòng lời cầu nguyện hoặc cảm niệm hôm nay tại ${escapeHtml(templeMeta.name)}..."></textarea>
          <div class="passport-composer-foot">
            <span class="passport-sync-hint">${this.cloudUser ? '☁️ Tự động đồng bộ vào tài khoản Google' : '💾 Lưu trên máy · Đăng nhập Google để sao lưu'}</span>
            <button type="button" class="passport-primary-btn" id="btn-passport-save-journal">✍️ Lưu vào Nhật Ký</button>
          </div>
        </div>

        <h4 class="passport-section-heading" style="margin-top:18px;">Nhật Ký tại ${escapeHtml(templeMeta.name)} (${entries.length})</h4>
        <div class="passport-journal-list">
          ${
            entries.length === 0
              ? `<div class="passport-empty-note">Chưa có dòng nhật ký nào tại ${escapeHtml(templeMeta.name)}. Cô bác hãy chọn một câu nguyện mẫu ở trên hoặc tự viết vài lời bình an nhé.</div>`
              : entries
                  .map(
                    (entry) => `
                <article class="passport-journal-item">
                  <div class="passport-journal-meta">
                    <strong>${escapeHtml(entry.moodLabel || 'An lạc')}</strong>
                    <span>${escapeHtml(entry.dateKey || '')} · ${escapeHtml(entry.stationLabel || templeMeta.name)}</span>
                  </div>
                  <p class="passport-journal-text">${escapeHtml(entry.text)}</p>
                </article>
              `
                  )
                  .join('')
          }
        </div>
      `;
    } else if (activeTab === 'garden') {
      const slots = rec.gardenSlots || [];
      const keepsakes = rec.bloomedKeepsakes || [];
      bodyHtml = `
        <p class="passport-intro-note">Mỗi ngày thật cô bác tưới 1 gáo nước mát cho mỗi chậu hoa. Sau 3 ngày chăm sóc, đóa sen hoặc mầm Bồ Đề sẽ nở rộ để lưu vào tủ kỷ niệm Sổ Hành Hương.</p>
        <div class="passport-garden-grid">
          ${slots
            .map((slot, idx) => {
              const sp = PASSPORT_GARDEN_SPECIES.find((s) => s.id === slot.speciesId) || PASSPORT_GARDEN_SPECIES[0];
              const stageInfo = GARDEN_STAGE_META[slot.stage] || GARDEN_STAGE_META[0];
              const wateredToday = slot.lastWateredDateKey === todayKey;
              return `
                <div class="passport-garden-card stage-${slot.stage}">
                  <div class="garden-card-visual">${slot.stage >= 4 ? sp.icon : stageInfo.icon}</div>
                  <div class="garden-card-name">Chậu ${idx + 1}: ${escapeHtml(sp.name)}</div>
                  <div class="garden-card-stage">${escapeHtml(stageInfo.label)} (${Math.min(slot.stage, 4)}/4)</div>
                  <div class="garden-card-hint">${wateredToday && slot.stage < 4 ? 'Hôm nay đã tưới rồi · Hẹn sáng mai nhé' : escapeHtml(stageInfo.hint)}</div>
                  <div class="garden-card-actions">
                    ${
                      slot.stage === 0
                        ? `<div class="garden-species-picker">
                            ${PASSPORT_GARDEN_SPECIES.map(
                              (opt) => `<button type="button" class="passport-outline-btn" data-garden-plant="${idx}" data-species-id="${opt.id}">${opt.icon} ${escapeHtml(opt.name.split(' ')[0])}</button>`
                            ).join('')}
                          </div>`
                        : slot.stage >= 4
                        ? `<button type="button" class="passport-primary-btn" data-garden-harvest="${idx}">🪷 Lưu hoa vào Sổ</button>`
                        : `<button type="button" class="passport-primary-btn" data-garden-water="${idx}" ${wateredToday ? 'disabled' : ''}>${wateredToday ? '✓ Đã tưới hôm nay' : '💧 Tưới nước hôm nay'}</button>`
                    }
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>

        <h4 class="passport-section-heading" style="margin-top:18px;">Kỷ niệm hoa đã mãn khai (${keepsakes.length})</h4>
        <div class="passport-keepsake-shelf">
          ${
            keepsakes.length === 0
              ? `<div class="passport-empty-note">Chưa có đóa hoa nào được lưu. Tưới nước 3 ngày để đón đóa sen đầu tiên nở rộ nhé.</div>`
              : keepsakes
                  .map(
                    (k) => `
                  <div class="passport-keepsake-item">
                    <span class="keepsake-icon">${k.icon || '🪷'}</span>
                    <div>
                      <strong>${escapeHtml(k.speciesName)}</strong>
                      <span>Nở ngày ${escapeHtml(k.bloomedDateKey || '')}</span>
                    </div>
                  </div>
                `
                  )
                  .join('')
          }
        </div>
      `;
    } else if (activeTab === 'oracle_photos') {
      const todayOracle = getTodayPeaceOracle(this.passport, templeId);
      const photos = (this.passport.memoryPhotos || []).filter((p) => p.templeId === templeId);
      bodyHtml = `
        <div class="passport-oracle-box">
          <div class="passport-oracle-head">
            <h4>🎋 Quẻ Bình An Hôm Nay (${todayKey})</h4>
            <button type="button" class="passport-primary-btn" id="btn-passport-draw-oracle">
              ${todayOracle ? 'Xem lại Quẻ hôm nay' : 'Rút Quẻ Bình An'}
            </button>
          </div>
          ${
            todayOracle
              ? `<div class="passport-oracle-preview">
                  <strong>Quẻ số ${todayOracle.number}: ${escapeHtml(todayOracle.title)}</strong>
                  <pre class="oracle-verse-text">${escapeHtml(todayOracle.verse)}</pre>
                  <p class="oracle-advice-text">💡 ${escapeHtml(todayOracle.advice)}</p>
                </div>`
              : `<p class="passport-intro-note">Mỗi ngày cô bác rút một quẻ thơ bình an để giữ tâm thư thái suốt ngày dài.</p>`
          }
        </div>

        <div class="passport-photo-header">
          <h4 class="passport-section-heading">📸 Ảnh Kỷ Niệm Sạch HUD (${photos.length})</h4>
          <button type="button" class="passport-primary-btn" id="btn-passport-take-photo">📸 Chụp góc nhìn hiện tại</button>
        </div>
        <div class="passport-photos-grid">
          ${
            photos.length === 0
              ? `<div class="passport-empty-note">Chưa có ảnh kỷ niệm nào. Bấm "Chụp góc nhìn hiện tại" để lưu lại khung cảnh chùa không dính nút bấm.</div>`
              : photos
                  .map(
                    (p) => `
                <figure class="passport-photo-card">
                  <img src="${p.dataUrl}" alt="${escapeHtml(p.caption)}" />
                  <figcaption>
                    <div><strong>${escapeHtml(p.stationLabel)}</strong> · ${escapeHtml(p.dateKey)}</div>
                    <a class="passport-outline-btn" href="${p.dataUrl}" download="chua-vinh-trang-${escapeHtml(p.dateKey)}.jpg">⬇️ Tải ảnh</a>
                  </figcaption>
                </figure>
              `
                  )
                  .join('')
          }
        </div>
      `;
    }

    this.openModal(
      `Sổ Hành Hương · ${templeMeta.name}`,
      `
      <div class="passport-book-shell">
        ${tabsHtml}
        <div class="passport-tab-panel">${bodyHtml}</div>
      </div>
      `,
      { variant: 'scroll' }
    );

    // Bind tab switching
    document.querySelectorAll('[data-passport-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextTab = btn.getAttribute('data-passport-tab');
        if (nextTab) this.openPilgrimagePassportModal(nextTab, templeId);
      });
    });

    // Bind Overview actions
    document.getElementById('btn-passport-cloud-auth')?.addEventListener('click', () => {
      if (this.cloudUser) this.handleGoogleSignOut();
      else this.handleGoogleSignIn();
    });
    document.querySelectorAll('[data-select-temple]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextTid = btn.getAttribute('data-select-temple');
        if (nextTid) {
          this.passport.activeTempleId = nextTid;
          this.saveState();
          this.openPilgrimagePassportModal('overview', nextTid);
        }
      });
    });

    // Bind Stamps actions
    document.querySelectorAll('[data-passport-walk]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const stKey = btn.getAttribute('data-passport-walk');
        this.closeModal();
        if (stKey === 'chanh_dien' && !this.world3d?.insideInterior) {
          this.toggleInteriorHallIn3D(true);
        } else if (stKey) {
          if (this.world3d?.insideInterior) this.toggleInteriorHallIn3D(false);
          this.walkToStationIn3D(stKey);
        }
      });
    });
    document.querySelectorAll('[data-passport-read]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-passport-read') || '';
        this.audio?.speakVietnameseSmart?.(text, { rate: 0.85 });
      });
    });
    document.querySelectorAll('[data-passport-arhat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const num = Number(btn.getAttribute('data-passport-arhat'));
        const arhat = EIGHTEEN_ARHATS.find((a) => a.id === num);
        if (!arhat) return;
        const stampRes = stampTempleArhat(this.passport, `arhat_${arhat.id}`, templeId);
        this.saveState();
        this.scheduleCloudSync({ temple: true });
        this.playBellTone?.(324, 1.5);
        const speech = `${arhat.title}, ${arhat.name}. ${arhat.meaning}`;
        this.audio?.speakVietnameseSmart?.(speech, { rate: 0.85 });
        this.showToast(
          stampRes.changed ? `🧧 Đã đóng dấu ${arhat.title}` : `🪷 ${arhat.title}`,
          arhat.meaning,
          5000,
          false
        );
        this.openPilgrimagePassportModal('stamps', templeId);
      });
    });

    // Bind Journal actions
    document.querySelectorAll('[data-passport-mood]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._passportSelectedMood = btn.getAttribute('data-passport-mood') || 'an_lac';
        this._passportSelectedMoodLabel = btn.getAttribute('data-mood-label') || 'An lạc';
        document.querySelectorAll('[data-passport-mood]').forEach((b) =>
          b.classList.toggle('active', b === btn)
        );
      });
    });
    document.querySelectorAll('[data-prayer-tpl]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ta = document.getElementById('passport-journal-input');
        if (ta) {
          ta.value = btn.getAttribute('data-prayer-tpl') || '';
          ta.focus();
        }
      });
    });
    document.getElementById('btn-passport-save-journal')?.addEventListener('click', async () => {
      const ta = document.getElementById('passport-journal-input');
      const text = ta?.value || '';
      const mood = this._passportSelectedMood || 'an_lac';
      const moodLabel =
        this._passportSelectedMoodLabel ||
        DHARMA_JOURNAL_MOODS.find((m) => m.id === mood)?.label ||
        'An lạc';
      const st = PILGRIMAGE_STATIONS.find((s) => s.key === this.activeStationKey);
      const res = addTempleJournalEntry(this.passport, {
        templeId,
        text,
        mood,
        moodLabel,
        stationLabel: this.world3d?.insideInterior ? 'Chánh Điện Vĩnh Tràng' : (st?.name || templeMeta.name)
      });
      if (!res.ok) {
        this.showToast('Nhật Ký Đi Chùa', res.reason, 3000, false);
        return;
      }
      this.saveState();
      this.playBellTone?.(288, 1.8);
      if (this.cloudUser?.uid) {
        await saveCloudJournalEntry(this.cloudUser.uid, res.entry);
        this.scheduleCloudSync({ temple: true });
      }
      this.showToast('✍️ Đã lưu lời nguyện vào Sổ Hành Hương', 'Nguyện điều lành đến với cô bác và gia đình.', 3200, false);
      this.openPilgrimagePassportModal('journal', templeId);
    });

    // Bind Garden actions
    document.querySelectorAll('[data-garden-plant]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slotIdx = Number(btn.getAttribute('data-garden-plant'));
        const speciesId = btn.getAttribute('data-species-id') || 'sen_hong';
        const res = plantPassportGardenSlot(this.passport, slotIdx, speciesId, templeId);
        if (res.ok) {
          this.saveState();
          this.scheduleCloudSync({ temple: true });
          this.playMokugyoTap?.();
          this.showToast('🌱 Đã gieo hạt giống mới', `Hôm nay cô bác có thể tưới nước ngày đầu cho ${res.species.name}.`, 3400, false);
          this.openPilgrimagePassportModal('garden', templeId);
        }
      });
    });
    document.querySelectorAll('[data-garden-water]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slotIdx = Number(btn.getAttribute('data-garden-water'));
        const res = waterRealDayGardenSlot(this.passport, slotIdx, templeId);
        if (!res.ok) {
          this.showToast('Vườn Sen Chùa', res.reason, 3400, false);
          return;
        }
        this.saveState();
        this.scheduleCloudSync({ temple: true });
        this.playBellTone?.(res.bloomedNow ? 360 : 288, 1.8);
        this.showToast(
          res.bloomedNow ? '🪷 Hoa đã mãn khai rực rỡ!' : '💧 Đã tưới nước hôm nay',
          res.bloomedNow
            ? 'Cô bác hãy bấm "Lưu hoa vào Sổ" để giữ kỷ niệm đóa hoa này nhé.'
            : `Cây đã lên giai đoạn: ${res.stageLabel}. Hẹn ngày mai tưới tiếp nhé.`,
          3800,
          false
        );
        this.openPilgrimagePassportModal('garden', templeId);
      });
    });
    document.querySelectorAll('[data-garden-harvest]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slotIdx = Number(btn.getAttribute('data-garden-harvest'));
        const res = harvestPassportGardenSlot(this.passport, slotIdx, templeId);
        if (res.ok) {
          this.saveState();
          this.scheduleCloudSync({ temple: true });
          this.playBellTone?.(360, 2.2);
          this.showToast('🪷 Đã lưu hoa vào Sổ Hành Hương', `${res.keepsake.speciesName} đã được lưu vào tủ kỷ niệm.`, 3600, false);
          this.openPilgrimagePassportModal('garden', templeId);
        }
      });
    });

    // Bind Oracle & Photos actions
    document.getElementById('btn-passport-draw-oracle')?.addEventListener('click', () => {
      this.openDailyPeaceOracleModal();
    });
    document.getElementById('btn-passport-take-photo')?.addEventListener('click', () => {
      this.closeModal();
      setTimeout(() => this.captureCleanMemoryPhoto(), 120);
    });
  },

  /* ========================================================================
     5. QUẺ BÌNH AN MỖI NGÀY (30 QUẺ THƠ)
     ======================================================================== */
  openDailyPeaceOracleModal() {
    this.toggleUtilityDrawer(false);
    const tid = this.passport?.activeTempleId || DEFAULT_TEMPLE_ID;
    const res = drawDailyPeaceOracle(this.passport, tid);
    if (!res.alreadyDrawn) {
      this.saveState();
      this.scheduleCloudSync({ temple: true });
      this.playBellTone?.(324, 2.2);
    }
    const q = res.oracle;
    const targetStation = PILGRIMAGE_STATIONS.find((s) => s.key === q.stationKey);

    this.openModal(
      `Quẻ Bình An số ${q.number} · ${res.dateKey}`,
      `
      <div class="daily-oracle-modal">
        <div class="oracle-eyebrow">🎋 Lời chúc an lành cho hôm nay</div>
        <h3 class="oracle-title">${escapeHtml(q.title)}</h3>
        <pre class="oracle-verse-large">${escapeHtml(q.verse)}</pre>
        <div class="oracle-advice-box">
          <strong>Gợi ý nhẹ nhàng hôm nay:</strong>
          <p>${escapeHtml(q.advice)}</p>
        </div>
        <div class="oracle-actions-row">
          <button type="button" class="passport-outline-btn" id="btn-oracle-read-aloud">🔊 Đọc chậm cho cô bác nghe (0.85x)</button>
          ${
            targetStation
              ? `<button type="button" class="passport-primary-btn" id="btn-oracle-walk-station">🚶 Đi tới ${escapeHtml(targetStation.name)}</button>`
              : ''
          }
        </div>
      </div>
      `,
      { variant: 'scroll' }
    );

    document.getElementById('btn-oracle-read-aloud')?.addEventListener('click', () => {
      const spoken = `Quẻ bình an số ${q.number}, ${q.title}. ${q.verse.replace(/\n/g, '. ')}. Gợi ý hôm nay: ${q.advice}`;
      this.audio?.speakVietnameseSmart?.(spoken, { rate: 0.85 });
    });
    document.getElementById('btn-oracle-walk-station')?.addEventListener('click', () => {
      this.closeModal();
      if (q.stationKey === 'chanh_dien' && !this.world3d?.insideInterior) {
        this.toggleInteriorHallIn3D(true);
      } else if (q.stationKey) {
        if (this.world3d?.insideInterior) this.toggleInteriorHallIn3D(false);
        this.walkToStationIn3D(q.stationKey);
      }
    });
  },

  /* ========================================================================
     6. HOA ĐĂNG CỘNG ĐỒNG TRÊN HỒ SEN (CLICKABLE + BLESS + POST)
     ======================================================================== */
  openCommunityLanternModal(selectedWish = null) {
    this.toggleUtilityDrawer(false);
    const tid = this.passport?.activeTempleId || DEFAULT_TEMPLE_ID;
    const communityList = Array.isArray(this.communityLanterns) ? this.communityLanterns : [];
    const fallbackList = Array.isArray(this.hoaDangWishes) ? this.hoaDangWishes : [];
    const allWishes = communityList.length > 0 ? communityList : fallbackList;

    const selectedHtml = selectedWish
      ? `
        <div class="lantern-featured-card">
          <div class="lantern-featured-badge">🏮 Ngọn Hoa Đăng trên Hồ Sen</div>
          <blockquote class="lantern-featured-quote">“${escapeHtml(selectedWish.wishText || selectedWish.wish || '')}”</blockquote>
          <div class="lantern-featured-meta">
            <span>Người gửi: <strong>${escapeHtml(selectedWish.authorName || selectedWish.author || 'Phật tử hữu duyên')}</strong></span>
            <span>🙏 <strong id="featured-lantern-bless-count">${Number(selectedWish.blessCount) || 0}</strong> lời chúc lành</span>
          </div>
          <button type="button" class="passport-primary-btn" id="btn-bless-featured-lantern" data-lantern-id="${escapeHtml(selectedWish.id || '')}">
            🙏 Tùy hỷ · Gửi lời chúc lành
          </button>
        </div>
      `
      : '';

    this.openModal(
      'Hoa Đăng Cầu An · Hồ Sen Chùa Vĩnh Tràng',
      `
      <div class="community-lantern-modal">
        ${selectedHtml}

        <div class="lantern-release-box">
          <h4>🏮 Thả ngọn Hoa Đăng mới lên mặt hồ</h4>
          <div class="lantern-color-row">
            <button type="button" class="lantern-color-chip active" data-lantern-color="#f4a261" style="--chip:#f4a261">Vàng ấm</button>
            <button type="button" class="lantern-color-chip" data-lantern-color="#f28482" style="--chip:#f28482">Sen hồng</button>
            <button type="button" class="lantern-color-chip" data-lantern-color="#ffd166" style="--chip:#ffd166">Trăng rằm</button>
            <button type="button" class="lantern-color-chip" data-lantern-color="#90be6d" style="--chip:#90be6d">Bình an</button>
          </div>
          <textarea id="input-community-lantern-wish" class="passport-journal-textarea" rows="2" maxlength="240" placeholder="Ví dụ: Cầu cho gia đình sức khỏe dồi dào, vạn sự bình an..."></textarea>
          <div class="passport-composer-foot">
            <span class="passport-sync-hint">
              ${this.cloudUser ? `☁️ Đăng lên hồ cộng đồng dưới tên ${escapeHtml(this.cloudUser.displayName)}` : 'Đăng nhập Google để mọi người cùng thấy & gửi lời chúc lành cho đèn của cô bác'}
            </span>
            <button type="button" class="passport-primary-btn" id="btn-release-community-lantern">🏮 Thả Hoa Đăng</button>
          </div>
        </div>

        <h4 class="passport-section-heading" style="margin-top:16px;">Hoa Đăng đang trôi trên Hồ Sen (${allWishes.length})</h4>
        <div class="lantern-community-list">
          ${allWishes
            .slice(0, 12)
            .map(
              (w) => `
            <div class="lantern-list-row">
              <div class="lantern-list-main">
                <span class="lantern-dot" style="background:${escapeHtml(w.colorHex || '#f4a261')}"></span>
                <div>
                  <div class="lantern-list-text">“${escapeHtml(w.wishText || w.wish || '')}”</div>
                  <div class="lantern-list-author">${escapeHtml(w.authorName || w.author || 'Phật tử')} · 🙏 ${Number(w.blessCount) || 0} tùy hỷ</div>
                </div>
              </div>
              ${
                w.isCloud
                  ? `<button type="button" class="passport-outline-btn" data-bless-lantern-id="${escapeHtml(w.id)}">🙏 Chúc lành</button>`
                  : ''
              }
            </div>
          `
            )
            .join('')}
        </div>
      </div>
      `,
      { variant: 'scroll' }
    );

    let chosenColor = '#f4a261';
    document.querySelectorAll('[data-lantern-color]').forEach((btn) => {
      btn.addEventListener('click', () => {
        chosenColor = btn.getAttribute('data-lantern-color') || '#f4a261';
        document.querySelectorAll('[data-lantern-color]').forEach((b) => b.classList.toggle('active', b === btn));
      });
    });

    const handleBless = async (lanternId, btnEl) => {
      if (!lanternId) return;
      if (!this.cloudUser?.uid) {
        this.showToast('Đăng nhập Google', 'Cô bác đăng nhập Google một lần để gửi lời tùy hỷ lên hồ cộng đồng nhé.', 3600, false);
        await this.handleGoogleSignIn();
        return;
      }
      try {
        if (btnEl) btnEl.disabled = true;
        await blessCommunityLantern(lanternId);
        this.playBellTone?.(324, 1.4);
        const countEl = document.getElementById('featured-lantern-bless-count');
        if (countEl && selectedWish && selectedWish.id === lanternId) {
          countEl.textContent = String((Number(countEl.textContent) || 0) + 1);
        }
        this.showToast('🙏 Đã gửi lời chúc lành', 'Nguyện tâm tùy hỷ lan tỏa bình an đến mọi người.', 3000, false);
      } catch {
        if (btnEl) btnEl.disabled = false;
      }
    };

    document.getElementById('btn-bless-featured-lantern')?.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-lantern-id');
      if (selectedWish?.isCloud) {
        handleBless(id, e.currentTarget);
      } else {
        this.playBellTone?.(324, 1.4);
        this.showToast('🙏 Đã gửi lời chúc lành', 'Nguyện điều tốt đẹp đến với người gửi ngọn hoa đăng này.', 3000, false);
      }
    });

    document.querySelectorAll('[data-bless-lantern-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        handleBless(btn.getAttribute('data-bless-lantern-id'), btn);
      });
    });

    document.getElementById('btn-release-community-lantern')?.addEventListener('click', async () => {
      const ta = document.getElementById('input-community-lantern-wish');
      const text = String(ta?.value || '').trim();
      if (!text) {
        this.showToast('Thả Hoa Đăng', 'Cô bác vui lòng viết vài chữ lời nguyện trước khi thả đèn.', 2800, false);
        return;
      }

      if (this.cloudUser?.uid) {
        try {
          await postCommunityLantern(this.cloudUser.uid, {
            templeId: tid,
            authorName: this.studentName || this.cloudUser.displayName,
            nationalityId: this.nationalityId || 'vn',
            wishText: text,
            colorHex: chosenColor
          });
          this.playBellTone?.(288, 2.2);
          this.showToast('🏮 Đã thả Hoa Đăng lên Hồ Sen Cộng Đồng', 'Ngọn đèn của cô bác đang trôi sáng trên mặt hồ.', 3800, false);
          this.closeModal();
          if (!this.world3d?.insideInterior) {
            this.walkToStationIn3D('ho_sen_ca_koi');
          }
          return;
        } catch {}
      }

      // Local fallback when not signed in
      const localLantern = {
        id: `local_lantern_${Date.now().toString(36)}`,
        author: this.studentName || 'Phật tử hữu duyên',
        authorName: this.studentName || 'Phật tử hữu duyên',
        wish: text,
        wishText: text,
        colorHex: chosenColor,
        blessCount: 0,
        isCloud: false
      };
      this.hoaDangWishes = [localLantern, ...(this.hoaDangWishes || [])].slice(0, 48);
      this.saveState();
      this.syncCombinedLanternsTo3D();
      this.playBellTone?.(288, 2.0);
      this.showToast('🏮 Đã thả Hoa Đăng trên Hồ Sen', 'Cô bác có thể đăng nhập Google trong Sổ Hành Hương để đèn hiện lên cho cộng đồng cùng chúc lành.', 4200, false);
      this.closeModal();
    });
  },

  /* ========================================================================
     7. CỬA HÀNG HỢP NHẤT (TRANG PHỤC 3D + QUÀ LƯU NIỆM)
     ======================================================================== */
  openConsolidatedShopModal() {
    this.toggleUtilityDrawer(false);
    this.openModal(
      'Cửa Hàng Chùa Vĩnh Tràng',
      `
      <div class="elder-ritual-sheet">
        <p class="elder-sheet-subtitle">Chọn gian hàng cô bác muốn ghé thăm:</p>
        <div class="elder-ritual-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));">
          <button type="button" class="elder-ritual-card" id="btn-shop-hub-outfits">
            <span class="elder-ritual-icon" aria-hidden="true">👘</span>
            <span class="elder-ritual-title">Trang Phục Đi Chùa 3D</span>
            <span class="elder-ritual-desc">Áo tràng lam, áo dài, chuỗi hạt &amp; mặc thử trực tiếp lên nhân vật</span>
          </button>
          <button type="button" class="elder-ritual-card" id="btn-shop-hub-souvenir">
            <span class="elder-ritual-icon" aria-hidden="true">🎁</span>
            <span class="elder-ritual-title">Quà Lưu Niệm &amp; Sách Kinh</span>
            <span class="elder-ritual-desc">Sổ tay hoa sen, trầm hương, chuỗi gỗ và vật phẩm lưu niệm</span>
          </button>
        </div>
      </div>
      `
    );

    document.getElementById('btn-shop-hub-outfits')?.addEventListener('click', () => {
      this.openNineTabStoreModal?.('ao_trang');
    });
    document.getElementById('btn-shop-hub-souvenir')?.addEventListener('click', () => {
      this.closeModal();
      this.switchScreen?.('shop');
    });
  },

  /* ========================================================================
     8. CHỤP ẢNH KỶ NIỆM SẠCH HUD & CỬ CHỈ NHÂN VẬT TỰ NHIÊN
     ======================================================================== */
  captureCleanMemoryPhoto({ isSelfie = false } = {}) {
    this.toggleUtilityDrawer(false);
    const canvas = document.getElementById('world3d-canvas');
    if (!canvas) return;

    document.body.classList.add('clean-photo-capturing');
    try {
      this.world3d?.renderFrame?.();
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      document.body.classList.remove('clean-photo-capturing');

      const tid = this.passport?.activeTempleId || DEFAULT_TEMPLE_ID;
      const st = PILGRIMAGE_STATIONS.find((s) => s.key === this.activeStationKey);
      const stationLabel = this.world3d?.insideInterior ? 'Chánh Điện Vĩnh Tràng' : (st?.name || 'Sân Chùa Vĩnh Tràng');
      const caption = isSelfie
        ? `Ảnh Selfie kỷ niệm tại ${stationLabel}`
        : `Kỷ niệm đi lễ tại ${stationLabel}`;

      const res = addTempleMemoryPhoto(this.passport, {
        templeId: tid,
        dataUrl,
        caption,
        stationLabel
      });

      // Đợt 3: Tự động nhận diện 1 trong 12 Góc Ảnh Di Sản Chùa Vĩnh Tràng & Công Viên Vĩnh Tràng
      const px = this.world3d?.playerState?.x ?? this.playerPos?.x ?? 40.5;
      const pz = this.world3d?.playerState?.z ?? this.playerPos?.z ?? 43.8;
      const inInterior = Boolean(this.world3d?.insideInterior);
      const matchedSpot = matchHeritagePhotoSpot(px, pz, inInterior);
      let heritageBadgeHtml = '';
      if (matchedSpot) {
        const recRes = recordHeritagePhoto(this.pilgrimageDepth, matchedSpot.id, {
          dateKey: res.photo?.dateKey || getLocalDateKey(),
          thumbnail: ''
        });
        if (recRes.ok) {
          this.pilgrimageDepth = recRes.state;
          if (recRes.isNewSpot && recRes.rewardLotus > 0) {
            this.storeProfile.lotusPoints += recRes.rewardLotus;
            this.grantPilgrimXp?.(20, `Góc ảnh di sản: ${matchedSpot.name}`);
            this.updateActionBadges?.();
          }
          const totalCaptured = Object.keys(this.pilgrimageDepth.heritagePhotos || {}).length;
          heritageBadgeHtml = `
            <div style="background:#FFF8E6;border:1.5px solid #D5A94C;border-radius:12px;padding:10px 14px;font-size:13.5px;color:#5C381F;margin-bottom:8px;">
              <strong>📸 Góc Ảnh Di Sản #${matchedSpot.order}/${HERITAGE_PHOTO_SPOTS.length}: ${escapeHtml(matchedSpot.name)}</strong>
              <span style="display:block;font-size:12.5px;color:#7A4E1D;margin-top:2px;">
                ${recRes.isNewSpot ? `✨ Mở khóa góc mới (+${recRes.rewardLotus} 🪷) · ` : ''}Đã sưu tầm ${totalCaptured}/${HERITAGE_PHOTO_SPOTS.length} góc ảnh Vĩnh Tràng.
              </span>
            </div>
          `;
        }
      }

      this.saveState();
      this.playBellTone?.(360, 1.4);

      if (res.ok) {
        this.openModal(
          isSelfie ? '🤳 Ảnh Selfie Kỷ Niệm Chùa Vĩnh Tràng' : '📸 Ảnh Kỷ Niệm Sạch HUD',
          `
          <div class="clean-photo-preview">
            ${heritageBadgeHtml}
            <img src="${res.photo.dataUrl}" alt="${escapeHtml(res.photo.caption)}" />
            <p class="clean-photo-meta">📍 ${escapeHtml(res.photo.stationLabel)} · ${escapeHtml(res.photo.dateKey)} — Đã tự động lưu vào Sổ Hành Hương.</p>
            <div class="oracle-actions-row">
              <a class="passport-primary-btn" href="${res.photo.dataUrl}" download="chua-vinh-trang-${isSelfie ? 'selfie-' : ''}${escapeHtml(res.photo.dateKey)}.jpg">⬇️ Tải ảnh về máy</a>
              <button type="button" class="passport-outline-btn" id="btn-photo-open-album12">📸 Bộ 12 Góc Ảnh</button>
              <button type="button" class="passport-outline-btn" id="btn-photo-open-passport">📖 Sổ Hành Hương</button>
            </div>
          </div>
          `
        );
        document.getElementById('btn-photo-open-album12')?.addEventListener('click', () => {
          this.openPilgrimageDepthModal?.('photos');
        });
        document.getElementById('btn-photo-open-passport')?.addEventListener('click', () => {
          this.openPilgrimagePassportModal('oracle_photos');
        });
      }
    } catch {
      document.body.classList.remove('clean-photo-capturing');
      this.showToast('Chụp ảnh kỷ niệm', 'Không thể chụp khung hình lúc này, cô bác thử lại sau nhé.', 3000, false);
    }
  },

  triggerPlayerGestureAction(gestureKey = 'vai') {
    const world = this.world3d;
    const bar = document.getElementById('gesture-action-bar');
    const barBtn = document.getElementById('btn-dock-gestures');
    if (bar && (gestureKey === 'chup_anh' || gestureKey === 'selfie')) {
      bar.style.display = 'none';
      document.body.classList.remove('gesture-bar-open');
      barBtn?.classList.remove('is-active');
      barBtn?.setAttribute('aria-expanded', 'false');
    }

    if (gestureKey === 'chup_anh') {
      world?.triggerActionAnimation?.('chup_anh', { duration: 2.6 });
      this.showToast('📸 Đang đưa máy lên chụp ảnh...', 'Giữ nguyên dáng đẹp giữa sân Chùa Vĩnh Tràng nhé!', 1200, false);
      clearTimeout(this._gesturePhotoTimer);
      this._gesturePhotoTimer = setTimeout(() => {
        this.captureCleanMemoryPhoto({ isSelfie: false });
      }, 650);
      return;
    }

    if (gestureKey === 'selfie') {
      world?.triggerActionAnimation?.('selfie', { duration: 3.4 });
      if (world) {
        world.selfieCamActive = true;
        world.syncPlayerTransform?.();
      }
      this.showToast('🤳 Đang quay góc Selfie...', 'Cười thật tươi cùng khung cảnh Chùa Vĩnh Tràng phía sau nhé!', 1300, false);
      clearTimeout(this._gesturePhotoTimer);
      this._gesturePhotoTimer = setTimeout(() => {
        this.captureCleanMemoryPhoto({ isSelfie: true });
        if (world) {
          world.selfieCamActive = false;
          world.syncPlayerTransform?.();
        }
      }, 950);
      return;
    }

    if (gestureKey === 'tro_chuyen') {
      const hasFamily = Boolean(world?.companionRecords?.length);
      if (!hasFamily) {
        // Warm family invitation modal when currently walking solo
        this.openModal(
          '💬 Nói Chuyện Cùng Bố Mẹ & Gia Đình',
          `
          <div class="elder-ritual-sheet">
            <p class="elder-sheet-subtitle">Hiện cô bác đang dạo chùa một mình. Mời bố mẹ và người thân cùng đi chùa để trò chuyện, lễ Phật và chụp ảnh Selfie chung nhé!</p>
            <div class="oracle-actions-row">
              <button type="button" class="passport-primary-btn" id="btn-invite-family-now">👨‍👩‍👧 Mời bố mẹ đi chùa cùng ngay</button>
              <button type="button" class="passport-outline-btn" id="btn-chat-nearby-now">🙏 Trò chuyện cùng khách hành hương</button>
            </div>
          </div>
          `
        );
        document.getElementById('btn-invite-family-now')?.addEventListener('click', () => {
          this.pilgrimageModeId = 'family_3gen';
          this.saveState?.();
          this.syncPilgrimageCompanionsTo3D?.();
          this.closeModal();
          setTimeout(() => this.triggerPlayerGestureAction('tro_chuyen'), 250);
        });
        document.getElementById('btn-chat-nearby-now')?.addEventListener('click', () => {
          this.closeModal();
          world?.triggerActionAnimation?.('tro_chuyen', { duration: 4.0 });
          this.playMokugyoTap?.();
          this.showToast(
            '💬 Hỏi thăm khách hành hương',
            '“A Di Đà Phật, hôm nay trời Mỹ Tho mát quá, cả nhà đi lễ chùa cầu bình an nhé!”',
            4200,
            false
          );
        });
        return;
      }

      world?.triggerActionAnimation?.('tro_chuyen', { duration: 4.2 });
      const familyLines = [
        'Mẹ cười hiền: “Chánh điện Chùa Vĩnh Tràng cổ kính quá con ơi, lát nữa cả nhà mình vào dâng hương rồi chụp chung tấm ảnh kỷ niệm nha!”',
        'Ba gật gù ngắm tượng Phật: “Vào chùa lòng thấy nhẹ hẳn, con nhớ đi thong thả thôi cho mẹ đỡ mỏi chân nghe con.”',
        'Mẹ dặn dò: “Chút ra hồ sen cả nhà mình thả hoa đăng cầu sức khỏe bình an cho ông bà và con cháu nhé!”',
        'Ba vui vẻ chỉ về phía Bảo Tháp: “Cảnh vườn tượng ngoài này rộng mát ghê, đứng đây selfie một tấm gửi về cho cả nhà xem đi con!”'
      ];
      const idx = (this._familyChatIdx || 0) % familyLines.length;
      this._familyChatIdx = idx + 1;
      this.playMokugyoTap?.();
      this.showToast('💬 Trò chuyện ấm áp cùng bố mẹ', familyLines[idx], 4600, false);
      return;
    }

    if (gestureKey === 'vai') {
      world?.triggerActionAnimation?.('vai', { duration: 2.6 });
      this.playBellTone?.(256, 2.0);
      this.showToast('🙏 Thành tâm vái lễ', 'Cúi đầu trang nghiêm hướng về Tam Bảo, nguyện tâm an lạc.', 2800, false);
      return;
    }

    if (gestureKey === 'vay_tay') {
      world?.triggerActionAnimation?.('vay_tay', { duration: 2.8 });
      this.showToast('👋 Vẫy tay chào thân thiện', 'Gửi nụ cười hoan hỷ chào bà con hành hương quanh sân chùa.', 2600, false);
      return;
    }

    if (gestureKey === 'quat_mat') {
      world?.triggerActionAnimation?.('quat_mat', { duration: 3.4 });
      this.showToast('🪷 Thong thả ngắm cảnh chùa', 'Gió mát sân cổ tự Mỹ Tho, ngắm hoa sen và mái ngói rêu phong.', 3000, false);
    }
  }
};
