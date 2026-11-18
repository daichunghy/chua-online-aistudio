/**
 * Lộ trình 30 ngày, lịch âm, hoa đăng, nhật ký an tâm.
 * (Tách từ chua-online-logic.mjs — import từ '/src/logic/chua-online-logic.mjs' vẫn dùng được.)
 */
import { getLocalDateKey } from './daily-dharma.mjs';
import { NATIONALITY_PROFILES } from './pilgrim-profiles.mjs';

// ============================================================================
// 3. 30-DAY NON-BORING SPIRITUAL LOOP (Journey Plan, Lunar Calendar,
//    Hoa Dang Lanterns & Dharma Journal)
// ============================================================================
export const THIRTY_DAY_RETREATS = [
  {
    id: 'week_1',
    week: 1,
    dayRange: [1, 7],
    title: 'Tuần 1: Gieo Duyên Tam Bảo',
    subtitle: 'Ngày 1–7 · Quay về nương tựa Phật – Pháp – Tăng giữa không gian cổ tự miền Tây'
  },
  {
    id: 'week_2',
    week: 2,
    dayRange: [8, 14],
    title: 'Tuần 2: Sống An Giữa Đời',
    subtitle: 'Ngày 8–14 · Giữ chánh niệm trong hơi thở, tách trà và từng bước chân đi đứng'
  },
  {
    id: 'week_3',
    week: 3,
    dayRange: [15, 21],
    title: 'Tuần 3: Từ Bi & Hiếu Hạnh',
    subtitle: 'Ngày 15–21 · Nuôi dưỡng lòng biết ơn cha mẹ, nói lời hòa ái và sẻ chia công đức'
  },
  {
    id: 'week_4',
    week: 4,
    dayRange: [22, 30],
    title: 'Tuần 4: Trí Tuệ & Viên Mãn',
    subtitle: 'Ngày 22–30 · Quán chiếu vô thường, chuyển hóa phiền não và hồi hướng viên mãn'
  }
];

