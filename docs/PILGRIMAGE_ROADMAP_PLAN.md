# Kế Hoạch Nâng Cấp Trải Nghiệm Hành Hương 3D Siêu Thực — Chùa Vĩnh Tràng

> Tài liệu lưu trữ lộ trình phát triển dài hạn lấy cảm hứng từ sự tiến hóa độ chân thực thế giới mở của dòng game GTA (từ GTA 2 đến GTA 6), được chuyển hóa hoàn toàn sang hướng **vãn cảnh chùa — chiêm bái — hành hương thanh tịnh** mang đậm bản sắc **Chùa Vĩnh Tràng (Mỹ Tho, Tiền Giang)**, đối chiếu trực tiếp với ảnh chụp thực tế.

---

## Nguyên tắc thiết kế cốt lõi
1. **Đối chiếu ảnh thực tế**: Mọi chi tiết kiến trúc, vật liệu, bảng hiệu và cảnh sinh hoạt cổng chùa đều tham khảo ảnh thật (`image_bb72a8b0.png`, `image_97204806.png`, `vinh_trang_facade_ref.jpg`, `vinh_trang_tam_quan_ref.jpg`).
2. **Tiếng Việt tự nhiên, đúng văn hóa Phật giáo & Nam Bộ**: Dùng từ ngữ thực tế người Việt sử dụng (*vãn cảnh chùa, chiêm bái, hành hương, công quả, thời khóa công phu, thọ trai, khảm sành sứ, xe cà rem Mỹ Tho, cô bán nón lá, mưa rào miền Tây*). Không tự chế từ ghép thiếu tự nhiên.
3. **Thế giới sống động — không bạo lực**: Chú trọng cảm giác nhập vai thật sự như đang đi Chùa Vĩnh Tràng ngoài đời, giữ giao diện tối giản, dễ đọc cho cả cô bác lớn tuổi.
4. **Đảm bảo hiệu năng & Software WebGL**: Không cấp phát bộ nhớ thừa trong vòng lặp khung hình (zero-GC), giữ đầy đủ cảnh vật ở mọi chế độ đồ họa.

---

## Tuyến nâng cấp Thiết kế & Chất liệu PBR (Chạy xuyên suốt các đợt)
- **Mặt sân & lối đi**: Nâng cấp texture lát đá sân chùa (`pavingTex`), gạch tàu (`gachTauTex`), gạch vỉa hè (`sideBrickTex`), đường bê tông (`concreteRoadTex`) và mặt đường nhựa cũ Mỹ Tho (`straightAsphaltMat`) với bản đồ **bumpMap + roughnessMap** đồng bộ, lọc anisotropic tối đa (`getMaxAnisotropy()`), phân biệt chuẩn `SRGBColorSpace` cho màu và tuyến tính cho dữ liệu độ nhám/nổi.
- **Tường vôi & mái ngói âm dương**: Tường vôi vàng kem Chùa Vĩnh Tràng (`limeWallTex`) có độ sần vữa cổ, vết ẩm chân tường nhiệt đới; ngói âm dương đất nung (`roofTex`) có rãnh cong nổi rõ dưới ánh nắng xiên.
- **Nghệ thuật khảm sành sứ Cổng Tam Quan & Cổng Phụ**: Nâng cấp texture khảm sành sứ (`makeMosaicShardTex`) lên độ phân giải 512px với mảnh gốm men bóng (`roughness` thấp + `bumpMap` nổi cạnh mảnh sứ), tái hiện vẻ rực rỡ dưới nắng Mỹ Tho như ảnh thật `image_bb72a8b0.png`.
- **Phản hồi ẩm ướt khi mưa**: Khi trời đổ mưa rào miền Tây, hệ mặt sân và lối đi ngoài trời tự động tối màu nhẹ và giảm `roughness` tạo độ bóng loáng phản chiếu bầu trời, sau đó khô dần khi tạnh mưa.
- **Bóng tiếp xúc & định vị vững chắc**: Mọi gian hàng, xe đẩy, nhân vật đều có tâm đặt đáy chạm đất chuẩn và bóng tiếp xúc mềm.

---

## Đợt 1 — Cảm Giác Nhập Vai, Chất Liệu PBR & Sức Sống Cổng Chùa (Đã hoàn thành)
1. **Nâng cấp thiết kế & chất liệu PBR**:
   - Thêm cặp `pavingBumpTex`, `pavingRoughTex`, `limeBumpTex`, `roofBumpTex`, `woodBumpTex`, `mosaicBumpTex`.
   - Nâng cấp `makeMosaicShardTex` (512px có viền men gốm nổi) cho Cổng Phụ *Tịnh Độ Huyền Môn* & Cổng Tam Quan.
   - Cơ chế bề mặt ướt động (`wettableMaterials`) đồng bộ với thời tiết.
