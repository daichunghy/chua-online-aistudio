/**
 * Hạt hiệu ứng, âm thanh chuông/mõ/giọng đọc, bộ trộn âm.
 *
 * Mixin của ChuaOnlineApp: 15 method (initParticleFX … syncHoaDangLanternsTo3D).
 * Được gắn vào class trong chua-online-app.mjs qua applyMixins().
 */
import { getPilgrimageMode, TempleAudioEngine } from './shared.mjs';

export const effectsAudioMethods = {
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
  },

  resizeFXCanvas() {
    const fx = document.getElementById('fx-canvas');
    if (!fx) return;
    fx.width = window.innerWidth;
    fx.height = window.innerHeight;
  },

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
  },

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
  },

  /* ========================================================================
     SOUND, SOUNDSCAPE & VOICEOVER ENGINE (Unified TempleAudioEngine)
     ======================================================================== */
  ensureAudioContext() {
    this.audio?.unlock?.();
    if (this.audio && !this.audio.isAmbientRunning) {
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
