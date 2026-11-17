import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHARACTER_PROFILES,
  PILGRIMAGE_STATIONS,
  SHOP_CATALOG,
  DHARMA_TEXTBOOKS,
  LECTURE_PATHS,
  LECTURE_LESSONS,
  UGC_BACKDROPS,
  INITIAL_UGC_GALLERY,
  stepPlayerMovement,
  findNearestStation,
  createSpiritualState,
  performSpiritualAction,
  calculateJourneyImprint,
  filterShopCatalog,
  addToCart,
  updateCartQuantity,
  calculateCartSummary,
  validateOrderForm,
  getLessonsByPath,
  gradeLessonQuiz,
  createUGCPost,
  hexToOklch,
  oklchToHex,
  shiftOklch,
  VINH_TRANG_OKLCH_PALETTE,
  DAILY_DHARMA_FALLBACK,
  getLocalDateKey,
  shouldShowDailyDharmaToday,
  pickDailyDharmaQuote,
  fetchDailyDharmaService,
  STORE_CATEGORIES,
  STORE_ITEMS_CATALOG,
  createStoreProfileState,
  filterStoreItems,
  tryOnStoreItem,
  purchaseStoreItem,
  MARKETPLACE_STALL_CATEGORIES,
  MARKETPLACE_STALL_CATALOG,
  filterMarketplaceItems,
  purchaseMarketplaceItem,
  calculateMeritSummary,
  DISCOVERY_ZONES,
  WORLD_BOUNDS,
  findAnyTempleDestination,
  CHU_QUOC_ZONES,
  CHANH_DIEN_HISTORICAL_NOTES,
  computePilgrimProgress,
  PILGRIM_RANKS,
  getPilgrimRankInfo,
  grantPlayerXp,
  COURTYARD_LEAF_SPOTS,
  collectCourtyardTask,
  TEMPLE_GARDEN_SPECIES,
  plantGardenTree,
  waterGardenSlot,
  harvestGardenSlot,
  scoreBellRhythmHit,
  completeBellRhythmSession,
  HERITAGE_RELICS,
  discoverHeritageRelic,
  createActivityHubState
} from './chua-online-logic.mjs';

test('OKLab/OKLCH perceptual color engine (meodai/skill.color-expert) preserves perceptual lightness and prevents muddy mid-tones', () => {
  const gold = hexToOklch('#D9A441');
  assert.ok(gold.L > 0.68 && gold.L < 0.78);
  assert.ok(gold.C > 0.1);

  const roundTrip = oklchToHex(gold.L, gold.C, gold.H);
  const rtOklch = hexToOklch(roundTrip);
  assert.ok(Math.abs(rtOklch.L - gold.L) < 0.01);

  const sunlit = shiftOklch('#D9A441', 0.08, 1.05, 4);
  const shaded = shiftOklch('#D9A441', -0.12, 0.95, -6);
  assert.ok(hexToOklch(sunlit).L > gold.L);
  assert.ok(hexToOklch(shaded).L < gold.L);
  assert.ok(hexToOklch(shaded).C > 0.08); // Never collapses to muddy gray!
  assert.ok(VINH_TRANG_OKLCH_PALETTE.goldFacadeSun.startsWith('#'));
  assert.ok(VINH_TRANG_OKLCH_PALETTE.lotusThroneBlue.startsWith('#'));
});


test('3 rigged 3D character profiles (Nam, Nữ, Trẻ em) are defined with exact heights and GLBs', () => {
  assert.equal(CHARACTER_PROFILES.length, 3);
  const keys = CHARACTER_PROFILES.map((c) => c.key);
  assert.deepEqual(keys, ['nu', 'nam', 'tre_em']);
  assert.equal(CHARACTER_PROFILES[0].heightMeters, 1.62);
  assert.equal(CHARACTER_PROFILES[1].heightMeters, 1.74);
  assert.equal(CHARACTER_PROFILES[2].heightMeters, 1.15);
});

