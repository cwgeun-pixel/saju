// 인포그래픽 카드의 한국어 문구 팩 (다른 언어팩의 기준이 되는 원본)
export default {
  // ── 카드 UI 라벨 ──
  ui: {
    // 한자를 이름 옆에 병기할지 (한자권 언어는 이름이 곧 한자라 불필요)
    showHanja: true,
    cardSaju: '사주 원국', cardSipsin: '십신·신살', cardLuck: '대운·세운',
    cardZiwei: '자미두수', cardNatal: '점성술', cardYear: '올해 흐름', cardGoonghap: '궁합',

    kickerSaju: '四柱命理 · 원국', kickerSipsin: '四柱命理 · 십신',
    kickerLuck: '四柱命理 · 운의 흐름', kickerZiwei: '紫微斗數 · 명반',
    kickerNatal: 'NATAL CHART', kickerGoonghap: '宮合 · 두 사람의 결',
    kickerYear: (y) => `紫微斗數 · ${y} 유년`,

    secWongook: '원국 사주', secElements: '오행 분포', secStrength: '신강 · 신약',
    secSipsin: '십신 강약', secSinsal: '신살', secUnseong: '십이운성',
    secSeyun: (y) => `${y} 세운`, secDaewoon: '대운 10년 주기',
    secPalaces: '십이궁 명반', secDaxian: '대한 흐름',
    secPlanets: '행성 배치', secAspects: '주요 어스펙트',
    secSihua: '유년 사화', secMonths: '월별 흐름',
    secAreas: '영역별 궁합', secBranchRel: '일지 관계',

    pillars: ['시주', '일주', '월주', '년주'],
    male: '남성', female: '여성', age: (n) => `${n}세`,
    ageRange: (a, b) => `${a}~${b}세`, ageFrom: (n) => `${n}세`,
    unknownTime: '시간모름', noName: '내 사주',
    over: '과다', under: '부족', strongest: '최강', now: '현재',
    yong: '용신', hee: '희신', gi: '기신',
    good: '기회', flat: '평이', watch: '주의',
    gongmang: (b) => `공망 · ${b}`,
    yearFlow: (y) => `${y}년의 흐름`,
    yearLabel: (y) => `${y}년`,
    liuyear: (s) => `유년 · ${s}`,
    month: (n) => `${n}월`,
    house: (n) => `${n}하우스`,
    orb: (v) => `${v}°`,
    noSinsal: '두드러진 신살이 없는 담백한 명조입니다.',
    unknownTimeNote: '출생 시간 미상 — 상승궁과 하우스는 제외했습니다.',
    save: '이미지 저장', share: '공유', making: '만드는 중…', done: '완료', failed: '실패',
    embedTitle: (s) => `${s} 요약 카드 · 저장해서 간직하세요`,
    embedSaju: '사주', embedZiwei: '자미두수', embedNatal: '점성술',
  },

  // ── 오행 ──
  element: { 목: '목', 화: '화', 토: '토', 금: '금', 수: '수' },

  // ── 일간 10종 ──
  daymaster: {
    甲: { title: '곧게 뻗는 큰 나무', desc: '위로 곧게 자라는 기운입니다. 리더십과 추진력이 강하고, 한번 세운 방향은 좀처럼 꺾지 않습니다.' },
    乙: { title: '유연하게 감아 오르는 덩굴', desc: '부드럽지만 끈질긴 기운입니다. 환경에 잘 적응하며 사람 사이를 자연스럽게 이어냅니다.' },
    丙: { title: '만물을 비추는 태양', desc: '밝고 거침없이 퍼지는 기운입니다. 표현력이 뛰어나고 주변을 환하게 만드는 존재감이 있습니다.' },
    丁: { title: '어둠을 밝히는 촛불', desc: '은은하지만 깊게 스미는 기운입니다. 섬세한 통찰로 사람의 속마음을 읽어냅니다.' },
    戊: { title: '우직하게 자리를 지키는 큰 산', desc: '묵직하고 흔들리지 않는 기운입니다. 신뢰가 두텁고 주변이 기대는 중심축이 됩니다.' },
    己: { title: '만물을 길러내는 기름진 땅', desc: '품고 키워내는 기운입니다. 포용력이 넓고 실속을 챙기는 현실 감각이 뛰어납니다.' },
    庚: { title: '단단하게 벼려진 강철과 보검', desc: '강철·보검의 기운입니다. 원칙과 결단력이 강하며 한번 정한 목표는 끝까지 밀어붙입니다.' },
    辛: { title: '정교하게 다듬어진 보석', desc: '맑고 예리하게 빛나는 기운입니다. 미적 감각과 완성도에 대한 기준이 남다릅니다.' },
    壬: { title: '넓고 깊게 흐르는 바다', desc: '거침없이 흐르는 기운입니다. 사고의 폭이 넓고 변화를 두려워하지 않습니다.' },
    癸: { title: '만물을 적시는 이슬비', desc: '조용히 스며드는 기운입니다. 직관이 예민하고 상황의 흐름을 먼저 감지합니다.' },
  },

  // ── 십신 5분류 ──
  sipsinGroup: {
    비겁: { label: '비겁', desc: '자립과 경쟁의 힘입니다. 강하면 독립심이 크고, 과하면 고집과 마찰로 나타납니다.' },
    식상: { label: '식상', desc: '표현과 생산의 힘입니다. 강하면 재능과 창의성이 뛰어나고, 과하면 규칙을 답답해합니다.' },
    재성: { label: '재성', desc: '재물과 현실 감각의 힘입니다. 강하면 실리에 밝고, 과하면 일을 벌이다 소모됩니다.' },
    관성: { label: '관성', desc: '책임과 통제의 힘입니다. 강하면 조직에서 인정받고, 과하면 압박과 스트레스가 큽니다.' },
    인성: { label: '인성', desc: '배움과 보호의 힘입니다. 강하면 학문·자격에 유리하고, 과하면 실행이 늦어집니다.' },
  },

  // ── 십신 한자 → 표기 ──
  sipsin: {
    本元: '일간', 比肩: '비견', 劫財: '겁재', 食神: '식신', 傷官: '상관',
    偏財: '편재', 正財: '정재', 偏官: '편관', 正官: '정관', 偏印: '편인', 正印: '정인',
  },

  // ── 12운성 ──
  unseong: {
    長生: '장생', 沐浴: '목욕', 冠帶: '관대', 乾祿: '건록', 帝旺: '제왕', 衰: '쇠',
    病: '병', 死: '사', 墓: '묘', 絕: '절', 絶: '절', 胎: '태', 養: '양',
  },

  // ── 신살 ──
  sinsalType: { 길신: '길신', 중성: '중성', 흉신: '흉신' },
  sinsal: {
    cheonul: { name: '천을귀인', type: '길신', desc: '위기마다 사람이 돕습니다. 결정적 순간의 귀인 인연.' },
    munchang: { name: '문창귀인', type: '길신', desc: '학문·시험·글쓰기의 별. 배움이 성취로 이어집니다.' },
    cheonduk: { name: '천덕귀인', type: '길신', desc: '흉을 덜어내는 덕의 별. 큰 화를 비켜갑니다.' },
    wolduk: { name: '월덕귀인', type: '길신', desc: '주변의 음덕이 두텁습니다. 인복이 받쳐주는 자리.' },
    geumyeo: { name: '금여록', type: '길신', desc: '안락과 배우자 복의 별. 생활의 기반이 편안합니다.' },
    yangin: { name: '양인살', type: '중성', desc: '칼처럼 날선 추진력. 전문 기술로 쓰면 큰 무기가 됩니다.' },
    goegang: { name: '괴강살', type: '중성', desc: '극단적으로 강한 기질. 리더 아니면 고립, 중간이 없습니다.' },
    dohwa: { name: '도화살', type: '중성', desc: '사람을 끄는 매력. 예술·연예·대인 분야에 유리합니다.' },
    hongyeom: { name: '홍염살', type: '중성', desc: '은근한 색기와 인기. 이성 인연이 끊이지 않습니다.' },
    baekho: { name: '백호살', type: '흉신', desc: '급작스런 사고·혈광 주의. 안전과 건강 관리가 핵심.' },
  },

  // ── 자미두수 ──
  palace: {
    命宮: '명궁', 兄弟: '형제궁', 夫妻: '부처궁', 子女: '자녀궁', 財帛: '재백궁', 疾厄: '질액궁',
    遷移: '천이궁', 交友: '교우궁', 官祿: '관록궁', 田宅: '전택궁', 福德: '복덕궁', 父母: '부모궁',
  },
  star: {
    紫微: '제왕의 별. 중심에 서서 이끄는 자리입니다.',
    天機: '지혜와 기획의 별. 머리 쓰는 일에 강합니다.',
    太陽: '베푸는 빛의 별. 공적인 활동에서 빛납니다.',
    武曲: '재물과 실행의 별. 뚝심 있게 밀어붙입니다.',
    天同: '복과 여유의 별. 온화하게 흐름을 탑니다.',
    廉貞: '변화와 승부의 별. 굴곡 속에 성취합니다.',
    天府: '창고의 별. 안정과 축적에 강합니다.',
    太陰: '섬세한 달의 별. 내면과 재물 관리에 밝습니다.',
    貪狼: '욕망과 재능의 별. 다재다능하고 사교적입니다.',
    巨門: '언변의 별. 말과 논리로 승부합니다.',
    天相: '보좌의 별. 조율하고 중재하는 자리입니다.',
    天梁: '어른의 별. 원칙과 보호의 기운입니다.',
    七殺: '개척의 별. 정면 돌파로 판을 엽니다.',
    破軍: '파괴와 재건의 별. 낡은 것을 부수고 새로 세웁니다.',
  },

  // ── 점성술 ──
  sign: {
    Aries: { name: '양자리', trait: '앞장서서 부딪히는 개척자' },
    Taurus: { name: '황소자리', trait: '흔들리지 않는 안정의 수호자' },
    Gemini: { name: '쌍둥이자리', trait: '호기심으로 연결하는 전달자' },
    Cancer: { name: '게자리', trait: '품고 지켜내는 보호자' },
    Leo: { name: '사자자리', trait: '무대 중앙에서 빛나는 주인공' },
    Virgo: { name: '처녀자리', trait: '빈틈을 메우는 완성의 장인' },
    Libra: { name: '천칭자리', trait: '균형을 맞추는 조율자' },
    Scorpio: { name: '전갈자리', trait: '끝까지 파고드는 탐구자' },
    Sagittarius: { name: '사수자리', trait: '경계를 넘는 탐험가' },
    Capricorn: { name: '염소자리', trait: '정상까지 오르는 등반가' },
    Aquarius: { name: '물병자리', trait: '틀을 깨는 혁신가' },
    Pisces: { name: '물고기자리', trait: '경계를 녹이는 몽상가' },
  },
  planet: {
    Sun: { name: '태양', key: '정체성·핵심 자아' },
    Moon: { name: '달', key: '감정·무의식' },
    Mercury: { name: '수성', key: '사고·소통' },
    Venus: { name: '금성', key: '애정·미감' },
    Mars: { name: '화성', key: '추진력·욕구' },
    Jupiter: { name: '목성', key: '확장·행운' },
    Saturn: { name: '토성', key: '책임·시련' },
    Uranus: { name: '천왕성', key: '변혁·독창' },
    Neptune: { name: '해왕성', key: '이상·영감' },
    Pluto: { name: '명왕성', key: '변형·재생' },
    Chiron: { name: '카이런', key: '상처·치유' },
    NorthNode: { name: '북교점', key: '생의 과제' },
    SouthNode: { name: '남교점', key: '타고난 습관' },
    Fortuna: { name: '행운점', key: '복의 자리' },
  },
  big3: {
    sun: { label: '태양', sub: '핵심 자아' },
    moon: { label: '달', sub: '내면 감정' },
    asc: { label: '상승', sub: '드러나는 인상' },
  },
  aspect: {
    conjunction: { name: '컨정션', tone: '결합' },
    trine: { name: '트라인', tone: '조화' },
    sextile: { name: '섹스타일', tone: '기회' },
    square: { name: '스퀘어', tone: '긴장' },
    opposition: { name: '어포지션', tone: '대립' },
  },

  // ── 궁합 ──
  goonghap: {
    self: '본인', partner: '상대',
    stemRel: {
      SAME: { label: '비화(比和)', title: '편안하고 닮은 인연',
        desc: '같은 기운이라 말이 잘 통하고 처음부터 편안합니다. 다만 장단점도 함께 닮아 서로를 보완할 유연함이 필요합니다.' },
      A_GEN_B: { label: '상생(相生)', title: '이끌고 키워주는 인연',
        desc: '앞사람의 기운이 뒷사람을 살려주는 흐름입니다. 주는 쪽이 지치지 않도록 균형을 의식하면 오래갑니다.' },
      B_GEN_A: { label: '상생(相生)', title: '받쳐주고 채워주는 인연',
        desc: '뒷사람의 기운이 앞사람을 살려주는 흐름입니다. 든든한 지지가 정서적 안정으로 이어집니다.' },
      A_CTRL_B: { label: '상극(相剋)', title: '강렬하고 역동적인 인연',
        desc: '끌림이 강한 만큼 주도권 마찰도 생깁니다. 통제보다 동행으로 방향을 잡으면 추진력이 됩니다.' },
      B_CTRL_A: { label: '상극(相剋)', title: '강렬하고 역동적인 인연',
        desc: '끌림이 강한 만큼 주도권 마찰도 생깁니다. 서로의 페이스를 존중하면 가장 단단한 유대가 됩니다.' },
    },
    branchRel: {
      HEX: { tag: '육합(六合)', desc: '일지가 합을 이루어 일상의 결이 잘 맞습니다.' },
      TRIO: { tag: '삼합(三合)', desc: '같은 삼합국에 속해 방향이 자연스럽게 모입니다.' },
      CLASH: { tag: '충(沖)', desc: '일지가 충이라 예상 못한 마찰이 생길 수 있습니다.' },
      NEUTRAL: { tag: '중립', desc: '일지 간 특별한 합·충이 없는 담백한 관계입니다.' },
    },
    score: {
      5: '금상첨화 — 일지까지 조화를 이룹니다.',
      4: '좋은 인연입니다.',
      3: '무난하고 안정적인 인연입니다.',
      2: '노력이 필요한 인연입니다.',
      1: '많은 인내와 이해가 필요합니다.',
    },
    areas: { emotion: '감정·교감', comm: '소통·대화', stability: '현실·안정' },
    dayGan: (el) => `${el} 일간`,
    yinyangDiff: '음양이 달라 서로의 시각이 대화를 풍부하게 만듭니다.',
    yinyangSame: '같은 음양이라 공감이 빠른 대신 다른 의견을 수용하는 연습이 필요합니다.',
  },

  // ── 문장 템플릿 ──
  tpl: {
    strengthStrong: (el) => `일간의 기운이 강합니다. ${el}로 덜어내야 균형이 잡힙니다.`,
    strengthWeak: (el) => `일간의 기운이 약합니다. ${el}가 받쳐줘야 힘을 냅니다.`,
    strengthEven: (el) => `기운이 고르게 배분된 중화 명조입니다. ${el}가 흐름을 잡아줍니다.`,
    strengthType: { 신강: '신강', 신약: '신약', 중화: '중화' },
    elementLine: (over, oc, lack, lc) => `${over}이 ${oc}개로 가장 두텁고, ${lack}이 ${lc}개로 가장 옅습니다.`,
    sipsinTop: (label, n, desc) => `${label}이 ${n}개로 가장 두텁습니다. ${desc}`,
    seyunDesc: (el, tone) => `${el}의 기운이 도는 해입니다. ${tone}`,
    toneYong: '용신에 해당해 흐름이 순조롭고, 벌여둔 일이 결실로 이어집니다.',
    toneHee: '희신에 해당해 큰 무리 없이 무난하게 풀립니다.',
    toneGi: '기신에 해당해 확장보다 지키는 쪽이 유리합니다.',
    toneFlat: '기운이 크게 치우치지 않는 평이한 흐름입니다.',
    daewoonNow: (age, gz, sipsin, unseong) =>
      `${age}세부터 ${gz} 대운입니다. ${sipsin}의 기운이 10년의 큰 흐름을 이끌며, 십이운성은 ${unseong}입니다.`,
    daxianNow: (a, b, palace, gz) => `현재 ${a}~${b}세는 ${palace}이 활성화된 ${gz} 대한입니다.`,
    natalOverview: (sunSign, sunTrait, moonSign, moonTrait) =>
      `${sunSign} 태양은 ${sunTrait}, ${moonSign} 달은 ${moonTrait}의 결을 가집니다.`,
    yearLu: (star, palace) => `${star} 화록이 ${palace}에 들어 ${palace} 영역이 열립니다.`,
    yearGi: (star, palace) => `${star} 화기는 ${palace}에 있어 이 부분은 속도를 늦추는 편이 좋습니다.`,
  },
};
