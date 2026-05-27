// 무료 운세 패널 — 사주 · 자미두수 · 점성학 세 시스템 통합 (다크 테마)
import { calculateSaju } from './orrery-core/saju.js';
import { getFourPillars, analyzePillarRelations } from './orrery-core/pillars.js';
import { createChart } from './orrery-core/ziwei.js';
import { calculateNatal, ZODIAC_KO, PLANET_KO } from './orrery-core/natal.js';

// ─── 사주 상수 ────────────────────────────────────────────────

const ZODIAC_ANIMAL = {
  '子':{ animal:'쥐',  emoji:'🐭', years:'1960·1972·1984·1996·2008·2020', trait:'영리하고 재치 넘치며 사교성이 풍부합니다.' },
  '丑':{ animal:'소',  emoji:'🐂', years:'1961·1973·1985·1997·2009·2021', trait:'성실하고 인내심이 강하며 묵묵히 목표를 향해 나아갑니다.' },
  '寅':{ animal:'호랑이', emoji:'🐯', years:'1962·1974·1986·1998·2010·2022', trait:'용감하고 리더십이 강하며 열정적입니다.' },
  '卯':{ animal:'토끼', emoji:'🐰', years:'1963·1975·1987·1999·2011·2023', trait:'온화하고 섬세하며 예술적 감각이 뛰어납니다.' },
  '辰':{ animal:'용',  emoji:'🐉', years:'1964·1976·1988·2000·2012·2024', trait:'카리스마 넘치고 야망이 크며 창의적입니다.' },
  '巳':{ animal:'뱀',  emoji:'🐍', years:'1965·1977·1989·2001·2013·2025', trait:'직관이 예리하고 지혜로우며 끈기가 있습니다.' },
  '午':{ animal:'말',  emoji:'🐎', years:'1966·1978·1990·2002·2014·2026', trait:'활동적이고 에너지 넘치며 낙관적입니다.' },
  '未':{ animal:'양',  emoji:'🐑', years:'1967·1979·1991·2003·2015·2027', trait:'온순하고 예술적이며 평화를 사랑합니다.' },
  '申':{ animal:'원숭이', emoji:'🐒', years:'1968·1980·1992·2004·2016·2028', trait:'영리하고 적응력이 탁월하며 재주가 많습니다.' },
  '酉':{ animal:'닭',  emoji:'🐓', years:'1969·1981·1993·2005·2017·2029', trait:'꼼꼼하고 완벽을 추구하며 부지런합니다.' },
  '戌':{ animal:'개',  emoji:'🐕', years:'1970·1982·1994·2006·2018·2030', trait:'충직하고 정직하며 강한 책임감을 지닙니다.' },
  '亥':{ animal:'돼지', emoji:'🐷', years:'1971·1983·1995·2007·2019·2031', trait:'넉넉하고 복이 많으며 진실하고 너그럽습니다.' },
};

const ELEMENT_LUCKY = {
  '목':{ color:'초록', hex:'#22c55e', direction:'동쪽', numbers:[3,8] },
  '화':{ color:'빨강', hex:'#ef4444', direction:'남쪽', numbers:[2,7] },
  '토':{ color:'황토', hex:'#d97706', direction:'중앙', numbers:[5,0] },
  '금':{ color:'흰색', hex:'#94a3b8', direction:'서쪽', numbers:[4,9] },
  '수':{ color:'검정', hex:'#334155', direction:'북쪽', numbers:[1,6] },
};
const STEM_ELEM  = {'甲':'목','乙':'목','丙':'화','丁':'화','戊':'토','己':'토','庚':'금','辛':'금','壬':'수','癸':'수'};
const STEM_KR    = {'甲':'갑','乙':'을','丙':'병','丁':'정','戊':'무','己':'기','庚':'경','辛':'신','壬':'임','癸':'계'};
const BRANCH_KR  = {'子':'자','丑':'축','寅':'인','卯':'묘','辰':'진','巳':'사','午':'오','未':'미','申':'신','酉':'유','戌':'술','亥':'해'};
const BRANCH_ELEM = {'子':'수','丑':'토','寅':'목','卯':'목','辰':'토','巳':'화','午':'화','未':'토','申':'금','酉':'금','戌':'토','亥':'수'};
const DAY_KR     = ['일','월','화','수','목','금','토'];
const WEALTH_SIP = new Set(['偏財','正財']);
const LOVE_SIP_F = new Set(['偏官','正官']);
const R_SCORE    = {'合':2,'沖':-2,'破':-1,'害':-1,'刑':-1.5,'怨嗔':-3,'鬼門':0};
const LEVELS = [
  { min:85, label:'대길(大吉)', color:'#f59e0b', bg:'#fef3c7', emoji:'⭐' },
  { min:70, label:'길(吉)',     color:'#22c55e', bg:'#dcfce7', emoji:'✨' },
  { min:48, label:'평(平)',     color:'#60a5fa', bg:'#dbeafe', emoji:'🌀' },
  { min:30, label:'소흉(小凶)', color:'#a78bfa', bg:'#f3e8ff', emoji:'⚡' },
  { min: 0, label:'흉(凶)',     color:'#f87171', bg:'#fee2e2', emoji:'⚠️' },
];

// ─── 자미두수 상수 ────────────────────────────────────────────

const MAIN_STARS = new Set(['紫微','天機','太陽','武曲','天同','廉貞','天府','太陰','貪狼','巨門','天相','天梁','七殺','破軍']);
const STAR_DESC = {
  '紫微':{ fate:'리더십과 권위를 지닌 고귀한 운명',  wealth:'귀인의 도움으로 재물이 모임',     love:'존중받는 파트너십, 고귀한 인연' },
  '天機':{ fate:'영리하고 변화 많은 두뇌형 운명',    wealth:'지략과 정보로 재물을 창출',        love:'변화 많은 인연, 지적 매력으로 끌림' },
  '太陽':{ fate:'밝고 넓게 빛나는 사회적 운명',      wealth:'사회활동·명성으로 재물이 따름',    love:'공개적이고 활발한 사랑' },
  '武曲':{ fate:'강직하고 재물복이 강한 운명',       wealth:'강력한 재물복, 금융·사업 유리',     love:'의리와 신뢰를 중시하는 사랑' },
  '天同':{ fate:'복덕 있고 편안한 삶의 운명',        wealth:'풍요롭고 안정적인 재물 흐름',      love:'평화롭고 복 있는 인연' },
  '廉貞':{ fate:'열정과 감정 기복이 있는 운명',      wealth:'기복 있으나 강한 회복력',          love:'열정적이나 감정 기복 있는 연애' },
  '天府':{ fate:'안정적이고 풍요로운 저장의 운명',   wealth:'안정적이고 풍요로운 재물 축적',    love:'든든하고 안정적인 인연' },
  '太陰':{ fate:'감성적이고 섬세한 달의 운명',       wealth:'섬세한 재물 감각, 부동산 유리',    love:'섬세하고 감성적인 사랑' },
  '貪狼':{ fate:'욕망과 매력이 넘치는 다재다능한 운명', wealth:'다양한 경로로 재물이 들어옴',  love:'매력 넘치는 로맨틱한 연애' },
  '巨門':{ fate:'말과 비밀, 정보에 강한 운명',       wealth:'소통·정보로 재물을 만드는 유형',   love:'솔직한 대화가 관계의 핵심' },
  '天相':{ fate:'조화롭고 지원받는 따뜻한 운명',     wealth:'귀인 도움으로 재물이 들어옴',      love:'조화롭고 지원받는 인연' },
  '天梁':{ fate:'지혜롭고 수호의 기운이 있는 운명',  wealth:'어려움 속에서도 귀인 도움 있음',   love:'연상 또는 성숙한 파트너 인연' },
  '七殺':{ fate:'강력하고 돌파력 있는 독립적 운명',  wealth:'도전적 방식으로 재물 획득',        love:'강렬하고 독립적인 연애 스타일' },
  '破軍':{ fate:'개척하고 변화를 만드는 선구자적 운명', wealth:'파괴와 재창조로 새 기회 창출', love:'기존을 깨고 새로운 인연 형성' },
};
const SIHAU_LABEL = { '化祿':'화록(번영)', '化權':'화권(권력)', '化科':'화과(명예)', '化忌':'화기(주의)' };

// ─── 점성학 상수 ──────────────────────────────────────────────

const SIGN_KO = ['양자리','황소자리','쌍둥이자리','게자리','사자자리','처녀자리','천칭자리','전갈자리','사수자리','염소자리','물병자리','물고기자리'];
const SIGN_EMOJI = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const SIGN_NAMES = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const toSignIdx = s => typeof s === 'number' ? s : SIGN_NAMES.indexOf(s);

const SUN_DESC = [
  '개척과 도전을 즐기는 불꽃 같은 에너지','안정과 감각적 풍요를 추구하는 현실적 성향',
  '지적 호기심과 유연한 사고의 소통 능력','깊은 감성과 가족을 소중히 여기는 마음',
  '창의적이고 당당한 표현력과 리더십','세심한 분석력과 완벽을 향한 성실함',
  '균형과 조화, 아름다움을 추구하는 사교성','강렬한 의지와 깊이 있는 탐구 정신',
  '자유를 사랑하는 낙관적 철학자 기질','목표를 향한 끈기와 실용적 판단력',
  '독창적이고 미래지향적인 혁신가 기질','예민한 감성과 깊은 공감·영적 직관',
];
const MOON_DESC = [
  '즉각적으로 반응하는 열정적 감성','안정과 편안함에서 감정적 충족감',
  '다양한 자극과 대화로 감정을 해소','깊고 섬세한 감정 흐름과 탁월한 공감 능력',
  '인정받고 빛날 때 감정이 충족됨','실용적 도움과 질서 속에서 안정감',
  '균형과 관계의 조화 속에서 감정 안정','강렬하고 깊은 감정, 집중과 집착 경향',
  '자유와 모험 속에서 감정적 활력','성취와 사회적 인정에서 안정감',
  '독립성과 자유 속에서 감정 충전','감정이 물처럼 흐르는 공감과 희생 성향',
];
const JUPITER_DESC = [
  '자아 개발과 새로운 도전에서 성장 기회','재물과 물질적 안정이 풍요로워지는 시기',
  '소통·학습·네트워크가 확장되는 시기','가정·부동산·내면 성장이 풍요로워지는 시기',
  '창의성·연애·자기표현이 활성화되는 시기','건강·직장·실용적 능력이 향상되는 시기',
  '인간관계·파트너십·협력이 확장되는 시기','변화·공동재산·심층 성장이 이루어지는 시기',
  '철학·해외·교육에서 큰 기회가 오는 시기','커리어·사회적 위상이 높아지는 시기',
  '인맥·미래 비전·사회적 활동이 확장되는 시기','영성·내면 지혜·자기 치유가 깊어지는 시기',
];
const VENUS_DESC = [
  '적극적이고 직접적인 사랑 에너지 상승','감각적이고 안정적인 재물·연애 에너지',
  '대화와 지적 유대가 연애 포인트인 시기','따뜻하고 가정적인 사랑 에너지 충만',
  '화려하고 로맨틱한 사랑·표현 에너지','세심한 배려와 일상 속 사랑 표현이 빛나는 시기',
  '조화와 우아함이 넘치는 사랑·인간관계','깊고 강렬한 인연의 기운이 흐르는 시기',
  '자유롭고 낙관적인 연애·확장 에너지','현실적이고 진지한 관계 발전에 유리',
  '독특하고 친구 같은 관계가 발전하는 시기','로맨틱하고 영적인 사랑 에너지의 계절',
];

// ─── 12운성 ───────────────────────────────────────────────────

const SIJUNSEONG_TABLE = {
  '甲':['亥','子','丑','寅','卯','辰','巳','午','未','申','酉','戌'],
  '乙':['午','巳','辰','卯','寅','丑','子','亥','戌','酉','申','未'],
  '丙':['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'],
  '丁':['酉','申','未','午','巳','辰','卯','寅','丑','子','亥','戌'],
  '戊':['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'],
  '己':['酉','申','未','午','巳','辰','卯','寅','丑','子','亥','戌'],
  '庚':['巳','午','未','申','酉','戌','亥','子','丑','寅','卯','辰'],
  '辛':['子','亥','戌','酉','申','未','午','巳','辰','卯','寅','丑'],
  '壬':['申','酉','戌','亥','子','丑','寅','卯','辰','巳','午','未'],
  '癸':['卯','寅','丑','子','亥','戌','酉','申','未','午','巳','辰'],
};
const SJS_NAMES = ['장생','목욕','관대','임관','제왕','쇠','병','사','묘','절','태','양'];
const SJS_EMOJI = ['🌱','🛁','🎓','👔','👑','📉','🤒','💀','⚰️','❄️','🥚','🌿'];
const SJS_DESC  = [
  '생명력이 솟구치는 시작의 기운',  '감수성이 예민하고 배움이 깊은 단계',
  '성장과 도약을 준비하는 단계',    '실력을 발휘하며 활약하는 단계',
  '최고의 전성기, 강한 에너지',     '활동이 서서히 줄어드는 단계',
  '주의가 필요하며 조심해야 할 시기','완전한 끝맺음, 전환점의 단계',
  '저장과 안식, 내면 정리의 단계',  '에너지 소멸, 새 출발을 준비하는 단계',
  '새 생명의 씨앗, 잉태의 단계',    '보호와 양육을 받으며 성장하는 단계',
];

// ─── 다국어 지원 ─────────────────────────────────────────────

function gLang() {
  try { return localStorage.getItem('honcheon.lang') || 'ko'; } catch { return 'ko'; }
}

