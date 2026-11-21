/**
 * Pure domain logic for Phase 1 World Atmosphere, First-Person Camera,
 * 3-Zone Spatial Audio, Mekong Weather System, and Real-Photo Gate Street Encounters.
 *
 * Kept framework-agnostic so it can be unit tested directly via node:test.
 */

export const WEATHER_PRESETS = Object.freeze({
  clear: {
    key: 'clear',
    label: 'Nắng đẹp',
    icon: '🌤️',
    subtitle: 'Trời Mỹ Tho trong xanh, nắng nhẹ xuyên qua tán dừa và sân đá cổ tự.',
    targetRain: 0,
    targetOvercast: 0,
    targetWetness: 0
  },
  overcast: {
    key: 'overcast',
    label: 'Chuyển mưa',
    icon: '⛅',
    subtitle: 'Mây giông kéo về ven sông Tiền, gió sân chùa mát rượi trước cơn mưa rào.',
    targetRain: 0.15,
    targetOvercast: 0.65,
    targetWetness: 0.25
  },
  rain: {
    key: 'rain',
    label: 'Mưa rào miền Tây',
    icon: '🌦️',
    subtitle: 'Cơn mưa rào bất chợt phủ mát sân đá Chùa Vĩnh Tràng, mặt sân ánh nước và khách hành hương bung dù.',
    targetRain: 1,
    targetOvercast: 1,
    targetWetness: 1
  }
});

export const CAMERA_VIEW_MODES = Object.freeze({
  third: {
    key: 'third',
    label: 'Góc nhìn thứ ba',
    shortLabel: 'Thứ 3',
    icon: '👤'
  },
  first: {
    key: 'first',
    label: 'Góc nhìn thứ nhất',
    shortLabel: 'Thứ 1',
    icon: '👁️'
  }
});

/**
 * Real-photo Cổng Phụ ("Tịnh Độ Huyền Môn" — image_bb72a8b0.png) street life encounters.
 * Placed cleanly beside the East pier outside the 6.4m walkable archway.
 */
export const STREET_ENCOUNTERS = Object.freeze([
  {
    id: 'xe_ca_rem',
    kind: 'street_encounter',
    icon: '🍦',
    title: 'Xe Cà Rem Mỹ Tho',
    promptLabel: '🍦 [E] Ghé Xe Cà Rem Mỹ Tho',
    pos: { x: 46.2, z: 44.6 },
    interactRadius: 3.6,
    speaker: 'Chú Năm bán cà rem cổng chùa',
    greeting: 'Cà rem dừa, cà rem đậu xanh mát lạnh đây cô bác ơi! Nắng Mỹ Tho đi bộ vãn cảnh chùa ghé làm một cây cho mát lòng nghen!',
    story:
      'Trước cổng phụ Tịnh Độ Huyền Môn của Chùa Vĩnh Tràng, hình ảnh chiếc xe cà rem đẩy tay sơn màu nổi bật với tiếng chuông leng keng đã gắn bó cùng biết bao thế hệ du khách và người dân Mỹ Tho mỗi dịp lễ rằm.',
    actionLabel: 'Thưởng thức cây cà rem dừa mát lạnh',
    actionToastTitle: '🍦 Mát lạnh hương vị Cà Rem Mỹ Tho',
    actionToastDesc: 'Vị béo ngọt của nước cốt dừa Tiền Giang tan nhẹ trong nắng sớm trước Cổng Phụ Tịnh Độ Huyền Môn.'
  },
  {
    id: 'co_ban_non_la',
    kind: 'street_encounter',
    icon: '👒',
    title: 'Cô Bán Nón Lá Ven Cổng',
    promptLabel: '👒 [E] Ghé Cô Bán Nón Lá',
    pos: { x: 45.2, z: 46.8 },
    interactRadius: 3.6,
    speaker: 'Cô Tư bán nón lá Mỹ Tho',
    greeting: 'Nón lá chằm tay nhẹ hều, che nắng che mưa rào đều tiện lắm con ơi. Con đội thử một chiếc đi dạo sân chùa cho mát ha!',
    story:
      'Ngay dưới bóng cây trước Cổng Phụ Chùa Vĩnh Tràng, các cô bán nón lá cầm xấp nón mới tinh thơm mùi lá cọ, sẵn sàng chào đón khách phương xa đến chiêm bái cổ tự giữa nắng gió miền Tây.',
    actionLabel: 'Đội thử Nón Lá đi vãn cảnh chùa',
    actionToastTitle: '👒 Đã đội Nón Lá Nam Bộ',
    actionToastDesc: 'Chiếc nón lá mộc mạc che mát suốt hành trình vãn cảnh vườn tượng Phật và Hồ Sen Chùa Vĩnh Tràng.',
    equipsHat: true
  }
]);

