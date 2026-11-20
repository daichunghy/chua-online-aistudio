/**
 * Thế giới sống Chùa Vĩnh Tràng (Đợt 2 — Cảm hứng độ chân thực thế giới mở GTA 6):
 * 1. Nhịp sinh hoạt theo 4 Thời khóa công phu (Sáng công phu · Trưa thọ trai · Chiều vàng Mỹ Tho · Tối hoa đăng)
 * 2. Thói quen chim bồ câu tự nhiên (giật mình bay vòng cung khi đi nhanh, an nhiên khi Thiền hành, trú mưa khi trời đổ mưa)
 * 3. Hệ thống ghế đá ngồi nghỉ & ngắm cảnh điện ảnh (Diegetic Bench Rest)
 * 4. Tham số khí quyển điện ảnh (tia nắng xiên volumetric sunshafts, đom đóm / bụi nắng, đèn rọi di sản buổi chiều tối)
 */

export const TEMPLE_SCHEDULE_SLOTS = {
  morning: {
    key: 'morning',
    clockLabel: '06:30',
    title: 'Thời khóa Công phu sáng',
    shortLabel: 'Sáng',
    icon: '🌅',
    activitySummary: 'Sư thầy quét sân, mở cửa gỗ Chánh điện, tiếng Đại Hồng Chung ngân vang trong nắng sớm Mỹ Tho.',
    npcSpeedScale: 0.95,
    smokeScale: 1.25,
    sunshaftOpacity: 0.20,
    dustMode: 'sunmotes',
    dustOpacity: 0.42,
    monumentLightIntensity: 0.0,
    lanternGlow: 0.52
  },
  midday: {
    key: 'midday',
    clockLabel: '11:30',
    title: 'Giờ Thọ trai & Nghỉ trưa',
    shortLabel: 'Trưa',
    icon: '☀️',
    activitySummary: 'Nắng đứng trong xanh, sân chùa yên tĩnh nghe tiếng gió dừa, Phật tử dùng cơm chay thanh đạm.',
    npcSpeedScale: 0.82,
    smokeScale: 0.85,
    sunshaftOpacity: 0.05,
    dustMode: 'sunmotes',
    dustOpacity: 0.22,
    monumentLightIntensity: 0.0,
    lanternGlow: 0.16
  },
  sunset: {
    key: 'sunset',
    clockLabel: '17:00',
    title: 'Nắng chiều vàng Mỹ Tho',
    shortLabel: 'Chiều',
    icon: '🌇',
    activitySummary: 'Ánh hoàng hôn hắt đồng ấm lên 13 nhịp vòm Chánh điện và khảm sành sứ, đàn bồ câu lượn quanh vườn tượng.',
    npcSpeedScale: 1.0,
    smokeScale: 1.15,
    sunshaftOpacity: 0.30,
    dustMode: 'sunmotes',
    dustOpacity: 0.58,
    monumentLightIntensity: 1.6,
    lanternGlow: 0.92
  },
  evening: {
    key: 'evening',
    clockLabel: '19:00',
    title: 'Tịnh độ về đêm · Hoa đăng',
    shortLabel: 'Tối',
    icon: '🕯️',
    activitySummary: 'Đèn lồng lục giác đồng loạt bừng sáng ấm, hoa đăng lung linh trên mặt Hồ Sen dưới bầu trời sao thanh tịnh.',
    npcSpeedScale: 0.78,
    smokeScale: 1.05,
    sunshaftOpacity: 0.0,
    dustMode: 'fireflies',
    dustOpacity: 0.88,
    monumentLightIntensity: 3.4,
    lanternGlow: 1.65
  }
};

