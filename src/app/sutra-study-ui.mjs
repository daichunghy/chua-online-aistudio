import {
  SUTRA_COLLECTION,
  SUTRA_REFLECTION_TAGS,
  getSutraById,
  getSutraTotalBeats,
  resolveSutraBeatPosition,
  advanceSutraBeat,
  getFirstBeatIndexForVerse,
  gradeSutraPuzzle,
  completeSutraSession,
  getSutraMasterySummary
} from '../logic/sutra-study-logic.mjs';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class SutraStudyController {
  /**
   * @param {object} hostApp - Instance of ChuaOnlineApp
   */
  constructor(hostApp) {
    this.app = hostApp;
    this.mode = 'chant'; // 'chant' | 'story' | 'game'
    this.audioMode = 'tts'; // 'tts' | 'temple_chant'
    this.showAllMeanings = false;
    this.shelfOpen = false;

    this.beatIndex = 0;
    this.sessionBeatsTapped = 0;
    this.autoPlaying = false;
    this.roundFinished = false;
    this.moPulse = false;

    this.puzzleIndex = 0;
    this.puzzleFeedback = null;
    this.selectedReflectionTag = SUTRA_REFLECTION_TAGS[0];
    this.keepsakeJustSaved = null;

    this._autoTimer = null;
    this._moPulseTimer = null;
    this._playbackToken = 0;
    this._templeChantEl = null;
  }

  get state() {
    return this.app.sutraStudy;
  }

  get activeSutra() {
    return getSutraById(this.state?.activeSutraId);
  }

  isVisibleAndActive() {
    return this.app.activeScreen === 'lecture' && this.app.lectureTab === 'sutra';
  }

  stopAllPlayback() {
    this._playbackToken++;
    this.autoPlaying = false;
    if (this._autoTimer) {
      clearTimeout(this._autoTimer);
      this._autoTimer = null;
    }
    this._stopTempleChantAudio();
    this.app.audio?.stopSpeaking?.();
    this.app.audio?.stopVoice?.();
  }

  _stopTempleChantAudio() {
    this.app.audio?.setAmbientDucking?.(false);
    if (this._templeChantEl) {
      try {
        this._templeChantEl.pause();
        this._templeChantEl.currentTime = 0;
      } catch {}
    }
  }

  _playTempleChantTrack(url) {
    if (!url || this.app.audioMuted) return false;
    try {
      const AudioCtor = typeof Audio === 'function' ? Audio : window?.Audio;
      if (!AudioCtor) return false;
      if (!this._templeChantEl) {
        this._templeChantEl = new AudioCtor();
        this._templeChantEl.loop = true;
      }
      this.app.audio?.setAmbientDucking?.(true);
      const mixer = this.app.audio?.getMixerState?.() || {};
      const effVol = mixer.muted ? 0 : Math.max(0, Math.min(1, (mixer.masterVolume ?? 1) * (mixer.voiceVolume ?? 0.9) * 0.72));
      this._templeChantEl.src = url;
      this._templeChantEl.volume = effVol;
      this._templeChantEl.playbackRate = this.app.readAlongRate === 0.85 ? 0.9 : 1.0;
      const p = this._templeChantEl.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
      return true;
    } catch {
      this.app.audio?.setAmbientDucking?.(false);
      return false;
    }
  }

  selectSutra(sutraId) {
    const next = getSutraById(sutraId);
    this.stopAllPlayback();
    this.app.sutraStudy = {
      ...this.app.sutraStudy,
      activeSutraId: next.id
    };
    this.beatIndex = 0;
    this.sessionBeatsTapped = 0;
    this.roundFinished = false;
    this.shelfOpen = false;
    this.puzzleIndex = 0;
    this.puzzleFeedback = null;
    this.keepsakeJustSaved = null;
    this.app.saveState();
    this.app.audio?.playPageTurnSfx?.();
    this.app.renderLectureStage();
  }

  jumpToVerse(verseIdx, { speak = true } = {}) {
    const sutra = this.activeSutra;
    this.beatIndex = getFirstBeatIndexForVerse(sutra, verseIdx);
    this.roundFinished = false;
    this.app.audio?.playWoodenMokugyo?.(false);
    if (speak) {
      this._speakVerseAt(verseIdx, { includeMeaning: true });
    }
    this.app.renderLectureStage();
  }

  _speakVerseAt(verseIdx, { includeMeaning = false, onDone } = {}) {
    const sutra = this.activeSutra;
    const verse = sutra.verses[verseIdx];
    if (!verse) return;
    const text = includeMeaning
      ? `${verse.chantLine} Hiểu nôm na: ${verse.plainMeaning}`
      : verse.chantLine;
    const rate = this.app.readAlongRate === 0.85 ? 0.84 : 0.96;
    this._stopTempleChantAudio();
    this.app.audio?.speakVietnameseSmart?.(text, {
      rate,
      fallbackAudio: sutra.chantAudioUrl,
      onEnd: onDone
    });
  }

  tapWoodenMo() {
    const sutra = this.activeSutra;
    const currentPos = resolveSutraBeatPosition(sutra, this.beatIndex);
    const cue = currentPos.beatUnit?.cue || 'mo';

    this.app.audio?.playSutraCue?.(cue);
    this.sessionBeatsTapped++;
    this.app.sutraStudy = {
      ...this.app.sutraStudy,
      totalMoBeats: (this.app.sutraStudy?.totalMoBeats || 0) + 1
    };

    // Visual Mõ ripple pulse
    this.moPulse = true;
    if (this._moPulseTimer) clearTimeout(this._moPulseTimer);
    this._moPulseTimer = setTimeout(() => {
      this.moPulse = false;
      const btn = document.getElementById('btn-sutra-tap-mo');
      if (btn) btn.classList.remove('mo-pulsing');
    }, 220);

    const step = advanceSutraBeat(sutra, this.beatIndex);
    this.beatIndex = step.nextBeatIndex;
    if (step.finishedRound && !this.roundFinished) {
      this.roundFinished = true;
      this.app.audio?.playSutraCue?.('bell_close');
      this.app.showToast(
        `🪷 Hoan hỷ! Đã tụng trọn ${sutra.shortTitle}`,
        'Cô bác có thể chơi "Ghép Chữ Vui" hoặc bấm "Hồi Hướng & Lưu Kỷ Niệm" bên dưới nhé!',
        4200,
        false
      );
    }
    this.app.saveState();
    this.app.renderLectureStage();
  }

  ringOpeningBell() {
    this.app.audio?.playSutraCue?.('bell');
    this.app.showToast(
      '🔔 Tiếng Đại Hồng Chung thanh tịnh',
      'Thả lỏng đôi vai, hít thở nhẹ nhàng trước khi đọc kinh.',
      2600,
      false
    );
  }

  toggleAutoChant() {
    if (this.autoPlaying) {
      this.stopAllPlayback();
      this.app.renderLectureStage();
      return;
    }

    const sutra = this.activeSutra;
    if (this.roundFinished) {
      this.beatIndex = 0;
      this.roundFinished = false;
    }
    this.autoPlaying = true;
    const token = ++this._playbackToken;
    this.app.audio?.playSutraCue?.('bell');

    if (this.audioMode === 'temple_chant') {
      this._playTempleChantTrack(sutra.chantAudioUrl);
      this._runTempleBeatLoop(token);
    } else {
      this._runTtsVerseLoop(token);
    }
    this.app.renderLectureStage();
  }

  _runTempleBeatLoop(token) {
    if (!this.autoPlaying || token !== this._playbackToken) return;
    const sutra = this.activeSutra;
    const pos = resolveSutraBeatPosition(sutra, this.beatIndex);
    this.app.audio?.playSutraCue?.(pos.beatUnit?.cue === 'bell' ? 'mo_accent' : 'mo');

    const stepMs = this.app.readAlongRate === 0.85 ? 1650 : 1250;
    this._autoTimer = setTimeout(() => {
      if (!this.autoPlaying || token !== this._playbackToken) return;
      const step = advanceSutraBeat(sutra, this.beatIndex);
      this.beatIndex = step.nextBeatIndex;
      if (step.finishedRound) {
        this.roundFinished = true;
        this.autoPlaying = false;
        this._stopTempleChantAudio();
        this.app.audio?.playSutraCue?.('bell_close');
        this.app.showToast(
          `🪷 Hoàn tất 1 biến ${sutra.shortTitle}`,
          'Âm hưởng thanh tịnh! Mời cô bác lưu Lá Bồ Đề kỷ niệm hoặc thử Ghép Chữ Vui.',
          4000,
          false
        );
        this.app.renderLectureStage();
        return;
      }
      this.app.renderLectureStage();
      this._runTempleBeatLoop(token);
    }, stepMs);
  }

  _runTtsVerseLoop(token) {
    if (!this.autoPlaying || token !== this._playbackToken) return;
    const sutra = this.activeSutra;
    const pos = resolveSutraBeatPosition(sutra, this.beatIndex);
    const vIdx = pos.verseIndex;
    const verse = sutra.verses[vIdx];
    if (!verse) {
      this.stopAllPlayback();
      this.app.renderLectureStage();
      return;
    }

    const stepVerseBeatsVisually = () => {
      const units = verse.beatUnits || [];
      if (units.length <= 1) return;
      const unitMs = this.app.readAlongRate === 0.85 ? 1150 : 880;
      let localIdx = 1;
      const tickLocal = () => {
        if (!this.autoPlaying || token !== this._playbackToken) return;
        const curPos = resolveSutraBeatPosition(sutra, this.beatIndex);
        if (curPos.verseIndex !== vIdx) return;
        if (localIdx < units.length) {
          this.beatIndex = getFirstBeatIndexForVerse(sutra, vIdx) + localIdx;
          this.app.audio?.playWoodenMokugyo?.(units[localIdx]?.cue === 'mo_accent');
          localIdx++;
          this.app.renderLectureStage();
          this._autoTimer = setTimeout(tickLocal, unitMs);
        }
      };
      this._autoTimer = setTimeout(tickLocal, unitMs);
    };

    const advanceToNextVerse = () => {
      if (!this.autoPlaying || token !== this._playbackToken) return;
      if (this._autoTimer) {
        clearTimeout(this._autoTimer);
        this._autoTimer = null;
      }
      if (vIdx + 1 >= sutra.verses.length) {
        this.beatIndex = getSutraTotalBeats(sutra) - 1;
        this.roundFinished = true;
        this.autoPlaying = false;
        this.app.audio?.playSutraCue?.('bell_close');
        this.app.showToast(
          `🪷 Hoan hỷ! Đã nghe trọn ${sutra.shortTitle}`,
          'Mời cô bác lưu Lá Bồ Đề Ghi Nhớ hoặc chơi Ghép Chữ Kệ Kinh.',
          4000,
          false
        );
        this.app.renderLectureStage();
        return;
      }
      this.beatIndex = getFirstBeatIndexForVerse(sutra, vIdx + 1);
      this.app.renderLectureStage();
      this._runTtsVerseLoop(token);
    };

    const text = this.showAllMeanings
      ? `${verse.chantLine} Nghĩa là: ${verse.plainMeaning}`
      : verse.chantLine;
    const rate = this.app.readAlongRate === 0.85 ? 0.84 : 0.96;

    stepVerseBeatsVisually();
    this.app.audio
      ?.speakVietnameseSmart?.(text, {
        rate,
        fallbackAudio: null,
        onEnd: advanceToNextVerse
      })
      .then((res) => {
        if (!this.autoPlaying || token !== this._playbackToken) return;
        if (!res?.ok) {
          // Graceful offline/timer fallback if TTS audio is unavailable
          const fallbackDuration = Math.max(2800, verse.chantLine.length * 65);
          this._autoTimer = setTimeout(advanceToNextVerse, fallbackDuration);
        }
      })
      .catch(() => {
        if (!this.autoPlaying || token !== this._playbackToken) return;
        this._autoTimer = setTimeout(advanceToNextVerse, 3400);
      });
  }

  answerPuzzle(optionIdx) {
    const sutra = this.activeSutra;
    const res = gradeSutraPuzzle(sutra.id, this.puzzleIndex, optionIdx);
    this.puzzleFeedback = {
      selectedIndex: optionIdx,
      ...res
    };

    if (res.correct) {
      this.app.audio?.playBlessingChime?.();
      const prevMap = this.app.sutraStudy?.puzzleSolved || {};
      const existing = Array.isArray(prevMap[sutra.id]) ? prevMap[sutra.id] : [];
      const nextSolved = Array.from(new Set([...existing, this.puzzleIndex]));
      this.app.sutraStudy = {
        ...this.app.sutraStudy,
        puzzleSolved: {
          ...prevMap,
          [sutra.id]: nextSolved
        }
      };
      this.app.saveState();
      this.app.audio?.speakVietnameseSmart?.(res.explanation, {
        rate: this.app.readAlongRate === 0.85 ? 0.85 : 0.96
      });
    } else {
      this.app.audio?.playWoodenMokugyo?.(false);
    }
    this.app.renderLectureStage();
  }

  nextPuzzle() {
    const sutra = this.activeSutra;
    const total = sutra.fillBlankPuzzles.length;
    this.puzzleIndex = (this.puzzleIndex + 1) % total;
    this.puzzleFeedback = null;
    this.app.audio?.playPageTurnSfx?.();
    this.app.renderLectureStage();
  }

  saveKeepsakeSession() {
    const sutra = this.activeSutra;
    const todayLabel = new Date().toLocaleDateString('vi-VN');
    const result = completeSutraSession(this.app.sutraStudy, sutra.id, {
      noteTag: this.selectedReflectionTag,
      beatsTapped: this.sessionBeatsTapped,
      dateLabel: todayLabel
    });

    this.app.sutraStudy = result.state;
    this.sessionBeatsTapped = 0;
    this.keepsakeJustSaved = {
      sutraTitle: sutra.shortTitle,
      noteTag: this.selectedReflectionTag,
      bonusMeritXp: result.bonusMeritXp,
      firstTimeCompleted: result.firstTimeCompleted
    };

    if (typeof this.app.grantPilgrimXp === 'function') {
      this.app.grantPilgrimXp(result.bonusMeritXp, `Học kinh: ${sutra.shortTitle}`);
    }
    if (result.firstTimeCompleted && typeof this.app.recordDailyMissionMetric === 'function') {
      // fallback handled via app method if exposed; direct import already exists in app
    }
    this.app.saveState();
    this.app.updateActionBadges?.();
    this.app.audio?.playSutraCue?.('bell_close');
    this.app.showToast(
      `🪷 Đã hồi hướng & lưu Lá Bồ Đề (${sutra.shortTitle})`,
      `Tâm niệm "${this.selectedReflectionTag}" · Nhận +${result.bonusMeritXp} Điểm Hành Hương.`,
      4200,
      false
    );
    this.app.renderLectureStage();
  }

  render(stageEl) {
    if (!stageEl) return;
    const sutra = this.activeSutra;
    const summary = getSutraMasterySummary(this.state);
    const pos = resolveSutraBeatPosition(sutra, this.beatIndex);
    const activeVerse = pos.verse || sutra.verses[0];
    const solvedSet = new Set(this.state?.puzzleSolved?.[sutra.id] || []);
    const currentPuzzle = sutra.fillBlankPuzzles[this.puzzleIndex] || sutra.fillBlankPuzzles[0];
    const allPuzzlesDone = solvedSet.size >= sutra.fillBlankPuzzles.length;

    const shelfHtml = this.shelfOpen
      ? `
      <div class="sutra-shelf-drawer" role="region" aria-label="Chọn quyển kinh muốn học">
        <div class="sutra-shelf-header">
          <div>
            <div class="sutra-eyebrow">TỦ KINH DỄ HIỂU CHÙA VĨNH TRÀNG</div>
            <div class="sutra-shelf-sub">Chọn một quyển kinh bên dưới để đọc, gõ mõ và nghe giải thích nôm na</div>
          </div>
          <button type="button" class="sutra-ghost-btn" id="btn-sutra-close-shelf">Đóng danh sách ✕</button>
        </div>
        <div class="sutra-books-grid">
          ${SUTRA_COLLECTION.map((item) => {
            const isActive = item.id === sutra.id;
            const isDone = (this.state?.completedSutras || []).includes(item.id);
            return `
              <button type="button" class="sutra-book-card ${isActive ? 'active' : ''}" data-select-sutra="${escapeHtml(item.id)}">
                <div class="sutra-book-top">
                  <span class="sutra-book-icon" aria-hidden="true">${item.icon}</span>
                  <span class="sutra-book-status">${isDone ? '✓ Đã thuộc' : item.difficulty}</span>
                </div>
                <div class="sutra-book-title">${escapeHtml(item.shortTitle)}</div>
                <div class="sutra-book-desc">${escapeHtml(item.meaningOverview)}</div>
              </button>`;
          }).join('')}
        </div>
      </div>`
      : '';

    let modeBodyHtml = '';

    if (this.mode === 'chant') {
      modeBodyHtml = `
        <div class="sutra-chant-toolbar">
          <div class="sutra-audio-source-group" role="group" aria-label="Chọn kiểu âm thanh tụng kinh">
            <button type="button" class="sutra-audio-chip ${this.audioMode === 'tts' ? 'active' : ''}" data-sutra-audio-mode="tts">
              🎙️ Thầy đọc từng câu (Rõ chữ)
            </button>
            <button type="button" class="sutra-audio-chip ${this.audioMode === 'temple_chant' ? 'active' : ''}" data-sutra-audio-mode="temple_chant">
              🛕 Tiếng chùa tụng thật
            </button>
          </div>
          <button type="button" class="sutra-meaning-toggle ${this.showAllMeanings ? 'active' : ''}" id="btn-sutra-toggle-meanings">
            ${this.showAllMeanings ? '💡 Đang hiện giải nghĩa' : '💡 Hiện giải nghĩa mọi câu'}
          </button>
        </div>

        <p class="sutra-simple-tip">
          ${
            this.audioMode === 'temple_chant'
              ? `Đang chọn: ${escapeHtml(sutra.chantSourceLabel)}. Bấm <strong>Nghe Tụng Chung</strong> hoặc bấm <strong>Gõ Mõ</strong> để đọc theo từng chữ sáng vàng.`
              : 'Bấm <strong>Nghe Tụng Chung</strong> để nghe đọc tự động từng câu, hoặc tự tay bấm <strong>Gõ Mõ</strong> (hoặc phím Cách) theo nhịp tròn sáng.'
          }
        </p>

        <div class="sutra-verses-scroll" id="sutra-verses-scroll">
          ${sutra.verses
            .map((verse, vIdx) => {
              const isVerseActive = vIdx === pos.verseIndex;
              const showMeaning = this.showAllMeanings || isVerseActive;
              const beatsHtml = (verse.beatUnits || [])
                .map((unit, bIdx) => {
                  const isBeatActive = isVerseActive && bIdx === pos.beatIndexInVerse;
                  const cueSymbol = unit.cue === 'bell' ? '🔔' : '○';
                  return `<span class="sutra-beat-unit ${isBeatActive ? 'active' : ''}">${escapeHtml(unit.text)} <small aria-hidden="true">${cueSymbol}</small></span>`;
                })
                .join(' ');

              return `
                <div class="sutra-verse-row ${isVerseActive ? 'active' : ''}" data-sutra-verse-idx="${vIdx}" role="button" tabindex="0">
                  <div class="sutra-verse-head">
                    <span class="sutra-verse-num">Câu ${vIdx + 1}/${sutra.verses.length}</span>
                    <button type="button" class="sutra-verse-listen-btn" data-speak-verse="${vIdx}" aria-label="Nghe đọc câu ${vIdx + 1}">
                      🔊 Nghe câu này
                    </button>
                  </div>
                  <div class="sutra-verse-line">${beatsHtml}</div>
                  ${
                    showMeaning
                      ? `<div class="sutra-verse-meaning">
                          <strong>Hiểu nôm na:</strong> ${escapeHtml(verse.plainMeaning)}
                          <div class="sutra-verse-practice"><strong>Áp dụng:</strong> ${escapeHtml(verse.dailyPractice)}</div>
                        </div>`
                      : ''
                  }
                </div>`;
            })
            .join('')}
        </div>

        <div class="sutra-rhythm-deck">
          <div class="sutra-progress-row">
            <span>Tiến độ biến kinh: <strong>${pos.globalBeatIndex + 1}/${pos.totalBeats} nhịp</strong> (${pos.progressPercent}%)</span>
            <span>Nhịp tiếp theo: <strong>${escapeHtml(pos.beatUnit?.text || '')}</strong></span>
          </div>
          <div class="sutra-progress-track" aria-hidden="true">
            <div class="sutra-progress-fill" style="width:${pos.progressPercent}%"></div>
          </div>

          <div class="sutra-controls-trio">
            <button type="button" class="sutra-bell-btn" id="btn-sutra-ring-bell">
              <span class="sutra-btn-icon">🔔</span>
              <span>Thỉnh Chuông</span>
            </button>

            <button type="button" class="sutra-mo-pad-btn ${this.moPulse ? 'mo-pulsing' : ''}" id="btn-sutra-tap-mo">
              <span class="sutra-btn-icon">🥁</span>
              <span class="sutra-mo-btn-copy">
                <strong>Gõ Mõ Theo Nhịp</strong>
                <small>${escapeHtml(pos.beatUnit?.text || 'Đọc tiếp')}</small>
              </span>
            </button>

            <button type="button" class="sutra-auto-btn ${this.autoPlaying ? 'playing' : ''}" id="btn-sutra-auto-chant">
              <span class="sutra-btn-icon">${this.autoPlaying ? '⏸' : '▶'}</span>
              <span>${this.autoPlaying ? 'Tạm Dừng' : 'Nghe Tụng Chung'}</span>
            </button>
          </div>
        </div>

        ${
          this.roundFinished
            ? `<div class="sutra-round-complete-banner">
                <div>
                  <div class="sutra-complete-title">🪷 Hoan hỷ! Cô bác vừa tụng xong ${escapeHtml(sutra.shortTitle)}</div>
                  <div class="sutra-complete-sub">Bấm chơi "Ghép Chữ Vui" để nhớ lâu hoặc lưu Lá Bồ Đề Hồi Hướng ngay.</div>
                </div>
                <div class="sutra-complete-actions">
                  <button type="button" class="sutra-gold-cta" id="btn-sutra-go-game">✨ Ghép Chữ Vui</button>
                  <button type="button" class="sutra-wood-cta" id="btn-sutra-quick-keepsake">🙏 Hồi Hướng</button>
                </div>
              </div>`
            : ''
        }
      `;
    } else if (this.mode === 'story') {
      modeBodyHtml = `
        <div class="sutra-story-card">
          <div class="sutra-story-head">
            <div>
              <div class="sutra-eyebrow">CÂU CHUYỆN GẦN GŨI DỄ NHỚ</div>
              <h3 class="sutra-story-title">${escapeHtml(sutra.shortTitle)} nói về điều gì?</h3>
            </div>
            <button type="button" class="sutra-gold-cta" id="btn-sutra-speak-story">🔊 Nghe kể chuyện</button>
          </div>
          <p class="sutra-story-text">${escapeHtml(sutra.dailyStory)}</p>
        </div>

        <div class="sutra-verses-scroll">
          ${sutra.verses
            .map(
              (verse, idx) => `
            <div class="sutra-verse-row active">
              <div class="sutra-verse-head">
                <span class="sutra-verse-num">Ý ${idx + 1}/${sutra.verses.length}</span>
                <button type="button" class="sutra-verse-listen-btn" data-speak-story-verse="${idx}">
                  🔊 Nghe giải thích
                </button>
              </div>
              <div class="sutra-verse-line">${escapeHtml(verse.chantLine)}</div>
              <div class="sutra-verse-meaning">
                <strong>Hiểu nôm na:</strong> ${escapeHtml(verse.plainMeaning)}
                <div class="sutra-verse-practice"><strong>Áp dụng:</strong> ${escapeHtml(verse.dailyPractice)}</div>
              </div>
            </div>`
            )
            .join('')}
        </div>
      `;
    } else {
      // 'game' mode: Interactive "Ghép Chữ Vui" + "Lá Bồ Đề Ghi Nhớ"
      const renderedPrompt = currentPuzzle.prompt.replace(
        '___',
        this.puzzleFeedback?.correct
          ? `<span class="sutra-blank-filled">${escapeHtml(this.puzzleFeedback.correctAnswer)}</span>`
          : '<span class="sutra-blank-slot">? ? ?</span>'
      );

      modeBodyHtml = `
        <div class="sutra-game-card">
          <div class="sutra-game-head">
            <div>
              <div class="sutra-eyebrow">TRÒ CHƠI GHÉP CHỮ KỆ KINH · CÂU ${this.puzzleIndex + 1}/${sutra.fillBlankPuzzles.length}</div>
              <div class="sutra-game-score">Đã ghép đúng ${solvedSet.size}/${sutra.fillBlankPuzzles.length} câu của quyển kinh này</div>
            </div>
            <button type="button" class="sutra-ghost-btn" id="btn-sutra-read-puzzle">🔊 Đọc câu hỏi</button>
          </div>

          <div class="sutra-puzzle-verse">${renderedPrompt}</div>

          <div class="sutra-puzzle-options">
            ${currentPuzzle.options
              .map((opt, oIdx) => {
                const isSelected = this.puzzleFeedback?.selectedIndex === oIdx;
                const isRight = this.puzzleFeedback?.correct && oIdx === currentPuzzle.correctIndex;
                const isWrong = isSelected && this.puzzleFeedback && !this.puzzleFeedback.correct;
                return `
                  <button type="button" class="sutra-word-tile ${isRight ? 'correct' : isWrong ? 'wrong' : ''}" data-sutra-puzzle-opt="${oIdx}">
                    ${escapeHtml(opt)}
                  </button>`;
              })
              .join('')}
          </div>

          ${
            this.puzzleFeedback
              ? `<div class="sutra-puzzle-feedback ${this.puzzleFeedback.correct ? 'ok' : 'hint'}">
                  <div>${this.puzzleFeedback.correct ? '✓ Hoan hỷ!' : '💡 Gợi ý:'} ${escapeHtml(this.puzzleFeedback.explanation)}</div>
                  ${
                    sutra.fillBlankPuzzles.length > 1
                      ? `<button type="button" class="sutra-gold-cta" id="btn-sutra-next-puzzle">Câu tiếp theo →</button>`
                      : ''
                  }
                </div>`
              : ''
          }
        </div>

        <div class="sutra-keepsake-card" id="sutra-keepsake-section">
          <div class="sutra-eyebrow">LÁ BỒ ĐỀ GHI NHỚ &amp; HỒI HƯỚNG</div>
          <div class="sutra-keepsake-title">Hôm nay nghe xong ${escapeHtml(sutra.shortTitle)}, lòng cô bác thấy sao?</div>
          <div class="sutra-reflection-grid">
            ${SUTRA_REFLECTION_TAGS.map(
              (tag) => `
              <button type="button" class="sutra-reflection-btn ${this.selectedReflectionTag === tag ? 'active' : ''}" data-reflection-tag="${escapeHtml(tag)}">
                ${escapeHtml(tag)}
              </button>`
            ).join('')}
          </div>

          <button type="button" class="sutra-save-keepsake-btn" id="btn-sutra-save-keepsake">
            🙏 Hồi Hướng &amp; Lưu Lá Bồ Đề (+${(this.state?.completedSutras || []).includes(sutra.id) ? 10 : 25} Điểm Hành Hương)
          </button>

          ${
            this.keepsakeJustSaved
              ? `<div class="sutra-keepsake-saved-note">
                  🪷 Đã lưu kỷ niệm "${escapeHtml(this.keepsakeJustSaved.sutraTitle)}" (${escapeHtml(this.keepsakeJustSaved.noteTag)}) — ${allPuzzlesDone ? 'Đã trọn vẹn cả 3 câu ghép chữ!' : 'Hoan hỷ công đức!'}
                </div>`
              : ''
          }
        </div>
      `;
    }

    stageEl.innerHTML = `
      <div class="sutra-study-shell">
        <div class="sutra-main-card lecture-translucent-card">
          <div class="sutra-top-header">
            <div class="sutra-title-block">
              <div class="sutra-eyebrow">HỌC KINH CÙNG CHÙA VĨNH TRÀNG · ĐÃ THUỘC ${summary.completedCount}/${summary.totalSutras} QUYỂN</div>
              <h2 class="sutra-active-title">${sutra.icon} ${escapeHtml(sutra.title)}</h2>
              <div class="sutra-active-meta">${escapeHtml(sutra.difficulty)} · ${escapeHtml(sutra.sourceTag)} · Tổng ${summary.totalMoBeats} nhịp mõ đã gõ</div>
            </div>
            <button type="button" class="sutra-change-book-btn" id="btn-sutra-toggle-shelf">
              📚 ${this.shelfOpen ? 'Đóng tủ kinh' : 'Chọn Kinh khác (6 quyển)'}
            </button>
          </div>

          ${shelfHtml}

          <div class="sutra-mode-tabs" role="tablist" aria-label="Chọn cách học kinh">
            <button type="button" class="sutra-mode-tab ${this.mode === 'chant' ? 'active' : ''}" data-sutra-mode="chant" role="tab">
              🥁 Tụng &amp; Gõ Mõ
            </button>
            <button type="button" class="sutra-mode-tab ${this.mode === 'story' ? 'active' : ''}" data-sutra-mode="story" role="tab">
              📖 Chuyện &amp; Ý Nghĩa
            </button>
            <button type="button" class="sutra-mode-tab ${this.mode === 'game' ? 'active' : ''}" data-sutra-mode="game" role="tab">
              ✨ Ghép Chữ Vui (${solvedSet.size}/${sutra.fillBlankPuzzles.length})
            </button>
          </div>

          ${modeBodyHtml}
        </div>
      </div>
    `;

    this._bindStageEvents(stageEl);

    // Keep only the inner #sutra-verses-scroll positioned on the active verse,
    // never scrolling the outer .lecture-center-stage past the sutra header/tabs.
    const versesScrollEl = stageEl.querySelector('#sutra-verses-scroll');
    const activeVerseEl = versesScrollEl?.querySelector('.sutra-verse-row.active');
    if (versesScrollEl && activeVerseEl) {
      if (pos.verseIndex === 0) {
        versesScrollEl.scrollTop = 0;
        stageEl.scrollTop = 0;
      } else {
        const boxRect = versesScrollEl.getBoundingClientRect();
        const rowRect = activeVerseEl.getBoundingClientRect();
        if (rowRect.top < boxRect.top) {
          versesScrollEl.scrollTop += rowRect.top - boxRect.top - 8;
        } else if (rowRect.bottom > boxRect.bottom) {
          versesScrollEl.scrollTop += rowRect.bottom - boxRect.bottom + 8;
        }
      }
    } else if (this.mode !== 'game') {
      stageEl.scrollTop = 0;
    }
  }

  _bindStageEvents(stageEl) {
    document.getElementById('btn-sutra-toggle-shelf')?.addEventListener('click', () => {
      this.shelfOpen = !this.shelfOpen;
      this.app.audio?.playPageTurnSfx?.();
      this.app.renderLectureStage();
    });
    document.getElementById('btn-sutra-close-shelf')?.addEventListener('click', () => {
      this.shelfOpen = false;
      this.app.renderLectureStage();
    });

    stageEl.querySelectorAll('[data-select-sutra]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sid = btn.getAttribute('data-select-sutra');
        if (sid) this.selectSutra(sid);
      });
    });

    stageEl.querySelectorAll('[data-sutra-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextMode = btn.getAttribute('data-sutra-mode');
        if (nextMode && nextMode !== this.mode) {
          this.stopAllPlayback();
          this.mode = nextMode;
          this.app.audio?.playPageTurnSfx?.();
          this.app.renderLectureStage();
        }
      });
    });

    stageEl.querySelectorAll('[data-sutra-audio-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextAudioMode = btn.getAttribute('data-sutra-audio-mode');
        if (!nextAudioMode) return;
        const wasPlaying = this.autoPlaying;
        this.stopAllPlayback();
        this.audioMode = nextAudioMode;
        this.app.audio?.playWoodenMokugyo?.(false);
        this.app.renderLectureStage();
        if (wasPlaying) {
          this.toggleAutoChant();
        }
      });
    });

    document.getElementById('btn-sutra-toggle-meanings')?.addEventListener('click', () => {
      this.showAllMeanings = !this.showAllMeanings;
      this.app.audio?.playWoodenMokugyo?.(false);
      this.app.renderLectureStage();
    });

    stageEl.querySelectorAll('[data-sutra-verse-idx]').forEach((row) => {
      const activate = (e) => {
        if (e.target?.closest?.('[data-speak-verse]')) return;
        const idx = Number(row.getAttribute('data-sutra-verse-idx'));
        if (Number.isInteger(idx)) {
          this.stopAllPlayback();
          this.jumpToVerse(idx, { speak: true });
        }
      };
      row.addEventListener('click', activate);
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          activate(e);
        }
      });
    });

    stageEl.querySelectorAll('[data-speak-verse]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = Number(btn.getAttribute('data-speak-verse'));
        if (Number.isInteger(idx)) {
          this.stopAllPlayback();
          this.beatIndex = getFirstBeatIndexForVerse(this.activeSutra, idx);
          this._speakVerseAt(idx, { includeMeaning: true });
          this.app.renderLectureStage();
        }
      });
    });

    stageEl.querySelectorAll('[data-speak-story-verse]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-speak-story-verse'));
        if (Number.isInteger(idx)) {
          this.stopAllPlayback();
          this._speakVerseAt(idx, { includeMeaning: true });
        }
      });
    });

    document.getElementById('btn-sutra-ring-bell')?.addEventListener('click', () => {
      this.ringOpeningBell();
    });
    document.getElementById('btn-sutra-tap-mo')?.addEventListener('click', () => {
      this.tapWoodenMo();
    });
    document.getElementById('btn-sutra-auto-chant')?.addEventListener('click', () => {
      this.toggleAutoChant();
    });

    document.getElementById('btn-sutra-go-game')?.addEventListener('click', () => {
      this.stopAllPlayback();
      this.mode = 'game';
      this.app.renderLectureStage();
    });
    document.getElementById('btn-sutra-quick-keepsake')?.addEventListener('click', () => {
      this.stopAllPlayback();
      this.mode = 'game';
      this.app.renderLectureStage();
      setTimeout(() => {
        document.getElementById('sutra-keepsake-section')?.scrollIntoView?.({ behavior: 'smooth' });
      }, 60);
    });

    document.getElementById('btn-sutra-speak-story')?.addEventListener('click', () => {
      const sutra = this.activeSutra;
      this.stopAllPlayback();
      this.app.audio?.speakVietnameseSmart?.(`${sutra.shortTitle}. ${sutra.dailyStory}`, {
        rate: this.app.readAlongRate === 0.85 ? 0.85 : 0.96,
        fallbackAudio: sutra.chantAudioUrl
      });
    });

    document.getElementById('btn-sutra-read-puzzle')?.addEventListener('click', () => {
      const sutra = this.activeSutra;
      const p = sutra.fillBlankPuzzles[this.puzzleIndex];
      if (!p) return;
      this.stopAllPlayback();
      this.app.audio?.speakVietnameseSmart?.(p.prompt.replace('___', 'chỗ trống'), {
        rate: this.app.readAlongRate === 0.85 ? 0.85 : 0.96
      });
    });

    stageEl.querySelectorAll('[data-sutra-puzzle-opt]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-sutra-puzzle-opt'));
        if (Number.isInteger(idx)) {
          this.answerPuzzle(idx);
        }
      });
    });

    document.getElementById('btn-sutra-next-puzzle')?.addEventListener('click', () => {
      this.nextPuzzle();
    });

    stageEl.querySelectorAll('[data-reflection-tag]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tag = btn.getAttribute('data-reflection-tag');
        if (tag) {
          this.selectedReflectionTag = tag;
          this.app.audio?.playWoodenMokugyo?.(false);
          this.app.renderLectureStage();
        }
      });
    });

    document.getElementById('btn-sutra-save-keepsake')?.addEventListener('click', () => {
      this.saveKeepsakeSession();
    });
  }
}
