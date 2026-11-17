import * as THREE from 'three';
import { createSculptedGardenArhat } from './sculpted-buddhas.mjs';

/**
 * Shared 3D garment recoloring, wearable robe props, store accessory meshes,
 * and 18-Arhat showcase statue helpers.
 * Extracted from vinh-trang-3d-world.mjs to prevent merge conflicts across workspaces.
 */

export function clearRiggedBoneProps(modelRoot) {
  if (!modelRoot) return;
  const toRemove = [];
  modelRoot.traverse((obj) => {
    if (obj.userData?.isStoreRiggedProp) {
      toRemove.push(obj);
    }
  });
  for (const obj of toRemove) {
    obj.parent?.remove(obj);
  }
}

export function recolorGarmentOnScene(T = THREE, modelRoot, opts = {}) {
  if (!modelRoot) return;
  const { robeTint, upperTint, lowerTint, trimTint, sashTint } = opts || {};
  const hasTint = Boolean(robeTint || upperTint || lowerTint);

  modelRoot.traverse((o) => {
    if (!o.isMesh || !o.geometry) return;
    const col = o.geometry.getAttribute('color');
    const pos = o.geometry.getAttribute('position');
    if (!col || !pos) return;
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
      if (!isSkin && sat < 0.3 && maxC > 0.18 && maxC < 0.92 && ny > 0.14 && ny < 0.85) {
        const shade = 0.74 + 0.36 * maxC;
        let target = robeTint || upperTint;
        if (ny < 0.44 && lowerTint) target = lowerTint;
        else if (ny >= 0.44 && upperTint) target = upperTint;
        if (sashTint && ny > 0.52 && ny < 0.68 && Math.abs(p.getX(i)) < 0.12) {
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

export function createStoreAccessoryGroup(T = THREE, storeVisual = {}, opts = {}) {
  const group = new T.Group();
  const h = opts.h || 1.6;
  const propCache = opts.propMeshCache || null;
  const fitProp = opts.fitPropFn;

  if (storeVisual.hat) {
    if (propCache?.non_la && typeof fitProp === 'function') {
      const hat = fitProp(propCache.non_la, 0.44);
      hat.position.set(0, h - 0.06, 0.02);
      group.add(hat);
    } else {
      const cone = new T.Mesh(
        new T.ConeGeometry(0.23, 0.15, 20, 1, true),
        new T.MeshStandardMaterial({ color: 0xDFC99B, roughness: 0.72, side: T.DoubleSide })
      );
      cone.position.set(0, h + 0.02, 0.01);
      group.add(cone);
    }
  }

  if (storeVisual.mat) {
    const matKey =
      storeVisual.mat === 'bo_doan_tron'
        ? 'bo_doan_tron'
        : storeVisual.mat === 'chieu_coi_thien'
        ? 'chieu_coi_thien'
        : 'bo_doan';
    if (propCache?.[matKey] && typeof fitProp === 'function') {
      const matMesh = fitProp(propCache[matKey], matKey === 'chieu_coi_thien' ? 1.35 : 0.88);
      matMesh.position.set(0, 0.01, 0);
      group.add(matMesh);
    } else {
      const matMesh = new T.Mesh(
        new T.CylinderGeometry(0.42, 0.45, 0.06, 24),
        new T.MeshStandardMaterial({ color: 0xB84A39, roughness: 0.7 })
      );
      matMesh.position.set(0, 0.03, 0);
      group.add(matMesh);
    }
  }

  if (storeVisual.bag && propCache?.tui_sen && typeof fitProp === 'function') {
    const bag = fitProp(propCache.tui_sen, 0.34);
    bag.position.set(-0.22, h * 0.54, 0.04);
    group.add(bag);
  }

  if (storeVisual.scarf && propCache?.khan_ran && typeof fitProp === 'function') {
    const scarf = fitProp(propCache.khan_ran, 0.44);
    scarf.position.set(0, h * 0.74, 0.06);
    group.add(scarf);
  }

  if (storeVisual.malaId && propCache?.trang_hat && typeof fitProp === 'function') {
    const mala = fitProp(propCache.trang_hat, 0.24);
    mala.position.set(-0.22, h * 0.52, 0.18);
    group.add(mala);
  }

  if (storeVisual.handProp && propCache?.[storeVisual.handProp] && typeof fitProp === 'function') {
    const prop = fitProp(propCache[storeVisual.handProp], 0.34);
    prop.position.set(0.28, h * 0.56, 0.22);
    group.add(prop);
  }

  const treeKey = storeVisual.treeProp || storeVisual.treeId;
  if (treeKey && typeof fitProp === 'function') {
    const treeModel =
      treeKey === 'cay_bo_de'
        ? propCache?.cay_bo_de
        : treeKey === 'cay_sala'
        ? propCache?.cay_sala
        : propCache?.chum_sen;
    if (treeModel) {
      const treeMesh = fitProp(treeModel, treeKey === 'chum_sanh_hoa_sen' || treeKey === 'chau_sen' ? 0.8 : 1.05);
      treeMesh.position.set(-0.62, 0, 0.2);
      group.add(treeMesh);
    }
  }

  if (storeVisual.cloudColor) {
    if (propCache?.vong_may && typeof fitProp === 'function') {
      const cloud = fitProp(propCache.vong_may, 1.08);
      cloud.traverse((o) => {
        if (o.isMesh && o.material) {
          o.material = o.material.clone();
          o.material.emissive = new T.Color(storeVisual.cloudColor);
          o.material.emissiveIntensity = 0.28;
          o.material.transparent = true;
          o.material.opacity = 0.92;
        }
      });
      cloud.position.set(0, 0.04, 0);
      group.add(cloud);
    } else {
      const ring = new T.Mesh(
        new T.TorusGeometry(0.52, 0.12, 10, 24),
        new T.MeshStandardMaterial({
          color: new T.Color(storeVisual.cloudColor),
          emissive: new T.Color(storeVisual.cloudColor),
          emissiveIntensity: 0.35,
          roughness: 0.4,
          transparent: true,
          opacity: 0.88
        })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 0.08, 0);
      group.add(ring);
    }
  }

  if (storeVisual.petType === 'dove') {
    if (propCache?.chim_bo_cau && typeof fitProp === 'function') {
      const bird = fitProp(propCache.chim_bo_cau, 0.42);
      bird.rotation.x = -Math.PI / 2;
      bird.position.set(0.54, h + 0.18, -0.08);
      group.add(bird);
    } else {
      const bird = new T.Group();
      const body = new T.Mesh(
        new T.SphereGeometry(0.1, 10, 8),
        new T.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.45 })
      );
      body.scale.set(0.9, 0.8, 1.4);
      bird.add(body);
      bird.position.set(0.52, h + 0.18, -0.08);
      group.add(bird);
    }
  } else if (storeVisual.petType === 'koi') {
    const fish = new T.Mesh(
      new T.ConeGeometry(0.1, 0.38, 8),
      new T.MeshStandardMaterial({ color: 0xFF7043, roughness: 0.3 })
    );
    fish.rotation.x = Math.PI / 2;
    fish.position.set(0.54, 0.52, 0.16);
    group.add(fish);
  }

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
