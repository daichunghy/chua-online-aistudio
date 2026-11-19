import { getLocalDateKey } from './daily-dharma.mjs';

export const DEFAULT_TEMPLE_ID = 'vinh_trang';

export const TEMPLE_CATALOG = [
  {
    id: 'vinh_trang',
    name: 'Chùa Vĩnh Tràng',
    region: 'Mỹ Tho, Tiền Giang',
    foundedYear: 1849,
    status: 'active',
    heritageCount: 10,
    arhatCount: 18,
    sealText: 'Vĩnh Tràng Cổ Tự',
    description: 'Ngôi cổ tự giao thoa kiến trúc Á - Âu nổi tiếng nhất miền Tây, lưu giữ 18 vị La Hán gỗ mít tạc năm 1907 và 3 đại tượng Phật ngoài trời.'
  },
  {
    id: 'thien_mu',
    name: 'Chùa Thiên Mụ',
    region: 'Sông Hương, TP. Huế',
    foundedYear: 1601,
    status: 'coming_soon',
    heritageCount: 8,
    arhatCount: 0,
    sealText: 'Linh Mụ Cổ Tự',
    description: 'Tháp Phước Duyên 7 tầng soi bóng sông Hương và tiếng chuông Đại Hồng Chung vang vọng xứ Huế (sắp mở rộng).'
  },
  {
    id: 'truc_lam',
    name: 'Thiền Viện Trúc Lâm',
    region: 'Núi Phụng Hoàng, Đà Lạt',
    foundedYear: 1994,
    status: 'coming_soon',
    heritageCount: 8,
    arhatCount: 0,
    sealText: 'Trúc Lâm Thiền Viện',
    description: 'Không gian thiền môn giữa rừng thông bên hồ Tuyền Lâm yên tĩnh cho những buổi thiền hành sớm mai (sắp mở rộng).'
  },
  {
    id: 'chua_huong',
    name: 'Chùa Hương',
    region: 'Mỹ Đức, Hà Nội',
    foundedYear: 1686,
    status: 'coming_soon',
    heritageCount: 8,
    arhatCount: 0,
    sealText: 'Hương Tích Động',
    description: 'Hành hương xuôi dòng suối Yến qua đền Trình, chùa Thiên Trù vào động Hương Tích (sắp mở rộng).'
  }
];

export const PILGRIMAGE_GUIDED_ORDER = [
  { key: 'cong_tam_quan', label: 'Cổng Tam Quan', subtitle: 'Ngắm nghệ thuật khảm sành sứ 1933', zone: 'exterior' },
  { key: 'phat_adida', label: 'Tượng A Di Đà', subtitle: 'Chiêm bái đại tượng cao 18m', zone: 'exterior' },
  { key: 'ho_sen_ca_koi', label: 'Hồ Sen & Hoa Đăng', subtitle: 'Ngắm hoa đăng cầu an trên mặt hồ', zone: 'exterior' },
  { key: 'lu_huong_san', label: 'Lư Hương Tiền Đường', subtitle: 'Dâng nén hương thơm trước mặt tiền chùa', zone: 'exterior' },
  { key: 'chanh_dien', label: 'Vào Chánh Điện', subtitle: 'Lễ Phật & chiêm bái 18 vị La Hán 1907', zone: 'interior' },
  { key: 'phat_di_lac', label: 'Tượng Phật Di Lặc', subtitle: 'Cầu hoan hỷ, lòng nhẹ như mây', zone: 'exterior' },
  { key: 'phat_niet_ban', label: 'Tượng Phật Niết Bàn', subtitle: 'Tĩnh tâm quán chiếu vô thường', zone: 'exterior' }
];

export const PASSPORT_GARDEN_SPECIES = [
  { id: 'sen_hong', name: 'Sen Hồng Vĩnh Tràng', icon: '🪷', petalColor: '#e87898', bloomNote: 'Hoa sen hồng thanh khiết nở sau 3 ngày chăm tưới.' },
  { id: 'sen_trang', name: 'Sen Bạch Ngọc', icon: '🤍', petalColor: '#f5f0e4', bloomNote: 'Đóa bạch liên tỏa hương dịu nhẹ giữa sân chùa.' },
  { id: 'bo_de_non', name: 'Lá Bồ Đề Bình An', icon: '🌿', petalColor: '#6ab06e', bloomNote: 'Mầm Bồ Đề xanh tươi nhắc nhở sự tỉnh thức mỗi ngày.' },
  { id: 'mai_vang', name: 'Mai Vàng Miền Tây', icon: '🌼', petalColor: '#eab338', bloomNote: 'Sắc mai ấm áp đón phúc lành ngày mùng Một, ngày Rằm.' }
];

