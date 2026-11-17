import {
  CHARACTER_PROFILES,
  PILGRIMAGE_STATIONS,
  DISCOVERY_ZONES,
  CHU_QUOC_ZONES,
  CHANH_DIEN_HISTORICAL_NOTES,
  findAnyTempleDestination,
  SHOP_CATALOG,
  DHARMA_TEXTBOOKS,
  LECTURE_PATHS,
  LECTURE_LESSONS,
  UGC_BACKDROPS,
  UGC_POSES,
  INITIAL_UGC_GALLERY,
  stepPlayerMovement,
  findNearestStation,
  createSpiritualState,
  performSpiritualAction,
  recordSpiritualMilestone,
  checkUGCMilestoneUnlock,
  calculateJourneyImprint,
  filterShopCatalog,
  addToCart,
  updateCartQuantity,
  calculateCartSummary,
  validateOrderForm,
  getLessonsByPath,
  gradeLessonQuiz,
  createUGCPost,
  getLocalDateKey,
  shouldShowDailyDharmaToday,
  pickDailyDharmaQuote,
  fetchDailyDharmaService,
  STORE_CATEGORIES,
  STORE_ITEMS_CATALOG,
  createStoreProfileState,
  filterStoreItems,
  tryOnStoreItem,
  purchaseStoreItem,
  MARKETPLACE_STALL_CATEGORIES,
  MARKETPLACE_STALL_CATALOG,
  filterMarketplaceItems,
  purchaseMarketplaceItem,
  calculateMeritSummary,
  TIME_OF_DAY_PRESETS,
  DAILY_CHECKIN_REWARDS,
  DAILY_QUESTS_TEMPLATE,
  INITIAL_MAILBOX_MESSAGES,
  PILGRIMAGE_GUIDE_STEPS,
  DAILY_RESET_MISSIONS,
  EXPLORATION_CHAPTERS,
  createActivityHubState,
  ensureDailyMissionDate,
  recordDailyMissionMetric,
  getDailyMissionsWithProgress,
  claimDailyMissionReward,
  getExplorationChaptersStatus,
  claimExplorationChapterReward,
  claimDailyCheckin,
  incrementQuestProgress,
  getQuestsWithProgress,
  claimQuestReward,
  getMailboxWithStatus,
  claimMailboxReward,
  replyToMailboxMessage,
  buildPilgrimageShareText,
  recordPilgrimageShare,
  submitUserFeedback,
  unifyEquippedVisualPayload,
  encodeProfileBackupCode,
  decodeProfileBackupCode
} from '/src/logic/chua-online-logic.mjs';
import {
  VinhTrang3DWorld,
  recolorGarmentOnScene,
  clearRiggedBoneProps,
  createBespokeRobeGroup,
  createStoreAccessoryGroup,
  createSculptedArhatShowcase
} from '/src/app/vinh-trang-3d-world.mjs';

const STORAGE_KEY = 'chua_online_vinh_trang_state_v11';

const EIGHTEEN_ARHATS = [
  { id: 1, name: 'Tôn giả Tân Độ La Bạt La Đọa Xà', title: 'Tọa Lộc La Hán', emblem: 'Hươu trắng · Thanh cao', meaning: 'Cưỡi hươu vào hoàng cung độ hóa vua quan, biểu trưng cho tâm hạnh thanh cao và tinh tấn.' },
  { id: 2, name: 'Tôn giả Ca Nặc Ca Phạt Tha', title: 'Khánh Hỷ La Hán', emblem: 'Chuông vàng · Hỷ lạc', meaning: 'Phân biệt rõ thiện ác, mang niềm vui chánh pháp đến cho muôn người.' },
  { id: 3, name: 'Tôn giả Ca Nặc Ca Bạt Ly Đọa Xà', title: 'Cử Bát La Hán', emblem: 'Bình bát · Bình đẳng', meaning: 'Nâng bình bát với tâm bình đẳng, gieo ruộng phước lành cho thí chủ.' },
  { id: 4, name: 'Tôn giả Tô Tần Đà', title: 'Thác Tháp La Hán', emblem: 'Bảo tháp · Hộ trì Tam Bảo', meaning: 'Nâng bảo tháp Phật trên tay, nhắc nhở luôn hộ trì Tam Bảo và giữ tâm sáng.' },
  { id: 5, name: 'Tôn giả Nặc Cự La', title: 'Tĩnh Tọa La Hán', emblem: 'Tảng đá · Thiền định vững chãi', meaning: 'Ngồi thiền định vững chãi như núi Thái Sơn, chiến thắng nội ma phiền não.' },
  { id: 6, name: 'Tôn giả Bạt Đà La', title: 'Quá Giang La Hán', emblem: 'Sóng nước & Tích trượng', meaning: 'Vượt biển truyền bá Phật pháp khắp các vùng đất phương Nam.' },
  { id: 7, name: 'Tôn giả Ca Lý Ca', title: 'Kỵ Tượng La Hán', emblem: 'Voi trắng · Sức mạnh từ bi', meaning: 'Cưỡi voi trắng biểu trưng cho sức mạnh đại thừa và tâm từ bi rộng lớn.' },
  { id: 8, name: 'Tôn giả Phạt Xà La Phất Đa La', title: 'Tiếu Sư La Hán', emblem: 'Sư tử nhỏ · Cảm hóa bằng từ ái', meaning: 'Chơi đùa cùng sư tử nhỏ, cảm hóa loài hung dữ bằng lòng từ ái.' },
  { id: 9, name: 'Tôn giả Thú Bác Ca', title: 'Khai Tâm La Hán', emblem: 'Tâm Phật · Giác ngộ tự tâm', meaning: 'Mở vạt áo để lộ tâm Phật trong sáng, nhắc người đời ai cũng có Phật tính.' },
  { id: 10, name: 'Tôn giả Bán Thác Ca', title: 'Thám Thủ La Hán', emblem: 'Tự tại sau giờ thiền', meaning: 'Vươn tay thư thái sau giờ thiền định, giữ lòng an nhiên giữa muôn duyên.' },
  { id: 11, name: 'Tôn giả La Hầu La', title: 'Trầm Tư La Hán', emblem: 'Mật hạnh · Quán chiếu sâu sắc', meaning: 'Mật hạnh đệ nhất, luôn suy tư quán chiếu sâu sắc để tu sửa thân tâm.' },
  { id: 12, name: 'Tôn giả Na Già Tê Na', title: 'Khoái Nhĩ La Hán', emblem: 'Lắng nghe thanh tịnh', meaning: 'Nghe đủ mọi âm thanh đời thường mà tâm chẳng nhiễm ô phiền muộn.' },
  { id: 13, name: 'Tôn giả Nhân Yết Đà', title: 'Bố Đại La Hán', emblem: 'Túi vải bố · Hoan hỷ bao dung', meaning: 'Mang túi vải bố thu nhiếp khổ đau thế gian và trao tặng niềm hoan hỷ.' },
  { id: 14, name: 'Tôn giả Phạt Na Bà Tư', title: 'Ba Tiêu La Hán', emblem: 'Tán chuối xanh · Quán vô thường', meaning: 'Ngồi dưới tán chuối xanh nghe mưa rơi mà ngộ lý vô thường.' },
  { id: 15, name: 'Tôn giả A Thị Đa', title: 'Trường Mi La Hán', emblem: 'Lông mày dài · Trường thọ từ bi', meaning: 'Đôi lông mày dài bạc trắng biểu thị phước tướng từ bi trường thọ.' },
  { id: 16, name: 'Tôn giả Chú Trà Bán Thác Ca', title: 'Khán Môn La Hán', emblem: 'Tích trượng · Hộ trì sáu căn', meaning: 'Cầm gậy tích trượng canh giữ cửa thiền, nhắc hành giả giữ gìn sáu căn.' },
  { id: 17, name: 'Tôn giả Khánh Hữu (Nan Đề Mật Đa La)', title: 'Hàng Long La Hán', emblem: 'Rồng xanh & Minh châu · Chế ngự sân', meaning: 'Hàng phục rồng dữ — biểu trưng cho trí tuệ chế ngự lòng sân hận.' },
  { id: 18, name: 'Tôn giả Tân Đầu Lư', title: 'Phục Hổ La Hán', emblem: 'Hổ vàng · Chế ngự tham lam', meaning: 'Thuần phục hổ dữ bằng tâm từ — chế ngự lòng tham lam dữ tợn.' }
];

const AUDIO_LIBRARY = [
  { id: 's0_chao', title: 'Lời chào Cổng Tam Quan Chùa Vĩnh Tràng', file: 's0_chao.mp3', duration: '01:15' },
  { id: 's3_giang_duong', title: 'Pháp âm Giảng Đường: Hơi thở & Chánh niệm', file: 's3_giang_duong.mp3', duration: '03:20' },
  { id: 's1_adida', title: 'Chiêm bái Đại tượng Phật A Di Đà', file: 's1_adida.mp3', duration: '01:45' },
  { id: 's2_thap_nhang', title: 'Hướng dẫn Dâng ba nén tâm hương đúng pháp', file: 's2_thap_nhang.mp3', duration: '01:30' },
  { id: 's3_lay_phat', title: 'Nghi thức Lễ Phật Tam Bái tại Chánh Điện', file: 's3_lay_phat.mp3', duration: '01:50' },
  { id: 's4_dilac', title: 'Nụ cười Hỷ Xả của Đức Phật Di Lặc', file: 's4_dilac.mp3', duration: '01:40' },
  { id: 's5_nirvana', title: 'Quán niệm Tịch Tịnh trước Tượng Phật Niết Bàn', file: 's5_nirvana.mp3', duration: '02:05' },
  { id: 'niem_phat_xa', title: 'Tiếng niệm Phật A Di Đà & Chuông Mõ Đạo Tràng', file: 'niem_phat_xa.mp3', duration: '04:10' },
  { id: 's6_hoi_huong', title: 'Kệ Hồi Hướng Công Đức Viên Mãn', file: 's6_hoi_huong.mp3', duration: '02:15' }
];

