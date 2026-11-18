/**
 * Catalog cửa hàng lưu niệm, giỏ hàng, kiểm tra đơn.
 * (Tách từ chua-online-logic.mjs — import từ '/src/logic/chua-online-logic.mjs' vẫn dùng được.)
 */

/**
 * Complete Souvenir & 3D Item Catalog matching Reference Image 2 (image_43ca3fb3.png)
 * + 3D Shop Kiosk Model + All 3 Character Fitting Items + Southern Cultural Specialties
 */
export const SHOP_CATALOG = [
  // === TAB 1: QUÀ LƯU NIỆM (First 3 match Reference Image 2 pixel-for-pixel!) ===
  {
    id: 'so_tay_hoa_sen',
    tab: 'souvenir',
    name: 'Sổ tay hoa sen',
    subtitle: 'Bìa vải bố đỏ thêu hoa sen ánh kim kèm dây kẹp vàng',
    price: 125000,
    badge: 'Giao tận nhà',
    deliveryText: 'Giao tận nhà',
    image: '/Thiết kế giao diện/Vật phẩm 3D/models/tham_khao_tui_sen.png',
    cropStyle: {
      bgImage: '/public/assets/aistudio/image_43ca3fb3.png',
      bgSize: '329.3% 489.2%',
      bgPos: '3.37% 67.02%'
    },
    illustrationType: 'lotus_notebook',
    procedural3dId: 'so_tay_hoa_sen',
    glb: '/Thiết kế giao diện/Vật phẩm 3D/Bản chỉnh sửa/tui-vai-sen.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_packages/coohom_tui_vai_theu_sen.zip',
    equipSlot: 'hand',
    dimensions: '14.5 × 21 × 1.8 cm',
    material: 'Bìa vải linen đỏ huyết dụ dập nổi hoa sen nhũ vàng, giấy kem 100gsm chống lóa',
    meaning: 'Dùng ghi chép lời Phật dạy, nhật ký chánh niệm và những điều biết ơn mỗi ngày sau chuyến hành hương Chùa Vĩnh Tràng.'
  },
  {
    id: 'trang_hat_go',
    tab: 'souvenir',
    name: 'Tràng hạt gỗ',
    subtitle: 'Vòng gỗ Bồ Đề & Hoàng Đàn 108 hạt kết tua rua đỏ truyền thống',
    price: 160000,
    badge: 'Giao tận nhà',
    deliveryText: 'Giao tận nhà',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_bo_doan_tron.png',
    cropStyle: {
      bgImage: '/public/assets/aistudio/image_43ca3fb3.png',
      bgSize: '329.3% 489.2%',
      bgPos: '50.35% 67.02%'
    },
    illustrationType: 'wooden_mala',
    procedural3dId: 'trang_hat_bo_de',
    glb: '/Thiết kế giao diện/Vật phẩm 3D/fixed/bo_doan_tron.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_packages/coohom_trang_hat_bo_de.zip',
    equipSlot: 'hand',
    dimensions: 'Đường kính hạt 10 mm · Chu vi 108 hạt',
    material: 'Gỗ Bồ Đề tự nhiên tiện tròn bóng mịn, hương gỗ dịu nhẹ, dây dù đỏ bền chắc',
    meaning: 'Mỗi hạt gỗ nhắc nhở người đeo giữ tâm bình hòa, lần hạt niệm Phật giúp chuyển hóa 108 phiền não.'
  },
  {
    id: 'buu_thiep_chua',
    tab: 'souvenir',
    name: 'Bưu thiếp chùa',
    subtitle: 'Bộ 6 bưu thiếp mỹ thuật Chánh điện Chùa Vĩnh Tràng & phong bì kraft',
    price: 65000,
    badge: 'Giao tận nhà',
    deliveryText: 'Giao tận nhà',
    image: '/Mô hình 3D Vĩnh Tràng/render_vinh_trang_facade.png',
    cropStyle: {
      bgImage: '/public/assets/aistudio/image_43ca3fb3.png',
      bgSize: '329.3% 489.2%',
      bgPos: '96.63% 67.02%'
    },
    illustrationType: 'pagoda_postcard',
    procedural3dId: 'buu_thiep_chua',
    glb: '/Mô hình 3D Vĩnh Tràng/Bản dựng mới/mat-tien-vinh-trang.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_all_vat_pham_chua_online.zip',
    equipSlot: 'altarItem',
    dimensions: '15 × 10.5 cm (Bộ 6 tấm + 6 phong bì giấy kraft)',
    material: 'Giấy mỹ thuật định lượng 350gsm in màu archival sắc nét mặt tiền Chùa Vĩnh Tràng',
    meaning: 'Gửi trao lời chúc bình an và lưu giữ kỷ niệm chuyến viếng thăm ngôi cổ tự trăm năm miền Tây.'
  },
  {
    id: 'tui_vai_theu_sen',
    tab: 'souvenir',
    name: 'Túi vải bố thêu hoa sen',
    subtitle: 'Túi tote canvas kem đeo vai chuẩn tạo hình 3 nhân vật Nam – Nữ – Trẻ em',
    price: 145000,
    badge: 'Giao tận nhà',
    deliveryText: 'Giao tận nhà',
    image: '/Thiết kế giao diện/Vật phẩm 3D/render-tui-vai-theu-sen-34.png',
    procedural3dId: 'tui_vai_di_chua',
    glb: '/Thiết kế giao diện/Vật phẩm 3D/Bản chỉnh sửa/tui-vai-sen.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_packages/coohom_tui_vai_theu_sen.zip',
    equipSlot: 'bag',
    dimensions: '34 × 38 × 8 cm',
    material: 'Vải bố canvas mộc dày dặn, thêu nổi hoa sen hồng chỉ lụa',
    meaning: 'Chiếc túi đồng hành cùng người Phật tử mỗi lần đi chùa, đựng kinh sách và vật dụng thanh lịch.'
  },
  {
    id: 'non_la_theu_sen',
    tab: 'souvenir',
    name: 'Nón lá lụa thêu hoa sen',
    subtitle: 'Nón lá miền Tây vành tre thanh thoát đội vừa vặn trên cả 3 nhân vật 3D',
    price: 135000,
    badge: 'Giao tận nhà',
    deliveryText: 'Giao tận nhà',
    image: '/Thiết kế giao diện/Vật phẩm 3D/render-non-la-theu-sen.jpg',
    procedural3dId: 'non_la_theu_sen',
    glb: '/Thiết kế giao diện/Vật phẩm 3D/models/non_la_blender.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_packages/coohom_non_la_theu_sen.zip',
    equipSlot: 'hat',
    dimensions: 'Đường kính 41.6 cm × Cao 21 cm',
    material: 'Lá cọ non phơi sương lợp 2 lớp, thêu tay hoa sen hồng Mỹ Tho',
    meaning: 'Che nắng dịu dàng trên sân gạch Chùa Vĩnh Tràng, tôn nét duyên đằm thắm Nam Bộ.'
  },
  {
    id: 'khan_ran_nam_bo',
    tab: 'souvenir',
    name: 'Khăn rằn Nam Bộ thêu sen',
    subtitle: 'Khăn rằn dệt thủ công caro truyền thống điểm hoa sen hồng',
    price: 95000,
    badge: 'Giao tận nhà',
    deliveryText: 'Giao tận nhà',
    image: '/Thiết kế giao diện/Nhân vật 3D/render-items-nam-v2.jpg',
    procedural3dId: 'khan_ran_nam_bo',
    glb: '/Thiết kế giao diện/Vật phẩm 3D/meshy_assets/khan-ran-nam-bo-3d.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_packages/coohom_khan_ran_nam_bo.zip',
    equipSlot: 'scarf',
    dimensions: '125 × 55 cm',
    material: '100% sợi bông tự nhiên thấm hút, góc khăn thêu sen tinh tế',
    meaning: 'Biểu tượng nghĩa tình mộc mạc, hiếu khách của đất và người Tiền Giang.'
  },
  {
    id: 'combo_qua_que_mien_tay',
    tab: 'souvenir',
    name: 'Thức quà chay Mỹ Tho (Bánh bò · Bánh da lợn · Dừa xiêm)',
    subtitle: 'Đặc sản chay thanh vị miền Tây gói lá chuối tươi dâng lễ & thưởng thức',
    price: 110000,
    badge: 'Đặc sản chùa quê',
    deliveryText: 'Giao tận nhà',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_dia_banh_da_lon.png',
    procedural3dId: 'dia_banh_da_lon',
    glb: '/Thiết kế giao diện/Vật phẩm 3D/fixed/dia_banh_da_lon.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_packages/coohom_dia_banh_da_lon.zip',
    equipSlot: 'altarItem',
    dimensions: 'Khay 24 × 24 × 12 cm',
    material: 'Bột gạo nàng hương, lá dứa tươi, đậu xanh và dừa xiêm ngọt mát Tiền Giang',
    meaning: 'Hương vị quê hương mộc mạc giúp chuyến đi chùa thêm trọn vẹn niềm vui sum vầy.'
  },
  {
    id: 'quat_nan_gio_may',
    tab: 'souvenir',
    name: 'Quạt nan lá dừa & Giỏ mây tre đan thủ công',
    subtitle: 'Bộ đôi phụ kiện đi chùa xanh mát của nghệ nhân làng nghề Tiền Giang',
    price: 115000,
    badge: 'Thủ công xanh',
    deliveryText: 'Giao tận nhà',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_quat_nan_la_dua.png',
    procedural3dId: 'quat_nan_la_dua',
    glb: '/Thiết kế giao diện/Vật phẩm 3D/fixed/quat_nan_la_dua.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_packages/coohom_quat_nan_la_dua.zip',
    equipSlot: 'hand',
    dimensions: 'Quạt Ø 28 cm · Giỏ 32 × 26 cm',
    material: 'Lá dừa nước và mây tre tự nhiên đan tay bền đẹp',
    meaning: 'Gió lành mát rượi giữa trưa nắng miền Tây, khuyến khích lối sống xanh thân thiện môi trường.'
  },

  // === TAB 2: ĐỒ TU HỌC (Study & Practice Tools) ===
  {
    id: 'ao_trang_phat_tu',
    tab: 'study',
    name: 'Áo tràng lam Phật tử (Đủ cỡ Nam · Nữ · Trẻ em)',
    subtitle: 'Pháp phục áo lam cổ tàu 5 nút vải đũi tím khói trang nghiêm',
    price: 260000,
    badge: 'Giao tận nhà',
    deliveryText: 'Giao tận nhà',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    procedural3dId: 'ao_trang_phat_tu',
    glb: '/Thiết kế giao diện/Vật phẩm 3D/models/ao_trang_phat_tu.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_packages/coohom_ao_trang_phat_tu.zip',
    equipSlot: 'outfit',
    dimensions: 'Đủ size Nam (1.74m) / Nữ (1.62m) / Trẻ em (1.15m)',
    material: 'Vải kate lụa & đũi lạnh màu lam tím khói (#9A8F99) thoáng mát, đứng phom',
    meaning: 'Màu lam khói tượng trưng cho hương trầm thanh tịnh, xóa nhòa khoảng cách để cùng hướng về sự giác ngộ.'
  },
  {
    id: 'bo_kinh_phap_cu',
    tab: 'study',
    name: 'Trọn bộ Giáo Trình Phật Học Phổ Thông & Kinh Pháp Cú',
    subtitle: 'Tuyển tập 10 quyển kinh sách căn bản (HT. Thích Thiện Hoa, Walpola Rahula, Ajahn Brahm)',
    price: 245000,
    badge: 'Giao tận nhà',
    deliveryText: 'Giao tận nhà',
    image: '/Thiết kế giao diện/giang-duong-bai-hoc-v2.png',
    procedural3dId: 'so_tay_hoa_sen',
    glb: '/Thiết kế giao diện/Vật phẩm 3D/fixed/mo_go_tung_kinh.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_all_vat_pham_chua_online.zip',
    equipSlot: 'hand',
    dimensions: 'Bộ hộp 15 × 22 × 8 cm',
    material: 'Bìa cứng bồi vải gấm, giấy kem chống mỏi mắt, tặng kèm bản đọc PDF trực tuyến',
    meaning: 'Kim chỉ nam tu tập Chánh kiến, hiểu thấu Tam Bảo, Tứ Diệu Đế, Nghiệp Báo và Thiền Chánh Niệm.'
  },
  {
    id: 'mo_go_mit_cham_rong',
    tab: 'study',
    name: 'Mõ gỗ mít chạm cá hóa rồng',
    subtitle: 'Mõ tụng kinh gỗ mít già kèm dùi và đệm gấm hoa sen',
    price: 340000,
    badge: 'Giao tận nhà',
    deliveryText: 'Giao tận nhà',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_mo_go_tung_kinh.png',
    procedural3dId: 'mo_go_tung_kinh',
    glb: '/Thiết kế giao diện/Vật phẩm 3D/fixed/mo_go_tung_kinh.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_packages/coohom_mo_go_tung_kinh.zip',
    equipSlot: 'altarItem',
    dimensions: '18 × 16 × 15 cm',
    material: 'Gỗ mít lõi già chạm thủ công, âm thanh trầm ấm vang đều',
    meaning: 'Nhắc người tu học luôn tỉnh thức ngày đêm như loài cá không bao giờ nhắm mắt.'
  },
  {
    id: 'chuong_dong_bat_nha',
    tab: 'study',
    name: 'Chuông gia trì đồng Bát Nhã',
    subtitle: 'Chuông đồng đỏ đúc thủ công đặt trên đệm sen gấm',
    price: 420000,
    badge: 'Giao tận nhà',
    deliveryText: 'Giao tận nhà',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_bat_nhang_tram.png',
    procedural3dId: 'chuong_dong_bat_nha',
    glb: '/Thiết kế giao diện/Vật phẩm 3D/fixed/bat_nhang_tram.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_packages/coohom_bat_nhang_tram.zip',
    equipSlot: 'altarItem',
    dimensions: 'Đường kính 16 cm × Cao 18 cm',
    material: 'Đồng đỏ pha thiếc theo tỷ lệ cổ truyền, ngân dài trên 18 giây',
    meaning: 'Mỗi tiếng chuông ngân giúp dừng lại dòng suy nghĩ phân tán, trở về hơi thở hiện tại.'
  },
  {
    id: 'toa_sen_ngoi_thien',
    tab: 'study',
    name: 'Bồ đoàn tọa thiền đài sen & Chiếu cói',
    subtitle: 'Đệm ngồi thiền vỏ đậu xanh êm ái như trong Giảng đường Phật pháp',
    price: 280000,
    badge: 'Giao tận nhà',
    deliveryText: 'Giao tận nhà',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_bo_doan_dai_sen.png',
    procedural3dId: 'bo_doan_dai_sen',
    glb: '/Thiết kế giao diện/Vật phẩm 3D/fixed/bo_doan_dai_sen.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_packages/coohom_bo_doan_dai_sen.zip',
    equipSlot: 'altarItem',
    dimensions: 'Đường kính 45 cm × Cao 11 cm',
    material: 'Vỏ vải bố gấm thêu cánh sen, ruột bông gòn tự nhiên & vỏ đậu xanh thoáng khí',
    meaning: 'Giúp giữ cột sống thẳng tự nhiên khi ngồi thiền, nghe giảng pháp hoặc tụng kinh tại gia.'
  },
  {
    id: 'bo_am_tra_sen_gom',
    tab: 'study',
    name: 'Bộ ấm trà đạo gốm men ngọc',
    subtitle: 'Ấm trà và 4 chén gốm men ngọc bích kèm khay tre thiền trà',
    price: 390000,
    badge: 'Giao tận nhà',
    deliveryText: 'Giao tận nhà',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_chum_sanh_hoa_sen.png',
    procedural3dId: 'bo_am_tra_sen_gom',
    glb: '/Thiết kế giao diện/Vật phẩm 3D/fixed/chum_sanh_hoa_sen.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_packages/coohom_chum_sanh_hoa_sen.zip',
    equipSlot: 'altarItem',
    dimensions: 'Khay 26 × 20 cm · Ấm 280 ml',
    material: 'Gốm nung 1280°C men ngọc lục bảo vẽ nổi cánh sen',
    meaning: 'Thưởng trà trong chánh niệm — nâng chén trà thơm cảm nhận đất trời và tình thân.'
  },

  // === TAB 3: VẬT PHẨM 3D (Includes 3D Shop Kiosk Model + Full 3D Collection) ===
  {
    id: 'mo_hinh_cua_hang_3d',
    tab: '3d',
    name: 'Mô hình Quầy lưu niệm Chùa Vĩnh Tràng',
    subtitle: 'Quầy gỗ mái ngói âm dương, đèn lồng hồng và tượng Phật trưng bày',
    price: 680000,
    badge: 'Xem 3D',
    deliveryText: 'Xem mẫu 3D',
    image: '/public/assets/aistudio/image_43ca3fb3.png',
    procedural3dId: 'kiosk_cua_hang_3d',
    glb: '/Mô hình 3D Vĩnh Tràng/Bản dựng mới/mat-tien-vinh-trang.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_all_vat_pham_chua_online.zip',
    equipSlot: 'altarItem',
    dimensions: '380 × 240 × 310 cm',
    material: 'Gỗ lim chạm khắc, mái ngói đất nung, đèn lồng lụa hồng & chậu hoa sen gốm',
    meaning: 'Tái hiện gian quầy gỗ mộc mạc bên hiên sân Chánh điện Chùa Vĩnh Tràng.'
  },
  {
    id: 'tuong_phat_di_lac_3d',
    tab: '3d',
    name: 'Tượng Phật Di Lặc (3D)',
    subtitle: 'Mẫu tượng trưng bày xoay 360° & thỉnh về thờ tại gia',
    price: 480000,
    badge: 'Giao tận nhà',
    deliveryText: 'Xem 3D & Giao tận nhà',
    image: '/Mô hình 3D Vĩnh Tràng/Tượng/di-lac.png',
    procedural3dId: 'tuong_phat_di_lac_3d',
    glb: '/Mô hình 3D Vĩnh Tràng/Tượng/di-lac.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_all_vat_pham_chua_online.zip',
    equipSlot: 'altarItem',
    dimensions: '24 × 20 × 18 cm',
    material: 'Composite phủ nhũ vàng & gỗ hương chạm khắc theo nguyên mẫu Vĩnh Tràng',
    meaning: 'Gợi nhắc niềm vui hiền hòa, bao dung và bình an trong gia đình.'
  },
  {
    id: 'tuong_phat_adida_3d',
    tab: '3d',
    name: 'Tượng Phật A Di Đà Đứng Đài Sen (3D)',
    subtitle: 'Tôn tượng A Di Đà tay bắt ấn tiếp dẫn chuẩn tỷ lệ Vĩnh Tràng',
    price: 520000,
    badge: '3D + Giao tận nhà',
    deliveryText: 'Thử 3D & Giao tận nhà',
    image: '/Mô hình 3D Vĩnh Tràng/Tượng/phat-dung-adida.png',
    procedural3dId: 'tuong_phat_adida_3d',
    glb: '/Mô hình 3D Vĩnh Tràng/Tượng/phat-dung-adida.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_all_vat_pham_chua_online.zip',
    equipSlot: 'altarItem',
    dimensions: '12 × 12 × 38 cm',
    material: 'Đá cẩm thạch trắng nhân tạo & đế sen mạ vàng trang nghiêm',
    meaning: 'Ánh sáng Vô Lượng Quang — Vô Lượng Thọ soi đường cho người con Phật.'
  },
  {
    id: 'tuong_quan_am_3d',
    tab: '3d',
    name: 'Tượng Bồ Tát Quán Thế Âm (3D)',
    subtitle: 'Tôn tượng Quán Thế Âm cầm bình cam lộ trên đài sen',
    price: 490000,
    badge: '3D + Giao tận nhà',
    deliveryText: 'Thử 3D & Giao tận nhà',
    image: '/Mô hình 3D Vĩnh Tràng/Tượng/phat-ngoi-ban-tho.png',
    procedural3dId: 'tuong_quan_am_3d',
    glb: '/Mô hình 3D Vĩnh Tràng/Tượng/quan-am-nam-hai.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_all_vat_pham_chua_online.zip',
    equipSlot: 'altarItem',
    dimensions: '12 × 12 × 36 cm',
    material: 'Gốm sứ Bạch Định men trắng ngà thanh khiết',
    meaning: 'Lắng nghe tiếng khổ của thế gian và rưới nước từ bi làm dịu mát tâm hồn.'
  },
  {
    id: 'lu_huong_dong_3d',
    tab: '3d',
    name: 'Lư Hương Đồng & Bát Nhang Trầm (3D)',
    subtitle: 'Lư hương đồng 3 chân quỳ chạm song long chầu nguyệt kèm 3 nén tâm hương',
    price: 450000,
    badge: '3D + Giao tận nhà',
    deliveryText: 'Thử 3D & Giao tận nhà',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_bat_nhang_tram.png',
    procedural3dId: 'bat_nhang_tram',
    glb: '/Thiết kế giao diện/Vật phẩm 3D/fixed/bat_nhang_tram.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_packages/coohom_bat_nhang_tram.zip',
    equipSlot: 'altarItem',
    dimensions: '22 × 18 × 24 cm',
    material: 'Đồng vàng giả cổ đúc nổi hoa văn truyền thống',
    meaning: 'Vật phẩm trung tâm của nghi thức dâng hương kết nối tâm nguyện với mười phương chư Phật.'
  },
  {
    id: 'den_hoa_sen_pha_le_3d',
    tab: '3d',
    name: 'Đèn Hoa Sen Pha Lê & Hoa Đăng Cầu An (3D)',
    subtitle: 'Đèn thờ hoa sen pha lê 7 tầng cánh tỏa ánh vàng ấm',
    price: 380000,
    badge: '3D + Giao tận nhà',
    deliveryText: 'Thử 3D & Giao tận nhà',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_den_hoa_dang.png',
    procedural3dId: 'den_hoa_dang',
    glb: '/Thiết kế giao diện/Vật phẩm 3D/fixed/den_hoa_dang.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_packages/coohom_den_hoa_dang.zip',
    equipSlot: 'hand',
    dimensions: '14 × 14 × 26 cm',
    material: 'Pha lê K9 tán sắc cao cấp kết hợp đế đồng mạ vàng',
    meaning: 'Dâng đăng cúng Phật tượng trưng cho ngọn đèn trí tuệ xua tan vô minh.'
  },
  {
    id: 'binh_gom_hoa_sen_3d',
    tab: '3d',
    name: 'Bình Gốm Hoa Sen Hồng & Búp Sen Cầm Tay (3D)',
    subtitle: 'Búp sen tươi 3 lớp cánh cầm tay lễ Phật & bình gốm men ngọc',
    price: 310000,
    badge: '3D + Giao tận nhà',
    deliveryText: 'Thử 3D & Giao tận nhà',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_chum_sanh_hoa_sen.png',
    procedural3dId: 'hoa_sen_tuoi',
    glb: '/Thiết kế giao diện/Vật phẩm 3D/fixed/chum_sanh_hoa_sen.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_packages/coohom_chum_sanh_hoa_sen.zip',
    equipSlot: 'hand',
    dimensions: '18 × 18 × 35 cm',
    material: 'Bình gốm thủ công và hoa sen lụa phủ sáp như thật',
    meaning: 'Dâng hoa cúng Phật gieo nhân lành tướng hảo, tâm hồn thơm ngát hương đức hạnh.'
  },
  {
    id: 'mam_ngu_qua_3d',
    tab: '3d',
    name: 'Mâm Bồng Ngũ Quả Miền Tây (3D)',
    subtitle: 'Mâm gỗ bày mãng cầu, dừa, đu đủ, xoài, sung dâng cúng Tam Bảo',
    price: 290000,
    badge: '3D + Giao tận nhà',
    deliveryText: 'Thử 3D & Giao tận nhà',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_mam_ngu_qua.png',
    procedural3dId: 'mam_ngu_qua',
    glb: '/Thiết kế giao diện/Vật phẩm 3D/fixed/mam_ngu_qua.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_packages/coohom_mam_ngu_qua.zip',
    equipSlot: 'altarItem',
    dimensions: 'Đường kính 28 cm × Cao 22 cm',
    material: 'Mâm gỗ tiện sơn mài và bộ trái cây mỹ thuật Nam Bộ',
    meaning: 'Biểu trưng cho luật Nhân Quả và tấm lòng hiếu kính dâng lên Tam Bảo, tổ tiên.'
  },
  {
    id: 'thac_khoi_tram_huong_3d',
    tab: '3d',
    name: 'Thác Khói Trầm Hương Lá Sen (3D)',
    subtitle: 'Tiểu cảnh thác trầm chảy ngược qua tầng lá sen xanh',
    price: 350000,
    badge: '3D + Giao tận nhà',
    deliveryText: 'Thử 3D & Giao tận nhà',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_nen_hoa_sen.png',
    procedural3dId: 'nen_hoa_sen',
    glb: '/Thiết kế giao diện/Vật phẩm 3D/fixed/nen_hoa_sen.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_packages/coohom_nen_hoa_sen.zip',
    equipSlot: 'altarItem',
    dimensions: '18 × 14 × 24 cm',
    material: 'Gốm men lưu ly xanh ngọc chế tác thủ công',
    meaning: 'Dòng khói trắng chảy nhẹ nhàng nhắc nhở sự vô thường và tĩnh lặng.'
  },
  {
    id: 'den_long_luc_giac_3d',
    tab: '3d',
    name: 'Đèn Lồng Gỗ Lục Giác Chùa Cổ (3D)',
    subtitle: 'Đèn lồng khung gỗ sáu cạnh lồng lụa vẽ sen hồng',
    price: 330000,
    badge: '3D + Giao tận nhà',
    deliveryText: 'Thử 3D & Giao tận nhà',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_den_long_luc_giac.png',
    procedural3dId: 'den_long_luc_giac',
    glb: '/Thiết kế giao diện/Vật phẩm 3D/fixed/den_long_luc_giac.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_packages/coohom_den_long_luc_giac.zip',
    equipSlot: 'altarItem',
    dimensions: '26 × 26 × 42 cm',
    material: 'Gỗ tràm chạm hoa văn cổ điển, vải lụa xuyên sáng ấm áp',
    meaning: 'Tái hiện vẻ đẹp kiến trúc truyền thống rực rỡ nơi hiên chùa và quầy lưu niệm.'
  },
  {
    id: 'the_go_cau_an_3d',
    tab: '3d',
    name: 'Thẻ Gỗ Cầu An Khắc Hoa Sen (3D)',
    subtitle: 'Thẻ gỗ thông khắc chữ Bình An treo dây kết Cát Tường đỏ',
    price: 75000,
    badge: '3D + Giao tận nhà',
    deliveryText: 'Thử 3D & Giao tận nhà',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_gio_may_tre.png',
    procedural3dId: 'the_go_cau_an_3d',
    glb: '/Thiết kế giao diện/Vật phẩm 3D/fixed/gio_may_tre.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_packages/coohom_gio_may_tre.zip',
    equipSlot: 'hand',
    dimensions: '9 × 14 × 0.8 cm',
    material: 'Gỗ thông khắc laser sắc nét, dây tết Cát Tường đỏ thắm',
    meaning: 'Ghi lời nguyện ước tốt lành gửi lại cây ước nguyện hoặc treo nơi góc học tập.'
  },
  {
    id: 'chau_bonsai_mai_chieu_thuy_3d',
    tab: '3d',
    name: 'Chậu Bonsai Mai Chiếu Thủy & Chum Sành Sen (3D)',
    subtitle: 'Cây cảnh bonsai dáng trực lắc và chum sành hoa sen sân Chùa Vĩnh Tràng',
    price: 550000,
    badge: '3D + Giao tận nhà',
    deliveryText: 'Thử 3D & Giao tận nhà',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_chum_sanh_hoa_sen.png',
    procedural3dId: 'chum_sanh_hoa_sen',
    glb: '/Thiết kế giao diện/Vật phẩm 3D/fixed/chum_sanh_hoa_sen.glb',
    zip: '/Thiết kế giao diện/Vật phẩm 3D/coohom_packages/coohom_chum_sanh_hoa_sen.zip',
    equipSlot: 'altarItem',
    dimensions: '32 × 26 × 38 cm',
    material: 'Chậu đất nung đỏ truyền thống & mô hình bonsai tỉ mỉ từng tán lá',
    meaning: 'Vẻ đẹp kiên cường, sum suê và thanh tao của vườn kiểng cổ tự miền Tây.'
  }
];

