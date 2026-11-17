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
  },
  {
    key: 'nu_ao_lam',
    name: 'Phật tử Nữ Áo Lam (Thanh Tịnh)',
    heightLabel: '1.63m',
    heightMeters: 1.63,
    outfitName: 'Áo lam cổ truyền 5 nút & Quần lụa trắng',
    glb: '/Thiết kế giao diện/Nhân vật 3D/meshy_chars/nu-ao-lam.glb',
    previewImg: '/Thiết kế giao diện/Nhân vật 3D/anh-xem-truoc-3d-all-nguoi-that.png',
    fitPreviewImg: '/Thiết kế giao diện/Nhân vật 3D/render-items-nu.jpg',
    isMeshyChar: true,
    description: 'Nữ Phật tử duyên dáng trong bộ áo lam cổ truyền thanh thoát, thường xuyên công quả và tụng kinh sáng chiều.'
  },
  {
    key: 'nam_ao_nau',
    name: 'Cư sĩ Nam Áo Nâu (Thiện Hiền)',
    heightLabel: '1.73m',
    heightMeters: 1.73,
    outfitName: 'Áo tràng nâu sồng Nam Bộ & Tràng hạt Bồ Đề',
    glb: '/Thiết kế giao diện/Nhân vật 3D/meshy_chars/nam-ao-nau.glb',
    previewImg: '/Thiết kế giao diện/Nhân vật 3D/anh-xem-truoc-3d-nam.png',
    fitPreviewImg: '/Thiết kế giao diện/Nhân vật 3D/render-items-nam-v2.jpg',
    isMeshyChar: true,
    description: 'Nam cư sĩ đôn hậu mặc áo tràng nâu giản dị miền Tây, vững chãi trong từng bước thiền hành nơi sân chùa.'
  },
  {
    key: 'du_khach',
    name: 'Du khách Văn hóa (Minh Anh)',
    heightLabel: '1.76m',
    heightMeters: 1.76,
    outfitName: 'Trang phục dạo chùa thanh lịch & Thẻ tham quan di sản',
    glb: '/Thiết kế giao diện/Nhân vật 3D/meshy_chars/du-khach-quoc-te.glb',
    previewImg: '/Thiết kế giao diện/Nhân vật 3D/anh-xem-truoc-3d-all-nguoi-that.png',
    fitPreviewImg: '/Thiết kế giao diện/Nhân vật 3D/render-items-nam-v2.jpg',
    isMeshyChar: true,
    description: 'Du khách phương xa yêu mến kiến trúc Á – Âu của Chùa Vĩnh Tràng, ghé thăm chiêm bái và tìm hiểu văn hóa.'
  },
  {
    key: 'su_thay',
    name: 'Sư Thầy Trụ Trì (Thích Tâm An)',
    heightLabel: '1.72m',
    heightMeters: 1.72,
    outfitName: 'Áo nhật bình & Y hậu vàng trang nghiêm',
    glb: '/Thiết kế giao diện/Nhân vật 3D/meshy_chars/su-thay-ao-vang.glb',
    previewImg: '/Thiết kế giao diện/Nhân vật 3D/anh-xem-truoc-3d-all-nguoi-that.png',
    fitPreviewImg: '/Thiết kế giao diện/Nhân vật 3D/render-items-nam-v2.jpg',
    isMeshyChar: true,
    description: 'Bậc tôn túc áo vàng trang nghiêm hướng dẫn Phật tử tu học, giảng giải kinh điển và giữ gìn nếp sống cổ tự.'
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
    name: 'Tượng Phật A Di Đà (tượng 18m, đài sen/bệ 7m; tổng cao 25m)',
    zoneCode: 'Hoa viên phía trước Chánh điện',
    pinLabel: 'Tượng Phật A Di Đà',
    pos: { x: 8.5, z: 17.5 },
    standPos: { x: 15.2, z: 17.5 },
    via: [[40.5, 45.8], [32.0, 28.0], [23.0, 22.0], [15.2, 17.5]],
    mapCoord: { x: 56, y: 72 },
    lookAt: { x: 8.5, y: 12.0, z: 17.5 },
    audio: 's1_adida.mp3',
    subtitle: 'Tượng Phật A Di Đà đứng bên hoa viên Tây Nam phía trước Chánh điện; thân tượng cao 18m, đài sen và bệ cao khoảng 7m.',
    ritualType: 'niem_phat'
  },
  {
    id: 3,
    key: 'phat_di_lac',
    name: 'Tượng Phật Di Lặc (cao 20m)',
    zoneCode: 'Công viên Di Lặc bên tay phải khi nhìn từ trong chùa ra',
    pinLabel: 'Tượng Phật Di Lặc',
    pos: { x: -24.5, z: 4.0 },
    standPos: { x: -24.5, z: 22.8 },
    via: [[10.0, 22.5], [-10.0, 22.8], [-24.5, 22.8]],
    mapCoord: { x: 32, y: 62 },
    lookAt: { x: -24.5, y: 9.0, z: 4.0 },
    audio: 's4_dilac.mp3',
    subtitle: 'Tượng Phật Di Lặc cao 20m, dài 27m, rộng 18m; an tọa trong công viên bên tay phải chùa khi nhìn từ trong ra, trên khối đế kiến trúc và bậc thang rộng.',
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
    name: 'Phật Thích Ca nhập Niết Bàn (dài 32m) & Bảo Tháp 7 Tầng',
    zoneCode: 'Khu vườn phía sau Chánh điện',
    pinLabel: 'Phật Niết Bàn & Bảo Tháp',
    pos: { x: -24.5, z: -24.0 },
    standPos: { x: -24.5, z: -10.5 },
    via: [[10.0, 20.0], [10.0, 0.0], [-8.0, -8.0], [-24.5, -10.5]],
    mapCoord: { x: 32, y: 38 },
    lookAt: { x: -24.5, y: 8.5, z: -24.0 },
    audio: 's5_nirvana.mp3',
    subtitle: 'Chiêm bái tượng Đức Phật Thích Ca nhập Niết Bàn dài 32m, cao 10m, trong khu vườn phía sau Chánh điện, gần Bảo Tháp Thất Phật 7 tầng.',
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
  maxX: 66.5,
  minZ: -104.0,
  maxZ: 56.0
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
 * 11 Canonical Buddhist Textbooks available in /Giáo trình phật học/
 */
export const DHARMA_TEXTBOOKS = [
  {
    id: 'phpt_1',
    title: 'Phật Học Phổ Thông — Quyển 1 (Khóa I, II, III)',
    author: 'Hòa thượng Thích Thiện Hoa',
    pdfPath: '/Giáo trình phật học/Phật học phổ thông 1.pdf',
    tier: 'basic',
    tierLabel: 'Cơ bản · Nhập môn',
    pages: 210,
    estimatedMinutes: 65,
    durationLabel: '210 trang · ~65 phút đọc',
    sortOrder: 1,
    coreTeachings: 'Trình bày hệ thống từ Quy Y Tam Bảo, Ngũ Giới, Thập Thiện, Tứ Nhiếp Pháp đến Nhân Quả, Luân Hồi và Tứ Diệu Đế theo phương pháp sư phạm dễ hiểu cho Phật tử tại gia.'
  },
  {
    id: 'phpt_3',
    title: 'Phật Học Phổ Thông — Quyển 3 (Lục Độ & Đại Thừa)',
    author: 'Hòa thượng Thích Thiện Hoa',
    pdfPath: '/Giáo trình phật học/Phật học phổ thông 3.pdf',
    tier: 'heritage',
    tierLabel: 'Di sản & Đại Thừa',
    pages: 205,
    estimatedMinutes: 65,
    durationLabel: '205 trang · ~65 phút đọc',
    sortOrder: 11,
    coreTeachings: 'Đi sâu vào Tứ Vô Lượng Tâm (Từ, Bi, Hỷ, Xả), Lục Độ Ba La Mật và tinh thần Bồ Tát Đạo nhập thế cứu khổ.'
  },
  {
    id: 'duc_phat_day_nhung_gi',
    title: 'Đức Phật Dạy Những Gì (What the Buddha Taught)',
    author: 'HT. Walpola Rahula · Ni sư Trí Hải dịch',
    pdfPath: '/Giáo trình phật học/duc-phat-day-nhung-gi-ht-walpola-rahula-ns-tri-hai-dich.pdf',
    tier: 'heritage',
    tierLabel: 'Kinh điển · Tinh yếu',
    pages: 156,
    estimatedMinutes: 50,
    durationLabel: '156 trang · ~50 phút đọc',
    sortOrder: 9,
    coreTeachings: 'Kiệt tác Phật học thế giới giải thích chuẩn xác thái độ tâm thức Phật giáo, Tứ Diệu Đế, thuyết Vô Ngã (Anatta), Duyên Khởi và Thiền Chánh Niệm.'
  },
  {
    id: 'nen_tang_1_tam_bao',
    title: 'Nền Tảng Phật Giáo — Quyển 1: Tam Bảo',
    author: 'Tỳ kheo Giác Giới',
    pdfPath: '/Giáo trình phật học/nen-tang-phat-giao-quyen-1-tam-bao.pdf',
    tier: 'intermediate',
    tierLabel: 'Trung cấp · Tam Bảo',
    pages: 184,
    estimatedMinutes: 55,
    durationLabel: '184 trang · ~55 phút đọc',
    sortOrder: 3,
    coreTeachings: 'Giải thích rõ ân đức của Phật Bảo (Tự giác, Giác tha, Giác hạnh viên mãn), Pháp Bảo (Thiết thực hiện tại, vượt thời gian) và Tăng Bảo.'
  },
  {
    id: 'nen_tang_2_quy_y',
    title: 'Nền Tảng Phật Giáo — Quyển 2: Quy Y Tam Bảo',
    author: 'Tỳ kheo Giác Giới',
    pdfPath: '/Giáo trình phật học/nen-tang-phat-giao-quyen-2-quy-y-tam-bao.pdf',
    tier: 'intermediate',
    tierLabel: 'Trung cấp · Quy Y',
    pages: 172,
    estimatedMinutes: 50,
    durationLabel: '172 trang · ~50 phút đọc',
    sortOrder: 4,
    coreTeachings: 'Làm sáng tỏ ý nghĩa Quy y nội tâm (quay về tự tính giác ngộ) và Quy y ngoại tướng, cùng các điều làm thành tựu hay đứt mẻ giới quy y.'
  },
  {
    id: 'nen_tang_4_nghiep',
    title: 'Nền Tảng Phật Giáo — Quyển 4: Nghiệp và Quả của Nghiệp',
    author: 'Tỳ kheo Giác Giới',
    pdfPath: '/Giáo trình phật học/nen-tang-phat-giao-quyen-4-nghiep-va-qua-cua-nghiep.pdf',
    tier: 'intermediate',
    tierLabel: 'Trung cấp · Nghiệp Quả',
    pages: 178,
    estimatedMinutes: 55,
    durationLabel: '178 trang · ~55 phút đọc',
    sortOrder: 5,
    coreTeachings: 'Phân tích Cố ý (Tác ý - Cetanā) chính là Nghiệp, 10 bất thiện nghiệp, 10 thiện nghiệp và phương pháp chuyển hóa trọng nghiệp bằng tu tâm.'
  },
  {
    id: 'nen_tang_5_phuoc',
    title: 'Nền Tảng Phật Giáo — Quyển 5: Phước Thiện (Puñña)',
    author: 'Tỳ kheo Giác Giới',
    pdfPath: '/Giáo trình phật học/nen-tang-phat-giao-quyen-quyen-5-phuoc-thien.pdf',
    tier: 'intermediate',
    tierLabel: 'Trung cấp · Phước Thiện',
    pages: 164,
    estimatedMinutes: 50,
    durationLabel: '164 trang · ~50 phút đọc',
    sortOrder: 6,
    coreTeachings: 'Mười cội phước thiện (Thập phúc nghiệp sự): Bố thí, Trì giới, Tham thiền, Cung kính, Phục vụ, Hồi hướng phước, Tùy hỷ phước, Thính pháp, Thuyết pháp và Chánh kiến.'
  },
  {
    id: 'thien_ajahn_brahm',
    title: 'Phương Pháp Thiền Căn Bản (Basic Method of Meditation)',
    author: 'Thiền sư Ajahn Brahm',
    pdfPath: '/Giáo trình phật học/phuong-phap-thien-can-ban-ajahn-brahm-tieng-viet.pdf',
    tier: 'meditation',
    tierLabel: 'Thiền định & Chánh niệm',
    pages: 148,
    estimatedMinutes: 45,
    durationLabel: '148 trang · ~45 phút đọc',
    sortOrder: 7,
    coreTeachings: 'Hướng dẫn từng bước buông xả quá khứ và tương lai, an trú trong hiện tại tĩnh lặng và theo dõi hơi thở êm dịu dẫn vào định.'
  },
  {
    id: 'tich_truyen_phap_cu',
    title: 'Tích Truyện Pháp Cú (Dhammapada Commentary)',
    author: 'Bản dịch Việt ngữ',
    pdfPath: '/Giáo trình phật học/tichtruyenphapcu.pdf',
    tier: 'heritage',
    tierLabel: 'Di sản & Pháp Cú',
    pages: 224,
    estimatedMinutes: 70,
    durationLabel: '224 trang · ~70 phút đọc',
    sortOrder: 10,
    coreTeachings: 'Những câu chuyện lịch sử sinh động thời Đức Phật gắn liền với 423 bài kệ Kinh Pháp Cú — bài học nhân sinh sâu sắc.'
  },
  {
    id: 'tu_duong_tam_tu',
    title: 'Tu Dưỡng Tâm Từ Bằng Thiền Chánh Niệm',
    author: 'Giáo trình Thiền Tứ Niệm Xứ & Tâm Từ',
    pdfPath: '/Giáo trình phật học/tu-duong-tam-tu-bang-thien-chanh-niem.pdf',
    tier: 'meditation',
    tierLabel: 'Thiền định & Tâm Từ',
    pages: 136,
    estimatedMinutes: 40,
    durationLabel: '136 trang · ~40 phút đọc',
    sortOrder: 8,
    coreTeachings: 'Kết hợp Quán thân thọ tâm pháp (Satipatthana) với thiền Rải Tâm Từ (Metta Bhavana) để chữa lành tổn thương và nuôi dưỡng lòng bi mẫn.'
  },
  {
    id: 'giao_trinh_phat_hoc_toan_tap',
    title: 'Giáo Trình Phật Học Cơ Bản Toàn Tập',
    author: 'Ban Biên Tập Phật Học Phổ Thông',
    pdfPath: '/Giáo trình phật học/giaotrinhphathoc.pdf',
    tier: 'basic',
    tierLabel: 'Cơ bản · Toàn tập',
    pages: 260,
    estimatedMinutes: 80,
    durationLabel: '260 trang · ~80 phút đọc',
    sortOrder: 2,
    coreTeachings: 'Bộ giáo trình tổng hợp hệ thống lịch sử Đức Phật Thích Ca, giáo lý Duyên Khởi, Tứ Diệu Đế, Bát Chánh Đạo, oai nghi Phật tử tại gia và phương pháp ứng dụng chánh niệm đời thường.'
  }
];

export function getSortedDharmaTextbooks(tier = 'all') {
  const list = tier === 'all' ? DHARMA_TEXTBOOKS : DHARMA_TEXTBOOKS.filter((b) => b.tier === tier);
  return [...list].sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
}

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

export const PATH_TO_COURSE_ID = {
  A: 'course_1_khai_tam',
  B: 'course_2_tam_bao',
  C: 'course_3_thien_dinh',
  D: 'course_4_di_san'
};

for (const lesson of LECTURE_LESSONS) {
  lesson.courseId = PATH_TO_COURSE_ID[lesson.pathId] || 'course_1_khai_tam';
}

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

/* ==========================================================================
   THỜI GIAN TRONG NGÀY · ĐIỂM DANH 7 NGÀY · NHIỆM VỤ · HỘP THƯ · HƯỚNG DẪN
   ========================================================================== */
export const TIME_OF_DAY_PRESETS = {
  morning: {
    key: 'morning',
    label: 'Buổi Sáng',
    shortLabel: 'Sáng',
    icon: '🌅',
    subtitle: 'Nắng sớm 7:30 miền Tây dịu mát, sương nhẹ quanh tán bồ đề'
  },
  midday: {
    key: 'midday',
    label: 'Giữa Trưa',
    shortLabel: 'Trưa',
    icon: '☀️',
    subtitle: 'Ánh nắng rực rỡ chiếu rọi 13 nhịp vòm vàng Chánh điện'
  },
  evening: {
    key: 'evening',
    label: 'Buổi Tối',
    shortLabel: 'Tối',
    icon: '🕯️',
    subtitle: 'Ánh nến & đèn lồng ấm áp dưới bầu trời sao thanh tịnh'
  }
};

export const DAILY_CHECKIN_REWARDS = [
  { day: 1, lotus: 30, gems: 10, label: 'Ngày 1 · Phát Tâm', giftName: '30 Sen · 10 Ngọc' },
  { day: 2, lotus: 40, gems: 12, label: 'Ngày 2 · Tinh Tấn', giftName: '40 Sen · 12 Ngọc' },
  { day: 3, lotus: 50, gems: 15, label: 'Ngày 3 · An Trú', giftName: '50 Sen · 15 Ngọc' },
  { day: 4, lotus: 60, gems: 18, label: 'Ngày 4 · Nhẫn Nại', giftName: '60 Sen · 18 Ngọc' },
  { day: 5, lotus: 75, gems: 22, label: 'Ngày 5 · Hoan Hỷ', giftName: '75 Sen · 22 Ngọc' },
  { day: 6, lotus: 90, gems: 25, label: 'Ngày 6 · Chánh Niệm', giftName: '90 Sen · 25 Ngọc' },
  { day: 7, lotus: 150, gems: 45, label: 'Ngày 7 · Viên Mãn', giftName: '150 Sen · 45 Ngọc' }
];

export const DAILY_QUESTS_TEMPLATE = [
  {
    id: 'q_daily_checkin',
    category: 'Hằng ngày',
    icon: '📅',
    title: 'Điểm danh lễ chùa đầu ngày',
    desc: 'Vào mục Điểm danh nhận lộc công đức mỗi ngày một lần.',
    metric: 'checkinCount',
    target: 1,
    rewardLotus: 25,
    rewardGems: 5,
    actionHint: 'checkin'
  },
  {
    id: 'q_le_phat',
    category: 'Hằng ngày',
    icon: '🙏',
    title: 'Đảnh lễ Tam Bảo (3 lạy)',
    desc: 'Bấm nút Lễ Phật tại Chánh điện hoặc trước Đại tượng lộ thiên.',
    metric: 'bowCount',
    target: 3,
    rewardLotus: 40,
    rewardGems: 10,
    actionHint: 'le_phat'
  },
  {
    id: 'q_dang_huong',
    category: 'Hằng ngày',
    icon: '🪔',
    title: 'Dâng 3 nén tâm hương',
    desc: 'Thực hiện nghi thức thắp hương tại lư đồng sân Chánh điện.',
    metric: 'incenseOfferings',
    target: 1,
    rewardLotus: 35,
    rewardGems: 8,
    actionHint: 'dang_huong'
  },
  {
    id: 'q_dang_hoa',
    category: 'Hằng ngày',
    icon: '🪷',
    title: 'Thả hoa sen cầu bình an',
    desc: 'Dâng một đóa hoa sen tươi kèm lời chúc an lành cho gia đình.',
    metric: 'lotusOfferings',
    target: 1,
    rewardLotus: 35,
    rewardGems: 8,
    actionHint: 'dang_hoa'
  },
  {
    id: 'q_niem_phat',
    category: 'Tu tập',
    icon: '📿',
    title: 'Lần chuỗi 21 biến Niệm Phật',
    desc: 'Mở chuỗi bồ đề và niệm 21 biến danh hiệu Phật trong chánh niệm.',
    metric: 'malaTotalBeads',
    target: 21,
    rewardLotus: 45,
    rewardGems: 12,
    actionHint: 'niem_phat'
  },
  {
    id: 'q_kham_pha_3',
    category: 'Hành hương',
    icon: '🧭',
    title: 'Viếng 3 thắng cảnh Chùa Vĩnh Tràng',
    desc: 'Dạo bước ghé thăm ít nhất 3 trạm hoặc khu cảnh quan trong khuôn viên.',
    metric: 'visitedCount',
    target: 3,
    rewardLotus: 55,
    rewardGems: 15,
    actionHint: 'explore'
  },
  {
    id: 'q_hoc_phat',
    category: 'Pháp âm',
    icon: '📖',
    title: 'Nghe & học 1 bài Giảng đường',
    desc: 'Vào Giảng đường nghe pháp âm hoặc hoàn thành 1 bài học Phật pháp.',
    metric: 'completedLessonsCount',
    target: 1,
    rewardLotus: 50,
    rewardGems: 15,
    actionHint: 'lecture'
  }
];

export const INITIAL_MAILBOX_MESSAGES = [
  {
    id: 'mail_welcome_vinhtrang',
    sender: 'Ban Quản Trị Chùa Vĩnh Tràng',
    title: 'Kính chào quý Phật tử hữu duyên ghé thăm Chùa Online',
    dateLabel: 'Hôm nay',
    body:
      'Kính chúc cô bác và anh chị thân tâm an lạc. Nhà chùa xin gửi tặng phần lộc Sen Vàng & Ngọc Quý để thỉnh hương hoa dâng Phật hoặc đổi pháp phục áo tràng trang nghiêm.',
    rewardLotus: 80,
    rewardGems: 25
  },
  {
    id: 'mail_morning_chanting',
    sender: 'Giảng Đường Phật Pháp',
    title: 'Mời cô bác nghe bài giảng mới với chữ to & giọng đọc rõ ràng',
    dateLabel: 'Mỗi ngày',
    body:
      'Giảng đường nay đã mở không gian 3D trực tiếp cùng nút "Nghe Thầy Giảng" và cỡ chữ lớn A+/A- để cô bác lớn tuổi dễ đọc trên điện thoại.',
    rewardLotus: 45,
    rewardGems: 10
  },
  {
    id: 'mail_evening_lantern',
    sender: 'Ban Nghi Lễ Tam Quan',
    title: 'Trải nghiệm cảnh Chùa Vĩnh Tràng buổi tối thắp đèn hoa đăng',
    dateLabel: 'Cập nhật mới',
    body:
      'Quý Phật tử có thể chuyển đổi thời gian Sáng · Trưa · Tối ngay trên thanh điều khiển để chiêm ngưỡng ánh đèn lồng lung linh quanh hồ sen và bảo tháp.',
    rewardLotus: 50,
    rewardGems: 15
  }
];

export const PILGRIMAGE_GUIDE_STEPS = [
  {
    step: 1,
    stationKey: 'cua_hang_luu_niem',
    title: 'Bước 1 · Vào Cổng Phụ & Ghé Nhà Tạp Hóa',
    desc: 'Đi qua Cổng Phụ Tịnh Độ bên phải Tam Quan, dừng tại Nhà Tạp Hóa thỉnh 3 nén nhang trầm, hoa sen tươi hoặc nước dừa xiêm giải nhiệt.'
  },
  {
    step: 2,
    stationKey: 'ho_sen_ca_koi',
    title: 'Bước 2 · Ngắm Hồ Sen Cá Koi & Dâng Hoa',
    desc: 'Dạo theo lối gạch đỏ qua giàn hoa giấy rực rỡ, thả hoa sen và cầu bình an cho cha mẹ, gia quyến bên hồ cá Koi.'
  },
  {
    step: 3,
    stationKey: 'lu_huong_san',
    title: 'Bước 3 · Dâng Hương Sân Chánh Điện',
    desc: 'Tại lư hương đồng ngoài sân, thắp 1–3 nén hương, phẩy nhẹ bằng tay chứ không thổi bằng miệng và xá ba xá.'
  },
  {
    step: 4,
    stationKey: 'chanh_dien',
    title: 'Bước 4 · Vào Chánh Điện Chữ Quốc (國) Lễ Phật',
    desc: 'Đi qua Cửa Hông để vào Nội Điện: chiêm bái bộ tượng Tam Bảo, cặp Long Trụ rồng cuốn và 18 vị La Hán gỗ mít trăm tuổi.'
  },
  {
    step: 5,
    stationKey: 'phat_adida',
    title: 'Bước 5 · Chiêm Bái Ba Pho Đại Tượng Lộ Thiên',
    desc: 'Lần lượt lễ Đại tượng Phật A Di Đà (24m), Phật Di Lặc hoan hỷ (20m) và Phật Thích Ca nhập Niết Bàn (32m) cạnh Bảo Tháp Thất Phật.'
  },
  {
    step: 6,
    stationKey: 'giang_duong',
    title: 'Bước 6 · Nghe Pháp Tại Giảng Đường & Dùng Cơm Trai Đường',
    desc: 'Ghé Giảng Đường 3D nghe giảng kinh, sau đó qua Nhà Sàn Trai Đường miền Tây dùng cơm chay thanh tịnh trước khi hồi hương.'
  }
];

export const DAILY_RESET_MISSIONS = [
  {
    id: 'dm_checkin',
    icon: '📅',
    category: 'Hằng ngày',
    title: 'Điểm danh lễ chùa đầu ngày',
    desc: 'Nhấn Điểm danh mỗi ngày để nhận lộc công đức và nối dài chuỗi tu tập.',
    metric: 'dailyCheckedIn',
    target: 1,
    rewardLotus: 30,
    rewardGems: 8,
    actionHint: 'checkin'
  },
  {
    id: 'dm_incense',
    icon: '🪔',
    category: 'Nghi lễ',
    title: 'Thắp hương tại lư đồng',
    desc: 'Thắp 3 nén tâm hương Giới – Định – Tuệ trước sân Chánh điện hôm nay.',
    metric: 'dailyIncense',
    target: 1,
    rewardLotus: 40,
    rewardGems: 10,
    actionHint: 'dang_huong'
  },
  {
    id: 'dm_quotes',
    icon: '📜',
    category: 'Lời dạy',
    title: 'Đọc 3 lời Phật dạy',
    desc: 'Mở Lời Phật Dạy và chiêm nghiệm ít nhất 3 câu kệ an lành trong ngày.',
    metric: 'dailyQuotesRead',
    target: 3,
    rewardLotus: 45,
    rewardGems: 10,
    actionHint: 'daily_dharma'
  },
  {
    id: 'dm_mindful',
    icon: '🧘',
    category: 'Chánh niệm',
    title: 'Thực hành chánh niệm 5 phút',
    desc: 'Ngồi yên theo dõi hơi thở hoặc lần chuỗi niệm Phật đủ 5 phút (300 giây).',
    metric: 'dailyMindfulSeconds',
    target: 300,
    rewardLotus: 80,
    rewardGems: 20,
    actionHint: 'niem_phat'
  },
  {
    id: 'dm_mala',
    icon: '📿',
    category: 'Niệm Phật',
    title: 'Lần 27 hạt tràng niệm Phật',
    desc: 'Mở chuỗi tràng hạt Bồ Đề và lần ít nhất 27 hạt trong chánh niệm.',
    metric: 'dailyBeads',
    target: 27,
    rewardLotus: 50,
    rewardGems: 12,
    actionHint: 'niem_phat'
  },
  {
    id: 'dm_lotus',
    icon: '🪷',
    category: 'Cầu nguyện',
    title: 'Dâng hoa sen & gửi lời chúc bình an',
    desc: 'Thả một đóa hoa sen tươi bên hồ cầu sức khỏe cho ông bà, con cháu.',
    metric: 'dailyLotus',
    target: 1,
    rewardLotus: 40,
    rewardGems: 8,
    actionHint: 'dang_hoa'
  },
  {
    id: 'dm_lesson',
    icon: '📖',
    category: 'Pháp âm',
    title: 'Nghe 1 bài Giảng đường hôm nay',
    desc: 'Vào Giảng đường nghe thầy giảng hoặc hoàn thành 1 bài học.',
    metric: 'dailyLessons',
    target: 1,
    rewardLotus: 55,
    rewardGems: 15,
    actionHint: 'lecture'
  },
  {
    id: 'dm_leaves',
    icon: '🍂',
    category: 'Công quả',
    title: 'Quét 4 lá Bồ Đề vàng trên sân chùa',
    desc: 'Nhặt hoặc quét 4 chiếc lá Bồ Đề rơi dọc sân gạch và lối đi vườn sen.',
    metric: 'dailyLeavesSwept',
    target: 4,
    rewardLotus: 45,
    rewardGems: 12,
    actionHint: 'courtyard_leaf'
  },
  {
    id: 'dm_garden',
    icon: '🌱',
    category: 'Vườn Phật',
    title: 'Chăm tưới Vườn Cây Phật 2 lần',
    desc: 'Gieo hạt hoặc tưới nước cho Sen, Bồ Đề, Sa La tại Vườn Lâm Tỳ Ni.',
    metric: 'dailyGardenActions',
    target: 2,
    rewardLotus: 50,
    rewardGems: 12,
    actionHint: 'garden'
  },
  {
    id: 'dm_rhythm',
    icon: '🔔',
    category: 'Chánh niệm',
    title: 'Thỉnh chuông & gõ mõ đúng nhịp',
    desc: 'Hoàn thành 1 lượt luyện nhịp Chuông – Mõ Chánh Niệm tại Lầu Chuông.',
    metric: 'dailyRhythmSessions',
    target: 1,
    rewardLotus: 55,
    rewardGems: 14,
    actionHint: 'bell_rhythm'
  },
  {
    id: 'dm_relics',
    icon: '📜',
    category: 'Di sản',
    title: 'Sưu tầm 1 dấu ấn di sản Vĩnh Tràng',
    desc: 'Ghé chiêm bái & đóng dấu Sổ Di Sản tại 10 công trình, tôn tượng quý.',
    metric: 'dailyRelicsFound',
    target: 1,
    rewardLotus: 45,
    rewardGems: 10,
    actionHint: 'heritage'
  }
];

export const EXPLORATION_CHAPTERS = [
  {
    id: 'chap_1_tam_quan',
    dayUnlock: 1,
    title: 'Ngày 1 · Bước Qua Cổng Tam Quan & Hồ Sen',
    desc: 'Ghé thăm Cổng Tam Quan khảm sành sứ cổ, Hồ Sen Cá Koi và Nhà Tạp Hóa cổng chùa.',
    requiredStations: 2,
    rewardLotus: 60,
    rewardGems: 15,
    stationKey: 'ho_sen_ca_koi'
  },
  {
    id: 'chap_2_chanh_dien',
    dayUnlock: 2,
    title: 'Ngày 2 · Vào Chánh Điện & Chiêm Bái 18 Vị La Hán',
    desc: 'Bước qua Cửa Hông để vào Chánh điện ngắm cặp Long Trụ rồng cuốn và 18 vị La Hán gỗ mít.',
    requiredStations: 4,
    rewardLotus: 80,
    rewardGems: 20,
    stationKey: 'chanh_dien'
  },
  {
    id: 'chap_3_thien_tinh',
    dayUnlock: 3,
    title: 'Ngày 3 · Hai Sân Thiên Tỉnh & Tổ Đường Cổ Kính',
    desc: 'Khám phá trọn vẹn trục Chữ Quốc (國): Tiền đường -> Chánh điện -> Thiên Tỉnh 1 -> Nhà Tổ -> Nhà Hậu.',
    requiredStations: 5,
    rewardLotus: 95,
    rewardGems: 25,
    stationKey: 'hau_to_nha_to'
  },
  {
    id: 'chap_4_tam_tuong',
    dayUnlock: 4,
    title: 'Ngày 4 · Ba Pho Đại Tượng Lộ Thiên Vĩnh Tràng',
    desc: 'Đảnh lễ tượng Phật A Di Đà 24m, Phật Di Lặc 20m và Phật Thích Ca Niết Bàn 32m.',
    requiredStations: 6,
    rewardLotus: 110,
    rewardGems: 30,
    stationKey: 'phat_adida'
  },
  {
    id: 'chap_5_giang_duong',
    dayUnlock: 5,
    title: 'Ngày 5 · Giảng Đường Chánh Niệm & Lầu Trà Thiền',
    desc: 'Thọ pháp tại Giảng Đường 3D và dừng chân thưởng trà dưới tán bồ đề xanh mát.',
    requiredStations: 7,
    rewardLotus: 130,
    rewardGems: 35,
    stationKey: 'lau_tra_thien'
  },
  {
    id: 'chap_6_trai_duong',
    dayUnlock: 6,
    title: 'Ngày 6 · Nhà Sàn Gỗ Trai Đường & Vườn Lâm Tỳ Ni',
    desc: 'Tham quan khu ăn chay nhà sàn miền Tây và vườn Lâm Tỳ Ni thanh tịnh.',
    requiredStations: 8,
    rewardLotus: 150,
    rewardGems: 40,
    stationKey: 'nha_san_trai_duong'
  },
  {
    id: 'chap_7_vien_man',
    dayUnlock: 7,
    title: 'Ngày 7 · Viên Mãn Hành Hương & Thắp Đèn Hoa Đăng',
    desc: 'Hoàn tất trọn vẹn 9 dấu ấn sen vàng Chùa Vĩnh Tràng và hồi hướng công đức.',
    requiredStations: 9,
    rewardLotus: 220,
    rewardGems: 60,
    stationKey: 'bao_thap_that_phat'
  }
];

export const EXTENDED_MAILBOX_MESSAGES = [
  {
    id: 'mail_18_arhats_story',
    unlockCheckinDay: 2,
    sender: 'Ban Bảo Tồn Di Sản Chùa Vĩnh Tràng',
    title: 'Chuyện kể về 18 vị La Hán gỗ mít trăm năm tuổi',
    dateLabel: 'Ngày 2 hành hương',
    body:
      'Ít ai biết mỗi pho tượng La Hán trong Chánh điện đều mang một linh thú hoặc pháp khí riêng như hươu trắng, voi trắng, sư tử nhỏ, bảo tháp hay rồng xanh — nhắc nhở người tu chuyển hóa tham sân si giữa đời thường.',
    rewardLotus: 65,
    rewardGems: 18,
    replyOptions: ['🙏 Con đã ngắm đủ 18 vị La Hán rất trang nghiêm', '🪷 Cảm ơn Ban Bảo Tồn đã chia sẻ']
  },
  {
    id: 'mail_vu_lan_filial',
    unlockCheckinDay: 3,
    sender: 'Thầy Trụ Trì Chùa Vĩnh Tràng',
    title: 'Thư gửi cô bác về Đạo Hiếu & Bông Hồng Cài Áo',
    dateLabel: 'Ngày 3 hành hương',
    body:
      'Tâm hiếu là tâm Phật, hạnh hiếu là hạnh Phật. Nhà chùa kính gửi tặng cô bác lộc công đức để thỉnh Áo Vu Lan hồng hoặc một bó hoa sen dâng lên cầu bình an cho song thân và con cháu.',
    rewardLotus: 90,
    rewardGems: 25,
    replyOptions: ['🌹 Nguyện cầu cha mẹ & gia đình luôn bình an', '🙏 Con xin ghi nhớ chữ Hiếu làm đầu']
  },
  {
    id: 'mail_mindful_tea',
    unlockCheckinDay: 4,
    sender: 'Lầu Trà Thiền Vườn Bồ Đề',
    title: 'Mời cô bác thực hành 5 phút Chánh Niệm mỗi sáng',
    dateLabel: 'Ngày 4 hành hương',
    body:
      'Chỉ cần 5 phút ngồi yên lần từng hạt Tràng Hạt gỗ Bồ Đề, hít vào bình an và thở ra nhẹ nhàng cũng đủ nuôi dưỡng thân tâm khỏe mạnh suốt cả ngày.',
    rewardLotus: 75,
    rewardGems: 20,
    replyOptions: ['🧘 Hôm nay con sẽ ngồi thiền 5 phút', '📿 Tiếng mõ và chuỗi hạt rất dễ chịu']
  },
  {
    id: 'mail_trai_duong_feast',
    unlockCheckinDay: 5,
    sender: 'Ban Trai Soạn Nhà Sàn Miền Tây',
    title: 'Thân mời đoàn gia đình & du khách ghé Nhà Sàn Trai Đường',
    dateLabel: 'Ngày 5 hành hương',
    body:
      'Khu nhà sàn gỗ căm xe bên hồ sen đã chuẩn bị sẵn trà đá thanh mát và cơm chay đạm bạc đón quý Phật tử phương xa cùng đoàn du lịch ghé nghỉ chân.',
    rewardLotus: 85,
    rewardGems: 22,
    replyOptions: ['🍚 Không khí nhà sàn miền Tây thật ấm cúng', '🌿 Cảm ơn nhà chùa tiếp đón chu đáo']
  }
];

export function ensureDailyMissionDate(activityState, dateKey = getLocalDateKey()) {
  const nextAct = createActivityHubState(activityState);
  if (nextAct.dailyDateKey === dateKey) return nextAct;
  nextAct.dailyDateKey = dateKey;
  nextAct.dailyMetrics = {
    dailyCheckedIn: nextAct.lastCheckinDate === dateKey ? 1 : 0,
    dailyIncense: 0,
    dailyQuotesRead: 0,
    dailyMindfulSeconds: 0,
    dailyBeads: 0,
    dailyLotus: 0,
    dailyLessons: 0,
    dailyLeavesSwept: 0,
    dailyGardenActions: 0,
    dailyRhythmSessions: 0,
    dailyRelicsFound: 0
  };
  nextAct.claimedDailyMissions = [];
  nextAct.courtyardTasks = createCourtyardTasksState(nextAct.courtyardTasks, dateKey);
  return nextAct;
}

export function createActivityHubState(initial = {}) {
  const src = initial && typeof initial === 'object' ? initial : {};
  const dm = src.dailyMetrics && typeof src.dailyMetrics === 'object' ? src.dailyMetrics : {};
  return {
    lastCheckinDate: typeof src.lastCheckinDate === 'string' ? src.lastCheckinDate : null,
    streakDays: Math.max(0, Math.min(7, Number(src.streakDays || 0))),
    checkinCount: Math.max(0, Number(src.checkinCount || 0)),
    xp: Math.max(0, Number(src.xp || 0)),
    bellRhythmBest: Math.max(0, Number(src.bellRhythmBest || 0)),
    koiFedCount: Math.max(0, Number(src.koiFedCount || 0)),
    claimedDays: Array.isArray(src.claimedDays) ? [...src.claimedDays] : [],
    claimedQuests: Array.isArray(src.claimedQuests) ? [...src.claimedQuests] : [],
    claimedMails: Array.isArray(src.claimedMails) ? [...src.claimedMails] : [],
    readMails: Array.isArray(src.readMails) ? [...src.readMails] : [],
    repliedMails: src.repliedMails && typeof src.repliedMails === 'object' ? { ...src.repliedMails } : {},
    dailyDateKey: typeof src.dailyDateKey === 'string' ? src.dailyDateKey : null,
    dailyMetrics: {
      dailyCheckedIn: Math.max(0, Number(dm.dailyCheckedIn || 0)),
      dailyIncense: Math.max(0, Number(dm.dailyIncense || 0)),
      dailyQuotesRead: Math.max(0, Number(dm.dailyQuotesRead || 0)),
      dailyMindfulSeconds: Math.max(0, Number(dm.dailyMindfulSeconds || 0)),
      dailyBeads: Math.max(0, Number(dm.dailyBeads || 0)),
      dailyLotus: Math.max(0, Number(dm.dailyLotus || 0)),
      dailyLessons: Math.max(0, Number(dm.dailyLessons || 0)),
      dailyLeavesSwept: Math.max(0, Number(dm.dailyLeavesSwept || 0)),
      dailyGardenActions: Math.max(0, Number(dm.dailyGardenActions || 0)),
      dailyRhythmSessions: Math.max(0, Number(dm.dailyRhythmSessions || 0)),
      dailyRelicsFound: Math.max(0, Number(dm.dailyRelicsFound || 0))
    },
    claimedDailyMissions: Array.isArray(src.claimedDailyMissions) ? [...src.claimedDailyMissions] : [],
    claimedChapters: Array.isArray(src.claimedChapters) ? [...src.claimedChapters] : [],
    shareCount: Math.max(0, Number(src.shareCount || 0)),
    lastShareDate: typeof src.lastShareDate === 'string' ? src.lastShareDate : null,
    feedbackList: Array.isArray(src.feedbackList) ? src.feedbackList.map((f) => ({ ...f })) : [],
    extraMetrics:
      src.extraMetrics && typeof src.extraMetrics === 'object' ? { ...src.extraMetrics } : {},
    courtyardTasks: createCourtyardTasksState(src.courtyardTasks, src.courtyardTasks?.dateKey || getLocalDateKey()),
    templeGarden: createTempleGardenState(src.templeGarden),
    heritageRelics: Array.isArray(src.heritageRelics) ? [...new Set(src.heritageRelics)] : []
  };
}

export function recordDailyMissionMetric(activityState, metricKey, amount = 1, dateKey = getLocalDateKey()) {
  const nextAct = ensureDailyMissionDate(activityState, dateKey);
  if (Object.prototype.hasOwnProperty.call(nextAct.dailyMetrics, metricKey)) {
    nextAct.dailyMetrics[metricKey] = Math.max(
      0,
      Number(nextAct.dailyMetrics[metricKey] || 0) + Math.max(0, Number(amount || 0))
    );
  }
  return nextAct;
}

export function getDailyMissionsWithProgress(activityState, dateKey = getLocalDateKey()) {
  const act = ensureDailyMissionDate(activityState, dateKey);
  return DAILY_RESET_MISSIONS.map((m) => {
    const rawCurrent =
      m.metric === 'dailyCheckedIn'
        ? act.lastCheckinDate === dateKey
          ? 1
          : act.dailyMetrics.dailyCheckedIn || 0
        : act.dailyMetrics[m.metric] || 0;
    const current = Math.min(m.target, rawCurrent);
    const completed = rawCurrent >= m.target;
    const claimed = act.claimedDailyMissions.includes(m.id);
    return {
      ...m,
      current,
      rawCurrent,
      completed,
      claimed,
      claimable: completed && !claimed
    };
  });
}

export function claimDailyMissionReward(activityState, storeProfile, missionId, dateKey = getLocalDateKey()) {
  const nextAct = ensureDailyMissionDate(activityState, dateKey);
  const nextProfile = createStoreProfileState(storeProfile);
  const list = getDailyMissionsWithProgress(nextAct, dateKey);
  const mission = list.find((m) => m.id === missionId);
  if (!mission) {
    return { ok: false, reason: 'not_found', message: 'Không tìm thấy nhiệm vụ hằng ngày.', activity: nextAct, storeProfile: nextProfile };
  }
  if (mission.claimed) {
    return { ok: false, reason: 'already_claimed', message: 'Hôm nay cô bác đã nhận thưởng nhiệm vụ này rồi.', activity: nextAct, storeProfile: nextProfile };
  }
  if (!mission.completed) {
    return {
      ok: false,
      reason: 'incomplete',
      message: `Cần hoàn thành "${mission.title}" (${mission.current}/${mission.target}) trước khi nhận lộc.`,
      activity: nextAct,
      storeProfile: nextProfile
    };
  }
  nextAct.claimedDailyMissions.push(mission.id);
  nextProfile.lotusPoints += mission.rewardLotus;
  nextProfile.gems += mission.rewardGems;
  return {
    ok: true,
    mission,
    message: `Hoàn thành "${mission.title}"! Nhận +${mission.rewardLotus} 🪷 & +${mission.rewardGems} 💎.`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function getExplorationChaptersStatus(activityState, spiritualState) {
  const act = createActivityHubState(activityState);
  const sp = createSpiritualState(spiritualState);
  const effectiveDay = Math.max(1, act.checkinCount || 1);
  const visitedCount = sp.visitedStations.length;
  return EXPLORATION_CHAPTERS.map((ch) => {
    const unlockedByDay = effectiveDay >= ch.dayUnlock || visitedCount >= ch.requiredStations;
    const completed = visitedCount >= ch.requiredStations && unlockedByDay;
    const claimed = act.claimedChapters.includes(ch.id);
    return {
      ...ch,
      unlocked: unlockedByDay,
      visitedCount: Math.min(ch.requiredStations, visitedCount),
      completed,
      claimed,
      claimable: completed && !claimed
    };
  });
}

export function claimExplorationChapterReward(activityState, storeProfile, spiritualState, chapterId) {
  const nextAct = createActivityHubState(activityState);
  const nextProfile = createStoreProfileState(storeProfile);
  const list = getExplorationChaptersStatus(nextAct, spiritualState);
  const chap = list.find((c) => c.id === chapterId);
  if (!chap) {
    return { ok: false, reason: 'not_found', message: 'Không tìm thấy chặng khám phá.', activity: nextAct, storeProfile: nextProfile };
  }
  if (chap.claimed) {
    return { ok: false, reason: 'already_claimed', message: 'Bạn đã nhận phần thưởng chặng này rồi.', activity: nextAct, storeProfile: nextProfile };
  }
  if (!chap.completed) {
    return { ok: false, reason: 'incomplete', message: `Hãy khám phá ${chap.requiredStations} điểm để mở thưởng chặng này.`, activity: nextAct, storeProfile: nextProfile };
  }
  nextAct.claimedChapters.push(chap.id);
  nextProfile.lotusPoints += chap.rewardLotus;
  nextProfile.gems += chap.rewardGems;
  return {
    ok: true,
    chapter: chap,
    message: `Hoàn thành ${chap.title}! Nhận +${chap.rewardLotus} 🪷 & +${chap.rewardGems} 💎.`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function claimDailyCheckin(activityState, storeProfile, dateKey = getLocalDateKey()) {
  const nextAct = ensureDailyMissionDate(activityState, dateKey);
  const nextProfile = createStoreProfileState(storeProfile);

  if (nextAct.lastCheckinDate === dateKey) {
    return {
      ok: false,
      reason: 'already_checked_in',
      message: 'Hôm nay cô bác đã điểm danh nhận lộc rồi. Hẹn ngày mai quay lại nhé!',
      activity: nextAct,
      storeProfile: nextProfile,
      reward: null
    };
  }

  const nextDayIndex = (nextAct.streakDays % 7) + 1;
  const reward = DAILY_CHECKIN_REWARDS[nextDayIndex - 1] || DAILY_CHECKIN_REWARDS[0];

  nextAct.lastCheckinDate = dateKey;
  nextAct.streakDays = nextDayIndex;
  nextAct.checkinCount += 1;
  nextAct.dailyMetrics.dailyCheckedIn = 1;
  if (!nextAct.claimedDays.includes(nextDayIndex)) {
    nextAct.claimedDays.push(nextDayIndex);
  }
  if (nextDayIndex === 7) {
    nextAct.claimedDays = [1, 2, 3, 4, 5, 6, 7];
  }

  nextProfile.lotusPoints += reward.lotus;
  nextProfile.gems += reward.gems;

  return {
    ok: true,
    day: nextDayIndex,
    reward,
    message: `Điểm danh ${reward.label} thành công! Nhận +${reward.lotus} 🪷 & +${reward.gems} 💎.`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function getQuestMetricValue(activityState, spiritualState, completedLessonsCount = 0, metric) {
  const act = createActivityHubState(activityState);
  const sp = createSpiritualState(spiritualState);
  if (metric === 'checkinCount') return act.checkinCount;
  if (metric === 'bowCount') return sp.bowCount;
  if (metric === 'incenseOfferings') return sp.incenseOfferings;
  if (metric === 'lotusOfferings') return sp.lotusOfferings;
  if (metric === 'malaTotalBeads') return sp.malaCycles * 108 + sp.malaBeads;
  if (metric === 'visitedCount') return sp.visitedStations.length;
  if (metric === 'completedLessonsCount') return Math.max(0, Number(completedLessonsCount || 0));
  return Math.max(0, Number(act.extraMetrics[metric] || 0));
}

export function incrementQuestProgress(activityState, metric, amount = 1) {
  const nextAct = createActivityHubState(activityState);
  nextAct.extraMetrics[metric] =
    Math.max(0, Number(nextAct.extraMetrics[metric] || 0)) + Math.max(0, Number(amount || 0));
  return nextAct;
}

export function getQuestsWithProgress(activityState, spiritualState, completedLessonsCount = 0) {
  const act = createActivityHubState(activityState);
  return DAILY_QUESTS_TEMPLATE.map((q) => {
    const current = getQuestMetricValue(act, spiritualState, completedLessonsCount, q.metric);
    const clamped = Math.min(q.target, current);
    const completed = current >= q.target;
    const claimed = act.claimedQuests.includes(q.id);
    return {
      ...q,
      current: clamped,
      rawCurrent: current,
      completed,
      claimed,
      claimable: completed && !claimed
    };
  });
}

export function claimQuestReward(
  activityState,
  storeProfile,
  spiritualState,
  completedLessonsCount = 0,
  questId
) {
  const nextAct = createActivityHubState(activityState);
  const nextProfile = createStoreProfileState(storeProfile);
  const list = getQuestsWithProgress(nextAct, spiritualState, completedLessonsCount);
  const quest = list.find((q) => q.id === questId);

  if (!quest) {
    return { ok: false, reason: 'not_found', message: 'Không tìm thấy nhiệm vụ.', activity: nextAct, storeProfile: nextProfile };
  }
  if (quest.claimed) {
    return { ok: false, reason: 'already_claimed', message: 'Bạn đã nhận thưởng nhiệm vụ này rồi.', activity: nextAct, storeProfile: nextProfile };
  }
  if (!quest.completed) {
    return {
      ok: false,
      reason: 'incomplete',
      message: `Cần hoàn thành "${quest.title}" (${quest.current}/${quest.target}) trước khi nhận thưởng.`,
      activity: nextAct,
      storeProfile: nextProfile
    };
  }

  nextAct.claimedQuests.push(quest.id);
  nextProfile.lotusPoints += quest.rewardLotus;
  nextProfile.gems += quest.rewardGems;

  return {
    ok: true,
    quest,
    message: `Hoàn thành "${quest.title}"! Nhận +${quest.rewardLotus} 🪷 & +${quest.rewardGems} 💎.`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function getMailboxWithStatus(activityState, { includeExtended = false, spiritualState = null } = {}) {
  const act = createActivityHubState(activityState);
  const dayNum = Math.max(1, act.checkinCount || 1);
  const visitedCount = spiritualState ? createSpiritualState(spiritualState).visitedStations.length : 1;

  const baseList = INITIAL_MAILBOX_MESSAGES.map((m) => ({
    ...m,
    replyOptions: m.replyOptions || [
      '🙏 Con xin cảm ơn & ghi nhớ lời nhắn',
      '🪷 Chúc Ban Quản Trị nhà chùa luôn an lạc'
    ],
    unlocked: true
  }));

  const extList = includeExtended
    ? EXTENDED_MAILBOX_MESSAGES.filter(
        (m) => dayNum >= (m.unlockCheckinDay || 1) || visitedCount >= (m.unlockCheckinDay || 2) + 1
      ).map((m) => ({ ...m, unlocked: true }))
    : [];

  return [...baseList, ...extList].map((m) => ({
    ...m,
    claimed: act.claimedMails.includes(m.id),
    read: act.readMails.includes(m.id) || act.claimedMails.includes(m.id),
    replyText: act.repliedMails[m.id] || null
  }));
}

export function claimMailboxReward(activityState, storeProfile, mailId) {
  const nextAct = createActivityHubState(activityState);
  const nextProfile = createStoreProfileState(storeProfile);
  const mail = [...INITIAL_MAILBOX_MESSAGES, ...EXTENDED_MAILBOX_MESSAGES].find((m) => m.id === mailId);

  if (!mail) {
    return { ok: false, reason: 'not_found', message: 'Không tìm thấy thư.', activity: nextAct, storeProfile: nextProfile };
  }
  if (!nextAct.readMails.includes(mailId)) {
    nextAct.readMails.push(mailId);
  }
  if (nextAct.claimedMails.includes(mailId)) {
    return { ok: false, reason: 'already_claimed', message: 'Bạn đã nhận quà từ thư này rồi.', activity: nextAct, storeProfile: nextProfile };
  }

  nextAct.claimedMails.push(mailId);
  nextProfile.lotusPoints += mail.rewardLotus;
  nextProfile.gems += mail.rewardGems;

  return {
    ok: true,
    mail,
    message: `Đã nhận quà từ "${mail.sender}": +${mail.rewardLotus} 🪷 & +${mail.rewardGems} 💎.`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function replyToMailboxMessage(activityState, storeProfile, mailId, optionIndex = 0) {
  const nextAct = createActivityHubState(activityState);
  const nextProfile = createStoreProfileState(storeProfile);
  const mail = [...INITIAL_MAILBOX_MESSAGES, ...EXTENDED_MAILBOX_MESSAGES].find((m) => m.id === mailId);
  if (!mail) {
    return { ok: false, message: 'Không tìm thấy thư để hồi âm.', activity: nextAct, storeProfile: nextProfile };
  }
  const options = mail.replyOptions || [
    '🙏 Con xin cảm ơn & ghi nhớ lời nhắn',
    '🪷 Chúc Ban Quản Trị nhà chùa luôn an lạc'
  ];
  const replyText = options[Math.max(0, Math.min(options.length - 1, Number(optionIndex || 0)))];
  const firstReply = !nextAct.repliedMails[mailId];
  nextAct.repliedMails[mailId] = replyText;
  if (!nextAct.readMails.includes(mailId)) nextAct.readMails.push(mailId);
  if (firstReply) {
    nextProfile.lotusPoints += 15;
  }
  return {
    ok: true,
    firstReply,
    replyText,
    message: firstReply
      ? `Đã gửi hồi âm tới "${mail.sender}" (+15 🪷 tri ân).`
      : `Đã cập nhật lời hồi âm của cô bác.`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function buildPilgrimageShareText({
  characterModelKey = 'nu',
  spiritual = {},
  storeProfile = {},
  activityHub = {},
  completedLessonsCount = 0
} = {}) {
  const sp = createSpiritualState(spiritual);
  const act = createActivityHubState(activityHub);
  const prof = createStoreProfileState(storeProfile);
  const charProf = CHARACTER_PROFILES.find((c) => c.key === characterModelKey) || CHARACTER_PROFILES[0];
  const totalBeads = sp.malaCycles * 108 + sp.malaBeads;
  const mindfulMins = Math.floor((act.dailyMetrics?.dailyMindfulSeconds || 0) / 60);
  return [
    '🪷 THIỆP HÀNH HƯƠNG CHÙA VĨNH TRÀNG (MỸ THO) 🪷',
    `Phật tử: ${charProf.name} · Chuỗi chuyên cần ${act.streakDays || 1} ngày`,
    `• Đảnh lễ Tam Bảo: ${sp.bowCount} lạy · Dâng hương: ${sp.incenseOfferings} lần · Hoa sen: ${sp.lotusOfferings} đóa`,
    `• Niệm Phật: ${totalBeads} biến (${sp.malaCycles} vòng 108 hạt) · Chánh niệm hôm nay: ${mindfulMins} phút`,
    `• Khám phá: ${sp.visitedStations.length}/9 thắng cảnh · Đã học: ${completedLessonsCount} bài Giảng đường · Điểm Sen: ${prof.lotusPoints} 🪷`,
    'Nguyện đem công đức này hướng về khắp tất cả, cầu bình an sức khỏe đến gia đình & mọi người!'
  ].join('\n');
}

export function recordPilgrimageShare(activityState, storeProfile, dateKey = getLocalDateKey()) {
  const nextAct = createActivityHubState(activityState);
  const nextProfile = createStoreProfileState(storeProfile);
  const dailyBonusGranted = nextAct.lastShareDate !== dateKey;
  nextAct.shareCount += 1;
  nextAct.lastShareDate = dateKey;
  if (dailyBonusGranted) {
    nextProfile.lotusPoints += 30;
    nextProfile.gems += 5;
  }
  return {
    ok: true,
    dailyBonusGranted,
    message: dailyBonusGranted
      ? 'Đã sao chép thiệp chia sẻ hành hương! Tặng cô bác +30 🪷 & +5 💎 lộc lan tỏa bình an.'
      : 'Đã sao chép thiệp chia sẻ hành hương gửi người thân.',
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function submitUserFeedback(activityState, storeProfile, { rating = 5, tags = [], comment = '' } = {}, dateKey = getLocalDateKey()) {
  const nextAct = createActivityHubState(activityState);
  const nextProfile = createStoreProfileState(storeProfile);
  const cleanComment = String(comment || '').trim();
  const cleanTags = Array.isArray(tags) ? tags.filter(Boolean).slice(0, 6) : [];
  if (!cleanComment && cleanTags.length === 0) {
    return {
      ok: false,
      message: 'Cô bác vui lòng chọn ít nhất 1 mục góp ý hoặc nhập lời nhắn ngắn ạ.',
      activity: nextAct,
      storeProfile: nextProfile
    };
  }
  const alreadyRewardedToday = nextAct.feedbackList.some((f) => f.dateKey === dateKey);
  nextAct.feedbackList.unshift({
    id: `fb_${Date.now()}`,
    dateKey,
    rating: Math.max(1, Math.min(5, Number(rating || 5))),
    tags: cleanTags,
    comment: cleanComment
  });
  nextAct.feedbackList = nextAct.feedbackList.slice(0, 20);
  if (!alreadyRewardedToday) {
    nextProfile.lotusPoints += 25;
  }
  return {
    ok: true,
    bonusGranted: !alreadyRewardedToday,
    message: alreadyRewardedToday
      ? 'Nhà chùa xin chân thành cảm ơn góp ý quý báu của cô bác!'
      : 'Cảm ơn cô bác đã góp ý! Kính tặng +25 🪷 để thỉnh hương hoa.',
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function unifyEquippedVisualPayload(storeProfile = {}, spiritual = {}) {
  const prof = createStoreProfileState(storeProfile);
  const sp = createSpiritualState(spiritual);
  const eq = prof.equipped || {};
  const spEq = sp.equippedItems || {};
  const findItem = (id) => (id ? STORE_ITEMS_CATALOG.find((x) => x.id === id) || null : null);

  const tryingItem = findItem(prof.tryingItemId);
  const eqRobe = findItem(eq.robe);
  const activeRobe =
    tryingItem?.slot === 'robe'
      ? tryingItem
      : eqRobe || (spEq.outfit === 'ao_trang_phat_tu' ? { id: 'ao_trang_lam', robeStyle: 'lam_phat_tu', robeTint: [0.60, 0.56, 0.62] } : null);

  const activeHat = tryingItem?.slot === 'hat' ? tryingItem : findItem(eq.hat);
  const activeMat = tryingItem?.slot === 'mat' ? tryingItem : findItem(eq.mat);
  const activeHand =
    tryingItem && ['handItem', 'instrument', 'offering'].includes(tryingItem.slot)
      ? tryingItem
      : findItem(eq.handItem || eq.instrument || eq.offering);
  const activeMala = tryingItem?.slot === 'mala' ? tryingItem : findItem(eq.mala);
  const activeTree = tryingItem?.slot === 'tree' ? tryingItem : findItem(eq.tree);
  const activeCloud = tryingItem?.slot === 'cloud' ? tryingItem : findItem(eq.cloud);
  const activePet = tryingItem?.slot === 'pet' ? tryingItem : findItem(eq.pet);

  let handProp = activeHand?.prop3d || null;
  if (!handProp && spEq.hand && spEq.hand !== 'trang_hat_bo_de') {
    handProp = spEq.hand === 'hoa_sen_trang_nghiem' || spEq.hand === 'hoa_sen' ? 'nen_hoa_sen' : spEq.hand;
  }

  return {
    robeId: activeRobe?.id || null,
    robeName: activeRobe?.name || null,
    robeStyle: activeRobe?.robeStyle || null,
    robeTint: activeRobe?.robeTint || null,
    upperTint: activeRobe?.upperTint || activeRobe?.robeTint || null,
    lowerTint: activeRobe?.lowerTint || activeRobe?.robeTint || null,
    trimTint: activeRobe?.trimTint || null,
    sashTint: activeRobe?.sashTint || null,
    hat: Boolean(activeHat || spEq.hat === 'non_la_theu_sen'),
    hatGlbKey: activeHat?.prop3d === 'non_la_blender' ? 'non_la_blender' : activeHat || spEq.hat === 'non_la_theu_sen' ? 'non_la' : null,
    bag: spEq.bag || null,
    bagGlbKey: spEq.bag ? (String(spEq.bag).includes('tui') ? 'tui_sen' : null) : null,
    scarf: spEq.scarf || null,
    malaId: activeMala?.id || (spEq.hand === 'trang_hat_go' || spEq.hand === 'trang_hat_bo_de' ? 'trang_hat_bo_de_108_store' : null),
    mat: activeMat?.prop3d || null,
    handProp,
    treeProp: activeTree?.prop3d || null,
    treeId: activeTree?.id || null,
    cloudColor: activeCloud?.cloudColor || null,
    petType: activePet?.petType || null
  };
}

export function encodeProfileBackupCode(payload = {}) {
  const safePayload = {
    v: 1,
    char: payload.characterModelKey || 'nu',
    spiritual: createSpiritualState(payload.spiritual),
    storeProfile: createStoreProfileState(payload.storeProfile),
    activityHub: createActivityHubState(payload.activityHub),
    completedLessons: Array.isArray(payload.completedLessons) ? payload.completedLessons : []
  };
  const json = JSON.stringify(safePayload);
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  let checksum = 0;
  for (let i = 0; i < json.length; i++) {
    checksum = (checksum * 31 + json.charCodeAt(i)) >>> 0;
  }
  const b64 = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `VT1-${checksum.toString(36).toUpperCase()}-${b64}`;
}

export function decodeProfileBackupCode(code) {
  try {
    const raw = String(code || '').trim();
    if (!raw.startsWith('VT1-')) {
      return { ok: false, message: 'Mã khôi phục không đúng định dạng (phải bắt đầu bằng VT1-).' };
    }
    const parts = raw.split('-');
    if (parts.length < 3) {
      return { ok: false, message: 'Mã khôi phục bị thiếu dữ liệu.' };
    }
    const givenChecksum = parts[1].toUpperCase();
    const b64 = parts.slice(2).join('-').replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (b64.length % 4)) % 4;
    const bin = atob(b64 + '='.repeat(padLen));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    let checksum = 0;
    for (let i = 0; i < json.length; i++) {
      checksum = (checksum * 31 + json.charCodeAt(i)) >>> 0;
    }
    if (checksum.toString(36).toUpperCase() !== givenChecksum) {
      return { ok: false, message: 'Mã khôi phục không khớp kiểm tra toàn vẹn (checksum).' };
    }
    const parsed = JSON.parse(json);
    return {
      ok: true,
      data: {
        characterModelKey: parsed.char || 'nu',
        spiritual: createSpiritualState(parsed.spiritual),
        storeProfile: createStoreProfileState(parsed.storeProfile),
        activityHub: createActivityHubState(parsed.activityHub),
        completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : []
      }
    };
  } catch {
    return { ok: false, message: 'Không thể giải mã mã khôi phục. Vui lòng kiểm tra lại.' };
  }
}

export const INTERIOR_HALL_CAPACITY = {
  prayerCushions: 144,
  diningSeats: 48,
  standingSlots: 36,
  totalCapacity: 228,
  minRequired: 180
};

export function calculateInteriorPlayerCapacity(overrides = {}) {
  const prayerCushions = Number(overrides.prayerCushions ?? INTERIOR_HALL_CAPACITY.prayerCushions);
  const diningSeats = Number(overrides.diningSeats ?? INTERIOR_HALL_CAPACITY.diningSeats);
  const standingSlots = Number(overrides.standingSlots ?? INTERIOR_HALL_CAPACITY.standingSlots);
  const totalCapacity = Math.max(0, prayerCushions) + Math.max(0, diningSeats) + Math.max(0, standingSlots);
  return {
    prayerCushions,
    diningSeats,
    standingSlots,
    totalCapacity,
    minRequired: INTERIOR_HALL_CAPACITY.minRequired,
    meetsTarget: totalCapacity >= INTERIOR_HALL_CAPACITY.minRequired
  };
}

// ============================================================================
// MULTI-DAY REPLAYABLE GAMEPLAY SYSTEM (XP Ranks, Bodhi Leaves, Temple Garden,
// Bell/Mokugyo Rhythm Minigame, Heritage Relic Stamp Book)
// ============================================================================
export const PILGRIM_RANKS = [
  { level: 1, minXp: 0, title: 'Thiện Duyên', badge: '🌱' },
  { level: 2, minXp: 120, title: 'Hành Giả', badge: '🪷' },
  { level: 3, minXp: 350, title: 'Cư Sĩ Tinh Tấn', badge: '📿' },
  { level: 4, minXp: 700, title: 'Hộ Pháp Công Đức', badge: '☸️' },
  { level: 5, minXp: 1200, title: 'Liên Hoa Thiện Tri Thức', badge: '✨' }
];

export function getPilgrimRankInfo(xp = 0) {
  const safeXp = Math.max(0, Number(xp || 0));
  let current = PILGRIM_RANKS[0];
  for (const rank of PILGRIM_RANKS) {
    if (safeXp >= rank.minXp) current = rank;
  }
  const idx = PILGRIM_RANKS.indexOf(current);
  const next = PILGRIM_RANKS[idx + 1] || null;
  const span = next ? Math.max(1, next.minXp - current.minXp) : 1;
  const progressRatio = next ? Math.min(1, Math.max(0, (safeXp - current.minXp) / span)) : 1;
  return {
    xp: safeXp,
    level: current.level,
    title: current.title,
    badge: current.badge,
    nextMinXp: next ? next.minXp : current.minXp,
    nextTitle: next ? next.title : null,
    progressRatio
  };
}

export function grantPlayerXp(activityState, xpAmount = 0) {
  const nextAct = createActivityHubState(activityState);
  const prevRank = getPilgrimRankInfo(nextAct.xp);
  const delta = Math.max(0, Math.round(Number(xpAmount || 0)));
  nextAct.xp += delta;
  const nextRank = getPilgrimRankInfo(nextAct.xp);
  return {
    activity: nextAct,
    xpGranted: delta,
    leveledUp: nextRank.level > prevRank.level,
    rankInfo: nextRank
  };
}

export const COURTYARD_LEAF_SPOTS = [
  { id: 'leaf_tam_quan', label: 'Lá Bồ Đề Cổng Tam Quan', pos: { x: 18.5, z: 46.5 } },
  { id: 'leaf_adida_east', label: 'Lá Bồ Đề vườn A Di Đà', pos: { x: 28.5, z: 29.0 } },
  { id: 'leaf_san_trung_tam', label: 'Lá Bồ Đề sân gạch Chánh điện', pos: { x: 16.0, z: 18.5 } },
  { id: 'leaf_quan_am', label: 'Cánh sen Đài Quán Thế Âm', pos: { x: 30.8, z: 22.0 } },
  { id: 'leaf_ho_sen', label: 'Lá sen Hồ Cá Koi', pos: { x: -4.5, z: 20.5 } },
  { id: 'leaf_di_lac', label: 'Lá Bồ Đề sân Di Lặc', pos: { x: -20.5, z: 15.0 } },
  { id: 'leaf_vuon_lam_ty_ni', label: 'Hoa Sa La Vườn Lâm Tỳ Ni', pos: { x: -34.0, z: 24.5 } },
  { id: 'leaf_bao_thap', label: 'Lá Bồ Đề Bảo Tháp 7 Tầng', pos: { x: -12.0, z: -31.5 } }
];

export function createCourtyardTasksState(saved = {}, dateKey = getLocalDateKey()) {
  const src = saved && typeof saved === 'object' ? saved : {};
  const sameDay = src.dateKey === dateKey;
  return {
    dateKey: typeof src.dateKey === 'string' && sameDay ? src.dateKey : dateKey,
    collectedIds: sameDay && Array.isArray(src.collectedIds) ? [...new Set(src.collectedIds)] : [],
    totalSwept: Math.max(0, Number(src.totalSwept || 0))
  };
}

export function collectCourtyardTask(activityState, storeProfile, spotId, dateKey = getLocalDateKey()) {
  let nextAct = ensureDailyMissionDate(activityState, dateKey);
  const nextProfile = createStoreProfileState(storeProfile);
  const spot = COURTYARD_LEAF_SPOTS.find((s) => s.id === spotId);
  if (!spot) {
    return {
      ok: false,
      reason: 'not_found',
      message: 'Không tìm thấy vị trí lá Bồ Đề.',
      activity: nextAct,
      storeProfile: nextProfile
    };
  }
  const tasks = createCourtyardTasksState(nextAct.courtyardTasks, dateKey);
  if (tasks.collectedIds.includes(spotId)) {
    return {
      ok: false,
      reason: 'already_collected',
      message: `Hôm nay cô bác đã quét sạch "${spot.label}" rồi.`,
      activity: nextAct,
      storeProfile: nextProfile
    };
  }

  tasks.collectedIds.push(spotId);
  tasks.totalSwept += 1;
  nextAct.courtyardTasks = tasks;
  nextAct = recordDailyMissionMetric(nextAct, 'dailyLeavesSwept', 1, dateKey);

  const rewardLotus = 15;
  const rewardGems = tasks.collectedIds.length % 4 === 0 ? 1 : 0;
  nextProfile.lotusPoints += rewardLotus;
  nextProfile.gems += rewardGems;
  const xpRes = grantPlayerXp(nextAct, 15);
  nextAct = xpRes.activity;

  return {
    ok: true,
    spot,
    rewardLotus,
    rewardGems,
    xpGranted: 15,
    leveledUp: xpRes.leveledUp,
    rankInfo: xpRes.rankInfo,
    collectedCount: tasks.collectedIds.length,
    totalSpots: COURTYARD_LEAF_SPOTS.length,
    message: rewardGems
      ? `Quét ${spot.label}: +${rewardLotus} 🪷 · +${rewardGems} 💎 · +15 XP!`
      : `Quét ${spot.label}: +${rewardLotus} 🪷 · +15 XP!`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export const TEMPLE_GARDEN_SPECIES = [
  {
    id: 'chum_sen',
    name: 'Chậu Sen Đồng Tháp',
    icon: '🪷',
    seedCostLotus: 30,
    harvestLotus: 65,
    harvestGems: 2,
    harvestXp: 35,
    desc: 'Hoa sen hồng thanh khiết nở rộ dưới nắng miền Tây.'
  },
  {
    id: 'cay_bo_de',
    name: 'Cây Bồ Đề Non',
    icon: '🌳',
    seedCostLotus: 50,
    harvestLotus: 95,
    harvestGems: 4,
    harvestXp: 50,
    desc: 'Cây Bồ Đề lá hình tim xanh mướt tượng trưng cho trí tuệ tỉnh thức.'
  },
  {
    id: 'cay_sala',
    name: 'Cây Sa La Khai Hoa',
    icon: '🌺',
    seedCostLotus: 65,
    harvestLotus: 120,
    harvestGems: 5,
    harvestXp: 65,
    desc: 'Loài hoa thiêng gắn liền với Vườn Lâm Tỳ Ni và cội Đạo Tràng.'
  }
];

export const TEMPLE_GARDEN_SLOTS = [
  { slotIdx: 0, label: 'Luống 1 · Tây Nam Vườn Thiền', pos: { x: -37.2, z: 20.8 } },
  { slotIdx: 1, label: 'Luống 2 · Chính Tây Vườn Lâm Tỳ Ni', pos: { x: -33.2, z: 20.8 } },
  { slotIdx: 2, label: 'Luống 3 · Cạnh Lối Dạo Hoa Sen', pos: { x: -37.2, z: 25.4 } },
  { slotIdx: 3, label: 'Luống 4 · Góc Tĩnh Tâm Sân Tây', pos: { x: -33.2, z: 25.4 } }
];

export function createTempleGardenState(saved = null) {
  const arr = Array.isArray(saved) ? saved : [];
  return TEMPLE_GARDEN_SLOTS.map((slot, idx) => {
    const raw = arr[idx] && typeof arr[idx] === 'object' ? arr[idx] : {};
    const speciesValid = TEMPLE_GARDEN_SPECIES.some((s) => s.id === raw.speciesId);
    return {
      slotIdx: idx,
      speciesId: speciesValid ? raw.speciesId : null,
      stage: speciesValid ? Math.max(1, Math.min(3, Number(raw.stage || 1))) : 0,
      lastWaterDate: typeof raw.lastWaterDate === 'string' ? raw.lastWaterDate : null,
      harvestCount: Math.max(0, Number(raw.harvestCount || 0))
    };
  });
}

export function plantGardenTree(activityState, storeProfile, slotIdx, speciesId, dateKey = getLocalDateKey()) {
  let nextAct = ensureDailyMissionDate(activityState, dateKey);
  const nextProfile = createStoreProfileState(storeProfile);
  const slots = createTempleGardenState(nextAct.templeGarden);
  const idx = Number(slotIdx);
  if (!slots[idx]) {
    return { ok: false, reason: 'invalid_slot', message: 'Không tìm thấy ô đất vườn.', activity: nextAct, storeProfile: nextProfile };
  }
  if (slots[idx].speciesId) {
    return { ok: false, reason: 'occupied', message: 'Luống này đã có cây đang sinh trưởng.', activity: nextAct, storeProfile: nextProfile };
  }
  const species = TEMPLE_GARDEN_SPECIES.find((s) => s.id === speciesId);
  if (!species) {
    return { ok: false, reason: 'invalid_species', message: 'Không tìm thấy giống cây.', activity: nextAct, storeProfile: nextProfile };
  }
  if (nextProfile.lotusPoints < species.seedCostLotus) {
    return {
      ok: false,
      reason: 'insufficient_lotus',
      message: `Cần ${species.seedCostLotus} 🪷 để thỉnh giống ${species.name}.`,
      activity: nextAct,
      storeProfile: nextProfile
    };
  }

  nextProfile.lotusPoints -= species.seedCostLotus;
  slots[idx] = {
    ...slots[idx],
    speciesId: species.id,
    stage: 1,
    lastWaterDate: null
  };
  nextAct.templeGarden = slots;
  nextAct = recordDailyMissionMetric(nextAct, 'dailyGardenActions', 1, dateKey);
  const xpRes = grantPlayerXp(nextAct, 15);
  nextAct = xpRes.activity;

  return {
    ok: true,
    slot: slots[idx],
    species,
    leveledUp: xpRes.leveledUp,
    rankInfo: xpRes.rankInfo,
    message: `Đã ươm trồng ${species.name} tại luống ${idx + 1} (+15 XP).`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function waterGardenSlot(activityState, storeProfile, slotIdx, dateKey = getLocalDateKey()) {
  let nextAct = ensureDailyMissionDate(activityState, dateKey);
  const nextProfile = createStoreProfileState(storeProfile);
  const slots = createTempleGardenState(nextAct.templeGarden);
  const idx = Number(slotIdx);
  const slot = slots[idx];
  if (!slot || !slot.speciesId) {
    return { ok: false, reason: 'empty_slot', message: 'Luống đất này đang trống, hãy gieo hạt trước nhé.', activity: nextAct, storeProfile: nextProfile };
  }
  if (slot.stage >= 3) {
    return { ok: false, reason: 'already_mature', message: 'Cây đã nở hoa rực rỡ, cô bác có thể thu hoạch ngay!', activity: nextAct, storeProfile: nextProfile };
  }
  const species = TEMPLE_GARDEN_SPECIES.find((s) => s.id === slot.speciesId);
  slot.stage = Math.min(3, slot.stage + 1);
  slot.lastWaterDate = dateKey;
  nextAct.templeGarden = slots;
  nextAct = recordDailyMissionMetric(nextAct, 'dailyGardenActions', 1, dateKey);
  nextProfile.lotusPoints += 12;
  const xpRes = grantPlayerXp(nextAct, 15);
  nextAct = xpRes.activity;

  return {
    ok: true,
    slot,
    species,
    leveledUp: xpRes.leveledUp,
    rankInfo: xpRes.rankInfo,
    message:
      slot.stage >= 3
        ? `Tưới nước ${species?.name || 'cây'}: cây đã trổ hoa mãn khai! (+12 🪷, +15 XP)`
        : `Tưới nước ${species?.name || 'cây'} nảy chồi xanh tươi (+12 🪷, +15 XP).`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function harvestGardenSlot(activityState, storeProfile, slotIdx, dateKey = getLocalDateKey()) {
  let nextAct = ensureDailyMissionDate(activityState, dateKey);
  const nextProfile = createStoreProfileState(storeProfile);
  const slots = createTempleGardenState(nextAct.templeGarden);
  const idx = Number(slotIdx);
  const slot = slots[idx];
  if (!slot || !slot.speciesId || slot.stage < 3) {
    return { ok: false, reason: 'not_mature', message: 'Cây cần đạt giai đoạn nở hoa (3/3) mới có thể thu hoạch.', activity: nextAct, storeProfile: nextProfile };
  }
  const species = TEMPLE_GARDEN_SPECIES.find((s) => s.id === slot.speciesId) || TEMPLE_GARDEN_SPECIES[0];
  nextProfile.lotusPoints += species.harvestLotus;
  nextProfile.gems += species.harvestGems;
  slots[idx] = {
    slotIdx: idx,
    speciesId: null,
    stage: 0,
    lastWaterDate: null,
    harvestCount: (slot.harvestCount || 0) + 1
  };
  nextAct.templeGarden = slots;
  nextAct = recordDailyMissionMetric(nextAct, 'dailyGardenActions', 1, dateKey);
  const xpRes = grantPlayerXp(nextAct, species.harvestXp);
  nextAct = xpRes.activity;

  return {
    ok: true,
    species,
    rewardLotus: species.harvestLotus,
    rewardGems: species.harvestGems,
    xpGranted: species.harvestXp,
    leveledUp: xpRes.leveledUp,
    rankInfo: xpRes.rankInfo,
    message: `Thu hoạch ${species.name}! Nhận +${species.harvestLotus} 🪷 · +${species.harvestGems} 💎 · +${species.harvestXp} XP.`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export function scoreBellRhythmHit(offsetMs = 0) {
  const abs = Math.abs(Number(offsetMs || 0));
  if (abs <= 90) {
    return { grade: 'chanh_niem', label: 'Chánh niệm!', points: 100 };
  }
  if (abs <= 190) {
    return { grade: 'hoa_nhip', label: 'Hòa nhịp!', points: 65 };
  }
  if (abs <= 300) {
    return { grade: 'cham_nhip', label: 'Chậm nhịp', points: 35 };
  }
  return { grade: 'miss', label: 'Lỡ nhịp', points: 0 };
}

export function completeBellRhythmSession(activityState, storeProfile, hits = [], dateKey = getLocalDateKey()) {
  let nextAct = ensureDailyMissionDate(activityState, dateKey);
  const nextProfile = createStoreProfileState(storeProfile);
  const arr = Array.isArray(hits) ? hits : [];
  let totalScore = 0;
  let chanhNiemCount = 0;
  let maxCombo = 0;
  let combo = 0;
  for (const h of arr) {
    const pts = Number(h?.points || 0);
    totalScore += pts;
    if (h?.grade === 'chanh_niem') chanhNiemCount += 1;
    if (pts > 0) {
      combo += 1;
      maxCombo = Math.max(maxCombo, combo);
    } else {
      combo = 0;
    }
  }
  const accuracy = arr.length > 0 ? Math.round(((arr.filter((x) => (x?.points || 0) > 0).length) / arr.length) * 100) : 0;
  const rewardLotus = Math.max(20, Math.min(90, 20 + Math.round(totalScore / 18)));
  const rewardGems = accuracy >= 75 ? 6 : accuracy >= 50 ? 3 : 1;
  const xpGranted = Math.max(20, Math.min(60, 20 + chanhNiemCount * 5));

  nextProfile.lotusPoints += rewardLotus;
  nextProfile.gems += rewardGems;
  nextAct.bellRhythmBest = Math.max(nextAct.bellRhythmBest || 0, totalScore);
  nextAct = recordDailyMissionMetric(nextAct, 'dailyRhythmSessions', 1, dateKey);
  const xpRes = grantPlayerXp(nextAct, xpGranted);
  nextAct = xpRes.activity;

  return {
    ok: true,
    totalScore,
    accuracy,
    maxCombo,
    chanhNiemCount,
    rewardLotus,
    rewardGems,
    xpGranted,
    leveledUp: xpRes.leveledUp,
    rankInfo: xpRes.rankInfo,
    message: `Hoàn tất khóa Thỉnh Chuông (${accuracy}% chuẩn nhịp)! Nhận +${rewardLotus} 🪷 · +${rewardGems} 💎 · +${xpGranted} XP.`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

export const HERITAGE_RELICS = [
  {
    id: 'relic_tam_quan',
    name: 'Cổng Tam Quan Khảm Sành Sứ',
    era: 'Kiến trúc Á – Âu đầu TK XX',
    stationKey: 'cong_tam_quan',
    pos: { x: 23, z: 54 },
    desc: 'Nghệ thuật ghép mảnh chén đĩa gốm sứ cổ thành hoa văn long phụng, tứ linh đặc trưng Nam Bộ.',
    rewardLotus: 35,
    rewardXp: 25
  },
  {
    id: 'relic_adida',
    name: 'Đại Tượng Phật A Di Đà 24m',
    era: 'Khánh thành 2007',
    stationKey: 'phat_adida',
    pos: { x: 8.5, z: 17.5 },
    desc: 'Pho tượng đứng uy nghiêm cao 24m trên đài sen bên hoa viên Tây Nam hướng mặt về trục chính đón khách hành hương.',
    rewardLotus: 35,
    rewardXp: 25
  },
  {
    id: 'relic_dilac',
    name: 'Đại Tượng Phật Di Lặc 20m',
    era: 'Hoàn thành 2010',
    stationKey: 'phat_di_lac',
    pos: { x: -24.5, z: 12 },
    desc: 'Tượng Bồ Tát Di Lặc ngồi an nhiên nụ cười hoan hỷ, nặng khoảng 250 tấn giữa hoa viên xanh.',
    rewardLotus: 35,
    rewardXp: 25
  },
  {
    id: 'relic_niet_ban',
    name: 'Đại Tượng Phật Nhập Niết Bàn 32m',
    era: 'Khánh thành 2013',
    stationKey: 'phat_niet_ban',
    pos: { x: -24.5, z: -26 },
    desc: 'Pho tượng nằm dài 32m an tịnh phía sau bảo tháp, biểu trưng cảnh giới thanh lương giải thoát.',
    rewardLotus: 40,
    rewardXp: 30
  },
  {
    id: 'relic_quan_am',
    name: 'Đài Quán Thế Âm Nam Hải',
    era: 'Vườn Thiền Phía Đông',
    stationKey: 'chanh_dien',
    pos: { x: 32.8, z: 22.5 },
    desc: 'Tôn tượng Bồ Tát Quán Thế Âm cầm bình cam lồ trên đài sen bên hồ cá Koi thanh tịnh.',
    rewardLotus: 35,
    rewardXp: 25
  },
  {
    id: 'relic_bao_thap',
    name: 'Bảo Tháp Thất Phật Bảy Tầng',
    era: 'Khu Hậu Viên Phía Bắc',
    stationKey: 'bao_thap_that_phat',
    pos: { x: -8.0, z: -37.0 },
    desc: 'Ngọn bảo tháp 7 tầng mái cong vút uy nghiêm vươn lên giữa vườn cổ thụ Vĩnh Tràng.',
    rewardLotus: 40,
    rewardXp: 30
  },
  {
    id: 'relic_dai_hong_chung',
    name: 'Lầu Đại Hồng Chung',
    era: 'Phía Tây Nam Cổ Tự',
    stationKey: 'lau_tra_thien',
    pos: { x: -44.0, z: -56.0 },
    desc: 'Quả chuông đồng cổ khắc minh văn ngân vang mỗi sáng chiều nhắc người giữ tâm chánh niệm.',
    rewardLotus: 40,
    rewardXp: 30
  },
  {
    id: 'relic_long_tru',
    name: 'Cặp Long Trụ Rồng Cuốn Chánh Điện',
    era: 'Nội Điện Chữ Quốc (國)',
    stationKey: 'chanh_dien',
    pos: { x: 23, z: -9.8 },
    desc: 'Hai cột gỗ lim chạm rồng uốn lượn tinh xảo thếp vàng nâng đỡ mái hiên Tam Bảo.',
    rewardLotus: 45,
    rewardXp: 30
  },
  {
    id: 'relic_bat_bo_la_han',
    name: 'Thập Bát La Hán Gỗ Mít Trăm Tuổi',
    era: 'Nghệ nhân Nam Bộ 1907',
    stationKey: 'chanh_dien',
    pos: { x: 18, z: -9.8 },
    desc: 'Hệ tượng La Hán tạc nguyên khối từ gỗ mít già với thần thái sống động hiếm có.',
    rewardLotus: 45,
    rewardXp: 35
  },
  {
    id: 'relic_to_dat_ma',
    name: 'Tổ Đường · Tổ Sư Đạt Ma',
    era: 'Nhà Tổ Cổ Kính',
    stationKey: 'hau_to_nha_to',
    pos: { x: 23, z: -46.8 },
    desc: 'Không gian tôn thờ Chư Vị Tổ Sư khai sơn tạo tự qua bao thế hệ trụ trì.',
    rewardLotus: 45,
    rewardXp: 35
  }
];

export function discoverHeritageRelic(activityState, storeProfile, relicId, dateKey = getLocalDateKey()) {
  let nextAct = ensureDailyMissionDate(activityState, dateKey);
  const nextProfile = createStoreProfileState(storeProfile);
  const relic = HERITAGE_RELICS.find((r) => r.id === relicId);
  if (!relic) {
    return { ok: false, reason: 'not_found', message: 'Không tìm thấy di sản.', activity: nextAct, storeProfile: nextProfile };
  }
  const existing = Array.isArray(nextAct.heritageRelics) ? nextAct.heritageRelics : [];
  if (existing.includes(relicId)) {
    return {
      ok: true,
      alreadyDiscovered: true,
      relic,
      message: `Di sản "${relic.name}" đã có dấu ấn trong Sổ Di Sản của cô bác.`,
      activity: nextAct,
      storeProfile: nextProfile
    };
  }
  nextAct.heritageRelics = [...existing, relicId];
  nextAct = recordDailyMissionMetric(nextAct, 'dailyRelicsFound', 1, dateKey);
  nextProfile.lotusPoints += relic.rewardLotus;
  const xpRes = grantPlayerXp(nextAct, relic.rewardXp);
  nextAct = xpRes.activity;

  return {
    ok: true,
    alreadyDiscovered: false,
    relic,
    rewardLotus: relic.rewardLotus,
    xpGranted: relic.rewardXp,
    leveledUp: xpRes.leveledUp,
    rankInfo: xpRes.rankInfo,
    discoveredCount: nextAct.heritageRelics.length,
    totalCount: HERITAGE_RELICS.length,
    message: `Đóng dấu Di Sản "${relic.name}"! Nhận +${relic.rewardLotus} 🪷 · +${relic.rewardXp} XP.`,
    activity: nextAct,
    storeProfile: nextProfile
  };
}

// ============================================================================
// 2. NATIONALITY & PILGRIMAGE PURPOSE / COMPANION MODE
// ============================================================================
export const NATIONALITY_PROFILES = [
  {
    id: 'vn',
    name: 'Việt Nam — Hành hương Bản xứ',
    flag: '🇻🇳',
    greeting: 'A Di Đà Phật! Kính chào quý Phật tử phương Nam ghé thăm Chùa Vĩnh Tràng Mỹ Tho.',
    accentHex: '#B84518',
    badgeLabel: 'Hành hương Bản xứ',
    preferredCharKey: 'nu'
  },
  {
    id: 'jp',
    name: 'Nhật Bản — Thiền tông & Trà đạo',
    flag: '🇯🇵',
    greeting: 'Gassho! Chào mừng hành giả Nhật Bản đến thưởng trà thiền và tịnh tâm tại cổ tự Vĩnh Tràng.',
    accentHex: '#2F6F5E',
    badgeLabel: 'Thiền tông · Trà đạo',
    preferredCharKey: 'nu_ao_lam'
  },
  {
    id: 'kr',
    name: 'Hàn Quốc — Hoa Nghiêm Tịnh Độ',
    flag: '🇰🇷',
    greeting: 'Seongbul-haseyo! Kính đón Phật tử Hàn Quốc cùng lễ Tam Bảo và chiêm bái Bảo Tháp 7 tầng.',
    accentHex: '#3B679E',
    badgeLabel: 'Hoa Nghiêm · Tịnh Độ',
    preferredCharKey: 'nam'
  },
  {
    id: 'tw',
    name: 'Đài Loan / Hoa Ngữ — Từ Tế Công Đức',
    flag: '🇹🇼',
    greeting: 'O-mi-tô-phật! Hoan hỷ đón quý thiện tín Đài Loan & Hoa ngữ về nguồn kết duyên công đức.',
    accentHex: '#9C5C24',
    badgeLabel: 'Từ Tế · Công Đức',
    preferredCharKey: 'nam_ao_nau'
  },
  {
    id: 'th',
    name: 'Thái Lan — Theravada Chánh Niệm',
    flag: '🇹🇭',
    greeting: 'Sawadee & Namo Buddhaya! Kính mời hành giả Thái Lan dạo bước chánh niệm dưới cội Bồ Đề Lâm Tỳ Ni.',
    accentHex: '#C9962E',
    badgeLabel: 'Theravada · Chánh Niệm',
    preferredCharKey: 'su_thay'
  },
  {
    id: 'intl',
    name: 'Quốc tế — Du khách Khám phá Di sản',
    flag: '🌍',
    greeting: 'Welcome to Vĩnh Tràng Pagoda! Khám phá di sản kiến trúc Á – Âu gần 200 năm tuổi tại Mỹ Tho.',
    accentHex: '#5C381F',
    badgeLabel: 'Di sản Á – Âu',
    preferredCharKey: 'du_khach'
  }
];

export function getNationalityProfile(nationalityId = 'vn') {
  return NATIONALITY_PROFILES.find((n) => n.id === nationalityId) || NATIONALITY_PROFILES[0];
}

export const PILGRIMAGE_MODES = [
  {
    id: 'solo',
    name: 'Đi một mình — Tĩnh tâm vãng cảnh',
    desc: 'Một mình thong dong dạo sân gạch, lắng nghe tiếng chuông ngân và thực tập chánh niệm sâu.',
    arrivalVehicle: 'sedan',
    companions: []
  },
  {
    id: 'family_3gen',
    name: 'Gia đình 3 thế hệ — Đạo Hiếu sum vầy',
    desc: 'Cùng Bà/Mẹ và Bé An đi xe gia đình về chùa thắp hương cầu bình an, nuôi dưỡng đạo hiếu cho con trẻ.',
    arrivalVehicle: 'van',
    companions: [
      {
        charKey: 'nu_ao_lam',
        roleLabel: 'Bà / Mẹ hiền',
        tint: '#9A8F99',
        hat: 'non_la_theu_sen',
        bag: 'tui_vai_theu_sen',
        offset: { x: -1.65, z: 1.1 }
      },
      {
        charKey: 'tre_em',
        roleLabel: 'Bé An (Cháu ngoan)',
        tint: '#8B9BB4',
        hat: null,
        bag: null,
        offset: { x: 1.45, z: 0.9 }
      }
    ]
  },
  {
    id: 'tour_group',
    name: 'Đoàn hành hương — Xe khách 45 chỗ & Hướng dẫn viên bản tự',
    desc: 'Đi theo đoàn hành hương thập phương với xe 45 chỗ, nghe thuyết minh lịch sử Chùa Vĩnh Tràng 1849.',
    arrivalVehicle: 'bus',
    companions: [
      {
        charKey: 'su_thay',
        roleLabel: 'Hướng dẫn viên bản tự',
        tint: '#D9A441',
        hat: null,
        bag: null,
        offset: { x: 1.9, z: -0.9 }
      },
      {
        charKey: 'nam_ao_nau',
        roleLabel: 'Trưởng đoàn Phật tử',
        tint: '#7A543E',
        hat: 'non_la_theu_sen',
        bag: 'tui_vai_theu_sen',
        offset: { x: -1.9, z: 1.2 }
      },
      {
        charKey: 'nu',
        roleLabel: 'Đồng tu trong đoàn',
        tint: '#9A8F99',
        hat: null,
        bag: 'tui_vai_theu_sen',
        offset: { x: 2.1, z: 1.4 }
      }
    ]
  },
  {
    id: 'explorer',
    name: 'Khách tham quan văn hóa — Khám phá kiến trúc Á-Âu',
    desc: 'Hành trình du khảo tìm hiểu 13 vòm cửa Á – Âu, Thập Bát La Hán gỗ mít 1907 và 3 pho đại tượng.',
    arrivalVehicle: 'sedan',
    companions: [
      {
        charKey: 'du_khach',
        roleLabel: 'Bạn đồng hành văn hóa',
        tint: '#4E86A8',
        hat: null,
        bag: 'tui_vai_theu_sen',
        offset: { x: -1.6, z: 0.85 }
      }
    ]
  }
];

export function getPilgrimageMode(modeId = 'solo') {
  return PILGRIMAGE_MODES.find((m) => m.id === modeId) || PILGRIMAGE_MODES[0];
}

// ============================================================================
// 3. 30-DAY NON-BORING SPIRITUAL LOOP (Journey Plan, Lunar Calendar,
//    Hoa Dang Lanterns & Dharma Journal)
// ============================================================================
export const THIRTY_DAY_RETREATS = [
  {
    id: 'week_1',
    week: 1,
    dayRange: [1, 7],
    title: 'Tuần 1: Gieo Duyên Tam Bảo',
    subtitle: 'Ngày 1–7 · Quay về nương tựa Phật – Pháp – Tăng giữa không gian cổ tự miền Tây'
  },
  {
    id: 'week_2',
    week: 2,
    dayRange: [8, 14],
    title: 'Tuần 2: Sống An Giữa Đời',
    subtitle: 'Ngày 8–14 · Giữ chánh niệm trong hơi thở, tách trà và từng bước chân đi đứng'
  },
  {
    id: 'week_3',
    week: 3,
    dayRange: [15, 21],
    title: 'Tuần 3: Từ Bi & Hiếu Hạnh',
    subtitle: 'Ngày 15–21 · Nuôi dưỡng lòng biết ơn cha mẹ, nói lời hòa ái và sẻ chia công đức'
  },
  {
    id: 'week_4',
    week: 4,
    dayRange: [22, 30],
    title: 'Tuần 4: Trí Tuệ & Viên Mãn',
    subtitle: 'Ngày 22–30 · Quán chiếu vô thường, chuyển hóa phiền não và hồi hướng viên mãn'
  }
];

export const THIRTY_DAY_JOURNEY_PLAN = [
  // Tuần 1: Gieo Duyên Tam Bảo (Ngày 1-7)
  {
    day: 1,
    week: 1,
    retreatId: 'week_1',
    retreatTitle: 'Tuần 1: Gieo Duyên Tam Bảo',
    title: 'Bước qua Cổng Tam Quan bằng bước chân thong thả',
    prompt: 'Sáng nay mình tạm gác bộn bề ngoài kia, qua Cổng Phụ Tịnh Độ với một nụ cười nhẹ và ba hơi thở êm.',
    suggestedStation: 'cong_tam_quan',
    rewardLotus: 35,
    rewardGems: 2,
    rewardXp: 25,
    milestoneBadge: null
  },
  {
    day: 2,
    week: 1,
    retreatId: 'week_1',
    retreatTitle: 'Tuần 1: Gieo Duyên Tam Bảo',
    title: 'Ba nén tâm hương trước mặt tiền 13 vòm',
    prompt: 'Khi phẩy nhẹ cho tắt ngọn lửa nơi đầu nhang, mình thầm gửi một lời chúc bình an cho cả nhà.',
    suggestedStation: 'lu_huong_san',
    rewardLotus: 35,
    rewardGems: 2,
    rewardXp: 25,
    milestoneBadge: null
  },
  {
    day: 3,
    week: 1,
    retreatId: 'week_1',
    retreatTitle: 'Tuần 1: Gieo Duyên Tam Bảo',
    title: 'Tam Bái tại Chánh điện Chữ Quốc',
    prompt: 'Cúi đầu lạy ba lạy giữa mùi gỗ mít và hương trầm thoang thoảng, nhắc lòng nhớ ơn Phật, Pháp, Tăng.',
    suggestedStation: 'chanh_dien',
    rewardLotus: 40,
    rewardGems: 3,
    rewardXp: 30,
    milestoneBadge: null
  },
  {
    day: 4,
    week: 1,
    retreatId: 'week_1',
    retreatTitle: 'Tuần 1: Gieo Duyên Tam Bảo',
    title: 'Lắng nghe bài pháp ngắn nơi Giảng đường gỗ',
    prompt: 'Dành 10 phút yên ả ở Giảng đường phía Đông, đọc chậm một đoạn sách như uống ngụm nước dừa mát.',
    suggestedStation: 'giang_duong',
    rewardLotus: 40,
    rewardGems: 3,
    rewardXp: 30,
    milestoneBadge: null
  },
  {
    day: 5,
    week: 1,
    retreatId: 'week_1',
    retreatTitle: 'Tuần 1: Gieo Duyên Tam Bảo',
    title: 'Đóa sen hồng bên Hồ Cá Koi',
    prompt: 'Nhìn bầy cá Koi bơi khoan thai dưới tán lá súng, thấy lòng mình cũng rộng mở và dịu lại.',
    suggestedStation: 'ho_sen_ca_koi',
    rewardLotus: 45,
    rewardGems: 3,
    rewardXp: 30,
    milestoneBadge: null
  },
  {
    day: 6,
    week: 1,
    retreatId: 'week_1',
    retreatTitle: 'Tuần 1: Gieo Duyên Tam Bảo',
    title: 'Ngước nhìn Đức Phật A Di Đà giữa nắng mai',
    prompt: 'Đứng dưới đài sen cao 25m, lần nhẹ 21 hạt chuỗi niệm danh hiệu A Di Đà cho nhịp thở đều đặn.',
    suggestedStation: 'phat_adida',
    rewardLotus: 50,
    rewardGems: 4,
    rewardXp: 35,
    milestoneBadge: null
  },
  {
    day: 7,
    week: 1,
    retreatId: 'week_1',
    retreatTitle: 'Tuần 1: Gieo Duyên Tam Bảo',
    title: 'Tròn 7 ngày sơ tâm — Hoa sen đầu mùa nở rộ',
    prompt: 'Hoàn tất tuần đầu tiên gieo duyên Tam Bảo: giữ một lời hứa nhỏ sống hiền hòa suốt tuần mới.',
    suggestedStation: 'chanh_dien',
    rewardLotus: 80,
    rewardGems: 8,
    rewardXp: 55,
    milestoneBadge: 'Ấn Ký Tuần 1 · Sơ Tâm Thanh Tịnh'
  },

  // Tuần 2: Sống An Giữa Đời (Ngày 8-14)
  {
    day: 8,
    week: 2,
    retreatId: 'week_2',
    retreatTitle: 'Tuần 2: Sống An Giữa Đời',
    title: 'Quét lá Bồ Đề sân gạch buổi sớm',
    prompt: 'Quét sạch một góc sân chùa cũng là quét nhẹ bụi lo toan bám víu trong tâm trí từ hôm qua.',
    suggestedStation: 'vuon_lam_ty_ni',
    rewardLotus: 40,
    rewardGems: 3,
    rewardXp: 30,
    milestoneBadge: null
  },
  {
    day: 9,
    week: 2,
    retreatId: 'week_2',
    retreatTitle: 'Tuần 2: Sống An Giữa Đời',
    title: 'Chén trà sen ấm tại Lầu Trà Thiền',
    prompt: 'Nâng chén trà bằng hai tay, nghe mùi hương sen quyện gió sông Tiền mà không vội xem điện thoại.',
    suggestedStation: 'lau_tra_thien',
    rewardLotus: 45,
    rewardGems: 3,
    rewardXp: 30,
    milestoneBadge: null
  },
  {
    day: 10,
    week: 2,
    retreatId: 'week_2',
    retreatTitle: 'Tuần 2: Sống An Giữa Đời',
    title: 'Buông hai chiếc va-li quá khứ và tương lai',
    prompt: 'Ngồi yên trên bồ đoàn theo lời Thiền sư Ajahn Brahm: đặt hết chuyện cũ và nỗi lo mai xuống đất.',
    suggestedStation: 'giang_duong',
    rewardLotus: 45,
    rewardGems: 3,
    rewardXp: 35,
    milestoneBadge: null
  },
  {
    day: 11,
    week: 2,
    retreatId: 'week_2',
    retreatTitle: 'Tuần 2: Sống An Giữa Đời',
    title: 'Một tiếng Đại Hồng Chung lắng dịu',
    prompt: 'Thỉnh một hồi chuông chậm rãi nơi lầu Tây Bắc, nghe dư âm ngân dài cho tới khi tâm hoàn toàn tĩnh lặng.',
    suggestedStation: 'thap_chuong_dai_hong',
    rewardLotus: 50,
    rewardGems: 4,
    rewardXp: 35,
    milestoneBadge: null
  },
  {
    day: 12,
    week: 2,
    retreatId: 'week_2',
    retreatTitle: 'Tuần 2: Sống An Giữa Đời',
    title: 'Bữa cơm chay thanh đạm bên Nhà Sàn Gỗ',
    prompt: 'Biết ơn hạt gạo đồng bằng sông Cửu Long, ăn chậm nhai kỹ để thấy đủ đầy trong từng miếng cơm chay.',
    suggestedStation: 'nha_san_trai_duong',
    rewardLotus: 50,
    rewardGems: 4,
    rewardXp: 35,
    milestoneBadge: null
  },
  {
    day: 13,
    week: 2,
    retreatId: 'week_2',
    retreatTitle: 'Tuần 2: Sống An Giữa Đời',
    title: 'Chăm luống hoa vườn Lâm Tỳ Ni',
    prompt: 'Tưới nước cho gốc Bồ Đề non và cây Sa La, học cách kiên nhẫn chờ hạt lành nảy mầm từng ngày.',
    suggestedStation: 'vuon_lam_ty_ni',
    rewardLotus: 55,
    rewardGems: 4,
    rewardXp: 40,
    milestoneBadge: null
  },
  {
    day: 14,
    week: 2,
    retreatId: 'week_2',
    retreatTitle: 'Tuần 2: Sống An Giữa Đời',
    title: 'Tròn 14 ngày An Trú — Tâm như mặt hồ phẳng lặng',
    prompt: 'Hai tuần giữ nhịp sống chậm: ghi lại vào Nhật Ký An Tâm một thay đổi nhỏ khiến mình thấy nhẹ lòng nhất.',
    suggestedStation: 'ho_phong_sinh',
    rewardLotus: 90,
    rewardGems: 9,
    rewardXp: 60,
    milestoneBadge: 'Ấn Ký Tuần 2 · An Trú Hiện Tại'
  },

  // Tuần 3: Từ Bi & Hiếu Hạnh (Ngày 15-21)
  {
    day: 15,
    week: 3,
    retreatId: 'week_3',
    retreatTitle: 'Tuần 3: Từ Bi & Hiếu Hạnh',
    title: 'Gọi về hỏi thăm cha mẹ đầu buổi sáng',
    prompt: 'Cha mẹ là hai vị Phật tại gia. Hôm nay mình nói một câu dịu dàng hoặc pha cho người thân ly trà ấm.',
    suggestedStation: 'hau_to_nha_to',
    rewardLotus: 50,
    rewardGems: 4,
    rewardXp: 35,
    milestoneBadge: null
  },
  {
    day: 16,
    week: 3,
    retreatId: 'week_3',
    retreatTitle: 'Tuần 3: Từ Bi & Hiếu Hạnh',
    title: 'Học nụ cười hoan hỷ của Đức Phật Di Lặc',
    prompt: 'Đứng trước tượng Di Lặc 20m, tập mở rộng lòng bao dung để bỏ qua một chuyện lặt vặt làm mình bực bội.',
    suggestedStation: 'phat_di_lac',
    rewardLotus: 50,
    rewardGems: 4,
    rewardXp: 35,
    milestoneBadge: null
  },
  {
    day: 17,
    week: 3,
    retreatId: 'week_3',
    retreatTitle: 'Tuần 3: Từ Bi & Hiếu Hạnh',
    title: 'Lắng nghe sâu trước Động Quán Thế Âm',
    prompt: 'Nghe tiếng thác nước non bộ đổ xuống hồ xanh, tập lắng nghe người thân nói hết câu mà không vội cãi lại.',
    suggestedStation: 'non_bo_quan_am',
    rewardLotus: 55,
    rewardGems: 4,
    rewardXp: 40,
    milestoneBadge: null
  },
  {
    day: 18,
    week: 3,
    retreatId: 'week_3',
    retreatTitle: 'Tuần 3: Từ Bi & Hiếu Hạnh',
    title: 'Thả đèn hoa đăng cầu bình an cho người thương',
    prompt: 'Viết một lời chúc hiền hòa lên đèn hoa đăng thả trôi trên mặt hồ sen lung linh.',
    suggestedStation: 'ho_sen_ca_koi',
    rewardLotus: 55,
    rewardGems: 5,
    rewardXp: 40,
    milestoneBadge: null
  },
  {
    day: 19,
    week: 3,
    retreatId: 'week_3',
    retreatTitle: 'Tuần 3: Từ Bi & Hiếu Hạnh',
    title: 'Tùy hỷ niềm vui của đồng tu phương xa',
    prompt: 'Ghé xem ảnh lưu niệm của cô bác thập phương và gửi một lời chúc hoan hỷ chân thành.',
    suggestedStation: 'cua_hang_luu_niem',
    rewardLotus: 55,
    rewardGems: 5,
    rewardXp: 40,
    milestoneBadge: null
  },
  {
    day: 20,
    week: 3,
    retreatId: 'week_3',
    retreatTitle: 'Tuần 3: Từ Bi & Hiếu Hạnh',
    title: 'Bước qua cầu gỗ chữ Z bên Hồ Phóng Sinh',
    prompt: 'Gieo một nhân lành phóng thích chấp niệm và bảo vệ sự sống quanh mình dù chỉ từ việc nhỏ nhất.',
    suggestedStation: 'ho_phong_sinh',
    rewardLotus: 60,
    rewardGems: 5,
    rewardXp: 45,
    milestoneBadge: null
  },
  {
    day: 21,
    week: 3,
    retreatId: 'week_3',
    retreatTitle: 'Tuần 3: Từ Bi & Hiếu Hạnh',
    title: 'Tròn 21 ngày Bi Mẫn — Ái ngữ sưởi ấm gia đình',
    prompt: 'Ba tuần tu dưỡng tâm từ: đêm nay trước khi ngủ rải tâm từ cầu mọi người ngủ ngon giấc lành.',
    suggestedStation: 'phat_di_lac',
    rewardLotus: 100,
    rewardGems: 10,
    rewardXp: 65,
    milestoneBadge: 'Ấn Ký Tuần 3 · Đạo Hiếu & Tâm Từ'
  },

  // Tuần 4: Trí Tuệ & Viên Mãn (Ngày 22-30)
  {
    day: 22,
    week: 4,
    retreatId: 'week_4',
    retreatTitle: 'Tuần 4: Trí Tuệ & Viên Mãn',
    title: 'Chiêm bái Thập Bát La Hán gỗ mít 1907',
    prompt: 'Nhìn 18 vị La Hán uy nghi mà nhận ra kẻ thù lớn nhất cần hàng phục chính là sự nóng nảy trong lòng mình.',
    suggestedStation: 'chanh_dien',
    rewardLotus: 60,
    rewardGems: 5,
    rewardXp: 45,
    milestoneBadge: null
  },
  {
    day: 23,
    week: 4,
    retreatId: 'week_4',
    retreatTitle: 'Tuần 4: Trí Tuệ & Viên Mãn',
    title: 'Đọc một tích truyện Kinh Pháp Cú',
    prompt: 'Nhắc mình câu kệ "Ý dẫn đầu các pháp, ý làm chủ, ý tạo" trước khi bắt đầu công việc trong ngày.',
    suggestedStation: 'giang_duong',
    rewardLotus: 60,
    rewardGems: 5,
    rewardXp: 45,
    milestoneBadge: null
  },
  {
    day: 24,
    week: 4,
    retreatId: 'week_4',
    retreatTitle: 'Tuần 4: Trí Tuệ & Viên Mãn',
    title: 'Tìm hiểu hai dòng tư liệu cổ tự tại Chánh điện',
    prompt: 'Đối chiếu sử liệu bằng tâm cởi mở, tôn trọng lịch sử và công đức tiền nhân dựng chùa từ năm 1849.',
    suggestedStation: 'chanh_dien',
    rewardLotus: 65,
    rewardGems: 5,
    rewardXp: 50,
    milestoneBadge: null
  },
  {
    day: 25,
    week: 4,
    retreatId: 'week_4',
    retreatTitle: 'Tuần 4: Trí Tuệ & Viên Mãn',
    title: 'Quán chiếu Duyên Khởi dưới Sân Thiên Tỉnh',
    prompt: 'Nhìn ánh nắng giếng trời chiếu xuống hòn non bộ: mọi sự đều nương nhau mà có, nhờ vậy mà biết trân quý nhau hơn.',
    suggestedStation: 'vuon_la_han_ngoai',
    rewardLotus: 65,
    rewardGems: 6,
    rewardXp: 50,
    milestoneBadge: null
  },
  {
    day: 26,
    week: 4,
    retreatId: 'week_4',
    retreatTitle: 'Tuần 4: Trí Tuệ & Viên Mãn',
    title: 'Trọn một vòng chuỗi 108 hạt chuyển hóa phiền não',
    prompt: 'Mỗi hạt qua tay là một lần buông nhẹ sân si, đố kỵ; giữ miệng niệm rõ, tai nghe rõ, tâm an định.',
    suggestedStation: 'phat_adida',
    rewardLotus: 70,
    rewardGems: 6,
    rewardXp: 55,
    milestoneBadge: null
  },
  {
    day: 27,
    week: 4,
    retreatId: 'week_4',
    retreatTitle: 'Tuần 4: Trí Tuệ & Viên Mãn',
    title: 'Tĩnh lặng bên Tượng Phật Nhập Niết Bàn 32m',
    prompt: 'Học hạnh tri túc và an nhiên trước quy luật vô thường của đời người như ngọn gió mát sau vườn chùa.',
    suggestedStation: 'phat_niet_ban',
    rewardLotus: 75,
    rewardGems: 7,
    rewardXp: 55,
    milestoneBadge: null
  },
  {
    day: 28,
    week: 4,
    retreatId: 'week_4',
    retreatTitle: 'Tuần 4: Trí Tuệ & Viên Mãn',
    title: 'Chiêm ngưỡng Bảo Tháp Thất Phật 7 tầng',
    prompt: 'Mỗi tầng tháp nhắc một bước trưởng thành trong Giới – Định – Tuệ suốt gần một tháng kiên trì tu tập.',
    suggestedStation: 'bao_thap_that_phat',
    rewardLotus: 80,
    rewardGems: 8,
    rewardXp: 60,
    milestoneBadge: null
  },
  {
    day: 29,
    week: 4,
    retreatId: 'week_4',
    retreatTitle: 'Tuần 4: Trí Tuệ & Viên Mãn',
    title: 'Tổng kết Sổ Di Sản & Nhật Ký An Tâm',
    prompt: 'Lật xem lại 29 ngày đã qua, gửi lời tri ân chính mình vì đã giữ lòng hướng thiện mỗi ngày.',
    suggestedStation: 'hau_to_nha_to',
    rewardLotus: 90,
    rewardGems: 9,
    rewardXp: 65,
    milestoneBadge: null
  },
  {
    day: 30,
    week: 4,
    retreatId: 'week_4',
    retreatTitle: 'Tuần 4: Trí Tuệ & Viên Mãn',
    title: 'Ngày 30 Viên Mãn — Hồi Hướng Công Đức Khắp Mười Phương',
    prompt: 'Nguyện đem hết thảy công đức 30 ngày tu học này hồi hướng cho ông bà cha mẹ hiện tiền an lạc và muôn loài bình an.',
    suggestedStation: 'phat_niet_ban',
    rewardLotus: 150,
    rewardGems: 15,
    rewardXp: 100,
    milestoneBadge: 'Ấn Ký Viên Mãn 30 Ngày · Liên Hoa Trí Tuệ'
  }
];

export function getThirtyDayTheme(dayNumber = 1) {
  const safeDay = Math.max(1, Math.min(30, Math.round(Number(dayNumber || 1))));
  return THIRTY_DAY_JOURNEY_PLAN.find((d) => d.day === safeDay) || THIRTY_DAY_JOURNEY_PLAN[0];
}

export const LUNAR_FESTIVAL_CALENDAR = [
  {
    id: 'mung_1_soc_vong',
    name: 'Mùng 1 Sóc Vọng — Đầu Tháng Thanh Tịnh',
    lunarDates: ['01/*'],
    greeting: 'Mùng 1 Sóc Vọng hoan hỷ! Thắp nén tâm hương đầu tháng cầu gia đạo bình an, công việc hanh thông.',
    xpMultiplier: 1.3,
    lotusBonus: 30,
    blessingWish: 'Đầu tháng tâm sáng như sen mới nở.',
    accentHex: '#B84518'
  },
  {
    id: 'ram_vong_nguyet',
    name: 'Rằm Vọng Nguyệt — Thả Hoa Đăng Nguyện Ước',
    lunarDates: ['15/*'],
    greeting: 'Trăng rằm Vọng Nguyệt sáng tỏ sân Chùa Vĩnh Tràng! Mời cô bác thả hoa đăng và nghe kinh cầu an.',
    xpMultiplier: 1.4,
    lotusBonus: 45,
    blessingWish: 'Ánh trăng rằm soi dịu mọi ưu tư.',
    accentHex: '#C9962E'
  },
  {
    id: 'via_quan_the_am',
    name: 'Ngày Vía Bồ Tát Quán Thế Âm (19/2 · 19/6 · 19/9 ÂL)',
    lunarDates: ['19/02', '19/06', '19/09'],
    greeting: 'Nam Mô Đại Bi Quán Thế Âm Bồ Tát! Hôm nay ngày vía Quán Âm, nguyện giữ lời ái ngữ và tâm từ bi.',
    xpMultiplier: 1.4,
    lotusBonus: 50,
    blessingWish: 'Tâm từ lắng nghe, bình cam lồ tưới mát gia đình.',
    accentHex: '#2F6F5E'
  },
  {
    id: 'phat_dan',
    name: 'Đại Lễ Phật Đản (Vesak · Rằm Tháng Tư ÂL)',
    lunarDates: ['08/04', '15/04'],
    greeting: 'Kính mừng Đại Lễ Phật Đản! Vườn Lâm Tỳ Ni Chùa Vĩnh Tràng rực rỡ cờ hoa đón mừng Đấng Từ Phụ đản sanh.',
    xpMultiplier: 1.5,
    lotusBonus: 80,
    blessingWish: 'Ánh sáng Từ Bi và Trí Tuệ soi rọi khắp muôn phương.',
    accentHex: '#D9A441'
  },
  {
    id: 'vu_lan_bao_hieu',
    name: 'Đại Lễ Vu Lan Báo Hiếu (Rằm Tháng Bảy ÂL)',
    lunarDates: ['15/07'],
    greeting: 'Mùa Vu Lan Báo Hiếu thiêng liêng! Cài hoa hồng lên áo, cầu nguyện song thân khỏe mạnh bình an.',
    xpMultiplier: 1.5,
    lotusBonus: 80,
    blessingWish: 'Tâm hiếu là tâm Phật, hạnh hiếu là hạnh Phật.',
    accentHex: '#C94B77'
  }
];

function estimateLunarDayAndMonth(dateObj) {
  const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
  const utcMs = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
  // Reference New Moon: 2026-01-18T19:52Z (approx synodic cycle 29.53058867 days)
  const refNewMoonMs = Date.UTC(2026, 0, 18, 19, 52, 0);
  const synodicMs = 29.53058867 * 86400000;
  const elapsed = utcMs - refNewMoonMs;
  const cycles = Math.floor(elapsed / synodicMs);
  const phaseDays = (elapsed - cycles * synodicMs) / 86400000;
  const lunarDay = Math.max(1, Math.min(30, Math.floor(phaseDays) + 1));
  // Approximate lunar month (~1 month offset from solar calendar in Vietnam)
  const solarMonth = d.getMonth() + 1;
  const approxShift = d.getDate() < 18 ? 2 : 1;
  const lunarMonth = ((solarMonth - approxShift + 11) % 12) + 1;
  return { lunarDay, lunarMonth };
}

export function getTempleSeasonalContext(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const dateKey = getLocalDateKey(d);
  const { lunarDay, lunarMonth } = estimateLunarDayAndMonth(d);

  let activeFestival = null;
  if (lunarMonth === 4 && (lunarDay === 8 || lunarDay === 15)) {
    activeFestival = LUNAR_FESTIVAL_CALENDAR.find((f) => f.id === 'phat_dan');
  } else if (lunarMonth === 7 && lunarDay === 15) {
    activeFestival = LUNAR_FESTIVAL_CALENDAR.find((f) => f.id === 'vu_lan_bao_hieu');
  } else if ([2, 6, 9].includes(lunarMonth) && lunarDay === 19) {
    activeFestival = LUNAR_FESTIVAL_CALENDAR.find((f) => f.id === 'via_quan_the_am');
  } else if (lunarDay === 15) {
    activeFestival = LUNAR_FESTIVAL_CALENDAR.find((f) => f.id === 'ram_vong_nguyet');
  } else if (lunarDay === 1) {
    activeFestival = LUNAR_FESTIVAL_CALENDAR.find((f) => f.id === 'mung_1_soc_vong');
  }

  const daySeed = d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();
  const baseResonance = 136 + (daySeed % 95);
  const festivalBoost = activeFestival ? 140 : 0;
  const xpMultiplier = activeFestival ? activeFestival.xpMultiplier : 1.2;

  return {
    dateKey,
    lunarDay,
    lunarMonth,
    lunarLabel: `Mùng ${lunarDay} tháng ${lunarMonth} ÂL (ước lượng)`,
    isFestivalDay: Boolean(activeFestival),
    activeFestival,
    greeting: activeFestival
      ? activeFestival.greeting
      : `Đạo tràng Chùa Vĩnh Tràng hôm nay thanh tịnh (Mùng ${lunarDay} tháng ${lunarMonth} ÂL). Chúc cô bác thân tâm an lạc · Cộng hưởng tu học ${xpMultiplier}x XP.`,
    xpMultiplier,
    resonanceCount: baseResonance + festivalBoost,
    lanternCountHint: activeFestival ? 24 : 10
  };
}

export const HOA_DANG_WISHES = [
  {
    id: 'hd_seed_1',
    authorName: 'Cô Sáu Mỹ Tho',
    nationalityId: 'vn',
    wishText: 'Cầu cho hai bác mạnh khỏe, con cháu thuận hòa hiếu thảo.',
    colorHex: '#F79D65',
    createdAt: 'Sáng nay · Hồ Sen Vĩnh Tràng',
    pondCoord: { x: 1.8, z: 31.4 }
  },
  {
    id: 'hd_seed_2',
    authorName: 'Anh Minh Trí (Sài Gòn)',
    nationalityId: 'vn',
    wishText: 'Nguyện tâm luôn bình tĩnh sáng suốt giữa công việc bận rộn.',
    colorHex: '#F4C95D',
    createdAt: 'Sáng nay · Hồ Sen Vĩnh Tràng',
    pondCoord: { x: 4.5, z: 34.2 }
  },
  {
    id: 'hd_seed_3',
    authorName: 'Yuki Tanaka',
    nationalityId: 'jp',
    wishText: 'May peace and mindfulness bloom gently like lotus flowers at Vinh Trang.',
    colorHex: '#EE7FAE',
    createdAt: 'Hôm qua · Hồ Phóng Sinh',
    pondCoord: { x: -14.8, z: -54.2 }
  },
  {
    id: 'hd_seed_4',
    authorName: 'Chị Ngọc Hân (Bến Tre)',
    nationalityId: 'vn',
    wishText: 'Hồi hướng công đức đến cửu huyền thất tổ và người thân phương xa.',
    colorHex: '#FF9EBB',
    createdAt: 'Hôm qua · Hồ Sen Vĩnh Tràng',
    pondCoord: { x: 2.9, z: 35.1 }
  },
  {
    id: 'hd_seed_5',
    authorName: 'Ji-hoon Park',
    nationalityId: 'kr',
    wishText: 'Cầu an lành đến muôn loài, cảm ơn vẻ đẹp cổ tự miền Tây.',
    colorHex: '#A8DADC',
    createdAt: '2 ngày trước · Hồ Phóng Sinh',
    pondCoord: { x: -17.2, z: -57.1 }
  },
  {
    id: 'hd_seed_6',
    authorName: 'Bé An & Gia đình',
    nationalityId: 'vn',
    wishText: 'Con chúc ông bà sống lâu trăm tuổi và luôn cười tươi như Phật Di Lặc.',
    colorHex: '#F9B572',
    createdAt: '2 ngày trước · Hồ Sen Vĩnh Tràng',
    pondCoord: { x: 5.1, z: 31.9 }
  }
];

export function createHoaDangLantern(
  wishes = HOA_DANG_WISHES,
  { authorName = 'Phật tử thập phương', nationalityId = 'vn', wishText = '', colorHex = '#F79D65' } = {}
) {
  const list = Array.isArray(wishes) ? [...wishes] : [...HOA_DANG_WISHES];
  const cleanAuthor = String(authorName || '').trim() || 'Phật tử thập phương';
  const cleanNat = NATIONALITY_PROFILES.some((n) => n.id === nationalityId) ? nationalityId : 'vn';
  const cleanWish =
    String(wishText || '').trim() || 'Nguyện cầu gia đình bình an, thân tâm thường an lạc.';
  const cleanColor = /^#[0-9A-Fa-f]{6}$/.test(String(colorHex || '').trim())
    ? String(colorHex).trim().toUpperCase()
    : '#F79D65';

  const idx = list.length;
  const angle = (idx * 2.39996) % (Math.PI * 2);
  const radius = 1.4 + (idx % 4) * 0.65;
  const lantern = {
    id: `hd_${Date.now()}_${idx + 1}`,
    authorName: cleanAuthor,
    nationalityId: cleanNat,
    wishText: cleanWish,
    colorHex: cleanColor,
    createdAt: 'Vừa thả · Hồ Sen Chùa Vĩnh Tràng',
    pondCoord: {
      x: Number((3.5 + Math.cos(angle) * radius).toFixed(2)),
      z: Number((33.0 + Math.sin(angle) * radius).toFixed(2))
    }
  };

  const nextWishes = [lantern, ...list];
  return {
    ok: true,
    lantern,
    wishes: nextWishes,
    totalCount: nextWishes.length,
    message: `Đã thả hoa đăng nguyện ước của ${cleanAuthor} lên Hồ Sen Vĩnh Tràng.`
  };
}

export const DHARMA_JOURNAL_MOODS = [
  { id: 'binh_an', label: 'Bình an', icon: '🪷' },
  { id: 'biet_on', label: 'Biết ơn', icon: '🙏' },
  { id: 'thanh_thoi', label: 'Thảnh thơi', icon: '🌿' },
  { id: 'tinh_tuc', label: 'Tỉnh thức', icon: '🔔' },
  { id: 'hoan_hy', label: 'Hoan hỷ', icon: '☀️' }
];

export const DHARMA_JOURNAL = {
  moods: DHARMA_JOURNAL_MOODS,
  entries: [
    {
      id: 'journal_seed_1',
      text: 'Sáng nay nghe tiếng chuông chùa và uống tách trà sen chậm rãi, thấy mọi lo âu công việc dịu xuống.',
      mood: 'binh_an',
      moodLabel: 'Bình an',
      dateKey: '2026-05-15',
      createdAt: 'Khởi duyên · Nhật Ký An Tâm'
    },
    {
      id: 'journal_seed_2',
      text: 'Biết ơn mẹ đã nấu bữa cơm chay ấm áp cho cả nhà cuối tuần.',
      mood: 'biet_on',
      moodLabel: 'Biết ơn',
      dateKey: '2026-05-16',
      createdAt: 'Ghi chép hiếu hạnh · Nhật Ký An Tâm'
    }
  ]
};

export function createDharmaJournalState(saved = null) {
  const src = saved && typeof saved === 'object' ? saved : {};
  const entries = Array.isArray(src.entries)
    ? src.entries.map((e) => ({ ...e }))
    : DHARMA_JOURNAL.entries.map((e) => ({ ...e }));
  return {
    entries,
    lastUpdatedDateKey: typeof src.lastUpdatedDateKey === 'string' ? src.lastUpdatedDateKey : null
  };
}

export function addJournalEntry(state, text, mood = 'binh_an', dateKey = getLocalDateKey()) {
  const baseState = Array.isArray(state)
    ? createDharmaJournalState({ entries: state })
    : createDharmaJournalState(state);
  const cleanText = String(text || '').trim();
  if (!cleanText) {
    return {
      ok: false,
      reason: 'empty_text',
      message: 'Cô bác vui lòng viết đôi dòng cảm nhận vào Nhật Ký An Tâm nhé.',
      state: baseState,
      entries: baseState.entries
    };
  }
  const moodObj =
    DHARMA_JOURNAL_MOODS.find((m) => m.id === mood) || DHARMA_JOURNAL_MOODS[0];
  const entry = {
    id: `journal_${Date.now()}_${baseState.entries.length + 1}`,
    text: cleanText,
    mood: moodObj.id,
    moodLabel: moodObj.label,
    moodIcon: moodObj.icon,
    dateKey,
    createdAt: `Ghi ngày ${dateKey}`
  };
  const nextState = {
    entries: [entry, ...baseState.entries].slice(0, 120),
    lastUpdatedDateKey: dateKey
  };
  return {
    ok: true,
    entry,
    state: nextState,
    entries: nextState.entries,
    message: `Đã lưu trang Nhật Ký An Tâm (${moodObj.icon} ${moodObj.label}).`
  };
}

// ============================================================================
// 4. STRUCTURED PAID HỌC VIỆN PHẬT HỌC (BUDDHIST ACADEMY)
// ============================================================================
export const ACADEMY_COURSES = [
  {
    id: 'course_1_khai_tam',
    order: 1,
    pathId: 'A',
    tier: 'basic',
    title: 'Khóa 1: Khai Tâm Nhập Môn Phật Học',
    subtitle: 'Trải nghiệm miễn phí · Tam Bảo, Ngũ Giới, Nhân Quả & Giáo Trình Phật Học Toàn Tập',
    priceVnd: 0,
    priceLabel: '0đ (Mở sẵn)',
    isFree: true,
    unlockedByDefault: true,
    passScore: 70,
    bookIds: ['phpt_1', 'giao_trinh_phat_hoc_toan_tap'],
    lessonIds: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
    estimatedHours: 3.5,
    badge: 'Miễn phí · Khai Tâm'
  },
  {
    id: 'course_2_tam_bao',
    order: 2,
    pathId: 'B',
    tier: 'intermediate',
    title: 'Khóa 2: Nền Tảng Tam Bảo, Quy Y & Phước Thiện',
    subtitle: 'Chuyên sâu 4 bộ Nền Tảng Phật Giáo (Q.1, Q.2, Q.4, Q.5) · Tam Bảo, Nghiệp Quả & Hồi Hướng',
    priceVnd: 199000,
    priceLabel: '199.000đ',
    isFree: false,
    unlockedByDefault: false,
    passScore: 75,
    bookIds: ['nen_tang_1_tam_bao', 'nen_tang_2_quy_y', 'nen_tang_4_nghiep', 'nen_tang_5_phuoc'],
    lessonIds: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'],
    estimatedHours: 5.0,
    badge: 'Nền Tảng Cư Sĩ'
  },
  {
    id: 'course_3_thien_dinh',
    order: 3,
    pathId: 'C',
    tier: 'meditation',
    title: 'Khóa 3: Thiền Định Ajahn Brahm & Tu Dưỡng Tâm Từ',
    subtitle: 'Thực hành Thiền Căn Bản buông xả, Thiền Chánh Niệm và Rải Tâm Từ chữa lành',
    priceVnd: 249000,
    priceLabel: '249.000đ',
    isFree: false,
    unlockedByDefault: false,
    passScore: 75,
    bookIds: ['thien_ajahn_brahm', 'tu_duong_tam_tu'],
    lessonIds: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
    estimatedHours: 4.5,
    badge: 'Thiền Tập Chuyên Sâu'
  },
  {
    id: 'course_4_di_san',
    order: 4,
    pathId: 'D',
    tier: 'heritage',
    title: 'Khóa 4: Lịch Sử, Nghi Lễ Vĩnh Tràng & Kinh Pháp Cú',
    subtitle: 'Đức Phật Dạy Những Gì, Tích Truyện Pháp Cú, Phật Học Phổ Thông Q.3 & Di sản Cổ Tự 1849',
    priceVnd: 299000,
    priceLabel: '299.000đ',
    isFree: false,
    unlockedByDefault: false,
    passScore: 80,
    bookIds: ['duc_phat_day_nhung_gi', 'tich_truyen_phap_cu', 'phpt_3'],
    lessonIds: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'],
    estimatedHours: 5.5,
    badge: 'Di Sản & Kinh Điển'
  }
];

export const ACADEMY_ALL_IN_BUNDLE = {
  id: 'bundle_tron_doi',
  title: 'Gói Học Viên Trọn Đời (Tất cả 4 Khóa + 11 Giáo trình PDF)',
  priceVnd: 599000,
  priceLabel: '599.000đ',
  includesCourses: ACADEMY_COURSES.map((c) => c.id)
};

export const ACADEMY_MODULES = [
  // Khóa 1
  {
    id: 'mod_1_1',
    courseId: 'course_1_khai_tam',
    order: 1,
    title: 'Học phần 1.1: Quy Y Tam Bảo & Năm Giới Hộ Thân',
    bookIds: ['phpt_1'],
    lessonIds: ['A1', 'A2'],
    estimatedMinutes: 45,
    extraQuizzes: [
      {
        id: 'Q_1_1_1',
        question: 'Trong Nền Tảng Phật Giáo, quy y "Pháp Bảo" có nghĩa thiết thực nhất là gì?',
        options: [
          'Chỉ cất giữ kinh sách trên tủ cao',
          'Học hiểu và thực hành lời dạy chân chánh của Đức Phật vào đời sống hằng ngày',
          'Chờ đợi phép màu ban phát'
        ],
        correctIndex: 1,
        explanation: 'Pháp Bảo chỉ thực sự phát huy tác dụng chữa lành khi hành giả thực hành theo Chánh pháp.'
      },
      {
        id: 'Q_1_1_2',
        question: 'Vì sao Ngũ Giới được gọi là "Ngũ Đại Thí" (5 món quà lớn tặng đời)?',
        options: [
          'Vì giữ giới là trao sự không sợ hãi và an toàn cho bản thân, gia đình và muôn loài',
          'Vì phải đóng lệ phí lớn',
          'Vì chỉ người già mới giữ'
        ],
        correctIndex: 0,
        explanation: 'Không sát hại, không trộm cắp, không tà hạnh, không dối gạt, không say nghiện mang lại bình an cho tất cả.'
      }
    ]
  },
  {
    id: 'mod_1_2',
    courseId: 'course_1_khai_tam',
    order: 2,
    title: 'Học phần 1.2: Tứ Diệu Đế & Luật Nhân Quả Chuyển Hóa',
    bookIds: ['giao_trinh_phat_hoc_toan_tap'],
    lessonIds: ['A3', 'A4'],
    estimatedMinutes: 55,
    extraQuizzes: [
      {
        id: 'Q_1_2_1',
        question: 'Trong Tứ Diệu Đế, sự thật thứ tư (Đạo Đế) chỉ ra con đường thoát khổ là gì?',
        options: ['Bát Chánh Đạo', 'Trốn tránh cuộc đời', 'Cầu khẩn thần linh'],
        correctIndex: 0,
        explanation: 'Bát Chánh Đạo là con đường trung đạo gồm 8 yếu tố đưa đến chấm dứt khổ đau.'
      },
      {
        id: 'Q_1_2_2',
        question: 'Theo Giáo Trình Phật Học Toàn Tập, Nhân Quả có phải là định mệnh bất biến không?',
        options: [
          'Đúng, không thể thay đổi gì',
          'Không, hiện tại biết tu tập Thân – Khẩu – Ý thiện lành sẽ chuyển hóa được quả tương lai',
          'Chỉ xảy ra ở kiếp sau'
        ],
        correctIndex: 1,
        explanation: 'Phật giáo dạy nhân duyên quả luôn vận hành động; chuyển tâm và hành động hiện tại là chuyển nghiệp.'
      }
    ]
  },
  {
    id: 'mod_1_3',
    courseId: 'course_1_khai_tam',
    order: 3,
    title: 'Học phần 1.3: Bát Chánh Đạo & Lục Độ Giữa Đời Thường',
    bookIds: ['phpt_1', 'giao_trinh_phat_hoc_toan_tap'],
    lessonIds: ['A5', 'A6'],
    estimatedMinutes: 50,
    extraQuizzes: [
      {
        id: 'Q_1_3_1',
        question: 'Nghề nghiệp chân chính (Chánh mạng) trong Bát Chánh Đạo đòi hỏi điều gì?',
        options: [
          'Nuôi sống bản thân bằng nghề lương thiện, không gây tổn hại cho mình và chúng sanh',
          'Kiếm tiền bằng mọi giá',
          'Không cần làm việc'
        ],
        correctIndex: 0,
        explanation: 'Chánh mạng là nghề nghiệp hợp đạo đức, không buôn bán sinh mạng hay chất độc hại.'
      }
    ]
  },

  // Khóa 2
  {
    id: 'mod_2_1',
    courseId: 'course_2_tam_bao',
    order: 1,
    title: 'Học phần 2.1: Ân Đức Tam Bảo & Quy Y Nội Tâm',
    bookIds: ['nen_tang_1_tam_bao', 'nen_tang_2_quy_y'],
    lessonIds: ['B1', 'B2'],
    estimatedMinutes: 60,
    extraQuizzes: [
      {
        id: 'Q_2_1_1',
        question: 'Theo Nền Tảng Phật Giáo Q.1, danh hiệu "Sammāsambuddho" (Chánh Đẳng Giác) biểu thị ân đức nào?',
        options: [
          'Tự mình giác ngộ hoàn toàn chân lý Tứ Đế không thầy chỉ dạy',
          'Chỉ học thuộc lòng kinh sách',
          'Có quyền năng ban thưởng vật chất'
        ],
        correctIndex: 0,
        explanation: 'Đức Phật tự chứng ngộ chân lý tối thượng và chỉ dạy lại cho thế gian.'
      },
      {
        id: 'Q_2_1_2',
        question: 'Quy Y Tam Bảo nội tâm (Quy y tự tánh) giúp người Phật tử điều gì?',
        options: [
          'Luôn quay về soi sáng tâm mình bằng Giác, Chánh, Tịnh thay vì tìm cầu bên ngoài',
          'Không cần đến chùa nữa',
          'Chỉ đọc chữ không cần hiểu'
        ],
        correctIndex: 0,
        explanation: 'Quy y hình thức là cửa ngõ, quy y nội tâm là sự chuyển hóa thật sự bên trong.'
      }
    ]
  },
  {
    id: 'mod_2_2',
    courseId: 'course_2_tam_bao',
    order: 2,
    title: 'Học phần 2.2: Nghiệp – Quả & Niệm Phật Nhiếp Tâm',
    bookIds: ['nen_tang_4_nghiep'],
    lessonIds: ['B3', 'B4'],
    estimatedMinutes: 65,
    extraQuizzes: [
      {
        id: 'Q_2_2_1',
        question: 'Trong 10 thiện nghiệp (Thập thiện), 3 nghiệp thuộc về Thân là gì?',
        options: [
          'Không sát sanh, không trộm cắp, không tà hạnh',
          'Không nói dối, không nói hai lưỡi, không nói ác',
          'Không tham, không sân, không si'
        ],
        correctIndex: 0,
        explanation: 'Thân có 3 thiện nghiệp, Khẩu có 4 thiện nghiệp và Ý có 3 thiện nghiệp.'
      }
    ]
  },
  {
    id: 'mod_2_3',
    courseId: 'course_2_tam_bao',
    order: 3,
    title: 'Học phần 2.3: Mười Cội Phước Thiện & Hồi Hướng Công Đức',
    bookIds: ['nen_tang_5_phuoc'],
    lessonIds: ['B5', 'B6'],
    estimatedMinutes: 60,
    extraQuizzes: [
      {
        id: 'Q_2_3_1',
        question: 'Trong 10 cội phước thiện (Quyển 5), phước báu nào được xem là tối thượng về trí tuệ?',
        options: [
          'Phước Chánh kiến (Diṭṭhijukamma) và Phước Tham thiền (Bhāvanā)',
          'Chỉ bố thí vật chất mà tâm còn sân hận',
          'Khoe khoang công đức'
        ],
        correctIndex: 0,
        explanation: 'Tham thiền và Chánh kiến thanh lọc tận gốc phiền não, nâng đỡ các phước thiện khác.'
      }
    ]
  },

  // Khóa 3
  {
    id: 'mod_3_1',
    courseId: 'course_3_thien_dinh',
    order: 1,
    title: 'Học phần 3.1: Bốn Giai Đoạn Thiền Căn Bản (Ajahn Brahm)',
    bookIds: ['thien_ajahn_brahm'],
    lessonIds: ['C1', 'C2'],
    estimatedMinutes: 55,
    extraQuizzes: [
      {
        id: 'Q_3_1_1',
        question: 'Khi tâm bị phân tán trong lúc theo dõi hơi thở, Thiền sư Ajahn Brahm khuyên thái độ nào là đúng nhất?',
        options: [
          'Bực bội tự trách mình dở',
          'Mỉm cười dịu dàng nhận biết sự phân tâm rồi nhẹ nhàng đưa chú ý trở lại hơi thở',
          'Đứng dậy bỏ ngang buổi thiền'
        ],
        correctIndex: 1,
        explanation: 'Thái độ dịu dàng, buông bỏ kiểm soát giúp hơi thở tự nhiên lắng dịu.'
      }
    ]
  },
  {
    id: 'mod_3_2',
    courseId: 'course_3_thien_dinh',
    order: 2,
    title: 'Học phần 3.2: Thiền Hành, Thiền Trà & Đạo Hiếu Trong Gia Đình',
    bookIds: ['tu_duong_tam_tu'],
    lessonIds: ['C3', 'C4'],
    estimatedMinutes: 50,
    extraQuizzes: [
      {
        id: 'Q_3_2_1',
        question: 'Chánh niệm trong Tứ Oai Nghi nghĩa là gì?',
        options: [
          'Biết rõ thân tâm mình trong cả 4 tư thế: Đi, Đứng, Nằm, Ngồi',
          'Chỉ nhắm mắt ngồi yên mới gọi là tu',
          'Đi thật nhanh không cần để ý gì'
        ],
        correctIndex: 0,
        explanation: 'Thiền chánh niệm có mặt trong từng bước chân, chén trà và sinh hoạt gia đình.'
      }
    ]
  },
  {
    id: 'mod_3_3',
    courseId: 'course_3_thien_dinh',
    order: 3,
    title: 'Học phần 3.3: 11 Phước Báu Tâm Từ & Hạnh Tri Túc',
    bookIds: ['thien_ajahn_brahm', 'tu_duong_tam_tu'],
    lessonIds: ['C5', 'C6'],
    estimatedMinutes: 55,
    extraQuizzes: [
      {
        id: 'Q_3_3_1',
        question: 'Thứ tự rải Tâm Từ (Metta Bhavana) hợp lý nhất giúp tâm không gượng gạo là gì?',
        options: [
          'Từ chính mình -> người thân quý -> người trung dung -> người gây khó dễ -> khắp muôn loài',
          'Chỉ rải cho người lạ, bỏ qua mình',
          'Rải bằng sự ép buộc'
        ],
        correctIndex: 0,
        explanation: 'Tình thương chân thật khởi từ sự bình an tự thân rồi lan tỏa rộng khắp không phân biệt.'
      }
    ]
  },

  // Khóa 4
  {
    id: 'mod_4_1',
    courseId: 'course_4_di_san',
    order: 1,
    title: 'Học phần 4.1: Biên Niên Sử & Kiến Trúc Á – Âu Chùa Vĩnh Tràng',
    bookIds: ['duc_phat_day_nhung_gi'],
    lessonIds: ['D1', 'D2'],
    estimatedMinutes: 55,
    extraQuizzes: [
      {
        id: 'Q_4_1_1',
        question: 'Mặt bằng nội tự khu chùa cổ Chùa Vĩnh Tràng được bố trí theo hình chữ Hán nào?',
        options: [
          'Chữ Quốc (國) gồm Tiền đường, Chánh điện, hai Sân Thiên Tỉnh, Nhà Tổ và Nhà Hậu',
          'Chữ Nhất nằm ngang đơn lẻ',
          'Hình tròn khép kín'
        ],
        correctIndex: 0,
        explanation: 'Kiến trúc chữ Quốc (國) tạo độ sâu trang nghiêm và hai giếng trời thông thoáng tự nhiên.'
      }
    ]
  },
  {
    id: 'mod_4_2',
    courseId: 'course_4_di_san',
    order: 2,
    title: 'Học phần 4.2: Di Sản Điêu Khắc 1907 & Tam Tôn Lộ Thiên',
    bookIds: ['tich_truyen_phap_cu'],
    lessonIds: ['D3', 'D4'],
    estimatedMinutes: 60,
    extraQuizzes: [
      {
        id: 'Q_4_2_1',
        question: 'Bộ Tích Truyện Pháp Cú gồm bao nhiêu bài kệ gắn liền với các câu chuyện thời Đức Phật?',
        options: ['423 bài kệ', '12 bài kệ', '1000 bài kệ'],
        correctIndex: 0,
        explanation: 'Kinh Pháp Cú gồm 423 bài kệ chia thành 26 phẩm giàu triết lý sống.'
      }
    ]
  },
  {
    id: 'mod_4_3',
    courseId: 'course_4_di_san',
    order: 3,
    title: 'Học phần 4.3: Đại Thừa Lục Độ & Oai Nghi Hành Hương Chánh Tín',
    bookIds: ['phpt_3'],
    lessonIds: ['D5', 'D6'],
    estimatedMinutes: 55,
    extraQuizzes: [
      {
        id: 'Q_4_3_1',
        question: 'Trong Phật Học Phổ Thông Q.3, Bồ Tát Đạo khác với lối tu chỉ lo cho riêng mình ở điểm nào?',
        options: [
          'Phát đại nguyện Tứ Hoằng Thệ Nguyện, tu tập Lục Độ nhập thế vừa tự giác vừa giúp đời bớt khổ',
          'Xa lánh mọi người',
          'Không cần giữ giới'
        ],
        correctIndex: 0,
        explanation: 'Tinh thần Đại Thừa lấy từ bi và trí tuệ làm đôi cánh phụng sự chúng sanh.'
      }
    ]
  }
];

export function getAcademyExamQuestions(courseId = 'course_1_khai_tam') {
  const course = ACADEMY_COURSES.find((c) => c.id === courseId);
  if (!course) return [];
  const modules = ACADEMY_MODULES.filter((m) => m.courseId === course.id).sort((a, b) => a.order - b.order);
  const questions = [];

  for (const mod of modules) {
    for (const q of mod.extraQuizzes || []) {
      questions.push({
        id: q.id,
        moduleId: mod.id,
        source: 'module',
        question: q.question,
        options: [...q.options],
        correctIndex: q.correctIndex,
        explanation: q.explanation
      });
    }
  }
  for (const lid of course.lessonIds) {
    const lesson = LECTURE_LESSONS.find((l) => l.id === lid);
    if (lesson?.quiz) {
      questions.push({
        id: `L_${lesson.id}`,
        lessonId: lesson.id,
        source: 'lesson',
        question: lesson.quiz.question,
        options: [...lesson.quiz.options],
        correctIndex: lesson.quiz.correctIndex,
        explanation: lesson.quiz.explanation
      });
    }
  }
  return questions;
}

export function gradeAcademyExam(courseId = 'course_1_khai_tam', answers = {}) {
  const course = ACADEMY_COURSES.find((c) => c.id === courseId);
  const questions = getAcademyExamQuestions(courseId);
  if (!course || questions.length === 0) {
    return {
      ok: false,
      found: false,
      courseId,
      totalQuestions: 0,
      correctCount: 0,
      scorePercent: 0,
      passed: false,
      passScore: 70,
      details: []
    };
  }

  let correctCount = 0;
  const details = questions.map((q, idx) => {
    const rawAns = Array.isArray(answers) ? answers[idx] : answers?.[q.id];
    const selectedIndex = rawAns === undefined || rawAns === null ? -1 : Number(rawAns);
    const correct = selectedIndex === q.correctIndex;
    if (correct) correctCount += 1;
    return {
      id: q.id,
      selectedIndex,
      correctIndex: q.correctIndex,
      correct,
      explanation: q.explanation
    };
  });

  const scorePercent = Math.round((correctCount / questions.length) * 100);
  const passed = scorePercent >= course.passScore;

  return {
    ok: true,
    found: true,
    courseId: course.id,
    courseTitle: course.title,
    totalQuestions: questions.length,
    correctCount,
    scorePercent,
    passed,
    passScore: course.passScore,
    details
  };
}

export function createAcademyEntitlementState(saved = null) {
  const src = saved && typeof saved === 'object' ? saved : {};
  const validIds = new Set(ACADEMY_COURSES.map((c) => c.id));
  const rawUnlocked = Array.isArray(src.unlockedCourses) ? src.unlockedCourses : [];
  const unlockedSet = new Set(['course_1_khai_tam']);
  for (const cid of rawUnlocked) {
    if (validIds.has(cid)) unlockedSet.add(cid);
  }
  const bundleUnlocked =
    Boolean(src.bundleUnlocked) ||
    ACADEMY_COURSES.every((c) => unlockedSet.has(c.id));

  return {
    unlockedCourses: Array.from(unlockedSet),
    bundleUnlocked,
    redeemedCodes: Array.isArray(src.redeemedCodes) ? [...src.redeemedCodes] : [],
    certificates: Array.isArray(src.certificates) ? src.certificates.map((c) => ({ ...c })) : [],
    examScores: src.examScores && typeof src.examScores === 'object' ? { ...src.examScores } : {}
  };
}

const SANDBOX_ACADEMY_CODES = new Set(['VINHTRANG2026', 'HOIAN2026']);

export function unlockAcademyCourseWithCode(state, courseId, code) {
  const nextState = createAcademyEntitlementState(state);
  const isBundle = courseId === ACADEMY_ALL_IN_BUNDLE.id || courseId === 'all';
  const targetCourse = ACADEMY_COURSES.find((c) => c.id === courseId);

  if (!isBundle && !targetCourse) {
    return {
      ok: false,
      reason: 'course_not_found',
      message: 'Không tìm thấy khóa học trong Học Viện Phật Học.',
      state: nextState,
      unlockedCourses: nextState.unlockedCourses
    };
  }

  const normalizedCode = String(code || '').trim().toUpperCase();
  const isValidCode =
    SANDBOX_ACADEMY_CODES.has(normalizedCode) ||
    /^VT-HV-[A-Z0-9]{4,16}$/.test(normalizedCode);

  if (!isValidCode) {
    return {
      ok: false,
      reason: 'invalid_code',
      message: 'Mã kích hoạt chưa hợp lệ. Định dạng đúng: VT-HV-XXXX hoặc mã thử nghiệm VINHTRANG2026.',
      state: nextState,
      unlockedCourses: nextState.unlockedCourses
    };
  }

  if (isBundle) {
    for (const c of ACADEMY_COURSES) {
      if (!nextState.unlockedCourses.includes(c.id)) {
        nextState.unlockedCourses.push(c.id);
      }
    }
    nextState.bundleUnlocked = true;
  } else {
    if (!nextState.unlockedCourses.includes(targetCourse.id)) {
      nextState.unlockedCourses.push(targetCourse.id);
    }
    nextState.bundleUnlocked = ACADEMY_COURSES.every((c) =>
      nextState.unlockedCourses.includes(c.id)
    );
  }

  if (!nextState.redeemedCodes.includes(normalizedCode)) {
    nextState.redeemedCodes.push(normalizedCode);
  }

  const targetTitle = isBundle ? ACADEMY_ALL_IN_BUNDLE.title : targetCourse.title;
  return {
    ok: true,
    courseId: isBundle ? ACADEMY_ALL_IN_BUNDLE.id : targetCourse.id,
    codeUsed: normalizedCode,
    bundleUnlocked: nextState.bundleUnlocked,
    unlockedCourses: nextState.unlockedCourses,
    state: nextState,
    message: `Kích hoạt thành công "${targetTitle}"! Mời học viên vào lớp cùng 11 bộ giáo trình PDF.`
  };
}

export function buildVietQRPayload(courseOrId = 'course_2_tam_bao') {
  const course =
    typeof courseOrId === 'string'
      ? courseOrId === ACADEMY_ALL_IN_BUNDLE.id
        ? ACADEMY_ALL_IN_BUNDLE
        : ACADEMY_COURSES.find((c) => c.id === courseOrId) || ACADEMY_COURSES[1]
      : courseOrId && typeof courseOrId === 'object'
        ? courseOrId
        : ACADEMY_COURSES[1];

  const amount = Math.max(0, Math.round(Number(course.priceVnd || 0)));
  const bankId = 'MB';
  const bankBin = '970422';
  const accountNo = '0918491849';
  const accountName = 'HOC VIEN PHAT HOC VINH TRANG';
  const shortTag = String(course.id || 'COURSE')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 14);
  const transferMemo = `VTHV ${shortTag}`.trim();
  const isFree = amount === 0;

  const qrImageUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferMemo)}&accountName=${encodeURIComponent(accountName)}`;
  const qrPayload = `VIETQR|${bankBin}|${accountNo}|${amount}|${transferMemo}`;

  return {
    courseId: course.id,
    courseTitle: course.title,
    amount,
    isFree,
    currency: 'VND',
    bankId,
    bankBin,
    bankName: 'MB Bank (Ngân hàng Quân đội)',
    accountNo,
    accountName,
    transferMemo,
    qrPayload,
    qrImageUrl,
    adapterReady: { payos: true, sepay: true }
  };
}

export function generateAcademyCertificate(
  studentName = 'Học viên Phật tử',
  courseOrId = 'course_1_khai_tam',
  score = 100,
  issuedAt = new Date()
) {
  const course =
    typeof courseOrId === 'string'
      ? ACADEMY_COURSES.find((c) => c.id === courseOrId) || ACADEMY_COURSES[0]
      : courseOrId && typeof courseOrId === 'object'
        ? courseOrId
        : ACADEMY_COURSES[0];

  const cleanName = String(studentName || '').trim() || 'Học viên Phật tử';
  const numericScore = Math.max(0, Math.min(100, Math.round(Number(score || 0))));
  const minPass = Number(course.passScore || 70);
  const passed = numericScore >= minPass;

  if (!passed) {
    return {
      ok: false,
      passed: false,
      reason: 'score_below_pass',
      studentName: cleanName,
      courseId: course.id,
      courseTitle: course.title,
      score: numericScore,
      minScore: minPass,
      message: `Điểm đạt ${numericScore}/100 chưa đủ chuẩn tốt nghiệp (${minPass}/100). Cô bác hãy ôn bài và thi lại nhé.`
    };
  }

  const d = issuedAt instanceof Date ? issuedAt : new Date(issuedAt);
  const issuedDateKey = getLocalDateKey(d);
  const gradeLabel =
    numericScore >= 90 ? 'Xuất sắc · Tinh tấn' : numericScore >= 80 ? 'Giỏi · Chánh niệm' : 'Đạt · Hoàn thành';

  // Deterministic checksum verification code
  const rawSeed = `${cleanName}|${course.id}|${numericScore}|${issuedDateKey}`;
  let hash = 0;
  for (let i = 0; i < rawSeed.length; i++) {
    hash = (hash * 33 + rawSeed.charCodeAt(i)) >>> 0;
  }
  const verificationCode = `VT-CERT-${hash.toString(36).toUpperCase().padStart(6, '0')}`;
  const certificateId = `CERT-${String(course.id).toUpperCase()}-${issuedDateKey.replace(/-/g, '')}-${hash.toString(16).slice(0, 4).toUpperCase()}`;

  return {
    ok: true,
    passed: true,
    certificateId,
    studentName: cleanName,
    courseId: course.id,
    courseTitle: course.title,
    score: numericScore,
    minScore: minPass,
    gradeLabel,
    issuedDateKey,
    issuedLabel: `Mỹ Tho, ngày ${issuedDateKey}`,
    issuerName: 'Học Viện Phật Học Trực Tuyến · Chùa Vĩnh Tràng',
    verificationCode,
    sealText: 'ẤN CHỨNG HOÀN THÀNH KHÓA TU HỌC · CHÙA VĨNH TRÀNG',
    motto: 'Tự giác · Giác tha · Giác hạnh viên mãn'
  };
}

