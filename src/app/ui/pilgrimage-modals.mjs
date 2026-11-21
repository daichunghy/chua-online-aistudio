/**
 * Modal tiền hành hương, tháp cầu an, hoa đăng.
 *
 * Mixin của ChuaOnlineApp: 4 method (openArrivalPilgrimageModal … highlightInteriorZoneChip).
 * Được gắn vào class trong chua-online-app.mjs qua applyMixins().
 */
import { CHARACTER_PROFILES, recordSpiritualMilestone, getLocalDateKey, shouldShowDailyDharmaToday, getNationalityProfile, getPilgrimageMode, getTempleSeasonalContext, createHoaDangLantern, BLESSING_TOWER_CATEGORIES, registerBlessingTowerPrayer, filterBlessingTowerEntries, FORTUNE_INTENTIONS, createFortuneHistoryState, drawFortuneStick, tossYinYangBlocks, recordFortuneReading } from './shared.mjs';

const BLESSING_TOWER_BACKUP_KEY = 'chua_online_blessing_tower_v2';

function charRoleIcon(key) {
  const icons = {
    nu: '🪷',
    nam: '🙏',
    tre_em: '🌱',
    co_tu: '🌸',
    chu_sau: '☕',
    su_thay: '🔔',
    du_khach: '🧭'
  };
  return icons[key] || '🪷';
}

