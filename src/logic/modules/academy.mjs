/**
 * Học viện Phật học: khóa, học phần, thi, VietQR, chứng nhận.
 * (Tách từ chua-online-logic.mjs — import từ '/src/logic/chua-online-logic.mjs' vẫn dùng được.)
 */
import { LECTURE_LESSONS } from './lectures.mjs';
import { getLocalDateKey } from './daily-dharma.mjs';

// ============================================================================
// 4. STRUCTURED PAID HỌC VIỆN PHẬT HỌC (BUDDHIST ACADEMY)
// ============================================================================
export const ACADEMY_COURSES = [
  {
    id: 'course_1_khai_tam',
    order: 1,
    pathId: 'A',
    tier: 'basic',
    title: 'Khóa 1: Khai Tâm Nhập Môn Phật Học',
    subtitle: 'Trải nghiệm miễn phí · Tam Bảo, Ngũ Giới, Nhân Quả & Giáo Trình Phật Học Toàn Tập',
    priceVnd: 0,
    priceLabel: '0đ (Mở sẵn)',
    isFree: true,
    unlockedByDefault: true,
    passScore: 70,
    bookIds: ['phpt_1', 'giao_trinh_phat_hoc_toan_tap'],
    lessonIds: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
    estimatedHours: 3.5,
    badge: 'Miễn phí · Khai Tâm'
  },
  {
    id: 'course_2_tam_bao',
    order: 2,
    pathId: 'B',
    tier: 'intermediate',
    title: 'Khóa 2: Nền Tảng Tam Bảo, Quy Y & Phước Thiện',
    subtitle: 'Chuyên sâu 4 bộ Nền Tảng Phật Giáo (Q.1, Q.2, Q.4, Q.5) · Tam Bảo, Nghiệp Quả & Hồi Hướng',
    priceVnd: 199000,
    priceLabel: '199.000đ',
    isFree: false,
    unlockedByDefault: false,
    passScore: 75,
    bookIds: ['nen_tang_1_tam_bao', 'nen_tang_2_quy_y', 'nen_tang_4_nghiep', 'nen_tang_5_phuoc'],
    lessonIds: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'],
    estimatedHours: 5.0,
    badge: 'Nền Tảng Cư Sĩ'
  },
  {
    id: 'course_3_thien_dinh',
    order: 3,
    pathId: 'C',
    tier: 'meditation',
    title: 'Khóa 3: Thiền Định Ajahn Brahm & Tu Dưỡng Tâm Từ',
    subtitle: 'Thực hành Thiền Căn Bản buông xả, Thiền Chánh Niệm và Rải Tâm Từ chữa lành',
    priceVnd: 249000,
    priceLabel: '249.000đ',
    isFree: false,
    unlockedByDefault: false,
    passScore: 75,
    bookIds: ['thien_ajahn_brahm', 'tu_duong_tam_tu'],
    lessonIds: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
    estimatedHours: 4.5,
    badge: 'Thiền Tập Chuyên Sâu'
  },
  {
    id: 'course_4_di_san',
    order: 4,
    pathId: 'D',
    tier: 'heritage',
    title: 'Khóa 4: Lịch Sử, Nghi Lễ Vĩnh Tràng & Kinh Pháp Cú',
    subtitle: 'Đức Phật Dạy Những Gì, Tích Truyện Pháp Cú, Phật Học Phổ Thông Q.3 & Di sản Cổ Tự 1849',
    priceVnd: 299000,
    priceLabel: '299.000đ',
    isFree: false,
    unlockedByDefault: false,
    passScore: 80,
    bookIds: ['duc_phat_day_nhung_gi', 'tich_truyen_phap_cu', 'phpt_3'],
    lessonIds: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'],
    estimatedHours: 5.5,
    badge: 'Di Sản & Kinh Điển'
  }
];

export const ACADEMY_ALL_IN_BUNDLE = {
  id: 'bundle_tron_doi',
  title: 'Gói Học Viên Trọn Đời (Tất cả 4 Khóa + 11 Giáo trình PDF)',
  priceVnd: 599000,
  priceLabel: '599.000đ',
  includesCourses: ACADEMY_COURSES.map((c) => c.id)
};