export const THIRTY_DAY_JOURNEY_PLAN = [
  // Tuần 1: Gieo Duyên Tam Bảo (Ngày 1-7)
  {
    day: 1,
    week: 1,
    retreatId: 'week_1',
    retreatTitle: 'Tuần 1: Gieo Duyên Tam Bảo',
    title: 'Bước qua Cổng Tam Quan bằng bước chân thong thả',
    prompt: 'Sáng nay mình tạm gác bộn bề ngoài kia, qua Cổng Phụ Tịnh Độ với một nụ cười nhẹ và ba hơi thở êm.',
    suggestedStation: 'cong_tam_quan',
    rewardLotus: 35,
    rewardGems: 2,
    rewardXp: 25,
    milestoneBadge: null
  },
  {
    day: 2,
    week: 1,
    retreatId: 'week_1',
    retreatTitle: 'Tuần 1: Gieo Duyên Tam Bảo',
    title: 'Ba nén tâm hương trước mặt tiền 13 vòm',
    prompt: 'Khi phẩy nhẹ cho tắt ngọn lửa nơi đầu nhang, mình thầm gửi một lời chúc bình an cho cả nhà.',
    suggestedStation: 'lu_huong_san',
    rewardLotus: 35,
    rewardGems: 2,
    rewardXp: 25,
    milestoneBadge: null
  },
  {
    day: 3,
    week: 1,
    retreatId: 'week_1',
    retreatTitle: 'Tuần 1: Gieo Duyên Tam Bảo',
    title: 'Tam Bái tại Chánh điện Chữ Quốc',
    prompt: 'Cúi đầu lạy ba lạy giữa mùi gỗ mít và hương trầm thoang thoảng, nhắc lòng nhớ ơn Phật, Pháp, Tăng.',
    suggestedStation: 'chanh_dien',
    rewardLotus: 40,
    rewardGems: 3,
    rewardXp: 30,
    milestoneBadge: null
  },
  {
    day: 4,
    week: 1,
    retreatId: 'week_1',
    retreatTitle: 'Tuần 1: Gieo Duyên Tam Bảo',
    title: 'Lắng nghe bài pháp ngắn nơi Giảng đường gỗ',
    prompt: 'Dành 10 phút yên ả ở Giảng đường phía Đông, đọc chậm một đoạn sách như uống ngụm nước dừa mát.',
    suggestedStation: 'giang_duong',
    rewardLotus: 40,
    rewardGems: 3,
    rewardXp: 30,
    milestoneBadge: null
  },
  {
    day: 5,
    week: 1,
    retreatId: 'week_1',
    retreatTitle: 'Tuần 1: Gieo Duyên Tam Bảo',
    title: 'Đóa sen hồng bên Hồ Cá Koi',
    prompt: 'Nhìn bầy cá Koi bơi khoan thai dưới tán lá súng, thấy lòng mình cũng rộng mở và dịu lại.',
    suggestedStation: 'ho_sen_ca_koi',
    rewardLotus: 45,
    rewardGems: 3,
    rewardXp: 30,
    milestoneBadge: null
  },
  {
    day: 6,
    week: 1,
    retreatId: 'week_1',
    retreatTitle: 'Tuần 1: Gieo Duyên Tam Bảo',
    title: 'Ngước nhìn Đức Phật A Di Đà giữa nắng mai',
    prompt: 'Đứng dưới đài sen cao 25m, lần nhẹ 21 hạt chuỗi niệm danh hiệu A Di Đà cho nhịp thở đều đặn.',
    suggestedStation: 'phat_adida',
    rewardLotus: 50,
    rewardGems: 4,
    rewardXp: 35,
    milestoneBadge: null
  },
  {
    day: 7,
    week: 1,
    retreatId: 'week_1',
    retreatTitle: 'Tuần 1: Gieo Duyên Tam Bảo',
    title: 'Tròn 7 ngày sơ tâm — Hoa sen đầu mùa nở rộ',
    prompt: 'Hoàn tất tuần đầu tiên gieo duyên Tam Bảo: giữ một lời hứa nhỏ sống hiền hòa suốt tuần mới.',
    suggestedStation: 'chanh_dien',
    rewardLotus: 80,
    rewardGems: 8,
    rewardXp: 55,
    milestoneBadge: 'Ấn Ký Tuần 1 · Sơ Tâm Thanh Tịnh'
  },

  // Tuần 2: Sống An Giữa Đời (Ngày 8-14)
  {
    day: 8,
    week: 2,
    retreatId: 'week_2',
    retreatTitle: 'Tuần 2: Sống An Giữa Đời',
    title: 'Quét lá Bồ Đề sân gạch buổi sớm',
    prompt: 'Quét sạch một góc sân chùa cũng là quét nhẹ bụi lo toan bám víu trong tâm trí từ hôm qua.',
    suggestedStation: 'vuon_lam_ty_ni',
    rewardLotus: 40,
    rewardGems: 3,
    rewardXp: 30,
    milestoneBadge: null
  },
  {
    day: 9,
    week: 2,
    retreatId: 'week_2',
    retreatTitle: 'Tuần 2: Sống An Giữa Đời',
    title: 'Chén trà sen ấm tại Lầu Trà Thiền',
    prompt: 'Nâng chén trà bằng hai tay, nghe mùi hương sen quyện gió sông Tiền mà không vội xem điện thoại.',
    suggestedStation: 'lau_tra_thien',
    rewardLotus: 45,
    rewardGems: 3,
    rewardXp: 30,
    milestoneBadge: null
  },
  {
    day: 10,
    week: 2,
    retreatId: 'week_2',
    retreatTitle: 'Tuần 2: Sống An Giữa Đời',
    title: 'Buông hai chiếc va-li quá khứ và tương lai',
    prompt: 'Ngồi yên trên bồ đoàn theo lời Thiền sư Ajahn Brahm: đặt hết chuyện cũ và nỗi lo mai xuống đất.',
    suggestedStation: 'giang_duong',
    rewardLotus: 45,
    rewardGems: 3,
    rewardXp: 35,
    milestoneBadge: null
  },
  {
    day: 11,
    week: 2,
    retreatId: 'week_2',
    retreatTitle: 'Tuần 2: Sống An Giữa Đời',
    title: 'Một tiếng Đại Hồng Chung lắng dịu',
    prompt: 'Thỉnh một hồi chuông chậm rãi nơi lầu Tây Bắc, nghe dư âm ngân dài cho tới khi tâm hoàn toàn tĩnh lặng.',
    suggestedStation: 'thap_chuong_dai_hong',
    rewardLotus: 50,
    rewardGems: 4,
    rewardXp: 35,
    milestoneBadge: null
  },
  {
    day: 12,
    week: 2,
    retreatId: 'week_2',
    retreatTitle: 'Tuần 2: Sống An Giữa Đời',
    title: 'Bữa cơm chay thanh đạm bên Nhà Sàn Gỗ',
    prompt: 'Biết ơn hạt gạo đồng bằng sông Cửu Long, ăn chậm nhai kỹ để thấy đủ đầy trong từng miếng cơm chay.',
    suggestedStation: 'nha_san_trai_duong',
    rewardLotus: 50,
    rewardGems: 4,
    rewardXp: 35,
    milestoneBadge: null
  },
  {
    day: 13,
    week: 2,
    retreatId: 'week_2',
    retreatTitle: 'Tuần 2: Sống An Giữa Đời',
    title: 'Chăm luống hoa vườn Lâm Tỳ Ni',
    prompt: 'Tưới nước cho gốc Bồ Đề non và cây Sa La, học cách kiên nhẫn chờ hạt lành nảy mầm từng ngày.',
    suggestedStation: 'vuon_lam_ty_ni',
    rewardLotus: 55,
    rewardGems: 4,
    rewardXp: 40,
    milestoneBadge: null
  },
  {
    day: 14,
    week: 2,
    retreatId: 'week_2',
    retreatTitle: 'Tuần 2: Sống An Giữa Đời',
    title: 'Tròn 14 ngày An Trú — Tâm như mặt hồ phẳng lặng',
    prompt: 'Hai tuần giữ nhịp sống chậm: ghi lại vào Nhật Ký An Tâm một thay đổi nhỏ khiến mình thấy nhẹ lòng nhất.',
    suggestedStation: 'ho_phong_sinh',
    rewardLotus: 90,
    rewardGems: 9,
    rewardXp: 60,
    milestoneBadge: 'Ấn Ký Tuần 2 · An Trú Hiện Tại'
  },

  // Tuần 3: Từ Bi & Hiếu Hạnh (Ngày 15-21)
  {
    day: 15,
    week: 3,
    retreatId: 'week_3',
    retreatTitle: 'Tuần 3: Từ Bi & Hiếu Hạnh',
    title: 'Gọi về hỏi thăm cha mẹ đầu buổi sáng',
    prompt: 'Cha mẹ là hai vị Phật tại gia. Hôm nay mình nói một câu dịu dàng hoặc pha cho người thân ly trà ấm.',
    suggestedStation: 'hau_to_nha_to',
    rewardLotus: 50,
    rewardGems: 4,
    rewardXp: 35,
    milestoneBadge: null
  },
  {
    day: 16,
    week: 3,
    retreatId: 'week_3',
    retreatTitle: 'Tuần 3: Từ Bi & Hiếu Hạnh',
    title: 'Học nụ cười hoan hỷ của Đức Phật Di Lặc',
    prompt: 'Đứng trước tượng Di Lặc 20m, tập mở rộng lòng bao dung để bỏ qua một chuyện lặt vặt làm mình bực bội.',
    suggestedStation: 'phat_di_lac',
    rewardLotus: 50,
    rewardGems: 4,
    rewardXp: 35,
    milestoneBadge: null
  },
  {
    day: 17,
    week: 3,
    retreatId: 'week_3',
    retreatTitle: 'Tuần 3: Từ Bi & Hiếu Hạnh',
    title: 'Lắng nghe sâu trước Động Quán Thế Âm',
    prompt: 'Nghe tiếng thác nước non bộ đổ xuống hồ xanh, tập lắng nghe người thân nói hết câu mà không vội cãi lại.',
    suggestedStation: 'non_bo_quan_am',
    rewardLotus: 55,
    rewardGems: 4,
    rewardXp: 40,
    milestoneBadge: null
  },
  {
    day: 18,
    week: 3,
    retreatId: 'week_3',
    retreatTitle: 'Tuần 3: Từ Bi & Hiếu Hạnh',
    title: 'Thả đèn hoa đăng cầu bình an cho người thương',
    prompt: 'Viết một lời chúc hiền hòa lên đèn hoa đăng thả trôi trên mặt hồ sen lung linh.',
    suggestedStation: 'ho_sen_ca_koi',
    rewardLotus: 55,
    rewardGems: 5,
    rewardXp: 40,
    milestoneBadge: null
  },
  {
    day: 19,
    week: 3,
    retreatId: 'week_3',
    retreatTitle: 'Tuần 3: Từ Bi & Hiếu Hạnh',
    title: 'Tùy hỷ niềm vui của đồng tu phương xa',
    prompt: 'Ghé xem ảnh lưu niệm của cô bác thập phương và gửi một lời chúc hoan hỷ chân thành.',
    suggestedStation: 'cua_hang_luu_niem',
    rewardLotus: 55,
    rewardGems: 5,
    rewardXp: 40,
    milestoneBadge: null
  },
  {
    day: 20,
    week: 3,
    retreatId: 'week_3',
    retreatTitle: 'Tuần 3: Từ Bi & Hiếu Hạnh',
    title: 'Bước qua cầu gỗ chữ Z bên Hồ Phóng Sinh',
    prompt: 'Gieo một nhân lành phóng thích chấp niệm và bảo vệ sự sống quanh mình dù chỉ từ việc nhỏ nhất.',
    suggestedStation: 'ho_phong_sinh',
    rewardLotus: 60,
    rewardGems: 5,
    rewardXp: 45,
    milestoneBadge: null
  },
  {
    day: 21,
    week: 3,
    retreatId: 'week_3',
    retreatTitle: 'Tuần 3: Từ Bi & Hiếu Hạnh',
    title: 'Tròn 21 ngày Bi Mẫn — Ái ngữ sưởi ấm gia đình',
    prompt: 'Ba tuần tu dưỡng tâm từ: đêm nay trước khi ngủ rải tâm từ cầu mọi người ngủ ngon giấc lành.',
    suggestedStation: 'phat_di_lac',
    rewardLotus: 100,
    rewardGems: 10,
    rewardXp: 65,
    milestoneBadge: 'Ấn Ký Tuần 3 · Đạo Hiếu & Tâm Từ'
  },

  // Tuần 4: Trí Tuệ & Viên Mãn (Ngày 22-30)
  {
    day: 22,
    week: 4,
    retreatId: 'week_4',
    retreatTitle: 'Tuần 4: Trí Tuệ & Viên Mãn',
    title: 'Chiêm bái Thập Bát La Hán gỗ mít 1907',
    prompt: 'Nhìn 18 vị La Hán uy nghi mà nhận ra kẻ thù lớn nhất cần hàng phục chính là sự nóng nảy trong lòng mình.',
    suggestedStation: 'chanh_dien',
    rewardLotus: 60,
    rewardGems: 5,
    rewardXp: 45,
    milestoneBadge: null
  },
  {
    day: 23,
    week: 4,
    retreatId: 'week_4',
    retreatTitle: 'Tuần 4: Trí Tuệ & Viên Mãn',
    title: 'Đọc một tích truyện Kinh Pháp Cú',
    prompt: 'Nhắc mình câu kệ "Ý dẫn đầu các pháp, ý làm chủ, ý tạo" trước khi bắt đầu công việc trong ngày.',
    suggestedStation: 'giang_duong',
    rewardLotus: 60,
    rewardGems: 5,
    rewardXp: 45,
    milestoneBadge: null
  },
  {
    day: 24,
    week: 4,
    retreatId: 'week_4',
    retreatTitle: 'Tuần 4: Trí Tuệ & Viên Mãn',
    title: 'Tìm hiểu hai dòng tư liệu cổ tự tại Chánh điện',
    prompt: 'Đối chiếu sử liệu bằng tâm cởi mở, tôn trọng lịch sử và công đức tiền nhân dựng chùa từ năm 1849.',
    suggestedStation: 'chanh_dien',
    rewardLotus: 65,
    rewardGems: 5,
    rewardXp: 50,
    milestoneBadge: null
  },
  {
    day: 25,
    week: 4,
    retreatId: 'week_4',
    retreatTitle: 'Tuần 4: Trí Tuệ & Viên Mãn',
    title: 'Quán chiếu Duyên Khởi dưới Sân Thiên Tỉnh',
    prompt: 'Nhìn ánh nắng giếng trời chiếu xuống hòn non bộ: mọi sự đều nương nhau mà có, nhờ vậy mà biết trân quý nhau hơn.',
    suggestedStation: 'vuon_la_han_ngoai',
    rewardLotus: 65,
    rewardGems: 6,
    rewardXp: 50,
    milestoneBadge: null
  },
  {
    day: 26,
    week: 4,
    retreatId: 'week_4',
    retreatTitle: 'Tuần 4: Trí Tuệ & Viên Mãn',
    title: 'Trọn một vòng chuỗi 108 hạt chuyển hóa phiền não',
    prompt: 'Mỗi hạt qua tay là một lần buông nhẹ sân si, đố kỵ; giữ miệng niệm rõ, tai nghe rõ, tâm an định.',
    suggestedStation: 'phat_adida',
    rewardLotus: 70,
    rewardGems: 6,
    rewardXp: 55,
    milestoneBadge: null
  },
  {
    day: 27,
    week: 4,
    retreatId: 'week_4',
    retreatTitle: 'Tuần 4: Trí Tuệ & Viên Mãn',
    title: 'Tĩnh lặng bên Tượng Phật Nhập Niết Bàn 32m',
    prompt: 'Học hạnh tri túc và an nhiên trước quy luật vô thường của đời người như ngọn gió mát sau vườn chùa.',
    suggestedStation: 'phat_niet_ban',
    rewardLotus: 75,
    rewardGems: 7,
    rewardXp: 55,
    milestoneBadge: null
  },
  {
    day: 28,
    week: 4,
    retreatId: 'week_4',
    retreatTitle: 'Tuần 4: Trí Tuệ & Viên Mãn',
    title: 'Chiêm ngưỡng Bảo Tháp Thất Phật 7 tầng',
    prompt: 'Mỗi tầng tháp nhắc một bước trưởng thành trong Giới – Định – Tuệ suốt gần một tháng kiên trì tu tập.',
    suggestedStation: 'bao_thap_that_phat',
    rewardLotus: 80,
    rewardGems: 8,
    rewardXp: 60,
    milestoneBadge: null
  },
  {
    day: 29,
    week: 4,
    retreatId: 'week_4',
    retreatTitle: 'Tuần 4: Trí Tuệ & Viên Mãn',
    title: 'Tổng kết Sổ Di Sản & Nhật Ký An Tâm',
    prompt: 'Lật xem lại 29 ngày đã qua, gửi lời tri ân chính mình vì đã giữ lòng hướng thiện mỗi ngày.',
    suggestedStation: 'hau_to_nha_to',
    rewardLotus: 90,
    rewardGems: 9,
    rewardXp: 65,
    milestoneBadge: null
  },
  {
    day: 30,
    week: 4,
    retreatId: 'week_4',
    retreatTitle: 'Tuần 4: Trí Tuệ & Viên Mãn',
    title: 'Ngày 30 Viên Mãn — Hồi Hướng Công Đức Khắp Mười Phương',
    prompt: 'Nguyện đem hết thảy công đức 30 ngày tu học này hồi hướng cho ông bà cha mẹ hiện tiền an lạc và muôn loài bình an.',
    suggestedStation: 'phat_niet_ban',
    rewardLotus: 150,
    rewardGems: 15,
    rewardXp: 100,
    milestoneBadge: 'Ấn Ký Viên Mãn 30 Ngày · Liên Hoa Trí Tuệ'
  }
];