test('stepPlayerMovement moves character, updates yaw, and respects world bounds & obstacles', () => {
  const start = { x: 0, z: 16, yaw: Math.PI };
  const forward = stepPlayerMovement(start, { dx: 0, dz: -1 }, 0.5);
  assert.equal(forward.moving, true);
  assert.equal(forward.z, 15.5);
  assert.equal(forward.x, 0);

  const idle = stepPlayerMovement(forward, { dx: 0, dz: 0 }, 0.5);
  assert.equal(idle.moving, false);
  assert.equal(idle.z, 15.5);

  const obstacle = [{ minX: -2, maxX: 2, minZ: 14, maxZ: 15.2 }];
  const blocked = stepPlayerMovement({ x: 0, z: 15.3, yaw: Math.PI }, { dx: 0, dz: -1 }, 0.5, obstacle);
  assert.equal(blocked.z, 15.3);
});

test('findNearestStation & Dấu Ấn Hành Trình (9 lotus petals) work across all 9 temple zones without gamified EXP/levels/ranks', () => {
  assert.equal(PILGRIMAGE_STATIONS.length, 9);
  const stationKeys = PILGRIMAGE_STATIONS.map((s) => s.key);
  assert.ok(stationKeys.includes('ho_sen_ca_koi'));
  assert.ok(stationKeys.includes('phat_adida'));
  assert.ok(stationKeys.includes('phat_di_lac'));
  assert.ok(stationKeys.includes('phat_niet_ban'));
  assert.ok(stationKeys.includes('chanh_dien'));

  const nearest = findNearestStation({ x: 23.0, z: 6.0 });
  assert.equal(nearest.station.key, 'chanh_dien');

  const state = createSpiritualState({
    bowCount: 3,
    incenseOfferings: 1,
    lotusOfferings: 1,
    malaCycles: 1,
    visitedStations: [0, 1, 2, 3, 4, 5, 6, 7, 8]
  });
  const imprint = calculateJourneyImprint(state);
  assert.equal(imprint.totalPetals, 9);
  assert.equal(imprint.litCount, 9);
  assert.equal(imprint.petals.every((p) => p.lit), true);
  assert.equal('percent' in imprint, false);
  assert.equal('rankTitle' in imprint, false);
});

test('Spiritual Action State Machine handles Lễ Phật, Dâng hương 4 steps, Dâng hoa, Niệm Phật 108 beads, and unlocks UGC milestone', () => {
  let state = createSpiritualState();
  const bowRes = performSpiritualAction(state, 'LE_PHAT');
  state = bowRes.state;
  assert.equal(state.bowCount, 3);
  assert.equal(bowRes.milestoneUnlocked, true);
  assert.ok(state.completedMilestones.length >= 1);

  for (let i = 1; i <= 4; i++) {
    const incRes = performSpiritualAction(state, 'DANG_HUONG_STEP');
    state = incRes.state;
    assert.equal(state.incenseStep, i);
  }
  assert.equal(state.incenseOfferings, 1);

  const lotusRes = performSpiritualAction(state, 'DANG_HOA');
  state = lotusRes.state;
  assert.equal(state.lotusOfferings, 1);

  const malaRes = performSpiritualAction(state, 'NIEM_PHAT_BEAD', { count: 108, chant: 'Nam Mô A Di Đà Phật' });
  state = malaRes.state;
  assert.equal(state.malaCycles, 1);
  assert.equal(state.malaBeads, 0);

  const equipRes = performSpiritualAction(state, 'EQUIP_ITEM', { slot: 'hat', itemKey: 'non_la_theu_sen' });
  state = equipRes.state;
  assert.equal(state.equippedItems.hat, 'non_la_theu_sen');

  const merit = calculateMeritSummary(state);
  assert.equal(merit.bowActs, 1);
  assert.equal(merit.incenseActs, 1);
  assert.equal(merit.flowerActs, 1);
  assert.equal(merit.totalActs, 3);
});

