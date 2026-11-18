/**
 * Trạng thái tâm linh, cột mốc UGC, hành động tu tập, tổng kết công đức.
 * (Tách từ chua-online-logic.mjs — import từ '/src/logic/chua-online-logic.mjs' vẫn dùng được.)
 */
import { PILGRIMAGE_STATIONS } from './world-data.mjs';

export function createSpiritualState(initial = {}) {
  return {
    bowCount: initial.bowCount || 0,
    incenseStep: initial.incenseStep || 0,
    incenseOfferings: initial.incenseOfferings || 0,
    lotusOfferings: initial.lotusOfferings || 0,
    malaBeads: initial.malaBeads || 0,
    malaCycles: initial.malaCycles || 0,
    bellRings: initial.bellRings || 0,
    leavesSwept: initial.leavesSwept || 0,
    visitedStations: Array.isArray(initial.visitedStations) ? [...initial.visitedStations] : [0],
    completedMilestones: Array.isArray(initial.completedMilestones) ? [...initial.completedMilestones] : [],
    lastUnlockedMilestone: initial.lastUnlockedMilestone || null,
    prayers: Array.isArray(initial.prayers) ? [...initial.prayers] : [],
    activeChant: initial.activeChant || 'Nam Mô A Di Đà Phật',
    equippedItems: {
      outfit: initial.equippedItems?.outfit || 'ao_trang_phat_tu',
      hat: initial.equippedItems?.hat || null,
      bag: initial.equippedItems?.bag || 'tui_vai_theu_sen',
      scarf: initial.equippedItems?.scarf || null,
      hand: initial.equippedItems?.hand || 'trang_hat_bo_de',
      altarItem: initial.equippedItems?.altarItem || null
    }
  };
}

export function checkUGCMilestoneUnlock(spiritual, completedLessonsCount = 0) {
  const s = createSpiritualState(spiritual);
  const reasons = [];
  if (s.bowCount >= 3) reasons.push('Đã đảnh lễ Tam Bảo (Tam Bái)');
  if (s.incenseOfferings >= 1) reasons.push('Đã dâng tâm hương tại Lư đồng');
  if (s.lotusOfferings >= 1) reasons.push('Đã dâng hoa sen thanh tịnh');
  if (s.malaCycles * 108 + s.malaBeads >= 3) reasons.push('Đã tịnh tâm lần chuỗi Niệm Phật');
  if (s.visitedStations.length >= 2) reasons.push(`Đã hành hương khám phá ${s.visitedStations.length} điểm trong chùa`);
  if (s.completedMilestones.length >= 1) reasons.push(...s.completedMilestones);
  if (completedLessonsCount >= 2) reasons.push('Đã hoàn thành bài học tại Giảng đường Phật pháp');

  const uniqueReasons = Array.from(new Set(reasons));
  const latest =
    s.lastUnlockedMilestone ||
    uniqueReasons[uniqueReasons.length - 1] ||
    'Lễ Phật, dâng hương, dâng hoa hoặc ghé thăm khuôn viên chùa để lưu ảnh kỷ niệm';
  return {
    unlocked: uniqueReasons.length > 0,
    milestoneCount: uniqueReasons.length,
    completedCount: uniqueReasons.length,
    totalCompleted: uniqueReasons.length,
    latestAchievement: latest,
    latestMilestone: latest,
    achievements: uniqueReasons
  };
}

export function recordSpiritualMilestone(state, milestoneLabel) {
  const next = createSpiritualState(state);
  const label = String(milestoneLabel || '').trim();
  if (label && !next.completedMilestones.includes(label)) {
    next.completedMilestones.push(label);
  }
  if (label) {
    next.lastUnlockedMilestone = label;
  }
  return next;
}

