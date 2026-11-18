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
  decodeProfileBackupCode,
  PILGRIM_RANKS,
  getPilgrimRankInfo,
  grantPlayerXp,
  COURTYARD_LEAF_SPOTS,
  collectCourtyardTask,
  TEMPLE_GARDEN_SPECIES,
  TEMPLE_GARDEN_SLOTS,
  plantGardenTree,
  waterGardenSlot,
  harvestGardenSlot,
  scoreBellRhythmHit,
  completeBellRhythmSession,
  HERITAGE_RELICS,
  discoverHeritageRelic,
  NATIONALITY_PROFILES,
  getNationalityProfile,
  PILGRIMAGE_MODES,
  getPilgrimageMode,
  THIRTY_DAY_RETREATS,
  THIRTY_DAY_JOURNEY_PLAN,
  getThirtyDayTheme,
  LUNAR_FESTIVAL_CALENDAR,
  getTempleSeasonalContext,
  HOA_DANG_WISHES,
  createHoaDangLantern,
  DHARMA_JOURNAL_MOODS,
  DHARMA_JOURNAL,
  createDharmaJournalState,
  addJournalEntry,
  ACADEMY_COURSES,
  ACADEMY_ALL_IN_BUNDLE,
  ACADEMY_MODULES,
  getAcademyExamQuestions,
  gradeAcademyExam,
  createAcademyEntitlementState,
  unlockAcademyCourseWithCode,
  buildVietQRPayload,
  generateAcademyCertificate,
  BLESSING_TOWER_CATEGORIES,
  createBlessingTowerState,
  registerBlessingTowerPrayer
} from '/src/logic/chua-online-logic.mjs';
import { VinhTrang3DWorld } from '/src/app/vinh-trang-3d-world.mjs';
import { TempleAudioEngine } from '/src/app/audio-engine.mjs';
import {
  recolorGarmentOnScene,
  clearRiggedBoneProps,
  createBespokeRobeGroup,
  createStoreAccessoryGroup,
  createSculptedArhatShowcase
} from '/src/app/garment-and-showcase-3d.mjs';

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
  { id: 's6_hoi_huong', title: 'Kệ Hồi Hướng Công Đức Viên Mãn', file: 's6_hoi_huong.mp3', duration: '02:15' },
  { id: 's6_ke_1', title: 'Kệ Thiền Chánh Niệm — Khai Tâm Nhập Môn', file: 's6_ke_1.mp3', duration: '01:25' }
];

export class ChuaOnlineApp {
  constructor() {
    this.saved = this.loadState();
    this.playerPos = { x: 35.5, z: 50.8, yaw: Math.PI - 0.16, moving: false };
    this.nearbyStallTrigger = null;
    this.nearbyInteractPrompt = null;
    this._lastChanhDienBellAt = 0;
    this.entranceTourActive = false;
    this.arrivalCutsceneActive = false;
    this.spiritual = createSpiritualState(this.saved.spiritual);
    this.storeProfile = createStoreProfileState(this.saved.storeProfile);
    this.activityHub = ensureDailyMissionDate(createActivityHubState(this.saved.activityHub));
    this.goalsTrackerCollapsed =
      typeof this.saved.goalsTrackerCollapsed === 'boolean'
        ? this.saved.goalsTrackerCollapsed
        : typeof window !== 'undefined' && window.innerWidth <= 768;
    this.timeOfDay = TIME_OF_DAY_PRESETS[this.saved.timeOfDay] ? this.saved.timeOfDay : 'morning';
    this.elderFontScale = ['normal', 'large', 'xlarge'].includes(this.saved.elderFontScale)
      ? this.saved.elderFontScale
      : 'normal';
    this.readAlongRate = this.saved.readAlongRate === 0.85 ? 0.85 : 1.0;
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
    this.characterModelKey = CHARACTER_PROFILES.some((c) => c.key === this.saved.characterModelKey)
      ? this.saved.characterModelKey
      : 'nu';
    this.nationalityId = NATIONALITY_PROFILES.some((n) => n.id === this.saved.nationalityId)
      ? this.saved.nationalityId
      : 'vn';
    this.pilgrimageModeId = PILGRIMAGE_MODES.some((m) => m.id === this.saved.pilgrimageModeId)
      ? this.saved.pilgrimageModeId
      : 'solo';
    this.arrivalCompleted = Boolean(this.saved.arrivalCompleted);
    this.hoaDangWishes =
      Array.isArray(this.saved.hoaDangWishes) && this.saved.hoaDangWishes.length > 0
        ? this.saved.hoaDangWishes
        : [...HOA_DANG_WISHES];
    this.blessingTower = createBlessingTowerState(this.saved.blessingTower);
    this.dharmaJournal = createDharmaJournalState(this.saved.dharmaJournal);
    this.academyState = createAcademyEntitlementState(this.saved.academyState);
    this.activeCourseId = ACADEMY_COURSES.some((c) => c.id === this.saved.activeCourseId)
      ? this.saved.activeCourseId
      : 'course_1_khai_tam';
    this.activeModuleId = this.saved.activeModuleId || null;
    this.practicedDays = Array.isArray(this.saved.practicedDays) ? [...this.saved.practicedDays] : [1];
    this.studentName = String(this.saved.studentName || 'Phật tử Tâm An').trim() || 'Phật tử Tâm An';

    this.uploadedUserPhotoDataUrl = this.saved.uploadedUserPhotoDataUrl || null;
    this.lastDailyDharmaDate = this.saved.lastDailyDharmaDate || null;
    this.lastDailyDharmaQuoteId = this.saved.lastDailyDharmaQuoteId || null;
    this.dailyDharmaQuotes = [];
    this.activeStationKey = 'cong_tam_quan';

    // Active screen & sub-views
    this.activeScreen = 'courtyard'; // 'courtyard' | 'shop' | 'lecture'
    this.shopTab = 'souvenir'; // 'souvenir' | 'study' | '3d'
    this.lectureTab = 'lesson'; // 'listen' | 'lesson' | 'package'
    this.activePathId = 'A';
    this.activeLessonId = 'A1';
    this.selectedQuizOption = null;
    this.quizFeedback = null;
    this.quizNotice = null;
    this.autoWalkObjective = null;

    // Unified TempleAudioEngine (replaces raw Audio + AudioContext)
    const savedMixer = this.saved.audioMixer && typeof this.saved.audioMixer === 'object' ? this.saved.audioMixer : {};
    this.audio = new TempleAudioEngine({
      masterVolume: savedMixer.masterVolume ?? 1.0,
      ambientVolume: savedMixer.ambientVolume ?? 0.45,
      sfxVolume: savedMixer.sfxVolume ?? 0.85,
      voiceVolume: savedMixer.voiceVolume ?? 0.9,
      muted: Boolean(savedMixer.muted),
      onVoiceStateChange: ({ playing, fileName }) => {
        this.audioPlaying = Boolean(playing);
        if (fileName) this.currentAudioFile = fileName;
        if (this.activeScreen === 'lecture') this.renderLectureStage();
      },
      onSpeechStateChange: ({ speaking }) => {
        this.ttsSpeaking = Boolean(speaking);
        if (this.activeScreen === 'lecture') this.renderLectureStage();
      }
    });
    this.audioPlaying = false;
    this.audioMuted = Boolean(savedMixer.muted);
    this.currentAudioFile = 's3_giang_duong.mp3';

    // 3D World & Canvas references
    this.world3d = null;
    this.backdropImg = null;
    this.particles = [];
    this.is3DWorldOpen = true;
    this.toastTimer = null;
    this.cachedGLBCharacters = {};
    this.cachedGLBProps = {};
    this._profileStageDispose = null;
    this._arhatStageDispose = null;
    this._interactiveStageDispose = null;
    this.audio?.setVoicePlaybackRate?.(this.readAlongRate || 1.0);
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
          goalsTrackerCollapsed: this.goalsTrackerCollapsed,
          timeOfDay: this.timeOfDay,
          elderFontScale: this.elderFontScale,
          readAlongRate: this.readAlongRate,
          cart: this.cart,
          completedLessons: Array.from(this.completedLessons),
          orders: this.orders,
          ugcGallery: this.ugcGallery.slice(0, 12),
          characterModelKey: this.characterModelKey,
          nationalityId: this.nationalityId,
          pilgrimageModeId: this.pilgrimageModeId,
          arrivalCompleted: this.arrivalCompleted,
          hoaDangWishes: this.hoaDangWishes.slice(0, 48),
          blessingTower: this.blessingTower,
          dharmaJournal: this.dharmaJournal,
          academyState: this.academyState,
          activeCourseId: this.activeCourseId,
          activeModuleId: this.activeModuleId,
          practicedDays: this.practicedDays.slice(0, 30),
          studentName: this.studentName,
          audioMixer: this.audio ? this.audio.getMixerState() : undefined,
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
    this.updateAudioMixerUI();
    this.bindEvents();
    this.renderShopProducts();
    this.renderLectureStage();
    this.updateActionBadges();

    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      this.world3d?.skipArrivalCutscene?.(true);
      this.syncPilgrimageCompanionsTo3D();
    } else if (!this.arrivalCompleted || params.get('arrival') === '1') {
      this.openArrivalPilgrimageModal();
    } else {
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
        readAlongRate: this.readAlongRate,
        nationalityId: this.nationalityId,
        pilgrimageModeId: this.pilgrimageModeId,
        activeGuidedBeacon: this.activeGuidedBeacon,
        activeStationKey: this.activeStationKey,
        shopTab: this.shopTab,
        lectureTab: this.lectureTab,
        activeCourseId: this.activeCourseId,
        activeLessonId: this.activeLessonId,
        characterModelKey: this.characterModelKey,
        audioMuted: this.audioMuted,
        audioMixer: this.audio?.getMixerState?.() || null,
        hoaDangCount: this.hoaDangWishes.length,
        blessingTowerCount: this.blessingTower?.entries?.length || 0,
        journalCount: this.dharmaJournal?.entries?.length || 0,
        academyUnlockedCourses: this.academyState?.unlockedCourses || [],
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
        arrivalCutsceneActive: Boolean(this.world3d?.arrivalCutscene?.active),
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
          <button type="button" class="walk-chip-btn interior-exit-chip" id="btn-interior-exit-courtyard">← Ra Lối Góc Phải</button>
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

  /* ========================================================================
     LIVE WALKABLE 3D WORLD INITIALIZATION (Default Viewport)
     ======================================================================== */
  initLive3DWorld() {
    const canvas = document.getElementById('world3d-canvas');
    if (!canvas) return;

    this.world3d = new VinhTrang3DWorld(canvas, {
      initialCharKey: this.characterModelKey,
      onStepSound: (surface) => {
        this.audio?.playFootstep?.(surface === 'interior' ? 'wood' : surface);
      },
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
        this.tryAutoDiscoverHeritageByStation(station.key, { silent: true });
        if (station.key === 'chanh_dien' && typeof dist === 'number' && dist < 12.5 && !this.world3d?.insideInterior) {
          this.playChanhDienBellCadence();
        }
      },
      onStallProximity: (stall) => {
        this.nearbyStallTrigger = stall || null;
        this.refreshProximityPrompt();
      },
      onInteractProximity: (prompt) => {
        this.nearbyInteractPrompt = prompt || null;
        this.refreshProximityPrompt();
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
        this.tryAutoDiscoverHeritageByStation(station.key, { silent: false });
        this.saveState();
        this.updateActionBadges();
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
        this.syncTempleWorldGameplayState();
        this.syncPilgrimageCompanionsTo3D();
        this.syncHoaDangLanternsTo3D();
        this.syncBlessingTowerTo3D();
      },
      onTransitionFade: (active) => {
        const veil = document.getElementById('temple-transition-veil');
        if (veil) veil.classList.toggle('active', Boolean(active));
      },
      onInteriorZoneChange: (zoneKey) => {
        this.highlightInteriorZoneChip(zoneKey);
        if (zoneKey === 'chanh_dien') {
          this.tryAutoDiscoverHeritageById('relic_long_tru', { silent: false });
        } else if (zoneKey === 'hanh_lang_trai' || zoneKey === 'khu_tho') {
          this.tryAutoDiscoverHeritageById('relic_bat_bo_la_han', { silent: false });
          this.tryAutoDiscoverHeritageById('relic_to_dat_ma', { silent: false });
        }
      },
      onInteriorStateChange: (inside) => {
        const pinsLayer = document.getElementById('scene-pins-layer');
        const btn = document.getElementById('btn-toggle-interior-hall');
        const zoneBar = document.getElementById('interior-zone-bar');
        const goalsTracker = document.getElementById('daily-goals-tracker');
        this.audio?.setAmbientZone?.(inside ? 'interior' : 'exterior');
        if (pinsLayer) pinsLayer.style.display = inside ? 'none' : 'block';
        if (zoneBar) zoneBar.style.display = inside ? 'flex' : 'none';
        if (goalsTracker) goalsTracker.style.display = inside ? 'none' : 'block';
        if (inside) {
          this.nearbyStallTrigger = null;
          this.syncBlessingTowerTo3D();
          this.refreshProximityPrompt();
          if (btn) {
            btn.classList.add('active');
            btn.innerHTML = '← Ra Lối Góc Phải';
          }
          this.highlightInteriorZoneChip(this.world3d?.getInteriorZoneKey() || 'day_ban_tho_phai');
          const cutBtn = document.getElementById('btn-interior-cutaway');
          if (cutBtn) cutBtn.classList.toggle('active', Boolean(this.world3d?.interiorCutaway));
          this.spiritual = recordSpiritualMilestone(this.spiritual, 'Vào bên trong Chùa Chính');
          this.tryAutoDiscoverHeritageById('relic_long_tru', { silent: true });
          this.saveState();
          this.updateActionBadges();
          this.playBellTone(216, 2.6);
          this.showToast(
            'Lối Góc Dưới Bên Phải · Hành Trình Hình Vuông',
            'Đi thẳng qua Tượng Phật Nghìn Mắt Nghìn Tay & Chỗ Ngủ Của Phật, vòng theo hình vuông quanh Hồ Sen Bộ giữa chùa để lên cạnh trên lễ Phật tại Chính Điện.',
            5600,
            false
          );
        } else {
          const cutBtn = document.getElementById('btn-interior-cutaway');
          if (cutBtn) cutBtn.classList.remove('active');
          if (btn) {
            btn.classList.remove('active');
            btn.innerHTML = '🚪 Vào Lối Góc Phải';
          }
          this.refreshProximityPrompt();
          this.showToast(
            'Ra lối góc dưới bên phải',
            'Bạn đã bước ra khỏi hành lang bên phải, trở lại khuôn viên sân chùa.',
            3200
          );
        }
      },
      onObjectClick: (action, payload) => {
        if (action === 'ENTER_INTERIOR') {
          this.toggleInteriorHallIn3D(true);
        } else if (action === 'OPEN_BLESSING_TOWER') {
          this.openBlessingTowerModal();
        } else if (action === 'PRAY_NGHIN_MAT_NGHIN_TAY') {
          this.prayAtRightGalleryShrine('nghin_mat_nghin_tay');
        } else if (action === 'PRAY_CHO_NGU_CUA_PHAT') {
          this.prayAtRightGalleryShrine('cho_ngu_cua_phat');
        } else if (action === 'RING_CHUONG_CHANH_DIEN') {
          this.ringChanhDienBellInApp();
        } else if (action === 'STRIKE_TRONG_BAT_NHA') {
          this.strikeTrongBatNhaInApp();
        } else if (action === 'OPEN_ARHAT') {
          this.tryAutoDiscoverHeritageById('relic_bat_bo_la_han', { silent: true });
          this.openExploreModal('arhats', Number.isFinite(payload?.arhatIndex) ? payload.arhatIndex : 0);
        } else if (action === 'COLLECT_LEAF') {
          this.collectCourtyardLeafInApp(payload?.leafId);
        } else if (action === 'OPEN_GARDEN_PLOT') {
          this.openTempleGardenModal(Number.isFinite(payload?.slotIndex) ? payload.slotIndex : 0);
        } else if (action === 'OPEN_HOA_DANG') {
          this.openHoaDangModal();
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
          this.tryAutoDiscoverHeritageById('relic_dai_hong_chung', { silent: true });
          this.playBellTone(174, 4.2);
          setTimeout(() => this.playBellTone(174, 3.6), 950);
          this.spiritual = recordSpiritualMilestone(this.spiritual, 'Thỉnh Đại Hồng Chung tại Lầu Chuông');
          this.grantPilgrimXp(10, 'Thỉnh Đại Hồng Chung');
          this.saveState();
          this.updateActionBadges();
          this.openBellRhythmModal();
        } else if (action === 'TOAST' && payload) {
          this.spiritual = recordSpiritualMilestone(this.spiritual, payload.title || 'Chiêm bái khuôn viên chùa');
          const tLower = String(payload.title || '').toLowerCase();
          if (tLower.includes('quán thế âm') || tLower.includes('quan âm')) {
            this.tryAutoDiscoverHeritageById('relic_quan_am', { silent: true });
          } else if (tLower.includes('bảo tháp')) {
            this.tryAutoDiscoverHeritageById('relic_bao_thap', { silent: true });
          } else if (tLower.includes('tổ đạt ma') || tLower.includes('tổ đường')) {
            this.tryAutoDiscoverHeritageById('relic_to_dat_ma', { silent: true });
          }
          this.saveState();
          this.updateActionBadges();
          this.showToast(payload.title, payload.desc, 4800, true);
        }
      }
    });

    this.world3d.init();

    window.addEventListener('resize', () => {
      this.resizeFXCanvas();
    });
  }

