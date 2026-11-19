/**
 * Pure state & formatting helpers for the Temple Ambient Audio Manager
 * (soft looping distant chanting, periodic bronze temple bells, and courtyard/hall atmosphere).
 */

export const AMBIENT_SOUNDSCAPE_LAYERS = [
  {
    key: 'chanting',
    label: 'Niệm Phật từ xa',
    description: 'Tiếng niệm Phật nhẹ nhàng vọng từ Chánh điện',
    icon: '📿'
  },
  {
    key: 'bells',
    label: 'Chuông chùa & Gió',
    description: 'Tiếng Đại Hồng Chung ngân xa và chuông gió thanh tịnh',
    icon: '🔔'
  },
  {
    key: 'atmosphere',
    label: 'Không gian Sân / Điện',
    description: 'Gió vườn, nước hồ sen và độ tĩnh lặng bên trong điện thờ',
    icon: '🌿'
  }
];

export const DEFAULT_AMBIENT_SETTINGS = Object.freeze({
  enabled: true,
  chanting: true,
  bells: true,
  atmosphere: true
});

export function createAmbientSettingsState(saved = null) {
  const src = saved && typeof saved === 'object' ? saved : {};
  return {
    enabled: typeof src.enabled === 'boolean' ? src.enabled : DEFAULT_AMBIENT_SETTINGS.enabled,
    chanting: typeof src.chanting === 'boolean' ? src.chanting : DEFAULT_AMBIENT_SETTINGS.chanting,
    bells: typeof src.bells === 'boolean' ? src.bells : DEFAULT_AMBIENT_SETTINGS.bells,
    atmosphere:
      typeof src.atmosphere === 'boolean' ? src.atmosphere : DEFAULT_AMBIENT_SETTINGS.atmosphere
  };
}

export function toggleAmbientSettings(state, forceEnabled = null) {
  const cur = createAmbientSettingsState(state);
  const nextEnabled = typeof forceEnabled === 'boolean' ? forceEnabled : !cur.enabled;
  return {
    ...cur,
    enabled: nextEnabled
  };
}

export function toggleAmbientLayer(state, layerKey, forceValue = null) {
  const cur = createAmbientSettingsState(state);
  if (!['chanting', 'bells', 'atmosphere'].includes(layerKey)) {
    return cur;
  }
  const nextVal = typeof forceValue === 'boolean' ? forceValue : !cur[layerKey];
  const updated = {
    ...cur,
    [layerKey]: nextVal
  };
  if (nextVal && !updated.enabled) {
    updated.enabled = true;
  }
  if (!updated.chanting && !updated.bells && !updated.atmosphere) {
    updated.enabled = false;
  }
  return updated;
}

export function shouldDuckAmbientChanting({
  audioPlaying = false,
  ttsSpeaking = false,
  sutraAudioActive = false
} = {}) {
  return Boolean(audioPlaying || ttsSpeaking || sutraAudioActive);
}

export function formatAmbientToggleDisplay(state, { audioMuted = false } = {}) {
  const cur = createAmbientSettingsState(state);
  const hasAnyLayer = cur.chanting || cur.bells || cur.atmosphere;
  const isOn = Boolean(cur.enabled && hasAnyLayer && !audioMuted);

  let statusLabel = 'Đang tắt';
  if (audioMuted) {
    statusLabel = 'Đang tắt tiếng';
  } else if (isOn) {
    statusLabel = cur.chanting && cur.bells ? 'Niệm Phật · Chuông' : cur.chanting ? 'Niệm Phật xa' : cur.bells ? 'Chuông chùa' : 'Không gian chùa';
  }

  return {
    isOn,
    shortLabel: 'Nhạc chùa',
    statusLabel,
    ariaLabel: isOn
      ? `Âm thanh không gian chùa đang bật (${statusLabel}). Bấm để tắt.`
      : 'Âm thanh không gian chùa đang tắt. Bấm để bật.'
  };
}
