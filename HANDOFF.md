# Chùa Online — Multi-AI-Studio Handoff & Module Contract

Tài liệu này giúp bạn làm việc song song trên **hai AI Studio khác nhau** (commit từ máy/studio này và pull sang studio kia) mà **không bị xung đột merge (merge conflict)** hoặc gãy import.

---

## 1. Kiến trúc Module & Ranh giới chỉnh sửa

| File | Trách nhiệm chính | Quy tắc chống conflict |
| :--- | :--- | :--- |
| `src/logic/chua-online-logic.mjs` | Pure domain state, catalog (`STORE_ITEMS_CATALOG`, `PILGRIMAGE_STATIONS`), nghi thức, công thức tính điểm & mission | Không import DOM hay Three.js; mọi thay đổi logic phải có test tương ứng trong `chua-online-logic.test.mjs` |
| `src/logic/chua-online-logic.test.mjs` | Unit tests (`node --test`) | Luôn giữ pass 100% trước khi commit |
| `src/app/sculpted-buddhas.mjs` | Tạo tượng 18 vị La Hán & tượng Phật điêu khắc thủ công bằng Three.js | Chỉ chứa geometry/material Three.js thuần |
| `src/app/garment-and-showcase-3d.mjs` | Các helper dùng chung cho Cửa hàng / Tủ đồ / Showcase: `clearRiggedBoneProps`, `recolorGarmentOnScene`, `createBespokeRobeGroup`, `createStoreAccessoryGroup`, `createSculptedArhatShowcase` | **Sửa trang phục, phụ kiện cầm tay, màu áo tại đây** — không sửa trực tiếp vào file 10k dòng `vinh-trang-3d-world.mjs` |
| `src/app/vinh-trang-3d-world.mjs` | Scene 3D Chùa Vĩnh Tràng, nhân vật, di chuyển, ánh sáng, nội thất Chữ Quốc; re-export 5 helper từ `garment-and-showcase-3d.mjs` để giữ tương thích ngược | Hạn chế thêm hàm tiện ích mới vào cuối file này; hãy đặt vào module riêng |
| `src/app/chua-online-app.mjs` | Controller giao diện, HUD (`#courtyard-quick-dock`), modal, âm thanh, lưu `localStorage` | Import 5 helper dùng chung từ `/src/app/garment-and-showcase-3d.mjs` |
| `src/app/chua-online-app.css` | Toàn bộ CSS của ứng dụng (bảng màu gỗ trầm `#5C381F` / vàng nghệ `#E5B24C` / kem `#FFF6E5`) | Thêm style tính năng mới ở cuối file kèm comment phân vùng rõ ràng |
| `server.mjs` | Static Node HTTP server cổng `3000` hỗ trợ range, `HEAD`, MIME chuẩn cho `.mjs`/`.glb`/`.mp3` | Giữ nguyên port `3000`, `0.0.0.0` |

---

## 2. Quy trình Commit & Pull giữa 2 AI Studio

1. **Chỉ dùng `npm`** (`package.json` + `package-lock.json`). Không commit `bun.lock`, `yarn.lock`, `.playwright-cli/`, hoặc `.aistudio/` (đã được liệt kê trong `.gitignore`).
2. **Kiểm tra bắt buộc trước mỗi lần commit**:
   ```bash
   npm run build
   npm run lint
   ```
   - `npm run build` kiểm tra cú pháp ESM (`node --check`) cho tất cả 6 file `.mjs`.
   - `npm run lint` chạy toàn bộ `node --test src/logic/chua-online-logic.test.mjs`.
3. **Asset 3D (`.glb`)**:
   - Trước khi gắn đường dẫn `.glb` mới trong code, kiểm tra file tồn tại thật trong `/Mô hình 3D Vĩnh Tràng/` hoặc `/Thiết kế giao diện/`.
   - **Đã tích hợp đầy đủ**: `mat-tien-vinh-trang.glb` (mặt tiền Chánh Điện), `phat-ngoi-ban-tho.glb` (bàn thờ Tam Bảo & tiền sảnh, `rotation.y = 0` hướng mặt ra sân/Phật tử), `quan-am-nam-hai.glb`, `ho-phap-vi-da.glb`, `tieu-dien-dai-si.glb`, `to-dat-ma.glb`, 7 tượng La Hán, `bao-thap-7-tang.glb`, `dai-hong-chung.glb`, `trong-bat-nha.glb`, `long-tru-rong-cuon.glb`, `bao-lam-thep-vang.glb`, `xe-khach-du-lich.glb`, `xe-o-to-gia-dinh.glb`, `chim-bo-cau-3d.glb`, `tui-vai-sen.glb`, `khan-ran-nam-bo-3d.glb`, `trang-hat-bo-de-3d.glb`, `vong-may-ngu-sac-3d.glb`, `cay-bo-de-non.glb`, `cay-sala-hoa.glb`, cùng 4 nhân vật Meshy (`nam-ao-nau`, `nu-ao-lam`, `su-thay-ao-vang`, `du-khach-quoc-te`).
