export const SOCIAL_GIFT_CATALOG = [
  {
    id: 'doa_sen_tuoi',
    name: 'Đóa Sen Hồng Đồng Tháp',
    icon: '🪷',
    costMerit: 0,
    senderMerit: 4,
    receiverMerit: 6,
    desc: 'Gieo duyên thanh tịnh, không tốn Công Đức.',
    defaultWish: 'Kính tặng đạo hữu đóa sen thanh tịnh, chúc thân tâm thường an lạc.',
  },
  {
    id: 'nen_tram_huong',
    name: 'Nén Trầm Hương Tịnh Tâm',
    icon: '🕯️',
    costMerit: 15,
    senderMerit: 8,
    receiverMerit: 12,
    desc: 'Hương trầm dịu nhẹ giúp an định tâm trí khi lễ Phật.',
    defaultWish: 'Kính biếu nén trầm hương, nguyện mọi phiền não tiêu tan.',
  },
  {
    id: 'tra_sen_dong_thap',
    name: 'Ấm Trà Sen Miền Tây',
    icon: '🍵',
    costMerit: 20,
    senderMerit: 10,
    receiverMerit: 15,
    desc: 'Chén trà sen ấm lòng sau buổi viếng chùa Vĩnh Tràng.',
    defaultWish: 'Mời đạo hữu chén trà sen thanh mát, gia đạo bình an.',
  },
  {
    id: 'den_hoa_dang',
    name: 'Đèn Hoa Đăng Cát Tường',
    icon: '🏮',
    costMerit: 25,
    senderMerit: 12,
    receiverMerit: 18,
    desc: 'Ánh đèn trí tuệ chiếu soi con đường thiện lành.',
    defaultWish: 'Gửi ánh đèn hoa đăng cầu chúc trí tuệ sáng suốt, vạn sự cát tường.',
  },
  {
    id: 'trang_hat_bo_de',
    name: 'Tràng Hạt Bồ Đề 108 Hạt',
    icon: '📿',
    costMerit: 30,
    senderMerit: 15,
    receiverMerit: 22,
    desc: 'Pháp bảo hộ trì chánh niệm trong từng hơi thở.',
    defaultWish: 'Kính tặng tràng hạt Bồ Đề, chúc đạo hữu tinh tấn tu học mỗi ngày.',
  },
];