const TX = {
  ko: {
    'animal.子':'쥐','animal.丑':'소','animal.寅':'호랑이','animal.卯':'토끼',
    'animal.辰':'용','animal.巳':'뱀','animal.午':'말','animal.未':'양',
    'animal.申':'원숭이','animal.酉':'닭','animal.戌':'개','animal.亥':'돼지',
    'trait.子':ZODIAC_ANIMAL['子'].trait,'trait.丑':ZODIAC_ANIMAL['丑'].trait,
    'trait.寅':ZODIAC_ANIMAL['寅'].trait,'trait.卯':ZODIAC_ANIMAL['卯'].trait,
    'trait.辰':ZODIAC_ANIMAL['辰'].trait,'trait.巳':ZODIAC_ANIMAL['巳'].trait,
    'trait.午':ZODIAC_ANIMAL['午'].trait,'trait.未':ZODIAC_ANIMAL['未'].trait,
    'trait.申':ZODIAC_ANIMAL['申'].trait,'trait.酉':ZODIAC_ANIMAL['酉'].trait,
    'trait.戌':ZODIAC_ANIMAL['戌'].trait,'trait.亥':ZODIAC_ANIMAL['亥'].trait,
    'sjs.0':SJS_DESC[0],'sjs.1':SJS_DESC[1],'sjs.2':SJS_DESC[2],'sjs.3':SJS_DESC[3],
    'sjs.4':SJS_DESC[4],'sjs.5':SJS_DESC[5],'sjs.6':SJS_DESC[6],'sjs.7':SJS_DESC[7],
    'sjs.8':SJS_DESC[8],'sjs.9':SJS_DESC[9],'sjs.10':SJS_DESC[10],'sjs.11':SJS_DESC[11],
    'sun.0':SUN_DESC[0],'sun.1':SUN_DESC[1],'sun.2':SUN_DESC[2],'sun.3':SUN_DESC[3],
    'sun.4':SUN_DESC[4],'sun.5':SUN_DESC[5],'sun.6':SUN_DESC[6],'sun.7':SUN_DESC[7],
    'sun.8':SUN_DESC[8],'sun.9':SUN_DESC[9],'sun.10':SUN_DESC[10],'sun.11':SUN_DESC[11],
    'moon.0':MOON_DESC[0],'moon.1':MOON_DESC[1],'moon.2':MOON_DESC[2],'moon.3':MOON_DESC[3],
    'moon.4':MOON_DESC[4],'moon.5':MOON_DESC[5],'moon.6':MOON_DESC[6],'moon.7':MOON_DESC[7],
    'moon.8':MOON_DESC[8],'moon.9':MOON_DESC[9],'moon.10':MOON_DESC[10],'moon.11':MOON_DESC[11],
    'jup.0':JUPITER_DESC[0],'jup.1':JUPITER_DESC[1],'jup.2':JUPITER_DESC[2],'jup.3':JUPITER_DESC[3],
    'jup.4':JUPITER_DESC[4],'jup.5':JUPITER_DESC[5],'jup.6':JUPITER_DESC[6],'jup.7':JUPITER_DESC[7],
    'jup.8':JUPITER_DESC[8],'jup.9':JUPITER_DESC[9],'jup.10':JUPITER_DESC[10],'jup.11':JUPITER_DESC[11],
    'ven.0':VENUS_DESC[0],'ven.1':VENUS_DESC[1],'ven.2':VENUS_DESC[2],'ven.3':VENUS_DESC[3],
    'ven.4':VENUS_DESC[4],'ven.5':VENUS_DESC[5],'ven.6':VENUS_DESC[6],'ven.7':VENUS_DESC[7],
    'ven.8':VENUS_DESC[8],'ven.9':VENUS_DESC[9],'ven.10':VENUS_DESC[10],'ven.11':VENUS_DESC[11],
    'star.紫微.fate':STAR_DESC['紫微'].fate,'star.紫微.wealth':STAR_DESC['紫微'].wealth,'star.紫微.love':STAR_DESC['紫微'].love,
    'star.天機.fate':STAR_DESC['天機'].fate,'star.天機.wealth':STAR_DESC['天機'].wealth,'star.天機.love':STAR_DESC['天機'].love,
    'star.太陽.fate':STAR_DESC['太陽'].fate,'star.太陽.wealth':STAR_DESC['太陽'].wealth,'star.太陽.love':STAR_DESC['太陽'].love,
    'star.武曲.fate':STAR_DESC['武曲'].fate,'star.武曲.wealth':STAR_DESC['武曲'].wealth,'star.武曲.love':STAR_DESC['武曲'].love,
    'star.天同.fate':STAR_DESC['天同'].fate,'star.天同.wealth':STAR_DESC['天同'].wealth,'star.天同.love':STAR_DESC['天同'].love,
    'star.廉貞.fate':STAR_DESC['廉貞'].fate,'star.廉貞.wealth':STAR_DESC['廉貞'].wealth,'star.廉貞.love':STAR_DESC['廉貞'].love,
    'star.天府.fate':STAR_DESC['天府'].fate,'star.天府.wealth':STAR_DESC['天府'].wealth,'star.天府.love':STAR_DESC['天府'].love,
    'star.太陰.fate':STAR_DESC['太陰'].fate,'star.太陰.wealth':STAR_DESC['太陰'].wealth,'star.太陰.love':STAR_DESC['太陰'].love,
    'star.貪狼.fate':STAR_DESC['貪狼'].fate,'star.貪狼.wealth':STAR_DESC['貪狼'].wealth,'star.貪狼.love':STAR_DESC['貪狼'].love,
    'star.巨門.fate':STAR_DESC['巨門'].fate,'star.巨門.wealth':STAR_DESC['巨門'].wealth,'star.巨門.love':STAR_DESC['巨門'].love,
    'star.天相.fate':STAR_DESC['天相'].fate,'star.天相.wealth':STAR_DESC['天相'].wealth,'star.天相.love':STAR_DESC['天相'].love,
    'star.天梁.fate':STAR_DESC['天梁'].fate,'star.天梁.wealth':STAR_DESC['天梁'].wealth,'star.天梁.love':STAR_DESC['天梁'].love,
    'star.七殺.fate':STAR_DESC['七殺'].fate,'star.七殺.wealth':STAR_DESC['七殺'].wealth,'star.七殺.love':STAR_DESC['七殺'].love,
    'star.破軍.fate':STAR_DESC['破軍'].fate,'star.破軍.wealth':STAR_DESC['破軍'].wealth,'star.破軍.love':STAR_DESC['破軍'].love,
    'today.대길(大吉)':'하는 일마다 순탄하게 풀리는 날입니다. 새로운 시작이나 중요한 결정에 최적입니다.',
    'today.길(吉)':'기운이 좋은 날입니다. 계획한 일들이 진행되고 주변의 도움을 받기 쉬운 시기입니다.',
    'today.평(平)':'평온하게 흘러가는 날입니다. 무리한 새 시도보다 기존 일을 꼼꼼히 마무리하세요.',
    'today.소흉(小凶)':'약간의 주의가 필요한 날입니다. 중요한 결정이나 큰 지출은 미루는 것이 좋습니다.',
    'today.흉(凶)':'에너지 소모가 클 수 있는 날입니다. 충동적인 행동을 자제하고 안정을 취하세요.',
    'lucky.목.color':'초록','lucky.화.color':'빨강','lucky.토.color':'황토','lucky.금.color':'흰색','lucky.수.color':'검정',
    'lucky.목.direction':'동쪽','lucky.화.direction':'남쪽','lucky.토.direction':'중앙','lucky.금.direction':'서쪽','lucky.수.direction':'북쪽',
  },
  en: {
    '기본 운세':'Basic Fortune','사주 원국 기반':'Based on birth chart',
    '오늘의 운세':"Today's Fortune",'일진 분석':'Daily reading',
    '용신 분석':'Yong-Shin Analysis','일간 강약과 오행 균형':'Day Master strength & element balance',
    '12운성':'12 Life Stages','일간 기준 · 사주 각 기둥의 생명 단계':'Day Master basis · Life stage of each pillar',
    '자미두수':'Ziwei Doushu','점성학':'Astrology','서양 천궁도 분석':'Western natal chart analysis',
    '성향':'Traits','애정운':'Love','직업운':'Career','재물운':'Wealth','건강운':'Health',
    '타고난 기질과 성격의 흐름':'Natural temperament & personality',
    '감정과 인연의 에너지':'Emotional & relationship energy',
    '사회적 활동과 성취 흐름':'Social activity & achievement',
    '재물과 기회의 흐름':'Wealth & opportunity flow',
    '몸과 마음의 균형 에너지':'Body & mind balance energy',
    '운세 지수':'Fortune Index','행운의 색':'Lucky Color','행운의 방향':'Lucky Direction','행운의 숫자':'Lucky Number',
    '일간 강약':'Day Master strength','오행 분포':'Element Distribution',
    '용신':'Yong (needed)','희신':'Hee (support)','기신':'Gi (avoid)',
    '가장 필요한 기운':'Most needed energy','보조 도움 기운':'Supporting energy','조심해야 할 기운':'Energy to avoid',
    '신약':'Weak','신강':'Strong',
    '년주':'Year','월주':'Month','일주':'Day','시주':'Hour',
    '이 궁에는 주성이 없어 대궁(對宮) 성향으로 판단합니다.':'No main star in this palace; judged by the opposing palace.',
    '기본 운명 (명궁)':'Destiny (Life Palace)','재물 성향 (재백궁)':'Wealth (Wealth Palace)','인연 성향 (부처궁)':'Romance (Spouse Palace)',
    '태양 별자리':'Sun Sign','핵심 정체성':'Core identity',
    '달 별자리':'Moon Sign','감성·본능':'Emotion & instinct',
    '상승궁 (ASC)':'Ascendant (ASC)','첫인상·외면':'First impression',
    '목성 현재 위치':'Jupiter transit','올해 성장 영역':'Growth area this year',
    '금성 현재 위치':'Venus transit','이번달 애정·재물':'Love & wealth this month',
    '타인에게 비치는 첫인상과 외면적 태도를 나타냅니다.':'Represents how others perceive your first impression.',
    '다른 생년월일로 다시 보기':'Try another date',
    '※ 사주·자미두수·점성학 원국과 현재 날짜를 기반으로 자동 계산됩니다. 참고용으로 활용하세요.':'※ Auto-calculated from your birth chart and today\'s date. For reference only.',
    '🔮 무료 운세':'🔮 Free Fortune',
    '사주 · 자미두수 · 점성학 세 시스템 통합 분석 (회원가입 불필요)':'Saju · Ziwei Doushu · Astrology integrated (no sign-up needed)',
    '운세를 계산하는 중입니다…':'Calculating fortune…',
    '계산 중… 잠시만 기다려주세요.':'Calculating… please wait.',
    '🔮 무료 운세 탭':'🔮 Free Fortune','🔐 멤버십 상세 분석':'🔐 Premium Analysis',
    '멤버십 전용 상세 분석':'Premium Detailed Analysis',
    '사주팔자 · 자미두수 · 천궁도 전체 결과를PDF로 정리하여 제공합니다.':'Full Saju · Ziwei · Natal Chart results delivered as a PDF.',
    '⭐대길 ✨길 🌀평 ⚡소흉 ⚠️흉 · ● 행운의 색':'⭐大吉 ✨吉 🌀平 ⚡小凶 ⚠️凶 · ● Lucky color',
    '오늘':'Today',
    '생년월일시를 선택하면 사주·자미두수·점성학 무료 운세를 확인합니다.':'Select your birth date & time for a free Saju · Ziwei · Astrology reading.',
    '출생 연도':'Birth Year','남성':'Male','여성':'Female',
    '🔮 무료 운세 보기 (사주 · 자미두수 · 점성학)':'🔮 View Free Fortune (Saju · Ziwei · Astrology)',
    '대길(大吉)':'大吉','길(吉)':'吉','평(平)':'平','소흉(小凶)':'小凶','흉(凶)':'凶',
    'today.대길(大吉)':'Everything flows smoothly today. Ideal for new beginnings and important decisions.',
    'today.길(吉)':'A favorable day. Plans move forward and support from others comes easily.',
    'today.평(平)':'A calm, steady day. Focus on finishing existing work rather than bold new ventures.',
    'today.소흉(小凶)':'Minor caution needed. Best to postpone important decisions or large expenses.',
    'today.흉(凶)':'Energy may be draining today. Avoid impulsive actions and seek rest.',
    '✅ 8글자 원국 전체 해석':'✅ Full 8-character birth chart',
    '✅ 대운 흐름 · 세운 분석':'✅ Major luck cycle & annual luck',
    '✅ 자미두수 12궁 상세 해석':'✅ Ziwei Doushu 12-palace analysis',
    '✅ 천궁도 행성·하우스·상(Aspect) 분석':'✅ Natal chart: planets, houses & aspects',
    '✅ AI 종합 해석 포함':'✅ AI comprehensive interpretation',
    'animal.子':'Rat','animal.丑':'Ox','animal.寅':'Tiger','animal.卯':'Rabbit',
    'animal.辰':'Dragon','animal.巳':'Snake','animal.午':'Horse','animal.未':'Goat',
    'animal.申':'Monkey','animal.酉':'Rooster','animal.戌':'Dog','animal.亥':'Pig',
    'trait.子':'Clever, witty, and highly sociable.',
    'trait.丑':'Hardworking, patient, steadily pursues goals.',
    'trait.寅':'Brave, strong leader, passionate.',
    'trait.卯':'Gentle, sensitive, artistically gifted.',
    'trait.辰':'Charismatic, ambitious, and creative.',
    'trait.巳':'Intuitive, wise, and tenacious.',
    'trait.午':'Energetic, active, and optimistic.',
    'trait.未':'Gentle, artistic, peace-loving.',
    'trait.申':'Clever, highly adaptable, multi-talented.',
    'trait.酉':'Meticulous, perfectionistic, diligent.',
    'trait.戌':'Loyal, honest, and deeply responsible.',
    'trait.亥':'Generous, blessed, sincere, and magnanimous.',
    'sjs.0':'Rising life force — the energy of beginnings.',
    'sjs.1':'Heightened sensitivity; a deep stage of learning.',
    'sjs.2':'Growth and preparation for a great leap forward.',
    'sjs.3':'A stage of active achievement and recognition.',
    'sjs.4':'Peak vitality — the height of power.',
    'sjs.5':'Activity gradually winding down.',
    'sjs.6':'A time requiring care and caution.',
    'sjs.7':'Complete closure; a turning point.',
    'sjs.8':'Storage and rest; inner consolidation.',
    'sjs.9':'Energy dissolving; preparing for a fresh start.',
    'sjs.10':'A seed of new life — conception.',
    'sjs.11':'Growing under protection and nurturing.',
    'sun.0':'Fiery energy that loves pioneering and challenges.',
    'sun.1':'Practical nature seeking stability and sensory richness.',
    'sun.2':'Intellectual curiosity and flexible, communicative thinking.',
    'sun.3':'Deep emotion and a cherishing heart for family.',
    'sun.4':'Creative, confident self-expression and leadership.',
    'sun.5':'Detail-oriented, analytical, striving for perfection.',
    'sun.6':'Sociable, seeking balance, harmony, and beauty.',
    'sun.7':'Intense will and depth of inquiry.',
    'sun.8':'Freedom-loving, optimistic philosopher.',
    'sun.9':'Persistent and practically-minded toward goals.',
    'sun.10':'Original, future-oriented innovator.',
    'sun.11':'Sensitive empathy and deep spiritual intuition.',
    'moon.0':'Passionate emotional reactions.','moon.1':'Emotional satisfaction from stability and comfort.',
    'moon.2':'Processing feelings through stimulation and conversation.',
    'moon.3':'Deep, delicate emotional flow and strong empathy.',
    'moon.4':'Emotional fulfillment through recognition and the spotlight.',
    'moon.5':'Finding stability in practical help and order.',
    'moon.6':'Emotional balance through harmony and relationships.',
    'moon.7':'Intense deep emotions; tendency toward focus and obsession.',
    'moon.8':'Emotional vitality through freedom and adventure.',
    'moon.9':'Security from achievement and social recognition.',
    'moon.10':'Emotional recharge through independence and freedom.',
    'moon.11':'Fluid empathy and a tendency toward self-sacrifice.',
    'jup.0':'Growth opportunities in self-development and new challenges.',
    'jup.1':'A period of increasing material wealth and stability.',
    'jup.2':'Communication, learning, and network expansion.',
    'jup.3':'Home, real estate, and inner growth flourish.',
    'jup.4':'Creativity, romance, and self-expression are activated.',
    'jup.5':'Health, work, and practical skills improve.',
    'jup.6':'Relationships, partnerships, and cooperation expand.',
    'jup.7':'Transformation, shared resources, and deep growth.',
    'jup.8':'Big opportunities in philosophy, travel, and education.',
    'jup.9':'Career and social status rise.',
    'jup.10':'Network, vision, and social activity expand.',
    'jup.11':'Spiritual depth, inner wisdom, and self-healing deepen.',
    'ven.0':'Direct, assertive love energy on the rise.',
    'ven.1':'Sensual, stable wealth and romance energy.',
    'ven.2':'Conversation and intellectual bonding are key to love.',
    'ven.3':'Warm, domestic love energy is abundant.',
    'ven.4':'Glamorous, romantic expression and love energy.',
    'ven.5':'Thoughtful care and everyday expressions of love shine.',
    'ven.6':'Harmonious and graceful love and relationships.',
    'ven.7':'Deep, intense relationship energy flows.',
    'ven.8':'Free-spirited, optimistic romance and expansion.',
    'ven.9':'Favorable for realistic, serious relationship growth.',
    'ven.10':'Unique, friendship-like relationships develop.',
    'ven.11':'A season of romantic and spiritual love energy.',
    'star.紫微.fate':'A noble destiny with leadership and authority.',
    'star.紫微.wealth':'Wealth gathers through the help of benefactors.',
    'star.紫微.love':'A respected partnership; a noble connection.',
    'star.天機.fate':'An intelligent, changeable destiny of the mind.',
    'star.天機.wealth':'Wealth created through strategy and information.',
    'star.天機.love':'Changing connections; drawn by intellectual charm.',
    'star.太陽.fate':'A bright, wide-shining social destiny.',
    'star.太陽.wealth':'Wealth follows from social activity and fame.',
    'star.太陽.love':'Open, active love.',
    'star.武曲.fate':'An upright destiny with strong wealth fortune.',
    'star.武曲.wealth':'Powerful wealth fortune; finance and business favorable.',
    'star.武曲.love':'Love centered on loyalty and trust.',
    'star.天同.fate':'A blessed, comfortable life destiny.',
    'star.天同.wealth':'Abundant and stable wealth flow.',
    'star.天同.love':'A peaceful, fortunate connection.',
    'star.廉貞.fate':'A destiny of passion and emotional volatility.',
    'star.廉貞.wealth':'Fluctuating but with strong resilience.',
    'star.廉貞.love':'Passionate but emotionally volatile romance.',
    'star.天府.fate':'A stable, abundant destiny of accumulation.',
    'star.天府.wealth':'Stable and abundant wealth accumulation.',
    'star.天府.love':'A dependable, stable connection.',
    'star.太陰.fate':'A sensitive, delicate lunar destiny.',
    'star.太陰.wealth':'Delicate wealth sense; favorable for real estate.',
    'star.太陰.love':'Sensitive, emotional love.',
    'star.貪狼.fate':'A multi-talented destiny full of desire and charm.',
    'star.貪狼.wealth':'Wealth enters through diverse channels.',
    'star.貪狼.love':'Charming, romantic relationship style.',
    'star.巨門.fate':'A destiny strong in speech, secrets, and information.',
    'star.巨門.wealth':'Wealth created through communication and information.',
    'star.巨門.love':'Honest dialogue is the core of the relationship.',
    'star.天相.fate':'A warm, harmonious destiny that receives support.',
    'star.天相.wealth':'Wealth arrives with the help of benefactors.',
    'star.天相.love':'A harmonious, supportive connection.',
    'star.天梁.fate':'A wise destiny with protective energy.',
    'star.天梁.wealth':'Support from benefactors even in difficult times.',
    'star.天梁.love':'A connection with an older or mature partner.',
    'star.七殺.fate':'A powerful, breakthrough-oriented independent destiny.',
    'star.七殺.wealth':'Wealth gained through bold challenges.',
    'star.七殺.love':'Intense, independent relationship style.',
    'star.破軍.fate':'A pioneering destiny that creates change and breaks molds.',
    'star.破軍.wealth':'New opportunities created through destruction and rebirth.',
    'star.破軍.love':'Breaking the old to form entirely new connections.',
    'lucky.목.color':'Green','lucky.화.color':'Red','lucky.토.color':'Yellow','lucky.금.color':'White','lucky.수.color':'Black',
    'lucky.목.direction':'East','lucky.화.direction':'South','lucky.토.direction':'Center','lucky.금.direction':'West','lucky.수.direction':'North',
    '생년월일을 입력해주세요.':'Please enter your date of birth.',
    '올바른 연도를 입력해주세요.':'Please enter a valid year.',
    '계산 중 오류가 발생했습니다.':'An error occurred during calculation.',
    '남':'M','여':'F',
  },
  ja: {
    '기본 운세':'基本運勢','사주 원국 기반':'四柱原局より',
    '오늘의 운세':'今日の運勢','일진 분석':'日辰分析',
    '용신 분석':'用神分析','일간 강약과 오행 균형':'日干強弱と五行バランス',
    '12운성':'十二運星','일간 기준 · 사주 각 기둥의 생명 단계':'日干基準 · 各柱の生命段階',
    '자미두수':'紫微斗数','점성학':'占星術','서양 천궁도 분석':'西洋ネイタルチャート分析',
    '성향':'気質','애정운':'愛情運','직업운':'仕事運','재물운':'財運','건강운':'健康運',
    '타고난 기질과 성격의 흐름':'生まれ持った気質と性格',
    '감정과 인연의 에너지':'感情と縁のエネルギー',
    '사회적 활동과 성취 흐름':'社会活動と達成の流れ',
    '재물과 기회의 흐름':'財物と機会の流れ',
    '몸과 마음의 균형 에너지':'心身バランスのエネルギー',
    '운세 지수':'運勢指数','행운의 색':'ラッキーカラー','행운의 방향':'ラッキー方位','행운의 숫자':'ラッキーナンバー',
    '일간 강약':'日干強弱','오행 분포':'五行分布',
    '용신':'用神','희신':'喜神','기신':'忌神',
    '가장 필요한 기운':'最も必要な気','보조 도움 기운':'補助の気','조심해야 할 기운':'注意すべき気',
    '신약':'身弱','신강':'身強',
    '년주':'年柱','월주':'月柱','일주':'日柱','시주':'時柱',
    '이 궁에는 주성이 없어 대궁(對宮) 성향으로 판단합니다.':'この宮には主星がなく、対宮の傾向で判断します。',
    '기본 운명 (명궁)':'基本運命（命宮）','재물 성향 (재백궁)':'財の傾向（財帛宮）','인연 성향 (부처궁)':'縁の傾向（夫妻宮）',
    '태양 별자리':'太陽星座','핵심 정체성':'コアアイデンティティ',
    '달 별자리':'月星座','감성·본능':'感性・本能',
    '상승궁 (ASC)':'上昇宮（ASC）','첫인상·외면':'第一印象・外見',
    '목성 현재 위치':'木星現在位置','올해 성장 영역':'今年の成長エリア',
    '금성 현재 위치':'金星現在位置','이번달 애정·재물':'今月の愛情・財運',
    '타인에게 비치는 첫인상과 외면적 태도를 나타냅니다.':'他者への第一印象と外面的な態度を表します。',
    '다른 생년월일로 다시 보기':'別の生年月日で見る',
    '※ 사주·자미두수·점성학 원국과 현재 날짜를 기반으로 자동 계산됩니다. 참고용으로 활용하세요.':'※ 生年月日と現在の日付に基づいて自動計算されます。参考としてご活用ください。',
    '🔮 무료 운세':'🔮 無料占い',
    '사주 · 자미두수 · 점성학 세 시스템 통합 분석 (회원가입 불필요)':'四柱推命・紫微斗数・占星術 統合分析（会員登録不要）',
    '운세를 계산하는 중입니다…':'占いを計算中です…',
    '계산 중… 잠시만 기다려주세요.':'計算中… しばらくお待ちください。',
    '🔐 멤버십 상세 분석':'🔐 プレミアム詳細分析','멤버십 전용 상세 분석':'プレミアム詳細分析',
    '사주팔자 · 자미두수 · 천궁도 전체 결과를PDF로 정리하여 제공합니다.':'四柱・紫微斗数・ネイタルチャートの全結果をPDFで提供します。',
    '⭐대길 ✨길 🌀평 ⚡소흉 ⚠️흉 · ● 행운의 색':'⭐大吉 ✨吉 🌀平 ⚡小凶 ⚠️凶 · ● ラッキーカラー',
    '오늘':'今日',
    '생년월일시를 선택하면 사주·자미두수·점성학 무료 운세를 확인합니다.':'生年月日時を選択すると、四柱推命・紫微斗数・占星術の無料占いが表示されます。',
    '출생 연도':'生年','남성':'男性','여성':'女性',
    '🔮 무료 운세 보기 (사주 · 자미두수 · 점성학)':'🔮 無料占いを見る（四柱・紫微・占星術）',
    '대길(大吉)':'大吉','길(吉)':'吉','평(平)':'平','소흉(小凶)':'小凶','흉(凶)':'凶',
    'today.대길(大吉)':'何事もスムーズに進む日です。新しい出発や重要な決断に最適です。',
    'today.길(吉)':'運気の良い日です。計画が進み、周囲のサポートを得やすい時期です。',
    'today.평(平)':'穏やかに流れる日です。無理な新しい試みより、既存の仕事を丁寧に仕上げましょう。',
    'today.소흉(小凶)':'やや注意が必要な日です。重要な決断や大きな出費は控えた方が良いでしょう。',
    'today.흉(凶)':'エネルギー消耗が多い日です。衝動的な行動を控え、安静にしましょう。',
    '✅ 8글자 원국 전체 해석':'✅ 八字原局 全解釈',
    '✅ 대운 흐름 · 세운 분석':'✅ 大運の流れ・歳運分析',
    '✅ 자미두수 12궁 상세 해석':'✅ 紫微斗数 12宮 詳細解釈',
    '✅ 천궁도 행성·하우스·상(Aspect) 분석':'✅ ネイタルチャート 惑星・ハウス・アスペクト分析',
    '✅ AI 종합 해석 포함':'✅ AI総合解釈込み',
    'animal.子':'ネズミ','animal.丑':'ウシ','animal.寅':'トラ','animal.卯':'ウサギ',
    'animal.辰':'リュウ','animal.巳':'ヘビ','animal.午':'ウマ','animal.未':'ヒツジ',
    'animal.申':'サル','animal.酉':'トリ','animal.戌':'イヌ','animal.亥':'イノシシ',
    'trait.子':'賢く、機知に富み、社交性が豊かです。',
    'trait.丑':'誠実で忍耐強く、黙々と目標に向かいます。',
    'trait.寅':'勇敢でリーダーシップが強く、情熱的です。',
    'trait.卯':'穏やかで繊細、芸術的センスが優れています。',
    'trait.辰':'カリスマがあり、野心が大きく創造的です。',
    'trait.巳':'直感が鋭く、知恵があり、粘り強いです。',
    'trait.午':'活動的でエネルギッシュ、楽観的です。',
    'trait.未':'温厚で芸術的、平和を愛します。',
    'trait.申':'賢く適応力が高く、多才です。',
    'trait.酉':'細かく完璧主義、勤勉です。',
    'trait.戌':'忠実で正直、強い責任感を持ちます。',
    'trait.亥':'寛大で福があり、誠実で懐深いです。',
    'sjs.0':'生命力が湧き上がる始まりの気','sjs.1':'感受性が豊かで学びが深い段階',
    'sjs.2':'成長と飛躍を準備する段階','sjs.3':'実力を発揮して活躍する段階',
    'sjs.4':'最高の全盛期、強いエネルギー','sjs.5':'活動が徐々に減少する段階',
    'sjs.6':'注意が必要で慎重にすべき時期','sjs.7':'完全な終わり、転換点の段階',
    'sjs.8':'貯蔵と安息、内面整理の段階','sjs.9':'エネルギー消滅、新たな出発を準備する段階',
    'sjs.10':'新しい命の種、懐胎の段階','sjs.11':'保護と育成を受けながら成長する段階',
    'sun.0':'開拓と挑戦を楽しむ炎のようなエネルギー','sun.1':'安定と感覚的豊かさを追求する現実的な気質',
    'sun.2':'知的好奇心と柔軟な思考のコミュニケーション能力','sun.3':'深い感性と家族を大切にする心',
    'sun.4':'創造的で堂々とした自己表現とリーダーシップ','sun.5':'細やかな分析力と完璧を目指す誠実さ',
    'sun.6':'バランスと調和、美しさを追求する社交性','sun.7':'強烈な意志と深い探究心',
    'sun.8':'自由を愛する楽観的な哲学者気質','sun.9':'目標への粘り強さと実用的な判断力',
    'sun.10':'独創的で未来志向のイノベーター気質','sun.11':'繊細な感性と深い共感・霊的直感',
    'moon.0':'即座に反応する情熱的な感情','moon.1':'安定と心地よさから感情的な充足感',
    'moon.2':'様々な刺激と会話で感情を解消','moon.3':'深く繊細な感情の流れと卓越した共感能力',
    'moon.4':'認められ輝く時に感情が充足','moon.5':'実用的なサポートと秩序の中で安定',
    'moon.6':'バランスと関係の調和の中で感情安定','moon.7':'強烈で深い感情、集中と執着の傾向',
    'moon.8':'自由と冒険の中で感情的な活力','moon.9':'達成と社会的認知から安心感',
    'moon.10':'独立性と自由の中で感情充電','moon.11':'水のように流れる感情、共感と自己犠牲の傾向',
    'jup.0':'自己開発と新しい挑戦で成長のチャンス','jup.1':'物質的な豊かさと安定が増す時期',
    'jup.2':'コミュニケーション・学習・ネットワークが拡大する時期','jup.3':'家庭・不動産・内面的成長が豊かになる時期',
    'jup.4':'創造性・恋愛・自己表現が活性化する時期','jup.5':'健康・職場・実用的能力が向上する時期',
    'jup.6':'人間関係・パートナーシップ・協力が拡大する時期','jup.7':'変化・共有財産・深層的成長が実現する時期',
    'jup.8':'哲学・海外・教育で大きなチャンスが来る時期','jup.9':'キャリア・社会的地位が高まる時期',
    'jup.10':'人脈・未来ビジョン・社会活動が拡大する時期','jup.11':'霊性・内なる知恵・自己治癒が深まる時期',
    'ven.0':'積極的で直接的な愛のエネルギーが上昇','ven.1':'感覚的で安定した財物・恋愛エネルギー',
    'ven.2':'会話と知的絆が恋愛のポイントとなる時期','ven.3':'温かく家庭的な愛のエネルギーが充満',
    'ven.4':'華やかでロマンティックな愛・表現エネルギー','ven.5':'細やかな配慮と日常の中の愛の表現が輝く時期',
    'ven.6':'調和と優雅さが溢れる愛・人間関係','ven.7':'深く強烈な縁の気が流れる時期',
    'ven.8':'自由で楽観的な恋愛・拡大エネルギー','ven.9':'現実的で真剣な関係の発展に有利',
    'ven.10':'ユニークで友人のような関係が発展する時期','ven.11':'ロマンティックで霊的な愛のエネルギーの季節',
    'star.紫微.fate':'リーダーシップと権威を持つ高貴な運命',
    'star.紫微.wealth':'貴人の助けで財物が集まる','star.紫微.love':'尊重されるパートナーシップ、高貴な縁',
    'star.天機.fate':'賢く変化の多い頭脳型の運命',
    'star.天機.wealth':'知略と情報で財物を創出','star.天機.love':'変化の多い縁、知的魅力で引かれ合う',
    'star.太陽.fate':'明るく広く輝く社会的な運命',
    'star.太陽.wealth':'社会活動・名声で財物が伴う','star.太陽.love':'公開的で活発な愛',
    'star.武曲.fate':'剛直で財物運の強い運命',
    'star.武曲.wealth':'強力な財物運、金融・事業に有利','star.武曲.love':'義理と信頼を重視する愛',
    'star.天同.fate':'福徳があり穏やかな生活の運命',
    'star.天同.wealth':'豊かで安定した財物の流れ','star.天同.love':'平和で福のある縁',
    'star.廉貞.fate':'情熱と感情の起伏がある運命',
    'star.廉貞.wealth':'起伏があるが強い回復力','star.廉貞.love':'情熱的だが感情の起伏がある恋愛',
    'star.天府.fate':'安定した豊かな蓄積の運命',
    'star.天府.wealth':'安定した豊かな財物の蓄積','star.天府.love':'しっかりと安定した縁',
    'star.太陰.fate':'感情的で繊細な月の運命',
    'star.太陰.wealth':'繊細な財物感覚、不動産に有利','star.太陰.love':'繊細で感情的な愛',
    'star.貪狼.fate':'欲望と魅力に溢れる多才な運命',
    'star.貪狼.wealth':'様々な経路から財物が入る','star.貪狼.love':'魅力的でロマンティックな恋愛',
    'star.巨門.fate':'言葉と秘密、情報に強い運命',
    'star.巨門.wealth':'コミュニケーション・情報で財物を作るタイプ','star.巨門.love':'率直な対話が関係の核心',
    'star.天相.fate':'調和し支援される温かい運命',
    'star.天相.wealth':'貴人の助けで財物が入る','star.天相.love':'調和し支援される縁',
    'star.天梁.fate':'知恵があり守護の気を持つ運命',
    'star.天梁.wealth':'困難の中でも貴人の助けあり','star.天梁.love':'年上または成熟したパートナーとの縁',
    'star.七殺.fate':'強力で突破力のある独立した運命',
    'star.七殺.wealth':'挑戦的な方法で財物を獲得','star.七殺.love':'強烈で独立した恋愛スタイル',
    'star.破軍.fate':'開拓し変化を作る先駆者的な運命',
    'star.破軍.wealth':'破壊と再創造で新たな機会を創出','star.破軍.love':'既存を壊し新しい縁を形成',
    'lucky.목.color':'緑','lucky.화.color':'赤','lucky.토.color':'黄土','lucky.금.color':'白','lucky.수.color':'黒',
    'lucky.목.direction':'東','lucky.화.direction':'南','lucky.토.direction':'中央','lucky.금.direction':'西','lucky.수.direction':'北',
    '생년월일을 입력해주세요.':'生年月日を入力してください。',
    '올바른 연도를 입력해주세요.':'正しい年を入力してください。',
    '계산 중 오류가 발생했습니다.':'計算中にエラーが発生しました。',
    '남':'男','여':'女',
  },
  zh: {
    '기본 운세':'基本運勢','사주 원국 기반':'四柱原局',
    '오늘의 운세':'今日運勢','일진 분석':'日辰分析',
    '용신 분석':'用神分析','일간 강약과 오행 균형':'日干強弱與五行平衡',
    '12운성':'十二運星','일간 기준 · 사주 각 기둥의 생명 단계':'日干基準 · 各柱生命階段',
    '자미두수':'紫微斗數','점성학':'占星術','서양 천궁도 분석':'西洋星盤分析',
    '성향':'性向','애정운':'愛情運','직업운':'事業運','재물운':'財運','건강운':'健康運',
    '타고난 기질과 성격의 흐름':'先天氣質與性格',
    '감정과 인연의 에너지':'情感與緣分能量',
    '사회적 활동과 성취 흐름':'社交活動與成就流向',
    '재물과 기회의 흐름':'財富與機會流向',
    '몸과 마음의 균형 에너지':'身心平衡能量',
    '운세 지수':'運勢指數','행운의 색':'幸運色','행운의 방향':'幸運方位','행운의 숫자':'幸運數字',
    '일간 강약':'日干強弱','오행 분포':'五行分布',
    '용신':'用神','희신':'喜神','기신':'忌神',
    '가장 필요한 기운':'最需要的氣','보조 도움 기운':'輔助之氣','조심해야 할 기운':'需注意的氣',
    '신약':'身弱','신강':'身強',
    '년주':'年柱','월주':'月柱','일주':'日柱','시주':'時柱',
    '이 궁에는 주성이 없어 대궁(對宮) 성향으로 판단합니다.':'此宮無主星，以對宮性質判斷。',
    '기본 운명 (명궁)':'基本命運（命宮）','재물 성향 (재백궁)':'財帛性向（財帛宮）','인연 성향 (부처궁)':'姻緣性向（夫妻宮）',
    '태양 별자리':'太陽星座','핵심 정체성':'核心身份',
    '달 별자리':'月亮星座','감성·본능':'感性與本能',
    '상승궁 (ASC)':'上升星座（ASC）','첫인상·외면':'第一印象',
    '목성 현재 위치':'木星當前位置','올해 성장 영역':'今年成長領域',
    '금성 현재 위치':'金星當前位置','이번달 애정·재물':'本月愛情財運',
    '타인에게 비치는 첫인상과 외면적 태도를 나타냅니다.':'代表他人眼中的第一印象與外在態度。',
    '다른 생년월일로 다시 보기':'換個生日重新查看',
    '※ 사주·자미두수·점성학 원국과 현재 날짜를 기반으로 자동 계산됩니다. 참고용으로 활용하세요.':'※ 根據生辰與今日日期自動計算。僅供參考。',
    '🔮 무료 운세':'🔮 免費運勢',
    '사주 · 자미두수 · 점성학 세 시스템 통합 분석 (회원가입 불필요)':'四柱・紫微斗數・占星 三系統整合分析（無需註冊）',
    '운세를 계산하는 중입니다…':'正在計算運勢…',
    '계산 중… 잠시만 기다려주세요.':'計算中… 請稍候。',
    '🔐 멤버십 상세 분석':'🔐 會員詳細分析','멤버십 전용 상세 분석':'會員專屬詳細分析',
    '사주팔자 · 자미두수 · 천궁도 전체 결과를PDF로 정리하여 제공합니다.':'四柱・紫微斗數・星盤全部結果以PDF形式提供。',
    '⭐대길 ✨길 🌀평 ⚡소흉 ⚠️흉 · ● 행운의 색':'⭐大吉 ✨吉 🌀平 ⚡小凶 ⚠️凶 · ● 幸運色',
    '오늘':'今日',
    '생년월일시를 선택하면 사주·자미두수·점성학 무료 운세를 확인합니다.':'選擇生辰即可查看四柱・紫微・占星免費運勢。',
    '출생 연도':'出生年份','남성':'男性','여성':'女性',
    '🔮 무료 운세 보기 (사주 · 자미두수 · 점성학)':'🔮 查看免費運勢（四柱・紫微・占星）',
    '대길(大吉)':'大吉','길(吉)':'吉','평(平)':'平','소흉(小凶)':'小凶','흉(凶)':'凶',
    'today.대길(大吉)':'事事順遂的吉日。適合新的開始或重要決定。',
    'today.길(吉)':'運氣良好的一天。計劃順利推進，易獲周圍幫助。',
    'today.평(平)':'平穩流過的一天。比起冒進，宜踏實完成既有事務。',
    'today.소흉(小凶)':'需稍加注意的一天。重要決定或大額支出最好延後。',
    'today.흉(凶)':'能量消耗較大的一天。克制衝動，靜心休息為宜。',
    '✅ 8글자 원국 전체 해석':'✅ 八字原局完整解讀',
    '✅ 대운 흐름 · 세운 분석':'✅ 大運流向・歲運分析',
    '✅ 자미두수 12궁 상세 해석':'✅ 紫微斗數十二宮詳細解讀',
    '✅ 천궁도 행성·하우스·상(Aspect) 분석':'✅ 星盤行星·宮位·相位分析',
    '✅ AI 종합 해석 포함':'✅ 含AI綜合解讀',
    'animal.子':'鼠','animal.丑':'牛','animal.寅':'虎','animal.卯':'兔',
    'animal.辰':'龍','animal.巳':'蛇','animal.午':'馬','animal.未':'羊',
    'animal.申':'猴','animal.酉':'雞','animal.戌':'狗','animal.亥':'豬',
    'trait.子':'聰明機智，社交能力強。','trait.丑':'踏實勤奮，耐心堅持目標。',
    'trait.寅':'勇敢、領導力強，充滿熱情。','trait.卯':'溫和細膩，富有藝術才華。',
    'trait.辰':'魅力十足，野心勃勃，富創造力。','trait.巳':'直覺敏銳，智慧深遠，韌性強。',
    'trait.午':'活躍充沛，樂觀向上。','trait.未':'溫順藝術，崇尚和平。',
    'trait.申':'聰明靈活，多才多藝。','trait.酉':'細心完美主義，勤勞努力。',
    'trait.戌':'忠誠正直，責任感強。','trait.亥':'寬厚多福，真誠大方。',
    'sjs.0':'生命力蓬勃的起始之氣','sjs.1':'感受力強，學習深化的階段',
    'sjs.2':'成長蓄勢，準備飛躍的階段','sjs.3':'發揮實力，積極表現的階段',
    'sjs.4':'全盛巔峰，能量最強','sjs.5':'活動逐漸收斂的階段',
    'sjs.6':'需謹慎留意的時期','sjs.7':'完全終結，重要轉折點',
    'sjs.8':'儲藏休息，整頓內在的階段','sjs.9':'能量消散，準備新出發的階段',
    'sjs.10':'新生命的種子，受孕的階段','sjs.11':'在呵護養育中成長的階段',
    'sun.0':'喜愛開拓挑戰的火焰般能量','sun.1':'追求穩定與感官豐盛的現實性格',
    'sun.2':'充滿求知慾、靈活思維的溝通能力','sun.3':'深厚情感與珍視家人的心',
    'sun.4':'富創造力、自信表達與領導力','sun.5':'細膩分析、追求完美的認真態度',
    'sun.6':'追求平衡協調與美的社交性','sun.7':'強烈意志與深度探究精神',
    'sun.8':'熱愛自由的樂觀哲學家氣質','sun.9':'朝目標堅持的務實判斷力',
    'sun.10':'獨創未來導向的革新者氣質','sun.11':'敏銳感性與深刻共鳴·靈性直覺',
    'moon.0':'即時反應的熱情感情','moon.1':'從穩定安適中獲得情感滿足',
    'moon.2':'透過多元刺激與對話疏解情緒','moon.3':'深沉細膩的情感流動與卓越共鳴力',
    'moon.4':'獲得認可、綻放光芒時情感充實','moon.5':'在實際幫助與秩序中找到安穩',
    'moon.6':'在平衡與關係和諧中情感穩定','moon.7':'強烈深沈的情感，專注與執著傾向',
    'moon.8':'自由冒險中的情感活力','moon.9':'成就與社會認可中的安全感',
    'moon.10':'獨立自由中充電情感','moon.11':'如水流動的情感，共鳴與奉獻傾向',
    'jup.0':'自我開發與新挑戰中的成長機遇','jup.1':'物質財富與穩定增加的時期',
    'jup.2':'溝通、學習、人際網絡擴展的時期','jup.3':'家庭、房產、內在成長豐盛的時期',
    'jup.4':'創造力、戀愛、自我表達活躍的時期','jup.5':'健康、工作、實用能力提升的時期',
    'jup.6':'人際關係、伴侶關係、合作擴展的時期','jup.7':'變化、共同財產、深層成長實現的時期',
    'jup.8':'哲學、海外、教育帶來重大機遇的時期','jup.9':'事業與社會地位提升的時期',
    'jup.10':'人脈、未來願景、社會活動擴展的時期','jup.11':'靈性、內在智慧、自我療癒深化的時期',
    'ven.0':'積極直接的愛情能量上升','ven.1':'感官穩定的財運與戀愛能量',
    'ven.2':'對話與智識連結是戀愛重點的時期','ven.3':'溫暖家庭式的愛情能量充沛',
    'ven.4':'華麗浪漫的愛情表達能量','ven.5':'體貼細心、日常愛的表達閃耀的時期',
    'ven.6':'和諧優雅的愛情與人際關係','ven.7':'深沉強烈的緣分之氣流動的時期',
    'ven.8':'自由樂觀的戀愛與拓展能量','ven.9':'現實而認真的關係發展有利',
    'ven.10':'獨特如友般的關係發展的時期','ven.11':'浪漫靈性的愛情能量之季',
    'star.紫微.fate':'具有領導力與權威的高貴命運',
    'star.紫微.wealth':'貴人相助，財富聚集','star.紫微.love':'受尊重的伴侶關係，高貴的緣分',
    'star.天機.fate':'聰明多變的智謀型命運',
    'star.天機.wealth':'以謀略與資訊創造財富','star.天機.love':'多變的緣分，以智識魅力相吸',
    'star.太陽.fate':'光芒四射的社會型命運',
    'star.太陽.wealth':'透過社會活動與名聲積累財富','star.太陽.love':'開放活躍的愛情',
    'star.武曲.fate':'剛直且財運強健的命運',
    'star.武曲.wealth':'強大財運，金融與商業有利','star.武曲.love':'重視義氣與信任的愛情',
    'star.天同.fate':'福德豐厚、生活安穩的命運',
    'star.天同.wealth':'豐盛穩定的財富流動','star.天同.love':'平和有福的緣分',
    'star.廉貞.fate':'充滿熱情與情緒起伏的命運',
    'star.廉貞.wealth':'有起伏但具強大恢復力','star.廉貞.love':'熱情但情緒起伏的戀愛',
    'star.天府.fate':'穩定豐盛的積累型命運',
    'star.天府.wealth':'穩定豐盛的財富積累','star.天府.love':'踏實穩定的緣分',
    'star.太陰.fate':'感性細膩的月亮型命運',
    'star.太陰.wealth':'細膩的財富感知，房地產有利','star.太陰.love':'細膩感性的愛情',
    'star.貪狼.fate':'欲望與魅力兼具的多才命運',
    'star.貪狼.wealth':'財富從多元管道流入','star.貪狼.love':'魅力十足的浪漫戀愛',
    'star.巨門.fate':'擅長言辭、秘密與資訊的命運',
    'star.巨門.wealth':'透過溝通與資訊創造財富','star.巨門.love':'坦誠對話是關係的核心',
    'star.天相.fate':'和諧且獲支持的溫暖命運',
    'star.天相.wealth':'得貴人相助，財富流入','star.天相.love':'和諧受支持的緣分',
    'star.天梁.fate':'智慧守護型命運',
    'star.天梁.wealth':'即使困難，也有貴人相助','star.天梁.love':'與年長或成熟伴侶的緣分',
    'star.七殺.fate':'強大突破力的獨立型命運',
    'star.七殺.wealth':'以挑戰方式獲取財富','star.七殺.love':'強烈獨立的戀愛風格',
    'star.破軍.fate':'開拓創新、先驅型命運',
    'star.破軍.wealth':'透過破舊立新創造機會','star.破軍.love':'打破舊有，形成嶄新緣分',
    'lucky.목.color':'綠色','lucky.화.color':'紅色','lucky.토.color':'黃色','lucky.금.color':'白色','lucky.수.color':'黑色',
    'lucky.목.direction':'東方','lucky.화.direction':'南方','lucky.토.direction':'中央','lucky.금.direction':'西方','lucky.수.direction':'北方',
    '생년월일을 입력해주세요.':'請輸入生年月日。',
    '올바른 연도를 입력해주세요.':'請輸入正確年份。',
    '계산 중 오류가 발생했습니다.':'計算過程中發生錯誤。',
    '남':'男','여':'女',
  },
  es: {
    '기본 운세':'Fortuna Básica','사주 원국 기반':'Basada en la carta natal',
    '오늘의 운세':'Fortuna de Hoy','일진 분석':'Análisis diario',
    '용신 분석':'Análisis Yong-Shin','일간 강약과 오행 균형':'Fortaleza del maestro día y equilibrio de elementos',
    '12운성':'12 Etapas de Vida','일간 기준 · 사주 각 기둥의 생명 단계':'Base del maestro día · Etapa vital de cada pilar',
    '자미두수':'Ziwei Doushu','점성학':'Astrología','서양 천궁도 분석':'Análisis de carta natal occidental',
    '성향':'Carácter','애정운':'Amor','직업운':'Carrera','재물운':'Riqueza','건강운':'Salud',
    '타고난 기질과 성격의 흐름':'Temperamento natural y flujo de personalidad',
    '감정과 인연의 에너지':'Energía emocional y de conexiones',
    '사회적 활동과 성취 흐름':'Actividad social y logros',
    '재물과 기회의 흐름':'Flujo de riqueza y oportunidades',
    '몸과 마음의 균형 에너지':'Energía de equilibrio cuerpo-mente',
    '운세 지수':'Índice de fortuna','행운의 색':'Color de suerte','행운의 방향':'Dirección de suerte','행운의 숫자':'Número de suerte',
    '일간 강약':'Fortaleza del maestro día','오행 분포':'Distribución de elementos',
    '용신':'Yong (necesario)','희신':'Hee (apoyo)','기신':'Gi (evitar)',
    '가장 필요한 기운':'Energía más necesaria','보조 도움 기운':'Energía de apoyo','조심해야 할 기운':'Energía a evitar',
    '신약':'Débil','신강':'Fuerte',
    '년주':'Año','월주':'Mes','일주':'Día','시주':'Hora',
    '이 궁에는 주성이 없어 대궁(對宮) 성향으로 판단합니다.':'No hay estrella principal; se juzga por el palacio opuesto.',
    '기본 운명 (명궁)':'Destino básico (palacio de vida)','재물 성향 (재백궁)':'Tendencia riqueza (palacio de riqueza)','인연 성향 (부처궁)':'Tendencia romance (palacio conyugal)',
    '태양 별자리':'Signo solar','핵심 정체성':'Identidad central',
    '달 별자리':'Signo lunar','감성·본능':'Emoción e instinto',
    '상승궁 (ASC)':'Ascendente (ASC)','첫인상·외면':'Primera impresión',
    '목성 현재 위치':'Júpiter en tránsito','올해 성장 영역':'Área de crecimiento este año',
    '금성 현재 위치':'Venus en tránsito','이번달 애정·재물':'Amor y riqueza este mes',
    '타인에게 비치는 첫인상과 외면적 태도를 나타냅니다.':'Representa cómo los demás perciben tu primera impresión.',
    '다른 생년월일로 다시 보기':'Consultar con otra fecha',
    '※ 사주·자미두수·점성학 원국과 현재 날짜를 기반으로 자동 계산됩니다. 참고용으로 활용하세요.':'※ Calculado automáticamente. Solo orientativo.',
    '🔮 무료 운세':'🔮 Fortuna Gratis',
    '사주 · 자미두수 · 점성학 세 시스템 통합 분석 (회원가입 불필요)':'Análisis integrado de Saju, Ziwei Doushu y Astrología (sin registro)',
    '운세를 계산하는 중입니다…':'Calculando fortuna…',
    '계산 중… 잠시만 기다려주세요.':'Calculando… por favor espera.',
    '🔐 멤버십 상세 분석':'🔐 Análisis Premium','멤버십 전용 상세 분석':'Análisis Detallado Premium',
    '사주팔자 · 자미두수 · 천궁도 전체 결과를PDF로 정리하여 제공합니다.':'Resultados completos de Saju · Ziwei · Carta Natal en PDF.',
    '⭐대길 ✨길 🌀평 ⚡소흉 ⚠️흉 · ● 행운의 색':'⭐大吉 ✨吉 🌀平 ⚡小凶 ⚠️凶 · ● Color de suerte',
    '오늘':'Hoy',
    '생년월일시를 선택하면 사주·자미두수·점성학 무료 운세를 확인합니다.':'Selecciona tu fecha y hora de nacimiento para ver tu fortuna gratis.',
    '출생 연도':'Año de nacimiento','남성':'Hombre','여성':'Mujer',
    '🔮 무료 운세 보기 (사주 · 자미두수 · 점성학)':'🔮 Ver fortuna gratis (Saju · Ziwei · Astrología)',
    '대길(大吉)':'大吉','길(吉)':'吉','평(平)':'平','소흉(小凶)':'小凶','흉(凶)':'凶',
    'today.대길(大吉)':'Todo fluye bien hoy. Ideal para nuevos comienzos y decisiones importantes.',
    'today.길(吉)':'Un día favorable. Los planes avanzan y es fácil recibir apoyo.',
    'today.평(平)':'Un día tranquilo. Mejor terminar lo pendiente que empezar grandes proyectos.',
    'today.소흉(小凶)':'Se necesita algo de precaución. Pospón decisiones importantes o gastos grandes.',
    'today.흉(凶)':'Puede haber gasto de energía. Evita impulsos y busca descanso.',
    '✅ 8글자 원국 전체 해석':'✅ Interpretación completa de los 8 caracteres',
    '✅ 대운 흐름 · 세운 분석':'✅ Flujo de grandes ciclos · análisis anual',
    '✅ 자미두수 12궁 상세 해석':'✅ Análisis detallado de los 12 palacios Ziwei',
    '✅ 천궁도 행성·하우스·상(Aspect) 분석':'✅ Carta natal: planetas, casas y aspectos',
    '✅ AI 종합 해석 포함':'✅ Con interpretación AI',
    'animal.子':'Rata','animal.丑':'Buey','animal.寅':'Tigre','animal.卯':'Conejo',
    'animal.辰':'Dragón','animal.巳':'Serpiente','animal.午':'Caballo','animal.未':'Cabra',
    'animal.申':'Mono','animal.酉':'Gallo','animal.戌':'Perro','animal.亥':'Cerdo',
    'trait.子':'Inteligente, ingenioso y muy sociable.',
    'trait.丑':'Trabajador, paciente, avanza steadily hacia sus metas.',
    'trait.寅':'Valiente, líder nato, apasionado.',
    'trait.卯':'Gentil, sensible, talento artístico excepcional.',
    'trait.辰':'Carismático, ambicioso y creativo.',
    'trait.巳':'Intuitivo, sabio y tenaz.',
    'trait.午':'Activo, lleno de energía y optimista.',
    'trait.未':'Gentil, artístico, amante de la paz.',
    'trait.申':'Inteligente, adaptable y multitalentoso.',
    'trait.酉':'Meticuloso, perfeccionista, diligente.',
    'trait.戌':'Leal, honesto y con fuerte sentido de responsabilidad.',
    'trait.亥':'Generoso, afortunado, sincero y magnánimo.',
    'sjs.0':'Fuerza vital brotando — la energía de los comienzos.',
    'sjs.1':'Sensibilidad elevada; etapa de aprendizaje profundo.',
    'sjs.2':'Crecimiento y preparación para un gran salto.',
    'sjs.3':'Etapa de logros activos y reconocimiento.',
    'sjs.4':'Vitalidad máxima — la cima del poder.',
    'sjs.5':'La actividad va reduciéndose gradualmente.',
    'sjs.6':'Momento que requiere cuidado y precaución.',
    'sjs.7':'Cierre completo; un punto de inflexión.',
    'sjs.8':'Almacenamiento y descanso; consolidación interna.',
    'sjs.9':'Energía disolviéndose; preparándose para un nuevo comienzo.',
    'sjs.10':'Una semilla de nueva vida — concepción.',
    'sjs.11':'Creciendo bajo protección y crianza.',
    'sun.0':'Energía ardiente que ama el pionerismo y los desafíos.',
    'sun.1':'Naturaleza práctica que busca estabilidad y riqueza sensorial.',
    'sun.2':'Curiosidad intelectual y pensamiento flexible y comunicativo.',
    'sun.3':'Emoción profunda y corazón que aprecia a la familia.',
    'sun.4':'Expresión creativa y confiada con liderazgo.',
    'sun.5':'Análisis detallado y dedicación perfeccionista.',
    'sun.6':'Sociable, buscando equilibrio, armonía y belleza.',
    'sun.7':'Voluntad intensa y profundidad de investigación.',
    'sun.8':'Filósofo optimista que ama la libertad.',
    'sun.9':'Perseverancia y juicio práctico hacia las metas.',
    'sun.10':'Innovador original orientado al futuro.',
    'sun.11':'Empatía sensible e intuición espiritual profunda.',
    'moon.0':'Reacciones emocionales apasionadas.',
    'moon.1':'Satisfacción emocional de la estabilidad y comodidad.',
    'moon.2':'Procesando sentimientos a través de estímulos y conversación.',
    'moon.3':'Flujo emocional profundo y delicado con gran empatía.',
    'moon.4':'Plenitud emocional cuando se recibe reconocimiento.',
    'moon.5':'Estabilidad en la ayuda práctica y el orden.',
    'moon.6':'Balance emocional a través de armonía y relaciones.',
    'moon.7':'Emociones intensas; tendencia a la concentración y obsesión.',
    'moon.8':'Vitalidad emocional en la libertad y aventura.',
    'moon.9':'Seguridad del logro y el reconocimiento social.',
    'moon.10':'Recarga emocional en independencia y libertad.',
    'moon.11':'Empatía fluida y tendencia a la auto-sacrificio.',
    'jup.0':'Oportunidades de crecimiento en el desarrollo personal.',
    'jup.1':'Período de aumento de riqueza material y estabilidad.',
    'jup.2':'Comunicación, aprendizaje y expansión de redes.',
    'jup.3':'El hogar, bienes raíces y crecimiento interior florecen.',
    'jup.4':'Creatividad, romance y auto-expresión se activan.',
    'jup.5':'Salud, trabajo y habilidades prácticas mejoran.',
    'jup.6':'Relaciones, asociaciones y cooperación se expanden.',
    'jup.7':'Transformación, recursos compartidos y crecimiento profundo.',
    'jup.8':'Grandes oportunidades en filosofía, viajes y educación.',
    'jup.9':'Carrera y estatus social aumentan.',
    'jup.10':'Red, visión y actividad social se expanden.',
    'jup.11':'Profundidad espiritual, sabiduría interior y auto-curación.',
    'ven.0':'Energía de amor directa y asertiva en aumento.',
    'ven.1':'Energía sensual y estable de riqueza y romance.',
    'ven.2':'La conversación y el vínculo intelectual son clave para el amor.',
    'ven.3':'Energía de amor cálida y hogareña es abundante.',
    'ven.4':'Expresión de amor glamorosa y romántica.',
    'ven.5':'El cuidado considerado y las expresiones de amor cotidianas brillan.',
    'ven.6':'Amor y relaciones armoniosas y elegantes.',
    'ven.7':'Energía de conexión profunda e intensa.',
    'ven.8':'Romance libre, optimista y expansivo.',
    'ven.9':'Favorece el desarrollo de relaciones realistas y serias.',
    'ven.10':'Se desarrollan relaciones únicas, como de amigos.',
    'ven.11':'Una temporada de energía de amor romántica y espiritual.',
    'star.紫微.fate':'Un destino noble con liderazgo y autoridad.',
    'star.紫微.wealth':'La riqueza se acumula con ayuda de benefactores.',
    'star.紫微.love':'Una asociación respetada; una conexión noble.',
    'star.天機.fate':'Un destino inteligente y cambiante de la mente.',
    'star.天機.wealth':'Riqueza creada a través de estrategia e información.',
    'star.天機.love':'Conexiones cambiantes; atraído por el encanto intelectual.',
    'star.太陽.fate':'Un destino social brillante y de amplio alcance.',
    'star.太陽.wealth':'La riqueza sigue de la actividad social y la fama.',
    'star.太陽.love':'Amor abierto y activo.',
    'star.武曲.fate':'Un destino recto con gran fortuna de riqueza.',
    'star.武曲.wealth':'Poderosa fortuna; finanzas y negocios favorables.',
    'star.武曲.love':'Amor centrado en la lealtad y confianza.',
    'star.天同.fate':'Un destino de vida bendecido y cómodo.',
    'star.天同.wealth':'Flujo de riqueza abundante y estable.',
    'star.天同.love':'Una conexión pacífica y afortunada.',
    'star.廉貞.fate':'Un destino de pasión y volatilidad emocional.',
    'star.廉貞.wealth':'Fluctuante pero con gran resiliencia.',
    'star.廉貞.love':'Romance apasionado pero emocionalmente volátil.',
    'star.天府.fate':'Un destino estable y abundante de acumulación.',
    'star.天府.wealth':'Acumulación de riqueza estable y abundante.',
    'star.天府.love':'Una conexión confiable y estable.',
    'star.太陰.fate':'Un destino lunar sensible y delicado.',
    'star.太陰.wealth':'Sentido delicado de la riqueza; favorable para bienes raíces.',
    'star.太陰.love':'Amor sensible y emocional.',
    'star.貪狼.fate':'Un destino multitalentoso lleno de deseo y encanto.',
    'star.貪狼.wealth':'La riqueza entra por canales diversos.',
    'star.貪狼.love':'Estilo romántico lleno de encanto.',
    'star.巨門.fate':'Un destino fuerte en palabras, secretos e información.',
    'star.巨門.wealth':'Riqueza creada a través de la comunicación.',
    'star.巨門.love':'El diálogo honesto es el núcleo de la relación.',
    'star.天相.fate':'Un destino cálido, armonioso y apoyado.',
    'star.天相.wealth':'La riqueza llega con ayuda de benefactores.',
    'star.天相.love':'Una conexión armoniosa y de apoyo.',
    'star.天梁.fate':'Un destino sabio con energía protectora.',
    'star.天梁.wealth':'Apoyo de benefactores incluso en tiempos difíciles.',
    'star.天梁.love':'Una conexión con pareja mayor o madura.',
    'star.七殺.fate':'Un destino independiente y de gran capacidad de ruptura.',
    'star.七殺.wealth':'Riqueza ganada mediante desafíos audaces.',
    'star.七殺.love':'Estilo de relación intenso e independiente.',
    'star.破軍.fate':'Un destino pionero que crea cambio y rompe moldes.',
    'star.破軍.wealth':'Nuevas oportunidades creadas a través de la destrucción y renacimiento.',
    'star.破軍.love':'Romper lo viejo para formar conexiones enteramente nuevas.',
    'lucky.목.color':'Verde','lucky.화.color':'Rojo','lucky.토.color':'Amarillo','lucky.금.color':'Blanco','lucky.수.color':'Negro',
    'lucky.목.direction':'Este','lucky.화.direction':'Sur','lucky.토.direction':'Centro','lucky.금.direction':'Oeste','lucky.수.direction':'Norte',
    '생년월일을 입력해주세요.':'Por favor introduce tu fecha de nacimiento.',
    '올바른 연도를 입력해주세요.':'Por favor introduce un año válido.',
    '계산 중 오류가 발생했습니다.':'Ocurrió un error durante el cálculo.',
    '남':'H','여':'M',
  },
};

