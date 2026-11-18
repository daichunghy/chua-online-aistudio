/**
 * Logic activity hub: nhiệm vụ, điểm danh, thư, chia sẻ, sao lưu hồ sơ.
 * (Tách từ chua-online-logic.mjs — import từ '/src/logic/chua-online-logic.mjs' vẫn dùng được.)
 */
import { CHARACTER_PROFILES } from './world-data.mjs';
import { createSpiritualState } from './spiritual-actions.mjs';
import { getLocalDateKey } from './daily-dharma.mjs';
import { STORE_ITEMS_CATALOG, createStoreProfileState } from './store-items.mjs';
import { DAILY_CHECKIN_REWARDS, DAILY_QUESTS_TEMPLATE, INITIAL_MAILBOX_MESSAGES, DAILY_RESET_MISSIONS, EXPLORATION_CHAPTERS, EXTENDED_MAILBOX_MESSAGES } from './activity-data.mjs';
import { createCourtyardTasksState, createTempleGardenState } from './pilgrim-progress-garden.mjs';

export function ensureDailyMissionDate(activityState, dateKey = getLocalDateKey()) {
  const nextAct = createActivityHubState(activityState);
  if (nextAct.dailyDateKey === dateKey) return nextAct;
  nextAct.dailyDateKey = dateKey;
  nextAct.dailyMetrics = {
    dailyCheckedIn: nextAct.lastCheckinDate === dateKey ? 1 : 0,
    dailyIncense: 0,
    dailyQuotesRead: 0,
    dailyMindfulSeconds: 0,
    dailyBeads: 0,
    dailyLotus: 0,
    dailyLessons: 0,
    dailyLeavesSwept: 0,
    dailyGardenActions: 0,
    dailyRhythmSessions: 0,
    dailyRelicsFound: 0
  };
  nextAct.claimedDailyMissions = [];
  nextAct.courtyardTasks = createCourtyardTasksState(nextAct.courtyardTasks, dateKey);
  return nextAct;
}

export function createActivityHubState(initial = {}) {
  const src = initial && typeof initial === 'object' ? initial : {};
  const dm = src.dailyMetrics && typeof src.dailyMetrics === 'object' ? src.dailyMetrics : {};
  return {
    lastCheckinDate: typeof src.lastCheckinDate === 'string' ? src.lastCheckinDate : null,
    streakDays: Math.max(0, Math.min(7, Number(src.streakDays || 0))),
    checkinCount: Math.max(0, Number(src.checkinCount || 0)),
    xp: Math.max(0, Number(src.xp || 0)),
    bellRhythmBest: Math.max(0, Number(src.bellRhythmBest || 0)),
    koiFedCount: Math.max(0, Number(src.koiFedCount || 0)),
    claimedDays: Array.isArray(src.claimedDays) ? [...src.claimedDays] : [],
    claimedQuests: Array.isArray(src.claimedQuests) ? [...src.claimedQuests] : [],
    claimedMails: Array.isArray(src.claimedMails) ? [...src.claimedMails] : [],
    readMails: Array.isArray(src.readMails) ? [...src.readMails] : [],
    repliedMails: src.repliedMails && typeof src.repliedMails === 'object' ? { ...src.repliedMails } : {},
    dailyDateKey: typeof src.dailyDateKey === 'string' ? src.dailyDateKey : null,
    dailyMetrics: {
      dailyCheckedIn: Math.max(0, Number(dm.dailyCheckedIn || 0)),
      dailyIncense: Math.max(0, Number(dm.dailyIncense || 0)),
      dailyQuotesRead: Math.max(0, Number(dm.dailyQuotesRead || 0)),
      dailyMindfulSeconds: Math.max(0, Number(dm.dailyMindfulSeconds || 0)),
      dailyBeads: Math.max(0, Number(dm.dailyBeads || 0)),
      dailyLotus: Math.max(0, Number(dm.dailyLotus || 0)),
      dailyLessons: Math.max(0, Number(dm.dailyLessons || 0)),
      dailyLeavesSwept: Math.max(0, Number(dm.dailyLeavesSwept || 0)),
      dailyGardenActions: Math.max(0, Number(dm.dailyGardenActions || 0)),
      dailyRhythmSessions: Math.max(0, Number(dm.dailyRhythmSessions || 0)),
      dailyRelicsFound: Math.max(0, Number(dm.dailyRelicsFound || 0))
    },
    claimedDailyMissions: Array.isArray(src.claimedDailyMissions) ? [...src.claimedDailyMissions] : [],
    claimedChapters: Array.isArray(src.claimedChapters) ? [...src.claimedChapters] : [],
    shareCount: Math.max(0, Number(src.shareCount || 0)),
    lastShareDate: typeof src.lastShareDate === 'string' ? src.lastShareDate : null,
    feedbackList: Array.isArray(src.feedbackList) ? src.feedbackList.map((f) => ({ ...f })) : [],
    extraMetrics:
      src.extraMetrics && typeof src.extraMetrics === 'object' ? { ...src.extraMetrics } : {},
    courtyardTasks: createCourtyardTasksState(src.courtyardTasks, src.courtyardTasks?.dateKey || getLocalDateKey()),
    templeGarden: createTempleGardenState(src.templeGarden),
    heritageRelics: Array.isArray(src.heritageRelics) ? [...new Set(src.heritageRelics)] : []
  };
}

