/**
 * Sạp hàng cổng chùa: danh mục & mua hàng.
 * (Tách từ chua-online-logic.mjs — import từ '/src/logic/chua-online-logic.mjs' vẫn dùng được.)
 */
import { createSpiritualState } from './spiritual-actions.mjs';
import { addToCart } from './shop-cart.mjs';
import { createStoreProfileState } from './store-items.mjs';

// ============================================================================
// TEMPLE ENTRANCE GROCERY HOUSE (NHÀ TẠP HÓA & QUÁN GIẢI KHÁT CỔNG CHÙA)
// ============================================================================
export const MARKETPLACE_STALL_CATEGORIES = [
  { id: 'all', icon: '🏪', label: 'Tất cả' },
  { id: 'huong_hoa', icon: '🪷', label: 'Hương, Đèn & Hoa lễ' },
  { id: 'thu_cong', icon: '📿', label: 'Lưu niệm & Văn hóa phẩm' },
  { id: 'phap_phuc', icon: '👘', label: 'Pháp phục & Đồ tu học' },
  { id: 'am_thuc_chay', icon: '🍲', label: 'Kho quẹt & Đặc sản chay' }
];

export const MARKETPLACE_STALL_CATALOG = [
  // === 1. HƯƠNG, ĐÈN & HOA LỄ ===
  {
    id: 'sap_nhang_tram',
    category: 'huong_hoa',
    icon: '🪔',
    name: 'Bó nhang trầm sạch (3 nén tâm hương)',
    subtitle: 'Hương trầm mộc ít khói dùng thắp tại lư hương sân chùa và bàn thờ Tam Bảo.',
    desc: 'Hương trầm mộc ít khói dùng thắp tại lư hương sân chùa và bàn thờ Tam Bảo.',
    priceVnd: 25000,
    lotusCost: 20,
    actionType: 'ritual_incense',
    offeringType: 'incense',
    cartProductId: 'lu_huong_dong_3d',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_bat_nhang_tram.png'
  },
  {
    id: 'sap_hoa_sen_tuoi',
    category: 'huong_hoa',
    icon: '🪷',
    name: 'Bó hoa sen hồng tươi dâng Phật',
    subtitle: 'Sen đồng tháp hái sớm còn đọng sương, dùng dâng hoa tại Đài Quán Thế Âm & Tam Bảo.',
    desc: 'Sen đồng tháp hái sớm còn đọng sương, dùng dâng hoa tại Đài Quán Thế Âm & Tam Bảo.',
    priceVnd: 45000,
    lotusCost: 30,
    actionType: 'ritual_lotus',
    offeringType: 'lotus',
    cartProductId: 'binh_gom_hoa_sen_3d',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_chum_sanh_hoa_sen.png'
  },
  {
    id: 'sap_mam_ngu_qua',
    category: 'huong_hoa',
    icon: '🥭',
    name: 'Mâm ngũ quả miền Tây',
    subtitle: 'Mãng cầu, dừa, đu đủ, xoài, sung bày sẵn trang nghiêm dâng lên bàn thờ Chánh điện.',
    desc: 'Mãng cầu, dừa, đu đủ, xoài, sung bày sẵn trang nghiêm dâng lên bàn thờ Chánh điện.',
    priceVnd: 95000,
    lotusCost: 50,
    actionType: 'ritual_lotus',
    offeringType: 'lotus',
    cartProductId: 'mam_ngu_qua_3d',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_mam_ngu_qua.png'
  },
  {
    id: 'sap_nhang_vong_khuynh_diep',
    category: 'huong_hoa',
    icon: '🌀',
    name: 'Hộp nhang vòng khuynh diệp không khói',
    subtitle: 'Hương lá khuynh diệp dịu nhẹ cháy bền 4 giờ, thích hợp thắp khấn tại gia và sân chùa.',
    desc: 'Hương lá khuynh diệp dịu nhẹ cháy bền 4 giờ, thích hợp thắp khấn tại gia và sân chùa.',
    priceVnd: 35000,
    lotusCost: 22,
    actionType: 'ritual_incense',
    offeringType: 'incense',
    cartProductId: 'lu_huong_dong_3d',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_bat_nhang_tram.png'
  },
  {
    id: 'sap_cap_den_cay_sen',
    category: 'huong_hoa',
    icon: '🕯️',
    name: 'Cặp nến hoa sen sáp bơ thực vật',
    subtitle: 'Đôi đèn cầy hình đoá sen hồng cháy không khói đen, tỏa ánh ấm áp nơi Phật đài.',
    desc: 'Đôi đèn cầy hình đoá sen hồng cháy không khói đen, tỏa ánh ấm áp nơi Phật đài.',
    priceVnd: 40000,
    lotusCost: 25,
    actionType: 'ritual_lotus',
    offeringType: 'lotus',
    cartProductId: 'nen_hoa_sen_3d',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_nen_hoa_sen.png'
  },

  // === 2. TẠP HÓA & LƯU NIỆM ===
  {
    id: 'sap_quat_nan_gio_may',
    category: 'thu_cong',
    icon: '🪭',
    name: 'Quạt nan lá dừa Tiền Giang',
    subtitle: 'Quạt thủ công làng nghề Tiền Giang nhẹ mát khi dạo quanh sân chùa.',
    desc: 'Quạt thủ công làng nghề Tiền Giang nhẹ mát khi dạo quanh sân chùa.',
    priceVnd: 55000,
    lotusCost: 30,
    actionType: 'handicraft',
    offeringType: null,
    cartProductId: 'quat_nan_gio_may',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_quat_nan_la_dua.png'
  },
  {
    id: 'sap_non_la_theu_sen',
    category: 'thu_cong',
    icon: '👒',
    name: 'Nón lá lụa thêu hoa sen Mỹ Tho',
    subtitle: 'Nón lá truyền thống vẽ/thêu sen hồng che nắng nhẹ trên đường vào bên hông chùa.',
    desc: 'Nón lá truyền thống vẽ/thêu sen hồng che nắng nhẹ trên đường vào bên hông chùa.',
    priceVnd: 135000,
    lotusCost: 65,
    actionType: 'handicraft',
    offeringType: null,
    cartProductId: 'non_la_theu_sen',
    image: '/Thiết kế giao diện/Vật phẩm 3D/render-non-la-theu-sen.jpg'
  },
  {
    id: 'sap_trang_hat_go',
    category: 'thu_cong',
    icon: '📿',
    name: 'Tràng hạt gỗ bồ đề thủ công 108 hạt',
    subtitle: 'Chuỗi hạt tiện tròn mộc mạc giúp an tâm niệm Phật và mang về làm kỷ niệm.',
    desc: 'Chuỗi hạt tiện tròn mộc mạc giúp an tâm niệm Phật và mang về làm kỷ niệm.',
    priceVnd: 160000,
    lotusCost: 75,
    actionType: 'handicraft',
    offeringType: null,
    cartProductId: 'trang_hat_go',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_bo_doan_tron.png'
  },
  {
    id: 'sap_gio_may_tre_sen',
    category: 'thu_cong',
    icon: '🧺',
    name: 'Giỏ mây tre đan đựng lễ vật',
    subtitle: 'Chiếc giỏ mây nhỏ nhắn đựng hoa sen, kinh sách và nước uống khi đi lễ chùa.',
    desc: 'Chiếc giỏ mây nhỏ nhắn đựng hoa sen, kinh sách và nước uống khi đi lễ chùa.',
    priceVnd: 145000,
    lotusCost: 60,
    actionType: 'handicraft',
    offeringType: null,
    cartProductId: 'gio_may_tre_3d',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_gio_may_tre.png'
  },
  {
    id: 'sap_khan_ran_nam_bo',
    category: 'thu_cong',
    icon: '🧣',
    name: 'Khăn rằn Nam Bộ thêu sen hồng',
    subtitle: 'Khăn bông thấm mồ hôi dệt sọc truyền thống, tiện quàng cổ khi đi nắng.',
    desc: 'Khăn bông thấm mồ hôi dệt sọc truyền thống, tiện quàng cổ khi đi nắng.',
    priceVnd: 95000,
    lotusCost: 42,
    actionType: 'handicraft',
    offeringType: null,
    cartProductId: 'khan_ran_nam_bo',
    image: '/Thiết kế giao diện/Nhân vật 3D/render-items-nam-v2.jpg'
  },
  {
    id: 'sap_tui_vai_di_chua',
    category: 'thu_cong',
    icon: '👜',
    name: 'Túi vải bố thêu hoa sen đi chùa',
    subtitle: 'Túi vải mộc dày dặn đựng vật dụng cá nhân, tràng hạt và quyển sổ tay.',
    desc: 'Túi vải mộc dày dặn đựng vật dụng cá nhân, tràng hạt và quyển sổ tay.',
    priceVnd: 145000,
    lotusCost: 60,
    actionType: 'handicraft',
    offeringType: null,
    cartProductId: 'tui_vai_theu_sen',
    image: '/Thiết kế giao diện/Vật phẩm 3D/render-tui-vai-theu-sen-34.png'
  },
  {
    id: 'sap_my_nghe_go_dua',
    category: 'thu_cong',
    icon: '🥥',
    name: 'Bộ mỹ nghệ gỗ dừa Mỹ Tho (Chén & Đũa chạm sen)',
    subtitle: 'Đồ thủ công mỹ nghệ từ gỗ dừa lão Tiền Giang tiện mịn, thơm mộc làm quà lưu niệm.',
    desc: 'Đồ thủ công mỹ nghệ từ gỗ dừa lão Tiền Giang tiện mịn, thơm mộc làm quà lưu niệm.',
    priceVnd: 120000,
    lotusCost: 52,
    actionType: 'handicraft',
    offeringType: null,
    cartProductId: 'gio_may_tre_3d',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_gio_may_tre.png'
  },
  {
    id: 'sap_tuong_di_lac_mini',
    category: 'thu_cong',
    icon: '🙏',
    name: 'Tượng Phật Di Lặc lưu niệm để bàn (gỗ mít sơn son)',
    subtitle: 'Pho tượng nhỏ nhắn mang nụ cười hoan hỉ thỉnh từ Quầy Lưu Niệm Chùa Vĩnh Tràng.',
    desc: 'Pho tượng nhỏ nhắn mang nụ cười hoan hỉ thỉnh từ Quầy Lưu Niệm Chùa Vĩnh Tràng.',
    priceVnd: 185000,
    lotusCost: 80,
    actionType: 'handicraft',
    offeringType: null,
    cartProductId: 'trang_hat_go',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_bo_doan_tron.png'
  },
  {
    id: 'sap_kinh_sach_niem_phat',
    category: 'thu_cong',
    icon: '📖',
    name: 'Sách Kinh Nhật Tụng & Cẩm Nang Ăn Chay',
    subtitle: 'Ấn phẩm Phật giáo chữ to dễ đọc cho cô bác hành hương mang về thực tập hằng ngày.',
    desc: 'Ấn phẩm Phật giáo chữ to dễ đọc cho cô bác hành hương mang về thực tập hằng ngày.',
    priceVnd: 45000,
    lotusCost: 20,
    actionType: 'handicraft',
    offeringType: null,
    cartProductId: 'trang_hat_go',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_bo_doan_tron.png'
  },

  // === 3. KHO QUẸT CHAY, ĐẶC SẢN CHAY & GIẢI KHÁT CHÙA VĨNH TRÀNG ===
  {
    id: 'sap_kho_quet_chay',
    category: 'am_thuc_chay',
    icon: '🍲',
    name: 'Hũ Kho Quẹt Chay Nấm Hương & Tiêu Xanh (250g)',
    subtitle: 'Đặc sản chay nổi tiếng ở nhà lưu niệm chùa miền Tây: nấm đông cô, đậu hũ, tiêu xanh rim sệt chấm rau luộc cơm cháy cực hao cơm.',
    desc: 'Đặc sản chay nổi tiếng ở nhà lưu niệm chùa miền Tây: nấm đông cô, đậu hũ, tiêu xanh rim sệt chấm rau luộc cơm cháy cực hao cơm.',
    priceVnd: 65000,
    lotusCost: 30,
    actionType: 'refreshment',
    offeringType: null,
    cartProductId: 'combo_qua_que_mien_tay',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_dia_banh_bo.png'
  },
  {
    id: 'sap_chao_mon_chay',
    category: 'am_thuc_chay',
    icon: '🫙',
    name: 'Hũ Chao Môn Chay Béo Bùi Miền Tây',
    subtitle: 'Chao khoai môn ủ men tự nhiên thơm béo, ăn kèm rau muống luộc, đậu bắp hay làm nước chấm lẩu chay.',
    desc: 'Chao khoai môn ủ men tự nhiên thơm béo, ăn kèm rau muống luộc, đậu bắp hay làm nước chấm lẩu chay.',
    priceVnd: 55000,
    lotusCost: 25,
    actionType: 'refreshment',
    offeringType: null,
    cartProductId: 'combo_qua_que_mien_tay',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_dia_banh_da_lon.png'
  },
  {
    id: 'sap_tuong_hot_muoi_me_chay',
    category: 'am_thuc_chay',
    icon: '🥜',
    name: 'Cặp Hũ Muối Mè Đậu Phộng & Tương Hột Chay',
    subtitle: 'Món chay mộc mạc rang thủ công tại bếp chay miền Tây, đóng hũ thủy tinh sạch sẽ mang về biếu gia đình.',
    desc: 'Món chay mộc mạc rang thủ công tại bếp chay miền Tây, đóng hũ thủy tinh sạch sẽ mang về biếu gia đình.',
    priceVnd: 60000,
    lotusCost: 28,
    actionType: 'refreshment',
    offeringType: null,
    cartProductId: 'combo_qua_que_mien_tay',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_dia_banh_bo.png'
  },
  {
    id: 'sap_dua_xiem_my_tho',
    category: 'am_thuc_chay',
    icon: '🥥',
    name: 'Trái dừa xiêm xanh Mỹ Tho ướp lạnh',
    subtitle: 'Nước dừa ngọt thanh từ thùng đá mát lạnh ngay tại khu lưu niệm Chùa Vĩnh Tràng.',
    desc: 'Nước dừa ngọt thanh từ thùng đá mát lạnh ngay tại khu lưu niệm Chùa Vĩnh Tràng.',
    priceVnd: 25000,
    lotusCost: 15,
    actionType: 'refreshment',
    offeringType: null,
    cartProductId: 'trai_dua_xiem_3d',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_trai_dua_xiem.png'
  },
  {
    id: 'sap_nuoc_suoi_khan_lanh',
    category: 'am_thuc_chay',
    icon: '🧴',
    name: 'Nước suối ướp lạnh & Khăn lạnh',
    subtitle: 'Chai nước tinh khiết 500ml lấy trực tiếp từ tủ mát của Nhà Tạp Hóa.',
    desc: 'Chai nước tinh khiết 500ml lấy trực tiếp từ tủ mát của Nhà Tạp Hóa.',
    priceVnd: 10000,
    lotusCost: 8,
    actionType: 'refreshment',
    offeringType: null,
    cartProductId: 'trai_dua_xiem_3d',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_trai_dua_xiem.png'
  },
  {
    id: 'sap_tra_tac_mat_ong',
    category: 'am_thuc_chay',
    icon: '🧋',
    name: 'Ly trà tắc mật ong giải nhiệt',
    subtitle: 'Trà xanh thanh mát pha tắc tươi thơm lừng, uống ngay dưới mái hiên quán.',
    desc: 'Trà xanh thanh mát pha tắc tươi thơm lừng, uống ngay dưới mái hiên quán.',
    priceVnd: 15000,
    lotusCost: 12,
    actionType: 'refreshment',
    offeringType: null,
    cartProductId: 'trai_dua_xiem_3d',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_trai_dua_xiem.png'
  },
  {
    id: 'sap_sam_bo_luong_bi_dao',
    category: 'am_thuc_chay',
    icon: '🥤',
    name: 'Nước sâm bí đao & Mía lau mát lạnh',
    subtitle: 'Nấu từ mía lau, rễ tranh và la hán quả giúp thanh nhiệt suốt buổi đi chùa.',
    desc: 'Nấu từ mía lau, rễ tranh và la hán quả giúp thanh nhiệt suốt buổi đi chùa.',
    priceVnd: 18000,
    lotusCost: 14,
    actionType: 'refreshment',
    offeringType: null,
    cartProductId: 'trai_dua_xiem_3d',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_trai_dua_xiem.png'
  },
  {
    id: 'sap_banh_bo_thot_not',
    category: 'am_thuc_chay',
    icon: '🍰',
    name: 'Đĩa bánh bò thốt nốt & bánh da lợn chay',
    subtitle: 'Món bánh dân gian Nam Bộ dẻo thơm hương lá dứa và đường thốt nốt.',
    desc: 'Món bánh dân gian Nam Bộ dẻo thơm hương lá dứa và đường thốt nốt.',
    priceVnd: 45000,
    lotusCost: 25,
    actionType: 'refreshment',
    offeringType: null,
    cartProductId: 'combo_qua_que_mien_tay',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_dia_banh_bo.png'
  },
  {
    id: 'sap_banh_pia_chay',
    category: 'am_thuc_chay',
    icon: '🥮',
    name: 'Hộp bánh pía chay đậu xanh sầu riêng',
    subtitle: 'Đặc sản miền Tây vỏ mỏng ngàn lớp, nhân đậu xanh thuần chay thơm bùi.',
    desc: 'Đặc sản miền Tây vỏ mỏng ngàn lớp, nhân đậu xanh thuần chay thơm bùi.',
    priceVnd: 65000,
    lotusCost: 35,
    actionType: 'refreshment',
    offeringType: null,
    cartProductId: 'combo_qua_que_mien_tay',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_dia_banh_da_lon.png'
  },
  {
    id: 'sap_hat_sen_say_gion',
    category: 'am_thuc_chay',
    icon: '🪷',
    name: 'Hũ hạt sen sấy giòn & Mứt dừa non',
    subtitle: 'Quà vặt thuần chay đóng hũ gọn nhẹ mang về biếu ông bà cha mẹ.',
    desc: 'Quà vặt thuần chay đóng hũ gọn nhẹ mang về biếu ông bà cha mẹ.',
    priceVnd: 75000,
    lotusCost: 40,
    actionType: 'refreshment',
    offeringType: null,
    cartProductId: 'combo_qua_que_mien_tay',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_dia_banh_bo.png'
  },
  {
    id: 'sap_tram_nu_thac_khoi',
    category: 'huong_hoa',
    icon: '🌫️',
    name: 'Hộp 36 nụ trầm hương thác khói tự nhiên',
    subtitle: 'Trầm nụ nguyên chất mùi ấm dịu, thích hợp đốt cùng thác khói lá sen tại phòng thờ.',
    desc: 'Trầm nụ nguyên chất mùi ấm dịu, thích hợp đốt cùng thác khói lá sen tại phòng thờ.',
    priceVnd: 85000,
    lotusCost: 38,
    actionType: 'ritual_incense',
    offeringType: 'incense',
    cartProductId: 'thac_khoi_tram_huong_3d',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_nen_hoa_sen.png'
  },
  {
    id: 'sap_dau_gio_thao_duoc',
    category: 'thu_cong',
    icon: '🌿',
    name: 'Chai dầu gió thảo dược khuynh diệp Mỹ Tho',
    subtitle: 'Tinh dầu tràm và bạc hà dịu nhẹ bỏ túi cho cô bác đi hành hương đường xa.',
    desc: 'Tinh dầu tràm và bạc hà dịu nhẹ bỏ túi cho cô bác đi hành hương đường xa.',
    priceVnd: 45000,
    lotusCost: 22,
    actionType: 'handicraft',
    offeringType: null,
    cartProductId: 'quat_nan_gio_may',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_gio_may_tre.png'
  },

  // === 4. PHÁP PHỤC & ĐỒ TU HỌC TẠI GIA ===
  {
    id: 'sap_ao_trang_lam',
    category: 'phap_phuc',
    icon: '👘',
    name: 'Bộ Pháp Phục Áo Tràng Lam Phật Tử (Vải Đũi Mát)',
    subtitle: 'Áo tràng cổ tàu 5 nút màu lam khói thanh lịch, đủ cỡ Nam · Nữ · Người lớn tuổi.',
    desc: 'Áo tràng cổ tàu 5 nút màu lam khói thanh lịch, đủ cỡ Nam · Nữ · Người lớn tuổi.',
    priceVnd: 260000,
    lotusCost: 95,
    actionType: 'handicraft',
    offeringType: null,
    cartProductId: 'ao_trang_phat_tu',
    image: '/public/assets/aistudio/image_8f6004e3.png'
  },
  {
    id: 'sap_bo_doan_thien',
    category: 'phap_phuc',
    icon: '🧘',
    name: 'Bồ Đoàn Tọa Thiền Đài Sen Vỏ Đậu Xanh',
    subtitle: 'Đệm ngồi thiền và tụng kinh êm ái, thoáng khí như bồ đoàn trong Chánh điện.',
    desc: 'Đệm ngồi thiền và tụng kinh êm ái, thoáng khí như bồ đoàn trong Chánh điện.',
    priceVnd: 280000,
    lotusCost: 90,
    actionType: 'handicraft',
    offeringType: null,
    cartProductId: 'toa_sen_ngoi_thien',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_bo_doan_dai_sen.png'
  },
  {
    id: 'sap_mo_go_tung_kinh',
    category: 'phap_phuc',
    icon: '🪵',
    name: 'Mõ Gỗ Mít Tụng Kinh Chạm Song Ngư & Dùi',
    subtitle: 'Âm mõ trầm ấm đều nhịp, chạm khắc thủ công từ lõi gỗ mít già bền đẹp.',
    desc: 'Âm mõ trầm ấm đều nhịp, chạm khắc thủ công từ lõi gỗ mít già bền đẹp.',
    priceVnd: 340000,
    lotusCost: 110,
    actionType: 'handicraft',
    offeringType: null,
    cartProductId: 'mo_go_mit_cham_rong',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_mo_go_tung_kinh.png'
  },
  {
    id: 'sap_den_hoa_sen_led',
    category: 'phap_phuc',
    icon: '🏮',
    name: 'Cặp Đèn Hoa Sen Pha Lê 7 Cánh Bàn Thờ',
    subtitle: 'Tỏa ánh sáng vàng ấm trang nghiêm nơi bàn thờ gia tiên và góc tu tập tại gia.',
    desc: 'Tỏa ánh sáng vàng ấm trang nghiêm nơi bàn thờ gia tiên và góc tu tập tại gia.',
    priceVnd: 380000,
    lotusCost: 120,
    actionType: 'handicraft',
    offeringType: null,
    cartProductId: 'den_hoa_sen_pha_le_3d',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_den_hoa_dang.png'
  },
  {
    id: 'sap_tra_sen_dong_thap',
    category: 'am_thuc_chay',
    icon: '🍵',
    name: 'Hộp Trà Ướp Hoa Sen Đồng Tháp Thượng Hạng',
    subtitle: 'Trà mộc ướp nhụy sen tươi thơm dịu thanh tao, thích hợp thưởng trà cùng gia đình.',
    desc: 'Trà mộc ướp nhụy sen tươi thơm dịu thanh tao, thích hợp thưởng trà cùng gia đình.',
    priceVnd: 125000,
    lotusCost: 52,
    actionType: 'refreshment',
    offeringType: null,
    cartProductId: 'bo_am_tra_sen_gom',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_chum_sanh_hoa_sen.png'
  },
  {
    id: 'sap_mut_dua_non_my_tho',
    category: 'am_thuc_chay',
    icon: '🥥',
    name: 'Hộp Mứt Dừa Non Lá Dứa Mỹ Tho Ít Ngọt (300g)',
    subtitle: 'Dừa non nạo dải dẻo mềm sên với nước cốt lá dứa tươi, quà quê miền Tây chuẩn vị.',
    desc: 'Dừa non nạo dải dẻo mềm sên với nước cốt lá dứa tươi, quà quê miền Tây chuẩn vị.',
    priceVnd: 78000,
    lotusCost: 36,
    actionType: 'refreshment',
    offeringType: null,
    cartProductId: 'combo_qua_que_mien_tay',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_dia_banh_da_lon.png'
  }
];

