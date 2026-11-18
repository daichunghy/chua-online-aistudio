/**
 * Studio UGC (nền, tư thế, bài đăng) và bảng màu OKLCH.
 * (Tách từ chua-online-logic.mjs — import từ '/src/logic/chua-online-logic.mjs' vẫn dùng được.)
 */

/**
 * Photo Memory Framing at Chùa Vĩnh Tràng
 */
export const UGC_BACKDROPS = [
  {
    id: 'chanh_dien_mat_tien',
    name: 'Mặt tiền Chánh điện Vĩnh Tràng',
    src: '/public/assets/aistudio/image_dbddfac8.png',
    captionTag: 'Chánh điện Chùa Vĩnh Tràng · Mỹ Tho, Tiền Giang'
  },
  {
    id: 'cua_hang_luu_niem_go',
    name: 'Quầy gỗ Cửa hàng lưu niệm',
    src: '/public/assets/aistudio/image_43ca3fb3.png',
    captionTag: 'Quầy lưu niệm Chùa Vĩnh Tràng'
  },
  {
    id: 'giang_duong_phat_phap',
    name: 'Gian gỗ Giảng đường',
    src: '/public/assets/aistudio/image_dc0ddf04.png',
    captionTag: 'Giảng đường Chùa Vĩnh Tràng'
  },
  {
    id: 'khuon_vien_3_nhan_vat',
    name: 'Sân chùa & Gia đình đi lễ',
    src: '/Thiết kế giao diện/Nhân vật 3D/anh-xem-truoc-3d-all-nguoi-that.png',
    captionTag: 'Kỷ niệm đi chùa Vĩnh Tràng'
  }
];

export const UGC_POSES = [
  { id: 'chap_tay_le_phat', label: 'Chắp tay lễ Phật', propLabel: 'Tràng hạt gỗ' },
  { id: 'dang_hoa_sen', label: 'Dâng hoa sen', propLabel: 'Sen hồng Mỹ Tho' },
  { id: 'doi_non_deo_tui', label: 'Đội nón lá & Túi sen', propLabel: 'Nón lá lụa' },
  { id: 'cam_den_hoa_dang', label: 'Nâng đèn hoa đăng', propLabel: 'Đèn hoa sen' }
];

export const INITIAL_UGC_GALLERY = [
  {
    id: 'ugc_seed_1',
    author: 'Gia đình cô Tư – Mỹ Tho',
    charMode: 'family_3',
    backdropId: 'chanh_dien_mat_tien',
    poseId: 'chap_tay_le_phat',
    wishText: 'Cuối tuần cả nhà ghé Chùa Vĩnh Tràng lễ Phật, cầu ông bà mạnh khỏe, con cháu học hành chăm ngoan.',
    likes: 42,
    createdAt: 'Hôm nay · Mỹ Tho, Tiền Giang'
  },
  {
    id: 'ugc_seed_2',
    author: 'Chị Ngọc Liên',
    charMode: 'nu',
    backdropId: 'cua_hang_luu_niem_go',
    poseId: 'doi_non_deo_tui',
    wishText: 'Thỉnh được cuốn Sổ tay hoa sen và Tràng hạt gỗ Bồ Đề làm quà biếu mẹ.',
    likes: 31,
    createdAt: 'Hôm nay · Chùa Vĩnh Tràng'
  },
  {
    id: 'ugc_seed_3',
    author: 'Chú Minh Hải (Cần Thơ)',
    charMode: 'nam',
    backdropId: 'giang_duong_phat_phap',
    poseId: 'dang_hoa_sen',
    wishText: 'Sáng mở trang đọc lời Phật dạy và nghe một đoạn pháp âm thấy lòng dịu hẳn.',
    likes: 27,
    createdAt: 'Hôm qua · Giảng đường'
  }
];