export function recordDailyMissionMetric(activityState, metricKey, amount = 1, dateKey = getLocalDateKey()) {
  const nextAct = ensureDailyMissionDate(activityState, dateKey);
  if (Object.prototype.hasOwnProperty.call(nextAct.dailyMetrics, metricKey)) {
    nextAct.dailyMetrics[metricKey] = Math.max(
      0,
      Number(nextAct.dailyMetrics[metricKey] || 0) + Math.max(0, Number(amount || 0))
    );
  }
  return nextAct;
}

export function getDailyMissionsWithProgress(activityState, dateKey = getLocalDateKey()) {
  const act = ensureDailyMissionDate(activityState, dateKey);
  return DAILY_RESET_MISSIONS.map((m) => {
    const rawCurrent =
      m.metric === 'dailyCheckedIn'
        ? act.lastCheckinDate === dateKey
          ? 1
          : act.dailyMetrics.dailyCheckedIn || 0
        : act.dailyMetrics[m.metric] || 0;
    const current = Math.min(m.target, rawCurrent);
    const completed = rawCurrent >= m.target;
    const claimed = act.claimedDailyMissions.includes(m.id);
    return {
      ...m,
      current,
      rawCurrent,
      completed,
      claimed,
      claimable: completed && !claimed
    };
  });
}