export function getThirtyDayTheme(dayNumber = 1) {
  const safeDay = Math.max(1, Math.min(30, Math.round(Number(dayNumber || 1))));
  return THIRTY_DAY_JOURNEY_PLAN.find((d) => d.day === safeDay) || THIRTY_DAY_JOURNEY_PLAN[0];
}

export const LUNAR_FESTIVAL_CALENDAR = [
  {
    id: 'mung_1_soc_vong',
    name: 'Mùng 1 Sóc Vọng — Đầu Tháng Thanh Tịnh',
    lunarDates: ['01/*'],
    greeting: 'Mùng 1 Sóc Vọng hoan hỷ! Thắp nén tâm hương đầu tháng cầu gia đạo bình an, công việc hanh thông.',
    xpMultiplier: 1.3,
    lotusBonus: 30,
    blessingWish: 'Đầu tháng tâm sáng như sen mới nở.',
    accentHex: '#B84518'
  },
  {
    id: 'ram_vong_nguyet',
    name: 'Rằm Vọng Nguyệt — Thả Hoa Đăng Nguyện Ước',
    lunarDates: ['15/*'],
    greeting: 'Trăng rằm Vọng Nguyệt sáng tỏ sân Chùa Vĩnh Tràng! Mời cô bác thả hoa đăng và nghe kinh cầu an.',
    xpMultiplier: 1.4,
    lotusBonus: 45,
    blessingWish: 'Ánh trăng rằm soi dịu mọi ưu tư.',
    accentHex: '#C9962E'
  },
  {
    id: 'via_quan_the_am',
    name: 'Ngày Vía Bồ Tát Quán Thế Âm (19/2 · 19/6 · 19/9 ÂL)',
    lunarDates: ['19/02', '19/06', '19/09'],
    greeting: 'Nam Mô Đại Bi Quán Thế Âm Bồ Tát! Hôm nay ngày vía Quán Âm, nguyện giữ lời ái ngữ và tâm từ bi.',
    xpMultiplier: 1.4,
    lotusBonus: 50,
    blessingWish: 'Tâm từ lắng nghe, bình cam lồ tưới mát gia đình.',
    accentHex: '#2F6F5E'
  },
  {
    id: 'phat_dan',
    name: 'Đại Lễ Phật Đản (Vesak · Rằm Tháng Tư ÂL)',
    lunarDates: ['08/04', '15/04'],
    greeting: 'Kính mừng Đại Lễ Phật Đản! Vườn Lâm Tỳ Ni Chùa Vĩnh Tràng rực rỡ cờ hoa đón mừng Đấng Từ Phụ đản sanh.',
    xpMultiplier: 1.5,
    lotusBonus: 80,
    blessingWish: 'Ánh sáng Từ Bi và Trí Tuệ soi rọi khắp muôn phương.',
    accentHex: '#D9A441'
  },
  {
    id: 'vu_lan_bao_hieu',
    name: 'Đại Lễ Vu Lan Báo Hiếu (Rằm Tháng Bảy ÂL)',
    lunarDates: ['15/07'],
    greeting: 'Mùa Vu Lan Báo Hiếu thiêng liêng! Cài hoa hồng lên áo, cầu nguyện song thân khỏe mạnh bình an.',
    xpMultiplier: 1.5,
    lotusBonus: 80,
    blessingWish: 'Tâm hiếu là tâm Phật, hạnh hiếu là hạnh Phật.',
    accentHex: '#C94B77'
  }
];

