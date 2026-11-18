/**
 * Sức chứa điện, cấp bậc, nhiệm vụ sân, vườn thiền, nhịp chuông, di sản.
 * (Tách từ chua-online-logic.mjs — import từ '/src/logic/chua-online-logic.mjs' vẫn dùng được.)
 */
import { getLocalDateKey } from './daily-dharma.mjs';
import { createStoreProfileState } from './store-items.mjs';
import { ensureDailyMissionDate, createActivityHubState, recordDailyMissionMetric } from './activity-hub.mjs';

export const INTERIOR_HALL_CAPACITY = {
  prayerCushions: 144,
  diningSeats: 48,
  standingSlots: 36,
  totalCapacity: 228,
  minRequired: 180
};

export function calculateInteriorPlayerCapacity(overrides = {}) {
  const prayerCushions = Number(overrides.prayerCushions ?? INTERIOR_HALL_CAPACITY.prayerCushions);
  const diningSeats = Number(overrides.diningSeats ?? INTERIOR_HALL_CAPACITY.diningSeats);
  const standingSlots = Number(overrides.standingSlots ?? INTERIOR_HALL_CAPACITY.standingSlots);
  const totalCapacity = Math.max(0, prayerCushions) + Math.max(0, diningSeats) + Math.max(0, standingSlots);
  return {
    prayerCushions,
    diningSeats,
    standingSlots,
    totalCapacity,
    minRequired: INTERIOR_HALL_CAPACITY.minRequired,
    meetsTarget: totalCapacity >= INTERIOR_HALL_CAPACITY.minRequired
  };
}

// ============================================================================
// MULTI-DAY REPLAYABLE GAMEPLAY SYSTEM (XP Ranks, Bodhi Leaves, Temple Garden,
// Bell/Mokugyo Rhythm Minigame, Heritage Relic Stamp Book)
// ============================================================================
export const PILGRIM_RANKS = [
  { level: 1, minXp: 0, title: 'Thiện Duyên', badge: '🌱' },
  { level: 2, minXp: 120, title: 'Hành Giả', badge: '🪷' },
  { level: 3, minXp: 350, title: 'Cư Sĩ Tinh Tấn', badge: '📿' },
  { level: 4, minXp: 700, title: 'Hộ Pháp Công Đức', badge: '☸️' },
  { level: 5, minXp: 1200, title: 'Liên Hoa Thiện Tri Thức', badge: '✨' }
];

export function getPilgrimRankInfo(xp = 0) {
  const safeXp = Math.max(0, Number(xp || 0));
  let current = PILGRIM_RANKS[0];
  for (const rank of PILGRIM_RANKS) {
    if (safeXp >= rank.minXp) current = rank;
  }
  const idx = PILGRIM_RANKS.indexOf(current);
  const next = PILGRIM_RANKS[idx + 1] || null;
  const span = next ? Math.max(1, next.minXp - current.minXp) : 1;
  const progressRatio = next ? Math.min(1, Math.max(0, (safeXp - current.minXp) / span)) : 1;
  return {
    xp: safeXp,
    level: current.level,
    title: current.title,
    badge: current.badge,
    nextMinXp: next ? next.minXp : current.minXp,
    nextTitle: next ? next.title : null,
    progressRatio
  };
}

export function grantPlayerXp(activityState, xpAmount = 0) {
  const nextAct = createActivityHubState(activityState);
  const prevRank = getPilgrimRankInfo(nextAct.xp);
  const delta = Math.max(0, Math.round(Number(xpAmount || 0)));
  nextAct.xp += delta;
  const nextRank = getPilgrimRankInfo(nextAct.xp);
  return {
    activity: nextAct,
    xpGranted: delta,
    leveledUp: nextRank.level > prevRank.level,
    rankInfo: nextRank
  };
}

