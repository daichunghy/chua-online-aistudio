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
  createActivityHubState,
  getSortedDharmaTextbooks,
  NATIONALITY_PROFILES,
  getNationalityProfile,
  PILGRIMAGE_MODES,
  getPilgrimageMode,
  THIRTY_DAY_RETREATS,
  THIRTY_DAY_JOURNEY_PLAN,
  getThirtyDayTheme,
  LUNAR_FESTIVAL_CALENDAR,
  getTempleSeasonalContext,
  HOA_DANG_WISHES,
  createHoaDangLantern,
  DHARMA_JOURNAL,
  DHARMA_JOURNAL_MOODS,
  createDharmaJournalState,
  addJournalEntry,
  ACADEMY_COURSES,
  ACADEMY_MODULES,
  ACADEMY_ALL_IN_BUNDLE,
  getAcademyExamQuestions,
  gradeAcademyExam,
  createAcademyEntitlementState,
  unlockAcademyCourseWithCode,
  buildVietQRPayload,
  generateAcademyCertificate,
  BLESSING_TOWER_CATEGORIES,
  DEFAULT_BLESSING_TOWER_PRAYERS,
  createBlessingTowerState,
  registerBlessingTowerPrayer,
  COURTYARD_NPC_DHARMA_QUOTES,
  getCourtyardNpcSpeaker,
  pickNpcDharmaQuote,
  evaluateCourtyardNpcProximity
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


