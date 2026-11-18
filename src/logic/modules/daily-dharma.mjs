/**
 * Lời Phật dạy mỗi ngày (fallback, chọn quote, gọi dịch vụ).
 * (Tách từ chua-online-logic.mjs — import từ '/src/logic/chua-online-logic.mjs' vẫn dùng được.)
 */

/**
 * Daily Dharma Feature ("Lời Phật dạy hôm nay")
 * Shows a random inspirational canonical Buddhist quote upon the user's first visit of the day.
 * Stored in /data/daily-dharma.json with canonical fallback.
 */
export const DAILY_DHARMA_FALLBACK = [
  {
    id: 'dharma_01',
    quote:
      'Ý dẫn đầu các pháp, ý làm chủ, ý tạo. Nếu nói hay làm với tâm thanh tịnh, an lạc sẽ theo ta như bóng không rời hình.',
    source: 'Kinh Pháp Cú · Phẩm Song Yếu (Kệ số 2)',
    book: 'Tích Truyện Pháp Cú',
    reflection:
      'Khởi một ý nghĩ hiền hòa vào đầu ngày giúp lòng mình nhẹ nhàng suốt cả ngày dài.'
  },
  {
    id: 'dharma_06',
    quote:
      'Quá khứ đã qua rồi, tương lai thì chưa tới. Chỉ có giây phút hiện tại là nơi ta thực sự đang sống.',
    source: 'Phương Pháp Thiền Căn Bản',
    book: 'Thiền sư Ajahn Brahm',
    reflection:
      'Thở một hơi thật chậm, đặt nhẹ gánh lo xuống để cảm nhận sự có mặt trọn vẹn ngay lúc này.'
  },
  {
    id: 'dharma_05',
    quote:
      'Người biết đủ, tuy nằm trên đất vẫn thấy an vui; người không biết đủ, dù ở chốn giàu sang vẫn thấy thiếu thốn.',
    source: 'Kinh Di Giáo',
    book: 'Phật Học Phổ Thông · Quyển 1',
    reflection:
      'Biết trân trọng những điều bình dị đang có trong tay là cội nguồn của sự thanh thản.'
  }
];

export function getLocalDateKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shouldShowDailyDharmaToday(lastSeenDateKey, todayKey = getLocalDateKey()) {
  if (!lastSeenDateKey) return true;
  return String(lastSeenDateKey).trim() !== String(todayKey).trim();
}

export function pickDailyDharmaQuote(quotes = DAILY_DHARMA_FALLBACK, excludeId = null, randomFn = Math.random) {
  const list = Array.isArray(quotes) ? quotes.filter((q) => q && q.quote) : [];
  if (list.length === 0) return null;
  const pool =
    excludeId && list.length > 1 ? list.filter((q) => q.id !== excludeId) : list;
  const r = Math.max(0, Math.min(0.999999, Number(randomFn()) || 0));
  const idx = Math.floor(r * pool.length);
  return pool[idx] || pool[0];
}

export async function fetchDailyDharmaService({
  fetcher = typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : null,
  url = '/data/daily-dharma.json',
  simulatedDelayMs = 0,
  excludeId = null,
  randomFn = Math.random,
  date = new Date()
} = {}) {
  if (simulatedDelayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, simulatedDelayMs));
  }
  let quotes = DAILY_DHARMA_FALLBACK;
  let source = 'fallback';
  if (typeof fetcher === 'function') {
    try {
      const resp = await fetcher(url, { cache: 'no-store' });
      if (resp && resp.ok) {
        const parsed = await resp.json();
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.quote) {
          quotes = parsed;
          source = 'json';
        }
      }
    } catch {
      // Fall back gracefully to canonical DAILY_DHARMA_FALLBACK
    }
  }
  const quote = pickDailyDharmaQuote(quotes, excludeId, randomFn);
  return {
    quote,
    quotes,
    quotesCount: quotes.length,
    source,
    dateKey: getLocalDateKey(date)
  };
}
