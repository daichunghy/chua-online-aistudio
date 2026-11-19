import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveMultiPassCollision,
  buildNavigationGrid,
  findGridPathAStar,
  DEFAULT_TEMPLE_ID,
  TEMPLE_CATALOG,
  DAILY_PEACE_ORACLES,
  createPilgrimagePassportState,
  stampTempleStation,
  stampTempleHeritage,
  stampTempleArhat,
  getNextGuidedDestination,
  drawDailyPeaceOracle,
  plantPassportGardenSlot,
  waterRealDayGardenSlot,
  harvestPassportGardenSlot,
  addTempleJournalEntry,
  mergeCloudPassportState
} from './chua-online-logic.mjs';

test('Multi-pass MTV collision slides smoothly along obstacles without tunneling', () => {
  const config = {
    radius: 0.72,
    bounds: { minX: -20, maxX: 20, minZ: -20, maxZ: 20 },
    circles: [{ x: 0, z: 0, r: 3.0 }],
    rects: [{ minX: 4, maxX: 8, minZ: -4, maxZ: 4 }],
    passes: 3
  };

  // Walking straight into circle pushes cleanly outside radius
  const res1 = resolveMultiPassCollision(0, 5, 0, 1.5, config);
  assert.equal(res1.collided, true);
  assert.ok(Math.hypot(res1.x, res1.z) >= 3.71);

  // Walking diagonally into a rect corner slides along free axis
  const res2 = resolveMultiPassCollision(3.0, 0, 5.0, 2.0, config);
  assert.equal(res2.collided, true);
  assert.ok(res2.x <= 4 - 0.71);
});

test('A* grid pathfinding routes cleanly around lotus ponds and barriers', () => {
  const grid = buildNavigationGrid({
    bounds: { minX: -20, maxX: 20, minZ: -20, maxZ: 20 },
    cellSize: 1.5,
    circles: [{ x: 0, z: 0, r: 5.0 }],
    rects: [],
    agentRadius: 0.72
  });

  const path = findGridPathAStar(grid, 0, 12, 0, -12);
  assert.ok(path.length >= 2, 'Should produce detour waypoints around central pond');
  const last = path[path.length - 1];
  assert.ok(Math.hypot(last.x - 0, last.z - -12) < 1.8);

  // None of the intermediate waypoints should sit inside the pond circle
  for (const wp of path) {
    assert.ok(Math.hypot(wp.x, wp.z) > 4.5, `Waypoint (${wp.x}, ${wp.z}) should stay outside pond`);
  }
});

test('Multi-temple pilgrimage passport supports templeId, 18 Arhats, daily oracle, and real-day garden', () => {
  assert.ok(TEMPLE_CATALOG.some((t) => t.id === DEFAULT_TEMPLE_ID && t.status === 'active'));
  assert.equal(DAILY_PEACE_ORACLES.length, 30);

  const passport = createPilgrimagePassportState(null, {
    visitedHeritageIds: ['tam_quan_1933'],
    visitedArhatIds: ['arhat_1']
  });

  assert.deepEqual(passport.temples.vinh_trang.heritageStamps, ['tam_quan_1933']);
  assert.deepEqual(passport.temples.vinh_trang.arhatStamps, ['arhat_1']);

  const day1 = new Date(2026, 4, 10, 9, 0, 0);
  const day2 = new Date(2026, 4, 11, 9, 0, 0);
  const day3 = new Date(2026, 4, 12, 9, 0, 0);

  // Guided destination advances after stamping
  const firstStep = getNextGuidedDestination(passport, '', false);
  assert.equal(firstStep.key, 'cong_tam_quan');
  stampTempleStation(passport, 'cong_tam_quan', DEFAULT_TEMPLE_ID, day1);
  const secondStep = getNextGuidedDestination(passport, 'cong_tam_quan', false);
  assert.equal(secondStep.key, 'phat_adida');

  // Stamping heritage & arhat
  const hRes = stampTempleHeritage(passport, 'adida_18m', DEFAULT_TEMPLE_ID, day1);
  assert.equal(hRes.changed, true);
  const aRes = stampTempleArhat(passport, 'arhat_2', DEFAULT_TEMPLE_ID, day1);
  assert.equal(aRes.changed, true);

  // Daily Peace Oracle draws once per calendar day
  const o1 = drawDailyPeaceOracle(passport, DEFAULT_TEMPLE_ID, day1, () => 0.15);
  assert.equal(o1.alreadyDrawn, false);
  const o2 = drawDailyPeaceOracle(passport, DEFAULT_TEMPLE_ID, day1, () => 0.85);
  assert.equal(o2.alreadyDrawn, true);
  assert.equal(o2.oracle.id, o1.oracle.id);

  // Real-day Lotus Garden allows strictly 1 water per calendar day and blooms after 3 waters (stage 1 -> 4)
  plantPassportGardenSlot(passport, 0, 'sen_hong', DEFAULT_TEMPLE_ID, day1);
  const w1 = waterRealDayGardenSlot(passport, 0, DEFAULT_TEMPLE_ID, day1);
  assert.equal(w1.ok, true);
  assert.equal(w1.slot.stage, 2);

  const w1Dup = waterRealDayGardenSlot(passport, 0, DEFAULT_TEMPLE_ID, day1);
  assert.equal(w1Dup.ok, false);
  assert.equal(w1Dup.alreadyWateredToday, true);

  const w2 = waterRealDayGardenSlot(passport, 0, DEFAULT_TEMPLE_ID, day2);
  assert.equal(w2.ok, true);
  assert.equal(w2.slot.stage, 3);

  const w3 = waterRealDayGardenSlot(passport, 0, DEFAULT_TEMPLE_ID, day3);
  assert.equal(w3.ok, true);
  assert.equal(w3.bloomedNow, true);
  assert.equal(w3.slot.stage, 4);

  const harvest = harvestPassportGardenSlot(passport, 0, DEFAULT_TEMPLE_ID, day3);
  assert.equal(harvest.ok, true);
  assert.equal(passport.temples.vinh_trang.bloomedKeepsakes.length, 1);

  // Journal entry & Cloud union merge
  addTempleJournalEntry(passport, { templeId: DEFAULT_TEMPLE_ID, text: 'Cầu gia đình bình an', mood: 'an_lac' }, day1);
  const merged = mergeCloudPassportState(passport, {
    temples: {
      vinh_trang: {
        visitedStations: ['phat_di_lac'],
        heritageStamps: ['chuong_1854'],
        arhatStamps: ['arhat_18'],
        practicedDays: ['2026-05-01']
      }
    },
    journalEntries: [
      { id: 'cloud_1', templeId: DEFAULT_TEMPLE_ID, text: 'Lên chùa sáng sớm', mood: 'tri_an', dateKey: '2026-05-01', createdAt: 1000 }
    ]
  });

  assert.ok(merged.temples.vinh_trang.visitedStations.includes('cong_tam_quan'));
  assert.ok(merged.temples.vinh_trang.visitedStations.includes('phat_di_lac'));
  assert.ok(merged.temples.vinh_trang.arhatStamps.includes('arhat_18'));
  assert.equal(merged.journalEntries.length, 2);
});
