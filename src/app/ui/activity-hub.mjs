/**
 * Trung tâm hoạt động: 30 ngày, nhật ký, thành tựu.
 *
 * Mixin của ChuaOnlineApp: 1 method (openActivityHubModal … openActivityHubModal).
 * Được gắn vào class trong chua-online-app.mjs qua applyMixins().
 */
import { PILGRIMAGE_STATIONS, findAnyTempleDestination, recordSpiritualMilestone, getLocalDateKey, DAILY_CHECKIN_REWARDS, PILGRIMAGE_GUIDE_STEPS, ensureDailyMissionDate, getDailyMissionsWithProgress, claimDailyMissionReward, getExplorationChaptersStatus, claimExplorationChapterReward, claimDailyCheckin, getQuestsWithProgress, claimQuestReward, getMailboxWithStatus, claimMailboxReward, replyToMailboxMessage, buildPilgrimageShareText, recordPilgrimageShare, submitUserFeedback, getPilgrimRankInfo, THIRTY_DAY_RETREATS, THIRTY_DAY_JOURNEY_PLAN, getThirtyDayTheme, getTempleSeasonalContext, DHARMA_JOURNAL_MOODS, addJournalEntry } from './shared.mjs';

export const activityHubMethods = {
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
};
