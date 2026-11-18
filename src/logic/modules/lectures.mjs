/**
 * Giáo trình PDF, lộ trình & bài giảng, chấm quiz.
 * (Tách từ chua-online-logic.mjs — import từ '/src/logic/chua-online-logic.mjs' vẫn dùng được.)
 */

/**
 * 11 Canonical Buddhist Textbooks available in /Giáo trình phật học/
 */
export const DHARMA_TEXTBOOKS = [
  {
    id: 'phpt_1',
    title: 'Phật Học Phổ Thông — Quyển 1 (Khóa I, II, III)',
    author: 'Hòa thượng Thích Thiện Hoa',
    pdfPath: '/Giáo trình phật học/Phật học phổ thông 1.pdf',
    tier: 'basic',
    tierLabel: 'Cơ bản · Nhập môn',
    pages: 210,
    estimatedMinutes: 65,
    durationLabel: '210 trang · ~65 phút đọc',
    sortOrder: 1,
    coreTeachings: 'Trình bày hệ thống từ Quy Y Tam Bảo, Ngũ Giới, Thập Thiện, Tứ Nhiếp Pháp đến Nhân Quả, Luân Hồi và Tứ Diệu Đế theo phương pháp sư phạm dễ hiểu cho Phật tử tại gia.'
  },
  {
    id: 'phpt_3',
    title: 'Phật Học Phổ Thông — Quyển 3 (Lục Độ & Đại Thừa)',
    author: 'Hòa thượng Thích Thiện Hoa',
    pdfPath: '/Giáo trình phật học/Phật học phổ thông 3.pdf',
    tier: 'heritage',
    tierLabel: 'Di sản & Đại Thừa',
    pages: 205,
    estimatedMinutes: 65,
    durationLabel: '205 trang · ~65 phút đọc',
    sortOrder: 11,
    coreTeachings: 'Đi sâu vào Tứ Vô Lượng Tâm (Từ, Bi, Hỷ, Xả), Lục Độ Ba La Mật và tinh thần Bồ Tát Đạo nhập thế cứu khổ.'
  },
  {
    id: 'duc_phat_day_nhung_gi',
    title: 'Đức Phật Dạy Những Gì (What the Buddha Taught)',
    author: 'HT. Walpola Rahula · Ni sư Trí Hải dịch',
    pdfPath: '/Giáo trình phật học/duc-phat-day-nhung-gi-ht-walpola-rahula-ns-tri-hai-dich.pdf',
    tier: 'heritage',
    tierLabel: 'Kinh điển · Tinh yếu',
    pages: 156,
    estimatedMinutes: 50,
    durationLabel: '156 trang · ~50 phút đọc',
    sortOrder: 9,
    coreTeachings: 'Kiệt tác Phật học thế giới giải thích chuẩn xác thái độ tâm thức Phật giáo, Tứ Diệu Đế, thuyết Vô Ngã (Anatta), Duyên Khởi và Thiền Chánh Niệm.'
  },
  {
    id: 'nen_tang_1_tam_bao',
    title: 'Nền Tảng Phật Giáo — Quyển 1: Tam Bảo',
    author: 'Tỳ kheo Giác Giới',
    pdfPath: '/Giáo trình phật học/nen-tang-phat-giao-quyen-1-tam-bao.pdf',
    tier: 'intermediate',
    tierLabel: 'Trung cấp · Tam Bảo',
    pages: 184,
    estimatedMinutes: 55,
    durationLabel: '184 trang · ~55 phút đọc',
    sortOrder: 3,
    coreTeachings: 'Giải thích rõ ân đức của Phật Bảo (Tự giác, Giác tha, Giác hạnh viên mãn), Pháp Bảo (Thiết thực hiện tại, vượt thời gian) và Tăng Bảo.'
  },
  {
    id: 'nen_tang_2_quy_y',
    title: 'Nền Tảng Phật Giáo — Quyển 2: Quy Y Tam Bảo',
    author: 'Tỳ kheo Giác Giới',
    pdfPath: '/Giáo trình phật học/nen-tang-phat-giao-quyen-2-quy-y-tam-bao.pdf',
    tier: 'intermediate',
    tierLabel: 'Trung cấp · Quy Y',
    pages: 172,
    estimatedMinutes: 50,
    durationLabel: '172 trang · ~50 phút đọc',
    sortOrder: 4,
    coreTeachings: 'Làm sáng tỏ ý nghĩa Quy y nội tâm (quay về tự tính giác ngộ) và Quy y ngoại tướng, cùng các điều làm thành tựu hay đứt mẻ giới quy y.'
  },
  {
    id: 'nen_tang_4_nghiep',
    title: 'Nền Tảng Phật Giáo — Quyển 4: Nghiệp và Quả của Nghiệp',
    author: 'Tỳ kheo Giác Giới',
    pdfPath: '/Giáo trình phật học/nen-tang-phat-giao-quyen-4-nghiep-va-qua-cua-nghiep.pdf',
    tier: 'intermediate',
    tierLabel: 'Trung cấp · Nghiệp Quả',
    pages: 178,
    estimatedMinutes: 55,
    durationLabel: '178 trang · ~55 phút đọc',
    sortOrder: 5,
    coreTeachings: 'Phân tích Cố ý (Tác ý - Cetanā) chính là Nghiệp, 10 bất thiện nghiệp, 10 thiện nghiệp và phương pháp chuyển hóa trọng nghiệp bằng tu tâm.'
  },
  {
    id: 'nen_tang_5_phuoc',
    title: 'Nền Tảng Phật Giáo — Quyển 5: Phước Thiện (Puñña)',
    author: 'Tỳ kheo Giác Giới',
    pdfPath: '/Giáo trình phật học/nen-tang-phat-giao-quyen-quyen-5-phuoc-thien.pdf',
    tier: 'intermediate',
    tierLabel: 'Trung cấp · Phước Thiện',
    pages: 164,
    estimatedMinutes: 50,
    durationLabel: '164 trang · ~50 phút đọc',
    sortOrder: 6,
    coreTeachings: 'Mười cội phước thiện (Thập phúc nghiệp sự): Bố thí, Trì giới, Tham thiền, Cung kính, Phục vụ, Hồi hướng phước, Tùy hỷ phước, Thính pháp, Thuyết pháp và Chánh kiến.'
  },
  {
    id: 'thien_ajahn_brahm',
    title: 'Phương Pháp Thiền Căn Bản (Basic Method of Meditation)',
    author: 'Thiền sư Ajahn Brahm',
    pdfPath: '/Giáo trình phật học/phuong-phap-thien-can-ban-ajahn-brahm-tieng-viet.pdf',
    tier: 'meditation',
    tierLabel: 'Thiền định & Chánh niệm',
    pages: 148,
    estimatedMinutes: 45,
    durationLabel: '148 trang · ~45 phút đọc',
    sortOrder: 7,
    coreTeachings: 'Hướng dẫn từng bước buông xả quá khứ và tương lai, an trú trong hiện tại tĩnh lặng và theo dõi hơi thở êm dịu dẫn vào định.'
  },
  {
    id: 'tich_truyen_phap_cu',
    title: 'Tích Truyện Pháp Cú (Dhammapada Commentary)',
    author: 'Bản dịch Việt ngữ',
    pdfPath: '/Giáo trình phật học/tichtruyenphapcu.pdf',
    tier: 'heritage',
    tierLabel: 'Di sản & Pháp Cú',
    pages: 224,
    estimatedMinutes: 70,
    durationLabel: '224 trang · ~70 phút đọc',
    sortOrder: 10,
    coreTeachings: 'Những câu chuyện lịch sử sinh động thời Đức Phật gắn liền với 423 bài kệ Kinh Pháp Cú — bài học nhân sinh sâu sắc.'
  },
  {
    id: 'tu_duong_tam_tu',
    title: 'Tu Dưỡng Tâm Từ Bằng Thiền Chánh Niệm',
    author: 'Giáo trình Thiền Tứ Niệm Xứ & Tâm Từ',
    pdfPath: '/Giáo trình phật học/tu-duong-tam-tu-bang-thien-chanh-niem.pdf',
    tier: 'meditation',
    tierLabel: 'Thiền định & Tâm Từ',
    pages: 136,
    estimatedMinutes: 40,
    durationLabel: '136 trang · ~40 phút đọc',
    sortOrder: 8,
    coreTeachings: 'Kết hợp Quán thân thọ tâm pháp (Satipatthana) với thiền Rải Tâm Từ (Metta Bhavana) để chữa lành tổn thương và nuôi dưỡng lòng bi mẫn.'
  },
  {
    id: 'giao_trinh_phat_hoc_toan_tap',
    title: 'Giáo Trình Phật Học Cơ Bản Toàn Tập',
    author: 'Ban Biên Tập Phật Học Phổ Thông',
    pdfPath: '/Giáo trình phật học/giaotrinhphathoc.pdf',
    tier: 'basic',
    tierLabel: 'Cơ bản · Toàn tập',
    pages: 260,
    estimatedMinutes: 80,
    durationLabel: '260 trang · ~80 phút đọc',
    sortOrder: 2,
    coreTeachings: 'Bộ giáo trình tổng hợp hệ thống lịch sử Đức Phật Thích Ca, giáo lý Duyên Khởi, Tứ Diệu Đế, Bát Chánh Đạo, oai nghi Phật tử tại gia và phương pháp ứng dụng chánh niệm đời thường.'
  }
];