export function claimDailyMissionReward(activityState, storeProfile, missionId, dateKey = getLocalDateKey()) {
  const nextAct = ensureDailyMissionDate(activityState, dateKey);
  const nextProfile = createStoreProfileState(storeProfile);
  const list = getDailyMissionsWithProgress(nextAct, dateKey);
  const mission = list.find((m) => m.id === missionId);
  if (!mission) {
    return { ok: false, reason: 'not_found', message: 'Không tìm thấy nhiệm vụ hằng ngày.', activity: nextAct, storeProfile: nextProfile };
  }
  if (mission.claimed) {
    return { ok: false, reason: 'already_claimed', message: 'Hôm nay cô bác đã nhận thưởng nhiệm vụ này rồi.', activity: nextAct, storeProfile: nextProfile };
  }
  if (!mission.completed) {
    return {
      ok: false,
      reason: 'incomplete',
      message: `Cần hoàn thành "${mission.title}" (${mission.current}/${mission.target}) trước khi nhận lộc.`,
      activity: nextAct,
      storeProfile: nextProfile
    };
  }
  nextAct.claimedDailyMissions.push(mission.id);
  nextProfile.lotusPoints += mission.rewardLotus;
  nextProfile.gems += mission.rewardGems;
  return {
    ok: true,
    mission,
    message: `Hoàn thành "${mission.title}"! Nhận +${mission.rewardLotus} 🪷 & +${mission.rewardGems} 💎.`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function getExplorationChaptersStatus(activityState, spiritualState) {
  const act = createActivityHubState(activityState);
  const sp = createSpiritualState(spiritualState);
  const effectiveDay = Math.max(1, act.checkinCount || 1);
  const visitedCount = sp.visitedStations.length;
  return EXPLORATION_CHAPTERS.map((ch) => {
    const unlockedByDay = effectiveDay >= ch.dayUnlock || visitedCount >= ch.requiredStations;
    const completed = visitedCount >= ch.requiredStations && unlockedByDay;
    const claimed = act.claimedChapters.includes(ch.id);
    return {
      ...ch,
      unlocked: unlockedByDay,
      visitedCount: Math.min(ch.requiredStations, visitedCount),
      completed,
      claimed,
      claimable: completed && !claimed
    };
  });
}

export function claimExplorationChapterReward(activityState, storeProfile, spiritualState, chapterId) {
  const nextAct = createActivityHubState(activityState);
  const nextProfile = createStoreProfileState(storeProfile);
  const list = getExplorationChaptersStatus(nextAct, spiritualState);
  const chap = list.find((c) => c.id === chapterId);
  if (!chap) {
    return { ok: false, reason: 'not_found', message: 'Không tìm thấy chặng khám phá.', activity: nextAct, storeProfile: nextProfile };
  }
  if (chap.claimed) {
    return { ok: false, reason: 'already_claimed', message: 'Bạn đã nhận phần thưởng chặng này rồi.', activity: nextAct, storeProfile: nextProfile };
  }
  if (!chap.completed) {
    return { ok: false, reason: 'incomplete', message: `Hãy khám phá ${chap.requiredStations} điểm để mở thưởng chặng này.`, activity: nextAct, storeProfile: nextProfile };
  }
  nextAct.claimedChapters.push(chap.id);
  nextProfile.lotusPoints += chap.rewardLotus;
  nextProfile.gems += chap.rewardGems;
  return {
    ok: true,
    chapter: chap,
    message: `Hoàn thành ${chap.title}! Nhận +${chap.rewardLotus} 🪷 & +${chap.rewardGems} 💎.`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function claimDailyCheckin(activityState, storeProfile, dateKey = getLocalDateKey()) {
  const nextAct = ensureDailyMissionDate(activityState, dateKey);
  const nextProfile = createStoreProfileState(storeProfile);

  if (nextAct.lastCheckinDate === dateKey) {
    return {
      ok: false,
      reason: 'already_checked_in',
      message: 'Hôm nay cô bác đã điểm danh nhận lộc rồi. Hẹn ngày mai quay lại nhé!',
      activity: nextAct,
      storeProfile: nextProfile,
      reward: null
    };
  }

  const nextDayIndex = (nextAct.streakDays % 7) + 1;
  const reward = DAILY_CHECKIN_REWARDS[nextDayIndex - 1] || DAILY_CHECKIN_REWARDS[0];

  nextAct.lastCheckinDate = dateKey;
  nextAct.streakDays = nextDayIndex;
  nextAct.checkinCount += 1;
  nextAct.dailyMetrics.dailyCheckedIn = 1;
  if (!nextAct.claimedDays.includes(nextDayIndex)) {
    nextAct.claimedDays.push(nextDayIndex);
  }
  if (nextDayIndex === 7) {
    nextAct.claimedDays = [1, 2, 3, 4, 5, 6, 7];
  }

  nextProfile.lotusPoints += reward.lotus;
  nextProfile.gems += reward.gems;

  return {
    ok: true,
    day: nextDayIndex,
    reward,
    message: `Điểm danh ${reward.label} thành công! Nhận +${reward.lotus} 🪷 & +${reward.gems} 💎.`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function getQuestMetricValue(activityState, spiritualState, completedLessonsCount = 0, metric) {
  const act = createActivityHubState(activityState);
  const sp = createSpiritualState(spiritualState);
  if (metric === 'checkinCount') return act.checkinCount;
  if (metric === 'bowCount') return sp.bowCount;
  if (metric === 'incenseOfferings') return sp.incenseOfferings;
  if (metric === 'lotusOfferings') return sp.lotusOfferings;
  if (metric === 'malaTotalBeads') return sp.malaCycles * 108 + sp.malaBeads;
  if (metric === 'visitedCount') return sp.visitedStations.length;
  if (metric === 'completedLessonsCount') return Math.max(0, Number(completedLessonsCount || 0));
  return Math.max(0, Number(act.extraMetrics[metric] || 0));
}

export function incrementQuestProgress(activityState, metric, amount = 1) {
  const nextAct = createActivityHubState(activityState);
  nextAct.extraMetrics[metric] =
    Math.max(0, Number(nextAct.extraMetrics[metric] || 0)) + Math.max(0, Number(amount || 0));
  return nextAct;
}

export function getQuestsWithProgress(activityState, spiritualState, completedLessonsCount = 0) {
  const act = createActivityHubState(activityState);
  return DAILY_QUESTS_TEMPLATE.map((q) => {
    const current = getQuestMetricValue(act, spiritualState, completedLessonsCount, q.metric);
    const clamped = Math.min(q.target, current);
    const completed = current >= q.target;
    const claimed = act.claimedQuests.includes(q.id);
    return {
      ...q,
      current: clamped,
      rawCurrent: current,
      completed,
      claimed,
      claimable: completed && !claimed
    };
  });
}

export function claimQuestReward(
  activityState,
  storeProfile,
  spiritualState,
  completedLessonsCount = 0,
  questId
) {
  const nextAct = createActivityHubState(activityState);
  const nextProfile = createStoreProfileState(storeProfile);
  const list = getQuestsWithProgress(nextAct, spiritualState, completedLessonsCount);
  const quest = list.find((q) => q.id === questId);

  if (!quest) {
    return { ok: false, reason: 'not_found', message: 'Không tìm thấy nhiệm vụ.', activity: nextAct, storeProfile: nextProfile };
  }
  if (quest.claimed) {
    return { ok: false, reason: 'already_claimed', message: 'Bạn đã nhận thưởng nhiệm vụ này rồi.', activity: nextAct, storeProfile: nextProfile };
  }
  if (!quest.completed) {
    return {
      ok: false,
      reason: 'incomplete',
      message: `Cần hoàn thành "${quest.title}" (${quest.current}/${quest.target}) trước khi nhận thưởng.`,
      activity: nextAct,
      storeProfile: nextProfile
    };
  }

  nextAct.claimedQuests.push(quest.id);
  nextProfile.lotusPoints += quest.rewardLotus;
  nextProfile.gems += quest.rewardGems;

  return {
    ok: true,
    quest,
    message: `Hoàn thành "${quest.title}"! Nhận +${quest.rewardLotus} 🪷 & +${quest.rewardGems} 💎.`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function getMailboxWithStatus(activityState, { includeExtended = false, spiritualState = null } = {}) {
  const act = createActivityHubState(activityState);
  const dayNum = Math.max(1, act.checkinCount || 1);
  const visitedCount = spiritualState ? createSpiritualState(spiritualState).visitedStations.length : 1;

  const baseList = INITIAL_MAILBOX_MESSAGES.map((m) => ({
    ...m,
    replyOptions: m.replyOptions || [
      '🙏 Con xin cảm ơn & ghi nhớ lời nhắn',
      '🪷 Chúc Ban Quản Trị nhà chùa luôn an lạc'
    ],
    unlocked: true
  }));

  const extList = includeExtended
    ? EXTENDED_MAILBOX_MESSAGES.filter(
        (m) => dayNum >= (m.unlockCheckinDay || 1) || visitedCount >= (m.unlockCheckinDay || 2) + 1
      ).map((m) => ({ ...m, unlocked: true }))
    : [];

  return [...baseList, ...extList].map((m) => ({
    ...m,
    claimed: act.claimedMails.includes(m.id),
    read: act.readMails.includes(m.id) || act.claimedMails.includes(m.id),
    replyText: act.repliedMails[m.id] || null
  }));
}

export function claimMailboxReward(activityState, storeProfile, mailId) {
  const nextAct = createActivityHubState(activityState);
  const nextProfile = createStoreProfileState(storeProfile);
  const mail = [...INITIAL_MAILBOX_MESSAGES, ...EXTENDED_MAILBOX_MESSAGES].find((m) => m.id === mailId);

  if (!mail) {
    return { ok: false, reason: 'not_found', message: 'Không tìm thấy thư.', activity: nextAct, storeProfile: nextProfile };
  }
  if (!nextAct.readMails.includes(mailId)) {
    nextAct.readMails.push(mailId);
  }
  if (nextAct.claimedMails.includes(mailId)) {
    return { ok: false, reason: 'already_claimed', message: 'Bạn đã nhận quà từ thư này rồi.', activity: nextAct, storeProfile: nextProfile };
  }

  nextAct.claimedMails.push(mailId);
  nextProfile.lotusPoints += mail.rewardLotus;
  nextProfile.gems += mail.rewardGems;

  return {
    ok: true,
    mail,
    message: `Đã nhận quà từ "${mail.sender}": +${mail.rewardLotus} 🪷 & +${mail.rewardGems} 💎.`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function replyToMailboxMessage(activityState, storeProfile, mailId, optionIndex = 0) {
  const nextAct = createActivityHubState(activityState);
  const nextProfile = createStoreProfileState(storeProfile);
  const mail = [...INITIAL_MAILBOX_MESSAGES, ...EXTENDED_MAILBOX_MESSAGES].find((m) => m.id === mailId);
  if (!mail) {
    return { ok: false, message: 'Không tìm thấy thư để hồi âm.', activity: nextAct, storeProfile: nextProfile };
  }
  const options = mail.replyOptions || [
    '🙏 Con xin cảm ơn & ghi nhớ lời nhắn',
    '🪷 Chúc Ban Quản Trị nhà chùa luôn an lạc'
  ];
  const replyText = options[Math.max(0, Math.min(options.length - 1, Number(optionIndex || 0)))];
  const firstReply = !nextAct.repliedMails[mailId];
  nextAct.repliedMails[mailId] = replyText;
  if (!nextAct.readMails.includes(mailId)) nextAct.readMails.push(mailId);
  if (firstReply) {
    nextProfile.lotusPoints += 15;
  }
  return {
    ok: true,
    firstReply,
    replyText,
    message: firstReply
      ? `Đã gửi hồi âm tới "${mail.sender}" (+15 🪷 tri ân).`
      : `Đã cập nhật lời hồi âm của cô bác.`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function buildPilgrimageShareText({
  characterModelKey = 'nu',
  spiritual = {},
  storeProfile = {},
  activityHub = {},
  completedLessonsCount = 0
} = {}) {
  const sp = createSpiritualState(spiritual);
  const act = createActivityHubState(activityHub);
  const prof = createStoreProfileState(storeProfile);
  const charProf = CHARACTER_PROFILES.find((c) => c.key === characterModelKey) || CHARACTER_PROFILES[0];
  const totalBeads = sp.malaCycles * 108 + sp.malaBeads;
  const mindfulMins = Math.floor((act.dailyMetrics?.dailyMindfulSeconds || 0) / 60);
  return [
    '🪷 THIỆP HÀNH HƯƠNG CHÙA VĨNH TRÀNG (MỸ THO) 🪷',
    `Phật tử: ${charProf.name} · Chuỗi chuyên cần ${act.streakDays || 1} ngày`,
    `• Đảnh lễ Tam Bảo: ${sp.bowCount} lạy · Dâng hương: ${sp.incenseOfferings} lần · Hoa sen: ${sp.lotusOfferings} đóa`,
    `• Niệm Phật: ${totalBeads} biến (${sp.malaCycles} vòng 108 hạt) · Chánh niệm hôm nay: ${mindfulMins} phút`,
    `• Khám phá: ${sp.visitedStations.length}/9 thắng cảnh · Đã học: ${completedLessonsCount} bài Giảng đường · Điểm Sen: ${prof.lotusPoints} 🪷`,
    'Nguyện đem công đức này hướng về khắp tất cả, cầu bình an sức khỏe đến gia đình & mọi người!'
  ].join('\n');
}

export function recordPilgrimageShare(activityState, storeProfile, dateKey = getLocalDateKey()) {
  const nextAct = createActivityHubState(activityState);
  const nextProfile = createStoreProfileState(storeProfile);
  const dailyBonusGranted = nextAct.lastShareDate !== dateKey;
  nextAct.shareCount += 1;
  nextAct.lastShareDate = dateKey;
  if (dailyBonusGranted) {
    nextProfile.lotusPoints += 30;
    nextProfile.gems += 5;
  }
  return {
    ok: true,
    dailyBonusGranted,
    message: dailyBonusGranted
      ? 'Đã sao chép thiệp chia sẻ hành hương! Tặng cô bác +30 🪷 & +5 💎 lộc lan tỏa bình an.'
      : 'Đã sao chép thiệp chia sẻ hành hương gửi người thân.',
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function submitUserFeedback(activityState, storeProfile, { rating = 5, tags = [], comment = '' } = {}, dateKey = getLocalDateKey()) {
  const nextAct = createActivityHubState(activityState);
  const nextProfile = createStoreProfileState(storeProfile);
  const cleanComment = String(comment || '').trim();
  const cleanTags = Array.isArray(tags) ? tags.filter(Boolean).slice(0, 6) : [];
  if (!cleanComment && cleanTags.length === 0) {
    return {
      ok: false,
      message: 'Cô bác vui lòng chọn ít nhất 1 mục góp ý hoặc nhập lời nhắn ngắn ạ.',
      activity: nextAct,
      storeProfile: nextProfile
    };
  }
  const alreadyRewardedToday = nextAct.feedbackList.some((f) => f.dateKey === dateKey);
  nextAct.feedbackList.unshift({
    id: `fb_${Date.now()}`,
    dateKey,
    rating: Math.max(1, Math.min(5, Number(rating || 5))),
    tags: cleanTags,
    comment: cleanComment
  });
  nextAct.feedbackList = nextAct.feedbackList.slice(0, 20);
  if (!alreadyRewardedToday) {
    nextProfile.lotusPoints += 25;
  }
  return {
    ok: true,
    bonusGranted: !alreadyRewardedToday,
    message: alreadyRewardedToday
      ? 'Nhà chùa xin chân thành cảm ơn góp ý quý báu của cô bác!'
      : 'Cảm ơn cô bác đã góp ý! Kính tặng +25 🪷 để thỉnh hương hoa.',
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function unifyEquippedVisualPayload(storeProfile = {}, spiritual = {}) {
  const prof = createStoreProfileState(storeProfile);
  const sp = createSpiritualState(spiritual);
  const eq = prof.equipped || {};
  const spEq = sp.equippedItems || {};
  const findItem = (id) => (id ? STORE_ITEMS_CATALOG.find((x) => x.id === id) || null : null);

  const tryingItem = findItem(prof.tryingItemId);
  const eqRobe = findItem(eq.robe);
  const activeRobe =
    tryingItem?.slot === 'robe'
      ? tryingItem
      : eqRobe || (spEq.outfit === 'ao_trang_phat_tu' ? { id: 'ao_trang_lam', robeStyle: 'lam_phat_tu', robeTint: [0.60, 0.56, 0.62] } : null);

  const activeHat = tryingItem?.slot === 'hat' ? tryingItem : findItem(eq.hat);
  const activeMat = tryingItem?.slot === 'mat' ? tryingItem : findItem(eq.mat);
  const activeHand =
    tryingItem && ['handItem', 'instrument', 'offering'].includes(tryingItem.slot)
      ? tryingItem
      : findItem(eq.handItem || eq.instrument || eq.offering);
  const activeMala = tryingItem?.slot === 'mala' ? tryingItem : findItem(eq.mala);
  const activeTree = tryingItem?.slot === 'tree' ? tryingItem : findItem(eq.tree);
  const activeCloud = tryingItem?.slot === 'cloud' ? tryingItem : findItem(eq.cloud);
  const activePet = tryingItem?.slot === 'pet' ? tryingItem : findItem(eq.pet);

  let handProp = activeHand?.prop3d || null;
  if (!handProp && spEq.hand && spEq.hand !== 'trang_hat_bo_de') {
    handProp = spEq.hand === 'hoa_sen_trang_nghiem' || spEq.hand === 'hoa_sen' ? 'nen_hoa_sen' : spEq.hand;
  }

  return {
    robeId: activeRobe?.id || null,
    robeName: activeRobe?.name || null,
    robeStyle: activeRobe?.robeStyle || null,
    robeTint: activeRobe?.robeTint || null,
    upperTint: activeRobe?.upperTint || activeRobe?.robeTint || null,
    lowerTint: activeRobe?.lowerTint || activeRobe?.robeTint || null,
    trimTint: activeRobe?.trimTint || null,
    sashTint: activeRobe?.sashTint || null,
    hat: Boolean(activeHat || spEq.hat === 'non_la_theu_sen'),
    hatGlbKey: activeHat?.prop3d === 'non_la_blender' ? 'non_la_blender' : activeHat || spEq.hat === 'non_la_theu_sen' ? 'non_la' : null,
    bag: spEq.bag || null,
    bagGlbKey: spEq.bag ? (String(spEq.bag).includes('tui') ? 'tui_sen' : null) : null,
    scarf: spEq.scarf || null,
    malaId: activeMala?.id || (spEq.hand === 'trang_hat_go' || spEq.hand === 'trang_hat_bo_de' ? 'trang_hat_bo_de_108_store' : null),
    mat: activeMat?.prop3d || null,
    handProp,
    treeProp: activeTree?.prop3d || null,
    treeId: activeTree?.id || null,
    cloudColor: activeCloud?.cloudColor || null,
    petType: activePet?.petType || null
  };
}

export function encodeProfileBackupCode(payload = {}) {
  const safePayload = {
    v: 1,
    char: payload.characterModelKey || 'nu',
    spiritual: createSpiritualState(payload.spiritual),
    storeProfile: createStoreProfileState(payload.storeProfile),
    activityHub: createActivityHubState(payload.activityHub),
    completedLessons: Array.isArray(payload.completedLessons) ? payload.completedLessons : []
  };
  const json = JSON.stringify(safePayload);
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  let checksum = 0;
  for (let i = 0; i < json.length; i++) {
    checksum = (checksum * 31 + json.charCodeAt(i)) >>> 0;
  }
  const b64 = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `VT1-${checksum.toString(36).toUpperCase()}-${b64}`;
}

export function decodeProfileBackupCode(code) {
  try {
    const raw = String(code || '').trim();
    if (!raw.startsWith('VT1-')) {
      return { ok: false, message: 'Mã khôi phục không đúng định dạng (phải bắt đầu bằng VT1-).' };
    }
    const parts = raw.split('-');
    if (parts.length < 3) {
      return { ok: false, message: 'Mã khôi phục bị thiếu dữ liệu.' };
    }
    const givenChecksum = parts[1].toUpperCase();
    const b64 = parts.slice(2).join('-').replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (b64.length % 4)) % 4;
    const bin = atob(b64 + '='.repeat(padLen));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    let checksum = 0;
    for (let i = 0; i < json.length; i++) {
      checksum = (checksum * 31 + json.charCodeAt(i)) >>> 0;
    }
    if (checksum.toString(36).toUpperCase() !== givenChecksum) {
      return { ok: false, message: 'Mã khôi phục không khớp kiểm tra toàn vẹn (checksum).' };
    }
    const parsed = JSON.parse(json);
    return {
      ok: true,
      data: {
        characterModelKey: parsed.char || 'nu',
        spiritual: createSpiritualState(parsed.spiritual),
        storeProfile: createStoreProfileState(parsed.storeProfile),
        activityHub: createActivityHubState(parsed.activityHub),
        completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : []
      }
    };
  } catch {
    return { ok: false, message: 'Không thể giải mã mã khôi phục. Vui lòng kiểm tra lại.' };
  }
}