  syncTempleWorldGameplayState() {
    if (!this.world3d?.setTempleStateSync) return;
    const todayKey = getLocalDateKey();
    this.activityHub = ensureDailyMissionDate(this.activityHub, todayKey);
    this.world3d.setTempleStateSync({
      collectedLeafIds: this.activityHub?.courtyardTasks?.collectedIds || [],
      gardenSlots: this.activityHub?.templeGarden || []
    });
  }

  refreshProximityPrompt() {
    const btn = document.getElementById('stall-proximity-btn');
    const iconEl = document.getElementById('stall-proximity-icon');
    const labelEl = document.getElementById('stall-proximity-label');
    if (!btn || !labelEl) return;

    if (this.nearbyInteractPrompt) {
      const p = this.nearbyInteractPrompt;
      const cleanLabel = String(p.label || '')
        .replace(/^[^\p{L}\p{N}[]+/u, '')
        .replace(/\[E\]\s*/i, '')
        .trim();
      const iconMap = {
        leaf: '🍂',
        garden: '🌱',
        bell_rhythm: '🔔',
        koi_pond: '🐟',
        blessing_tower: '🏮',
        chanh_dien_bell: '🔔',
        trong_bat_nha: '🥁',
        nghin_mat_nghin_tay: '🙏',
        cho_ngu_cua_phat: '🪷'
      };
      if (iconEl) iconEl.textContent = iconMap[p.kind] || '✨';
      labelEl.textContent = cleanLabel || 'Tương tác';
      btn.style.display = 'inline-flex';
      return;
    }

    if (!this.world3d?.insideInterior && this.nearbyStallTrigger) {
      const shortTitle = String(this.nearbyStallTrigger.title || 'Nhà Tạp Hóa').split('·')[0].trim();
      if (iconEl) iconEl.textContent = '🛒';
      labelEl.textContent = `Ghé ${shortTitle}`;
      btn.style.display = 'inline-flex';
      return;
    }

    btn.style.display = 'none';
  }

  handleProximityInteract() {
    if (this.nearbyInteractPrompt) {
      const p = this.nearbyInteractPrompt;
      if (p.kind === 'nghin_mat_nghin_tay' || p.kind === 'cho_ngu_cua_phat') {
        this.prayAtRightGalleryShrine(p.kind);
        return true;
      }
      if (p.kind === 'blessing_tower') {
        this.openBlessingTowerModal();
        return true;
      }
      if (p.kind === 'chanh_dien_bell') {
        this.ringChanhDienBellInApp();
        return true;
      }
      if (p.kind === 'trong_bat_nha') {
        this.strikeTrongBatNhaInApp();
        return true;
      }
      if (p.kind === 'leaf' && p.leafId) {
        this.collectCourtyardLeafInApp(p.leafId);
        return true;
      }
      if (p.kind === 'garden') {
        this.openTempleGardenModal(Number.isFinite(p.slotIndex) ? p.slotIndex : 0);
        return true;
      }
      if (p.kind === 'bell_rhythm') {
        this.openBellRhythmModal();
        return true;
      }
      if (p.kind === 'koi_pond') {
        this.feedKoiPondInApp();
        return true;
      }
    }
    if (!this.world3d?.insideInterior && this.nearbyStallTrigger) {
      this.openMarketplaceStallModal(
        this.nearbyStallTrigger.stallType || 'huong_hoa',
        this.nearbyStallTrigger.title || 'Nhà Tạp Hóa Cổng Chùa Vĩnh Tràng'
      );
      return true;
    }
    return false;
  }

  prayAtRightGalleryShrine(kind = 'nghin_mat_nghin_tay') {
    if (this.world3d?.insideInterior) {
      this.world3d.goToInteriorZone(kind);
      this.world3d.playPlayerBowAnimation?.();
    }
    this.playBellTone(243, 3.0);
    this.storeProfile.lotusPoints += 12;
    if (kind === 'cho_ngu_cua_phat') {
      this.spiritual = recordSpiritualMilestone(
        this.spiritual,
        'Chiêm bái Chỗ Ngủ Của Phật · Đức Phật Nhập Niết Bàn'
      );
      this.grantPilgrimXp(10, 'Chiêm bái Chỗ Ngủ Của Phật');
      this.saveState();
      this.updateActionBadges();
      this.showToast(
        '🪷 Chỗ Ngủ Của Phật · Đức Phật Nhập Niết Bàn (+12 🪷 · +10 XP)',
        'Khám thờ gỗ chạm thếp vàng tôn trí kim thân Đức Phật an nhiên thị hiện Cát Tường Ngoạ tại dải bàn thờ lối vào bên phải.',
        4800,
        true
      );
    } else {
      this.tryAutoDiscoverHeritageById('relic_quan_am', { silent: true });
      this.spiritual = recordSpiritualMilestone(
        this.spiritual,
        'Chiêm bái Tượng Phật Nghìn Mắt Nghìn Tay (Thiên Thủ Thiên Nhãn)'
      );
      this.grantPilgrimXp(10, 'Chiêm bái Phật Nghìn Mắt Nghìn Tay');
      this.saveState();
      this.updateActionBadges();
      this.showToast(
        '🙏 Đức Phật Nghìn Mắt Nghìn Tay · Thiên Thủ Thiên Nhãn (+12 🪷 · +10 XP)',
        'Ngàn mắt soi thấu nỗi khổ thế gian, ngàn tay từ bi cứu độ chúng sinh ngay lối bước vào góc dưới bên phải chùa.',
        4800,
        true
      );
    }
  }

  syncBlessingTowerTo3D() {
    if (!this.world3d?.syncBlessingTowerLamps) return;
    const enriched = (this.blessingTower?.entries || []).map((e) => ({
      ...e,
      colorHex: BLESSING_TOWER_CATEGORIES.find((c) => c.id === e.categoryId)?.accentHex || '#F3B43F'
    }));
    this.world3d.syncBlessingTowerLamps(enriched);
  }

  ringChanhDienBellInApp() {
    this.tryAutoDiscoverHeritageById('relic_dai_hong_chung', { silent: true });
    this.playBellTone(196, 3.6);
    setTimeout(() => this.playBellTone(243, 2.8), 680);
    this.storeProfile.lotusPoints += 12;
    this.spiritual = recordSpiritualMilestone(this.spiritual, 'Thỉnh Đại Hồng Chung & Chuông Gia Trì tại Chánh Điện');
    this.grantPilgrimXp(10, 'Thỉnh Chuông Chánh Điện');
    this.saveState();
    this.updateActionBadges();
    this.showToast(
      '🔔 Tiếng Chuông Chánh Điện Ngân Vang (+12 🪷 · +10 XP)',
      '“Nghe chuông phiền não tan mây khói, trí tuệ sinh sôi Bồ-đề lớn.” — Pháp Bảo Chuông Chùa Vĩnh Tràng (1854).',
      4200,
      false
    );
  }

  strikeTrongBatNhaInApp() {
    this.playMokugyoTap(true);
    setTimeout(() => this.playMokugyoTap(false), 240);
    setTimeout(() => this.playMokugyoTap(true), 520);
    setTimeout(() => this.playBellTone(174, 2.4), 860);
    this.storeProfile.lotusPoints += 12;
    this.spiritual = recordSpiritualMilestone(this.spiritual, 'Khởi hồi Trống Bát Nhã & Mõ Gỗ tại Chánh Điện');
    this.grantPilgrimXp(10, 'Khởi Hồi Trống Bát Nhã');
    this.saveState();
    this.updateActionBadges();
    this.showToast(
      '🥁 Khởi Hồi Trống Bát Nhã · Mõ Đại Tự (+12 🪷 · +10 XP)',
      'Hồi trống Bát Nhã đối xứng cùng Đại Hồng Chung khai mở trí tuệ và chánh niệm nơi Đại Hùng Bửu Điện.',
      4200,
      false
    );
  }

  grantPilgrimXp(amount, reasonLabel = '') {
    const res = grantPlayerXp(this.activityHub, amount);
    this.activityHub = res.activity;
    if (res.leveledUp) {
      this.playBellTone(360, 2.8);
      this.showToast(
        `${res.rankInfo.badge} Thăng bậc: ${res.rankInfo.title} (Cấp ${res.rankInfo.level})`,
        reasonLabel ? `Từ hoạt động "${reasonLabel}", cô bác đã đạt bậc hành hương mới!` : 'Chúc mừng cô bác tinh tấn tu học mỗi ngày!',
        4800,
        false
      );
    }
    return res;
  }

  tryAutoDiscoverHeritageById(relicId, { silent = false } = {}) {
    const res = discoverHeritageRelic(this.activityHub, this.storeProfile, relicId, getLocalDateKey());
    if (!res.ok || res.alreadyDiscovered) return res;
    this.activityHub = res.activity;
    this.storeProfile = res.storeProfile;
    this.saveState();
    this.updateActionBadges();
    if (!silent) {
      this.playBellTone(324, 2.0);
      this.showToast('📜 Đóng dấu Sổ Di Sản Vĩnh Tràng', res.message, 4200, false);
    }
    return res;
  }

  tryAutoDiscoverHeritageByStation(stationKey, { silent = true } = {}) {
    const matches = HERITAGE_RELICS.filter((r) => r.stationKey === stationKey);
    for (const r of matches) {
      if (r.id === 'relic_quan_am' || r.id === 'relic_long_tru' || r.id === 'relic_bat_bo_la_han') continue;
      this.tryAutoDiscoverHeritageById(r.id, { silent });
    }
  }

  collectCourtyardLeafInApp(leafId) {
    if (!leafId) return;
    const res = collectCourtyardTask(this.activityHub, this.storeProfile, leafId, getLocalDateKey());
    if (!res.ok) {
      this.showToast('Quét lá sân chùa', res.message, 2800, false);
      return;
    }
    this.activityHub = res.activity;
    this.storeProfile = res.storeProfile;
    this.spiritual = performSpiritualAction(this.spiritual, 'SWEEP_LEAVES').state;
    this.nearbyInteractPrompt = null;
    this.saveState();
    this.syncTempleWorldGameplayState();
    this.updateActionBadges();
    this.refreshProximityPrompt();
    this.playMokugyoTap();
    if (res.rewardGems > 0 || res.leveledUp) {
      this.playBellTone(360, 2.4);
    }
    this.showToast(
      `🍂 Đã quét lá (${res.collectedCount}/${res.totalSpots})`,
      res.message,
      3800,
      false
    );
  }

  feedKoiPondInApp() {
    this.world3d?.placeLotusOfferingIn3D?.();
    this.activityHub = ensureDailyMissionDate(this.activityHub, getLocalDateKey());
    this.activityHub.koiFedCount = (this.activityHub.koiFedCount || 0) + 1;
    this.storeProfile.lotusPoints += 12;
    this.spiritual = recordSpiritualMilestone(this.spiritual, 'Cho cá Koi ăn & Thả sen tại Hồ Sen');
    this.grantPilgrimXp(10, 'Cho cá Koi ăn');
    this.saveState();
    this.updateActionBadges();
    this.playBellTone(324, 2.2);
    this.showToast(
      '🐟 Đã rải thức ăn cho đàn cá Koi (+12 🪷 · +10 XP)',
      `Cô bác đã gieo duyên phóng sinh ${this.activityHub.koiFedCount} lần tại Hồ Sen Vĩnh Tràng.`,
      4200,
      true
    );
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
    this.tryAutoDiscoverHeritageByStation(stationKey, { silent: false });
    this.saveState();
    this.updateActionBadges();
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
        'Đang tiến tới Lối Vào Góc Dưới Bên Phải Chùa...',
        'Từ góc dưới bên phải, bạn đi thẳng qua dải bàn thờ Nghìn Mắt Nghìn Tay & Chỗ Ngủ Của Phật rồi dạo quanh Hình Vuông Hồ Sen Bộ.',
        3600,
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
     SOUND, SOUNDSCAPE & VOICEOVER ENGINE (Unified TempleAudioEngine)
     ======================================================================== */
  ensureAudioContext() {
    this.audio?.unlock?.();
    if (this.audio && !this.audio.isAmbientRunning) {
      this.audio.startAmbient(this.world3d?.insideInterior ? 'interior' : 'exterior');
    }
  }

  playBellTone(freq = 216, duration = 2.6) {
    this.ensureAudioContext();
    const pitchScale = Math.max(0.45, Math.min(2.2, Number(freq || 196) / 196));
    const strength = Math.max(0.35, Math.min(1.25, Number(duration || 2.6) / 3.0));
    this.audio?.playBronzeBell?.(pitchScale, strength);
  }

  playChanhDienBellCadence({ force = false } = {}) {
    if (this.audioMuted) return;
    const nowMs = Date.now();
    if (!force && nowMs - (this._lastChanhDienBellAt || 0) < 18000) return;
    this._lastChanhDienBellAt = nowMs;
    this.ensureAudioContext();
    const hits = [
      { delay: 40, scale: 216 / 196, strength: 0.42 },
      { delay: 1350, scale: 243 / 196, strength: 0.36 },
      { delay: 2700, scale: 216 / 196, strength: 0.46 }
    ];
    for (const h of hits) {
      setTimeout(() => {
        if (!this.audioMuted) {
          this.audio?.playBronzeBell?.(h.scale, h.strength);
        }
      }, h.delay);
    }
  }

  playMokugyoTap(accent = false) {
    this.ensureAudioContext();
    this.audio?.playWoodenMokugyo?.(Boolean(accent));
  }

  playVoiceAudio(fileName, options = {}) {
    if (!fileName) return;
    this.ensureAudioContext();
    this.currentAudioFile = fileName;
    const rate = options?.rate ?? this.readAlongRate ?? 1.0;
    this.audio?.playVoiceAudio?.(fileName, { ...options, rate });
  }

  pauseVoiceAudio() {
    this.audio?.pauseVoice?.();
    this.audioPlaying = false;
  }

  updateAudioMixerUI() {
    const st = this.audio?.getMixerState?.() || {
      masterVolume: 1,
      ambientVolume: 0.45,
      sfxVolume: 0.85,
      voiceVolume: 0.9,
      muted: this.audioMuted
    };
    this.audioMuted = Boolean(st.muted);

    const navBtn = document.getElementById('nav-btn-audio');
    const navIcon = document.getElementById('nav-audio-icon');
    const navLbl = document.getElementById('nav-audio-label');
    if (navBtn) navBtn.classList.toggle('muted', this.audioMuted);
    if (navIcon) navIcon.textContent = this.audioMuted ? '🔇' : '🔊';
    if (navLbl) navLbl.textContent = this.audioMuted ? 'Đã tắt tiếng' : 'Âm thanh';

    const muteBtn = document.getElementById('btn-audio-global-mute');
    if (muteBtn) {
      muteBtn.classList.toggle('muted', this.audioMuted);
      muteBtn.textContent = this.audioMuted
        ? '🔇 Đang Tắt toàn bộ tiếng (Bấm để Mở lại)'
        : '🔊 Đang Bật âm thanh (Bấm để Tắt tiếng)';
    }

    const pairs = [
      ['slider-ambient-vol', 'val-ambient-vol', st.ambientVolume],
      ['slider-sfx-vol', 'val-sfx-vol', st.sfxVolume],
      ['slider-voice-vol', 'val-voice-vol', st.voiceVolume]
    ];
    for (const [sId, vId, val] of pairs) {
      const pct = Math.round((Number(val) || 0) * 100);
      const sEl = document.getElementById(sId);
      const vEl = document.getElementById(vId);
      if (sEl && Number(sEl.value) !== pct) sEl.value = String(pct);
      if (vEl) vEl.textContent = `${pct}%`;
    }
  }

  setAudioMuted(muted) {
    this.audio?.setMuted?.(Boolean(muted));
    this.audioMuted = Boolean(this.audio?.muted);
    if (!this.audioMuted) {
      this.ensureAudioContext();
      this.audio?.playBlessingChime?.();
    }
    this.updateAudioMixerUI();
    this.saveState();
  }

  saveAudioMixerState() {
    this.updateAudioMixerUI();
    this.saveState();
  }

  syncPilgrimageCompanionsTo3D() {
    if (!this.world3d?.setPilgrimageCompanions) return;
    const mode = getPilgrimageMode(this.pilgrimageModeId);
    this.world3d.setPilgrimageCompanions(mode, this.nationalityId);
  }

  syncHoaDangLanternsTo3D() {
    if (!this.world3d?.renderFloatingLanterns) return;
    this.world3d.renderFloatingLanterns(this.hoaDangWishes);
  }

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
  }

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
  }

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
    const quickDock = document.getElementById('courtyard-quick-dock');
    if (shopEl) shopEl.classList.toggle('open', screenName === 'shop');
    if (lectureEl) lectureEl.classList.toggle('open', screenName === 'lecture');
    if (quickDock) quickDock.style.display = screenName === 'courtyard' ? 'flex' : 'none';
    if (pinsLayer && !this.world3d?.insideInterior) {
      pinsLayer.style.display = screenName === 'courtyard' ? 'block' : 'none';
    }

