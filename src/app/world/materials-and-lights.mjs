/**
 * Texture canvas, vật liệu (MAT), ánh sáng và texture bầu trời.
 *
 * Mixin của VinhTrang3DWorld: 5 method (initTexturesAndMaterials … _buildSkyTextureForPreset).
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, shiftOklch, VINH_TRANG_OKLCH_PALETTE, makeCanvasTex } from './shared.mjs';

export const materialsAndLightsMethods = {
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

    // 1d-2. Bright Sunlit Brushed Concrete Road with Expansion Joints (Lối vào Cổng Phụ Tịnh Độ Huyền Môn)
    this.concreteRoadTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#D5D0C6';
        g.fillRect(0, 0, w, h);
        for (let i = 0; i < 950; i++) {
          const v = 198 + ((i * 23) % 28);
          g.fillStyle = `rgb(${v},${v - 2},${v - 7})`;
          g.fillRect((i * 73) % w, (i * 127) % h, 2 + (i % 3), 2);
        }
        // Subtle warm wheel tracks + clean expansion joints
        g.fillStyle = 'rgba(182, 174, 158, 0.22)';
        g.fillRect(w * 0.22, 0, w * 0.16, h);
        g.fillRect(w * 0.62, 0, w * 0.16, h);
        g.strokeStyle = 'rgba(128, 122, 110, 0.36)';
        g.lineWidth = 2.2;
        for (let y = 0; y <= h; y += 128) {
          g.beginPath();
          g.moveTo(0, y);
          g.lineTo(w, y);
          g.stroke();
        }
        g.beginPath();
        g.moveTo(w * 0.5, 0);
        g.lineTo(w * 0.5, h);
        g.stroke();
      },
      512,
      512,
      2,
      12
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
  },

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
  },

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
  },

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
  },

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
};