export function filterShopCatalog(tab = 'souvenir', searchQuery = '') {
  const q = String(searchQuery || '').trim().toLowerCase();
  return SHOP_CATALOG.filter((item) => {
    const matchTab = tab === 'all' ? true : item.tab === tab;
    if (!matchTab) return false;
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.meaning.toLowerCase().includes(q)
    );
  });
}

export function addToCart(cart, productId, qty = 1) {
  const product = SHOP_CATALOG.find((p) => p.id === productId);
  if (!product) return [...cart];
  const next = cart.map((entry) => ({ ...entry }));
  const existing = next.find((entry) => entry.id === productId);
  if (existing) {
    existing.qty = Math.min(99, existing.qty + Math.max(1, qty));
  } else {
    next.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      tab: product.tab,
      qty: Math.max(1, qty)
    });
  }
  return next;
}

export function updateCartQuantity(cart, productId, delta) {
  const next = [];
  for (const item of cart) {
    if (item.id === productId) {
      const updatedQty = item.qty + delta;
      if (updatedQty > 0) {
        next.push({ ...item, qty: Math.min(99, updatedQty) });
      }
    } else {
      next.push({ ...item });
    }
  }
  return next;
}

export function calculateCartSummary(cart) {
  const totalCount = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 0), 0);
  const shippingFee = totalCount === 0 ? 0 : subtotal >= 300000 ? 0 : 25000;
  return {
    totalCount,
    subtotal,
    shippingFee,
    grandTotal: subtotal + shippingFee
  };
}

export function validateOrderForm(form) {
  const name = String(form?.name || '').trim();
  const phone = String(form?.phone || '').replace(/\s+/g, '');
  const address = String(form?.address || '').trim();
  const errors = {};
  if (name.length < 2) errors.name = 'Vui lòng nhập họ tên người nhận.';
  if (!/^(0|\+84)[0-9]{8,10}$/.test(phone)) {
    errors.phone = 'Số điện thoại chưa hợp lệ (gồm 9–11 chữ số).';
  }
  if (address.length < 6) errors.address = 'Vui lòng nhập địa chỉ giao hàng chi tiết.';
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
