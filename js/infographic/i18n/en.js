// 인포그래픽 카드의 영어 문구 팩
export default {
  // ── Card UI labels ──
  ui: {
    // 한자를 이름 옆에 병기할지 (한자권 언어는 이름이 곧 한자라 불필요)
    showHanja: true,
    cardSaju: 'Four Pillars', cardSipsin: 'Ten Gods · Stars', cardLuck: 'Luck Cycles',
    cardZiwei: 'Zi Wei Dou Shu', cardNatal: 'Astrology', cardYear: 'This Year', cardGoonghap: 'Compatibility',

    kickerSaju: 'FOUR PILLARS · Chart', kickerSipsin: 'FOUR PILLARS · Ten Gods',
    kickerLuck: 'FOUR PILLARS · Flow of Luck', kickerZiwei: 'ZI WEI DOU SHU · Chart',
    kickerNatal: 'NATAL CHART', kickerGoonghap: 'COMPATIBILITY · How Two Charts Meet',
    kickerYear: (y) => `ZI WEI DOU SHU · ${y} Annual`,

    secWongook: 'Natal Pillars', secElements: 'Five Elements', secStrength: 'Strong · Weak',
    secSipsin: 'Ten Gods Balance', secSinsal: 'Special Stars', secUnseong: 'Growth Cycle',
    secSeyun: (y) => `${y} Annual Luck`, secDaewoon: '10-Year Luck Cycles',
    secPalaces: 'Twelve Palaces', secDaxian: 'Major Periods',
    secPlanets: 'Planet Placements', secAspects: 'Major Aspects',
    secSihua: 'Annual Transformations', secMonths: 'Month by Month',
    secAreas: 'Compatibility by Area', secBranchRel: 'Day Branch Relation',

    pillars: ['Hour', 'Day', 'Month', 'Year'],
    male: 'Male', female: 'Female', age: (n) => `Age ${n}`,
    ageRange: (a, b) => `Ages ${a}–${b}`, ageFrom: (n) => `Age ${n}`,
    unknownTime: 'Time unknown', noName: 'My Chart',
    over: 'Excess', under: 'Lacking', strongest: 'Strongest', now: 'Now',
    yong: 'Favorable', hee: 'Supporting', gi: 'Unfavorable',
    good: 'Opportunity', flat: 'Steady', watch: 'Caution',
    gongmang: (b) => `Void · ${b}`,
    yearFlow: (y) => `The flow of ${y}`,
    yearLabel: (y) => `${y}`,
    liuyear: (s) => `Annual · ${s}`,
    month: (n) => `Month ${n}`,
    house: (n) => `House ${n}`,
    orb: (v) => `${v}°`,
    noSinsal: 'A clean chart with no special stars standing out.',
    unknownTimeNote: 'Birth time unknown — the Ascendant and houses are left out.',
    save: 'Save Image', share: 'Share', making: 'Creating…', done: 'Done', failed: 'Failed',
    embedTitle: (s) => `${s} summary card · save it and keep it close`,
    embedSaju: 'Four Pillars', embedZiwei: 'Zi Wei Dou Shu', embedNatal: 'Astrology',
  },

  // ── Five Elements ──
  element: { 목: 'Wood', 화: 'Fire', 토: 'Earth', 금: 'Metal', 수: 'Water' },

  // ── The 10 Day Masters ──
  daymaster: {
    甲: { title: 'The tall tree growing straight up', desc: 'An energy that rises straight upward. Leadership and drive are strong, and a chosen direction is rarely abandoned.' },
    乙: { title: 'The vine that climbs and winds', desc: 'A soft but persistent energy. Adapts easily to any setting and connects people without effort.' },
    丙: { title: 'The sun that lights everything', desc: 'A bright energy that spreads without hesitation. Expressive, with a presence that brightens the room.' },
    丁: { title: 'The candle that lights the dark', desc: 'A quiet energy that sinks in deeply. Reads what people truly feel through fine-grained insight.' },
    戊: { title: 'The great mountain that holds its ground', desc: 'A heavy, unshakable energy. Deeply trusted, and becomes the axis others lean on.' },
    己: { title: 'The rich soil that raises all things', desc: 'An energy that holds and nurtures. Broadly accepting, with a sharp sense for what is practical.' },
    庚: { title: 'The forged steel and tempered blade', desc: 'The energy of steel and the sword. Principled and decisive, pushing a set goal to the end.' },
    辛: { title: 'The finely cut jewel', desc: 'A clear, sharply shining energy. An unusual eye for beauty and a high bar for finish.' },
    壬: { title: 'The wide and deep-running sea', desc: 'An energy that flows without obstruction. Thinks broadly and never fears change.' },
    癸: { title: 'The drizzle that soaks all things', desc: 'An energy that seeps in quietly. Keenly intuitive, sensing shifts before anyone else.' },
  },

  // ── The 5 Ten-God groups ──
  sipsinGroup: {
    비겁: { label: 'Peers', desc: 'The force of independence and rivalry. Strong, it brings self-reliance; excessive, it shows up as stubbornness and friction.' },
    식상: { label: 'Output', desc: 'The force of expression and production. Strong, it brings talent and creativity; excessive, it chafes against rules.' },
    재성: { label: 'Wealth', desc: 'The force of money and practical sense. Strong, it reads value well; excessive, it starts too much and burns out.' },
    관성: { label: 'Authority', desc: 'The force of duty and control. Strong, it earns recognition in organizations; excessive, it brings pressure and stress.' },
    인성: { label: 'Resource', desc: 'The force of learning and protection. Strong, it favors study and credentials; excessive, it slows action down.' },
  },

  // ── Ten Gods: hanja → label ──
  sipsin: {
    本元: 'Day Master', 比肩: 'Peer', 劫財: 'Rival', 食神: 'Creative', 傷官: 'Expressive',
    偏財: 'Windfall Wealth', 正財: 'Steady Wealth', 偏官: 'Pressure', 正官: 'Authority', 偏印: 'Unconventional Support', 正印: 'Nurture',
  },

  // ── The 12 Growth Cycle stages ──
  unseong: {
    長生: 'Birth', 沐浴: 'Bathing', 冠帶: 'Coming of Age', 乾祿: 'Prime', 帝旺: 'Peak', 衰: 'Decline',
    病: 'Illness', 死: 'Death', 墓: 'Tomb', 絕: 'Void', 絶: 'Void', 胎: 'Conception', 養: 'Nurturing',
  },

  // ── Special stars ──
  sinsalType: { 길신: 'Auspicious', 중성: 'Neutral', 흉신: 'Inauspicious' },
  sinsal: {
    cheonul: { name: 'Heavenly Noble', type: 'Auspicious', desc: 'Someone steps in at every crisis. The benefactor who appears at the decisive moment.' },
    munchang: { name: 'Literary Star', type: 'Auspicious', desc: 'The star of study, exams and writing. Learning turns into achievement.' },
    cheonduk: { name: 'Heavenly Virtue', type: 'Auspicious', desc: 'The star of virtue that softens misfortune. Great disasters pass by.' },
    wolduk: { name: 'Monthly Virtue', type: 'Auspicious', desc: 'Unseen goodwill runs deep. A position held up by the support of others.' },
    geumyeo: { name: 'Golden Carriage', type: 'Auspicious', desc: 'The star of comfort and a good spouse. The foundations of daily life sit easy.' },
    yangin: { name: 'Blade Star', type: 'Neutral', desc: 'Drive as sharp as a blade. Used through a skilled craft, it becomes a real weapon.' },
    goegang: { name: 'Commander Star', type: 'Neutral', desc: 'An extreme, forceful temperament. Leader or outsider — there is no middle ground.' },
    dohwa: { name: 'Peach Blossom', type: 'Neutral', desc: 'A magnetism that draws people in. Favors the arts, entertainment and public-facing work.' },
    hongyeom: { name: 'Red Charm', type: 'Neutral', desc: 'A quiet allure and popularity. Romantic connections never quite run out.' },
    baekho: { name: 'White Tiger', type: 'Inauspicious', desc: 'Watch for sudden accidents and injury. Safety and health come first.' },
  },

  // ── Zi Wei Dou Shu ──
  palace: {
    命宮: 'Life Palace', 兄弟: 'Siblings Palace', 夫妻: 'Spouse Palace', 子女: 'Children Palace', 財帛: 'Wealth Palace', 疾厄: 'Health Palace',
    遷移: 'Travel Palace', 交友: 'Friends Palace', 官祿: 'Career Palace', 田宅: 'Property Palace', 福德: 'Fortune Palace', 父母: 'Parents Palace',
  },
  star: {
    紫微: 'The emperor star. A place that stands at the center and leads.',
    天機: 'The star of wisdom and planning. Strong in work that takes thought.',
    太陽: 'The star of giving light. Shines in public-facing activity.',
    武曲: 'The star of wealth and execution. Pushes through with grit.',
    天同: 'The star of blessing and ease. Rides the current gently.',
    廉貞: 'The star of change and contest. Achieves through ups and downs.',
    天府: 'The storehouse star. Strong at stability and accumulation.',
    太陰: 'The delicate moon star. Sharp with inner life and money management.',
    貪狼: 'The star of desire and talent. Versatile and sociable.',
    巨門: 'The star of speech. Wins through words and logic.',
    天相: 'The minister star. A place that coordinates and mediates.',
    天梁: 'The elder star. The energy of principle and protection.',
    七殺: 'The pioneer star. Opens the way by meeting things head-on.',
    破軍: 'The star of ruin and rebuilding. Breaks the old and raises the new.',
  },

  // ── Astrology ──
  sign: {
    Aries: { name: 'Aries', trait: 'the pioneer who charges in first' },
    Taurus: { name: 'Taurus', trait: 'the unshakable guardian of stability' },
    Gemini: { name: 'Gemini', trait: 'the messenger who connects through curiosity' },
    Cancer: { name: 'Cancer', trait: 'the protector who shelters and keeps' },
    Leo: { name: 'Leo', trait: 'the lead who shines center stage' },
    Virgo: { name: 'Virgo', trait: 'the craftsman who closes every gap' },
    Libra: { name: 'Libra', trait: 'the mediator who keeps the balance' },
    Scorpio: { name: 'Scorpio', trait: 'the seeker who digs all the way down' },
    Sagittarius: { name: 'Sagittarius', trait: 'the explorer who crosses every border' },
    Capricorn: { name: 'Capricorn', trait: 'the climber who reaches the summit' },
    Aquarius: { name: 'Aquarius', trait: 'the innovator who breaks the mold' },
    Pisces: { name: 'Pisces', trait: 'the dreamer who dissolves the edges' },
  },
  planet: {
    Sun: { name: 'Sun', key: 'identity · core self' },
    Moon: { name: 'Moon', key: 'emotion · the unconscious' },
    Mercury: { name: 'Mercury', key: 'thought · communication' },
    Venus: { name: 'Venus', key: 'love · aesthetics' },
    Mars: { name: 'Mars', key: 'drive · desire' },
    Jupiter: { name: 'Jupiter', key: 'expansion · fortune' },
    Saturn: { name: 'Saturn', key: 'duty · trials' },
    Uranus: { name: 'Uranus', key: 'upheaval · originality' },
    Neptune: { name: 'Neptune', key: 'ideals · inspiration' },
    Pluto: { name: 'Pluto', key: 'transformation · rebirth' },
    Chiron: { name: 'Chiron', key: 'wound · healing' },
    NorthNode: { name: 'North Node', key: 'life task' },
    SouthNode: { name: 'South Node', key: 'inborn habits' },
    Fortuna: { name: 'Part of Fortune', key: 'the seat of blessing' },
  },
  big3: {
    sun: { label: 'Sun', sub: 'core self' },
    moon: { label: 'Moon', sub: 'inner feeling' },
    asc: { label: 'Rising', sub: 'outward impression' },
  },
  aspect: {
    conjunction: { name: 'Conjunction', tone: 'fusion' },
    trine: { name: 'Trine', tone: 'harmony' },
    sextile: { name: 'Sextile', tone: 'opportunity' },
    square: { name: 'Square', tone: 'tension' },
    opposition: { name: 'Opposition', tone: 'polarity' },
  },

  // ── Compatibility ──
  goonghap: {
    self: 'You', partner: 'Partner',
    stemRel: {
      SAME: { label: 'Same Element (比和)', title: 'An easy, like-minded bond',
        desc: 'The same energy makes conversation flow and feels comfortable from the start. But the flaws are shared too, so some flexibility is needed to balance each other out.' },
      A_GEN_B: { label: 'Generating (相生)', title: 'A bond that leads and raises',
        desc: 'The first person’s energy feeds the second. It lasts if the giving side stays mindful of balance and does not run dry.' },
      B_GEN_A: { label: 'Generating (相生)', title: 'A bond that supports and fills',
        desc: 'The second person’s energy feeds the first. Steady backing turns into emotional security.' },
      A_CTRL_B: { label: 'Controlling (相剋)', title: 'An intense, dynamic bond',
        desc: 'The attraction is strong, and so is the friction over who leads. Aim for walking together rather than control and it becomes momentum.' },
      B_CTRL_A: { label: 'Controlling (相剋)', title: 'An intense, dynamic bond',
        desc: 'The attraction is strong, and so is the friction over who leads. Respect each other’s pace and it becomes the firmest of ties.' },
    },
    branchRel: {
      HEX: { tag: 'Six Harmony (六合)', desc: 'The day branches harmonize, so daily life fits together well.' },
      TRIO: { tag: 'Triple Harmony (三合)', desc: 'Both belong to the same trine, so your directions gather naturally.' },
      CLASH: { tag: 'Clash (沖)', desc: 'The day branches clash, so unexpected friction can come up.' },
      NEUTRAL: { tag: 'Neutral', desc: 'No particular harmony or clash between the day branches — a plain, even relationship.' },
    },
    score: {
      5: 'The best of both — even the day branches are in harmony.',
      4: 'A good match.',
      3: 'An easy and stable match.',
      2: 'A match that takes work.',
      1: 'This one asks for a lot of patience and understanding.',
    },
    areas: { emotion: 'Feeling · Rapport', comm: 'Talking · Communication', stability: 'Practical · Stability' },
    dayGan: (el) => `${el} Day Master`,
    yinyangDiff: 'Different polarities, so your differing views make the conversation richer.',
    yinyangSame: 'The same polarity brings quick understanding, but accepting a different opinion takes practice.',
  },

  // ── Sentence templates ──
  tpl: {
    strengthStrong: (el) => `The Day Master runs strong. Releasing it through ${el} brings balance.`,
    strengthWeak: (el) => `The Day Master runs weak. It gains strength when ${el} backs it up.`,
    strengthEven: (el) => `A balanced chart with the energies evenly spread. ${el} sets the flow.`,
    strengthType: { 신강: 'Strong', 신약: 'Weak', 중화: 'Balanced' },
    elementLine: (over, oc, lack, lc) => `${over} is the heaviest at ${oc}, and ${lack} the thinnest at ${lc}.`,
    sipsinTop: (label, n, desc) => `${label} is the heaviest at ${n}. ${desc}`,
    seyunDesc: (el, tone) => `A year carrying the energy of ${el}. ${tone}`,
    toneYong: 'It falls on your favorable element, so the flow runs smooth and what you set in motion bears fruit.',
    toneHee: 'It falls on your supporting element, so things work out without much strain.',
    toneGi: 'It falls on your unfavorable element, so holding your ground beats expanding.',
    toneFlat: 'A plain flow with no strong tilt in any direction.',
    daewoonNow: (age, gz, sipsin, unseong) =>
      `The ${gz} luck cycle begins at age ${age}. ${sipsin} energy leads the broad flow of these ten years, and the Growth Cycle stage is ${unseong}.`,
    daxianNow: (a, b, palace, gz) => `Ages ${a}–${b} fall in the ${gz} major period, with the ${palace} activated.`,
    natalOverview: (sunSign, sunTrait, moonSign, moonTrait) =>
      `Your ${sunSign} Sun is ${sunTrait}, while your ${moonSign} Moon is ${moonTrait}.`,
    yearLu: (star, palace) => `${star} carries the Wealth transformation into the ${palace}, opening up that area.`,
    yearGi: (star, palace) => `${star} carries the Obstruction transformation in the ${palace}, so it is better to slow down there.`,
  },
};