export const DAILY_PEACE_ORACLES = [
  { id: 'que_01', number: 1, title: 'Tâm An Vạn Sự An', verse: 'Gió qua hiên vắng lá lay nhẹ,\nMột nén hương trầm lắng bụi trần.\nGiữ lòng tĩnh lặng như hồ nước,\nPhúc lành tự đến chẳng cầu xa.', advice: 'Hôm nay cô bác hãy thở chậm ba hơi sâu trước khi bắt đầu việc mới.', stationKey: 'lu_huong_san' },
  { id: 'que_02', number: 2, title: 'Sen Nở Trong Bùn', verse: 'Gần bùn sen vẫn tỏa hương thơm,\nĐời có chông gai dạ vẫn hiền.\nGiữ trọn từ tâm trong mỗi bước,\nMọi điều sóng gió hóa bình yên.', advice: 'Một lời hỏi thăm dịu dàng hôm nay sẽ làm ấm lòng người thương.', stationKey: 'ho_sen_ca_koi' },
  { id: 'que_03', number: 3, title: 'Tiếng Chuông Thức Tỉnh', verse: 'Chuông chùa ngân nhẹ buổi sớm mai,\nGác lại âu lo chốn trần ai.\nMỗi bước chân đi là chánh niệm,\nThấy đời rộng mở nắng vàng phai.', advice: 'Dành 3 phút nghe kinh nhẹ nhàng để tâm trí thư thái.', stationKey: 'chanh_dien' },
  { id: 'que_04', number: 4, title: 'Nụ Cười Di Lặc', verse: 'Bụng rộng bao dung chuyện thế gian,\nMiệng cười hoan hỷ đón xuân sang.\nBuông đi phiền muộn lòng thanh thản,\nGia đạo êm vui phúc thọ tràn.', advice: 'Mỉm cười với một điều nhỏ bé khiến lòng mình nhẹ hơn ngay lúc này.', stationKey: 'phat_di_lac' },
  { id: 'que_05', number: 5, title: 'Ánh Đèn Tuệ Giác', verse: 'Một ngọn hoa đăng sáng giữa hồ,\nSoi lòng trong trẻo hết âu lo.\nGửi lời chúc tốt cho muôn nẻo,\nÁnh sáng quay về ấm cửa nhà.', advice: 'Hãy thả một ngọn hoa đăng cầu bình an cho gia đình và người thân.', stationKey: 'ho_sen_ca_koi' },
  { id: 'que_06', number: 6, title: 'Bước Chân An Lạc', verse: 'Chậm rãi từng bước giữa sân chùa,\nNghe chim hót khẽ tán cây đùa.\nChẳng cần vội vã theo năm tháng,\nHiện tại bình an chính cõi lành.', advice: 'Đi bộ thong thả hôm nay, đừng thúc ép bản thân quá sức.', stationKey: 'lu_huong_san' },
  { id: 'que_07', number: 7, title: 'Nhân Lành Quả Ngọt', verse: 'Gieo một hạt lành xuống đất nâu,\nNước trong chăm tưới chẳng mong cầu.\nNgày mai hoa nở thơm sân cũ,\nPhước đức âm thầm giữ bền lâu.', advice: 'Tưới một gáo nước cho vườn sen chùa và gửi niệm lành cho ngày mới.', stationKey: 'ho_sen_ca_koi' },
  { id: 'que_08', number: 8, title: 'Từ Bi Hóa Giải', verse: 'Một lời nhẫn nhịn bớt phong ba,\nMột chút bao dung ấm cửa nhà.\nNước mát tưới lên lòng nóng giận,\nCòn lại tình thương nở như hoa.', advice: 'Nếu gặp điều trái ý, hãy tạm dừng 5 giây trước khi đáp lời.', stationKey: 'phat_adida' },
  { id: 'que_09', number: 9, title: 'Bóng Mát Bồ Đề', verse: 'Cây cổ xanh tươi che nắng trưa,\nTrăm năm đứng lặng đón gió mưa.\nLòng người vững chãi trong chánh niệm,\nKhó khăn rồi cũng thoảng mây thưa.', advice: 'Nghỉ ngơi đúng giờ, uống một tách trà ấm và thư giãn đôi vai.', stationKey: 'phat_niet_ban' },
  { id: 'que_10', number: 10, title: 'Tri Ân Cha Mẹ', verse: 'Công cha nghĩa mẹ nặng như non,\nMột nén hương lòng kính vẹn tròn.\nCầu cho song thân luôn mạnh khỏe,\nCon cháu sum vầy nghĩa sắt son.', advice: 'Gọi điện hoặc nhắn một câu chúc sức khỏe tới người thân yêu.', stationKey: 'chanh_dien' },
  { id: 'que_11', number: 11, title: 'Nước Lặng Soi Trăng', verse: 'Mặt hồ phẳng lặng hiện vầng trăng,\nTâm trí yên bình rõ trắng đen.\nĐừng vội lo âu điều chưa tới,\nBình tâm nhìn kỹ sẽ thông hanh.', advice: 'Việc khó cứ tách thành từng bước nhỏ, bình tĩnh sẽ giải quyết ổn thỏa.', stationKey: 'ho_sen_ca_koi' },
  { id: 'que_12', number: 12, title: 'Hương Trầm Tĩnh Lặng', verse: 'Khói hương uốn lượn bay lên cao,\nPhiền não theo làn gió tan mau.\nChắp tay thành kính lòng trong sạch,\nCảm thấy quanh mình đẹp xiết bao.', advice: 'Thắp một nén hương tâm, ghi lại một điều mình thấy biết ơn hôm nay.', stationKey: 'lu_huong_san' },
  { id: 'que_13', number: 13, title: 'Cửa Chùa Mở Rộng', verse: 'Tam quan rực rỡ sắc sành xưa,\nĐón khách đường xa tránh nắng mưa.\nAi đến lòng thành đều nhẹ bước,\nQuay về mang trọn chút hương đưa.', advice: 'Mở lòng đón nhận sự giúp đỡ hoặc lời khuyên chân thành từ xung quanh.', stationKey: 'cong_tam_quan' },
  { id: 'que_14', number: 14, title: 'Thân Khỏe Tâm An', verse: 'Ăn chậm nhai kỹ dạ bình an,\nNgủ sớm dậy sớm khí huyết tràn.\nGiữ gìn thân thể như chùa nhỏ,\nMỗi ngày thêm khỏe sống hân hoan.', advice: 'Vươn vai nhẹ nhàng, hít thở sâu và uống đủ nước trong ngày.', stationKey: 'lu_huong_san' },
  { id: 'que_15', number: 15, title: 'Tùy Hỷ Công Đức', verse: 'Thấy người vui vẻ lòng cùng vui,\nChúc phúc cho ai hết ngậm ngùi.\nGhen ghét không còn tâm rộng mở,\nĐời mình tự khắc lắm niềm vui.', advice: 'Nhấn gửi một lời chúc lành trên Hồ Hoa Đăng cho người hữu duyên.', stationKey: 'ho_sen_ca_koi' },
  { id: 'que_16', number: 16, title: 'Buông Nhẹ Gánh Lo', verse: 'Nắm chặt hòn than tay sẽ đau,\nBuông tay gió mát thổi qua mau.\nChuyện cũ đã qua đừng giữ mãi,\nĐể chỗ cho vui bước tiếp sau.', advice: 'Tạm gác một chuyện cũ không còn sửa được, hướng tâm về ngày mai.', stationKey: 'phat_niet_ban' },
  { id: 'que_17', number: 17, title: 'Ánh Nắng Sân Chùa', verse: 'Nắng sớm trải vàng khắp ngói nâu,\nHàng cau đứng thẳng đón trời cao.\nDù qua đêm tối trời luôn sáng,\nTin vào điều thiện chẳng hề nao.', advice: 'Đón ánh nắng sớm vài phút để tinh thần phấn chấn cả ngày.', stationKey: 'phat_adida' },
  { id: 'que_18', number: 18, title: 'Lời Nói Ái Ngữ', verse: 'Lời hay như mật ngọt lòng người,\nCâu đẹp trao nhau nở nụ cười.\nHôm nay nói chuyện bằng thương mến,\nKhắp chốn quanh ta rộn tiếng cười.', advice: 'Khen ngợi chân thành một việc tốt của ai đó bên cạnh mình.', stationKey: 'chanh_dien' },
  { id: 'que_19', number: 19, title: 'Mười Tám La Hán', verse: 'Mỗi vị La Hán một dáng ngồi,\nTrầm tư, hoan hỷ giữa dòng đời.\nTu tâm đâu phải nơi xa thẳm,\nNgay giữa đời thường sống thảnh thơi.', advice: 'Ghé Chánh Điện chiêm bái và thu thập thêm một dấu mộc La Hán gỗ mít 1907.', stationKey: 'chanh_dien' },
  { id: 'que_20', number: 20, title: 'Thiểu Dục Tri Túc', verse: 'Biết đủ thì vui giữa cảnh thường,\nChẳng cần xa hoa vẫn ngát hương.\nCơm lành canh ngọt bên người quý,\nẤy là hạnh phúc ở đời thường.', advice: 'Thưởng thức bữa cơm hôm nay thật trọn vẹn và biết ơn.', stationKey: 'lu_huong_san' },
  { id: 'que_21', number: 21, title: 'Vững Bước Đạo Lành', verse: 'Đường dài đi mãi cũng qua đèo,\nViệc thiện làm hoài phước vẫn theo.\nChớ ngại điều lành tuy nhỏ bé,\nTích dần giọt nước hóa sông sâu.', advice: 'Làm một việc tử tế nhỏ không cần ai biết.', stationKey: 'cong_tam_quan' },
  { id: 'que_22', number: 22, title: 'Lắng Nghe Để Hiểu', verse: 'Có hiểu rồi sau mới có thương,\nLắng nghe trọn vẹn bớt sầu vương.\nĐặt mình vào chỗ người đối diện,\nSẽ thấy lòng nhau thật dễ thương.', advice: 'Hôm nay hãy nghe người thân kể chuyện hết câu rồi mới góp ý.', stationKey: 'chanh_dien' },
  { id: 'que_23', number: 23, title: 'Chánh Niệm Hơi Thở', verse: 'Thở vào biết rõ mình đang sống,\nThở ra mỉm cười nhẹ tấm thân.\nChỉ cần một phút quay về đó,\nCả buổi chiều kia hóa rất gần.', advice: 'Ngồi yên 1 phút, đếm nhẹ từ 1 đến 10 theo hơi thở.', stationKey: 'phat_niet_ban' },
  { id: 'que_24', number: 24, title: 'Mưa Thuận Gió Hòa', verse: 'Cơn mưa tưới mát khóm sen xanh,\nRửa sạch bụi mờ mái ngói lành.\nMọi sự xoay vần theo nhân quả,\nGiữ lòng ngay thẳng ắt thanh bình.', advice: 'Giữ chữ tín trong một lời hứa nhỏ hôm nay.', stationKey: 'ho_sen_ca_koi' },
  { id: 'que_25', number: 25, title: 'Hòa Khí Sinh Tài', verse: 'Trong nhà thuận thảo ấm quanh năm,\nLáng giềng thân thiết ghé hỏi thăm.\nHòa khí sinh ra nhiều may mắn,\nViệc làm thuận lợi, bước an tâm.', advice: 'Gìn giữ bầu không khí êm ấm trong gia đình tối nay.', stationKey: 'phat_di_lac' },
  { id: 'que_26', number: 26, title: 'Gương Sáng Cổ Tự', verse: 'Trăm năm cổ tự vẫn trang nghiêm,\nBao lớp người qua giữ nét hiền.\nTiếp nối điều hay từ tiền nhân,\nĐể lại hương thơm giữa thế gian.', advice: 'Đọc một mẩu chuyện di sản Chùa Vĩnh Tràng trong Sổ Hành Hương.', stationKey: 'lu_huong_san' },
  { id: 'que_27', number: 27, title: 'Tâm Nhẹ Như Mây', verse: 'Mây trắng thong dong giữa trời xanh,\nKhông vướng không mắc thật thanh bình.\nTâm ta cũng thế khi buông chấp,\nNhìn xuống trần gian thấy rất lành.', advice: 'Tạm tắt tin tức ồn ào một lúc, nghe tiếng chuông gió sân chùa.', stationKey: 'phat_adida' },
  { id: 'que_28', number: 28, title: 'Gieo Duyên Lành Mới', verse: 'Hữu duyên gặp gỡ giữa sân chùa,\nMột cái gật đầu quý biết bao.\nKết bạn đường tu thêm vững chãi,\nĐi cùng nhau thấy nhẹ đường xa.', advice: 'Chụp một tấm ảnh kỷ niệm sân chùa lưu vào Sổ Hành Hương.', stationKey: 'cong_tam_quan' },
  { id: 'que_29', number: 29, title: 'Hồi Hướng Công Đức', verse: 'Làm xong việc thiện chớ khoe khoang,\nHồi hướng bình an khắp thế gian.\nPhước nhỏ chia ra thành phước lớn,\nLòng mình rạng rỡ tựa trăng rằm.', advice: 'Trước khi nghỉ ngơi tối nay, thầm chúc mọi người một đêm ngủ ngon.', stationKey: 'lu_huong_san' },
  { id: 'que_30', number: 30, title: 'Viên Mãn Hành Trình', verse: 'Ba mươi ngày giữ một tâm lành,\nSen nở, chuông ngân, dạ mát xanh.\nĐi chùa không chỉ nơi gạch ngói,\nMà ở từng giây sống thiện lành.', advice: 'Mở Sổ Hành Hương xem lại chặng đường bình an cô bác đã đi qua.', stationKey: 'chanh_dien' }
];