export const ACADEMY_MODULES = [
  // Khóa 1
  {
    id: 'mod_1_1',
    courseId: 'course_1_khai_tam',
    order: 1,
    title: 'Học phần 1.1: Quy Y Tam Bảo & Năm Giới Hộ Thân',
    bookIds: ['phpt_1'],
    lessonIds: ['A1', 'A2'],
    estimatedMinutes: 45,
    extraQuizzes: [
      {
        id: 'Q_1_1_1',
        question: 'Trong Nền Tảng Phật Giáo, quy y "Pháp Bảo" có nghĩa thiết thực nhất là gì?',
        options: [
          'Chỉ cất giữ kinh sách trên tủ cao',
          'Học hiểu và thực hành lời dạy chân chánh của Đức Phật vào đời sống hằng ngày',
          'Chờ đợi phép màu ban phát'
        ],
        correctIndex: 1,
        explanation: 'Pháp Bảo chỉ thực sự phát huy tác dụng chữa lành khi hành giả thực hành theo Chánh pháp.'
      },
      {
        id: 'Q_1_1_2',
        question: 'Vì sao Ngũ Giới được gọi là "Ngũ Đại Thí" (5 món quà lớn tặng đời)?',
        options: [
          'Vì giữ giới là trao sự không sợ hãi và an toàn cho bản thân, gia đình và muôn loài',
          'Vì phải đóng lệ phí lớn',
          'Vì chỉ người già mới giữ'
        ],
        correctIndex: 0,
        explanation: 'Không sát hại, không trộm cắp, không tà hạnh, không dối gạt, không say nghiện mang lại bình an cho tất cả.'
      }
    ]
  },
  {
    id: 'mod_1_2',
    courseId: 'course_1_khai_tam',
    order: 2,
    title: 'Học phần 1.2: Tứ Diệu Đế & Luật Nhân Quả Chuyển Hóa',
    bookIds: ['giao_trinh_phat_hoc_toan_tap'],
    lessonIds: ['A3', 'A4'],
    estimatedMinutes: 55,
    extraQuizzes: [
      {
        id: 'Q_1_2_1',
        question: 'Trong Tứ Diệu Đế, sự thật thứ tư (Đạo Đế) chỉ ra con đường thoát khổ là gì?',
        options: ['Bát Chánh Đạo', 'Trốn tránh cuộc đời', 'Cầu khẩn thần linh'],
        correctIndex: 0,
        explanation: 'Bát Chánh Đạo là con đường trung đạo gồm 8 yếu tố đưa đến chấm dứt khổ đau.'
      },
      {
        id: 'Q_1_2_2',
        question: 'Theo Giáo Trình Phật Học Toàn Tập, Nhân Quả có phải là định mệnh bất biến không?',
        options: [
          'Đúng, không thể thay đổi gì',
          'Không, hiện tại biết tu tập Thân – Khẩu – Ý thiện lành sẽ chuyển hóa được quả tương lai',
          'Chỉ xảy ra ở kiếp sau'
        ],
        correctIndex: 1,
        explanation: 'Phật giáo dạy nhân duyên quả luôn vận hành động; chuyển tâm và hành động hiện tại là chuyển nghiệp.'
      }
    ]
  },
  {
    id: 'mod_1_3',
    courseId: 'course_1_khai_tam',
    order: 3,
    title: 'Học phần 1.3: Bát Chánh Đạo & Lục Độ Giữa Đời Thường',
    bookIds: ['phpt_1', 'giao_trinh_phat_hoc_toan_tap'],
    lessonIds: ['A5', 'A6'],
    estimatedMinutes: 50,
    extraQuizzes: [
      {
        id: 'Q_1_3_1',
        question: 'Nghề nghiệp chân chính (Chánh mạng) trong Bát Chánh Đạo đòi hỏi điều gì?',
        options: [
          'Nuôi sống bản thân bằng nghề lương thiện, không gây tổn hại cho mình và chúng sanh',
          'Kiếm tiền bằng mọi giá',
          'Không cần làm việc'
        ],
        correctIndex: 0,
        explanation: 'Chánh mạng là nghề nghiệp hợp đạo đức, không buôn bán sinh mạng hay chất độc hại.'
      }
    ]
  },

  // Khóa 2
  {
    id: 'mod_2_1',
    courseId: 'course_2_tam_bao',
    order: 1,
    title: 'Học phần 2.1: Ân Đức Tam Bảo & Quy Y Nội Tâm',
    bookIds: ['nen_tang_1_tam_bao', 'nen_tang_2_quy_y'],
    lessonIds: ['B1', 'B2'],
    estimatedMinutes: 60,
    extraQuizzes: [
      {
        id: 'Q_2_1_1',
        question: 'Theo Nền Tảng Phật Giáo Q.1, danh hiệu "Sammāsambuddho" (Chánh Đẳng Giác) biểu thị ân đức nào?',
        options: [
          'Tự mình giác ngộ hoàn toàn chân lý Tứ Đế không thầy chỉ dạy',
          'Chỉ học thuộc lòng kinh sách',
          'Có quyền năng ban thưởng vật chất'
        ],
        correctIndex: 0,
        explanation: 'Đức Phật tự chứng ngộ chân lý tối thượng và chỉ dạy lại cho thế gian.'
      },
      {
        id: 'Q_2_1_2',
        question: 'Quy Y Tam Bảo nội tâm (Quy y tự tánh) giúp người Phật tử điều gì?',
        options: [
          'Luôn quay về soi sáng tâm mình bằng Giác, Chánh, Tịnh thay vì tìm cầu bên ngoài',
          'Không cần đến chùa nữa',
          'Chỉ đọc chữ không cần hiểu'
        ],
        correctIndex: 0,
        explanation: 'Quy y hình thức là cửa ngõ, quy y nội tâm là sự chuyển hóa thật sự bên trong.'
      }
    ]
  },
  {
    id: 'mod_2_2',
    courseId: 'course_2_tam_bao',
    order: 2,
    title: 'Học phần 2.2: Nghiệp – Quả & Niệm Phật Nhiếp Tâm',
    bookIds: ['nen_tang_4_nghiep'],
    lessonIds: ['B3', 'B4'],
    estimatedMinutes: 65,
    extraQuizzes: [
      {
        id: 'Q_2_2_1',
        question: 'Trong 10 thiện nghiệp (Thập thiện), 3 nghiệp thuộc về Thân là gì?',
        options: [
          'Không sát sanh, không trộm cắp, không tà hạnh',
          'Không nói dối, không nói hai lưỡi, không nói ác',
          'Không tham, không sân, không si'
        ],
        correctIndex: 0,
        explanation: 'Thân có 3 thiện nghiệp, Khẩu có 4 thiện nghiệp và Ý có 3 thiện nghiệp.'
      }
    ]
  },
  {
    id: 'mod_2_3',
    courseId: 'course_2_tam_bao',
    order: 3,
    title: 'Học phần 2.3: Mười Cội Phước Thiện & Hồi Hướng Công Đức',
    bookIds: ['nen_tang_5_phuoc'],
    lessonIds: ['B5', 'B6'],
    estimatedMinutes: 60,
    extraQuizzes: [
      {
        id: 'Q_2_3_1',
        question: 'Trong 10 cội phước thiện (Quyển 5), phước báu nào được xem là tối thượng về trí tuệ?',
        options: [
          'Phước Chánh kiến (Diṭṭhijukamma) và Phước Tham thiền (Bhāvanā)',
          'Chỉ bố thí vật chất mà tâm còn sân hận',
          'Khoe khoang công đức'
        ],
        correctIndex: 0,
        explanation: 'Tham thiền và Chánh kiến thanh lọc tận gốc phiền não, nâng đỡ các phước thiện khác.'
      }
    ]
  },

  // Khóa 3
  {
    id: 'mod_3_1',
    courseId: 'course_3_thien_dinh',
    order: 1,
    title: 'Học phần 3.1: Bốn Giai Đoạn Thiền Căn Bản (Ajahn Brahm)',
    bookIds: ['thien_ajahn_brahm'],
    lessonIds: ['C1', 'C2'],
    estimatedMinutes: 55,
    extraQuizzes: [
      {
        id: 'Q_3_1_1',
        question: 'Khi tâm bị phân tán trong lúc theo dõi hơi thở, Thiền sư Ajahn Brahm khuyên thái độ nào là đúng nhất?',
        options: [
          'Bực bội tự trách mình dở',
          'Mỉm cười dịu dàng nhận biết sự phân tâm rồi nhẹ nhàng đưa chú ý trở lại hơi thở',
          'Đứng dậy bỏ ngang buổi thiền'
        ],
        correctIndex: 1,
        explanation: 'Thái độ dịu dàng, buông bỏ kiểm soát giúp hơi thở tự nhiên lắng dịu.'
      }
    ]
  },
  {
    id: 'mod_3_2',
    courseId: 'course_3_thien_dinh',
    order: 2,
    title: 'Học phần 3.2: Thiền Hành, Thiền Trà & Đạo Hiếu Trong Gia Đình',
    bookIds: ['tu_duong_tam_tu'],
    lessonIds: ['C3', 'C4'],
    estimatedMinutes: 50,
    extraQuizzes: [
      {
        id: 'Q_3_2_1',
        question: 'Chánh niệm trong Tứ Oai Nghi nghĩa là gì?',
        options: [
          'Biết rõ thân tâm mình trong cả 4 tư thế: Đi, Đứng, Nằm, Ngồi',
          'Chỉ nhắm mắt ngồi yên mới gọi là tu',
          'Đi thật nhanh không cần để ý gì'
        ],
        correctIndex: 0,
        explanation: 'Thiền chánh niệm có mặt trong từng bước chân, chén trà và sinh hoạt gia đình.'
      }
    ]
  },
  {
    id: 'mod_3_3',
    courseId: 'course_3_thien_dinh',
    order: 3,
    title: 'Học phần 3.3: 11 Phước Báu Tâm Từ & Hạnh Tri Túc',
    bookIds: ['thien_ajahn_brahm', 'tu_duong_tam_tu'],
    lessonIds: ['C5', 'C6'],
    estimatedMinutes: 55,
    extraQuizzes: [
      {
        id: 'Q_3_3_1',
        question: 'Thứ tự rải Tâm Từ (Metta Bhavana) hợp lý nhất giúp tâm không gượng gạo là gì?',
        options: [
          'Từ chính mình -> người thân quý -> người trung dung -> người gây khó dễ -> khắp muôn loài',
          'Chỉ rải cho người lạ, bỏ qua mình',
          'Rải bằng sự ép buộc'
        ],
        correctIndex: 0,
        explanation: 'Tình thương chân thật khởi từ sự bình an tự thân rồi lan tỏa rộng khắp không phân biệt.'
      }
    ]
  },

  // Khóa 4
  {
    id: 'mod_4_1',
    courseId: 'course_4_di_san',
    order: 1,
    title: 'Học phần 4.1: Biên Niên Sử & Kiến Trúc Á – Âu Chùa Vĩnh Tràng',
    bookIds: ['duc_phat_day_nhung_gi'],
    lessonIds: ['D1', 'D2'],
    estimatedMinutes: 55,
    extraQuizzes: [
      {
        id: 'Q_4_1_1',
        question: 'Mặt bằng nội tự khu chùa cổ Chùa Vĩnh Tràng được bố trí theo hình chữ Hán nào?',
        options: [
          'Chữ Quốc (國) gồm Tiền đường, Chánh điện, hai Sân Thiên Tỉnh, Nhà Tổ và Nhà Hậu',
          'Chữ Nhất nằm ngang đơn lẻ',
          'Hình tròn khép kín'
        ],
        correctIndex: 0,
        explanation: 'Kiến trúc chữ Quốc (國) tạo độ sâu trang nghiêm và hai giếng trời thông thoáng tự nhiên.'
      }
    ]
  },
  {
    id: 'mod_4_2',
    courseId: 'course_4_di_san',
    order: 2,
    title: 'Học phần 4.2: Di Sản Điêu Khắc 1907 & Tam Tôn Lộ Thiên',
    bookIds: ['tich_truyen_phap_cu'],
    lessonIds: ['D3', 'D4'],
    estimatedMinutes: 60,
    extraQuizzes: [
      {
        id: 'Q_4_2_1',
        question: 'Bộ Tích Truyện Pháp Cú gồm bao nhiêu bài kệ gắn liền với các câu chuyện thời Đức Phật?',
        options: ['423 bài kệ', '12 bài kệ', '1000 bài kệ'],
        correctIndex: 0,
        explanation: 'Kinh Pháp Cú gồm 423 bài kệ chia thành 26 phẩm giàu triết lý sống.'
      }
    ]
  },
  {
    id: 'mod_4_3',
    courseId: 'course_4_di_san',
    order: 3,
    title: 'Học phần 4.3: Đại Thừa Lục Độ & Oai Nghi Hành Hương Chánh Tín',
    bookIds: ['phpt_3'],
    lessonIds: ['D5', 'D6'],
    estimatedMinutes: 55,
    extraQuizzes: [
      {
        id: 'Q_4_3_1',
        question: 'Trong Phật Học Phổ Thông Q.3, Bồ Tát Đạo khác với lối tu chỉ lo cho riêng mình ở điểm nào?',
        options: [
          'Phát đại nguyện Tứ Hoằng Thệ Nguyện, tu tập Lục Độ nhập thế vừa tự giác vừa giúp đời bớt khổ',
          'Xa lánh mọi người',
          'Không cần giữ giới'
        ],
        correctIndex: 0,
        explanation: 'Tinh thần Đại Thừa lấy từ bi và trí tuệ làm đôi cánh phụng sự chúng sanh.'
      }
    ]
  }
];

