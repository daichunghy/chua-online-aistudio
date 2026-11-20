/**
 * ChuaOnlineApp — controller giao diện Chùa Online.
 * File này giữ constructor/state/init; các nhóm method nằm trong src/app/ui/*.mjs (xem docs/ARCHITECTURE.md).
 */

import { CHARACTER_PROFILES, INITIAL_UGC_GALLERY, createSpiritualState, checkUGCMilestoneUnlock, calculateJourneyImprint, calculateCartSummary, getLocalDateKey, fetchDailyDharmaService, COURTYARD_NPC_DHARMA_QUOTES, createStoreProfileState, TIME_OF_DAY_PRESETS, createActivityHubState, ensureDailyMissionDate, NATIONALITY_PROFILES, PILGRIMAGE_MODES, HOA_DANG_WISHES, createDharmaJournalState, ACADEMY_COURSES, createAcademyEntitlementState, createBlessingTowerState, mergeBlessingTowerEntries, createSocialState, createSutraStudyState, SutraStudyController, TempleAudioEngine, STORAGE_KEY, applyMixins, createVisitorClientId, createAmbientSettingsState, DEFAULT_TEMPLE_ID, createPilgrimagePassportState, getActiveTempleRecord, createPilgrimageDepthState, mergeShopeeAffiliateOverrides } from './ui/shared.mjs';
import { shellDomMethods } from './ui/shell-dom.mjs';
import { world3dBridgeMethods } from './ui/world3d-bridge.mjs';
import { effectsAudioMethods } from './ui/effects-audio.mjs';
import { pilgrimageModalsMethods } from './ui/pilgrimage-modals.mjs';
import { hudNavigationMethods } from './ui/hud-navigation.mjs';
import { templeModalsMethods } from './ui/temple-modals.mjs';
import { shopAndRitualsMethods } from './ui/shop-and-rituals.mjs';
import { lectureAcademyMethods } from './ui/lecture-academy.mjs';
import { ugcAndQuestsMethods } from './ui/ugc-and-quests.mjs';
import { exploreAccountMethods } from './ui/explore-account.mjs';
import { activityHubMethods } from './ui/activity-hub.mjs';
import { stagesAndStoreMethods } from './ui/stages-and-store.mjs';
import { modalAndEventsMethods } from './ui/modal-and-events.mjs';
import { passportAndCloudMethods } from './ui/passport-and-cloud.mjs';
import { socialHubMethods } from './ui/social-hub.mjs';