/**
 * Classifies player spatial audio zone cleanly into 3 authentic zones:
 * - 'interior': inside Chánh điện / Lecture hall
 * - 'street': outside the temple gate line (z > 42.2) on Đường vào chùa / Công viên Vĩnh Tràng
 * - 'courtyard': inside the sacred temple courtyard & statue gardens (z <= 42.2)
 *
 * @param {{ x?: number, z?: number, inInterior?: boolean }} params
 * @returns {'street' | 'courtyard' | 'interior'}
 */
export function resolveSpatialAudioZone({ x = 40.5, z = 43.8, inInterior = false } = {}) {
  if (inInterior) return 'interior';
  const pz = Number(z);
  const px = Number(x);
  if (!Number.isFinite(pz)) return 'courtyard';
  // Gate wall runs along z = 41.5; threshold at z > 42.2 gives clean hysteresis right outside Cổng Phụ & Cổng Tam Quan
  if (pz > 42.2) return 'street';
  // Far east residential lane outside temple east wall (x > 68)
  if (Number.isFinite(px) && px > 68) return 'street';
  return 'courtyard';
}

/**
 * Creates initial weather atmosphere state.
 * @param {'clear'|'overcast'|'rain'} [preset='clear']
 */
export function createWeatherAtmosphereState(preset = 'clear') {
  const cfg = WEATHER_PRESETS[preset] || WEATHER_PRESETS.clear;
  return {
    preset: cfg.key,
    rainIntensity: cfg.targetRain,
    overcastFactor: cfg.targetOvercast,
    wetness: cfg.targetWetness,
    autoCycleEnabled: false,
    autoCycleTimer: 0
  };
}

/**
 * Pure exponential damping update for dynamic Mekong weather.
 * Ground dries noticeably slower than rain starts (realistic tropical puddles/damp stone).
 *
 * @param {object} state
 * @param {number} dt
 * @returns {object}
 */
export function stepWeatherAtmosphere(state, dt = 0.016) {
  const safeDt = Math.max(0, Math.min(0.25, Number(dt) || 0));
  const cur = state && typeof state === 'object' ? state : createWeatherAtmosphereState('clear');
  const cfg = WEATHER_PRESETS[cur.preset] || WEATHER_PRESETS.clear;

  const rainRate = cfg.targetRain > cur.rainIntensity ? 1.35 : 1.8;
  const overcastRate = 1.1;
  const wetRate = cfg.targetWetness > cur.wetness ? 0.55 : 0.22; // Stone dries slowly after rain stops

  const lerpToward = (val, target, rate) => {
    const t = 1 - Math.exp(-rate * safeDt);
    const next = val + (target - val) * t;
    return Math.abs(target - next) < 0.002 ? target : next;
  };

  let nextPreset = cur.preset;
  let nextTimer = (cur.autoCycleTimer || 0) + safeDt;
  if (cur.autoCycleEnabled) {
    // Gentle Mekong shower cycle: clear (120s) -> overcast (18s) -> rain (55s) -> clear
    const phaseDur = nextPreset === 'clear' ? 120 : nextPreset === 'overcast' ? 18 : 55;
    if (nextTimer >= phaseDur) {
      nextTimer = 0;
      nextPreset =
        nextPreset === 'clear' ? 'overcast' : nextPreset === 'overcast' ? 'rain' : 'clear';
    }
  }

  return {
    preset: nextPreset,
    rainIntensity: lerpToward(cur.rainIntensity || 0, cfg.targetRain, rainRate),
    overcastFactor: lerpToward(cur.overcastFactor || 0, cfg.targetOvercast, overcastRate),
    wetness: lerpToward(cur.wetness || 0, cfg.targetWetness, wetRate),
    autoCycleEnabled: Boolean(cur.autoCycleEnabled),
    autoCycleTimer: nextTimer
  };
}

