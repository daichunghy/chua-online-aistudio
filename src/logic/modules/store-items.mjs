/**
 * Catalog 9 tab cửa hàng, hồ sơ cửa hàng, mua/thử đồ.
 * (Tách từ chua-online-logic.mjs — import từ '/src/logic/chua-online-logic.mjs' vẫn dùng được.)
 */
import { createSpiritualState } from './spiritual-actions.mjs';

/**
 * 9-Category In-Temple Store ("Cửa hàng" matching visual reference attachments)
 * Categories: Lễ vật, Cây Phật, Áo tràng, Tràng hạt, Bồ đoàn, Mũ, Pháp khí, Mây, Linh thú
 * Includes roadside specialties (Dừa xiêm, Bánh bò, Bánh da lợn), live 3D protagonist preview ("Xem thử"),
 * and unlock/purchase logic.
 */
export const STORE_CATEGORIES = [
  { id: 'le_vat', label: 'Lễ vật' },
  { id: 'cay_phat', label: 'Cây Phật' },
  { id: 'ao_trang', label: 'Áo tràng' },
  { id: 'trang_hat', label: 'Tràng hạt' },
  { id: 'bo_doan', label: 'Bồ đoàn' },
  { id: 'mu', label: 'Mũ' },
  { id: 'phap_khi', label: 'Pháp khí' },
  { id: 'may', label: 'Mây' },
  { id: 'linh_thu', label: 'Linh thú' }
];

