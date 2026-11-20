/**
 * Đợt 3 — Nhiệm Vụ Hành Hương Chiều Sâu (Non-Violent Open-World Immersion):
 * 1. Gặp gỡ hữu duyên quanh chùa (3 sự kiện nhân văn tại Chùa Vĩnh Tràng)
 * 2. Hệ thống Công quả & Bếp chay (3 việc thiện thiết thực trong khuôn viên chùa)
 * 3. Bộ Sưu Tập 12 Góc Ảnh Di Sản Chùa Vĩnh Tràng & Công Viên Vĩnh Tràng
 */

export const RANDOM_ENCOUNTERS = [
  {
    id: 'ba_cu_trang_hat',
    title: 'Bà cụ đánh rơi tràng hạt gần Hồ Sen',
    shortLabel: 'Bà cụ gần Hồ Sen',
    icon: '📿',
    pos: { x: 11.4, z: 30.8 },
    radius: 4.8,
    rewardLotus: 30,
    rewardXp: 25,
    speaker: 'Bà cụ Hai — Phật tử Mỹ Tho',
    story:
      '“Cảm ơn con nhiều lắm! Chuỗi tràng hạt gỗ Bồ Đề 108 hạt này bà đeo đi lễ Chùa Vĩnh Tràng hơn hai mươi năm nay, nãy cúi xuống ngắm hoa sen bị tuột tay rớt xuống mé gạch. Chúc con và gia đình luôn mạnh khỏe, đi đâu cũng gặp quý nhân!”',
    actionLabel: '🙏 Nhặt giúp chuỗi tràng hạt trao bà cụ',
    doneToast: 'Bà cụ Hai gửi lời chúc bình an và tặng bạn 30 🪷 Điểm Sen!'
  },
  {
    id: 'du_khach_quoc_te',
    title: 'Du khách quốc tế hỏi thăm kiến trúc Pháp–Việt',
    shortLabel: 'Du khách quốc tế',
    icon: '🌍',
    pos: { x: 25.4, z: 27.6 },
    radius: 5.0,
    rewardLotus: 35,
    rewardXp: 30,
    speaker: 'David & Claire — Du khách từ Pháp',
    story:
      '“Xin chào! Ngôi chùa này thật kỳ diệu — mái cong Á Đông lại hài hòa với vòm cửa Phục Hưng và nghệ thuật khảm mảnh sành sứ tinh xảo. Bạn có thể chia sẻ đôi nét về Chùa Vĩnh Tràng (1849) và 18 pho tượng La Hán gỗ mít năm 1907 được không?”',
    actionLabel: '🏛️ Giới thiệu kiến trúc Pháp–Việt & 18 Vị La Hán',
    doneToast: 'Du khách vô cùng trân trọng văn hóa Mỹ Tho! Bạn nhận +35 🪷 và +30 XP.'
  },
  {
    id: 'su_thay_tra_sen',
    title: 'Sư thầy mời trà sen kể chuyện Hòa thượng Thích Minh Đằng',
    shortLabel: 'Sư thầy mời trà sen',
    icon: '🍵',
    pos: { x: 50.6, z: -13.4 },
    radius: 5.2,
    rewardLotus: 40,
    rewardXp: 35,
    speaker: 'Đại đức Tri khách — Chùa Vĩnh Tràng',
    story:
      '“Mời thí chủ ngồi nghỉ uống chén trà sen thanh mát. Năm 1849, Hòa thượng Thích Huệ Đăng khởi dựng ngôi cổ tự, đến năm 1907 Hòa thượng Chánh Hậu trùng tu lớn, kết hợp tinh hoa nghệ thuật Đông–Tây để ngôi chùa trăm năm vẫn vẹn nguyên giữa lòng Tiền Giang.”',
    actionLabel: '🍵 Thưởng chén trà sen & lắng nghe sử chùa',
    doneToast: 'Tâm hồn lắng dịu sau chén trà sen! Bạn nhận +40 🪷 và +35 XP.'
  }
];

