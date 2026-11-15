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
 *    - 13-arch Chánh Điện at (23, 0, -1) with red columns, golden lattice grilles, upper cream frieze,
 *      cobalt mosaic band, 2-tier #7C4030 roof, 5-step staircase, two bell/drum towers, and bonsai pots.
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
  shiftOklch,
  VINH_TRANG_OKLCH_PALETTE
} from '../logic/chua-online-logic.mjs';

// Pre-allocated scratch vectors for zero-GC animation & camera loop
const _tourPos = new THREE.Vector3();
const _tourLook = new THREE.Vector3();
const _camTargetPos = new THREE.Vector3();
const _camTargetLook = new THREE.Vector3();
const _projVec = new THREE.Vector3();
const _koiPos = new THREE.Vector3();
const _koiTan = new THREE.Vector3();

const CHAR_GLB_PATHS = {
  nu: '/Thiết kế giao diện/Nhân vật 3D/Bản chỉnh sửa/nu-phuc-hoi-mau-chuyen-dong.glb',
  nam: '/Thiết kế giao diện/Nhân vật 3D/Chuyển động/nam-chuyen-dong.glb',
  tre_em: '/Thiết kế giao diện/Nhân vật 3D/Chuyển động/tre-em-chuyen-dong.glb'
};

const CHAR_HEIGHTS = {
  nu: 1.64,
  nam: 1.75,
  tre_em: 1.18
};

const STATUE_GLB_PATHS = {
  adida: '/Mô hình 3D Vĩnh Tràng/Tượng/phat-dung-adida.glb',
  dilac: '/Mô hình 3D Vĩnh Tràng/Tượng/di-lac.glb',
  phatnam: '/Mô hình 3D Vĩnh Tràng/Tượng/phat-nam.glb',
  bantho: '/Mô hình 3D Vĩnh Tràng/Tượng/phat-ngoi-ban-tho.glb'
};

