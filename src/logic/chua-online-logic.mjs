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

export const CHARACTER_PROFILES = [
  {
    key: 'nu',
    name: 'Phật tử Nữ (Diệu Tâm)',
    heightLabel: '1.62m',
    heightMeters: 1.62,
    outfitName: 'Áo tràng lam cổ tàu 5 nút (#9A8F99) & Túi vải sen',
    glb: '/Thiết kế giao diện/Nhân vật 3D/Bản chỉnh sửa/nu-phuc-hoi-mau-chuyen-dong.glb',
    previewImg: '/public/assets/aistudio/image_8f6004e3.png',
    fitPreviewImg: '/Thiết kế giao diện/Nhân vật 3D/render-items-nu.jpg',
    description: 'Phật tử nữ mặc áo lam tím khói 5 nút truyền thống, đeo túi tote hoa sen, tóc búi thấp trang nghiêm.'
  },
  {
    key: 'nam',
    name: 'Phật tử Nam (Minh Đức)',
    heightLabel: '1.74m',
    heightMeters: 1.74,
    outfitName: 'Pháp phục Áo tràng nâu / lam trầm & Tràng hạt gỗ',
    glb: '/Thiết kế giao diện/Nhân vật 3D/Chuyển động/nam-chuyen-dong.glb',
    previewImg: '/Thiết kế giao diện/Nhân vật 3D/anh-xem-truoc-3d-nam.png',
    fitPreviewImg: '/Thiết kế giao diện/Nhân vật 3D/render-items-nam-v2.jpg',
    description: 'Phật tử nam chững chạc, khoác pháp phục đi chùa truyền thống, bước đi điềm đạm chánh niệm.'
  },
  {
    key: 'tre_em',
    name: 'Em bé Phật tử (Bé An)',
    heightLabel: '1.15m',
    heightMeters: 1.15,
    outfitName: 'Áo lam thiếu nhi & Búp sen hồng cầm tay',
    glb: '/Thiết kế giao diện/Nhân vật 3D/Chuyển động/tre-em-chuyen-dong.glb',
    previewImg: '/Thiết kế giao diện/Nhân vật 3D/anh-xem-truoc-3d-tre_em.png',
    fitPreviewImg: '/Thiết kế giao diện/Nhân vật 3D/render-items-tre-em-v2.jpg',
    description: 'Em nhỏ Phật tử ngoan hiền theo cha mẹ về Chùa Vĩnh Tràng học lễ Phật, dâng hoa và rèn lòng hiếu thảo.'
  }
];

export const PILGRIMAGE_STATIONS = [
  {
    id: 0,
    key: 'cong_tam_quan',
    name: 'Cổng Tam Quan (Phương Tiện – Cổng Sắt – Tịnh Độ)',
    zoneCode: 'Mặt tiền trục chính Nam',
    pinLabel: 'Cổng Tam Quan',
    pos: { x: 23.0, z: 41.5 },
    standPos: { x: 23.0, z: 45.8 },
    via: [[40.5, 45.8], [32.0, 45.8], [23.0, 45.8]],
    mapCoord: { x: 67, y: 92 },
    lookAt: { x: 23.0, y: 4.5, z: 41.5 },
    audio: 's0_chao.mp3',
    subtitle: 'Cổng Sắt trung tâm đóng nghi lễ giữ nét tôn nghiêm; khách hành hương đi vào qua Cổng Phụ Tịnh Độ Huyền Môn bên phải.',
    ritualType: 'welcome'
  },
  {
    id: 1,
    key: 'ho_sen_ca_koi',
    name: 'Hồ Sen Song Đối & Cá Koi',
    zoneCode: 'Sân vườn phía trước',
    pinLabel: 'Hồ Sen & Cá Koi',
    pos: { x: 3.5, z: 33.0 },
    standPos: { x: 13.2, z: 33.0 },
    via: [[40.5, 41.5], [23.0, 33.0], [13.2, 33.0]],
    mapCoord: { x: 52, y: 80 },
    lookAt: { x: 3.5, y: 0.9, z: 33.0 },
    audio: 'day_di.mp3',
    subtitle: 'Hồ sen lớn rợp hoa súng và đàn cá Koi bơi lượn thanh bình ngay bên trái trục sân dẫn vào Chánh điện.',
    ritualType: 'dang_hoa'
  },
  {
    id: 2,
    key: 'phat_adida',
    name: 'Tượng Phật A Di Đà (cao 24m)',
    zoneCode: 'Sân Bắc phía trước Bảo Tháp',
    pinLabel: 'Tượng Phật A Di Đà',
    pos: { x: -8.0, z: -25.0 },
    standPos: { x: -8.0, z: -14.2 },
    via: [[10.0, 18.0], [-4.0, -4.0], [-8.0, -14.2]],
    mapCoord: { x: 44, y: 40 },
    lookAt: { x: -8.0, y: 11.5, z: -25.0 },
    audio: 's1_adida.mp3',
    subtitle: 'Đại tượng Phật A Di Đà cao 24m đứng trang nghiêm giữa rặng cây xanh phía trước Bảo Tháp 7 tầng.',
    ritualType: 'niem_phat'
  },
  {
    id: 3,
    key: 'phat_di_lac',
    name: 'Tượng Phật Di Lặc (cao 20m)',
    zoneCode: 'Công viên bên hông phía Tây',
    pinLabel: 'Tượng Phật Di Lặc',
    pos: { x: -24.5, z: 4.0 },
    standPos: { x: -24.5, z: 22.8 },
    via: [[10.0, 22.5], [-10.0, 22.8], [-24.5, 22.8]],
    mapCoord: { x: 32, y: 62 },
    lookAt: { x: -24.5, y: 9.0, z: 4.0 },
    audio: 's4_dilac.mp3',
    subtitle: 'Đại tượng Phật Di Lặc an tọa nơi công viên bên hông phía Tây, hướng mặt ra quảng trường cây kiểng và bệ đá bậc thang.',
    ritualType: 'le_phat'
  },
  {
    id: 4,
    key: 'lu_huong_san',
    name: 'Lư hương sân Tiền đường',
    zoneCode: 'Thềm tam cấp trục chính',
    pinLabel: 'Lư hương',
    pos: { x: 23.0, z: 12.0 },
    standPos: { x: 23.0, z: 15.2 },
    via: [[36.0, 24.0], [23.0, 18.5], [23.0, 15.2]],
    mapCoord: { x: 67, y: 68 },
    lookAt: { x: 23.0, y: 2.2, z: 12.0 },
    audio: 's2_thap_nhang.mp3',
    subtitle: 'Nơi thắp ba nén tâm hương trước mặt tiền Á – Âu 13 vòm của Khu Chùa Cổ trước khi đi qua cửa hông vào Tiền đường.',
    ritualType: 'dang_huong'
  },
  {
    id: 5,
    key: 'chanh_dien',
    name: 'Khu Chùa Cổ · Chánh điện (Chữ Quốc 國)',
    zoneCode: 'Cửa hông vào Tiền đường & Chánh điện',
    pinLabel: 'Chánh điện',
    pos: { x: 23.0, z: 4.5 },
    standPos: { x: 30.2, z: 12.2 },
    via: [[36.0, 24.0], [34.0, 14.5], [30.2, 12.2]],
    mapCoord: { x: 67, y: 58 },
    lookAt: { x: 23.0, y: 4.4, z: 1.0 },
    audio: 's3_lay_phat.mp3',
    subtitle: 'Bước qua cửa hông vào Tiền đường và Chánh điện trang nghiêm với Long Trụ, Bao Lam chạm lọng, 18 vị La Hán, hai Sân Thiên Tỉnh, Nhà Tổ và Nhà Hậu.',
    ritualType: 'le_phat'
  },
  {
    id: 6,
    key: 'cua_hang_luu_niem',
    name: 'Nhà Tạp Hóa Cổng Chùa',
    zoneCode: 'Góc cổng phụ phía Đông',
    pinLabel: 'Nhà Tạp Hóa',
    pos: { x: 48.6, z: 36.0 },
    standPos: { x: 43.2, z: 36.0 },
    via: [[40.5, 41.5], [43.2, 36.0]],
    mapCoord: { x: 86, y: 83 },
    lookAt: { x: 48.6, y: 2.2, z: 36.0 },
    audio: 'merit_box.mp3',
    subtitle: 'Nhà tạp hóa & nước giải khát truyền thống bên Cổng Phụ Đông: đầy đủ nhang đèn, hoa sen, nón lá, dừa xiêm ướp lạnh và bánh chay Mỹ Tho.',
    ritualType: 'shop'
  },
  {
    id: 7,
    key: 'giang_duong',
    name: 'Giảng đường Phật pháp',
    zoneCode: 'Khu vực phía Đông Chùa Cổ',
    pinLabel: 'Giảng đường',
    pos: { x: 44.0, z: -18.0 },
    standPos: { x: 37.8, z: -18.0 },
    via: [[36.2, 12.0], [37.8, -6.0], [37.8, -18.0]],
    mapCoord: { x: 82, y: 45 },
    lookAt: { x: 44.0, y: 3.8, z: -18.0 },
    audio: 's3_giang_duong.mp3',
    subtitle: 'Gian nhà gỗ yên tĩnh phía Đông dùng để nghe giảng pháp, đọc 10 bộ giáo trình Phật học và thực tập chánh niệm.',
    ritualType: 'lecture'
  },
  {
    id: 8,
    key: 'phat_niet_ban',
    name: 'Phật Niết Bàn (32m) & Bảo Tháp 7 Tầng',
    zoneCode: 'Khu vực phía sau (Bắc)',
    pinLabel: 'Phật Niết Bàn & Bảo Tháp',
    pos: { x: 12.0, z: -38.0 },
    standPos: { x: 10.0, z: -27.5 },
    via: [[10.0, 20.0], [10.0, 0.0], [10.0, -18.0], [10.0, -27.5]],
    mapCoord: { x: 59, y: 28 },
    lookAt: { x: 12.0, y: 4.5, z: -38.0 },
    audio: 's5_nirvana.mp3',
    subtitle: 'Chiêm bái đại tượng Đức Phật Thích Ca nhập Niết Bàn dài 32m uy nghi bên cạnh Bảo Tháp Thất Phật 7 tầng (cao 35m).',
    ritualType: 'hoi_huong'
  }
];

