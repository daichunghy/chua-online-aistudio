/**
 * Pure domain logic & curated authentic Vietnamese Sutra Study ("Học Kinh Dễ Hiểu")
 * for Chùa Vĩnh Tràng Online — designed to be interactive, joyful, rhythmic,
 * and welcoming for newcomers and elderly visitors alike.
 */

export const SUTRA_REFLECTION_TAGS = [
  'Lòng nhẹ nhõm hơn',
  'Nhớ ơn cha mẹ',
  'Gửi bình an cho con cháu',
  'Học được cách buông lo âu'
];

export const SUTRA_COLLECTION = [
  {
    id: 'tam_kinh_bat_nha',
    order: 1,
    icon: '🪷',
    title: 'Tâm Kinh Bát Nhã (Bản Dễ Hiểu)',
    shortTitle: 'Tâm Kinh Bát Nhã',
    difficulty: 'Rất nổi tiếng · 5 phút',
    sourceTag: 'Kinh Bát Nhã Ba La Mật Đa',
    chantAudioUrl: '/public/audio/sutras/bat_nha_tam_kinh.mp3',
    chantSourceLabel: 'Tiếng tụng Tâm Kinh chùa Tâm Nguyên (Archive.org)',
    meaningOverview:
      'Bài kinh ngắn gọn nhất giúp lòng buông nhẹ nỗi lo âu, thấy chuyện buồn vui đều đến rồi đi như mây bay.',
    dailyStory:
      'Chuyện chiếc ly đầy nước: Nếu cứ nắm chặt nỗi buồn hay giận hờn trong tay, tay sẽ mỏi rã rời. Chỉ cần đặt nhẹ chiếc ly xuống, lòng tự nhiên mát mẻ và thảnh thơi ngay.',
    verses: [
      {
        id: 'bn_1',
        chantLine: 'Quán Tự Tại Bồ Tát hành thâm Bát Nhã Ba La Mật Đa thời,',
        beatUnits: [
          { text: 'Quán Tự Tại', cue: 'bell' },
          { text: 'Bồ Tát', cue: 'mo' },
          { text: 'hành thâm', cue: 'mo' },
          { text: 'Bát Nhã Ba La Mật Đa thời,', cue: 'mo_accent' }
        ],
        plainMeaning:
          'Khi ta lắng tâm lại, nhìn kỹ mọi việc với lòng sáng suốt và từ bi, không còn vội vàng bực dọc.',
        dailyPractice: 'Hít vào nhẹ, thở ra chậm ba hơi trước khi trả lời lúc đang nóng giận.'
      },
      {
        id: 'bn_2',
        chantLine: 'Chiếu kiến ngũ uẩn giai không, độ nhất thiết khổ ách.',
        beatUnits: [
          { text: 'Chiếu kiến', cue: 'mo' },
          { text: 'ngũ uẩn', cue: 'mo' },
          { text: 'giai không,', cue: 'mo_accent' },
          { text: 'độ nhất thiết khổ ách.', cue: 'bell' }
        ],
        plainMeaning:
          'Nhìn thấu năm phần thân tâm (thân thể, cảm giác, suy nghĩ) vốn luôn đổi thay không cố định, nên lòng tự nhiên vượt qua khổ đau.',
        dailyPractice: 'Nhủ thầm khi đau ốm hay buồn lòng: "Cảm giác này rồi cũng sẽ dịu qua thôi."'
      },
      {
        id: 'bn_3',
        chantLine: 'Sắc bất dị không, không bất dị sắc; sắc tức thị không, không tức thị sắc.',
        beatUnits: [
          { text: 'Sắc bất dị không,', cue: 'mo' },
          { text: 'không bất dị sắc;', cue: 'mo' },
          { text: 'sắc tức thị không,', cue: 'mo' },
          { text: 'không tức thị sắc.', cue: 'mo_accent' }
        ],
        plainMeaning:
          'Mọi hình dáng vật chất ngoài đời đều do nhiều duyên hợp lại mà thành, như bông hoa nhờ đất, nước, nắng mà nở rồi lại tàn.',
        dailyPractice: 'Trân quý từng bữa cơm sum họp hôm nay, nhưng không quá lo sợ ngày mai đổi thay.'
      },
      {
        id: 'bn_4',
        chantLine: 'Tâm vô quái ngại, vô quái ngại cố, vô hữu khủng bố.',
        beatUnits: [
          { text: 'Tâm vô quái ngại,', cue: 'mo' },
          { text: 'vô quái ngại cố,', cue: 'mo' },
          { text: 'vô hữu', cue: 'mo' },
          { text: 'khủng bố.', cue: 'bell' }
        ],
        plainMeaning:
          'Khi trong lòng không còn vướng bận, chấp nê hay lo giữ khư khư, tự khắc tâm trí không còn sợ hãi bất an.',
        dailyPractice: 'Buổi tối trước khi ngủ, thả lỏng vai và đặt hết việc nhà sang một bên.'
      },
      {
        id: 'bn_5',
        chantLine: 'Viễn ly điên đảo mộng tưởng, cứu cánh Niết Bàn.',
        beatUnits: [
          { text: 'Viễn ly', cue: 'mo' },
          { text: 'điên đảo mộng tưởng,', cue: 'mo' },
          { text: 'cứu cánh', cue: 'mo' },
          { text: 'Niết Bàn.', cue: 'mo_accent' }
        ],
        plainMeaning:
          'Xa rời những suy diễn lo xa không có thật, ta chạm ngay được sự bình yên thanh thản ngay trong hiện tại.',
        dailyPractice: 'Sống trọn vẹn với giây phút đang có: uống tách trà nóng, nghe tiếng chim ngoài hiên.'
      },
      {
        id: 'bn_6',
        chantLine: 'Yết đế yết đế, ba la yết đế, ba la tăng yết đế, Bồ Đề tát bà ha.',
        beatUnits: [
          { text: 'Yết đế yết đế,', cue: 'mo' },
          { text: 'ba la yết đế,', cue: 'mo' },
          { text: 'ba la tăng yết đế,', cue: 'mo' },
          { text: 'Bồ Đề tát bà ha.', cue: 'bell' }
        ],
        plainMeaning:
          'Cùng bước qua bờ bên kia của bình an, cùng dắt tay nhau vượt qua phiền não đến bến giác ngộ.',
        dailyPractice: 'Chúc người thân một câu nhẹ nhàng: "Chúc cả nhà hôm nay bình an."'
      }
    ],
    fillBlankPuzzles: [
      {
        prompt: 'Chiếu kiến ngũ uẩn giai ___, độ nhất thiết khổ ách.',
        options: ['không', 'giàu', 'cứng'],
        correctIndex: 0,
        explanation:
          'Đáp án đúng là "không" — nghĩa là mọi sự luôn chuyển biến mềm dẻo, không cứng nhắc vĩnh viễn, hiểu vậy lòng sẽ hết khổ.'
      },
      {
        prompt: 'Tâm vô quái ngại, vô quái ngại cố, vô hữu ___.',
        options: ['giận dữ', 'khủng bố', 'bận rộn'],
        correctIndex: 1,
        explanation:
          '"Vô hữu khủng bố" nghĩa là khi lòng buông nhẹ chấp giữ thì không còn sợ hãi bất an.'
      },
      {
        prompt: 'Viễn ly điên đảo mộng tưởng, cứu cánh ___.',
        options: ['Niết Bàn', 'Cửa hàng', 'Giấc ngủ'],
        correctIndex: 0,
        explanation:
          'Khi dứt bỏ lo âu hão huyền, ngay nơi tâm bình lặng chính là Niết Bàn an vui.'
      }
    ]
  },

  {
    id: 'kinh_tu_bi',
    order: 2,
    icon: '💚',
    title: 'Kinh Từ Bi (Metta Sutta)',
    shortTitle: 'Kinh Từ Bi',
    difficulty: 'Dịu dàng · 4 phút',
    sourceTag: 'Kinh Tập · Chú giải Tâm Từ',
    chantAudioUrl: '/public/audio/sutras/kinh_tu_bi.mp3',
    chantSourceLabel: 'Tiếng tụng Kinh Từ Bi truyền thống (Archive.org)',
    meaningOverview:
      'Bài kinh gieo trồng lòng thương hiền hòa như tấm lòng người mẹ hiền, giúp gia đình hòa thuận, ngủ ngon giấc.',
    dailyStory:
      'Tấm lòng người mẹ: Một người mẹ dù mệt nhọc thế nào cũng luôn muốn che chở cho đứa con duy nhất. Đức Phật dạy ta hãy mở rộng chút lòng thương dịu dàng ấy đến với bà con, hàng xóm và muôn loài.',
    verses: [
      {
        id: 'tb_1',
        chantLine: 'Người khéo tu tập nên giữ tâm ngay thẳng, khiêm cung, hiền hòa.',
        beatUnits: [
          { text: 'Người khéo tu tập', cue: 'bell' },
          { text: 'nên giữ tâm ngay thẳng,', cue: 'mo' },
          { text: 'khiêm cung,', cue: 'mo' },
          { text: 'hiền hòa.', cue: 'mo_accent' }
        ],
        plainMeaning:
          'Người có lòng lành luôn sống chân thật, nói lời dễ nghe, không tự cao và không nóng nảy với người quanh mình.',
        dailyPractice: 'Hôm nay gặp hàng xóm hoặc con cháu, nở nụ cười hiền và hỏi thăm một câu ấm áp.'
      },
      {
        id: 'tb_2',
        chantLine: 'Biết đủ, dễ nuôi, ít việc bận rộn, đời sống thanh bần nhẹ nhàng.',
        beatUnits: [
          { text: 'Biết đủ, dễ nuôi,', cue: 'mo' },
          { text: 'ít việc bận rộn,', cue: 'mo' },
          { text: 'đời sống', cue: 'mo' },
          { text: 'thanh bần nhẹ nhàng.', cue: 'mo_accent' }
        ],
        plainMeaning:
          'Ăn uống giản dị, bằng lòng với những gì mình đang có, không bon chen hơn thua để lòng luôn thảnh thơi.',
        dailyPractice: 'Bữa cơm hôm nay có món gì ăn ngon miệng món nấy, lòng vui vẻ biết ơn.'
      },
      {
        id: 'tb_3',
        chantLine: 'Nguyện cho tất cả chúng sinh đều được an vui và tự tại.',
        beatUnits: [
          { text: 'Nguyện cho', cue: 'mo' },
          { text: 'tất cả chúng sinh', cue: 'mo' },
          { text: 'đều được an vui', cue: 'mo' },
          { text: 'và tự tại.', cue: 'bell' }
        ],
        plainMeaning:
          'Gửi lời chúc bình an từ đáy lòng đến mọi người — người quen cũng như người lạ, từ trẻ nhỏ đến cụ già.',
        dailyPractice: 'Khi đi ngoài đường hay trong chùa, thầm chúc: "Mong ai cũng mạnh khỏe bình an."'
      },
      {
        id: 'tb_4',
        chantLine: 'Đừng ai lừa dối nhau, đừng ai khinh mạn hay mong người khác đau khổ.',
        beatUnits: [
          { text: 'Đừng ai lừa dối nhau,', cue: 'mo' },
          { text: 'đừng ai khinh mạn', cue: 'mo' },
          { text: 'hay mong người khác', cue: 'mo' },
          { text: 'đau khổ.', cue: 'mo_accent' }
        ],
        plainMeaning:
          'Giữ lời nói chân thành, tôn trọng mọi người dù giàu hay nghèo, không nói lời làm tổn thương nhau.',
        dailyPractice: 'Trước khi góp ý ai, nghĩ xem lời mình nói có làm người nghe buồn lòng không.'
      },
      {
        id: 'tb_5',
        chantLine: 'Như mẹ hiền thương con một, dùng cả thân mạng chở che giữ gìn.',
        beatUnits: [
          { text: 'Như mẹ hiền', cue: 'mo' },
          { text: 'thương con một,', cue: 'mo' },
          { text: 'dùng cả thân mạng', cue: 'mo' },
          { text: 'chở che giữ gìn.', cue: 'bell' }
        ],
        plainMeaning:
          'Lòng từ bi đẹp đẽ nhất giống như tình thương vô điều kiện của người mẹ dành cho con mình.',
        dailyPractice: 'Bao dung thêm một chút cho lỗi nhỏ của người thân trong nhà.'
      },
      {
        id: 'tb_6',
        chantLine: 'Rải tâm từ vô lượng khắp bốn phương trời, không oán hờn, không giận dữ.',
        beatUnits: [
          { text: 'Rải tâm từ vô lượng', cue: 'mo' },
          { text: 'khắp bốn phương trời,', cue: 'mo' },
          { text: 'không oán hờn,', cue: 'mo' },
          { text: 'không giận dữ.', cue: 'bell' }
        ],
        plainMeaning:
          'Mỗi sáng thức dậy hay tối đi ngủ, giữ tâm không giận hờn ai, nhờ vậy giấc ngủ sâu và lòng nhẹ nhàng.',
        dailyPractice: 'Nhắm mắt 10 giây, thầm gửi lời chúc lành cho một người từng làm mình buồn.'
      }
    ],
    fillBlankPuzzles: [
      {
        prompt: 'Nguyện cho tất cả chúng sinh đều được ___ và tự tại.',
        options: ['an vui', 'vội vã', 'giàu sang'],
        correctIndex: 0,
        explanation:
          'Chính xác! "An vui và tự tại" là món quà lớn nhất ta cầu chúc cho mọi người qua Kinh Từ Bi.'
      },
      {
        prompt: 'Như ___ thương con một, dùng cả thân mạng chở che giữ gìn.',
        options: ['người bạn', 'mẹ hiền', 'ông thầy'],
        correctIndex: 1,
        explanation:
          'Đức Phật ví lòng từ bi rộng lớn như tình thương bao la của "mẹ hiền" dành cho con thơ.'
      },
      {
        prompt: 'Rải tâm từ vô lượng khắp bốn phương trời, không oán hờn, không ___.',
        options: ['nói cười', 'giận dữ', 'làm việc'],
        correctIndex: 1,
        explanation:
          'Không giữ giận dữ trong lòng giúp tâm hồn ta thanh thản suốt cả ngày.'
      }
    ]
  },

  {
    id: 'kinh_phuoc_duc',
    order: 3,
    icon: '🏡',
    title: 'Kinh Phước Đức (Hạnh Phúc)',
    shortTitle: 'Kinh Phước Đức',
    difficulty: 'Gần gũi · 5 phút',
    sourceTag: 'Kinh Hạnh Phúc · Mangala Sutta',
    chantAudioUrl: '/public/audio/sutras/kinh_phuoc_duc.mp3',
    chantSourceLabel: 'Tiếng tụng Kinh Hạnh Phúc chùa truyền thống (Archive.org)',
    meaningOverview:
      'Những điều tạo nên phước báu thật sự ngay trong gia đình: gần gũi người hiền, hiếu kính cha mẹ, nói lời dịu dàng.',
    dailyStory:
      'Ai cũng đi chùa cầu phước, nhưng Đức Phật chỉ rõ phước báu nằm ngay ở nhà mình: buổi sáng chào cha mẹ vui vẻ, nhường nhịn vợ chồng, dạy con cháu điều hay, giúp xóm giềng lúc khó khăn.',
    verses: [
      {
        id: 'pd_1',
        chantLine: 'Không gần gũi kẻ ác, thân cận bậc hiền lương, kính trọng người đáng kính.',
        beatUnits: [
          { text: 'Không gần gũi kẻ ác,', cue: 'bell' },
          { text: 'thân cận bậc hiền lương,', cue: 'mo' },
          { text: 'kính trọng', cue: 'mo' },
          { text: 'người đáng kính.', cue: 'mo_accent' }
        ],
        plainMeaning:
          'Chọn bạn lành mà chơi, học hỏi người đức hạnh, giữ lễ phép với người lớn tuổi — đó là phước lành thứ nhất.',
        dailyPractice: 'Kể cho con cháu nghe một câu chuyện tốt đẹp về người hiền quanh xóm.'
      },
      {
        id: 'pd_2',
        chantLine: 'Biết giữ gìn thân tâm, sống nơi hoàn cảnh tốt, năng làm việc phước thiện.',
        beatUnits: [
          { text: 'Biết giữ gìn thân tâm,', cue: 'mo' },
          { text: 'sống nơi hoàn cảnh tốt,', cue: 'mo' },
          { text: 'năng làm việc', cue: 'mo' },
          { text: 'phước thiện.', cue: 'mo_accent' }
        ],
        plainMeaning:
          'Giữ nhà cửa sạch sẽ sáng sủa, chăm lo sức khỏe thân thể và siêng làm việc lành nhỏ mỗi ngày.',
        dailyPractice: 'Tưới cây xanh trước hiên hoặc dọn gọn góc bàn thờ cho ấm cúng.'
      },
      {
        id: 'pd_3',
        chantLine: 'Hiếu kính với mẹ cha, thương yêu gia đình nhỏ, nghề nghiệp sống chân chính.',
        beatUnits: [
          { text: 'Hiếu kính với mẹ cha,', cue: 'mo' },
          { text: 'thương yêu gia đình nhỏ,', cue: 'mo' },
          { text: 'nghề nghiệp', cue: 'mo' },
          { text: 'sống chân chính.', cue: 'bell' }
        ],
        plainMeaning:
          'Phụng dưỡng cha mẹ chu đáo, yêu thương vợ chồng con cháu và làm ăn ngay thẳng — ấy là phước báu lớn nhất.',
        dailyPractice: 'Gọi điện hoặc hỏi thăm sức khỏe người thân trong nhà tối nay.'
      },
      {
        id: 'pd_4',
        chantLine: 'Biết bố thí sẻ chia, nói lời chân thật dịu dàng, tránh xa điều mê say.',
        beatUnits: [
          { text: 'Biết bố thí sẻ chia,', cue: 'mo' },
          { text: 'nói lời chân thật dịu dàng,', cue: 'mo' },
          { text: 'tránh xa', cue: 'mo' },
          { text: 'điều mê say.', cue: 'mo_accent' }
        ],
        plainMeaning:
          'Sẵn lòng giúp đỡ người khó khăn, ăn nói nhẹ nhàng dễ thương, không sa đà rượu chè hay cờ bạc.',
        dailyPractice: 'Dùng một lời khen thật lòng để động viên ai đó hôm nay.'
      },
      {
        id: 'pd_5',
        chantLine: 'Khiêm tốn và biết ơn, bằng lòng điều đang có, giữ tâm luôn bình an.',
        beatUnits: [
          { text: 'Khiêm tốn và biết ơn,', cue: 'mo' },
          { text: 'bằng lòng điều đang có,', cue: 'mo' },
          { text: 'giữ tâm', cue: 'mo' },
          { text: 'luôn bình an.', cue: 'bell' }
        ],
        plainMeaning:
          'Biết cảm ơn hạt cơm, ngụm nước, người giúp mình; không đòi hỏi quá mức để tâm hồn luôn an ổn.',
        dailyPractice: 'Trước bữa cơm, thầm cảm ơn người đã nấu và người làm ra hạt gạo.'
      }
    ],
    fillBlankPuzzles: [
      {
        prompt: 'Không gần gũi kẻ ác, thân cận bậc ___, kính trọng người đáng kính.',
        options: ['hiền lương', 'nổi tiếng', 'giàu có'],
        correctIndex: 0,
        explanation:
          'Gần gũi "bậc hiền lương" giúp ta học theo nết tốt và tránh xa điều rắc rối.'
      },
      {
        prompt: '___ với mẹ cha, thương yêu gia đình nhỏ, nghề nghiệp sống chân chính.',
        options: ['Xa cách', 'Hiếu kính', 'Bận rộn'],
        correctIndex: 1,
        explanation:
          '"Hiếu kính với mẹ cha" là cội nguồn của mọi phước lành trong nhà.'
      },
      {
        prompt: 'Khiêm tốn và ___, bằng lòng điều đang có, giữ tâm luôn bình an.',
        options: ['so sánh', 'biết ơn', 'lo lắng'],
        correctIndex: 1,
        explanation:
          'Lòng "biết ơn" giúp mỗi ngày trôi qua đều nhẹ nhàng và đủ đầy.'
      }
    ]
  },

  {
    id: 'kinh_phap_cu',
    order: 4,
    icon: '📜',
    title: 'Kinh Pháp Cú Chọn Lọc (Kệ 1, 2, 5, 223)',
    shortTitle: 'Kinh Pháp Cú',
    difficulty: 'Dễ thuộc · 4 phút',
    sourceTag: 'HT. Thích Minh Châu dịch Việt',
    chantAudioUrl: '/public/audio/sutras/sam_hoi_thich_tri_quang.mp3',
    chantSourceLabel: 'Âm hưởng tụng kệ trang nghiêm (Archive.org)',
    meaningOverview:
      'Những câu kệ ngắn bốn dòng dễ nhớ suốt đời: tâm dẫn đầu mọi hành động, lấy tình thương hóa giải hận thù.',
    dailyStory:
      'Chuyện cái bóng theo hình: Nắng lên thì bóng theo sát bên chân mình. Lời nói hay ý nghĩ hiền lành cũng thế — niềm vui bình an sẽ đi theo mình cả ngày không rời.',
    verses: [
      {
        id: 'pc_1',
        chantLine: 'Ý dẫn đầu các pháp, ý làm chủ, ý tạo.',
        beatUnits: [
          { text: 'Ý dẫn đầu', cue: 'bell' },
          { text: 'các pháp,', cue: 'mo' },
          { text: 'ý làm chủ,', cue: 'mo' },
          { text: 'ý tạo.', cue: 'mo_accent' }
        ],
        plainMeaning:
          'Mọi lời nói và việc làm đều bắt đầu từ suy nghĩ trong lòng. Nghĩ điều lành thì lời nói và việc làm sẽ đẹp theo.',
        dailyPractice: 'Sáng mở mắt dậy, nghĩ ngay một điều tốt đẹp trước khi bước xuống giường.'
      },
      {
        id: 'pc_2',
        chantLine: 'Nếu với ý thanh tịnh, nói lên hay hành động, an lạc bước theo sau, như bóng không rời hình.',
        beatUnits: [
          { text: 'Nếu với ý thanh tịnh,', cue: 'mo' },
          { text: 'nói lên hay hành động,', cue: 'mo' },
          { text: 'an lạc bước theo sau,', cue: 'mo' },
          { text: 'như bóng không rời hình.', cue: 'bell' }
        ],
        plainMeaning:
          'Làm việc với lòng ngay thẳng, không hại ai, tự nhiên niềm vui và thanh thản sẽ đi theo ta mãi.',
        dailyPractice: 'Nhắc mình làm việc gì cũng giữ lòng ngay thật để tối ngủ thật ngon.'
      },
      {
        id: 'pc_3',
        chantLine: 'Với hận diệt hận thù, đời này không có được; không hận diệt hận thù, là định luật ngàn thu.',
        beatUnits: [
          { text: 'Với hận diệt hận thù,', cue: 'mo' },
          { text: 'đời này không có được;', cue: 'mo' },
          { text: 'không hận diệt hận thù,', cue: 'mo' },
          { text: 'là định luật ngàn thu.', cue: 'bell' }
        ],
        plainMeaning:
          'Lấy nóng giận đáp lại nóng giận chỉ làm lửa cháy to hơn; chỉ có lòng bao dung mới dập tắt được hiềm khích.',
        dailyPractice: 'Nếu ai lỡ nói nặng lời, mỉm cười lặng thinh vài giây để lửa giận tự tắt.'
      },
      {
        id: 'pc_4',
        chantLine: 'Lấy không giận thắng giận, lấy thiện thắng không thiện.',
        beatUnits: [
          { text: 'Lấy không giận', cue: 'mo' },
          { text: 'thắng giận,', cue: 'mo' },
          { text: 'lấy thiện', cue: 'mo' },
          { text: 'thắng không thiện.', cue: 'mo_accent' }
        ],
        plainMeaning:
          'Sự điềm tĩnh thắng được cơn nóng nảy; lòng tốt kiên nhẫn luôn cảm hóa được điều chưa hay.',
        dailyPractice: 'Đáp lại một việc khó chịu hôm nay bằng thái độ điềm đạm nhất có thể.'
      },
      {
        id: 'pc_5',
        chantLine: 'Lấy thí thắng xan tham, lấy chân thật thắng hư dối.',
        beatUnits: [
          { text: 'Lấy thí thắng xan tham,', cue: 'mo' },
          { text: 'lấy chân thật', cue: 'mo' },
          { text: 'thắng hư dối.', cue: 'bell' }
        ],
        plainMeaning:
          'Lấy sự rộng lượng thắng tính ích kỷ, lấy sự thật thà thắng lời gian dối.',
        dailyPractice: 'Chia sẻ một phần trái cây hay lời chúc tốt cho người bên cạnh.'
      }
    ],
    fillBlankPuzzles: [
      {
        prompt: 'Nếu với ý thanh tịnh, nói lên hay hành động, an lạc bước theo sau, như ___ không rời hình.',
        options: ['bóng', 'gió', 'mưa'],
        correctIndex: 0,
        explanation:
          'Đức Phật ví an lạc theo người sống thiện "như bóng không rời hình" — bền bỉ và tự nhiên.'
      },
      {
        prompt: 'Không hận diệt ___, là định luật ngàn thu.',
        options: ['hận thù', 'niềm vui', 'thời gian'],
        correctIndex: 0,
        explanation:
          'Chỉ có lòng không oán hận mới thực sự chấm dứt được hận thù qua nhiều thế hệ.'
      },
      {
        prompt: 'Lấy không giận thắng giận, lấy ___ thắng không thiện.',
        options: ['thiện', 'ồn ào', 'vàng bạc'],
        correctIndex: 0,
        explanation:
          'Lấy lòng "thiện" để cảm hóa điều chưa thiện là sức mạnh êm ái mà bền vững nhất.'
      }
    ]
  },

  {
    id: 'kinh_bao_hieu',
    order: 5,
    icon: '🌺',
    title: 'Kinh Báo Hiếu Cha Mẹ (Vu Lan)',
    shortTitle: 'Kinh Báo Hiếu',
    difficulty: 'Cảm động · 5 phút',
    sourceTag: 'Kinh Vu Lan Bồn & Ân Đức Sinh Thành',
    chantAudioUrl: '/public/audio/sutras/kinh_bao_hieu.mp3',
    chantSourceLabel: 'Tiếng tụng Kinh Báo Hiếu truyền thống (Archive.org)',
    meaningOverview:
      'Gợi nhớ công ơn dưỡng dục của cha mẹ và dạy cách đền đáp bằng sự quan tâm ấm áp, hướng thiện mỗi ngày.',
    dailyStory:
      'Chén cơm hiếu thảo: Cha mẹ già không cần mâm cao cỗ đầy, điều cha mẹ mong nhất chỉ là nghe tiếng con cháu hỏi thăm dịu dàng và thấy gia đình thương yêu nhau.',
    verses: [
      {
        id: 'bh_1',
        chantLine: 'Công cha như núi Thái Sơn, nghĩa mẹ như nước trong nguồn chảy ra.',
        beatUnits: [
          { text: 'Công cha', cue: 'bell' },
          { text: 'như núi Thái Sơn,', cue: 'mo' },
          { text: 'nghĩa mẹ như nước', cue: 'mo' },
          { text: 'trong nguồn chảy ra.', cue: 'mo_accent' }
        ],
        plainMeaning:
          'Ân đức sinh thành nuôi nấng của cha mẹ cao dày như núi, mát lành vô tận như dòng suối đầu nguồn.',
        dailyPractice: 'Tưởng nhớ công ơn cha mẹ, ông bà và thầm gửi lời tri ân sâu sắc.'
      },
      {
        id: 'bh_2',
        chantLine: 'Tâm hiếu là tâm Phật, hạnh hiếu là hạnh Phật.',
        beatUnits: [
          { text: 'Tâm hiếu', cue: 'mo' },
          { text: 'là tâm Phật,', cue: 'mo' },
          { text: 'hạnh hiếu', cue: 'mo' },
          { text: 'là hạnh Phật.', cue: 'bell' }
        ],
        plainMeaning:
          'Người biết thương kính và chăm sóc cha mẹ bằng cả tấm lòng chính là đang sống theo gương sáng của Đức Phật.',
        dailyPractice: 'Nhắc con cháu biết lễ phép, hỏi thăm ông bà cha mẹ mỗi ngày.'
      },
      {
        id: 'bh_3',
        chantLine: 'Khi cha mẹ còn tại thế, hãy kính nuôi bằng lời nói hiền hòa và bữa cơm ấm.',
        beatUnits: [
          { text: 'Khi cha mẹ còn tại thế,', cue: 'mo' },
          { text: 'hãy kính nuôi', cue: 'mo' },
          { text: 'bằng lời nói hiền hòa', cue: 'mo' },
          { text: 'và bữa cơm ấm.', cue: 'mo_accent' }
        ],
        plainMeaning:
          'Phụng dưỡng cha mẹ không chỉ lo vật chất mà quan trọng nhất là nét mặt vui vẻ, lời thưa gửi ân cần.',
        dailyPractice: 'Dành 10 phút ngồi trò chuyện lắng nghe người lớn tuổi trong gia đình.'
      },
      {
        id: 'bh_4',
        chantLine: 'Nếu cha mẹ đã quá vãng, nguyện làm việc thiện lành hồi hướng công đức.',
        beatUnits: [
          { text: 'Nếu cha mẹ đã quá vãng,', cue: 'mo' },
          { text: 'nguyện làm việc thiện lành', cue: 'mo' },
          { text: 'hồi hướng', cue: 'mo' },
          { text: 'công đức.', cue: 'bell' }
        ],
        plainMeaning:
          'Mỗi khi ta làm việc tốt, tụng một câu kinh, giữ tâm lành đều góp phần đem ánh sáng an vui về cho cửu huyền thất tổ.',
        dailyPractice: 'Chắp tay hồi hướng công đức buổi học kinh hôm nay cho ông bà cha mẹ.'
      },
      {
        id: 'bh_5',
        chantLine: 'Nam Mô Đại Hiếu Mục Kiền Liên Bồ Tát Ma Ha Tát.',
        beatUnits: [
          { text: 'Nam Mô', cue: 'mo' },
          { text: 'Đại Hiếu Mục Kiền Liên', cue: 'mo' },
          { text: 'Bồ Tát', cue: 'mo' },
          { text: 'Ma Ha Tát.', cue: 'bell' }
        ],
        plainMeaning:
          'Noi gương Ngài Mục Kiền Liên chí hiếu, giữ trọn đạo làm con cháu và làm người hiền thiện.',
        dailyPractice: 'Giữ gia phong hòa thuận chính là món quà Vu Lan đẹp nhất.'
      }
    ],
    fillBlankPuzzles: [
      {
        prompt: 'Tâm hiếu là ___, hạnh hiếu là hạnh Phật.',
        options: ['tâm Phật', 'tâm buồn', 'tâm vội'],
        correctIndex: 0,
        explanation:
          'Câu kinh vàng nhắc nhở: lòng hiếu thảo chân thành chính là "tâm Phật" gần gũi nhất.'
      },
      {
        prompt: 'Khi cha mẹ còn tại thế, hãy kính nuôi bằng lời nói ___ và bữa cơm ấm.',
        options: ['ồn ào', 'hiền hòa', 'vội vàng'],
        correctIndex: 1,
        explanation:
          'Lời nói "hiền hòa" và thái độ kính trọng làm cha mẹ ấm lòng hơn mọi vật quý giá.'
      },
      {
        prompt: 'Nếu cha mẹ đã quá vãng, nguyện làm việc ___ hồi hướng công đức.',
        options: ['thiện lành', 'ồn ã', 'xa xỉ'],
        correctIndex: 0,
        explanation:
          'Làm việc "thiện lành" và sống tốt đẹp là cách báo hiếu sâu sắc nhất cho tổ tiên.'
      }
    ]
  },

  {
    id: 'niem_phat_hoi_huong',
    order: 6,
    icon: '🔔',
    title: 'Kệ Niệm Phật & Hồi Hướng Công Đức',
    shortTitle: 'Niệm Phật & Hồi Hướng',
    difficulty: 'Rất dễ · Cho người mới',
    sourceTag: 'Nghi Thức Tụng Niệm Chùa Vĩnh Tràng',
    chantAudioUrl: '/Mô hình 3D Vĩnh Tràng/audio_v5/s6_hoi_huong.mp3',
    chantSourceLabel: 'Pháp âm Chánh điện Chùa Vĩnh Tràng',
    meaningOverview:
      'Bài kệ mở đầu và kết thúc mỗi thời tụng niệm, dễ thuộc nhất cho cô chú mới tập tụng kinh tại nhà.',
    dailyStory:
      'Ngọn nến chia ánh sáng: Ta dùng cây nến đang cháy châm sang trăm cây nến khác, ánh sáng quanh phòng rực rỡ hơn mà ngọn nến ban đầu vẫn sáng nguyên vẹn. Hồi hướng công đức cũng vậy!',
    verses: [
      {
        id: 'np_1',
        chantLine: 'Nam Mô Bổn Sư Thích Ca Mâu Ni Phật.',
        beatUnits: [
          { text: 'Nam Mô', cue: 'bell' },
          { text: 'Bổn Sư', cue: 'mo' },
          { text: 'Thích Ca Mâu Ni', cue: 'mo' },
          { text: 'Phật.', cue: 'mo_accent' }
        ],
        plainMeaning:
          'Con xin kính lễ Đức Phật Thích Ca — vị Thầy chỉ đường sáng suốt giúp con sống hiền lành và an lạc.',
        dailyPractice: 'Đọc chậm rãi ba lần mỗi sáng khi đứng trước bàn thờ hoặc nhìn hoa sen.'
      },
      {
        id: 'np_2',
        chantLine: 'Nam Mô A Di Đà Phật — Quán niệm ánh sáng vô lượng và lòng từ bi.',
        beatUnits: [
          { text: 'Nam Mô', cue: 'mo' },
          { text: 'A Di Đà', cue: 'mo' },
          { text: 'Phật —', cue: 'mo_accent' },
          { text: 'ánh sáng từ bi.', cue: 'bell' }
        ],
        plainMeaning:
          'Niệm danh hiệu Đức Phật A Di Đà để thu gọn tâm trí đang rối bời về một điểm sáng bình yên.',
        dailyPractice: 'Khi chờ xe, đi bộ hay khó ngủ, nhẩm nhịp đều theo từng bước chân hoặc hơi thở.'
      },
      {
        id: 'np_3',
        chantLine: 'Nguyện đem công đức này, hướng về khắp tất cả.',
        beatUnits: [
          { text: 'Nguyện đem', cue: 'mo' },
          { text: 'công đức này,', cue: 'mo' },
          { text: 'hướng về', cue: 'mo' },
          { text: 'khắp tất cả.', cue: 'mo_accent' }
        ],
        plainMeaning:
          'Không giữ niềm vui làm kinh riêng cho mình, con xin gửi phần công đức tốt lành này đến muôn nhà.',
        dailyPractice: 'Kết thúc việc thiện nào cũng mỉm cười gửi niềm vui ấy cho gia đình.'
      },
      {
        id: 'np_4',
        chantLine: 'Đệ tử và chúng sinh, đều trọn thành Phật đạo.',
        beatUnits: [
          { text: 'Đệ tử', cue: 'mo' },
          { text: 'và chúng sinh,', cue: 'mo' },
          { text: 'đều trọn thành', cue: 'mo' },
          { text: 'Phật đạo.', cue: 'bell' }
        ],
        plainMeaning:
          'Cầu mong mình và hết thảy mọi người đều cùng sáng suốt, hiền thiện và bình an.',
        dailyPractice: 'Chắp tay nhẹ nhàng khép lại buổi học kinh trong sự hoan hỷ.'
      }
    ],
    fillBlankPuzzles: [
      {
        prompt: 'Nguyện đem ___ này, hướng về khắp tất cả.',
        options: ['công đức', 'tiền bạc', 'lo âu'],
        correctIndex: 0,
        explanation:
          'Mỗi buổi tụng kinh xong đều đọc "Nguyện đem công đức này" để chia sẻ phước lành tới mọi người.'
      },
      {
        prompt: 'Đệ tử và chúng sinh, đều trọn thành ___.',
        options: ['Phật đạo', 'giấc mơ', 'chuyến đi'],
        correctIndex: 0,
        explanation:
          '"Đều trọn thành Phật đạo" là lời nguyện đẹp nhất mong ai cũng sống tỉnh thức và bình an.'
      },
      {
        prompt: 'Nam Mô Bổn Sư ___ Mâu Ni Phật.',
        options: ['Thích Ca', 'Quán Âm', 'Di Lặc'],
        correctIndex: 0,
        explanation:
          'Đức Bổn Sư Thích Ca Mâu Ni Phật là vị Phật lịch sử khai sáng Đạo Phật trên cõi đời.'
      }
    ]
  }
];

