# Kiến trúc dự án — "Sửa gì thì mở file nào"

Nguyên tắc: **mỗi file ≤ ~1000 dòng, đặt tên theo chủ đề**. Muốn sửa gì chỉ cần mở đúng 1 file bên dưới, không phải đọc cả file 10.000 dòng.

```
index.html                     Khung HTML + importmap (three.js)
server.mjs                     Static server cổng 3000
data/ lessons/                 Dữ liệu lời Phật dạy, bài học tĩnh
public/audio, public/assets    Âm thanh kinh, ảnh dùng trong UI
Mô hình 3D Vĩnh Tràng/         GLB kiến trúc, tượng + three.js vendor
Thiết kế giao diện/            GLB vật phẩm, nhân vật, ảnh xem trước
Giáo trình phật học/           PDF giáo trình
scripts/check.mjs              `npm run build` — kiểm tra cú pháp mọi .mjs
src/logic/                     Logic thuần (không DOM) + test
src/app/                       Giao diện + 3D
src/styles/                    CSS chia theo chủ đề
```

## 1. Logic thuần — `src/logic/`

`chua-online-logic.mjs` chỉ là **barrel** (re-export), import cũ `from '/src/logic/chua-online-logic.mjs'` vẫn chạy. Code thật ở `src/logic/modules/`:

| Muốn sửa | Mở file |
|---|---|
| Nhân vật, trạm hành hương, điểm khám phá (zones), ranh giới thế giới, đi bộ | `world-data.mjs` |
| Hành động tu tập, công đức, cột mốc UGC | `spiritual-actions.mjs` |
| Cửa hàng lưu niệm & giỏ hàng | `shop-cart.mjs` |
| Giáo trình PDF, bài giảng, quiz | `lectures.mjs` |
| Studio ảnh UGC, màu OKLCH | `ugc-and-color.mjs` |
| Lời Phật dạy mỗi ngày | `daily-dharma.mjs` |
| Cửa hàng 9 tab (trang phục, vật phẩm) | `store-items.mjs` |
| Sạp hàng cổng chùa | `marketplace.mjs` |
| Dữ liệu nhiệm vụ/điểm danh/thư | `activity-data.mjs` · logic: `activity-hub.mjs` |
| Cấp bậc, vườn thiền, nhịp chuông, di sản | `pilgrim-progress-garden.mjs` |
| Quốc tịch, chế độ hành hương | `pilgrim-profiles.mjs` |
| 30 ngày, lịch âm, hoa đăng, nhật ký | `thirty-day-journal.mjs` |
| Học viện (khóa, thi, VietQR, chứng nhận) | `academy.mjs` |
| Tháp đèn cầu an | `blessing-tower.mjs` |
| Học kinh | `sutra-study-logic.mjs` (+ `.test.mjs`) |

Test: `src/logic/*.test.mjs` (`npm run lint`).

## 2. Giao diện — controller `ChuaOnlineApp`

`src/app/chua-online-app.mjs` chỉ giữ constructor/state/init. Các nhóm method là **mixin** trong `src/app/ui/` (gắn bằng `applyMixins`, gọi bằng `this.xxx()` như cũ). Import/hằng dùng chung: `src/app/ui/shared.mjs`.

| Muốn sửa | Mở file |
|---|---|
| HTML khung app, lời Phật dạy mỗi ngày | `ui/shell-dom.mjs` |
| Cầu nối app ↔ 3D, gần trạm, lễ tượng | `ui/world3d-bridge.mjs` |
| Hạt hiệu ứng, chuông, mõ, bộ trộn âm | `ui/effects-audio.mjs` |
| Modal tiền hành hương, tháp cầu an, hoa đăng | `ui/pilgrimage-modals.mjs` |
| Toast, chuyển màn hình, giờ, cỡ chữ, HUD mục tiêu | `ui/hud-navigation.mjs` |
| Vườn thiền, nhịp chuông, sổ di sản, công đức | `ui/temple-modals.mjs` |
| Shop 3D, lễ Phật/dâng hương/niệm Phật, giỏ hàng | `ui/shop-and-rituals.mjs` |
| Giảng đường, Học viện, chứng nhận, giáo trình | `ui/lecture-academy.mjs` |
| Studio ảnh UGC, nhiệm vụ gợi ý | `ui/ugc-and-quests.mjs` |
| Bản đồ khám phá, hồ sơ tài khoản | `ui/explore-account.mjs` |
| Activity hub (30 ngày, nhật ký) | `ui/activity-hub.mjs` |
| Sân khấu 3D nhân vật/La Hán, cửa hàng 9 tab, **quán ăn**, sạp hàng | `ui/stages-and-store.mjs` |
| Modal chung, **toàn bộ gắn sự kiện / phím tắt** | `ui/modal-and-events.mjs` |
| Học kinh (UI) | `sutra-study-ui.mjs` |
| Âm thanh đền (TempleAudioEngine) | `audio-engine.mjs` |

