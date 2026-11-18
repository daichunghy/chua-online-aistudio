/**
 * Toast, chuyển màn hình, giờ, cỡ chữ, HUD huy hiệu & mục tiêu.
 *
 * Mixin của ChuaOnlineApp: 12 method (showToast … refreshGoalsTrackerHUD).
 * Được gắn vào class trong chua-online-app.mjs qua applyMixins().
 */
import { stepPlayerMovement, findNearestStation, recordSpiritualMilestone, checkUGCMilestoneUnlock, calculateCartSummary, getLocalDateKey, calculateMeritSummary, TIME_OF_DAY_PRESETS, ensureDailyMissionDate, getDailyMissionsWithProgress, claimDailyMissionReward, getExplorationChaptersStatus, getQuestsWithProgress, getMailboxWithStatus, getPilgrimRankInfo } from './shared.mjs';

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
    const spiritualBar = document.getElementById('spiritual-actions-bar');
    const goalsTracker = document.getElementById('daily-goals-tracker');
    if (shopEl) shopEl.classList.toggle('open', screenName === 'shop');
    if (lectureEl) lectureEl.classList.toggle('open', screenName === 'lecture');
    if (quickDock) quickDock.style.display = isCourtyard ? 'flex' : 'none';
    if (topHud) topHud.style.display = isCourtyard ? 'flex' : 'none';
    if (spiritualBar) spiritualBar.style.display = isCourtyard ? 'flex' : 'none';
    if (goalsTracker) goalsTracker.style.display = isCourtyard ? 'flex' : 'none';
    if (pinsLayer && !this.world3d?.insideInterior) {
      pinsLayer.style.display = isCourtyard ? 'block' : 'none';
    }

    if (screenName !== 'lecture') {
      this.stopLectureSpeech();
      this.sutraCtrl?.stopAllPlayback?.();
    }
    this.world3d?.setLectureHallMode?.(screenName === 'lecture');
    this.audio?.setAmbientZone?.(
      screenName === 'lecture' || this.world3d?.insideInterior ? 'interior' : 'exterior'
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
    document.querySelectorAll('[data-time-of-day]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-time-of-day') === preset.key);
    });
    this.world3d?.setTimeOfDay?.(preset.key, immediate);
    this.saveState();
    if (showNotice) {
      this.playBellTone(preset.key === 'evening' ? 216 : preset.key === 'midday' ? 288 : 256, 1.5);
      this.showToast(`${preset.icon} Chế độ ánh sáng: ${preset.label}`, preset.subtitle, 3200, false);
    }
  },

  applyElderFontScale(scale, save = true) {
    const valid = ['normal', 'large', 'xlarge'].includes(scale) ? scale : 'normal';
    this.elderFontScale = valid;
    const screenEl = document.getElementById('lecture-screen');
    if (screenEl) {
      screenEl.setAttribute('data-font-scale', valid);
    }
    const decBtn = document.getElementById('btn-lecture-font-dec');
    const incBtn = document.getElementById('btn-lecture-font-inc');
    if (decBtn) decBtn.disabled = valid === 'normal';
    if (incBtn) incBtn.disabled = valid === 'xlarge';
    if (save) this.saveState();
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
  }
};
