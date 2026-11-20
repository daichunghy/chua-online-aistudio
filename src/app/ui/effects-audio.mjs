/**
 * Hạt hiệu ứng, âm thanh chuông/mõ/giọng đọc, bộ trộn âm.
 *
 * Mixin của ChuaOnlineApp: 15 method (initParticleFX … syncHoaDangLanternsTo3D).
 * Được gắn vào class trong chua-online-app.mjs qua applyMixins().
 */
import {
  getPilgrimageMode,
  TempleAudioEngine,
  toggleAmbientSettings,
  toggleAmbientLayer,
  formatAmbientToggleDisplay
} from './shared.mjs';

export const effectsAudioMethods = {
  /* ========================================================================
     2D FLOATING PARTICLES DISABLED (Outdoor air stays crisp; footsteps use 3D FX)
     ======================================================================== */
  initParticleFX() {
    this.particles = [];
    const fx = document.getElementById('fx-canvas');
    if (fx) {
      const ctx = fx.getContext('2d');
      ctx?.clearRect(0, 0, fx.width, fx.height);
    }
  },

  resizeFXCanvas() {
    const fx = document.getElementById('fx-canvas');
    if (!fx) return;
    fx.width = window.innerWidth;
    fx.height = window.innerHeight;
  },

  createParticle() {
    return null;
  },

  stepParticles() {},

  /* ========================================================================
     SOUND, SOUNDSCAPE & VOICEOVER ENGINE (Unified TempleAudioEngine)
     ======================================================================== */
  ensureAudioContext() {
    this.audio?.unlock?.();
    if (this.audio && this.audio.ambientEnabled && !this.audio.isAmbientRunning && !this.audioMuted) {
      this.audio.startAmbient(this.world3d?.insideInterior ? 'interior' : 'exterior');
    }
  },

  playBellTone(freq = 216, duration = 2.6) {
    this.ensureAudioContext();
    const pitchScale = Math.max(0.45, Math.min(2.2, Number(freq || 196) / 196));
    const strength = Math.max(0.35, Math.min(1.25, Number(duration || 2.6) / 3.0));
    this.audio?.playBronzeBell?.(pitchScale, strength);
  },

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
  },

  playMokugyoTap(accent = false) {
    this.ensureAudioContext();
    this.audio?.playWoodenMokugyo?.(Boolean(accent));
  },

  playVoiceAudio(fileName, options = {}) {
    if (!fileName) return;
    this.ensureAudioContext();
    this.currentAudioFile = fileName;
    const rate = options?.rate ?? this.readAlongRate ?? 1.0;
    this.audio?.playVoiceAudio?.(fileName, { ...options, rate });
  },

  pauseVoiceAudio() {
    this.audio?.pauseVoice?.();
    this.audioPlaying = false;
  },

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

    const display = formatAmbientToggleDisplay(this.ambientSettings, { audioMuted: this.audioMuted });
    const hudToggle = document.getElementById('hud-ambient-toggle');
    if (hudToggle) {
      hudToggle.classList.toggle('is-on', display.isOn);
      hudToggle.setAttribute('aria-checked', display.isOn ? 'true' : 'false');
      hudToggle.setAttribute('aria-label', display.ariaLabel);
      const iconEl = hudToggle.querySelector('.ambient-hud-icon');
      if (iconEl) iconEl.textContent = display.isOn ? '🔔' : '🔕';
    }

    const mixerToggle = document.getElementById('btn-mixer-ambient-toggle');
    if (mixerToggle) {
      mixerToggle.classList.toggle('is-on', display.isOn);
      mixerToggle.setAttribute('aria-checked', display.isOn ? 'true' : 'false');
    }
    const mixerSub = document.getElementById('mixer-ambient-subtitle');
    if (mixerSub) {
      mixerSub.textContent = display.isOn
        ? `Đang phát nhẹ (${display.statusLabel})`
        : this.audioMuted
          ? 'Toàn bộ âm thanh đang tắt tiếng'
          : 'Âm thanh nền đang tắt';
    }

    const masterPct = Math.round((Number(st.masterVolume ?? 1)) * 100);
    const masterSlider = document.getElementById('slider-master-vol');
    const masterVal = document.getElementById('val-master-vol');
    if (masterSlider && Number(masterSlider.value) !== masterPct) masterSlider.value = String(masterPct);
    if (masterVal) masterVal.textContent = `${masterPct}%`;
  },

  toggleAmbientAudio(forceEnabled = null) {
    const turningOn =
      typeof forceEnabled === 'boolean'
        ? forceEnabled
        : this.audioMuted || !this.ambientSettings?.enabled;

    if (turningOn && this.audioMuted) {
      this.audio?.setMuted?.(false);
      this.audioMuted = false;
    }

    this.ambientSettings = toggleAmbientSettings(this.ambientSettings, turningOn);
    if (turningOn && !this.ambientSettings.chanting && !this.ambientSettings.bells && !this.ambientSettings.atmosphere) {
      this.ambientSettings = { ...this.ambientSettings, chanting: true, bells: true, atmosphere: true };
      this.audio?.setAmbientLayers?.(this.ambientSettings);
    }
    this.audio?.setAmbientEnabled?.(this.ambientSettings.enabled);
    this.updateAudioMixerUI();
    this.saveState();
    this.showToast?.(
      this.ambientSettings.enabled ? '🪷 Đã bật nhạc nền chùa' : '🔕 Đã tắt nhạc nền chùa',
      this.ambientSettings.enabled
        ? 'Tiếng niệm Phật từ xa & chuông chùa sẽ ngân nhẹ nhàng trong không gian.'
        : 'Đã tạm lắng nhạc nền. Cô bác vẫn nghe tiếng chuông, mõ khi hành lễ.',
      2600,
      false
    );
  },

  toggleAmbientAudioLayer(layerKey, forceValue = null) {
    this.ambientSettings = toggleAmbientLayer(this.ambientSettings, layerKey, forceValue);
    if (this.ambientSettings.enabled && this.audioMuted) {
      this.audio?.setMuted?.(false);
      this.audioMuted = false;
    }
    this.audio?.setAmbientLayers?.(this.ambientSettings);
    this.audio?.setAmbientEnabled?.(this.ambientSettings.enabled);
    this.updateAudioMixerUI();
    this.saveState();
  },

  setAudioMuted(muted) {
    this.audio?.setMuted?.(Boolean(muted));
    this.audioMuted = Boolean(this.audio?.muted);
    if (!this.audioMuted) {
      this.ensureAudioContext();
      this.audio?.playBlessingChime?.();
    }
    this.updateAudioMixerUI();
    this.saveState();
  },

  saveAudioMixerState() {
    this.updateAudioMixerUI();
    this.saveState();
  },

  syncPilgrimageCompanionsTo3D() {
    if (!this.world3d?.setPilgrimageCompanions) return;
    const mode = getPilgrimageMode(this.pilgrimageModeId);
    this.world3d.setPilgrimageCompanions(mode, this.nationalityId);
  },

  syncHoaDangLanternsTo3D() {
    if (!this.world3d?.renderFloatingLanterns) return;
    this.world3d.renderFloatingLanterns(this.hoaDangWishes);
  }
};
