# Nhật Ký Cải Thiện Dự Án — Chùa Online (Chùa Vĩnh Tràng 3D)

> **Cập nhật lần cuối**: Hoàn thiện kiến trúc lối đi thẳng từ Cổng Phụ `Tịnh Độ Huyền Môn` xuống cuối đường (Tiệm Tạp Hóa · Quầy Lưu Niệm Phật Giáo rợp bóng cây mát), rẽ trái qua **Hiên Bỏ Giày Dép & Cửa Gỗ Bức Bàn** vào **Chánh Điện Hình Vuông (`Hồ Sen Bộ` giữa chùa)**, tạo mới 2 tôn tượng Meshy 7.1 PBR và triệt tiêu lỗi màn hình phủ màu vàng khi ra/vào điện.

---

## 1. Nghiên Cứu Thực Tế Chùa Vĩnh Tràng (Mỹ Tho, Tiền Giang)

Dựa trên ảnh chụp thực tế tại Chùa Vĩnh Tràng và khảo cứu kiến trúc Phật giáo Nam Bộ thế kỷ XIX–XX:
1. **Cổng Phụ Bên Phải — `Tịnh Độ Huyền Môn` (`淨土玄門`)**:
   - Phía bên phải cổng Tam Quan có cổng phụ khảm sành sứ tinh xảo mang bức hoành `Tịnh Độ Huyền Môn`, bảng xanh đặc trưng **“CHO XE 2 BÁNH VÀO CHÙA”** đặt bên trụ phải và hàng **cau vua cổ thụ** vươn cao.
   - Bước qua cổng này là **con đường thẳng dài rợp bóng cây cổ thụ mát rượi** dẫn sâu xuống tận phía cuối hông chùa — nơi tập trung **Tiệm Tạp Hóa & Quầy Lưu Niệm Phật Giáo, nước giải khát mát lành** phục vụ khách thập phương, chứ không rẽ gấp ngay đầu cổng.
2. **Nghi Thức Bỏ Giày Dép Bên Ngoài & Cửa Gỗ Bức Bàn**:
   - Từ khu sân mát cuối đường cạnh tiệm lưu niệm, Phật tử và du khách **rẽ trái bước lên hiên gạch tàu có mái che**, **cởi bỏ giày dép xếp ngay ngắn trên các kệ gỗ nhiều tầng bên ngoài cửa**, rồi mới bước qua ngưỡng **cửa gỗ bức bàn chạm lọng** để tiến vào không gian thờ tự bên trong.
   - Ngay phía trước **Đại Hùng Bửu Điện (Chính Điện)** đối diện qua khoảng sân thiên tỉnh **Hồ Sen Bộ & Hòn Non Bộ** ở giữa chùa là hệ **Tam Môn Cửa Gỗ Bức Bàn thượng song hạ bản** cùng **dàn kệ để dép bên ngoài cửa** và bao lam gỗ chạm lọng kín đáo lên sát trần (không có khoảng trống hở đen phía trên).
3. **Bố Cục Chánh Điện Hình Vuông Quanh Hồ Sen Bộ**:
   - **Lối Phải — Dải Bàn Thờ Thẳng**: Tôn tượng **Phật Nghìn Mắt Nghìn Tay (Thiên Thủ Thiên Nhãn Quán Thế Âm)**, **Chỗ Ngủ Của Phật (Đức Phật Nhập Niết Bàn)**, cùng các án thờ Dược Sư Lưu Ly, Địa Tạng Vương, Văn Thù – Phổ Hiền.
   - **Giữa Chùa — Hồ Sen Bộ (Thiên Tỉnh Lộ Thiên)**: Hồ sen đá bát giác ở trung tâm bốn dãy hành lang vòm Pháp – Việt màu vàng kem cổ kính, có cầu đá cong, hòn non bộ cổ thụ và tôn tượng Quan Âm đứng giữa hồ.
   - **Cạnh Trên — Chính Điện (Đại Hùng Bửu Điện)**: Tôn tượng Tam Thế / A Di Đà – Thích Ca – Di Lặc sơn son thếp vàng, **Long Trụ chạm rồng**, **Đại Hồng Chung**, **Trống Bát Nhã** trên giá gỗ đỏ và **Tháp Đèn Cầu An 13 tầng (108 ô đèn ghi tên cầu phước)**.
   - **Cạnh Trái & Cạnh Dưới**: Hành lang **Thập Bát La Hán (18 vị La Hán)** dọc tường, **Bàn Tổ Bồ Đề Đạt Ma** và nhị vị **Hộ Pháp Vi Đà – Tiêu Diện Đại Sĩ**.

---

## 2. Danh Mục Cải Thiện Kiến Trúc, 3D Assets & Sửa Lỗi

### A. Sửa Triệt Để Lỗi Ám Vàng Màn Hình Khi Vào / Ra Chánh Điện
- **Nguyên nhân gốc**:
  1. Lớp phủ `#temple-transition-veil` trong `src/app/chua-online-app.css` trước đây dùng dải màu vàng gắt `rgba(217, 164, 65, 0.94)` với `z-index: 65` đè lên toàn khung hình.
  2. Khi người chơi bấm nút đi nhanh hoặc đổi trạng thái vào/ra (`toggleInterior`) lúc hiệu ứng chuyển cảnh (`interiorTransition`) đang ở pha `fade`, `interiorTransition` bị gán `null` mà không gọi `onTransitionFade(false)`, khiến class `.active` bị kẹt vĩnh viễn trên màn hình.
- **Giải pháp đã triển khai**:
  - Đổi `#temple-transition-veil` sang lớp mờ gỗ trầm dịu nhẹ (`rgba(16, 10, 6, 0.52)`, `z-index: 20` nằm dưới HUD, thời gian chuyển `0.2s`).
  - Mọi nhánh kết thúc hoặc ngắt chuyển cảnh trong `toggleInterior()`, `enterInteriorGradual()`, `exitInteriorGradual()`, `stepInteriorTransition()` đều gọi tường minh `this.onTransitionFade(false)`.
  - Bổ sung bộ hẹn giờ an toàn tự động gỡ lớp phủ sau `520ms` trong `onTransitionFade` (`src/app/chua-online-app.mjs`) để đảm bảo **không bao giờ còn hiện tượng kẹt màn hình mờ/vàng**.

### B. Con Đường Thẳng Rợp Bóng Cây Từ `Tịnh Độ Huyền Môn` Xuống Tiệm Tạp Hóa Cuối Đường
- Mở thông toàn bộ trục đường thẳng bên phải (`x = 40.5`, rộng `9.4m`, kéo dài từ `z = +42` tới `z = -27.5`) xuyên qua **Cổng Phụ `Tịnh Độ Huyền Môn`**.
- Dựng **bảng sắt xanh chữ A “CHO XE 2 BÁNH VÀO CHÙA”** và **cây cau vua cao vút** bên phải cổng phụ sát ảnh chụp đời thực.
- Trồng hai hàng cây cổ thụ tán rộng đan mát dọc đường (`x = 35.0` & `x = 46.2`), bổ sung chậu hoa giấy, đèn cầu cổ điển và biển chỉ dẫn **“↑ ĐI THẲNG CUỐI ĐƯỜNG: TIỆM LƯU NIỆM & LỐI VÀO CHÁNH ĐIỆN”**.
- Quy hoạch **Khu Sân Mát Cuối Đường (`z = -17.5 .. -26.4`)**:
  - Dời `Giảng Đường` sang phía Đông (`x = 58.5, z = -18.0`) để mở rộng quảng trường rợp bóng cây cuối đường.
  - Đặt **Tiệm Tạp Hóa Việt Nam (`x = 48.6, z = -17.5`)** và **Quầy Lưu Niệm Phật Giáo · Tràng Hạt · Tượng Nhỏ · Nước Mát (`x = 40.5, z = -26.4`)** nhìn thẳng dọc trục đường từ cổng phụ đi vào.
  - Cập nhật đường dẫn hành hương `cua_hang_luu_niem` trong `src/logic/chua-online-logic.mjs` và sơ đồ 2D SVG trong `src/app/chua-online-app.mjs`.

### C. Hiên Bỏ Giày Dép & Hệ Cửa Gỗ Bức Bàn Trước Khi Vào Chánh Điện
1. **Hiên Bỏ Dép Rẽ Trái Cuối Đường (Ngoại thất `world x = 35.2, z = -14.5`)**:
   - Từ sân lưu niệm cuối đường rẽ trái (`-X`) bước lên **hiên gạch tàu có mái ngói che nắng mưa**, đặt **2 kệ gỗ 3 tầng xếp đầy giày dép/xăng-đan của Phật tử**, thảm xơ dừa chùi chân, biển gỗ **“CỬA VÀO CHÁNH ĐIỆN · VUI LÒNG BỎ GIÀY DÉP BÊN NGOÀI”** và **bộ cửa gỗ bức bàn 2 cánh mở rộng**.