export class ChuaOnlineApp {
  constructor() {
    this.saved = this.loadState();
    this.playerPos = { x: 40.5, z: 43.8, yaw: Math.PI, moving: false };
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
    this.timeOfDayMode = this.saved.timeOfDayMode === 'manual' ? 'manual' : 'auto';
    this.timeOfDay =
      this.timeOfDayMode === 'manual' && TIME_OF_DAY_PRESETS[this.saved.timeOfDay]
        ? this.saved.timeOfDay
        : this.resolveAutoTimeOfDay();
    this.cameraViewMode = 'third';
    this.weatherPreset = 'clear';
    this.elderFontScale = ['normal', 'large', 'xlarge'].includes(this.saved.elderFontScale)
      ? this.saved.elderFontScale
      : 'normal';
    this.readAlongRate = this.saved.readAlongRate === 0.85 ? 0.85 : 1.0;
    this.activeGuidedBeacon = null;
    this.ttsSpeaking = false;
    this.mindfulnessTimer = { running: false, intervalId: null, totalSec: 300, remainingSec: 300 };
    this.storeCategory = 'ao_trang';
    this.marketStallTab = 'all';
    this.pilgrimageDepth = createPilgrimageDepthState(this.saved.pilgrimageDepth);
    this.shopeeAffiliateOverrides = this.loadShopeeAffiliateOverrides();
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
    this.blessingTower = this.loadMergedBlessingTowerState(this.saved.blessingTower);
    this.dharmaJournal = createDharmaJournalState(this.saved.dharmaJournal);
    this.academyState = createAcademyEntitlementState(this.saved.academyState);
    this.sutraStudy = createSutraStudyState(this.saved.sutraStudy);
    this.sutraCtrl = new SutraStudyController(this);
    this.activeCourseId = ACADEMY_COURSES.some((c) => c.id === this.saved.activeCourseId)
      ? this.saved.activeCourseId
      : 'course_1_khai_tam';
    this.activeModuleId = this.saved.activeModuleId || null;
    this.practicedDays = Array.isArray(this.saved.practicedDays) ? [...this.saved.practicedDays] : [1];
    this.studentName = String(this.saved.studentName || 'Phật tử Tâm An').trim() || 'Phật tử Tâm An';
    this.social = createSocialState(this.saved.social, {
      name: this.studentName,
      charKey: this.characterModelKey
    });

    // Multi-temple Sổ Hành Hương & Cloud Sync state
    this.passport = createPilgrimagePassportState(this.saved.passport, {
      visitedHeritageIds: this.activityHub?.heritageBook?.discoveredIds || [],
      visitedArhatIds: [],
      practicedDays: [],
      journalEntries: this.dharmaJournal?.entries || []
    });
    this.cloudUser = null;
    this.communityLanterns = [];
    this.zenHudCollapsed = false;
    this.titleOverlayDismissed = false;

    this.uploadedUserPhotoDataUrl = this.saved.uploadedUserPhotoDataUrl || null;
    this.lastDailyDharmaDate = this.saved.lastDailyDharmaDate || null;
    this.lastDailyDharmaQuoteId = this.saved.lastDailyDharmaQuoteId || null;
    this.dailyDharmaQuotes = [...COURTYARD_NPC_DHARMA_QUOTES];
    this.activeNpcSpeech = null;
    this.lastNpcQuoteId = null;
    this.dismissedNpcId = null;
    this.activeStationKey = 'cong_tam_quan';

    // Active screen & sub-views
    this.activeScreen = 'courtyard'; // 'courtyard' | 'shop' | 'lecture'
    this.shopTab = 'souvenir'; // 'souvenir' | 'study' | '3d'
    this.lectureTab = 'sutra'; // 'sutra' | 'listen' | 'lesson' | 'package'
    this.activePathId = 'A';
    this.activeLessonId = 'A1';
    this.selectedQuizOption = null;
    this.quizFeedback = null;
    this.quizNotice = null;
    this.autoWalkObjective = null;

    // Unified TempleAudioEngine + Ambient Audio Manager (distant chanting + temple bells)
    const savedMixer = this.saved.audioMixer && typeof this.saved.audioMixer === 'object' ? this.saved.audioMixer : {};
    this.ambientSettings = createAmbientSettingsState(
      this.saved.ambientSettings ||
        (typeof savedMixer.ambientEnabled === 'boolean'
          ? { enabled: savedMixer.ambientEnabled, ...(savedMixer.ambientLayers || {}) }
          : null)
    );
    this.audio = new TempleAudioEngine({
      masterVolume: savedMixer.masterVolume ?? 1.0,
      ambientVolume: savedMixer.ambientVolume ?? 0.45,
      sfxVolume: savedMixer.sfxVolume ?? 0.85,
      voiceVolume: savedMixer.voiceVolume ?? 0.9,
      muted: Boolean(savedMixer.muted),
      ambientEnabled: this.ambientSettings.enabled,
      ambientLayers: this.ambientSettings,
      onVoiceStateChange: ({ playing, fileName }) => {
        this.audioPlaying = Boolean(playing);
        if (fileName) this.currentAudioFile = fileName;
        if (this.activeScreen === 'lecture') this.renderLectureStage();
      },
      onSpeechStateChange: ({ speaking }) => {
        this.ttsSpeaking = Boolean(speaking);
        if (this.activeScreen === 'lecture') this.renderLectureStage();
      },
      onAmbientStateChange: () => {
        this.updateAudioMixerUI?.();
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

    // Live temple visitor presence state (server-authoritative)
    this.visitorClientId = this.getOrCreateVisitorClientId();
    this.visitorPresenceState = {
      onlineCount: 1,
      todayVisits: 1,
      visitors: [
        {
          clientId: this.visitorClientId,
          nationalityId: this.nationalityId,
          characterModelKey: this.characterModelKey,
          zone: 'Sân chùa'
        }
      ]
    };
    this._visitorEventSource = null;
    this._visitorHeartbeatTimer = null;
  }

  getOrCreateVisitorClientId() {
    try {
      const key = 'chua_online_visitor_tab_id';
      const existing = sessionStorage.getItem(key);
      if (existing && /^[a-zA-Z0-9_-]{4,64}$/.test(existing)) return existing;
      const fresh = createVisitorClientId();
      sessionStorage.setItem(key, fresh);
      return fresh;
    } catch {
      return createVisitorClientId();
    }
  }

  resolveAutoTimeOfDay(now = new Date()) {
    const h = now.getHours();
    if (h >= 5 && h < 10) return 'morning';
    if (h >= 10 && h < 15) return 'midday';
    if (h >= 15 && h < 18) return 'sunset';
    return 'evening';
  }

  loadMergedBlessingTowerState(savedTower) {
    const base = createBlessingTowerState(savedTower);
    try {
      const rawBackup = localStorage.getItem('chua_online_blessing_tower_v2');
      if (rawBackup) {
        const parsed = JSON.parse(rawBackup);
        const backupEntries = Array.isArray(parsed?.entries) ? parsed.entries : [];
        if (backupEntries.length > 0) {
          return mergeBlessingTowerEntries(base, backupEntries);
        }
      }
    } catch {}
    return base;
  }

  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  loadShopeeAffiliateOverrides() {
    try {
      const raw = localStorage.getItem('chua_online_shopee_affiliate_v1');
      const parsed = raw ? JSON.parse(raw) : {};
      return mergeShopeeAffiliateOverrides(parsed);
    } catch {
      return mergeShopeeAffiliateOverrides({});
    }
  }

  saveShopeeAffiliateOverrides(overrides) {
    const clean = mergeShopeeAffiliateOverrides(overrides);
    this.shopeeAffiliateOverrides = clean;
    try {
      localStorage.setItem('chua_online_shopee_affiliate_v1', JSON.stringify(clean));
    } catch {}
    return clean;
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
          timeOfDayMode: this.timeOfDayMode,
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
          social: this.social,
          dharmaJournal: this.dharmaJournal,
          academyState: this.academyState,
          sutraStudy: this.sutraStudy,
          activeCourseId: this.activeCourseId,
          activeModuleId: this.activeModuleId,
          practicedDays: this.practicedDays.slice(0, 30),
          studentName: this.studentName,
          passport: this.passport,
          audioMixer: this.audio ? this.audio.getMixerState() : undefined,
          ambientSettings: this.ambientSettings,
          uploadedUserPhotoDataUrl: this.uploadedUserPhotoDataUrl,
          lastDailyDharmaDate: this.lastDailyDharmaDate,
          lastDailyDharmaQuoteId: this.lastDailyDharmaQuoteId,
          pilgrimageDepth: this.pilgrimageDepth
        })
      );
      if (this.blessingTower?.entries?.length) {
        localStorage.setItem('chua_online_blessing_tower_v2', JSON.stringify(this.blessingTower));
      }
    } catch {}
  }

  init() {
    this.mountDOM();
    this.initLive3DWorld();
    this.setTimeOfDay(this.timeOfDay, true, false);
    this.applyElderFontScale(this.elderFontScale, false);
    this.updateAudioMixerUI();
    this.bindEvents();
    this.bindSoftJoystick();
    this.renderShopProducts();
    this.renderLectureStage();
    this.updateActionBadges();
    this.updateSocialBadge();
    this.refreshTopStampSummary();
    this.refreshGuidedNextButton();
    this.initVisitorPresence();
    this.initFirebaseAndCloudSync();

    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      this.world3d?.skipArrivalCutscene?.(true);
      this.enterTempleFromTitleOverlay();
    } else {
      document.body.classList.add('title-overlay-active');
      this.world3d?.setTitlePanMode?.(true);
      this.syncPilgrimageCompanionsTo3D();
    }

    fetchDailyDharmaService({ url: '/data/daily-dharma.json' })
      .then((res) => {
        if (Array.isArray(res?.quotes) && res.quotes.length > 0) {
          this.dailyDharmaQuotes = res.quotes;
        }
      })
      .catch(() => {});

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
        ambientSettings: this.ambientSettings,
        ambientRunning: Boolean(this.audio?.isAmbientRunning),
        hoaDangCount: this.hoaDangWishes.length,
        blessingTowerCount: this.blessingTower?.entries?.length || 0,
        journalCount: this.dharmaJournal?.entries?.length || 0,
        academyUnlockedCourses: this.academyState?.unlockedCourses || [],
        sutraStudy: this.sutraStudy,
        sutraMode: this.sutraCtrl?.mode || 'chant',
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
        activeNpcQuote: this.activeNpcSpeech
          ? {
              npcId: this.activeNpcSpeech.npcId,
              speaker: this.activeNpcSpeech.speaker?.label || null,
              quoteId: this.activeNpcSpeech.quote?.id || null
            }
          : null,
        visitorOnlineCount: this.visitorPresenceState?.onlineCount || 1,
        cloudSignedIn: Boolean(this.cloudUser?.uid),
        titleOverlayVisible: !this.titleOverlayDismissed,
        passportSummary: (() => {
          const rec = getActiveTempleRecord(this.passport, this.passport?.activeTempleId || DEFAULT_TEMPLE_ID);
          return {
            activeTempleId: this.passport?.activeTempleId || DEFAULT_TEMPLE_ID,
            heritageStamps: rec.heritageStamps.length,
            arhatStamps: rec.arhatStamps.length,
            journalEntries: this.passport?.journalEntries?.length || 0,
            memoryPhotos: this.passport?.memoryPhotos?.length || 0
          };
        })(),
        cartSummary: calculateCartSummary(this.cart)
      });
  }
}

applyMixins(ChuaOnlineApp,
  shellDomMethods,
  world3dBridgeMethods,
  effectsAudioMethods,
  pilgrimageModalsMethods,
  hudNavigationMethods,
  templeModalsMethods,
  shopAndRitualsMethods,
  lectureAcademyMethods,
  ugcAndQuestsMethods,
  exploreAccountMethods,
  activityHubMethods,
  stagesAndStoreMethods,
  modalAndEventsMethods,
  passportAndCloudMethods,
  socialHubMethods
);

document.addEventListener('DOMContentLoaded', () => {
  const app = new ChuaOnlineApp();
  window.chuaApp = app;
  app.init();
});