/**
 * Computes wet-surface roughness & albedo darkening factor for PBR ground materials.
 *
 * @param {number} baseRoughness
 * @param {number} wetness 0..1
 * @param {{ minRoughness?: number, darkenStrength?: number }} [opts]
 */
export function computeWetMaterialParams(baseRoughness, wetness, opts = {}) {
  const w = Math.max(0, Math.min(1, Number(wetness) || 0));
  const baseR = Math.max(0.05, Math.min(1, Number(baseRoughness) || 0.85));
  const minR = Number.isFinite(opts.minRoughness) ? opts.minRoughness : 0.22;
  const darkenStrength = Number.isFinite(opts.darkenStrength) ? opts.darkenStrength : 0.24;
  return {
    roughness: baseR + (Math.min(baseR, minR) - baseR) * w,
    albedoScale: 1 - darkenStrength * w,
    envMapIntensity: 1 + 0.65 * w
  };
}

/**
 * Computes first-person eye camera position and look target.
 * Allows comfortable upward tilt up to +0.92 rad (~53 deg) to admire 20m–32m Buddha statues
 * and Cổng Tam Quan porcelain mosaics.
 *
 * @param {object} params
 */
export function computeFirstPersonEyePose({
  x = 0,
  z = 0,
  elevationY = 0,
  charHeight = 1.64,
  yaw = Math.PI,
  pitchRad = 0,
  stridePhase = 0,
  moveSpeed = 0
} = {}) {
  const clampedPitch = Math.max(-0.56, Math.min(0.92, Number(pitchRad) || 0));
  const speedBlend = Math.max(0, Math.min(1, (Number(moveSpeed) || 0) / 3.4));
  // Subtle, natural eye stabilization to avoid motion discomfort in interior corridors
  const walkBobY = Math.sin((Number(stridePhase) || 0) * 2) * 0.022 * speedBlend;
  const walkSwayX = Math.cos(Number(stridePhase) || 0) * 0.006 * speedBlend;

  const eyeY = (Number(elevationY) || 0) + Math.max(1.12, (Number(charHeight) || 1.64) * 0.94) + walkBobY;
  const sinY = Math.sin(yaw);
  const cosY = Math.cos(yaw);
  const rightX = -cosY;
  const rightZ = sinY;

  // Slightly forward of torso center so accessories/columns never intrude into lens
  const camX = x + sinY * 0.16 + rightX * walkSwayX;
  const camZ = z + cosY * 0.16 + rightZ * walkSwayX;

  const lookDist = 14.0;
  const cosP = Math.cos(clampedPitch);
  const sinP = Math.sin(clampedPitch);

  return {
    pos: { x: camX, y: eyeY, z: camZ },
    look: {
      x: camX + sinY * cosP * lookDist,
      y: eyeY + sinP * lookDist,
      z: camZ + cosY * cosP * lookDist
    },
    pitchRad: clampedPitch
  };
}

/**
 * Finds nearest interactive street encounter within its interaction radius.
 * @param {number} px
 * @param {number} pz
 */
export function findNearestStreetEncounter(px, pz) {
  let best = null;
  let bestDist = Infinity;
  for (const enc of STREET_ENCOUNTERS) {
    const d = Math.hypot(px - enc.pos.x, pz - enc.pos.z);
    if (d <= enc.interactRadius && d < bestDist) {
      bestDist = d;
      best = enc;
    }
  }
  return best;
}
