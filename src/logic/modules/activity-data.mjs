/**
 * Dữ liệu: giờ trong ngày, điểm danh, nhiệm vụ, thư, chương khám phá.
 * (Tách từ chua-online-logic.mjs — import từ '/src/logic/chua-online-logic.mjs' vẫn dùng được.)
 */

/* ==========================================================================
   THỜI GIAN TRONG NGÀY · ĐIỂM DANH 7 NGÀY · NHIỆM VỤ · HỘP THƯ · HƯỚNG DẪN
   ========================================================================== */
export const TIME_OF_DAY_PRESETS = {
  morning: {
    key: 'morning',
    label: 'Buổi Sáng',
    shortLabel: 'Sáng',
    icon: '🌅',
    subtitle: 'Nắng sớm 7:30 miền Tây dịu mát, sương nhẹ quanh tán bồ đề'
  },
  midday: {
    key: 'midday',
    label: 'Giữa Trưa',
    shortLabel: 'Trưa',
    icon: '☀️',
    subtitle: 'Giờ thọ trai 11:30 · Ánh nắng trong xanh rọi 13 nhịp vòm vàng Chánh điện'
  },
  sunset: {
    key: 'sunset',
    label: 'Chiều Vàng',
    shortLabel: 'Chiều',
    icon: '🌇',
    subtitle: 'Hoàng hôn 17:00 Mỹ Tho · Nắng chiều hắt đồng rực rỡ lên khảm sành sứ & vườn tượng'
  },
  evening: {
    key: 'evening',
    label: 'Buổi Tối',
    shortLabel: 'Tối',
    icon: '🕯️',
    subtitle: 'Tịnh độ 19:00 · Ánh nến, đèn lồng lục giác & hoa đăng ấm áp dưới trời sao'
  }
};

export const DAILY_CHECKIN_REWARDS = [
  { day: 1, lotus: 30, gems: 10, label: 'Ngày 1 · Phát Tâm', giftName: '30 Sen · 10 Ngọc' },
  { day: 2, lotus: 40, gems: 12, label: 'Ngày 2 · Tinh Tấn', giftName: '40 Sen · 12 Ngọc' },
  { day: 3, lotus: 50, gems: 15, label: 'Ngày 3 · An Trú', giftName: '50 Sen · 15 Ngọc' },
  { day: 4, lotus: 60, gems: 18, label: 'Ngày 4 · Nhẫn Nại', giftName: '60 Sen · 18 Ngọc' },
  { day: 5, lotus: 75, gems: 22, label: 'Ngày 5 · Hoan Hỷ', giftName: '75 Sen · 22 Ngọc' },
  { day: 6, lotus: 90, gems: 25, label: 'Ngày 6 · Chánh Niệm', giftName: '90 Sen · 25 Ngọc' },
  { day: 7, lotus: 150, gems: 45, label: 'Ngày 7 · Viên Mãn', giftName: '150 Sen · 45 Ngọc' }
];

export const DAILY_QUESTS_TEMPLATE = [
  {
    id: 'q_daily_checkin',
    category: 'Hằng ngày',
    icon: '📅',
    title: 'Điểm danh lễ chùa đầu ngày',
    desc: 'Vào mục Điểm danh nhận lộc công đức mỗi ngày một lần.',
    metric: 'checkinCount',
    target: 1,
    rewardLotus: 25,
    rewardGems: 5,
    actionHint: 'checkin'
  },
  {
    id: 'q_le_phat',
    category: 'Hằng ngày',
    icon: '🙏',
    title: 'Đảnh lễ Tam Bảo (3 lạy)',
    desc: 'Bấm nút Lễ Phật tại Chánh điện hoặc trước Đại tượng lộ thiên.',
    metric: 'bowCount',
    target: 3,
    rewardLotus: 40,
    rewardGems: 10,
    actionHint: 'le_phat'
  },
  {
    id: 'q_dang_huong',
    category: 'Hằng ngày',
    icon: '🪔',
    title: 'Dâng 3 nén tâm hương',
    desc: 'Thực hiện nghi thức thắp hương tại lư đồng sân Chánh điện.',
    metric: 'incenseOfferings',
    target: 1,
    rewardLotus: 35,
    rewardGems: 8,
    actionHint: 'dang_huong'
  },
  {
    id: 'q_dang_hoa',
    category: 'Hằng ngày',
    icon: '🪷',
    title: 'Thả hoa sen cầu bình an',
    desc: 'Dâng một đóa hoa sen tươi kèm lời chúc an lành cho gia đình.',
    metric: 'lotusOfferings',
    target: 1,
    rewardLotus: 35,
    rewardGems: 8,
    actionHint: 'dang_hoa'
  },
  {
    id: 'q_niem_phat',
    category: 'Tu tập',
    icon: '📿',
    title: 'Lần chuỗi 21 biến Niệm Phật',
    desc: 'Mở chuỗi bồ đề và niệm 21 biến danh hiệu Phật trong chánh niệm.',
    metric: 'malaTotalBeads',
    target: 21,
    rewardLotus: 45,
    rewardGems: 12,
    actionHint: 'niem_phat'
  },
  {
    id: 'q_kham_pha_3',
    category: 'Hành hương',
    icon: '🧭',
    title: 'Viếng 3 thắng cảnh Chùa Vĩnh Tràng',
    desc: 'Dạo bước ghé thăm ít nhất 3 trạm hoặc khu cảnh quan trong khuôn viên.',
    metric: 'visitedCount',
    target: 3,
    rewardLotus: 55,
    rewardGems: 15,
    actionHint: 'explore'
  },
  {
    id: 'q_hoc_phat',
    category: 'Pháp âm',
    icon: '📖',
    title: 'Nghe & học 1 bài Giảng đường',
    desc: 'Vào Giảng đường nghe pháp âm hoặc hoàn thành 1 bài học Phật pháp.',
    metric: 'completedLessonsCount',
    target: 1,
    rewardLotus: 50,
    rewardGems: 15,
    actionHint: 'lecture'
  }
];

