/**
 * Hiện diện cộng đồng trực tuyến (Visitor Counter) — logic thuần không DOM.
 * Server là nguồn chân lý duy nhất cho danh sách khách đang viếng chùa.
 */

const VALID_ZONES = new Set(['Sân chùa', 'Chánh điện', 'Giảng đường', 'Cửa hàng']);

const CHAR_LABELS = {
  nu: 'Phật tử Nữ',
  nam: 'Phật tử Nam',
  tre_em: 'Em nhỏ',
  nu_ao_lam: 'Nữ Áo Lam',
  nam_ao_nau: 'Nam Áo Nâu',
  du_khach: 'Du khách',
  su_thay: 'Sư Thầy'
};

const NAT_FLAGS = {
  vn: '🇻🇳',
  jp: '🇯🇵',
  kr: '🇰🇷',
  tw: '🇹🇼',
  th: '🇹🇭',
  intl: '🌏'
};

export function createVisitorClientId(randomFn = Math.random, nowFn = Date.now) {
  const ts = Number(nowFn()).toString(36);
  const rand = Math.floor(Number(randomFn()) * 1e9)
    .toString(36)
    .padStart(6, '0');
  return `vt_${ts}_${rand}`;
}

export function sanitizeVisitorPayload(input = {}) {
  const src = input && typeof input === 'object' ? input : {};
  const rawId = String(src.clientId || '').trim();
  const clientId = /^[a-zA-Z0-9_-]{4,64}$/.test(rawId) ? rawId : createVisitorClientId();
  const rawNat = String(src.nationalityId || 'vn').trim().toLowerCase();
  const nationalityId = Object.prototype.hasOwnProperty.call(NAT_FLAGS, rawNat) ? rawNat : 'vn';
  const rawChar = String(src.characterModelKey || 'nu').trim();
  const characterModelKey = Object.prototype.hasOwnProperty.call(CHAR_LABELS, rawChar) ? rawChar : 'nu';
  const rawZone = String(src.zone || 'Sân chùa').trim();
  const zone = VALID_ZONES.has(rawZone) ? rawZone : 'Sân chùa';
  return {
    clientId,
    nationalityId,
    characterModelKey,
    zone
  };
}

export function formatVisitorCountText(count = 1) {
  const safeCount = Math.max(1, Math.round(Number(count || 1)));
  return {
    countText: String(safeCount),
    labelText: 'đang viếng chùa',
    compactAriaLabel: `${safeCount} người đang trực tuyến viếng Chùa Vĩnh Tràng`
  };
}

export function buildVisitorPresenceSummary(snapshot = {}, selfClientId = '') {
  const onlineCount = Math.max(1, Math.round(Number(snapshot?.onlineCount || 1)));
  const todayVisits = Math.max(onlineCount, Math.round(Number(snapshot?.todayVisits || onlineCount)));
  const rawVisitors = Array.isArray(snapshot?.visitors) ? snapshot.visitors : [];

  const items = rawVisitors.map((v) => {
    const clean = sanitizeVisitorPayload(v);
    const isSelf = Boolean(selfClientId && clean.clientId === selfClientId);
    return {
      clientId: clean.clientId,
      isSelf,
      flag: NAT_FLAGS[clean.nationalityId] || '🇻🇳',
      roleLabel: CHAR_LABELS[clean.characterModelKey] || 'Phật tử',
      zone: clean.zone
    };
  });

  items.sort((a, b) => (a.isSelf === b.isSelf ? 0 : a.isSelf ? -1 : 1));

  return {
    onlineCount,
    todayVisits,
    ...formatVisitorCountText(onlineCount),
    visitors: items
  };
}
