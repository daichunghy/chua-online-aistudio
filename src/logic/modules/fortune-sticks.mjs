/**
 * Pure domain logic for Xin Xăm · Xem Quẻ Quan Âm tại Chùa Vĩnh Tràng.
 * Sử dụng đúng thuật ngữ dân gian – Phật giáo Việt Nam:
 * Xin Xăm, Xóc Ống Xăm, Gieo Keo Âm Dương, Quẻ Xăm Quan Âm, Giải Quẻ.
 */

export const FORTUNE_INTENTIONS = Object.freeze([
  { id: 'binh_an', label: 'Cầu bình an gia đạo', icon: '🪷' },
  { id: 'suc_khoe', label: 'Cầu sức khỏe an khang', icon: '🌿' },
  { id: 'cong_viec', label: 'Cầu công việc hanh thông', icon: '🎋' },
  { id: 'hoc_hanh', label: 'Cầu học hành thi cử', icon: '📜' },
  { id: 'tam_an', label: 'Cầu tâm an buông phiền não', icon: '🙏' }
]);

export const QUAN_AM_FORTUNE_STICKS = Object.freeze([
  {
    number: 1,
    rank: 'Thượng Thượng',
    rankTone: 'gold',
    title: 'Khai Thiên Lập Địa · Vạn Sự Hanh Thông',
    poem: [
      'Khai thiên tích địa tạo lương duyên,',
      'Nhật nguyệt quang minh chiếu tứ biên.',
      'Vạn sự tùy tâm giai cát khánh,',
      'Phước lai tự tại bảo bình yên.'
    ],
    story: 'Điển tích: Bàn Cổ khai thiên — khởi đầu sáng tỏ, vận trình mở ra thuận lợi.',
    summary: 'Quẻ đại cát báo hiệu giai đoạn mới sáng sủa. Việc thiện lành ấp ủ lâu nay gặp đúng thời điểm và quý nhân tương trợ.',
    family: 'Gia đạo hòa thuận, trên dưới thương yêu, có tin vui nhỏ trong nhà.',
    career: 'Công việc rộng mở, thuận lợi ký kết hoặc khởi sự dự định mới.',
    health: 'Tinh thần minh mẫn, chú ý nghỉ ngơi điều độ để giữ khí lực lâu bền.',
    dharmaAdvice: 'Khi thuận duyên đến, càng nên giữ tâm khiêm hạ và san sẻ phước lành.'
  },
  {
    number: 6,
    rank: 'Thượng Cát',
    rankTone: 'gold',
    title: 'Đầu Nhạn Quy Lâm · Quý Nhân Phù Trợ',
    poem: [
      'Đầu nhạn bay về chốn núi xanh,',
      'Mây tan trăng sáng chiếu an lành.',
      'Gặp người thiện hữu chung tay giúp,',
      'Mọi việc cầu xin ắt sớm thành.'
    ],
    story: 'Điển tích: Chim nhạn tìm về rừng lành — có chỗ nương tựa vững vàng.',
    summary: 'Nhờ ăn ở hiền hòa và giữ chữ tín, bạn dễ gặp người hiểu việc nâng đỡ lúc cần thiết.',
    family: 'Người thân bình an, nên dành thêm thời gian thăm hỏi cha mẹ, ông bà.',
    career: 'Hợp tác cùng đồng đội đáng tin sẽ đạt kết quả tốt hơn làm một mình.',
    health: 'Thể trạng ổn định, đi bộ sáng sớm hoặc hít thở sâu rất có ích.',
    dharmaAdvice: 'Gieo lời ái ngữ mỗi ngày chính là tự mời gọi quý nhân đến bên mình.'
  },
  {
    number: 11,
    rank: 'Thượng Cát',
    rankTone: 'gold',
    title: 'Mộc Tiện Xuân Phong · Cội Xanh Đâm Chồi',
    poem: [
      'Cây khô gặp tiết gió xuân về,',
      'Lá biếc đâm chồi tỏa bóng che.',
      'Khó nhọc qua rồi ngày nắng ấm,',
      'Thong dong bước tới chẳng lo âu.'
    ],
    story: 'Điển tích: Thư sinh tiến kinh — kiên trì tích đức qua mùa đông nay đến độ trổ hoa.',
    summary: 'Những vướng mắc trước đây đang dần tháo gỡ. Sự nhẫn nại của bạn bắt đầu mang lại thành quả rõ rệt.',
    family: 'Chuyện cũ trong nhà dần êm đẹp, bầu không khí ấm áp trở lại.',
    career: 'Cơ hội thăng tiến hoặc nguồn thu ổn định hơn; cứ vững bước từng phần.',
    health: 'Bệnh nhẹ mau thuyên giảm, ăn uống thanh đạm giúp thân tâm nhẹ nhàng.',
    dharmaAdvice: 'Nhẫn nhục không phải yếu mềm mà là sức mạnh nuôi lớn cội phước.'
  },
  {
    number: 15,
    rank: 'Trung Bình',
    rankTone: 'amber',
    title: 'Hành Nhân Đãi Độ · Chờ Thuyền Sang Sông',
    poem: [
      'Khách đứng bên sông đợi chuyến đò,',
      'Gió chiều chưa lặng chớ âu lo.',
      'An tâm giữ phận chờ thời tới,',
      'Nước êm xuôi mái vượt bến bờ.'
    ],
    story: 'Điển tích: Tô Tần đắc chí muộn — thời cơ chưa chín thì đừng vội hấp tấp.',
    summary: 'Hiện tại thích hợp để củng cố nền tảng hơn là mạo hiểm thay đổi lớn. Chậm lại một nhịp sẽ thấy hướng đi chắc chắn.',
    family: 'Giữ hòa khí bằng sự lắng nghe, tránh tranh luận những chuyện nhỏ nhặt.',
    career: 'Tạm giữ ổn định việc hiện tại, rà soát kỹ chi tiết trước khi quyết định.',
    health: 'Chú ý giấc ngủ và giảm căng thẳng công việc vào buổi tối.',
    dharmaAdvice: 'Biết dừng đúng lúc giữa dòng vội vã là dấu hiệu của trí tuệ.'
  },
  {
    number: 19,
    rank: 'Trung Cát',
    rankTone: 'jade',
    title: 'Thuyền Hành Thuận Thủy · Gió Đẩy Buồm Xuôi',
    poem: [
      'Thuyền con lướt nhẹ giữa dòng trong,',
      'Gió mát đưa hương ngát cõi lòng.',
      'Chẳng phải nhọc công tranh đắc thất,',
      'Thuận duyên tự khắc đến thành công.'
    ],
    story: 'Điển tích: Tử Nha câu cá bên sông Vị — tâm an tĩnh nên gặp đúng vận lớn.',
    summary: 'Mọi việc tiến triển êm đềm, tự nhiên. Không cần cưỡng cầu hay nóng vội, cứ làm tròn bổn phận sẽ thấy hanh thông.',
    family: 'Gia đình yên ổn, có dịp sum họp nhẹ nhàng ấm cúng.',
    career: 'Công việc đều đặn, tài lộc vừa đủ và bền vững.',
    health: 'Tâm trạng thư thái, sức khỏe bình hòa.',
    dharmaAdvice: 'Tùy duyên mà bất biến — làm hết sức mình rồi thả nhẹ sự chấp trước.'
  },
  {
    number: 24,
    rank: 'Trung Bình',
    rankTone: 'amber',
    title: 'Vân Khai Kiến Nguyệt · Mây Tan Thấy Trăng',
    poem: [
      'Mây giăng che khuất ánh trăng ngà,',
      'Chớ vội buồn lòng trách bước xa.',
      'Gió nhẹ thổi qua trời lại sáng,',
      'Tâm thanh tự thấy lối hiền hòa.'
    ],
    story: 'Điển tích: Ân Giao gặp thầy chỉ lối — qua cơn mù mờ sẽ thấy đường sáng.',
    summary: 'Có vài nỗi băn khoăn khiến lòng hơi rối, nhưng chỉ là tạm thời. Bình tĩnh xem xét lại sẽ thấy lời giải ngay trước mắt.',
    family: 'Nên nói chuyện thẳng thắn nhưng ôn hòa để tháo gỡ hiểu lầm.',
    career: 'Đừng vội tin lời đồn hay đầu tư theo đám đông; chọn điều mình hiểu rõ.',
    health: 'Cần uống đủ nước, bớt thức khuya và giữ tinh thần lạc quan.',
    dharmaAdvice: 'Trăng vốn tròn đầy, chỉ vì mây phiền não che mờ; lặng tâm ắt thấy sáng.'
  },
  {
    number: 28,
    rank: 'Thượng Cát',
    rankTone: 'gold',
    title: 'Đông Phương Nguyệt Xuất · Trăng Sáng Phương Đông',
    poem: [
      'Trăng rằm ló dạng phía trời Đông,',
      'Soi rọi hoa sen nở giữa dòng.',
      'Phước đức tổ tiên hằng che chở,',
      'Bình an hạnh phúc trọn trong lòng.'
    ],
    story: 'Điển tích: Bao Công xử án minh bạch — chính trực ắt được trời đất chứng minh.',
    summary: 'Quẻ tốt cho cả gia đạo lẫn học hành, công danh. Sống ngay thẳng và biết ơn nguồn cội giúp đường đi thêm rộng.',
    family: 'Gia đình có phước ấm, con cháu hiếu thảo, mọi người khỏe mạnh.',
    career: 'Học hành thi cử sáng dạ, công việc được cấp trên hoặc khách hàng tin tưởng.',
    health: 'Khí sắc tươi tắn, ít ốm đau vặt.',
    dharmaAdvice: 'Nhớ ơn cha mẹ và làm một việc thiện nhỏ hôm nay để bồi đắp phước điền.'
  },
  {
    number: 33,
    rank: 'Trung Cát',
    rankTone: 'jade',
    title: 'Tàng Châu Ẩn Ngọc · Ngọc Ẩn Trong Đá',
    poem: [
      'Ngọc quý còn đang ẩn đá sâu,',
      'Người hiền mài giũa chẳng âu sầu.',
      'Ngày sau tỏa sáng muôn phương biết,',
      'Gìn giữ chân tâm chớ đổi màu.'
    ],
    story: 'Điển tích: Biện Hòa dâng ngọc — tài năng thật sự cần thời gian để tỏa sáng.',
    summary: 'Nỗ lực âm thầm của bạn chưa được nhiều người thấy ngay, nhưng giá trị thật sự đang tích lũy vững chắc.',
    family: 'Yên ấm, giản dị mà bền chặt.',
    career: 'Hãy tiếp tục trau dồi tay nghề, kiến thức; kết quả tốt sẽ đến vào dịp tới.',
    health: 'Bình ổn, nên giữ nhịp sinh hoạt đều đặn.',
    dharmaAdvice: 'Đừng buồn khi việc thiện chưa ai hay; nhân lành gieo xuống không bao giờ mất.'
  },
  {
    number: 39,
    rank: 'Trung Bình',
    rankTone: 'amber',
    title: 'Thủ Cựu An Thường · Giữ Vững Nền Cũ',
    poem: [
      'Đường xa chớ vội đổi sang ngang,',
      'Giữ nếp nhà xưa dạ vững vàng.',
      'Chắt chiu từng bước niềm an ổn,',
      'Qua cơn nắng gắt gặp mưa ngàn.'
    ],
    story: 'Điển tích: Khương Nữ tìm chồng — thủy chung giữ chí vượt qua thử thách.',
    summary: 'Quẻ khuyên nên trân trọng và giữ gìn những gì đang có, tránh đứng núi này trông núi nọ hoặc chi tiêu quá tay.',
    family: 'Giữ gìn hòa khí vợ chồng, cha mẹ con cái bằng sự nhường nhịn.',
    career: 'Tập trung hoàn thiện việc đang làm, chưa nên nhảy việc hay mở rộng ồ ạt.',
    health: 'Chú ý giữ ấm khi đổi mùa, tránh làm việc quá sức.',
    dharmaAdvice: 'Tri túc thường lạc — biết đủ giữa đời thường là giàu có nhất.'
  },
  {
    number: 45,
    rank: 'Thượng Thượng',
    rankTone: 'gold',
    title: 'Nhân Hòa Đức Vượng · Hoa Nở Mãn Viên',
    poem: [
      'Ôn nhu đức hạnh cảm lòng người,',
      'Trước ngõ hoa thơm nở rạng ngời.',
      'Cầu phước cầu an đều ứng nghiệm,',
      'Xuân về hỷ lạc khắp muôn nơi.'
    ],
    story: 'Điển tích: Nhân Tông nhận mẫu — hiếu hạnh và nhân từ cảm động lòng trời.',
    summary: 'Quẻ rất đẹp về nhân duyên và phước báu. Lòng nhân hậu của bạn đem lại sự yêu mến và thuận lợi dài lâu.',
    family: 'Hòa mục vui vầy, có tin hỷ sự hoặc đoàn tụ đáng mừng.',
    career: 'Công việc phát triển bền bỉ, giao tiếp và thương lượng dễ thành.',
    health: 'Thân khỏe tâm an, tràn đầy năng lượng tích cực.',
    dharmaAdvice: 'Nuôi dưỡng lòng từ bi với mọi loài, phước lành sẽ tự nhiên lan tỏa.'
  },
  {
    number: 52,
    rank: 'Trung Cát',
    rankTone: 'jade',
    title: 'Thủy Trung Lao Nguyệt · Tìm Bóng Trăng Thật',
    poem: [
      'Trăng soi đáy nước chớ vội vơ,',
      'Ngẩng đầu nhìn thẳng giữa trời thơ.',
      'Bỏ điều hư ảo tìm chân thật,',
      'Từng bước an nhiên chạm bến bờ.'
    ],
    story: 'Điển tích: Thái Bạch ngắm trăng — phân biệt thật giả sẽ tránh được uổng công.',
    summary: 'Nhắc nhở chọn việc thực chất thay vì chạy theo hình thức. Khi nhìn thẳng vào gốc rễ vấn đề, mọi chuyện trở nên dễ dàng.',
    family: 'Quan tâm chân thành bằng hành động nhỏ quý hơn lời hứa xa vời.',
    career: 'Đánh giá dự án dựa trên thực tế, kiên trì sẽ thu lợi chắc chắn.',
    health: 'Tránh lo nghĩ viển vông; thiền thở 5 phút mỗi ngày giúp nhẹ đầu.',
    dharmaAdvice: 'Quay về sống trọn vẹn với giây phút hiện tại là chìa khóa an lạc.'
  },
  {
    number: 60,
    rank: 'Trung Cát',
    rankTone: 'jade',
    title: 'Bão Tân Cứu Hỏa · Bớt Nóng Thêm Hòa',
    poem: [
      'Gặp cơn nóng giận chớ thêm dầu,',
      'Một phút buông lơi bớt khổ sầu.',
      'Lấy nước cam lồ xoa dịu lại,',
      'Đường đời thanh thản bước bền lâu.'
    ],
    story: 'Điển tích: Xích Bích chi chiến — bình tĩnh dùng trí hơn là nóng nảy dùng sức.',
    summary: 'Nếu có việc chưa vừa ý, chỉ cần hạ giọng và giữ điềm tĩnh thì chuyện lớn hóa nhỏ, chuyện nhỏ hóa không.',
    family: 'Nhường nhau một câu là giữ trọn mái ấm bình yên.',
    career: 'Xử lý khéo léo các bất đồng nơi làm việc sẽ giúp bạn ghi điểm lớn.',
    health: 'Hạn chế đồ cay nóng, giữ tâm bình hòa để huyết áp và giấc ngủ tốt.',
    dharmaAdvice: 'Một niệm sân khởi lên đốt cháy rừng công đức; một hơi thở sâu dập tắt lửa phiền.'
  },
  {
    number: 68,
    rank: 'Thượng Cát',
    rankTone: 'gold',
    title: 'Môn Đình Cát Khánh · Trước Cửa Đón Vui',
    poem: [
      'Môn đình cát khánh rạng ánh mai,',
      'Hương trầm thoang thoảng gió đưa bài.',
      'Thiện tâm tích lũy từ bao thuở,',
      'Nay đến mùa thơm trái ngọt sai.'
    ],
    story: 'Điển tích: Quách Tử Nghi chúc thọ — phúc lộc song toàn nhờ đời sống thanh liêm.',
    summary: 'Vận trình đang lên hương rõ rệt. Những hạt giống thiện lành bạn gieo trước kia nay đến kỳ kết trái.',
    family: 'Trong nhà an vui, người lớn khỏe mạnh, trẻ nhỏ chăm ngoan.',
    career: 'Đắc tài đắc lộc vừa tầm, có cơ hội mở rộng mối quan hệ tốt đẹp.',
    health: 'Tốt lành, tinh thần phấn chấn.',
    dharmaAdvice: 'Tiếp tục giữ nếp sống thiện lương và thường xuyên hồi hướng công đức.'
  },
  {
    number: 74,
    rank: 'Trung Bình',
    rankTone: 'amber',
    title: 'Xuất Lâm Đãi Thời · Thận Trọng Bước Đi',
    poem: [
      'Đứng trước ngã ba chớ vội vàng,',
      'Nghe lời thiện trí xét kỹ càng.',
      'Đi từng bước nhỏ mà ngay ngắn,',
      'Tránh khỏi chông gai giữ bình an.'
    ],
    story: 'Điển tích: Tần Bại Tam Sư — thiếu cẩn trọng dễ vấp, biết lắng nghe sẽ hóa lành.',
    summary: 'Giai đoạn này cần sự tỉnh táo và cẩn mật. Trước mỗi quyết định quan trọng nên hỏi thêm ý kiến người có kinh nghiệm.',
    family: 'Quan tâm chăm sóc sức khỏe người thân và bảo quản tài sản cẩn thận.',
    career: 'Đọc kỹ giấy tờ, giữ kế hoạch dự phòng để luôn chủ động.',
    health: 'Chú ý đi lại cẩn thận, không chủ quan với dấu hiệu mệt mỏi.',
    dharmaAdvice: 'Chánh niệm trong từng bước chân, từng lời nói là tấm khiên bình an.'
  },
  {
    number: 81,
    rank: 'Thượng Cát',
    rankTone: 'gold',
    title: 'Ngô Đồng Lạc Diệp · Thu Sang Đón Phước',
    poem: [
      'Gió thu thoảng nhẹ lá ngô đồng,',
      'Trời cao trong vắt nước xuôi dòng.',
      'Thuyền đầy hoa trái về bến cũ,',
      'Lòng người hoan hỷ thỏa ước mong.'
    ],
    story: 'Điển tích: Phong Tống Đằng Vương Các — gặp gió lành đưa bước đến đích nhanh chóng.',
    summary: 'Mọi kế hoạch đi đường xa, học hành, chuyển đổi hoặc hợp tác đều có gió thuận hỗ trợ.',
    family: 'Đoàn viên ấm áp, chuyện lo âu lắng xuống.',
    career: 'Có tin vui về kết quả thi cử, dự án hoặc doanh thu cải thiện.',
    health: 'Khỏe mạnh, nên ra ngoài hít thở khí trời trong lành.',
    dharmaAdvice: 'Mỗi ngày khởi một niệm biết ơn, cuộc sống sẽ tự nhiên rộng mở.'
  },
  {
    number: 88,
    rank: 'Trung Cát',
    rankTone: 'jade',
    title: 'Lâm Hổ Bất Thương · Tâm Chánh Chẳng Lo',
    poem: [
      'Bóng cây in vách ngỡ hổ gầm,',
      'Nhìn kỹ hóa ra chỉ tối tăm.',
      'Giữ dạ ngay lành không thẹn bóng,',
      'Muôn điều lo sợ tự tiêu tan.'
    ],
    story: 'Điển tích: Bàng Hồng sợ bóng — nỗi lo phần nhiều do tâm tưởng phóng đại.',
    summary: 'Điều bạn đang bận tâm thực ra không nặng nề như bạn nghĩ. Giữ tâm vững vàng và làm việc minh bạch thì mọi sự đều qua êm.',
    family: 'Bình an, bớt lo xa để cả nhà cùng nhẹ nhõm.',
    career: 'Có chút áp lực nhưng hoàn toàn trong khả năng giải quyết của bạn.',
    health: 'Thư giãn tinh thần sẽ thấy cơ thể khỏe khoắn hơn hẳn.',
    dharmaAdvice: 'Tâm bình thì thế giới bình; đừng tự làm khổ mình bằng nỗi lo chưa tới.'
  },
  {
    number: 95,
    rank: 'Thượng Cát',
    rankTone: 'gold',
    title: 'Chí Thành Cảm Ứng · Công Phu Thành Tựu',
    poem: [
      'Một lòng chuyên nhất gắng công tu,',
      'Nước chảy đá mòn chẳng uổng công.',
      'Phật độ người hiền tâm bền bỉ,',
      'Trăm hoa đua nở đón xuân hồng.'
    ],
    story: 'Điển tích: Tào Phi xưng đế — chuẩn bị chu đáo lâu ngày nay gặt hái trọn vẹn.',
    summary: 'Sự bền bỉ và chân thành của bạn là chìa khóa mở mọi cánh cửa. Tiếp tục con đường thiện lành đang đi.',
    family: 'Gia phong vững vàng, con cháu nên người.',
    career: 'Công sức bỏ ra được đền đáp xứng đáng, uy tín ngày càng tăng.',
    health: 'Sức bền tốt, duy trì thói quen lành mạnh hiện tại.',
    dharmaAdvice: 'Tinh tấn đều đặn như giọt nước nhỏ, lâu ngày tất đầy bình công đức.'
  },
  {
    number: 100,
    rank: 'Thượng Thượng',
    rankTone: 'gold',
    title: 'Bách Sự Viên Mãn · Liên Hoa Khai Ngộ',
    poem: [
      'Trăm điều viên mãn tựa sen hồng,',
      'Giữa chốn bùn nhơ vẫn sạch trong.',
      'Chánh niệm giữ gìn tâm tự tại,',
      'Đời vui đạo sáng trọn tấm lòng.'
    ],
    story: 'Điển tích: Hoa sen nở đủ trăm cánh — phước trí song tu, thân tâm an lạc.',
    summary: 'Quẻ viên mãn nhắc rằng hạnh phúc lớn nhất là thân tâm thanh thản. Mọi nguyện lành đều có nhân duyên tốt đẹp trợ thành.',
    family: 'Hòa thuận, ấm êm và nhiều niềm vui giản dị.',
    career: 'Đạt được sự hài hòa giữa công việc và cuộc sống.',
    health: 'An khang, tinh thần sáng suốt.',
    dharmaAdvice: 'Đem niềm vui và sự bình an hôm nay hồi hướng cho gia đình và tất cả chúng sinh.'
  }
]);

