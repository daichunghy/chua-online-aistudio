import * as THREE from 'three';
import { STORE_ITEMS_CATALOG } from '../logic/chua-online-logic.mjs';

const DEFAULT_OUTFIT = {
  id: 'ao_trang_phat_tu',
  name: 'Áo lam cổ tàu',
  robeTint: [0.60, 0.56, 0.60],
  robeTrimHex: '#D8C8AF',
  robeMotif: 'lotus',
  robeStyle: 'classic'
};

function resolveOutfit(outfitId, fallbackTint) {
  const item = STORE_ITEMS_CATALOG.find((entry) => entry.id === outfitId && entry.slot === 'robe');
  const preset = item || DEFAULT_OUTFIT;
  return {
    ...preset,
    robeTint: Array.isArray(fallbackTint) ? fallbackTint : preset.robeTint
  };
}

function recolorGarmentVertices(model, tint) {
  if (!Array.isArray(tint) || tint.length < 3) return;
  const originalKey = '__chuaOnlineOutfitOriginalColors';

  model.traverse((mesh) => {
    if (!mesh.isMesh || !mesh.geometry) return;
    let geometry = mesh.geometry;
    if (!geometry.getAttribute('color')) return;

    if (!geometry.userData[originalKey]) {
      geometry = geometry.clone();
      mesh.geometry = geometry;
      const source = geometry.getAttribute('color');
      const original = new Float32Array(source.count * 3);
      for (let i = 0; i < source.count; i++) {
        original[i * 3] = source.getX(i);
        original[i * 3 + 1] = source.getY(i);
        original[i * 3 + 2] = source.getZ(i);
      }
      geometry.userData[originalKey] = original;
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(original), 3));
    }

    const colors = geometry.getAttribute('color');
    const positions = geometry.getAttribute('position');
    const original = geometry.userData[originalKey];
    if (!positions || !original) return;
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox;
    const ySpan = Math.max(0.001, bounds.max.y - bounds.min.y);

    for (let i = 0; i < colors.count; i++) {
      const r = original[i * 3];
      const g = original[i * 3 + 1];
      const b = original[i * 3 + 2];
      const maxChannel = Math.max(r, g, b);
      const minChannel = Math.min(r, g, b);
      const saturation = maxChannel > 0 ? (maxChannel - minChannel) / maxChannel : 0;
      const isSkin = r > g && g > b && r - b > 0.12 && r > 0.42;
      const normalizedY = (positions.getY(i) - bounds.min.y) / ySpan;

      if (!isSkin && saturation < 0.34 && maxChannel > 0.22 && maxChannel < 0.92 && normalizedY > 0.14 && normalizedY < 0.88) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        const fabricFold = 0.96 + 0.035 * Math.sin(x * 17 + y * 13 + z * 19);
        const verticalShade = 0.88 + normalizedY * 0.14;
        const shade = fabricFold * verticalShade * (0.82 + maxChannel * 0.18);
        colors.setXYZ(
          i,
          Math.min(1, tint[0] * shade),
          Math.min(1, tint[1] * shade),
          Math.min(1, tint[2] * shade)
        );
      } else {
        colors.setXYZ(i, r, g, b);
      }
    }
    colors.needsUpdate = true;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (material) {
        material.vertexColors = true;
        material.needsUpdate = true;
      }
    }
  });
}

function makeOutfitDetails(preset, height, baseY, frontZ) {
  const scale = height / 1.65;
  const group = new THREE.Group();
  group.name = 'character-outfit-details';

  const trimHex = preset.robeTrimHex || '#D8C8AF';
  const trimMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(trimHex),
    roughness: 0.72,
    metalness: 0.04
  });
  const buttonMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(preset.robeStyle === 'linen' ? '#765B3D' : '#B18A4D'),
    roughness: 0.55,
    metalness: 0.12
  });

  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.078 * scale, 0.006 * scale, 6, 22),
    trimMaterial
  );
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, baseY + height * 0.765, frontZ * 0.2);
  group.add(collar);

  const placket = new THREE.Mesh(
    new THREE.BoxGeometry(0.012 * scale, 0.17 * scale, 0.008 * scale),
    trimMaterial
  );
  placket.position.set(0, baseY + height * 0.66, frontZ * 0.98);
  group.add(placket);

  for (let i = 0; i < 4; i++) {
    const button = new THREE.Mesh(
      new THREE.SphereGeometry(0.0085 * scale, 8, 6),
      buttonMaterial
    );
    button.position.set(0, baseY + height * (0.715 - i * 0.036), frontZ * 1.045);
    group.add(button);
  }

  if (preset.robeMotif === 'lotus') {
    const petalMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E8A5B8'),
      roughness: 0.62
    });
    const centerMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D9A441'),
      roughness: 0.5,
      metalness: 0.2
    });
    const motif = new THREE.Group();
    const centerX = -0.075 * scale;
    const centerY = baseY + height * 0.635;
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5;
      const petal = new THREE.Mesh(
        new THREE.SphereGeometry(0.012 * scale, 8, 6),
        petalMaterial
      );
      petal.scale.set(0.72, 1.35, 0.34);
      petal.position.set(
        centerX + Math.cos(angle) * 0.014 * scale,
        centerY + Math.sin(angle) * 0.014 * scale,
        frontZ * 1.05
      );
      motif.add(petal);
    }
    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.006 * scale, 8, 6),
      centerMaterial
    );
    center.position.set(centerX, centerY, frontZ * 1.075);
    motif.add(center);
    group.add(motif);
  } else if (preset.robeMotif === 'cloud') {
    const cloudMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(trimHex),
      roughness: 0.7
    });
    for (let i = 0; i < 2; i++) {
      const cloud = new THREE.Mesh(
        new THREE.TorusGeometry(0.018 * scale, 0.0028 * scale, 6, 16, Math.PI),
        cloudMaterial
      );
      cloud.rotation.x = Math.PI / 2;
      cloud.rotation.z = Math.PI;
      cloud.position.set(-0.075 * scale + i * 0.025 * scale, baseY + height * 0.635, frontZ * 1.05);
      group.add(cloud);
    }
  }

  group.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = false;
      object.receiveShadow = true;
    }
  });
  return group;
}

export function applyCharacterOutfit(model, outfitId = 'ao_trang_phat_tu', fallbackTint = null) {
  if (!model) return null;
  const preset = resolveOutfit(outfitId, fallbackTint);
  const oldDetails = model.getObjectByName('character-outfit-details');
  if (oldDetails?.parent) oldDetails.parent.remove(oldDetails);

  recolorGarmentVertices(model, preset.robeTint);

  const bounds = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  bounds.getSize(size);
  const worldHeight = Math.max(0.2, size.y);
  const scaleY = Math.max(0.001, Math.abs(model.scale?.y || 1));
  const scaleZ = Math.max(0.001, Math.abs(model.scale?.z || 1));
  const localHeight = worldHeight / scaleY;
  const baseY = (bounds.min.y - model.position.y) / scaleY;
  const frontZ = Math.max(
    0.06 * (localHeight / 1.65),
    ((bounds.max.z - model.position.z) / scaleZ) * 0.78
  );
  const details = makeOutfitDetails(preset, localHeight, baseY, frontZ);
  model.add(details);
  return preset;
}