export function getSortedDharmaTextbooks(tier = 'all') {
  const list = tier === 'all' ? DHARMA_TEXTBOOKS : DHARMA_TEXTBOOKS.filter((b) => b.tier === tier);
  return [...list].sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
}

export const LECTURE_PATHS = [
  {
    id: 'A',
    code: 'Gói A',
    title: 'Nhập môn Phật pháp căn bản',
    subtitle: 'Theo Phật Học Phổ Thông (HT. Thích Thiện Hoa) & Nền Tảng Phật Giáo: Tam Bảo, Ngũ Giới, Nhân Quả',
    duration: '6 bài học · 75 phút',
    audioTrack: 's3_giang_duong.mp3'
  },
  {
    id: 'B',
    code: 'Gói B',
    title: 'Kinh điển & Lời Phật dạy tinh yếu',
    subtitle: 'Theo Đức Phật Dạy Những Gì (Walpola Rahula) & Tích Truyện Pháp Cú: Tâm Kinh, Từ Bi, Niệm Phật',
    duration: '6 bài học · 80 phút',
    audioTrack: 'niem_phat_xa.mp3'
  },
  {
    id: 'C',
    code: 'Gói C',
    title: 'Thiền chánh niệm & Sống an đời thường',
    subtitle: 'Theo Phương Pháp Thiền Căn Bản (Ajahn Brahm) & Tu Dưỡng Tâm Từ: Hơi thở, Lắng nghe, Hiếu đạo',
    duration: '6 bài học · 70 phút',
    audioTrack: 's6_dan.mp3'
  },
  {
    id: 'D',
    code: 'Gói D',
    title: 'Di sản & Nghi lễ Chùa Vĩnh Tràng',
    subtitle: 'Lịch sử cổ tự Vĩnh Tràng 1849, kiến trúc Á – Âu, 18 vị La Hán và nghi thức đi chùa đúng pháp',
    duration: '6 bài học · 65 phút',
    audioTrack: 's0_chao.mp3'
  }
];