export function estimateLunarDayAndMonth(dateObj) {
  const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
  const utcMs = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
  // Reference New Moon: 2026-01-18T19:52Z (approx synodic cycle 29.53058867 days)
  const refNewMoonMs = Date.UTC(2026, 0, 18, 19, 52, 0);
  const synodicMs = 29.53058867 * 86400000;
  const elapsed = utcMs - refNewMoonMs;
  const cycles = Math.floor(elapsed / synodicMs);
  const phaseDays = (elapsed - cycles * synodicMs) / 86400000;
  const lunarDay = Math.max(1, Math.min(30, Math.floor(phaseDays) + 1));
  // Approximate lunar month (~1 month offset from solar calendar in Vietnam)
  const solarMonth = d.getMonth() + 1;
  const approxShift = d.getDate() < 18 ? 2 : 1;
  const lunarMonth = ((solarMonth - approxShift + 11) % 12) + 1;
  return { lunarDay, lunarMonth };
}

export function getTempleSeasonalContext(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const dateKey = getLocalDateKey(d);
  const { lunarDay, lunarMonth } = estimateLunarDayAndMonth(d);

  let activeFestival = null;
  if (lunarMonth === 4 && (lunarDay === 8 || lunarDay === 15)) {
    activeFestival = LUNAR_FESTIVAL_CALENDAR.find((f) => f.id === 'phat_dan');
  } else if (lunarMonth === 7 && lunarDay === 15) {
    activeFestival = LUNAR_FESTIVAL_CALENDAR.find((f) => f.id === 'vu_lan_bao_hieu');
  } else if ([2, 6, 9].includes(lunarMonth) && lunarDay === 19) {
    activeFestival = LUNAR_FESTIVAL_CALENDAR.find((f) => f.id === 'via_quan_the_am');
  } else if (lunarDay === 15) {
    activeFestival = LUNAR_FESTIVAL_CALENDAR.find((f) => f.id === 'ram_vong_nguyet');
  } else if (lunarDay === 1) {
    activeFestival = LUNAR_FESTIVAL_CALENDAR.find((f) => f.id === 'mung_1_soc_vong');
  }

  const daySeed = d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();
  const baseResonance = 136 + (daySeed % 95);
  const festivalBoost = activeFestival ? 140 : 0;
  const xpMultiplier = activeFestival ? activeFestival.xpMultiplier : 1.2;

  return {
    dateKey,
    lunarDay,
    lunarMonth,
    lunarLabel: `Mùng ${lunarDay} tháng ${lunarMonth} ÂL (ước lượng)`,
    isFestivalDay: Boolean(activeFestival),
    activeFestival,
    greeting: activeFestival
      ? activeFestival.greeting
      : `Đạo tràng Chùa Vĩnh Tràng hôm nay thanh tịnh (Mùng ${lunarDay} tháng ${lunarMonth} ÂL). Chúc cô bác thân tâm an lạc · Cộng hưởng tu học ${xpMultiplier}x XP.`,
    xpMultiplier,
    resonanceCount: baseResonance + festivalBoost,
    lanternCountHint: activeFestival ? 24 : 10
  };
}