export const INITIAL_MAILBOX_MESSAGES = [
  {
    id: 'mail_welcome_vinhtrang',
    sender: 'Ban Quản Trị Chùa Vĩnh Tràng',
    title: 'Kính chào quý Phật tử hữu duyên ghé thăm Chùa Online',
    dateLabel: 'Hôm nay',
    body:
      'Kính chúc cô bác và anh chị thân tâm an lạc. Nhà chùa xin gửi tặng phần lộc Sen Vàng & Ngọc Quý để thỉnh hương hoa dâng Phật hoặc đổi pháp phục áo tràng trang nghiêm.',
    rewardLotus: 80,
    rewardGems: 25
  },
  {
    id: 'mail_morning_chanting',
    sender: 'Giảng Đường Phật Pháp',
    title: 'Mời cô bác nghe bài giảng mới với chữ to & giọng đọc rõ ràng',
    dateLabel: 'Mỗi ngày',
    body:
      'Giảng đường nay đã mở không gian 3D trực tiếp cùng nút "Nghe Thầy Giảng" và cỡ chữ lớn A+/A- để cô bác lớn tuổi dễ đọc trên điện thoại.',
    rewardLotus: 45,
    rewardGems: 10
  },
  {
    id: 'mail_evening_lantern',
    sender: 'Ban Nghi Lễ Tam Quan',
    title: 'Trải nghiệm cảnh Chùa Vĩnh Tràng buổi tối thắp đèn hoa đăng',
    dateLabel: 'Cập nhật mới',
    body:
      'Quý Phật tử có thể chuyển đổi thời gian Sáng · Trưa · Tối ngay trên thanh điều khiển để chiêm ngưỡng ánh đèn lồng lung linh quanh hồ sen và bảo tháp.',
    rewardLotus: 50,
    rewardGems: 15
  }
];