export function getAcademyExamQuestions(courseId = 'course_1_khai_tam') {
  const course = ACADEMY_COURSES.find((c) => c.id === courseId);
  if (!course) return [];
  const modules = ACADEMY_MODULES.filter((m) => m.courseId === course.id).sort((a, b) => a.order - b.order);
  const questions = [];

  for (const mod of modules) {
    for (const q of mod.extraQuizzes || []) {
      questions.push({
        id: q.id,
        moduleId: mod.id,
        source: 'module',
        question: q.question,
        options: [...q.options],
        correctIndex: q.correctIndex,
        explanation: q.explanation
      });
    }
  }
  for (const lid of course.lessonIds) {
    const lesson = LECTURE_LESSONS.find((l) => l.id === lid);
    if (lesson?.quiz) {
      questions.push({
        id: `L_${lesson.id}`,
        lessonId: lesson.id,
        source: 'lesson',
        question: lesson.quiz.question,
        options: [...lesson.quiz.options],
        correctIndex: lesson.quiz.correctIndex,
        explanation: lesson.quiz.explanation
      });
    }
  }
  return questions;
}

export function gradeAcademyExam(courseId = 'course_1_khai_tam', answers = {}) {
  const course = ACADEMY_COURSES.find((c) => c.id === courseId);
  const questions = getAcademyExamQuestions(courseId);
  if (!course || questions.length === 0) {
    return {
      ok: false,
      found: false,
      courseId,
      totalQuestions: 0,
      correctCount: 0,
      scorePercent: 0,
      passed: false,
      passScore: 70,
      details: []
    };
  }

  let correctCount = 0;
  const details = questions.map((q, idx) => {
    const rawAns = Array.isArray(answers) ? answers[idx] : answers?.[q.id];
    const selectedIndex = rawAns === undefined || rawAns === null ? -1 : Number(rawAns);
    const correct = selectedIndex === q.correctIndex;
    if (correct) correctCount += 1;
    return {
      id: q.id,
      selectedIndex,
      correctIndex: q.correctIndex,
      correct,
      explanation: q.explanation
    };
  });

  const scorePercent = Math.round((correctCount / questions.length) * 100);
  const passed = scorePercent >= course.passScore;

  return {
    ok: true,
    found: true,
    courseId: course.id,
    courseTitle: course.title,
    totalQuestions: questions.length,
    correctCount,
    scorePercent,
    passed,
    passScore: course.passScore,
    details
  };
}

