/**
 * Cộng Đồng Đạo Hữu: Bạn Bè (Đạo Hữu), Bảng Xếp Hạng, Tặng Quà & Giao Lưu Cộng Đồng.
 *
 * Mixin của ChuaOnlineApp: 3 method (updateSocialBadge, getSelfSocialMetrics, openSocialHubModal).
 * Được gắn vào class trong chua-online-app.mjs qua applyMixins().
 */
import {
  SOCIAL_GIFT_CATALOG,
  DEFAULT_COMMUNITY_MEMBERS,
  getUnreadSocialCount,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  sendGiftToFriend,
  claimReceivedGift,
  computeLeaderboard,
  addCommunityPost,
  toggleRejoicePost,
  computeCommunityGoalProgress,
  recordSpiritualMilestone
} from './shared.mjs';

function esc(raw) {
  return String(raw ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function charAvatarBadge(charKey) {
  const map = {
    nu: '🪷',
    nu_ao_lam: '🪷',
    nam: '🙏',
    nam_ao_nau: '🙏',
    tre_em: '🌱',
    co_tu: '🌸',
    chu_sau: '☕',
    su_thay: '🔔',
    du_khach: '🧭'
  };
  return map[charKey] || '🪷';
}

function formatPostDate(iso) {
  if (!iso) return 'Vừa xong';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const socialHubMethods = {
  getSelfSocialMetrics() {
    const bow = Number(this.spiritual?.bowCount || 0);
    const inc = Number(this.spiritual?.incenseOfferings || 0);
    const flw = Number(this.spiritual?.flowerOfferings || 0);
    const mala = Number(this.spiritual?.malaCycles || 0) * 108 + Number(this.spiritual?.malaBeads || 0);
    const lessons = Number(this.completedLessons?.size || 0);
    const lotus = Number(this.storeProfile?.lotusPoints || 0);
    const towerCount = (this.blessingTower?.entries || []).filter((e) => !String(e.id || '').startsWith('seed_')).length;
    const meritScore = Math.max(
      25,
      Math.round(bow * 15 + inc * 12 + flw * 10 + Math.floor(mala / 6) + lessons * 25 + towerCount * 30 + Math.floor(lotus * 0.4))
    );
    const streakDays = Math.max(
      1,
      Number(this.activityHub?.dailyCheckIn?.streak || 0),
      Array.isArray(this.practicedDays) ? this.practicedDays.length : 1
    );
    const giftsSent = (this.social?.sentGifts || []).length;
    const currentArea = this.world3d?.insideInterior
      ? 'Chánh Điện Đại Hùng Bửu Điện'
      : this.activeScreen === 'lecture'
      ? 'Giảng Đường Phật Học'
      : 'Sân Chùa Vĩnh Tràng';
    const displayName = this.studentName || 'Phật tử Tâm An';

    return {
      uid: this.cloudUser?.uid || 'local_player',
      name: displayName,
      displayName,
      dharmaName: '',
      rankTitle: meritScore >= 300 ? 'Liên Hoa Thiện Tín' : meritScore >= 120 ? 'Phật Tử Thuận Thành' : 'Phật Tử Hữu Duyên',
      charKey: this.characterModelKey || 'nu',
      friendCode: this.social?.friendCode || 'VT-1849',
      merit: meritScore,
      meritScore,
      streakDays,
      giftsSent,
      lotusPoints: lotus,
      currentArea
    };
  },

  updateSocialBadge() {
    const count = getUnreadSocialCount(this.social);
    const badge = document.getElementById('nav-social-badge');
    if (badge) {
      badge.textContent = count > 9 ? '9+' : String(count);
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  },

  openSocialHubModal(initialTab = 'friends', opts = {}) {
    if (!this.titleOverlayDismissed) {
      this.enterTempleFromTitleOverlay?.();
    }
    this.toggleUtilityDrawer?.(false);

    let activeTab = ['friends', 'leaderboard', 'gifts', 'community'].includes(initialTab)
      ? initialTab
      : 'friends';
    let lbCategory = opts.lbCategory || 'merit';
    let selectedRecipientId = opts.recipientId || '';
    let selectedGiftId = SOCIAL_GIFT_CATALOG[0].id;
    let draftGiftMsg = '';
    let draftFriendCode = '';
    let draftPostText = '';
    let statusBanner = '';
    let statusOk = true;

    const getGiftWalletProxy = () => ({
      get meritPoints() {
        return Number(this.storeProfile?.lotusPoints || 0);
      },
      set meritPoints(v) {
        if (this.storeProfile) this.storeProfile.lotusPoints = Math.max(0, Math.round(Number(v) || 0));
      }
    });

    const render = () => {
      const selfMetrics = this.getSelfSocialMetrics();
      const friends = this.social?.friends || [];
      const incoming = this.social?.incomingRequests || [];
      const receivedGifts = this.social?.receivedGifts || [];
      const unclaimedGifts = receivedGifts.filter((g) => !g.claimed);
      const directory = DEFAULT_COMMUNITY_MEMBERS;
      const friendUids = new Set(friends.map((f) => f.uid));

      if (!selectedRecipientId) {
        selectedRecipientId = friends[0]?.uid || directory[0]?.uid || '';
      }

      const tabHtml = `
        <div class="social-tabs-bar" role="tablist" aria-label="Chức năng Cộng đồng Đạo hữu">
          <button type="button" class="social-tab-btn ${activeTab === 'friends' ? 'active' : ''}" data-social-tab="friends" role="tab">
            <span>🤝 Đạo hữu</span>
            ${incoming.length > 0 ? `<span class="social-tab-count">${incoming.length}</span>` : ''}
          </button>
          <button type="button" class="social-tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}" data-social-tab="leaderboard" role="tab">
            <span>🏆 Bảng xếp hạng</span>
          </button>
          <button type="button" class="social-tab-btn ${activeTab === 'gifts' ? 'active' : ''}" data-social-tab="gifts" role="tab">
            <span>🎁 Tặng quà</span>
            ${unclaimedGifts.length > 0 ? `<span class="social-tab-count">${unclaimedGifts.length}</span>` : ''}
          </button>
          <button type="button" class="social-tab-btn ${activeTab === 'community' ? 'active' : ''}" data-social-tab="community" role="tab">
            <span>🪷 Giao lưu</span>
          </button>
        </div>
      `;

      let panelHtml = '';

      if (activeTab === 'friends') {
        const suggested = directory.filter((m) => !friendUids.has(m.uid)).slice(0, 4);
        panelHtml = `
          <div class="social-code-banner">
            <div>
              <div class="social-code-kicker">Mã kết bạn của bạn (${esc(selfMetrics.displayName)})</div>
              <div class="social-code-value tabular-nums">${esc(selfMetrics.friendCode)}</div>
            </div>
            <div class="social-code-actions">
              <button type="button" id="btn-social-copy-code" class="social-primary-btn">📋 Sao chép mã</button>
            </div>
          </div>

          <div class="social-add-bar">
            <input id="input-social-friend-code" type="text" class="social-text-input" value="${esc(draftFriendCode)}" placeholder="Nhập mã Đạo hữu (VD: VT-5821) hoặc tên..." />
            <button type="button" id="btn-social-send-request" class="social-primary-btn">+ Kết bạn</button>
          </div>

          ${
            statusBanner
              ? `<div class="social-feedback-bar ${statusOk ? 'ok' : 'err'}" role="status">${esc(statusBanner)}</div>`
              : ''
          }

          ${
            incoming.length > 0
              ? `
            <div class="social-section-block">
              <h4 class="social-section-title">Lời mời kết bạn mới (${incoming.length})</h4>
              <div class="social-card-list">
                ${incoming
                  .map(
                    (req) => `
                  <div class="social-friend-card is-pending">
                    <div class="social-avatar-circle">${charAvatarBadge(req.charKey)}</div>
                    <div class="social-friend-info">
                      <div class="social-friend-name">${esc(req.displayName)} <span class="social-code-tag tabular-nums">${esc(req.friendCode)}</span></div>
                      <div class="social-friend-sub">${esc(req.note || 'Muốn kết bạn đồng tu tại Chùa Vĩnh Tràng.')}</div>
                    </div>
                    <div class="social-friend-actions">
                      <button type="button" class="social-accept-btn" data-social-accept="${esc(req.id)}">Chấp nhận</button>
                      <button type="button" class="social-ghost-btn" data-social-decline="${esc(req.id)}">Từ chối</button>
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          `
              : ''
          }

          <div class="social-section-block">
            <h4 class="social-section-title">Danh sách Đạo hữu của bạn (${friends.length})</h4>
            ${
              friends.length === 0
                ? `<div class="social-empty-box">Chưa có Đạo hữu nào trong danh sách. Hãy chấp nhận lời mời hoặc nhập mã kết bạn ở trên nhé.</div>`
                : `
              <div class="social-card-list">
                ${friends
                  .map(
                    (fr) => `
                  <div class="social-friend-card">
                    <div class="social-avatar-circle">${charAvatarBadge(fr.charKey)}</div>
                    <div class="social-friend-info">
                      <div class="social-friend-name">
                        ${esc(fr.displayName)}${fr.dharmaName ? ` · <span style="font-weight:600;color:#7a4e1e;">${esc(fr.dharmaName)}</span>` : ''}
                        <span class="social-code-tag tabular-nums">${esc(fr.friendCode)}</span>
                      </div>
                      <div class="social-friend-sub">
                        📍 ${esc(fr.currentArea || 'Sân Chùa Vĩnh Tràng')} · Công đức <strong class="tabular-nums">${Number(fr.meritScore || 0).toLocaleString('vi-VN')}</strong>
                      </div>
                    </div>
                    <div class="social-friend-actions">
                      <button type="button" class="social-accent-btn" data-social-gift-to="${esc(fr.uid)}">🎁 Tặng quà</button>
                      <button type="button" class="social-outline-btn" data-social-bless="${esc(fr.uid)}">🙏 Chúc an</button>
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            `
            }
          </div>

          ${
            suggested.length > 0
              ? `
            <div class="social-section-block">
              <h4 class="social-section-title">Gợi ý Đạo hữu đang viếng chùa</h4>
              <div class="social-suggest-grid">
                ${suggested
                  .map(
                    (m) => `
                  <div class="social-suggest-card">
                    <div class="social-suggest-top">
                      <span class="social-avatar-sm">${charAvatarBadge(m.charKey)}</span>
                      <div style="min-width:0;flex:1;">
                        <div class="social-friend-name">${esc(m.displayName)}</div>
                        <div class="social-friend-sub">${esc(m.rankTitle || 'Phật tử')} · <span class="tabular-nums">${esc(m.friendCode)}</span></div>
                      </div>
                    </div>
                    <button type="button" class="social-outline-btn" style="width:100%;" data-social-quick-add="${esc(m.friendCode)}">+ Kết bạn</button>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          `
              : ''
          }
        `;
      } else if (activeTab === 'leaderboard') {
        const lb = computeLeaderboard(this.social, selfMetrics, lbCategory);
        const top3 = lb.rows.slice(0, 3);
        const metricLabel =
          lbCategory === 'streak' ? 'ngày' : lbCategory === 'generosity' ? 'quà gieo duyên' : 'điểm công đức';

        panelHtml = `
          <div class="social-subtabs-row" role="tablist">
            <button type="button" class="social-subtab-btn ${lbCategory === 'merit' ? 'active' : ''}" data-lb-cat="merit">🪷 Công Đức</button>
            <button type="button" class="social-subtab-btn ${lbCategory === 'streak' ? 'active' : ''}" data-lb-cat="streak">📅 Chuyên Cần</button>
            <button type="button" class="social-subtab-btn ${lbCategory === 'generosity' ? 'active' : ''}" data-lb-cat="generosity">🎁 Gieo Duyên</button>
          </div>

          <div class="social-podium">
            ${[top3[1], top3[0], top3[2]]
              .filter(Boolean)
              .map((row) => {
                const medal = row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : '🥉';
                return `
                <div class="social-podium-card rank-${row.rank} ${row.isPlayer ? 'is-self' : ''}">
                  <div class="podium-medal">${medal}</div>
                  <div class="social-avatar-circle">${charAvatarBadge(row.charKey)}</div>
                  <div class="podium-name">${esc(row.displayName)}${row.isPlayer ? ' (Bạn)' : ''}</div>
                  <div class="podium-score tabular-nums">${Number(row.metricValue || 0).toLocaleString('vi-VN')} ${metricLabel}</div>
                </div>
              `;
              })
              .join('')}
          </div>

          <div class="social-lb-list">
            ${lb.rows
              .map((row) => {
                const isFriend = friendUids.has(row.uid);
                return `
                <div class="social-lb-row ${row.isPlayer ? 'is-self' : ''}">
                  <div class="social-lb-rank tabular-nums">#${row.rank}</div>
                  <div class="social-avatar-sm">${charAvatarBadge(row.charKey)}</div>
                  <div class="social-lb-info">
                    <div class="social-friend-name">
                      ${esc(row.displayName)}
                      ${row.isPlayer ? '<span class="social-self-tag">Bạn</span>' : ''}
                    </div>
                    <div class="social-friend-sub">${esc(row.rankTitle || 'Phật tử')} · ${esc(row.currentArea || 'Chùa Vĩnh Tràng')}</div>
                  </div>
                  <div class="social-lb-score tabular-nums">
                    <strong>${Number(row.metricValue || 0).toLocaleString('vi-VN')}</strong>
                    <span>${metricLabel}</span>
                  </div>
                  <div class="social-lb-quick">
                    ${
                      row.isPlayer
                        ? ''
                        : isFriend
                        ? `<button type="button" class="social-accent-btn" data-social-gift-to="${esc(row.uid)}" title="Tặng quà">🎁</button>`
                        : `<button type="button" class="social-outline-btn" data-social-quick-add="${esc(row.friendCode)}">+ Bạn</button>`
                    }
                  </div>
                </div>
              `;
              })
              .join('')}
          </div>

          ${
            lb.me
              ? `
            <div class="social-self-rank-bar">
              <div>
                <strong>Hạng của bạn: #${lb.me.rank}/${lb.rows.length}</strong>
                <span> · ${esc(selfMetrics.displayName)}</span>
              </div>
              <strong class="tabular-nums">${Number(lb.me.metricValue || 0).toLocaleString('vi-VN')} ${metricLabel}</strong>
            </div>
          `
              : ''
          }
        `;
      } else if (activeTab === 'gifts') {
        const recipients = [
          ...friends,
          ...directory.filter((m) => !friendUids.has(m.uid))
        ];

        panelHtml = `
          ${
            statusBanner
              ? `<div class="social-feedback-bar ${statusOk ? 'ok' : 'err'}" role="status">${esc(statusBanner)}</div>`
              : ''
          }

          <div class="social-wallet-strip">
            <span>Điểm Công Đức Sen hiện có:</span>
            <strong class="tabular-nums">🪷 ${Number(this.storeProfile?.lotusPoints || 0).toLocaleString('vi-VN')}</strong>
          </div>

          ${
            receivedGifts.length > 0
              ? `
            <div class="social-section-block">
              <h4 class="social-section-title">Hộp quà đã nhận (${unclaimedGifts.length} quà mới)</h4>
              <div class="social-card-list">
                ${receivedGifts
                  .slice(0, 8)
                  .map(
                    (g) => `
                  <div class="social-friend-card ${g.claimed ? 'is-claimed' : 'is-pending'}">
                    <div class="social-avatar-circle">${esc(g.giftIcon || '🎁')}</div>
                    <div class="social-friend-info">
                      <div class="social-friend-name">${esc(g.giftName)} <span class="social-code-tag">từ ${esc(g.fromName)}</span></div>
                      <div class="social-friend-sub">“${esc(g.message)}”</div>
                    </div>
                    <div class="social-friend-actions">
                      ${
                        g.claimed
                          ? `<span class="social-done-label">✓ Đã nhận</span>`
                          : `<button type="button" class="social-accept-btn" data-social-claim-gift="${esc(g.id)}">Nhận quà (+${Number(g.meritReward || 6)} 🪷)</button>`
                      }
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          `
              : ''
          }

          <div class="social-section-block social-gift-compose">
            <h4 class="social-section-title">Gửi quà gieo duyên đến Đạo hữu</h4>
            <div class="social-form-row">
              <label for="select-social-recipient" class="social-label">Người nhận:</label>
              <select id="select-social-recipient" class="social-select-input">
                ${recipients
                  .map(
                    (r) => `<option value="${esc(r.uid)}" ${r.uid === selectedRecipientId ? 'selected' : ''}>${esc(r.displayName)} (${esc(r.friendCode)})${friendUids.has(r.uid) ? ' · Đạo hữu' : ''}</option>`
                  )
                  .join('')}
              </select>
            </div>

            <div class="social-gift-grid">
              ${SOCIAL_GIFT_CATALOG.map(
                (gift) => `
                <button type="button" class="social-gift-card ${selectedGiftId === gift.id ? 'active' : ''}" data-social-gift-id="${esc(gift.id)}">
                  <div class="social-gift-icon">${gift.icon}</div>
                  <div class="social-gift-name">${esc(gift.name)}</div>
                  <div class="social-gift-cost tabular-nums">${gift.costMerit === 0 ? 'Miễn phí' : `🪷 ${gift.costMerit}`} · +${gift.senderMerit} Công đức</div>
                </button>
              `
              ).join('')}
            </div>

            <div class="social-form-row">
              <label for="input-social-gift-msg" class="social-label">Lời chúc gửi kèm:</label>
              <input id="input-social-gift-msg" type="text" class="social-text-input" value="${esc(draftGiftMsg)}" placeholder="Kính chúc đạo hữu thân tâm an lạc, vạn sự cát tường." />
            </div>

            <button type="button" id="btn-social-send-gift" class="social-primary-btn" style="width:100%;min-height:48px;">
              🎁 Gửi Quà Gieo Duyên
            </button>
          </div>
        `;
      } else if (activeTab === 'community') {
        const goal = computeCommunityGoalProgress(this.social, selfMetrics.meritScore);
        const posts = this.social?.communityPosts || [];
        const contributorsCount = DEFAULT_COMMUNITY_MEMBERS.length + 1 + Math.max(0, friends.length - 2);

        panelHtml = `
          <div class="social-goal-card">
            <div class="social-goal-head">
              <div>
                <div class="social-code-kicker">Mục tiêu Công Đức chung · Chùa Vĩnh Tràng</div>
                <strong class="social-goal-title">Cùng thắp sáng ${Number(goal.target || 10000).toLocaleString('vi-VN')} điểm Hồi Hướng Bình An</strong>
              </div>
              <div class="social-goal-nums tabular-nums">
                <strong>${Number(goal.current || 0).toLocaleString('vi-VN')}</strong> / ${Number(goal.target || 10000).toLocaleString('vi-VN')}
              </div>
            </div>
            <div class="social-goal-track">
              <div class="social-goal-fill" style="width:${Number(goal.pct || 0)}%"></div>
            </div>
            <div class="social-goal-foot">
              <span>${contributorsCount} Đạo hữu đang đồng hành · Đạt ${Number(goal.pct || 0)}%</span>
              <span>Đóng góp của bạn: <strong class="tabular-nums">+${Number(selfMetrics.meritScore || 0).toLocaleString('vi-VN')}</strong></span>
            </div>
          </div>

          <div class="social-post-composer">
            <textarea id="input-social-post" class="social-textarea" rows="2" maxlength="220" placeholder="Gửi một lời chúc an lành hoặc cảm niệm khi viếng Chùa Vĩnh Tràng hôm nay...">${esc(draftPostText)}</textarea>
            <div class="social-composer-foot">
              <span class="social-friend-sub">Lời chúc sẽ hiển thị cùng cộng đồng Đạo hữu</span>
              <button type="button" id="btn-social-publish-post" class="social-primary-btn">🪷 Gửi lời chúc</button>
            </div>
          </div>

          ${
            statusBanner
              ? `<div class="social-feedback-bar ${statusOk ? 'ok' : 'err'}" role="status">${esc(statusBanner)}</div>`
              : ''
          }

          <div class="social-card-list">
            ${posts
              .map(
                (p) => `
              <article class="social-post-card">
                <div class="social-post-head">
                  <div style="display:flex;align-items:center;gap:10px;min-width:0;">
                    <span class="social-avatar-sm">${charAvatarBadge(p.charKey || 'nu_ao_lam')}</span>
                    <div style="min-width:0;">
                      <div class="social-friend-name">${esc(p.authorName)}</div>
                      <div class="social-friend-sub">🪷 ${esc(p.category || 'Cầu an')} · ${esc(formatPostDate(p.createdAt))}</div>
                    </div>
                  </div>
                  <button type="button" class="social-rejoice-btn ${p.rejoicedByMe ? 'active' : ''}" data-social-rejoice="${esc(p.id)}">
                    🙏 Tùy hỷ <span class="tabular-nums">(${Number(p.rejoiceCount || 0)})</span>
                  </button>
                </div>
                <p class="social-post-text">${esc(p.text)}</p>
              </article>
            `
              )
              .join('')}
          </div>
        `;
      }

      this.openModal(
        '🤝 Cộng Đồng Đạo Hữu · Chùa Vĩnh Tràng',
        `
        <div class="social-hub-shell">
          ${tabHtml}
          <div class="social-tab-panel">${panelHtml}</div>
        </div>
        `,
        { variant: 'scroll' }
      );

      // Tab switching
      document.querySelectorAll('[data-social-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeTab = btn.getAttribute('data-social-tab') || 'friends';
          statusBanner = '';
          this.playMokugyoTap?.();
          render();
        });
      });

      // Copy Friend Code
      document.getElementById('btn-social-copy-code')?.addEventListener('click', async () => {
        try {
          await navigator.clipboard?.writeText(selfMetrics.friendCode);
          statusOk = true;
          statusBanner = `Đã sao chép mã Đạo hữu ${selfMetrics.friendCode}.`;
        } catch {
          statusOk = true;
          statusBanner = `Mã Đạo hữu của bạn là ${selfMetrics.friendCode}.`;
        }
        this.playMokugyoTap?.();
        render();
      });

      // Add friend by code/name
      document.getElementById('btn-social-send-request')?.addEventListener('click', () => {
        draftFriendCode = document.getElementById('input-social-friend-code')?.value || '';
        const res = sendFriendRequest(this.social, draftFriendCode);
        statusOk = res.ok;
        statusBanner = res.message;
        if (res.ok) {
          draftFriendCode = '';
          this.saveState();
          this.updateSocialBadge();
          this.playBellTone?.(324, 1.6);
        } else {
          this.playMokugyoTap?.();
        }
        render();
      });

      // Quick add from suggested or leaderboard
      document.querySelectorAll('[data-social-quick-add]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const code = btn.getAttribute('data-social-quick-add') || '';
          const res = sendFriendRequest(this.social, code);
          statusOk = res.ok;
          statusBanner = res.message;
          if (res.ok) {
            this.saveState();
            this.updateSocialBadge();
            this.playBellTone?.(324, 1.6);
            this.showToast('🤝 Kết bạn Đạo hữu', res.message, 3200, false);
          }
          render();
        });
      });

      // Accept / Decline friend request
      document.querySelectorAll('[data-social-accept]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const rid = btn.getAttribute('data-social-accept');
          const res = acceptFriendRequest(this.social, rid);
          statusOk = res.ok;
          statusBanner = res.message;
          if (res.ok) {
            this.saveState();
            this.updateSocialBadge();
            this.playBellTone?.(324, 1.8);
          }
          render();
        });
      });
      document.querySelectorAll('[data-social-decline]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const rid = btn.getAttribute('data-social-decline');
          const res = declineFriendRequest(this.social, rid);
          if (res.ok) {
            statusOk = true;
            statusBanner = res.message;
            this.saveState();
            this.updateSocialBadge();
            this.playMokugyoTap?.();
          }
          render();
        });
      });

      // Remove friend
      document.querySelectorAll('[data-social-remove]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const fid = btn.getAttribute('data-social-remove');
          const res = removeFriend(this.social, fid);
          if (res.ok) {
            this.saveState();
            this.updateSocialBadge();
          }
          render();
        });
      });

      // Quick bless friend
      document.querySelectorAll('[data-social-bless]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const fid = btn.getAttribute('data-social-bless');
          const friend = (this.social?.friends || []).find((f) => f.uid === fid);
          if (!friend) return;
          this.storeProfile.lotusPoints = Number(this.storeProfile.lotusPoints || 0) + 5;
          this.social.blessingGreetingsSent = Number(this.social.blessingGreetingsSent || 0) + 1;
          this.saveState();
          this.updateActionBadges?.();
          this.playBellTone?.(360, 1.4);
          statusOk = true;
          statusBanner = `🙏 Đã gửi lời chúc an lành đến ${friend.displayName} (+5 🪷).`;
          render();
        });
      });

      // Jump to Gifts tab with friend pre-selected
      document.querySelectorAll('[data-social-gift-to]').forEach((btn) => {
        btn.addEventListener('click', () => {
          selectedRecipientId = btn.getAttribute('data-social-gift-to') || '';
          activeTab = 'gifts';
          statusBanner = '';
          this.playMokugyoTap?.();
          render();
        });
      });

      // Leaderboard category tabs
      document.querySelectorAll('[data-lb-cat]').forEach((btn) => {
        btn.addEventListener('click', () => {
          lbCategory = btn.getAttribute('data-lb-cat') || 'merit';
          this.playMokugyoTap?.();
          render();
        });
      });

      // Gift selection & sending
      document.getElementById('select-social-recipient')?.addEventListener('change', (e) => {
        selectedRecipientId = e.target?.value || '';
      });
      document.querySelectorAll('[data-social-gift-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          draftGiftMsg = document.getElementById('input-social-gift-msg')?.value ?? draftGiftMsg;
          selectedGiftId = btn.getAttribute('data-social-gift-id') || SOCIAL_GIFT_CATALOG[0].id;
          this.playMokugyoTap?.();
          render();
        });
      });
      document.getElementById('btn-social-send-gift')?.addEventListener('click', () => {
        selectedRecipientId = document.getElementById('select-social-recipient')?.value || selectedRecipientId;
        draftGiftMsg = document.getElementById('input-social-gift-msg')?.value || '';
        const walletProxy = getGiftWalletProxy.call(this);
        const res = sendGiftToFriend(
          this.social,
          walletProxy,
          selectedRecipientId,
          selectedGiftId,
          draftGiftMsg
        );
        statusOk = res.ok;
        statusBanner = res.message;
        if (res.ok) {
          this.spiritual = recordSpiritualMilestone(
            this.spiritual,
            `Tặng ${res.tx.giftName} cho ${res.tx.toName}`
          );
          draftGiftMsg = '';
          this.saveState();
          this.updateActionBadges?.();
          this.updateSocialBadge();
          this.syncSocialCloudRecord?.('gift', {
            ...res.tx,
            fromName: selfMetrics.displayName,
            toId: res.tx.toUid,
            lotusCost: res.tx.costMerit
          });
          this.syncSocialCloudRecord?.('profile', this.getSelfSocialMetrics());
          this.playBellTone?.(324, 2.0);
        } else {
          this.playMokugyoTap?.();
        }
        render();
      });

      // Claim received gift
      document.querySelectorAll('[data-social-claim-gift]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const gid = btn.getAttribute('data-social-claim-gift');
          const walletProxy = getGiftWalletProxy.call(this);
          const res = claimReceivedGift(this.social, walletProxy, gid);
          statusOk = res.ok;
          statusBanner = res.message;
          if (res.ok) {
            this.saveState();
            this.updateActionBadges?.();
            this.updateSocialBadge();
            this.playBellTone?.(360, 1.8);
          }
          render();
        });
      });

      // Publish community post
      document.getElementById('btn-social-publish-post')?.addEventListener('click', () => {
        draftPostText = document.getElementById('input-social-post')?.value || '';
        const res = addCommunityPost(
          this.social,
          {
            uid: selfMetrics.uid,
            displayName: selfMetrics.displayName,
            dharmaName: selfMetrics.dharmaName
          },
          draftPostText,
          'Cầu an'
        );
        statusOk = res.ok;
        statusBanner = res.message;
        if (res.ok) {
          draftPostText = '';
          this.storeProfile.lotusPoints = Number(this.storeProfile.lotusPoints || 0) + 8;
          this.saveState();
          this.updateActionBadges?.();
          this.syncSocialCloudRecord?.('post', {
            ...res.post,
            charKey: selfMetrics.charKey,
            area: selfMetrics.currentArea
          });
          this.playBellTone?.(288, 1.6);
        } else {
          this.playMokugyoTap?.();
        }
        render();
      });

      // Rejoice toggle on community post
      document.querySelectorAll('[data-social-rejoice]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const pid = btn.getAttribute('data-social-rejoice');
          const res = toggleRejoicePost(this.social, pid);
          if (res.ok) {
            this.saveState();
            this.playMokugyoTap?.();
            render();
          }
        });
      });
    };

    render();
  }
};