function t(key) {
  const l = gLang();
  const table = TX[l] || {};
  return table[key] ?? TX.ko?.[key] ?? key;
}

function getSijunseong(stem, branch) {
  const table = SIJUNSEONG_TABLE[stem];
  if (!table) return null;
  const idx = table.indexOf(branch);
  if (idx < 0) return null;
  return { name:SJS_NAMES[idx], emoji:SJS_EMOJI[idx], desc:SJS_DESC[idx] };
}

// ─── 공통 유틸 ────────────────────────────────────────────────

function relScore(rels) { return rels.reduce((s,r) => s+(R_SCORE[r.type]||0), 0); }
function compareToNatal(natalPillars, ganzi) {
  return natalPillars.reduce((sum,p) => {
    const r = analyzePillarRelations(p.pillar.ganzi, ganzi);
    return sum + relScore(r.stem) + relScore(r.branch);
  }, 0);
}
function toPct(raw, scale=4) { return Math.max(5, Math.min(97, 50+raw*scale)); }
function getLevel(pct) { return LEVELS.find(l=>pct>=l.min)||LEVELS[LEVELS.length-1]; }
function getLucky(ganzi) {
  const elem = STEM_ELEM[ganzi[0]]||'토';
  const info = ELEMENT_LUCKY[elem];
  return { ...info, number: info.numbers[ganzi[1].charCodeAt(0)%2], elem };
}
function ganziStr(g) { return `${g[0]}${g[1]}`; }
function getMainStars(palace) {
  return (palace?.stars||[]).filter(s => MAIN_STARS.has(s.name));
}
function computeElements(saju) {
  const c = {'목':0,'화':0,'토':0,'금':0,'수':0};
  for (const p of saju.pillars) {
    if (STEM_ELEM[p.pillar.stem]) c[STEM_ELEM[p.pillar.stem]]++;
    if (BRANCH_ELEM[p.pillar.branch]) c[BRANCH_ELEM[p.pillar.branch]]++;
  }
  return c;
}

