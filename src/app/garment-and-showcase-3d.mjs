import * as THREE from 'three';
import { createSculptedGardenArhat } from './sculpted-buddhas.mjs';

/**
 * Shared 3D garment recoloring, skeleton-bone-attached wearable props,
 * store accessory meshes, and 18-Arhat showcase statue helpers.
 */

export function clearRiggedBoneProps(modelRoot, extraGroup = null) {
  const roots = [modelRoot, extraGroup].filter(Boolean);
  for (const r of roots) {
    const toRemove = [];
    r.traverse((obj) => {
      if (obj.userData?.isStoreRiggedProp) {
        toRemove.push(obj);
      }
    });
    for (const obj of toRemove) {
      obj.parent?.remove(obj);
    }
  }
}

/**
 * Resolves skeleton bones across both:
 *  - Legacy 15-bone characters (nu, nam, tre_em): Pelvis, Spine, Head, L hand, R hand, L forearm, R forearm
 *  - Meshy/Mixamo 24-bone characters (su_thay, nu_ao_lam, nam_ao_nau, du_khach): Hips, Spine, Spine01, Spine02, neck, Head, LeftHand, RightHand
 */
export function findCharacterBones(root) {
  const bones = {
    pelvis: null,
    spine: null,
    chest: null,
    neck: null,
    head: null,
    leftHand: null,
    rightHand: null,
    leftForearm: null,
    rightForearm: null,
    leftThigh: null,
    rightThigh: null,
    isMixamoRig: false,
    all: {}
  };
  if (!root) return bones;

  root.traverse((obj) => {
    if (!obj.isBone) return;
    const raw = String(obj.name || '');
    const n = raw.toLowerCase().replace(/[\s_-]+/g, '');
    bones.all[raw] = obj;

    if (n === 'hips' || n === 'pelvis') {
      bones.pelvis = bones.pelvis || obj;
      if (n === 'hips') bones.isMixamoRig = true;
    } else if (n === 'spine02' || n === 'upperchest' || n === 'chest') {
      bones.chest = obj;
      bones.isMixamoRig = true;
    } else if (n === 'spine01') {
      bones.spine = bones.spine || obj;
      bones.isMixamoRig = true;
    } else if (n === 'spine') {
      bones.spine = obj;
    } else if (n === 'neck') {
      bones.neck = obj;
    } else if (n === 'head') {
      bones.head = obj;
    } else if (n === 'lhand' || n === 'lefthand' || n === 'handl') {
      bones.leftHand = obj;
    } else if (n === 'rhand' || n === 'righthand' || n === 'handr') {
      bones.rightHand = obj;
    } else if (n === 'lforearm' || n === 'leftforearm') {
      bones.leftForearm = obj;
    } else if (n === 'rforearm' || n === 'rightforearm') {
      bones.rightForearm = obj;
    } else if (n === 'lthigh' || n === 'leftupleg') {
      bones.leftThigh = obj;
    } else if (n === 'rthigh' || n === 'rightupleg') {
      bones.rightThigh = obj;
    }
  });

  if (!bones.chest) bones.chest = bones.spine || bones.pelvis;
  if (!bones.neck) bones.neck = bones.chest;
  return bones;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function lerpRgb(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t
  ];
}