export const HOA_DANG_WISHES = [
  {
    id: 'hd_seed_1',
    authorName: 'Cô Sáu Mỹ Tho',
    nationalityId: 'vn',
    wishText: 'Cầu cho hai bác mạnh khỏe, con cháu thuận hòa hiếu thảo.',
    colorHex: '#F79D65',
    createdAt: 'Sáng nay · Hồ Sen Vĩnh Tràng',
    pondCoord: { x: 1.8, z: 31.4 }
  },
  {
    id: 'hd_seed_2',
    authorName: 'Anh Minh Trí (Sài Gòn)',
    nationalityId: 'vn',
    wishText: 'Nguyện tâm luôn bình tĩnh sáng suốt giữa công việc bận rộn.',
    colorHex: '#F4C95D',
    createdAt: 'Sáng nay · Hồ Sen Vĩnh Tràng',
    pondCoord: { x: 4.5, z: 34.2 }
  },
  {
    id: 'hd_seed_3',
    authorName: 'Yuki Tanaka',
    nationalityId: 'jp',
    wishText: 'May peace and mindfulness bloom gently like lotus flowers at Vinh Trang.',
    colorHex: '#EE7FAE',
    createdAt: 'Hôm qua · Hồ Phóng Sinh',
    pondCoord: { x: -14.8, z: -54.2 }
  },
  {
    id: 'hd_seed_4',
    authorName: 'Chị Ngọc Hân (Bến Tre)',
    nationalityId: 'vn',
    wishText: 'Hồi hướng công đức đến cửu huyền thất tổ và người thân phương xa.',
    colorHex: '#FF9EBB',
    createdAt: 'Hôm qua · Hồ Sen Vĩnh Tràng',
    pondCoord: { x: 2.9, z: 35.1 }
  },
  {
    id: 'hd_seed_5',
    authorName: 'Ji-hoon Park',
    nationalityId: 'kr',
    wishText: 'Cầu an lành đến muôn loài, cảm ơn vẻ đẹp cổ tự miền Tây.',
    colorHex: '#A8DADC',
    createdAt: '2 ngày trước · Hồ Phóng Sinh',
    pondCoord: { x: -17.2, z: -57.1 }
  },
  {
    id: 'hd_seed_6',
    authorName: 'Bé An & Gia đình',
    nationalityId: 'vn',
    wishText: 'Con chúc ông bà sống lâu trăm tuổi và luôn cười tươi như Phật Di Lặc.',
    colorHex: '#F9B572',
    createdAt: '2 ngày trước · Hồ Sen Vĩnh Tràng',
    pondCoord: { x: 5.1, z: 31.9 }
  }
];