function uniqueStrings(list, maxItems = 400) {
  const seen = new Set();
  const out = [];
  if (!Array.isArray(list)) return out;
  for (const item of list) {
    const clean = String(item || '').trim();
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    out.push(clean);
    if (out.length >= maxItems) break;
  }
  return out;
}

function createDefaultGardenSlots() {
  return [
    { slotIndex: 0, speciesId: 'sen_hong', stage: 1, waterCount: 0, lastWateredDateKey: '', plantedDateKey: '' },
    { slotIndex: 1, speciesId: 'sen_trang', stage: 0, waterCount: 0, lastWateredDateKey: '', plantedDateKey: '' },
    { slotIndex: 2, speciesId: 'bo_de_non', stage: 0, waterCount: 0, lastWateredDateKey: '', plantedDateKey: '' }
  ];
}

function normalizeGardenSlots(rawSlots) {
  const defaults = createDefaultGardenSlots();
  if (!Array.isArray(rawSlots) || rawSlots.length === 0) return defaults;
  return defaults.map((fallback, idx) => {
    const item = rawSlots[idx] || {};
    const speciesOk = PASSPORT_GARDEN_SPECIES.some((s) => s.id === item.speciesId);
    return {
      slotIndex: idx,
      speciesId: speciesOk ? item.speciesId : fallback.speciesId,
      stage: Math.max(0, Math.min(4, Math.floor(Number(item.stage) || 0))),
      waterCount: Math.max(0, Math.min(20, Math.floor(Number(item.waterCount) || 0))),
      lastWateredDateKey: typeof item.lastWateredDateKey === 'string' ? item.lastWateredDateKey.slice(0, 10) : '',
      plantedDateKey: typeof item.plantedDateKey === 'string' ? item.plantedDateKey.slice(0, 10) : ''
    };
  });
}

