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
} from '../logic/chua-online-logic.mjs';
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
} from './sculpted-buddhas.mjs';
import {
  findCharacterBones,
  attachStorePropsToCharacterRig
} from './garment-and-showcase-3d.mjs';
import { buildSquareChanhDienInterior } from './vinh-trang-square-interior.mjs';

// Pre-allocated scratch vectors for zero-GC animation & camera loop
const _tourPos = new THREE.Vector3();
const _tourLook = new THREE.Vector3();
const _camTargetPos = new THREE.Vector3();
const _camTargetLook = new THREE.Vector3();
const _projVec = new THREE.Vector3();
const _koiPos = new THREE.Vector3();
const _koiTan = new THREE.Vector3();

function normalizeAnimKey(name = '') {
  return String(name)
    .replace(/_world$/i, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .trim()
    .toLowerCase();
}

const CHAR_GLB_PATHS = {
  nu: '/Thiết kế giao diện/Nhân vật 3D/Bản chỉnh sửa/nu-phuc-hoi-mau-chuyen-dong.glb',
  nam: '/Thiết kế giao diện/Nhân vật 3D/Chuyển động/nam-chuyen-dong.glb',
  tre_em: '/Thiết kế giao diện/Nhân vật 3D/Chuyển động/tre-em-chuyen-dong.glb',
  su_thay: '/Thiết kế giao diện/Nhân vật 3D/meshy_chars/su-thay-ao-vang.glb',
  nu_ao_lam: '/Thiết kế giao diện/Nhân vật 3D/meshy_chars/nu-ao-lam.glb',
  nam_ao_nau: '/Thiết kế giao diện/Nhân vật 3D/meshy_chars/nam-ao-nau.glb',
  du_khach: '/Thiết kế giao diện/Nhân vật 3D/meshy_chars/du-khach-quoc-te.glb'
};

const CHAR_HEIGHTS = {
  nu: 1.64,
  nam: 1.75,
  tre_em: 1.18,
  su_thay: 1.72,
  nu_ao_lam: 1.63,
  nam_ao_nau: 1.73,
  du_khach: 1.76
};

const STATUE_GLB_PATHS = {
  adida: '/Mô hình 3D Vĩnh Tràng/Tượng/phat-dung-adida.glb',
  dilac: '/Mô hình 3D Vĩnh Tràng/Tượng/di-lac.glb',
  phatnam: '/Mô hình 3D Vĩnh Tràng/Tượng/phat-nam.glb',
  bantho: null,
  thichCaChanhDien: null,
  quanAm: '/Mô hình 3D Vĩnh Tràng/Tượng/quan-am-nam-hai.glb',
  hoPhap: '/Mô hình 3D Vĩnh Tràng/Tượng/ho-phap-vi-da.glb',
  tieuDien: '/Mô hình 3D Vĩnh Tràng/Tượng/tieu-dien-dai-si.glb',
  toDatMa: '/Mô hình 3D Vĩnh Tràng/Tượng/to-dat-ma.glb',
  nghinMatNghinTay: '/Thiết kế giao diện/Vật phẩm 3D/meshy_assets/tuong-phat-nghin-mat-nghin-tay.glb',
  choNguCuaPhat: '/Thiết kế giao diện/Vật phẩm 3D/meshy_assets/cho-ngu-cua-phat.glb'
};

const ARHAT_GLB_PATHS = {
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

const ARCH_GLB_PATHS = {
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

const PROP_GLB_PATHS = {
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

function makeCanvasTex(draw, w = 512, h = 512, repeatX = 1, repeatY = 1, isColor = true) {
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

function makeTextTex(text, opts = {}) {
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

function makeHippedRoofMesh(width, depth, height, material) {
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

class SmokeColumn {
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

export class VinhTrang3DWorld {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.onStationProximity = callbacks.onStationProximity || callbacks.onStationArrive || (() => {});
    this.onStationArrive = callbacks.onStationArrive || callbacks.onStationProximity || (() => {});
    this.onPinScreenUpdate = callbacks.onPinScreenUpdate || (() => {});
    this.onUpdateProjectedPins = callbacks.onUpdateProjectedPins || (() => {});
    this.onObjectClick = callbacks.onObjectClick || (() => {});
    this.onLoaded = callbacks.onLoaded || (() => {});
    this.onAutoWalkArrival = callbacks.onAutoWalkArrival || callbacks.onStationArrive || (() => {});
    this.onAutoWalkTargetChange = callbacks.onAutoWalkTargetChange || (() => {});
    this.onTransitionFade = callbacks.onTransitionFade || (() => {});
    this.onInteriorStateChange = callbacks.onInteriorStateChange || (() => {});
    this.onInteriorZoneChange = callbacks.onInteriorZoneChange || (() => {});
    this._lastInteriorZone = 'chanh_dien';
    this.onStallProximity = callbacks.onStallProximity || (() => {});
    this.onInteractProximity = callbacks.onInteractProximity || (() => {});
    this.onEntranceTourChange = callbacks.onEntranceTourChange || (() => {});
    this.onStepSound = callbacks.onStepSound || (() => {});
    this._stepAudioTimer = 0;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xA6D0F0);
    this.scene.fog = new THREE.FogExp2(0xEADBC4, 0.0033);

    this.camera = new THREE.PerspectiveCamera(48, 16 / 9, 0.2, 420);

    this.contextLost = false;
    this.lectureHallMode = false;
    this.timeOfDay = 'morning';
    this.glbPromiseCache = new Map();
    this._interiorLoadPromise = null;
    this._interiorGLBsMounted = false;
    this._interiorWorshippersSpawned = false;
    this._phase2Started = false;
    this.guidedBeaconGroup = null;
    this.guidedBeaconKey = null;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'default'
    });
    this.renderer.debug.checkShaderErrors = false;
    this.isSoftwareGl = (() => {
      try {
        const gl = this.renderer.getContext();
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param) || '');
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;

    this.canvas.addEventListener(
      'webglcontextlost',
      (ev) => {
        ev.preventDefault();
        this.contextLost = true;
      },
      false
    );
    this.canvas.addEventListener(
      'webglcontextrestored',
      () => {
        this.contextLost = false;
        this.renderFrame();
      },
      false
    );

    try {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      const envScene = new THREE.Scene();
      const skyBox = new THREE.Mesh(
        new THREE.BoxGeometry(20, 20, 20),
        new THREE.MeshBasicMaterial({ color: 0x9AD0F5, side: THREE.BackSide })
      );
      envScene.add(skyBox);
      const earthFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshBasicMaterial({ color: 0x6E583D })
      );
      earthFloor.rotation.x = -Math.PI / 2;
      earthFloor.position.y = -4;
      envScene.add(earthFloor);
      const sunPanel = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 8),
        new THREE.MeshBasicMaterial({ color: 0xFFE9BA, side: THREE.DoubleSide })
      );
      sunPanel.position.set(-7, 6, 6);
      sunPanel.lookAt(0, 0, 0);
      envScene.add(sunPanel);
      const envTex = pmrem.fromScene(envScene, 0.04).texture;
      this.exteriorEnvTex = envTex;
      this.scene.environment = envTex;

      // Dedicated moody dark-timber/amber environment for interior (eliminates cyan sky reflections on floor & walls)
      const intEnvScene = new THREE.Scene();
      const intRoom = new THREE.Mesh(
        new THREE.BoxGeometry(20, 20, 20),
        new THREE.MeshBasicMaterial({ color: 0x7A5538, side: THREE.BackSide })
      );
      intEnvScene.add(intRoom);
      const intFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshBasicMaterial({ color: 0x543823 })
      );
      intFloor.rotation.x = -Math.PI / 2;
      intFloor.position.y = -4;
      intEnvScene.add(intFloor);
      const intLanternBounce = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 8),
        new THREE.MeshBasicMaterial({ color: 0xFFD294, side: THREE.DoubleSide })
      );
      intLanternBounce.position.set(0, 5, 0);
      intLanternBounce.rotation.x = Math.PI / 2;
      intEnvScene.add(intLanternBounce);
      this.interiorEnvTex = pmrem.fromScene(intEnvScene, 0.04).texture;

      pmrem.dispose();
    } catch {
      // Fallback safely if PMREM is unavailable
    }

    this.clock = new THREE.Clock();
    this.gltfLoader = new GLTFLoader();

    // Spawn on front entrance plaza overlooking quiet closed Cổng Chính & busy wide-open Cổng Phụ
    this.playerState = {
      x: 35.5,
      z: 50.8,
      yaw: Math.PI - 0.16,
      moving: false,
      charKey: callbacks.initialCharKey || 'nu',
      pose: 'Dung',
      moveBlend: 0
    };
    this.heldDirs = new Set();
    this.currentStationId = 0;
    this.inInterior = false;
    this.cameraBaseYaw = Math.PI - 0.16;
    this.cameraAzimuthOffset = 0;
    this.cameraPitchOffset = 0;
    this.cameraZoomOffset = 0;
    this.playerElevationY = 0;
    this.lastDoorSide = 'right';
    this._doorCooldownUntil = 0;

    this.charDataCache = {};
    this.propMeshCache = {};
    this.archMeshCache = {};
    this.playerContainer = new THREE.Group();
    this.scene.add(this.playerContainer);
    this.anCompanion = null;
    this.activePlayerRecord = null;
    this.npcRecords = [];
    this.riggedNpcRecords = [];
    this.companionRecords = [];
    this.kneelingRecords = [];
    this.interiorKneelingRecords = [];
    this.interiorNonBoClickTargets = [];
    this.interiorKhuThoClickTargets = [];
    this.interiorTraiDuongClickTargets = [];
    this.interiorCutaway = false;
    this.cutawayTargets = [];
    this.longTruClickTargets = [];
    this.stiltDiningClickTargets = [];
    this.lectureClickTargets = [];
    this.mainCompoundClickTargets = [];
    this.stallClickTargets = [];
    this.bellTowerClickTargets = [];
    this.closedMainGateClickTargets = [];
    this.courtyardLeafMeshes = new Map();
    this.courtyardLeafClickTargets = [];
    this.gardenPlotGroups = new Map();
    this.gardenPlotClickTargets = [];
    this.nearestInteractPrompt = null;
    this.stupaGroup = null;
    this.tamQuanMainGroup = null;
    this.tamQuanProceduralParts = [];
    this.spiralIncenseAnchors = [];
    this.craneTortoiseAnchor = null;
    this.outdoorArhatPlaza = null;
    this.lanternWishesGroup = new THREE.Group();
    this.floatingLanterns = [];
    this.arrivalCutscene = null;
    this.proceduralPoseState = { action: null, timer: 0, duration: 2.6 };
    this.bellTowerArchAnchors = [];
    this.drumTowerArchAnchors = [];
    this.longTruPlaceholders = [];
    this.baoLamPlaceholders = [];
    this.hoPhapPlaceholder = null;
    this.tieuDienPlaceholder = null;
    this.khuThoAltarGroup = null;
    this.khuThoPlaceholderParts = [];
    this.interiorBellAnchor = null;
    this.interiorDrumAnchor = null;
    this.parkedVehicleAnchors = [];
    this.chanhDienFacadeGroup = null;
    this.chanhDienProceduralShell = null;
    this.quanAmPlaceholderParts = [];
    this.stallAnchors = [];
    this.stallTriggers = [];
    this.nearestStallTrigger = null;
    this.sideDoorClickTargets = [];
    this.interiorTransition = null;
    this.activeStorePreview = null;
    this.koiList = [];
    this.lotusSwayGroups = [];
    this.pondLotusAnims = [];
    this.lotusBloomState = {
      active: false,
      timer: 0,
      duration: 4.8,
      burstLight: null,
      burstRing: null
    };
    this.entranceTour = {
      active: false,
      timer: 0,
      duration: 8.8,
      posCurve: null,
      lookCurve: null
    };
    this.vendorNpcRecords = [];
    this.trafficVehicleRecords = [];
    this.trafficSpawnQueue = [];
    this.trafficSpawnTimer = 8 + Math.random() * 9;
    this.visitorConvoyTimer = 48 + Math.random() * 28;
    this.activeVisitorShuttle = null;
    this.visitorGroupSequence = 0;
    this.sunbeamMeshes = [];
    this.pigeons = [];
    this.smokeColumns = [];
    this.incenseSticksGroup = new THREE.Group();
    this.offeredLotusesGroup = new THREE.Group();

    this.stationMarkers = [];
    this.autoWalkWaypoints = [];
    this.autoWalkCallback = null;
    this.autoWalkStation = null;
    this.walkTargetRing = null;
    this.walkPathLine = null;

    this.obstacles = [];
    this.rectObstacles = [];
    this.interiorObstacles = [];
    this.interiorRectObstacles = [];

    this.exteriorGroup = new THREE.Group();
    this.interiorGroup = new THREE.Group();
    this.interiorGroup.visible = false;
    this.scene.add(this.exteriorGroup);
    this.scene.add(this.interiorGroup);

    this.initTexturesAndMaterials();
    this.initLights();
    this.buildSkyDomeAndMountains();
    this.buildTempleGroundsV8();
    this.buildInteriorChanhDienV8();
    this.buildStationBeacons();
    this.initPointerAndWheelControls();
    this.handleResize(false);
    window.addEventListener('resize', () => this.handleResize(true));

    this.syncPlayerTransform();
    this._animateStarted = false;
    this.loaded = false;
    this.loadAllGLBAssets();
  }

  // Compatibility getters & methods for ChuaOnlineApp
  init() {
    this.handleResize(false);
    this.syncPlayerTransform();
    if (!this._animateStarted) {
      this._animateStarted = true;
      this.animate();
    }
  }

  get playerPos() {
    return { x: this.playerState.x, z: this.playerState.z };
  }

  get playerYaw() {
    return this.playerState.yaw;
  }

  get playerMoving() {
    return this.playerState.moving;
  }

  get insideInterior() {
    return this.inInterior;
  }

  setPlayerPose(x, z, yaw = Math.PI) {
    this.cancelEntranceTour();
    this.cancelAutoWalk();
    this.playerState.x = x;
    this.playerState.z = z;
    this.playerState.yaw = yaw;
    this.playerState.moving = false;
    this.cameraBaseYaw = yaw;
    this.cameraAzimuthOffset = 0;
    this.syncPlayerTransform();
    this.checkStationProximity();
    this.renderFrame();
  }

  startEntranceCameraTour() {
    if (this.inInterior) return;
    if (!this.entranceTour.posCurve) {
      // Tour path matching exact Vĩnh Tràng visitor arrival in image_bb72a8b0.png & image_97204806.png:
      // 1) Quiet closed Cổng Chính -> 2) Busy wide-open ceramic mosaic Cổng Phụ ("Tịnh Độ Huyền Môn")
      // -> 3) Glide in through Cổng Phụ past Nhà Tạp Hóa Vĩnh Tràng & Yellow Welcome Banner
      // -> 4) Bougainvillea right side path past Đài Quán Thế Âm -> settle behind player at entrance plaza
      this.entranceTour.posCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(24.5, 3.0, 54.5),
        new THREE.Vector3(38.5, 3.6, 51.5),
        new THREE.Vector3(40.5, 3.2, 41.0),
        new THREE.Vector3(40.5, 3.3, 33.0),
        new THREE.Vector3(36.2, 3.4, 21.5),
        new THREE.Vector3(34.8, 3.0, 13.0),
        new THREE.Vector3(37.2, 2.5, 57.6)
      ]);
      this.entranceTour.lookCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(23.0, 4.4, 41.5),
        new THREE.Vector3(40.5, 4.2, 41.5),
        new THREE.Vector3(44.5, 2.8, 35.5),
        new THREE.Vector3(36.0, 2.5, 22.0),
        new THREE.Vector3(32.5, 3.2, 11.0),
        new THREE.Vector3(35.5, 3.4, 38.0),
        new THREE.Vector3(36.8, 3.4, 39.5)
      ]);
    }
    this.entranceTour.active = true;
    this.entranceTour.timer = 0;
    this.onEntranceTourChange(true);
    this.stepEntranceTour(0.01);
  }

  cancelEntranceTour() {
    if (this.entranceTour.active) {
      this.entranceTour.active = false;
      this.onEntranceTourChange(false);
      this.syncPlayerTransform();
    }
  }

  enterInteriorHall(instant = false, onEntered = null) {
    this.cancelEntranceTour();
    if (instant) {
      const ok = this.toggleInterior(true);
      if (typeof onEntered === 'function') onEntered();
      return ok;
    }
    return this.enterInteriorGradual('right', onEntered);
  }

  exitInteriorHall(instant = false) {
    if (instant) {
      return this.toggleInterior(false);
    }
    return this.exitInteriorGradual();
  }

  switchCharacter(charKey) {
    this.setCharacter(charKey);
  }

  playPlayerBowAnimation() {
    this.triggerActionAnimation('Vái');
  }

  setIncenseBoost() {
    this.addIncenseStickVisual();
    this.triggerActionAnimation('Thắp nhang');
  }

  placeLotusOfferingIn3D() {
    this.addLotusOfferingVisual();
    this.lotusBloomState.active = true;
    this.lotusBloomState.timer = 0;
    this.triggerActionAnimation('Chắp tay');
  }

  captureSnapshotDataURL() {
    try {
      const gl = this.renderer?.getContext?.();
      if (this.contextLost || gl?.isContextLost?.()) return null;
      this.renderer.render(this.scene, this.camera);
      return this.canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  }

  setHeldDirection(dir, active) {
    if (!dir) return;
    if (active) {
      this.cancelEntranceTour();
      this.heldDirs.add(dir);
      this.cancelAutoWalk();
    } else {
      this.heldDirs.delete(dir);
      if (this.heldDirs.size === 0 && this.autoWalkWaypoints.length === 0) {
        this.playerState.moving = false;
      }
    }
  }

  clearHeldDirections() {
    this.heldDirs.clear();
    if (this.autoWalkWaypoints.length === 0) {
      this.playerState.moving = false;
    }
  }

  nudgeDirection(dir, dist = 1.35) {
    const dirMap = {
      up: { dx: 0, dz: -1 },
      down: { dx: 0, dz: 1 },
      left: { dx: -1, dz: 0 },
      right: { dx: 1, dz: 0 }
    };
    const v = dirMap[dir];
    if (!v) return;
    const angle = this.cameraBaseYaw + this.cameraAzimuthOffset;
    const forwardX = Math.sin(angle);
    const forwardZ = Math.cos(angle);
    const rightX = -forwardZ;
    const rightZ = forwardX;
    const worldDx = forwardX * (-v.dz) + rightX * v.dx;
    const worldDz = forwardZ * (-v.dz) + rightZ * v.dx;
    this.moveStep(worldDx, worldDz, dist * 0.55);
  }

  stepEntranceTour(dt) {
    if (!this.entranceTour?.active || this.inInterior || !this.entranceTour.posCurve) return;
    this.entranceTour.timer += dt;
    const rawU = Math.min(1, this.entranceTour.timer / this.entranceTour.duration);
    const u = rawU * rawU * (3 - 2 * rawU);
    this.entranceTour.posCurve.getPointAt(u, _tourPos);
    this.entranceTour.lookCurve.getPointAt(u, _tourLook);
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, _tourPos.x, 7.5, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, _tourPos.y, 7.5, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, _tourPos.z, 7.5, dt);
    this.camera.lookAt(_tourLook);
    if (rawU >= 1) {
      this.entranceTour.active = false;
      this.onEntranceTourChange(false);
      this.syncPlayerTransform();
    }
  }

  stepLotusBloom(dt) {
    const bloom = this.lotusBloomState;
    if (!bloom?.active) return;
    bloom.timer += dt;
    const p = Math.min(1, bloom.timer / bloom.duration);
    const pulse = Math.sin(p * Math.PI);
    const outerAngle = THREE.MathUtils.lerp(0.46, 1.18, pulse);
    const innerAngle = THREE.MathUtils.lerp(0.22, 0.72, pulse);
    const glowLevel = 0.05 + pulse * 1.15;
    const scaleFactor = 1.0 + pulse * 0.42;
    for (let i = 0; i < this.pondLotusAnims.length; i++) {
      const la = this.pondLotusAnims[i];
      la.group.scale.setScalar(la.baseScale * scaleFactor);
      la.petalMat.emissiveIntensity = glowLevel;
      la.innerMat.emissiveIntensity = glowLevel * 1.2;
      la.centerMat.emissiveIntensity = 0.14 + pulse * 1.1;
      for (let j = 0; j < la.outerPivots.length; j++) {
        la.outerPivots[j].rotation.x = outerAngle;
      }
      for (let j = 0; j < la.innerPivots.length; j++) {
        la.innerPivots[j].rotation.x = innerAngle;
      }
    }
    if (bloom.burstLight) {
      bloom.burstLight.intensity = pulse * 5.2;
    }
    if (bloom.burstRing) {
      bloom.burstRing.scale.setScalar(1.0 + p * 4.2);
      bloom.burstRing.material.opacity = (1 - p) * 0.85;
    }
    if (p >= 1) {
      bloom.active = false;
      if (bloom.burstLight) bloom.burstLight.intensity = 0;
      if (bloom.burstRing) bloom.burstRing.material.opacity = 0;
    }
  }

  updateProjectedPins() {
    const w = this.canvas.clientWidth || window.innerWidth || 1280;
    const h = this.canvas.clientHeight || window.innerHeight || 720;
    const focalKey = this.autoWalkStation?.key || 'chanh_dien';
    const focalSt =
      PILGRIMAGE_STATIONS.find((s) => s.key === focalKey) ||
      PILGRIMAGE_STATIONS.find((s) => s.key === 'chanh_dien');
    const projectedList = [];
    if (focalSt && !this.inInterior && !this.entranceTour?.active) {
      const tx = focalSt.key === 'chanh_dien' ? 23.0 : focalSt.lookAt?.x ?? focalSt.pos.x;
      const ty = focalSt.key === 'chanh_dien' ? 5.4 : (focalSt.lookAt?.y ?? 3.8) + 1.1;
      const tz = focalSt.key === 'chanh_dien' ? 8.4 : focalSt.lookAt?.z ?? focalSt.pos.z;
      const distToCam = Math.hypot(this.camera.position.x - tx, this.camera.position.z - tz);
      const showNearEntrance =
        focalSt.key !== 'chanh_dien' ||
        distToCam < 44 ||
        [0, 4, 5, 6].includes(this.currentStationId);
      if (showNearEntrance) {
        _projVec.set(tx, ty, tz);
        _projVec.project(this.camera);
        const visible =
          _projVec.z < 1 &&
          _projVec.z > -1 &&
          _projVec.x >= -0.92 &&
          _projVec.x <= 0.92 &&
          _projVec.y >= -0.9 &&
          _projVec.y <= 0.9;
        const px = (_projVec.x * 0.5 + 0.5) * w;
        const py = (-_projVec.y * 0.5 + 0.5) * h;
        projectedList.push({
          key: focalSt.key,
          visible,
          x: px,
          y: py,
          label: focalSt.pinLabel
        });
      }
    }
    this.onUpdateProjectedPins(projectedList);
  }

  stepSimulation(dt = 0.016) {
    const safeDt = Math.max(0.001, Math.min(Number(dt) || 0.016, 0.4));
    if (this.interiorTransition) {
      this.stepInteriorTransition(safeDt);
    } else {
      this.updateHeldMovement(safeDt);
      this.updateAutoWalk(safeDt);
    }
    this.stepArrivalCutscene(safeDt);
    this.stepEntranceTour(safeDt);
    this.stepLotusBloom(safeDt);
    this.stepRoadTraffic(safeDt);
    this.stepPilgrimageCompanions(safeDt);
    if (this.activePlayerRecord?.mixer) {
      this.activePlayerRecord.mixer.update(safeDt);
      this.updateProceduralPoseFallback(safeDt);
    }
    this.checkStationProximity();
  }

  spawnVisitorConvoyPassengers() {
    if (!this.charDataCache.nu || !this.charDataCache.nam) return;
    const convoyId = ++this.visitorGroupSequence;
    const visitors = [
      { charKey: 'nu', tint: [0.84, 0.70, 0.76], hat: true, bag: 'tui_sen', hand: 'hoa_sen', offset: -1.05, speed: 0.98 },
      { charKey: 'nam', tint: [0.54, 0.62, 0.72], scarf: true, hand: 'nhang', offset: -0.32, speed: 0.94 },
      { charKey: 'tre_em', tint: [0.92, 0.78, 0.62], offset: 0.36, speed: 1.08 },
      { charKey: 'nu', tint: [0.76, 0.82, 0.70], hat: true, bag: 'gio_may', hand: 'quat', offset: 1.08, speed: 0.92 }
    ];

    for (let i = 0; i < visitors.length; i++) {
      const spec = visitors[i];
      const height = CHAR_HEIGHTS[spec.charKey] || 1.64;
      const rec = this.cloneAnimatedCharacter(spec.charKey, height);
      if (!rec) continue;
      if (spec.tint) this.recolorPastelDress(rec.root, spec.tint);
      this.equipNpcProps(rec, spec.charKey, height, spec);

      const startX = 65.1 + (i % 2) * 0.28;
      const startZ = 50.6 + spec.offset;
      const zOffset = spec.offset;
      const pts = [
        { x: startX, z: startZ, action: 'pass', wait: 0, lookX: null, lookZ: null },
        // Step around the shuttle's front onto the pedestrian sidewalk before walking west.
        { x: startX, z: 46.2 + zOffset * 0.2, action: 'pass', wait: 0, lookX: null, lookZ: null },
        { x: 53.0, z: 46.2 + zOffset * 0.2, action: 'pass', wait: 0, lookX: null, lookZ: null },
        { x: 42.0, z: 47.0 + zOffset * 0.42, action: 'pass', wait: 0, lookX: null, lookZ: null },
        { x: 41.0, z: 41.5 + zOffset * 0.25, action: 'pass', wait: 0, lookX: null, lookZ: null },
        { x: 38.6, z: 34.2 + zOffset * 0.16, action: 'pass', wait: 0, lookX: null, lookZ: null },
        { x: 36.1, z: 23.5 + zOffset * 0.12, action: 'dung', wait: 3.2, lookX: 32.5, lookZ: 22.5 }
      ];
      const first = pts[0];
      const next = pts[1];
      const yaw = Math.atan2(next.x - first.x, next.z - first.z);
      rec.root.position.set(startX, rec.baseY, startZ);
      rec.root.rotation.y = yaw;
      this.playClipCrossfade(rec, 'Dung', 0.12, false);
      this.exteriorGroup.add(rec.root);
      this.riggedNpcRecords.push({
        rec,
        pts,
        idx: 1,
        speed: spec.speed,
        pauseTimer: 0.75 + i * 0.34,
        yaw,
        state: 'Dung',
        pauseClip: 'Dung',
        lookX: null,
        lookZ: null,
        temporary: true,
        removeAfterPause: false,
        convoyId
      });
    }
  }

  disposeRoadTrafficVehicle(vehicle) {
    if (!vehicle?.group) return;
    this.exteriorGroup.remove(vehicle.group);
    vehicle.group.traverse((obj) => {
      if (obj.isMesh && obj.geometry) obj.geometry.dispose();
    });
    for (const material of vehicle.group.userData.ownedMaterials || []) {
      material.dispose();
    }
  }

  stepRoadTraffic(dt = 0.016) {
    if (!this.trafficVehicleRecords) return;

    // Light local traffic: usually one vehicle, occasionally a pair with a natural following gap.
    this.trafficSpawnTimer -= dt;
    if (this.trafficSpawnTimer <= 0) {
      // Keep the shuttle's lane clear while it approaches or leaves the drop-off.
      const direction = this.activeVisitorShuttle ? 1 : (Math.random() < 0.5 ? 1 : -1);
      const count = Math.random() < 0.24 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const kindRoll = Math.random();
        const kind = kindRoll < 0.48 ? 'bike' : kindRoll < 0.9 ? 'sedan' : 'van';
        this.trafficSpawnQueue.push({
          wait: i === 0 ? 0 : 2.2 + Math.random() * 1.0,
          direction,
          kind
        });
      }
      this.trafficSpawnTimer = 25 + Math.random() * 28;
    }

    for (let i = this.trafficSpawnQueue.length - 1; i >= 0; i--) {
      const queued = this.trafficSpawnQueue[i];
      queued.wait -= dt;
      if (queued.wait > 0) continue;
      const direction = this.activeVisitorShuttle ? 1 : queued.direction;
      const kind = queued.kind;
      const colors = kind === 'bike'
        ? [0x9C2C26, 0x254E8A, 0x3D434A, 0xB89342, 0xE6E1D6]
        : [0xD2D8D9, 0xAEB9C1, 0x6E7D88, 0xB7A58B, 0xF0EEE8];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const laneZ = direction > 0 ? 55.25 : 59.75;
      const startX = direction > 0 ? -114 : 134;
      const speed = kind === 'bike'
        ? 5.8 + Math.random() * 1.45
        : 6.4 + Math.random() * 1.55;
      const record = this.spawnRoadTrafficVehicle({
        kind, x: startX, z: laneZ, direction, speed, color
      });
      this.trafficVehicleRecords.push(record);
      this.trafficSpawnQueue.splice(i, 1);
    }

    // A small passenger shuttle arrives only occasionally, pauses at the pull-in, then leaves.
    this.visitorConvoyTimer -= dt;
    if (
      this.visitorConvoyTimer <= 0 &&
      !this.activeVisitorShuttle &&
      !this.inInterior &&
      this.charDataCache.nu &&
      this.charDataCache.nam
    ) {
      const group = this.spawnRoadTrafficVehicle({
        kind: 'van',
        x: 138,
        z: 59.6,
        direction: -1,
        speed: 6.0,
        color: 0xD9DEE0
      });
      group.kind = 'visitor_shuttle';
      group.state = 'arriving';
      group.path = [{ x: 63.0, z: 59.6 }, { x: 63.0, z: 50.6 }];
      group.pathIndex = 0;
      group.dwellTimer = 0;
      this.activeVisitorShuttle = group;
      this.trafficVehicleRecords.push(group);
      this.visitorConvoyTimer = 92 + Math.random() * 48;
    }

    for (let i = this.trafficVehicleRecords.length - 1; i >= 0; i--) {
      const vehicle = this.trafficVehicleRecords[i];
      const pos = vehicle.group.position;

      if (vehicle.state === 'arriving' || vehicle.state === 'departing') {
        const target = vehicle.path[vehicle.pathIndex];
        const dx = target.x - pos.x;
        const dz = target.z - pos.z;
        const distance = Math.hypot(dx, dz);
        if (distance < 0.38) {
          if (vehicle.pathIndex < vehicle.path.length - 1) {
            vehicle.pathIndex += 1;
          } else if (vehicle.state === 'arriving') {
            vehicle.state = 'parked';
            vehicle.dwellTimer = 7.5;
            this.spawnVisitorConvoyPassengers();
          } else {
            this.disposeRoadTrafficVehicle(vehicle);
            this.trafficVehicleRecords.splice(i, 1);
            this.activeVisitorShuttle = null;
            continue;
          }
        } else {
          const dirX = dx / distance;
          const dirZ = dz / distance;
          const step = Math.min(distance, vehicle.speed * dt);
          pos.x += dirX * step;
          pos.z += dirZ * step;
          const targetYaw = Math.atan2(dirX, dirZ);
          vehicle.group.rotation.y = this.lerpAngle(vehicle.group.rotation.y, targetYaw, Math.min(1, dt * 3.8));
        }
      } else if (vehicle.state === 'parked') {
        vehicle.dwellTimer -= dt;
        if (vehicle.dwellTimer <= 0) {
          vehicle.state = 'departing';
          vehicle.path = [{ x: 63.0, z: 59.6 }, { x: 138, z: 59.6 }];
          vehicle.pathIndex = 0;
          vehicle.speed = 6.8;
        }
      } else {
        pos.x += vehicle.direction * vehicle.speed * dt;
        if ((vehicle.direction > 0 && pos.x > 132) || (vehicle.direction < 0 && pos.x < -112)) {
          this.disposeRoadTrafficVehicle(vehicle);
          this.trafficVehicleRecords.splice(i, 1);
          continue;
        }
      }

      if (vehicle.state !== 'parked') {
        for (const wheel of vehicle.wheelGroups || []) {
          wheel.rotation.x -= (vehicle.speed * dt) / Math.max(0.1, vehicle.wheelRadius);
        }
      }
    }
  }

  renderFrame() {
    this.updateProjectedPins();
    const gl = this.renderer?.getContext?.();
    if (this.contextLost || !gl || gl.isContextLost?.()) return;
    try {
      this.renderer.render(this.scene, this.camera);
    } catch {}
  }

  initTexturesAndMaterials() {
    // 1. Weathered Courtyard Stone Slabs with damp mortar crevices, subtle moss & blossom flecks
    this.pavingTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#BFB5A0';
        g.fillRect(0, 0, w, h);
        const step = 64;
        for (let y = 0; y < h; y += step) {
          for (let x = 0; x < w; x += step) {
            const seed = ((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1 + 1) % 1;
            const v = seed * 22 - 11;
            const warm = ((Math.sin(x * 3.7 + y * 9.1) * 19231.4) % 1 + 1) % 1;
            g.fillStyle = `rgb(${Math.round(202 + v + warm * 6)}, ${Math.round(191 + v)}, ${Math.round(170 + v - warm * 5)})`;
            g.fillRect(x + 2, y + 2, step - 4, step - 4);
            g.fillStyle = seed > 0.55 ? 'rgba(255,248,232,0.12)' : 'rgba(92,78,56,0.08)';
            g.fillRect(x + 6, y + 8, step - 14, step - 18);
          }
        }
        g.strokeStyle = 'rgba(96, 86, 68, 0.44)';
        g.lineWidth = 2.4;
        for (let i = 0; i <= w; i += step) {
          g.beginPath();
          g.moveTo(i, 0);
          g.lineTo(i, h);
          g.stroke();
          g.beginPath();
          g.moveTo(0, i);
          g.lineTo(w, i);
          g.stroke();
        }
        // Tropical moss specks along stone joints + scattered soil grit
        for (let i = 0; i < 260; i++) {
          const sx = (i * 73) % w;
          const sy = (i * 137) % h;
          g.fillStyle = i % 5 === 0 ? 'rgba(84,116,54,0.22)' : 'rgba(105,84,58,0.14)';
          g.beginPath();
          g.arc(sx, sy, 1.5 + (i % 4), 0, Math.PI * 2);
          g.fill();
        }
      },
      512,
      512,
      20,
      20
    );

    // 1b. Southern Terracotta Brick Pavers for Bougainvillea Side Path & Cổng Phụ apron
    this.sideBrickTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#9C5C3E';
        g.fillRect(0, 0, w, h);
        const bw = 64;
        const bh = 32;
        for (let row = 0; row < h / bh; row++) {
          const offset = (row % 2) * (bw / 2);
          for (let col = -1; col <= w / bw; col++) {
            const x = col * bw + offset;
            const y = row * bh;
            const seed = ((Math.sin(x * 9.3 + y * 27.1) * 29431.7) % 1 + 1) % 1;
            const d = Math.round(seed * 26 - 13);
            g.fillStyle = `rgb(${182 + d}, ${106 + Math.round(d * 0.7)}, ${72 + Math.round(d * 0.5)})`;
            g.fillRect(x + 2, y + 2, bw - 4, bh - 4);
            g.fillStyle = 'rgba(255,232,198,0.1)';
            g.fillRect(x + 5, y + 4, bw - 14, 6);
          }
        }
        // Fallen pink bougainvillea petal specks + moss seams
        for (let i = 0; i < 140; i++) {
          g.fillStyle = i % 3 === 0 ? 'rgba(234, 114, 166, 0.34)' : 'rgba(78, 102, 48, 0.2)';
          g.beginPath();
          g.ellipse((i * 89) % w, (i * 53) % h, 3, 2, i, 0, Math.PI * 2);
          g.fill();
        }
      },
      512,
      512,
      8,
      26
    );

    // 1c. Rustic Mekong Unpaved Dirt Road & Shoulders ("Mặt đường đất miền Tây" — organic pseudo-random clay, laterite grit & grassy edges)
    this.dirtRoadTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#8C6E4D';
        g.fillRect(0, 0, w, h);
        const hash = (n) => ((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1;
        // Soft organic earth mottling patches using hashed pseudo-random positions (no repeating dot rows)
        for (let i = 0; i < 420; i++) {
          const x = hash(i * 3.1) * w;
          const y = hash(i * 7.3) * h;
          const rx = 14 + hash(i * 11.7) * 34;
          const ry = 10 + hash(i * 5.9) * 24;
          const rot = hash(i * 13.3) * Math.PI;
          const pick = i % 4;
          g.fillStyle =
            pick === 0
              ? 'rgba(112, 82, 52, 0.16)'
              : pick === 1
                ? 'rgba(166, 136, 94, 0.15)'
                : pick === 2
                  ? 'rgba(86, 65, 42, 0.14)'
                  : 'rgba(104, 124, 60, 0.11)';
          g.beginPath();
          g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
          g.fill();
        }
        // Subtle organic compacted wheel paths + scattered laterite grit & wild grass wisps
        g.fillStyle = 'rgba(72, 53, 34, 0.11)';
        g.fillRect(0, h * 0.24, w, h * 0.14);
        g.fillRect(0, h * 0.62, w, h * 0.14);
        for (let i = 0; i < 1800; i++) {
          const px = hash(i * 17.9 + 1.2) * w;
          const py = hash(i * 23.1 + 4.5) * h;
          const r = hash(i * 29.7);
          g.fillStyle = r > 0.91 ? '#5D803B' : r > 0.62 ? '#AC8E68' : r > 0.3 ? '#654C32' : '#7A5D3E';
          g.fillRect(px, py, r > 0.91 ? 3 : 1.8, r > 0.91 ? 2 : 1.8);
        }
      },
      512,
      512,
      1,
      1
    );

    // 1d. Weathered Mekong Country Asphalt Road (Đường Nguyễn Trung Trực)
    this.asphaltTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#4B4F55';
        g.fillRect(0, 0, w, h);
        for (let i = 0; i < 1100; i++) {
          const v = 58 + ((i * 29) % 34);
          g.fillStyle = `rgb(${v},${v + 1},${v + 3})`;
          g.fillRect((i * 71) % w, (i * 131) % h, 2 + (i % 3), 2);
        }
        // Sunlit worn tire wheel-paths + dusty red-brown Mekong edge grime
        g.fillStyle = 'rgba(98, 102, 108, 0.28)';
        g.fillRect(0, h * 0.22, w, h * 0.16);
        g.fillRect(0, h * 0.62, w, h * 0.16);
        const edgeGradTop = g.createLinearGradient(0, 0, 0, h * 0.14);
        edgeGradTop.addColorStop(0, 'rgba(136, 108, 74, 0.72)');
        edgeGradTop.addColorStop(1, 'rgba(136, 108, 74, 0)');
        g.fillStyle = edgeGradTop;
        g.fillRect(0, 0, w, h * 0.14);
        const edgeGradBot = g.createLinearGradient(0, h * 0.86, 0, h);
        edgeGradBot.addColorStop(0, 'rgba(136, 108, 74, 0)');
        edgeGradBot.addColorStop(1, 'rgba(136, 108, 74, 0.72)');
        g.fillStyle = edgeGradBot;
        g.fillRect(0, h * 0.86, w, h * 0.14);
        // Hairline weathered cracks
        g.strokeStyle = 'rgba(30, 32, 36, 0.45)';
        g.lineWidth = 1.6;
        for (let k = 0; k < 10; k++) {
          g.beginPath();
          let cx = (k * 92) % w;
          let cy = 40 + ((k * 47) % (h - 80));
          g.moveTo(cx, cy);
          for (let s = 0; s < 5; s++) {
            cx += 14;
            cy += (s % 2 === 0 ? 1 : -1) * (4 + (k % 5));
            g.lineTo(cx, cy);
          }
          g.stroke();
        }
      },
      512,
      512,
      18,
      1
    );

    // 1e. Mekong Alluvial Soil & Tropical Wild Grass Texture (Surrounding Countryside)
    this.mekongEarthTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#4B6933';
        g.fillRect(0, 0, w, h);
        for (let i = 0; i < 420; i++) {
          const x = (i * 83) % w;
          const y = (i * 149) % h;
          const r = 10 + (i % 26);
          if (i % 4 === 0) g.fillStyle = 'rgba(104, 80, 52, 0.34)'; // alluvial brown soil patch
          else if (i % 4 === 1) g.fillStyle = 'rgba(92, 128, 56, 0.34)'; // sunlit grass
          else if (i % 4 === 2) g.fillStyle = 'rgba(54, 82, 36, 0.38)'; // deep damp grass
          else g.fillStyle = 'rgba(128, 106, 68, 0.22)'; // dry grass & earth
          g.beginPath();
          g.ellipse(x, y, r * 1.3, r * 0.85, i * 0.4, 0, Math.PI * 2);
          g.fill();
        }
        for (let i = 0; i < 600; i++) {
          g.fillStyle = i % 3 === 0 ? 'rgba(155, 178, 86, 0.25)' : 'rgba(62, 48, 30, 0.22)';
          g.fillRect((i * 59) % w, (i * 101) % h, 3, 2);
        }
      },
      512,
      512,
      24,
      24
    );

    // 1f. Corrugated Ribbed Metal Roof ("Mái tôn nhà dân miền Tây")
    this.tinRoofTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#D4D9DF';
        g.fillRect(0, 0, w, h);
        for (let x = 0; x < w; x += 12) {
          g.fillStyle = 'rgba(255,255,255,0.22)';
          g.fillRect(x, 0, 5, h);
          g.fillStyle = 'rgba(30,36,42,0.28)';
          g.fillRect(x + 6, 0, 5, h);
        }
        // Subtle tropical rust weathering
        for (let i = 0; i < 36; i++) {
          g.fillStyle = 'rgba(146, 82, 44, 0.14)';
          g.fillRect((i * 47) % w, (i * 31) % h, 14, 24);
        }
      },
      256,
      256,
      5,
      2
    );

    // 2. Yin-Yang Terracotta Roof Tiles (OKLCH warm clay tiles — never muddy or black)
    const tileLight = shiftOklch(VINH_TRANG_OKLCH_PALETTE.terracottaTile, 0.12, 1.08, 4);
    const tileMid = shiftOklch(VINH_TRANG_OKLCH_PALETTE.terracottaTile, 0.04, 1.02, 1);
    const tileGroove = shiftOklch(VINH_TRANG_OKLCH_PALETTE.terracottaTile, -0.09, 0.92, -4);
    this.roofTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = tileMid;
        g.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 24) {
          g.fillStyle = y % 48 === 0 ? tileLight : tileMid;
          g.fillRect(0, y, w, 20);
          g.fillStyle = tileGroove;
          g.fillRect(0, y + 20, w, 4);
        }
        for (let x = 0; x < w; x += 28) {
          g.fillStyle = 'rgba(255,222,195,0.16)';
          g.fillRect(x + 4, 0, 8, h);
          g.strokeStyle = 'rgba(65,24,14,0.34)';
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(x, 0);
          g.lineTo(x, h);
          g.stroke();
        }
        g.fillStyle = 'rgba(72, 102, 52, 0.14)';
        for (let i = 0; i < 16; i++) {
          g.beginPath();
          g.arc((i * 53) % w, (i * 41) % h, 9 + (i % 6), 0, Math.PI * 2);
          g.fill();
        }
      },
      256,
      256,
      10,
      4
    );

    // 3. Sunlit Aged Lime-Plaster Texture with subtle tropical humidity patina
    this.limeWallTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#F5E3B8';
        g.fillRect(0, 0, w, h);
        for (let i = 0; i < 200; i++) {
          const x = (i * 79) % w;
          const y = (i * 43) % h;
          g.fillStyle = i % 2 === 0 ? 'rgba(255,250,236,0.18)' : 'rgba(182,146,78,0.1)';
          g.beginPath();
          g.arc(x, y, 16 + (i % 22), 0, Math.PI * 2);
          g.fill();
        }
        const dampGrad = g.createLinearGradient(0, h * 0.72, 0, h);
        dampGrad.addColorStop(0, 'rgba(98, 92, 68, 0)');
        dampGrad.addColorStop(1, 'rgba(98, 92, 68, 0.16)');
        g.fillStyle = dampGrad;
        g.fillRect(0, h * 0.72, w, h * 0.28);
      },
      256,
      256,
      4,
      2
    );

    // 4. Weathered Statue Stone Bump Texture (PROMPT_ARGON_CHAT_LIEU #1)
    this.stoneBumpTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#808080';
        g.fillRect(0, 0, w, h);
        for (let i = 0; i < 600; i++) {
          const v = 110 + ((i * 29) % 36);
          g.fillStyle = `rgb(${v},${v},${v})`;
          g.fillRect((i * 47) % w, (i * 83) % h, 3, 3);
        }
      },
      256,
      256,
      6,
      6,
      false
    );

    // 5. Vertical Wood Grain Texture (PROMPT_ARGON_CHAT_LIEU #3)
    this.woodGrainTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#5A3D26';
        g.fillRect(0, 0, w, h);
        for (let x = 0; x < w; x += 4) {
          g.fillStyle = x % 8 === 0 ? 'rgba(40,22,10,0.22)' : 'rgba(120,82,48,0.16)';
          g.fillRect(x, 0, 2, h);
        }
      },
      256,
      256,
      2,
      2
    );

    // 6. Rippled Emerald-Teal Lotus Pond Texture & Botanical Leaf Vein Texture
    this.waterTex = makeCanvasTex(
      (g, w, h) => {
        const grd = g.createRadialGradient(w / 2, h / 2, 16, w / 2, h / 2, w * 0.7);
        grd.addColorStop(0, '#3D8274');
        grd.addColorStop(0.55, '#2A675C');
        grd.addColorStop(1, '#1B4942');
        g.fillStyle = grd;
        g.fillRect(0, 0, w, h);
        g.strokeStyle = 'rgba(205, 244, 232, 0.22)';
        g.lineWidth = 1.6;
        for (let i = 0; i < 34; i++) {
          g.beginPath();
          g.arc((i * 67) % w, (i * 53) % h, 10 + (i % 20), 0, Math.PI * 2);
          g.stroke();
        }
      },
      256,
      256,
      3,
      3
    );

    // 7. Terracotta Red "Gạch Tàu" Interior Floor Tiles (Image 2 & 3 reference)
    this.gachTauTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#8F3824';
        g.fillRect(0, 0, w, h);
        const step = 64;
        for (let y = 0; y < h; y += step) {
          for (let x = 0; x < w; x += step) {
            const seed = ((Math.sin(x * 17.3 + y * 43.1) * 43758.54) % 1 + 1) % 1;
            const d = Math.round(seed * 18 - 9);
            g.fillStyle = `rgb(${156 + d}, ${63 + Math.round(d * 0.5)}, ${41 + Math.round(d * 0.4)})`;
            g.fillRect(x + 2, y + 2, step - 4, step - 4);
            g.fillStyle = 'rgba(255, 208, 168, 0.08)';
            g.fillRect(x + 6, y + 6, step - 20, step - 24);
          }
        }
        g.strokeStyle = 'rgba(42, 18, 12, 0.58)';
        g.lineWidth = 3;
        for (let i = 0; i <= w; i += step) {
          g.beginPath();
          g.moveTo(i, 0);
          g.lineTo(i, h);
          g.stroke();
          g.beginPath();
          g.moveTo(0, i);
          g.lineTo(w, i);
          g.stroke();
        }
      },
      512,
      512,
      8,
      12
    );

    // 8. Botanical Lily Pad Texture with Radial Veins
    this.lotusPadTex = makeCanvasTex(
      (g, w, h) => {
        const grd = g.createRadialGradient(w / 2, h / 2, 8, w / 2, h / 2, w * 0.5);
        grd.addColorStop(0, '#5FA048');
        grd.addColorStop(0.65, '#3E7A34');
        grd.addColorStop(1, '#2B5B25');
        g.fillStyle = grd;
        g.fillRect(0, 0, w, h);
        g.strokeStyle = 'rgba(182, 224, 122, 0.38)';
        g.lineWidth = 2;
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          g.beginPath();
          g.moveTo(w / 2, h / 2);
          g.lineTo(w / 2 + Math.cos(a) * w * 0.48, h / 2 + Math.sin(a) * h * 0.48);
          g.stroke();
        }
      },
      256,
      256,
      1,
      1
    );

    // Perceptually uniform OKLCH foliage textures (meodai/skill.color-expert: warm sunlit shift + cool sky-bounce shade)
    this.leafTexA = this.makeLeafTexture(
      '#4E7A3E',
      shiftOklch('#4E7A3E', 0.11, 1.08, -6),
      shiftOklch('#4E7A3E', -0.11, 0.92, 8)
    );
    this.leafTexB = this.makeLeafTexture(
      VINH_TRANG_OKLCH_PALETTE.jadeFoliageDeep,
      shiftOklch(VINH_TRANG_OKLCH_PALETTE.jadeFoliageDeep, 0.12, 1.08, -6),
      shiftOklch(VINH_TRANG_OKLCH_PALETTE.jadeFoliageDeep, -0.1, 0.92, 8)
    );
    this.leafTexC = this.makeLeafTexture(
      VINH_TRANG_OKLCH_PALETTE.jadeFoliageSun,
      shiftOklch(VINH_TRANG_OKLCH_PALETTE.jadeFoliageSun, 0.11, 1.06, -5),
      shiftOklch(VINH_TRANG_OKLCH_PALETTE.jadeFoliageSun, -0.11, 0.94, 7)
    );
    this.flagTex72 = this.makeBuddhistFlagTexture();

    this.MAT = {
      goldWall: new THREE.MeshStandardMaterial({
        color: 0xECC56A,
        map: this.limeWallTex,
        bumpMap: this.stoneBumpTex,
        bumpScale: 0.012,
        roughness: 0.56
      }),
      goldLight: new THREE.MeshStandardMaterial({
        color: 0xF5D98C,
        map: this.limeWallTex,
        roughness: 0.5
      }),
      goldAccent: new THREE.MeshStandardMaterial({
        color: 0xD8A436,
        metalness: 0.58,
        roughness: 0.28
      }),
      creamTrim: new THREE.MeshStandardMaterial({
        color: 0xF2ECE0,
        bumpMap: this.stoneBumpTex,
        bumpScale: 0.01,
        roughness: 0.65
      }),
      redColumn: new THREE.MeshStandardMaterial({
        color: 0x862820,
        roughness: 0.42,
        metalness: 0.08
      }),
      darkWood: new THREE.MeshStandardMaterial({
        color: 0x5A3D26,
        map: this.woodGrainTex,
        roughness: 0.65
      }),
      darkOpening: new THREE.MeshStandardMaterial({ color: 0x221712, roughness: 0.88 }),
      roofTile: new THREE.MeshStandardMaterial({
        map: this.roofTex,
        bumpMap: this.roofTex,
        bumpScale: 0.016,
        roughness: 0.62
      }),
      statueWhite: new THREE.MeshStandardMaterial({
        color: 0xEFE9DD,
        bumpMap: this.stoneBumpTex,
        bumpScale: 0.02,
        roughness: 0.78,
        metalness: 0.0
      }),
      lotusBlue: new THREE.MeshStandardMaterial({ color: 0x4E86A8, roughness: 0.5 }),
      pedestalRed: new THREE.MeshStandardMaterial({ color: 0x8A4A3A, roughness: 0.62 }),
      stoneDark: new THREE.MeshStandardMaterial({
        color: 0x6E675C,
        bumpMap: this.stoneBumpTex,
        bumpScale: 0.025,
        roughness: 0.84
      }),
      stoneLight: new THREE.MeshStandardMaterial({
        color: 0xA89E8E,
        bumpMap: this.stoneBumpTex,
        bumpScale: 0.02,
        roughness: 0.78
      }),
      stupaBody: new THREE.MeshStandardMaterial({
        color: 0xD2924E,
        map: this.limeWallTex,
        roughness: 0.6
      }),
      stupaRoof: new THREE.MeshStandardMaterial({
        color: 0xA85A38,
        map: this.roofTex,
        roughness: 0.64
      }),
      mosaicBlue: new THREE.MeshStandardMaterial({
        color: 0x2C4A8A,
        roughness: 0.3,
        metalness: 0.18
      }),
      mosaicGreen: new THREE.MeshStandardMaterial({
        color: 0x3F7D5D,
        roughness: 0.3,
        metalness: 0.18
      }),
      mosaicRed: new THREE.MeshStandardMaterial({
        color: 0xA83828,
        roughness: 0.36,
        metalness: 0.12
      }),
      terracottaPot: new THREE.MeshStandardMaterial({ color: 0xA45236, roughness: 0.68 }),
      trunk: new THREE.MeshStandardMaterial({
        color: 0x5A402C,
        map: this.woodGrainTex,
        roughness: 0.88
      }),
      foliageDark: new THREE.MeshStandardMaterial({
        color: 0x3E6B34,
        map: this.leafTexB,
        roughness: 0.8,
        bumpMap: this.leafTexB,
        bumpScale: 0.08
      }),
      foliageMid: new THREE.MeshStandardMaterial({
        color: 0x4E7A3E,
        map: this.leafTexA,
        roughness: 0.78,
        bumpMap: this.leafTexA,
        bumpScale: 0.08
      }),
      foliageLight: new THREE.MeshStandardMaterial({
        color: 0x5C8446,
        map: this.leafTexC,
        roughness: 0.75,
        bumpMap: this.leafTexC,
        bumpScale: 0.08
      }),
      bougainvilleaPink: new THREE.MeshStandardMaterial({ color: 0xF078AA, roughness: 0.58 }),
      bougainvilleaRed: new THREE.MeshStandardMaterial({ color: 0xD94F3D, roughness: 0.6 }),
      marigold: new THREE.MeshStandardMaterial({ color: 0xF0AE2E, roughness: 0.6 }),
      lotusLeaf: new THREE.MeshStandardMaterial({ color: 0x3E6E36, roughness: 0.72 }),
      pondWater: new THREE.MeshStandardMaterial({
        map: this.waterTex,
        color: 0x5C8568,
        roughness: 0.18,
        metalness: 0.38
      }),
      bronzeBurner: new THREE.MeshStandardMaterial({
        color: 0x487A5E,
        roughness: 0.38,
        metalness: 0.62
      }),
      lanternGlow: new THREE.MeshStandardMaterial({
        color: 0xFFE8AD,
        emissive: 0xFFB84D,
        emissiveIntensity: 0.92
      })
    };
  }

  makeLeafTexture(baseHex, lightHex, darkHex) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    g.fillStyle = baseHex;
    g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 220; i++) {
      const r = Math.random();
      g.fillStyle = r < 0.45 ? lightHex : r < 0.82 ? baseHex : darkHex;
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      g.beginPath();
      g.ellipse(
        x,
        y,
        3 + Math.random() * 4,
        2 + Math.random() * 3,
        Math.random() * Math.PI,
        0,
        Math.PI * 2
      );
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  makeBuddhistFlagTexture() {
    const c = document.createElement('canvas');
    c.width = 120;
    c.height = 80;
    const g = c.getContext('2d');
    const cols = ['#1E4FA3', '#F2C12E', '#C9382B', '#F5F2EB', '#E87425'];
    for (let i = 0; i < 5; i++) {
      g.fillStyle = cols[i];
      g.fillRect(i * 20, 0, 20, 80);
    }
    for (let i = 0; i < 5; i++) {
      g.fillStyle = cols[i];
      g.fillRect(100, i * 16, 20, 16);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  initLights() {
    // Cool sky bounce vs. warm alluvial earth bounce (threejs/SKILL.md warm/cool contrast)
    const hemi = new THREE.HemisphereLight(0xBFE2FF, 0x7A5E3E, 1.18);
    this.scene.add(hemi);
    this.hemiLight = hemi;

    // Warm 7:30 AM Mekong morning pilgrimage key sun
    const sun = new THREE.DirectionalLight(0xFFD99E, 1.82);
    sun.position.set(-34, 24, 24);
    sun.castShadow = !this.isSoftwareGl;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -65;
    sun.shadow.camera.right = 65;
    sun.shadow.camera.top = 65;
    sun.shadow.camera.bottom = -65;
    sun.shadow.camera.near = 5;
    sun.shadow.camera.far = 150;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    this.scene.add(sun);
    this.sunLight = sun;

    const frontFill = new THREE.DirectionalLight(0xFFF3D8, 0.48);
    frontFill.position.set(28, 22, 54);
    this.scene.add(frontFill);
    this.frontFillLight = frontFill;
  }

  _buildSkyTextureForPreset(presetKey = 'morning') {
    if (!this.skyTextures) this.skyTextures = {};
    if (this.skyTextures[presetKey]) return this.skyTextures[presetKey];

    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 1024;
    skyCanvas.height = 512;
    const sctx = skyCanvas.getContext('2d');
    const grad = sctx.createLinearGradient(0, 0, 0, 512);

    if (presetKey === 'evening') {
      grad.addColorStop(0.0, '#09132B');
      grad.addColorStop(0.38, '#172C59');
      grad.addColorStop(0.68, '#38466E');
      grad.addColorStop(0.88, '#6B5561');
      grad.addColorStop(1.0, '#2A2738');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 1024, 512);
      // Soft twilight stars in upper sky dome
      for (let i = 0; i < 160; i++) {
        const sx = (i * 197 + 41) % 1024;
        const sy = (i * 89 + 17) % 240;
        const r = i % 5 === 0 ? 1.8 : 1.0;
        sctx.fillStyle = i % 7 === 0 ? 'rgba(255,232,175,0.88)' : 'rgba(235,244,255,0.72)';
        sctx.beginPath();
        sctx.arc(sx, sy, r, 0, Math.PI * 2);
        sctx.fill();
      }
      // Subtle warm evening cloud wisps
      for (let i = 0; i < 24; i++) {
        const cx = ((i * 137) % 960) + 32;
        const cy = 240 + (i % 5) * 24;
        sctx.fillStyle = 'rgba(130, 108, 128, 0.28)';
        sctx.beginPath();
        sctx.ellipse(cx, cy, 48, 13, 0, 0, Math.PI * 2);
        sctx.fill();
      }
      sctx.fillStyle = 'rgba(22, 34, 42, 0.6)';
    } else if (presetKey === 'midday') {
      grad.addColorStop(0.0, '#1D74DC');
      grad.addColorStop(0.36, '#6CB8F4');
      grad.addColorStop(0.68, '#CBE6FA');
      grad.addColorStop(0.88, '#EFE9DB');
      grad.addColorStop(1.0, '#E1DACB');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 1024, 512);
      for (let i = 0; i < 32; i++) {
        const cx = ((i * 119) % 980) + 22;
        const cy = 110 + (i % 6) * 26;
        const scale = 0.8 + (i % 4) * 0.35;
        sctx.fillStyle = 'rgba(255,255,255,0.72)';
        for (let j = 0; j < 4; j++) {
          sctx.beginPath();
          sctx.ellipse(cx + (j - 1.5) * 22 * scale, cy + (j % 2 ? 4 : -4), 26 * scale, 12 * scale, 0, 0, Math.PI * 2);
          sctx.fill();
        }
      }
      sctx.fillStyle = 'rgba(116, 148, 112, 0.34)';
    } else {
      grad.addColorStop(0.0, '#4D93D9');
      grad.addColorStop(0.32, '#98CBEF');
      grad.addColorStop(0.62, '#D7E8F3');
      grad.addColorStop(0.84, '#F3DFC2');
      grad.addColorStop(1.0, '#E5D6BC');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 1024, 512);
      // Warm morning sunlit cumulus wisps & gentle horizon mist bands
      for (let i = 0; i < 38; i++) {
        const cx = ((i * 107) % 980) + 22;
        const cy = 120 + (i % 6) * 26;
        const scale = 0.85 + (i % 4) * 0.35;
        sctx.fillStyle = i % 2 === 0 ? 'rgba(255,248,232,0.68)' : 'rgba(252,238,215,0.48)';
        for (let j = 0; j < 5; j++) {
          sctx.beginPath();
          sctx.ellipse(
            cx + (j - 2) * 22 * scale,
            cy + (j % 2 === 0 ? -4 : 6) * scale,
            (28 - Math.abs(j - 2) * 4) * scale,
            (14 - Math.abs(j - 2) * 2) * scale,
            0,
            0,
            Math.PI * 2
          );
          sctx.fill();
        }
      }
      sctx.fillStyle = 'rgba(138, 162, 126, 0.34)';
    }

    for (let x = 0; x < 1024; x += 18) {
      const h = 10 + ((x * 37) % 16);
      sctx.beginPath();
      sctx.arc(x, 456, h, Math.PI, 0);
      sctx.fill();
    }

    const skyTex = new THREE.CanvasTexture(skyCanvas);
    skyTex.colorSpace = THREE.SRGBColorSpace;
    this.skyTextures[presetKey] = skyTex;
    return skyTex;
  }

  buildSkyDomeAndMountains() {
    // Morning Pilgrimage Sky (7:30 AM Mỹ Tho / Mekong Delta — golden-mist horizon fading to clear cerulean)
    const skyTex = this._buildSkyTextureForPreset('morning');
    const skyDome = new THREE.Mesh(
      new THREE.SphereGeometry(260, 36, 20),
      new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })
    );
    this.skyDome = skyDome;
    this.scene.add(skyDome);

    const M = this.MAT;
    const extGround = new THREE.Mesh(
      new THREE.PlaneGeometry(360, 360),
      new THREE.MeshStandardMaterial({ map: this.mekongEarthTex, color: 0xffffff, roughness: 0.96 })
    );
    extGround.rotation.x = -Math.PI / 2;
    extGround.position.y = -0.09;
    extGround.receiveShadow = true;
    this.exteriorGroup.add(extGround);

    // Rustic Mekong Delta Country Houses ("Nhà cấp 4 mái tôn miền Tây" — veranda columns, bạt che nắng & lu nước mưa)
    const tinRoofColors = [0x336791, 0x924438, 0x7F8891, 0x2F7064];
    const roofMaterials = tinRoofColors.map(
      (col) => new THREE.MeshStandardMaterial({ map: this.tinRoofTex, color: col, roughness: 0.56, metalness: 0.22 })
    );
    const wallPalette = [0xEFE4CC, 0xDCE6E8, 0xF0DEC4, 0xE1E5D2, 0xEADBC4];
    const woodPostMat = new THREE.MeshStandardMaterial({ map: this.woodGrainTex, color: 0x6A482E, roughness: 0.78 });
    const shutterMat = new THREE.MeshStandardMaterial({ color: 0x2E624A, roughness: 0.68 });
    const zincMat = new THREE.MeshStandardMaterial({ color: 0xC2C8CE, roughness: 0.42, metalness: 0.48 });

    const awningCanvas = document.createElement('canvas');
    awningCanvas.width = 128;
    awningCanvas.height = 64;
    const actx = awningCanvas.getContext('2d');
    for (let x = 0; x < 128; x += 16) {
      actx.fillStyle = (x / 16) % 2 === 0 ? '#2C639E' : '#F4EEE0';
      actx.fillRect(x, 0, 16, 64);
    }
    const stripedAwningTex = new THREE.CanvasTexture(awningCanvas);
    stripedAwningTex.colorSpace = THREE.SRGBColorSpace;
    const stripedAwningMat = new THREE.MeshStandardMaterial({ map: stripedAwningTex, roughness: 0.68, side: THREE.DoubleSide });

    const addMekongCountryHouse = (hx, hz, w, d, h, rotY = 0, wallIdx = 0, roofIdx = 0, hasAwning = true) => {
      const hg = new THREE.Group();
      const wallColor = wallPalette[wallIdx % wallPalette.length];
      const wallMat = new THREE.MeshStandardMaterial({ map: this.limeWallTex, color: wallColor, roughness: 0.84 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
      body.position.y = h / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      hg.add(body);

      // Veranda tiled plinth + wooden porch columns (hàng hiên nhà miền Tây)
      const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.3, 0.22, d + 1.5),
        new THREE.MeshStandardMaterial({ color: 0x9C6B50, roughness: 0.82 })
      );
      plinth.position.set(0, 0.11, 0.7);
      hg.add(plinth);

      for (const cx of [-w * 0.44, 0, w * 0.44]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.095, 2.85, 8), woodPostMat);
        col.position.set(cx, 1.48, d / 2 + 1.2);
        hg.add(col);
      }

      // Shuttered double door + flanking louvered windows
      const door = new THREE.Mesh(new THREE.BoxGeometry(1.45, 2.15, 0.09), woodPostMat);
      door.position.set(0, 1.24, d / 2 + 0.04);
      hg.add(door);
      for (const wx of [-w * 0.3, w * 0.3]) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.05, 0.09), shutterMat);
        win.position.set(wx, 1.65, d / 2 + 0.04);
        hg.add(win);
      }

      // True 2-slope pitched corrugated tin roof ("mái tôn 2 mái nhà cấp 4 miền Tây") + gable triangles + porch lean-to
      const rMat = roofMaterials[roofIdx % roofMaterials.length];
      const roofPeakH = 1.45;
      const slopeHalfD = (d + 1.0) * 0.52;
      const slopeAngle = Math.atan2(roofPeakH, d * 0.5);
      const slopeLen = Math.hypot(roofPeakH, slopeHalfD);
      for (const side of [-1, 1]) {
        const slope = new THREE.Mesh(new THREE.BoxGeometry(w + 1.1, 0.08, slopeLen), rMat);
        slope.position.set(0, h + roofPeakH * 0.5, side * slopeHalfD * 0.5);
        slope.rotation.x = side * slopeAngle;
        slope.castShadow = true;
        hg.add(slope);
      }
      // Gable triangular end walls
      const gableShape = new THREE.Shape();
      gableShape.moveTo(-d * 0.5, 0);
      gableShape.lineTo(0, roofPeakH);
      gableShape.lineTo(d * 0.5, 0);
      gableShape.closePath();
      const gableGeom = new THREE.ShapeGeometry(gableShape);
      for (const side of [-1, 1]) {
        const gable = new THREE.Mesh(gableGeom, wallMat);
        gable.position.set(side * (w * 0.5 - 0.01), h, 0);
        gable.rotation.y = side * (Math.PI / 2);
        hg.add(gable);
      }

      const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.7, 0.08, 1.6), rMat);
      porchRoof.position.set(0, 2.9, d / 2 + 0.72);
      porchRoof.rotation.x = 0.2;
      hg.add(porchRoof);

      const ridge = new THREE.Mesh(new THREE.BoxGeometry(w + 1.14, 0.1, 0.24), zincMat);
      ridge.position.y = h + roofPeakH;
      hg.add(ridge);

      if (hasAwning) {
        const bat = new THREE.Mesh(new THREE.BoxGeometry(w + 0.35, 0.05, 1.75), stripedAwningMat);
        bat.position.set(0, 2.52, d / 2 + 1.45);
        bat.rotation.x = 0.34;
        hg.add(bat);
      }

      // Terracotta rainwater jar ("Lu nước mưa miền Tây") tucked by porch corner
      for (const lx of [-w * 0.38, -w * 0.28]) {
        const lu = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 10), M.terracottaPot);
        lu.scale.set(0.95, 1.15, 0.95);
        lu.position.set(lx, 0.46, d / 2 + 0.65);
        hg.add(lu);
        const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 10), woodPostMat);
        lid.position.set(lx, 0.88, d / 2 + 0.65);
        hg.add(lid);
      }

      hg.position.set(hx, 0, hz);
      hg.rotation.y = rotY;
      this.exteriorGroup.add(hg);
    };

    // Bustling Vietnamese Pilgrimage Market Street ("Con đường vào chùa rộn ràng hàng quán hành hương")
    const marketPalette = [
      { bg: '#9E2A20', roof: 0x336791, text: '#FFE27A', accent: 0xD94B3D },
      { bg: '#1F6A40', roof: 0x2F7064, text: '#FFF2B2', accent: 0x2F855A },
      { bg: '#8B501E', roof: 0x924438, text: '#FFE8A3', accent: 0xD9822B },
      { bg: '#2B4C7E', roof: 0x336791, text: '#FFF6D6', accent: 0x3A6EA5 },
      { bg: '#6E324B', roof: 0x7F8891, text: '#FFE2D1', accent: 0xC95D7A }
    ];
    const lotusPetalMat = new THREE.MeshStandardMaterial({ color: 0xEC6C9A, roughness: 0.45 });
    const fruitPomeloMat = new THREE.MeshStandardMaterial({ color: 0x6AA84F, roughness: 0.52 });
    const fruitOrangeMat = new THREE.MeshStandardMaterial({ color: 0xF08B2D, roughness: 0.48 });
    const cakeYellowMat = new THREE.MeshStandardMaterial({ color: 0xF5D25B, roughness: 0.56 });
    const hatStrawMat = new THREE.MeshStandardMaterial({ color: 0xE6D3A3, roughness: 0.72, side: THREE.DoubleSide });
    const clothRackColors = [0x9A8F99, 0x7E96AC, 0xDF8DA8, 0xE7D5AE, 0x6B8E76, 0xC69A64];

    const addPilgrimageStreetShop = (sx, sz, rotY, cfg) => {
      const sg = new THREE.Group();
      const pal = marketPalette[cfg.palIdx % marketPalette.length];
      const w = cfg.w || 4.8;
      const d = cfg.d || 3.4;
      const h = 2.95;

      // Raised concrete shop platform
      const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.5, 0.14, d + 1.8),
        new THREE.MeshStandardMaterial({ color: 0xC9BEB0, roughness: 0.85 })
      );
      plinth.position.set(0, 0.07, 0.55);
      plinth.receiveShadow = true;
      sg.add(plinth);

      // Rear timber/lime shop kiosk walls
      const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, 0.24),
        new THREE.MeshStandardMaterial({ map: this.limeWallTex, color: 0xF2E7CF, roughness: 0.84 })
      );
      backWall.position.set(0, h / 2 + 0.12, -d * 0.45);
      backWall.castShadow = true;
      sg.add(backWall);

      for (const px of [-w * 0.46, w * 0.46]) {
        const sideWall = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, h, d * 0.9),
          new THREE.MeshStandardMaterial({ map: this.limeWallTex, color: 0xEAE0C8, roughness: 0.84 })
        );
        sideWall.position.set(px, h / 2 + 0.12, 0);
        sg.add(sideWall);
        const frontPost = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, h + 0.1, 8), woodPostMat);
        frontPost.position.set(px, (h + 0.1) / 2, d * 0.52);
        sg.add(frontPost);
      }

      // Sloped corrugated tin roof + striped extended market canvas ("bạt che sạp chợ chùa")
      const tinRoof = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.65, 0.08, d + 1.15),
        new THREE.MeshStandardMaterial({ map: this.tinRoofTex, color: pal.roof, roughness: 0.54, metalness: 0.22 })
      );
      tinRoof.position.set(0, h + 0.25, 0.15);
      tinRoof.rotation.x = 0.18;
      tinRoof.castShadow = true;
      sg.add(tinRoof);

      const frontTarp = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.5, 0.04, 1.55),
        stripedAwningMat
      );
      frontTarp.position.set(0, 2.55, d * 0.5 + 0.72);
      frontTarp.rotation.x = 0.32;
      sg.add(frontTarp);

      // Vibrant shop signboard
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.92, 0.68, 0.1),
        new THREE.MeshStandardMaterial({
          map: makeTextTex(cfg.sign, { w: 1024, h: 170, bg: pal.bg, border: '#FFE082', color: pal.text, size: 42 }),
          roughness: 0.42
        })
      );
      sign.position.set(0, 2.98, d * 0.52);
      sg.add(sign);

      // Warm hanging string bulbs under eaves
      for (let bi = -2; bi <= 2; bi++) {
        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.065, 7, 6),
          new THREE.MeshBasicMaterial({ color: bi % 2 === 0 ? 0xFFE382 : 0xFF9F5A })
        );
        bulb.position.set(bi * (w * 0.19), 2.58, d * 0.55);
        sg.add(bulb);
      }

      // Display table & themed merchandise
      const table = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.88, 0.76, 1.05),
        woodPostMat
      );
      table.position.set(0, 0.48, d * 0.24);
      table.castShadow = true;
      sg.add(table);

      const cloth = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.9, 0.08, 1.12),
        new THREE.MeshStandardMaterial({ color: pal.accent, roughness: 0.78 })
      );
      cloth.position.set(0, 0.87, d * 0.24);
      sg.add(cloth);

      if (cfg.cat === 'huong_hoa') {
        // Buckets of fresh pink lotus stems, marigolds, incense packs
        for (let i = -2; i <= 2; i++) {
          const bucket = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.14, 0.36, 10),
            new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x2D7648 : 0xB83A2E, roughness: 0.55 })
          );
          bucket.position.set(i * 0.68, 1.08, d * 0.26);
          sg.add(bucket);
          for (let f = 0; f < 4; f++) {
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.36, 5), M.foliageLight);
            stem.position.set(i * 0.68 + (f - 1.5) * 0.06, 1.32, d * 0.26 + (f % 2) * 0.06);
            sg.add(stem);
            const fl = new THREE.Mesh(
              new THREE.ConeGeometry(0.07, 0.14, 7),
              i % 2 === 0 ? lotusPetalMat : fruitOrangeMat
            );
            fl.position.set(stem.position.x, 1.5, stem.position.z);
            fl.rotation.x = Math.PI;
            sg.add(fl);
          }
        }
        // Incense bundles stacked on shelf
        for (let p = 0; p < 5; p++) {
          const pack = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 0.42, 8),
            new THREE.MeshStandardMaterial({ color: p % 2 === 0 ? 0xC62828 : 0xD9962E, roughness: 0.6 })
          );
          pack.rotation.x = Math.PI / 2;
          pack.position.set(-1.3 + p * 0.25, 0.96, d * 0.42);
          sg.add(pack);
        }
      } else if (cfg.cat === 'thu_cong') {
        // Bamboo pole displaying stacked conical nón lá + hanging áo lam garment rail
        const hatPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 2.2, 6), woodPostMat);
        hatPole.position.set(-w * 0.38, 1.25, d * 0.56);
        sg.add(hatPole);
        for (let hi = 0; hi < 5; hi++) {
          const hat = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.15, 14, 1, true), hatStrawMat);
          hat.position.set(-w * 0.38, 1.1 + hi * 0.22, d * 0.56);
          hat.rotation.x = 0.25;
          sg.add(hat);
        }
        // Horizontal clothing bar with colorful áo lam / áo bà ba
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, w * 0.75, 8), zincMat);
        bar.rotation.z = Math.PI / 2;
        bar.position.set(0.25, 2.22, -d * 0.12);
        sg.add(bar);
        for (let gi = 0; gi < 5; gi++) {
          const robe = new THREE.Mesh(
            new THREE.BoxGeometry(0.38, 0.72, 0.12),
            new THREE.MeshStandardMaterial({ color: clothRackColors[(gi + cfg.palIdx) % clothRackColors.length], roughness: 0.72 })
          );
          robe.position.set(-w * 0.18 + gi * 0.48, 1.78, -d * 0.12);
          sg.add(robe);
        }
        // Rattan baskets & wooden beads trays on counter
        for (let bi = -1; bi <= 1; bi++) {
          const bsk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.26, 0.2, 0.2, 12),
            new THREE.MeshStandardMaterial({ color: 0xC69A58, roughness: 0.76 })
          );
          bsk.position.set(bi * 0.9, 1.0, d * 0.24);
          sg.add(bsk);
        }
      } else {
        // Glass street food showcase + fruit pyramids (bưởi, cam, dừa xiêm, bánh bò) + ice box + ghế cóc stools
        const glassCase = new THREE.Mesh(
          new THREE.BoxGeometry(1.55, 0.65, 0.72),
          new THREE.MeshStandardMaterial({ color: 0xDCF2F8, roughness: 0.18, transparent: true, opacity: 0.66 })
        );
        glassCase.position.set(-0.75, 1.24, d * 0.24);
        sg.add(glassCase);
        for (let fi = 0; fi < 5; fi++) {
          const item = new THREE.Mesh(
            new THREE.SphereGeometry(0.14, 9, 8),
            fi % 3 === 0 ? fruitPomeloMat : fi % 3 === 1 ? cakeYellowMat : fruitOrangeMat
          );
          item.position.set(0.45 + (fi % 3) * 0.34, 1.04 + Math.floor(fi / 3) * 0.2, d * 0.24);
          sg.add(item);
        }
        const redCooler = new THREE.Mesh(
          new THREE.BoxGeometry(0.62, 0.48, 0.44),
          new THREE.MeshStandardMaterial({ color: 0xC6352B, roughness: 0.45 })
        );
        redCooler.position.set(w * 0.35, 0.36, d * 0.62);
        sg.add(redCooler);
        for (const [stx, col] of [
          [-0.85, 0xC9382B],
          [0.05, 0x2867B2],
          [0.95, 0xC9382B]
        ]) {
          const stool = new THREE.Mesh(
            new THREE.CylinderGeometry(0.19, 0.22, 0.34, 8),
            new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 })
          );
          stool.position.set(stx, 0.22, d * 0.78);
          sg.add(stool);
        }
      }

      sg.userData.stallType = cfg.cat;
      sg.userData.stallTitle = cfg.title;
      sg.position.set(sx, 0, sz);
      sg.rotation.y = rotY;
      this.exteriorGroup.add(sg);
      this.stallClickTargets.push(sg);
      this.stallTriggers.push({
        x: sx + Math.sin(rotY) * (d * 0.8),
        z: sz + Math.cos(rotY) * (d * 0.8),
        radius: 3.8,
        stallType: cfg.cat,
        title: cfg.title
      });
    };

    // Keep the frontage road open. Local food and daily-life activity belongs to family-house porches,
    // not to continuous rows of temporary market kiosks.

    // Low-rise Mekong family houses beyond the frontage road and temple boundary.
    const sideBackHouses = [
      [-42, 83.5, 9.8, 7.8, 3.8, Math.PI, 0, 0, false],
      [-16, 84.5, 10.4, 8.0, 4.0, Math.PI, 1, 2, false],
      [14, 83.5, 9.6, 7.8, 3.7, Math.PI, 2, 1, false],
      [44, 84.0, 10.2, 8.0, 3.9, Math.PI, 3, 0, false],
      [-80, 26, 9.5, 8.2, 3.7, Math.PI / 2, 1, 2, false],
      [-82, -6, 10.8, 8.6, 4.0, Math.PI / 2, 0, 1, true],
      [-80, -38, 9.4, 8.0, 3.6, Math.PI / 2, 3, 2, false],
      [80, 24, 9.6, 8.0, 3.9, -Math.PI / 2, 0, 0, true],
      [82, -10, 10.8, 8.6, 4.0, -Math.PI / 2, 1, 1, false],
      [80, -42, 9.4, 8.0, 3.6, -Math.PI / 2, 3, 0, false],
      [-30, -84, 10.0, 8.2, 3.6, 0, 2, 2, false],
      [4, -86, 11.0, 8.4, 3.8, 0, 0, 1, false],
      [36, -84, 10.0, 8.0, 3.7, 0, 4, 0, false]
    ];
    for (const hArgs of sideBackHouses) addMekongCountryHouse(...hArgs);

    // No separate roadside carts: the outer approach remains a quiet residential lane.

    // Mekong Alluvial Ditch & Wooden Plank Bridge ("Mương rạch phù sa, lục bình & cầu ván")
    const addMekongCanalDitch = (cx, cz, length = 34, width = 3.2, rotY = 0) => {
      const dg = new THREE.Group();
      const bankMat = new THREE.MeshStandardMaterial({ map: this.dirtRoadTex, color: 0x6F563B, roughness: 0.94 });
      for (const side of [-1, 1]) {
        const bank = new THREE.Mesh(new THREE.BoxGeometry(length, 0.22, 1.05), bankMat);
        bank.position.set(0, -0.01, side * (width * 0.5 + 0.42));
        dg.add(bank);
      }
      const water = new THREE.Mesh(
        new THREE.PlaneGeometry(length, width),
        new THREE.MeshStandardMaterial({ color: 0x626842, roughness: 0.22, metalness: 0.3 })
      );
      water.rotation.x = -Math.PI / 2;
      water.position.y = 0.015;
      dg.add(water);
      // Floating water hyacinth ("lục bình") clusters with pale-lavender blossoms
      const hyacinthLeafMat = new THREE.MeshStandardMaterial({ color: 0x4E823E, roughness: 0.78 });
      const hyacinthFlowerMat = new THREE.MeshStandardMaterial({ color: 0xBE9CD8, roughness: 0.65 });
      for (let i = 0; i < 16; i++) {
        const hx = -length * 0.44 + (i * length * 0.88) / 15;
        const hz = ((i % 3) - 1) * (width * 0.24);
        const pad = new THREE.Mesh(new THREE.SphereGeometry(0.42, 7, 5), hyacinthLeafMat);
        pad.scale.set(1.3, 0.35, 1.1);
        pad.position.set(hx, 0.05, hz);
        dg.add(pad);
        if (i % 3 === 0) {
          const fl = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 6), hyacinthFlowerMat);
          fl.position.set(hx + 0.08, 0.19, hz);
          dg.add(fl);
        }
      }
      // Rustic wooden footbridge spanning the ditch
      for (const bx of [-0.55, 0.55]) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, width + 1.5), woodPostMat);
        beam.position.set(bx, 0.16, 0);
        dg.add(beam);
      }
      for (let pz = -width * 0.5 - 0.5; pz <= width * 0.5 + 0.5; pz += 0.28) {
        const plank = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.06, 0.22), woodPostMat);
        plank.position.set(0, 0.24, pz);
        dg.add(plank);
      }
      dg.position.set(cx, 0, cz);
      dg.rotation.y = rotY;
      this.exteriorGroup.add(dg);
    };
    // Visible Mekong canal ditch running along West roadside & East orchard outside expanded fences
    addMekongCanalDitch(-54, 51.6, 26, 2.7, 0);
    addMekongCanalDitch(74.5, 12, 46, 3.0, Math.PI / 2);

    // Street utility poles + sagging overhead power wires outside front fence
    const wirePoleMat = new THREE.MeshStandardMaterial({ color: 0x8F8C84, roughness: 0.78 });
    const wireMat = new THREE.LineBasicMaterial({ color: 0x3A3D42, transparent: true, opacity: 0.58 });
    const poleXs = [-46, -24, -2, 18, 36, 56, 78];
    for (let i = 0; i < poleXs.length; i++) {
      const px = poleXs[i];
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.19, 8.2, 8), wirePoleMat);
      pole.position.set(px, 4.1, 61.8);
      this.exteriorGroup.add(pole);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 1.5), wirePoleMat);
      bar.position.set(px, 7.6, 61.8);
      this.exteriorGroup.add(bar);
      if (i > 0) {
        const prevX = poleXs[i - 1];
        for (const wz of [61.3, 62.3]) {
          const pts = [
            new THREE.Vector3(prevX, 7.6, wz),
            new THREE.Vector3((prevX + px) / 2, 7.05, wz),
            new THREE.Vector3(px, 7.6, wz)
          ];
          this.exteriorGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wireMat));
        }
      }
    }

    // Vinh Trang frontage transport: private cars stop in the roadside lay-by;
    // motorbikes enter through the open right-side gate and park inside the compound.
    const vehicleTireMat = new THREE.MeshStandardMaterial({ color: 0x202326, roughness: 0.94 });
    const vehicleRimMat = new THREE.MeshStandardMaterial({ color: 0xAEB8BE, metalness: 0.78, roughness: 0.26 });
    const vehicleChromeMat = new THREE.MeshStandardMaterial({ color: 0xB8C0C5, metalness: 0.76, roughness: 0.24 });
    const vehicleGlassMat = new THREE.MeshStandardMaterial({ color: 0x263B47, metalness: 0.22, roughness: 0.17 });
    const vehicleLampMat = new THREE.MeshStandardMaterial({
      color: 0xF7F1D9, emissive: 0xD9C58A, emissiveIntensity: 0.18, roughness: 0.25
    });
    const vehicleAmberMat = new THREE.MeshStandardMaterial({ color: 0xE69B36, emissive: 0x8A4A12, emissiveIntensity: 0.12 });
    const vehicleTailMat = new THREE.MeshStandardMaterial({ color: 0xA62922, emissive: 0x65100C, emissiveIntensity: 0.16 });
    const vehicleBlackMat = new THREE.MeshStandardMaterial({ color: 0x25282A, roughness: 0.84 });
    const vehiclePlateMat = new THREE.MeshStandardMaterial({ color: 0xE9ECEB, roughness: 0.48 });

    const addVehicleBeam = (parent, a, b, radius, material, radialSegments = 8) => {
      const direction = new THREE.Vector3().subVectors(b, a);
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, direction.length(), radialSegments),
        material
      );
      beam.position.copy(a).add(b).multiplyScalar(0.5);
      beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
      parent.add(beam);
      return beam;
    };

    // Detailed Vietnamese automatic scooter: molded fairings, alloy wheels, fork, mirrors, lamps and exhaust.
    const buildParkedMotorbike = (mx, mz, yaw = Math.PI, bodyColor = 0x9C2C26) => {
      const mg = new THREE.Group();
      const paintMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.34, metalness: 0.2 });
      const darkPaintMat = new THREE.MeshStandardMaterial({ color: 0x34383B, roughness: 0.48, metalness: 0.16 });
      const seatMat = new THREE.MeshStandardMaterial({ color: 0x211F1D, roughness: 0.76 });
      const wheelRadius = 0.265;
      const wheelGroups = [];

      const addWheel = (wheelZ) => {
        const wheelGroup = new THREE.Group();
        wheelGroup.position.set(0, wheelRadius + 0.015, wheelZ);
        mg.add(wheelGroup);
        wheelGroups.push(wheelGroup);

        const tire = new THREE.Mesh(new THREE.TorusGeometry(wheelRadius - 0.015, 0.048, 9, 22), vehicleTireMat);
        tire.rotation.y = Math.PI / 2;
        tire.castShadow = true;
        wheelGroup.add(tire);

        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.178, 0.178, 0.145, 18), vehicleRimMat);
        rim.rotation.z = Math.PI / 2;
        wheelGroup.add(rim);

        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.17, 12), vehicleChromeMat);
        hub.rotation.z = Math.PI / 2;
        wheelGroup.add(hub);

        for (const side of [-1, 1]) {
          for (let spoke = 0; spoke < 8; spoke++) {
            const angle = (spoke / 8) * Math.PI * 2;
            const a = new THREE.Vector3(side * 0.09, 0, 0);
            const b = new THREE.Vector3(
              side * 0.09,
              Math.cos(angle) * 0.135,
              Math.sin(angle) * 0.135
            );
            addVehicleBeam(wheelGroup, a, b, 0.009, vehicleRimMat, 5);
          }
        }
      };

      addWheel(0.66);
      addWheel(-0.66);

      // One-piece sculpted side profile; extrusion creates the scooter's real body volume.
      const shellShape = new THREE.Shape();
      shellShape.moveTo(-0.72, 0.36);
      shellShape.quadraticCurveTo(-0.65, 0.46, -0.52, 0.76);
      shellShape.quadraticCurveTo(-0.43, 0.99, -0.19, 1.02);
      shellShape.quadraticCurveTo(0.12, 1.02, 0.39, 0.88);
      shellShape.quadraticCurveTo(0.63, 0.76, 0.70, 0.53);
      shellShape.quadraticCurveTo(0.73, 0.41, 0.58, 0.37);
      shellShape.lineTo(-0.58, 0.34);
      shellShape.closePath();
      const shellGeometry = new THREE.ExtrudeGeometry(shellShape, {
        depth: 0.43, bevelEnabled: true, bevelSegments: 3,
        steps: 1, bevelSize: 0.035, bevelThickness: 0.035, curveSegments: 10
      });
      shellGeometry.translate(0, 0, -0.215);
      shellGeometry.rotateY(-Math.PI / 2);
      const shell = new THREE.Mesh(shellGeometry, paintMat);
      shell.castShadow = true;
      shell.receiveShadow = true;
      mg.add(shell);

      const footboard = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.12, 0.62), vehicleBlackMat);
      footboard.position.set(0, 0.43, -0.02);
      mg.add(footboard);
      const sidePanel = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), darkPaintMat);
      sidePanel.scale.set(0.22, 0.19, 0.34);
      sidePanel.position.set(0.19, 0.56, -0.23);
      mg.add(sidePanel);

      // Engine casing, rear swingarm and twin front fork legs.
      const engine = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), vehicleChromeMat);
      engine.scale.set(0.18, 0.17, 0.24);
      engine.position.set(0.19, 0.39, -0.34);
      mg.add(engine);
      addVehicleBeam(mg, new THREE.Vector3(0, 0.34, -0.64), new THREE.Vector3(0.12, 0.55, -0.28), 0.035, vehicleBlackMat);
      for (const side of [-1, 1]) {
        addVehicleBeam(
          mg,
          new THREE.Vector3(side * 0.105, 0.29, 0.66),
          new THREE.Vector3(side * 0.12, 0.84, 0.48),
          0.035,
          vehicleChromeMat
        );
        addVehicleBeam(
          mg,
          new THREE.Vector3(side * 0.17, 0.32, -0.52),
          new THREE.Vector3(side * 0.17, 0.77, -0.36),
          0.026,
          vehicleChromeMat
        );
      }

      const frontMudguard = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 9), paintMat);
      frontMudguard.scale.set(0.29, 0.105, 0.39);
      frontMudguard.position.set(0, 0.54, 0.65);
      mg.add(frontMudguard);

      // Seat and rear grab rail.
      const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.12, 0.58), vehicleBlackMat);
      seatBase.position.set(0, 0.84, -0.22);
      mg.add(seatBase);
      const seat = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), seatMat);
      seat.scale.set(0.205, 0.09, 0.39);
      seat.position.set(0, 0.92, -0.2);
      mg.add(seat);
      addVehicleBeam(mg, new THREE.Vector3(-0.17, 0.89, -0.53), new THREE.Vector3(-0.17, 0.96, -0.72), 0.018, vehicleChromeMat);
      addVehicleBeam(mg, new THREE.Vector3(0.17, 0.89, -0.53), new THREE.Vector3(0.17, 0.96, -0.72), 0.018, vehicleChromeMat);
      addVehicleBeam(mg, new THREE.Vector3(-0.17, 0.96, -0.72), new THREE.Vector3(0.17, 0.96, -0.72), 0.018, vehicleChromeMat);

      // Handlebar, rear-view mirrors, headlamp and turn signals.
      const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.58, 8), vehicleChromeMat);
      handlebar.rotation.z = Math.PI / 2;
      handlebar.position.set(0, 1.02, 0.46);
      mg.add(handlebar);
      for (const side of [-1, 1]) {
        addVehicleBeam(
          mg,
          new THREE.Vector3(side * 0.19, 1.04, 0.46),
          new THREE.Vector3(side * 0.32, 1.34, 0.52),
          0.012,
          vehicleChromeMat
        );
        const mirror = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), vehicleBlackMat);
        mirror.scale.set(0.105, 0.065, 0.035);
        mirror.position.set(side * 0.32, 1.37, 0.52);
        mg.add(mirror);
        const indicator = new THREE.Mesh(new THREE.SphereGeometry(0.055, 9, 7), vehicleAmberMat);
        indicator.scale.set(1.1, 0.7, 0.6);
        indicator.position.set(side * 0.22, 0.76, 0.73);
        mg.add(indicator);
      }
      const headlamp = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), vehicleLampMat);
      headlamp.scale.set(0.13, 0.095, 0.045);
      headlamp.position.set(0, 0.84, 0.755);
      mg.add(headlamp);
      const tailLamp = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), vehicleTailMat);
      tailLamp.scale.set(1, 0.75, 0.6);
      tailLamp.position.set(0, 0.78, -0.72);
      mg.add(tailLamp);

      // Exhaust silencer and registration plate.
      const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.55, 10), vehicleBlackMat);
      exhaust.rotation.x = Math.PI / 2;
      exhaust.position.set(0.25, 0.34, -0.43);
      mg.add(exhaust);
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.025), vehiclePlateMat);
      plate.position.set(0, 0.52, -0.77);
      mg.add(plate);

      mg.position.set(mx, 0, mz);
      mg.rotation.y = yaw;
      mg.userData.wheelGroups = wheelGroups;
      mg.userData.ownedMaterials = [paintMat, darkPaintMat, seatMat];
      this.exteriorGroup.add(mg);
      return mg;
    };

    // Compact sedan / passenger van with separate cabin, glazing, alloy wheels and road lights.
    const buildRoadCar = (cx, cz, yaw, bodyColor, kind = 'sedan') => {
      const isVan = kind === 'van';
      const halfLength = isVan ? 2.68 : 2.38;
      const bodyWidth = isVan ? 1.94 : 1.86;
      const bodyMat = new THREE.MeshStandardMaterial({
        color: bodyColor, roughness: 0.34, metalness: 0.28
      });
      const lowerShape = new THREE.Shape();
      lowerShape.moveTo(-halfLength, 0.43);
      lowerShape.quadraticCurveTo(-halfLength - 0.04, 0.48, -halfLength, 0.72);
      lowerShape.lineTo(-halfLength + 0.18, 1.02);
      lowerShape.quadraticCurveTo(-halfLength + 0.34, 1.14, -halfLength + 0.62, 1.14);
      lowerShape.lineTo(halfLength - 0.38, 1.14);
      lowerShape.quadraticCurveTo(halfLength, 1.10, halfLength, 0.82);
      lowerShape.lineTo(halfLength, 0.58);
      lowerShape.quadraticCurveTo(halfLength - 0.08, 0.43, halfLength - 0.28, 0.43);
      lowerShape.closePath();
      const lowerGeometry = new THREE.ExtrudeGeometry(lowerShape, {
        depth: bodyWidth, bevelEnabled: true, bevelSegments: 3,
        steps: 1, bevelSize: 0.055, bevelThickness: 0.04, curveSegments: 10
      });
      lowerGeometry.translate(0, 0, -bodyWidth / 2);
      lowerGeometry.rotateY(-Math.PI / 2);
      const lowerBody = new THREE.Mesh(lowerGeometry, bodyMat);
      lowerBody.castShadow = true;
      lowerBody.receiveShadow = true;
      const cg = new THREE.Group();
      cg.add(lowerBody);

      const cabinShape = new THREE.Shape();
      if (isVan) {
        cabinShape.moveTo(-2.02, 1.10);
        cabinShape.quadraticCurveTo(-2.0, 1.55, -1.88, 2.02);
        cabinShape.lineTo(1.78, 2.02);
        cabinShape.quadraticCurveTo(2.12, 1.83, 2.38, 1.10);
      } else {
        cabinShape.moveTo(-1.34, 1.10);
        cabinShape.lineTo(-0.82, 1.83);
        cabinShape.quadraticCurveTo(-0.72, 1.91, -0.54, 1.91);
        cabinShape.lineTo(0.74, 1.91);
        cabinShape.quadraticCurveTo(0.92, 1.91, 1.02, 1.78);
        cabinShape.lineTo(1.42, 1.10);
      }
      cabinShape.closePath();
      const cabinGeometry = new THREE.ExtrudeGeometry(cabinShape, {
        depth: bodyWidth - 0.22, bevelEnabled: true, bevelSegments: 3,
        steps: 1, bevelSize: 0.035, bevelThickness: 0.03, curveSegments: 10
      });
      cabinGeometry.translate(0, 0, -(bodyWidth - 0.22) / 2);
      cabinGeometry.rotateY(-Math.PI / 2);
      const cabin = new THREE.Mesh(cabinGeometry, bodyMat);
      cabin.castShadow = true;
      cg.add(cabin);

      const axleZ = isVan ? 1.82 : 1.52;
      const wheelGroups = [];
      for (const side of [-1, 1]) {
        for (const wheelZ of [-axleZ, axleZ]) {
          const wheelGroup = new THREE.Group();
          wheelGroup.position.set(side * (bodyWidth / 2 + 0.015), 0.405, wheelZ);
          cg.add(wheelGroup);
          wheelGroups.push(wheelGroup);

          const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.365, 0.365, 0.25, 20), vehicleTireMat);
          tire.rotation.z = Math.PI / 2;
          tire.castShadow = true;
          wheelGroup.add(tire);
          const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.265, 18), vehicleRimMat);
          rim.rotation.z = Math.PI / 2;
          wheelGroup.add(rim);
          const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.28, 12), vehicleChromeMat);
          hub.rotation.z = Math.PI / 2;
          wheelGroup.add(hub);
        }
      }

      // Tinted side windows: two per side on the sedan, three on the passenger van.
      const sideWindowZs = isVan ? [-1.22, -0.12, 0.98] : [-0.53, 0.52];
      for (const side of [-1, 1]) {
        for (const wz of sideWindowZs) {
          const windowMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.028, isVan ? 0.64 : 0.48, isVan ? 0.86 : 0.91),
            vehicleGlassMat
          );
          windowMesh.position.set(side * (bodyWidth / 2 + 0.012), isVan ? 1.64 : 1.52, wz);
          cg.add(windowMesh);
        }
        // Door seams, handles and side mirrors.
        const doorSeam = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.55, 0.018), vehicleBlackMat);
        doorSeam.position.set(side * (bodyWidth / 2 + 0.02), 0.88, isVan ? -0.55 : -0.02);
        cg.add(doorSeam);
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.055, 0.22), vehicleChromeMat);
        handle.position.set(side * (bodyWidth / 2 + 0.03), 1.08, isVan ? -0.35 : -0.18);
        cg.add(handle);
        const mirrorStem = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.12), vehicleChromeMat);
        mirrorStem.position.set(side * (bodyWidth / 2 + 0.08), 1.35, 0.92);
        cg.add(mirrorStem);
        const mirror = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), vehicleBlackMat);
        mirror.scale.set(1.2, 0.7, 0.55);
        mirror.position.set(side * (bodyWidth / 2 + 0.14), 1.39, 0.98);
        cg.add(mirror);
      }

      const windshield = new THREE.Mesh(
        new THREE.PlaneGeometry(bodyWidth - 0.34, isVan ? 0.74 : 0.62),
        vehicleGlassMat
      );
      windshield.position.set(0, isVan ? 1.57 : 1.48, isVan ? 2.15 : 1.18);
      windshield.rotation.x = isVan ? -0.24 : -0.58;
      cg.add(windshield);
      const rearGlass = new THREE.Mesh(
        new THREE.PlaneGeometry(bodyWidth - 0.38, isVan ? 0.66 : 0.56),
        vehicleGlassMat
      );
      rearGlass.position.set(0, isVan ? 1.56 : 1.48, isVan ? -1.9 : -1.18);
      rearGlass.rotation.x = isVan ? 0.16 : 0.55;
      cg.add(rearGlass);

      const frontZ = halfLength + 0.025;
      const rearZ = -halfLength - 0.025;
      const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth * 0.9, 0.13, 0.13), vehicleChromeMat);
      frontBumper.position.set(0, 0.52, frontZ);
      cg.add(frontBumper);
      const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth * 0.9, 0.13, 0.13), vehicleChromeMat);
      rearBumper.position.set(0, 0.52, rearZ);
      cg.add(rearBumper);
      const grille = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.19, 0.045), vehicleBlackMat);
      grille.position.set(0, 0.79, frontZ + 0.035);
      cg.add(grille);
      for (const side of [-1, 1]) {
        const headlight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.17, 0.07), vehicleLampMat);
        headlight.position.set(side * 0.62, 0.91, frontZ + 0.035);
        cg.add(headlight);
        const tailLight = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.07), vehicleTailMat);
        tailLight.position.set(side * 0.67, 0.88, rearZ - 0.025);
        cg.add(tailLight);
        const indicator = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.055), vehicleAmberMat);
        indicator.position.set(side * 0.79, 0.78, frontZ + 0.035);
        cg.add(indicator);
      }
      const frontPlate = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.13, 0.025), vehiclePlateMat);
      frontPlate.position.set(0, 0.63, frontZ + 0.05);
      cg.add(frontPlate);
      const rearPlate = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.025), vehiclePlateMat);
      rearPlate.position.set(0, 0.64, rearZ - 0.05);
      cg.add(rearPlate);

      if (isVan) {
        // Simple roof rails identify a local passenger shuttle without turning it into a tour coach.
        for (const side of [-1, 1]) {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 3.1), vehicleChromeMat);
          rail.position.set(side * 0.66, 2.08, -0.02);
          cg.add(rail);
        }
      }

      cg.position.set(cx, 0, cz);
      cg.rotation.y = yaw;
      cg.userData.wheelGroups = wheelGroups;
      cg.userData.ownedMaterials = [bodyMat];
      this.exteriorGroup.add(cg);
      return cg;
    };

    // Shared vehicle factory: uses Meshy GLB cars/shuttles when loaded, falling back to procedural geometry.
    const buildGLBRoadVehicle = (sceneObj, cx, cz, yaw, targetLength) => {
      const wrap = new THREE.Group();
      const inner = sceneObj.clone(true);
      inner.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
          if (o.geometry && !o.geometry.getAttribute('normal')) {
            o.geometry.computeVertexNormals();
          }
        }
      });
      // Meshy vehicle GLBs face along +X; rotate +PI/2 around Y so vehicle length aligns along local Z
      inner.rotation.y = Math.PI / 2;
      const box = new THREE.Box3().setFromObject(inner);
      const sz = new THREE.Vector3();
      box.getSize(sz);
      const scale = targetLength / Math.max(0.1, sz.z);
      inner.scale.setScalar(scale);
      const box2 = new THREE.Box3().setFromObject(inner);
      inner.position.set(
        -(box2.min.x + box2.max.x) * 0.5,
        -box2.min.y,
        -(box2.min.z + box2.max.z) * 0.5
      );
      wrap.add(inner);
      wrap.position.set(cx, 0, cz);
      wrap.rotation.y = yaw;
      wrap.userData.wheelGroups = [];
      wrap.userData.ownedMaterials = [];
      this.exteriorGroup.add(wrap);
      return wrap;
    };
    this.buildGLBRoadVehicle = buildGLBRoadVehicle;

    this.spawnRoadTrafficVehicle = ({ kind = 'sedan', x, z, direction = 1, speed = 7, color = 0xAEB9C1 }) => {
      const yaw = direction > 0 ? Math.PI / 2 : -Math.PI / 2;
      let group;
      if (kind === 'bike') {
        group = buildParkedMotorbike(x, z, yaw, color);
      } else if (kind === 'van' && this.archMeshCache.xe_khach) {
        group = buildGLBRoadVehicle(this.archMeshCache.xe_khach, x, z, yaw, 5.8);
      } else if (kind !== 'van' && this.archMeshCache.xe_oto) {
        group = buildGLBRoadVehicle(this.archMeshCache.xe_oto, x, z, yaw, 4.45);
      } else {
        group = buildRoadCar(x, z, yaw, color, kind === 'van' ? 'van' : 'sedan');
      }
      return {
        group,
        kind,
        direction,
        speed,
        wheelRadius: kind === 'bike' ? 0.265 : 0.365,
        wheelGroups: group.userData.wheelGroups || [],
        state: 'passing'
      };
    };

    // Small paved lay-by on the pagoda side of Nguyễn Trung Trực; keep both gates unobstructed.
    const frontCarParkingPad = new THREE.Mesh(
      new THREE.BoxGeometry(16.0, 0.07, 3.7),
      new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xC8BFAE, roughness: 0.9 })
    );
    frontCarParkingPad.position.set(-14.0, 0.026, 52.2);
    frontCarParkingPad.receiveShadow = true;
    this.exteriorGroup.add(frontCarParkingPad);
    const parkingLineMat = new THREE.MeshBasicMaterial({ color: 0xE9E4D8 });
    for (const lx of [-22.0, -14.0, -6.0]) {
      const bayLine = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.018, 3.2), parkingLineMat);
      bayLine.position.set(lx, 0.068, 52.2);
      this.exteriorGroup.add(bayLine);
    }
    const parkedVan = buildRoadCar(-18.0, 52.2, -Math.PI / 2, 0xD2D8D9, 'van');
    const parkedSedan = buildRoadCar(-10.0, 52.2, -Math.PI / 2, 0xAEB9C1, 'sedan');
    this.parkedVehicleAnchors.push(
      { kind: 'van', x: -18.0, z: 52.2, yaw: -Math.PI / 2, targetLength: 5.8, fallback: parkedVan },
      { kind: 'sedan', x: -10.0, z: 52.2, yaw: -Math.PI / 2, targetLength: 4.45, fallback: parkedSedan }
    );

    // Occasional visitor-shuttle pull-in on the far east end of the frontage; does not block either gate.
    const visitorDropoffPad = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 0.07, 5.2),
      new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xC8BFAE, roughness: 0.9 })
    );
    visitorDropoffPad.position.set(63.0, 0.026, 50.6);
    visitorDropoffPad.receiveShadow = true;
    this.exteriorGroup.add(visitorDropoffPad);
    const dropoffEdge = new THREE.Mesh(
      new THREE.BoxGeometry(5.8, 0.025, 0.08),
      new THREE.MeshBasicMaterial({ color: 0xE9E4D8 })
    );
    dropoffEdge.position.set(63.0, 0.07, 48.05);
    this.exteriorGroup.add(dropoffEdge);

    // Motorbike parking sits beyond the right-side entrance and grocery/souvenir frontage, inside the pagoda grounds.
    const motorbikeParkingPad = new THREE.Mesh(
      new THREE.BoxGeometry(7.6, 0.07, 4.0),
      new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xC9C0B0, roughness: 0.9 })
    );
    motorbikeParkingPad.position.set(57.1, 0.026, 35.3);
    motorbikeParkingPad.receiveShadow = true;
    this.exteriorGroup.add(motorbikeParkingPad);
    for (const lx of [53.3, 55.2, 57.1, 59.0, 60.9]) {
      const bayLine = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.018, 3.45), parkingLineMat);
      bayLine.position.set(lx, 0.068, 35.3);
      this.exteriorGroup.add(bayLine);
    }
    buildParkedMotorbike(54.25, 35.3, Math.PI, 0x9C2C26);
    buildParkedMotorbike(56.15, 35.3, Math.PI, 0x254E8A);
    buildParkedMotorbike(58.05, 35.3, Math.PI, 0x3D434A);
    buildParkedMotorbike(59.95, 35.3, Math.PI, 0xB89342);

    // Authentic Curved Mekong Coconut Palms ("Cây dừa nghiêng"), Banana Clumps ("Bụi chuối") & Bamboo Groves ("Bụi tre")
    const trunkMat = M.trunk;
    const palmLeafMat = M.foliageLight;
    const palmInnerMat = M.foliageMid;
    const orchardMat = M.foliageDark;
    const coconutMat = new THREE.MeshStandardMaterial({ color: 0x5E8232, roughness: 0.62 });

    const addBgCoconutPalm = (px, pz, h = 9.5, lean = 0.12) => {
      const pg = new THREE.Group();
      let curX = 0;
      let curY = 0;
      const segs = 4;
      const segH = h / segs;
      for (let s = 0; s < segs; s++) {
        const tilt = lean * (s + 0.5) * 0.85;
        const rBot = 0.25 - s * 0.028;
        const rTop = 0.22 - s * 0.028;
        const tr = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, segH + 0.08, 7), trunkMat);
        tr.position.set(curX + Math.sin(tilt) * segH * 0.5, curY + segH * 0.5, 0);
        tr.rotation.z = -tilt;
        pg.add(tr);
        curX += Math.sin(tilt) * segH;
        curY += Math.cos(tilt) * segH;
      }
      for (let c = 0; c < 4; c++) {
        const ca = (c / 4) * Math.PI * 2;
        const nut = new THREE.Mesh(new THREE.SphereGeometry(0.18, 7, 6), coconutMat);
        nut.position.set(curX + Math.cos(ca) * 0.22, curY - 0.12, Math.sin(ca) * 0.22);
        pg.add(nut);
      }
      for (let fi = 0; fi < 9; fi++) {
        const a = (fi / 9) * Math.PI * 2 + lean * 2;
        const fg = new THREE.Group();
        fg.position.set(curX, curY, 0);
        fg.rotation.y = a;
        const inner = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.06, 0.56), fi % 2 === 0 ? palmLeafMat : palmInnerMat);
        inner.position.set(0.92, 0.18, 0);
        inner.rotation.z = 0.22;
        fg.add(inner);
        const outer = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.05, 0.42), palmLeafMat);
        outer.position.set(2.45, -0.15, 0);
        outer.rotation.z = -0.45;
        fg.add(outer);
        pg.add(fg);
      }
      pg.position.set(px, 0, pz);
      this.exteriorGroup.add(pg);
    };

    const addBananaClump = (bx, bz) => {
      const bg = new THREE.Group();
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x5C7E38, roughness: 0.78 });
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x62943C, roughness: 0.65, side: THREE.DoubleSide });
      const budMat = new THREE.MeshStandardMaterial({ color: 0x7A2A3B, roughness: 0.58 });
      for (let i = 0; i < 4; i++) {
        const a = i * 1.6;
        const h = 2.0 + (i % 2) * 0.7;
        const sx = Math.cos(a) * 0.34;
        const sz = Math.sin(a) * 0.34;
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, h, 7), stemMat);
        stem.position.set(sx, h / 2, sz);
        bg.add(stem);
        for (let li = 0; li < 6; li++) {
          const la = a + (li / 6) * Math.PI * 2;
          const leafGroup = new THREE.Group();
          leafGroup.position.set(sx, h - (li % 2) * 0.25, sz);
          leafGroup.rotation.y = la;
          const innerBlade = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.42), leafMat);
          innerBlade.rotation.x = -Math.PI / 2;
          innerBlade.position.set(0.55, 0.28, 0);
          innerBlade.rotation.z = 0.26;
          leafGroup.add(innerBlade);
          const outerBlade = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.36), leafMat);
          outerBlade.rotation.x = -Math.PI / 2;
          outerBlade.position.set(1.42, 0.12, 0);
          outerBlade.rotation.z = -0.32;
          leafGroup.add(outerBlade);
          bg.add(leafGroup);
        }
      }
      const bud = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 6), budMat);
      bud.position.set(0.42, 1.55, 0.18);
      bud.rotation.x = Math.PI;
      bg.add(bud);
      bg.position.set(bx, 0, bz);
      this.exteriorGroup.add(bg);
    };

    const addBambooGrove = (gx, gz) => {
      const gg = new THREE.Group();
      const bambooMat = new THREE.MeshStandardMaterial({ color: 0x769244, roughness: 0.62 });
      const bambooLeafMat = new THREE.MeshStandardMaterial({ color: 0x5B863A, roughness: 0.72, side: THREE.DoubleSide });
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const rad = 0.25 + (i % 3) * 0.24;
        const bh = 5.6 + (i % 4) * 0.95;
        const culm = new THREE.Group();
        culm.position.set(Math.cos(a) * rad, 0, Math.sin(a) * rad);
        culm.rotation.z = -Math.cos(a) * (0.1 + (i % 3) * 0.03);
        culm.rotation.x = Math.sin(a) * (0.1 + (i % 3) * 0.03);
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.072, bh, 6), bambooMat);
        stalk.position.y = bh / 2;
        culm.add(stalk);
        for (let k = 0; k < 4; k++) {
          const ly = bh * (0.58 + k * 0.11);
          const spray = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.95, 5), bambooLeafMat);
          spray.scale.set(1.25, 0.38, 0.85);
          spray.position.set(Math.cos(a + k) * 0.35, ly, Math.sin(a + k) * 0.35);
          spray.rotation.z = -0.7;
          spray.rotation.y = a + k * 1.4;
          culm.add(spray);
        }
        gg.add(culm);
      }
      gg.position.set(gx, 0, gz);
      this.exteriorGroup.add(gg);
    };

    // Place signature banana clumps & bamboo strictly OUTSIDE the expanded x=-68..68, z=-72..41.5 sanctuary wall
    [
      [-72, 48.5],
      [-74, 30],
      [-74, -12],
      [73, 38],
      [74, 6],
      [-60, 74.5],
      [72, 54]
    ].forEach(([bx, bz]) => addBananaClump(bx, bz));
    [
      [-73, 52],
      [75, 64],
      [-75, -24],
      [76, -24]
    ].forEach(([gx, gz]) => addBambooGrove(gx, gz));

    for (let i = 0; i < 76; i++) {
      const ang = (i / 76) * Math.PI * 2;
      const dist = 84 + (i % 5) * 16;
      const ox = Math.cos(ang) * dist;
      const oz = Math.sin(ang) * dist - 10;
      if (oz > 46 && oz < 76 && ox > -64 && ox < 84) continue;
      if (i % 2 === 0) {
        addBgCoconutPalm(ox, oz, 8.5 + (i % 4) * 1.6, ((i % 3) - 1) * 0.1);
      } else {
        const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(3.4 + (i % 3) * 0.9, 1), orchardMat);
        canopy.scale.set(1.35, 0.62, 1.35);
        canopy.position.set(ox, 2.3, oz);
        this.exteriorGroup.add(canopy);
      }
    }
    for (let i = 0; i < 48; i++) {
      const ang = (i / 48) * Math.PI * 2 + 0.06;
      const ox = Math.cos(ang) * 136;
      const oz = Math.sin(ang) * 136;
      const mound = new THREE.Mesh(new THREE.DodecahedronGeometry(8.5 + (i % 3) * 2.2, 1), orchardMat);
      mound.scale.set(1.6, 0.36, 1.6);
      mound.position.set(ox, 1.15, oz);
      this.exteriorGroup.add(mound);
    }
  }

  addObstacle(x, z, r) {
    this.obstacles.push({ x, z, r });
  }

  addRectObstacle(minX, maxX, minZ, maxZ) {
    this.rectObstacles.push({ minX, maxX, minZ, maxZ });
  }

  buildTempleGroundsV8() {
    const M = this.MAT;

    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(320, 320),
      new THREE.MeshStandardMaterial({ map: this.mekongEarthTex, color: 0xffffff, roughness: 0.95 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.05;
    grass.receiveShadow = true;
    this.exteriorGroup.add(grass);

    // Expanded Stone Courtyard spanning full 136m x 134m (~18,200 m² sanctuary covering rear hall)
    const courtyard = new THREE.Mesh(
      new THREE.BoxGeometry(136, 0.1, 134),
      new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xD9D0BF, roughness: 0.86 })
    );
    courtyard.position.set(0.0, -0.04, -25.5);
    courtyard.receiveShadow = true;
    this.exteriorGroup.add(courtyard);

    // Front Plaza Axis (Cổng Tam Quan -> Sân Cờ -> Chánh Điện)
    const mainRoad = new THREE.Mesh(
      new THREE.BoxGeometry(10.8, 0.12, 48),
      new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xDFD5C3, roughness: 0.78 })
    );
    mainRoad.position.set(23, 0.0, 33);
    mainRoad.receiveShadow = true;
    this.exteriorGroup.add(mainRoad);

    // RIGHT (East) Tourist Arrival Road along +X flank (through open Cổng Phụ x=40.5 -> Yellow Banner -> Bougainvillea Side Path)
    const rightArrivalRoad = new THREE.Mesh(
      new THREE.BoxGeometry(9.2, 0.12, 54),
      new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xE5D8C3, roughness: 0.78 })
    );
    rightArrivalRoad.position.set(40.5, 0.002, 34);
    rightArrivalRoad.receiveShadow = true;
    this.exteriorGroup.add(rightArrivalRoad);

    // Long Straight Cool Tree-Shaded Lane from Cổng Phụ Tịnh Độ Huyền Môn (x = 40.5, z = +42 -> -27)
    // + Left-Turn Apron at End of Road (z = -14.5) leading onto the Shoe-Removal Veranda of Chánh Điện!
    const sideWalkway = new THREE.Mesh(
      new THREE.BoxGeometry(9.4, 0.12, 69.5),
      new THREE.MeshStandardMaterial({ map: this.asphaltTex, color: 0xD8D4CA, roughness: 0.84 })
    );
    sideWalkway.position.set(40.5, 0.006, 7.25);
    sideWalkway.receiveShadow = true;
    this.exteriorGroup.add(sideWalkway);

    const endTurnPlaza = new THREE.Mesh(
      new THREE.BoxGeometry(11.6, 0.13, 12.5),
      new THREE.MeshStandardMaterial({ map: this.sideBrickTex, color: 0xEAD6C0, roughness: 0.78 })
    );
    endTurnPlaza.position.set(39.8, 0.008, -16.5);
    endTurnPlaza.receiveShadow = true;
    this.exteriorGroup.add(endTurnPlaza);

    this.buildFenceAndGateWall();

    // Expanded Pagoda Front Brick/Stone Apron + Rustic Unpaved Mekong Dirt Lanes & Shoulders
    const frontSidewalk = new THREE.Mesh(
      new THREE.BoxGeometry(136, 0.1, 9.8),
      new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xD7CEBC, roughness: 0.85 })
    );
    frontSidewalk.position.set(0.0, -0.004, 46.5);
    frontSidewalk.receiveShadow = true;
    this.exteriorGroup.add(frontSidewalk);

    const dirtShoulderTex = this.dirtRoadTex.clone();
    dirtShoulderTex.needsUpdate = true;
    dirtShoulderTex.repeat.set(34, 1);
    const dirtShoulderMat = new THREE.MeshStandardMaterial({ map: dirtShoulderTex, color: 0xffffff, roughness: 0.94 });

    const dirtLaneTex = this.dirtRoadTex.clone();
    dirtLaneTex.needsUpdate = true;
    dirtLaneTex.repeat.set(12, 2);
    const dirtLaneMat = new THREE.MeshStandardMaterial({ map: dirtLaneTex, color: 0xffffff, roughness: 0.94 });

    // Continuous rustic red-brown dirt shoulder along the north & south sides of Đường Nguyễn Trung Trực
    const dirtShoulderNorth = new THREE.Mesh(new THREE.BoxGeometry(220, 0.08, 2.4), dirtShoulderMat);
    dirtShoulderNorth.position.set(10.0, -0.014, 52.1);
    dirtShoulderNorth.receiveShadow = true;
    this.exteriorGroup.add(dirtShoulderNorth);

    const dirtShoulderSouth = new THREE.Mesh(new THREE.BoxGeometry(220, 0.08, 4.2), dirtShoulderMat);
    dirtShoulderSouth.position.set(10.0, -0.014, 63.6);
    dirtShoulderSouth.receiveShadow = true;
    this.exteriorGroup.add(dirtShoulderSouth);

    // Unpaved rural dirt lanes extending West & East beyond the pagoda front brick apron
    const dirtLaneWest = new THREE.Mesh(new THREE.BoxGeometry(76, 0.08, 9.0), dirtLaneMat);
    dirtLaneWest.position.set(-54, -0.012, 46.5);
    dirtLaneWest.receiveShadow = true;
    this.exteriorGroup.add(dirtLaneWest);

    const dirtLaneEast = new THREE.Mesh(new THREE.BoxGeometry(64, 0.08, 9.0), dirtLaneMat);
    dirtLaneEast.position.set(88, -0.012, 46.5);
    dirtLaneEast.receiveShadow = true;
    this.exteriorGroup.add(dirtLaneEast);

    const road = new THREE.Mesh(
      new THREE.BoxGeometry(220, 0.08, 10.2),
      new THREE.MeshStandardMaterial({ map: this.asphaltTex, color: 0xffffff, roughness: 0.9 })
    );
    road.position.set(10.0, -0.025, 57.5);
    road.receiveShadow = true;
    this.exteriorGroup.add(road);

    const dashMat = new THREE.MeshBasicMaterial({ color: 0xEAE3CF });
    for (let dx = -80; dx <= 100; dx += 8) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.16), dashMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(dx, 0.018, 57.5);
      this.exteriorGroup.add(dash);
    }

    // 1. Cổng Chính Tam Quan (CLOSED ceremonially, calm & quiet at x = 23, z = 41.5)
    const gateEast = this.buildTamQuanGate('CHÙA VĨNH TRÀNG', true);
    gateEast.position.set(23, 0, 41.5);
    this.tamQuanMainGroup = gateEast;
    this.exteriorGroup.add(gateEast);

    // 2. Ornate Ceramic-Mosaic Cổng Phụ ("TỊNH ĐỘ HUYỀN MÔN" — WIDE OPEN & BUSTLING at x = 40.5, z = 41.5)
    const sideGate = this.buildSideMosaicGate();
    sideGate.position.set(40.5, 0, 41.5);
    this.exteriorGroup.add(sideGate);

    // Authentic Blue Metal A-Frame Sign ("CHO XE 2 BÁNH VÀO CHÙA") & Tall Royal Palm beside right gate pillar (photo ref!)
    const blueGateSignGrp = new THREE.Group();
    blueGateSignGrp.position.set(44.18, 0, 43.45);
    blueGateSignGrp.rotation.y = -0.1;
    for (const lx of [-0.36, 0.36]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.38, 0.05), M.darkWood);
      leg.position.set(lx, 0.68, 0);
      blueGateSignGrp.add(leg);
    }
    const blueBoard = new THREE.Mesh(
      new THREE.BoxGeometry(0.86, 0.96, 0.06),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('CHO XE 2 BÁNH VÀO CHÙA', {
          w: 420,
          h: 460,
          bg: '#1668C4',
          border: '#E8F2FF',
          color: '#FFFFFF',
          size: 42
        }),
        roughness: 0.36
      })
    );
    blueBoard.position.set(0, 0.92, 0.02);
    blueGateSignGrp.add(blueBoard);
    this.exteriorGroup.add(blueGateSignGrp);

    const palmGrp = new THREE.Group();
    palmGrp.position.set(46.8, 0, 42.9);
    const palmTrunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.34, 9.6, 12),
      new THREE.MeshStandardMaterial({ color: 0x9C9484, roughness: 0.85 })
    );
    palmTrunk.position.y = 4.8;
    palmTrunk.castShadow = true;
    palmGrp.add(palmTrunk);
    for (let fi = 0; fi < 10; fi++) {
      const ang = (fi / 10) * Math.PI * 2;
      const frond = new THREE.Mesh(new THREE.ConeGeometry(0.46, 3.2, 5), M.foliageMid);
      frond.scale.set(0.55, 1.0, 0.18);
      frond.position.set(Math.cos(ang) * 1.25, 9.45, Math.sin(ang) * 1.25);
      frond.rotation.z = -Math.cos(ang) * 1.18;
      frond.rotation.x = Math.sin(ang) * 1.18;
      palmGrp.add(frond);
    }
    this.exteriorGroup.add(palmGrp);

    // Yellow Overhead Welcome Banner just inside Cổng Phụ
    const rightBannerGroup = new THREE.Group();
    rightBannerGroup.position.set(40.5, 0, 34.5);
    for (const px of [-3.6, 3.6]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.095, 5.2, 8), M.goldAccent);
      pole.position.set(px, 2.6, 0);
      pole.castShadow = true;
      rightBannerGroup.add(pole);
    }
    const rightBannerBoard = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 0.95, 0.16),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('CHÀO MỪNG QUÝ QUAN KHÁCH VÀ QUÝ PHẬT TỬ THÂN LÂM', {
          w: 1600,
          h: 200,
          bg: '#F8EA8C',
          border: '#1C5A34',
          color: '#9E241C',
          size: 40
        }),
        roughness: 0.42
      })
    );
    rightBannerBoard.position.set(0, 4.55, 0);
    rightBannerGroup.add(rightBannerBoard);
    this.exteriorGroup.add(rightBannerGroup);

    this.buildVietnameseGroceryHouse();

    const chanhDien = this.buildChanhDien13Arches();
    chanhDien.position.set(23, 0, 1.0);
    this.exteriorGroup.add(chanhDien);

    // Connected Main Temple Complex ("Chùa Chính" chữ Quốc layout centered seamlessly on x = 23.0)
    const buildMainTempleCompound = () => {
      const comp = new THREE.Group();
      const centerX = 23.0;
      const frontZ = 7.15;
      const rearZ = -82.0;
      const totalDepth = frontZ - rearZ;
      const centerZ = (frontZ + rearZ) * 0.5;
      const darkWoodBeam = new THREE.MeshStandardMaterial({
        color: 0x3D2114, map: this.woodGrainTex, roughness: 0.6
      });
      const ceramicJade = new THREE.MeshStandardMaterial({ color: 0x3F7865, roughness: 0.44 });
      const ceramicBlue = new THREE.MeshStandardMaterial({ color: 0x4D879E, roughness: 0.42 });
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x676B66, roughness: 0.92, flatShading: true });
      const mossMat = new THREE.MeshStandardMaterial({ color: 0x3D7A3C, roughness: 0.85 });
      const floorMat = new THREE.MeshStandardMaterial({
        map: this.pavingTex, color: 0xD6C3A5, roughness: 0.82
      });

      const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(22.4, 0.96, totalDepth),
        M.stoneLight
      );
      plinth.position.set(centerX, 0.48, centerZ);
      plinth.receiveShadow = true;
      plinth.castShadow = true;
      comp.add(plinth);

      const skywells = [
        { z: -30.5, depth: 16.6 },
        { z: -60.75, depth: 15.5 }
      ];
      for (const court of skywells) {
        const courtFloor = new THREE.Mesh(
          new THREE.BoxGeometry(14.8, 0.22, court.depth),
          floorMat
        );
        courtFloor.position.set(centerX, 1.07, court.z);
        courtFloor.receiveShadow = true;
        comp.add(courtFloor);
      }

      const galleryZones = [
        { z: -7.525, depth: 29.35 },
        { z: -30.5, depth: 16.6 },
        { z: -45.9, depth: 14.2 },
        { z: -60.75, depth: 15.5 },
        { z: -75.25, depth: 13.5 }
      ];
      for (const sideX of [13.8, 32.2]) {
        const galleryFloor = new THREE.Mesh(
          new THREE.BoxGeometry(3.8, 0.22, totalDepth),
          M.stoneLight
        );
        galleryFloor.position.set(sideX, 1.07, centerZ);
        galleryFloor.receiveShadow = true;
        comp.add(galleryFloor);

        for (const zone of galleryZones) {
          const galleryRoof = makeHippedRoofMesh(
            4.85, zone.depth + 0.8, 1.45, M.roofTile
          );
          galleryRoof.position.set(sideX, 5.72, zone.z);
          galleryRoof.castShadow = true;
          comp.add(galleryRoof);
        }

        for (const edge of [-1, 1]) {
          const colX = sideX + edge * 1.55;
          for (let z = 6.0; z >= -80.0; z -= 4.0) {
            const base = new THREE.Mesh(
              new THREE.BoxGeometry(0.46, 0.22, 0.46), M.creamTrim
            );
            base.position.set(colX, 1.19, z);
            comp.add(base);

            const column = new THREE.Mesh(
              new THREE.CylinderGeometry(0.14, 0.18, 3.78, 12), M.redColumn
            );
            column.position.set(colX, 3.19, z);
            column.castShadow = true;
            comp.add(column);

            const capital = new THREE.Mesh(
              new THREE.BoxGeometry(0.5, 0.2, 0.5), M.goldAccent
            );
            capital.position.set(colX, 5.18, z);
            comp.add(capital);
          }
        }
      }

      for (const edgeX of [12.25, 33.75]) {
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.62, totalDepth - 1.2), M.creamTrim
        );
        rail.position.set(edgeX, 1.55, centerZ);
        comp.add(rail);
        for (let z = 6.0; z >= -78.0; z -= 2.0) {
          const baluster = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.045, 0.54, 6), M.creamTrim
          );
          baluster.position.set(edgeX, 1.55, z);
          comp.add(baluster);
        }
      }

      // Cross-halls have timber side walls, a rear wall, carved front colonnades and tiled roofs.
      const addCrossHall = (z, width, depth, height, doorCount, roofRise = 2.35) => {
        const hall = new THREE.Group();
        hall.position.set(centerX, 0, z);

        const floor = new THREE.Mesh(
          new THREE.BoxGeometry(width + 0.8, 0.28, depth + 0.8), M.stoneLight
        );
        floor.position.y = 1.1;
        floor.receiveShadow = true;
        hall.add(floor);

        for (const side of [-1, 1]) {
          const sideWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.34, height, depth), M.goldWall
          );
          sideWall.position.set(side * width * 0.5, 1.24 + height * 0.5, 0);
          sideWall.castShadow = true;
          sideWall.receiveShadow = true;
          hall.add(sideWall);

          // Narrow timber-framed side windows keep the long elevations from reading as blank boxes.
          for (const wz of [-depth * 0.28, depth * 0.28]) {
            const windowFrame = new THREE.Mesh(
              new THREE.BoxGeometry(0.1, 1.2, 1.5), M.creamTrim
            );
            windowFrame.position.set(side * (width * 0.5 + 0.02), 3.75, wz);
            hall.add(windowFrame);
            for (let slat = 0; slat < 4; slat++) {
              const louver = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.055, 1.34), darkWoodBeam
              );
              louver.position.set(side * (width * 0.5 + 0.08), 3.28 + slat * 0.28, wz);
              hall.add(louver);
            }
          }
        }

        const rearWall = new THREE.Mesh(
          new THREE.BoxGeometry(width, height, 0.34), M.goldWall
        );
        rearWall.position.set(0, 1.24 + height * 0.5, -depth * 0.5);
        rearWall.castShadow = true;
        hall.add(rearWall);

        const frontZ = depth * 0.5 + 0.08;
        const beam = new THREE.Mesh(
          new THREE.BoxGeometry(width + 0.5, 0.28, 0.34), darkWoodBeam
        );
        beam.position.set(0, 5.12, frontZ);
        hall.add(beam);

        for (let i = 0; i <= doorCount; i++) {
          const x = -width * 0.5 + (width / doorCount) * i;
          const base = new THREE.Mesh(
            new THREE.BoxGeometry(0.48, 0.22, 0.48), M.stoneLight
          );
          base.position.set(x, 1.22, frontZ);
          hall.add(base);

          const column = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.18, 3.75, 12), M.redColumn
          );
          column.position.set(x, 3.19, frontZ);
          column.castShadow = true;
          hall.add(column);

          const capital = new THREE.Mesh(
            new THREE.BoxGeometry(0.52, 0.2, 0.52), M.goldAccent
          );
          capital.position.set(x, 5.08, frontZ);
          hall.add(capital);
        }

        for (let i = 0; i < doorCount; i++) {
          const bayWidth = width / doorCount;
          const x = -width * 0.5 + bayWidth * (i + 0.5);
          const doorWidth = Math.min(1.75, bayWidth * 0.62);
          const frame = new THREE.Mesh(
            new THREE.BoxGeometry(doorWidth + 0.24, 3.08, 0.16), M.creamTrim
          );
          frame.position.set(x, 2.72, frontZ + 0.06);
          hall.add(frame);

          const leaf = new THREE.Mesh(
            new THREE.BoxGeometry(doorWidth, 2.76, 0.09), M.darkWood
          );
          leaf.position.set(x, 2.66, frontZ + 0.16);
          hall.add(leaf);

          const centerSeam = new THREE.Mesh(
            new THREE.BoxGeometry(0.035, 2.58, 0.045), M.goldAccent
          );
          centerSeam.position.set(x, 2.66, frontZ + 0.22);
          hall.add(centerSeam);

          const transom = new THREE.Mesh(
            new THREE.BoxGeometry(doorWidth, 0.34, 0.06), darkWoodBeam
          );
          transom.position.set(x, 4.42, frontZ + 0.12);
          hall.add(transom);
          for (let bar = -2; bar <= 2; bar++) {
            const lattice = new THREE.Mesh(
              new THREE.BoxGeometry(0.035, 0.28, 0.035), M.goldAccent
            );
            lattice.position.set(x + bar * (doorWidth / 6), 4.42, frontZ + 0.16);
            hall.add(lattice);
          }
        }

        // A restrained blue-green ceramic frieze recalls the real mosaic work without over-gilding it.
        const frieze = new THREE.Mesh(
          new THREE.BoxGeometry(width + 0.4, 0.34, 0.12), ceramicJade
        );
        frieze.position.set(0, 5.48, frontZ + 0.02);
        hall.add(frieze);
        for (let i = 0; i < doorCount; i++) {
          const tile = new THREE.Mesh(
            new THREE.BoxGeometry(0.22, 0.22, 0.06),
            i % 2 === 0 ? ceramicBlue : M.mosaicRed
          );
          tile.position.set(-width * 0.5 + (i + 0.5) * (width / doorCount), 5.48, frontZ + 0.1);
          hall.add(tile);
        }

        const roof = makeHippedRoofMesh(
          width + 2.0, depth + 1.8, roofRise, M.roofTile
        );
        roof.position.set(0, 6.05, -0.12);
        roof.castShadow = true;
        hall.add(roof);

        const ridge = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, width + 0.8, 12),
          new THREE.MeshStandardMaterial({ color: 0x783D30, roughness: 0.72 })
        );
        ridge.rotation.z = Math.PI / 2;
        ridge.position.set(0, 7.55, -0.12);
        hall.add(ridge);

        comp.add(hall);
      };

      // Tiền đường is the existing 13-arch front hall; these halls continue the same central axis.
      addCrossHall(-14.1, 14.8, 16.2, 5.0, 5, 2.45);  // Chánh điện
      addCrossHall(-45.9, 14.8, 14.2, 4.9, 5, 2.3);   // Nhà tổ
      addCrossHall(-75.25, 16.0, 13.5, 5.0, 5, 2.35); // Nhà hậu

      // The first skywell contains the single non bộ between Chánh điện and Nhà tổ.
      const basin = new THREE.Mesh(
        new THREE.CylinderGeometry(3.25, 3.45, 0.42, 24), M.stoneDark
      );
      basin.position.set(centerX, 1.28, -30.5);
      comp.add(basin);
      const water = new THREE.Mesh(
        new THREE.CylinderGeometry(2.92, 2.92, 0.08, 24), M.water
      );
      water.position.set(centerX, 1.52, -30.5);
      comp.add(water);

      for (const [x, y, z, sx, sy, sz] of [
        [22.0, 2.45, -30.7, 1.25, 2.15, 1.0],
        [24.1, 2.1, -30.3, 1.05, 1.75, 0.9],
        [21.2, 1.9, -29.2, 0.82, 1.25, 0.78],
        [25.0, 1.85, -31.3, 0.76, 1.2, 0.72]
      ]) {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 1), rockMat);
        rock.scale.set(sx, sy, sz);
        rock.position.set(x, y, z);
        rock.castShadow = true;
        comp.add(rock);

        const moss = new THREE.Mesh(new THREE.SphereGeometry(0.48, 9, 7), mossMat);
        moss.scale.set(sx * 0.72, 0.24, sz * 0.72);
        moss.position.set(x, y + sy * 0.72, z);
        comp.add(moss);
      }

      const cascade = new THREE.Mesh(
        new THREE.PlaneGeometry(0.72, 1.9),
        new THREE.MeshBasicMaterial({
          color: 0xB8F0FA, transparent: true, opacity: 0.64, side: THREE.DoubleSide
        })
      );
      cascade.position.set(22.8, 2.1, -29.65);
      cascade.rotation.x = 0.12;
      comp.add(cascade);

      for (const [x, z] of [[18.8, -26.4], [27.2, -26.4], [18.8, -34.6], [27.2, -34.6]]) {
        const bonsai = this.makeBonsai72(0.68);
        bonsai.position.set(x, 1.18, z);
        comp.add(bonsai);
      }

      // The second skywell stays open, with only corner bonsai rather than a duplicate rockery.
      for (const [x, z] of [[18.8, -56.8], [27.2, -56.8], [18.8, -64.7], [27.2, -64.7]]) {
        const bonsai = this.makeBonsai72(0.62);
        bonsai.position.set(x, 1.18, z);
        comp.add(bonsai);
      }

      // Invisible selection volume spans the complete compound for the exterior-to-interior interaction.
      const compoundHit = new THREE.Mesh(
        new THREE.BoxGeometry(22.4, 10.5, totalDepth),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      compoundHit.position.set(centerX, 5.4, centerZ);
      comp.add(compoundHit);
      this.mainCompoundClickTargets.push(compoundHit);

      this.exteriorGroup.add(comp);
      // Front façade colliders already protect the entrance; leave the stair and side-door approaches clear.
      this.addRectObstacle(11.8, 34.2, rearZ, -6.5);
    };

    buildMainTempleCompound();

    // EXTERIOR MEKONG WOODEN STILT DINING HALL ("Nhà Sàn Gỗ Truyền Thống Miền Tây · Khu Ăn Phật Tử")
    // Placed East of walkway (center 59.5, 0, 14.5; x = 54.0..65.0, z = 7.0..22.0) with open West stairs at z = 12.8..16.2!
    const buildMekongStiltDiningPavilion = () => {
      const stilt = new THREE.Group();
      stilt.position.set(59.5, 0, 14.5);

      const stiltWoodMat = new THREE.MeshStandardMaterial({ color: 0x4E2C16, map: this.woodGrainTex, roughness: 0.68 });
      const plankDeckMat = new THREE.MeshStandardMaterial({ color: 0x784722, map: this.woodGrainTex, roughness: 0.56 });
      const railWoodMat = new THREE.MeshStandardMaterial({ color: 0x5E3419, roughness: 0.6 });
      const tableMat = new THREE.MeshStandardMaterial({ color: 0x6A3A1A, roughness: 0.48 });
      const bowlMat = new THREE.MeshStandardMaterial({ color: 0xFFFDF8, roughness: 0.25 });
      const potMat = new THREE.MeshStandardMaterial({ color: 0xC9D1D8, metalness: 0.55, roughness: 0.28 });

      // 1. Calm lotus canal pond basin underneath the stilts
      const basinCurb = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.42, 15.6), M.stoneDark);
      basinCurb.position.y = 0.21;
      stilt.add(basinCurb);
      const canalWater = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.34, 14.8), M.water);
      canalWater.position.y = 0.27;
      stilt.add(canalWater);

      // Lotus blossoms & pads floating around the stilts beneath the deck
      for (const [lx, lz] of [[-4.8, -5.8], [-4.9, 5.2], [4.7, -5.5], [4.8, 5.8], [-4.7, -2.5], [4.7, 2.2]]) {
        const pad = new THREE.Mesh(
          new THREE.CylinderGeometry(0.42, 0.42, 0.04, 12),
          new THREE.MeshStandardMaterial({ color: 0x3A7B3B, roughness: 0.72 })
        );
        pad.position.set(lx, 0.46, lz);
        stilt.add(pad);
        const bloom = new THREE.Mesh(
          new THREE.ConeGeometry(0.2, 0.26, 7),
          new THREE.MeshStandardMaterial({ color: 0xF579A8, roughness: 0.45 })
        );
        bloom.rotation.x = Math.PI;
        bloom.position.set(lx, 0.62, lz);
        stilt.add(bloom);
      }

      // 2. Ironwood stilts seated on stone column footings in water + under-floor bearers
      for (const sx of [-4.2, -1.4, 1.4, 4.2]) {
        for (const sz of [-6.0, -2.0, 2.0, 6.0]) {
          const footing = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 0.48, 10), M.stoneLight);
          footing.position.set(sx, 0.24, sz);
          stilt.add(footing);
          const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 1.08, 10), stiltWoodMat);
          pile.position.set(sx, 0.6, sz);
          pile.castShadow = true;
          stilt.add(pile);
        }
        const bearer = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 13.6), stiltWoodMat);
        bearer.position.set(sx, 0.96, 0);
        stilt.add(bearer);
      }

      // 3. Elevated hardwood plank floor deck at y = +1.05m (10.2m x 14.0m)
      const deck = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.18, 14.0), plankDeckMat);
      deck.position.set(0, 1.05, 0);
      deck.receiveShadow = true;
      deck.castShadow = true;
      stilt.add(deck);

      // Planking seam lines across the hardwood floor
      for (let pz = -6.6; pz <= 6.6; pz += 0.65) {
        const seam = new THREE.Mesh(
          new THREE.BoxGeometry(10.0, 0.02, 0.04),
          new THREE.MeshStandardMaterial({ color: 0x3B2010, roughness: 0.85 })
        );
        seam.position.set(0, 1.14, pz);
        stilt.add(seam);
      }

      // 4. Open-Air Balustrades (Lan can gỗ truyền thống) with West Bridge Stair Opening (z = -1.7..+1.7)
      const addBalustrade = (x1, z1, x2, z2) => {
        const dx = x2 - x1;
        const dz = z2 - z1;
        const len = Math.hypot(dx, dz);
        const railGroup = new THREE.Group();
        const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, len), railWoodMat);
        topBar.position.y = 0.85;
        railGroup.add(topBar);
        const midBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, len), railWoodMat);
        midBar.position.y = 0.42;
        railGroup.add(midBar);
        const nSpindle = Math.max(2, Math.floor(len / 0.55));
        for (let si = 0; si <= nSpindle; si++) {
          const sp = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.84, 0.07), railWoodMat);
          sp.position.set(0, 0.42, -len / 2 + (si / nSpindle) * len);
          railGroup.add(sp);
        }
        railGroup.position.set((x1 + x2) / 2, 1.12, (z1 + z2) / 2);
        railGroup.rotation.y = Math.atan2(dx, dz);
        stilt.add(railGroup);
      };
      addBalustrade(-4.95, -6.85, 4.95, -6.85);
      addBalustrade(-4.95, 6.85, 4.95, 6.85);
      addBalustrade(4.95, -6.85, 4.95, 6.85);
      addBalustrade(-4.95, -6.85, -4.95, -1.7);
      addBalustrade(-4.95, 1.7, -4.95, 6.85);

      // Wide West Wooden Entrance Stairway/Bridge climbing smoothly onto Nhà Sàn (x_world = 52.2..54.6, z_world = 14.5)
      for (let stIdx = 0; stIdx < 5; stIdx++) {
        const tread = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.22, 3.4), plankDeckMat);
        tread.position.set(-7.2 + stIdx * 0.52, 0.11 + stIdx * 0.22, 0);
        tread.castShadow = true;
        tread.receiveShadow = true;
        stilt.add(tread);
      }
      for (const rz of [-1.75, 1.75]) {
        const stairRail = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.09, 0.1), railWoodMat);
        stairRail.position.set(-6.15, 1.38, rz);
        stairRail.rotation.z = 0.38;
        stilt.add(stairRail);
      }

      // 5. Traditional Mekong Timber Columns, Exposed Vì Kèo Rafters & Two-Tier Southern Roof
      for (const cx of [-4.4, 4.4]) {
        for (const cz of [-6.0, -2.0, 2.0, 6.0]) {
          const uCol = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 3.55, 10), stiltWoodMat);
          uCol.position.set(cx, 2.9, cz);
          uCol.castShadow = true;
          stilt.add(uCol);
        }
      }
      for (const rz of [-6.0, -2.0, 2.0, 6.0]) {
        const tieBeam = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.18, 0.16), stiltWoodMat);
        tieBeam.position.set(0, 4.62, rz);
        stilt.add(tieBeam);
        const kingPost = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.25, 0.16), stiltWoodMat);
        kingPost.position.set(0, 5.25, rz);
        stilt.add(kingPost);
        for (const sSign of [-1, 1]) {
          const strut = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.13, 0.13), stiltWoodMat);
          strut.position.set(sSign * 2.15, 5.18, rz);
          strut.rotation.z = sSign * -0.26;
          stilt.add(strut);
        }
      }
      const lowerRoof = makeHippedRoofMesh(12.2, 16.0, 1.9, M.roofTile);
      lowerRoof.position.set(0, 5.65, 0);
      lowerRoof.castShadow = true;
      stilt.add(lowerRoof);
      const upperMonitor = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.65, 10.6), stiltWoodMat);
      upperMonitor.position.set(0, 6.55, 0);
      stilt.add(upperMonitor);
      const upperRoof = makeHippedRoofMesh(8.4, 11.8, 1.35, M.roofTile);
      upperRoof.position.set(0, 7.35, 0);
      upperRoof.castShadow = true;
      stilt.add(upperRoof);

      // 6. Long Wooden Dining Tables, Benches, Serving Counter & Mekong Earthenware Water Urns
      for (const tx of [-1.2, 2.2]) {
        for (const tz of [-3.9, 3.9]) {
          const tbl = new THREE.Group();
          tbl.position.set(tx, 1.14, tz);
          const top = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 3.6), tableMat);
          top.position.y = 0.72;
          tbl.add(top);
          for (const lx of [-0.5, 0.5]) {
            for (const lz of [-1.5, 1.5]) {
              const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.08), tableMat);
              leg.position.set(lx, 0.36, lz);
              tbl.add(leg);
            }
          }
          for (const bx of [-0.9, 0.9]) {
            const bench = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 3.4), tableMat);
            bench.position.set(bx, 0.42, 0);
            tbl.add(bench);
          }
          for (const bPos of [-1.1, -0.35, 0.35, 1.1]) {
            const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.06, 0.08, 10), bowlMat);
            bowl.position.set(0, 0.8, bPos);
            tbl.add(bowl);
          }
          stilt.add(tbl);
        }
      }

      // Serving counter & Mekong water urn ("Lu nước mát & nồi canh chay") on East side
      const serveCounter = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 4.6), M.redColumn);
      serveCounter.position.set(3.9, 1.58, 0);
      stilt.add(serveCounter);
      for (const pz of [-1.4, 0, 1.4]) {
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.26, 0.32, 12), potMat);
        pot.position.set(3.9, 2.18, pz);
        stilt.add(pot);
      }
      const luNuoc = new THREE.Mesh(new THREE.SphereGeometry(0.45, 14, 12), M.terracottaPot);
      luNuoc.scale.set(1.0, 1.18, 1.0);
      luNuoc.position.set(3.8, 1.65, -5.6);
      stilt.add(luNuoc);

      const stiltSign = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.76, 5.2),
        new THREE.MeshStandardMaterial({
          map: makeTextTex('NHÀ SÀN TRAI ĐƯỜNG · KHU ĂN PHẬT TỬ', {
            w: 1120,
            h: 180,
            bg: '#5C1610',
            border: '#FFD875',
            color: '#FFF2B2',
            size: 50
          })
        })
      );
      stiltSign.position.set(-4.62, 3.95, 0);
      stilt.add(stiltSign);

      this.exteriorGroup.add(stilt);
      this.stiltDiningClickTargets.push(stiltSign, deck, serveCounter);

      // Perimeter pond rail colliders leaving ONLY West stair opening (z = 12.8..16.2) walkable onto deck!
      this.addRectObstacle(53.7, 65.4, 6.6, 7.6);
      this.addRectObstacle(53.7, 65.4, 21.4, 22.4);
      this.addRectObstacle(64.4, 65.4, 7.2, 21.8);
      this.addRectObstacle(53.6, 54.6, 7.2, 12.6);
      this.addRectObstacle(53.6, 54.6, 16.4, 21.8);
    };
    buildMekongStiltDiningPavilion();

    // Giảng đường Phật pháp (East Sanctuary Pavilion shifted cleanly to (58.5, 0, -18.0) so straight lane x = 40.5 stays 100% open!)
    const giangDuong = this.buildGiangDuong();
    giangDuong.position.set(58.5, 0, -18.0);
    const gdSteps = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 3.6), M.stoneLight);
    gdSteps.position.set(-5.2, 0.175, 0);
    giangDuong.add(gdSteps);
    this.exteriorGroup.add(giangDuong);
    this.lectureClickTargets.push(giangDuong);
    this.addRectObstacle(53.4, 63.8, -27.5, -8.5);

    // 7-Tier Terracotta Bảo Tháp in the rear garden near the reclining Buddha (upgraded with bao-thap-7-tang.glb on load).
    this.stupaGroup = this.buildSevenTierStupa();
    this.stupaGroup.position.set(-8.0, 0, -37.0);
    this.exteriorGroup.add(this.stupaGroup);
    this.addObstacle(-8.0, -37.0, 4.2);

    this.buildStatuePedestals();

    // Large South-Center Lotus Pond right west of Tam Quan courtyard
    const pond1 = this.buildLotusPond(14.5, 16.5, 16, true);
    pond1.position.set(3.5, 0, 33.0);
    this.exteriorGroup.add(pond1);
    this.addRectObstacle(-4.2, 11.2, 24.4, 41.6);

    this.lanternWishesGroup.position.set(3.5, 0.56, 33.0);
    this.exteriorGroup.add(this.lanternWishesGroup);

    // Secondary Inner Lotus Basin beside the central monastic hall
    const pond2 = this.buildLotusPond(8.0, 10.5, 8, false);
    pond2.position.set(2.0, 0, -1.5);
    this.exteriorGroup.add(pond2);
    this.addRectObstacle(-2.4, 6.4, -7.2, 4.2);

    // Twin Three-Tier White-Gold Stupas in Middle Plaza
    for (const tz of [20.5, 25.0]) {
      const miniStupa = new THREE.Group();
      for (let t = 0; t < 3; t++) {
        const w = 1.85 - t * 0.42;
        const h = 1.45 - t * 0.2;
        const tier = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), M.creamTrim);
        tier.position.y = 0.72 + t * 1.38;
        tier.castShadow = true;
        miniStupa.add(tier);
        const eaves = makeHippedRoofMesh(w + 0.45, w + 0.45, 0.48, M.goldAccent);
        eaves.position.y = 1.55 + t * 1.38;
        miniStupa.add(eaves);
      }
      const finial = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.9, 8), M.goldAccent);
      finial.position.y = 5.1;
      miniStupa.add(finial);
      miniStupa.position.set(-5.8, 0, tz);
      this.exteriorGroup.add(miniStupa);
      this.addObstacle(-5.8, tz, 1.3);
    }

    // Incense burner in Flag Courtyard + bloom light/ring anchored in Main Lotus Pond
    const mainBurner = this.buildIncenseBurner(0.88);
    mainBurner.position.set(23.0, 0, 12.0);
    this.exteriorGroup.add(mainBurner);
    this.addObstacle(23.0, 12.0, 1.05);
    this.incenseSticksGroup.position.set(23.0, 1.32, 12.0);
    this.exteriorGroup.add(this.incenseSticksGroup);

    this.offeredLotusesGroup.position.set(5.4, 0.62, 33.0);
    this.exteriorGroup.add(this.offeredLotusesGroup);

    const bloomLight = new THREE.PointLight(0xFFD97D, 0, 24);
    bloomLight.position.set(4.5, 2.8, 33.0);
    this.exteriorGroup.add(bloomLight);
    this.lotusBloomState.burstLight = bloomLight;

    const bloomRing = new THREE.Mesh(
      new THREE.RingGeometry(1.0, 1.55, 36),
      new THREE.MeshBasicMaterial({
        color: 0xFFE699,
        side: THREE.DoubleSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0
      })
    );
    bloomRing.rotation.x = -Math.PI / 2;
    bloomRing.position.set(5.4, 0.72, 33.0);
    this.exteriorGroup.add(bloomRing);
    this.lotusBloomState.burstRing = bloomRing;

    const burnerAdida = this.buildIncenseBurner(0.75);
    burnerAdida.position.set(15.8, 0, 17.5);
    this.exteriorGroup.add(burnerAdida);
    this.addObstacle(15.8, 17.5, 0.9);

    // Incense burner centered at Di Lặc stepped staircase
    const burnerDiLac = this.buildIncenseBurner(0.78);
    burnerDiLac.position.set(-24.5, 1.72, 17.2);
    this.exteriorGroup.add(burnerDiLac);

    // Incense burner at the visitor approach to the reclining Buddha.
    const burnerNietBan = this.buildIncenseBurner(0.68);
    burnerNietBan.position.set(-24.5, 0, -13.5);
    this.exteriorGroup.add(burnerNietBan);
    this.addObstacle(-24.5, -13.5, 0.82);

    // Incense burner beside Đài Quán Thế Âm on the RIGHT side pathway
    const burnerQuanAm = this.buildIncenseBurner(0.62);
    burnerQuanAm.position.set(34.5, 0, 22.5);
    this.exteriorGroup.add(burnerQuanAm);
    this.addObstacle(34.5, 22.5, 0.72);

    const cushionCoords = [
      [21.4, 13.4, Math.PI],
      [24.6, 13.4, Math.PI],
      [14.2, 17.5, -Math.PI / 2],
      [-24.5, 21.8, Math.PI],
      [35.2, 22.5, -Math.PI / 2],
      [-24.5, -10.5, 0]
    ];
    for (const [kx, kz, kyaw] of cushionCoords) {
      const c = this.makeKneelingCushion();
      c.position.set(kx, 0, kz);
      c.rotation.y = kyaw;
      this.exteriorGroup.add(c);
    }

    const lanternZ = [29, 35];
    for (const z of lanternZ) {
      for (const x of [19.4, 26.8]) {
        const l = this.makeStoneLantern();
        l.position.set(x, 0, z);
        this.exteriorGroup.add(l);
        this.addObstacle(x, z, 0.65);
      }
    }

    this.buildGardensTreesAndFlags();
    this.buildExpandedDiscoveryZones();
    this.buildCourtyardPigeons();
    this.buildInteractiveCourtyardLeaves();
    this.buildInteractiveGardenPlots();
  }

  buildExpandedDiscoveryZones() {
    const M = this.MAT;
    const pathMat = new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xDCD0B8, roughness: 0.82 });
    const lawnMat = new THREE.MeshStandardMaterial({ color: 0x548342, roughness: 0.9 });
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x6A6760, roughness: 0.88 });
    const mossMat = new THREE.MeshStandardMaterial({ color: 0x4C7338, roughness: 0.85 });
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x2F6E66,
      roughness: 0.16,
      metalness: 0.25,
      transparent: true,
      opacity: 0.92
    });
    const ribbonRedMat = new THREE.MeshStandardMaterial({ color: 0xC92A2A, roughness: 0.65, side: THREE.DoubleSide });
    const ribbonGoldMat = new THREE.MeshStandardMaterial({ color: 0xE6B84C, roughness: 0.55, side: THREE.DoubleSide });

    // Garden connecting walkways across West (-65..-36), North (-70..-42), and East (50..66) discovery wings
    const addWalkStrip = (x, z, w, d) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.11, d), pathMat);
      m.position.set(x, 0.005, z);
      m.receiveShadow = true;
      this.exteriorGroup.add(m);
    };
    addWalkStrip(-44.0, 8.0, 5.4, 72.0); // West promenade path linking Vườn Lâm Tỳ Ni -> Non Bộ -> Vườn La Hán -> Tháp Chuông
    addWalkStrip(-10.0, -45.5, 76.0, 5.2); // North promenade linking Tháp Chuông -> Hồ Phóng Sinh -> Bảo Tháp -> Nhà Tổ -> Lầu Trống
    addWalkStrip(51.5, -12.0, 4.8, 66.0); // East tea garden path linking Cổng Phụ garden -> Lầu Trà Thiền -> Lầu Trống
    addWalkStrip(38.5, -18.0, 9.0, 4.4); // Connector from East courtyard corridor into Giảng Đường (44, -18)
    addWalkStrip(-40.5, 29.0, 18.0, 4.4); // Connector from Di Lặc Plaza into Vườn Lâm Tỳ Ni

    // 1. VƯỜN LÂM TỲ NI & CÂY BỒ ĐỀ CỔ THỤ (-53.5, 22.0)
    const ltyn = new THREE.Group();
    ltyn.position.set(-53.5, 0, 22.0);
    const lawn = new THREE.Mesh(new THREE.CylinderGeometry(9.6, 10.2, 0.16, 24), lawnMat);
    lawn.position.y = 0.08;
    ltyn.add(lawn);
    const stoneRing = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.6, 0.42, 16), M.stoneLight);
    stoneRing.position.y = 0.25;
    ltyn.add(stoneRing);
    // Golden Newborn Buddha (Thái Tử Đản Sanh) atop blooming 7-step lotus pedestal
    const lotusBase = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.35, 0.72, 16), M.mosaicRed);
    lotusBase.position.y = 0.82;
    ltyn.add(lotusBase);
    const lotusCap = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.75, 0.35, 16), M.lotusBlue);
    lotusCap.position.y = 1.32;
    ltyn.add(lotusCap);
    const infantBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 1.05, 12), M.goldAccent);
    infantBody.position.y = 2.02;
    ltyn.add(infantBody);
    const infantHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), M.goldAccent);
    infantHead.position.y = 2.7;
    ltyn.add(infantHead);
    const rightArmUp = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.65, 8), M.goldAccent);
    rightArmUp.position.set(0.28, 2.75, 0);
    ltyn.add(rightArmUp);
    // Ancient Bodhi tree ("Cây Bồ Đề Cổ Thụ") with wish ribbons
    const bodhiTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.88, 4.6, 12), M.trunk);
    bodhiTrunk.position.set(-4.2, 2.3, -3.2);
    bodhiTrunk.castShadow = true;
    ltyn.add(bodhiTrunk);
    for (const [cx, cy, cz, r] of [
      [-4.2, 5.6, -3.2, 3.2],
      [-6.2, 4.8, -2.2, 2.2],
      [-2.1, 5.0, -3.5, 2.3],
      [-4.4, 5.2, -5.2, 2.1]
    ]) {
      const cr = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), M.foliageLight);
      cr.position.set(cx, cy, cz);
      cr.castShadow = true;
      ltyn.add(cr);
    }
    for (let ri = 0; ri < 14; ri++) {
      const a = (ri / 14) * Math.PI * 2;
      const rib = new THREE.Mesh(
        new THREE.PlaneGeometry(0.14, 0.95),
        ri % 2 === 0 ? ribbonRedMat : ribbonGoldMat
      );
      rib.position.set(-4.2 + Math.cos(a) * 2.2, 3.6 + (ri % 3) * 0.25, -3.2 + Math.sin(a) * 2.2);
      ltyn.add(rib);
    }
    const ltynSign = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.72, 0.14),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('VƯỜN LÂM TỲ NI · CÂY BỒ ĐỀ', { w: 960, h: 180, bg: '#1C5A34', border: '#FFD875', color: '#FFF6E5', size: 48 })
      })
    );
    ltynSign.position.set(4.5, 1.15, 4.5);
    ltynSign.rotation.y = 0.65;
    ltyn.add(ltynSign);
    this.exteriorGroup.add(ltyn);
    this.addObstacle(-53.5, 22.0, 4.4);
    this.addObstacle(-57.7, 18.8, 1.8);

    // 2. HÒN NON BỘ & ĐỘNG QUÁN THẾ ÂM (-54.0, -4.0)
    const nonBo = new THREE.Group();
    nonBo.position.set(-54.0, 0, -4.0);
    const basinCurb = new THREE.Mesh(new THREE.CylinderGeometry(8.2, 8.6, 0.62, 24), M.stoneDark);
    basinCurb.position.y = 0.31;
    nonBo.add(basinCurb);
    const poolWater = new THREE.Mesh(new THREE.CylinderGeometry(7.6, 7.6, 0.56, 24), waterMat);
    poolWater.position.y = 0.34;
    nonBo.add(poolWater);
    // Sculpted layered limestone peaks + grotto arch + cascading waterfall
    for (const [rx, ry, rz, sx, sy, sz] of [
      [-1.4, 2.2, -1.2, 2.8, 4.4, 2.6],
      [1.8, 1.8, -1.5, 2.4, 3.6, 2.2],
      [-2.8, 1.1, 1.0, 1.9, 2.2, 1.8],
      [2.6, 1.0, 1.2, 1.7, 2.0, 1.7],
      [0.0, 3.4, -2.0, 2.2, 5.2, 2.1]
    ]) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.0, 1), rockMat);
      rock.scale.set(sx, sy, sz);
      rock.position.set(rx, ry, rz);
      rock.castShadow = true;
      nonBo.add(rock);
      const moss = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 6), mossMat);
      moss.scale.set(sx * 0.72, 0.32, sz * 0.72);
      moss.position.set(rx, ry + sy * 0.68, rz);
      nonBo.add(moss);
    }
    const waterfall = new THREE.Mesh(
      new THREE.PlaneGeometry(1.25, 3.8),
      new THREE.MeshBasicMaterial({ color: 0xB8F0FA, transparent: true, opacity: 0.78, side: THREE.DoubleSide })
    );
    waterfall.position.set(-0.2, 2.25, -0.3);
    waterfall.rotation.x = 0.14;
    nonBo.add(waterfall);
    // Sculpted White Quán Thế Âm standing inside Non Bộ niche
    const qaSculpt = createSculptedBodhisattva(THREE, { variant: 'quan_am', ivory: true, scale: 0.72 });
    qaSculpt.position.set(0.2, 1.8, 0.65);
    nonBo.add(qaSculpt);
    // Arched stone footbridge in front of Non Bộ
    const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.18, 4.2), M.creamTrim);
    bridgeDeck.position.set(5.4, 0.85, 0);
    nonBo.add(bridgeDeck);
    const nbPlaque = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.68, 0.14),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('HÒN NON BỘ · ĐỘNG QUÁN ÂM', { w: 960, h: 180, bg: '#5C1B12', border: '#FFD875', color: '#FFE08A', size: 46 })
      })
    );
    nbPlaque.position.set(6.8, 1.05, 2.8);
    nbPlaque.rotation.y = Math.PI / 2;
    nonBo.add(nbPlaque);
    this.exteriorGroup.add(nonBo);
    this.addObstacle(-54.0, -4.0, 8.6);

    // 3. VƯỜN LA HÁN NGOÀI TRỜI & CÂY SA LA (-49.5, -24.0)
    const arhatGarden = new THREE.Group();
    arhatGarden.position.set(-49.5, 0, -24.0);
    const agPlaza = new THREE.Mesh(new THREE.CylinderGeometry(7.8, 8.2, 0.24, 24), M.stoneLight);
    agPlaza.position.y = 0.12;
    agPlaza.receiveShadow = true;
    arhatGarden.add(agPlaza);
    for (let ai = 0; ai < 4; ai++) {
      const ang = (ai / 4) * Math.PI * 2 + Math.PI / 4;
      const px = Math.cos(ang) * 4.4;
      const pz = Math.sin(ang) * 4.4;
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.82, 0.72, 12), M.stoneDark);
      ped.position.set(px, 0.48, pz);
      arhatGarden.add(ped);
      const stat = createSculptedGardenArhat(THREE, ai, { scale: 1.08 });
      stat.position.set(px, 0.84, pz);
      stat.rotation.y = Math.atan2(-px, -pz);
      stat.userData.arhatIndex = ai;
      arhatGarden.add(stat);
    }
    const agSign = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 0.72, 0.14),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('VƯỜN LA HÁN · CÂY SA LA', { w: 960, h: 180, bg: '#1C5A34', border: '#FFD875', color: '#FFF6E5', size: 46 })
      })
    );
    agSign.position.set(5.4, 1.18, 2.8);
    agSign.rotation.y = Math.PI / 2;
    arhatGarden.add(agSign);
    this.outdoorArhatPlaza = arhatGarden;
    this.exteriorGroup.add(arhatGarden);
    this.addObstacle(-49.5, -24.0, 5.2);

    // 4. HỒ PHÓNG SINH LỚN & CẦU GỖ CHỮ Z (-16.0, -56.0)
    const releasePond = this.buildLotusPond(24.0, 15.0, 18, false);
    releasePond.position.set(-16.0, 0, -56.0);
    this.exteriorGroup.add(releasePond);
    this.addRectObstacle(-28.5, -3.5, -64.0, -48.0);
    // Zig-zag wooden bridge over Hồ Phóng Sinh
    const zBridge = new THREE.Group();
    const woodRed = new THREE.MeshStandardMaterial({ color: 0x8A3224, roughness: 0.64 });
    const bridgeSeg1 = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.16, 1.55), woodRed);
    bridgeSeg1.position.set(-5.2, 0.88, 2.4);
    zBridge.add(bridgeSeg1);
    const bridgeSeg2 = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.16, 6.2), woodRed);
    bridgeSeg2.position.set(-0.6, 0.88, 0.0);
    zBridge.add(bridgeSeg2);
    const bridgeSeg3 = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.16, 1.55), woodRed);
    bridgeSeg3.position.set(4.0, 0.88, -2.4);
    zBridge.add(bridgeSeg3);
    zBridge.position.set(-16.0, 0, -56.0);
    this.exteriorGroup.add(zBridge);

    // 5. THÁP ĐẠI HỒNG CHUNG (-44, -56) & LẦU TRỐNG BÁT NHÃ (46, -56)
    const buildBellDrumTower = (tx, tz, labelText, isBell = true) => {
      const tg = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.9, 6.4), M.stoneLight);
      base.position.y = 0.45;
      base.receiveShadow = true;
      tg.add(base);
      for (const px of [-2.3, 2.3]) {
        for (const pz of [-2.3, 2.3]) {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 6.8, 10), M.redColumn);
          col.position.set(px, 4.2, pz);
          col.castShadow = true;
          tg.add(col);
        }
      }
      const floor2 = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.35, 6.0), M.goldWall);
      floor2.position.y = 4.6;
      tg.add(floor2);
      const roof1 = makeHippedRoofMesh(7.6, 7.6, 1.75, M.roofTile);
      roof1.position.y = 5.5;
      tg.add(roof1);
      const roof2 = makeHippedRoofMesh(5.6, 5.6, 1.95, M.roofTile);
      roof2.position.y = 8.45;
      tg.add(roof2);
      if (isBell) {
        const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.85, 1.55, 16), M.bronzeBurner);
        bell.position.y = 6.35;
        tg.add(bell);
        this.bellTowerArchAnchors.push({ group: tg, placeholder: bell, y: 5.55, targetH: 1.72 });
        this.bellTowerClickTargets.push(tg);
      } else {
        const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 1.35, 16), M.mosaicRed);
        drum.rotation.z = Math.PI / 2;
        drum.position.y = 6.25;
        tg.add(drum);
        this.drumTowerArchAnchors.push({ group: tg, placeholder: drum, y: 5.5, targetH: 1.5 });
      }
      const plaque = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 0.68, 0.14),
        new THREE.MeshStandardMaterial({
          map: makeTextTex(labelText, { w: 960, h: 180, bg: '#5C1B12', border: '#FFD875', color: '#FFD970', size: 46 })
        })
      );
      plaque.position.set(0, 3.85, 2.55);
      tg.add(plaque);
      tg.position.set(tx, 0, tz);
      this.exteriorGroup.add(tg);
      this.addRectObstacle(tx - 3.6, tx + 3.6, tz - 3.6, tz + 3.6);
    };
    buildBellDrumTower(-44.0, -56.0, 'LẦU ĐẠI HỒNG CHUNG', true);
    buildBellDrumTower(46.0, -56.0, 'LẦU TRỐNG BÁT NHÃ', false);

    // 6. HẬU TỔ · NHÀ THỜ TỔ MIỀN NAM (22.0, -58.0)
    const nhaTo = new THREE.Group();
    nhaTo.position.set(22.0, 0, -58.0);
    const ntPlinth = new THREE.Mesh(new THREE.BoxGeometry(20.5, 0.68, 11.5), M.stoneLight);
    ntPlinth.position.y = 0.34;
    ntPlinth.receiveShadow = true;
    nhaTo.add(ntPlinth);
    const ntBody = new THREE.Mesh(new THREE.BoxGeometry(18.5, 4.6, 9.2), M.goldWall);
    ntBody.position.y = 2.95;
    ntBody.castShadow = true;
    nhaTo.add(ntBody);
    for (let ci = -3; ci <= 3; ci++) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 4.6, 10), M.darkWood);
      col.position.set(ci * 2.8, 2.95, 5.1);
      nhaTo.add(col);
    }
    const ntRoof = makeHippedRoofMesh(21.4, 12.2, 3.1, M.roofTile);
    ntRoof.position.y = 6.75;
    ntRoof.castShadow = true;
    nhaTo.add(ntRoof);
    const ntPlaque = new THREE.Mesh(
      new THREE.BoxGeometry(6.8, 0.95, 0.16),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('TỔ ĐƯỜNG VĨNH TRÀNG', { w: 1200, h: 200, bg: '#32140A', border: '#FFD875', color: '#FFD970', size: 62 })
      })
    );
    ntPlaque.position.set(0, 5.2, 5.25);
    nhaTo.add(ntPlaque);
    const ntBurner = this.buildIncenseBurner(0.66);
    ntBurner.position.set(0, 0.68, 6.2);
    nhaTo.add(ntBurner);
    this.exteriorGroup.add(nhaTo);
    this.addRectObstacle(11.6, 32.4, -64.0, -51.5);

    // 7. LẦU TRÀ THIỀN & VƯỜN LAN CỔ TỰ (58.0, -12.0)
    const teaGroup = new THREE.Group();
    teaGroup.position.set(58.0, 0, -12.0);
    const teaBase = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.8, 0.45, 8), M.stoneLight);
    teaBase.position.y = 0.225;
    teaGroup.add(teaBase);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 3.6, 8), M.darkWood);
      post.position.set(Math.cos(a) * 3.4, 2.2, Math.sin(a) * 3.4);
      teaGroup.add(post);
    }
    const teaRoof = new THREE.Mesh(new THREE.ConeGeometry(4.8, 1.9, 8), M.roofTile);
    teaRoof.position.y = 4.95;
    teaRoof.castShadow = true;
    teaGroup.add(teaRoof);
    const teaTable = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.72, 0.74, 12), M.stoneDark);
    teaTable.position.y = 0.82;
    teaGroup.add(teaTable);
    const teaPot = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), M.terracottaPot);
    teaPot.position.y = 1.32;
    teaGroup.add(teaPot);
    for (let s = 0; s < 4; s++) {
      const sa = (s / 4) * Math.PI * 2 + 0.4;
      const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.45, 10), M.stoneLight);
      stool.position.set(Math.cos(sa) * 1.55, 0.68, Math.sin(sa) * 1.55);
      teaGroup.add(stool);
    }
    // Orchid trellis pergola behind Lầu Trà Thiền
    const orchidArch = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.18, 9.0), M.darkWood);
    orchidArch.position.set(0, 3.35, -8.5);
    teaGroup.add(orchidArch);
    for (const pz of [-12.0, -5.0]) {
      for (const px of [-2.1, 2.1]) {
        const oPost = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 3.4, 8), M.darkWood);
        oPost.position.set(px, 1.7, pz);
        teaGroup.add(oPost);
      }
    }
    for (let oi = 0; oi < 8; oi++) {
      const oz = -11.5 + oi * 0.9;
      const ox = (oi % 2 === 0 ? -1 : 1) * 1.1;
      const bloom = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 6),
        new THREE.MeshStandardMaterial({ color: oi % 2 === 0 ? 0xCE78C8 : 0xFFF2F8, roughness: 0.5 })
      );
      bloom.position.set(ox, 2.72, oz);
      teaGroup.add(bloom);
    }
    const teaSign = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.65, 0.12),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('LẦU TRÀ THIỀN · VƯỜN LAN', { w: 960, h: 180, bg: '#1C5A34', border: '#FFD875', color: '#FFF6E5', size: 46 })
      })
    );
    teaSign.position.set(-3.8, 3.15, 0);
    teaSign.rotation.y = -Math.PI / 2;
    teaGroup.add(teaSign);
    this.exteriorGroup.add(teaGroup);
    this.addObstacle(58.0, -12.0, 4.4);
  }

  buildFenceAndGateWall() {
    const M = this.MAT;
    const g = new THREE.Group();
    const baseMat = M.goldWall;
    const barMat = M.goldAccent;

    const addWallSeg = (x1, z1, x2, z2) => {
      const len = Math.hypot(x2 - x1, z2 - z1);
      const ang = Math.atan2(x2 - x1, z2 - z1);
      const seg = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.85, len), baseMat);
      base.position.y = 0.425;
      seg.add(base);
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, len), barMat);
      topRail.position.y = 2.05;
      seg.add(topRail);
      const posts = Math.max(2, Math.floor(len / 4.5));
      for (let i = 0; i <= posts; i++) {
        const pz = -len / 2 + (i / posts) * len;
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.55, 2.35, 0.55), baseMat);
        post.position.set(0, 1.175, pz);
        seg.add(post);
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), M.lotusBlue);
        cap.position.set(0, 2.48, pz);
        seg.add(cap);
      }
      seg.position.set((x1 + x2) / 2, 0, (z1 + z2) / 2);
      seg.rotation.y = ang;
      g.add(seg);
    };

    // Expanded Perimeter walls (-68..68, -92..41.5), leaving ONLY Cổng Phụ (x=35.8..45.2) open!
    addWallSeg(-68, 41.5, 17, 41.5);
    addWallSeg(29, 41.5, 35.8, 41.5);
    addWallSeg(45.2, 41.5, 68, 41.5);
    addWallSeg(-68, -92, -68, 41.5);
    addWallSeg(68, -92, 68, 41.5);
    addWallSeg(-68, -92, 68, -92);

    this.addRectObstacle(-68.5, 17.2, 40.9, 42.1);
    this.addRectObstacle(28.8, 36.6, 40.9, 42.1);
    this.addRectObstacle(44.4, 68.5, 40.9, 42.1);
    this.addRectObstacle(-68.8, -67.2, -92.5, 42.0);
    this.addRectObstacle(67.2, 68.8, -92.5, 42.0);
    this.addRectObstacle(-68.5, 68.5, -92.8, -91.2);

    this.exteriorGroup.add(g);
  }

  buildTamQuanGate(signText = 'CHÙA VĨNH TRÀNG', isMainGate = false) {
    const M = this.MAT;
    const g = new THREE.Group();
    const structGroup = new THREE.Group();
    g.add(structGroup);
    if (isMainGate) {
      this.tamQuanProceduralParts.push(structGroup);
    }
    const pillarPositions = [-5.8, -2.5, 2.5, 5.8];
    const pillarHeights = [6.2, 8.2, 8.2, 6.2];

    const tamQuanMosaicMat = new THREE.MeshStandardMaterial({
      map: this.makeMosaicShardTex(),
      roughness: 0.38,
      metalness: 0.1
    });

    pillarPositions.forEach((px, i) => {
      const h = pillarHeights[i];
      const p = new THREE.Mesh(new THREE.BoxGeometry(1.15, h, 1.15), M.goldWall);
      p.position.set(px, h / 2, 0);
      p.castShadow = true;
      structGroup.add(p);

      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.75, h - 1.2, 1.2), tamQuanMosaicMat);
      strip.position.set(px, h / 2, 0);
      structGroup.add(strip);

      const finial = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.3, 8), M.mosaicRed);
      finial.position.set(px, h + 0.65, 0);
      structGroup.add(finial);
    });

    const beam = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.5, 1.35), M.goldWall);
    beam.position.set(0, 6.4, 0);
    structGroup.add(beam);

    const signTex = makeTextTex(signText, {
      w: 1500,
      h: 210,
      bg: '#233D75',
      border: '#D9A441',
      color: '#FFE08A',
      size: 38
    });
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(4.95, 0.92, 1.42),
      new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.4 })
    );
    sign.position.set(0, 6.45, 0);
    g.add(sign);

    for (const sx of [-4.15, 4.15]) {
      const sb = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.0, 1.15), M.goldWall);
      sb.position.set(sx, 4.7, 0);
      structGroup.add(sb);
      const sr = makeHippedRoofMesh(3.6, 2.0, 1.05, M.roofTile);
      sr.position.set(sx, 5.7, 0);
      structGroup.add(sr);
    }

    if (isMainGate) {
      for (const upx of [-1.85, 1.85]) {
        const upCol = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.8, 0.95), M.goldWall);
        upCol.position.set(upx, 8.35, 0);
        structGroup.add(upCol);
      }
      const upperLintel = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.65, 1.15), M.goldWall);
      upperLintel.position.set(0, 9.75, 0);
      structGroup.add(upperLintel);

      const nicheStand = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.56, 0.36, 12), M.statueWhite);
      nicheStand.position.set(0, 7.15, 0);
      structGroup.add(nicheStand);
      const buddhaLower = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.36, 0.92, 12), M.statueWhite);
      buddhaLower.position.set(0, 7.78, 0);
      structGroup.add(buddhaLower);
      const buddhaTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.64, 12), M.statueWhite);
      buddhaTorso.position.set(0, 8.5, 0);
      structGroup.add(buddhaTorso);
      const buddhaShoulders = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), M.statueWhite);
      buddhaShoulders.scale.set(1.28, 0.55, 0.72);
      buddhaShoulders.position.set(0, 8.76, 0);
      structGroup.add(buddhaShoulders);
      const buddhaHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), M.statueWhite);
      buddhaHead.position.set(0, 9.16, 0);
      structGroup.add(buddhaHead);
      const buddhaHalo = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.035, 8, 20), M.goldAccent);
      buddhaHalo.position.set(0, 9.12, -0.14);
      structGroup.add(buddhaHalo);

      for (let t = 0; t < 2; t++) {
        const w = 6.8 - t * 1.9;
        const roof = makeHippedRoofMesh(w, 2.5 - t * 0.45, 1.2, M.roofTile);
        roof.position.set(0, 10.35 + t * 1.18, 0);
        structGroup.add(roof);
      }

      // Main Gate (Cổng Chính) wrought-iron leaves CLOSED ceremonially across the archway
      const ironMat = new THREE.MeshStandardMaterial({ color: 0xC6933A, metalness: 0.62, roughness: 0.34 });
      for (const side of [-1, 1]) {
        const wingPivot = new THREE.Group();
        wingPivot.position.set(side * 1.92, 0, -0.12);
        wingPivot.rotation.y = 0; // Shut closed across center
        const frameTop = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.1, 0.08), ironMat);
        frameTop.position.set(-side * 0.95, 2.95, 0);
        wingPivot.add(frameTop);
        const frameMid = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.1, 0.08), ironMat);
        frameMid.position.set(-side * 0.95, 1.55, 0);
        wingPivot.add(frameMid);
        const frameBot = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, 0.08), ironMat);
        frameBot.position.set(-side * 0.95, 0.25, 0);
        wingPivot.add(frameBot);
        for (let bi = 0; bi < 8; bi++) {
          const bx = -side * (0.14 + bi * 0.24);
          const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.8, 6), ironMat);
          bar.position.set(bx, 1.6, 0);
          wingPivot.add(bar);
          const spear = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 6), ironMat);
          spear.position.set(bx, 3.08, 0);
          wingPivot.add(spear);
        }
        g.add(wingPivot);
        this.closedMainGateClickTargets.push(wingPivot);
      }

      // Center padlock bar + polite notice sign guiding visitors to open Cổng Phụ
      const lockBox = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.42, 0.18), M.goldAccent);
      lockBox.position.set(0, 1.55, -0.05);
      g.add(lockBox);

      const closedNotice = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 0.62, 0.1),
        new THREE.MeshStandardMaterial({
          map: makeTextTex('CỔNG CHÍNH ĐÓNG · MỜI ĐI CỔNG PHỤ →', {
            w: 1024,
            h: 190,
            bg: '#6E2219',
            border: '#FFD875',
            color: '#FFF6E5',
            size: 46
          }),
          roughness: 0.4
        })
      );
      closedNotice.position.set(0, 1.98, 0.08);
      g.add(closedNotice);
      this.closedMainGateClickTargets.push(closedNotice);

      // Physical barrier across Cổng Chính (x = 17.2..28.8, z = 40.7..42.3)
      this.addRectObstacle(17.2, 28.8, 40.7, 42.3);
    } else {
      for (let t = 0; t < 2; t++) {
        const w = 7.4 - t * 2.0;
        const roof = makeHippedRoofMesh(w, 2.7 - t * 0.5, 1.3, M.roofTile);
        roof.position.set(0, 7.6 + t * 1.3, 0);
        g.add(roof);
      }
    }
    return g;
  }

  makeMosaicShardTex() {
    // Antique cream lime-stucco inlaid with organic broken-porcelain floral clusters (khảm sành sứ Vĩnh Tràng)
    return makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#E6D6B8';
        g.fillRect(0, 0, w, h);

        // Subtle lime-plaster mottling
        for (let i = 0; i < 42; i++) {
          const mx = ((Math.sin(i * 41.3) * 0.5 + 0.5) * w);
          const my = ((Math.cos(i * 19.7) * 0.5 + 0.5) * h);
          g.fillStyle = i % 2 === 0 ? 'rgba(210,190,152,0.28)' : 'rgba(252,246,232,0.28)';
          g.beginPath();
          g.arc(mx, my, 12 + (i % 16), 0, Math.PI * 2);
          g.fill();
        }

        // Porcelain floral medallions & organic irregular ceramic shards
        const shardColors = ['#2D4C7E', '#3B6E5C', '#9E3E2E', '#D9A441', '#F4EFE4', '#6E91AA'];
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 4; col++) {
            const cx = col * 64 + 32;
            const cy = row * 64 + 32;
            // Thin gold-cream framing line
            g.strokeStyle = 'rgba(175, 138, 72, 0.35)';
            g.lineWidth = 2;
            g.strokeRect(col * 64 + 4, row * 64 + 4, 56, 56);

            // 5-petal porcelain blossom
            const petalColor = shardColors[(row + col) % 3];
            for (let p = 0; p < 5; p++) {
              const ang = (p / 5) * Math.PI * 2 + row * 0.25;
              const px = cx + Math.cos(ang) * 12;
              const py = cy + Math.sin(ang) * 12;
              g.fillStyle = petalColor;
              g.beginPath();
              g.ellipse(px, py, 7.5, 4.5, ang, 0, Math.PI * 2);
              g.fill();
              g.strokeStyle = '#E8DEC8';
              g.lineWidth = 1.2;
              g.stroke();
            }
            // Terracotta / gold pistil center
            g.fillStyle = '#D9A441';
            g.beginPath();
            g.arc(cx, cy, 4.5, 0, Math.PI * 2);
            g.fill();
          }
        }

        // Fine broken-porcelain background scatter
        for (let s = 0; s < 96; s++) {
          const sx = ((Math.sin(s * 17.9 + 1.2) * 0.5 + 0.5) * (w - 14)) + 7;
          const sy = ((Math.cos(s * 31.1 + 0.7) * 0.5 + 0.5) * (h - 14)) + 7;
          const r = 3 + (s % 4);
          g.fillStyle = shardColors[s % shardColors.length];
          g.beginPath();
          g.moveTo(sx - r, sy - r * 0.5);
          g.lineTo(sx + r * 0.8, sy - r);
          g.lineTo(sx + r, sy + r * 0.7);
          g.lineTo(sx - r * 0.6, sy + r * 0.9);
          g.closePath();
          g.fill();
        }
      },
      256,
      256,
      1,
      2
    );
  }

  buildSideMosaicGate() {
    // Authentic porcelain-mosaic Cổng Phụ ("TỊNH ĐỘ HUYỀN MÔN" — image_bb72a8b0.png!)
    // Clear 6.6m wide walkable roadway (x = 37.2..43.8) with gate wings swung wide open
    const M = this.MAT;
    const g = new THREE.Group();
    const mosaicTex = this.makeMosaicShardTex();
    const mosaicMat = new THREE.MeshStandardMaterial({ map: mosaicTex, roughness: 0.36, metalness: 0.12 });

    // Flanking main porcelain-mosaic piers (placed outside walkable 6.4m gap: +-3.8m)
    for (const px of [-3.85, 3.85]) {
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.35, 1.45), M.goldWall);
      base.position.set(px, 0.675, 0);
      base.castShadow = true;
      g.add(base);

      const pier = new THREE.Mesh(new THREE.BoxGeometry(1.28, 6.1, 1.15), M.goldLight);
      pier.position.set(px, 4.35, 0);
      pier.castShadow = true;
      g.add(pier);

      const mosaicStrip = new THREE.Mesh(new THREE.BoxGeometry(0.86, 5.4, 1.2), mosaicMat);
      mosaicStrip.position.set(px, 4.35, 0);
      g.add(mosaicStrip);

      // Ornate curved arch spandrel connecting piers cleanly
      const flankWall = new THREE.Mesh(new THREE.BoxGeometry(1.45, 2.85, 0.55), M.goldWall);
      flankWall.position.set(px + (px < 0 ? -1.3 : 1.3), 1.42, 0);
      g.add(flankWall);
      const flankMosaic = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.8, 0.62), mosaicMat);
      flankMosaic.position.set(px + (px < 0 ? -1.3 : 1.3), 1.75, 0);
      g.add(flankMosaic);
      const lotusCap = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), M.mosaicRed);
      lotusCap.position.set(px + (px < 0 ? -1.95 : 1.95), 3.05, 0);
      g.add(lotusCap);
    }

    // Blue "4 BÁNH" directional plaque on lower-left masonry plinth matching image_bb72a8b0.png!
    const sign4Banh = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.58, 0.1),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('4 BÁNH', { w: 256, h: 160, bg: '#1F3B6E', border: '#E8EDF5', color: '#FFFFFF', size: 54 }),
        roughness: 0.4
      })
    );
    sign4Banh.position.set(-5.08, 0.78, 0.56);
    g.add(sign4Banh);

    // Arch crown & main mosaic transom beam ("TỊNH ĐỘ HUYỀN MÔN")
    const mainBeam = new THREE.Mesh(new THREE.BoxGeometry(8.8, 1.55, 1.25), mosaicMat);
    mainBeam.position.set(0, 6.45, 0);
    mainBeam.castShadow = true;
    g.add(mainBeam);

    const archHeaderTex = makeTextTex('淨 土 玄 門 · TỊNH ĐỘ HUYỀN MÔN', {
      w: 1400,
      h: 210,
      bg: '#214A34',
      border: '#E8C164',
      color: '#FFE496',
      size: 56
    });
    const archHeader = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 0.88, 1.32),
      new THREE.MeshStandardMaterial({ map: archHeaderTex, roughness: 0.34 })
    );
    archHeader.position.set(0, 6.48, 0);
    g.add(archHeader);

    // Upper gallery: Triple-niche standing White Buddha flanked by 2 guardian statues (image_bb72a8b0.png)
    for (const ux of [-3.1, -1.35, 1.35, 3.1]) {
      const uCol = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.1, 0.95), M.goldWall);
      uCol.position.set(ux, 8.75, 0);
      g.add(uCol);
      const uTile = new THREE.Mesh(new THREE.BoxGeometry(0.36, 2.75, 1.0), mosaicMat);
      uTile.position.set(ux, 8.75, 0);
      g.add(uTile);
    }
    const upperLintel = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.65, 1.15), M.goldWall);
    upperLintel.position.set(0, 10.45, 0);
    g.add(upperLintel);

    // Center standing White Buddha
    const bStand = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.62, 0.4, 12), M.statueWhite);
    bStand.position.set(0, 7.42, 0);
    g.add(bStand);
    const bBody = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 1.65, 12), M.statueWhite);
    bBody.position.set(0, 8.42, 0);
    g.add(bBody);
    const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), M.statueWhite);
    bHead.position.set(0, 9.46, 0);
    g.add(bHead);

    // Two flanking guardian statues in side arches
    for (const gx of [-2.22, 2.22]) {
      const gBody = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.35, 10), M.statueWhite);
      gBody.position.set(gx, 8.15, 0);
      g.add(gBody);
      const gHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), M.statueWhite);
      gHead.position.set(gx, 9.0, 0);
      g.add(gHead);
    }

    // Two-tier ornate terracotta pagoda roofs + ceramic ridge dragon finials
    for (let t = 0; t < 2; t++) {
      const rw = 8.9 - t * 2.4;
      const roof = makeHippedRoofMesh(rw, 2.7 - t * 0.5, 1.25, M.roofTile);
      roof.position.set(0, 11.1 + t * 1.25, 0);
      roof.castShadow = true;
      g.add(roof);
    }
    for (const dx of [-2.4, 2.4]) {
      const dragonFinial = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.95, 7), M.mosaicBlue);
      dragonFinial.position.set(dx, 13.1, 0);
      dragonFinial.rotation.z = dx < 0 ? 0.35 : -0.35;
      g.add(dragonFinial);
    }

    // Gold-painted wrought-iron gate wings swung WIDE OPEN inward along inner piers (clear 6.4m driveway!)
    const ironMat = new THREE.MeshStandardMaterial({ color: 0xC6933A, metalness: 0.62, roughness: 0.34 });
    for (const side of [-1, 1]) {
      const wingPivot = new THREE.Group();
      wingPivot.position.set(side * 3.12, 0, -0.2);
      wingPivot.rotation.y = side * 1.44; // Folded cleanly wide open into the temple courtyard
      for (const fy of [0.25, 1.55, 2.95]) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.09, 0.08), ironMat);
        bar.position.set(-side * 1.28, fy, 0);
        wingPivot.add(bar);
      }
      for (let bi = 0; bi < 9; bi++) {
        const bx = -side * (0.15 + bi * 0.28);
        const picket = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 2.8, 6), ironMat);
        picket.position.set(bx, 1.6, 0);
        wingPivot.add(picket);
      }
      g.add(wingPivot);
    }

    // Physical colliders ONLY on the flanking piers (central archway x = 37.3..43.7 is 100% OPEN!)
    this.addRectObstacle(35.8, 37.3, 40.6, 42.4);
    this.addRectObstacle(43.7, 45.2, 40.6, 42.4);
    return g;
  }

  buildChanhDien13Arches() {
    const M = this.MAT;
    const g = new THREE.Group();
    const ironwork = new THREE.MeshStandardMaterial({ color: 0x28231F, metalness: 0.68, roughness: 0.4 });
    const W = 26.9;
    const D = 14.3;

    const plinth = new THREE.Mesh(new THREE.BoxGeometry(W + 1.2, 1.25, D + 1.6), M.stoneLight);
    plinth.position.set(0, 0.625, 0);
    plinth.receiveShadow = true;
    plinth.castShadow = true;

    const shell = new THREE.Group();
    this.chanhDienProceduralShell = shell;
    this.chanhDienFacadeGroup = g;
    g.add(shell);
    shell.add(plinth);

    // Broad central stone staircase, matching the real front approach visible in site photographs.
    const stairWidth = 8.6;
    const stairRun = 0.48;
    const stairRise = 0.18;
    for (let s = 0; s < 7; s++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(stairWidth, stairRise, stairRun),
        s % 2 === 0 ? M.stoneLight : M.creamTrim
      );
      step.position.set(0, stairRise * (s + 0.5), D / 2 + 4.05 - s * stairRun);
      step.receiveShadow = true;
      step.castShadow = true;
      shell.add(step);
    }
    for (const side of [-1, 1]) {
      const railX = side * 4.62;
      const railBase = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.9, 3.55), M.creamTrim);
      railBase.position.set(railX, 0.88, D / 2 + 2.65);
      shell.add(railBase);
      for (let i = 0; i < 6; i++) {
        const baluster = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.72, 8), M.creamTrim);
        baluster.position.set(railX, 0.92, D / 2 + 4.05 - i * 0.56);
        shell.add(baluster);
      }
      const handrail = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 3.8), M.goldAccent);
      handrail.position.set(railX, 1.42, D / 2 + 2.65);
      shell.add(handrail);
      for (const endZ of [D / 2 + 0.8, D / 2 + 4.5]) {
        const finial = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), M.goldAccent);
        finial.position.set(railX, 1.55, endZ);
        shell.add(finial);
      }
    }

    // END-OF-ROAD LEFT-TURN COVERED SHOE-REMOVAL VERANDA & CARVED WOODEN ENTRANCE DOOR INTO CHÁNH ĐIỆN
    // Mounted on `g` (world origin (23, 0, 1)) at local (12.2, 0, -15.5) => world (35.2, 0, -14.5),
    // facing East (+X) directly onto the cool tree-shaded end-of-road souvenir plaza ("đi xuống cuối đường rồi rẽ vào, bỏ dép bên ngoài mới vào chánh điện")!
    const rightCornerGate = new THREE.Group();
    rightCornerGate.position.set(12.2, 0, -15.5);
    rightCornerGate.rotation.y = Math.PI * 0.5; // Local +Z faces East (+X) toward the straight shaded lane x = 40.5!

    const rcWingBody = new THREE.Mesh(new THREE.BoxGeometry(6.4, 5.2, 2.6), M.goldWall);
    rcWingBody.position.set(0, 2.6, -1.1);
    rcWingBody.castShadow = true;
    rcWingBody.receiveShadow = true;
    rightCornerGate.add(rcWingBody);
    const rcWingCornice = new THREE.Mesh(new THREE.BoxGeometry(6.7, 0.28, 2.8), M.creamTrim);
    rcWingCornice.position.set(0, 5.25, -1.1);
    rightCornerGate.add(rcWingCornice);

    // Wide terracotta-tiled Shoe-Removal Veranda ("Hiên Để Giày Dép Bên Ngoài Trước Cửa Chánh Điện")
    const rcStep = new THREE.Mesh(
      new THREE.BoxGeometry(6.6, 0.16, 3.4),
      new THREE.MeshStandardMaterial({ color: 0xC8734F, roughness: 0.65 })
    );
    rcStep.position.set(0, 0.08, 1.45);
    rcStep.receiveShadow = true;
    rightCornerGate.add(rcStep);

    for (const px of [-2.45, 2.45]) {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(0.54, 4.1, 0.58), M.goldWall);
      pier.position.set(px, 2.05, 0.25);
      pier.castShadow = true;
      rightCornerGate.add(pier);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 3.65, 12), M.redColumn);
      col.position.set(px, 1.95, 2.75);
      rightCornerGate.add(col);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.18, 0.48), M.goldAccent);
      cap.position.set(px, 3.82, 2.75);
      rightCornerGate.add(cap);
    }

    // Framed Double-Leaf Carved Wooden Temple Doors ("Cửa Gỗ Bức Bàn Mở Cánh") + Wooden Threshold Sill
    const doorWoodMat = new THREE.MeshStandardMaterial({
      color: 0x7A421E,
      emissive: 0x1E0D04,
      map: this.woodGrainTex,
      roughness: 0.48
    });
    const doorCarvedMat = new THREE.MeshStandardMaterial({
      color: 0x9C582B,
      emissive: 0x241005,
      roughness: 0.44
    });
    const doorSill = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.14, 0.28), doorWoodMat);
    doorSill.position.set(0, 0.23, 0.24);
    rightCornerGate.add(doorSill);
    const doorFrameTop = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.34, 0.34), doorWoodMat);
    doorFrameTop.position.set(0, 3.68, 0.24);
    rightCornerGate.add(doorFrameTop);

    for (const side of [-1, 1]) {
      const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.55, 0.32), doorWoodMat);
      jamb.position.set(side * 1.62, 1.9, 0.24);
      rightCornerGate.add(jamb);

      // Open double wooden door leaves ("thượng song hạ bản" — solid carved bottom + lattice top)
      const leafPiv = new THREE.Group();
      leafPiv.position.set(side * 1.48, 0.24, 0.32);
      leafPiv.rotation.y = side * 1.12;
      const lowerLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.38, 1.45, 0.08), doorWoodMat);
      lowerLeaf.position.set(-side * 0.69, 0.72, 0);
      leafPiv.add(lowerLeaf);
      const lowerInset = new THREE.Mesh(new THREE.BoxGeometry(1.06, 1.05, 0.1), doorCarvedMat);
      lowerInset.position.set(-side * 0.69, 0.72, 0);
      leafPiv.add(lowerInset);
      const topLeafRail = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.2, 0.08), doorWoodMat);
      topLeafRail.position.set(-side * 0.69, 3.15, 0);
      leafPiv.add(topLeafRail);
      for (const edge of [-1, 1]) {
        const stile = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.85, 0.08), doorWoodMat);
        stile.position.set(-side * 0.69 + edge * 0.63, 2.32, 0);
        leafPiv.add(stile);
      }
      for (let sb = -2; sb <= 2; sb++) {
        const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.62, 8), M.goldAccent);
        spindle.position.set(-side * 0.69 + sb * 0.22, 2.32, 0);
        leafPiv.add(spindle);
      }
      rightCornerGate.add(leafPiv);
    }

    // Warm amber-lit temple interior vestibule portal right inside the open wooden doors
    const rcInnerVestibule = new THREE.Mesh(
      new THREE.BoxGeometry(3.02, 3.36, 0.28),
      new THREE.MeshStandardMaterial({
        color: 0x2B1509,
        emissive: 0x3A1B08,
        roughness: 0.78
      })
    );
    rcInnerVestibule.position.set(0, 1.9, 0.22);
    rightCornerGate.add(rcInnerVestibule);
    const rcInnerCarpet = new THREE.Mesh(
      new THREE.PlaneGeometry(1.55, 0.95),
      new THREE.MeshStandardMaterial({ color: 0x8F1D18, roughness: 0.85 })
    );
    rcInnerCarpet.rotation.x = -Math.PI / 2;
    rcInnerCarpet.position.set(0, 0.168, 0.62);
    rightCornerGate.add(rcInnerCarpet);

    // 2 Multi-Tier Wooden Shoe Racks + Coir Mat + Neat Pairs of Sandals/Slippers OUTSIDE on Veranda!
    const sandalPalette = [0xC84B31, 0x295F8A, 0xD9A441, 0x3D6E52, 0xE6DAC3, 0x7A3E2E];
    const coirMat = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.025, 0.85),
      new THREE.MeshStandardMaterial({ color: 0x9E7543, roughness: 0.92 })
    );
    coirMat.position.set(0, 0.175, 1.18);
    rightCornerGate.add(coirMat);

    for (const rx of [-2.05, 2.05]) {
      const rack = new THREE.Group();
      rack.position.set(rx, 0.16, 1.35);
      rack.rotation.y = rx < 0 ? 0.22 : -0.22;
      for (const lx of [-0.68, 0.68]) {
        for (const lz of [-0.18, 0.18]) {
          const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.78, 0.05), doorWoodMat);
          rLeg.position.set(lx, 0.39, lz);
          rack.add(rLeg);
        }
      }
      for (let tier = 0; tier < 3; tier++) {
        const ty = 0.14 + tier * 0.24;
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.03, 0.4), doorWoodMat);
        shelf.position.set(0, ty, 0);
        rack.add(shelf);
        for (let p = 0; p < 4; p++) {
          const sx = -0.48 + p * 0.32;
          const sMat = new THREE.MeshStandardMaterial({
            color: sandalPalette[(tier * 4 + p + (rx > 0 ? 2 : 0)) % sandalPalette.length],
            roughness: 0.65
          });
          for (const f of [-0.052, 0.052]) {
            const sole = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.024, 0.21), sMat);
            sole.position.set(sx + f, ty + 0.026, 0);
            rack.add(sole);
          }
        }
      }
      rightCornerGate.add(rack);
    }

    const rcCanopyRoof = makeHippedRoofMesh(7.2, 4.2, 1.35, M.roofTile);
    rcCanopyRoof.position.set(0, 4.55, 1.45);
    rightCornerGate.add(rcCanopyRoof);

    const rcSign = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.68, 0.12),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('CỬA VÀO CHÁNH ĐIỆN · VUI LÒNG BỎ GIÀY DÉP BÊN NGOÀI', {
          w: 1280,
          h: 180,
          bg: '#4A150D',
          border: '#E5B23D',
          color: '#FFE594',
          size: 38
        }),
        roughness: 0.35
      })
    );
    rcSign.position.set(0, 3.56, 2.98);
    rightCornerGate.add(rcSign);

    const rcGlow = new THREE.PointLight(0xFFC96B, 2.2, 9.5);
    rcGlow.position.set(0, 3.3, 1.8);
    rightCornerGate.add(rcGlow);

    const rcHit = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 4.4, 3.4),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    rcHit.position.set(0, 2.2, 1.2);
    rcHit.userData.doorSide = 'right';
    rightCornerGate.add(rcHit);
    g.add(rightCornerGate);
    this.sideDoorClickTargets.push(rcHit);

    // Decorative front terrace staircases (closed wooden doors — entry is strictly via Bottom-Right Corner Gate!)
    for (const sx of [-7.2, 7.2]) {
      for (let s = 0; s < 5; s++) {
        const step = new THREE.Mesh(
          new THREE.BoxGeometry(3.2, 0.25, 0.52),
          s % 2 === 0 ? M.stoneLight : M.stoneDark
        );
        step.position.set(sx, 0.125 + s * 0.25, D / 2 + 0.8 + (4 - s) * 0.45);
        step.receiveShadow = true;
        shell.add(step);
      }
      for (const rx of [sx - 1.7, sx + 1.7]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.35, 2.4), M.goldWall);
        rail.position.set(rx, 0.8, D / 2 + 1.55);
        shell.add(rail);
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), M.goldAccent);
        ball.position.set(rx, 1.62, D / 2 + 2.65);
        shell.add(ball);
      }
      const sideDoor = new THREE.Mesh(new THREE.BoxGeometry(1.55, 2.75, 0.09), M.darkWood);
      sideDoor.position.set(sx, 2.72, D / 2 + 0.22);
      shell.add(sideDoor);
    }

    const bodyH = 6.2;
    const body = new THREE.Mesh(new THREE.BoxGeometry(W, bodyH, D), M.goldWall);
    body.position.set(0, 1.25 + bodyH / 2, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    shell.add(body);

    const upperCream = new THREE.Mesh(new THREE.BoxGeometry(W + 0.25, 1.65, 0.85), M.creamTrim);
    upperCream.position.set(0, 1.25 + bodyH - 0.82, D / 2 - 0.1);
    shell.add(upperCream);

    const fz = D / 2 + 0.35;
    const colXs = [-13.0, -11.0, -9.0, -7.0, -5.0, -3.2, -1.65, 1.65, 3.2, 5.0, 7.0, 9.0, 11.0, 13.0];
    for (let i = 0; i < colXs.length; i++) {
      const x = colXs[i];
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.24, 4.3, 18), M.redColumn);
      col.position.set(x, 3.4, fz);
      col.castShadow = true;
      shell.add(col);
      const baseLower = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.2, 0.72), M.creamTrim);
      baseLower.position.set(x, 1.38, fz);
      shell.add(baseLower);
      const baseUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.34, 0.16, 16), M.goldAccent);
      baseUpper.position.set(x, 1.56, fz);
      shell.add(baseUpper);
      const baseCap = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.12, 0.56), M.goldLight);
      baseCap.position.set(x, 1.7, fz);
      shell.add(baseCap);
      const capital = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.25, 0.24, 16), M.goldAccent);
      capital.position.set(x, 5.58, fz);
      shell.add(capital);
      const capitalTop = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.16, 0.72), M.creamTrim);
      capitalTop.position.set(x, 5.78, fz);
      shell.add(capitalTop);
      const capitalAbacus = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.12, 0.84), M.goldAccent);
      capitalAbacus.position.set(x, 5.92, fz);
      shell.add(capitalAbacus);
      for (let flute = -1; flute <= 1; flute++) {
        const groove = new THREE.Mesh(new THREE.BoxGeometry(0.025, 3.35, 0.025), M.goldLight);
        groove.position.set(x + flute * 0.075, 3.4, fz + 0.225);
        shell.add(groove);
      }
      const pil = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.35, 0.3), M.goldLight);
      pil.position.set(x, 6.62, fz - 0.12);
      shell.add(pil);

      if (i < colXs.length - 1) {
        const nextX = colXs[i + 1];
        const span = nextX - x;
        const cx = (x + nextX) / 2;
        const openingW = Math.max(0.95, span - 0.42);
        const openingR = openingW * 0.5;
        const openingBase = 2.05;
        const springY = 2.42;
        const isSideDoor = Math.abs(Math.abs(cx) - 8.0) < 0.35;
        const isMainDoor = Math.abs(cx) < 0.2;
        const archShape = new THREE.Shape();
        archShape.moveTo(-openingR, 0);
        archShape.lineTo(openingR, 0);
        archShape.lineTo(openingR, springY);
        archShape.absarc(0, springY, openingR, 0, Math.PI, false);
        archShape.closePath();
        const opening = new THREE.Mesh(new THREE.ShapeGeometry(archShape), M.darkOpening);
        opening.position.set(cx, openingBase, fz - 0.18);
        shell.add(opening);
        const archOuter = new THREE.Mesh(
          new THREE.TorusGeometry(openingR + 0.07, 0.11, 10, 28, Math.PI),
          M.creamTrim
        );
        archOuter.position.set(cx, openingBase + springY, fz + 0.035);
        shell.add(archOuter);
        const archInner = new THREE.Mesh(
          new THREE.TorusGeometry(Math.max(0.3, openingR - 0.08), 0.045, 8, 24, Math.PI),
          M.goldAccent
        );
        archInner.position.set(cx, openingBase + springY, fz + 0.075);
        shell.add(archInner);
        for (const side of [-1, 1]) {
          const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.16, springY, 0.22), M.creamTrim);
          jamb.position.set(cx + side * (openingR + 0.035), openingBase + springY * 0.5, fz + 0.03);
          shell.add(jamb);
        }
        if (isSideDoor || isMainDoor) {
          const door = new THREE.Mesh(new THREE.ShapeGeometry(archShape.clone()), M.darkWood);
          door.position.set(cx, openingBase, fz - 0.085);
          shell.add(door);
          const seam = new THREE.Mesh(new THREE.BoxGeometry(0.045, 2.35, 0.055), M.goldAccent);
          seam.position.set(cx, openingBase + 1.18, fz + 0.015);
          shell.add(seam);
          for (const side of [-1, 1]) {
            const panel = new THREE.Mesh(new THREE.BoxGeometry(openingR * 0.62, 1.35, 0.045), M.darkWood);
            panel.position.set(cx + side * openingR * 0.48, openingBase + 1.28, fz + 0.02);
            shell.add(panel);
            const handle = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), M.goldAccent);
            handle.position.set(cx + side * 0.13, openingBase + 1.12, fz + 0.09);
            shell.add(handle);
          }
        } else {
          for (let barIndex = 0; barIndex < 5; barIndex++) {
            const bx = cx - openingR * 0.72 + barIndex * (openingR * 1.44 / 4);
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 2.25, 6), ironwork);
            bar.position.set(bx, openingBase + 1.22, fz + 0.055);
            shell.add(bar);
          }
          for (let row = 0; row < 4; row++) {
            const bar = new THREE.Mesh(new THREE.BoxGeometry(openingW * 0.84, 0.045, 0.055), ironwork);
            bar.position.set(cx, openingBase + 0.5 + row * 0.54, fz + 0.06);
            shell.add(bar);
          }
          const grilleRosette = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.028, 6, 18), M.goldAccent);
          grilleRosette.position.set(cx, openingBase + 1.7, fz + 0.09);
          shell.add(grilleRosette);
          const sill = new THREE.Mesh(new THREE.BoxGeometry(openingW + 0.22, 0.16, 0.38), M.creamTrim);
          sill.position.set(cx, 1.94, fz + 0.12);
          shell.add(sill);
          for (let bal = -2; bal <= 2; bal++) {
            const baluster = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.46, 6), M.creamTrim);
            baluster.position.set(cx + bal * (openingW / 5.2), 1.7, fz + 0.12);
            shell.add(baluster);
          }
        }
      }
    }

    // Center sanctuary double-leaf timber doors with a recessed veneration niche behind them.
    const innerGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 4.0),
      new THREE.MeshBasicMaterial({ color: 0x6A3A14 })
    );
    innerGlow.position.set(0, 3.3, fz - 1.15);
    shell.add(innerGlow);

    this.chanhDienPorchAltar = new THREE.Group();
    this.chanhDienPorchAltar.position.set(0, 1.25, fz - 0.52);
    const porchTable = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.95, 0.85), M.redColumn);
    porchTable.position.y = 0.48;
    this.chanhDienPorchAltar.add(porchTable);
    const porchTrim = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.14, 0.92), M.goldAccent);
    porchTrim.position.y = 0.96;
    this.chanhDienPorchAltar.add(porchTrim);
    const porchGlow = new THREE.PointLight(0xFFE082, 4.8, 12);
    porchGlow.position.set(0, 2.55, 0.75);
    this.porchGlowLight = porchGlow;
    this.chanhDienPorchAltar.add(porchGlow);
    g.add(this.chanhDienPorchAltar);

    const cornice1 = new THREE.Mesh(new THREE.BoxGeometry(W + 1.0, 0.42, D + 1.2), M.goldLight);
    cornice1.position.set(0, 5.85, 0);
    shell.add(cornice1);

    const mosaicBand = new THREE.Mesh(new THREE.BoxGeometry(W + 0.6, 0.48, D + 0.6), M.creamTrim);
    mosaicBand.position.set(0, 7.55, 0);
    shell.add(mosaicBand);

    const cornice2 = new THREE.Mesh(new THREE.BoxGeometry(W + 1.3, 0.46, D + 1.4), M.creamTrim);
    cornice2.position.set(0, 7.95, 0);
    shell.add(cornice2);

    // Recessed ceramic panels with small rosettes, inspired by the real sành-sứ and coloured-tile work.
    const pastelCeramic = new THREE.MeshStandardMaterial({ color: 0x4D879E, roughness: 0.42, metalness: 0.08 });
    const jadeCeramic = new THREE.MeshStandardMaterial({ color: 0x3F7865, roughness: 0.44, metalness: 0.06 });
    for (let bi = -4; bi <= 4; bi++) {
      const bx = bi * 2.9;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.48, 0.94, 0.34), M.creamTrim);
      frame.position.set(bx, 6.65, fz + 0.25);
      shell.add(frame);
      const inlay = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.66, 0.12), bi % 2 === 0 ? pastelCeramic : jadeCeramic);
      inlay.position.set(bx, 6.65, fz + 0.46);
      shell.add(inlay);
      const rosette = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.055, 8, 20), M.goldAccent);
      rosette.position.set(bx, 6.65, fz + 0.55);
      shell.add(rosette);
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), M.creamTrim);
      core.scale.set(1, 1, 0.28);
      core.position.set(bx, 6.65, fz + 0.57);
      shell.add(core);
      for (let petal = 0; petal < 8; petal++) {
        const angle = petal * Math.PI / 4;
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 6), M.goldAccent);
        leaf.scale.set(0.62, 1.55, 0.32);
        leaf.position.set(bx + Math.cos(angle) * 0.31, 6.65 + Math.sin(angle) * 0.31, fz + 0.56);
        leaf.rotation.z = angle - Math.PI / 2;
        shell.add(leaf);
      }
    }
    for (let tile = -13; tile <= 13; tile++) {
      const diamond = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.28, 0.09),
        tile % 3 === 0 ? jadeCeramic : tile % 3 === 1 ? pastelCeramic : M.mosaicRed
      );
      diamond.rotation.z = Math.PI / 4;
      diamond.position.set(tile * 1.0, 7.55, fz + 0.48);
      shell.add(diamond);
    }

    // Three sculpted gables: a taller central crown and two lower side crowns.
    for (const [gx, gw, gh] of [
      [-8.5, 5.4, 2.8],
      [0, 7.8, 4.2],
      [8.5, 5.4, 2.8]
    ]) {
      const baseY = 8.2;
      const faceZ = D / 2 - 0.28;
      const pedimentShape = new THREE.Shape();
      pedimentShape.moveTo(-gw / 2, 0);
      pedimentShape.lineTo(-gw / 2 + 0.38, gh * 0.54);
      pedimentShape.quadraticCurveTo(0, gh * 1.16, gw / 2 - 0.38, gh * 0.54);
      pedimentShape.lineTo(gw / 2, 0);
      pedimentShape.closePath();
      const pediment = new THREE.Mesh(new THREE.ShapeGeometry(pedimentShape), M.goldLight);
      pediment.position.set(gx, baseY, faceZ);
      pediment.castShadow = true;
      shell.add(pediment);

      const innerShape = new THREE.Shape();
      innerShape.moveTo(-gw * 0.34, 0.18);
      innerShape.lineTo(-gw * 0.28, gh * 0.48);
      innerShape.quadraticCurveTo(0, gh * 0.96, gw * 0.28, gh * 0.48);
      innerShape.lineTo(gw * 0.34, 0.18);
      innerShape.closePath();
      const inlay = new THREE.Mesh(new THREE.ShapeGeometry(innerShape), pastelCeramic);
      inlay.position.set(gx, baseY + 0.04, faceZ + 0.045);
      shell.add(inlay);

      const crestCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(gx - gw / 2, baseY + 0.02, faceZ + 0.11),
        new THREE.Vector3(gx - gw / 2 + 0.38, baseY + gh * 0.54, faceZ + 0.11),
        new THREE.Vector3(gx, baseY + gh * 1.16, faceZ + 0.11),
        new THREE.Vector3(gx + gw / 2 - 0.38, baseY + gh * 0.54, faceZ + 0.11),
        new THREE.Vector3(gx + gw / 2, baseY + 0.02, faceZ + 0.11)
      ]);
      const crestTrim = new THREE.Mesh(new THREE.TubeGeometry(crestCurve, 36, 0.075, 8, false), M.creamTrim);
      shell.add(crestTrim);

      const medallion = new THREE.Mesh(
        new THREE.TorusGeometry(gx === 0 ? 0.62 : 0.38, 0.075, 8, 24),
        M.goldAccent
      );
      medallion.position.set(gx, baseY + gh * 0.47, faceZ + 0.16);
      shell.add(medallion);
      const medallionCore = new THREE.Mesh(
        new THREE.SphereGeometry(gx === 0 ? 0.25 : 0.16, 12, 10),
        jadeCeramic
      );
      medallionCore.scale.set(1, 1, 0.28);
      medallionCore.position.copy(medallion.position);
      shell.add(medallionCore);
      for (let petal = 0; petal < 8; petal++) {
        const angle = petal * Math.PI / 4;
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), M.goldAccent);
        leaf.scale.set(0.62, 1.5, 0.32);
        leaf.position.set(
          gx + Math.cos(angle) * (gx === 0 ? 0.42 : 0.25),
          baseY + gh * 0.47 + Math.sin(angle) * (gx === 0 ? 0.42 : 0.25),
          faceZ + 0.18
        );
        leaf.rotation.z = angle - Math.PI / 2;
        shell.add(leaf);
      }
      const spire = new THREE.Mesh(new THREE.ConeGeometry(gx === 0 ? 0.28 : 0.2, gx === 0 ? 1.0 : 0.72, 10), M.goldAccent);
      spire.position.set(gx, baseY + gh + (gx === 0 ? 0.5 : 0.36), faceZ);
      shell.add(spire);
    }

    const targetParent = shell;
    // Note: keep porch altar directly on `g` while procedural architectural shell elements move to `shell`
    const roof1 = makeHippedRoofMesh(W + 2.4, D + 1.6, 2.6, M.roofTile);
    roof1.position.set(0, 9.45, -0.3);
    roof1.castShadow = true;
    targetParent.add(roof1);

    const roof2 = makeHippedRoofMesh(W - 4.8, D - 3.2, 2.3, M.roofTile);
    roof2.position.set(0, 11.2, -0.5);
    roof2.castShadow = true;
    targetParent.add(roof2);

    const ridgeMaterial = new THREE.MeshStandardMaterial({ color: 0x783D30, roughness: 0.72 });
    const lowerRidge = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, W + 1.0, 12), ridgeMaterial);
    lowerRidge.rotation.z = Math.PI / 2;
    lowerRidge.position.set(0, 10.72, -0.3);
    targetParent.add(lowerRidge);
    const upperRidge = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, W - 4.8, 12), ridgeMaterial);
    upperRidge.rotation.z = Math.PI / 2;
    upperRidge.position.set(0, 12.34, -0.5);
    targetParent.add(upperRidge);
    for (const side of [-1, 1]) {
      for (const roofZ of [-D / 2 - 0.65, D / 2 + 0.65]) {
        const eaveFinial = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), M.goldAccent);
        eaveFinial.position.set(side * (W / 2 + 0.8), 9.85, roofZ);
        targetParent.add(eaveFinial);
        const finialTip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.52, 8), M.goldAccent);
        finialTip.position.set(side * (W / 2 + 0.8), 10.18, roofZ);
        targetParent.add(finialTip);
      }
    }

    for (const tx of [-15.6, 15.6]) {
      const tBase = new THREE.Mesh(new THREE.BoxGeometry(3.6, 7.6, 3.6), M.goldWall);
      tBase.position.set(tx, 3.8, D / 2 - 1.4);
      tBase.castShadow = true;
      targetParent.add(tBase);

      const tTop = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.8, 3.0), M.goldLight);
      tTop.position.set(tx, 9.0, D / 2 - 1.4);
      targetParent.add(tTop);

      const tRoof = makeHippedRoofMesh(3.8, 3.8, 1.8, M.roofTile);
      tRoof.position.set(tx, 11.3, D / 2 - 1.4);
      targetParent.add(tRoof);
    }

    for (const bx of [-5.8, 5.8]) {
      const b = this.makeBonsai72(1.18);
      b.position.set(bx, 0, D / 2 + 2.1);
      g.add(b);
    }
    for (const bx of [-8.8, 8.8]) {
      const b = this.makeBonsai72(0.82);
      b.position.set(bx, 0, D / 2 + 1.9);
      g.add(b);
    }

    // Keep the front stair landings walkable; colliders begin behind the lowest stair tread.
    this.addRectObstacle(9.5, 13.8, -6.5, 7.75);
    this.addRectObstacle(17.8, 28.2, -6.5, 7.75);
    this.addRectObstacle(32.2, 36.5, -6.5, 7.75);
    this.addRectObstacle(9.5, 36.5, -6.5, 0.5);
    return g;
  }

  buildVietnameseGroceryHouse() {
    // Cool Tree-Shaded End-of-Road Grocery & Buddhist Souvenir Shophouse ("TIỆM TẠP HÓA & LƯU NIỆM CUỐI ĐƯỜNG MÁT RƯỢI")
    // Placed down at the shaded end of the straight lane from Cổng Phụ Tịnh Độ Huyền Môn (x = 48.6, z = -17.5), right across from the Chánh Điện entrance veranda!
    const M = this.MAT;
    const house = new THREE.Group();
    house.position.set(48.6, 0, -17.5);
    house.rotation.y = -Math.PI * 0.5; // Front open shutter faces -X onto the shaded end-of-road plaza
    house.userData.stallType = 'am_thuc_chay';
    house.userData.stallTitle = 'Tiệm Tạp Hóa · Lưu Niệm Cuối Đường Mát';

    const masonryMat = new THREE.MeshStandardMaterial({ color: 0xEFE1B8, map: this.limeWallTex, roughness: 0.72 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xD7C192, roughness: 0.68 });
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xCFC5B4, roughness: 0.45 });
    const awningMat = new THREE.MeshStandardMaterial({ color: 0x1E6A4E, roughness: 0.42, metalness: 0.22 });
    const shutterMat = new THREE.MeshStandardMaterial({ color: 0x8F99A3, roughness: 0.36, metalness: 0.55 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x7A4824, map: this.woodGrainTex, roughness: 0.65 });

    // 1. Raised tiled concrete floor slab + solid masonry side/back walls (W=9.4m storefront, D=4.4m room depth)
    const floor = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.22, 6.2), floorMat);
    floor.position.set(0, 0.11, 0.7);
    floor.receiveShadow = true;
    house.add(floor);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(9.4, 3.65, 0.35), masonryMat);
    backWall.position.set(0, 1.92, -2.0);
    backWall.castShadow = true;
    house.add(backWall);

    for (const sx of [-4.55, 4.55]) {
      const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.65, 4.4), masonryMat);
      sideWall.position.set(sx, 1.92, 0.05);
      sideWall.castShadow = true;
      house.add(sideWall);
      const frontPier = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.7, 0.5), trimMat);
      frontPier.position.set(sx, 1.95, 2.05);
      house.add(frontPier);
    }

    // Main pitched terracotta-red Vietnamese shophouse roof + rolled-up silver shutter box above open storefront
    const mainRoof = makeHippedRoofMesh(10.2, 5.2, 1.55, M.roofTile);
    mainRoof.position.set(0, 4.45, -0.05);
    mainRoof.castShadow = true;
    house.add(mainRoof);

    const shutterBox = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.55, 0.42), shutterMat);
    shutterBox.position.set(0, 3.35, 2.05);
    house.add(shutterBox);

    // 2. Protruding Slanted Corrugated Tôn Veranda Awning ("Mái hiên nhà tạp hóa") + metal veranda posts
    const awning = new THREE.Mesh(new THREE.BoxGeometry(9.9, 0.1, 3.0), awningMat);
    awning.position.set(0, 2.9, 3.25);
    awning.rotation.x = 0.2;
    awning.castShadow = true;
    house.add(awning);

    const steelPostMat = new THREE.MeshStandardMaterial({ color: 0xD2D8E0, metalness: 0.68, roughness: 0.28 });
    for (const px of [-4.4, 0, 4.4]) {
      const vPost = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 2.65, 8), steelPostMat);
      vPost.position.set(px, 1.325, 4.48);
      house.add(vPost);
    }

    // 3. Large Glowing Glass-Door Beverage Cooler Fridge ("Tủ mát nước giải khát") inside storefront
    const fridgeBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 2.15, 0.85),
      new THREE.MeshStandardMaterial({ color: 0xEFF4F8, roughness: 0.3 })
    );
    fridgeBody.position.set(-3.3, 1.25, -1.25);
    house.add(fridgeBody);
    const fridgeGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.25, 1.65),
      new THREE.MeshBasicMaterial({ color: 0xBCE8FF })
    );
    fridgeGlow.position.set(-3.3, 1.35, -0.81);
    house.add(fridgeGlow);
    for (let r = 0; r < 4; r++) {
      for (let b = 0; b < 5; b++) {
        const bottle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.045, 0.05, 0.24, 6),
          new THREE.MeshStandardMaterial({ color: b % 2 === 0 ? 0x269448 : 0xD63E2A, roughness: 0.28 })
        );
        bottle.position.set(-3.75 + b * 0.22, 0.72 + r * 0.36, -0.78);
        house.add(bottle);
      }
    }

    // 4. Wall-to-wall 3-tier Grocery Shelving ("Kệ hàng tạp hóa") filled with incense boxes, snacks, water packs
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x4E5B6B, metalness: 0.4, roughness: 0.55 });
    for (const sy of [0.85, 1.55, 2.25]) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.08, 0.62), shelfMat);
      plank.position.set(0.85, sy, -1.42);
      house.add(plank);
      for (let gi = 0; gi < 9; gi++) {
        const boxCol = gi % 3 === 0 ? 0xC63428 : gi % 3 === 1 ? 0xE6B038 : 0x2A784C;
        const pkg = new THREE.Mesh(
          new THREE.BoxGeometry(0.38, 0.32, 0.32),
          new THREE.MeshStandardMaterial({ color: boxCol, roughness: 0.5 })
        );
        pkg.position.set(-1.5 + gi * 0.58, sy + 0.2, -1.4);
        house.add(pkg);
      }
    }

    // 5. Front Shopkeeper Wooden-Glass Counter + Conical Hats, Incense Bundles & Fresh Lotus Buckets
    const counter = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.02, 0.88), woodMat);
    counter.position.set(-0.8, 0.68, 1.35);
    counter.castShadow = true;
    house.add(counter);

    const glassTop = new THREE.Mesh(
      new THREE.BoxGeometry(5.64, 0.06, 0.92),
      new THREE.MeshStandardMaterial({ color: 0xD9F0F8, roughness: 0.16, metalness: 0.18 })
    );
    glassTop.position.set(-0.8, 1.21, 1.35);
    house.add(glassTop);

    for (let hi = 0; hi < 4; hi++) {
      const hat = new THREE.Mesh(
        new THREE.ConeGeometry(0.28, 0.16, 16),
        new THREE.MeshStandardMaterial({ color: 0xEAD6AA, roughness: 0.78 })
      );
      hat.position.set(-2.6 + hi * 0.72, 1.38, 1.35);
      house.add(hat);
    }
    const lotusBucket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.19, 0.42, 12),
      new THREE.MeshStandardMaterial({ color: 0x2F7E56, roughness: 0.42 })
    );
    lotusBucket.position.set(1.25, 1.42, 1.35);
    house.add(lotusBucket);
    for (let li = -1; li <= 1; li++) {
      const fl = this.makeLotusFlower3D(false);
      fl.scale.setScalar(0.95);
      fl.position.set(1.25 + li * 0.12, 1.68, 1.35);
      house.add(fl);
    }

    // 6. Red "Thùng Đá" Ice Chest + Plastic Tea Tables & Stools under the Veranda Shade
    const iceChest = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.62, 0.58),
      new THREE.MeshStandardMaterial({ color: 0xC83226, roughness: 0.34 })
    );
    iceChest.position.set(2.9, 0.52, 2.35);
    house.add(iceChest);

    for (const tz of [-1.8, 1.6]) {
      const pTable = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.5, 0.68),
        new THREE.MeshStandardMaterial({ color: 0x266BC4, roughness: 0.35 })
      );
      pTable.position.set(tz, 0.44, 3.45);
      house.add(pTable);
      for (const [ox, oz, cHex] of [
        [-0.65, 0, 0xD33A2C],
        [0.65, 0, 0x266BC4]
      ]) {
        const stool = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.3, 0.3),
          new THREE.MeshStandardMaterial({ color: cHex, roughness: 0.35 })
        );
        stool.position.set(tz + ox, 0.34, 3.45 + oz);
        house.add(stool);
      }
    }

    // 7. Bold Storefront Signboard across veranda eaves + Interactive Trigger Ring
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(8.6, 0.88, 0.14),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('TIỆM TẠP HÓA · ĐỒ LƯU NIỆM & NƯỚC MÁT CUỐI ĐƯỜNG', {
          w: 1600,
          h: 180,
          bg: '#FFF3D4',
          border: '#1C5A34',
          color: '#9E241C',
          size: 44
        }),
        roughness: 0.38
      })
    );
    signBoard.position.set(0, 2.95, 4.55);
    house.add(signBoard);

    const trigRing = new THREE.Mesh(
      new THREE.RingGeometry(0.75, 1.05, 28),
      new THREE.MeshBasicMaterial({ color: 0xFFD166, side: THREE.DoubleSide, transparent: true, opacity: 0.68 })
    );
    trigRing.rotation.x = -Math.PI / 2;
    trigRing.position.set(0, 0.05, 5.4);
    house.add(trigRing);

    this.exteriorGroup.add(house);
    this.stallAnchors.push(house);
    this.stallClickTargets.push(counter, awning, signBoard, fridgeBody, trigRing, mainRoof);

    // Physical house footprint collider at end of road (leaves x < 45.2 roadway & turn plaza completely open!)
    this.addRectObstacle(45.6, 53.2, -22.8, -12.2);

    // End-of-Lane Shaded Buddhist Souvenir & Cold Sugarcane Kiosk facing straight South (+Z) up the Tịnh Độ Huyền Môn road!
    const souvenirKiosk = new THREE.Group();
    souvenirKiosk.position.set(40.5, 0, -26.4);
    souvenirKiosk.userData.stallType = 'phap_khi';
    souvenirKiosk.userData.stallTitle = 'Quầy Lưu Niệm Phật Giáo · Chuỗi Hạt & Quà Mỹ Tho';
    const skRoof = makeHippedRoofMesh(8.4, 4.2, 1.25, awningMat);
    skRoof.position.set(0, 3.45, 0);
    skRoof.castShadow = true;
    souvenirKiosk.add(skRoof);
    for (const px of [-3.6, 0, 3.6]) {
      const pCol = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 3.1, 8), woodMat);
      pCol.position.set(px, 1.55, 1.55);
      souvenirKiosk.add(pCol);
    }
    const skCounter = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.98, 0.95), woodMat);
    skCounter.position.set(0, 0.49, 0.65);
    souvenirKiosk.add(skCounter);
    for (let si = -3; si <= 3; si++) {
      const disp = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.16, 0.26, 10),
        new THREE.MeshStandardMaterial({ color: si % 2 === 0 ? 0xD99B26 : 0xB83B28, roughness: 0.4 })
      );
      disp.position.set(si * 0.85, 1.12, 0.65);
      souvenirKiosk.add(disp);
    }
    const skSign = new THREE.Mesh(
      new THREE.BoxGeometry(7.6, 0.84, 0.12),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('QUẦY LƯU NIỆM PHẬT GIÁO · TRÀNG HẠT · TƯỢNG NHỎ · NƯỚC MÁT', {
          w: 1600,
          h: 180,
          bg: '#1E5B3A',
          border: '#FFD875',
          color: '#FFF8E7',
          size: 40
        }),
        roughness: 0.36
      })
    );
    skSign.position.set(0, 2.95, 1.85);
    souvenirKiosk.add(skSign);
    this.exteriorGroup.add(souvenirKiosk);
    this.stallClickTargets.push(skCounter, skSign, skRoof);
    this.addRectObstacle(36.6, 44.4, -28.4, -24.8);

    // Secondary authentic ice-cream / cold-drinks cart just outside Cổng Phụ
    const cart = new THREE.Group();
    cart.position.set(46.2, 0, 44.8);
    cart.rotation.y = -Math.PI * 0.5;
    cart.userData.stallType = 'am_thuc_chay';
    cart.userData.stallTitle = 'Quầy Nước Mát · Cà Rem Cổng Phụ';
    const cartBox = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 1.05, 1.05),
      new THREE.MeshStandardMaterial({ color: 0xF5EFE2, roughness: 0.4 })
    );
    cartBox.position.y = 0.72;
    cart.add(cartBox);
    const cartSign = new THREE.Mesh(
      new THREE.BoxGeometry(1.65, 0.65, 0.08),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('CÀ REM MỸ THO · DỪA XIÊM', {
          w: 640,
          h: 220,
          bg: '#FFF8EC',
          border: '#C9382B',
          color: '#B8251C',
          size: 46
        })
      })
    );
    cartSign.position.set(0, 0.74, 0.54);
    cart.add(cartSign);
    this.exteriorGroup.add(cart);
    this.stallClickTargets.push(cartBox, cartSign);
    this.addRectObstacle(45.2, 47.4, 43.4, 46.2);

    this.stallTriggers.push(
      {
        x: 42.6,
        z: -17.5,
        radius: 6.8,
        stallType: 'am_thuc_chay',
        title: 'Tiệm Tạp Hóa · Lưu Niệm Cuối Đường Mát',
        ring: trigRing
      },
      {
        x: 40.5,
        z: -23.0,
        radius: 5.5,
        stallType: 'phap_khi',
        title: 'Quầy Lưu Niệm Phật Giáo · Quà Chùa Vĩnh Tràng',
        ring: trigRing
      },
      {
        x: 43.6,
        z: 44.8,
        radius: 4.5,
        stallType: 'am_thuc_chay',
        title: 'Quầy Nước Mát · Cà Rem Cổng Phụ',
        ring: trigRing
      }
    );
  }

  makeBonsai72(scale = 1) {
    const M = this.MAT;
    const g = new THREE.Group();
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 0.45, 12), M.stoneDark);
    stand.position.y = 0.225;
    g.add(stand);
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.78, 0.52, 0.68, 16),
      M.terracottaPot
    );
    pot.position.y = 0.78;
    pot.castShadow = true;
    g.add(pot);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.78, 0.07, 8, 18),
      M.terracottaPot
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.12;
    g.add(rim);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, 1.9, 10), M.trunk);
    trunk.position.y = 1.95;
    trunk.rotation.z = 0.08;
    g.add(trunk);
    const pads = [
      [0, 1.55, 0, 0.85],
      [-0.58, 1.95, 0.15, 0.68],
      [0.58, 2.15, -0.1, 0.68],
      [-0.38, 2.55, -0.1, 0.56],
      [0.35, 2.7, 0.12, 0.54],
      [0, 3.05, 0, 0.52]
    ];
    for (const [px, py, pz, r] of pads) {
      const pad = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), M.foliageMid);
      pad.scale.set(1.35, 0.42, 1.15);
      pad.position.set(px, py, pz);
      pad.castShadow = true;
      g.add(pad);
    }
    g.scale.setScalar(scale);
    return g;
  }

  buildSideHall(w, d, h, wallMat) {
    const M = this.MAT;
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    body.position.y = h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);
    const roof = makeHippedRoofMesh(w + 1.1, d + 1.1, 2.2, M.roofTile);
    roof.position.y = h + 1.05;
    roof.castShadow = true;
    g.add(roof);
    return g;
  }

  buildIncenseStallAndBookRoom() {
    // Handled by buildVietnameseGroceryHouse() along the Cổng Phụ entry plaza
  }

  buildGiangDuong() {
    const M = this.MAT;
    const g = new THREE.Group();
    const f1 = new THREE.Mesh(new THREE.BoxGeometry(9.6, 4.2, 18.8), M.goldWall);
    f1.position.y = 2.1;
    f1.castShadow = true;
    f1.receiveShadow = true;
    g.add(f1);
    const f2 = new THREE.Mesh(new THREE.BoxGeometry(9.2, 3.8, 18.2), M.creamTrim);
    f2.position.y = 6.1;
    f2.castShadow = true;
    g.add(f2);
    const roof = makeHippedRoofMesh(10.8, 20.0, 2.8, M.roofTile);
    roof.position.y = 9.3;
    roof.castShadow = true;
    g.add(roof);
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(5.8, 0.95, 0.18),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('GIẢNG ĐƯỜNG PHẬT PHÁP', { w: 1024, h: 200, size: 68 })
      })
    );
    sign.rotation.y = -Math.PI / 2;
    sign.position.set(-4.85, 4.2, 0);
    g.add(sign);
    return g;
  }

  buildSevenTierStupa() {
    const M = this.MAT;
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.6, 1.4, 8), M.stoneDark);
    base.position.y = 0.7;
    base.receiveShadow = true;
    g.add(base);
    let y = 1.4;
    for (let i = 0; i < 7; i++) {
      const r = 3.0 - i * 0.28;
      const h = 2.2 - i * 0.1;
      const body = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.88, r, h, 8), M.stupaBody);
      body.position.y = y + h / 2;
      body.castShadow = true;
      g.add(body);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(r * 1.32, 0.78, 8), M.stupaRoof);
      roof.position.y = y + h + 0.35;
      roof.castShadow = true;
      g.add(roof);
      y += h + 0.45;
    }
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.38, 2.8, 12), M.goldAccent);
    spire.position.y = y + 1.4;
    g.add(spire);
    return g;
  }

  buildStatuePedestals() {
    const M = this.MAT;

    // 1. Đại tượng Phật A Di Đà — hoa viên lệch Tây để giữ trục Tam Quan -> Chánh Điện thông thoáng.
    // Tư liệu thực tế: thân tượng 18m, đài sen và bệ khoảng 7m, tổng chiều cao khoảng 25m.
    this.adidaGroup = new THREE.Group();
    this.adidaGroup.position.set(8.5, 0, 17.5);
    const adidaPlaza = new THREE.Mesh(
      new THREE.CylinderGeometry(8.8, 9.2, 0.18, 32),
      M.stoneLight
    );
    adidaPlaza.position.y = 0.09;
    adidaPlaza.receiveShadow = true;
    this.adidaGroup.add(adidaPlaza);
    const adidaTerrace = new THREE.Mesh(
      new THREE.CylinderGeometry(6.4, 7.0, 0.42, 24),
      M.stoneDark
    );
    adidaTerrace.position.y = 0.21;
    adidaTerrace.receiveShadow = true;
    this.adidaGroup.add(adidaTerrace);

    const adidaFrontSign = new THREE.Mesh(
      new THREE.BoxGeometry(5.8, 0.78, 0.16),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('PHẬT A DI ĐÀ · TƯỢNG 18M · ĐÀI SEN/BỆ 7M', { w: 1600, h: 200, size: 46 })
      })
    );
    adidaFrontSign.position.set(0, 0.82, 5.55);
    this.adidaGroup.add(adidaFrontSign);

    // Four tropical shade trees frame the flower garden without hiding the statue silhouette.
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const tx = Math.sin(ang) * 9.6;
      const tz = -Math.cos(ang) * 9.6;
      const t = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 3.8, 10), M.trunk);
      trunk.position.y = 1.9;
      t.add(trunk);
      const crown = new THREE.Mesh(new THREE.SphereGeometry(1.9, 16, 12), M.foliageDark);
      crown.position.y = 4.0;
      crown.scale.set(1.18, 0.92, 1.12);
      t.add(crown);
      t.position.set(tx, 0, tz);
      this.adidaGroup.add(t);
    }
    this.exteriorGroup.add(this.adidaGroup);
    this.addObstacle(8.5, 17.5, 6.8);

    // 2. Đại tượng Phật Di Lặc — công viên bên tay phải chùa khi nhìn từ trong ra.
    // Tượng thực tế dài 27m, rộng 18m, cao 20m; khối đế là công trình kiến trúc bên dưới tượng.
    this.dilacGroup = new THREE.Group();
    this.dilacGroup.position.set(-24.5, 0, 4.0);
    const dilacTerrace = new THREE.Mesh(new THREE.BoxGeometry(27.0, 4.8, 18.2), M.pedestalRed);
    dilacTerrace.position.set(0, 2.4, 1.8);
    dilacTerrace.receiveShadow = true;
    dilacTerrace.castShadow = true;
    this.dilacGroup.add(dilacTerrace);
    const dilacCap = new THREE.Mesh(new THREE.BoxGeometry(27.4, 0.22, 18.6), M.stoneLight);
    dilacCap.position.set(0, 4.81, 1.8);
    dilacCap.receiveShadow = true;
    this.dilacGroup.add(dilacCap);

    for (let st = 0; st < 7; st++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(15.0, 0.6, 0.62),
        st % 2 === 0 ? M.stoneLight : M.creamTrim
      );
      step.position.set(0, 0.3 + st * 0.65, 16.5 - st * 0.42);
      step.receiveShadow = true;
      this.dilacGroup.add(step);
    }
    const stairLanding = new THREE.Mesh(new THREE.BoxGeometry(18.0, 0.6, 3.6), M.creamTrim);
    stairLanding.position.set(0, 4.62, 12.3);
    stairLanding.receiveShadow = true;
    this.dilacGroup.add(stairLanding);

    const railMetal = new THREE.MeshStandardMaterial({ color: 0xD8DCE2, metalness: 0.72, roughness: 0.32 });
    for (const hx of [-7.0, 7.0]) {
      const postBot = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), railMetal);
      postBot.position.set(hx, 0.75, 16.6);
      this.dilacGroup.add(postBot);
      const postTop = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), railMetal);
      postTop.position.set(hx, 4.45, 12.8);
      this.dilacGroup.add(postTop);
      const railBar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 5.7, 8), railMetal);
      railBar.position.set(hx, 2.55, 14.7);
      railBar.rotation.x = Math.PI / 2 - 0.62;
      this.dilacGroup.add(railBar);
    }

    const dilacBlackBand = new THREE.Mesh(
      new THREE.BoxGeometry(25.5, 1.25, 0.34),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('當 來 彌 勒 大 佛', {
          w: 1800,
          h: 190,
          bg: '#1C1E21',
          border: '#3C3E42',
          color: '#E7B448',
          size: 86
        }),
        roughness: 0.82
      })
    );
    dilacBlackBand.position.set(0, 3.55, 11.02);
    this.dilacGroup.add(dilacBlackBand);

    const dilacRedBand = new THREE.Mesh(
      new THREE.BoxGeometry(25.5, 1.0, 0.38),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('NAM MÔ ĐƯƠNG LAI DI LẶC TÔN PHẬT', {
          w: 1800,
          h: 170,
          bg: '#A6432B',
          border: '#7E2B19',
          color: '#FFD76E',
          size: 56
        }),
        roughness: 0.72
      })
    );
    dilacRedBand.position.set(0, 2.42, 11.05);
    this.dilacGroup.add(dilacRedBand);

    this.exteriorGroup.add(this.dilacGroup);
    this.addRectObstacle(-38.5, -10.5, -4.5, 14.9);

    // West garden plaza: low planters and clipped tropical shrubs frame the Di Lặc courtyard.
    for (const wx of [-36.2, -13.2]) {
      for (let zi = 0; zi < 4; zi++) {
        const wz = 22.5 + zi * 4.8;
        const bushPot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.42, 0.52, 12), M.terracottaPot);
        bushPot.position.set(wx, 0.26, wz);
        this.exteriorGroup.add(bushPot);
        const bush = new THREE.Mesh(new THREE.SphereGeometry(0.75, 10, 8), M.foliageMid);
        bush.scale.set(1.05, 0.78, 1.0);
        bush.position.set(wx, 0.78, wz);
        bush.castShadow = true;
        this.exteriorGroup.add(bush);
      }
    }

    // 3. Đại tượng Phật Thích Ca nhập Niết Bàn — khu vườn phía sau Chánh điện.
    // Bệ đá 3 tầng cao 3.6m cùng 5 bậc tam cấp phía Nam hướng Phật tử.
    this.nietBanGroup = new THREE.Group();
    this.nietBanGroup.position.set(-24.5, 0, -24.0);
    const nbTier1 = new THREE.Mesh(new THREE.BoxGeometry(35.0, 1.2, 18.0), M.stoneDark);
    nbTier1.position.y = 0.6;
    nbTier1.receiveShadow = true;
    nbTier1.castShadow = true;
    this.nietBanGroup.add(nbTier1);
    const nbTier2 = new THREE.Mesh(new THREE.BoxGeometry(34.2, 1.2, 17.2), M.creamTrim);
    nbTier2.position.y = 1.8;
    nbTier2.receiveShadow = true;
    nbTier2.castShadow = true;
    this.nietBanGroup.add(nbTier2);
    const nbTier3 = new THREE.Mesh(new THREE.BoxGeometry(33.6, 1.2, 16.6), M.stoneLight);
    nbTier3.position.y = 3.0;
    nbTier3.receiveShadow = true;
    nbTier3.castShadow = true;
    this.nietBanGroup.add(nbTier3);
    for (let st = 0; st < 5; st++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.44, 0.55), M.stoneLight);
      step.position.set(0, 0.22 + st * 0.42, 9.8 - st * 0.4);
      step.receiveShadow = true;
      this.nietBanGroup.add(step);
    }

    const nbSign = new THREE.Mesh(
      new THREE.BoxGeometry(12.5, 1.15, 0.18),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('NAM MÔ BỔN SƯ THÍCH CA MÂU NI PHẬT', {
          w: 1600,
          h: 200,
          bg: '#4E5054',
          border: '#C9962E',
          color: '#FFE08A',
          size: 56
        })
      })
    );
    nbSign.position.set(0, 2.2, 9.15);
    this.nietBanGroup.add(nbSign);
    this.exteriorGroup.add(this.nietBanGroup);
    this.addRectObstacle(-42.0, -7.0, -33.0, -15.0);

    // 4. Đài Quán Thế Âm Bồ Tát near entrance — oriented INWARD (-X / -Z toward inner temple courtyard & Chánh Điện)
    this.quanAmGroup = new THREE.Group();
    this.quanAmGroup.position.set(32.8, 0, 23.5);
    this.quanAmGroup.rotation.y = -Math.PI * 0.62;
    const qaPool = new THREE.Mesh(new THREE.CylinderGeometry(2.65, 2.95, 0.52, 8), M.creamTrim);
    qaPool.position.y = 0.26;
    qaPool.receiveShadow = true;
    this.quanAmGroup.add(qaPool);
    const qaWater = new THREE.Mesh(
      new THREE.CylinderGeometry(2.35, 2.35, 0.44, 16),
      new THREE.MeshStandardMaterial({ color: 0x357E70, roughness: 0.18, metalness: 0.15 })
    );
    qaWater.position.y = 0.3;
    this.quanAmGroup.add(qaWater);

    const qaPlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.18, 1.35, 8), M.statueWhite);
    qaPlinth.position.y = 1.15;
    qaPlinth.castShadow = true;
    this.quanAmGroup.add(qaPlinth);

    const lotusBaseMat = new THREE.MeshStandardMaterial({ color: 0xF596B8, roughness: 0.42 });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const pet = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.52, 6), lotusBaseMat);
      pet.position.set(Math.cos(a) * 0.85, 1.98, Math.sin(a) * 0.85);
      pet.rotation.z = -Math.cos(a) * 0.6;
      pet.rotation.x = Math.sin(a) * 0.6;
      this.quanAmGroup.add(pet);
    }

    const qaRobeLower = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.72, 2.15, 16), M.statueWhite);
    qaRobeLower.position.y = 3.05;
    qaRobeLower.castShadow = true;
    this.quanAmGroup.add(qaRobeLower);
    const qaTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.48, 1.25, 14), M.statueWhite);
    qaTorso.position.y = 4.68;
    qaTorso.castShadow = true;
    this.quanAmGroup.add(qaTorso);
    const qaHead = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), M.statueWhite);
    qaHead.position.y = 5.56;
    this.quanAmGroup.add(qaHead);
    const qaCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.36, 10), M.statueWhite);
    qaCrown.position.y = 5.88;
    this.quanAmGroup.add(qaCrown);
    const qaVeil = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.56, 1.25, 10, 1, true, Math.PI * 0.45, Math.PI * 1.1), M.statueWhite);
    qaVeil.position.set(0, 5.25, -0.06);
    this.quanAmGroup.add(qaVeil);
    const qaLeftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.75, 8), M.statueWhite);
    qaLeftArm.position.set(-0.34, 4.65, 0.22);
    qaLeftArm.rotation.set(-0.7, 0, -0.25);
    this.quanAmGroup.add(qaLeftArm);
    const camLoVase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.13, 0.34, 12),
      new THREE.MeshStandardMaterial({ color: 0xCFE8D5, roughness: 0.25, metalness: 0.1 })
    );
    camLoVase.position.set(-0.28, 4.55, 0.52);
    this.quanAmGroup.add(camLoVase);
    const qaRightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.75, 8), M.statueWhite);
    qaRightArm.position.set(0.34, 4.82, 0.22);
    qaRightArm.rotation.set(-0.95, 0, 0.2);
    this.quanAmGroup.add(qaRightArm);
    this.quanAmPlaceholderParts.push(qaRobeLower, qaTorso, qaHead, qaCrown, qaVeil, qaLeftArm, camLoVase, qaRightArm);
    const qaHalo = new THREE.Mesh(
      new THREE.RingGeometry(0.58, 0.72, 24),
      new THREE.MeshBasicMaterial({ color: 0xFFE296, side: THREE.DoubleSide })
    );
    qaHalo.position.set(0, 5.62, -0.18);
    this.quanAmGroup.add(qaHalo);

    const qaSign = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.52, 0.12),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('ĐÀI QUÁN THẾ ÂM BỒ TÁT', { w: 768, h: 160, bg: '#1C5A34', border: '#FFD875', color: '#FFF6E5', size: 46 })
      })
    );
    qaSign.position.set(0, 0.65, 2.7);
    this.quanAmGroup.add(qaSign);

    this.exteriorGroup.add(this.quanAmGroup);
    this.addObstacle(32.8, 22.5, 2.6);
  }

  makeLotusFlower3D(isWhite = false, trackAnim = false) {
    const g = new THREE.Group();
    const petalMat = isWhite
      ? new THREE.MeshStandardMaterial({
          color: 0xFFF7EC,
          emissive: 0xFFD97D,
          emissiveIntensity: 0.04,
          roughness: 0.42,
          side: THREE.DoubleSide
        })
      : new THREE.MeshStandardMaterial({
          color: 0xF478A8,
          emissive: 0xFF9AC0,
          emissiveIntensity: 0.05,
          roughness: 0.42,
          side: THREE.DoubleSide
        });
    const innerMat = isWhite
      ? petalMat
      : new THREE.MeshStandardMaterial({
          color: 0xFF9AC0,
          emissive: 0xFFD166,
          emissiveIntensity: 0.05,
          roughness: 0.38,
          side: THREE.DoubleSide
        });
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0xF4C430,
      emissive: 0xFFE07A,
      emissiveIntensity: 0.08,
      roughness: 0.45
    });
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.045, 0.09, 10), centerMat);
    pod.position.y = 0.08;
    g.add(pod);

    const outerPivots = [];
    const innerPivots = [];

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const ringAnchor = new THREE.Group();
      ringAnchor.rotation.y = -a + Math.PI / 2;
      const hinge = new THREE.Group();
      hinge.position.set(0, 0.05, 0.08);
      hinge.rotation.x = 0.46;
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 8, 6, 0, Math.PI, 0, Math.PI * 0.72),
        petalMat
      );
      p.scale.set(0.65, 1.35, 0.35);
      p.position.set(0, 0.04, 0.02);
      hinge.add(p);
      ringAnchor.add(hinge);
      g.add(ringAnchor);
      outerPivots.push(hinge);
    }

    for (let i = 0; i < 6; i++) {
      const a = ((i + 0.5) / 6) * Math.PI * 2;
      const ringAnchor = new THREE.Group();
      ringAnchor.rotation.y = -a + Math.PI / 2;
      const hinge = new THREE.Group();
      hinge.position.set(0, 0.08, 0.05);
      hinge.rotation.x = 0.22;
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 6, 0, Math.PI, 0, Math.PI * 0.7),
        innerMat
      );
      p.scale.set(0.55, 1.45, 0.32);
      p.position.set(0, 0.035, 0.015);
      hinge.add(p);
      ringAnchor.add(hinge);
      g.add(ringAnchor);
      innerPivots.push(hinge);
    }

    if (trackAnim) {
      this.pondLotusAnims.push({
        group: g,
        outerPivots,
        innerPivots,
        petalMat,
        innerMat,
        centerMat,
        baseScale: 1.0
      });
    }
    return g;
  }

  makeKoiPatternTex(variant = 0) {
    return makeCanvasTex((g, w, h) => {
      if (variant === 2) {
        g.fillStyle = '#F5B82E';
        g.fillRect(0, 0, w, h);
        g.fillStyle = '#FFE07A';
        g.fillRect(0, h * 0.22, w, h * 0.56);
      } else {
        g.fillStyle = '#FFF9F0';
        g.fillRect(0, 0, w, h);
        g.fillStyle = variant === 0 ? '#E84A24' : '#F25F29';
        for (const [cx, cy, rx, ry] of [
          [w * 0.32, h * 0.5, 28, 22],
          [w * 0.62, h * 0.45, 22, 18],
          [w * 0.78, h * 0.55, 14, 14]
        ]) {
          g.beginPath();
          g.ellipse(cx, cy, rx, ry, 0.3, 0, Math.PI * 2);
          g.fill();
        }
        if (variant === 1) {
          g.fillStyle = '#201F24';
          for (const [cx, cy, r] of [
            [w * 0.44, h * 0.36, 9],
            [w * 0.68, h * 0.62, 7]
          ]) {
            g.beginPath();
            g.arc(cx, cy, r, 0, Math.PI * 2);
            g.fill();
          }
        }
      }
    }, 128, 128, 1, 1);
  }

  makeNotchedLilyPadGeo(radius = 0.45) {
    const shape = new THREE.Shape();
    const startAngle = 0.24;
    const endAngle = Math.PI * 2 - 0.24;
    shape.moveTo(0, 0);
    shape.absarc(0, 0, radius, startAngle, endAngle, false);
    shape.lineTo(0, 0);
    const geo = new THREE.ShapeGeometry(shape, 18);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }

  buildLotusPond(w, d, koiCount = 12, showPalmFlagDecor = false) {
    const M = this.MAT;
    const g = new THREE.Group();
    const wallH = 0.64;
    const wallT = 0.42;

    for (const sz of [-(d / 2 + wallT / 2), d / 2 + wallT / 2]) {
      const wWall = new THREE.Mesh(new THREE.BoxGeometry(w + wallT * 2, wallH, wallT), M.stoneLight);
      wWall.position.set(0, wallH / 2, sz);
      wWall.receiveShadow = true;
      g.add(wWall);
    }
    for (const sx of [-(w / 2 + wallT / 2), w / 2 + wallT / 2]) {
      const sWall = new THREE.Mesh(new THREE.BoxGeometry(wallT, wallH, d), M.stoneLight);
      sWall.position.set(sx, wallH / 2, 0);
      sWall.receiveShadow = true;
      g.add(sWall);
    }

    const bed = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.14, d),
      new THREE.MeshStandardMaterial({ color: 0x1D3327, roughness: 0.94 })
    );
    bed.position.y = 0.14;
    bed.receiveShadow = true;
    g.add(bed);

    const rockMat = new THREE.MeshStandardMaterial({ color: 0x5E625B, roughness: 0.88 });
    for (let i = 0; i < 8; i++) {
      const rx = ((i * 2.93) % (w - 2.4)) - (w - 2.4) / 2;
      const rz = ((i * 3.71) % (d - 2.0)) - (d - 2.0) / 2;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32 + (i % 3) * 0.12, 0), rockMat);
      rock.scale.set(1.3, 0.65, 1.1);
      rock.position.set(rx, 0.26, rz);
      g.add(rock);
    }

    const waterMat = new THREE.MeshPhysicalMaterial({
      map: this.waterTex,
      color: 0x3C8A7C,
      roughness: 0.14,
      metalness: 0.08,
      clearcoat: 0.82,
      clearcoatRoughness: 0.14,
      transparent: true,
      opacity: 0.72
    });
    const water = new THREE.Mesh(new THREE.PlaneGeometry(w, d), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = wallH - 0.05;
    water.renderOrder = 2;
    g.add(water);

    const step = 1.6;
    for (let x = -w / 2; x <= w / 2; x += step) {
      for (const z of [-d / 2 - 0.2, d / 2 + 0.2]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.58, 0.18), M.creamTrim);
        post.position.set(x, wallH + 0.29, z);
        g.add(post);
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), M.goldAccent);
        cap.position.set(x, wallH + 0.62, z);
        g.add(cap);
      }
    }

    // Keep Main Lotus Pond open & serene with stone corner lanterns instead of crude cone palms or mid-air flags
    if (showPalmFlagDecor) {
      for (const [lx, lz] of [
        [-w / 2 - 0.5, d / 2 + 0.4],
        [w / 2 + 0.5, d / 2 + 0.4],
        [-w / 2 - 0.5, -d / 2 - 0.4],
        [w / 2 + 0.5, -d / 2 - 0.4]
      ]) {
        const cLantern = this.makeStoneLantern();
        cLantern.scale.setScalar(0.76);
        cLantern.position.set(lx, 0, lz);
        g.add(cLantern);
      }
    }

    const padMat = new THREE.MeshStandardMaterial({
      map: this.lotusPadTex,
      roughness: 0.55,
      side: THREE.DoubleSide
    });
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x3B6E30, roughness: 0.7 });
    const clusterCenters = [
      [-w * 0.28, -d * 0.22],
      [w * 0.25, -d * 0.18],
      [-w * 0.2, d * 0.24],
      [w * 0.28, d * 0.2],
      [0, 0]
    ];
    for (let cIdx = 0; cIdx < clusterCenters.length; cIdx++) {
      const [cx, cz] = clusterCenters[cIdx];
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 + cIdx * 0.7;
        const dist = 0.45 + (i % 3) * 0.62;
        const lx = Math.max(-w / 2 + 0.9, Math.min(w / 2 - 0.9, cx + Math.cos(ang) * dist));
        const lz = Math.max(-d / 2 + 0.9, Math.min(d / 2 - 0.9, cz + Math.sin(ang) * dist));
        const r = 0.34 + ((i + cIdx) % 4) * 0.08;
        const pad = new THREE.Mesh(this.makeNotchedLilyPadGeo(r), padMat);
        pad.position.set(lx, wallH - 0.025, lz);
        pad.rotation.y = ang * 1.7;
        g.add(pad);

        if (i % 2 === 0) {
          const lotusPivot = new THREE.Group();
          const stemH = 0.18 + ((i + cIdx) % 3) * 0.14;
          lotusPivot.position.set(lx + 0.08, wallH - 0.03, lz - 0.05);
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, stemH, 6), stemMat);
          stem.position.y = stemH / 2;
          lotusPivot.add(stem);
          const fl = this.makeLotusFlower3D((i + cIdx) % 5 === 0, true);
          const baseSc = 1.05 + (i % 2) * 0.22;
          fl.position.y = stemH;
          fl.scale.setScalar(baseSc);
          if (this.pondLotusAnims.length > 0) {
            this.pondLotusAnims[this.pondLotusAnims.length - 1].baseScale = baseSc;
          }
          lotusPivot.add(fl);
          g.add(lotusPivot);
          this.lotusSwayGroups.push({ group: lotusPivot, phase: i * 1.1 + cIdx });
        }
      }
    }

    // Articulated sculpted & patterned Koi swimming along smooth closed CatmullRomCurve3 splines under water
    if (!this._koiTexSet) {
      this._koiTexSet = [0, 1, 2].map((v) => this.makeKoiPatternTex(v));
    }
    if (!this._koiBodyGeo) {
      // Smooth curved Koi profile (head -> broad shoulder -> tapered peduncle)
      const pts = [
        new THREE.Vector2(0.005, 0.28),
        new THREE.Vector2(0.068, 0.22),
        new THREE.Vector2(0.095, 0.10),
        new THREE.Vector2(0.072, -0.05),
        new THREE.Vector2(0.032, -0.20),
        new THREE.Vector2(0.012, -0.27)
      ];
      const lathe = new THREE.LatheGeometry(pts, 12);
      lathe.rotateX(Math.PI / 2);
      lathe.scale(0.86, 0.68, 1.0);
      this._koiBodyGeo = lathe;
    }

    const finMat = new THREE.MeshStandardMaterial({
      color: 0xFFF4E0,
      transparent: true,
      opacity: 0.86,
      roughness: 0.35,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < koiCount; i++) {
      const fishGroup = new THREE.Group();
      const bodyPivot = new THREE.Group();
      fishGroup.add(bodyPivot);

      const skinTex = this._koiTexSet[i % this._koiTexSet.length];
      const bodyMat = new THREE.MeshStandardMaterial({
        map: skinTex,
        roughness: 0.24,
        metalness: i % 3 === 2 ? 0.22 : 0.05
      });
      const body = new THREE.Mesh(this._koiBodyGeo, bodyMat);
      bodyPivot.add(body);

      const dorsal = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.075), finMat);
      dorsal.rotation.y = Math.PI / 2;
      dorsal.position.set(0, 0.08, -0.02);
      bodyPivot.add(dorsal);

      for (const side of [-1, 1]) {
        const pec = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.08), finMat);
        pec.rotation.x = -Math.PI / 2;
        pec.rotation.z = side * 0.45;
        pec.position.set(side * 0.09, -0.01, 0.08);
        bodyPivot.add(pec);
      }

      const tailPivot = new THREE.Group();
      tailPivot.position.set(0, 0, -0.25);
      const tailGeo = new THREE.ShapeGeometry(
        (() => {
          const s = new THREE.Shape();
          s.moveTo(0, 0);
          s.lineTo(-0.16, 0.08);
          s.lineTo(-0.12, 0);
          s.lineTo(-0.16, -0.08);
          s.closePath();
          return s;
        })()
      );
      tailGeo.rotateY(Math.PI / 2);
      const tailMesh = new THREE.Mesh(tailGeo, finMat);
      tailPivot.add(tailMesh);
      bodyPivot.add(tailPivot);

      const koiScale = 0.85 + (i % 4) * 0.14;
      fishGroup.scale.setScalar(koiScale);
      g.add(fishGroup);

      // Build unique organic closed figure-8 / meandering curve inside pond walls
      const mx = w * 0.36;
      const mz = d * 0.34;
      const a0 = (i / Math.max(1, koiCount)) * Math.PI * 2;
      const ctrl = [];
      const nPts = 6;
      for (let p = 0; p < nPts; p++) {
        const th = a0 + (p / nPts) * Math.PI * 2;
        const radScale = 0.48 + 0.38 * Math.sin(p * 1.9 + i);
        const px = Math.cos(th) * mx * radScale;
        const pz = Math.sin(th * (i % 2 === 0 ? 1 : 2)) * mz * (0.45 + 0.35 * Math.cos(p + i));
        const py = wallH - 0.17 - ((p + i) % 3) * 0.03;
        ctrl.push(new THREE.Vector3(px, py, pz));
      }
      const curve = new THREE.CatmullRomCurve3(ctrl, true, 'catmullrom', 0.5);

      this.koiList.push({
        mesh: fishGroup,
        bodyPivot,
        tail: tailPivot,
        curve,
        speed: 0.032 + (i % 5) * 0.007,
        phase: (i * 0.17) % 1
      });
    }
    return g;
  }

  buildIncenseBurner(scale = 1) {
    const M = this.MAT;
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.22, 0.38, 12), M.stoneDark);
    base.position.y = 0.19;
    g.add(base);
    // 3 Bronze tripod legs
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.55, 8), M.bronzeBurner);
      leg.position.set(Math.cos(a) * 0.55, 0.52, Math.sin(a) * 0.55);
      g.add(leg);
    }
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.64, 0.96, 20), M.bronzeBurner);
    body.position.y = 1.02;
    body.castShadow = true;
    g.add(body);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.83, 0.09, 10, 24), M.goldAccent);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.48;
    g.add(rim);
    // Dragon handles on left and right of burner
    for (const sx of [-0.92, 0.92]) {
      const ear = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 8, 14), M.goldAccent);
      ear.position.set(sx, 1.22, 0);
      g.add(ear);
    }
    // Oil lamp on small ritual table beside main burner
    const lampStand = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.95, 10), M.stoneDark);
    lampStand.position.set(1.28, 0.475, 0.35);
    g.add(lampStand);
    const oilFlame = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.22, 8),
      new THREE.MeshBasicMaterial({ color: 0xFF9800 })
    );
    oilFlame.position.set(1.28, 1.06, 0.35);
    g.add(oilFlame);

    const ash = new THREE.Mesh(
      new THREE.CylinderGeometry(0.74, 0.74, 0.1, 16),
      new THREE.MeshStandardMaterial({ color: 0xC9BD9F, roughness: 0.95 })
    );
    ash.position.y = 1.44;
    g.add(ash);
    g.scale.setScalar(scale);
    return g;
  }

  makeKneelingCushion() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x9E241C, roughness: 0.72 });
    const trim = this.MAT.goldAccent;
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.5, 0.14, 16), mat);
    pad.position.y = 0.07;
    pad.receiveShadow = true;
    g.add(pad);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.03, 8, 18), trim);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.13;
    g.add(ring);
    return g;
  }

  makeStoneLantern() {
    const M = this.MAT;
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.35, 0.78), M.stoneDark);
    base.position.y = 0.175;
    g.add(base);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.25, 8), M.stoneLight);
    shaft.position.y = 0.95;
    shaft.castShadow = true;
    g.add(shaft);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.42, 0.46), M.lanternGlow);
    lamp.position.y = 1.78;
    g.add(lamp);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.42, 4), M.stoneDark);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 2.18;
    g.add(roof);
    return g;
  }

  buildGardensTreesAndFlags() {
    const M = this.MAT;

    // 1. Flag Courtyard Banners: Vietnam Red Flag left (x = 18.2) & 5-Color Buddhist Flag right (x = 27.8) on round yellow tiers (image_97204806.png)
    const buildFlagPole = (fx, fz, isVietnam) => {
      const grp = new THREE.Group();
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.38, 0.42, 16), M.goldWall);
      base.position.y = 0.21;
      grp.add(base);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.02, 0.34, 16), M.creamTrim);
      rim.position.y = 0.58;
      grp.add(rim);
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.085, 8.8, 10),
        new THREE.MeshStandardMaterial({ color: 0xD8DCE4, metalness: 0.72, roughness: 0.28 })
      );
      pole.position.y = 4.6;
      grp.add(pole);
      const flagTex = isVietnam
        ? makeCanvasTex((ctx, w, h) => {
            ctx.fillStyle = '#D9261C';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            const cx = w * 0.5;
            const cy = h * 0.5;
            const outerR = h * 0.28;
            const innerR = outerR * 0.382;
            for (let i = 0; i < 10; i++) {
              const r = i % 2 === 0 ? outerR : innerR;
              const a = (i * Math.PI) / 5 - Math.PI / 2;
              if (i === 0) ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
              else ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
            }
            ctx.closePath();
            ctx.fill();
          }, 256, 170)
        : this.flagTex72;
      const cloth = new THREE.Mesh(
        new THREE.PlaneGeometry(2.35, 1.55),
        new THREE.MeshStandardMaterial({ map: flagTex, side: THREE.DoubleSide, roughness: 0.5 })
      );
      cloth.position.set(1.2, 7.95, 0);
      grp.add(cloth);
      grp.position.set(fx, 0, fz);
      this.exteriorGroup.add(grp);
      this.addObstacle(fx, fz, 1.25);
    };
    buildFlagPole(18.2, 25.5, true);
    buildFlagPole(27.8, 25.5, false);

    // 2. Low hedge frames the West plaza edge without obstructing the main sightline to Chánh Điện.
    const midHedge = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 18.0), M.foliageDark);
    midHedge.position.set(-10.5, 0.325, 16.5);
    this.exteriorGroup.add(midHedge);

    // 3. Straight Cool Tree-Shaded Lane (x = 40.5, z = +36 -> -24): Bougainvillea planters lining outer curbs (35.2 & 45.4)
    const bougCoords = [
      [35.2, 29.8, 0.92],
      [35.2, 18.2, 0.92],
      [35.2, 4.5, 0.92],
      [35.2, -6.5, 0.92],
      [45.4, 28.5, 0.92],
      [45.4, 15.0, 0.92],
      [45.4, 1.5, 0.92],
      [45.4, -9.5, 0.92]
    ];
    const makeOrganicClusterGeo = (rad, seed) => {
      const geo = new THREE.IcosahedronGeometry(rad, 2);
      const pos = geo.attributes.position;
      for (let vi = 0; vi < pos.count; vi++) {
        const vx = pos.getX(vi);
        const vy = pos.getY(vi);
        const vz = pos.getZ(vi);
        const j = 0.88 + 0.22 * Math.abs(Math.sin((vx * 4.7 + vy * 3.1 + vz * 5.3 + seed) * 1.9));
        pos.setXYZ(vi, vx * j, vy * (0.78 + 0.18 * j), vz * j);
      }
      geo.computeVertexNormals();
      return geo;
    };
    const bougBlossomMat1 = new THREE.MeshStandardMaterial({ color: 0xD92B7B, roughness: 0.74 });
    const bougBlossomMat2 = new THREE.MeshStandardMaterial({ color: 0xEF6BA4, roughness: 0.76 });
    for (let bi = 0; bi < bougCoords.length; bi++) {
      const [bx, bz, sc] = bougCoords[bi];
      const pot = new THREE.Group();
      const pMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.58, 0.38, 0.56, 14),
        M.terracottaPot
      );
      pMesh.position.y = 0.28;
      pMesh.castShadow = true;
      pot.add(pMesh);
      const soilRim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.52, 0.52, 0.06, 12),
        M.trunk
      );
      soilRim.position.y = 0.54;
      pot.add(soilRim);
      // Twisted woody bougainvillea canes
      for (const [ang, lean] of [[0, 0.16], [2.1, 0.22], [4.2, 0.18]]) {
        const cane = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.068, 1.35, 6), M.trunk);
        cane.position.set(Math.cos(ang) * 0.14, 1.12, Math.sin(ang) * 0.14);
        cane.rotation.z = Math.cos(ang) * lean;
        cane.rotation.x = Math.sin(ang) * lean;
        pot.add(cane);
      }
      for (const [ci, [ox, oy, oz, r]] of [
        [0, 1.88, 0, 0.52],
        [-0.44, 1.66, 0.22, 0.42],
        [0.44, 1.72, -0.18, 0.43],
        [-0.2, 2.22, -0.15, 0.38],
        [0.24, 2.12, 0.22, 0.37],
        [0.52, 1.36, 0.18, 0.32],
        [-0.48, 1.32, -0.2, 0.30]
      ].entries()) {
        const foliage = new THREE.Mesh(makeOrganicClusterGeo(r, bi * 7 + ci), ci % 2 === 0 ? M.foliageMid : M.foliageDark);
        foliage.position.set(ox, oy, oz);
        foliage.castShadow = true;
        pot.add(foliage);
        // Cascading bougainvillea flower sprays instead of solid spheres
        for (let fi = 0; fi < 4; fi++) {
          const fa = (fi / 4) * Math.PI * 2 + ci * 0.7;
          const petalCluster = new THREE.Mesh(
            makeOrganicClusterGeo(r * 0.28, bi * 13 + fi + ci),
            fi % 2 === 0 ? bougBlossomMat1 : bougBlossomMat2
          );
          petalCluster.position.set(
            ox + Math.cos(fa) * r * 0.55,
            oy + 0.12 - (fi % 2) * 0.1,
            oz + Math.sin(fa) * r * 0.55
          );
          pot.add(petalCluster);
        }
      }
      pot.position.set(bx, 0, bz);
      pot.scale.setScalar(sc || 1);
      this.exteriorGroup.add(pot);
      this.addObstacle(bx, bz, 0.6);
    }

    const redFenceMat = new THREE.MeshStandardMaterial({ color: 0xB82924, roughness: 0.48 });
    const lampPostMat = new THREE.MeshStandardMaterial({ color: 0xE8B95E, roughness: 0.48 });
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0xFFFBF0,
      emissive: 0xFFF2C8,
      emissiveIntensity: 0.65,
      roughness: 0.22
    });

    // Low stone curbs, globe lamps & lush overarching shade trees lining the Straight Side Lane (x = 35.6 .. 45.4, z = +34 -> -24)
    for (const [sideX, minZ, maxZ] of [
      [35.6, -9.8, 34.0],
      [45.4, -10.5, 34.0]
    ]) {
      const len = maxZ - minZ;
      const midZ = (minZ + maxZ) * 0.5;
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, len), M.goldLight);
      curb.position.set(sideX, 0.12, midZ);
      curb.receiveShadow = true;
      this.exteriorGroup.add(curb);
    }

    // Overarching Tropical Shade Trees ("Hàng cây bóng mát rượi dọc lối xuống tiệm lưu niệm cuối đường")
    for (const [tx, tz, sc] of [
      [35.0, 24.0, 1.25],
      [35.0, 10.5, 1.3],
      [35.0, -2.5, 1.32],
      [46.2, 31.0, 1.28],
      [46.2, 18.5, 1.35],
      [46.2, 5.5, 1.35],
      [46.2, -6.5, 1.38],
      [44.2, -23.5, 1.42],
      [36.2, -22.5, 1.36]
    ]) {
      const shTree = new THREE.Group();
      const trk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.36, 4.1, 10), M.trunk);
      trk.position.y = 2.05;
      trk.castShadow = true;
      shTree.add(trk);
      for (const [cx, cy, cz, cr, cMat] of [
        [0, 4.65, 0, 2.35, M.foliageMid],
        [-1.15, 4.25, 0.5, 1.75, M.foliageDark],
        [1.15, 4.35, -0.45, 1.8, M.foliageLight],
        [0, 5.45, 0, 1.65, M.foliageLight]
      ]) {
        const crown = new THREE.Mesh(new THREE.SphereGeometry(cr, 10, 8), cMat);
        crown.scale.set(1.25, 0.68, 1.22);
        crown.position.set(cx, cy, cz);
        crown.castShadow = true;
        shTree.add(crown);
      }
      shTree.position.set(tx, 0, tz);
      shTree.scale.setScalar(sc);
      this.exteriorGroup.add(shTree);
      this.addObstacle(tx, tz, 0.52);
    }

    // Yellow square-post white-globe lamps along Straight Shaded Lane
    for (const [lx, lz] of [
      [35.6, 26.0],
      [35.6, 12.0],
      [35.6, -1.0],
      [45.4, 22.0],
      [45.4, 8.0],
      [45.4, -5.0]
    ]) {
      const ped = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.35, 0.42), M.goldWall);
      ped.position.set(lx, 0.675, lz);
      this.exteriorGroup.add(ped);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 1.35, 8), lampPostMat);
      pole.position.set(lx, 1.98, lz);
      this.exteriorGroup.add(pole);
      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), globeMat);
      globe.position.set(lx, 2.75, lz);
      this.exteriorGroup.add(globe);
    }

    // Directional signposts guiding pilgrims straight down the cool lane to the Souvenir Plaza & Left-Turn Chánh Điện Door
    for (const [sx, sz, rotY, labelTxt] of [
      [44.6, 30.5, -0.22, '↑ ĐI THẲNG CUỐI ĐƯỜNG: TIỆM LƯU NIỆM & LỐI VÀO CHÁNH ĐIỆN'],
      [43.8, -8.5, -0.35, '← RẼ TRÁI BỎ GIÀY DÉP VÀO CỬA CHÁNH ĐIỆN · TIỆM TẠP HÓA ↓']
    ]) {
      const dirSignGroup = new THREE.Group();
      dirSignGroup.position.set(sx, 0, sz);
      const dirPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.65, 8), M.darkWood);
      dirPost.position.y = 0.825;
      dirSignGroup.add(dirPost);
      const dirBoard = new THREE.Mesh(
        new THREE.BoxGeometry(3.15, 0.54, 0.1),
        new THREE.MeshStandardMaterial({
          map: makeTextTex(labelTxt, {
            w: 1120,
            h: 170,
            bg: '#1C5A34',
            border: '#FFD875',
            color: '#FFF6E5',
            size: 36
          }),
          roughness: 0.4
        })
      );
      dirBoard.position.set(0, 1.56, 0);
      dirBoard.rotation.y = rotY;
      dirSignGroup.add(dirBoard);
      this.exteriorGroup.add(dirSignGroup);
    }

    // Outer-right garden remains open beside the side-gate grocery house; no duplicate statue row.

    // Low ornamental bonsai urns neatly framing the outer Chánh Điện porch corners without blocking the 13-arch facade
    for (const bx of [13.2, 32.8]) {
      const bPot = this.makeBonsai72(0.72);
      bPot.position.set(bx, 0, 11.4);
      this.exteriorGroup.add(bPot);
      this.addObstacle(bx, 11.4, 0.65);
    }

    for (const [sx, sz, rotY] of [
      [35.0, 18.0, Math.PI / 2],
      [35.0, 13.0, Math.PI / 2],
      [14.2, 15.5, Math.PI / 2]
    ]) {
      const bench = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.12, 0.55), M.stoneLight);
      seat.position.y = 0.48;
      seat.castShadow = true;
      bench.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.45, 0.1), M.stoneLight);
      back.position.set(0, 0.72, -0.22);
      bench.add(back);
      for (const lx of [-0.72, 0.72]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.48, 0.48), M.stoneDark);
        leg.position.set(lx, 0.24, 0);
        bench.add(leg);
      }
      bench.position.set(sx, 0, sz);
      bench.rotation.y = rotY;
      this.exteriorGroup.add(bench);
    }

    // Lush Street & Courtyard Shade Trees (shifted clear of Nhà Tạp Hóa Vĩnh Tràng roof, with forked branches & multi-tone foliage)
    const treePositions = [
      [-6, 36, 1.3],
      [-28, 38, 1.4],
      [-34, 14, 1.35],
      [-33, -16, 1.4],
      [-18, -26, 1.3],
      [51.5, 43.5, 1.35],
      [52.8, 30.5, 1.4],
      [49.5, 22, 1.45],
      [48.5, 10, 1.4],
      [48, -32, 1.45],
      [32.5, 35.5, 1.25]
    ];
    for (const [tx, tz, sc] of treePositions) {
      const tree = new THREE.Group();
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.42, 3.8, 10), M.trunk);
      tr.position.y = 1.9;
      tr.castShadow = true;
      tree.add(tr);
      // Angled forked limbs
      for (const [bx, bz, rotZ, rotX] of [
        [-0.55, 0.25, 0.52, -0.22],
        [0.52, -0.28, -0.48, 0.22]
      ]) {
        const limb = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.18, 1.75, 7), M.trunk);
        limb.position.set(bx, 3.25, bz);
        limb.rotation.z = rotZ;
        limb.rotation.x = rotX;
        tree.add(limb);
      }
      const foliagePalette = [M.foliageLight, M.foliageMid, M.foliageDark];
      [
        [0, 4.45, 0, 2.0, 0],
        [-1.25, 3.85, 0.65, 1.45, 1],
        [1.22, 3.92, -0.55, 1.45, 2],
        [0.35, 5.25, 0.25, 1.42, 0]
      ].forEach(([cx, cy, cz, r, mIdx]) => {
        const cr = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), foliagePalette[mIdx]);
        cr.position.set(cx, cy, cz);
        cr.castShadow = true;
        tree.add(cr);
      });
      tree.position.set(tx, 0, tz);
      tree.scale.setScalar(sc);
      this.exteriorGroup.add(tree);
      this.addObstacle(tx, tz, 0.8);
    }

    const flagMat = new THREE.MeshBasicMaterial({ map: this.flagTex72, side: THREE.DoubleSide });
    // Vertical festive "cờ phướn" pilgrimage banners neatly on poles at Cổng Phụ entrance lane (no floating mid-air flag strings)
    for (const [fx, fz] of [
      [36.2, 43.2],
      [44.8, 43.2],
      [36.2, 32.5],
      [44.8, 32.5]
    ]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 4.6, 6), M.goldAccent);
      pole.position.set(fx, 2.3, fz);
      this.exteriorGroup.add(pole);
      const banner = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 2.1), flagMat);
      banner.position.set(fx, 3.45, fz + 0.25);
      banner.rotation.y = Math.PI / 2;
      this.exteriorGroup.add(banner);
    }
  }

  buildProceduralShopPavilion() {
    const M = this.MAT;
    const g = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(5.8, 0.26, 4.4),
      M.darkWood
    );
    base.position.y = 0.13;
    g.add(base);
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(4.9, 1.02, 1.35),
      new THREE.MeshStandardMaterial({ color: 0x8C5532, map: this.woodGrainTex, roughness: 0.58 })
    );
    counter.position.set(0, 0.72, 1.0);
    counter.castShadow = true;
    g.add(counter);
    for (const [px, pz] of [
      [-2.35, -1.65],
      [2.35, -1.65],
      [-2.35, 1.65],
      [2.35, 1.65]
    ]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 3.1, 12), M.redColumn);
      col.position.set(px, 1.65, pz);
      col.castShadow = true;
      g.add(col);
    }
    const roof = makeHippedRoofMesh(5.8, 4.4, 1.5, M.roofTile);
    roof.position.y = 3.72;
    roof.castShadow = true;
    g.add(roof);
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.78, 0.15),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('CỬA HÀNG LƯU NIỆM', { w: 1024, h: 220, size: 74 })
      })
    );
    sign.position.set(0, 2.9, 1.75);
    g.add(sign);
    this.proceduralShopGroup = g;
    this.shopKioskAnchor.add(g);
  }

  buildCourtyardPigeons() {
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xDCE0E6, roughness: 0.55 });
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x9BA4B0, roughness: 0.6 });
    const spots = [
      [20.2, 23.5],
      [21.0, 24.1],
      [25.5, 19.2],
      [26.1, 18.7],
      [19.4, 14.2],
      [22.4, 25.0],
      [24.0, 24.6],
      [18.2, 19.5]
    ];
    for (const [px, pz] of spots) {
      const bird = new THREE.Group();
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), bodyMat);
      b.scale.set(1, 0.8, 1.45);
      b.position.y = 0.14;
      bird.add(b);
      const h = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), bodyMat);
      h.position.set(0, 0.24, 0.14);
      bird.add(h);
      const wL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.16), wingMat);
      wL.position.set(-0.12, 0.16, 0);
      bird.add(wL);
      const wR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.16), wingMat);
      wR.position.set(0.12, 0.16, 0);
      bird.add(wR);
      bird.position.set(px, 0, pz);
      this.exteriorGroup.add(bird);
      this.pigeons.push({
        group: bird,
        wL,
        wR,
        baseX: px,
        baseZ: pz,
        phase: Math.random() * 6.28,
        flying: false,
        flyTimer: 0
      });
    }
  }

  buildInteractiveCourtyardLeaves() {
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0.22);
    leafShape.quadraticCurveTo(0.16, 0.05, 0.12, -0.14);
    leafShape.quadraticCurveTo(0.03, -0.22, 0, -0.28);
    leafShape.quadraticCurveTo(-0.03, -0.22, -0.12, -0.14);
    leafShape.quadraticCurveTo(-0.16, 0.05, 0, 0.22);
    const leafGeo = new THREE.ShapeGeometry(leafShape);
    const leafMatGold = new THREE.MeshStandardMaterial({
      color: 0xE6AD3A,
      emissive: 0x6A4408,
      emissiveIntensity: 0.22,
      roughness: 0.58,
      side: THREE.DoubleSide
    });
    const leafMatAmber = new THREE.MeshStandardMaterial({
      color: 0xC98328,
      roughness: 0.65,
      side: THREE.DoubleSide
    });
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xFFE38C,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let i = 0; i < COURTYARD_LEAF_SPOTS.length; i++) {
      const spot = COURTYARD_LEAF_SPOTS[i];
      const lx = spot.pos?.x ?? spot.x ?? 0;
      const lz = spot.pos?.z ?? spot.z ?? 0;
      const cluster = new THREE.Group();
      cluster.position.set(lx, 0.025, lz);
      cluster.userData.leafId = spot.id;
      cluster.userData.phase = i * 0.9;

      const glowRing = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.56, 20), ringMat);
      glowRing.rotation.x = -Math.PI / 2;
      glowRing.position.y = 0.006;
      cluster.add(glowRing);

      for (let j = 0; j < 5; j++) {
        const ang = (j / 5) * Math.PI * 2 + i * 0.4;
        const dist = j === 0 ? 0.04 : 0.22;
        const leaf = new THREE.Mesh(leafGeo, j % 2 === 0 ? leafMatGold : leafMatAmber);
        leaf.rotation.x = -Math.PI / 2 + (j % 2 === 0 ? 0.08 : -0.06);
        leaf.rotation.z = ang;
        leaf.position.set(Math.cos(ang) * dist, 0.02 + j * 0.008, Math.sin(ang) * dist);
        leaf.scale.setScalar(0.9 + (j % 3) * 0.14);
        leaf.userData.leafId = spot.id;
        cluster.add(leaf);
      }

      const hitDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.75, 0.45, 12),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      hitDisc.position.y = 0.22;
      hitDisc.userData.leafId = spot.id;
      cluster.add(hitDisc);

      this.exteriorGroup.add(cluster);
      this.courtyardLeafMeshes.set(spot.id, cluster);
      this.courtyardLeafClickTargets.push(hitDisc);
    }
  }

  syncCourtyardLeaves(collectedIds = []) {
    const doneSet = new Set(Array.isArray(collectedIds) ? collectedIds : []);
    for (const [leafId, grp] of this.courtyardLeafMeshes.entries()) {
      grp.visible = !doneSet.has(leafId);
    }
    this.renderFrame();
  }

  buildInteractiveGardenPlots() {
    const M = this.MAT;
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x4A3423, roughness: 0.92 });
    const readySoilMat = new THREE.MeshStandardMaterial({
      color: 0x3A5B2C,
      emissive: 0x2F6B1E,
      emissiveIntensity: 0.2,
      roughness: 0.8
    });

    for (let i = 0; i < TEMPLE_GARDEN_SLOTS.length; i++) {
      const slot = TEMPLE_GARDEN_SLOTS[i];
      const sx = slot.pos?.x ?? slot.x ?? 0;
      const sz = slot.pos?.z ?? slot.z ?? 0;
      const grp = new THREE.Group();
      grp.position.set(sx, 0, sz);
      grp.userData.slotIndex = i;

      const rim = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.34, 2.35), M.stoneLight);
      rim.position.y = 0.17;
      rim.receiveShadow = true;
      rim.castShadow = true;
      grp.add(rim);

      const soil = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.38, 1.96), soilMat);
      soil.position.y = 0.19;
      soil.userData.slotIndex = i;
      grp.add(soil);

      const plantAnchor = new THREE.Group();
      plantAnchor.position.set(0, 0.36, 0);
      grp.add(plantAnchor);

      const plaque = new THREE.Mesh(
        new THREE.BoxGeometry(1.45, 0.32, 0.08),
        new THREE.MeshStandardMaterial({
          map: makeTextTex(slot.label || `Ô Đất ${i + 1}`, {
            w: 440,
            h: 110,
            bg: '#234C2F',
            border: '#E9C46A',
            color: '#FFF6DE',
            size: 32
          })
        })
      );
      plaque.position.set(0, 0.42, 1.18);
      grp.add(plaque);

      const hitBox = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 2.2, 2.5),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      hitBox.position.y = 1.1;
      hitBox.userData.slotIndex = i;
      grp.add(hitBox);

      this.exteriorGroup.add(grp);
      this.addObstacle(sx, sz, 1.35);
      this.gardenPlotGroups.set(i, {
        group: grp,
        soil,
        soilMat,
        readySoilMat,
        plantAnchor,
        slot
      });
      this.gardenPlotClickTargets.push(hitBox);
    }
  }

  syncTempleGardenVisuals(gardenSlots = []) {
    const M = this.MAT;
    for (let i = 0; i < TEMPLE_GARDEN_SLOTS.length; i++) {
      const rec = this.gardenPlotGroups.get(i);
      if (!rec) continue;
      const st = gardenSlots[i] || null;
      while (rec.plantAnchor.children.length > 0) {
        rec.plantAnchor.remove(rec.plantAnchor.children[0]);
      }
      const stage = Math.max(0, Number(st?.stage) || 0);
      const isReady = stage >= 3;
      rec.soil.material = isReady ? rec.readySoilMat : rec.soilMat;
      if (!st || !st.speciesId) {
        // Subtle wooden marker stake showing empty plot ready to sow
        const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.45, 6), M.trunk);
        stake.position.y = 0.22;
        rec.plantAnchor.add(stake);
        continue;
      }

      const treeKey =
        st.speciesId === 'cay_sala'
          ? 'cay_sala'
          : st.speciesId === 'cay_bo_de'
          ? 'cay_bo_de'
          : st.speciesId === 'chum_sen'
          ? 'chum_sen'
          : null;
      if (treeKey && this.propMeshCache[treeKey] && stage >= 1) {
        const targetH =
          treeKey === 'chum_sen'
            ? isReady
              ? 1.18
              : stage === 2
              ? 0.92
              : 0.68
            : isReady
            ? 2.65
            : stage === 2
            ? 1.85
            : 1.12;
        const treeObj = this.fitProp(this.propMeshCache[treeKey], targetH);
        rec.plantAnchor.add(treeObj);
      } else {
        const stemH = isReady ? 1.45 : 0.35 + stage * 0.38;
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.08, stemH, 8), M.trunk);
        stem.position.y = stemH * 0.5;
        rec.plantAnchor.add(stem);
        const leafMat = st.speciesId === 'cay_sala' ? M.foliageLight : st.speciesId === 'chum_sen' ? M.foliageMid : M.foliageDark;
        const crown = new THREE.Mesh(
          new THREE.IcosahedronGeometry(isReady ? 0.62 : 0.24 + stage * 0.14, 2),
          leafMat
        );
        crown.position.y = stemH + 0.14;
        rec.plantAnchor.add(crown);
        if (isReady || st.speciesId === 'chum_sen') {
          const flColor = st.speciesId === 'cay_sala' ? 0xFFB74D : st.speciesId === 'chum_sen' ? 0xF478A8 : 0xFFE066;
          const blossom = new THREE.Mesh(
            new THREE.SphereGeometry(0.16, 10, 8),
            new THREE.MeshStandardMaterial({ color: flColor, emissive: flColor, emissiveIntensity: 0.32, roughness: 0.4 })
          );
          blossom.position.y = stemH + 0.48;
          rec.plantAnchor.add(blossom);
        }
      }
      if (isReady) {
        const halo = new THREE.Mesh(
          new THREE.RingGeometry(0.75, 0.92, 24),
          new THREE.MeshBasicMaterial({ color: 0xFFE17D, transparent: true, opacity: 0.72, side: THREE.DoubleSide })
        );
        halo.rotation.x = -Math.PI / 2;
        halo.position.y = 0.04;
        rec.plantAnchor.add(halo);
      }
    }
    this.renderFrame();
  }

  setTempleStateSync(state = {}) {
    if (Array.isArray(state.collectedLeafIds)) {
      this.syncCourtyardLeaves(state.collectedLeafIds);
    }
    if (Array.isArray(state.gardenSlots)) {
      this.syncTempleGardenVisuals(state.gardenSlots);
    }
  }

  makeCoupletTex(textStr) {
    const c = document.createElement('canvas');
    c.width = 160;
    c.height = 1024;
    const g = c.getContext('2d');
    g.fillStyle = '#1E110B';
    g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = '#D49E3B';
    g.lineWidth = 8;
    g.strokeRect(8, 8, c.width - 16, c.height - 16);
    g.fillStyle = '#F7CA5C';
    g.font = 'bold 64px "Noto Serif SC", "Noto Serif", Georgia, serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const chars = Array.from(textStr);
    const step = (c.height - 120) / Math.max(1, chars.length);
    for (let i = 0; i < chars.length; i++) {
      g.fillText(chars[i], c.width / 2, 72 + step * (i + 0.45));
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }

  buildInteriorChanhDienV8() {
    buildSquareChanhDienInterior(this, THREE);
  }

  buildStationBeacons() {
    this.stationMarkers = [];
    for (const st of [...PILGRIMAGE_STATIONS, ...DISCOVERY_ZONES]) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.65, 0.92, 32),
        new THREE.MeshBasicMaterial({
          color: st.id >= 100 ? 0x8BE0B0 : 0xFFD166,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.82
        })
      );
      ring.rotation.x = -Math.PI / 2;
      const sx = st.standPos ? st.standPos.x : st.pos.x;
      const sz = st.standPos ? st.standPos.z : st.pos.z;
      ring.position.set(sx, 0.05, sz);
      this.exteriorGroup.add(ring);
      this.stationMarkers.push({ station: st, ring });
    }

    this.walkTargetRing = new THREE.Mesh(
      new THREE.RingGeometry(0.35, 0.58, 24),
      new THREE.MeshBasicMaterial({
        color: 0xFFE066,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.92
      })
    );
    this.walkTargetRing.rotation.x = -Math.PI / 2;
    this.walkTargetRing.visible = false;
    this.scene.add(this.walkTargetRing);
  }

  loadGLB(url) {
    if (!url) return Promise.resolve(null);
    const encoded = encodeURI(url);
    if (this.glbPromiseCache.has(encoded)) {
      return this.glbPromiseCache.get(encoded);
    }
    const p = new Promise((resolve) => {
      this.gltfLoader.load(
        encoded,
        (gltf) => resolve(gltf),
        undefined,
        () => resolve(null)
      );
    });
    this.glbPromiseCache.set(encoded, p);
    return p;
  }

  cleanStatueScene(gltfScene, matOverride = null, preserveGround = false) {
    const root = gltfScene.clone(true);
    const toRemove = [];
    root.traverse((o) => {
      if (!preserveGround && /ground|plane|floor|shadow/i.test(o.name || '')) {
        toRemove.push(o);
        return;
      }
      if (o.isMesh && o.geometry) {
        if (!o.geometry.getAttribute('normal')) {
          o.geometry.computeVertexNormals();
        }
        o.geometry.computeBoundingBox();
        const bb = o.geometry.boundingBox;
        if (bb && (bb.max.x - bb.min.x > 120 || bb.max.z - bb.min.z > 120)) {
          toRemove.push(o);
          return;
        }
        o.castShadow = true;
        o.receiveShadow = true;
        if (matOverride) {
          o.material = matOverride;
        } else if (o.material) {
          o.material = o.material.clone();
          if (o.geometry.getAttribute('color')) {
            o.material.vertexColors = true;
          }
          // Keep the cast-concrete finish matte and lightly weathered; preserve lotus and inscription colors.
          const matName = (o.material.name || '').toLowerCase();
          if (/white|statue|body|robe|skin/i.test(matName) || !matName) {
            o.material.bumpMap = this.stoneBumpTex;
            o.material.bumpScale = 0.018;
            o.material.roughness = Math.max(0.72, o.material.roughness ?? 0.78);
            o.material.metalness = 0.0;
          } else {
            o.material.roughness = Math.min(0.78, Math.max(0.34, o.material.roughness ?? 0.58));
          }
        }
      }
    });
    for (const r of toRemove) {
      if (r.parent) r.parent.remove(r);
    }
    return root;
  }

  async loadCharacterGLB(charKey) {
    const path = CHAR_GLB_PATHS[charKey];
    if (!path) return null;
    if (this.charDataCache[charKey]?.scene) return this.charDataCache[charKey];
    const gltf = await this.loadGLB(path);
    if (gltf?.scene) this.charDataCache[charKey] = gltf;
    return gltf;
  }

  async loadAllGLBAssets() {
    const initialKey = this.playerState.charKey || 'nu';
    const coreCharKeys = Array.from(new Set(['nu', 'nam', 'tre_em', initialKey]));

    // Phase 1: Critical Courtyard Statues, Architecture, Core Characters & Exterior Props
    const [
      adidaGltf,
      dilacGltf,
      phatNamGltf,
      banThoGltf,
      quanAmGltf,
      matTienGltf,
      tamQuanGltf,
      baoThapGltf,
      denLongGltf,
      chumSenGltf,
      mamNguQuaGltf,
      moGoGltf,
      banThoPropGltf,
      boDoanGltf,
      boDoanTronGltf,
      chieuCoiGltf,
      duaXiemGltf,
      banhBoGltf,
      banhDaLonGltf,
      quatNanGltf,
      gioMayGltf,
      denHoaDangGltf,
      nenSenGltf,
      nonLaGltf,
      tuiSenGltf,
      chimBoCauGltf,
      khanRanGltf,
      trangHatGltf,
      vongMayGltf,
      cayBoDeGltf,
      caySalaGltf,
      ...coreChars
    ] = await Promise.all([
      this.loadGLB(STATUE_GLB_PATHS.adida),
      this.loadGLB(STATUE_GLB_PATHS.dilac),
      this.loadGLB(STATUE_GLB_PATHS.phatnam),
      STATUE_GLB_PATHS.bantho ? this.loadGLB(STATUE_GLB_PATHS.bantho) : Promise.resolve(null),
      this.loadGLB(STATUE_GLB_PATHS.quanAm),
      this.loadGLB(ARCH_GLB_PATHS.mat_tien),
      this.loadGLB(ARCH_GLB_PATHS.tam_quan),
      this.loadGLB(ARCH_GLB_PATHS.bao_thap),
      this.loadGLB(PROP_GLB_PATHS.den_long),
      this.loadGLB(PROP_GLB_PATHS.chum_sen),
      this.loadGLB(PROP_GLB_PATHS.mam_ngu_qua),
      this.loadGLB(PROP_GLB_PATHS.mo_go),
      this.loadGLB(PROP_GLB_PATHS.ban_tho),
      this.loadGLB(PROP_GLB_PATHS.bo_doan),
      this.loadGLB(PROP_GLB_PATHS.bo_doan_tron),
      this.loadGLB(PROP_GLB_PATHS.chieu_coi_thien),
      this.loadGLB(PROP_GLB_PATHS.trai_dua_xiem),
      this.loadGLB(PROP_GLB_PATHS.dia_banh_bo),
      this.loadGLB(PROP_GLB_PATHS.dia_banh_da_lon),
      this.loadGLB(PROP_GLB_PATHS.quat_nan_la_dua),
      this.loadGLB(PROP_GLB_PATHS.gio_may_tre),
      this.loadGLB(PROP_GLB_PATHS.den_hoa_dang),
      this.loadGLB(PROP_GLB_PATHS.nen_hoa_sen),
      this.loadGLB(PROP_GLB_PATHS.non_la),
      this.loadGLB(PROP_GLB_PATHS.tui_sen),
      this.loadGLB(PROP_GLB_PATHS.chim_bo_cau),
      this.loadGLB(PROP_GLB_PATHS.khan_ran),
      this.loadGLB(PROP_GLB_PATHS.trang_hat),
      this.loadGLB(PROP_GLB_PATHS.vong_may),
      this.loadGLB(PROP_GLB_PATHS.cay_bo_de),
      this.loadGLB(PROP_GLB_PATHS.cay_sala),
      ...coreCharKeys.map((ck) => this.loadCharacterGLB(ck))
    ]);

    coreCharKeys.forEach((ck, idx) => {
      if (coreChars[idx]?.scene) this.charDataCache[ck] = coreChars[idx];
    });
    if (tamQuanGltf?.scene) this.archMeshCache.tam_quan = tamQuanGltf.scene;
    if (baoThapGltf?.scene) this.archMeshCache.bao_thap = baoThapGltf.scene;
    if (banThoGltf?.scene) this.archMeshCache._bantho_fallback = banThoGltf.scene;

    // 0A. Mount custom sculpted Tam Quan Vĩnh Tràng GLB onto main entrance gate while retaining plaque + iron gates
    if (this.archMeshCache.tam_quan && this.tamQuanMainGroup) {
      const tq = this.archMeshCache.tam_quan.clone(true);
      tq.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
          if (o.geometry && !o.geometry.getAttribute('normal')) o.geometry.computeVertexNormals();
        }
      });
      const box = new THREE.Box3().setFromObject(tq);
      const sz = new THREE.Vector3();
      box.getSize(sz);
      tq.scale.setScalar(13.6 / Math.max(0.2, sz.x));
      const b2 = new THREE.Box3().setFromObject(tq);
      tq.position.set(-(b2.min.x + b2.max.x) / 2, -b2.min.y, -(b2.min.z + b2.max.z) / 2);
      for (const p of this.tamQuanProceduralParts) p.visible = false;
      this.tamQuanMainGroup.add(tq);
    }

    // 0B. Replace procedural Chánh Điện facade with sculpted mat-tien-vinh-trang.glb (strip 'Sân' ground plane)
    if (matTienGltf?.scene && this.chanhDienFacadeGroup) {
      const facade = matTienGltf.scene.clone(true);
      const removeNodes = [];
      facade.traverse((o) => {
        if (/^sân\b|^san\b|ground|terrain/i.test(o.name || '')) {
          removeNodes.push(o);
          return;
        }
        if (o.isMesh && o.geometry) {
          if (!o.geometry.getAttribute('normal')) o.geometry.computeVertexNormals();
          o.geometry.computeBoundingBox();
          const bb = o.geometry.boundingBox;
          if (bb && (bb.max.x - bb.min.x > 48 || bb.max.z - bb.min.z > 48) && bb.max.y - bb.min.y < 0.8) {
            removeNodes.push(o);
            return;
          }
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
      for (const rn of removeNodes) {
        if (rn.parent) rn.parent.remove(rn);
      }
      const box = new THREE.Box3().setFromObject(facade);
      const sz = new THREE.Vector3();
      box.getSize(sz);
      facade.scale.set(
        28.4 / Math.max(0.5, sz.x),
        11.2 / Math.max(0.5, sz.y),
        13.2 / Math.max(0.5, sz.z)
      );
      const box2 = new THREE.Box3().setFromObject(facade);
      facade.position.set(
        -(box2.min.x + box2.max.x) / 2,
        0.02 - box2.min.y,
        3.25 - box2.max.z
      );
      this.chanhDienFacadeGroup.add(facade);
      if (this.chanhDienProceduralShell) this.chanhDienProceduralShell.visible = false;
    }

    // 1. Đại tượng Phật A Di Đà in the front garden plaza (18m statue + 7m lotus/pedestal = 25m total).
    if (adidaGltf?.scene) {
      const s = this.cleanStatueScene(adidaGltf.scene, null);
      const box = new THREE.Box3().setFromObject(s);
      const h = Math.max(0.1, box.max.y - box.min.y);
      const scale = 25.0 / h;
      s.scale.setScalar(scale);
      const box2 = new THREE.Box3().setFromObject(s);
      s.position.set(
        -(box2.min.x + box2.max.x) / 2,
        0.42 - box2.min.y,
        -(box2.min.z + box2.max.z) / 2
      );
      s.rotation.y = 0;
      this.adidaGroup.add(s);
    }

    // 2. Đại tượng Phật Di Lặc — uniform proportional scale (~15.2m statue atop 4.8m terrace = 20m total)
    if (dilacGltf?.scene) {
      const s = this.cleanStatueScene(dilacGltf.scene, null);
      const box = new THREE.Box3().setFromObject(s);
      const h = Math.max(0.1, box.max.y - box.min.y);
      s.scale.setScalar(15.2 / h);
      const box2 = new THREE.Box3().setFromObject(s);
      s.position.set(
        -(box2.min.x + box2.max.x) / 2,
        4.94 - box2.min.y,
        -(box2.min.z + box2.max.z) / 2 - 2.4
      );
      s.rotation.y = 0;
      this.dilacGroup.add(s);
    }

    // 3. Đại tượng Phật nhập Niết Bàn — fit 32m body cleanly atop the 3.6m multi-tier stone plinth
    if (phatNamGltf?.scene) {
      const s = this.cleanStatueScene(phatNamGltf.scene, null);
      const box = new THREE.Box3().setFromObject(s);
      const w = Math.max(0.1, box.max.x - box.min.x, box.max.z - box.min.z);
      const scale = 32.0 / w;
      s.scale.setScalar(scale);
      const box2 = new THREE.Box3().setFromObject(s);
      s.position.set(
        -(box2.min.x + box2.max.x) / 2,
        3.62 - box2.min.y,
        -(box2.min.z + box2.max.z) / 2
      );
      s.rotation.y = Math.PI;
      this.nietBanGroup.add(s);
    }

    // 4. Porch Buddha Altar + Bảo Tháp
    if (banThoGltf?.scene && this.chanhDienPorchAltar) {
      const porchBuddha = this.cleanStatueScene(banThoGltf.scene, null);
      const box = new THREE.Box3().setFromObject(porchBuddha);
      const h = Math.max(0.1, box.max.y - box.min.y);
      porchBuddha.scale.setScalar(2.15 / h);
      const pb = new THREE.Box3().setFromObject(porchBuddha);
      porchBuddha.position.set(
        -(pb.min.x + pb.max.x) / 2,
        1.03 - pb.min.y,
        -(pb.min.z + pb.max.z) / 2
      );
      porchBuddha.rotation.y = 0;
      this.chanhDienPorchAltar.add(porchBuddha);
    }

    // 5. Tượng Quán Thế Âm Nam Hải replacing placeholder cylinder/sphere
    if (quanAmGltf?.scene && this.quanAmGroup) {
      for (const p of this.quanAmPlaceholderParts) {
        if (p.parent) p.parent.remove(p);
      }
      const qa = this.cleanStatueScene(quanAmGltf.scene, null);
      const box = new THREE.Box3().setFromObject(qa);
      const h = Math.max(0.1, box.max.y - box.min.y);
      qa.scale.setScalar(3.35 / h);
      const box2 = new THREE.Box3().setFromObject(qa);
      qa.position.set(
        -(box2.min.x + box2.max.x) / 2,
        2.68 - box2.min.y,
        -(box2.min.z + box2.max.z) / 2
      );
      this.quanAmGroup.add(qa);
    }

    if (this.archMeshCache.bao_thap && this.stupaGroup) {
      while (this.stupaGroup.children.length > 0) this.stupaGroup.remove(this.stupaGroup.children[0]);
      const stupa = this.fitProp(this.archMeshCache.bao_thap, 35.0);
      const sb = new THREE.Box3().setFromObject(stupa);
      stupa.position.set(-(sb.min.x + sb.max.x) / 2, -sb.min.y, -(sb.min.z + sb.max.z) / 2);
      this.stupaGroup.add(stupa);
    }

    if (denLongGltf?.scene) this.propMeshCache.den_long = denLongGltf.scene;
    if (chumSenGltf?.scene) this.propMeshCache.chum_sen = chumSenGltf.scene;
    if (mamNguQuaGltf?.scene) this.propMeshCache.mam_ngu_qua = mamNguQuaGltf.scene;
    if (moGoGltf?.scene) {
      this.propMeshCache.mo_go = moGoGltf.scene;
      this.propMeshCache.mo_go_tung_kinh = moGoGltf.scene;
    }
    if (banThoPropGltf?.scene) {
      this.propMeshCache.ban_tho = banThoPropGltf.scene;
      this.propMeshCache.bat_nhang_tram = banThoPropGltf.scene;
    }
    if (boDoanGltf?.scene) this.propMeshCache.bo_doan = boDoanGltf.scene;
    if (boDoanTronGltf?.scene) this.propMeshCache.bo_doan_tron = boDoanTronGltf.scene;
    if (chieuCoiGltf?.scene) this.propMeshCache.chieu_coi_thien = chieuCoiGltf.scene;
    if (duaXiemGltf?.scene) this.propMeshCache.trai_dua_xiem = duaXiemGltf.scene;
    if (banhBoGltf?.scene) this.propMeshCache.dia_banh_bo = banhBoGltf.scene;
    if (banhDaLonGltf?.scene) this.propMeshCache.dia_banh_da_lon = banhDaLonGltf.scene;
    if (quatNanGltf?.scene) this.propMeshCache.quat_nan_la_dua = quatNanGltf.scene;
    if (gioMayGltf?.scene) this.propMeshCache.gio_may_tre = gioMayGltf.scene;
    if (denHoaDangGltf?.scene) this.propMeshCache.den_hoa_dang = denHoaDangGltf.scene;
    if (nenSenGltf?.scene) {
      this.propMeshCache.nen_hoa_sen = nenSenGltf.scene;
      this.propMeshCache.hoa_sen = nenSenGltf.scene;
    }
    if (nonLaGltf?.scene) this.propMeshCache.non_la = nonLaGltf.scene;
    if (tuiSenGltf?.scene) this.propMeshCache.tui_sen = tuiSenGltf.scene;
    if (chimBoCauGltf?.scene) this.propMeshCache.chim_bo_cau = chimBoCauGltf.scene;
    if (khanRanGltf?.scene) this.propMeshCache.khan_ran = khanRanGltf.scene;
    if (trangHatGltf?.scene) this.propMeshCache.trang_hat = trangHatGltf.scene;
    if (vongMayGltf?.scene) this.propMeshCache.vong_may = vongMayGltf.scene;
    if (cayBoDeGltf?.scene) this.propMeshCache.cay_bo_de = cayBoDeGltf.scene;
    if (caySalaGltf?.scene) this.propMeshCache.cay_sala = caySalaGltf.scene;

    this.placeLoaded3DPropsInWorld();
    this.setCharacter(this.playerState.charKey || initialKey);
    this.spawnMonksAndPilgrimsV8();
    this.initSmokeColumns();
    this.renderFrame();
    this.loaded = true;
    this.onLoaded();

    // Phase 2: Stagger bell/drum/vehicle exterior props; alternate characters & interior GLBs load on demand
    window.setTimeout(() => {
      this._loadPhase2ExteriorExtras().catch(() => {});
    }, this.isSoftwareGl ? 800 : 300);
  }

  async _loadPhase2ExteriorExtras() {
    if (this._phase2Started) return;
    this._phase2Started = true;
    const yieldFrame = () => new Promise((r) => window.setTimeout(r, this.isSoftwareGl ? 120 : 25));
    let daiHongChungGltf = null;
    let trongBatNhaGltf = null;
    let xeKhachGltf = null;
    let xeOtoGltf = null;
    if (this.isSoftwareGl) {
      daiHongChungGltf = await this.loadGLB(ARCH_GLB_PATHS.dai_hong_chung);
      await yieldFrame();
      trongBatNhaGltf = await this.loadGLB(ARCH_GLB_PATHS.trong_bat_nha);
      await yieldFrame();
      xeKhachGltf = await this.loadGLB(ARCH_GLB_PATHS.xe_khach);
      await yieldFrame();
      xeOtoGltf = await this.loadGLB(ARCH_GLB_PATHS.xe_oto);
    } else {
      [daiHongChungGltf, trongBatNhaGltf, xeKhachGltf, xeOtoGltf] = await Promise.all([
        this.loadGLB(ARCH_GLB_PATHS.dai_hong_chung),
        this.loadGLB(ARCH_GLB_PATHS.trong_bat_nha),
        this.loadGLB(ARCH_GLB_PATHS.xe_khach),
        this.loadGLB(ARCH_GLB_PATHS.xe_oto)
      ]);
    }

    if (daiHongChungGltf?.scene) {
      this.archMeshCache.dai_hong_chung = daiHongChungGltf.scene;
      for (const anchor of this.bellTowerArchAnchors) {
        if (anchor.placeholder?.parent) anchor.placeholder.parent.remove(anchor.placeholder);
        const bell = this.fitProp(daiHongChungGltf.scene, anchor.targetH || 1.85);
        const bb = new THREE.Box3().setFromObject(bell);
        bell.position.set(-(bb.min.x + bb.max.x) / 2, anchor.y - bb.min.y, -(bb.min.z + bb.max.z) / 2);
        anchor.group.add(bell);
      }
    }
    if (trongBatNhaGltf?.scene) {
      this.archMeshCache.trong_bat_nha = trongBatNhaGltf.scene;
      for (const anchor of this.drumTowerArchAnchors) {
        if (anchor.placeholder?.parent) anchor.placeholder.parent.remove(anchor.placeholder);
        const drum = this.fitProp(trongBatNhaGltf.scene, anchor.targetH || 1.72);
        const db = new THREE.Box3().setFromObject(drum);
        drum.position.set(-(db.min.x + db.max.x) / 2, anchor.y - db.min.y, -(db.min.z + db.max.z) / 2);
        anchor.group.add(drum);
      }
    }
    if (xeKhachGltf?.scene) this.archMeshCache.xe_khach = xeKhachGltf.scene;
    if (xeOtoGltf?.scene) this.archMeshCache.xe_oto = xeOtoGltf.scene;
    for (const pa of this.parkedVehicleAnchors) {
      const model = pa.kind === 'van' ? this.archMeshCache.xe_khach : this.archMeshCache.xe_oto;
      if (model && this.buildGLBRoadVehicle && !pa._upgraded) {
        pa._upgraded = true;
        if (pa.fallback?.parent) pa.fallback.parent.remove(pa.fallback);
        this.buildGLBRoadVehicle(model, pa.x, pa.z, pa.yaw, pa.targetLength);
      }
    }
    this.renderFrame();
  }

  ensureInteriorAssetsLoaded() {
    if (this._interiorLoadPromise) return this._interiorLoadPromise;
    this._interiorLoadPromise = (async () => {
      // Load interior assets in modest batches to avoid mobile/Safari WebGL memory spikes
      const [
        thichCaChanhDienGltf,
        hoPhapGltf,
        tieuDienGltf,
        toDatMaGltf,
        nghinMatNghinTayGltf,
        choNguCuaPhatGltf,
        longTruGltf,
        thapDenCauAnGltf,
        honNonBoGltf,
        daiHongChungGltf,
        trongBatNhaGltf,
        capHacRuaGltf,
        nhangKhoanhDongGltf
      ] = await Promise.all([
        STATUE_GLB_PATHS.thichCaChanhDien ? this.loadGLB(STATUE_GLB_PATHS.thichCaChanhDien) : Promise.resolve(null),
        this.loadGLB(STATUE_GLB_PATHS.hoPhap),
        this.loadGLB(STATUE_GLB_PATHS.tieuDien),
        this.loadGLB(STATUE_GLB_PATHS.toDatMa),
        this.loadGLB(STATUE_GLB_PATHS.nghinMatNghinTay),
        this.loadGLB(STATUE_GLB_PATHS.choNguCuaPhat),
        this.loadGLB(ARCH_GLB_PATHS.long_tru),
        this.loadGLB(ARCH_GLB_PATHS.thap_den_cau_an),
        this.loadGLB(ARCH_GLB_PATHS.hon_non_bo),
        this.loadGLB(ARCH_GLB_PATHS.dai_hong_chung),
        this.loadGLB(ARCH_GLB_PATHS.trong_bat_nha),
        this.loadGLB(PROP_GLB_PATHS.cap_hac_rua),
        this.loadGLB(PROP_GLB_PATHS.nhang_khoanh_dong)
      ]);

      const [kyTuongGltf, toaLocGltf, phucHoGltf, hangLongGltf, hoanHiGltf] = await Promise.all([
        this.loadGLB(ARHAT_GLB_PATHS.kyTuong),
        this.loadGLB(ARHAT_GLB_PATHS.toaLoc),
        this.loadGLB(ARHAT_GLB_PATHS.phucHo),
        this.loadGLB(ARHAT_GLB_PATHS.hangLong),
        this.loadGLB(ARHAT_GLB_PATHS.hoanHi)
      ]);

      const [phucHo2Gltf, thienDinhGltf, cuBatGltf, thacThapGltf, khaiTamGltf, tieuSuGltf] =
        await Promise.all([
          this.loadGLB(ARHAT_GLB_PATHS.phucHo2),
          this.loadGLB(ARHAT_GLB_PATHS.thienDinh),
          this.loadGLB(ARHAT_GLB_PATHS.cuBat),
          this.loadGLB(ARHAT_GLB_PATHS.thacThap),
          this.loadGLB(ARHAT_GLB_PATHS.khaiTam),
          this.loadGLB(ARHAT_GLB_PATHS.tieuSu)
        ]);

      if (this._interiorGLBsMounted) return;
      this._interiorGLBsMounted = true;

      if (longTruGltf?.scene) this.archMeshCache.long_tru = longTruGltf.scene;
      if (thapDenCauAnGltf?.scene) this.archMeshCache.thap_den_cau_an = thapDenCauAnGltf.scene;
      if (honNonBoGltf?.scene) this.archMeshCache.hon_non_bo = honNonBoGltf.scene;
      if (daiHongChungGltf?.scene) this.archMeshCache.dai_hong_chung = daiHongChungGltf.scene;
      if (trongBatNhaGltf?.scene) this.archMeshCache.trong_bat_nha = trongBatNhaGltf.scene;
      if (capHacRuaGltf?.scene) this.propMeshCache.cap_hac_rua = capHacRuaGltf.scene;
      if (nhangKhoanhDongGltf?.scene) this.propMeshCache.nhang_khoanh_dong = nhangKhoanhDongGltf.scene;

      // Tháp Đèn Cầu An / Đăng Dược Sư Vạn Phật PBR GLB ("Ghi Tên Cầu Phước" — image_d3dcebc6.png)
      if (this.archMeshCache.thap_den_cau_an && this.blessingTowerBodyAnchor) {
        const btModel = this.archMeshCache.thap_den_cau_an.clone(true);
        btModel.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
            if (o.geometry && !o.geometry.getAttribute('normal')) o.geometry.computeVertexNormals();
            if (o.material) {
              o.material = o.material.clone();
              o.material.emissive = new THREE.Color(0x6E240A);
              o.material.emissiveIntensity = 0.28;
            }
          }
        });
        const box = new THREE.Box3().setFromObject(btModel);
        const sz = new THREE.Vector3();
        box.getSize(sz);
        const radScale = 1.08 / Math.max(0.1, sz.x, sz.z);
        btModel.scale.set(radScale, 2.36 / Math.max(0.1, sz.y), radScale);
        const b2 = new THREE.Box3().setFromObject(btModel);
        btModel.position.set(-(b2.min.x + b2.max.x) / 2, -b2.min.y, -(b2.min.z + b2.max.z) / 2);
        if (this.blessingTowerProceduralCore) this.blessingTowerProceduralCore.visible = false;
        this.blessingTowerBodyAnchor.add(btModel);
      }

      // Hòn Non Bộ Sân Thiên Tỉnh 1 PBR GLB (image_0806c07c.png)
      if (this.archMeshCache.hon_non_bo && this.innerNonBoRockAnchor) {
        const nbModel = this.archMeshCache.hon_non_bo.clone(true);
        nbModel.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
            if (o.geometry && !o.geometry.getAttribute('normal')) o.geometry.computeVertexNormals();
          }
        });
        const box = new THREE.Box3().setFromObject(nbModel);
        const sz = new THREE.Vector3();
        box.getSize(sz);
        const xzScale = 4.65 / Math.max(0.2, sz.x, sz.z);
        nbModel.scale.set(xzScale, 4.45 / Math.max(0.2, sz.y), xzScale);
        const b2 = new THREE.Box3().setFromObject(nbModel);
        nbModel.position.set(-(b2.min.x + b2.max.x) / 2, -b2.min.y, -0.15 - (b2.min.z + b2.max.z) / 2);
        if (this.innerNonBoProceduralRocks) this.innerNonBoProceduralRocks.visible = false;
        this.innerNonBoRockAnchor.add(nbModel);
      }

      // Tam Bảo Chánh Điện main golden Shakyamuni statue atop upper pedestal in front of rainbow Dharma halo
      const mainSanctuaryScene = thichCaChanhDienGltf?.scene || this.archMeshCache._bantho_fallback;
      if (mainSanctuaryScene && this.tamBaoAltarGroup) {
        const s = this.cleanStatueScene(mainSanctuaryScene, null);
        const box = new THREE.Box3().setFromObject(s);
        const h = Math.max(0.1, box.max.y - box.min.y);
        s.scale.setScalar(3.05 / h);
        const box2 = new THREE.Box3().setFromObject(s);
        s.position.set(
          -(box2.min.x + box2.max.x) / 2,
          2.98 - box2.min.y,
          -0.78 - (box2.min.z + box2.max.z) / 2
        );
        s.rotation.y = 0;
        this.tamBaoAltarGroup.add(s);
      }

      // Guardians & Tổ Đạt Ma
      if (hoPhapGltf?.scene && this.hoPhapPlaceholder?.altar) {
        for (const p of this.hoPhapPlaceholder.parts) if (p.parent) p.parent.remove(p);
        const hp = this.cleanStatueScene(hoPhapGltf.scene, null);
        const box = new THREE.Box3().setFromObject(hp);
        hp.scale.setScalar(1.95 / Math.max(0.1, box.max.y - box.min.y));
        const box2 = new THREE.Box3().setFromObject(hp);
        hp.position.set(-(box2.min.x + box2.max.x) / 2, 1.18 - box2.min.y, -0.18 - (box2.min.z + box2.max.z) / 2);
        this.hoPhapPlaceholder.altar.add(hp);
      }
      if (tieuDienGltf?.scene && this.tieuDienPlaceholder?.altar) {
        for (const p of this.tieuDienPlaceholder.parts) if (p.parent) p.parent.remove(p);
        const td = this.cleanStatueScene(tieuDienGltf.scene, null);
        const box = new THREE.Box3().setFromObject(td);
        td.scale.setScalar(1.95 / Math.max(0.1, box.max.y - box.min.y));
        const box2 = new THREE.Box3().setFromObject(td);
        td.position.set(-(box2.min.x + box2.max.x) / 2, 1.18 - box2.min.y, -0.18 - (box2.min.z + box2.max.z) / 2);
        this.tieuDienPlaceholder.altar.add(td);
      }
      if (toDatMaGltf?.scene && this.khuThoAltarGroup) {
        for (const p of this.khuThoPlaceholderParts) if (p.parent) p.parent.remove(p);
        const dm = this.cleanStatueScene(toDatMaGltf.scene, null);
        const box = new THREE.Box3().setFromObject(dm);
        dm.scale.setScalar(1.65 / Math.max(0.1, box.max.y - box.min.y));
        const box2 = new THREE.Box3().setFromObject(dm);
        dm.position.set(-(box2.min.x + box2.max.x) / 2, 2.34 - box2.min.y, -0.18 - (box2.min.z + box2.max.z) / 2);
        this.khuThoAltarGroup.add(dm);
      }

      // Right-Side Gallery Shrine 1: Tượng Phật Nghìn Mắt Nghìn Tay PBR GLB
      if (nghinMatNghinTayGltf?.scene && this.nghinMatNghinTayAnchor) {
        const nm = this.cleanStatueScene(nghinMatNghinTayGltf.scene, null, true);
        nm.traverse((o) => {
          if (o.isMesh && o.material) {
            o.material.roughness = Math.min(0.42, o.material.roughness ?? 0.34);
            o.material.metalness = Math.max(0.45, o.material.metalness ?? 0.52);
          }
        });
        const box = new THREE.Box3().setFromObject(nm);
        const h = Math.max(0.1, box.max.y - box.min.y);
        nm.scale.setScalar(2.42 / h);
        const b2 = new THREE.Box3().setFromObject(nm);
        nm.position.set(-(b2.min.x + b2.max.x) / 2, -b2.min.y, 0.06 - (b2.min.z + b2.max.z) / 2);
        if (this.nghinMatProceduralGroup) this.nghinMatProceduralGroup.visible = false;
        this.nghinMatNghinTayAnchor.add(nm);
      }

      // Right-Side Gallery Shrine 2: Chỗ Ngủ Của Phật (Reclining Buddha inside Carved Canopy Bed) PBR GLB
      if (choNguCuaPhatGltf?.scene && this.choNguCuaPhatAnchor) {
        const cn = this.cleanStatueScene(choNguCuaPhatGltf.scene, null, true);
        cn.traverse((o) => {
          if (o.isMesh && o.material) {
            o.material.roughness = Math.min(0.45, o.material.roughness ?? 0.36);
            o.material.metalness = Math.max(0.38, o.material.metalness ?? 0.45);
          }
        });
        const rawBox = new THREE.Box3().setFromObject(cn);
        const rawSz = rawBox.getSize(new THREE.Vector3());
        if (rawSz.z > rawSz.x * 1.18) {
          cn.rotation.y = Math.PI / 2;
        }
        const rotBox = new THREE.Box3().setFromObject(cn);
        const rotSz = rotBox.getSize(new THREE.Vector3());
        cn.scale.setScalar(2.58 / Math.max(0.2, rotSz.x));
        const b2 = new THREE.Box3().setFromObject(cn);
        cn.position.set(-(b2.min.x + b2.max.x) / 2, 0.04 - b2.min.y, 0.04 - (b2.min.z + b2.max.z) / 2);
        if (this.choNguPlaceholderBody) this.choNguPlaceholderBody.visible = false;
        this.choNguCuaPhatAnchor.add(cn);
      }

      // 18 Thập Bát La Hán statues lining the Left Gallery of the Square (x = -18.5, z = -11.9 .. +13.6)
      const arhatRoster = [
        { index: 0, title: 'Tọa Lộc La Hán', gltf: toaLocGltf },
        { index: 1, title: 'Khánh Hỷ La Hán', gltf: tieuSuGltf },
        { index: 2, title: 'Cử Bát La Hán', gltf: cuBatGltf },
        { index: 3, title: 'Hoan Hỉ La Hán', gltf: hoanHiGltf },
        { index: 4, title: 'Bố Đại La Hán', gltf: null },
        { index: 5, title: 'Ba Tiêu La Hán', gltf: null },
        { index: 6, title: 'Kỵ Tượng La Hán', gltf: kyTuongGltf },
        { index: 7, title: 'Tiếu Sư La Hán', gltf: null },
        { index: 8, title: 'Thiền Định La Hán', gltf: thienDinhGltf },
        { index: 9, title: 'Trầm Tư La Hán', gltf: null },
        { index: 10, title: 'Thám Thủ La Hán', gltf: null },
        { index: 11, title: 'Khai Tâm La Hán', gltf: khaiTamGltf },
        { index: 12, title: 'Phục Hổ Tôn Giả', gltf: phucHo2Gltf },
        { index: 13, title: 'Thác Tháp La Hán', gltf: thacThapGltf },
        { index: 14, title: 'Khoái Nhĩ La Hán', gltf: null },
        { index: 15, title: 'Trường Mi La Hán', gltf: null },
        { index: 16, title: 'Hàng Long La Hán', gltf: hangLongGltf },
        { index: 17, title: 'Phục Hổ La Hán', gltf: phucHoGltf }
      ];
      for (let i = 0; i < 18; i++) {
        const item = arhatRoster[i];
        const ax = -18.5;
        const az = -11.9 + i * 1.5;
        const facing = Math.PI / 2;

        const pedestal = new THREE.Mesh(
          new THREE.CylinderGeometry(0.42, 0.48, 0.28, 12),
          this.MAT.stoneDark
        );
        pedestal.position.set(ax, 0.14, az);
        pedestal.receiveShadow = true;
        pedestal.userData.arhatIndex = item.index;
        pedestal.userData.arhatTitle = item.title;
        this.interiorGroup.add(pedestal);

        let statue;
        if (item.gltf?.scene) {
          statue = this.cleanStatueScene(item.gltf.scene, null, true);
          const initialBounds = new THREE.Box3().setFromObject(statue);
          const height = Math.max(0.1, initialBounds.max.y - initialBounds.min.y);
          statue.scale.setScalar(1.26 / height);
        } else {
          statue = createSculptedGardenArhat(THREE, i, { scale: 1.02 });
        }
        statue.rotation.y = facing;
        const bounds = new THREE.Box3().setFromObject(statue);
        statue.position.set(
          ax - (bounds.min.x + bounds.max.x) / 2,
          0.28 - bounds.min.y,
          az - (bounds.min.z + bounds.max.z) / 2
        );
        statue.userData.arhatIndex = item.index;
        statue.userData.arhatTitle = item.title;
        this.interiorGroup.add(statue);
        this.arhatGroups.push(statue, pedestal);
        this.interiorObstacles.push({ x: ax, z: az, r: 0.66 });
      }

      if (this.archMeshCache.dai_hong_chung && this.interiorBellAnchor?.group) {
        if (this.interiorBellAnchor.placeholder?.parent) this.interiorBellAnchor.placeholder.parent.remove(this.interiorBellAnchor.placeholder);
        const ibell = this.fitProp(this.archMeshCache.dai_hong_chung, 1.52);
        const bb = new THREE.Box3().setFromObject(ibell);
        ibell.position.set(-(bb.min.x + bb.max.x) / 2, 1.24 - bb.min.y, -(bb.min.z + bb.max.z) / 2);
        this.interiorBellAnchor.group.add(ibell);
      }
      if (this.archMeshCache.trong_bat_nha && this.interiorDrumAnchor?.group) {
        if (this.interiorDrumAnchor.placeholder?.parent) this.interiorDrumAnchor.placeholder.parent.remove(this.interiorDrumAnchor.placeholder);
        const idrum = this.fitProp(this.archMeshCache.trong_bat_nha, 1.42);
        const db = new THREE.Box3().setFromObject(idrum);
        idrum.position.set(-(db.min.x + db.max.x) / 2, 1.12 - db.min.y, -(db.min.z + db.max.z) / 2);
        this.interiorDrumAnchor.group.add(idrum);
      }
      if (this.archMeshCache.long_tru) {
        for (const ph of this.longTruPlaceholders) {
          for (const p of ph.replaceParts) if (p.parent) p.parent.remove(p);
          const ltModel = this.fitProp(this.archMeshCache.long_tru, 7.45);
          ltModel.rotation.y = ph.sideSign < 0 ? 0.35 : -0.35;
          const lb = new THREE.Box3().setFromObject(ltModel);
          ltModel.position.set(-(lb.min.x + lb.max.x) / 2, 0.65 - lb.min.y, -(lb.min.z + lb.max.z) / 2);
          ph.group.add(ltModel);
        }
      }
      if (this.propMeshCache.nhang_khoanh_dong && this.spiralIncenseAnchors?.length) {
        for (const anc of this.spiralIncenseAnchors) {
          while (anc.children.length > 0) anc.remove(anc.children[0]);
          const coil = this.fitProp(this.propMeshCache.nhang_khoanh_dong, 1.05);
          const cb = new THREE.Box3().setFromObject(coil);
          coil.position.set(-(cb.min.x + cb.max.x) / 2, -cb.max.y, -(cb.min.z + cb.max.z) / 2);
          anc.add(coil);
        }
      }
      if (this.propMeshCache.cap_hac_rua && this.craneTortoiseAnchor) {
        while (this.craneTortoiseAnchor.children.length > 0) {
          this.craneTortoiseAnchor.remove(this.craneTortoiseAnchor.children[0]);
        }
        for (const cx of [-2.8, 2.8]) {
          const crane = this.fitProp(this.propMeshCache.cap_hac_rua, 1.75);
          const cb = new THREE.Box3().setFromObject(crane);
          crane.position.set(cx - (cb.min.x + cb.max.x) / 2, -cb.min.y, -(cb.min.z + cb.max.z) / 2);
          crane.rotation.y = cx < 0 ? 0.16 : -0.16;
          this.craneTortoiseAnchor.add(crane);
        }
      }
      if (!this._interiorWorshippersSpawned) {
        this._interiorWorshippersSpawned = true;
        this.spawnInteriorWorshippersV8();
      }
      this.renderFrame();
    })();
    return this._interiorLoadPromise;
  }

  fitProp(sceneObj, targetSize) {
    const clone = sceneObj.clone(true);
    clone.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.geometry && !o.geometry.getAttribute('normal')) {
          o.geometry.computeVertexNormals();
        }
      }
    });
    const box = new THREE.Box3().setFromObject(clone);
    const sz = new THREE.Vector3();
    box.getSize(sz);
    const maxDim = Math.max(0.05, sz.x, sz.y, sz.z);
    clone.scale.setScalar(targetSize / maxDim);
    const box2 = new THREE.Box3().setFromObject(clone);
    clone.position.y = -box2.min.y;
    return clone;
  }

  placeLoaded3DPropsInWorld() {
    const fitProp = (sceneObj, targetSize) => this.fitProp(sceneObj, targetSize);

    // Upgrade courtyard pigeons with upright Meshy chim-bo-cau-3d.glb
    if (this.propMeshCache.chim_bo_cau && this.pigeons.length > 0) {
      const rawBox = new THREE.Box3().setFromObject(this.propMeshCache.chim_bo_cau);
      const rawSz = rawBox.getSize(new THREE.Vector3());
      const isFlatSheet = rawSz.z < rawSz.y * 0.25;
      for (const p of this.pigeons) {
        while (p.group.children.length > 0) p.group.remove(p.group.children[0]);
        const dove = fitProp(this.propMeshCache.chim_bo_cau, 0.36);
        dove.rotation.x = isFlatSheet ? -Math.PI / 2 : 0;
        const db = new THREE.Box3().setFromObject(dove);
        dove.position.set(-(db.min.x + db.max.x) / 2, -db.min.y, -(db.min.z + db.max.z) / 2);
        p.group.add(dove);
        p.wL = null;
        p.wR = null;
      }
    }

    // Interior sacred implements: Nhang Khoanh Đồng coils & Cặp Hạc Rùa Đồng on Tam Bảo
    if (this.propMeshCache.nhang_khoanh_dong && this.spiralIncenseAnchors?.length) {
      for (const anc of this.spiralIncenseAnchors) {
        while (anc.children.length > 0) anc.remove(anc.children[0]);
        const coil = fitProp(this.propMeshCache.nhang_khoanh_dong, 1.05);
        const cb = new THREE.Box3().setFromObject(coil);
        coil.position.set(-(cb.min.x + cb.max.x) / 2, -cb.max.y, -(cb.min.z + cb.max.z) / 2);
        anc.add(coil);
      }
    }
    if (this.propMeshCache.cap_hac_rua && this.craneTortoiseAnchor) {
      while (this.craneTortoiseAnchor.children.length > 0) {
        this.craneTortoiseAnchor.remove(this.craneTortoiseAnchor.children[0]);
      }
      for (const cx of [-2.8, 2.8]) {
        const crane = fitProp(this.propMeshCache.cap_hac_rua, 1.75);
        const cb = new THREE.Box3().setFromObject(crane);
        crane.position.set(cx - (cb.min.x + cb.max.x) / 2, -cb.min.y, -(cb.min.z + cb.max.z) / 2);
        crane.rotation.y = cx < 0 ? 0.16 : -0.16;
        this.craneTortoiseAnchor.add(crane);
      }
    }

    // Living Sala flowering tree beside Outdoor Arhat Plaza
    if (this.propMeshCache.cay_sala && this.outdoorArhatPlaza) {
      const sala = fitProp(this.propMeshCache.cay_sala, 5.8);
      sala.position.set(-4.2, 0, -4.6);
      this.outdoorArhatPlaza.add(sala);
    }

    // Place hexagonal lanterns at Chánh Điện porch & Shop Pavilion
    if (this.propMeshCache.den_long) {
      for (const lx of [19.8, 26.2]) {
        const l = fitProp(this.propMeshCache.den_long, 0.85);
        l.position.set(lx, 4.8, 6.6);
        this.exteriorGroup.add(l);
      }
      if (this.proceduralShopGroup) {
        for (const sx of [-1.85, 1.85]) {
          const l = fitProp(this.propMeshCache.den_long, 0.68);
          l.position.set(sx, 2.35, 1.65);
          this.proceduralShopGroup.add(l);
        }
      }
    }

    // Place lotus urns (chum_sanh_hoa_sen) beside Chánh Điện side stairs & Shop Pavilion
    if (this.propMeshCache.chum_sen) {
      for (const ux of [13.2, 32.8]) {
        const urn = fitProp(this.propMeshCache.chum_sen, 1.15);
        urn.position.set(ux, 0, 8.8);
        this.exteriorGroup.add(urn);
      }
      if (this.proceduralShopGroup) {
        const urn = fitProp(this.propMeshCache.chum_sen, 1.1);
        urn.position.set(2.85, 0, 1.5);
        this.proceduralShopGroup.add(urn);
      }
    }

    // Populate Marketplace stalls by category with real local GLB props
    for (let i = 0; i < this.stallAnchors.length; i++) {
      const stall = this.stallAnchors[i];
      const stype = stall.userData.stallType || 'thu_cong';

      if (stype === 'huong_hoa') {
        if (this.propMeshCache.ban_tho) {
          const bowl = fitProp(this.propMeshCache.ban_tho, 0.44);
          bowl.position.set(-1.15, 1.16, 0.56);
          stall.add(bowl);
          this.stallClickTargets.push(bowl);
        }
        if (this.propMeshCache.chum_sen) {
          const vase = fitProp(this.propMeshCache.chum_sen, 0.62);
          vase.position.set(-0.28, 1.16, 0.54);
          stall.add(vase);
          this.stallClickTargets.push(vase);
        }
        if (this.propMeshCache.mam_ngu_qua) {
          const fruit = fitProp(this.propMeshCache.mam_ngu_qua, 0.52);
          fruit.position.set(0.55, 1.16, 0.54);
          stall.add(fruit);
          this.stallClickTargets.push(fruit);
        }
        if (this.propMeshCache.nen_hoa_sen) {
          const lotusCandle = fitProp(this.propMeshCache.nen_hoa_sen, 0.34);
          lotusCandle.position.set(1.32, 1.16, 0.56);
          stall.add(lotusCandle);
          this.stallClickTargets.push(lotusCandle);
        }
        if (this.propMeshCache.den_hoa_dang) {
          const hd = fitProp(this.propMeshCache.den_hoa_dang, 0.42);
          hd.position.set(0.95, 1.56, -0.78);
          stall.add(hd);
        }
      } else if (stype === 'thu_cong') {
        if (this.propMeshCache.non_la) {
          for (const nx of [-1.25, -0.75]) {
            const hat = fitProp(this.propMeshCache.non_la, 0.48);
            hat.position.set(nx, 1.16, 0.56);
            stall.add(hat);
            this.stallClickTargets.push(hat);
          }
        }
        if (this.propMeshCache.quat_nan_la_dua) {
          for (const fx of [-0.05, 0.48]) {
            const fan = fitProp(this.propMeshCache.quat_nan_la_dua, 0.48);
            fan.position.set(fx, 1.16, 0.56);
            stall.add(fan);
            this.stallClickTargets.push(fan);
          }
        }
        if (this.propMeshCache.gio_may_tre) {
          const basket = fitProp(this.propMeshCache.gio_may_tre, 0.62);
          basket.position.set(i % 2 === 0 ? -1.45 : 1.45, 0.16, 1.18);
          stall.add(basket);
          this.stallClickTargets.push(basket);
          const basketTop = fitProp(this.propMeshCache.gio_may_tre, 0.5);
          basketTop.position.set(1.22, 1.16, 0.54);
          stall.add(basketTop);
          this.stallClickTargets.push(basketTop);
        }
      } else {
        if (this.propMeshCache.trai_dua_xiem) {
          for (const ox of [-1.35, -0.95, -0.55]) {
            const coco = fitProp(this.propMeshCache.trai_dua_xiem, 0.38);
            coco.position.set(ox, 1.16, 0.56);
            stall.add(coco);
            this.stallClickTargets.push(coco);
          }
        }
        if (this.propMeshCache.dia_banh_bo) {
          const bo = fitProp(this.propMeshCache.dia_banh_bo, 0.46);
          bo.position.set(0.22, 1.16, 0.56);
          stall.add(bo);
          this.stallClickTargets.push(bo);
        }
        if (this.propMeshCache.dia_banh_da_lon) {
          const dl = fitProp(this.propMeshCache.dia_banh_da_lon, 0.46);
          dl.position.set(1.05, 1.16, 0.56);
          stall.add(dl);
          this.stallClickTargets.push(dl);
        }
      }

      if (this.propMeshCache.den_long) {
        const lamp = fitProp(this.propMeshCache.den_long, 0.56);
        lamp.position.set(0, 2.22, 1.35);
        stall.add(lamp);
      }
    }

    // Place five-fruit tray (mam_ngu_qua), wooden fish (mo_go), and incense bowl (ban_tho) on Tam Bảo Altar
    if (this.propMeshCache.mam_ngu_qua && this.tamBaoAltarGroup) {
      const tray = fitProp(this.propMeshCache.mam_ngu_qua, 0.78);
      tray.position.set(-1.4, 1.4, 1.2);
      this.tamBaoAltarGroup.add(tray);
    }
    if (this.propMeshCache.mo_go && this.tamBaoAltarGroup) {
      const mogo = fitProp(this.propMeshCache.mo_go, 0.62);
      mogo.position.set(1.4, 1.4, 1.2);
      this.tamBaoAltarGroup.add(mogo);
    }
    if (this.propMeshCache.ban_tho && this.tamBaoAltarGroup) {
      const bowl = fitProp(this.propMeshCache.ban_tho, 0.75);
      bowl.position.set(0, 1.4, 1.35);
      this.tamBaoAltarGroup.add(bowl);
    }
  }

  initSmokeColumns() {
    const origins = [
      new THREE.Vector3(23.0, 1.32, 12.0),
      new THREE.Vector3(15.8, 1.15, 17.5),
      new THREE.Vector3(-24.5, 2.85, 17.2),
      new THREE.Vector3(34.5, 0.98, 22.5),
      new THREE.Vector3(-24.5, 0.98, -13.5)
    ];
    for (const orig of origins) {
      const sc = new SmokeColumn(orig, 42, 0.26, 3.4);
      this.exteriorGroup.add(sc.points);
      this.smokeColumns.push(sc);
    }
  }

  // Exact vertex-color monk robe & orange diagonal sash from module_5.js
  recolorMonkRobe(model, tone = 0) {
    const robePalette = [
      [0.46, 0.45, 0.43],
      [0.54, 0.48, 0.4],
      [0.42, 0.36, 0.3]
    ];
    const robe = robePalette[tone % robePalette.length];
    const sash = [0.9, 0.48, 0.14];
    model.traverse((o) => {
      if (!o.isMesh || !o.geometry) return;
      const col = o.geometry.getAttribute('color');
      const pos = o.geometry.getAttribute('position');
      if (!col || !pos) return;
      o.geometry = o.geometry.clone();
      const origArr = new Float32Array(col.count * 3);
      for (let i = 0; i < col.count; i++) {
        origArr[i * 3] = col.getX(i);
        origArr[i * 3 + 1] = col.getY(i);
        origArr[i * 3 + 2] = col.getZ(i);
      }
      const c = new THREE.Float32BufferAttribute(origArr, 3);
      o.geometry.setAttribute('color', c);
      const p = o.geometry.getAttribute('position');
      o.geometry.computeBoundingBox();
      const bb = o.geometry.boundingBox;
      const yMin = bb.min.y;
      const ySpan = Math.max(0.001, bb.max.y - yMin);
      const xSpan = Math.max(0.001, bb.max.x - bb.min.x);
      for (let i = 0; i < c.count; i++) {
        const r = c.getX(i);
        const g = c.getY(i);
        const b = c.getZ(i);
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const sat = maxC > 0 ? (maxC - minC) / maxC : 0;
        const isSkin = r > g && g > b && r - b > 0.12 && r > 0.42;
        const ny = (p.getY(i) - yMin) / ySpan;
        if (ny > 0.85 && maxC < 0.25) {
          c.setXYZ(i, 0.72, 0.58, 0.46);
          continue;
        }
        if (!isSkin && sat < 0.32 && maxC > 0.18 && maxC < 0.92 && ny > 0.12 && ny < 0.86) {
          const nx = (p.getX(i) - bb.min.x) / xSpan;
          const diag = nx * 0.85 + (ny - 0.42);
          const onSash = ny > 0.46 && ny < 0.83 && diag > 0.58 && diag < 0.88;
          const shade = 0.75 + 0.35 * maxC;
          if (onSash) {
            c.setXYZ(
              i,
              Math.min(1, sash[0] * shade),
              Math.min(1, sash[1] * shade),
              Math.min(1, sash[2] * shade)
            );
          } else {
            c.setXYZ(
              i,
              Math.min(1, robe[0] * shade),
              Math.min(1, robe[1] * shade),
              Math.min(1, robe[2] * shade)
            );
          }
        }
      }
      c.needsUpdate = true;
    });
  }

  recolorPastelDress(model, rgb) {
    model.traverse((o) => {
      if (!o.isMesh || !o.geometry) return;
      const col = o.geometry.getAttribute('color');
      const pos = o.geometry.getAttribute('position');
      if (!col || !pos) return;
      if (!rgb && !o.geometry.userData.origColors) return;
      if (!o.geometry.userData.origColors) {
        o.geometry = o.geometry.clone();
        const clonedCol = o.geometry.getAttribute('color');
        const origArr = new Float32Array(clonedCol.count * 3);
        for (let i = 0; i < clonedCol.count; i++) {
          origArr[i * 3] = clonedCol.getX(i);
          origArr[i * 3 + 1] = clonedCol.getY(i);
          origArr[i * 3 + 2] = clonedCol.getZ(i);
        }
        o.geometry.userData.origColors = origArr;
        o.geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(origArr), 3));
      }
      const c = o.geometry.getAttribute('color');
      const orig = o.geometry.userData.origColors;
      const p = o.geometry.getAttribute('position');
      o.geometry.computeBoundingBox();
      const bb = o.geometry.boundingBox;
      const yMin = bb.min.y;
      const ySpan = Math.max(0.001, bb.max.y - yMin);
      for (let i = 0; i < c.count; i++) {
        const r = orig[i * 3];
        const g = orig[i * 3 + 1];
        const b = orig[i * 3 + 2];
        if (!rgb) {
          c.setXYZ(i, r, g, b);
          continue;
        }
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const sat = maxC > 0 ? (maxC - minC) / maxC : 0;
        const isSkin = r > g && g > b && r - b > 0.12 && r > 0.42;
        const ny = (p.getY(i) - yMin) / ySpan;
        if (!isSkin && sat < 0.28 && maxC > 0.22 && maxC < 0.9 && ny > 0.18 && ny < 0.84) {
          const shade = 0.72 + 0.38 * maxC;
          c.setXYZ(
            i,
            Math.min(1, rgb[0] * shade),
            Math.min(1, rgb[1] * shade),
            Math.min(1, rgb[2] * shade)
          );
        } else {
          c.setXYZ(i, r, g, b);
        }
      }
      c.needsUpdate = true;
    });
  }

  attachConicalHat(record, heightMeters = 1.62) {
    if (!record?.root) return;
    const hatMat = new THREE.MeshStandardMaterial({
      color: 0xDFC99B,
      roughness: 0.75,
      side: THREE.DoubleSide
    });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.16, 20, 1, true), hatMat);
    cone.castShadow = true;
    let headBone = null;
    record.root.traverse((b) => {
      if (b.isBone && b.name === 'Head') headBone = b;
    });
    if (headBone) {
      const s = record.root.scale.x || 1;
      cone.scale.setScalar(1 / s);
      cone.position.set(0, 0.14 / s, 0);
      cone.rotation.x = -0.08;
      headBone.add(cone);
    } else {
      cone.position.set(0, heightMeters * 1.02, 0);
      record.root.add(cone);
    }
  }

  cloneAnimatedCharacter(charKey, targetHeight) {
    const gltf = this.charDataCache[charKey];
    if (!gltf?.scene) return null;
    const cloned = SkeletonUtils.clone(gltf.scene);
    let geomBox = null;
    cloned.traverse((o) => {
      if (o.isMesh || o.isSkinnedMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        o.frustumCulled = false;
        if (o.geometry) {
          if (!o.geometry.getAttribute('normal')) {
            o.geometry.computeVertexNormals();
          }
          o.geometry.computeBoundingBox();
          if (o.isSkinnedMesh && o.geometry.boundingBox) {
            if (!geomBox) {
              geomBox = o.geometry.boundingBox.clone();
            } else {
              geomBox.union(o.geometry.boundingBox);
            }
          }
        }
        if (o.material) {
          o.material = o.material.clone();
          if (o.geometry && o.geometry.getAttribute('color')) {
            o.material.vertexColors = true;
          }
          o.material.metalness = 0.0;
          o.material.roughness = 0.88;
        }
      }
    });
    if (!geomBox) {
      geomBox = new THREE.Box3().setFromObject(cloned);
    }
    const rawH = Math.max(0.2, geomBox.max.y - geomBox.min.y);
    const scale = targetHeight / rawH;
    cloned.scale.setScalar(scale);
    cloned.position.y = -geomBox.min.y * scale;

    const mixer = new THREE.AnimationMixer(cloned);
    const actions = {};
    for (const clip of gltf.animations || []) {
      const cleanName = clip.name.replace(/_world$/, '');
      const act = mixer.clipAction(clip);
      actions[cleanName] = act;
      actions[clip.name] = act;
      const norm = normalizeAnimKey(clip.name);
      if (norm && !actions[norm]) actions[norm] = act;
    }
    if (actions['di bo'] && !actions['Di bo']) actions['Di bo'] = actions['di bo'];
    if (actions['walk'] && !actions['Di bo']) actions['Di bo'] = actions['walk'];
    if (actions['walking'] && !actions['Di bo']) actions['Di bo'] = actions['walking'];
    if (actions['idle'] && !actions['Dung']) actions['Dung'] = actions['idle'];
    if (actions['stand'] && !actions['Dung']) actions['Dung'] = actions['stand'];
    if (actions['dung'] && !actions['Dung']) actions['Dung'] = actions['dung'];
    if (actions['chap tay'] && !actions['Chắp tay']) actions['Chắp tay'] = actions['chap tay'];
    if (actions['quy'] && !actions['Quỳ']) actions['Quỳ'] = actions['quy'];
    if (actions['vai'] && !actions['Vái']) actions['Vái'] = actions['vai'];
    if (actions['Di bo'] && !actions['Đi bộ']) actions['Đi bộ'] = actions['Di bo'];
    if (actions['Đi bộ'] && !actions['Di bo']) actions['Di bo'] = actions['Đi bộ'];

    return {
      root: cloned,
      mixer,
      actions,
      activeAction: null,
      activeClipName: '',
      baseY: cloned.position.y
    };
  }

  playClipCrossfade(record, clipName, fadeDuration = 0.22, loopOnce = false) {
    if (!record || !record.actions) return;
    const norm = normalizeAnimKey(clipName);
    const isPrayerPose =
      norm === 'vai' || norm === 'quy' || norm === 'thap nhang' || norm === 'chap tay';
    const target =
      record.actions[clipName] ||
      record.actions[norm] ||
      (norm === 'di bo' || norm === 'walk'
        ? record.actions['Di bo'] || record.actions['walk'] || record.actions['walking']
        : null) ||
      (norm === 'dung' || norm === 'idle' ? record.actions['Dung'] || record.actions['idle'] : null) ||
      (isPrayerPose ? record.actions['Chắp tay'] || record.actions['chap tay'] : null) ||
      record.actions['Dung'] ||
      Object.values(record.actions)[0];
    if (!target) return;
    if (record.activeAction === target && !loopOnce) {
      target.paused = false;
      return;
    }

    if (record.activeAction && record.activeAction !== target) {
      record.activeAction.fadeOut(fadeDuration);
    }
    target.reset();
    target.paused = false;
    target.setLoop(loopOnce ? THREE.LoopOnce : THREE.LoopRepeat, loopOnce ? 1 : Infinity);
    target.clampWhenFinished = loopOnce;
    target.fadeIn(fadeDuration).play();
    record.activeAction = target;
    record.activeClipName = clipName;
  }

  setCharacter(charKey = 'nu') {
    const validKeys = ['nu', 'nam', 'tre_em', 'su_thay', 'nu_ao_lam', 'nam_ao_nau', 'du_khach'];
    if (!validKeys.includes(charKey)) charKey = 'nu';
    this.playerState.charKey = charKey;

    if (!this.charDataCache[charKey]?.scene) {
      this.loadCharacterGLB(charKey).then((loaded) => {
        if (loaded?.scene && this.playerState.charKey === charKey) {
          this.setCharacter(charKey);
        }
      });
    }

    while (this.playerContainer.children.length > 0) {
      this.playerContainer.remove(this.playerContainer.children[0]);
    }
    const h = CHAR_HEIGHTS[charKey] || 1.62;
    const rec = this.cloneAnimatedCharacter(charKey, h) || this.cloneAnimatedCharacter('nu', h);
    if (!rec) return;
    this.activePlayerRecord = rec;
    this.playerContainer.add(rec.root);

    // Add soft contact shadow under protagonist
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.36, 20),
      new THREE.MeshBasicMaterial({ color: 0x1A140E, transparent: true, opacity: 0.26 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.015;
    this.playerContainer.add(shadow);

    this.equipmentGroup = new THREE.Group();
    this.playerContainer.add(this.equipmentGroup);

    this.storePreviewGroup = new THREE.Group();
    this.playerContainer.add(this.storePreviewGroup);

    // Start cleanly in standing idle posture ('Dung') so avatar is ready to animate immediately
    this.playerState.moving = false;
    this.playerState.pose = 'Dung';
    this.playClipCrossfade(rec, 'Dung', 0.08, false);
    if (rec.activeAction) {
      rec.activeAction.paused = false;
      rec.mixer.update(0.02);
    }

    this.syncPlayerTransform();
    this.syncRiggedPlayerWearables();
    this.renderFrame();
  }

  makeArticulatedFigure({
    height = 1.65,
    robeHex = 0x7A746E,
    sashHex = null,
    hairType = 'bun',
    hat = false,
    kneeling = false
  }) {
    const root = new THREE.Group();
    const s = height / 1.65;

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xF2C8A6, roughness: 0.75 });
    const robeMat = new THREE.MeshStandardMaterial({ color: robeHex, roughness: 0.82 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x4A443F, roughness: 0.85 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x221B18, roughness: 0.8 });

    // Soft ground contact shadow disc
    const shadowDisc = new THREE.Mesh(
      new THREE.CircleGeometry(0.36 * s, 16),
      new THREE.MeshBasicMaterial({ color: 0x1A140E, transparent: true, opacity: 0.28 })
    );
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = 0.015;
    root.add(shadowDisc);

    const bodyGroup = new THREE.Group();
    root.add(bodyGroup);

    // Legs
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.085 * s, 0.075 * s, 0.62 * s, 10), pantsMat);
    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.085 * s, 0.075 * s, 0.62 * s, 10), pantsMat);
    if (kneeling) {
      legL.scale.y = 0.45;
      legR.scale.y = 0.45;
      legL.position.set(-0.11 * s, 0.16 * s, 0.06 * s);
      legR.position.set(0.11 * s, 0.16 * s, 0.06 * s);
      bodyGroup.position.y = -0.28 * s;
    } else {
      legL.position.set(-0.11 * s, 0.31 * s, 0);
      legR.position.set(0.11 * s, 0.31 * s, 0);
    }
    root.add(legL, legR);

    // Robe / Torso
    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18 * s, 0.24 * s, 0.68 * s, 14),
      robeMat
    );
    torso.position.y = 0.88 * s;
    bodyGroup.add(torso);

    // Optional Monk Diagonal Saffron Sash (Huỳnh Y / Dải Cam)
    if (sashHex !== null) {
      const sashMat = new THREE.MeshStandardMaterial({ color: sashHex, roughness: 0.7 });
      const sash = new THREE.Mesh(
        new THREE.TorusGeometry(0.205 * s, 0.048 * s, 8, 18),
        sashMat
      );
      sash.position.set(0, 0.94 * s, 0);
      sash.rotation.set(Math.PI / 2.6, 0.42, 0);
      bodyGroup.add(sash);
    }

    // Arms (articulated for walking or Chắp tay prayer)
    const armL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.058 * s, 0.05 * s, 0.48 * s, 10),
      robeMat
    );
    const armR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.058 * s, 0.05 * s, 0.48 * s, 10),
      robeMat
    );
    armL.position.set(-0.23 * s, 0.92 * s, 0.06 * s);
    armR.position.set(0.23 * s, 0.92 * s, 0.06 * s);
    bodyGroup.add(armL, armR);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.145 * s, 14, 12), skinMat);
    head.position.y = 1.38 * s;
    bodyGroup.add(head);

    if (hairType === 'tuft') {
      // Chú tiểu An top-knot tuft
      const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.055 * s, 10, 8), hairMat);
      tuft.position.set(0, 1.53 * s, 0.02 * s);
      bodyGroup.add(tuft);
    } else if (hairType === 'bun') {
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.15 * s, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.58),
        hairMat
      );
      cap.position.y = 1.39 * s;
      bodyGroup.add(cap);
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.065 * s, 10, 8), hairMat);
      bun.position.set(0, 1.36 * s, -0.14 * s);
      bodyGroup.add(bun);
    }

    if (hat) {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.28 * s, 0.18 * s, 20),
        new THREE.MeshStandardMaterial({ color: 0xE6D3A7, roughness: 0.75 })
      );
      cone.position.set(0, 1.54 * s, 0);
      bodyGroup.add(cone);
    }

    return { root, legL, legR, armL, armR, bodyGroup, s };
  }

  animateArticulatedFigure(fig, elapsed, walking = false, speed = 1.0) {
    if (!fig) return;
    if (walking) {
      const swing = Math.sin(elapsed * 7.5 * speed) * 0.35;
      fig.legL.rotation.x = swing;
      fig.legR.rotation.x = -swing;
      fig.armL.rotation.x = -swing * 0.7;
      fig.armR.rotation.x = swing * 0.7;
      fig.armL.rotation.z = 0.08;
      fig.armR.rotation.z = -0.08;
    } else {
      // Chắp tay (Prayer pose)
      fig.legL.rotation.x = 0;
      fig.legR.rotation.x = 0;
      fig.armL.rotation.x = -0.65;
      fig.armR.rotation.x = -0.65;
      fig.armL.rotation.z = -0.35;
      fig.armR.rotation.z = 0.35;
    }
  }

  equipNpcProps(rec, charKey, h, opts = {}) {
    if (!rec?.root) return;
    const bones = findCharacterBones(rec.root);
    const invS = 1 / (rec.root.scale.x || 1);

    if (opts.hat) {
      if (this.propMeshCache.non_la) {
        const hat = this.fitProp(this.propMeshCache.non_la, charKey === 'tre_em' ? 0.34 : 0.43);
        if (bones.head) {
          hat.scale.multiplyScalar(invS);
          hat.position.set(0, (bones.isMixamoRig ? 0.11 : 0.13) * invS, 0.01 * invS);
          hat.rotation.x = -0.06;
          bones.head.add(hat);
        } else {
          hat.scale.multiplyScalar(invS);
          hat.position.set(0, h * 0.96 * invS, 0.01 * invS);
          rec.root.add(hat);
        }
      } else {
        this.attachConicalHat(rec, h);
      }
    }

    // Shoulder tote bag or woven market basket attached to chest/spine bone
    if (opts.bag === 'tui_sen' || opts.bag === 'gio_may') {
      const bagMesh =
        opts.bag === 'gio_may' && this.propMeshCache.gio_may_tre
          ? this.fitProp(this.propMeshCache.gio_may_tre, 0.34)
          : this.propMeshCache.tui_sen
          ? this.fitProp(this.propMeshCache.tui_sen, 0.32)
          : new THREE.Mesh(
              new THREE.BoxGeometry(0.11, 0.24, 0.2),
              new THREE.MeshStandardMaterial({ color: 0xEFE1C6, roughness: 0.78 })
            );
      const torsoBone = bones.chest || bones.spine;
      bagMesh.scale.multiplyScalar(invS);
      if (torsoBone) {
        bagMesh.position.set((opts.bag === 'gio_may' ? 0.2 : -0.19) * invS, -0.05 * invS, -0.04 * invS);
        torsoBone.add(bagMesh);
      } else {
        bagMesh.position.set((opts.bag === 'gio_may' ? 0.22 : -0.2) * invS, h * 0.54 * invS, 0.02 * invS);
        rec.root.add(bagMesh);
      }
    }

    // Checkered Southern scarf ("khăn rằn Nam Bộ") attached to neck/collar bone
    if (opts.scarf) {
      const scarf = this.propMeshCache.khan_ran
        ? this.fitProp(this.propMeshCache.khan_ran, 0.4)
        : new THREE.Mesh(
            new THREE.TorusGeometry(0.13, 0.03, 7, 14),
            new THREE.MeshStandardMaterial({ color: 0x2B2420, roughness: 0.8 })
          );
      if (!this.propMeshCache.khan_ran) scarf.rotation.x = Math.PI / 2 - 0.15;
      const collarBone = bones.neck || bones.chest || bones.spine;
      scarf.scale.multiplyScalar(invS);
      if (collarBone) {
        scarf.position.set(0, (bones.isMixamoRig ? 0.02 : 0.07) * invS, 0.03 * invS);
        collarBone.add(scarf);
      } else {
        scarf.position.set(0, h * 0.75 * invS, 0.05 * invS);
        rec.root.add(scarf);
      }
    }

    // Hand-carried items attached to right hand / forearm bone
    if (opts.hand) {
      const handBone = bones.rightHand || bones.rightForearm;
      let prop = null;
      if (opts.hand === 'quat' && this.propMeshCache.quat_nan_la_dua) {
        prop = this.fitProp(this.propMeshCache.quat_nan_la_dua, 0.32);
      } else if (opts.hand === 'hoa_sen') {
        if (this.propMeshCache.nen_hoa_sen) {
          prop = this.fitProp(this.propMeshCache.nen_hoa_sen, 0.26);
        } else {
          prop = new THREE.Mesh(
            new THREE.ConeGeometry(0.08, 0.18, 7),
            new THREE.MeshStandardMaterial({ color: 0xEC6C9A, roughness: 0.45 })
          );
        }
      } else if (opts.hand === 'nhang') {
        const bun = new THREE.Group();
        const wrap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.03, 0.22, 8),
          new THREE.MeshStandardMaterial({ color: 0xC62828, roughness: 0.6 })
        );
        bun.add(wrap);
        const top = new THREE.Mesh(
          new THREE.CylinderGeometry(0.028, 0.028, 0.2, 8),
          new THREE.MeshStandardMaterial({ color: 0xD9962E, roughness: 0.7 })
        );
        top.position.y = 0.18;
        bun.add(top);
        prop = bun;
      } else if (opts.hand === 'beads') {
        if (this.propMeshCache.trang_hat) {
          prop = this.fitProp(this.propMeshCache.trang_hat, 0.2);
        } else {
          prop = new THREE.Mesh(
            new THREE.TorusGeometry(0.08, 0.015, 6, 14),
            new THREE.MeshStandardMaterial({ color: 0x5E3418, roughness: 0.45 })
          );
        }
      }
      if (prop) {
        prop.scale.multiplyScalar(invS);
        if (handBone) {
          prop.position.set(0, -0.02 * invS, 0.05 * invS);
          handBone.add(prop);
        } else {
          prop.position.set(0.21 * invS, h * 0.56 * invS, 0.18 * invS);
          rec.root.add(prop);
        }
      }
    }
  }

  spawnMonksAndPilgrimsV8() {
    // 1. Real rigged GLB kneeling worshippers at Flag Courtyard, A Di Đà, Di Lặc, Niết Bàn, Đài Quán Thế Âm & Nhà Tổ
    const kneelSpots = [
      { charKey: 'nu', x: 21.4, z: 13.4, yaw: Math.PI, tint: [0.76, 0.64, 0.72] },
      { charKey: 'nam', x: 24.6, z: 13.4, yaw: Math.PI, monkTone: 0 },
      { charKey: 'nu', x: 14.2, z: 17.5, yaw: -Math.PI / 2, tint: [0.80, 0.72, 0.62] },
      { charKey: 'nam', x: -24.5, z: 17.5, yaw: Math.PI, monkTone: 1 },
      { charKey: 'nu', x: 35.2, z: 22.5, yaw: -Math.PI / 2, tint: [0.85, 0.70, 0.76] },
      { charKey: 'nam', x: -24.5, z: -10.5, yaw: 0, monkTone: 2 },
      { charKey: 'nu', x: 22.0, z: -49.5, yaw: Math.PI, tint: [0.68, 0.76, 0.84] }
    ];
    for (const ks of kneelSpots) {
      const h = CHAR_HEIGHTS[ks.charKey] || 1.64;
      const rec = this.cloneAnimatedCharacter(ks.charKey, h);
      if (!rec) continue;
      if (typeof ks.monkTone === 'number') {
        this.recolorMonkRobe(rec.root, ks.monkTone);
      } else if (ks.tint) {
        this.recolorPastelDress(rec.root, ks.tint);
      }
      rec.root.position.set(ks.x, rec.baseY + 0.08, ks.z);
      rec.root.rotation.y = ks.yaw;
      this.playClipCrossfade(rec, 'Quỳ', 0.05);
      if (rec.activeAction) {
        rec.mixer.setTime(2.6);
        rec.mixer.update(0);
        rec.activeAction.paused = true;
      }
      this.exteriorGroup.add(rec.root);
      this.kneelingRecords.push(rec);
    }

    // 2. Rigged GLB Vietnamese Shopkeepers inside Nhà Tạp Hóa & across Bustling Market Street Stalls
    const vendorSpecs = [
      { x: 46.8, z: -17.2, yaw: -Math.PI * 0.5, charKey: 'nu', tint: [0.86, 0.66, 0.54], hat: false, bag: null, hand: 'quat' },
      { x: 40.5, z: -24.8, yaw: 0, charKey: 'nam', tint: [0.58, 0.48, 0.36], hat: false, scarf: true },
      { x: -12.0, z: 48.0, yaw: 0, charKey: 'nu', tint: [0.88, 0.72, 0.78], hat: true, hand: 'hoa_sen' },
      { x: 7.4, z: 49.6, yaw: 0, charKey: 'nam', tint: [0.54, 0.64, 0.72], hat: false, scarf: true },
      { x: -7.5, z: 65.8, yaw: Math.PI, charKey: 'nu', tint: [0.82, 0.76, 0.56], hat: true, hand: 'quat' },
      { x: 16.5, z: 65.8, yaw: Math.PI, charKey: 'nu', tint: [0.64, 0.72, 0.80], hat: false, bag: 'tui_sen' },
      { x: 40.5, z: 65.8, yaw: Math.PI, charKey: 'nam', tint: [0.60, 0.52, 0.40], hat: true, hand: 'nhang' }
    ];
    for (const vs of vendorSpecs) {
      const h = CHAR_HEIGHTS[vs.charKey] || 1.64;
      const rec = this.cloneAnimatedCharacter(vs.charKey, h);
      if (!rec) continue;
      if (vs.tint) this.recolorPastelDress(rec.root, vs.tint);
      this.equipNpcProps(rec, vs.charKey, h, vs);
      rec.root.position.set(vs.x, rec.baseY, vs.z);
      rec.root.rotation.y = vs.yaw;
      this.playClipCrossfade(rec, 'Dung', 0.1, false);
      this.exteriorGroup.add(rec.root);
      this.vendorNpcRecords.push(rec);
    }

    // 3. Richly Dressed, Logically Animated Pilgrims & Monks (22 active routes with contextual poses & obstacle-clear paths)
    const wp = (x, z, action = 'pass', wait = 0, lookX = null, lookZ = null) => ({ x, z, action, wait, lookX, lookZ });
    const routes = [
      // --- A. Bustling Market Street & Coach Arrival (Outside Gates z = 44..64) ---
      {
        charKey: 'nu',
        tint: [0.78, 0.66, 0.78],
        hat: true,
        bag: 'tui_sen',
        hand: 'hoa_sen',
        speed: 1.08,
        pts: [
          wp(-22.0, 50.6, 'dung', 2.4, -24.0, 48.2),
          wp(-11.8, 50.8, 'dung', 2.6, -12.0, 48.2),
          wp(2.0, 51.0, 'pass'),
          wp(18.0, 50.8, 'pass'),
          wp(38.5, 49.5, 'pass'),
          wp(39.8, 43.0, 'pass'),
          wp(36.4, 34.0, 'pass'),
          wp(39.5, 43.5, 'pass'),
          wp(14.0, 50.8, 'pass')
        ]
      },
      {
        charKey: 'nam',
        tint: [0.50, 0.62, 0.74],
        scarf: true,
        hand: 'nhang',
        speed: 1.12,
        pts: [
          wp(-6.5, 64.0, 'dung', 2.5, -7.5, 66.8),
          wp(16.5, 63.8, 'dung', 2.2, 16.5, 66.8),
          wp(39.5, 63.5, 'pass'),
          wp(40.5, 51.0, 'pass'),
          wp(16.0, 63.8, 'pass')
        ]
      },
      {
        charKey: 'nu',
        tint: [0.88, 0.68, 0.74],
        bag: 'gio_may',
        hand: 'quat',
        speed: 1.05,
        pts: [
          wp(52.0, 63.6, 'dung', 2.4, 52.0, 66.8),
          wp(28.5, 63.6, 'dung', 2.8, 28.5, 66.8),
          wp(4.5, 63.8, 'dung', 2.2, 4.5, 66.8),
          wp(-28.0, 63.8, 'pass'),
          wp(10.0, 63.6, 'pass')
        ]
      },
      {
        charKey: 'nu',
        tint: [0.64, 0.78, 0.70],
        hat: true,
        bag: 'tui_sen',
        speed: 1.06,
        pts: [
          wp(59.0, 50.6, 'pass'),
          wp(50.2, 50.2, 'dung', 2.2, 50.5, 48.2),
          wp(40.8, 44.5, 'pass'),
          wp(40.6, 40.5, 'pass'),
          wp(42.5, 36.2, 'dung', 2.6, 47.0, 36.2),
          wp(40.6, 41.5, 'pass'),
          wp(52.0, 49.5, 'pass')
        ]
      },
      {
        charKey: 'nam',
        tint: [0.48, 0.44, 0.38],
        bag: 'gio_may',
        speed: 1.04,
        pts: [
          wp(57.0, 50.8, 'pass'),
          wp(41.2, 45.2, 'pass'),
          wp(41.0, 39.5, 'pass'),
          wp(43.2, 35.8, 'dung', 2.4, 47.0, 35.8),
          wp(40.8, 42.5, 'pass'),
          wp(53.0, 50.4, 'pass')
        ]
      },

      // --- B. Cổng Phụ -> Bougainvillea Side Pathway -> Cửa Hông Phải & Quán Thế Âm ---
      {
        charKey: this.charDataCache.nu_ao_lam ? 'nu_ao_lam' : 'nu',
        isMeshyChar: Boolean(this.charDataCache.nu_ao_lam),
        hat: true,
        hand: 'hoa_sen',
        speed: 1.04,
        pts: [
          wp(36.2, 35.0, 'pass'),
          wp(36.0, 23.2, 'chap_tay', 3.4, 33.8, 22.5),
          wp(35.8, 13.0, 'chap_tay', 3.0, 30.2, 11.2),
          wp(36.2, 24.5, 'pass')
        ]
      },
      {
        charKey: this.charDataCache.su_thay ? 'su_thay' : 'nam',
        isMeshyChar: Boolean(this.charDataCache.su_thay),
        monkTone: this.charDataCache.su_thay ? undefined : 0,
        hand: 'beads',
        speed: 1.0,
        pts: [
          wp(35.8, 30.0, 'pass'),
          wp(35.6, 13.4, 'pass'),
          wp(31.2, 11.4, 'chap_tay', 3.2, 23.0, 1.0),
          wp(36.4, 24.0, 'pass')
        ]
      },
      {
        charKey: this.charDataCache.du_khach ? 'du_khach' : 'nu',
        isMeshyChar: Boolean(this.charDataCache.du_khach),
        bag: 'tui_sen',
        hand: 'nhang',
        speed: 1.1,
        pts: [
          wp(40.2, 47.0, 'pass'),
          wp(40.5, 41.5, 'pass'),
          wp(39.0, 34.0, 'pass'),
          wp(36.4, 22.0, 'chap_tay', 2.8, 33.8, 22.5),
          wp(36.4, 15.0, 'pass'),
          wp(39.4, 35.5, 'pass'),
          wp(40.6, 44.0, 'pass')
        ]
      },
      {
        charKey: 'tre_em',
        tint: [0.64, 0.80, 0.90],
        hand: 'hoa_sen',
        speed: 1.18,
        pts: [
          wp(40.8, 46.5, 'pass'),
          wp(40.8, 40.5, 'pass'),
          wp(38.8, 34.5, 'pass'),
          wp(26.8, 33.0, 'dung', 2.2, 14.0, 33.0),
          wp(38.4, 34.5, 'pass'),
          wp(40.8, 42.5, 'pass')
        ]
      },

      // --- C. Central Courtyard, Hồ Sen, Lư Hương & Chánh Điện Plaza ---
      {
        charKey: 'nu',
        tint: [0.88, 0.64, 0.76],
        hat: true,
        bag: 'tui_sen',
        speed: 1.05,
        pts: [
          wp(14.5, 34.0, 'dung', 2.8, 3.5, 33.0),
          wp(18.5, 22.0, 'pass'),
          wp(23.0, 16.5, 'chap_tay', 3.4, 23.0, 12.0),
          wp(28.5, 22.0, 'pass'),
          wp(27.0, 34.5, 'pass')
        ]
      },
      {
        charKey: this.charDataCache.nam_ao_nau ? 'nam_ao_nau' : 'nam',
        isMeshyChar: Boolean(this.charDataCache.nam_ao_nau),
        hand: 'nhang',
        speed: 1.06,
        pts: [
          wp(26.5, 28.0, 'pass'),
          wp(23.8, 17.0, 'chap_tay', 3.6, 23.0, 12.0),
          wp(15.5, 19.0, 'pass'),
          wp(14.2, 31.5, 'dung', 2.4, 3.5, 33.0),
          wp(19.5, 35.5, 'pass')
        ]
      },
      {
        charKey: this.charDataCache.su_thay ? 'su_thay' : 'nam',
        isMeshyChar: Boolean(this.charDataCache.su_thay),
        monkTone: this.charDataCache.su_thay ? undefined : 1,
        hand: 'beads',
        speed: 0.96,
        pts: [
          wp(-2.0, 19.0, 'pass'),
          wp(-2.0, -5.0, 'pass'),
          wp(23.0, 38.0, 'chap_tay', 3.8, 23.0, 27.0),
          wp(-2.5, 6.0, 'pass')
        ]
      },
      {
        charKey: 'nu',
        tint: [0.76, 0.84, 0.72],
        hat: true,
        hand: 'quat',
        speed: 1.02,
        pts: [
          wp(-13.5, 32.0, 'pass'),
          wp(-24.5, 21.8, 'chap_tay', 3.4, -24.5, 4.0),
          wp(-34.5, 26.0, 'pass'),
          wp(-20.0, 35.5, 'pass')
        ]
      },

      // --- D. Expanded West Wing (Vườn Lâm Tỳ Ni · Non Bộ · Vườn La Hán Ngoài Trời) ---
      {
        charKey: this.charDataCache.nu_ao_lam ? 'nu_ao_lam' : 'nu',
        isMeshyChar: Boolean(this.charDataCache.nu_ao_lam),
        hat: true,
        bag: 'gio_may',
        speed: 1.04,
        pts: [
          wp(-36.5, 29.0, 'pass'),
          wp(-46.5, 25.2, 'chap_tay', 3.2, -53.5, 22.0),
          wp(-44.0, 8.0, 'pass'),
          wp(-43.8, -3.5, 'chap_tay', 3.0, -54.0, -4.0),
          wp(-43.5, 16.0, 'pass')
        ]
      },
      {
        charKey: this.charDataCache.nam_ao_nau ? 'nam_ao_nau' : 'nam',
        isMeshyChar: Boolean(this.charDataCache.nam_ao_nau),
        hand: 'hoa_sen',
        speed: 1.08,
        pts: [
          wp(-44.0, 18.0, 'pass'),
          wp(-44.2, -16.0, 'dung', 2.4, -49.5, -18.0),
          wp(-44.0, -32.0, 'pass'),
          wp(-41.0, -10.0, 'pass'),
          wp(-44.0, 6.0, 'pass')
        ]
      },
      {
        charKey: 'tre_em',
        tint: [0.92, 0.76, 0.68],
        speed: 1.15,
        pts: [
          wp(-46.0, 26.5, 'dung', 2.2, -53.5, 22.0),
          wp(-43.5, 14.0, 'pass'),
          wp(-43.8, 1.5, 'dung', 2.4, -54.0, -4.0),
          wp(-44.5, 16.0, 'pass')
        ]
      },

      // --- E. Expanded North Sanctuary (Hồ Phóng Sinh · Tháp Chuông · Phật Niết Bàn · Nhà Tổ) ---
      {
        charKey: 'nam',
        monkTone: 2,
        hand: 'beads',
        speed: 0.96,
        pts: [
          wp(-37.0, -48.0, 'chap_tay', 3.4, -44.0, -56.0),
          wp(-16.0, -46.0, 'dung', 2.8, -16.0, -56.0),
          wp(6.0, -45.5, 'pass'),
          wp(-20.0, -44.5, 'pass')
        ]
      },
      {
        charKey: 'nu',
        tint: [0.80, 0.72, 0.64],
        bag: 'tui_sen',
        hand: 'nhang',
        speed: 1.02,
        pts: [
          wp(22.0, -47.5, 'chap_tay', 3.4, 22.0, -58.0),
          wp(36.0, -45.5, 'pass'),
          wp(0.0, -45.5, 'pass'),
          wp(0.0, -10.5, 'pass'),
          wp(-24.5, -10.5, 'chap_tay', 3.2, -24.5, -24.0),
          wp(-46.0, -10.5, 'pass'),
          wp(-46.0, -45.5, 'pass')
        ]
      },
      {
        charKey: this.charDataCache.du_khach ? 'du_khach' : 'nam',
        isMeshyChar: Boolean(this.charDataCache.du_khach),
        hat: true,
        speed: 1.06,
        pts: [
          wp(40.0, -45.5, 'dung', 2.6, 46.0, -56.0),
          wp(14.0, -45.5, 'pass'),
          wp(-14.0, -45.5, 'dung', 2.8, -16.0, -56.0),
          wp(18.0, -45.5, 'pass')
        ]
      },

      // --- F. Expanded East Wing (Giảng Đường · Lầu Trà Thiền · Vườn Lan) ---
      {
        charKey: 'nu',
        tint: [0.74, 0.82, 0.78],
        bag: 'tui_sen',
        hand: 'quat',
        speed: 1.04,
        pts: [
          wp(50.5, 16.0, 'pass'),
          wp(51.8, -8.0, 'dung', 3.0, 58.0, -12.0),
          wp(51.5, -24.0, 'dung', 2.4, 58.0, -20.0),
          wp(51.2, 2.0, 'pass')
        ]
      },
      {
        charKey: this.charDataCache.su_thay ? 'su_thay' : 'nam',
        isMeshyChar: Boolean(this.charDataCache.su_thay),
        monkTone: this.charDataCache.su_thay ? undefined : 0,
        hand: 'beads',
        speed: 0.98,
        pts: [
          wp(37.5, 4.0, 'pass'),
          wp(37.5, -10.0, 'pass'),
          wp(51.5, -14.0, 'dung', 3.0, 58.0, -12.0),
          wp(49.5, 10.0, 'pass')
        ]
      }
    ];

    for (const rt of routes) {
      const h = CHAR_HEIGHTS[rt.charKey] || 1.64;
      const rec = this.cloneAnimatedCharacter(rt.charKey, h);
      if (!rec) continue;
      if (!rt.isMeshyChar) {
        if (typeof rt.monkTone === 'number') {
          this.recolorMonkRobe(rec.root, rt.monkTone);
        } else if (rt.tint) {
          this.recolorPastelDress(rec.root, rt.tint);
        }
      }
      this.equipNpcProps(rec, rt.charKey, h, rt);
      const p0 = rt.pts[0];
      const p1 = rt.pts[1] || p0;
      const initYaw = Math.atan2(p1.x - p0.x, p1.z - p0.z);
      rec.root.position.set(p0.x, rec.baseY, p0.z);
      rec.root.rotation.y = initYaw;
      this.playClipCrossfade(rec, 'Di bo', 0.1, false);
      this.exteriorGroup.add(rec.root);
      this.riggedNpcRecords.push({
        rec,
        pts: rt.pts,
        idx: 1,
        speed: rt.speed,
        pauseTimer: Math.random() * 0.8,
        yaw: initYaw,
        state: 'walk',
        pauseClip: 'Dung',
        lookX: null,
        lookZ: null
      });
    }
  }

  spawnInteriorWorshippersV8() {
    // Rigged GLB worshippers inside Top-Edge Chính Điện, Right Shrine Gallery, Tổ Đường, Hồ Sen Bộ & Trai Đường
    const kneelingSpots = [
      { charKey: 'nu', x: -1.95, z: -13.85, yaw: Math.PI, tint: [0.84, 0.60, 0.70] },
      { charKey: 'nam', x: 1.95, z: -13.85, yaw: Math.PI, monkTone: 0 },
      { charKey: 'nu', x: 16.2, z: 15.65, yaw: Math.PI / 2, tint: [0.76, 0.78, 0.86] },
      { charKey: 'tre_em', x: 16.1, z: 9.85, yaw: Math.PI / 2, tint: [0.62, 0.74, 0.84] },
      { charKey: 'nam', x: -13.6, z: -15.6, yaw: Math.PI, monkTone: 1 }
    ];
    for (const sp of kneelingSpots) {
      if (this.propMeshCache.bo_doan) {
        const mat = this.fitProp(this.propMeshCache.bo_doan, 0.88);
        mat.position.set(sp.x, 0.01, sp.z);
        this.interiorGroup.add(mat);
      } else {
        const cushion = this.makeKneelingCushion();
        cushion.position.set(sp.x, 0, sp.z);
        this.interiorGroup.add(cushion);
      }
      const h = CHAR_HEIGHTS[sp.charKey] || 1.64;
      const rec = this.cloneAnimatedCharacter(sp.charKey, h);
      if (!rec) continue;
      if (typeof sp.monkTone === 'number') {
        this.recolorMonkRobe(rec.root, sp.monkTone);
      } else if (sp.tint) {
        this.recolorPastelDress(rec.root, sp.tint);
      }
      rec.root.position.set(sp.x, rec.baseY + 0.06, sp.z);
      rec.root.rotation.y = sp.yaw;
      this.playClipCrossfade(rec, 'Quỳ', 0.05);
      if (rec.activeAction) {
        rec.mixer.setTime(2.6);
        rec.mixer.update(0);
        rec.activeAction.paused = true;
      }
      this.interiorGroup.add(rec.root);
      this.interiorKneelingRecords.push(rec);
    }

    const standingInterior = [
      { charKey: 'nu', x: -6.8, z: 2.2, yaw: Math.PI / 2, pose: 'Chắp tay', tint: [0.9, 0.84, 0.72], elev: 0 },
      { charKey: 'nam', x: 6.8, z: -2.0, yaw: -Math.PI / 2, pose: 'Dung', monkTone: 0, elev: 0 },
      { charKey: 'nu', x: 21.8, z: 2.8, yaw: Math.PI * 0.42, pose: 'Dung', tint: [0.88, 0.66, 0.74], elev: 0 },
      { charKey: 'nam', x: 27.1, z: 4.4, yaw: -Math.PI / 2, pose: 'Dung', monkTone: 1, elev: 0 }
    ];
    for (const sp of standingInterior) {
      const h = CHAR_HEIGHTS[sp.charKey] || 1.64;
      const rec = this.cloneAnimatedCharacter(sp.charKey, h);
      if (!rec) continue;
      if (typeof sp.monkTone === 'number') {
        this.recolorMonkRobe(rec.root, sp.monkTone);
      } else if (sp.tint) {
        this.recolorPastelDress(rec.root, sp.tint);
      }
      rec.root.position.set(sp.x, rec.baseY + (sp.elev || 0), sp.z);
      rec.root.rotation.y = sp.yaw;
      this.playClipCrossfade(rec, sp.pose, 0.05);
      this.interiorGroup.add(rec.root);
      this.interiorKneelingRecords.push(rec);
    }
  }

  tryMove(nx, nz, radius = 0.42) {
    const curX = this.playerState.x;
    const curZ = this.playerState.z;
    let bounds;
    if (this.inInterior) {
      bounds = {
        minX: -20.1,
        maxX: 32.3,
        minZ: -20.1,
        maxZ: 20.35
      };
    } else {
      bounds = WORLD_BOUNDS;
    }
    let x = Math.max(bounds.minX, Math.min(bounds.maxX, nx));
    let z = Math.max(bounds.minZ, Math.min(bounds.maxZ, nz));

    const circles = this.inInterior ? this.interiorObstacles : this.obstacles;
    const rects = this.inInterior ? this.interiorRectObstacles : this.rectObstacles;

    for (const c of circles) {
      const dx = x - c.x;
      const dz = z - c.z;
      const dist = Math.hypot(dx, dz);
      const minD = c.r + radius;
      if (dist < minD) {
        const prevDist = Math.hypot(curX - c.x, curZ - c.z);
        if (prevDist < minD && dist > prevDist) {
          continue;
        }
        const nLen = dist || 0.001;
        x = c.x + (dx / nLen) * minD;
        z = c.z + (dz / nLen) * minD;
      }
    }

    for (const b of rects) {
      if (
        x > b.minX - radius &&
        x < b.maxX + radius &&
        z > b.minZ - radius &&
        z < b.maxZ + radius
      ) {
        const prevInside =
          curX > b.minX - radius &&
          curX < b.maxX + radius &&
          curZ > b.minZ - radius &&
          curZ < b.maxZ + radius;
        if (prevInside) continue;
        const canX = !(
          x > b.minX - radius &&
          x < b.maxX + radius &&
          curZ > b.minZ - radius &&
          curZ < b.maxZ + radius
        );
        const canZ = !(
          curX > b.minX - radius &&
          curX < b.maxX + radius &&
          z > b.minZ - radius &&
          z < b.maxZ + radius
        );
        if (canX) z = curZ;
        else if (canZ) x = curX;
        else {
          x = curX;
          z = curZ;
        }
      }
    }

    if (this.inInterior) {
      this.playerElevationY = 0;
    } else if (x >= 54.4 && x <= 64.6 && z >= 7.6 && z <= 21.4) {
      this.playerElevationY = 1.14;
    } else if (x >= 52.0 && x < 54.4 && z >= 12.6 && z <= 16.4) {
      this.playerElevationY = ((x - 52.0) / 2.4) * 1.14;
    } else {
      this.playerElevationY = 0;
    }

    return { x, z };
  }

  lerpAngle(a, b, t) {
    let diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (diff < -Math.PI) diff += Math.PI * 2;
    return a + diff * Math.min(1, t);
  }

  buildPerimeterSafeWaypoints(fromX, fromZ, toX, toZ, via = null, lookAt = null) {
    const pts = [];
    const curOutside = fromZ > 42.1;
    const destInside = toZ < 40.9;
    const curInside = fromZ < 40.9;
    const destOutside = toZ > 42.1;

    if (curOutside && destInside) {
      if (Math.hypot(fromX - 40.5, fromZ - 45.2) > 1.8) pts.push({ x: 40.5, z: 45.2 });
      pts.push({ x: 40.5, z: 41.5 });
      pts.push({ x: 39.2, z: 35.8 });
    } else if (curInside && destOutside) {
      if (Math.hypot(fromX - 39.2, fromZ - 35.8) > 1.8) pts.push({ x: 39.2, z: 35.8 });
      pts.push({ x: 40.5, z: 41.5 });
      pts.push({ x: 40.5, z: 45.2 });
    }

    if (Array.isArray(via)) {
      const distToDest = Math.hypot(toX - fromX, toZ - fromZ);
      for (const [vx, vz] of via) {
        if ((vx === 40.5 && vz === 41.5) && pts.some((p) => p.x === 40.5 && p.z === 41.5)) {
          continue;
        }
        const lastPt = pts.length ? pts[pts.length - 1] : { x: fromX, z: fromZ };
        const dFromLast = Math.hypot(vx - lastPt.x, vz - lastPt.z);
        const wpToDest = Math.hypot(toX - vx, toZ - vz);
        if (dFromLast > 1.6 && (pts.length > 0 || wpToDest < distToDest - 1.2)) {
          pts.push({ x: vx, z: vz });
        }
      }
    }
    pts.push({ x: toX, z: toZ, lookAt });
    return pts;
  }

  walkToStation(stationOrId, onArrival = null) {
    this.cancelEntranceTour();
    const st =
      typeof stationOrId === 'object'
        ? stationOrId
        : findAnyTempleDestination(stationOrId);
    if (!st) return;

    if (this.inInterior) {
      this.toggleInterior(false, this.lastDoorSide);
    }

    const tx = st.standPos ? st.standPos.x : st.pos.x;
    const tz = st.standPos ? st.standPos.z : st.pos.z;
    const pts = this.buildPerimeterSafeWaypoints(
      this.playerState.x,
      this.playerState.z,
      tx,
      tz,
      st.via,
      st.lookAt
    );

    this.autoWalkWaypoints = pts;
    this.autoWalkCallback = onArrival;
    this.autoWalkStation = st;
    this.walkTargetRing.position.set(tx, 0.06, tz);
    this.walkTargetRing.visible = true;
    this.updateWalkPathLine();
    this.onAutoWalkTargetChange(st);
  }

  cancelAutoWalk() {
    if (this.autoWalkWaypoints.length > 0 || this.autoWalkStation) {
      this.autoWalkWaypoints = [];
      this.autoWalkCallback = null;
      this.autoWalkStation = null;
      if (this.walkTargetRing) this.walkTargetRing.visible = false;
      if (this.walkPathLine) this.walkPathLine.visible = false;
      this.onAutoWalkTargetChange(null);
    }
  }

  updateWalkPathLine() {
    if (this.walkPathLine) {
      this.scene.remove(this.walkPathLine);
      this.walkPathLine.geometry.dispose();
      this.walkPathLine = null;
    }
    if (!this.autoWalkWaypoints.length) return;
    const points = [new THREE.Vector3(this.playerState.x, 0.08, this.playerState.z)];
    for (const wp of this.autoWalkWaypoints) {
      points.push(new THREE.Vector3(wp.x, 0.08, wp.z));
    }
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: 0xFFD166, transparent: true, opacity: 0.85 });
    this.walkPathLine = new THREE.Line(geom, mat);
    this.scene.add(this.walkPathLine);
  }

  moveStep(dx, dz, speed = 0.22) {
    if (dx !== 0 || dz !== 0) {
      this.cancelEntranceTour();
      this.cancelAutoWalk();
    }
    const len = Math.hypot(dx, dz);
    if (len < 0.001) {
      this.playerState.moving = false;
      return this.playerState;
    }
    const nx = dx / len;
    const nz = dz / len;
    const targetX = this.playerState.x + nx * speed;
    const targetZ = this.playerState.z + nz * speed;
    const moved = this.tryMove(targetX, targetZ);
    this.playerState.x = moved.x;
    this.playerState.z = moved.z;
    const targetYaw = Math.atan2(nx, nz);
    this.playerState.yaw = this.lerpAngle(this.playerState.yaw, targetYaw, 0.32);
    this.playerState.moving = true;
    clearTimeout(this._nudgeStopTimer);
    this._nudgeStopTimer = setTimeout(() => {
      if (this.heldDirs.size === 0 && this.autoWalkWaypoints.length === 0) {
        this.playerState.moving = false;
      }
    }, 360);
    this.syncPlayerTransform();
    this.checkStationProximity();
    this.checkInteriorDoorTransition();
    return this.playerState;
  }

  updateHeldMovement(dt) {
    if (!this.heldDirs || this.heldDirs.size === 0) return;
    let ix = 0;
    let iz = 0;
    if (this.heldDirs.has('up')) iz -= 1;
    if (this.heldDirs.has('down')) iz += 1;
    if (this.heldDirs.has('left')) ix -= 1;
    if (this.heldDirs.has('right')) ix += 1;
    if (ix === 0 && iz === 0) return;

    const len = Math.hypot(ix, iz) || 1;
    ix /= len;
    iz /= len;

    const angle = this.cameraBaseYaw + this.cameraAzimuthOffset;
    const forwardX = Math.sin(angle);
    const forwardZ = Math.cos(angle);
    const rightX = -forwardZ;
    const rightZ = forwardX;

    const worldDx = forwardX * (-iz) + rightX * ix;
    const worldDz = forwardZ * (-iz) + rightZ * ix;
    const speed = 5.4 * dt;
    const moved = this.tryMove(
      this.playerState.x + worldDx * speed,
      this.playerState.z + worldDz * speed
    );
    this.playerState.x = moved.x;
    this.playerState.z = moved.z;
    this.playerState.yaw = this.lerpAngle(
      this.playerState.yaw,
      Math.atan2(worldDx, worldDz),
      Math.min(1, dt * 12)
    );
    this.playerState.moving = true;
    this.syncPlayerTransform();
    this.checkStationProximity();
    this.checkInteriorDoorTransition();
  }

  checkInteriorDoorTransition() {
    if (this.interiorTransition || performance.now() < (this._doorCooldownUntil || 0)) return;
    const px = this.playerState.x;
    const pz = this.playerState.z;
    if (this.inInterior) {
      if (px >= 13.5 && px <= 17.5 && pz >= 19.65) {
        this.exitInteriorGradual('right');
      }
    } else {
      // Stepping onto the End-of-Road Left-Turn Shoe-Removal Veranda & Wooden Door (x = 34.4..37.2, z = -17.2..-11.8)
      if (pz >= -17.2 && pz <= -11.8 && px >= 34.2 && px <= 37.0) {
        this.enterInteriorGradual('right');
      }
    }
  }

  stopMoving() {
    if (this.autoWalkWaypoints.length === 0 && this.heldDirs.size === 0) {
      this.playerState.moving = false;
    }
  }

  teleportToStation(stationId) {
    this.cancelEntranceTour();
    const st = findAnyTempleDestination(stationId);
    if (!st) return;
    this.cancelAutoWalk();
    if (this.inInterior) this.toggleInterior(false, this.lastDoorSide);
    const sx = st.standPos ? st.standPos.x : st.pos.x;
    const sz = st.standPos ? st.standPos.z : st.pos.z;
    this.playerState.x = sx;
    this.playerState.z = sz;
    if (st.lookAt) {
      this.playerState.yaw = Math.atan2(st.lookAt.x - sx, st.lookAt.z - sz);
      this.cameraBaseYaw = this.playerState.yaw;
      this.cameraAzimuthOffset = 0;
    }
    this.playerState.moving = false;
    this.currentStationId = st.id;
    this.syncPlayerTransform();
    this.checkStationProximity();
    this.onStationProximity(st, 0);
  }

  walkToPoint(x, z, label = '') {
    const tx = Number(x);
    const tz = Number(z);
    if (!Number.isFinite(tx) || !Number.isFinite(tz)) return;
    this.cancelEntranceTour();
    if (this.inInterior) {
      this.toggleInterior(false, this.lastDoorSide);
    }
    const pts = this.buildPerimeterSafeWaypoints(
      this.playerState.x,
      this.playerState.z,
      tx,
      tz,
      null,
      { x: tx, y: 1.2, z: tz }
    );
    this.autoWalkWaypoints = pts;
    this.autoWalkCallback = null;
    this.autoWalkStation = label ? { name: label, key: 'walk_point' } : null;
    if (this.walkTargetRing) {
      this.walkTargetRing.position.set(tx, 0.06, tz);
      this.walkTargetRing.visible = true;
    }
    this.updateWalkPathLine();
    this.onAutoWalkTargetChange(this.autoWalkStation);
  }

  setLectureHallMode(enabled = false) {
    const next = Boolean(enabled);
    if (this.lectureHallMode === next) return;
    this.lectureHallMode = next;
    if (!next) {
      this.renderFrame();
    }
  }

  setTimeOfDay(presetKey = 'morning', immediate = false) {
    const key = ['morning', 'midday', 'evening'].includes(presetKey) ? presetKey : 'morning';
    this.timeOfDay = key;

    const cfg =
      key === 'evening'
        ? {
            bg: 0x111E3B,
            fogColor: 0x15223D,
            fogDensity: 0.0046,
            hemiSky: 0x4A639E,
            hemiGround: 0x261E18,
            hemiIntensity: 0.72,
            sunColor: 0x9BB5EA,
            sunIntensity: 0.78,
            sunPos: [26, 34, -22],
            fillColor: 0xFFB86C,
            fillIntensity: 0.42,
            exposure: 0.98,
            lanternEmissive: 1.55,
            porchIntensity: 7.4,
            interiorBoost: 1.32
          }
        : key === 'midday'
        ? {
            bg: 0x8FC7F6,
            fogColor: 0xDCEBFA,
            fogDensity: 0.0022,
            hemiSky: 0xDFF2FF,
            hemiGround: 0x8C7052,
            hemiIntensity: 1.32,
            sunColor: 0xFFF6E0,
            sunIntensity: 2.15,
            sunPos: [10, 56, 18],
            fillColor: 0xFFFFFF,
            fillIntensity: 0.62,
            exposure: 1.12,
            lanternEmissive: 0.18,
            porchIntensity: 2.0,
            interiorBoost: 1.0
          }
        : {
            bg: 0xA6D0F0,
            fogColor: 0xEADBC4,
            fogDensity: 0.0033,
            hemiSky: 0xBFE2FF,
            hemiGround: 0x7A5E3E,
            hemiIntensity: 1.18,
            sunColor: 0xFFD99E,
            sunIntensity: 1.82,
            sunPos: [-34, 24, 24],
            fillColor: 0xFFF3D8,
            fillIntensity: 0.48,
            exposure: 1.08,
            lanternEmissive: 0.55,
            porchIntensity: 4.8,
            interiorBoost: 1.0
          };

    if (this.scene.background?.setHex) this.scene.background.setHex(cfg.bg);
    if (this.scene.fog) {
      this.scene.fog.color?.setHex(cfg.fogColor);
      this.scene.fog.density = cfg.fogDensity;
    }
    if (this.hemiLight) {
      this.hemiLight.color.setHex(cfg.hemiSky);
      this.hemiLight.groundColor.setHex(cfg.hemiGround);
      this.hemiLight.intensity = cfg.hemiIntensity;
    }
    if (this.sunLight) {
      this.sunLight.color.setHex(cfg.sunColor);
      this.sunLight.intensity = cfg.sunIntensity;
      this.sunLight.position.set(cfg.sunPos[0], cfg.sunPos[1], cfg.sunPos[2]);
    }
    if (this.frontFillLight) {
      this.frontFillLight.color.setHex(cfg.fillColor);
      this.frontFillLight.intensity = cfg.fillIntensity;
    }
    if (this.renderer) {
      this.renderer.toneMappingExposure = cfg.exposure;
    }
    if (this.skyDome?.material) {
      const nextSky = this._buildSkyTextureForPreset(key);
      if (this.skyDome.material.map !== nextSky) {
        this.skyDome.material.map = nextSky;
        this.skyDome.material.needsUpdate = true;
      }
    }
    if (this.MAT?.lanternGlow) {
      this.MAT.lanternGlow.emissiveIntensity = cfg.lanternEmissive;
    }
    if (this.porchGlowLight) {
      this.porchGlowLight.intensity = cfg.porchIntensity;
    }
    this.interiorGroup?.traverse?.((o) => {
      if (o.isPointLight) {
        if (typeof o.userData.baseIntensity !== 'number') {
          o.userData.baseIntensity = o.intensity;
        }
        o.intensity = o.userData.baseIntensity * cfg.interiorBoost;
      }
    });
    if (this.exteriorEnvTex && (!this.inInterior || this.interiorCutaway)) {
      this.scene.environment = this.exteriorEnvTex;
    }
    if (this.inInterior && !this.interiorCutaway) {
      this.applyInteriorAtmosphere();
    }
    if (immediate || !this.lectureHallMode) {
      this.renderFrame();
    }
  }

  applyInteriorAtmosphere() {
    if (!this.inInterior || this.interiorCutaway) return;
    if (this.interiorEnvTex) {
      this.scene.environment = this.interiorEnvTex;
    }
    if (this.scene.background?.setHex) this.scene.background.setHex(0x1C110A);
    if (this.scene.fog) {
      this.scene.fog.color?.setHex(0x2B1A0F);
      this.scene.fog.density = 0.0028;
    }
    if (this.hemiLight) {
      this.hemiLight.color.setHex(0xFFE0B8);
      this.hemiLight.groundColor.setHex(0x6B462B);
      this.hemiLight.intensity = 1.05;
    }
    if (this.sunLight) {
      this.sunLight.color.setHex(0xFFE6BD);
      this.sunLight.intensity = 0.62;
      this.sunLight.position.set(2, 46, 2);
    }
    if (this.frontFillLight) {
      this.frontFillLight.color.setHex(0xFFC98B);
      this.frontFillLight.intensity = 0.32;
    }
    if (this.renderer) {
      this.renderer.toneMappingExposure = 1.04;
    }
  }

  syncBlessingTowerLamps(entries = []) {
    if (!Array.isArray(this.blessingTowerLampMeshes) || !this.blessingTowerLampMeshes.length) return;
    const bySlot = new Map();
    for (const item of Array.isArray(entries) ? entries : []) {
      const slot = Number(item?.slotNumber);
      if (Number.isFinite(slot) && slot >= 1 && slot <= 108 && !bySlot.has(slot)) {
        bySlot.set(slot, item);
      }
    }
    for (let i = 0; i < this.blessingTowerLampMeshes.length; i++) {
      const mesh = this.blessingTowerLampMeshes[i];
      const slot = mesh.userData?.slotNumber || i + 1;
      const entry = bySlot.get(slot);
      if (!mesh.material) continue;
      if (entry) {
        mesh.material.color.setHex(0xFFF3BA);
        mesh.material.emissive.set(entry.colorHex || '#FFA733');
        mesh.material.emissiveIntensity = 1.68;
        mesh.scale.set(1.06, 1.44, 0.66);
      } else {
        mesh.material.color.setHex(0xD89E5C);
        mesh.material.emissive.setHex(0x7A3212);
        mesh.material.emissiveIntensity = 0.32;
        mesh.scale.set(0.92, 1.28, 0.52);
      }
    }
    this.renderFrame();
  }

  setGuidedBeacon(stationKey = null) {
    this.guidedBeaconKey = stationKey || null;
    if (!stationKey) {
      if (this.guidedBeaconGroup) this.guidedBeaconGroup.visible = false;
      this.renderFrame();
      return;
    }
    const dest = findAnyTempleDestination(stationKey);
    if (!dest?.pos) {
      if (this.guidedBeaconGroup) this.guidedBeaconGroup.visible = false;
      return;
    }
    if (!this.guidedBeaconGroup) {
      const grp = new THREE.Group();
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.72, 26, 16, 1, true),
        new THREE.MeshBasicMaterial({
          color: 0xFFD966,
          transparent: true,
          opacity: 0.34,
          side: THREE.DoubleSide,
          depthWrite: false
        })
      );
      beam.position.y = 13.0;
      grp.add(beam);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.95, 1.38, 32),
        new THREE.MeshBasicMaterial({
          color: 0xFFE382,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.08;
      grp.add(ring);

      const diamond = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.55, 0),
        new THREE.MeshBasicMaterial({ color: 0xFFE27A })
      );
      diamond.position.y = 5.2;
      grp.add(diamond);
      grp.userData.diamond = diamond;
      this.guidedBeaconGroup = grp;
      this.exteriorGroup.add(grp);
    }
    const sx = dest.standPos ? dest.standPos.x : dest.pos.x;
    const sz = dest.standPos ? dest.standPos.z : dest.pos.z;
    this.guidedBeaconGroup.position.set(sx, 0, sz);
    this.guidedBeaconGroup.visible = true;
    this.renderFrame();
  }

  focusInteriorArhat(arhatIdx = 0) {
    const idx = Math.max(0, Math.min(17, Number(arhatIdx) || 0));
    const ax = -18.5;
    const az = -11.9 + idx * 1.5;
    if (!this.inInterior) {
      this.toggleInterior(true, 'right');
    }
    this.ensureInteriorAssetsLoaded().catch(() => {});
    this.cancelAutoWalk();
    this.playerElevationY = 0;
    const px = -15.0;
    const pz = az;
    const yaw = Math.atan2(ax - px, az - pz);
    this.playerState.x = px;
    this.playerState.z = pz;
    this.playerState.yaw = yaw;
    this.playerState.moving = false;
    this.cameraBaseYaw = yaw;
    this.cameraAzimuthOffset = 0;
    this.syncPlayerTransform();
    this.renderFrame();
    const zKey = this.getInteriorZoneKey();
    this._lastInteriorZone = zKey;
    this.onInteriorZoneChange(zKey);
  }

  enterInteriorGradual(side = 'right', onEntered = null) {
    this.cancelEntranceTour();
    this.ensureInteriorAssetsLoaded().catch(() => {});
    if (this.inInterior) {
      if (typeof onEntered === 'function') onEntered();
      return true;
    }
    this.lastDoorSide = 'right';
    // Walk straight down the cool tree-shaded lane (x = 40.5) to the end of the road (z = -14.5),
    // then turn LEFT (-X) onto the Shoe-Removal Veranda (x = 37.8 -> 35.6) and step through the wooden door!
    const verandaApproachX = 38.2;
    const verandaZ = -14.5;
    const dist = Math.hypot(this.playerState.x - verandaApproachX, this.playerState.z - verandaZ);

    const startApproach = () => {
      this.cancelAutoWalk();
      this.interiorTransition = {
        phase: 'climb_side_door',
        side: 'right',
        timer: 0,
        duration: 0.68,
        startX: this.playerState.x,
        startZ: this.playerState.z,
        targetX: 35.6,
        targetZ: verandaZ,
        onEntered
      };
      this.playerState.moving = true;
      this.playerState.yaw = -Math.PI * 0.5;
    };

    if (dist > 3.6) {
      const pts = this.buildPerimeterSafeWaypoints(
        this.playerState.x,
        this.playerState.z,
        verandaApproachX,
        verandaZ,
        [
          [40.5, 32.0],
          [40.5, 8.0],
          [40.5, -14.5]
        ],
        { x: 35.2, y: 2.2, z: verandaZ }
      );
      this.autoWalkWaypoints = pts;
      this.autoWalkCallback = () => startApproach();
      this.autoWalkStation = { name: 'Cuối đường rẽ trái · Hiên bỏ dép vào Chánh điện', key: 'chanh_dien' };
      if (this.walkTargetRing) {
        this.walkTargetRing.position.set(verandaApproachX, 0.06, verandaZ);
        this.walkTargetRing.visible = true;
      }
      this.updateWalkPathLine();
      this.onAutoWalkTargetChange(this.autoWalkStation);
    } else {
      startApproach();
    }
    return true;
  }

  exitInteriorGradual(side = null) {
    if (!this.inInterior) return false;
    this.cancelAutoWalk();
    if (side === 'left' || side === 'right') {
      this.lastDoorSide = side;
    }
    this._doorCooldownUntil = performance.now() + 2400;
    this.onTransitionFade(true);
    this.interiorTransition = {
      phase: 'exit_veil',
      side: this.lastDoorSide || 'right',
      timer: 0,
      duration: 0.22
    };
    return false;
  }

  setInteriorCutaway(enabled = null) {
    this.onTransitionFade(false);
    const next = enabled !== null ? Boolean(enabled) : !this.interiorCutaway;
    this.interiorCutaway = next;
    for (let i = 0; i < this.cutawayTargets.length; i++) {
      const obj = this.cutawayTargets[i];
      if (obj) obj.visible = !next;
    }
    if (this.inInterior) {
      if (next) {
        this.setTimeOfDay(this.timeOfDay, false);
      } else {
        this.applyInteriorAtmosphere();
      }
    }
    this.syncPlayerTransform();
    this.renderFrame();
    return this.interiorCutaway;
  }

  toggleInterior(enter, side = null) {
    this.cancelEntranceTour();
    this.cancelAutoWalk();
    this.interiorTransition = null;
    this.onTransitionFade(false);
    if (side === 'left' || side === 'right') {
      this.lastDoorSide = side;
    }
    this._doorCooldownUntil = performance.now() + 2200;
    this.inInterior = Boolean(enter ?? !this.inInterior);
    if (this.inInterior) {
      this.ensureInteriorAssetsLoaded().catch(() => {});
    }
    this.exteriorGroup.visible = !this.inInterior;
    this.interiorGroup.visible = this.inInterior;
    this.playerElevationY = 0;
    if (!this.inInterior && this.interiorCutaway) {
      this.setInteriorCutaway(false);
    }
    if (this.inInterior) {
      this.applyInteriorAtmosphere();
      this.playerState.x = 14.5;
      this.playerState.z = 16.0;
      const startYaw = Math.PI - 0.34;
      this.playerState.yaw = startYaw;
      this.cameraBaseYaw = startYaw;
    } else {
      this.setTimeOfDay(this.timeOfDay, false);
      this.playerState.x = 38.8;
      this.playerState.z = -14.5;
      this.playerState.yaw = Math.PI * 0.5;
      this.cameraBaseYaw = Math.PI * 0.5;
    }
    this.cameraAzimuthOffset = 0;
    this.syncPlayerTransform();
    if (this.inInterior) {
      this.nearestStallTrigger = null;
      this.onStallProximity(null);
      this.checkStationProximity();
    } else {
      this.checkStationProximity();
    }
    this.onInteriorStateChange(this.inInterior);
    this.renderFrame();
    return this.inInterior;
  }

  normalizeInteriorZoneKey(zoneKey = 'day_ban_tho_phai') {
    if (zoneKey === 'tien_duong') return 'day_ban_tho_phai';
    if (zoneKey === 'chanh_dien_noi_that') return 'chanh_dien';
    if (zoneKey === 'san_thien_tinh_1' || zoneKey === 'san_thien_tinh_2' || zoneKey === 'non_bo_giua') {
      return 'ho_sen_bo';
    }
    if (zoneKey === 'nha_to' || zoneKey === 'khu_tho') return 'hanh_lang_trai';
    if (zoneKey === 'nha_hau') return 'hanh_lang_duoi';
    return zoneKey;
  }

  getInteriorZoneKey() {
    if (!this.inInterior) return 'exterior';
    const px = this.playerState.x;
    const pz = this.playerState.z;
    if (px > 20.4) return 'trai_duong';
    if (Math.abs(px) < 10.6 && Math.abs(pz) < 10.6) return 'ho_sen_bo';
    if (pz <= -10.8 && px > -11.5 && px < 12.2) return 'chanh_dien';
    if (px >= 10.6) return 'day_ban_tho_phai';
    if (px <= -10.6 && pz < 14.5) return 'hanh_lang_trai';
    return 'hanh_lang_duoi';
  }

  goToInteriorZone(rawZoneKey = 'day_ban_tho_phai') {
    const zoneKey = this.normalizeInteriorZoneKey(rawZoneKey);
    if (!this.inInterior) {
      this.toggleInterior(true, 'right');
    }
    this.ensureInteriorAssetsLoaded().catch(() => {});
    this.cancelAutoWalk();
    this.playerElevationY = 0;
    if (zoneKey === 'day_ban_tho_phai') {
      this.playerState.x = 14.5;
      this.playerState.z = 16.0;
      const yaw = Math.PI - 0.34;
      this.playerState.yaw = yaw;
      this.cameraBaseYaw = yaw;
    } else if (zoneKey === 'nghin_mat_nghin_tay') {
      this.playerState.x = 14.6;
      this.playerState.z = 14.8;
      this.playerState.yaw = Math.PI / 2;
      this.cameraBaseYaw = Math.PI / 2;
    } else if (zoneKey === 'cho_ngu_cua_phat') {
      this.playerState.x = 14.4;
      this.playerState.z = 9.0;
      this.playerState.yaw = Math.PI / 2;
      this.cameraBaseYaw = Math.PI / 2;
    } else if (zoneKey === 'ho_sen_bo') {
      this.playerState.x = -5.4;
      this.playerState.z = 6.8;
      const lookYaw = Math.atan2(0 - -5.4, 0 - 6.8);
      this.playerState.yaw = lookYaw;
      this.cameraBaseYaw = lookYaw;
    } else if (zoneKey === 'hanh_lang_trai') {
      this.playerState.x = -14.8;
      this.playerState.z = -14.2;
      const yaw = Math.PI;
      this.playerState.yaw = yaw;
      this.cameraBaseYaw = yaw;
    } else if (zoneKey === 'hanh_lang_duoi') {
      this.playerState.x = -4.2;
      this.playerState.z = 14.8;
      const yaw = -0.22;
      this.playerState.yaw = yaw;
      this.cameraBaseYaw = yaw;
    } else if (zoneKey === 'trai_duong') {
      this.playerState.x = 22.8;
      this.playerState.z = 5.8;
      this.playerElevationY = 0;
      this.playerState.yaw = Math.PI * 0.42;
      this.cameraBaseYaw = Math.PI * 0.42;
    } else {
      // Top Edge of Square = Chính Điện Lễ Phật
      this.playerState.x = 0.0;
      this.playerState.z = -13.85;
      this.playerState.yaw = Math.PI;
      this.cameraBaseYaw = Math.PI;
    }
    this.playerState.moving = false;
    this.cameraAzimuthOffset = 0;
    this.syncPlayerTransform();
    this.renderFrame();
    const zKey = this.getInteriorZoneKey();
    this._lastInteriorZone = zKey;
    this.onInteriorZoneChange(zKey);
    return zKey;
  }

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
  }

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
  }

  addLotusOfferingVisual() {
    const fl = this.makeLotusFlower3D(false, true);
    fl.scale.setScalar(1.85);
    const c = this.offeredLotusesGroup.children.length;
    fl.position.set(((c % 4) - 1.5) * 0.65, 0.06, (Math.floor(c / 4) - 1) * 0.65);
    if (this.pondLotusAnims.length > 0) {
      this.pondLotusAnims[this.pondLotusAnims.length - 1].baseScale = 1.85;
    }
    this.offeredLotusesGroup.add(fl);
  }

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
  }

  updateEquippedItems(equipped = {}) {
    this.lastEquippedState = equipped;
    this.syncRiggedPlayerWearables();
    this.renderFrame();
  }

  applyStoreVisualsToPlayer(storeVisual = {}) {
    this.activeStorePreview = storeVisual;
    this.syncRiggedPlayerWearables();
    this.renderFrame();
  }

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
      const maxCamX = px > 20.2 ? 31.4 : 20.05;
      cx = Math.max(-20.05, Math.min(maxCamX, cx));
      cz = Math.max(-20.05, Math.min(20.05, cz));
      // Keep camera inside the active gallery corridor so courtyard balustrades (±10.6) & lattice doors (-11.55) never occlude altars
      if (px > 10.9 && px <= 20.4 && Math.abs(pz) < 10.4 && cx < 11.15) {
        cx = 11.15;
      } else if (px > 10.9 && px <= 20.4 && pz >= 10.4 && cx < 11.15 && Math.sin(lookAngle) > 0.35) {
        cx = 11.15;
      } else if (px < -10.9 && cx > -11.15 && Math.sin(lookAngle) < -0.35) {
        cx = -11.15;
      }
      if (pz < -11.75 && Math.abs(px) < 10.2 && cz > -11.88) {
        cz = -11.88;
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
  }

  checkStationProximity() {
    if (this.inInterior) {
      if (this.nearestStallTrigger) {
        this.nearestStallTrigger = null;
        this.onStallProximity(null);
      }
      const px = this.playerState.x;
      const pz = this.playerState.z;
      let intPrompt = null;
      if (Math.hypot(px - 16.2, pz - 14.8) <= 3.2) {
        intPrompt = {
          kind: 'nghin_mat_nghin_tay',
          label: '🙏 [E] Chiêm Bái Tượng Phật Nghìn Mắt Nghìn Tay'
        };
      } else if (Math.hypot(px - 16.0, pz - 9.0) <= 3.2) {
        intPrompt = {
          kind: 'cho_ngu_cua_phat',
          label: '🪷 [E] Chiêm Bái Chỗ Ngủ Của Phật · Phật Nhập Niết Bàn'
        };
      } else if (Math.hypot(px - -3.35, pz - -11.95) <= 3.85) {
        intPrompt = {
          kind: 'blessing_tower',
          label: '🏮 [E] Tháp Đèn Cầu An · Ghi Tên Cầu Phước'
        };
      } else if (
        Math.hypot(px - 6.8, pz - -13.6) <= 2.85 ||
        Math.hypot(px - 2.65, pz - -14.5) <= 2.45
      ) {
        intPrompt = {
          kind: 'chanh_dien_bell',
          label: '🔔 [E] Thỉnh Đại Hồng Chung · Chuông Gia Trì'
        };
      } else if (
        Math.hypot(px - -6.8, pz - -13.6) <= 2.85 ||
        Math.hypot(px - -2.65, pz - -14.5) <= 2.45
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
  }

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
  }

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
            title: '🍚 Nhà Sàn Gỗ Trai Đường · Khu Ăn Phật Tử',
            desc: 'Không gian thọ trai dựng bằng gỗ căm xe trên hệ sàn cọc miền Tây nối trực tiếp từ dải hành lang phải, phục vụ cơm chay và trà đá thanh tịnh.'
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
          while (cur) {
            if (cur.userData && cur.userData.stallType) {
              stallType = cur.userData.stallType;
              stallTitle = cur.userData.stallTitle || stallTitle;
              break;
            }
            cur = cur.parent;
          }
          this.onObjectClick('OPEN_MARKET_STALL', { category: stallType, title: stallTitle });
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
  }

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

  updateAutoWalk(dt) {
    if (!this.autoWalkWaypoints.length) return;
    const wp = this.autoWalkWaypoints[0];
    const dx = wp.x - this.playerState.x;
    const dz = wp.z - this.playerState.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.45) {
      this.autoWalkWaypoints.shift();
      if (this.autoWalkWaypoints.length === 0) {
        this.playerState.moving = false;
        if (wp.lookAt) {
          this.playerState.yaw = Math.atan2(
            wp.lookAt.x - this.playerState.x,
            wp.lookAt.z - this.playerState.z
          );
          this.cameraBaseYaw = this.playerState.yaw;
          this.cameraAzimuthOffset = 0;
        }
        if (this.walkTargetRing) this.walkTargetRing.visible = false;
        if (this.walkPathLine) this.walkPathLine.visible = false;
        const arrivedSt = this.autoWalkStation;
        const cb = this.autoWalkCallback;
        this.autoWalkStation = null;
        this.autoWalkCallback = null;
        this.syncPlayerTransform();
        this.checkStationProximity();
        this.checkInteriorDoorTransition();
        this.onAutoWalkTargetChange(null);
        if (cb) cb(arrivedSt);
        this.onAutoWalkArrival(arrivedSt);
        return;
      }
      this.updateWalkPathLine();
      return;
    }

    const stepSpeed = Math.min(dist, dt * 5.2);
    const nx = dx / dist;
    const nz = dz / dist;
    const moved = this.tryMove(
      this.playerState.x + nx * stepSpeed,
      this.playerState.z + nz * stepSpeed
    );
    this.playerState.x = moved.x;
    this.playerState.z = moved.z;
    this.playerState.yaw = this.lerpAngle(this.playerState.yaw, Math.atan2(nx, nz), dt * 10);
    this.playerState.moving = true;
    this.syncPlayerTransform();
    this.checkStationProximity();
    this.checkInteriorDoorTransition();
  }

  stepInteriorTransition(trDt) {
    if (!this.interiorTransition) return;
    const tr = this.interiorTransition;
    tr.timer += trDt;
    const t = Math.min(1, tr.timer / Math.max(0.01, tr.duration));
    if (tr.phase === 'climb_side_door') {
      this.playerState.x = tr.startX + (tr.targetX - tr.startX) * t;
      this.playerState.z = tr.startZ + (tr.targetZ - tr.startZ) * t;
      this.playerElevationY = 0;
      this.playerState.moving = true;
      this.syncPlayerTransform();
      if (t >= 1) {
        this.onTransitionFade(true);
        this.interiorTransition = {
          phase: 'enter_veil',
          timer: 0,
          duration: 0.24,
          side: 'right',
          onEntered: tr.onEntered
        };
      }
    } else if (tr.phase === 'enter_veil') {
      if (t >= 1) {
        this.inInterior = true;
        this.ensureInteriorAssetsLoaded().catch(() => {});
        this.exteriorGroup.visible = false;
        this.interiorGroup.visible = true;
        this.applyInteriorAtmosphere();
        this.playerElevationY = 0;
        this._doorCooldownUntil = performance.now() + 2600;
        const entryYaw = Math.PI - 0.34;
        this.playerState.x = 15.1;
        this.playerState.z = 18.8;
        this.playerState.yaw = entryYaw;
        this.cameraBaseYaw = entryYaw;
        this.cameraAzimuthOffset = 0;
        this.nearestStallTrigger = null;
        this.onStallProximity(null);
        this.checkStationProximity();
        this.onInteriorStateChange(true);
        this.onTransitionFade(false);
        this.interiorTransition = {
          phase: 'walk_aisle',
          timer: 0,
          duration: 0.85,
          startX: 15.1,
          startZ: 18.8,
          targetX: 14.5,
          targetZ: 16.0,
          onEntered: tr.onEntered
        };
      }
    } else if (tr.phase === 'walk_aisle') {
      this.playerState.x = tr.startX + (tr.targetX - tr.startX) * t;
      this.playerState.z = tr.startZ + (tr.targetZ - tr.startZ) * t;
      const entryYaw = Math.PI - 0.34;
      this.playerState.yaw = entryYaw;
      this.cameraBaseYaw = entryYaw;
      this.playerState.moving = true;
      this.syncPlayerTransform();
      this.checkStationProximity();
      if (t >= 1) {
        const doneCb = tr.onEntered;
        this.playerState.moving = false;
        this.interiorTransition = null;
        this._doorCooldownUntil = performance.now() + 1800;
        this.syncPlayerTransform();
        this.checkStationProximity();
        if (typeof doneCb === 'function') doneCb();
      }
    } else if (tr.phase === 'exit_veil') {
      if (t >= 1) {
        if (this.interiorCutaway) {
          this.setInteriorCutaway(false);
        }
        this.inInterior = false;
        this.exteriorGroup.visible = true;
        this.interiorGroup.visible = false;
        this.setTimeOfDay(this.timeOfDay, false);
        this.playerElevationY = 0;
        this._doorCooldownUntil = performance.now() + 2400;
        this.playerState.x = 38.8;
        this.playerState.z = -14.5;
        this.playerState.yaw = Math.PI * 0.5;
        this.playerState.moving = false;
        this.cameraBaseYaw = Math.PI * 0.5;
        this.cameraAzimuthOffset = 0;
        this.onInteriorStateChange(false);
        this.onTransitionFade(false);
        this.interiorTransition = null;
        this.syncPlayerTransform();
        this.checkStationProximity();
      }
    }
  }

  animate() {
    if (this._renderPaused || this.lectureHallMode || this.contextLost || this.renderer?.getContext?.()?.isContextLost?.()) {
      window.setTimeout(() => this.animate(), 400);
      return;
    }

    const rawDelta = this.clock.getDelta();
    const dt = Math.min(rawDelta, 0.05);
    const trDt = this.isSoftwareGl ? Math.max(dt, Math.min(rawDelta, 0.35)) : dt;
    const elapsed = this.clock.elapsedTime;

    if (this.interiorTransition) {
      this.stepInteriorTransition(trDt);
    } else {
      const walkDt = this.isSoftwareGl ? Math.max(dt, Math.min(rawDelta, 0.25)) : dt;
      this.updateHeldMovement(walkDt);
      this.updateAutoWalk(walkDt);
    }

    // Damped Entrance Camera Tour along Tam Quan -> Yellow Banner & Vietnamese Stalls -> Right Bougainvillea Path
    const tourStep = this.isSoftwareGl ? Math.max(dt, 0.14) : dt;
    this.stepArrivalCutscene(tourStep);
    this.stepEntranceTour(tourStep);
    this.stepRoadTraffic(this.isSoftwareGl ? trDt : dt);

    if (this.activePlayerRecord) {
      if (this.playerState.moving) {
        this.playerState.moveBlend = Math.min(1, this.playerState.moveBlend + dt * 6);
        this.playClipCrossfade(this.activePlayerRecord, 'Di bo', 0.15, false);
        if (this.activePlayerRecord.activeAction) {
          this.activePlayerRecord.activeAction.paused = false;
          this.activePlayerRecord.activeAction.timeScale =
            0.55 + 0.65 * this.playerState.moveBlend;
        }
        this.activePlayerRecord.mixer.update(dt);
        if (!this.arrivalCutscene?.active) {
          this._stepAudioTimer += dt;
          if (this._stepAudioTimer >= 0.42) {
            this._stepAudioTimer = 0;
            this.onStepSound(this.inInterior ? 'interior' : 'stone');
          }
        }
      } else {
        this.playerState.moveBlend = Math.max(0, this.playerState.moveBlend - dt * 7);
        this._stepAudioTimer = 0.25;
        const activeName = normalizeAnimKey(this.activePlayerRecord.activeClipName);
        if ((activeName === 'di bo' || activeName === 'walk') && !this.proceduralPoseState?.action) {
          this.playClipCrossfade(this.activePlayerRecord, 'Dung', 0.2, false);
        }
        if (this.activePlayerRecord.activeAction) {
          this.activePlayerRecord.activeAction.paused = false;
        }
        this.activePlayerRecord.mixer.update(dt);
      }
      this.updateProceduralPoseFallback(dt);
    }

    this.stepPilgrimageCompanions(dt);

    if (this.guidedBeaconGroup?.visible && this.guidedBeaconGroup.userData?.diamond) {
      this.guidedBeaconGroup.userData.diamond.rotation.y = elapsed * 1.4;
      this.guidedBeaconGroup.userData.diamond.position.y = 5.2 + Math.sin(elapsed * 2.6) * 0.38;
    }

    if (!this.inInterior) {
      for (let ni = 0; ni < this.riggedNpcRecords.length; ni++) {
        const npc = this.riggedNpcRecords[ni];
        const pos = npc.rec.root.position;
        if (npc.pauseTimer > 0) {
          npc.pauseTimer -= dt;
          if (npc.pauseTimer <= 0 && npc.temporary && npc.removeAfterPause) {
            this.exteriorGroup.remove(npc.rec.root);
            this.riggedNpcRecords.splice(ni, 1);
            ni -= 1;
            continue;
          }
          const desiredClip = npc.pauseClip === 'Chắp tay' ? 'Chắp tay' : 'Dung';
          if (npc.state !== desiredClip) {
            npc.state = desiredClip;
            this.playClipCrossfade(npc.rec, desiredClip, 0.24, false);
          }
          if (npc.lookX !== null && npc.lookZ !== null) {
            const lookYaw = Math.atan2(npc.lookX - pos.x, npc.lookZ - pos.z);
            npc.yaw = this.lerpAngle(npc.yaw, lookYaw, dt * 5.0);
            npc.rec.root.rotation.y = npc.yaw;
          }
          npc.rec.mixer.update(dt * 0.75);
          continue;
        }

        const target = npc.pts[npc.idx];
        const dx = target.x - pos.x;
        const dz = target.z - pos.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.42) {
          if (npc.temporary && npc.idx >= npc.pts.length - 1) {
            if (target.wait > 0) {
              npc.pauseTimer = target.wait;
              npc.pauseClip = target.action === 'chap_tay' ? 'Chắp tay' : 'Dung';
              npc.lookX = target.lookX;
              npc.lookZ = target.lookZ;
              npc.removeAfterPause = true;
              npc.state = npc.pauseClip;
              this.playClipCrossfade(npc.rec, npc.pauseClip, 0.24, false);
              npc.rec.mixer.update(dt);
            } else {
              this.exteriorGroup.remove(npc.rec.root);
              this.riggedNpcRecords.splice(ni, 1);
              ni -= 1;
            }
            continue;
          }
          npc.idx = (npc.idx + 1) % npc.pts.length;
          if (target.wait > 0 && target.action !== 'pass') {
            npc.pauseTimer = target.wait;
            npc.pauseClip = target.action === 'chap_tay' ? 'Chắp tay' : 'Dung';
            npc.lookX = target.lookX;
            npc.lookZ = target.lookZ;
            npc.state = npc.pauseClip;
            this.playClipCrossfade(npc.rec, npc.pauseClip, 0.24, false);
            npc.rec.mixer.update(dt);
            continue;
          }
          npc.lookX = null;
          npc.lookZ = null;
        }

        const nextTarget = npc.pts[npc.idx];
        const tx = nextTarget.x - pos.x;
        const tz = nextTarget.z - pos.z;
        const td = Math.hypot(tx, tz) || 1;
        let dirX = tx / td;
        let dirZ = tz / td;

        // Gentle personal-space separation from other moving NPCs & the player
        const pdx = pos.x - this.playerState.x;
        const pdz = pos.z - this.playerState.z;
        const pDist = Math.hypot(pdx, pdz);
        if (pDist > 0.01 && pDist < 1.05) {
          const push = (1.05 - pDist) * 0.65;
          dirX += (pdx / pDist) * push;
          dirZ += (pdz / pDist) * push;
        }
        for (let oi = 0; oi < this.riggedNpcRecords.length; oi++) {
          if (oi === ni) continue;
          const other = this.riggedNpcRecords[oi].rec.root.position;
          const odx = pos.x - other.x;
          const odz = pos.z - other.z;
          const oDist = Math.hypot(odx, odz);
          if (oDist > 0.01 && oDist < 0.88) {
            const push = (0.88 - oDist) * 0.55;
            dirX += (odx / oDist) * push;
            dirZ += (odz / oDist) * push;
          }
        }
        const dNorm = Math.hypot(dirX, dirZ) || 1;
        dirX /= dNorm;
        dirZ /= dNorm;

        const step = Math.min(td, dt * npc.speed);
        pos.x += dirX * step;
        pos.z += dirZ * step;
        const targetYaw = Math.atan2(dirX, dirZ);
        npc.yaw = this.lerpAngle(npc.yaw, targetYaw, dt * 6.5);
        npc.rec.root.rotation.y = npc.yaw;
        if (npc.state !== 'walk') {
          npc.state = 'walk';
          this.playClipCrossfade(npc.rec, 'Di bo', 0.2, false);
        }
        if (npc.rec.activeAction) {
          npc.rec.activeAction.timeScale = 0.74 * npc.speed;
        }
        npc.rec.mixer.update(dt);
      }
    } else {
      for (const kr of this.interiorKneelingRecords) {
        kr.mixer.update(dt * 0.72);
      }
    }

    for (const vRec of this.vendorNpcRecords) {
      vRec.mixer.update(dt * 0.7);
    }

    for (const sc of this.smokeColumns) {
      sc.update(dt, elapsed);
    }
    for (const ls of this.lotusSwayGroups) {
      ls.group.rotation.z = Math.sin(elapsed * 1.4 + ls.phase) * 0.045;
      ls.group.rotation.x = Math.cos(elapsed * 1.1 + ls.phase) * 0.035;
    }
    if (this.floatingLanterns?.length && !this.inInterior) {
      for (const fl of this.floatingLanterns) {
        fl.mesh.position.y = 0.04 + Math.sin(elapsed * 1.7 + fl.phase) * 0.025;
        fl.mesh.rotation.y += dt * 0.14;
        fl.mesh.rotation.z = Math.sin(elapsed * 1.3 + fl.phase) * 0.06;
        if (fl.flameMat) {
          fl.flameMat.emissiveIntensity = 0.85 + Math.sin(elapsed * 7.5 + fl.phase) * 0.28;
        }
      }
    }

    // Animate Dâng hoa blooming & glowing lotus effect in the pond (zero GC)
    this.stepLotusBloom(this.isSoftwareGl ? Math.max(dt, 0.12) : dt);

    for (const k of this.koiList) {
      if (k.curve) {
        const u = ((elapsed * k.speed) + k.phase) % 1;
        k.curve.getPointAt(u, _koiPos);
        k.curve.getTangentAt(u, _koiTan);
        k.mesh.position.copy(_koiPos);
        k.mesh.rotation.y = Math.atan2(_koiTan.x, _koiTan.z);
        if (k.bodyPivot) {
          k.bodyPivot.rotation.y = Math.sin(elapsed * 7.5 + k.phase * 12) * 0.08;
        }
        if (k.tail) {
          k.tail.rotation.y = Math.sin(elapsed * 11 + k.phase * 12) * 0.45;
        }
      }
    }
    for (const p of this.pigeons) {
      const distToPlayer = Math.hypot(
        this.playerState.x - p.group.position.x,
        this.playerState.z - p.group.position.z
      );
      if (distToPlayer < 3.2 && !p.flying) {
        p.flying = true;
        p.flyTimer = 0;
      }
      if (p.flying) {
        p.flyTimer += dt;
        p.group.position.y = Math.min(5.5, p.flyTimer * 2.8);
        p.group.position.x += Math.sin(p.phase) * dt * 2.4;
        p.group.position.z -= Math.cos(p.phase) * dt * 2.4;
        if (p.wL && p.wR) {
          const flap = Math.sin(elapsed * 26) * 0.65;
          p.wL.rotation.z = flap;
          p.wR.rotation.z = -flap;
        }
        if (p.flyTimer > 4.5) {
          p.flying = false;
          p.group.position.set(p.baseX, 0, p.baseZ);
          if (p.wL && p.wR) {
            p.wL.rotation.z = 0;
            p.wR.rotation.z = 0;
          }
        }
      } else {
        p.group.position.y = Math.abs(Math.sin(elapsed * 3.2 + p.phase)) * 0.04;
        p.group.rotation.y = Math.sin(elapsed * 0.7 + p.phase) * 0.6;
      }
    }

    for (const grp of this.courtyardLeafMeshes.values()) {
      if (!grp.visible) continue;
      grp.position.y = 0.025 + Math.sin(elapsed * 2.2 + (grp.userData.phase || 0)) * 0.015;
    }

    this.updateProjectedPins();
    try {
      this.renderer.render(this.scene, this.camera);
    } catch {}
    if (this.isSoftwareGl) {
      const activeClip = normalizeAnimKey(this.activePlayerRecord?.activeClipName || '');
      const hasNonIdleAction =
        activeClip &&
        activeClip !== 'dung' &&
        Boolean(this.activePlayerRecord?.activeAction && !this.activePlayerRecord.activeAction.paused);
      const isActivelyAnimating =
        this.playerState.moving ||
        this.heldDirs.size > 0 ||
        this.autoWalkWaypoints.length > 0 ||
        this.entranceTour.active ||
        Boolean(this.arrivalCutscene?.active) ||
        Boolean(this.proceduralPoseState?.action) ||
        this.lotusBloomState.active ||
        Boolean(this.interiorTransition) ||
        hasNonIdleAction;
      this.afterDraw(() => this.animate(), isActivelyAnimating ? 120 : 520);
    } else {
      requestAnimationFrame(() => this.animate());
    }
  }

  updateProceduralPoseFallback(dt) {
    const st = this.proceduralPoseState;
    if (!st || !st.action || !this.activePlayerRecord?.root) return;
    st.timer += dt;
    const p = Math.min(1, st.timer / Math.max(0.2, st.duration || 2.5));
    const curve = Math.sin(p * Math.PI);
    const bones = findCharacterBones(this.activePlayerRecord.root);
    const act = normalizeAnimKey(st.action);

    if (act === 'quy') {
      this.activePlayerRecord.root.position.y =
        (this.activePlayerRecord.baseY || 0) - 0.34 * curve;
      if (bones.spine) bones.spine.rotation.x += 0.32 * curve;
      if (bones.head) bones.head.rotation.x += 0.25 * curve;
    } else if (act === 'vai') {
      if (bones.spine) bones.spine.rotation.x += 0.44 * curve;
      if (bones.chest && bones.chest !== bones.spine) bones.chest.rotation.x += 0.18 * curve;
      if (bones.head) bones.head.rotation.x += 0.3 * curve;
    } else if (act === 'thap nhang' || act === 'chap tay') {
      if (bones.spine) bones.spine.rotation.x += 0.16 * curve;
      if (bones.head) bones.head.rotation.x += 0.2 * curve;
      if (bones.leftForearm) bones.leftForearm.rotation.x -= 0.55 * curve;
      if (bones.rightForearm) bones.rightForearm.rotation.x -= 0.55 * curve;
    }

    if (p >= 1) {
      st.action = null;
      st.timer = 0;
      this.activePlayerRecord.root.position.y = this.activePlayerRecord.baseY || 0;
    }
  }

  playArrivalCutscene({ vehicleKind = 'sedan', onCue = () => {}, onComplete = () => {} } = {}) {
    this.skipArrivalCutscene(true);
    this.cancelEntranceTour();
    this.cancelAutoWalk();
    if (this.inInterior) this.toggleInterior(false);

    const isCoach = vehicleKind === 'van' || vehicleKind === 'doan_xe_buyt';
    const vehColor = isCoach ? 0xD7DFE4 : 0xEFEBE2;
    const vehicle = this.spawnRoadTrafficVehicle({
      kind: isCoach ? 'van' : 'sedan',
      x: 92,
      z: 59.4,
      direction: -1,
      speed: 8.5,
      color: vehColor
    });
    if (vehicle?.group) {
      vehicle.group.userData.isCutsceneVehicle = true;
    }

    // Temporarily tuck player inside drop-off spot while car pulls up
    this.playerState.x = 58.0;
    this.playerState.z = 52.5;
    this.playerState.yaw = Math.PI;
    this.playerState.moving = false;
    this.playerContainer.visible = false;

    this.arrivalCutscene = {
      active: true,
      timer: 0,
      phase: 'drive_in',
      vehicle,
      vehicleKind: isCoach ? 'van' : 'sedan',
      onCue,
      onComplete,
      cuedArrival: false,
      cuedWalkIn: false
    };
    onCue('drive_in');
  }

  skipArrivalCutscene(silent = false) {
    const cs = this.arrivalCutscene;
    if (!cs) return;
    if (cs.vehicle) {
      this.disposeRoadTrafficVehicle(cs.vehicle);
    }
    this.arrivalCutscene = null;
    this.playerContainer.visible = true;
    this.playerState.x = 35.5;
    this.playerState.z = 50.8;
    this.playerState.yaw = Math.PI - 0.16;
    this.playerState.moving = false;
    this.cameraBaseYaw = Math.PI - 0.16;
    this.cameraAzimuthOffset = 0;
    this.syncPlayerTransform();
    if (!silent && typeof cs.onComplete === 'function') {
      cs.onComplete();
    }
  }

  stepArrivalCutscene(dt) {
    const cs = this.arrivalCutscene;
    if (!cs || !cs.active || this.inInterior) return;
    cs.timer += dt;
    const vGrp = cs.vehicle?.group;

    // 0 -> 2.8s: car cruises west along Nguyễn Trung Trực road and pulls into Cổng Phụ curb
    if (cs.timer < 2.8) {
      const u = Math.min(1, cs.timer / 2.8);
      const ease = 1 - Math.pow(1 - u, 3);
      if (vGrp) {
        vGrp.position.x = THREE.MathUtils.lerp(92, 51.5, ease);
        vGrp.position.z = THREE.MathUtils.lerp(59.4, 53.6, Math.max(0, (u - 0.45) / 0.55));
        vGrp.rotation.y = Math.PI + (u > 0.45 && u < 0.92 ? -0.26 : 0);
      }
      this.camera.position.set(
        THREE.MathUtils.lerp(66, 44.5, ease),
        THREE.MathUtils.lerp(5.2, 3.6, ease),
        THREE.MathUtils.lerp(69, 63.5, ease)
      );
      this.camera.lookAt(
        THREE.MathUtils.lerp(72, 48.0, ease),
        1.7,
        THREE.MathUtils.lerp(57, 50.5, ease)
      );
      return;
    }

    // 2.8 -> 6.8s: step out of vehicle onto plaza & walk gracefully through Cổng Phụ toward Chùa Vĩnh Tràng
    if (!cs.cuedArrival) {
      cs.cuedArrival = true;
      this.playerContainer.visible = true;
      this.playerState.x = 49.5;
      this.playerState.z = 51.2;
      cs.onCue('step_out');
    }
    if (cs.timer < 6.8) {
      const w = (cs.timer - 2.8) / 4.0;
      const sx = THREE.MathUtils.lerp(49.5, 35.5, w);
      const sz = THREE.MathUtils.lerp(51.2, 50.8, w);
      this.playerState.yaw = Math.atan2(35.5 - sx, 50.8 - sz);
      this.playerState.x = sx;
      this.playerState.z = sz;
      this.playerState.moving = true;
      this.playerContainer.position.set(sx, 0, sz);
      this.playerContainer.rotation.y = this.playerState.yaw;
      if (!cs.cuedWalkIn && w > 0.35) {
        cs.cuedWalkIn = true;
        cs.onCue('enter_gate');
      }
      this.camera.position.set(
        THREE.MathUtils.lerp(44.5, 37.8, w),
        THREE.MathUtils.lerp(3.6, 2.5, w),
        THREE.MathUtils.lerp(63.5, 57.5, w)
      );
      this.camera.lookAt(
        THREE.MathUtils.lerp(39.0, 29.0, w),
        THREE.MathUtils.lerp(2.4, 3.4, w),
        THREE.MathUtils.lerp(46.0, 38.0, w)
      );
      return;
    }

    this.skipArrivalCutscene(false);
  }

  setPilgrimageCompanions(modeConfig = {}, nationalityId = 'vn') {
    for (const c of this.companionRecords) {
      if (c.rec?.root?.parent) c.rec.root.parent.remove(c.rec.root);
    }
    this.companionRecords = [];

    const specs = Array.isArray(modeConfig?.companions) ? modeConfig.companions : [];
    const tintByNat = {
      vn: [0.68, 0.72, 0.78],
      us: [0.46, 0.56, 0.74],
      intl: [0.48, 0.60, 0.74],
      jp: [0.58, 0.52, 0.68],
      kr: [0.78, 0.74, 0.82],
      tw: [0.62, 0.45, 0.34],
      fr: [0.56, 0.62, 0.54],
      th: [0.82, 0.74, 0.44]
    };
    const toRgbTuple = (val) => {
      if (Array.isArray(val) && val.length >= 3) return val;
      if (typeof val === 'string' && /^#[0-9a-f]{6}$/i.test(val.trim())) {
        const hex = val.trim().slice(1);
        return [
          parseInt(hex.slice(0, 2), 16) / 255,
          parseInt(hex.slice(2, 4), 16) / 255,
          parseInt(hex.slice(4, 6), 16) / 255
        ];
      }
      return null;
    };

    for (let i = 0; i < specs.length; i++) {
      const sp = specs[i];
      const charKey = sp.charKey || 'nu_ao_lam';
      if (!this.charDataCache[charKey]?.scene) {
        this.loadCharacterGLB(charKey).then((loaded) => {
          if (loaded?.scene && this.companionRecords?.some((cr) => cr._requestedCharKey === charKey && !cr._upgraded)) {
            this.setPilgrimageCompanions(modeConfig, nationalityId);
          }
        });
      }
      const resolvedKey = this.charDataCache[charKey]?.scene ? charKey : (this.charDataCache.nu_ao_lam?.scene ? 'nu_ao_lam' : 'nu');
      const height = CHAR_HEIGHTS[resolvedKey] || 1.62;
      const rec = this.cloneAnimatedCharacter(resolvedKey, height);
      if (!rec) continue;
      const rgbTint = toRgbTuple(sp.tint) || tintByNat[nationalityId] || null;
      if (rgbTint) {
        this.recolorPastelDress(rec.root, rgbTint);
      }
      this.equipNpcProps(rec, resolvedKey, height, {
        hat: Boolean(sp.hat),
        bag: sp.bag || null,
        scarf: Boolean(sp.scarf),
        hand: sp.hand || 'hoa_sen'
      });

      const angleOffset = (i === 0 ? 1 : -1) * (0.9 + Math.floor(i / 2) * 0.55);
      const backDist = 1.55 + Math.floor(i / 2) * 1.15;
      const startX = this.playerState.x - Math.sin(this.playerState.yaw + angleOffset) * backDist;
      const startZ = this.playerState.z - Math.cos(this.playerState.yaw + angleOffset) * backDist;
      rec.root.position.set(startX, rec.baseY, startZ);
      rec.root.rotation.y = this.playerState.yaw;
      this.playClipCrossfade(rec, 'Dung', 0.1, false);
      this.scene.add(rec.root);
      this.companionRecords.push({
        rec,
        _requestedCharKey: charKey,
        _upgraded: resolvedKey === charKey,
        roleLabel: sp.roleLabel || sp.label || 'Bạn đồng hành',
        sideOffset: (i % 2 === 0 ? -1.15 : 1.15) * (1 + Math.floor(i / 2) * 0.45),
        backOffset: -1.45 - Math.floor(i / 2) * 1.05,
        state: 'Dung',
        yaw: this.playerState.yaw
      });
    }
  }

  stepPilgrimageCompanions(dt) {
    if (!this.companionRecords?.length) return;
    const hideCompanions = Boolean(this.arrivalCutscene?.active && !this.playerContainer.visible);
    const pYaw = this.playerState.yaw || 0;
    const fwdX = Math.sin(pYaw);
    const fwdZ = Math.cos(pYaw);
    const rightX = -fwdZ;
    const rightZ = fwdX;

    for (const c of this.companionRecords) {
      c.rec.root.visible = !hideCompanions;
      if (hideCompanions) continue;

      const targetX = this.playerState.x + fwdX * c.backOffset + rightX * c.sideOffset;
      const targetZ = this.playerState.z + fwdZ * c.backOffset + rightZ * c.sideOffset;
      const pos = c.rec.root.position;
      pos.y = (this.playerElevationY || 0) + (c.rec.baseY || 0);
      const dx = targetX - pos.x;
      const dz = targetZ - pos.z;
      const d = Math.hypot(dx, dz);

      if (d > 0.35) {
        const moveStep = Math.min(d, dt * (d > 3.5 ? 5.8 : 4.4));
        pos.x += (dx / d) * moveStep;
        pos.z += (dz / d) * moveStep;
        const moveYaw = Math.atan2(dx, dz);
        c.yaw = this.lerpAngle(c.yaw, moveYaw, dt * 8.0);
        c.rec.root.rotation.y = c.yaw;
        if (c.state !== 'Di bo') {
          c.state = 'Di bo';
          this.playClipCrossfade(c.rec, 'Di bo', 0.16, false);
        }
        c.rec.mixer.update(dt);
      } else {
        c.yaw = this.lerpAngle(c.yaw, pYaw, dt * 6.0);
        c.rec.root.rotation.y = c.yaw;
        if (c.state !== 'Dung') {
          c.state = 'Dung';
          this.playClipCrossfade(c.rec, 'Dung', 0.2, false);
        }
        c.rec.mixer.update(dt);
      }
    }
  }

  renderFloatingLanterns(wishes = []) {
    if (!this.lanternWishesGroup) return;
    while (this.lanternWishesGroup.children.length > 0) {
      this.lanternWishesGroup.remove(this.lanternWishesGroup.children[0]);
    }
    this.floatingLanterns = [];
    const list = Array.isArray(wishes) ? wishes.slice(0, 18) : [];

    for (let i = 0; i < list.length; i++) {
      const w = list[i];
      const ang = (i / Math.max(1, list.length)) * Math.PI * 2 + i * 0.42;
      const rad = 1.6 + (i % 4) * 1.15;
      const holder = new THREE.Group();
      holder.position.set(Math.cos(ang) * rad, 0.04, Math.sin(ang) * rad);

      let mesh = null;
      if (this.propMeshCache.den_hoa_dang) {
        mesh = this.fitProp(this.propMeshCache.den_hoa_dang, 0.44);
      } else {
        mesh = new THREE.Group();
        const petalMat = new THREE.MeshStandardMaterial({
          color: w.colorHex ? new THREE.Color(w.colorHex) : 0xFF8AA8,
          emissive: 0xFF7B3B,
          emissiveIntensity: 0.32,
          roughness: 0.4
        });
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.08, 8), petalMat);
        base.position.y = 0.04;
        mesh.add(base);
        for (let p = 0; p < 6; p++) {
          const pa = (p / 6) * Math.PI * 2;
          const petal = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 4), petalMat);
          petal.position.set(Math.cos(pa) * 0.14, 0.11, Math.sin(pa) * 0.14);
          petal.rotation.z = -Math.cos(pa) * 0.4;
          petal.rotation.x = Math.sin(pa) * 0.4;
          mesh.add(petal);
        }
      }
      const flameMat = new THREE.MeshStandardMaterial({
        color: 0xFFE58F,
        emissive: 0xFF9F2E,
        emissiveIntensity: 0.95
      });
      const flame = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 6), flameMat);
      flame.position.y = 0.18;
      mesh.add(flame);

      holder.add(mesh);
      holder.userData.wishId = w.id;
      holder.userData.wishLabel = w.wish || w.categoryLabel || 'Hoa Đăng Nguyện Ước';
      this.lanternWishesGroup.add(holder);
      this.floatingLanterns.push({
        mesh: holder,
        flameMat,
        phase: i * 1.15
      });
    }
  }

  afterDraw(cb, delayMs = 80) {
    const gl = this.renderer.getContext();
    if (!gl || typeof gl.fenceSync !== 'function') {
      window.setTimeout(cb, delayMs);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    if (!sync) {
      window.setTimeout(cb, delayMs);
      return;
    }
    let polls = 0;
    const poll = () => {
      polls += 1;
      const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED && polls < 60) {
        window.setTimeout(poll, 8);
      } else {
        gl.deleteSync(sync);
        window.setTimeout(cb, delayMs);
      }
    };
    window.setTimeout(poll, 8);
  }
}

export {
  findCharacterBones,
  attachStorePropsToCharacterRig,
  clearRiggedBoneProps,
  recolorGarmentOnScene,
  createBespokeRobeGroup,
  createStoreAccessoryGroup,
  createSculptedArhatShowcase
} from './garment-and-showcase-3d.mjs';