export function performSpiritualAction(state, actionType, payload = {}) {
  let next = createSpiritualState(state);
  switch (actionType) {
    case 'LE_PHAT': {
      next.bowCount += 3;
      next = recordSpiritualMilestone(next, 'Lễ Phật tại Chánh điện');
      return {
        state: next,
        animation: 'Vái',
        audioFile: 's3_lay_phat.mp3',
        milestoneUnlocked: true,
        milestoneTitle: 'Lễ Phật tại Chánh điện',
        title: 'Lễ Phật (Tam Bái)',
        message: 'Thành tâm đảnh lễ ba lạy trước Tam Bảo: Phật, Pháp, Tăng.'
      };
    }
    case 'DANG_HUONG_STEP': {
      next.incenseStep = next.incenseStep >= 4 ? 1 : next.incenseStep + 1;
      const stepMessages = {
        1: 'Bước 1/4 — Xin ba nén nhang thơm vừa đủ.',
        2: 'Bước 2/4 — Châm lửa và phẩy nhẹ bằng tay cho tắt ngọn lửa (không thổi bằng miệng).',
        3: 'Bước 3/4 — Nâng nhang ngang trán, thành tâm cầu bình an cho gia đình.',
        4: 'Bước 4/4 — Cắm nhang ngay ngắn vào lư hương đồng trước sân Chánh điện.'
      };
      if (next.incenseStep === 4) {
        next.incenseOfferings += 1;
        next = recordSpiritualMilestone(next, 'Dâng hương tại sân Chánh điện');
      }
      return {
        state: next,
        animation: next.incenseStep === 4 ? 'Thắp nhang' : 'Chắp tay',
        audioFile: 's2_thap_nhang.mp3',
        milestoneUnlocked: next.incenseStep === 4,
        milestoneTitle: 'Dâng hương tại sân Chánh điện',
        title: `Dâng hương (${next.incenseStep}/4)`,
        message: stepMessages[next.incenseStep]
      };
    }
    case 'DANG_HUONG_COMPLETE': {
      next.incenseStep = 4;
      next.incenseOfferings += 1;
      next = recordSpiritualMilestone(next, 'Dâng hương tại sân Chánh điện');
      return {
        state: next,
        animation: 'Thắp nhang',
        audioFile: 's2_thap_nhang.mp3',
        milestoneUnlocked: true,
        milestoneTitle: 'Dâng hương tại sân Chánh điện',
        title: 'Đã dâng ba nén hương',
        message: 'Ba nén nhang đã được cắm ngay ngắn vào lư hương đồng trước Chánh điện.'
      };
    }
    case 'DANG_HOA': {
      next.lotusOfferings += 1;
      next.equippedItems.hand = 'hoa_sen_trang_nghiem';
      next = recordSpiritualMilestone(next, 'Dâng hoa sen trước Phật đài');
      return {
        state: next,
        animation: 'Chắp tay',
        audioFile: 'merit_box.mp3',
        milestoneUnlocked: true,
        milestoneTitle: 'Dâng hoa sen trước Phật đài',
        title: 'Dâng hoa sen',
        message: 'Một cành sen hồng vừa được đặt trang nghiêm trước Phật đài.'
      };
    }
    case 'NIEM_PHAT_BEAD': {
      const increment = Math.max(1, Number(payload.count || 1));
      const total = next.malaBeads + increment;
      next.malaCycles += Math.floor(total / 108);
      next.malaBeads = total % 108;
      if (payload.chant) next.activeChant = payload.chant;
      next = recordSpiritualMilestone(next, `Niệm Phật (${next.activeChant})`);
      return {
        state: next,
        animation: 'Chắp tay',
        audioFile: 'niem_phat_xa.mp3',
        milestoneUnlocked: true,
        milestoneTitle: `Niệm Phật (${next.activeChant})`,
        title: `${next.activeChant} (${next.malaBeads}/108)`,
        message:
          total >= 108
            ? `Đã trọn ${next.malaCycles} vòng chuỗi 108 hạt.`
            : `Lần nhẹ từng hạt chuỗi theo nhịp thở (${next.malaBeads}/108 hạt).`
      };
    }
    case 'RING_BELL': {
      next.bellRings += 1;
      next = recordSpiritualMilestone(next, 'Thỉnh chuông chùa');
      return {
        state: next,
        animation: 'Chắp tay',
        audioFile: 's6_dan.mp3',
        milestoneUnlocked: true,
        milestoneTitle: 'Thỉnh chuông chùa',
        title: 'Thỉnh chuông',
        message: 'Tiếng chuông ngân vang chậm rãi giúp lòng lắng dịu.'
      };
    }
    case 'SWEEP_LEAVES': {
      next.leavesSwept += 1;
      next = recordSpiritualMilestone(next, 'Quét lá sân chùa');
      return {
        state: next,
        animation: 'Di bo',
        audioFile: 'day_di.mp3',
        milestoneUnlocked: true,
        milestoneTitle: 'Quét lá sân chùa',
        title: 'Quét lá sân chùa',
        message: 'Sân gạch sạch lá vàng, lòng cũng thấy thảnh thơi hơn.'
      };
    }
    case 'EQUIP_ITEM': {
      const { slot, itemKey } = payload;
      if (slot && Object.prototype.hasOwnProperty.call(next.equippedItems, slot)) {
        next.equippedItems[slot] = next.equippedItems[slot] === itemKey ? null : itemKey;
      }
      return {
        state: next,
        animation: 'Dung',
        title: 'Đã thay trang phục',
        message: 'Trang phục của nhân vật đã được cập nhật.'
      };
    }
    default:
      return { state: next, animation: 'Dung', title: '', message: '' };
  }
}

/**
 * Dấu Ấn Hành Trình (9 cánh hoa sen thanh tịnh ứng với 9 điểm hành hương trong chùa)
 * Không dùng thanh EXP, level, điểm số hay danh hiệu cạnh tranh.
 */
export function calculateJourneyImprint(spiritual) {
  const s = createSpiritualState(spiritual);
  const visitedSet = new Set(Array.isArray(s.visitedStations) ? s.visitedStations : [5]);
  const petals = PILGRIMAGE_STATIONS.map((st) => ({
    id: st.id,
    key: st.key,
    name: st.name,
    pinLabel: st.pinLabel,
    zoneCode: st.zoneCode,
    subtitle: st.subtitle,
    lit: visitedSet.has(st.id)
  }));
  const litCount = petals.filter((p) => p.lit).length;
  return {
    petals,
    litCount,
    totalPetals: PILGRIMAGE_STATIONS.length
  };
}

/**
 * Tổng hợp Công đức thực hành (số lần Lễ Phật, Dâng hương, Dâng hoa)
 */
export function calculateMeritSummary(spiritual) {
  const s = createSpiritualState(spiritual);
  const bowActs = Math.floor(s.bowCount / 3);
  const incenseActs = s.incenseOfferings;
  const flowerActs = s.lotusOfferings;
  return {
    bowActs,
    bowCount: s.bowCount,
    incenseActs,
    flowerActs,
    totalActs: bowActs + incenseActs + flowerActs
  };
}
