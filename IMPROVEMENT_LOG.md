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