export function createUGCPost(payload = {}) {
  const author = String(payload.author || 'Khách viếng chùa').trim() || 'Khách viếng chùa';
  const charMode = payload.charMode || 'family_3';
  const backdropId = payload.backdropId || 'chanh_dien_mat_tien';
  const poseId = payload.poseId || 'chap_tay_le_phat';
  const milestoneBadge =
    String(payload.milestoneBadge || 'Kỷ niệm viếng Chùa Vĩnh Tràng').trim();
  const userPhotoUploaded = Boolean(payload.userPhotoUploaded);
  const frameStyle = payload.frameStyle || 'lotus_arch';
  const wishText =
    String(payload.wishText || '').trim() ||
    'Kính lễ Tam Bảo tại Chùa Vĩnh Tràng — Cầu gia đình bình an, mạnh khỏe.';

  return {
    id: `ugc_${Date.now()}`,
    author,
    charMode,
    backdropId,
    poseId,
    milestoneBadge,
    userPhotoUploaded,
    frameStyle,
    wishText,
    dataUrl: payload.dataUrl || null,
    likes: 1,
    createdAt: 'Vừa xong · Chùa Vĩnh Tràng'
  };
}

/**
 * Perceptual OKLab / OKLCH Color Engine (inspired by meodai/skill.color-expert)
 * Ensures perceptually uniform Lightness (L), Chroma (C), and Hue (H) transformations
 * with Bezold-Brücke sunlit warmth & cool sky-bounce shadow compensation (zero muddy mid-tones).
 */
export function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function linearToSrgb(c) {
  const clamped = Math.max(0, Math.min(1, c));
  return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
}

export function hexToOklch(hexStr) {
  const clean = String(hexStr || '#000000').replace(/^#/, '');
  const num = parseInt(clean.length === 3 ? clean.replace(/(.)/g, '$1$1') : clean, 16) || 0;
  const r = srgbToLinear(((num >> 16) & 255) / 255);
  const g = srgbToLinear(((num >> 8) & 255) / 255);
  const b = srgbToLinear((num & 255) / 255);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const C = Math.hypot(A, B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L: Number(L.toFixed(4)), C: Number(C.toFixed(4)), H: Number(H.toFixed(2)) };
}

export function oklchToHex(L, C, H) {
  const hRad = ((H || 0) * Math.PI) / 180;
  const A = C * Math.cos(hRad);
  const B = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * A + 0.2158037573 * B;
  const m_ = L - 0.1055613458 * A - 0.0638541728 * B;
  const s_ = L - 0.0894841775 * A - 1.291485548 * B;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r = linearToSrgb(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const g = linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const b = linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);

  const toByte = (v) =>
    Math.round(Math.max(0, Math.min(255, v * 255)))
      .toString(16)
      .padStart(2, '0');
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`.toUpperCase();
}

export function shiftOklch(hexStr, dL = 0, scaleC = 1.0, dH = 0) {
  const { L, C, H } = hexToOklch(hexStr);
  const nextL = Math.max(0.08, Math.min(0.98, L + dL));
  // Gamut cusp protection: reduce chroma near extreme lightness (L < 0.2 or L > 0.92)
  const cuspFactor = nextL > 0.9 ? (1 - nextL) / 0.1 : nextL < 0.18 ? nextL / 0.18 : 1;
  const nextC = Math.max(0, Math.min(0.32, C * scaleC * Math.max(0.35, cuspFactor)));
  const nextH = (H + dH + 360) % 360;
  return oklchToHex(nextL, nextC, nextH);
}

export const VINH_TRANG_OKLCH_PALETTE = {
  skyZenith: oklchToHex(0.49, 0.195, 256),       // Cobalt sky zenith (#0155C9 perceptual lock)
  skyHorizon: oklchToHex(0.68, 0.145, 250),      // Luminous horizon blue (#4F97F9)
  goldFacadeSun: oklchToHex(0.76, 0.128, 78),    // Warm sunlit Chánh điện ochre-gold (#E0AA42)
  goldFacadeShade: oklchToHex(0.64, 0.112, 72),  // Perceptually rich warm shade (#B9852F, never gray!)
  vermilionColumn: oklchToHex(0.42, 0.138, 28),  // Lacquered vermilion red column (#862820)
  terracottaTile: oklchToHex(0.48, 0.098, 38),   // Southern clay roof tile (#834332)
  lotusThroneBlue: oklchToHex(0.59, 0.078, 232), // A Di Đà lotus throne azure (#4E86A8)
  jadeFoliageSun: oklchToHex(0.58, 0.115, 136),  // Sunlit bonsai crown (#5C8A46)
  jadeFoliageDeep: oklchToHex(0.44, 0.095, 142), // Shaded foliage (#365E2E, shifted cool-green)
  lotusPink: oklchToHex(0.73, 0.148, 352)        // Sacred lotus petal pink (#EE7FAE)
};