4. **Hiệu năng WebGL trên môi trường headless / máy yếu**:
   - `vinh-trang-3d-world.mjs` có cờ `this.isSoftwareGl` cho `SwiftShader`/`llvmpipe`. Các modal 3D phụ (`mountProfileCharacterStage`, `mountArhat3DStage`, `mountInteractive3DStage`) tự động giảm tần suất render khi `isSoftwareGl === true`.

---

## 3. Tính năng UX & Vòng lặp Gameplay Nhiều Ngày (Multi-Day Replayable Loop)

- **Thanh Đi Nhanh & Điều Khiển Góc Trái (`#courtyard-quick-dock`)**:
  - **🧭 Đi nhanh**: Thu gọn/mở rộng các điểm chiêm bái chính (`Tam Quan`, `A Di Đà`, `Chánh điện`, `Vào Chánh điện`, `Di Lặc`, `Niết Bàn`, `Tạp Hóa`, `Vườn Phật`, `Chuông Mõ`, `Di Sản`).
  - **🕹️ Phím đi / ❔ Cách đi**: Điều khiển D-Pad cảm ứng và hướng dẫn phím tắt (`WASD`/`↑↓←→`, `E` tương tác gần, `Space` gõ mõ/thỉnh chuông).
- **Hệ Thống Tiến Trình & Nhiệm Vụ Hằng Ngày (`src/logic/chua-online-logic.mjs` + `src/app/chua-online-app.mjs`)**:
  - **Cấp Bậc Hành Hương (`PILGRIM_RANKS`)**: Tích lũy XP từ nghi thức, học Phật, quét lá, trồng cây, thỉnh chuông, sưu tầm di sản; hiển thị pill XP trên HUD và bảng **Mục Tiêu Hôm Nay** (`#daily-goals-tracker`, tự ẩn khi vào nội thất Chánh Điện để không đè lên `#interior-zone-bar`).
  - **Quét Lá Bồ Đề Vàng 3D (`COURTYARD_LEAF_SPOTS`)**: 8 cụm lá tại `spot.pos.x`/`spot.pos.z` phát sáng trên sân chùa, nhặt trực tiếp hoặc nhấn `E`.
  - **Vườn Cây Phật 3D (`TEMPLE_GARDEN_SLOTS`, `TEMPLE_GARDEN_SPECIES`)**: 4 luống đất thực tế tại Vườn Lâm Tỳ Ni (`chum_sen`, `cay_bo_de`, `cay_sala`), đồng bộ trực tiếp GLB theo giai đoạn `stage` 1–3 (`syncTempleGardenVisuals`).
  - **Thỉnh Chuông & Gõ Mõ Chánh Niệm (`openBellRhythmModal`)**: Minigame nhịp điệu WebAudio thời gian thực (`Space` hoặc click).
  - **Sổ Di Sản Vĩnh Tràng (`HERITAGE_RELICS`, `openHeritageBookModal`)**: 10 dấu ấn di sản kiến trúc/tượng cổ mở khóa & đóng dấu nhận thưởng.

---

## 4. Nhật ký kiểm thử gần nhất (Execution Log for Next Agents)

- `node --test src/logic/chua-online-logic.test.mjs`: 12/12 pass.
- `npm run build` & `npm run lint`: pass.
- Lưu ý tọa độ pure logic: `COURTYARD_LEAF_SPOTS` và `TEMPLE_GARDEN_SLOTS` lưu tọa độ trong `.pos.x` / `.pos.z` (không phải `.x` / `.z` ở root object).
- Lưu ý camera & tượng nội thất: `cameraBaseYaw = Math.PI` hướng về `-Z` (Chánh Điện & Tam Bảo); `phat-ngoi-ban-tho.glb` dùng `rotation.y = 0` để xoay mặt về phía Phật tử (`+Z`).