// ─── 용신 분석 ───────────────────────────────────────────────

function computeYongShin(saju) {
  const dayMaster = saju.pillars[2]?.pillar?.stem;
  const dayElem   = STEM_ELEM[dayMaster] || '토';
  const elems     = computeElements(saju);

  const GENERATES   = {'목':'화','화':'토','토':'금','금':'수','수':'목'};
  const GENERATED_BY = {'화':'목','토':'화','금':'토','수':'금','목':'수'};
  const CONTROLS    = {'목':'토','화':'금','토':'수','금':'목','수':'화'};

  const support = (elems[dayElem]||0) + (elems[GENERATED_BY[dayElem]]||0);
  const total   = Object.values(elems).reduce((a,b)=>a+b,0) || 8;
  const isStrong = support >= 4;
  const isWeak   = support <= 2;

  const yong = isStrong ? CONTROLS[dayElem]    : GENERATED_BY[dayElem];
  const hee  = isStrong ? GENERATES[CONTROLS[dayElem]] : dayElem;
  const gi   = isStrong ? GENERATED_BY[dayElem] : CONTROLS[dayElem];

  return {
    type:    isStrong ? '신강(身强)' : isWeak ? '신약(身弱)' : '중화(中和)',
    gauge:   Math.max(10, Math.min(90, (support / total) * 100 * 1.2)),
    dayElem, yong, hee, gi, elems, total, isStrong, isWeak,
  };
}

