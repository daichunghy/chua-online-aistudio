/**
 * VinhTrang3DWorld — scene 3D Chùa Vĩnh Tràng.
 * File này chỉ giữ constructor; các nhóm method nằm trong src/app/world/*.mjs (xem docs/ARCHITECTURE.md).
 */

import { THREE, GLTFLoader, applyMixins } from './world/shared.mjs';
import { apiAndCameraMethods } from './world/api-and-camera.mjs';
import { roadTrafficMethods } from './world/road-traffic.mjs';
import { materialsAndLightsMethods } from './world/materials-and-lights.mjs';
import { exteriorTownMethods } from './world/exterior-town.mjs';
import { templeGroundsMethods } from './world/temple-grounds.mjs';
import { gatesAndDiscoveryMethods } from './world/gates-and-discovery.mjs';
import { chanhDienExteriorMethods } from './world/chanh-dien-exterior.mjs';
import { groceryHallsStatuesMethods } from './world/grocery-halls-statues.mjs';
import { pondAndGardensMethods } from './world/pond-and-gardens.mjs';
import { courtyardInteractivesMethods } from './world/courtyard-interactives.mjs';
import { glbLoadingMethods } from './world/glb-loading.mjs';
import { charactersNpcsMethods } from './world/characters-npcs.mjs';
import { movementMethods } from './world/movement.mjs';
import { timeAndInteriorMethods } from './world/time-and-interior.mjs';
import { playerAndInteractionMethods } from './world/player-and-interaction.mjs';
import { renderLoopAndCutsceneMethods } from './world/render-loop-and-cutscene.mjs';
import { offeringRitualFxMethods } from './world/offering-ritual-fx.mjs';
import { npcCourtyardInteractionMethods } from './world/npc-courtyard-interaction.mjs';

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
    this.onNpcSpeechUpdate = callbacks.onNpcSpeechUpdate || (() => {});
    this.activeCourtyardNpcId = null;
    this.onEntranceTourChange = callbacks.onEntranceTourChange || (() => {});
    this.onStepSound = callbacks.onStepSound || (() => {});
    this._stepAudioTimer = 0;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xA6D0F0);
    this.scene.fog = new THREE.FogExp2(0xEADBC4, 0.0033);

    this.camera = new THREE.PerspectiveCamera(48, 16 / 9, 0.2, 900);

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

    // Spawn right at Cổng Phụ Tịnh Độ Huyền Môn looking straight down the tree-shaded entrance lane
    this.playerState = {
      x: 40.5,
      z: 43.8,
      yaw: Math.PI,
      moving: false,
      charKey: callbacks.initialCharKey || 'nu',
      pose: 'Dung',
      moveBlend: 0
    };
    this.heldDirs = new Set();
    this.currentStationId = 0;
    this.inInterior = false;
    this.cameraBaseYaw = Math.PI;
    this.cameraAzimuthOffset = 0;
    this.cameraPitchOffset = 0;
    this.cameraZoomOffset = 0;
    this.playerElevationY = 0;
    this.lastDoorSide = 'right';
    this._doorCooldownUntil = 0;
    this._camCurrentPos = new THREE.Vector3();
    this._camCurrentLook = new THREE.Vector3();
    this._camDesiredPos = new THREE.Vector3();
    this._camDesiredLook = new THREE.Vector3();
    this._camInitialized = false;
    this._lastCamDragAt = 0;
    this._titlePanActive = false;
    this._titlePanTime = 0;
    this.joystickVec = { x: 0, z: 0 };
    this.navGridExterior = null;
    this.navGridInterior = null;
    this.lanternClickTargets = [];
    this._stuckTracker = { lastX: 40.5, lastZ: 43.8, timer: 0, rerouted: false };

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
    this.interiorWalkingRecords = [];
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
    this.activeOfferingAnimations = [];
    this.interiorIncenseGroup = new THREE.Group();
    this.interiorOfferedLotusesGroup = new THREE.Group();

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
    window.addEventListener('blur', () => {
      this.heldDirs.clear();
      this.joystickVec.x = 0;
      this.joystickVec.z = 0;
      this.stopMoving();
    });

    this.syncPlayerTransform();
    this.snapCameraImmediate();
    this._animateStarted = false;
    this.loaded = false;
    this.loadAllGLBAssets();
  }
}

applyMixins(VinhTrang3DWorld,
  apiAndCameraMethods,
  roadTrafficMethods,
  materialsAndLightsMethods,
  exteriorTownMethods,
  templeGroundsMethods,
  gatesAndDiscoveryMethods,
  chanhDienExteriorMethods,
  groceryHallsStatuesMethods,
  pondAndGardensMethods,
  courtyardInteractivesMethods,
  glbLoadingMethods,
  charactersNpcsMethods,
  movementMethods,
  timeAndInteriorMethods,
  playerAndInteractionMethods,
  renderLoopAndCutsceneMethods,
  offeringRitualFxMethods,
  npcCourtyardInteractionMethods
);

export {
  findCharacterBones,
  attachStorePropsToCharacterRig,
  clearRiggedBoneProps,
  recolorGarmentOnScene,
  createBespokeRobeGroup,
  createStoreAccessoryGroup,
  createSculptedArhatShowcase
} from './garment-and-showcase-3d.mjs';