export const DISCOVERY_ZONES = [
  {
    id: 100,
    isDiscovery: true,
    key: 'vuon_lam_ty_ni',
    name: 'Vườn Lâm Tỳ Ni & Bồ Đề',
    zoneCode: 'Vườn Tây Nam mở rộng',
    pinLabel: 'Vườn Lâm Tỳ Ni',
    pos: { x: -53.5, z: 22.0 },
    standPos: { x: -45.0, z: 24.5 },
    via: [[-24.5, 29.0], [-44.0, 29.0], [-45.0, 24.5]],
    lookAt: { x: -53.5, y: 2.8, z: 22.0 },
    audio: 'day_di.mp3',
    subtitle: 'Tái hiện vườn Lâm Tỳ Ni thanh tịnh dưới tán Cây Bồ Đề cổ thụ rợp dải lụa ước nguyện bình an.',
    ritualType: 'dang_hoa'
  },
  {
    id: 101,
    isDiscovery: true,
    key: 'non_bo_quan_am',
    name: 'Hòn Non Bộ & Động Quán Thế Âm',
    zoneCode: 'Hoa viên phía Tây',
    pinLabel: 'Động Quán Thế Âm',
    pos: { x: -54.0, z: -4.0 },
    standPos: { x: -44.0, z: -4.0 },
    via: [[-44.0, 24.0], [-44.0, 8.0], [-44.0, -4.0]],
    lookAt: { x: -54.0, y: 4.0, z: -4.0 },
    audio: 's4_dilac.mp3',
    subtitle: 'Núi đá non bộ trầm mặc với thác nước đổ xuống hồ sen xanh mát và tôn tượng Quán Thế Âm từ bi.',
    ritualType: 'niem_phat'
  },
  {
    id: 102,
    isDiscovery: true,
    key: 'vuon_la_han_ngoai',
    name: 'Hành Lang La Hán Ngoài Trời',
    zoneCode: 'Dải vườn phía Tây Chùa Cổ',
    pinLabel: 'Vườn La Hán',
    pos: { x: -49.5, z: -24.0 },
    standPos: { x: -44.0, z: -24.0 },
    via: [[-44.0, 4.0], [-44.0, -14.0], [-44.0, -24.0]],
    lookAt: { x: -49.5, y: 2.0, z: -24.0 },
    audio: 'day_di.mp3',
    subtitle: 'Lối dạo thiền dưới rặng sa-la và mai chiếu thủy phía Tây hành lang Chữ Quốc.',
    ritualType: 'le_phat'
  },
  {
    id: 103,
    isDiscovery: true,
    key: 'ho_phong_sinh',
    name: 'Hồ Phóng Sinh Lớn & Cầu Gỗ Chữ Z',
    zoneCode: 'Vườn sau phía Tây Bắc',
    pinLabel: 'Hồ Phóng Sinh',
    pos: { x: -16.0, z: -56.0 },
    standPos: { x: -16.0, z: -46.2 },
    via: [[-44.0, -45.5], [-28.0, -45.5], [-16.0, -46.2]],
    mapCoord: { x: 38, y: 14 },
    lookAt: { x: -16.0, y: 1.5, z: -56.0 },
    audio: 'day_di.mp3',
    subtitle: 'Mặt hồ rộng lững lờ hoa súng tím và cầu gỗ chữ Z mộc mạc nơi vườn Tây Bắc yên tĩnh.',
    ritualType: 'dang_hoa'
  },
  {
    id: 104,
    isDiscovery: true,
    key: 'thap_chuong_dai_hong',
    name: 'Lầu Chuông Đại Hồng Chung',
    zoneCode: 'Góc Tây Bắc khuôn viên',
    pinLabel: 'Lầu Chuông',
    pos: { x: -44.0, z: -56.0 },
    standPos: { x: -39.0, z: -49.5 },
    via: [[-44.0, -24.0], [-44.0, -45.5], [-39.0, -49.5]],
    lookAt: { x: -44.0, y: 6.0, z: -56.0 },
    audio: 's6_hoi_huong.mp3',
    subtitle: 'Gác chuông mái ngói âm dương hai tầng uy nghiêm; bấm vào lầu chuông để thỉnh một hồi Đại Hồng Chung.',
    ritualType: 'hoi_huong'
  },
  {
    id: 105,
    isDiscovery: true,
    key: 'hau_to_nha_to',
    name: 'Tổ Đường Vĩnh Tràng (Sân Bắc)',
    zoneCode: 'Khu thờ Tổ phía sau Chùa Cổ',
    pinLabel: 'Tổ Đường',
    pos: { x: 22.0, z: -58.0 },
    standPos: { x: 22.0, z: -48.5 },
    via: [[37.8, -18.0], [38.0, -45.5], [22.0, -48.5]],
    lookAt: { x: 22.0, y: 3.5, z: -58.0 },
    audio: 's5_nirvana.mp3',
    subtitle: 'Khu Tổ Đường trang nghiêm thờ chư vị Tổ sư khai sơn tạo tự Vĩnh Tràng ở khoảng sân phía sau.',
    ritualType: 'dang_huong'
  },
  {
    id: 106,
    isDiscovery: true,
    key: 'lau_tra_thien',
    name: 'Lầu Trà Thiền & Vườn Lan Cổ Tự',
    zoneCode: 'Hoa viên phía Đông',
    pinLabel: 'Lầu Trà Thiền',
    pos: { x: 58.0, z: -12.0 },
    standPos: { x: 51.5, z: -12.0 },
    via: [[51.5, 20.0], [51.5, 2.0], [51.5, -12.0]],
    lookAt: { x: 58.0, y: 2.8, z: -12.0 },
    audio: 'day_di.mp3',
    subtitle: 'Trà thất lục giác bên giàn phong lan hồ điệp tím phía Đông Khu Chùa Cổ.',
    ritualType: 'welcome'
  },
  {
    id: 107,
    isDiscovery: true,
    key: 'nha_san_trai_duong',
    name: 'Nhà Sàn Gỗ Trai Đường · Khu Ăn Phật Tử',
    zoneCode: 'Sân Đông bên cầu gỗ miền Tây',
    pinLabel: 'Nhà Sàn Trai Đường',
    pos: { x: 59.5, z: 14.5 },
    standPos: { x: 51.5, z: 14.5 },
    via: [[44.0, 26.0], [51.5, 22.0], [51.5, 14.5]],
    lookAt: { x: 59.5, y: 2.8, z: 14.5 },
    audio: 'day_di.mp3',
    subtitle: 'Khu trai đường ăn uống của Phật tử dựng bằng gỗ căm xe trên hệ sàn cọc miền Tây bên hồ sen phía Đông.',
    ritualType: 'welcome'
  },
  {
    id: 108,
    isDiscovery: true,
    key: 'bao_thap_that_phat',
    name: 'Bảo Tháp Thất Phật (7 tầng · cao 35m)',
    zoneCode: 'Sân Bắc sau Tượng Phật A Di Đà',
    pinLabel: 'Bảo Tháp',
    pos: { x: -8.0, z: -37.0 },
    standPos: { x: -13.8, z: -33.0 },
    via: [[10.0, 20.0], [-14.0, -14.0], [-13.8, -33.0]],
    lookAt: { x: -8.0, y: 9.0, z: -37.0 },
    audio: 's5_nirvana.mp3',
    subtitle: 'Bảo tháp 7 tầng cao 35m đứng uy nghiêm ngay phía sau tượng Phật A Di Đà và cạnh tượng Phật Niết Bàn.',
    ritualType: 'hoi_huong'
  },
  {
    id: 109,
    isDiscovery: true,
    key: 'nha_co_ba_hu_tieu',
    name: 'Nhà Cô Ba · Hủ tiếu Mỹ Tho',
    zoneCode: 'Khu dân cư phía Đông chùa',
    pinLabel: 'Nhà Cô Ba',
    pos: { x: 91.0, z: 60.0 },
    standPos: { x: 85.4, z: 60.0 },
    via: [[45.0, 50.0], [61.0, 50.0], [73.5, 50.0], [77.5, 55.0], [85.4, 60.0]],
    lookAt: { x: 91.0, y: 2.5, z: 60.0 },
    audio: 'day_di.mp3',
    subtitle: 'Một quán ăn gia đình trong căn nhà thấp tầng, có hiên nhà và bàn ăn bên trong; phục vụ hủ tiếu Mỹ Tho.',
    ritualType: 'welcome'
  },
  {
    id: 110,
    isDiscovery: true,
    key: 'banh_beo_di_sau',
    name: 'Bếp Dì Sáu · Bánh bèo & chè',
    zoneCode: 'Khu dân cư phía Đông chùa',
    pinLabel: 'Bếp Dì Sáu',
    pos: { x: 91.0, z: 80.0 },
    standPos: { x: 85.4, z: 80.0 },
    via: [[73.5, 50.0], [77.5, 65.0], [77.5, 80.0], [85.4, 80.0]],
    lookAt: { x: 91.0, y: 2.5, z: 80.0 },
    audio: 'day_di.mp3',
    subtitle: 'Căn bếp gia đình miền Tây với bàn gỗ, khay bánh bèo và món chè địa phương.',
    ritualType: 'welcome'
  },
  {
    id: 111,
    isDiscovery: true,
    key: 'hem_nha_vuon',
    name: 'Hẻm nhà vườn Mỹ Tho',
    zoneCode: 'Cuối tuyến dân cư phía Đông',
    pinLabel: 'Hẻm nhà vườn',
    pos: { x: 91.0, z: 100.0 },
    standPos: { x: 85.4, z: 100.0 },
    via: [[73.5, 50.0], [77.5, 78.0], [77.5, 96.0], [85.4, 100.0]],
    lookAt: { x: 91.0, y: 2.5, z: 100.0 },
    audio: 'day_di.mp3',
    subtitle: 'Đoạn hẻm yên tĩnh với nhà ở, hàng cây, dây phơi và khoảng sân nhỏ đặc trưng khu dân cư Nam Bộ.',
    ritualType: 'welcome'
  }
];

export const CHU_QUOC_ZONES = [
  {
    id: 'tien_duong',
    order: 1,
    name: '1. Tiền đường',
    subtitle: 'Khu tiếp đón, thờ phụ Hộ Pháp & Tiêu Diện, hoành phi câu đối dưới hệ vòm Á–Âu',
    zRange: [1.5, 11.6],
    standPos: { x: 0.0, z: 7.5 },
    lookAt: { x: 0.0, y: 3.4, z: -2.0 }
  },
  {
    id: 'chanh_dien_noi_that',
    order: 2,
    name: '2. Chánh điện',
    subtitle: 'Khu thờ Phật chính, Long Trụ rồng cuốn, 18 vị La Hán, Bao lam & Vì kèo thếp vàng',
    zRange: [-22.2, 1.5],
    standPos: { x: 0.0, z: -6.5 },
    lookAt: { x: 0.0, y: 3.4, z: -18.7 }
  },
  {
    id: 'san_thien_tinh_1',
    order: 3,
    name: '3. Sân Thiên Tỉnh 1 (Giếng trời)',
    subtitle: 'Giếng trời lấy sáng và thông gió tự nhiên với Hòn Non Bộ, thác nước, cây kiểng giữa hai dãy hành lang',
    zRange: [-38.8, -22.2],
    standPos: { x: 0.0, z: -25.2 },
    lookAt: { x: 0.0, y: 2.2, z: -31.5 }
  },
  {
    id: 'nha_to',
    order: 4,
    name: '4. Nhà Tổ',
    subtitle: 'Thờ chư vị Tổ sư, Trụ trì qua các đời cùng Ban Quán Thế Âm & Ban Địa Tạng',
    zRange: [-53.0, -38.8],
    standPos: { x: 0.0, z: -42.5 },
    lookAt: { x: 0.0, y: 3.2, z: -51.5 }
  },
  {
    id: 'san_thien_tinh_2',
    order: 5,
    name: '5. Sân Thiên Tỉnh 2 (Giếng trời)',
    subtitle: 'Khoảng sân giếng trời nối Nhà Tổ và Nhà Hậu cùng tiểu cảnh sen đá & hành lang gỗ',
    zRange: [-68.5, -53.0],
    standPos: { x: 0.0, z: -55.8 },
    lookAt: { x: 0.0, y: 2.2, z: -61.0 }
  },
  {
    id: 'nha_hau',
    order: 6,
    name: '6. Nhà Hậu',
    subtitle: 'Khu thờ tự & sinh hoạt phía sau, thông thẳng ra tượng Phật Niết Bàn & Bảo Tháp 7 tầng',
    zRange: [-82.0, -68.5],
    standPos: { x: 0.0, z: -72.0 },
    lookAt: { x: 0.0, y: 3.2, z: -80.2 }
  }
];

export const CHANH_DIEN_HISTORICAL_NOTES = {
  title: 'Đối chiếu tư liệu Tôn tượng Gian Giữa Chánh điện',
  note:
    'Tư liệu nghiên cứu ghi nhận hai mô tả khác nhau về tôn tượng trung tâm tại Chánh điện Chùa Vĩnh Tràng; ứng dụng trình bày song song cả hai nguồn để người tham quan đối chiếu trực quan mà không tự ý kết luận thay thế nguồn sử liệu nào.',
  sources: [
    {
      id: 'vov',
      sourceTitle: 'Tư liệu VOV – Kiến trúc chùa Vĩnh Tràng',
      summary:
        'Mô tả tượng Đức Phật Thích Ca bằng đồng ngự tại gian giữa Chánh điện cùng các pho tượng Bồ Tát, bộ bao lam chạm khắc rồng phượng và 18 vị La Hán hai bên.'
    },
    {
      id: 'sach_2017',
      sourceTitle: 'Sách "Chùa Vĩnh Tràng – Một ngôi chùa nhiều mỹ hiệu" (Thích Huệ Phát, 2017)',
      summary:
        'Ghi nhận tôn tượng Đức Phật A Di Đà chế tác bằng gỗ mít cùng bộ Tây Phương Tam Thánh, hoành phi liễn đối và hệ thống cột Long Trụ gian giữa.'
    }
  ]
};

export function findAnyTempleDestination(keyOrId) {
  return (
    PILGRIMAGE_STATIONS.find((s) => s.key === keyOrId || s.id === Number(keyOrId)) ||
    DISCOVERY_ZONES.find((s) => s.key === keyOrId || s.id === Number(keyOrId)) ||
    null
  );
}

export const WORLD_BOUNDS = {
  minX: -66.5,
  maxX: 100.0,
  minZ: -104.0,
  maxZ: 112.0
};

export function stepPlayerMovement(state, input, speed = 0.22, obstacles = []) {
  const dx = Number(input?.dx || 0);
  const dz = Number(input?.dz || 0);
  if (dx === 0 && dz === 0) {
    return { x: state.x, z: state.z, yaw: state.yaw, moving: false };
  }
  const len = Math.hypot(dx, dz) || 1;
  const nx = dx / len;
  const nz = dz / len;

  let nextX = Math.max(WORLD_BOUNDS.minX, Math.min(WORLD_BOUNDS.maxX, state.x + nx * speed));
  let nextZ = Math.max(WORLD_BOUNDS.minZ, Math.min(WORLD_BOUNDS.maxZ, state.z + nz * speed));

  for (const box of obstacles) {
    if (nextX > box.minX && nextX < box.maxX && nextZ > box.minZ && nextZ < box.maxZ) {
      const slideX = !(state.x > box.minX && state.x < box.maxX && nextZ > box.minZ && nextZ < box.maxZ);
      const slideZ = !(nextX > box.minX && nextX < box.maxX && state.z > box.minZ && state.z < box.maxZ);
      if (slideX) nextX = state.x;
      else if (slideZ) nextZ = state.z;
      else {
        nextX = state.x;
        nextZ = state.z;
      }
    }
  }

  const yaw = Math.atan2(nx, nz);
  return {
    x: Number(nextX.toFixed(4)),
    z: Number(nextZ.toFixed(4)),
    yaw: Number(yaw.toFixed(4)),
    moving: true
  };
}