export function createEmptyTempleRecord(templeId = DEFAULT_TEMPLE_ID) {
  return {
    templeId,
    visitedStations: [],
    heritageStamps: [],
    arhatStamps: [],
    practicedDays: [],
    dailyOracleDateKey: '',
    dailyOracleId: '',
    gardenSlots: createDefaultGardenSlots(),
    bloomedKeepsakes: [],
    updatedAt: 0
  };
}

export function createPilgrimagePassportState(saved = null, legacy = null) {
  const src = saved && typeof saved === 'object' ? saved : {};
  const activeTempleId = TEMPLE_CATALOG.some((t) => t.id === src.activeTempleId)
    ? src.activeTempleId
    : DEFAULT_TEMPLE_ID;

  const temples = {};
  const savedTemples = src.temples && typeof src.temples === 'object' ? src.temples : {};
  for (const temple of TEMPLE_CATALOG) {
    const raw = savedTemples[temple.id] || {};
    temples[temple.id] = {
      templeId: temple.id,
      visitedStations: uniqueStrings(raw.visitedStations, 40),
      heritageStamps: uniqueStrings(raw.heritageStamps, 30),
      arhatStamps: uniqueStrings(raw.arhatStamps, 30),
      practicedDays: uniqueStrings(raw.practicedDays, 400),
      dailyOracleDateKey: typeof raw.dailyOracleDateKey === 'string' ? raw.dailyOracleDateKey.slice(0, 10) : '',
      dailyOracleId: typeof raw.dailyOracleId === 'string' ? raw.dailyOracleId.slice(0, 48) : '',
      gardenSlots: normalizeGardenSlots(raw.gardenSlots),
      bloomedKeepsakes: Array.isArray(raw.bloomedKeepsakes) ? raw.bloomedKeepsakes.slice(0, 40) : [],
      updatedAt: Number(raw.updatedAt) || 0
    };
  }

  let journalEntries = Array.isArray(src.journalEntries)
    ? src.journalEntries
        .filter((e) => e && typeof e.text === 'string' && e.text.trim())
        .slice(0, 120)
        .map((e) => ({
          id: String(e.id || `entry_${Math.random().toString(36).slice(2, 9)}`),
          templeId: typeof e.templeId === 'string' && e.templeId ? e.templeId : DEFAULT_TEMPLE_ID,
          text: String(e.text).trim().slice(0, 600),
          mood: String(e.mood || 'an_lac').slice(0, 32),
          moodLabel: String(e.moodLabel || 'An lạc').slice(0, 48),
          stationLabel: String(e.stationLabel || 'Chùa Vĩnh Tràng').slice(0, 80),
          dateKey: String(e.dateKey || getLocalDateKey()).slice(0, 10),
          createdAt: Number(e.createdAt) || Date.now()
        }))
    : [];

  // Migrate legacy 30-day journal / heritage / arhats into vinh_trang seamlessly on first load
  if (legacy && typeof legacy === 'object') {
    const vt = temples[DEFAULT_TEMPLE_ID];
    if (Array.isArray(legacy.visitedHeritageIds)) {
      vt.heritageStamps = uniqueStrings([...vt.heritageStamps, ...legacy.visitedHeritageIds], 30);
    }
    if (Array.isArray(legacy.visitedArhatIds)) {
      vt.arhatStamps = uniqueStrings([...vt.arhatStamps, ...legacy.visitedArhatIds], 30);
    }
    if (Array.isArray(legacy.practicedDays)) {
      vt.practicedDays = uniqueStrings([...vt.practicedDays, ...legacy.practicedDays], 400);
    }
    if (journalEntries.length === 0 && Array.isArray(legacy.journalEntries)) {
      journalEntries = legacy.journalEntries
        .filter((e) => e && typeof e.text === 'string' && e.text.trim())
        .slice(0, 80)
        .map((e) => ({
          id: String(e.id || `legacy_${e.createdAt || Date.now()}`),
          templeId: DEFAULT_TEMPLE_ID,
          text: String(e.text).trim().slice(0, 600),
          mood: String(e.mood || 'an_lac'),
          moodLabel: String(e.moodLabel || 'An lạc'),
          stationLabel: String(e.stationLabel || 'Chùa Vĩnh Tràng'),
          dateKey: String(e.dateKey || getLocalDateKey()),
          createdAt: Number(e.createdAt) || Date.now()
        }));
    }
  }

  const memoryPhotos = Array.isArray(src.memoryPhotos)
    ? src.memoryPhotos
        .filter((p) => p && typeof p.dataUrl === 'string' && p.dataUrl.startsWith('data:image/'))
        .slice(0, 12)
    : [];

  return {
    version: 2,
    activeTempleId,
    temples,
    journalEntries,
    memoryPhotos
  };
}