2. **Hiên Bỏ Dép Ở Cửa Vào Nội Thất & Tam Môn Cửa Gỗ Trước Chính Điện (`src/app/vinh-trang-square-interior.mjs`)**:
   - Tại cửa bước vào hành lang phải (`+15.5, 0, +20.45`): dựng ngưỡng cửa gỗ (bậc cửa), hai cánh cửa gỗ chạm tùng cúc mở vào trong, sân gạch tàu ngập nắng bên ngoài cùng 2 kệ giày dép 3 tầng và biển nhắc lịch sự.
   - Ngay phía trước **Chính Điện** (`z = -11.55`, nhìn qua `Hồ Sen Bộ`):
     - Khắc phục hoàn toàn khoảng hở đen phía trên bằng **vách gỗ chạm lọng & bao lam kín sát trần (`y = 4.35 .. 8.85m`)**.
     - Dựng **3 bộ Cửa Gỗ Bức Bàn Thượng Song Hạ Bản (`Tam Môn` tại `x = -5.9, 0, +5.9`)** có cánh gỗ mở nghiêng, ngưỡng cửa gỗ truyền thống, hoành phi **“ĐẠI HÙNG BỬU ĐIỆN”**, câu đối sơn son thếp vàng.
     - Đặt **4 kệ gỗ 3 tầng để giày dép bên ngoài cửa (`z = -10.87`)** cùng thảm cói và biển **“👟 BỎ GIÀY DÉP BÊN NGOÀI CỬA TRƯỚC KHI VÀO CHÁNH ĐIỆN”**.

### D. Bổ Sung 3D Assets PBR Mới (Meshy 7.1), Chuẩn Hóa Đường Dẫn GLB & Tính Năng Thờ Tự
- Tích hợp 2 mô hình tượng lớn tạo mới bằng Meshy 7.1 (kèm procedural fallback an toàn trong `src/app/sculpted-buddhas.mjs`):
  - `Thiết kế giao diện/Vật phẩm 3D/meshy_assets/tuong-phat-nghin-mat-nghin-tay.glb` — Tôn tượng Thiên Thủ Thiên Nhãn Quán Thế Âm tại đầu dải bàn thờ lối phải.
  - `Thiết kế giao diện/Vật phẩm 3D/meshy_assets/cho-ngu-cua-phat.glb` — Tôn tượng Đức Phật Nhập Niết Bàn (Chỗ Ngủ Của Phật) trên đài sen gỗ trầm.
- Chuẩn hóa đường dẫn `STATUE_GLB_PATHS` & `tuong_quan_am_3d` (`quan-am-nam-hai.glb`) để triệt tiêu toàn bộ lỗi tải file `404`, đồng thời nâng chiều cao nút `A-/A+` và `0.85x` tại Học Viện Phật Học đạt chuẩn `>= 48px`.
- Hoàn thiện **Tháp Đèn Cầu An 13 tầng (`Ghi Tên Cầu Phước`)** ngay tại Chính Điện: ghi danh tín chủ + lời cầu an lưu bền vững `localStorage`, đồng bộ bảng tên vàng gắn trực tiếp lên thân tháp 3D.
- Tuyệt đối tuân thủ bảo mật: **0 khóa API Meshy (`msy_...`)** xuất hiện trong bất kỳ tệp mã nguồn hay cấu hình nào của dự án.

---

## 3. Kết Quả Kiểm Thử Tự Động & E2E (Unit Test + Playwright Desktop & Mobile)

| Hạng mục kiểm thử | Kết quả | Chi tiết |
| :--- | :---: | :--- |
| **Cú pháp ESM (`npm run build`)** | **PASS** | Kiểm tra `node --check` toàn bộ 8 module `.mjs` (`server`, `logic`, `audio`, `sculpted-buddhas`, `garment`, `square-interior`, `3d-world`, `app`). |
| **Unit Tests (`npm run lint`)** | **16 / 16 PASS** | Kiểm thử hệ màu OKLCH, 7 nhân vật, di chuyển & va chạm, nghi lễ 108 hạt, 11 giáo trình PDF, cửa hàng, Học Viện Phật Học, Hoa Đăng, 30 Ngày, Nhật Ký, Tháp Đèn Cầu An và tuyến đường hành hương mới. |
| **Desktop E2E (`1440×900`)** | **PASS** | Pre-entry (6 quốc tịch, 7 nhân vật, 4 đoàn xe) -> Cutscene xe -> Lời Phật dạy -> Audio mixer 3 kênh -> Đường thẳng `Tịnh Độ Huyền Môn` -> Tiệm Tạp Hóa Cuối Đường -> Hiên Bỏ Dép -> Chánh Điện Hình Vuông (8 khu + Mặt cắt 3D + Tháp Cầu Phước) -> Ra/vào điện `0` lỗi màn hình vàng -> Hoa Đăng -> 30 Ngày -> Nhật Ký -> Đổi 7 nhân vật & mặc pháp phục -> Học Viện Phật Học (`VINHTRANG2026`, chặn nộp quiz trống, thi tốt nghiệp, chứng nhận PNG, 11/11 PDF HTTP `200`). |
| **Mobile E2E (`390×844`)** | **PASS (`0px` tràn ngang)** | Kiểm tra `scrollWidth - innerWidth === 0` trên toàn bộ màn hình Sân Chùa 3D, Nội Thất Hình Vuông, Cửa Hàng Pháp Phục và Học Viện Phật Học; nút thao tác chính đảm bảo `>= 48px`. |
| **Console / Page / HTTP Errors** | **0 lỗi** | `0` console error, `0` uncaught page error, `0` lỗi HTTP `404/500`. |

---

## 4. Cập Nhật Hiệu Ứng Nghi Lễ 3D & Đường Vào Bên Phải (Theo Ảnh Thực Tế)

### A. Chuỗi Hoạt Ảnh Dâng Hương & Dâng Hoa Mượt Mà (Ngoài Sân & Trong Chánh Điện)
- Tạo mới `src/app/world/offering-ritual-fx.mjs` (mixin gắn vào `VinhTrang3DWorld` qua `applyMixins`, zero-GC scratch vectors `THREE.Vector3`, tương thích `isSoftwareGl` pacing):
  - **Dâng hương (`startIncenseOfferingSequence`)**: Kích hoạt cử chỉ `'Thắp nhang'`, tự động chọn lư hương gần nhất (ngoài sân hoặc 3 bàn thờ Tam Bảo / Tổ Đạt Ma / Quán Âm trong Chánh điện), nâng bó 3 nén hương phát sáng từ tay Phật tử, lướt theo đường cong Bézier êm ái tới lư hương, hạ dịu vào tro hương kèm ánh sáng vàng ấm (`PointLight`), tỏa 14 làn khói trầm uốn lượn và lưu vĩnh viễn cụm hương lên lư.
  - **Dâng hoa sen (`startLotusOfferingSequence`)**: Kích hoạt `'Chắp tay'`, xuất phát từ búp sen khép nhẹ trên tay (`lotus.userData.lotusAnimRefs`), bay vòng cung nhẹ xuống Hồ Sen chính, Hồ Sen Bộ nội thất hoặc bàn thờ Tam Bảo và hé nở từng lớp cánh sen hồng vàng, gợn 2 vòng sóng hào quang và 10 hạt sáng bừng lên trước khi giữ nguyên đóa sen nở vĩnh viễn.
  - Đóng modal ngay trước khi kích hoạt nghi lễ trong `src/app/ui/shop-and-rituals.mjs` để người dùng quan sát trọn vẹn hoạt ảnh 3D và chống trùng lặp khi bấm nhanh liên tiếp.

### B. Tái Tạo Toàn Bộ Lối Vào Bên Phải (`Tịnh Độ Huyền Môn` -> Cuối Đường)
- Tạo mới `src/app/world/right-entrance-road.mjs` và cập nhật `materials-and-lights.mjs`, `temple-grounds.mjs`, `pond-and-gardens.mjs` dựa trên ảnh chụp thực tế cổng phụ & flycam:
  - **Mặt đường bê tông sáng (`concreteRoadTex`)**: Thay mặt đường tối sẫm bằng bê tông sáng có khe co giãn tự nhiên; gỡ bỏ 9 cây cầu tròn tối màu che hầm đường, 6 bệ đèn cầu vàng và nhà sàn đóng cọc dưới kênh.
  - **Sườn trái (giáp Chánh Điện)**: Dựng hàng rào sắt sơn đỏ truyền thống trên gờ kem + trụ gạch (`x = 35.3`), bồn hoa thấp giữ thoáng 100% tầm nhìn kiến trúc vòm vàng & mái ngói Chánh Điện, kèm mái hiên xanh **“TỦ SÁCH VĨNH TRÀNG · PHÁT HÀNH KINH SÁCH”**.
  - **Sân trước phải & dọc lề phải**: Lát sân gạch tàu (`sideBrickTex`), bồn cỏ viền kem trưng bày 4 tôn tượng Phật / Bồ Tát đá trắng, **Nhà Giữ Xe 2 Bánh Phật Tử** với 5 xe máy gọn gàng, **Quầy Dừa Xiêm · Nước Mát Ven Đường** dưới tán dù xanh dương (tương tác được), dãy **Trai Đường · Nhà Khách Bổn Tự** lùi sâu bên phải, hàng cột đèn tay cong cổ điển, cột điện bê tông kèm dây điện uốn võng thực tế, dây cờ Phật giáo căng cao (`y = 5.45m`), cây dừa tán rủ cong tự nhiên và các cây bóng mát tán cao thoáng (`y >= 5.2m`).

