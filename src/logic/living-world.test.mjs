import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TEMPLE_SCHEDULE_SLOTS,
  SCENIC_BENCHES,
  getTempleScheduleSlot,
  findNearestScenicBench,
  computeAtmosphericLightingParams,
  evaluatePigeonState
} from './modules/living-world.mjs';

test('TEMPLE_SCHEDULE_SLOTS defines all 4 authentic Buddhist temple schedule times including golden sunset', () => {
  assert.deepEqual(Object.keys(TEMPLE_SCHEDULE_SLOTS), ['morning', 'midday', 'sunset', 'evening']);
  const sunset = getTempleScheduleSlot('sunset');
  assert.equal(sunset.key, 'sunset');
  assert.equal(sunset.clockLabel, '17:00');
  assert.ok(sunset.sunshaftOpacity > 0.2);

  const evening = getTempleScheduleSlot('evening');
  assert.equal(evening.dustMode, 'fireflies');
  assert.ok(evening.monumentLightIntensity > 2.5);
});

test('computeAtmosphericLightingParams dims sunshafts during rain and raises lantern warmth', () => {
  const clearSunset = computeAtmosphericLightingParams('sunset', 0);
  const rainySunset = computeAtmosphericLightingParams('sunset', 1);
  assert.ok(clearSunset.sunshaftOpacity > rainySunset.sunshaftOpacity);
  assert.ok(rainySunset.lanternGlow > clearSunset.lanternGlow);
  assert.ok(rainySunset.waterClearcoat > clearSunset.waterClearcoat);

  const clearEvening = computeAtmosphericLightingParams('evening', 0);
  assert.equal(clearEvening.sunshaftOpacity, 0);
  assert.equal(clearEvening.dustMode, 'fireflies');
  assert.ok(clearEvening.dustOpacity > 0.7);
});

test('findNearestScenicBench locates benches near Cổng Phụ, Hồ Sen, and Di Lặc accurately', () => {
  assert.ok(SCENIC_BENCHES.length >= 6);
  const nearPond = findNearestScenicBench({ x: 12.2, z: 33.4 }, 3.0);
  assert.equal(nearPond?.id, 'bench_ho_sen');

  const nearGate = findNearestScenicBench({ x: 37.5, z: 37.2 }, 3.0);
  assert.equal(nearGate?.id, 'bench_cong_phu');

  const farAway = findNearestScenicBench({ x: -90, z: -90 }, 3.0);
  assert.equal(farAway, null);
});

test('evaluatePigeonState stays calm during slow Thiền hành and flies smoothly in an arc when startled fast', () => {
  const pigeon = { baseX: 20, baseZ: 23, x: 20, y: 0, z: 23, phase: 0.5, flying: false, flyTimer: 0 };

  // Slow mindful walk nearby: pigeon stays calm on the ground
  const calm = evaluatePigeonState(pigeon, { x: 21.8, z: 23.0, speed: 1.1, isMindful: true }, 0.05, false, 1.0);
  assert.equal(calm.flying, false);
  assert.equal(calm.mode, 'calm_near_pilgrim');

  // Fast run nearby: pigeon startles and takes off smoothly
  const startled = evaluatePigeonState(pigeon, { x: 21.8, z: 23.0, speed: 4.2, isMindful: false }, 0.1, false, 1.0);
  assert.equal(startled.flying, true);
  assert.equal(startled.mode, 'flying');
  assert.ok(startled.y > 0);

  // Near end of flight duration: lands smoothly back at base spot
  const landed = evaluatePigeonState(
    { ...pigeon, flying: true, flyTimer: 4.58 },
    { x: 30, z: 30, speed: 0, isMindful: true },
    0.05,
    false,
    6.0
  );
  assert.equal(landed.flying, false);
  assert.equal(landed.y, 0);
  assert.equal(landed.mode, 'landed');

  // Rainy weather: shelters gently
  const sheltered = evaluatePigeonState(pigeon, { x: 30, z: 30, speed: 0 }, 0.05, true, 2.0);
  assert.equal(sheltered.mode, 'shelter');
  assert.equal(sheltered.flying, false);
});
