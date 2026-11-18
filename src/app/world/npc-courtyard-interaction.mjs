/**
 * Tương tác gần NPC trong sân chùa: phát hiện người chơi tiến lại gần NPC
 * (khách hành hương, Sư Thầy, bà con cổng chùa, Phật tử đang lễ), tạm dừng nhẹ
 * để NPC quay sang chắp tay chào, và chiếu tọa độ đầu NPC lên màn hình cho bong bóng Pháp ngữ.
 *
 * Mixin của VinhTrang3DWorld: gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, CHAR_HEIGHTS } from './shared.mjs';
import {
  evaluateCourtyardNpcProximity,
  getCourtyardNpcSpeaker
} from '../../logic/chua-online-logic.mjs';

const _npcHeadVec = new THREE.Vector3();

export const npcCourtyardInteractionMethods = {
  collectCourtyardNpcDescriptors() {
    const pool = this._courtyardNpcPool || (this._courtyardNpcPool = []);
    let count = 0;

    const pushEntry = (id, root, role, charKey, headHeight, isKneeling, walkerRecord) => {
      if (!root || !root.parent || root.visible === false) return;
      let item = pool[count];
      if (!item) {
        item = {};
        pool[count] = item;
      }
      item.id = id;
      item.x = root.position.x;
      item.z = root.position.z;
      item.role = role;
      item.charKey = charKey;
      item.headHeight = headHeight;
      item.isKneeling = isKneeling;
      item.walkerRecord = walkerRecord;
      count += 1;
    };

    const walkers = this.riggedNpcRecords || [];
    for (let i = 0; i < walkers.length; i++) {
      const w = walkers[i];
      const root = w?.rec?.root;
      if (!root) continue;
      const meta = w.npcMeta;
      const charKey = meta?.charKey || 'nu';
      const role = meta?.role || (charKey === 'tre_em' ? 'novice' : charKey === 'su_thay' ? 'monk' : 'pilgrim');
      pushEntry(
        meta?.id || `courtyard_walk_${i}`,
        root,
        role,
        charKey,
        meta?.headHeight || CHAR_HEIGHTS[charKey] || 1.64,
        false,
        w
      );
    }

    const kneelers = this.kneelingRecords || [];
    for (let i = 0; i < kneelers.length; i++) {
      const k = kneelers[i];
      const root = k?.root;
      if (!root) continue;
      const meta = k.npcMeta;
      pushEntry(
        meta?.id || `courtyard_kneel_${i}`,
        root,
        meta?.role || 'pilgrim',
        meta?.charKey || 'nu',
        meta?.headHeight || 1.15,
        true,
        null
      );
    }

    const vendors = this.vendorNpcRecords || [];
    for (let i = 0; i < vendors.length; i++) {
      const v = vendors[i];
      const root = v?.root;
      if (!root) continue;
      const meta = v.npcMeta;
      const charKey = meta?.charKey || 'nu';
      pushEntry(
        meta?.id || `courtyard_vendor_${i}`,
        root,
        meta?.role || 'vendor',
        charKey,
        meta?.headHeight || CHAR_HEIGHTS[charKey] || 1.64,
        false,
        null
      );
    }

    pool.length = count;
    return pool;
  },

  updateCourtyardNpcInteraction() {
    if (typeof this.onNpcSpeechUpdate !== 'function') return;

    const blocked =
      this.inInterior ||
      this.lectureHallMode ||
      Boolean(this.entranceTour?.active) ||
      Boolean(this.arrivalCutscene?.active) ||
      Boolean(this.interiorTransition);

    if (blocked) {
      if (this.activeCourtyardNpcId !== null) {
        this.activeCourtyardNpcId = null;
        this.onNpcSpeechUpdate({ active: false });
      }
      return;
    }

    const descriptors = this.collectCourtyardNpcDescriptors();
    const match = evaluateCourtyardNpcProximity(
      this.playerState,
      descriptors,
      this.activeCourtyardNpcId,
      { enterRadius: 3.8, exitRadius: 4.6, switchMargin: 0.85 }
    );

    if (!match) {
      if (this.activeCourtyardNpcId !== null) {
        this.activeCourtyardNpcId = null;
        this.onNpcSpeechUpdate({ active: false });
      }
      return;
    }

    const { npc, distance, changed } = match;
    if (changed) {
      this.activeCourtyardNpcId = npc.id;
      const walker = npc.walkerRecord;
      if (walker) {
        const now = performance.now();
        if (now > (walker._greetCooldownUntil || 0)) {
          walker._greetCooldownUntil = now + 14000;
          walker.pauseTimer = Math.max(walker.pauseTimer || 0, 3.4);
          walker.pauseClip = 'Chắp tay';
          walker.lookX = this.playerState.x;
          walker.lookZ = this.playerState.z;
        }
      }
    }

    const headWorldY = (npc.isKneeling ? 0.08 : 0) + npc.headHeight + 0.3;
    _npcHeadVec.set(npc.x, headWorldY, npc.z);
    _npcHeadVec.project(this.camera);

    const visible =
      _npcHeadVec.z > -1 &&
      _npcHeadVec.z < 1 &&
      _npcHeadVec.x >= -1.05 &&
      _npcHeadVec.x <= 1.05 &&
      _npcHeadVec.y >= -1.05 &&
      _npcHeadVec.y <= 1.05;

    const w = this.canvas.clientWidth || window.innerWidth || 1280;
    const h = this.canvas.clientHeight || window.innerHeight || 720;
    const screenX = (_npcHeadVec.x * 0.5 + 0.5) * w;
    const screenY = (-_npcHeadVec.y * 0.5 + 0.5) * h;

    this.onNpcSpeechUpdate({
      active: true,
      changed,
      npcId: npc.id,
      role: npc.role,
      charKey: npc.charKey,
      speaker: getCourtyardNpcSpeaker(npc.role, npc.charKey),
      distance,
      screenX,
      screenY,
      visible
    });
  }
};
