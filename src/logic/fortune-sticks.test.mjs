import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FORTUNE_INTENTIONS,
  QUAN_AM_FORTUNE_STICKS,
  createFortuneHistoryState,
  drawFortuneStick,
  tossYinYangBlocks,
  recordFortuneReading,
  computeFirstPersonEyePose
} from './chua-online-logic.mjs';

test('QUAN_AM_FORTUNE_STICKS contains authentic Vietnamese readings with required fields', () => {
  assert.ok(FORTUNE_INTENTIONS.length >= 5);
  assert.ok(QUAN_AM_FORTUNE_STICKS.length >= 16);
  const seenNumbers = new Set();
  for (const stick of QUAN_AM_FORTUNE_STICKS) {
    assert.equal(typeof stick.number, 'number');
    assert.ok(!seenNumbers.has(stick.number), `Duplicate stick number ${stick.number}`);
    seenNumbers.add(stick.number);
    assert.ok(stick.rank.length > 0);
    assert.ok(stick.title.length > 0);
    assert.equal(stick.poem.length, 4);
    assert.ok(stick.summary.length > 10);
    assert.ok(stick.dharmaAdvice.length > 10);
  }
});

test('drawFortuneStick selects deterministically from RNG and falls back to binh_an', () => {
  const reading = drawFortuneStick('unknown_intent', () => 0);
  assert.equal(reading.intentionId, 'binh_an');
  assert.equal(reading.stick.number, QUAN_AM_FORTUNE_STICKS[0].number);
  assert.equal(reading.keoResult, null);

  const reading2 = drawFortuneStick('cong_viec', () => 0.9999);
  assert.equal(reading2.intentionId, 'cong_viec');
  assert.equal(reading2.stick.number, QUAN_AM_FORTUNE_STICKS[QUAN_AM_FORTUNE_STICKS.length - 1].number);
});

test('tossYinYangBlocks produces valid Keo Thuần, Keo Cười, and Keo Âm outcomes', () => {
  const approved = tossYinYangBlocks(() => 0.2);
  assert.equal(approved.code, 'thuan');
  assert.equal(approved.approved, true);

  const laugh = tossYinYangBlocks(() => 0.72);
  assert.equal(laugh.code, 'cuoi');
  assert.equal(laugh.approved, false);

  const dark = tossYinYangBlocks(() => 0.95);
  assert.equal(dark.code, 'am');
  assert.equal(dark.approved, false);
});

test('recordFortuneReading prepends and caps reading history at 20 entries', () => {
  let state = createFortuneHistoryState();
  for (let i = 0; i < 24; i++) {
    const r = {
      ...drawFortuneStick('binh_an', () => (i % QUAN_AM_FORTUNE_STICKS.length) / QUAN_AM_FORTUNE_STICKS.length),
      id: `xam_test_${i}`
    };
    state = recordFortuneReading(state, r);
  }
  assert.equal(state.totalDraws, 24);
  assert.equal(state.readings.length, 20);
  assert.equal(state.lastReading.id, 'xam_test_23');
});

test('computeFirstPersonEyePose provides forward eye clearance and ergonomic pitch limits', () => {
  const idle = computeFirstPersonEyePose({
    x: 10,
    z: 20,
    charHeight: 1.66,
    yaw: 0,
    pitchRad: 0.06,
    stridePhase: 0,
    moveSpeed: 0
  });
  // Facing +Z with forward offset 0.16m
  assert.ok(idle.pos.z > 20.14 && idle.pos.z < 20.18);
  assert.ok(idle.look.y > idle.pos.y);

  const clampedDown = computeFirstPersonEyePose({
    x: 0,
    z: 0,
    yaw: 0,
    pitchRad: -1.5,
    stridePhase: Math.PI / 4,
    moveSpeed: 3.5
  });
  assert.equal(clampedDown.pitchRad, -0.56);
});