---

## 5. Nâng Cấp Đường Vào Bên Phải, Khúc Rẽ Trái, Không Gian Nội Thất Sau Cửa Vào & Vị Trí Trống Bát Nhã

### A. Đường Vào Bên Phải Dài Rộng & Sân Rẽ Trái Cuối Đường Thoáng Đãng + NPC Hoạt Động
- Mở rộng trục đường bê tông bên phải lên **`12.6m` (`x = 41.8`, dài `85m` từ `z = +43` tới `-42`)** và mở rộng sân gạch rẽ trái cuối đường **`endTurnPlaza` (`18.6m × 24.0m` tại `x = 42.5, z = -20.0`)** cùng dải nối sang Giảng Đường (`x = 66.5, z = -18.0`), lùi toàn bộ hàng cây, quầy dừa, nhà giữ xe, Tiệm Tạp Hóa (`x = 54.8, z = -21.5`) và Quầy Lưu Niệm (`x = 41.8, z = -37.5`) để lối đi bộ hoàn toàn thông thoáng.
- Mở rộng hiên bỏ giày dép **`Cửa Vào Chánh Điện` (`rightCornerGate`)** lên `8.6m`, kéo dài mái che phủ kín vách nối, bổ sung **2 băng ghế sân** hai bên hiên cho Phật tử ngồi nghỉ thay dép.
- Bổ sung 3 tuyến NPC hành hương mới (`B2` trong `src/app/world/characters-npcs.mjs`) đi dọc suốt con đường bên phải xuống tới cuối đường, rẽ trái vào cửa Chánh Điện và ghé Quầy Lưu Niệm; đồng thời cập nhật `stepSimulation()` để NPC ngoài sân lẫn trong Chánh Điện vận động đồng bộ.

### B. Không Gian Nội Thất Sau Cửa Vào Thực Tế, Thoáng Rộng & Có Ghế Ngồi Đầy Đủ
- Dựng vách kiến trúc Pháp – Việt khép kín dọc tường Đông (`x = +25.0`) với hệ cửa sổ vòm chớp xanh, lam gỗ trầm và ánh sáng thiên tỉnh dịu ấm (`src/app/vinh-trang-square-interior.mjs`), thay thế các sạp ăn / giường ngủ giả lộ thiên không sát thực tế trước đây bằng **Phòng Tiếp Khách · Tủ Kinh Sách Vĩnh Tràng** (2 tủ kinh sách + 2 bộ bàn ghế **Trường Kỷ** tiếp trà).
- Giảm mật độ án thờ dải bên phải xuống chỉ còn **2 bàn thờ chính sát tường Đông** (**Phật Bà Nghìn Mắt Nghìn Tay** tại `z = +2.0` và **Chỗ Ngủ Của Phật** tại `z = -6.5`), triệt tiêu 404 từ đường dẫn GLB không tồn tại để dựng tượng Nghìn Mắt Nghìn Tay nhũ vàng sạch lỗi; mở rộng lối rẽ trái sau cửa vào và đặt thêm **5 băng ghế gỗ có tựa lưng (`buildCarvedBench`)** dọc hành lang Đông – Nam.
- Kích hoạt **5 NPC đi bộ & chiêm bái lưu động bên trong Chánh Điện (`interiorWalkingRecords`)** cùng các Phật tử quỳ lễ và đứng trò chuyện tại Phòng Tiếp Khách.

### C. Đặt Trống Bát Nhã Đúng Thực Tế Bên Cửa Vào Chánh Điện Đối Diện Hòn Non Bộ
- Di chuyển **Trống Bát Nhã** ra ngay **bên phải cửa chính Chánh Điện (`+2.95, 0, -11.55`)**, đối xứng với **Tháp Đèn Cầu An (`-2.95, 0, -11.65`)** và hướng thẳng mặt trống qua khoảng sân thiên tỉnh **Hồ Sen Bộ / Hòn Non Bộ**, gắn bảng tên **“🥁 TRỐNG BÁT NHÃ · ĐỐI DIỆN NON BỘ”** và lồng mặt trống procedural vào `placeholder` để khi nạp `trong-bat-nha.glb` không còn chồng mặt.
- Kiểm chứng ảnh chụp thực tế 3D (5 góc ngoại/nội thất + góc cận Trống Bát Nhã & sân rẽ trái): **0 lỗi console, 0 lỗi HTTP 404, 20/20 unit tests PASS**.

---

## 6. Chuẩn Hóa Hướng Tượng Phật Chánh Điện (Quay Ra Cổng Tam Quan), Lối Đi Vòng & 18 Vị La Hán Xung Quanh

- **Cửa vào đối diện Hòn Non Bộ (`x = -15.2`)**: Giữ nguyên cửa gỗ bức bàn, kệ để dép bên ngoài cửa (`👟 XIN BỎ GIÀY DÉP NGOÀI CỬA`), **Trống Bát Nhã** và **Tháp Đèn Cầu An** đối diện Hòn Non Bộ.
- **Phật ở giữa quay ra ngoài hướng Cổng Tam Quan (`src/app/vinh-trang-square-interior.mjs`)**:
  - Đặt **Ban Thờ Tam Bảo** tại trung tâm Chánh Điện (`x = -25.2, z = 0`) và xoay `rotation.y = -Math.PI / 2` để kim thân Đức Phật quay hướng ngược lại (`-X`), nhìn thẳng ra **Mặt Tiền 5 Vòm Pháp – Việt & Cổng Tam Quan (`x = -41.4`)** có ánh nắng sân trước chiếu vào.
  - Sau lưng Ban Thờ Tam Bảo (phía cửa Hòn Non Bộ) dựng **Bình Phong Hậu Bệ sơn son thếp vàng** kèm biển chỉ dẫn *“← ĐI VÒNG HAI BÊN LÊN CHÁNH ĐIỆN · CHIÊM BÁI PHẬT (QUAY RA CỔNG TAM QUAN) →”* và thảm đỏ dẫn hai lối **đi vòng** rộng `>5m` bên Bắc & bên Nam.
- **Không gian lễ Phật phía trước (`x = -27 .. -41`) & 18 Vị La Hán xung quanh**:
  - Đặt **Bao Lam thếp vàng (`x = -29.8`)**, **Cặp Long Trụ (`x = -30.6`)**, **4 Nhang Khoanh Đồng**, **2 hàng Bồ đoàn quỳ lễ (`x = -31.8, -35.0`)**, **Đại Hồng Chung & Chuông Gia Trì (`x = -27.2, z = ±7.8`)** ngay phía trước mặt Phật.
  - Dải **18 Vị La Hán (9 vị dãy Bắc + 9 vị dãy Nam)** trải đều từ `x = -18.8` đến `x = -38.0` bao quanh toàn bộ Chánh Điện quanh tôn tượng Phật ở giữa.
- **Đồng bộ điều hướng, va chạm, camera, nghi lễ & NPC**:
  - Mở rộng giới hạn di chuyển (`movement.mjs` `minX = -40.6`) và giới hạn camera (`player-and-interaction.mjs` `cx >= -40.8`).
  - Cập nhật điểm nhìn mặc định `goToInteriorZone('chanh_dien')` đứng ở gian lễ chính (`-36.0, 0`, nhìn `+X` thẳng lên Phật ở giữa và 18 La Hán xung quanh), sửa góc `ho_sen_bo` (`7.4, 2.4`) không vướng cột, hỗ trợ lối ra `front_tam_quan`, cập nhật tọa độ lư hương/dâng sen Tam Bảo (`offering-ritual-fx.mjs`) và tuyến Sư Thầy đi vòng quanh Chánh Điện (`characters-npcs.mjs`).



---

## 7. Nâng Cấp Di Chuyển 3D Mượt, Giao Diện Tối Giản Cho Cô Bác, Sổ Hành Hương Liên Chùa & Đồng Bộ Firebase

### A. Hệ Di Chuyển 3D, Camera Damping & Tìm Đường A* Tránh Vật Cản (Phase 1)
- Tạo mới `src/logic/modules/pathfinding-and-collision.mjs` tích hợp vào `src/app/world/movement.mjs`, `player-and-interaction.mjs`, `render-loop-and-cutscene.mjs`:
  - **Va chạm 3 lượt (`resolveMultiPassCollision`)**: Triệt tiêu rung giật và kẹt góc khi đi sát hồ sen, cột, bàn thờ.
  - **Tìm đường lưới A* 8 hướng + làm mượt đường đi (`buildNavigationGrid`, `findGridPathAStar`, `smoothGridPath`)**: Click-to-walk và nút 1 chạm tự động đi vòng tránh vật cản ngoài sân lẫn trong Chánh Điện, có bộ phát hiện kẹt (`_stuckTracker`) tự động tính lại đường đi.
  - **Camera gimbal mượt (`updateCameraDamped`)**: Nội suy hàm mũ (exponential damping) triệt tiêu nhảy góc nhìn 1-frame khi đi qua vùng tượng lớn; tự xoay nhẹ theo hướng bước đi và tạm dừng `2.2s` sau khi người dùng tự kéo xoay camera.
  - **Cần gạt mềm (`#soft-joystick-zone`)**: Hỗ trợ kéo analog mượt trên điện thoại và máy tính bảng.

