/**
 * Modal chung (open/close) và gắn toàn bộ sự kiện (bindEvents).
 *
 * Mixin của ChuaOnlineApp: 3 method (openModal … bindEvents).
 * Được gắn vào class trong chua-online-app.mjs qua applyMixins().
 */
import { CHU_QUOC_ZONES, CHANH_DIEN_HISTORICAL_NOTES } from './shared.mjs';

export const modalAndEventsMethods = {
  /* ========================================================================
     MODAL HELPERS & GLOBAL EVENT BINDINGS
     ======================================================================== */
  openModal(title, htmlContent, opts = {}) {
    const modal = document.getElementById('universal-modal');
    const card = modal?.querySelector('.modal-card');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');
    if (!modal || !titleEl || !bodyEl) return;
    const variant = opts.variant || 'default';
    this.activeModalVariant = variant;

    modal.classList.toggle('store-mode', variant === 'store');
    if (card) {
      card.classList.toggle('scroll-modal', variant === 'scroll');
      card.classList.toggle('store-modal-card', variant === 'store');
      if (variant === 'scroll') {
        card.style.animation = 'none';
        void card.offsetWidth;
        card.style.animation = '';
      }
    }

    titleEl.textContent = title;
    bodyEl.innerHTML = htmlContent;
    modal.classList.add('open');
  },

  closeModal() {
    if (this._rhythmSession) {
      this._rhythmSession.active = false;
      if (this._rhythmSession.rafId) {
        cancelAnimationFrame(this._rhythmSession.rafId);
        this._rhythmSession.rafId = null;
      }
      this._rhythmSession = null;
    }
    if (this.mindfulnessTimer?.intervalId) {
      clearInterval(this.mindfulnessTimer.intervalId);
      this.mindfulnessTimer.intervalId = null;
      this.mindfulnessTimer.running = false;
    }
    if (this._arhatStageDispose) {
      try {
        this._arhatStageDispose();
      } catch {}
      this._arhatStageDispose = null;
    }
    if (this._profileStageDispose) {
      try {
        this._profileStageDispose();
      } catch {}
      this._profileStageDispose = null;
    }
    if (this._interactiveStageDispose) {
      try {
        this._interactiveStageDispose();
      } catch {}
      this._interactiveStageDispose = null;
    }
    const modal = document.getElementById('universal-modal');
    const card = modal?.querySelector('.modal-card');
    if (modal) {
      modal.classList.remove('open', 'store-mode');
    }
    if (card) {
      card.classList.remove('scroll-modal', 'store-modal-card');
    }
    if (this.storeProfile?.tryingItemId) {
      this.storeProfile.tryingItemId = null;
      this.syncStoreVisualsTo3D();
    }
    this.activeModalVariant = 'default';
  },

  bindEvents() {
    document.getElementById('btn-brand-home')?.addEventListener('click', () => {
      this.switchScreen('courtyard');
      if (this.world3d?.insideInterior) {
        this.toggleInteriorHallIn3D(false);
      }
      this.walkToStationIn3D('chanh_dien');
    });

    // Live 3D Title Overlay CTA & secondary buttons
    document.getElementById('btn-title-enter-temple')?.addEventListener('click', () => {
      this.enterTempleFromTitleOverlay();
    });
    document.getElementById('btn-title-change-char')?.addEventListener('click', () => {
      this.enterTempleFromTitleOverlay();
      this.openAccountModal();
    });
    document.getElementById('btn-title-google-signin')?.addEventListener('click', () => {
      if (this.cloudUser) this.openPilgrimagePassportModal('overview');
      else this.handleGoogleSignIn();
    });

    // Minimal 3-Zone Top Bar actions
    document.getElementById('nav-btn-auth')?.addEventListener('click', () => {
      if (this.cloudUser) {
        this.openPilgrimagePassportModal('overview');
      } else {
        this.handleGoogleSignIn();
      }
    });
    document.getElementById('nav-btn-utility-drawer')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleUtilityDrawer();
    });
    document.getElementById('btn-close-utility-drawer')?.addEventListener('click', () => {
      this.toggleUtilityDrawer(false);
    });
    document.getElementById('utility-drawer-backdrop')?.addEventListener('click', () => {
      this.toggleUtilityDrawer(false);
    });

    // Bottom-Center Collapsible Elderly Dock (includes Cửa hàng & Cử chỉ directly on main screen)
    document.getElementById('btn-dock-zen-toggle')?.addEventListener('click', () => {
      this.toggleZenHudMode();
    });
    document.getElementById('btn-guided-next')?.addEventListener('click', () => {
      this.executeGuidedNextStep();
    });
    document.getElementById('btn-dock-ritual')?.addEventListener('click', () => {
      this.openRitualQuickSheet();
    });
    document.getElementById('btn-dock-shop')?.addEventListener('click', () => {
      this.openConsolidatedShopModal();
    });
    document.getElementById('btn-dock-gestures')?.addEventListener('click', () => {
      const bar = document.getElementById('gesture-action-bar');
      const btn = document.getElementById('btn-dock-gestures');
      if (!bar) return;
      const open = bar.style.display === 'none' || !bar.style.display;
      bar.style.display = open ? 'flex' : 'none';
      document.body.classList.toggle('gesture-bar-open', open);
      btn?.classList.toggle('is-active', open);
      btn?.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('[data-gesture]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-gesture');
        if (key) this.triggerPlayerGestureAction?.(key);
      });
    });
    document.getElementById('btn-dock-passport')?.addEventListener('click', () => {
      this.openPilgrimagePassportModal('overview');
    });
    document.getElementById('btn-dock-sutra')?.addEventListener('click', () => {
      this.lectureTab = 'sutra';
      this.switchScreen('lecture');
    });

    // Slide-Out Utility Drawer actions
    document.getElementById('btn-drawer-interior')?.addEventListener('click', () => {
      this.toggleUtilityDrawer(false);
      this.toggleInteriorHallIn3D();
    });
    document.getElementById('btn-drawer-explore')?.addEventListener('click', () => {
      this.toggleUtilityDrawer(false);
      this.openExploreModal('stations');
    });
    document.getElementById('btn-drawer-oracle')?.addEventListener('click', () => {
      this.openDailyPeaceOracleModal();
    });
    document.getElementById('btn-drawer-lanterns')?.addEventListener('click', () => {
      this.openCommunityLanternModal(null);
    });
    document.getElementById('btn-drawer-blessing-tower')?.addEventListener('click', () => {
      this.toggleUtilityDrawer(false);
      this.openBlessingTowerModal();
    });
    document.getElementById('btn-drawer-photo')?.addEventListener('click', () => {
      this.captureCleanMemoryPhoto();
    });
    document.getElementById('btn-drawer-shop')?.addEventListener('click', () => {
      this.openConsolidatedShopModal();
    });
    document.getElementById('btn-drawer-lecture')?.addEventListener('click', () => {
      this.toggleUtilityDrawer(false);
      this.switchScreen('lecture');
    });
    document.getElementById('btn-drawer-character')?.addEventListener('click', () => {
      this.toggleUtilityDrawer(false);
      this.openAccountModal();
    });
    document.getElementById('btn-drawer-font-dec')?.addEventListener('click', () => {
      this.stepElderFontScale(-1);
    });
    document.getElementById('btn-drawer-font-inc')?.addEventListener('click', () => {
      this.stepElderFontScale(1);
    });
    document.getElementById('btn-drawer-cloud-auth')?.addEventListener('click', () => {
      if (this.cloudUser) this.handleGoogleSignOut();
      else this.handleGoogleSignIn();
    });

    document.querySelectorAll('[data-time-of-day]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-time-of-day');
        if (key) this.setTimeOfDay(key, false, true);
      });
    });
    document.getElementById('nav-btn-activity')?.addEventListener('click', () => {
      this.openActivityHubModal('checkin');
    });
    document.getElementById('nav-btn-merit')?.addEventListener('click', () => {
      this.openMeritSummaryModal();
    });
    document.getElementById('nav-btn-explore')?.addEventListener('click', () => {
      this.openExploreModal('stations');
    });
    document.getElementById('nav-btn-lecture')?.addEventListener('click', () => {
      this.switchScreen('lecture');
    });
    document.getElementById('nav-btn-store')?.addEventListener('click', () => {
      this.openNineTabStoreModal();
    });
    document.getElementById('nav-btn-account')?.addEventListener('click', () => {
      this.openAccountModal();
    });
    document.getElementById('nav-seasonal-pill')?.addEventListener('click', () => {
      this.openActivityHubModal('thirty_days');
    });

    const audioBtn = document.getElementById('nav-btn-audio');
    const audioPopover = document.getElementById('audio-mixer-popover');
    const visitorBtn = document.getElementById('hud-visitor-counter');
    const visitorPopover = document.getElementById('visitor-community-popover');

    const setAudioPopoverOpen = (open) => {
      if (!audioPopover || !audioBtn) return;
      audioPopover.style.display = open ? 'block' : 'none';
      audioBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    const setVisitorPopoverOpen = (open) => {
      if (!visitorPopover || !visitorBtn) return;
      visitorPopover.style.display = open ? 'block' : 'none';
      visitorBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) this.renderVisitorCounterHUD?.();
    };

    audioBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.ensureAudioContext();
      setVisitorPopoverOpen(false);
      const isOpen = audioPopover?.style.display === 'block';
      setAudioPopoverOpen(!isOpen);
      this.updateAudioMixerUI();
    });
    document.getElementById('btn-close-audio-mixer')?.addEventListener('click', () => {
      setAudioPopoverOpen(false);
    });

    visitorBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      setAudioPopoverOpen(false);
      const isOpen = visitorPopover?.style.display === 'block';
      setVisitorPopoverOpen(!isOpen);
    });
    document.getElementById('btn-close-visitor-popover')?.addEventListener('click', () => {
      setVisitorPopoverOpen(false);
    });

    document.addEventListener('click', (e) => {
      if (audioPopover && audioPopover.style.display === 'block') {
        if (!audioPopover.contains(e.target) && !audioBtn?.contains(e.target)) {
          setAudioPopoverOpen(false);
        }
      }
      if (visitorPopover && visitorPopover.style.display === 'block') {
        if (!visitorPopover.contains(e.target) && !visitorBtn?.contains(e.target)) {
          setVisitorPopoverOpen(false);
        }
      }
    });
    document.getElementById('hud-ambient-toggle')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleAmbientAudio();
    });
    document.getElementById('btn-mixer-ambient-toggle')?.addEventListener('click', () => {
      this.toggleAmbientAudio();
    });
    document.getElementById('chk-ambient-chanting')?.addEventListener('change', (e) => {
      this.toggleAmbientAudioLayer('chanting', Boolean(e.target?.checked));
    });
    document.getElementById('chk-ambient-bells')?.addEventListener('change', (e) => {
      this.toggleAmbientAudioLayer('bells', Boolean(e.target?.checked));
    });
    document.getElementById('chk-ambient-atmosphere')?.addEventListener('change', (e) => {
      this.toggleAmbientAudioLayer('atmosphere', Boolean(e.target?.checked));
    });
    document.getElementById('btn-audio-global-mute')?.addEventListener('click', () => {
      this.setAudioMuted(!this.audioMuted);
    });
    document.getElementById('slider-ambient-vol')?.addEventListener('input', (e) => {
      const val = Number(e.target?.value ?? 45) / 100;
      this.audio?.setAmbientVolume?.(val);
      this.saveAudioMixerState();
    });
    document.getElementById('slider-sfx-vol')?.addEventListener('input', (e) => {
      const val = Number(e.target?.value ?? 85) / 100;
      this.audio?.setSfxVolume?.(val);
      this.saveAudioMixerState();
    });
    document.getElementById('slider-voice-vol')?.addEventListener('input', (e) => {
      const val = Number(e.target?.value ?? 90) / 100;
      this.audio?.setVoiceVolume?.(val);
      this.saveAudioMixerState();
    });

    // Interior Square (Hình Vuông) + Hồ Sen Bộ + Trai Đường quick navigation bar + Cutaway & Historical Source modal
    document.querySelectorAll('[data-interior-zone]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const zone = btn.getAttribute('data-interior-zone');
        if (!zone || !this.world3d) return;
        this.world3d.goToInteriorZone(zone);
        this.highlightInteriorZoneChip(zone);
        const zoneNotes = {
          day_ban_tho_phai: [
            '1. Hành Lang Phải Mở Rộng · 8 Ban Thờ Phật & Lối Thông Ra Vườn Tượng',
            'Lối đi dài rộng thoáng với 8 ban thờ Phật & Bồ Tát thếp vàng bên tay phải, phòng khách – tủ kinh sách mở rộng và cổng vòm cuối đường thông thẳng ra vườn tượng Phật ngoài trời.'
          ],
          nghin_mat_nghin_tay: [
            '🙏 Ban Tượng Phật Nghìn Mắt Nghìn Tay',
            'Tôn tượng Đức Thiên Thủ Thiên Nhãn Quán Thế Âm thếp vàng uy nghiêm tại dải bàn thờ hành lang Đông.'
          ],
          cho_ngu_cua_phat: [
            '🪷 Chỗ Ngủ Của Phật · Đức Phật Nhập Niết Bàn',
            'Khám thờ long sàng chạm trổ thếp vàng tôn trí Đức Phật an nhiên Cát Tường Ngoạ.'
          ],
          chanh_dien: [
            '2. Chính Điện Đại Hùng Bửu Điện · Phật Ở Giữa & 18 La Hán Xung Quanh',
            'Tôn tượng Tam Bảo an vị chính giữa Chánh Điện quay mặt hướng ra Cổng Tam Quan; từ cửa đối diện Hòn Non Bộ bỏ dép bên ngoài rồi đi vòng hai bên qua 18 Vị La Hán lên phía trước lễ Phật.'
          ],
          ho_sen_bo: [
            '3. Giữa Hình Vuông · Hồ Sen Bộ & Hòn Non Bộ',
            'Khoảng sân thiên tỉnh mở chính giữa bốn dãy vòm vàng Pháp–Việt nhìn thẳng sang cửa gỗ vào Chánh Điện, kệ bỏ dép và Trống Bát Nhã — bước vào và đi vòng hai bên để chiêm bái Phật quay ra Cổng Tam Quan.'
          ],
          hanh_lang_trai: [
            '4. Cạnh Trên Hình Vuông · Tổ Đường Rộng Thoáng',
            'Hành lang phía Bắc thông thoáng với Ban Thờ Sơ Tổ Bồ Đề Đạt Ma và Chư Tổ Khai Sơn.'
          ],
          hanh_lang_duoi: [
            '5. Cạnh Dưới Hình Vuông · Hành Lang Nam',
            'Hành lang phía Nam rộng rãi kết nối lối vào góc phải sang Hồ Sen Bộ và cửa vào Chánh Điện.'
          ],
          trai_duong: [
            '🪑 Phòng Tiếp Khách · Tủ Kinh Sách Mở Rộng Bên Phải',
            'Không gian mở rộng thoáng đãng bên tay phải dải bàn thờ với cửa sổ vòm lá sách xanh, tủ kinh sách, bộ trường kỷ và ghế nghỉ chân.'
          ]
        };
        const msg = zoneNotes[zone];
        if (msg) this.showToast(msg[0], msg[1], 4000, false);
      });
    });
    document.getElementById('btn-interior-cutaway')?.addEventListener('click', () => {
      if (!this.world3d) return;
      const on = this.world3d.setInteriorCutaway();
      const btn = document.getElementById('btn-interior-cutaway');
      if (btn) btn.classList.toggle('active', on);
      this.showToast(
        on ? '✂️ Đang bật Mặt cắt Kiến trúc Hình Vuông 3D' : '🏛️ Trở lại góc nhìn tham quan trực tiếp',
        on
          ? 'Ẩn trần mái để quan sát trọn vẹn mặt bằng Hình Vuông: Lối Góc Dưới Bên Phải, Dải Bàn Thờ, Chính Điện cạnh trên và Hồ Sen Bộ ở giữa.'
          : 'Đã khôi phục hệ mái ngói và trần gỗ nguyên bản bên trong Chùa Chính.',
        4200,
        false
      );
    });
    document.getElementById('btn-interior-history')?.addEventListener('click', () => {
      const notes = CHANH_DIEN_HISTORICAL_NOTES;
      this.openModal(
        notes.title,
        `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <p style="font-size:14px;line-height:1.55;color:#4A3222;background:#fff8eb;padding:12px 14px;border-radius:14px;border:1.5px solid rgba(201,150,46,0.45);">
            ${notes.note}
          </p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;">
            ${notes.sources
              .map(
                (src) => `
              <div style="background:#fffdf8;border:1.5px solid #C9962E;border-radius:16px;padding:14px;">
                <div style="font-size:14.5px;font-weight:800;color:#7E2A22;margin-bottom:6px;">${src.sourceTitle}</div>
                <p style="font-size:13.5px;line-height:1.5;color:#3E2A1A;">${src.summary}</p>
              </div>
            `
              )
              .join('')}
          </div>
          <div style="background:#f5edd9;border-radius:16px;padding:14px;border:1px solid rgba(126,42,34,0.22);">
            <div style="font-size:14px;font-weight:800;color:#5C381F;margin-bottom:8px;">Mặt bằng 6 không gian Chữ Quốc (國) bên trong Chùa Chính</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;">
              ${CHU_QUOC_ZONES.map(
                (z) => `
                <div style="background:#fffdf8;padding:9px 11px;border-radius:12px;border:1px solid rgba(140,100,60,0.25);">
                  <div style="font-size:13px;font-weight:800;color:#5C381F;">${z.name}</div>
                  <div style="font-size:12px;color:#52361c;margin-top:2px;line-height:1.4;">${z.subtitle}</div>
                </div>
              `
              ).join('')}
            </div>
          </div>
        </div>
        `
      );
    });
    document.getElementById('btn-interior-blessing-tower')?.addEventListener('click', () => {
      this.openBlessingTowerModal();
    });
    document.getElementById('btn-interior-exit-courtyard')?.addEventListener('click', () => {
      this.toggleInteriorHallIn3D(false);
    });

    // Quick-Walk 3D Landmark Bar
    document.querySelectorAll('[data-walk-station]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const stKey = btn.getAttribute('data-walk-station');
        if (!stKey) return;
        if (this.world3d?.insideInterior) {
          this.toggleInteriorHallIn3D(false);
        }
        this.walkToStationIn3D(stKey);
      });
    });

    document.getElementById('btn-toggle-interior-hall')?.addEventListener('click', () => {
      this.toggleInteriorHallIn3D();
    });

    // Bottom-Left Quick Pilgrimage & Controls Dock
    const quickDockEl = document.getElementById('courtyard-quick-dock');
    const toggleQuickDockBtn = document.getElementById('btn-toggle-quick-dock');
    const quickChipsEl = document.getElementById('quick-dock-chips');
    const quickChevronEl = document.getElementById('quick-dock-chevron');
    let userToggledQuickDock = false;
    const setQuickChipsExpanded = (expanded) => {
      if (!quickDockEl || !toggleQuickDockBtn || !quickChipsEl) return;
      quickDockEl.classList.toggle('chips-collapsed', !expanded);
      toggleQuickDockBtn.classList.toggle('active', expanded);
      toggleQuickDockBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      if (quickChevronEl) quickChevronEl.textContent = expanded ? '▾' : '▸';
    };
    const syncQuickDockViewport = () => {
      if (userToggledQuickDock) return;
      setQuickChipsExpanded(window.innerWidth > 768);
    };
    syncQuickDockViewport();
    window.addEventListener('resize', syncQuickDockViewport);
    toggleQuickDockBtn?.addEventListener('click', () => {
      userToggledQuickDock = true;
      const nextExpanded = quickDockEl?.classList.contains('chips-collapsed');
      setQuickChipsExpanded(Boolean(nextExpanded));
    });

    const toggleDpadBtn = document.getElementById('btn-toggle-dpad');
    const dpadPadEl = document.getElementById('courtyard-dpad-pad');
    toggleDpadBtn?.addEventListener('click', () => {
      if (!dpadPadEl || !toggleDpadBtn) return;
      const nextShow = dpadPadEl.style.display === 'none';
      dpadPadEl.style.display = nextShow ? 'grid' : 'none';
      toggleDpadBtn.classList.toggle('active', nextShow);
      toggleDpadBtn.setAttribute('aria-expanded', nextShow ? 'true' : 'false');
    });

    const toggleHelpBtn = document.getElementById('btn-toggle-controls-help');
    const helpPopoverEl = document.getElementById('courtyard-help-popover');
    const setHelpOpen = (open) => {
      if (!helpPopoverEl || !toggleHelpBtn) return;
      helpPopoverEl.style.display = open ? 'block' : 'none';
      toggleHelpBtn.classList.toggle('active', open);
      toggleHelpBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    toggleHelpBtn?.addEventListener('click', () => {
      setHelpOpen(helpPopoverEl?.style.display === 'none');
    });
    document.getElementById('btn-close-controls-help')?.addEventListener('click', () => {
      setHelpOpen(false);
    });

    document.querySelectorAll('[data-dpad-dir]').forEach((btn) => {
      const dir = btn.getAttribute('data-dpad-dir');
      if (!dir) return;
      const startHold = (e) => {
        e.preventDefault();
        btn.classList.add('pressed');
        this.world3d?.setHeldDirection(dir, true);
        if (!this.world3d) {
          this.handleMoveDirection(dir);
        }
      };
      const endHold = () => {
        btn.classList.remove('pressed');
        this.world3d?.setHeldDirection(dir, false);
      };
      btn.addEventListener('pointerdown', startHold);
      btn.addEventListener('pointerup', endHold);
      btn.addEventListener('pointerleave', endHold);
      btn.addEventListener('pointercancel', endHold);
    });

    // Scene Pins in 3D Courtyard
    document.getElementById('pin-chanh-dien')?.addEventListener('click', () => {
      const pos = this.world3d?.playerPos || this.playerPos;
      const dist = Math.hypot((pos?.x || 0) - 23, (pos?.z || 0) - 7.8);
      if (dist < 10.5 && !this.world3d?.insideInterior) {
        this.toggleInteriorHallIn3D(true);
      } else {
        this.walkToStationIn3D('chanh_dien');
      }
    });
    document.getElementById('pin-ho-sen')?.addEventListener('click', () => {
      this.walkToStationIn3D('ho_sen_ca_koi');
    });
    document.getElementById('pin-phat-adida')?.addEventListener('click', () => {
      this.walkToStationIn3D('phat_adida');
    });
    document.getElementById('pin-phat-dilac')?.addEventListener('click', () => {
      this.walkToStationIn3D('phat_di_lac');
    });
    document.getElementById('pin-cua-hang')?.addEventListener('click', () => {
      this.openMarketplaceStallModal('huong_hoa', 'Nhà Tạp Hóa Cổng Chùa Vĩnh Tràng');
    });
    document.getElementById('stall-proximity-btn')?.addEventListener('click', () => {
      this.handleProximityInteract();
    });
    document.getElementById('btn-npc-next-quote')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.cycleNpcSpeechQuote?.();
    });
    document.getElementById('btn-npc-close-quote')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dismissNpcSpeechBubble?.();
    });
    document.getElementById('btn-toggle-goals-tracker')?.addEventListener('click', () => {
      this.goalsTrackerCollapsed = !this.goalsTrackerCollapsed;
      this.saveState();
      this.refreshGoalsTrackerHUD();
    });
    document.getElementById('btn-open-hoc-kinh')?.addEventListener('click', () => {
      this.lectureTab = 'sutra';
      this.switchScreen('lecture');
    });
    document.getElementById('btn-open-garden-modal')?.addEventListener('click', () => {
      this.openTempleGardenModal(0);
    });
    document.getElementById('btn-open-bell-rhythm')?.addEventListener('click', () => {
      this.openBellRhythmModal();
    });
    document.getElementById('btn-open-heritage-book')?.addEventListener('click', () => {
      this.openHeritageBookModal();
    });
    document.getElementById('btn-open-blessing-tower')?.addEventListener('click', () => {
      this.openBlessingTowerModal();
    });
    document.getElementById('btn-open-hoa-dang')?.addEventListener('click', () => {
      this.openHoaDangModal();
    });
    document.getElementById('btn-open-30day')?.addEventListener('click', () => {
      this.openActivityHubModal('thirty_days');
    });
    document.getElementById('btn-open-journal')?.addEventListener('click', () => {
      this.openActivityHubModal('journal');
    });
    document.getElementById('btn-skip-entrance-tour')?.addEventListener('click', () => {
      this.world3d?.cancelEntranceTour();
    });
    document.getElementById('btn-skip-arrival-cutscene')?.addEventListener('click', () => {
      this.world3d?.skipArrivalCutscene?.(false);
      const b = document.getElementById('arrival-cutscene-banner');
      if (b) b.style.display = 'none';
      this.syncPilgrimageCompanionsTo3D();
    });
    document.getElementById('pin-giang-duong')?.addEventListener('click', () => {
      this.switchScreen('lecture');
    });
    document.getElementById('btn-ugc-milestone-hud')?.addEventListener('click', () => {
      this.openUGCStudioModal();
    });
    document.getElementById('protagonist-hotspot')?.addEventListener('click', () => {
      this.openAccountModal();
    });

    document.getElementById('btn-open-2d-map')?.addEventListener('click', () => {
      this.openExploreModal('stations');
    });

    const keyMap = {
      ArrowUp: 'up',
      KeyW: 'up',
      ArrowDown: 'down',
      KeyS: 'down',
      ArrowLeft: 'left',
      KeyA: 'left',
      ArrowRight: 'right',
      KeyD: 'right'
    };

    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) return;
      if (!this.titleOverlayDismissed && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        this.enterTempleFromTitleOverlay();
        return;
      }
      if (e.code === 'KeyH' && this.activeScreen === 'courtyard' && this.titleOverlayDismissed) {
        const modalOpen = document.getElementById('universal-modal')?.classList.contains('open');
        if (!modalOpen) {
          e.preventDefault();
          this.toggleZenHudMode();
          return;
        }
      }
      if (e.code === 'Space' && this.sutraCtrl?.isVisibleAndActive?.() && this.sutraCtrl.mode === 'chant') {
        e.preventDefault();
        this.sutraCtrl.tapWoodenMo();
        return;
      }
      if (e.code === 'Space' && this._rhythmSession?.active && typeof this._rhythmSession.strike === 'function') {
        e.preventDefault();
        this._rhythmSession.strike();
        return;
      }
      const dir = keyMap[e.code];
      if (dir && this.activeScreen === 'courtyard' && this.titleOverlayDismissed) {
        e.preventDefault();
        this.world3d?.setHeldDirection(dir, true);
        if (!e.repeat && !this.world3d) {
          this.handleMoveDirection(dir);
        }
      } else if (e.code === 'KeyE' && this.activeScreen === 'courtyard' && this.titleOverlayDismissed) {
        if (this.handleProximityInteract()) {
          e.preventDefault();
        }
      } else if (e.code === 'Escape') {
        this.toggleUtilityDrawer(false);
        this.closeModal();
      }
    });

    window.addEventListener('keyup', (e) => {
      const dir = keyMap[e.code];
      if (dir) {
        this.world3d?.setHeldDirection(dir, false);
      }
    });

    window.addEventListener('blur', () => {
      this.world3d?.clearHeldDirections();
    });

    // Bottom-Right 4 Spiritual Action Buttons
    document.getElementById('act-le-phat')?.addEventListener('click', () => this.triggerLePhat());
    document.getElementById('act-dang-huong')?.addEventListener('click', () => this.triggerDangHuong());
    document.getElementById('act-dang-hoa')?.addEventListener('click', () => this.triggerDangHoa());
    document.getElementById('act-niem-phat')?.addEventListener('click', () => this.triggerNiemPhat());

    // Shop Screen Controls
    document.querySelectorAll('[data-shop-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-shop-tab');
        if (tab) {
          this.shopTab = tab;
          this.renderShopProducts();
        }
      });
    });
    document.getElementById('shop-nav-kiosk3d')?.addEventListener('click', () => {
      this.openProductDetailModal('mo_hinh_cua_hang_3d');
    });
    document.getElementById('btn-open-cart')?.addEventListener('click', () => this.openCartModal());
    document.getElementById('btn-shop-support')?.addEventListener('click', () => {
      this.openModal(
        'Hỗ trợ & hướng dẫn mua quà lưu niệm',
        `
        <div style="display:flex;flex-direction:column;gap:10px;font-size:15px;line-height:1.55;color:#3d2410;">
          <p><strong>1. Quà lưu niệm giao tận nhà:</strong> Các món quà tại Chùa Vĩnh Tràng được gói cẩn thận và giao toàn quốc (miễn phí giao hàng cho đơn từ 300.000đ).</p>
          <p><strong>2. Xem trước 3D:</strong> Bấm <em>Xem chi tiết</em> ở mỗi món quà để xoay xem các góc và mang thử lên nhân vật của bạn.</p>
          <p><strong>3. Liên hệ hỗ trợ:</strong> Tổng đài <strong>1900 6868</strong> (07:00 – 20:00 mỗi ngày).</p>
        </div>
        `
      );
    });
    document.getElementById('btn-shop-back-home')?.addEventListener('click', () => this.switchScreen('courtyard'));
    document.getElementById('btn-shop-return-courtyard')?.addEventListener('click', () => this.switchScreen('courtyard'));
    document.getElementById('shop-nav-explore')?.addEventListener('click', () => this.openExploreModal('stations'));
    document.getElementById('shop-nav-lecture')?.addEventListener('click', () => this.switchScreen('lecture'));
    document.getElementById('shop-nav-account')?.addEventListener('click', () => this.openAccountModal());

    // Lecture Screen Controls
    document.getElementById('btn-lecture-back')?.addEventListener('click', () => this.switchScreen('courtyard'));
    document.getElementById('btn-lecture-font-dec')?.addEventListener('click', () => this.stepElderFontScale(-1));
    document.getElementById('btn-lecture-font-inc')?.addEventListener('click', () => this.stepElderFontScale(1));
    document.getElementById('btn-lecture-speed-toggle')?.addEventListener('click', () => {
      this.readAlongRate = this.readAlongRate === 0.85 ? 1.0 : 0.85;
      this.audio?.setVoicePlaybackRate?.(this.readAlongRate);
      const btn = document.getElementById('btn-lecture-speed-toggle');
      if (btn) {
        btn.textContent = `🐢 ${this.readAlongRate === 0.85 ? '0.85x Chậm' : '1.0x Chuẩn'}`;
      }
      this.saveState();
      this.playMokugyoTap();
      if (this.lectureTab === 'listen' || this.lectureTab === 'lesson') {
        this.renderLectureStage();
      }
      this.showToast(
        '🎙️ Đã chỉnh tốc độ Thầy đọc',
        this.readAlongRate === 0.85
          ? 'Tốc độ 0.85x (Chậm rãi, rõ chữ, phù hợp cô bác lớn tuổi).'
          : 'Tốc độ 1.0x (Nhịp đọc chuẩn).',
        3000,
        false
      );
    });
    document.getElementById('btn-lecture-daily-dharma')?.addEventListener('click', () => this.showDailyDharmaModal({ markSeenToday: false }));
    document.getElementById('btn-lecture-textbooks')?.addEventListener('click', () => this.openTextbooksModal());
    document.getElementById('btn-lecture-recordings')?.addEventListener('click', () => this.openAudioRecordingsModal());
    document.querySelectorAll('[data-lecture-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-lecture-tab');
        if (tab) {
          if (tab !== 'sutra') {
            this.sutraCtrl?.stopAllPlayback?.();
          }
          this.lectureTab = tab;
          this.renderLectureStage();
        }
      });
    });

    // Modal close events
    document.getElementById('modal-close-btn')?.addEventListener('click', () => this.closeModal());
    document.getElementById('universal-modal')?.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'universal-modal') {
        this.closeModal();
      }
    });
  }
};
