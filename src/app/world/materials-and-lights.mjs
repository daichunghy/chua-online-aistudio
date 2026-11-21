/**
 * Texture canvas, vật liệu (MAT), ánh sáng và texture bầu trời.
 *
 * Mixin của VinhTrang3DWorld: 5 method (initTexturesAndMaterials … _buildSkyTextureForPreset).
 * Được gắn vào class trong vinh-trang-3d-world.mjs qua applyMixins().
 */
import { THREE, shiftOklch, VINH_TRANG_OKLCH_PALETTE, makeCanvasTex } from './shared.mjs';

export const materialsAndLightsMethods = {
  initTexturesAndMaterials() {
    // Track exterior ground materials that glisten & darken during Mekong rain
    this.wettableMaterials = [];
    const maxAniso = Math.min(16, this.renderer?.capabilities?.getMaxAnisotropy?.() || 8);

    // 1. Weathered Courtyard Stone Slabs (High-detail albedo + paired bump & roughness maps)
    this.pavingTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#B8AE98';
        g.fillRect(0, 0, w, h);
        const step = 64;
        for (let y = 0; y < h; y += step) {
          for (let x = 0; x < w; x += step) {
            const seed = ((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1 + 1) % 1;
            const v = seed * 24 - 12;
            const warm = ((Math.sin(x * 3.7 + y * 9.1) * 19231.4) % 1 + 1) % 1;
            g.fillStyle = `rgb(${Math.round(199 + v + warm * 7)}, ${Math.round(188 + v)}, ${Math.round(166 + v - warm * 5)})`;
            g.fillRect(x + 2, y + 2, step - 4, step - 4);
            // Subtle chamfer highlight on sunlit top-left slab edges
            g.fillStyle = 'rgba(255,250,238,0.16)';
            g.fillRect(x + 2, y + 2, step - 5, 3);
            g.fillRect(x + 2, y + 2, 3, step - 5);
            // Shaded bottom-right edge for crisp stone relief
            g.fillStyle = 'rgba(72,62,48,0.16)';
            g.fillRect(x + 3, y + step - 4, step - 5, 2);
            g.fillRect(x + step - 4, y + 3, 2, step - 5);
            // Natural mineral patch inside slab
            g.fillStyle = seed > 0.52 ? 'rgba(255,248,232,0.12)' : 'rgba(86,74,56,0.10)';
            g.fillRect(x + 7, y + 9, step - 16, step - 18);
          }
        }
        // Deep recessed mortar joints
        g.strokeStyle = 'rgba(78, 70, 56, 0.58)';
        g.lineWidth = 2.8;
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
        // Fine granite pores + Mekong moss specks along stone joints
        for (let i = 0; i < 680; i++) {
          const sx = (i * 73 + ((i * 19) % 23)) % w;
          const sy = (i * 137 + ((i * 11) % 17)) % h;
          const nearJoint = sx % step < 5 || sy % step < 5;
          g.fillStyle =
            nearJoint && i % 2 === 0
              ? 'rgba(76,112,48,0.28)'
              : i % 4 === 0
              ? 'rgba(248,242,228,0.14)'
              : 'rgba(92,76,56,0.15)';
          g.beginPath();
          g.arc(sx, sy, nearJoint ? 2.1 : 1.1 + (i % 3) * 0.45, 0, Math.PI * 2);
          g.fill();
        }
      },
      512,
      512,
      20,
      20
    );
    this.pavingTex.anisotropy = maxAniso;

    // Paired linear bump map for courtyard paving (recessed joints, chiseled micro-grain)
    this.pavingBumpTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#C8C8C8';
        g.fillRect(0, 0, w, h);
        const step = 64;
        for (let y = 0; y < h; y += step) {
          for (let x = 0; x < w; x += step) {
            const seed = ((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1 + 1) % 1;
            const v = Math.round(192 + seed * 36);
            g.fillStyle = `rgb(${v},${v},${v})`;
            g.fillRect(x + 3, y + 3, step - 6, step - 6);
          }
        }
        // Deep dark crevices for mortar seams
        g.strokeStyle = '#383838';
        g.lineWidth = 4;
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
        // Stone grain pits
        for (let i = 0; i < 900; i++) {
          const v = i % 2 === 0 ? 155 : 230;
          g.fillStyle = `rgba(${v},${v},${v},0.35)`;
          g.fillRect((i * 83) % w, (i * 149) % h, 2, 2);
        }
      },
      512,
      512,
      20,
      20,
      false
    );
    this.pavingBumpTex.anisotropy = maxAniso;

    // Paired linear roughness map (worn polished stone centers vs rougher mortar joints)
    this.pavingRoughTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#DFDFDF';
        g.fillRect(0, 0, w, h);
        const step = 64;
        for (let y = 0; y < h; y += step) {
          for (let x = 0; x < w; x += step) {
            const seed = ((Math.sin(x * 17.3 + y * 51.7) * 43758.5453) % 1 + 1) % 1;
            const v = Math.round(186 + seed * 36);
            g.fillStyle = `rgb(${v},${v},${v})`;
            g.fillRect(x + 4, y + 4, step - 8, step - 8);
          }
        }
        g.strokeStyle = '#F6F6F6';
        g.lineWidth = 4;
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
      20,
      20,
      false
    );
    this.pavingRoughTex.anisotropy = maxAniso;

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

    // 2. Yin-Yang Terracotta Roof Tiles (512px OKLCH clay tiles + paired deep cylindrical bump map)
    const tileLight = shiftOklch(VINH_TRANG_OKLCH_PALETTE.terracottaTile, 0.12, 1.08, 4);
    const tileMid = shiftOklch(VINH_TRANG_OKLCH_PALETTE.terracottaTile, 0.04, 1.02, 1);
    const tileGroove = shiftOklch(VINH_TRANG_OKLCH_PALETTE.terracottaTile, -0.10, 0.92, -4);
    this.roofTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = tileMid;
        g.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 32) {
          g.fillStyle = y % 64 === 0 ? tileLight : tileMid;
          g.fillRect(0, y, w, 26);
          g.fillStyle = tileGroove;
          g.fillRect(0, y + 26, w, 6);
        }
        for (let x = 0; x < w; x += 32) {
          const cylGrad = g.createLinearGradient(x, 0, x + 32, 0);
          cylGrad.addColorStop(0.0, 'rgba(54,20,12,0.34)');
          cylGrad.addColorStop(0.28, 'rgba(255,224,196,0.20)');
          cylGrad.addColorStop(0.62, 'rgba(255,224,196,0.04)');
          cylGrad.addColorStop(1.0, 'rgba(48,18,10,0.38)');
          g.fillStyle = cylGrad;
          g.fillRect(x, 0, 32, h);
        }
        // Subtle tropical moss patina on weathered clay roofs
        for (let i = 0; i < 36; i++) {
          g.fillStyle = i % 3 === 0 ? 'rgba(72, 102, 52, 0.16)' : 'rgba(56, 36, 22, 0.10)';
          g.beginPath();
          g.arc((i * 59) % w, (i * 47) % h, 8 + (i % 9), 0, Math.PI * 2);
          g.fill();
        }
      },
      512,
      512,
      10,
      4
    );
    this.roofTex.anisotropy = maxAniso;

    this.roofBumpTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#808080';
        g.fillRect(0, 0, w, h);
        for (let x = 0; x < w; x += 32) {
          const ridge = g.createLinearGradient(x, 0, x + 32, 0);
          ridge.addColorStop(0.0, '#303030');
          ridge.addColorStop(0.45, '#F0F0F0');
          ridge.addColorStop(1.0, '#282828');
          g.fillStyle = ridge;
          g.fillRect(x, 0, 32, h);
        }
        g.fillStyle = 'rgba(24,24,24,0.65)';
        for (let y = 26; y < h; y += 32) {
          g.fillRect(0, y, w, 6);
        }
      },
      512,
      512,
      10,
      4,
      false
    );
    this.roofBumpTex.anisotropy = maxAniso;

    // 3. Sunlit Aged Lime-Plaster Texture (512px warm ochre-cream stucco + paired plaster bump map)
    this.limeWallTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#F3DFB2';
        g.fillRect(0, 0, w, h);
        for (let i = 0; i < 340; i++) {
          const x = (i * 79 + ((i * 13) % 31)) % w;
          const y = (i * 43 + ((i * 29) % 37)) % h;
          g.fillStyle =
            i % 3 === 0
              ? 'rgba(255,250,236,0.20)'
              : i % 3 === 1
              ? 'rgba(182,146,78,0.12)'
              : 'rgba(156,124,68,0.08)';
          g.beginPath();
          g.arc(x, y, 14 + (i % 26), 0, Math.PI * 2);
          g.fill();
        }
        // Subtle aged stucco speckles & vertical Mekong rainwater weathering streaks
        for (let s = 0; s < 14; s++) {
          const sx = (s * 43 + 18) % w;
          const streak = g.createLinearGradient(sx, 0, sx, h * 0.45);
          streak.addColorStop(0, 'rgba(112, 96, 68, 0.14)');
          streak.addColorStop(1, 'rgba(112, 96, 68, 0)');
          g.fillStyle = streak;
          g.fillRect(sx, 0, 5 + (s % 6), h * 0.45);
        }
        const dampGrad = g.createLinearGradient(0, h * 0.72, 0, h);
        dampGrad.addColorStop(0, 'rgba(92, 86, 62, 0)');
        dampGrad.addColorStop(1, 'rgba(84, 78, 56, 0.22)');
        g.fillStyle = dampGrad;
        g.fillRect(0, h * 0.72, w, h * 0.28);
      },
      512,
      512,
      4,
      2
    );
    this.limeWallTex.anisotropy = maxAniso;

    this.limeBumpTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#808080';
        g.fillRect(0, 0, w, h);
        for (let i = 0; i < 1400; i++) {
          const v = 104 + ((i * 37) % 48);
          g.fillStyle = `rgba(${v},${v},${v},0.42)`;
          g.beginPath();
          g.arc((i * 67) % w, (i * 113) % h, 2 + (i % 5), 0, Math.PI * 2);
          g.fill();
        }
      },
      256,
      256,
      4,
      2,
      false
    );

    // 4. Weathered Granite / Marble Stone Albedo & Bump Maps (Natural mineral speckles & chiseling)
    this.stoneBumpTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#828282';
        g.fillRect(0, 0, w, h);
        for (let i = 0; i < 1800; i++) {
          const sx = (i * 47 + ((i * 13) % 19)) % w;
          const sy = (i * 83 + ((i * 7) % 23)) % h;
          const v = 96 + ((i * 29) % 64);
          g.fillStyle = `rgb(${v},${v},${v})`;
          g.fillRect(sx, sy, 2 + (i % 3), 2 + ((i + 1) % 2));
        }
        // Subtle hairline stone veins
        g.strokeStyle = 'rgba(60,60,60,0.22)';
        g.lineWidth = 1.2;
        for (let k = 0; k < 14; k++) {
          g.beginPath();
          let vx = (k * 37) % w;
          let vy = (k * 61) % h;
          g.moveTo(vx, vy);
          for (let s = 0; s < 5; s++) {
            vx += 18 + ((k * s * 11) % 24);
            vy += ((k + s) % 2 === 0 ? 1 : -1) * (8 + ((k * 7) % 14));
            g.lineTo(vx, vy);
          }
          g.stroke();
        }
      },
      256,
      256,
      4,
      4,
      false
    );
    this.stoneBumpTex.anisotropy = maxAniso;

    this.graniteLightTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#B8B0A2';
        g.fillRect(0, 0, w, h);
        // Natural mineral clouds
        for (let i = 0; i < 65; i++) {
          const x = (i * 71) % w;
          const y = (i * 103) % h;
          const r = 18 + (i % 30);
          g.fillStyle = i % 2 === 0 ? 'rgba(232,226,214,0.16)' : 'rgba(118,110,96,0.14)';
          g.beginPath();
          g.arc(x, y, r, 0, Math.PI * 2);
          g.fill();
        }
        // Fine granite quartz & biotite flecks
        for (let i = 0; i < 1600; i++) {
          const x = (i * 53 + ((i * 17) % 29)) % w;
          const y = (i * 97 + ((i * 11) % 19)) % h;
          const m = i % 5;
          g.fillStyle =
            m === 0 ? 'rgba(248,244,234,0.34)' :
            m === 1 ? 'rgba(72,68,62,0.26)' :
            m === 2 ? 'rgba(138,132,122,0.24)' :
            'rgba(205,198,184,0.22)';
          g.fillRect(x, y, 2, 2);
        }
      },
      256,
      256,
      4,
      4
    );
    this.graniteLightTex.anisotropy = maxAniso;

    this.graniteDarkTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#6D685E';
        g.fillRect(0, 0, w, h);
        for (let i = 0; i < 60; i++) {
          const x = (i * 89) % w;
          const y = (i * 59) % h;
          g.fillStyle = i % 2 === 0 ? 'rgba(148,142,130,0.18)' : 'rgba(54,50,44,0.2)';
          g.beginPath();
          g.arc(x, y, 16 + (i % 24), 0, Math.PI * 2);
          g.fill();
        }
        for (let i = 0; i < 1500; i++) {
          const x = (i * 61 + ((i * 13) % 23)) % w;
          const y = (i * 113 + ((i * 7) % 17)) % h;
          g.fillStyle = i % 3 === 0 ? 'rgba(196,192,182,0.24)' : 'rgba(38,35,32,0.28)';
          g.fillRect(x, y, 2, 2);
        }
      },
      256,
      256,
      4,
      4
    );
    this.graniteDarkTex.anisotropy = maxAniso;

    this.pedestalRedTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#7E392C';
        g.fillRect(0, 0, w, h);
        // Hand-troweled Southern temple ochre-crimson stucco with subtle ashlar joints
        for (let i = 0; i < 90; i++) {
          const x = (i * 67) % w;
          const y = (i * 109) % h;
          g.fillStyle = i % 2 === 0 ? 'rgba(162,84,62,0.18)' : 'rgba(66,24,18,0.18)';
          g.beginPath();
          g.arc(x, y, 16 + (i % 28), 0, Math.PI * 2);
          g.fill();
        }
        g.strokeStyle = 'rgba(46,16,12,0.28)';
        g.lineWidth = 2;
        for (let y = 0; y < h; y += 64) {
          g.beginPath();
          g.moveTo(0, y);
          g.lineTo(w, y);
          g.stroke();
        }
        for (let i = 0; i < 900; i++) {
          g.fillStyle = i % 3 === 0 ? 'rgba(218,162,126,0.12)' : 'rgba(44,16,12,0.16)';
          g.fillRect((i * 73) % w, (i * 131) % h, 2, 2);
        }
      },
      256,
      256,
      3,
      2
    );
    this.pedestalRedTex.anisotropy = maxAniso;

    // 5. Organic Multi-Octave Vietnamese Hardwood Grain Texture + Paired Linear Bump Map
    this.woodGrainTex = makeCanvasTex(
      (g, w, h) => {
        const baseGrad = g.createLinearGradient(0, 0, w, 0);
        baseGrad.addColorStop(0, '#5A3820');
        baseGrad.addColorStop(0.35, '#6B4427');
        baseGrad.addColorStop(0.7, '#4F301B');
        baseGrad.addColorStop(1, '#5D3A22');
        g.fillStyle = baseGrad;
        g.fillRect(0, 0, w, h);

        // Organic undulating cathedral wood rings & fibers
        for (let i = 0; i < 92; i++) {
          const baseX = (i / 92) * w;
          const isDark = i % 3 === 0;
          g.strokeStyle = isDark ? 'rgba(28,14,6,0.30)' : 'rgba(146,98,54,0.18)';
          g.lineWidth = isDark ? 1.5 + (i % 2) : 1.1;
          g.beginPath();
          for (let y = 0; y <= h; y += 8) {
            const wave =
              Math.sin((y / h) * Math.PI * 2 + i * 0.35) * 4.2 +
              Math.sin((y / h) * Math.PI * 6 + i * 0.9) * 1.4;
            const px = baseX + wave;
            if (y === 0) g.moveTo(px, y);
            else g.lineTo(px, y);
          }
          g.stroke();
        }
        // Subtle timber pores & warm lacquer sheen streaks
        for (let i = 0; i < 420; i++) {
          g.fillStyle = i % 4 === 0 ? 'rgba(24,11,5,0.22)' : 'rgba(176,124,72,0.09)';
          g.fillRect((i * 59) % w, (i * 97) % h, 1.5, 10 + (i % 16));
        }
      },
      256,
      256,
      2,
      2
    );
    this.woodGrainTex.anisotropy = maxAniso;

    this.woodBumpTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#808080';
        g.fillRect(0, 0, w, h);
        for (let i = 0; i < 92; i++) {
          const baseX = (i / 92) * w;
          const v = i % 3 === 0 ? 58 : 152;
          g.strokeStyle = `rgba(${v},${v},${v},0.48)`;
          g.lineWidth = 1.6;
          g.beginPath();
          for (let y = 0; y <= h; y += 8) {
            const wave =
              Math.sin((y / h) * Math.PI * 2 + i * 0.35) * 4.2 +
              Math.sin((y / h) * Math.PI * 6 + i * 0.9) * 1.4;
            const px = baseX + wave;
            if (y === 0) g.moveTo(px, y);
            else g.lineTo(px, y);
          }
          g.stroke();
        }
      },
      256,
      256,
      2,
      2,
      false
    );
    this.woodBumpTex.anisotropy = maxAniso;

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

    // 7. Terracotta Red "Gạch Tàu" Floor Tiles + Paired Bump Map
    this.gachTauTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#7E311E';
        g.fillRect(0, 0, w, h);
        const step = 64;
        for (let y = 0; y < h; y += step) {
          for (let x = 0; x < w; x += step) {
            const seed = ((Math.sin(x * 17.3 + y * 43.1) * 43758.54) % 1 + 1) % 1;
            const d = Math.round(seed * 22 - 11);
            g.fillStyle = `rgb(${152 + d}, ${61 + Math.round(d * 0.55)}, ${39 + Math.round(d * 0.4)})`;
            g.fillRect(x + 2, y + 2, step - 4, step - 4);
            // Soft kiln-fired patina & center foot-worn polish
            const rad = g.createRadialGradient(x + step * 0.5, y + step * 0.5, 4, x + step * 0.5, y + step * 0.5, step * 0.56);
            rad.addColorStop(0, 'rgba(255, 214, 174, 0.13)');
            rad.addColorStop(1, 'rgba(54, 20, 12, 0.14)');
            g.fillStyle = rad;
            g.fillRect(x + 2, y + 2, step - 4, step - 4);
            // Kiln grain speckles
            g.fillStyle = seed > 0.5 ? 'rgba(240,192,148,0.12)' : 'rgba(64,22,12,0.14)';
            g.fillRect(x + 8 + Math.round(seed * 18), y + 10, 14, 9);
          }
        }
        g.strokeStyle = 'rgba(42, 18, 12, 0.62)';
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
    this.gachTauTex.anisotropy = maxAniso;

    this.gachTauBumpTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#CCCCCC';
        g.fillRect(0, 0, w, h);
        const step = 64;
        g.strokeStyle = '#363636';
        g.lineWidth = 4;
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
        for (let i = 0; i < 650; i++) {
          const v = i % 2 === 0 ? 175 : 225;
          g.fillStyle = `rgba(${v},${v},${v},0.3)`;
          g.fillRect((i * 71) % w, (i * 113) % h, 3, 3);
        }
      },
      512,
      512,
      8,
      12,
      false
    );
    this.gachTauBumpTex.anisotropy = maxAniso;

    // 7b. Authentic Heritage Chùa Vĩnh Tràng "Gạch Bông Pháp Cổ" Encaustic Patterned Floor Tiles
    this.gachBongTex = makeCanvasTex(
      (g, w, h) => {
        g.fillStyle = '#D9CEB6';
        g.fillRect(0, 0, w, h);
        const step = 128;
        for (let ty = 0; ty < h; ty += step) {
          for (let tx = 0; tx < w; tx += step) {
            const cx = tx + step * 0.5;
            const cy = ty + step * 0.5;
            const alt = ((tx / step) + (ty / step)) % 2 === 0;
            // Warm ivory-ochre encaustic base
            g.fillStyle = alt ? '#DFD3BA' : '#D5C7AA';
            g.fillRect(tx + 2, ty + 2, step - 4, step - 4);
            // Outer sage/terracotta heritage frame
            g.strokeStyle = '#8F3F2B';
            g.lineWidth = 4;
            g.strokeRect(tx + 8, ty + 8, step - 16, step - 16);
            // Corner lotus quarter-rosettes (forms full medallions where 4 tiles meet!)
            g.fillStyle = '#3C6255';
            for (const [ox, oy] of [[tx + 2, ty + 2], [tx + step - 2, ty + 2], [tx + 2, ty + step - 2], [tx + step - 2, ty + step - 2]]) {
              g.beginPath();
              g.arc(ox, oy, 20, 0, Math.PI * 2);
              g.fill();
            }
            // Central 8-petal floral lotus star in ochre-gold & crimson
            g.fillStyle = '#B87A35';
            g.beginPath();
            g.moveTo(cx, cy - 34);
            g.lineTo(cx + 12, cy - 12);
            g.lineTo(cx + 34, cy);
            g.lineTo(cx + 12, cy + 12);
            g.lineTo(cx, cy + 34);
            g.lineTo(cx - 12, cy + 12);
            g.lineTo(cx - 34, cy);
            g.lineTo(cx - 12, cy - 12);
            g.closePath();
            g.fill();
            g.fillStyle = '#8B2E22';
            g.beginPath();
            g.arc(cx, cy, 13, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#E8D9B5';
            g.beginPath();
            g.arc(cx, cy, 6, 0, Math.PI * 2);
            g.fill();
            // Subtle aged tile wear
            g.strokeStyle = 'rgba(66,52,38,0.42)';
            g.lineWidth = 2.5;
            g.strokeRect(tx + 1, ty + 1, step - 2, step - 2);
          }
        }
        // Fine matte ceramic grain
        for (let i = 0; i < 900; i++) {
          g.fillStyle = i % 2 === 0 ? 'rgba(92,76,56,0.08)' : 'rgba(255,248,232,0.09)';
          g.fillRect((i * 89) % w, (i * 137) % h, 2, 2);
        }
      },
      512,
      512,
      10,
      10
    );
    this.gachBongTex.anisotropy = maxAniso;

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
        bumpMap: this.limeBumpTex,
        bumpScale: 0.024,
        roughness: 0.64
      }),
      goldLight: new THREE.MeshStandardMaterial({
        color: 0xF5D98C,
        map: this.limeWallTex,
        bumpMap: this.limeBumpTex,
        bumpScale: 0.018,
        roughness: 0.58
      }),
      goldAccent: new THREE.MeshStandardMaterial({
        color: 0xD8A436,
        metalness: 0.58,
        roughness: 0.28
      }),
      creamTrim: new THREE.MeshStandardMaterial({
        color: 0xF2ECE0,
        map: this.limeWallTex,
        bumpMap: this.limeBumpTex,
        bumpScale: 0.016,
        roughness: 0.68
      }),
      redColumn: new THREE.MeshStandardMaterial({
        color: 0x862820,
        bumpMap: this.woodBumpTex,
        bumpScale: 0.016,
        roughness: 0.36,
        metalness: 0.08
      }),
      darkWood: new THREE.MeshStandardMaterial({
        color: 0x5E3E26,
        map: this.woodGrainTex,
        bumpMap: this.woodBumpTex,
        bumpScale: 0.024,
        roughness: 0.58
      }),
      darkOpening: new THREE.MeshStandardMaterial({ color: 0x221712, roughness: 0.88 }),
      roofTile: new THREE.MeshStandardMaterial({
        map: this.roofTex,
        bumpMap: this.roofBumpTex,
        bumpScale: 0.036,
        roughness: 0.64
      }),
      statueWhite: new THREE.MeshStandardMaterial({
        color: 0xF3EEE4,
        map: this.graniteLightTex,
        bumpMap: this.stoneBumpTex,
        bumpScale: 0.018,
        roughness: 0.72,
        metalness: 0.02
      }),
      lotusBlue: new THREE.MeshStandardMaterial({ color: 0x4E86A8, bumpMap: this.stoneBumpTex, bumpScale: 0.014, roughness: 0.5 }),
      pedestalRed: new THREE.MeshStandardMaterial({
        color: 0x9B4B3A,
        map: this.pedestalRedTex,
        bumpMap: this.limeBumpTex,
        bumpScale: 0.022,
        roughness: 0.66
      }),
      stoneDark: new THREE.MeshStandardMaterial({
        color: 0x868075,
        map: this.graniteDarkTex,
        bumpMap: this.stoneBumpTex,
        bumpScale: 0.028,
        roughness: 0.82
      }),
      stoneLight: new THREE.MeshStandardMaterial({
        color: 0xC6BEB0,
        map: this.graniteLightTex,
        bumpMap: this.stoneBumpTex,
        bumpScale: 0.024,
        roughness: 0.76
      }),
      stupaBody: new THREE.MeshStandardMaterial({
        color: 0xD2924E,
        map: this.limeWallTex,
        bumpMap: this.limeBumpTex,
        bumpScale: 0.02,
        roughness: 0.6
      }),
      stupaRoof: new THREE.MeshStandardMaterial({
        color: 0xA85A38,
        map: this.roofTex,
        bumpMap: this.roofBumpTex,
        bumpScale: 0.03,
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
      terracottaPot: new THREE.MeshStandardMaterial({
        color: 0xA45236,
        map: this.pedestalRedTex,
        bumpMap: this.stoneBumpTex,
        bumpScale: 0.018,
        roughness: 0.68
      }),
      trunk: new THREE.MeshStandardMaterial({
        color: 0x5A402C,
        map: this.woodGrainTex,
        bumpMap: this.woodBumpTex,
        bumpScale: 0.032,
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
        bumpMap: this.stoneBumpTex,
        bumpScale: 0.012,
        roughness: 0.36,
        metalness: 0.66
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
    } else if (presetKey === 'rain') {
      // Moody tropical Mekong rainstorm sky (cool slate-blue zenith -> misty rain-curtain horizon)
      grad.addColorStop(0.0, '#44576B');
      grad.addColorStop(0.38, '#65798C');
      grad.addColorStop(0.70, '#8C9CA9');
      grad.addColorStop(0.90, '#A9B4BC');
      grad.addColorStop(1.0, '#929EA6');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 1024, 512);
      // Heavy layered raincloud banks
      for (let i = 0; i < 48; i++) {
        const cx = ((i * 97) % 1000) + 12;
        const cy = 70 + (i % 7) * 32;
        const scale = 1.1 + (i % 4) * 0.4;
        sctx.fillStyle = i % 3 === 0 ? 'rgba(66,78,92,0.46)' : 'rgba(130,144,158,0.34)';
        for (let j = 0; j < 4; j++) {
          sctx.beginPath();
          sctx.ellipse(cx + (j - 1.5) * 28 * scale, cy + (j % 2 ? 6 : -5), 34 * scale, 16 * scale, 0, 0, Math.PI * 2);
          sctx.fill();
        }
      }
      sctx.fillStyle = 'rgba(78, 96, 88, 0.42)';
    } else if (presetKey === 'sunset') {
      // Photorealistic Mekong Golden Hour (17:00) — indigo-violet zenith -> rose coral -> glowing amber horizon
      grad.addColorStop(0.0, '#2B3566');
      grad.addColorStop(0.28, '#6B4E7D');
      grad.addColorStop(0.56, '#C46F65');
      grad.addColorStop(0.78, '#EE9B59');
      grad.addColorStop(0.92, '#FBD188');
      grad.addColorStop(1.0, '#D9945E');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 1024, 512);
      // Warm low setting sun glow halo on the Western horizon
      const sunGrad = sctx.createRadialGradient(260, 392, 10, 260, 392, 195);
      sunGrad.addColorStop(0.0, 'rgba(255, 248, 212, 0.96)');
      sunGrad.addColorStop(0.24, 'rgba(255, 206, 118, 0.72)');
      sunGrad.addColorStop(0.62, 'rgba(246, 134, 72, 0.28)');
      sunGrad.addColorStop(1.0, 'rgba(246, 134, 72, 0.0)');
      sctx.fillStyle = sunGrad;
      sctx.fillRect(40, 180, 440, 320);
      // Backlit golden-rimmed cumulus clouds
      for (let i = 0; i < 40; i++) {
        const cx = ((i * 113) % 980) + 22;
        const cy = 150 + (i % 7) * 28;
        const scale = 0.9 + (i % 4) * 0.35;
        sctx.fillStyle = i % 2 === 0 ? 'rgba(255, 210, 148, 0.48)' : 'rgba(138, 78, 104, 0.36)';
        for (let j = 0; j < 4; j++) {
          sctx.beginPath();
          sctx.ellipse(cx + (j - 1.5) * 24 * scale, cy + (j % 2 ? 5 : -4), 30 * scale, 11 * scale, 0, 0, Math.PI * 2);
          sctx.fill();
        }
      }
      sctx.fillStyle = 'rgba(72, 46, 48, 0.50)';
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
