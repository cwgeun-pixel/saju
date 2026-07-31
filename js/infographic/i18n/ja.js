// 인포그래픽 카드의 일본어 문구 팩
export default {
  // ── 카드 UI 라벨 ──
  ui: {
    // 한자를 이름 옆에 병기할지 (한자권 언어는 이름이 곧 한자라 불필요)
    showHanja: false,
    cardSaju: '命式', cardSipsin: '通変星・神殺', cardLuck: '大運・年運',
    cardZiwei: '紫微斗数', cardNatal: '西洋占星術', cardYear: '今年の流れ', cardGoonghap: '相性',

    kickerSaju: '四柱推命 · 命式', kickerSipsin: '四柱推命 · 通変星',
    kickerLuck: '四柱推命 · 運の流れ', kickerZiwei: '紫微斗数 · 命盤',
    kickerNatal: 'NATAL CHART', kickerGoonghap: '相性 · 二人の縁',
    kickerYear: (y) => `紫微斗数 · ${y} 流年`,

    secWongook: '命式(原局)', secElements: '五行の配分', secStrength: '身強 · 身弱',
    secSipsin: '通変星の強弱', secSinsal: '神殺', secUnseong: '十二運星',
    secSeyun: (y) => `${y} 年運`, secDaewoon: '大運 10年周期',
    secPalaces: '十二宮 命盤', secDaxian: '大限の流れ',
    secPlanets: '天体の配置', secAspects: '主要アスペクト',
    secSihua: '流年四化', secMonths: '月ごとの流れ',
    secAreas: '分野別の相性', secBranchRel: '日支の関係',

    pillars: ['時柱', '日柱', '月柱', '年柱'],
    male: '男性', female: '女性', age: (n) => `${n}歳`,
    ageRange: (a, b) => `${a}~${b}歳`, ageFrom: (n) => `${n}歳`,
    unknownTime: '時刻不明', noName: '私の命式',
    over: '過多', under: '不足', strongest: '最強', now: '現在',
    yong: '用神', hee: '喜神', gi: '忌神',
    good: '好機', flat: '平穏', watch: '注意',
    gongmang: (b) => `空亡 · ${b}`,
    yearFlow: (y) => `${y}年の流れ`,
    yearLabel: (y) => `${y}年`,
    liuyear: (s) => `流年 · ${s}`,
    month: (n) => `${n}月`,
    house: (n) => `第${n}ハウス`,
    orb: (v) => `${v}°`,
    noSinsal: '目立った神殺のない、すっきりとした命式です。',
    unknownTimeNote: '出生時刻が不明のため、アセンダントとハウスは除外しています。',
    save: '画像を保存', share: 'シェア', making: '作成中…', done: '完了', failed: '失敗',
    embedTitle: (s) => `${s}のまとめカード · 保存してお手元に`,
    embedSaju: '四柱推命', embedZiwei: '紫微斗数', embedNatal: '西洋占星術',
  },

  // ── 오행 ──
  element: { 목: '木', 화: '火', 토: '土', 금: '金', 수: '水' },

  // ── 일간 10종 ──
  daymaster: {
    甲: { title: '真っすぐ伸びる大樹', desc: '上へ真っすぐ伸びる気です。リーダーシップと推進力が強く、一度定めた方向はなかなか曲げません。' },
    乙: { title: '柔らかに巻きついて伸びる蔓', desc: '柔らかくも粘り強い気です。環境によく適応し、人と人を自然につないでいきます。' },
    丙: { title: '万物を照らす太陽', desc: '明るく遠慮なく広がる気です。表現力に優れ、周囲を明るくする存在感があります。' },
    丁: { title: '闇を照らす灯火', desc: 'ほのかでも深く染み入る気です。細やかな洞察で人の本心を読み取ります。' },
    戊: { title: 'どっしりと構える大きな山', desc: '重厚で揺るがない気です。信頼が厚く、周囲が頼る中心軸になります。' },
    己: { title: '万物を育てる肥えた大地', desc: '包み育てる気です。包容力が広く、実を取る現実感覚に優れています。' },
    庚: { title: '鍛え上げられた鋼と宝剣', desc: '鋼・宝剣の気です。原則と決断力が強く、一度定めた目標は最後まで押し通します。' },
    辛: { title: '精緻に磨き上げられた宝石', desc: '澄んで鋭く輝く気です。美的感覚と完成度への基準が人並外れています。' },
    壬: { title: '広く深く流れる海', desc: '滞りなく流れる気です。思考の幅が広く、変化を恐れません。' },
    癸: { title: '万物を潤す霧雨', desc: '静かに染み入る気です。直感が鋭く、状況の流れをいち早く察します。' },
  },

  // ── 십신 5분류 ──
  sipsinGroup: {
    비겁: { label: '比劫', desc: '自立と競争の力です。強ければ独立心が大きく、過ぎれば頑固さや摩擦として現れます。' },
    식상: { label: '食傷', desc: '表現と生産の力です。強ければ才能と創造性に優れ、過ぎれば規則を窮屈に感じます。' },
    재성: { label: '財星', desc: '財と現実感覚の力です。強ければ実利に明るく、過ぎれば手を広げて消耗します。' },
    관성: { label: '官星', desc: '責任と統制の力です。強ければ組織で認められ、過ぎれば重圧とストレスが大きくなります。' },
    인성: { label: '印星', desc: '学びと保護の力です。強ければ学問・資格に有利で、過ぎれば行動が遅れます。' },
  },

  // ── 십신 한자 → 표기 ──
  sipsin: {
    本元: '日主', 比肩: '比肩', 劫財: '劫財', 食神: '食神', 傷官: '傷官',
    偏財: '偏財', 正財: '正財', 偏官: '偏官', 正官: '正官', 偏印: '偏印', 正印: '印綬',
  },

  // ── 12운성 ──
  unseong: {
    長生: '長生', 沐浴: '沐浴', 冠帶: '冠帯', 乾祿: '建禄', 帝旺: '帝旺', 衰: '衰',
    病: '病', 死: '死', 墓: '墓', 絕: '絶', 絶: '絶', 胎: '胎', 養: '養',
  },

  // ── 신살 ──
  sinsalType: { 길신: '吉神', 중성: '中性', 흉신: '凶神' },
  sinsal: {
    cheonul: { name: '天乙貴人', type: '吉神', desc: '危機のたびに人が助けてくれます。肝心な場面での貴人の縁。' },
    munchang: { name: '文昌貴人', type: '吉神', desc: '学問・試験・文筆の星。学びが成果につながります。' },
    cheonduk: { name: '天徳貴人', type: '吉神', desc: '凶を和らげる徳の星。大きな災いを避けて通ります。' },
    wolduk: { name: '月徳貴人', type: '吉神', desc: '周囲の陰徳が厚い配置です。人の縁に支えられます。' },
    geumyeo: { name: '金輿禄', type: '吉神', desc: '安楽と配偶者の福の星。暮らしの基盤が穏やかです。' },
    yangin: { name: '羊刃', type: '中性', desc: '刃のように鋭い推進力。専門技術に使えば大きな武器になります。' },
    goegang: { name: '魁罡', type: '中性', desc: '極端に強い気質。リーダーか孤立か、中間がありません。' },
    dohwa: { name: '桃花', type: '中性', desc: '人を惹きつける魅力。芸術・芸能・対人の分野に有利です。' },
    hongyeom: { name: '紅艶', type: '中性', desc: 'さりげない色気と人気。異性の縁が絶えません。' },
    baekho: { name: '白虎', type: '凶神', desc: '突然の事故・出血に注意。安全と健康の管理が要です。' },
  },

  // ── 자미두수 ──
  palace: {
    命宮: '命宮', 兄弟: '兄弟宮', 夫妻: '夫妻宮', 子女: '子女宮', 財帛: '財帛宮', 疾厄: '疾厄宮',
    遷移: '遷移宮', 交友: '交友宮', 官祿: '官禄宮', 田宅: '田宅宮', 福德: '福徳宮', 父母: '父母宮',
  },
  star: {
    紫微: '帝王の星。中心に立って導く位置です。',
    天機: '知恵と企画の星。頭を使う仕事に強みがあります。',
    太陽: '与える光の星。公の活動で輝きます。',
    武曲: '財と実行の星。粘り強く押し進めます。',
    天同: '福と余裕の星。穏やかに流れに乗ります。',
    廉貞: '変化と勝負の星。起伏の中で成し遂げます。',
    天府: '蔵の星。安定と蓄積に強みがあります。',
    太陰: '繊細な月の星。内面と財の管理に長けています。',
    貪狼: '欲望と才能の星。多才で社交的です。',
    巨門: '弁舌の星。言葉と論理で勝負します。',
    天相: '補佐の星。調整し仲裁する位置です。',
    天梁: '長老の星。原則と保護の気です。',
    七殺: '開拓の星。正面突破で道を開きます。',
    破軍: '破壊と再建の星。古いものを壊して新しく築きます。',
  },

  // ── 점성술 ──
  sign: {
    Aries: { name: 'おひつじ座', trait: '先頭に立ってぶつかっていく開拓者' },
    Taurus: { name: 'おうし座', trait: '揺るがない安定の守り手' },
    Gemini: { name: 'ふたご座', trait: '好奇心でつなぐ伝え手' },
    Cancer: { name: 'かに座', trait: '包み守る保護者' },
    Leo: { name: 'しし座', trait: '舞台の中央で輝く主役' },
    Virgo: { name: 'おとめ座', trait: '隙を埋める完成の職人' },
    Libra: { name: 'てんびん座', trait: '釣り合いを取る調整役' },
    Scorpio: { name: 'さそり座', trait: '最後まで掘り下げる探究者' },
    Sagittarius: { name: 'いて座', trait: '境界を越える冒険家' },
    Capricorn: { name: 'やぎ座', trait: '頂上まで登りきる登山家' },
    Aquarius: { name: 'みずがめ座', trait: '枠を壊す革新者' },
    Pisces: { name: 'うお座', trait: '境界を溶かす夢想家' },
  },
  planet: {
    Sun: { name: '太陽', key: '自己同一性・核となる自我' },
    Moon: { name: '月', key: '感情・無意識' },
    Mercury: { name: '水星', key: '思考・伝達' },
    Venus: { name: '金星', key: '愛情・美意識' },
    Mars: { name: '火星', key: '推進力・欲求' },
    Jupiter: { name: '木星', key: '拡大・幸運' },
    Saturn: { name: '土星', key: '責任・試練' },
    Uranus: { name: '天王星', key: '変革・独創' },
    Neptune: { name: '海王星', key: '理想・霊感' },
    Pluto: { name: '冥王星', key: '変容・再生' },
    Chiron: { name: 'キロン', key: '傷・癒やし' },
    NorthNode: { name: '北交点', key: '人生の課題' },
    SouthNode: { name: '南交点', key: '生まれ持った習性' },
    Fortuna: { name: '幸運点', key: '福の在りか' },
  },
  big3: {
    sun: { label: '太陽', sub: '核となる自我' },
    moon: { label: '月', sub: '内面の感情' },
    asc: { label: '上昇宮', sub: '外に表れる印象' },
  },
  aspect: {
    conjunction: { name: 'コンジャンクション', tone: '結合' },
    trine: { name: 'トライン', tone: '調和' },
    sextile: { name: 'セクスタイル', tone: '好機' },
    square: { name: 'スクエア', tone: '緊張' },
    opposition: { name: 'オポジション', tone: '対立' },
  },

  // ── 궁합 ──
  goonghap: {
    self: '本人', partner: '相手',
    stemRel: {
      SAME: { label: '比和', title: '気楽で似た者同士の縁',
        desc: '同じ気なので話が通じやすく、最初から気楽に過ごせます。ただ長所も短所も似ているため、互いを補い合う柔軟さが必要です。' },
      A_GEN_B: { label: '相生', title: '導き育てる縁',
        desc: '前の人の気が後の人を活かす流れです。与える側が疲れないようバランスを意識すれば、長く続きます。' },
      B_GEN_A: { label: '相生', title: '支え満たしてくれる縁',
        desc: '後の人の気が前の人を活かす流れです。心強い支えが情緒の安定につながります。' },
      A_CTRL_B: { label: '相剋', title: '強烈で躍動的な縁',
        desc: '惹かれ合う力が強い分、主導権をめぐる摩擦も生まれます。支配ではなく同行と捉えれば推進力になります。' },
      B_CTRL_A: { label: '相剋', title: '強烈で躍動的な縁',
        desc: '惹かれ合う力が強い分、主導権をめぐる摩擦も生まれます。互いのペースを尊重すれば、最も強い絆になります。' },
    },
    branchRel: {
      HEX: { tag: '六合', desc: '日支が合となり、日々の呼吸がよく合います。' },
      TRIO: { tag: '三合', desc: '同じ三合局に属し、向かう方向が自然にそろいます。' },
      CLASH: { tag: '沖', desc: '日支が沖のため、思わぬ摩擦が生じることがあります。' },
      NEUTRAL: { tag: '中立', desc: '日支の間に特別な合・沖のない、あっさりとした関係です。' },
    },
    score: {
      5: '申し分のない相性 — 日支まで調和しています。',
      4: '良い縁です。',
      3: '無難で安定した縁です。',
      2: '努力を要する縁です。',
      1: '多くの忍耐と理解が必要です。',
    },
    areas: { emotion: '感情・共感', comm: '会話・意思疎通', stability: '現実・安定' },
    dayGan: (el) => `${el} 日干`,
    yinyangDiff: '陰陽が異なるため、互いの視点が会話を豊かにします。',
    yinyangSame: '同じ陰陽なので共感は早い一方、異なる意見を受け入れる練習が必要です。',
  },

  // ── 문장 템플릿 ──
  tpl: {
    strengthStrong: (el) => `日干の気が強い命式です。${el}で漏らすことで均衡が取れます。`,
    strengthWeak: (el) => `日干の気が弱い命式です。${el}が支えてこそ力を発揮します。`,
    strengthEven: (el) => `気が均等に配された中和の命式です。${el}が流れを整えます。`,
    strengthType: { 신강: '身強', 신약: '身弱', 중화: '中和' },
    elementLine: (over, oc, lack, lc) => `${over}が${oc}個で最も厚く、${lack}が${lc}個で最も薄い配分です。`,
    sipsinTop: (label, n, desc) => `${label}が${n}個で最も厚くなっています。${desc}`,
    seyunDesc: (el, tone) => `${el}の気が巡る年です。${tone}`,
    toneYong: '用神にあたるため流れが順調で、進めてきたことが実を結びます。',
    toneHee: '喜神にあたるため、大きな無理なく無難に運びます。',
    toneGi: '忌神にあたるため、拡大よりも守りに回るほうが有利です。',
    toneFlat: '気が大きく偏らない、穏やかな流れです。',
    daewoonNow: (age, gz, sipsin, unseong) =>
      `${age}歳から${gz}の大運です。${sipsin}の気が10年の大きな流れを導き、十二運星は${unseong}です。`,
    daxianNow: (a, b, palace, gz) => `現在の${a}~${b}歳は${palace}が活性化した${gz}の大限です。`,
    natalOverview: (sunSign, sunTrait, moonSign, moonTrait) =>
      `${sunSign}の太陽は${sunTrait}、${moonSign}の月は${moonTrait}という質を持ちます。`,
    yearLu: (star, palace) => `${star}の化禄が${palace}に入り、${palace}の領域が開けます。`,
    yearGi: (star, palace) => `${star}の化忌は${palace}にあり、この分野は速度を落とすのが賢明です。`,
  },
};
