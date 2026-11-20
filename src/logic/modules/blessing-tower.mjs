/**
 * Tháp đèn cầu an: danh mục & lời nguyện.
 * (Tách từ chua-online-logic.mjs — import từ '/src/logic/chua-online-logic.mjs' vẫn dùng được.)
 */
import { getLocalDateKey } from './daily-dharma.mjs';

// ============================================================================
// THÁP ĐÈN CẦU AN · ĐĂNG DƯỢC SƯ VẠN PHẬT (GHI TÊN CẦU PHƯỚC CHÁNH ĐIỆN)
// ============================================================================

export const BLESSING_TOWER_CATEGORIES = [
  {
    id: 'gia_dao_binh_an',
    label: 'Gia Đạo Bình An',
    icon: '🏮',
    accentHex: '#F3B43F',
    blessingVerse: 'Nguyện ánh đèn Dược Sư soi sáng gia đình hòa thuận, tứ thời vô sự, tám tiết an khang.'
  },
  {
    id: 'suc_khoe_cha_me',
    label: 'Báo Hiếu · Sức Khỏe Cha Mẹ',
    icon: '🪷',
    accentHex: '#F08A5D',
    blessingVerse: 'Nguyện song thân phụ mẫu thân tâm thường lạc, bách niên giai lão, phước thọ miên trường.'
  },
  {
    id: 'quoc_thai_dan_an',
    label: 'Quốc Thái Dân An',
    icon: '🔔',
    accentHex: '#E6C25A',
    blessingVerse: 'Nguyện mưa thuận gió hòa, muôn dân an cư lạc nghiệp, nhà nhà hướng thiện tu tâm.'
  },
  {
    id: 'hoc_hanh_su_nghiep',
    label: 'Trí Tuệ · Học Hành Hanh Thông',
    icon: '📿',
    accentHex: '#5CC9A7',
    blessingVerse: 'Nguyện khai mở trí sáng, chánh niệm vững bền, việc học việc làm đều thành tựu thiện lành.'
  }
];

export const DEFAULT_BLESSING_TOWER_PRAYERS = [
  {
    id: 'bt_seed_1',
    devoteeName: 'Phật tử Diệu Hiền · Nguyễn Thị Thanh Mai',
    birthYear: '1964',
    familyNote: 'Cùng hợp gia quyến tại TP. Mỹ Tho, Tiền Giang',
    categoryId: 'suc_khoe_cha_me',
    wishText: 'Cầu nguyện mẹ già 86 tuổi thân tâm an lạc, ít bệnh ít lo, sớm tối niệm Phật thanh thản.',
    tier: 3,
    slotNumber: 18,
    dateKey: '2026-05-12',
    isUserOwned: false
  },
  {
    id: 'bt_seed_2',
    devoteeName: 'Gia đình chú Sáu Minh · Cô Tư Lan',
    birthYear: '1958',
    familyNote: 'Xã Mỹ Phong, Mỹ Tho',
    categoryId: 'gia_dao_binh_an',
    wishText: 'Nguyện cầu con cháu đi làm xa luôn bình an, giữ tâm hiền thiện, nhớ cội nguồn Tam Bảo.',
    tier: 5,
    slotNumber: 34,
    dateKey: '2026-05-14',
    isUserOwned: false
  },
  {
    id: 'bt_seed_3',
    devoteeName: 'Phật tử Minh Tâm · Trần Quốc Bảo',
    birthYear: '1991',
    familyNote: 'Quận Bình Thạnh, TP.HCM',
    categoryId: 'hoc_hanh_su_nghiep',
    wishText: 'Cầu trí tuệ sáng suốt, công việc hanh thông, đủ duyên lành phụng sự cha mẹ và xã hội.',
    tier: 7,
    slotNumber: 52,
    dateKey: '2026-05-15',
    isUserOwned: false
  },
  {
    id: 'bt_seed_4',
    devoteeName: 'Đạo tràng Hành Hương Miền Tây',
    birthYear: '',
    familyNote: 'Đoàn Phật tử Bến Tre — Vĩnh Long — Tiền Giang',
    categoryId: 'quoc_thai_dan_an',
    wishText: 'Nguyện cầu mưa thuận gió hòa, mùa màng tươi tốt, muôn loài chúng sinh đều thấm nhuần từ bi.',
    tier: 9,
    slotNumber: 68,
    dateKey: '2026-05-16',
    isUserOwned: false
  },
  {
    id: 'bt_seed_5',
    devoteeName: 'Phật tử Ngọc Liên · Lê Thị Bích Thủy',
    birthYear: '1972',
    familyNote: 'Chợ Gạo, Tiền Giang',
    categoryId: 'gia_dao_binh_an',
    wishText: 'Kính dâng ngọn đèn lành trước Đại Hùng Bửu Điện, nguyện gia đạo bình yên, tâm thường hoan hỷ.',
    tier: 11,
    slotNumber: 84,
    dateKey: '2026-05-17',
    isUserOwned: false
  },
  {
    id: 'bt_seed_6',
    devoteeName: 'Học sinh Nguyễn Hoàng Khôi',
    birthYear: '2008',
    familyNote: 'TP. Mỹ Tho',
    categoryId: 'hoc_hanh_su_nghiep',
    wishText: 'Con xin nguyện giữ tâm bình tĩnh, chăm chỉ ôn luyện và đạt kết quả tốt trong kỳ thi sắp tới.',
    tier: 12,
    slotNumber: 96,
    dateKey: '2026-05-18',
    isUserOwned: false
  }
];