export function createHoaDangLantern(
  wishes = HOA_DANG_WISHES,
  { authorName = 'Phật tử thập phương', nationalityId = 'vn', wishText = '', colorHex = '#F79D65' } = {}
) {
  const list = Array.isArray(wishes) ? [...wishes] : [...HOA_DANG_WISHES];
  const cleanAuthor = String(authorName || '').trim() || 'Phật tử thập phương';
  const cleanNat = NATIONALITY_PROFILES.some((n) => n.id === nationalityId) ? nationalityId : 'vn';
  const cleanWish =
    String(wishText || '').trim() || 'Nguyện cầu gia đình bình an, thân tâm thường an lạc.';
  const cleanColor = /^#[0-9A-Fa-f]{6}$/.test(String(colorHex || '').trim())
    ? String(colorHex).trim().toUpperCase()
    : '#F79D65';

  const idx = list.length;
  const angle = (idx * 2.39996) % (Math.PI * 2);
  const radius = 1.4 + (idx % 4) * 0.65;
  const lantern = {
    id: `hd_${Date.now()}_${idx + 1}`,
    authorName: cleanAuthor,
    nationalityId: cleanNat,
    wishText: cleanWish,
    colorHex: cleanColor,
    createdAt: 'Vừa thả · Hồ Sen Chùa Vĩnh Tràng',
    pondCoord: {
      x: Number((3.5 + Math.cos(angle) * radius).toFixed(2)),
      z: Number((33.0 + Math.sin(angle) * radius).toFixed(2))
    }
  };

  const nextWishes = [lantern, ...list];
  return {
    ok: true,
    lantern,
    wishes: nextWishes,
    totalCount: nextWishes.length,
    message: `Đã thả hoa đăng nguyện ước của ${cleanAuthor} lên Hồ Sen Vĩnh Tràng.`
  };
}