## 3. Thế giới 3D — `VinhTrang3DWorld`

`src/app/vinh-trang-3d-world.mjs` chỉ giữ constructor. Các nhóm method nằm trong `src/app/world/` (mixin). Hằng số/helper (`makeCanvasTex`, `makeTextTex`, `CHAR_GLB_PATHS`…): `world/shared.mjs`.

| Muốn sửa | Mở file |
|---|---|
| API công khai (vị trí người chơi, tour camera, pin 2D) | `world/api-and-camera.mjs` |
| Xe cộ, đoàn xe đưa đón | `world/road-traffic.mjs` |
| Texture, vật liệu, ánh sáng, bầu trời | `world/materials-and-lights.mjs` |
| Đường phố, nhà dân Mekong, mặt tiền ngoài cổng | `world/exterior-town.mjs` |
| **Khu dân cư phía Đông + quán Hủ tiếu/Bánh bèo** | `world/residential-lane.mjs` |
| Sân chùa (`buildTempleGroundsV8`), va chạm | `world/temple-grounds.mjs` |
| Điểm khám phá, Tam Quan, cổng phụ | `world/gates-and-discovery.mjs` |
| Mặt tiền Chánh điện 13 vòm | `world/chanh-dien-exterior.mjs` |
| Tiệm tạp hóa cuối đường, giảng đường, tháp 7 tầng, bệ tượng | `world/grocery-halls-statues.mjs` |
| Hồ sen, cá koi, lư hương, vườn cây, cờ | `world/pond-and-gardens.mjs` |
| Lá bồ đề, vườn thiền, câu đối, đèn chỉ đường | `world/courtyard-interactives.mjs` |
| Tải GLB, đặt model | `world/glb-loading.mjs` |
| Nhân vật, NPC khách/sư | `world/characters-npcs.mjs` |
| Di chuyển, tự đi tới trạm | `world/movement.mjs` |
| Giờ trong ngày, vào/ra Chánh điện | `world/time-and-interior.mjs` |
| Lễ bái, đồ trang bị, chạm để đi, gần trạm/quán | `world/player-and-interaction.mjs` |
| Vòng `animate`, cutscene xe tới, bạn đồng hành, hoa đăng | `world/render-loop-and-cutscene.mjs` |
| Nội thất Chánh điện vuông | `vinh-trang-square-interior.mjs` |
| Tượng Phật điêu khắc procedural | `sculpted-buddhas.mjs` |
| Trang phục, showcase 3D | `garment-and-showcase-3d.mjs` |

## 4. CSS — `src/styles/`

`src/app/chua-online-app.css` là **mục lục `@import`** (thứ tự = thứ tự cascade, không đổi). Style theo chủ đề: `01-viewport-hud` · `02-shop-screen` · `03-lecture-shared-modals` · `04-store-drawer-stalls` · `05-proximity-merit-profile` · `06-time-mala-arhat` · `07-hub-dock-garden` · `08-arrival-audio-30day` · `09-academy` · `10-blessing-tower` · `11-sutra-study`.

## 5. Quy ước khi thêm code

1. **Tính năng 3D mới = file mới** trong `src/app/world/` (viết dạng `export function buildXxx() { ... this ... }`, gọi bằng `buildXxx.call(this)`), như `residential-lane.mjs`. Không nhét thêm vào file có sẵn.
2. **Method mới của app/world** → thêm vào file mixin đúng chủ đề; nếu file vượt ~1000 dòng, tách file mới và thêm vào `applyMixins(...)` ở file entry.
3. **Dữ liệu/logic mới** → file mới trong `src/logic/modules/` rồi thêm một dòng `export * from` vào barrel.
4. CSS mới → thêm vào file chủ đề trong `src/styles/` (hoặc file mới + `@import` ở cuối mục lục).
5. Trước khi commit: `npm run build && npm run lint`. Chỉ commit vào `main` (hoặc nhánh ngắn hạn rồi merge ngay) để không phát sinh nhiều bản song song.
