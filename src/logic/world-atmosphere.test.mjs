import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WEATHER_PRESETS,
  CAMERA_VIEW_MODES,
  STREET_ENCOUNTERS,
  resolveSpatialAudioZone,
  createWeatherAtmosphereState,
  stepWeatherAtmosphere,
  computeWetMaterialParams,
  computeFirstPersonEyePose,
  findNearestStreetEncounter
} from './modules/world-atmosphere.mjs';

test('resolveSpatialAudioZone separates street, courtyard, and interior accurately', () => {
  assert.equal(resolveSpatialAudioZone({ x: 40.5, z: 43.8, inInterior: false }), 'street');
  assert.equal(resolveSpatialAudioZone({ x: 40.5, z: 62.0, inInterior: false }), 'street');
  assert.equal(resolveSpatialAudioZone({ x: 40.5, z: 38.0, inInterior: false }), 'courtyard');
  assert.equal(resolveSpatialAudioZone({ x: 23.0, z: 16.0, inInterior: false }), 'courtyard');
  assert.equal(resolveSpatialAudioZone({ x: 15.0, z: 18.0, inInterior: true }), 'interior');
  assert.equal(resolveSpatialAudioZone({ x: 40.5, z: 50.0, inInterior: true }), 'interior');
});

test('stepWeatherAtmosphere smoothly transitions rain and dries ground slower than wetting', () => {
  let st = createWeatherAtmosphereState('clear');
  assert.equal(st.rainIntensity, 0);
  assert.equal(st.wetness, 0);

  st.preset = 'rain';
  for (let i = 0; i < 40; i++) st = stepWeatherAtmosphere(st, 0.1);
  assert.ok(st.rainIntensity > 0.9, `expected heavy rain, got ${st.rainIntensity}`);
  assert.ok(st.wetness > 0.8, `expected wet ground, got ${st.wetness}`);

  const wetAfterRain = st.wetness;
  st.preset = 'clear';
  const afterOneSecond = stepWeatherAtmosphere(st, 0.25);
  assert.ok(afterOneSecond.rainIntensity < st.rainIntensity, 'rain should subside immediately');
  assert.ok(
    afterOneSecond.wetness > wetAfterRain * 0.85,
    'wet stone should dry gradually after rain stops'
  );
});

test('computeWetMaterialParams reduces roughness and darkens albedo as wetness rises', () => {
  const dry = computeWetMaterialParams(0.88, 0);
  const wet = computeWetMaterialParams(0.88, 1);
  assert.equal(dry.roughness, 0.88);
  assert.equal(dry.albedoScale, 1);
  assert.ok(wet.roughness < 0.3, `wet roughness should become glossy, got ${wet.roughness}`);
  assert.ok(wet.albedoScale < 0.85, `wet albedo should darken, got ${wet.albedoScale}`);
  assert.ok(wet.envMapIntensity > dry.envMapIntensity);
});

test('computeFirstPersonEyePose clamps pitch and applies subtle walk bob', () => {
  const high = computeFirstPersonEyePose({
    x: 40.5,
    z: 43.8,
    charHeight: 1.64,
    yaw: Math.PI,
    pitchRad: 2.5,
    moveSpeed: 0
  });
  assert.equal(high.pitchRad, 0.92);
  assert.ok(high.look.y > high.pos.y + 8, 'looking up should aim high at 20m statues');

  const walking = computeFirstPersonEyePose({
    x: 10,
    z: 10,
    charHeight: 1.75,
    yaw: 0,
    pitchRad: 0,
    stridePhase: Math.PI * 0.25,
    moveSpeed: 3.5
  });
  const standing = computeFirstPersonEyePose({
    x: 10,
    z: 10,
    charHeight: 1.75,
    yaw: 0,
    pitchRad: 0,
    stridePhase: Math.PI * 0.25,
    moveSpeed: 0
  });
  assert.ok(Math.abs(walking.pos.y - standing.pos.y) > 0.02, 'walking should add gentle vertical head bob');
});

test('findNearestStreetEncounter matches Xe Cà Rem Mỹ Tho and Cô Bán Nón Lá outside Cổng Phụ', () => {
  assert.equal(WEATHER_PRESETS.rain.key, 'rain');
  assert.equal(CAMERA_VIEW_MODES.first.key, 'first');
  assert.equal(STREET_ENCOUNTERS.length, 2);

  const iceCream = findNearestStreetEncounter(45.5, 44.5);
  assert.equal(iceCream?.id, 'xe_ca_rem');

  const hatVendor = findNearestStreetEncounter(45.0, 47.0);
  assert.equal(hatVendor?.id, 'co_ban_non_la');

  const far = findNearestStreetEncounter(23.0, 12.0);
  assert.equal(far, null);
});