export const LECTURE_LESSONS = [
  {
    id: 'A1',
    pathId: 'A',
    order: 1,
    title: 'Tam Bảo là gì? Ý nghĩa Phật – Pháp – Tăng',
    duration: '12 phút',
    audio: 's3_giang_duong.mp3',
    sourceBook: 'Nền Tảng Phật Giáo Quyển 1: Tam Bảo & Phật Học Phổ Thông Q.1',
    summary: [
      'Phật Bảo (Buddha) là Đấng Tự Giác, Giác Tha, Giác Hạnh Viên Mãn — bậc Đạo sư chỉ đường sáng suốt.',
      'Pháp Bảo (Dhamma) là phương thuốc nhiệm mầu gồm Giáo pháp và Chứng pháp có công năng diệt trừ phiền não.',
      'Tăng Bảo (Sangha) là đoàn thể thanh tịnh cùng tu tập, giữ gìn và truyền trao mạng mạch Chánh pháp.'
    ],
    example: 'Khi vào Chánh điện Chùa Vĩnh Tràng lạy 3 lạy (Tam Bái), mỗi lạy là sự trở về nương tựa nơi Phật (Tỉnh thức), Pháp (Chánh kiến) và Tăng (Hòa hợp thanh tịnh).',
    practice: 'Hôm nay khi chắp tay trước ngực, hãy thở vào thật sâu và thầm nhủ: "Con về nương tựa Phật, người đưa đường chỉ lối cho con trong cuộc đời."',
    quiz: {
      question: 'Trong giáo lý Tam Bảo (Phật Học Phổ Thông), yếu tố nào được ví như "phương thuốc lành" trực tiếp chữa lành bệnh khổ đau trong tâm?',
      options: ['Phật Bảo (Vị lương y)', 'Pháp Bảo (Phương thuốc lành)', 'Tăng Bảo (Người chăm sóc hướng dẫn)'],
      correctIndex: 1,
      explanation: 'HT. Thích Thiện Hoa giảng: Đức Phật như vị lương y giỏi, Pháp Bảo là phương thuốc nhiệm mầu, Tăng Bảo là y tá tận tâm hướng dẫn bệnh nhân uống thuốc.'
    }
  },
  {
    id: 'A2',
    pathId: 'A',
    order: 2,
    title: 'Quy Y Tam Bảo & Năm Giới quý báu của người tại gia',
    duration: '13 phút',
    audio: 's0_nhan_nhang.mp3',
    sourceBook: 'Nền Tảng Phật Giáo Quyển 2: Quy Y Tam Bảo',
    summary: [
      'Quy (quay về) Y (nương tựa): Quay từ bờ mê lầm về nương tựa ánh sáng Giác – Chánh – Tịnh.',
      'Năm giới gồm: Không sát sanh, Không trộm cắp, Không tà hạnh, Không nói dối/lời ác, Không say sưa nghiện ngập.',
      'Giữ 5 giới là 5 món quà bình an (Ngũ đại thí) hiến tặng cho gia đình và xã hội.'
    ],
    example: 'Trước khi nói lời nóng giận với người thân, người Phật tử nhớ đến giới thứ tư (Chánh ngữ & Ái ngữ) để chọn lời nói ôn hòa.',
    practice: 'Chọn 1 trong 5 giới để thực hành trọn vẹn trong 24 giờ tới, bắt đầu từ lời nói chân thật và dịu dàng.',
    quiz: {
      question: 'Bản chất thực sự của Năm Giới (Ngũ Giới) trong đạo Phật là gì?',
      options: [
        'Những hình phạt bắt buộc của nhà chùa',
        'Năm nguyên tắc đạo đức tự nguyện giúp bảo vệ tự do và bình an cho mình và muôn loài',
        'Chỉ dành riêng cho người xuất gia'
      ],
      correctIndex: 1,
      explanation: 'Ngũ giới là hàng rào đạo đức tự nguyện bảo vệ hạnh phúc gia đình, giúp hành giả sống không hối hận (vô tác hối).'
    }
  },
  {
    id: 'A3',
    pathId: 'A',
    order: 3,
    title: 'Tứ Diệu Đế: Bốn sự thật nhiệm mầu (Đức Phật Dạy Những Gì)',
    duration: '14 phút',
    audio: 's3_giang_duong.mp3',
    sourceBook: 'Đức Phật Dạy Những Gì — HT. Walpola Rahula (NS. Trí Hải dịch)',
    summary: [
      'Khổ Đế (Dukkha): Nhận diện trung thực tính bất toàn, vô thường của thế gian mà không bi quan.',
      'Tập Đế (Samudaya): Thấy rõ gốc rễ của khổ là Ái dục (Tanha) đi kèm chấp thủ và vô minh.',
      'Diệt Đế (Nirodha) & Đạo Đế (Magga): Niết Bàn tịch tịnh có thể chứng nghiệm ngay trong hiện tại nhờ Bát Chánh Đạo.'
    ],
    example: 'Khi gặp chuyện buồn, thay vì trách hoàn cảnh, ta dùng Tứ Diệu Đế như bác sĩ bắt mạch: biết rõ nỗi khổ (Tri khổ), buông nguyên nhân chấp trước (Đoạn tập), và thở chánh niệm (Tu đạo).',
    practice: 'Ghi nhận một điều đang làm bạn căng thẳng hôm nay và tìm xem sự đòi hỏi quá mức nào phía sau đang tạo nên áp lực đó.',
    quiz: {
      question: 'Theo tác phẩm "Đức Phật Dạy Những Gì" của HT. Walpola Rahula, thái độ của đạo Phật khi nói về Khổ Đế là gì?',
      options: [
        'Bi quan chán đời',
        'Hiện thực và sáng suốt như vị y sĩ chẩn đoán đúng bệnh để chữa lành dứt điểm',
        'Lạc quan giả tạo'
      ],
      correctIndex: 1,
      explanation: 'Đức Phật không bi quan cũng không lạc quan mù quáng, mà là bậc Hiện Thực (Yathābhūta) nhìn thẳng sự thật để giải thoát.'
    }
  },
  {
    id: 'A4',
    pathId: 'A',
    order: 4,
    title: 'Nghiệp (Kamma) & Mười Cội Phước Thiện (Puñña)',
    duration: '12 phút',
    audio: 's6_dan.mp3',
    sourceBook: 'Nền Tảng Phật Giáo Quyển 4 & Quyển 5 (Nghiệp & Phước Thiện)',
    summary: [
      'Đức Phật định nghĩa: "Này các Tỳ kheo, Tác ý (Cetanā - sự cố ý) chính là Nghiệp".',
      'Mười cội phước thiện gồm: Bố thí, Trì giới, Tham thiền, Cung kính, Phục vụ, Hồi hướng, Tùy hỷ, Thính pháp, Thuyết pháp, Chánh kiến.',
      'Nhân quả không phải thuyết định mệnh; gieo thiện nghiệp hiện tại sẽ chuyển hóa tương lai.'
    ],
    example: 'Khi bạn bấm "Hồi hướng công đức" hoặc vui mừng trước ảnh đi chùa của Phật tử khác (Tùy hỷ phước), bạn đã thành tựu cội phước thiện thanh cao.',
    practice: 'Thực hiện 3 cội phước không tốn tiền hôm nay: Cung kính người lớn, Phục vụ giúp đỡ việc nhỏ, và Tùy hỷ niềm vui của người khác.',
    quiz: {
      question: 'Theo Kinh Tăng Chi Bộ (được trích trong Nền Tảng Phật Giáo Q.4), yếu tố cốt lõi nào quyết định một hành động trở thành Nghiệp (Kamma)?',
      options: [
        'Sự ngẫu nhiên vô tình',
        'Tác ý (Cetanā — Ý chí chủ tâm thiện hoặc bất thiện khi tạo tác bằng Thân, Khẩu, Ý)',
        'Sự phán xét của người ngoài'
      ],
      correctIndex: 1,
      explanation: '"Cetanāhaṃ bhikkhave kammaṃ vadāmi" — Chính Tác ý (ý chủ tâm) là hạt nhân tạo thành Nghiệp.'
    }
  },
  {
    id: 'A5',
    pathId: 'A',
    order: 5,
    title: 'Bát Chánh Đạo & Tam Vô Lậu Học (Giới – Định – Tuệ)',
    duration: '13 phút',
    audio: 's3_giang_duong.mp3',
    sourceBook: 'Phật Học Phổ Thông Quyển 1 & Đức Phật Dạy Những Gì',
    summary: [
      'Tám chi phần chân chánh gom vào 3 môn học giải thoát (Tam vô lậu học): Giới học, Định học và Tuệ học.',
      'Tuệ học: Chánh kiến & Chánh tư duy. Giới học: Chánh ngữ, Chánh nghiệp, Chánh mạng. Định học: Chánh tinh tấn, Chánh niệm, Chánh định.',
      'Giữ Giới giúp tâm không loạn (sinh Định); tâm Định tĩnh như mặt hồ phẳng lặng sẽ chiếu sáng Trí Tuệ.'
    ],
    example: 'Khi điều khiển nhân vật đi từng bước trên sân gạch Chùa Vĩnh Tràng, sự chú tâm lắng nghe tiếng bước chân và chuông chùa chính là thực tập Chánh niệm.',
    practice: 'Dành 5 phút đi bộ chậm rãi mà không nhìn điện thoại, cảm nhận rõ từng bước chân chạm đất.',
    quiz: {
      question: 'Ba trụ cột chính (Tam vô lậu học) bao trùm toàn bộ 8 chi phần Bát Chánh Đạo là gì?',
      options: ['Giới – Định – Tuệ', 'Phước – Lộc – Thọ', 'Danh – Lợi – Quyền'],
      correctIndex: 0,
      explanation: 'Tám nhánh Bát Chánh Đạo kết tinh thành Giới – Định – Tuệ, ba trụ cột nâng đỡ toàn bộ tòa nhà Phật pháp.'
    }
  },
  {
    id: 'A6',
    pathId: 'A',
    order: 6,
    title: 'Lục Độ Ba La Mật & Tứ Vô Lượng Tâm (Từ – Bi – Hỷ – Xả)',
    duration: '11 phút',
    audio: 's6_hoi_huong.mp3',
    sourceBook: 'Phật Học Phổ Thông Quyển 3 — HT. Thích Thiện Hoa',
    summary: [
      'Sáu phép thực hành đưa sang bờ giác: Bố thí, Trì giới, Nhẫn nhục, Tinh tấn, Thiền định, Trí tuệ.',
      'Tứ Vô Lượng Tâm: Từ (ban vui), Bi (cứu khổ), Hỷ (vui theo điều lành của người), Xả (buông bỏ thành kiến phân biệt).',
      'Nhẫn nhục và Hỷ xả là sức mạnh nội tâm lớn nhất trước nghịch cảnh.'
    ],
    example: 'Chiêm ngưỡng nụ cười của Đại tượng Phật Di Lặc tại Chùa Vĩnh Tràng giúp ta học hạnh Nhẫn nhục và Hỷ xả.',
    practice: 'Hoàn thành cả 6 nhiệm vụ trong bảng "Hành Trình Lục Độ Ba La Mật" của ứng dụng Chùa Online.',
    quiz: {
      question: 'Trong Lục Độ Ba La Mật, hạnh nào giúp bảo hộ rừng công đức không bị ngọn lửa sân giận thiêu rụi?',
      options: ['Bố thí', 'Nhẫn nhục Ba La Mật', 'Tinh tấn'],
      correctIndex: 1,
      explanation: 'Kinh dạy "Nhất niệm sân tâm khởi, bách vạn chướng môn khai", nên Nhẫn nhục giúp giữ trọn công đức lành.'
    }
  },

  // === GÓI B (6 bài) ===
  {
    id: 'B1',
    pathId: 'B',
    order: 1,
    title: 'Kinh Pháp Cú & Tích Truyện: Tâm dẫn đầu các pháp',
    duration: '14 phút',
    audio: 's6_ke_1.mp3',
    sourceBook: 'Tích Truyện Pháp Cú (Phẩm Song Yếu — Kệ số 1 & 2)',
    summary: [
      'Kệ số 1 (Tích thầy Tỳ kheo Cakkhupāla): "Ý dẫn đầu các pháp, Ý làm chủ, ý tạo".',
      'Nói hay làm với tâm ô nhiễm thì khổ đau theo sau như bánh xe theo chân con bò kéo.',
      'Kệ số 2 (Tích chàng Matthakundalī): Nói hay làm với tâm thanh tịnh thì an lạc theo sau như bóng không rời hình.'
    ],
    example: 'Chàng thanh niên Matthakundalī chỉ khởi tâm thành kính hướng về Đức Phật trên giường bệnh mà được sinh cảnh giới an lành — chứng minh sức mạnh của một niệm tâm thanh tịnh.',
    practice: 'Mỗi sáng thức dậy, khởi một ý niệm thiện lành đầu tiên chúc bình an cho gia đình và muôn loài.',
    quiz: {
      question: 'Theo tích truyện kệ số 1 & 2 Kinh Pháp Cú, yếu tố nào dẫn đầu và quyết định tính chất thiện/ác của mọi hành động?',
      options: ['Hoàn cảnh bên ngoài', 'Tâm ý (Ý làm chủ, ý tạo)', 'Tiền tài danh vọng'],
      correctIndex: 1,
      explanation: '"Ý dẫn đầu các pháp, ý làm chủ, ý tạo" — giữ tâm trong sáng là gốc của mọi an vui.'
    }
  },
  {
    id: 'B2',
    pathId: 'B',
    order: 2,
    title: 'Bát Nhã Tâm Kinh: Quán chiếu Duyên Khởi & Vô Ngã',
    duration: '15 phút',
    audio: 'niem_phat_xa.mp3',
    sourceBook: 'Bát Nhã Tâm Kinh & Đức Phật Dạy Những Gì (Chương Vô Ngã)',
    summary: [
      '"Chiếu kiến ngũ uẩn giai không, độ nhất thiết khổ ách": Thấy rõ 5 uẩn (Sắc, Thọ, Tưởng, Hành, Thức) do duyên hợp nên vượt qua khổ đau.',
      'Tính Không (Śūnyatā) không phải là hư vô, mà là vạn pháp tương tức, không có cái tôi biệt lập bất biến.',
      'Nhờ vô thường và duyên khởi mà nỗi khổ có thể chuyển hóa và hạt giống tốt có thể nảy nở.'
    ],
    example: 'Đóa hoa sen dâng Phật có mặt nhờ ánh nắng, bùn nước, đám mây và bàn tay người trồng — nhìn sâu vào đóa sen ta thấy cả vũ trụ.',
    practice: 'Khi gặp một cơn giận hay nỗi buồn, hãy quán sát nó như đám mây hợp rồi tan trên bầu trời tâm thức.',
    quiz: {
      question: 'Nhờ quán chiếu điều gì mà Bồ Tát Quán Tự Tại vượt qua hết thảy khổ ách trong Tâm Kinh?',
      options: [
        'Quán chiếu năm uẩn đều nương duyên mà thành, không có tự tính riêng biệt (Ngũ uẩn giai không)',
        'Tìm kiếm phép thuật thần thông',
        'Tránh xa cuộc đời'
      ],
      correctIndex: 0,
      explanation: 'Thấy rõ thân tâm và hoàn cảnh đều do duyên sinh, vô thường nên buông xả được chấp ngã nặng nề.'
    }
  },
  {
    id: 'B3',
    pathId: 'B',
    order: 3,
    title: 'Kinh Từ Bi (Karaniya Metta Sutta) & Thiền Tâm Từ',
    duration: '13 phút',
    audio: 's6_ke_2.mp3',
    sourceBook: 'Tu Dưỡng Tâm Từ Bằng Thiền Chánh Niệm',
    summary: [
      'Người thực hành Từ Bi sống hiền hòa, tri túc, dễ nuôi, lục căn thanh tịnh, khiêm cung.',
      'Rải tâm từ tuần tự từ chính mình -> người thương -> người trung dung -> người gây khó dễ -> khắp muôn loài.',
      'Tâm từ như mẹ hiền đem cả mạng sống che chở đứa con duy nhất của mình.'
    ],
    example: 'Sau mỗi thời niệm Phật hoặc dâng hương, ta đọc bài kệ Hồi hướng để gửi năng lượng từ bi đến cha mẹ, bà con và hết thảy chúng sanh.',
    practice: 'Gửi lời chúc thầm lặng "Mong bạn không có oan trái, không có khổ đau, thân tâm an lạc" đến 3 người hôm nay.',
    quiz: {
      question: 'Theo sách "Tu Dưỡng Tâm Từ Bằng Thiền Chánh Niệm", vì sao ta cần khởi đầu rải tâm từ cho chính mình trước?',
      options: [
        'Vì ích kỷ chỉ nghĩ cho mình',
        'Vì khi mình biết thương yêu và làm lắng dịu nội tâm mình, ta mới có nguồn năng lượng bình an chân thật để truyền trao cho người khác',
        'Vì không cần thương người ngoài'
      ],
      correctIndex: 1,
      explanation: 'Lấy chính mình làm chứng: mình muốn an vui không khổ đau thế nào thì muôn loài cũng ước mong như thế.'
    }
  },
  {
    id: 'B4',
    pathId: 'B',
    order: 4,
    title: 'Ý nghĩa Niệm Phật & Chuỗi hạt 108 biến Bồ Đề',
    duration: '13 phút',
    audio: 's1_adida.mp3',
    sourceBook: 'Giáo Trình Phật Học & Pháp Môn Tịnh Độ',
    summary: [
      'Nam Mô A Di Đà Phật nghĩa là quay về nương tựa Đấng Vô Lượng Quang (Ánh sáng trí tuệ) và Vô Lượng Thọ (Sự sống từ bi).',
      'Chuỗi 108 hạt biểu trưng cho việc chuyển hóa 108 phiền não sinh khởi khi 6 căn tiếp xúc 6 trần.',
      'Mỗi tiếng niệm Phật nhiếp cả 3 nghiệp: Tay lần chuỗi (Thân), Miệng niệm danh hiệu (Khẩu), Tâm nhớ nghĩ công đức Phật (Ý).'
    ],
    example: 'Khi bấm nút "Niệm Phật" ở góc phải màn hình, mỗi hạt chuỗi dịch chuyển cùng tiếng mõ trầm đều giúp nhịp tim và hơi thở chậm lại.',
    practice: 'Dành 3 phút lần chuỗi niệm Phật 21 hoặc 108 biến trước khi đi ngủ.',
    quiz: {
      question: 'Pháp môn Niệm Phật đạt hiệu quả "Nhất tâm bất loạn" khi hành giả kết hợp ba yếu tố nào?',
      options: [
        'Chỉ đọc bằng miệng thật to mà tâm nghĩ việc khác',
        'Ba nghiệp Thân – Khẩu – Ý hợp nhất trong chánh niệm (Miệng niệm rõ ràng, tai lắng nghe rõ ràng, tâm ghi nhớ từng câu Phật hiệu)',
        'Đếm cho thật nhanh'
      ],
      correctIndex: 1,
      explanation: 'Tổ Ấn Quang dạy: Niệm từ tâm khởi, tiếng từ miệng ra, âm vào tai nghe rõ ràng thì vọng tưởng tự lặng.'
    }
  },
  {
    id: 'B5',
    pathId: 'B',
    order: 5,
    title: 'Kinh Phước Đức (Mangala Sutta): 38 nấc thang hạnh phúc',
    duration: '12 phút',
    audio: 's6_ke_3.mp3',
    sourceBook: 'Kinh Tập (Sutta Nipāta) & Nền Tảng Phật Giáo Q.5',
    summary: [
      'Phước lành tối thượng bắt đầu từ việc không gần kẻ ác, thân cận người hiền trí, sống ở môi trường thiện lành.',
      'Đa văn học rộng, khéo nghề nghiệp chân chính, nói lời chân thật hòa ái.',
      'Phụng dưỡng cha mẹ, yêu thương vợ con, tâm không sầu muộn nhiễm ô trước 8 ngọn gió đời (Bát phong).'
    ],
    example: 'Đưa cả gia đình 3 thế hệ (Ông bà/Cha mẹ và Trẻ em) cùng đi chùa, chụp bức ảnh kỷ niệm hiếu hạnh là hình ảnh đẹp nhất của Kinh Phước Đức.',
    practice: 'Gọi điện hỏi thăm hoặc rót một tách trà ấm mời cha mẹ trong ngày hôm nay.',
    quiz: {
      question: 'Theo Kinh Phước Đức, đỉnh cao của người có phước đức giữa cuộc đời biến động là gì?',
      options: [
        'Khi xúc chạm việc đời (được/mất, hơn/thua), tâm không dao động, không sầu, trong sạch và an ổn',
        'Không bao giờ gặp thử thách',
        'Trúng số may mắn'
      ],
      correctIndex: 0,
      explanation: '"Phuṭṭhassa lokadhammehi, cittaṃ yassa na kampati" — Khi chạm việc đời mà tâm không lay động là phước đức lớn nhất.'
    }
  },
  {
    id: 'B6',
    pathId: 'B',
    order: 6,
    title: 'Bốn bài Kệ Hồi Hướng & Tâm nguyện Bồ Đề rộng lớn',
    duration: '13 phút',
    audio: 's6_ke_4.mp3',
    sourceBook: 'Nền Tảng Phật Giáo Quyển 5 (Hồi hướng phước - Pattidāna)',
    summary: [
      'Hồi hướng (Pattidāna) là đem công đức tu tập chia sẻ cho ông bà cha mẹ và khắp pháp giới chúng sanh.',
      'Kinh điển ví sự hồi hướng phước như lấy một ngọn đuốc mồi cho hàng trăm ngọn đuốc khác: ngọn đuốc đầu chẳng hề vơi đi mà cả gian phòng càng rực sáng.',
      'Kết thúc mỗi chuyến hành hương bằng lời kệ hồi hướng giúp phá trừ tâm ích kỷ nhỏ hẹp.'
    ],
    example: 'Tại trạm số 8 (Bảo Tháp Thất Phật), bốn câu kệ hồi hướng vang lên khép lại hành trình đi chùa trong niềm hoan hỷ.',
    practice: 'Thuộc lòng 4 câu: "Nguyện đem công đức này, Hướng về khắp tất cả, Đệ tử và chúng sanh, Đều trọn thành Phật đạo."',
    quiz: {
      question: 'Theo giáo lý Phước Thiện (Quyển 5), khi ta hồi hướng công đức lành cho mọi người thì phước của ta thay đổi thế nào?',
      options: [
        'Bị giảm đi một nửa',
        'Không hề hao tổn mà còn sinh thêm một cội phước mới gọi là "Phước Hồi Hướng" (Pattidāna-maya)',
        'Biến mất hoàn toàn'
      ],
      correctIndex: 1,
      explanation: 'Hồi hướng là một trong 10 cội phước thiện; càng chia sẻ bằng tâm hoan hỷ, phước báu càng tăng trưởng.'
    }
  },

  // === GÓI C (6 bài) ===
  {
    id: 'C1',
    pathId: 'C',
    order: 1,
    title: 'Phương pháp Thiền căn bản (Ajahn Brahm): An trú hiện tại',
    duration: '12 phút',
    audio: 's6_dan.mp3',
    sourceBook: 'Phương Pháp Thiền Căn Bản — Thiền sư Ajahn Brahm',
    summary: [
      'Giai đoạn 1: Buông bỏ gánh nặng quá khứ (đã qua) và tương lai (chưa tới) để bước vào căn phòng tĩnh lặng của Giây Phút Hiện Tại.',
      'Giai đoạn 2: Trở về nhận biết hơi thở tự nhiên với thái độ nâng niu, không kiểm soát hay gồng ép.',
      'Khi tâm tĩnh lặng và hỷ lạc, hơi thở trở nên êm dịu, mở cánh cửa đi vào định tĩnh sâu sắc.'
    ],
    example: 'Ngồi trên bồ đoàn trong Giảng đường Phật pháp Chùa Vĩnh Tràng, nhìn ánh nắng xuyên qua khung cửa gỗ và buông thư đôi vai theo đúng hướng dẫn của Thiền sư Ajahn Brahm.',
    practice: 'Thực hành 3 phút "Tĩnh lặng trong hiện tại": mỗi khi tâm nhớ việc cũ hay lo việc mai, nhẹ nhàng mỉm cười quay về hơi thở.',
    quiz: {
      question: 'Trong sách "Phương Pháp Thiền Căn Bản", Thiền sư Ajahn Brahm ví quá khứ và tương lai như điều gì cần buông xuống khi vào thiền?',
      options: [
        'Hai chiếc va-li nặng trĩu trên hai tay cần đặt xuống đất để được thảnh thơi trong giây phút hiện tại',
        'Hai món trang sức cần mang theo mãi',
        'Điều quan trọng hơn hiện tại'
      ],
      correctIndex: 0,
      explanation: 'Buông hai chiếc túi quá khứ và tương lai xuống giúp tâm nghỉ ngơi trọn vẹn trong hiện tại nhiệm mầu.'
    }
  },
  {
    id: 'C2',
    pathId: 'C',
    order: 2,
    title: 'Chuyển hóa cơn giận & Nghệ thuật Lắng nghe sâu',
    duration: '12 phút',
    audio: 's3_giang_duong.mp3',
    sourceBook: 'Tích Truyện Pháp Cú (Phẩm Phẫn Nộ) & Tu Dưỡng Tâm Từ',
    summary: [
      'Kinh Pháp Cú dạy: "Lấy không giận thắng giận, lấy thiện thắng không thiện".',
      'Khi cơn giận khởi lên, đừng vội nói hay hành động; hãy quay về ôm ấp và làm dịu hơi thở của chính mình trước.',
      'Lắng nghe sâu bằng tâm từ bi giúp tháo gỡ hiểu lầm trong gia đình.'
    ],
    example: 'Khi có bất đồng, nhớ lại hình ảnh tôn giả Hàng Long La Hán tại Chánh điện Vĩnh Tràng — hàng phục con rồng sân hận bằng trí tuệ tĩnh lặng.',
    practice: 'Hôm nay hãy lắng nghe một người thân tâm sự trọn vẹn 5 phút mà không ngắt lời hay phán xét.',
    quiz: {
      question: 'Theo Kinh Pháp Cú (kệ 223), phương pháp tối thắng để hóa giải lòng sân giận và oán hận là gì?',
      options: [
        'Đáp trả mạnh mẽ hơn',
        'Lấy tâm Không Giận (Từ nhẫn) để cảm hóa cái giận, lấy điều lành thắng điều chưa lành',
        'Im lặng thù ghét trong lòng'
      ],
      correctIndex: 1,
      explanation: '"Hận thù diệt hận thù, đời này không thể có; Từ bi diệt hận thù, là định luật ngàn thu."'
    }
  },
  {
    id: 'C3',
    pathId: 'C',
    order: 3,
    title: 'Đạo Hiếu trong Phật giáo: Cha mẹ là hai vị Phật tại gia',
    duration: '12 phút',
    audio: 's6_ke_1.mp3',
    sourceBook: 'Phật Học Phổ Thông Quyển 1 & Kinh Báo Hiếu Công Đức Phụ Mẫu Ân',
    summary: [
      'Đức Phật dạy: "Tâm hiếu là tâm Phật, hạnh hiếu là hạnh Phật".',
      'Thờ Phật ở xa không bằng hiếu kính, phụng dưỡng cha mẹ hiện tiền ngay trong gia đình.',
      'Đại hiếu trọn vẹn nhất là vừa chăm sóc thân cha mẹ ấm êm, vừa hướng dẫn cha mẹ biết quy y Tam Bảo, giữ giới, làm lành.'
    ],
    example: 'Trong tính năng Chụp ảnh UGC Chùa Vĩnh Tràng, bạn có thể chọn chế độ "Gia đình 3 thế hệ (Nam + Nữ + Trẻ em)" để lưu giữ khoảnh khắc hiếu hạnh sum vầy.',
    practice: 'Nói một lời biết ơn hoặc đỡ đần cha mẹ một công việc nhỏ trong hôm nay.',
    quiz: {
      question: 'Trong Kinh Tăng Chi Bộ, Đức Phật dạy cách báo đáp trọn vẹn nhất công ơn sinh thành dưỡng dục của cha mẹ là gì?',
      options: [
        'Chỉ chu cấp tiền bạc là đủ',
        'Vừa phụng dưỡng chu đáo bằng lòng kính yêu, vừa khuyến hóa cha mẹ có niềm tin nơi Tam Bảo, giữ giới, bố thí và trí tuệ',
        'Đợi đến rằm tháng Bảy mới nhớ tới'
      ],
      correctIndex: 1,
      explanation: 'Giúp cha mẹ an vui cả đời này lẫn gieo nhân lành giải thoát nhiều đời sau là đại hiếu viên mãn.'
    }
  },
  {
    id: 'C4',
    pathId: 'C',
    order: 4,
    title: 'Thiền hành & Thiền trà trong đời sống bận rộn',
    duration: '11 phút',
    audio: 'day_di.mp3',
    sourceBook: 'Tu Dưỡng Tâm Từ Bằng Thiền Chánh Niệm (Tứ Oai Nghi Đi – Đứng – Nằm – Ngồi)',
    summary: [
      'Chánh niệm không chỉ giới hạn lúc ngồi xếp bằng mà tiếp nối trong cả 4 oai nghi: Đi, Đứng, Nằm, Ngồi.',
      'Khi bước đi trên sân chùa, biết rõ từng bước chân chạm mặt đá mát lành.',
      'Khi nâng chén trà sen, tâm hoàn toàn có mặt với hương trà và người đối diện.'
    ],
    example: 'Tản bộ quanh vườn bonsai Mai Chiếu Thủy và hoa giấy hồng ở sân chùa Vĩnh Tràng với tâm thư thái.',
    practice: 'Khi uống ly nước hoặc tách trà chiều nay, hãy dừng mọi việc khác trong 1 phút để cảm nhận hơi ấm nơi lòng bàn tay.',
    quiz: {
      question: 'Mục đích chính của Thiền hành (đi bộ trong chánh niệm) là gì?',
      options: [
        'Đi thật nhanh cho kịp giờ',
        'Đưa tâm trở về hợp nhất với thân trong từng bước chân bình an nơi hiện tại',
        'Vừa đi vừa suy tính công việc'
      ],
      correctIndex: 1,
      explanation: 'Thiền hành giúp thân và tâm cùng có mặt ở đây và bây giờ, mỗi bước chân đều nở hoa sen.'
    }
  },
  {
    id: 'C5',
    pathId: 'C',
    order: 5,
    title: 'Buông xả lo âu & Giấc ngủ an lành của người có Tâm Từ',
    duration: '11 phút',
    audio: 's5_nirvana.mp3',
    sourceBook: 'Tu Dưỡng Tâm Từ Bằng Thiền Chánh Niệm (11 Phước Báu Của Tâm Từ)',
    summary: [
      'Kinh Tăng Chi nêu 11 lợi ích của người tu tập Tâm Từ: Ngủ an lành, Thức dậy an lành, Không ác mộng, Được người và chư thiên quý mến, Sắc mặt hiền hòa, Tâm dễ định tĩnh...',
      'Thực tập buông thư toàn thân từ đỉnh đầu xuống bàn chân trước khi ngủ.',
      'Thầm gửi lời tha thứ cho mình và cho mọi người trước khi khép mắt.'
    ],
    example: 'Tư thế Cát Tường an nhiên của tôn tượng Phật Niết Bàn dài 32m tại Vĩnh Tràng nhắc ta biết buông xuống những gánh nặng không cần thiết.',
    practice: 'Trước khi ngủ tối nay, thực tập tha thứ và rải tâm từ trong 2 phút để đón nhận giấc ngủ sâu bình yên.',
    quiz: {
      question: 'Theo Kinh điển Pali (trích trong sách Tu Dưỡng Tâm Từ), người thường xuyên thực hành rải Tâm Từ trước khi ngủ sẽ nhận được phước lành nào ngay trong đêm?',
      options: [
        'Ngủ an lành, thức dậy an lành, không gặp ác mộng và gương mặt tươi sáng',
        'Thức trắng đêm suy nghĩ',
        'Mơ thấy tranh đấu'
      ],
      correctIndex: 0,
      explanation: 'Đức Phật dạy 11 phước báu hiện tiền của Tâm Từ, đứng đầu là "Ngủ an lạc, thức dậy an lạc, không thấy ác mộng".'
    }
  },
  {
    id: 'C6',
    pathId: 'C',
    order: 6,
    title: 'Hạnh Tri Ân, Báo Ân & Tri Túc Thường Lạc',
    duration: '12 phút',
    audio: 's7_tam_biet.mp3',
    sourceBook: 'Phật Học Phổ Thông Quyển 1 & Kinh Di Giáo',
    summary: [
      'Đức Phật dạy người biết ơn và đền ơn (Tri ân – Báo ân) là biểu hiện của bậc thiện nhân giữa cuộc đời.',
      'Tứ trọng ân: Ân cha mẹ, Ân Tam Bảo – thầy tổ, Ân quốc gia xã hội, Ân chúng sanh vạn loại.',
      'Kinh Di Giáo dạy: "Người biết đủ (Tri túc) tuy nằm trên đất vẫn thấy an vui; người không biết đủ dù ở thiên đường cũng chưa vừa ý."'
    ],
    example: 'Viết 3 điều biết ơn vào cuốn Sổ tay hoa sen lưu niệm mỗi tối giúp tâm hồn luôn ấm áp.',
    practice: 'Viết ra 3 điều giản dị mà bạn cảm thấy biết ơn trong ngày hôm nay.',
    quiz: {
      question: 'Lời dạy cuối cùng của Đức Phật trong Kinh Di Giáo về hạnh "Tri túc" (Biết đủ) mang ý nghĩa gì?',
      options: [
        'Lười biếng không làm việc',
        'Biết đủ và trân trọng những gì mình đang có bằng chánh mạng, không để lòng tham lam bất tận làm khổ tâm',
        'Đòi hỏi thật nhiều'
      ],
      correctIndex: 1,
      explanation: '"Tri túc chi pháp, tức thị phú lạc an ổn chi xứ" — Hạnh biết đủ chính là nơi giàu có, an vui và bình ổn nhất.'
    }
  },

  // === GÓI D (6 bài) ===
  {
    id: 'D1',
    pathId: 'D',
    order: 1,
    title: 'Lịch sử Chùa Vĩnh Tràng — Cổ tự trăm năm miền Tây',
    duration: '11 phút',
    audio: 's0_chao.mp3',
    sourceBook: 'Biên Niên Sử Danh Lam Chùa Vĩnh Tràng (Mỹ Tho · Tiền Giang)',
    summary: [
      'Khởi dựng từ đầu thế kỷ XIX tại làng Mỹ Hóa (nay thuộc TP. Mỹ Tho, Tiền Giang) bởi ông bà Tri huyện Bùi Công Đạt.',
      'Năm 1849, Hòa thượng Thích Huệ Đăng từ chùa Giác Lâm (Gia Định) về trụ trì, đại trùng tu và đặt tên chùa Vĩnh Tràng ("Vĩnh cửu đối sơn trang").',
      'Trải qua các đợt trùng tu lớn năm 1907 và 1933, chùa được công nhận Di tích lịch sử – văn hóa cấp Quốc gia năm 1984.'
    ],
    example: 'Ngay từ cổng Tam Quan ghép mảnh sành sứ năm 1933 bởi nghệ nhân Huế, du khách đã cảm nhận được bề dày lịch sử gần 200 năm.',
    practice: 'Quan sát kỹ các bức phù điêu sành sứ và hàng cột vòm trước mặt tiền Chánh điện.',
    quiz: {
      question: 'Tên gọi "Vĩnh Tràng" do Hòa thượng Thích Huệ Đăng đặt năm 1849 bắt nguồn từ câu đối mang ý nghĩa gì?',
      options: [
        'Vĩnh cửu đối sơn trang, Tràng nghiêm quy hải tạng (Mãi mãi trang nghiêm bền vững cùng non sông biển rộng)',
        'Ngôi chùa nhỏ bên sông',
        'Nơi buôn bán sầm uất'
      ],
      correctIndex: 0,
      explanation: 'Tên chùa lấy hai chữ đầu của câu đối "Vĩnh cửu đối sơn trang, Tràng nghiêm quy hải tạng".'
    }
  },
  {
    id: 'D2',
    pathId: 'D',
    order: 2,
    title: 'Kiến trúc giao thoa Á – Âu độc đáo của Chánh Điện',
    duration: '11 phút',
    audio: 's3_lay_phat.mp3',
    sourceBook: 'Nghiên Cứu Kiến Trúc Mỹ Thuật Cổ Tự Nam Bộ',
    summary: [
      'Mặt tiền kết hợp hài hòa vòm cửa La Mã, thức cột Corinth/Phục Hưng, bông sắt Pháp với mái chùa cổ truyền Việt Nam và hoa văn Khmer.',
      'Bên trong nội điện giữ trọn cấu trúc gỗ truyền thống kiểu chữ Quốc (國) gồm Tiền đường, Chánh điện, Nhà tổ và Nhà hậu với 7 bộ bao lam chạm thếp vàng.',
      'Hàng hiên gạch bông và phù điêu gốm sứ màu lam – vàng tạo nên vẻ đẹp độc nhất vô nhị.'
    ],
    example: 'Trong cảnh 3D chính của ứng dụng, bạn thấy rõ 7 vòm cửa uốn cong vàng ấm cùng phù điêu gốm xanh trắng đặc trưng Vĩnh Tràng.',
    practice: 'Di chuyển nhân vật lại gần bậc thềm Chánh điện hoặc chụp một tấm ảnh UGC trước mặt tiền Á – Âu.',
    quiz: {
      question: 'Nét đặc sắc nổi bật nhất về mặt kiến trúc của mặt tiền Chánh điện Chùa Vĩnh Tràng là gì?',
      options: [
        'Hoàn toàn bằng bê tông hiện đại',
        'Sự kết hợp nhuần nhuyễn giữa nghệ thuật kiến trúc Á Đông cổ truyền (mái ngói, tứ linh) và nét trang trí Phục Hưng – La Mã phương Tây',
        'Xây dựng hoàn toàn bằng đá xanh'
      ],
      correctIndex: 1,
      explanation: 'Chùa Vĩnh Tràng nổi tiếng khắp Đông Nam Á nhờ sự giao thoa kiến trúc Đông – Tây đầy thẩm mỹ.'
    }
  },
  {
    id: 'D3',
    pathId: 'D',
    order: 3,
    title: 'Bộ tượng Thập Bát La Hán gỗ mít trăm tuổi (1907)',
    duration: '11 phút',
    audio: 's3_lay_phat.mp3',
    sourceBook: 'Di Sản Điêu Khắc Cổ Chùa Vĩnh Tràng',
    summary: [
      'Gồm 18 pho tượng La Hán tạc bằng gỗ mít cổ thụ từ năm 1907 đặt dọc hai tường bên nội điện.',
      'Mỗi vị cao khoảng 0.8m–1m, cưỡi linh thú hoặc cầm pháp khí riêng: Tọa Lộc, Khánh Hỷ, Cử Bát, Thác Tháp, Tĩnh Tọa, Quá Giang, Kỵ Tượng, Tiếu Sư, Khai Tâm, Hàng Long, Phục Hổ...',
      'Thể hiện đỉnh cao nghệ thuật điêu khắc gỗ tâm linh Nam Bộ đầu thế kỷ XX.'
    ],
    example: 'Mỗi vị La Hán tuy diện mạo khác nhau nhưng đều biểu thị trí tuệ đã chiến thắng phiền não nội tâm.',
    practice: 'Vào mục Khám phá -> Thập Bát La Hán để xem chi tiết ý nghĩa từng vị trong 18 vị La Hán Chùa Vĩnh Tràng.',
    quiz: {
      question: 'Bộ tượng 18 vị La Hán nổi tiếng tại Chùa Vĩnh Tràng được chế tác năm 1907 từ chất liệu gì?',
      options: ['Đá hoa cương', 'Gỗ mít cổ thụ chạm khắc thủ công sơn thếp vàng', 'Thạch cao'],
      correctIndex: 1,
      explanation: 'Các nghệ nhân miền Nam xưa đã dùng gỗ mít già bền chắc để chạm khắc sống động 18 vị La Hán.'
    }
  },
  {
    id: 'D4',
    pathId: 'D',
    order: 4,
    title: 'Ba pho Đại Tượng lộ thiên: Di Lặc – A Di Đà – Niết Bàn',
    duration: '11 phút',
    audio: 's4_dilac.mp3',
    sourceBook: 'Quy Hoạch Khuôn Viên 2 Hecta Chùa Vĩnh Tràng',
    summary: [
      'Đại tượng Phật A Di Đà đứng cao 18m (tính cả bệ 24m) biểu trưng cho từ bi tiếp dẫn.',
      'Đại tượng Phật Di Lặc ngồi cao 20m, rộng 18m với nụ cười hoan hỷ bao dung.',
      'Đại tượng Phật Thích Ca Niết Bàn dài 32m an nhiên giữa vườn cây xanh mát.'
    ],
    example: 'Ba pho đại tượng tạo thành thế Tam Tôn lộ thiên hùng vĩ giữa khuôn viên 2 hecta của nhà chùa.',
    practice: 'Bấm vào Bản đồ Khuôn viên 9 Khu vực để di chuyển đến chiêm bái lần lượt cả 3 pho đại tượng.',
    quiz: {
      question: 'Ba pho đại tượng trắng lộ thiên nổi tiếng trong khuôn viên Chùa Vĩnh Tràng gồm những tôn tượng nào?',
      options: [
        'Phật A Di Đà đứng, Phật Di Lặc ngồi và Phật Thích Ca nhập Niết Bàn',
        'Ba tượng Hộ Pháp',
        'Ba tượng Quan Công'
      ],
      correctIndex: 0,
      explanation: 'Đây là 3 công trình điêu khắc Phật giáo quy mô lớn tạo điểm nhấn tâm linh cho toàn khuôn viên.'
    }
  },
  {
    id: 'D5',
    pathId: 'D',
    order: 5,
    title: 'Nghi thức đi chùa đúng pháp: Trang phục, Đi đứng & Thắp hương',
    duration: '11 phút',
    audio: 's3_bo_dep.mp3',
    sourceBook: 'Cẩm Nang Oai Nghi Phật Tử Tại Gia',
    summary: [
      'Trang phục kín đáo, trang nhã (như bộ áo tràng lam Phật tử 5 nút cổ tàu cho Nữ, Nam và Trẻ em).',
      'Vào chùa đi cửa bên (Giả quan / Không quan), không dẫm lên bậu cửa gỗ, bỏ dép trước khi vào nội điện.',
      'Chỉ thắp 1 đến 3 nén hương tại lư hương ngoài sân, phẩy tắt lửa bằng tay chứ không thổi bằng miệng.'
    ],
    example: 'Ba nhân vật Phật tử (Nam, Nữ, Trẻ em) trong Chùa Online đều mặc pháp phục kín đáo, thực hiện đúng 4 bước dâng hương ngoài sân trước khi vào lễ Phật.',
    practice: 'Thực hành trọn vẹn quy trình 4 bước Dâng hương và 3 lạy Lễ Phật ngay trên giao diện chính.',
    quiz: {
      question: 'Khi nén hương bốc lửa lúc châm, người đi chùa nên làm gì cho đúng oai nghi?',
      options: [
        'Dùng miệng thổi mạnh cho tắt',
        'Cầm hương phẩy nhẹ bằng tay cho tắt lửa rồi mới nâng ngang trán khấn nguyện',
        'Cắm ngay khi lửa còn cháy to'
      ],
      correctIndex: 1,
      explanation: 'Theo truyền thống Phật giáo, hơi thở từ miệng được xem là bất tịnh đối với hương dâng Phật nên ta dùng tay phẩy nhẹ.'
    }
  },
  {
    id: 'D6',
    pathId: 'D',
    order: 6,
    title: 'Ý nghĩa Dâng Hoa Sen, Chuông Chùa & Lưu Bút Hành Hương Chánh Tín',
    duration: '10 phút',
    audio: 'merit_box.mp3',
    sourceBook: 'Phật Học Phổ Thông & Văn Hóa Đi Chùa Việt Nam',
    summary: [
      'Dâng hoa sen tượng trưng cho việc tu nhân thiện lành (hoa) để kết thành quả giác ngộ (gương sen) ngay trong hiện tại.',
      'Thỉnh chuông chùa và dạo bước chánh niệm quanh 9 điểm hành hương giúp buông xả căng thẳng, nuôi dưỡng tâm từ bi.',
      'Lưu giữ bức ảnh kỷ niệm cùng Chùa Vĩnh Tràng sau khi lễ Phật là cách nhắc nhở bản thân và gia đình giữ gìn nếp sống hướng thiện.'
    ],
    example: 'Bạn có thể vào mục "📸 Chụp ảnh UGC" sau khi hoàn thành một nghi lễ để lưu giữ kỷ niệm gia đình 3 nhân vật trước Chùa Vĩnh Tràng.',
    practice: 'Dâng hoa sen bên Hồ Sen và lưu giữ một bức ảnh kỷ niệm trang nghiêm cùng Chùa Vĩnh Tràng.',
    quiz: {
      question: 'Trong truyền thống Phật giáo, hoa sen dâng Phật mang biểu trưng đặc biệt nào?',
      options: [
        'Chỉ có hoa mà không có quả',
        'Hoa và gương sen (nhân và quả) cùng hiện hữu một lúc, mọc từ bùn nhưng chẳng hôi tanh mùi bùn',
        'Chỉ nở vào ban đêm'
      ],
      correctIndex: 1,
      explanation: 'Hoa sen là loài hoa duy nhất vừa nở hoa vừa kết gương sen cùng lúc, tượng trưng cho lý Nhân Quả đồng thời và sự thanh tịnh giữa cuộc đời.'
    }
  }
];

export const PATH_TO_COURSE_ID = {
  A: 'course_1_khai_tam',
  B: 'course_2_tam_bao',
  C: 'course_3_thien_dinh',
  D: 'course_4_di_san'
};

for (const lesson of LECTURE_LESSONS) {
  lesson.courseId = PATH_TO_COURSE_ID[lesson.pathId] || 'course_1_khai_tam';
}

export function getLessonsByPath(pathId = 'A') {
  return LECTURE_LESSONS.filter((l) => l.pathId === pathId).sort((a, b) => a.order - b.order);
}

export function gradeLessonQuiz(lessonId, selectedIndex) {
  const lesson = LECTURE_LESSONS.find((l) => l.id === lessonId);
  if (!lesson) {
    return { found: false, correct: false, explanation: '' };
  }
  const correct = Number(selectedIndex) === lesson.quiz.correctIndex;
  return {
    found: true,
    correct,
    correctIndex: lesson.quiz.correctIndex,
    explanation: lesson.quiz.explanation
  };
}