### B. Giao Diện Thân Thiện Cho Cô Bác Lớn Tuổi & Màn Hình Tiêu Đề 3D Sống Động
- Thay thế bộ HUD ~30 nút + thanh XP/cấp bậc rời rạc trên sân chùa bằng bố cục thanh tịnh (`src/app/ui/shell-dom.mjs`, `src/styles/12-elder-hud-passport.css`):
  - **Live 3D Title Overlay (`#temple-title-overlay`)**: Camera xoay chậm quanh sân chùa với nút chính **"Bắt đầu đi chùa"** (`Enter`/`Space`), không dùng `backdrop-filter` trên WebGL và không có chấm nhấp nháy.
  - **Thanh trên 3 vùng gọn nhẹ (`#main-top-hud`)**: `Chùa Vĩnh Tràng · [Ngày Âm lịch] · Dấu mộc X/10` bên trái; `Âm thanh · Đăng nhập · Tiện ích` bên phải.
  - **Thanh đáy 4 nút lớn `>=54px` (`#elder-bottom-dock`, thu gọn được bằng phím `H`)**: `Đi tiếp: [Tên trạm]` (1 chạm A*), `Lễ / Dâng hương`, `Sổ Hành Hương`, `Nghe Kinh`.
  - **Ngăn kéo Tiện ích (`#temple-utility-drawer`)**: Gom gọn Vào Chánh Điện, Bản đồ & 18 La Hán, Rút Quẻ Bình An, Thả Hoa Đăng, Tháp Đèn Cầu An, Chụp Ảnh Sạch HUD, Cửa Hàng Hợp Nhất (Trang phục 3D + Quà lưu niệm), Học Viện, Sáng/Trưa/Tối, Cỡ chữ `A-/A+` và đồng bộ Google Cloud.

### C. Sổ Hành Hương Liên Chùa, Hoạt Động 30 Ngày & Firebase Auth / Firestore (Phase 2)
- Tạo mới `src/logic/modules/pilgrimage-passport.mjs`, `src/app/firebase-sync.mjs`, `src/app/ui/passport-and-cloud.mjs`, `firestore.rules`, `firebase-blueprint.json`:
  - **Sổ Hành Hương theo `templeId`**: Sẵn sàng cho `vinh_trang` (đang mở) cùng mục lục `thien_mu`, `truc_lam`, `chua_huong` (sắp mở), gồm 5 trang: Mục lục Chùa, Dấu Mộc đỏ (10 Di Sản & 18 La Hán 1907 có đọc chậm `0.85x`), Nhật Ký & Cầu Nguyện (có câu mẫu 1 chạm), Vườn Sen 30 Ngày (tưới 1 lần/ngày thật, 4 giai đoạn lớn, lưu tủ hoa mãn khai), và Quẻ Bình An 30 quẻ + Ảnh Kỷ Niệm Sạch HUD.
  - **Đồng bộ Google & Hồ Hoa Đăng Cộng Đồng Real-time**: Đăng nhập Google (`signInWithPopup`) hợp nhất dữ liệu local + Firestore (`users/{uid}`, `users/{uid}/temples/{templeId}`, `users/{uid}/journalEntries/{entryId}`); hiển thị Hoa Đăng cộng đồng (`templeLanterns`) bấm trực tiếp trên mặt Hồ Sen 3D để đọc lời nguyện và bấm **“🙏 Tùy hỷ · Gửi chúc lành”** cập nhật thời gian thực.
  - **Kiểm thử**: `npm run build` PASS và `26/26` unit tests PASS (`npm run lint`).

---

## 8. Thiết Kế Lại Khu Cuối Đường Bên Phải Đúng Thực Tế Chùa Vĩnh Tràng

Dựa trên ảnh flycam thực tế Chùa Vĩnh Tràng (`public/assets/aistudio/image_97204806.png`), ảnh cổng phụ (`image_bb72a8b0.png`) và phản hồi thực tế của người dùng:
- **Quầy Lưu Niệm dạng "căn nhà nhỏ dựng tạm có đồ đầy đủ" (`src/app/world/grocery-halls-statues.mjs`, vị trí `x = 42.2, z = -33.5`)**:
  - Thay thế mái chòi hở 3 trụ cũ bằng **nhà ki-ốt dựng tạm kín 3 mặt** có nền gạch nâng cao, khung cột thép hộp sơn xanh + thanh giằng chéo, vách lamri gỗ + tấm kem, **2 cửa sổ hông chống lên bằng thanh sắt**, mái tôn xanh dốc kèm mái hiên vươn rộng, máng xối nhôm và đèn sợi đốt ấm bên trong.
  - Bày biện đầy đủ hàng hóa thực tế: **kệ 4 tầng kín vách sau** (hộp nhang trầm, dãy kinh sách Phật học, hộp nhang vòng, tượng Phật thếp vàng & Quan Âm sứ trắng, đèn hoa sen, hộp quà Chùa Vĩnh Tràng), **tủ mát kính đứng nước giải khát** có 24 chai nước & két nước nhựa, **tủ kính trưng bày** có khay nhung đựng tràng hạt gỗ/đá, sổ tay hoa sen & bưu thiếp, ống nhang, giỏ dừa xiêm tươi, **2 dãy nón lá, túi vải hoa sen và dây khánh treo dưới mái hiên**, thùng đá giữ lạnh và bộ bàn ghế gỗ nhỏ nghỉ chân.
  - Đặt 2 nhân viên đứng gọn trên mặt nền quầy (`yOffset: 0.18`) sau quầy bán (`src/app/world/characters-npcs.mjs`), biển hiệu tiếng Việt chuẩn chùa Việt: **`QUẦY LƯU NIỆM · VĂN HÓA PHẨM PHẬT GIÁO`**.
- **Thiết kế lại toàn bộ bên phải sân rẽ trái đúng thực tế Chùa Vĩnh Tràng (bỏ tiệm tạp hóa trùng lặp gây hiểu nhầm quầy cúng dường)**:
  - Thay dãy tạp hóa cũ bằng **2 bồn vườn cây kiểng viền đá kem** (bonsai, bụi hoa, đèn đá cổ), **3 băng ghế đá công viên chùa** dưới bóng mát và **Trạm `TRÀ ĐÁ MIỄN PHÍ · KÍNH MỜI PHẬT TỬ`** (mái ngói nhỏ, bình trà đá inox có vòi rót, khay ly sứ — nét đẹp đặc trưng chùa miền Tây).
  - Mở lối lát đá rộng (`5.4m`) xuyên giữa 2 bồn cây dẫn thẳng vào dãy **`VĂN PHÒNG BAN TRỊ SỰ · GIẢNG ĐƯỜNG HUỆ ĐĂNG`** (`x = 64.5, z = -18.0`) được nâng cấp kiến trúc đầy đủ hành lang 7 cột, lan can, cửa sổ lá sách xanh Nam Bộ, mái dốc xám nâu và đầu hồi gắn Bánh xe Pháp luân vàng khớp ảnh flycam thực tế.
  - Gỡ bỏ bảng xanh quá khổ chắn ngang lối đi (`pond-and-gardens.mjs`), thay bằng cột biển chỉ dẫn gỗ 3 hướng nhỏ gọn sát lề phải (`← LỐI VÀO CHÁNH ĐIỆN`, `↑ QUẦY LƯU NIỆM`, `→ GIẢNG ĐƯỜNG · NHÀ KHÁCH`); điều chỉnh trụ đèn/cột điện (`right-entrance-road.mjs`), đường đi NPC (`characters-npcs.mjs`) và tọa độ trạm (`world-data.mjs`).

---

## 9. Kéo Dài Hành Lang Bàn Thờ Nội Thất (~77m) & Chuyển Ngoại Cảnh Sang Đô Thị TP. Mỹ Tho + Công Viên Vĩnh Tràng (Theo OSM GeoJSON)