/**
 * Normalizes saved sutra study progress state cleanly.
 * @param {any} raw
 */
export function createSutraStudyState(raw = {}) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const validIds = new Set(SUTRA_COLLECTION.map((s) => s.id));

  const completedSutras = Array.isArray(src.completedSutras)
    ? Array.from(new Set(src.completedSutras.filter((id) => validIds.has(id))))
    : [];

  const puzzleSolved = {};
  if (src.puzzleSolved && typeof src.puzzleSolved === 'object') {
    for (const [k, v] of Object.entries(src.puzzleSolved)) {
      if (validIds.has(k) && Array.isArray(v)) {
        puzzleSolved[k] = Array.from(
          new Set(v.map((n) => Number(n)).filter((n) => Number.isInteger(n) && n >= 0 && n < 10))
        );
      }
    }
  }

  const keepsakeNotes = Array.isArray(src.keepsakeNotes)
    ? src.keepsakeNotes
        .filter((n) => n && typeof n === 'object' && validIds.has(n.sutraId))
        .slice(0, 24)
    : [];

  return {
    activeSutraId: validIds.has(src.activeSutraId) ? src.activeSutraId : SUTRA_COLLECTION[0].id,
    completedSutras,
    puzzleSolved,
    keepsakeNotes,
    totalMoBeats: Math.max(0, Math.floor(Number(src.totalMoBeats) || 0)),
    totalSessionsCompleted: Math.max(0, Math.floor(Number(src.totalSessionsCompleted) || 0))
  };
}

