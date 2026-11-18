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
  { id: 'huong_hoa', icon: '🪷', label: 'Hương, Đèn & Hoa lễ' },
  { id: 'thu_cong', icon: '🧺', label: 'Tạp hóa & Lưu niệm' },
  { id: 'am_thuc_chay', icon: '🥤', label: 'Nước giải khát & Bánh chay' }
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

  // === 3. NƯỚC GIẢI KHÁT & BÁNH CHAY (NHÀ TẠP HÓA) ===
  {
    id: 'sap_dua_xiem_my_tho',
    category: 'am_thuc_chay',
    icon: '🥥',
    name: 'Trái dừa xiêm xanh Mỹ Tho ướp lạnh',
    subtitle: 'Nước dừa ngọt thanh từ thùng đá mát lạnh ngay cạnh Cổng Phụ Chùa Vĩnh Tràng.',
    desc: 'Nước dừa ngọt thanh từ thùng đá mát lạnh ngay cạnh Cổng Phụ Chùa Vĩnh Tràng.',
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
  }
];

export function filterMarketplaceItems(categoryId = 'huong_hoa') {
  if (!categoryId || categoryId === 'all') return MARKETPLACE_STALL_CATALOG;
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