export class ChuaOnlineApp {
  constructor() {
    this.saved = this.loadState();
    this.playerPos = { x: 35.5, z: 50.8, yaw: Math.PI - 0.16, moving: false };
    this.nearbyStallTrigger = null;
    this._lastChanhDienBellAt = 0;
    this.entranceTourActive = false;
    this.spiritual = createSpiritualState(this.saved.spiritual);
    this.storeProfile = createStoreProfileState(this.saved.storeProfile);
    this.activityHub = ensureDailyMissionDate(createActivityHubState(this.saved.activityHub));
    this.timeOfDay = TIME_OF_DAY_PRESETS[this.saved.timeOfDay] ? this.saved.timeOfDay : 'morning';
    this.elderFontScale = ['normal', 'large', 'xlarge'].includes(this.saved.elderFontScale)
      ? this.saved.elderFontScale
      : 'normal';
    this.activeGuidedBeacon = null;
    this.ttsSpeaking = false;
    this.mindfulnessTimer = { running: false, intervalId: null, totalSec: 300, remainingSec: 300 };
    this.storeCategory = 'ao_trang';
    this.marketStallTab = 'huong_hoa';
    this.activeModalVariant = 'default';
    this.cart = Array.isArray(this.saved.cart)
      ? this.saved.cart
      : [
          {
            id: 'so_tay_hoa_sen',
            name: 'Sổ tay hoa sen',
            price: 125000,
            image: '/Thiết kế giao diện/Vật phẩm 3D/models/tham_khao_tui_sen.png',
            tab: 'souvenir',
            qty: 1
          }
        ];
    this.completedLessons = new Set(this.saved.completedLessons || ['A1']);
    this.orders = this.saved.orders || [];
    this.ugcGallery = Array.isArray(this.saved.ugcGallery)
      ? this.saved.ugcGallery
      : [...INITIAL_UGC_GALLERY];
    this.characterModelKey = this.saved.characterModelKey || 'nu'; // 'nu' | 'nam' | 'tre_em'
    this.uploadedUserPhotoDataUrl = this.saved.uploadedUserPhotoDataUrl || null;
    this.lastDailyDharmaDate = this.saved.lastDailyDharmaDate || null;
    this.lastDailyDharmaQuoteId = this.saved.lastDailyDharmaQuoteId || null;
    this.dailyDharmaQuotes = [];
    this.activeStationKey = 'cong_tam_quan';

    // Active screen & sub-views
    this.activeScreen = 'courtyard'; // 'courtyard' | 'shop' | 'lecture'
    this.shopTab = 'souvenir'; // 'souvenir' | 'study' | '3d'
    this.lectureTab = 'lesson'; // 'listen' | 'lesson' | 'package' (default 'lesson' per Giảng đường V2 spec)
    this.activePathId = 'A';
    this.activeLessonId = 'A1';
    this.selectedQuizOption = 0;
    this.quizFeedback = null;
    this.autoWalkObjective = null;

    // Audio & WebAudio
    this.audioEl = new Audio();
    this.audioPlaying = false;
    this.audioMuted = false;
    this.currentAudioFile = 's3_giang_duong.mp3';
    this.audioCtx = null;

    // 3D World & Canvas references
    this.world3d = null;
    this.backdropImg = null;
    this.particles = [];
    this.is3DWorldOpen = true;
    this.toastTimer = null;
    this.cachedGLBCharacters = {};
    this.cachedGLBProps = {};
  }

  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  saveState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          spiritual: this.spiritual,
          storeProfile: this.storeProfile,
          activityHub: this.activityHub,
          timeOfDay: this.timeOfDay,
          elderFontScale: this.elderFontScale,
          cart: this.cart,
          completedLessons: Array.from(this.completedLessons),
          orders: this.orders,
          ugcGallery: this.ugcGallery.slice(0, 12),
          characterModelKey: this.characterModelKey,
          uploadedUserPhotoDataUrl: this.uploadedUserPhotoDataUrl,
          lastDailyDharmaDate: this.lastDailyDharmaDate,
          lastDailyDharmaQuoteId: this.lastDailyDharmaQuoteId
        })
      );
    } catch {}
  }

  init() {
    this.mountDOM();
    this.initLive3DWorld();
    this.setTimeOfDay(this.timeOfDay, true, false);
    this.applyElderFontScale(this.elderFontScale, false);
    this.bindEvents();
    this.renderShopProducts();
    this.renderLectureStage();
    this.updateActionBadges();

    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') !== '1') {
      const todayKey = getLocalDateKey();
      if (shouldShowDailyDharmaToday(this.lastDailyDharmaDate, todayKey)) {
        this.showDailyDharmaModal({ markSeenToday: true });
      }
    }

    window.__CHUA_ONLINE_APP__ = this;
    window.advanceTime = (ms = 16) => {
      const dt = ms / 1000;
      if (this.world3d) {
        this.world3d.stepSimulation(dt);
        this.world3d.renderFrame();
      }
    };
    window.render_game_to_text = () =>
      JSON.stringify({
        screen: this.activeScreen,
        is3DWalkableWorld: true,
        insideInteriorHall: Boolean(this.world3d?.insideInterior),
        lectureHall3DMode: Boolean(this.world3d?.lectureHallMode),
        timeOfDay: this.timeOfDay,
        elderFontScale: this.elderFontScale,
        activeGuidedBeacon: this.activeGuidedBeacon,
        activeStationKey: this.activeStationKey,
        shopTab: this.shopTab,
        lectureTab: this.lectureTab,
        activeLessonId: this.activeLessonId,
        characterModelKey: this.characterModelKey,
        dailyDharmaSeenDate: this.lastDailyDharmaDate,
        playerPos: this.world3d
          ? {
              x: Number(this.world3d.playerPos.x.toFixed(2)),
              z: Number(this.world3d.playerPos.z.toFixed(2)),
              yaw: Number(this.world3d.playerYaw.toFixed(2)),
              moving: this.world3d.playerMoving
            }
          : this.playerPos,
        ugcMilestone: checkUGCMilestoneUnlock(this.spiritual, this.completedLessons.size),
        hasUploadedUserPhoto: Boolean(this.uploadedUserPhotoDataUrl),
        spiritual: this.spiritual,
        storeState: this.storeProfile,
        activityHub: this.activityHub,
        interiorTransitionActive: Boolean(this.world3d?.interiorTransition),
        journeyImprint: calculateJourneyImprint(this.spiritual),
        autoWalkObjective: this.autoWalkObjective ? this.autoWalkObjective.name : null,
        cartSummary: calculateCartSummary(this.cart)
      });
  }

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
  }

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

        <nav id="interior-zone-bar" class="interior-zone-bar" style="display:none;" aria-label="Các khu trong Chùa Chính">
          <button type="button" class="walk-chip-btn active" data-interior-zone="tien_duong">1. Tiền đường</button>
          <button type="button" class="walk-chip-btn" data-interior-zone="chanh_dien">2. Chánh điện</button>
          <button type="button" class="walk-chip-btn" data-interior-zone="non_bo_giua">3. Thiên Tỉnh 1</button>
          <button type="button" class="walk-chip-btn" data-interior-zone="khu_tho">4. Nhà Tổ</button>
          <button type="button" class="walk-chip-btn" data-interior-zone="san_thien_tinh_2">5. Thiên Tỉnh 2</button>
          <button type="button" class="walk-chip-btn" data-interior-zone="nha_hau">6. Nhà Hậu</button>
          <button type="button" class="walk-chip-btn" data-interior-zone="trai_duong">🍚 Trai Đường</button>
          <button type="button" class="walk-chip-btn" id="btn-interior-cutaway" title="Mặt cắt kiến trúc xuyên tường chữ Quốc">✂️ Mặt cắt 3D</button>
          <button type="button" class="walk-chip-btn" id="btn-interior-history" title="Đối chiếu tư liệu Tôn tượng Tam Bảo">📜 Tư liệu</button>
          <button type="button" class="walk-chip-btn interior-exit-chip" id="btn-interior-exit-courtyard">← Ra Sân Chùa</button>
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

            <button class="nav-pill-btn nav-activity-btn" id="nav-btn-activity" title="Điểm danh 7 ngày · Nhiệm vụ · Hộp thư Nhà Chùa · Hướng dẫn đi chùa">
              <span aria-hidden="true">🔔</span>
              <span>Hành trình</span>
              <span class="nav-activity-badge" id="nav-activity-badge" style="display:none;">0</span>
            </button>

            <button class="nav-pill-btn nav-merit-btn" id="nav-btn-merit" title="Sổ Công Đức Thực Hành (Lễ Phật · Dâng hương · Dâng hoa)">
              <span class="merit-lotus-glyph" aria-hidden="true">🪷</span>
              <span>Công đức: <strong id="nav-merit-count">0</strong></span>
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

            <button class="nav-pill-btn" id="nav-btn-account">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6"/>
              </svg>
              <span>Tài khoản</span>
            </button>
          </nav>
        </header>

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

        <!-- Interactive Proximity Prompt for Nhà Tạp Hóa Cổng Chùa -->
        <button id="stall-proximity-btn" class="stall-proximity-prompt" type="button" style="display:none;" aria-label="Mở Nhà Tạp Hóa gần bạn">
          <span class="stall-proximity-icon">🛒</span>
          <span id="stall-proximity-label">Ghé Nhà Tạp Hóa</span>
          <span class="stall-proximity-key">E</span>
        </button>

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

      <!-- ================= 3. GIẢNG ĐƯỜNG PHẬT PHÁP (Live 3D Animated Hall + Elder-Friendly Mobile) ================= -->
      <section id="lecture-screen" data-font-scale="${this.elderFontScale}" aria-label="Giảng đường Phật pháp">
        <header class="lecture-top-bar">
          <div class="lecture-top-left">
            <button class="lecture-back-courtyard" id="btn-lecture-back">← Sân chùa</button>
            <h1 class="lecture-hall-heading">Giảng đường Phật pháp</h1>
          </div>
          <div class="lecture-top-actions">
            <div class="lecture-font-controls" aria-label="Điều chỉnh cỡ chữ dễ đọc">
              <button type="button" class="lecture-font-btn" id="btn-lecture-font-dec" title="Giảm cỡ chữ">A-</button>
              <button type="button" class="lecture-font-btn" id="btn-lecture-font-inc" title="Tăng cỡ chữ lớn hơn">A+</button>
            </div>
            <button class="lecture-back-courtyard" id="btn-lecture-daily-dharma" style="background:rgba(92,56,31,0.78);border-color:rgba(255,232,185,0.45);color:#fff6e5;">
              Lời dạy hôm nay
            </button>
            <button class="lecture-back-courtyard" id="btn-lecture-textbooks" style="background:rgba(230,174,71,0.22);border-color:rgba(230,174,71,0.55);color:#ffe8b3;">
              Sách Phật học
            </button>
            <button class="lecture-audio-gold-btn" id="btn-lecture-recordings">Bài thu âm</button>
          </div>
        </header>

        <main class="lecture-center-stage" id="lecture-center-stage"></main>

        <footer class="lecture-bottom-dock" role="tablist">
          <button class="lecture-dock-tab active" data-lecture-tab="listen" role="tab">
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
            <span>Gói học</span>
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

  /* ========================================================================
     LIVE WALKABLE 3D WORLD INITIALIZATION (Default Viewport)
     ======================================================================== */
  initLive3DWorld() {
    const canvas = document.getElementById('world3d-canvas');
    if (!canvas) return;

    this.world3d = new VinhTrang3DWorld(canvas, {
      initialCharKey: this.characterModelKey,
      onAutoWalkTargetChange: (targetStation) => {
        this.autoWalkObjective = targetStation || null;
        const banner = document.getElementById('auto-walk-objective-banner');
        if (banner) {
          if (targetStation) {
            banner.style.display = 'inline-flex';
            banner.textContent = `Đang đi tới: ${targetStation.name}`;
          } else {
            banner.style.display = 'none';
          }
        }
      },
      onStationProximity: (station, dist) => {
        if (!station) return;
        this.activeStationKey = station.key;
        this.updateAnCompanionCard();
        if (station.key === 'chanh_dien' && typeof dist === 'number' && dist < 12.5 && !this.world3d?.insideInterior) {
          this.playChanhDienBellCadence();
        }
      },
      onStallProximity: (stall) => {
        this.nearbyStallTrigger = stall || null;
        const btn = document.getElementById('stall-proximity-btn');
        const label = document.getElementById('stall-proximity-label');
        if (!btn || !label) return;
        if (stall && !this.world3d?.insideInterior) {
          const shortTitle = String(stall.title || 'Nhà Tạp Hóa').split('·')[0].trim();
          label.textContent = `Ghé ${shortTitle}`;
          btn.style.display = 'inline-flex';
        } else {
          btn.style.display = 'none';
        }
      },
      onEntranceTourChange: (active) => {
        this.entranceTourActive = Boolean(active);
        const banner = document.getElementById('entrance-tour-banner');
        if (banner) {
          banner.style.display = active ? 'inline-flex' : 'none';
        }
      },
      onStationArrive: (station) => {
        if (!station) return;
        this.activeStationKey = station.key;
        if (!this.spiritual.visitedStations.includes(station.id)) {
          this.spiritual.visitedStations.push(station.id);
        }
        this.spiritual = recordSpiritualMilestone(
          this.spiritual,
          `Ghé thăm ${station.name}`
        );
        this.saveState();
        this.updateActivityHubBadge();
        this.highlightActiveWalkChip(station.key);
        this.playVoiceAudio(station.audio);
        if (station.key === 'chanh_dien') {
          this.playChanhDienBellCadence();
        }
        this.showToast(station.name, station.subtitle, 4000, false);
      },
      onUpdateProjectedPins: (projected) => {
        const pin = document.getElementById('pin-chanh-dien');
        const labelEl = document.getElementById('pin-chanh-dien-label');
        if (!pin) return;
        const p = Array.isArray(projected) && projected[0];
        if (!p || !p.visible || p.y < 105 || p.y > window.innerHeight - 130) {
          pin.style.display = 'none';
        } else {
          pin.style.display = 'inline-flex';
          pin.style.left = `${Math.round(p.x)}px`;
          pin.style.top = `${Math.round(p.y)}px`;
          if (labelEl) labelEl.textContent = p.label || 'Chánh điện';
        }
      },
      onLoaded: () => {
        this.syncStoreVisualsTo3D();
      },
      onTransitionFade: (active) => {
        const veil = document.getElementById('temple-transition-veil');
        if (veil) veil.classList.toggle('active', Boolean(active));
      },
      onInteriorZoneChange: (zoneKey) => {
        this.highlightInteriorZoneChip(zoneKey);
      },
      onInteriorStateChange: (inside) => {
        const pinsLayer = document.getElementById('scene-pins-layer');
        const btn = document.getElementById('btn-toggle-interior-hall');
        const stallBtn = document.getElementById('stall-proximity-btn');
        const zoneBar = document.getElementById('interior-zone-bar');
        if (pinsLayer) pinsLayer.style.display = inside ? 'none' : 'block';
        if (zoneBar) zoneBar.style.display = inside ? 'flex' : 'none';
        if (inside) {
          this.nearbyStallTrigger = null;
          if (stallBtn) stallBtn.style.display = 'none';
          if (btn) {
            btn.classList.add('active');
            btn.innerHTML = '← Ra Sân Chánh Điện 3D';
          }
          this.highlightInteriorZoneChip(this.world3d?.getInteriorZoneKey() || 'tien_duong');
          const cutBtn = document.getElementById('btn-interior-cutaway');
          if (cutBtn) cutBtn.classList.toggle('active', Boolean(this.world3d?.interiorCutaway));
          this.spiritual = recordSpiritualMilestone(this.spiritual, 'Vào bên trong Chùa Chính');
          this.saveState();
          this.playBellTone(216, 2.6);
          this.showToast(
            'Bên trong Chùa Chính Chữ Quốc (國)',
            'Đi dọc từ 1. Tiền đường → 2. Chánh điện → 3. Thiên Tỉnh 1 → 4. Nhà Tổ → 5. Thiên Tỉnh 2 → 6. Nhà Hậu hoặc bật ✂️ Mặt cắt 3D để ngắm kết cấu.',
            5200,
            false
          );
        } else {
          const cutBtn = document.getElementById('btn-interior-cutaway');
          if (cutBtn) cutBtn.classList.remove('active');
          if (btn) {
            btn.classList.remove('active');
            btn.innerHTML = 'Vào Chánh điện';
          }
          this.showToast(
            'Ra sân chùa',
            'Bạn đã trở lại khoảng sân trước Chánh điện.',
            3200
          );
        }
      },
      onObjectClick: (action, payload) => {
        if (action === 'ENTER_INTERIOR') {
          this.toggleInteriorHallIn3D(true);
        } else if (action === 'OPEN_ARHAT') {
          this.openExploreModal('arhats', Number.isFinite(payload?.arhatIndex) ? payload.arhatIndex : 0);
        } else if (action === 'LE_PHAT') {
          this.triggerLePhat();
        } else if (action === 'DANG_HUONG') {
          this.triggerDangHuong();
        } else if (action === 'DANG_HOA') {
          this.triggerDangHoa();
        } else if (action === 'OPEN_SHOP') {
          this.openNineTabStoreModal(payload?.category || 'le_vat');
        } else if (action === 'OPEN_MARKET_STALL') {
          this.openMarketplaceStallModal(payload?.category || 'huong_hoa', payload?.title);
        } else if (action === 'CLOSED_MAIN_GATE') {
          this.playBellTone(260, 1.4);
          this.showToast(
            '⛩️ Cổng Chính Tam Quan đang đóng nghi lễ',
            'Mời bạn rẽ sang phải đi qua Cổng Phụ Tịnh Độ Huyền Môn đang mở rộng, ghé Nhà Tạp Hóa và theo lối hoa giấy vào Chánh điện.',
            4800,
            false
          );
        } else if (action === 'OPEN_LECTURE') {
          this.switchScreen('lecture');
        } else if (action === 'RING_BIG_BELL') {
          this.playBellTone(174, 4.2);
          setTimeout(() => this.playBellTone(174, 3.6), 950);
          this.spiritual = recordSpiritualMilestone(this.spiritual, 'Thỉnh Đại Hồng Chung tại Lầu Chuông');
          this.saveState();
          this.updateUGCMilestoneHUD();
          this.showToast(
            '🔔 Tiếng Đại Hồng Chung ngân vang khắp thiền viện',
            'Âm chuông trầm ấm lan tỏa từ Lầu Chuông Đại Hồng Chung vùng đất cổ Mỹ Tho.',
            4800,
            true
          );
        } else if (action === 'TOAST' && payload) {
          this.spiritual = recordSpiritualMilestone(this.spiritual, payload.title || 'Chiêm bái khuôn viên chùa');
          this.saveState();
          this.updateUGCMilestoneHUD();
          this.showToast(payload.title, payload.desc, 4800, true);
        }
      }
    });

    this.world3d.init();

    window.addEventListener('resize', () => {
      this.resizeFXCanvas();
    });
  }

  updateAnCompanionCard() {
    const st =
      PILGRIMAGE_STATIONS.find((s) => s.key === this.activeStationKey) || PILGRIMAGE_STATIONS[5];
    const stEl = document.getElementById('an-card-station');
    const quoteEl = document.getElementById('an-card-quote');
    const actBtn = document.getElementById('btn-an-station-action');
    if (!stEl || !quoteEl || !actBtn) return;

    const companionGuides = {
      cong_tam_quan: {
        quote: 'Chú tiểu An: "Cổng Tam Quan ghép mảnh sành sứ cổ lấp lánh dưới nắng. Bước qua cửa Không để lòng nhẹ tênh!"',
        btnLabel: '🎧 Nghe thuyết minh Cổng Tam Quan'
      },
      ho_sen_ca_koi: {
        quote: 'Chú tiểu An: "Song Liên Trì nước biếc sen hồng, đàn cá Koi vàng cam đang bơi lượn quanh Đài Quan Âm!"',
        btnLabel: '🐟 Cho cá Koi ăn & Thả hoa sen'
      },
      phat_adida: {
        quote: 'Chú tiểu An: "Đại tượng Phật A Di Đà cao sừng sững giữa vòm cây xanh, tay kết ấn Tiếp Dẫn từ bi."',
        btnLabel: '🙏 Chiêm bái & Lễ Phật A Di Đà'
      },
      phat_di_lac: {
        quote: 'Chú tiểu An: "Đức Phật Di Lặc nở nụ cười hoan hỷ bao dung, nhắc ta buông xả mọi phiền muộn."',
        btnLabel: '😊 Lễ Phật Di Lặc & Cầu Hoan Hỷ'
      },
      lu_huong_san: {
        quote: 'Chú tiểu An: "Trước Lư Hương đồng có đèn dầu thắp hương. Mời đạo hữu châm 3 nén tâm hương Giới - Định - Tuệ."',
        btnLabel: '🔥 Thắp nhang từ đèn dầu (4 bước)'
      },
      chanh_dien: {
        quote: 'Chú tiểu An: "Mặt tiền Chánh Điện 13 nhịp vòm vàng rực rỡ. Mời đạo hữu cởi giày bước vào Nội Điện 18 La Hán!"',
        btnLabel: this.world3d?.insideInterior ? '🙏 Chiêm bái 18 Vị La Hán' : '🏛️ Vào Nội Điện 18 La Hán'
      },
      cua_hang_luu_niem: {
        quote: 'Chú tiểu An: "Quầy Lưu Niệm có nón lá thêu sen, áo tràng, tràng hạt bồ đề và 20 pháp khí 3D để thử gắn!"',
        btnLabel: '🏮 Mở Cửa Hàng Lưu Niệm 3D'
      },
      giang_duong: {
        quote: 'Chú tiểu An: "Giảng đường gỗ lim trang nghiêm có 24 bài học Phật pháp và 10 giáo trình PDF gốc."',
        btnLabel: '📖 Vào Giảng Đường Học Phật'
      },
      phat_niet_ban: {
        quote: 'Chú tiểu An: "Sau Chánh Điện là Đại Tượng Phật Niết Bàn dài 28m và Bảo Tháp Xá Lợi 7 tầng uy nghiêm."',
        btnLabel: '🔔 Thỉnh Chuông & Đọc Kệ Hồi Hướng'
      }
    };

    const g = companionGuides[st.key] || companionGuides.chanh_dien;
    stEl.textContent = st.pinLabel;
    quoteEl.textContent = g.quote;
    actBtn.textContent = g.btnLabel;
  }

  triggerAnStationAction() {
    const key = this.activeStationKey;
    if (key === 'cong_tam_quan') {
      this.playBellTone(216, 2.4);
      this.playVoiceAudio('s0_chao.mp3');
      this.showToast('⛩️ Cổng Tam Quan Nghệ Thuật Khảm Sành Sứ', 'Ba cửa Không — Vô Tướng — Vô Tác dẫn vào cõi thiền Vĩnh Tràng.', 4800, true);
    } else if (key === 'ho_sen_ca_koi') {
      this.world3d?.placeLotusOfferingIn3D();
      this.playBellTone(324, 2.2);
      this.spiritual = recordSpiritualMilestone(this.spiritual, 'Cho cá Koi ăn & Thả sen tại Song Liên Trì');
      this.saveState();
      this.updateUGCMilestoneHUD();
      this.showToast('🐟 Đã rải thức ăn cho đàn cá Koi & Thả sen', 'Đàn cá Koi quẫy đuôi bơi lại gần mặt hồ sen trong vắt!', 4800, true);
    } else if (key === 'phat_adida') {
      this.playVoiceAudio('s1_adida.mp3');
      this.triggerLePhat();
    } else if (key === 'phat_di_lac') {
      this.playVoiceAudio('s4_dilac.mp3');
      this.triggerLePhat();
    } else if (key === 'lu_huong_san') {
      this.triggerDangHuong();
    } else if (key === 'chanh_dien') {
      if (this.world3d?.insideInterior) {
        this.openExploreModal('arhats');
      } else {
        this.toggleInteriorHallIn3D(true);
      }
    } else if (key === 'cua_hang_luu_niem') {
      this.openMarketplaceStallModal('huong_hoa', 'Sạp Hàng Cổng Chùa Vĩnh Tràng');
    } else if (key === 'giang_duong') {
      this.switchScreen('lecture');
    } else if (key === 'phat_niet_ban') {
      this.playBellTone(196, 3.2);
      this.playVoiceAudio('s6_hoi_huong.mp3');
      this.spiritual = recordSpiritualMilestone(this.spiritual, 'Hồi hướng tại Đại Tượng Phật Niết Bàn & Bảo Tháp 7 Tầng');
      this.saveState();
      this.updateUGCMilestoneHUD();
      this.showToast('🔔 Nguyện Đem Công Đức Này — Hồi Hướng Khắp Tất Cả', 'Tiếng Đại Hồng Chung ngân vang từ Bảo Tháp 7 Tầng và Vườn Phật Niết Bàn.', 5200, true);
    }
  }

  highlightActiveWalkChip(stationKey) {
    document.querySelectorAll('[data-walk-station]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-walk-station') === stationKey);
    });
  }

  teleportToStationIn3D(stationKey) {
    this.activeStationKey = stationKey;
    this.highlightActiveWalkChip(stationKey);
    const st = findAnyTempleDestination(stationKey) || PILGRIMAGE_STATIONS[5];
    if (!st.isDiscovery && typeof st.id === 'number' && !this.spiritual.visitedStations.includes(st.id)) {
      this.spiritual.visitedStations.push(st.id);
    }
    this.spiritual = recordSpiritualMilestone(this.spiritual, `Đến chiêm bái ${st.name}`);
    this.saveState();
    this.updateUGCMilestoneHUD();
    if (this.world3d) {
      if (this.world3d.insideInterior) {
        this.toggleInteriorHallIn3D(false);
      }
      this.world3d.teleportToStation(stationKey);
      this.playerPos = {
        x: Number(this.world3d.playerPos.x.toFixed(2)),
        z: Number(this.world3d.playerPos.z.toFixed(2)),
        yaw: Number(this.world3d.playerYaw.toFixed(2)),
        moving: false
      };
    }
    if (st.audio) {
      this.playVoiceAudio(st.audio);
    } else {
      this.playBellTone(260, 2.0);
    }
    this.showToast(st.name, st.subtitle, 4000, false);
  }

  walkToStationIn3D(stationKey) {
    this.activeStationKey = stationKey;
    this.highlightActiveWalkChip(stationKey);
    const st = findAnyTempleDestination(stationKey) || PILGRIMAGE_STATIONS[5];

    if (!st.isDiscovery && typeof st.id === 'number' && !this.spiritual.visitedStations.includes(st.id)) {
      this.spiritual.visitedStations.push(st.id);
    }
    this.spiritual = recordSpiritualMilestone(this.spiritual, `Đến ${st.name}`);
    this.saveState();

    if (this.world3d) {
      const pinsLayer = document.getElementById('scene-pins-layer');
      if (pinsLayer) pinsLayer.style.display = 'block';
      this.world3d.walkToStation(stationKey);
      this.playerPos = {
        x: st.standPos?.x ?? st.pos.x,
        z: st.standPos?.z ?? st.pos.z,
        yaw: st.lookYaw ?? Math.PI,
        moving: true
      };
    }

    this.showToast(
      `Đang đi tới ${st.name}`,
      st.subtitle,
      3200,
      false
    );
  }

  toggleInteriorHallIn3D(forceEnter = null, onEntered = null) {
    if (!this.world3d) return;
    const entering = forceEnter !== null ? forceEnter : !this.world3d.insideInterior;
    if (entering) {
      this.world3d.enterInteriorHall(false, onEntered);
      this.playChanhDienBellCadence({ force: true });
      this.showToast(
        'Đang đi dọc lối hoa giấy bên hông vào Cửa Hông Phải...',
        'Xin giữ bước chân nhẹ nhàng khi tiến qua cửa hông vào Tam Bảo.',
        3000,
        false
      );
    } else {
      this.world3d.exitInteriorHall(false);
    }
  }

  updateUGCMilestoneHUD() {
    const status = checkUGCMilestoneUnlock(this.spiritual, this.completedLessons.size);
    const hudBtn = document.getElementById('btn-ugc-milestone-hud');
    const iconEl = document.getElementById('ugc-hud-icon');
    const textEl = document.getElementById('ugc-hud-text');
    if (!hudBtn || !iconEl || !textEl) return;

    if (status.unlocked) {
      hudBtn.classList.remove('locked');
      hudBtn.classList.add('unlocked');
      iconEl.textContent = '📸';
      textEl.textContent = `Check-in UGC: ${status.latestMilestone}`;
    } else {
      hudBtn.classList.remove('unlocked');
      hudBtn.classList.add('locked');
      iconEl.textContent = '🔒';
      textEl.textContent = 'Check-in UGC (Hoàn thành 1 nghi lễ để mở)';
    }
  }

  /* ========================================================================
     AMBIENT INCENSE SMOKE & LOTUS PETAL PARTICLE FX
     ======================================================================== */
  initParticleFX() {
    this.resizeFXCanvas();
    for (let i = 0; i < 28; i++) {
      this.particles.push(this.createParticle(i));
    }
    const loop = () => {
      this.stepParticles(0.016);
      setTimeout(loop, 95);
    };
    setTimeout(loop, 95);
  }

  resizeFXCanvas() {
    const fx = document.getElementById('fx-canvas');
    if (!fx) return;
    fx.width = window.innerWidth;
    fx.height = window.innerHeight;
  }

  createParticle(idx = 0) {
    const isSmoke = idx < 16;
    return {
      type: isSmoke ? 'smoke' : 'petal',
      x: isSmoke ? 0.5 + (Math.random() - 0.5) * 0.03 : Math.random(),
      y: isSmoke ? 0.52 - Math.random() * 0.14 : Math.random() * 0.6,
      vx: isSmoke ? (Math.random() - 0.5) * 0.004 : (Math.random() - 0.3) * 0.015,
      vy: isSmoke ? -0.015 - Math.random() * 0.012 : 0.012 + Math.random() * 0.015,
      size: isSmoke ? 8 + Math.random() * 14 : 4 + Math.random() * 5,
      alpha: isSmoke ? 0.18 + Math.random() * 0.22 : 0.45 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2
    };
  }

  stepParticles(dt) {
    if (this.activeScreen !== 'courtyard') return;
    const fx = document.getElementById('fx-canvas');
    if (!fx) return;
    const ctx = fx.getContext('2d');
    const w = fx.width;
    const h = fx.height;
    ctx.clearRect(0, 0, w, h);

    const smokeMultiplier = this.spiritual.incenseOfferings > 0 ? 1.65 : 1.0;

    for (const p of this.particles) {
      p.phase += dt * 2.2;
      p.x += (p.vx + Math.sin(p.phase) * 0.003) * dt;
      p.y += p.vy * dt;

      if (p.type === 'smoke') {
        if (p.y < 0.34) {
          p.y = 0.53;
          p.x = 0.5 + (Math.random() - 0.5) * 0.02;
        }
        const px = p.x * w;
        const py = p.y * h;
        const grad = ctx.createRadialGradient(px, py, 1, px, py, p.size * smokeMultiplier);
        grad.addColorStop(0, `rgba(255, 248, 235, ${p.alpha * smokeMultiplier})`);
        grad.addColorStop(1, 'rgba(255, 248, 235, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, p.size * smokeMultiplier, 0, Math.PI * 2);
        ctx.fill();
      } else {
        if (p.y > 0.95 || p.x < 0 || p.x > 1) {
          p.y = 0.05;
          p.x = Math.random();
        }
        const px = p.x * w;
        const py = p.y * h;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(p.phase);
        ctx.fillStyle = `rgba(247, 143, 179, ${p.alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  /* ========================================================================
     SOUND & VOICEOVER ENGINE (WebAudio Bell/Mokugyo + audio_v5 MP3s)
     ======================================================================== */
  ensureAudioContext() {
    if (!this.audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.audioCtx = new AC();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  playBellTone(freq = 216, duration = 2.6) {
    try {
      this.ensureAudioContext();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 2.756, now);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch {}
  }

  playChanhDienBellCadence({ force = false } = {}) {
    if (this.audioMuted) return;
    const nowMs = Date.now();
    if (!force && nowMs - (this._lastChanhDienBellAt || 0) < 18000) return;
    this._lastChanhDienBellAt = nowMs;

    try {
      this.ensureAudioContext();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const baseTime = ctx.currentTime + 0.04;
      const cadence = [
        { offset: 0, freq: 216, gain: 0.1, dur: 2.5 },
        { offset: 1.35, freq: 243, gain: 0.09, dur: 2.4 },
        { offset: 2.7, freq: 216, gain: 0.11, dur: 3.0 }
      ];
      for (const hit of cadence) {
        const t = baseTime + hit.offset;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(hit.freq, t);
        osc2.frequency.setValueAtTime(hit.freq * 2.756, t);
        gain.gain.setValueAtTime(0.0005, t);
        gain.gain.linearRampToValueAtTime(hit.gain, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0006, t + hit.dur);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + hit.dur + 0.05);
        osc2.stop(t + hit.dur + 0.05);
      }
    } catch {}
  }

  playMokugyoTap() {
    try {
      this.ensureAudioContext();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(390, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.09);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  playVoiceAudio(fileName) {
    if (!fileName) return;
    this.currentAudioFile = fileName;
    this.audioEl.src = `/Mô hình 3D Vĩnh Tràng/audio_v5/${fileName}`;
    this.audioEl.volume = 0.85;
    this.audioEl
      .play()
      .then(() => {
        this.audioPlaying = true;
      })
      .catch(() => {
        this.audioPlaying = false;
      });
  }

  highlightInteriorZoneChip(zoneKey) {
    document.querySelectorAll('[data-interior-zone]').forEach((btn) => {
      const match = btn.getAttribute('data-interior-zone') === zoneKey;
      btn.classList.toggle('active', match);
    });
  }

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
  }

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
  }

  switchScreen(screenName) {
    this.activeScreen = screenName;
    const shopEl = document.getElementById('shop-screen');
    const lectureEl = document.getElementById('lecture-screen');
    const pinsLayer = document.getElementById('scene-pins-layer');
    if (shopEl) shopEl.classList.toggle('open', screenName === 'shop');
    if (lectureEl) lectureEl.classList.toggle('open', screenName === 'lecture');
    if (pinsLayer && !this.world3d?.insideInterior) {
      pinsLayer.style.display = screenName === 'courtyard' ? 'block' : 'none';
    }

    if (screenName !== 'lecture') {
      this.stopLectureSpeech();
    }
    this.world3d?.setLectureHallMode?.(screenName === 'lecture');

    if (screenName === 'shop') {
      this.renderShopProducts();
    } else if (screenName === 'lecture') {
      this.renderLectureStage();
    }
  }

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
  }

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
  }

  stepElderFontScale(delta) {
    const order = ['normal', 'large', 'xlarge'];
    const idx = Math.max(0, order.indexOf(this.elderFontScale));
    const nextIdx = Math.max(0, Math.min(order.length - 1, idx + delta));
    const nextScale = order[nextIdx];
    this.applyElderFontScale(nextScale, true);
    const labelMap = { normal: 'Chữ tiêu chuẩn', large: 'Chữ lớn (+18%)', xlarge: 'Chữ rất lớn (+34%)' };
    this.showToast('Cỡ chữ Giảng đường', `Đã chuyển sang ${labelMap[nextScale]} cho cô bác dễ đọc.`, 2200, false);
  }

  stopLectureSpeech() {
    try {
      window.speechSynthesis?.cancel();
    } catch {}
    this.ttsSpeaking = false;
  }

  toggleLectureSpeech(lesson) {
    if (!lesson) return;
    if (this.ttsSpeaking) {
      this.stopLectureSpeech();
      this.renderLectureStage();
      return;
    }

    const speechText = `${lesson.title}. ${lesson.summary.slice(0, 3).join('. ')}. Gợi ý thực hành: ${lesson.example}`;
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    if (synth && typeof window.SpeechSynthesisUtterance === 'function') {
      try {
        synth.cancel();
        const utter = new window.SpeechSynthesisUtterance(speechText);
        utter.lang = 'vi-VN';
        utter.rate = 0.88;
        utter.pitch = 0.98;
        const voices = synth.getVoices?.() || [];
        const viVoice = voices.find((v) => String(v.lang || '').toLowerCase().startsWith('vi'));
        if (viVoice) utter.voice = viVoice;
        this.ttsSpeaking = true;
        utter.onend = () => {
          this.ttsSpeaking = false;
          if (this.activeScreen === 'lecture') this.renderLectureStage();
        };
        utter.onerror = () => {
          this.ttsSpeaking = false;
          if (this.activeScreen === 'lecture') this.renderLectureStage();
        };
        synth.speak(utter);
        this.playBellTone(288, 1.4);
        this.renderLectureStage();
        return;
      } catch {}
    }

    // Fallback when SpeechSynthesis is unavailable
    this.playBellTone(260, 2.0);
    this.playVoiceAudio(lesson.audio);
    this.audioPlaying = true;
    this.renderLectureStage();
  }

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
  }

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
  }

  updateMeritCounterHUD() {
    const summary = calculateMeritSummary(this.spiritual);
    const countEl = document.getElementById('nav-merit-count');
    if (countEl) {
      countEl.textContent = String(summary.totalActs);
    }
    return summary;
  }

  openMeritSummaryModal() {
    const m = calculateMeritSummary(this.spiritual);
    this.openModal(
      'Sổ Công Đức Thực Hành',
      `
      <div class="merit-summary-wrap">
        <div class="merit-hero-banner">
          <div>
            <div style="font-size:13px;font-weight:700;color:#FFE4A0;">TỔNG LẦN THỰC HÀNH NGHI LỄ</div>
            <div class="merit-total-num">${m.totalActs} <span style="font-size:16px;font-weight:700;">công đức</span></div>
          </div>
          <div style="font-size:13.5px;max-width:340px;line-height:1.45;color:#FFF6E5;">
            Ghi nhận số lần bạn thực hiện Lễ Phật, Dâng hương và Dâng hoa trong hành trình viếng Chùa Vĩnh Tràng.
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
  }

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
  }

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
  }

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
              bbox = o.geometry.boundingBox;
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
  }

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
        this.triggerLePhat({ skipWalk: true });
      });
      return;
    }

    const res = performSpiritualAction(this.spiritual, 'LE_PHAT');
    this.spiritual = res.state;
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
  }

  triggerDangHuong() {
    const res = performSpiritualAction(this.spiritual, 'DANG_HUONG_STEP');
    this.spiritual = res.state;
    this.saveState();
    this.updateActionBadges();
    this.world3d?.setIncenseBoost(true);
    this.playBellTone(288, 2.0);
    this.playVoiceAudio('s2_thap_nhang.mp3');
    this.renderDangHuongModal();
  }

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
  }

  triggerDangHoa() {
    const res = performSpiritualAction(this.spiritual, 'DANG_HOA');
    this.spiritual = res.state;
    this.activityHub = recordDailyMissionMetric(this.activityHub, 'dailyLotus', 1);
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
  }

  triggerNiemPhat() {
    this.playMokugyoTap();
    this.renderNiemPhatModal();
  }

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
        this.audioEl.pause();
        this.audioPlaying = false;
      } else {
        this.playVoiceAudio('niem_phat_xa.mp3');
      }
    });
  }

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
  }

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
  }

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

  /* ========================================================================
     GIẢNG ĐƯỜNG PHẬT PHÁP RENDERING (Live Animated 3D Hall + Elder Mobile UX)
     ======================================================================== */
  renderLectureStage() {
    const stage = document.getElementById('lecture-center-stage');
    if (!stage) return;

    document.querySelectorAll('.lecture-dock-tab').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-lecture-tab') === this.lectureTab);
    });

    const lessonIdx = Math.max(0, LECTURE_LESSONS.findIndex((l) => l.id === this.activeLessonId));
    const lesson = LECTURE_LESSONS[lessonIdx] || LECTURE_LESSONS[0];
    const conciseBullets = lesson.summary.slice(1, 3);

    if (this.lectureTab === 'listen') {
      stage.innerHTML = `
        <div class="lesson-study-stack lecture-listen-dock-wrap">
          <div class="lesson-cream-card lecture-translucent-card">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
              <div style="flex:1;min-width:210px;">
                <div style="font-size:12.5px;font-weight:800;color:#5C381F;text-transform:uppercase;letter-spacing:0.04em;">Giảng đường 3D trực tiếp · Bài ${lesson.id}</div>
                <div class="lesson-card-big-title" style="text-align:left;font-size:clamp(19px,2.2vw,24px);margin-top:2px;">${lesson.title}</div>
                <div class="lesson-card-meta" style="margin-bottom:0;">${lesson.sourceBook} · ${lesson.duration}</div>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button id="btn-listen-tts" class="lecture-tts-btn ${this.ttsSpeaking ? 'speaking' : ''}" type="button">
                  ${this.ttsSpeaking ? '⏹ Dừng đọc' : '🔊 Nghe Thầy Giảng'}
                </button>
                <button id="btn-toggle-lecture-listen" class="product-detail-btn" style="width:auto;padding:0 18px;min-height:48px;background:${this.audioPlaying ? '#C96F4A' : '#5C381F'};">
                  ${this.audioPlaying ? '❚❚ Tạm dừng pháp âm' : '▶ Phát pháp âm'}
                </button>
              </div>
            </div>
            <p class="lesson-summary-lead" style="margin-top:10px;margin-bottom:0;">
              “${lesson.summary[0]}”
            </p>
          </div>
        </div>
      `;

      document.getElementById('btn-listen-tts')?.addEventListener('click', () => {
        this.toggleLectureSpeech(lesson);
      });
      document.getElementById('btn-toggle-lecture-listen')?.addEventListener('click', () => {
        if (this.audioPlaying) {
          this.audioEl.pause();
          this.audioPlaying = false;
        } else {
          this.playVoiceAudio(lesson.audio);
          this.audioPlaying = true;
        }
        this.renderLectureStage();
      });
      return;
    }

    if (this.lectureTab === 'lesson') {
      stage.innerHTML = `
        <div class="lesson-study-stack">
          <div class="lesson-cream-card lesson-header-card lecture-translucent-card">
            <div class="lesson-card-big-title">${lesson.title}</div>
            <div class="lesson-card-meta">Bài ${lesson.id} (${lessonIdx + 1}/${LECTURE_LESSONS.length}) · ${lesson.duration} · ${lesson.sourceBook}</div>
            <div class="lecture-audio-pair-row">
              <button class="lecture-tts-btn ${this.ttsSpeaking ? 'speaking' : ''}" id="btn-lesson-tts" type="button">
                <span>${this.ttsSpeaking ? '⏹ Dừng Thầy đọc' : '🔊 Nghe Thầy Giảng'}</span>
              </button>
              <button class="lesson-listen-btn" id="btn-lesson-play-audio" type="button">
                <span style="display:inline-flex;align-items:center;gap:8px;">
                  <span>🎧</span>
                  <span>${this.audioPlaying ? 'Đang phát (Bấm dừng)' : 'Pháp âm chùa'}</span>
                </span>
                <span class="play-circle">${this.audioPlaying ? '❚❚' : '▶'}</span>
              </button>
            </div>
          </div>

          <div class="lesson-cream-card lecture-translucent-card">
            <div class="lesson-summary-lead">${lesson.summary[0]}</div>
            <ul class="lesson-bullet-list">
              ${conciseBullets.map((s) => `<li>${s}</li>`).join('')}
            </ul>
            <div class="lesson-example-box">
              <strong>Thực hành giản dị mỗi ngày:</strong> ${lesson.example}
            </div>
          </div>

          <div class="lesson-cream-card lecture-translucent-card">
            <div class="lesson-quiz-heading">${lesson.quiz.question}</div>
            <div class="lesson-quiz-options">
              ${lesson.quiz.options
                .map(
                  (opt, idx) => `
                <button class="lesson-quiz-option ${this.selectedQuizOption === idx ? 'selected' : ''}" data-quiz-idx="${idx}" type="button">
                  <span class="radio-dot"></span>
                  <span>${opt}</span>
                </button>
              `
                )
                .join('')}
            </div>
            ${
              this.quizFeedback
                ? `<div style="margin-top:10px;padding:12px 14px;border-radius:14px;background:${
                    this.quizFeedback.correct ? '#F6E9D2' : '#fce8e6'
                  };color:${
                    this.quizFeedback.correct ? '#5C381F' : '#991b1b'
                  };font-size:15px;font-weight:700;line-height:1.45;">
                    ${this.quizFeedback.correct ? '✓ Hoan hỷ! ' : '💡 Gợi ý: '}${this.quizFeedback.explanation}
                  </div>`
                : ''
            }
          </div>

          <div class="lecture-nav-footer">
            <button class="lecture-prev-btn" id="btn-lesson-prev" type="button">
              ← Bài trước
            </button>
            <button class="lecture-choose-btn" id="btn-lesson-choose-other" type="button">
              📖 Chọn bài
            </button>
            <button class="lesson-next-green-btn" id="btn-lesson-continue" type="button">
              <span>Bài tiếp theo</span>
              <span>→</span>
            </button>
          </div>
        </div>
      `;

      document.getElementById('btn-lesson-tts')?.addEventListener('click', () => {
        this.toggleLectureSpeech(lesson);
      });

      document.getElementById('btn-lesson-play-audio')?.addEventListener('click', () => {
        if (this.audioPlaying) {
          this.audioEl.pause();
          this.audioPlaying = false;
        } else {
          this.playVoiceAudio(lesson.audio);
          this.audioPlaying = true;
        }
        this.renderLectureStage();
      });

      stage.querySelectorAll('[data-quiz-idx]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.selectedQuizOption = Number(btn.getAttribute('data-quiz-idx') || 0);
          this.quizFeedback = gradeLessonQuiz(lesson.id, this.selectedQuizOption);
          if (this.quizFeedback.correct) {
            const wasNew = !this.completedLessons.has(lesson.id);
            this.completedLessons.add(lesson.id);
            if (wasNew) {
              this.activityHub = recordDailyMissionMetric(this.activityHub, 'dailyLessons', 1);
            }
            this.saveState();
            this.updateActionBadges();
            this.playBellTone(324, 1.8);
          }
          this.renderLectureStage();
        });
      });

      document.getElementById('btn-lesson-prev')?.addEventListener('click', () => {
        this.stopLectureSpeech();
        const prevLesson = LECTURE_LESSONS[(lessonIdx - 1 + LECTURE_LESSONS.length) % LECTURE_LESSONS.length];
        this.activeLessonId = prevLesson.id;
        this.activePathId = prevLesson.pathId;
        this.selectedQuizOption = prevLesson.quiz.correctIndex;
        this.quizFeedback = null;
        this.playMokugyoTap();
        this.renderLectureStage();
      });

      document.getElementById('btn-lesson-choose-other')?.addEventListener('click', () => {
        this.lectureTab = 'package';
        this.renderLectureStage();
      });

      document.getElementById('btn-lesson-continue')?.addEventListener('click', () => {
        this.stopLectureSpeech();
        this.completedLessons.add(lesson.id);
        this.activityHub = recordDailyMissionMetric(this.activityHub, 'dailyLessons', 1);
        this.saveState();
        this.updateActionBadges();
        const nextLesson = LECTURE_LESSONS[(lessonIdx + 1) % LECTURE_LESSONS.length];
        this.activeLessonId = nextLesson.id;
        this.activePathId = nextLesson.pathId;
        this.selectedQuizOption = nextLesson.quiz.correctIndex;
        this.quizFeedback = null;
        this.playBellTone(288, 2.0);
        this.renderLectureStage();
      });
      return;
    }

    if (this.lectureTab === 'package') {
      const lessonsInPath = getLessonsByPath(this.activePathId);
      stage.innerHTML = `
        <div class="lesson-study-stack" style="max-width:860px;">
          <div class="lesson-cream-card lecture-translucent-card">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:8px;">
              <div style="font-size:22px;font-weight:800;color:#472915;">
                4 Chủ đề học Phật · 24 Bài đọc
              </div>
              <button id="btn-open-pdf-library-inline" class="product-detail-btn" style="width:auto;padding:0 16px;min-height:44px;font-size:14px;background:#8c4b1e;">
                Tủ sách Phật học (PDF)
              </button>
            </div>
            <p style="font-size:15px;color:#5b3a1d;margin-bottom:12px;line-height:1.45;">
              Đã hoàn thành: <strong>${this.completedLessons.size}/24 bài học</strong> — Biên soạn ngắn gọn, dễ hiểu cho cô bác Phật tử theo 10 quyển kinh sách.
            </p>
            <div class="lecture-paths-grid">
              ${LECTURE_PATHS.map(
                (p) => `
                <button class="path-tab-btn" data-path-id="${p.id}" style="min-height:54px;padding:11px;border-radius:16px;border:2px solid ${
                  this.activePathId === p.id ? '#5C381F' : 'rgba(130,90,50,0.25)'
                };background:${
                  this.activePathId === p.id ? '#5C381F' : '#fffdf8'
                };color:${
                  this.activePathId === p.id ? '#fff' : '#241409'
                };text-align:left;cursor:pointer;">
                  <div style="font-size:12.5px;font-weight:800;opacity:0.85;">${p.code}</div>
                  <div style="font-size:14.5px;font-weight:800;margin-top:3px;">${p.title}</div>
                </button>
              `
              ).join('')}
            </div>

            <div class="lecture-lessons-grid">
              ${lessonsInPath
                .map((l) => {
                  const done = this.completedLessons.has(l.id);
                  return `
                  <button class="select-lesson-card" data-lesson-id="${l.id}" style="min-height:56px;padding:12px 14px;border-radius:14px;border:1.5px solid ${
                    this.activeLessonId === l.id ? '#5C381F' : 'rgba(130,90,50,0.25)'
                  };background:#fffdf8;color:#241409;text-align:left;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:10px;">
                    <div>
                      <div style="font-size:12.5px;font-weight:800;color:#7a4e25;">Bài ${l.id} · ${l.sourceBook}</div>
                      <div style="font-size:15px;font-weight:800;margin-top:2px;">${l.title}</div>
                    </div>
                    <span style="padding:5px 11px;border-radius:999px;background:${
                      done ? '#F6E9D2' : '#f3e4cb'
                    };color:${done ? '#5C381F' : '#6b4522'};font-size:12.5px;font-weight:800;flex-shrink:0;">
                      ${done ? '✓ Đã học' : 'Học ngay'}
                    </span>
                  </button>
                `;
                })
                .join('')}
            </div>
          </div>
        </div>
      `;

      document.getElementById('btn-open-pdf-library-inline')?.addEventListener('click', () => {
        this.openTextbooksModal();
      });

      stage.querySelectorAll('.path-tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const pid = btn.getAttribute('data-path-id');
          if (pid) {
            this.activePathId = pid;
            this.renderLectureStage();
          }
        });
      });

      stage.querySelectorAll('.select-lesson-card').forEach((btn) => {
        btn.addEventListener('click', () => {
          const lid = btn.getAttribute('data-lesson-id');
          if (lid) {
            this.stopLectureSpeech();
            this.activeLessonId = lid;
            this.lectureTab = 'lesson';
            this.quizFeedback = null;
            this.renderLectureStage();
          }
        });
      });
    }
  }

  openTextbooksModal() {
    this.openModal(
      'Tủ sách Phật học (10 quyển PDF)',
      `
      <div style="display:flex;flex-direction:column;gap:10px;">
        <p style="font-size:14px;color:#4a2f18;">
          24 bài học trong Giảng đường được soạn theo 10 quyển sách Phật học dưới đây:
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          ${DHARMA_TEXTBOOKS.map(
            (b) => `
            <div style="background:#fffdf8;border:1.5px solid rgba(140,100,60,0.28);border-radius:14px;padding:12px 14px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
              <div>
                <div style="font-size:15px;font-weight:800;color:#472915;">${b.title}</div>
                <div style="font-size:12.5px;font-weight:700;color:#8c4b1e;margin-top:2px;">Tác giả / Dịch giả: ${b.author}</div>
                <p style="font-size:13px;color:#4a2f18;margin-top:5px;line-height:1.42;">${b.coreTeachings}</p>
              </div>
              <a href="${b.pdfPath}" target="_blank" download style="display:inline-flex;align-items:center;justify-content:center;height:36px;border-radius:999px;background:#5C381F;color:#fff;font-size:13px;font-weight:700;text-decoration:none;">
                Đọc sách (PDF)
              </a>
            </div>
          `
          ).join('')}
        </div>
      </div>
      `
    );
  }

  openAudioRecordingsModal() {
    this.openModal(
      'Thư viện bài thu âm Chùa Vĩnh Tràng',
      `
      <div style="display:flex;flex-direction:column;gap:10px;">
        <p style="font-size:14.5px;color:#4a2f18;">
          Chọn bài thu âm giới thiệu cảnh chùa hoặc lời giảng để lắng nghe:
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          ${AUDIO_LIBRARY.map(
            (track) => `
            <button class="audio-track-btn" data-file="${track.file}" style="padding:12px 16px;border-radius:14px;border:1.5px solid ${
              this.currentAudioFile === track.file && this.audioPlaying
                ? '#5C381F'
                : 'rgba(140,100,60,0.28)'
            };background:#fffdf8;color:#241409;text-align:left;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;">
              <div>
                <div style="font-weight:800;font-size:14.5px;">${track.title}</div>
                <div style="font-size:12.5px;color:#7a5229;margin-top:2px;">Thời lượng: ${track.duration}</div>
              </div>
              <span style="width:34px;height:34px;border-radius:50%;background:#5C381F;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;">▶</span>
            </button>
          `
          ).join('')}
        </div>
      </div>
      `
    );

    document.querySelectorAll('.audio-track-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const file = btn.getAttribute('data-file');
        if (file) {
          this.playVoiceAudio(file);
          this.closeModal();
          this.renderLectureStage();
          this.showToast('🎧 Đang phát bài thu âm', btn.textContent?.trim() || file, 3800);
        }
      });
    });
  }

  /* ========================================================================
     MILESTONE-UNLOCKED USER-PHOTO UPLOAD UGC CHECK-IN STUDIO
     ("Ảnh UGC chỉ chụp khi hoàn thành gì đó, người dùng đưa ảnh vào rồi hệ thống đẩy ảnh check-in với Chùa Vĩnh Tràng")
     ======================================================================== */
  openUGCStudioModal() {
    const milestoneStatus = checkUGCMilestoneUnlock(this.spiritual, this.completedLessons.size);
    let selectedCharMode = 'family_3'; // 'family_3' | 'nu' | 'nam' | 'tre_em'
    let selectedBackdropId = 'live_3d_view'; // 'live_3d_view' or any UGC_BACKDROPS.id
    let selectedPoseId = 'chap_tay_le_phat';

    const live3DSnapshot = this.world3d?.captureSnapshotDataURL?.() || null;

    this.openModal(
      'Ảnh kỷ niệm tại Chùa Vĩnh Tràng',
      `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div id="ugc-milestone-banner" style="padding:12px 16px;border-radius:16px;border:1.5px solid ${
          milestoneStatus.unlocked ? '#5C381F' : '#d97706'
        };background:${
          milestoneStatus.unlocked
            ? 'linear-gradient(90deg,#F6E9D2 0%,#FFF9EE 100%)'
            : 'linear-gradient(90deg,#fef3c7 0%,#fffbeb 100%)'
        };display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <div style="font-size:15px;font-weight:800;color:${
              milestoneStatus.unlocked ? '#472915' : '#92400e'
            };">
              ${
                milestoneStatus.unlocked
                  ? `Dấu ấn vừa hoàn thành: "${milestoneStatus.latestMilestone}"`
                  : 'Hãy lễ Phật, dâng hoa hoặc ghé thăm một góc chùa trước khi lưu ảnh kỷ niệm.'
              }
            </div>
            <div style="font-size:13px;color:#4a2f18;margin-top:2px;">
              Chọn ảnh của bạn hoặc gia đình bên phải để ghép cùng khung cảnh Chùa Vĩnh Tràng.
            </div>
          </div>
          ${
            !milestoneStatus.unlocked
              ? `
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button id="btn-ugc-quick-bow" class="product-detail-btn" style="width:auto;padding:0 14px;height:36px;font-size:12.5px;">Lễ Phật ngay</button>
              <button id="btn-ugc-quick-lotus" class="product-detail-btn" style="width:auto;padding:0 14px;height:36px;font-size:12.5px;background:#8c4b1e;">Dâng hoa sen</button>
            </div>
          `
              : `<span style="padding:5px 12px;border-radius:999px;background:#5C381F;color:#fff;font-size:12px;font-weight:700;">Sẵn sàng lưu ảnh</span>`
          }
        </div>

        <div style="display:grid;grid-template-columns:1.15fr 1fr;gap:18px;align-items:start;">
          <div>
            <div style="position:relative;">
              <canvas id="ugc-composite-canvas" width="760" height="500" style="width:100%;height:auto;border-radius:18px;border:2.5px solid #c8963e;box-shadow:0 12px 30px rgba(0,0,0,0.32);background:#2D1B10;"></canvas>
              <div id="ugc-output-status-badge" style="position:absolute;top:12px;right:12px;background:rgba(71,41,21,0.92);color:#fff;padding:5px 12px;border-radius:999px;font-size:12px;font-weight:700;border:1px solid #f6cd72;">
                ${
                  this.uploadedUserPhotoDataUrl
                    ? '✓ Đã ghép ảnh của bạn'
                    : 'Đang hiển thị khung cảnh chùa'
                }
              </div>
            </div>

            <div style="display:flex;gap:10px;margin-top:10px;">
              <button id="btn-ugc-download" class="product-detail-btn" style="flex:1;height:44px;font-size:14.5px;background:#5C381F;">
                Tải ảnh về máy (.PNG)
              </button>
              <button id="btn-ugc-publish" class="shop-cart-cta" style="flex:1;margin:0;height:44px;font-size:15px;">
                Lưu vào sổ kỷ niệm
              </button>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:10px;">
            <div class="ugc-upload-dropzone" id="ugc-upload-dropzone">
              <div style="font-size:14px;font-weight:800;color:#472915;">
                1. Chọn ảnh của bạn hoặc gia đình
              </div>
              <p style="font-size:12.5px;color:#3d2410;margin:4px 0 8px;">
                Chọn ảnh từ điện thoại hoặc máy tính để ghép vào khung cảnh Chùa Vĩnh Tràng:
              </p>
              <div style="display:flex;gap:8px;justify-content:center;align-items:center;flex-wrap:wrap;">
                <label for="ugc-user-photo-input" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:999px;background:#5C381F;color:#fff;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(92,56,31,0.3);">
                  Chọn ảnh từ máy
                </label>
                <input id="ugc-user-photo-input" type="file" accept="image/*" style="display:none;" />
                <button type="button" id="btn-ugc-sample-user-1" style="padding:7px 11px;border-radius:999px;border:1.5px solid #8c4b1e;background:#fffdf8;color:#5c3412;font-size:12px;font-weight:700;cursor:pointer;">
                  Ảnh mẫu Phật tử
                </button>
                <button type="button" id="btn-ugc-sample-user-2" style="padding:7px 11px;border-radius:999px;border:1.5px solid #8c4b1e;background:#fffdf8;color:#5c3412;font-size:12px;font-weight:700;cursor:pointer;">
                  Ảnh mẫu Gia đình
                </button>
              </div>
              <div id="ugc-upload-filename" style="margin-top:6px;font-size:12px;font-weight:700;color:#8C5327;">
                ${
                  this.uploadedUserPhotoDataUrl
                    ? '✓ Đã chọn ảnh để ghép'
                    : 'Chưa chọn ảnh riêng (đang dùng ảnh nhân vật đi chùa)'
                }
              </div>
            </div>

            <div>
              <div style="font-size:13.5px;font-weight:800;color:#472915;margin-bottom:5px;">
                2. Chọn góc cảnh chùa:
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                <button class="ugc-bg-btn" data-bg="live_3d_view" style="padding:8px 10px;border-radius:10px;border:1.5px solid #5C381F;background:#F6E9D2;font-size:12.5px;font-weight:700;text-align:left;cursor:pointer;">
                  Góc nhìn hiện tại
                </button>
                ${UGC_BACKDROPS.map(
                  (b) => `
                  <button class="ugc-bg-btn" data-bg="${b.id}" style="padding:8px 10px;border-radius:10px;border:1.5px solid rgba(130,90,50,0.28);background:#fffdf8;font-size:12.5px;font-weight:700;text-align:left;cursor:pointer;">
                    ${b.name}
                  </button>
                `
                ).join('')}
              </div>
            </div>

            <div>
              <div style="font-size:13.5px;font-weight:800;color:#472915;margin-bottom:5px;">
                3. Nhân vật đi cùng:
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                ${[
                  { id: 'family_3', label: 'Gia đình 3 người' },
                  { id: 'nu', label: 'Phật tử Nữ' },
                  { id: 'nam', label: 'Phật tử Nam' },
                  { id: 'tre_em', label: 'Em bé' }
                ]
                  .map(
                    (m, i) => `
                  <button class="ugc-char-btn" data-cmode="${m.id}" style="padding:7px 10px;border-radius:10px;border:1.5px solid ${
                      i === 0 ? '#5C381F' : 'rgba(130,90,50,0.28)'
                    };background:${i === 0 ? '#F6E9D2' : '#fffdf8'};font-size:12px;font-weight:700;text-align:left;cursor:pointer;">
                    ${m.label}
                  </button>
                `
                  )
                  .join('')}
              </div>
            </div>

            <div style="display:flex;gap:8px;">
              <input id="ugc-author-input" type="text" placeholder="Tên người đi chùa" value="Phật tử Tâm An" style="width:40%;padding:9px 11px;border-radius:10px;border:1px solid #bfa07a;font-size:13px;" />
              <input id="ugc-wish-input" type="text" placeholder="Lời chúc hoặc lời cầu nguyện..." value="Về thăm Chùa Vĩnh Tràng — Cầu mong gia đình bình an." style="flex:1;padding:9px 11px;border-radius:10px;border:1px solid #bfa07a;font-size:13px;" />
            </div>
          </div>
        </div>

        <div style="margin-top:8px;border-top:1.5px solid rgba(140,100,60,0.25);padding-top:12px;">
          <div style="font-size:15.5px;font-weight:800;color:#472915;margin-bottom:8px;">
            Sổ kỷ niệm đi chùa (${this.ugcGallery.length} bức ảnh)
          </div>
          <div id="ugc-gallery-feed" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;"></div>
        </div>
      </div>
      `
    );

    // Quick unlock ritual buttons if user opened modal before completing a milestone
    document.getElementById('btn-ugc-quick-bow')?.addEventListener('click', () => {
      const r = performSpiritualAction(this.spiritual, 'LE_PHAT');
      this.spiritual = r.state;
      this.saveState();
      this.updateActionBadges();
      this.world3d?.playPlayerBowAnimation();
      this.playBellTone(216, 2.5);
      this.openUGCStudioModal();
    });

    document.getElementById('btn-ugc-quick-lotus')?.addEventListener('click', () => {
      const r = performSpiritualAction(this.spiritual, 'DANG_HOA');
      this.spiritual = r.state;
      this.saveState();
      this.updateActionBadges();
      this.world3d?.placeLotusOfferingIn3D();
      this.playBellTone(324, 2.2);
      this.openUGCStudioModal();
    });

    const renderGalleryFeed = () => {
      const feed = document.getElementById('ugc-gallery-feed');
      if (!feed) return;
      feed.innerHTML = this.ugcGallery
        .slice(0, 6)
        .map(
          (post) => `
          <div style="background:#fffdf8;border:1px solid rgba(140,100,60,0.28);border-radius:14px;padding:10px 12px;display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
                <span style="font-size:13px;font-weight:800;color:#5C381F;">${post.author}</span>
                <span style="font-size:11px;font-weight:700;color:#8c4b1e;background:#fef3db;padding:2px 7px;border-radius:999px;">✓ ${
                  post.milestoneBadge || 'Lễ Phật'
                }</span>
              </div>
              <div style="font-size:11.5px;color:#8c4b1e;margin-top:2px;">${post.createdAt}</div>
              <p style="font-size:12.5px;color:#3d2410;margin-top:4px;line-height:1.4;">"${post.wishText}"</p>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
              <span style="font-size:11.5px;font-weight:700;color:#6b4522;">${
                post.userPhotoUploaded ? 'Ảnh chụp tại chùa' : 'Ảnh lưu niệm'
              }</span>
              <button class="ugc-like-btn" data-post-id="${post.id}" style="padding:3px 9px;border-radius:999px;border:1px solid #c8963e;background:#fef3db;color:#7a4414;font-size:11.5px;font-weight:800;cursor:pointer;">
                🙏 Tùy hỷ (${post.likes})
              </button>
            </div>
          </div>
        `
        )
        .join('');

      feed.querySelectorAll('.ugc-like-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const pid = btn.getAttribute('data-post-id');
          const found = this.ugcGallery.find((p) => p.id === pid);
          if (found) {
            found.likes += 1;
            this.saveState();
            this.playBellTone(360, 1.2);
            renderGalleryFeed();
          }
        });
      });
    };

    const drawComposite = () => {
      const canvas = document.getElementById('ugc-composite-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;

      const curMilestone = checkUGCMilestoneUnlock(this.spiritual, this.completedLessons.size);
      const backdropObj =
        UGC_BACKDROPS.find((b) => b.id === selectedBackdropId) || UGC_BACKDROPS[0];
      const poseObj = UGC_POSES.find((p) => p.id === selectedPoseId) || UGC_POSES[0];
      const authorText =
        document.getElementById('ugc-author-input')?.value || 'Phật tử Tâm An';
      const wishText =
        document.getElementById('ugc-wish-input')?.value ||
        'Kính lễ Phật tại Chùa Vĩnh Tràng';

      const bgSrc =
        selectedBackdropId === 'live_3d_view' && live3DSnapshot
          ? live3DSnapshot
          : backdropObj.src;

      const bgImg = new Image();
      bgImg.src = bgSrc;
      bgImg.onload = () => {
        ctx.clearRect(0, 0, w, h);
        // Draw temple background scene
        if (selectedBackdropId === 'live_3d_view' && live3DSnapshot) {
          ctx.drawImage(bgImg, 0, 0, w, h);
        } else {
          ctx.drawImage(bgImg, 0, 65, bgImg.width, bgImg.height * 0.62, 0, 0, w, h);
        }

        // Warm golden temple atmosphere vignette
        const grad = ctx.createLinearGradient(0, h * 0.48, 0, h);
        grad.addColorStop(0, 'rgba(36, 20, 9, 0)');
        grad.addColorStop(1, 'rgba(30, 16, 7, 0.94)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Draw Ornate Golden Border Around Check-in Postcard
        ctx.strokeStyle = 'rgba(236, 192, 91, 0.85)';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, w - 20, h - 20);

        // Top Golden Temple Stamp + Completed Milestone Badge
        ctx.fillStyle = 'rgba(71, 41, 21, 0.94)';
        ctx.strokeStyle = '#f3c65f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(22, 20, 495, 42, 21);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px "Be Vietnam Pro", sans-serif';
        ctx.fillText('🪷 CHÙA VĨNH TRÀNG · ẢNH KỶ NIỆM', 36, 46);

        // Milestone Achievement Ribbon under header
        const milestoneLabel = curMilestone.unlocked
          ? `✨ ${curMilestone.latestMilestone}`
          : 'Kỷ niệm về thăm Chùa Vĩnh Tràng';
        ctx.fillStyle = 'rgba(158, 56, 16, 0.92)';
        ctx.strokeStyle = '#fbe09c';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(22, 70, 380, 32, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fff7df';
        ctx.font = 'bold 13px "Be Vietnam Pro", sans-serif';
        ctx.fillText(milestoneLabel.slice(0, 48), 36, 91);

        // Foreground Portrait: User's Uploaded Photo (Primary) + 3D Companion Badge
        const primaryPortraitSrc =
          this.uploadedUserPhotoDataUrl ||
          (selectedCharMode === 'family_3'
            ? '/Thiết kế giao diện/Nhân vật 3D/anh-xem-truoc-3d-all-nguoi-that.png'
            : (
                CHARACTER_PROFILES.find((c) => c.key === selectedCharMode) ||
                CHARACTER_PROFILES[0]
              ).previewImg);

        const userImg = new Image();
        userImg.src = primaryPortraitSrc;
        userImg.onload = () => {
          // Large Golden Lotus Arch Portrait Frame on Right Foreground
          const pw = 230;
          const ph = 265;
          const px = w - pw - 28;
          const py = h - ph - 86;

          ctx.save();
          // Outer golden glow frame
          ctx.fillStyle = '#fff9ed';
          ctx.strokeStyle = '#e5b24c';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.roundRect(px - 6, py - 6, pw + 12, ph + 12, 24);
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.roundRect(px, py, pw, ph, 18);
          ctx.clip();

          // Aspect-fill user photo cleanly inside portrait frame
          const imgRatio = userImg.width / Math.max(1, userImg.height);
          const boxRatio = pw / ph;
          let sx = 0,
            sy = 0,
            sw = userImg.width,
            sh = userImg.height;
          if (imgRatio > boxRatio) {
            sw = userImg.height * boxRatio;
            sx = (userImg.width - sw) * 0.5;
          } else {
            sh = userImg.width / boxRatio;
            sy = (userImg.height - sh) * 0.2;
          }
          ctx.drawImage(userImg, sx, sy, sw, sh, px, py, pw, ph);
          ctx.restore();

          // Label badge below portrait frame ("Ảnh Check-in của bạn tại Chùa Vĩnh Tràng")
          ctx.fillStyle = '#5C381F';
          ctx.strokeStyle = '#f6cd72';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(px + 10, py + ph - 18, pw - 20, 28, 14);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            this.uploadedUserPhotoDataUrl
              ? 'Ảnh của bạn'
              : 'Chùa Vĩnh Tràng',
            px + pw / 2,
            py + ph
          );
          ctx.textAlign = 'left';

          // Bottom Calligraphy Blessing Banner
          ctx.fillStyle = '#f8d278';
          ctx.font = 'bold 17px "Be Vietnam Pro", sans-serif';
          ctx.fillText(`${authorText} · ${poseObj.label}`, 26, h - 52);

          ctx.fillStyle = '#fff9ee';
          ctx.font = '500 14.5px "Be Vietnam Pro", sans-serif';
          ctx.fillText(`"${wishText.slice(0, 74)}"`, 26, h - 26);
        };
      };
    };

    const handleUserImageDataUrl = (dataUrl, labelText) => {
      this.uploadedUserPhotoDataUrl = dataUrl;
      // Ensure at least 1 milestone is recorded when user uploads photo
      if (!checkUGCMilestoneUnlock(this.spiritual, this.completedLessons.size).unlocked) {
        this.spiritual = recordSpiritualMilestone(
          this.spiritual,
          'Lưu ảnh kỷ niệm tại Chùa Vĩnh Tràng'
        );
      }
      this.saveState();
      this.updateUGCMilestoneHUD();

      const statusBadge = document.getElementById('ugc-output-status-badge');
      if (statusBadge) {
        statusBadge.textContent = '✓ Đã ghép ảnh của bạn vào Chùa Vĩnh Tràng!';
        statusBadge.style.background = '#b84518';
      }
      const fnEl = document.getElementById('ugc-upload-filename');
      if (fnEl) {
        fnEl.textContent = `✓ Đã nhận ảnh: ${labelText} — Ảnh kỷ niệm đã được ghép bên trái.`;
      }
      this.playBellTone(324, 2.0);
      drawComposite();
      this.showToast(
        'Đã ghép ảnh kỷ niệm Chùa Vĩnh Tràng',
        'Ảnh của bạn đã được ghép vào khung cảnh Chùa Vĩnh Tràng.',
        4500
      );
    };

    // File input upload handler
    document.getElementById('ugc-user-photo-input')?.addEventListener('change', (e) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleUserImageDataUrl(reader.result, file.name);
        }
      };
      reader.readAsDataURL(file);
    });

    // Quick sample portrait buttons (for 1-click user testing)
    document.getElementById('btn-ugc-sample-user-1')?.addEventListener('click', () => {
      handleUserImageDataUrl(
        '/public/assets/aistudio/image_8f6004e3.png',
        'Ảnh chân dung Phật tử áo lam'
      );
    });

    document.getElementById('btn-ugc-sample-user-2')?.addEventListener('click', () => {
      handleUserImageDataUrl(
        '/Thiết kế giao diện/Nhân vật 3D/anh-xem-truoc-3d-all-nguoi-that.png',
        'Ảnh gia đình 3 người hành hương'
      );
    });

    drawComposite();
    renderGalleryFeed();

    document.querySelectorAll('.ugc-char-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedCharMode = btn.getAttribute('data-cmode') || 'family_3';
        document.querySelectorAll('.ugc-char-btn').forEach((b) => {
          const act = b.getAttribute('data-cmode') === selectedCharMode;
          b.style.background = act ? '#F6E9D2' : '#fffdf8';
          b.style.borderColor = act ? '#5C381F' : 'rgba(130,90,50,0.28)';
        });
        drawComposite();
      });
    });

    document.querySelectorAll('.ugc-bg-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedBackdropId = btn.getAttribute('data-bg') || 'live_3d_view';
        document.querySelectorAll('.ugc-bg-btn').forEach((b) => {
          const act = b.getAttribute('data-bg') === selectedBackdropId;
          b.style.background = act ? '#F6E9D2' : '#fffdf8';
          b.style.borderColor = act ? '#5C381F' : 'rgba(130,90,50,0.28)';
        });
        drawComposite();
      });
    });

    document.getElementById('ugc-author-input')?.addEventListener('input', drawComposite);
    document.getElementById('ugc-wish-input')?.addEventListener('input', drawComposite);

    document.getElementById('btn-ugc-download')?.addEventListener('click', () => {
      const canvas = document.getElementById('ugc-composite-canvas');
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `checkin-chua-vinh-trang-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      this.showToast(
        'Đã tải ảnh kỷ niệm Chùa Vĩnh Tràng',
        'Ảnh kỷ niệm của bạn đã được lưu về máy.',
        3600
      );
    });

    document.getElementById('btn-ugc-publish')?.addEventListener('click', () => {
      const curM = checkUGCMilestoneUnlock(this.spiritual, this.completedLessons.size);
      const post = createUGCPost({
        author: document.getElementById('ugc-author-input')?.value,
        charMode: selectedCharMode,
        backdropId: selectedBackdropId,
        poseId: selectedPoseId,
        milestoneBadge: curM.latestMilestone || 'Lễ Phật Tam Bái',
        userPhotoUploaded: Boolean(this.uploadedUserPhotoDataUrl),
        wishText: document.getElementById('ugc-wish-input')?.value
      });
      this.ugcGallery.unshift(post);
      this.saveState();
      this.playBellTone(324, 2.0);
      renderGalleryFeed();
      this.showToast(
        'Đã lưu vào sổ kỷ niệm Chùa Vĩnh Tràng',
        `Cảm ơn ${post.author} đã chia sẻ bức ảnh kỷ niệm.`,
        4200
      );
    });
  }

  /* ========================================================================
     KHÁM PHÁ MODAL (Bản đồ · Nhiệm vụ · Mua đồ & Lễ vật · Dấu Ấn · 18 La Hán · Quét lá)
     ======================================================================== */
  executeQuestActionHint(actionHint) {
    this.closeModal();
    if (actionHint === 'checkin') {
      this.openActivityHubModal('checkin');
    } else if (actionHint === 'le_phat') {
      this.switchScreen('courtyard');
      this.triggerLePhat();
    } else if (actionHint === 'dang_huong') {
      this.switchScreen('courtyard');
      this.triggerDangHuong();
    } else if (actionHint === 'dang_hoa') {
      this.switchScreen('courtyard');
      this.triggerDangHoa();
    } else if (actionHint === 'niem_phat') {
      this.switchScreen('courtyard');
      this.triggerNiemPhat();
    } else if (actionHint === 'dharma_quote') {
      this.showDailyDharmaModal({ markSeenToday: false });
    } else if (actionHint === 'share') {
      this.openActivityHubModal('share_feedback');
    } else if (actionHint === 'explore') {
      this.openExploreModal('stations');
    } else if (actionHint === 'lecture') {
      this.switchScreen('lecture');
    }
  }

  activateGuidedBeacon(stationKey) {
    if (!stationKey) {
      this.activeGuidedBeacon = null;
      this.world3d?.setGuidedBeacon?.(null);
      return;
    }
    const dest = findAnyTempleDestination(stationKey);
    this.activeGuidedBeacon = stationKey;
    this.world3d?.setGuidedBeacon?.(stationKey);
    this.closeModal();
    this.switchScreen('courtyard');
    if (this.world3d?.insideInterior) {
      this.toggleInteriorHallIn3D(false);
    }
    this.showToast(
      `🧭 Đang bật cột sáng dẫn đường tới ${dest?.name || 'điểm hành hương'}`,
      'Nhìn theo tia sáng vàng trên bầu trời 3D để đi tới tận nơi!',
      4200,
      false
    );
  }

  openExploreModal(initialSubTab = 'stations', initialArhatIdx = 0) {
    const imprint = calculateJourneyImprint(this.spiritual);
    let currentSub = initialSubTab;
    let shopCatFilter = this.marketStallTab || 'huong_hoa';
    let selectedArhatIdx = Math.max(0, Math.min(17, Number(initialArhatIdx || 0)));

    this.openModal(
      `Khám phá Chùa Vĩnh Tràng (${imprint.litCount}/9 nơi đã ghé)`,
      `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div class="explore-tabs-bar">
          <button class="explore-sub-btn product-detail-btn" data-sub="stations">🗺️ Bản đồ</button>
          <button class="explore-sub-btn product-detail-btn" data-sub="quests">🎯 Nhiệm vụ</button>
          <button class="explore-sub-btn product-detail-btn" data-sub="shop_offerings">🛍️ Mua đồ &amp; Lễ vật</button>
          <button class="explore-sub-btn product-detail-btn" data-sub="imprint">🪷 Dấu ấn (${imprint.litCount}/9)</button>
          <button class="explore-sub-btn product-detail-btn" data-sub="arhats">🙏 18 vị La Hán</button>
          <button class="explore-sub-btn product-detail-btn" data-sub="sweep">🧹 Quét lá</button>
          <button id="btn-explore-open-interior" class="product-detail-btn" style="background:#784820;">🏛️ Vào Chánh điện</button>
          <button id="btn-explore-open-ugc" class="product-detail-btn" style="background:#C96F4A;">📸 Lưu ảnh</button>
        </div>

        <div id="explore-sub-content"></div>
      </div>
      `
    );

    const renderSub = (sub) => {
      currentSub = sub;
      if (sub !== 'arhats' && this._arhatStageDispose) {
        try {
          this._arhatStageDispose();
        } catch {}
        this._arhatStageDispose = null;
      }
      document.querySelectorAll('.explore-sub-btn').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-sub') === sub);
      });
      const box = document.getElementById('explore-sub-content');
      if (!box) return;

      if (sub === 'stations') {
        const curX = this.world3d ? this.world3d.playerPos.x : this.playerPos.x;
        const curZ = this.world3d ? this.world3d.playerPos.z : this.playerPos.z;
        const mapX = (x) => Math.round(((x + 68) / 136) * 680 + 40);
        const mapY = (z) => Math.round(((z + 72) / 130) * 280 + 25);
        const px = mapX(curX);
        const py = mapY(curZ);
        const axisX = mapX(23);

        box.innerHTML = `
          <div style="background:#f6ebd6;border:2px solid #C9962E;border-radius:18px;padding:12px 14px;margin-bottom:12px;box-shadow:inset 0 2px 10px rgba(74,50,34,0.1);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px;">
              <div>
                <strong style="font-size:15px;color:#5C381F;">Mặt bằng Tổng thể Chùa Vĩnh Tràng (Bám sát thực tế 136m × 114m)</strong>
                <span style="font-size:12px;color:#6E5034;margin-left:8px;">Bấm vào điểm bất kỳ để nhân vật hành hương tới</span>
              </div>
              <div style="font-size:12px;font-weight:700;color:#B84518;background:#fffdf8;padding:4px 10px;border-radius:999px;border:1px solid #C9962E;">
                ● Vị trí hiện tại
              </div>
            </div>

            <svg viewBox="0 0 760 340" style="width:100%;height:265px;background:linear-gradient(in oklab 180deg,#d8ebd1 0%,#eee2c7 55%,#e4d3b0 100%);border-radius:14px;border:1.5px solid rgba(120,85,45,0.35);display:block;">
              <!-- Outer Pilgrimage Street Market Corridor -->
              <rect x="26" y="${mapY(46)}" width="708" height="44" rx="6" fill="#cfc3ad" stroke="#a6957c" stroke-width="1"/>
              <text x="380" y="${mapY(55) + 4}" text-anchor="middle" fill="#4A3222" font-size="9.5" font-weight="800">ĐƯỜNG NGUYỄN TRUNG TRỰC · PHỐ HÀNG QUÁN HÀNH HƯƠNG</text>

              <!-- Expanded Pagoda Perimeter Wall -->
              <rect x="${mapX(-68)}" y="${mapY(-72)}" width="${mapX(68) - mapX(-68)}" height="${mapY(41.5) - mapY(-72)}" rx="10" fill="rgba(255,250,238,0.52)" stroke="#9A7241" stroke-width="2.5"/>

              <!-- Axis Road & Garden Walkways -->
              <rect x="${axisX - 24}" y="${mapY(8)}" width="48" height="${mapY(41.5) - mapY(8)}" rx="6" fill="#d8ccb8" stroke="#b5a48b" stroke-width="1"/>
              <path d="M ${mapX(-44)} ${mapY(29)} L ${mapX(-24.5)} ${mapY(29)} M ${mapX(-44)} ${mapY(29)} L ${mapX(-44)} ${mapY(-45.5)} L ${mapX(46)} ${mapY(-45.5)} M ${mapX(40.5)} ${mapY(41.5)} L ${mapX(40.5)} ${mapY(20)} L ${mapX(51.5)} ${mapY(14)} L ${mapX(51.5)} ${mapY(-45)}" stroke="#d8ccb8" stroke-width="9" fill="none" stroke-linecap="round"/>

              <!-- Back North Wing -->
              <ellipse cx="${mapX(-16)}" cy="${mapY(-56)}" rx="48" ry="18" fill="#2F6F64" stroke="#85C7B8" stroke-width="1.8"/>
              <text x="${mapX(-16)}" y="${mapY(-56) + 3}" text-anchor="middle" fill="#FFF6E5" font-size="8.8" font-weight="800">Hồ Phóng Sinh</text>

              <rect x="${mapX(-44) - 32}" y="${mapY(-56) - 13}" width="64" height="26" rx="7" fill="#7E2A22" stroke="#FFD875" stroke-width="1.6"/>
              <text x="${mapX(-44)}" y="${mapY(-56) + 3}" text-anchor="middle" fill="#FFD875" font-size="8.2" font-weight="800">Lầu Chuông</text>

              <rect x="${mapX(22) - 44}" y="${mapY(-58) - 14}" width="88" height="28" rx="7" fill="#9E4B2E" stroke="#FFD875" stroke-width="1.8"/>
              <text x="${mapX(22)}" y="${mapY(-58) + 4}" text-anchor="middle" fill="#FFF6E5" font-size="9" font-weight="800">Tổ Đường</text>

              <rect x="${mapX(46) - 32}" y="${mapY(-56) - 13}" width="64" height="26" rx="7" fill="#7E2A22" stroke="#FFD875" stroke-width="1.6"/>
              <text x="${mapX(46)}" y="${mapY(-56) + 3}" text-anchor="middle" fill="#FFD875" font-size="8.2" font-weight="800">Lầu Trống</text>

              <!-- North Central Statues: Phật Niết Bàn + Bảo Tháp 7 tầng + A Di Đà -->
              <rect x="${mapX(12) - 54}" y="${mapY(-38) - 14}" width="108" height="28" rx="8" fill="#f7efe0" stroke="#C9962E" stroke-width="1.8"/>
              <text x="${mapX(12)}" y="${mapY(-38) + 4}" text-anchor="middle" fill="#4A3222" font-size="9.2" font-weight="800">Phật Niết Bàn 32m</text>

              <circle cx="${mapX(-8)}" cy="${mapY(-37)}" r="15" fill="#e6b84c" stroke="#7E2A22" stroke-width="1.8"/>
              <text x="${mapX(-8)}" y="${mapY(-37) + 3}" text-anchor="middle" fill="#241409" font-size="8" font-weight="800">Bảo Tháp</text>

              <circle cx="${mapX(-8)}" cy="${mapY(-25)}" r="18" fill="#fffdf8" stroke="#4E86A8" stroke-width="2"/>
              <text x="${mapX(-8)}" y="${mapY(-25) + 3}" text-anchor="middle" fill="#5C381F" font-size="8" font-weight="900">A Di Đà</text>

              <!-- West Discovery Wing -->
              <circle cx="${mapX(-54)}" cy="${mapY(-4)}" r="21" fill="#d9c6a3" stroke="#5C381F" stroke-width="1.8"/>
              <text x="${mapX(-54)}" y="${mapY(-4) + 3}" text-anchor="middle" fill="#5C381F" font-size="8.2" font-weight="800">Hòn Non Bộ</text>
              <rect x="${mapX(-53.5) - 42}" y="${mapY(22) - 14}" width="84" height="28" rx="8" fill="#F6E9D2" stroke="#5C381F" stroke-width="1.8"/>
              <text x="${mapX(-53.5)}" y="${mapY(22) + 4}" text-anchor="middle" fill="#5C381F" font-size="8.5" font-weight="800">Vườn Lâm Tỳ Ni</text>

              <!-- Core Main Temple Area (Chùa Chính Chữ Quốc Complex x=10..36, z=-31..8) -->
              <rect x="${axisX - 58}" y="${mapY(-31)}" width="116" height="${mapY(8) - mapY(-31)}" rx="8" fill="#D9A441" stroke="#7E2A22" stroke-width="2.5"/>
              <rect x="${axisX - 24}" y="${mapY(-24)}" width="48" height="20" rx="5" fill="#4BA3B5" stroke="#FFF6E5" stroke-width="1.2"/>
              <text x="${axisX}" y="${mapY(-20)}" text-anchor="middle" fill="#FFF6E5" font-size="7" font-weight="800">2 Thiên Tỉnh</text>
              <text x="${axisX}" y="${mapY(1.5)}" text-anchor="middle" fill="#241409" font-size="9.5" font-weight="900">CHÙA CHÍNH (國)</text>
              <text x="${axisX}" y="${mapY(-26)}" text-anchor="middle" fill="#241409" font-size="7.5" font-weight="800">Nhà Tổ · Nhà Hậu</text>

              <!-- West Plaza: Phật Di Lặc -->
              <circle cx="${mapX(-24.5)}" cy="${mapY(4)}" r="21" fill="#fffdf8" stroke="#5C381F" stroke-width="2"/>
              <text x="${mapX(-24.5)}" y="${mapY(4) + 3}" text-anchor="middle" fill="#5C381F" font-size="8.5" font-weight="800">Phật Di Lặc</text>

              <!-- East Wing -->
              <rect x="${mapX(44) - 36}" y="${mapY(-18) - 14}" width="72" height="28" rx="7" fill="#8A4A34" stroke="#f6cd72" stroke-width="1.8"/>
              <text x="${mapX(44)}" y="${mapY(-18) + 4}" text-anchor="middle" fill="#FFF6E5" font-size="8.6" font-weight="800">Giảng Đường</text>
              <rect x="${mapX(58) - 36}" y="${mapY(-12) - 13}" width="72" height="26" rx="7" fill="#3D6B4A" stroke="#FFD875" stroke-width="1.8"/>
              <text x="${mapX(58)}" y="${mapY(-12) + 3}" text-anchor="middle" fill="#FFF6E5" font-size="8.2" font-weight="800">Lầu Trà Thiền</text>
              <rect x="${mapX(59.5) - 38}" y="${mapY(14.5) - 13}" width="76" height="26" rx="7" fill="#7A4924" stroke="#FFD875" stroke-width="1.8"/>
              <text x="${mapX(59.5)}" y="${mapY(14.5) + 3}" text-anchor="middle" fill="#FFF6E5" font-size="8.2" font-weight="800">Nhà Sàn Ăn</text>
              <rect x="${mapX(48.6) - 34}" y="${mapY(36) - 12}" width="68" height="24" rx="6" fill="#C96F4A" stroke="#fff" stroke-width="1.5"/>
              <text x="${mapX(48.6)}" y="${mapY(36) + 3}" text-anchor="middle" fill="#FFF6E5" font-size="8.2" font-weight="800">Tạp Hóa</text>

              <!-- Front Lotus Pond & Gates -->
              <ellipse cx="${mapX(3.5)}" cy="${mapY(33)}" rx="36" ry="16" fill="#3B6E5C" stroke="#8fc9b3" stroke-width="1.6"/>
              <text x="${mapX(3.5)}" y="${mapY(33) + 3}" text-anchor="middle" fill="#FFF6E5" font-size="8.5" font-weight="800">Hồ Sen Koi</text>

              <rect x="${axisX - 50}" y="${mapY(41.5) - 10}" width="100" height="20" rx="5" fill="#7E2A22" stroke="#FFD875" stroke-width="1.8"/>
              <text x="${axisX}" y="${mapY(41.5) + 4}" text-anchor="middle" fill="#FFD875" font-size="8.4" font-weight="800">TAM QUAN</text>
              <rect x="${mapX(40.5) - 32}" y="${mapY(41.5) - 10}" width="64" height="20" rx="5" fill="#5C381F" stroke="#FFD875" stroke-width="1.6"/>
              <text x="${mapX(40.5)}" y="${mapY(41.5) + 4}" text-anchor="middle" fill="#FFF6E5" font-size="8.2" font-weight="800">CỔNG PHỤ</text>

              ${PILGRIMAGE_STATIONS.map((st) => {
                const pinShift = {
                  cong_tam_quan: { dx: 0, dy: -13 },
                  ho_sen_ca_koi: { dx: 0, dy: -16 },
                  phat_adida: { dx: -20, dy: 0 },
                  phat_di_lac: { dx: 0, dy: -18 },
                  lu_huong_san: { dx: 0, dy: -4 },
                  chanh_dien: { dx: 44, dy: -14 },
                  cua_hang_luu_niem: { dx: -24, dy: -12 },
                  giang_duong: { dx: -24, dy: -14 },
                  phat_niet_ban: { dx: 36, dy: -14 }
                }[st.key] || { dx: 0, dy: -14 };
                const sx = mapX(st.pos.x) + pinShift.dx;
                const sy = mapY(st.pos.z) + pinShift.dy;
                const isAct = this.activeStationKey === st.key;
                return `
                  <g class="map2d-station-pin" data-station-key="${st.key}" style="cursor:pointer;">
                    <circle cx="${sx}" cy="${sy}" r="${isAct ? 9.5 : 7.5}" fill="${isAct ? '#C96F4A' : '#5C381F'}" stroke="#FFF6E5" stroke-width="2"/>
                    <text x="${sx}" y="${sy + 2.8}" text-anchor="middle" fill="#FFF6E5" font-size="8" font-weight="900">${st.id + 1}</text>
                  </g>
                `;
              }).join('')}

              ${DISCOVERY_ZONES.map((dz, idx) => {
                const dzShift = {
                  vuon_lam_ty_ni: { dx: 28, dy: -14 },
                  non_bo_quan_am: { dx: 24, dy: -14 },
                  vuon_la_han_ngoai: { dx: 18, dy: -12 },
                  ho_phong_sinh: { dx: 0, dy: -16 },
                  thap_chuong_dai_hong: { dx: 24, dy: -12 },
                  hau_to_nha_to: { dx: 32, dy: -14 },
                  lau_tra_thien: { dx: -22, dy: -14 },
                  nha_san_trai_duong: { dx: -24, dy: -14 },
                  bao_thap_that_phat: { dx: -22, dy: -12 }
                }[dz.key] || { dx: 0, dy: -14 };
                const sx = mapX(dz.pos.x) + dzShift.dx;
                const sy = mapY(dz.pos.z) + dzShift.dy;
                const isAct = this.activeStationKey === dz.key;
                return `
                  <g class="map2d-station-pin" data-station-key="${dz.key}" style="cursor:pointer;">
                    <circle cx="${sx}" cy="${sy}" r="${isAct ? 9.5 : 7.5}" fill="${isAct ? '#B84518' : '#7E2A22'}" stroke="#FFD875" stroke-width="2"/>
                    <text x="${sx}" y="${sy + 2.8}" text-anchor="middle" fill="#FFF6E5" font-size="7.8" font-weight="900">${String.fromCharCode(65 + idx)}</text>
                  </g>
                `;
              }).join('')}

              <g transform="translate(${px}, ${py})">
                <circle r="12" fill="rgba(255, 196, 46, 0.42)"/>
                <circle r="6.5" fill="#FFD875" stroke="#7E2A22" stroke-width="2.5"/>
              </g>
            </svg>
          </div>

          <div style="font-size:14.5px;font-weight:800;color:#5C381F;margin-bottom:6px;">9 Điểm Hành Hương Chính (Dấu Ấn Sen Vàng)</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;">
            ${PILGRIMAGE_STATIONS.map((st) => {
              const visited = this.spiritual.visitedStations.includes(st.id);
              return `
              <div style="background:#fffdf8;border:1.5px solid ${
                visited ? '#5C381F' : 'rgba(140,100,60,0.28)'
              };border-radius:16px;padding:12px 14px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11.5px;font-weight:700;color:#5C381F;">${st.zoneCode}</span>
                    <span style="font-size:11px;font-weight:700;color:${visited ? '#8C5327' : '#8a623c'};">${
                      visited ? 'Đã ghé' : 'Chưa ghé'
                    }</span>
                  </div>
                  <div style="font-size:15px;font-weight:800;margin-top:3px;">${st.name}</div>
                  <p style="font-size:12.5px;color:#52361c;margin-top:4px;line-height:1.4;">${st.subtitle}</p>
                </div>
                <div style="display:flex;gap:5px;flex-wrap:wrap;">
                  <button class="visit-station-btn product-detail-btn" data-station-key="${st.key}" style="flex:1;height:34px;font-size:12px;">
                    Đi tới
                  </button>
                  <button class="teleport-station-btn product-detail-btn" data-station-key="${st.key}" style="width:auto;padding:0 10px;height:34px;font-size:12px;background:#C96F4A;">
                    Tới thẳng
                  </button>
                  <button class="guide-station-btn product-detail-btn" data-guide-station="${st.key}" style="width:auto;padding:0 9px;height:34px;font-size:12px;background:#9A6E1C;" title="Bật tia sáng dẫn đường 3D">
                    🧭 Dẫn đường
                  </button>
                </div>
              </div>
            `;
            }).join('')}
          </div>

          <div style="font-size:14.5px;font-weight:800;color:#7E2A22;margin-bottom:6px;">${DISCOVERY_ZONES.length} Khu Cảnh Quan Mở Rộng Khám Phá</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
            ${DISCOVERY_ZONES.map((dz, idx) => `
              <div style="background:#fffbf2;border:1.5px solid rgba(190,136,52,0.42);border-radius:16px;padding:12px 14px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11.5px;font-weight:800;color:#7E2A22;">${dz.zoneCode} · Khu ${String.fromCharCode(65 + idx)}</span>
                    <span style="font-size:11px;font-weight:700;color:#8C5327;">Mở rộng</span>
                  </div>
                  <div style="font-size:14.5px;font-weight:800;margin-top:3px;color:#241409;">${dz.name}</div>
                  <p style="font-size:12px;color:#52361c;margin-top:4px;line-height:1.4;">${dz.subtitle}</p>
                </div>
                <div style="display:flex;gap:5px;flex-wrap:wrap;">
                  <button class="visit-station-btn product-detail-btn" data-station-key="${dz.key}" style="flex:1;height:34px;font-size:12px;">
                    Đi tới
                  </button>
                  <button class="teleport-station-btn product-detail-btn" data-station-key="${dz.key}" style="width:auto;padding:0 10px;height:34px;font-size:12px;background:#7E2A22;">
                    Tới thẳng
                  </button>
                  <button class="guide-station-btn product-detail-btn" data-guide-station="${dz.key}" style="width:auto;padding:0 9px;height:34px;font-size:12px;background:#9A6E1C;" title="Bật tia sáng dẫn đường 3D">
                    🧭 Dẫn đường
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        box.querySelectorAll('.visit-station-btn, .map2d-station-pin').forEach((b) => {
          b.addEventListener('click', () => {
            const key = b.getAttribute('data-station-key') || 'chanh_dien';
            this.closeModal();
            this.switchScreen('courtyard');
            this.walkToStationIn3D(key);
          });
        });
        box.querySelectorAll('.teleport-station-btn').forEach((b) => {
          b.addEventListener('click', () => {
            const key = b.getAttribute('data-station-key') || 'chanh_dien';
            this.closeModal();
            this.switchScreen('courtyard');
            this.teleportToStationIn3D(key);
          });
        });
        box.querySelectorAll('.guide-station-btn').forEach((b) => {
          b.addEventListener('click', () => {
            const key = b.getAttribute('data-guide-station') || 'chanh_dien';
            this.activateGuidedBeacon(key);
          });
        });
      } else if (sub === 'quests') {
        const quests = getQuestsWithProgress(this.activityHub, this.spiritual, this.completedLessons.size);
        box.innerHTML = `
          <div class="activity-banner-row">
            <div>
              <div style="font-size:16px;font-weight:800;color:#FFD875;">🎯 Nhiệm vụ Hành hương &amp; Công đức</div>
              <div style="font-size:13px;color:#FFF6E5;margin-top:2px;">Hoàn thành mỗi việc lành nhận thêm điểm Sen 🪷 và Ngọc 💎 để thỉnh lễ vật, áo tràng.</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <span class="store-wallet-pill">🪷 ${this.storeProfile.lotusPoints}</span>
              <span class="store-wallet-pill">💎 ${this.storeProfile.gems}</span>
            </div>
          </div>
          <div class="quests-grid">
            ${quests.map((q) => {
              const pct = Math.min(100, Math.round((q.current / q.target) * 100));
              return `
              <div class="quest-card ${q.claimed ? 'claimed' : q.claimable ? 'claimable' : ''}">
                <div class="quest-card-head">
                  <span class="quest-cat-pill">${q.icon} ${q.category}</span>
                  <span class="quest-reward-text">+${q.rewardLotus} 🪷 · +${q.rewardGems} 💎</span>
                </div>
                <div class="quest-card-title">${q.title}</div>
                <div class="quest-card-desc">${q.desc}</div>
                <div class="quest-progress-track">
                  <div class="quest-progress-fill" style="width:${pct}%"></div>
                </div>
                <div class="quest-card-foot">
                  <span class="quest-progress-lbl">Tiến độ: ${q.current}/${q.target}</span>
                  ${
                    q.claimed
                      ? `<span class="quest-done-tag">✓ Đã nhận thưởng</span>`
                      : q.claimable
                      ? `<button type="button" class="quest-claim-btn" data-explore-claim-quest="${q.id}">🎁 Nhận thưởng</button>`
                      : `<button type="button" class="quest-go-btn" data-explore-go-quest="${q.actionHint}">Làm ngay →</button>`
                  }
                </div>
              </div>`;
            }).join('')}
          </div>
        `;
        box.querySelectorAll('[data-explore-claim-quest]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const qid = btn.getAttribute('data-explore-claim-quest');
            const res = claimQuestReward(
              this.activityHub,
              this.storeProfile,
              this.spiritual,
              this.completedLessons.size,
              qid
            );
            this.activityHub = res.activity;
            this.storeProfile = res.storeProfile;
            this.saveState();
            this.updateActionBadges();
            if (res.ok) {
              this.playBellTone(324, 2.0);
              this.showToast('🎁 Nhận thưởng nhiệm vụ', res.message, 3600, false);
            }
            renderSub('quests');
          });
        });
        box.querySelectorAll('[data-explore-go-quest]').forEach((btn) => {
          btn.addEventListener('click', () => {
            this.executeQuestActionHint(btn.getAttribute('data-explore-go-quest'));
          });
        });
      } else if (sub === 'shop_offerings') {
        const items = filterMarketplaceItems(shopCatFilter);
        box.innerHTML = `
          <div class="activity-banner-row">
            <div>
              <div style="font-size:16px;font-weight:800;color:#FFD875;">🛍️ Mua Đồ Chay · Nhang Đèn · Lễ Vật Dâng Phật</div>
              <div style="font-size:13px;color:#FFF6E5;margin-top:2px;">Dùng điểm Sen 🪷 để thỉnh lễ vật dâng cúng ngay hoặc thêm vào giỏ quà lưu niệm.</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <span class="store-wallet-pill">🪷 ${this.storeProfile.lotusPoints}</span>
              <button type="button" id="btn-explore-open-9tab-store" class="quest-claim-btn" style="background:#C96F4A;">Tủ đồ Áo tràng 3D</button>
            </div>
          </div>
          <div class="market-tabs-row">
            ${MARKETPLACE_STALL_CATEGORIES.map((cat) => `
              <button type="button" class="market-tab-pill ${shopCatFilter === cat.id ? 'active' : ''}" data-explore-shop-cat="${cat.id}">
                <span>${cat.icon}</span><span>${cat.label}</span>
              </button>
            `).join('')}
          </div>
          <div class="market-items-grid" style="max-height:46vh;overflow-y:auto;padding-right:4px;">
            ${items.map((item) => `
              <article class="market-item-card">
                <div class="market-item-top">
                  <div class="market-item-icon">
                    ${
                      item.image
                        ? `<img src="${item.image}" alt="${item.name}" class="market-item-thumb-img" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline';" /><span style="display:none;">${item.icon}</span>`
                        : `<span>${item.icon}</span>`
                    }
                  </div>
                  <div style="flex:1;min-width:0;">
                    <div class="market-item-title">${item.name}</div>
                    <div class="market-item-prices">
                      <span class="market-price-vnd">${item.priceVnd.toLocaleString('vi-VN')}đ</span>
                      <span class="market-price-lotus">🪷 ${item.lotusCost}</span>
                    </div>
                  </div>
                </div>
                <p class="market-item-desc">${item.desc}</p>
                <div class="market-item-actions">
                  <button type="button" class="market-btn-use" data-explore-use="${item.id}">Thỉnh dâng ngay</button>
                  <button type="button" class="market-btn-cart" data-explore-cart="${item.id}">+ Giỏ hàng</button>
                </div>
              </article>
            `).join('')}
          </div>
        `;
        document.getElementById('btn-explore-open-9tab-store')?.addEventListener('click', () => {
          this.openNineTabStoreModal('ao_trang');
        });
        box.querySelectorAll('[data-explore-shop-cat]').forEach((btn) => {
          btn.addEventListener('click', () => {
            shopCatFilter = btn.getAttribute('data-explore-shop-cat') || 'huong_hoa';
            renderSub('shop_offerings');
          });
        });
        box.querySelectorAll('[data-explore-use]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-explore-use');
            const res = purchaseMarketplaceItem(this.storeProfile, this.spiritual, this.cart, id, 'use_now');
            if (!res.ok) {
              this.showToast('Chưa đủ điểm Sen', res.message, 3200);
              return;
            }
            this.storeProfile = res.storeProfile;
            this.spiritual = res.spiritual;
            this.cart = res.cart;
            this.saveState();
            this.updateActionBadges();
            this.playBellTone(324, 1.8);
            this.showToast('🪷 Đã thỉnh lễ vật', res.message, 3600, false);
            renderSub('shop_offerings');
          });
        });
        box.querySelectorAll('[data-explore-cart]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-explore-cart');
            const res = purchaseMarketplaceItem(this.storeProfile, this.spiritual, this.cart, id, 'cart');
            if (res.ok) {
              this.cart = res.cart;
              this.saveState();
              this.updateActionBadges();
              this.playMokugyoTap();
              this.showToast('🛒 Đã thêm vào giỏ quà', res.message, 2800, false);
            }
          });
        });
      } else if (sub === 'imprint') {
        const curImprint = calculateJourneyImprint(this.spiritual);
        box.innerHTML = `
          <div style="background:#5C381F;color:#FFF6E5;padding:16px 20px;border-radius:18px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;">
            <div>
              <div style="font-size:18px;font-weight:800;color:#FFD875;">Những nơi đã ghé thăm</div>
              <div style="font-size:13.5px;opacity:0.92;margin-top:3px;">Mỗi cánh sen sáng lên khi bạn dạo bước ghé thăm một góc trong khuôn viên Chùa Vĩnh Tràng.</div>
            </div>
            <div style="display:flex;gap:6px;align-items:center;">
              ${curImprint.petals
                .map(
                  (p) =>
                    `<span title="${p.name}" style="font-size:22px;filter:${
                      p.lit ? 'none' : 'grayscale(1) opacity(0.38)'
                    };">🪷</span>`
                )
                .join('')}
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
            ${curImprint.petals
              .map(
                (p) => `
              <div style="background:#fffdf8;border:1.5px solid ${
                p.lit ? '#C9962E' : 'rgba(140,100,60,0.25)'
              };border-radius:14px;padding:12px 14px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <strong style="font-size:14px;color:#5C381F;">${p.pinLabel}</strong>
                  <span style="font-size:12px;font-weight:800;color:${p.lit ? '#C9962E' : '#8a623c'};">
                    ${p.lit ? '🪷 Đã ghé thăm' : '○ Chưa ghé'}
                  </span>
                </div>
                <p style="font-size:12.5px;color:#4A3222;margin-top:5px;line-height:1.4;">${p.subtitle}</p>
              </div>
            `
              )
              .join('')}
          </div>
        `;
      } else if (sub === 'arhats') {
        const renderArhatMuseum = () => {
          const a = EIGHTEEN_ARHATS[selectedArhatIdx] || EIGHTEEN_ARHATS[0];
          box.innerHTML = `
            <div class="arhat-museum-layout">
              <div class="arhat-stage-panel">
                <div class="arhat-3d-viewport">
                  <canvas id="arhat-3d-canvas"></canvas>
                  <span class="profile-stage-hint">Kéo để xoay 360°</span>
                  <span class="arhat-idx-chip">Tôn tượng ${a.id}/18</span>
                </div>
                <button type="button" id="btn-arhat-goto-hall" class="product-detail-btn" style="width:100%;height:44px;background:#7E2A22;">
                  🏛️ Tới tượng trong Chánh điện
                </button>
              </div>

              <div class="arhat-plaque-card">
                <div>
                  <div class="arhat-plaque-eyebrow">Vị thứ ${a.id}/18 · ${a.title}</div>
                  <h4 class="arhat-plaque-name">${a.name}</h4>
                  <div class="arhat-emblem-pill">🪷 Pháp bảo &amp; Linh thú: ${a.emblem}</div>
                  <p class="arhat-plaque-meaning">${a.meaning}</p>
                </div>

                <div class="arhat-plaque-actions">
                  <button type="button" id="btn-arhat-prev" class="daily-dharma-secondary-btn">← Vị trước</button>
                  <button type="button" id="btn-arhat-tts" class="daily-dharma-primary-btn">🔊 Nghe giới thiệu</button>
                  <button type="button" id="btn-arhat-next" class="daily-dharma-secondary-btn">Vị tiếp →</button>
                </div>
              </div>
            </div>

            <div class="arhat-rail-18" role="tablist" aria-label="Chọn 1 trong 18 vị La Hán">
              ${EIGHTEEN_ARHATS.map(
                (item, idx) => `
                <button type="button" class="arhat-rail-btn ${idx === selectedArhatIdx ? 'active' : ''}" data-arhat-jump="${idx}" title="${item.title} — ${item.name}">
                  <span class="arhat-rail-num">${item.id}</span>
                  <span class="arhat-rail-title">${item.title.replace(' La Hán', '')}</span>
                </button>
              `
              ).join('')}
            </div>
          `;

          this.mountArhat3DStage('arhat-3d-canvas', selectedArhatIdx);

          document.getElementById('btn-arhat-prev')?.addEventListener('click', () => {
            selectedArhatIdx = (selectedArhatIdx + 17) % 18;
            this.playMokugyoTap();
            renderArhatMuseum();
          });
          document.getElementById('btn-arhat-next')?.addEventListener('click', () => {
            selectedArhatIdx = (selectedArhatIdx + 1) % 18;
            this.playMokugyoTap();
            renderArhatMuseum();
          });
          document.getElementById('btn-arhat-tts')?.addEventListener('click', () => {
            const text = `Vị thứ ${a.id}: ${a.title}, ${a.name}. Đặc trưng: ${a.emblem}. ${a.meaning}`;
            if ('speechSynthesis' in window) {
              try {
                window.speechSynthesis.cancel();
                const utter = new SpeechSynthesisUtterance(text);
                utter.lang = 'vi-VN';
                utter.rate = 0.92;
                window.speechSynthesis.speak(utter);
              } catch {}
            }
            this.playBellTone(360, 1.4);
            this.showToast(`🙏 ${a.title}`, a.meaning, 4200, false);
          });
          document.getElementById('btn-arhat-goto-hall')?.addEventListener('click', () => {
            const targetIdx = selectedArhatIdx;
            this.closeModal();
            this.switchScreen('courtyard');
            if (!this.world3d?.insideInterior) {
              this.toggleInteriorHallIn3D(true);
            }
            setTimeout(() => {
              this.world3d?.focusInteriorArhat?.(targetIdx);
            }, 350);
          });
          box.querySelectorAll('[data-arhat-jump]').forEach((btn) => {
            btn.addEventListener('click', () => {
              selectedArhatIdx = Number(btn.getAttribute('data-arhat-jump') || 0);
              this.playMokugyoTap();
              renderArhatMuseum();
            });
          });
        };
        renderArhatMuseum();
      } else if (sub === 'sweep') {
        box.innerHTML = `
          <div style="background:#fffdf8;border:1.5px solid rgba(140,100,60,0.28);border-radius:18px;padding:18px;text-align:center;">
            <div style="font-size:19px;font-weight:800;color:#472915;">Quét lá sân chùa</div>
            <p style="font-size:14px;color:#4a2f18;margin:6px auto 14px;max-width:520px;">
              "Chổi tre quét sạch lá vàng, lòng người nhẹ bớt ngổn ngang bụi trần." Bạn đã quét sạch <strong>${this.spiritual.leavesSwept}</strong> đợt lá rụng trên sân Chánh điện.
            </p>
            <button id="btn-do-sweep" class="product-detail-btn" style="max-width:280px;">Quét lá sân chùa</button>
          </div>
        `;
        document.getElementById('btn-do-sweep')?.addEventListener('click', () => {
          const r = performSpiritualAction(this.spiritual, 'SWEEP_LEAVES');
          this.spiritual = r.state;
          this.saveState();
          this.updateUGCMilestoneHUD();
          this.playMokugyoTap();
          renderSub('sweep');
        });
      }
    };

    renderSub(initialSubTab);

    document.querySelectorAll('.explore-sub-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sub = btn.getAttribute('data-sub') || 'stations';
        renderSub(sub);
      });
    });

    document.getElementById('btn-explore-open-ugc')?.addEventListener('click', () => {
      this.openUGCStudioModal();
    });

    document.getElementById('btn-explore-open-interior')?.addEventListener('click', () => {
      this.closeModal();
      this.switchScreen('courtyard');
      this.toggleInteriorHallIn3D(true);
    });
  }

  /* ========================================================================
     TÀI KHOẢN & TỦ ĐỒ 3 NHÂN VẬT 3D (Nam · Nữ · Trẻ em)
     ======================================================================== */
  openAccountModal() {
    const wearableItems = SHOP_CATALOG.filter((item) =>
      [
        'ao_trang_phat_tu',
        'tui_vai_theu_sen',
        'non_la_theu_sen',
        'khan_ran_nam_bo',
        'trang_hat_go',
        'so_tay_hoa_sen',
        'quat_nan_gio_may',
        'den_hoa_sen_pha_le_3d'
      ].includes(item.id)
    );

    const storeWearables = STORE_ITEMS_CATALOG.filter((item) => {
      const wearableSlot = ['robe', 'hat', 'mat', 'mala', 'handItem', 'instrument', 'cloud', 'pet'].includes(item.slot);
      if (!wearableSlot) return false;
      const owned = (this.storeProfile?.ownedCounts?.[item.id] || 0) > 0;
      const equipped = this.storeProfile?.equipped?.[item.slot] === item.id;
      return owned || equipped;
    });

    const activeProf =
      CHARACTER_PROFILES.find((c) => c.key === this.characterModelKey) || CHARACTER_PROFILES[0];
    this.profilePreviewPose = this.profilePreviewPose || 'Dung';
    const activeVisual = this.buildStoreVisualPayload();
    const activeOutfitText = activeVisual.robeName
      ? `${activeVisual.robeName}${activeVisual.bag ? ' & Túi vải sen' : ''}`
      : activeProf.outfitName;

    this.openModal(
      'Hồ sơ & Trang phục đi chùa',
      `
      <div class="profile-modal-layout">
        <div class="profile-stage-card">
          <div class="profile-3d-viewport" id="profile-3d-viewport">
            <canvas id="character-3d-canvas"></canvas>
            <div class="profile-stage-hint">Kéo để xoay 360°</div>
            <div class="profile-pose-pills">
              <button type="button" class="profile-pose-btn ${this.profilePreviewPose === 'Dung' ? 'active' : ''}" data-profile-pose="Dung">Đứng</button>
              <button type="button" class="profile-pose-btn ${this.profilePreviewPose === 'Chắp tay' ? 'active' : ''}" data-profile-pose="Chắp tay">Chắp tay</button>
              <button type="button" class="profile-pose-btn ${this.profilePreviewPose === 'Quỳ' ? 'active' : ''}" data-profile-pose="Quỳ">Quỳ</button>
            </div>
          </div>
          <div class="profile-char-name">${activeProf.name} (${activeProf.heightLabel})</div>
          <div class="profile-char-sub">${activeOutfitText}</div>
          <div class="profile-char-switch-row">
            ${CHARACTER_PROFILES.map(
              (c) => `
              <button type="button" class="char-switch-btn ${this.characterModelKey === c.key ? 'active' : ''}" data-char="${c.key}">
                ${c.name.split('(')[0].trim()}
              </button>
            `
            ).join('')}
          </div>
        </div>

        <div class="profile-right-col">
          <div class="profile-stats-banner">
            <div><div class="profile-stat-val">${this.spiritual.bowCount}</div><div class="profile-stat-lbl">Lạy Phật</div></div>
            <div><div class="profile-stat-val">${this.spiritual.incenseOfferings}</div><div class="profile-stat-lbl">Lần dâng hương</div></div>
            <div><div class="profile-stat-val">${this.spiritual.malaCycles * 108 + this.spiritual.malaBeads}</div><div class="profile-stat-lbl">Biến niệm Phật</div></div>
            <div><div class="profile-stat-val">${this.completedLessons.size}/24</div><div class="profile-stat-lbl">Bài đã học</div></div>
          </div>

          ${
            storeWearables.length > 0
              ? `
              <div>
                <div class="profile-wardrobe-heading" style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
                  <span>Áo tràng &amp; Pháp khí đã thỉnh từ Cửa hàng:</span>
                  <button type="button" id="btn-wardrobe-open-9tab" class="quest-go-btn" style="min-height:32px;font-size:12px;">🛍️ Thỉnh thêm Áo tràng</button>
                </div>
                <div class="profile-wardrobe-grid">
                  ${storeWearables
                    .map((item) => {
                      const active = this.storeProfile?.equipped?.[item.slot] === item.id;
                      const dotHtml = item.swatchHex
                        ? `<span style="width:14px;height:14px;border-radius:50%;background:${item.swatchHex};border:1.5px solid #4A3222;display:inline-block;flex-shrink:0;"></span>`
                        : '';
                      return `
                      <button type="button" class="store-wardrobe-toggle-btn profile-wardrobe-card ${active ? 'active' : ''}" data-store-slot="${item.slot}" data-store-id="${item.id}">
                        <span class="profile-wardrobe-name" style="display:flex;align-items:center;gap:7px;">${dotHtml}<span>${item.name}</span></span>
                        <span class="profile-wardrobe-status">${active ? '✓ Đang mặc' : 'Mặc vào 3D'}</span>
                      </button>
                    `;
                    })
                    .join('')}
                </div>
              </div>
              `
              : `
              <div class="store-quest-cta-strip">
                <span>👕 Cô bác chưa thỉnh thêm Áo tràng mới? Hãy ghé Cửa hàng để xem thử 12 mẫu Áo tràng &amp; Pháp phục 3D!</span>
                <button type="button" id="btn-wardrobe-open-9tab" class="quest-claim-btn">🛍️ Xem 12 mẫu Áo tràng</button>
              </div>
              `
          }

          <div>
            <div class="profile-wardrobe-heading">Hành trang &amp; đồ mang theo mặc định:</div>
            <div class="profile-wardrobe-grid">
              ${wearableItems
                .map((item) => {
                  const active =
                    item.id === 'ao_trang_phat_tu'
                      ? !this.storeProfile?.equipped?.robe && this.spiritual.equippedItems.outfit === 'ao_trang_phat_tu'
                      : Object.values(this.spiritual.equippedItems).includes(item.id);
                  return `
                  <button type="button" class="wardrobe-toggle-btn profile-wardrobe-card ${active ? 'active' : ''}" data-slot="${item.equipSlot}" data-id="${item.id}">
                    <span class="profile-wardrobe-name">${item.name}</span>
                    <span class="profile-wardrobe-status">${active ? '✓ Đang mang' : 'Mang thử'}</span>
                  </button>
                `;
                })
                .join('')}
            </div>
          </div>

          <div class="profile-cta-row">
            <button type="button" id="btn-account-open-dharma" class="product-detail-btn" style="width:100%;background:#5C381F;">Lời dạy hôm nay</button>
            <button type="button" id="btn-account-open-ugc" class="product-detail-btn" style="width:100%;background:#9c4119;">Lưu ảnh kỷ niệm</button>
            <button type="button" id="btn-account-open-shop" class="product-detail-btn" style="width:100%;">Quà lưu niệm</button>
          </div>

          <div class="backup-code-box">
            <div class="backup-code-title">🔐 Sao lưu &amp; Khôi phục Hồ sơ (Mã khôi phục)</div>
            <p class="backup-code-desc">
              Tạo và lưu lại mã <code>VT1-...</code> để khi chuyển sang điện thoại khác cô bác vẫn giữ nguyên số lạy, công đức, áo tràng và bài đã học.
            </p>
            <div class="backup-code-row">
              <button type="button" id="btn-generate-backup-code" class="product-detail-btn" style="width:auto;padding:0 16px;height:38px;font-size:13px;background:#5C381F;">
                📋 Tạo &amp; Sao chép mã
              </button>
              <input id="backup-code-display" type="text" readonly value="${encodeProfileBackupCode({
                characterModelKey: this.characterModelKey,
                spiritual: this.spiritual,
                storeProfile: this.storeProfile,
                activityHub: this.activityHub,
                completedLessons: Array.from(this.completedLessons)
              })}" aria-label="Mã sao lưu hồ sơ của bạn" />
            </div>
            <div class="backup-code-row" style="margin-top:8px;">
              <input id="restore-code-input" type="text" placeholder="Dán mã khôi phục VT1-... tại đây" aria-label="Nhập mã khôi phục" />
              <button type="button" id="btn-restore-backup-code" class="product-detail-btn" style="width:auto;padding:0 16px;height:38px;font-size:13px;background:#9A6E1C;">
                Khôi phục
              </button>
            </div>
          </div>
        </div>
      </div>
      `
    );

    const mountStage = (pose) => {
      this.mountProfileCharacterStage('character-3d-canvas', {
        charKey: this.characterModelKey,
        pose
      });
    };
    mountStage(this.profilePreviewPose);

    document.querySelectorAll('[data-profile-pose]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.profilePreviewPose = btn.getAttribute('data-profile-pose') || 'Dung';
        document.querySelectorAll('[data-profile-pose]').forEach((b) => {
          b.classList.toggle('active', b === btn);
        });
        mountStage(this.profilePreviewPose);
      });
    });

    document.querySelectorAll('.char-switch-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-char') || 'nu';
        this.characterModelKey = key;
        this.world3d?.switchCharacter(key);
        this.syncStoreVisualsTo3D();
        this.saveState();
        this.updateEquippedTags();
        this.openAccountModal();
      });
    });

    document.querySelectorAll('.store-wardrobe-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slot = btn.getAttribute('data-store-slot');
        const itemId = btn.getAttribute('data-store-id');
        if (!slot || !itemId) return;
        const currentlyEquipped = this.storeProfile.equipped[slot] === itemId;
        this.storeProfile.equipped[slot] = currentlyEquipped ? null : itemId;
        this.storeProfile.tryingItemId = null;
        if (slot === 'robe' && !currentlyEquipped) {
          this.spiritual.equippedItems.outfit = null;
        }
        if (itemId === 'non_la_theu_sen_store') {
          this.spiritual.equippedItems.hat = currentlyEquipped ? null : 'non_la_theu_sen';
        }
        this.saveState();
        this.syncStoreVisualsTo3D();
        this.updateEquippedTags();
        this.playMokugyoTap();
        this.openAccountModal();
      });
    });

    document.querySelectorAll('.wardrobe-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slot = btn.getAttribute('data-slot') || 'hand';
        const itemKey = btn.getAttribute('data-id');
        if (itemKey === 'ao_trang_phat_tu') {
          this.storeProfile.equipped.robe = null;
          this.storeProfile.tryingItemId = null;
        }
        const r = performSpiritualAction(this.spiritual, 'EQUIP_ITEM', { slot, itemKey });
        this.spiritual = r.state;
        this.saveState();
        this.syncStoreVisualsTo3D();
        this.updateEquippedTags();
        this.playMokugyoTap();
        this.openAccountModal();
      });
    });

    document.getElementById('btn-wardrobe-open-9tab')?.addEventListener('click', () => {
      this.openNineTabStoreModal('ao_trang');
    });

    document.getElementById('btn-account-open-dharma')?.addEventListener('click', () => {
      this.showDailyDharmaModal({ markSeenToday: false });
    });

    document.getElementById('btn-account-open-ugc')?.addEventListener('click', () => {
      this.openUGCStudioModal();
    });

    document.getElementById('btn-account-open-shop')?.addEventListener('click', () => {
      this.closeModal();
      this.switchScreen('shop');
    });

    document.getElementById('btn-generate-backup-code')?.addEventListener('click', async () => {
      const code = encodeProfileBackupCode({
        characterModelKey: this.characterModelKey,
        spiritual: this.spiritual,
        storeProfile: this.storeProfile,
        activityHub: this.activityHub,
        completedLessons: Array.from(this.completedLessons)
      });
      const disp = document.getElementById('backup-code-display');
      if (disp) disp.value = code;
      try {
        await navigator.clipboard?.writeText(code);
        this.showToast('📋 Đã sao chép mã khôi phục', 'Cô bác hãy dán và lưu giữ mã VT1 này vào ghi chú hoặc Zalo.', 3800, false);
      } catch {
        this.showToast('🔐 Đã tạo mã khôi phục', 'Cô bác hãy chọn toàn bộ ô mã bên cạnh để sao chép nhé.', 3800, false);
      }
    });

    document.getElementById('btn-restore-backup-code')?.addEventListener('click', () => {
      const inp = document.getElementById('restore-code-input');
      const res = decodeProfileBackupCode(inp?.value || '');
      if (!res.ok || !res.data) {
        this.showToast('Chưa khôi phục được', res.message || 'Mã khôi phục không hợp lệ.', 3800, false);
        return;
      }
      this.characterModelKey = res.data.characterModelKey;
      this.spiritual = res.data.spiritual;
      this.storeProfile = res.data.storeProfile;
      this.activityHub = res.data.activityHub;
      this.completedLessons = new Set(res.data.completedLessons);
      this.world3d?.switchCharacter?.(this.characterModelKey);
      this.syncStoreVisualsTo3D();
      this.saveState();
      this.updateActionBadges();
      this.updateEquippedTags();
      this.playBellTone(324, 2.2);
      this.showToast('✅ Đã khôi phục hồ sơ thành công!', 'Toàn bộ công đức, vật phẩm và bài học của cô bác đã trở lại.', 4200, false);
      this.openAccountModal();
    });
  }

  /* ========================================================================
     HÀNH TRÌNH MODAL (Điểm danh 7 ngày · Nhiệm vụ & Chặng · Hộp thư · Hướng dẫn · Chia sẻ & Góp ý)
     ======================================================================== */
  openActivityHubModal(initialTab = 'checkin') {
    let activeTab = initialTab;
    let mailFilter = 'all';
    let feedbackRating = 5;
    const feedbackTags = new Set();
    let feedbackComment = '';

    const renderHub = () => {
      const todayKey = getLocalDateKey();
      this.activityHub = ensureDailyMissionDate(this.activityHub, todayKey);
      const canCheckinToday = this.activityHub.lastCheckinDate !== todayKey;
      const dailyMissions = getDailyMissionsWithProgress(this.activityHub, todayKey);
      const chapters = getExplorationChaptersStatus(this.activityHub, this.spiritual);
      const quests = getQuestsWithProgress(this.activityHub, this.spiritual, this.completedLessons.size);
      const allMails = getMailboxWithStatus(this.activityHub, {
        includeExtended: true,
        spiritualState: this.spiritual
      });
      const shownMails = mailFilter === 'unclaimed' ? allMails.filter((m) => !m.claimed) : allMails;

      const claimableDailyCount = dailyMissions.filter((m) => m.claimable).length;
      const claimableChapCount = chapters.filter((c) => c.claimable).length;
      const claimableQCount = quests.filter((q) => q.claimable).length + claimableDailyCount + claimableChapCount;
      const unclaimedMailCount = allMails.filter((m) => !m.claimed).length;

      let bodyHtml = '';
      if (activeTab === 'checkin') {
        bodyHtml = `
          <div class="activity-banner-row">
            <div>
              <div style="font-size:17px;font-weight:800;color:#FFD875;">📅 Điểm danh lễ chùa 7 ngày liên tiếp</div>
              <div style="font-size:13.5px;color:#FFF6E5;margin-top:2px;">
                Chuỗi hiện tại: <strong>${this.activityHub.streakDays}/7 ngày</strong> · Tổng cộng ${this.activityHub.checkinCount} ngày tinh tấn · Mở khóa thêm Thư &amp; Chặng khám phá mới mỗi ngày!
              </div>
            </div>
            <button type="button" id="btn-claim-daily-checkin" class="quest-claim-btn" ${canCheckinToday ? '' : 'disabled'} style="min-height:46px;padding:0 20px;font-size:14.5px;${canCheckinToday ? '' : 'opacity:0.65;cursor:default;'}">
              ${canCheckinToday ? '🎁 Điểm danh nhận lộc hôm nay' : '✓ Hôm nay đã điểm danh'}
            </button>
          </div>
          <div class="checkin-grid-7">
            ${DAILY_CHECKIN_REWARDS.map((d) => {
              const claimed = this.activityHub.claimedDays.includes(d.day);
              const nextDay = (this.activityHub.streakDays % 7) + 1;
              const isTodayTarget = canCheckinToday && d.day === nextDay;
              return `
              <div class="checkin-day-card ${claimed ? 'claimed' : ''} ${isTodayTarget ? 'today-target' : ''}">
                <div class="checkin-day-num">Ngày ${d.day}</div>
                <div class="checkin-day-title">${d.label.split('·')[1]?.trim() || d.label}</div>
                <div class="checkin-day-gift">+${d.lotus} 🪷<br/>+${d.gems} 💎</div>
                <div class="checkin-day-status">${claimed ? '✓ Đã nhận' : isTodayTarget ? 'Hôm nay' : 'Chờ nhận'}</div>
              </div>`;
            }).join('')}
          </div>
        `;
      } else if (activeTab === 'quests') {
        bodyHtml = `
          <div class="activity-banner-row">
            <div>
              <div style="font-size:16.5px;font-weight:800;color:#FFD875;">🌅 Nhiệm vụ Hôm nay &amp; Hành trình 7 Ngày Khám phá</div>
              <div style="font-size:13px;color:#FFF6E5;margin-top:2px;">Thực hành nhẹ nhàng mỗi ngày để tích điểm Sen 🪷 &amp; Ngọc 💎 thỉnh Áo tràng đẹp.</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <span class="store-wallet-pill">🪷 ${this.storeProfile.lotusPoints}</span>
              <span class="store-wallet-pill">💎 ${this.storeProfile.gems}</span>
            </div>
          </div>

          <div class="hub-section-heading">🌅 Nhiệm vụ Hôm nay (làm mới mỗi ngày)</div>
          <div class="quests-grid">
            ${dailyMissions
              .map((m) => {
                const pct = Math.min(100, Math.round((m.current / m.target) * 100));
                return `
                <div class="quest-card ${m.claimed ? 'claimed' : m.claimable ? 'claimable' : ''}">
                  <div class="quest-card-head">
                    <span class="quest-cat-pill">${m.icon} Hằng ngày</span>
                    <span class="quest-reward-text">+${m.rewardLotus} 🪷 · +${m.rewardGems} 💎</span>
                  </div>
                  <div class="quest-card-title">${m.title}</div>
                  <div class="quest-card-desc">${m.desc}</div>
                  <div class="quest-progress-track">
                    <div class="quest-progress-fill" style="width:${pct}%"></div>
                  </div>
                  <div class="quest-card-foot">
                    <span class="quest-progress-lbl">${m.current}/${m.target}</span>
                    ${
                      m.claimed
                        ? `<span class="quest-done-tag">✓ Đã nhận hôm nay</span>`
                        : m.claimable
                        ? `<button type="button" class="quest-claim-btn" data-claim-daily="${m.id}">🎁 Nhận lộc</button>`
                        : `<button type="button" class="quest-go-btn" data-hub-go-quest="${m.actionHint}">Làm ngay →</button>`
                    }
                  </div>
                </div>`;
              })
              .join('')}
          </div>

          <div class="hub-section-heading">🗓️ 7 Chặng Khám phá Chùa Vĩnh Tràng (Nhiều ngày không chán)</div>
          <div class="quests-grid">
            ${chapters
              .map((ch) => {
                const pct = Math.min(100, Math.round((ch.visitedCount / ch.requiredStations) * 100));
                return `
                <div class="quest-card ${ch.claimed ? 'claimed' : ch.claimable ? 'claimable' : ''}">
                  <div class="quest-card-head">
                    <span class="quest-cat-pill">🗓️ Chặng ${ch.dayUnlock}/7</span>
                    <span class="quest-reward-text">+${ch.rewardLotus} 🪷 · +${ch.rewardGems} 💎</span>
                  </div>
                  <div class="quest-card-title">${ch.title}</div>
                  <div class="quest-card-desc">${ch.desc}</div>
                  <div class="quest-progress-track">
                    <div class="quest-progress-fill" style="width:${pct}%"></div>
                  </div>
                  <div class="quest-card-foot">
                    <span class="quest-progress-lbl">Ghé ${ch.visitedCount}/${ch.requiredStations} điểm</span>
                    ${
                      ch.claimed
                        ? `<span class="quest-done-tag">✓ Đã hoàn thành</span>`
                        : ch.claimable
                        ? `<button type="button" class="quest-claim-btn" data-claim-chapter="${ch.id}">🎁 Nhận thưởng chặng</button>`
                        : `<button type="button" class="quest-go-btn" data-guide-walk="${ch.stationKey}">🚶 Đi tới ngay</button>`
                    }
                  </div>
                </div>`;
              })
              .join('')}
          </div>

          <div class="hub-section-heading">🏆 Dấu mốc Thực hành Trọn đời</div>
          <div class="quests-grid">
            ${quests
              .map((q) => {
                const pct = Math.min(100, Math.round((q.current / q.target) * 100));
                return `
                <div class="quest-card ${q.claimed ? 'claimed' : q.claimable ? 'claimable' : ''}">
                  <div class="quest-card-head">
                    <span class="quest-cat-pill">${q.icon} ${q.category}</span>
                    <span class="quest-reward-text">+${q.rewardLotus} 🪷 · +${q.rewardGems} 💎</span>
                  </div>
                  <div class="quest-card-title">${q.title}</div>
                  <div class="quest-card-desc">${q.desc}</div>
                  <div class="quest-progress-track">
                    <div class="quest-progress-fill" style="width:${pct}%"></div>
                  </div>
                  <div class="quest-card-foot">
                    <span class="quest-progress-lbl">${q.current}/${q.target}</span>
                    ${
                      q.claimed
                        ? `<span class="quest-done-tag">✓ Đã nhận</span>`
                        : q.claimable
                        ? `<button type="button" class="quest-claim-btn" data-hub-claim-quest="${q.id}">🎁 Nhận thưởng</button>`
                        : `<button type="button" class="quest-go-btn" data-hub-go-quest="${q.actionHint}">Thực hiện →</button>`
                    }
                  </div>
                </div>`;
              })
              .join('')}
          </div>
        `;
      } else if (activeTab === 'mailbox') {
        bodyHtml = `
          <div class="activity-banner-row">
            <div>
              <div style="font-size:16.5px;font-weight:800;color:#FFD875;">✉️ Hộp thư Nhà Chùa &amp; Hồi âm Tri ân</div>
              <div style="font-size:13px;color:#FFF6E5;margin-top:2px;">Nhận quà công đức và chạm chọn lời hồi âm để nhận thêm +15 🪷 mỗi bức thư!</div>
            </div>
            <span class="store-wallet-pill">Còn ${unclaimedMailCount} thư chưa nhận quà</span>
          </div>

          <div class="mail-filter-row">
            <button type="button" class="mail-filter-pill ${mailFilter === 'all' ? 'active' : ''}" data-mail-filter="all">
              📬 Tất cả thư (${allMails.length})
            </button>
            <button type="button" class="mail-filter-pill ${mailFilter === 'unclaimed' ? 'active' : ''}" data-mail-filter="unclaimed">
              🎁 Chưa nhận quà (${unclaimedMailCount})
            </button>
          </div>

          <div class="mailbox-list">
            ${
              shownMails.length === 0
                ? `<div class="mail-card"><p class="mail-body" style="text-align:center;font-weight:700;">Cô bác đã nhận hết quà trong hộp thư hôm nay rồi ạ! Ngày mai điểm danh sẽ có thêm thư mới từ Nhà Chùa.</p></div>`
                : shownMails
                    .map(
                      (m) => `
                <article class="mail-card ${m.claimed ? 'claimed' : ''}">
                  <div class="mail-card-head">
                    <div>
                      <div class="mail-sender">${m.sender} · <span style="opacity:0.75;">${m.dateLabel}</span></div>
                      <div class="mail-title">${m.title}</div>
                    </div>
                    <div class="mail-rewards-pill">+${m.rewardLotus} 🪷 · +${m.rewardGems} 💎</div>
                  </div>
                  <p class="mail-body">${m.body}</p>
                  <div class="mail-reply-chips">
                    ${(m.replyOptions || [])
                      .map(
                        (opt, optIdx) => `
                        <button type="button" class="mail-reply-btn ${m.replyText === opt ? 'replied' : ''}" data-reply-mail="${m.id}" data-reply-idx="${optIdx}">
                          ${m.replyText === opt ? '✓ ' : '💬 '}${opt}
                        </button>
                      `
                      )
                      .join('')}
                  </div>
                  <div class="mail-card-foot">
                    <span class="quest-progress-lbl">${m.replyText ? 'Đã gửi hồi âm (+15 🪷)' : 'Chạm chọn lời hồi âm nhận +15 🪷'}</span>
                    ${
                      m.claimed
                        ? `<span class="quest-done-tag">✓ Đã nhận quà thư này</span>`
                        : `<button type="button" class="quest-claim-btn" data-claim-mail="${m.id}">✉️ Nhận quà ngay</button>`
                    }
                  </div>
                </article>`
                    )
                    .join('')
            }
          </div>
        `;
      } else if (activeTab === 'guide') {
        bodyHtml = `
          <div class="activity-banner-row">
            <div>
              <div style="font-size:16.5px;font-weight:800;color:#FFD875;">🧭 Hướng dẫn Hành hương Chùa Vĩnh Tràng (6 bước chuẩn nghi lễ)</div>
              <div style="font-size:13px;color:#FFF6E5;margin-top:2px;">
                Trên điện thoại: chạm trực tiếp lên sân chùa để đi tới điểm hành hương hoặc kéo ngón tay để xoay góc nhìn. Trên máy tính: dùng phím <strong>W A S D</strong> / mũi tên và kéo chuột.
              </div>
            </div>
            ${
              this.activeGuidedBeacon
                ? `<button type="button" id="btn-clear-beacon" class="quest-go-btn" style="background:#FFF6E5;color:#7E2A22;">✕ Tắt đèn dẫn đường</button>`
                : ''
            }
          </div>
          <div class="guide-steps-grid">
            ${PILGRIMAGE_GUIDE_STEPS.map(
              (s) => `
              <div class="guide-step-card">
                <div class="guide-step-title">${s.title}</div>
                <p class="guide-step-desc">${s.desc}</p>
                <div class="guide-step-actions">
                  <button type="button" class="quest-go-btn" data-guide-walk="${s.stationKey}">🚶 Đi tới đây</button>
                  <button type="button" class="quest-claim-btn" data-guide-beacon="${s.stationKey}">🧭 Dẫn đường 3D</button>
                </div>
              </div>`
            ).join('')}
          </div>
        `;
      } else if (activeTab === 'share_feedback') {
        const shareText = buildPilgrimageShareText({
          characterModelKey: this.characterModelKey,
          spiritual: this.spiritual,
          storeProfile: this.storeProfile,
          activityHub: this.activityHub,
          completedLessonsCount: this.completedLessons.size
        });
        const quickTags = ['Chữ to dễ đọc', 'Tượng & Chánh điện đẹp', 'Âm thanh chuông mõ êm dịu', 'Muốn thêm hướng dẫn'];
        bodyHtml = `
          <div class="share-feedback-grid">
            <div class="mail-card">
              <div class="mail-card-head">
                <div class="mail-title">💌 Thiệp Chia sẻ Hành hương gửi Người thân</div>
                <span class="mail-rewards-pill">+30 🪷 · +5 💎 / ngày</span>
              </div>
              <p class="mail-body">Sao chép tấm thiệp ghi lại số lạy, chuỗi niệm Phật và dấu ấn hành hương để gửi qua Zalo, Facebook cho con cháu &amp; bạn đạo:</p>
              <pre class="share-card-preview">${shareText}</pre>
              <button type="button" id="btn-copy-share-card" class="daily-dharma-primary-btn" style="width:100%;">
                📋 Sao chép Thiệp Chia sẻ (+30 🪷 &amp; +5 💎)
              </button>
              <div class="quest-progress-lbl" style="text-align:center;">Cô bác đã chia sẻ ${this.activityHub.shareCount || 0} lần.</div>
            </div>

            <div class="mail-card">
              <div class="mail-card-head">
                <div class="mail-title">📝 Góp ý Cải thiện Chùa Online</div>
                <span class="mail-rewards-pill">+25 🪷 tri ân</span>
              </div>
              <p class="mail-body">Cô bác thấy Chùa Vĩnh Tràng 3D hôm nay thế nào? Mọi góp ý giúp nhà chùa làm ứng dụng dễ dùng hơn cho người lớn tuổi:</p>
              <div class="feedback-stars-row" role="group" aria-label="Đánh giá sao">
                ${[1, 2, 3, 4, 5]
                  .map(
                    (st) => `
                  <button type="button" class="feedback-star-btn ${st <= feedbackRating ? 'active' : ''}" data-fb-star="${st}">
                    ★
                  </button>
                `
                  )
                  .join('')}
                <span class="quest-progress-lbl" style="margin-left:6px;">${feedbackRating}/5 sao</span>
              </div>
              <div class="mail-reply-chips">
                ${quickTags
                  .map(
                    (tag) => `
                  <button type="button" class="feedback-tag-chip ${feedbackTags.has(tag) ? 'active' : ''}" data-fb-tag="${tag}">
                    ${feedbackTags.has(tag) ? '✓ ' : '+ '}${tag}
                  </button>
                `
                  )
                  .join('')}
              </div>
              <textarea id="feedback-comment-input" class="feedback-textarea" rows="3" placeholder="Cô bác có thể nhắn thêm lời góp ý tại đây (không bắt buộc)...">${feedbackComment}</textarea>
              <button type="button" id="btn-submit-feedback" class="quest-claim-btn" style="min-height:46px;font-size:15px;width:100%;">
                🙏 Gửi Góp ý cho Nhà Chùa (+25 🪷)
              </button>
            </div>
          </div>
        `;
      }

      this.openModal(
        'Hành trình Tu tập & Hướng dẫn Đi chùa',
        `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div class="activity-tabs-row" role="tablist">
            <button type="button" class="activity-tab-pill ${activeTab === 'checkin' ? 'active' : ''}" data-hub-tab="checkin">
              📅 Điểm danh ${canCheckinToday ? '<span class="hub-dot"></span>' : ''}
            </button>
            <button type="button" class="activity-tab-pill ${activeTab === 'quests' ? 'active' : ''}" data-hub-tab="quests">
              🎯 Nhiệm vụ ${claimableQCount > 0 ? `<span class="hub-count">${claimableQCount}</span>` : ''}
            </button>
            <button type="button" class="activity-tab-pill ${activeTab === 'mailbox' ? 'active' : ''}" data-hub-tab="mailbox">
              ✉️ Hộp thư ${unclaimedMailCount > 0 ? `<span class="hub-count">${unclaimedMailCount}</span>` : ''}
            </button>
            <button type="button" class="activity-tab-pill ${activeTab === 'guide' ? 'active' : ''}" data-hub-tab="guide">
              🧭 Hướng dẫn đi
            </button>
            <button type="button" class="activity-tab-pill ${activeTab === 'share_feedback' ? 'active' : ''}" data-hub-tab="share_feedback">
              💌 Chia sẻ &amp; Góp ý
            </button>
          </div>
          ${bodyHtml}
        </div>
        `
      );

      document.querySelectorAll('[data-hub-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeTab = btn.getAttribute('data-hub-tab') || 'checkin';
          renderHub();
        });
      });

      document.getElementById('btn-claim-daily-checkin')?.addEventListener('click', () => {
        const res = claimDailyCheckin(this.activityHub, this.storeProfile, getLocalDateKey());
        if (!res.ok) {
          this.showToast('Điểm danh hằng ngày', res.message, 3200, false);
          return;
        }
        this.activityHub = res.activity;
        this.storeProfile = res.storeProfile;
        this.saveState();
        this.updateActionBadges();
        this.playBellTone(324, 2.2);
        this.showToast('📅 Điểm danh thành công!', res.message, 4200, false);
        renderHub();
      });

      document.querySelectorAll('[data-claim-daily]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const mid = btn.getAttribute('data-claim-daily');
          const res = claimDailyMissionReward(this.activityHub, this.storeProfile, mid, getLocalDateKey());
          this.activityHub = res.activity;
          this.storeProfile = res.storeProfile;
          this.saveState();
          this.updateActionBadges();
          if (res.ok) {
            this.playBellTone(324, 2.0);
            this.showToast('🎁 Nhận lộc nhiệm vụ hôm nay', res.message, 3600, false);
          } else {
            this.showToast('Nhiệm vụ hôm nay', res.message, 3200, false);
          }
          renderHub();
        });
      });

      document.querySelectorAll('[data-claim-chapter]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const cid = btn.getAttribute('data-claim-chapter');
          const res = claimExplorationChapterReward(this.activityHub, this.storeProfile, this.spiritual, cid);
          this.activityHub = res.activity;
          this.storeProfile = res.storeProfile;
          this.saveState();
          this.updateActionBadges();
          if (res.ok) {
            this.playBellTone(324, 2.2);
            this.showToast('🗓️ Hoàn thành chặng khám phá', res.message, 3800, false);
          }
          renderHub();
        });
      });

      document.querySelectorAll('[data-hub-claim-quest]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const qid = btn.getAttribute('data-hub-claim-quest');
          const res = claimQuestReward(
            this.activityHub,
            this.storeProfile,
            this.spiritual,
            this.completedLessons.size,
            qid
          );
          this.activityHub = res.activity;
          this.storeProfile = res.storeProfile;
          this.saveState();
          this.updateActionBadges();
          if (res.ok) {
            this.playBellTone(324, 2.0);
            this.showToast('🎁 Nhận thưởng nhiệm vụ', res.message, 3600, false);
          }
          renderHub();
        });
      });

      document.querySelectorAll('[data-hub-go-quest]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.executeQuestActionHint(btn.getAttribute('data-hub-go-quest'));
        });
      });

      document.querySelectorAll('[data-mail-filter]').forEach((btn) => {
        btn.addEventListener('click', () => {
          mailFilter = btn.getAttribute('data-mail-filter') || 'all';
          renderHub();
        });
      });

      document.querySelectorAll('[data-reply-mail]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const mailId = btn.getAttribute('data-reply-mail');
          const optIdx = Number(btn.getAttribute('data-reply-idx') || 0);
          const res = replyToMailboxMessage(this.activityHub, this.storeProfile, mailId, optIdx);
          if (res.ok) {
            this.activityHub = res.activity;
            this.storeProfile = res.storeProfile;
            this.saveState();
            this.updateActionBadges();
            this.playMokugyoTap();
            this.showToast('💬 Hồi âm Nhà Chùa', res.message, 3400, false);
            renderHub();
          }
        });
      });

      document.querySelectorAll('[data-claim-mail]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const mailId = btn.getAttribute('data-claim-mail');
          const res = claimMailboxReward(this.activityHub, this.storeProfile, mailId);
          this.activityHub = res.activity;
          this.storeProfile = res.storeProfile;
          this.saveState();
          this.updateActionBadges();
          if (res.ok) {
            this.playBellTone(288, 2.2);
            this.showToast('✉️ Đã nhận quà từ Hộp thư', res.message, 4000, false);
          }
          renderHub();
        });
      });

      document.querySelectorAll('[data-guide-walk]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-guide-walk') || 'chanh_dien';
          this.closeModal();
          this.switchScreen('courtyard');
          if (this.world3d?.insideInterior) {
            this.toggleInteriorHallIn3D(false);
          }
          this.walkToStationIn3D(key);
        });
      });

      document.querySelectorAll('[data-guide-beacon]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-guide-beacon') || 'chanh_dien';
          this.activateGuidedBeacon(key);
        });
      });

      document.getElementById('btn-clear-beacon')?.addEventListener('click', () => {
        this.activateGuidedBeacon(null);
        renderHub();
      });

      document.getElementById('btn-copy-share-card')?.addEventListener('click', async () => {
        const shareText = buildPilgrimageShareText({
          characterModelKey: this.characterModelKey,
          spiritual: this.spiritual,
          storeProfile: this.storeProfile,
          activityHub: this.activityHub,
          completedLessonsCount: this.completedLessons.size
        });
        try {
          await navigator.clipboard?.writeText(shareText);
        } catch {}
        const res = recordPilgrimageShare(this.activityHub, this.storeProfile, getLocalDateKey());
        this.activityHub = res.activity;
        this.storeProfile = res.storeProfile;
        this.saveState();
        this.updateActionBadges();
        this.playBellTone(324, 1.8);
        this.showToast('💌 Chia sẻ Hành hương', res.message, 4000, false);
        renderHub();
      });

      document.querySelectorAll('[data-fb-star]').forEach((btn) => {
        btn.addEventListener('click', () => {
          feedbackRating = Number(btn.getAttribute('data-fb-star') || 5);
          feedbackComment = document.getElementById('feedback-comment-input')?.value || feedbackComment;
          this.playMokugyoTap();
          renderHub();
        });
      });

      document.querySelectorAll('[data-fb-tag]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const tag = btn.getAttribute('data-fb-tag');
          feedbackComment = document.getElementById('feedback-comment-input')?.value || feedbackComment;
          if (tag) {
            if (feedbackTags.has(tag)) feedbackTags.delete(tag);
            else feedbackTags.add(tag);
          }
          renderHub();
        });
      });

      document.getElementById('btn-submit-feedback')?.addEventListener('click', () => {
        const commentVal = document.getElementById('feedback-comment-input')?.value || feedbackComment;
        const res = submitUserFeedback(
          this.activityHub,
          this.storeProfile,
          { rating: feedbackRating, tags: Array.from(feedbackTags), comment: commentVal },
          getLocalDateKey()
        );
        if (!res.ok) {
          this.showToast('Góp ý Nhà Chùa', res.message, 3200, false);
          return;
        }
        this.activityHub = res.activity;
        this.storeProfile = res.storeProfile;
        feedbackTags.clear();
        feedbackComment = '';
        this.saveState();
        this.updateActionBadges();
        this.playBellTone(324, 2.0);
        this.showToast('🙏 Đã gửi góp ý', res.message, 4000, false);
        renderHub();
      });
    };

    renderHub();
  }

  async mountProfileCharacterStage(canvasId, { charKey = 'nu', pose = 'Dung' }) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (this._profileStageDispose) {
      try {
        this._profileStageDispose();
      } catch {}
      this._profileStageDispose = null;
    }

    try {
      const THREE = await import('three');
      const SkeletonUtils = await import('three/addons/utils/SkeletonUtils.js');
      const wrap = canvas.parentElement;
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(260, rect.width || 282);
      const h = Math.max(260, rect.height || 292);

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 40);
      camera.position.set(0, 1.06, 3.25);
      camera.lookAt(0, 0.86, 0);

      // Clean warm 3-point lighting matching sunlit courtyard
      scene.add(new THREE.HemisphereLight(0xFFF9EA, 0x7A5A3A, 1.35));
      const keyLight = new THREE.DirectionalLight(0xFFE7BA, 1.55);
      keyLight.position.set(2.5, 4.5, 3.2);
      scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0xFFE4B0, 0.72);
      rimLight.position.set(-2.4, 2.2, -2.5);
      scene.add(rimLight);

      const stageGroup = new THREE.Group();
      scene.add(stageGroup);

      // Subtle sandstone lotus plinth at feet (no bulky brown disc blocking character)
      const plinth = new THREE.Mesh(
        new THREE.CylinderGeometry(0.54, 0.62, 0.07, 36),
        new THREE.MeshStandardMaterial({ color: 0xD8C39E, roughness: 0.78 })
      );
      plinth.position.y = -0.035;
      stageGroup.add(plinth);
      const trimRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.016, 10, 40),
        new THREE.MeshStandardMaterial({ color: 0xC9962E, roughness: 0.45, metalness: 0.35 })
      );
      trimRing.rotation.x = Math.PI / 2;
      trimRing.position.y = 0.002;
      stageGroup.add(trimRing);

      // Load/reuse rigged character GLB with SkeletonUtils.clone
      const profile = CHARACTER_PROFILES.find((c) => c.key === charKey) || CHARACTER_PROFILES[0];
      let gltf = this.world3d?.charDataCache?.[charKey] || this.cachedGLBCharacters[charKey];
      if (!gltf?.scene) {
        const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
        const loader = new GLTFLoader();
        gltf = await loader.loadAsync(profile.glb);
        this.cachedGLBCharacters[charKey] = gltf;
      }

      let mixer = null;
      if (gltf?.scene && document.body.contains(canvas)) {
        const cloned = SkeletonUtils.clone(gltf.scene);
        let geomBox = null;
        cloned.traverse((o) => {
          if (o.isMesh || o.isSkinnedMesh) {
            o.frustumCulled = false;
            if (o.geometry) {
              if (!o.geometry.getAttribute('normal')) o.geometry.computeVertexNormals();
              o.geometry.computeBoundingBox();
              if (o.isSkinnedMesh && o.geometry.boundingBox) {
                geomBox = o.geometry.boundingBox;
              }
            }
            if (o.material) {
              o.material = o.material.clone();
              if (o.geometry?.getAttribute('color')) o.material.vertexColors = true;
              o.material.metalness = 0.0;
              o.material.roughness = 0.85;
            }
          }
        });
        if (!geomBox) geomBox = new THREE.Box3().setFromObject(cloned);
        const targetH = charKey === 'tre_em' ? 1.38 : charKey === 'nam' ? 1.68 : 1.60;
        const scale = targetH / Math.max(0.2, geomBox.max.y - geomBox.min.y);
        cloned.scale.setScalar(scale);
        cloned.position.y = -geomBox.min.y * scale;
        stageGroup.add(cloned);

        // Unified Store Robes + Bespoke 3D Wearables + Equipped Props Preview (bone-weighted)
        const storeVisual = this.buildStoreVisualPayload();
        clearRiggedBoneProps(cloned);
        recolorGarmentOnScene(THREE, cloned, {
          robeTint: storeVisual.robeTint,
          upperTint: storeVisual.upperTint,
          lowerTint: storeVisual.lowerTint,
          trimTint: storeVisual.trimTint,
          sashTint: storeVisual.sashTint,
          robeStyle: storeVisual.robeStyle
        });
        const bespokeRobe = createBespokeRobeGroup(THREE, {
          ...storeVisual,
          charKey,
          h: targetH,
          modelRoot: cloned
        });
        stageGroup.add(bespokeRobe);
        const accGroup = createStoreAccessoryGroup(THREE, storeVisual, {
          charKey,
          h: targetH,
          modelRoot: cloned,
          propMeshCache: this.world3d?.propMeshCache || null,
          fitPropFn: this.world3d ? (sc, sz, o) => this.world3d.fitProp(sc, sz, o) : null
        });
        stageGroup.add(accGroup);

        const norm = (s) =>
          String(s || '')
            .replace(/_world$/, '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toLowerCase()
            .trim();

        mixer = new THREE.AnimationMixer(cloned);
        const actions = {};
        const normActions = {};
        for (const clip of gltf.animations || []) {
          const clean = clip.name.replace(/_world$/, '');
          const act = mixer.clipAction(clip);
          actions[clean] = act;
          normActions[norm(clean)] = act;
        }
        const clip =
          actions[pose] ||
          normActions[norm(pose)] ||
          actions['Dung'] ||
          normActions['dung'] ||
          Object.values(actions)[0];
        if (clip) {
          clip.reset();
          if (pose === 'Quỳ' || pose === 'Chắp tay') {
            clip.setLoop(THREE.LoopOnce, 1);
            clip.clampWhenFinished = true;
            clip.play();
            mixer.setTime(pose === 'Quỳ' ? 2.4 : 1.35);
            mixer.update(0);
          } else {
            clip.setLoop(THREE.LoopRepeat, Infinity);
            clip.play();
            mixer.update(0.06);
          }
        }
      }

      let disposed = false;
      let dragging = false;
      let prevX = 0;
      const onDown = (e) => {
        dragging = true;
        prevX = e.clientX;
      };
      const onUp = () => {
        dragging = false;
      };
      const onMove = (e) => {
        if (!dragging) return;
        stageGroup.rotation.y += (e.clientX - prevX) * 0.012;
        prevX = e.clientX;
      };
      canvas.addEventListener('pointerdown', onDown);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointermove', onMove);

      this._profileStageDispose = () => {
        disposed = true;
        canvas.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointermove', onMove);
        renderer.dispose();
      };

      stageGroup.rotation.y = 0.18;
      renderer.render(scene, camera);

      const tick = () => {
        if (disposed || !document.body.contains(canvas)) {
          if (!disposed) this._profileStageDispose?.();
          return;
        }
        if (mixer) mixer.update(0.032);
        if (!dragging) stageGroup.rotation.y += 0.006;
        renderer.render(scene, camera);
        setTimeout(() => requestAnimationFrame(tick), 33);
      };
      tick();
    } catch {}
  }

  async mountArhat3DStage(canvasId, arhatIdx = 0) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (this._arhatStageDispose) {
      try {
        this._arhatStageDispose();
      } catch {}
      this._arhatStageDispose = null;
    }

    try {
      const THREE = await import('three');
      const wrap = canvas.parentElement;
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(240, rect.width || 280);
      const h = Math.max(240, rect.height || 280);

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 30);

      scene.add(new THREE.HemisphereLight(0xFFF6DF, 0x5C3A21, 1.45));
      const key = new THREE.DirectionalLight(0xFFE2A8, 1.75);
      key.position.set(2.4, 4.2, 3.2);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xF6C978, 0.72);
      rim.position.set(-2.4, 2.0, -2.5);
      scene.add(rim);

      const stageGroup = new THREE.Group();
      scene.add(stageGroup);

      const statue = createSculptedArhatShowcase(arhatIdx, THREE);
      const box = new THREE.Box3().setFromObject(statue);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);
      statue.position.set(-center.x, -box.min.y, -center.z);
      stageGroup.add(statue);

      const maxDim = Math.max(1.2, size.y, size.x * 1.15);
      camera.position.set(0, size.y * 0.56, maxDim * 2.15);
      camera.lookAt(0, size.y * 0.48, 0);

      let disposed = false;
      let dragging = false;
      let prevX = 0;
      const onDown = (e) => {
        dragging = true;
        prevX = e.clientX;
      };
      const onUp = () => {
        dragging = false;
      };
      const onMove = (e) => {
        if (!dragging) return;
        stageGroup.rotation.y += (e.clientX - prevX) * 0.012;
        prevX = e.clientX;
      };
      canvas.addEventListener('pointerdown', onDown);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointermove', onMove);

      this._arhatStageDispose = () => {
        disposed = true;
        canvas.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointermove', onMove);
        renderer.dispose();
      };

      stageGroup.rotation.y = 0.25;
      renderer.render(scene, camera);

      const tick = () => {
        if (disposed || !document.body.contains(canvas)) {
          if (!disposed) this._arhatStageDispose?.();
          return;
        }
        if (!dragging) stageGroup.rotation.y += 0.0065;
        renderer.render(scene, camera);
        setTimeout(() => requestAnimationFrame(tick), 33);
      };
      tick();
    } catch {}
  }

  /* ========================================================================
     THREE.JS INTERACTIVE 3D STAGE (Loads Real Rigged GLBs + 3D Shop Kiosk + 3D Items)
     ======================================================================== */
  async mountInteractive3DStage(canvasId, { item, charKey }) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    try {
      const THREE = await import('three');
      const rect = canvas.parentElement.getBoundingClientRect();
      const w = Math.max(240, rect.width || 320);
      const h = Math.max(220, rect.height || 260);

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
      camera.position.set(0, 0.65, 2.25);
      camera.lookAt(0, 0.22, 0);

      scene.add(new THREE.HemisphereLight(0xFFF9EA, 0x7A5A3A, 1.35));
      const dir = new THREE.DirectionalLight(0xffdf9e, 1.75);
      dir.position.set(3, 5, 4);
      scene.add(dir);
      const rim = new THREE.DirectionalLight(0xFFE4B0, 0.65);
      rim.position.set(-2.5, 2.4, -2.5);
      scene.add(rim);

      const ped = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.72, 0.08, 32),
        new THREE.MeshStandardMaterial({ color: 0xc8963e, roughness: 0.4, metalness: 0.4 })
      );
      ped.position.y = -0.38;
      scene.add(ped);

      const stageGroup = new THREE.Group();
      scene.add(stageGroup);

      const fitPropToPedestal = (sceneObj, targetSize) => {
        const clone = sceneObj.clone(true);
        const toRemove = [];
        clone.traverse((o) => {
          if (o.isMesh) {
            if (o.geometry && !o.geometry.getAttribute('normal')) {
              o.geometry.computeVertexNormals();
            }
            const cb = new THREE.Box3().setFromObject(o);
            const cs = new THREE.Vector3();
            cb.getSize(cs);
            if (Math.max(cs.x, cs.z) > 40 && cs.y < Math.max(cs.x, cs.z) * 0.08) {
              toRemove.push(o);
            }
          }
        });
        for (const rem of toRemove) {
          rem.parent?.remove(rem);
        }
        const box = new THREE.Box3().setFromObject(clone);
        const sz = new THREE.Vector3();
        const ctr = new THREE.Vector3();
        box.getSize(sz);
        box.getCenter(ctr);
        const maxDim = Math.max(0.05, sz.x, sz.y, sz.z);
        const s = targetSize / maxDim;
        clone.scale.setScalar(s);
        clone.position.x = -ctr.x * s;
        clone.position.z = -ctr.z * s;
        const box2 = new THREE.Box3().setFromObject(clone);
        clone.position.y = -box2.min.y;
        return clone;
      };

      // Instant procedural placeholder while/if real GLB loads
      let activeItemObj = this.build3DItemMesh(THREE, item?.procedural3dId || item?.id || 'non_la_theu_sen');
      if (charKey) {
        activeItemObj.position.set(0.32, -0.15, 0.18);
      } else {
        activeItemObj.position.set(0, -0.15, 0);
        activeItemObj.scale.setScalar(1.35);
      }
      stageGroup.add(activeItemObj);

      // Load real GLB asset if provided on catalog item
      if (item?.glb) {
        const loadGlbForPreview = async () => {
          let cachedScene = this.cachedGLBProps[item.glb];
          if (!cachedScene) {
            const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
            const loader = new GLTFLoader();
            const gltf = await loader.loadAsync(encodeURI(item.glb));
            if (gltf?.scene) {
              this.cachedGLBProps[item.glb] = gltf.scene;
              cachedScene = gltf.scene;
            }
          }
          if (!cachedScene || !document.body.contains(canvas)) return;
          const fitted = fitPropToPedestal(cachedScene, charKey ? 0.45 : 0.96);
          if (charKey) {
            fitted.position.x += 0.34;
            fitted.position.z += 0.16;
          }
          fitted.position.y -= 0.34;
          stageGroup.remove(activeItemObj);
          stageGroup.add(fitted);
          activeItemObj = fitted;
        };
        loadGlbForPreview().catch(() => {});
      }

      // Load rigged 3D character GLB if charKey specified
      if (charKey) {
        this.loadRiggedCharacterGLB(THREE, charKey).then((charMesh) => {
          if (charMesh && document.body.contains(canvas)) {
            stageGroup.add(charMesh);
          }
        });
      }

      let dragging = false;
      const isSoftPreview = (() => {
        try {
          const gl = renderer.getContext();
          const ext = gl?.getExtension('WEBGL_debug_renderer_info');
          const gpu = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
          return /SwiftShader|llvmpipe|softpipe|Software/i.test(gpu);
        } catch {
          return false;
        }
      })();
      let prevX = 0;
      const onDown = (e) => {
        dragging = true;
        prevX = e.clientX;
      };
      const onUp = () => {
        dragging = false;
      };
      const onMove = (e) => {
        if (!dragging) return;
        stageGroup.rotation.y += (e.clientX - prevX) * 0.012;
        prevX = e.clientX;
        if (isSoftPreview) renderer.render(scene, camera);
      };
      canvas.addEventListener('pointerdown', onDown);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointermove', onMove);

      let disposed = false;
      let rafId = null;
      let timerId = null;
      const cleanup = () => {
        if (disposed) return;
        disposed = true;
        if (timerId) clearTimeout(timerId);
        if (rafId) cancelAnimationFrame(rafId);
        canvas.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointermove', onMove);
        renderer.dispose();
        try {
          renderer.forceContextLoss?.();
        } catch {}
      };
      this._profileStageDispose = cleanup;

      const animate = () => {
        if (disposed || !document.body.contains(canvas)) {
          cleanup();
          return;
        }
        if (!dragging) stageGroup.rotation.y += 0.008;
        renderer.render(scene, camera);
        if (!isSoftPreview) {
          timerId = setTimeout(() => {
            if (!disposed) rafId = requestAnimationFrame(animate);
          }, 33);
        }
      };
      animate();
    } catch {}
  }

  buildStoreVisualPayload(profile = this.storeProfile) {
    return unifyEquippedVisualPayload(profile, this.spiritual);
  }

  syncStoreVisualsTo3D() {
    this.world3d?.applyStoreVisualsToPlayer?.(this.buildStoreVisualPayload(this.storeProfile));
  }

  openNineTabStoreModal(initialCategory = null) {
    if (initialCategory) {
      this.storeCategory = initialCategory;
    }
    this.storeTryOnPose = this.storeTryOnPose || 'Dung';

    const renderStoreBody = (preserveScrollTop = 0) => {
      const items = filterStoreItems(this.storeCategory);
      const profile = this.storeProfile;
      const activeVisual = this.buildStoreVisualPayload(profile);
      const tryingItem = profile.tryingItemId
        ? STORE_ITEMS_CATALOG.find((x) => x.id === profile.tryingItemId)
        : null;
      const activeProf =
        CHARACTER_PROFILES.find((c) => c.key === this.characterModelKey) || CHARACTER_PROFILES[0];
      const activeDressLabel = tryingItem
        ? `Đang mặc thử: ${tryingItem.name}`
        : activeVisual.robeName
        ? `Đang mặc: ${activeVisual.robeName}`
        : `Mặc định: ${activeProf.outfitName.split('(')[0].trim()}`;

      const html = `
        <div class="store-currency-bar">
          <div class="store-wallet-pills">
            <span class="store-wallet-pill">💎 <span id="store-gems-count">${profile.gems}</span></span>
            <span class="store-wallet-pill">🪷 <span id="store-lotus-count">${profile.lotusPoints}</span></span>
            <span class="store-wallet-pill">Cấp ${profile.level}</span>
          </div>
          <button type="button" class="store-physical-btn" id="btn-open-physical-shop">
            🛍️ Quà lưu niệm giao tận nhà
          </button>
        </div>

        <div class="store-tryon-preview">
          <div class="store-tryon-canvas-wrap">
            <canvas id="store-tryon-3d-canvas"></canvas>
          </div>
          <div class="store-tryon-meta">
            <div class="store-tryon-title">${activeDressLabel}</div>
            <div class="store-tryon-controls">
              ${CHARACTER_PROFILES.map(
                (c) => `
                <button type="button" class="store-tryon-mini-btn ${this.characterModelKey === c.key ? 'active' : ''}" data-store-char="${c.key}">
                  ${c.name.split('(')[0].replace('Phật tử ', '').trim()}
                </button>
              `
              ).join('')}
              <button type="button" class="store-tryon-mini-btn ${this.storeTryOnPose === 'Dung' ? 'active' : ''}" data-store-pose="Dung">Đứng</button>
              <button type="button" class="store-tryon-mini-btn ${this.storeTryOnPose === 'Chắp tay' ? 'active' : ''}" data-store-pose="Chắp tay">Chắp tay</button>
              ${
                tryingItem
                  ? `<button type="button" class="store-tryon-mini-btn" id="btn-store-clear-try">Bỏ thử</button>`
                  : ''
              }
            </div>
            <div style="font-size:11.5px;color:#5C4330;line-height:1.35;">
              Kéo hình 3D để xoay 360° · Bấm <strong>Mặc thử 3D</strong> hoặc <strong>Thỉnh / Mặc ngay</strong> để mặc trực tiếp lên nhân vật.
            </div>
          </div>
        </div>

        <div class="store-tabs-wrap" role="tablist">
          ${STORE_CATEGORIES.map(
            (cat) => `
            <button type="button" class="store-cat-pill ${
              this.storeCategory === cat.id ? 'active' : ''
            }" data-store-cat="${cat.id}">
              ${cat.label}
            </button>
          `
          ).join('')}
        </div>

        <div class="store-items-scroll" id="store-items-scroll">
          ${items
            .map((item) => {
              const ownedCount = profile.ownedCounts[item.id] || 0;
              const isEquipped = profile.equipped[item.slot] === item.id;
              const isPreviewing = profile.tryingItemId === item.id;
              const reqLevel = item.requiredLevel || 1;
              const levelLocked = profile.level < reqLevel;
              const showOwnedCount = item.stackable || item.category === 'cay_phat';

              const hasLotusMotif =
                item.id === 'ao_hoa_sen' ||
                item.id === 'ao_vu_lan_hong' ||
                item.id === 'ao_ba_ba_trang_sen';
              const hasCloudTrim = item.id === 'ao_may_bac' || item.id === 'ao_gam_le_hoi';
              const isBaBa = item.robeStyle?.startsWith('ba_ba');
              const isAoDai = item.robeStyle === 'dai_lam_le';
              const isVuLan = item.id === 'ao_vu_lan_hong';
              const isLam = item.id === 'ao_lam_truyen_thong' || item.id === 'ao_dai_lam_le_phat';
              const pantsColor = item.secondarySwatchHex || item.swatchHex;
              const trimColor = hasCloudTrim ? '#F5FAFF' : '#D99E3A';
              const thumbHtml = item.swatchHex
                ? `<div class="store-swatch-badge" style="background:linear-gradient(155deg,rgba(255,250,238,0.94),rgba(232,216,184,0.88));padding:4px;">
                    <svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true">
                      <path d="M22 44 L21 57 L30 57 L32 47 L34 57 L43 57 L42 44 Z" fill="${pantsColor}" stroke="#4A3222" stroke-width="1.6" stroke-linejoin="round"/>
                      <path d="M21 12 L10 22 L15 29 L21 24 L20 ${isAoDai ? '52' : isBaBa ? '42' : '48'} L44 ${isAoDai ? '52' : isBaBa ? '42' : '48'} L43 24 L49 29 L54 22 L43 12 L37 15 Q32 18 27 15 Z" fill="${item.swatchHex}" stroke="#4A3222" stroke-width="1.9" stroke-linejoin="round"/>
                      ${
                        isBaBa
                          ? `<path d="M32 18 L32 42" fill="none" stroke="${trimColor}" stroke-width="1.6"/>`
                          : `<path d="M27 15 L32 23 L32 48" fill="none" stroke="${trimColor}" stroke-width="1.8"/>`
                      }
                      <circle cx="33.8" cy="24" r="1.15" fill="${trimColor}"/>
                      <circle cx="33.8" cy="29" r="1.15" fill="${trimColor}"/>
                      <circle cx="33.8" cy="34" r="1.15" fill="${trimColor}"/>
                      ${
                        isVuLan
                          ? '<circle cx="39" cy="25" r="2.8" fill="#E6396A" stroke="#FFF4F7" stroke-width="0.9"/>'
                          : hasLotusMotif
                          ? '<path d="M37 40 Q40 34 43 40 Q40 42.5 37 40 Z" fill="#FFF3F8" stroke="#B83B68" stroke-width="0.9"/>'
                          : hasCloudTrim
                          ? '<path d="M23 40 Q26 37 29 40" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>'
                          : isLam
                          ? '<circle cx="39.5" cy="25" r="2.2" fill="none" stroke="#F4D378" stroke-width="1.1"/>'
                          : ''
                      }
                    </svg>
                  </div>`
                : item.thumbIcon
                ? `<div class="store-swatch-badge" style="background:rgba(255,246,229,0.12);border-color:rgba(246,205,114,0.45);font-size:28px;">${item.thumbIcon}</div>`
                : `<img src="${item.image}" alt="${item.name}" />`;

              const priceIcon = item.currency === 'gem' ? '💎' : '🪷';
              let priceLabel = `${priceIcon} Thỉnh ${item.price}`;
              let priceClass = item.currency === 'lotus' && levelLocked ? 'lotus-locked' : '';
              if (ownedCount > 0 && !item.stackable) {
                priceLabel = isEquipped ? '✓ Đang mặc' : 'Mặc ngay';
                if (isEquipped) priceClass = 'owned-equipped';
              }

              return `
                <article class="store-item-card ${isPreviewing ? 'previewing' : ''}" data-store-item-id="${item.id}">
                  <div class="store-item-thumb">${thumbHtml}</div>
                  <div class="store-item-info">
                    <div class="store-item-title-row">
                      <span class="store-item-name">${item.name}</span>
                      ${showOwnedCount ? `<span class="store-owned-count">(có ${ownedCount})</span>` : ''}
                      ${item.rare ? `<span class="store-rare-badge">Hiếm</span>` : ''}
                    </div>
                    <div class="store-item-desc">${item.description}</div>
                    ${
                      item.elderBenefit
                        ? `<div class="store-elder-benefit">✨ ${item.elderBenefit}</div>`
                        : ''
                    }
                    ${
                      levelLocked
                        ? `<div class="store-level-lock">🔒 Cần cấp ${reqLevel} (lạy Phật &amp; ghé chùa để lên cấp)</div>`
                        : ''
                    }
                  </div>
                  <div class="store-item-actions">
                    ${
                      item.tryable
                        ? `<button type="button" class="store-try-btn ${isPreviewing ? 'active' : ''}" data-try-id="${item.id}">
                            ${isPreviewing ? '✓ Đang mặc thử' : '✨ Mặc thử 3D'}
                          </button>`
                        : ''
                    }
                    <button type="button" class="store-price-btn ${priceClass}" data-buy-id="${item.id}">
                      ${priceLabel}
                    </button>
                  </div>
                </article>
              `;
            })
            .join('')}
        </div>
      `;

      this.openModal('Cửa hàng', html, { variant: 'store' });

      this.mountProfileCharacterStage('store-tryon-3d-canvas', {
        charKey: this.characterModelKey,
        pose: this.storeTryOnPose || 'Dung'
      });

      const scrollEl = document.getElementById('store-items-scroll');
      if (scrollEl && preserveScrollTop > 0) {
        scrollEl.scrollTop = preserveScrollTop;
      }

      document.getElementById('btn-open-physical-shop')?.addEventListener('click', () => {
        this.closeModal();
        this.switchScreen('shop');
      });

      document.querySelectorAll('[data-store-char]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const ck = btn.getAttribute('data-store-char') || 'nu';
          this.characterModelKey = ck;
          this.world3d?.switchCharacter(ck);
          this.syncStoreVisualsTo3D();
          this.saveState();
          this.updateEquippedTags();
          renderStoreBody(document.getElementById('store-items-scroll')?.scrollTop || 0);
        });
      });

      document.querySelectorAll('[data-store-pose]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.storeTryOnPose = btn.getAttribute('data-store-pose') || 'Dung';
          renderStoreBody(document.getElementById('store-items-scroll')?.scrollTop || 0);
        });
      });

      document.getElementById('btn-store-clear-try')?.addEventListener('click', () => {
        this.storeProfile.tryingItemId = null;
        this.syncStoreVisualsTo3D();
        renderStoreBody(document.getElementById('store-items-scroll')?.scrollTop || 0);
      });

      document.querySelectorAll('[data-store-cat]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const catId = btn.getAttribute('data-store-cat');
          if (catId) {
            this.storeCategory = catId;
            renderStoreBody(0);
          }
        });
      });

      document.querySelectorAll('[data-try-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const itemId = btn.getAttribute('data-try-id');
          if (!itemId) return;
          const prevScroll = document.getElementById('store-items-scroll')?.scrollTop || 0;
          const res = tryOnStoreItem(this.storeProfile, itemId);
          this.storeProfile = res.state;
          this.syncStoreVisualsTo3D();
          this.playMokugyoTap();
          if (res.previewing && res.item) {
            this.showToast(
              `✨ Đang mặc thử 3D: ${res.item.name}`,
              'Cô bác xoay khung 3D ngay phía trên hoặc đóng Cửa hàng để ngắm trên sân chùa nhé!',
              3400
            );
          }
          renderStoreBody(prevScroll);
        });
      });

      document.querySelectorAll('[data-buy-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const itemId = btn.getAttribute('data-buy-id');
          if (!itemId) return;
          const prevScroll = document.getElementById('store-items-scroll')?.scrollTop || 0;
          const res = purchaseStoreItem(this.storeProfile, itemId);
          this.storeProfile = res.state;
          if (!res.ok) {
            this.showToast('Chưa đủ điểm Sen hoặc Ngọc', `${res.message} Cô bác hãy vào Hành trình -> Nhiệm vụ để nhận thêm nhé!`, 4200);
            return;
          }
          if (res.item?.slot === 'robe') {
            this.spiritual.equippedItems.outfit = res.equippedNow ? null : 'ao_trang_phat_tu';
          }
          if (itemId === 'non_la_theu_sen_store') {
            this.spiritual.equippedItems.hat = res.equippedNow ? 'non_la_theu_sen' : null;
          }
          this.saveState();
          this.syncStoreVisualsTo3D();
          this.updateEquippedTags();
          this.playBellTone(324, 1.8);
          this.showToast(res.equippedNow ? '🪷 Đã mặc lên nhân vật 3D' : '📦 Đã cất vào tủ đồ', res.message, 3600);
          renderStoreBody(prevScroll);
        });
      });
    };

    renderStoreBody(0);
  }

  /* ========================================================================
     NHÀ TẠP HÓA CỔNG CHÙA MODAL (Brick-and-Mortar Grocery House UI)
     ======================================================================== */
  openMarketplaceStallModal(
    initialCategory = null,
    stallTitle = 'Nhà Tạp Hóa Cổng Chùa Vĩnh Tràng'
  ) {
    if (initialCategory) {
      this.marketStallTab = initialCategory;
    }

    const renderMarketBody = () => {
      const items = filterMarketplaceItems(this.marketStallTab);
      const cartSummary = calculateCartSummary(this.cart);

      const html = `
        <div class="market-stall-banner">
          <div>
            <div style="font-size:15px;font-weight:800;color:#5C381F;">Nhà Tạp Hóa Cổng Phụ · Đường Nguyễn Trung Trực, Mỹ Tho</div>
            <div style="font-size:13px;color:#4A3222;margin-top:2px;">
              Đầy đủ nhang đèn, hoa sen, thủ công truyền thống, nước dừa xiêm tủ mát và bánh chay Nam Bộ (${MARKETPLACE_STALL_CATALOG.length} mặt hàng).
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <span class="market-wallet-chip">🪷 <strong id="market-lotus-count">${this.storeProfile.lotusPoints}</strong> điểm sen</span>
            <button type="button" id="btn-market-open-cart" class="market-cart-pill">
              🛒 Giỏ hàng (<span id="market-cart-count">${cartSummary.totalCount}</span>)
            </button>
            <button type="button" id="btn-market-to-store" class="market-secondary-pill">
              Tủ đồ 3D (9 mục)
            </button>
          </div>
        </div>

        <div class="market-tabs-row" role="tablist">
          ${MARKETPLACE_STALL_CATEGORIES.map(
            (cat) => `
            <button type="button" class="market-tab-pill ${
              this.marketStallTab === cat.id ? 'active' : ''
            }" data-market-tab="${cat.id}">
              <span>${cat.icon}</span>
              <span>${cat.label}</span>
            </button>
          `
          ).join('')}
        </div>

        <div class="market-items-grid">
          ${items
            .map(
              (item) => `
            <article class="market-item-card" data-market-item-id="${item.id}">
              <div class="market-item-top">
                <div class="market-item-icon">
                  ${
                    item.image
                      ? `<img src="${item.image}" alt="${item.name}" class="market-item-thumb-img" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline';" /><span class="market-item-fallback-emoji" style="display:none;">${item.icon}</span>`
                      : `<span>${item.icon}</span>`
                  }
                </div>
                <div style="flex:1;min-width:0;">
                  <div class="market-item-title">${item.name}</div>
                  <div class="market-item-prices">
                    <span class="market-price-vnd">${item.priceVnd.toLocaleString('vi-VN')}đ</span>
                    <span class="market-price-lotus">🪷 ${item.lotusCost}</span>
                  </div>
                </div>
              </div>
              <p class="market-item-desc">${item.desc}</p>
              <div class="market-item-actions">
                <button type="button" class="market-btn-use" data-market-use="${item.id}">
                  ${
                    item.actionType === 'ritual_incense' || item.actionType === 'ritual_lotus'
                      ? 'Thỉnh dùng lễ ngay'
                      : 'Thỉnh tại quầy'
                  }
                </button>
                <button type="button" class="market-btn-cart" data-market-cart="${item.id}">
                  + Thêm vào giỏ
                </button>
              </div>
            </article>
          `
            )
            .join('')}
        </div>
      `;

      this.openModal(stallTitle || 'Nhà Tạp Hóa Cổng Chùa Vĩnh Tràng', html);

      document.querySelectorAll('[data-market-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const tab = btn.getAttribute('data-market-tab');
          if (tab) {
            this.marketStallTab = tab;
            renderMarketBody();
          }
        });
      });

      document.getElementById('btn-market-open-cart')?.addEventListener('click', () => {
        this.openCartModal();
      });

      document.getElementById('btn-market-to-store')?.addEventListener('click', () => {
        this.openNineTabStoreModal();
      });

      document.querySelectorAll('[data-market-use]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-market-use');
          if (!id) return;
          const res = purchaseMarketplaceItem(
            this.storeProfile,
            this.spiritual,
            this.cart,
            id,
            'use_now'
          );
          if (!res.ok) {
            this.showToast('Chưa đủ điểm sen', res.message, 3600);
            return;
          }
          this.storeProfile = res.storeProfile;
          this.spiritual = res.spiritual;
          this.cart = res.cart;
          if (res.item?.offeringType === 'incense' || res.item?.actionType === 'ritual_incense') {
            this.world3d?.setIncenseBoost(true);
          } else if (res.item?.offeringType === 'lotus' || res.item?.actionType === 'ritual_lotus') {
            this.world3d?.placeLotusOfferingIn3D();
          }
          this.saveState();
          this.updateActionBadges();
          this.playBellTone(324, 1.8);
          this.showToast('🪷 Đã thỉnh lễ phẩm tại sạp', res.message, 3800);
          renderMarketBody();
        });
      });

      document.querySelectorAll('[data-market-cart]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-market-cart');
          if (!id) return;
          const res = purchaseMarketplaceItem(
            this.storeProfile,
            this.spiritual,
            this.cart,
            id,
            'cart'
          );
          if (!res.ok) return;
          this.cart = res.cart;
          this.saveState();
          this.updateActionBadges();
          this.playMokugyoTap();
          this.showToast('🛍️ Đã thêm vào giỏ quà lưu niệm', res.message, 3200);
          renderMarketBody();
        });
      });
    };

    renderMarketBody();
  }

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
  }

  closeModal() {
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
  }

  bindEvents() {
    document.getElementById('btn-brand-home')?.addEventListener('click', () => {
      this.switchScreen('courtyard');
      if (this.world3d?.insideInterior) {
        this.toggleInteriorHallIn3D(false);
      }
      this.walkToStationIn3D('chanh_dien');
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

    // Interior Chữ Quốc 6-hall + Trai Đường quick navigation bar + Cutaway & Historical Source modal
    document.querySelectorAll('[data-interior-zone]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const zone = btn.getAttribute('data-interior-zone');
        if (!zone || !this.world3d) return;
        this.world3d.goToInteriorZone(zone);
        this.highlightInteriorZoneChip(zone);
        const zoneNotes = {
          tien_duong: ['1. Tiền đường · Khu Tiếp Đón', 'Hoành phi Tiền đường, Ban Hộ Pháp Vi Đà & Ban Tiêu Diện dưới hàng vòm Á–Âu.'],
          chanh_dien: ['2. Chánh điện · Tam Bảo', 'Tôn tượng Tam Bảo, cặp Long Trụ rồng cuốn, Bao lam chạm lọng thếp vàng & 18 vị La Hán.'],
          non_bo_giua: ['3. Sân Thiên Tỉnh 1 (Giếng trời)', 'Khoảng sân giếng trời thoáng sáng với Hòn Non Bộ, thác nước và đàn cá Koi.'],
          khu_tho: ['4. Nhà Tổ · Hậu Tổ Đường', 'Nơi tôn thờ Chư Vị Tổ Sư khai sơn tạo tự, Ban Quán Thế Âm & Ban Địa Tạng.'],
          san_thien_tinh_2: ['5. Sân Thiên Tỉnh 2 (Giếng trời)', 'Khoảng sân giếng trời nối Nhà Tổ với Nhà Hậu, tiểu cảnh sen đá & hành lang gỗ.'],
          nha_hau: ['6. Nhà Hậu · Khu Thờ Tự Phía Sau', 'Không gian thờ tự & sinh hoạt phía sau khép kín mặt bằng chữ Quốc (國).'],
          trai_duong: ['🍚 Nhà Sàn Gỗ Trai Đường', 'Khu ăn chay Phật tử dựng bằng gỗ căm xe trên sàn cọc miền Tây bên hồ sen.']
        };
        const msg = zoneNotes[zone];
        if (msg) this.showToast(msg[0], msg[1], 3800, false);
      });
    });
    document.getElementById('btn-interior-cutaway')?.addEventListener('click', () => {
      if (!this.world3d) return;
      const on = this.world3d.setInteriorCutaway();
      const btn = document.getElementById('btn-interior-cutaway');
      if (btn) btn.classList.toggle('active', on);
      this.showToast(
        on ? '✂️ Đang bật Mặt cắt Kiến trúc 3D' : '🏛️ Trở lại góc nhìn tham quan trực tiếp',
        on
          ? 'Ẩn trần mái & vách Tây để quan sát trọn vẹn mặt bằng Chữ Quốc (國), hệ vì kèo gỗ, Long Trụ và 2 Sân Thiên Tỉnh.'
          : 'Đã khôi phục mái ngói và tường bao nguyên bản bên trong Chùa Chính.',
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
      const st = this.nearbyStallTrigger;
      this.openMarketplaceStallModal(
        st?.stallType || 'huong_hoa',
        st?.title || 'Nhà Tạp Hóa Cổng Chùa Vĩnh Tràng'
      );
    });
    document.getElementById('btn-skip-entrance-tour')?.addEventListener('click', () => {
      this.world3d?.cancelEntranceTour();
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
    document.getElementById('btn-an-mini-map')?.addEventListener('click', () => {
      this.openExploreModal('stations');
    });
    document.getElementById('btn-an-station-action')?.addEventListener('click', () => {
      this.triggerAnStationAction();
    });
    document.getElementById('btn-an-teleport-here')?.addEventListener('click', () => {
      this.teleportToStationIn3D(this.activeStationKey || 'chanh_dien');
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
      const dir = keyMap[e.code];
      if (dir && this.activeScreen === 'courtyard') {
        e.preventDefault();
        this.world3d?.setHeldDirection(dir, true);
        if (!e.repeat) {
          this.handleMoveDirection(dir);
        }
      } else if (e.code === 'KeyE' && this.activeScreen === 'courtyard' && this.nearbyStallTrigger) {
        e.preventDefault();
        this.openMarketplaceStallModal(
          this.nearbyStallTrigger.stallType || 'huong_hoa',
          this.nearbyStallTrigger.title || 'Sạp Hàng Cổng Chùa Vĩnh Tràng'
        );
      } else if (e.code === 'Escape') {
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
    document.getElementById('btn-lecture-daily-dharma')?.addEventListener('click', () => this.showDailyDharmaModal({ markSeenToday: false }));
    document.getElementById('btn-lecture-textbooks')?.addEventListener('click', () => this.openTextbooksModal());
    document.getElementById('btn-lecture-recordings')?.addEventListener('click', () => this.openAudioRecordingsModal());
    document.querySelectorAll('[data-lecture-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-lecture-tab');
        if (tab) {
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
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new ChuaOnlineApp();
  window.chuaApp = app;
  app.init();
});