export function getSutraById(sutraId) {
  return SUTRA_COLLECTION.find((s) => s.id === sutraId) || SUTRA_COLLECTION[0];
}

export function getSutraTotalBeats(sutra) {
  if (!sutra || !Array.isArray(sutra.verses)) return 0;
  return sutra.verses.reduce(
    (sum, v) => sum + (Array.isArray(v.beatUnits) ? v.beatUnits.length : 1),
    0
  );
}

/**
 * Resolves global beat index to the exact verse, local beat unit, and progress percent.
 * @param {object} sutra
 * @param {number} globalBeatIndex
 */
export function resolveSutraBeatPosition(sutra, globalBeatIndex = 0) {
  const target = getSutraById(sutra?.id);
  const verses = target.verses || [];
  const totalBeats = Math.max(1, getSutraTotalBeats(target));
  const clamped = Math.max(0, Math.min(totalBeats - 1, Math.floor(Number(globalBeatIndex) || 0)));

  let cursor = 0;
  for (let vIdx = 0; vIdx < verses.length; vIdx++) {
    const units = verses[vIdx].beatUnits || [];
    for (let bIdx = 0; bIdx < units.length; bIdx++) {
      if (cursor === clamped) {
        return {
          globalBeatIndex: clamped,
          totalBeats,
          verseIndex: vIdx,
          beatIndexInVerse: bIdx,
          verse: verses[vIdx],
          beatUnit: units[bIdx],
          isLastBeat: clamped >= totalBeats - 1,
          progressPercent: Math.round(((clamped + 1) / totalBeats) * 100)
        };
      }
      cursor++;
    }
  }

  return {
    globalBeatIndex: 0,
    totalBeats,
    verseIndex: 0,
    beatIndexInVerse: 0,
    verse: verses[0],
    beatUnit: verses[0]?.beatUnits?.[0] || { text: '', cue: 'mo' },
    isLastBeat: totalBeats <= 1,
    progressPercent: Math.round((1 / totalBeats) * 100)
  };
}

