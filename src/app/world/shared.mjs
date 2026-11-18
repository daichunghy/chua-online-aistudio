/** Hằng số, helper và import dùng chung cho các mixin của VinhTrang3DWorld (trước đây nằm đầu file vinh-trang-3d-world.mjs). */
/**
 * VinhTrang3DWorld V8 ("Sáng Trong" Master Edition) — Full-Featured Interactive 3D Temple Grounds
 * Built directly from the 5-Section Master Specification & Reference V8 Modules:
 * 1. SỬA MÀU SẮC & ÁNH SÁNG ("Sáng trong"):
 *    - Cobalt blue sky (0x2B7DE1, gradient #0155C9 -> #4F97F9), warm sunlight ~16:30 (0xffd9a3, intensity 1.7)
 *      + south front-fill (0xfff6e0, intensity 0.55), hemisphere (0xfff2d9 / 0x5e4a35, intensity 1.3),
 *      ACESFilmicToneMapping exposure 1.12.
 *    - Locked real-photo hex palette: Chánh điện gold #D9A441 (#B9852F shaded), cream #E8E2D4, red columns #7E2A22,
 *      dark wood openings #1E1410 / #2B2320, terracotta brown-red roof tiles #7C4030 (#6E382A-#8A4A34),
 *      warm white statues #EFE9DD, A Di Đà blue lotus throne #4E86A8 on #8A4A3A base, stone pedestals #6E675C,
 *      7-tier stupa #C88A4A / #A85A38, Tam Quan gates #C9962E + mosaic cobalt #2C4A8A / jade #3F7D5D / red #A03A2A,
 *      stone-paved courtyard #8A7A63 / #B4A68C, pond water #4E5F3A, foliage #3E6B34-#5C8446, bougainvillea #EE7FAE.
 *    - Self-generated procedural canvas textures (<=1024px): stone paving with mortar lines, terracotta roof tiles,
 *      leaf clusters, Buddhist 5-stripe flag, and high-DPI plaques ("CHÙA VĨNH TRÀNG").
 * 2. SỬA MẶT TIỀN & TƯỢNG:
 *    - 13-arch Chánh Điện with Roman arches, iron grilles, carved red columns, ceramic mosaic gables,
 *      hipped terracotta roofs, a 7-step central stair, side entries, two bell/drum towers, and bonsai pots.
 *    - Real sculpted GLB Buddha statues from /Mô hình 3D Vĩnh Tràng/Tượng/ (NEVER primitive spheres/cones):
 *      phat-dung-adida.glb, di-lac.glb, phat-nam.glb, phat-ngoi-ban-tho.glb (with 300x300 "Ground" removed).
 * 3. SỬA DI CHUYỂN & SANSA AUTO-WALK:
 *    - Crossfade (0.22s), speed-blend (moveBlend), smooth yaw lerp, hysteresis obstacle escape in tryMove,
 *      click-to-walk along waypoints with golden trail & objective callback ("Đang tới: <tên trạm>").
 *    - Monks in grey robes with orange diagonal sash (recolorMonkRobe), kneeling worshippers on red-gold cushions,
 *      and SmokeColumn rising from the bronze incense burner.
 * 4. LÀM ĐẦY ĐỦ KHUÔN VIÊN (~14,000 m²):
 *    - 2 Tam Quan gates, golden fence, 2 Lotus Ponds with stone balusters & Koi fish, 8 stone lanterns,
 *      coconut palms, Buddhist flag strings, distant mountains, blossom trees, Sạp nhang hoa, Phòng kinh sách,
 *      Giảng đường Huệ Đăng, Bảo tháp 7 tầng, Quầy lưu niệm, pigeons, and 4-section Interior Hall.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import {
  PILGRIMAGE_STATIONS,
  DISCOVERY_ZONES,
  findAnyTempleDestination,
  WORLD_BOUNDS,
  COURTYARD_LEAF_SPOTS,
  TEMPLE_GARDEN_SLOTS,
  shiftOklch,
  VINH_TRANG_OKLCH_PALETTE
} from '../../logic/chua-online-logic.mjs';
import {
  createSculptedSeatedBuddha,
  createSculptedBodhisattva,
  createSeatedBodhisattva,
  createSculptedGuardian,
  createSculptedPatriarch,
  createSculptedGardenArhat,
  createStandingCrimsonMonkStatue,
  createThousandArmedQuanAm,
  createIndoorSleepingBuddhaBed
} from '../sculpted-buddhas.mjs';
import {
  findCharacterBones,
  attachStorePropsToCharacterRig
} from '../garment-and-showcase-3d.mjs';
import { buildSquareChanhDienInterior } from '../vinh-trang-square-interior.mjs';

// Pre-allocated scratch vectors for zero-GC animation & camera loop
export const _tourPos = new THREE.Vector3();
export const _tourLook = new THREE.Vector3();
export const _camTargetPos = new THREE.Vector3();
export const _camTargetLook = new THREE.Vector3();
export const _projVec = new THREE.Vector3();
export const _koiPos = new THREE.Vector3();
export const _koiTan = new THREE.Vector3();

export function normalizeAnimKey(name = '') {
  return String(name)
    .replace(/_world$/i, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .trim()
    .toLowerCase();
}

export const CHAR_GLB_PATHS = {
  nu: '/Thiết kế giao diện/Nhân vật 3D/Bản chỉnh sửa/nu-phuc-hoi-mau-chuyen-dong.glb',
  nam: '/Thiết kế giao diện/Nhân vật 3D/Chuyển động/nam-chuyen-dong.glb',
  tre_em: '/Thiết kế giao diện/Nhân vật 3D/Chuyển động/tre-em-chuyen-dong.glb',
  su_thay: '/Thiết kế giao diện/Nhân vật 3D/meshy_chars/su-thay-ao-vang.glb',
  nu_ao_lam: '/Thiết kế giao diện/Nhân vật 3D/meshy_chars/nu-ao-lam.glb',
  nam_ao_nau: '/Thiết kế giao diện/Nhân vật 3D/meshy_chars/nam-ao-nau.glb',
  du_khach: '/Thiết kế giao diện/Nhân vật 3D/meshy_chars/du-khach-quoc-te.glb'
};

export const CHAR_HEIGHTS = {
  nu: 1.64,
  nam: 1.75,
  tre_em: 1.18,
  su_thay: 1.72,
  nu_ao_lam: 1.63,
  nam_ao_nau: 1.73,
  du_khach: 1.76
};

export const STATUE_GLB_PATHS = {
  adida: '/Mô hình 3D Vĩnh Tràng/Tượng/phat-dung-adida.glb',
  dilac: '/Mô hình 3D Vĩnh Tràng/Tượng/di-lac.glb',
  phatnam: '/Mô hình 3D Vĩnh Tràng/Tượng/phat-nam.glb',
  bantho: null,
  thichCaChanhDien: null,
  quanAm: '/Mô hình 3D Vĩnh Tràng/Tượng/quan-am-nam-hai.glb',
  hoPhap: '/Mô hình 3D Vĩnh Tràng/Tượng/ho-phap-vi-da.glb',
  tieuDien: '/Mô hình 3D Vĩnh Tràng/Tượng/tieu-dien-dai-si.glb',
  toDatMa: '/Mô hình 3D Vĩnh Tràng/Tượng/to-dat-ma.glb',
  nghinMatNghinTay: null,
  choNguCuaPhat: '/Thiết kế giao diện/Vật phẩm 3D/meshy_assets/cho-ngu-cua-phat.glb'
};

export const ARHAT_GLB_PATHS = {
  kyTuong: '/Mô hình 3D Vĩnh Tràng/Tượng/ky-tuong-la-han.glb',
  toaLoc: '/Mô hình 3D Vĩnh Tràng/Tượng/toa-loc-la-han.glb',
  phucHo: '/Mô hình 3D Vĩnh Tràng/Tượng/phuc-ho-la-han.glb',
  hangLong: '/Mô hình 3D Vĩnh Tràng/Tượng/la-han-hang-long.glb',
  hoanHi: '/Mô hình 3D Vĩnh Tràng/Tượng/la-han-hoan-hi.glb',
  phucHo2: '/Mô hình 3D Vĩnh Tràng/Tượng/la-han-phuc-ho.glb',
  thienDinh: '/Mô hình 3D Vĩnh Tràng/Tượng/la-han-thien-dinh.glb',
  cuBat: '/Mô hình 3D Vĩnh Tràng/Tượng/cu-bat-la-han.glb',
  thacThap: '/Mô hình 3D Vĩnh Tràng/Tượng/thac-thap-la-han.glb',
  khaiTam: '/Mô hình 3D Vĩnh Tràng/Tượng/khai-tam-la-han.glb',
  tieuSu: '/Mô hình 3D Vĩnh Tràng/Tượng/tieu-su-la-han.glb'
};

export const ARCH_GLB_PATHS = {
  mat_tien: '/Mô hình 3D Vĩnh Tràng/Bản dựng mới/mat-tien-vinh-trang-meshy.glb',
  mat_tien_legacy: '/Mô hình 3D Vĩnh Tràng/Bản dựng mới/mat-tien-vinh-trang.glb',
  tam_quan: '/Mô hình 3D Vĩnh Tràng/Bản dựng mới/tam-quan-vinh-trang.glb',
  bao_thap: '/Thiết kế giao diện/Vật phẩm 3D/meshy_assets/bao-thap-7-tang.glb',
  dai_hong_chung: '/Thiết kế giao diện/Vật phẩm 3D/meshy_assets/dai-hong-chung.glb',
  trong_bat_nha: '/Thiết kế giao diện/Vật phẩm 3D/meshy_assets/trong-bat-nha.glb',
  long_tru: '/Thiết kế giao diện/Vật phẩm 3D/meshy_assets/long-tru-rong-cuon.glb',
  bao_lam: '/Thiết kế giao diện/Vật phẩm 3D/meshy_assets/bao-lam-thep-vang.glb',
  thap_den_cau_an: '/Thiết kế giao diện/Vật phẩm 3D/meshy_assets/thap-den-cau-an.glb',
  hon_non_bo: '/Thiết kế giao diện/Vật phẩm 3D/meshy_assets/hon-non-bo-thien-tinh.glb',
  xe_khach: '/Thiết kế giao diện/Vật phẩm 3D/meshy_assets/xe-khach-du-lich.glb',
  xe_oto: '/Thiết kế giao diện/Vật phẩm 3D/meshy_assets/xe-o-to-gia-dinh.glb'
};

export const PROP_GLB_PATHS = {
  ban_tho: '/Thiết kế giao diện/Vật phẩm 3D/fixed/bat_nhang_tram.glb',
  non_la: '/Thiết kế giao diện/Vật phẩm 3D/models/non_la_theu_sen_v3.glb',
  tui_sen: '/Thiết kế giao diện/Vật phẩm 3D/Bản chỉnh sửa/tui-vai-sen.glb',
  ao_trang: '/Thiết kế giao diện/Vật phẩm 3D/models/ao_trang_phat_tu.glb',
  bo_doan: '/Thiết kế giao diện/Vật phẩm 3D/fixed/bo_doan_dai_sen.glb',
  bo_doan_tron: '/Thiết kế giao diện/Vật phẩm 3D/fixed/bo_doan_tron.glb',
  chieu_coi_thien: '/Thiết kế giao diện/Vật phẩm 3D/fixed/chieu_coi_thien.glb',
  hoa_sen: '/Thiết kế giao diện/Vật phẩm 3D/fixed/nen_hoa_sen.glb',
  nen_hoa_sen: '/Thiết kế giao diện/Vật phẩm 3D/fixed/nen_hoa_sen.glb',
  den_hoa_dang: '/Thiết kế giao diện/Vật phẩm 3D/fixed/den_hoa_dang.glb',
  den_long: '/Thiết kế giao diện/Vật phẩm 3D/fixed/den_long_luc_giac.glb',
  chum_sen: '/Thiết kế giao diện/Vật phẩm 3D/fixed/chum_sanh_hoa_sen.glb',
  mam_ngu_qua: '/Thiết kế giao diện/Vật phẩm 3D/fixed/mam_ngu_qua.glb',
  mo_go: '/Thiết kế giao diện/Vật phẩm 3D/fixed/mo_go_tung_kinh.glb',
  trai_dua_xiem: '/Thiết kế giao diện/Vật phẩm 3D/fixed/trai_dua_xiem.glb',
  dia_banh_bo: '/Thiết kế giao diện/Vật phẩm 3D/fixed/dia_banh_bo.glb',
  dia_banh_da_lon: '/Thiết kế giao diện/Vật phẩm 3D/fixed/dia_banh_da_lon.glb',
  quat_nan_la_dua: '/Thiết kế giao diện/Vật phẩm 3D/fixed/quat_nan_la_dua.glb',
  gio_may_tre: '/Thiết kế giao diện/Vật phẩm 3D/fixed/gio_may_tre.glb',
  chim_bo_cau: '/Thiết kế giao diện/Vật phẩm 3D/meshy_assets/chim-bo-cau-3d.glb',
  khan_ran: '/Thiết kế giao diện/Vật phẩm 3D/meshy_assets/khan-ran-nam-bo-3d.glb',
  trang_hat: '/Thiết kế giao diện/Vật phẩm 3D/meshy_assets/trang-hat-bo-de-3d.glb',
  vong_may: '/Thiết kế giao diện/Vật phẩm 3D/meshy_assets/vong-may-ngu-sac-3d.glb',
  cay_bo_de: '/Thiết kế giao diện/Vật phẩm 3D/meshy_assets/cay-bo-de-non.glb',
  cay_sala: '/Thiết kế giao diện/Vật phẩm 3D/meshy_assets/cay-sala-hoa.glb',
  cap_hac_rua: '/Thiết kế giao diện/Vật phẩm 3D/meshy_assets/cap-hac-rua.glb',
  nhang_khoanh_dong: '/Thiết kế giao diện/Vật phẩm 3D/meshy_assets/nhang-khoanh-dong.glb'
};

export function makeCanvasTex(draw, w = 512, h = 512, repeatX = 1, repeatY = 1, isColor = true) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.anisotropy = 8;
  if (isColor) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function makeTextTex(text, opts = {}) {
  const w = opts.w || 1024;
  const h = opts.h || 256;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = opts.bg || '#5C1B12';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = opts.border || '#D9A441';
  g.lineWidth = Math.max(8, h * 0.05);
  g.strokeRect(10, 10, w - 20, h - 20);
  g.strokeRect(22, 22, w - 44, h - 44);
  g.fillStyle = opts.color || '#FFD875';
  g.font = `bold ${opts.size || Math.floor(h * 0.44)}px "Noto Serif", "Times New Roman", Georgia, serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.shadowColor = 'rgba(0,0,0,0.65)';
  g.shadowBlur = 8;
  g.fillText(text, w / 2, h / 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function makeHippedRoofMesh(width, depth, height, material) {
  // Four true roof planes meeting at a short ridge, rather than a square pyramid.
  // The ridge follows the longer side; square roofs naturally collapse toward a compact hip.
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const uvs = [];
  const longAxisIsZ = depth > width;
  const longHalf = Math.max(width, depth) * 0.5;
  const shortHalf = Math.min(width, depth) * 0.5;
  const ridgeHalf = Math.max(0.025, longHalf - shortHalf * 0.9);
  const baseY = -height * 0.5;
  const ridgeY = height * 0.5;
  const mapPoint = (p) => longAxisIsZ ? [p[2], p[1], -p[0]] : p;
  const pushPoint = (p) => {
    const v = mapPoint(p);
    positions.push(v[0], v[1], v[2]);
    uvs.push(v[0] / width + 0.5, v[2] / depth + 0.5);
  };
  const triangle = (a, b, c) => { pushPoint(a); pushPoint(b); pushPoint(c); };
  const quad = (a, b, c, d) => { triangle(a, b, c); triangle(a, c, d); };
  const ridgeL = [-ridgeHalf, ridgeY, 0];
  const ridgeR = [ridgeHalf, ridgeY, 0];
  const frontL = [-longHalf, baseY, shortHalf];
  const frontR = [longHalf, baseY, shortHalf];
  const backL = [-longHalf, baseY, -shortHalf];
  const backR = [longHalf, baseY, -shortHalf];
  quad(frontL, frontR, ridgeR, ridgeL);
  quad(backR, backL, ridgeL, ridgeR);
  triangle(backL, frontL, ridgeL);
  triangle(frontR, backR, ridgeR);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export class SmokeColumn {
  constructor(origin, count = 42, spread = 0.25, height = 3.2) {
    this.origin = origin.clone();
    this.count = count;
    this.spread = spread;
    this.height = height;
    const geom = new THREE.BufferGeometry();
    this.positions = new Float32Array(count * 3);
    this.ages = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      this.ages[i] = Math.random();
      this.resetParticle(i, this.ages[i]);
    }
    geom.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(32, 32, 2, 32, 32, 30);
    grd.addColorStop(0, 'rgba(255,250,240,0.75)');
    grd.addColorStop(0.5, 'rgba(235,230,225,0.35)');
    grd.addColorStop(1, 'rgba(220,220,225,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.PointsMaterial({
      map: tex,
      size: 0.72,
      transparent: true,
      depthWrite: false,
      opacity: 0.78
    });
    this.points = new THREE.Points(geom, mat);
  }

  resetParticle(i, age = 0) {
    this.ages[i] = age;
    this.positions[i * 3] = this.origin.x + (Math.random() - 0.5) * this.spread * 0.5;
    this.positions[i * 3 + 1] = this.origin.y + age * this.height;
    this.positions[i * 3 + 2] = this.origin.z + (Math.random() - 0.5) * this.spread * 0.5;
  }

  update(dt, time) {
    for (let i = 0; i < this.count; i++) {
      this.ages[i] += (dt * 0.28) / (this.height / 3);
      if (this.ages[i] >= 1) {
        this.resetParticle(i, 0);
      } else {
        const a = this.ages[i];
        this.positions[i * 3] =
          this.origin.x + Math.sin(time * 1.4 + i) * this.spread * a + a * 0.25;
        this.positions[i * 3 + 1] = this.origin.y + a * this.height;
        this.positions[i * 3 + 2] =
          this.origin.z + Math.cos(time * 1.1 + i * 0.7) * this.spread * a;
      }
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }
}

// Re-export các binding đã import để các module con dùng chung một chỗ.
export { THREE, GLTFLoader, SkeletonUtils, PILGRIMAGE_STATIONS, DISCOVERY_ZONES, findAnyTempleDestination, WORLD_BOUNDS, COURTYARD_LEAF_SPOTS, TEMPLE_GARDEN_SLOTS, shiftOklch, VINH_TRANG_OKLCH_PALETTE, createSculptedSeatedBuddha, createSculptedBodhisattva, createSeatedBodhisattva, createSculptedGuardian, createSculptedPatriarch, createSculptedGardenArhat, createStandingCrimsonMonkStatue, createThousandArmedQuanAm, createIndoorSleepingBuddhaBed, findCharacterBones, attachStorePropsToCharacterRig, buildSquareChanhDienInterior };

/** Gắn các nhóm method (mixin) vào class, giữ nguyên getter/setter. */
export function applyMixins(target, ...mixins) {
  for (const mixin of mixins) {
    Object.defineProperties(target.prototype, Object.getOwnPropertyDescriptors(mixin));
  }
}