export const SCENIC_BENCHES = [
  {
    id: 'bench_cong_phu',
    name: 'Ghế đá bóng mát Cổng Phụ',
    x: 37.2,
    z: 37.0,
    seatYaw: Math.PI / 2,
    lookAt: { x: 42.0, y: 2.2, z: 36.5 },
    radius: 2.6,
    builtInWorld: false,
    quote: 'Ngồi nghỉ chân dưới tán cây xanh sau Cổng Phụ Tịnh Độ Huyền Môn, lắng nghe nhịp sống hiền hòa của Mỹ Tho.'
  },
  {
    id: 'bench_ho_sen',
    name: 'Ghế đá bờ Hồ Sen Cá Koi',
    x: 12.4,
    z: 33.0,
    seatYaw: -Math.PI / 2,
    lookAt: { x: 3.5, y: 1.1, z: 33.0 },
    radius: 2.7,
    builtInWorld: false,
    quote: 'Ngắm từng vòng sóng cá Koi và đóa sen hồng khẽ đung đưa trên mặt nước thanh tịnh.'
  },
  {
    id: 'bench_di_lac',
    name: 'Ghế đá vườn Tượng Phật Di Lặc',
    x: -17.2,
    z: 14.5,
    seatYaw: -Math.PI * 0.68,
    lookAt: { x: -26.5, y: 7.5, z: 4.0 },
    radius: 2.8,
    builtInWorld: false,
    quote: 'Tựa lưng ghế đá ngước nhìn nụ cười hoan hỷ bao dung của Đức Phật Di Lặc giữa nắng gió miền Tây.'
  },
  {
    id: 'bench_chanh_dien_trai',
    name: 'Ghế đá sân trước Chánh Điện',
    x: 14.2,
    z: 15.5,
    seatYaw: Math.PI / 2,
    lookAt: { x: 23.0, y: 3.2, z: 6.5 },
    radius: 2.6,
    builtInWorld: true,
    quote: 'Chiêm ngắm 13 nhịp vòm Pháp – Việt sơn vàng cổ kính và nghe hương trầm bay thoảng trong gió.'
  },
  {
    id: 'bench_loi_hoa_giay_1',
    name: 'Ghế đá lối hoa giấy vào chùa',
    x: 36.3,
    z: 18.0,
    seatYaw: Math.PI / 2,
    lookAt: { x: 42.5, y: 2.0, z: 18.0 },
    radius: 2.6,
    builtInWorld: true,
    quote: 'Dừng chân bên hàng hoa giấy rực nắng ngắm dòng Phật tử thong thả bước vào sân chùa.'
  },
  {
    id: 'bench_loi_hoa_giay_2',
    name: 'Ghế đá sân hông Chánh Điện',
    x: 36.3,
    z: 13.0,
    seatYaw: Math.PI / 2,
    lookAt: { x: 42.5, y: 2.0, z: 10.0 },
    radius: 2.6,
    builtInWorld: true,
    quote: 'Hít một hơi thật sâu, buông nhẹ mỏi mệt thường nhật giữa khoảng sân mát rượi bóng cổ thụ.'
  }
];

export function getTempleScheduleSlot(timeOfDay = 'morning') {
  return TEMPLE_SCHEDULE_SLOTS[timeOfDay] || TEMPLE_SCHEDULE_SLOTS.morning;
}

export function findNearestScenicBench(pos, maxDist = 2.6) {
  if (!pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.z)) return null;
  let best = null;
  let bestD = Infinity;
  for (let i = 0; i < SCENIC_BENCHES.length; i++) {
    const b = SCENIC_BENCHES[i];
    const limit = Math.min(maxDist, b.radius || maxDist);
    const d = Math.hypot(pos.x - b.x, pos.z - b.z);
    if (d <= limit && d < bestD) {
      bestD = d;
      best = b;
    }
  }
  return best ? { ...best, distance: bestD } : null;
}

/**
 * Tính toán tham số ánh sáng khí quyển siêu thực dựa trên thời khóa và lượng mưa.
 */
export function computeAtmosphericLightingParams(timeOfDay = 'morning', rainIntensity = 0) {
  const slot = getTempleScheduleSlot(timeOfDay);
  const rain = Math.max(0, Math.min(1, Number(rainIntensity) || 0));
  const sunVisibility = 1 - rain * 0.85;
  return {
    scheduleKey: slot.key,
    clockLabel: slot.clockLabel,
    title: slot.title,
    sunshaftOpacity: Number((slot.sunshaftOpacity * sunVisibility).toFixed(4)),
    dustMode: slot.dustMode,
    dustOpacity: Number((slot.dustOpacity * (slot.dustMode === 'fireflies' ? 1 - rain * 0.45 : sunVisibility)).toFixed(4)),
    monumentLightIntensity: Number((slot.monumentLightIntensity + rain * 0.45).toFixed(3)),
    lanternGlow: Number((slot.lanternGlow + rain * 0.28).toFixed(3)),
    waterClearcoat: Number((0.82 + rain * 0.16 + (slot.key === 'sunset' ? 0.10 : 0)).toFixed(3)),
    npcSpeedScale: Number((slot.npcSpeedScale * (1 - rain * 0.08)).toFixed(3))
  };
}

/**
 * Pure simulation step for realistic courtyard pigeon behavior:
 * - Fast player approach (speed >= 2.0 m/s within 4.0m) -> startled smooth arc takeoff & graceful circling landing.
 * - Mindful slow walk ("Thiền hành" / speed < 1.6 m/s) -> pigeons stay calm and gently peck nearby.
 * - Rain -> pigeons flutter gently to shelter altitude/offset and wait calmly.
 */