/**
 * Steps the chanting beat cursor forward by 1 beat.
 * Returns { nextBeatIndex, finishedRound, position }.
 */
export function advanceSutraBeat(sutra, currentBeatIndex = 0) {
  const target = getSutraById(sutra?.id);
  const totalBeats = Math.max(1, getSutraTotalBeats(target));
  const cur = Math.max(0, Math.floor(Number(currentBeatIndex) || 0));
  if (cur + 1 >= totalBeats) {
    return {
      nextBeatIndex: totalBeats - 1,
      finishedRound: true,
      position: resolveSutraBeatPosition(target, totalBeats - 1)
    };
  }
  return {
    nextBeatIndex: cur + 1,
    finishedRound: false,
    position: resolveSutraBeatPosition(target, cur + 1)
  };
}

/**
 * Finds the starting global beat index for a given verse index (when user taps a verse directly).
 */
export function getFirstBeatIndexForVerse(sutra, verseIndex = 0) {
  const target = getSutraById(sutra?.id);
  const verses = target.verses || [];
  const safeIdx = Math.max(0, Math.min(verses.length - 1, Math.floor(Number(verseIndex) || 0)));
  let cursor = 0;
  for (let i = 0; i < safeIdx; i++) {
    cursor += (verses[i].beatUnits || []).length;
  }
  return cursor;
}

