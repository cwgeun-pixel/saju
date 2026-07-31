// 인포그래픽 카드의 중국어(번체) 문구 팩
export default {
  // ── 카드 UI 라벨 ──
  ui: {
    // 한자를 이름 옆에 병기할지 (한자권 언어는 이름이 곧 한자라 불필요)
    showHanja: false,
    cardSaju: '四柱原局', cardSipsin: '十神·神煞', cardLuck: '大運·流年',
    cardZiwei: '紫微斗數', cardNatal: '西洋占星', cardYear: '今年運勢', cardGoonghap: '合婚',

    kickerSaju: '四柱八字 · 原局', kickerSipsin: '四柱八字 · 十神',
    kickerLuck: '四柱八字 · 運勢流轉', kickerZiwei: '紫微斗數 · 命盤',
    kickerNatal: '西洋占星 · 本命盤', kickerGoonghap: '合婚 · 兩人的緣分',
    kickerYear: (y) => `紫微斗數 · ${y} 流年`,

    secWongook: '原局四柱', secElements: '五行分布', secStrength: '身強 · 身弱',
    secSipsin: '十神強弱', secSinsal: '神煞', secUnseong: '十二長生',
    secSeyun: (y) => `${y} 流年`, secDaewoon: '大運十年週期',
    secPalaces: '十二宮命盤', secDaxian: '大限流轉',
    secPlanets: '行星配置', secAspects: '主要相位',
    secSihua: '流年四化', secMonths: '每月流轉',
    secAreas: '各領域合婚', secBranchRel: '日支關係',

    pillars: ['時柱', '日柱', '月柱', '年柱'],
    male: '男性', female: '女性', age: (n) => `${n}歲`,
    ageRange: (a, b) => `${a}~${b}歲`, ageFrom: (n) => `${n}歲`,
    unknownTime: '時辰不詳', noName: '我的命盤',
    over: '過旺', under: '不足', strongest: '最強', now: '現在',
    yong: '用神', hee: '喜神', gi: '忌神',
    good: '機會', flat: '平穩', watch: '注意',
    gongmang: (b) => `空亡 · ${b}`,
    yearFlow: (y) => `${y}年的流轉`,
    yearLabel: (y) => `${y}年`,
    liuyear: (s) => `流年 · ${s}`,
    month: (n) => `${n}月`,
    house: (n) => `第${n}宮`,
    orb: (v) => `${v}°`,
    noSinsal: '沒有特別突出的神煞，是一張清爽平和的命局。',
    unknownTimeNote: '出生時辰不詳 — 已略去上升星座與宮位。',
    save: '儲存圖片', share: '分享', making: '製作中…', done: '完成', failed: '失敗',
    embedTitle: (s) => `${s} 摘要卡 · 儲存起來收藏吧`,
    embedSaju: '四柱八字', embedZiwei: '紫微斗數', embedNatal: '西洋占星',
  },

  // ── 오행 ──
  element: { 목: '木', 화: '火', 토: '土', 금: '金', 수: '水' },

  // ── 일간 10종 ──
  daymaster: {
    甲: { title: '筆直向上的參天大樹', desc: '向上筆直生長的氣。領導力與行動力強，一旦定下方向便極少更改。' },
    乙: { title: '柔韌攀繞而上的藤蔓', desc: '柔軟卻堅韌的氣。善於適應環境，能自然地串起人與人之間的連結。' },
    丙: { title: '普照萬物的太陽', desc: '明亮而毫無保留擴散的氣。表達力出眾，帶有照亮周遭的存在感。' },
    丁: { title: '照亮黑暗的燭火', desc: '幽微卻深入滲透的氣。以細膩的洞察讀懂人心深處。' },
    戊: { title: '沉穩守位的高山', desc: '厚重而不動搖的氣。信賴深厚，是周遭倚靠的中心軸。' },
    己: { title: '孕育萬物的肥沃土地', desc: '包容並培育的氣。胸襟寬廣，講求實惠的現實感極佳。' },
    庚: { title: '千錘百鍊的鋼鐵與寶劍', desc: '鋼鐵與寶劍之氣。原則與決斷力強，一旦定下目標便貫徹到底。' },
    辛: { title: '精雕細琢的珠寶', desc: '清澈而銳利閃耀的氣。美感與對完成度的標準與眾不同。' },
    壬: { title: '寬廣深邃的大海', desc: '奔流不息的氣。思考格局寬廣，不畏懼變化。' },
    癸: { title: '滋潤萬物的細雨', desc: '靜靜滲透的氣。直覺敏銳，總能先一步察覺情勢的流向。' },
  },

  // ── 십신 5분류 ──
  sipsinGroup: {
    비겁: { label: '比劫', desc: '自立與競爭之力。強則獨立心旺盛，過旺則化為固執與摩擦。' },
    식상: { label: '食傷', desc: '表達與生產之力。強則才華與創意出眾，過旺則難耐規範的束縛。' },
    재성: { label: '財星', desc: '財富與現實感之力。強則精於實利，過旺則事情鋪得太開而耗損。' },
    관성: { label: '官星', desc: '責任與約束之力。強則在組織中受肯定，過旺則壓力與緊繃加重。' },
    인성: { label: '印星', desc: '學習與庇護之力。強則有利學問與資格，過旺則行動變得遲緩。' },
  },

  // ── 십신 한자 → 표기 ──
  sipsin: {
    本元: '日主', 比肩: '比肩', 劫財: '劫財', 食神: '食神', 傷官: '傷官',
    偏財: '偏財', 正財: '正財', 偏官: '七殺', 正官: '正官', 偏印: '偏印', 正印: '正印',
  },

  // ── 12운성 ──
  unseong: {
    長生: '長生', 沐浴: '沐浴', 冠帶: '冠帶', 乾祿: '建祿', 帝旺: '帝旺', 衰: '衰',
    病: '病', 死: '死', 墓: '墓', 絕: '絕', 絶: '絕', 胎: '胎', 養: '養',
  },

  // ── 신살 ──
  sinsalType: { 길신: '吉神', 중성: '中性', 흉신: '凶神' },
  sinsal: {
    cheonul: { name: '天乙貴人', type: '吉神', desc: '每逢危機總有人相助。關鍵時刻的貴人緣。' },
    munchang: { name: '文昌貴人', type: '吉神', desc: '學問、考試與文筆之星。所學能化為成就。' },
    cheonduk: { name: '天德貴人', type: '吉神', desc: '化解凶險的德星。能避開大災大禍。' },
    wolduk: { name: '月德貴人', type: '吉神', desc: '周遭的陰德深厚。是人緣在背後撐持的位置。' },
    geumyeo: { name: '金輿祿', type: '吉神', desc: '安逸與配偶福分之星。生活的根基安穩。' },
    yangin: { name: '羊刃煞', type: '中性', desc: '如刀刃般鋒利的衝勁。用在專業技術上便是一大利器。' },
    goegang: { name: '魁罡煞', type: '中性', desc: '極端剛強的性情。不是領袖就是孤立，沒有中間地帶。' },
    dohwa: { name: '桃花煞', type: '中性', desc: '吸引人的魅力。有利於藝術、演藝與人際領域。' },
    hongyeom: { name: '紅艷煞', type: '中性', desc: '含蓄的風情與人氣。異性緣不曾間斷。' },
    baekho: { name: '白虎煞', type: '凶神', desc: '慎防突發事故與血光。安全與健康管理是關鍵。' },
  },

  // ── 자미두수 ──
  palace: {
    命宮: '命宮', 兄弟: '兄弟宮', 夫妻: '夫妻宮', 子女: '子女宮', 財帛: '財帛宮', 疾厄: '疾厄宮',
    遷移: '遷移宮', 交友: '交友宮', 官祿: '官祿宮', 田宅: '田宅宮', 福德: '福德宮', 父母: '父母宮',
  },
  star: {
    紫微: '帝王之星。立於中心引領全局的位置。',
    天機: '智慧與謀劃之星。擅長動腦的事務。',
    太陽: '施予光芒之星。在公開的活動中發亮。',
    武曲: '財富與執行之星。憑著韌勁一路推進。',
    天同: '福氣與從容之星。溫和地順勢而行。',
    廉貞: '變動與拚搏之星。在起伏之中成就。',
    天府: '庫藏之星。長於安定與積累。',
    太陰: '細膩的月之星。通曉內心與理財。',
    貪狼: '慾望與才華之星。多才多藝且擅長交際。',
    巨門: '口才之星。以言語與邏輯取勝。',
    天相: '輔佐之星。是居中協調與斡旋的位置。',
    天梁: '長者之星。是原則與庇護之氣。',
    七殺: '開創之星。以正面突破打開局面。',
    破軍: '破壞與重建之星。破除舊有，重新建立。',
  },

  // ── 점성술 ──
  sign: {
    Aries: { name: '牡羊座', trait: '衝在最前線的開創者' },
    Taurus: { name: '金牛座', trait: '不為所動的安定守護者' },
    Gemini: { name: '雙子座', trait: '以好奇心串連一切的傳訊者' },
    Cancer: { name: '巨蟹座', trait: '懷抱並守護的保護者' },
    Leo: { name: '獅子座', trait: '在舞台中央發光的主角' },
    Virgo: { name: '處女座', trait: '補足缺口的完成工匠' },
    Libra: { name: '天秤座', trait: '取得平衡的協調者' },
    Scorpio: { name: '天蠍座', trait: '追根究柢的探索者' },
    Sagittarius: { name: '射手座', trait: '跨越邊界的冒險家' },
    Capricorn: { name: '摩羯座', trait: '一路登頂的攀登者' },
    Aquarius: { name: '水瓶座', trait: '打破框架的革新者' },
    Pisces: { name: '雙魚座', trait: '融化界線的夢想家' },
  },
  planet: {
    Sun: { name: '太陽', key: '身分認同·核心自我' },
    Moon: { name: '月亮', key: '情緒·潛意識' },
    Mercury: { name: '水星', key: '思考·溝通' },
    Venus: { name: '金星', key: '情感·美感' },
    Mars: { name: '火星', key: '行動力·慾望' },
    Jupiter: { name: '木星', key: '擴張·幸運' },
    Saturn: { name: '土星', key: '責任·考驗' },
    Uranus: { name: '天王星', key: '變革·獨創' },
    Neptune: { name: '海王星', key: '理想·靈感' },
    Pluto: { name: '冥王星', key: '轉化·重生' },
    Chiron: { name: '凱龍星', key: '創傷·療癒' },
    NorthNode: { name: '北交點', key: '今生的課題' },
    SouthNode: { name: '南交點', key: '與生俱來的習性' },
    Fortuna: { name: '福點', key: '福氣所在' },
  },
  big3: {
    sun: { label: '太陽', sub: '核心自我' },
    moon: { label: '月亮', sub: '內在情緒' },
    asc: { label: '上升', sub: '外顯印象' },
  },
  aspect: {
    conjunction: { name: '合相', tone: '結合' },
    trine: { name: '三分相', tone: '和諧' },
    sextile: { name: '六分相', tone: '機會' },
    square: { name: '四分相', tone: '緊張' },
    opposition: { name: '對分相', tone: '對立' },
  },

  // ── 궁합 ──
  goonghap: {
    self: '本人', partner: '對方',
    stemRel: {
      SAME: { label: '比和', title: '自在而相似的緣分',
        desc: '同樣的氣，話語投機，從一開始就很自在。只是優缺點也一併相似，需要能互補彼此的柔軟。' },
      A_GEN_B: { label: '相生', title: '引領並滋養的緣分',
        desc: '前者的氣滋養後者的流向。若能留意平衡、別讓付出的一方耗竭，就能長久。' },
      B_GEN_A: { label: '相生', title: '扶持並補足的緣分',
        desc: '後者的氣滋養前者的流向。穩固的支持會化為情感上的安定。' },
      A_CTRL_B: { label: '相剋', title: '強烈而動態的緣分',
        desc: '吸引力有多強，主導權的摩擦就有多大。與其控制不如同行，便能化為推進力。' },
      B_CTRL_A: { label: '相剋', title: '強烈而動態的緣分',
        desc: '吸引力有多強，主導權的摩擦就有多大。若能尊重彼此的步調，就會是最堅實的連結。' },
    },
    branchRel: {
      HEX: { tag: '六合', desc: '日支相合，日常的節奏十分契合。' },
      TRIO: { tag: '三合', desc: '同屬一個三合局，方向自然而然趨於一致。' },
      CLASH: { tag: '沖', desc: '日支相沖，可能出現意料之外的摩擦。' },
      NEUTRAL: { tag: '中立', desc: '日支之間沒有特別的合沖，是一段清淡的關係。' },
    },
    score: {
      5: '錦上添花 — 連日支都相互調和。',
      4: '是一段不錯的緣分。',
      3: '平順而安穩的緣分。',
      2: '需要用心經營的緣分。',
      1: '需要許多耐心與體諒。',
    },
    areas: { emotion: '情感·共鳴', comm: '溝通·交談', stability: '現實·安定' },
    dayGan: (el) => `${el} 日主`,
    yinyangDiff: '陰陽不同，彼此的視角讓對話更加豐富。',
    yinyangSame: '同為一種陰陽，共鳴雖快，卻需要練習接納不同的意見。',
  },

  // ── 문장 템플릿 ──
  tpl: {
    strengthStrong: (el) => `日主之氣偏強。需以${el}洩其力，才能取得平衡。`,
    strengthWeak: (el) => `日主之氣偏弱。需有${el}扶持，才能發揮力量。`,
    strengthEven: (el) => `氣分布均勻，是中和的命局。由${el}掌握整體的流向。`,
    strengthType: { 신강: '身強', 신약: '身弱', 중화: '中和' },
    elementLine: (over, oc, lack, lc) => `${over}有${oc}個最為深厚，${lack}只有${lc}個最為稀薄。`,
    sipsinTop: (label, n, desc) => `${label}有${n}個，最為深厚。${desc}`,
    seyunDesc: (el, tone) => `這是${el}之氣運行的一年。${tone}`,
    toneYong: '正逢用神，流向順遂，鋪陳已久的事情將結出果實。',
    toneHee: '正逢喜神，不至於太過吃力，多能順利化解。',
    toneGi: '正逢忌神，與其擴張，不如以守成為宜。',
    toneFlat: '氣沒有明顯偏頗，是平穩的流向。',
    daewoonNow: (age, gz, sipsin, unseong) =>
      `從${age}歲起進入${gz}大運。${sipsin}之氣主導這十年的大方向，十二長生為${unseong}。`,
    daxianNow: (a, b, palace, gz) => `目前${a}~${b}歲是${palace}啟動的${gz}大限。`,
    natalOverview: (sunSign, sunTrait, moonSign, moonTrait) =>
      `${sunSign}的太陽是${sunTrait}，${moonSign}的月亮則帶有${moonTrait}的質地。`,
    yearLu: (star, palace) => `${star}化祿入${palace}，${palace}的領域就此打開。`,
    yearGi: (star, palace) => `${star}化忌落在${palace}，這一塊宜放慢腳步。`,
  },
};