export const COURTYARD_LEAF_SPOTS = [
  { id: 'leaf_tam_quan', label: 'Lá Bồ Đề Cổng Tam Quan', pos: { x: 18.5, z: 46.5 } },
  { id: 'leaf_adida_east', label: 'Lá Bồ Đề vườn A Di Đà', pos: { x: 28.5, z: 29.0 } },
  { id: 'leaf_san_trung_tam', label: 'Lá Bồ Đề sân gạch Chánh điện', pos: { x: 16.0, z: 18.5 } },
  { id: 'leaf_quan_am', label: 'Cánh sen Đài Quán Thế Âm', pos: { x: 30.8, z: 22.0 } },
  { id: 'leaf_ho_sen', label: 'Lá sen Hồ Cá Koi', pos: { x: -4.5, z: 20.5 } },
  { id: 'leaf_di_lac', label: 'Lá Bồ Đề sân Di Lặc', pos: { x: -20.5, z: 15.0 } },
  { id: 'leaf_vuon_lam_ty_ni', label: 'Hoa Sa La Vườn Lâm Tỳ Ni', pos: { x: -34.0, z: 24.5 } },
  { id: 'leaf_bao_thap', label: 'Lá Bồ Đề Bảo Tháp 7 Tầng', pos: { x: -12.0, z: -31.5 } }
];

export function createCourtyardTasksState(saved = {}, dateKey = getLocalDateKey()) {
  const src = saved && typeof saved === 'object' ? saved : {};
  const sameDay = src.dateKey === dateKey;
  return {
    dateKey: typeof src.dateKey === 'string' && sameDay ? src.dateKey : dateKey,
    collectedIds: sameDay && Array.isArray(src.collectedIds) ? [...new Set(src.collectedIds)] : [],
    totalSwept: Math.max(0, Number(src.totalSwept || 0))
  };
}

