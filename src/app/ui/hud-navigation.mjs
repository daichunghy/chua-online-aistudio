/**
 * Toast, chuyển màn hình, giờ, cỡ chữ, HUD huy hiệu & mục tiêu.
 *
 * Mixin của ChuaOnlineApp: 12 method (showToast … refreshGoalsTrackerHUD).
 * Được gắn vào class trong chua-online-app.mjs qua applyMixins().
 */
import { stepPlayerMovement, findNearestStation, recordSpiritualMilestone, checkUGCMilestoneUnlock, calculateCartSummary, getLocalDateKey, calculateMeritSummary, TIME_OF_DAY_PRESETS, WEATHER_PRESETS, CAMERA_VIEW_MODES, STREET_ENCOUNTERS, getTempleScheduleSlot, RANDOM_ENCOUNTERS, CONG_QUA_TASKS, HERITAGE_PHOTO_SPOTS, completeRandomEncounter, completeCongQuaTask, getPilgrimageDepthSummary, ensureDailyMissionDate, getDailyMissionsWithProgress, claimDailyMissionReward, getExplorationChaptersStatus, getQuestsWithProgress, getMailboxWithStatus, getPilgrimRankInfo, buildVisitorPresenceSummary } from './shared.mjs';

export const hudNavigationMethods = {
  showToast(title, desc, durationMs = 4500, showCheckinBtn = false) {
    const toast = document.getElementById('ritual-toast');
    const tTitle = document.getElementById('toast-title');
    const tDesc = document.getElementById('toast-desc');
    if (!toast || !tTitle || !tDesc) return;
    tTitle.textContent = title;
    const status = checkUGCMilestoneUnlock(this.spiritual, this.completedLessons.size);
    if (showCheckinBtn && status.unlocked) {
      tDesc.innerHTML = `
        <div>${desc}</div>
        <button id="btn-toast-open-ugc" style="margin-top:8px;padding:6px 14px;border-radius:999px;border:1.5px solid #fbe09c;background:linear-gradient(180deg,#d96b27 0%,#9e3810 100%);color:#fff;font-size:12.5px;font-weight:700;cursor:pointer;">
          Lưu ảnh kỷ niệm tại chùa →
        </button>
      `;
      document.getElementById('btn-toast-open-ugc')?.addEventListener('click', () => {
        toast.classList.remove('visible');
        this.openUGCStudioModal();
      });
    } else {
      tDesc.textContent = desc;
    }
    toast.classList.add('visible');
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
    }, durationMs);
  },

  /* ========================================================================
     REAL-TIME 3D MOVEMENT & NAVIGATION (Touch & Keyboard WASD/Arrows)
     ======================================================================== */
  handleMoveDirection(dir) {
    const dirMap = {
      up: { dx: 0, dz: -1 },
      down: { dx: 0, dz: 1 },
      left: { dx: -1, dz: 0 },
      right: { dx: 1, dz: 0 }
    };
    const vec = dirMap[dir];
    if (!vec) return;

    if (this.world3d) {
      this.world3d.nudgeDirection(dir, 1.55);
      this.playerPos = {
        x: Number(this.world3d.playerPos.x.toFixed(2)),
        z: Number(this.world3d.playerPos.z.toFixed(2)),
        yaw: Number(this.world3d.playerYaw.toFixed(2)),
        moving: true
      };
    } else {
      this.playerPos = stepPlayerMovement(this.playerPos, vec, 1.2);
    }

    const nearest = findNearestStation(this.playerPos);
    if (nearest.distance < 4.8) {
      this.activeStationKey = nearest.station.key;
      this.highlightActiveWalkChip(nearest.station.key);
      if (!this.spiritual.visitedStations.includes(nearest.station.id)) {
        this.spiritual.visitedStations.push(nearest.station.id);
        this.spiritual = recordSpiritualMilestone(
          this.spiritual,
          `Ghé thăm ${nearest.station.name}`
        );
        this.saveState();
        this.showToast(
          nearest.station.name,
          nearest.station.subtitle,
          3800,
          false
        );
      }
    }
  },

  switchScreen(screenName) {
    this.activeScreen = screenName;
    const isCourtyard = screenName === 'courtyard';
    const shopEl = document.getElementById('shop-screen');
    const lectureEl = document.getElementById('lecture-screen');
    const pinsLayer = document.getElementById('scene-pins-layer');
    const quickDock = document.getElementById('courtyard-quick-dock');
    const topHud = document.getElementById('main-top-hud');
    const elderDock = document.getElementById('elder-bottom-dock');
    const softJoystick = document.getElementById('soft-joystick-zone');
    const spiritualBar = document.getElementById('spiritual-actions-bar');
    const goalsTracker = document.getElementById('daily-goals-tracker');
    const topRightCluster = document.getElementById('hud-topright-cluster');
    const visitorCounter = document.getElementById('hud-visitor-counter');
    const visitorPopover = document.getElementById('visitor-community-popover');
    if (shopEl) shopEl.classList.toggle('open', screenName === 'shop');
    if (lectureEl) lectureEl.classList.toggle('open', screenName === 'lecture');
    if (quickDock) quickDock.style.display = isCourtyard ? 'flex' : 'none';
    if (topHud) topHud.style.display = isCourtyard ? 'flex' : 'none';
    if (elderDock) elderDock.style.display = isCourtyard ? 'flex' : 'none';
    if (softJoystick) softJoystick.style.display = isCourtyard ? 'flex' : 'none';
    if (spiritualBar) spiritualBar.style.display = isCourtyard ? 'flex' : 'none';
    if (goalsTracker) goalsTracker.style.display = isCourtyard ? 'flex' : 'none';
    if (topRightCluster) topRightCluster.style.display = isCourtyard ? 'inline-flex' : 'none';
    if (!isCourtyard) {
      this.toggleUtilityDrawer?.(false);
    }
    if (!isCourtyard && visitorPopover) {
      visitorPopover.style.display = 'none';
      visitorCounter?.setAttribute('aria-expanded', 'false');
    }
    if (pinsLayer && !this.world3d?.insideInterior) {
      pinsLayer.style.display = isCourtyard ? 'block' : 'none';
    }
    this.syncVisitorPresence?.();

    if (screenName !== 'lecture') {
      this.stopLectureSpeech();
      this.sutraCtrl?.stopAllPlayback?.();
    }
    this.world3d?.setLectureHallMode?.(screenName === 'lecture');
    this.audio?.setAmbientZone?.(
      screenName === 'lecture' || this.world3d?.insideInterior
        ? 'interior'
        : this.world3d?._lastSpatialAudioZone || 'courtyard'
    );

    if (screenName === 'shop') {
      this.renderShopProducts();
    } else if (screenName === 'lecture') {
      this.renderLectureStage();
    }
  },

  setTimeOfDay(presetKey, immediate = false, showNotice = true) {
    const preset = TIME_OF_DAY_PRESETS[presetKey];
    if (!preset) return;
    this.timeOfDay = preset.key;
    if (typeof document !== 'undefined') {
      document.body.dataset.timeOfDay = preset.key;
    }
    document.querySelectorAll('[data-time-of-day]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-time-of-day') === preset.key);
    });
    this.world3d?.setTimeOfDay?.(preset.key, immediate);
    this.saveState();
    if (showNotice) {
      const slot = getTempleScheduleSlot(preset.key);
      const bellFreq =
        preset.key === 'evening' ? 216 : preset.key === 'sunset' ? 240 : preset.key === 'midday' ? 288 : 256;
      this.playBellTone(bellFreq, 1.6);
      this.showToast(
        `${preset.icon} ${slot.clockLabel} · ${slot.title}`,
        slot.activitySummary || preset.subtitle,
        3600,
        false
      );
    }
  },

  setCameraViewModeInApp(mode, showNotice = true) {
    const normalized = mode === 'first' ? 'first' : 'third';
    this.cameraViewMode = normalized;
    if (typeof document !== 'undefined') {
      document.body.dataset.cameraMode = normalized;
      document.querySelectorAll('[data-camera-mode]').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-camera-mode') === normalized);
      });
    }
    this.world3d?.setCameraViewMode?.(normalized, false);
    if (showNotice) {
      const info = CAMERA_VIEW_MODES[normalized];
      this.playMokugyoTap?.();
      this.showToast(
        `${info.icon} ${info.label}`,
        normalized === 'first'
          ? 'Kéo chuột hoặc chạm xoay góc nhìn quanh sân chùa, bấm phím V để trở lại góc nhìn thứ ba.'
          : 'Đã trở về góc nhìn thứ ba quen thuộc để quan sát nhân vật và toàn cảnh sân chùa.',
        3000,
        false
      );
    }
  },

  toggleCameraViewModeInApp() {
    const next = this.cameraViewMode === 'first' ? 'third' : 'first';
    this.setCameraViewModeInApp(next, true);
  },

  setWeatherPresetInApp(presetKey, showNotice = true) {
    const preset = WEATHER_PRESETS[presetKey] || WEATHER_PRESETS.clear;
    this.weatherPreset = preset.key;
    if (typeof document !== 'undefined') {
      document.body.dataset.weather = preset.key;
      document.querySelectorAll('[data-weather-preset]').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-weather-preset') === preset.key);
      });
    }
    this.world3d?.setWeatherPreset?.(preset.key, false);
    this.audio?.setRainIntensity?.(preset.rainIntensity);
    if (showNotice) {
      this.playBellTone(preset.key === 'rain' ? 216 : 288, 1.5);
      this.showToast(`${preset.icon} Thời tiết: ${preset.label}`, preset.subtitle, 3400, false);
    }
  },

  openStreetEncounterModal(encounterId) {
    const enc = STREET_ENCOUNTERS.find((e) => e.id === encounterId) || STREET_ENCOUNTERS[0];
    if (!enc) return;

    if (enc.id === 'xe_ca_rem') {
      this.playBellTone(396, 1.2);
      const html = `
        <div style="display:flex;flex-direction:column;gap:14px;color:#3d2410;font-size:15px;line-height:1.58;">
          <div style="background:linear-gradient(135deg,#fff8e8,#f7ead0);border:1.5px solid #d5a94c;border-radius:16px;padding:14px 16px;">
            <div style="font-size:17px;font-weight:800;color:#8c3214;margin-bottom:6px;">🍦 ${enc.title}</div>
            <p style="margin:0;">Tiếng chuông leng keng quen thuộc vang lên bên trụ cổng phụ <strong>Tịnh Độ Huyền Môn</strong>. Chú bán cà rem đẩy chiếc thùng gỗ sơn vàng–đỏ từ sáng sớm để phục vụ bà con đi lễ chùa giải nhiệt dưới nắng Mỹ Tho.</p>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:10px;">
            <button type="button" class="passport-primary-btn" data-carem-flavor="Cà rem dừa đậu phộng" style="min-height:50px;">🥥 Cà rem dừa béo (5.000đ)</button>
            <button type="button" class="passport-primary-btn" data-carem-flavor="Cà rem đậu xanh mát lạnh" style="min-height:50px;">🫘 Cà rem đậu xanh (5.000đ)</button>
            <button type="button" class="passport-primary-btn" data-carem-flavor="Cà rem sầu riêng Mỹ Tho" style="min-height:50px;">🍈 Cà rem sầu riêng (7.000đ)</button>
          </div>
          <p style="font-size:13.5px;color:#6b4d2e;margin:0;">Mẹo nhỏ: Thưởng thức xong nhớ bỏ que kem đúng nơi quy định để giữ sạch cổng chùa nhé cô bác!</p>
        </div>
      `;
      this.openModal(enc.title, html);
      document.querySelectorAll('[data-carem-flavor]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const flavor = btn.getAttribute('data-carem-flavor') || 'Cà rem dừa';
          this.playBellTone(440, 1.1);
          this.spiritual = recordSpiritualMilestone(this.spiritual, `Ghé xe cà rem cổng chùa (${flavor})`);
          this.saveState();
          this.closeModal();
          this.showToast(
            `🍦 Mát lạnh ${flavor}`,
            'Hương vị ngọt thanh đặc trưng miền Tây trước cổng Chùa Vĩnh Tràng. Chúc cô bác vãn cảnh an vui!',
            3800,
            false
          );
        });
      });
      return;
    }

    // Cô Bán Nón Lá Ven Cổng
    const wearingHat = Boolean(this.spiritual?.equippedItems?.hat === 'non_la_theu_sen');
    const html = `
      <div style="display:flex;flex-direction:column;gap:14px;color:#3d2410;font-size:15px;line-height:1.58;">
        <div style="background:linear-gradient(135deg,#fff8e8,#f5ebd4);border:1.5px solid #c9962e;border-radius:16px;padding:14px 16px;">
          <div style="font-size:17px;font-weight:800;color:#7a3812;margin-bottom:6px;">👒 ${enc.title}</div>
          <p style="margin:0;">Bên trụ cổng khảm sành sứ, cô bán nón lá chằm tay miền Tây xếp từng chồng nón mới trắng ngần, quai lụa tím và đỏ cho khách hành hương che nắng hoặc che mưa rào khi dạo quanh vườn tượng Phật.</p>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;">
          <button type="button" class="passport-primary-btn" id="btn-street-toggle-nonla" style="flex:1;min-height:50px;">
            ${wearingHat ? '👒 Cất nón lá tạm thời' : '👒 Đội thử Nón Lá đi lễ chùa'}
          </button>
          <button type="button" class="drawer-action-btn" id="btn-street-open-shop" style="flex:1;min-height:50px;justify-content:center;">
            <span>🛍️ Xem thêm trong Cửa hàng</span>
          </button>
        </div>
      </div>
    `;
    this.openModal(enc.title, html);
    document.getElementById('btn-street-toggle-nonla')?.addEventListener('click', () => {
      if (!this.spiritual.equippedItems) this.spiritual.equippedItems = {};
      const nextHat = this.spiritual.equippedItems.hat === 'non_la_theu_sen' ? null : 'non_la_theu_sen';
      this.spiritual.equippedItems.hat = nextHat;
      this.syncStoreVisualsTo3D?.();
      this.spiritual = recordSpiritualMilestone(
        this.spiritual,
        nextHat ? 'Đội nón lá ven cổng Chùa Vĩnh Tràng' : 'Tháo nón lá khi vãn cảnh'
      );
      this.saveState();
      this.closeModal();
      this.playMokugyoTap?.();
      this.showToast(
        nextHat ? '👒 Đã đội Nón Lá miền Tây' : '👒 Đã cất Nón Lá',
        nextHat
          ? 'Chiếc nón lá che nắng mưa dịu dàng đã được đội lên nhân vật 3D của bạn.'
          : 'Bạn có thể đội lại bất cứ lúc nào khi ghé cô bán nón lá ven cổng.',
        3400,
        false
      );
    });
    document.getElementById('btn-street-open-shop')?.addEventListener('click', () => {
      this.closeModal();
      this.openConsolidatedShopModal?.();
    });
  },

  openRandomEncounterModal(encounterId) {
    const enc = RANDOM_ENCOUNTERS.find((e) => e.id === encounterId) || RANDOM_ENCOUNTERS[0];
    if (!enc) return;
    const alreadyDone = Boolean(this.pilgrimageDepth?.completedEncounters?.includes(enc.id));
    this.playBellTone(324, 1.4);
    const html = `
      <div style="display:flex;flex-direction:column;gap:14px;color:#3d2410;font-size:15px;line-height:1.6;">
        <div style="background:linear-gradient(135deg,#fffaf0,#f7ebd2);border:1.5px solid #d5a94c;border-radius:16px;padding:16px 18px;">
          <div style="font-size:13px;font-weight:800;color:#8c4a14;text-transform:uppercase;letter-spacing:0.04em;">${enc.icon} Gặp gỡ hữu duyên · ${enc.speaker}</div>
          <div style="font-size:18px;font-weight:800;color:#5C2C14;margin:4px 0 8px;">${enc.title}</div>
          <p style="margin:0;font-style:italic;color:#3a2210;">${enc.story}</p>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
          <button type="button" id="btn-complete-random-enc" class="passport-primary-btn" style="flex:1;min-height:50px;">
            ${alreadyDone ? '✓ Đã kết duyên lành (Ghé thăm lại)' : `${enc.actionLabel} (+${enc.rewardLotus} 🪷 · +${enc.rewardXp} XP)`}
          </button>
          <button type="button" id="btn-enc-open-hub" class="drawer-action-btn" style="min-height:50px;padding:0 16px;">
            <span>📋 Xem tất cả hữu duyên</span>
          </button>
        </div>
      </div>
    `;
    this.openModal(`${enc.icon} ${enc.shortLabel}`, html);
    document.getElementById('btn-complete-random-enc')?.addEventListener('click', () => {
      const res = completeRandomEncounter(this.pilgrimageDepth, enc.id);
      this.pilgrimageDepth = res.state;
      if (!res.alreadyCompleted && res.ok) {
        this.storeProfile.lotusPoints += res.rewardLotus;
        this.grantPilgrimXp?.(res.rewardXp, enc.shortLabel);
        this.spiritual = recordSpiritualMilestone(this.spiritual, `Gặp gỡ hữu duyên: ${enc.title}`);
        this.saveState();
        this.updateActionBadges?.();
        this.playBellTone(360, 2.2);
        this.showToast(`${enc.icon} Gieo Duyên Lành Thành Công`, enc.doneToast, 4400, false);
      } else {
        this.playMokugyoTap?.();
        this.showToast(`${enc.icon} ${enc.speaker}`, 'Cảm ơn cô bác đã ghé thăm lại với tấm lòng hoan hỉ!', 3400, false);
      }
      this.closeModal();
    });
    document.getElementById('btn-enc-open-hub')?.addEventListener('click', () => {
      this.openPilgrimageDepthModal('encounters');
    });
  },

  openCongQuaTaskModal(taskId) {
    const task = CONG_QUA_TASKS.find((t) => t.id === taskId) || CONG_QUA_TASKS[0];
    if (!task) return;
    const alreadyDone = Boolean(this.pilgrimageDepth?.completedCongQua?.includes(task.id));
    this.playMokugyoTap?.();
    const html = `
      <div style="display:flex;flex-direction:column;gap:14px;color:#3d2410;font-size:15px;line-height:1.6;">
        <div style="background:linear-gradient(135deg,#f8fbf4,#eef5e6);border:1.5px solid #6b9654;border-radius:16px;padding:16px 18px;">
          <div style="font-size:13px;font-weight:800;color:#2f6338;text-transform:uppercase;letter-spacing:0.04em;">${task.icon} Công Quả Chùa Vĩnh Tràng · ${task.area}</div>
          <div style="font-size:18px;font-weight:800;color:#234729;margin:4px 0 8px;">${task.title}</div>
          <p style="margin:0;color:#2f3d2b;">${task.description}</p>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
          <button type="button" id="btn-complete-cong-qua" class="passport-primary-btn" style="flex:1;min-height:50px;background:#2F6A40;">
            ${alreadyDone ? '✓ Đã hoàn thành công quả hôm nay' : `${task.actionLabel} (+${task.rewardLotus} 🪷 · +${task.rewardXp} XP)`}
          </button>
          <button type="button" id="btn-cq-open-hub" class="drawer-action-btn" style="min-height:50px;padding:0 16px;">
            <span>📋 Danh sách công quả</span>
          </button>
        </div>
      </div>
    `;
    this.openModal(`${task.icon} Công Quả: ${task.shortLabel}`, html);
    document.getElementById('btn-complete-cong-qua')?.addEventListener('click', () => {
      const res = completeCongQuaTask(this.pilgrimageDepth, task.id);
      this.pilgrimageDepth = res.state;
      if (!res.alreadyCompleted && res.ok) {
        this.storeProfile.lotusPoints += res.rewardLotus;
        this.grantPilgrimXp?.(res.rewardXp, task.shortLabel);
        this.spiritual = recordSpiritualMilestone(this.spiritual, `Làm công quả: ${task.title}`);
        this.saveState();
        this.updateActionBadges?.();
        this.playBellTone(324, 2.0);
        this.showToast(`${task.icon} Công Quả Viên Mãn`, task.doneToast, 4400, false);
      } else {
        this.showToast(`${task.icon} ${task.shortLabel}`, 'Cô bác đã hoàn thành phần công quả này rồi. Chúc an lạc!', 3200, false);
      }
      this.closeModal();
    });
    document.getElementById('btn-cq-open-hub')?.addEventListener('click', () => {
      this.openPilgrimageDepthModal('cong_qua');
    });
  },

  openPilgrimageDepthModal(initialTab = 'encounters') {
    this.toggleUtilityDrawer?.(false);
    let activeTab = initialTab;

    const goToWorldCoord = (x, z, area = 'exterior', label = '', faceYaw = Math.PI) => {
      this.closeModal();
      this.switchScreen('courtyard');
      if (area === 'interior') {
        if (!this.world3d?.insideInterior) {
          this.toggleInteriorHallIn3D(true, () => {
            if (this.world3d?.playerState) {
              this.world3d.playerState.x = x;
              this.world3d.playerState.z = z;
              this.world3d.playerState.yaw = Math.PI / 2;
              this.world3d.cameraBaseYaw = Math.PI / 2;
              this.world3d.syncPlayerTransform?.(true);
              this.world3d.renderFrame?.();
            }
          });
        } else if (this.world3d?.playerState) {
          this.world3d.playerState.x = x;
          this.world3d.playerState.z = z;
          this.world3d.playerState.yaw = Math.PI / 2;
          this.world3d.cameraBaseYaw = Math.PI / 2;
          this.world3d.syncPlayerTransform?.(true);
          this.world3d.renderFrame?.();
        }
      } else {
        if (this.world3d?.insideInterior) this.toggleInteriorHallIn3D(false);
        if (this.world3d?.playerState) {
          this.world3d.cancelAutoWalk?.();
          this.world3d.playerState.x = x;
          this.world3d.playerState.z = z;
          this.world3d.playerState.yaw = faceYaw;
          this.world3d.cameraBaseYaw = faceYaw;
          this.world3d.cameraAzimuthOffset = 0;
          this.world3d.syncPlayerTransform?.(true);
          this.world3d.checkStationProximity?.();
          this.world3d.renderFrame?.();
        }
      }
      this.playBellTone(324, 1.4);
      if (label) {
        this.showToast(`📍 Đã tới: ${label}`, 'Cô bác có thể bấm [E] tương tác hoặc bấm 📸 Chụp ảnh di sản ngay tại đây.', 3800, false);
      }
    };

    const renderDepthBody = () => {
      const sum = getPilgrimageDepthSummary(this.pilgrimageDepth);
      const html = `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div class="activity-banner-row">
            <div>
              <div style="font-size:16px;font-weight:800;color:#FFD875;">🤝 Hữu Duyên · Công Quả &amp; 12 Góc Ảnh Di Sản Vĩnh Tràng</div>
              <div style="font-size:13px;color:#FFF6E5;margin-top:3px;">
                Hữu duyên: <strong>${sum.encountersDone}/${sum.encountersTotal}</strong> · Công quả: <strong>${sum.congQuaDone}/${sum.congQuaTotal}</strong> · Góc ảnh di sản: <strong>${sum.photosDone}/${sum.photosTotal}</strong>
              </div>
            </div>
            <span class="store-wallet-pill">🪷 ${this.storeProfile.lotusPoints}</span>
          </div>

          <div class="explore-tabs-bar">
            <button type="button" class="product-detail-btn" data-depth-tab="encounters" style="${activeTab === 'encounters' ? 'background:#8A3319;' : 'background:#5C381F;opacity:0.85;'}">
              🤝 Gặp gỡ hữu duyên (${sum.encountersDone}/${sum.encountersTotal})
            </button>
            <button type="button" class="product-detail-btn" data-depth-tab="cong_qua" style="${activeTab === 'cong_qua' ? 'background:#2F6A40;' : 'background:#5C381F;opacity:0.85;'}">
              🧹 Công quả &amp; Bếp chay (${sum.congQuaDone}/${sum.congQuaTotal})
            </button>
            <button type="button" class="product-detail-btn" data-depth-tab="photos" style="${activeTab === 'photos' ? 'background:#9A6E1C;' : 'background:#5C381F;opacity:0.85;'}">
              📸 12 Góc Ảnh Di Sản (${sum.photosDone}/${sum.photosTotal})
            </button>
          </div>

          ${
            activeTab === 'encounters'
              ? `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;">
              ${RANDOM_ENCOUNTERS.map((enc) => {
                const done = this.pilgrimageDepth.completedEncounters.includes(enc.id);
                return `
                  <div style="background:#fffdf8;border:1.5px solid ${done ? '#3D6B4A' : 'rgba(180,126,48,0.4)'};border-radius:16px;padding:14px 16px;display:flex;flex-direction:column;justify-content:space-between;gap:10px;">
                    <div>
                      <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
                        <strong style="font-size:14.5px;color:#5C2C14;">${enc.icon} ${enc.title}</strong>
                        <span style="font-size:12px;font-weight:800;color:${done ? '#2F6A40' : '#9A6E1C'};">${done ? '✓ Đã gặp' : `+${enc.rewardLotus} 🪷`}</span>
                      </div>
                      <p style="font-size:13px;color:#4A3222;margin:6px 0 0;line-height:1.5;">${enc.story}</p>
                    </div>
                    <div style="display:flex;gap:8px;">
                      <button type="button" class="product-detail-btn" data-go-enc="${enc.id}" style="flex:1;min-height:42px;">🚶 Đi tới gặp</button>
                      <button type="button" class="product-detail-btn" data-open-enc="${enc.id}" style="width:auto;padding:0 14px;min-height:42px;background:#7E2A22;">💬 Trò chuyện</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `
              : activeTab === 'cong_qua'
              ? `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;">
              ${CONG_QUA_TASKS.map((task) => {
                const done = this.pilgrimageDepth.completedCongQua.includes(task.id);
                return `
                  <div style="background:#fffdf8;border:1.5px solid ${done ? '#3D6B4A' : 'rgba(107,150,84,0.45)'};border-radius:16px;padding:14px 16px;display:flex;flex-direction:column;justify-content:space-between;gap:10px;">
                    <div>
                      <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
                        <strong style="font-size:14.5px;color:#234729;">${task.icon} ${task.title}</strong>
                        <span style="font-size:12px;font-weight:800;color:${done ? '#2F6A40' : '#9A6E1C'};">${done ? '✓ Hoàn thành' : `+${task.rewardLotus} 🪷`}</span>
                      </div>
                      <div style="font-size:12px;color:#6b5239;margin-top:2px;">📍 ${task.area}</div>
                      <p style="font-size:13px;color:#3d3020;margin:6px 0 0;line-height:1.5;">${task.description}</p>
                    </div>
                    <div style="display:flex;gap:8px;">
                      <button type="button" class="product-detail-btn" data-go-cq="${task.id}" style="flex:1;min-height:42px;">🚶 Đi tới điểm</button>
                      <button type="button" class="product-detail-btn" data-open-cq="${task.id}" style="width:auto;padding:0 14px;min-height:42px;background:#2F6A40;">✨ Làm ngay</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `
              : `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(235px,1fr));gap:10px;max-height:54vh;overflow-y:auto;padding-right:4px;">
              ${HERITAGE_PHOTO_SPOTS.map((sp) => {
                const rec = this.pilgrimageDepth.heritagePhotos?.[sp.id];
                return `
                  <div style="background:#fffdf8;border:1.5px solid ${rec ? '#C9962E' : 'rgba(140,100,60,0.28)'};border-radius:14px;padding:12px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
                    <div>
                      <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
                        <span style="font-size:11.5px;font-weight:800;color:#8A3319;">Góc #${sp.order}/12 · ${sp.area === 'interior' ? 'Trong Chánh Điện' : 'Ngoài Sân'}</span>
                        <span style="font-size:11.5px;font-weight:800;color:${rec ? '#2F6A40' : '#8a623c'};">${rec ? `✓ ${rec.dateKey}` : '+20 🪷'}</span>
                      </div>
                      <div style="font-size:14px;font-weight:800;color:#3b200d;margin-top:3px;">${sp.name}</div>
                      <p style="font-size:12px;color:#5c4028;margin:4px 0 0;line-height:1.4;">${sp.subtitle}</p>
                    </div>
                    <div style="display:flex;gap:6px;">
                      <button type="button" class="product-detail-btn" data-go-photo="${sp.id}" style="flex:1;height:36px;font-size:12.5px;">🚶 Đi tới góc này</button>
                      <button type="button" class="product-detail-btn" data-snap-photo="${sp.id}" style="width:auto;padding:0 12px;height:36px;font-size:12.5px;background:#C96F4A;">📸 Chụp</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `
          }
        </div>
      `;

      this.openModal('🤝 Hữu Duyên · Công Quả & 12 Góc Ảnh Di Sản', html);

      document.querySelectorAll('[data-depth-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeTab = btn.getAttribute('data-depth-tab') || 'encounters';
          renderDepthBody();
        });
      });

      document.querySelectorAll('[data-go-enc]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const enc = RANDOM_ENCOUNTERS.find((e) => e.id === btn.getAttribute('data-go-enc'));
          if (enc) goToWorldCoord(enc.pos.x, enc.pos.z + 2.2, 'exterior', enc.shortLabel, Math.PI);
        });
      });
      document.querySelectorAll('[data-open-enc]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.openRandomEncounterModal(btn.getAttribute('data-open-enc'));
        });
      });

      document.querySelectorAll('[data-go-cq]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const task = CONG_QUA_TASKS.find((t) => t.id === btn.getAttribute('data-go-cq'));
          if (task) goToWorldCoord(task.pos.x, task.pos.z + 2.4, 'exterior', task.shortLabel, Math.PI);
        });
      });
      document.querySelectorAll('[data-open-cq]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.openCongQuaTaskModal(btn.getAttribute('data-open-cq'));
        });
      });

      document.querySelectorAll('[data-go-photo]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const sp = HERITAGE_PHOTO_SPOTS.find((s) => s.id === btn.getAttribute('data-go-photo'));
          if (sp) {
            const standZ = sp.area === 'interior' ? sp.pos.z : sp.pos.z + 3.2;
            goToWorldCoord(sp.pos.x, standZ, sp.area, sp.name, Math.PI);
          }
        });
      });
      document.querySelectorAll('[data-snap-photo]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const sp = HERITAGE_PHOTO_SPOTS.find((s) => s.id === btn.getAttribute('data-snap-photo'));
          if (sp) {
            const standZ = sp.area === 'interior' ? sp.pos.z : sp.pos.z + 3.2;
            goToWorldCoord(sp.pos.x, standZ, sp.area, '', Math.PI);
            setTimeout(() => this.captureCleanMemoryPhoto({ isSelfie: false }), 320);
          }
        });
      });
    };

    renderDepthBody();
  },

  applyElderFontScale(scale, save = true) {
    const valid = ['normal', 'large', 'xlarge'].includes(scale) ? scale : 'normal';
    this.elderFontScale = valid;
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-font-scale', valid);
    }
    const screenEl = document.getElementById('lecture-screen');
    if (screenEl) {
      screenEl.setAttribute('data-font-scale', valid);
    }
    const decBtn = document.getElementById('btn-lecture-font-dec');
    const incBtn = document.getElementById('btn-lecture-font-inc');
    if (decBtn) decBtn.disabled = valid === 'normal';
    if (incBtn) incBtn.disabled = valid === 'xlarge';
    if (save) {
      this.saveState();
      this.scheduleCloudSync?.({ profile: true, temple: false });
    }
  },

  stepElderFontScale(delta) {
    const order = ['normal', 'large', 'xlarge'];
    const idx = Math.max(0, order.indexOf(this.elderFontScale));
    const nextIdx = Math.max(0, Math.min(order.length - 1, idx + delta));
    const nextScale = order[nextIdx];
    this.applyElderFontScale(nextScale, true);
    const labelMap = { normal: 'Chữ tiêu chuẩn', large: 'Chữ lớn (+18%)', xlarge: 'Chữ rất lớn (+34%)' };
    this.showToast('Cỡ chữ Giảng đường', `Đã chuyển sang ${labelMap[nextScale]} cho cô bác dễ đọc.`, 2200, false);
  },

  stopLectureSpeech() {
    this.audio?.stopSpeaking?.();
    this.ttsSpeaking = false;
  },

  toggleLectureSpeech(lesson) {
    if (!lesson) return;
    if (this.ttsSpeaking || this.audio?.ttsSpeaking || this.audioPlaying) {
      this.stopLectureSpeech();
      this.pauseVoiceAudio();
      this.renderLectureStage();
      return;
    }

    const speechText = `${lesson.title}. ${lesson.summary.slice(0, 3).join('. ')}. Gợi ý thực hành: ${lesson.example}`;
    this.playBellTone(288, 1.4);
    if (this.audio?.speakVietnameseSmart) {
      this.ttsSpeaking = true;
      this.audio
        .speakVietnameseSmart(speechText, {
          rate: this.readAlongRate || 1.0,
          fallbackAudio: lesson.audio,
          onEnd: () => {
            this.ttsSpeaking = false;
            if (this.activeScreen === 'lecture') this.renderLectureStage();
          }
        })
        .then((res) => {
          if (!res?.ok) {
            this.ttsSpeaking = false;
          }
          if (this.activeScreen === 'lecture') this.renderLectureStage();
        });
      this.renderLectureStage();
      return;
    }

    this.playVoiceAudio(lesson.audio, { rate: this.readAlongRate || 1.0 });
    this.renderLectureStage();
  },

  updateActivityHubBadge() {
    const badge = document.getElementById('nav-activity-badge');
    if (!badge) return;
    const todayKey = getLocalDateKey();
    this.activityHub = ensureDailyMissionDate(this.activityHub, todayKey);
    const canCheckin = this.activityHub?.lastCheckinDate !== todayKey ? 1 : 0;
    const dailyMissions = getDailyMissionsWithProgress(this.activityHub, todayKey);
    const chapters = getExplorationChaptersStatus(this.activityHub, this.spiritual);
    const quests = getQuestsWithProgress(this.activityHub, this.spiritual, this.completedLessons.size);
    const claimableDaily = dailyMissions.filter((m) => m.claimable).length;
    const claimableChaps = chapters.filter((c) => c.claimable).length;
    const claimableQuests = quests.filter((q) => q.claimable).length;
    const mails = getMailboxWithStatus(this.activityHub, { includeExtended: true, spiritualState: this.spiritual });
    const unclaimedMails = mails.filter((m) => !m.claimed).length;
    const total = canCheckin + claimableDaily + claimableChaps + claimableQuests + unclaimedMails;

    if (total > 0) {
      badge.style.display = 'inline-flex';
      badge.textContent = String(total);
    } else {
      badge.style.display = 'none';
    }
  },

  updateActionBadges() {
    const map = [
      ['badge-le-phat', this.spiritual.bowCount],
      ['badge-dang-huong', this.spiritual.incenseOfferings],
      ['badge-dang-hoa', this.spiritual.lotusOfferings],
      ['badge-niem-phat', this.spiritual.malaCycles * 108 + this.spiritual.malaBeads]
    ];
    for (const [id, val] of map) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (val > 0) {
        el.style.display = 'inline-block';
        el.textContent = String(val);
      } else {
        el.style.display = 'none';
      }
    }

    const cartSummary = calculateCartSummary(this.cart);
    const cartLabel = document.getElementById('shop-cart-label');
    if (cartLabel) {
      cartLabel.textContent =
        cartSummary.totalCount > 0 ? `Giỏ hàng (${cartSummary.totalCount})` : 'Giỏ hàng';
    }
    this.updateMeritCounterHUD();
    this.updateUGCMilestoneHUD();
    this.updateActivityHubBadge();
    this.refreshGoalsTrackerHUD();
  },

  updateMeritCounterHUD() {
    const summary = calculateMeritSummary(this.spiritual);
    const rank = getPilgrimRankInfo(this.activityHub?.xp || 0);
    const countEl = document.getElementById('nav-merit-count');
    const badgeEl = document.getElementById('nav-rank-badge');
    const xpEl = document.getElementById('nav-rank-xp-chip');
    if (countEl) {
      countEl.textContent = String(summary.totalActs);
    }
    if (badgeEl) {
      badgeEl.textContent = rank.badge || '🪷';
    }
    if (xpEl) {
      xpEl.textContent = `${rank.xp} XP`;
    }
    return summary;
  },

  refreshGoalsTrackerHUD() {
    const tracker = document.getElementById('daily-goals-tracker');
    if (!tracker) return;
    const todayKey = getLocalDateKey();
    this.activityHub = ensureDailyMissionDate(this.activityHub, todayKey);
    const rank = getPilgrimRankInfo(this.activityHub.xp || 0);
    const badgeEl = document.getElementById('goals-rank-badge');
    const titleEl = document.getElementById('goals-rank-title');
    const xpEl = document.getElementById('goals-rank-xp');
    const fillEl = document.getElementById('goals-xp-fill');
    const toggleBtn = document.getElementById('btn-toggle-goals-tracker');
    const listEl = document.getElementById('daily-goals-list');

    if (badgeEl) badgeEl.textContent = rank.badge;
    if (titleEl) titleEl.textContent = `${rank.title} · Cấp ${rank.level}`;
    if (xpEl) {
      xpEl.textContent = rank.nextTitle
        ? `${rank.xp} / ${rank.nextMinXp} XP`
        : `${rank.xp} XP · Tối đa`;
    }
    if (fillEl) {
      fillEl.style.width = `${Math.round(rank.progressRatio * 100)}%`;
    }
    tracker.classList.toggle('collapsed', Boolean(this.goalsTrackerCollapsed));
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', this.goalsTrackerCollapsed ? 'false' : 'true');
      toggleBtn.textContent = this.goalsTrackerCollapsed ? 'Mục tiêu ▾' : '✕';
    }
    if (!listEl) return;

    const missions = getDailyMissionsWithProgress(this.activityHub, todayKey);
    const featuredIds = ['dm_leaves', 'dm_garden', 'dm_rhythm', 'dm_relics', 'dm_incense'];
    const featured = featuredIds
      .map((id) => missions.find((m) => m.id === id))
      .filter(Boolean)
      .slice(0, 4);

    listEl.innerHTML = featured
      .map((m) => {
        const stateCls = m.claimed ? 'done' : m.claimable ? 'ready' : '';
        const actionBtn = m.claimed
          ? `<span class="goal-chip-done">✓</span>`
          : m.claimable
          ? `<button type="button" class="goal-chip-claim" data-goal-claim="${m.id}">Nhận</button>`
          : `<button type="button" class="goal-chip-go" data-goal-go="${m.actionHint}">Làm</button>`;
        return `
        <div class="daily-goal-row ${stateCls}">
          <span class="goal-row-icon">${m.icon}</span>
          <div class="goal-row-main">
            <div class="goal-row-title">${m.title}</div>
            <div class="goal-row-prog">${m.current}/${m.target}</div>
          </div>
          ${actionBtn}
        </div>`;
      })
      .join('');

    listEl.querySelectorAll('[data-goal-go]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.executeQuestActionHint(btn.getAttribute('data-goal-go'));
      });
    });
    listEl.querySelectorAll('[data-goal-claim]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mid = btn.getAttribute('data-goal-claim');
        const res = claimDailyMissionReward(this.activityHub, this.storeProfile, mid, getLocalDateKey());
        this.activityHub = res.activity;
        this.storeProfile = res.storeProfile;
        if (res.ok) {
          this.grantPilgrimXp(15, res.mission?.title || 'Nhiệm vụ hằng ngày');
          this.playBellTone(324, 2.0);
          this.showToast('🎁 Nhận lộc nhiệm vụ hôm nay', res.message, 3600, false);
        }
        this.saveState();
        this.updateActionBadges();
      });
    });
  },

  getCurrentVisitorZoneLabel() {
    if (this.activeScreen === 'lecture') return 'Giảng đường';
    if (this.activeScreen === 'shop') return 'Cửa hàng';
    if (this.world3d?.insideInterior) return 'Chánh điện';
    return 'Sân chùa';
  },

  renderVisitorCounterHUD() {
    const summary = buildVisitorPresenceSummary(this.visitorPresenceState, this.visitorClientId);
    const btn = document.getElementById('hud-visitor-counter');
    const countEl = document.getElementById('hud-visitor-count');
    const labelEl = document.getElementById('hud-visitor-label');
    if (countEl) countEl.textContent = summary.countText;
    if (labelEl) labelEl.textContent = summary.labelText;
    if (btn) btn.setAttribute('aria-label', summary.compactAriaLabel);

    const popOnline = document.getElementById('visitor-popover-online');
    const popToday = document.getElementById('visitor-popover-today');
    const listEl = document.getElementById('visitor-active-list');
    if (popOnline) popOnline.textContent = String(summary.onlineCount);
    if (popToday) popToday.textContent = String(summary.todayVisits);

    if (listEl) {
      const visible = summary.visitors.slice(0, 8);
      const hiddenCount = Math.max(0, summary.onlineCount - visible.length);
      listEl.innerHTML =
        visible
          .map(
            (v) => `
          <div class="visitor-active-row ${v.isSelf ? 'self' : ''}">
            <span class="visitor-active-role">${v.flag} ${v.roleLabel}${v.isSelf ? ' (Bạn)' : ''}</span>
            <span class="visitor-active-zone">${v.zone}</span>
          </div>`
          )
          .join('') +
        (hiddenCount > 0 ? `<div class="visitor-active-more">+ ${hiddenCount} đồng tu khác đang trực tuyến</div>` : '');
    }
  },

  async syncVisitorPresence() {
    if (!this.visitorClientId || typeof fetch !== 'function') return;
    try {
      const resp = await fetch('/api/visitors/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: this.visitorClientId,
          nationalityId: this.nationalityId || 'vn',
          characterModelKey: this.characterModelKey || 'nu',
          zone: this.getCurrentVisitorZoneLabel()
        })
      });
      if (!resp.ok) return;
      const data = await resp.json();
      if (data && typeof data.onlineCount === 'number') {
        this.visitorPresenceState = data;
        this.renderVisitorCounterHUD();
      }
    } catch {}
  },

  initVisitorPresence() {
    this.renderVisitorCounterHUD();
    if (typeof window === 'undefined') return;

    const connectStream = () => {
      if (typeof EventSource === 'undefined') return;
      try {
        this._visitorEventSource?.close?.();
        const params = new URLSearchParams({
          clientId: this.visitorClientId,
          nationalityId: this.nationalityId || 'vn',
          charKey: this.characterModelKey || 'nu',
          zone: this.getCurrentVisitorZoneLabel()
        });
        const es = new EventSource(`/api/visitors/stream?${params.toString()}`);
        this._visitorEventSource = es;
        es.addEventListener('presence', (evt) => {
          try {
            const data = JSON.parse(evt.data);
            if (data && typeof data.onlineCount === 'number') {
              this.visitorPresenceState = data;
              this.renderVisitorCounterHUD();
            }
          } catch {}
        });
      } catch {}
    };

    connectStream();
    this.syncVisitorPresence();

    if (this._visitorHeartbeatTimer) clearInterval(this._visitorHeartbeatTimer);
    this._visitorHeartbeatTimer = setInterval(() => {
      this.syncVisitorPresence();
    }, 25000);

    if (!this._visitorLeaveBound) {
      this._visitorLeaveBound = true;
      const sendLeave = () => {
        try {
          this._visitorEventSource?.close?.();
          const payload = JSON.stringify({ clientId: this.visitorClientId });
          if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/visitors/leave', new Blob([payload], { type: 'application/json' }));
          }
        } catch {}
      };
      window.addEventListener('pagehide', sendLeave);
      window.addEventListener('beforeunload', sendLeave);
    }
  }
};
