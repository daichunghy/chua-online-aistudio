import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DAILY_VIRTUE_GOAL,
  DAILY_VIRTUE_BONUS_LOTUS,
  VIRTUE_ACTIONS,
  VIRTUE_MILESTONES,
  createVirtueMeterState,
  ensureVirtueMeterDate,
  recordVirtueActivity,
  getVirtueStageLabel,
  getVirtueMeterSummary,
  resolveMultiPassCollision,
  getTerrainGroundHeight,
  WORLD_BOUNDS,
  PILGRIMAGE_STATIONS
} from './chua-online-logic.mjs';

test('createVirtueMeterState initializes clean state and preserves same-day progress', () => {
  const fresh = createVirtueMeterState(null, '2026-11-20');
  assert.equal(fresh.dateKey, '2026-11-20');
  assert.equal(fresh.dailyGoal, DAILY_VIRTUE_GOAL);
  assert.equal(fresh.todayPoints, 0);
  assert.equal(fresh.streakDays, 0);
  assert.equal(fresh.lifetimePoints, 0);

  const sameDay = createVirtueMeterState(
    {
      dateKey: '2026-11-20',
      todayPoints: 45,
      actionCounts: { incense: 1, reading: 1, invalid_key: 99 },
      streakDays: 3,
      lifetimePoints: 245
    },
    '2026-11-20'
  );
  assert.equal(sameDay.todayPoints, 45);
  assert.deepEqual(sameDay.actionCounts, { incense: 1, reading: 1 });
  assert.equal(sameDay.streakDays, 3);
  assert.equal(sameDay.lifetimePoints, 245);
});

test('daily rollover resets todayPoints, preserves consecutive streak, and resets broken streak', () => {
  const completedYesterday = {
    dateKey: '2026-11-20',
    todayPoints: 105,
    actionCounts: { incense: 2, reading: 2, bow: 1 },
    lastCompletedDate: '2026-11-20',
    goalRewardClaimedDate: '2026-11-20',
    streakDays: 4,
    totalDaysCompleted: 10,
    lifetimePoints: 900
  };

  // Next consecutive day keeps streak = 4 and resets todayPoints to 0
  const nextDay = ensureVirtueMeterDate(completedYesterday, '2026-11-21');
  assert.equal(nextDay.dateKey, '2026-11-21');
  assert.equal(nextDay.todayPoints, 0);
  assert.deepEqual(nextDay.actionCounts, {});
  assert.equal(nextDay.streakDays, 4);
  assert.equal(nextDay.lifetimePoints, 900);

  // Skipping a full day resets streak to 0
  const skippedDay = ensureVirtueMeterDate(completedYesterday, '2026-11-22');
  assert.equal(skippedDay.streakDays, 0);
  assert.equal(skippedDay.totalDaysCompleted, 10);
});

test('recordVirtueActivity tracks incense, reading, caps, milestones, and idempotent daily goal bonus', () => {
  let state = createVirtueMeterState(null, '2026-11-20');

  // 1. Incense (+20) -> 20/100 (Bắt Đầu)
  const r1 = recordVirtueActivity(state, 'incense', { dateKey: '2026-11-20', note: 'Dâng hương sân Chánh điện' });
  assert.equal(r1.gained, 20);
  assert.equal(r1.totalPoints, 20);
  assert.equal(r1.crossedMilestone, null);
  assert.equal(r1.reachedGoalNow, false);
  assert.equal(r1.bonusLotus, 0);
  state = r1.state;

  // 2. Reading (+25) -> 45/100 -> crosses 25 (Khởi Tâm)
  const r2 = recordVirtueActivity(state, 'reading', { dateKey: '2026-11-20', note: 'Đọc Bát Nhã Tâm Kinh' });
  assert.equal(r2.gained, 25);
  assert.equal(r2.totalPoints, 45);
  assert.equal(r2.crossedMilestone?.key, 'khoi_tam');
  assert.equal(getVirtueStageLabel(r2.totalPoints), 'Khởi Tâm');
  state = r2.state;

  // 3. Incense x2 more -> hits maxPerDay (3)
  state = recordVirtueActivity(state, 'incense', { dateKey: '2026-11-20' }).state; // 65
  const r4 = recordVirtueActivity(state, 'incense', { dateKey: '2026-11-20' }); // 85
  assert.equal(r4.totalPoints, 85);
  assert.equal(r4.crossedMilestone?.key, 'an_lac');
  state = r4.state;

  // 4th incense on same day is capped (0 gained)
  const rCap = recordVirtueActivity(state, 'incense', { dateKey: '2026-11-20' });
  assert.equal(rCap.capped, true);
  assert.equal(rCap.gained, 0);
  assert.equal(rCap.totalPoints, 85);
  state = rCap.state;

  // 4. Bow (+15) -> 100/100 -> crosses Viên Mãn & claims daily bonus once
  const rGoal = recordVirtueActivity(state, 'bow', { dateKey: '2026-11-20' });
  assert.equal(rGoal.totalPoints, 100);
  assert.equal(rGoal.reachedGoalNow, true);
  assert.equal(rGoal.bonusLotus, DAILY_VIRTUE_BONUS_LOTUS);
  assert.equal(rGoal.crossedMilestone?.key, 'vien_man');
  assert.equal(rGoal.state.streakDays, 1);
  assert.equal(rGoal.state.totalDaysCompleted, 1);
  state = rGoal.state;

  // 5. Additional activity same day still adds points but bonus is idempotent (0)
  const rExtra = recordVirtueActivity(state, 'lotus', { dateKey: '2026-11-20' });
  assert.equal(rExtra.gained, VIRTUE_ACTIONS.lotus.points);
  assert.equal(rExtra.reachedGoalNow, false);
  assert.equal(rExtra.bonusLotus, 0);
  assert.equal(rExtra.state.totalDaysCompleted, 1);

  const summary = getVirtueMeterSummary(rExtra.state, '2026-11-20');
  assert.equal(summary.completed, true);
  assert.equal(summary.percent, 100);
  assert.equal(summary.stageLabel, 'Viên Mãn');
  assert.equal(summary.milestones.length, VIRTUE_MILESTONES.length);
  assert.ok(summary.milestones.every((m) => m.reached));
});