test('Shop catalog has 3D Shop Kiosk model, exact top 3 souvenir items from Reference Image 2, and cart/order validation', () => {
  const souvenirs = filterShopCatalog('souvenir');
  const studies = filterShopCatalog('study');
  const items3d = filterShopCatalog('3d');

  assert.ok(souvenirs.length >= 8);
  assert.ok(studies.length >= 6);
  assert.ok(items3d.length >= 11);

  assert.equal(souvenirs[0].name, 'Sổ tay hoa sen');
  assert.equal(souvenirs[1].name, 'Tràng hạt gỗ');
  assert.equal(souvenirs[2].name, 'Bưu thiếp chùa');
  assert.equal(items3d[0].id, 'mo_hinh_cua_hang_3d');

  let cart = [];
  cart = addToCart(cart, 'so_tay_hoa_sen', 2);
  cart = addToCart(cart, 'trang_hat_go', 1);
  const summary1 = calculateCartSummary(cart);
  assert.equal(summary1.totalCount, 3);
  assert.equal(summary1.shippingFee, 0);

  cart = updateCartQuantity(cart, 'so_tay_hoa_sen', -2);
  const summary2 = calculateCartSummary(cart);
  assert.equal(summary2.totalCount, 1);

  const goodOrder = validateOrderForm({
    name: 'Nguyễn Thị Minh Tâm',
    phone: '0912345678',
    address: 'Ấp Mỹ An, Xã Mỹ Phong, TP. Mỹ Tho, Tiền Giang'
  });
  assert.equal(goodOrder.valid, true);
});

test('Deeply researched Buddhist Dharma has 10 canonical PDF textbooks, 4 paths, 24 lessons, and milestone-unlocked user-photo UGC check-in', () => {
  assert.equal(DHARMA_TEXTBOOKS.length, 10);
  assert.equal(LECTURE_PATHS.length, 4);
  assert.equal(LECTURE_LESSONS.length, 24);

  for (const lesson of LECTURE_LESSONS) {
    assert.ok(lesson.sourceBook && lesson.sourceBook.length > 5);
    assert.ok(lesson.summary.length >= 3);
    assert.equal(lesson.quiz.options.length, 3);
  }

  assert.equal(gradeLessonQuiz('A1', 1).correct, true);
  assert.equal(gradeLessonQuiz('D6', 1).correct, true);

  assert.ok(UGC_BACKDROPS.length >= 4);
  assert.ok(INITIAL_UGC_GALLERY.length >= 3);
  const post = createUGCPost({
    author: 'Gia đình Phật tử Mỹ Tho',
    charMode: 'family_3',
    backdropId: 'chanh_dien_mat_tien',
    poseId: 'chap_tay_le_phat',
    milestoneBadge: 'Đảnh lễ Tam Bảo trước Chánh Điện',
    userPhotoUploaded: true,
    wishText: 'Kính lễ Phật tại Chùa Vĩnh Tràng!'
  });
  assert.equal(post.charMode, 'family_3');
  assert.equal(post.userPhotoUploaded, true);
  assert.equal(post.milestoneBadge, 'Đảnh lễ Tam Bảo trước Chánh Điện');
  assert.equal(post.likes, 1);
});

test('Daily Dharma service picks a canonical Buddhist quote, gates first visit of the day, and handles JSON + fallback cleanly', async () => {
  const sampleDate = new Date(2026, 4, 15, 8, 30, 0);
  const todayKey = getLocalDateKey(sampleDate);
  assert.equal(todayKey, '2026-05-15');

  assert.equal(shouldShowDailyDharmaToday(null, todayKey), true);
  assert.equal(shouldShowDailyDharmaToday('2026-05-14', todayKey), true);
  assert.equal(shouldShowDailyDharmaToday('2026-05-15', todayKey), false);

  const picked1 = pickDailyDharmaQuote(DAILY_DHARMA_FALLBACK, null, () => 0);
  assert.equal(picked1.id, DAILY_DHARMA_FALLBACK[0].id);

  const picked2 = pickDailyDharmaQuote(DAILY_DHARMA_FALLBACK, DAILY_DHARMA_FALLBACK[0].id, () => 0);
  assert.notEqual(picked2.id, DAILY_DHARMA_FALLBACK[0].id);

  const mockQuotes = [
    {
      id: 'd1',
      quote: 'Tâm bình thế giới bình.',
      source: 'Kinh Pháp Cú',
      book: 'Tích Truyện Pháp Cú',
      reflection: 'Giữ lòng an ổn trước mọi việc.'
    },
    {
      id: 'd2',
      quote: 'Hận thù không thể diệt hận thù, chỉ có tình thương mới hóa giải được hận thù.',
      source: 'Kinh Pháp Cú · Kệ 5',
      book: 'Phật Học Phổ Thông',
      reflection: 'Lấy hiền hòa đáp lại nóng giận.'
    }
  ];

  const jsonRes = await fetchDailyDharmaService({
    fetcher: async () => ({ ok: true, json: async () => mockQuotes }),
    excludeId: 'd1',
    randomFn: () => 0,
    date: sampleDate
  });
  assert.equal(jsonRes.source, 'json');
  assert.equal(jsonRes.quotesCount, 2);
  assert.equal(jsonRes.quote.id, 'd2');
  assert.equal(jsonRes.dateKey, '2026-05-15');

  const fallbackRes = await fetchDailyDharmaService({
    fetcher: async () => {
      throw new Error('network error');
    },
    excludeId: DAILY_DHARMA_FALLBACK[0].id,
    randomFn: () => 0,
    date: sampleDate
  });
  assert.equal(fallbackRes.source, 'fallback');
  assert.ok(fallbackRes.quote.quote.length > 10);
  assert.notEqual(fallbackRes.quote.id, DAILY_DHARMA_FALLBACK[0].id);
});

