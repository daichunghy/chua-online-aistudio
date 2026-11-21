/**
 * Thanh Công Đức Hôm Nay (Virtue Meter) — theo dõi các hành động tu tập
 * trong ngày hướng tới mục tiêu tu tập hàng ngày (mặc định 100 điểm công đức).
 *
 * Pure logic module: không phụ thuộc DOM hay localStorage.
 */

import { getLocalDateKey } from './daily-dharma.mjs';

export const DAILY_VIRTUE_GOAL = 100;
export const DAILY_VIRTUE_BONUS_LOTUS = 30;

export const VIRTUE_MILESTONES = [
  { points: 25, key: 'khoi_tam', label: 'Khởi Tâm', shortLabel: '25' },
  { points: 50, key: 'tinh_tan', label: 'Tinh Tấn', shortLabel: '50' },
  { points: 75, key: 'an_lac', label: 'An Lạc', shortLabel: '75' },
  { points: 100, key: 'vien_man', label: 'Viên Mãn', shortLabel: '100' }
];

export const VIRTUE_ACTIONS = {
  incense: {
    id: 'incense',
    label: 'Dâng hương',
    icon: '🕯️',
    points: 20,
    maxPerDay: 3,
    quickTarget: 'ritual_incense',
    hint: 'Thắp 3 nén tâm hương trước sân Chánh điện'
  },
  bow: {
    id: 'bow',
    label: 'Lễ Phật',
    icon: '🙏',
    points: 15,
    maxPerDay: 3,
    quickTarget: 'ritual_bow',
    hint: 'Đảnh lễ Tam Bảo hoặc các tôn tượng ngoài trời'
  },
  reading: {
    id: 'reading',
    label: 'Đọc kinh · Học Phật',
    icon: '📖',
    points: 25,
    maxPerDay: 3,
    quickTarget: 'sutra_reading',
    hint: 'Tụng một thời kinh hoặc hoàn thành bài Học Phật'
  },
  chant: {
    id: 'chant',
    label: 'Niệm Phật · Tràng hạt',
    icon: '📿',
    points: 15,
    maxPerDay: 3,
    quickTarget: 'ritual_chant',
    hint: 'Lần chuỗi niệm danh hiệu Phật hoặc thiền chánh niệm'
  },
  lotus: {
    id: 'lotus',
    label: 'Dâng hoa sen',
    icon: '🪷',
    points: 15,
    maxPerDay: 2,
    quickTarget: 'ritual_lotus',
    hint: 'Dâng đóa sen tươi và gửi lời nguyện bình an'
  },
  bell: {
    id: 'bell',
    label: 'Thỉnh chuông',
    icon: '🔔',
    points: 10,
    maxPerDay: 2,
    quickTarget: 'ritual_bell',
    hint: 'Thỉnh một hồi Đại Hồng Chung thanh tịnh'
  },
  lantern: {
    id: 'lantern',
    label: 'Thả hoa đăng',
    icon: '🏮',
    points: 15,
    maxPerDay: 2,
    quickTarget: 'lanterns',
    hint: 'Thả đèn hoa đăng nguyện cầu bình an nơi hồ sen'
  },
  blessing: {
    id: 'blessing',
    label: 'Tháp đèn cầu an',
    icon: '✨',
    points: 15,
    maxPerDay: 2,
    quickTarget: 'blessing_tower',
    hint: 'Ghi danh cầu phước tại Tháp Đèn Sân Chánh Điện'
  },
  fortune: {
    id: 'fortune',
    label: 'Xin xăm · Xem quẻ',
    icon: '🎋',
    points: 10,
    maxPerDay: 2,
    quickTarget: 'fortune',
    hint: 'Xin quẻ Quan Âm và chiêm nghiệm lời khuyên thiện lành'
  },
  cong_qua: {
    id: 'cong_qua',
    label: 'Công quả sân chùa',
    icon: '🧹',
    points: 20,
    maxPerDay: 2,
    quickTarget: 'cong_qua',
    hint: 'Quét lá sân chùa, tưới sen hoặc làm việc công quả'
  }
};