const PROP_GLB_PATHS = {
  ban_tho: '/Thiết kế giao diện/Vật phẩm 3D/fixed/bat_nhang_tram.glb',
  non_la: '/Thiết kế giao diện/Vật phẩm 3D/models/non_la_theu_sen_v3.glb',
  tui_sen: '/Thiết kế giao diện/Vật phẩm 3D/models/tui_vai_theu_sen.glb',
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
  gio_may_tre: '/Thiết kế giao diện/Vật phẩm 3D/fixed/gio_may_tre.glb'
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
  const geom = new THREE.ConeGeometry(1, height, 4);
  geom.rotateY(Math.PI / 4);
  const m = new THREE.Mesh(geom, material);
  m.scale.set(width / Math.SQRT2, 1, depth / Math.SQRT2);
  return m;
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
    this.onEntranceTourChange = callbacks.onEntranceTourChange || (() => {});

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xA6D0F0);
    this.scene.fog = new THREE.FogExp2(0xEADBC4, 0.0033);

    this.camera = new THREE.PerspectiveCamera(48, 16 / 9, 0.2, 420);

    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.isSoftwareGl,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;

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
      this.scene.environment = envTex;
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
    this.playerElevationY = 0;
    this.lastDoorSide = 'right';
    this._doorCooldownUntil = 0;

    this.charDataCache = {};
    this.propMeshCache = {};
    this.playerContainer = new THREE.Group();
    this.scene.add(this.playerContainer);
    this.anCompanion = null;
    this.activePlayerRecord = null;
    this.npcRecords = [];
    this.riggedNpcRecords = [];
    this.kneelingRecords = [];
    this.interiorKneelingRecords = [];
    this.interiorNonBoClickTargets = [];
    this.interiorKhuThoClickTargets = [];
    this.interiorTraiDuongClickTargets = [];
    this.interiorCutaway = false;
    this.cutawayTargets = [];
    this.longTruClickTargets = [];
    this.stiltDiningClickTargets = [];
    this.mainCompoundClickTargets = [];
    this.stallClickTargets = [];
    this.bellTowerClickTargets = [];
    this.closedMainGateClickTargets = [];
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
      // -> 3) Glide in through Cổng Phụ past the welcome banner and into the quiet temple garden
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
    this.updateHeldMovement(dt);
    this.updateAutoWalk(dt);
    this.stepEntranceTour(dt);
    this.stepLotusBloom(dt);
    this.checkStationProximity();
  }

  renderFrame() {
    this.updateProjectedPins();
    this.renderer.render(this.scene, this.camera);
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
        color: 0xF4EFE6,
        bumpMap: this.stoneBumpTex,
        bumpScale: 0.012,
        roughness: 0.46,
        metalness: 0.03
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

    const frontFill = new THREE.DirectionalLight(0xFFF3D8, 0.48);
    frontFill.position.set(28, 22, 54);
    this.scene.add(frontFill);
  }

  buildSkyDomeAndMountains() {
    // Morning Pilgrimage Sky (7:30 AM Mỹ Tho / Mekong Delta — golden-mist horizon fading to clear cerulean)
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 1024;
    skyCanvas.height = 512;
    const sctx = skyCanvas.getContext('2d');
    const grad = sctx.createLinearGradient(0, 0, 0, 512);
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
    // Soft distant Mekong tree-line silhouette band right at the horizon
    sctx.fillStyle = 'rgba(138, 162, 126, 0.34)';
    for (let x = 0; x < 1024; x += 18) {
      const h = 10 + ((x * 37) % 16);
      sctx.beginPath();
      sctx.arc(x, 456, h, Math.PI, 0);
      sctx.fill();
    }

    const skyTex = new THREE.CanvasTexture(skyCanvas);
    skyTex.colorSpace = THREE.SRGBColorSpace;
    const skyDome = new THREE.Mesh(
      new THREE.SphereGeometry(260, 36, 20),
      new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })
    );
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

    // Keep the approach road open: no rows of kiosks, temporary stalls, or roadside carts.
    // Family homes and small home-based eateries are built separately beside the east-side lane.

    // Scattered background homes beyond the sanctuary perimeter; the walkable neighbourhood is built near the east-side lane.
    const sideBackHouses = [
      [-80, 26, 9.5, 8.2, 3.7, Math.PI / 2, 1, 2, false],
      [-82, -6, 10.8, 8.6, 4.0, Math.PI / 2, 0, 1, false],
      [-80, -38, 9.4, 8.0, 3.6, Math.PI / 2, 3, 2, false],
      [80, 24, 9.6, 8.0, 3.9, -Math.PI / 2, 0, 0, false],
      [82, -10, 10.8, 8.6, 4.0, -Math.PI / 2, 1, 1, false],
      [80, -42, 9.4, 8.0, 3.6, -Math.PI / 2, 3, 0, false],
      [-30, -84, 10.0, 8.2, 3.6, 0, 2, 2, false],
      [4, -86, 11.0, 8.4, 3.8, 0, 0, 1, false],
      [36, -84, 10.0, 8.0, 3.7, 0, 4, 0, false]
    ];
    for (const hArgs of sideBackHouses) addMekongCountryHouse(...hArgs);

    // No roadside carts or temporary food counters: food is served from family homes along the side lane.

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
    const poleXs = [-46, -24, -2, 18, 36, 56, 68];
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

    // Morning Pilgrimage Fleet: 29-Seat Tour Coach ("Xe Khách Hành Hương 29 chỗ") + Parked Motorbikes outside East entrance
    const buildPilgrimageCoach = (cx, cz, yaw = -Math.PI / 2) => {
      const bg = new THREE.Group();
      const busBodyMat = new THREE.MeshStandardMaterial({ color: 0xF5EFE0, roughness: 0.34, metalness: 0.12 });
      const busTrimMat = new THREE.MeshStandardMaterial({ color: 0x8E2920, roughness: 0.4 });
      const busGoldMat = new THREE.MeshStandardMaterial({ color: 0xD69D34, roughness: 0.32, metalness: 0.35 });
      const busGlassMat = new THREE.MeshStandardMaterial({ color: 0x223846, roughness: 0.12, metalness: 0.4 });
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x232528, roughness: 0.85 });

      const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.55, 2.35, 8.4), busBodyMat);
      chassis.position.y = 1.62;
      chassis.castShadow = true;
      bg.add(chassis);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.58, 0.42, 8.42), busTrimMat);
      stripe.position.y = 1.15;
      bg.add(stripe);
      const goldLine = new THREE.Mesh(new THREE.BoxGeometry(2.59, 0.1, 8.43), busGoldMat);
      goldLine.position.y = 1.4;
      bg.add(goldLine);
      const sideWindows = new THREE.Mesh(new THREE.BoxGeometry(2.57, 0.92, 7.2), busGlassMat);
      sideWindows.position.y = 2.08;
      bg.add(sideWindows);
      const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.36, 1.08, 0.08), busGlassMat);
      windshield.position.set(0, 2.02, 4.21);
      windshield.rotation.x = -0.06;
      bg.add(windshield);
      const acPod = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.28, 3.6), busBodyMat);
      acPod.position.set(0, 2.94, 0.2);
      bg.add(acPod);
      const coachSign = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.32, 0.05),
        new THREE.MeshBasicMaterial({ map: makeTextTex('ĐOÀN HÀNH HƯƠNG · VĨNH TRÀNG', { bg: '#7E241C', color: '#FFE082', border: '#D9A441', w: 512, h: 96, size: 23 }) })
      );
      coachSign.position.set(0, 2.66, 4.22);
      bg.add(coachSign);

      for (const [wx, wz] of [
        [-1.18, 2.55],
        [1.18, 2.55],
        [-1.18, -2.55],
        [1.18, -2.55]
      ]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.34, 14), tireMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.48, wz);
        bg.add(wheel);
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.36, 10), zincMat);
        rim.rotation.z = Math.PI / 2;
        rim.position.set(wx, 0.48, wz);
        bg.add(rim);
      }
      for (const lx of [-0.88, 0.88]) {
        const hl = new THREE.Mesh(
          new THREE.BoxGeometry(0.32, 0.2, 0.06),
          new THREE.MeshStandardMaterial({ color: 0xFFF3C4, emissive: 0xFFE18E, emissiveIntensity: 0.7 })
        );
        hl.position.set(lx, 0.85, 4.21);
        bg.add(hl);
      }
      bg.position.set(cx, 0, cz);
      bg.rotation.y = yaw;
      this.exteriorGroup.add(bg);
    };
    buildPilgrimageCoach(67.5, 53.0, -Math.PI / 2);

    const buildParkedMotorbike = (mx, mz, yaw = 0, bodyColor = 0x9C2C26) => {
      const mg = new THREE.Group();
      const tireM = new THREE.MeshStandardMaterial({ color: 0x202225, roughness: 0.85 });
      const paintM = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.36, metalness: 0.22 });
      const seatM = new THREE.MeshStandardMaterial({ color: 0x2A231E, roughness: 0.72 });
      for (const wz of [-0.62, 0.62]) {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.1, 10), tireM);
        w.rotation.z = Math.PI / 2;
        w.position.set(0, 0.26, wz);
        mg.add(w);
      }
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 1.15), paintM);
      frame.position.set(0, 0.52, -0.05);
      mg.add(frame);
      const shield = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.64, 0.22), paintM);
      shield.position.set(0, 0.68, 0.45);
      shield.rotation.x = -0.22;
      mg.add(shield);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.68), seatM);
      seat.position.set(0, 0.76, -0.2);
      mg.add(seat);
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.06, 0.08), zincMat);
      handle.position.set(0, 1.02, 0.44);
      mg.add(handle);
      mg.position.set(mx, 0, mz);
      mg.rotation.y = yaw;
      this.exteriorGroup.add(mg);
    };
    buildParkedMotorbike(60.8, 46.8, -0.32, 0x9C2C26);
    buildParkedMotorbike(62.2, 46.9, -0.28, 0x254E8A);
    buildParkedMotorbike(63.6, 47.0, -0.35, 0x3D434A);
    buildParkedMotorbike(65.0, 47.1, -0.24, 0xB89342);

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

    // Expanded Stone Courtyard spanning full 136m x 114m (~15,500 m² sanctuary + outer street = ~22,000 m²)
    const courtyard = new THREE.Mesh(
      new THREE.BoxGeometry(136, 0.1, 114),
      new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xD9D0BF, roughness: 0.86 })
    );
    courtyard.position.set(0.0, -0.04, -15.5);
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

    // Bougainvillea-Lined Red-Railed Right Side Garden Path -> Southern Terracotta Brick Pavers
    const sideWalkway = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 0.13, 27.5),
      new THREE.MeshStandardMaterial({ map: this.sideBrickTex, color: 0xEAD6C0, roughness: 0.8 })
    );
    sideWalkway.position.set(36.0, 0.006, 20.0);
    sideWalkway.receiveShadow = true;
    this.exteriorGroup.add(sideWalkway);

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
    const gateEast = this.buildTamQuanGate('TỊNH ĐỘ HUYỀN MÔN · CHÙA VĨNH TRÀNG', true);
    gateEast.position.set(23, 0, 41.5);
    this.exteriorGroup.add(gateEast);

    // 2. Ornate Ceramic-Mosaic Cổng Phụ ("TỊNH ĐỘ HUYỀN MÔN" — WIDE OPEN & BUSTLING at x = 40.5, z = 41.5, matching image_bb72a8b0.png!)
    const sideGate = this.buildSideMosaicGate();
    sideGate.position.set(40.5, 0, 41.5);
    this.exteriorGroup.add(sideGate);

    // Yellow Overhead Welcome Banner just inside Cổng Phụ (image_bb72a8b0.png & image_97204806.png!)
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

    this.buildResidentialFoodHouses();

    const chanhDien = this.buildChanhDien13Arches();
    chanhDien.position.set(23, 0, 1.0);
    this.exteriorGroup.add(chanhDien);

    // West Monastic Hall clear of North A Di Đà & Niết Bàn
    const leftHall = this.buildSideHall(8.4, 14.2, 4.9, M.goldLight);
    leftHall.position.set(2.0, 0, -14.5);
    this.exteriorGroup.add(leftHall);
    this.addRectObstacle(-2.4, 6.4, -21.8, -7.2);

    // Connected Main Temple Complex ("Chùa Chính" chữ Quốc layout — diagram-faithful 4 cross-halls & 2 Sân Thiên Tỉnh):
    // 1) Tiền Đường (porch at z=+1) -> 2) Chánh Điện (z=-7.5) -> Sân Thiên Tỉnh 1 (z=-12.8)
    // -> 3) Nhà Tổ (z=-18.4) -> Sân Thiên Tỉnh 2 (z=-23.8) -> 4) Nhà Hậu (z=-28.8), connected by West/East covered corridors.
    const buildMainTempleCompound = () => {
      const comp = new THREE.Group();
      const darkWoodBeam = new THREE.MeshStandardMaterial({ color: 0x3D2114, map: this.woodGrainTex, roughness: 0.6 });
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x676B66, roughness: 0.92, flatShading: true });
      const mossMat = new THREE.MeshStandardMaterial({ color: 0x3D7A3C, roughness: 0.85 });

      // 1. Raised ~1.0m Heritage Plinth across the rear compound (x = 13.8..36.2, z = -31.2..-5.8)
      const plinthTerrace = new THREE.Mesh(
        new THREE.BoxGeometry(22.4, 0.96, 25.4),
        M.stoneLight
      );
      plinthTerrace.position.set(25.0, 0.48, -18.5);
      plinthTerrace.receiveShadow = true;
      comp.add(plinthTerrace);

      // Floor of the 2 open-sky Sân Thiên Tỉnh courtyards
      const innerCourtBase = new THREE.Mesh(
        new THREE.BoxGeometry(14.8, 0.14, 21.5),
        new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xD6C3A5, roughness: 0.8 })
      );
      innerCourtBase.position.set(25.0, 0.98, -18.2);
      comp.add(innerCourtBase);

      // 2. Covered West & East Perimeter Corridors ("Hành lang bao quanh chữ Quốc")
      for (const sideX of [15.8, 34.2]) {
        const hallStrip = new THREE.Mesh(new THREE.BoxGeometry(3.8, 4.3, 24.4), M.goldLight);
        hallStrip.position.set(sideX, 3.1, -18.4);
        hallStrip.castShadow = true;
        hallStrip.receiveShadow = true;
        comp.add(hallStrip);

        const stripRoof = makeHippedRoofMesh(4.6, 25.0, 1.45, M.roofTile);
        stripRoof.position.set(sideX, 5.95, -18.4);
        stripRoof.castShadow = true;
        comp.add(stripRoof);

        for (let cz = -29.2; cz <= -7.0; cz += 3.7) {
          const innerCol = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 4.2, 8), M.redColumn);
          innerCol.position.set(sideX < 25 ? sideX + 2.0 : sideX - 2.0, 3.05, cz);
          comp.add(innerCol);
        }
      }

      // 3. Cross-Hall 2 Ridge (Chánh Điện Sanctuary Rear Wing z = -7.6)
      const chanhRearBody = new THREE.Mesh(new THREE.BoxGeometry(19.6, 5.2, 4.4), M.goldWall);
      chanhRearBody.position.set(25.0, 3.55, -7.6);
      chanhRearBody.castShadow = true;
      comp.add(chanhRearBody);
      const chanhRearRoof = makeHippedRoofMesh(21.0, 5.6, 2.35, M.roofTile);
      chanhRearRoof.position.set(25.0, 7.3, -7.6);
      chanhRearRoof.castShadow = true;
      comp.add(chanhRearRoof);

      // 4. Cross-Hall 3 (Nhà Tổ at z = -18.2) separating Sân Thiên Tỉnh 1 & 2
      const nhaToWing = new THREE.Mesh(new THREE.BoxGeometry(17.6, 4.8, 5.0), M.goldWall);
      nhaToWing.position.set(25.0, 3.35, -18.2);
      nhaToWing.castShadow = true;
      comp.add(nhaToWing);
      const nhaToRoof = makeHippedRoofMesh(19.2, 6.2, 2.45, M.roofTile);
      nhaToRoof.position.set(25.0, 6.95, -18.2);
      nhaToRoof.castShadow = true;
      comp.add(nhaToRoof);
      const nhaToCrest = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.34, 0.34), M.goldAccent);
      nhaToCrest.position.set(25.0, 8.22, -18.2);
      comp.add(nhaToCrest);

      // 5. Cross-Hall 4 (Nhà Hậu at z = -28.4) closing the North rear of Chữ Quốc
      const nhaHauWing = new THREE.Mesh(new THREE.BoxGeometry(22.2, 5.0, 5.2), M.goldWall);
      nhaHauWing.position.set(25.0, 3.45, -28.4);
      nhaHauWing.castShadow = true;
      comp.add(nhaHauWing);
      const nhaHauRoof = makeHippedRoofMesh(23.6, 6.4, 2.4, M.roofTile);
      nhaHauRoof.position.set(25.0, 7.1, -28.4);
      nhaHauRoof.castShadow = true;
      comp.add(nhaHauRoof);

      // Twin Sân Thiên Tỉnh Open Sky Courtyards (Hòn Non Bộ 1 at z=-12.8 & Hòn Non Bộ 2 at z=-23.5)
      for (const [nbIdx, nbZ] of [[1, -12.8], [2, -23.5]]) {
        const curb = new THREE.Mesh(new THREE.CylinderGeometry(2.55, 2.75, 0.45, 20), M.stoneDark);
        curb.position.set(25.0, 1.24, nbZ);
        comp.add(curb);
        const wat = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.25, 0.35, 20), M.water);
        wat.position.set(25.0, 1.32, nbZ);
        comp.add(wat);
        const peak = new THREE.Mesh(new THREE.DodecahedronGeometry(0.95, 0), rockMat);
        peak.scale.set(1.25, 1.75 + nbIdx * 0.15, 1.05);
        peak.position.set(25.0, 2.05, nbZ);
        comp.add(peak);
        const moss = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), mossMat);
        moss.position.set(25.0, 2.95, nbZ);
        comp.add(moss);
        for (const bx of [21.2, 28.8]) {
          const pot = this.makeBonsai72(0.68);
          pot.position.set(bx, 1.02, nbZ);
          comp.add(pot);
        }
      }

      const rearSign = new THREE.Mesh(
        new THREE.BoxGeometry(7.2, 0.82, 0.18),
        new THREE.MeshStandardMaterial({
          map: makeTextTex('CHÙA CHÍNH CHỮ QUỐC · NHÀ TỔ & NHÀ HẬU', {
            w: 1200,
            h: 180,
            bg: '#32140A',
            border: '#FFD875',
            color: '#FFD970',
            size: 50
          })
        })
      );
      rearSign.position.set(25.0, 4.95, -31.12);
      comp.add(rearSign);

      const eastGallerySign = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.68, 6.2),
        new THREE.MeshStandardMaterial({
          map: makeTextTex('2 SÂN THIÊN TỈNH · 18 LA HÁN · LONG TRỤ', {
            w: 1120,
            h: 170,
            bg: '#5C1610',
            border: '#FFD875',
            color: '#FFF2B2',
            size: 48
          }),
          roughness: 0.38
        })
      );
      eastGallerySign.position.set(36.2, 3.85, -18.2);
      comp.add(eastGallerySign);

      // Clickable compound wing cue to jump straight into Interior architectural view
      const compoundHit = new THREE.Mesh(
        new THREE.BoxGeometry(22.2, 5.4, 24.4),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false })
      );
      compoundHit.position.set(25.0, 3.2, -18.5);
      comp.add(compoundHit);
      this.mainCompoundClickTargets.push(compoundHit, rearSign, eastGallerySign);

      this.exteriorGroup.add(comp);
      this.addRectObstacle(13.8, 36.2, -31.1, -5.8);
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

    const giangDuong = this.buildGiangDuong();
    giangDuong.position.set(44, 0, -18);
    this.exteriorGroup.add(giangDuong);
    this.addRectObstacle(39, 49, -28, -8);

    // 7-Tier Terracotta Bảo Tháp directly behind Standing Phật A Di Đà at North Central Head (image_97204806.png!)
    const stupa = this.buildSevenTierStupa();
    stupa.position.set(-8.0, 0, -37.0);
    this.exteriorGroup.add(stupa);
    this.addObstacle(-8.0, -37.0, 4.2);

    this.buildStatuePedestals();

    // Large South-Center Lotus Pond right west of Tam Quan courtyard (matching image_97204806.png bottom-center)
    const pond1 = this.buildLotusPond(14.5, 16.5, 16, true);
    pond1.position.set(3.5, 0, 33.0);
    this.exteriorGroup.add(pond1);
    this.addRectObstacle(-4.2, 11.2, 24.4, 41.6);

    // Secondary Inner Lotus Basin beside the central monastic hall
    const pond2 = this.buildLotusPond(8.0, 10.5, 8, false);
    pond2.position.set(2.0, 0, -1.5);
    this.exteriorGroup.add(pond2);
    this.addRectObstacle(-2.4, 6.4, -7.2, 4.2);

    // Twin Three-Tier White-Gold Stupas in Middle Plaza (matching image_97204806.png!)
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
    burnerAdida.position.set(-8.0, 0, -17.5);
    this.exteriorGroup.add(burnerAdida);
    this.addObstacle(-8.0, -17.5, 0.9);

    // Incense burner centered at Di Lặc stepped staircase
    const burnerDiLac = this.buildIncenseBurner(0.78);
    burnerDiLac.position.set(-24.5, 1.72, 17.2);
    this.exteriorGroup.add(burnerDiLac);

    // Incense burner beside Đài Quán Thế Âm on the RIGHT side pathway
    const burnerQuanAm = this.buildIncenseBurner(0.62);
    burnerQuanAm.position.set(34.5, 0, 22.5);
    this.exteriorGroup.add(burnerQuanAm);
    this.addObstacle(34.5, 22.5, 0.72);

    const cushionCoords = [
      [21.4, 13.4, Math.PI],
      [24.6, 13.4, Math.PI],
      [-8.0, -16.0, Math.PI],
      [-24.5, 21.8, Math.PI],
      [35.2, 22.5, -Math.PI / 2]
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
    // White Quán Thế Âm standing shrine inside non bộ niche
    const qaBase = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.85, 0.55, 12), M.lotusBlue);
    qaBase.position.set(0.2, 2.05, 0.65);
    nonBo.add(qaBase);
    const qaBody = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 1.55, 12), M.statueWhite);
    qaBody.position.set(0.2, 3.05, 0.65);
    nonBo.add(qaBody);
    const qaHead = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), M.statueWhite);
    qaHead.position.set(0.2, 4.02, 0.65);
    nonBo.add(qaHead);
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

    // 3. HÀNH LANG 18 VỊ LA HÁN NGOÀI TRỜI (West-North Promenade x = -49.5, z = -34..-16)
    for (let i = 0; i < 6; i++) {
      const az = -16.0 - i * 3.8;
      const ped = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.85, 1.3), M.creamTrim);
      ped.position.set(-49.5, 0.425, az);
      this.exteriorGroup.add(ped);
      const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.44, 1.45, 10), M.statueWhite);
      robe.position.set(-49.5, 1.55, az);
      robe.castShadow = true;
      this.exteriorGroup.add(robe);
      const hd = new THREE.Mesh(new THREE.SphereGeometry(0.23, 10, 8), M.statueWhite);
      hd.position.set(-49.5, 2.46, az);
      this.exteriorGroup.add(hd);
      this.addObstacle(-49.5, az, 0.95);
    }

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
        this.bellTowerClickTargets.push(tg);
      } else {
        const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 1.35, 16), M.mosaicRed);
        drum.rotation.z = Math.PI / 2;
        drum.position.y = 6.25;
        tg.add(drum);
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

    // Expanded Perimeter walls (-68..68, -72..41.5), leaving ONLY Cổng Phụ (x=35.8..45.2) open!
    addWallSeg(-68, 41.5, 17, 41.5);
    addWallSeg(29, 41.5, 35.8, 41.5);
    addWallSeg(45.2, 41.5, 68, 41.5);
    addWallSeg(-68, -72, -68, 41.5);
    addWallSeg(68, -72, 68, 41.5);
    addWallSeg(-68, -72, 68, -72);

    this.addRectObstacle(-68.5, 17.2, 40.9, 42.1);
    this.addRectObstacle(28.8, 36.6, 40.9, 42.1);
    this.addRectObstacle(44.4, 68.5, 40.9, 42.1);
    this.addRectObstacle(-68.8, -67.2, -72.5, 42.0);
    this.addRectObstacle(67.2, 68.8, -72.5, 42.0);
    this.addRectObstacle(-68.5, 68.5, -72.8, -71.2);

    this.exteriorGroup.add(g);
  }

  buildTamQuanGate(signText = 'CHÙA VĨNH TRÀNG', isMainGate = false) {
    const M = this.MAT;
    const g = new THREE.Group();
    const pillarPositions = [-5.8, -2.5, 2.5, 5.8];
    const pillarHeights = [6.2, 8.2, 8.2, 6.2];

    pillarPositions.forEach((px, i) => {
      const h = pillarHeights[i];
      const p = new THREE.Mesh(new THREE.BoxGeometry(1.15, h, 1.15), M.goldWall);
      p.position.set(px, h / 2, 0);
      p.castShadow = true;
      g.add(p);

      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.75, h - 1.2, 1.2), M.mosaicBlue);
      strip.position.set(px, h / 2, 0);
      g.add(strip);

      const finial = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.3, 8), M.mosaicRed);
      finial.position.set(px, h + 0.65, 0);
      g.add(finial);
    });

    const beam = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.5, 1.35), M.goldWall);
    beam.position.set(0, 6.4, 0);
    g.add(beam);

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
      g.add(sb);
      const sr = makeHippedRoofMesh(3.6, 2.0, 1.05, M.roofTile);
      sr.position.set(sx, 5.7, 0);
      g.add(sr);
    }

    if (isMainGate) {
      for (const upx of [-1.85, 1.85]) {
        const upCol = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.8, 0.95), M.goldWall);
        upCol.position.set(upx, 8.35, 0);
        g.add(upCol);
      }
      const upperLintel = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.65, 1.15), M.goldWall);
      upperLintel.position.set(0, 9.75, 0);
      g.add(upperLintel);

      const nicheStand = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.56, 0.36, 12), M.statueWhite);
      nicheStand.position.set(0, 7.15, 0);
      g.add(nicheStand);
      const buddhaLower = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.36, 0.92, 12), M.statueWhite);
      buddhaLower.position.set(0, 7.78, 0);
      g.add(buddhaLower);
      const buddhaTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.64, 12), M.statueWhite);
      buddhaTorso.position.set(0, 8.5, 0);
      g.add(buddhaTorso);
      const buddhaShoulders = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), M.statueWhite);
      buddhaShoulders.scale.set(1.28, 0.55, 0.72);
      buddhaShoulders.position.set(0, 8.76, 0);
      g.add(buddhaShoulders);
      const buddhaHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), M.statueWhite);
      buddhaHead.position.set(0, 9.16, 0);
      g.add(buddhaHead);
      const buddhaHalo = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.035, 8, 20), M.goldAccent);
      buddhaHalo.position.set(0, 9.12, -0.14);
      g.add(buddhaHalo);

      for (let t = 0; t < 2; t++) {
        const w = 6.8 - t * 1.9;
        const roof = makeHippedRoofMesh(w, 2.5 - t * 0.45, 1.2, M.roofTile);
        roof.position.set(0, 10.35 + t * 1.18, 0);
        g.add(roof);
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
    return makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#E6D6B8';
        g.fillRect(0, 0, w, h);
        const palette = ['#2B4F8E', '#3A815E', '#B4382A', '#D99E3A', '#F4EFE4', '#5F93B8'];
        for (let y = 0; y < h; y += 16) {
          for (let x = 0; x < w; x += 16) {
            const idx = Math.floor(((Math.sin(x * 13.7 + y * 29.1) * 43758.5) % 1 + 1) * palette.length) % palette.length;
            g.fillStyle = palette[idx];
            g.fillRect(x + 2, y + 2, 12, 12);
          }
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
    sign4Banh.position.set(-4.35, 0.72, 0.78);
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
    const W = 26.9;
    const D = 14.3;

    const plinth = new THREE.Mesh(new THREE.BoxGeometry(W + 1.2, 1.25, D + 1.6), M.stoneLight);
    plinth.position.set(0, 0.625, 0);
    plinth.receiveShadow = true;
    plinth.castShadow = true;
    g.add(plinth);

    // Real Vĩnh Tràng facade: central front terrace is BALUSTRADED/CLOSED; pilgrims enter via LEFT & RIGHT SIDE STAIRCASES (cửa hông)
    const centerBal = new THREE.Mesh(new THREE.BoxGeometry(10.4, 1.05, 0.34), M.creamTrim);
    centerBal.position.set(0, 1.78, D / 2 + 0.56);
    g.add(centerBal);
    const centerRailBar = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.16, 0.42), M.goldAccent);
    centerRailBar.position.set(0, 2.34, D / 2 + 0.56);
    g.add(centerRailBar);
    const velvetRope = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 4.2, 10),
      M.redColumn
    );
    velvetRope.rotation.z = Math.PI / 2;
    velvetRope.position.set(0, 2.46, D / 2 + 0.65);
    g.add(velvetRope);

    const sideHintTex = makeTextTex('LỐI VÀO CỬA HÔNG PHẢI →', {
      w: 1024,
      h: 180,
      bg: '#4B2212',
      border: '#FFD875',
      color: '#FFF6E5',
      size: 54
    });
    const sideHintBoard = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.56, 0.14),
      new THREE.MeshStandardMaterial({ map: sideHintTex, roughness: 0.42 })
    );
    sideHintBoard.position.set(0, 1.72, D / 2 + 0.85);
    g.add(sideHintBoard);

    // East Wing Side Porch & Iconic Blue Sign "TỔ ĐÌNH VĨNH TRÀNG" facing Right Pathway (image_97204806.png)
    const eastPorchRoof = makeHippedRoofMesh(4.4, 5.2, 1.35, M.roofTile);
    eastPorchRoof.position.set(W / 2 + 1.85, 4.65, 2.4);
    g.add(eastPorchRoof);
    for (const pz of [0.5, 4.3]) {
      const pCol = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 3.9, 10), M.redColumn);
      pCol.position.set(W / 2 + 3.4, 2.0, pz);
      g.add(pCol);
    }
    const eastBlueSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.86, 4.4),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('TỔ ĐÌNH VĨNH TRÀNG', {
          w: 1024,
          h: 210,
          bg: '#1D4E9E',
          border: '#FFFFFF',
          color: '#FFFFFF',
          size: 74
        }),
        roughness: 0.36
      })
    );
    eastBlueSign.position.set(W / 2 + 3.55, 4.15, 2.4);
    g.add(eastBlueSign);
    this.sideDoorClickTargets.push(eastBlueSign);

    // Two side staircases (cửa hông trái x=-7.2 & phải x=+7.2) leading up onto the porch terrace
    for (const sx of [-7.2, 7.2]) {
      for (let s = 0; s < 5; s++) {
        const step = new THREE.Mesh(
          new THREE.BoxGeometry(3.2, 0.25, 0.52),
          s % 2 === 0 ? M.stoneLight : M.stoneDark
        );
        step.position.set(sx, 0.125 + s * 0.25, D / 2 + 0.8 + (4 - s) * 0.45);
        step.receiveShadow = true;
        g.add(step);
      }
      for (const rx of [sx - 1.7, sx + 1.7]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.35, 2.4), M.goldWall);
        rail.position.set(rx, 0.8, D / 2 + 1.55);
        g.add(rail);
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), M.goldAccent);
        ball.position.set(rx, 1.62, D / 2 + 2.65);
        g.add(ball);
      }
      const doorPlaque = new THREE.Mesh(
        new THREE.BoxGeometry(1.9, 0.44, 0.12),
        new THREE.MeshStandardMaterial({
          map: makeTextTex(sx > 0 ? 'CỬA HÔNG PHẢI' : 'CỬA HÔNG', {
            w: 512,
            h: 140,
            bg: '#1C5A34',
            border: '#FFD875',
            color: '#FFF6E5',
            size: 56
          }),
          roughness: 0.4
        })
      );
      doorPlaque.position.set(sx, 4.35, D / 2 + 0.42);
      g.add(doorPlaque);

      const portalGlow = new THREE.Mesh(
        new THREE.PlaneGeometry(2.1, 3.1),
        new THREE.MeshBasicMaterial({ color: 0xFFE3A6 })
      );
      portalGlow.position.set(sx, 2.8, D / 2 + 0.12);
      g.add(portalGlow);
      this.sideDoorClickTargets.push(portalGlow, doorPlaque);
    }

    const bodyH = 6.2;
    const body = new THREE.Mesh(new THREE.BoxGeometry(W, bodyH, D), M.goldWall);
    body.position.set(0, 1.25 + bodyH / 2, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);

    const upperCream = new THREE.Mesh(new THREE.BoxGeometry(W + 0.25, 1.65, 0.85), M.creamTrim);
    upperCream.position.set(0, 1.25 + bodyH - 0.82, D / 2 - 0.1);
    g.add(upperCream);

    const fz = D / 2 + 0.35;
    const colXs = [-13.0, -11.0, -9.0, -7.0, -5.0, -3.2, -1.65, 1.65, 3.2, 5.0, 7.0, 9.0, 11.0, 13.0];
    for (let i = 0; i < colXs.length; i++) {
      const x = colXs[i];
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 4.3, 14), M.redColumn);
      col.position.set(x, 3.4, fz);
      col.castShadow = true;
      g.add(col);

      const base = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.55, 0.62), M.goldAccent);
      base.position.set(x, 1.52, fz);
      g.add(base);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.4, 0.64), M.goldAccent);
      cap.position.set(x, 5.55, fz);
      g.add(cap);

      const pil = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.5, 0.3), M.goldLight);
      pil.position.set(x, 6.62, fz - 0.12);
      g.add(pil);

      if (i < colXs.length - 1) {
        const nextX = colXs[i + 1];
        const span = nextX - x;
        const cx = (x + nextX) / 2;
        const archR = span * 0.47;
        const isSideDoor = Math.abs(Math.abs(cx) - 8.0) < 0.35;

        const archOuter = new THREE.Mesh(
          new THREE.TorusGeometry(archR, 0.16, 10, 20, Math.PI),
          M.creamTrim
        );
        archOuter.position.set(cx, 4.65, fz);
        g.add(archOuter);

        const archInner = new THREE.Mesh(
          new THREE.TorusGeometry(archR - 0.17, 0.1, 8, 18, Math.PI),
          M.redColumn
        );
        archInner.position.set(cx, 4.65, fz + 0.04);
        g.add(archInner);

        if (!isSideDoor) {
          const recess = new THREE.Mesh(
            new THREE.BoxGeometry(span - 0.32, 3.2, 0.25),
            M.darkOpening
          );
          recess.position.set(cx, 3.55, fz - 0.35);
          g.add(recess);

          const bal = new THREE.Mesh(new THREE.BoxGeometry(span - 0.18, 0.95, 0.32), M.creamTrim);
          bal.position.set(cx, 1.78, fz - 0.05);
          g.add(bal);
          for (let gIdx = -0.45; gIdx <= 0.45; gIdx += 0.3) {
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.3, 6), M.goldAccent);
            bar.position.set(cx + gIdx, 3.5, fz - 0.18);
            g.add(bar);
          }
        }
      }
    }

    // Center sanctuary shuttered traditional doors (veneration niche visible behind balustrades)
    const innerGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 4.0),
      new THREE.MeshBasicMaterial({ color: 0x6A3A14 })
    );
    innerGlow.position.set(0, 3.3, fz - 1.15);
    g.add(innerGlow);

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
    this.chanhDienPorchAltar.add(porchGlow);
    g.add(this.chanhDienPorchAltar);

    const cornice1 = new THREE.Mesh(new THREE.BoxGeometry(W + 1.0, 0.42, D + 1.2), M.goldLight);
    cornice1.position.set(0, 5.85, 0);
    g.add(cornice1);

    const mosaicBand = new THREE.Mesh(new THREE.BoxGeometry(W + 0.6, 0.48, D + 0.6), M.creamTrim);
    mosaicBand.position.set(0, 7.55, 0);
    g.add(mosaicBand);

    const cornice2 = new THREE.Mesh(new THREE.BoxGeometry(W + 1.3, 0.46, D + 1.4), M.creamTrim);
    cornice2.position.set(0, 7.95, 0);
    g.add(cornice2);

    // Ornate Ceramic Mosaic Relief Panels across the bays (bright cream + pastel ceramic sky-blue + gold)
    const pastelCeramic = new THREE.MeshStandardMaterial({ color: 0x5282B8, roughness: 0.45 });
    for (let bi = -3; bi <= 3; bi++) {
      const bx = bi * 3.5;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.92, 0.34), M.creamTrim);
      frame.position.set(bx, 6.65, fz + 0.25);
      g.add(frame);
      const inlay = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.64, 0.38), pastelCeramic);
      inlay.position.set(bx, 6.65, fz + 0.27);
      g.add(inlay);
      const floral = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.32, 0.42), M.goldAccent);
      floral.position.set(bx, 6.65, fz + 0.29);
      g.add(floral);
    }

    // Refined traditional gold-on-crimson plaque tucked above central archway
    const mainSignTex = makeTextTex('CHÙA VĨNH TRÀNG', {
      w: 1536,
      h: 320,
      bg: '#5C1610',
      border: '#FFD86B',
      color: '#FFF2B2',
      size: 130
    });
    const mainSign = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.66, 0.36),
      new THREE.MeshStandardMaterial({
        map: mainSignTex,
        roughness: 0.28,
        emissive: 0x3A1808,
        emissiveIntensity: 0.22
      })
    );
    mainSign.position.set(0, 5.42, fz + 0.36);
    g.add(mainSign);

    // 3 Stepped Baroque-Khmer Pediment Towers (Left [-8.5], Center [0], Right [8.5])
    for (const [gx, gw, gh, tiers] of [
      [-8.5, 5.4, 2.8, 2],
      [0, 7.8, 4.2, 3],
      [8.5, 5.4, 2.8, 2]
    ]) {
      for (let t = 0; t < tiers; t++) {
        const tw = gw * (1 - t * 0.24);
        const th = (gh / tiers) * 1.05;
        const ty = 8.2 + t * (gh / tiers) + th / 2;
        const ped = new THREE.Mesh(new THREE.BoxGeometry(tw, th, 1.15 - t * 0.12), M.goldLight);
        ped.position.set(gx, ty, D / 2 - 0.3);
        g.add(ped);

        const trim = new THREE.Mesh(
          new THREE.BoxGeometry(tw + 0.45, 0.26, 1.28 - t * 0.1),
          M.creamTrim
        );
        trim.position.set(gx, ty + th / 2, D / 2 - 0.3);
        g.add(trim);

        const inl = new THREE.Mesh(
          new THREE.BoxGeometry(tw * 0.56, th * 0.48, 1.22 - t * 0.1),
          pastelCeramic
        );
        inl.position.set(gx, ty, D / 2 - 0.28);
        g.add(inl);
      }

      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.45, 8), M.goldAccent);
      spire.position.set(gx, 8.2 + gh + 0.75, D / 2 - 0.3);
      g.add(spire);
    }

    const roof1 = makeHippedRoofMesh(W + 2.4, D + 1.6, 2.6, M.roofTile);
    roof1.position.set(0, 9.45, -0.3);
    roof1.castShadow = true;
    g.add(roof1);

    const roof2 = makeHippedRoofMesh(W - 4.8, D - 3.2, 2.3, M.roofTile);
    roof2.position.set(0, 11.2, -0.5);
    roof2.castShadow = true;
    g.add(roof2);

    for (const tx of [-15.6, 15.6]) {
      const tBase = new THREE.Mesh(new THREE.BoxGeometry(3.6, 7.6, 3.6), M.goldWall);
      tBase.position.set(tx, 3.8, D / 2 - 1.4);
      tBase.castShadow = true;
      g.add(tBase);

      const tTop = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.8, 3.0), M.goldLight);
      tTop.position.set(tx, 9.0, D / 2 - 1.4);
      g.add(tTop);

      const tRoof = makeHippedRoofMesh(3.8, 3.8, 1.8, M.roofTile);
      tRoof.position.set(tx, 11.3, D / 2 - 1.4);
      g.add(tRoof);
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

    this.addRectObstacle(9.5, 13.8, -6.5, 8.2);
    this.addRectObstacle(17.8, 28.2, -6.5, 8.2);
    this.addRectObstacle(32.2, 36.5, -6.5, 8.2);
    this.addRectObstacle(9.5, 36.5, -6.5, 0.5);
    return g;
  }

  buildResidentialFoodHouses() {
    const M = this.MAT;
    const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x5B5C57, roughness: 0.96 });
    const pavementMat = new THREE.MeshStandardMaterial({ color: 0xBDB6A8, roughness: 0.9 });
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x8E8A80, roughness: 0.92 });
    const drainMat = new THREE.MeshStandardMaterial({ color: 0x4B514A, roughness: 0.98 });
    const timberMat = new THREE.MeshStandardMaterial({ map: this.woodGrainTex, color: 0x69452D, roughness: 0.78 });
    const darkTimberMat = new THREE.MeshStandardMaterial({ color: 0x3D2A20, roughness: 0.84 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x9DB5B2, roughness: 0.2, metalness: 0.12 });
    const shutterMat = new THREE.MeshStandardMaterial({ color: 0x3E6A50, roughness: 0.76 });
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0xE9E1D0, roughness: 0.36 });
    const foodMat = new THREE.MeshStandardMaterial({ color: 0xD8B96F, roughness: 0.72 });

    // A narrow neighbourhood lane branches from the Nguyễn Trung Trực approach.
    // It is intentionally modest: patched asphalt, shallow drains, concrete footpath and overhead wires.
    const junction = new THREE.Mesh(new THREE.BoxGeometry(19, 0.12, 8.4), asphaltMat);
    junction.position.set(73.5, 0.015, 50.4);
    junction.receiveShadow = true;
    this.exteriorGroup.add(junction);

    const lane = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.12, 62), asphaltMat);
    lane.position.set(77.5, 0.02, 81);
    lane.receiveShadow = true;
    this.exteriorGroup.add(lane);

    const westCurb = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 62), curbMat);
    westCurb.position.set(73.75, 0.08, 81);
    this.exteriorGroup.add(westCurb);
    const eastCurb = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 62), curbMat);
    eastCurb.position.set(81.25, 0.08, 81);
    this.exteriorGroup.add(eastCurb);

    const footpath = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 62), pavementMat);
    footpath.position.set(82.7, 0.04, 81);
    footpath.receiveShadow = true;
    this.exteriorGroup.add(footpath);

    const drain = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 61.5), drainMat);
    drain.position.set(72.95, 0.03, 81);
    this.exteriorGroup.add(drain);
    for (let z = 53; z <= 109; z += 2.4) {
      const grate = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 0.08), curbMat);
      grate.position.set(72.95, 0.14, z);
      this.exteriorGroup.add(grate);
    }

    // Faded edge marks, not a modern multilane road.
    const edgeMarkMat = new THREE.MeshBasicMaterial({ color: 0xC8C3B7, transparent: true, opacity: 0.48 });
    for (const x of [74.0, 81.0]) {
      const mark = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.015, 60), edgeMarkMat);
      mark.position.set(x, 0.09, 81);
      this.exteriorGroup.add(mark);
    }

    // Three weathered utility poles and loose overhead service wires.
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x817C70, roughness: 0.88 });
    const wireMat = new THREE.LineBasicMaterial({ color: 0x303538, transparent: true, opacity: 0.62 });
    const poleZs = [57, 78, 99];
    for (const pz of poleZs) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.17, 7.6, 8), poleMat);
      pole.position.set(72.25, 3.8, pz);
      pole.castShadow = true;
      this.exteriorGroup.add(pole);
      const crossbar = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.12, 0.14), poleMat);
      crossbar.position.set(72.25, 7.25, pz);
      this.exteriorGroup.add(crossbar);
    }
    for (let i = 0; i < poleZs.length - 1; i++) {
      const z1 = poleZs[i];
      const z2 = poleZs[i + 1];
      for (const x of [71.85, 72.25, 72.65]) {
        const pts = [
          new THREE.Vector3(x, 7.25, z1),
          new THREE.Vector3(x + 0.08, 6.72, (z1 + z2) * 0.5),
          new THREE.Vector3(x, 7.25, z2)
        ];
        this.exteriorGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wireMat));
      }
    }

    const addPotPlant = (parent, x, z, flowerColor = 0xE783A8) => {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.48, 12), M.terracottaPot);
      pot.position.set(x, 0.24, z);
      parent.add(pot);
      const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.035, 10), darkTimberMat);
      soil.position.set(x, 0.49, z);
      parent.add(soil);
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const leaf = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 8, 7),
          i % 2 === 0 ? M.foliageLight : M.foliageMid
        );
        leaf.scale.set(0.72, 0.42, 1.35);
        leaf.position.set(x + Math.cos(angle) * 0.2, 0.82 + (i % 2) * 0.12, z + Math.sin(angle) * 0.2);
        parent.add(leaf);
      }
      const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 7), new THREE.MeshStandardMaterial({ color: flowerColor, roughness: 0.55 }));
      bloom.position.set(x + 0.05, 1.0, z);
      parent.add(bloom);
    };

    const buildDiningTable = (parent, tx, tz, tableColor = 0x785236) => {
      const tableMat = new THREE.MeshStandardMaterial({ color: tableColor, map: this.woodGrainTex, roughness: 0.76 });
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.12, 0.95), tableMat);
      top.position.set(tx, 0.9, tz);
      top.castShadow = true;
      parent.add(top);
      for (const dx of [-0.66, 0.66]) {
        for (const dz of [-0.36, 0.36]) {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.82, 0.09), tableMat);
          leg.position.set(tx + dx, 0.45, tz + dz);
          parent.add(leg);
        }
      }
      for (const dx of [-1.05, 1.05]) {
        const bench = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.86), timberMat);
        bench.position.set(tx + dx, 0.35, tz);
        parent.add(bench);
        const benchLegA = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.32, 0.07), timberMat);
        benchLegA.position.set(tx + dx, 0.16, tz - 0.3);
        parent.add(benchLegA);
        const benchLegB = benchLegA.clone();
        benchLegB.position.z = tz + 0.3;
        parent.add(benchLegB);
      }
    };

    const addBowl = (parent, x, y, z, foodColor = 0xD7BD7B) => {
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.11, 14), bowlMat);
      bowl.position.set(x, y, z);
      parent.add(bowl);
      const food = new THREE.Mesh(new THREE.CircleGeometry(0.16, 12), new THREE.MeshStandardMaterial({ color: foodColor, roughness: 0.82 }));
      food.rotation.x = -Math.PI / 2;
      food.position.set(x, y + 0.062, z);
      parent.add(food);
      for (let i = 0; i < 3; i++) {
        const herb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), M.foliageLight);
        herb.position.set(x - 0.06 + i * 0.06, y + 0.09, z + (i % 2) * 0.05);
        parent.add(herb);
      }
    };

    const buildFamilyEatery = (id, title, x, z, variant = 'hut_tieu') => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = -Math.PI / 2;
      g.userData.stallType = 'local_eatery';
      g.userData.stallTitle = title;
      g.userData.eateryId = id;
      g.userData.localEateryId = id;

      const wallColor = variant === 'hut_tieu' ? 0xE9DFC9 : 0xE6E7D7;
      const wallMat = new THREE.MeshStandardMaterial({ map: this.limeWallTex, color: wallColor, roughness: 0.88 });
      const floorMat = new THREE.MeshStandardMaterial({ map: this.pavingTex, color: 0xD9D0C0, roughness: 0.88 });
      const roofMat = new THREE.MeshStandardMaterial({ map: this.tinRoofTex, color: variant === 'hut_tieu' ? 0x8C4435 : 0x426B5A, roughness: 0.72, metalness: 0.08 });
      const trimMat = new THREE.MeshStandardMaterial({ color: variant === 'hut_tieu' ? 0xB88D5C : 0xB5A27E, roughness: 0.8 });

      const floor = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.18, 10.8), floorMat);
      floor.position.set(0, 0.09, 0.25);
      floor.receiveShadow = true;
      g.add(floor);

      const backWall = new THREE.Mesh(new THREE.BoxGeometry(9.6, 3.3, 0.24), wallMat);
      backWall.position.set(0, 1.76, -4.7);
      backWall.castShadow = true;
      g.add(backWall);

      for (const sx of [-4.7, 4.7]) {
        const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.3, 9.4), wallMat);
        sideWall.position.set(sx, 1.76, 0);
        sideWall.castShadow = true;
        g.add(sideWall);
      }

      // The front remains open like a family dining room; there is no market counter or street-facing stall.
      for (const sx of [-4.05, 4.05]) {
        const frontPier = new THREE.Mesh(new THREE.BoxGeometry(1.3, 3.25, 0.28), trimMat);
        frontPier.position.set(sx, 1.72, 4.62);
        g.add(frontPier);
      }
      for (const sx of [-4.55, 0, 4.55]) {
        const column = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.05, 0.2), timberMat);
        column.position.set(sx, 1.55, 5.25);
        g.add(column);
      }

      const roof = makeHippedRoofMesh(11.1, 12.0, 1.8, roofMat);
      roof.position.set(0, 4.0, 0.15);
      roof.castShadow = true;
      g.add(roof);
      const eaveBeam = new THREE.Mesh(new THREE.BoxGeometry(10.3, 0.16, 0.18), timberMat);
      eaveBeam.position.set(0, 3.12, 4.72);
      g.add(eaveBeam);
      const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.12, 2.55), roofMat);
      porchRoof.position.set(0, 3.0, 5.75);
      porchRoof.rotation.x = 0.08;
      porchRoof.castShadow = true;
      g.add(porchRoof);

      // Open wooden double doors and modest front windows.
      for (const sx of [-1.05, 1.05]) {
        const door = new THREE.Mesh(new THREE.BoxGeometry(1.85, 2.3, 0.12), timberMat);
        door.position.set(sx, 1.22, 4.55);
        door.rotation.y = sx < 0 ? -0.18 : 0.18;
        g.add(door);
      }
      for (const sx of [-3.75, 3.75]) {
        const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.3, 0.16), darkTimberMat);
        windowFrame.position.set(sx, 1.9, 4.7);
        g.add(windowFrame);
        const windowGlass = new THREE.Mesh(new THREE.BoxGeometry(1.38, 1.04, 0.08), glassMat);
        windowGlass.position.set(sx, 1.92, 4.79);
        g.add(windowGlass);
        for (const side of [-1, 1]) {
          const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.18, 0.12), shutterMat);
          shutter.position.set(sx + side * 0.82, 1.9, 4.76);
          g.add(shutter);
        }
      }

      // A small hand-painted wooden name board, attached to the house rather than a freestanding stall.
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(3.55, 0.56, 0.12),
        new THREE.MeshStandardMaterial({
          map: makeTextTex(variant === 'hut_tieu' ? 'HỦ TIẾU MỸ THO' : 'BÁNH BÈO · CHÈ NHÀ',
            { w: 900, h: 150, bg: '#60452E', border: '#C9AD7A', color: '#F4E6C7', size: 48 }),
          roughness: 0.78
        })
      );
      sign.position.set(0, 3.05, 6.55);
      g.add(sign);

      const kitchenCounter = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.86, 0.85), timberMat);
      kitchenCounter.position.set(0, 0.58, -3.45);
      g.add(kitchenCounter);
      const kitchenBack = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.15, 0.12), wallMat);
      kitchenBack.position.set(0, 1.48, -4.12);
      g.add(kitchenBack);

      // A compact family kitchen visible through the open front.
      const stove = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.56, 0.8), darkTimberMat);
      stove.position.set(2.75, 0.42, -3.25);
      g.add(stove);
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.29, 0.42, 12), new THREE.MeshStandardMaterial({ color: 0x8E9897, metalness: 0.52, roughness: 0.42 }));
      pot.position.set(2.75, 0.92, -3.25);
      g.add(pot);
      const potLid = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.045, 12), curbMat);
      potLid.position.set(2.75, 1.15, -3.25);
      g.add(potLid);

      buildDiningTable(g, -2.05, 0.6, variant === 'hut_tieu' ? 0x765037 : 0x73573A);
      buildDiningTable(g, 2.05, 0.6, variant === 'hut_tieu' ? 0x765037 : 0x73573A);
      if (variant === 'hut_tieu') {
        addBowl(g, -2.05, 1.02, 0.6, 0xD7B66C);
        addBowl(g, 2.05, 1.02, 0.6, 0xD7B66C);
      } else {
        for (const [bx, bz] of [[-2.25, 0.55], [-1.85, 0.55], [1.85, 0.55], [2.25, 0.55]]) {
          const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.06, 12), bowlMat);
          tray.position.set(bx, 1.0, bz);
          g.add(tray);
          const cake = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.08, 10), foodMat);
          cake.position.set(bx, 1.07, bz);
          g.add(cake);
        }
      }

      const ceilingLamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 7), new THREE.MeshBasicMaterial({ color: 0xFFE2A8 }));
      ceilingLamp.position.set(0, 2.75, 0.1);
      g.add(ceilingLamp);
      const warmLight = new THREE.PointLight(0xFFD99B, 0.48, 13);
      warmLight.position.set(0, 2.55, -0.2);
      g.add(warmLight);

      addPotPlant(g, -4.1, 5.9, 0xE985A7);
      addPotPlant(g, 4.1, 5.9, 0xE8B36F);
      const waterJar = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10), M.terracottaPot);
      waterJar.scale.set(0.95, 1.15, 0.95);
      waterJar.position.set(-4.2, 0.43, 4.55);
      g.add(waterJar);

      this.exteriorGroup.add(g);
      this.stallClickTargets.push(g);
      this.stallTriggers.push({
        x: x - 5.6,
        z,
        radius: 5.6,
        stallType: 'local_eatery',
        eateryId: id,
        title
      });

      // Axis-aligned collision around the side and back walls; the wide front doorway stays walkable.
      this.addRectObstacle(x + 4.45, x + 4.95, z - 4.7, z + 4.7);
      this.addRectObstacle(x - 4.85, x + 4.45, z - 4.95, z - 4.45);
      this.addRectObstacle(x - 4.85, x + 4.45, z + 4.45, z + 4.95);
      this.addRectObstacle(x - 4.95, x - 4.45, z - 4.7, z - 2.85);
      this.addRectObstacle(x - 4.95, x - 4.45, z + 2.85, z + 4.7);

      // A short concrete apron links the house veranda to the footpath.
      const apron = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.08, 5.6), pavementMat);
      apron.position.set(x - 6.05, 0.035, z);
      apron.receiveShadow = true;
      this.exteriorGroup.add(apron);
    };

    buildFamilyEatery('hut_tieu_co_ba', 'Nhà Cô Ba · Hủ tiếu Mỹ Tho', 91, 60, 'hut_tieu');
    buildFamilyEatery('banh_beo_di_sau', 'Bếp Dì Sáu · Bánh bèo & chè', 91, 80, 'banh_beo');

    // An ordinary family home completes the short lane: closed timber doors, a tiny garden and a clothesline.
    const home = new THREE.Group();
    home.position.set(91, 0, 100);
    home.rotation.y = -Math.PI / 2;
    const homeWall = new THREE.MeshStandardMaterial({ map: this.limeWallTex, color: 0xE6E1D2, roughness: 0.9 });
    const homeRoofMat = new THREE.MeshStandardMaterial({ map: this.tinRoofTex, color: 0x536F78, roughness: 0.76, metalness: 0.1 });
    const homeFloor = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.18, 10.4), pavementMat);
    homeFloor.position.set(0, 0.09, 0.2);
    home.add(homeFloor);
    const homeBody = new THREE.Mesh(new THREE.BoxGeometry(9.2, 3.25, 8.8), homeWall);
    homeBody.position.set(0, 1.72, -0.1);
    home.add(homeBody);
    const homeRoof = makeHippedRoofMesh(10.8, 11.3, 1.7, homeRoofMat);
    homeRoof.position.set(0, 3.95, 0);
    home.add(homeRoof);
    const homePorch = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.12, 2.3), homeRoofMat);
    homePorch.position.set(0, 3.0, 5.15);
    homePorch.rotation.x = 0.08;
    home.add(homePorch);
    for (const sx of [-4.2, 0, 4.2]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.8, 0.18), timberMat);
      post.position.set(sx, 1.45, 5.7);
      home.add(post);
    }
    const frontDoor = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.2, 0.12), timberMat);
    frontDoor.position.set(0, 1.2, 4.35);
    home.add(frontDoor);
    for (const sx of [-3.0, 3.0]) {
      const window = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.15, 0.12), glassMat);
      window.position.set(sx, 1.85, 4.4);
      home.add(window);
      const shutter = new THREE.Mesh(new THREE.BoxGeometry(1.48, 1.28, 0.12), shutterMat);
      shutter.position.set(sx, 1.85, 4.48);
      home.add(shutter);
    }
    addPotPlant(home, -4.1, 5.9, 0xE58D9C);
    addPotPlant(home, 4.1, 5.9, 0xD7A75D);
    const clothesPoleA = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 2.8, 7), timberMat);
    clothesPoleA.position.set(-5.4, 1.4, -1.8);
    home.add(clothesPoleA);
    const clothesPoleB = clothesPoleA.clone();
    clothesPoleB.position.x = 5.4;
    home.add(clothesPoleB);
    const clothesLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-5.4, 2.65, -1.8), new THREE.Vector3(5.4, 2.65, -1.8)]),
      new THREE.LineBasicMaterial({ color: 0x6D6A61 })
    );
    home.add(clothesLine);
    for (let i = 0; i < 4; i++) {
      const cloth = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.75, 0.05),
        new THREE.MeshStandardMaterial({ color: [0xE6D8C1, 0xA7C3B4, 0xD9A0A1, 0xE6C76C][i], roughness: 0.86, side: THREE.DoubleSide })
      );
      cloth.position.set(-3.2 + i * 1.9, 2.05, -1.8);
      home.add(cloth);
    }
    this.exteriorGroup.add(home);
    this.addRectObstacle(95.45, 95.95, 95.4, 104.6);
    this.addRectObstacle(86.05, 95.45, 95.0, 95.5);
    this.addRectObstacle(86.05, 95.45, 104.5, 105.0);

    // Two parked motorbikes and a few household objects make the lane feel lived-in, not commercial.
    const addNeighbourMotorbike = (mx, mz, color) => {
      const bike = new THREE.Group();
      const rubber = new THREE.MeshStandardMaterial({ color: 0x202225, roughness: 0.88 });
      const paint = new THREE.MeshStandardMaterial({ color, roughness: 0.42, metalness: 0.12 });
      for (const wz of [-0.58, 0.58]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.1, 12), rubber);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(0, 0.24, wz);
        bike.add(wheel);
      }
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.92), paint);
      body.position.set(0, 0.55, 0);
      bike.add(body);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.13, 0.58), darkTimberMat);
      seat.position.set(0, 0.82, -0.1);
      bike.add(seat);
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.08), curbMat);
      handle.position.set(0, 1.0, 0.43);
      bike.add(handle);
      bike.position.set(mx, 0, mz);
      bike.rotation.y = Math.PI / 2;
      this.exteriorGroup.add(bike);
    };
    addNeighbourMotorbike(84.4, 64.2, 0x8D2D27);
    addNeighbourMotorbike(84.4, 84.1, 0x345C83);

    // Low garden tree and banana clump soften the edge of the residential lane.
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.25, 3.2, 8), M.trunk);
    trunk.position.y = 1.6;
    tree.add(trunk);
    for (let i = 0; i < 7; i++) {
      const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.45, 1), i % 2 ? M.foliageLight : M.foliageMid);
      crown.scale.set(1.15, 0.72, 1.1);
      crown.position.set(Math.cos(i * 0.9) * 0.72, 3.15 + (i % 3) * 0.25, Math.sin(i * 0.9) * 0.72);
      tree.add(crown);
    }
    tree.position.set(84.2, 0, 94.0);
    this.exteriorGroup.add(tree);
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

    // 1. Đại Tượng Phật A Di Đà (North head of Central Avenue in front of 7-tier Bảo Tháp, facing South!)
    this.adidaGroup = new THREE.Group();
    this.adidaGroup.position.set(-8.0, 0, -25.0);
    const adidaTerrace = new THREE.Mesh(
      new THREE.CylinderGeometry(6.8, 7.4, 0.36, 16),
      M.stoneLight
    );
    adidaTerrace.position.y = 0.18;
    adidaTerrace.receiveShadow = true;
    this.adidaGroup.add(adidaTerrace);

    const adidaFrontSign = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 0.85, 0.16),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('ĐẠI TƯỢNG PHẬT A DI ĐÀ (CAO 24M)', { w: 1024, h: 200, size: 52 })
      })
    );
    adidaFrontSign.position.set(0, 0.85, 5.4);
    this.adidaGroup.add(adidaFrontSign);

    for (let i = -2; i <= 2; i++) {
      const ang = i * 0.35;
      const tx = Math.sin(ang) * 7.6;
      const tz = -Math.cos(ang) * 7.6;
      const t = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 4.8, 8), M.trunk);
      trunk.position.y = 2.4;
      t.add(trunk);
      const crown = new THREE.Mesh(new THREE.SphereGeometry(2.4, 12, 10), M.foliageDark);
      crown.position.y = 5.4;
      crown.scale.set(1.12, 1.08, 1.12);
      t.add(crown);
      t.position.set(tx, 0, tz);
      this.adidaGroup.add(t);
    }
    this.exteriorGroup.add(this.adidaGroup);
    this.addObstacle(-8.0, -25.0, 5.4);

    // 2. Đại Tượng Phật Di Lặc (Seated on West Terrace facing South onto the wide Arhat Garden Plaza)
    this.dilacGroup = new THREE.Group();
    this.dilacGroup.position.set(-24.5, 0, 4.0);
    const dilacTerrace = new THREE.Mesh(new THREE.BoxGeometry(16.8, 4.1, 18.2), M.stoneLight);
    dilacTerrace.position.set(0, 2.05, 1.8);
    dilacTerrace.receiveShadow = true;
    dilacTerrace.castShadow = true;
    this.dilacGroup.add(dilacTerrace);

    for (let st = 0; st < 7; st++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(11.6, 0.25, 0.48),
        st % 2 === 0 ? M.stoneLight : M.creamTrim
      );
      step.position.set(0, 0.125 + st * 0.25, 16.5 - st * 0.42);
      step.receiveShadow = true;
      this.dilacGroup.add(step);
    }
    const stairLanding = new THREE.Mesh(new THREE.BoxGeometry(16.0, 1.72, 3.6), M.creamTrim);
    stairLanding.position.set(0, 0.86, 12.3);
    stairLanding.receiveShadow = true;
    this.dilacGroup.add(stairLanding);

    const railMetal = new THREE.MeshStandardMaterial({ color: 0xD8DCE2, metalness: 0.85, roughness: 0.18 });
    for (const hx of [-5.6, 5.6]) {
      const postBot = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), railMetal);
      postBot.position.set(hx, 0.45, 16.6);
      this.dilacGroup.add(postBot);
      const postTop = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), railMetal);
      postTop.position.set(hx, 2.15, 13.7);
      this.dilacGroup.add(postTop);
      const railBar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 3.45, 8), railMetal);
      railBar.position.set(hx, 1.65, 15.15);
      railBar.rotation.x = Math.PI / 2 - 0.5;
      this.dilacGroup.add(railBar);
    }

    const dilacBlackBand = new THREE.Mesh(
      new THREE.BoxGeometry(16.0, 1.25, 0.34),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('當 來 彌 勒 大 佛', {
          w: 1400,
          h: 190,
          bg: '#1C1E21',
          border: '#3C3E42',
          color: '#E7B448',
          size: 86
        }),
        roughness: 0.38
      })
    );
    dilacBlackBand.position.set(0, 3.55, 11.02);
    this.dilacGroup.add(dilacBlackBand);

    const dilacRedBand = new THREE.Mesh(
      new THREE.BoxGeometry(16.0, 1.0, 0.38),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('NAM MÔ ĐƯƠNG LAI DI LẶC TÔN PHẬT', {
          w: 1500,
          h: 170,
          bg: '#A6432B',
          border: '#7E2B19',
          color: '#FFD76E',
          size: 56
        }),
        roughness: 0.56
      })
    );
    dilacRedBand.position.set(0, 2.42, 11.05);
    this.dilacGroup.add(dilacRedBand);

    this.exteriorGroup.add(this.dilacGroup);
    this.addRectObstacle(-33.0, -16.0, -2.5, 16.2);

    // West Arhat Garden Plaza Statues & Manicured Round Shrubs flanking Di Lặc Courtyard (image_97204806.png left)
    for (const wx of [-36.2, -13.2]) {
      for (let zi = 0; zi < 4; zi++) {
        const wz = 22.5 + zi * 4.8;
        const ped = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.72, 1.15), M.creamTrim);
        ped.position.set(wx, 0.36, wz);
        ped.receiveShadow = true;
        this.exteriorGroup.add(ped);
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 1.35, 10), M.statueWhite);
        body.position.set(wx, 1.38, wz);
        body.castShadow = true;
        this.exteriorGroup.add(body);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), M.statueWhite);
        head.position.set(wx, 2.22, wz);
        this.exteriorGroup.add(head);

        const bushPot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.42, 0.52, 12), M.creamTrim);
        bushPot.position.set(wx, 0.26, wz - 2.3);
        this.exteriorGroup.add(bushPot);
        const bush = new THREE.Mesh(new THREE.SphereGeometry(0.75, 10, 8), M.foliageMid);
        bush.position.set(wx, 1.05, wz - 2.3);
        bush.castShadow = true;
        this.exteriorGroup.add(bush);
      }
    }

    // 3. Đại Tượng Phật Niết Bàn (North-Right Garden behind Monastic Hall, facing South — image_97204806.png)
    this.nietBanGroup = new THREE.Group();
    this.nietBanGroup.position.set(12, 0, -38);
    const nbTerrace = new THREE.Mesh(new THREE.BoxGeometry(29.5, 0.36, 11.2), M.stoneLight);
    nbTerrace.position.y = 0.18;
    nbTerrace.receiveShadow = true;
    this.nietBanGroup.add(nbTerrace);

    const nbSign = new THREE.Mesh(
      new THREE.BoxGeometry(10.5, 1.15, 0.18),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('NAM MÔ BỔN SƯ THÍCH CA MÂU NI PHẬT', {
          w: 1400,
          h: 200,
          bg: '#4E5054',
          border: '#C9962E',
          color: '#FFE08A',
          size: 56
        })
      })
    );
    nbSign.position.set(0, 1.1, 5.75);
    this.nietBanGroup.add(nbSign);
    this.exteriorGroup.add(this.nietBanGroup);
    this.addRectObstacle(-2.0, 26.0, -43.5, -32.5);

    // 4. Đài Quán Thế Âm Bồ Tát (Beside RIGHT bougainvillea side pathway at (32.8, 0, 22.5) facing +X!)
    this.quanAmGroup = new THREE.Group();
    this.quanAmGroup.position.set(32.8, 0, 22.5);
    this.quanAmGroup.rotation.y = Math.PI / 2;
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
    const qaVeil = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.56, 1.25, 10, 1, false, -Math.PI * 0.55, Math.PI * 1.1), M.statueWhite);
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

    // Palm trees & overhead 5-color flag strings flanking the Main Lotus Pond (image_97204806.png!)
    if (showPalmFlagDecor) {
      for (const [px, pz] of [
        [-w / 2 - 0.8, d / 2 - 1.5],
        [-w / 2 - 0.8, 0.5],
        [-w / 2 - 0.8, -d / 2 + 1.5],
        [w / 2 + 0.8, d / 2 - 1.8],
        [w / 2 + 0.8, -d / 2 + 1.8]
      ]) {
        const palm = new THREE.Group();
        const pTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.28, 7.6, 8), M.trunk);
        pTrunk.position.y = 3.8;
        pTrunk.castShadow = true;
        palm.add(pTrunk);
        for (let fi = 0; fi < 7; fi++) {
          const ang = (fi / 7) * Math.PI * 2;
          const frond = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.8, 5), M.foliageLight);
          frond.scale.set(1.2, 1, 0.22);
          frond.position.set(Math.cos(ang) * 1.15, 7.35, Math.sin(ang) * 1.15);
          frond.rotation.z = -Math.cos(ang) * 1.15;
          frond.rotation.x = Math.sin(ang) * 1.15;
          palm.add(frond);
        }
        palm.position.set(px, 0, pz);
        g.add(palm);
      }
      const pondFlagMat = new THREE.MeshBasicMaterial({ map: this.flagTex72, side: THREE.DoubleSide });
      for (const zLine of [-d * 0.25, 0, d * 0.25]) {
        for (let i = 1; i < 11; i++) {
          const t = i / 11;
          const fx = -w * 0.45 + w * 0.9 * t;
          const fy = 4.6 - Math.sin(t * Math.PI) * 0.55;
          const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.38), pondFlagMat);
          fl.position.set(fx, fy, zLine);
          g.add(fl);
        }
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

    // 2. Central Hedge Row of White Arhat Statues dividing Central Avenue & Chánh Điện courtyard (image_97204806.png center!)
    const midHedge = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 18.0), M.foliageDark);
    midHedge.position.set(11.6, 0.325, 15.0);
    this.exteriorGroup.add(midHedge);
    for (let zi = 0; zi < 5; zi++) {
      const sz = 8.0 + zi * 3.4;
      const ped = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.62, 0.95), M.creamTrim);
      ped.position.set(11.6, 0.31, sz);
      this.exteriorGroup.add(ped);
      const fig = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 1.25, 10), M.statueWhite);
      fig.position.set(11.6, 1.25, sz);
      fig.castShadow = true;
      this.exteriorGroup.add(fig);
      const hd = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 8), M.statueWhite);
      hd.position.set(11.6, 2.02, sz);
      this.exteriorGroup.add(hd);
    }

    // 3. RIGHT (East) Side Garden Pathway: Dense overflowing magenta Bougainvillea & Red Garden Railings (x = 33.8 & 38.2)
    const bougCoords = [
      [33.8, 30.2, 1.15],
      [33.8, 25.5, 1.25],
      [33.8, 17.8, 1.22],
      [38.2, 29.0, 1.15],
      [38.2, 21.8, 1.22],
      [38.2, 14.5, 1.18],
      [31.0, 13.5, 1.0],
      [15.0, 10.5, 1.0],
      [-5.5, 16.0, 1.0],
      [-16.5, 19.5, 1.0]
    ];
    for (const [bx, bz, sc] of bougCoords) {
      const pot = new THREE.Group();
      const pMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.58, 0.38, 0.56, 14),
        M.terracottaPot
      );
      pMesh.position.y = 0.28;
      pMesh.castShadow = true;
      pot.add(pMesh);
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 1.35, 8), M.trunk);
      st.position.y = 0.95;
      pot.add(st);
      for (const [ox, oy, oz, r] of [
        [0, 1.85, 0, 0.54],
        [-0.42, 1.62, 0.2, 0.44],
        [0.42, 1.68, -0.18, 0.45],
        [-0.2, 2.15, -0.15, 0.42],
        [0.22, 2.08, 0.22, 0.4],
        [0.48, 1.38, 0.16, 0.34]
      ]) {
        const crown = new THREE.Mesh(new THREE.SphereGeometry(r, 9, 7), M.foliageMid);
        crown.scale.set(1.08, 0.74, 1.08);
        crown.position.set(ox, oy, oz);
        pot.add(crown);
        const fl = new THREE.Mesh(
          new THREE.SphereGeometry(r * 0.84, 8, 6),
          M.bougainvilleaPink
        );
        fl.position.set(ox + 0.07, oy + 0.15, oz + 0.06);
        pot.add(fl);
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

    for (const sideX of [33.8, 38.2]) {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 22.0), M.goldLight);
      curb.position.set(sideX, 0.19, 21.0);
      curb.receiveShadow = true;
      this.exteriorGroup.add(curb);

      const shrubStrip = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.62, 21.5), M.foliageLight);
      shrubStrip.position.set(sideX + (sideX < 36 ? -0.35 : 0.35), 0.36, 21.0);
      this.exteriorGroup.add(shrubStrip);

      // Painted crimson-red garden fence railing along Right Side Path (image_97204806.png right middle!)
      const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 21.5), redFenceMat);
      topBar.position.set(sideX, 0.92, 21.0);
      this.exteriorGroup.add(topBar);
      for (let z = 11.0; z <= 31.0; z += 2.5) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.95, 8), redFenceMat);
        post.position.set(sideX, 0.475, z);
        post.castShadow = true;
        this.exteriorGroup.add(post);
      }
    }

    // Yellow square-post white-globe lamps along Right Side Path
    for (const [lx, lz] of [
      [33.8, 12.5],
      [33.8, 20.5],
      [33.8, 28.5],
      [38.2, 16.5],
      [38.2, 26.5]
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

    // Directional signpost at entrance to Right Side Pathway ("↑ LỐI VÀO CỬA HÔNG PHẢI")
    const dirSignGroup = new THREE.Group();
    dirSignGroup.position.set(38.4, 0, 32.8);
    const dirPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.55, 8), M.darkWood);
    dirPost.position.y = 0.775;
    dirSignGroup.add(dirPost);
    const dirBoard = new THREE.Mesh(
      new THREE.BoxGeometry(2.35, 0.52, 0.1),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('↑ LỐI VÀO CỬA HÔNG PHẢI', {
          w: 820,
          h: 170,
          bg: '#1C5A34',
          border: '#FFD875',
          color: '#FFF6E5',
          size: 44
        }),
        roughness: 0.4
      })
    );
    dirBoard.position.set(0, 1.48, 0);
    dirBoard.rotation.y = -0.35;
    dirSignGroup.add(dirBoard);
    this.exteriorGroup.add(dirSignGroup);

    // Outer Right Garden Row of White Arhat Statues North of Nhà Tạp Hóa (z = 15.6..25.8)
    for (let i = 0; i < 4; i++) {
      const az = 15.6 + i * 3.4;
      const ped = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.68, 1.1), M.creamTrim);
      ped.position.set(47.2, 0.34, az);
      this.exteriorGroup.add(ped);
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, 1.32, 10), M.statueWhite);
      body.position.set(47.2, 1.32, az);
      body.castShadow = true;
      this.exteriorGroup.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), M.statueWhite);
      head.position.set(47.2, 2.15, az);
      this.exteriorGroup.add(head);
    }

    // Two sculpted multi-tier bonsai pots flanking center balustrade
    for (const bx of [19.4, 26.6]) {
      const bPot = new THREE.Group();
      const potMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.64, 0.82, 16), M.terracottaPot);
      potMesh.position.y = 0.41;
      bPot.add(potMesh);
      const bTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 2.3, 10), M.trunk);
      bTrunk.position.y = 1.65;
      bPot.add(bTrunk);
      for (const [cx, cy, cz, rx, ry] of [
        [-0.65, 2.05, 0.15, 0.85, 0.36],
        [0.65, 2.35, -0.1, 0.82, 0.35],
        [0, 2.95, 0, 1.05, 0.42]
      ]) {
        const pad = new THREE.Mesh(new THREE.SphereGeometry(rx, 12, 9), M.foliageLight);
        pad.scale.set(1, ry / rx, 1);
        pad.position.set(cx, cy, cz);
        bPot.add(pad);
      }
      bPot.position.set(bx, 0, 10.1);
      this.exteriorGroup.add(bPot);
      this.addObstacle(bx, 10.1, 0.95);
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

    const flagSpans = [
      [14, 5.8, 38.5, 32, 5.8, 38.5, 12],
      [35, 5.6, 37.5, 46, 5.6, 37.5, 8],
      [35, 5.4, 31.0, 46, 5.4, 31.0, 8],
      [33.8, 5.2, 26.5, 38.2, 5.2, 26.5, 5]
    ];
    const flagMat = new THREE.MeshBasicMaterial({ map: this.flagTex72, side: THREE.DoubleSide });
    for (const [x1, y1, z1, x2, y2, z2, n] of flagSpans) {
      for (let i = 1; i < n; i++) {
        const t = i / n;
        const fx = x1 + (x2 - x1) * t;
        const fz = z1 + (z2 - z1) * t;
        const fy = y1 + (y2 - y1) * t - Math.sin(t * Math.PI) * 0.55;
        const f = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.38), flagMat);
        f.position.set(fx, fy, fz);
        this.exteriorGroup.add(f);
      }
    }
    // Vertical festive "cờ phướn" pilgrimage banners lining Cổng Phụ arrival lane
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
    const M = this.MAT;
    const g = this.interiorGroup;

    // Reset click targets, cutaway list & interior obstacles cleanly
    this.interiorDoorClickTargets = [];
    this.interiorNonBoClickTargets = [];
    this.interiorKhuThoClickTargets = [];
    this.interiorTraiDuongClickTargets = [];
    this.longTruClickTargets = [];
    this.cutawayTargets = [];

    const registerCutaway = (obj) => {
      this.cutawayTargets.push(obj);
      return obj;
    };

    const gachTauMat = new THREE.MeshStandardMaterial({
      map: this.gachTauTex,
      roughness: 0.38,
      metalness: 0.04
    });
    const corridorFloorMat = new THREE.MeshStandardMaterial({
      map: this.pavingTex,
      color: 0xC99E76,
      roughness: 0.5
    });
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x3D2114,
      map: this.woodGrainTex,
      roughness: 0.56
    });
    const creamWallMat = new THREE.MeshStandardMaterial({
      color: 0xECE1C6,
      roughness: 0.65
    });
    const darkLacquerColMat = new THREE.MeshStandardMaterial({
      color: 0x24120B,
      roughness: 0.28,
      metalness: 0.1
    });
    const goldLeafMat = new THREE.MeshStandardMaterial({
      color: 0xE2AF3B,
      metalness: 0.62,
      roughness: 0.24
    });
    const bronzePatinaMat = new THREE.MeshStandardMaterial({
      color: 0x7E5929,
      metalness: 0.45,
      roughness: 0.38
    });
    const ivoryMat = new THREE.MeshStandardMaterial({
      color: 0xEFE8D8,
      roughness: 0.42
    });
    const baoLamMat = new THREE.MeshStandardMaterial({
      color: 0xA87026,
      roughness: 0.34,
      metalness: 0.46
    });
    const rafterMat = new THREE.MeshStandardMaterial({
      color: 0x4E2816,
      map: this.woodGrainTex,
      roughness: 0.62
    });
    const ceilingWoodMat = new THREE.MeshStandardMaterial({
      color: 0x351B10,
      map: this.woodGrainTex,
      roughness: 0.72
    });

    // Helper: Authentic Vietnamese Timber Roof Truss Frame ("Hệ vì kèo chồng rường / kẻ truyền")
    const addTimberViKeoTruss = (centerX, baseY, spanW, apexH, zPos, addPurlins = true) => {
      const truss = new THREE.Group();
      truss.position.set(centerX, baseY, zPos);
      // Horizontal tie-beam ("Quá giang / Câu đầu")
      const tieBeam = new THREE.Mesh(new THREE.BoxGeometry(spanW, 0.22, 0.22), rafterMat);
      truss.add(tieBeam);
      // Central king-post ("Trụ trốn") + intermediate queen-posts ("Trụ bồng")
      const kingPost = new THREE.Mesh(new THREE.BoxGeometry(0.2, apexH, 0.2), rafterMat);
      kingPost.position.y = apexH * 0.5;
      truss.add(kingPost);
      for (const qx of [-spanW * 0.24, spanW * 0.24]) {
        const qH = apexH * 0.54;
        const qp = new THREE.Mesh(new THREE.BoxGeometry(0.16, qH, 0.16), rafterMat);
        qp.position.set(qx, qH * 0.5, 0);
        truss.add(qp);
      }
      // Mid-collar beam ("Xà gồ / Rường")
      const collar = new THREE.Mesh(new THREE.BoxGeometry(spanW * 0.52, 0.16, 0.16), rafterMat);
      collar.position.y = apexH * 0.54;
      truss.add(collar);
      // Pitched principal rafters ("Kèo cái")
      const halfSpan = spanW * 0.52;
      const rafterLen = Math.hypot(halfSpan, apexH);
      const slopeAng = Math.atan2(apexH, halfSpan);
      for (const sSign of [-1, 1]) {
        const raf = new THREE.Mesh(new THREE.BoxGeometry(rafterLen, 0.18, 0.18), rafterMat);
        raf.position.set(sSign * (halfSpan * 0.5), apexH * 0.5, 0);
        raf.rotation.z = sSign * -slopeAng;
        truss.add(raf);
      }
      if (addPurlins) {
        for (const pFrac of [0, 0.35, 0.72]) {
          const px = pFrac * (spanW * 0.45);
          const py = (1 - pFrac) * apexH;
          for (const side of pFrac === 0 ? [0] : [-1, 1]) {
            const purlin = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 5.2), rafterMat);
            purlin.position.set(side * px, py, 0);
            truss.add(purlin);
          }
        }
      }
      g.add(truss);
      return truss;
    };

    // Helper: Pierced Gilded Wood Carving ("Bao Lam chạm rồng phượng thếp vàng")
    const addCarvedBaoLam = (cx, cy, cz, width = 9.2) => {
      const bl = new THREE.Group();
      bl.position.set(cx, cy, cz);
      const topFrieze = new THREE.Mesh(new THREE.BoxGeometry(width, 0.42, 0.24), baoLamMat);
      topFrieze.position.y = 0.32;
      bl.add(topFrieze);
      const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(width + 0.12, 0.1, 0.28), goldLeafMat);
      goldTrim.position.y = 0.55;
      bl.add(goldTrim);
      // Pierced openwork lattice & stylized dragon-phoenix scrollwork
      const nScroll = Math.max(6, Math.floor(width / 0.75));
      for (let i = 0; i < nScroll; i++) {
        const sx = -width * 0.44 + (i / (nScroll - 1)) * (width * 0.88);
        const dropRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.18, 0.045, 6, 12),
          goldLeafMat
        );
        dropRing.position.set(sx, 0.02, 0);
        bl.add(dropRing);
      }
      for (const side of [-1, 1]) {
        const pendant = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.05, 0.2), baoLamMat);
        pendant.position.set(side * (width * 0.5 - 0.85), -0.35, 0);
        bl.add(pendant);
        const wingCarve = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.055, 6, 12, Math.PI), goldLeafMat);
        wingCarve.position.set(side * (width * 0.5 - 1.55), -0.15, 0.04);
        bl.add(wingCarve);
      }
      g.add(bl);
      return bl;
    };

    // Helper: Monumental Coiled-Dragon Lacquer Pillar ("Long Trụ Chánh Điện")
    const addLongTruDragon = (px, pz, sideSign) => {
      const lt = new THREE.Group();
      lt.position.set(px, 0, pz);

      const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.64, 0.44, 16), M.stoneLight);
      plinth.position.y = 0.22;
      lt.add(plinth);
      const lotusBase = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.54, 0.26, 16), goldLeafMat);
      lotusBase.position.y = 0.55;
      lt.add(lotusBase);

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.43, 8.1, 18), darkLacquerColMat);
      shaft.position.y = 4.45;
      lt.add(shaft);

      // 3D Sculpted Coiled Golden Dragon ("Rồng uốn quanh thân cột") via CatmullRom + TubeGeometry
      const helixPts = [];
      const turns = 2.6;
      const steps = 44;
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const ang = u * Math.PI * 2 * turns * sideSign + (sideSign < 0 ? 0.5 : -0.5);
        const radius = 0.47 + Math.sin(u * Math.PI) * 0.05;
        const y = 1.15 + u * 5.35;
        helixPts.push(new THREE.Vector3(Math.cos(ang) * radius, y, Math.sin(ang) * radius));
      }
      const dragonCurve = new THREE.CatmullRomCurve3(helixPts);
      const dragonBodyGeom = new THREE.TubeGeometry(dragonCurve, 56, 0.135, 10, false);
      const dragonBody = new THREE.Mesh(dragonBodyGeom, goldLeafMat);
      lt.add(dragonBody);

      // Dorsal flame fins & gripping dragon claws along spiral
      for (let fi = 2; fi < helixPts.length - 3; fi += 2) {
        const pt = helixPts[fi];
        const radial = new THREE.Vector3(pt.x, 0, pt.z).normalize();
        const fin = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 5), M.redColumn);
        fin.position.set(pt.x + radial.x * 0.12, pt.y + 0.04, pt.z + radial.z * 0.12);
        fin.lookAt(pt.x + radial.x * 0.6, pt.y + 0.2, pt.z + radial.z * 0.6);
        lt.add(fin);
      }

      // Sculpted Dragon Head curving out near nave center facing Chánh Điện aisle
      const headGroup = new THREE.Group();
      const headAng = helixPts[helixPts.length - 1];
      headGroup.position.set(headAng.x * 1.15 - sideSign * 0.25, 6.25, headAng.z + 0.35);
      headGroup.rotation.y = sideSign < 0 ? 0.45 : -0.45;
      const skull = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.58), goldLeafMat);
      headGroup.add(skull);
      const snout = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.36), goldLeafMat);
      snout.position.set(0, -0.02, 0.38);
      headGroup.add(snout);
      const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.32), M.redColumn);
      jaw.position.set(0, -0.14, 0.34);
      jaw.rotation.x = 0.25;
      headGroup.add(jaw);
      for (const hx of [-0.14, 0.14]) {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.42, 6), goldLeafMat);
        horn.position.set(hx, 0.24, -0.14);
        horn.rotation.x = -0.45;
        headGroup.add(horn);
        const eye = new THREE.Mesh(
          new THREE.SphereGeometry(0.045, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0xFF4B2B })
        );
        eye.position.set(hx, 0.08, 0.24);
        headGroup.add(eye);
      }
      // Radiant Flaming Pearl ("Ngọc Minh Châu") held near dragon mouth
      const pearl = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 12, 10),
        new THREE.MeshBasicMaterial({ color: 0xFFF2A8 })
      );
      pearl.position.set(0, -0.04, 0.72);
      headGroup.add(pearl);
      lt.add(headGroup);

      // Crimson-Gold Couplet mounted alongside Long Trụ
      const ltCouplet = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 4.5, 0.12),
        new THREE.MeshStandardMaterial({
          map: this.makeCoupletTex(sideSign < 0 ? '龍柱繞寶殿萬世垂芳' : '法輪常轉正法久住'),
          roughness: 0.32
        })
      );
      ltCouplet.position.set(-sideSign * 0.48, 3.25, 0.36);
      lt.add(ltCouplet);

      lt.userData.isLongTru = true;
      g.add(lt);
      this.longTruClickTargets.push(lt);
      this.interiorObstacles.push({ x: px, z: pz, r: 0.66 });
      return lt;
    };

    // Helper: 18 Visually Distinct Arhat Sculptures + Companion Animals/Props ("Mười tám vị La Hán")
    const buildUniqueArhatStatue = (idx) => {
      const ag = new THREE.Group();
      const beastWoodMat = new THREE.MeshStandardMaterial({ color: 0x7A4B24, roughness: 0.48, metalness: 0.2 });
      const tigerMat = new THREE.MeshStandardMaterial({ color: 0xD4822A, roughness: 0.48 });
      const dragonGreenMat = new THREE.MeshStandardMaterial({ color: 0x2F7E58, metalness: 0.35, roughness: 0.34 });
      const waveBlueMat = new THREE.MeshStandardMaterial({ color: 0x4888B0, roughness: 0.35 });
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x3C7D3E, roughness: 0.55 });
      const whiteBeastMat = new THREE.MeshStandardMaterial({ color: 0xF1ECE0, roughness: 0.44 });

      // Variant poses & companion beast / attribute per index 0..17
      const isStanding = idx === 5 || idx === 15;
      const bodyTiltZ = idx === 11 ? 0.14 : idx === 16 ? -0.1 : 0;
      const bodyMat = idx % 3 === 1 ? bronzePatinaMat : goldLeafMat;

      // Sculpted lotus/rock base or animal companion
      const lotusBase = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.22, 14), M.redColumn);
      lotusBase.position.y = 0.11;
      ag.add(lotusBase);

      // Unique Beast/Mount/Prop Feature per Arhat (0..17)
      if (idx === 0) {
        // 1. Tọa Lộc La Hán — riding deer (hươu)
        const deerBody = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.28, 0.62), beastWoodMat);
        deerBody.position.set(0, 0.36, 0.05);
        ag.add(deerBody);
        const deerHead = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), beastWoodMat);
        deerHead.position.set(0.24, 0.54, 0.24);
        ag.add(deerHead);
        for (const ax of [0.2, 0.28]) {
          const antler = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.24, 5), ivoryMat);
          antler.position.set(ax, 0.72, 0.24);
          ag.add(antler);
        }
      } else if (idx === 4) {
        // 5. Tĩnh Tọa La Hán — rocky peak throne
        const rockSeat = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 0), M.stoneDark);
        rockSeat.scale.set(1.1, 0.72, 1.0);
        rockSeat.position.y = 0.35;
        ag.add(rockSeat);
      } else if (idx === 5) {
        // 6. Quá Giang La Hán — surging waves & river crossing staff
        for (let w = -1; w <= 1; w++) {
          const wave = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 6, 12, Math.PI), waveBlueMat);
          wave.position.set(w * 0.22, 0.26, 0.1);
          ag.add(wave);
        }
      } else if (idx === 6) {
        // 7. Kỵ Tượng La Hán — seated atop sculpted White Elephant (voi trắng)
        const elBody = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), whiteBeastMat);
        elBody.scale.set(0.95, 0.85, 1.35);
        elBody.position.set(0, 0.42, 0.06);
        ag.add(elBody);
        const elTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.34, 8), whiteBeastMat);
        elTrunk.position.set(0, 0.38, 0.48);
        elTrunk.rotation.x = 0.45;
        ag.add(elTrunk);
        for (const tx of [-0.1, 0.1]) {
          const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.18, 6), goldLeafMat);
          tusk.rotation.x = Math.PI / 2;
          tusk.position.set(tx, 0.36, 0.42);
          ag.add(tusk);
        }
      } else if (idx === 7) {
        // 8. Tiếu Sư La Hán — playful lion cub beside knee
        const lionBody = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), goldLeafMat);
        lionBody.position.set(0.28, 0.36, 0.24);
        ag.add(lionBody);
        const mane = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.04, 6, 10), M.redColumn);
        mane.position.set(0.28, 0.48, 0.36);
        ag.add(mane);
      } else if (idx === 13) {
        // 14. Ba Tiêu La Hán — arching banana leaves behind seat
        for (const lx of [-0.26, 0.26]) {
          const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.05, 5), leafMat);
          leaf.position.set(lx, 0.95, -0.18);
          leaf.rotation.z = lx < 0 ? 0.25 : -0.25;
          ag.add(leaf);
        }
      } else if (idx === 16) {
        // 17. Hàng Long La Hán — emerald coiled dragon rising alongside
        const dTail = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.06, 8, 16, Math.PI * 1.45), dragonGreenMat);
        dTail.position.set(-0.24, 0.68, 0.16);
        dTail.rotation.y = 0.5;
        ag.add(dTail);
        const dPearl = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), new THREE.MeshBasicMaterial({ color: 0xFFE985 }));
        dPearl.position.set(0.24, 1.15, 0.22);
        ag.add(dPearl);
      } else if (idx === 17) {
        // 18. Phục Hổ La Hán — crouching striped tiger companion
        const tBody = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.52), tigerMat);
        tBody.position.set(0.28, 0.34, 0.18);
        ag.add(tBody);
        const tHead = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), tigerMat);
        tHead.position.set(0.28, 0.44, 0.42);
        ag.add(tHead);
      }

      // Main Sculpted Arhat Figure (seated / standing / open-chest / belly / long eyebrows)
      const seatOffsetY = idx === 0 || idx === 6 ? 0.52 : idx === 4 ? 0.54 : 0.24;
      const fig = new THREE.Group();
      fig.position.y = seatOffsetY;
      fig.rotation.z = bodyTiltZ;

      const legs = new THREE.Mesh(
        new THREE.CylinderGeometry(isStanding ? 0.22 : 0.3, isStanding ? 0.28 : 0.36, isStanding ? 0.55 : 0.26, 12),
        bodyMat
      );
      legs.position.y = isStanding ? 0.28 : 0.13;
      fig.add(legs);

      const torsoRadius = idx === 12 ? 0.29 : 0.22; // Bố Đại has broad joyful belly!
      const torso = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, torsoRadius, isStanding ? 0.66 : 0.58, 12),
        bodyMat
      );
      torso.position.y = isStanding ? 0.85 : 0.52;
      fig.add(torso);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.165, 12, 10), bodyMat);
      head.position.y = isStanding ? 1.3 : 0.94;
      fig.add(head);

      // Unique Hand & Face Attributes
      if (idx === 1) {
        // 2. Khánh Hỷ — temple hand chime/bell
        const bell = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 8), goldLeafMat);
        bell.position.set(0.26, 0.72, 0.22);
        fig.add(bell);
      } else if (idx === 2) {
        // 3. Cử Bát — raised alms bowl
        const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 8, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55), bronzePatinaMat);
        bowl.position.set(0, 0.84, 0.24);
        fig.add(bowl);
      } else if (idx === 3) {
        // 4. Thác Tháp — 3-tier golden pagoda held on palm
        const pag = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.36, 6), goldLeafMat);
        pag.position.set(0.26, 0.86, 0.18);
        fig.add(pag);
      } else if (idx === 5 || idx === 15) {
        // 6. Quá Giang or 16. Khán Môn — tall staff/paddle
        const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.38, 8), bronzePatinaMat);
        staff.position.set(0.28, 0.72, 0.16);
        fig.add(staff);
        const topRing = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.015, 6, 12), goldLeafMat);
        topRing.position.set(0.28, 1.42, 0.16);
        fig.add(topRing);
      } else if (idx === 8) {
        // 9. Khai Tâm — parted chest showing radiant Buddha emblem
        const emblem = new THREE.Mesh(
          new THREE.CircleGeometry(0.1, 14),
          new THREE.MeshBasicMaterial({ color: 0xFFE680 })
        );
        emblem.position.set(0, 0.56, 0.23);
        fig.add(emblem);
      } else if (idx === 9) {
        // 10. Thám Thủ — both arms stretched skyward
        for (const ax of [-0.2, 0.2]) {
          const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.52, 8), bodyMat);
          arm.position.set(ax, 1.05, 0.04);
          arm.rotation.z = ax < 0 ? 0.18 : -0.18;
          fig.add(arm);
        }
      } else if (idx === 10) {
        // 11. Trầm Tư — resting chin on arm
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.36, 8), bodyMat);
        arm.position.set(0.14, 0.78, 0.16);
        arm.rotation.z = 0.55;
        fig.add(arm);
      } else if (idx === 11) {
        // 12. Khoái Nhĩ — playful hand raised near ear
        const hand = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.34, 8), bodyMat);
        hand.position.set(0.2, 0.9, 0.1);
        hand.rotation.z = 0.45;
        fig.add(hand);
      } else if (idx === 12) {
        // 13. Bố Đại — large cloth sack beside shoulder
        const sack = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), M.mosaicRed);
        sack.scale.set(1.1, 1.25, 0.9);
        sack.position.set(-0.28, 0.46, 0.05);
        fig.add(sack);
      } else if (idx === 14) {
        // 15. Trường Mi — twin cascading long white-gold eyebrows
        for (const bx of [-0.07, 0.07]) {
          const brow = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.46, 0.03), ivoryMat);
          brow.position.set(bx, 0.72, 0.17);
          brow.rotation.z = bx < 0 ? 0.16 : -0.16;
          fig.add(brow);
        }
      }

      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.22, 0.28, 18),
        new THREE.MeshBasicMaterial({ color: 0xFFD875, side: THREE.DoubleSide })
      );
      halo.position.set(0, isStanding ? 1.32 : 0.96, -0.12);
      fig.add(halo);

      ag.add(fig);
      ag.userData.arhatIndex = idx;
      return ag;
    };

    // =========================================================================
    // CONTINUOUS FLOOR & COVERED PERIMETER CORRIDORS ("Bố cục Chữ Quốc (國)")
    // x = -14.0..+14.0 (Corridors x = -14..-11.4 & +11.4..+14; Halls x = -11.4..+11.4)
    // z = +11.6..-82.0 (1. Tiền Đường -> 2. Chánh Điện -> 3. Thiên Tỉnh 1 -> 4. Nhà Tổ -> 5. Thiên Tỉnh 2 -> 6. Nhà Hậu)
    // =========================================================================
    const mainHallFloor = new THREE.Mesh(new THREE.BoxGeometry(23.2, 0.2, 94.0), gachTauMat);
    mainHallFloor.position.set(0, -0.1, -35.2);
    mainHallFloor.receiveShadow = true;
    g.add(mainHallFloor);

    // West & East Covered Perimeter Corridor Floors & Colonade Columns
    for (const cSign of [-1, 1]) {
      const cX = cSign * 12.7;
      const cFloor = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.2, 94.0), corridorFloorMat);
      cFloor.position.set(cX, -0.1, -35.2);
      cFloor.receiveShadow = true;
      g.add(cFloor);

      // Corridor ceiling slab (tagged cutaway on West & East outer corridor tops for architectural view)
      const cRoof = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.34, 94.0), ceilingWoodMat));
      cRoof.position.set(cX, 6.9, -35.2);
      g.add(cRoof);

      // Periodic corridor red pillars (skip Cửa Hông opening z=-1.5..+3.3)
      for (let pz = 9.5; pz >= -80.5; pz -= 6.0) {
        if (Math.abs(pz - 0.9) < 2.2) continue;
        const pCol = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 6.9, 10), M.redColumn);
        pCol.position.set(cSign * 11.45, 3.45, pz);
        g.add(pCol);
        this.interiorObstacles.push({ x: cSign * 11.45, z: pz, r: 0.34 });
      }
    }

    // West Outer Perimeter Wall (tagged in cutawayTargets so Cutaway reveals whole temple from South-West!)
    const westFrontSeg = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(0.45, 7.2, 8.6), creamWallMat));
    westFrontSeg.position.set(-14.1, 3.6, 7.5);
    g.add(westFrontSeg);
    const westMainSeg = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(0.45, 7.2, 80.8), creamWallMat));
    westMainSeg.position.set(-14.1, 3.6, -41.7);
    g.add(westMainSeg);
    const westDoorHeader = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(0.45, 3.2, 5.2), creamWallMat));
    westDoorHeader.position.set(-14.1, 5.6, 0.9);
    g.add(westDoorHeader);

    // East Outer Perimeter Wall (open at Cửa Hông z=-1.5..+3.3 AND 3 stairways into Nhà Sàn Trai Đường z=-47..-24!)
    const addEastOuterWallSeg = (zStart, zEnd, height = 7.2) => {
      const len = Math.abs(zEnd - zStart);
      const zMid = (zStart + zEnd) / 2;
      const seg = new THREE.Mesh(new THREE.BoxGeometry(0.45, height, len), creamWallMat);
      seg.position.set(14.1, height / 2, zMid);
      g.add(seg);
      this.interiorRectObstacles.push({
        minX: 13.75,
        maxX: 14.35,
        minZ: Math.min(zStart, zEnd),
        maxZ: Math.max(zStart, zEnd)
      });
    };
    addEastOuterWallSeg(11.6, 3.3);
    addEastOuterWallSeg(-1.5, -24.5);
    // East archway dividers between -24.5..-44.5 opening to Trai Đường stairs (-26.5, -35.5, -42.5)
    addEastOuterWallSeg(-28.5, -33.5);
    addEastOuterWallSeg(-37.5, -40.7);
    addEastOuterWallSeg(-44.3, -82.0);
    for (const archZ of [-26.5, -35.5, -42.5]) {
      const lint = new THREE.Mesh(new THREE.BoxGeometry(0.45, 3.0, 4.0), creamWallMat);
      lint.position.set(14.1, 5.6, archZ);
      g.add(lint);
    }

    // Open Sunlit Cửa Hông Exit Portals (Left x=-14.1 & Right x=+14.1 at z = -1.5..+3.3)
    for (const sideSign of [-1, 1]) {
      const outsideVista = new THREE.Mesh(
        new THREE.PlaneGeometry(7.2, 5.2),
        new THREE.MeshBasicMaterial({ color: 0xFFF7DF })
      );
      outsideVista.rotation.y = sideSign < 0 ? Math.PI / 2 : -Math.PI / 2;
      outsideVista.position.set(sideSign * 15.2, 2.5, 0.9);
      g.add(outsideVista);

      const exitStep = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 4.8), M.graniteGrey);
      exitStep.position.set(sideSign * 13.8, 0.04, 0.9);
      g.add(exitStep);

      const exitPlaque = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.56, 2.6),
        new THREE.MeshStandardMaterial({
          map: makeTextTex(sideSign > 0 ? 'RA CỬA HÔNG PHẢI →' : '← RA CỬA HÔNG TRÁI', {
            w: 760,
            h: 170,
            bg: '#1C5A34',
            border: '#FFD875',
            color: '#FFF6E5',
            size: 46
          }),
          roughness: 0.4
        })
      );
      exitPlaque.position.set(sideSign * 13.5, 4.2, 0.9);
      exitPlaque.userData.exitSide = sideSign > 0 ? 'right' : 'left';
      g.add(exitPlaque);
      this.interiorDoorClickTargets.push(exitPlaque);

      const doorHitbox = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 4.2, 4.8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false })
      );
      doorHitbox.position.set(sideSign * 13.9, 2.1, 0.9);
      doorHitbox.userData.exitSide = sideSign > 0 ? 'right' : 'left';
      g.add(doorHitbox);
      this.interiorDoorClickTargets.push(doorHitbox);
    }

    // Slanted Sunlight Patches & Beams streaming through Open Cửa Hông into Chánh Điện
    const sunPatchMat = new THREE.MeshBasicMaterial({
      color: 0xFFE6A6,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    });
    for (const sxSign of [-1, 1]) {
      const floorSunPatch = new THREE.Mesh(new THREE.PlaneGeometry(10.6, 4.0), sunPatchMat);
      floorSunPatch.rotation.x = -Math.PI / 2;
      floorSunPatch.rotation.z = sxSign < 0 ? -0.2 : 0.2;
      floorSunPatch.position.set(sxSign * 6.4, 0.015, 0.7);
      g.add(floorSunPatch);
    }
    const sunShaftMat = new THREE.MeshBasicMaterial({
      color: 0xFFEAB8,
      transparent: true,
      opacity: 0.075,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    for (const sxSign of [-1, 1]) {
      for (const sz of [-0.3, 1.9]) {
        const shaft = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 3.8), sunShaftMat);
        shaft.position.set(sxSign * 6.5, 2.2, sz);
        shaft.rotation.z = sxSign < 0 ? -0.45 : 0.45;
        g.add(shaft);
      }
    }

    // =========================================================================
    // 1. TIỀN ĐƯỜNG (z: +11.6 .. +1.5) & 2. CHÁNH ĐIỆN (z: +1.5 .. -22.2)
    // =========================================================================
    // Closed South front ceremonial wall (tagged cutaway so isometric cutaway shows front vestibule!)
    const southWall = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(28.4, 8.8, 0.48), wallMat));
    southWall.position.set(0, 4.4, 11.6);
    g.add(southWall);
    const southClosedDoors = registerCutaway(new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 4.8, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x5A2E16, map: this.woodGrainTex, roughness: 0.45 })
    ));
    southClosedDoors.position.set(0, 2.4, 11.35);
    g.add(southClosedDoors);

    // Chánh Điện & Tiền Đường Opaque Ceiling (cutaway target) + Exposed Vì Kèo Timber Roof Trusses (always visible!)
    const chanhCeiling = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(23.4, 0.36, 34.0), ceilingWoodMat));
    chanhCeiling.position.set(0, 10.1, -5.2);
    g.add(chanhCeiling);
    for (let bz = 9.5; bz >= -20.5; bz -= 5.0) {
      addTimberViKeoTruss(0, 7.65, 22.0, 2.25, bz, true);
    }

    // QianTang ("TIỀN ĐƯỜNG") Auxiliary Guardian Altars (Hộ Pháp & Tiêu Diện) + Hoành Phi
    const tienDuongSign = new THREE.Mesh(
      new THREE.BoxGeometry(6.2, 0.86, 0.16),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('TIỀN ĐƯỜNG · HỘ PHÁP VI ĐÀ', {
          w: 1120,
          h: 180,
          bg: '#32140A',
          border: '#FFD875',
          color: '#FFD970',
          size: 56
        })
      })
    );
    tienDuongSign.position.set(0, 6.75, 4.2);
    g.add(tienDuongSign);

    for (const [gx, gTitle] of [[-7.9, 'BAN HỘ PHÁP'], [7.9, 'BAN TIÊU DIỆN']]) {
      const ga = new THREE.Group();
      ga.position.set(gx, 0, 6.2);
      const tbl = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.18, 1.45), darkLacquerColMat);
      tbl.position.y = 0.59;
      ga.add(tbl);
      const fig = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 1.45, 10), goldLeafMat);
      fig.position.set(0, 1.9, -0.2);
      ga.add(fig);
      const hd = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), goldLeafMat);
      hd.position.set(0, 2.76, -0.2);
      ga.add(hd);
      const gb = this.buildIncenseBurner(0.32);
      gb.position.set(0, 1.18, 0.36);
      ga.add(gb);
      const plaque = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.42, 0.1),
        new THREE.MeshStandardMaterial({
          map: makeTextTex(gTitle, { w: 640, h: 130, bg: '#5C1610', border: '#FFD875', color: '#FFD970', size: 40 })
        })
      );
      plaque.position.set(0, 3.4, -0.35);
      ga.add(plaque);
      g.add(ga);
      this.interiorKhuThoClickTargets.push(ga);
      this.interiorRectObstacles.push({ minX: gx - 1.25, maxX: gx + 1.25, minZ: 5.3, maxZ: 7.1 });
    }

    // Warm Golden Lighting for Tiền Đường & Chánh Điện
    const intPoint1 = new THREE.PointLight(0xFFD584, 3.8, 46);
    intPoint1.position.set(0, 7.0, -14);
    g.add(intPoint1);
    const intPoint2 = new THREE.PointLight(0xFFF0C6, 3.0, 34);
    intPoint2.position.set(-7.5, 4.8, 0.9);
    g.add(intPoint2);
    const intPoint3 = new THREE.PointLight(0xFFF0C6, 3.0, 34);
    intPoint3.position.set(7.5, 4.8, 0.9);
    g.add(intPoint3);

    // Monumental Colonnade Columns + Couplets + Pierced Bao Lam Arches (with Long Trụ at z = -9.8!)
    const coupletTexts = [
      '天恩禪寺寶殿莊嚴',
      '慈光普照法界清淨',
      '楊眉同欣海晏河清',
      '三界獨尊十方光明'
    ];
    let colPairIdx = 0;
    for (const z of [7.5, 2.0, -4.0, -9.8, -15.4, -20.2]) {
      const isLongTruRow = Math.abs(z - -9.8) < 0.2;
      for (const x of [-4.8, 4.8]) {
        if (isLongTruRow) {
          addLongTruDragon(x, z, x < 0 ? -1 : 1);
        } else {
          const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.36, 12), M.stoneLight);
          plinth.position.set(x, 0.18, z);
          g.add(plinth);
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 7.6, 16), darkLacquerColMat);
          col.position.set(x, 3.98, z);
          g.add(col);
          const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.36, 16), M.goldAccent);
          ring.position.set(x, 6.7, z);
          g.add(ring);
          this.interiorObstacles.push({ x, z, r: 0.55 });

          if (z <= 2.2 && z >= -15.6) {
            const tex = this.makeCoupletTex(coupletTexts[colPairIdx % coupletTexts.length]);
            const couplet = new THREE.Mesh(
              new THREE.BoxGeometry(0.34, 4.3, 0.12),
              new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35 })
            );
            couplet.position.set(x + (x < 0 ? 0.34 : -0.34), 3.3, z + 0.18);
            g.add(couplet);
            colPairIdx += 1;
          }
        }
      }
      addCarvedBaoLam(0, 6.45, z, 9.2);
    }

    // Spiral Incense Coils ("Nhang Khoanh")
    for (const [ix, iz] of [
      [-2.5, -4],
      [2.5, -4],
      [-2.5, -12.5],
      [2.5, -12.5]
    ]) {
      const coil = new THREE.Mesh(
        new THREE.ConeGeometry(0.55, 0.95, 16, 1, true),
        new THREE.MeshStandardMaterial({ color: 0xC8963E, side: THREE.DoubleSide, wireframe: true })
      );
      coil.position.set(ix, 6.2, iz);
      g.add(coil);
    }

    // Side Inlay Table + Incense Burner + Chuông Pháp Bảo
    const sideTable = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.92, 0.8), darkLacquerColMat);
    sideTable.position.set(3.2, 0.46, -2.5);
    g.add(sideTable);
    const sideBurner = this.buildIncenseBurner(0.32);
    sideBurner.position.set(3.2, 0.92, -2.5);
    g.add(sideBurner);
    this.interiorRectObstacles.push({ minX: 2.35, maxX: 4.05, minZ: -3.05, maxZ: -1.95 });

    const bellStand = new THREE.Group();
    bellStand.position.set(6.8, 0, -10.5);
    const bFrame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.2, 0.8), M.darkWood);
    bFrame.position.y = 1.6;
    bellStand.add(bFrame);
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.62, 1.35, 18), M.bronzeBurner);
    bell.position.y = 1.85;
    bellStand.add(bell);
    g.add(bellStand);
    this.interiorObstacles.push({ x: 6.8, z: -10.5, r: 1.1 });

    // Tam Bảo Central Altar (z = -18.7) — Main Buddha Centerpiece + 2 Flanking Bodhisattvas + Multi-tier Altar
    this.tamBaoAltarGroup = new THREE.Group();
    this.tamBaoAltarGroup.position.set(0, 0, -18.7);
    const tier1 = new THREE.Mesh(new THREE.BoxGeometry(9.0, 1.35, 3.8), M.redColumn);
    tier1.position.y = 0.675;
    this.tamBaoAltarGroup.add(tier1);
    const tier2 = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.4, 2.8), goldLeafMat);
    tier2.position.y = 2.05;
    this.tamBaoAltarGroup.add(tier2);

    // 2 Flanking Bodhisattva Statues ("Bồ Tát Quán Thế Âm & Đại Thế Chí" hai bên tượng chính)
    for (const [bx, crownCol] of [[-2.45, 0xFFF2B2], [2.45, 0xFFE08A]]) {
      const bGroup = new THREE.Group();
      bGroup.position.set(bx, 2.75, 0.1);
      const bLotus = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.56, 0.36, 14), M.redColumn);
      bLotus.position.y = 0.18;
      bGroup.add(bLotus);
      const bRobe = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 1.85, 12), goldLeafMat);
      bRobe.position.y = 1.28;
      bGroup.add(bRobe);
      const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.21, 12, 10), goldLeafMat);
      bHead.position.y = 2.42;
      bGroup.add(bHead);
      const bCrown = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 8), new THREE.MeshStandardMaterial({ color: crownCol, metalness: 0.6, roughness: 0.25 }));
      bCrown.position.y = 2.72;
      bGroup.add(bCrown);
      const bHalo = new THREE.Mesh(
        new THREE.RingGeometry(0.32, 0.4, 20),
        new THREE.MeshBasicMaterial({ color: 0xFFE684, side: THREE.DoubleSide })
      );
      bHalo.position.set(0, 2.44, -0.14);
      bGroup.add(bHalo);
      this.tamBaoAltarGroup.add(bGroup);
    }

    // Flower vases & brass candlesticks flanking Tam Bảo
    for (const fx of [-3.6, 3.6]) {
      const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.72, 10), M.goldAccent);
      vase.position.set(fx, 1.72, 1.18);
      this.tamBaoAltarGroup.add(vase);
      const lotusTop = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0xF579A8, roughness: 0.45 })
      );
      lotusTop.position.set(fx, 2.22, 1.18);
      this.tamBaoAltarGroup.add(lotusTop);
    }
    for (const cx of [-0.95, 0.95]) {
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.11, 0.78, 8), goldLeafMat);
      stick.position.set(cx, 1.74, 1.28);
      this.tamBaoAltarGroup.add(stick);
      const flame = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), new THREE.MeshBasicMaterial({ color: 0xFFAE38 }));
      flame.position.set(cx, 2.2, 1.28);
      this.tamBaoAltarGroup.add(flame);
    }

    const plaque = new THREE.Mesh(
      new THREE.BoxGeometry(6.6, 0.96, 0.18),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('ĐẠI HÙNG BẢO ĐIỆN · TAM BẢO CHÁNH ĐIỆN', {
          w: 1240,
          h: 220,
          bg: '#32140A',
          border: '#FFD875',
          color: '#FFD970',
          size: 62
        })
      })
    );
    plaque.position.set(0, 6.95, 3.6);
    this.tamBaoAltarGroup.add(plaque);

    for (const [ri, ro, col] of [
      [1.25, 1.42, 0xFFE484],
      [1.54, 1.68, 0xFFA740],
      [1.78, 1.9, 0xFF6A3D]
    ]) {
      const hRing = new THREE.Mesh(
        new THREE.RingGeometry(ri, ro, 32),
        new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide })
      );
      hRing.position.set(0, 5.15, -0.82);
      this.tamBaoAltarGroup.add(hRing);
    }
    g.add(this.tamBaoAltarGroup);
    this.interiorRectObstacles.push({ minX: -4.75, maxX: 4.75, minZ: -21.2, maxZ: -16.2 });

    // Partition Wall behind Tam Bảo (z = -22.2) with TWO WIDE OPEN ARCHED PASSAGES
    const tamBaoBackPanel = new THREE.Mesh(new THREE.BoxGeometry(9.8, 7.8, 0.55), wallMat);
    tamBaoBackPanel.position.set(0, 3.9, -22.2);
    g.add(tamBaoBackPanel);
    this.interiorRectObstacles.push({ minX: -4.9, maxX: 4.9, minZ: -22.55, maxZ: -21.85 });

    for (const archX of [-7.3, 7.3]) {
      const archLint = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3.1, 0.55), wallMat);
      archLint.position.set(archX, 6.25, -22.2);
      g.add(archLint);
      const outerPier = new THREE.Mesh(new THREE.BoxGeometry(2.0, 7.8, 0.55), wallMat);
      outerPier.position.set(archX < 0 ? -10.5 : 10.5, 3.9, -22.2);
      g.add(outerPier);
      this.interiorRectObstacles.push({
        minX: archX < 0 ? -11.55 : 9.45,
        maxX: archX < 0 ? -9.45 : 11.55,
        minZ: -22.55,
        maxZ: -21.85
      });
      const archSign = new THREE.Mesh(
        new THREE.BoxGeometry(3.0, 0.52, 0.14),
        new THREE.MeshStandardMaterial({
          map: makeTextTex('SÂN THIÊN TỈNH 1 · NHÀ TỔ →', {
            w: 840,
            h: 150,
            bg: '#5C1610',
            border: '#FFD875',
            color: '#FFF2B2',
            size: 40
          })
        })
      );
      archSign.position.set(archX, 4.95, -21.82);
      g.add(archSign);
    }

    // 18 UNIQUELY SCULPTED LA HÁN STATUES along West & East walls (9 per side = 18 unique Arhats)
    this.arhatGroups = [];
    const arhatZs = [8.4, 5.2, -3.2, -6.0, -8.8, -11.6, -14.4, -17.2, -20.0];
    let arhatCounter = 0;
    for (const ax of [-9.8, 9.8]) {
      for (const az of arhatZs) {
        const ped = new THREE.Mesh(new THREE.BoxGeometry(1.22, 1.05, 1.22), M.redColumn);
        ped.position.set(ax, 0.525, az);
        g.add(ped);
        const trim = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.14, 1.3), goldLeafMat);
        trim.position.set(ax, 1.06, az);
        g.add(trim);

        const arhatGroup = buildUniqueArhatStatue(arhatCounter);
        arhatGroup.position.set(ax, 1.14, az);
        arhatGroup.rotation.y = ax < 0 ? Math.PI / 2 : -Math.PI / 2;
        g.add(arhatGroup);
        this.arhatGroups.push(arhatGroup);
        this.interiorRectObstacles.push({
          minX: ax - 0.72,
          maxX: ax + 0.72,
          minZ: az - 0.72,
          maxZ: az + 0.72
        });
        arhatCounter += 1;
      }
    }

    // =========================================================================
    // 3. SÂN THIÊN TỈNH 1 (Giếng Trời 1, z: -22.2 .. -38.8) + HÒN NON BỘ 1
    // =========================================================================
    const atriumS = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(23.2, 0.32, 3.0), ceilingWoodMat));
    atriumS.position.set(0, 7.1, -23.7);
    g.add(atriumS);
    const atriumN = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(23.2, 0.32, 3.0), ceilingWoodMat));
    atriumN.position.set(0, 7.1, -37.3);
    g.add(atriumN);

    const atriumSky1 = new THREE.Mesh(
      new THREE.PlaneGeometry(17.8, 11.4),
      new THREE.MeshBasicMaterial({ color: 0x9AD2F6, side: THREE.DoubleSide })
    );
    atriumSky1.rotation.x = Math.PI / 2;
    atriumSky1.position.set(0, 9.8, -30.5);
    registerCutaway(atriumSky1);
    g.add(atriumSky1);

    const atriumDaylight1 = new THREE.PointLight(0xFFF3D4, 4.6, 38);
    atriumDaylight1.position.set(0, 8.2, -30.5);
    g.add(atriumDaylight1);

    for (const vx of [-8.2, 8.2]) {
      for (const vz of [-25.5, -30.5, -35.5]) {
        const vCol = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 7.0, 12), M.redColumn);
        vCol.position.set(vx, 3.5, vz);
        g.add(vCol);
        this.interiorObstacles.push({ x: vx, z: vz, r: 0.4 });
      }
    }

    // Centerpiece 1: HÒN NON BỘ SÂN THIÊN TỈNH 1 (0, 0, -30.5)
    const innerNonBo = new THREE.Group();
    innerNonBo.position.set(0, 0, -30.5);
    const nbBasinOuter = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.68, 6.8), M.stoneDark);
    nbBasinOuter.position.y = 0.34;
    innerNonBo.add(nbBasinOuter);
    const nbWater = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.52, 6.1), M.water);
    nbWater.position.y = 0.46;
    innerNonBo.add(nbWater);

    const innerRockMat = new THREE.MeshStandardMaterial({ color: 0x5E6660, roughness: 0.94, flatShading: true });
    const innerMossMat = new THREE.MeshStandardMaterial({ color: 0x3A7839, roughness: 0.84 });
    for (const [rx, ry, rz, sx, sy, sz, rotY] of [
      [0.0, 2.05, -0.6, 1.45, 2.65, 1.3, 0.4],
      [-1.55, 1.35, 0.35, 1.15, 1.6, 1.05, 1.1],
      [1.65, 1.45, 0.25, 1.2, 1.8, 1.05, 2.1],
      [-0.65, 1.0, 1.25, 0.9, 0.95, 0.85, 0.8],
      [0.85, 1.05, 1.15, 0.9, 1.05, 0.85, 1.7]
    ]) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.0, 0), innerRockMat);
      rock.scale.set(sx, sy, sz);
      rock.rotation.set(0.12, rotY, -0.08);
      rock.position.set(rx, ry, rz);
      innerNonBo.add(rock);
      const moss = new THREE.Mesh(new THREE.SphereGeometry(0.48, 8, 6), innerMossMat);
      moss.scale.set(sx * 0.65, 0.32, sz * 0.65);
      moss.position.set(rx, ry + sy * 0.58, rz);
      innerNonBo.add(moss);
    }
    const bonsaiTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.65, 6), M.darkWood);
    bonsaiTrunk.position.set(1.65, 2.65, 0.25);
    bonsaiTrunk.rotation.z = -0.25;
    innerNonBo.add(bonsaiTrunk);
    const bonsaiLeaf = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), innerMossMat);
    bonsaiLeaf.scale.set(1.3, 0.55, 1.1);
    bonsaiLeaf.position.set(1.78, 3.0, 0.25);
    innerNonBo.add(bonsaiLeaf);

    const innerWaterfall = new THREE.Mesh(
      new THREE.PlaneGeometry(0.88, 2.25),
      new THREE.MeshBasicMaterial({ color: 0xBDEFFB, transparent: true, opacity: 0.84, side: THREE.DoubleSide })
    );
    innerWaterfall.position.set(0.0, 1.65, 0.65);
    innerWaterfall.rotation.x = 0.14;
    innerNonBo.add(innerWaterfall);

    for (const [lx, lz] of [[-2.5, -1.6], [-2.2, 1.9], [2.5, -1.7], [2.6, 1.8], [0.2, 2.3]]) {
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.36, 0.03, 14),
        new THREE.MeshStandardMaterial({ color: 0x357A38, roughness: 0.75 })
      );
      pad.position.set(lx, 0.73, lz);
      innerNonBo.add(pad);
      const bloom = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 0.26, 7),
        new THREE.MeshStandardMaterial({ color: 0xF579A8, roughness: 0.45 })
      );
      bloom.rotation.x = Math.PI;
      bloom.position.set(lx, 0.88, lz);
      innerNonBo.add(bloom);
    }

    // Swimming Koi inside Thiên Tỉnh 1 basin
    for (let ki = 0; ki < 6; ki++) {
      const kColor = ki % 2 === 0 ? 0xFF6B2B : 0xFFD166;
      const koiGroup = new THREE.Group();
      const bodyPivot = new THREE.Group();
      const kbody = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 10, 8),
        new THREE.MeshStandardMaterial({ color: kColor, roughness: 0.3 })
      );
      kbody.scale.set(0.75, 0.65, 2.1);
      bodyPivot.add(kbody);
      const tailPivot = new THREE.Group();
      tailPivot.position.set(0, 0, -0.22);
      const tailMesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.16, 4),
        new THREE.MeshStandardMaterial({ color: 0xFFF3E0, roughness: 0.4 })
      );
      tailMesh.rotation.x = Math.PI / 2;
      tailPivot.add(tailMesh);
      bodyPivot.add(tailPivot);
      koiGroup.add(bodyPivot);
      innerNonBo.add(koiGroup);

      const ctrl = [];
      const a0 = (ki / 6) * Math.PI * 2;
      for (let p = 0; p < 6; p++) {
        const th = a0 + (p / 6) * Math.PI * 2;
        ctrl.push(new THREE.Vector3(Math.cos(th) * 2.8, 0.65, Math.sin(th) * 2.25));
      }
      this.koiList.push({
        mesh: koiGroup,
        bodyPivot,
        tail: tailPivot,
        curve: new THREE.CatmullRomCurve3(ctrl, true, 'catmullrom', 0.5),
        speed: 0.048 + (ki % 3) * 0.01,
        phase: (ki * 0.16) % 1
      });
    }
    const nonBoPlaque = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.48, 0.14),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('SÂN THIÊN TỈNH 1 · HÒN NON BỘ', {
          w: 960,
          h: 130,
          bg: '#1C5A34',
          border: '#FFD875',
          color: '#FFF6E5',
          size: 40
        })
      })
    );
    nonBoPlaque.position.set(0, 0.52, 3.45);
    innerNonBo.add(nonBoPlaque);
    g.add(innerNonBo);
    this.interiorNonBoClickTargets.push(innerNonBo);
    this.interiorRectObstacles.push({ minX: -4.3, maxX: 4.3, minZ: -34.1, maxZ: -26.9 });

    // Courtyard corner bonsai pots matching Sân Thiên Tỉnh reference photos
    for (const [bx, bz] of [[-6.8, -26.0], [6.8, -26.0], [-6.8, -35.0], [6.8, -35.0]]) {
      const pot = this.makeBonsai72(0.75);
      pot.position.set(bx, 0, bz);
      g.add(pot);
      this.interiorObstacles.push({ x: bx, z: bz, r: 0.6 });
    }

    // Helper: Triple-Arched Open Partition Wall with clear center & side walkways (allows seamless walk-through!)
    const addTripleArchPartition = (zPos, signTitle) => {
      for (const pierX of [-10.5, -3.7, 3.7, 10.5]) {
        const pier = new THREE.Mesh(new THREE.BoxGeometry(2.0, 7.6, 0.5), wallMat);
        pier.position.set(pierX, 3.8, zPos);
        g.add(pier);
        this.interiorRectObstacles.push({
          minX: pierX - 1.05,
          maxX: pierX + 1.05,
          minZ: zPos - 0.35,
          maxZ: zPos + 0.35
        });
      }
      const headerBeam = new THREE.Mesh(new THREE.BoxGeometry(22.8, 2.8, 0.5), wallMat);
      headerBeam.position.set(0, 6.2, zPos);
      g.add(headerBeam);
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(5.8, 0.78, 0.16),
        new THREE.MeshStandardMaterial({
          map: makeTextTex(signTitle, {
            w: 1120,
            h: 170,
            bg: '#32140A',
            border: '#FFD875',
            color: '#FFD970',
            size: 52
          })
        })
      );
      board.position.set(0, 5.45, zPos + 0.34);
      g.add(board);
    };

    // =========================================================================
    // 4. NHÀ TỔ · HẬU TỔ ĐƯỜNG (z: -38.8 .. -53.0)
    // =========================================================================
    addTripleArchPartition(-38.8, 'NHÀ TỔ · THỜ CHƯ VỊ TỔ SƯ');

    const toCeiling = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(23.2, 0.36, 14.4), ceilingWoodMat));
    toCeiling.position.set(0, 9.6, -45.9);
    g.add(toCeiling);
    addTimberViKeoTruss(0, 7.45, 22.0, 2.0, -42.5, true);
    addTimberViKeoTruss(0, 7.45, 22.0, 2.0, -48.5, true);

    const thoLight = new THREE.PointLight(0xFFD584, 3.8, 36);
    thoLight.position.set(0, 6.2, -45.8);
    g.add(thoLight);

    for (const cx of [-4.6, 4.6]) {
      for (const cz of [-42.2, -49.5]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 7.4, 14), M.redColumn);
        col.position.set(cx, 3.7, cz);
        g.add(col);
        this.interiorObstacles.push({ x: cx, z: cz, r: 0.42 });
      }
      const couplet = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 3.9, 0.12),
        new THREE.MeshStandardMaterial({
          map: this.makeCoupletTex(cx < 0 ? '祖德流芳萬古存' : '佛光普照千秋盛'),
          roughness: 0.35
        })
      );
      couplet.position.set(cx + (cx < 0 ? 0.32 : -0.32), 3.1, -49.2);
      g.add(couplet);
    }
    addCarvedBaoLam(0, 5.9, -42.2, 9.0);

    // Central Ancestral Altar in Nhà Tổ (z = -46.8, open aisles flanking left/right into Sân Thiên Tỉnh 2!)
    const khuThoMainAltar = new THREE.Group();
    khuThoMainAltar.position.set(0, 0, -46.8);
    const ktTier1 = new THREE.Mesh(new THREE.BoxGeometry(6.8, 1.32, 2.6), darkLacquerColMat);
    ktTier1.position.y = 0.66;
    khuThoMainAltar.add(ktTier1);
    const ktTier2 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.05, 1.5), M.redColumn);
    ktTier2.position.set(0, 1.82, -0.35);
    khuThoMainAltar.add(ktTier2);
    const ktScreen = new THREE.Mesh(new THREE.BoxGeometry(6.8, 4.6, 0.2), M.redColumn);
    ktScreen.position.set(0, 2.3, -1.28);
    khuThoMainAltar.add(ktScreen);
    const ktScreenPlaque = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.78, 0.14),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('TỔ ẤN LƯU TRUYỀN', {
          w: 960,
          h: 160,
          bg: '#32140A',
          border: '#FFD875',
          color: '#FFD970',
          size: 56
        })
      })
    );
    ktScreenPlaque.position.set(0, 4.15, -1.12);
    khuThoMainAltar.add(ktScreenPlaque);

    // 3 Gilded Patriarch Statues + 5 Ancestral Tablets ("Bài Vị Chư Vị Tổ Sư")
    for (const px of [-1.75, 0, 1.75]) {
      const pBody = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 0.92, 12), goldLeafMat);
      pBody.position.set(px, 2.8, -0.2);
      khuThoMainAltar.add(pBody);
      const pHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), goldLeafMat);
      pHead.position.set(px, 3.38, -0.2);
      khuThoMainAltar.add(pHead);
    }
    const tabletTitles = ['CHƯ TỔ', 'TIỀN BỐI', 'TỔ SƯ KHAI SƠN', 'HÒA THƯỢNG', 'CHƯ VỊ'];
    for (let ti = -2; ti <= 2; ti++) {
      const tablet = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 1.15, 0.12),
        new THREE.MeshStandardMaterial({
          map: makeTextTex(tabletTitles[ti + 2], {
            w: 220,
            h: 400,
            bg: ti === 0 ? '#6E1E12' : '#441C0E',
            border: '#FFD875',
            color: '#FFE694',
            size: 32
          }),
          roughness: 0.34
        })
      );
      tablet.position.set(ti * 0.95, 2.95, -0.82);
      khuThoMainAltar.add(tablet);
    }
    const ktBurner = this.buildIncenseBurner(0.5);
    ktBurner.position.set(0, 1.32, 0.72);
    khuThoMainAltar.add(ktBurner);
    for (const vx of [-2.2, 2.2]) {
      const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.6, 10), M.goldAccent);
      vase.position.set(vx, 1.62, 0.65);
      khuThoMainAltar.add(vase);
      const lotusTop = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0xF579A8, roughness: 0.45 })
      );
      lotusTop.position.set(vx, 2.02, 0.65);
      khuThoMainAltar.add(lotusTop);
    }
    g.add(khuThoMainAltar);
    this.interiorKhuThoClickTargets.push(khuThoMainAltar);
    this.interiorRectObstacles.push({ minX: -3.7, maxX: 3.7, minZ: -48.3, maxZ: -45.3 });

    // Side Wall Altars in Nhà Tổ (Ban Quan Âm West x=-9.8 & Ban Địa Tạng East x=+9.8, clear of walkthrough aisles!)
    for (const [sx, sLabel] of [[-9.8, 'BAN QUÁN THẾ ÂM'], [9.8, 'BAN ĐỊA TẠNG']]) {
      const sAltar = new THREE.Group();
      sAltar.position.set(sx, 0, -45.8);
      sAltar.rotation.y = sx < 0 ? Math.PI / 2 : -Math.PI / 2;
      const tbl = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.15, 1.25), darkLacquerColMat);
      tbl.position.y = 0.575;
      sAltar.add(tbl);
      const stBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.34, 1.35, 12), goldLeafMat);
      stBody.position.set(0, 1.85, -0.2);
      sAltar.add(stBody);
      const stHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), goldLeafMat);
      stHead.position.set(0, 2.66, -0.2);
      sAltar.add(stHead);
      const sb = this.buildIncenseBurner(0.32);
      sb.position.set(0, 1.15, 0.34);
      sAltar.add(sb);
      const sPlaque = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.42, 0.1),
        new THREE.MeshStandardMaterial({
          map: makeTextTex(sLabel, { w: 680, h: 130, bg: '#5C1610', border: '#FFD875', color: '#FFD970', size: 38 })
        })
      );
      sPlaque.position.set(0, 3.3, -0.36);
      sAltar.add(sPlaque);
      g.add(sAltar);
      this.interiorKhuThoClickTargets.push(sAltar);
      this.interiorRectObstacles.push({ minX: sx - 0.85, maxX: sx + 0.85, minZ: -47.0, maxZ: -44.6 });
    }

    // =========================================================================
    // 5. SÂN THIÊN TỈNH 2 (Giếng Trời 2, z: -53.0 .. -68.5) + HÒN NON BỘ 2
    // =========================================================================
    addTripleArchPartition(-53.0, 'SÂN THIÊN TỈNH 2 · ĐẾN NHÀ HẬU');

    const atrium2S = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(23.2, 0.32, 2.8), ceilingWoodMat));
    atrium2S.position.set(0, 7.1, -54.4);
    g.add(atrium2S);
    const atrium2N = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(23.2, 0.32, 2.8), ceilingWoodMat));
    atrium2N.position.set(0, 7.1, -67.1);
    g.add(atrium2N);

    const atriumSky2 = new THREE.Mesh(
      new THREE.PlaneGeometry(17.8, 10.6),
      new THREE.MeshBasicMaterial({ color: 0x9AD2F6, side: THREE.DoubleSide })
    );
    atriumSky2.rotation.x = Math.PI / 2;
    atriumSky2.position.set(0, 9.8, -60.8);
    registerCutaway(atriumSky2);
    g.add(atriumSky2);

    const atriumDaylight2 = new THREE.PointLight(0xFFF3D4, 4.4, 38);
    atriumDaylight2.position.set(0, 8.2, -60.8);
    g.add(atriumDaylight2);

    for (const vx of [-8.2, 8.2]) {
      for (const vz of [-56.2, -60.8, -65.4]) {
        const vCol = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 7.0, 12), M.redColumn);
        vCol.position.set(vx, 3.5, vz);
        g.add(vCol);
        this.interiorObstacles.push({ x: vx, z: vz, r: 0.4 });
      }
    }

    // Centerpiece 2: HÒN NON BỘ SÂN THIÊN TỈNH 2 (0, 0, -60.8)
    const nonBo2 = new THREE.Group();
    nonBo2.position.set(0, 0, -60.8);
    const nb2Outer = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.65, 6.2), M.stoneDark);
    nb2Outer.position.y = 0.325;
    nonBo2.add(nb2Outer);
    const nb2Water = new THREE.Mesh(new THREE.BoxGeometry(7.1, 0.5, 5.5), M.water);
    nb2Water.position.y = 0.44;
    nonBo2.add(nb2Water);
    for (const [rx, ry, rz, sx, sy, sz, rotY] of [
      [-1.0, 1.7, -0.4, 1.25, 2.2, 1.15, 0.7],
      [1.1, 1.85, -0.3, 1.3, 2.4, 1.2, 1.9],
      [0.05, 1.2, 0.9, 1.05, 1.15, 0.95, 1.2]
    ]) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.0, 0), innerRockMat);
      rock.scale.set(sx, sy, sz);
      rock.rotation.set(0.1, rotY, -0.06);
      rock.position.set(rx, ry, rz);
      nonBo2.add(rock);
      const moss = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), innerMossMat);
      moss.scale.set(sx * 0.65, 0.32, sz * 0.65);
      moss.position.set(rx, ry + sy * 0.56, rz);
      nonBo2.add(moss);
    }
    const miniPagoda = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.95, 6), M.stoneLight);
    miniPagoda.position.set(-1.0, 3.05, -0.4);
    nonBo2.add(miniPagoda);
    const nb2Waterfall = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85, 2.0),
      new THREE.MeshBasicMaterial({ color: 0xBDEFFB, transparent: true, opacity: 0.82, side: THREE.DoubleSide })
    );
    nb2Waterfall.position.set(1.1, 1.55, 0.42);
    nb2Waterfall.rotation.x = 0.16;
    nonBo2.add(nb2Waterfall);

    const nb2Plaque = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.48, 0.14),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('SÂN THIÊN TỈNH 2 · NON BỘ & CẢNH THIỀN', {
          w: 960,
          h: 130,
          bg: '#1C5A34',
          border: '#FFD875',
          color: '#FFF6E5',
          size: 38
        })
      })
    );
    nb2Plaque.position.set(0, 0.5, 3.16);
    nonBo2.add(nb2Plaque);
    g.add(nonBo2);
    this.interiorNonBoClickTargets.push(nonBo2);
    this.interiorRectObstacles.push({ minX: -4.15, maxX: 4.15, minZ: -64.05, maxZ: -57.55 });

    for (const [bx, bz] of [[-6.8, -56.5], [6.8, -56.5], [-6.8, -65.0], [6.8, -65.0]]) {
      const pot = this.makeBonsai72(0.74);
      pot.position.set(bx, 0, bz);
      g.add(pot);
      this.interiorObstacles.push({ x: bx, z: bz, r: 0.6 });
    }

    // =========================================================================
    // 6. NHÀ HẬU · KHU THỜ TỰ & SINH HOẠT PHÍA SAU (z: -68.5 .. -82.0)
    // =========================================================================
    addTripleArchPartition(-68.5, 'NHÀ HẬU · KHU THỜ TỰ PHÍA SAU');

    const hauCeiling = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(23.2, 0.36, 13.8), ceilingWoodMat));
    hauCeiling.position.set(0, 9.4, -75.2);
    g.add(hauCeiling);
    addTimberViKeoTruss(0, 7.25, 22.0, 1.95, -72.0, true);
    addTimberViKeoTruss(0, 7.25, 22.0, 1.95, -78.0, true);

    const hauNorthWall = new THREE.Mesh(new THREE.BoxGeometry(28.4, 8.2, 0.55), wallMat);
    hauNorthWall.position.set(0, 4.1, -82.0);
    g.add(hauNorthWall);

    const hauLight = new THREE.PointLight(0xFFD990, 3.6, 36);
    hauLight.position.set(0, 6.0, -75.5);
    g.add(hauLight);

    for (const cx of [-4.6, 4.6]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 7.2, 14), M.redColumn);
      col.position.set(cx, 3.6, -74.0);
      g.add(col);
      this.interiorObstacles.push({ x: cx, z: -74.0, r: 0.42 });
    }
    addCarvedBaoLam(0, 5.75, -74.0, 9.0);

    // Rear Ceremonial Altar ("Ban Thờ Hậu Tổ · Linh Vị Chư Hương Linh")
    const nhaHauAltar = new THREE.Group();
    nhaHauAltar.position.set(0, 0, -79.2);
    const nhTier1 = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.28, 2.4), darkLacquerColMat);
    nhTier1.position.y = 0.64;
    nhaHauAltar.add(nhTier1);
    const nhTier2 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.95, 1.3), M.redColumn);
    nhTier2.position.set(0, 1.75, -0.35);
    nhaHauAltar.add(nhTier2);
    const nhBuddha = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.45, 1.35, 12), goldLeafMat);
    nhBuddha.position.set(0, 2.9, -0.35);
    nhaHauAltar.add(nhBuddha);
    const nhHead = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), goldLeafMat);
    nhHead.position.set(0, 3.74, -0.35);
    nhaHauAltar.add(nhHead);
    const nhBurner = this.buildIncenseBurner(0.46);
    nhBurner.position.set(0, 1.28, 0.65);
    nhaHauAltar.add(nhBurner);
    const nhPlaque = new THREE.Mesh(
      new THREE.BoxGeometry(5.8, 0.84, 0.16),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('NHÀ HẬU · LINH VỊ CHƯ HƯƠNG LINH', {
          w: 1120,
          h: 170,
          bg: '#32140A',
          border: '#FFD875',
          color: '#FFD970',
          size: 50
        })
      })
    );
    nhPlaque.position.set(0, 5.4, -0.9);
    nhaHauAltar.add(nhPlaque);
    g.add(nhaHauAltar);
    this.interiorKhuThoClickTargets.push(nhaHauAltar);
    this.interiorRectObstacles.push({ minX: -3.9, maxX: 3.9, minZ: -80.6, maxZ: -77.7 });

    // Monastic low tea/scripture benches along West/East bays of Nhà Hậu
    for (const bx of [-8.2, 8.2]) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.48, 3.8), M.darkWood);
      bench.position.set(bx, 0.24, -75.5);
      g.add(bench);
      this.interiorRectObstacles.push({ minX: bx - 1.2, maxX: bx + 1.2, minZ: -77.6, maxZ: -73.4 });
    }

    // =========================================================================
    // 7. NHÀ SÀN GỖ TRUYỀN THỐNG MIỀN TÂY · KHU ĂN PHẬT TỬ (x: +14.2..+32.8, z: -49.0..-22.5)
    // Built on dark ironwood stilts over a clear lotus pond with wooden stairs down to East corridor!
    // =========================================================================
    const stiltWoodMat = new THREE.MeshStandardMaterial({ color: 0x4E2C16, map: this.woodGrainTex, roughness: 0.66 });
    const plankDeckMat = new THREE.MeshStandardMaterial({ color: 0x7A4924, map: this.woodGrainTex, roughness: 0.54 });
    const railWoodMat = new THREE.MeshStandardMaterial({ color: 0x5C3418, roughness: 0.58 });
    const tableWoodMat = new THREE.MeshStandardMaterial({ color: 0x6F3E1E, roughness: 0.48 });
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0xFFFDF8, roughness: 0.25 });
    const trayMat = new THREE.MeshStandardMaterial({ color: 0xC8CDD2, metalness: 0.45, roughness: 0.3 });
    const teaPotMat = new THREE.MeshStandardMaterial({ color: 0x8F4028, roughness: 0.35 });

    // Mekong Lotus Pond Basin underneath the Wooden Stilt Floor
    const stiltPondWater = new THREE.Mesh(new THREE.BoxGeometry(19.0, 0.3, 27.0), M.water);
    stiltPondWater.position.set(23.7, -0.22, -35.8);
    g.add(stiltPondWater);

    // Ironwood Stilts & Cross Bearers supporting the +0.85m Timber Plank Deck
    for (const sx of [15.4, 21.0, 26.6, 31.8]) {
      for (const sz of [-47.5, -40.0, -32.0, -24.0]) {
        const footing = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.42, 10), M.stoneLight);
        footing.position.set(sx, -0.1, sz);
        g.add(footing);
        const stiltCol = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 1.05, 10), stiltWoodMat);
        stiltCol.position.set(sx, 0.36, sz);
        g.add(stiltCol);
      }
    }

    // Elevated Hardwood Stilt Floor at y = +0.85m (x = 15.2..32.6, z = -48.5..-22.5)
    const traiDeck = new THREE.Mesh(new THREE.BoxGeometry(17.6, 0.16, 26.2), plankDeckMat);
    traiDeck.position.set(23.9, 0.77, -35.5);
    traiDeck.receiveShadow = true;
    g.add(traiDeck);

    for (let pz = -48.0; pz <= -23.0; pz += 0.7) {
      const seam = new THREE.Mesh(
        new THREE.BoxGeometry(17.4, 0.02, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x3B2010, roughness: 0.85 })
      );
      seam.position.set(23.9, 0.855, pz);
      g.add(seam);
    }

    // Wide Wooden Entry Stairs climbing smoothly from East Corridor (x=14.1, y=0) onto Stilt Deck (x=15.3, y=0.85) at 3 archways!
    for (const archZ of [-26.5, -35.5, -42.5]) {
      for (let s = 0; s < 4; s++) {
        const tread = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.21, 3.8), plankDeckMat);
        tread.position.set(13.95 + s * 0.38, 0.1 + s * 0.21, archZ);
        g.add(tread);
      }
    }

    // Upper Mekong Hardwood Pillars + Exposed Vì Kèo Trusses (Roof slab is in cutawayTargets!)
    const traiCeiling = registerCutaway(new THREE.Mesh(new THREE.BoxGeometry(18.6, 0.34, 26.8), ceilingWoodMat));
    traiCeiling.position.set(23.9, 8.2, -35.5);
    g.add(traiCeiling);

    for (const pz of [-47.5, -40.5, -33.5, -26.5]) {
      addTimberViKeoTruss(23.9, 5.75, 17.2, 1.95, pz, true);
      for (const px of [15.5, 32.3]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 5.1, 10), stiltWoodMat);
        col.position.set(px, 3.35, pz);
        g.add(col);
      }
    }

    const traiBackN = new THREE.Mesh(new THREE.BoxGeometry(18.4, 7.6, 0.45), creamWallMat);
    traiBackN.position.set(23.9, 3.8, -48.6);
    g.add(traiBackN);
    const traiBackS = new THREE.Mesh(new THREE.BoxGeometry(18.4, 7.6, 0.45), creamWallMat);
    traiBackS.position.set(23.9, 3.8, -22.4);
    g.add(traiBackS);
    const traiEastWall = new THREE.Mesh(new THREE.BoxGeometry(0.45, 7.6, 26.4), creamWallMat);
    traiEastWall.position.set(32.7, 3.8, -35.5);
    g.add(traiEastWall);

    // Sunlit East Windows with wooden louver mullions overlooking Mekong garden lotus
    for (const wz of [-28.0, -35.5, -43.0]) {
      const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.8, 3.6), M.darkWood);
      winFrame.position.set(32.42, 3.6, wz);
      g.add(winFrame);
      const winGlow = new THREE.Mesh(
        new THREE.PlaneGeometry(3.2, 2.4),
        new THREE.MeshBasicMaterial({ color: 0xD7ECCB, side: THREE.DoubleSide })
      );
      winGlow.rotation.y = -Math.PI / 2;
      winGlow.position.set(32.3, 3.6, wz);
      g.add(winGlow);
      for (let mz = -1.2; mz <= 1.2; mz += 0.6) {
        const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.5, 0.08), M.darkWood);
        mullion.position.set(32.26, 3.6, wz + mz);
        g.add(mullion);
      }
    }

    const traiLight1 = new THREE.PointLight(0xFFF0C6, 3.8, 34);
    traiLight1.position.set(23.5, 6.2, -31.0);
    g.add(traiLight1);
    const traiLight2 = new THREE.PointLight(0xFFD990, 3.4, 34);
    traiLight2.position.set(23.5, 6.2, -41.0);
    g.add(traiLight2);

    const traiSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.62, 3.6),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('NHÀ SÀN TRAI ĐƯỜNG · CƠM CHAY →', {
          w: 960,
          h: 170,
          bg: '#1C5A34',
          border: '#FFD875',
          color: '#FFF6E5',
          size: 46
        })
      })
    );
    traiSign.position.set(13.68, 4.45, -26.5);
    g.add(traiSign);

    const traiHallBanner = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 0.92, 0.16),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('NHÀ SÀN TRAI ĐƯỜNG · CƠM CHAY MIỀN TÂY', {
          w: 1200,
          h: 180,
          bg: '#5C1610',
          border: '#FFD875',
          color: '#FFF2B2',
          size: 52
        })
      })
    );
    traiHallBanner.position.set(23.9, 5.45, -48.2);
    g.add(traiHallBanner);

    // 6 Long Wooden Vegetarian Dining Tables & Benches on Stilt Deck (y = +0.85m)
    for (const tx of [19.4, 27.0]) {
      for (const tz of [-28.5, -35.5, -42.5]) {
        const tGroup = new THREE.Group();
        tGroup.position.set(tx, 0.85, tz);

        const top = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.1, 1.35), tableWoodMat);
        top.position.y = 0.78;
        tGroup.add(top);
        for (const lx of [-1.6, 1.6]) {
          for (const lz of [-0.52, 0.52]) {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.76, 0.1), railWoodMat);
            leg.position.set(lx, 0.38, lz);
            tGroup.add(leg);
          }
        }
        for (const bz of [-0.95, 0.95]) {
          const bench = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.08, 0.38), tableWoodMat);
          bench.position.set(0, 0.45, bz);
          tGroup.add(bench);
        }
        for (const bx of [-1.25, -0.45, 0.45, 1.25]) {
          for (const bz of [-0.36, 0.36]) {
            const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.06, 0.09, 10), bowlMat);
            bowl.position.set(bx, 0.87, bz);
            tGroup.add(bowl);
          }
        }
        const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.04, 14), trayMat);
        tray.position.set(-0.25, 0.85, 0);
        tGroup.add(tray);
        const teapot = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.22, 10), teaPotMat);
        teapot.position.set(0.65, 0.94, 0);
        tGroup.add(teapot);

        g.add(tGroup);
        this.interiorTraiDuongClickTargets.push(tGroup);
        this.interiorRectObstacles.push({
          minX: tx - 2.05,
          maxX: tx + 2.05,
          minZ: tz - 1.15,
          maxZ: tz + 1.15
        });
      }
    }

    // Vegetarian Serving Counter + Terracotta Mekong Water Urn along North Wall of Trai Đường (y = +0.85m)
    const counterGroup = new THREE.Group();
    counterGroup.position.set(23.4, 0.85, -47.1);
    const counterBody = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.98, 1.55), M.redColumn);
    counterBody.position.y = 0.49;
    counterGroup.add(counterBody);
    const counterTop = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.1, 1.65), M.creamTrim);
    counterTop.position.y = 1.02;
    counterGroup.add(counterTop);
    for (const px of [-2.8, -1.0, 0.8, 2.6]) {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.32, 0.34, 14), trayMat);
      pot.position.set(px, 1.24, 0);
      counterGroup.add(pot);
    }
    const luNuocTrong = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), M.terracottaPot);
    luNuocTrong.scale.set(1.0, 1.2, 1.0);
    luNuocTrong.position.set(5.2, 0.52, 0.2);
    counterGroup.add(luNuocTrong);
    const counterBoard = new THREE.Mesh(
      new THREE.BoxGeometry(5.8, 0.72, 0.12),
      new THREE.MeshStandardMaterial({
        map: makeTextTex('QUẦY CƠM CHAY MIỄN PHÍ · NƯỚC TRÀ ĐÁ', {
          w: 1024,
          h: 150,
          bg: '#1C5A34',
          border: '#FFD875',
          color: '#FFF6E5',
          size: 46
        })
      })
    );
    counterBoard.position.set(0, 3.0, 0.6);
    counterGroup.add(counterBoard);
    g.add(counterGroup);
    this.interiorTraiDuongClickTargets.push(counterGroup);
    this.interiorRectObstacles.push({ minX: 19.1, maxX: 29.2, minZ: -48.1, maxZ: -46.1 });
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
    return new Promise((resolve) => {
      this.gltfLoader.load(
        encodeURI(url),
        (gltf) => resolve(gltf),
        undefined,
        () => resolve(null)
      );
    });
  }

  cleanStatueScene(gltfScene, matOverride = null) {
    const root = gltfScene.clone(true);
    const toRemove = [];
    root.traverse((o) => {
      if (/ground|plane|floor|shadow/i.test(o.name || '')) {
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
          // Preserve embedded FeatureShadow, lotus blue, pedestal, and gold plaque colors while adding stone bump
          const matName = (o.material.name || '').toLowerCase();
          if (/white|statue|body|robe|skin/i.test(matName) || !matName) {
            o.material.bumpMap = this.stoneBumpTex;
            o.material.bumpScale = 0.01;
          }
          o.material.roughness = Math.min(0.58, Math.max(0.28, o.material.roughness ?? 0.45));
        }
      }
    });
    for (const r of toRemove) {
      if (r.parent) r.parent.remove(r);
    }
    return root;
  }

  async loadAllGLBAssets() {
    const [adidaGltf, dilacGltf, phatNamGltf, banThoGltf] = await Promise.all([
      this.loadGLB(STATUE_GLB_PATHS.adida),
      this.loadGLB(STATUE_GLB_PATHS.dilac),
      this.loadGLB(STATUE_GLB_PATHS.phatnam),
      this.loadGLB(STATUE_GLB_PATHS.bantho)
    ]);

    // 1. Đại Tượng Phật A Di Đà (North head of Central Avenue facing straight South (+Z) down the avenue)
    if (adidaGltf?.scene) {
      const s = this.cleanStatueScene(adidaGltf.scene, null);
      const box = new THREE.Box3().setFromObject(s);
      const h = Math.max(0.1, box.max.y - box.min.y);
      const scale = 22.5 / h;
      s.scale.setScalar(scale);
      const box2 = new THREE.Box3().setFromObject(s);
      s.position.set(
        -(box2.min.x + box2.max.x) / 2,
        0.34 - box2.min.y,
        -(box2.min.z + box2.max.z) / 2
      );
      s.rotation.y = 0;
      this.adidaGroup.add(s);
    }

    // 2. Đại Tượng Phật Di Lặc (Monumental ~19.5m seated cleanly atop stepped granite staircase & red/black inscription bands)
    if (dilacGltf?.scene) {
      const s = this.cleanStatueScene(dilacGltf.scene, null);
      const box = new THREE.Box3().setFromObject(s);
      const h = Math.max(0.1, box.max.y - box.min.y);
      const scale = 19.5 / h;
      s.scale.setScalar(scale);
      const box2 = new THREE.Box3().setFromObject(s);
      s.position.set(
        -(box2.min.x + box2.max.x) / 2,
        1.55 - box2.min.y,
        -(box2.min.z + box2.max.z) / 2 - 2.4
      );
      s.rotation.y = Math.PI * 0.78;
      this.dilacGroup.add(s);
    }

    // 3. Đại Tượng Phật Niết Bàn (Total GLB length 32.0m — includes its sculpted pedestal)
    if (phatNamGltf?.scene) {
      const s = this.cleanStatueScene(phatNamGltf.scene, null);
      const box = new THREE.Box3().setFromObject(s);
      const w = Math.max(0.1, box.max.x - box.min.x, box.max.z - box.min.z);
      const scale = 31.5 / w;
      s.scale.setScalar(scale);
      const box2 = new THREE.Box3().setFromObject(s);
      s.position.set(
        -(box2.min.x + box2.max.x) / 2,
        0.34 - box2.min.y,
        -(box2.min.z + box2.max.z) / 2
      );
      s.rotation.y = Math.PI;
      this.nietBanGroup.add(s);
    }

    // 4. Tượng Phật Bàn Thờ Tam Bảo (4.8m tall on main altar + golden Buddha visible in porch)
    if (banThoGltf?.scene) {
      const s = this.cleanStatueScene(banThoGltf.scene, null);
      const box = new THREE.Box3().setFromObject(s);
      const h = Math.max(0.1, box.max.y - box.min.y);
      const scale = 4.8 / h;
      s.scale.setScalar(scale);
      const box2 = new THREE.Box3().setFromObject(s);
      s.position.set(
        -(box2.min.x + box2.max.x) / 2,
        2.82 - box2.min.y,
        -(box2.min.z + box2.max.z) / 2
      );
      s.rotation.y = Math.PI;
      this.tamBaoAltarGroup.add(s);

      if (this.chanhDienPorchAltar) {
        const porchBuddha = this.cleanStatueScene(banThoGltf.scene, null);
        porchBuddha.scale.setScalar(2.15 / h);
        const pb = new THREE.Box3().setFromObject(porchBuddha);
        porchBuddha.position.set(
          -(pb.min.x + pb.max.x) / 2,
          1.03 - pb.min.y,
          -(pb.min.z + pb.max.z) / 2
        );
        porchBuddha.rotation.y = Math.PI;
        this.chanhDienPorchAltar.add(porchBuddha);
      }
    }

    const initialKey = this.playerState.charKey || 'nu';
    // Load ALL 3 rigged human GLBs (nu, nam, tre_em) + props upfront so every NPC & interior worshipper uses real rigged characters!
    const [
      nuGltf,
      namGltf,
      treEmGltf,
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
      nonLaGltf
    ] = await Promise.all([
      this.loadGLB(CHAR_GLB_PATHS.nu),
      this.loadGLB(CHAR_GLB_PATHS.nam),
      this.loadGLB(CHAR_GLB_PATHS.tre_em),
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
      this.loadGLB(PROP_GLB_PATHS.non_la)
    ]);

    if (nuGltf?.scene) this.charDataCache.nu = nuGltf;
    if (namGltf?.scene) this.charDataCache.nam = namGltf;
    if (treEmGltf?.scene) this.charDataCache.tre_em = treEmGltf;

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

    this.placeLoaded3DPropsInWorld();
    this.setCharacter(initialKey);
    this.spawnMonksAndPilgrimsV8();
    this.spawnInteriorWorshippersV8();
    this.initSmokeColumns();
    this.renderFrame();
    this.onLoaded();
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
      new THREE.Vector3(-8.0, 1.15, -17.5),
      new THREE.Vector3(-24.5, 2.85, 17.2),
      new THREE.Vector3(34.5, 0.98, 22.5)
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
            geomBox = o.geometry.boundingBox;
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
    }
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
    const target =
      record.actions[clipName] ||
      (clipName === 'Đi bộ' ? record.actions['Di bo'] : null) ||
      (clipName === 'Di bo' ? record.actions['Đi bộ'] : null) ||
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
    if (!['nu', 'nam', 'tre_em'].includes(charKey)) charKey = 'nu';
    this.playerState.charKey = charKey;
    while (this.playerContainer.children.length > 0) {
      this.playerContainer.remove(this.playerContainer.children[0]);
    }
    const h = CHAR_HEIGHTS[charKey] || 1.62;
    const rec = this.cloneAnimatedCharacter(charKey, h);
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

    // Default cream shoulder tote bag for female protagonist on left shoulder when viewed from behind (matching Reference Image 1)
    if (charKey === 'nu') {
      const bagGroup = new THREE.Group();
      const bagMat = new THREE.MeshStandardMaterial({ color: 0xF3E6CE, roughness: 0.78 });
      const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.24, 0.22), bagMat);
      pouch.position.set(0.21, h * 0.54, -0.03);
      pouch.rotation.z = -0.12;
      bagGroup.add(pouch);
      const strap = new THREE.Mesh(
        new THREE.TorusGeometry(0.14, 0.016, 8, 16, Math.PI),
        bagMat
      );
      strap.position.set(0.18, h * 0.67, -0.02);
      strap.rotation.y = Math.PI / 2;
      bagGroup.add(strap);
      this.playerContainer.add(bagGroup);
    }

    this.equipmentGroup = new THREE.Group();
    this.playerContainer.add(this.equipmentGroup);

    this.storePreviewGroup = new THREE.Group();
    this.playerContainer.add(this.storePreviewGroup);

    // Start in natural mid-stride walking posture (arms relaxed at sides, not T/A-pose)
    this.playClipCrossfade(rec, 'Di bo', 0.05);
    if (rec.activeAction) {
      rec.mixer.setTime(0.28);
      rec.mixer.update(0);
      rec.activeAction.paused = true;
    }

    this.syncPlayerTransform();
    if (this.lastEquippedState) {
      this.updateEquippedItems(this.lastEquippedState);
    }
    if (this.activeStorePreview) {
      this.applyStoreVisualsToPlayer(this.activeStorePreview);
    }
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
    if (opts.hat) {
      if (this.propMeshCache.non_la) {
        let headBone = null;
        rec.root.traverse((b) => {
          if (b.isBone && /head/i.test(b.name)) headBone = b;
        });
        const hat = this.fitProp(this.propMeshCache.non_la, charKey === 'tre_em' ? 0.34 : 0.44);
        if (headBone) {
          const s = rec.root.scale.x || 1;
          hat.scale.multiplyScalar(1 / s);
          hat.position.set(0, 0.14 / s, 0);
          hat.rotation.x = -0.06;
          headBone.add(hat);
        } else {
          hat.position.set(0, h * 0.94, 0.02);
          rec.root.add(hat);
        }
      } else {
        this.attachConicalHat(rec, h);
      }
    }

    // Shoulder tote bag or woven market basket
    if (opts.bag === 'tui_sen') {
      const bagMesh = this.propMeshCache.tui_sen
        ? this.fitProp(this.propMeshCache.tui_sen, 0.34)
        : new THREE.Mesh(
            new THREE.BoxGeometry(0.11, 0.25, 0.22),
            new THREE.MeshStandardMaterial({ color: 0xEFE1C6, roughness: 0.78 })
          );
      const s = rec.root.scale.x || 1;
      bagMesh.scale.multiplyScalar(1 / s);
      bagMesh.position.set(-0.22 / s, (h * 0.54) / s, 0.04 / s);
      rec.root.add(bagMesh);
    } else if (opts.bag === 'gio_may' && this.propMeshCache.gio_may_tre) {
      const basket = this.fitProp(this.propMeshCache.gio_may_tre, 0.36);
      const s = rec.root.scale.x || 1;
      basket.scale.multiplyScalar(1 / s);
      basket.position.set(0.24 / s, (h * 0.48) / s, 0.14 / s);
      rec.root.add(basket);
    }

    // Checkered Southern scarf ("khăn rằn Nam Bộ") draped over shoulders
    if (opts.scarf) {
      const s = rec.root.scale.x || 1;
      const scarf = new THREE.Mesh(
        new THREE.TorusGeometry(0.14 / s, 0.032 / s, 7, 14),
        new THREE.MeshStandardMaterial({ color: 0x2B2420, roughness: 0.8 })
      );
      scarf.rotation.x = Math.PI / 2 - 0.15;
      scarf.position.set(0, (h * 0.79) / s, 0.02 / s);
      rec.root.add(scarf);
    }

    // Hand-carried items (hoa_sen, quat_nan, nhang, trang_hat)
    if (opts.hand) {
      const s = rec.root.scale.x || 1;
      let handBone = null;
      rec.root.traverse((b) => {
        if (b.isBone && /righthand|hand_r|r_hand/i.test(b.name)) handBone = b;
      });
      let prop = null;
      if (opts.hand === 'quat' && this.propMeshCache.quat_nan_la_dua) {
        prop = this.fitProp(this.propMeshCache.quat_nan_la_dua, 0.34);
      } else if (opts.hand === 'hoa_sen') {
        if (this.propMeshCache.nen_hoa_sen) {
          prop = this.fitProp(this.propMeshCache.nen_hoa_sen, 0.28);
        } else {
          prop = new THREE.Mesh(
            new THREE.ConeGeometry(0.08, 0.18, 7),
            new THREE.MeshStandardMaterial({ color: 0xEC6C9A, roughness: 0.45 })
          );
        }
      } else if (opts.hand === 'nhang') {
        const bun = new THREE.Group();
        const wrap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.035, 0.035, 0.24, 8),
          new THREE.MeshStandardMaterial({ color: 0xC62828, roughness: 0.6 })
        );
        bun.add(wrap);
        const top = new THREE.Mesh(
          new THREE.CylinderGeometry(0.032, 0.032, 0.22, 8),
          new THREE.MeshStandardMaterial({ color: 0xD9962E, roughness: 0.7 })
        );
        top.position.y = 0.2;
        bun.add(top);
        prop = bun;
      } else if (opts.hand === 'beads') {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.09, 0.016, 6, 14),
          new THREE.MeshStandardMaterial({ color: 0x5E3418, roughness: 0.45 })
        );
        prop = ring;
      }
      if (prop) {
        if (handBone) {
          prop.scale.multiplyScalar(1 / s);
          prop.position.set(0, 0.04 / s, 0.06 / s);
          handBone.add(prop);
        } else {
          prop.scale.multiplyScalar(1 / s);
          prop.position.set(0.21 / s, (h * 0.56) / s, 0.18 / s);
          rec.root.add(prop);
        }
      }
    }
  }

  spawnMonksAndPilgrimsV8() {
    // 1. Real rigged GLB kneeling worshippers at Flag Courtyard, A Di Đà, Di Lặc, Đài Quán Thế Âm & Nhà Tổ
    const kneelSpots = [
      { charKey: 'nu', x: 21.4, z: 13.4, yaw: Math.PI, tint: [0.76, 0.64, 0.72] },
      { charKey: 'nam', x: 24.6, z: 13.4, yaw: Math.PI, monkTone: 0 },
      { charKey: 'nu', x: -8.0, z: -16.0, yaw: Math.PI, tint: [0.80, 0.72, 0.62] },
      { charKey: 'nam', x: -24.5, z: 17.5, yaw: Math.PI, monkTone: 1 },
      { charKey: 'nu', x: 35.2, z: 22.5, yaw: -Math.PI / 2, tint: [0.85, 0.70, 0.76] },
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

    // 2. Local residents and family eatery keepers on the east-side residential lane.
    const vendorSpecs = [
      { x: 85.6, z: 60.0, yaw: -Math.PI * 0.5, charKey: 'nu', tint: [0.86, 0.66, 0.54], hat: false, bag: null, hand: 'quat' },
      { x: 85.6, z: 80.0, yaw: -Math.PI * 0.5, charKey: 'nam', tint: [0.58, 0.48, 0.36], hat: false, scarf: true },
      { x: 85.8, z: 100.0, yaw: -Math.PI * 0.5, charKey: 'nu', tint: [0.88, 0.72, 0.78], hat: false, hand: 'hoa_sen' }
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
      // --- A. Visitor approach and neighbourhood lane (outside the temple gates) ---
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
        charKey: 'nu',
        tint: [0.84, 0.74, 0.56],
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
        charKey: 'nam',
        monkTone: 0,
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
        charKey: 'nu',
        tint: [0.62, 0.72, 0.84],
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
        charKey: 'nam',
        tint: [0.56, 0.50, 0.42],
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
        charKey: 'nam',
        monkTone: 1,
        hand: 'beads',
        speed: 0.96,
        pts: [
          wp(-2.0, 19.0, 'pass'),
          wp(-2.0, -5.0, 'pass'),
          wp(-7.8, -14.5, 'chap_tay', 3.8, -8.0, -25.0),
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
        charKey: 'nu',
        tint: [0.85, 0.74, 0.82],
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
        charKey: 'nam',
        tint: [0.62, 0.68, 0.76],
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
          wp(12.0, -24.5, 'chap_tay', 3.2, 12.0, -38.0),
          wp(4.0, -45.5, 'pass')
        ]
      },
      {
        charKey: 'nam',
        tint: [0.54, 0.60, 0.68],
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
        charKey: 'nam',
        monkTone: 0,
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
      if (typeof rt.monkTone === 'number') {
        this.recolorMonkRobe(rec.root, rt.monkTone);
      } else if (rt.tint) {
        this.recolorPastelDress(rec.root, rt.tint);
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
    // Rigged GLB worshippers inside Chánh điện, Khu Thờ Tổ, and pilgrims in Trai Đường
    const kneelingSpots = [
      { charKey: 'nu', x: -2.4, z: -4.2, yaw: Math.PI, tint: [0.84, 0.60, 0.70] },
      { charKey: 'nam', x: 2.4, z: -4.2, yaw: Math.PI, monkTone: 0 },
      { charKey: 'nu', x: -2.4, z: -8.6, yaw: Math.PI, tint: [0.76, 0.78, 0.86] },
      { charKey: 'tre_em', x: -0.9, z: -8.6, yaw: Math.PI, tint: [0.62, 0.74, 0.84] },
      { charKey: 'nam', x: 2.4, z: -8.6, yaw: Math.PI, tint: [0.52, 0.39, 0.28] },
      { charKey: 'nu', x: 0.0, z: -12.4, yaw: Math.PI, tint: [0.90, 0.88, 0.84] },
      // Khu Thờ Tổ worshippers
      { charKey: 'nu', x: -1.6, z: -48.5, yaw: Math.PI, tint: [0.78, 0.82, 0.86] },
      { charKey: 'nam', x: 1.6, z: -48.5, yaw: Math.PI, monkTone: 1 }
    ];
    for (const sp of kneelingSpots) {
      if (this.propMeshCache.bo_doan) {
        const mat = this.fitProp(this.propMeshCache.bo_doan, 0.92);
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

    // Standing pilgrims & servers inside Hòn Non Bộ atrium and Trai Đường (Khu ăn Phật tử)
    const standingInterior = [
      { charKey: 'nu', x: 19.2, z: -25.6, yaw: Math.PI, pose: 'Dung', tint: [0.9, 0.84, 0.72] },
      { charKey: 'nam', x: 17.4, z: -29.8, yaw: 0, pose: 'Chắp tay', tint: [0.64, 0.68, 0.78] },
      { charKey: 'nu', x: 24.4, z: -31.8, yaw: Math.PI, pose: 'Dung', tint: [0.88, 0.66, 0.74] },
      { charKey: 'tre_em', x: 23.2, z: -37.2, yaw: 0, pose: 'Dung', tint: [0.68, 0.82, 0.68] },
      { charKey: 'nam', x: -5.4, z: -30.5, yaw: Math.PI / 2, pose: 'Chắp tay', monkTone: 0 }
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
      rec.root.position.set(sp.x, rec.baseY, sp.z);
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
      const inSideDoorCorridor = nz >= -1.25 && nz <= 3.05;
      const inEastArch =
        (nz >= -28.3 && nz <= -24.7) ||
        (nz >= -37.3 && nz <= -33.7) ||
        (nz >= -44.1 && nz <= -40.9);
      if (curX > 12.1 || (nx > 11.4 && inEastArch)) {
        bounds = {
          minX: inEastArch ? -11.05 : 12.6,
          maxX: 29.6,
          minZ: -44.6,
          maxZ: -22.2
        };
      } else {
        bounds = {
          minX: inSideDoorCorridor ? -11.9 : -11.05,
          maxX: inSideDoorCorridor || inEastArch ? 12.6 : 11.05,
          minZ: -80.5,
          maxZ: 10.6
        };
      }
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
      if (x >= 15.0 && x <= 32.0 && z >= -48.2 && z <= -22.6) {
        this.playerElevationY = 0.85;
      } else if (x > 13.7 && x < 15.0 && z >= -44.5 && z <= -24.5) {
        this.playerElevationY = ((x - 13.7) / 1.3) * 0.85;
      } else {
        this.playerElevationY = 0;
      }
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
      if (pz >= -1.45 && pz <= 3.25) {
        if (px > 10.35) {
          this.exitInteriorGradual('right');
        } else if (px < -10.35) {
          this.exitInteriorGradual('left');
        }
      }
    } else {
      if (pz >= 7.8 && pz <= 9.65) {
        if (Math.abs(px - 30.2) <= 1.55) {
          this.enterInteriorGradual('right');
        } else if (Math.abs(px - 15.8) <= 1.55) {
          this.enterInteriorGradual('left');
        }
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

  enterInteriorGradual(side = 'right', onEntered = null) {
    this.cancelEntranceTour();
    if (this.inInterior) {
      if (typeof onEntered === 'function') onEntered();
      return true;
    }
    this.lastDoorSide = side === 'left' ? 'left' : 'right';
    const stairX = this.lastDoorSide === 'left' ? 15.8 : 30.2;
    const stairZ = 11.2;
    const dist = Math.hypot(this.playerState.x - stairX, this.playerState.z - stairZ);

    const startApproach = () => {
      this.cancelAutoWalk();
      this.interiorTransition = {
        phase: 'climb_side_door',
        side: this.lastDoorSide,
        timer: 0,
        duration: 0.85,
        startX: this.playerState.x,
        startZ: this.playerState.z,
        targetX: stairX,
        targetZ: 8.1,
        onEntered
      };
      this.playerState.moving = true;
      this.playerState.yaw = Math.PI;
    };

    if (dist > 3.2) {
      this.walkToStation('chanh_dien', () => {
        startApproach();
      });
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
      duration: 0.28
    };
    return false;
  }

  setInteriorCutaway(enabled = null) {
    const next = enabled !== null ? Boolean(enabled) : !this.interiorCutaway;
    this.interiorCutaway = next;
    for (let i = 0; i < this.cutawayTargets.length; i++) {
      const obj = this.cutawayTargets[i];
      if (obj) obj.visible = !next;
    }
    this.syncPlayerTransform();
    this.renderFrame();
    return this.interiorCutaway;
  }

  toggleInterior(enter, side = null) {
    this.cancelEntranceTour();
    this.cancelAutoWalk();
    this.interiorTransition = null;
    if (side === 'left' || side === 'right') {
      this.lastDoorSide = side;
    }
    const useSide = this.lastDoorSide || 'right';
    this._doorCooldownUntil = performance.now() + 2200;
    this.inInterior = Boolean(enter ?? !this.inInterior);
    this.exteriorGroup.visible = !this.inInterior;
    this.interiorGroup.visible = this.inInterior;
    this.playerElevationY = 0;
    if (!this.inInterior && this.interiorCutaway) {
      this.setInteriorCutaway(false);
    }
    if (this.inInterior) {
      this.playerState.x = 0.0;
      this.playerState.z = 4.6;
      this.playerState.yaw = Math.PI;
      this.cameraBaseYaw = Math.PI;
    } else {
      this.playerState.x = useSide === 'left' ? 15.8 : 36.0;
      this.playerState.z = useSide === 'left' ? 18.5 : 15.2;
      this.playerState.yaw = 0;
      this.cameraBaseYaw = 0;
    }
    this.cameraAzimuthOffset = 0;
    this.syncPlayerTransform();
    if (this.inInterior) {
      this.nearestStallTrigger = null;
      this.onStallProximity(null);
    } else {
      this.checkStationProximity();
    }
    this.onInteriorStateChange(this.inInterior);
    this.renderFrame();
    return this.inInterior;
  }

  getInteriorZoneKey() {
    if (!this.inInterior) return 'exterior';
    const px = this.playerState.x;
    const pz = this.playerState.z;
    if (px > 12.2) return 'trai_duong';
    if (pz > 1.5) return 'tien_duong';
    if (pz >= -22.2) return 'chanh_dien';
    if (pz >= -38.8) return 'non_bo_giua';
    if (pz >= -53.0) return 'khu_tho';
    if (pz >= -68.5) return 'san_thien_tinh_2';
    return 'nha_hau';
  }

  goToInteriorZone(zoneKey = 'chanh_dien') {
    if (!this.inInterior) {
      this.toggleInterior(true, 'right');
    }
    this.cancelAutoWalk();
    this.playerElevationY = 0;
    if (zoneKey === 'tien_duong') {
      this.playerState.x = 0.0;
      this.playerState.z = 5.4;
      this.playerState.yaw = Math.PI;
      this.cameraBaseYaw = Math.PI;
    } else if (zoneKey === 'non_bo_giua') {
      this.playerState.x = -5.6;
      this.playerState.z = -25.4;
      const lookYaw = Math.atan2(0 - -5.6, -30.8 - -25.4);
      this.playerState.yaw = lookYaw;
      this.cameraBaseYaw = lookYaw;
    } else if (zoneKey === 'khu_tho') {
      this.playerState.x = 0.0;
      this.playerState.z = -42.5;
      this.playerState.yaw = Math.PI;
      this.cameraBaseYaw = Math.PI;
    } else if (zoneKey === 'san_thien_tinh_2') {
      this.playerState.x = -5.6;
      this.playerState.z = -56.0;
      const lookYaw = Math.atan2(0 - -5.6, -60.8 - -56.0);
      this.playerState.yaw = lookYaw;
      this.cameraBaseYaw = lookYaw;
    } else if (zoneKey === 'nha_hau') {
      this.playerState.x = 0.0;
      this.playerState.z = -72.5;
      this.playerState.yaw = Math.PI;
      this.cameraBaseYaw = Math.PI;
    } else if (zoneKey === 'trai_duong') {
      this.playerState.x = 16.5;
      this.playerState.z = -35.5;
      this.playerElevationY = 0.85;
      this.playerState.yaw = Math.PI / 2 - 0.08;
      this.cameraBaseYaw = Math.PI / 2 - 0.08;
    } else {
      this.playerState.x = 0.0;
      this.playerState.z = -6.2;
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
    if (this.activePlayerRecord) {
      this.playClipCrossfade(this.activePlayerRecord, resolved, 0.22, true);
      clearTimeout(this._poseReturnTimer);
      this._poseReturnTimer = setTimeout(() => {
        if (!this.playerState.moving && this.activePlayerRecord) {
          this.playerState.pose = 'Dung';
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

  updateEquippedItems(equipped = {}) {
    this.lastEquippedState = equipped;
    if (!this.equipmentGroup) return;
    while (this.equipmentGroup.children.length > 0) {
      this.equipmentGroup.remove(this.equipmentGroup.children[0]);
    }
    const h = CHAR_HEIGHTS[this.playerState.charKey] || 1.64;
    if (equipped.hat && this.propMeshCache.non_la) {
      const hat = this.propMeshCache.non_la.clone(true);
      hat.scale.setScalar(0.38);
      hat.position.set(0, h + 0.02, 0);
      this.equipmentGroup.add(hat);
    }
    if (equipped.bag && this.propMeshCache.tui_sen) {
      const bag = this.propMeshCache.tui_sen.clone(true);
      bag.scale.setScalar(0.28);
      bag.position.set(-0.22, h * 0.56, 0.04);
      this.equipmentGroup.add(bag);
    }
    if (equipped.hand === 'hoa_sen_trang_nghiem' && this.propMeshCache.hoa_sen) {
      const lotus = this.propMeshCache.hoa_sen.clone(true);
      lotus.scale.setScalar(0.26);
      lotus.position.set(0.22, h * 0.62, 0.24);
      this.equipmentGroup.add(lotus);
    }
  }

  applyStoreVisualsToPlayer(storeVisual = {}) {
    this.activeStorePreview = storeVisual;
    if (!this.activePlayerRecord?.root || !this.storePreviewGroup) return;

    // 1. Live robe color preview / equipped robe
    this.recolorPastelDress(this.activePlayerRecord.root, storeVisual.robeTint || null);

    // 2. Rebuild live prop previews attached to protagonist
    while (this.storePreviewGroup.children.length > 0) {
      this.storePreviewGroup.remove(this.storePreviewGroup.children[0]);
    }
    const h = CHAR_HEIGHTS[this.playerState.charKey] || 1.64;

    if (storeVisual.hat && this.propMeshCache.non_la) {
      const hat = this.fitProp(this.propMeshCache.non_la, 0.44);
      hat.position.set(0, h - 0.06, 0.02);
      this.storePreviewGroup.add(hat);
    }
    if (storeVisual.mat) {
      const matKey =
        storeVisual.mat === 'bo_doan_tron'
          ? 'bo_doan_tron'
          : storeVisual.mat === 'chieu_coi_thien'
          ? 'chieu_coi_thien'
          : 'bo_doan';
      const matScene = this.propMeshCache[matKey];
      if (matScene) {
        const matMesh = this.fitProp(matScene, matKey === 'chieu_coi_thien' ? 1.45 : 0.92);
        matMesh.position.set(0, 0.01, 0);
        this.storePreviewGroup.add(matMesh);
      }
    }
    if (storeVisual.handProp && this.propMeshCache[storeVisual.handProp]) {
      const prop = this.fitProp(this.propMeshCache[storeVisual.handProp], 0.34);
      prop.position.set(0.28, h * 0.56, 0.22);
      this.storePreviewGroup.add(prop);
    }
    if (storeVisual.treeProp && this.propMeshCache.chum_sen) {
      const urn = this.fitProp(this.propMeshCache.chum_sen, 0.85);
      urn.position.set(-0.68, 0, 0.25);
      this.storePreviewGroup.add(urn);
    }
    if (storeVisual.cloudColor) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.14, 10, 24),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(storeVisual.cloudColor),
          emissive: new THREE.Color(storeVisual.cloudColor),
          emissiveIntensity: 0.35,
          roughness: 0.4,
          transparent: true,
          opacity: 0.88
        })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 0.08, 0);
      this.storePreviewGroup.add(ring);
    }
    if (storeVisual.petType === 'dove') {
      const bird = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.45 })
      );
      body.scale.set(0.9, 0.8, 1.45);
      bird.add(body);
      const wingL = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.03, 0.14),
        new THREE.MeshStandardMaterial({ color: 0xF4F7FC, roughness: 0.5 })
      );
      wingL.position.set(-0.14, 0.03, 0);
      wingL.rotation.z = 0.28;
      bird.add(wingL);
      const wingR = wingL.clone();
      wingR.position.x = 0.14;
      wingR.rotation.z = -0.28;
      bird.add(wingR);
      bird.position.set(0.56, h + 0.22, -0.1);
      this.storePreviewGroup.add(bird);
    } else if (storeVisual.petType === 'koi') {
      const fish = new THREE.Mesh(
        new THREE.ConeGeometry(0.11, 0.42, 8),
        new THREE.MeshStandardMaterial({ color: 0xFF7043, roughness: 0.3 })
      );
      fish.rotation.x = Math.PI / 2;
      fish.position.set(0.58, 0.55, 0.18);
      this.storePreviewGroup.add(fish);
    }
    this.renderFrame();
  }

  syncPlayerTransform() {
    this.playerContainer.position.set(
      this.playerState.x,
      this.playerElevationY || 0,
      this.playerState.z
    );
    this.playerContainer.rotation.y = this.playerState.yaw;

    if (this.entranceTour?.active) return;

    if (this.inInterior && this.interiorCutaway) {
      const cutAngle = Math.PI * 0.78 + this.cameraAzimuthOffset;
      const cutDist = 30.0;
      const cutHeight = 20.5;
      const focusX = this.playerState.x * 0.4;
      const focusZ = Math.max(-72.0, Math.min(2.0, this.playerState.z - 8.0));
      this.camera.position.set(
        focusX - Math.sin(cutAngle) * cutDist,
        cutHeight,
        focusZ - Math.cos(cutAngle) * cutDist
      );
      this.camera.lookAt(focusX, 2.2, focusZ - 4.0);
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
        Math.hypot(this.playerState.x - -8.0, this.playerState.z - -15.5) < 9.5);
    const isMonumental =
      !this.inInterior &&
      ([2, 3, 8].includes(this.currentStationId) ||
        isAdidaPlaza ||
        Math.hypot(this.playerState.x - -24.5, this.playerState.z - 22.0) < 8.0 ||
        Math.hypot(this.playerState.x - 12.0, this.playerState.z - -27.5) < 8.5);

    const transitionPull = this.interiorTransition?.phase === 'climb_side_door' ? 2.1 : 0;
    const camDist = this.inInterior
      ? 4.6
      : (isAdidaPlaza ? 11.2 : isMonumental ? 11.2 : 7.0) - transitionPull;
    const camHeight = this.inInterior
      ? 2.15 + (this.playerElevationY || 0) * 0.9
      : (isAdidaPlaza ? 2.35 : isMonumental ? 2.15 : 2.1) + (this.playerElevationY || 0) * 0.7;
    const lookY = this.inInterior
      ? 2.45 + (this.playerElevationY || 0) * 0.85
      : isAdidaPlaza
      ? 10.2
      : isMonumental
      ? 7.6
      : 3.65;
    const lookAngle = this.cameraBaseYaw + this.cameraAzimuthOffset;
    const sideOffset = this.inInterior ? 0 : isMonumental ? 0.48 : 0.62;
    const cx =
      this.playerState.x - Math.sin(lookAngle) * camDist - Math.cos(lookAngle) * sideOffset;
    const cz =
      this.playerState.z - Math.cos(lookAngle) * camDist + Math.sin(lookAngle) * sideOffset;
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

    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - downX;
      const dy = e.clientY - downY;
      if (Math.hypot(dx, dy) > 6) {
        movedDrag = true;
        this.cancelEntranceTour();
        this.cameraAzimuthOffset -= dx * 0.0045;
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
          this.onObjectClick('OPEN_ARHAT');
          return;
        }
      }
      if (this.longTruClickTargets?.length) {
        const hits = raycaster.intersectObjects(this.longTruClickTargets, true);
        if (hits.length > 0) {
          this.onObjectClick('TOAST', {
            title: '🐉 Cặp Long Trụ Rồng Cuốn Gian Giữa Chánh Điện',
            desc: 'Hai cột gỗ lim lớn đặc trưng tại Chánh điện Chùa Vĩnh Tràng, chạm khắc rồng uốn lượn quanh thân cột thếp vàng nâng đỡ hệ vì kèo và bao lam.'
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
            title: '🪨 Sân Thiên Tỉnh · Hòn Non Bộ Giữa Chùa',
            desc: 'Hai khoảng giếng trời thông thoáng đón nắng gió tự nhiên, kết nối Chánh điện với Nhà Tổ và Nhà Hậu qua hành lang chữ Quốc.'
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
            desc: 'Không gian thọ trai dựng bằng gỗ căm xe trên hệ sàn cọc miền Tây bên hồ sen, phục vụ cơm chay và trà đá thanh tịnh.'
          });
          return;
        }
      }
    } else {
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
          let stallTitle = 'Cửa hàng trong khuôn viên chùa';
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

  animate() {
    const rawDelta = this.clock.getDelta();
    const dt = Math.min(rawDelta, 0.05);
    const trDt = this.isSoftwareGl ? Math.max(dt, Math.min(rawDelta, 0.35)) : dt;
    const elapsed = this.clock.elapsedTime;

    if (this.interiorTransition) {
      const tr = this.interiorTransition;
      tr.timer += trDt;
      const t = Math.min(1, tr.timer / Math.max(0.01, tr.duration));
      if (tr.phase === 'climb_side_door') {
        this.playerState.x = tr.startX + (tr.targetX - tr.startX) * t;
        this.playerState.z = tr.startZ + (tr.targetZ - tr.startZ) * t;
        this.playerElevationY = t * 1.18;
        this.playerState.moving = true;
        this.syncPlayerTransform();
        if (t >= 1) {
          this.onTransitionFade(true);
          this.interiorTransition = {
            phase: 'enter_veil',
            timer: 0,
            duration: 0.25,
            side: tr.side,
            onEntered: tr.onEntered
          };
        }
      } else if (tr.phase === 'enter_veil') {
        if (t >= 1) {
          this.inInterior = true;
          this.exteriorGroup.visible = false;
          this.interiorGroup.visible = true;
          this.playerElevationY = 0;
          this._doorCooldownUntil = performance.now() + 2600;
          const sx = tr.side === 'left' ? -9.6 : 9.6;
          this.playerState.x = sx;
          this.playerState.z = 0.9;
          this.playerState.yaw = tr.side === 'left' ? Math.PI / 2 : -Math.PI / 2;
          this.cameraBaseYaw = Math.PI;
          this.cameraAzimuthOffset = 0;
          this.nearestStallTrigger = null;
          this.onStallProximity(null);
          this.onInteriorStateChange(true);
          this.onTransitionFade(false);
          this.interiorTransition = {
            phase: 'walk_aisle_side',
            side: tr.side,
            timer: 0,
            duration: 0.78,
            startX: sx,
            startZ: 0.9,
            targetX: tr.side === 'left' ? -2.0 : 2.0,
            targetZ: 2.8,
            onEntered: tr.onEntered
          };
        }
      } else if (tr.phase === 'walk_aisle_side') {
        this.playerState.x = tr.startX + (tr.targetX - tr.startX) * t;
        this.playerState.z = tr.startZ + (tr.targetZ - tr.startZ) * t;
        this.playerState.yaw = Math.atan2(tr.targetX - tr.startX, tr.targetZ - tr.startZ);
        this.playerState.moving = true;
        this.syncPlayerTransform();
        if (t >= 1) {
          this.interiorTransition = {
            phase: 'walk_aisle',
            timer: 0,
            duration: 0.65,
            startX: tr.targetX,
            startZ: tr.targetZ,
            targetX: 0.0,
            targetZ: 4.6,
            onEntered: tr.onEntered
          };
        }
      } else if (tr.phase === 'walk_aisle') {
        this.playerState.x = tr.startX + (tr.targetX - tr.startX) * t;
        this.playerState.z = tr.startZ + (tr.targetZ - tr.startZ) * t;
        this.playerState.yaw = Math.atan2(tr.targetX - tr.startX, tr.targetZ - tr.startZ);
        this.playerState.moving = true;
        this.syncPlayerTransform();
        if (t >= 1) {
          const doneCb = tr.onEntered;
          this.playerState.yaw = Math.PI;
          this.playerState.moving = false;
          this.interiorTransition = null;
          this._doorCooldownUntil = performance.now() + 1800;
          this.syncPlayerTransform();
          if (typeof doneCb === 'function') doneCb();
        }
      } else if (tr.phase === 'exit_veil') {
        if (t >= 1) {
          const exitSide = tr.side || this.lastDoorSide || 'right';
          if (this.interiorCutaway) {
            this.setInteriorCutaway(false);
          }
          this.inInterior = false;
          this.exteriorGroup.visible = true;
          this.interiorGroup.visible = false;
          this.playerElevationY = 0;
          this._doorCooldownUntil = performance.now() + 2400;
          this.playerState.x = exitSide === 'left' ? 15.8 : 36.0;
          this.playerState.z = exitSide === 'left' ? 18.5 : 15.2;
          this.playerState.yaw = 0;
          this.playerState.moving = false;
          this.cameraBaseYaw = 0;
          this.cameraAzimuthOffset = 0;
          this.onInteriorStateChange(false);
          this.onTransitionFade(false);
          this.interiorTransition = null;
          this.syncPlayerTransform();
          this.checkStationProximity();
        }
      }
    } else {
      const walkDt = this.isSoftwareGl ? Math.max(dt, Math.min(rawDelta, 0.25)) : dt;
      this.updateHeldMovement(walkDt);
      this.updateAutoWalk(walkDt);
    }

    // Damped Entrance Camera Tour along Tam Quan -> Yellow Banner & Vietnamese Stalls -> Right Bougainvillea Path
    const tourStep = this.isSoftwareGl ? Math.max(dt, 0.14) : dt;
    this.stepEntranceTour(tourStep);

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
      } else {
        this.playerState.moveBlend = Math.max(0, this.playerState.moveBlend - dt * 7);
        if (
          this.activePlayerRecord.activeClipName === 'Di bo' ||
          this.activePlayerRecord.activeClipName === 'Đi bộ'
        ) {
          if (this.activePlayerRecord.activeAction) {
            this.activePlayerRecord.activeAction.paused = true;
          }
        } else {
          this.activePlayerRecord.mixer.update(dt);
        }
      }
    }

    if (!this.inInterior) {
      for (let ni = 0; ni < this.riggedNpcRecords.length; ni++) {
        const npc = this.riggedNpcRecords[ni];
        const pos = npc.rec.root.position;
        if (npc.pauseTimer > 0) {
          npc.pauseTimer -= dt;
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

    this.updateProjectedPins();
    this.renderer.render(this.scene, this.camera);
    if (this.isSoftwareGl) {
      const isActivelyAnimating =
        this.playerState.moving ||
        this.heldDirs.size > 0 ||
        this.autoWalkWaypoints.length > 0 ||
        this.entranceTour.active ||
        this.lotusBloomState.active ||
        Boolean(
          this.activePlayerRecord?.activeAction && !this.activePlayerRecord.activeAction.paused
        );
      this.afterDraw(() => this.animate(), isActivelyAnimating ? 100 : 520);
    } else {
      requestAnimationFrame(() => this.animate());
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