export const STORE_ITEMS_CATALOG = [
  // === 1. LỄ VẬT (bao gồm thức quà & nước giải khát hàng quán ven chùa) ===
  {
    id: 'trai_dua_xiem_store',
    category: 'le_vat',
    slot: 'handItem',
    prop3d: 'trai_dua_xiem',
    name: 'Trái dừa xiêm ống hút tre',
    description: 'Nước dừa xiêm Mỹ Tho mát lành từ hàng quán ven cổng chùa.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_trai_dua_xiem.png',
    currency: 'lotus',
    price: 30,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },
  {
    id: 'dia_banh_bo_store',
    category: 'le_vat',
    slot: 'offering',
    prop3d: 'dia_banh_bo',
    name: 'Đĩa bánh bò thốt nốt',
    description: 'Bánh bò thốt nốt vàng ươm thơm dịu bày tại sạp hàng dọc lối vào chùa.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_dia_banh_bo.png',
    currency: 'lotus',
    price: 45,
    requiredLevel: 1,
    rare: false,
    tryable: false
  },
  {
    id: 'dia_banh_da_lon_store',
    category: 'le_vat',
    slot: 'offering',
    prop3d: 'dia_banh_da_lon',
    name: 'Đĩa bánh da lợn ngũ sắc',
    description: 'Thức quà chay lá dứa đậu xanh truyền thống Nam Bộ.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_dia_banh_da_lon.png',
    currency: 'lotus',
    price: 45,
    requiredLevel: 1,
    rare: false,
    tryable: false
  },
  {
    id: 'mam_ngu_qua_store',
    category: 'le_vat',
    slot: 'offering',
    prop3d: 'mam_ngu_qua',
    name: 'Mâm ngũ quả dâng Phật',
    description: 'Mâm gỗ bày mãng cầu, dừa, đu đủ, xoài, sung dâng lên Tam Bảo.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_mam_ngu_qua.png',
    currency: 'gem',
    price: 40,
    requiredLevel: 1,
    rare: false,
    tryable: false
  },
  {
    id: 'bat_nhang_tram_store',
    category: 'le_vat',
    slot: 'offering',
    prop3d: 'bat_nhang_tram',
    name: 'Bát nhang hương trầm',
    description: 'Bát nhang đồng cổ chạm nổi kèm ba nén tâm hương Giới – Định – Tuệ.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_bat_nhang_tram.png',
    currency: 'lotus',
    price: 60,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },
  {
    id: 'nen_hoa_sen_store',
    category: 'le_vat',
    slot: 'handItem',
    prop3d: 'nen_hoa_sen',
    name: 'Nến hoa sen phát sáng',
    description: 'Đài sen sáp hồng ấm áp nâng niu khi lễ Phật buổi chiều.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_nen_hoa_sen.png',
    currency: 'lotus',
    price: 55,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },
  {
    id: 'trai_dua_xiem_store',
    category: 'le_vat',
    slot: 'offering',
    prop3d: 'trai_dua_xiem',
    name: 'Trái dừa xiêm dâng cúng',
    description: 'Dừa xiêm Bến Tre – Mỹ Tho tươi ngọt dâng lên bàn thờ hoặc thưởng thức.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_trai_dua_xiem.png',
    currency: 'lotus',
    price: 30,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },
  {
    id: 'chum_sen_dang_phat_store',
    category: 'le_vat',
    slot: 'offering',
    prop3d: 'chum_sanh_hoa_sen',
    name: 'Chum sành cắm hoa sen',
    description: 'Bình gốm Nam Bộ men trầm cắm đoá sen hồng tinh khiết đặt trước điện Phật.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_chum_sanh_hoa_sen.png',
    currency: 'lotus',
    price: 75,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },

  // === 2. CÂY PHẬT (đúng nội dung & giá ngọc theo ảnh tham chiếu 1) ===
  {
    id: 'chau_sen_phat',
    category: 'cay_phat',
    slot: 'tree',
    prop3d: 'chum_sanh_hoa_sen',
    name: 'Chậu sen',
    description:
      'Sen không phải cây thân gỗ nên được trồng trong chậu đá. Tương truyền Đức Phật đản sinh bước bảy bước, mỗi bước nở một đoá sen. Mỗi 7 ngày cho 5 quả quý, tối đa 5 lần.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_chum_sanh_hoa_sen.png',
    currency: 'gem',
    price: 50,
    requiredLevel: 1,
    rare: false,
    stackable: true,
    tryable: true
  },
  {
    id: 'cay_bo_de_phat',
    category: 'cay_phat',
    slot: 'tree',
    prop3d: 'cay_bo_de',
    name: 'Cây bồ đề',
    description:
      'Đức Phật thành đạo dưới cội bồ đề (Ficus religiosa) ở Bodh Gaya. Mỗi 7 ngày cho 10 quả quý, tối đa 5 lần.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_chum_sanh_hoa_sen.png',
    thumbIcon: '🌳',
    currency: 'gem',
    price: 100,
    requiredLevel: 1,
    rare: false,
    stackable: true,
    tryable: false
  },
  {
    id: 'cay_sala_phat',
    category: 'cay_phat',
    slot: 'tree',
    prop3d: 'cay_sala',
    name: 'Cây sala',
    description:
      'Sala (Shorea robusta) hoa nhỏ vàng trắng. Đức Phật đản sinh trong rừng sala ở Lâm Tỳ Ni và nhập Niết bàn giữa đôi cây sala ở Câu Thi Na. Mỗi 7 ngày cho 15 quả quý, tối đa 5 lần.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_chum_sanh_hoa_sen.png',
    thumbIcon: '🌺',
    currency: 'gem',
    price: 150,
    requiredLevel: 1,
    rare: false,
    stackable: true,
    tryable: false
  },

  // === 3. ÁO TRÀNG & PHÁP PHỤC (12 mẫu thiết kế riêng 3D đa sắc: Áo tràng, Áo lam, Áo bà ba, Áo dài, Áo gấm) ===
  {
    id: 'ao_trang_nau',
    category: 'ao_trang',
    slot: 'robe',
    robeStyle: 'nau_thien',
    name: 'Áo tràng nâu',
    description: 'Màu nâu đất mộc mạc · Thiết kế cổ chéo truyền thống Nam Bộ.',
    elderBenefit: 'Mặc trực tiếp lên nhân vật 3D khi vào Chánh điện lễ Phật.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#7A5438',
    secondarySwatchHex: '#4B3221',
    robeTint: [0.54, 0.37, 0.25],
    upperTint: [0.52, 0.35, 0.23],
    lowerTint: [0.36, 0.24, 0.16],
    trimTint: [0.28, 0.18, 0.11],
    sashTint: [0.76, 0.56, 0.24],
    currency: 'lotus',
    price: 120,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },
  {
    id: 'ao_trang_trang',
    category: 'ao_trang',
    slot: 'robe',
    robeStyle: 'trang_vu_lan',
    name: 'Áo tràng trắng',
    description: 'Trắng tinh khôi như mùa Vu Lan · Đính khuy sen ngọc.',
    elderBenefit: 'Thanh nhã trang nghiêm, phù hợp cho cô bác mặc ngày rằm & mùng 1.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#EBE8DF',
    secondarySwatchHex: '#C8B88C',
    robeTint: [0.92, 0.90, 0.87],
    upperTint: [0.93, 0.91, 0.88],
    lowerTint: [0.85, 0.83, 0.78],
    trimTint: [0.78, 0.70, 0.48],
    sashTint: [0.74, 0.66, 0.44],
    currency: 'lotus',
    price: 200,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },
  {
    id: 'ao_vang_nghe',
    category: 'ao_trang',
    slot: 'robe',
    robeStyle: 'vang_sa_mon',
    name: 'Áo vàng nghệ',
    description: 'Dành cho người đã tinh tấn đến cấp 10 · Kèm y chéo viền vàng.',
    elderBenefit: 'Pháp phục cao quý tỏa sắc vàng ấm áp khi hành hương toàn khuôn viên.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#D89F2B',
    secondarySwatchHex: '#9C2B1E',
    robeTint: [0.88, 0.65, 0.22],
    upperTint: [0.88, 0.64, 0.19],
    lowerTint: [0.72, 0.48, 0.14],
    trimTint: [0.64, 0.19, 0.12],
    sashTint: [0.74, 0.24, 0.14],
    currency: 'lotus',
    price: 350,
    requiredLevel: 10,
    rare: false,
    tryable: true
  },
  {
    id: 'ao_hoa_sen',
    category: 'ao_trang',
    slot: 'robe',
    robeStyle: 'hoa_sen_phat',
    name: 'Áo hoa sen',
    description: 'Áo hồng phấn thêu sen nổi 3D và dải lụa ngọc bích.',
    elderBenefit: 'Mặc vào hiện rõ họa tiết hoa sen hồng tươi thanh lịch trên nhân vật 3D.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#E08DAA',
    secondarySwatchHex: '#357A52',
    robeTint: [0.88, 0.56, 0.67],
    upperTint: [0.89, 0.57, 0.69],
    lowerTint: [0.82, 0.78, 0.75],
    trimTint: [0.97, 0.94, 0.95],
    sashTint: [0.22, 0.48, 0.34],
    currency: 'gem',
    price: 60,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },
  {
    id: 'ao_vu_lan_hong',
    category: 'ao_trang',
    slot: 'robe',
    robeStyle: 'vu_lan_bao_hieu',
    name: 'Áo Vu Lan hồng',
    description: 'Hồng phấn viền trắng ngà, cài Bông Hồng Vu Lan trước ngực.',
    elderBenefit: 'Mặc mùa báo hiếu, tri ân công đức sinh thành của cha mẹ.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#EA9AB7',
    secondarySwatchHex: '#D92B48',
    robeTint: [0.93, 0.64, 0.74],
    upperTint: [0.94, 0.65, 0.76],
    lowerTint: [0.64, 0.28, 0.39],
    trimTint: [0.98, 0.96, 0.97],
    sashTint: [0.84, 0.22, 0.34],
    currency: 'gem',
    price: 100,
    requiredLevel: 1,
    rare: true,
    tryable: true
  },
  {
    id: 'ao_may_bac',
    category: 'ao_trang',
    slot: 'robe',
    robeStyle: 'may_bac_tinh_tan',
    name: 'Áo mây bạc',
    description: 'Xám bạc dệt cổ vân mây trắng ngà, nhẹ như sương sớm.',
    elderBenefit: 'Cổ áo vân mây thanh thoát, nổi bật rõ nét trong Chánh điện.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#B6C2CE',
    secondarySwatchHex: '#F4F7FB',
    robeTint: [0.74, 0.79, 0.85],
    upperTint: [0.74, 0.79, 0.86],
    lowerTint: [0.36, 0.42, 0.50],
    trimTint: [0.95, 0.97, 0.99],
    sashTint: [0.54, 0.63, 0.74],
    currency: 'gem',
    price: 100,
    requiredLevel: 1,
    rare: true,
    tryable: true
  },
  {
    id: 'ao_lam_truyen_thong',
    category: 'ao_trang',
    slot: 'robe',
    robeStyle: 'lam_truyen_thong',
    name: 'Áo Lam truyền thống',
    description: 'Xám lam đi chùa trang nhã, phối quần sẫm gọn gàng và khuy đồng cổ.',
    elderBenefit: 'Trang phục chuẩn mực nhất của Phật tử miền Tây khi vào lễ Tam Bảo.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#637588',
    secondarySwatchHex: '#37424E',
    robeTint: [0.44, 0.52, 0.61],
    upperTint: [0.46, 0.54, 0.63],
    lowerTint: [0.27, 0.32, 0.39],
    trimTint: [0.24, 0.30, 0.37],
    sashTint: [0.78, 0.60, 0.28],
    currency: 'lotus',
    price: 90,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },
  {
    id: 'ao_ba_ba_nau_nam_bo',
    category: 'ao_trang',
    slot: 'robe',
    robeStyle: 'ba_ba_nau',
    name: 'Áo Bà Ba nâu Nam Bộ',
    description: 'Áo bà ba nâu sồng miền sông nước, quần đen óng và viền cổ khăn rằn.',
    elderBenefit: 'Gần gũi thân quen như ngày hội chùa quê Tiền Giang.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#6F4A32',
    secondarySwatchHex: '#25211E',
    robeTint: [0.48, 0.32, 0.22],
    upperTint: [0.52, 0.34, 0.23],
    lowerTint: [0.18, 0.16, 0.16],
    trimTint: [0.90, 0.84, 0.74],
    sashTint: [0.35, 0.22, 0.15],
    currency: 'lotus',
    price: 140,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },
  {
    id: 'ao_ba_ba_trang_sen',
    category: 'ao_trang',
    slot: 'robe',
    robeStyle: 'ba_ba_trang',
    name: 'Áo Bà Ba trắng đi chùa',
    description: 'Áo bà ba trắng ngà cổ tròn khuy ngọc, quần sẫm thanh lịch cài sen.',
    elderBenefit: 'Mát mẻ, sáng sủa, tôn nét hiền hòa cho cô bác và gia đình.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#F3EFE6',
    secondarySwatchHex: '#2C3748',
    robeTint: [0.94, 0.92, 0.87],
    upperTint: [0.95, 0.93, 0.89],
    lowerTint: [0.22, 0.26, 0.33],
    trimTint: [0.85, 0.74, 0.48],
    sashTint: [0.91, 0.56, 0.69],
    currency: 'lotus',
    price: 160,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },
  {
    id: 'ao_dai_lam_le_phat',
    category: 'ao_trang',
    slot: 'robe',
    robeStyle: 'dai_lam_le',
    name: 'Áo Dài Lam lễ Phật',
    description: 'Tà áo dài xanh thanh thiên dịu mắt phối quần lụa trắng ngà tinh khôi.',
    elderBenefit: 'Duyên dáng trang nghiêm khi dâng hoa và chụp ảnh lưu niệm sân chùa.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#3E6E9E',
    secondarySwatchHex: '#F4F2EC',
    robeTint: [0.28, 0.48, 0.68],
    upperTint: [0.27, 0.47, 0.68],
    lowerTint: [0.93, 0.91, 0.87],
    trimTint: [0.89, 0.72, 0.32],
    sashTint: [0.90, 0.76, 0.38],
    currency: 'gem',
    price: 75,
    requiredLevel: 1,
    rare: true,
    tryable: true
  },
  {
    id: 'ao_trang_tim_hue',
    category: 'ao_trang',
    slot: 'robe',
    robeStyle: 'tim_hue_co_do',
    name: 'Áo tràng tím Huế',
    description: 'Sắc tím huế trầm ấm cổ chéo viền kem, điểm đóa sen ngọc bích.',
    elderBenefit: 'Đài các mà tĩnh lặng, phù hợp mặc suốt hành trình vãng cảnh Chùa Vĩnh Tràng.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#6F507D',
    secondarySwatchHex: '#EDE2CE',
    robeTint: [0.47, 0.34, 0.53],
    upperTint: [0.48, 0.35, 0.54],
    lowerTint: [0.33, 0.24, 0.38],
    trimTint: [0.92, 0.87, 0.78],
    sashTint: [0.82, 0.64, 0.32],
    currency: 'lotus',
    price: 220,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },
  {
    id: 'ao_gam_le_hoi',
    category: 'ao_trang',
    slot: 'robe',
    robeStyle: 'gam_le_hoi',
    name: 'Áo gấm Vạn Tự lễ hội',
    description: 'Đỏ đô gấm chùa thêu viền vàng kim, cài phù hiệu Pháp Luân đại lễ.',
    elderBenefit: 'Lộng lẫy trang nghiêm trong các đại lễ Phật Đản, Vu Lan và đầu xuân.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#8E2824',
    secondarySwatchHex: '#E0AC3D',
    robeTint: [0.60, 0.19, 0.17],
    upperTint: [0.62, 0.20, 0.17],
    lowerTint: [0.36, 0.12, 0.11],
    trimTint: [0.90, 0.70, 0.24],
    sashTint: [0.93, 0.74, 0.26],
    currency: 'gem',
    price: 110,
    requiredLevel: 1,
    rare: true,
    tryable: true
  },

  // === BỘ SƯU TẬP PHÁP PHỤC MỞ RỘNG ===
  {
    id: 'ao_lam_co_tau',
    category: 'ao_trang',
    slot: 'robe',
    name: 'Áo lam cổ tàu truyền thống',
    description: 'Áo tràng lam khói cổ tàu năm nút, phom suông kín đáo, tay dài và đường may tối giản.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#87949A',
    robeTint: [0.48, 0.57, 0.61],
    currency: 'lotus',
    price: 160,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },
  {
    id: 'ao_trang_nau_gu',
    category: 'ao_trang',
    slot: 'robe',
    name: 'Áo tràng nâu gụ',
    description: 'Pháp phục nâu gụ trầm, chất vải mộc lì, phù hợp sinh hoạt và công quả tại chùa.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#654832',
    robeTint: [0.39, 0.27, 0.18],
    currency: 'lotus',
    price: 180,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },
  {
    id: 'ao_trang_lam_nhat',
    category: 'ao_trang',
    slot: 'robe',
    name: 'Áo tràng lam sương',
    description: 'Sắc lam xám nhạt dịu mắt, cổ đứng kín, thân áo suông và không dùng họa tiết nổi.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#A8B7B8',
    robeTint: [0.67, 0.73, 0.72],
    currency: 'lotus',
    price: 190,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },
  {
    id: 'ao_trang_xanh_reu',
    category: 'ao_trang',
    slot: 'robe',
    name: 'Áo tràng xanh rêu',
    description: 'Pháp phục xanh rêu trầm, phom rộng vừa phải, tạo cảm giác gần gũi và giản dị.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#596B55',
    robeTint: [0.34, 0.43, 0.32],
    currency: 'gem',
    price: 45,
    requiredLevel: 3,
    rare: false,
    tryable: true
  },
  {
    id: 'ao_trang_tim_khoi',
    category: 'ao_trang',
    slot: 'robe',
    name: 'Áo tràng tím khói',
    description: 'Tím khói pha xám nhẹ, cổ tàu năm nút và đường viền tay áo tinh tế.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#8A7E8D',
    robeTint: [0.53, 0.46, 0.55],
    currency: 'gem',
    price: 55,
    requiredLevel: 3,
    rare: true,
    tryable: true
  },
  {
    id: 'ao_trang_vang_dat',
    category: 'ao_trang',
    slot: 'robe',
    name: 'Áo tràng vàng đất',
    description: 'Vàng đất dịu, không ánh kim, dành cho bộ sưu tập lễ hội và ngày tu học đặc biệt.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#B18A4A',
    robeTint: [0.69, 0.52, 0.27],
    currency: 'gem',
    price: 65,
    requiredLevel: 5,
    rare: true,
    tryable: true
  },

  // === 4. TRÀNG HẠT ===
  {
    id: 'trang_hat_bo_de_108_store',
    category: 'trang_hat',
    slot: 'mala',
    name: 'Tràng hạt Bồ Đề 108 hạt',
    description: 'Chuỗi gỗ Bồ Đề tiện tròn kết tua đỏ giúp tĩnh tâm niệm Phật.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_bo_doan_tron.png',
    thumbIcon: '📿',
    currency: 'lotus',
    price: 90,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },
  {
    id: 'trang_hat_tram_store',
    category: 'trang_hat',
    slot: 'mala',
    name: 'Tràng hạt Trầm Hương',
    description: 'Gỗ trầm tự nhiên thoảng hương dịu nhẹ suốt buổi hành hương.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_bo_doan_tron.png',
    thumbIcon: '🟤',
    currency: 'gem',
    price: 80,
    requiredLevel: 1,
    rare: true,
    tryable: true
  },

  // === 5. BỒ ĐOÀN ===
  {
    id: 'bo_doan_dai_sen_store',
    category: 'bo_doan',
    slot: 'mat',
    prop3d: 'bo_doan_dai_sen',
    name: 'Bồ đoàn đài sen 8 cánh',
    description: 'Đệm gấm lam thêu 8 cánh sen trang nghiêm đặt dưới chân khi ngồi thiền.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_bo_doan_dai_sen.png',
    currency: 'gem',
    price: 75,
    requiredLevel: 1,
    rare: true,
    tryable: true
  },
  {
    id: 'bo_doan_tron_store',
    category: 'bo_doan',
    slot: 'mat',
    prop3d: 'bo_doan_tron',
    name: 'Bồ đoàn tròn vải bố mộc',
    description: 'Đệm ngồi thiền vỏ đậu xanh thoáng mát, đường may viền chắc chắn.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_bo_doan_tron.png',
    currency: 'lotus',
    price: 80,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },
  {
    id: 'chieu_coi_thien_store',
    category: 'bo_doan',
    slot: 'mat',
    prop3d: 'chieu_coi_thien',
    name: 'Chiếu cói thiền tọa Nam Bộ',
    description: 'Chiếu cói dệt thủ công viền nâu gụ mang hơi thở đồng quê Tiền Giang.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_chieu_coi_thien.png',
    currency: 'lotus',
    price: 110,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },

  // === 6. MŨ ===
  {
    id: 'non_la_theu_sen_store',
    category: 'mu',
    slot: 'hat',
    prop3d: 'non_la',
    name: 'Nón lá thêu sen',
    description: 'Nón lá lụa vành tre đội vừa vặn trên cả 3 nhân vật 3D khi đi sân chùa.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/render-non-la-theu-sen.jpg',
    currency: 'lotus',
    price: 70,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },

  // === 7. PHÁP KHÍ ===
  {
    id: 'mo_go_tung_kinh_store',
    category: 'phap_khi',
    slot: 'instrument',
    prop3d: 'mo_go_tung_kinh',
    name: 'Mõ gỗ mít tụng kinh',
    description: 'Mõ gỗ mít già chạm khắc kèm dùi gõ vang nhịp đều trầm ấm.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_mo_go_tung_kinh.png',
    currency: 'gem',
    price: 65,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },
  {
    id: 'den_hoa_dang_store',
    category: 'phap_khi',
    slot: 'handItem',
    prop3d: 'den_hoa_dang',
    name: 'Đèn hoa đăng thả nước',
    description: 'Hoa đăng cánh sen hồng đặt trên lá sen xanh tỏa sáng dịu dàng.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_den_hoa_dang.png',
    currency: 'lotus',
    price: 60,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },
  {
    id: 'quat_nan_la_dua_store',
    category: 'phap_khi',
    slot: 'handItem',
    prop3d: 'quat_nan_la_dua',
    name: 'Quạt nan lá dừa che nắng',
    description: 'Quạt đan thủ công từ lá dừa nước mang nét mộc mạc miền Tây.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_quat_nan_la_dua.png',
    currency: 'lotus',
    price: 45,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },
  {
    id: 'den_long_luc_giac_store',
    category: 'phap_khi',
    slot: 'handItem',
    prop3d: 'den_long_luc_giac',
    name: 'Đèn lồng lục giác cổ tự',
    description: 'Đèn lồng gỗ viền vàng vẽ hoa sen treo dọc hành lang Chánh điện.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_den_long_luc_giac.png',
    currency: 'lotus',
    price: 85,
    requiredLevel: 1,
    rare: true,
    tryable: true
  },
  {
    id: 'gio_may_tre_store',
    category: 'phap_khi',
    slot: 'handItem',
    prop3d: 'gio_may_tre',
    name: 'Giỏ mây tre đựng lễ phẩm',
    description: 'Giỏ mây đan tay gọn nhẹ mang theo hương, hoa và nước uống khi đi chùa.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_gio_may_tre.png',
    currency: 'lotus',
    price: 55,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },

  // === 8. MÂY ===
  {
    id: 'may_lanh_ngu_sac',
    category: 'may',
    slot: 'cloud',
    name: 'Mây lành ngũ sắc',
    description: 'Vầng hào quang dịu nhẹ nâng gót bước hành hương quanh Chánh điện.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_nen_hoa_sen.png',
    thumbIcon: '☁️',
    cloudColor: '#FFF3C4',
    currency: 'gem',
    price: 120,
    requiredLevel: 1,
    rare: true,
    tryable: true
  },
  {
    id: 'may_trang_tinh_tan',
    category: 'may',
    slot: 'cloud',
    name: 'Vầng mây trắng thanh tịnh',
    description: 'Đám mây trắng bồng bềnh dưới chân tựa cảnh giới an lạc.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_nen_hoa_sen.png',
    thumbIcon: '🌥️',
    cloudColor: '#F2F7FF',
    currency: 'lotus',
    price: 160,
    requiredLevel: 1,
    rare: false,
    tryable: true
  },

  // === 9. LINH THÚ ===
  {
    id: 'bo_cau_hien_hoa',
    category: 'linh_thu',
    slot: 'pet',
    name: 'Chim bồ câu hiền hòa',
    description: 'Chú bồ câu trắng bay lượn bình yên theo bước chân Phật tử.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_gio_may_tre.png',
    thumbIcon: '🕊️',
    petType: 'dove',
    currency: 'gem',
    price: 110,
    requiredLevel: 1,
    rare: true,
    tryable: true
  },
  {
    id: 'ca_koi_an_lac',
    category: 'linh_thu',
    slot: 'pet',
    name: 'Cá Koi an lạc',
    description: 'Chú cá Koi vàng cam bơi vòng quanh biểu trưng cho sự kiên trì hướng thiện.',
    image: '/Thiết kế giao diện/Vật phẩm 3D/fixed/fixed_chum_sanh_hoa_sen.png',
    thumbIcon: '🐟',
    petType: 'koi',
    currency: 'lotus',
    price: 140,
    requiredLevel: 1,
    rare: false,
    tryable: true
  }
];

