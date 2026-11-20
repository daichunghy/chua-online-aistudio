/**
 * TempleAudioEngine — Zero-dependency, crash-proof WebAudio + HTMLAudio + TTS engine
 * for Chùa Vĩnh Tràng Online 3D.
 *
 * Features:
 * - Headless / Safari / iOS / mobile safe (graceful when AudioContext, Audio, or speechSynthesis are absent)
 * - Idempotent first-gesture WebAudio unlock (pointerdown, keydown, touchstart)
 * - True 3-channel mixer (masterVolume, ambientVolume, sfxVolume, voiceVolume) + global muted flag
 * - Accurate audio_v5 + ke_parts path resolver
 * - Procedural temple soundscape: Đại Hồng Chung bronze bell, hollow jackfruit-wood Mõ,
 *   Mekong garden / wooden-hall ambient soundscape, car arrival SFX, footsteps, chimes, and TTS
 */

export const DEFAULT_AUDIO_BASE_PATH = '/Mô hình 3D Vĩnh Tràng/audio_v5';

export const KE_PARTS_FILES = new Set([
  's6_dan.mp3',
  's6_ke_1.mp3',
  's6_ke_2.mp3',
  's6_ke_3.mp3',
  's6_ke_4.mp3'
]);

export const ROOT_AUDIO_FILES = new Set([
  's0_chao.mp3',
  's0_nhan_nhang.mp3',
  's1_adida.mp3',
  's2_thap_nhang.mp3',
  's3_bo_dep.mp3',
  's3_giang_duong.mp3',
  's3_lay_phat.mp3',
  's4_dilac.mp3',
  's5_nirvana.mp3',
  's6_hoi_huong.mp3',
  's7_tam_biet.mp3',
  'day_di.mp3',
  'merit_box.mp3',
  'niem_phat_xa.mp3'
]);

const PENTATONIC_CHIME_HZ = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

function clamp01(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(1, n));
}

