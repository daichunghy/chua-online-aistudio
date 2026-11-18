/**
 * Lời Phật dạy mỗi ngày và toàn bộ HTML khung ứng dụng (mountDOM).
 *
 * Mixin của ChuaOnlineApp: 2 method (showDailyDharmaModal … mountDOM).
 * Được gắn vào class trong chua-online-app.mjs qua applyMixins().
 */
import { getLocalDateKey, pickDailyDharmaQuote, fetchDailyDharmaService, recordDailyMissionMetric, getTempleSeasonalContext } from './shared.mjs';

export const shellDomMethods = {
  async showDailyDharmaModal({ markSeenToday = false } = {}) {
    const renderQuoteModal = (quoteObj, dateKey) => {
      if (!quoteObj) return;
      if (markSeenToday && dateKey) {
        this.lastDailyDharmaDate = dateKey;
      }
      this.lastDailyDharmaQuoteId = quoteObj.id;
      this.activityHub = recordDailyMissionMetric(this.activityHub, 'dailyQuotesRead', 1, dateKey || getLocalDateKey());
      this.saveState();
      this.updateActivityHubBadge();

      this.openModal(
        'Lời Phật dạy hôm nay',
        `
        <div class="daily-dharma-card">
          <div class="daily-dharma-eyebrow">🪷 Một câu gợi nhớ bình an cho ngày mới</div>
          <div class="daily-dharma-quote-box">
            <blockquote class="daily-dharma-quote">“${quoteObj.quote}”</blockquote>
            <div class="daily-dharma-source">— ${quoteObj.source}${quoteObj.book ? ` · ${quoteObj.book}` : ''}</div>
          </div>
          ${
            quoteObj.reflection
              ? `<div class="daily-dharma-reflection"><strong>Gợi ý thực hành:</strong> ${quoteObj.reflection}</div>`
              : ''
          }
          <div class="daily-dharma-actions">
            <button type="button" class="daily-dharma-secondary-btn" id="btn-daily-dharma-another">Đọc thêm một câu</button>
            <button type="button" class="daily-dharma-primary-btn" id="btn-daily-dharma-enter">Vào sân chùa</button>
          </div>
        </div>
        `,
        { variant: 'scroll' }
      );

      document.getElementById('btn-daily-dharma-another')?.addEventListener('click', () => {
        const nextQ = pickDailyDharmaQuote(
          this.dailyDharmaQuotes.length ? this.dailyDharmaQuotes : undefined,
          this.lastDailyDharmaQuoteId
        );
        if (nextQ) renderQuoteModal(nextQ, dateKey);
      });

      document.getElementById('btn-daily-dharma-enter')?.addEventListener('click', () => {
        this.closeModal();
        this.playBellTone(260, 1.8);
        this.world3d?.startEntranceCameraTour();
        this.showToast(
          'Hành hương sáng Chùa Vĩnh Tràng',
          'Đoàn hành hương theo Cổng Phụ bên phải, ghé quán nước mía · Nhà Tạp Hóa rồi qua con đường hoa giấy vào Chánh điện.',
          4800,
          false
        );
      });
    };

    const result = await fetchDailyDharmaService({
      url: '/data/daily-dharma.json',
      simulatedDelayMs: 40,
      excludeId: this.lastDailyDharmaQuoteId
    });
    if (Array.isArray(result.quotes) && result.quotes.length > 0) {
      this.dailyDharmaQuotes = result.quotes;
    }
    renderQuoteModal(result.quote, result.dateKey);
  },

  /* ========================================================================
     DOM MOUNTING — Live Walkable 3D World + Reference HUDs 1, 2, 3, 4
     ======================================================================== */
  mountDOM() {
    const root = document.getElementById('app-root');
    if (!root) return;

    root.innerHTML = `
      <!-- ================= 1. LIVE WALKABLE 3D COURTYARD & TEMPLE GROUNDS ================= -->
      <div id="scene-stage">
        <canvas id="courtyard-backdrop"></canvas>

        <!-- Primary Live 3D WebGL Walkable Temple World -->
        <div id="world3d-container" class="active">
          <canvas id="world3d-canvas"></canvas>
        </div>

        <!-- 3D Projected Single Destination Pin (Matches Reference Image 1) -->
        <div id="scene-pins-layer">
          <button id="pin-chanh-dien" class="scene-pin" style="left:50%;top:37.2%;" title="Đi tới Chánh điện hoặc vào bên trong">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
            </svg>
            <span id="pin-chanh-dien-label">Chánh điện</span>
          </button>
        </div>

        <div id="auto-walk-objective-banner" class="auto-walk-objective-banner" style="display:none;">
          Đang đi tới: Chánh điện
        </div>

        <div id="entrance-tour-banner" class="entrance-tour-banner" style="display:none;">
          <span>⛩️ Đoàn hành hương buổi sáng qua Cổng Phụ &amp; lối hông phải</span>
          <button type="button" id="btn-skip-entrance-tour" class="entrance-tour-skip-btn">Bỏ qua</button>
        </div>

        <div id="arrival-cutscene-banner" class="arrival-cutscene-banner" style="display:none;" role="status" aria-live="polite">
          <span id="arrival-cutscene-label">🚗 Đang đưa quý khách tới Chùa Vĩnh Tràng Mỹ Tho...</span>
          <button type="button" id="btn-skip-arrival-cutscene" class="entrance-tour-skip-btn" style="min-height:48px;padding:0 16px;">Bỏ qua &amp; vào sân chùa</button>
        </div>

        <nav id="interior-zone-bar" class="interior-zone-bar" style="display:none;" aria-label="Khám phá Chùa Chính Hình Vuông">
          <button type="button" class="walk-chip-btn active" data-interior-zone="day_ban_tho_phai">1. Lối Phải · Dải Bàn Thờ</button>
          <button type="button" class="walk-chip-btn" data-interior-zone="nghin_mat_nghin_tay">🙏 Nghìn Mắt Nghìn Tay</button>
          <button type="button" class="walk-chip-btn" data-interior-zone="cho_ngu_cua_phat">🪷 Chỗ Ngủ Của Phật</button>
          <button type="button" class="walk-chip-btn" data-interior-zone="chanh_dien">2. Cạnh Trên · Chính Điện</button>
          <button type="button" class="walk-chip-btn" id="btn-interior-blessing-tower" title="Tháp Đèn Dược Sư Vạn Phật · Ghi Tên Cầu Phước">🏮 Tháp Cầu Phước</button>
          <button type="button" class="walk-chip-btn" data-interior-zone="ho_sen_bo">3. Giữa Chùa · Hồ Sen Bộ</button>
          <button type="button" class="walk-chip-btn" data-interior-zone="hanh_lang_trai">4. Cạnh Trái · 18 La Hán &amp; Tổ</button>
          <button type="button" class="walk-chip-btn" data-interior-zone="hanh_lang_duoi">5. Cạnh Dưới · Hộ Pháp</button>
          <button type="button" class="walk-chip-btn" data-interior-zone="trai_duong">🍚 Trai Đường</button>
          <button type="button" class="walk-chip-btn" id="btn-interior-cutaway" title="Mặt cắt 3D toàn cảnh mặt bằng Hình Vuông &amp; Hồ Sen Bộ">✂️ Mặt cắt 3D</button>
          <button type="button" class="walk-chip-btn" id="btn-interior-history" title="Đối chiếu tư liệu Tôn tượng Tam Bảo">📜 Tư liệu</button>
          <button type="button" class="walk-chip-btn interior-exit-chip" id="btn-interior-exit-courtyard">← Ra Hiên Bỏ Dép</button>
        </nav>

        <!-- Protagonist Hotspot in Courtyard -->
        <div id="protagonist-hotspot" title="Chọn nhân vật hoặc trang phục đi chùa"></div>

        <div id="temple-transition-veil"></div>

        <!-- Top Navigation Bar (Matches Reference Image 1) -->
        <header class="top-hud-bar" id="main-top-hud">
          <button class="brand-pill" id="btn-brand-home" title="Về sân Chánh điện Chùa Vĩnh Tràng">
            <svg class="lotus-logo" viewBox="0 0 64 46" fill="none">
              <path d="M32 4C27 13 24 22 32 34C40 22 37 13 32 4Z" stroke="white" stroke-width="3.2" stroke-linejoin="round"/>
              <path d="M32 34C22 28 15 19 16 10C23 13 28 20 32 34Z" stroke="white" stroke-width="3.2" stroke-linejoin="round"/>
              <path d="M32 34C42 28 49 19 48 10C41 13 36 20 32 34Z" stroke="white" stroke-width="3.2" stroke-linejoin="round"/>
              <path d="M32 35C18 35 8 28 5 19C14 19 23 25 32 35Z" stroke="white" stroke-width="3.2" stroke-linejoin="round"/>
              <path d="M32 35C46 35 56 28 59 19C50 19 41 25 32 35Z" stroke="white" stroke-width="3.2" stroke-linejoin="round"/>
              <path d="M12 40H52" stroke="white" stroke-width="3.2" stroke-linecap="round"/>
            </svg>
            <span class="brand-main">Chùa Online</span>
            <span class="brand-divider"></span>
            <span class="brand-sub">Chùa Vĩnh Tràng</span>
          </button>

          <nav class="top-nav-group" aria-label="Điều hướng chính">
            <div class="time-toggle-group" id="time-of-day-switch" role="group" aria-label="Thời gian trong ngày">
              <button type="button" class="time-toggle-btn ${this.timeOfDay === 'morning' ? 'active' : ''}" data-time-of-day="morning" title="Buổi Sáng (07:30)">🌅 <span>Sáng</span></button>
              <button type="button" class="time-toggle-btn ${this.timeOfDay === 'midday' ? 'active' : ''}" data-time-of-day="midday" title="Giữa Trưa (12:00)">☀️ <span>Trưa</span></button>
              <button type="button" class="time-toggle-btn ${this.timeOfDay === 'evening' ? 'active' : ''}" data-time-of-day="evening" title="Buổi Tối Đèn Lồng (19:00)">🕯️ <span>Tối</span></button>
            </div>

            <button type="button" class="nav-pill-btn nav-seasonal-pill" id="nav-seasonal-pill" title="Lịch Âm &amp; Lộ trình 30 ngày tu tập">
              <span>${getTempleSeasonalContext().isFestivalDay ? '🏮' : '📅'}</span>
              <span>${getTempleSeasonalContext().activeFestival ? getTempleSeasonalContext().activeFestival.name.split('—')[0].trim() : getTempleSeasonalContext().lunarLabel.replace(' (ước lượng)', '')}</span>
            </button>

            <button class="nav-pill-btn nav-activity-btn" id="nav-btn-activity" title="Điểm danh 7 ngày · Lộ trình 30 ngày · Nhật Ký An Tâm · Hộp thư Nhà Chùa">
              <span aria-hidden="true">🔔</span>
              <span>Hành trình</span>
              <span class="nav-activity-badge" id="nav-activity-badge" style="display:none;">0</span>
            </button>

            <button class="nav-pill-btn nav-merit-btn" id="nav-btn-merit" title="Sổ Công Đức &amp; Cấp Bậc Hành Hương">
              <span class="merit-lotus-glyph" id="nav-rank-badge" aria-hidden="true">🪷</span>
              <span>Công đức: <strong id="nav-merit-count">0</strong></span>
              <span class="nav-rank-pill" id="nav-rank-xp-chip">0 XP</span>
            </button>

            <button class="nav-pill-btn" id="nav-btn-explore">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="9"/>
                <polygon points="15.5,8.5 13.5,13.5 8.5,15.5 10.5,10.5" fill="currentColor" stroke="none"/>
              </svg>
              <span>Khám phá</span>
            </button>

            <button class="nav-pill-btn" id="nav-btn-lecture">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 4h7a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/>
                <path d="M22 4h-7a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h8z"/>
              </svg>
              <span>Học Phật</span>
            </button>

            <button class="nav-pill-btn" id="nav-btn-store">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 7h12l1.2 12H4.8L6 7z"/>
                <path d="M9 7V5a3 3 0 0 1 6 0v2"/>
              </svg>
              <span>Cửa hàng</span>
            </button>

            <button type="button" class="nav-pill-btn nav-audio-btn ${this.audioMuted ? 'muted' : ''}" id="nav-btn-audio" title="Điều chỉnh âm thanh &amp; tắt/mở tiếng" aria-expanded="false">
              <span id="nav-audio-icon" aria-hidden="true">${this.audioMuted ? '🔇' : '🔊'}</span>
              <span id="nav-audio-label">${this.audioMuted ? 'Đã tắt tiếng' : 'Âm thanh'}</span>
            </button>

            <button class="nav-pill-btn" id="nav-btn-account">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6"/>
              </svg>
              <span>Tài khoản</span>
            </button>
          </nav>
        </header>

        <!-- 3-Channel Audio Mixer Popover -->
        <div id="audio-mixer-popover" class="audio-mixer-popover" style="display:none;" role="dialog" aria-label="Điều chỉnh âm thanh Chùa Online">
          <div class="audio-mixer-head">
            <strong>🎧 Âm thanh Chùa Vĩnh Tràng</strong>
            <button type="button" id="btn-close-audio-mixer" class="courtyard-help-close" aria-label="Đóng chỉnh âm thanh">✕</button>
          </div>
          <button type="button" id="btn-audio-global-mute" class="audio-mute-toggle-btn ${this.audioMuted ? 'muted' : ''}">
            ${this.audioMuted ? '🔇 Đang Tắt toàn bộ tiếng (Bấm để Mở lại)' : '🔊 Đang Bật âm thanh (Bấm để Tắt tiếng)'}
          </button>
          <div class="audio-slider-row">
            <label for="slider-ambient-vol"><span>🌿 Tiếng gió &amp; Chuông gió</span><strong id="val-ambient-vol">${Math.round((this.audio?.ambientVolume ?? 0.45) * 100)}%</strong></label>
            <input type="range" id="slider-ambient-vol" min="0" max="100" value="${Math.round((this.audio?.ambientVolume ?? 0.45) * 100)}" />
          </div>
          <div class="audio-slider-row">
            <label for="slider-sfx-vol"><span>🔔 Chuông · Mõ · Bước chân · Xe</span><strong id="val-sfx-vol">${Math.round((this.audio?.sfxVolume ?? 0.85) * 100)}%</strong></label>
            <input type="range" id="slider-sfx-vol" min="0" max="100" value="${Math.round((this.audio?.sfxVolume ?? 0.85) * 100)}" />
          </div>
          <div class="audio-slider-row">
            <label for="slider-voice-vol"><span>🎙️ Pháp âm &amp; Thầy đọc bài</span><strong id="val-voice-vol">${Math.round((this.audio?.voiceVolume ?? 0.9) * 100)}%</strong></label>
            <input type="range" id="slider-voice-vol" min="0" max="100" value="${Math.round((this.audio?.voiceVolume ?? 0.9) * 100)}" />
          </div>
        </div>

        <!-- Bottom-Right 4 Spiritual Action Buttons -->
        <section class="spiritual-actions-bar" id="spiritual-actions-bar" aria-label="Nghi thức tâm linh">
          <button class="action-square-btn" id="act-le-phat">
            <span class="action-badge-count" id="badge-le-phat" style="display:none;">0</span>
            <div class="action-icon">
              <svg viewBox="0 0 64 52" width="48" height="42" fill="#FFF3DC">
                <path d="M32 6C27 16 25 25 32 37C39 25 37 16 32 6Z"/>
                <path d="M29 38C20 31 15 22 17 13C23 17 27 25 29 38Z"/>
                <path d="M35 38C44 31 49 22 47 13C41 17 37 25 35 38Z"/>
                <path d="M26 42C14 39 7 31 6 22C14 23 21 30 26 42Z"/>
                <path d="M38 42C50 39 57 31 58 22C50 23 43 30 38 42Z"/>
              </svg>
            </div>
            <span class="action-label">Lễ Phật</span>
          </button>

          <button class="action-square-btn" id="act-dang-huong">
            <span class="action-badge-count" id="badge-dang-huong" style="display:none;">0</span>
            <div class="action-icon">
              <svg viewBox="0 0 64 56" width="46" height="42" fill="none">
                <path d="M24 20C22 14 26 10 24 4" stroke="#FFF3DC" stroke-width="3" stroke-linecap="round"/>
                <path d="M32 18C30 12 34 8 32 2" stroke="#FFF3DC" stroke-width="3" stroke-linecap="round"/>
                <path d="M40 20C38 14 42 10 40 4" stroke="#FFF3DC" stroke-width="3" stroke-linecap="round"/>
                <rect x="16" y="24" width="32" height="5" rx="2.5" fill="#FFF3DC"/>
                <path d="M18 30H46L43 44C42 47 38 49 32 49C26 49 22 47 21 44L18 30Z" fill="#FFF3DC"/>
                <path d="M23 48L20 54M41 48L44 54M32 49V54" stroke="#FFF3DC" stroke-width="3.2" stroke-linecap="round"/>
              </svg>
            </div>
            <span class="action-label">Dâng hương</span>
          </button>

          <button class="action-square-btn" id="act-dang-hoa">
            <span class="action-badge-count" id="badge-dang-hoa" style="display:none;">0</span>
            <div class="action-icon">
              <svg viewBox="0 0 64 56" width="46" height="42" fill="#FFF3DC">
                <path d="M32 6C28 14 27 22 32 30C37 22 36 14 32 6Z"/>
                <path d="M30 30C22 26 17 18 19 11C24 14 28 20 30 30Z"/>
                <path d="M34 30C42 26 47 18 45 11C40 14 36 20 34 30Z"/>
                <path d="M28 32C18 32 11 26 10 19C17 20 23 24 28 32Z"/>
                <path d="M36 32C46 32 53 26 54 19C47 20 41 24 36 32Z"/>
                <path d="M32 33V50M22 42C26 42 30 45 32 49M42 42C38 42 34 45 32 49" stroke="#FFF3DC" stroke-width="3.2" stroke-linecap="round" fill="none"/>
              </svg>
            </div>
            <span class="action-label">Dâng hoa</span>
          </button>

          <button class="action-square-btn" id="act-niem-phat">
            <span class="action-badge-count" id="badge-niem-phat" style="display:none;">0</span>
            <div class="action-icon">
              <svg viewBox="0 0 64 56" width="46" height="42" fill="#FFF3DC">
                <circle cx="32" cy="8" r="3.4"/>
                <circle cx="41" cy="10" r="3.4"/>
                <circle cx="47" cy="17" r="3.4"/>
                <circle cx="48" cy="26" r="3.4"/>
                <circle cx="43" cy="34" r="3.4"/>
                <circle cx="35" cy="39" r="3.4"/>
                <circle cx="27" cy="39" r="3.4"/>
                <circle cx="19" cy="34" r="3.4"/>
                <circle cx="16" cy="25" r="3.4"/>
                <circle cx="18" cy="16" r="3.4"/>
                <circle cx="24" cy="10" r="3.4"/>
                <path d="M26 42L21 53M28 43L26 54" stroke="#FFF3DC" stroke-width="2.8" stroke-linecap="round"/>
              </svg>
            </div>
            <span class="action-label">Niệm Phật</span>
          </button>
        </section>

        <!-- Collapsible Corner Daily Goals & Pilgrim Rank Tracker -->
        <aside id="daily-goals-tracker" class="daily-goals-tracker ${this.goalsTrackerCollapsed ? 'collapsed' : ''}" aria-label="Mục tiêu hôm nay">
          <div class="goals-tracker-head">
            <div class="goals-rank-line">
              <span id="goals-rank-badge" class="goals-rank-badge">🌱</span>
              <div class="goals-rank-meta">
                <div id="goals-rank-title" class="goals-rank-title">Thiện Duyên · Cấp 1</div>
                <div id="goals-rank-xp" class="goals-rank-xp">0 / 120 XP</div>
              </div>
            </div>
            <button type="button" id="btn-toggle-goals-tracker" class="goals-collapse-btn" aria-expanded="${!this.goalsTrackerCollapsed}" title="Thu gọn hoặc mở rộng Mục Tiêu Hôm Nay">
              ${this.goalsTrackerCollapsed ? 'Mục tiêu ▾' : '✕'}
            </button>
          </div>
          <div class="goals-xp-bar"><div id="goals-xp-fill" class="goals-xp-fill" style="width:0%"></div></div>
          <div id="daily-goals-list" class="daily-goals-list"></div>
        </aside>

        <!-- Unified Interactive Proximity Prompt (Market Stall, Leaves, Garden, Bell, Koi) -->
        <button id="stall-proximity-btn" class="stall-proximity-prompt" type="button" style="display:none;" aria-label="Tương tác điểm gần bạn">
          <span class="stall-proximity-icon" id="stall-proximity-icon">🛒</span>
          <span id="stall-proximity-label">Ghé Nhà Tạp Hóa</span>
          <span class="stall-proximity-key">E</span>
        </button>

        <!-- Bottom-Left Quick Pilgrimage & Touch/Help Dock -->
        <aside id="courtyard-quick-dock" class="courtyard-quick-dock" aria-label="Lối tắt chiêm bái và cách di chuyển">
          <div id="courtyard-help-popover" class="courtyard-help-popover" style="display:none;" role="region" aria-label="Hướng dẫn di chuyển">
            <div class="courtyard-help-head">
              <strong>Hướng dẫn tham quan Chùa 3D</strong>
              <button type="button" id="btn-close-controls-help" class="courtyard-help-close" aria-label="Đóng hướng dẫn">✕</button>
            </div>
            <ul class="courtyard-help-list">
              <li><strong>Đi lại:</strong> Dùng phím <b>W A S D</b> / mũi tên, bật <b>Phím đi</b> hoặc <b>chạm vào mặt sân</b>.</li>
              <li><strong>Xoay &amp; thu phóng:</strong> Kéo chuột (hoặc vuốt) để xoay góc nhìn · Cuộn để phóng to/nhỏ.</li>
              <li><strong>Hoạt động mỗi ngày:</strong> Quét lá Bồ Đề vàng trên sân, trồng hoa <b>Vườn Phật</b>, <b>Thỉnh Chuông – Gõ Mõ</b>, thả <b>🏮 Hoa Đăng</b> và đóng dấu <b>Sổ Di Sản</b> (bấm <b>E</b> hoặc chạm trực tiếp).</li>
            </ul>
          </div>

          <div id="courtyard-dpad-pad" class="courtyard-dpad-pad" style="display:none;" aria-label="Phím điều hướng trên màn hình">
            <span></span>
            <button type="button" class="dpad-btn" data-dpad-dir="up" aria-label="Đi tới">▲</button>
            <span></span>
            <button type="button" class="dpad-btn" data-dpad-dir="left" aria-label="Sang trái">◀</button>
            <span class="dpad-center-dot" aria-hidden="true">🪷</span>
            <button type="button" class="dpad-btn" data-dpad-dir="right" aria-label="Sang phải">▶</button>
            <span></span>
            <button type="button" class="dpad-btn" data-dpad-dir="down" aria-label="Đi lùi">▼</button>
            <span></span>
          </div>

          <div class="courtyard-dock-toolbar">
            <button type="button" id="btn-toggle-quick-dock" class="dock-tool-btn active" aria-expanded="true">
              <span>🧭 Đi nhanh</span>
              <span class="dock-chevron" id="quick-dock-chevron">▾</span>
            </button>
            <button type="button" id="btn-toggle-dpad" class="dock-tool-btn" aria-expanded="false">
              <span>🕹️ Phím đi</span>
            </button>
            <button type="button" id="btn-toggle-controls-help" class="dock-tool-btn" aria-expanded="false">
              <span>❔ Cách đi</span>
            </button>
          </div>

          <div id="quick-dock-chips" class="quick-dock-chips">
            <button type="button" class="walk-chip-btn" id="btn-open-hoc-kinh">📿 Học Kinh</button>
            <button type="button" class="walk-chip-btn" data-walk-station="cong_tam_quan">⛩️ Tam Quan</button>
            <button type="button" class="walk-chip-btn" data-walk-station="phat_adida">🪷 A Di Đà</button>
            <button type="button" class="walk-chip-btn" data-walk-station="chanh_dien">🏛️ Chánh điện</button>
            <button type="button" class="walk-chip-btn" id="btn-toggle-interior-hall">🚪 Vào Chánh điện</button>
            <button type="button" class="walk-chip-btn" data-walk-station="phat_di_lac">😊 Di Lặc</button>
            <button type="button" class="walk-chip-btn" data-walk-station="phat_niet_ban">☸️ Niết Bàn</button>
            <button type="button" class="walk-chip-btn" data-walk-station="cua_hang_luu_niem">🛒 Tạp Hóa</button>
            <button type="button" class="walk-chip-btn" id="btn-open-garden-modal">🌱 Vườn Phật</button>
            <button type="button" class="walk-chip-btn" id="btn-open-bell-rhythm">🔔 Chuông Mõ</button>
            <button type="button" class="walk-chip-btn" id="btn-open-heritage-book">📜 Di Sản</button>
            <button type="button" class="walk-chip-btn" id="btn-open-blessing-tower">🏮 Cầu Phước</button>
            <button type="button" class="walk-chip-btn" id="btn-open-hoa-dang">🏮 Hoa Đăng</button>
            <button type="button" class="walk-chip-btn" id="btn-open-30day">🗓️ 30 Ngày</button>
            <button type="button" class="walk-chip-btn" id="btn-open-journal">📓 Nhật Ký</button>
          </div>
        </aside>

        <!-- Ritual / Narration Toast -->
        <div id="ritual-toast" role="status" aria-live="polite">
          <div class="toast-title" id="toast-title">Chùa Vĩnh Tràng · Hành Hương Sáng</div>
          <div class="toast-desc" id="toast-desc">Chào đón bạn tham gia buổi hành hương Chùa Vĩnh Tràng miền Tây thanh tịnh.</div>
        </div>
      </div>

      <!-- ================= 2. CỬA HÀNG LƯU NIỆM & VẬT PHẨM 3D (Reference Image 2) ================= -->
      <section id="shop-screen" aria-label="Cửa hàng lưu niệm">
        <div class="shop-kiosk-hero">
          <div class="top-hud-bar">
            <button class="brand-pill" id="btn-shop-back-home">
              <svg class="lotus-logo" viewBox="0 0 64 46" fill="none">
                <path d="M32 4C27 13 24 22 32 34C40 22 37 13 32 4Z" stroke="white" stroke-width="3.2"/>
                <path d="M32 34C22 28 15 19 16 10C23 13 28 20 32 34Z" stroke="white" stroke-width="3.2"/>
                <path d="M32 34C42 28 49 19 48 10C41 13 36 20 32 34Z" stroke="white" stroke-width="3.2"/>
                <path d="M12 40H52" stroke="white" stroke-width="3.2" stroke-linecap="round"/>
              </svg>
              <span class="brand-main">Chùa Online</span>
              <span class="brand-divider"></span>
              <span class="brand-sub">Chùa Vĩnh Tràng</span>
            </button>

            <div class="top-nav-group">
              <button class="nav-pill-btn" id="shop-nav-kiosk3d" style="background:#7a481d;"><span>Xem quầy hàng 3D</span></button>
              <button class="nav-pill-btn" id="shop-nav-explore"><span>Khám phá</span></button>
              <button class="nav-pill-btn" id="shop-nav-lecture"><span>Học Phật</span></button>
              <button class="nav-pill-btn" id="shop-nav-account"><span>Tài khoản</span></button>
            </div>
          </div>
        </div>

        <div class="shop-sheet-body">
          <div class="shop-lotus-crest" aria-hidden="true">
            <svg viewBox="0 0 180 68" width="165" height="60">
              <path d="M22 50C40 42 54 44 68 52" stroke="#3D8854" stroke-width="5" stroke-linecap="round" fill="none"/>
              <path d="M158 50C140 42 126 44 112 52" stroke="#3D8854" stroke-width="5" stroke-linecap="round" fill="none"/>
              <path d="M90 8C81 22 79 38 90 54C101 38 99 22 90 8Z" fill="#F78FB3" stroke="#E05A8B" stroke-width="1.5"/>
              <path d="M88 54C72 45 64 31 67 17C77 22 84 34 88 54Z" fill="#F8A5C2" stroke="#E05A8B" stroke-width="1.5"/>
              <path d="M92 54C108 45 116 31 113 17C103 22 96 34 92 54Z" fill="#F8A5C2" stroke="#E05A8B" stroke-width="1.5"/>
              <path d="M85 56C66 55 53 45 49 32C62 33 74 42 85 56Z" fill="#FBC3D8" stroke="#E05A8B" stroke-width="1.5"/>
              <path d="M95 56C114 55 127 45 131 32C118 33 106 42 95 56Z" fill="#FBC3D8" stroke="#E05A8B" stroke-width="1.5"/>
            </svg>
          </div>

          <h1 class="shop-main-title">Cửa hàng lưu niệm</h1>
          <p class="shop-main-subtitle">Chọn món quà gợi nhớ chuyến đi chùa</p>

          <!-- 3 Category Pill Tabs -->
          <div class="shop-tabs-row" role="tablist">
            <button class="shop-tab-pill active" data-shop-tab="souvenir" role="tab">
              <span>🪷</span>
              <span>Quà lưu niệm</span>
            </button>
            <button class="shop-tab-pill" data-shop-tab="study" role="tab">
              <span>📖</span>
              <span>Đồ tu học</span>
            </button>
            <button class="shop-tab-pill" data-shop-tab="3d" role="tab">
              <span>📦</span>
              <span>Vật phẩm 3D</span>
            </button>
          </div>

          <!-- 3-Column Product Card Grid -->
          <div class="shop-products-grid" id="shop-products-grid"></div>

          <!-- Footer Bar: Cần hỗ trợ? + Large Terracotta Giỏ hàng -->
          <div class="shop-footer-bar">
            <button class="shop-support-btn" id="btn-shop-support">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
              </svg>
              <span>Cần hỗ trợ?</span>
            </button>

            <button class="shop-cart-cta" id="btn-open-cart">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1.5"/>
                <circle cx="20" cy="21" r="1.5"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <span id="shop-cart-label">Giỏ hàng (1)</span>
            </button>

            <button class="shop-close-pill" id="btn-shop-return-courtyard">
              ← Về sân Chánh điện
            </button>
          </div>
        </div>
      </section>

      <!-- ================= 3. HỌC VIỆN & GIẢNG ĐƯỜNG PHẬT PHÁP (Live 3D Animated Hall + Elder-Friendly Mobile) ================= -->
      <section id="lecture-screen" data-font-scale="${this.elderFontScale}" aria-label="Học Viện Phật Học Chùa Vĩnh Tràng">
        <header class="lecture-top-bar">
          <div class="lecture-top-left">
            <button class="lecture-back-courtyard" id="btn-lecture-back">← Sân chùa</button>
            <h1 class="lecture-hall-heading">Học Viện Phật Học</h1>
          </div>
          <div class="lecture-top-actions">
            <div class="lecture-font-controls" aria-label="Điều chỉnh cỡ chữ dễ đọc">
              <button type="button" class="lecture-font-btn" id="btn-lecture-font-dec" title="Giảm cỡ chữ">A-</button>
              <button type="button" class="lecture-font-btn" id="btn-lecture-font-inc" title="Tăng cỡ chữ lớn hơn">A+</button>
            </div>
            <button type="button" class="lecture-back-courtyard" id="btn-lecture-speed-toggle" title="Tốc độ Thầy đọc bài cho cô bác lớn tuổi">
              🐢 ${this.readAlongRate === 0.85 ? '0.85x Chậm' : '1.0x Chuẩn'}
            </button>
            <button class="lecture-back-courtyard" id="btn-lecture-daily-dharma" style="background:rgba(92,56,31,0.78);border-color:rgba(255,232,185,0.45);color:#fff6e5;">
              Lời dạy hôm nay
            </button>
            <button class="lecture-back-courtyard" id="btn-lecture-textbooks" style="background:rgba(230,174,71,0.22);border-color:rgba(230,174,71,0.55);color:#ffe8b3;">
              Tủ sách (11 PDF)
            </button>
            <button class="lecture-audio-gold-btn" id="btn-lecture-recordings">Bài thu âm</button>
          </div>
        </header>

        <main class="lecture-center-stage" id="lecture-center-stage"></main>

        <footer class="lecture-bottom-dock" role="tablist">
          <button class="lecture-dock-tab active" data-lecture-tab="sutra" role="tab">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M12 3c4 4 6 7 6 10a6 6 0 1 1-12 0c0-3 2-6 6-10z"/>
              <path d="M12 10v7"/>
            </svg>
            <span>Học Kinh</span>
          </button>

          <button class="lecture-dock-tab" data-lecture-tab="listen" role="tab">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
            </svg>
            <span>Nghe giảng</span>
          </button>

          <button class="lecture-dock-tab" data-lecture-tab="lesson" role="tab">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M2 4h7a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/>
              <path d="M22 4h-7a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h8z"/>
            </svg>
            <span>Bài học</span>
          </button>

          <button class="lecture-dock-tab" data-lecture-tab="package" role="tab">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 12 12 17 22 12"/>
              <polyline points="2 17 12 22 22 17"/>
            </svg>
            <span>Học Viện</span>
          </button>
        </footer>
      </section>

      <!-- ================= 4. UNIVERSAL MODAL OVERLAY ================= -->
      <div class="modal-backdrop" id="universal-modal" role="dialog" aria-modal="true">
        <div class="modal-card">
          <div class="modal-header">
            <h3 id="modal-title">Chi tiết</h3>
            <button class="modal-close-x" id="modal-close-btn" aria-label="Đóng">✕</button>
          </div>
          <div class="modal-body" id="modal-body"></div>
        </div>
      </div>
    `;
  }
};
