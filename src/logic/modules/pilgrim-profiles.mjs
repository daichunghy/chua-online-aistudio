/**
 * Quốc tịch & chế độ hành hương.
 * (Tách từ chua-online-logic.mjs — import từ '/src/logic/chua-online-logic.mjs' vẫn dùng được.)
 */

// ============================================================================
// 2. NATIONALITY & PILGRIMAGE PURPOSE / COMPANION MODE
// ============================================================================
export const NATIONALITY_PROFILES = [
  {
    id: 'vn',
    name: 'Việt Nam — Hành hương Bản xứ',
    flag: '🇻🇳',
    greeting: 'A Di Đà Phật! Kính chào quý Phật tử phương Nam ghé thăm Chùa Vĩnh Tràng Mỹ Tho.',
    accentHex: '#B84518',
    badgeLabel: 'Hành hương Bản xứ',
    preferredCharKey: 'nu'
  },
  {
    id: 'jp',
    name: 'Nhật Bản — Thiền tông & Trà đạo',
    flag: '🇯🇵',
    greeting: 'Gassho! Chào mừng hành giả Nhật Bản đến thưởng trà thiền và tịnh tâm tại cổ tự Vĩnh Tràng.',
    accentHex: '#2F6F5E',
    badgeLabel: 'Thiền tông · Trà đạo',
    preferredCharKey: 'nu_ao_lam'
  },
  {
    id: 'kr',
    name: 'Hàn Quốc — Hoa Nghiêm Tịnh Độ',
    flag: '🇰🇷',
    greeting: 'Seongbul-haseyo! Kính đón Phật tử Hàn Quốc cùng lễ Tam Bảo và chiêm bái Bảo Tháp 7 tầng.',
    accentHex: '#3B679E',
    badgeLabel: 'Hoa Nghiêm · Tịnh Độ',
    preferredCharKey: 'nam'
  },
  {
    id: 'tw',
    name: 'Đài Loan / Hoa Ngữ — Từ Tế Công Đức',
    flag: '🇹🇼',
    greeting: 'O-mi-tô-phật! Hoan hỷ đón quý thiện tín Đài Loan & Hoa ngữ về nguồn kết duyên công đức.',
    accentHex: '#9C5C24',
    badgeLabel: 'Từ Tế · Công Đức',
    preferredCharKey: 'nam_ao_nau'
  },
  {
    id: 'th',
    name: 'Thái Lan — Theravada Chánh Niệm',
    flag: '🇹🇭',
    greeting: 'Sawadee & Namo Buddhaya! Kính mời hành giả Thái Lan dạo bước chánh niệm dưới cội Bồ Đề Lâm Tỳ Ni.',
    accentHex: '#C9962E',
    badgeLabel: 'Theravada · Chánh Niệm',
    preferredCharKey: 'su_thay'
  },
  {
    id: 'intl',
    name: 'Quốc tế — Du khách Khám phá Di sản',
    flag: '🌍',
    greeting: 'Welcome to Vĩnh Tràng Pagoda! Khám phá di sản kiến trúc Á – Âu gần 200 năm tuổi tại Mỹ Tho.',
    accentHex: '#5C381F',
    badgeLabel: 'Di sản Á – Âu',
    preferredCharKey: 'du_khach'
  }
];

export function getNationalityProfile(nationalityId = 'vn') {
  return NATIONALITY_PROFILES.find((n) => n.id === nationalityId) || NATIONALITY_PROFILES[0];
}

export const PILGRIMAGE_MODES = [
  {
    id: 'solo',
    name: 'Đi một mình — Tĩnh tâm vãng cảnh',
    desc: 'Một mình thong dong dạo sân gạch, lắng nghe tiếng chuông ngân và thực tập chánh niệm sâu.',
    arrivalVehicle: 'sedan',
    companions: []
  },
  {
    id: 'family_3gen',
    name: 'Gia đình 3 thế hệ — Đạo Hiếu sum vầy',
    desc: 'Cùng Bà/Mẹ và Bé An đi xe gia đình về chùa thắp hương cầu bình an, nuôi dưỡng đạo hiếu cho con trẻ.',
    arrivalVehicle: 'van',
    companions: [
      {
        charKey: 'nu_ao_lam',
        roleLabel: 'Bà / Mẹ hiền',
        tint: '#9A8F99',
        hat: 'non_la_theu_sen',
        bag: 'tui_vai_theu_sen',
        offset: { x: -1.65, z: 1.1 }
      },
      {
        charKey: 'tre_em',
        roleLabel: 'Bé An (Cháu ngoan)',
        tint: '#8B9BB4',
        hat: null,
        bag: null,
        offset: { x: 1.45, z: 0.9 }
      }
    ]
  },
  {
    id: 'tour_group',
    name: 'Đoàn hành hương — Xe khách 45 chỗ & Hướng dẫn viên bản tự',
    desc: 'Đi theo đoàn hành hương thập phương với xe 45 chỗ, nghe thuyết minh lịch sử Chùa Vĩnh Tràng 1849.',
    arrivalVehicle: 'bus',
    companions: [
      {
        charKey: 'su_thay',
        roleLabel: 'Hướng dẫn viên bản tự',
        tint: '#D9A441',
        hat: null,
        bag: null,
        offset: { x: 1.9, z: -0.9 }
      },
      {
        charKey: 'nam_ao_nau',
        roleLabel: 'Trưởng đoàn Phật tử',
        tint: '#7A543E',
        hat: 'non_la_theu_sen',
        bag: 'tui_vai_theu_sen',
        offset: { x: -1.9, z: 1.2 }
      },
      {
        charKey: 'nu',
        roleLabel: 'Đồng tu trong đoàn',
        tint: '#9A8F99',
        hat: null,
        bag: 'tui_vai_theu_sen',
        offset: { x: 2.1, z: 1.4 }
      }
    ]
  },
  {
    id: 'explorer',
    name: 'Khách tham quan văn hóa — Khám phá kiến trúc Á-Âu',
    desc: 'Hành trình du khảo thong dong một mình tìm hiểu 13 vòm cửa Á – Âu, Thập Bát La Hán gỗ mít 1907 và 3 pho đại tượng.',
    arrivalVehicle: 'sedan',
    companions: []
  }
];

export function getPilgrimageMode(modeId = 'solo') {
  return PILGRIMAGE_MODES.find((m) => m.id === modeId) || PILGRIMAGE_MODES[0];
}
