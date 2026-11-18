/**
 * Vườn thiền, nhịp chuông, sách di sản, tổng kết công đức.
 *
 * Mixin của ChuaOnlineApp: 5 method (openTempleGardenModal … updateEquippedTags).
 * Được gắn vào class trong chua-online-app.mjs qua applyMixins().
 */
import { CHARACTER_PROFILES, SHOP_CATALOG, getLocalDateKey, calculateMeritSummary, ensureDailyMissionDate, getPilgrimRankInfo, TEMPLE_GARDEN_SPECIES, TEMPLE_GARDEN_SLOTS, plantGardenTree, waterGardenSlot, harvestGardenSlot, scoreBellRhythmHit, completeBellRhythmSession, HERITAGE_RELICS } from './shared.mjs';

export const templeModalsMethods = {
  openTempleGardenModal(focusSlotIdx = 0) {
    let selectedSlot = Math.max(0, Math.min(TEMPLE_GARDEN_SLOTS.length - 1, Number(focusSlotIdx || 0)));
    let selectedSpecies = TEMPLE_GARDEN_SPECIES[0].id;

    const renderGarden = () => {
      const todayKey = getLocalDateKey();
      this.activityHub = ensureDailyMissionDate(this.activityHub, todayKey);
      const slots = this.activityHub.templeGarden || [];
      const stageLabels = ['Đất trống', '1/3 · Nảy mầm', '2/3 · Xanh tốt', '3/3 · Mãn khai 🌸'];

      this.openModal(
        '🌱 Vườn Cây Phật · Vườn Lâm Tỳ Ni',
        `
        <div class="garden-modal-wrap">
          <div class="activity-banner-row">
            <div>
              <div style="font-size:16px;font-weight:800;color:#FFD875;">Gieo trồng &amp; Chăm tưới Cây Thiêng 3D</div>
              <div style="font-size:13px;color:#FFF6E5;margin-top:2px;">Gieo hạt Sen, Bồ Đề hoặc Sa La trực tiếp lên 4 luống đất 3D bên Vườn Lâm Tỳ Ni. Tưới đủ 2 lần để thu hoạch 🪷 &amp; 💎!</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              <span class="store-wallet-pill">🪷 ${this.storeProfile.lotusPoints}</span>
              <span class="store-wallet-pill">💎 ${this.storeProfile.gems}</span>
              <button type="button" id="btn-garden-walk-3d" class="quest-claim-btn" style="background:#3D6B4A;">🚶 Ra Vườn 3D</button>
            </div>
          </div>

          <div class="garden-slots-grid">
            ${TEMPLE_GARDEN_SLOTS.map((meta, idx) => {
              const slot = slots[idx] || { slotIdx: idx, speciesId: null, stage: 0, harvestCount: 0 };
              const sp = TEMPLE_GARDEN_SPECIES.find((s) => s.id === slot.speciesId);
              const isFocus = idx === selectedSlot;
              return `
              <div class="garden-slot-card ${isFocus ? 'focused' : ''} ${slot.stage >= 3 ? 'mature' : ''}" data-garden-select="${idx}">
                <div class="garden-slot-head">
                  <span class="quest-cat-pill">Luống ${idx + 1}</span>
                  <span class="garden-stage-badge">${stageLabels[slot.stage || 0]}</span>
                </div>
                <div class="garden-slot-title">${sp ? `${sp.icon} ${sp.name}` : '🟫 Luống đất sạch'}</div>
                <div class="garden-slot-sub">${meta.label} · Đã thu hoạch ${slot.harvestCount || 0} mùa</div>
                <div class="quest-progress-track" style="margin:8px 0;">
                  <div class="quest-progress-fill" style="width:${Math.round(((slot.stage || 0) / 3) * 100)}%"></div>
                </div>
                <div class="garden-slot-actions">
                  ${
                    !slot.speciesId
                      ? `<button type="button" class="quest-claim-btn" data-garden-plant="${idx}">🌱 Gieo giống đã chọn</button>`
                      : slot.stage < 3
                      ? `<button type="button" class="quest-claim-btn" data-garden-water="${idx}">💧 Tưới nước (+12 🪷 · +15 XP)</button>`
                      : `<button type="button" class="quest-claim-btn" style="background:#C96F4A;" data-garden-harvest="${idx}">🧺 Thu hoạch (+${sp?.harvestLotus || 60} 🪷 · +${sp?.harvestGems || 2} 💎)</button>`
                  }
                </div>
              </div>`;
            }).join('')}
          </div>

          <div class="garden-species-bar">
            <div style="font-size:13.5px;font-weight:800;color:#5C381F;margin-bottom:6px;">Chọn giống cây để gieo vào luống trống:</div>
            <div class="garden-species-grid">
              ${TEMPLE_GARDEN_SPECIES.map((sp) => `
                <button type="button" class="garden-species-btn ${selectedSpecies === sp.id ? 'active' : ''}" data-garden-species="${sp.id}">
                  <div class="garden-sp-top"><span>${sp.icon} ${sp.name}</span><strong>🪷 ${sp.seedCostLotus}</strong></div>
                  <div class="garden-sp-desc">${sp.desc}</div>
                  <div class="garden-sp-yield">Thu hoạch: +${sp.harvestLotus} 🪷 · +${sp.harvestGems} 💎 · +${sp.harvestXp} XP</div>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
        `
      );

      document.getElementById('btn-garden-walk-3d')?.addEventListener('click', () => {
        this.closeModal();
        this.switchScreen('courtyard');
        if (this.world3d?.insideInterior) this.toggleInteriorHallIn3D(false);
        this.walkToStationIn3D('vuon_lam_ty_ni');
      });

      document.querySelectorAll('[data-garden-select]').forEach((card) => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('button')) return;
          selectedSlot = Number(card.getAttribute('data-garden-select') || 0);
          renderGarden();
        });
      });

      document.querySelectorAll('[data-garden-species]').forEach((btn) => {
        btn.addEventListener('click', () => {
          selectedSpecies = btn.getAttribute('data-garden-species') || TEMPLE_GARDEN_SPECIES[0].id;
          this.playMokugyoTap();
          renderGarden();
        });
      });

      document.querySelectorAll('[data-garden-plant]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-garden-plant') || 0);
          const res = plantGardenTree(this.activityHub, this.storeProfile, idx, selectedSpecies, getLocalDateKey());
          this.activityHub = res.activity;
          this.storeProfile = res.storeProfile;
          if (!res.ok) {
            this.showToast('Vườn Cây Phật', res.message, 3200, false);
            return;
          }
          this.saveState();
          this.syncTempleWorldGameplayState();
          this.updateActionBadges();
          this.playMokugyoTap();
          this.showToast('🌱 Gieo hạt thành công', res.message, 3600, false);
          renderGarden();
        });
      });

      document.querySelectorAll('[data-garden-water]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-garden-water') || 0);
          const res = waterGardenSlot(this.activityHub, this.storeProfile, idx, getLocalDateKey());
          this.activityHub = res.activity;
          this.storeProfile = res.storeProfile;
          if (!res.ok) {
            this.showToast('Vườn Cây Phật', res.message, 3200, false);
            return;
          }
          this.saveState();
          this.syncTempleWorldGameplayState();
          this.updateActionBadges();
          this.playBellTone(324, 1.8);
          this.showToast('💧 Tưới nước vườn thiền', res.message, 3600, false);
          renderGarden();
        });
      });

      document.querySelectorAll('[data-garden-harvest]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-garden-harvest') || 0);
          const res = harvestGardenSlot(this.activityHub, this.storeProfile, idx, getLocalDateKey());
          this.activityHub = res.activity;
          this.storeProfile = res.storeProfile;
          if (!res.ok) {
            this.showToast('Vườn Cây Phật', res.message, 3200, false);
            return;
          }
          this.saveState();
          this.syncTempleWorldGameplayState();
          this.updateActionBadges();
          this.playBellTone(360, 2.6);
          this.showToast('🌸 Thu hoạch hoa thiêng', res.message, 4200, true);
          renderGarden();
        });
      });
    };

    renderGarden();
  },

  openBellRhythmModal() {
    if (this._rhythmSession?.rafId) {
      cancelAnimationFrame(this._rhythmSession.rafId);
    }
    const TOTAL_BEATS = 8;
    const BEAT_INTERVAL_MS = 1150;
    const LEAD_IN_MS = 1100;

    const session = {
      active: false,
      finished: false,
      startMs: 0,
      beatIndex: 0,
      hits: [],
      combo: 0,
      lastGradeText: 'Bấm "Bắt đầu khóa nhịp" rồi gõ Chuông / Mõ đúng khi vòng sáng chạm tâm!',
      rafId: null,
      result: null
    };
    this._rhythmSession = session;

    const renderRhythmShell = () => {
      const best = this.activityHub?.bellRhythmBest || 0;
      const doneRes = session.result;
      this.openModal(
        '🔔 Thỉnh Chuông & Gõ Mõ Chánh Niệm',
        `
        <div class="rhythm-modal-wrap">
          <div class="activity-banner-row">
            <div>
              <div style="font-size:16px;font-weight:800;color:#FFD875;">Khóa lễ Chuông – Mõ 8 nhịp Chánh Niệm</div>
              <div style="font-size:13px;color:#FFF6E5;margin-top:2px;">Canh đúng lúc vòng ánh sáng thu vào vòng tròn vàng ở giữa, bấm nút gõ (hoặc phím <b>Space</b>) để giữ nhịp thanh tịnh.</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <span class="store-wallet-pill">🏆 Kỷ lục: ${best}</span>
              <span class="store-wallet-pill" id="rhythm-combo-pill">🔥 Chuỗi: ${session.combo}</span>
            </div>
          </div>

          <div class="rhythm-stage-box">
            <div class="rhythm-beat-counter" id="rhythm-beat-counter">
              ${
                doneRes
                  ? `Hoàn tất ${TOTAL_BEATS}/${TOTAL_BEATS} nhịp · Chuẩn xác ${doneRes.accuracy}%`
                  : session.active
                  ? `Nhịp ${Math.min(TOTAL_BEATS, session.beatIndex + 1)} / ${TOTAL_BEATS}`
                  : `Sẵn sàng (${TOTAL_BEATS} nhịp Chuông – Mõ)`
              }
            </div>

            <div class="rhythm-target-arena">
              <div class="rhythm-approach-ring" id="rhythm-approach-ring"></div>
              <button type="button" id="btn-rhythm-strike" class="rhythm-center-gong" ${session.active ? '' : 'disabled'}>
                <span class="rhythm-gong-icon" id="rhythm-gong-icon">🔔</span>
                <span class="rhythm-gong-label" id="rhythm-gong-label">${session.active ? 'GÕ NGAY (Space)' : 'CHUÔNG · MÕ'}</span>
              </button>
            </div>

            <div class="rhythm-feedback-banner" id="rhythm-feedback-banner">${session.lastGradeText}</div>

            ${
              doneRes
                ? `<div class="rhythm-summary-strip">
                    <span>Điểm: <strong>${doneRes.totalScore}</strong></span>
                    <span>Chuẩn nhịp: <strong>${doneRes.accuracy}%</strong></span>
                    <span>Chuỗi tối đa: <strong>${doneRes.maxCombo}</strong></span>
                    <span>Thưởng: <strong>+${doneRes.rewardLotus} 🪷 · +${doneRes.rewardGems} 💎 · +${doneRes.xpGranted} XP</strong></span>
                  </div>`
                : ''
            }

            <div class="rhythm-controls-row">
              <button type="button" id="btn-rhythm-start" class="quest-claim-btn" style="min-height:44px;padding:0 22px;font-size:14.5px;">
                ${doneRes ? '🔄 Luyện lại một khóa nữa' : session.active ? '⏳ Đang giữ nhịp...' : '▶ Bắt đầu khóa nhịp (8 nhịp)'}
              </button>
              <button type="button" id="btn-rhythm-walk-tower" class="quest-go-btn" style="min-height:44px;">
                🚶 Tới Lầu Đại Hồng Chung
              </button>
            </div>
          </div>
        </div>
        `
      );

      const finishSession = () => {
        if (session.finished) return;
        session.finished = true;
        session.active = false;
        if (session.rafId) {
          cancelAnimationFrame(session.rafId);
          session.rafId = null;
        }
        while (session.hits.length < TOTAL_BEATS) {
          session.hits.push({ grade: 'miss', label: 'Lỡ nhịp', points: 0 });
        }
        const res = completeBellRhythmSession(this.activityHub, this.storeProfile, session.hits, getLocalDateKey());
        this.activityHub = res.activity;
        this.storeProfile = res.storeProfile;
        session.result = res;
        this.saveState();
        this.updateActionBadges();
        this.playBellTone(216, 3.0);
        this.showToast('🔔 Hoàn tất khóa Thỉnh Chuông', res.message, 4200, true);
        renderRhythmShell();
      };

      const handleStrike = () => {
        if (!session.active || session.finished) return;
        const now = performance.now();
        const targetTime = session.startMs + LEAD_IN_MS + session.beatIndex * BEAT_INTERVAL_MS;
        const offsetMs = now - targetTime;
        const scored = scoreBellRhythmHit(offsetMs);
        session.hits.push(scored);
        if (scored.points > 0) {
          session.combo += 1;
          if (session.beatIndex % 2 === 0) {
            this.playBellTone(243, 1.8);
          } else {
            this.playMokugyoTap();
          }
        } else {
          session.combo = 0;
          this.playMokugyoTap();
        }
        session.lastGradeText = `${scored.label} (+${scored.points} điểm)`;
        session.beatIndex += 1;

        const fb = document.getElementById('rhythm-feedback-banner');
        const comboEl = document.getElementById('rhythm-combo-pill');
        const cntEl = document.getElementById('rhythm-beat-counter');
        if (fb) fb.textContent = session.lastGradeText;
        if (comboEl) comboEl.textContent = `🔥 Chuỗi: ${session.combo}`;
        if (cntEl && session.beatIndex < TOTAL_BEATS) {
          cntEl.textContent = `Nhịp ${session.beatIndex + 1} / ${TOTAL_BEATS}`;
        }
        if (session.beatIndex >= TOTAL_BEATS) {
          finishSession();
        }
      };
      session.strike = handleStrike;

      document.getElementById('btn-rhythm-strike')?.addEventListener('click', handleStrike);

      document.getElementById('btn-rhythm-walk-tower')?.addEventListener('click', () => {
        this.closeModal();
        this.switchScreen('courtyard');
        if (this.world3d?.insideInterior) this.toggleInteriorHallIn3D(false);
        this.walkToStationIn3D('thap_chuong_dai_hong');
      });

      document.getElementById('btn-rhythm-start')?.addEventListener('click', () => {
        if (session.active) return;
        session.active = true;
        session.finished = false;
        session.result = null;
        session.startMs = performance.now();
        session.beatIndex = 0;
        session.hits = [];
        session.combo = 0;
        session.lastGradeText = 'Lắng nghe nhịp đầu tiên...';
        renderRhythmShell();
        this.playBellTone(216, 1.6);

        const tick = () => {
          if (!this._rhythmSession || this._rhythmSession !== session || !session.active || session.finished) return;
          const now = performance.now();
          const targetTime = session.startMs + LEAD_IN_MS + session.beatIndex * BEAT_INTERVAL_MS;
          const timeToBeat = targetTime - now;

          if (timeToBeat < -340) {
            session.hits.push({ grade: 'miss', label: 'Lỡ nhịp', points: 0 });
            session.combo = 0;
            session.lastGradeText = 'Lỡ nhịp (0 điểm)';
            session.beatIndex += 1;
            const fb = document.getElementById('rhythm-feedback-banner');
            const comboEl = document.getElementById('rhythm-combo-pill');
            const cntEl = document.getElementById('rhythm-beat-counter');
            if (fb) fb.textContent = session.lastGradeText;
            if (comboEl) comboEl.textContent = `🔥 Chuỗi: ${session.combo}`;
            if (cntEl && session.beatIndex < TOTAL_BEATS) {
              cntEl.textContent = `Nhịp ${session.beatIndex + 1} / ${TOTAL_BEATS}`;
            }
            if (session.beatIndex >= TOTAL_BEATS) {
              finishSession();
              return;
            }
          }

          const ringEl = document.getElementById('rhythm-approach-ring');
          const iconEl = document.getElementById('rhythm-gong-icon');
          if (ringEl) {
            const nextTarget = session.startMs + LEAD_IN_MS + session.beatIndex * BEAT_INTERVAL_MS;
            const remaining = nextTarget - now;
            const norm = Math.max(0, Math.min(1, remaining / BEAT_INTERVAL_MS));
            const scale = 1 + norm * 1.15;
            ringEl.style.transform = `scale(${scale.toFixed(3)})`;
            ringEl.style.opacity = remaining < -250 ? '0.2' : '0.92';
            ringEl.style.borderColor = Math.abs(remaining) <= 130 ? '#FFD875' : '#E68A45';
          }
          if (iconEl) {
            iconEl.textContent = session.beatIndex % 2 === 0 ? '🔔' : '🪵';
          }
          session.rafId = requestAnimationFrame(tick);
        };
        session.rafId = requestAnimationFrame(tick);
      });
    };

    renderRhythmShell();
  },

  openHeritageBookModal() {
    const renderBook = () => {
      const discovered = Array.isArray(this.activityHub?.heritageRelics)
        ? this.activityHub.heritageRelics
        : [];
      const rank = getPilgrimRankInfo(this.activityHub?.xp || 0);

      this.openModal(
        `📜 Sổ Di Sản Chùa Vĩnh Tràng (${discovered.length}/${HERITAGE_RELICS.length})`,
        `
        <div class="heritage-modal-wrap">
          <div class="activity-banner-row">
            <div>
              <div style="font-size:16px;font-weight:800;color:#FFD875;">Bộ sưu tập 10 Dấu Ấn Kiến Trúc &amp; Cổ Tự (1849 – nay)</div>
              <div style="font-size:13px;color:#FFF6E5;margin-top:2px;">Đến gần từng công trình, tượng Phật hoặc nhấn “Đi tới &amp; Đóng dấu” để sưu tầm trọn bộ lịch sử Chùa Vĩnh Tràng.</div>
            </div>
            <div class="store-wallet-pill">${rank.badge} ${rank.title} · ${rank.xp} XP</div>
          </div>

          <div class="heritage-relics-grid">
            ${HERITAGE_RELICS.map((r, idx) => {
              const stamped = discovered.includes(r.id);
              const pos = this.world3d?.playerPos || this.playerPos;
              const dist = Math.hypot((pos?.x || 0) - r.pos.x, (pos?.z || 0) - r.pos.z);
              const canStampNow = !stamped && dist <= 16;
              return `
              <article class="heritage-card ${stamped ? 'stamped' : ''}">
                <div class="heritage-card-head">
                  <span class="quest-cat-pill">#${idx + 1} · ${r.era}</span>
                  <span class="heritage-seal ${stamped ? 'done' : ''}">${stamped ? '✓ Đã đóng dấu' : `+${r.rewardLotus} 🪷 · +${r.rewardXp} XP`}</span>
                </div>
                <div class="heritage-card-title">${r.name}</div>
                <p class="heritage-card-desc">${r.desc}</p>
                <div class="heritage-card-actions">
                  ${
                    canStampNow
                      ? `<button type="button" class="quest-claim-btn" data-relic-stamp="${r.id}">📜 Đóng dấu ngay</button>`
                      : ''
                  }
                  <button type="button" class="quest-go-btn" data-relic-walk="${r.stationKey}" data-relic-id="${r.id}">
                    ${stamped ? '🚶 Ghé lại' : '🚶 Đi tới chiêm bái'}
                  </button>
                </div>
              </article>`;
            }).join('')}
          </div>
        </div>
        `
      );

      document.querySelectorAll('[data-relic-stamp]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const rid = btn.getAttribute('data-relic-stamp');
          if (rid) {
            this.tryAutoDiscoverHeritageById(rid, { silent: false });
            renderBook();
          }
        });
      });

      document.querySelectorAll('[data-relic-walk]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const stKey = btn.getAttribute('data-relic-walk') || 'chanh_dien';
          const rid = btn.getAttribute('data-relic-id');
          this.closeModal();
          this.switchScreen('courtyard');
          if (rid === 'relic_long_tru' || rid === 'relic_bat_bo_la_han' || rid === 'relic_to_dat_ma') {
            this.toggleInteriorHallIn3D(true, () => {
              if (rid === 'relic_to_dat_ma') {
                this.world3d?.goToInteriorZone?.('khu_tho');
              }
              this.tryAutoDiscoverHeritageById(rid, { silent: false });
            });
          } else {
            if (this.world3d?.insideInterior) this.toggleInteriorHallIn3D(false);
            this.walkToStationIn3D(stKey);
          }
        });
      });
    };

    renderBook();
  },

  openMeritSummaryModal() {
    const m = calculateMeritSummary(this.spiritual);
    const rank = getPilgrimRankInfo(this.activityHub?.xp || 0);
    this.openModal(
      'Sổ Công Đức & Cấp Bậc Hành Hương',
      `
      <div class="merit-summary-wrap">
        <div class="merit-hero-banner">
          <div>
            <div style="font-size:13px;font-weight:700;color:#FFE4A0;">${rank.badge} ${rank.title.toUpperCase()} · CẤP ${rank.level} (${rank.xp} XP)</div>
            <div class="merit-total-num">${m.totalActs} <span style="font-size:16px;font-weight:700;">công đức</span></div>
          </div>
          <div style="font-size:13.5px;max-width:340px;line-height:1.45;color:#FFF6E5;">
            Ghi nhận số lần Lễ Phật, Dâng hương, Dâng hoa, Quét lá Bồ Đề, Chăm Vườn Phật và Sổ Di Sản trong hành trình viếng Chùa Vĩnh Tràng.
          </div>
        </div>

        <div class="merit-breakdown-grid">
          <div class="merit-stat-card">
            <div class="merit-stat-icon">🙏</div>
            <div class="merit-stat-val">${m.bowActs}</div>
            <div class="merit-stat-label">Lần Lễ Phật</div>
            <div class="merit-stat-sub">(${m.bowCount} lạy đã thực hiện)</div>
            <button type="button" class="merit-quick-btn" id="merit-go-bow">Lễ Phật ngay</button>
          </div>
          <div class="merit-stat-card">
            <div class="merit-stat-icon">🪔</div>
            <div class="merit-stat-val">${m.incenseActs}</div>
            <div class="merit-stat-label">Lần Dâng hương</div>
            <div class="merit-stat-sub">Hương Giới · Định · Tuệ</div>
            <button type="button" class="merit-quick-btn" id="merit-go-incense">Dâng hương</button>
          </div>
          <div class="merit-stat-card">
            <div class="merit-stat-icon">🪷</div>
            <div class="merit-stat-val">${m.flowerActs}</div>
            <div class="merit-stat-label">Lần Dâng hoa</div>
            <div class="merit-stat-sub">Sen nở rực rỡ tại hồ</div>
            <button type="button" class="merit-quick-btn" id="merit-go-flower">Dâng hoa sen</button>
          </div>
        </div>
      </div>
      `
    );

    document.getElementById('merit-go-bow')?.addEventListener('click', () => {
      this.closeModal();
      this.triggerLePhat();
    });
    document.getElementById('merit-go-incense')?.addEventListener('click', () => {
      this.closeModal();
      this.triggerDangHuong();
    });
    document.getElementById('merit-go-flower')?.addEventListener('click', () => {
      this.closeModal();
      this.triggerDangHoa();
    });
  },

  updateEquippedTags() {
    const container = document.getElementById('equipped-tags');
    if (!container) return;
    const eq = this.spiritual.equippedItems;
    const charProf = CHARACTER_PROFILES.find((c) => c.key === this.characterModelKey) || CHARACTER_PROFILES[0];
    const chips = [`🙏 ${charProf.name} (${charProf.heightLabel})`];
    if (eq.hat) {
      const item = SHOP_CATALOG.find((p) => p.id === eq.hat);
      if (item) chips.push(`👒 ${item.name}`);
    }
    if (eq.scarf) {
      const item = SHOP_CATALOG.find((p) => p.id === eq.scarf);
      if (item) chips.push(`🧣 ${item.name}`);
    }
    if (eq.hand && eq.hand !== 'trang_hat_bo_de') {
      const item = SHOP_CATALOG.find((p) => p.id === eq.hand);
      chips.push(`🪷 ${item ? item.name : 'Hoa sen thanh tịnh'}`);
    }
    container.innerHTML = chips.map((c) => `<span class="equip-tag-chip">${c}</span>`).join('');
  }
};