export const DHARMA_JOURNAL_MOODS = [
  { id: 'binh_an', label: 'Bình an', icon: '🪷' },
  { id: 'biet_on', label: 'Biết ơn', icon: '🙏' },
  { id: 'thanh_thoi', label: 'Thảnh thơi', icon: '🌿' },
  { id: 'tinh_tuc', label: 'Tỉnh thức', icon: '🔔' },
  { id: 'hoan_hy', label: 'Hoan hỷ', icon: '☀️' }
];

export const DHARMA_JOURNAL = {
  moods: DHARMA_JOURNAL_MOODS,
  entries: [
    {
      id: 'journal_seed_1',
      text: 'Sáng nay nghe tiếng chuông chùa và uống tách trà sen chậm rãi, thấy mọi lo âu công việc dịu xuống.',
      mood: 'binh_an',
      moodLabel: 'Bình an',
      dateKey: '2026-05-15',
      createdAt: 'Khởi duyên · Nhật Ký An Tâm'
    },
    {
      id: 'journal_seed_2',
      text: 'Biết ơn mẹ đã nấu bữa cơm chay ấm áp cho cả nhà cuối tuần.',
      mood: 'biet_on',
      moodLabel: 'Biết ơn',
      dateKey: '2026-05-16',
      createdAt: 'Ghi chép hiếu hạnh · Nhật Ký An Tâm'
    }
  ]
};