export function findNearestStation(pos, stations = PILGRIMAGE_STATIONS) {
  let best = stations[0];
  let bestDist = Infinity;
  for (const st of stations) {
    const dPos = Math.hypot((pos?.x || 0) - st.pos.x, (pos?.z || 0) - st.pos.z);
    const dStand = st.standPos
      ? Math.hypot((pos?.x || 0) - st.standPos.x, (pos?.z || 0) - st.standPos.z)
      : Infinity;
    const d = Math.min(dPos, dStand);
    if (d < bestDist) {
      bestDist = d;
      best = st;
    }
  }
  return { station: best, distance: Number(bestDist.toFixed(2)) };
}

export function createSpiritualState(initial = {}) {
  return {
    bowCount: initial.bowCount || 0,
    incenseStep: initial.incenseStep || 0,
    incenseOfferings: initial.incenseOfferings || 0,
    lotusOfferings: initial.lotusOfferings || 0,
    malaBeads: initial.malaBeads || 0,
    malaCycles: initial.malaCycles || 0,
    bellRings: initial.bellRings || 0,
    leavesSwept: initial.leavesSwept || 0,
    visitedStations: Array.isArray(initial.visitedStations) ? [...initial.visitedStations] : [0],
    completedMilestones: Array.isArray(initial.completedMilestones) ? [...initial.completedMilestones] : [],
    lastUnlockedMilestone: initial.lastUnlockedMilestone || null,
    prayers: Array.isArray(initial.prayers) ? [...initial.prayers] : [],
    activeChant: initial.activeChant || 'Nam Mô A Di Đà Phật',
    equippedItems: {
      outfit: initial.equippedItems?.outfit || 'ao_trang_phat_tu',
      hat: initial.equippedItems?.hat || null,
      bag: initial.equippedItems?.bag || 'tui_vai_theu_sen',
      scarf: initial.equippedItems?.scarf || null,
      hand: initial.equippedItems?.hand || 'trang_hat_bo_de',
      altarItem: initial.equippedItems?.altarItem || null
    }
  };
}

export function checkUGCMilestoneUnlock(spiritual, completedLessonsCount = 0) {
  const s = createSpiritualState(spiritual);
  const reasons = [];
  if (s.bowCount >= 3) reasons.push('Đã đảnh lễ Tam Bảo (Tam Bái)');
  if (s.incenseOfferings >= 1) reasons.push('Đã dâng tâm hương tại Lư đồng');
  if (s.lotusOfferings >= 1) reasons.push('Đã dâng hoa sen thanh tịnh');
  if (s.malaCycles * 108 + s.malaBeads >= 3) reasons.push('Đã tịnh tâm lần chuỗi Niệm Phật');
  if (s.visitedStations.length >= 2) reasons.push(`Đã hành hương khám phá ${s.visitedStations.length} điểm trong chùa`);
  if (s.completedMilestones.length >= 1) reasons.push(...s.completedMilestones);
  if (completedLessonsCount >= 2) reasons.push('Đã hoàn thành bài học tại Giảng đường Phật pháp');

  const uniqueReasons = Array.from(new Set(reasons));
  const latest =
    s.lastUnlockedMilestone ||
    uniqueReasons[uniqueReasons.length - 1] ||
    'Lễ Phật, dâng hương, dâng hoa hoặc ghé thăm khuôn viên chùa để lưu ảnh kỷ niệm';
  return {
    unlocked: uniqueReasons.length > 0,
    milestoneCount: uniqueReasons.length,
    completedCount: uniqueReasons.length,
    totalCompleted: uniqueReasons.length,
    latestAchievement: latest,
    latestMilestone: latest,
    achievements: uniqueReasons
  };
}

export function recordSpiritualMilestone(state, milestoneLabel) {
  const next = createSpiritualState(state);
  const label = String(milestoneLabel || '').trim();
  if (label && !next.completedMilestones.includes(label)) {
    next.completedMilestones.push(label);
  }
  if (label) {
    next.lastUnlockedMilestone = label;
  }
  return next;
}

export function performSpiritualAction(state, actionType, payload = {}) {
  let next = createSpiritualState(state);
  switch (actionType) {
    case 'LE_PHAT': {
      next.bowCount += 3;
      next = recordSpiritualMilestone(next, 'Lễ Phật tại Chánh điện');
      return {
        state: next,
        animation: 'Vái',
        audioFile: 's3_lay_phat.mp3',
        milestoneUnlocked: true,
        milestoneTitle: 'Lễ Phật tại Chánh điện',
        title: 'Lễ Phật (Tam Bái)',
        message: 'Thành tâm đảnh lễ ba lạy trước Tam Bảo: Phật, Pháp, Tăng.'
      };
    }
    case 'DANG_HUONG_STEP': {
      next.incenseStep = next.incenseStep >= 4 ? 1 : next.incenseStep + 1;
      const stepMessages = {
        1: 'Bước 1/4 — Xin ba nén nhang thơm vừa đủ.',
        2: 'Bước 2/4 — Châm lửa và phẩy nhẹ bằng tay cho tắt ngọn lửa (không thổi bằng miệng).',
        3: 'Bước 3/4 — Nâng nhang ngang trán, thành tâm cầu bình an cho gia đình.',
        4: 'Bước 4/4 — Cắm nhang ngay ngắn vào lư hương đồng trước sân Chánh điện.'
      };
      if (next.incenseStep === 4) {
        next.incenseOfferings += 1;
        next = recordSpiritualMilestone(next, 'Dâng hương tại sân Chánh điện');
      }
      return {
        state: next,
        animation: next.incenseStep === 4 ? 'Thắp nhang' : 'Chắp tay',
        audioFile: 's2_thap_nhang.mp3',
        milestoneUnlocked: next.incenseStep === 4,
        milestoneTitle: 'Dâng hương tại sân Chánh điện',
        title: `Dâng hương (${next.incenseStep}/4)`,
        message: stepMessages[next.incenseStep]
      };
    }
    case 'DANG_HUONG_COMPLETE': {
      next.incenseStep = 4;
      next.incenseOfferings += 1;
      next = recordSpiritualMilestone(next, 'Dâng hương tại sân Chánh điện');
      return {
        state: next,
        animation: 'Thắp nhang',
        audioFile: 's2_thap_nhang.mp3',
        milestoneUnlocked: true,
        milestoneTitle: 'Dâng hương tại sân Chánh điện',
        title: 'Đã dâng ba nén hương',
        message: 'Ba nén nhang đã được cắm ngay ngắn vào lư hương đồng trước Chánh điện.'
      };
    }
    case 'DANG_HOA': {
      next.lotusOfferings += 1;
      next.equippedItems.hand = 'hoa_sen_trang_nghiem';
      next = recordSpiritualMilestone(next, 'Dâng hoa sen trước Phật đài');
      return {
        state: next,
        animation: 'Chắp tay',
        audioFile: 'merit_box.mp3',
        milestoneUnlocked: true,
        milestoneTitle: 'Dâng hoa sen trước Phật đài',
        title: 'Dâng hoa sen',
        message: 'Một cành sen hồng vừa được đặt trang nghiêm trước Phật đài.'
      };
    }
    case 'NIEM_PHAT_BEAD': {
      const increment = Math.max(1, Number(payload.count || 1));
      const total = next.malaBeads + increment;
      next.malaCycles += Math.floor(total / 108);
      next.malaBeads = total % 108;
      if (payload.chant) next.activeChant = payload.chant;
      next = recordSpiritualMilestone(next, `Niệm Phật (${next.activeChant})`);
      return {
        state: next,
        animation: 'Chắp tay',
        audioFile: 'niem_phat_xa.mp3',
        milestoneUnlocked: true,
        milestoneTitle: `Niệm Phật (${next.activeChant})`,
        title: `${next.activeChant} (${next.malaBeads}/108)`,
        message:
          total >= 108
            ? `Đã trọn ${next.malaCycles} vòng chuỗi 108 hạt.`
            : `Lần nhẹ từng hạt chuỗi theo nhịp thở (${next.malaBeads}/108 hạt).`
      };
    }
    case 'RING_BELL': {
      next.bellRings += 1;
      next = recordSpiritualMilestone(next, 'Thỉnh chuông chùa');
      return {
        state: next,
        animation: 'Chắp tay',
        audioFile: 's6_dan.mp3',
        milestoneUnlocked: true,
        milestoneTitle: 'Thỉnh chuông chùa',
        title: 'Thỉnh chuông',
        message: 'Tiếng chuông ngân vang chậm rãi giúp lòng lắng dịu.'
      };
    }
    case 'SWEEP_LEAVES': {
      next.leavesSwept += 1;
      next = recordSpiritualMilestone(next, 'Quét lá sân chùa');
      return {
        state: next,
        animation: 'Di bo',
        audioFile: 'day_di.mp3',
        milestoneUnlocked: true,
        milestoneTitle: 'Quét lá sân chùa',
        title: 'Quét lá sân chùa',
        message: 'Sân gạch sạch lá vàng, lòng cũng thấy thảnh thơi hơn.'
      };
    }
    case 'EQUIP_ITEM': {
      const { slot, itemKey } = payload;
      if (slot && Object.prototype.hasOwnProperty.call(next.equippedItems, slot)) {
        next.equippedItems[slot] = next.equippedItems[slot] === itemKey ? null : itemKey;
      }
      return {
        state: next,
        animation: 'Dung',
        title: 'Đã thay trang phục',
        message: 'Trang phục của nhân vật đã được cập nhật.'
      };
    }
    default:
      return { state: next, animation: 'Dung', title: '', message: '' };
  }
}

/**
 * Dấu Ấn Hành Trình (9 cánh hoa sen thanh tịnh ứng với 9 điểm hành hương trong chùa)
 * Không dùng thanh EXP, level, điểm số hay danh hiệu cạnh tranh.
 */
export function calculateJourneyImprint(spiritual) {
  const s = createSpiritualState(spiritual);
  const visitedSet = new Set(Array.isArray(s.visitedStations) ? s.visitedStations : [5]);
  const petals = PILGRIMAGE_STATIONS.map((st) => ({
    id: st.id,
    key: st.key,
    name: st.name,
    pinLabel: st.pinLabel,
    zoneCode: st.zoneCode,
    subtitle: st.subtitle,
    lit: visitedSet.has(st.id)
  }));
  const litCount = petals.filter((p) => p.lit).length;
  return {
    petals,
    litCount,
    totalPetals: PILGRIMAGE_STATIONS.length
  };
}

/**
 * Tổng hợp Công đức thực hành (số lần Lễ Phật, Dâng hương, Dâng hoa)
 */
export function calculateMeritSummary(spiritual) {
  const s = createSpiritualState(spiritual);
  const bowActs = Math.floor(s.bowCount / 3);
  const incenseActs = s.incenseOfferings;
  const flowerActs = s.lotusOfferings;
  return {
    bowActs,
    bowCount: s.bowCount,
    incenseActs,
    flowerActs,
    totalActs: bowActs + incenseActs + flowerActs
  };
}

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
    image: '/Thiết kế giao diện/Vật phẩm 3D/blender-render-non-la.png',
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
    glb: '/Thiết kế giao diện/Vật phẩm 3D/models/ao_trang_phat_tu.glb',
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
    glb: '/Mô hình 3D Vĩnh Tràng/Tượng/phat-ngoi-ban-tho.glb',
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

/**
 * 10 Canonical Buddhist Textbooks available in /Giáo trình phật học/
 */