export const CONG_QUA_TASKS = [
  {
    id: 'danh_bong_lu_huong',
    title: 'Đánh bóng lư hương đồng sân Chánh Điện',
    shortLabel: 'Đánh bóng lư hương đồng',
    icon: '✨',
    area: 'Sân trước Đại Hùng Bửu Điện',
    pos: { x: 23.0, z: 17.6 },
    radius: 4.8,
    rewardLotus: 25,
    rewardXp: 25,
    description:
      'Lau sạch tro nhang vương trên thành lư hương đồng cổ trước mặt tiền 13 vòm để sân chùa thêm trang nghiêm đón khách thập phương.',
    actionLabel: '✨ Làm công quả đánh bóng lư hương',
    doneToast: 'Lư hương đồng sáng bóng trang nghiêm! Bạn nhận +25 🪷 Điểm Sen công quả.'
  },
  {
    id: 'tuoi_vuon_cay_kieng',
    title: 'Tưới nước vườn cây kiểng & bồn hoa Công viên',
    shortLabel: 'Tưới vườn cây kiểng',
    icon: '🪴',
    area: 'Vườn cây kiểng · Công Viên Vĩnh Tràng',
    pos: { x: 24.5, z: 62.5 },
    radius: 5.6,
    rewardLotus: 25,
    rewardXp: 25,
    description:
      'Tưới mát hàng bông giấy, bồn hoa vạn thọ và cây kiểng cổ thụ khu vực Công Viên Vĩnh Tràng — lá xanh thêm tươi dưới nắng Mỹ Tho.',
    actionLabel: '💧 Tưới nước chăm sóc vườn hoa công viên',
    doneToast: 'Bồn hoa Công Viên Vĩnh Tràng tươi mát rực rỡ! Bạn nhận +25 🪷 Điểm Sen.'
  },
  {
    id: 'phu_don_trai_duong',
    title: 'Phụ dọn chén đũa & sắp xếp Trai đường',
    shortLabel: 'Phụ dọn Trai đường',
    icon: '🥣',
    area: 'Khu Nhà Sàn · Trai Đường phía Đông',
    pos: { x: 54.5, z: 12.2 },
    radius: 5.4,
    rewardLotus: 30,
    rewardXp: 30,
    description:
      'Phụ quý cô bác bếp chay lau bàn gỗ, xếp gọn chén đũa và châm thêm bình trà đá phục vụ Phật tử về chùa thọ trai.',
    actionLabel: '🥣 Phụ dọn bàn ghế & chén đũa Trai đường',
    doneToast: 'Trai đường gọn gàng ấm cúng nghĩa tình! Bạn nhận +30 🪷 Điểm Sen.'
  }
];