    if (screenName !== 'lecture') {
      this.stopLectureSpeech();
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
    this.audio?.stopSpeaking?.();
    this.ttsSpeaking = false;
  }

  toggleLectureSpeech(lesson) {
    if (!lesson) return;
    if (this.ttsSpeaking || this.audio?.ttsSpeaking) {
      this.stopLectureSpeech();
      this.renderLectureStage();
      return;
    }

    const speechText = `${lesson.title}. ${lesson.summary.slice(0, 3).join('. ')}. Gợi ý thực hành: ${lesson.example}`;
    const started = this.audio?.speakText?.(speechText, {
      rate: this.readAlongRate || 1.0,
      lang: 'vi-VN',
      pitch: 0.98
    });

    if (started) {
      this.ttsSpeaking = true;
      this.playBellTone(288, 1.4);
      this.renderLectureStage();
      return;
    }

    // Fallback when SpeechSynthesis or vi-VN voice is unavailable on mobile/WebView
    this.ttsSpeaking = false;
    this.playBellTone(260, 2.0);
    this.playVoiceAudio(lesson.audio, { rate: this.readAlongRate || 1.0 });
    this.showToast(
      '🎙️ Đang phát Pháp âm ghi âm sẵn',
      `Thiết bị chưa có giọng đọc tiếng Việt — phát bản thu trực tiếp (${this.readAlongRate === 0.85 ? '0.85x Chậm' : '1.0x Chuẩn'}).`,
      3800,
      false
    );
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
    this.refreshGoalsTrackerHUD();
  }

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
  }

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
  }

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
  }

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
  }

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
              if (!bbox) {
                bbox = o.geometry.boundingBox.clone();
              } else {
                bbox.union(o.geometry.boundingBox);
              }
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
        this.world3d?.goToInteriorZone?.('chanh_dien');
        this.triggerLePhat({ skipWalk: true });
      });
      return;
    }

    const res = performSpiritualAction(this.spiritual, 'LE_PHAT');
    this.spiritual = res.state;
    this.grantPilgrimXp(10, 'Lễ Phật Tam Bái');
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
    this.grantPilgrimXp(10, 'Dâng hoa sen');
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
      if (count >= 10 || this.spiritual.malaBeads === 0) {
        this.grantPilgrimXp(8, 'Niệm Phật Tràng Hạt');
      }
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
        this.pauseVoiceAudio();
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
     HỌC VIỆN PHẬT HỌC & GIẢNG ĐƯỜNG RENDERING (4 Khóa · 12 Học phần · 11 PDF)
     ======================================================================== */
  renderLectureStage() {
    const stage = document.getElementById('lecture-center-stage');
    if (!stage) return;

    document.querySelectorAll('.lecture-dock-tab').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-lecture-tab') === this.lectureTab);
    });

    const lessonIdx = Math.max(0, LECTURE_LESSONS.findIndex((l) => l.id === this.activeLessonId));
    const lesson = LECTURE_LESSONS[lessonIdx] || LECTURE_LESSONS[0];
    const lessonCourse =
      ACADEMY_COURSES.find((c) => c.lessonIds.includes(lesson.id)) || ACADEMY_COURSES[0];
    const unlockedSet = new Set(this.academyState?.unlockedCourses || ['course_1_khai_tam']);
    const isLessonUnlocked = lessonCourse.isFree || unlockedSet.has(lessonCourse.id);
    const conciseBullets = lesson.summary.slice(1, 3);

    const renderLockedCourseGuard = (courseObj) => `
      <div class="lesson-study-stack">
        <div class="lesson-cream-card lecture-translucent-card academy-lock-card">
          <div class="academy-lock-badge">🔒 Học phần thuộc ${courseObj.title}</div>
          <div class="lesson-card-big-title" style="margin-top:6px;">${lesson.title}</div>
          <p class="lesson-summary-lead" style="margin-top:8px;">
            Khóa 1 (Khai Tâm Nhập Môn) miễn phí hoàn toàn. Để nghe pháp âm, học bài và thi lấy chứng nhận <strong>${courseObj.title}</strong>, cô bác vui lòng đăng ký học phí <strong>${courseObj.priceLabel}</strong> hoặc nhập mã kích hoạt.
          </p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;">
            <button type="button" id="btn-guard-unlock-course" class="arrival-primary-btn" style="flex:1;min-width:220px;">
              💳 Đăng ký / Nhập mã (${courseObj.priceLabel})
            </button>
            <button type="button" id="btn-guard-back-academy" class="lecture-choose-btn" style="min-height:48px;">
              🎓 Về trang Học Viện
            </button>
          </div>
        </div>
      </div>
    `;

    const bindLockedGuard = (courseObj) => {
      document.getElementById('btn-guard-unlock-course')?.addEventListener('click', () => {
        this.openAcademyUnlockModal(courseObj.id);
      });
      document.getElementById('btn-guard-back-academy')?.addEventListener('click', () => {
        this.lectureTab = 'package';
        this.renderLectureStage();
      });
    };

    if (this.lectureTab === 'listen') {
      if (!isLessonUnlocked) {
        stage.innerHTML = renderLockedCourseGuard(lessonCourse);
        bindLockedGuard(lessonCourse);
        return;
      }
      stage.innerHTML = `
        <div class="lesson-study-stack lecture-listen-dock-wrap">
          <div class="lesson-cream-card lecture-translucent-card">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
              <div style="flex:1;min-width:210px;">
                <div style="font-size:12.5px;font-weight:800;color:#5C381F;text-transform:uppercase;letter-spacing:0.04em;">Giảng đường 3D trực tiếp · ${lessonCourse.badge} · Bài ${lesson.id}</div>
                <div class="lesson-card-big-title" style="text-align:left;font-size:clamp(19px,2.2vw,24px);margin-top:2px;">${lesson.title}</div>
                <div class="lesson-card-meta" style="margin-bottom:0;">${lesson.sourceBook} · ${lesson.duration} · Tốc độ đọc ${this.readAlongRate === 0.85 ? '0.85x Chậm' : '1.0x Chuẩn'}</div>
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
          this.pauseVoiceAudio();
        } else {
          this.playVoiceAudio(lesson.audio, { rate: this.readAlongRate || 1.0 });
        }
        this.renderLectureStage();
      });
      return;
    }

    if (this.lectureTab === 'lesson') {
      if (!isLessonUnlocked) {
        stage.innerHTML = renderLockedCourseGuard(lessonCourse);
        bindLockedGuard(lessonCourse);
        return;
      }
      stage.innerHTML = `
        <div class="lesson-study-stack">
          <div class="lesson-cream-card lesson-header-card lecture-translucent-card">
            <div class="lesson-card-big-title">${lesson.title}</div>
            <div class="lesson-card-meta">${lessonCourse.title} · Bài ${lesson.id} (${lessonIdx + 1}/${LECTURE_LESSONS.length}) · ${lesson.duration} · ${lesson.sourceBook}</div>
            <div class="lecture-audio-pair-row">
              <button class="lecture-tts-btn ${this.ttsSpeaking ? 'speaking' : ''}" id="btn-lesson-tts" type="button">
                <span>${this.ttsSpeaking ? '⏹ Dừng Thầy đọc' : `🔊 Nghe Thầy Giảng (${this.readAlongRate === 0.85 ? '0.85x' : '1.0x'})`}</span>
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
            ${
              this.quizNotice
                ? `<div class="academy-quiz-notice">${this.quizNotice}</div>`
                : ''
            }
          </div>

          <div class="lecture-nav-footer">
            <button class="lecture-prev-btn" id="btn-lesson-prev" type="button">
              ← Bài trước
            </button>
            <button class="lecture-choose-btn" id="btn-lesson-choose-other" type="button">
              🎓 Chương trình Học Viện
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
          this.pauseVoiceAudio();
        } else {
          this.playVoiceAudio(lesson.audio, { rate: this.readAlongRate || 1.0 });
        }
        this.renderLectureStage();
      });

      stage.querySelectorAll('[data-quiz-idx]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.quizNotice = null;
          this.selectedQuizOption = Number(btn.getAttribute('data-quiz-idx') || 0);
          this.quizFeedback = gradeLessonQuiz(lesson.id, this.selectedQuizOption);
          if (this.quizFeedback.correct) {
            const wasNew = !this.completedLessons.has(lesson.id);
            this.completedLessons.add(lesson.id);
            if (wasNew) {
              this.activityHub = recordDailyMissionMetric(this.activityHub, 'dailyLessons', 1);
              this.grantPilgrimXp(20, lesson.title);
            }
            this.saveState();
            this.updateActionBadges();
            this.playBellTone(324, 1.8);
          } else {
            this.playMokugyoTap();
          }
          this.renderLectureStage();
        });
      });

      document.getElementById('btn-lesson-prev')?.addEventListener('click', () => {
        this.stopLectureSpeech();
        const prevLesson = LECTURE_LESSONS[(lessonIdx - 1 + LECTURE_LESSONS.length) % LECTURE_LESSONS.length];
        const prevCourse = ACADEMY_COURSES.find((c) => c.lessonIds.includes(prevLesson.id)) || ACADEMY_COURSES[0];
        this.activeLessonId = prevLesson.id;
        this.activePathId = prevLesson.pathId;
        this.activeCourseId = prevCourse.id;
        this.selectedQuizOption = null;
        this.quizFeedback = null;
        this.quizNotice = null;
        this.playMokugyoTap();
        this.renderLectureStage();
      });

      document.getElementById('btn-lesson-choose-other')?.addEventListener('click', () => {
        this.lectureTab = 'package';
        this.renderLectureStage();
      });

      document.getElementById('btn-lesson-continue')?.addEventListener('click', () => {
        this.stopLectureSpeech();
        const alreadyDone = this.completedLessons.has(lesson.id);
        const passedQuizNow = Boolean(this.quizFeedback?.correct);

        if (!alreadyDone && !passedQuizNow && !this.quizNotice) {
          this.quizNotice =
            '⚠️ Cô bác hãy chọn đáp án đúng ở câu hỏi ôn tập phía trên để hệ thống ghi nhận hoàn thành bài học nhé! (Nếu chỉ muốn xem trước bài kế tiếp, hãy bấm "Bài tiếp theo" thêm một lần nữa.)';
          this.playMokugyoTap();
          this.renderLectureStage();
          return;
        }

        if (passedQuizNow && !alreadyDone) {
          this.completedLessons.add(lesson.id);
          this.activityHub = recordDailyMissionMetric(this.activityHub, 'dailyLessons', 1);
          this.grantPilgrimXp(20, lesson.title);
          this.saveState();
          this.updateActionBadges();
        }

        const nextLesson = LECTURE_LESSONS[(lessonIdx + 1) % LECTURE_LESSONS.length];
        const nextCourse = ACADEMY_COURSES.find((c) => c.lessonIds.includes(nextLesson.id)) || ACADEMY_COURSES[0];
        const nextUnlocked = nextCourse.isFree || unlockedSet.has(nextCourse.id);

        this.selectedQuizOption = null;
        this.quizFeedback = null;
        this.quizNotice = null;

        if (!nextUnlocked) {
          this.activeCourseId = nextCourse.id;
          this.activePathId = nextCourse.pathId;
          this.lectureTab = 'package';
          this.playBellTone(288, 1.8);
          this.renderLectureStage();
          this.showToast('🎓 Đã hết phần miễn phí', `Mời cô bác mở khóa "${nextCourse.title}" để học tiếp nhé!`, 4200, false);
          return;
        }

        this.activeLessonId = nextLesson.id;
        this.activePathId = nextLesson.pathId;
        this.activeCourseId = nextCourse.id;
        this.playBellTone(288, 2.0);
        this.renderLectureStage();
      });
      return;
    }

    if (this.lectureTab === 'package') {
      const selectedCourse =
        ACADEMY_COURSES.find((c) => c.id === this.activeCourseId) || ACADEMY_COURSES[0];
      const isSelectedUnlocked = selectedCourse.isFree || unlockedSet.has(selectedCourse.id);
      const courseModules = ACADEMY_MODULES.filter((m) => m.courseId === selectedCourse.id).sort(
        (a, b) => a.order - b.order
      );
      const unlockedCount = ACADEMY_COURSES.filter((c) => c.isFree || unlockedSet.has(c.id)).length;
      const bestExamScore = Number(this.academyState?.examScores?.[selectedCourse.id] || 0);
      const passedCourseExam = bestExamScore >= selectedCourse.passScore;

      stage.innerHTML = `
        <div class="lesson-study-stack" style="max-width:940px;">
          <div class="lesson-cream-card lecture-translucent-card">
            <div class="academy-hero-head">
              <div>
                <div class="academy-eyebrow">🏛️ HỌC VIỆN PHẬT HỌC CHÙA VĨNH TRÀNG</div>
                <div style="font-size:22px;font-weight:800;color:#472915;margin-top:2px;">
                  4 Khóa Học Hệ Thống · 12 Học Phần · 11 Giáo Trình PDF
                </div>
                <p style="font-size:14.5px;color:#5b3a1d;margin-top:4px;line-height:1.45;">
                  Hoàn thành <strong>${this.completedLessons.size}/24 bài học</strong> · Đã mở <strong>${unlockedCount}/4 khóa</strong> · Khóa 1 miễn phí trải nghiệm, có thi tốt nghiệp &amp; cấp bằng chứng nhận.
                </p>
              </div>
              <button id="btn-open-pdf-library-inline" class="product-detail-btn" style="width:auto;padding:0 16px;min-height:48px;font-size:14px;background:#8c4b1e;">
                📚 Tủ sách (11 PDF)
              </button>
            </div>

            <div class="academy-student-row">
              <label for="academy-student-name-input" style="font-size:14px;font-weight:800;color:#472915;">Họ tên ghi trên Chứng Nhận:</label>
              <input id="academy-student-name-input" type="text" class="academy-name-input" value="${this.studentName.replace(/"/g, '&quot;')}" placeholder="Ví dụ: Phật tử Nguyễn Văn Tâm" />
              <button type="button" id="btn-save-student-name" class="quest-go-btn" style="min-height:44px;padding:0 16px;">💾 Lưu tên</button>
            </div>

            ${
              !this.academyState?.bundleUnlocked
                ? `
                <div class="academy-bundle-banner">
                  <div>
                    <div style="font-size:15.5px;font-weight:800;color:#FFD875;">🌟 ${ACADEMY_ALL_IN_BUNDLE.title}</div>
                    <div style="font-size:13px;color:#FFF6E5;margin-top:2px;">Mở khóa trọn bộ 4 Khóa + Thi cấp 4 Bằng Chứng Nhận + Toàn bộ 11 PDF chỉ một lần.</div>
                  </div>
                  <button type="button" id="btn-academy-unlock-bundle" class="academy-bundle-btn">
                    💳 Mở trọn gói ${ACADEMY_ALL_IN_BUNDLE.priceLabel}
                  </button>
                </div>`
                : `
                <div class="academy-bundle-banner unlocked">
                  <div>
                    <div style="font-size:15px;font-weight:800;color:#FFD875;">✓ Đã kích hoạt Gói Học Viên Trọn Đời</div>
                    <div style="font-size:13px;color:#FFF6E5;">Cô bác được toàn quyền học cả 4 khóa, đọc 11 quyển sách PDF và thi cấp bằng chứng nhận.</div>
                  </div>
                </div>`
            }

            <div class="academy-courses-grid">
              ${ACADEMY_COURSES.map((c) => {
                const unlocked = c.isFree || unlockedSet.has(c.id);
                const doneLessons = c.lessonIds.filter((lid) => this.completedLessons.has(lid)).length;
                const active = selectedCourse.id === c.id;
                const cScore = Number(this.academyState?.examScores?.[c.id] || 0);
                return `
                  <div class="academy-course-card ${active ? 'active' : ''} ${unlocked ? 'unlocked' : 'locked'}" data-select-course="${c.id}" role="button" tabindex="0">
                    <div class="academy-course-top">
                      <span class="academy-course-badge">${c.badge}</span>
                      <span class="academy-course-price ${unlocked ? 'free' : ''}">${unlocked ? '✓ Đã mở' : `🔒 ${c.priceLabel}`}</span>
                    </div>
                    <div class="academy-course-title">${c.title}</div>
                    <div class="academy-course-sub">${c.subtitle}</div>
                    <div class="academy-course-meta">
                      <span>⏱️ ${c.estimatedHours}h · ${doneLessons}/${c.lessonIds.length} bài</span>
                      <span>${cScore > 0 ? `📝 ${cScore}/100đ` : `Đạt ≥${c.passScore}%`}</span>
                    </div>
                    ${
                      !unlocked
                        ? `<button type="button" class="academy-unlock-inline-btn" data-unlock-course="${c.id}">💳 Đăng ký / Nhập mã</button>`
                        : ''
                    }
                  </div>`;
              }).join('')}
            </div>

            <div class="academy-curriculum-panel">
              <div class="academy-curriculum-head">
                <div>
                  <div style="font-size:12.5px;font-weight:800;color:#8c4b1e;text-transform:uppercase;">Giáo trình chi tiết · ${selectedCourse.badge}</div>
                  <h3 style="font-size:19px;font-weight:800;color:#472915;margin:2px 0 0;">${selectedCourse.title}</h3>
                </div>
                <div class="academy-curriculum-actions">
                  ${
                    !isSelectedUnlocked
                      ? `<button type="button" id="btn-active-course-unlock" class="arrival-primary-btn" style="min-height:48px;padding:0 18px;">💳 Mở khóa (${selectedCourse.priceLabel})</button>`
                      : `
                      <button type="button" id="btn-academy-open-exam" class="quest-claim-btn" style="min-height:48px;padding:0 16px;font-size:14px;">
                        📝 Thi Tốt Nghiệp ${bestExamScore > 0 ? `(${bestExamScore}%)` : ''}
                      </button>
                      <button type="button" id="btn-academy-open-cert" class="product-detail-btn" style="width:auto;min-height:48px;padding:0 16px;font-size:14px;background:${passedCourseExam ? '#3D6B4A' : '#7E2A22'};">
                        📜 ${passedCourseExam ? 'Xem Bằng Chứng Nhận' : 'Chứng Nhận'}
                      </button>
                      `
                  }
                </div>
              </div>

              <div class="academy-modules-list">
                ${courseModules
                  .map((mod) => {
                    const modBooks = mod.bookIds
                      .map((bid) => DHARMA_TEXTBOOKS.find((b) => b.id === bid))
                      .filter(Boolean);
                    const modLessons = mod.lessonIds
                      .map((lid) => LECTURE_LESSONS.find((l) => l.id === lid))
                      .filter(Boolean);
                    return `
                    <div class="academy-module-card">
                      <div class="academy-module-head">
                        <div class="academy-module-title">${mod.title}</div>
                        <span class="academy-module-time">⏱️ ~${mod.estimatedMinutes} phút · ${(mod.extraQuizzes || []).length} câu ôn tập</span>
                      </div>

                      ${
                        modBooks.length > 0
                          ? `<div class="academy-module-books">
                              ${modBooks
                                .map(
                                  (b) => `
                                <a href="${b.pdfPath}" target="_blank" class="academy-pdf-chip">
                                  📄 ${b.title.split('—')[0].trim()} (PDF)
                                </a>`
                                )
                                .join('')}
                            </div>`
                          : ''
                      }

                      <div class="lecture-lessons-grid" style="margin-top:8px;">
                        ${modLessons
                          .map((l) => {
                            const done = this.completedLessons.has(l.id);
                            return `
                            <button class="select-lesson-card" data-lesson-id="${l.id}" style="min-height:56px;padding:12px 14px;border-radius:14px;border:1.5px solid ${
                              this.activeLessonId === l.id ? '#5C381F' : 'rgba(130,90,50,0.25)'
                            };background:#fffdf8;color:#241409;text-align:left;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:10px;">
                              <div>
                                <div style="font-size:12.5px;font-weight:800;color:#7a4e25;">Bài ${l.id} · ${l.duration}</div>
                                <div style="font-size:15px;font-weight:800;margin-top:2px;">${l.title}</div>
                              </div>
                              <span style="padding:5px 11px;border-radius:999px;background:${
                                !isSelectedUnlocked ? '#fce8e6' : done ? '#F6E9D2' : '#f3e4cb'
                              };color:${!isSelectedUnlocked ? '#991b1b' : done ? '#5C381F' : '#6b4522'};font-size:12.5px;font-weight:800;flex-shrink:0;">
                                ${!isSelectedUnlocked ? '🔒 Khóa' : done ? '✓ Đã học' : 'Học ngay'}
                              </span>
                            </button>`;
                          })
                          .join('')}
                      </div>
                    </div>`;
                  })
                  .join('')}
              </div>
            </div>
          </div>
        </div>
      `;

      document.getElementById('btn-open-pdf-library-inline')?.addEventListener('click', () => {
        this.openTextbooksModal();
      });

      document.getElementById('btn-save-student-name')?.addEventListener('click', () => {
        const val = document.getElementById('academy-student-name-input')?.value || '';
        const clean = val.trim() || 'Phật tử Tâm An';
        this.studentName = clean;
        this.saveState();
        this.playMokugyoTap();
        this.showToast('✍️ Đã lưu họ tên học viên', `Tên "${clean}" sẽ được in trang trọng lên Chứng Nhận Tốt Nghiệp.`, 3200, false);
      });

      document.getElementById('btn-academy-unlock-bundle')?.addEventListener('click', () => {
        this.openAcademyUnlockModal(ACADEMY_ALL_IN_BUNDLE.id);
      });

      document.getElementById('btn-active-course-unlock')?.addEventListener('click', () => {
        this.openAcademyUnlockModal(selectedCourse.id);
      });

      document.getElementById('btn-academy-open-exam')?.addEventListener('click', () => {
        this.openAcademyExamModal(selectedCourse.id);
      });

      document.getElementById('btn-academy-open-cert')?.addEventListener('click', () => {
        this.openAcademyCertificateModal(selectedCourse.id);
      });

      stage.querySelectorAll('[data-unlock-course]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const cid = btn.getAttribute('data-unlock-course');
          if (cid) this.openAcademyUnlockModal(cid);
        });
      });

      stage.querySelectorAll('[data-select-course]').forEach((card) => {
        const selectCourse = () => {
          const cid = card.getAttribute('data-select-course');
          const courseObj = ACADEMY_COURSES.find((c) => c.id === cid);
          if (courseObj) {
            this.activeCourseId = courseObj.id;
            this.activePathId = courseObj.pathId;
            this.saveState();
            this.playMokugyoTap();
            this.renderLectureStage();
          }
        };
        card.addEventListener('click', selectCourse);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectCourse();
          }
        });
      });

      stage.querySelectorAll('.select-lesson-card').forEach((btn) => {
        btn.addEventListener('click', () => {
          const lid = btn.getAttribute('data-lesson-id');
          if (!lid) return;
          if (!isSelectedUnlocked) {
            this.openAcademyUnlockModal(selectedCourse.id);
            return;
          }
          this.stopLectureSpeech();
          this.activeLessonId = lid;
          this.activePathId = selectedCourse.pathId;
          this.lectureTab = 'lesson';
          this.selectedQuizOption = null;
          this.quizFeedback = null;
          this.quizNotice = null;
          this.audio?.playPageTurnSfx?.();
          this.renderLectureStage();
        });
      });
    }
  }

  openAcademyUnlockModal(courseIdOrBundle = 'course_2_tam_bao') {
    const qr = buildVietQRPayload(courseIdOrBundle);
    const isBundle = courseIdOrBundle === ACADEMY_ALL_IN_BUNDLE.id;

    this.openModal(
      isBundle ? '💳 Đăng ký Gói Học Viên Trọn Đời' : `💳 Mở Khóa ${qr.courseTitle}`,
      `
      <div class="academy-unlock-modal">
        <div class="activity-banner-row">
          <div>
            <div style="font-size:16px;font-weight:800;color:#FFD875;">${qr.courseTitle}</div>
            <div style="font-size:13.5px;color:#FFF6E5;margin-top:2px;">Học phí ủng hộ duy trì Học Viện: <strong>${qr.amount.toLocaleString('vi-VN')}đ</strong> (Dùng trọn đời)</div>
          </div>
          <span class="store-wallet-pill">VietQR 24/7</span>
        </div>

        <div class="academy-vietqr-grid">
          <div class="academy-qr-box">
            <img src="${qr.qrImageUrl}" alt="Mã VietQR chuyển khoản Học Viện" class="academy-qr-img" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='flex';" />
            <div class="academy-qr-fallback" style="display:none;">
              <div style="font-size:28px;">🏦</div>
              <div style="font-weight:800;font-size:13.5px;color:#472915;">${qr.bankName}</div>
              <div style="font-size:13px;color:#5C381F;">STK: <strong>${qr.accountNo}</strong></div>
            </div>
            <div style="font-size:12px;color:#5b3a1d;margin-top:6px;">Quét bằng app Ngân hàng bất kỳ</div>
          </div>

          <div class="academy-bank-info">
            <div><strong>Ngân hàng:</strong> ${qr.bankName}</div>
            <div><strong>Số tài khoản:</strong> <code>${qr.accountNo}</code></div>
            <div><strong>Chủ tài khoản:</strong> ${qr.accountName}</div>
            <div><strong>Số tiền:</strong> <strong style="color:#a53b16;">${qr.amount.toLocaleString('vi-VN')}đ</strong></div>
            <div><strong>Nội dung CK:</strong> <code>${qr.transferMemo}</code></div>
            <p style="font-size:12.5px;color:#5b3a1d;line-height:1.45;margin-top:6px;">
              Sau khi chuyển khoản, cô bác nhập mã kích hoạt nhận được (hoặc dùng mã trải nghiệm <code>VINHTRANG2026</code> / <code>HOIAN2026</code> / <code>VT-HV-XXXX</code>):
            </p>
            <div class="academy-code-row">
              <input id="academy-unlock-code-input" type="text" class="academy-code-input" placeholder="Nhập mã (VD: VINHTRANG2026)" value="VINHTRANG2026" />
              <button type="button" id="btn-academy-apply-code" class="arrival-primary-btn" style="min-height:48px;padding:0 18px;">
                ✓ Kích hoạt ngay
              </button>
            </div>
            <div id="academy-unlock-err" style="display:none;color:#b91c1c;font-size:13px;font-weight:700;"></div>
          </div>
        </div>
      </div>
      `,
      { variant: 'scroll' }
    );

    document.getElementById('btn-academy-apply-code')?.addEventListener('click', () => {
      const code = document.getElementById('academy-unlock-code-input')?.value || '';
      const res = unlockAcademyCourseWithCode(this.academyState, courseIdOrBundle, code);
      const errEl = document.getElementById('academy-unlock-err');
      if (!res.ok) {
        if (errEl) {
          errEl.style.display = 'block';
          errEl.textContent = res.message;
        }
        return;
      }
      this.academyState = res.state;
      if (!isBundle) {
        this.activeCourseId = courseIdOrBundle;
        const cObj = ACADEMY_COURSES.find((c) => c.id === courseIdOrBundle);
        if (cObj) this.activePathId = cObj.pathId;
      }
      this.grantPilgrimXp(40, 'Kích hoạt khóa học Học Viện');
      this.saveState();
      this.updateActionBadges();
      this.audio?.playBlessingChime?.();
      this.audio?.playCoinLotusSfx?.();
      this.closeModal();
      this.renderLectureStage();
      this.showToast('🎓 Kích hoạt Học Viện thành công', res.message, 4400, false);
    });
  }

  openAcademyExamModal(courseId = 'course_1_khai_tam') {
    const course = ACADEMY_COURSES.find((c) => c.id === courseId) || ACADEMY_COURSES[0];
    const questions = getAcademyExamQuestions(course.id);
    const answers = {};
    let result = null;

    const renderExam = () => {
      this.openModal(
        `📝 Thi Tốt Nghiệp · ${course.title}`,
        `
        <div class="academy-exam-modal">
          <div class="activity-banner-row">
            <div>
              <div style="font-size:15.5px;font-weight:800;color:#FFD875;">Bài Thi Tổng Hợp (${questions.length} câu hỏi trắc nghiệm)</div>
              <div style="font-size:13px;color:#FFF6E5;margin-top:2px;">Chuẩn tốt nghiệp: đạt từ <strong>${course.passScore}%</strong> trở lên sẽ được cấp Bằng Chứng Nhận có dấu son Chùa Vĩnh Tràng.</div>
            </div>
            <span class="store-wallet-pill">Học viên: ${this.studentName}</span>
          </div>

          ${
            result
              ? `
              <div class="academy-exam-result ${result.passed ? 'passed' : 'failed'}">
                <div style="font-size:20px;font-weight:800;">
                  ${result.passed ? '🎉 Chúc mừng! Cô bác đã Đậu Tốt Nghiệp!' : '💡 Chưa đủ chuẩn đạt — Cô bác hãy thử lại nhé!'}
                </div>
                <div style="font-size:15px;margin-top:4px;">
                  Kết quả: <strong>${result.correctCount}/${result.totalQuestions} câu đúng (${result.scorePercent}/100 điểm)</strong> · Yêu cầu tối thiểu: ${result.passScore}%.
                </div>
                <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;">
                  ${
                    result.passed
                      ? `<button type="button" id="btn-exam-open-certificate" class="arrival-primary-btn" style="min-height:48px;">📜 Mở &amp; In Bằng Chứng Nhận →</button>`
                      : `<button type="button" id="btn-exam-retry" class="quest-claim-btn" style="min-height:48px;">🔄 Làm lại bài thi</button>`
                  }
                </div>
              </div>`
              : ''
          }

          <div class="academy-exam-questions">
            ${questions
              .map((q, qIdx) => {
                const detail = result?.details?.[qIdx];
                return `
                <div class="academy-exam-qcard">
                  <div class="academy-exam-qtitle">Câu ${qIdx + 1}: ${q.question}</div>
                  <div class="academy-exam-opts">
                    ${q.options
                      .map((opt, oIdx) => {
                        const chosen = answers[q.id] === oIdx;
                        const stateCls = detail
                          ? oIdx === q.correctIndex
                            ? 'correct'
                            : chosen && !detail.correct
                            ? 'wrong'
                            : ''
                          : chosen
                          ? 'selected'
                          : '';
                        return `
                        <button type="button" class="academy-exam-opt ${stateCls}" data-exam-q="${q.id}" data-exam-opt="${oIdx}">
                          <span>${String.fromCharCode(65 + oIdx)}. ${opt}</span>
                        </button>`;
                      })
                      .join('')}
                  </div>
                  ${
                    detail
                      ? `<div style="font-size:13px;font-weight:700;color:${detail.correct ? '#3D6B4A' : '#991b1b'};margin-top:6px;">${detail.correct ? '✓ Chính xác: ' : '💡 Giải thích: '}${detail.explanation}</div>`
                      : ''
                  }
                </div>`;
              })
              .join('')}
          </div>

          ${
            !result
              ? `
              <button type="button" id="btn-submit-academy-exam" class="arrival-primary-btn" style="width:100%;min-height:52px;font-size:16px;">
                📤 Nộp Bài Thi Tốt Nghiệp
              </button>`
              : ''
          }
        </div>
        `,
        { variant: 'scroll' }
      );

      document.querySelectorAll('[data-exam-q]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (result) return;
          const qid = btn.getAttribute('data-exam-q');
          const oIdx = Number(btn.getAttribute('data-exam-opt') || 0);
          if (!qid) return;
          answers[qid] = oIdx;
          this.playMokugyoTap();
          renderExam();
        });
      });

      document.getElementById('btn-submit-academy-exam')?.addEventListener('click', () => {
        result = gradeAcademyExam(course.id, answers);
        const prevBest = Number(this.academyState.examScores[course.id] || 0);
        this.academyState.examScores[course.id] = Math.max(prevBest, result.scorePercent);
        if (result.passed) {
          const cert = generateAcademyCertificate(this.studentName, course.id, result.scorePercent);
          if (cert.ok) {
            const others = (this.academyState.certificates || []).filter((c) => c.courseId !== course.id);
            this.academyState.certificates = [cert, ...others];
          }
          this.grantPilgrimXp(60, `Tốt nghiệp ${course.title}`);
          this.audio?.playBlessingChime?.();
          this.playBellTone(324, 2.2);
        } else {
          this.playMokugyoTap();
        }
        this.saveState();
        this.updateActionBadges();
        renderExam();
      });

      document.getElementById('btn-exam-retry')?.addEventListener('click', () => {
        result = null;
        for (const k of Object.keys(answers)) delete answers[k];
        renderExam();
      });

      document.getElementById('btn-exam-open-certificate')?.addEventListener('click', () => {
        this.openAcademyCertificateModal(course.id);
      });
    };

    renderExam();
  }

  openAcademyCertificateModal(courseId = 'course_1_khai_tam') {
    const course = ACADEMY_COURSES.find((c) => c.id === courseId) || ACADEMY_COURSES[0];
    const bestScore = Number(this.academyState?.examScores?.[course.id] || 0);
    const cert = generateAcademyCertificate(this.studentName, course.id, bestScore);

    if (!cert.ok) {
      this.openModal(
        '📜 Chứng Nhận Hoàn Thành Khóa Học',
        `
        <div style="text-align:center;padding:18px;display:flex;flex-direction:column;gap:12px;align-items:center;">
          <div style="font-size:40px;">📜</div>
          <div style="font-size:18px;font-weight:800;color:#472915;">${course.title}</div>
          <p style="font-size:15px;color:#5b3a1d;max-width:480px;line-height:1.5;">
            ${cert.message}
          </p>
          <button type="button" id="btn-cert-take-exam" class="arrival-primary-btn" style="min-height:48px;padding:0 22px;">
            📝 Làm Bài Thi Tốt Nghiệp Ngay
          </button>
        </div>
        `
      );
      document.getElementById('btn-cert-take-exam')?.addEventListener('click', () => {
        this.openAcademyExamModal(course.id);
      });
      return;
    }

    this.openModal(
      '📜 Bằng Chứng Nhận · Học Viện Phật Học Chùa Vĩnh Tràng',
      `
      <div class="academy-cert-modal">
        <div id="printable-academy-cert" class="academy-cert-sheet">
          <div class="academy-cert-border">
            <div class="academy-cert-issuer">${cert.issuerName}</div>
            <div class="academy-cert-heading">CHỨNG NHẬN HOÀN THÀNH KHÓA TU HỌC</div>
            <div class="academy-cert-motto">“${cert.motto}”</div>
            <div class="academy-cert-present">Trân trọng chứng nhận Học viên:</div>
            <div class="academy-cert-student">${cert.studentName}</div>
            <div class="academy-cert-desc">Đã hoàn thành xuất sắc chương trình đào tạo:</div>
            <div class="academy-cert-course">${cert.courseTitle}</div>
            <div class="academy-cert-metrics">
              <span>Điểm thi: <strong>${cert.score}/100</strong></span>
              <span>· Xếp loại: <strong>${cert.gradeLabel}</strong></span>
            </div>
            <div class="academy-cert-footer">
              <div>
                <div>${cert.issuedLabel}</div>
                <div style="font-size:12px;color:#7a4e25;margin-top:3px;">Mã xác thực: <strong>${cert.verificationCode}</strong></div>
              </div>
              <div class="academy-crimson-seal">
                <span>🪷</span>
                <small>CHÙA VĨNH TRÀNG</small>
                <small>CHỨNG NHẬN</small>
              </div>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button type="button" id="btn-cert-download-png" class="arrival-primary-btn" style="flex:1;min-height:48px;">
            📥 Tải Ảnh Chứng Nhận (.PNG)
          </button>
          <button type="button" id="btn-cert-print" class="lecture-choose-btn" style="min-height:48px;padding:0 18px;">
            🖨️ In Chứng Nhận
          </button>
        </div>
      </div>
      `,
      { variant: 'scroll' }
    );

    document.getElementById('btn-cert-print')?.addEventListener('click', () => {
      window.print();
    });

    document.getElementById('btn-cert-download-png')?.addEventListener('click', () => {
      const c = document.createElement('canvas');
      c.width = 1200;
      c.height = 840;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#FDF5E4';
      ctx.fillRect(0, 0, c.width, c.height);

      ctx.strokeStyle = '#C9962E';
      ctx.lineWidth = 10;
      ctx.strokeRect(28, 28, c.width - 56, c.height - 56);
      ctx.strokeStyle = '#7E2A22';
      ctx.lineWidth = 3;
      ctx.strokeRect(46, 46, c.width - 92, c.height - 92);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#7E2A22';
      ctx.font = 'bold 26px "Be Vietnam Pro", sans-serif';
      ctx.fillText(cert.issuerName.toUpperCase(), 600, 125);

      ctx.fillStyle = '#472915';
      ctx.font = 'bold 42px "Be Vietnam Pro", sans-serif';
      ctx.fillText('CHỨNG NHẬN HOÀN THÀNH KHÓA TU HỌC', 600, 195);

      ctx.fillStyle = '#8c4b1e';
      ctx.font = 'italic 22px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`“${cert.motto}”`, 600, 240);

      ctx.fillStyle = '#5b3a1d';
      ctx.font = '24px "Be Vietnam Pro", sans-serif';
      ctx.fillText('Trân trọng chứng nhận Học viên:', 600, 310);

      ctx.fillStyle = '#7E2A22';
      ctx.font = 'bold 52px "Be Vietnam Pro", sans-serif';
      ctx.fillText(cert.studentName, 600, 385);

      ctx.fillStyle = '#472915';
      ctx.font = 'bold 30px "Be Vietnam Pro", sans-serif';
      ctx.fillText(cert.courseTitle, 600, 465);

      ctx.fillStyle = '#3D6B4A';
      ctx.font = 'bold 26px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`Điểm thi: ${cert.score}/100  ·  Xếp loại: ${cert.gradeLabel}`, 600, 525);

      // Crimson Lotus Seal
      ctx.save();
      ctx.translate(930, 665);
      ctx.strokeStyle = '#B91C1C';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 74, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 64, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#B91C1C';
      ctx.font = 'bold 16px "Be Vietnam Pro", sans-serif';
      ctx.fillText('CHÙA VĨNH TRÀNG', 0, -10);
      ctx.fillText('HỌC VIỆN PHẬT HỌC', 0, 16);
      ctx.font = '13px "Be Vietnam Pro", sans-serif';
      ctx.fillText('ẤN CHỨNG', 0, 40);
      ctx.restore();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#472915';
      ctx.font = '22px "Be Vietnam Pro", sans-serif';
      ctx.fillText(cert.issuedLabel, 110, 650);
      ctx.fillStyle = '#7a4e25';
      ctx.font = 'bold 18px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`Mã xác thực: ${cert.verificationCode} · ${cert.certificateId}`, 110, 690);

      const link = document.createElement('a');
      link.download = `chung-nhan-vinh-trang-${cert.courseId}.png`;
      link.href = c.toDataURL('image/png');
      link.click();
      this.playBellTone(324, 1.6);
      this.showToast('📜 Đã tải Bằng Chứng Nhận PNG', 'Cô bác có thể mở xem hoặc in làm kỷ niệm.', 3400, false);
    });
  }

  openTextbooksModal() {
    const sortedBooks = [...DHARMA_TEXTBOOKS].sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
    this.openModal(
      `Tủ sách Phật học (${sortedBooks.length} quyển PDF)`,
      `
      <div style="display:flex;flex-direction:column;gap:10px;">
        <p style="font-size:14.5px;color:#4a2f18;">
          24 bài học trong Học Viện được biên soạn có hệ thống theo <strong>${sortedBooks.length} quyển kinh sách Phật học</strong> chuẩn mực dưới đây:
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;">
          ${sortedBooks
            .map(
              (b) => `
            <div style="background:#fffdf8;border:1.5px solid rgba(140,100,60,0.28);border-radius:14px;padding:12px 14px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:4px;">
                  <span style="font-size:11.5px;font-weight:800;padding:2px 8px;border-radius:999px;background:#F6E9D2;color:#5C381F;">${b.tierLabel || 'Giáo trình'}</span>
                  <span style="font-size:11.5px;color:#7a4e25;font-weight:700;">${b.durationLabel || ''}</span>
                </div>
                <div style="font-size:15px;font-weight:800;color:#472915;">${b.title}</div>
                <div style="font-size:12.5px;font-weight:700;color:#8c4b1e;margin-top:2px;">Tác giả / Dịch giả: ${b.author}</div>
                <p style="font-size:13px;color:#4a2f18;margin-top:5px;line-height:1.42;">${b.coreTeachings}</p>
              </div>
              <a href="${b.pdfPath}" target="_blank" download style="display:inline-flex;align-items:center;justify-content:center;min-height:44px;border-radius:999px;background:#5C381F;color:#fff;font-size:13.5px;font-weight:700;text-decoration:none;">
                📄 Đọc sách (PDF)
              </a>
            </div>
          `
            )
            .join('')}
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
    } else if (actionHint === 'courtyard_leaf') {
      this.openExploreModal('sweep');
    } else if (actionHint === 'garden') {
      this.openTempleGardenModal(0);
    } else if (actionHint === 'bell_rhythm') {
      this.openBellRhythmModal();
    } else if (actionHint === 'heritage') {
      this.openHeritageBookModal();
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
            this.ensureAudioContext();
            const spoke = this.audio?.speakText?.(text, { rate: this.readAlongRate || 1.0, lang: 'vi-VN', pitch: 0.98 });
            this.playBellTone(360, 1.4);
            this.showToast(
              spoke ? `🙏 ${a.title}` : `🙏 ${a.title} (Bản đọc chữ)`,
              spoke ? a.meaning : `${a.meaning} (Thiết bị chưa cài giọng đọc tiếng Việt — mời cô bác đọc nội dung trên thẻ.)`,
              4500,
              false
            );
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
        const todayKey = getLocalDateKey();
        this.activityHub = ensureDailyMissionDate(this.activityHub, todayKey);
        const collectedIds = this.activityHub?.courtyardTasks?.collectedIds || [];
        box.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div class="activity-banner-row">
              <div>
                <div style="font-size:16px;font-weight:800;color:#FFD875;">🍂 Quét Lá Bồ Đề Vàng Sân Chùa (${collectedIds.length}/${COURTYARD_LEAF_SPOTS.length} hôm nay)</div>
                <div style="font-size:13px;color:#FFF6E5;margin-top:2px;">Nhặt trực tiếp lá vàng phát sáng trên sân 3D hoặc bấm đi tới từng điểm (+15 🪷 · +15 XP mỗi lá, cứ 4 lá thưởng thêm +1 💎).</div>
              </div>
              <div class="store-wallet-pill">Tổng đã quét: ${this.activityHub?.courtyardTasks?.totalSwept || this.spiritual.leavesSwept}</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px;">
              ${COURTYARD_LEAF_SPOTS.map((sp) => {
                const done = collectedIds.includes(sp.id);
                return `
                <div style="background:#fffdf8;border:1.5px solid ${done ? '#3D6B4A' : 'rgba(140,100,60,0.28)'};border-radius:14px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
                  <div>
                    <div style="font-size:13.5px;font-weight:800;color:#5C381F;">${done ? '✓' : '🍂'} ${sp.label}</div>
                    <div style="font-size:12px;color:#6E5034;margin-top:2px;">${done ? 'Đã quét sạch hôm nay' : 'Đang rụng lá vàng trên sân 3D'}</div>
                  </div>
                  ${
                    done
                      ? `<span class="quest-done-tag">Xong</span>`
                      : `<button type="button" class="quest-go-btn" data-sweep-walk="${sp.id}">🚶 Đi quét</button>`
                  }
                </div>`;
              }).join('')}
            </div>
          </div>
        `;
        box.querySelectorAll('[data-sweep-walk]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const lid = btn.getAttribute('data-sweep-walk');
            const spot = COURTYARD_LEAF_SPOTS.find((s) => s.id === lid);
            if (!spot) return;
            this.closeModal();
            this.switchScreen('courtyard');
            if (this.world3d?.insideInterior) this.toggleInteriorHallIn3D(false);
            this.world3d?.walkToPoint?.(spot.pos.x, spot.pos.z, spot.label);
            this.showToast('🍂 Đang đi tới quét lá Bồ Đề', `Bấm trực tiếp vào lá vàng hoặc nhấn [E] khi tới ${spot.label}.`, 3600, false);
          });
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
     TÀI KHOẢN, QUỐC TỊCH, ĐOÀN HÀNH HƯƠNG & TỦ ĐỒ 7 NHÂN VẬT 3D
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
    const activeNat = getNationalityProfile(this.nationalityId);
    const activeMode = getPilgrimageMode(this.pilgrimageModeId);
    this.profilePreviewPose = this.profilePreviewPose || 'Dung';
    const activeVisual = this.buildStoreVisualPayload();
    const activeOutfitText = activeVisual.robeName
      ? `${activeVisual.robeName}${activeVisual.bag ? ' & Túi vải sen' : ''}`
      : activeProf.outfitName;

    this.openModal(
      'Hồ sơ · Quốc tịch · Đoàn hành hương',
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
          <div class="profile-char-name">${activeNat.flag} ${activeProf.name} (${activeProf.heightLabel})</div>
          <div class="profile-char-sub">${activeOutfitText} · ${activeMode.name}</div>
          <div class="profile-char-switch-row">
            ${CHARACTER_PROFILES.map(
              (c) => `
              <button type="button" class="char-switch-btn ${this.characterModelKey === c.key ? 'active' : ''}" data-char="${c.key}">
                ${c.name.split('(')[0].trim()}
              </button>
            `
            ).join('')}
          </div>
          <button type="button" id="btn-account-replay-arrival" class="quest-go-btn" style="width:100%;min-height:44px;margin-top:8px;">
            🚗 Xem lại xe đưa tới chùa
          </button>
        </div>

        <div class="profile-right-col">
          <div class="profile-stats-banner">
            <div><div class="profile-stat-val">${this.spiritual.bowCount}</div><div class="profile-stat-lbl">Lạy Phật</div></div>
            <div><div class="profile-stat-val">${this.spiritual.incenseOfferings}</div><div class="profile-stat-lbl">Lần dâng hương</div></div>
            <div><div class="profile-stat-val">${this.spiritual.malaCycles * 108 + this.spiritual.malaBeads}</div><div class="profile-stat-lbl">Biến niệm Phật</div></div>
            <div><div class="profile-stat-val">${this.completedLessons.size}/24</div><div class="profile-stat-lbl">Bài đã học</div></div>
          </div>

          <div>
            <div class="profile-wardrobe-heading">Quốc tịch &amp; Truyền thống hành hương (${activeNat.flag} ${activeNat.name.split('—')[0].trim()}):</div>
            <div class="profile-nat-pills">
              ${NATIONALITY_PROFILES.map(
                (n) => `
                <button type="button" class="profile-chip-btn ${this.nationalityId === n.id ? 'active' : ''}" data-acc-nat="${n.id}">
                  ${n.flag} ${n.name.split('—')[0].trim()}
                </button>`
              ).join('')}
            </div>
          </div>

          <div>
            <div class="profile-wardrobe-heading">Chế độ &amp; Bạn đồng hành 3D (${activeMode.companions.length} người đi cùng):</div>
            <div class="profile-mode-pills">
              ${PILGRIMAGE_MODES.map(
                (m) => `
                <button type="button" class="profile-chip-btn ${this.pilgrimageModeId === m.id ? 'active' : ''}" data-acc-mode="${m.id}">
                  ${m.name} (${m.companions.length > 0 ? `${m.companions.length} bạn 3D` : 'Tĩnh tâm'})
                </button>`
              ).join('')}
            </div>
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

    document.querySelectorAll('[data-acc-nat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.nationalityId = btn.getAttribute('data-acc-nat') || 'vn';
        this.syncPilgrimageCompanionsTo3D();
        this.saveState();
        this.playMokugyoTap();
        this.openAccountModal();
      });
    });

    document.querySelectorAll('[data-acc-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.pilgrimageModeId = btn.getAttribute('data-acc-mode') || 'solo';
        this.syncPilgrimageCompanionsTo3D();
        this.saveState();
        this.playMokugyoTap();
        this.openAccountModal();
      });
    });

    document.getElementById('btn-account-replay-arrival')?.addEventListener('click', () => {
      this.openArrivalPilgrimageModal();
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
     HÀNH TRÌNH MODAL (Điểm danh · Lộ trình 30 Ngày · Nhật Ký · Nhiệm vụ · Hộp thư · Hướng dẫn)
     ======================================================================== */
  openActivityHubModal(initialTab = 'checkin') {
    let activeTab = initialTab;
    let mailFilter = 'all';
    let feedbackRating = 5;
    const feedbackTags = new Set();
    let feedbackComment = '';
    let selectedWeek = 1;
    let selectedDayPreview = Math.max(1, Math.min(30, (this.practicedDays?.length || 0) + 1));
    if ((this.practicedDays || []).includes(selectedDayPreview)) {
      selectedDayPreview = this.practicedDays[this.practicedDays.length - 1] || 1;
    }
    let selectedMood = 'binh_an';
    let draftJournalText = '';

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
        const rank = getPilgrimRankInfo(this.activityHub.xp || 0);
        bodyHtml = `
          <div class="activity-banner-row">
            <div>
              <div style="font-size:16.5px;font-weight:800;color:#FFD875;">${rank.badge} Cấp bậc: ${rank.title} (Cấp ${rank.level}) · ${rank.xp} XP</div>
              <div style="font-size:13px;color:#FFF6E5;margin-top:2px;">Quét lá, chăm Vườn Phật, Thỉnh Chuông–Mõ và sưu tầm Di Sản mỗi ngày để tích 🪷 &amp; 💎.</div>
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
      } else if (activeTab === 'thirty_days') {
        const seasonal = getTempleSeasonalContext();
        const practicedSet = new Set(this.practicedDays || [1]);
        const weekPlan = THIRTY_DAY_RETREATS.find((w) => w.week === selectedWeek) || THIRTY_DAY_RETREATS[0];
        const daysInWeek = THIRTY_DAY_JOURNEY_PLAN.filter((d) => d.week === selectedWeek);
        const dayTheme = getThirtyDayTheme(selectedDayPreview);
        const dayStation = findAnyTempleDestination(dayTheme.suggestedStation) || PILGRIMAGE_STATIONS[0];
        const isDayDone = practicedSet.has(dayTheme.day);

        bodyHtml = `
          <div class="seasonal-festival-banner">
            <div>
              <div style="font-size:16px;font-weight:800;color:#FFD875;">${seasonal.isFestivalDay ? '🏮 ' : '🪷 '}${seasonal.activeFestival ? seasonal.activeFestival.name : seasonal.lunarLabel}</div>
              <div style="font-size:13px;color:#FFF6E5;margin-top:2px;">${seasonal.greeting}</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              <span class="store-wallet-pill">Đã tu tập ${practicedSet.size}/30 ngày</span>
              <span class="store-wallet-pill">${seasonal.xpMultiplier}x XP</span>
            </div>
          </div>

          <div class="thirty-week-row">
            ${THIRTY_DAY_RETREATS.map(
              (w) => `
              <button type="button" class="thirty-week-pill ${selectedWeek === w.week ? 'active' : ''}" data-thirty-week="${w.week}">
                <strong>Tuần ${w.week}</strong>
                <span>${w.title.replace(/^Tuần \d+:\s*/, '')}</span>
              </button>`
            ).join('')}
          </div>

          <div style="font-size:13.5px;color:#5b3a1d;font-weight:700;padding:4px 2px;">${weekPlan.subtitle}</div>

          <div class="thirty-day-grid">
            ${daysInWeek
              .map((d) => {
                const done = practicedSet.has(d.day);
                const selected = selectedDayPreview === d.day;
                return `
                <button type="button" class="thirty-day-card ${done ? 'done' : ''} ${selected ? 'selected' : ''}" data-thirty-day="${d.day}">
                  <div class="thirty-day-head">
                    <span class="thirty-day-num">Ngày ${d.day}</span>
                    <span>${done ? '✓ Đã tu' : `+${d.rewardLotus} 🪷`}</span>
                  </div>
                  <div class="thirty-day-title">${d.title}</div>
                  ${d.milestoneBadge ? `<div class="thirty-day-badge">🏅 ${d.milestoneBadge}</div>` : ''}
                </button>`;
              })
              .join('')}
          </div>

          <div class="thirty-day-detail-card">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
              <div>
                <div style="font-size:12.5px;font-weight:800;color:#8c4b1e;">NGÀY ${dayTheme.day}/30 · ${dayTheme.retreatTitle}</div>
                <div style="font-size:18px;font-weight:800;color:#472915;margin-top:2px;">${dayTheme.title}</div>
              </div>
              <span class="mail-rewards-pill">+${dayTheme.rewardLotus} 🪷 · +${dayTheme.rewardGems} 💎 · +${dayTheme.rewardXp} XP</span>
            </div>
            <p style="font-size:14.5px;color:#3d2410;line-height:1.5;margin:8px 0 12px;">“${dayTheme.prompt}”</p>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <button type="button" id="btn-thirty-walk-station" class="quest-go-btn" style="min-height:48px;padding:0 16px;">
                🚶 Tới ${dayStation.name}
              </button>
              <button type="button" id="btn-thirty-complete-day" class="arrival-primary-btn" style="flex:1;min-height:48px;" ${isDayDone ? 'disabled' : ''}>
                ${isDayDone ? `✓ Đã hoàn thành Ngày ${dayTheme.day}` : `🪷 Đánh dấu Tu Tập Ngày ${dayTheme.day} (+${dayTheme.rewardLotus} 🪷)`}
              </button>
            </div>
          </div>
        `;
      } else if (activeTab === 'journal') {
        const entries = this.dharmaJournal?.entries || [];
        bodyHtml = `
          <div class="activity-banner-row">
            <div>
              <div style="font-size:16.5px;font-weight:800;color:#FFD875;">📓 Nhật Ký An Tâm · Ghi Chép Lời Nguyện &amp; Chánh Niệm</div>
              <div style="font-size:13px;color:#FFF6E5;margin-top:2px;">Mỗi ngày viết một dòng biết ơn hoặc cảm nhận khi về thăm Chùa Vĩnh Tràng (+20 🪷 · +15 XP).</div>
            </div>
            <button type="button" id="btn-journal-open-hoadang" class="quest-claim-btn" style="min-height:44px;">🏮 Thả Hoa Đăng</button>
          </div>

          <div class="journal-compose-card">
            <div style="font-size:14px;font-weight:800;color:#472915;margin-bottom:6px;">Tâm trạng hôm nay:</div>
            <div class="journal-moods-row">
              ${DHARMA_JOURNAL_MOODS.map(
                (m) => `
                <button type="button" class="journal-mood-btn ${selectedMood === m.id ? 'active' : ''}" data-journal-mood="${m.id}">
                  <span>${m.icon}</span>
                  <span>${m.label}</span>
                </button>`
              ).join('')}
            </div>
            <textarea id="journal-entry-input" class="feedback-textarea" rows="3" placeholder="Hôm nay lòng cô bác thế nào? Viết lại một điều biết ơn hoặc lời chúc an lành...">${draftJournalText}</textarea>
            <button type="button" id="btn-save-journal-entry" class="arrival-primary-btn" style="width:100%;min-height:48px;margin-top:8px;">
              🪷 Lưu trang Nhật Ký (+20 🪷 · +15 XP)
            </button>
          </div>

          <div class="hub-section-heading">📖 Các trang Nhật Ký đã lưu (${entries.length})</div>
          <div class="journal-entries-list">
            ${entries
              .slice(0, 14)
              .map(
                (e) => `
              <article class="journal-entry-card">
                <div class="journal-entry-head">
                  <span class="journal-entry-mood">${e.moodIcon || '🪷'} ${e.moodLabel || 'Bình an'}</span>
                  <span class="journal-entry-date">${e.createdAt || e.dateKey || ''}</span>
                </div>
                <p class="journal-entry-text">${e.text}</p>
              </article>`
              )
              .join('')}
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
            <button type="button" class="activity-tab-pill ${activeTab === 'thirty_days' ? 'active' : ''}" data-hub-tab="thirty_days">
              🗓️ 30 Ngày
            </button>
            <button type="button" class="activity-tab-pill ${activeTab === 'journal' ? 'active' : ''}" data-hub-tab="journal">
              📓 Nhật Ký
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

      document.querySelectorAll('[data-thirty-week]').forEach((btn) => {
        btn.addEventListener('click', () => {
          selectedWeek = Math.max(1, Math.min(4, Number(btn.getAttribute('data-thirty-week') || 1)));
          selectedDayPreview = (selectedWeek - 1) * 7 + 1;
          this.playMokugyoTap();
          renderHub();
        });
      });

      document.querySelectorAll('[data-thirty-day]').forEach((btn) => {
        btn.addEventListener('click', () => {
          selectedDayPreview = Math.max(1, Math.min(30, Number(btn.getAttribute('data-thirty-day') || 1)));
          this.playMokugyoTap();
          renderHub();
        });
      });

      document.getElementById('btn-thirty-walk-station')?.addEventListener('click', () => {
        const dayTheme = getThirtyDayTheme(selectedDayPreview);
        this.closeModal();
        this.switchScreen('courtyard');
        if (this.world3d?.insideInterior) {
          this.toggleInteriorHallIn3D(false);
        }
        this.walkToStationIn3D(dayTheme.suggestedStation || 'chanh_dien');
      });

      document.getElementById('btn-thirty-complete-day')?.addEventListener('click', () => {
        const dayTheme = getThirtyDayTheme(selectedDayPreview);
        if (!Array.isArray(this.practicedDays)) this.practicedDays = [1];
        if (this.practicedDays.includes(dayTheme.day)) return;
        this.practicedDays.push(dayTheme.day);
        this.practicedDays.sort((a, b) => a - b);
        this.storeProfile.lotusPoints += dayTheme.rewardLotus || 40;
        this.storeProfile.gems += dayTheme.rewardGems || 3;
        this.grantPilgrimXp(dayTheme.rewardXp || 30, `Tu tập Ngày ${dayTheme.day}/30`);
        this.spiritual = recordSpiritualMilestone(this.spiritual, `Hoàn thành Ngày ${dayTheme.day} · ${dayTheme.title}`);
        this.saveState();
        this.updateActionBadges();
        this.audio?.playBlessingChime?.();
        this.audio?.playCoinLotusSfx?.();
        this.showToast(
          `🗓️ Hoàn thành Ngày ${dayTheme.day}/30`,
          `${dayTheme.milestoneBadge ? `🏅 Nhận danh hiệu: ${dayTheme.milestoneBadge} · ` : ''}+${dayTheme.rewardLotus} 🪷 · +${dayTheme.rewardGems} 💎`,
          4400,
          true
        );
        if (selectedDayPreview < 30) {
          selectedDayPreview += 1;
          selectedWeek = Math.min(4, Math.ceil(selectedDayPreview / 7));
        }
        renderHub();
      });

      document.getElementById('btn-journal-open-hoadang')?.addEventListener('click', () => {
        this.openHoaDangModal();
      });

      document.querySelectorAll('[data-journal-mood]').forEach((btn) => {
        btn.addEventListener('click', () => {
          draftJournalText = document.getElementById('journal-entry-input')?.value || draftJournalText;
          selectedMood = btn.getAttribute('data-journal-mood') || 'binh_an';
          this.playMokugyoTap();
          renderHub();
        });
      });

      document.getElementById('btn-save-journal-entry')?.addEventListener('click', () => {
        const txt = document.getElementById('journal-entry-input')?.value || '';
        const res = addJournalEntry(this.dharmaJournal, txt, selectedMood, getLocalDateKey());
        if (!res.ok) {
          this.showToast('Nhật Ký An Tâm', res.message, 3400, false);
          return;
        }
        this.dharmaJournal = res.state;
        draftJournalText = '';
        this.storeProfile.lotusPoints += 20;
        this.grantPilgrimXp(15, 'Viết Nhật Ký An Tâm');
        this.saveState();
        this.updateActionBadges();
        this.audio?.playBlessingChime?.();
        this.showToast('📓 Đã lưu Nhật Ký An Tâm', `${res.message} (+20 🪷 · +15 XP)`, 4000, false);
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

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'default' });
      renderer.debug.checkShaderErrors = false;
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
                if (!geomBox) {
                  geomBox = o.geometry.boundingBox.clone();
                } else {
                  geomBox.union(o.geometry.boundingBox);
                }
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
        const targetH = profile.heightMeters || 1.62;
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
      let contextLost = false;
      let dragging = false;
      let prevX = 0;
      const onContextLost = (e) => {
        e.preventDefault();
        contextLost = true;
      };
      const onContextRestored = () => {
        contextLost = false;
      };
      canvas.addEventListener('webglcontextlost', onContextLost, false);
      canvas.addEventListener('webglcontextrestored', onContextRestored, false);

      const safeRender = () => {
        if (disposed || contextLost) return;
        try {
          if (renderer.getContext?.()?.isContextLost?.()) return;
          renderer.render(scene, camera);
        } catch {}
      };

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

      let profileTimer = null;
      this._profileStageDispose = () => {
        disposed = true;
        if (profileTimer) clearTimeout(profileTimer);
        canvas.removeEventListener('webglcontextlost', onContextLost, false);
        canvas.removeEventListener('webglcontextrestored', onContextRestored, false);
        canvas.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointermove', onMove);
        renderer.dispose();
        try {
          renderer.forceContextLoss?.();
        } catch {}
      };

      stageGroup.rotation.y = 0.18;
      safeRender();

      const tickDelay = this.world3d?.isSoftwareGl ? 240 : 33;
      const tick = () => {
        if (disposed || !document.body.contains(canvas)) {
          if (!disposed) this._profileStageDispose?.();
          return;
        }
        if (mixer) mixer.update(tickDelay / 1000);
        if (!dragging) stageGroup.rotation.y += 0.006;
        safeRender();
        profileTimer = setTimeout(() => {
          if (!disposed) requestAnimationFrame(tick);
        }, tickDelay);
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

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'default' });
      renderer.debug.checkShaderErrors = false;
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
      let contextLost = false;
      let dragging = false;
      let prevX = 0;
      const onContextLost = (e) => {
        e.preventDefault();
        contextLost = true;
      };
      const onContextRestored = () => {
        contextLost = false;
      };
      canvas.addEventListener('webglcontextlost', onContextLost, false);
      canvas.addEventListener('webglcontextrestored', onContextRestored, false);

      const safeRender = () => {
        if (disposed || contextLost) return;
        try {
          if (renderer.getContext?.()?.isContextLost?.()) return;
          renderer.render(scene, camera);
        } catch {}
      };

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

      let arhatTimer = null;
      this._arhatStageDispose = () => {
        disposed = true;
        if (arhatTimer) clearTimeout(arhatTimer);
        canvas.removeEventListener('webglcontextlost', onContextLost, false);
        canvas.removeEventListener('webglcontextrestored', onContextRestored, false);
        canvas.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointermove', onMove);
        renderer.dispose();
        try {
          renderer.forceContextLoss?.();
        } catch {}
      };

      stageGroup.rotation.y = 0.25;
      safeRender();

      const tickDelay = this.world3d?.isSoftwareGl ? 240 : 33;
      const tick = () => {
        if (disposed || !document.body.contains(canvas)) {
          if (!disposed) this._arhatStageDispose?.();
          return;
        }
        if (!dragging) stageGroup.rotation.y += 0.0065;
        safeRender();
        arhatTimer = setTimeout(() => {
          if (!disposed) requestAnimationFrame(tick);
        }, tickDelay);
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
    if (this._interactiveStageDispose) {
      try {
        this._interactiveStageDispose();
      } catch {}
      this._interactiveStageDispose = null;
    }

    try {
      const THREE = await import('three');
      const rect = canvas.parentElement.getBoundingClientRect();
      const w = Math.max(240, rect.width || 320);
      const h = Math.max(220, rect.height || 260);

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'default' });
      renderer.debug.checkShaderErrors = false;
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
      let disposed = false;
      let contextLost = false;
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
      const onContextLost = (e) => {
        e.preventDefault();
        contextLost = true;
      };
      const onContextRestored = () => {
        contextLost = false;
      };
      canvas.addEventListener('webglcontextlost', onContextLost, false);
      canvas.addEventListener('webglcontextrestored', onContextRestored, false);

      const safeRender = () => {
        if (disposed || contextLost) return;
        try {
          if (renderer.getContext?.()?.isContextLost?.()) return;
          renderer.render(scene, camera);
        } catch {}
      };

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
        if (isSoftPreview) safeRender();
      };
      canvas.addEventListener('pointerdown', onDown);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointermove', onMove);

      let rafId = null;
      let timerId = null;
      const cleanup = () => {
        if (disposed) return;
        disposed = true;
        if (timerId) clearTimeout(timerId);
        if (rafId) cancelAnimationFrame(rafId);
        canvas.removeEventListener('webglcontextlost', onContextLost, false);
        canvas.removeEventListener('webglcontextrestored', onContextRestored, false);
        canvas.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointermove', onMove);
        renderer.dispose();
        try {
          renderer.forceContextLoss?.();
        } catch {}
      };
      this._interactiveStageDispose = cleanup;

      const animate = () => {
        if (disposed || !document.body.contains(canvas)) {
          cleanup();
          return;
        }
        if (!dragging) stageGroup.rotation.y += 0.008;
        safeRender();
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
    document.getElementById('nav-seasonal-pill')?.addEventListener('click', () => {
      this.openActivityHubModal('thirty_days');
    });

    const audioBtn = document.getElementById('nav-btn-audio');
    const audioPopover = document.getElementById('audio-mixer-popover');
    const setAudioPopoverOpen = (open) => {
      if (!audioPopover || !audioBtn) return;
      audioPopover.style.display = open ? 'block' : 'none';
      audioBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    audioBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.ensureAudioContext();
      const isOpen = audioPopover?.style.display === 'block';
      setAudioPopoverOpen(!isOpen);
      this.updateAudioMixerUI();
    });
    document.getElementById('btn-close-audio-mixer')?.addEventListener('click', () => {
      setAudioPopoverOpen(false);
    });
    document.addEventListener('click', (e) => {
      if (!audioPopover || audioPopover.style.display !== 'block') return;
      if (audioPopover.contains(e.target) || audioBtn?.contains(e.target)) return;
      setAudioPopoverOpen(false);
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
            '1. Lối Góc Dưới Bên Phải · Dải Bàn Thờ',
            'Đi một đường thẳng từ góc dưới bên phải qua Tượng Phật Nghìn Mắt Nghìn Tay, Chỗ Ngủ Của Phật, Ban Dược Sư, Địa Tạng và Văn Thù – Phổ Hiền.'
          ],
          nghin_mat_nghin_tay: [
            '🙏 Ban Tượng Phật Nghìn Mắt Nghìn Tay',
            'Tôn tượng Đức Thiên Thủ Thiên Nhãn Quán Thế Âm thếp vàng uy nghiêm mở đầu dải bàn thờ bên phải.'
          ],
          cho_ngu_cua_phat: [
            '🪷 Chỗ Ngủ Của Phật · Đức Phật Nhập Niết Bàn',
            'Khám thờ gỗ căm xe chạm trổ cùng rèm gấm đỏ tôn trí Đức Phật an nhiên Cát Tường Ngoạ.'
          ],
          chanh_dien: [
            '2. Cạnh Trên Hình Vuông · Chính Điện Lễ Phật',
            'Đại Hùng Bửu Điện với Bàn Thờ Tam Bảo, 3 bồ đoàn quỳ lạy Phật, Tháp Đèn Cầu An, cặp Long Trụ, Đại Hồng Chung & Trống Bát Nhã.'
          ],
          ho_sen_bo: [
            '3. Giữa Hình Vuông · Hồ Sen Bộ & Hòn Non Bộ',
            'Khoảng sân mở chính giữa bốn dãy vòm vàng Pháp–Việt với Hồ Sen nở rộ, cá Koi bơi lội, cầu đá và Hòn Non Bộ cổ kính.'
          ],
          hanh_lang_trai: [
            '4. Cạnh Trái Hình Vuông · Tổ Đường & 18 Vị La Hán',
            'Tổ Đường Sơ Tổ Bồ Đề Đạt Ma và dãy 18 vị La Hán sơn son thếp vàng dọc hành lang phía Tây.'
          ],
          hanh_lang_duoi: [
            '5. Cạnh Dưới Hình Vuông · Vi Đà Hộ Pháp & Bia Cổ Tự',
            'Hành lang phía Nam khép kín vòng dạo hình vuông với Ban Hộ Pháp Vi Đà, Tiêu Diện Đại Sĩ và Bia Cổ Tự Vĩnh Tràng (1849).'
          ],
          trai_duong: [
            '🍚 Nhà Sàn Gỗ Trai Đường',
            'Khu ăn chay Phật tử dựng bằng gỗ căm xe trên sàn cọc miền Tây nối qua cổng vòm hành lang phải.'
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
    document.getElementById('btn-toggle-goals-tracker')?.addEventListener('click', () => {
      this.goalsTrackerCollapsed = !this.goalsTrackerCollapsed;
      this.saveState();
      this.refreshGoalsTrackerHUD();
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
      if (e.code === 'Space' && this._rhythmSession?.active && typeof this._rhythmSession.strike === 'function') {
        e.preventDefault();
        this._rhythmSession.strike();
        return;
      }
      const dir = keyMap[e.code];
      if (dir && this.activeScreen === 'courtyard') {
        e.preventDefault();
        this.world3d?.setHeldDirection(dir, true);
        if (!e.repeat && !this.world3d) {
          this.handleMoveDirection(dir);
        }
      } else if (e.code === 'KeyE' && this.activeScreen === 'courtyard') {
        if (this.handleProximityInteract()) {
          e.preventDefault();
        }
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