test('9-category Store catalog, live try-on, level gating, and Tam Quan South->North axis layout', () => {
  const tamQuan = PILGRIMAGE_STATIONS.find((s) => s.key === 'cong_tam_quan');
  const chanhDien = PILGRIMAGE_STATIONS.find((s) => s.key === 'chanh_dien');
  const phatAdida = PILGRIMAGE_STATIONS.find((s) => s.key === 'phat_adida');
  const phatDiLac = PILGRIMAGE_STATIONS.find((s) => s.key === 'phat_di_lac');
  const nietBan = PILGRIMAGE_STATIONS.find((s) => s.key === 'phat_niet_ban');
  assert.ok(tamQuan.standPos.z > tamQuan.pos.z); // Spawns South outside Tam Quan gate
  assert.equal(tamQuan.pos.x, 23); // Front Tam Quan axis aligned with Chánh điện
  assert.equal(phatAdida.pos.x, 23); // Front garden on the main temple axis
  assert.equal(phatAdida.pos.z, 27);
  assert.ok(phatAdida.pos.z < tamQuan.pos.z);
  assert.equal(chanhDien.pos.x, 23);
  assert.equal(nietBan.pos.x, -24.5);
  assert.ok(nietBan.pos.z < -15); // Rear-west garden behind Chánh điện
  assert.equal(nietBan.pos.x, phatDiLac.pos.x); // Near the Di Lặc garden

  assert.equal(STORE_CATEGORIES.length, 9);
  assert.deepEqual(
    STORE_CATEGORIES.map((c) => c.label),
    ['Lễ vật', 'Cây Phật', 'Áo tràng', 'Tràng hạt', 'Bồ đoàn', 'Mũ', 'Pháp khí', 'Mây', 'Linh thú']
  );

  const treeItems = filterStoreItems('cay_phat');
  assert.equal(treeItems.length, 3);
  assert.equal(treeItems[0].name, 'Chậu sen');
  assert.equal(treeItems[0].price, 50);

  const robeItems = filterStoreItems('ao_trang');
  assert.equal(robeItems.length, 18);
  assert.equal(robeItems.find((r) => r.id === 'ao_trang_nau')?.requiredLevel, 1);
  assert.equal(robeItems.find((r) => r.id === 'ao_trang_trang')?.requiredLevel, 1);
  assert.equal(robeItems.find((r) => r.id === 'ao_vu_lan_hong')?.rare, true);
  assert.equal(robeItems.find((r) => r.id === 'ao_vang_nghe')?.requiredLevel, 10);
  assert.equal(robeItems.find((r) => r.id === 'ao_lam_co_tau')?.swatchHex, '#87949A');
  assert.equal(robeItems.find((r) => r.id === 'ao_trang_nau_gu')?.slot, 'robe');
  assert.equal(robeItems.find((r) => r.id === 'ao_trang_lam_nhat')?.tryable, true);
  assert.equal(robeItems.find((r) => r.id === 'ao_trang_xanh_reu')?.requiredLevel, 3);
  assert.equal(robeItems.find((r) => r.id === 'ao_trang_tim_khoi')?.rare, true);
  assert.equal(robeItems.find((r) => r.id === 'ao_trang_vang_dat')?.requiredLevel, 5);

  let st = createStoreProfileState({ level: 1, gems: 180, lotusPoints: 250 });
  const tryRes = tryOnStoreItem(st, 'ao_hoa_sen');
  st = tryRes.state;
  assert.equal(tryRes.previewing, true);
  assert.equal(st.tryingItemId, 'ao_hoa_sen');

  const buyBrown = purchaseStoreItem(st, 'ao_trang_nau');
  assert.equal(buyBrown.ok, true);
  assert.equal(buyBrown.state.equipped.robe, 'ao_trang_nau');

  const lockedBuy = purchaseStoreItem(st, 'ao_vang_nghe');
  assert.equal(lockedBuy.ok, false);
  assert.equal(lockedBuy.reason, 'level_locked');

  const buyGem = purchaseStoreItem(st, 'ao_hoa_sen');
  assert.equal(buyGem.ok, true);
  assert.equal(buyGem.state.gems, 120);
  assert.equal(buyGem.state.equipped.robe, 'ao_hoa_sen');
  assert.ok(STORE_ITEMS_CATALOG.length >= 20);

  const prog = computePilgrimProgress(
    createSpiritualState({ bowCount: 9, incenseOfferings: 3, lotusOfferings: 2, visitedStations: [0, 1, 2, 3, 4, 5] }),
    3
  );
  assert.ok(prog.level >= 4);
});