2. **Góc nhìn thứ nhất (Phím `V` & nút trong Bảng Tiện ích)**:
   - Chuyển mượt giữa góc nhìn thứ 3 và góc nhìn thứ 1 ngang tầm mắt nhân vật.
   - Cho phép xoay nhìn thoải mái lên các đại tượng 20m–32m (Phật Di Lặc, Phật A Di Đà, Phật Nằm) và chi tiết khảm sành sứ cổng chùa; có nhún bước chân nhẹ tự nhiên khi di chuyển.
3. **Âm thanh không gian 3 vùng + Tiếng mưa miền Tây**:
   - Tự động chuyển mượt giữa 3 vùng âm thanh: **Ngoài cổng / Đường phố Mỹ Tho** (`street`) → **Sân chùa & vườn tượng** (`courtyard`) → **Trong Chánh điện** (`interior`).
   - Tiếng mưa rào miền Tây rơi trên tán lá, mặt sân và dịu trầm lại khi bước vào mái hiên Chánh điện.
4. **Thời tiết động Miền Tây (Nắng đẹp ↔ Mưa rào)**:
   - Hạt mưa rơi mượt (pooled zero-GC quanh người chơi, tự ẩn khi vào Chánh điện), bầu trời chuyển mây mưa dịu mát, ánh sáng và sương mù thay đổi theo thời tiết.
   - Mặt sân đá, đường bê tông và đường nhựa ướt bóng khi mưa, khô dần khi tạnh.
   - **Phản ứng NPC sống động**: Khách hành hương và tăng ni đi dạo ngoài sân tự động bung dù che mưa 3D khi trời mưa và cất dù khi nắng ráo.
5. **Cảnh sinh hoạt thật ngay Cổng Phụ *Tịnh Độ Huyền Môn* (theo ảnh thật `image_bb72a8b0.png`)**:
   - **Xe Cà Rem Mỹ Tho**: Xe đẩy bánh căm, thùng inox giữ lạnh, bảng hiệu *"CÀ REM MỸ THO · Ice Cream"*, dù che nắng — cho phép bấm `[E]` hoặc chạm trực tiếp để trò chuyện, thưởng thức hương vị tuổi thơ miền Tây.
   - **Cô Bán Nón Lá Ven Cổng**: Gánh nón lá xếp chồng cùng người bán mặc đồ bà ba, đội nón lá — cho phép bấm `[E]` hoặc chạm để nghe câu chuyện nón lá Nam Bộ và đội thử nón lá đi vãn cảnh chùa.

---

## Đợt 2 — Nhịp Sinh Hoạt Theo Thời Khóa, Khí Quyển Điện Ảnh & Tương Tác Thế Giới Sâu (Đã hoàn thành)
1. **Nhịp sống theo 4 Thời khóa công phu (Sáng 06:30 · Trưa 11:30 · Chiều vàng 17:00 · Tối hoa đăng 19:00)**:
   - Bổ sung bầu trời hoàng hôn **Chiều vàng Mỹ Tho (`sunset`)**, PMREM phản xạ vật lý riêng cho Chiều vàng (`sunsetEnvTex`) và Đêm sao (`eveningEnvTex`) giúp mặt nước, khảm sành sứ, sân đá ướt và chuông đồng phản chiếu màu nắng chiều/đêm chân thực.
   - **Tia nắng xiên (Volumetric Sunshafts)** rọi qua Cổng Phụ, sân Chánh Điện, Hồ Sen và Đại tượng Phật vào buổi Sáng & Chiều vàng; **hạt bụi nắng lơ lửng** ban ngày chuyển thành **đom đóm vàng dịu** quanh Hồ Sen vào buổi tối; **3 đèn rọi điểm nhấn di sản** bật ấm buổi chiều & tối.
2. **Hệ sinh thái sống động (Bồ câu thông minh, Vòng sóng Hồ Sen & Lá rơi theo gió)**:
   - Chim bồ câu dùng thuật toán quỹ đạo vòng cung mượt (`evaluatePigeonState`): giật mình tung cánh bay vòng cung rồi đáp lại nhẹ nhàng khi người chơi chạy nhanh lại gần, giữ bình an khi người chơi đi chậm (*Thiền hành*), và tìm chỗ trú khi mưa rào.
   - 18 vòng gợn sóng động trên mặt Hồ Sen (`pondRipples`) tự sinh theo cá Koi, tăng mật độ vòng sóng giọt mưa khi mưa rào và bừng sóng vàng khi rắc thức ăn cho cá Koi.
   - 34 chiếc lá Bồ Đề vàng và cánh hoa giấy hồng rơi xoắn nhẹ theo gió miền Tây.