// ─── 기본 운세 점수 계산 ─────────────────────────────────────

function computeBasicScores(saju, mp, dp, gender) {
  function calcW(g) {
    let s = compareToNatal(saju.pillars, g);
    saju.pillars.forEach(p => {
      if (WEALTH_SIP.has(p.stemSipsin)||WEALTH_SIP.has(p.branchSipsin)) {
        const r = analyzePillarRelations(p.pillar.ganzi, g);
        if ([...r.stem,...r.branch].some(x=>x.type==='合')) s += 3;
      }
    });
    return s;
  }
  function calcL(g) {
    const tgt = gender==='F' ? LOVE_SIP_F : WEALTH_SIP;
    let s = compareToNatal(saju.pillars, g);
    saju.pillars.forEach(p => {
      if (tgt.has(p.stemSipsin)||tgt.has(p.branchSipsin)) {
        const r = analyzePillarRelations(p.pillar.ganzi, g);
        if ([...r.stem,...r.branch].some(x=>x.type==='合')) s += 3;
      }
      if (analyzePillarRelations(p.pillar.ganzi, g).branch.some(x=>x.type==='合')) s += 1;
    });
    return s;
  }
  const CAREER_SIP = new Set(gender==='F' ? ['偏財','正財'] : ['偏官','正官','食神','傷官']);
  function calcC(g) {
    let s = compareToNatal(saju.pillars, g);
    saju.pillars.forEach(p => {
      if (CAREER_SIP.has(p.stemSipsin)||CAREER_SIP.has(p.branchSipsin)) {
        const r = analyzePillarRelations(p.pillar.ganzi, g);
        if ([...r.stem,...r.branch].some(x=>x.type==='合')) s += 2.5;
      }
    });
    return s;
  }

  const elems  = computeElements(saju);
  const vals   = Object.values(elems);
  const mean   = vals.reduce((a,b)=>a+b,0)/5;
  const balance = 1 - vals.reduce((s,v)=>s+Math.abs(v-mean),0) / (mean*5||1);
  const dayRaw = compareToNatal(saju.pillars, dp);

  return {
    성향:   Math.max(30, Math.min(95, toPct(balance*2.5, 12))),
    애정운: toPct(calcL(mp), 3.5),
    직업운: toPct(calcC(mp), 3.2),
    재물운: toPct(calcW(mp), 3.5),
    건강운: toPct(dayRaw * balance, 3),
  };
}

// ─── 메인 폼 데이터 자동 추출 ────────────────────────────────

function captureMainFormInput() {
  const triggers = [...document.querySelectorAll('button[role="combobox"]')];
  let year=null, month=null, day=null, hour=12, minute=0, gender='M', unknownTime=false;

  for (const btn of triggers) {
    const txt = btn.textContent.trim(); let m;
    if      ((m=txt.match(/^(\d{4})년$/)))   year  = +m[1];
    else if ((m=txt.match(/^(\d{1,2})월$/))) month = +m[1];
    else if ((m=txt.match(/^(\d{1,2})일$/))) day   = +m[1];
    else if ((m=txt.match(/^(\d{1,2})시$/))) {
      if (btn.disabled||btn.hasAttribute('data-disabled')) unknownTime=true;
      else hour = +m[1];
    }
    else if ((m=txt.match(/^(\d{2})분$/)))   minute = +m[1];
  }

  const sw = document.querySelector('button[role="switch"]');
  if (sw && sw.getAttribute('data-state')==='checked') { unknownTime=true; hour=12; }

  const radioItems = [...document.querySelectorAll('button[role="radio"]')];
  for (const btn of radioItems) {
    if (btn.getAttribute('data-state')==='on') {
      const txt = btn.textContent.trim();
      if (txt==='여'||txt.includes('여성')||txt==='女') gender='F';
      break;
    }
  }
  if (document.querySelector('input[type="radio"][value="F"]:checked')) gender='F';

  if (!year||!month||!day) return null;
  if (year<1900||year>2100||month<1||month>12||day<1||day>31) return null;
  return { year, month, day, hour:unknownTime?12:hour, minute, gender, unknownTime };
}

// ─── Imperial Cosmic 렌더 헬퍼 ─────────────────────────────────────

const D = {
  wrap:   'background:linear-gradient(135deg,#0d1020 0%,#111428 50%,#0a0e1a 100%);border-radius:18px;padding:24px;border:1px solid rgba(212,175,55,0.15);box-shadow:0 4px 32px rgba(0,0,0,0.5),inset 0 1px 0 rgba(212,175,55,0.08);',
  card:   'background:linear-gradient(135deg,#131726 0%,#161b2e 100%);border:1px solid rgba(212,175,55,0.2);border-radius:14px;padding:18px;box-shadow:0 2px 16px rgba(0,0,0,0.4),0 0 0 1px rgba(124,106,247,0.05);position:relative;overflow:hidden;',
  hdr:    'background:linear-gradient(135deg,#e8d5a3,#c9a84c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:700;font-size:22px;font-family:"Cormorant Garamond",serif;letter-spacing:0.03em;',
  sub:    'color:#9d8aa0;font-size:17px;',
  txt:    'color:#c8cee8;font-size:19px;line-height:1.8;',
  muted:  'color:#5a5f7a;font-size:15px;',
};

function dGauge(pct, color) {
  return `<div style="height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;margin-top:6px">
    <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,${color}99,${color});border-radius:3px;box-shadow:0 0 8px ${color}60"></div>
  </div>`;
}

function scoreColor(pct) {
  return pct >= 70 ? '#34d399' : pct >= 45 ? '#d4af37' : '#f87171';
}

function scoreBadge(pct) {
  const c = scoreColor(pct);
  return `<span style="background:${c}18;color:${c};font-size:15px;font-weight:700;padding:3px 10px;border-radius:20px;border:1px solid ${c}50;box-shadow:0 0 8px ${c}30">${Math.round(pct)}점</span>`;
}