export function computePilgrimProgress(spiritual = {}, completedLessonsCount = 0) {
  const s = createSpiritualState(spiritual);
  const score =
    Math.floor((s.bowCount || 0) / 3) * 15 +
    (s.incenseOfferings || 0) * 15 +
    (s.lotusOfferings || 0) * 12 +
    (s.malaCycles || 0) * 60 +
    Math.floor((s.malaBeads || 0) / 3) * 4 +
    (s.bellRings || 0) * 8 +
    (s.leavesSwept || 0) * 6 +
    Math.max(0, (s.visitedStations?.length || 1) - 1) * 10 +
    Math.max(0, Number(completedLessonsCount || 0)) * 20;
  const level = Math.max(1, Math.min(30, 1 + Math.floor(score / 45)));
  const levelFloor = (level - 1) * 45;
  const nextLevelScore = level * 45;
  const progressRatio = Math.min(1, Math.max(0, (score - levelFloor) / 45));
  return {
    level,
    totalMeritScore: score,
    nextLevelScore,
    progressRatio
  };
}

export function createStoreProfileState(initial = {}) {
  const eq = initial.equipped || {};
  return {
    level: Math.max(1, Number(initial.level || 1)),
    gems: Number.isFinite(initial.gems) ? Number(initial.gems) : 180,
    lotusPoints: Number.isFinite(initial.lotusPoints) ? Number(initial.lotusPoints) : 250,
    ownedCounts: { ...(initial.ownedCounts || {}) },
    tryingItemId: initial.tryingItemId || null,
    equipped: {
      robe: eq.robe || null,
      hat: eq.hat || null,
      handItem: eq.handItem || null,
      mat: eq.mat || null,
      instrument: eq.instrument || null,
      mala: eq.mala || null,
      cloud: eq.cloud || null,
      pet: eq.pet || null,
      tree: eq.tree || null,
      offering: eq.offering || null
    }
  };
}