export function recolorGarmentOnScene(T = THREE, modelRoot, opts = {}) {
  if (!modelRoot) return;
  const { robeTint, upperTint, lowerTint, trimTint, sashTint } = opts || {};
  const hasTint = Boolean(robeTint || upperTint || lowerTint);

  modelRoot.traverse((o) => {
    if (!o.isMesh || !o.geometry) return;
    const col = o.geometry.getAttribute('color');
    const pos = o.geometry.getAttribute('position');

    // Case 1: Vertex-colored GLBs (nu, nam, tre_em)
    if (col && pos) {
      if (!hasTint && !o.geometry.userData.origColors) return;

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
        o.geometry.setAttribute('color', new T.Float32BufferAttribute(new Float32Array(origArr), 3));
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
        if (!hasTint) {
          c.setXYZ(i, r, g, b);
          continue;
        }
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const sat = maxC > 0 ? (maxC - minC) / maxC : 0;
        const isSkin = r > g && g > b && r - b > 0.12 && r > 0.42;
        const ny = (p.getY(i) - yMin) / ySpan;
        if (!isSkin && sat < 0.34 && maxC > 0.16 && maxC < 0.94 && ny > 0.12 && ny < 0.86) {
          const shade = 0.74 + 0.36 * maxC;
          let target = robeTint || upperTint;
          if (upperTint && lowerTint) {
            const waistBlend = clamp01((ny - 0.40) / 0.08);
            target = lerpRgb(lowerTint, upperTint, waistBlend);
          } else if (ny < 0.44 && lowerTint) {
            target = lowerTint;
          } else if (ny >= 0.44 && upperTint) {
            target = upperTint;
          }
          if (sashTint && ny > 0.52 && ny < 0.68 && Math.abs(p.getX(i)) < 0.13) {
            target = sashTint;
          } else if (trimTint && ny > 0.77 && ny < 0.84) {
            target = trimTint;
          }
          if (target) {
            c.setXYZ(
              i,
              Math.min(1, target[0] * shade),
              Math.min(1, target[1] * shade),
              Math.min(1, target[2] * shade)
            );
          } else {
            c.setXYZ(i, r, g, b);
          }
        } else {
          c.setXYZ(i, r, g, b);
        }
      }
      c.needsUpdate = true;
      return;
    }

    // Case 2: PBR textured GLBs (meshy_chars: su_thay, nu_ao_lam, nam_ao_nau, du_khach)
    if (o.material && !o.userData?.isStoreRiggedProp) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const mat of mats) {
        if (!mat || !mat.color) continue;
        if (!mat.userData.origColorHex) {
          mat.userData.origColorHex = mat.color.getHex();
        }
        const origColor = new T.Color(mat.userData.origColorHex);
        const targetArr = robeTint || upperTint || lowerTint;
        if (!hasTint || !targetArr) {
          mat.color.copy(origColor);
        } else {
          // Gentle harmonic tint preserving original fabric detail & skin luminance
          const tintCol = new T.Color(targetArr[0], targetArr[1], targetArr[2]);
          const whiteRef = new T.Color(0xFFFFFF);
          const lifted = whiteRef.clone().lerp(tintCol, 0.42);
          mat.color.copy(origColor).multiply(lifted);
        }
      }
    }
  });
}

export function createBespokeRobeGroup(T = THREE, opts = {}) {
  const group = new T.Group();
  const { robeStyle, sashTint, trimTint, h = 1.6 } = opts || {};
  if (!robeStyle) return group;

  const toColor = (arr, fallback) =>
    Array.isArray(arr) ? new T.Color(arr[0], arr[1], arr[2]) : new T.Color(fallback);

  if (robeStyle === 'vu_lan_bao_hieu') {
    const roseMat = new T.MeshStandardMaterial({ color: 0xE6396A, roughness: 0.4 });
    const rose = new T.Mesh(new T.SphereGeometry(0.036, 10, 8), roseMat);
    rose.position.set(0.09, h * 0.71, 0.14);
    group.add(rose);
  } else if (robeStyle === 'hoa_sen_phat' || robeStyle === 'gam_le_hoi') {
    const badgeMat = new T.MeshStandardMaterial({
      color: toColor(trimTint || sashTint, 0xE0AC3D),
      roughness: 0.35,
      metalness: 0.35
    });
    const badge = new T.Mesh(new T.TorusGeometry(0.032, 0.008, 8, 16), badgeMat);
    badge.position.set(0.09, h * 0.71, 0.14);
    group.add(badge);
  }

  return group;
}

function measureObjectBounds(T, obj) {
  const box = new T.Box3().setFromObject(obj);
  if (box.isEmpty()) return { w: 0.2, h: 0.2, d: 0.2 };
  const sz = box.getSize(new T.Vector3());
  return { w: sz.x, h: sz.y, d: sz.z };
}

function markRiggedProp(obj) {
  if (!obj) return obj;
  obj.userData = obj.userData || {};
  obj.userData.isStoreRiggedProp = true;
  obj.traverse((child) => {
    child.userData = child.userData || {};
    child.userData.isStoreRiggedProp = true;
  });
  return obj;
}

/**
 * Attaches all wearable store items & equipped ritual accessories directly to the
 * character's skeleton bones (so they bend, walk, bow, kneel, and swing cleanly with joints).
 * Ground-level items (cushion mats, aura halos, potted preview trees) go on groundGroup.
 */