export const pilgrimageModalsMethods = {
  openArrivalPilgrimageModal() {
    let draftChar = this.characterModelKey || 'nu';
    let draftName = this.studentName || 'Phật tử Tâm An';
    let draftMode = ['solo', 'family', 'group'].includes(this.pilgrimageModeId) ? this.pilgrimageModeId : 'solo';
    let previewPose = 'Dung';

    const companionOptions = [
      { id: 'solo', label: '🧘 Một mình' },
      { id: 'family', label: '👨‍👩‍👧 Gia đình' },
      { id: 'group', label: '🤝 Nhóm đạo hữu' }
    ];

    const renderArrival = () => {
      const activeProf = CHARACTER_PROFILES.find((c) => c.key === draftChar) || CHARACTER_PROFILES[0];

      this.openModal(
        'Chọn Nhân Vật Vào Chùa Vĩnh Tràng',
        `
        <div class="char-select-shell">
          <div class="char-select-stage">
            <div class="profile-3d-viewport">
              <canvas id="arrival-char-3d-canvas"></canvas>
              <div class="profile-stage-hint">Kéo để xoay 360°</div>
              <div class="profile-pose-pills">
                <button type="button" class="profile-pose-btn ${previewPose === 'Dung' ? 'active' : ''}" data-arr-pose="Dung">Đứng</button>
                <button type="button" class="profile-pose-btn ${previewPose === 'Chắp tay' ? 'active' : ''}" data-arr-pose="Chắp tay">Chắp tay</button>
                <button type="button" class="profile-pose-btn ${previewPose === 'Quỳ' ? 'active' : ''}" data-arr-pose="Quỳ">Quỳ</button>
              </div>
            </div>
            <div class="char-spotlight-info">
              <div class="char-spotlight-name">${activeProf.name.split('(')[0].trim()}</div>
              <div class="char-spotlight-meta">${activeProf.heightLabel} · ${activeProf.outfitName.split('(')[0].trim()}</div>
            </div>
          </div>

          <div class="char-select-controls">
            <div class="char-field-group">
              <label for="arr-player-name" class="char-field-label">Tên hoặc Pháp danh</label>
              <input id="arr-player-name" type="text" class="char-name-input" maxlength="40" value="${String(draftName).replace(/"/g, '&quot;')}" placeholder="Ví dụ: Phật tử Tâm An" />
            </div>

            <div class="char-field-group">
              <span class="char-field-label">Chọn dáng nhân vật</span>
              <div class="char-roster-grid">
                ${CHARACTER_PROFILES.map(
                  (c) => `
                  <button type="button" class="char-roster-card ${draftChar === c.key ? 'active' : ''}" data-arr-char="${c.key}">
                    <span class="char-roster-avatar">${charRoleIcon(c.key)}</span>
                    <span class="char-roster-text">
                      <strong>${c.name.split('(')[0].trim()}</strong>
                      <span>${c.outfitName.split('(')[0].trim()}</span>
                    </span>
                  </button>`
                ).join('')}
              </div>
            </div>

            <div class="char-field-group">
              <span class="char-field-label">Đồng hành</span>
              <div class="char-companion-row">
                ${companionOptions
                  .map(
                    (opt) => `
                  <button type="button" class="char-companion-btn ${draftMode === opt.id ? 'active' : ''}" data-arr-mode="${opt.id}">
                    ${opt.label}
                  </button>`
                  )
                  .join('')}
              </div>
            </div>

            <button type="button" id="btn-arrival-enter-direct" class="char-primary-cta">
              🪷 Vào Chùa Vĩnh Tràng
            </button>
            <button type="button" id="btn-arrival-start-car" class="char-subtle-link-btn">
              Xem hoạt cảnh xe đưa tới cổng chùa
            </button>
          </div>
        </div>
        `,
        { variant: 'scroll' }
      );

      this.mountProfileCharacterStage?.('arrival-char-3d-canvas', {
        charKey: draftChar,
        pose: previewPose
      });

      document.querySelectorAll('[data-arr-pose]').forEach((btn) => {
        btn.addEventListener('click', () => {
          draftName = document.getElementById('arr-player-name')?.value ?? draftName;
          previewPose = btn.getAttribute('data-arr-pose') || 'Dung';
          this.mountProfileCharacterStage?.('arrival-char-3d-canvas', {
            charKey: draftChar,
            pose: previewPose
          });
          document.querySelectorAll('[data-arr-pose]').forEach((b) => b.classList.toggle('active', b === btn));
        });
      });

      document.querySelectorAll('[data-arr-char]').forEach((btn) => {
        btn.addEventListener('click', () => {
          draftName = document.getElementById('arr-player-name')?.value ?? draftName;
          draftChar = btn.getAttribute('data-arr-char') || 'nu';
          this.playMokugyoTap?.();
          renderArrival();
        });
      });

      document.querySelectorAll('[data-arr-mode]').forEach((btn) => {
        btn.addEventListener('click', () => {
          draftName = document.getElementById('arr-player-name')?.value ?? draftName;
          draftMode = btn.getAttribute('data-arr-mode') || 'solo';
          this.playMokugyoTap?.();
          renderArrival();
        });
      });

      const commitSelection = () => {
        const cleanName = String(document.getElementById('arr-player-name')?.value || draftName || '').trim();
        this.studentName = cleanName || 'Phật tử Tâm An';
        this.characterModelKey = draftChar;
        this.pilgrimageModeId = draftMode;
        this.arrivalCompleted = true;
        this.world3d?.switchCharacter?.(draftChar);
        this.syncStoreVisualsTo3D?.();
        this.syncPilgrimageCompanionsTo3D?.();
        this.saveState();
        this.updateEquippedTags?.();
        this.syncVisitorPresence?.();
      };

      document.getElementById('btn-arrival-enter-direct')?.addEventListener('click', () => {
        commitSelection();
        this.closeModal();
        this.ensureAudioContext?.();
        this.world3d?.skipArrivalCutscene?.(true);
        const b = document.getElementById('arrival-cutscene-banner');
        if (b) b.style.display = 'none';
        this.audio?.playBlessingChime?.();
        this.showToast(`🪷 Hoan hỷ chào đón ${this.studentName}`, 'Mời bạn thong thả dạo bước chiêm bái sân Chùa Vĩnh Tràng.', 3800, false);
        const todayKey = getLocalDateKey();
        if (shouldShowDailyDharmaToday(this.lastDailyDharmaDate, todayKey)) {
          this.showDailyDharmaModal({ markSeenToday: true });
        }
      });

      document.getElementById('btn-arrival-start-car')?.addEventListener('click', () => {
        commitSelection();
        this.closeModal();
        this.ensureAudioContext?.();

        const mode = getPilgrimageMode(this.pilgrimageModeId);
        const nat = getNationalityProfile(this.nationalityId);
        const banner = document.getElementById('arrival-cutscene-banner');
        const bannerLbl = document.getElementById('arrival-cutscene-label');
        if (banner) banner.style.display = 'inline-flex';
        if (bannerLbl) {
          bannerLbl.textContent = `${mode.arrivalVehicle === 'bus' ? '🚌 Xe đoàn hành hương' : mode.arrivalVehicle === 'van' ? '🚐 Xe gia đình' : '🚗 Xe ô tô'} đang đưa ${this.studentName} tới cổng Chùa Vĩnh Tràng...`;
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
                bannerLbl.textContent = '🚶 Xuống xe, theo Cổng Phụ Tịnh Độ bước vào sân Chùa Vĩnh Tràng...';
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
            this.showToast(`${nat.flag} Chào mừng tới Chùa Vĩnh Tràng`, nat.greeting, 4200, false);
          }
        });
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
    let searchQuery = '';
    let feedbackMsg = '';
    let feedbackOk = false;

    const focusTowerIn3D = () => {
      this.closeModal();
      this.switchScreen('courtyard');
      if (!this.world3d) return;
      if (this.world3d.insideInterior) {
        this.world3d.exitInteriorHall?.(true, 'front_tam_quan');
      }
      this.world3d.cancelAutoWalk?.();
      this.world3d.playerElevationY = 0;
      this.world3d.playerState.x = 28.2;
      this.world3d.playerState.z = 19.2;
      const yaw = Math.atan2(28.2 - 28.2, 15.2 - 19.2);
      this.world3d.playerState.yaw = yaw;
      this.world3d.cameraBaseYaw = yaw;
      this.world3d.cameraAzimuthOffset = 0;
      this.world3d.syncPlayerTransform?.(true);
      this.world3d.checkStationProximity?.();
      this.world3d.renderFrame?.();
      this.showToast(
        '🏮 Tháp Đèn Cầu An · Sân Trước Chánh Điện',
        'Đặt trang nghiêm bên ngoài cổng trước Chánh Điện theo hướng Phật nhìn ra Cổng Tam Quan, có bảng ghi tên cầu an trực tiếp.',
        4400,
        false
      );
    };

    const renderTowerModal = () => {
      const allEntries = this.blessingTower?.entries || [];
      const entries = filterBlessingTowerEntries(allEntries, searchQuery);
      const activeCat =
        BLESSING_TOWER_CATEGORIES.find((c) => c.id === selectedCategoryId) || BLESSING_TOWER_CATEGORIES[0];

      this.openModal(
        '🏮 Tháp Đèn Cầu An · Sân Trước Chánh Điện',
        `
        <div class="blessing-tower-modal-wrap">
          <div class="blessing-tower-hero">
            <div>
              <div class="blessing-tower-kicker">Sân Trước Chánh Điện · Hướng Phật Nhìn Ra Tam Quan</div>
              <div class="blessing-tower-headline">Đang thắp sáng <strong class="tabular-nums">${allEntries.length}/108</strong> ngọn đèn cầu an &amp; lưu danh vị vĩnh viễn</div>
              <div class="blessing-tower-sub">Mỗi tên cầu an bạn ghi sẽ thắp sáng ô đèn trên Tháp Đèn 3D ngoài sân Chánh Điện, cập nhật lên Bảng Ghi Tên và lưu giữ an toàn.</div>
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
              🏮 Thắp Đèn &amp; Ghi Tên Cầu An (+25 🪷 · +20 XP)
            </button>
          </div>

          <div class="blessing-tower-search-row">
            <div class="hub-section-heading" style="margin:0;">📜 Danh sách Sớ Đèn Cầu An (${allEntries.length}/108)</div>
            <input id="bt-search-input" type="search" class="blessing-tower-search-input" value="${searchQuery.replace(/"/g, '&quot;')}" placeholder="Tìm tên hoặc số ô đèn đã ghi..." />
          </div>
          <div class="blessing-tower-entries-list" id="blessing-tower-entries-list">
            ${
              entries.length === 0
                ? `<div class="social-empty-box">Không tìm thấy danh vị phù hợp với “${searchQuery.replace(/</g, '&lt;')}”.</div>`
                : entries
                    .slice(0, 32)
                    .map((item) => {
                      const cat = BLESSING_TOWER_CATEGORIES.find((c) => c.id === item.categoryId) || activeCat;
                      return `
                      <div class="blessing-tower-entry-row ${item.id === this.blessingTower?.lastRegisteredId ? 'highlight' : ''}">
                        <div class="blessing-tower-entry-head">
                          <strong class="blessing-tower-entry-name">${cat.icon} ${item.devoteeName}${item.birthYear ? ` (${item.birthYear})` : ''}</strong>
                          <span class="blessing-tower-entry-meta tabular-nums">Ô đèn #${item.slotNumber} · Tầng ${item.tier}/13 · ${cat.label} · ${item.dateKey}</span>
                        </div>
                        ${item.familyNote ? `<div class="blessing-tower-entry-family">${item.familyNote}</div>` : ''}
                        <div class="blessing-tower-entry-wish">“${item.wishText}”</div>
                      </div>`;
                    })
                    .join('')
            }
          </div>
        </div>
        `,
        { variant: 'scroll' }
      );

      document.getElementById('btn-bt-focus-3d')?.addEventListener('click', focusTowerIn3D);

      document.getElementById('bt-search-input')?.addEventListener('input', (e) => {
        draftName = document.getElementById('bt-devotee-name')?.value ?? draftName;
        draftBirthYear = document.getElementById('bt-birth-year')?.value ?? draftBirthYear;
        draftFamily = document.getElementById('bt-family-note')?.value ?? draftFamily;
        draftWish = document.getElementById('bt-wish-text')?.value ?? draftWish;
        searchQuery = e.target?.value || '';
        const listEl = document.getElementById('blessing-tower-entries-list');
        if (!listEl) return;
        const filtered = filterBlessingTowerEntries(this.blessingTower?.entries || [], searchQuery);
        listEl.innerHTML =
          filtered.length === 0
            ? `<div class="social-empty-box">Không tìm thấy danh vị phù hợp.</div>`
            : filtered
                .slice(0, 32)
                .map((item) => {
                  const cat = BLESSING_TOWER_CATEGORIES.find((c) => c.id === item.categoryId) || activeCat;
                  return `
                  <div class="blessing-tower-entry-row ${item.id === this.blessingTower?.lastRegisteredId ? 'highlight' : ''}">
                    <div class="blessing-tower-entry-head">
                      <strong class="blessing-tower-entry-name">${cat.icon} ${item.devoteeName}${item.birthYear ? ` (${item.birthYear})` : ''}</strong>
                      <span class="blessing-tower-entry-meta tabular-nums">Ô đèn #${item.slotNumber} · Tầng ${item.tier}/13 · ${cat.label} · ${item.dateKey}</span>
                    </div>
                    ${item.familyNote ? `<div class="blessing-tower-entry-family">${item.familyNote}</div>` : ''}
                    <div class="blessing-tower-entry-wish">“${item.wishText}”</div>
                  </div>`;
                })
                .join('');
      });

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
          `Thắp đèn cầu an tại Tháp Đèn Sân Chánh Điện (Ô #${res.entry.slotNumber})`
        );
        this.grantPilgrimXp(res.rewardXp, 'Ghi tên Tháp Đèn Cầu An');
        this.recordVirtueProgress?.('blessing', 'Tháp Đèn Cầu An');

        try {
          localStorage.setItem(BLESSING_TOWER_BACKUP_KEY, JSON.stringify(this.blessingTower));
        } catch {}
        this.saveState();
        this.syncBlessingTowerTo3D();
        this.syncBlessingTowerEntryToCloud?.(res.entry);
        this.updateActionBadges();
        this.playBellTone(243, 3.0);
        feedbackOk = true;
        feedbackMsg = `✨ ${res.message} — Đã ghi nhận vào Bảng Tên & lưu an toàn (+${res.rewardLotus} 🪷 · +${res.rewardXp} XP)`;
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
        this.recordVirtueProgress?.('lantern', 'Thả Hoa Đăng Hồ Sen');
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

  openXinXamModal() {
    const FORTUNE_STORAGE_KEY = 'chua_online_fortune_history_v1';
    if (!this.fortuneHistory || typeof this.fortuneHistory !== 'object') {
      try {
        const raw = localStorage.getItem(FORTUNE_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        this.fortuneHistory =
          parsed && Array.isArray(parsed.readings) ? parsed : createFortuneHistoryState();
      } catch {
        this.fortuneHistory = createFortuneHistoryState();
      }
    }
    const persistFortune = () => {
      try {
        localStorage.setItem(FORTUNE_STORAGE_KEY, JSON.stringify(this.fortuneHistory));
      } catch {
        // ignore quota errors
      }
    };
    let selectedIntention = 'binh_an';
    let currentReading = this.fortuneHistory.lastReading || null;
    let isShaking = false;
    let showingDetails = Boolean(currentReading);

    const escapeHtml = (s) =>
      String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const renderXinXam = () => {
      const stick = currentReading?.stick || null;
      const keo = currentReading?.keoResult || null;
      const historyList = Array.isArray(this.fortuneHistory?.readings)
        ? this.fortuneHistory.readings.slice(0, 5)
        : [];

      const rankColor =
        stick?.rankTone === 'gold'
          ? '#F6D16B'
          : stick?.rankTone === 'jade'
          ? '#7ED3A5'
          : '#F2B26B';

      this.openModal(
        '🎋 Xin Xăm · Xem Quẻ Quan Âm',
        `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div style="padding:12px 14px;border-radius:12px;background:#4A1F12;border:1px solid #C89B4B;font-size:13.5px;line-height:1.55;color:#FFF6E0;">
            Thành tâm chắp tay niệm <strong style="color:#FFD97A;">Nam Mô Quán Thế Âm Bồ Tát</strong>, chọn tâm nguyện rồi bấm <strong style="color:#FFD97A;">Xóc Ống Xăm</strong> để thỉnh quẻ và gieo keo âm dương.
          </div>

          <div>
            <div style="font-size:13px;font-weight:800;letter-spacing:0.02em;color:#5A2512;margin-bottom:8px;">1. Chọn tâm nguyện cầu xin</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${FORTUNE_INTENTIONS.map(
                (item) => `
                <button type="button" data-xam-intent="${item.id}"
                  style="padding:7px 12px;border-radius:10px;border:1.5px solid ${selectedIntention === item.id ? '#8E2616' : 'rgba(90,46,24,0.34)'};background:${selectedIntention === item.id ? '#8E2616' : '#EFE0BE'};color:${selectedIntention === item.id ? '#FFF8E6' : '#3C1D0E'};font-size:13px;font-weight:${selectedIntention === item.id ? '700' : '600'};cursor:pointer;">
                  ${item.icon} ${escapeHtml(item.label)}
                </button>`
              ).join('')}
            </div>
          </div>

          <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;">
            <button type="button" id="btn-xam-shake" ${isShaking ? 'disabled' : ''}
              style="flex:1;min-width:190px;padding:12px 16px;border-radius:12px;border:1.5px solid #D99B2A;background:linear-gradient(135deg,#9E2A1B,#B85819);color:#FFF8E5;font-size:15px;font-weight:700;cursor:pointer;">
              ${isShaking ? '🎋 Đang xóc ống xăm...' : '🎋 Xóc Ống Xăm Thỉnh Quẻ'}
            </button>
            ${
              stick
                ? `<button type="button" id="btn-xam-keo"
                    style="padding:12px 15px;border-radius:12px;border:1.5px solid #C89236;background:#5E1912;color:#FFF4D8;font-size:14px;font-weight:700;cursor:pointer;">
                    🔴 Gieo Keo Âm Dương
                  </button>`
                : ''
            }
          </div>

          ${
            keo
              ? `<div style="padding:11px 14px;border-radius:10px;border:1.5px solid ${keo.approved ? '#2A7A4B' : '#A6561A'};background:${keo.approved ? '#1B4F32' : '#5E2E12'};font-size:13px;line-height:1.5;color:#FFF6E2;">
                  <strong style="color:${keo.approved ? '#A6F2C4' : '#FFD48A'};">${keo.approved ? '✅' : '🌗'} ${escapeHtml(keo.label)}</strong> (${escapeHtml(keo.faces.join(' · '))})<br/>
                  <span>${escapeHtml(keo.message)}</span>
                </div>`
              : ''
          }

          ${
            stick && showingDetails
              ? `<div style="padding:16px;border-radius:14px;background:linear-gradient(180deg,#3C190F,#241009);border:1.5px solid #C89B4B;display:flex;flex-direction:column;gap:10px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
                    <div style="font-size:18px;font-weight:800;color:#FFE7A8;">Quẻ Xăm Số ${stick.number}</div>
                    <span style="padding:4px 10px;border-radius:8px;background:rgba(246,209,107,0.16);border:1px solid ${rankColor};color:${rankColor};font-size:12.5px;font-weight:700;">${escapeHtml(stick.rank)}</span>
                  </div>
                  <div style="font-size:15px;font-weight:700;color:#FFF6E0;">${escapeHtml(stick.title)}</div>
                  <div style="padding:10px 12px;border-radius:10px;background:rgba(16,9,6,0.52);border-left:3px solid #E8B84B;font-style:italic;line-height:1.7;color:#FCE9BF;font-size:14px;">
                    ${stick.poem.map((line) => `<div>${escapeHtml(line)}</div>`).join('')}
                  </div>
                  <div style="font-size:12.5px;color:#E6CEA2;">${escapeHtml(stick.story)}</div>
                  <div style="font-size:13.5px;line-height:1.55;color:#FFF4DC;"><strong>Lời giải:</strong> ${escapeHtml(stick.summary)}</div>
                  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;margin-top:2px;">
                    <div style="padding:9px 10px;border-radius:10px;background:rgba(255,244,218,0.08);font-size:12.5px;line-height:1.45;color:#F8EBD0;">
                      <strong style="color:#F5CA68;">🏠 Gia đạo</strong><br/>${escapeHtml(stick.family)}
                    </div>
                    <div style="padding:9px 10px;border-radius:10px;background:rgba(255,244,218,0.08);font-size:12.5px;line-height:1.45;color:#F8EBD0;">
                      <strong style="color:#F5CA68;">💼 Công việc</strong><br/>${escapeHtml(stick.career)}
                    </div>
                    <div style="padding:9px 10px;border-radius:10px;background:rgba(255,244,218,0.08);font-size:12.5px;line-height:1.45;color:#F8EBD0;">
                      <strong style="color:#F5CA68;">🌿 Sức khỏe</strong><br/>${escapeHtml(stick.health)}
                    </div>
                  </div>
                  <div style="padding:9px 12px;border-radius:10px;background:rgba(36,96,64,0.42);border:1px solid rgba(126,211,165,0.45);font-size:13px;line-height:1.5;color:#E6FAEE;">
                    🪷 <strong>Lời khuyên tu tập:</strong> ${escapeHtml(stick.dharmaAdvice)}
                  </div>
                </div>`
              : `<div style="padding:20px;border-radius:12px;text-align:center;background:#EFE1C0;border:1.5px dashed rgba(94,44,20,0.38);color:#4E2312;font-size:13.5px;font-weight:600;">
                  Bấm <strong>Xóc Ống Xăm Thỉnh Quẻ</strong> để rút một thẻ xăm tại Bàn Xin Xăm Quan Âm.
                </div>`
          }

          ${
            historyList.length > 0
              ? `<div>
                  <div style="font-size:12.5px;font-weight:800;color:#5A2512;margin-bottom:6px;">Các quẻ đã thỉnh gần đây (${this.fortuneHistory.totalDraws} lượt)</div>
                  <div style="display:flex;flex-direction:column;gap:6px;">
                    ${historyList
                      .map(
                        (r) => `<button type="button" data-xam-history="${escapeHtml(r.id)}"
                          style="display:flex;justify-content:space-between;align-items:center;padding:8px 11px;border-radius:9px;border:1px solid rgba(90,46,24,0.28);background:#EFE0BE;color:#3A1B0D;font-size:12.5px;font-weight:600;cursor:pointer;text-align:left;">
                          <span>🎋 Số ${r.stick.number} · ${escapeHtml(r.stick.title)}</span>
                          <span style="color:#8E2616;font-weight:700;">${escapeHtml(r.stick.rank)}</span>
                        </button>`
                      )
                      .join('')}
                  </div>
                </div>`
              : ''
          }
        </div>
        `,
        { variant: 'scroll' }
      );

      document.querySelectorAll('[data-xam-intent]').forEach((btn) => {
        btn.addEventListener('click', () => {
          selectedIntention = btn.getAttribute('data-xam-intent') || 'binh_an';
          this.playMokugyoTap?.();
          renderXinXam();
        });
      });

      document.getElementById('btn-xam-shake')?.addEventListener('click', () => {
        if (isShaking) return;
        isShaking = true;
        this.audio?.playBambooShakeSfx?.();
        renderXinXam();
        setTimeout(() => {
          isShaking = false;
          const drawn = drawFortuneStick(selectedIntention);
          currentReading = drawn;
          showingDetails = true;
          this.fortuneHistory = recordFortuneReading(this.fortuneHistory, drawn);
          this.storeProfile.lotusPoints += 8;
          this.spiritual = recordSpiritualMilestone(
            this.spiritual,
            `Xin Xăm Quan Âm · Quẻ số ${drawn.stick.number} (${drawn.stick.rank})`
          );
          this.grantPilgrimXp?.(8, 'Xin Xăm Quan Âm');
          this.recordVirtueProgress?.('fortune', `Xin Xăm Quẻ #${drawn.stick.number}`);
          persistFortune();
          this.saveState?.();
          this.updateActionBadges?.();
          this.playBellTone?.(324, 1.8);
          renderXinXam();
        }, 520);
      });

      document.getElementById('btn-xam-keo')?.addEventListener('click', () => {
        if (!currentReading) return;
        this.playMokugyoTap?.(true);
        const keoRes = tossYinYangBlocks();
        currentReading = { ...currentReading, keoResult: keoRes };
        this.fortuneHistory = {
          ...this.fortuneHistory,
          lastReading: currentReading,
          readings: (this.fortuneHistory.readings || []).map((r) =>
            r.id === currentReading.id ? currentReading : r
          )
        };
        persistFortune();
        this.saveState?.();
        if (keoRes.approved) this.audio?.playBlessingChime?.();
        renderXinXam();
      });

      document.querySelectorAll('[data-xam-history]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const rid = btn.getAttribute('data-xam-history');
          const found = (this.fortuneHistory?.readings || []).find((r) => r.id === rid);
          if (found) {
            currentReading = found;
            showingDetails = true;
            this.playMokugyoTap?.();
            renderXinXam();
          }
        });
      });
    };

    renderXinXam();
  },

  highlightInteriorZoneChip(zoneKey) {
    document.querySelectorAll('[data-interior-zone]').forEach((btn) => {
      const match = btn.getAttribute('data-interior-zone') === zoneKey;
      btn.classList.toggle('active', match);
    });
  }
};