export const PILGRIMAGE_GUIDE_STEPS = [
  {
    step: 1,
    stationKey: 'cua_hang_luu_niem',
    title: 'Bước 1 · Vào Cổng Phụ & Ghé Nhà Tạp Hóa',
    desc: 'Đi qua Cổng Phụ Tịnh Độ bên phải Tam Quan, dừng tại Nhà Tạp Hóa thỉnh 3 nén nhang trầm, hoa sen tươi hoặc nước dừa xiêm giải nhiệt.'
  },
  {
    step: 2,
    stationKey: 'ho_sen_ca_koi',
    title: 'Bước 2 · Ngắm Hồ Sen Cá Koi & Dâng Hoa',
    desc: 'Dạo theo lối gạch đỏ qua giàn hoa giấy rực rỡ, thả hoa sen và cầu bình an cho cha mẹ, gia quyến bên hồ cá Koi.'
  },
  {
    step: 3,
    stationKey: 'lu_huong_san',
    title: 'Bước 3 · Dâng Hương Sân Chánh Điện',
    desc: 'Tại lư hương đồng ngoài sân, thắp 1–3 nén hương, phẩy nhẹ bằng tay chứ không thổi bằng miệng và xá ba xá.'
  },
  {
    step: 4,
    stationKey: 'chanh_dien',
    title: 'Bước 4 · Vào Chánh Điện Chữ Quốc (國) Lễ Phật',
    desc: 'Đi qua Cửa Hông để vào Nội Điện: chiêm bái bộ tượng Tam Bảo, cặp Long Trụ rồng cuốn và 18 vị La Hán gỗ mít trăm tuổi.'
  },
  {
    step: 5,
    stationKey: 'phat_adida',
    title: 'Bước 5 · Chiêm Bái Ba Pho Đại Tượng Lộ Thiên',
    desc: 'Lần lượt lễ Đại tượng Phật A Di Đà (24m), Phật Di Lặc hoan hỷ (20m) và Phật Thích Ca nhập Niết Bàn (32m) cạnh Bảo Tháp Thất Phật.'
  },
  {
    step: 6,
    stationKey: 'giang_duong',
    title: 'Bước 6 · Nghe Pháp Tại Giảng Đường & Dùng Cơm Trai Đường',
    desc: 'Ghé Giảng Đường 3D nghe giảng kinh, sau đó qua Nhà Sàn Trai Đường miền Tây dùng cơm chay thanh tịnh trước khi hồi hương.'
  }
];

export const DAILY_RESET_MISSIONS = [
  {
    id: 'dm_checkin',
    icon: '📅',
    category: 'Hằng ngày',
    title: 'Điểm danh lễ chùa đầu ngày',
    desc: 'Nhấn Điểm danh mỗi ngày để nhận lộc công đức và nối dài chuỗi tu tập.',
    metric: 'dailyCheckedIn',
    target: 1,
    rewardLotus: 30,
    rewardGems: 8,
    actionHint: 'checkin'
  },
  {
    id: 'dm_incense',
    icon: '🪔',
    category: 'Nghi lễ',
    title: 'Thắp hương tại lư đồng',
    desc: 'Thắp 3 nén tâm hương Giới – Định – Tuệ trước sân Chánh điện hôm nay.',
    metric: 'dailyIncense',
    target: 1,
    rewardLotus: 40,
    rewardGems: 10,
    actionHint: 'dang_huong'
  },
  {
    id: 'dm_quotes',
    icon: '📜',
    category: 'Lời dạy',
    title: 'Đọc 3 lời Phật dạy',
    desc: 'Mở Lời Phật Dạy và chiêm nghiệm ít nhất 3 câu kệ an lành trong ngày.',
    metric: 'dailyQuotesRead',
    target: 3,
    rewardLotus: 45,
    rewardGems: 10,
    actionHint: 'daily_dharma'
  },
  {
    id: 'dm_mindful',
    icon: '🧘',
    category: 'Chánh niệm',
    title: 'Thực hành chánh niệm 5 phút',
    desc: 'Ngồi yên theo dõi hơi thở hoặc lần chuỗi niệm Phật đủ 5 phút (300 giây).',
    metric: 'dailyMindfulSeconds',
    target: 300,
    rewardLotus: 80,
    rewardGems: 20,
    actionHint: 'niem_phat'
  },
  {
    id: 'dm_mala',
    icon: '📿',
    category: 'Niệm Phật',
    title: 'Lần 27 hạt tràng niệm Phật',
    desc: 'Mở chuỗi tràng hạt Bồ Đề và lần ít nhất 27 hạt trong chánh niệm.',
    metric: 'dailyBeads',
    target: 27,
    rewardLotus: 50,
    rewardGems: 12,
    actionHint: 'niem_phat'
  },
  {
    id: 'dm_lotus',
    icon: '🪷',
    category: 'Cầu nguyện',
    title: 'Dâng hoa sen & gửi lời chúc bình an',
    desc: 'Thả một đóa hoa sen tươi bên hồ cầu sức khỏe cho ông bà, con cháu.',
    metric: 'dailyLotus',
    target: 1,
    rewardLotus: 40,
    rewardGems: 8,
    actionHint: 'dang_hoa'
  },
  {
    id: 'dm_lesson',
    icon: '📖',
    category: 'Pháp âm',
    title: 'Nghe 1 bài Giảng đường hôm nay',
    desc: 'Vào Giảng đường nghe thầy giảng hoặc hoàn thành 1 bài học.',
    metric: 'dailyLessons',
    target: 1,
    rewardLotus: 55,
    rewardGems: 15,
    actionHint: 'lecture'
  },
  {
    id: 'dm_leaves',
    icon: '🍂',
    category: 'Công quả',
    title: 'Quét 4 lá Bồ Đề vàng trên sân chùa',
    desc: 'Nhặt hoặc quét 4 chiếc lá Bồ Đề rơi dọc sân gạch và lối đi vườn sen.',
    metric: 'dailyLeavesSwept',
    target: 4,
    rewardLotus: 45,
    rewardGems: 12,
    actionHint: 'courtyard_leaf'
  },
  {
    id: 'dm_garden',
    icon: '🌱',
    category: 'Vườn Phật',
    title: 'Chăm tưới Vườn Cây Phật 2 lần',
    desc: 'Gieo hạt hoặc tưới nước cho Sen, Bồ Đề, Sa La tại Vườn Lâm Tỳ Ni.',
    metric: 'dailyGardenActions',
    target: 2,
    rewardLotus: 50,
    rewardGems: 12,
    actionHint: 'garden'
  },
  {
    id: 'dm_rhythm',
    icon: '🔔',
    category: 'Chánh niệm',
    title: 'Thỉnh chuông & gõ mõ đúng nhịp',
    desc: 'Hoàn thành 1 lượt luyện nhịp Chuông – Mõ Chánh Niệm tại Lầu Chuông.',
    metric: 'dailyRhythmSessions',
    target: 1,
    rewardLotus: 55,
    rewardGems: 14,
    actionHint: 'bell_rhythm'
  },
  {
    id: 'dm_relics',
    icon: '📜',
    category: 'Di sản',
    title: 'Sưu tầm 1 dấu ấn di sản Vĩnh Tràng',
    desc: 'Ghé chiêm bái & đóng dấu Sổ Di Sản tại 10 công trình, tôn tượng quý.',
    metric: 'dailyRelicsFound',
    target: 1,
    rewardLotus: 45,
    rewardGems: 10,
    actionHint: 'heritage'
  }
];