function sectionHeader(letter, title, subtitle) {
  return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid rgba(212,175,55,0.15)">
    <span style="background:linear-gradient(135deg,rgba(212,175,55,0.2),rgba(124,106,247,0.2));color:#d4af37;font-size:14px;font-weight:800;padding:3px 9px;border-radius:8px;border:1px solid rgba(212,175,55,0.4);box-shadow:0 0 12px rgba(212,175,55,0.15);letter-spacing:0.05em">${letter}</span>
    <span style="${D.hdr}">${title}</span>
    <span style="${D.sub};font-size:15px">${subtitle}</span>
  </div>`;
}

// ─── A. 기본 운세 해석 텍스트 ──────────────────────────────────

const FORTUNE_DETAIL = {
  성향: [
    { min:85, text:'타고난 기질이 매우 조화롭고 균형 잡혀 있습니다. 어떤 환경에서도 자신의 강점을 발휘하며, 주변 사람들에게 긍정적인 영향을 미치는 타고난 리더 기질을 지니고 있습니다. 직관력과 판단력이 뛰어나 중요한 순간에 탁월한 선택을 내립니다.' },
    { min:70, text:'성격과 기질이 안정적으로 발달해 있어 사회적 관계에서 신뢰를 쌓기 쉽습니다. 자신의 감정을 잘 조절하며, 목표를 향해 꾸준히 나아가는 힘이 있습니다. 다양한 상황에서 유연하게 대처하는 능력이 돋보입니다.' },
    { min:48, text:'기질의 균형이 무난한 편입니다. 장점과 단점이 공존하며, 환경에 따라 성격 표현이 달라질 수 있습니다. 자신의 강점을 의식적으로 계발하면 더 큰 잠재력을 발휘할 수 있습니다.' },
    { min:30, text:'기질적으로 다소 불균형한 면이 있어 감정 기복이나 결정 장애를 경험할 수 있습니다. 자기 이해를 높이고 약점을 보완하는 노력이 필요합니다. 내면의 안정을 찾는 것이 중요한 과제입니다.' },
    { min: 0, text:'오행 불균형으로 인해 기질적 갈등이 심할 수 있습니다. 충동적 행동이나 극단적 감정 반응에 주의가 필요합니다. 명상, 규칙적인 생활, 신뢰할 수 있는 조언자의 도움을 받는 것이 도움이 됩니다.' },
  ],
  애정운: [
    { min:85, text:'인연의 기운이 매우 강하게 흐르고 있습니다. 새로운 만남이나 기존 관계의 깊어짐이 기대되는 시기입니다. 감정 표현이 자연스럽게 이루어지며, 상대방의 마음을 얻기에 유리한 에너지가 충만합니다.' },
    { min:70, text:'애정 운이 좋은 편으로, 관계에서 따뜻한 교류가 이루어집니다. 진심 어린 소통이 관계를 더욱 돈독하게 만들어 줍니다. 솔직한 감정 표현이 인연을 발전시키는 열쇠가 됩니다.' },
    { min:48, text:'애정 운이 평범한 편입니다. 특별한 변화보다는 현재 관계를 안정적으로 유지하는 것이 중요합니다. 상대방의 입장을 이해하려는 노력이 관계의 질을 높여줍니다.' },
    { min:30, text:'감정적 교류에서 어려움이 있을 수 있습니다. 오해나 갈등이 생기기 쉬운 시기이므로 충동적인 감정 표현을 자제하고 신중하게 행동하는 것이 좋습니다. 혼자만의 시간을 통해 감정을 정리하세요.' },
    { min: 0, text:'인연의 흐름이 막혀 있는 시기입니다. 관계에서 상처를 받거나 이별의 아픔을 경험할 수 있습니다. 자신을 먼저 돌보고 내면의 상처를 치유하는 데 집중하는 것이 현명합니다.' },
  ],
  직업운: [
    { min:85, text:'사회적 활동과 직업 운이 매우 강한 시기입니다. 능력을 인정받고 승진이나 중요한 기회가 찾아올 수 있습니다. 새로운 프로젝트나 도전에 적극적으로 나서면 좋은 결과를 얻을 수 있습니다.' },
    { min:70, text:'직업 운이 순조롭게 흐르고 있습니다. 꾸준한 노력이 인정받는 시기로, 동료나 상사와의 관계도 원만합니다. 자신의 전문성을 더욱 갈고닦으면 더 큰 성과를 거둘 수 있습니다.' },
    { min:48, text:'직업 운이 평범한 편입니다. 큰 변화보다는 현재 위치에서 성실하게 임하는 것이 중요합니다. 새로운 기술이나 지식을 습득하여 경쟁력을 높이는 것이 도움이 됩니다.' },
    { min:30, text:'직업적으로 어려움이 있을 수 있는 시기입니다. 직장 내 갈등이나 업무 부담이 증가할 수 있으므로 신중하게 행동하고 불필요한 마찰을 피하는 것이 좋습니다. 무리한 도전보다 현상 유지에 집중하세요.' },
    { min: 0, text:'직업 운이 매우 불안정한 시기입니다. 직장 변동이나 실직의 위험이 있을 수 있으므로 중요한 결정을 미루고 안정을 최우선으로 삼으세요. 신뢰할 수 있는 사람의 조언을 구하는 것이 도움이 됩니다.' },
  ],
  재물운: [
    { min:85, text:'재물 운이 매우 강하게 흐르고 있습니다. 예상치 못한 수입이나 투자 성과가 기대되는 시기입니다. 재물이 자연스럽게 모이는 흐름이므로 장기적인 재테크 계획을 세우기에 좋은 때입니다.' },
    { min:70, text:'재물 운이 좋은 편입니다. 수입이 안정적으로 유지되며 절약과 투자의 균형을 잘 맞출 수 있습니다. 소소한 재물 기회들이 꾸준히 찾아오는 시기입니다.' },
    { min:48, text:'재물 운이 평범한 편입니다. 큰 이익보다는 현재 재정 상태를 안정적으로 유지하는 것이 중요합니다. 불필요한 지출을 줄이고 저축 습관을 기르는 것이 도움이 됩니다.' },
    { min:30, text:'재물 손실이나 예상치 못한 지출이 발생할 수 있는 시기입니다. 충동적인 소비나 투기적 투자를 자제하고 보수적인 재정 관리가 필요합니다. 보증이나 대출에 특히 주의하세요.' },
    { min: 0, text:'재물 운이 매우 불안정한 시기입니다. 큰 재정적 손실이나 사기 피해의 위험이 있으므로 중요한 금전 거래는 반드시 전문가의 조언을 구하세요. 현금 보유를 늘리고 리스크를 최소화하는 것이 현명합니다.' },
  ],
  건강운: [
    { min:85, text:'몸과 마음의 에너지가 매우 충만한 시기입니다. 체력이 넘치고 면역력도 강해 활발한 활동이 가능합니다. 이 시기에 건강한 습관을 정착시키면 오랫동안 좋은 컨디션을 유지할 수 있습니다.' },
    { min:70, text:'건강 상태가 전반적으로 양호합니다. 규칙적인 생활과 적당한 운동으로 현재의 좋은 컨디션을 유지하세요. 스트레스 관리에 신경 쓰면 더욱 활기찬 생활이 가능합니다.' },
    { min:48, text:'건강 운이 평범한 편입니다. 특별한 이상은 없지만 과로나 스트레스에 취약할 수 있습니다. 충분한 수면과 균형 잡힌 식사로 기초 체력을 유지하는 것이 중요합니다.' },
    { min:30, text:'건강에 주의가 필요한 시기입니다. 피로 누적이나 소화기 계통의 문제가 생길 수 있습니다. 무리한 활동을 자제하고 정기적인 건강 검진을 받는 것이 좋습니다. 충분한 휴식이 필수입니다.' },
    { min: 0, text:'건강 운이 매우 좋지 않은 시기입니다. 만성 질환이 악화되거나 새로운 건강 문제가 발생할 수 있습니다. 즉시 전문의 상담을 받고, 과로와 스트레스를 철저히 피하세요. 몸의 신호에 귀를 기울이는 것이 중요합니다.' },
  ],
};

function getFortuneDetail(key, pct) {
  const list = FORTUNE_DETAIL[key];
  if (!list) return '';
  return (list.find(l => pct >= l.min) || list[list.length-1]).text;
}

// ─── A. 기본 운세 ─────────────────────────────────────────────

function renderBasicFortune(saju, yp, mp, dp, gender) {
  const scores = computeBasicScores(saju, mp, dp, gender);
  const b = saju.pillars[3].pillar.branch;
  const z = ZODIAC_ANIMAL[b];
  const dayMaster = saju.pillars[2]?.pillar?.stem || '';

  const CATEGORIES = [
    { key:'성향',   emoji:'🌟', color:'#9d8ff5', desc:t('타고난 기질과 성격의 흐름') },
    { key:'애정운', emoji:'💗', color:'#f472b6', desc:t('감정과 인연의 에너지') },
    { key:'직업운', emoji:'💼', color:'#60a5fa', desc:t('사회적 활동과 성취 흐름') },
    { key:'재물운', emoji:'💰', color:'#fbbf24', desc:t('재물과 기회의 흐름') },
    { key:'건강운', emoji:'🌿', color:'#34d399', desc:t('몸과 마음의 균형 에너지') },
  ];

  const cards = CATEGORIES.map(cat => {
    const pct = scores[cat.key] || 50;
    const lv  = getLevel(pct);
    const glowColor = cat.color;
    const detailText = getFortuneDetail(cat.key, pct);
    return `<div style="${D.card}border-top:2px solid ${glowColor}40;transition:transform 0.2s,box-shadow 0.2s;">
      <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${glowColor}60,transparent)"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:26px;filter:drop-shadow(0 0 6px ${glowColor}80)">${cat.emoji}</span>
          <span style="color:#e8dfc8;font-weight:700;font-size:17px;font-family:'Cormorant Garamond',serif;letter-spacing:0.02em">${t(cat.key)}</span>
        </div>
        ${scoreBadge(pct)}
      </div>
      ${dGauge(pct, glowColor)}
      <div style="margin-top:8px;display:inline-flex;align-items:center;gap:4px;background:${glowColor}15;color:${glowColor};font-size:12px;font-weight:700;padding:3px 10px;border-radius:10px;border:1px solid ${glowColor}30">${lv.emoji} ${lv.label}</div>
      <div style="color:#b8c0d8;font-size:14px;margin-top:10px;line-height:1.75;padding:10px 12px;background:rgba(255,255,255,0.03);border-radius:8px;border-left:2px solid ${glowColor}50">${detailText}</div>
    </div>`;
  }).join('');

  const zodiacBlock = z ? `
    <div style="${D.card}border:1px solid rgba(212,175,55,0.3);margin-top:12px;">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.6),transparent)"></div>
      <div style="display:flex;align-items:center;gap:16px">
        <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,rgba(212,175,55,0.15),rgba(124,106,247,0.15));border:2px solid rgba(212,175,55,0.3);display:flex;align-items:center;justify-content:center;font-size:40px;flex-shrink:0;box-shadow:0 0 20px rgba(212,175,55,0.2)">${z.emoji}</div>
        <div style="flex:1">
          <div style="color:#8a8fa8;font-size:13px;letter-spacing:0.08em;margin-bottom:4px">${t('당신의 띠는')}</div>
          <div style="background:linear-gradient(135deg,#e8d5a3,#c9a84c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:800;font-size:24px;font-family:'Cormorant Garamond',serif">${t('animal.'+b)}띠 입니다.</div>
          <div style="color:#7a6f8a;font-size:13px;margin-top:4px">${z.years}년생 · ${dayMaster}일간</div>
          <div style="color:#c0c8e0;font-size:15px;margin-top:8px;line-height:1.7">${t('trait.'+b)}</div>
        </div>
      </div>
    </div>` : '';

  return `<div style="${D.wrap}">
    ${sectionHeader('A', t('기본 운세'), t('사주 원국 기반'))}
    <div style="display:grid;grid-template-columns:1fr;gap:12px">
      ${cards}
    </div>
    ${zodiacBlock}
  </div>`;
}

// ─── B. 오늘의 운세 + 럭키 캘린더 ───────────────────────────

function renderDailyCalendar(saju, yp, mp, dp) {
  const raw = compareToNatal(saju.pillars, dp)
            + compareToNatal(saju.pillars, mp)*0.5
            + compareToNatal(saju.pillars, yp)*0.3;
  const todayPct = toPct(raw, 3);
  const todayLv  = getLevel(todayPct);
  const lk = getLucky(dp);

  const today = new Date();
  const cells = [];
  for (let i=0; i<7; i++) {
    const d = new Date(today); d.setDate(today.getDate()+i);
    const y=d.getFullYear(), m=d.getMonth()+1, dy=d.getDate(), dow=DAY_KR[d.getDay()];
    const dowCol = d.getDay()===0?'#f87171':d.getDay()===6?'#60a5fa':'#7a82a8';
    let dayP; try { [,,dayP]=getFourPillars(y,m,dy,12,0,false); } catch { continue; }
    const p2=toPct(compareToNatal(saju.pillars,dayP),4), lv2=getLevel(p2), lk2=getLucky(dayP);
    const isToday = i===0;
    const border = isToday ? 'border:1px solid rgba(212,175,55,0.5);' : 'border:1px solid rgba(212,175,55,0.1);';
    const bg     = isToday ? 'background:linear-gradient(135deg,rgba(124,106,247,0.15),rgba(212,175,55,0.08));box-shadow:0 0 16px rgba(212,175,55,0.15);' : 'background:linear-gradient(135deg,#131726,#161b2e);';
    cells.push(`<div style="${bg}${border}border-radius:12px;padding:10px 4px;text-align:center;position:relative;overflow:hidden">
      ${isToday ? `<div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.8),transparent)"></div>` : ''}
      <div style="font-size:14px;color:${dowCol};font-weight:700;letter-spacing:0.05em">${dow}</div>
      <div style="font-size:28px;font-weight:700;color:${isToday?'#d4af37':'#c8cee8'};margin:3px 0;font-family:'Cormorant Garamond',serif">${dy}</div>
      ${isToday?`<div style="font-size:11px;color:#d4af37;margin-top:-4px;letter-spacing:0.1em;text-transform:uppercase">${t('오늘')}</div>`:''}
      <div style="font-size:12px;color:#5a5f7a;font-family:monospace;margin-top:2px">${ganziStr(dayP)}</div>
      <div style="font-size:26px;margin-top:4px;filter:drop-shadow(0 0 6px rgba(255,255,255,0.4))">${lv2.emoji}</div>
      <div style="width:14px;height:14px;border-radius:3px;background:${lk2.hex};margin:5px auto 0;border:1px solid rgba(255,255,255,0.25);box-shadow:0 0 8px ${lk2.hex}90"></div>
      <div style="font-size:10px;color:#8a8fa8;margin-top:3px;letter-spacing:0.02em">${t('lucky.'+lk2.elem+'.color')}</div>
    </div>`);
  }

  const TODAY_DESC = {
    '대길(大吉)': t('today.대길(大吉)'),
    '길(吉)':     t('today.길(吉)'),
    '평(平)':     t('today.평(平)'),
    '소흉(小凶)': t('today.소흉(小凶)'),
    '흉(凶)':     t('today.흉(凶)'),
  };

  // 오늘 날짜 문자열 생성
  const todayDate = `${today.getFullYear()}년 ${today.getMonth()+1}월 ${today.getDate()}일`;

  return `<div style="${D.wrap}">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid rgba(212,175,55,0.15)">
      <span style="background:linear-gradient(135deg,rgba(212,175,55,0.2),rgba(124,106,247,0.2));color:#d4af37;font-size:14px;font-weight:800;padding:3px 9px;border-radius:8px;border:1px solid rgba(212,175,55,0.4);box-shadow:0 0 12px rgba(212,175,55,0.15);letter-spacing:0.05em">B</span>
      <span style="${D.hdr}">${t('오늘의 운세')}</span>
      <span style="${D.sub};font-size:15px">${t('일진 분석')}</span>
      <span style="margin-left:auto;background:linear-gradient(135deg,rgba(212,175,55,0.12),rgba(124,106,247,0.08));border:1px solid rgba(212,175,55,0.3);border-radius:20px;padding:4px 14px;color:#d4af37;font-size:14px;font-weight:600;font-family:'Cormorant Garamond',serif;letter-spacing:0.03em">📅 ${todayDate}</span>
    </div>
    <div style="${D.card}border:1px solid rgba(212,175,55,0.25);margin-bottom:12px;">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.7),transparent)"></div>
      <div style="display:flex;align-items:center;gap:20px">
        <div style="text-align:center;min-width:90px">
          <div style="font-size:72px;line-height:1;filter:drop-shadow(0 0 16px rgba(212,175,55,0.6))">${todayLv.emoji}</div>
          <div style="background:linear-gradient(135deg,#e8d5a3,#c9a84c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:800;font-size:20px;margin-top:6px;font-family:'Cormorant Garamond',serif">${t(todayLv.label)}</div>
        </div>
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <span style="color:#8a8fa8;font-size:16px;font-weight:600">${t('운세 지수')}</span>
            <span style="color:${scoreColor(todayPct)};font-weight:800;font-size:26px;font-family:'Cormorant Garamond',serif">${Math.round(todayPct)}점</span>
          </div>
          ${dGauge(todayPct, scoreColor(todayPct))}
          <p style="color:#c0c8e0;font-size:17px;margin-top:12px;line-height:1.8">${TODAY_DESC[todayLv.label]||TODAY_DESC['평(平)']}</p>
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">
      <div style="${D.card}text-align:center;border:1px solid rgba(${lk.hex.replace('#','').match(/../g).map(h=>parseInt(h,16)).join(',')},0.3);">
        <div style="color:#7a6f8a;font-size:14px;margin-bottom:10px;letter-spacing:0.05em">${t('행운의 색')}</div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
          <div style="width:36px;height:36px;border-radius:6px;background:${lk.hex};border:2px solid rgba(255,255,255,0.25);box-shadow:0 0 16px ${lk.hex}99,inset 0 1px 0 rgba(255,255,255,0.2)"></div>
          <span style="color:#e8dfc8;font-size:18px;font-weight:700;font-family:'Cormorant Garamond',serif;margin-top:2px">${t('lucky.'+lk.elem+'.color')}</span>
        </div>
      </div>
      <div style="${D.card}text-align:center;border:1px solid rgba(212,175,55,0.2);">
        <div style="color:#7a6f8a;font-size:14px;margin-bottom:8px;letter-spacing:0.05em">${t('행운의 방향')}</div>
        <div style="background:linear-gradient(135deg,#e8d5a3,#c9a84c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-size:22px;font-weight:700;font-family:'Cormorant Garamond',serif">${t('lucky.'+lk.elem+'.direction')}</div>
      </div>
      <div style="${D.card}text-align:center;border:1px solid rgba(124,106,247,0.3);">
        <div style="color:#7a6f8a;font-size:14px;margin-bottom:8px;letter-spacing:0.05em">${t('행운의 숫자')}</div>
        <div style="color:#a78bfa;font-size:28px;font-weight:800;font-family:'Cormorant Garamond',serif">${lk.number}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">${cells.join('')}</div>
    <div style="${D.muted};margin-top:8px;text-align:center">${t('⭐대길 ✨길 🌀평 ⚡소흉 ⚠️흉 · ● 행운의 색').replace('● 행운의 색','■ 행운의 색')}</div>
  </div>`;
}

// ─── C. 용신 분석 ─────────────────────────────────────────────

function renderYongShin(saju) {
  const ys = computeYongShin(saju);
  const ELEM_KO  = {'목':'木 목','화':'火 화','토':'土 토','금':'金 금','수':'水 수'};
  const ELEM_CLR = {'목':'#34d399','화':'#f87171','토':'#fbbf24','금':'#94a3b8','수':'#60a5fa'};
  const total = ys.total || 8;

  const elemBars = Object.entries(ys.elems).map(([e, cnt]) => {
    const pct = Math.round((cnt/total)*100);
    return `<div style="margin-bottom:6px">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px">
        <span style="color:${ELEM_CLR[e]};font-size:18px;font-weight:600">${ELEM_KO[e]}</span>
        <span style="${D.sub}">${cnt}개 · ${pct}%</span>
      </div>
      ${dGauge(pct, ELEM_CLR[e])}
    </div>`;
  }).join('');

  const YONG_DESC = {
    '용신': {
      '목': '나무의 기운이 부족한 명식에 생기를 불어넣습니다. 성장·창의·도전의 에너지를 보충해 주므로 동쪽 방향, 초록색 계열, 봄철 활동이 길합니다. 새로운 시작이나 사업 확장에 유리한 시기를 잘 활용하세요.',
      '화': '불의 기운으로 열정과 표현력을 강화합니다. 남쪽 방향, 빨간색 계열이 행운을 부르며 인간관계와 명예 운이 상승합니다. 적극적인 자기 표현과 사교 활동이 운을 여는 열쇠입니다.',
      '토': '대지의 안정된 기운이 중심을 잡아줍니다. 중앙·황토색 계열이 길하며 부동산·저축·건강 관리에 집중하면 운이 열립니다. 신뢰와 성실함으로 주변의 지지를 얻는 것이 중요합니다.',
      '금': '금속의 날카로운 기운이 결단력과 재물운을 강화합니다. 서쪽 방향, 흰색·금색 계열이 길하며 계획적인 재테크와 자기 계발이 운을 높입니다. 원칙을 지키는 행동이 신뢰를 쌓습니다.',
      '수': '물의 지혜로운 기운이 지식과 재물의 흐름을 원활하게 합니다. 북쪽 방향, 검정·파란색 계열이 길하며 학업·연구·금융 분야에서 두각을 나타낼 수 있습니다. 유연한 사고로 기회를 포착하세요.',
    },
    '희신': {
      '목': '용신을 보조하는 나무 기운입니다. 창의적 활동과 인간관계 확장이 간접적으로 운을 돕습니다. 식물 키우기, 등산, 새벽 산책 등 목(木) 기운을 접하는 생활 습관이 에너지를 보충해 줍니다.',
      '화': '용신을 보조하는 불 기운입니다. 밝고 활기찬 환경이 운의 흐름을 원활하게 합니다. 조명이 밝은 공간에서 활동하거나 따뜻한 색상의 소품을 활용하면 보조 에너지가 강화됩니다.',
      '토': '용신을 보조하는 토 기운입니다. 안정적인 생활 기반이 전체 운을 뒷받침합니다. 규칙적인 식사와 수면, 꾸준한 저축 습관이 이 기운을 활성화하여 운의 토대를 다집니다.',
      '금': '용신을 보조하는 금 기운입니다. 정확하고 체계적인 행동이 운을 뒷받침합니다. 금속 소품이나 흰색 계열 인테리어가 이 기운을 강화하며, 계획적인 생활 패턴이 도움이 됩니다.',
      '수': '용신을 보조하는 수 기운입니다. 지식 축적과 내면 성찰이 운을 간접적으로 강화합니다. 독서, 명상, 수영 등 수(水) 기운과 연관된 활동이 보조 에너지를 활성화합니다.',
    },
    '기신': {
      '목': '나무 기운이 과잉되어 균형을 흐트러뜨립니다. 지나친 고집이나 무리한 확장을 조심하세요. 동쪽 방향과 초록색 계열을 과도하게 사용하면 에너지 소모가 커질 수 있으니 절제가 필요합니다.',
      '화': '불 기운이 과잉되어 충동적 행동이나 과열을 유발할 수 있습니다. 감정 기복과 급한 결정을 경계하세요. 빨간색 계열과 남쪽 방향을 과도하게 접하면 스트레스가 가중될 수 있습니다.',
      '토': '토 기운이 과잉되어 정체와 고집을 유발할 수 있습니다. 변화를 두려워하거나 지나치게 보수적인 태도가 기회를 놓치게 합니다. 황토색·중앙 배치를 줄이고 유연한 사고를 키우세요.',
      '금': '금 기운이 과잉되어 지나친 냉정함이나 갈등을 일으킬 수 있습니다. 날카로운 언행과 무리한 경쟁을 자제하세요. 금속 소품이나 흰색 계열을 과도하게 사용하면 긴장감이 높아질 수 있습니다.',
      '수': '수 기운이 과잉되어 우유부단함이나 과도한 걱정을 유발할 수 있습니다. 지나친 분석과 소극적 태도를 경계하세요. 검정·파란색 계열과 북쪽 방향을 과도하게 접하면 에너지가 침체될 수 있습니다.',
    },
  };

  function yongCard(label, elem, role, desc) {
    const c = ELEM_CLR[elem] || '#7a82a8';
    const roleKey = role==='용신'?'가장 필요한 기운':role==='희신'?'보조 도움 기운':'조심해야 할 기운';
    const isGi = role==='기신';
    const detailDesc = elem ? (YONG_DESC[role]?.[elem] || '') : '';
    return `<div style="${D.card}border-left:3px solid ${c};border-top:1px solid ${c}30;">
      <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,${c}60,transparent)"></div>
      <div style="text-align:center;margin-bottom:8px">
        <div style="font-size:28px;margin-bottom:4px;filter:drop-shadow(0 0 8px ${c}60)">${role==='용신'?'✨':role==='희신'?'🌟':'⚠️'}</div>
        <span style="background:linear-gradient(135deg,${c}30,${c}15);color:${c};font-weight:800;font-size:17px;padding:3px 10px;border-radius:10px;border:1px solid ${c}40;display:inline-block">${t(role)}</span>
      </div>
      <div style="text-align:center;background:${c}12;border-radius:8px;padding:6px;margin-bottom:8px">
        <span style="color:${c};font-size:20px;font-weight:700;font-family:'Cormorant Garamond',serif">${elem ? ELEM_KO[elem] : '-'}</span>
      </div>
      <div style="color:#8a8fa8;font-size:12px;text-align:center;line-height:1.4;margin-bottom:8px">${t(roleKey)}</div>
      ${detailDesc ? `<div style="background:${isGi?'rgba(248,113,113,0.06)':'rgba(212,175,55,0.06)'};border:1px solid ${c}20;border-radius:8px;padding:10px;color:#b0b8d0;font-size:12px;line-height:1.7;text-align:left">${detailDesc}</div>` : ''}
    </div>`;
  }

  const gaugeLeft  = Math.max(5, Math.min(90, 100-ys.gauge));
  const gaugeRight = 100 - gaugeLeft;

  return `<div style="${D.wrap}">
    ${sectionHeader('C', t('용신 분석'), t('일간 강약과 오행 균형'))}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
      <div style="${D.card}border:1px solid rgba(212,175,55,0.2);">
        <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.5),transparent)"></div>
        <div style="color:#7a6f8a;font-size:13px;margin-bottom:8px;letter-spacing:0.05em">${t('일간 강약')}</div>
        <div style="background:linear-gradient(135deg,#e8d5a3,#c9a84c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:800;font-size:20px;margin-bottom:10px;font-family:'Cormorant Garamond',serif">${ys.type}</div>
        <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;box-shadow:inset 0 1px 3px rgba(0,0,0,0.3)">
          <div style="background:linear-gradient(90deg,#60a5fa,#3b82f6);width:${gaugeLeft}%;box-shadow:0 0 8px #60a5fa60"></div>
          <div style="background:linear-gradient(90deg,#f87171,#ef4444);width:${gaugeRight}%;box-shadow:0 0 8px #f8717160"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:6px">
          <span style="color:#60a5fa;font-size:13px;font-weight:600">${t('신약')}</span>
          <span style="color:#f87171;font-size:13px;font-weight:600">${t('신강')}</span>
        </div>
      </div>
      <div style="${D.card}border:1px solid rgba(124,106,247,0.2);">
        <div style="color:#7a6f8a;font-size:13px;margin-bottom:10px;letter-spacing:0.05em">${t('오행 분포')}</div>
        ${elemBars}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
      ${yongCard('용신', ys.yong, '용신', '')}
      ${yongCard('희신', ys.hee,  '희신', '')}
      ${yongCard('기신', ys.gi,   '기신', '')}
    </div>
  </div>`;
}

// ─── D. 12운성 ────────────────────────────────────────────────

function renderSijunseong(saju) {
  const dayMaster = saju.pillars[2]?.pillar?.stem;
  if (!dayMaster) return '';
  const PILLAR_NAMES = [t('년주'),t('월주'),t('일주'),t('시주')];
  const PILLAR_COLORS = ['#d4af37','#a78bfa','#f472b6','#60a5fa'];
  const cards = saju.pillars.map((p, i) => {
    const sjs = getSijunseong(dayMaster, p.pillar.branch);
    if (!sjs) return '';
    const sjsIdx = SJS_NAMES.indexOf(sjs.name);
    const pc = PILLAR_COLORS[i];
    return `<div style="${D.card}border-top:2px solid ${pc}40;text-align:center;">
      <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${pc}60,transparent)"></div>
      <div style="color:#7a6f8a;font-size:12px;margin-bottom:6px;letter-spacing:0.08em;text-transform:uppercase">${PILLAR_NAMES[i]}</div>
      <div style="font-family:monospace;background:linear-gradient(135deg,${pc},${pc}99);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:800;font-size:22px;margin-bottom:8px">${p.pillar.ganzi}</div>
      <div style="font-size:38px;margin-bottom:6px;filter:drop-shadow(0 0 8px ${pc}60)">${sjs.emoji}</div>
      <div style="color:#e8dfc8;font-weight:700;font-size:18px;margin-bottom:6px;font-family:'Cormorant Garamond',serif">${sjs.name}</div>
      <div style="color:#8a8fa8;font-size:13px;line-height:1.5">${t('sjs.'+sjsIdx)}</div>
    </div>`;
  }).join('');

  return `<div style="${D.wrap}">
    ${sectionHeader('D', t('12운성'), t('일간 기준 · 사주 각 기둥의 생명 단계'))}
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
      ${cards}
    </div>
  </div>`;
}

// ─── E. 자미두수 ──────────────────────────────────────────────

function renderZiweiSection(chart) {
  function palaceCard(palaceName, emoji, label) {
    const palace = chart.palaces[palaceName];
    if (!palace) return '';
    const mains = getMainStars(palace);
    const PALACE_COLORS = {'命宮':'#d4af37','財帛':'#fbbf24','夫妻':'#f472b6'};
    const pc = PALACE_COLORS[palaceName] || '#a78bfa';
    if (mains.length === 0) {
      return `<div style="${D.card}border-top:2px solid ${pc}40;">
        <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${pc}60,transparent)"></div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <span style="font-size:26px;filter:drop-shadow(0 0 6px ${pc}80)">${emoji}</span>
          <span style="color:#e8dfc8;font-weight:700;font-size:18px;font-family:'Cormorant Garamond',serif">${label}</span>
          <span style="background:rgba(212,175,55,0.1);color:#9d8aa0;font-size:13px;padding:2px 7px;border-radius:6px;border:1px solid rgba(212,175,55,0.2)">${palace.ganZhi}</span>
        </div>
        <p style="color:#7a6f8a;font-size:15px">${t('이 궁에는 주성이 없어 대궁(對宮) 성향으로 판단합니다.')}</p>
      </div>`;
    }
    const starCards = mains.map(s => {
      const info = STAR_DESC[s.name] || { fate:s.name, wealth:'', love:'' };
      const field = palaceName==='命宮' ? 'fate' : palaceName==='財帛' ? 'wealth' : 'love';
      const content = t('star.'+s.name+'.'+field) || (palaceName==='命宮' ? info.fate : palaceName==='財帛' ? info.wealth : info.love);
      const siHua = s.siHua
        ? `<span style="background:${s.siHua==='化忌'?'rgba(248,113,113,0.15)':'rgba(212,175,55,0.15)'};color:${s.siHua==='化忌'?'#f87171':'#d4af37'};font-size:13px;padding:2px 7px;border-radius:8px;margin-left:6px;border:1px solid ${s.siHua==='化忌'?'rgba(248,113,113,0.3)':'rgba(212,175,55,0.3)'}">${SIHAU_LABEL[s.siHua]||s.siHua}</span>` : '';
      const bright = s.brightness ? `<span style="color:#7a6f8a;font-size:14px"> (${s.brightness})</span>` : '';
      return `<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid rgba(212,175,55,0.08)">
        <span style="font-size:26px;flex-shrink:0;filter:drop-shadow(0 0 6px ${pc}60)">${emoji}</span>
        <div style="flex:1">
          <div style="display:flex;align-items:center;flex-wrap:wrap;margin-bottom:4px">
            <span style="background:linear-gradient(135deg,#e8d5a3,#c9a84c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:700;font-size:19px;font-family:'Cormorant Garamond',serif">${s.name}</span>${bright}${siHua}
          </div>
          <p style="color:#c0c8e0;font-size:16px;line-height:1.7;margin:0">${content}</p>
        </div>
      </div>`;
    }).join('');

    return `<div style="${D.card}border-top:2px solid ${pc}40;">
      <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${pc}60,transparent)"></div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <span style="font-size:26px;filter:drop-shadow(0 0 8px ${pc}80)">${emoji}</span>
        <span style="color:#e8dfc8;font-weight:700;font-size:18px;font-family:'Cormorant Garamond',serif">${label}</span>
        <span style="background:linear-gradient(135deg,rgba(124,106,247,0.15),rgba(212,175,55,0.1));color:#a78bfa;font-size:13px;padding:2px 8px;border-radius:8px;border:1px solid rgba(124,106,247,0.3)">${palace.ganZhi} ${palaceName}</span>
      </div>
      ${starCards}
    </div>`;
  }

  const wu = chart.wuXingJu;
  return `<div style="${D.wrap}">
    ${sectionHeader('E', t('자미두수'), `${wu?.name||'命盤'} · 3`)}
    <div style="display:flex;flex-direction:column;gap:10px">
      ${palaceCard('命宮','🌟',t('기본 운명 (명궁)'))}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${palaceCard('財帛','💰',t('재물 성향 (재백궁)'))}
        ${palaceCard('夫妻','💗',t('인연 성향 (부처궁)'))}
      </div>
    </div>
  </div>`;
}

// ─── F. 점성학 ────────────────────────────────────────────────

function renderNatalSection(natalChart, transitChart, unknownTime) {
  const find = (chart, id) => chart?.planets?.find(p=>p.id===id);
  const signName = s => SIGN_KO[toSignIdx(s)] ?? ZODIAC_KO?.[s] ?? '알 수 없음';

  const sun     = find(natalChart, 'Sun');
  const moon    = find(natalChart, 'Moon');
  const ascObj  = !unknownTime ? (natalChart?.angles?.asc ?? null) : null;
  const jupiter = find(transitChart, 'Jupiter');
  const venus   = find(transitChart, 'Venus');

  const PLANET_COLORS = {'☀️':'#fbbf24','🌙':'#c0c8e0','⬆️':'#34d399','♃':'#a78bfa','♀':'#f472b6'};
  function planetRow(iconTxt, title, subtitle, sign, descKey) {
    if (!sign && sign !== 0) return '';
    const idx = toSignIdx(sign);
    const desc = t(descKey+'.'+idx) || '';
    const pc = PLANET_COLORS[iconTxt] || '#d4af37';
    return `<div style="display:flex;gap:14px;padding:12px 0;border-bottom:1px solid rgba(212,175,55,0.08)">
      <div style="font-size:28px;flex-shrink:0;width:32px;text-align:center;filter:drop-shadow(0 0 8px ${pc}80)">${iconTxt}</div>
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span style="color:#e8dfc8;font-weight:700;font-size:17px;font-family:'Cormorant Garamond',serif">${t(title)}</span>
          <span style="background:rgba(212,175,55,0.1);color:#9d8aa0;font-size:13px;padding:1px 7px;border-radius:6px;border:1px solid rgba(212,175,55,0.15)">${t(subtitle)}</span>
        </div>
        <div style="background:linear-gradient(135deg,${pc},${pc}cc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:800;font-size:20px;margin-bottom:5px;font-family:'Cormorant Garamond',serif">${SIGN_EMOJI[idx]} ${signName(sign)}</div>
        <p style="color:#c0c8e0;font-size:15px;line-height:1.7;margin:0">${desc}</p>
      </div>
    </div>`;
  }

  const ascRow = ascObj ? `<div style="display:flex;gap:14px;padding:12px 0;border-bottom:1px solid rgba(212,175,55,0.08)">
    <div style="font-size:28px;flex-shrink:0;width:32px;text-align:center;filter:drop-shadow(0 0 8px #34d39980)">⬆️</div>
    <div style="flex:1">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="color:#e8dfc8;font-weight:700;font-size:17px;font-family:'Cormorant Garamond',serif">${t('상승궁 (ASC)')}</span>
        <span style="background:rgba(212,175,55,0.1);color:#9d8aa0;font-size:13px;padding:1px 7px;border-radius:6px;border:1px solid rgba(212,175,55,0.15)">${t('첫인상·외면')}</span>
      </div>
      <div style="background:linear-gradient(135deg,#34d399,#34d399cc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:800;font-size:20px;margin-bottom:5px;font-family:'Cormorant Garamond',serif">${SIGN_EMOJI[toSignIdx(ascObj.sign)]} ${signName(ascObj.sign)}</div>
      <p style="color:#c0c8e0;font-size:15px;line-height:1.7;margin:0">${t('타인에게 비치는 첫인상과 외면적 태도를 나타냅니다.')}</p>
    </div>
  </div>` : '';

  return `<div style="${D.wrap}">
    ${sectionHeader('F', t('점성학'), t('서양 천궁도 분석'))}
    <div style="${D.card}border:1px solid rgba(212,175,55,0.2);">
      ${planetRow('☀️', '태양 별자리', '핵심 정체성', sun?.sign, 'sun')}
      ${planetRow('🌙', '달 별자리',   '감성·본능',   moon?.sign, 'moon')}
      ${ascRow}
      ${planetRow('♃', '목성 현재 위치', '올해 성장 영역', jupiter?.sign, 'jup')}
      ${planetRow('♀', '금성 현재 위치', '이번달 애정·재물', venus?.sign, 'ven')}
    </div>
  </div>`;
}

// ─── 입력 폼 (자동 추출 실패 시 폴백) ─────────────────────────

function inputHtml() {
  const curYear = new Date().getFullYear();
  const yearOpts = Array.from({length: curYear - 1899}, (_, i) => curYear - i)
    .map(y => `<option value="${y}">${y}년</option>`).join('');
  const monthOpts = Array.from({length:12},(_,i)=>`<option value="${i+1}">${i+1}월</option>`).join('');
  const dayOpts   = Array.from({length:31},(_,i)=>`<option value="${i+1}">${i+1}일</option>`).join('');
  const hourOpts  = `<option value="">시간 모름</option>` +
    Array.from({length:24},(_,i)=>`<option value="${i}">${i}시</option>`).join('');

  const selectStyle = 'height:40px;border-radius:10px;border:1px solid rgba(212,175,55,0.3);background:linear-gradient(135deg,#131726,#161b2e);color:#e8dfc8;padding:0 12px;font-size:17px;outline:none;cursor:pointer;';
  return `<div style="background:linear-gradient(135deg,#0d1020,#111428);border:1px solid rgba(212,175,55,0.2);border-radius:16px;padding:22px;box-shadow:0 4px 32px rgba(0,0,0,0.5),inset 0 1px 0 rgba(212,175,55,0.08);position:relative;overflow:hidden">
    <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.6),transparent)"></div>

    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">
      <select id="gf-year" style="${selectStyle}">
        <option value="">${t('출생 연도')}</option>${yearOpts}
      </select>
      <select id="gf-month" style="${selectStyle}">
        <option value="">월</option>${monthOpts}
      </select>
      <select id="gf-day" style="${selectStyle}">
        <option value="">일</option>${dayOpts}
      </select>
      <select id="gf-hour" style="${selectStyle}">
        ${hourOpts}
      </select>
    </div>
    <div style="display:flex;gap:20px;margin-bottom:16px">
      <label style="display:flex;align-items:center;gap:8px;color:#c8cee8;font-size:17px;cursor:pointer">
        <input type="radio" name="gf-gender" value="M" checked style="accent-color:#d4af37" /> ${t('남성')}
      </label>
      <label style="display:flex;align-items:center;gap:8px;color:#c8cee8;font-size:17px;cursor:pointer">
        <input type="radio" name="gf-gender" value="F" style="accent-color:#f472b6" /> ${t('여성')}
      </label>
    </div>
    <button id="gf-calc" type="button"
      style="width:100%;border-radius:12px;padding:13px;font-size:19px;font-weight:700;color:#0a0e1a;border:none;cursor:pointer;background:linear-gradient(135deg,#d4af37,#c9a84c,#e8d5a3);box-shadow:0 4px 20px rgba(212,175,55,0.4),0 0 40px rgba(212,175,55,0.1);letter-spacing:0.03em;font-family:'Cormorant Garamond',serif">
      ${t('🔮 무료 운세 보기 (사주 · 자미두수 · 점성학)')}
    </button>
    <div id="gf-error" style="color:#f87171;font-size:16px;margin-top:10px;display:none"></div>
  </div>`;
}

// ─── 패널 생성 ────────────────────────────────────────────────

function createPanel() {
  const el = document.createElement('div');
  el.id = 'honcheon-fortune-panel';
  el.style.display = 'none';
  el.innerHTML = `<div style="background:linear-gradient(135deg,#0d1020 0%,#111428 100%);border-radius:18px;padding:24px;border:1px solid rgba(212,175,55,0.15);box-shadow:0 4px 32px rgba(0,0,0,0.5),inset 0 1px 0 rgba(212,175,55,0.08);position:relative;overflow:hidden">
    <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.7),rgba(124,106,247,0.5),transparent)"></div>
    <div style="position:absolute;top:20px;right:20px;width:120px;height:120px;background:radial-gradient(circle,rgba(212,175,55,0.06) 0%,transparent 70%);pointer-events:none"></div>
    <div style="margin-bottom:20px">
      <h3 style="background:linear-gradient(135deg,#e8d5a3,#c9a84c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-size:26px;font-weight:800;margin:0;font-family:'Cormorant Garamond',serif;letter-spacing:0.03em;text-align:center">🔮 ${t('무료 운세')}</h3>
      <p style="color:#8a8fa8;font-size:16px;margin:6px 0 0;line-height:1.5;text-align:center">${t('사주 · 자미두수 · 점성학 세 시스템 통합 분석 (회원가입 불필요)')}</p>
    </div>
    <div id="gf-body">
      <p style="color:#7a6f8a;font-size:18px;text-align:center;padding:28px 0">${t('운세를 계산하는 중입니다…')}</p>
    </div>
  </div>`;
  return el;
}

function membershipCard() {
  return `<div style="background:linear-gradient(135deg,#0d1020 0%,#111428 100%);border-radius:18px;padding:24px;border:1px solid rgba(212,175,55,0.15);box-shadow:0 4px 32px rgba(0,0,0,0.5);position:relative;overflow:hidden">
    <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.7),rgba(124,106,247,0.5),transparent)"></div>
    <div style="position:absolute;bottom:-30px;right:-30px;width:150px;height:150px;background:radial-gradient(circle,rgba(212,175,55,0.08) 0%,transparent 70%);pointer-events:none"></div>
    <div style="border:1px solid rgba(212,175,55,0.3);border-radius:16px;background:linear-gradient(135deg,rgba(212,175,55,0.05),rgba(124,106,247,0.05));padding:28px;text-align:center">
      <div style="font-size:52px;margin-bottom:12px;filter:drop-shadow(0 0 16px rgba(212,175,55,0.5))">🔐</div>
      <div style="background:linear-gradient(135deg,#e8d5a3,#c9a84c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:800;font-size:22px;margin-bottom:10px;font-family:'Cormorant Garamond',serif;letter-spacing:0.03em">${t('멤버십 전용 상세 분석')}</div>
      <p style="color:#c0a060;font-size:16px;margin-bottom:18px;line-height:1.6">${t('사주팔자 · 자미두수 · 천궁도 전체 결과를PDF로 정리하여 제공합니다.')}</p>
      <div style="display:flex;flex-direction:column;gap:8px;text-align:left;max-width:320px;margin:0 auto">
        ${['✨ 8글자 원국 전체 해석','✨ 대운 흐름 · 세운 분석','✨ 자미두수 12궁 상세 해석','✨ 천궁도 행성·하우스·상(Aspect) 분석','✨ AI 종합 해석 포함'].map(item => `
          <div style="display:flex;align-items:center;gap:10px;background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.12);border-radius:8px;padding:8px 12px">
            <span style="color:#d4af37;font-size:16px">${item.split(' ')[0]}</span>
            <span style="color:#c8cee8;font-size:15px">${t(item.slice(2))}</span>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function createTabs() {
  const el = document.createElement('div');
  el.id = 'honcheon-fortune-tabs';
  el.style.cssText = 'display:flex;border-radius:14px;background:linear-gradient(135deg,#0d1020,#111428);padding:5px;gap:5px;border:1px solid rgba(212,175,55,0.2);box-shadow:0 2px 16px rgba(0,0,0,0.4)';
  el.innerHTML = `
    <button data-tab="fortune"
      style="flex:1;border-radius:10px;padding:10px 16px;font-size:17px;font-weight:700;background:linear-gradient(135deg,#d4af37,#c9a84c);color:#0a0e1a;border:none;cursor:pointer;transition:all 0.3s;box-shadow:0 2px 12px rgba(212,175,55,0.3);font-family:'Cormorant Garamond',serif;letter-spacing:0.02em">
      🔮 ${t('무료 운세')}
    </button>
    <button data-tab="detail"
      style="flex:1;border-radius:10px;padding:10px 16px;font-size:17px;font-weight:500;background:transparent;color:#7a6f8a;border:1px solid rgba(212,175,55,0.1);cursor:pointer;transition:all 0.3s;font-family:'Cormorant Garamond',serif">
      🔐 ${t('멤버십 상세 분석')}
    </button>`;
  return el;
}

function createMembershipPanel() {
  const el = document.createElement('div');
  el.id = 'honcheon-membership-panel';
  el.style.display = 'none';
  el.innerHTML = membershipCard();
  return el;
}

// ─── 탭 전환 ─────────────────────────────────────────────────

function switchTab(tabId, results) {
  const tabs = document.getElementById('honcheon-fortune-tabs');
  if (!tabs) return;

  tabs.querySelectorAll('button').forEach(btn => {
    const active = btn.dataset.tab === tabId;
    if (active) {
      btn.style.background = 'linear-gradient(135deg,#d4af37,#c9a84c)';
      btn.style.color = '#0a0e1a';
      btn.style.fontWeight = '700';
      btn.style.boxShadow = '0 2px 12px rgba(212,175,55,0.35)';
      btn.style.border = 'none';
    } else {
      btn.style.background = 'transparent';
      btn.style.color = '#7a6f8a';
      btn.style.fontWeight = '500';
      btn.style.boxShadow = 'none';
      btn.style.border = '1px solid rgba(212,175,55,0.1)';
    }
  });

  Array.from(results.children).forEach(child => {
    const id = child.id;
    if (id === 'honcheon-fortune-tabs') return;
    if (id === 'honcheon-fortune-panel')    { child.style.display = tabId==='fortune'?'':'none'; return; }
    if (id === 'honcheon-membership-panel') { child.style.display = tabId==='detail' ?'':'none'; return; }
    if (id === 'honcheon-ai-panel')         { child.style.display = 'none'; return; }
    if (id === 'honcheon-gunghap-panel')    { child.style.display = tabId==='detail' ?'':'none'; return; }
    child.style.display = tabId==='detail' ? '' : 'none';
  });
}

// ─── 계산 실행 ────────────────────────────────────────────────

async function runFortune(preInput = null) {
  const errorEl = document.getElementById('gf-error');
  const bodyEl  = document.getElementById('gf-body');

  let year, month, day, hour, minute, gender, unknownTime;
  if (preInput) {
    ({ year, month, day, hour, minute, gender, unknownTime } = preInput);
  } else {
    year        = parseInt(document.getElementById('gf-year')?.value   || '');
    month       = parseInt(document.getElementById('gf-month')?.value  || '');
    day         = parseInt(document.getElementById('gf-day')?.value    || '');
    const hourVal = document.getElementById('gf-hour')?.value;
    unknownTime = !hourVal;
    hour        = unknownTime ? 12 : parseInt(hourVal);
    minute      = 0;
    gender      = document.querySelector('input[name="gf-gender"]:checked')?.value ?? 'M';
  }

  if (errorEl) { errorEl.textContent=''; errorEl.style.display='none'; }
  if (bodyEl) bodyEl.innerHTML = `<p style="color:#7a82a8;font-size:20px;text-align:center;padding:24px 0">${t('계산 중… 잠시만 기다려주세요.')}</p>`;

  try {
    if (!year||!month||!day) throw new Error(t('생년월일을 입력해주세요.'));
    if (year<1900||year>2100) throw new Error(t('올바른 연도를 입력해주세요.'));

    const saju  = calculateSaju({ year, month, day, hour, minute, gender, unknownTime });
    const ziwei = createChart(year, month, day, hour, 0, gender==='M');

    const [natalChart, transitChart] = await Promise.all([
      calculateNatal({ year, month, day, hour, minute, unknownTime }),
      (()=>{ const now=new Date(); return calculateNatal({ year:now.getFullYear(), month:now.getMonth()+1, day:now.getDate(), hour:12, minute:0 }); })()
    ]);

    const today = new Date();
    const [yp, mp, dp] = getFourPillars(today.getFullYear(), today.getMonth()+1, today.getDate(), 12, 0, false);

    lastInput = { year, month, day, hour, minute, gender, unknownTime };
    const infoLine = preInput
      ? `<div style="text-align:right;margin-bottom:8px"><span style="${D.sub}">${year}년 ${month}월 ${day}일 · ${gender==='F'?t('여'):t('남')}</span></div>`
      : '';

    if (bodyEl) bodyEl.innerHTML = `<div style="display:flex;flex-direction:column;gap:16px">
      ${infoLine}
      ${renderBasicFortune(saju, yp, mp, dp, gender)}
      ${renderDailyCalendar(saju, yp, mp, dp)}
      ${renderYongShin(saju)}
      ${renderSijunseong(saju)}
      ${renderZiweiSection(ziwei)}
      ${renderNatalSection(natalChart, transitChart, unknownTime)}
      <div style="text-align:center;padding:8px 0">
        <button id="gf-reset" type="button"
          style="color:#7a6f8a;font-size:15px;background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.15);border-radius:8px;padding:8px 18px;cursor:pointer;font-family:'Cormorant Garamond',serif;letter-spacing:0.03em;transition:all 0.2s">
          ↺ ${t('다른 생년월일로 다시 보기')}
        </button>
      </div>
      <p style="color:#4a4f6a;font-size:14px;text-align:center;padding-bottom:6px;line-height:1.6">
        ${t('※ 사주·자미두수·점성학 원국과 현재 날짜를 기반으로 자동 계산됩니다. 참고용으로 활용하세요.')}
      </p>
    </div>`;

    document.getElementById('gf-reset')?.addEventListener('click', () => {
      if (bodyEl) bodyEl.innerHTML = inputHtml();
    });

  } catch (e) {
    console.error(e);
    if (bodyEl) {
      bodyEl.innerHTML = inputHtml();
      const err = document.getElementById('gf-error');
      if (err) { err.textContent=e.message||t('계산 중 오류가 발생했습니다.'); err.style.display='block'; }
    }
  }
}

let lastInput = null;

async function tryAutoRun() {
  const bodyEl = document.getElementById('gf-body');
  if (!bodyEl) return;
  let input = captureMainFormInput();
  if (!input) {
    try {
      const stored = sessionStorage.getItem('honcheon_last_input');
      if (stored) input = JSON.parse(stored);
    } catch {}
  }
  if (input) {
    await runFortune(input);
  } else {
    bodyEl.innerHTML = inputHtml();
  }
}

// ─── 마운트 ───────────────────────────────────────────────────

function mount() {
  const results = document.getElementById('results');
  if (!results || document.getElementById('honcheon-fortune-tabs')) return;
  if (results.children.length === 0) return;

  const tabs       = createTabs();
  const panel      = createPanel();
  const membership = createMembershipPanel();

  results.insertBefore(tabs, results.firstChild);
  results.appendChild(panel);
  results.appendChild(membership);

  switchTab('fortune', results);

  tabs.addEventListener('click', e => {
    const btn = e.target.closest('[data-tab]');
    if (btn) switchTab(btn.dataset.tab, results);
  });

  tryAutoRun().catch(console.error);
}

// ─── 글로벌 이벤트 ───────────────────────────────────────────

document.addEventListener('click', e => {
  if (e.target.id==='gf-calc' || e.target.closest('#gf-calc')) {
    runFortune(null).catch(console.error);
    return;
  }
  const btn = e.target.closest('button');
  if (btn && btn.textContent.includes('명식 산출하기')) {
    // capture 단계에서 React보다 먼저 실행 — 폼이 아직 DOM에 존재함
    const captured = captureMainFormInput();
    if (captured) {
      try { sessionStorage.setItem('honcheon_last_input', JSON.stringify(captured)); } catch {}
    }
    setTimeout(() => tryAutoRun().catch(console.error), 800);
  }
}, true);

new MutationObserver(mount).observe(document.body, { childList:true, subtree:true });
mount();

document.addEventListener('honcheon:langchange', () => {
  if (lastInput) runFortune(lastInput).catch(console.error);
});
