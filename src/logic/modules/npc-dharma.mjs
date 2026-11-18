/**
 * Logic tương tác NPC trong sân chùa: nhận diện khoảng cách, chọn câu Pháp ngữ ngẫu nhiên,
 * và định danh vai trò nhân vật (Sư Thầy, Phật tử, Chú Tiểu, Cô/Chú Bán Hàng, Du khách).
 */
import { pickDailyDharmaQuote } from './daily-dharma.mjs';

export const COURTYARD_NPC_DHARMA_QUOTES = [
  {
    id: 'dharma_01',
    quote:
      'Ý dẫn đầu các pháp, ý làm chủ, ý tạo. Nếu nói hay làm với tâm thanh tịnh, an lạc sẽ theo ta như bóng không rời hình.',
    source: 'Kinh Pháp Cú · Kệ số 2',
    book: 'Tích Truyện Pháp Cú'
  },
  {
    id: 'dharma_02',
    quote:
      'Hận thù không thể diệt được hận thù, chỉ có lòng từ bi mới hóa giải được hận thù. Đó là định luật ngàn đời không đổi.',
    source: 'Kinh Pháp Cú · Kệ số 5',
    book: 'Tích Truyện Pháp Cú'
  },
  {
    id: 'dharma_03',
    quote:
      'Như người mẹ hiền đem cả thân mạng che chở đứa con duy nhất, hãy trải lòng từ rộng lớn đến khắp muôn loài.',
    source: 'Kinh Từ Bi (Metta Sutta)',
    book: 'Tu Dưỡng Tâm Từ Bằng Thiền Chánh Niệm'
  },
  {
    id: 'dharma_04',
    quote:
      'Khi xúc chạm việc đời được mất hơn thua, tâm không dao động, không sầu muộn, trong sạch và an ổn — đó là phước đức lớn nhất.',
    source: 'Kinh Phước Đức (Maṅgala Sutta)',
    book: 'Nền Tảng Phật Giáo · Quyển 5'
  },
  {
    id: 'dharma_05',
    quote:
      'Người biết đủ, tuy nằm trên đất vẫn thấy an vui; người không biết đủ, dù ở chốn giàu sang vẫn thấy thiếu thốn.',
    source: 'Kinh Di Giáo',
    book: 'Phật Học Phổ Thông · Quyển 1'
  },
  {
    id: 'dharma_06',
    quote:
      'Quá khứ đã qua rồi, tương lai thì chưa tới. Chỉ có giây phút hiện tại là nơi ta thực sự đang sống.',
    source: 'Phương Pháp Thiền Căn Bản',
    book: 'Thiền sư Ajahn Brahm'
  },
  {
    id: 'dharma_07',
    quote:
      'Mỗi bước chân chánh niệm chạm đất đều có thể mang lại sự lắng dịu cho thân và tâm.',
    source: 'Tu Dưỡng Tâm Từ · Phẩm Tứ Oai Nghi',
    book: 'Tu Dưỡng Tâm Từ Bằng Thiền Chánh Niệm'
  },
  {
    id: 'dharma_08',
    quote:
      'Lấy không giận thắng giận, lấy thiện thắng không thiện, lấy rộng lượng thắng keo kiệt, lấy chân thật thắng gian dối.',
    source: 'Kinh Pháp Cú · Kệ số 223',
    book: 'Tích Truyện Pháp Cú'
  },
  {
    id: 'dharma_09',
    quote:
      'Một ngọn đuốc đem mồi cho trăm ngàn ngọn đuốc khác: ánh sáng của ngọn đuốc đầu tiên chẳng hề vơi đi mà cả gian phòng càng rực rỡ.',
    source: 'Giáo lý Phước Thiện · Hồi hướng phước',
    book: 'Nền Tảng Phật Giáo · Quyển 5'
  },
  {
    id: 'dharma_10',
    quote:
      'Giọt nước tuy nhỏ nhưng rơi mãi cũng đầy bình; người biết tích lũy từng việc thiện nhỏ mỗi ngày rồi cũng tròn đầy công đức.',
    source: 'Kinh Pháp Cú · Kệ số 122',
    book: 'Tích Truyện Pháp Cú'
  },
  {
    id: 'dharma_11',
    quote: 'Phật dạy: Tâm hiếu là tâm Phật, hạnh hiếu là hạnh Phật.',
    source: 'Kinh Báo Hiếu Công Đức Phụ Mẫu Ân',
    book: 'Phật Học Phổ Thông · Quyển 1'
  },
  {
    id: 'dharma_12',
    quote:
      'Thấy rõ thân tâm này do nhân duyên hòa hợp và luôn đổi thay, lòng tự nhiên bớt chấp trước, bớt nặng nề.',
    source: 'Đức Phật Dạy Những Gì',
    book: 'HT. Walpola Rahula'
  },
  {
    id: 'dharma_13',
    quote:
      'Thân cận người hiền trí, nói lời chân thật hòa ái và làm nghề nghiệp lương thiện là nền tảng của đời sống bình an.',
    source: 'Kinh Phước Đức (Maṅgala Sutta)',
    book: 'Nền Tảng Phật Giáo · Quyển 5'
  },
  {
    id: 'dharma_14',
    quote:
      'Hoa sen mọc từ bùn nhưng chẳng nhiễm mùi bùn; người giữ tâm trong sáng giữa đời bận rộn cũng tự tại như sen nở.',
    source: 'Phật Học Phổ Thông · Ý nghĩa Hoa Sen',
    book: 'HT. Thích Thiện Hoa'
  },
  {
    id: 'dharma_15',
    quote:
      'Thắp ba nén hương là nhắc mình giữ Giới cho thân ngay, giữ Định cho lòng yên và giữ Tuệ cho trí sáng.',
    source: 'Cẩm Nang Oai Nghi Phật Tử Tại Gia',
    book: 'Nghi Lễ Chùa Vĩnh Tràng'
  }
];