export function createFortuneHistoryState() {
  return {
    totalDraws: 0,
    lastReading: null,
    readings: []
  };
}

export function drawFortuneStick(intentionId = 'binh_an', rng = Math.random) {
  const intention = FORTUNE_INTENTIONS.find((i) => i.id === intentionId) || FORTUNE_INTENTIONS[0];
  const r = typeof rng === 'function' ? rng() : Math.random();
  const safeR = Math.max(0, Math.min(0.999999, Number.isFinite(r) ? r : 0));
  const idx = Math.floor(safeR * QUAN_AM_FORTUNE_STICKS.length);
  const stick = QUAN_AM_FORTUNE_STICKS[idx] || QUAN_AM_FORTUNE_STICKS[0];

  return {
    id: `xam_${stick.number}_${Date.now()}`,
    drawnAt: new Date().toISOString(),
    intentionId: intention.id,
    intentionLabel: intention.label,
    stick: { ...stick },
    keoResult: null
  };
}

/**
 * Gieo Keo Âm Dương (2 miếng gỗ hình bán nguyệt):
 * - Nhất âm nhất dương (1 sấp 1 ngửa) => Keo Thuần (ứng quẻ, ~62% để trải nghiệm thân thiện)
 * - Lưỡng dương (2 ngửa) => Keo Cười (hoan hỷ, có thể gieo lại hoặc nhận lời nhắc)
 * - Lưỡng âm (2 sấp) => Keo Âm (chưa thuận, khuyên tĩnh tâm xóc lại)
 */