export function createAcademyEntitlementState(saved = null) {
  const src = saved && typeof saved === 'object' ? saved : {};
  const validIds = new Set(ACADEMY_COURSES.map((c) => c.id));
  const rawUnlocked = Array.isArray(src.unlockedCourses) ? src.unlockedCourses : [];
  const unlockedSet = new Set(['course_1_khai_tam']);
  for (const cid of rawUnlocked) {
    if (validIds.has(cid)) unlockedSet.add(cid);
  }
  const bundleUnlocked =
    Boolean(src.bundleUnlocked) ||
    ACADEMY_COURSES.every((c) => unlockedSet.has(c.id));

  return {
    unlockedCourses: Array.from(unlockedSet),
    bundleUnlocked,
    redeemedCodes: Array.isArray(src.redeemedCodes) ? [...src.redeemedCodes] : [],
    certificates: Array.isArray(src.certificates) ? src.certificates.map((c) => ({ ...c })) : [],
    examScores: src.examScores && typeof src.examScores === 'object' ? { ...src.examScores } : {}
  };
}

export const SANDBOX_ACADEMY_CODES = new Set(['VINHTRANG2026', 'HOIAN2026']);

export function unlockAcademyCourseWithCode(state, courseId, code) {
  const nextState = createAcademyEntitlementState(state);
  const isBundle = courseId === ACADEMY_ALL_IN_BUNDLE.id || courseId === 'all';
  const targetCourse = ACADEMY_COURSES.find((c) => c.id === courseId);

  if (!isBundle && !targetCourse) {
    return {
      ok: false,
      reason: 'course_not_found',
      message: 'Không tìm thấy khóa học trong Học Viện Phật Học.',
      state: nextState,
      unlockedCourses: nextState.unlockedCourses
    };
  }

  const normalizedCode = String(code || '').trim().toUpperCase();
  const isValidCode =
    SANDBOX_ACADEMY_CODES.has(normalizedCode) ||
    /^VT-HV-[A-Z0-9]{4,16}$/.test(normalizedCode);

  if (!isValidCode) {
    return {
      ok: false,
      reason: 'invalid_code',
      message: 'Mã kích hoạt chưa hợp lệ. Định dạng đúng: VT-HV-XXXX hoặc mã thử nghiệm VINHTRANG2026.',
      state: nextState,
      unlockedCourses: nextState.unlockedCourses
    };
  }

  if (isBundle) {
    for (const c of ACADEMY_COURSES) {
      if (!nextState.unlockedCourses.includes(c.id)) {
        nextState.unlockedCourses.push(c.id);
      }
    }
    nextState.bundleUnlocked = true;
  } else {
    if (!nextState.unlockedCourses.includes(targetCourse.id)) {
      nextState.unlockedCourses.push(targetCourse.id);
    }
    nextState.bundleUnlocked = ACADEMY_COURSES.every((c) =>
      nextState.unlockedCourses.includes(c.id)
    );
  }

  if (!nextState.redeemedCodes.includes(normalizedCode)) {
    nextState.redeemedCodes.push(normalizedCode);
  }

  const targetTitle = isBundle ? ACADEMY_ALL_IN_BUNDLE.title : targetCourse.title;
  return {
    ok: true,
    courseId: isBundle ? ACADEMY_ALL_IN_BUNDLE.id : targetCourse.id,
    codeUsed: normalizedCode,
    bundleUnlocked: nextState.bundleUnlocked,
    unlockedCourses: nextState.unlockedCourses,
    state: nextState,
    message: `Kích hoạt thành công "${targetTitle}"! Mời học viên vào lớp cùng 11 bộ giáo trình PDF.`
  };
}