function sanitizeDateKey(dateKey) {
  if (typeof dateKey === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateKey.trim())) {
    return dateKey.trim();
  }
  return getLocalDateKey();
}

function getPreviousDateKey(dateKey) {
  const parts = sanitizeDateKey(dateKey).split('-').map(Number);
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  dt.setDate(dt.getDate() - 1);
  return getLocalDateKey(dt);
}

export function createVirtueMeterState(saved = null, dateKey = null) {
  const today = sanitizeDateKey(dateKey);
  const src = saved && typeof saved === 'object' ? saved : {};
  const savedDate = typeof src.dateKey === 'string' ? src.dateKey : '';

  const base = {
    dateKey: today,
    dailyGoal:
      Number.isFinite(Number(src.dailyGoal)) && Number(src.dailyGoal) >= 20
        ? Math.round(Number(src.dailyGoal))
        : DAILY_VIRTUE_GOAL,
    todayPoints: 0,
    actionCounts: {},
    recentLogs: [],
    goalRewardClaimedDate: typeof src.goalRewardClaimedDate === 'string' ? src.goalRewardClaimedDate : null,
    lastCompletedDate: typeof src.lastCompletedDate === 'string' ? src.lastCompletedDate : null,
    streakDays: Math.max(0, Math.floor(Number(src.streakDays || 0))),
    totalDaysCompleted: Math.max(0, Math.floor(Number(src.totalDaysCompleted || 0))),
    lifetimePoints: Math.max(0, Math.floor(Number(src.lifetimePoints || 0)))
  };

  if (savedDate === today) {
    base.todayPoints = Math.max(0, Math.floor(Number(src.todayPoints || 0)));
    if (src.actionCounts && typeof src.actionCounts === 'object') {
      const cleanCounts = {};
      for (const [k, v] of Object.entries(src.actionCounts)) {
        if (VIRTUE_ACTIONS[k]) {
          cleanCounts[k] = Math.max(0, Math.floor(Number(v || 0)));
        }
      }
      base.actionCounts = cleanCounts;
    }
    if (Array.isArray(src.recentLogs)) {
      base.recentLogs = src.recentLogs.slice(0, 12);
    }
  } else if (base.lastCompletedDate) {
    // Preserve streak only if yesterday was completed
    const yesterday = getPreviousDateKey(today);
    if (base.lastCompletedDate !== yesterday && base.lastCompletedDate !== today) {
      base.streakDays = 0;
    }
  }

  return base;
}

export function ensureVirtueMeterDate(state, dateKey = null) {
  const today = sanitizeDateKey(dateKey);
  if (state && typeof state === 'object' && state.dateKey === today) {
    return state;
  }
  return createVirtueMeterState(state, today);
}

/**
 * Records a spiritual interaction on today's Virtue Meter (immutable).
 * Applies per-action daily caps so spamming one button doesn't break progression,
 * and awards an idempotent daily completion bonus when reaching the daily goal.
 */