export function createDharmaJournalState(saved = null) {
  const src = saved && typeof saved === 'object' ? saved : {};
  const entries = Array.isArray(src.entries)
    ? src.entries.map((e) => ({ ...e }))
    : DHARMA_JOURNAL.entries.map((e) => ({ ...e }));
  return {
    entries,
    lastUpdatedDateKey: typeof src.lastUpdatedDateKey === 'string' ? src.lastUpdatedDateKey : null
  };
}

export function addJournalEntry(state, text, mood = 'binh_an', dateKey = getLocalDateKey()) {
  const baseState = Array.isArray(state)
    ? createDharmaJournalState({ entries: state })
    : createDharmaJournalState(state);
  const cleanText = String(text || '').trim();
  if (!cleanText) {
    return {
      ok: false,
      reason: 'empty_text',
      message: 'Cô bác vui lòng viết đôi dòng cảm nhận vào Nhật Ký An Tâm nhé.',
      state: baseState,
      entries: baseState.entries
    };
  }
  const moodObj =
    DHARMA_JOURNAL_MOODS.find((m) => m.id === mood) || DHARMA_JOURNAL_MOODS[0];
  const entry = {
    id: `journal_${Date.now()}_${baseState.entries.length + 1}`,
    text: cleanText,
    mood: moodObj.id,
    moodLabel: moodObj.label,
    moodIcon: moodObj.icon,
    dateKey,
    createdAt: `Ghi ngày ${dateKey}`
  };
  const nextState = {
    entries: [entry, ...baseState.entries].slice(0, 120),
    lastUpdatedDateKey: dateKey
  };
  return {
    ok: true,
    entry,
    state: nextState,
    entries: nextState.entries,
    message: `Đã lưu trang Nhật Ký An Tâm (${moodObj.icon} ${moodObj.label}).`
  };
}