export function getActiveTempleRecord(passport, templeId) {
  const tid = templeId || passport?.activeTempleId || DEFAULT_TEMPLE_ID;
  if (!passport.temples[tid]) {
    passport.temples[tid] = createEmptyTempleRecord(tid);
  }
  return passport.temples[tid];
}

function touchPracticeDay(record, now = new Date()) {
  const todayKey = getLocalDateKey(now);
  if (!record.practicedDays.includes(todayKey)) {
    record.practicedDays = uniqueStrings([...record.practicedDays, todayKey], 400);
  }
  record.updatedAt = now.getTime();
  return todayKey;
}

export function stampTempleStation(passport, stationKey, templeId = DEFAULT_TEMPLE_ID, now = new Date()) {
  const cleanKey = String(stationKey || '').trim();
  if (!cleanKey) return { changed: false, record: getActiveTempleRecord(passport, templeId) };
  const record = getActiveTempleRecord(passport, templeId);
  const hadBefore = record.visitedStations.includes(cleanKey);
  if (!hadBefore) {
    record.visitedStations = uniqueStrings([...record.visitedStations, cleanKey], 40);
  }
  touchPracticeDay(record, now);
  return { changed: !hadBefore, record };
}

export function stampTempleHeritage(passport, heritageId, templeId = DEFAULT_TEMPLE_ID, now = new Date()) {
  const cleanId = String(heritageId || '').trim();
  if (!cleanId) return { changed: false, record: getActiveTempleRecord(passport, templeId) };
  const record = getActiveTempleRecord(passport, templeId);
  const hadBefore = record.heritageStamps.includes(cleanId);
  if (!hadBefore) {
    record.heritageStamps = uniqueStrings([...record.heritageStamps, cleanId], 30);
  }
  touchPracticeDay(record, now);
  return { changed: !hadBefore, total: record.heritageStamps.length, record };
}

