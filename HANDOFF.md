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
   - Ghi chú hiện tại: bàn thờ Tam Bảo sử dụng tượng điêu khắc từ `sculpted-buddhas.mjs` (không fetch `phat-ngoi-ban-tho.glb` vì thư mục chỉ có `.png`).
4. **Hiệu năng WebGL trên môi trường headless / máy yếu**:
   - `vinh-trang-3d-world.mjs` có cờ `this.isSoftwareGl` cho `SwiftShader`/`llvmpipe`. Các modal 3D phụ (`mountProfileCharacterStage`, `mountArhat3DStage`, `mountInteractive3DStage`) tự động giảm tần suất render khi `isSoftwareGl === true`.

---

## 3. Tính năng UX vừa tinh chỉnh cho người dùng mới / người lớn tuổi

- **Thanh Đi Nhanh & Điều Khiển Góc Trái (`#courtyard-quick-dock`)**:
  - **🧭 Đi nhanh**: Nút thu gọn/mở rộng các điểm chiêm bái chính (`Tam Quan`, `A Di Đà`, `Chánh điện`, `Vào Chánh điện`, `Di Lặc`, `Niết Bàn`, `Tạp Hóa`).
  - **🕹️ Phím đi**: Bật/tắt cụm D-Pad 4 hướng (`↑ ← ↓ →`) điều khiển nhân vật trực tiếp trên màn hình cảm ứng hoặc chuột.
  - **❔ Cách đi**: Bật/tắt bảng hướng dẫn ngắn gọn cách di chuyển, xoay góc nhìn và bấm `E` khi đứng gần Nhà Tạp Hóa.
