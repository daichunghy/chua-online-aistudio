# Chùa Online — Multi-AI-Studio Handoff & Module Contract

Tài liệu này giúp bạn làm việc song song trên **hai AI Studio khác nhau** (commit từ máy/studio này và pull sang studio kia) mà **không bị xung đột merge (merge conflict)** hoặc gãy import.

---

## 1. Kiến trúc Module & Ranh giới chỉnh sửa

| File | Trách nhiệm chính | Quy tắc chống conflict |
| :--- | :--- | :--- |
| `src/logic/chua-online-logic.mjs` | Pure domain state, catalog (`STORE_ITEMS_CATALOG`, `PILGRIMAGE_STATIONS`), 6 Quốc tịch, 4 Chế độ hành hương, Lộ trình 30 ngày & Lịch Âm, Hoa Đăng, Nhật Ký An Tâm, Học Viện Phật Học trả phí (`ACADEMY_COURSES`, `ACADEMY_MODULES`, `buildVietQRPayload`, `gradeAcademyExam`, `generateAcademyCertificate`) | Không import DOM hay Three.js; mọi thay đổi logic phải có test tương ứng trong `chua-online-logic.test.mjs` |
| `src/logic/chua-online-logic.test.mjs` | Unit tests (`node --test`) — hiện tại **15/15 pass** | Luôn giữ pass 100% trước khi commit |
| `src/app/audio-engine.mjs` | **`TempleAudioEngine`** hợp nhất WebAudio + HTMLAudio + TTS (`SpeechSynthesis`), mở khóa gesture tự động, trộn 3 kênh (`ambient`, `sfx`, `voice`), resolver chính xác `audio_v5/` & `audio_v5/ke_parts/`, chuông Đại Hồng Chung, mõ gỗ mít, SFX xe đưa đón, bước chân gỗ/đá | Không giữ API key hay phụ thuộc thư viện ngoài |
| `src/app/sculpted-buddhas.mjs` | Tạo tượng 18 vị La Hán & tượng Phật điêu khắc thủ công bằng Three.js | Chỉ chứa geometry/material Three.js thuần |
| `src/app/garment-and-showcase-3d.mjs` | Các helper dùng chung cho Cửa hàng / Tủ đồ / Showcase: `clearRiggedBoneProps`, `recolorGarmentOnScene`, `createBespokeRobeGroup`, `createStoreAccessoryGroup`, `createSculptedArhatShowcase` | **Sửa trang phục, phụ kiện cầm tay, màu áo tại đây** — không sửa trực tiếp vào file `vinh-trang-3d-world.mjs` |
| `src/app/vinh-trang-3d-world.mjs` | Scene 3D Chùa Vĩnh Tràng (mặt tiền Á–Âu, Tam Quan khảm gốm, nội thất Chữ Quốc 6 phân khu, cutscene xe đưa đón `playArrivalCutscene`, bạn đồng hành AI `setPilgrimageCompanions`, Hoa Đăng nổi mặt hồ `renderFloatingLanterns`) | Hạn chế thêm hàm tiện ích mới vào cuối file này; hãy đặt vào module riêng |
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
   - `npm run build` kiểm tra cú pháp ESM (`node --check`) cho `server.mjs` và toàn bộ 6 module trong `src/`.
   - `npm run lint` chạy toàn bộ `node --test src/logic/chua-online-logic.test.mjs` (15/15 test pass).
3. **Asset 3D (`.glb`) mới tạo qua Meshy (đã tích hợp lên GitHub)**:
   - Kiến trúc chính: `Mô hình 3D Vĩnh Tràng/Bản dựng mới/mat-tien-vinh-trang-meshy.glb`, `tam-quan-vinh-trang.glb`.
   - Tượng Tam Bảo & La Hán: `Mô hình 3D Vĩnh Tràng/Tượng/phat-thich-ca-chanh-dien.glb`, `cu-bat-la-han.glb`, `khai-tam-la-han.glb`, `thac-thap-la-han.glb`, `tieu-su-la-han.glb`.
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

## 4. Phần Dang Dở & Cần Agent Tiếp Theo Thực Hiện

