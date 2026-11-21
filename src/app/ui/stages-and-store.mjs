/**
 * Sân khấu 3D nhân vật/La Hán, cửa hàng 9 tab, quán ăn, sạp hàng.
 *
 * Mixin của ChuaOnlineApp: 8 method (mountProfileCharacterStage … openMarketplaceStallModal).
 * Được gắn vào class trong chua-online-app.mjs qua applyMixins().
 */
import { CHARACTER_PROFILES, calculateCartSummary, STORE_CATEGORIES, STORE_ITEMS_CATALOG, filterStoreItems, tryOnStoreItem, purchaseStoreItem, MARKETPLACE_STALL_CATEGORIES, MARKETPLACE_STALL_CATALOG, filterMarketplaceItems, purchaseMarketplaceItem, SHOPEE_BESTSELLER_META, SHOPEE_CURATED_COMBOS, resolveShopeeAffiliateUrl, validateShopeeAffiliateUrl, mergeShopeeAffiliateOverrides, recordShopeeAffiliateClick, getTotalShopeeClicks, unifyEquippedVisualPayload, recolorGarmentOnScene, clearRiggedBoneProps, createBespokeRobeGroup, createStoreAccessoryGroup, createSculptedArhatShowcase } from './shared.mjs';

export const stagesAndStoreMethods = {
  async mountProfileCharacterStage(canvasId, { charKey = 'nu', pose = 'Dung' }) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (this._profileStageDispose) {
      try {
        this._profileStageDispose();
      } catch {}
      this._profileStageDispose = null;
    }

    try {
      const THREE = await import('three');
      const SkeletonUtils = await import('three/addons/utils/SkeletonUtils.js');
      const wrap = canvas.parentElement;
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(260, rect.width || 282);
      const h = Math.max(260, rect.height || 292);

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'default' });
      renderer.debug.checkShaderErrors = false;
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 40);
      camera.position.set(0, 1.06, 3.25);
      camera.lookAt(0, 0.86, 0);

      // Clean warm 3-point lighting matching sunlit courtyard
      scene.add(new THREE.HemisphereLight(0xFFF9EA, 0x7A5A3A, 1.35));
      const keyLight = new THREE.DirectionalLight(0xFFE7BA, 1.55);
      keyLight.position.set(2.5, 4.5, 3.2);
      scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0xFFE4B0, 0.72);
      rimLight.position.set(-2.4, 2.2, -2.5);
      scene.add(rimLight);

      const stageGroup = new THREE.Group();
      scene.add(stageGroup);

      // Subtle sandstone lotus plinth at feet (no bulky brown disc blocking character)
      const plinth = new THREE.Mesh(
        new THREE.CylinderGeometry(0.54, 0.62, 0.07, 36),
        new THREE.MeshStandardMaterial({ color: 0xD8C39E, roughness: 0.78 })
      );
      plinth.position.y = -0.035;
      stageGroup.add(plinth);
      const trimRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.016, 10, 40),
        new THREE.MeshStandardMaterial({ color: 0xC9962E, roughness: 0.45, metalness: 0.35 })
      );
      trimRing.rotation.x = Math.PI / 2;
      trimRing.position.y = 0.002;
      stageGroup.add(trimRing);

      // Load/reuse rigged character GLB with SkeletonUtils.clone
      const profile = CHARACTER_PROFILES.find((c) => c.key === charKey) || CHARACTER_PROFILES[0];
      let gltf = this.world3d?.charDataCache?.[charKey] || this.cachedGLBCharacters[charKey];
      if (!gltf?.scene) {
        const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
        const loader = new GLTFLoader();
        gltf = await loader.loadAsync(profile.glb);
        this.cachedGLBCharacters[charKey] = gltf;
      }

      let mixer = null;
      if (gltf?.scene && document.body.contains(canvas)) {
        const cloned = SkeletonUtils.clone(gltf.scene);
        let geomBox = null;
        cloned.traverse((o) => {
          if (o.isMesh || o.isSkinnedMesh) {
            o.frustumCulled = false;
            if (o.geometry) {
              if (!o.geometry.getAttribute('normal')) o.geometry.computeVertexNormals();
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
              if (o.geometry?.getAttribute('color')) o.material.vertexColors = true;
              o.material.metalness = 0.0;
              o.material.roughness = 0.85;
            }
          }
        });
        if (!geomBox) geomBox = new THREE.Box3().setFromObject(cloned);
        const targetH = profile.heightMeters || 1.62;
        const scale = targetH / Math.max(0.2, geomBox.max.y - geomBox.min.y);
        cloned.scale.setScalar(scale);
        cloned.position.y = -geomBox.min.y * scale;
        stageGroup.add(cloned);

        // Unified Store Robes + Bespoke 3D Wearables + Equipped Props Preview (bone-weighted)
        const storeVisual = this.buildStoreVisualPayload();
        clearRiggedBoneProps(cloned);
        recolorGarmentOnScene(THREE, cloned, {
          robeTint: storeVisual.robeTint,
          upperTint: storeVisual.upperTint,
          lowerTint: storeVisual.lowerTint,
          trimTint: storeVisual.trimTint,
          sashTint: storeVisual.sashTint,
          robeStyle: storeVisual.robeStyle
        });
        const bespokeRobe = createBespokeRobeGroup(THREE, {
          ...storeVisual,
          charKey,
          h: targetH,
          modelRoot: cloned
        });
        stageGroup.add(bespokeRobe);
        const accGroup = createStoreAccessoryGroup(THREE, storeVisual, {
          charKey,
          h: targetH,
          modelRoot: cloned,
          propMeshCache: this.world3d?.propMeshCache || null,
          fitPropFn: this.world3d ? (sc, sz, o) => this.world3d.fitProp(sc, sz, o) : null
        });
        stageGroup.add(accGroup);

        const norm = (s) =>
          String(s || '')
            .replace(/_world$/, '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toLowerCase()
            .trim();

        mixer = new THREE.AnimationMixer(cloned);
        const actions = {};
        const normActions = {};
        for (const clip of gltf.animations || []) {
          const clean = clip.name.replace(/_world$/, '');
          const act = mixer.clipAction(clip);
          actions[clean] = act;
          normActions[norm(clean)] = act;
        }
        const clip =
          actions[pose] ||
          normActions[norm(pose)] ||
          actions['Dung'] ||
          normActions['dung'] ||
          Object.values(actions)[0];
        if (clip) {
          clip.reset();
          if (pose === 'Quỳ' || pose === 'Chắp tay') {
            clip.setLoop(THREE.LoopOnce, 1);
            clip.clampWhenFinished = true;
            clip.play();
            mixer.setTime(pose === 'Quỳ' ? 2.4 : 1.35);
            mixer.update(0);
          } else {
            clip.setLoop(THREE.LoopRepeat, Infinity);
            clip.play();
            mixer.update(0.06);
          }
        }
      }

      let disposed = false;
      let contextLost = false;
      let dragging = false;
      let prevX = 0;
      const onContextLost = (e) => {
        e.preventDefault();
        contextLost = true;
      };
      const onContextRestored = () => {
        contextLost = false;
      };
      canvas.addEventListener('webglcontextlost', onContextLost, false);
      canvas.addEventListener('webglcontextrestored', onContextRestored, false);

      const safeRender = () => {
        if (disposed || contextLost) return;
        try {
          if (renderer.getContext?.()?.isContextLost?.()) return;
          renderer.render(scene, camera);
        } catch {}
      };

      const onDown = (e) => {
        dragging = true;
        prevX = e.clientX;
      };
      const onUp = () => {
        dragging = false;
      };
      const onMove = (e) => {
        if (!dragging) return;
        stageGroup.rotation.y += (e.clientX - prevX) * 0.012;
        prevX = e.clientX;
      };
      canvas.addEventListener('pointerdown', onDown);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointermove', onMove);

      let profileTimer = null;
      this._profileStageDispose = () => {
        disposed = true;
        if (profileTimer) clearTimeout(profileTimer);
        canvas.removeEventListener('webglcontextlost', onContextLost, false);
        canvas.removeEventListener('webglcontextrestored', onContextRestored, false);
        canvas.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointermove', onMove);
        renderer.dispose();
        try {
          renderer.forceContextLoss?.();
        } catch {}
      };

      stageGroup.rotation.y = 0.18;
      safeRender();

      const tickDelay = this.world3d?.isSoftwareGl ? 900 : 33;
      const tick = () => {
        if (disposed || !document.body.contains(canvas)) {
          if (!disposed) this._profileStageDispose?.();
          return;
        }
        if (mixer) mixer.update(Math.min(0.12, tickDelay / 1000));
        if (!dragging) stageGroup.rotation.y += 0.006;
        safeRender();
        profileTimer = setTimeout(() => {
          if (!disposed) requestAnimationFrame(tick);
        }, tickDelay);
      };
      profileTimer = setTimeout(() => {
        if (!disposed) requestAnimationFrame(tick);
      }, tickDelay);
    } catch {}
  },

  async mountArhat3DStage(canvasId, arhatIdx = 0) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (this._arhatStageDispose) {
      try {
        this._arhatStageDispose();
      } catch {}
      this._arhatStageDispose = null;
    }

    try {
      const THREE = await import('three');
      const wrap = canvas.parentElement;
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(240, rect.width || 280);
      const h = Math.max(240, rect.height || 280);

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'default' });
      renderer.debug.checkShaderErrors = false;
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 30);

      scene.add(new THREE.HemisphereLight(0xFFF6DF, 0x5C3A21, 1.45));
      const key = new THREE.DirectionalLight(0xFFE2A8, 1.75);
      key.position.set(2.4, 4.2, 3.2);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xF6C978, 0.72);
      rim.position.set(-2.4, 2.0, -2.5);
      scene.add(rim);

      const stageGroup = new THREE.Group();
      scene.add(stageGroup);

      const statue = createSculptedArhatShowcase(arhatIdx, THREE);
      const box = new THREE.Box3().setFromObject(statue);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);
      statue.position.set(-center.x, -box.min.y, -center.z);
      stageGroup.add(statue);

      const maxDim = Math.max(1.2, size.y, size.x * 1.15);
      camera.position.set(0, size.y * 0.56, maxDim * 2.15);
      camera.lookAt(0, size.y * 0.48, 0);

      let disposed = false;
      let contextLost = false;
      let dragging = false;
      let prevX = 0;
      const onContextLost = (e) => {
        e.preventDefault();
        contextLost = true;
      };
      const onContextRestored = () => {
        contextLost = false;
      };
      canvas.addEventListener('webglcontextlost', onContextLost, false);
      canvas.addEventListener('webglcontextrestored', onContextRestored, false);

      const safeRender = () => {
        if (disposed || contextLost) return;
        try {
          if (renderer.getContext?.()?.isContextLost?.()) return;
          renderer.render(scene, camera);
        } catch {}
      };

      const onDown = (e) => {
        dragging = true;
        prevX = e.clientX;
      };
      const onUp = () => {
        dragging = false;
      };
      const onMove = (e) => {
        if (!dragging) return;
        stageGroup.rotation.y += (e.clientX - prevX) * 0.012;
        prevX = e.clientX;
      };
      canvas.addEventListener('pointerdown', onDown);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointermove', onMove);

      let arhatTimer = null;
      this._arhatStageDispose = () => {
        disposed = true;
        if (arhatTimer) clearTimeout(arhatTimer);
        canvas.removeEventListener('webglcontextlost', onContextLost, false);
        canvas.removeEventListener('webglcontextrestored', onContextRestored, false);
        canvas.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointermove', onMove);
        renderer.dispose();
        try {
          renderer.forceContextLoss?.();
        } catch {}
      };

      stageGroup.rotation.y = 0.25;
      safeRender();

      const tickDelay = this.world3d?.isSoftwareGl ? 240 : 33;
      const tick = () => {
        if (disposed || !document.body.contains(canvas)) {
          if (!disposed) this._arhatStageDispose?.();
          return;
        }
        if (!dragging) stageGroup.rotation.y += 0.0065;
        safeRender();
        arhatTimer = setTimeout(() => {
          if (!disposed) requestAnimationFrame(tick);
        }, tickDelay);
      };
      tick();
    } catch {}
  },

  /* ========================================================================
     THREE.JS INTERACTIVE 3D STAGE (Loads Real Rigged GLBs + 3D Shop Kiosk + 3D Items)
     ======================================================================== */
  async mountInteractive3DStage(canvasId, { item, charKey }) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (this._interactiveStageDispose) {
      try {
        this._interactiveStageDispose();
      } catch {}
      this._interactiveStageDispose = null;
    }

    try {
      const THREE = await import('three');
      const rect = canvas.parentElement.getBoundingClientRect();
      const w = Math.max(240, rect.width || 320);
      const h = Math.max(220, rect.height || 260);

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'default' });
      renderer.debug.checkShaderErrors = false;
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
      camera.position.set(0, 0.65, 2.25);
      camera.lookAt(0, 0.22, 0);

      scene.add(new THREE.HemisphereLight(0xFFF9EA, 0x7A5A3A, 1.35));
      const dir = new THREE.DirectionalLight(0xffdf9e, 1.75);
      dir.position.set(3, 5, 4);
      scene.add(dir);
      const rim = new THREE.DirectionalLight(0xFFE4B0, 0.65);
      rim.position.set(-2.5, 2.4, -2.5);
      scene.add(rim);

      const ped = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.72, 0.08, 32),
        new THREE.MeshStandardMaterial({ color: 0xc8963e, roughness: 0.4, metalness: 0.4 })
      );
      ped.position.y = -0.38;
      scene.add(ped);

      const stageGroup = new THREE.Group();
      scene.add(stageGroup);

      const fitPropToPedestal = (sceneObj, targetSize) => {
        const clone = sceneObj.clone(true);
        const toRemove = [];
        clone.traverse((o) => {
          if (o.isMesh) {
            if (o.geometry && !o.geometry.getAttribute('normal')) {
              o.geometry.computeVertexNormals();
            }
            const cb = new THREE.Box3().setFromObject(o);
            const cs = new THREE.Vector3();
            cb.getSize(cs);
            if (Math.max(cs.x, cs.z) > 40 && cs.y < Math.max(cs.x, cs.z) * 0.08) {
              toRemove.push(o);
            }
          }
        });
        for (const rem of toRemove) {
          rem.parent?.remove(rem);
        }
        const box = new THREE.Box3().setFromObject(clone);
        const sz = new THREE.Vector3();
        const ctr = new THREE.Vector3();
        box.getSize(sz);
        box.getCenter(ctr);
        const maxDim = Math.max(0.05, sz.x, sz.y, sz.z);
        const s = targetSize / maxDim;
        clone.scale.setScalar(s);
        clone.position.x = -ctr.x * s;
        clone.position.z = -ctr.z * s;
        const box2 = new THREE.Box3().setFromObject(clone);
        clone.position.y = -box2.min.y;
        return clone;
      };

      // Instant procedural placeholder while/if real GLB loads
      let activeItemObj = this.build3DItemMesh(THREE, item?.procedural3dId || item?.id || 'non_la_theu_sen');
      if (charKey) {
        activeItemObj.position.set(0.32, -0.15, 0.18);
      } else {
        activeItemObj.position.set(0, -0.15, 0);
        activeItemObj.scale.setScalar(1.35);
      }
      stageGroup.add(activeItemObj);

      // Load real GLB asset if provided on catalog item
      if (item?.glb) {
        const loadGlbForPreview = async () => {
          let cachedScene = this.cachedGLBProps[item.glb];
          if (!cachedScene) {
            const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
            const loader = new GLTFLoader();
            const gltf = await loader.loadAsync(encodeURI(item.glb));
            if (gltf?.scene) {
              this.cachedGLBProps[item.glb] = gltf.scene;
              cachedScene = gltf.scene;
            }
          }
          if (!cachedScene || !document.body.contains(canvas)) return;
          const fitted = fitPropToPedestal(cachedScene, charKey ? 0.45 : 0.96);
          if (charKey) {
            fitted.position.x += 0.34;
            fitted.position.z += 0.16;
          }
          fitted.position.y -= 0.34;
          stageGroup.remove(activeItemObj);
          stageGroup.add(fitted);
          activeItemObj = fitted;
        };
        loadGlbForPreview().catch(() => {});
      }

      // Load rigged 3D character GLB if charKey specified
      if (charKey) {
        this.loadRiggedCharacterGLB(THREE, charKey).then((charMesh) => {
          if (charMesh && document.body.contains(canvas)) {
            stageGroup.add(charMesh);
          }
        });
      }

      let dragging = false;
      let disposed = false;
      let contextLost = false;
      const isSoftPreview = (() => {
        try {
          const gl = renderer.getContext();
          const ext = gl?.getExtension('WEBGL_debug_renderer_info');
          const gpu = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
          return /SwiftShader|llvmpipe|softpipe|Software/i.test(gpu);
        } catch {
          return false;
        }
      })();
      const onContextLost = (e) => {
        e.preventDefault();
        contextLost = true;
      };
      const onContextRestored = () => {
        contextLost = false;
      };
      canvas.addEventListener('webglcontextlost', onContextLost, false);
      canvas.addEventListener('webglcontextrestored', onContextRestored, false);

      const safeRender = () => {
        if (disposed || contextLost) return;
        try {
          if (renderer.getContext?.()?.isContextLost?.()) return;
          renderer.render(scene, camera);
        } catch {}
      };

      let prevX = 0;
      const onDown = (e) => {
        dragging = true;
        prevX = e.clientX;
      };
      const onUp = () => {
        dragging = false;
      };
      const onMove = (e) => {
        if (!dragging) return;
        stageGroup.rotation.y += (e.clientX - prevX) * 0.012;
        prevX = e.clientX;
        if (isSoftPreview) safeRender();
      };
      canvas.addEventListener('pointerdown', onDown);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointermove', onMove);

      let rafId = null;
      let timerId = null;
      const cleanup = () => {
        if (disposed) return;
        disposed = true;
        if (timerId) clearTimeout(timerId);
        if (rafId) cancelAnimationFrame(rafId);
        canvas.removeEventListener('webglcontextlost', onContextLost, false);
        canvas.removeEventListener('webglcontextrestored', onContextRestored, false);
        canvas.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointermove', onMove);
        renderer.dispose();
        try {
          renderer.forceContextLoss?.();
        } catch {}
      };
      this._interactiveStageDispose = cleanup;

      const animate = () => {
        if (disposed || !document.body.contains(canvas)) {
          cleanup();
          return;
        }
        if (!dragging) stageGroup.rotation.y += 0.008;
        safeRender();
        if (!isSoftPreview) {
          timerId = setTimeout(() => {
            if (!disposed) rafId = requestAnimationFrame(animate);
          }, 33);
        }
      };
      animate();
    } catch {}
  },

  buildStoreVisualPayload(profile = this.storeProfile) {
    return unifyEquippedVisualPayload(profile, this.spiritual);
  },

  syncStoreVisualsTo3D() {
    this.world3d?.applyStoreVisualsToPlayer?.(this.buildStoreVisualPayload(this.storeProfile));
  },

  openNineTabStoreModal(initialCategory = null) {
    if (initialCategory) {
      this.storeCategory = initialCategory;
    }
    this.storeTryOnPose = this.storeTryOnPose || 'Dung';

    const renderStoreBody = (preserveScrollTop = 0) => {
      const items = filterStoreItems(this.storeCategory);
      const profile = this.storeProfile;
      const activeVisual = this.buildStoreVisualPayload(profile);
      const tryingItem = profile.tryingItemId
        ? STORE_ITEMS_CATALOG.find((x) => x.id === profile.tryingItemId)
        : null;
      const activeProf =
        CHARACTER_PROFILES.find((c) => c.key === this.characterModelKey) || CHARACTER_PROFILES[0];
      const activeDressLabel = tryingItem
        ? `Đang mặc thử: ${tryingItem.name}`
        : activeVisual.robeName
        ? `Đang mặc: ${activeVisual.robeName}`
        : `Mặc định: ${activeProf.outfitName.split('(')[0].trim()}`;

      const html = `
        <div class="store-currency-bar">
          <div class="store-wallet-pills">
            <span class="store-wallet-pill">💎 <span id="store-gems-count">${profile.gems}</span></span>
            <span class="store-wallet-pill">🪷 <span id="store-lotus-count">${profile.lotusPoints}</span></span>
            <span class="store-wallet-pill">Cấp ${profile.level}</span>
          </div>
          <button type="button" class="store-physical-btn" id="btn-open-physical-shop">
            🛍️ Quà lưu niệm giao tận nhà
          </button>
        </div>

        <div class="store-tryon-preview">
          <div class="store-tryon-canvas-wrap">
            <canvas id="store-tryon-3d-canvas"></canvas>
          </div>
          <div class="store-tryon-meta">
            <div class="store-tryon-title">${activeDressLabel}</div>
            <div class="store-tryon-controls">
              ${CHARACTER_PROFILES.map(
                (c) => `
                <button type="button" class="store-tryon-mini-btn ${this.characterModelKey === c.key ? 'active' : ''}" data-store-char="${c.key}">
                  ${c.name.split('(')[0].replace('Phật tử ', '').trim()}
                </button>
              `
              ).join('')}
              <button type="button" class="store-tryon-mini-btn ${this.storeTryOnPose === 'Dung' ? 'active' : ''}" data-store-pose="Dung">Đứng</button>
              <button type="button" class="store-tryon-mini-btn ${this.storeTryOnPose === 'Chắp tay' ? 'active' : ''}" data-store-pose="Chắp tay">Chắp tay</button>
              ${
                tryingItem
                  ? `<button type="button" class="store-tryon-mini-btn" id="btn-store-clear-try">Bỏ thử</button>`
                  : ''
              }
            </div>
            <div style="font-size:11.5px;color:#5C4330;line-height:1.35;">
              Kéo hình 3D để xoay 360° · Bấm <strong>Mặc thử 3D</strong> hoặc <strong>Thỉnh / Mặc ngay</strong> để mặc trực tiếp lên nhân vật.
            </div>
          </div>
        </div>

        <div class="store-tabs-wrap" role="tablist">
          ${STORE_CATEGORIES.map(
            (cat) => `
            <button type="button" class="store-cat-pill ${
              this.storeCategory === cat.id ? 'active' : ''
            }" data-store-cat="${cat.id}">
              ${cat.label}
            </button>
          `
          ).join('')}
        </div>

        <div class="store-items-scroll" id="store-items-scroll">
          ${items
            .map((item) => {
              const ownedCount = profile.ownedCounts[item.id] || 0;
              const isEquipped = profile.equipped[item.slot] === item.id;
              const isPreviewing = profile.tryingItemId === item.id;
              const reqLevel = item.requiredLevel || 1;
              const levelLocked = profile.level < reqLevel;
              const showOwnedCount = item.stackable || item.category === 'cay_phat';

              const hasLotusMotif =
                item.id === 'ao_hoa_sen' ||
                item.id === 'ao_vu_lan_hong' ||
                item.id === 'ao_ba_ba_trang_sen';
              const hasCloudTrim = item.id === 'ao_may_bac' || item.id === 'ao_gam_le_hoi';
              const isBaBa = item.robeStyle?.startsWith('ba_ba');
              const isAoDai = item.robeStyle === 'dai_lam_le';
              const isVuLan = item.id === 'ao_vu_lan_hong';
              const isLam = item.id === 'ao_lam_truyen_thong' || item.id === 'ao_dai_lam_le_phat';
              const pantsColor = item.secondarySwatchHex || item.swatchHex;
              const trimColor = hasCloudTrim ? '#F5FAFF' : '#D99E3A';
              const thumbHtml = item.swatchHex
                ? `<div class="store-swatch-badge" style="background:linear-gradient(155deg,rgba(255,250,238,0.94),rgba(232,216,184,0.88));padding:4px;">
                    <svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true">
                      <path d="M22 44 L21 57 L30 57 L32 47 L34 57 L43 57 L42 44 Z" fill="${pantsColor}" stroke="#4A3222" stroke-width="1.6" stroke-linejoin="round"/>
                      <path d="M21 12 L10 22 L15 29 L21 24 L20 ${isAoDai ? '52' : isBaBa ? '42' : '48'} L44 ${isAoDai ? '52' : isBaBa ? '42' : '48'} L43 24 L49 29 L54 22 L43 12 L37 15 Q32 18 27 15 Z" fill="${item.swatchHex}" stroke="#4A3222" stroke-width="1.9" stroke-linejoin="round"/>
                      ${
                        isBaBa
                          ? `<path d="M32 18 L32 42" fill="none" stroke="${trimColor}" stroke-width="1.6"/>`
                          : `<path d="M27 15 L32 23 L32 48" fill="none" stroke="${trimColor}" stroke-width="1.8"/>`
                      }
                      <circle cx="33.8" cy="24" r="1.15" fill="${trimColor}"/>
                      <circle cx="33.8" cy="29" r="1.15" fill="${trimColor}"/>
                      <circle cx="33.8" cy="34" r="1.15" fill="${trimColor}"/>
                      ${
                        isVuLan
                          ? '<circle cx="39" cy="25" r="2.8" fill="#E6396A" stroke="#FFF4F7" stroke-width="0.9"/>'
                          : hasLotusMotif
                          ? '<path d="M37 40 Q40 34 43 40 Q40 42.5 37 40 Z" fill="#FFF3F8" stroke="#B83B68" stroke-width="0.9"/>'
                          : hasCloudTrim
                          ? '<path d="M23 40 Q26 37 29 40" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>'
                          : isLam
                          ? '<circle cx="39.5" cy="25" r="2.2" fill="none" stroke="#F4D378" stroke-width="1.1"/>'
                          : ''
                      }
                    </svg>
                  </div>`
                : item.thumbIcon
                ? `<div class="store-swatch-badge" style="background:rgba(255,246,229,0.12);border-color:rgba(246,205,114,0.45);font-size:28px;">${item.thumbIcon}</div>`
                : `<img src="${item.image}" alt="${item.name}" />`;

              const priceIcon = item.currency === 'gem' ? '💎' : '🪷';
              let priceLabel = `${priceIcon} Thỉnh ${item.price}`;
              let priceClass = item.currency === 'lotus' && levelLocked ? 'lotus-locked' : '';
              if (ownedCount > 0 && !item.stackable) {
                priceLabel = isEquipped ? '✓ Đang mặc' : 'Mặc ngay';
                if (isEquipped) priceClass = 'owned-equipped';
              }

              return `
                <article class="store-item-card ${isPreviewing ? 'previewing' : ''}" data-store-item-id="${item.id}">
                  <div class="store-item-thumb">${thumbHtml}</div>
                  <div class="store-item-info">
                    <div class="store-item-title-row">
                      <span class="store-item-name">${item.name}</span>
                      ${showOwnedCount ? `<span class="store-owned-count">(có ${ownedCount})</span>` : ''}
                      ${item.rare ? `<span class="store-rare-badge">Hiếm</span>` : ''}
                    </div>
                    <div class="store-item-desc">${item.description}</div>
                    ${
                      item.elderBenefit
                        ? `<div class="store-elder-benefit">✨ ${item.elderBenefit}</div>`
                        : ''
                    }
                    ${
                      levelLocked
                        ? `<div class="store-level-lock">🔒 Cần cấp ${reqLevel} (lạy Phật &amp; ghé chùa để lên cấp)</div>`
                        : ''
                    }
                  </div>
                  <div class="store-item-actions">
                    ${
                      item.tryable
                        ? `<button type="button" class="store-try-btn ${isPreviewing ? 'active' : ''}" data-try-id="${item.id}">
                            ${isPreviewing ? '✓ Đang mặc thử' : '✨ Mặc thử 3D'}
                          </button>`
                        : ''
                    }
                    <button type="button" class="store-price-btn ${priceClass}" data-buy-id="${item.id}">
                      ${priceLabel}
                    </button>
                  </div>
                </article>
              `;
            })
            .join('')}
        </div>
      `;

      this.openModal('Cửa hàng', html, { variant: 'store' });

      this.mountProfileCharacterStage('store-tryon-3d-canvas', {
        charKey: this.characterModelKey,
        pose: this.storeTryOnPose || 'Dung'
      });

      const scrollEl = document.getElementById('store-items-scroll');
      if (scrollEl && preserveScrollTop > 0) {
        scrollEl.scrollTop = preserveScrollTop;
      }

      document.getElementById('btn-open-physical-shop')?.addEventListener('click', () => {
        this.closeModal();
        this.switchScreen('shop');
      });

      document.querySelectorAll('[data-store-char]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const ck = btn.getAttribute('data-store-char') || 'nu';
          this.characterModelKey = ck;
          this.world3d?.switchCharacter(ck);
          this.syncStoreVisualsTo3D();
          this.saveState();
          this.updateEquippedTags();
          renderStoreBody(document.getElementById('store-items-scroll')?.scrollTop || 0);
        });
      });

      document.querySelectorAll('[data-store-pose]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.storeTryOnPose = btn.getAttribute('data-store-pose') || 'Dung';
          renderStoreBody(document.getElementById('store-items-scroll')?.scrollTop || 0);
        });
      });

      document.getElementById('btn-store-clear-try')?.addEventListener('click', () => {
        this.storeProfile.tryingItemId = null;
        this.syncStoreVisualsTo3D();
        renderStoreBody(document.getElementById('store-items-scroll')?.scrollTop || 0);
      });

      document.querySelectorAll('[data-store-cat]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const catId = btn.getAttribute('data-store-cat');
          if (catId) {
            this.storeCategory = catId;
            renderStoreBody(0);
          }
        });
      });

      document.querySelectorAll('[data-try-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const itemId = btn.getAttribute('data-try-id');
          if (!itemId) return;
          const prevScroll = document.getElementById('store-items-scroll')?.scrollTop || 0;
          const res = tryOnStoreItem(this.storeProfile, itemId);
          this.storeProfile = res.state;
          this.syncStoreVisualsTo3D();
          this.playMokugyoTap();
          if (res.previewing && res.item) {
            this.showToast(
              `✨ Đang mặc thử 3D: ${res.item.name}`,
              'Cô bác xoay khung 3D ngay phía trên hoặc đóng Cửa hàng để ngắm trên sân chùa nhé!',
              3400
            );
          }
          renderStoreBody(prevScroll);
        });
      });

      document.querySelectorAll('[data-buy-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const itemId = btn.getAttribute('data-buy-id');
          if (!itemId) return;
          const prevScroll = document.getElementById('store-items-scroll')?.scrollTop || 0;
          const res = purchaseStoreItem(this.storeProfile, itemId);
          this.storeProfile = res.state;
          if (!res.ok) {
            this.showToast('Chưa đủ điểm Sen hoặc Ngọc', `${res.message} Cô bác hãy vào Hành trình -> Nhiệm vụ để nhận thêm nhé!`, 4200);
            return;
          }
          if (res.item?.slot === 'robe') {
            this.spiritual.equippedItems.outfit = res.equippedNow ? null : 'ao_trang_phat_tu';
          }
          if (itemId === 'non_la_theu_sen_store') {
            this.spiritual.equippedItems.hat = res.equippedNow ? 'non_la_theu_sen' : null;
          }
          this.saveState();
          this.syncStoreVisualsTo3D();
          this.updateEquippedTags();
          this.playBellTone(324, 1.8);
          this.showToast(res.equippedNow ? '🪷 Đã mặc lên nhân vật 3D' : '📦 Đã cất vào tủ đồ', res.message, 3600);
          renderStoreBody(prevScroll);
        });
      });
    };

    renderStoreBody(0);
  },

  openLocalEateryModal(eateryId, title = 'Quán ăn gia đình') {
    const menus = {
      hut_tieu_co_ba: {
        intro: 'Bữa sáng trong căn nhà gia đình, với hiên nhà và bàn ăn gỗ.',
        dishes: ['Hủ tiếu Mỹ Tho', 'Hủ tiếu khô', 'Nước trà đá']
      },
      banh_beo_di_sau: {
        intro: 'Góc bếp nhỏ miền Tây, phục vụ món bánh và chè nhà làm.',
        dishes: ['Bánh bèo', 'Bánh da lợn', 'Chè đậu xanh']
      }
    };
    const menu = menus[eateryId] || { intro: 'Một quán ăn nhỏ trong khu dân cư.', dishes: ['Món ăn trong ngày'] };
    const html = `
      <div class="market-stall-banner">
        <div>
          <div style="font-size:16px;font-weight:800;color:#1C5A34;">${title}</div>
          <div style="font-size:13px;color:#4A3222;margin-top:5px;">${menu.intro}</div>
        </div>
      </div>
      <div style="display:grid;gap:10px;padding:12px 2px;">
        ${menu.dishes.map((dish) => `<div style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;background:#F5EEDC;color:#4A3222;"><span style="font-size:20px;">🍜</span><strong>${dish}</strong></div>`).join('')}
      </div>
      <p style="font-size:12px;color:#766A59;padding:4px 2px;">Bạn có thể bước vào hiên nhà, quan sát không gian bếp và bàn ăn trong mô hình 3D.</p>
    `;
    this.openModal(title, html);
  },

  /* ========================================================================
     NHÀ TẠP HÓA CỔNG CHÙA MODAL (Brick-and-Mortar Grocery House UI)
     ======================================================================== */
  openMarketplaceStallModal(
    initialCategory = null,
    stallTitle = 'Nhà Lưu Niệm · Cửa Hàng Văn Hóa Phẩm Vĩnh Tràng'
  ) {
    const validCatIds = new Set(MARKETPLACE_STALL_CATEGORIES.map((c) => c.id));
    if (initialCategory && validCatIds.has(initialCategory)) {
      this.marketStallTab = initialCategory;
    } else if (initialCategory) {
      this.marketStallTab = 'all';
    } else if (!this.marketStallTab || !validCatIds.has(this.marketStallTab)) {
      this.marketStallTab = 'all';
    }
    let showAffiliateEditor = false;
    const CLICK_STATS_KEY = 'chua_online_shopee_clicks_v1';
    const loadClickStats = () => {
      try {
        const raw = localStorage.getItem(CLICK_STATS_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === 'object' ? parsed : {};
      } catch {
        return {};
      }
    };
    const saveClickStats = (nextStats) => {
      try {
        localStorage.setItem(CLICK_STATS_KEY, JSON.stringify(nextStats));
      } catch {}
    };
    let shopeeClicks = loadClickStats();

    const renderMarketBody = () => {
      const items = filterMarketplaceItems(this.marketStallTab);
      const cartSummary = calculateCartSummary(this.cart);
      const configuredCount = Object.values(this.shopeeAffiliateOverrides || {}).filter((u) => {
        const check = validateShopeeAffiliateUrl(u);
        return check.valid && Boolean(check.normalized);
      }).length;
      const totalClicks = getTotalShopeeClicks(shopeeClicks);
      const bestsellerItems = Object.keys(SHOPEE_BESTSELLER_META)
        .map((id) => MARKETPLACE_STALL_CATALOG.find((x) => x.id === id))
        .filter(Boolean);
      const editableItems = [
        ...SHOPEE_CURATED_COMBOS.map((c) => ({ id: c.id, icon: c.icon, name: `[Combo] ${c.name}` })),
        ...MARKETPLACE_STALL_CATALOG
      ];

      const html = `
        <div class="market-stall-banner">
          <div>
            <div style="font-size:15.5px;font-weight:800;color:#5C381F;">Nhà Lưu Niệm · Đặc Sản Chay &amp; Văn Hóa Phẩm Chùa Vĩnh Tràng</div>
            <div style="font-size:13px;color:#4A3222;margin-top:3px;">
              Đầy đủ ${MARKETPLACE_STALL_CATALOG.length} món đặc sản chay Mỹ Tho, nhang trầm sạch, tràng hạt &amp; pháp phục. Chọn thỉnh lễ ngay trong chùa hoặc đặt giao tận nhà chính hãng qua Shopee.
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <span class="market-wallet-chip">🪷 <strong id="market-lotus-count">${this.storeProfile.lotusPoints}</strong> điểm sen</span>
            <button type="button" id="btn-market-open-cart" class="market-cart-pill">
              🛒 Giỏ hàng (<span id="market-cart-count">${cartSummary.totalCount}</span>)
            </button>
            <button type="button" id="btn-market-affiliate-cfg" class="market-secondary-pill" style="background:#FFF1EB;border-color:#EE4D2D;color:#C43416;">
              🔗 Gắn link Shopee (${configuredCount} link${totalClicks > 0 ? ` · ${totalClicks} lượt bấm` : ''})
            </button>
            <button type="button" id="btn-market-to-store" class="market-secondary-pill">
              Tủ đồ 3D (9 mục)
            </button>
          </div>
        </div>

        ${
          showAffiliateEditor
            ? `
          <div class="shopee-affiliate-editor-panel">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
              <div>
                <div style="font-size:14.5px;font-weight:800;color:#B83214;">🔗 Quản lý Link Shopee Affiliate (${editableItems.length} sản phẩm &amp; combo · ${totalClicks} lượt bấm)</div>
                <div style="font-size:12.5px;color:#5C381F;margin-top:2px;">
                  Dán link rút gọn Shopee Affiliate (<code>https://s.shopee.vn/...</code> hoặc <code>https://shope.ee/...</code>) vào ô bên cạnh từng món hoặc combo. Món nào chưa gắn link sẽ tự mở đúng từ khóa tìm kiếm trên Shopee.vn.
                </div>
              </div>
              <button type="button" id="btn-save-shopee-affiliates" class="market-btn-shopee" style="width:auto;padding:8px 16px;margin-top:0;">
                ✓ Lưu tất cả link Shopee
              </button>
            </div>
            <div class="shopee-affiliate-rows">
              ${editableItems
                .map((it) => {
                  const curUrl = this.shopeeAffiliateOverrides?.[it.id] || '';
                  const itemClicks = Number(shopeeClicks[it.id]) || 0;
                  return `
                    <label class="shopee-affiliate-row">
                      <span class="shopee-affiliate-item-name">
                        ${it.icon} ${it.name}
                        ${itemClicks > 0 ? `<span class="shopee-click-pill">${itemClicks} lượt bấm</span>` : ''}
                      </span>
                      <input
                        type="url"
                        class="shopee-affiliate-input"
                        data-aff-item-id="${it.id}"
                        value="${String(curUrl).replace(/"/g, '&quot;')}"
                        placeholder="https://s.shopee.vn/... (để trống = tìm trên Shopee)"
                      />
                    </label>
                  `;
                })
                .join('')}
            </div>
          </div>
        `
            : ''
        }

        <div class="market-tabs-row" role="tablist">
          ${MARKETPLACE_STALL_CATEGORIES.map(
            (cat) => `
            <button type="button" class="market-tab-pill ${
              this.marketStallTab === cat.id ? 'active' : ''
            }" data-market-tab="${cat.id}">
              <span>${cat.icon}</span>
              <span>${cat.label}</span>
            </button>
          `
          ).join('')}
        </div>

        ${
          this.marketStallTab === 'all'
            ? `
          <section class="market-spotlight-section" aria-label="Sản phẩm bán chạy đặt giao Shopee">
            <div class="market-section-heading">
              <span>🔥 Được Phật tử &amp; Du khách đặt mua nhiều nhất</span>
              <span class="market-section-sub">Giao nhanh toàn quốc · Đổi trả chuẩn Shopee</span>
            </div>
            <div class="market-bestseller-grid">
              ${bestsellerItems
                .map((item) => {
                  const meta = SHOPEE_BESTSELLER_META[item.id] || {};
                  const shopee = resolveShopeeAffiliateUrl(item, this.shopeeAffiliateOverrides);
                  return `
                    <article class="market-bestseller-card" data-bestseller-id="${item.id}">
                      <div class="market-bestseller-top">
                        <div class="market-item-icon market-item-icon-sm">
                          ${
                            item.image
                              ? `<img src="${item.image}" alt="${item.name}" class="market-item-thumb-img" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline';" /><span style="display:none;">${item.icon}</span>`
                              : `<span>${item.icon}</span>`
                          }
                        </div>
                        <div style="flex:1;min-width:0;">
                          <div class="market-social-row">
                            <span class="market-badge-hot">${meta.badge || 'Bán chạy'}</span>
                            <span class="market-social-proof">★ ${meta.rating || '4.9'} · ${meta.soldLabel || 'Đã bán 1k+'}</span>
                          </div>
                          <div class="market-bestseller-title">${item.name}</div>
                          <div class="market-bestseller-price">${item.priceVnd.toLocaleString('vi-VN')}đ</div>
                        </div>
                      </div>
                      <a class="market-btn-shopee market-btn-shopee-sm" href="${shopee.url}" target="_blank" rel="noopener noreferrer" data-shopee-affiliate="${item.id}">
                        🛒 ${shopee.label}
                      </a>
                    </article>
                  `;
                })
                .join('')}
            </div>

            <div class="market-section-heading" style="margin-top:14px;">
              <span>🎁 Combo Quà Biếu Miền Tây &amp; Đi Chùa Tiết Kiệm</span>
              <span class="market-section-sub">Gom đủ bộ tiện biếu gia đình</span>
            </div>
            <div class="market-combo-grid">
              ${SHOPEE_CURATED_COMBOS.map((combo) => {
                const shopee = resolveShopeeAffiliateUrl(combo, this.shopeeAffiliateOverrides);
                return `
                  <article class="market-combo-card" data-combo-id="${combo.id}">
                    <div class="market-combo-head">
                      <span class="market-combo-icon">${combo.icon}</span>
                      <span class="market-badge-combo">${combo.badge}</span>
                    </div>
                    <div class="market-combo-title">${combo.name}</div>
                    <div class="market-combo-items">${combo.itemsSummary}</div>
                    <div class="market-combo-prices">
                      <strong class="market-price-vnd">${combo.priceVnd.toLocaleString('vi-VN')}đ</strong>
                      <span class="market-price-strike">${combo.originalPriceVnd.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <a class="market-btn-shopee market-btn-shopee-sm" href="${shopee.url}" target="_blank" rel="noopener noreferrer" data-shopee-affiliate="${combo.id}">
                      🛒 ${shopee.label}
                    </a>
                  </article>
                `;
              }).join('')}
            </div>
          </section>
          <div class="market-section-heading" style="margin-top:14px;">
            <span>🏪 Toàn bộ gian hàng Nhà Lưu Niệm (${items.length} món)</span>
          </div>
        `
            : ''
        }

        <div class="market-items-grid">
          ${items
            .map((item) => {
              const shopee = resolveShopeeAffiliateUrl(item, this.shopeeAffiliateOverrides);
              const meta = SHOPEE_BESTSELLER_META[item.id] || null;
              return `
            <article class="market-item-card" data-market-item-id="${item.id}">
              <div class="market-item-top">
                <div class="market-item-icon">
                  ${
                    item.image
                      ? `<img src="${item.image}" alt="${item.name}" class="market-item-thumb-img" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline';" /><span class="market-item-fallback-emoji" style="display:none;">${item.icon}</span>`
                      : `<span>${item.icon}</span>`
                  }
                </div>
                <div style="flex:1;min-width:0;">
                  ${
                    meta
                      ? `<div class="market-social-row" style="margin-bottom:3px;"><span class="market-badge-hot">${meta.badge}</span><span class="market-social-proof">★ ${meta.rating} · ${meta.soldLabel}</span></div>`
                      : ''
                  }
                  <div class="market-item-title">${item.name}</div>
                  <div class="market-item-prices">
                    <span class="market-price-vnd">${item.priceVnd.toLocaleString('vi-VN')}đ</span>
                    <span class="market-price-lotus">🪷 ${item.lotusCost}</span>
                  </div>
                </div>
              </div>
              <p class="market-item-desc">${item.desc}</p>
              <div class="market-item-actions">
                <button type="button" class="market-btn-use" data-market-use="${item.id}">
                  ${
                    item.actionType === 'ritual_incense' || item.actionType === 'ritual_lotus'
                      ? 'Thỉnh dùng lễ ngay'
                      : 'Thỉnh tại quầy'
                  }
                </button>
                <button type="button" class="market-btn-cart" data-market-cart="${item.id}">
                  + Giỏ hàng
                </button>
              </div>
              <a class="market-btn-shopee" href="${shopee.url}" target="_blank" rel="noopener noreferrer" data-shopee-affiliate="${item.id}">
                🛒 ${shopee.label}
              </a>
            </article>
          `;
            })
            .join('')}
        </div>
      `;

      this.openModal(stallTitle || 'Nhà Lưu Niệm · Cửa Hàng Văn Hóa Phẩm Vĩnh Tràng', html);

      document.querySelectorAll('[data-market-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const tab = btn.getAttribute('data-market-tab');
          if (tab) {
            this.marketStallTab = tab;
            renderMarketBody();
          }
        });
      });

      document.getElementById('btn-market-open-cart')?.addEventListener('click', () => {
        this.openCartModal();
      });

      document.getElementById('btn-market-to-store')?.addEventListener('click', () => {
        this.openNineTabStoreModal();
      });

      document.getElementById('btn-market-affiliate-cfg')?.addEventListener('click', () => {
        showAffiliateEditor = !showAffiliateEditor;
        renderMarketBody();
      });

      document.querySelectorAll('[data-shopee-affiliate]').forEach((link) => {
        link.addEventListener('click', () => {
          const id = link.getAttribute('data-shopee-affiliate');
          if (!id) return;
          shopeeClicks = recordShopeeAffiliateClick(shopeeClicks, id);
          saveClickStats(shopeeClicks);
          const cfgBtn = document.getElementById('btn-market-affiliate-cfg');
          if (cfgBtn) {
            const newTotal = getTotalShopeeClicks(shopeeClicks);
            cfgBtn.textContent = `🔗 Gắn link Shopee (${configuredCount} link · ${newTotal} lượt bấm)`;
          }
        });
      });

      document.getElementById('btn-save-shopee-affiliates')?.addEventListener('click', () => {
        const updates = {};
        let invalidCount = 0;
        let savedCount = 0;
        document.querySelectorAll('.shopee-affiliate-input').forEach((inp) => {
          const id = inp.getAttribute('data-aff-item-id');
          if (!id) return;
          const val = String(inp.value || '').trim();
          if (!val) {
            updates[id] = '';
            return;
          }
          const check = validateShopeeAffiliateUrl(val);
          if (check.valid && check.normalized) {
            updates[id] = check.normalized;
            savedCount += 1;
          } else {
            invalidCount += 1;
          }
        });
        const merged = mergeShopeeAffiliateOverrides(this.shopeeAffiliateOverrides || {}, updates);
        this.saveShopeeAffiliateOverrides(merged);
        showAffiliateEditor = false;
        this.playBellTone(324, 1.4);
        this.showToast(
          '🔗 Đã lưu cấu hình Shopee Affiliate',
          invalidCount > 0
            ? `Đã lưu ${savedCount} link hợp lệ (${invalidCount} link không thuộc tên miền Shopee.vn/s.shopee.vn nên được bỏ qua).`
            : `Đã lưu ${savedCount} link Shopee Affiliate. Các nút mua hàng trên gian hàng đã tự động cập nhật!`,
          4200,
          false
        );
        renderMarketBody();
      });

      document.querySelectorAll('[data-market-use]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-market-use');
          if (!id) return;
          const res = purchaseMarketplaceItem(
            this.storeProfile,
            this.spiritual,
            this.cart,
            id,
            'use_now'
          );
          if (!res.ok) {
            this.showToast('Chưa đủ điểm sen', res.message, 3600);
            return;
          }
          this.storeProfile = res.storeProfile;
          this.spiritual = res.spiritual;
          this.cart = res.cart;
          if (res.item?.offeringType === 'incense' || res.item?.actionType === 'ritual_incense') {
            this.world3d?.setIncenseBoost(true);
          } else if (res.item?.offeringType === 'lotus' || res.item?.actionType === 'ritual_lotus') {
            this.world3d?.placeLotusOfferingIn3D();
          }
          this.saveState();
          this.updateActionBadges();
          this.playBellTone(324, 1.8);
          this.showToast('🪷 Đã thỉnh lễ phẩm tại sạp', res.message, 3800);
          renderMarketBody();
        });
      });

      document.querySelectorAll('[data-market-cart]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-market-cart');
          if (!id) return;
          const res = purchaseMarketplaceItem(
            this.storeProfile,
            this.spiritual,
            this.cart,
            id,
            'cart'
          );
          if (!res.ok) return;
          this.cart = res.cart;
          this.saveState();
          this.updateActionBadges();
          this.playMokugyoTap();
          this.showToast('🛍️ Đã thêm vào giỏ quà lưu niệm', res.message, 3200);
          renderMarketBody();
        });
      });
    };

    renderMarketBody();
  }
};