export const DHARMA_TEXTBOOKS = [
  {
    id: 'phpt_1',
    title: 'Phật Học Phổ Thông — Quyển 1 (Khóa I, II, III)',
    author: 'Hòa thượng Thích Thiện Hoa',
    pdfPath: '/Giáo trình phật học/Phật học phổ thông 1.pdf',
    coreTeachings: 'Trình bày hệ thống từ Quy Y Tam Bảo, Ngũ Giới, Thập Thiện, Tứ Nhiếp Pháp đến Nhân Quả, Luân Hồi và Tứ Diệu Đế theo phương pháp sư phạm dễ hiểu cho Phật tử tại gia.'
  },
  {
    id: 'phpt_3',
    title: 'Phật Học Phổ Thông — Quyển 3 (Lục Độ & Đại Thừa)',
    author: 'Hòa thượng Thích Thiện Hoa',
    pdfPath: '/Giáo trình phật học/Phật học phổ thông 3.pdf',
    coreTeachings: 'Đi sâu vào Tứ Vô Lượng Tâm (Từ, Bi, Hỷ, Xả), Lục Độ Ba La Mật và tinh thần Bồ Tát Đạo nhập thế cứu khổ.'
  },
  {
    id: 'duc_phat_day_nhung_gi',
    title: 'Đức Phật Dạy Những Gì (What the Buddha Taught)',
    author: 'HT. Walpola Rahula · Ni sư Trí Hải dịch',
    pdfPath: '/Giáo trình phật học/duc-phat-day-nhung-gi-ht-walpola-rahula-ns-tri-hai-dich.pdf',
    coreTeachings: 'Kiệt tác Phật học thế giới giải thích chuẩn xác thái độ tâm thức Phật giáo, Tứ Diệu Đế, thuyết Vô Ngã (Anatta), Duyên Khởi và Thiền Chánh Niệm.'
  },
  {
    id: 'nen_tang_1_tam_bao',
    title: 'Nền Tảng Phật Giáo — Quyển 1: Tam Bảo',
    author: 'Tỳ kheo Giác Giới',
    pdfPath: '/Giáo trình phật học/nen-tang-phat-giao-quyen-1-tam-bao.pdf',
    coreTeachings: 'Giải thích rõ ân đức của Phật Bảo (Tự giác, Giác tha, Giác hạnh viên mãn), Pháp Bảo (Thiết thực hiện tại, vượt thời gian) và Tăng Bảo.'
  },
  {
    id: 'nen_tang_2_quy_y',
    title: 'Nền Tảng Phật Giáo — Quyển 2: Quy Y Tam Bảo',
    author: 'Tỳ kheo Giác Giới',
    pdfPath: '/Giáo trình phật học/nen-tang-phat-giao-quyen-2-quy-y-tam-bao.pdf',
    coreTeachings: 'Làm sáng tỏ ý nghĩa Quy y nội tâm (quay về tự tính giác ngộ) và Quy y ngoại tướng, cùng các điều làm thành tựu hay đứt mẻ giới quy y.'
  },
  {
    id: 'nen_tang_4_nghiep',
    title: 'Nền Tảng Phật Giáo — Quyển 4: Nghiệp và Quả của Nghiệp',
    author: 'Tỳ kheo Giác Giới',
    pdfPath: '/Giáo trình phật học/nen-tang-phat-giao-quyen-4-nghiep-va-qua-cua-nghiep.pdf',
    coreTeachings: 'Phân tích Cố ý (Tác ý - Cetanā) chính là Nghiệp, 10 bất thiện nghiệp, 10 thiện nghiệp và phương pháp chuyển hóa trọng nghiệp bằng tu tâm.'
  },
  {
    id: 'nen_tang_5_phuoc',
    title: 'Nền Tảng Phật Giáo — Quyển 5: Phước Thiện (Puñña)',
    author: 'Tỳ kheo Giác Giới',
    pdfPath: '/Giáo trình phật học/nen-tang-phat-giao-quyen-quyen-5-phuoc-thien.pdf',
    coreTeachings: 'Mười cội phước thiện (Thập phúc nghiệp sự): Bố thí, Trì giới, Tham thiền, Cung kính, Phục vụ, Hồi hướng phước, Tùy hỷ phước, Thính pháp, Thuyết pháp và Chánh kiến.'
  },
  {
    id: 'thien_ajahn_brahm',
    title: 'Phương Pháp Thiền Căn Bản (Basic Method of Meditation)',
    author: 'Thiền sư Ajahn Brahm',
    pdfPath: '/Giáo trình phật học/phuong-phap-thien-can-ban-ajahn-brahm-tieng-viet.pdf',
    coreTeachings: 'Hướng dẫn từng bước buông xả quá khứ và tương lai, an trú trong hiện tại tĩnh lặng và theo dõi hơi thở êm dịu dẫn vào định.'
  },
  {
    id: 'tich_truyen_phap_cu',
    title: 'Tích Truyện Pháp Cú (Dhammapada Commentary)',
    author: 'Bản dịch Việt ngữ',
    pdfPath: '/Giáo trình phật học/tichtruyenphapcu.pdf',
    coreTeachings: 'Những câu chuyện lịch sử sinh động thời Đức Phật gắn liền với 423 bài kệ Kinh Pháp Cú — bài học nhân sinh sâu sắc.'
  },
  {
    id: 'tu_duong_tam_tu',
    title: 'Tu Dưỡng Tâm Từ Bằng Thiền Chánh Niệm',
    author: 'Giáo trình Thiền Tứ Niệm Xứ & Tâm Từ',
    pdfPath: '/Giáo trình phật học/tu-duong-tam-tu-bang-thien-chanh-niem.pdf',
    coreTeachings: 'Kết hợp Quán thân thọ tâm pháp (Satipatthana) với thiền Rải Tâm Từ (Metta Bhavana) để chữa lành tổn thương và nuôi dưỡng lòng bi mẫn.'
  }
];

export const LECTURE_PATHS = [
  {
    id: 'A',
    code: 'Gói A',
    title: 'Nhập môn Phật pháp căn bản',
    subtitle: 'Theo Phật Học Phổ Thông (HT. Thích Thiện Hoa) & Nền Tảng Phật Giáo: Tam Bảo, Ngũ Giới, Nhân Quả',
    duration: '6 bài học · 75 phút',
    audioTrack: 's3_giang_duong.mp3'
  },
  {
    id: 'B',
    code: 'Gói B',
    title: 'Kinh điển & Lời Phật dạy tinh yếu',
    subtitle: 'Theo Đức Phật Dạy Những Gì (Walpola Rahula) & Tích Truyện Pháp Cú: Tâm Kinh, Từ Bi, Niệm Phật',
    duration: '6 bài học · 80 phút',
    audioTrack: 'niem_phat_xa.mp3'
  },
  {
    id: 'C',
    code: 'Gói C',
    title: 'Thiền chánh niệm & Sống an đời thường',
    subtitle: 'Theo Phương Pháp Thiền Căn Bản (Ajahn Brahm) & Tu Dưỡng Tâm Từ: Hơi thở, Lắng nghe, Hiếu đạo',
    duration: '6 bài học · 70 phút',
    audioTrack: 's6_dan.mp3'
  },
  {
    id: 'D',
    code: 'Gói D',
    title: 'Di sản & Nghi lễ Chùa Vĩnh Tràng',
    subtitle: 'Lịch sử cổ tự Vĩnh Tràng 1849, kiến trúc Á – Âu, 18 vị La Hán và nghi thức đi chùa đúng pháp',
    duration: '6 bài học · 65 phút',
    audioTrack: 's0_chao.mp3'
  }
];