/**
 * Grades a gentle fill-in-the-blank puzzle in "Ghép Chữ Kệ Kinh".
 */
export function gradeSutraPuzzle(sutraId, puzzleIndex, selectedOptionIndex) {
  const sutra = getSutraById(sutraId);
  const puzzles = sutra.fillBlankPuzzles || [];
  const puzzle = puzzles[puzzleIndex];
  if (!puzzle) {
    return {
      correct: false,
      explanation: 'Không tìm thấy câu kệ này.',
      correctAnswer: ''
    };
  }
  const correct = Number(selectedOptionIndex) === puzzle.correctIndex;
  const correctAnswer = puzzle.options[puzzle.correctIndex] || '';
  return {
    correct,
    explanation: correct
      ? puzzle.explanation
      : `Gợi ý nhẹ: Cô bác thử nghe lại câu "${puzzle.prompt.replace('___', '...')}" và chọn chữ phù hợp nhất nhé!`,
    correctAnswer
  };
}

/**
 * Pure updater when user finishes chanting or saves a "Lá Bồ Đề Ghi Nhớ" keepsake.
 */
export function completeSutraSession(state, sutraId, { noteTag = '', beatsTapped = 0, dateLabel = '' } = {}) {
  const normalized = createSutraStudyState(state);
  const sutra = getSutraById(sutraId);
  const alreadyCompleted = normalized.completedSutras.includes(sutra.id);
  const nextCompleted = alreadyCompleted
    ? normalized.completedSutras
    : [...normalized.completedSutras, sutra.id];

  const cleanTag = String(noteTag || SUTRA_REFLECTION_TAGS[0]).trim() || SUTRA_REFLECTION_TAGS[0];
  const nextNotes = [
    {
      sutraId: sutra.id,
      sutraTitle: sutra.shortTitle,
      noteTag: cleanTag,
      dateLabel: dateLabel || 'Hôm nay'
    },
    ...normalized.keepsakeNotes
  ].slice(0, 24);

  return {
    state: {
      ...normalized,
      activeSutraId: sutra.id,
      completedSutras: nextCompleted,
      keepsakeNotes: nextNotes,
      totalMoBeats: normalized.totalMoBeats + Math.max(0, Math.floor(Number(beatsTapped) || 0)),
      totalSessionsCompleted: normalized.totalSessionsCompleted + 1
    },
    firstTimeCompleted: !alreadyCompleted,
    bonusMeritXp: alreadyCompleted ? 10 : 25
  };
}

export function getSutraMasterySummary(state) {
  const s = createSutraStudyState(state);
  const totalSutras = SUTRA_COLLECTION.length;
  const completedCount = s.completedSutras.length;
  const totalPuzzles = SUTRA_COLLECTION.reduce(
    (sum, item) => sum + (item.fillBlankPuzzles?.length || 0),
    0
  );
  const solvedPuzzles = Object.values(s.puzzleSolved).reduce(
    (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
    0
  );
  return {
    completedCount,
    totalSutras,
    solvedPuzzles,
    totalPuzzles,
    totalMoBeats: s.totalMoBeats,
    totalSessionsCompleted: s.totalSessionsCompleted
  };
}