> Ghi chú cho Agent kế tiếp: Toàn bộ mã nguồn, logic tests (`15/15`) và cú pháp ESM đã pass (`npm run build && npm run lint`), **nhưng chưa hoàn tất lượt chạy Playwright E2E toàn diện và kiểm tra trực quan 3D cuối cùng**.

1. **Chạy hoàn chỉnh kiểm thử Playwright E2E & rà soát UI thực tế (Desktop `1440×900` + Mobile `390×844`)**:
   - Kiểm tra toàn bộ luồng tương tác: Modal khởi hành -> Cutscene xe -> Lời Phật dạy -> Audio mixer 3 kênh -> Đi bộ vào Chánh điện 3D (mặt bằng chữ Quốc 6 khu + Mặt cắt 3D) -> Thả Hoa Đăng lên mặt hồ -> Tab 30 Ngày & Nhật Ký -> Đổi 7 nhân vật / 6 quốc tịch / 4 chế độ + mặc thử áo tràng cửa hàng trong Tài khoản -> Học Viện Phật Học (mở khóa `VINHTRANG2026`, cảnh báo chưa làm quiz, thi tốt nghiệp & tải PNG chứng nhận, kiểm tra đủ 11 file PDF).
   - Chụp ảnh từng màn hình cả Desktop (`1440×900`) và Mobile (`390×844`), kiểm tra kỹ không tràn ngang, không che khuất nút HUD/D-pad, kích thước nút dễ bấm cho người lớn tuổi.
2. **Kiểm tra trực quan (Visual QA) & tinh chỉnh 3D bên trong Chánh điện / Ngoại cảnh**:
   - Vào trực tiếp không gian 3D (Sáng / Trưa / Tối) kiểm tra hướng xoay, độ cao đặt chân so với sàn (`baseY`), tỷ lệ kích thước và chất liệu các GLB vừa tích hợp từ Meshy (`mat-tien-vinh-trang-meshy.glb`, `tam-quan-vinh-trang.glb`, `phat-thich-ca-chanh-dien.glb`, 4 tượng La Hán mới, `cap-hac-rua.glb`, `nhang-khoanh-dong.glb`, `cay-bo-de-non.glb`, `cay-sala-hoa.glb`).
   - Đối chiếu cận cảnh mặt tiền & Tam Quan với 2 ảnh gốc trong `docs/references/`; nếu tượng/vật phẩm nào bị xoay ngược, bay lơ lửng, chìm sàn hoặc quá tối trong Chánh điện thì chỉnh trực tiếp transform/đèn tại `src/app/vinh-trang-3d-world.mjs`.
   - Nếu cần tạo bổ sung thêm asset/tượng còn thiếu (ví dụ các vị La Hán còn lại chưa có GLB riêng hoặc chi tiết sân vườn/xe/trang phục bị lỗi rig khi mặc ở Cửa hàng), dùng Meshy API (dùng Meshy 7.1 cho công trình/tượng lớn và bản nhẹ 2.5–5 credit cho asset nhỏ trong game, tối ưu mesh/texture giữ kích thước hợp lý để load mượt trên điện thoại).
3. **Hoàn thiện mặc thử trang phục (Garments & Rigging) & tối ưu hiệu năng Mobile**:
   - Test kỹ việc gắn/gỡ từng món Áo tràng, Túi vải sen, Nón lá, Khăn rằn, Tràng hạt, Đèn sen lên **tất cả 7 profile nhân vật** khi đứng, đi bộ, vái lạy và quỳ trong `vinh-trang-3d-world.mjs` & `garment-and-showcase-3d.mjs` để chắc chắn không bị lệch xương hay xuyên mesh.
   - Đánh giá dung lượng tổng khi load 3D trên điện thoại tầm trung; cân nhắc lazy-load/LOD hoặc nén Draco nếu cần giảm thời gian tải.
4. **Kiểm tra trải nghiệm Giảng đọc & Thanh toán thực tế (nếu triển khai Production)**:
   - Xác minh fallback phát âm thanh / giọng đọc tiếng Việt ổn định trên cả Chrome, Safari iOS và Android WebView khi thiết bị không có giọng `vi-VN` cài sẵn.
   - Kết nối API/Webhook VietQR thật phía backend (nếu cần xác thực chuyển khoản tự động thay cho mã kích hoạt offline hiện có).