Dựa trên 2 ảnh chụp màn hình thực tế (`image_e1273117.png`, `image_c73a4f25.png`) và file bản đồ OpenStreetMap GeoJSON chính xác của Chùa Vĩnh Tràng (Phường 8, TP. Mỹ Tho, Tiền Giang):
- **Hành lang bên phải trong chùa (`Lối Phải · Dãy Bàn Thờ Phật`, `src/app/vinh-trang-square-interior.mjs`)**:
  - Kéo dài toàn bộ hành lang Đông từ `58.8m` lên **`77.2m`** (`z = +20.8 .. -56.4`, khớp kích thước thực của cụm kiến trúc Chùa Vĩnh Tràng `way/695981299` ~77.2m trong GeoJSON).
  - Kéo dài thảm đỏ hoa sen (`74m`), mở rộng giãn cách 8 khám thờ tượng Phật GLB thành `8.8m`/khám (`z = +13.0 .. -48.6`), bổ sung hệ cột sơn son, cửa sổ vòm lấy sáng (12 cửa Đông + 6 cửa Tây), ghế gỗ, tủ kinh sách, bộ tiếp khách và đèn hành lang dọc suốt chiều sâu.
  - **Bịt kín khe hở bầu trời** trên đỉnh và bên trái vòm cổng Bắc (`z = -56.0`) bằng vách đầu hồi (`northWestWingCap`), dải cổ trần (`spandrelBand`) và tường đỉnh kịch trần (`exitHeaderWall`) nối khớp với hệ vì kèo gỗ.
  - Đồng bộ giới hạn di chuyển/cổng chuyển cảnh (`movement.mjs`: `minZ = -55.6`), camera & điểm tương tác (`player-and-interaction.mjs`), điểm nhảy khu vực (`time-and-interior.mjs`) và lộ trình NPC nội thất (`characters-npcs.mjs`).
- **Ngoại cảnh đô thị TP. Mỹ Tho & `Công Viên Vĩnh Tràng` (`exterior-town.mjs`, `temple-grounds.mjs`, `residential-lane.mjs`, `render-loop-and-cutscene.mjs`)**:
  - **Xóa toàn bộ cảnh nông thôn sai thực tế**: bỏ lề đường đất đỏ bùn (`dirtShoulderNorth/South`, `dirtLaneWest/East`), bỏ mương lục bình trước mặt tiền, bỏ nhà cấp 4 mái tôn xanh có lu nước giữa bãi cỏ trống, bỏ bụi tre ven đường và dãy gò đồi xanh nông thôn ở chân trời.
  - **Đường Nguyễn Trung Trực chuẩn đô thị TP. Mỹ Tho**: cắt gọn mép bê tông cổng không tràn đè lên lòng đường nhựa, bổ sung **vỉa hè lát gạch đô thị hai bên**, **bó vỉa đá**, **vạch kẻ đường vàng/trắng**, **2 vạch sang đường cho người đi bộ** nối thẳng từ Cổng Tam Quan (`x = 23`) và Cổng Phụ (`x = 40.5`) sang công viên, biển tên đường xanh **`ĐƯỜNG NGUYỄN TRUNG TRỰC`**, cây xanh vỉa hè trồng trong bồn vuông và trụ đèn đường đô thị hiện đại.
  - **Dựng `Công Viên Vĩnh Tràng` chuẩn OSM GeoJSON (`way/266761436`)** đối diện chùa qua đường: bãi cỏ công viên xanh sạch viền bó vỉa & hàng rào cây cắt tỉa, bảng đá **`CÔNG VIÊN VĨNH TRÀNG · TP. MỸ THO`**, **quảng trường lối đi hình tròn (`way/1147384259`)** ở trung tâm có đảo hoa & đài phun nước đá 2 tầng, trục lối đi lát gạch Bắc–Nam (`way/1147384277`, `way/1147384260`), 10 ghế đá công viên, 10 trụ đèn cầu đôi và bóng cây cổ thụ.
  - **Dãy nhà phố đô thị 2–3 tầng TP. Mỹ Tho** dọc 2 bên Công viên Vĩnh Tràng (mặt tiền cửa kính/cửa cuốn, mái hiên, ban công lan can sắt, cục nóng điều hòa, biển hiệu thực tế: `CÀ PHÊ · GIẢI KHÁT`, `HOA TƯƠI · TRÁI CÂY`, `HỦ TIẾU MỸ THO`, `NHÀ THUỐC TÂY`, `CỬA HÀNG TẠP HÓA`, `TIỆM BÁNH · NƯỚC MÁT`, `VẬT PHẨM PHẬT GIÁO`) cùng đường chân trời nhà phố thấp tầng.
  - **Sửa lỗi xe ô tô trắng bị xoay chéo leo vỉa hè**: tự động phát hiện trục dài của mô hình GLB trong `buildGLBRoadVehicle`, sửa góc xoay cutscene (`-Math.PI / 2`) và đặt bãi đỗ xe song song gọn gàng sát lề đường.



---

## 10. Xây Lại Toàn Chỉnh Đường Thẳng Ngoài Cổng Chùa Vĩnh Tràng Theo Google Earth / OSM GeoJSON & Ảnh Thực Tế

Dựa trên phản hồi thực tế từ ảnh chụp góc nhìn từ Cổng Phụ (`image_a818687c.png`), ảnh cổng thực tế (`image_bb72a8b0.png`) và dữ liệu bản đồ Google Earth / OSM GeoJSON (`way/266761436`, `way/1147384259`):
- **Con đường thẳng dài `170m` không vạch phân giao thông (`src/app/world/temple-grounds.mjs`)**:
  - Gỡ bỏ hoàn toàn trục đường cắt ngang ngay sát cổng, vạch kẻ vàng giữa đường, vạch trắng biên và vạch ngựa vằn sang đường.
  - Xây trục **đường nhựa xám trơn thẳng tắp dài `170.5m` (`x = 33.7 .. 47.3`, rộng `13.6m`, từ `z = 41.5` tại Cổng Phụ kéo thẳng về Nam tới `z = 212.0`)**, nối thông ra đại lộ **Đường Nguyễn Trung Trực** ở cuối tầm nhìn (`z = 205`), kèm bó vỉa & vỉa hè đô thị 2 bên và biển xanh **`ĐƯỜNG VÀO CHÙA VĨNH TRÀNG`** / **`ĐƯỜNG NGUYỄN TRUNG TRỰC`**.
- **Bên phải nhìn từ cổng ra (phía Tây trục đường thẳng) — `Công Viên Vĩnh Tràng` (`src/app/world/exterior-town.mjs`)**:
  - Dựng lại toàn bộ **Công Viên Vĩnh Tràng** trải dài `114m` theo hướng Bắc–Nam (`x = -26.0 .. +31.2, z = 54.0 .. 168.0`, đúng hình học GeoJSON `way/266761436`), có 3 lối mở lát gạch nối thẳng ra đường lớn (`z = 70, 104, 138`), bia đá **`CÔNG VIÊN VĨNH TRÀNG · TP. MỸ THO`** quay thẳng ra đường, quảng trường tròn lát gạch + đài phun nước hoa sen 2 tầng, 12 ghế đá, 12 trụ đèn công viên và hàng cây xanh bóng mát.
- **Bên trái nhìn từ cổng ra (phía Đông trục đường thẳng) — Phố Mỹ Tho & `Bãi Giữ Xe Ô Tô · Xe Du Lịch`**:
  - Dựng dãy phố đô thị TP. Mỹ Tho liên tục dọc 150m vỉa hè Đông (`CÀ PHÊ · GIẢI KHÁT`, `HOA TƯƠI · NHANG ĐÈN`, 2 quán gia đình tương tác `Nhà Cô Ba · Hủ tiếu Mỹ Tho` tại `z = 75` & `Bếp Dì Sáu · Bánh bèo & chè` tại `z = 89` trong `residential-lane.mjs`, tiếp nối `NƯỚC DỪA XIÊM`, `CỬA HÀNG TẠP HÓA`, `TIỆM BÁNH`, `NHÀ THUỐC TÂY`, `VẬT PHẨM PHẬT GIÁO`) cùng hàng cây đô thị và trụ đèn đường chạy thẳng suốt 170m.
  - Bố trí **`BÃI GIỮ XE Ô TÔ · XE DU LỊCH`** rộng rãi ngoài chùa (`x = 48.5 .. 78.0, z = 102 .. 138`) có biển chỉ dẫn lớn, nhà mái tôn để 10 xe máy, xe khách & ô tô đỗ gọn bên trong cùng dãy xe du lịch/ô tô gia đình đỗ dọc lề xa (`z = 146 .. 174`) đúng cảnh mùa cao điểm / mùa Tết xe đỗ bên ngoài để du khách đi bộ vào chùa.
- **Dòng người đi bộ nhộn nhịp mùa Tết / cao điểm & điều chỉnh giao thông (`characters-npcs.mjs`, `road-traffic.mjs`, `render-loop-and-cutscene.mjs`, `world-data.mjs`)**:
  - Bổ sung **15 lộ trình Phật tử, gia đình, trẻ em, khách tham quan đi bộ hai chiều** tấp nập dọc con đường thẳng dài từ bãi xe ngoài (`z = 148`) đi thẳng vào Cổng Phụ và tản bộ trong Công viên Vĩnh Tràng.
  - Chuyển xe qua lại về đại lộ **Đường Nguyễn Trung Trực** phía xa (`z = 202..208`), xe đưa đón chạy thẳng dọc trục đường ngoài vào `Bãi Giữ Xe` trả khách đi bộ vào chùa; đồng bộ cutscene đến chùa chạy thẳng từ Nam lên Bắc hướng thẳng vào Cổng Phụ và mở rộng `WORLD_BOUNDS.maxZ = 158.0`.