export function evaluatePigeonState(pigeon, player, dt = 0.016, isRaining = false, elapsed = 0) {
  const safeDt = Math.max(0, Math.min(0.1, Number(dt) || 0.016));
  const px = Number(player?.x) || 0;
  const pz = Number(player?.z) || 0;
  const pSpeed = Number(player?.speed) || 0;
  const isMindful = Boolean(player?.isMindful || pSpeed < 1.65);

  const curX = Number.isFinite(pigeon.x) ? pigeon.x : pigeon.baseX;
  const curY = Number.isFinite(pigeon.y) ? pigeon.y : 0;
  const curZ = Number.isFinite(pigeon.z) ? pigeon.z : pigeon.baseZ;
  const baseX = pigeon.baseX;
  const baseZ = pigeon.baseZ;
  const phase = pigeon.phase || 0;
  const distToPlayer = Math.hypot(px - curX, pz - curZ);

  // If raining, pigeons shelter gently near nearby tree/eave spot
  if (isRaining && !pigeon.flying) {
    const shelterX = baseX + Math.cos(phase) * 0.6;
    const shelterZ = baseZ + Math.sin(phase) * 0.6;
    return {
      x: curX + (shelterX - curX) * Math.min(1, safeDt * 2.0),
      y: Math.max(0, curY - safeDt * 2.0),
      z: curZ + (shelterZ - curZ) * Math.min(1, safeDt * 2.0),
      yaw: pigeon.yaw || 0,
      flying: false,
      flyTimer: 0,
      wingAngle: 0.08,
      mode: 'shelter'
    };
  }

  // Trigger takeoff ONLY if player approaches quickly (or steps virtually onto the pigeon < 1.25m)
  const shouldStartle =
    !pigeon.flying &&
    ((distToPlayer < 4.0 && !isMindful && pSpeed >= 2.0) || distToPlayer < 1.25);

  if (shouldStartle || pigeon.flying) {
    const flyTimer = (shouldStartle ? 0 : pigeon.flyTimer || 0) + safeDt;
    const flightDuration = 4.6;
    const t = Math.min(1, flyTimer / flightDuration);
    // Smooth parabolic height curve (rises briskly, glides, lands softly back to y = 0)
    const altitude = Math.sin(t * Math.PI) * (3.6 + (phase % 1.4));
    // Smooth circular flight arc returning seamlessly to baseX, baseZ (zero teleport!)
    const loopAngle = t * Math.PI * 2;
    const radius = 3.2 + (phase % 1.8);
    const orbitX = baseX + Math.sin(loopAngle + phase) * radius * Math.sin(t * Math.PI);
    const orbitZ = baseZ + (1 - Math.cos(loopAngle)) * radius * 0.65 * Math.cos(phase);
    const dx = orbitX - curX;
    const dz = orbitZ - curZ;
    const yaw = Math.hypot(dx, dz) > 0.002 ? Math.atan2(dx, dz) : pigeon.yaw || 0;
    const wingSpeed = t < 0.45 ? 26 : 18;
    const wingAmp = t < 0.75 ? 0.72 : 0.42;
    const wingAngle = Math.sin(elapsed * wingSpeed + phase) * wingAmp;

    if (t >= 1) {
      return {
        x: baseX,
        y: 0,
        z: baseZ,
        yaw,
        flying: false,
        flyTimer: 0,
        wingAngle: 0,
        mode: 'landed'
      };
    }
    return {
      x: orbitX,
      y: Math.max(0, altitude),
      z: orbitZ,
      yaw,
      flying: true,
      flyTimer,
      wingAngle,
      mode: 'flying'
    };
  }

  // Calm ground behavior: gentle pecking & hopping (curious if player is doing Thiền hành nearby!)
  const hop = Math.abs(Math.sin(elapsed * 3.1 + phase)) * 0.035;
  const calmYaw =
    distToPlayer < 5.5 && isMindful
      ? Math.atan2(px - curX, pz - curZ) * 0.35 + Math.sin(elapsed * 0.8 + phase) * 0.4
      : Math.sin(elapsed * 0.7 + phase) * 0.7;

  return {
    x: curX + (baseX - curX) * Math.min(1, safeDt * 1.2),
    y: hop,
    z: curZ + (baseZ - curZ) * Math.min(1, safeDt * 1.2),
    yaw: calmYaw,
    flying: false,
    flyTimer: 0,
    wingAngle: 0,
    mode: distToPlayer < 5.5 && isMindful ? 'calm_near_pilgrim' : 'pecking'
  };
}