export const LECTURE_LESSONS = [
  {
    id: 'A1',
    pathId: 'A',
    order: 1,
    title: 'Tam Bảo là gì? Ý nghĩa Phật – Pháp – Tăng',
    duration: '12 phút',
    audio: 's3_giang_duong.mp3',
    sourceBook: 'Nền Tảng Phật Giáo Quyển 1: Tam Bảo & Phật Học Phổ Thông Q.1',
    summary: [
      'Phật Bảo (Buddha) là Đấng Tự Giác, Giác Tha, Giác Hạnh Viên Mãn — bậc Đạo sư chỉ đường sáng suốt.',
      'Pháp Bảo (Dhamma) là phương thuốc nhiệm mầu gồm Giáo pháp và Chứng pháp có công năng diệt trừ phiền não.',
      'Tăng Bảo (Sangha) là đoàn thể thanh tịnh cùng tu tập, giữ gìn và truyền trao mạng mạch Chánh pháp.'
    ],
    example: 'Khi vào Chánh điện Chùa Vĩnh Tràng lạy 3 lạy (Tam Bái), mỗi lạy là sự trở về nương tựa nơi Phật (Tỉnh thức), Pháp (Chánh kiến) và Tăng (Hòa hợp thanh tịnh).',
    practice: 'Hôm nay khi chắp tay trước ngực, hãy thở vào thật sâu và thầm nhủ: "Con về nương tựa Phật, người đưa đường chỉ lối cho con trong cuộc đời."',
    quiz: {
      question: 'Trong giáo lý Tam Bảo (Phật Học Phổ Thông), yếu tố nào được ví như "phương thuốc lành" trực tiếp chữa lành bệnh khổ đau trong tâm?',
      options: ['Phật Bảo (Vị lương y)', 'Pháp Bảo (Phương thuốc lành)', 'Tăng Bảo (Người chăm sóc hướng dẫn)'],
      correctIndex: 1,
      explanation: 'HT. Thích Thiện Hoa giảng: Đức Phật như vị lương y giỏi, Pháp Bảo là phương thuốc nhiệm mầu, Tăng Bảo là y tá tận tâm hướng dẫn bệnh nhân uống thuốc.'
    }
  },
  {
    id: 'A2',
    pathId: 'A',
    order: 2,
    title: 'Quy Y Tam Bảo & Năm Giới quý báu của người tại gia',
    duration: '13 phút',
    audio: 's0_nhan_nhang.mp3',
    sourceBook: 'Nền Tảng Phật Giáo Quyển 2: Quy Y Tam Bảo',
    summary: [
      'Quy (quay về) Y (nương tựa): Quay từ bờ mê lầm về nương tựa ánh sáng Giác – Chánh – Tịnh.',
      'Năm giới gồm: Không sát sanh, Không trộm cắp, Không tà hạnh, Không nói dối/lời ác, Không say sưa nghiện ngập.',
      'Giữ 5 giới là 5 món quà bình an (Ngũ đại thí) hiến tặng cho gia đình và xã hội.'
    ],
    example: 'Trước khi nói lời nóng giận với người thân, người Phật tử nhớ đến giới thứ tư (Chánh ngữ & Ái ngữ) để chọn lời nói ôn hòa.',
    practice: 'Chọn 1 trong 5 giới để thực hành trọn vẹn trong 24 giờ tới, bắt đầu từ lời nói chân thật và dịu dàng.',
    quiz: {
      question: 'Bản chất thực sự của Năm Giới (Ngũ Giới) trong đạo Phật là gì?',
      options: [
        'Những hình phạt bắt buộc của nhà chùa',
        'Năm nguyên tắc đạo đức tự nguyện giúp bảo vệ tự do và bình an cho mình và muôn loài',
        'Chỉ dành riêng cho người xuất gia'
      ],
      correctIndex: 1,
      explanation: 'Ngũ giới là hàng rào đạo đức tự nguyện bảo vệ hạnh phúc gia đình, giúp hành giả sống không hối hận (vô tác hối).'
    }
  },
  {
    id: 'A3',
    pathId: 'A',
    order: 3,
    title: 'Tứ Diệu Đế: Bốn sự thật nhiệm mầu (Đức Phật Dạy Những Gì)',
    duration: '14 phút',
    audio: 's3_giang_duong.mp3',
    sourceBook: 'Đức Phật Dạy Những Gì — HT. Walpola Rahula (NS. Trí Hải dịch)',
    summary: [
      'Khổ Đế (Dukkha): Nhận diện trung thực tính bất toàn, vô thường của thế gian mà không bi quan.',
      'Tập Đế (Samudaya): Thấy rõ gốc rễ của khổ là Ái dục (Tanha) đi kèm chấp thủ và vô minh.',
      'Diệt Đế (Nirodha) & Đạo Đế (Magga): Niết Bàn tịch tịnh có thể chứng nghiệm ngay trong hiện tại nhờ Bát Chánh Đạo.'
    ],
    example: 'Khi gặp chuyện buồn, thay vì trách hoàn cảnh, ta dùng Tứ Diệu Đế như bác sĩ bắt mạch: biết rõ nỗi khổ (Tri khổ), buông nguyên nhân chấp trước (Đoạn tập), và thở chánh niệm (Tu đạo).',
    practice: 'Ghi nhận một điều đang làm bạn căng thẳng hôm nay và tìm xem sự đòi hỏi quá mức nào phía sau đang tạo nên áp lực đó.',
    quiz: {
      question: 'Theo tác phẩm "Đức Phật Dạy Những Gì" của HT. Walpola Rahula, thái độ của đạo Phật khi nói về Khổ Đế là gì?',
      options: [
        'Bi quan chán đời',
        'Hiện thực và sáng suốt như vị y sĩ chẩn đoán đúng bệnh để chữa lành dứt điểm',
        'Lạc quan giả tạo'
      ],
      correctIndex: 1,
      explanation: 'Đức Phật không bi quan cũng không lạc quan mù quáng, mà là bậc Hiện Thực (Yathābhūta) nhìn thẳng sự thật để giải thoát.'
    }
  },
  {
    id: 'A4',
    pathId: 'A',
    order: 4,
    title: 'Nghiệp (Kamma) & Mười Cội Phước Thiện (Puñña)',
    duration: '12 phút',
    audio: 's6_dan.mp3',
    sourceBook: 'Nền Tảng Phật Giáo Quyển 4 & Quyển 5 (Nghiệp & Phước Thiện)',
    summary: [
      'Đức Phật định nghĩa: "Này các Tỳ kheo, Tác ý (Cetanā - sự cố ý) chính là Nghiệp".',
      'Mười cội phước thiện gồm: Bố thí, Trì giới, Tham thiền, Cung kính, Phục vụ, Hồi hướng, Tùy hỷ, Thính pháp, Thuyết pháp, Chánh kiến.',
      'Nhân quả không phải thuyết định mệnh; gieo thiện nghiệp hiện tại sẽ chuyển hóa tương lai.'
    ],
    example: 'Khi bạn bấm "Hồi hướng công đức" hoặc vui mừng trước ảnh đi chùa của Phật tử khác (Tùy hỷ phước), bạn đã thành tựu cội phước thiện thanh cao.',
    practice: 'Thực hiện 3 cội phước không tốn tiền hôm nay: Cung kính người lớn, Phục vụ giúp đỡ việc nhỏ, và Tùy hỷ niềm vui của người khác.',
    quiz: {
      question: 'Theo Kinh Tăng Chi Bộ (được trích trong Nền Tảng Phật Giáo Q.4), yếu tố cốt lõi nào quyết định một hành động trở thành Nghiệp (Kamma)?',
      options: [
        'Sự ngẫu nhiên vô tình',
        'Tác ý (Cetanā — Ý chí chủ tâm thiện hoặc bất thiện khi tạo tác bằng Thân, Khẩu, Ý)',
        'Sự phán xét của người ngoài'
      ],
      correctIndex: 1,
      explanation: '"Cetanāhaṃ bhikkhave kammaṃ vadāmi" — Chính Tác ý (ý chủ tâm) là hạt nhân tạo thành Nghiệp.'
    }
  },
  {
    id: 'A5',
    pathId: 'A',
    order: 5,
    title: 'Bát Chánh Đạo & Tam Vô Lậu Học (Giới – Định – Tuệ)',
    duration: '13 phút',
    audio: 's3_giang_duong.mp3',
    sourceBook: 'Phật Học Phổ Thông Quyển 1 & Đức Phật Dạy Những Gì',
    summary: [
      'Tám chi phần chân chánh gom vào 3 môn học giải thoát (Tam vô lậu học): Giới học, Định học và Tuệ học.',
      'Tuệ học: Chánh kiến & Chánh tư duy. Giới học: Chánh ngữ, Chánh nghiệp, Chánh mạng. Định học: Chánh tinh tấn, Chánh niệm, Chánh định.',
      'Giữ Giới giúp tâm không loạn (sinh Định); tâm Định tĩnh như mặt hồ phẳng lặng sẽ chiếu sáng Trí Tuệ.'
    ],
    example: 'Khi điều khiển nhân vật đi từng bước trên sân gạch Chùa Vĩnh Tràng, sự chú tâm lắng nghe tiếng bước chân và chuông chùa chính là thực tập Chánh niệm.',
    practice: 'Dành 5 phút đi bộ chậm rãi mà không nhìn điện thoại, cảm nhận rõ từng bước chân chạm đất.',
    quiz: {
      question: 'Ba trụ cột chính (Tam vô lậu học) bao trùm toàn bộ 8 chi phần Bát Chánh Đạo là gì?',
      options: ['Giới – Định – Tuệ', 'Phước – Lộc – Thọ', 'Danh – Lợi – Quyền'],
      correctIndex: 0,
      explanation: 'Tám nhánh Bát Chánh Đạo kết tinh thành Giới – Định – Tuệ, ba trụ cột nâng đỡ toàn bộ tòa nhà Phật pháp.'
    }
  },
  {
    id: 'A6',
    pathId: 'A',
    order: 6,
    title: 'Lục Độ Ba La Mật & Tứ Vô Lượng Tâm (Từ – Bi – Hỷ – Xả)',
    duration: '11 phút',
    audio: 's6_hoi_huong.mp3',
    sourceBook: 'Phật Học Phổ Thông Quyển 3 — HT. Thích Thiện Hoa',
    summary: [
      'Sáu phép thực hành đưa sang bờ giác: Bố thí, Trì giới, Nhẫn nhục, Tinh tấn, Thiền định, Trí tuệ.',
      'Tứ Vô Lượng Tâm: Từ (ban vui), Bi (cứu khổ), Hỷ (vui theo điều lành của người), Xả (buông bỏ thành kiến phân biệt).',
      'Nhẫn nhục và Hỷ xả là sức mạnh nội tâm lớn nhất trước nghịch cảnh.'
    ],
    example: 'Chiêm ngưỡng nụ cười của Đại tượng Phật Di Lặc tại Chùa Vĩnh Tràng giúp ta học hạnh Nhẫn nhục và Hỷ xả.',
    practice: 'Hoàn thành cả 6 nhiệm vụ trong bảng "Hành Trình Lục Độ Ba La Mật" của ứng dụng Chùa Online.',
    quiz: {
      question: 'Trong Lục Độ Ba La Mật, hạnh nào giúp bảo hộ rừng công đức không bị ngọn lửa sân giận thiêu rụi?',
      options: ['Bố thí', 'Nhẫn nhục Ba La Mật', 'Tinh tấn'],
      correctIndex: 1,
      explanation: 'Kinh dạy "Nhất niệm sân tâm khởi, bách vạn chướng môn khai", nên Nhẫn nhục giúp giữ trọn công đức lành.'
    }
  },

  // === GÓI B (6 bài) ===
  {
    id: 'B1',
    pathId: 'B',
    order: 1,
    title: 'Kinh Pháp Cú & Tích Truyện: Tâm dẫn đầu các pháp',
    duration: '14 phút',
    audio: 's6_ke_1.mp3',
    sourceBook: 'Tích Truyện Pháp Cú (Phẩm Song Yếu — Kệ số 1 & 2)',
    summary: [
      'Kệ số 1 (Tích thầy Tỳ kheo Cakkhupāla): "Ý dẫn đầu các pháp, Ý làm chủ, ý tạo".',
      'Nói hay làm với tâm ô nhiễm thì khổ đau theo sau như bánh xe theo chân con bò kéo.',
      'Kệ số 2 (Tích chàng Matthakundalī): Nói hay làm với tâm thanh tịnh thì an lạc theo sau như bóng không rời hình.'
    ],
    example: 'Chàng thanh niên Matthakundalī chỉ khởi tâm thành kính hướng về Đức Phật trên giường bệnh mà được sinh cảnh giới an lành — chứng minh sức mạnh của một niệm tâm thanh tịnh.',
    practice: 'Mỗi sáng thức dậy, khởi một ý niệm thiện lành đầu tiên chúc bình an cho gia đình và muôn loài.',
    quiz: {
      question: 'Theo tích truyện kệ số 1 & 2 Kinh Pháp Cú, yếu tố nào dẫn đầu và quyết định tính chất thiện/ác của mọi hành động?',
      options: ['Hoàn cảnh bên ngoài', 'Tâm ý (Ý làm chủ, ý tạo)', 'Tiền tài danh vọng'],
      correctIndex: 1,
      explanation: '"Ý dẫn đầu các pháp, ý làm chủ, ý tạo" — giữ tâm trong sáng là gốc của mọi an vui.'
    }
  },
  {
    id: 'B2',
    pathId: 'B',
    order: 2,
    title: 'Bát Nhã Tâm Kinh: Quán chiếu Duyên Khởi & Vô Ngã',
    duration: '15 phút',
    audio: 'niem_phat_xa.mp3',
    sourceBook: 'Bát Nhã Tâm Kinh & Đức Phật Dạy Những Gì (Chương Vô Ngã)',
    summary: [
      '"Chiếu kiến ngũ uẩn giai không, độ nhất thiết khổ ách": Thấy rõ 5 uẩn (Sắc, Thọ, Tưởng, Hành, Thức) do duyên hợp nên vượt qua khổ đau.',
      'Tính Không (Śūnyatā) không phải là hư vô, mà là vạn pháp tương tức, không có cái tôi biệt lập bất biến.',
      'Nhờ vô thường và duyên khởi mà nỗi khổ có thể chuyển hóa và hạt giống tốt có thể nảy nở.'
    ],
    example: 'Đóa hoa sen dâng Phật có mặt nhờ ánh nắng, bùn nước, đám mây và bàn tay người trồng — nhìn sâu vào đóa sen ta thấy cả vũ trụ.',
    practice: 'Khi gặp một cơn giận hay nỗi buồn, hãy quán sát nó như đám mây hợp rồi tan trên bầu trời tâm thức.',
    quiz: {
      question: 'Nhờ quán chiếu điều gì mà Bồ Tát Quán Tự Tại vượt qua hết thảy khổ ách trong Tâm Kinh?',
      options: [
        'Quán chiếu năm uẩn đều nương duyên mà thành, không có tự tính riêng biệt (Ngũ uẩn giai không)',
        'Tìm kiếm phép thuật thần thông',
        'Tránh xa cuộc đời'
      ],
      correctIndex: 0,
      explanation: 'Thấy rõ thân tâm và hoàn cảnh đều do duyên sinh, vô thường nên buông xả được chấp ngã nặng nề.'
    }
  },
  {
    id: 'B3',
    pathId: 'B',
    order: 3,
    title: 'Kinh Từ Bi (Karaniya Metta Sutta) & Thiền Tâm Từ',
    duration: '13 phút',
    audio: 's6_ke_2.mp3',
    sourceBook: 'Tu Dưỡng Tâm Từ Bằng Thiền Chánh Niệm',
    summary: [
      'Người thực hành Từ Bi sống hiền hòa, tri túc, dễ nuôi, lục căn thanh tịnh, khiêm cung.',
      'Rải tâm từ tuần tự từ chính mình -> người thương -> người trung dung -> người gây khó dễ -> khắp muôn loài.',
      'Tâm từ như mẹ hiền đem cả mạng sống che chở đứa con duy nhất của mình.'
    ],
    example: 'Sau mỗi thời niệm Phật hoặc dâng hương, ta đọc bài kệ Hồi hướng để gửi năng lượng từ bi đến cha mẹ, bà con và hết thảy chúng sanh.',
    practice: 'Gửi lời chúc thầm lặng "Mong bạn không có oan trái, không có khổ đau, thân tâm an lạc" đến 3 người hôm nay.',
    quiz: {
      question: 'Theo sách "Tu Dưỡng Tâm Từ Bằng Thiền Chánh Niệm", vì sao ta cần khởi đầu rải tâm từ cho chính mình trước?',
      options: [
        'Vì ích kỷ chỉ nghĩ cho mình',
        'Vì khi mình biết thương yêu và làm lắng dịu nội tâm mình, ta mới có nguồn năng lượng bình an chân thật để truyền trao cho người khác',
        'Vì không cần thương người ngoài'
      ],
      correctIndex: 1,
      explanation: 'Lấy chính mình làm chứng: mình muốn an vui không khổ đau thế nào thì muôn loài cũng ước mong như thế.'
    }
  },
  {
    id: 'B4',
    pathId: 'B',
    order: 4,
    title: 'Ý nghĩa Niệm Phật & Chuỗi hạt 108 biến Bồ Đề',
    duration: '13 phút',
    audio: 's1_adida.mp3',
    sourceBook: 'Giáo Trình Phật Học & Pháp Môn Tịnh Độ',
    summary: [
      'Nam Mô A Di Đà Phật nghĩa là quay về nương tựa Đấng Vô Lượng Quang (Ánh sáng trí tuệ) và Vô Lượng Thọ (Sự sống từ bi).',
      'Chuỗi 108 hạt biểu trưng cho việc chuyển hóa 108 phiền não sinh khởi khi 6 căn tiếp xúc 6 trần.',
      'Mỗi tiếng niệm Phật nhiếp cả 3 nghiệp: Tay lần chuỗi (Thân), Miệng niệm danh hiệu (Khẩu), Tâm nhớ nghĩ công đức Phật (Ý).'
    ],
    example: 'Khi bấm nút "Niệm Phật" ở góc phải màn hình, mỗi hạt chuỗi dịch chuyển cùng tiếng mõ trầm đều giúp nhịp tim và hơi thở chậm lại.',
    practice: 'Dành 3 phút lần chuỗi niệm Phật 21 hoặc 108 biến trước khi đi ngủ.',
    quiz: {
      question: 'Pháp môn Niệm Phật đạt hiệu quả "Nhất tâm bất loạn" khi hành giả kết hợp ba yếu tố nào?',
      options: [
        'Chỉ đọc bằng miệng thật to mà tâm nghĩ việc khác',
        'Ba nghiệp Thân – Khẩu – Ý hợp nhất trong chánh niệm (Miệng niệm rõ ràng, tai lắng nghe rõ ràng, tâm ghi nhớ từng câu Phật hiệu)',
        'Đếm cho thật nhanh'
      ],
      correctIndex: 1,
      explanation: 'Tổ Ấn Quang dạy: Niệm từ tâm khởi, tiếng từ miệng ra, âm vào tai nghe rõ ràng thì vọng tưởng tự lặng.'
    }
  },
  {
    id: 'B5',
    pathId: 'B',
    order: 5,
    title: 'Kinh Phước Đức (Mangala Sutta): 38 nấc thang hạnh phúc',
    duration: '12 phút',
    audio: 's6_ke_3.mp3',
    sourceBook: 'Kinh Tập (Sutta Nipāta) & Nền Tảng Phật Giáo Q.5',
    summary: [
      'Phước lành tối thượng bắt đầu từ việc không gần kẻ ác, thân cận người hiền trí, sống ở môi trường thiện lành.',
      'Đa văn học rộng, khéo nghề nghiệp chân chính, nói lời chân thật hòa ái.',
      'Phụng dưỡng cha mẹ, yêu thương vợ con, tâm không sầu muộn nhiễm ô trước 8 ngọn gió đời (Bát phong).'
    ],
    example: 'Đưa cả gia đình 3 thế hệ (Ông bà/Cha mẹ và Trẻ em) cùng đi chùa, chụp bức ảnh kỷ niệm hiếu hạnh là hình ảnh đẹp nhất của Kinh Phước Đức.',
    practice: 'Gọi điện hỏi thăm hoặc rót một tách trà ấm mời cha mẹ trong ngày hôm nay.',
    quiz: {
      question: 'Theo Kinh Phước Đức, đỉnh cao của người có phước đức giữa cuộc đời biến động là gì?',
      options: [
        'Khi xúc chạm việc đời (được/mất, hơn/thua), tâm không dao động, không sầu, trong sạch và an ổn',
        'Không bao giờ gặp thử thách',
        'Trúng số may mắn'
      ],
      correctIndex: 0,
      explanation: '"Phuṭṭhassa lokadhammehi, cittaṃ yassa na kampati" — Khi chạm việc đời mà tâm không lay động là phước đức lớn nhất.'
    }
  },
  {
    id: 'B6',
    pathId: 'B',
    order: 6,
    title: 'Bốn bài Kệ Hồi Hướng & Tâm nguyện Bồ Đề rộng lớn',
    duration: '13 phút',
    audio: 's6_ke_4.mp3',
    sourceBook: 'Nền Tảng Phật Giáo Quyển 5 (Hồi hướng phước - Pattidāna)',
    summary: [
      'Hồi hướng (Pattidāna) là đem công đức tu tập chia sẻ cho ông bà cha mẹ và khắp pháp giới chúng sanh.',
      'Kinh điển ví sự hồi hướng phước như lấy một ngọn đuốc mồi cho hàng trăm ngọn đuốc khác: ngọn đuốc đầu chẳng hề vơi đi mà cả gian phòng càng rực sáng.',
      'Kết thúc mỗi chuyến hành hương bằng lời kệ hồi hướng giúp phá trừ tâm ích kỷ nhỏ hẹp.'
    ],
    example: 'Tại trạm số 8 (Bảo Tháp Thất Phật), bốn câu kệ hồi hướng vang lên khép lại hành trình đi chùa trong niềm hoan hỷ.',
    practice: 'Thuộc lòng 4 câu: "Nguyện đem công đức này, Hướng về khắp tất cả, Đệ tử và chúng sanh, Đều trọn thành Phật đạo."',
    quiz: {
      question: 'Theo giáo lý Phước Thiện (Quyển 5), khi ta hồi hướng công đức lành cho mọi người thì phước của ta thay đổi thế nào?',
      options: [
        'Bị giảm đi một nửa',
        'Không hề hao tổn mà còn sinh thêm một cội phước mới gọi là "Phước Hồi Hướng" (Pattidāna-maya)',
        'Biến mất hoàn toàn'
      ],
      correctIndex: 1,
      explanation: 'Hồi hướng là một trong 10 cội phước thiện; càng chia sẻ bằng tâm hoan hỷ, phước báu càng tăng trưởng.'
    }
  },

  // === GÓI C (6 bài) ===
  {
    id: 'C1',
    pathId: 'C',
    order: 1,
    title: 'Phương pháp Thiền căn bản (Ajahn Brahm): An trú hiện tại',
    duration: '12 phút',
    audio: 's6_dan.mp3',
    sourceBook: 'Phương Pháp Thiền Căn Bản — Thiền sư Ajahn Brahm',
    summary: [
      'Giai đoạn 1: Buông bỏ gánh nặng quá khứ (đã qua) và tương lai (chưa tới) để bước vào căn phòng tĩnh lặng của Giây Phút Hiện Tại.',
      'Giai đoạn 2: Trở về nhận biết hơi thở tự nhiên với thái độ nâng niu, không kiểm soát hay gồng ép.',
      'Khi tâm tĩnh lặng và hỷ lạc, hơi thở trở nên êm dịu, mở cánh cửa đi vào định tĩnh sâu sắc.'
    ],
    example: 'Ngồi trên bồ đoàn trong Giảng đường Phật pháp Chùa Vĩnh Tràng, nhìn ánh nắng xuyên qua khung cửa gỗ và buông thư đôi vai theo đúng hướng dẫn của Thiền sư Ajahn Brahm.',
    practice: 'Thực hành 3 phút "Tĩnh lặng trong hiện tại": mỗi khi tâm nhớ việc cũ hay lo việc mai, nhẹ nhàng mỉm cười quay về hơi thở.',
    quiz: {
      question: 'Trong sách "Phương Pháp Thiền Căn Bản", Thiền sư Ajahn Brahm ví quá khứ và tương lai như điều gì cần buông xuống khi vào thiền?',
      options: [
        'Hai chiếc va-li nặng trĩu trên hai tay cần đặt xuống đất để được thảnh thơi trong giây phút hiện tại',
        'Hai món trang sức cần mang theo mãi',
        'Điều quan trọng hơn hiện tại'
      ],
      correctIndex: 0,
      explanation: 'Buông hai chiếc túi quá khứ và tương lai xuống giúp tâm nghỉ ngơi trọn vẹn trong hiện tại nhiệm mầu.'
    }
  },
  {
    id: 'C2',
    pathId: 'C',
    order: 2,
    title: 'Chuyển hóa cơn giận & Nghệ thuật Lắng nghe sâu',
    duration: '12 phút',
    audio: 's3_giang_duong.mp3',
    sourceBook: 'Tích Truyện Pháp Cú (Phẩm Phẫn Nộ) & Tu Dưỡng Tâm Từ',
    summary: [
      'Kinh Pháp Cú dạy: "Lấy không giận thắng giận, lấy thiện thắng không thiện".',
      'Khi cơn giận khởi lên, đừng vội nói hay hành động; hãy quay về ôm ấp và làm dịu hơi thở của chính mình trước.',
      'Lắng nghe sâu bằng tâm từ bi giúp tháo gỡ hiểu lầm trong gia đình.'
    ],
    example: 'Khi có bất đồng, nhớ lại hình ảnh tôn giả Hàng Long La Hán tại Chánh điện Vĩnh Tràng — hàng phục con rồng sân hận bằng trí tuệ tĩnh lặng.',
    practice: 'Hôm nay hãy lắng nghe một người thân tâm sự trọn vẹn 5 phút mà không ngắt lời hay phán xét.',
    quiz: {
      question: 'Theo Kinh Pháp Cú (kệ 223), phương pháp tối thắng để hóa giải lòng sân giận và oán hận là gì?',
      options: [
        'Đáp trả mạnh mẽ hơn',
        'Lấy tâm Không Giận (Từ nhẫn) để cảm hóa cái giận, lấy điều lành thắng điều chưa lành',
        'Im lặng thù ghét trong lòng'
      ],
      correctIndex: 1,
      explanation: '"Hận thù diệt hận thù, đời này không thể có; Từ bi diệt hận thù, là định luật ngàn thu."'
    }
  },
  {
    id: 'C3',
    pathId: 'C',
    order: 3,
    title: 'Đạo Hiếu trong Phật giáo: Cha mẹ là hai vị Phật tại gia',
    duration: '12 phút',
    audio: 's6_ke_1.mp3',
    sourceBook: 'Phật Học Phổ Thông Quyển 1 & Kinh Báo Hiếu Công Đức Phụ Mẫu Ân',
    summary: [
      'Đức Phật dạy: "Tâm hiếu là tâm Phật, hạnh hiếu là hạnh Phật".',
      'Thờ Phật ở xa không bằng hiếu kính, phụng dưỡng cha mẹ hiện tiền ngay trong gia đình.',
      'Đại hiếu trọn vẹn nhất là vừa chăm sóc thân cha mẹ ấm êm, vừa hướng dẫn cha mẹ biết quy y Tam Bảo, giữ giới, làm lành.'
    ],
    example: 'Trong tính năng Chụp ảnh UGC Chùa Vĩnh Tràng, bạn có thể chọn chế độ "Gia đình 3 thế hệ (Nam + Nữ + Trẻ em)" để lưu giữ khoảnh khắc hiếu hạnh sum vầy.',
    practice: 'Nói một lời biết ơn hoặc đỡ đần cha mẹ một công việc nhỏ trong hôm nay.',
    quiz: {
      question: 'Trong Kinh Tăng Chi Bộ, Đức Phật dạy cách báo đáp trọn vẹn nhất công ơn sinh thành dưỡng dục của cha mẹ là gì?',
      options: [
        'Chỉ chu cấp tiền bạc là đủ',
        'Vừa phụng dưỡng chu đáo bằng lòng kính yêu, vừa khuyến hóa cha mẹ có niềm tin nơi Tam Bảo, giữ giới, bố thí và trí tuệ',
        'Đợi đến rằm tháng Bảy mới nhớ tới'
      ],
      correctIndex: 1,
      explanation: 'Giúp cha mẹ an vui cả đời này lẫn gieo nhân lành giải thoát nhiều đời sau là đại hiếu viên mãn.'
    }
  },
  {
    id: 'C4',
    pathId: 'C',
    order: 4,
    title: 'Thiền hành & Thiền trà trong đời sống bận rộn',
    duration: '11 phút',
    audio: 'day_di.mp3',
    sourceBook: 'Tu Dưỡng Tâm Từ Bằng Thiền Chánh Niệm (Tứ Oai Nghi Đi – Đứng – Nằm – Ngồi)',
    summary: [
      'Chánh niệm không chỉ giới hạn lúc ngồi xếp bằng mà tiếp nối trong cả 4 oai nghi: Đi, Đứng, Nằm, Ngồi.',
      'Khi bước đi trên sân chùa, biết rõ từng bước chân chạm mặt đá mát lành.',
      'Khi nâng chén trà sen, tâm hoàn toàn có mặt với hương trà và người đối diện.'
    ],
    example: 'Tản bộ quanh vườn bonsai Mai Chiếu Thủy và hoa giấy hồng ở sân chùa Vĩnh Tràng với tâm thư thái.',
    practice: 'Khi uống ly nước hoặc tách trà chiều nay, hãy dừng mọi việc khác trong 1 phút để cảm nhận hơi ấm nơi lòng bàn tay.',
    quiz: {
      question: 'Mục đích chính của Thiền hành (đi bộ trong chánh niệm) là gì?',
      options: [
        'Đi thật nhanh cho kịp giờ',
        'Đưa tâm trở về hợp nhất với thân trong từng bước chân bình an nơi hiện tại',
        'Vừa đi vừa suy tính công việc'
      ],
      correctIndex: 1,
      explanation: 'Thiền hành giúp thân và tâm cùng có mặt ở đây và bây giờ, mỗi bước chân đều nở hoa sen.'
    }
  },
  {
    id: 'C5',
    pathId: 'C',
    order: 5,
    title: 'Buông xả lo âu & Giấc ngủ an lành của người có Tâm Từ',
    duration: '11 phút',
    audio: 's5_nirvana.mp3',
    sourceBook: 'Tu Dưỡng Tâm Từ Bằng Thiền Chánh Niệm (11 Phước Báu Của Tâm Từ)',
    summary: [
      'Kinh Tăng Chi nêu 11 lợi ích của người tu tập Tâm Từ: Ngủ an lành, Thức dậy an lành, Không ác mộng, Được người và chư thiên quý mến, Sắc mặt hiền hòa, Tâm dễ định tĩnh...',
      'Thực tập buông thư toàn thân từ đỉnh đầu xuống bàn chân trước khi ngủ.',
      'Thầm gửi lời tha thứ cho mình và cho mọi người trước khi khép mắt.'
    ],
    example: 'Tư thế Cát Tường an nhiên của tôn tượng Phật Niết Bàn dài 32m tại Vĩnh Tràng nhắc ta biết buông xuống những gánh nặng không cần thiết.',
    practice: 'Trước khi ngủ tối nay, thực tập tha thứ và rải tâm từ trong 2 phút để đón nhận giấc ngủ sâu bình yên.',
    quiz: {
      question: 'Theo Kinh điển Pali (trích trong sách Tu Dưỡng Tâm Từ), người thường xuyên thực hành rải Tâm Từ trước khi ngủ sẽ nhận được phước lành nào ngay trong đêm?',
      options: [
        'Ngủ an lành, thức dậy an lành, không gặp ác mộng và gương mặt tươi sáng',
        'Thức trắng đêm suy nghĩ',
        'Mơ thấy tranh đấu'
      ],
      correctIndex: 0,
      explanation: 'Đức Phật dạy 11 phước báu hiện tiền của Tâm Từ, đứng đầu là "Ngủ an lạc, thức dậy an lạc, không thấy ác mộng".'
    }
  },
  {
    id: 'C6',
    pathId: 'C',
    order: 6,
    title: 'Hạnh Tri Ân, Báo Ân & Tri Túc Thường Lạc',
    duration: '12 phút',
    audio: 's7_tam_biet.mp3',
    sourceBook: 'Phật Học Phổ Thông Quyển 1 & Kinh Di Giáo',
    summary: [
      'Đức Phật dạy người biết ơn và đền ơn (Tri ân – Báo ân) là biểu hiện của bậc thiện nhân giữa cuộc đời.',
      'Tứ trọng ân: Ân cha mẹ, Ân Tam Bảo – thầy tổ, Ân quốc gia xã hội, Ân chúng sanh vạn loại.',
      'Kinh Di Giáo dạy: "Người biết đủ (Tri túc) tuy nằm trên đất vẫn thấy an vui; người không biết đủ dù ở thiên đường cũng chưa vừa ý."'
    ],
    example: 'Viết 3 điều biết ơn vào cuốn Sổ tay hoa sen lưu niệm mỗi tối giúp tâm hồn luôn ấm áp.',
    practice: 'Viết ra 3 điều giản dị mà bạn cảm thấy biết ơn trong ngày hôm nay.',
    quiz: {
      question: 'Lời dạy cuối cùng của Đức Phật trong Kinh Di Giáo về hạnh "Tri túc" (Biết đủ) mang ý nghĩa gì?',
      options: [
        'Lười biếng không làm việc',
        'Biết đủ và trân trọng những gì mình đang có bằng chánh mạng, không để lòng tham lam bất tận làm khổ tâm',
        'Đòi hỏi thật nhiều'
      ],
      correctIndex: 1,
      explanation: '"Tri túc chi pháp, tức thị phú lạc an ổn chi xứ" — Hạnh biết đủ chính là nơi giàu có, an vui và bình ổn nhất.'
    }
  },

  // === GÓI D (6 bài) ===
  {
    id: 'D1',
    pathId: 'D',
    order: 1,
    title: 'Lịch sử Chùa Vĩnh Tràng — Cổ tự trăm năm miền Tây',
    duration: '11 phút',
    audio: 's0_chao.mp3',
    sourceBook: 'Biên Niên Sử Danh Lam Chùa Vĩnh Tràng (Mỹ Tho · Tiền Giang)',
    summary: [
      'Khởi dựng từ đầu thế kỷ XIX tại làng Mỹ Hóa (nay thuộc TP. Mỹ Tho, Tiền Giang) bởi ông bà Tri huyện Bùi Công Đạt.',
      'Năm 1849, Hòa thượng Thích Huệ Đăng từ chùa Giác Lâm (Gia Định) về trụ trì, đại trùng tu và đặt tên chùa Vĩnh Tràng ("Vĩnh cửu đối sơn trang").',
      'Trải qua các đợt trùng tu lớn năm 1907 và 1933, chùa được công nhận Di tích lịch sử – văn hóa cấp Quốc gia năm 1984.'
    ],
    example: 'Ngay từ cổng Tam Quan ghép mảnh sành sứ năm 1933 bởi nghệ nhân Huế, du khách đã cảm nhận được bề dày lịch sử gần 200 năm.',
    practice: 'Quan sát kỹ các bức phù điêu sành sứ và hàng cột vòm trước mặt tiền Chánh điện.',
    quiz: {
      question: 'Tên gọi "Vĩnh Tràng" do Hòa thượng Thích Huệ Đăng đặt năm 1849 bắt nguồn từ câu đối mang ý nghĩa gì?',
      options: [
        'Vĩnh cửu đối sơn trang, Tràng nghiêm quy hải tạng (Mãi mãi trang nghiêm bền vững cùng non sông biển rộng)',
        'Ngôi chùa nhỏ bên sông',
        'Nơi buôn bán sầm uất'
      ],
      correctIndex: 0,
      explanation: 'Tên chùa lấy hai chữ đầu của câu đối "Vĩnh cửu đối sơn trang, Tràng nghiêm quy hải tạng".'
    }
  },
  {
    id: 'D2',
    pathId: 'D',
    order: 2,
    title: 'Kiến trúc giao thoa Á – Âu độc đáo của Chánh Điện',
    duration: '11 phút',
    audio: 's3_lay_phat.mp3',
    sourceBook: 'Nghiên Cứu Kiến Trúc Mỹ Thuật Cổ Tự Nam Bộ',
    summary: [
      'Mặt tiền kết hợp hài hòa vòm cửa La Mã, thức cột Corinth/Phục Hưng, bông sắt Pháp với mái chùa cổ truyền Việt Nam và hoa văn Khmer.',
      'Bên trong nội điện giữ trọn cấu trúc gỗ truyền thống kiểu chữ Quốc (國) gồm Tiền đường, Chánh điện, Nhà tổ và Nhà hậu với 7 bộ bao lam chạm thếp vàng.',
      'Hàng hiên gạch bông và phù điêu gốm sứ màu lam – vàng tạo nên vẻ đẹp độc nhất vô nhị.'
    ],
    example: 'Trong cảnh 3D chính của ứng dụng, bạn thấy rõ 7 vòm cửa uốn cong vàng ấm cùng phù điêu gốm xanh trắng đặc trưng Vĩnh Tràng.',
    practice: 'Di chuyển nhân vật lại gần bậc thềm Chánh điện hoặc chụp một tấm ảnh UGC trước mặt tiền Á – Âu.',
    quiz: {
      question: 'Nét đặc sắc nổi bật nhất về mặt kiến trúc của mặt tiền Chánh điện Chùa Vĩnh Tràng là gì?',
      options: [
        'Hoàn toàn bằng bê tông hiện đại',
        'Sự kết hợp nhuần nhuyễn giữa nghệ thuật kiến trúc Á Đông cổ truyền (mái ngói, tứ linh) và nét trang trí Phục Hưng – La Mã phương Tây',
        'Xây dựng hoàn toàn bằng đá xanh'
      ],
      correctIndex: 1,
      explanation: 'Chùa Vĩnh Tràng nổi tiếng khắp Đông Nam Á nhờ sự giao thoa kiến trúc Đông – Tây đầy thẩm mỹ.'
    }
  },
  {
    id: 'D3',
    pathId: 'D',
    order: 3,
    title: 'Bộ tượng Thập Bát La Hán gỗ mít trăm tuổi (1907)',
    duration: '11 phút',
    audio: 's3_lay_phat.mp3',
    sourceBook: 'Di Sản Điêu Khắc Cổ Chùa Vĩnh Tràng',
    summary: [
      'Gồm 18 pho tượng La Hán tạc bằng gỗ mít cổ thụ từ năm 1907 đặt dọc hai tường bên nội điện.',
      'Mỗi vị cao khoảng 0.8m–1m, cưỡi linh thú hoặc cầm pháp khí riêng: Tọa Lộc, Khánh Hỷ, Cử Bát, Thác Tháp, Tĩnh Tọa, Quá Giang, Kỵ Tượng, Tiếu Sư, Khai Tâm, Hàng Long, Phục Hổ...',
      'Thể hiện đỉnh cao nghệ thuật điêu khắc gỗ tâm linh Nam Bộ đầu thế kỷ XX.'
    ],
    example: 'Mỗi vị La Hán tuy diện mạo khác nhau nhưng đều biểu thị trí tuệ đã chiến thắng phiền não nội tâm.',
    practice: 'Vào mục Khám phá -> Thập Bát La Hán để xem chi tiết ý nghĩa từng vị trong 18 vị La Hán Chùa Vĩnh Tràng.',
    quiz: {
      question: 'Bộ tượng 18 vị La Hán nổi tiếng tại Chùa Vĩnh Tràng được chế tác năm 1907 từ chất liệu gì?',
      options: ['Đá hoa cương', 'Gỗ mít cổ thụ chạm khắc thủ công sơn thếp vàng', 'Thạch cao'],
      correctIndex: 1,
      explanation: 'Các nghệ nhân miền Nam xưa đã dùng gỗ mít già bền chắc để chạm khắc sống động 18 vị La Hán.'
    }
  },
  {
    id: 'D4',
    pathId: 'D',
    order: 4,
    title: 'Ba pho Đại Tượng lộ thiên: Di Lặc – A Di Đà – Niết Bàn',
    duration: '11 phút',
    audio: 's4_dilac.mp3',
    sourceBook: 'Quy Hoạch Khuôn Viên 2 Hecta Chùa Vĩnh Tràng',
    summary: [
      'Đại tượng Phật A Di Đà đứng cao 18m (tính cả bệ 24m) biểu trưng cho từ bi tiếp dẫn.',
      'Đại tượng Phật Di Lặc ngồi cao 20m, rộng 18m với nụ cười hoan hỷ bao dung.',
      'Đại tượng Phật Thích Ca Niết Bàn dài 32m an nhiên giữa vườn cây xanh mát.'
    ],
    example: 'Ba pho đại tượng tạo thành thế Tam Tôn lộ thiên hùng vĩ giữa khuôn viên 2 hecta của nhà chùa.',
    practice: 'Bấm vào Bản đồ Khuôn viên 9 Khu vực để di chuyển đến chiêm bái lần lượt cả 3 pho đại tượng.',
    quiz: {
      question: 'Ba pho đại tượng trắng lộ thiên nổi tiếng trong khuôn viên Chùa Vĩnh Tràng gồm những tôn tượng nào?',
      options: [
        'Phật A Di Đà đứng, Phật Di Lặc ngồi và Phật Thích Ca nhập Niết Bàn',
        'Ba tượng Hộ Pháp',
        'Ba tượng Quan Công'
      ],
      correctIndex: 0,
      explanation: 'Đây là 3 công trình điêu khắc Phật giáo quy mô lớn tạo điểm nhấn tâm linh cho toàn khuôn viên.'
    }
  },
  {
    id: 'D5',
    pathId: 'D',
    order: 5,
    title: 'Nghi thức đi chùa đúng pháp: Trang phục, Đi đứng & Thắp hương',
    duration: '11 phút',
    audio: 's3_bo_dep.mp3',
    sourceBook: 'Cẩm Nang Oai Nghi Phật Tử Tại Gia',
    summary: [
      'Trang phục kín đáo, trang nhã (như bộ áo tràng lam Phật tử 5 nút cổ tàu cho Nữ, Nam và Trẻ em).',
      'Vào chùa đi cửa bên (Giả quan / Không quan), không dẫm lên bậu cửa gỗ, bỏ dép trước khi vào nội điện.',
      'Chỉ thắp 1 đến 3 nén hương tại lư hương ngoài sân, phẩy tắt lửa bằng tay chứ không thổi bằng miệng.'
    ],
    example: 'Ba nhân vật Phật tử (Nam, Nữ, Trẻ em) trong Chùa Online đều mặc pháp phục kín đáo, thực hiện đúng 4 bước dâng hương ngoài sân trước khi vào lễ Phật.',
    practice: 'Thực hành trọn vẹn quy trình 4 bước Dâng hương và 3 lạy Lễ Phật ngay trên giao diện chính.',
    quiz: {
      question: 'Khi nén hương bốc lửa lúc châm, người đi chùa nên làm gì cho đúng oai nghi?',
      options: [
        'Dùng miệng thổi mạnh cho tắt',
        'Cầm hương phẩy nhẹ bằng tay cho tắt lửa rồi mới nâng ngang trán khấn nguyện',
        'Cắm ngay khi lửa còn cháy to'
      ],
      correctIndex: 1,
      explanation: 'Theo truyền thống Phật giáo, hơi thở từ miệng được xem là bất tịnh đối với hương dâng Phật nên ta dùng tay phẩy nhẹ.'
    }
  },
  {
    id: 'D6',
    pathId: 'D',
    order: 6,
    title: 'Ý nghĩa Dâng Hoa Sen, Chuông Chùa & Lưu Bút Hành Hương Chánh Tín',
    duration: '10 phút',
    audio: 'merit_box.mp3',
    sourceBook: 'Phật Học Phổ Thông & Văn Hóa Đi Chùa Việt Nam',
    summary: [
      'Dâng hoa sen tượng trưng cho việc tu nhân thiện lành (hoa) để kết thành quả giác ngộ (gương sen) ngay trong hiện tại.',
      'Thỉnh chuông chùa và dạo bước chánh niệm quanh 9 điểm hành hương giúp buông xả căng thẳng, nuôi dưỡng tâm từ bi.',
      'Lưu giữ bức ảnh kỷ niệm cùng Chùa Vĩnh Tràng sau khi lễ Phật là cách nhắc nhở bản thân và gia đình giữ gìn nếp sống hướng thiện.'
    ],
    example: 'Bạn có thể vào mục "📸 Chụp ảnh UGC" sau khi hoàn thành một nghi lễ để lưu giữ kỷ niệm gia đình 3 nhân vật trước Chùa Vĩnh Tràng.',
    practice: 'Dâng hoa sen bên Hồ Sen và lưu giữ một bức ảnh kỷ niệm trang nghiêm cùng Chùa Vĩnh Tràng.',
    quiz: {
      question: 'Trong truyền thống Phật giáo, hoa sen dâng Phật mang biểu trưng đặc biệt nào?',
      options: [
        'Chỉ có hoa mà không có quả',
        'Hoa và gương sen (nhân và quả) cùng hiện hữu một lúc, mọc từ bùn nhưng chẳng hôi tanh mùi bùn',
        'Chỉ nở vào ban đêm'
      ],
      correctIndex: 1,
      explanation: 'Hoa sen là loài hoa duy nhất vừa nở hoa vừa kết gương sen cùng lúc, tượng trưng cho lý Nhân Quả đồng thời và sự thanh tịnh giữa cuộc đời.'
    }
  }
];