export const EXPLORATION_CHAPTERS = [
  {
    id: 'chap_1_tam_quan',
    dayUnlock: 1,
    title: 'Ngày 1 · Bước Qua Cổng Tam Quan & Hồ Sen',
    desc: 'Ghé thăm Cổng Tam Quan khảm sành sứ cổ, Hồ Sen Cá Koi và Nhà Tạp Hóa cổng chùa.',
    requiredStations: 2,
    rewardLotus: 60,
    rewardGems: 15,
    stationKey: 'ho_sen_ca_koi'
  },
  {
    id: 'chap_2_chanh_dien',
    dayUnlock: 2,
    title: 'Ngày 2 · Vào Chánh Điện & Chiêm Bái 18 Vị La Hán',
    desc: 'Bước qua Cửa Hông để vào Chánh điện ngắm cặp Long Trụ rồng cuốn và 18 vị La Hán gỗ mít.',
    requiredStations: 4,
    rewardLotus: 80,
    rewardGems: 20,
    stationKey: 'chanh_dien'
  },
  {
    id: 'chap_3_thien_tinh',
    dayUnlock: 3,
    title: 'Ngày 3 · Hai Sân Thiên Tỉnh & Tổ Đường Cổ Kính',
    desc: 'Khám phá trọn vẹn trục Chữ Quốc (國): Tiền đường -> Chánh điện -> Thiên Tỉnh 1 -> Nhà Tổ -> Nhà Hậu.',
    requiredStations: 5,
    rewardLotus: 95,
    rewardGems: 25,
    stationKey: 'hau_to_nha_to'
  },
  {
    id: 'chap_4_tam_tuong',
    dayUnlock: 4,
    title: 'Ngày 4 · Ba Pho Đại Tượng Lộ Thiên Vĩnh Tràng',
    desc: 'Đảnh lễ tượng Phật A Di Đà 24m, Phật Di Lặc 20m và Phật Thích Ca Niết Bàn 32m.',
    requiredStations: 6,
    rewardLotus: 110,
    rewardGems: 30,
    stationKey: 'phat_adida'
  },
  {
    id: 'chap_5_giang_duong',
    dayUnlock: 5,
    title: 'Ngày 5 · Giảng Đường Chánh Niệm & Lầu Trà Thiền',
    desc: 'Thọ pháp tại Giảng Đường 3D và dừng chân thưởng trà dưới tán bồ đề xanh mát.',
    requiredStations: 7,
    rewardLotus: 130,
    rewardGems: 35,
    stationKey: 'lau_tra_thien'
  },
  {
    id: 'chap_6_trai_duong',
    dayUnlock: 6,
    title: 'Ngày 6 · Nhà Sàn Gỗ Trai Đường & Vườn Lâm Tỳ Ni',
    desc: 'Tham quan khu ăn chay nhà sàn miền Tây và vườn Lâm Tỳ Ni thanh tịnh.',
    requiredStations: 8,
    rewardLotus: 150,
    rewardGems: 40,
    stationKey: 'nha_san_trai_duong'
  },
  {
    id: 'chap_7_vien_man',
    dayUnlock: 7,
    title: 'Ngày 7 · Viên Mãn Hành Hương & Thắp Đèn Hoa Đăng',
    desc: 'Hoàn tất trọn vẹn 9 dấu ấn sen vàng Chùa Vĩnh Tràng và hồi hướng công đức.',
    requiredStations: 9,
    rewardLotus: 220,
    rewardGems: 60,
    stationKey: 'bao_thap_that_phat'
  }
];

