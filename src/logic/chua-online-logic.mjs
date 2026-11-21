/**
 * Pure domain logic for Chùa Online | Chùa Vĩnh Tràng
 * Covers:
 * 1. 9-Zone Spatial Architecture across 14,000 m² Chùa Vĩnh Tràng grounds, D-Pad/WASD movement, collision & radar
 * 2. 3 Rigged 3D Characters (Phật tử Nữ 1.62m, Phật tử Nam 1.74m, Trẻ em 1.15m) & 3D Equipment fitting
 * 3. Spiritual Action State Machine (Lễ Phật, Dâng hương 4 bước, Dâng hoa, Niệm Phật 108 hạt, Thỉnh chuông, Quét lá)
 *    + Dấu Ấn Hành Trình (9 cánh hoa sen thanh tịnh, phi cạnh tranh)
 * 4. Souvenir & 3D Item Catalog (Quà lưu niệm, Đồ tu học, Vật phẩm 3D including 3D Shop Kiosk Model & Southern specialties)
 * 5. Deeply Researched Buddhist Dharma Curriculum (24 lessons + 10 canonical PDF textbooks from /Giáo trình phật học/)
 * 6. UGC Photo Check-in Studio ("Chụp ảnh Check-in Chùa Vĩnh Tràng như thật") & Community Gallery
 */

// Barrel: toàn bộ logic nằm trong src/logic/modules/*.mjs, file này chỉ re-export để import cũ vẫn chạy.
export * from './modules/world-data.mjs'; // Hồ sơ nhân vật, trạm hành hương, điểm khám phá, ranh giới thế giới, di chuyển & trạm gần nhất
export * from './modules/spiritual-actions.mjs'; // Trạng thái tâm linh, cột mốc UGC, hành động tu tập, tổng kết công đức
export * from './modules/shop-cart.mjs'; // Catalog cửa hàng lưu niệm, giỏ hàng, kiểm tra đơn
export * from './modules/lectures.mjs'; // Giáo trình PDF, lộ trình & bài giảng, chấm quiz
export * from './modules/ugc-and-color.mjs'; // Studio UGC (nền, tư thế, bài đăng) và bảng màu OKLCH
export * from './modules/daily-dharma.mjs'; // Lời Phật dạy mỗi ngày (fallback, chọn quote, gọi dịch vụ)
export * from './modules/store-items.mjs'; // Catalog 9 tab cửa hàng, hồ sơ cửa hàng, mua/thử đồ
export * from './modules/marketplace.mjs'; // Sạp hàng cổng chùa: danh mục & mua hàng
export * from './modules/activity-data.mjs'; // Dữ liệu: giờ trong ngày, điểm danh, nhiệm vụ, thư, chương khám phá
export * from './modules/activity-hub.mjs'; // Logic activity hub: nhiệm vụ, điểm danh, thư, chia sẻ, sao lưu hồ sơ
export * from './modules/pilgrim-progress-garden.mjs'; // Sức chứa điện, cấp bậc, nhiệm vụ sân, vườn thiền, nhịp chuông, di sản
export * from './modules/pilgrim-profiles.mjs'; // Quốc tịch & chế độ hành hương
export * from './modules/thirty-day-journal.mjs'; // Lộ trình 30 ngày, lịch âm, hoa đăng, nhật ký an tâm
export * from './modules/academy.mjs'; // Học viện Phật học: khóa, học phần, thi, VietQR, chứng nhận
export * from './modules/blessing-tower.mjs'; // Tháp đèn cầu an: danh mục & lời nguyện
export * from './modules/npc-dharma.mjs'; // Tương tác NPC sân chùa & thoại Pháp ngữ ngẫu nhiên
export * from './modules/visitor-presence.mjs'; // Hiện diện cộng đồng trực tuyến (Visitor Counter)
export * from './modules/ambient-audio.mjs'; // Quản lý âm thanh không gian chùa (niệm Phật xa & chuông chùa)
export * from './modules/pathfinding-and-collision.mjs'; // Giải va chạm đa lượt (MTV) & tìm đường A* tránh vật cản
export * from './modules/pilgrimage-passport.mjs'; // Sổ Hành Hương liên chùa (templeId), Quẻ Bình An 30 ngày, Vườn Sen ngày thực
export * from './modules/world-atmosphere.mjs'; // Thời tiết miền Tây, góc nhìn thứ nhất, âm thanh không gian 3 vùng & cảnh cổng chùa
export * from './modules/living-world.mjs'; // Đợt 2: Thời khóa công phu 4 buổi, ghế đá ngắm cảnh, bồ câu & khí quyển siêu thực
export * from './modules/shopee-affiliate.mjs'; // Liên kết Shopee Affiliate cho Nhà Lưu Niệm & Tiệm Tạp Hóa
export * from './modules/pilgrimage-depth.mjs'; // Đợt 3: Gặp gỡ hữu duyên, Công quả & 12 Góc Ảnh Di Sản
export * from './modules/surface-footsteps.mjs'; // Phát hiện bề mặt bước chân (cỏ, gạch, gỗ, đá sỏi)
export * from './modules/social-community.mjs'; // Cộng đồng đạo hữu: kết bạn, bảng xếp hạng, tặng quà, giao lưu
export * from './modules/fortune-sticks.mjs'; // Xin Xăm · Xem Quẻ Quan Âm & Gieo Keo Âm Dương




