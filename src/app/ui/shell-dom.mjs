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

          <aside id="npc-dharma-bubble" class="npc-dharma-bubble" role="status" aria-live="polite" style="display:none;">
            <div class="npc-bubble-header">
              <span class="npc-bubble-role" id="npc-bubble-role">🪷 Phật tử hành hương</span>
              <div class="npc-bubble-actions">
                <button type="button" class="npc-bubble-btn" id="btn-npc-next-quote" title="Đọc thêm một lời dạy khác" aria-label="Đọc thêm một lời dạy khác">↻</button>
                <button type="button" class="npc-bubble-btn" id="btn-npc-close-quote" title="Đóng" aria-label="Đóng lời dạy">✕</button>
              </div>
            </div>
            <blockquote class="npc-bubble-quote" id="npc-bubble-quote"></blockquote>
            <div class="npc-bubble-source" id="npc-bubble-source"></div>
            <div class="npc-bubble-tail" aria-hidden="true"></div>
          </aside>
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
          <button type="button" class="walk-chip-btn active" data-interior-zone="day_ban_tho_phai">1. Lối Phải · 8 Bàn Thờ Phật</button>
          <button type="button" class="walk-chip-btn" data-interior-zone="nghin_mat_nghin_tay">🙏 Nghìn Mắt Nghìn Tay</button>
          <button type="button" class="walk-chip-btn" data-interior-zone="cho_ngu_cua_phat">🪷 Chỗ Ngủ Của Phật</button>
          <button type="button" class="walk-chip-btn" data-interior-zone="chanh_dien">2. Cạnh Trái · Chính Điện &amp; 18 La Hán</button>
          <button type="button" class="walk-chip-btn" id="btn-interior-blessing-tower" title="Tháp Đèn Dược Sư Vạn Phật · Ghi Tên Cầu Phước">🏮 Tháp Cầu Phước</button>
          <button type="button" class="walk-chip-btn" data-interior-zone="ho_sen_bo">3. Giữa Chùa · Hồ Sen Bộ</button>
          <button type="button" class="walk-chip-btn" data-interior-zone="hanh_lang_trai">4. Cạnh Trên · Tổ Đường</button>
          <button type="button" class="walk-chip-btn" data-interior-zone="hanh_lang_duoi">5. Cạnh Dưới · Hành Lang</button>
          <button type="button" class="walk-chip-btn" data-interior-zone="trai_duong">🪑 Phòng Khách · Kinh Sách</button>
          <button type="button" class="walk-chip-btn" id="btn-interior-cutaway" title="Mặt cắt 3D toàn cảnh mặt bằng Hình Vuông &amp; Hồ Sen Bộ">✂️ Mặt cắt 3D</button>
          <button type="button" class="walk-chip-btn" id="btn-interior-history" title="Đối chiếu tư liệu Tôn tượng Tam Bảo">📜 Tư liệu</button>
          <button type="button" class="walk-chip-btn interior-exit-chip" id="btn-interior-exit-courtyard">← Ra Hiên Bỏ Dép</button>
        </nav>

        <!-- Protagonist Hotspot in Courtyard -->
        <div id="protagonist-hotspot" title="Chọn nhân vật hoặc trang phục đi chùa"></div>

        <div id="temple-transition-veil"></div>

        <!-- Live 3D Title Overlay (Calm orbital pan behind title before entering) -->
        <section id="temple-title-overlay" class="temple-title-overlay" aria-label="Chào mừng đến Chùa Vĩnh Tràng">
          <div class="title-overlay-inner">
            <svg class="title-lotus-emblem" viewBox="0 0 64 46" fill="none" aria-hidden="true">
              <path d="M32 4C27 13 24 22 32 34C40 22 37 13 32 4Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>
              <path d="M32 34C22 28 15 19 16 10C23 13 28 20 32 34Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>
              <path d="M32 34C42 28 49 19 48 10C41 13 36 20 32 34Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>
              <path d="M32 35C18 35 8 28 5 19C14 19 23 25 32 35Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>
              <path d="M32 35C46 35 56 28 59 19C50 19 41 25 32 35Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>
              <path d="M12 41H52" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
            </svg>
            <div class="title-eyebrow">Cổ Tự Miền Tây · Mỹ Tho, Tiền Giang</div>
            <h1 class="title-main-heading">Chùa Vĩnh Tràng</h1>
            <p class="title-subtitle">Dạo bước thanh tịnh giữa sân cổ tự, lễ Phật, thả hoa đăng và lưu giữ Sổ Hành Hương mỗi ngày.</p>
            <button type="button" id="btn-title-enter-temple" class="title-cta-primary">
              Bắt đầu đi chùa
            </button>
            <div class="title-secondary-row">
              <button type="button" id="btn-title-change-char" class="title-cta-secondary">👤 Đổi nhân vật</button>
              <button type="button" id="btn-title-google-signin" class="title-cta-secondary">☁️ Đăng nhập Google (Lưu Sổ Hành Hương)</button>
            </div>
            <div class="title-control-hint">Chạm mặt sân hoặc gạt nút trái để đi · Kéo để xoay góc nhìn · Bấm Enter để vào chùa</div>
          </div>
        </section>

        <!-- Minimal 3-Zone Top Bar (Zero pills on metadata, no backdrop-filter) -->
        <header class="elder-top-hud" id="main-top-hud">
          <div class="elder-top-left">
            <button type="button" class="elder-temple-title-btn" id="btn-brand-home" title="Về sân Chánh điện Chùa Vĩnh Tràng">
              <svg width="24" height="18" viewBox="0 0 64 46" fill="none" aria-hidden="true">
                <path d="M32 4C27 13 24 22 32 34C40 22 37 13 32 4Z" stroke="#F4D38D" stroke-width="3.2" stroke-linejoin="round"/>
                <path d="M32 34C22 28 15 19 16 10C23 13 28 20 32 34Z" stroke="#F4D38D" stroke-width="3.2" stroke-linejoin="round"/>
                <path d="M32 34C42 28 49 19 48 10C41 13 36 20 32 34Z" stroke="#F4D38D" stroke-width="3.2" stroke-linejoin="round"/>
                <path d="M12 40H52" stroke="#F4D38D" stroke-width="3.2" stroke-linecap="round"/>
              </svg>
              <span>Chùa Vĩnh Tràng</span>
            </button>
            <span class="elder-temple-meta">
              · ${getTempleSeasonalContext().activeFestival ? getTempleSeasonalContext().activeFestival.name.split('—')[0].trim() : getTempleSeasonalContext().lunarLabel.replace(' (ước lượng)', '')}
              · <span id="hud-stamp-summary">Dấu mộc 0/10</span>
            </span>
          </div>

          <div class="elder-top-actions">
            <button type="button" class="elder-top-btn ${this.audioMuted ? 'muted' : ''}" id="nav-btn-audio" title="Điều chỉnh âm thanh &amp; tắt/mở tiếng" aria-expanded="false">
              <span id="nav-audio-icon" aria-hidden="true">${this.audioMuted ? '🔇' : '🔊'}</span>
              <span class="top-btn-label" id="nav-audio-label">${this.audioMuted ? 'Tắt tiếng' : 'Âm thanh'}</span>
            </button>

            <button type="button" class="elder-top-btn" id="nav-btn-auth" title="Đăng nhập Google để lưu Sổ Hành Hương">
              <span aria-hidden="true">👤</span>
              <span class="top-btn-label" id="nav-auth-label">Đăng nhập</span>
            </button>

            <button type="button" class="elder-top-btn" id="nav-btn-utility-drawer" title="Mở bảng tiện ích chùa" aria-expanded="false" aria-controls="temple-utility-drawer">
              <span aria-hidden="true">☰</span>
              <span class="top-btn-label">Tiện ích</span>
            </button>
          </div>
        </header>

        <!-- 3-Channel Audio Mixer & Ambient Soundscape Popover -->
        <div id="audio-mixer-popover" class="audio-mixer-popover" style="display:none;" role="dialog" aria-label="Điều chỉnh âm thanh Chùa Online">
          <div class="audio-mixer-head">
            <strong>🎧 Âm thanh Chùa Vĩnh Tràng</strong>
            <button type="button" id="btn-close-audio-mixer" class="courtyard-help-close" aria-label="Đóng chỉnh âm thanh">✕</button>
          </div>
          <button type="button" id="btn-audio-global-mute" class="audio-mute-toggle-btn ${this.audioMuted ? 'muted' : ''}">
            ${this.audioMuted ? '🔇 Đang Tắt toàn bộ tiếng (Bấm để Mở lại)' : '🔊 Đang Bật âm thanh (Bấm để Tắt tiếng)'}
          </button>

          <div class="audio-ambient-section">
            <div class="audio-ambient-master-row">
              <div class="audio-ambient-meta">
                <strong>🪷 Âm thanh không gian chùa</strong>
                <span id="mixer-ambient-subtitle">Niệm Phật xa &amp; chuông chùa lặp nhẹ nhàng</span>
              </div>
              <button
                type="button"
                id="btn-mixer-ambient-toggle"
                class="audio-switch-btn ${this.ambientSettings?.enabled && !this.audioMuted ? 'is-on' : ''}"
                role="switch"
                aria-checked="${this.ambientSettings?.enabled && !this.audioMuted ? 'true' : 'false'}"
                aria-label="Bật hoặc tắt âm thanh không gian chùa"
              >
                <span class="ambient-switch-track" aria-hidden="true">
                  <span class="ambient-switch-thumb"></span>
                </span>
              </button>
            </div>
            <div class="audio-layer-list">
              <label class="audio-layer-item">
                <input type="checkbox" id="chk-ambient-chanting" ${this.ambientSettings?.chanting !== false ? 'checked' : ''} />
                <span>📿 Niệm Phật từ xa</span>
              </label>
              <label class="audio-layer-item">
                <input type="checkbox" id="chk-ambient-bells" ${this.ambientSettings?.bells !== false ? 'checked' : ''} />
                <span>🔔 Chuông chùa &amp; chuông gió</span>
              </label>
              <label class="audio-layer-item">
                <input type="checkbox" id="chk-ambient-atmosphere" ${this.ambientSettings?.atmosphere !== false ? 'checked' : ''} />
                <span>🌿 Gió sân &amp; điện thờ</span>
              </label>
            </div>
          </div>

          <div class="audio-slider-row">
            <label for="slider-ambient-vol"><span>🪷 Âm lượng nền (Niệm Phật &amp; Chuông)</span><strong id="val-ambient-vol">${Math.round((this.audio?.ambientVolume ?? 0.45) * 100)}%</strong></label>
            <input type="range" id="slider-ambient-vol" min="0" max="100" value="${Math.round((this.audio?.ambientVolume ?? 0.45) * 100)}" />
          </div>
          <div class="audio-slider-row">
            <label for="slider-sfx-vol"><span>🔔 Chuông · Mõ · Bước chân</span><strong id="val-sfx-vol">${Math.round((this.audio?.sfxVolume ?? 0.85) * 100)}%</strong></label>
            <input type="range" id="slider-sfx-vol" min="0" max="100" value="${Math.round((this.audio?.sfxVolume ?? 0.85) * 100)}" />
          </div>
          <div class="audio-slider-row">
            <label for="slider-voice-vol"><span>🎙️ Pháp âm &amp; Thầy đọc bài</span><strong id="val-voice-vol">${Math.round((this.audio?.voiceVolume ?? 0.9) * 100)}%</strong></label>
            <input type="range" id="slider-voice-vol" min="0" max="100" value="${Math.round((this.audio?.voiceVolume ?? 0.9) * 100)}" />
          </div>
        </div>

        <!-- Unified Interactive Proximity Prompt -->
        <button id="stall-proximity-btn" class="stall-proximity-prompt" type="button" style="display:none;" aria-label="Tương tác điểm gần bạn">
          <span class="stall-proximity-icon" id="stall-proximity-icon">🪷</span>
          <span id="stall-proximity-label">Chiêm bái</span>
          <span class="stall-proximity-key">E</span>
        </button>

        <!-- Bottom-Left Soft Analog Touch Joystick -->
        <div id="soft-joystick-zone" class="soft-joystick-zone" aria-label="Cần gạt di chuyển nhẹ nhàng">
          <div id="soft-joystick-base" class="soft-joystick-base">
            <div class="soft-joystick-arrows" aria-hidden="true">
              <span class="joy-n">▲</span>
              <span class="joy-s">▼</span>
              <span class="joy-w">◀</span>
              <span class="joy-e">▶</span>
            </div>
            <div id="soft-joystick-knob" class="soft-joystick-knob"></div>
          </div>
        </div>

        <!-- Bottom-Center Collapsible Elderly Dock (with Cửa hàng & Cử chỉ directly on main screen) -->
        <nav id="elder-bottom-dock" class="elder-bottom-dock" aria-label="Thao tác đi chùa chính">
          <div id="gesture-action-bar" class="gesture-action-bar" style="display:none;" role="toolbar" aria-label="Cử chỉ và hành động nhân vật">
            <button type="button" class="gesture-chip-btn" data-gesture="chup_anh">📸 Chụp ảnh</button>
            <button type="button" class="gesture-chip-btn" data-gesture="selfie">🤳 Selfie</button>
            <button type="button" class="gesture-chip-btn" data-gesture="tro_chuyen">💬 Nói chuyện bố mẹ</button>
            <button type="button" class="gesture-chip-btn" data-gesture="vai">🙏 Vái lễ</button>
            <button type="button" class="gesture-chip-btn" data-gesture="vay_tay">👋 Vẫy tay</button>
            <button type="button" class="gesture-chip-btn" data-gesture="quat_mat">🪷 Ngắm cảnh</button>
          </div>
          <button type="button" id="btn-dock-zen-toggle" class="dock-zen-toggle-btn" aria-expanded="true" title="Thu gọn hoặc hiện các nút (phím H)">
            ▾ Ẩn nút
          </button>
          <div class="elder-dock-row">
            <button type="button" class="elder-dock-btn primary" id="btn-guided-next">
              <span aria-hidden="true">🚶</span>
              <span id="btn-guided-next-label">Đi tiếp: Cổng Tam Quan</span>
            </button>
            <button type="button" class="elder-dock-btn" id="btn-dock-ritual">
              <span aria-hidden="true">🙏</span>
              <span>Lễ / Dâng hương</span>
            </button>
            <button type="button" class="elder-dock-btn" id="btn-dock-gestures" aria-expanded="false" aria-controls="gesture-action-bar">
              <span aria-hidden="true">✨</span>
              <span>Cử chỉ</span>
            </button>
            <button type="button" class="elder-dock-btn" id="btn-dock-shop">
              <span aria-hidden="true">🛍️</span>
              <span>Cửa hàng</span>
            </button>
            <button type="button" class="elder-dock-btn" id="btn-dock-passport">
              <span aria-hidden="true">📖</span>
              <span>Sổ Hành Hương</span>
            </button>
            <button type="button" class="elder-dock-btn" id="btn-dock-sutra">
              <span aria-hidden="true">📿</span>
              <span>Nghe Kinh</span>
            </button>
          </div>
        </nav>

        <!-- Slide-Out Utility Drawer Backdrop & Panel -->
        <div id="utility-drawer-backdrop" class="utility-drawer-backdrop"></div>
        <aside id="temple-utility-drawer" class="temple-utility-drawer" aria-label="Tiện ích Chùa Vĩnh Tràng" aria-hidden="true">
          <div class="drawer-header">
            <h2>Tiện ích Chùa Vĩnh Tràng</h2>
            <button type="button" id="btn-close-utility-drawer" class="drawer-close-btn" aria-label="Đóng bảng tiện ích">✕</button>
          </div>
          <div class="drawer-body">
            <div>
              <h3 class="drawer-group-title">Hành hương &amp; Chiêm bái</h3>
              <div class="drawer-btn-stack">
                <button type="button" class="drawer-action-btn" id="btn-drawer-interior"><span>🚪 Vào trong Chánh Điện</span><span>→</span></button>
                <button type="button" class="drawer-action-btn" id="btn-drawer-explore"><span>🗺️ Bản đồ &amp; 18 Vị La Hán</span><span>→</span></button>
                <button type="button" class="drawer-action-btn" id="btn-drawer-oracle"><span>🎋 Rút Quẻ Bình An hôm nay</span><span>→</span></button>
                <button type="button" class="drawer-action-btn" id="btn-drawer-lanterns"><span>🏮 Thả Hoa Đăng Hồ Sen</span><span>→</span></button>
                <button type="button" class="drawer-action-btn" id="btn-drawer-blessing-tower"><span>🕯️ Tháp Đèn Cầu An</span><span>→</span></button>
                <button type="button" class="drawer-action-btn" id="btn-drawer-photo"><span>📸 Chụp Ảnh Kỷ Niệm Sạch HUD</span><span>→</span></button>
              </div>
            </div>

            <div>
              <h3 class="drawer-group-title">Cửa hàng &amp; Tu học</h3>
              <div class="drawer-btn-stack">
                <button type="button" class="drawer-action-btn" id="btn-drawer-shop"><span>👘 Cửa Hàng (Trang Phục 3D &amp; Quà)</span><span>→</span></button>
                <button type="button" class="drawer-action-btn" id="btn-drawer-lecture"><span>📚 Học Viện &amp; Tủ Sách Phật Học</span><span>→</span></button>
                <button type="button" class="drawer-action-btn" id="btn-drawer-character"><span>👤 Đổi Nhân Vật &amp; Hồ Sơ</span><span>→</span></button>
              </div>
            </div>

            <div>
              <h3 class="drawer-group-title">Ánh sáng sân chùa</h3>
              <div class="drawer-segment-row" role="group" aria-label="Thời gian trong ngày">
                <button type="button" class="drawer-segment-btn ${this.timeOfDay === 'morning' ? 'active' : ''}" data-time-of-day="morning">🌅 Sáng</button>
                <button type="button" class="drawer-segment-btn ${this.timeOfDay === 'midday' ? 'active' : ''}" data-time-of-day="midday">☀️ Trưa</button>
                <button type="button" class="drawer-segment-btn ${this.timeOfDay === 'evening' ? 'active' : ''}" data-time-of-day="evening">🕯️ Tối</button>
              </div>
            </div>

            <div>
              <h3 class="drawer-group-title">Cỡ chữ dễ đọc</h3>
              <div class="drawer-segment-row" style="grid-template-columns:1fr 1fr;">
                <button type="button" class="drawer-segment-btn" id="btn-drawer-font-dec">A- Nhỏ lại</button>
                <button type="button" class="drawer-segment-btn" id="btn-drawer-font-inc">A+ Chữ lớn</button>
              </div>
            </div>

            <div class="drawer-cloud-box">
              <h3 class="drawer-group-title" style="margin-bottom:2px;">Lưu giữ Sổ Hành Hương</h3>
              <p id="drawer-cloud-status">Chưa đăng nhập · Đang lưu trên thiết bị này</p>
              <button type="button" class="passport-primary-btn" id="btn-drawer-cloud-auth">Đăng nhập Google</button>
            </div>
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