export const HERITAGE_PHOTO_SPOTS = [
  {
    id: 'photo_cong_phu',
    order: 1,
    name: 'Cổng Phụ Khảm Sành Sứ',
    subtitle: 'Nghệ thuật ghép mảnh gốm sứ cổ Tịnh Độ Huyền Môn',
    area: 'exterior',
    pos: { x: 40.5, z: 43.0 },
    radius: 11.0
  },
  {
    id: 'photo_cong_tam_quan',
    order: 2,
    name: 'Cổng Tam Quan Cổ Kính 1933',
    subtitle: 'Ba vòm cổng vàng son rực rỡ mặt tiền chùa',
    area: 'exterior',
    pos: { x: 23.0, z: 41.5 },
    radius: 11.5
  },
  {
    id: 'photo_ho_sen_koi',
    order: 3,
    name: 'Hồ Sen & Đàn Cá Koi',
    subtitle: 'Mặt hồ sen hồng gợn sóng thanh tịnh trước sân chùa',
    area: 'exterior',
    pos: { x: 3.5, z: 33.0 },
    radius: 13.0
  },
  {
    id: 'photo_mat_tien_13_vom',
    order: 4,
    name: 'Mặt Tiền Đại Hùng Bửu Điện 13 Vòm',
    subtitle: 'Kiến trúc giao thoa Đông–Tây Phục Hưng & mái ngói cổ',
    area: 'exterior',
    pos: { x: 23.0, z: 14.0 },
    radius: 13.0
  },
  {
    id: 'photo_phat_di_lac',
    order: 5,
    name: 'Đại Tượng Phật Di Lặc Hoan Hỉ',
    subtitle: 'Pho tượng Di Lặc tọa thiền cao 20m trắng sáng uy nghiêm',
    area: 'exterior',
    pos: { x: -24.5, z: 14.0 },
    radius: 15.0
  },
  {
    id: 'photo_phat_adida',
    order: 6,
    name: 'Đại Tượng Phật A Di Đà Đứng Đài Sen',
    subtitle: 'Tượng A Di Đà đứng sừng sững giữa vườn cây xanh mát',
    area: 'exterior',
    pos: { x: -9.5, z: -18.0 },
    radius: 14.5
  },
  {
    id: 'photo_phat_niet_ban',
    order: 7,
    name: 'Đại Tượng Phật Nhập Niết Bàn 32m',
    subtitle: 'Tượng Phật nằm an nhiên dài 32 mét khu vực phía Bắc',
    area: 'exterior',
    pos: { x: 12.0, z: -38.0 },
    radius: 16.0
  },
  {
    id: 'photo_bao_thap',
    order: 8,
    name: 'Bảo Tháp Xá Lợi 7 Tầng',
    subtitle: 'Ngọn tháp cổ 7 tầng vươn cao giữa nắng trời Mỹ Tho',
    area: 'exterior',
    pos: { x: -8.0, z: -37.0 },
    radius: 13.0
  },
  {
    id: 'photo_nha_luu_niem',
    order: 9,
    name: 'Nhà Lưu Niệm & Đặc Sản Chay',
    subtitle: 'Gian hàng đi bộ mua đặc sản chay, tràng hạt & quà quê Mỹ Tho',
    area: 'exterior',
    pos: { x: 42.2, z: -33.5 },
    radius: 13.0
  },
  {
    id: 'photo_cong_vien',
    order: 10,
    name: 'Công Viên Vĩnh Tràng · Đài Phun Nước',
    subtitle: 'Quảng trường tròn hoa sen, chòi lục giác & hàng cau Mỹ Tho',
    area: 'exterior',
    pos: { x: 8.0, z: 104.0 },
    radius: 42.0
  },
  {
    id: 'photo_chanh_dien_100',
    order: 11,
    name: 'Chánh Điện 100 Bồ Đoàn & Tam Bảo',
    subtitle: 'Không gian lễ Phật rộng lớn chứa hơn 100 Phật tử cùng tụng kinh',
    area: 'interior',
    pos: { x: -42.0, z: 0.0 },
    radius: 24.0
  },
  {
    id: 'photo_thap_bat_la_han',
    order: 12,
    name: 'Thập Bát La Hán Gỗ Mít 1907',
    subtitle: '18 pho tượng La Hán nghệ nhân Nam Bộ tạc thủ công từ 1907',
    area: 'interior',
    pos: { x: -34.0, z: -15.0 },
    radius: 26.0
  }
];

export function createPilgrimageDepthState(raw = {}) {
  const completedEncounters = Array.isArray(raw?.completedEncounters)
    ? Array.from(new Set(raw.completedEncounters.filter(Boolean)))
    : [];
  const completedCongQua = Array.isArray(raw?.completedCongQua)
    ? Array.from(new Set(raw.completedCongQua.filter(Boolean)))
    : [];
  const heritagePhotos =
    raw?.heritagePhotos && typeof raw.heritagePhotos === 'object' ? { ...raw.heritagePhotos } : {};
  return {
    completedEncounters,
    completedCongQua,
    heritagePhotos
  };
}

export function findNearestRandomEncounter(x, z, state = null, maxRadiusMultiplier = 1.0) {
  let best = null;
  let bestDist = Infinity;
  for (const enc of RANDOM_ENCOUNTERS) {
    const d = Math.hypot((x || 0) - enc.pos.x, (z || 0) - enc.pos.z);
    if (d <= enc.radius * maxRadiusMultiplier && d < bestDist) {
      bestDist = d;
      best = {
        ...enc,
        distance: d,
        completed: Boolean(state?.completedEncounters?.includes(enc.id))
      };
    }
  }
  return best;
}