export const EXTENDED_MAILBOX_MESSAGES = [
  {
    id: 'mail_18_arhats_story',
    unlockCheckinDay: 2,
    sender: 'Ban Bảo Tồn Di Sản Chùa Vĩnh Tràng',
    title: 'Chuyện kể về 18 vị La Hán gỗ mít trăm năm tuổi',
    dateLabel: 'Ngày 2 hành hương',
    body:
      'Ít ai biết mỗi pho tượng La Hán trong Chánh điện đều mang một linh thú hoặc pháp khí riêng như hươu trắng, voi trắng, sư tử nhỏ, bảo tháp hay rồng xanh — nhắc nhở người tu chuyển hóa tham sân si giữa đời thường.',
    rewardLotus: 65,
    rewardGems: 18,
    replyOptions: ['🙏 Con đã ngắm đủ 18 vị La Hán rất trang nghiêm', '🪷 Cảm ơn Ban Bảo Tồn đã chia sẻ']
  },
  {
    id: 'mail_vu_lan_filial',
    unlockCheckinDay: 3,
    sender: 'Thầy Trụ Trì Chùa Vĩnh Tràng',
    title: 'Thư gửi cô bác về Đạo Hiếu & Bông Hồng Cài Áo',
    dateLabel: 'Ngày 3 hành hương',
    body:
      'Tâm hiếu là tâm Phật, hạnh hiếu là hạnh Phật. Nhà chùa kính gửi tặng cô bác lộc công đức để thỉnh Áo Vu Lan hồng hoặc một bó hoa sen dâng lên cầu bình an cho song thân và con cháu.',
    rewardLotus: 90,
    rewardGems: 25,
    replyOptions: ['🌹 Nguyện cầu cha mẹ & gia đình luôn bình an', '🙏 Con xin ghi nhớ chữ Hiếu làm đầu']
  },
  {
    id: 'mail_mindful_tea',
    unlockCheckinDay: 4,
    sender: 'Lầu Trà Thiền Vườn Bồ Đề',
    title: 'Mời cô bác thực hành 5 phút Chánh Niệm mỗi sáng',
    dateLabel: 'Ngày 4 hành hương',
    body:
      'Chỉ cần 5 phút ngồi yên lần từng hạt Tràng Hạt gỗ Bồ Đề, hít vào bình an và thở ra nhẹ nhàng cũng đủ nuôi dưỡng thân tâm khỏe mạnh suốt cả ngày.',
    rewardLotus: 75,
    rewardGems: 20,
    replyOptions: ['🧘 Hôm nay con sẽ ngồi thiền 5 phút', '📿 Tiếng mõ và chuỗi hạt rất dễ chịu']
  },
  {
    id: 'mail_trai_duong_feast',
    unlockCheckinDay: 5,
    sender: 'Ban Trai Soạn Nhà Sàn Miền Tây',
    title: 'Thân mời đoàn gia đình & du khách ghé Nhà Sàn Trai Đường',
    dateLabel: 'Ngày 5 hành hương',
    body:
      'Khu nhà sàn gỗ căm xe bên hồ sen đã chuẩn bị sẵn trà đá thanh mát và cơm chay đạm bạc đón quý Phật tử phương xa cùng đoàn du lịch ghé nghỉ chân.',
    rewardLotus: 85,
    rewardGems: 22,
    replyOptions: ['🍚 Không khí nhà sàn miền Tây thật ấm cúng', '🌿 Cảm ơn nhà chùa tiếp đón chu đáo']
  }
];
