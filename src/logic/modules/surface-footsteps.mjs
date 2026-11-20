export const SURFACE_PROFILES = {
  grass: {
    id: 'grass',
    labelVi: 'Thảm cỏ vườn chùa',
    particleColors: [0x6e8f48, 0x84a85a, 0x567438],
    count: 4,
    spread: 0.14,
    speedUp: 0.55,
    speedOut: 0.34,
    gravity: 2.8,
    life: 0.42,
    size: 0.042,
    shape: 'blade',
    audioGain: 0.72,
  },
  tile: {
    id: 'tile',
    labelVi: 'Gạch sân chùa',
    particleColors: [0xd5c4a8, 0xc7b598, 0xe4d7c1],
    count: 3,
    spread: 0.12,
    speedUp: 0.34,
    speedOut: 0.38,
    gravity: 2.2,
    life: 0.36,
    size: 0.036,
    shape: 'puff',
    audioGain: 0.85,
  },
  wood: {
    id: 'wood',
    labelVi: 'Sàn gỗ Chánh Điện',
    particleColors: [0xc79a63, 0xa87943, 0xdfbc8a],
    count: 2,
    spread: 0.10,
    speedUp: 0.24,
    speedOut: 0.28,
    gravity: 1.9,
    life: 0.32,
    size: 0.032,
    shape: 'puff',
    audioGain: 0.78,
  },
  gravel: {
    id: 'gravel',
    labelVi: 'Đường đá sỏi vào chùa',
    particleColors: [0xb9a88c, 0x99876d, 0xcfbe9e],
    count: 5,
    spread: 0.16,
    speedUp: 0.62,
    speedOut: 0.48,
    gravity: 3.4,
    life: 0.46,
    size: 0.038,
    shape: 'pebble',
    audioGain: 0.92,
  },
};

export function detectGroundSurface(x, z, inInterior = false) {
  const px = Number.isFinite(x) ? x : 0;
  const pz = Number.isFinite(z) ? z : 0;

  if (inInterior) {
    // Grand Chánh Điện hall (west wing), Tổ Đường (north hall), Trai Đường (east hall) => polished wood
    if (px <= -15.2) return 'wood';
    if (pz <= -10.6 && px > -15.2 && px < 10.6) return 'wood';
    if (px >= 24.4) return 'wood';
    // Central Hồ Sen Bộ courtyard & tiled corridors
    return 'tile';
  }

  // Dusty 170m approach road outside the front apron (z > 54)
  if (pz > 54.0) {
    // Main approach driveway
    if (px >= 32.4 && px <= 48.6 && pz <= 216.0) return 'gravel';
    // Paved sidewalks flanking approach road
    if ((px >= 30.2 && px < 32.4) || (px > 48.6 && px <= 52.6)) return 'tile';

    // Công Viên Vĩnh Tràng (west of approach road, z in [54, 168])
    if (px >= -26.0 && px <= 31.2 && pz <= 168.0) {
      const onVerticalPath = Math.abs(px - 8.0) < 3.0;
      const onCrossPath =
        Math.abs(pz - 70.0) < 2.4 ||
        Math.abs(pz - 104.0) < 3.2 ||
        Math.abs(pz - 138.0) < 2.4;
      const inCentralPlaza = Math.hypot(px - 8.0, pz - 104.0) < 11.5;
      if (onVerticalPath || onCrossPath || inCentralPlaza) return 'tile';
      return 'grass';
    }
    return 'grass';
  }

  // Front entrance apron in front of Tam Quan
  if (pz > 41.5 && pz <= 54.0) {
    if (px >= -28.0 && px <= 52.0) return 'tile';
    return 'grass';
  }

  // Outside the main walled temple grounds
  if (px < -68.0 || px > 68.0 || pz < -92.5) {
    return 'grass';
  }

  // Main paved temple plazas & walkways inside courtyard
  const onChanhDienPlaza = px >= 16.5 && px <= 31.5 && pz >= 6.0 && pz <= 41.5;
  const onRightEntranceRoad = px >= 34.5 && px <= 48.8 && pz >= -42.0 && pz <= 41.5;
  const onEndTurnPlaza = px >= 33.0 && px <= 52.0 && pz >= -36.0 && pz <= -7.0;
  const onGiangDuongWalk = px >= 48.0 && px <= 60.0 && pz >= -21.5 && pz <= -14.5;
  const onFrontCourtyardBelt = px >= -18.0 && px <= 49.0 && pz >= 23.0 && pz <= 41.5;
  const onNirvanaWalk = px >= 18.0 && px <= 36.0 && pz >= -58.0 && pz <= -18.0;

  if (
    onChanhDienPlaza ||
    onRightEntranceRoad ||
    onEndTurnPlaza ||
    onGiangDuongWalk ||
    onFrontCourtyardBelt ||
    onNirvanaWalk
  ) {
    return 'tile';
  }

  // West garden & Di Lặc / A Di Đà lawn areas
  if (px < -12.0 && pz < 24.0) return 'grass';
  if (px >= -20.0 && px <= -1.0 && pz >= -38.0 && pz <= -11.0) return 'grass';
  if (pz < -58.0) return 'grass';

  // Default inner courtyard paving
  return 'tile';
}

export function getSurfaceFeedbackProfile(surface) {
  return SURFACE_PROFILES[surface] || SURFACE_PROFILES.tile;
}
