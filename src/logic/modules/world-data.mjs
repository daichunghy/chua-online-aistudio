/**
 * Hồ sơ nhân vật, trạm hành hương, điểm khám phá, ranh giới thế giới, di chuyển & trạm gần nhất.
 * (Tách từ chua-online-logic.mjs — import từ '/src/logic/chua-online-logic.mjs' vẫn dùng được.)
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
    zoneCode: 'Trục vườn giữa hướng về Bảo Tháp 7 tầng',
    pinLabel: 'Tượng Phật A Di Đà',
    pos: { x: -9.5, z: -23.5 },
    standPos: { x: -9.5, z: -11.4 },
    via: [[10.0, 20.0], [2.0, 4.0], [-9.5, -11.4]],
    mapCoord: { x: 44, y: 42 },
    lookAt: { x: -9.5, y: 12.0, z: -23.5 },
    audio: 's1_adida.mp3',
    subtitle: 'Tượng Phật A Di Đà đứng uy nghiêm trên đài sen giữa trục hoa viên Tây Bắc, phía trước Bảo Tháp 7 tầng.',
    ritualType: 'niem_phat'
  },
  {
    id: 3,
    key: 'phat_di_lac',
    name: 'Tượng Phật Di Lặc (cao 20m)',
    zoneCode: 'Công viên Di Lặc bên trái khi từ cổng nhìn vào',
    pinLabel: 'Tượng Phật Di Lặc',
    pos: { x: -26.5, z: 4.0 },
    standPos: { x: -26.5, z: 26.2 },
    via: [[10.0, 22.5], [-10.0, 25.5], [-26.5, 26.2]],
    mapCoord: { x: 30, y: 62 },
    lookAt: { x: -26.5, y: 9.0, z: 4.0 },
    audio: 's4_dilac.mp3',
    subtitle: 'Tượng Phật Di Lặc cao 20m, dài 27m, rộng 18m; an tọa trong công viên bên trái chùa nhìn từ cổng vào, với sân rộng và bậc thang lớn.',
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
    zoneCode: 'Cuối đường rẽ trái · Hiên bỏ dép vào Chánh điện',
    pinLabel: 'Chánh điện',
    pos: { x: 23.0, z: 7.2 },
    standPos: { x: 38.4, z: -14.5 },
    via: [[40.5, 32.0], [40.5, 8.0], [40.5, -14.5], [38.4, -14.5]],
    mapCoord: { x: 67, y: 58 },
    lookAt: { x: 35.2, y: 2.2, z: -14.5 },
    audio: 's3_lay_phat.mp3',
    subtitle: 'Từ Cổng Phụ đi thẳng xuống cuối con đường rợp bóng cây rồi quẹo trái vào hiên bỏ giày dép để bước qua cửa gỗ vào Chánh điện.',
    ritualType: 'le_phat'
  },
  {
    id: 6,
    key: 'cua_hang_luu_niem',
    name: 'Nhà Lưu Niệm · Đặc Sản Chay Chùa Vĩnh Tràng',
    zoneCode: 'Cuối đường rợp bóng mát từ Cổng Phụ',
    pinLabel: 'Nhà Lưu Niệm',
    pos: { x: 42.2, z: -32.8 },
    standPos: { x: 42.2, z: -26.8 },
    via: [[41.2, 41.5], [41.8, 14.0], [42.2, -23.0], [42.2, -26.8]],
    mapCoord: { x: 84, y: 46 },
    lookAt: { x: 42.2, y: 1.9, z: -34.2 },
    audio: 'merit_box.mp3',
    subtitle: 'Bước thẳng vào bên trong Nhà Lưu Niệm để chọn kho quẹt chay, chao môn chay, tương hột, muối mè, tràng hạt bồ đề, mỹ nghệ gỗ dừa Mỹ Tho, tượng nhỏ và kinh sách Phật giáo.',
    ritualType: 'shop'
  },
  {
    id: 7,
    key: 'giang_duong',
    name: 'Văn Phòng Ban Trị Sự · Giảng Đường Huệ Đăng',
    zoneCode: 'Dãy nhà phía Đông Chánh điện',
    pinLabel: 'Giảng đường',
    pos: { x: 64.5, z: -18.0 },
    standPos: { x: 54.5, z: -18.0 },
    via: [[41.8, 22.0], [42.2, -18.0], [54.5, -18.0]],
    mapCoord: { x: 92, y: 45 },
    lookAt: { x: 64.5, y: 3.6, z: -18.0 },
    audio: 's3_giang_duong.mp3',
    subtitle: 'Dãy nhà hành lang thoáng mát phía Đông khuôn viên Chùa Vĩnh Tràng, nơi sinh hoạt Phật sự, nghe giảng pháp, đọc giáo trình Phật học và thực tập chánh niệm.',
    ritualType: 'lecture'
  },
  {
    id: 8,
    key: 'phat_niet_ban',
    name: 'Phật Thích Ca nhập Niết Bàn (dài 32m) & Bảo Tháp 7 Tầng',
    zoneCode: 'Khu vườn phía sau Chánh điện',
    pinLabel: 'Phật Niết Bàn & Bảo Tháp',
    pos: { x: 14.5, z: -49.0 },
    standPos: { x: 14.5, z: -33.6 },
    via: [[3.5, 16.0], [3.5, -24.0], [3.5, -33.6], [14.5, -33.6]],
    mapCoord: { x: 60, y: 24 },
    lookAt: { x: 14.5, y: 8.5, z: -49.0 },
    audio: 's5_nirvana.mp3',
    subtitle: 'Chiêm bái tượng Đức Phật Thích Ca nhập Niết Bàn dài 32m, cao 10m nằm ngay phía sau mái ngói Chánh điện, bên cạnh Bảo Tháp Thất Phật 7 tầng.',
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
    pos: { x: -28.0, z: -58.5 },
    standPos: { x: -28.0, z: -48.5 },
    via: [[-44.0, -45.5], [-28.0, -48.5]],
    mapCoord: { x: 28, y: 14 },
    lookAt: { x: -28.0, y: 1.5, z: -58.5 },
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
    zoneCode: 'Khu thờ Tổ phía sau Vườn Phật Nằm',
    pinLabel: 'Tổ Đường',
    pos: { x: 14.5, z: -72.0 },
    standPos: { x: 14.5, z: -63.0 },
    via: [[37.8, -18.0], [38.0, -63.0], [14.5, -63.0]],
    mapCoord: { x: 60, y: 10 },
    lookAt: { x: 14.5, y: 3.5, z: -72.0 },
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
    pos: { x: -9.5, z: -44.5 },
    standPos: { x: -9.5, z: -36.5 },
    via: [[3.5, 16.0], [3.5, -36.5], [-9.5, -36.5]],
    lookAt: { x: -9.5, y: 9.0, z: -44.5 },
    audio: 's5_nirvana.mp3',
    subtitle: 'Bảo tháp 7 tầng cao 35m đứng uy nghiêm ngay phía sau tượng Phật A Di Đà và cạnh tượng Phật Niết Bàn.',
    ritualType: 'hoi_huong'
  },
  {
    id: 109,
    isDiscovery: true,
    key: 'nha_co_ba_hu_tieu',
    name: 'Nhà Cô Ba · Hủ tiếu Mỹ Tho',
    zoneCode: 'Mặt tiền phía Đông đường vào chùa',
    pinLabel: 'Nhà Cô Ba',
    pos: { x: 58.2, z: 75.0 },
    standPos: { x: 50.8, z: 75.0 },
    via: [[40.5, 45.0], [45.0, 62.0], [50.8, 75.0]],
    lookAt: { x: 58.2, y: 2.5, z: 75.0 },
    audio: 'day_di.mp3',
    subtitle: 'Một quán ăn gia đình nằm dọc con đường thẳng vào chùa Vĩnh Tràng; phục vụ hủ tiếu Mỹ Tho.',
    ritualType: 'welcome'
  },
  {
    id: 110,
    isDiscovery: true,
    key: 'banh_beo_di_sau',
    name: 'Bếp Dì Sáu · Bánh bèo & chè',
    zoneCode: 'Mặt tiền phía Đông đường vào chùa',
    pinLabel: 'Bếp Dì Sáu',
    pos: { x: 58.2, z: 89.0 },
    standPos: { x: 50.8, z: 89.0 },
    via: [[40.5, 45.0], [45.5, 72.0], [50.8, 89.0]],
    lookAt: { x: 58.2, y: 2.5, z: 89.0 },
    audio: 'day_di.mp3',
    subtitle: 'Căn bếp gia đình miền Tây dọc tuyến đường vào chùa với bàn gỗ, khay bánh bèo và món chè địa phương.',
    ritualType: 'welcome'
  },
  {
    id: 111,
    isDiscovery: true,
    key: 'hem_nha_vuon',
    name: 'Công viên Vĩnh Tràng · Mỹ Tho',
    zoneCode: 'Phía Tây đường thẳng vào chùa',
    pinLabel: 'Công viên Vĩnh Tràng',
    pos: { x: 8.0, z: 104.0 },
    standPos: { x: 24.0, z: 104.0 },
    via: [[40.5, 48.0], [36.0, 74.0], [33.5, 104.0], [24.0, 104.0]],
    lookAt: { x: 8.0, y: 2.4, z: 104.0 },
    audio: 'day_di.mp3',
    subtitle: 'Công viên Vĩnh Tràng xanh mát trải dài hơn 100m ngay bên phải lối nhìn từ cổng chùa ra, với đài phun nước và lối dạo rợp bóng cây.',
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
  maxZ: 176.0
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