---

## 11. Cải Thiện Toàn Diện Đường Đất Bụi Mỹ Tho, Sắp Xếp Tượng Chuẩn Flycam, Vào Cửa Trước Chánh Điện, Chống Out Nội Thất, Cử Chỉ Tự Nhiên & Cửa Hàng Màn Hình Chính

Dựa trên phản hồi thực tế từ ảnh chụp lỗi (`image_eeb3bc31.png`) và đối chiếu trực tiếp ảnh flycam thực tế Chùa Vĩnh Tràng (`image_97204806.png`):
- **Đường cũ Mỹ Tho gồ ghề, đất bụi đúng thực tế (`src/app/world/temple-grounds.mjs`)**:
  - Thay mặt đường nhựa hộp phẳng bằng lưới chia mịn (`PlaneGeometry(13.6, 170.5, 18, 96)`) có độ gồ ghề lượn sóng tự nhiên (`±0.035m..0.056m`), rãnh vết bánh xe mờ, mảng vá nhựa cũ, vết nứt rạn chân chim và sắc nâu vàng đất bụi tràn từ hai mép lề; bổ sung **2 dải lề đất bụi nâu đỏ miền Tây** gồ ghề, sỏi vụn, bụi cỏ dại và bó vỉa bê tông cũ từng đoạn hơi lệch cao độ.
- **Sắp xếp lại toàn bộ Tượng Phật ngoài trời chuẩn ảnh flycam thực tế (`world-data.mjs`, `grocery-halls-statues.mjs`, `temple-grounds.mjs`, `gates-and-discovery.mjs`, `characters-npcs.mjs`)**:
  - **Tượng Phật Di Lặc ngồi (20m)**: tọa lạc bên Tây sân trước tại `(-26.5, 4.0)` quay mặt ra Nam (`+Z`).
  - **Tượng Phật A Di Đà đứng (18m)**: dời khỏi khoảng trước mặt Chánh Điện sang đúng trục trung tâm–Tây Bắc `(-9.5, -23.5)` ngay phía trước **Bảo Tháp 7 tầng** `(-9.5, -44.5)`.
  - **Tượng Phật Thích Ca Nhập Niết Bàn (32m)**: đặt ngay phía sau mái ngói Chánh Điện tại `(14.5, -49.0)`, kế bên Bảo Tháp 7 tầng (rút gọn khối ngoại thất Chánh Điện kết thúc tại `rearZ = -34.5` để lộ rõ pho tượng nằm từ sân trước; dời `Hồ Phóng Sinh` về `(-28.0, -58.5)` và `Nhà Tổ` về `(14.5, -72.0)`).
  - **Gỡ `pond2` chắn giữa sân trước Chánh Điện**: mở rộng đại lộ đá lát sạch sẽ giữa Di Lặc và Chánh Điện đúng ảnh thực tế, đồng thời xóa triệt để lỗi NPC đi đứng ngập trong hồ sen.
- **Mở lối vào Chánh Điện từ ngay Cửa Trước & Chống tự out khi đi trong Chánh Điện (`chanh-dien-exterior.mjs`, `time-and-interior.mjs`, `movement.mjs`, `player-and-interaction.mjs`, `render-loop-and-cutscene.mjs`, `world3d-bridge.mjs`)**:
  - Bổ sung thảm đỏ bậc thềm, ánh đèn đón khách, vùng bấm `frontDoorClickTargets` và nút tương tác **`🚪 [E] Vào Chánh Điện (Cửa Trước)`** ở bậc thềm trước (`x = 18..28, z = 7.2..14.5`), bước vào thẳng chính gian thờ Tam Bảo & 18 Vị La Hán (`x = -35.5, z = 0.0`).
  - Xóa cơ chế tự động đá người chơi ra ngoài trong `checkInteriorDoorTransition()` khi đi sát mép tường nội thất; thay bằng 3 điểm hỏi chủ động bấm `[E]` (`Ra ngoài sân chùa (Cửa hông)`, `Ra vườn Phật Nằm & Bảo Tháp`, `Ra sân trước Chánh Điện`).
- **Sửa góc nhìn Camera & Di chuyển mượt mà (`player-and-interaction.mjs`, `movement.mjs`)**:
  - Nâng cao tầm camera góc nhìn thứ ba (`camHeight = 2.72m` ngoài sân, `2.28m` trong điện), hạ góc ngước `lookY` (`1.88m` thông thường, `4.2–4.6m` gần tượng lớn) giúp nhân vật luôn hiển thị rõ ràng phía trên thanh nút đáy; camera chỉ tự xoay theo lưng khi đi thẳng (`normZ < -0.55 && Math.abs(normX) < 0.45`), không còn giật ngược khi đi ngang `A`/`D`.
- **Cải thiện toàn diện cử chỉ nhân vật, bạn đồng hành & NPC có mục đích (`render-loop-and-cutscene.mjs`, `characters-npcs.mjs`, `passport-and-cloud.mjs`)**:
  - Bổ sung đạo cụ điện thoại 3D cầm tay & hệ thống hoạt ảnh khung xương tự nhiên: **`📸 Chụp ảnh`**, **`🤳 Selfie`** (tự chuyển góc camera trước Selfie chụp lưu vào Sổ Hành Hương), **`💬 Nói chuyện bố mẹ`** (mời bố mẹ đi cùng nếu đang đi một mình, quay mặt gật đầu trò chuyện ấm áp), **`🙏 Vái lễ`**, **`👋 Vẫy tay`**, **`🪷 Ngắm cảnh`**, cùng nhịp thở & đảo mắt nhẹ khi đứng yên.
  - Bạn đồng hành có ngưỡng dừng mượt tránh bám gót vô nghĩa, tự quay ngắm tượng Phật khi dừng hoặc quay lại gật đầu/vẫy tay khi trò chuyện & chụp Selfie; NPC quanh sân chủ động dừng chụp ảnh, selfie, trò chuyện theo cặp và quạt mát.
- **Đưa `🛍️ Cửa hàng` & `✨ Cử chỉ` trực tiếp ra màn hình chính (`shell-dom.mjs`, `12-elder-hud-passport.css`, `modal-and-events.mjs`)**:
  - Thêm nút **`🛍️ Cửa hàng`** và **`✨ Cử chỉ`** (bật/tắt dải 6 cử chỉ gọn gàng ngay trên thanh đáy) trực tiếp lên thanh công cụ chính `#elder-bottom-dock`.

## 12. Cải Tạo Công Viên Vĩnh Tràng, Sửa Tượng Quan Âm Bay, Xóa Gã Đàn Ông Theo Đuôi, Nhà Lưu Niệm Đi Vào Trong, Nhà Vệ Sinh Sân Sau, Sửa Lỗi Cửa Hông & Cân Bằng Tải Chánh Điện

Dựa trên phản hồi thực tế và đối chiếu ảnh thực địa Chùa Vĩnh Tràng – Mỹ Tho:
- **Thiết kế lại Công Viên Vĩnh Tràng đậm chất Mỹ Tho (`src/app/world/exterior-town.mjs`)**:
  - Thay thảm cỏ đơn điệu bằng quảng trường lát đá mài/gạch vỉa hè đan xen, bồn hoa xây gạch trồng hoa giấy & cúc vạn thọ, đài phun nước đài sen có tia nước, nhà lục giác mái ngói đỏ, cụm **máy tập thể dục công viên sơn vàng–xanh** đặc trưng công viên Việt Nam, hàng cau cao, ghế đá công viên và bảng **`CÔNG VIÊN VĨNH TRÀNG`**.
- **Sửa triệt để Tượng Phật Quan Âm bay lơ lửng (`src/app/world/glb-loading.mjs`, `src/app/world/grocery-halls-statues.mjs`)**:
  - Hạ cao độ đặt tượng GLB từ `2.68 - box2.min.y` về đúng mặt đài sen `1.82 - box2.min.y` (khớp đỉnh bệ `1.825m`) và đưa vòng hào quang `qaHalo` vào danh sách `quanAmPlaceholderParts` để gỡ hoàn toàn khi tượng 3D tải xong.
- **Xóa gã đàn ông áo xanh bám theo người chơi (`src/logic/modules/pilgrim-profiles.mjs`, `src/app/world/render-loop-and-cutscene.mjs`, `src/app/ui/passport-and-cloud.mjs`)**:
  - Xóa `du_khach` khỏi `PILGRIMAGE_MODES.explorer.companions` (để mặc định đi lễ thanh tịnh một mình), lọc bỏ `du_khach` trong `setPilgrimageCompanions` và sửa lỗi khóa `'gia_dinh'` -> `'family_3gen'` khi gọi bố mẹ đi cùng.