test('Temple Entrance Grocery House & continuous Chữ Quốc walkway routing work cleanly', () => {
  assert.equal(MARKETPLACE_STALL_CATEGORIES.length, 3);
  assert.ok(MARKETPLACE_STALL_CATALOG.length >= 18);
  assert.ok(filterMarketplaceItems('huong_hoa').length >= 5);
  assert.ok(filterMarketplaceItems('thu_cong').length >= 6);
  assert.ok(filterMarketplaceItems('am_thuc_chay').length >= 7);

  const profile = createStoreProfileState({ lotusPoints: 250 });
  const spiritual = createSpiritualState();
  const useRes = purchaseMarketplaceItem(profile, spiritual, [], 'sap_hoa_sen_tuoi', 'use_now');
  assert.equal(useRes.ok, true);
  assert.equal(useRes.storeProfile.lotusPoints, 220);
  assert.equal(useRes.spiritual.lotusOfferings, 1);

  const cartRes = purchaseMarketplaceItem(useRes.storeProfile, useRes.spiritual, [], 'sap_quat_nan_gio_may', 'cart');
  assert.equal(cartRes.ok, true);
  assert.equal(cartRes.cart.length, 1);
  assert.equal(cartRes.cart[0].id, 'quat_nan_gio_may');

  const chanhDien = PILGRIMAGE_STATIONS.find((s) => s.key === 'chanh_dien');
  assert.equal(chanhDien.standPos.x, 30.2);
  assert.equal(chanhDien.standPos.z, 12.2); // Approaches via cửa hông courtyard before entering Tiền đường -> Chánh điện
  assert.ok(chanhDien.via.length >= 2);
});

test('Expanded pagoda exploration zones, Chữ Quốc 6-zone order, and scholarly comparison notes are accurate', () => {
  assert.ok(WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX >= 130);
  assert.ok(WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ >= 150);
  assert.ok(DISCOVERY_ZONES.length >= 8);
  assert.ok(findAnyTempleDestination('vuon_lam_ty_ni'));
  assert.ok(findAnyTempleDestination('non_bo_quan_am'));
  assert.ok(findAnyTempleDestination('ho_phong_sinh'));
  assert.ok(findAnyTempleDestination('hau_to_nha_to'));
  assert.ok(findAnyTempleDestination('lau_tra_thien'));
  assert.ok(findAnyTempleDestination('nha_san_trai_duong'));
  assert.ok(findAnyTempleDestination('bao_thap_that_phat'));

  assert.equal(CHU_QUOC_ZONES.length, 6);
  assert.deepEqual(
    CHU_QUOC_ZONES.map((z) => z.id),
    ['tien_duong', 'chanh_dien_noi_that', 'san_thien_tinh_1', 'nha_to', 'san_thien_tinh_2', 'nha_hau']
  );
  assert.equal(CHANH_DIEN_HISTORICAL_NOTES.sources.length, 2);
});