export function attachStorePropsToCharacterRig(T = THREE, record, storeVisual = {}, opts = {}) {
  if (!record?.root) return;
  const {
    h = 1.64,
    propMeshCache = null,
    fitPropFn = null,
    groundGroup = null,
    isMoving = false,
    isKneeling = false,
    previewMode = false
  } = opts;

  clearRiggedBoneProps(record.root, groundGroup);

  const bones = findCharacterBones(record.root);
  const rootScale = record.root.scale.x || 1;
  const invS = 1 / rootScale;
  const fitProp = typeof fitPropFn === 'function' ? fitPropFn : null;

  // Apply garment recolor (supports both vertex-color and PBR textures)
  recolorGarmentOnScene(T, record.root, {
    robeTint: storeVisual.robeTint || null,
    upperTint: storeVisual.upperTint || null,
    lowerTint: storeVisual.lowerTint || null,
    trimTint: storeVisual.trimTint || null,
    sashTint: storeVisual.sashTint || null
  });

  // 1. Nón lá (attached to Head bone)
  if (storeVisual.hat) {
    let hat = null;
    if (propMeshCache?.non_la && fitProp) {
      hat = fitProp(propMeshCache.non_la, h < 1.3 ? 0.34 : 0.43);
    } else {
      hat = new T.Mesh(
        new T.ConeGeometry(0.22, 0.14, 20, 1, true),
        new T.MeshStandardMaterial({ color: 0xDFC99B, roughness: 0.72, side: T.DoubleSide })
      );
    }
    markRiggedProp(hat);
    if (bones.head) {
      hat.scale.multiplyScalar(invS);
      hat.position.set(0, (bones.isMixamoRig ? 0.11 : 0.13) * invS, 0.01 * invS);
      hat.rotation.x = -0.06;
      bones.head.add(hat);
    } else {
      hat.scale.multiplyScalar(invS);
      hat.position.set(0, h * 0.97 * invS, 0.01 * invS);
      record.root.add(hat);
    }
  }

  // 2. Khăn rằn Nam Bộ (attached to Neck / Chest bone)
  if (storeVisual.scarf) {
    let scarf = null;
    if (propMeshCache?.khan_ran && fitProp) {
      scarf = fitProp(propMeshCache.khan_ran, 0.40);
    } else {
      scarf = new T.Mesh(
        new T.TorusGeometry(0.13, 0.028, 7, 16),
        new T.MeshStandardMaterial({ color: 0x2B2420, roughness: 0.82 })
      );
      scarf.rotation.x = Math.PI / 2 - 0.16;
    }
    markRiggedProp(scarf);
    const collarBone = bones.neck || bones.chest || bones.spine;
    if (collarBone) {
      scarf.scale.multiplyScalar(invS);
      scarf.position.set(0, (bones.isMixamoRig ? 0.02 : 0.07) * invS, 0.03 * invS);
      collarBone.add(scarf);
    } else {
      scarf.scale.multiplyScalar(invS);
      scarf.position.set(0, h * 0.75 * invS, 0.05 * invS);
      record.root.add(scarf);
    }
  }

  // 3. Bespoke Robe Chest Rose (Vu Lan) or Lotus Badge (attached to Chest bone)
  if (storeVisual.robeStyle === 'vu_lan_bao_hieu' || storeVisual.robeStyle === 'hoa_sen_phat' || storeVisual.robeStyle === 'gam_le_hoi') {
    const badge = new T.Group();
    if (storeVisual.robeStyle === 'vu_lan_bao_hieu') {
      const rose = new T.Mesh(
        new T.SphereGeometry(0.034, 10, 8),
        new T.MeshStandardMaterial({ color: 0xE6396A, roughness: 0.38 })
      );
      badge.add(rose);
    } else {
      const col = Array.isArray(storeVisual.trimTint)
        ? new T.Color(storeVisual.trimTint[0], storeVisual.trimTint[1], storeVisual.trimTint[2])
        : new T.Color(0xE0AC3D);
      const lotusPin = new T.Mesh(
        new T.TorusGeometry(0.03, 0.008, 8, 16),
        new T.MeshStandardMaterial({ color: col, roughness: 0.32, metalness: 0.4 })
      );
      badge.add(lotusPin);
    }
    markRiggedProp(badge);
    const chestBone = bones.chest || bones.spine;
    if (chestBone) {
      badge.scale.multiplyScalar(invS);
      badge.position.set(0.08 * invS, (bones.isMixamoRig ? 0.09 : 0.14) * invS, 0.125 * invS);
      chestBone.add(badge);
    } else {
      badge.scale.multiplyScalar(invS);
      badge.position.set(0.08 * invS, h * 0.71 * invS, 0.13 * invS);
      record.root.add(badge);
    }
  }

  // 4. Túi vải sen / Giỏ mây tre (attached cleanly to Chest/Spine shoulder frame)
  if (storeVisual.bag) {
    let bag = null;
    if (storeVisual.bag === 'gio_may' && propMeshCache?.gio_may_tre && fitProp) {
      bag = fitProp(propMeshCache.gio_may_tre, 0.34);
    } else if (propMeshCache?.tui_sen && fitProp) {
      bag = fitProp(propMeshCache.tui_sen, 0.32);
    } else {
      bag = new T.Mesh(
        new T.BoxGeometry(0.1, 0.22, 0.2),
        new T.MeshStandardMaterial({ color: 0xEFE1C6, roughness: 0.78 })
      );
    }
    markRiggedProp(bag);
    const torsoBone = bones.chest || bones.spine;
    if (torsoBone) {
      bag.scale.multiplyScalar(invS);
      bag.position.set(-0.19 * invS, -0.05 * invS, -0.04 * invS);
      bag.rotation.z = 0.08;
      torsoBone.add(bag);
    } else {
      bag.scale.multiplyScalar(invS);
      bag.position.set(-0.2 * invS, h * 0.54 * invS, 0.02 * invS);
      record.root.add(bag);
    }
  }

  // 5. Tràng hạt Bồ Đề (attached to Left Hand bone)
  if (storeVisual.malaId) {
    let mala = null;
    if (propMeshCache?.trang_hat && fitProp) {
      mala = fitProp(propMeshCache.trang_hat, 0.20);
    } else {
      mala = new T.Mesh(
        new T.TorusGeometry(0.075, 0.014, 6, 14),
        new T.MeshStandardMaterial({ color: 0x5E3418, roughness: 0.45 })
      );
    }
    markRiggedProp(mala);
    const lHand = bones.leftHand || bones.leftForearm;
    if (lHand) {
      mala.scale.multiplyScalar(invS);
      mala.position.set(0, -0.04 * invS, 0.03 * invS);
      lHand.add(mala);
    } else {
      mala.scale.multiplyScalar(invS);
      mala.position.set(-0.22 * invS, h * 0.50 * invS, 0.14 * invS);
      record.root.add(mala);
    }
  }

  // 6. Vật phẩm cầm tay: Hoa sen, Quạt nan, Đèn hoa đăng, Nhang (attached to Right Hand bone!)
  if (storeVisual.handProp) {
    let handMesh = null;
    const key = storeVisual.handProp;
    const mappedKey =
      key === 'hoa_sen_trang_nghiem' || key === 'hoa_sen'
        ? 'nen_hoa_sen'
        : propMeshCache?.[key]
        ? key
        : null;
    if (mappedKey && propMeshCache?.[mappedKey] && fitProp) {
      handMesh = fitProp(propMeshCache[mappedKey], 0.28);
    } else if (key === 'hoa_sen_trang_nghiem' || key === 'hoa_sen') {
      handMesh = new T.Mesh(
        new T.ConeGeometry(0.08, 0.16, 8),
        new T.MeshStandardMaterial({ color: 0xEC6C9A, roughness: 0.45 })
      );
    }
    if (handMesh) {
      markRiggedProp(handMesh);
      const rHand = bones.rightHand || bones.rightForearm;
      if (rHand) {
        handMesh.scale.multiplyScalar(invS);
        handMesh.position.set(0, -0.02 * invS, 0.05 * invS);
        handMesh.rotation.x = 0.22;
        rHand.add(handMesh);
      } else {
        handMesh.scale.multiplyScalar(invS);
        handMesh.position.set(0.24 * invS, h * 0.56 * invS, 0.22 * invS);
        record.root.add(handMesh);
      }
    }
  }

  // 7. Linh vật đồng hành (Bồ câu trắng / Cá koi)
  if (storeVisual.petType === 'dove') {
    let bird = null;
    if (propMeshCache?.chim_bo_cau && fitProp) {
      bird = fitProp(propMeshCache.chim_bo_cau, 0.34);
      // Only rotate legacy flat sheet GLBs; full 3D Meshy doves already stand upright!
      const bnd = measureObjectBounds(T, propMeshCache.chim_bo_cau);
      if (bnd.d < bnd.h * 0.25) {
        bird.rotation.x = -Math.PI / 2;
      }
    } else {
      bird = new T.Group();
      const body = new T.Mesh(
        new T.SphereGeometry(0.09, 10, 8),
        new T.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.45 })
      );
      body.scale.set(0.9, 0.8, 1.4);
      bird.add(body);
    }
    markRiggedProp(bird);
    if (bones.head) {
      bird.scale.multiplyScalar(invS);
      bird.position.set(0.32 * invS, 0.24 * invS, -0.04 * invS);
      bones.head.add(bird);
    } else {
      bird.scale.multiplyScalar(invS);
      bird.position.set(0.45 * invS, (h + 0.14) * invS, -0.06 * invS);
      record.root.add(bird);
    }
  } else if (storeVisual.petType === 'koi') {
    const fish = new T.Mesh(
      new T.ConeGeometry(0.09, 0.34, 8),
      new T.MeshStandardMaterial({ color: 0xFF7043, roughness: 0.3 })
    );
    fish.rotation.x = Math.PI / 2;
    markRiggedProp(fish);
    const parentTarget = groundGroup || record.root;
    const scaleFactor = parentTarget === groundGroup ? 1 : invS;
    fish.scale.multiplyScalar(scaleFactor);
    fish.position.set(0.55 * scaleFactor, 0.56 * scaleFactor, 0.14 * scaleFactor);
    parentTarget.add(fish);
  }

  // 8. Ground-mounted items (Bồ đoàn / Chiếu cói chỉ trải khi quỳ/ngồi hoặc xem thử; Mây ngũ sắc; Cây preview)
  const gHost = groundGroup || record.root;
  const gScale = gHost === groundGroup ? 1 : invS;

  if (storeVisual.mat && (isKneeling || previewMode || !isMoving)) {
    const matKey =
      storeVisual.mat === 'bo_doan_tron'
        ? 'bo_doan_tron'
        : storeVisual.mat === 'chieu_coi_thien'
        ? 'chieu_coi_thien'
        : 'bo_doan';
    let matMesh = null;
    if (propMeshCache?.[matKey] && fitProp) {
      matMesh = fitProp(propMeshCache[matKey], matKey === 'chieu_coi_thien' ? 1.32 : 0.86);
    } else {
      matMesh = new T.Mesh(
        new T.CylinderGeometry(0.4, 0.44, 0.05, 24),
        new T.MeshStandardMaterial({ color: 0xB84A39, roughness: 0.7 })
      );
    }
    markRiggedProp(matMesh);
    matMesh.scale.multiplyScalar(gScale);
    matMesh.position.set(0, 0.012 * gScale, 0.05 * gScale);
    gHost.add(matMesh);
  }

  if (storeVisual.cloudColor) {
    let cloud = null;
    if (propMeshCache?.vong_may && fitProp) {
      cloud = fitProp(propMeshCache.vong_may, 1.02);
      cloud.traverse((o) => {
        if (o.isMesh && o.material) {
          o.material = o.material.clone();
          o.material.emissive = new T.Color(storeVisual.cloudColor);
          o.material.emissiveIntensity = 0.25;
          o.material.transparent = true;
          o.material.opacity = 0.88;
        }
      });
    } else {
      cloud = new T.Mesh(
        new T.TorusGeometry(0.5, 0.11, 10, 24),
        new T.MeshStandardMaterial({
          color: new T.Color(storeVisual.cloudColor),
          emissive: new T.Color(storeVisual.cloudColor),
          emissiveIntensity: 0.32,
          roughness: 0.4,
          transparent: true,
          opacity: 0.84
        })
      );
      cloud.rotation.x = Math.PI / 2;
    }
    markRiggedProp(cloud);
    cloud.scale.multiplyScalar(gScale);
    cloud.position.set(0, 0.04 * gScale, 0);
    gHost.add(cloud);
  }

  // Potted Bodhi / Sala trees only appear when previewing in Store / stationary showcase (never glued to walking feet)
  const treeKey = storeVisual.treeProp || storeVisual.treeId;
  if (treeKey && (previewMode || !isMoving) && fitProp) {
    const modelKey =
      treeKey === 'cay_bo_de' || treeKey === 'cay_bo_de_phat'
        ? 'cay_bo_de'
        : treeKey === 'cay_sala' || treeKey === 'cay_sala_phat'
        ? 'cay_sala'
        : 'chum_sen';
    const treeModel = propMeshCache?.[modelKey];
    if (treeModel) {
      const treeMesh = fitProp(treeModel, modelKey === 'chum_sen' ? 0.82 : 1.05);
      markRiggedProp(treeMesh);
      treeMesh.scale.multiplyScalar(gScale);
      treeMesh.position.set(-0.72 * gScale, 0, 0.24 * gScale);
      gHost.add(treeMesh);
    }
  }
}

export function createStoreAccessoryGroup(T = THREE, storeVisual = {}, opts = {}) {
  const group = new T.Group();
  const h = opts.h || 1.64;
  const fakeRecord = { root: group, baseY: 0 };
  attachStorePropsToCharacterRig(T, fakeRecord, storeVisual, {
    ...opts,
    h,
    groundGroup: group,
    previewMode: true
  });
  return group;
}

export function createSculptedArhatShowcase(arhatIdx = 0, T = THREE) {
  const stoneMat = new T.MeshStandardMaterial({
    color: 0xEFE7D6,
    roughness: 0.48,
    metalness: 0.08
  });
  return createSculptedGardenArhat(T, arhatIdx, { stoneMat, scale: 1.0 });
}
