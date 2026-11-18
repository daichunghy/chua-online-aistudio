/**
 * Modal tiền hành hương, tháp cầu an, hoa đăng.
 *
 * Mixin của ChuaOnlineApp: 4 method (openArrivalPilgrimageModal … highlightInteriorZoneChip).
 * Được gắn vào class trong chua-online-app.mjs qua applyMixins().
 */
import { CHARACTER_PROFILES, recordSpiritualMilestone, getLocalDateKey, shouldShowDailyDharmaToday, NATIONALITY_PROFILES, getNationalityProfile, PILGRIMAGE_MODES, getPilgrimageMode, getTempleSeasonalContext, createHoaDangLantern, BLESSING_TOWER_CATEGORIES, registerBlessingTowerPrayer } from './shared.mjs';

export const pilgrimageModalsMethods = {
  openArrivalPilgrimageModal() {
    let draftChar = this.characterModelKey || 'nu';
    let draftNat = this.nationalityId || 'vn';
    let draftMode = this.pilgrimageModeId || 'solo';

    const renderArrival = () => {
      const natObj = getNationalityProfile(draftNat);
      const modeObj = getPilgrimageMode(draftMode);
      const seasonal = getTempleSeasonalContext();
      const vehLabel =
        modeObj.arrivalVehicle === 'bus'
          ? '🚌 Xe khách đoàn 45 chỗ'
          : modeObj.arrivalVehicle === 'van'
          ? '🚐 Xe gia đình 7 chỗ'
          : '🚗 Xe ô tô đưa đón';

      this.openModal(
        '🙏 Kính Chào Quý Khách Đến Chùa Vĩnh Tràng (1849)',
        `
        <div class="arrival-modal-wrap">
          <div class="seasonal-festival-banner">
            <div>
              <div style="font-size:15px;font-weight:800;color:#FFD875;">${seasonal.isFestivalDay ? '🏮 ' : '🪷 '}${seasonal.activeFestival ? seasonal.activeFestival.name : seasonal.lunarLabel}</div>
              <div style="font-size:13px;color:#FFF6E5;margin-top:2px;">${seasonal.greeting}</div>
            </div>
            <span class="store-wallet-pill">Cộng hưởng ${seasonal.xpMultiplier}x XP</span>
          </div>

          <div class="arrival-section-block">
            <div class="arrival-step-heading">1. Chọn Quốc tịch &amp; Truyền thống Hành hương (6 vùng)</div>
            <div class="arrival-nat-grid">
              ${NATIONALITY_PROFILES.map(
                (n) => `
                <button type="button" class="arrival-choice-card ${draftNat === n.id ? 'active' : ''}" data-arr-nat="${n.id}">
                  <div class="arrival-choice-top"><span>${n.flag} ${n.name.split('—')[0].trim()}</span></div>
                  <div class="arrival-choice-sub">${n.badgeLabel}</div>
                </button>`
              ).join('')}
            </div>
            <div class="arrival-greeting-box">${natObj.flag} <em>${natObj.greeting}</em></div>
          </div>

          <div class="arrival-section-block">
            <div class="arrival-step-heading">2. Chọn Nhân vật 3D của bạn (7 dáng người)</div>
            <div class="arrival-char-grid">
              ${CHARACTER_PROFILES.map(
                (c) => `
                <button type="button" class="arrival-char-pill ${draftChar === c.key ? 'active' : ''}" data-arr-char="${c.key}">
                  <strong>${c.name.split('(')[0].trim()}</strong>
                  <span>${c.heightLabel} · ${c.outfitName.split('(')[0].trim()}</span>
                </button>`
              ).join('')}
            </div>
          </div>

          <div class="arrival-section-block">
            <div class="arrival-step-heading">3. Chọn Mục đích &amp; Bạn đồng hành tới chùa (4 chế độ)</div>
            <div class="arrival-mode-grid">
              ${PILGRIMAGE_MODES.map(
                (m) => `
                <button type="button" class="arrival-mode-card ${draftMode === m.id ? 'active' : ''}" data-arr-mode="${m.id}">
                  <div class="arrival-mode-title">${m.name}</div>
                  <div class="arrival-mode-desc">${m.desc}</div>
                  <div class="arrival-mode-meta">
                    <span>${m.arrivalVehicle === 'bus' ? '🚌 Xe đoàn' : m.arrivalVehicle === 'van' ? '🚐 Xe gia đình' : '🚗 Xe riêng'}</span>
                    <span>· ${m.companions.length > 0 ? `${m.companions.length} bạn đồng hành 3D` : 'Đi một mình tĩnh tâm'}</span>
                  </div>
                </button>`
              ).join('')}
            </div>
          </div>

          <div class="arrival-footer-actions">
            <button type="button" id="btn-arrival-start-car" class="arrival-primary-btn">
              ${vehLabel} · Khởi hành tới Chùa Vĩnh Tràng →
            </button>
            <button type="button" id="btn-arrival-skip-direct" class="arrival-secondary-btn">
              Vào thẳng sân chùa (Bỏ qua xe)
            </button>
          </div>
        </div>
        `,
        { variant: 'scroll' }
      );

      document.querySelectorAll('[data-arr-nat]').forEach((btn) => {
        btn.addEventListener('click', () => {
          draftNat = btn.getAttribute('data-arr-nat') || 'vn';
          const prof = getNationalityProfile(draftNat);
          if (prof?.preferredCharKey) draftChar = prof.preferredCharKey;
          this.playMokugyoTap();
          renderArrival();
        });
      });

      document.querySelectorAll('[data-arr-char]').forEach((btn) => {
        btn.addEventListener('click', () => {
          draftChar = btn.getAttribute('data-arr-char') || 'nu';
          this.playMokugyoTap();
          renderArrival();
        });
      });

      document.querySelectorAll('[data-arr-mode]').forEach((btn) => {
        btn.addEventListener('click', () => {
          draftMode = btn.getAttribute('data-arr-mode') || 'solo';
          this.playMokugyoTap();
          renderArrival();
        });
      });

      const commitSelection = () => {
        this.characterModelKey = draftChar;
        this.nationalityId = draftNat;
        this.pilgrimageModeId = draftMode;
        this.arrivalCompleted = true;
        this.world3d?.switchCharacter?.(draftChar);
        this.syncStoreVisualsTo3D();
        this.syncPilgrimageCompanionsTo3D();
        this.saveState();
        this.updateEquippedTags();
      };

      document.getElementById('btn-arrival-start-car')?.addEventListener('click', () => {
        commitSelection();
        this.closeModal();
        this.ensureAudioContext();

        const mode = getPilgrimageMode(this.pilgrimageModeId);
        const nat = getNationalityProfile(this.nationalityId);
        const banner = document.getElementById('arrival-cutscene-banner');
        const bannerLbl = document.getElementById('arrival-cutscene-label');
        if (banner) banner.style.display = 'inline-flex';
        if (bannerLbl) {
          bannerLbl.textContent = `${mode.arrivalVehicle === 'bus' ? '🚌 Xe đoàn hành hương' : mode.arrivalVehicle === 'van' ? '🚐 Xe gia đình' : '🚗 Xe ô tô'} đang đưa ${nat.flag} quý khách tới cổng Chùa Vĩnh Tràng...`;
        }

        const vehicleKind = mode.arrivalVehicle === 'bus' ? 'van' : mode.arrivalVehicle;
        this.world3d?.playArrivalCutscene?.({
          vehicleKind,
          onCue: (phase) => {
            if (phase === 'drive_in') {
              this.audio?.playCarArrivalSfx?.('arrive');
            } else if (phase === 'step_out') {
              this.audio?.playCarArrivalSfx?.('door_open');
              if (bannerLbl) {
                bannerLbl.textContent = '🚶 Quý khách xuống xe, theo Cổng Phụ Tịnh Độ bước vào sân Chùa Vĩnh Tràng...';
              }
            } else if (phase === 'enter_gate') {
              this.audio?.playBlessingChime?.();
              this.playVoiceAudio('s0_chao.mp3');
            }
          },
          onComplete: () => {
            const b = document.getElementById('arrival-cutscene-banner');
            if (b) b.style.display = 'none';
            this.syncPilgrimageCompanionsTo3D();
            this.updateActionBadges();
            this.showToast(`${nat.flag} Chào mừng tới Chùa Vĩnh Tràng`, nat.greeting, 4600, false);
            const todayKey = getLocalDateKey();
            if (shouldShowDailyDharmaToday(this.lastDailyDharmaDate, todayKey)) {
              setTimeout(() => {
                if (document.getElementById('universal-modal')?.classList.contains('open')) return;
                this.showDailyDharmaModal({ markSeenToday: true });
              }, 1100);
            }
          }
        });
      });

      document.getElementById('btn-arrival-skip-direct')?.addEventListener('click', () => {
        commitSelection();
        this.closeModal();
        this.ensureAudioContext();
        this.world3d?.skipArrivalCutscene?.(true);
        const b = document.getElementById('arrival-cutscene-banner');
        if (b) b.style.display = 'none';
        this.audio?.playBlessingChime?.();
        const nat = getNationalityProfile(this.nationalityId);
        this.showToast(`${nat.flag} Hoan hỷ vào sân Chùa Vĩnh Tràng`, nat.greeting, 4000, false);
        const todayKey = getLocalDateKey();
        if (shouldShowDailyDharmaToday(this.lastDailyDharmaDate, todayKey)) {
          this.showDailyDharmaModal({ markSeenToday: true });
        }
      });
    };

    renderArrival();
  },

  openBlessingTowerModal() {
    let selectedCategoryId = BLESSING_TOWER_CATEGORIES[0].id;
    let draftName = this.studentName || '';
    let draftBirthYear = '';
    let draftFamily = '';
    let draftWish = BLESSING_TOWER_CATEGORIES[0].blessingVerse;
    let feedbackMsg = '';
    let feedbackOk = false;

    const focusTowerIn3D = () => {
      this.closeModal();
      this.switchScreen('courtyard');
      if (!this.world3d) return;
      if (!this.world3d.insideInterior) {
        this.world3d.toggleInterior(true, 'right');
      }
      this.world3d.cancelAutoWalk?.();
      this.world3d.playerElevationY = 0;
      this.world3d.playerState.x = -1.1;
      this.world3d.playerState.z = -12.95;
      const yaw = Math.atan2(-3.35 - -1.1, -11.95 - -12.95);
      this.world3d.playerState.yaw = yaw;
      this.world3d.cameraBaseYaw = yaw;
      this.world3d.cameraAzimuthOffset = 0;
      this.world3d.syncPlayerTransform();
      this.world3d.checkStationProximity();
      this.world3d.renderFrame();
      this.showToast(
        '🏮 Tháp Đèn Cầu An · Cạnh Trên Chính Điện Đại Hùng Bửu Điện',
        '108 ô đèn Dược Sư 13 tầng bên cửa gỗ chấn song thắp sáng lời nguyện cầu bình an của Phật tử thập phương.',
        4200,
        false
      );
    };

    const renderTowerModal = () => {
      const entries = this.blessingTower?.entries || [];
      const activeCat =
        BLESSING_TOWER_CATEGORIES.find((c) => c.id === selectedCategoryId) || BLESSING_TOWER_CATEGORIES[0];

      this.openModal(
        '🏮 Tháp Đèn Dược Sư · Ghi Tên Cầu Phước Chánh Điện',
        `
        <div class="blessing-tower-modal-wrap">
          <div class="blessing-tower-hero">
            <div>
              <div class="blessing-tower-kicker">Đại Hùng Bửu Điện · Chùa Vĩnh Tràng</div>
              <div class="blessing-tower-headline">Đang thắp sáng <strong class="tabular-nums">${entries.length}/108</strong> ngọn đèn cầu phước trên 13 tầng bảo tháp</div>
              <div class="blessing-tower-sub">Mỗi danh vị đăng ký sẽ thắp sáng một ô đèn riêng biệt trên Tháp Đèn Cầu An bên cửa gỗ chấn song vào Chánh Điện.</div>
            </div>
            <button type="button" id="btn-bt-focus-3d" class="blessing-tower-view3d-btn">🚶 Đứng trước Tháp Đèn 3D</button>
          </div>

          <div class="blessing-tower-form-card">
            <div class="blessing-tower-field">
              <span class="hoadang-label">1. Chọn tâm nguyện cầu an:</span>
              <div class="blessing-tower-cat-grid">
                ${BLESSING_TOWER_CATEGORIES.map(
                  (c) => `
                  <button type="button" class="blessing-tower-cat-btn ${c.id === selectedCategoryId ? 'active' : ''}" data-bt-cat="${c.id}">
                    <span>${c.icon}</span>
                    <span>${c.label}</span>
                  </button>`
                ).join('')}
              </div>
            </div>

            <div class="blessing-tower-row-2col">
              <div class="blessing-tower-field">
                <label for="bt-devotee-name" class="hoadang-label">2. Họ tên hoặc Pháp danh người cầu an:</label>
                <input id="bt-devotee-name" type="text" class="hoadang-input" value="${draftName.replace(/"/g, '&quot;')}" placeholder="Ví dụ: Phật tử Diệu Hiền · Nguyễn Thị Mai" />
              </div>
              <div class="blessing-tower-field">
                <label for="bt-birth-year" class="hoadang-label">Năm sinh (tùy chọn):</label>
                <input id="bt-birth-year" type="text" inputmode="numeric" maxlength="4" class="hoadang-input" value="${draftBirthYear.replace(/"/g, '&quot;')}" placeholder="Ví dụ: 1965" />
              </div>
            </div>

            <div class="blessing-tower-field">
              <label for="bt-family-note" class="hoadang-label">3. Cùng gia quyến / Địa phương (tùy chọn):</label>
              <input id="bt-family-note" type="text" class="hoadang-input" value="${draftFamily.replace(/"/g, '&quot;')}" placeholder="Ví dụ: Cùng hợp gia quyến tại Mỹ Tho, Tiền Giang" />
            </div>

            <div class="blessing-tower-field">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
                <label for="bt-wish-text" class="hoadang-label">4. Lời chúc nguyện dâng lên Tam Bảo:</label>
                <button type="button" id="btn-bt-fill-verse" class="mail-reply-btn">Điền câu nguyện mẫu</button>
              </div>
              <textarea id="bt-wish-text" class="feedback-textarea" rows="2" placeholder="Nhập lời cầu an cho cha mẹ, gia đình hoặc bản thân...">${draftWish}</textarea>
            </div>

            ${
              feedbackMsg
                ? `<div id="bt-form-feedback" class="blessing-tower-feedback ${feedbackOk ? 'ok' : 'err'}" role="status">${feedbackMsg}</div>`
                : `<div id="bt-form-feedback" style="display:none;"></div>`
            }

            <button type="button" id="btn-submit-blessing-tower" class="arrival-primary-btn" style="width:100%;min-height:50px;">
              🏮 Thắp Đèn &amp; Ghi Tên Cầu Phước (+25 🪷 · +20 XP)
            </button>
          </div>

          <div class="hub-section-heading">📜 Danh sách Sớ Đèn Cầu An đang sáng trên Tháp (${entries.length}/108)</div>
          <div class="blessing-tower-entries-list" id="blessing-tower-entries-list">
            ${entries
              .slice(0, 24)
              .map((item) => {
                const cat = BLESSING_TOWER_CATEGORIES.find((c) => c.id === item.categoryId) || activeCat;
                return `
                <div class="blessing-tower-entry-row ${item.id === this.blessingTower?.lastRegisteredId ? 'highlight' : ''}">
                  <div class="blessing-tower-entry-head">
                    <strong class="blessing-tower-entry-name">${cat.icon} ${item.devoteeName}${item.birthYear ? ` (${item.birthYear})` : ''}</strong>
                    <span class="blessing-tower-entry-meta">Ô đèn #${item.slotNumber} · Tầng ${item.tier}/13 · ${cat.label} · ${item.dateKey}</span>
                  </div>
                  ${item.familyNote ? `<div class="blessing-tower-entry-family">${item.familyNote}</div>` : ''}
                  <div class="blessing-tower-entry-wish">“${item.wishText}”</div>
                </div>`;
              })
              .join('')}
          </div>
        </div>
        `,
        { variant: 'scroll' }
      );

      document.getElementById('btn-bt-focus-3d')?.addEventListener('click', focusTowerIn3D);

      document.querySelectorAll('[data-bt-cat]').forEach((btn) => {
        btn.addEventListener('click', () => {
          draftName = document.getElementById('bt-devotee-name')?.value ?? draftName;
          draftBirthYear = document.getElementById('bt-birth-year')?.value ?? draftBirthYear;
          draftFamily = document.getElementById('bt-family-note')?.value ?? draftFamily;
          const prevCat = BLESSING_TOWER_CATEGORIES.find((c) => c.id === selectedCategoryId);
          const curWishVal = document.getElementById('bt-wish-text')?.value ?? draftWish;
          selectedCategoryId = btn.getAttribute('data-bt-cat') || BLESSING_TOWER_CATEGORIES[0].id;
          const nextCat = BLESSING_TOWER_CATEGORIES.find((c) => c.id === selectedCategoryId) || BLESSING_TOWER_CATEGORIES[0];
          if (!curWishVal.trim() || (prevCat && curWishVal.trim() === prevCat.blessingVerse)) {
            draftWish = nextCat.blessingVerse;
          } else {
            draftWish = curWishVal;
          }
          feedbackMsg = '';
          this.playMokugyoTap();
          renderTowerModal();
        });
      });

      document.getElementById('btn-bt-fill-verse')?.addEventListener('click', () => {
        const cat = BLESSING_TOWER_CATEGORIES.find((c) => c.id === selectedCategoryId) || BLESSING_TOWER_CATEGORIES[0];
        draftWish = cat.blessingVerse;
        const ta = document.getElementById('bt-wish-text');
        if (ta) ta.value = draftWish;
        this.playMokugyoTap();
      });

      document.getElementById('btn-submit-blessing-tower')?.addEventListener('click', () => {
        draftName = document.getElementById('bt-devotee-name')?.value ?? '';
        draftBirthYear = document.getElementById('bt-birth-year')?.value ?? '';
        draftFamily = document.getElementById('bt-family-note')?.value ?? '';
        draftWish = document.getElementById('bt-wish-text')?.value ?? '';

        const res = registerBlessingTowerPrayer(
          this.blessingTower,
          {
            devoteeName: draftName,
            birthYear: draftBirthYear,
            familyNote: draftFamily,
            categoryId: selectedCategoryId,
            wishText: draftWish
          },
          new Date()
        );

        if (!res.ok) {
          feedbackOk = false;
          feedbackMsg = res.message;
          this.playMokugyoTap();
          renderTowerModal();
          return;
        }

        this.blessingTower = res.state;
        this.studentName = res.entry.devoteeName;
        this.storeProfile.lotusPoints += res.rewardLotus;
        this.spiritual = recordSpiritualMilestone(
          this.spiritual,
          `Thắp đèn cầu an tại Tháp Đèn Chánh Điện (Ô #${res.entry.slotNumber})`
        );
        this.grantPilgrimXp(res.rewardXp, 'Ghi tên Tháp Đèn Cầu An');
        this.syncBlessingTowerTo3D();
        this.saveState();
        this.updateActionBadges();
        this.playBellTone(243, 3.0);
        feedbackOk = true;
        feedbackMsg = `✨ ${res.message} (+${res.rewardLotus} 🪷 · +${res.rewardXp} XP)`;
        renderTowerModal();
      });
    };

    renderTowerModal();
  },

  openHoaDangModal() {
    let selectedColor = '#F79D65';
    let draftAuthor = this.studentName || 'Phật tử Tâm An';
    let draftWish = '';
    const palette = [
      { hex: '#F79D65', name: 'Cam Sen Ấm' },
      { hex: '#F4C95D', name: 'Vàng Bồ Đề' },
      { hex: '#EE7FAE', name: 'Hồng Liên Hoa' },
      { hex: '#A8DADC', name: 'Ngọc Thanh Tịnh' },
      { hex: '#FF9EBB', name: 'Phấn Đào Dịu' }
    ];
    const quickWishes = [
      'Cầu cho cha mẹ mạnh khỏe, gia đình thuận hòa bình an.',
      'Nguyện tâm luôn vững chãi, sáng suốt và biết lắng nghe.',
      'Hồi hướng công đức đến cửu huyền thất tổ và muôn loài.'
    ];

    const renderHoaDang = () => {
      const seasonal = getTempleSeasonalContext();
      this.openModal(
        '🏮 Thả Đèn Hoa Đăng Nguyện Ước · Hồ Sen Vĩnh Tràng',
        `
        <div class="hoadang-modal-wrap">
          <div class="activity-banner-row">
            <div>
              <div style="font-size:16px;font-weight:800;color:#FFD875;">Gửi Lời Nguyện Bình An Lên Mặt Hồ Sen 3D</div>
              <div style="font-size:13px;color:#FFF6E5;margin-top:2px;">
                ${seasonal.lunarLabel} · Đang có <strong>${this.hoaDangWishes.length} ngọn hoa đăng</strong> trôi sáng lung linh trên mặt hồ Vĩnh Tràng.
              </div>
            </div>
            <button type="button" id="btn-hoadang-walk-pond" class="quest-claim-btn" style="background:#3D6B4A;">🚶 Ra Hồ Sen ngắm đèn</button>
          </div>

          <div class="hoadang-compose-card">
            <div class="hoadang-form-row">
              <label for="hoadang-author-input" class="hoadang-label">Tên người thả đèn:</label>
              <input id="hoadang-author-input" type="text" class="hoadang-input" value="${draftAuthor.replace(/"/g, '&quot;')}" placeholder="Ví dụ: Cô Tư Mỹ Tho" />
            </div>

            <div class="hoadang-form-row">
              <span class="hoadang-label">Chọn sắc cánh sen đèn:</span>
              <div class="hoadang-color-row">
                ${palette
                  .map(
                    (c) => `
                  <button type="button" class="hoadang-color-chip ${selectedColor === c.hex ? 'active' : ''}" data-hd-color="${c.hex}">
                    <span class="hoadang-dot" style="background:${c.hex};"></span>
                    <span>${c.name}</span>
                  </button>`
                  )
                  .join('')}
              </div>
            </div>

            <div class="hoadang-form-row">
              <label for="hoadang-wish-input" class="hoadang-label">Lời nguyện ước an lành:</label>
              <div class="hoadang-presets-row">
                ${quickWishes
                  .map(
                    (qw, idx) => `
                  <button type="button" class="mail-reply-btn" data-hd-preset="${idx}">✨ ${qw}</button>`
                  )
                  .join('')}
              </div>
              <textarea id="hoadang-wish-input" class="feedback-textarea" rows="2" placeholder="Viết lời chúc bình an cho cha mẹ, gia đình hoặc chính mình...">${draftWish}</textarea>
            </div>

            <button type="button" id="btn-release-hoadang" class="arrival-primary-btn" style="width:100%;">
              🏮 Thả Hoa Đăng Lên Hồ Sen (+30 🪷 · +25 XP)
            </button>
          </div>

          <div class="hub-section-heading">🕯️ Các ngọn hoa đăng đang trôi trên Hồ Sen (${this.hoaDangWishes.length})</div>
          <div class="hoadang-wishes-list">
            ${this.hoaDangWishes.slice(0, 12)
              .map((w) => {
                const nat = getNationalityProfile(w.nationalityId || 'vn');
                return `
                <div class="hoadang-wish-item">
                  <span class="hoadang-wish-glow" style="background:${w.colorHex || '#F79D65'};"></span>
                  <div style="flex:1;min-width:0;">
                    <div class="hoadang-wish-author">${nat.flag} ${w.authorName} <span class="hoadang-wish-time">· ${w.createdAt}</span></div>
                    <div class="hoadang-wish-text">“${w.wishText}”</div>
                  </div>
                </div>`;
              })
              .join('')}
          </div>
        </div>
        `
      );

      document.getElementById('btn-hoadang-walk-pond')?.addEventListener('click', () => {
        this.closeModal();
        this.switchScreen('courtyard');
        if (this.world3d?.insideInterior) this.toggleInteriorHallIn3D(false);
        this.walkToStationIn3D('ho_sen_ca_koi');
      });

      document.querySelectorAll('[data-hd-color]').forEach((btn) => {
        btn.addEventListener('click', () => {
          draftAuthor = document.getElementById('hoadang-author-input')?.value || draftAuthor;
          draftWish = document.getElementById('hoadang-wish-input')?.value || draftWish;
          selectedColor = btn.getAttribute('data-hd-color') || '#F79D65';
          this.playMokugyoTap();
          renderHoaDang();
        });
      });

      document.querySelectorAll('[data-hd-preset]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-hd-preset') || 0);
          draftWish = quickWishes[idx] || quickWishes[0];
          const ta = document.getElementById('hoadang-wish-input');
          if (ta) ta.value = draftWish;
          this.playMokugyoTap();
        });
      });

      document.getElementById('btn-release-hoadang')?.addEventListener('click', () => {
        const authorVal = document.getElementById('hoadang-author-input')?.value || this.studentName || 'Phật tử thập phương';
        const wishVal = document.getElementById('hoadang-wish-input')?.value || '';
        const res = createHoaDangLantern(this.hoaDangWishes, {
          authorName: authorVal,
          nationalityId: this.nationalityId,
          wishText: wishVal,
          colorHex: selectedColor
        });
        if (!res.ok) return;
        this.hoaDangWishes = res.wishes;
        this.studentName = authorVal.trim() || this.studentName;
        this.storeProfile.lotusPoints += 30;
        this.spiritual = recordSpiritualMilestone(this.spiritual, 'Thả Hoa Đăng Nguyện Ước tại Hồ Sen');
        this.grantPilgrimXp(25, 'Thả Hoa Đăng');
        this.syncHoaDangLanternsTo3D();
        this.saveState();
        this.updateActionBadges();
        this.audio?.playBlessingChime?.();
        this.audio?.playCoinLotusSfx?.();
        this.showToast('🏮 Đã thả hoa đăng lên Hồ Sen', `${res.message} (+30 🪷 · +25 XP)`, 4200, true);
        draftWish = '';
        renderHoaDang();
      });
    };

    renderHoaDang();
  },

  highlightInteriorZoneChip(zoneKey) {
    document.querySelectorAll('[data-interior-zone]').forEach((btn) => {
      const match = btn.getAttribute('data-interior-zone') === zoneKey;
      btn.classList.toggle('active', match);
    });
  }
};