- **Giảm độ chói trắng của lối đi & sân lát (`src/app/world/temple-grounds.mjs`, `src/app/world/exterior-town.mjs`)**:
  - Chuyển màu vật liệu `mainRoad`, `rightArrivalRoad`, `sideWalkway`, `endTurnPlaza`, `giangDuongWalkway`, `urbanConcreteMat`, `parkPathMat` sang tông đá/bê tông ấm cũ tự nhiên (`0xB8AE9B`–`0xC6BBA6`, `roughness: 0.88–0.90`).
- **Xây lại Nhà Lưu Niệm · Đặc Sản Chay đi thẳng vào trong mua đồ (`src/app/world/grocery-halls-statues.mjs`, `src/logic/modules/marketplace.mjs`, `src/logic/modules/world-data.mjs`, `src/app/world/characters-npcs.mjs`)**:
  - Mở rộng mặt tiền hoàn toàn không còn quầy chắn ngang, lót nền gạch bông đi dạo vào tận bên trong (`x = 38.05..46.0, z = -35.85..-29.8`) với kệ gỗ áp tường + bàn trưng bày trung tâm đi vòng quanh được; bổ sung đúng các mặt hàng đặc sản ở chùa: **Hũ Kho Quẹt Chay**, **Hũ Chao Môn Chay**, **Muối Mè & Tương Hột Chay**, **Tràng Hạt Bồ Đề**, **Mỹ Nghệ Gỗ Dừa Mỹ Tho**, **Tượng Phật Di Lặc Mini**, **Sách Kinh Nhật Tụng**.
- **Thiết kế Khu Nhà Vệ Sinh Nam — Nữ đông đúc tại sân sau (`src/app/world/gates-and-discovery.mjs`, `src/app/world/characters-npcs.mjs`)**:
  - Dựng dãy nhà vệ sinh sân sau tại `(35.5, 0, -66.5)` mái ngói đỏ, tường ốp gạch men, hai lối riêng **`NHÀ VỆ SINH NAM`** / **`NHÀ VỆ SINH NỮ`** có vách ngăn che tầm nhìn, dãy **4 bồn rửa tay có gương** ngoài hiên, bình **`NƯỚC UỐNG MIỄN PHÍ`**, ghế đá chờ và **7 NPC khách hành hương** xếp hàng, rửa tay, trò chuyện sinh động.
- **Sửa lỗi bấm cuối hành lang/cổng bên trong bị thoát ngay ra ngoài (`src/app/vinh-trang-square-interior.mjs`, `src/app/world/player-and-interaction.mjs`)**:
  - Gỡ các tấm nền phong cảnh xa (`outerGardenBackdrop`, `skyVistaBackdrop`, `frontSkyVista`) khỏi `interiorDoorClickTargets`; chỉ kích hoạt `exitInteriorGradual` khi người chơi đứng sát cửa (`dist <= 4.2m`), nếu bấm từ xa sẽ tự đi bộ tới gần cửa bên trong Chánh Điện thay vì văng ra ngoài; siết ngưỡng gợi ý thoát cửa hông lên `pz >= 18.2`.
- **Sửa lỗi tự động di chuyển & quay góc khó hiểu (`src/app/world/movement.mjs`, `src/app/world/render-loop-and-cutscene.mjs`)**:
  - Sửa `lerpAngle` theo góc ngắn nhất `Math.atan2(Math.sin(b-a), Math.cos(b-a))`, loại bỏ điểm đầu A* giật lùi, chặn `checkInteriorDoorTransition()` không cắt ngang tuyến tự động đi ngoài sân, sửa lỗi xoay vòng ngẫu nhiên khi tới đích gần `lookAt` và thêm lookahead cua góc mượt hơn.
- **Cân bằng tải & xóa giật lag khi bước vào Chánh Điện (`src/app/vinh-trang-square-interior.mjs`, `src/app/world/time-and-interior.mjs`, `src/app/world/glb-loading.mjs`)**:
  - Giảm số đèn `THREE.PointLight` nội thất từ **~43 đèn xuống còn 5 đèn** phạm vi rộng kết hợp tăng cường ánh sáng `hemiLight` / `sunLight` vàng ấm (giảm ~8.5 lần chi phí fragment shader); tắt `castShadow` trên tượng/kiến trúc nội thất; nạp nền từng GLB nội thất (`_preloadInteriorAssetsIdle`) khi đang dạo ngoài sân và chia nhỏ các đợt gắn mô hình (`yieldBatch`) để không bao giờ đứng khung hình khi vào điện.

---

## 13. Đợt 1 — Lộ Trình Hành Hương Siêu Thực (Cảm Hứng GTA Thế Giới Sống) & Nâng Cấp Chất Liệu PBR

- **Lưu lộ trình dài hạn (3 đợt + hạng mục Thiết kế & Chất liệu PBR)**:
  - Lưu toàn bộ kế hoạch 3 đợt tại `/docs/PILGRIMAGE_ROADMAP_PLAN.md` (tuân thủ từ ngữ tiếng Việt tự nhiên thông dụng như *vãn cảnh chùa, chiêm bái, công quả, thời khóa công phu, thọ trai, khảm sành sứ, góc nhìn thứ nhất, mưa rào miền Tây*).
- **Nâng cấp thiết kế & chất liệu PBR giàu chi tiết (`materials-and-lights.mjs`, `gates-and-discovery.mjs`, `temple-grounds.mjs`)**:
  - **Gạch lát sân chùa (`pavingTex` + `pavingBumpTex` + `pavingRoughTex`)**: bổ sung rãnh mạch vữa, vát cạnh, hạt đá mài, vết rêu ẩm góc gạch và kích hoạt độ lọc bất đẳng hướng (`anisotropy`) giảm nhòe ở góc nhìn gần.
  - **Khảm sành sứ Cổng Tam Quan & Cổng Phụ (`makeMosaicShardTex` 512px + `makeMosaicBumpTex`)**: tăng độ chi tiết từng mảnh gốm sứ lam–ngọc–đỏ–vàng ghép bông sen, tạo độ nổi bóng men (`roughness: 0.24, metalness: 0.16, bumpScale: 0.032`).
  - **Mái ngói âm dương & tường vôi cổ (`roofTex/roofBumpTex`, `limeWallTex/limeBumpTex`)**: nâng lên 512px có rãnh ngói nổi, vết mưa rêu miền Tây tự nhiên và gán bump map cho tường vàng, cột son, gỗ trầm.
- **Góc nhìn thứ nhất (`Phím V` & nút trong Ngăn kéo Tiện ích)**:
  - Triển khai `setCameraViewMode('first' | 'third')` trong `player-and-interaction.mjs` & `world-atmosphere.mjs`: đưa camera về đúng tầm mắt (`1.58m`), ẩn thân nhân vật chính, hỗ trợ xoay nhìn ngang/ngước lên ngắm tượng Phật & vòm cổng (`pitch ∈ [-0.62, +0.92] rad`).
- **Âm thanh không gian 3 vùng & tiếng mưa miền Tây (`audio-engine.mjs`, `weather-and-street.mjs`)**:
  - Tự động pha trộn mượt mà 3 vùng âm thanh theo vị trí thực của người chơi: **`street`** (tiếng phố Mỹ Tho ngoài cổng `z > 43`) ↔ **`courtyard`** (sân chùa, gió, chuông, tụng kinh) ↔ **`interior`** (âm vang ấm trong Chánh Điện, tiếng mưa ngoài trời tự động trầm ấm lại ở tần số thấp `760Hz`).
- **Thời tiết động Miền Tây (`🌤️ Nắng đẹp` ↔ `🌦️ Mưa rào`)**:
  - Hệ hạt mưa 320 tia zero-GC quanh người chơi, bầu trời u ám chuyển sắc (`_buildSkyTextureForPreset('rain')`), sương mù dịu, **mặt sân & mặt đường tự động sẫm màu và phản xạ bóng ướt (`computeWetMaterialParams`)**, và **NPC ngoài trời tự động bung dù che mưa 3D nhiều màu sắc**.
- **Cảnh sinh hoạt thực tế ngoài Cổng Phụ `Tịnh Độ Huyền Môn` (đối chiếu `image_bb72a8b0.png`)**:
  - Dựng **Xe Cà Rem Mỹ Tho** (thùng gỗ vàng–đỏ, bánh nan hoa, biển vẽ tay, chuông leng keng) và **Cô Bán Nón Lá Ven Cổng** (chồng nón lá xếp lớp) ngay bên trụ Đông ngoài cổng phụ; hỗ trợ bấm trực tiếp và phím `[E]` để thưởng thức cà rem dừa/đậu xanh/sầu riêng hoặc **đội thử Nón Lá 3D lên nhân vật**.

---

## 14. Đợt 2 — Thế Giới Sống, Khí Quyển Điện Ảnh & Ánh Sáng Siêu Thực Chuẩn GTA 6

