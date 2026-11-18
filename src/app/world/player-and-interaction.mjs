/**
 * Hành động lễ bái, đồ trang bị, đồng bộ vị trí, gần trạm/quán, chạm để đi.
 *
 * Mixin của VinhTrang3DWorld: 11 method (triggerActionAnimation … handleResize).
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, PILGRIMAGE_STATIONS, DISCOVERY_ZONES, attachStorePropsToCharacterRig, CHAR_HEIGHTS } from './shared.mjs';

export const playerAndInteractionMethods = {
  triggerActionAnimation(clipName = 'Vái') {
    const mapName = {
      Vai: 'Vái',
      Vái: 'Vái',
      'Chap tay': 'Chắp tay',
      'Chắp tay': 'Chắp tay',
      'Thap nhang': 'Thắp nhang',
      'Thắp nhang': 'Thắp nhang',
      Quy: 'Quỳ',
      Quỳ: 'Quỳ',
      'Di bo': 'Di bo',
      'Đi bộ': 'Di bo',
      Dung: 'Dung'
    };
    const resolved = mapName[clipName] || 'Vái';
    this.playerState.pose = resolved;
    this.proceduralPoseState = {
      action: resolved === 'Di bo' || resolved === 'Dung' ? null : resolved,
      timer: 0,
      duration: resolved === 'Quỳ' ? 3.0 : 2.5
    };
    if (this.activePlayerRecord) {
      this.playClipCrossfade(this.activePlayerRecord, resolved, 0.22, true);
      clearTimeout(this._poseReturnTimer);
      this._poseReturnTimer = setTimeout(() => {
        if (!this.playerState.moving && this.activePlayerRecord) {
          this.playerState.pose = 'Dung';
          this.proceduralPoseState.action = null;
          this.playClipCrossfade(this.activePlayerRecord, 'Dung', 0.25, false);
        }
      }, 2800);
    }
  },

  addIncenseStickVisual() {
    const stick = new THREE.Group();
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.45, 6),
      new THREE.MeshStandardMaterial({ color: 0xA8241C })
    );
    stem.position.y = 0.22;
    stick.add(stem);
    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xFF5722 })
    );
    tip.position.y = 0.45;
    stick.add(tip);
    const count = this.incenseSticksGroup.children.length;
    stick.position.set(((count % 5) - 2) * 0.06, 0, Math.floor(count / 5) * 0.05);
    this.incenseSticksGroup.add(stick);
  },

  addLotusOfferingVisual() {
    const fl = this.makeLotusFlower3D(false, true);
    fl.scale.setScalar(1.85);
    const c = this.offeredLotusesGroup.children.length;
    fl.position.set(((c % 4) - 1.5) * 0.65, 0.06, (Math.floor(c / 4) - 1) * 0.65);
    if (this.pondLotusAnims.length > 0) {
      this.pondLotusAnims[this.pondLotusAnims.length - 1].baseScale = 1.85;
    }
    this.offeredLotusesGroup.add(fl);
  },

  syncRiggedPlayerWearables() {
    if (!this.activePlayerRecord?.root) return;
    const eq = this.lastEquippedState || {};
    const st = this.activeStorePreview || {};
    const merged = {
      ...st,
      hat: Boolean(st.hat ?? eq.hat),
      bag: st.bag ?? eq.bag ?? null,
      handProp: st.handProp ?? (eq.hand === 'hoa_sen_trang_nghiem' ? 'hoa_sen_trang_nghiem' : eq.hand || null),
      scarf: Boolean(st.scarf ?? eq.scarf),
      malaId: st.malaId ?? eq.malaId ?? null
    };
    const h = CHAR_HEIGHTS[this.playerState.charKey] || 1.64;
    if (this.equipmentGroup) {
      while (this.equipmentGroup.children.length > 0) {
        this.equipmentGroup.remove(this.equipmentGroup.children[0]);
      }
    }
    attachStorePropsToCharacterRig(THREE, this.activePlayerRecord, merged, {
      h,
      propMeshCache: this.propMeshCache,
      fitPropFn: (obj, sz) => this.fitProp(obj, sz),
      groundGroup: this.storePreviewGroup,
      isMoving: Boolean(this.playerState.moving),
      isKneeling: this.playerState.pose === 'Quỳ',
      previewMode: Boolean(this.activeStorePreview && Object.keys(this.activeStorePreview).length > 0)
    });
  },

  updateEquippedItems(equipped = {}) {
    this.lastEquippedState = equipped;
    this.syncRiggedPlayerWearables();
    this.renderFrame();
  },

  applyStoreVisualsToPlayer(storeVisual = {}) {
    this.activeStorePreview = storeVisual;
    this.syncRiggedPlayerWearables();
    this.renderFrame();
  },

  syncPlayerTransform() {
    this.playerContainer.position.set(
      this.playerState.x,
      this.playerElevationY || 0,
      this.playerState.z
    );
    this.playerContainer.rotation.y = this.playerState.yaw;

    if (this.entranceTour?.active || this.arrivalCutscene?.active) return;

    if (this.inInterior && this.interiorCutaway) {
      const cutAngle = Math.PI * 0.82 + this.cameraAzimuthOffset;
      const cutDist = Math.max(20.0, 35.5 + (this.cameraZoomOffset || 0));
      const cutHeight = Math.max(16.0, 26.5 + (this.cameraPitchOffset || 0));
      const focusX = this.playerState.x * 0.22;
      const focusZ = Math.max(-12.0, Math.min(12.0, this.playerState.z * 0.22));
      this.camera.position.set(
        focusX - Math.sin(cutAngle) * cutDist,
        cutHeight,
        focusZ - Math.cos(cutAngle) * cutDist
      );
      this.camera.lookAt(focusX, 1.8, focusZ - 1.5);
      const zKey = this.getInteriorZoneKey();
      if (zKey !== this._lastInteriorZone) {
        this._lastInteriorZone = zKey;
        this.onInteriorZoneChange(zKey);
      }
      return;
    }

    const isAdidaPlaza =
      !this.inInterior &&
      (this.currentStationId === 2 ||
        Math.hypot(this.playerState.x - 8.5, this.playerState.z - 25.0) < 9.5);
    const isMonumental =
      !this.inInterior &&
      ([2, 3, 8].includes(this.currentStationId) ||
        isAdidaPlaza ||
        Math.hypot(this.playerState.x - -24.5, this.playerState.z - 22.0) < 8.0 ||
        Math.hypot(this.playerState.x - -24.5, this.playerState.z - -10.5) < 8.5);

    const transitionPull = this.interiorTransition?.phase === 'climb_side_door' ? 2.1 : 0;
    const baseDist = this.inInterior
      ? 4.4
      : (isAdidaPlaza ? 11.2 : isMonumental ? 11.2 : 7.0) - transitionPull;
    const camDist = Math.max(2.6, Math.min(18.5, baseDist + (this.cameraZoomOffset || 0)));
    const camHeight = Math.max(
      1.2,
      (this.inInterior
        ? 2.15 + (this.playerElevationY || 0) * 0.9
        : (isAdidaPlaza ? 2.35 : isMonumental ? 2.15 : 2.1) + (this.playerElevationY || 0) * 0.7) +
        (this.cameraPitchOffset || 0) * 0.55
    );
    const lookY = Math.max(
      0.8,
      (this.inInterior
        ? 2.35 + (this.playerElevationY || 0) * 0.85
        : isAdidaPlaza
        ? 12.0
        : isMonumental
        ? 7.6
        : 3.65) -
        (this.cameraPitchOffset || 0) * 0.65
    );
    const lookAngle = this.cameraBaseYaw + this.cameraAzimuthOffset;
    const sideOffset = this.inInterior ? 0 : isMonumental ? 0.48 : 0.62;
    let cx =
      this.playerState.x - Math.sin(lookAngle) * camDist - Math.cos(lookAngle) * sideOffset;
    let cz =
      this.playerState.z - Math.cos(lookAngle) * camDist + Math.sin(lookAngle) * sideOffset;
    if (this.inInterior) {
      const px = this.playerState.x;
      const pz = this.playerState.z;
      const maxCamX = 24.1;
      cx = Math.max(-20.05, Math.min(maxCamX, cx));
      cz = Math.max(-20.05, Math.min(20.05, cz));
      // Keep camera inside the active gallery corridor so courtyard balustrades (±10.6) & lattice doors (-12.45) never occlude altars
      if (px > 10.9 && px <= 24.1 && Math.abs(pz) < 10.4 && cx < 11.15) {
        cx = 11.15;
      } else if (px > 10.9 && px <= 24.1 && pz >= 10.4 && cx < 11.15 && Math.sin(lookAngle) > 0.35) {
        cx = 11.15;
      } else if (px < -10.9 && cx > -11.15 && Math.sin(lookAngle) < -0.35) {
        cx = -11.15;
      }
      if (pz < -12.65 && Math.abs(px) < 10.2 && cz > -12.78) {
        cz = -12.78;
      } else if (pz > 10.9 && Math.abs(px) < 10.2 && cz < 11.15 && Math.cos(lookAngle) > 0.35) {
        cz = 11.15;
      }
    }
    this.camera.position.set(cx, camHeight, cz);
    this.camera.lookAt(
      this.playerState.x + Math.sin(lookAngle) * 12,
      lookY,
      this.playerState.z + Math.cos(lookAngle) * 12
    );
    if (this.inInterior) {
      const zKey = this.getInteriorZoneKey();
      if (zKey !== this._lastInteriorZone) {
        this._lastInteriorZone = zKey;
        this.onInteriorZoneChange(zKey);
      }
    }
  },

  checkStationProximity() {
    if (this.inInterior) {
      if (this.nearestStallTrigger) {
        this.nearestStallTrigger = null;
        this.onStallProximity(null);
      }
      const px = this.playerState.x;
      const pz = this.playerState.z;
      let intPrompt = null;
      if (Math.hypot(px - 20.2, pz - 2.0) <= 3.2) {
        intPrompt = {
          kind: 'nghin_mat_nghin_tay',
          label: '🙏 [E] Chiêm Bái Tượng Phật Nghìn Mắt Nghìn Tay'
        };
      } else if (Math.hypot(px - 20.1, pz - -6.5) <= 3.2) {
        intPrompt = {
          kind: 'cho_ngu_cua_phat',
          label: '🪷 [E] Chiêm Bái Chỗ Ngủ Của Phật · Phật Nhập Niết Bàn'
        };
      } else if (Math.hypot(px - -2.95, pz - -11.65) <= 3.6) {
        intPrompt = {
          kind: 'blessing_tower',
          label: '🏮 [E] Tháp Đèn Cầu An · Ghi Tên Cầu Phước'
        };
      } else if (
        Math.hypot(px - 6.8, pz - -14.4) <= 2.85 ||
        Math.hypot(px - 2.65, pz - -15.2) <= 2.45
      ) {
        intPrompt = {
          kind: 'chanh_dien_bell',
          label: '🔔 [E] Thỉnh Đại Hồng Chung · Chuông Gia Trì'
        };
      } else if (
        Math.hypot(px - 2.95, pz - -11.55) <= 3.1 ||
        Math.hypot(px - -2.65, pz - -15.2) <= 2.45
      ) {
        intPrompt = {
          kind: 'trong_bat_nha',
          label: '🥁 [E] Khởi Hồi Trống Bát Nhã · Gõ Mõ'
        };
      }
      const prevKey = this.nearestInteractPrompt ? this.nearestInteractPrompt.kind : '';
      const nextKey = intPrompt ? intPrompt.kind : '';
      if (prevKey !== nextKey) {
        this.nearestInteractPrompt = intPrompt;
        this.onInteractProximity(intPrompt);
      }
      return;
    }
    let best = PILGRIMAGE_STATIONS[0];
    let bestDist = Infinity;
    for (const st of PILGRIMAGE_STATIONS) {
      const tx = st.standPos ? st.standPos.x : st.pos.x;
      const tz = st.standPos ? st.standPos.z : st.pos.z;
      const d = Math.hypot(this.playerState.x - tx, this.playerState.z - tz);
      if (d < bestDist) {
        bestDist = d;
        best = st;
      }
    }
    if (best.id !== this.currentStationId || bestDist < 12.0) {
      this.currentStationId = best.id;
      this.onStationProximity(best, bestDist);
    }

    // Trigger-based marketplace stall proximity check
    let nearestStall = null;
    let nearestStallDist = Infinity;
    for (const trig of this.stallTriggers) {
      const d = Math.hypot(this.playerState.x - trig.x, this.playerState.z - trig.z);
      if (d <= trig.radius && d < nearestStallDist) {
        nearestStallDist = d;
        nearestStall = trig;
      }
    }
    if (nearestStall !== this.nearestStallTrigger) {
      this.nearestStallTrigger = nearestStall;
      this.onStallProximity(nearestStall);
    }

    // Unified courtyard activity proximity check (Leaves, Garden Plots, Bell Tower, Koi Pond)
    let interactPrompt = null;
    for (const [leafId, grp] of this.courtyardLeafMeshes.entries()) {
      if (!grp.visible) continue;
      const d = Math.hypot(this.playerState.x - grp.position.x, this.playerState.z - grp.position.z);
      if (d <= 2.75) {
        interactPrompt = {
          kind: 'leaf',
          leafId,
          label: '🍂 [E] Quét Lá Bồ Đề Vàng (+XP & Công Đức)'
        };
        break;
      }
    }
    if (!interactPrompt) {
      for (const [slotIndex, rec] of this.gardenPlotGroups.entries()) {
        const sx = rec.slot.pos?.x ?? rec.slot.x ?? 0;
        const sz = rec.slot.pos?.z ?? rec.slot.z ?? 0;
        const d = Math.hypot(this.playerState.x - sx, this.playerState.z - sz);
        if (d <= 3.6) {
          interactPrompt = {
            kind: 'garden',
            slotIndex,
            label: `🌱 [E] Chăm Sóc ${rec.slot.label}`
          };
          break;
        }
      }
    }
    if (!interactPrompt) {
      const bellDist = Math.hypot(this.playerState.x - -44.0, this.playerState.z - -56.0);
      if (bellDist <= 7.5) {
        interactPrompt = {
          kind: 'bell_rhythm',
          label: '🔔 [E] Thỉnh Đại Hồng Chung · Gõ Mõ Chánh Niệm'
        };
      } else {
        const koiDist = Math.hypot(this.playerState.x - 3.5, this.playerState.z - 33.0);
        if (koiDist <= 10.2) {
          interactPrompt = {
            kind: 'koi_pond',
            label: '🐟 [E] Cho Cá Koi Ăn · Tĩnh Tâm Hồ Sen'
          };
        }
      }
    }
    const prevKey = this.nearestInteractPrompt
      ? `${this.nearestInteractPrompt.kind}:${this.nearestInteractPrompt.leafId || this.nearestInteractPrompt.slotIndex || ''}`
      : '';
    const nextKey = interactPrompt
      ? `${interactPrompt.kind}:${interactPrompt.leafId || interactPrompt.slotIndex || ''}`
      : '';
    if (prevKey !== nextKey) {
      this.nearestInteractPrompt = interactPrompt;
      this.onInteractProximity(interactPrompt);
    }
  },

  initPointerAndWheelControls() {
    let dragging = false;
    let downX = 0;
    let downY = 0;
    let movedDrag = false;

    this.canvas.addEventListener('pointerdown', (e) => {
      dragging = true;
      movedDrag = false;
      downX = e.clientX;
      downY = e.clientY;
    });

    this.canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.cancelEntranceTour();
        this.cameraZoomOffset = THREE.MathUtils.clamp(
          (this.cameraZoomOffset || 0) + e.deltaY * 0.005,
          -3.0,
          7.0
        );
        this.syncPlayerTransform();
      },
      { passive: false }
    );

    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - downX;
      const dy = e.clientY - downY;
      if (Math.hypot(dx, dy) > 6) {
        movedDrag = true;
        this.cancelEntranceTour();
        this.cameraAzimuthOffset -= dx * 0.0045;
        this.cameraPitchOffset = THREE.MathUtils.clamp(
          (this.cameraPitchOffset || 0) + dy * 0.012,
          -2.2,
          5.5
        );
        downX = e.clientX;
        downY = e.clientY;
        this.syncPlayerTransform();
      }
    });

    window.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      if (!movedDrag && e.target === this.canvas) {
        this.cancelEntranceTour();
        this.handleCanvasTapToWalk(e);
      }
    });
  },

  handleCanvasTapToWalk(e) {
    const rect = this.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, this.camera);

    if (this.inInterior) {
      if (this.nghinMatClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.nghinMatClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('PRAY_NGHIN_MAT_NGHIN_TAY');
          return;
        }
      }
      if (this.choNguClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.choNguClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('PRAY_CHO_NGU_CUA_PHAT');
          return;
        }
      }
      if (this.rightGalleryClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.rightGalleryClickTargets, true);
        if (hits.length > 0) {
          let cur = hits[0].object;
          let shrineTitle = '🙏 Ban Thờ Hành Lang Phải';
          let shrineDesc = 'Dải bàn thờ dọc lối vào góc dưới bên phải dẫn thẳng lên Chính Điện lễ Phật.';
          while (cur) {
            if (cur.userData?.shrineTitle) {
              shrineTitle = cur.userData.shrineTitle;
              shrineDesc = cur.userData.shrineDesc || shrineDesc;
              break;
            }
            cur = cur.parent;
          }
          this.onObjectClick('TOAST', { title: shrineTitle, desc: shrineDesc });
          return;
        }
      }
      if (this.blessingTowerClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.blessingTowerClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('OPEN_BLESSING_TOWER');
          return;
        }
      }
      if (this.interiorBellClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.interiorBellClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('RING_CHUONG_CHANH_DIEN');
          return;
        }
      }
      if (this.interiorDrumClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.interiorDrumClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('STRIKE_TRONG_BAT_NHA');
          return;
        }
      }
      if (this.interiorDoorClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.interiorDoorClickTargets, true);
        if (hits.length > 0) {
          const exitSide = hits[0].object?.userData?.exitSide || 'right';
          this.exitInteriorGradual(exitSide);
          return;
        }
      }
      if (this.arhatGroups?.length) {
        const hits = raycaster.intersectObjects(this.arhatGroups, true);
        if (hits.length > 0) {
          let cur = hits[0].object;
          let arhatIndex = 0;
          while (cur) {
            if (cur.userData?.arhatIndex !== undefined) {
              arhatIndex = cur.userData.arhatIndex;
              break;
            }
            cur = cur.parent;
          }
          this.onObjectClick('OPEN_ARHAT', { arhatIndex });
          return;
        }
      }
      if (this.longTruClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.longTruClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('TOAST', {
            title: '🐉 Cặp Long Trụ Rồng Cuốn Gian Chính Điện',
            desc: 'Hai cột gỗ lim lớn chạm rồng uốn lượn thếp vàng tại cạnh trên Hình Vuông (Chính Điện Chùa Vĩnh Tràng).'
          });
          return;
        }
      }
      if (this.tamBaoAltarGroup) {
        const hits = raycaster.intersectObjects([this.tamBaoAltarGroup], true);
        if (hits.length > 0) {
          this.onObjectClick('LE_PHAT');
          return;
        }
      }
      if (this.interiorNonBoClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.interiorNonBoClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('TOAST', {
            title: '🪷 Hồ Sen Bộ & Hòn Non Bộ Giữa Lòng Hình Vuông',
            desc: 'Không gian thiên tỉnh mở bầu trời ngay trung tâm khuôn viên Hình Vuông của chùa: hồ sen cá Koi nở rộ, cầu đá nhỏ, hàng cột vòm Á – Âu 4 phía và Hòn Non Bộ cổ kính.'
          });
          return;
        }
      }
      if (this.interiorKhuThoClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.interiorKhuThoClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('DANG_HUONG');
          return;
        }
      }
      if (this.interiorTraiDuongClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.interiorTraiDuongClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('TOAST', {
            title: '🪑 Phòng Tiếp Khách · Tủ Kinh Sách Chùa Vĩnh Tràng',
            desc: 'Không gian tiếp khách & đọc kinh sách rộng thoáng bên vách Đông với cửa sổ vòm lá sách xanh, bộ bàn ghế trường kỷ gỗ trắc và ghế nghỉ chân cho Phật tử.'
          });
          return;
        }
      }
    } else {
      if (this.courtyardLeafClickTargets?.length) {
        const visibleLeaves = this.courtyardLeafClickTargets.filter((t) => t.parent?.visible);
        if (visibleLeaves.length) {
          const hits = raycaster.intersectObjects(visibleLeaves, false);
          if (hits.length > 0) {
            const leafId = hits[0].object?.userData?.leafId;
            if (leafId) {
              this.onObjectClick('COLLECT_LEAF', { leafId });
              return;
            }
          }
        }
      }
      if (this.gardenPlotClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.gardenPlotClickTargets, false);
        if (hits.length > 0) {
          const slotIndex = hits[0].object?.userData?.slotIndex ?? 0;
          this.onObjectClick('OPEN_GARDEN_PLOT', { slotIndex });
          return;
        }
      }
      if (this.lectureClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.lectureClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('OPEN_LECTURE');
          return;
        }
      }
      if (this.sideDoorClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.sideDoorClickTargets, true);
        if (hits.length > 0) {
          this.enterInteriorGradual('right');
          return;
        }
      }
      if (this.mainCompoundClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.mainCompoundClickTargets, true);
        if (hits.length > 0) {
          this.enterInteriorGradual('right');
          return;
        }
      }
      if (this.stiltDiningClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.stiltDiningClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('TOAST', {
            title: '🍚 Nhà Sàn Gỗ Trai Đường · Kiến trúc Miền Tây',
            desc: 'Bước lên cầu thang gỗ bên hông Tây để vào khu ăn chay của Phật tử dựng trên hệ cột sàn gỗ căm xe và hồ sen.'
          });
          return;
        }
      }
      if (this.closedMainGateClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.closedMainGateClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('CLOSED_MAIN_GATE');
          return;
        }
      }
      if (this.bellTowerClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.bellTowerClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('RING_BIG_BELL');
          return;
        }
      }
      if (this.stallClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.stallClickTargets, true);
        if (hits.length > 0) {
          let cur = hits[0].object;
          let stallType = 'huong_hoa';
          let stallTitle = 'Nhà Tạp Hóa Cổng Chùa Vĩnh Tràng';
          let eateryId = null;
          while (cur) {
            if (cur.userData && cur.userData.stallType) {
              stallType = cur.userData.stallType;
              stallTitle = cur.userData.stallTitle || stallTitle;
              eateryId = cur.userData.eateryId || cur.userData.localEateryId || null;
              break;
            }
            cur = cur.parent;
          }
          if (stallType === 'local_eatery' && eateryId) {
            this.onObjectClick('OPEN_LOCAL_EATERY', { eateryId, title: stallTitle });
          } else {
            this.onObjectClick('OPEN_MARKET_STALL', { category: stallType, title: stallTitle });
          }
          return;
        }
      }
    }

    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(groundPlane, hit)) {
      if (!this.inInterior) {
        for (const st of [...PILGRIMAGE_STATIONS, ...DISCOVERY_ZONES]) {
          const dPos = Math.hypot(hit.x - st.pos.x, hit.z - st.pos.z);
          const dStand = st.standPos
            ? Math.hypot(hit.x - st.standPos.x, hit.z - st.standPos.z)
            : Infinity;
          if (Math.min(dPos, dStand) < 4.2) {
            this.walkToStation(st);
            return;
          }
        }
      }
      const clamped = this.tryMove(hit.x, hit.z);
      this.autoWalkWaypoints = this.inInterior
        ? [{ x: clamped.x, z: clamped.z }]
        : this.buildPerimeterSafeWaypoints(
            this.playerState.x,
            this.playerState.z,
            clamped.x,
            clamped.z
          );
      this.autoWalkCallback = null;
      this.autoWalkStation = null;
      this.walkTargetRing.position.set(clamped.x, 0.06, clamped.z);
      this.walkTargetRing.visible = true;
      this.updateWalkPathLine();
    }
  },

  handleResize(shouldRender = true) {
    const w = this.canvas.clientWidth || window.innerWidth || 1280;
    const h = this.canvas.clientHeight || window.innerHeight || 720;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.renderer.setSize(w, h, false);
    }
    this.syncPlayerTransform();
    if (shouldRender) this.renderFrame();
  }
};
