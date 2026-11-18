/**
 * Nhân vật: đổi màu áo, clone animation, người chơi, NPC khách hành hương & sư.
 *
 * Mixin của VinhTrang3DWorld: 11 method (recolorMonkRobe … spawnInteriorWorshippersV8).
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, SkeletonUtils, findCharacterBones, normalizeAnimKey, CHAR_HEIGHTS } from './shared.mjs';

export const charactersNpcsMethods = {
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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
};