export function filterMarketplaceItems(categoryId = 'all') {
  if (!categoryId || categoryId === 'all') return MARKETPLACE_STALL_CATALOG;
  const isKnown = MARKETPLACE_STALL_CATEGORIES.some((cat) => cat.id === categoryId);
  if (!isKnown) return MARKETPLACE_STALL_CATALOG;
  return MARKETPLACE_STALL_CATALOG.filter((item) => item.category === categoryId);
}

export function purchaseMarketplaceItem(
  storeProfile,
  spiritualState,
  cart = [],
  itemId,
  mode = 'use_now'
) {
  const nextProfile = createStoreProfileState(storeProfile);
  const nextSpiritual = createSpiritualState(spiritualState);
  let nextCart = Array.isArray(cart) ? cart.map((entry) => ({ ...entry })) : [];
  const item = MARKETPLACE_STALL_CATALOG.find((x) => x.id === itemId);
  if (!item) {
    return {
      ok: false,
      message: 'Không tìm thấy món hàng tại sạp.',
      storeProfile: nextProfile,
      spiritual: nextSpiritual,
      cart: nextCart
    };
  }

  if (mode === 'cart') {
    const beforeQty = nextCart.reduce((s, e) => s + (e.qty || 1), 0);
    const triedCatalog = addToCart(nextCart, item.cartProductId, 1);
    const afterQty = triedCatalog.reduce((s, e) => s + (e.qty || 1), 0);
    if (afterQty > beforeQty) {
      nextCart = triedCatalog;
    } else {
      const targetId = item.cartProductId || item.id;
      const existing = nextCart.find((e) => e.id === targetId);
      if (existing) {
        existing.qty = Math.min(99, (existing.qty || 1) + 1);
      } else {
        nextCart.push({
          id: targetId,
          name: item.name,
          price: item.priceVnd,
          image: item.image,
          tab: 'marketplace',
          qty: 1
        });
      }
    }
    return {
      ok: true,
      mode: 'cart',
      item,
      message: `Đã thêm "${item.name}" vào giỏ quà giao tận nhà.`,
      storeProfile: nextProfile,
      spiritual: nextSpiritual,
      cart: nextCart
    };
  }

  if (nextProfile.lotusPoints < item.lotusCost) {
    return {
      ok: false,
      reason: 'insufficient_lotus',
      message: `Cần ${item.lotusCost} 🪷 để thỉnh ${item.name} tại sạp.`,
      storeProfile: nextProfile,
      spiritual: nextSpiritual,
      cart: nextCart
    };
  }

  nextProfile.lotusPoints -= item.lotusCost;
  nextProfile.ownedCounts[item.id] = (nextProfile.ownedCounts[item.id] || 0) + 1;

  if (item.actionType === 'ritual_incense') {
    nextSpiritual.incenseOfferings += 1;
  } else if (item.actionType === 'ritual_lotus') {
    nextSpiritual.lotusOfferings += 1;
  }

  return {
    ok: true,
    mode: 'use_now',
    item,
    message: `Đã thỉnh ${item.name} tại sạp cổng chùa!`,
    storeProfile: nextProfile,
    spiritual: nextSpiritual,
    cart: nextCart
  };
}
