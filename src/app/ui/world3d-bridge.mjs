/**
 * Cầu nối app ↔ world 3D: khởi tạo, tương tác gần, lễ tượng, đi tới trạm.
 *
 * Mixin của ChuaOnlineApp: 18 method (initLive3DWorld … updateUGCMilestoneHUD).
 * Được gắn vào class trong chua-online-app.mjs qua applyMixins().
 */
import { PILGRIMAGE_STATIONS, findAnyTempleDestination, performSpiritualAction, recordSpiritualMilestone, checkUGCMilestoneUnlock, getLocalDateKey, ensureDailyMissionDate, grantPlayerXp, collectCourtyardTask, HERITAGE_RELICS, discoverHeritageRelic, BLESSING_TOWER_CATEGORIES, COURTYARD_NPC_DHARMA_QUOTES, pickNpcDharmaQuote, VinhTrang3DWorld } from './shared.mjs';

export const world3dBridgeMethods = {
  /* ========================================================================
     LIVE WALKABLE 3D WORLD INITIALIZATION (Default Viewport)
     ======================================================================== */
  initLive3DWorld() {
    const canvas = document.getElementById('world3d-canvas');
    if (!canvas) return;

    this.world3d = new VinhTrang3DWorld(canvas, {
      initialCharKey: this.characterModelKey,
      onStepSound: (surface) => {
        this.audio?.playFootstep?.(surface === 'interior' ? 'wood' : surface);
      },
      onAutoWalkTargetChange: (targetStation) => {
        this.autoWalkObjective = targetStation || null;
        const banner = document.getElementById('auto-walk-objective-banner');
        if (banner) {
          if (targetStation) {
            banner.style.display = 'inline-flex';
            banner.textContent = `Đang đi tới: ${targetStation.name}`;
          } else {
            banner.style.display = 'none';
          }
        }
      },
      onStationProximity: (station, dist) => {
        if (!station) return;
        this.activeStationKey = station.key;
        this.tryAutoDiscoverHeritageByStation(station.key, { silent: true });
        if (station.key === 'chanh_dien' && typeof dist === 'number' && dist < 12.5 && !this.world3d?.insideInterior) {
          this.playChanhDienBellCadence();
        }
      },
      onStallProximity: (stall) => {
        this.nearbyStallTrigger = stall || null;
        this.refreshProximityPrompt();
      },
      onInteractProximity: (prompt) => {
        this.nearbyInteractPrompt = prompt || null;
        this.refreshProximityPrompt();
      },
      onNpcSpeechUpdate: (speechPayload) => {
        this.updateNpcSpeechBubbleUI(speechPayload);
      },
      onEntranceTourChange: (active) => {
        this.entranceTourActive = Boolean(active);
        const banner = document.getElementById('entrance-tour-banner');
        if (banner) {
          banner.style.display = active ? 'inline-flex' : 'none';
        }
      },
      onStationArrive: (station) => {
        if (!station) return;
        this.activeStationKey = station.key;
        if (!this.spiritual.visitedStations.includes(station.id)) {
          this.spiritual.visitedStations.push(station.id);
        }
        this.spiritual = recordSpiritualMilestone(
          this.spiritual,
          `Ghé thăm ${station.name}`
        );
        this.tryAutoDiscoverHeritageByStation(station.key, { silent: false });
        this.saveState();
        this.updateActionBadges();
        this.highlightActiveWalkChip(station.key);
        this.playVoiceAudio(station.audio);
        if (station.key === 'chanh_dien') {
          this.playChanhDienBellCadence();
        }
        this.showToast(station.name, station.subtitle, 4000, false);
      },
      onUpdateProjectedPins: (projected) => {
        const pin = document.getElementById('pin-chanh-dien');
        const labelEl = document.getElementById('pin-chanh-dien-label');
        if (!pin) return;
        const p = Array.isArray(projected) && projected[0];
        if (!p || !p.visible || p.y < 105 || p.y > window.innerHeight - 130) {
          pin.style.display = 'none';
        } else {
          pin.style.display = 'inline-flex';
          pin.style.left = `${Math.round(p.x)}px`;
          pin.style.top = `${Math.round(p.y)}px`;
          if (labelEl) labelEl.textContent = p.label || 'Chánh điện';
        }
      },
      onLoaded: () => {
        this.syncStoreVisualsTo3D();
        this.syncTempleWorldGameplayState();
        this.syncPilgrimageCompanionsTo3D();
        this.syncHoaDangLanternsTo3D();
        this.syncBlessingTowerTo3D();
      },
      onTransitionFade: (active) => {
        const veil = document.getElementById('temple-transition-veil');
        if (this._veilTimer) {
          clearTimeout(this._veilTimer);
          this._veilTimer = null;
        }
        if (veil) {
          const isOn = Boolean(active);
          veil.classList.toggle('active', isOn);
          if (isOn) {
            this._veilTimer = setTimeout(() => {
              veil.classList.remove('active');
              this._veilTimer = null;
            }, 520);
          }
        }
      },
      onInteriorZoneChange: (zoneKey) => {
        this.highlightInteriorZoneChip(zoneKey);
        if (zoneKey === 'chanh_dien') {
          this.tryAutoDiscoverHeritageById('relic_long_tru', { silent: false });
          if (!this._shownShoeEtiquetteToast) {
            this._shownShoeEtiquetteToast = true;
            this.showToast(
              'Cửa Gỗ Bức Bàn · Đã Bỏ Dép Bên Ngoài',
              'Bước qua kệ để dép và ngưỡng cửa gỗ bức bàn phía trước để tiến vào Đại Hùng Bửu Điện lễ Phật.',
              3800,
              false
            );
          }
        } else if (zoneKey === 'hanh_lang_trai' || zoneKey === 'khu_tho') {
          this.tryAutoDiscoverHeritageById('relic_bat_bo_la_han', { silent: false });
          this.tryAutoDiscoverHeritageById('relic_to_dat_ma', { silent: false });
        }
      },
      onInteriorStateChange: (inside) => {
        const pinsLayer = document.getElementById('scene-pins-layer');
        const btn = document.getElementById('btn-toggle-interior-hall');
        const zoneBar = document.getElementById('interior-zone-bar');
        const goalsTracker = document.getElementById('daily-goals-tracker');
        this.audio?.setAmbientZone?.(inside ? 'interior' : 'exterior');
        if (pinsLayer) pinsLayer.style.display = inside ? 'none' : 'block';
        if (zoneBar) zoneBar.style.display = inside ? 'flex' : 'none';
        if (goalsTracker) goalsTracker.style.display = inside ? 'none' : 'block';
        if (inside) {
          this.nearbyStallTrigger = null;
          this.syncBlessingTowerTo3D();
          this.refreshProximityPrompt();
          if (btn) {
            btn.classList.add('active');
            btn.innerHTML = '← Ra Hiên Bỏ Dép';
          }
          this.highlightInteriorZoneChip(this.world3d?.getInteriorZoneKey() || 'day_ban_tho_phai');
          const cutBtn = document.getElementById('btn-interior-cutaway');
          if (cutBtn) cutBtn.classList.toggle('active', Boolean(this.world3d?.interiorCutaway));
          this.spiritual = recordSpiritualMilestone(this.spiritual, 'Vào bên trong Chùa Chính');
          this.tryAutoDiscoverHeritageById('relic_long_tru', { silent: true });
          this.saveState();
          this.updateActionBadges();
          this.playBellTone(216, 2.6);
          this.showToast(
            'Cửa Gỗ & Hiên Bỏ Dép · Hành Trình Hình Vuông',
            'Đã cất giày dép trên kệ ngoài hiên! Đi qua Tượng Phật Nghìn Mắt Nghìn Tay & Chỗ Ngủ Của Phật, dạo quanh Hồ Sen Bộ rồi qua cửa gỗ bức bàn vào Chính Điện.',
            5600,
            false
          );
        } else {
          const cutBtn = document.getElementById('btn-interior-cutaway');
          if (cutBtn) cutBtn.classList.remove('active');
          if (btn) {
            btn.classList.remove('active');
            btn.innerHTML = '🚪 Vào Chánh Điện';
          }
          this.refreshProximityPrompt();
          this.showToast(
            'Ra Hiên Bỏ Dép · Lối Mát Cuối Đường',
            'Bạn đã mang lại giày dép và bước ra sân mát cạnh Tiệm Tạp Hóa · Lưu Niệm cuối đường Tịnh Độ Huyền Môn.',
            3200
          );
        }
      },
      onObjectClick: (action, payload) => {
        if (action === 'ENTER_INTERIOR') {
          this.toggleInteriorHallIn3D(true);
        } else if (action === 'OPEN_BLESSING_TOWER') {
          this.openBlessingTowerModal();
        } else if (action === 'PRAY_NGHIN_MAT_NGHIN_TAY') {
          this.prayAtRightGalleryShrine('nghin_mat_nghin_tay');
        } else if (action === 'PRAY_CHO_NGU_CUA_PHAT') {
          this.prayAtRightGalleryShrine('cho_ngu_cua_phat');
        } else if (action === 'RING_CHUONG_CHANH_DIEN') {
          this.ringChanhDienBellInApp();
        } else if (action === 'STRIKE_TRONG_BAT_NHA') {
          this.strikeTrongBatNhaInApp();
        } else if (action === 'OPEN_ARHAT') {
          this.tryAutoDiscoverHeritageById('relic_bat_bo_la_han', { silent: true });
          this.openExploreModal('arhats', Number.isFinite(payload?.arhatIndex) ? payload.arhatIndex : 0);
        } else if (action === 'COLLECT_LEAF') {
          this.collectCourtyardLeafInApp(payload?.leafId);
        } else if (action === 'OPEN_GARDEN_PLOT') {
          this.openTempleGardenModal(Number.isFinite(payload?.slotIndex) ? payload.slotIndex : 0);
        } else if (action === 'OPEN_HOA_DANG') {
          this.openHoaDangModal();
        } else if (action === 'LE_PHAT') {
          this.triggerLePhat();
        } else if (action === 'DANG_HUONG') {
          this.triggerDangHuong();
        } else if (action === 'DANG_HOA') {
          this.triggerDangHoa();
        } else if (action === 'OPEN_SHOP') {
          this.openNineTabStoreModal(payload?.category || 'le_vat');
        } else if (action === 'OPEN_MARKET_STALL') {
          this.openMarketplaceStallModal(payload?.category || 'huong_hoa', payload?.title);
        } else if (action === 'OPEN_LOCAL_EATERY') {
          this.openLocalEateryModal(payload?.eateryId, payload?.title);
        } else if (action === 'CLOSED_MAIN_GATE') {
          this.playBellTone(260, 1.4);
          this.showToast(
            '⛩️ Cổng Chính Tam Quan đang đóng nghi lễ',
            'Mời bạn rẽ sang phải đi qua Cổng Phụ Tịnh Độ Huyền Môn đang mở rộng, ghé Nhà Tạp Hóa và theo lối hoa giấy vào Chánh điện.',
            4800,
            false
          );
        } else if (action === 'OPEN_LECTURE') {
          this.switchScreen('lecture');
        } else if (action === 'RING_BIG_BELL') {
          this.tryAutoDiscoverHeritageById('relic_dai_hong_chung', { silent: true });
          this.playBellTone(174, 4.2);
          setTimeout(() => this.playBellTone(174, 3.6), 950);
          this.spiritual = recordSpiritualMilestone(this.spiritual, 'Thỉnh Đại Hồng Chung tại Lầu Chuông');
          this.grantPilgrimXp(10, 'Thỉnh Đại Hồng Chung');
          this.saveState();
          this.updateActionBadges();
          this.openBellRhythmModal();
        } else if (action === 'TOAST' && payload) {
          this.spiritual = recordSpiritualMilestone(this.spiritual, payload.title || 'Chiêm bái khuôn viên chùa');
          const tLower = String(payload.title || '').toLowerCase();
          if (tLower.includes('quán thế âm') || tLower.includes('quan âm')) {
            this.tryAutoDiscoverHeritageById('relic_quan_am', { silent: true });
          } else if (tLower.includes('bảo tháp')) {
            this.tryAutoDiscoverHeritageById('relic_bao_thap', { silent: true });
          } else if (tLower.includes('tổ đạt ma') || tLower.includes('tổ đường')) {
            this.tryAutoDiscoverHeritageById('relic_to_dat_ma', { silent: true });
          }
          this.saveState();
          this.updateActionBadges();
          this.showToast(payload.title, payload.desc, 4800, true);
        }
      }
    });

    this.world3d.init();

    window.addEventListener('resize', () => {
      this.resizeFXCanvas();
    });
  },

  syncTempleWorldGameplayState() {
    if (!this.world3d?.setTempleStateSync) return;
    const todayKey = getLocalDateKey();
    this.activityHub = ensureDailyMissionDate(this.activityHub, todayKey);
    this.world3d.setTempleStateSync({
      collectedLeafIds: this.activityHub?.courtyardTasks?.collectedIds || [],
      gardenSlots: this.activityHub?.templeGarden || []
    });
  },

  updateNpcSpeechBubbleUI(payload) {
    const bubble = document.getElementById('npc-dharma-bubble');
    if (!bubble) return;

    if (!payload || !payload.active) {
      this.activeNpcSpeech = null;
      this.dismissedNpcId = null;
      if (bubble.style.display !== 'none') {
        bubble.style.display = 'none';
      }
      return;
    }

    if (this.dismissedNpcId === payload.npcId) {
      if (bubble.style.display !== 'none') {
        bubble.style.display = 'none';
      }
      return;
    }

    const needsNewQuote =
      payload.changed ||
      !this.activeNpcSpeech ||
      this.activeNpcSpeech.npcId !== payload.npcId;

    if (needsNewQuote) {
      const pool = this.dailyDharmaQuotes?.length
        ? this.dailyDharmaQuotes
        : COURTYARD_NPC_DHARMA_QUOTES;
      const quote = pickNpcDharmaQuote(pool, this.lastNpcQuoteId);
      this.lastNpcQuoteId = quote?.id || null;
      this.activeNpcSpeech = {
        npcId: payload.npcId,
        speaker: payload.speaker,
        quote
      };

      const roleEl = document.getElementById('npc-bubble-role');
      const quoteEl = document.getElementById('npc-bubble-quote');
      const sourceEl = document.getElementById('npc-bubble-source');
      if (roleEl) {
        roleEl.textContent = `${payload.speaker?.icon || '🪷'} ${payload.speaker?.label || 'Phật tử hành hương'}`;
      }
      if (quoteEl && quote) {
        quoteEl.textContent = `“${quote.quote}”`;
      }
      if (sourceEl && quote) {
        sourceEl.textContent = quote.source ? `— ${quote.source}` : '';
      }
    }

    if (!payload.visible) {
      bubble.style.display = 'none';
      return;
    }

    const marginX = Math.min(170, Math.max(120, window.innerWidth * 0.42));
    const clampedX = Math.max(marginX, Math.min(window.innerWidth - marginX, payload.screenX));
    const clampedY = Math.max(195, Math.min(window.innerHeight - 135, payload.screenY));
    bubble.style.display = 'block';
    bubble.style.left = `${Math.round(clampedX)}px`;
    bubble.style.top = `${Math.round(clampedY)}px`;
  },

  cycleNpcSpeechQuote() {
    if (!this.activeNpcSpeech) return;
    const pool = this.dailyDharmaQuotes?.length
      ? this.dailyDharmaQuotes
      : COURTYARD_NPC_DHARMA_QUOTES;
    const quote = pickNpcDharmaQuote(pool, this.lastNpcQuoteId);
    this.lastNpcQuoteId = quote?.id || null;
    this.activeNpcSpeech.quote = quote;
    const quoteEl = document.getElementById('npc-bubble-quote');
    const sourceEl = document.getElementById('npc-bubble-source');
    if (quoteEl && quote) quoteEl.textContent = `“${quote.quote}”`;
    if (sourceEl && quote) sourceEl.textContent = quote.source ? `— ${quote.source}` : '';
    this.playMokugyoTap?.();
  },

  dismissNpcSpeechBubble() {
    if (this.activeNpcSpeech?.npcId) {
      this.dismissedNpcId = this.activeNpcSpeech.npcId;
    }
    this.activeNpcSpeech = null;
    const bubble = document.getElementById('npc-dharma-bubble');
    if (bubble) bubble.style.display = 'none';
  },

  refreshProximityPrompt() {
    const btn = document.getElementById('stall-proximity-btn');
    const iconEl = document.getElementById('stall-proximity-icon');
    const labelEl = document.getElementById('stall-proximity-label');
    if (!btn || !labelEl) return;

    if (this.nearbyInteractPrompt) {
      const p = this.nearbyInteractPrompt;
      const cleanLabel = String(p.label || '')
        .replace(/^[^\p{L}\p{N}[]+/u, '')
        .replace(/\[E\]\s*/i, '')
        .trim();
      const iconMap = {
        leaf: '🍂',
        garden: '🌱',
        bell_rhythm: '🔔',
        koi_pond: '🐟',
        blessing_tower: '🏮',
        chanh_dien_bell: '🔔',
        trong_bat_nha: '🥁',
        nghin_mat_nghin_tay: '🙏',
        cho_ngu_cua_phat: '🪷'
      };
      if (iconEl) iconEl.textContent = iconMap[p.kind] || '✨';
      labelEl.textContent = cleanLabel || 'Tương tác';
      btn.style.display = 'inline-flex';
      return;
    }

    if (!this.world3d?.insideInterior && this.nearbyStallTrigger) {
      const shortTitle = String(this.nearbyStallTrigger.title || 'Nhà Tạp Hóa').split('·')[0].trim();
      if (iconEl) iconEl.textContent = '🛒';
      labelEl.textContent = `Ghé ${shortTitle}`;
      btn.style.display = 'inline-flex';
      return;
    }

    btn.style.display = 'none';
  },

  handleProximityInteract() {
    if (this.nearbyInteractPrompt) {
      const p = this.nearbyInteractPrompt;
      if (p.kind === 'nghin_mat_nghin_tay' || p.kind === 'cho_ngu_cua_phat') {
        this.prayAtRightGalleryShrine(p.kind);
        return true;
      }
      if (p.kind === 'blessing_tower') {
        this.openBlessingTowerModal();
        return true;
      }
      if (p.kind === 'chanh_dien_bell') {
        this.ringChanhDienBellInApp();
        return true;
      }
      if (p.kind === 'trong_bat_nha') {
        this.strikeTrongBatNhaInApp();
        return true;
      }
      if (p.kind === 'leaf' && p.leafId) {
        this.collectCourtyardLeafInApp(p.leafId);
        return true;
      }
      if (p.kind === 'garden') {
        this.openTempleGardenModal(Number.isFinite(p.slotIndex) ? p.slotIndex : 0);
        return true;
      }
      if (p.kind === 'bell_rhythm') {
        this.openBellRhythmModal();
        return true;
      }
      if (p.kind === 'koi_pond') {
        this.feedKoiPondInApp();
        return true;
      }
    }
    if (!this.world3d?.insideInterior && this.nearbyStallTrigger) {
      if (this.nearbyStallTrigger.stallType === 'local_eatery') {
        this.openLocalEateryModal(this.nearbyStallTrigger.eateryId, this.nearbyStallTrigger.title);
        return true;
      }
      this.openMarketplaceStallModal(
        this.nearbyStallTrigger.stallType || 'huong_hoa',
        this.nearbyStallTrigger.title || 'Nhà Tạp Hóa Cổng Chùa Vĩnh Tràng'
      );
      return true;
    }
    return false;
  },

  prayAtRightGalleryShrine(kind = 'nghin_mat_nghin_tay') {
    if (this.world3d?.insideInterior) {
      this.world3d.goToInteriorZone(kind);
      this.world3d.playPlayerBowAnimation?.();
    }
    this.playBellTone(243, 3.0);
    this.storeProfile.lotusPoints += 12;
    if (kind === 'cho_ngu_cua_phat') {
      this.spiritual = recordSpiritualMilestone(
        this.spiritual,
        'Chiêm bái Chỗ Ngủ Của Phật · Đức Phật Nhập Niết Bàn'
      );
      this.grantPilgrimXp(10, 'Chiêm bái Chỗ Ngủ Của Phật');
      this.saveState();
      this.updateActionBadges();
      this.showToast(
        '🪷 Chỗ Ngủ Của Phật · Đức Phật Nhập Niết Bàn (+12 🪷 · +10 XP)',
        'Khám thờ gỗ chạm thếp vàng tôn trí kim thân Đức Phật an nhiên thị hiện Cát Tường Ngoạ tại dải bàn thờ lối vào bên phải.',
        4800,
        true
      );
    } else {
      this.tryAutoDiscoverHeritageById('relic_quan_am', { silent: true });
      this.spiritual = recordSpiritualMilestone(
        this.spiritual,
        'Chiêm bái Tượng Phật Nghìn Mắt Nghìn Tay (Thiên Thủ Thiên Nhãn)'
      );
      this.grantPilgrimXp(10, 'Chiêm bái Phật Nghìn Mắt Nghìn Tay');
      this.saveState();
      this.updateActionBadges();
      this.showToast(
        '🙏 Đức Phật Nghìn Mắt Nghìn Tay · Thiên Thủ Thiên Nhãn (+12 🪷 · +10 XP)',
        'Ngàn mắt soi thấu nỗi khổ thế gian, ngàn tay từ bi cứu độ chúng sinh ngay lối bước vào góc dưới bên phải chùa.',
        4800,
        true
      );
    }
  },

  syncBlessingTowerTo3D() {
    if (!this.world3d?.syncBlessingTowerLamps) return;
    const enriched = (this.blessingTower?.entries || []).map((e) => ({
      ...e,
      colorHex: BLESSING_TOWER_CATEGORIES.find((c) => c.id === e.categoryId)?.accentHex || '#F3B43F'
    }));
    this.world3d.syncBlessingTowerLamps(enriched);
  },

  ringChanhDienBellInApp() {
    this.tryAutoDiscoverHeritageById('relic_dai_hong_chung', { silent: true });
    this.playBellTone(196, 3.6);
    setTimeout(() => this.playBellTone(243, 2.8), 680);
    this.storeProfile.lotusPoints += 12;
    this.spiritual = recordSpiritualMilestone(this.spiritual, 'Thỉnh Đại Hồng Chung & Chuông Gia Trì tại Chánh Điện');
    this.grantPilgrimXp(10, 'Thỉnh Chuông Chánh Điện');
    this.saveState();
    this.updateActionBadges();
    this.showToast(
      '🔔 Tiếng Chuông Chánh Điện Ngân Vang (+12 🪷 · +10 XP)',
      '“Nghe chuông phiền não tan mây khói, trí tuệ sinh sôi Bồ-đề lớn.” — Pháp Bảo Chuông Chùa Vĩnh Tràng (1854).',
      4200,
      false
    );
  },

  strikeTrongBatNhaInApp() {
    this.playMokugyoTap(true);
    setTimeout(() => this.playMokugyoTap(false), 240);
    setTimeout(() => this.playMokugyoTap(true), 520);
    setTimeout(() => this.playBellTone(174, 2.4), 860);
    this.storeProfile.lotusPoints += 12;
    this.spiritual = recordSpiritualMilestone(this.spiritual, 'Khởi hồi Trống Bát Nhã & Mõ Gỗ tại Chánh Điện');
    this.grantPilgrimXp(10, 'Khởi Hồi Trống Bát Nhã');
    this.saveState();
    this.updateActionBadges();
    this.showToast(
      '🥁 Khởi Hồi Trống Bát Nhã · Mõ Đại Tự (+12 🪷 · +10 XP)',
      'Hồi trống Bát Nhã đối xứng cùng Đại Hồng Chung khai mở trí tuệ và chánh niệm nơi Đại Hùng Bửu Điện.',
      4200,
      false
    );
  },

  grantPilgrimXp(amount, reasonLabel = '') {
    const res = grantPlayerXp(this.activityHub, amount);
    this.activityHub = res.activity;
    if (res.leveledUp) {
      this.playBellTone(360, 2.8);
      this.showToast(
        `${res.rankInfo.badge} Thăng bậc: ${res.rankInfo.title} (Cấp ${res.rankInfo.level})`,
        reasonLabel ? `Từ hoạt động "${reasonLabel}", cô bác đã đạt bậc hành hương mới!` : 'Chúc mừng cô bác tinh tấn tu học mỗi ngày!',
        4800,
        false
      );
    }
    return res;
  },

  tryAutoDiscoverHeritageById(relicId, { silent = false } = {}) {
    const res = discoverHeritageRelic(this.activityHub, this.storeProfile, relicId, getLocalDateKey());
    if (!res.ok || res.alreadyDiscovered) return res;
    this.activityHub = res.activity;
    this.storeProfile = res.storeProfile;
    this.saveState();
    this.updateActionBadges();
    if (!silent) {
      this.playBellTone(324, 2.0);
      this.showToast('📜 Đóng dấu Sổ Di Sản Vĩnh Tràng', res.message, 4200, false);
    }
    return res;
  },

  tryAutoDiscoverHeritageByStation(stationKey, { silent = true } = {}) {
    const matches = HERITAGE_RELICS.filter((r) => r.stationKey === stationKey);
    for (const r of matches) {
      if (r.id === 'relic_quan_am' || r.id === 'relic_long_tru' || r.id === 'relic_bat_bo_la_han') continue;
      this.tryAutoDiscoverHeritageById(r.id, { silent });
    }
  },

  collectCourtyardLeafInApp(leafId) {
    if (!leafId) return;
    const res = collectCourtyardTask(this.activityHub, this.storeProfile, leafId, getLocalDateKey());
    if (!res.ok) {
      this.showToast('Quét lá sân chùa', res.message, 2800, false);
      return;
    }
    this.activityHub = res.activity;
    this.storeProfile = res.storeProfile;
    this.spiritual = performSpiritualAction(this.spiritual, 'SWEEP_LEAVES').state;
    this.nearbyInteractPrompt = null;
    this.saveState();
    this.syncTempleWorldGameplayState();
    this.updateActionBadges();
    this.refreshProximityPrompt();
    this.playMokugyoTap();
    if (res.rewardGems > 0 || res.leveledUp) {
      this.playBellTone(360, 2.4);
    }
    this.showToast(
      `🍂 Đã quét lá (${res.collectedCount}/${res.totalSpots})`,
      res.message,
      3800,
      false
    );
  },

  feedKoiPondInApp() {
    this.world3d?.placeLotusOfferingIn3D?.();
    this.activityHub = ensureDailyMissionDate(this.activityHub, getLocalDateKey());
    this.activityHub.koiFedCount = (this.activityHub.koiFedCount || 0) + 1;
    this.storeProfile.lotusPoints += 12;
    this.spiritual = recordSpiritualMilestone(this.spiritual, 'Cho cá Koi ăn & Thả sen tại Hồ Sen');
    this.grantPilgrimXp(10, 'Cho cá Koi ăn');
    this.saveState();
    this.updateActionBadges();
    this.playBellTone(324, 2.2);
    this.showToast(
      '🐟 Đã rải thức ăn cho đàn cá Koi (+12 🪷 · +10 XP)',
      `Cô bác đã gieo duyên phóng sinh ${this.activityHub.koiFedCount} lần tại Hồ Sen Vĩnh Tràng.`,
      4200,
      true
    );
  },

  highlightActiveWalkChip(stationKey) {
    document.querySelectorAll('[data-walk-station]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-walk-station') === stationKey);
    });
  },

  teleportToStationIn3D(stationKey) {
    this.activeStationKey = stationKey;
    this.highlightActiveWalkChip(stationKey);
    const st = findAnyTempleDestination(stationKey) || PILGRIMAGE_STATIONS[5];
    if (!st.isDiscovery && typeof st.id === 'number' && !this.spiritual.visitedStations.includes(st.id)) {
      this.spiritual.visitedStations.push(st.id);
    }
    this.spiritual = recordSpiritualMilestone(this.spiritual, `Đến chiêm bái ${st.name}`);
    this.tryAutoDiscoverHeritageByStation(stationKey, { silent: false });
    this.saveState();
    this.updateActionBadges();
    if (this.world3d) {
      if (this.world3d.insideInterior) {
        this.toggleInteriorHallIn3D(false);
      }
      this.world3d.teleportToStation(stationKey);
      this.playerPos = {
        x: Number(this.world3d.playerPos.x.toFixed(2)),
        z: Number(this.world3d.playerPos.z.toFixed(2)),
        yaw: Number(this.world3d.playerYaw.toFixed(2)),
        moving: false
      };
    }
    if (st.audio) {
      this.playVoiceAudio(st.audio);
    } else {
      this.playBellTone(260, 2.0);
    }
    this.showToast(st.name, st.subtitle, 4000, false);
  },

  walkToStationIn3D(stationKey) {
    this.activeStationKey = stationKey;
    this.highlightActiveWalkChip(stationKey);
    const st = findAnyTempleDestination(stationKey) || PILGRIMAGE_STATIONS[5];

    if (!st.isDiscovery && typeof st.id === 'number' && !this.spiritual.visitedStations.includes(st.id)) {
      this.spiritual.visitedStations.push(st.id);
    }
    this.spiritual = recordSpiritualMilestone(this.spiritual, `Đến ${st.name}`);
    this.saveState();

    if (this.world3d) {
      const pinsLayer = document.getElementById('scene-pins-layer');
      if (pinsLayer) pinsLayer.style.display = 'block';
      this.world3d.walkToStation(stationKey);
      this.playerPos = {
        x: st.standPos?.x ?? st.pos.x,
        z: st.standPos?.z ?? st.pos.z,
        yaw: st.lookYaw ?? Math.PI,
        moving: true
      };
    }

    this.showToast(
      `Đang đi tới ${st.name}`,
      st.subtitle,
      3200,
      false
    );
  },

  toggleInteriorHallIn3D(forceEnter = null, onEntered = null) {
    if (!this.world3d) return;
    const entering = forceEnter !== null ? forceEnter : !this.world3d.insideInterior;
    if (entering) {
      this.world3d.enterInteriorHall(false, onEntered);
      this.playChanhDienBellCadence({ force: true });
      this.showToast(
        'Đi thẳng cuối đường Tịnh Độ Huyền Môn → Rẽ trái vào Hiên Bỏ Dép...',
        'Đi dọc đường rợp bóng cây tới Tiệm Tạp Hóa Lưu Niệm cuối đường, rẽ trái bỏ giày dép bên ngoài cửa gỗ rồi bước vào Chánh Điện.',
        3800,
        false
      );
    } else {
      this.world3d.exitInteriorHall(false);
    }
  },

  updateUGCMilestoneHUD() {
    const status = checkUGCMilestoneUnlock(this.spiritual, this.completedLessons.size);
    const hudBtn = document.getElementById('btn-ugc-milestone-hud');
    const iconEl = document.getElementById('ugc-hud-icon');
    const textEl = document.getElementById('ugc-hud-text');
    if (!hudBtn || !iconEl || !textEl) return;

    if (status.unlocked) {
      hudBtn.classList.remove('locked');
      hudBtn.classList.add('unlocked');
      iconEl.textContent = '📸';
      textEl.textContent = `Check-in UGC: ${status.latestMilestone}`;
    } else {
      hudBtn.classList.remove('unlocked');
      hudBtn.classList.add('locked');
      iconEl.textContent = '🔒';
      textEl.textContent = 'Check-in UGC (Hoàn thành 1 nghi lễ để mở)';
    }
  }
};