- **4 Thời khóa công phu & Ánh sáng vật lý PMREM (`living-world.mjs`, `materials-and-lights.mjs`, `time-and-interior.mjs`, `vinh-trang-3d-world.mjs`)**:
  - Nâng cấp hệ thời khóa thành 4 khung giờ chuẩn sinh hoạt chùa Việt: **`🌅 Sáng (06:30)`**, **`☀️ Trưa (11:30)`**, **`🌇 Chiều (17:00 · Nắng chiều vàng Mỹ Tho)`**, và **`🕯️ Tối (19:00 · Tịnh độ hoa đăng)`**.
  - Dựng mới bầu trời **Chiều vàng Mỹ Tho (`_buildSkyTextureForPreset('sunset')`)** và tiền nướng (pre-bake) 2 bản đồ phản xạ môi trường PMREM riêng (`sunsetEnvTex`, `eveningEnvTex`) để khảm sành sứ, mặt nước Hồ Sen, chuông đồng và sân đá ướt phản chiếu ánh cam-đồng hoàng hôn hoặc đêm sao chân thực.
- **Khí quyển siêu thực zero-GC (`src/app/world/living-world-3d.mjs`)**:
  - **Tia nắng xiên (Volumetric Sunshafts)**: 5 chùm tia sáng xiên dịu rọi qua Cổng Phụ, sân Chánh Điện, Hồ Sen và Đại tượng Phật vào buổi Sáng & Chiều vàng (tự tắt khi mưa hoặc tối).
  - **Bụi nắng & Đom đóm Hồ Sen**: 140 hạt bụi nắng lơ lửng ban ngày, tự chuyển thành đom đóm xanh-vàng ấm quanh Hồ Sen khi sang buổi Tối.
  - **Lá Bồ Đề & Cánh hoa giấy rơi theo gió**: 34 lá vàng và cánh hoa giấy bay xoắn nhẹ dọc sân chùa và lối Cổng Phụ.
  - **Đèn rọi điểm nhấn di sản**: 3 đèn chiếu ấm cho Cổng Phụ, Mặt tiền 13 vòm Chánh Điện và Tượng Di Lặc bật tự động lúc chiều tà & tối.
- **Hệ sinh thái phản ứng tự nhiên (`living-world.mjs`, `living-world-3d.mjs`, `render-loop-and-cutscene.mjs`)**:
  - **Chim bồ câu thông minh (`evaluatePigeonState`)**: giật mình bay vòng cung mềm mại rồi đáp lại nhẹ nhàng (hết hẳn lỗi dịch chuyển tức thời) khi chạy nhanh lại gần, giữ bình an khi đi chậm (*Thiền hành*), và tự trú mưa khi bật Mưa rào.
  - **Vòng gợn sóng động trên Hồ Sen (`pondRipples`)**: 18 vòng sóng tròn lan tỏa theo cá Koi, tăng dày thành vòng sóng giọt mưa khi bật Mưa rào và bừng sóng vàng khi rắc thức ăn cho cá Koi.
- **Ngồi nghỉ ghế đá & Ngắm cảnh điện ảnh (`Diegetic Bench Rest`)**:
  - Bổ sung 3 ghế đá mài granite mới tại Cổng Phụ, bờ Hồ Sen và Vườn Tượng Di Lặc (tổng 6 ghế tương tác `SCENIC_BENCHES`), hỗ trợ chạm trực tiếp hoặc bấm `[E]` để ngồi nghỉ trong góc máy điện ảnh chậm (và hỗ trợ bấm `V` để ngồi ngắm cảnh ở Góc nhìn thứ nhất).

---

## 15. Đợt 3 — Chánh Điện 100+ Người Chơi, Tiệm Tạp Hóa Đi Bộ + Shopee Affiliate, Bản Đồ Công Viên Vĩnh Tràng & Chiều Sâu Hành Hương

- **Mở rộng Chánh Điện Lạy Phật đủ chứa hơn 100 người chơi (`vinh-trang-square-interior.mjs`, `movement.mjs`, `time-and-interior.mjs`, `player-and-interaction.mjs`, `characters-npcs.mjs`)**:
  - Mở rộng đại sảnh Chánh Điện lên **`47,4m × 41,6m`** (`x ∈ [-62,4, -15,2], z ∈ [-20,8, +20,8]`), mặt tiền 9 vòm Á–Âu đón nắng tại `x = -62,4`, 8 bộ vì kèo gỗ lim và 2 hàng cột đại trụ dọc `z = ±10,4`.
  - Bố trí **112 bồ đoàn lạy Phật** (7 hàng × 16 cột chia 4 khối với lối đi trung tâm & 2 hành lang rộng) bằng **3 `THREE.InstancedMesh`** (chỉ tốn 3 draw calls nên giữ nguyên khung hình mượt mà), nới rộng bệ **18 Vị La Hán** ra `z = ±19,55` (cách nhau `4,4m` như bảo tàng), và tăng thêm 6 Phật tử đang quỳ lạy.
- **Tiệm Tạp Hóa / Nhà Lưu Niệm 3D tỉ lệ thật đi bộ vào mua sắm + Shopee Affiliate (`grocery-halls-statues.mjs`, `marketplace.mjs`, `shopee-affiliate.mjs`, `stages-and-store.mjs`, `explore-account.mjs`, `characters-npcs.mjs`)**:
  - Mở rộng gian nhà lên **`15,4m × 10,6m × 4,45m`** tại `(42,2, 0, -34,2)` với lối vào mở rộng `14,2m`, 6 đèn trần ấm, kệ lưng 4 tầng dài `13,4m`, tủ mát nước dừa xiêm, giá treo 7 bộ Pháp phục, quầy thu ngân & tủ tràng hạt bên phải kèm bảng **`🛒 ĐẶT ONLINE SHOPEE · GIAO TẬN NHÀ`**, và **2 đảo trưng bày thấp** ở giữa chừa lối đi `2,6–2,8m` cho nhân vật & 2 NPC khách đi thẳng vào bên trong mua sắm.
  - Mở rộng danh mục từ 24 lên **32 mặt hàng** (bổ sung nhóm *Tất cả* và *Pháp phục & Đồ tu học*: áo tràng lam, đồ bà ba lụa, túi vải thêu sen, khăn rằn, muối mè, trà sen Đồng Tháp, dầu gió thảo mộc, trầm nụ...).
  - Xây dựng mô-đun **`shopee-affiliate.mjs`** có kiểm tra tên miền chặt chẽ (`https://shopee.vn`, `s.shopee.vn`, `shope.ee`, `shp.ee`, `vn.shp.ee`), nút **`🛒 Mua trên Shopee`** trên từng thẻ sản phẩm (`<a target="_blank" rel="noopener noreferrer">`) và bảng **`🔗 Gắn link Shopee`** lưu vào `localStorage` để chủ dự án dễ dàng dán link Affiliate bất cứ lúc nào.
- **Cải thiện độ chính xác Bản đồ 3D & 2D khu vực Công Viên Vĩnh Tràng ngoài chùa (`exterior-town.mjs`, `explore-account.mjs`)**:
  - Trong 3D: hoàn thiện lối dạo chu vi Tây (`x = -24,4`) và Nam (`z = 166,2`), 2 đường lát đá chéo hướng tâm xuyên qua quảng trường Đài Phun Nước Hoa Sen `(8,0, 104,0)`, 3 vạch sang đường trắng (`z = 70, 104, 138`) nối đường dẫn 170m sang công viên và bảng sơ đồ Công Viên Vĩnh Tràng.
  - Trên bản đồ 2D SVG (`viewBox="0 0 772 460"`): mở rộng phạm vi chiếu từ `z ∈ [-72, +58]` sang **`z ∈ [-72, +172]`**, hiển thị đầy đủ **Công Viên Vĩnh Tràng**, Đài Phun Nước, đường dạo hướng tâm, Chòi Lục Giác, Khu Thể Dục, Bãi Giữ Xe, Phố Mỹ Tho và **Đường Nguyễn Trung Trực** kèm nút đi thẳng ra Công Viên & vào bên trong Tiệm Tạp Hóa.
- **Đợt 3 — Gặp gỡ hữu duyên, Công quả & 12 Góc Ảnh Di Sản (`pilgrimage-depth.mjs`, `living-world-3d.mjs`, `hud-navigation.mjs`, `passport-and-cloud.mjs`, `world3d-bridge.mjs`)**:
  - Dựng đạo cụ 3D + hitbox tương tác & phím `[E]` cho **3 Gặp gỡ hữu duyên** (Bà cụ đánh rơi tràng hạt gần Hồ Sen, Du khách quốc tế hỏi kiến trúc Pháp–Việt, Sư thầy mời trà sen) và **3 việc Công quả** (Đánh bóng lư hương đồng, Tưới vườn cây kiểng Công Viên, Phụ dọn Trai đường).
  - Tích hợp tự động nhận diện **12 Góc Ảnh Di Sản** ngay khi chụp ảnh kỷ niệm sạch HUD (`+20 🪷` cho mỗi góc mới), có trung tâm tổng hợp trong Ngăn kéo Tiện ích (`🤝 Công Quả · Hữu Duyên · 12 Ảnh Di Sản`).