export function buildVietQRPayload(courseOrId = 'course_2_tam_bao') {
  const course =
    typeof courseOrId === 'string'
      ? courseOrId === ACADEMY_ALL_IN_BUNDLE.id
        ? ACADEMY_ALL_IN_BUNDLE
        : ACADEMY_COURSES.find((c) => c.id === courseOrId) || ACADEMY_COURSES[1]
      : courseOrId && typeof courseOrId === 'object'
        ? courseOrId
        : ACADEMY_COURSES[1];

  const amount = Math.max(0, Math.round(Number(course.priceVnd || 0)));
  const bankId = 'MB';
  const bankBin = '970422';
  const accountNo = '0918491849';
  const accountName = 'HOC VIEN PHAT HOC VINH TRANG';
  const shortTag = String(course.id || 'COURSE')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 14);
  const transferMemo = `VTHV ${shortTag}`.trim();
  const isFree = amount === 0;

  const qrImageUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferMemo)}&accountName=${encodeURIComponent(accountName)}`;
  const qrPayload = `VIETQR|${bankBin}|${accountNo}|${amount}|${transferMemo}`;

  return {
    courseId: course.id,
    courseTitle: course.title,
    amount,
    isFree,
    currency: 'VND',
    bankId,
    bankBin,
    bankName: 'MB Bank (Ngân hàng Quân đội)',
    accountNo,
    accountName,
    transferMemo,
    qrPayload,
    qrImageUrl,
    adapterReady: { payos: true, sepay: true }
  };
}

export function generateAcademyCertificate(
  studentName = 'Học viên Phật tử',
  courseOrId = 'course_1_khai_tam',
  score = 100,
  issuedAt = new Date()
) {
  const course =
    typeof courseOrId === 'string'
      ? ACADEMY_COURSES.find((c) => c.id === courseOrId) || ACADEMY_COURSES[0]
      : courseOrId && typeof courseOrId === 'object'
        ? courseOrId
        : ACADEMY_COURSES[0];

  const cleanName = String(studentName || '').trim() || 'Học viên Phật tử';
  const numericScore = Math.max(0, Math.min(100, Math.round(Number(score || 0))));
  const minPass = Number(course.passScore || 70);
  const passed = numericScore >= minPass;

  if (!passed) {
    return {
      ok: false,
      passed: false,
      reason: 'score_below_pass',
      studentName: cleanName,
      courseId: course.id,
      courseTitle: course.title,
      score: numericScore,
      minScore: minPass,
      message: `Điểm đạt ${numericScore}/100 chưa đủ chuẩn tốt nghiệp (${minPass}/100). Cô bác hãy ôn bài và thi lại nhé.`
    };
  }

  const d = issuedAt instanceof Date ? issuedAt : new Date(issuedAt);
  const issuedDateKey = getLocalDateKey(d);
  const gradeLabel =
    numericScore >= 90 ? 'Xuất sắc · Tinh tấn' : numericScore >= 80 ? 'Giỏi · Chánh niệm' : 'Đạt · Hoàn thành';

  // Deterministic checksum verification code
  const rawSeed = `${cleanName}|${course.id}|${numericScore}|${issuedDateKey}`;
  let hash = 0;
  for (let i = 0; i < rawSeed.length; i++) {
    hash = (hash * 33 + rawSeed.charCodeAt(i)) >>> 0;
  }
  const verificationCode = `VT-CERT-${hash.toString(36).toUpperCase().padStart(6, '0')}`;
  const certificateId = `CERT-${String(course.id).toUpperCase()}-${issuedDateKey.replace(/-/g, '')}-${hash.toString(16).slice(0, 4).toUpperCase()}`;

  return {
    ok: true,
    passed: true,
    certificateId,
    studentName: cleanName,
    courseId: course.id,
    courseTitle: course.title,
    score: numericScore,
    minScore: minPass,
    gradeLabel,
    issuedDateKey,
    issuedLabel: `Mỹ Tho, ngày ${issuedDateKey}`,
    issuerName: 'Học Viện Phật Học Trực Tuyến · Chùa Vĩnh Tràng',
    verificationCode,
    sealText: 'ẤN CHỨNG HOÀN THÀNH KHÓA TU HỌC · CHÙA VĨNH TRÀNG',
    motto: 'Tự giác · Giác tha · Giác hạnh viên mãn'
  };
}