test('7 rigged 3D character profiles (first 3 intact + 4 expanded) are defined with exact heights and GLBs', () => {
  assert.equal(CHARACTER_PROFILES.length, 7);
  const keys = CHARACTER_PROFILES.map((c) => c.key);
  assert.deepEqual(keys, ['nu', 'nam', 'tre_em', 'nu_ao_lam', 'nam_ao_nau', 'du_khach', 'su_thay']);
  assert.equal(CHARACTER_PROFILES[0].heightMeters, 1.62);
  assert.equal(CHARACTER_PROFILES[1].heightMeters, 1.74);
  assert.equal(CHARACTER_PROFILES[2].heightMeters, 1.15);
  for (const prof of CHARACTER_PROFILES) {
    assert.ok(prof.glb.startsWith('/Thiết kế giao diện/Nhân vật 3D/'));
    assert.ok(prof.glb.endsWith('.glb'));
    assert.ok(prof.description.length > 20);
  }
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

test('Deeply researched Buddhist Dharma has 11 canonical PDF textbooks, 4 paths, 24 lessons, and milestone-unlocked user-photo UGC check-in', () => {
  assert.equal(DHARMA_TEXTBOOKS.length, 11);
  const fullCurriculumBook = DHARMA_TEXTBOOKS.find((b) => b.pdfPath.endsWith('/giaotrinhphathoc.pdf'));
  assert.ok(fullCurriculumBook);
  assert.equal(fullCurriculumBook.title, 'Giáo Trình Phật Học Cơ Bản Toàn Tập');
  assert.equal(fullCurriculumBook.tier, 'basic');
  for (const book of DHARMA_TEXTBOOKS) {
    assert.ok(['basic', 'intermediate', 'meditation', 'heritage'].includes(book.tier));
    assert.ok(book.pages > 100 && book.estimatedMinutes >= 30);
    assert.ok(book.pdfPath.startsWith('/Giáo trình phật học/'));
  }
  const sortedBooks = getSortedDharmaTextbooks();
  assert.equal(sortedBooks.length, 11);
  assert.equal(sortedBooks[0].sortOrder, 1);
  assert.equal(sortedBooks[1].id, 'giao_trinh_phat_hoc_toan_tap');

  assert.equal(LECTURE_PATHS.length, 4);
  assert.equal(LECTURE_LESSONS.length, 24);

  for (const lesson of LECTURE_LESSONS) {
    assert.ok(lesson.sourceBook && lesson.sourceBook.length > 5);
    assert.ok(lesson.summary.length >= 3);
    assert.equal(lesson.quiz.options.length, 3);
    assert.ok(lesson.courseId && lesson.courseId.startsWith('course_'));
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
  assert.equal(phatAdida.pos.x, 8.5); // Relocated slightly West to preserve clear Tam Quan -> Chánh Điện sightline
  assert.equal(phatAdida.pos.z, 17.5);
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
  assert.equal(chanhDien.standPos.x, 38.4);
  assert.equal(chanhDien.standPos.z, -14.5); // Walks straight down Cổng Phụ lane (x=40.5) and turns left to shoe-removal veranda
  assert.ok(chanhDien.via.length >= 2);
});

test('Expanded pagoda exploration zones, Chữ Quốc 6-zone order, and scholarly comparison notes are accurate', () => {
  assert.ok(WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX >= 160);
  assert.ok(WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ >= 200);
  assert.ok(DISCOVERY_ZONES.length >= 11);
  assert.ok(findAnyTempleDestination('nha_co_ba_hu_tieu'));
  assert.ok(findAnyTempleDestination('banh_beo_di_sau'));
  assert.ok(findAnyTempleDestination('hem_nha_vuon'));
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

test('NATIONALITY_PROFILES and PILGRIMAGE_MODES define 6 nationalities and 4 companion/vehicle modes cleanly', () => {
  assert.equal(NATIONALITY_PROFILES.length, 6);
  assert.deepEqual(
    NATIONALITY_PROFILES.map((n) => n.id),
    ['vn', 'jp', 'kr', 'tw', 'th', 'intl']
  );
  const charKeys = new Set(CHARACTER_PROFILES.map((c) => c.key));
  for (const nat of NATIONALITY_PROFILES) {
    assert.ok(nat.flag && nat.greeting && nat.accentHex.startsWith('#') && nat.badgeLabel);
    assert.ok(charKeys.has(nat.preferredCharKey));
  }
  assert.equal(getNationalityProfile('jp').id, 'jp');
  assert.equal(getNationalityProfile('unknown_nat').id, 'vn');

  assert.equal(PILGRIMAGE_MODES.length, 4);
  assert.deepEqual(
    PILGRIMAGE_MODES.map((m) => m.id),
    ['solo', 'family_3gen', 'tour_group', 'explorer']
  );
  const familyMode = getPilgrimageMode('family_3gen');
  assert.equal(familyMode.arrivalVehicle, 'van');
  assert.equal(familyMode.companions.length, 2);
  assert.ok(familyMode.companions.some((c) => c.charKey === 'tre_em'));

  const tourMode = getPilgrimageMode('tour_group');
  assert.equal(tourMode.arrivalVehicle, 'bus');
  assert.ok(tourMode.companions.length >= 2);
  for (const mode of PILGRIMAGE_MODES) {
    assert.ok(['sedan', 'van', 'bus'].includes(mode.arrivalVehicle));
    for (const comp of mode.companions) {
      assert.ok(charKeys.has(comp.charKey));
      assert.ok(comp.roleLabel && typeof comp.offset?.x === 'number' && typeof comp.offset?.z === 'number');
    }
  }
});

test('30-Day Spiritual Loop: THIRTY_DAY_JOURNEY_PLAN, LUNAR_FESTIVAL_CALENDAR, Hoa Dang lanterns, and Dharma Journal', () => {
  assert.equal(THIRTY_DAY_RETREATS.length, 4);
  assert.equal(THIRTY_DAY_JOURNEY_PLAN.length, 30);
  const weekCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (let i = 0; i < 30; i++) {
    const entry = THIRTY_DAY_JOURNEY_PLAN[i];
    assert.equal(entry.day, i + 1);
    weekCounts[entry.week] += 1;
    assert.ok(entry.title.length > 8 && entry.prompt.length > 20);
    assert.ok(entry.rewardLotus > 0 && entry.rewardXp > 0);
  }
  assert.deepEqual(weekCounts, { 1: 7, 2: 7, 3: 7, 4: 9 });
  assert.equal(getThirtyDayTheme(1).week, 1);
  assert.equal(getThirtyDayTheme(30).milestoneBadge.includes('30 Ngày'), true);

  assert.equal(LUNAR_FESTIVAL_CALENDAR.length, 5);
  const seasonal = getTempleSeasonalContext(new Date(2026, 4, 15));
  assert.equal(seasonal.dateKey, '2026-05-15');
  assert.ok(seasonal.xpMultiplier >= 1.2 && seasonal.xpMultiplier <= 1.5);
  assert.ok(seasonal.resonanceCount > 100);
  assert.ok(seasonal.greeting.length > 15);

  // Hoa Dang communal lanterns (pure, non-mutating)
  assert.ok(HOA_DANG_WISHES.length >= 6);
  const initialCount = HOA_DANG_WISHES.length;
  const lanternRes = createHoaDangLantern(HOA_DANG_WISHES, {
    authorName: 'Cô Tư Bến Tre',
    nationalityId: 'vn',
    wishText: 'Cầu mưa thuận gió hòa, gia đạo an vui.',
    colorHex: '#EE7FAE'
  });
  assert.equal(lanternRes.ok, true);
  assert.equal(HOA_DANG_WISHES.length, initialCount);
  assert.equal(lanternRes.wishes.length, initialCount + 1);
  assert.equal(lanternRes.lantern.authorName, 'Cô Tư Bến Tre');
  assert.equal(lanternRes.lantern.colorHex, '#EE7FAE');

  // Nhat Ky An Tam
  assert.ok(DHARMA_JOURNAL.entries.length >= 2);
  assert.ok(DHARMA_JOURNAL_MOODS.length >= 5);
  const emptyJournal = addJournalEntry(createDharmaJournalState(), '   ', 'binh_an');
  assert.equal(emptyJournal.ok, false);
  const savedJournal = addJournalEntry(
    createDharmaJournalState(),
    'Chiều nay tịnh tâm nghe tiếng chuông Đại Hồng Chung thấy nhẹ lòng.',
    'thanh_thoi',
    '2026-05-21'
  );
  assert.equal(savedJournal.ok, true);
  assert.equal(savedJournal.entry.mood, 'thanh_thoi');
  assert.equal(savedJournal.entries.length, DHARMA_JOURNAL.entries.length + 1);
});

test('Structured Paid Buddhist Academy: 4 courses, 12 modules, multi-question exam, unlock codes, VietQR payload, and certificate', () => {
  assert.equal(ACADEMY_COURSES.length, 4);
  assert.equal(ACADEMY_COURSES[0].id, 'course_1_khai_tam');
  assert.equal(ACADEMY_COURSES[0].priceVnd, 0);
  assert.equal(ACADEMY_COURSES[0].unlockedByDefault, true);
  assert.equal(ACADEMY_COURSES[1].priceVnd, 199000);
  assert.equal(ACADEMY_COURSES[2].priceVnd, 249000);
  assert.equal(ACADEMY_COURSES[3].priceVnd, 299000);

  // All 11 PDFs & 24 lessons are mapped cleanly across the 4 courses
  const mappedBooks = new Set(ACADEMY_COURSES.flatMap((c) => c.bookIds));
  const mappedLessons = new Set(ACADEMY_COURSES.flatMap((c) => c.lessonIds));
  assert.equal(mappedBooks.size, 11);
  assert.equal(mappedLessons.size, 24);
  assert.equal(ACADEMY_MODULES.length, 12);

  // Multi-question exam grading
  const examQuestions = getAcademyExamQuestions('course_2_tam_bao');
  assert.ok(examQuestions.length >= 10);
  const perfectAnswers = {};
  for (const q of examQuestions) perfectAnswers[q.id] = q.correctIndex;
  const passGrade = gradeAcademyExam('course_2_tam_bao', perfectAnswers);
  assert.equal(passGrade.ok, true);
  assert.equal(passGrade.scorePercent, 100);
  assert.equal(passGrade.passed, true);

  const failGrade = gradeAcademyExam('course_2_tam_bao', {});
  assert.equal(failGrade.passed, false);
  assert.equal(failGrade.scorePercent, 0);

  // Entitlement & unlock codes
  let ent = createAcademyEntitlementState();
  assert.deepEqual(ent.unlockedCourses, ['course_1_khai_tam']);
  assert.equal(ent.bundleUnlocked, false);

  const badUnlock = unlockAcademyCourseWithCode(ent, 'course_2_tam_bao', 'INVALID-123');
  assert.equal(badUnlock.ok, false);
  assert.equal(badUnlock.reason, 'invalid_code');

  const codeUnlock = unlockAcademyCourseWithCode(ent, 'course_2_tam_bao', 'vt-hv-2026a');
  assert.equal(codeUnlock.ok, true);
  assert.ok(codeUnlock.unlockedCourses.includes('course_2_tam_bao'));
  ent = codeUnlock.state;

  const sandboxBundleUnlock = unlockAcademyCourseWithCode(ent, ACADEMY_ALL_IN_BUNDLE.id, 'VINHTRANG2026');
  assert.equal(sandboxBundleUnlock.ok, true);
  assert.equal(sandboxBundleUnlock.bundleUnlocked, true);
  assert.equal(sandboxBundleUnlock.unlockedCourses.length, 4);

  // VietQR payload
  const qr = buildVietQRPayload('course_3_thien_dinh');
  assert.equal(qr.amount, 249000);
  assert.equal(qr.currency, 'VND');
  assert.ok(qr.transferMemo.startsWith('VTHV '));
  assert.ok(qr.qrPayload.includes('249000'));
  assert.ok(qr.qrImageUrl.includes('amount=249000'));
  assert.equal(qr.adapterReady.payos, true);
  assert.equal(qr.adapterReady.sepay, true);

  // Certificate generation
  const lowCert = generateAcademyCertificate('Nguyễn Văn An', 'course_4_di_san', 50);
  assert.equal(lowCert.ok, false);
  assert.equal(lowCert.passed, false);

  const cert = generateAcademyCertificate('Nguyễn Thị Minh Tâm', 'course_4_di_san', 95, new Date(2026, 4, 21));
  assert.equal(cert.ok, true);
  assert.equal(cert.passed, true);
  assert.equal(cert.studentName, 'Nguyễn Thị Minh Tâm');
  assert.equal(cert.courseId, 'course_4_di_san');
  assert.equal(cert.score, 95);
  assert.equal(cert.issuedDateKey, '2026-05-21');
  assert.ok(cert.certificateId.startsWith('CERT-'));
  assert.ok(cert.verificationCode.startsWith('VT-CERT-'));
});

test('Blessing Lamp Tower (Tháp Đèn Cầu An) validates devotee name, assigns 13-tier lamp slot, and persists cleanly', () => {
  assert.equal(BLESSING_TOWER_CATEGORIES.length, 4);
  assert.ok(DEFAULT_BLESSING_TOWER_PRAYERS.length >= 6);

  const initial = createBlessingTowerState();
  assert.equal(initial.tiersCount, 13);
  assert.equal(initial.totalCapacity, 108);
  assert.equal(initial.entries.length, DEFAULT_BLESSING_TOWER_PRAYERS.length);

  const missing = registerBlessingTowerPrayer(initial, { devoteeName: ' ' });
  assert.equal(missing.ok, false);
  assert.equal(missing.reason, 'missing_name');

  const reg = registerBlessingTowerPrayer(
    initial,
    {
      devoteeName: 'Phật tử Minh Châu · Lê Văn Hòa',
      birthYear: '1968',
      familyNote: 'TP. Mỹ Tho, Tiền Giang',
      categoryId: 'suc_khoe_cha_me',
      wishText: 'Cầu cha mẹ mạnh khỏe, gia đạo bình an.'
    },
    new Date(2026, 4, 22)
  );
  assert.equal(reg.ok, true);
  assert.equal(reg.entry.isUserOwned, true);
  assert.equal(reg.entry.birthYear, '1968');
  assert.equal(reg.entry.dateKey, '2026-05-22');
  assert.ok(reg.entry.tier >= 1 && reg.entry.tier <= 13);
  assert.ok(reg.entry.slotNumber >= 1 && reg.entry.slotNumber <= 108);
  assert.equal(reg.state.entries.length, initial.entries.length + 1);
  assert.equal(reg.rewardLotus, 25);
});

test('Courtyard NPC interaction evaluates proximity with hysteresis and picks non-repeating Dharma quotes', () => {
  assert.ok(COURTYARD_NPC_DHARMA_QUOTES.length >= 12);
  assert.equal(getCourtyardNpcSpeaker('monk', 'su_thay').label, 'Sư Thầy');
  assert.equal(getCourtyardNpcSpeaker('vendor', 'nu').label, 'Cô bán hàng cổng chùa');
  assert.equal(getCourtyardNpcSpeaker('vendor', 'nam').label, 'Chú bán hàng cổng chùa');

  const q1 = pickNpcDharmaQuote(COURTYARD_NPC_DHARMA_QUOTES, null, () => 0);
  const q2 = pickNpcDharmaQuote(COURTYARD_NPC_DHARMA_QUOTES, q1.id, () => 0);
  assert.ok(q1.quote && q1.source);
  assert.notEqual(q2.id, q1.id);

  const npcs = [
    { id: 'npc_a', x: 10, z: 10 },
    { id: 'npc_b', x: 13.4, z: 10 }
  ];

  // Out of range -> null
  assert.equal(evaluateCourtyardNpcProximity({ x: 0, z: 0 }, npcs, null), null);

  // Enter range of npc_a
  const enterA = evaluateCourtyardNpcProximity({ x: 8, z: 10 }, npcs, null);
  assert.equal(enterA?.npc.id, 'npc_a');
  assert.equal(enterA?.changed, true);

  // Hysteresis keeps npc_a active until beyond exitRadius (4.6m) unless npc_b is much closer
  const keepA = evaluateCourtyardNpcProximity({ x: 11.7, z: 10 }, npcs, 'npc_a');
  assert.equal(keepA?.npc.id, 'npc_a');
  assert.equal(keepA?.changed, false);

  // Moving directly next to npc_b switches smoothly
  const switchB = evaluateCourtyardNpcProximity({ x: 13.1, z: 10 }, npcs, 'npc_a');
  assert.equal(switchB?.npc.id, 'npc_b');
  assert.equal(switchB?.changed, true);

  // Walking beyond exitRadius clears active NPC
  assert.equal(evaluateCourtyardNpcProximity({ x: 20, z: 20 }, npcs, 'npc_b'), null);
});