export function createBlessingTowerState(saved = {}) {
  const rawEntries = Array.isArray(saved?.entries) && saved.entries.length > 0
    ? saved.entries
    : DEFAULT_BLESSING_TOWER_PRAYERS;
  const entries = rawEntries
    .filter((item) => item && typeof item.devoteeName === 'string' && item.devoteeName.trim().length > 0)
    .slice(0, 108)
    .map((item, idx) => ({
      id: String(item.id || `bt_${idx + 1}`),
      devoteeName: item.devoteeName.trim(),
      birthYear: String(item.birthYear || '').trim(),
      familyNote: String(item.familyNote || '').trim(),
      categoryId: BLESSING_TOWER_CATEGORIES.some((c) => c.id === item.categoryId)
        ? item.categoryId
        : 'gia_dao_binh_an',
      wishText: String(item.wishText || '').trim(),
      tier: Math.max(1, Math.min(13, Number(item.tier) || ((idx % 13) + 1))),
      slotNumber: Math.max(1, Math.min(108, Number(item.slotNumber) || (idx + 1))),
      dateKey: String(item.dateKey || '2026-05-18'),
      isUserOwned: Boolean(item.isUserOwned)
    }));

  return {
    totalCapacity: 108,
    tiersCount: 13,
    entries,
    lastRegisteredId: saved?.lastRegisteredId || null
  };
}

export function registerBlessingTowerPrayer(currentState, payload = {}, date = new Date()) {
  const baseState = createBlessingTowerState(currentState);
  const devoteeName = String(payload.devoteeName || '').trim();
  if (devoteeName.length < 2) {
    return {
      ok: false,
      reason: 'missing_name',
      state: baseState,
      message: 'Cô bác vui lòng nhập Họ tên hoặc Pháp danh để ghi vào Tháp Đèn Cầu An nhé.'
    };
  }

  const category =
    BLESSING_TOWER_CATEGORIES.find((c) => c.id === payload.categoryId) || BLESSING_TOWER_CATEGORIES[0];
  const birthYearRaw = String(payload.birthYear || '').trim();
  const birthYear = /^\d{4}$/.test(birthYearRaw) ? birthYearRaw : '';
  const familyNote = String(payload.familyNote || '').trim().slice(0, 90);
  const wishInput = String(payload.wishText || '').trim();
  const wishText = (wishInput || category.blessingVerse).slice(0, 220);

  const usedSlots = new Set(baseState.entries.map((e) => Number(e.slotNumber)));
  let slotNumber = 1;
  for (let s = 1; s <= 108; s++) {
    if (!usedSlots.has(s)) {
      slotNumber = s;
      break;
    }
  }
  const tier = ((slotNumber - 1) % 13) + 1;
  const dateKey = getLocalDateKey(date instanceof Date ? date : new Date(date));
  const entry = {
    id: `bt_user_${Date.now()}_${slotNumber}`,
    devoteeName: devoteeName.slice(0, 72),
    birthYear,
    familyNote,
    categoryId: category.id,
    wishText,
    tier,
    slotNumber,
    dateKey,
    isUserOwned: true
  };

  const nextEntries = [entry, ...baseState.entries].slice(0, 108);
  const nextState = {
    ...baseState,
    entries: nextEntries,
    lastRegisteredId: entry.id
  };

  return {
    ok: true,
    entry,
    category,
    state: nextState,
    rewardLotus: 25,
    rewardXp: 20,
    message: `Đã thắp sáng Ô Đèn #${slotNumber} (Tầng ${tier}/13) cầu nguyện "${category.label}" cho ${entry.devoteeName}.`
  };
}

export function mergeBlessingTowerEntries(localEntries = [], cloudEntries = []) {
  const map = new Map();
  const ingest = (list, fromCloud) => {
    if (!Array.isArray(list)) return;
    for (const raw of list) {
      if (!raw || typeof raw.devoteeName !== 'string' || !raw.devoteeName.trim()) continue;
      const id = String(raw.id || `bt_${raw.slotNumber || 0}_${raw.devoteeName.trim()}`);
      const prev = map.get(id);
      const entry = {
        id,
        devoteeName: raw.devoteeName.trim().slice(0, 72),
        birthYear: String(raw.birthYear || '').trim().slice(0, 4),
        familyNote: String(raw.familyNote || '').trim().slice(0, 90),
        categoryId: BLESSING_TOWER_CATEGORIES.some((c) => c.id === raw.categoryId)
          ? raw.categoryId
          : 'gia_dao_binh_an',
        wishText: String(raw.wishText || '').trim().slice(0, 220),
        tier: Math.max(1, Math.min(13, Number(raw.tier) || 1)),
        slotNumber: Math.max(1, Math.min(108, Number(raw.slotNumber) || 1)),
        dateKey: String(raw.dateKey || '2026-05-18'),
        createdAt: String(raw.createdAt || ''),
        isUserOwned: Boolean(prev?.isUserOwned || raw.isUserOwned),
        syncedCloud: Boolean(fromCloud || prev?.syncedCloud || raw.syncedCloud)
      };
      map.set(id, entry);
    }
  };

  ingest(cloudEntries, true);
  ingest(localEntries, false);

  const merged = Array.from(map.values()).sort((a, b) => {
    if (a.isUserOwned !== b.isUserOwned) return a.isUserOwned ? -1 : 1;
    const tA = a.createdAt || a.dateKey || '';
    const tB = b.createdAt || b.dateKey || '';
    return tB.localeCompare(tA);
  });

  return merged.slice(0, 108);
}

export function filterBlessingTowerEntries(entries = [], query = '') {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return Array.isArray(entries) ? entries : [];
  return (Array.isArray(entries) ? entries : []).filter((e) => {
    const hay = `${e.devoteeName || ''} ${e.familyNote || ''} ${e.wishText || ''} #${e.slotNumber || ''}`.toLowerCase();
    return hay.includes(q);
  });
}