export function stampTempleArhat(passport, arhatId, templeId = DEFAULT_TEMPLE_ID, now = new Date()) {
  const cleanId = String(arhatId || '').trim();
  if (!cleanId) return { changed: false, record: getActiveTempleRecord(passport, templeId) };
  const record = getActiveTempleRecord(passport, templeId);
  const hadBefore = record.arhatStamps.includes(cleanId);
  if (!hadBefore) {
    record.arhatStamps = uniqueStrings([...record.arhatStamps, cleanId], 30);
  }
  touchPracticeDay(record, now);
  return { changed: !hadBefore, total: record.arhatStamps.length, record };
}

export function getNextGuidedDestination(passport, currentStationKey = '', inInterior = false) {
  const record = getActiveTempleRecord(passport, passport?.activeTempleId || DEFAULT_TEMPLE_ID);
  const visited = new Set(record.visitedStations || []);

  // Prefer the first unvisited station in natural pilgrimage order
  for (let i = 0; i < PILGRIMAGE_GUIDED_ORDER.length; i++) {
    const step = PILGRIMAGE_GUIDED_ORDER[i];
    if (inInterior && step.key === 'chanh_dien') continue;
    if (!visited.has(step.key) && step.key !== currentStationKey) {
      return { ...step, index: i, total: PILGRIMAGE_GUIDED_ORDER.length, allVisited: false };
    }
  }

  // If all visited, cycle cleanly to the next stop after currentStationKey
  const curIdx = PILGRIMAGE_GUIDED_ORDER.findIndex((s) => s.key === currentStationKey);
  const nextIdx = (curIdx + 1 + PILGRIMAGE_GUIDED_ORDER.length) % PILGRIMAGE_GUIDED_ORDER.length;
  return {
    ...PILGRIMAGE_GUIDED_ORDER[nextIdx],
    index: nextIdx,
    total: PILGRIMAGE_GUIDED_ORDER.length,
    allVisited: true
  };
}

