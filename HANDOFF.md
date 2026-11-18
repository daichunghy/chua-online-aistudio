# Chùa Online — Multi-AI-Studio Handoff & Module Contract

Tài liệu này giúp bạn làm việc song song trên **hai AI Studio khác nhau** (commit từ máy/studio này và pull sang studio kia) mà **không bị xung đột merge (merge conflict)** hoặc gãy import.

> **Cập nhật 18/11/2026:** Toàn bộ các file lớn (`chua-online-logic.mjs`, `chua-online-app.mjs`, `vinh-trang-3d-world.mjs`, `chua-online-app.css`) đã được tách nhỏ thành các module theo chủ đề trong `src/logic/modules/`, `src/app/ui/`, `src/app/world/`, và `src/styles/` (giữ nguyên import cũ). Xem bản đồ **"Sửa gì thì mở file nào"** tại [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## 1. Kiến trúc Module & Ranh giới chỉnh sửa

| File | Trách nhiệm chính | Quy tắc chống conflict |
| :--- | :--- | :--- |
| `src/logic/chua-online-logic.mjs` | Pure domain state, catalog (`STORE_ITEMS_CATALOG`, `PILGRIMAGE_STATIONS`), 6 Quốc tịch, 4 Chế độ hành hương, Lộ trình 30 ngày & Lịch Âm, Hoa Đăng, Nhật Ký An Tâm, Học Viện Phật Học trả phí (`ACADEMY_COURSES`, `ACADEMY_MODULES`, `buildVietQRPayload`, `gradeAcademyExam`, `generateAcademyCertificate`) | Không import DOM hay Three.js; mọi thay đổi logic phải có test tương ứng trong `chua-online-logic.test.mjs` |
| `src/logic/chua-online-logic.test.mjs` | Unit tests (`node --test`) — hiện tại **16/16 pass** | Luôn giữ pass 100% trước khi commit |
| `src/app/audio-engine.mjs` | **`TempleAudioEngine`** hợp nhất WebAudio + HTMLAudio + TTS (`SpeechSynthesis`), mở khóa gesture tự động, trộn 3 kênh (`ambient`, `sfx`, `voice`), resolver chính xác `audio_v5/` & `audio_v5/ke_parts/`, chuông Đại Hồng Chung, mõ gỗ mít, SFX xe đưa đón, bước chân gỗ/đá | Không giữ API key hay phụ thuộc thư viện ngoài |
| `src/app/sculpted-buddhas.mjs` | Tạo tượng 18 vị La Hán, Phật Nghìn Mắt Nghìn Tay, Phật Nhập Niết Bàn & tượng Phật điêu khắc thủ công bằng Three.js | Chỉ chứa geometry/material Three.js thuần |
| `src/app/garment-and-showcase-3d.mjs` | Các helper dùng chung cho Cửa hàng / Tủ đồ / Showcase: `clearRiggedBoneProps`, `recolorGarmentOnScene`, `createBespokeRobeGroup`, `createStoreAccessoryGroup`, `createSculptedArhatShowcase` | **Sửa trang phục, phụ kiện cầm tay, màu áo tại đây** — không sửa trực tiếp vào file `vinh-trang-3d-world.mjs` |
| `src/app/vinh-trang-square-interior.mjs` | Nội thất Chánh Điện Hình Vuông (`41.6m × 41.6m`) quanh `Hồ Sen Bộ` & Hòn Non Bộ giữa chùa, dải bàn thờ lối phải (`Nghìn Mắt Nghìn Tay`, `Chỗ Ngủ Của Phật`), hệ `Tam Môn Cửa Gỗ Bức Bàn` + `Kệ Bỏ Giày Dép` bên ngoài cửa, `Tháp Đèn Cầu An` 13 tầng, `Long Trụ`, `Trống Bát Nhã`, `18 La Hán` | Chỉnh sửa kiến trúc bên trong Chánh Điện tại module độc lập này |
| `src/app/vinh-trang-3d-world.mjs` | Scene 3D Chùa Vĩnh Tràng (Tam Quan khảm gốm, Cổng Phụ `Tịnh Độ Huyền Môn` + bảng xanh xe 2 bánh + đường thẳng rợp bóng cây xuống Tiệm Tạp Hóa Lưu Niệm cuối đường + Hiên Bỏ Dép rẽ trái vào Chánh Điện, cutscene xe đưa đón, bạn đồng hành 3D, Hoa Đăng nổi mặt hồ) | Hạn chế thêm hàm tiện ích mới vào cuối file này; hãy đặt vào module riêng |
| `src/app/chua-online-app.mjs` | Controller giao diện, HUD (`#courtyard-quick-dock`, `#audio-mixer-popover`, `#nav-seasonal-pill`), modal Tiền hành hương, Hoa Đăng, 30 Ngày & Nhật Ký, Học Viện Phật Học & Chứng Nhận PNG | Import 5 helper dùng chung từ `/src/app/garment-and-showcase-3d.mjs` |
| `src/app/chua-online-app.css` | Toàn bộ CSS của ứng dụng (bảng màu gỗ trầm `#5C381F` / vàng nghệ `#E5B24C` / kem `#FFF6E5`, nút `>=48px` thân thiện người lớn tuổi, responsive mobile `<=768px`, `@media print`) | Thêm style tính năng mới ở cuối file kèm comment phân vùng rõ ràng |
| `server.mjs` | Static Node HTTP server cổng `3000` (hoặc `process.env.PORT`) hỗ trợ `HEAD`, MIME chuẩn cho `.mjs`/`.glb`/`.mp3`/`.pdf` | Giữ nguyên port mặc định `3000`, `0.0.0.0` |
| `docs/references/` | Ảnh tham chiếu kiến trúc thực tế mặt tiền Chánh điện và Cổng Tam Quan Chùa Vĩnh Tràng (`vinh_trang_facade_ref.jpg`, `vinh_trang_tam_quan_ref.jpg`) | Tài liệu tham chiếu trực quan cho mô hình 3D |

---

## 2. Quy trình Commit & Kiểm tra trước khi Commit

1. **Chỉ dùng `npm`** (`package.json`). Không commit `.playwright-cli/`, `.aistudio/`, file test tạm hay API key.
2. **Kiểm tra bắt buộc**:
   ```bash
   npm run build
   npm run lint
   ```
   - `npm run build` kiểm tra cú pháp ESM (`node --check`) cho `server.mjs` và toàn bộ 7 module trong `src/`.
   - `npm run lint` chạy toàn bộ `node --test src/logic/chua-online-logic.test.mjs` (`16/16` test pass).
3. **Asset 3D (`.glb`) mới tạo qua Meshy (đã tích hợp)**:
   - Kiến trúc chính: `Mô hình 3D Vĩnh Tràng/Bản dựng mới/mat-tien-vinh-trang-meshy.glb`, `tam-quan-vinh-trang.glb`.
   - Tượng Tam Bảo, Bồ Tát & La Hán: `Mô hình 3D Vĩnh Tràng/Tượng/quan-am-nam-hai.glb`, `cu-bat-la-han.glb`, `khai-tam-la-han.glb`, `thac-thap-la-han.glb`, `tieu-su-la-han.glb`, cùng `Thiết kế giao diện/Vật phẩm 3D/meshy_assets/tuong-phat-nghin-mat-nghin-tay.glb` & `cho-ngu-cua-phat.glb`.
   - Vật phẩm & cảnh quan: `Thiết kế giao diện/Vật phẩm 3D/meshy_assets/cap-hac-rua.glb`, `cay-bo-de-non.glb`, `cay-sala-hoa.glb`, `nhang-khoanh-dong.glb`.
   - **Lưu ý bảo mật**: Tuyệt đối không lưu API key Meshy (`msy_...`) vào bất kỳ file nào trong repo.

---

## 3. Tổng hợp Nâng cấp Đã Thực Hiện

1. **Nhân vật, Trang phục & Đa dạng Quốc tịch / Đoàn hành hương**:
   - Sửa lỗi double-jump khi giữ phím D-pad/bàn phím (`if (!this.world3d)`) và chuẩn hóa tỷ lệ chiều cao `profile.heightMeters` trong `mountProfileCharacterStage`.
   - Bổ sung 6 `NATIONALITY_PROFILES` (`vn`, `jp`, `kr`, `tw`, `th`, `intl`) và 4 `PILGRIMAGE_MODES` (`solo`, `family_3gen`, `tour_group`, `explorer`) sinh bạn đồng hành 3D đi theo (`setPilgrimageCompanions`).
2. **Kiến trúc Chùa Vĩnh Tràng 3D Thực tế & Cutscene Xe Đưa Đón**:
   - Nâng cấp ngoại thất (Tam Quan khảm gốm, mặt tiền Á–Âu Chánh điện) và nội thất Chữ Quốc (Tam Bảo, cặp hạc cưỡi rùa, nhang khoanh đồng, 18 vị La Hán), căn chỉnh lại kích thước/vị trí asset trong sân.
   - Bổ sung modal tiền sảnh chọn Quốc tịch / Nhân vật / Chế độ hành hương + cutscene xe ô tô/xe khách đưa người chơi tới trước cổng chùa (`playArrivalCutscene`), hỗ trợ `?autostart=1` để vào thẳng sân.
3. **Hệ thống Âm thanh Hợp nhất (`TempleAudioEngine`)**:
   - Âm thanh chuông Đại Hồng Chung, mõ gỗ mít, chuông gió/chim vườn, SFX xe tới/cửa xe/bước chân gỗ & đá, giọng đọc TTS kèm nút tắt/mở tiếng & thanh trộn 3 kênh trên HUD (`#nav-btn-audio` -> `#audio-mixer-popover`).
4. **Vòng lặp Giữ chân 30 Ngày (Chống chán sau 30 phút)**:
   - Lộ trình 30 ngày (`THIRTY_DAY_RETREATS`, `THIRTY_DAY_JOURNEY_PLAN`) theo 4 tuần tu tập, Lịch Âm & Ngày Lễ (`getTempleSeasonalContext`), **Thả Hoa Đăng Hồ Sen 3D** (`openHoaDangModal`, `renderFloatingLanterns`) và **Nhật Ký An Tâm** (`addJournalEntry`).
5. **Học Viện Phật Học Trả Phí & Thân thiện Người Lớn Tuổi**:
   - Cấu trúc lại thành **4 Khóa học · 12 Học phần · 24 Bài học · 11 Giáo trình PDF** (`DHARMA_TEXTBOOKS`). Khóa 1 miễn phí; mở khóa bằng VietQR (`buildVietQRPayload`) + mã kích hoạt (`VINHTRANG2026`, `HOIAN2026`, `VT-HV-XXXX`).
   - Câu hỏi ôn tập không chọn sẵn đáp án (`selectedQuizOption = null`), chặn bấm qua bài khi chưa làm quiz (có cảnh báo `.academy-quiz-notice`), **Thi Tốt Nghiệp** (`gradeAcademyExam`) & xuất **Bằng Chứng Nhận PNG/In ấn** có dấu son Đỏ (`generateAcademyCertificate`).
   - Nút bấm `>= 48px`, tăng/giảm cỡ chữ (`A-`/`A+`), nút chỉnh tốc độ Thầy đọc chậm `0.85x` (`#btn-lecture-speed-toggle`).

---

## 4. Trạng Thái Kiểm Thử & Nhật Ký Cải Thiện Mới Nhất (`IMPROVEMENT_LOG.md`)

> Xem chi tiết đầy đủ tại [IMPROVEMENT_LOG.md](./IMPROVEMENT_LOG.md).

1. **Đã hoàn thiện kiến trúc thực tế Chùa Vĩnh Tràng & Sửa lỗi**:
   - Đường thẳng rợp bóng cây từ **Cổng Phụ `Tịnh Độ Huyền Môn`** (có bảng xanh *“CHO XE 2 BÁNH VÀO CHÙA”* + cau vua) dẫn xuống **Tiệm Tạp Hóa · Quầy Lưu Niệm Phật Giáo cuối đường**, rẽ trái lên **Hiên Bỏ Giày Dép** và bước qua **Cửa Gỗ Bức Bàn** vào Chánh Điện.
   - Mặt bằng **Chánh Điện Hình Vuông (`41.6m × 41.6m`)** quanh **Hồ Sen Bộ** lộ thiên giữa chùa: dải bàn thờ lối phải (`Tượng Phật Nghìn Mắt Nghìn Tay`, `Chỗ Ngủ Của Phật`), mặt dựng **Tam Môn Cửa Gỗ Bức Bàn + 4 Kệ Giày Dép** phía trước Đại Hùng Bửu Điện (khép kín hoàn toàn trần gỗ chạm lọng, không còn khoảng hở đen), **Tháp Đèn Cầu An 13 tầng (`Ghi Tên Cầu Phước`)**, **Trống Bát Nhã**, **Đại Hồng Chung** và **18 vị La Hán**.
   - Khắc phục triệt để lỗi kẹt lớp phủ màn hình màu vàng (`#temple-transition-veil`) khi ra/vào Chánh Điện.
2. **Playwright E2E Desktop (`1440×900`) & Mobile (`390×844`) — 100% PASS**:
   - `npm run build` + `npm run lint` (`16/16` unit tests) pass.
   - `0` console error, `0` page error, `0` HTTP `404`, `0px` tràn ngang trên Mobile `390×844`, `11/11` giáo trình PDF HTTP `200`.
3. **Hướng mở rộng Production tiếp theo (nếu cần)**:
   - Kết nối Webhook VietQR phía backend khi triển khai thu học phí tự động.
   - Bổ sung nén Draco cho các `.glb` lớn nếu cần tối ưu thêm băng thông 3G/4G.


