/**
 * Giảng đường, Học viện (mở khóa, thi, chứng nhận), giáo trình.
 *
 * Mixin của ChuaOnlineApp: 6 method (renderLectureStage … openAudioRecordingsModal).
 * Được gắn vào class trong chua-online-app.mjs qua applyMixins().
 */
import { DHARMA_TEXTBOOKS, LECTURE_LESSONS, gradeLessonQuiz, recordDailyMissionMetric, ACADEMY_COURSES, ACADEMY_ALL_IN_BUNDLE, ACADEMY_MODULES, getAcademyExamQuestions, gradeAcademyExam, unlockAcademyCourseWithCode, buildVietQRPayload, generateAcademyCertificate, AUDIO_LIBRARY } from './shared.mjs';

export const lectureAcademyMethods = {
  /* ========================================================================
     HỌC VIỆN PHẬT HỌC & GIẢNG ĐƯỜNG RENDERING (4 Khóa · 12 Học phần · 11 PDF)
     ======================================================================== */
  renderLectureStage() {
    const stage = document.getElementById('lecture-center-stage');
    if (!stage) return;

    document.querySelectorAll('.lecture-dock-tab').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-lecture-tab') === this.lectureTab);
    });

    if (this.lectureTab === 'sutra') {
      this.sutraCtrl.render(stage);
      return;
    }

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
        this.recordVirtueProgress?.('reading', `Nghe giảng: ${lesson.title}`);
      });
      document.getElementById('btn-toggle-lecture-listen')?.addEventListener('click', () => {
        if (this.audioPlaying) {
          this.pauseVoiceAudio();
        } else {
          this.playVoiceAudio(lesson.audio, { rate: this.readAlongRate || 1.0 });
          this.recordVirtueProgress?.('reading', `Nghe pháp âm: ${lesson.title}`);
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
            this.recordVirtueProgress?.('reading', `Học Phật: ${lesson.title}`);
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
  },

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
  },

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
  },

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
  },

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
  },

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
};