export function recordVirtueActivity(state, actionType, options = {}) {
  const today = sanitizeDateKey(options?.dateKey);
  const current = ensureVirtueMeterDate(state, today);
  const def = VIRTUE_ACTIONS[actionType];
  if (!def) {
    return {
      state: current,
      gained: 0,
      capped: false,
      totalPoints: current.todayPoints,
      goal: current.dailyGoal,
      percent: Math.min(100, Math.round((current.todayPoints / current.dailyGoal) * 100)),
      reachedGoalNow: false,
      crossedMilestone: null,
      bonusLotus: 0,
      action: null
    };
  }

  const prevCount = current.actionCounts[actionType] || 0;
  const maxPerDay = def.maxPerDay || 3;
  const isCapped = prevCount >= maxPerDay;
  const customPoints = Number(options?.points);
  const gained = isCapped
    ? 0
    : Number.isFinite(customPoints) && customPoints > 0
      ? Math.round(customPoints)
      : def.points;

  const prevPoints = current.todayPoints;
  const nextPoints = prevPoints + gained;
  const nextCounts = { ...current.actionCounts, [actionType]: prevCount + 1 };

  let crossedMilestone = null;
  for (const ms of VIRTUE_MILESTONES) {
    if (prevPoints < ms.points && nextPoints >= ms.points) {
      crossedMilestone = ms;
    }
  }

  const reachedGoalNow =
    nextPoints >= current.dailyGoal && current.goalRewardClaimedDate !== today;

  let streakDays = current.streakDays;
  let totalDaysCompleted = current.totalDaysCompleted;
  let lastCompletedDate = current.lastCompletedDate;
  let goalRewardClaimedDate = current.goalRewardClaimedDate;
  let bonusLotus = 0;

  if (reachedGoalNow) {
    const yesterday = getPreviousDateKey(today);
    streakDays = current.lastCompletedDate === yesterday ? current.streakDays + 1 : 1;
    totalDaysCompleted = current.totalDaysCompleted + 1;
    lastCompletedDate = today;
    goalRewardClaimedDate = today;
    bonusLotus = DAILY_VIRTUE_BONUS_LOTUS;
  }

  const note = typeof options?.note === 'string' && options.note.trim() ? options.note.trim() : def.label;
  const nextLogs =
    gained > 0
      ? [
          {
            actionType,
            label: def.label,
            icon: def.icon,
            points: gained,
            note,
            timeLabel: options?.timeLabel || ''
          },
          ...(current.recentLogs || [])
        ].slice(0, 12)
      : [...(current.recentLogs || [])];

  const nextState = {
    ...current,
    dateKey: today,
    todayPoints: nextPoints,
    actionCounts: nextCounts,
    recentLogs: nextLogs,
    goalRewardClaimedDate,
    lastCompletedDate,
    streakDays,
    totalDaysCompleted,
    lifetimePoints: current.lifetimePoints + gained
  };

  return {
    state: nextState,
    gained,
    capped: isCapped,
    totalPoints: nextPoints,
    goal: nextState.dailyGoal,
    percent: Math.min(100, Math.round((nextPoints / nextState.dailyGoal) * 100)),
    reachedGoalNow,
    crossedMilestone,
    bonusLotus,
    action: def
  };
}

export function getVirtueStageLabel(points, goal = DAILY_VIRTUE_GOAL) {
  const ratio = goal > 0 ? points / goal : 0;
  if (ratio >= 1) return 'Viên Mãn';
  if (ratio >= 0.75) return 'An Lạc';
  if (ratio >= 0.5) return 'Tinh Tấn';
  if (ratio >= 0.25) return 'Khởi Tâm';
  return 'Bắt Đầu';
}

export function getVirtueMeterSummary(state, dateKey = null) {
  const cur = ensureVirtueMeterDate(state, dateKey);
  const goal = cur.dailyGoal || DAILY_VIRTUE_GOAL;
  const points = cur.todayPoints || 0;
  const clampedPoints = Math.min(points, goal);
  const percent = Math.min(100, Math.round((points / goal) * 100));
  const completed = points >= goal;
  const remaining = Math.max(0, goal - points);
  const stageLabel = getVirtueStageLabel(points, goal);

  const milestones = VIRTUE_MILESTONES.map((ms) => ({
    ...ms,
    reached: points >= ms.points
  }));
  const nextMilestone = milestones.find((m) => !m.reached) || null;

  const actions = Object.values(VIRTUE_ACTIONS).map((def) => {
    const count = cur.actionCounts[def.id] || 0;
    return {
      ...def,
      count,
      earnedPoints: Math.min(count, def.maxPerDay) * def.points,
      doneToday: count > 0,
      capped: count >= def.maxPerDay
    };
  });

  return {
    dateKey: cur.dateKey,
    points,
    clampedPoints,
    goal,
    percent,
    completed,
    remaining,
    stageLabel,
    milestones,
    nextMilestone,
    actions,
    recentLogs: cur.recentLogs || [],
    streakDays: cur.streakDays || 0,
    totalDaysCompleted: cur.totalDaysCompleted || 0,
    lifetimePoints: cur.lifetimePoints || 0,
    bonusLotus: DAILY_VIRTUE_BONUS_LOTUS
  };
}