export function getLessonsByPath(pathId = 'A') {
  return LECTURE_LESSONS.filter((l) => l.pathId === pathId).sort((a, b) => a.order - b.order);
}

export function gradeLessonQuiz(lessonId, selectedIndex) {
  const lesson = LECTURE_LESSONS.find((l) => l.id === lessonId);
  if (!lesson) {
    return { found: false, correct: false, explanation: '' };
  }
  const correct = Number(selectedIndex) === lesson.quiz.correctIndex;
  return {
    found: true,
    correct,
    correctIndex: lesson.quiz.correctIndex,
    explanation: lesson.quiz.explanation
  };
}

/**
 * Photo Memory Framing at Chùa Vĩnh Tràng
 */
export const UGC_BACKDROPS = [
  {
    id: 'chanh_dien_mat_tien',
    name: 'Mặt tiền Chánh điện Vĩnh Tràng',
    src: '/public/assets/aistudio/image_dbddfac8.png',
    captionTag: 'Chánh điện Chùa Vĩnh Tràng · Mỹ Tho, Tiền Giang'
  },
  {
    id: 'cua_hang_luu_niem_go',
    name: 'Quầy gỗ Cửa hàng lưu niệm',
    src: '/public/assets/aistudio/image_43ca3fb3.png',
    captionTag: 'Quầy lưu niệm Chùa Vĩnh Tràng'
  },
  {
    id: 'giang_duong_phat_phap',
    name: 'Gian gỗ Giảng đường',
    src: '/public/assets/aistudio/image_dc0ddf04.png',
    captionTag: 'Giảng đường Chùa Vĩnh Tràng'
  },
  {
    id: 'khuon_vien_3_nhan_vat',
    name: 'Sân chùa & Gia đình đi lễ',
    src: '/Thiết kế giao diện/Nhân vật 3D/anh-xem-truoc-3d-all-nguoi-that.png',
    captionTag: 'Kỷ niệm đi chùa Vĩnh Tràng'
  }
];