export const DEFAULT_COMMUNITY_MEMBERS = [
  {
    uid: 'npc_minh_tam',
    displayName: 'Nguyễn Minh Tâm',
    dharmaName: 'Diệu An',
    friendCode: 'VT-2048',
    rankTitle: 'Hộ Pháp Tinh Tấn',
    meritScore: 540,
    streakDays: 21,
    giftsSent: 18,
    currentArea: 'Chánh Điện Vĩnh Tràng',
    charKey: 'nu_ao_lam',
    online: true,
  },
  {
    uid: 'npc_thien_duc',
    displayName: 'Trần Thiện Đức',
    dharmaName: 'Quảng Minh',
    friendCode: 'VT-3192',
    rankTitle: 'Cư Sĩ Hộ Trì',
    meritScore: 485,
    streakDays: 16,
    giftsSent: 14,
    currentArea: 'Tượng Phật Di Lặc',
    charKey: 'nam_ao_nau',
    online: true,
  },
  {
    uid: 'npc_thanh_hien',
    displayName: 'Lê Thanh Hiền',
    dharmaName: 'Tịnh Liên',
    friendCode: 'VT-4410',
    rankTitle: 'Liên Hoa Thiện Tín',
    meritScore: 410,
    streakDays: 14,
    giftsSent: 12,
    currentArea: 'Tháp Đèn Cầu An',
    charKey: 'nu_ao_lam',
    online: true,
  },
  {
    uid: 'npc_hoang_nam',
    displayName: 'Phạm Hoàng Nam',
    dharmaName: 'Chân Tín',
    friendCode: 'VT-5821',
    rankTitle: 'Hành Giả Chánh Niệm',
    meritScore: 340,
    streakDays: 11,
    giftsSent: 9,
    currentArea: 'Tượng Phật A Di Đà',
    charKey: 'nam_ao_nau',
    online: true,
  },
  {
    uid: 'npc_ngoc_mai',
    displayName: 'Võ Thị Ngọc Mai',
    dharmaName: 'Hương Sen',
    friendCode: 'VT-6137',
    rankTitle: 'Phật Tử Thuận Thành',
    meritScore: 295,
    streakDays: 9,
    giftsSent: 11,
    currentArea: 'Hồ Sen Bộ',
    charKey: 'nu_ao_lam',
    online: false,
  },
  {
    uid: 'npc_phuoc_loc',
    displayName: 'Huỳnh Phước Lộc',
    dharmaName: 'Minh Hải',
    friendCode: 'VT-7254',
    rankTitle: 'Thiện Nam Tín Nữ',
    meritScore: 245,
    streakDays: 7,
    giftsSent: 7,
    currentArea: 'Tượng Phật Niết Bàn',
    charKey: 'nam_ao_nau',
    online: true,
  },
  {
    uid: 'npc_thu_ha',
    displayName: 'Đặng Thu Hà',
    dharmaName: 'Diệu Thảo',
    friendCode: 'VT-8093',
    rankTitle: 'Người Hữu Duyên',
    meritScore: 190,
    streakDays: 5,
    giftsSent: 6,
    currentArea: 'Cổng Tam Quan',
    charKey: 'nu_ao_lam',
    online: true,
  },
  {
    uid: 'npc_gia_bao',
    displayName: 'Bùi Gia Bảo',
    dharmaName: 'Tâm Phúc',
    friendCode: 'VT-9146',
    rankTitle: 'Học Trò Thiện Tâm',
    meritScore: 135,
    streakDays: 4,
    giftsSent: 4,
    currentArea: 'Công Viên Vĩnh Tràng',
    charKey: 'tre_em',
    online: false,
  },
];

export const DEFAULT_COMMUNITY_POSTS = [
  {
    id: 'post_seed_1',
    authorUid: 'npc_minh_tam',
    authorName: 'Diệu An (Nguyễn Minh Tâm)',
    category: 'Hồi hướng',
    text: 'Sáng nay vào Chánh Điện nghe tiếng Đại Hồng Chung ngân vang mà lòng nhẹ bẫng. Nguyện hồi hướng công đức này cho cha mẹ hai bên luôn khỏe mạnh, bình an.',
    createdAt: '2025-05-01T07:15:00.000Z',
    rejoiceCount: 24,
    rejoicedByMe: false,
  },
  {
    id: 'post_seed_2',
    authorUid: 'npc_thien_duc',
    authorName: 'Quảng Minh (Trần Thiện Đức)',
    category: 'Cầu an',
    text: 'Vừa thắp đèn ở Tháp Đèn Cầu An ngay sân trước Chánh Điện. Cầu cho tất cả đạo hữu hữu duyên có một tuần làm việc hanh thông, tâm luôn sáng suốt.',
    createdAt: '2025-05-01T09:40:00.000Z',
    rejoiceCount: 19,
    rejoicedByMe: false,
  },
  {
    id: 'post_seed_3',
    authorUid: 'npc_thanh_hien',
    authorName: 'Tịnh Liên (Lê Thanh Hiền)',
    category: 'Gieo duyên',
    text: 'Có đạo hữu nào hay tụng bài Kệ Hồi Hướng buổi tối không ạ? Kết bạn cùng nhắc nhau giữ chuỗi tu tập mỗi ngày nhé!',
    createdAt: '2025-05-01T14:20:00.000Z',
    rejoiceCount: 15,
    rejoicedByMe: false,
  },
];