export function filterStoreItems(categoryId = 'cay_phat') {
  return STORE_ITEMS_CATALOG.filter((item) => item.category === categoryId);
}

export function tryOnStoreItem(storeState, itemId) {
  const next = createStoreProfileState(storeState);
  const item = STORE_ITEMS_CATALOG.find((x) => x.id === itemId);
  if (!item) return { state: next, item: null, previewing: false };
  if (next.tryingItemId === itemId) {
    next.tryingItemId = null;
    return { state: next, item, previewing: false };
  }
  next.tryingItemId = itemId;
  return { state: next, item, previewing: true };
}

export function purchaseStoreItem(storeState, itemId) {
  const next = createStoreProfileState(storeState);
  const item = STORE_ITEMS_CATALOG.find((x) => x.id === itemId);
  if (!item) return { ok: false, reason: 'not_found', message: 'Không tìm thấy vật phẩm.', state: next };
  if (next.level < (item.requiredLevel || 1)) {
    return {
      ok: false,
      reason: 'level_locked',
      message: `Cần đạt cấp ${item.requiredLevel} để thỉnh ${item.name}.`,
      state: next
    };
  }
  const alreadyOwned = (next.ownedCounts[item.id] || 0) > 0;
  if (alreadyOwned && !item.stackable) {
    // Toggle equip if already owned
    const curEquipped = next.equipped[item.slot];
    next.equipped[item.slot] = curEquipped === item.id ? null : item.id;
    next.tryingItemId = null;
    return {
      ok: true,
      equippedNow: next.equipped[item.slot] === item.id,
      message:
        next.equipped[item.slot] === item.id
          ? `Đã mặc/dùng ${item.name}.`
          : `Đã cất ${item.name}.`,
      state: next,
      item
    };
  }
  if (item.currency === 'gem') {
    if (next.gems < item.price) {
      return {
        ok: false,
        reason: 'insufficient_gems',
        message: `Cần ${item.price} ngọc quý để thỉnh ${item.name}.`,
        state: next
      };
    }
    next.gems -= item.price;
  } else {
    if (next.lotusPoints < item.price) {
      return {
        ok: false,
        reason: 'insufficient_lotus',
        message: `Cần ${item.price} điểm công đức sen để thỉnh ${item.name}.`,
        state: next
      };
    }
    next.lotusPoints -= item.price;
  }
  next.ownedCounts[item.id] = (next.ownedCounts[item.id] || 0) + 1;
  next.equipped[item.slot] = item.id;
  next.tryingItemId = null;
  return {
    ok: true,
    purchased: true,
    equippedNow: true,
    message: `Đã thỉnh ${item.name} và trang bị cho nhân vật.`,
    state: next,
    item
  };
}