test('Multi-day replayable gameplay: Pilgrim XP ranks, courtyard leaf sweep, Temple Garden plant/water/harvest, Bell rhythm, and Heritage Stamp Book', () => {
  assert.equal(PILGRIM_RANKS.length, 5);
  assert.equal(getPilgrimRankInfo(0).title, 'Thiện Duyên');
  assert.equal(getPilgrimRankInfo(120).title, 'Hành Giả');
  assert.equal(getPilgrimRankInfo(700).level, 4);

  let act = createActivityHubState();
  let prof = createStoreProfileState({ lotusPoints: 200, gems: 20 });

  // Collect 4 Bodhi leaves -> grants +15 lotus each + 1 gem on 4th
  for (let i = 0; i < 4; i++) {
    const res = collectCourtyardTask(act, prof, COURTYARD_LEAF_SPOTS[i].id, '2026-05-20');
    assert.equal(res.ok, true);
    act = res.activity;
    prof = res.storeProfile;
  }
  assert.equal(prof.lotusPoints, 260);
  assert.equal(prof.gems, 21);
  assert.equal(act.dailyMetrics.dailyLeavesSwept, 4);
  assert.equal(act.xp, 60);

  // Plant, water x2, and harvest Temple Garden slot 0
  const plantRes = plantGardenTree(act, prof, 0, 'cay_bo_de', '2026-05-20');
  assert.equal(plantRes.ok, true);
  act = plantRes.activity;
  prof = plantRes.storeProfile;
  assert.equal(prof.lotusPoints, 210);

  const w1 = waterGardenSlot(act, prof, 0, '2026-05-20');
  assert.equal(w1.ok, true);
  assert.equal(w1.slot.stage, 2);
  act = w1.activity;
  prof = w1.storeProfile;

  const w2 = waterGardenSlot(act, prof, 0, '2026-05-20');
  assert.equal(w2.ok, true);
  assert.equal(w2.slot.stage, 3);
  act = w2.activity;
  prof = w2.storeProfile;

  const harvestRes = harvestGardenSlot(act, prof, 0, '2026-05-20');
  assert.equal(harvestRes.ok, true);
  act = harvestRes.activity;
  prof = harvestRes.storeProfile;
  assert.equal(act.templeGarden[0].speciesId, null);
  assert.equal(act.templeGarden[0].harvestCount, 1);
  assert.ok(prof.lotusPoints > 300);

  // Bell rhythm hit scoring & session completion
  assert.equal(scoreBellRhythmHit(35).grade, 'chanh_niem');
  assert.equal(scoreBellRhythmHit(-140).grade, 'hoa_nhip');
  assert.equal(scoreBellRhythmHit(250).grade, 'cham_nhip');
  assert.equal(scoreBellRhythmHit(400).grade, 'miss');

  const hits = [scoreBellRhythmHit(20), scoreBellRhythmHit(40), scoreBellRhythmHit(110), scoreBellRhythmHit(50)];
  const rhyRes = completeBellRhythmSession(act, prof, hits, '2026-05-20');
  assert.equal(rhyRes.ok, true);
  assert.equal(rhyRes.accuracy, 100);
  act = rhyRes.activity;
  prof = rhyRes.storeProfile;
  assert.equal(act.dailyMetrics.dailyRhythmSessions, 1);

  // Heritage Stamp Book discovery
  assert.equal(HERITAGE_RELICS.length, 10);
  const rel1 = discoverHeritageRelic(act, prof, 'relic_tam_quan', '2026-05-20');
  assert.equal(rel1.ok, true);
  assert.equal(rel1.alreadyDiscovered, false);
  act = rel1.activity;
  prof = rel1.storeProfile;
  assert.equal(act.heritageRelics.length, 1);

  const relDup = discoverHeritageRelic(act, prof, 'relic_tam_quan', '2026-05-20');
  assert.equal(relDup.alreadyDiscovered, true);
});