export function generateFriendCode(seed = '') {
  const clean = String(seed || 'CHUA-VINH-TRANG');
  let hash = 2166136261;
  for (let i = 0; i < clean.length; i += 1) {
    hash ^= clean.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const num = (Math.abs(hash) % 8999) + 1000;
  return `VT-${num}`;
}

export function createSocialState(saved = null, playerInfo = {}) {
  const friendCode =
    saved?.friendCode ||
    generateFriendCode(playerInfo.uid || playerInfo.displayName || 'khach-hanh-huong');

  const friends = Array.isArray(saved?.friends)
    ? saved.friends.map((f) => ({ ...f }))
    : [
        { ...DEFAULT_COMMUNITY_MEMBERS[0], addedAt: '2025-05-01T08:00:00.000Z' },
        { ...DEFAULT_COMMUNITY_MEMBERS[2], addedAt: '2025-05-01T08:10:00.000Z' },
      ];

  const incomingRequests = Array.isArray(saved?.incomingRequests)
    ? saved.incomingRequests.map((r) => ({ ...r }))
    : [
        {
          id: 'req_seed_1',
          uid: DEFAULT_COMMUNITY_MEMBERS[1].uid,
          displayName: DEFAULT_COMMUNITY_MEMBERS[1].displayName,
          dharmaName: DEFAULT_COMMUNITY_MEMBERS[1].dharmaName,
          friendCode: DEFAULT_COMMUNITY_MEMBERS[1].friendCode,
          rankTitle: DEFAULT_COMMUNITY_MEMBERS[1].rankTitle,
          currentArea: DEFAULT_COMMUNITY_MEMBERS[1].currentArea,
          note: 'Hữu duyên gặp tại Chùa Vĩnh Tràng, xin kết bạn cùng tu tập!',
          createdAt: '2025-05-01T10:00:00.000Z',
        },
      ];

  const outgoingRequestUids = Array.isArray(saved?.outgoingRequestUids)
    ? [...saved.outgoingRequestUids]
    : [];

  const receivedGifts = Array.isArray(saved?.receivedGifts)
    ? saved.receivedGifts.map((g) => ({ ...g }))
    : [
        {
          id: 'gift_seed_1',
          giftId: 'doa_sen_tuoi',
          giftName: SOCIAL_GIFT_CATALOG[0].name,
          giftIcon: SOCIAL_GIFT_CATALOG[0].icon,
          fromUid: DEFAULT_COMMUNITY_MEMBERS[0].uid,
          fromName: 'Diệu An (Nguyễn Minh Tâm)',
          message: 'Hoan hỷ chào đón đạo hữu đến viếng Chùa Vĩnh Tràng!',
          meritReward: 6,
          claimed: false,
          createdAt: '2025-05-01T08:30:00.000Z',
        },
      ];

  const sentGifts = Array.isArray(saved?.sentGifts)
    ? saved.sentGifts.map((g) => ({ ...g }))
    : [];

  const communityPosts =
    Array.isArray(saved?.communityPosts) && saved.communityPosts.length > 0
      ? saved.communityPosts.map((p) => ({ ...p }))
      : DEFAULT_COMMUNITY_POSTS.map((p) => ({ ...p }));

  return {
    friendCode,
    bio: saved?.bio || 'Hành hương Chùa Vĩnh Tràng, nguyện thân tâm an lạc.',
    friends,
    incomingRequests,
    outgoingRequestUids,
    receivedGifts,
    sentGifts,
    communityPosts,
    blessingGreetingsSent: Number(saved?.blessingGreetingsSent || 0),
    communityGoalBaseMerit: Number(saved?.communityGoalBaseMerit || 7620),
    communityGoalTarget: Number(saved?.communityGoalTarget || 10000),
  };
}

export function getUnreadSocialCount(socialState) {
  if (!socialState) return 0;
  const pendingReqs = Array.isArray(socialState.incomingRequests)
    ? socialState.incomingRequests.length
    : 0;
  const unclaimedGifts = Array.isArray(socialState.receivedGifts)
    ? socialState.receivedGifts.filter((g) => !g.claimed).length
    : 0;
  return pendingReqs + unclaimedGifts;
}

export function findCommunityMember(query, directory = DEFAULT_COMMUNITY_MEMBERS) {
  const q = String(query || '').trim().toUpperCase();
  if (!q) return null;
  return (
    directory.find(
      (m) =>
        m.uid.toUpperCase() === q ||
        m.friendCode.toUpperCase() === q ||
        m.displayName.toUpperCase().includes(q) ||
        (m.dharmaName && m.dharmaName.toUpperCase().includes(q))
    ) || null
  );
}

export function sendFriendRequest(socialState, codeOrUid, directory = DEFAULT_COMMUNITY_MEMBERS) {
  const clean = String(codeOrUid || '').trim();
  if (!clean) {
    return { ok: false, message: 'Vui lòng nhập mã kết bạn (ví dụ: VT-3192) hoặc tên đạo hữu.' };
  }
  if (clean.toUpperCase() === String(socialState.friendCode || '').toUpperCase()) {
    return { ok: false, message: 'Đây là mã kết bạn của chính bạn.' };
  }

  const target = findCommunityMember(clean, directory);
  if (!target) {
    // Allow adding an external cloud code format VT-XXXX gracefully
    if (/^VT-\d{4}$/i.test(clean)) {
      const codeUpper = clean.toUpperCase();
      const syntheticUid = `code_${codeUpper.toLowerCase().replace('-', '_')}`;
      if (socialState.friends.some((f) => f.friendCode === codeUpper)) {
        return { ok: false, message: `Đạo hữu ${codeUpper} đã có trong danh sách bạn bè.` };
      }
      const newFriend = {
        uid: syntheticUid,
        displayName: `Đạo hữu ${codeUpper}`,
        dharmaName: 'Liên Hữu',
        friendCode: codeUpper,
        rankTitle: 'Phật Tử Hữu Duyên',
        meritScore: 120,
        streakDays: 3,
        giftsSent: 2,
        currentArea: 'Sân Chùa Vĩnh Tràng',
        charKey: 'nu_ao_lam',
        online: true,
        addedAt: new Date().toISOString(),
      };
      socialState.friends.unshift(newFriend);
      return { ok: true, friend: newFriend, message: `Đã kết bạn thành công với ${newFriend.displayName}!` };
    }
    return { ok: false, message: `Không tìm thấy đạo hữu "${clean}". Thử nhập mã như VT-5821.` };
  }

  if (socialState.friends.some((f) => f.uid === target.uid)) {
    return { ok: false, message: `${target.displayName} đã là bạn bè của bạn.` };
  }

  // If this person already sent us a request, accept it immediately!
  const existingIncoming = socialState.incomingRequests.find((r) => r.uid === target.uid);
  if (existingIncoming) {
    return acceptFriendRequest(socialState, existingIncoming.id, directory);
  }

  const added = { ...target, addedAt: new Date().toISOString() };
  socialState.friends.unshift(added);
  return {
    ok: true,
    friend: added,
    message: `Đã kết bạn đạo hữu cùng ${target.displayName} (${target.dharmaName}).`,
  };
}

export function acceptFriendRequest(socialState, reqId, directory = DEFAULT_COMMUNITY_MEMBERS) {
  const idx = socialState.incomingRequests.findIndex((r) => r.id === reqId);
  if (idx < 0) return { ok: false, message: 'Lời mời không còn tồn tại.' };
  const [req] = socialState.incomingRequests.splice(idx, 1);
  if (!socialState.friends.some((f) => f.uid === req.uid)) {
    const profile = directory.find((m) => m.uid === req.uid);
    socialState.friends.unshift({
      ...(profile || {
        uid: req.uid,
        displayName: req.displayName,
        dharmaName: req.dharmaName || 'Đạo Hữu',
        friendCode: req.friendCode || 'VT-0000',
        rankTitle: req.rankTitle || 'Phật Tử',
        meritScore: 150,
        streakDays: 4,
        giftsSent: 3,
        currentArea: req.currentArea || 'Sân Chùa',
        charKey: 'nam_ao_nau',
        online: true,
      }),
      addedAt: new Date().toISOString(),
    });
  }
  return { ok: true, message: `Đã chấp nhận kết bạn cùng ${req.displayName}.` };
}

export function declineFriendRequest(socialState, reqId) {
  const idx = socialState.incomingRequests.findIndex((r) => r.id === reqId);
  if (idx < 0) return { ok: false, message: 'Không tìm thấy lời mời.' };
  const [req] = socialState.incomingRequests.splice(idx, 1);
  return { ok: true, message: `Đã từ chối lời mời từ ${req.displayName}.` };
}

export function removeFriend(socialState, friendUid) {
  const idx = socialState.friends.findIndex((f) => f.uid === friendUid);
  if (idx < 0) return { ok: false, message: 'Không tìm thấy bạn bè.' };
  const [removed] = socialState.friends.splice(idx, 1);
  return { ok: true, message: `Đã xóa ${removed.displayName} khỏi danh sách bạn bè.` };
}

export function sendGiftToFriend(socialState, storeProfile, recipientUid, giftId, message = '') {
  const gift = SOCIAL_GIFT_CATALOG.find((g) => g.id === giftId);
  if (!gift) return { ok: false, message: 'Vật phẩm tặng không hợp lệ.' };

  const recipient =
    socialState.friends.find((f) => f.uid === recipientUid) ||
    DEFAULT_COMMUNITY_MEMBERS.find((m) => m.uid === recipientUid);
  if (!recipient) return { ok: false, message: 'Vui lòng chọn đạo hữu nhận quà.' };

  const currentBalance = Number(storeProfile?.meritPoints || 0);
  if (gift.costMerit > 0 && currentBalance < gift.costMerit) {
    return {
      ok: false,
      message: `Cần ${gift.costMerit} điểm Công Đức để tặng ${gift.name} (hiện có ${currentBalance}).`,
    };
  }

  if (storeProfile && gift.costMerit > 0) {
    storeProfile.meritPoints = Math.max(0, currentBalance - gift.costMerit);
  }
  if (storeProfile && gift.senderMerit > 0) {
    storeProfile.meritPoints = Number(storeProfile.meritPoints || 0) + gift.senderMerit;
  }

  const tx = {
    id: `gift_tx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    giftId: gift.id,
    giftName: gift.name,
    giftIcon: gift.icon,
    toUid: recipient.uid,
    toName: recipient.displayName,
    message: String(message || gift.defaultWish).trim().slice(0, 180),
    costMerit: gift.costMerit,
    senderMerit: gift.senderMerit,
    createdAt: new Date().toISOString(),
  };
  socialState.sentGifts.unshift(tx);
  if (socialState.sentGifts.length > 50) socialState.sentGifts.length = 50;

  return {
    ok: true,
    tx,
    message: `Đã gửi ${gift.icon} ${gift.name} đến ${recipient.displayName} (+${gift.senderMerit} Công Đức gieo duyên).`,
  };
}

export function claimReceivedGift(socialState, storeProfile, giftTxId) {
  const gift = socialState.receivedGifts.find((g) => g.id === giftTxId);
  if (!gift) return { ok: false, message: 'Không tìm thấy món quà này.' };
  if (gift.claimed) return { ok: false, message: 'Món quà này đã được nhận rồi.' };

  gift.claimed = true;
  gift.claimedAt = new Date().toISOString();
  const reward = Number(gift.meritReward || 6);
  if (storeProfile) {
    storeProfile.meritPoints = Number(storeProfile.meritPoints || 0) + reward;
  }
  return {
    ok: true,
    reward,
    message: `Hoan hỷ nhận ${gift.giftIcon} ${gift.giftName} từ ${gift.fromName} (+${reward} Công Đức).`,
  };
}

export function computeLeaderboard(socialState, playerMetrics = {}, tab = 'merit', cloudProfiles = []) {
  const byUid = new Map();
  for (const m of DEFAULT_COMMUNITY_MEMBERS) {
    byUid.set(m.uid, { ...m, isPlayer: false });
  }
  for (const f of socialState?.friends || []) {
    if (!byUid.has(f.uid)) {
      byUid.set(f.uid, { ...f, isPlayer: false });
    }
  }
  for (const c of cloudProfiles || []) {
    if (!c || !c.uid) continue;
    byUid.set(c.uid, {
      uid: c.uid,
      displayName: c.displayName || 'Đạo hữu',
      dharmaName: c.dharmaName || '',
      friendCode: c.friendCode || generateFriendCode(c.uid),
      rankTitle: c.rankTitle || 'Phật Tử',
      meritScore: Number(c.meritScore || 0),
      streakDays: Number(c.streakDays || 1),
      giftsSent: Number(c.giftsSent || 0),
      currentArea: c.currentArea || 'Chùa Vĩnh Tràng',
      charKey: c.charKey || 'nu_ao_lam',
      online: true,
      isPlayer: false,
    });
  }

  const playerUid = playerMetrics.uid || 'local_player';
  const playerRow = {
    uid: playerUid,
    displayName: playerMetrics.displayName || 'Bạn (Khách hành hương)',
    dharmaName: playerMetrics.dharmaName || '',
    friendCode: socialState?.friendCode || generateFriendCode(playerUid),
    rankTitle: playerMetrics.rankTitle || 'Phật Tử Hữu Duyên',
    meritScore: Number(playerMetrics.meritScore || 0),
    streakDays: Math.max(1, Number(playerMetrics.streakDays || 1)),
    giftsSent: Number(socialState?.sentGifts?.length || 0) + Number(playerMetrics.giftsSent || 0),
    currentArea: playerMetrics.currentArea || 'Sân Chùa Vĩnh Tràng',
    charKey: playerMetrics.charKey || 'nu_ao_lam',
    online: true,
    isPlayer: true,
  };
  byUid.set(playerUid, playerRow);

  const metricKey =
    tab === 'streak' ? 'streakDays' : tab === 'generosity' ? 'giftsSent' : 'meritScore';

  const rows = Array.from(byUid.values()).sort((a, b) => {
    const diff = Number(b[metricKey] || 0) - Number(a[metricKey] || 0);
    if (diff !== 0) return diff;
    return Number(b.meritScore || 0) - Number(a.meritScore || 0);
  });

  const ranked = rows.map((row, idx) => ({
    ...row,
    rank: idx + 1,
    metricValue: Number(row[metricKey] || 0),
  }));

  const me = ranked.find((r) => r.isPlayer) || ranked[ranked.length - 1];
  return {
    tab,
    metricKey,
    rows: ranked,
    me,
  };
}

export function addCommunityPost(socialState, authorInfo = {}, text = '', category = 'Cầu an') {
  const clean = String(text || '').trim().slice(0, 260);
  if (clean.length < 4) {
    return { ok: false, message: 'Lời chúc hoặc chia sẻ cần ít nhất 4 ký tự.' };
  }
  const displayName = authorInfo.dharmaName
    ? `${authorInfo.dharmaName} (${authorInfo.displayName || 'Đạo hữu'})`
    : authorInfo.displayName || 'Khách hành hương';

  const post = {
    id: `post_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    authorUid: authorInfo.uid || 'local_player',
    authorName: displayName,
    category: category || 'Cầu an',
    text: clean,
    createdAt: new Date().toISOString(),
    rejoiceCount: 1,
    rejoicedByMe: true,
  };
  socialState.communityPosts.unshift(post);
  if (socialState.communityPosts.length > 40) socialState.communityPosts.length = 40;
  return { ok: true, post, message: 'Đã gửi lời chúc an lành lên Bảng Giao Lưu.' };
}

export function toggleRejoicePost(socialState, postId) {
  const post = socialState.communityPosts.find((p) => p.id === postId);
  if (!post) return { ok: false };
  post.rejoicedByMe = !post.rejoicedByMe;
  post.rejoiceCount = Math.max(0, Number(post.rejoiceCount || 0) + (post.rejoicedByMe ? 1 : -1));
  return { ok: true, post };
}

export function computeCommunityGoalProgress(socialState, playerMerit = 0) {
  const base = Number(socialState?.communityGoalBaseMerit || 7620);
  const target = Math.max(1000, Number(socialState?.communityGoalTarget || 10000));
  const giftsBonus = (socialState?.sentGifts?.length || 0) * 15;
  const current = base + Math.max(0, Number(playerMerit || 0)) + giftsBonus;
  const pct = Math.min(100, Math.round((current / target) * 100));
  return {
    current,
    target,
    pct,
    remaining: Math.max(0, target - current),
  };
}