export const UGC_POSES = [
  { id: 'chap_tay_le_phat', label: 'Chắp tay lễ Phật', propLabel: 'Tràng hạt gỗ' },
  { id: 'dang_hoa_sen', label: 'Dâng hoa sen', propLabel: 'Sen hồng Mỹ Tho' },
  { id: 'doi_non_deo_tui', label: 'Đội nón lá & Túi sen', propLabel: 'Nón lá lụa' },
  { id: 'cam_den_hoa_dang', label: 'Nâng đèn hoa đăng', propLabel: 'Đèn hoa sen' }
];

export const INITIAL_UGC_GALLERY = [
  {
    id: 'ugc_seed_1',
    author: 'Gia đình cô Tư – Mỹ Tho',
    charMode: 'family_3',
    backdropId: 'chanh_dien_mat_tien',
    poseId: 'chap_tay_le_phat',
    wishText: 'Cuối tuần cả nhà ghé Chùa Vĩnh Tràng lễ Phật, cầu ông bà mạnh khỏe, con cháu học hành chăm ngoan.',
    likes: 42,
    createdAt: 'Hôm nay · Mỹ Tho, Tiền Giang'
  },
  {
    id: 'ugc_seed_2',
    author: 'Chị Ngọc Liên',
    charMode: 'nu',
    backdropId: 'cua_hang_luu_niem_go',
    poseId: 'doi_non_deo_tui',
    wishText: 'Thỉnh được cuốn Sổ tay hoa sen và Tràng hạt gỗ Bồ Đề làm quà biếu mẹ.',
    likes: 31,
    createdAt: 'Hôm nay · Chùa Vĩnh Tràng'
  },
  {
    id: 'ugc_seed_3',
    author: 'Chú Minh Hải (Cần Thơ)',
    charMode: 'nam',
    backdropId: 'giang_duong_phat_phap',
    poseId: 'dang_hoa_sen',
    wishText: 'Sáng mở trang đọc lời Phật dạy và nghe một đoạn pháp âm thấy lòng dịu hẳn.',
    likes: 27,
    createdAt: 'Hôm qua · Giảng đường'
  }
];