test('resolveMultiPassCollision cleanly depenetrates overlapped start and slides along walls', () => {
  const obstacle = { minX: -2, maxX: 2, minZ: -2, maxZ: 2 };
  // Player starts overlapped inside obstacle; must depenetrate out instead of freezing
  const escaped = resolveMultiPassCollision(0.5, 1.8, 0.5, 2.2, {
    radius: 0.65,
    bounds: { minX: -50, maxX: 50, minZ: -50, maxZ: 50 },
    rects: [obstacle],
    circles: []
  });
  assert.ok(escaped.z >= 2.65, `Expected clean depenetration past maxZ+radius, got z=${escaped.z}`);

  // Diagonal motion into wall slides cleanly along the open axis
  const slid = resolveMultiPassCollision(0, 2.75, 0.4, 2.35, {
    radius: 0.65,
    bounds: { minX: -50, maxX: 50, minZ: -50, maxZ: 50 },
    rects: [obstacle],
    circles: []
  });
  assert.ok(slid.x > 0.1, `Expected smooth X wall slide, got x=${slid.x}`);
  assert.ok(slid.z >= 2.64, `Expected Z to stay outside wall, got z=${slid.z}`);
});

test('getTerrainGroundHeight raises smoothly for Nhà Lưu Niệm and Công Viên Văn Hóa Vĩnh Tràng', () => {
  assert.equal(getTerrainGroundHeight(42.2, -26.8, false), 0.23);
  assert.equal(getTerrainGroundHeight(42.2, -35.0, false), 0.23);
  const midRamp = getTerrainGroundHeight(42.2, -24.45, false);
  assert.ok(midRamp > 0.05 && midRamp < 0.22, `Expected smooth ramp elevation, got ${midRamp}`);
  assert.equal(getTerrainGroundHeight(0, 110, false), 0.06);
  assert.equal(getTerrainGroundHeight(42.2, -26.8, true), 0);
});

test('WORLD_BOUNDS covers Công Viên Văn Hóa Vĩnh Tràng south walkway and station standPos clear known colliders', () => {
  assert.ok(WORLD_BOUNDS.maxZ >= 170, `WORLD_BOUNDS.maxZ should allow walking to park south walkway, got ${WORLD_BOUNDS.maxZ}`);

  const shop = PILGRIMAGE_STATIONS.find((s) => s.key === 'cua_hang_luu_niem');
  const adida = PILGRIMAGE_STATIONS.find((s) => s.key === 'phat_adida');
  const dilac = PILGRIMAGE_STATIONS.find((s) => s.key === 'phat_di_lac');
  const nietban = PILGRIMAGE_STATIONS.find((s) => s.key === 'phat_niet_ban');

  assert.ok(shop && shop.standPos.z >= -28.0, `cua_hang_luu_niem standPos must clear center gondola (z>-29.1), got z=${shop?.standPos?.z}`);
  assert.ok(adida && adida.standPos.z >= -11.8, `phat_adida standPos must clear altar, got z=${adida?.standPos?.z}`);
  assert.ok(dilac && dilac.standPos.z >= 25.5, `phat_di_lac standPos must clear altar (z>24.2), got z=${dilac?.standPos?.z}`);
  assert.ok(nietban && nietban.standPos.z >= -34.5, `phat_niet_ban standPos must clear altar (z>-35.8), got z=${nietban?.standPos?.z}`);
});