export function collectCourtyardTask(activityState, storeProfile, spotId, dateKey = getLocalDateKey()) {
  let nextAct = ensureDailyMissionDate(activityState, dateKey);
  const nextProfile = createStoreProfileState(storeProfile);
  const spot = COURTYARD_LEAF_SPOTS.find((s) => s.id === spotId);
  if (!spot) {
    return {
      ok: false,
      reason: 'not_found',
      message: 'Không tìm thấy vị trí lá Bồ Đề.',
      activity: nextAct,
      storeProfile: nextProfile
    };
  }
  const tasks = createCourtyardTasksState(nextAct.courtyardTasks, dateKey);
  if (tasks.collectedIds.includes(spotId)) {
    return {
      ok: false,
      reason: 'already_collected',
      message: `Hôm nay cô bác đã quét sạch "${spot.label}" rồi.`,
      activity: nextAct,
      storeProfile: nextProfile
    };
  }

  tasks.collectedIds.push(spotId);
  tasks.totalSwept += 1;
  nextAct.courtyardTasks = tasks;
  nextAct = recordDailyMissionMetric(nextAct, 'dailyLeavesSwept', 1, dateKey);

  const rewardLotus = 15;
  const rewardGems = tasks.collectedIds.length % 4 === 0 ? 1 : 0;
  nextProfile.lotusPoints += rewardLotus;
  nextProfile.gems += rewardGems;
  const xpRes = grantPlayerXp(nextAct, 15);
  nextAct = xpRes.activity;

  return {
    ok: true,
    spot,
    rewardLotus,
    rewardGems,
    xpGranted: 15,
    leveledUp: xpRes.leveledUp,
    rankInfo: xpRes.rankInfo,
    collectedCount: tasks.collectedIds.length,
    totalSpots: COURTYARD_LEAF_SPOTS.length,
    message: rewardGems
      ? `Quét ${spot.label}: +${rewardLotus} 🪷 · +${rewardGems} 💎 · +15 XP!`
      : `Quét ${spot.label}: +${rewardLotus} 🪷 · +15 XP!`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export const TEMPLE_GARDEN_SPECIES = [
  {
    id: 'chum_sen',
    name: 'Chậu Sen Đồng Tháp',
    icon: '🪷',
    seedCostLotus: 30,
    harvestLotus: 65,
    harvestGems: 2,
    harvestXp: 35,
    desc: 'Hoa sen hồng thanh khiết nở rộ dưới nắng miền Tây.'
  },
  {
    id: 'cay_bo_de',
    name: 'Cây Bồ Đề Non',
    icon: '🌳',
    seedCostLotus: 50,
    harvestLotus: 95,
    harvestGems: 4,
    harvestXp: 50,
    desc: 'Cây Bồ Đề lá hình tim xanh mướt tượng trưng cho trí tuệ tỉnh thức.'
  },
  {
    id: 'cay_sala',
    name: 'Cây Sa La Khai Hoa',
    icon: '🌺',
    seedCostLotus: 65,
    harvestLotus: 120,
    harvestGems: 5,
    harvestXp: 65,
    desc: 'Loài hoa thiêng gắn liền với Vườn Lâm Tỳ Ni và cội Đạo Tràng.'
  }
];

export const TEMPLE_GARDEN_SLOTS = [
  { slotIdx: 0, label: 'Luống 1 · Tây Nam Vườn Thiền', pos: { x: -37.2, z: 20.8 } },
  { slotIdx: 1, label: 'Luống 2 · Chính Tây Vườn Lâm Tỳ Ni', pos: { x: -33.2, z: 20.8 } },
  { slotIdx: 2, label: 'Luống 3 · Cạnh Lối Dạo Hoa Sen', pos: { x: -37.2, z: 25.4 } },
  { slotIdx: 3, label: 'Luống 4 · Góc Tĩnh Tâm Sân Tây', pos: { x: -33.2, z: 25.4 } }
];

export function createTempleGardenState(saved = null) {
  const arr = Array.isArray(saved) ? saved : [];
  return TEMPLE_GARDEN_SLOTS.map((slot, idx) => {
    const raw = arr[idx] && typeof arr[idx] === 'object' ? arr[idx] : {};
    const speciesValid = TEMPLE_GARDEN_SPECIES.some((s) => s.id === raw.speciesId);
    return {
      slotIdx: idx,
      speciesId: speciesValid ? raw.speciesId : null,
      stage: speciesValid ? Math.max(1, Math.min(3, Number(raw.stage || 1))) : 0,
      lastWaterDate: typeof raw.lastWaterDate === 'string' ? raw.lastWaterDate : null,
      harvestCount: Math.max(0, Number(raw.harvestCount || 0))
    };
  });
}

export function plantGardenTree(activityState, storeProfile, slotIdx, speciesId, dateKey = getLocalDateKey()) {
  let nextAct = ensureDailyMissionDate(activityState, dateKey);
  const nextProfile = createStoreProfileState(storeProfile);
  const slots = createTempleGardenState(nextAct.templeGarden);
  const idx = Number(slotIdx);
  if (!slots[idx]) {
    return { ok: false, reason: 'invalid_slot', message: 'Không tìm thấy ô đất vườn.', activity: nextAct, storeProfile: nextProfile };
  }
  if (slots[idx].speciesId) {
    return { ok: false, reason: 'occupied', message: 'Luống này đã có cây đang sinh trưởng.', activity: nextAct, storeProfile: nextProfile };
  }
  const species = TEMPLE_GARDEN_SPECIES.find((s) => s.id === speciesId);
  if (!species) {
    return { ok: false, reason: 'invalid_species', message: 'Không tìm thấy giống cây.', activity: nextAct, storeProfile: nextProfile };
  }
  if (nextProfile.lotusPoints < species.seedCostLotus) {
    return {
      ok: false,
      reason: 'insufficient_lotus',
      message: `Cần ${species.seedCostLotus} 🪷 để thỉnh giống ${species.name}.`,
      activity: nextAct,
      storeProfile: nextProfile
    };
  }

  nextProfile.lotusPoints -= species.seedCostLotus;
  slots[idx] = {
    ...slots[idx],
    speciesId: species.id,
    stage: 1,
    lastWaterDate: null
  };
  nextAct.templeGarden = slots;
  nextAct = recordDailyMissionMetric(nextAct, 'dailyGardenActions', 1, dateKey);
  const xpRes = grantPlayerXp(nextAct, 15);
  nextAct = xpRes.activity;

  return {
    ok: true,
    slot: slots[idx],
    species,
    leveledUp: xpRes.leveledUp,
    rankInfo: xpRes.rankInfo,
    message: `Đã ươm trồng ${species.name} tại luống ${idx + 1} (+15 XP).`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function waterGardenSlot(activityState, storeProfile, slotIdx, dateKey = getLocalDateKey()) {
  let nextAct = ensureDailyMissionDate(activityState, dateKey);
  const nextProfile = createStoreProfileState(storeProfile);
  const slots = createTempleGardenState(nextAct.templeGarden);
  const idx = Number(slotIdx);
  const slot = slots[idx];
  if (!slot || !slot.speciesId) {
    return { ok: false, reason: 'empty_slot', message: 'Luống đất này đang trống, hãy gieo hạt trước nhé.', activity: nextAct, storeProfile: nextProfile };
  }
  if (slot.stage >= 3) {
    return { ok: false, reason: 'already_mature', message: 'Cây đã nở hoa rực rỡ, cô bác có thể thu hoạch ngay!', activity: nextAct, storeProfile: nextProfile };
  }
  const species = TEMPLE_GARDEN_SPECIES.find((s) => s.id === slot.speciesId);
  slot.stage = Math.min(3, slot.stage + 1);
  slot.lastWaterDate = dateKey;
  nextAct.templeGarden = slots;
  nextAct = recordDailyMissionMetric(nextAct, 'dailyGardenActions', 1, dateKey);
  nextProfile.lotusPoints += 12;
  const xpRes = grantPlayerXp(nextAct, 15);
  nextAct = xpRes.activity;

  return {
    ok: true,
    slot,
    species,
    leveledUp: xpRes.leveledUp,
    rankInfo: xpRes.rankInfo,
    message:
      slot.stage >= 3
        ? `Tưới nước ${species?.name || 'cây'}: cây đã trổ hoa mãn khai! (+12 🪷, +15 XP)`
        : `Tưới nước ${species?.name || 'cây'} nảy chồi xanh tươi (+12 🪷, +15 XP).`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function harvestGardenSlot(activityState, storeProfile, slotIdx, dateKey = getLocalDateKey()) {
  let nextAct = ensureDailyMissionDate(activityState, dateKey);
  const nextProfile = createStoreProfileState(storeProfile);
  const slots = createTempleGardenState(nextAct.templeGarden);
  const idx = Number(slotIdx);
  const slot = slots[idx];
  if (!slot || !slot.speciesId || slot.stage < 3) {
    return { ok: false, reason: 'not_mature', message: 'Cây cần đạt giai đoạn nở hoa (3/3) mới có thể thu hoạch.', activity: nextAct, storeProfile: nextProfile };
  }
  const species = TEMPLE_GARDEN_SPECIES.find((s) => s.id === slot.speciesId) || TEMPLE_GARDEN_SPECIES[0];
  nextProfile.lotusPoints += species.harvestLotus;
  nextProfile.gems += species.harvestGems;
  slots[idx] = {
    slotIdx: idx,
    speciesId: null,
    stage: 0,
    lastWaterDate: null,
    harvestCount: (slot.harvestCount || 0) + 1
  };
  nextAct.templeGarden = slots;
  nextAct = recordDailyMissionMetric(nextAct, 'dailyGardenActions', 1, dateKey);
  const xpRes = grantPlayerXp(nextAct, species.harvestXp);
  nextAct = xpRes.activity;

  return {
    ok: true,
    species,
    rewardLotus: species.harvestLotus,
    rewardGems: species.harvestGems,
    xpGranted: species.harvestXp,
    leveledUp: xpRes.leveledUp,
    rankInfo: xpRes.rankInfo,
    message: `Thu hoạch ${species.name}! Nhận +${species.harvestLotus} 🪷 · +${species.harvestGems} 💎 · +${species.harvestXp} XP.`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function scoreBellRhythmHit(offsetMs = 0) {
  const abs = Math.abs(Number(offsetMs || 0));
  if (abs <= 90) {
    return { grade: 'chanh_niem', label: 'Chánh niệm!', points: 100 };
  }
  if (abs <= 190) {
    return { grade: 'hoa_nhip', label: 'Hòa nhịp!', points: 65 };
  }
  if (abs <= 300) {
    return { grade: 'cham_nhip', label: 'Chậm nhịp', points: 35 };
  }
  return { grade: 'miss', label: 'Lỡ nhịp', points: 0 };
}

export function completeBellRhythmSession(activityState, storeProfile, hits = [], dateKey = getLocalDateKey()) {
  let nextAct = ensureDailyMissionDate(activityState, dateKey);
  const nextProfile = createStoreProfileState(storeProfile);
  const arr = Array.isArray(hits) ? hits : [];
  let totalScore = 0;
  let chanhNiemCount = 0;
  let maxCombo = 0;
  let combo = 0;
  for (const h of arr) {
    const pts = Number(h?.points || 0);
    totalScore += pts;
    if (h?.grade === 'chanh_niem') chanhNiemCount += 1;
    if (pts > 0) {
      combo += 1;
      maxCombo = Math.max(maxCombo, combo);
    } else {
      combo = 0;
    }
  }
  const accuracy = arr.length > 0 ? Math.round(((arr.filter((x) => (x?.points || 0) > 0).length) / arr.length) * 100) : 0;
  const rewardLotus = Math.max(20, Math.min(90, 20 + Math.round(totalScore / 18)));
  const rewardGems = accuracy >= 75 ? 6 : accuracy >= 50 ? 3 : 1;
  const xpGranted = Math.max(20, Math.min(60, 20 + chanhNiemCount * 5));

  nextProfile.lotusPoints += rewardLotus;
  nextProfile.gems += rewardGems;
  nextAct.bellRhythmBest = Math.max(nextAct.bellRhythmBest || 0, totalScore);
  nextAct = recordDailyMissionMetric(nextAct, 'dailyRhythmSessions', 1, dateKey);
  const xpRes = grantPlayerXp(nextAct, xpGranted);
  nextAct = xpRes.activity;

  return {
    ok: true,
    totalScore,
    accuracy,
    maxCombo,
    chanhNiemCount,
    rewardLotus,
    rewardGems,
    xpGranted,
    leveledUp: xpRes.leveledUp,
    rankInfo: xpRes.rankInfo,
    message: `Hoàn tất khóa Thỉnh Chuông (${accuracy}% chuẩn nhịp)! Nhận +${rewardLotus} 🪷 · +${rewardGems} 💎 · +${xpGranted} XP.`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export const HERITAGE_RELICS = [
  {
    id: 'relic_tam_quan',
    name: 'Cổng Tam Quan Khảm Sành Sứ',
    era: 'Kiến trúc Á – Âu đầu TK XX',
    stationKey: 'cong_tam_quan',
    pos: { x: 23, z: 54 },
    desc: 'Nghệ thuật ghép mảnh chén đĩa gốm sứ cổ thành hoa văn long phụng, tứ linh đặc trưng Nam Bộ.',
    rewardLotus: 35,
    rewardXp: 25
  },
  {
    id: 'relic_adida',
    name: 'Đại Tượng Phật A Di Đà 24m',
    era: 'Khánh thành 2007',
    stationKey: 'phat_adida',
    pos: { x: 8.5, z: 17.5 },
    desc: 'Pho tượng đứng uy nghiêm cao 24m trên đài sen bên hoa viên Tây Nam hướng mặt về trục chính đón khách hành hương.',
    rewardLotus: 35,
    rewardXp: 25
  },
  {
    id: 'relic_dilac',
    name: 'Đại Tượng Phật Di Lặc 20m',
    era: 'Hoàn thành 2010',
    stationKey: 'phat_di_lac',
    pos: { x: -24.5, z: 12 },
    desc: 'Tượng Bồ Tát Di Lặc ngồi an nhiên nụ cười hoan hỷ, nặng khoảng 250 tấn giữa hoa viên xanh.',
    rewardLotus: 35,
    rewardXp: 25
  },
  {
    id: 'relic_niet_ban',
    name: 'Đại Tượng Phật Nhập Niết Bàn 32m',
    era: 'Khánh thành 2013',
    stationKey: 'phat_niet_ban',
    pos: { x: -24.5, z: -26 },
    desc: 'Pho tượng nằm dài 32m an tịnh phía sau bảo tháp, biểu trưng cảnh giới thanh lương giải thoát.',
    rewardLotus: 40,
    rewardXp: 30
  },
  {
    id: 'relic_quan_am',
    name: 'Đài Quán Thế Âm Nam Hải',
    era: 'Vườn Thiền Phía Đông',
    stationKey: 'chanh_dien',
    pos: { x: 32.8, z: 22.5 },
    desc: 'Tôn tượng Bồ Tát Quán Thế Âm cầm bình cam lồ trên đài sen bên hồ cá Koi thanh tịnh.',
    rewardLotus: 35,
    rewardXp: 25
  },
  {
    id: 'relic_bao_thap',
    name: 'Bảo Tháp Thất Phật Bảy Tầng',
    era: 'Khu Hậu Viên Phía Bắc',
    stationKey: 'bao_thap_that_phat',
    pos: { x: -8.0, z: -37.0 },
    desc: 'Ngọn bảo tháp 7 tầng mái cong vút uy nghiêm vươn lên giữa vườn cổ thụ Vĩnh Tràng.',
    rewardLotus: 40,
    rewardXp: 30
  },
  {
    id: 'relic_dai_hong_chung',
    name: 'Lầu Đại Hồng Chung',
    era: 'Phía Tây Nam Cổ Tự',
    stationKey: 'lau_tra_thien',
    pos: { x: -44.0, z: -56.0 },
    desc: 'Quả chuông đồng cổ khắc minh văn ngân vang mỗi sáng chiều nhắc người giữ tâm chánh niệm.',
    rewardLotus: 40,
    rewardXp: 30
  },
  {
    id: 'relic_long_tru',
    name: 'Cặp Long Trụ Rồng Cuốn Chánh Điện',
    era: 'Nội Điện Chữ Quốc (國)',
    stationKey: 'chanh_dien',
    pos: { x: 23, z: -9.8 },
    desc: 'Hai cột gỗ lim chạm rồng uốn lượn tinh xảo thếp vàng nâng đỡ mái hiên Tam Bảo.',
    rewardLotus: 45,
    rewardXp: 30
  },
  {
    id: 'relic_bat_bo_la_han',
    name: 'Thập Bát La Hán Gỗ Mít Trăm Tuổi',
    era: 'Nghệ nhân Nam Bộ 1907',
    stationKey: 'chanh_dien',
    pos: { x: 18, z: -9.8 },
    desc: 'Hệ tượng La Hán tạc nguyên khối từ gỗ mít già với thần thái sống động hiếm có.',
    rewardLotus: 45,
    rewardXp: 35
  },
  {
    id: 'relic_to_dat_ma',
    name: 'Tổ Đường · Tổ Sư Đạt Ma',
    era: 'Nhà Tổ Cổ Kính',
    stationKey: 'hau_to_nha_to',
    pos: { x: 23, z: -46.8 },
    desc: 'Không gian tôn thờ Chư Vị Tổ Sư khai sơn tạo tự qua bao thế hệ trụ trì.',
    rewardLotus: 45,
    rewardXp: 35
  }
];

export function discoverHeritageRelic(activityState, storeProfile, relicId, dateKey = getLocalDateKey()) {
  let nextAct = ensureDailyMissionDate(activityState, dateKey);
  const nextProfile = createStoreProfileState(storeProfile);
  const relic = HERITAGE_RELICS.find((r) => r.id === relicId);
  if (!relic) {
    return { ok: false, reason: 'not_found', message: 'Không tìm thấy di sản.', activity: nextAct, storeProfile: nextProfile };
  }
  const existing = Array.isArray(nextAct.heritageRelics) ? nextAct.heritageRelics : [];
  if (existing.includes(relicId)) {
    return {
      ok: true,
      alreadyDiscovered: true,
      relic,
      message: `Di sản "${relic.name}" đã có dấu ấn trong Sổ Di Sản của cô bác.`,
      activity: nextAct,
      storeProfile: nextProfile
    };
  }
  nextAct.heritageRelics = [...existing, relicId];
  nextAct = recordDailyMissionMetric(nextAct, 'dailyRelicsFound', 1, dateKey);
  nextProfile.lotusPoints += relic.rewardLotus;
  const xpRes = grantPlayerXp(nextAct, relic.rewardXp);
  nextAct = xpRes.activity;

  return {
    ok: true,
    alreadyDiscovered: false,
    relic,
    rewardLotus: relic.rewardLotus,
    xpGranted: relic.rewardXp,
    leveledUp: xpRes.leveledUp,
    rankInfo: xpRes.rankInfo,
    discoveredCount: nextAct.heritageRelics.length,
    totalCount: HERITAGE_RELICS.length,
    message: `Đóng dấu Di Sản "${relic.name}"! Nhận +${relic.rewardLotus} 🪷 · +${relic.rewardXp} XP.`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}