export function getTodayPeaceOracle(passport, templeId = DEFAULT_TEMPLE_ID, now = new Date()) {
  const record = getActiveTempleRecord(passport, templeId);
  const todayKey = getLocalDateKey(now);
  if (record.dailyOracleDateKey === todayKey && record.dailyOracleId) {
    return DAILY_PEACE_ORACLES.find((q) => q.id === record.dailyOracleId) || null;
  }
  return null;
}

export function drawDailyPeaceOracle(passport, templeId = DEFAULT_TEMPLE_ID, now = new Date(), randomFn = Math.random) {
  const record = getActiveTempleRecord(passport, templeId);
  const todayKey = getLocalDateKey(now);
  const existing = getTodayPeaceOracle(passport, templeId, now);
  if (existing) {
    return { alreadyDrawn: true, oracle: existing, dateKey: todayKey };
  }

  const rawRand = Number(randomFn());
  const clampedRand = Math.max(0, Math.min(0.99999, Number.isFinite(rawRand) ? rawRand : 0));
  const idx = Math.floor(clampedRand * DAILY_PEACE_ORACLES.length);
  const chosen = DAILY_PEACE_ORACLES[idx] || DAILY_PEACE_ORACLES[0];
  record.dailyOracleDateKey = todayKey;
  record.dailyOracleId = chosen.id;
  touchPracticeDay(record, now);
  return { alreadyDrawn: false, oracle: chosen, dateKey: todayKey };
}

export function plantPassportGardenSlot(passport, slotIndex, speciesId, templeId = DEFAULT_TEMPLE_ID, now = new Date()) {
  const record = getActiveTempleRecord(passport, templeId);
  const slot = record.gardenSlots[slotIndex];
  if (!slot) return { ok: false, reason: 'Ô trồng không hợp lệ.' };
  const species = PASSPORT_GARDEN_SPECIES.find((s) => s.id === speciesId) || PASSPORT_GARDEN_SPECIES[0];
  const todayKey = getLocalDateKey(now);

  slot.speciesId = species.id;
  slot.stage = 1;
  slot.waterCount = 0;
  slot.plantedDateKey = todayKey;
  slot.lastWateredDateKey = '';
  touchPracticeDay(record, now);
  return { ok: true, slot, species };
}

export function waterRealDayGardenSlot(passport, slotIndex, templeId = DEFAULT_TEMPLE_ID, now = new Date()) {
  const record = getActiveTempleRecord(passport, templeId);
  const slot = record.gardenSlots[slotIndex];
  if (!slot) return { ok: false, reason: 'Không tìm thấy chậu cây.' };
  const todayKey = getLocalDateKey(now);

  if (slot.stage === 0) {
    slot.stage = 1;
    slot.plantedDateKey = todayKey;
  }

  if (slot.stage >= 4) {
    return { ok: false, alreadyBloomed: true, reason: 'Hoa đã nở mãn khai, cô bác có thể lưu vào Sổ Hành Hương.' };
  }

  if (slot.lastWateredDateKey === todayKey) {
    return {
      ok: false,
      alreadyWateredToday: true,
      reason: 'Hôm nay cô bác đã tưới chậu này rồi. Hẹn sáng mai tưới tiếp để hoa lớn tự nhiên nhé.'
    };
  }

  slot.waterCount = (slot.waterCount || 0) + 1;
  slot.stage = Math.min(4, slot.stage + 1);
  slot.lastWateredDateKey = todayKey;
  touchPracticeDay(record, now);

  const stageNames = ['Đất trống', 'Hạt giống', 'Nảy mầm xanh', 'Kết nụ sen', 'Mãn khai rực rỡ'];
  return {
    ok: true,
    slot,
    bloomedNow: slot.stage >= 4,
    stageLabel: stageNames[slot.stage] || 'Đang lớn'
  };
}

export function harvestPassportGardenSlot(passport, slotIndex, templeId = DEFAULT_TEMPLE_ID, now = new Date()) {
  const record = getActiveTempleRecord(passport, templeId);
  const slot = record.gardenSlots[slotIndex];
  if (!slot || slot.stage < 4) {
    return { ok: false, reason: 'Hoa chưa nở rộ để lưu kỷ niệm.' };
  }
  const species = PASSPORT_GARDEN_SPECIES.find((s) => s.id === slot.speciesId) || PASSPORT_GARDEN_SPECIES[0];
  const keepsake = {
    id: `bloom_${Date.now().toString(36)}_${slotIndex}`,
    templeId,
    speciesId: species.id,
    speciesName: species.name,
    icon: species.icon,
    bloomedDateKey: getLocalDateKey(now)
  };
  record.bloomedKeepsakes = [keepsake, ...(record.bloomedKeepsakes || [])].slice(0, 40);
  slot.stage = 0;
  slot.waterCount = 0;
  slot.lastWateredDateKey = '';
  slot.plantedDateKey = '';
  touchPracticeDay(record, now);
  return { ok: true, keepsake };
}