export function completeRandomEncounter(rawState, encounterId) {
  const state = createPilgrimageDepthState(rawState);
  const enc = RANDOM_ENCOUNTERS.find((e) => e.id === encounterId);
  if (!enc) {
    return { ok: false, alreadyCompleted: false, state, encounter: null, rewardLotus: 0, rewardXp: 0 };
  }
  if (state.completedEncounters.includes(enc.id)) {
    return {
      ok: true,
      alreadyCompleted: true,
      state,
      encounter: enc,
      rewardLotus: 0,
      rewardXp: 0
    };
  }
  state.completedEncounters = [...state.completedEncounters, enc.id];
  return {
    ok: true,
    alreadyCompleted: false,
    state,
    encounter: enc,
    rewardLotus: enc.rewardLotus,
    rewardXp: enc.rewardXp
  };
}

export function findNearestCongQuaTask(x, z, state = null, maxRadiusMultiplier = 1.0) {
  let best = null;
  let bestDist = Infinity;
  for (const task of CONG_QUA_TASKS) {
    const d = Math.hypot((x || 0) - task.pos.x, (z || 0) - task.pos.z);
    if (d <= task.radius * maxRadiusMultiplier && d < bestDist) {
      bestDist = d;
      best = {
        ...task,
        distance: d,
        completed: Boolean(state?.completedCongQua?.includes(task.id))
      };
    }
  }
  return best;
}

export function completeCongQuaTask(rawState, taskId) {
  const state = createPilgrimageDepthState(rawState);
  const task = CONG_QUA_TASKS.find((t) => t.id === taskId);
  if (!task) {
    return { ok: false, alreadyCompleted: false, state, task: null, rewardLotus: 0, rewardXp: 0 };
  }
  if (state.completedCongQua.includes(task.id)) {
    return {
      ok: true,
      alreadyCompleted: true,
      state,
      task,
      rewardLotus: 0,
      rewardXp: 0
    };
  }
  state.completedCongQua = [...state.completedCongQua, task.id];
  return {
    ok: true,
    alreadyCompleted: false,
    state,
    task,
    rewardLotus: task.rewardLotus,
    rewardXp: task.rewardXp
  };
}

export function matchHeritagePhotoSpot(x, z, inInterior = false) {
  const area = inInterior ? 'interior' : 'exterior';
  let best = null;
  let bestDist = Infinity;
  for (const spot of HERITAGE_PHOTO_SPOTS) {
    if (spot.area !== area) continue;
    const d = Math.hypot((x || 0) - spot.pos.x, (z || 0) - spot.pos.z);
    if (d <= spot.radius && d < bestDist) {
      bestDist = d;
      best = spot;
    }
  }
  if (best) return best;
  // Fallback to nearest spot in current area so every genuine photo gets recognized meaningfully
  for (const spot of HERITAGE_PHOTO_SPOTS) {
    if (spot.area !== area) continue;
    const d = Math.hypot((x || 0) - spot.pos.x, (z || 0) - spot.pos.z);
    if (d < bestDist) {
      bestDist = d;
      best = spot;
    }
  }
  return best;
}

export function recordHeritagePhoto(rawState, spotId, meta = {}) {
  const state = createPilgrimageDepthState(rawState);
  const spot = HERITAGE_PHOTO_SPOTS.find((s) => s.id === spotId);
  if (!spot) {
    return { ok: false, isNewSpot: false, state, spot: null, rewardLotus: 0 };
  }
  const isNewSpot = !state.heritagePhotos[spot.id];
  state.heritagePhotos = {
    ...state.heritagePhotos,
    [spot.id]: {
      spotId: spot.id,
      name: spot.name,
      dateKey: meta.dateKey || new Date().toISOString().slice(0, 10),
      thumbnail: meta.thumbnail || ''
    }
  };
  return {
    ok: true,
    isNewSpot,
    state,
    spot,
    rewardLotus: isNewSpot ? 20 : 0
  };
}

export function getPilgrimageDepthSummary(rawState) {
  const state = createPilgrimageDepthState(rawState);
  return {
    encountersDone: state.completedEncounters.length,
    encountersTotal: RANDOM_ENCOUNTERS.length,
    congQuaDone: state.completedCongQua.length,
    congQuaTotal: CONG_QUA_TASKS.length,
    photosDone: Object.keys(state.heritagePhotos).length,
    photosTotal: HERITAGE_PHOTO_SPOTS.length
  };
}