export const COURTYARD_NPC_ROLES = {
  monk: { label: 'Sư Thầy', icon: '🙏' },
  pilgrim: { label: 'Phật tử hành hương', icon: '🪷' },
  novice: { label: 'Em nhỏ đi chùa', icon: '🌱' },
  vendor: { label: 'Bà con cổng chùa', icon: '🛍️' },
  visitor: { label: 'Du khách thập phương', icon: '🧭' }
};

export function getCourtyardNpcSpeaker(role = 'pilgrim', charKey = 'nu') {
  if (role === 'vendor') {
    return {
      icon: '🛍️',
      label: charKey === 'nam' ? 'Chú bán hàng cổng chùa' : 'Cô bán hàng cổng chùa'
    };
  }
  const meta = COURTYARD_NPC_ROLES[role] || COURTYARD_NPC_ROLES.pilgrim;
  return { icon: meta.icon, label: meta.label };
}

export function pickNpcDharmaQuote(
  quotes = COURTYARD_NPC_DHARMA_QUOTES,
  excludeId = null,
  randomFn = Math.random
) {
  const pool =
    Array.isArray(quotes) && quotes.length > 0 ? quotes : COURTYARD_NPC_DHARMA_QUOTES;
  return (
    pickDailyDharmaQuote(pool, excludeId, randomFn) ||
    COURTYARD_NPC_DHARMA_QUOTES[0]
  );
}

/**
 * Tìm NPC gần nhất trong sân chùa kèm hysteresis để tránh nhấp nháy ở ranh giới khoảng cách.
 */
export function evaluateCourtyardNpcProximity(
  playerPos,
  npcs = [],
  activeNpcId = null,
  { enterRadius = 3.8, exitRadius = 4.6, switchMargin = 0.85 } = {}
) {
  if (!playerPos || !Array.isArray(npcs) || npcs.length === 0) return null;

  let closest = null;
  let closestDist = Infinity;
  let activeMatch = null;
  let activeDist = Infinity;

  for (const npc of npcs) {
    if (!npc || typeof npc.x !== 'number' || typeof npc.z !== 'number') continue;
    const dist = Math.hypot(playerPos.x - npc.x, playerPos.z - npc.z);
    if (dist < closestDist) {
      closestDist = dist;
      closest = npc;
    }
    if (activeNpcId && npc.id === activeNpcId) {
      activeMatch = npc;
      activeDist = dist;
    }
  }

  if (activeMatch && activeDist <= exitRadius) {
    if (
      closest &&
      closest.id !== activeMatch.id &&
      closestDist <= enterRadius &&
      closestDist + switchMargin < activeDist
    ) {
      return { npc: closest, distance: closestDist, changed: true };
    }
    return { npc: activeMatch, distance: activeDist, changed: false };
  }

  if (closest && closestDist <= enterRadius) {
    return {
      npc: closest,
      distance: closestDist,
      changed: closest.id !== activeNpcId
    };
  }

  return null;
}