export function createUGCPost(payload = {}) {
  const author = String(payload.author || 'Khách viếng chùa').trim() || 'Khách viếng chùa';
  const charMode = payload.charMode || 'family_3';
  const backdropId = payload.backdropId || 'chanh_dien_mat_tien';
  const poseId = payload.poseId || 'chap_tay_le_phat';
  const milestoneBadge =
    String(payload.milestoneBadge || 'Kỷ niệm viếng Chùa Vĩnh Tràng').trim();
  const userPhotoUploaded = Boolean(payload.userPhotoUploaded);
  const frameStyle = payload.frameStyle || 'lotus_arch';
  const wishText =
    String(payload.wishText || '').trim() ||
    'Kính lễ Tam Bảo tại Chùa Vĩnh Tràng — Cầu gia đình bình an, mạnh khỏe.';

  return {
    id: `ugc_${Date.now()}`,
    author,
    charMode,
    backdropId,
    poseId,
    milestoneBadge,
    userPhotoUploaded,
    frameStyle,
    wishText,
    dataUrl: payload.dataUrl || null,
    likes: 1,
    createdAt: 'Vừa xong · Chùa Vĩnh Tràng'
  };
}

/**
 * Perceptual OKLab / OKLCH Color Engine (inspired by meodai/skill.color-expert)
 * Ensures perceptually uniform Lightness (L), Chroma (C), and Hue (H) transformations
 * with Bezold-Brücke sunlit warmth & cool sky-bounce shadow compensation (zero muddy mid-tones).
 */
function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c) {
  const clamped = Math.max(0, Math.min(1, c));
  return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
}

export function hexToOklch(hexStr) {
  const clean = String(hexStr || '#000000').replace(/^#/, '');
  const num = parseInt(clean.length === 3 ? clean.replace(/(.)/g, '$1$1') : clean, 16) || 0;
  const r = srgbToLinear(((num >> 16) & 255) / 255);
  const g = srgbToLinear(((num >> 8) & 255) / 255);
  const b = srgbToLinear((num & 255) / 255);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const C = Math.hypot(A, B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L: Number(L.toFixed(4)), C: Number(C.toFixed(4)), H: Number(H.toFixed(2)) };
}

export function oklchToHex(L, C, H) {
  const hRad = ((H || 0) * Math.PI) / 180;
  const A = C * Math.cos(hRad);
  const B = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * A + 0.2158037573 * B;
  const m_ = L - 0.1055613458 * A - 0.0638541728 * B;
  const s_ = L - 0.0894841775 * A - 1.291485548 * B;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r = linearToSrgb(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const g = linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const b = linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);

  const toByte = (v) =>
    Math.round(Math.max(0, Math.min(255, v * 255)))
      .toString(16)
      .padStart(2, '0');
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`.toUpperCase();
}

export function shiftOklch(hexStr, dL = 0, scaleC = 1.0, dH = 0) {
  const { L, C, H } = hexToOklch(hexStr);
  const nextL = Math.max(0.08, Math.min(0.98, L + dL));
  // Gamut cusp protection: reduce chroma near extreme lightness (L < 0.2 or L > 0.92)
  const cuspFactor = nextL > 0.9 ? (1 - nextL) / 0.1 : nextL < 0.18 ? nextL / 0.18 : 1;
  const nextC = Math.max(0, Math.min(0.32, C * scaleC * Math.max(0.35, cuspFactor)));
  const nextH = (H + dH + 360) % 360;
  return oklchToHex(nextL, nextC, nextH);
}

export const VINH_TRANG_OKLCH_PALETTE = {
  skyZenith: oklchToHex(0.49, 0.195, 256),       // Cobalt sky zenith (#0155C9 perceptual lock)
  skyHorizon: oklchToHex(0.68, 0.145, 250),      // Luminous horizon blue (#4F97F9)
  goldFacadeSun: oklchToHex(0.76, 0.128, 78),    // Warm sunlit Chánh điện ochre-gold (#E0AA42)
  goldFacadeShade: oklchToHex(0.64, 0.112, 72),  // Perceptually rich warm shade (#B9852F, never gray!)
  vermilionColumn: oklchToHex(0.42, 0.138, 28),  // Lacquered vermilion red column (#862820)
  terracottaTile: oklchToHex(0.48, 0.098, 38),   // Southern clay roof tile (#834332)
  lotusThroneBlue: oklchToHex(0.59, 0.078, 232), // A Di Đà lotus throne azure (#4E86A8)
  jadeFoliageSun: oklchToHex(0.58, 0.115, 136),  // Sunlit bonsai crown (#5C8A46)
  jadeFoliageDeep: oklchToHex(0.44, 0.095, 142), // Shaded foliage (#365E2E, shifted cool-green)
  lotusPink: oklchToHex(0.73, 0.148, 352)        // Sacred lotus petal pink (#EE7FAE)
};

/**
 * Daily Dharma Feature ("Lời Phật dạy hôm nay")
 * Shows a random inspirational canonical Buddhist quote upon the user's first visit of the day.
 * Stored in /data/daily-dharma.json with canonical fallback.
 */
export const DAILY_DHARMA_FALLBACK = [
  {
    id: 'dharma_01',
    quote:
      'Ý dẫn đầu các pháp, ý làm chủ, ý tạo. Nếu nói hay làm với tâm thanh tịnh, an lạc sẽ theo ta như bóng không rời hình.',
    source: 'Kinh Pháp Cú · Phẩm Song Yếu (Kệ số 2)',
    book: 'Tích Truyện Pháp Cú',
    reflection:
      'Khởi một ý nghĩ hiền hòa vào đầu ngày giúp lòng mình nhẹ nhàng suốt cả ngày dài.'
  },
  {
    id: 'dharma_06',
    quote:
      'Quá khứ đã qua rồi, tương lai thì chưa tới. Chỉ có giây phút hiện tại là nơi ta thực sự đang sống.',
    source: 'Phương Pháp Thiền Căn Bản',
    book: 'Thiền sư Ajahn Brahm',
    reflection:
      'Thở một hơi thật chậm, đặt nhẹ gánh lo xuống để cảm nhận sự có mặt trọn vẹn ngay lúc này.'
  },
  {
    id: 'dharma_05',
    quote:
      'Người biết đủ, tuy nằm trên đất vẫn thấy an vui; người không biết đủ, dù ở chốn giàu sang vẫn thấy thiếu thốn.',
    source: 'Kinh Di Giáo',
    book: 'Phật Học Phổ Thông · Quyển 1',
    reflection:
      'Biết trân trọng những điều bình dị đang có trong tay là cội nguồn của sự thanh thản.'
  }
];

export function getLocalDateKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shouldShowDailyDharmaToday(lastSeenDateKey, todayKey = getLocalDateKey()) {
  if (!lastSeenDateKey) return true;
  return String(lastSeenDateKey).trim() !== String(todayKey).trim();
}

export function pickDailyDharmaQuote(quotes = DAILY_DHARMA_FALLBACK, excludeId = null, randomFn = Math.random) {
  const list = Array.isArray(quotes) ? quotes.filter((q) => q && q.quote) : [];
  if (list.length === 0) return null;
  const pool =
    excludeId && list.length > 1 ? list.filter((q) => q.id !== excludeId) : list;
  const r = Math.max(0, Math.min(0.999999, Number(randomFn()) || 0));
  const idx = Math.floor(r * pool.length);
  return pool[idx] || pool[0];
}

export async function fetchDailyDharmaService({
  fetcher = typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : null,
  url = '/data/daily-dharma.json',
  simulatedDelayMs = 0,
  excludeId = null,
  randomFn = Math.random,
  date = new Date()
} = {}) {
  if (simulatedDelayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, simulatedDelayMs));
  }
  let quotes = DAILY_DHARMA_FALLBACK;
  let source = 'fallback';
  if (typeof fetcher === 'function') {
    try {
      const resp = await fetcher(url, { cache: 'no-store' });
      if (resp && resp.ok) {
        const parsed = await resp.json();
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.quote) {
          quotes = parsed;
          source = 'json';
        }
      }
    } catch {
      // Fall back gracefully to canonical DAILY_DHARMA_FALLBACK
    }
  }
  const quote = pickDailyDharmaQuote(quotes, excludeId, randomFn);
  return {
    quote,
    quotes,
    quotesCount: quotes.length,
    source,
    dateKey: getLocalDateKey(date)
  };
}

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
    prop3d: null,
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
    prop3d: null,
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

  // === 3. ÁO TRÀNG (đúng 6 mẫu, cấp, badge Hiếm & giá theo ảnh tham chiếu 2) ===
  {
    id: 'ao_trang_nau',
    category: 'ao_trang',
    slot: 'robe',
    name: 'Áo tràng nâu',
    description: 'Màu nâu đất mộc mạc.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#7A5438',
    robeTint: [0.54, 0.37, 0.25],
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
    name: 'Áo tràng trắng',
    description: 'Trắng tinh khôi như mùa Vu Lan.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#EBE8DF',
    robeTint: [0.92, 0.90, 0.87],
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
    name: 'Áo vàng nghệ',
    description: 'Dành cho người đã tinh tấn đến cấp 10.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#D89F2B',
    robeTint: [0.88, 0.65, 0.22],
    currency: 'lotus',
    price: 500,
    requiredLevel: 10,
    rare: false,
    tryable: true
  },
  {
    id: 'ao_hoa_sen',
    category: 'ao_trang',
    slot: 'robe',
    name: 'Áo hoa sen',
    description: 'Áo hồng phấn thêu sen.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#E08DAA',
    robeTint: [0.88, 0.56, 0.67],
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
    name: 'Áo Vu Lan hồng',
    description: 'Hồng phấn thêu sen trắng ngà, mặc mùa báo hiếu.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#EA9AB7',
    robeTint: [0.93, 0.64, 0.74],
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
    name: 'Áo mây bạc',
    description: 'Xám bạc dệt vân mây trắng, nhẹ như sương sớm.',
    image: '/public/assets/aistudio/image_8f6004e3.png',
    swatchHex: '#B6C2CE',
    robeTint: [0.74, 0.79, 0.85],
    currency: 'gem',
    price: 100,
    requiredLevel: 1,
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
    image: '/Thiết kế giao diện/Vật phẩm 3D/blender-render-non-la.png',
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
    image: '/Thiết kế giao diện/Vật phẩm 3D/blender-render-non-la.png'
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