3. **Ngồi nghỉ ghế đá & Ngắm cảnh điện ảnh (Diegetic Bench Rest)**:
   - 6 ghế đá mài granite quanh Cổng Phụ, Hồ Sen, Vườn Tượng Di Lặc và Sân Chánh Điện hỗ trợ chạm trực tiếp hoặc bấm `[E]` để ngồi nghỉ thư thái, chuyển góc máy điện ảnh chậm (và hỗ trợ nhấn `V` ngồi ngắm ở Góc nhìn thứ nhất).

---

## Đợt 3 — Chiều Sâu Dài Hạn, Mở Rộng Quy Mô Thực & Gắn Shopee Affiliate (Đã hoàn thành)
1. **Gặp gỡ hữu duyên quanh chùa (3 sự kiện nhân văn phi bạo lực)**:
   - Bà cụ Hai đánh rơi chuỗi tràng hạt gỗ Bồ Đề 108 hạt gần Hồ Sen nhờ nhặt giúp (`ba_cu_trang_hat`).
   - Du khách quốc tế hỏi thăm kiến trúc Pháp – Việt Chùa Vĩnh Tràng (1849) & 18 vị La Hán gỗ mít 1907 (`du_khach_quoc_te`).
   - Sư thầy mời thưởng chén trà sen và kể chuyện lịch sử Hòa thượng Thích Huệ Đăng & Hòa thượng Chánh Hậu (`su_thay_tra_sen`).
2. **Hệ thống Công quả & Bếp chay (3 việc thiện)**:
   - Đánh bóng lư hương đồng sân Chánh Điện (`danh_bong_lu_huong`).
   - Tưới nước vườn cây kiểng & bồn hoa Công Viên Vĩnh Tràng (`tuoi_vuon_cay_kieng`).
   - Phụ dọn chén đũa & sắp xếp Trai đường phía Đông (`phu_don_trai_duong`).
3. **Bộ Sưu Tập 12 Góc Ảnh Di Sản Chùa Vĩnh Tràng & Công Viên Vĩnh Tràng**:
   - Tự động nhận diện 1 trong 12 góc ảnh di sản khi chụp ảnh kỷ niệm sạch HUD (`matchHeritagePhotoSpot` + `recordHeritagePhoto`), thưởng `+20 🪷` cho mỗi góc mới và lưu vào album theo ngày.
4. **Mở rộng Chánh Điện Lạy Phật đủ chứa 100+ người chơi**:
   - Mở rộng lòng Chánh Điện lên **`47,4m × 41,6m`** với **112 chiếc bồ đoàn lạy Phật** (4 khối × 7 hàng, vẽ tối ưu bằng 3 `THREE.InstancedMesh`), nới rộng hành lang trưng bày 18 Vị La Hán (`z = ±19,55`) và bổ sung thêm Phật tử đang quỳ lạy.
5. **Tiệm Tạp Hóa / Nhà Lưu Niệm 3D đúng tỉ lệ đi bộ vào mua sắm + Shopee Affiliate**:
   - Mở rộng lên **`15,4m × 10,6m × 4,45m`** với mặt tiền mở hoàn toàn, 2 đảo trưng bày thấp ở giữa, lối đi rộng `2,6–2,8m`, 2 NPC khách đi thẳng vào trong chọn đồ, nâng tổng danh mục lên **32 mặt hàng** (thêm nhóm *Pháp phục & Đồ tu học*) và tích hợp sẵn nút **`🛒 Mua trên Shopee`** + bảng **`🔗 Gắn link Shopee Affiliate`** an toàn (`https://s.shopee.vn/...`, `shopee.vn`, `shope.ee`) để chủ dự án dễ dàng dán link sau.
6. **Bản đồ chuẩn xác khu vực Công Viên Vĩnh Tràng ngoài chùa**:
   - Bổ sung lối dạo chu vi Tây & Nam, 2 trục lát đá chéo hướng tâm qua Đài Phun Nước Hoa Sen, 3 vạch sang đường trắng kết nối đường dẫn 170m sang công viên, bảng sơ đồ Công Viên Vĩnh Tràng; mở rộng bản đồ 2D SVG (`z ∈ [-72, +172]`) hiển thị trọn vẹn Công Viên Vĩnh Tràng, Đường Nguyễn Trung Trực và nút đi thẳng ra Công Viên / vào Tiệm Tạp Hóa.