export function addTempleJournalEntry(
  passport,
  { templeId = DEFAULT_TEMPLE_ID, text, mood = 'an_lac', moodLabel = 'An lạc', stationLabel = 'Chùa Vĩnh Tràng' },
  now = new Date()
) {
  const cleanText = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 600);
  if (!cleanText) return { ok: false, reason: 'Cô bác vui lòng viết vài dòng lời nguyện hoặc cảm niệm.' };
  const record = getActiveTempleRecord(passport, templeId);
  const dateKey = touchPracticeDay(record, now);
  const entry = {
    id: `entry_${now.getTime().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    templeId,
    text: cleanText,
    mood: String(mood || 'an_lac').slice(0, 32),
    moodLabel: String(moodLabel || 'An lạc').slice(0, 48),
    stationLabel: String(stationLabel || 'Chùa Vĩnh Tràng').slice(0, 80),
    dateKey,
    createdAt: now.getTime()
  };
  passport.journalEntries = [entry, ...(passport.journalEntries || [])].slice(0, 120);
  return { ok: true, entry };
}

export function addTempleMemoryPhoto(
  passport,
  { templeId = DEFAULT_TEMPLE_ID, dataUrl, caption = 'Khoảnh khắc bình an tại Chùa Vĩnh Tràng', stationLabel = 'Sân chùa' },
  now = new Date()
) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return { ok: false, reason: 'Không thể lưu ảnh chụp.' };
  }
  const photo = {
    id: `photo_${now.getTime().toString(36)}`,
    templeId,
    dataUrl,
    caption: String(caption || '').slice(0, 140),
    stationLabel: String(stationLabel || 'Sân chùa').slice(0, 80),
    dateKey: getLocalDateKey(now),
    createdAt: now.getTime()
  };
  passport.memoryPhotos = [photo, ...(passport.memoryPhotos || [])].slice(0, 12);
  const record = getActiveTempleRecord(passport, templeId);
  touchPracticeDay(record, now);
  return { ok: true, photo };
}

/**
 * Union-merges local offline passport data with cloud Firestore records without data loss.
 */
export function mergeCloudPassportState(localPassport, cloudBundle = {}) {
  const merged = createPilgrimagePassportState(localPassport);
  const cloudTemples = cloudBundle.temples || {};

  for (const [templeId, cloudRec] of Object.entries(cloudTemples)) {
    if (!cloudRec || typeof cloudRec !== 'object') continue;
    const localRec = getActiveTempleRecord(merged, templeId);

    localRec.visitedStations = uniqueStrings([...localRec.visitedStations, ...(cloudRec.visitedStations || [])], 40);
    localRec.heritageStamps = uniqueStrings([...localRec.heritageStamps, ...(cloudRec.heritageStamps || [])], 30);
    localRec.arhatStamps = uniqueStrings([...localRec.arhatStamps, ...(cloudRec.arhatStamps || [])], 30);
    localRec.practicedDays = uniqueStrings([...localRec.practicedDays, ...(cloudRec.practicedDays || [])], 400);

    if (cloudRec.dailyOracleDateKey && cloudRec.dailyOracleDateKey >= (localRec.dailyOracleDateKey || '')) {
      localRec.dailyOracleDateKey = cloudRec.dailyOracleDateKey;
      localRec.dailyOracleId = cloudRec.dailyOracleId || localRec.dailyOracleId;
    }

    if (typeof cloudRec.gardenStateJson === 'string' && cloudRec.gardenStateJson) {
      try {
        const parsed = JSON.parse(cloudRec.gardenStateJson);
        const cloudUpdated = Number(cloudRec.updatedAtMs) || 0;
        if (Array.isArray(parsed.gardenSlots) && cloudUpdated >= (localRec.updatedAt || 0)) {
          localRec.gardenSlots = normalizeGardenSlots(parsed.gardenSlots);
        }
        if (Array.isArray(parsed.bloomedKeepsakes)) {
          const byId = new Map();
          for (const k of [...(localRec.bloomedKeepsakes || []), ...parsed.bloomedKeepsakes]) {
            if (k && k.id && !byId.has(k.id)) byId.set(k.id, k);
          }
          localRec.bloomedKeepsakes = Array.from(byId.values()).slice(0, 40);
        }
      } catch {}
    }

    localRec.updatedAt = Math.max(localRec.updatedAt || 0, Number(cloudRec.updatedAtMs) || 0);
  }

  if (Array.isArray(cloudBundle.journalEntries)) {
    const seen = new Map();
    for (const e of [...merged.journalEntries, ...cloudBundle.journalEntries]) {
      if (!e || !e.text) continue;
      const key = e.id || `${e.templeId}:${e.dateKey}:${e.text}`;
      if (!seen.has(key)) seen.set(key, e);
    }
    merged.journalEntries = Array.from(seen.values())
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 120);
  }

  return merged;
}