export function tossYinYangBlocks(rng = Math.random) {
  const r = typeof rng === 'function' ? rng() : Math.random();
  const v = Math.max(0, Math.min(0.999999, Number.isFinite(r) ? r : 0.3));
  if (v < 0.62) {
    return {
      code: 'thuan',
      faces: ['Âm (Sấp)', 'Dương (Ngửa)'],
      label: 'Keo Thuần (Nhất Âm Nhất Dương)',
      approved: true,
      message: 'Đức Quán Thế Âm hoan hỷ chứng giám — quẻ xăm này ứng hợp với tâm nguyện của bạn.'
    };
  }
  if (v < 0.84) {
    return {
      code: 'cuoi',
      faces: ['Dương (Ngửa)', 'Dương (Ngửa)'],
      label: 'Keo Cười (Lưỡng Dương)',
      approved: false,
      message: 'Hai miếng keo cùng ngửa (Keo Cười) — tâm nguyện còn thoáng phân vân, bạn có thể tĩnh tâm gieo lại keo hoặc xóc lại ống xăm.'
    };
  }
  return {
    code: 'am',
    faces: ['Âm (Sấp)', 'Âm (Sấp)'],
    label: 'Keo Âm (Lưỡng Âm)',
    approved: false,
    message: 'Hai miếng keo cùng sấp (Keo Âm) — lời nhắc hãy hít thở sâu, thành tâm định lại điều cầu xin rồi xóc ống xăm lại.'
  };
}

export function recordFortuneReading(state, reading) {
  const base = state && typeof state === 'object' ? state : createFortuneHistoryState();
  if (!reading || !reading.stick) return base;
  const prev = Array.isArray(base.readings) ? base.readings : [];
  const nextReadings = [reading, ...prev.filter((r) => r && r.id !== reading.id)].slice(0, 20);
  return {
    totalDraws: (Number(base.totalDraws) || 0) + 1,
    lastReading: reading,
    readings: nextReadings
  };
}