function clampRange(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function normalizeBasePath(basePath) {
  if (typeof basePath !== 'string' || !basePath.trim()) {
    return DEFAULT_AUDIO_BASE_PATH;
  }
  return basePath.trim().replace(/\/+$/, '');
}

function normalizeAmbientZone(zone) {
  const key = String(zone || 'courtyard').trim().toLowerCase();
  if (
    key === 'interior' ||
    key === 'indoor' ||
    key === 'indoors' ||
    key === 'chanh_dien' ||
    key === 'hall' ||
    key === 'giang_duong' ||
    key === 'lecture'
  ) {
    return 'interior';
  }
  if (key === 'street' || key === 'road' || key === 'park' || key === 'outside_gate') {
    return 'street';
  }
  return 'courtyard';
}

export class TempleAudioEngine {
  /**
   * Resolves an audio filename to its accurate serving URL under audio_v5 or audio_v5/ke_parts.
   * Fixes 404s for s6_dan.mp3 and s6_ke_1.mp3..s6_ke_4.mp3 which live in ke_parts/.
   *
   * @param {string} fileName
   * @param {string} [basePath]
   * @returns {string}
   */
  static resolveAudioUrl(fileName, basePath = DEFAULT_AUDIO_BASE_PATH) {
    if (typeof fileName !== 'string') return '';
    const raw = fileName.trim();
    if (!raw) return '';

    if (/^(https?:|blob:|data:)/i.test(raw) || raw.startsWith('/')) {
      return raw;
    }

    const cleanBase = normalizeBasePath(basePath);
    const stripped = raw.replace(/^\.\//, '');
    const normalized = stripped.startsWith('ke_parts/')
      ? stripped.slice('ke_parts/'.length)
      : stripped;

    if (KE_PARTS_FILES.has(normalized)) {
      return `${cleanBase}/ke_parts/${normalized}`;
    }

    if (ROOT_AUDIO_FILES.has(normalized)) {
      return `${cleanBase}/${normalized}`;
    }

    return `${cleanBase}/${stripped}`;
  }

  /**
   * @param {object} [options]
   * @param {number} [options.masterVolume=1]
   * @param {number} [options.ambientVolume=0.45]
   * @param {number} [options.sfxVolume=0.85]
   * @param {number} [options.voiceVolume=0.9]
   * @param {boolean} [options.muted=false]
   * @param {string} [options.basePath='/Mô hình 3D Vĩnh Tràng/audio_v5']
   * @param {(state: {playing: boolean, fileName: string|null, currentTime: number, duration: number}) => void} [options.onVoiceStateChange]
   * @param {(state: {speaking: boolean, text: string}) => void} [options.onSpeechStateChange]
   * @param {boolean} [options.autoUnlock=true]
   */
  constructor(options = {}) {
    const opts = options && typeof options === 'object' ? options : {};

    this._basePath = normalizeBasePath(opts.basePath);
    this._masterVolume = clamp01(opts.masterVolume, 1.0);
    this._ambientVolume = clamp01(opts.ambientVolume, 0.45);
    this._sfxVolume = clamp01(opts.sfxVolume, 0.85);
    this._voiceVolume = clamp01(opts.voiceVolume, 0.9);
    this._muted = Boolean(opts.muted);

    this.onVoiceStateChange =
      typeof opts.onVoiceStateChange === 'function' ? opts.onVoiceStateChange : null;
    this.onSpeechStateChange =
      typeof opts.onSpeechStateChange === 'function' ? opts.onSpeechStateChange : null;
    this.onAmbientStateChange =
      typeof opts.onAmbientStateChange === 'function' ? opts.onAmbientStateChange : null;

    // WebAudio graph
    this.ctx = null;
    this._masterGain = null;
    this._ambientGain = null;
    this._sfxGain = null;
    this._compressor = null;
    this._pinkNoiseBuffer = null;

    // Unlock hook state
    this._unlockHooksInstalled = false;
    this._unlockTarget = null;
    this._boundUnlockHandler = () => {
      this.unlock();
    };

    // Ambient soundscape state (distant chanting + bronze temple bells + nature/hall)
    this._ambientEnabled = opts.ambientEnabled !== false;
    const rawLayers = opts.ambientLayers && typeof opts.ambientLayers === 'object' ? opts.ambientLayers : {};
    this._ambientLayers = {
      chanting: rawLayers.chanting !== false,
      bells: rawLayers.bells !== false,
      atmosphere: rawLayers.atmosphere !== false
    };
    this._ambientActive = false;
    this._ambientZone = 'street';
    this._rainIntensity = 0;
    this._ambientNodes = null;
    this._chimeTimer = null;
    this._rippleTimer = null;
    this._bellTimer = null;
    this._lastAmbientBellAt = 0;

    // Distant chanting loop element (niem_phat_xa.mp3)
    this._ambientChantEl = null;
    this._chantMediaSource = null;
    this._chantFilter = null;
    this._chantGain = null;
    this._chantViaWebAudio = false;
    this._chantPendingStart = false;
    this._externalDuck = false;

    // Footstep cadence guard to avoid rapid stacking/clipping
    this._lastFootstepAt = 0;

    // Voice HTMLAudioElement state
    this.voiceEl = null;
    this.currentVoiceFile = null;
    this._voicePlaying = false;
    this._voiceRequestId = 0;
    this._voiceListeners = null;
    this._initVoiceElement();

    // SpeechSynthesis state
    this._ttsSpeaking = false;
    this._speechToken = 0;
    this._voicesCache = [];
    this._voicesChangedHandler = null;
    this._voiceRate = 1.0;
    this._initSpeechVoices();

    if (opts.autoUnlock !== false) {
      this._installUnlockHooks();
    }
  }

  /* ========================================================================
     MIXER PROPERTIES & CONTROLS
     ======================================================================== */

  get masterVolume() {
    return this._masterVolume;
  }
  set masterVolume(value) {
    this.setMasterVolume(value);
  }

  get ambientVolume() {
    return this._ambientVolume;
  }
  set ambientVolume(value) {
    this.setAmbientVolume(value);
  }

  get sfxVolume() {
    return this._sfxVolume;
  }
  set sfxVolume(value) {
    this.setSfxVolume(value);
  }

  get voiceVolume() {
    return this._voiceVolume;
  }
  set voiceVolume(value) {
    this.setVoiceVolume(value);
  }

  get muted() {
    return this._muted;
  }
  set muted(value) {
    this.setMuted(value);
  }

  get audioCtx() {
    return this.ctx;
  }

  get ttsSpeaking() {
    return this._ttsSpeaking;
  }

  get isVoicePlaying() {
    return this._voicePlaying;
  }

  get ambientZone() {
    return this._ambientZone;
  }

  get isAmbientRunning() {
    return this._ambientActive;
  }

  get ambientEnabled() {
    return this._ambientEnabled;
  }

  getAmbientState() {
    return {
      enabled: Boolean(this._ambientEnabled),
      running: Boolean(this._ambientActive),
      zone: this._ambientZone,
      ducked: Boolean(this._voicePlaying || this._ttsSpeaking || this._externalDuck),
      layers: { ...this._ambientLayers }
    };
  }

  setMasterVolume(value) {
    this._masterVolume = clamp01(value, this._masterVolume);
    this._applyMixer();
    return this._masterVolume;
  }

  setAmbientVolume(value) {
    this._ambientVolume = clamp01(value, this._ambientVolume);
    this._applyMixer();
    return this._ambientVolume;
  }

  setSfxVolume(value) {
    this._sfxVolume = clamp01(value, this._sfxVolume);
    this._applyMixer();
    return this._sfxVolume;
  }

  setVoiceVolume(value) {
    this._voiceVolume = clamp01(value, this._voiceVolume);
    this._applyMixer();
    return this._voiceVolume;
  }

  setMuted(muted) {
    const nextMuted = Boolean(muted);
    this._muted = nextMuted;
    this._applyMixer({ immediate: true });
    if (nextMuted) {
      this.stopSpeaking();
      this._pauseAmbientChant();
    } else if (this._ambientEnabled) {
      this.startAmbient(this._ambientZone);
    }
    this._emitAmbientState();
    return this._muted;
  }

  toggleMuted() {
    return this.setMuted(!this._muted);
  }

  getMixerState() {
    return {
      masterVolume: this._masterVolume,
      ambientVolume: this._ambientVolume,
      sfxVolume: this._sfxVolume,
      voiceVolume: this._voiceVolume,
      muted: this._muted,
      ambientEnabled: this._ambientEnabled,
      ambientLayers: { ...this._ambientLayers }
    };
  }

  resolveAudioUrl(fileName) {
    return TempleAudioEngine.resolveAudioUrl(fileName, this._basePath);
  }

  /* ========================================================================
     WEBAUDIO CONTEXT & FIRST-GESTURE UNLOCK
     ======================================================================== */

  _getAudioContextConstructor() {
    try {
      if (typeof window !== 'undefined') {
        return window.AudioContext || window.webkitAudioContext || null;
      }
      if (typeof globalThis !== 'undefined') {
        return globalThis.AudioContext || globalThis.webkitAudioContext || null;
      }
    } catch {}
    return null;
  }

  _ensureContext() {
    if (this.ctx) return this.ctx;
    const AC = this._getAudioContextConstructor();
    if (!AC) return null;

    try {
      const ctx = new AC();
      const masterGain = ctx.createGain();
      const ambientGain = ctx.createGain();
      const sfxGain = ctx.createGain();

      let outputNode = ctx.destination;
      if (typeof ctx.createDynamicsCompressor === 'function') {
        try {
          const compressor = ctx.createDynamicsCompressor();
          compressor.threshold.setValueAtTime(-14, ctx.currentTime);
          compressor.knee.setValueAtTime(18, ctx.currentTime);
          compressor.ratio.setValueAtTime(3.5, ctx.currentTime);
          compressor.attack.setValueAtTime(0.006, ctx.currentTime);
          compressor.release.setValueAtTime(0.22, ctx.currentTime);
          compressor.connect(ctx.destination);
          this._compressor = compressor;
          outputNode = compressor;
        } catch {
          this._compressor = null;
          outputNode = ctx.destination;
        }
      }

      ambientGain.connect(masterGain);
      sfxGain.connect(masterGain);
      masterGain.connect(outputNode);

      this.ctx = ctx;
      this._masterGain = masterGain;
      this._ambientGain = ambientGain;
      this._sfxGain = sfxGain;
      this._applyMixer({ immediate: true });
      return ctx;
    } catch {
      this.ctx = null;
      this._masterGain = null;
      this._ambientGain = null;
      this._sfxGain = null;
      this._compressor = null;
      return null;
    }
  }

  _setGainParam(gainNode, targetValue, immediate = false) {
    if (!gainNode || !gainNode.gain || !this.ctx) return;
    const now = this.ctx.currentTime || 0;
    try {
      if (!immediate && typeof gainNode.gain.setTargetAtTime === 'function') {
        gainNode.gain.setTargetAtTime(targetValue, now, 0.02);
      } else if (typeof gainNode.gain.setValueAtTime === 'function') {
        gainNode.gain.setValueAtTime(targetValue, now);
      } else {
        gainNode.gain.value = targetValue;
      }
    } catch {
      try {
        gainNode.gain.value = targetValue;
      } catch {}
    }
  }

  _applyMixer({ immediate = false } = {}) {
    const masterTarget = this._muted ? 0 : this._masterVolume;
    const ambientTarget = this._muted || !this._ambientEnabled ? 0 : this._ambientVolume;
    const sfxTarget = this._muted ? 0 : this._sfxVolume;
    const voiceTarget = this._muted ? 0 : clamp01(this._masterVolume * this._voiceVolume);

    if (this.ctx) {
      this._setGainParam(this._masterGain, masterTarget, immediate);
      this._setGainParam(this._ambientGain, ambientTarget, immediate);
      this._setGainParam(this._sfxGain, sfxTarget, immediate);
    }

    if (this.voiceEl) {
      try {
        this.voiceEl.muted = this._muted;
        this.voiceEl.volume = voiceTarget;
      } catch {}
    }

    this._applyAmbientChantVolume(immediate);
  }

  _installUnlockHooks() {
    if (this._unlockHooksInstalled) return;
    const target =
      typeof window !== 'undefined' && typeof window.addEventListener === 'function'
        ? window
        : typeof document !== 'undefined' && typeof document.addEventListener === 'function'
          ? document
          : null;
    if (!target) return;

    this._unlockTarget = target;
    this._unlockHooksInstalled = true;
    const opts = { capture: true, passive: true };
    try {
      target.addEventListener('pointerdown', this._boundUnlockHandler, opts);
      target.addEventListener('keydown', this._boundUnlockHandler, opts);
      target.addEventListener('touchstart', this._boundUnlockHandler, opts);
    } catch {}
  }

  _removeUnlockHooks() {
    if (!this._unlockHooksInstalled || !this._unlockTarget) return;
    const opts = { capture: true };
    try {
      this._unlockTarget.removeEventListener('pointerdown', this._boundUnlockHandler, opts);
      this._unlockTarget.removeEventListener('keydown', this._boundUnlockHandler, opts);
      this._unlockTarget.removeEventListener('touchstart', this._boundUnlockHandler, opts);
    } catch {}
    this._unlockHooksInstalled = false;
    this._unlockTarget = null;
  }

  /**
   * Safely creates/resumes WebAudio AudioContext on user gesture (idempotent).
   * @returns {Promise<boolean>}
   */
  async unlock() {
    const ctx = this._ensureContext();
    if (!ctx) {
      if (this._ambientEnabled && !this._muted && this._ambientLayers.chanting && this._chantPendingStart) {
        this._startAmbientChant();
      }
      return false;
    }

    try {
      if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
        // Trigger a silent 1-sample buffer for strict iOS/Safari WebKit unlock
        try {
          if (typeof ctx.createBuffer === 'function' && typeof ctx.createBufferSource === 'function') {
            const buf = ctx.createBuffer(1, 1, 22050);
            const src = ctx.createBufferSource();
            src.buffer = buf;
            src.connect(ctx.destination);
            src.start(0);
          }
        } catch {}

        await ctx.resume();
      }
    } catch {}

    if (ctx.state === 'running') {
      this._removeUnlockHooks();
      if (this._ambientEnabled && !this._muted) {
        if (!this._ambientActive) {
          this.startAmbient(this._ambientZone);
        } else if (this._chantPendingStart && this._ambientLayers.chanting) {
          this._startAmbientChant();
        }
      }
      return true;
    }
    return false;
  }

  /* ========================================================================
     HTMLAUDIO VOICE ENGINE
     ======================================================================== */

  _initVoiceElement() {
    try {
      const AudioCtor =
        typeof Audio === 'function'
          ? Audio
          : typeof window !== 'undefined' && typeof window.Audio === 'function'
            ? window.Audio
            : null;
      if (!AudioCtor) return;

      const el = new AudioCtor();
      el.preload = 'auto';
      el.muted = this._muted;
      el.volume = this._muted ? 0 : clamp01(this._masterVolume * this._voiceVolume);

      const onPlay = () => {
        this._voicePlaying = !el.paused && !el.ended;
        this._emitVoiceState();
      };
      const onPlaying = () => {
        this._voicePlaying = true;
        this._emitVoiceState();
      };
      const onPause = () => {
        this._voicePlaying = false;
        this._emitVoiceState();
      };
      const onEnded = () => {
        this._voicePlaying = false;
        this._emitVoiceState();
        const cb = this._voiceOnEnded;
        this._voiceOnEnded = null;
        if (typeof cb === 'function') {
          try {
            cb();
          } catch {}
        }
      };
      const onError = () => {
        this._voicePlaying = false;
        this._voiceOnEnded = null;
        this._emitVoiceState();
      };
      const onTimeOrMeta = () => {
        this._emitVoiceState();
      };

      if (typeof el.addEventListener === 'function') {
        el.addEventListener('play', onPlay);
        el.addEventListener('playing', onPlaying);
        el.addEventListener('pause', onPause);
        el.addEventListener('ended', onEnded);
        el.addEventListener('error', onError);
        el.addEventListener('loadedmetadata', onTimeOrMeta);
        el.addEventListener('durationchange', onTimeOrMeta);
        el.addEventListener('timeupdate', onTimeOrMeta);
      }

      this._voiceListeners = {
        onPlay,
        onPlaying,
        onPause,
        onEnded,
        onError,
        onTimeOrMeta
      };
      this.voiceEl = el;
    } catch {
      this.voiceEl = null;
    }
  }

  getVoiceState() {
    const el = this.voiceEl;
    return {
      playing: Boolean(this._voicePlaying),
      fileName: this.currentVoiceFile || null,
      currentTime: el && Number.isFinite(el.currentTime) ? el.currentTime : 0,
      duration: el && Number.isFinite(el.duration) ? el.duration : 0
    };
  }

  _emitVoiceState() {
    this._applyAmbientChantVolume();
    if (!this.onVoiceStateChange) return;
    try {
      this.onVoiceStateChange(this.getVoiceState());
    } catch {}
  }

  setVoicePlaybackRate(rate = 1.0) {
    const nextRate = clampRange(rate, 0.5, 1.8, 1.0);
    this._voiceRate = nextRate;
    if (this.voiceEl) {
      try {
        this.voiceEl.playbackRate = nextRate;
      } catch {}
    }
  }

  /**
   * Plays a voice narration MP3 resolved via TempleAudioEngine.resolveAudioUrl().
   * @param {string} fileName
   * @param {object} [options]
   * @param {number} [options.rate]
   * @returns {Promise<boolean>}
   */
  async playVoiceAudio(fileName, options = {}) {
    if (!fileName || typeof fileName !== 'string') return false;
    const url = this.resolveAudioUrl(fileName);
    if (!url) return false;

    const cleanName = fileName.trim().split('/').pop() || fileName.trim();
    this.currentVoiceFile = cleanName;
    const reqId = ++this._voiceRequestId;
    this._voiceOnEnded = typeof options?.onEnded === 'function' ? options.onEnded : null;

    if (!this.voiceEl) {
      this._voicePlaying = false;
      this._voiceOnEnded = null;
      this._emitVoiceState();
      return false;
    }

    try {
      try {
        this.voiceEl.pause();
      } catch {}
      this.voiceEl.src = url;
      this.voiceEl.loop = Boolean(options?.loop);
      this.voiceEl.muted = this._muted;
      this.voiceEl.volume = this._muted ? 0 : clamp01(this._masterVolume * this._voiceVolume);
      const targetRate = clampRange(
        options?.rate ?? this._voiceRate ?? 1.0,
        0.5,
        1.8,
        1.0
      );
      try {
        this.voiceEl.playbackRate = targetRate;
      } catch {}

      const playResult = this.voiceEl.play();
      if (playResult && typeof playResult.then === 'function') {
        await playResult;
      }

      if (reqId !== this._voiceRequestId) return false;
      this._voicePlaying = !this.voiceEl.paused && !this.voiceEl.ended;
      this._emitVoiceState();
      return this._voicePlaying;
    } catch {
      if (reqId === this._voiceRequestId) {
        this._voicePlaying = false;
        this._voiceOnEnded = null;
        this._emitVoiceState();
      }
      return false;
    }
  }

  playVoice(fileName) {
    return this.playVoiceAudio(fileName);
  }

  pauseVoice() {
    this._voiceRequestId++;
    this._voiceOnEnded = null;
    if (this.voiceEl) {
      try {
        this.voiceEl.pause();
      } catch {}
    }
    this._voicePlaying = false;
    this._emitVoiceState();
  }

  stopVoice() {
    this._voiceRequestId++;
    this._voiceOnEnded = null;
    if (this.voiceEl) {
      try {
        this.voiceEl.pause();
        this.voiceEl.currentTime = 0;
      } catch {}
    }
    this._voicePlaying = false;
    this._emitVoiceState();
  }

  seekVoice(seconds) {
    if (!this.voiceEl) return;
    const target = Number(seconds);
    if (!Number.isFinite(target) || target < 0) return;
    try {
      const maxDur = Number.isFinite(this.voiceEl.duration) ? this.voiceEl.duration : target;
      this.voiceEl.currentTime = Math.min(target, maxDur);
      this._emitVoiceState();
    } catch {}
  }

  /* ========================================================================
     SHARED SYNTHESIS UTILITIES
     ======================================================================== */

  _canPlaySfx() {
    if (this._muted || this._masterVolume <= 0 || this._sfxVolume <= 0) {
      return null;
    }
    const ctx = this._ensureContext();
    if (!ctx || !this._sfxGain) return null;
    if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
      try {
        Promise.resolve(ctx.resume()).catch(() => {});
      } catch {}
    }
    return ctx;
  }

  _getPinkNoiseBuffer(ctx, durationSec = 4.0) {
    if (this._pinkNoiseBuffer && this._pinkNoiseBuffer.sampleRate === ctx.sampleRate) {
      return this._pinkNoiseBuffer;
    }
    const length = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Paul Kellet's refined pink-noise filter
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
      data[i] = Math.max(-1, Math.min(1, pink));
    }

    this._pinkNoiseBuffer = buffer;
    return buffer;
  }

  /* ========================================================================
     1. BRONZE ĐẠI HỒNG CHUNG BELL
     ======================================================================== */

  /**
   * Synthesizes a resonant Đại Hồng Chung bronze temple bell with layered
   * inharmonic partials [1.0, 2.0, 2.42, 3.01, 4.16], padded mallet transient,
   * and organic 4.5s exponential decay through a warm lowpass filter.
   *
   * @param {number} [pitchScale=1.0]
   * @param {number} [strength=1.0]
   * @returns {boolean}
   */
  playBronzeBell(pitchScale = 1.0, strength = 1.0) {
    const ctx = this._canPlaySfx();
    if (!ctx) return false;

    const pScale = clampRange(pitchScale, 0.4, 2.5, 1.0);
    const vel = clampRange(strength, 0.05, 1.5, 1.0);
    const fundamental = 196 * pScale;
    const now = ctx.currentTime;
    const decayTime = 4.5;

    try {
      const bellFilter = ctx.createBiquadFilter();
      bellFilter.type = 'lowpass';
      bellFilter.frequency.setValueAtTime(Math.min(4800, 2500 * pScale), now);
      bellFilter.frequency.exponentialRampToValueAtTime(Math.max(260, 620 * pScale), now + 2.4);
      bellFilter.Q.setValueAtTime(0.75, now);

      const bellMaster = ctx.createGain();
      bellMaster.gain.setValueAtTime(0.45 * vel, now);
      bellFilter.connect(bellMaster);
      bellMaster.connect(this._sfxGain);

      // Inharmonic cast-bronze partials (ratio, amplitude, decay duration)
      const partials = [
        { ratio: 1.0, amp: 0.42, dur: decayTime },
        { ratio: 1.0028, amp: 0.09, dur: decayTime * 0.92 }, // subtle bronze beating shimmer
        { ratio: 2.0, amp: 0.24, dur: 3.4 },
        { ratio: 2.42, amp: 0.18, dur: 2.6 },
        { ratio: 3.01, amp: 0.11, dur: 1.9 },
        { ratio: 4.16, amp: 0.06, dur: 1.25 }
      ];

      for (const p of partials) {
        const osc = ctx.createOscillator();
        const pGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(fundamental * p.ratio, now);

        pGain.gain.setValueAtTime(0.0001, now);
        pGain.gain.linearRampToValueAtTime(p.amp, now + 0.012);
        pGain.gain.exponentialRampToValueAtTime(0.0001, now + p.dur);

        osc.connect(pGain);
        pGain.connect(bellFilter);
        osc.start(now);
        osc.stop(now + p.dur + 0.06);
      }

      // Warm padded-beam strike transient (low body thud + soft filtered wood burst)
      const strikeOsc = ctx.createOscillator();
      const strikeGain = ctx.createGain();
      strikeOsc.type = 'triangle';
      strikeOsc.frequency.setValueAtTime(fundamental * 0.65, now);
      strikeOsc.frequency.exponentialRampToValueAtTime(fundamental * 0.42, now + 0.095);
      strikeGain.gain.setValueAtTime(0.001, now);
      strikeGain.gain.linearRampToValueAtTime(0.22 * vel, now + 0.005);
      strikeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
      strikeOsc.connect(strikeGain);
      strikeGain.connect(bellFilter);
      strikeOsc.start(now);
      strikeOsc.stop(now + 0.13);

      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = this._getPinkNoiseBuffer(ctx, 1.0);
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(Math.min(1800, 360 * pScale), now);
      noiseFilter.Q.setValueAtTime(2.2, now);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.16 * vel, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      noiseSrc.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(bellMaster);
      noiseSrc.start(now);
      noiseSrc.stop(now + 0.06);

      return true;
    } catch {
      return false;
    }
  }

  /* ========================================================================
     2. WOODEN MÕ (MOKUGYO)
     ======================================================================== */

  /**
   * Synthesizes a hollow carved jackfruit-wood Mõ tap using dual bandpass cavity
   * formants (290Hz & 445Hz) + crisp wooden mallet click and 180ms decay.
   *
   * @param {boolean} [accent=false]
   * @returns {boolean}
   */
  playWoodenMokugyo(accent = false) {
    const ctx = this._canPlaySfx();
    if (!ctx) return false;

    const now = ctx.currentTime;
    const vel = accent ? 1.25 : 0.92;
    const pitchBoost = accent ? 1.03 : 1.0;
    const decay = 0.18;

    try {
      const bus = ctx.createGain();
      bus.gain.setValueAtTime(0.65 * vel, now);
      bus.connect(this._sfxGain);

      // Resonant hollow jackfruit-wood cavity formants (290Hz & 445Hz)
      const noiseBuf = this._getPinkNoiseBuffer(ctx, 1.0);
      const formants = [
        { freq: 290 * pitchBoost, q: 11, gain: 0.72 },
        { freq: 445 * pitchBoost, q: 13, gain: 0.56 }
      ];

      for (const f of formants) {
        const exciter = ctx.createBufferSource();
        exciter.buffer = noiseBuf;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(f.freq, now);
        bp.Q.setValueAtTime(f.q, now);

        const fGain = ctx.createGain();
        fGain.gain.setValueAtTime(0.001, now);
        fGain.gain.linearRampToValueAtTime(f.gain, now + 0.004);
        fGain.gain.exponentialRampToValueAtTime(0.0005, now + decay);

        exciter.connect(bp);
        bp.connect(fGain);
        fGain.connect(bus);
        exciter.start(now, Math.random() * 0.25, decay + 0.03);

        // Pitched hollow-wood modal body reinforcement
        const modalOsc = ctx.createOscillator();
        modalOsc.type = 'triangle';
        modalOsc.frequency.setValueAtTime(f.freq * 1.05, now);
        modalOsc.frequency.exponentialRampToValueAtTime(f.freq * 0.88, now + decay * 0.75);

        const modalGain = ctx.createGain();
        modalGain.gain.setValueAtTime(0.001, now);
        modalGain.gain.linearRampToValueAtTime(f.gain * 0.36, now + 0.003);
        modalGain.gain.exponentialRampToValueAtTime(0.0004, now + decay);

        modalOsc.connect(modalGain);
        modalGain.connect(bus);
        modalOsc.start(now);
        modalOsc.stop(now + decay + 0.02);
      }

      // Crisp wooden mallet attack click
      const clickSrc = ctx.createBufferSource();
      clickSrc.buffer = noiseBuf;
      const clickFilter = ctx.createBiquadFilter();
      clickFilter.type = 'bandpass';
      clickFilter.frequency.setValueAtTime(accent ? 1750 : 1550, now);
      clickFilter.Q.setValueAtTime(2.6, now);

      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(0.35 * vel, now);
      clickGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.016);

      clickSrc.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(bus);
      clickSrc.start(now, Math.random() * 0.2, 0.025);

      return true;
    } catch {
      return false;
    }
  }

  /* ========================================================================
     3. AMBIENT TEMPLE SOUNDSCAPE (DISTANT CHANTING + TEMPLE BELLS + GARDEN/HALL)
     ======================================================================== */

  _emitAmbientState() {
    if (!this.onAmbientStateChange) return;
    try {
      this.onAmbientStateChange(this.getAmbientState());
    } catch {}
  }

  setAmbientDucking(ducked) {
    const next = Boolean(ducked);
    if (this._externalDuck === next) return;
    this._externalDuck = next;
    this._applyAmbientChantVolume();
    this._emitAmbientState();
  }

  _initAmbientChantElement() {
    if (this._ambientChantEl) return this._ambientChantEl;
    try {
      const AudioCtor =
        typeof Audio === 'function'
          ? Audio
          : typeof window !== 'undefined' && typeof window.Audio === 'function'
            ? window.Audio
            : null;
      if (!AudioCtor) return null;

      const el = new AudioCtor();
      el.loop = true;
      el.preload = 'none';
      try {
        el.crossOrigin = 'anonymous';
      } catch {}
      el.muted = this._muted;
      el.volume = 0;
      this._ambientChantEl = el;
      return el;
    } catch {
      this._ambientChantEl = null;
      return null;
    }
  }

  _ensureChantWebAudioRoute() {
    const el = this._ambientChantEl;
    const ctx = this.ctx;
    if (!el || !ctx || !this._ambientGain) return false;
    if (this._chantViaWebAudio && this._chantGain) return true;

    try {
      if (typeof ctx.createMediaElementSource === 'function' && !this._chantMediaSource) {
        const mediaSrc = ctx.createMediaElementSource(el);
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(1650, ctx.currentTime);
        lowpass.Q.setValueAtTime(0.65, ctx.currentTime);

        const chantGain = ctx.createGain();
        chantGain.gain.setValueAtTime(0, ctx.currentTime);

        mediaSrc.connect(lowpass);
        lowpass.connect(chantGain);
        chantGain.connect(this._ambientGain);

        this._chantMediaSource = mediaSrc;
        this._chantFilter = lowpass;
        this._chantGain = chantGain;
        this._chantViaWebAudio = true;
        el.volume = 1;
        return true;
      }
    } catch {
      this._chantViaWebAudio = false;
    }
    return this._chantViaWebAudio;
  }

  _applyAmbientChantVolume(immediate = false) {
    const duckMult = this._voicePlaying || this._ttsSpeaking || this._externalDuck ? 0.2 : 1.0;
    const chantActive =
      Boolean(this._ambientEnabled) &&
      Boolean(this._ambientLayers.chanting) &&
      !this._muted &&
      this._ambientVolume > 0 &&
      this._masterVolume > 0;

    // Gentle distant presence across 3 zones: closest inside Chánh Điện, serene in Courtyard, faintest on Street
    const zoneFactor =
      this._ambientZone === 'interior'
        ? 0.28
        : this._ambientZone === 'street'
        ? 0.08
        : 0.19;
    const targetWebAudioGain = chantActive ? zoneFactor * duckMult : 0;

    if (this._chantViaWebAudio && this._chantGain && this.ctx) {
      this._setGainParam(this._chantGain, targetWebAudioGain, immediate);
      if (this._chantFilter && typeof this._chantFilter.frequency?.setTargetAtTime === 'function') {
        const cutoff =
          this._ambientZone === 'interior'
            ? 2100
            : this._ambientZone === 'street'
            ? 960
            : 1480;
        try {
          this._chantFilter.frequency.setTargetAtTime(cutoff, this.ctx.currentTime, 0.35);
        } catch {}
      }
      if (this._ambientChantEl) {
        try {
          this._ambientChantEl.muted = this._muted;
          this._ambientChantEl.volume = 1;
        } catch {}
      }
      return;
    }

    if (this._ambientChantEl) {
      const directVol = chantActive
        ? clamp01(this._masterVolume * this._ambientVolume * zoneFactor * duckMult)
        : 0;
      try {
        this._ambientChantEl.muted = this._muted;
        this._ambientChantEl.volume = directVol;
      } catch {}
    }
  }

  async _startAmbientChant() {
    if (!this._ambientEnabled || !this._ambientLayers.chanting || this._muted) {
      return false;
    }
    const el = this._initAmbientChantElement();
    if (!el) return false;

    const chantUrl = this.resolveAudioUrl('niem_phat_xa.mp3');
    if (!chantUrl) return false;

    try {
      if (!el.src || !el.src.endsWith(encodeURI('niem_phat_xa.mp3'))) {
        el.src = chantUrl;
      }
      el.loop = true;
      this._ensureChantWebAudioRoute();
      this._applyAmbientChantVolume();

      const playPromise = el.play();
      if (playPromise && typeof playPromise.then === 'function') {
        await playPromise;
      }
      this._chantPendingStart = false;
      this._applyAmbientChantVolume();
      return true;
    } catch {
      this._chantPendingStart = true;
      return false;
    }
  }

  _pauseAmbientChant() {
    this._chantPendingStart = false;
    if (this._chantGain && this.ctx) {
      this._setGainParam(this._chantGain, 0, true);
    }
    if (this._ambientChantEl) {
      try {
        this._ambientChantEl.volume = 0;
        this._ambientChantEl.pause();
      } catch {}
    }
  }

  /**
   * Turns the entire looping ambient temple soundscape On/Off independently of SFX & Voice.
   * @param {boolean} enabled
   * @returns {boolean}
   */
  setAmbientEnabled(enabled) {
    const next = Boolean(enabled);
    this._ambientEnabled = next;

    if (next) {
      if (!this._muted) {
        const hadStarted = this._ambientActive;
        this.unlock();
        this.startAmbient(this._ambientZone);
        if (!hadStarted || this._ambientLayers.bells) {
          this.playDistantAmbientBell(0.16);
        }
      }
    } else {
      this.stopAmbient();
    }

    this._applyMixer();
    this._emitAmbientState();
    return this._ambientEnabled;
  }

  toggleAmbientEnabled() {
    return this.setAmbientEnabled(!this._ambientEnabled);
  }

  /**
   * Updates individual ambient layers (chanting, bells, atmosphere) live.
   * @param {{chanting?: boolean, bells?: boolean, atmosphere?: boolean}} layers
   */
  setAmbientLayers(layers = {}) {
    if (layers && typeof layers === 'object') {
      if (typeof layers.chanting === 'boolean') this._ambientLayers.chanting = layers.chanting;
      if (typeof layers.bells === 'boolean') this._ambientLayers.bells = layers.bells;
      if (typeof layers.atmosphere === 'boolean') this._ambientLayers.atmosphere = layers.atmosphere;
    }

    if (!this._ambientLayers.chanting && !this._ambientLayers.bells && !this._ambientLayers.atmosphere) {
      this._ambientEnabled = false;
    }

    if (!this._ambientEnabled || this._muted) {
      this._pauseAmbientChant();
      this._applyMixer();
      this._emitAmbientState();
      return this.getAmbientState();
    }

    if (this._ambientActive) {
      if (this._ambientNodes?.atmosphereBus && this.ctx) {
        this._setGainParam(
          this._ambientNodes.atmosphereBus,
          this._ambientLayers.atmosphere ? 1.0 : 0.0,
          false
        );
      }
      if (this._ambientLayers.chanting) {
        this._startAmbientChant();
      } else {
        this._pauseAmbientChant();
      }
      if (this._ambientLayers.bells) {
        if (!this._bellTimer) this._scheduleDistantBell();
        if (!this._chimeTimer) this._scheduleAmbientChime();
      } else {
        if (this._bellTimer) {
          clearTimeout(this._bellTimer);
          this._bellTimer = null;
        }
        if (this._chimeTimer) {
          clearTimeout(this._chimeTimer);
          this._chimeTimer = null;
        }
      }
      if (this._ambientLayers.atmosphere && !this._rippleTimer) {
        this._scheduleLotusRipple();
      }
    } else {
      this.startAmbient(this._ambientZone);
    }

    this._applyMixer();
    this._emitAmbientState();
    return this.getAmbientState();
  }

  /**
   * Plays a soft, distant resonant bronze temple bell routed through the ambient bus.
   * @param {number} [strength=0.18]
   * @returns {boolean}
   */
  playDistantAmbientBell(strength = 0.18) {
    if (this._muted || !this._ambientEnabled || !this._ambientLayers.bells) return false;
    if (this._masterVolume <= 0 || this._ambientVolume <= 0) return false;

    const ctx = this._ensureContext();
    if (!ctx || !this._ambientGain) return false;
    if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
      try {
        Promise.resolve(ctx.resume()).catch(() => {});
      } catch {}
    }

    const nowMs = Date.now();
    if (nowMs - this._lastAmbientBellAt < 1800) return false;
    this._lastAmbientBellAt = nowMs;

    try {
      const now = ctx.currentTime;
      const pitches = [164.81, 196.0, 220.0]; // Warm distant E3 / G3 / A3 bronze bell tones
      const fundamental = pitches[Math.floor(Math.random() * pitches.length)];
      const vel = clampRange(strength, 0.05, 0.45, 0.18);

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(1120, now);
      lp.frequency.exponentialRampToValueAtTime(340, now + 3.6);
      lp.Q.setValueAtTime(0.65, now);

      const bus = ctx.createGain();
      bus.gain.setValueAtTime(vel, now);
      lp.connect(bus);
      bus.connect(this._ambientGain);

      const partials = [
        { ratio: 1.0, amp: 0.46, dur: 5.2 },
        { ratio: 1.0032, amp: 0.12, dur: 4.8 },
        { ratio: 2.0, amp: 0.22, dur: 3.6 },
        { ratio: 2.42, amp: 0.12, dur: 2.6 },
        { ratio: 3.01, amp: 0.07, dur: 1.8 }
      ];

      for (const p of partials) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(fundamental * p.ratio, now);

        // Soft distant swell attack (45ms) so it sounds far away across the temple courtyard
        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(p.amp, now + 0.045);
        g.gain.exponentialRampToValueAtTime(0.0001, now + p.dur);

        osc.connect(g);
        g.connect(lp);
        osc.start(now);
        osc.stop(now + p.dur + 0.08);
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Starts the looping ambient temple soundscape (idempotent).
   * @param {'exterior' | 'interior' | string} [zone='exterior']
   * @returns {boolean}
   */
  startAmbient(zone = 'exterior') {
    const normalizedZone = normalizeAmbientZone(zone);
    this._ambientZone = normalizedZone;

    if (!this._ambientEnabled) {
      return false;
    }

    if (this._ambientActive) {
      this.setAmbientZone(normalizedZone);
      if (this._ambientLayers.chanting && !this._muted) {
        this._startAmbientChant();
      }
      return true;
    }

    const ctx = this._ensureContext();
    if (!ctx || !this._ambientGain) {
      if (this._ambientLayers.chanting && !this._muted) {
        this._startAmbientChant();
      }
      return false;
    }

    try {
      const now = ctx.currentTime;
      const noiseBuf = this._getPinkNoiseBuffer(ctx, 4.0);

      // Atmosphere sub-bus (allows toggling wind/water/hall independently of bells & chanting)
      const atmosphereBus = ctx.createGain();
      atmosphereBus.gain.setValueAtTime(this._ambientLayers.atmosphere ? 1.0 : 0.0, now);
      atmosphereBus.connect(this._ambientGain);

      // Sub-buses for smooth 3-zone spatial crossfading (street <-> courtyard <-> interior) + Mekong rain
      const streetBus = ctx.createGain();
      const outdoorBus = ctx.createGain();
      const indoorBus = ctx.createGain();
      const rainBus = ctx.createGain();
      streetBus.gain.setValueAtTime(normalizedZone === 'street' ? 1.0 : 0.0, now);
      outdoorBus.gain.setValueAtTime(normalizedZone === 'courtyard' ? 1.0 : normalizedZone === 'street' ? 0.35 : 0.0, now);
      indoorBus.gain.setValueAtTime(normalizedZone === 'interior' ? 1.0 : 0.0, now);
      rainBus.gain.setValueAtTime(0.0, now);
      streetBus.connect(atmosphereBus);
      outdoorBus.connect(atmosphereBus);
      indoorBus.connect(atmosphereBus);
      rainBus.connect(atmosphereBus);

      // --- Street Zone (Outside Cổng Phụ / Đường vào chùa Mỹ Tho): warm distant town hum ---
      const streetSrc = ctx.createBufferSource();
      streetSrc.buffer = noiseBuf;
      streetSrc.loop = true;
      const streetBP = ctx.createBiquadFilter();
      streetBP.type = 'bandpass';
      streetBP.frequency.setValueAtTime(240, now);
      streetBP.Q.setValueAtTime(0.9, now);
      const streetGain = ctx.createGain();
      streetGain.gain.setValueAtTime(0.11, now);
      streetSrc.connect(streetBP);
      streetBP.connect(streetGain);
      streetGain.connect(streetBus);

      // --- Mekong Tropical Rain Layer (filtered foliage hiss + muffled roof patter indoors) ---
      const rainSrc = ctx.createBufferSource();
      rainSrc.buffer = noiseBuf;
      rainSrc.loop = true;
      const rainHP = ctx.createBiquadFilter();
      rainHP.type = 'highpass';
      rainHP.frequency.setValueAtTime(620, now);
      const rainLP = ctx.createBiquadFilter();
      rainLP.type = 'lowpass';
      rainLP.frequency.setValueAtTime(normalizedZone === 'interior' ? 780 : 3400, now);
      rainLP.Q.setValueAtTime(0.6, now);
      const rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(0.24, now);
      rainSrc.connect(rainHP);
      rainHP.connect(rainLP);
      rainLP.connect(rainGain);
      rainGain.connect(rainBus);

      // --- Outdoor: Pink-filtered Mekong garden breeze ---
      const breezeSrc = ctx.createBufferSource();
      breezeSrc.buffer = noiseBuf;
      breezeSrc.loop = true;

      const breezeLP = ctx.createBiquadFilter();
      breezeLP.type = 'lowpass';
      breezeLP.frequency.setValueAtTime(380, now);
      breezeLP.Q.setValueAtTime(0.55, now);

      const breezeLfo = ctx.createOscillator();
      breezeLfo.type = 'sine';
      breezeLfo.frequency.setValueAtTime(0.065, now);
      const breezeLfoGain = ctx.createGain();
      breezeLfoGain.gain.setValueAtTime(140, now);
      breezeLfo.connect(breezeLfoGain);
      breezeLfoGain.connect(breezeLP.frequency);

      const breezeGain = ctx.createGain();
      breezeGain.gain.setValueAtTime(0.14, now);
      breezeSrc.connect(breezeLP);
      breezeLP.connect(breezeGain);
      breezeGain.connect(outdoorBus);

      // --- Outdoor: Subtle lotus pond water shimmer ---
      const waterSrc = ctx.createBufferSource();
      waterSrc.buffer = noiseBuf;
      waterSrc.loop = true;

      const waterBP = ctx.createBiquadFilter();
      waterBP.type = 'bandpass';
      waterBP.frequency.setValueAtTime(880, now);
      waterBP.Q.setValueAtTime(1.8, now);

      const waterLfo = ctx.createOscillator();
      waterLfo.type = 'sine';
      waterLfo.frequency.setValueAtTime(0.11, now);
      const waterLfoGain = ctx.createGain();
      waterLfoGain.gain.setValueAtTime(210, now);
      waterLfo.connect(waterLfoGain);
      waterLfoGain.connect(waterBP.frequency);

      const waterLP = ctx.createBiquadFilter();
      waterLP.type = 'lowpass';
      waterLP.frequency.setValueAtTime(1650, now);

      const waterGain = ctx.createGain();
      waterGain.gain.setValueAtTime(0.032, now);

      waterSrc.connect(waterBP);
      waterBP.connect(waterLP);
      waterLP.connect(waterGain);
      waterGain.connect(outdoorBus);

      // --- Indoor: Warm wooden-hall hush & deep faint resonant drone ---
      const hallSrc = ctx.createBufferSource();
      hallSrc.buffer = noiseBuf;
      hallSrc.loop = true;

      const hallLP = ctx.createBiquadFilter();
      hallLP.type = 'lowpass';
      hallLP.frequency.setValueAtTime(210, now);
      hallLP.Q.setValueAtTime(0.5, now);

      const hallGain = ctx.createGain();
      hallGain.gain.setValueAtTime(0.11, now);
      hallSrc.connect(hallLP);
      hallLP.connect(hallGain);
      hallGain.connect(indoorBus);

      const droneOsc1 = ctx.createOscillator();
      droneOsc1.type = 'sine';
      droneOsc1.frequency.setValueAtTime(108, now);

      const droneOsc2 = ctx.createOscillator();
      droneOsc2.type = 'sine';
      droneOsc2.frequency.setValueAtTime(162, now); // tranquil fifth above 108Hz

      const droneLP = ctx.createBiquadFilter();
      droneLP.type = 'lowpass';
      droneLP.frequency.setValueAtTime(260, now);

      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.022, now);

      droneOsc1.connect(droneLP);
      droneOsc2.connect(droneLP);
      droneLP.connect(droneGain);
      droneGain.connect(indoorBus);

      // Start continuous sources
      streetSrc.start(now, 0.3);
      rainSrc.start(now, 2.1);
      breezeSrc.start(now);
      breezeLfo.start(now);
      waterSrc.start(now, 1.3);
      waterLfo.start(now);
      hallSrc.start(now, 0.7);
      droneOsc1.start(now);
      droneOsc2.start(now);

      this._ambientNodes = {
        atmosphereBus,
        streetBus,
        outdoorBus,
        indoorBus,
        rainBus,
        rainLP,
        sources: [streetSrc, rainSrc, breezeSrc, breezeLfo, waterSrc, waterLfo, hallSrc, droneOsc1, droneOsc2]
      };
      this._ambientActive = true;
      this.setRainIntensity(this._rainIntensity || 0);

      if (this._ambientLayers.bells) {
        this._scheduleAmbientChime();
        this._scheduleDistantBell();
      }
      if (this._ambientLayers.atmosphere) {
        this._scheduleLotusRipple();
      }
      if (this._ambientLayers.chanting && !this._muted) {
        this._startAmbientChant();
      }
      this._emitAmbientState();
      return true;
    } catch {
      this._ambientActive = false;
      this._ambientNodes = null;
      return false;
    }
  }

  /**
   * Smoothly crossfades ambient soundscape across 3 spatial zones:
   * 'street' (outside gate), 'courtyard' (temple grounds), and 'interior' (Chánh điện).
   * @param {'street' | 'courtyard' | 'exterior' | 'interior' | string} zone
   */
  setAmbientZone(zone) {
    const normalizedZone = normalizeAmbientZone(zone);
    this._ambientZone = normalizedZone;
    this._applyAmbientChantVolume();
    if (!this._ambientActive || !this._ambientNodes || !this.ctx) return;

    const now = this.ctx.currentTime;
    const streetTarget = normalizedZone === 'street' ? 1.0 : 0.0;
    const outTarget = normalizedZone === 'courtyard' ? 1.0 : normalizedZone === 'street' ? 0.35 : 0.0;
    const inTarget = normalizedZone === 'interior' ? 1.0 : 0.0;

    try {
      this._ambientNodes.streetBus?.gain.setTargetAtTime(streetTarget, now, 0.55);
      this._ambientNodes.outdoorBus.gain.setTargetAtTime(outTarget, now, 0.45);
      this._ambientNodes.indoorBus.gain.setTargetAtTime(inTarget, now, 0.45);
      // Muffle Mekong rain smoothly when stepping inside Chánh điện
      if (this._ambientNodes.rainLP) {
        const cutoff = normalizedZone === 'interior' ? 760 : 3400;
        this._ambientNodes.rainLP.frequency.setTargetAtTime(cutoff, now, 0.45);
      }
      if (this._ambientNodes.rainBus) {
        const rainGain = clamp01(this._rainIntensity, 0) * (normalizedZone === 'interior' ? 0.38 : 1.0);
        this._ambientNodes.rainBus.gain.setTargetAtTime(rainGain, now, 0.45);
      }
    } catch {}
  }

  /**
   * Controls procedural Mekong tropical rain audio intensity (0..1).
   * Automatically softens and low-passes when inside Chánh điện.
   * @param {number} intensity
   */
  setRainIntensity(intensity = 0) {
    this._rainIntensity = clamp01(intensity, 0);
    if (!this._ambientActive || !this._ambientNodes?.rainBus || !this.ctx) return;
    const now = this.ctx.currentTime;
    const isIndoor = this._ambientZone === 'interior';
    const targetGain = this._rainIntensity * (isIndoor ? 0.38 : 1.0);
    try {
      this._ambientNodes.rainBus.gain.setTargetAtTime(targetGain, now, 0.35);
      if (this._ambientNodes.rainLP) {
        this._ambientNodes.rainLP.frequency.setTargetAtTime(isIndoor ? 760 : 3400, now, 0.35);
      }
    } catch {}
  }

  _scheduleDistantBell() {
    if (this._bellTimer) {
      clearTimeout(this._bellTimer);
      this._bellTimer = null;
    }
    if (!this._ambientActive || !this._ambientEnabled || !this._ambientLayers.bells) return;

    const delayMs = 16000 + Math.random() * 14000; // Calm 16s–30s distant bronze temple bell toll
    this._bellTimer = setTimeout(() => {
      this._bellTimer = null;
      if (!this._ambientActive || !this._ambientEnabled || !this._ambientLayers.bells) return;

      if (
        !this._muted &&
        this._masterVolume > 0 &&
        this._ambientVolume > 0 &&
        this.ctx &&
        this.ctx.state === 'running'
      ) {
        const duckFactor = this._voicePlaying || this._ttsSpeaking || this._externalDuck ? 0.45 : 1.0;
        this.playDistantAmbientBell((0.15 + Math.random() * 0.06) * duckFactor);
      }
      this._scheduleDistantBell();
    }, delayMs);
  }

  _scheduleAmbientChime() {
    if (this._chimeTimer) {
      clearTimeout(this._chimeTimer);
      this._chimeTimer = null;
    }
    if (!this._ambientActive || !this._ambientEnabled || !this._ambientLayers.bells) return;

    const delayMs = 7000 + Math.random() * 8000; // Sparse 7s–15s calm wind chime swells
    this._chimeTimer = setTimeout(() => {
      this._chimeTimer = null;
      if (!this._ambientActive || !this._ambientEnabled || !this._ambientLayers.bells) return;

      if (
        !this._muted &&
        this._masterVolume > 0 &&
        this._ambientVolume > 0 &&
        this.ctx &&
        this.ctx.state === 'running' &&
        this._ambientNodes
      ) {
        this._triggerDistantWindChime();
      }
      this._scheduleAmbientChime();
    }, delayMs);
  }

  _triggerDistantWindChime() {
    const ctx = this.ctx;
    const nodes = this._ambientNodes;
    if (!ctx || !nodes || !this._ambientGain) return;

    try {
      const now = ctx.currentTime;
      const count = Math.random() < 0.45 ? 2 : 1;
      const baseGain = this._ambientZone === 'interior' ? 0.012 : 0.026;

      for (let i = 0; i < count; i++) {
        const freq =
          PENTATONIC_CHIME_HZ[Math.floor(Math.random() * PENTATONIC_CHIME_HZ.length)];
        const start = now + i * (0.38 + Math.random() * 0.25);

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        const overtone = ctx.createOscillator();
        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(freq * 2.0, start);

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(1700, start);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(baseGain, start + 0.14);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 3.0);

        const overGain = ctx.createGain();
        overGain.gain.setValueAtTime(0.25, start);

        osc.connect(lp);
        overtone.connect(overGain);
        overGain.connect(lp);
        lp.connect(gain);
        gain.connect(this._ambientGain);

        osc.start(start);
        overtone.start(start);
        osc.stop(start + 3.1);
        overtone.stop(start + 3.1);
      }
    } catch {}
  }

  _scheduleLotusRipple() {
    if (this._rippleTimer) {
      clearTimeout(this._rippleTimer);
      this._rippleTimer = null;
    }
    if (!this._ambientActive || !this._ambientEnabled || !this._ambientLayers.atmosphere) return;

    const delayMs = 3200 + Math.random() * 4800;
    this._rippleTimer = setTimeout(() => {
      this._rippleTimer = null;
      if (!this._ambientActive || !this._ambientEnabled || !this._ambientLayers.atmosphere) return;

      if (
        this._ambientZone === 'exterior' &&
        !this._muted &&
        this._masterVolume > 0 &&
        this._ambientVolume > 0 &&
        this.ctx &&
        this.ctx.state === 'running' &&
        this._ambientNodes
      ) {
        this._triggerWaterDroplet();
      }
      this._scheduleLotusRipple();
    }, delayMs);
  }

  _triggerWaterDroplet() {
    const ctx = this.ctx;
    const nodes = this._ambientNodes;
    if (!ctx || !nodes) return;

    try {
      const now = ctx.currentTime;
      const baseFreq = 640 + Math.random() * 440;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.38, now + 0.055);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.011, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);

      osc.connect(gain);
      gain.connect(nodes.outdoorBus);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }

  stopAmbient() {
    this._ambientActive = false;
    this._pauseAmbientChant();

    if (this._chimeTimer) {
      clearTimeout(this._chimeTimer);
      this._chimeTimer = null;
    }
    if (this._rippleTimer) {
      clearTimeout(this._rippleTimer);
      this._rippleTimer = null;
    }
    if (this._bellTimer) {
      clearTimeout(this._bellTimer);
      this._bellTimer = null;
    }

    const nodes = this._ambientNodes;
    this._ambientNodes = null;
    if (nodes) {
      try {
        const stopAt = (this.ctx?.currentTime || 0) + 0.05;
        for (const src of nodes.sources) {
          try {
            src.stop(stopAt);
          } catch {}
        }
      } catch {}
    }
    this._emitAmbientState();
  }

  /* ========================================================================
     4. VEHICLE ARRIVAL & BRAKING SFX
     ======================================================================== */

  /**
   * Plays vehicle arrival cutscene SFX:
   * - 'arrive': warm low engine purr decelerating + gentle tire-on-stone braking hiss
   * - 'door_open': subtle latch click + cushioned solid car door thud
   * - 'idle': soft warm engine idle purr
   *
   * @param {'arrive' | 'door_open' | 'idle'} [phase='arrive']
   * @returns {boolean}
   */
  playCarArrivalSfx(phase = 'arrive') {
    const ctx = this._canPlaySfx();
    if (!ctx) return false;

    const now = ctx.currentTime;
    const mode = String(phase || 'arrive').trim().toLowerCase();

    try {
      if (mode === 'door_open') {
        // Subtle metallic latch click
        const latchSrc = ctx.createBufferSource();
        latchSrc.buffer = this._getPinkNoiseBuffer(ctx, 1.0);
        const latchBP = ctx.createBiquadFilter();
        latchBP.type = 'bandpass';
        latchBP.frequency.setValueAtTime(1420, now);
        latchBP.Q.setValueAtTime(3.2, now);
        const latchGain = ctx.createGain();
        latchGain.gain.setValueAtTime(0.14, now);
        latchGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.028);
        latchSrc.connect(latchBP);
        latchBP.connect(latchGain);
        latchGain.connect(this._sfxGain);
        latchSrc.start(now, 0.1, 0.04);

        // Cushioned solid car door thud ~90ms later
        const thudAt = now + 0.09;
        const thudOsc = ctx.createOscillator();
        thudOsc.type = 'sine';
        thudOsc.frequency.setValueAtTime(112, thudAt);
        thudOsc.frequency.exponentialRampToValueAtTime(42, thudAt + 0.12);

        const thudGain = ctx.createGain();
        thudGain.gain.setValueAtTime(0.001, thudAt);
        thudGain.gain.linearRampToValueAtTime(0.38, thudAt + 0.008);
        thudGain.gain.exponentialRampToValueAtTime(0.0005, thudAt + 0.16);
        thudOsc.connect(thudGain);
        thudGain.connect(this._sfxGain);
        thudOsc.start(thudAt);
        thudOsc.stop(thudAt + 0.18);

        const airSrc = ctx.createBufferSource();
        airSrc.buffer = this._getPinkNoiseBuffer(ctx, 1.0);
        const airLP = ctx.createBiquadFilter();
        airLP.type = 'lowpass';
        airLP.frequency.setValueAtTime(190, thudAt);
        const airGain = ctx.createGain();
        airGain.gain.setValueAtTime(0.24, thudAt);
        airGain.gain.exponentialRampToValueAtTime(0.0005, thudAt + 0.11);
        airSrc.connect(airLP);
        airLP.connect(airGain);
        airGain.connect(this._sfxGain);
        airSrc.start(thudAt, 0.2, 0.13);

        return true;
      }

      if (mode === 'idle') {
        const dur = 1.4;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(145, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0005, now);
        gain.gain.linearRampToValueAtTime(0.14, now + 0.25);
        gain.gain.setValueAtTime(0.14, now + dur - 0.35);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + dur);

        const eng1 = ctx.createOscillator();
        eng1.type = 'triangle';
        eng1.frequency.setValueAtTime(48, now);

        const eng2 = ctx.createOscillator();
        eng2.type = 'sawtooth';
        eng2.frequency.setValueAtTime(96, now);

        const subMix = ctx.createGain();
        subMix.gain.setValueAtTime(0.32, now);

        eng1.connect(lp);
        eng2.connect(subMix);
        subMix.connect(lp);
        lp.connect(gain);
        gain.connect(this._sfxGain);

        eng1.start(now);
        eng2.start(now);
        eng1.stop(now + dur + 0.04);
        eng2.stop(now + dur + 0.04);
        return true;
      }

      // Default 'arrive': warm low engine purr rolling in + tire-on-stone braking hiss
      const dur = 2.2;
      const engineLP = ctx.createBiquadFilter();
      engineLP.type = 'lowpass';
      engineLP.frequency.setValueAtTime(210, now);
      engineLP.frequency.exponentialRampToValueAtTime(130, now + dur);

      const engineGain = ctx.createGain();
      engineGain.gain.setValueAtTime(0.001, now);
      engineGain.gain.linearRampToValueAtTime(0.2, now + 0.28);
      engineGain.gain.setValueAtTime(0.16, now + 1.35);
      engineGain.gain.exponentialRampToValueAtTime(0.0005, now + dur);

      const engFund = ctx.createOscillator();
      engFund.type = 'triangle';
      engFund.frequency.setValueAtTime(68, now);
      engFund.frequency.exponentialRampToValueAtTime(46, now + dur * 0.9);

      const engHarm = ctx.createOscillator();
      engHarm.type = 'sawtooth';
      engHarm.frequency.setValueAtTime(136, now);
      engHarm.frequency.exponentialRampToValueAtTime(92, now + dur * 0.9);

      const harmGain = ctx.createGain();
      harmGain.gain.setValueAtTime(0.28, now);

      engFund.connect(engineLP);
      engHarm.connect(harmGain);
      harmGain.connect(engineLP);
      engineLP.connect(engineGain);
      engineGain.connect(this._sfxGain);

      engFund.start(now);
      engHarm.start(now);
      engFund.stop(now + dur + 0.05);
      engHarm.stop(now + dur + 0.05);

      // Gentle tire-on-stone deceleration hiss
      const tireSrc = ctx.createBufferSource();
      tireSrc.buffer = this._getPinkNoiseBuffer(ctx, 3.0);

      const tireBP = ctx.createBiquadFilter();
      tireBP.type = 'bandpass';
      tireBP.frequency.setValueAtTime(520, now);
      tireBP.frequency.exponentialRampToValueAtTime(210, now + dur);
      tireBP.Q.setValueAtTime(1.3, now);

      const tireGain = ctx.createGain();
      tireGain.gain.setValueAtTime(0.001, now);
      tireGain.gain.linearRampToValueAtTime(0.11, now + 0.35);
      tireGain.gain.exponentialRampToValueAtTime(0.0004, now + dur - 0.15);

      tireSrc.connect(tireBP);
      tireBP.connect(tireGain);
      tireGain.connect(this._sfxGain);
      tireSrc.start(now, 0, dur + 0.05);

      return true;
    } catch {
      return false;
    }
  }

  /* ========================================================================
     5. FOOTSTEPS
     ======================================================================== */

  /**
   * Soft rhythmic shoe tap synced to walking cadence without clipping.
   * @param {'stone' | 'wood' | 'gravel'} [surface='stone']
   * @returns {boolean}
   */
  playFootstep(surface = 'stone') {
    const nowMs = Date.now();
    if (nowMs - this._lastFootstepAt < 130) return false;
    this._lastFootstepAt = nowMs;

    const ctx = this._canPlaySfx();
    if (!ctx) return false;

    const now = ctx.currentTime;
    const pitchVar = 0.94 + Math.random() * 0.12;
    const gainVar = 0.9 + Math.random() * 0.18;
    const kind = String(surface || 'stone').trim().toLowerCase();

    try {
      const noiseBuf = this._getPinkNoiseBuffer(ctx, 1.0);

      if (kind === 'wood') {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(148 * pitchVar, now);
        osc.frequency.exponentialRampToValueAtTime(82 * pitchVar, now + 0.075);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.14 * gainVar, now);
        oscGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.09);

        osc.connect(oscGain);
        oscGain.connect(this._sfxGain);
        osc.start(now);
        osc.stop(now + 0.1);

        const tapSrc = ctx.createBufferSource();
        tapSrc.buffer = noiseBuf;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(420 * pitchVar, now);
        bp.Q.setValueAtTime(3.2, now);
        const tapGain = ctx.createGain();
        tapGain.gain.setValueAtTime(0.09 * gainVar, now);
        tapGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.055);
        tapSrc.connect(bp);
        bp.connect(tapGain);
        tapGain.connect(this._sfxGain);
        tapSrc.start(now, Math.random() * 0.3, 0.07);
        return true;
      }

      if (kind === 'gravel') {
        const grains = [
          { offset: 0.0, freq: 1350 * pitchVar, dur: 0.045, amp: 0.09 },
          { offset: 0.022, freq: 2150 * pitchVar, dur: 0.055, amp: 0.075 },
          { offset: 0.045, freq: 980 * pitchVar, dur: 0.045, amp: 0.065 }
        ];
        for (const g of grains) {
          const t = now + g.offset;
          const src = ctx.createBufferSource();
          src.buffer = noiseBuf;
          const bp = ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.setValueAtTime(g.freq, t);
          bp.Q.setValueAtTime(2.0, t);
          const gNode = ctx.createGain();
          gNode.gain.setValueAtTime(g.amp * gainVar, t);
          gNode.gain.exponentialRampToValueAtTime(0.0004, t + g.dur);
          src.connect(bp);
          bp.connect(gNode);
          gNode.connect(this._sfxGain);
          src.start(t, Math.random() * 0.4, g.dur + 0.02);
        }
        return true;
      }

      // Default: 'stone'
      const thudOsc = ctx.createOscillator();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(185 * pitchVar, now);
      thudOsc.frequency.exponentialRampToValueAtTime(92 * pitchVar, now + 0.055);

      const thudGain = ctx.createGain();
      thudGain.gain.setValueAtTime(0.11 * gainVar, now);
      thudGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.065);
      thudOsc.connect(thudGain);
      thudGain.connect(this._sfxGain);
      thudOsc.start(now);
      thudOsc.stop(now + 0.075);

      const tapSrc = ctx.createBufferSource();
      tapSrc.buffer = noiseBuf;
      const tapBP = ctx.createBiquadFilter();
      tapBP.type = 'bandpass';
      tapBP.frequency.setValueAtTime(920 * pitchVar, now);
      tapBP.Q.setValueAtTime(2.2, now);
      const tapGain = ctx.createGain();
      tapGain.gain.setValueAtTime(0.085 * gainVar, now);
      tapGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.042);
      tapSrc.connect(tapBP);
      tapBP.connect(tapGain);
      tapGain.connect(this._sfxGain);
      tapSrc.start(now, Math.random() * 0.3, 0.055);
      return true;
    } catch {
      return false;
    }
  }

  /* ========================================================================
     6. UI & BLESSING CHIMES
     ======================================================================== */

  /**
   * Gentle serene ascending pentatonic temple blessing chime.
   * @returns {boolean}
   */
  playBlessingChime() {
    const ctx = this._canPlaySfx();
    if (!ctx) return false;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5 - E5 - G5 warm blessing triad

    try {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(2600, now);
      lp.connect(this._sfxGain);

      notes.forEach((freq, idx) => {
        const t = now + idx * 0.11;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        const over = ctx.createOscillator();
        over.type = 'sine';
        over.frequency.setValueAtTime(freq * 2.0, t);

        const overGain = ctx.createGain();
        overGain.gain.setValueAtTime(0.18, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.11, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.45);

        osc.connect(gain);
        over.connect(overGain);
        overGain.connect(gain);
        gain.connect(lp);

        osc.start(t);
        over.start(t);
        osc.stop(t + 1.5);
        over.stop(t + 1.5);
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Crisp bright two-note lotus / merit-box chime.
   * @returns {boolean}
   */
  playCoinLotusSfx() {
    const ctx = this._canPlaySfx();
    if (!ctx) return false;

    const now = ctx.currentTime;
    const steps = [
      { offset: 0, freq: 987.77, dur: 0.42, gain: 0.11 }, // B5
      { offset: 0.085, freq: 1318.51, dur: 0.72, gain: 0.13 } // E6
    ];

    try {
      for (const s of steps) {
        const t = now + s.offset;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(s.freq, t);

        const glint = ctx.createOscillator();
        glint.type = 'triangle';
        glint.frequency.setValueAtTime(s.freq * 2.0, t);

        const glintGain = ctx.createGain();
        glintGain.gain.setValueAtTime(0.14, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(s.gain, t + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + s.dur);

        osc.connect(gain);
        glint.connect(glintGain);
        glintGain.connect(gain);
        gain.connect(this._sfxGain);

        osc.start(t);
        glint.start(t);
        osc.stop(t + s.dur + 0.04);
        glint.stop(t + s.dur + 0.04);
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gentle papery sutra page-turn rustle.
   * @returns {boolean}
   */
  playPageTurnSfx() {
    const ctx = this._canPlaySfx();
    if (!ctx) return false;

    const now = ctx.currentTime;
    const dur = 0.16;

    try {
      const src = ctx.createBufferSource();
      src.buffer = this._getPinkNoiseBuffer(ctx, 1.0);

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(880, now);
      bp.frequency.exponentialRampToValueAtTime(1850, now + 0.075);
      bp.frequency.exponentialRampToValueAtTime(720, now + dur);
      bp.Q.setValueAtTime(1.5, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0005, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.045);
      gain.gain.exponentialRampToValueAtTime(0.0004, now + dur);

      src.connect(bp);
      bp.connect(gain);
      gain.connect(this._sfxGain);
      src.start(now, Math.random() * 0.4, dur + 0.03);
      return true;
    } catch {
      return false;
    }
  }

  /* ========================================================================
     7. ELDERLY-FRIENDLY TTS READ-ALONG
     ======================================================================== */

  _getSpeechSynthesis() {
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        return window.speechSynthesis;
      }
      if (typeof globalThis !== 'undefined' && globalThis.speechSynthesis) {
        return globalThis.speechSynthesis;
      }
    } catch {}
    return null;
  }

  _getUtteranceConstructor() {
    try {
      if (typeof window !== 'undefined' && typeof window.SpeechSynthesisUtterance === 'function') {
        return window.SpeechSynthesisUtterance;
      }
      if (
        typeof globalThis !== 'undefined' &&
        typeof globalThis.SpeechSynthesisUtterance === 'function'
      ) {
        return globalThis.SpeechSynthesisUtterance;
      }
    } catch {}
    return null;
  }

  _initSpeechVoices() {
    const synth = this._getSpeechSynthesis();
    if (!synth || typeof synth.getVoices !== 'function') return;
    const refresh = () => {
      try {
        const list = synth.getVoices();
        if (Array.isArray(list)) {
          this._voicesCache = list;
        }
      } catch {}
    };
    refresh();
    if (typeof synth.addEventListener === 'function') {
      this._voicesChangedHandler = refresh;
      try {
        synth.addEventListener('voiceschanged', refresh);
      } catch {}
    }
  }

  _getVoicesList() {
    const synth = this._getSpeechSynthesis();
    if (synth && typeof synth.getVoices === 'function') {
      try {
        const live = synth.getVoices();
        if (Array.isArray(live) && live.length > 0) {
          this._voicesCache = live;
          return live;
        }
      } catch {}
    }
    return Array.isArray(this._voicesCache) ? this._voicesCache : [];
  }

  hasVietnameseVoice() {
    const voices = this._getVoicesList();
    return voices.some((v) => String(v?.lang || '').toLowerCase().startsWith('vi'));
  }

  /**
   * Speaks text via Web Speech API at an elderly-friendly cadence while
   * strictly respecting `muted`, `masterVolume`, and `voiceVolume`.
   * Returns `false` when no matching Vietnamese TTS voice exists (mobile/WebView fallback)
   * so callers can seamlessly fall back to pre-recorded Vietnamese MP3 audio + toast.
   *
   * @param {string} text
   * @param {object} [options]
   * @param {number} [options.rate=0.88]
   * @param {string} [options.lang='vi-VN']
   * @param {number} [options.pitch=0.98]
   * @param {() => void} [options.onEnd]
   * @returns {boolean}
   */
  speakText(text, { rate = 0.88, lang = 'vi-VN', pitch = 0.98, onEnd } = {}) {
    const cleanText = typeof text === 'string' ? text.trim() : '';
    const effectiveVol = this._muted ? 0 : clamp01(this._masterVolume * this._voiceVolume);

    if (!cleanText || effectiveVol <= 0) {
      this.stopSpeaking();
      return false;
    }

    const synth = this._getSpeechSynthesis();
    const UtteranceCtor = this._getUtteranceConstructor();
    if (!synth || !UtteranceCtor) {
      return false;
    }

    const voices = this._getVoicesList();
    const targetLang = String(lang || 'vi-VN');
    const langPrefix = targetLang.split('-')[0].toLowerCase();
    const exactVoice = voices.find(
      (v) => String(v?.lang || '').toLowerCase() === targetLang.toLowerCase()
    );
    const matchingVoice =
      exactVoice ||
      voices.find((v) => String(v?.lang || '').toLowerCase().startsWith(langPrefix));

    // When requesting Vietnamese speech on devices/WebViews without a Vietnamese voice,
    // return false cleanly so the app plays recorded Vietnamese MP3 narration instead of silent or garbled English speech.
    if (langPrefix === 'vi' && !matchingVoice) {
      return false;
    }

    const token = ++this._speechToken;
    try {
      synth.cancel?.();
    } catch {}

    try {
      const utter = new UtteranceCtor(cleanText);
      utter.lang = targetLang;
      utter.rate = clampRange(rate, 0.5, 1.8, 0.88);
      utter.pitch = clampRange(pitch, 0.6, 1.5, 0.98);
      utter.volume = effectiveVol;
      if (matchingVoice) utter.voice = matchingVoice;

      const finish = () => {
        if (token !== this._speechToken) return;
        this._ttsSpeaking = false;
        this._applyAmbientChantVolume();
        if (this.onSpeechStateChange) {
          try {
            this.onSpeechStateChange({ speaking: false, text: cleanText });
          } catch {}
        }
        if (typeof onEnd === 'function') {
          try {
            onEnd();
          } catch {}
        }
      };

      utter.onend = finish;
      utter.onerror = finish;

      this._ttsSpeaking = true;
      this._applyAmbientChantVolume();
      if (this.onSpeechStateChange) {
        try {
          this.onSpeechStateChange({ speaking: true, text: cleanText });
        } catch {}
      }

      synth.speak(utter);
      return true;
    } catch {
      if (token === this._speechToken) {
        this._ttsSpeaking = false;
        this._applyAmbientChantVolume();
      }
      return false;
    }
  }

  stopSpeaking() {
    this._speechToken++;
    const synth = this._getSpeechSynthesis();
    if (synth) {
      try {
        synth.cancel?.();
      } catch {}
    }
    if (this._ttsSpeaking) {
      this._ttsSpeaking = false;
      this._applyAmbientChantVolume();
      if (this.onSpeechStateChange) {
        try {
          this.onSpeechStateChange({ speaking: false, text: '' });
        } catch {}
      }
    }
  }

  /**
   * Speaks Vietnamese text using the server `/api/tts` audio proxy first (clear natural Vietnamese voice
   * across desktop, mobile WebViews, and headless Chromium), falling back to Web Speech API or local MP3.
   */
  async speakVietnameseSmart(text, { rate = 0.88, pitch = 0.98, onEnd, fallbackAudio = null } = {}) {
    const cleanText = typeof text === 'string' ? text.replace(/\s+/g, ' ').trim() : '';
    const effectiveVol = this._muted ? 0 : clamp01(this._masterVolume * this._voiceVolume);
    if (!cleanText || effectiveVol <= 0) {
      this.stopSpeaking();
      this.stopVoice();
      return { ok: false, mode: 'muted' };
    }

    this.stopSpeaking();
    const ttsUrl = `/api/tts?tl=vi&text=${encodeURIComponent(cleanText.slice(0, 480))}`;
    const playedServerTts = await this.playVoiceAudio(ttsUrl, {
      rate: clampRange(rate, 0.7, 1.35, 0.9),
      onEnded: onEnd
    });
    if (playedServerTts) {
      return { ok: true, mode: 'server_tts' };
    }

    const spokeNative = this.speakText(cleanText, { rate, lang: 'vi-VN', pitch, onEnd });
    if (spokeNative) {
      return { ok: true, mode: 'speech_synthesis' };
    }

    if (fallbackAudio) {
      const playedFallback = await this.playVoiceAudio(fallbackAudio, { rate, onEnded: onEnd });
      if (playedFallback) {
        return { ok: true, mode: 'fallback_audio' };
      }
    }
    return { ok: false, mode: 'none' };
  }

  playSutraCue(cue = 'mo') {
    if (cue === 'bell') {
      return this.playBronzeBell(1.06, 0.9);
    }
    if (cue === 'bell_close') {
      return this.playBronzeBell(0.92, 1.0);
    }
    if (cue === 'mo_accent') {
      return this.playWoodenMokugyo(true);
    }
    return this.playWoodenMokugyo(false);
  }

  /* ========================================================================
     LIFECYCLE CLEANUP
     ======================================================================== */

  dispose() {
    this._removeUnlockHooks();
    const synth = this._getSpeechSynthesis();
    if (synth && this._voicesChangedHandler && typeof synth.removeEventListener === 'function') {
      try {
        synth.removeEventListener('voiceschanged', this._voicesChangedHandler);
      } catch {}
    }
    this._voicesChangedHandler = null;
    this.stopAmbient();
    this.stopVoice();
    this.stopSpeaking();

    if (this.voiceEl && this._voiceListeners && typeof this.voiceEl.removeEventListener === 'function') {
      try {
        this.voiceEl.removeEventListener('play', this._voiceListeners.onPlay);
        this.voiceEl.removeEventListener('playing', this._voiceListeners.onPlaying);
        this.voiceEl.removeEventListener('pause', this._voiceListeners.onPause);
        this.voiceEl.removeEventListener('ended', this._voiceListeners.onEnded);
        this.voiceEl.removeEventListener('error', this._voiceListeners.onError);
        this.voiceEl.removeEventListener('loadedmetadata', this._voiceListeners.onTimeOrMeta);
        this.voiceEl.removeEventListener('durationchange', this._voiceListeners.onTimeOrMeta);
        this.voiceEl.removeEventListener('timeupdate', this._voiceListeners.onTimeOrMeta);
      } catch {}
    }
    this._voiceListeners = null;
    this.voiceEl = null;
    this._ambientChantEl = null;
    this._chantMediaSource = null;
    this._chantFilter = null;
    this._chantGain = null;

    if (this.ctx) {
      try {
        if (typeof this.ctx.close === 'function') {
          Promise.resolve(this.ctx.close()).catch(() => {});
        }
      } catch {}
    }
    this.ctx = null;
    this._masterGain = null;
    this._ambientGain = null;
    this._sfxGain = null;
    this._compressor = null;
    this._pinkNoiseBuffer = null;
  }
}

export default TempleAudioEngine;
