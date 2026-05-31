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
  '紫微':{
    fate:'제왕성(帝王星)인 자미가 명궁에 자리하여 타고난 리더십과 권위를 지닌 운명입니다. 주변에서 자연스럽게 중심 역할을 맡게 되며, 귀인의 도움을 받아 높은 지위에 오를 가능성이 있습니다. 자존심이 강하고 완벽을 추구하는 성향이 있으니, 유연성을 기르면 더 큰 성취를 이룰 수 있습니다.',
    wealth:'자미성의 귀한 기운이 재물궁에 작용하여 귀인의 도움으로 재물이 모이는 구조입니다. 투자나 사업에서 좋은 파트너를 만날 가능성이 높으며, 명예와 재물이 함께 따르는 흐름입니다. 다만 지출도 크게 나갈 수 있으니 계획적인 자산 관리가 필요합니다.',
    love:'자미성의 고귀한 기운이 부처궁에 자리하여 존중받는 파트너십을 원하는 성향입니다. 상대방에게 높은 기준을 요구하는 경향이 있어 인연을 만나기까지 시간이 걸릴 수 있습니다. 한번 맺은 인연은 깊고 오래 지속되며, 사회적으로 인정받는 파트너를 만날 가능성이 높습니다.'
  },
  '天機':{
    fate:'천기성(天機星)이 명궁에 자리하여 영리하고 변화 많은 두뇌형 운명입니다. 분석력과 전략적 사고가 뛰어나 기획·연구·IT 분야에서 두각을 나타낼 수 있습니다. 변화를 즐기는 성향이 있어 한 곳에 오래 머물기보다 다양한 경험을 통해 성장하는 타입입니다.',
    wealth:'천기성의 지략이 재물궁에 작용하여 정보와 지식으로 재물을 창출하는 구조입니다. 트렌드를 빠르게 파악하고 기회를 포착하는 능력이 있어 변화하는 시장에서 유리합니다. 투자보다는 전문 기술이나 지식 기반의 수입 창출이 더 안정적입니다.',
    love:'천기성의 변화 기운이 부처궁에 자리하여 인연의 변화가 많을 수 있습니다. 지적으로 통하는 파트너에게 끌리며, 대화와 공통 관심사가 관계의 핵심입니다. 감정보다 이성이 앞서는 경향이 있으니, 상대방의 감정에 더 귀 기울이는 노력이 필요합니다.'
  },
  '太陽':{
    fate:'태양성(太陽星)이 명궁에 자리하여 밝고 넓게 빛나는 사회적 운명입니다. 외향적이고 활동적인 성격으로 많은 사람들에게 영향력을 미치며, 공직·교육·미디어 분야에서 특히 빛을 발합니다. 타인을 위해 헌신하는 마음이 크지만, 자신의 에너지 관리도 중요합니다.',
    wealth:'태양성의 빛나는 기운이 재물궁에 작용하여 사회 활동과 명성을 통해 재물이 따르는 구조입니다. 혼자보다는 팀이나 조직 안에서 더 큰 재물 기회가 생기며, 대외 활동이 활발할수록 수입도 늘어납니다. 명예와 재물이 함께 움직이는 흐름입니다.',
    love:'태양성의 밝은 기운이 부처궁에 자리하여 공개적이고 활발한 사랑을 추구합니다. 함께 사회 활동을 즐기고 서로를 자랑스러워하는 파트너십이 잘 맞습니다. 다만 너무 바쁜 일상으로 인해 둘만의 시간이 부족해질 수 있으니 의식적으로 시간을 만드는 것이 중요합니다.'
  },
  '武曲':{
    fate:'무곡성(武曲星)이 명궁에 자리하여 강직하고 재물복이 강한 운명입니다. 결단력과 실행력이 뛰어나며 금융·사업·군경 분야에서 두각을 나타낼 수 있습니다. 원칙을 중시하고 타협을 잘 하지 않는 성향이 있어, 유연성을 기르면 인간관계가 더욱 원만해집니다.',
    wealth:'무곡성의 강력한 재물 기운이 재백궁에 자리하여 재물복이 매우 강한 구조입니다. 금융·투자·사업 분야에서 탁월한 감각을 발휘하며, 꾸준한 노력으로 상당한 자산을 축적할 수 있습니다. 단기 투기보다는 장기적이고 계획적인 재테크가 더 효과적입니다.',
    love:'무곡성의 강직한 기운이 부처궁에 자리하여 의리와 신뢰를 최우선으로 여기는 사랑입니다. 한번 마음을 주면 변하지 않는 깊은 헌신을 보여주지만, 감정 표현이 서툴러 오해를 살 수 있습니다. 파트너에게 솔직하게 감정을 표현하는 연습이 관계를 더욱 깊게 만듭니다.'
  },
  '天同':{
    fate:'천동성(天同星)이 명궁에 자리하여 복덕이 있고 편안한 삶의 운명입니다. 온화하고 낙천적인 성격으로 주변 사람들에게 편안함을 주며, 복지·서비스·예술 분야에서 재능을 발휘합니다. 큰 야망보다는 안정적이고 여유로운 삶을 추구하는 경향이 있습니다.',
    wealth:'천동성의 복덕 기운이 재백궁에 작용하여 풍요롭고 안정적인 재물 흐름을 만듭니다. 급격한 부의 변화보다는 꾸준하고 안정적인 수입 구조가 잘 맞으며, 복지·서비스 관련 분야에서 재물 기회가 생깁니다. 무리한 투자보다 안정적인 저축과 분산 투자가 유리합니다.',
    love:'천동성의 온화한 기운이 부처궁에 자리하여 평화롭고 복 있는 인연을 만납니다. 서로 편안하고 즐거운 시간을 함께하는 파트너십이 잘 맞으며, 갈등보다는 조화를 추구합니다. 다만 너무 편안함만 추구하다 보면 관계가 정체될 수 있으니 새로운 자극도 필요합니다.'
  },
  '廉貞':{
    fate:'염정성(廉貞星)이 명궁에 자리하여 열정과 감정 기복이 있는 운명입니다. 강한 의지와 카리스마로 목표를 향해 돌진하는 성향이 있으며, 법률·정치·예술 분야에서 두각을 나타낼 수 있습니다. 감정 기복을 잘 다스리면 뛰어난 리더십을 발휘할 수 있습니다.',
    wealth:'염정성의 기복 있는 기운이 재백궁에 작용하여 재물의 오르내림이 있는 구조입니다. 위기 상황에서도 강한 회복력으로 다시 일어서는 능력이 탁월합니다. 감정적인 판단으로 인한 충동적 지출을 경계하고, 냉정한 재무 계획을 세우는 것이 중요합니다.',
    love:'염정성의 열정적인 기운이 부처궁에 자리하여 뜨겁고 강렬한 사랑을 추구합니다. 감정 기복이 크고 집착하는 경향이 있어 관계에서 갈등이 생길 수 있습니다. 상대방에게 충분한 공간을 주고 감정을 조절하는 노력이 장기적인 관계 유지의 핵심입니다.'
  },
  '天府':{
    fate:'천부성(天府星)이 명궁에 자리하여 안정적이고 풍요로운 저장의 운명입니다. 신중하고 보수적인 성향으로 착실하게 기반을 쌓아가며, 재무·부동산·행정 분야에서 두각을 나타냅니다. 주변 사람들에게 든든한 버팀목이 되는 역할을 자연스럽게 맡게 됩니다.',
    wealth:'천부성의 풍요로운 기운이 재백궁에 자리하여 안정적이고 지속적인 재물 축적이 가능합니다. 부동산·저축·장기 투자에서 특히 좋은 결과를 얻을 수 있으며, 재물이 새지 않고 잘 모이는 구조입니다. 보수적인 재테크 전략이 장기적으로 가장 효과적입니다.',
    love:'천부성의 든든한 기운이 부처궁에 자리하여 안정적이고 신뢰할 수 있는 인연을 만납니다. 서로에게 든든한 지지자가 되는 파트너십이 잘 맞으며, 결혼 후 더욱 안정적인 관계를 유지합니다. 처음에는 천천히 발전하지만 한번 맺어진 인연은 오래 지속됩니다.'
  },
  '太陰':{
    fate:'태음성(太陰星)이 명궁에 자리하여 감성적이고 섬세한 달의 운명입니다. 직관력과 공감 능력이 뛰어나며 예술·상담·부동산 분야에서 재능을 발휘합니다. 내면의 감성이 풍부하고 섬세하여 창의적인 작업에서 특히 빛을 발하는 타입입니다.',
    wealth:'태음성의 섬세한 기운이 재백궁에 작용하여 부동산·금융·예술 관련 재물 기회가 있습니다. 감각적인 재물 운용 능력이 있으며, 특히 부동산 투자에서 좋은 성과를 거둘 수 있습니다. 감정에 따른 충동적 소비를 주의하고 장기적인 관점에서 자산을 관리하세요.',
    love:'태음성의 감성적인 기운이 부처궁에 자리하여 섬세하고 깊은 감성적 교류를 원하는 사랑입니다. 상대방의 감정을 잘 이해하고 배려하는 능력이 뛰어나며, 감성적으로 통하는 파트너와 깊은 유대를 형성합니다. 상처받기 쉬운 섬세한 마음을 이해해주는 파트너가 가장 잘 맞습니다.'
  },
  '貪狼':{
    fate:'탐랑성(貪狼星)이 명궁에 자리하여 욕망과 매력이 넘치는 다재다능한 운명입니다. 다양한 분야에 재능이 있고 사교적이며, 예술·연예·영업 분야에서 두각을 나타냅니다. 초년에는 다소 방황할 수 있지만 중년 이후 크게 성장하는 대기만성형 운명입니다.',
    wealth:'탐랑성의 다재다능한 기운이 재백궁에 작용하여 다양한 경로로 재물이 들어오는 구조입니다. 부업·투자·사업 등 여러 수입원을 동시에 운용하는 것이 효과적이며, 인맥을 통한 재물 기회도 많습니다. 욕심이 과해지면 오히려 손실이 생길 수 있으니 절제가 필요합니다.',
    love:'탐랑성의 매력적인 기운이 부처궁에 자리하여 이성에게 매력적으로 보이는 인연 구조입니다. 로맨틱하고 열정적인 사랑을 즐기며, 다양한 인연을 경험할 수 있습니다. 진지한 관계를 원한다면 한 사람에게 집중하는 노력이 필요하며, 중년 이후 더욱 안정적인 인연이 찾아옵니다.'
  },
  '巨門':{
    fate:'거문성(巨門星)이 명궁에 자리하여 말과 정보에 강한 운명입니다. 언변이 뛰어나고 분석력이 탁월하여 법률·언론·교육·상담 분야에서 두각을 나타냅니다. 오해를 받기 쉬운 성향이 있으니 소통에 더욱 신경 쓰고 명확하게 의사를 전달하는 것이 중요합니다.',
    wealth:'거문성의 소통 기운이 재백궁에 작용하여 언변과 정보력으로 재물을 만드는 구조입니다. 컨설팅·강의·미디어 등 지식과 소통 능력을 활용한 분야에서 재물 기회가 많습니다. 계약이나 협상 시 문서를 꼼꼼히 확인하고 오해가 생기지 않도록 주의하세요.',
    love:'거문성의 소통 기운이 부처궁에 자리하여 솔직한 대화가 관계의 핵심인 사랑입니다. 말로 인한 오해나 갈등이 생기기 쉬우니 상대방의 말을 충분히 듣고 신중하게 표현하는 것이 중요합니다. 서로의 생각을 자유롭게 나눌 수 있는 지적 파트너와 가장 잘 맞습니다.'
  },
  '天相':{
    fate:'천상성(天相星)이 명궁에 자리하여 조화롭고 지원받는 따뜻한 운명입니다. 인화력이 뛰어나고 귀인의 도움을 잘 받으며, 행정·복지·조직 관리 분야에서 능력을 발휘합니다. 타인을 돕고 중재하는 역할을 잘 수행하며, 주변에서 믿고 의지하는 사람이 됩니다.',
    wealth:'천상성의 귀인 기운이 재백궁에 작용하여 귀인의 도움으로 재물 기회가 생기는 구조입니다. 혼자보다는 협력과 파트너십을 통해 더 큰 재물을 만들 수 있으며, 신뢰를 쌓는 것이 재물 운의 핵심입니다. 조직 내에서 인정받을수록 재물 기회도 함께 늘어납니다.',
    love:'천상성의 조화로운 기운이 부처궁에 자리하여 서로 지지하고 도와주는 따뜻한 인연입니다. 상대방을 배려하고 조화를 중시하는 성향으로 안정적인 파트너십을 형성합니다. 좋은 귀인 같은 파트너를 만날 가능성이 높으며, 결혼 후 서로 성장하는 관계가 됩니다.'
  },
  '天梁':{
    fate:'천량성(天梁星)이 명궁에 자리하여 지혜롭고 수호의 기운이 있는 운명입니다. 어려운 상황에서도 귀인의 도움이 있고 위기를 극복하는 능력이 뛰어납니다. 의료·법률·종교·상담 분야에서 두각을 나타내며, 나이가 들수록 더욱 빛을 발하는 운명입니다.',
    wealth:'천량성의 수호 기운이 재백궁에 작용하여 어려움 속에서도 귀인의 도움으로 재물을 지키는 구조입니다. 큰 손실 위기에서도 기적적으로 회복하는 능력이 있으며, 의료·법률·교육 관련 분야에서 안정적인 수입을 얻을 수 있습니다. 장기적이고 안정적인 재테크가 가장 잘 맞습니다.',
    love:'천량성의 성숙한 기운이 부처궁에 자리하여 연상이거나 성숙한 파트너와 인연이 깊습니다. 서로를 보호하고 가르쳐주는 관계에서 깊은 유대감을 형성합니다. 나이 차이가 있는 인연이나 멘토 같은 파트너를 만날 가능성이 높으며, 시간이 지날수록 더욱 깊어지는 관계입니다.'
  },
  '七殺':{
    fate:'칠살성(七殺星)이 명궁에 자리하여 강력하고 돌파력 있는 독립적 운명입니다. 강한 의지와 실행력으로 어떤 장애물도 뚫고 나가는 능력이 있으며, 군경·스포츠·사업 분야에서 두각을 나타냅니다. 독립적이고 자수성가형 운명으로 자신만의 길을 개척해 나갑니다.',
    wealth:'칠살성의 강력한 기운이 재백궁에 작용하여 도전적이고 적극적인 방식으로 재물을 획득합니다. 창업이나 독립 사업에서 더 큰 재물 기회가 생기며, 위험을 감수하는 투자에서도 성과를 낼 수 있습니다. 다만 과도한 도전은 손실로 이어질 수 있으니 리스크 관리가 중요합니다.',
    love:'칠살성의 독립적인 기운이 부처궁에 자리하여 강렬하고 독립적인 연애 스타일을 가집니다. 자신만의 공간과 자유를 중시하며, 상대방에게도 독립성을 존중해주는 파트너가 잘 맞습니다. 처음에는 강렬하게 시작하지만 서로의 독립성을 인정할 때 더욱 깊은 관계가 됩니다.'
  },
  '破軍':{
    fate:'파군성(破軍星)이 명궁에 자리하여 개척하고 변화를 만드는 선구자적 운명입니다. 기존의 틀을 깨고 새로운 것을 창조하는 능력이 뛰어나며, 혁신·스타트업·예술 분야에서 두각을 나타냅니다. 변화와 도전을 즐기는 성향으로 안정보다는 성장을 추구하는 삶을 살아갑니다.',
    wealth:'파군성의 혁신적인 기운이 재백궁에 작용하여 파괴와 재창조를 통해 새로운 재물 기회를 만듭니다. 기존 방식에서 벗어난 혁신적인 사업이나 투자에서 큰 성과를 거둘 수 있습니다. 재물의 오르내림이 있을 수 있으니 안전 자산을 일정 비율 유지하는 것이 중요합니다.',
    love:'파군성의 변화 기운이 부처궁에 자리하여 기존을 깨고 새로운 인연을 형성하는 사랑입니다. 기존 관계를 끝내고 새로운 시작을 하거나, 기존과 전혀 다른 유형의 파트너를 만날 수 있습니다. 변화를 두려워하지 않는 파트너와 함께할 때 가장 행복하며, 관계 안에서도 끊임없이 성장을 추구합니다.'
  },
};
const SIHAU_LABEL = { '化祿':'화록(번영)', '化權':'화권(권력)', '化科':'화과(명예)', '化忌':'화기(주의)' };

// ─── 자미두수 12궁 해석 데이터 ────────────────────────────────────
// 각 별의 궁별 핵심 해석 (무료: 명궁·재백궁·부처궁 / 유료: 12궁 전체)
const PALACE_LABELS = {
  ko: {
    '命宮':['명궁 (命宮)','기본 성격과 인생의 핵심 구조'],
    '兄弟':['형제궁 (兄弟宮)','형제자매·동료와의 인연'],
    '夫妻':['부처궁 (夫妻宮)','배우자·연인과의 인연'],
    '子女':['자녀궁 (子女宮)','자녀운과 창조적 에너지'],
    '財帛':['재백궁 (財帛宮)','재물·수입·금전 흐름'],
    '疾厄':['질액궁 (疾厄宮)','건강·체질·질병 경향'],
    '遷移':['천이궁 (遷移宮)','이동·해외·외부 활동'],
    '交友':['교우궁 (交友宮)','친구·인맥·사회적 관계'],
    '官祿':['관록궁 (官祿宮)','직업·사회적 성취·명예'],
    '田宅':['전택궁 (田宅宮)','부동산·주거·가정환경'],
    '福德':['복덕궁 (福德宮)','정신세계·복·내면의 행복'],
    '父母':['부모궁 (父母宮)','부모운·윗사람과의 관계'],
    '현재 나이':'현재 나이',
    '길신':'길신',
    '긍정적인 기운':'긍정적인 기운',
    '흉신':'흉신',
    '주의가 필요한 기운':'주의가 필요한 기운',
    '중성 신살':'중성 신살',
    '상황에 따라 달라지는 기운':'상황에 따라 달라지는 기운',
    '용신':'용신',
    '희신':'희신',
    '기신':'기신',
    '신강(身强)':'신강(身强)',
    '신약(身弱)':'신약(身弱)',
    '중화(中和)':'중화(中和)',
    '지난 대운':'지난 대운',
    '미래 대운':'미래 대운',
    '현재 대운':'현재 대운',
    '무료 해석':'무료 해석',
    '핵심 3궁':'핵심 3궁',
    '핵심 3요소':'핵심 3요소',
    '멤버십 전용':'멤버십 전용',
    '나머지 9궁':'나머지 9궁',
    '상세 해석 제공':'상세 해석 제공',
    '각 신살의 연애·직업·건강 영역별 심층 분석, AI 종합 해석을 멤버십에서 확인하세요.':'각 신살의 연애·직업·건강 영역별 심층 분석, AI 종합 해석을 멤버십에서 확인하세요.',
    '멤버십에서 상세 해석 확인':'멤버십에서 상세 해석 확인',
    '공궁':'공궁',
    '멤버십 전용 · 자미두수 12궁 완전 해석':'멤버십 전용 · 자미두수 12궁 완전 해석',
    '형제·자녀·질액·천이·교우·관록·전택·복덕·부모궁 + 사화 분석 + 대운·유년 연계 해석을 멤버십에서 확인하세요.':'형제·자녀·질액·천이·교우·관록·전택·복덕·부모궁 + 사화 분석 + 대운·유년 연계 해석을 멤버십에서 확인하세요.',
    '멤버십 전용 · 심층 점성술 완전 해석':'멤버십 전용 · 심층 점성술 완전 해석',
    '점성술 멤버십 배너 설명':'네이탈 차트 완전 해석 · 트랜짓 미래운 · 솔라리턴 · 심리 점성학 · 직업·재물·연애 심층 분석 · 궁합 · 아스트로카토그래피 등을 멤버십에서 확인하세요.',
    '멤버십 전용 · 심층 점성술 해석':'멤버십 전용 · 심층 점성술 해석',
    '띠 입니다':'띠 입니다',
  },
  en: {
    '命宮':['Life Palace (命宮)','Core personality and life structure'],
    '兄弟':['Siblings Palace (兄弟宮)','Siblings and colleagues'],
    '夫妻':['Spouse Palace (夫妻宮)','Spouse and romantic relationships'],
    '子女':['Children Palace (子女宮)','Children fortune and creative energy'],
    '財帛':['Wealth Palace (財帛宮)','Wealth, income and financial flow'],
    '疾厄':['Health Palace (疾厄宮)','Health, constitution and illness tendencies'],
    '遷移':['Travel Palace (遷移宮)','Travel, overseas and external activities'],
    '交友':['Friends Palace (交友宮)','Friends, networks and social relations'],
    '官祿':['Career Palace (官祿宮)','Career, social achievement and honor'],
    '田宅':['Home Palace (田宅宮)','Real estate, housing and home environment'],
    '福德':['Fortune Palace (福德宮)','Inner world, blessings and inner happiness'],
    '父母':['Parents Palace (父母宮)','Parents fortune and relationships with superiors'],
    '현재 나이':'Current Age',
    '길신':'Auspicious Stars',
    '긍정적인 기운':'Positive energy',
    '흉신':'Inauspicious Stars',
    '주의가 필요한 기운':'Energy requiring caution',
    '중성 신살':'Neutral Stars',
    '상황에 따라 달라지는 기운':'Energy that varies by situation',
    '용신':'Favorable Element',
    '희신':'Supporting Element',
    '기신':'Unfavorable Element',
    '신강(身强)':'Strong Day Master (身强)',
    '신약(身弱)':'Weak Day Master (身弱)',
    '중화(中和)':'Balanced Day Master (中和)',
    '지난 대운':'Past Fortune Cycle',
    '미래 대운':'Future Fortune Cycle',
    '현재 대운':'Current Fortune Cycle',
    '무료 해석':'Free Reading',
    '핵심 3궁':'Core 3 Palaces',
    '핵심 3요소':'Core 3 Elements',
    '멤버십 전용':'Membership Only',
    '나머지 9궁':'Remaining 9 Palaces',
    '상세 해석 제공':'Detailed Analysis Available',
    '각 신살의 연애·직업·건강 영역별 심층 분석, AI 종합 해석을 멤버십에서 확인하세요.':'In-depth analysis of each star impact on love, career & health. AI insights available for members.',
    '멤버십에서 상세 해석 확인':'View detailed reading in Membership',
    '공궁':'Empty Palace',
    '멤버십 전용 · 자미두수 12궁 완전 해석':'Membership Only · Full 12-Palace Zi Wei Reading',
    '형제·자녀·질액·천이·교우·관록·전택·복덕·부모궁 + 사화 분석 + 대운·유년 연계 해석을 멤버십에서 확인하세요.':'Siblings, Children, Health, Travel, Friends, Career, Home, Fortune, Parents palaces + Four Transformations + Major/Annual cycle readings available for members.',
    '멤버십 전용 · 심층 점성술 완전 해석':'Membership Only · Complete Astrology Reading',
    '점성술 멤버십 배너 설명':'Full Natal Chart · Transits · Solar Return · Psychological Astrology · Career, Wealth & Love in-depth · Synastry · Astrocartography and more — available for members.',
    "네이탈 차트 완전 해석":"Complete Natal Chart",
    "심리 점성학":"Psychological Astrology",
    "직업운 심층 해석":"Career Fortune In-Depth",
    "재물운 심층 해석":"Wealth Fortune In-Depth",
    "연애·결혼운 심층 해석":"Love & Marriage In-Depth",
    "트랜짓 미래운":"Transit Fortune",
    "솔라 리턴 (생일 1년 운세)":"Solar Return (Annual Fortune)",
    "프로그레션 (내면 성장)":"Progressions (Inner Growth)",
    "시나스트리 궁합":"Synastry Compatibility",
    "컴포지트 관계 차트":"Composite Chart",
    "아스트로카토그래피":"Astrocartography",
    "건강 점성학":"Medical Astrology",
    "카르마·영혼 해석":"Karma & Soul Reading",
    "역행 행성 해석":"Retrograde Planet Reading",
    "12하우스 전체 해석":"Full 12-House Reading",
    "행성 각도 심층 해석":"Aspects In-Depth",
    "태양·달·상승궁·10행성 전체 분석, 하우스 배치, 행성 각도 해석":"Sun, Moon, Ascendant & 10 planets, house placements & aspects",
    "내면 상처, 반복 패턴, 불안 원인, 자기방어 방식, 치유 방향":"Inner wounds, recurring patterns, anxiety roots & healing path",
    "10하우스·MC·6하우스 분석, 적합 직종, 커리어 전환 시기, 승진운":"10th/MC/6th house, suitable careers, career-change timing & promotion",
    "2·8하우스 분석, 수입 방식, 투자 성향, 배우자 재산, 상속·대출":"2nd/8th house, income style, investment, spouse wealth, inheritance & loans",
    "금성·화성·7하우스 분석, 배우자상, 결혼 시기, 이별 패턴":"Venus/Mars/7th house, ideal partner, marriage timing & breakup patterns",
    "현재 행성이 내 차트에 주는 영향, 올해 운세, 직업·연애·재물 변화 시기":"Current planetary influences, this year fortune & timing of major changes",
    "생일부터 다음 생일까지 핵심 주제, 직업·연애·재물·건강운":"Key themes from birthday to birthday: career, love, wealth & health",
    "진행 태양·달·금성으로 보는 심리적 변화와 인생 단계 흐름":"Psychological evolution & life stages via progressed Sun, Moon & Venus",
    "두 사람 차트 비교, 감정·대화·성적 끌림·결혼 안정성 분석":"Two-chart comparison: emotional, communication & attraction analysis",
    "두 사람이 만들어낸 관계 자체의 운명, 목적, 장기성 분석":"The relationship destiny, purpose & long-term potential",
    "지역별 운세, 이민·유학·사업·연애에 유리한 나라와 도시":"Regional fortune: best countries & cities for life, study, business & love",
    "취약 신체 부위, 건강 경향, 별자리별 주의 질환 분석":"Vulnerable body areas, health tendencies & sign-specific illness",
    "북쪽·남쪽 노드, 키론, 전생 패턴, 이번 생의 영혼 과제":"North/South nodes, Chiron, past-life patterns & soul mission",
    "출생차트 역행 행성의 내면화된 에너지와 특수 재능 분석":"Internalized energy & special talents of natal retrograde planets",
    "인생 12개 분야(자아·재물·형제·가정·연애·건강·결혼·변화·철학·직업·인맥·영성)":"All 12 life areas: self, wealth, siblings, home, love, health, marriage, change, philosophy, career, networks & spirit",
    "합·섹스타일·스퀘어·트라인·오포지션 전체 각도 분석":"Full analysis of conjunction, sextile, square, trine & opposition",
    '멤버십 전용 · 심층 점성술 해석':'Membership Only · In-Depth Astrology',
    '띠 입니다':'Zodiac Sign',
    '12운성':'Twelve Life Stages',
    'today.길(吉)':'today.Fortune',
    'today.대길(大吉)':'today.Great Fortune',
    'today.소흉(小凶)':'today.Minor Misfortune',
    'today.평(平)':'today.Neutral',
    'today.흉(凶)':'today.Misfortune',
    '※ 사주·자미두수·점성학 원국과 현재 날짜를 기반으로 자동 계산됩니다. 참고용으로 활용하세요.':'※ Automatically calculated based on Saju, Zi Wei Dou Shu, and astrology natal chart with the current date. Please use as a reference.',
    '■ 행운의 색':'■ Lucky Colors',
    '● 행운의 색':'● Lucky Colors',
    '✨ 자미두수 12궁 상세 해석':'✨ Zi Wei Dou Shu 12 Palaces Detailed Reading',
    '✨ 천궁도 행성·하우스·상(Aspect) 분석':'✨ Natal Chart Planet, House, and Aspect Analysis',
    '⭐대길 ✨길 🌀평 ⚡소흉 ⚠️흉 · ● 행운의 색':'⭐Great Fortune ✨Fortune 🌀Neutral ⚡Minor Misfortune ⚠️Misfortune · ● Lucky Colors',
    '감성·본능':'Emotion & Instinct',
    '감성과 영성이 필요한 분야에서 탁월합니다. 예술, 음악, 의료, 상담, 종교, 사진 분야가 잘 맞습니다. 깊은 공감 능력과 창의적 상상력이 강점입니다.':'You excel in fields requiring emotion and spirituality. Art, music, medical care, counseling, religion, and photography suit you well. Your strengths are deep empathy and creative imagination.',
    '감정과 인연의 에너지':'Energy of Emotion and Relationships',
    '감정적 교류에서 어려움이 있을 수 있습니다. 오해나 갈등이 생기기 쉬운 시기이므로 충동적인 감정 표현을 자제하고 신중하게 행동하는 것이 좋습니다. 혼자만의 시간을 통해 감정을 정리하세요.':'There may be difficulties in emotional exchanges. As misunderstandings or conflicts can easily arise, it is advisable to refrain from impulsive emotional expressions and act cautiously. Take time alone to organize your feelings.',
    '감정적으로 깊이 연결되는 것을 원합니다. 상대를 세심하게 배려하고 보호하려 하며, 가정적인 사랑을 꿈꿉니다. 상처받으면 껍질 속으로 들어가는 경향이 있습니다.':'You desire deep emotional connections. You carefully consider and protect others, dreaming of familial love. When hurt, you tend to retreat into your shell.',
    '강렬한 에너지로 추진력이 강하지만 사고·수술·구설에 주의가 필요합니다.':'You have strong drive with intense energy, but caution is needed regarding accidents, surgeries, and gossip.',
    '강한 감수성과 예술적 재능을 가지며 이성 관계가 활발합니다.':'You possess strong sensitivity and artistic talent, with active relationships with the opposite sex.',
    '강한 도전과 변화의 시기입니다. 외부 압박이나 경쟁이 심해질 수 있으나, 이를 극복하면 큰 성취를 이룰 수 있습니다. 건강 관리와 법적 문제에 각별히 주의하세요.':'This is a period of strong challenges and changes. External pressure or competition may intensify, but overcoming them can lead to great achievements. Pay special attention to health management and legal issues.',
    '강한 의지, 충동적 행동 주의':'Strong Will, Beware of Impulsive Actions',
    '강한 의지력, 극단적 기운':'Strong Willpower, Extreme Energy',
    '강한 의지와 리더십이 있지만 극단적 상황이 발생할 수 있습니다.':'You have strong will and leadership, but extreme situations may occur.',
    '건강 상태가 전반적으로 양호합니다. 규칙적인 생활과 적당한 운동으로 현재의 좋은 컨디션을 유지하세요. 스트레스 관리에 신경 쓰면 더욱 활기찬 생활이 가능합니다.':'Overall health condition is good. Maintain your current good condition with a regular lifestyle and moderate exercise. Managing stress will allow for a more energetic life.',
    '건강 운이 매우 좋지 않은 시기입니다. 만성 질환이 악화되거나 새로운 건강 문제가 발생할 수 있습니다. 즉시 전문의 상담을 받고, 과로와 스트레스를 철저히 피하세요. 몸의 신호에 귀를 기울이는 것이 중요합니다.':'This is a period of very poor health luck. Chronic illnesses may worsen or new health issues may arise. Consult a specialist immediately and strictly avoid overwork and stress. It is important to listen to your body\'s signals.',
    '건강 운이 평범한 편입니다. 특별한 이상은 없지만 과로나 스트레스에 취약할 수 있습니다. 충분한 수면과 균형 잡힌 식사로 기초 체력을 유지하는 것이 중요합니다.':'Health luck is average. There are no particular abnormalities, but you may be vulnerable to overwork or stress. Maintaining basic physical strength with sufficient sleep and a balanced diet is important.',
    '건강에 주의가 필요한 시기입니다. 피로 누적이나 소화기 계통의 문제가 생길 수 있습니다. 무리한 활동을 자제하고 정기적인 건강 검진을 받는 것이 좋습니다. 충분한 휴식이 필수입니다.':'This is a period requiring health caution. Fatigue accumulation or digestive system problems may occur. Avoid excessive activities and get regular health check-ups. Adequate rest is essential.',
    '게자리는 달이 지배하는 물의 별자리입니다. 감수성이 풍부하고 직관력이 뛰어나며, 가족과 가정을 무엇보다 소중히 여깁니다. 타인의 감정에 민감하게 반응하는 공감 능력이 탁월합니다. 감정 기복이 있을 수 있으며, 과거에 집착하는 경향을 의식적으로 조절하면 더 성장할 수 있습니다.':'Cancer is a water sign ruled by the Moon. It is rich in sensitivity and has excellent intuition, valuing family and home above all. You have outstanding empathy, responding sensitively to others\' emotions. Emotional fluctuations may occur, and consciously controlling tendencies to cling to the past can lead to further growth.',
    '계산 중 오류가 발생했습니다.':'An error occurred during calculation.',
    '계산 중… 잠시만 기다려주세요.':'Calculating… Please wait a moment.',
    '관재구설과 소송에서 보호받으며 관운이 좋아집니다.':'You will be protected from disputes and lawsuits, and your official luck improves.',
    '균형 잡힌 아름다운 관계를 추구합니다. 로맨틱하고 우아한 사랑을 즐기며, 파트너와의 조화를 중시합니다. 갈등을 피하려는 성향이 있어 솔직한 표현이 필요합니다.':'You seek balanced and beautiful relationships. You enjoy romantic and elegant love, valuing harmony with your partner. You tend to avoid conflicts, so honest expression is necessary.',
    '균형과 조화가 필요한 분야에서 능력을 발휘합니다. 법률, 외교, 디자인, 패션, 상담, 중재 분야가 잘 맞습니다. 공정한 판단력과 미적 감각이 뛰어납니다.':'You demonstrate ability in fields requiring balance and harmony. Law, diplomacy, design, fashion, counseling, and mediation suit you well. You have excellent fair judgment and aesthetic sense.',
    '금 기운이 과잉되어 지나친 냉정함이나 갈등을 일으킬 수 있습니다. 날카로운 언행과 무리한 경쟁을 자제하세요. 금속 소품이나 흰색 계열을 과도하게 사용하면 긴장감이 높아질 수 있습니다.':'Excessive Metal energy may cause excessive coldness or conflicts. Refrain from sharp speech and excessive competition. Overuse of metal accessories or white tones can increase tension.',
    '금속의 날카로운 기운이 결단력과 재물운을 강화합니다. 서쪽 방향, 흰색·금색 계열이 길하며 계획적인 재테크와 자기 계발이 운을 높입니다. 원칙을 지키는 행동이 신뢰를 쌓습니다.':'The sharp energy of Metal strengthens decisiveness and wealth luck. The west direction and white/gold tones are fortunate, and planned financial management and self-development enhance your fortune. Acting with principles builds trust.',
    '기본 운세':'Basic Fortune',
    '기질의 균형이 무난한 편입니다. 장점과 단점이 공존하며, 환경에 따라 성격 표현이 달라질 수 있습니다. 자신의 강점을 의식적으로 계발하면 더 큰 잠재력을 발휘할 수 있습니다.':'Your temperament balance is moderate. Strengths and weaknesses coexist, and personality expression may vary depending on the environment. Consciously developing your strengths can unleash greater potential.',
    '기질적으로 다소 불균형한 면이 있어 감정 기복이나 결정 장애를 경험할 수 있습니다. 자기 이해를 높이고 약점을 보완하는 노력이 필요합니다. 내면의 안정을 찾는 것이 중요한 과제입니다.':'There is some imbalance in temperament, which may cause emotional fluctuations or decision-making difficulties. Efforts to increase self-understanding and compensate for weaknesses are necessary. Finding inner stability is an important task.',
    '깊고 강렬한 사랑을 원합니다. 상대의 영혼까지 알고 싶어하며, 완전한 신뢰와 헌신을 요구합니다. 질투심이 강할 수 있으나, 그만큼 깊이 사랑합니다.':'You desire deep and intense love. You want to know your partner\'s soul and demand complete trust and devotion. You may be very jealous, but you love deeply as well.',
    '꿈같은 로맨스를 꿈꿉니다. 상대를 이상화하는 경향이 있으며, 깊은 영혼의 교감을 원합니다. 감정적으로 민감하고 공감 능력이 뛰어나 상대의 마음을 잘 읽습니다.':'You dream of a fairy-tale romance. You tend to idealize your partner and seek deep soul connection. You are emotionally sensitive and empathetic, able to read your partner\'s heart well.',
    '나무 기운이 과잉되어 균형을 흐트러뜨립니다. 지나친 고집이나 무리한 확장을 조심하세요. 동쪽 방향과 초록색 계열을 과도하게 사용하면 에너지 소모가 커질 수 있으니 절제가 필요합니다.':'Excessive Wood energy disrupts balance. Beware of stubbornness or excessive expansion. Overuse of east direction and green tones may cause energy depletion, so moderation is needed.',
    '나무의 기운이 부족한 명식에 생기를 불어넣습니다. 성장·창의·도전의 에너지를 보충해 주므로 동쪽 방향, 초록색 계열, 봄철 활동이 길합니다. 새로운 시작이나 사업 확장에 유리한 시기를 잘 활용하세요.':'It revitalizes charts lacking Wood energy. It supplements growth, creativity, and challenge energy, so the east direction, green tones, and spring activities are fortunate. Make good use of favorable times for new beginnings or business expansion.',
    '남':'Male',
    '남성':'Male',
    '년주':'Year Pillar',
    '다른 생년월일로 다시 보기':'View Again with Different Birthdate',
    '달 별자리':'Moon Sign',
    '당신의 띠는':'Your Zodiac Sign is',
    '대운 (大運)':'Major Fortune Cycle (大運)',
    '대지의 안정된 기운이 중심을 잡아줍니다. 중앙·황토색 계열이 길하며 부동산·저축·건강 관리에 집중하면 운이 열립니다. 신뢰와 성실함으로 주변의 지지를 얻는 것이 중요합니다.':'The stable energy of the earth grounds you. The center and earth-tone colors are fortunate, and focusing on real estate, savings, and health management opens your luck. Gaining support from others through trust and sincerity is important.',
    '대화와 지적 교감을 중시합니다. 다양한 사람에게 관심을 보이지만, 진정한 소울메이트를 찾습니다. 자유로운 관계를 선호하며 구속을 싫어합니다.':'You value conversation and intellectual connection. You show interest in various people but seek a true soulmate. You prefer free relationships and dislike constraints.',
    '독특하고 자유로운 사랑을 원합니다. 친구 같은 파트너를 선호하며, 지적 교감과 공통된 가치관을 중시합니다. 감정적 친밀감보다 정신적 연결을 더 중요하게 여깁니다.':'You want unique and free love. You prefer a partner like a friend and value intellectual connection and shared values. You prioritize mental connection over emotional intimacy.',
    '독특한 인상':'Unique Impression',
    '돌봄과 감성이 필요한 분야에서 탁월합니다. 의료, 사회복지, 교육, 요식업, 부동산, 상담 분야가 잘 맞습니다. 사람들의 감정을 이해하고 보살피는 능력이 뛰어납니다.':'You excel in fields requiring care and sensitivity. Medical, social welfare, education, food service, real estate, and counseling suit you well. You have excellent ability to understand and care for people\'s emotions.',
    '로맨틱하고 극적인 사랑을 즐깁니다. 상대에게 최고의 것을 선사하고 싶어하며, 충성스럽고 열정적인 파트너입니다. 인정받지 못하면 상처를 받습니다.':'You enjoy romantic and dramatic love. You want to give the best to your partner and are a loyal and passionate partner. You get hurt if not recognized.',
    '리더십과 추진력이 필요한 분야에서 두각을 나타냅니다. 스포츠, 군경, 기업가, 개척 사업, 응급 의료 분야가 잘 맞습니다. 독립적으로 일하거나 팀을 이끄는 역할이 적합합니다.':'You stand out in fields requiring leadership and drive. Sports, military/police, entrepreneurship, pioneering business, and emergency medical fields suit you well. Working independently or leading a team is appropriate.',
    '말년운 (50세~)':'Later Years Fortune (Age 50~)',
    '멤버십 상세 분석':'Membership Detailed Analysis',
    '멤버십 전용 상세 분석':'Membership Exclusive Detailed Analysis',
    '명예와 사회적 지위가 높아지는 시기입니다. 조직 내 승진이나 인정을 받을 기회가 생기며, 책임감과 원칙을 중시하게 됩니다. 공직·전문직에서 두각을 나타낼 수 있습니다.':'This is a period when honor and social status rise. Opportunities for promotion or recognition within organizations arise, and you emphasize responsibility and principles. You may excel in public office or professional fields.',
    '몸과 마음의 균형 에너지':'Balanced energy of body and mind',
    '몸과 마음의 에너지가 매우 충만한 시기입니다. 체력이 넘치고 면역력도 강해 활발한 활동이 가능합니다. 이 시기에 건강한 습관을 정착시키면 오랫동안 좋은 컨디션을 유지할 수 있습니다.':'This is a period when the energy of body and mind is very abundant. Physical strength overflows and immunity is strong, allowing for active activities. Establishing healthy habits during this time can help maintain good condition for a long time.',
    '무료 운세':'Free Reading',
    '물고기자리는 해왕성과 목성이 지배하는 물의 별자리입니다. 예민한 감수성과 깊은 공감 능력, 영적 직관이 뛰어납니다. 예술적 재능과 상상력이 풍부하며, 타인의 고통에 민감하게 반응합니다. 현실과 이상 사이에서 혼란을 겪을 수 있으므로, 경계를 설정하고 자신을 보호하는 것이 중요합니다.':'Pisces is a water sign ruled by Neptune and Jupiter. It has sensitive sensibility, deep empathy, and excellent spiritual intuition. It is rich in artistic talent and imagination, and reacts sensitively to others\' pain. Since confusion may arise between reality and ideals, it is important to set boundaries and protect yourself.',
    '물병자리는 천왕성과 토성이 지배하는 바람의 별자리입니다. 독창적이고 혁신적인 사고로 미래를 내다보는 능력이 있습니다. 인류애와 평등을 중시하며, 독립적이고 자유로운 정신을 가지고 있습니다. 감정적 거리감이 있을 수 있으므로, 친밀한 관계에서 따뜻함을 표현하는 연습이 도움이 됩니다.':'Aquarius is an air sign ruled by Uranus and Saturn. It has the ability to foresee the future with original and innovative thinking. It values humanitarianism and equality, and has an independent and free spirit. There may be emotional distance, so practicing expressing warmth in intimate relationships is helpful.',
    '물의 지혜로운 기운이 지식과 재물의 흐름을 원활하게 합니다. 북쪽 방향, 검정·파란색 계열이 길하며 학업·연구·금융 분야에서 두각을 나타낼 수 있습니다. 유연한 사고로 기회를 포착하세요.':'The wise energy of water facilitates the flow of knowledge and wealth. The north direction and black/blue colors are auspicious, and you can excel in academics, research, and finance. Capture opportunities with flexible thinking.',
    '변화와 혁신을 추구하는 시기입니다. 창의적 아이디어가 넘치고 기존 틀을 벗어나려는 욕구가 강해집니다. 직업 변화나 이직을 고려할 수 있으며, 언행에 주의가 필요합니다.':'This is a period of pursuing change and innovation. Creative ideas overflow and the desire to break out of existing frameworks intensifies. You may consider job changes or career moves, and need to be cautious with your words and actions.',
    '부귀와 안락의 별, 재물과 명예':'Star of wealth and comfort, fortune and honor',
    '분석과 정밀함이 필요한 분야에서 두각을 나타냅니다. 의료, 회계, 연구, 편집, 영양, 품질관리 분야가 잘 맞습니다. 세심한 주의력과 완벽을 추구하는 성향이 강점입니다.':'You excel in fields requiring analysis and precision. Medical, accounting, research, editing, nutrition, and quality control fields suit you well. Careful attention and a tendency to pursue perfection are your strengths.',
    '불 기운이 과잉되어 충동적 행동이나 과열을 유발할 수 있습니다. 감정 기복과 급한 결정을 경계하세요. 빨간색 계열과 남쪽 방향을 과도하게 접하면 스트레스가 가중될 수 있습니다.':'Excess fire energy can cause impulsive behavior or overheating. Beware of emotional fluctuations and hasty decisions. Excessive exposure to red colors and the south direction can increase stress.',
    '불의 기운으로 열정과 표현력을 강화합니다. 남쪽 방향, 빨간색 계열이 행운을 부르며 인간관계와 명예 운이 상승합니다. 적극적인 자기 표현과 사교 활동이 운을 여는 열쇠입니다.':'Fire energy enhances passion and expressiveness. The south direction and red colors bring fortune, improving relationships and honor luck. Active self-expression and social activities are the keys to opening luck.',
    '사수자리는 목성이 지배하는 불의 별자리입니다. 자유를 사랑하고 철학적 사고와 모험 정신이 넘칩니다. 낙관적이고 유머 감각이 뛰어나며, 다양한 문화와 지식을 탐구하는 것을 즐깁니다. 무책임하거나 직설적인 말로 상처를 줄 수 있으므로, 세심한 배려가 필요합니다.':'Sagittarius is a fire sign ruled by Jupiter. It loves freedom and is full of philosophical thinking and adventurous spirit. Optimistic with a great sense of humor, it enjoys exploring diverse cultures and knowledge. Careful consideration is needed as irresponsible or blunt words can hurt others.',
    '사자자리는 태양이 지배하는 불의 별자리입니다. 타고난 리더십과 카리스마로 자연스럽게 주목받습니다. 창의적이고 표현력이 풍부하며, 무대 위에서 빛나는 존재감을 발휘합니다. 자존심이 강하고 인정받고 싶은 욕구가 크므로, 겸손함을 갖추면 더욱 빛납니다.':'Leo is a fire sign ruled by the Sun. With innate leadership and charisma, it naturally attracts attention. Creative and expressive, it shines on stage with a strong presence. Pride is strong and the desire for recognition is great, so humility will make it shine even more.',
    '사주 · 자미두수 · 점성학 세 시스템 통합 분석 (회원가입 불필요)':'Integrated analysis of Saju, Jaemidusu, and Astrology three systems (No Membership required)',
    '사주 원국 기반':'Based on Saju Original Chart',
    '사주팔자 · 자미두수 · 천궁도 전체 결과를PDF로 정리하여 제공합니다.':'Provides the entire results of Saju Fate, Jaemidusu, and Western Horoscope summarized in a PDF.',
    '사회적 활동과 성취 흐름':'Flow of social activities and achievements',
    '사회적 활동과 직업 운이 매우 강한 시기입니다. 능력을 인정받고 승진이나 중요한 기회가 찾아올 수 있습니다. 새로운 프로젝트나 도전에 적극적으로 나서면 좋은 결과를 얻을 수 있습니다.':'This is a period with very strong social activity and career luck. Your abilities will be recognized, and promotions or important opportunities may come. Actively engaging in new projects or challenges can yield good results.',
    '상승궁 (ASC)':'Ascendant (ASC)',
    '생년월일을 입력해주세요.':'Please enter your date of birth.',
    '생애 에너지 흐름':'Life energy flow',
    '서양 천궁도 분석':'Western Horoscope Analysis',
    '성격과 기질이 안정적으로 발달해 있어 사회적 관계에서 신뢰를 쌓기 쉽습니다. 자신의 감정을 잘 조절하며, 목표를 향해 꾸준히 나아가는 힘이 있습니다. 다양한 상황에서 유연하게 대처하는 능력이 돋보입니다.':'Personality and temperament are stably developed, making it easy to build trust in social relationships. You control your emotions well and have the strength to steadily move toward your goals. Your ability to adapt flexibly in various situations stands out.',
    '소통과 정보를 다루는 분야에서 빛납니다. 언론, 교육, IT, 마케팅, 작가, 통역 분야가 잘 맞습니다. 다양한 분야를 넘나드는 멀티태스킹 능력이 강점입니다.':'You shine in fields dealing with communication and information. Journalism, education, IT, marketing, writing, and interpreting suit you well. Your multitasking ability across various fields is a strength.',
    '수 기운이 과잉되어 우유부단함이나 과도한 걱정을 유발할 수 있습니다. 지나친 분석과 소극적 태도를 경계하세요. 검정·파란색 계열과 북쪽 방향을 과도하게 접하면 에너지가 침체될 수 있습니다.':'Excess water energy can cause indecisiveness or excessive worry. Beware of over-analysis and passive attitudes. Excessive exposure to black/blue colors and the north direction can cause energy stagnation.',
    '시주':'Hour Pillar',
    '신강':'Strong Day Master',
    '신비롭고 예민한 기운이 강하게 작동할 수 있음':'Mysterious and sensitive energy may operate strongly',
    '신약':'Weak Day Master',
    '심층 분석과 변화를 다루는 분야에서 탁월합니다. 심리학, 의학, 금융, 탐정, 연구, 위기관리 분야가 잘 맞습니다. 숨겨진 진실을 파헤치는 능력과 강한 집중력이 강점입니다.':'You excel in fields involving deep analysis and change. Psychology, medicine, finance, detective work, research, and crisis management suit you well. Your ability to uncover hidden truths and strong concentration are strengths.',
    '쌍둥이자리는 수성이 지배하는 바람의 별자리입니다. 지적 호기심이 넘치고 다재다능하며, 소통과 정보 교환에 탁월합니다. 두 가지 상반된 성향이 공존하여 상황에 따라 다른 모습을 보이기도 합니다. 언어 능력과 적응력이 뛰어나 다양한 분야에서 활약할 수 있습니다.':'Gemini is an air sign ruled by Mercury. It is full of intellectual curiosity and versatility, excelling in communication and information exchange. Two contrasting tendencies coexist, showing different aspects depending on the situation. Excellent language skills and adaptability allow success in various fields.',
    '안정적이고 실용적인 분야에서 능력을 발휘합니다. 금융, 부동산, 요리, 예술, 농업, 건축 분야가 잘 맞습니다. 장기적인 프로젝트를 꾸준히 완성하는 능력이 탁월합니다.':'You demonstrate abilities in stable and practical fields. Finance, real estate, cooking, art, agriculture, and architecture suit you well. You excel at steadily completing long-term projects.',
    '안정적인 재물 축적과 내실을 다지는 시기입니다. 꾸준한 노력이 결실을 맺고 저축과 부동산 등 안정적 자산 관리에 유리합니다. 성실하게 임하면 좋은 결과를 얻습니다.':'This is a period for stable wealth accumulation and strengthening your foundation. Consistent effort bears fruit, favoring stable asset management such as savings and real estate. Diligence leads to good results.',
    '애정 운이 좋은 편으로, 관계에서 따뜻한 교류가 이루어집니다. 진심 어린 소통이 관계를 더욱 돈독하게 만들어 줍니다. 솔직한 감정 표현이 인연을 발전시키는 열쇠가 됩니다.':'Love luck is favorable, with warm exchanges in relationships. Sincere communication strengthens bonds. Honest emotional expression is the key to developing connections.',
    '애정 운이 평범한 편입니다. 특별한 변화보다는 현재 관계를 안정적으로 유지하는 것이 중요합니다. 상대방의 입장을 이해하려는 노력이 관계의 질을 높여줍니다.':'Love luck is neutral. Maintaining stability in current relationships is more important than special changes. Efforts to understand the partner’s perspective improve relationship quality.',
    '양자리는 황도 12궁의 첫 번째 별자리로, 화성이 지배하는 불의 별자리입니다. 개척 정신과 추진력이 강하며, 새로운 일을 시작하는 데 탁월한 능력을 발휘합니다. 경쟁심이 강하고 즉흥적인 면이 있어 충동적 결정에 주의가 필요합니다. 리더십이 뛰어나고 용기 있는 행동으로 주변을 이끄는 타입입니다.':'Aries is the first sign of the zodiac, a fire sign ruled by Mars. It has a pioneering spirit and strong drive, excelling at starting new ventures. Strong competitiveness and impulsiveness require caution with rash decisions. You are a type who leads others with excellent leadership and courageous actions.',
    '여':'Female',
    '여성':'Female',
    '열정과 감정의 기운, 예술적 재능':'Energy of passion and emotion, artistic talent',
    '열정적이고 직접적으로 감정을 표현합니다. 첫눈에 반하는 경우가 많고, 상대를 적극적으로 리드합니다. 권태기가 오면 새로운 자극이 필요합니다.':'You express emotions passionately and directly. Often falling in love at first sight, you actively lead your partner. When boredom arises, new stimulation is needed.',
    '염소자리는 토성이 지배하는 흙의 별자리입니다. 책임감이 강하고 목표를 향한 끈기와 실용적 판단력이 탁월합니다. 사회적 성공과 명예를 중시하며, 체계적이고 성실하게 기반을 쌓아갑니다. 감정 표현이 서툴고 지나치게 일에 집중하는 경향이 있어, 휴식과 감정 교류도 중요합니다.':'Capricorn is an earth sign ruled by Saturn. It has strong responsibility, perseverance toward goals, and excellent practical judgment. Valuing social success and honor, it builds foundations systematically and diligently. Emotional expression is awkward, and there is a tendency to focus excessively on work, so rest and emotional exchange are also important.',
    '오늘':'Today',
    '오늘의 운세':'Today\'s Fortune',
    '오행 분포':'Five Elements Distribution',
    '오행 불균형으로 인해 기질적 갈등이 심할 수 있습니다. 충동적 행동이나 극단적 감정 반응에 주의가 필요합니다. 명상, 규칙적인 생활, 신뢰할 수 있는 조언자의 도움을 받는 것이 도움이 됩니다.':'Due to Five Elements imbalance, temperament conflicts may be severe. Caution is needed for impulsive actions or extreme emotional reactions. Meditation, regular lifestyle, and help from a trusted advisor are beneficial.',
    '올바른 연도를 입력해주세요.':'Please enter a valid year.',
    '완벽한 파트너를 찾기 위해 신중하게 관계를 시작합니다. 실용적이고 헌신적인 사랑을 하며, 세심한 배려로 상대를 돌봅니다. 지나친 비판은 관계를 어렵게 할 수 있습니다.':'You start relationships carefully to find the perfect partner. You love practically and devotedly, caring for your partner with meticulous consideration. Excessive criticism can make relationships difficult.',
    '용신 분석':'Useful God Analysis',
    '용신을 보조하는 금 기운입니다. 정확하고 체계적인 행동이 운을 뒷받침합니다. 금속 소품이나 흰색 계열 인테리어가 이 기운을 강화하며, 계획적인 생활 패턴이 도움이 됩니다.':'This is metal energy supporting the Useful God. Precise and systematic actions support your fortune. Metal accessories or white-toned interiors enhance this energy, and a planned lifestyle is helpful.',
    '용신을 보조하는 나무 기운입니다. 창의적 활동과 인간관계 확장이 간접적으로 운을 돕습니다. 식물 키우기, 등산, 새벽 산책 등 목(木) 기운을 접하는 생활 습관이 에너지를 보충해 줍니다.':'This is wood energy supporting the Useful God. Creative activities and expanding relationships indirectly aid fortune. Habits involving wood energy like growing plants, hiking, or early morning walks replenish energy.',
    '용신을 보조하는 불 기운입니다. 밝고 활기찬 환경이 운의 흐름을 원활하게 합니다. 조명이 밝은 공간에서 활동하거나 따뜻한 색상의 소품을 활용하면 보조 에너지가 강화됩니다.':'This is fire energy supporting the Useful God. Bright and lively environments smooth the flow of fortune. Activities in well-lit spaces or using warm-colored accessories strengthen supportive energy.',
    '용신을 보조하는 수 기운입니다. 지식 축적과 내면 성찰이 운을 간접적으로 강화합니다. 독서, 명상, 수영 등 수(水) 기운과 연관된 활동이 보조 에너지를 활성화합니다.':'This is water energy supporting the Useful God. Accumulating knowledge and inner reflection indirectly strengthen fortune. Activities related to water energy like reading, meditation, and swimming activate supportive energy.',
    '용신을 보조하는 토 기운입니다. 안정적인 생활 기반이 전체 운을 뒷받침합니다. 규칙적인 식사와 수면, 꾸준한 저축 습관이 이 기운을 활성화하여 운의 토대를 다집니다.':'This is earth energy supporting the Useful God. A stable living foundation supports overall fortune. Regular meals and sleep, along with steady saving habits, activate this energy and build the base of fortune.',
    '운세 지수':'Fortune Index',
    '운세를 계산하는 중입니다…':'Calculating fortune...',
    '월주':'Month Pillar',
    '의료·치유 분야에 재능이 있으며 건강 회복력이 강합니다.':'You have talent in medical and healing fields and strong health recovery ability.',
    '의술과 건강의 별, 치료 능력':'Star of medical skills and health, healing ability',
    '이 대운은 천간의 기운이 일간에 영향을 미치는 시기입니다. 해당 십성의 특성을 이해하고 흐름에 맞게 대응하는 것이 중요합니다.':'This Major Fortune Cycle is a period when the energy of the Heavenly Stem affects the Day Master. It is important to understand the characteristics of the relevant Ten Gods and respond according to the flow.',
    '이성 매력, 예술적 감각':'Opposite-sex attraction, artistic sensibility',
    '이성에게 매력적으로 보이며 예술·연예 분야에 재능이 있습니다.':'You appear attractive to the opposite sex and have talents in the arts and entertainment fields.',
    '인연의 기운이 매우 강하게 흐르고 있습니다. 새로운 만남이나 기존 관계의 깊어짐이 기대되는 시기입니다. 감정 표현이 자연스럽게 이루어지며, 상대방의 마음을 얻기에 유리한 에너지가 충만합니다.':'The energy of relationships is flowing very strongly. It is a time when new encounters or deepening of existing relationships can be expected. Emotional expression happens naturally, and you are filled with favorable energy to win the other person\'s heart.',
    '인연의 흐름이 막혀 있는 시기입니다. 관계에서 상처를 받거나 이별의 아픔을 경험할 수 있습니다. 자신을 먼저 돌보고 내면의 상처를 치유하는 데 집중하는 것이 현명합니다.':'This is a period when the flow of relationships is blocked. You may experience hurt or the pain of separation in relationships. It is wise to take care of yourself first and focus on healing your inner wounds.',
    '일간 강약':'Day Master Strength',
    '일간 강약과 오행 균형':'Day Master Strength and Five Elements Balance',
    '일생 최고의 귀인을 만나는 기운으로 위기 시 강력한 도움을 받습니다.':'The energy of meeting the greatest benefactor in your life, providing strong help in times of crisis.',
    '일주':'Day Pillar',
    '일진 분석':'Daily Luck Analysis',
    '자립심과 독립 의지가 강해지는 시기입니다. 새로운 시작과 자기 계발에 유리하며, 경쟁 속에서 실력을 키울 수 있습니다. 다만 고집이 세질 수 있으니 협력을 잊지 마세요.':'A period when self-reliance and independence strengthen. Favorable for new beginnings and self-development, allowing you to improve your skills amid competition. However, be careful of becoming stubborn and don\'t forget cooperation.',
    '자미두수':'Purple Star Astrology',
    '자유롭고 모험적인 사랑을 즐깁니다. 함께 성장하고 세상을 탐험할 파트너를 원합니다. 구속받는 것을 싫어하며, 정신적 교감을 매우 중시합니다.':'You enjoy free and adventurous love. You want a partner to grow with and explore the world. You dislike being restricted and highly value spiritual connection.',
    '자유와 확장이 필요한 분야에서 성공합니다. 교육, 여행, 출판, 법률, 철학, 해외 비즈니스 분야가 잘 맞습니다. 넓은 시야와 낙관적 에너지로 새로운 기회를 만들어냅니다.':'You succeed in fields requiring freedom and expansion. Education, travel, publishing, law, philosophy, and overseas business suit you well. With a broad perspective and optimistic energy, you create new opportunities.',
    '재물 손실이나 예상치 못한 지출이 발생할 수 있는 시기입니다. 충동적인 소비나 투기적 투자를 자제하고 보수적인 재정 관리가 필요합니다. 보증이나 대출에 특히 주의하세요.':'This is a period when financial losses or unexpected expenses may occur. Avoid impulsive spending or speculative investments and practice conservative financial management. Be especially cautious with guarantees or loans.',
    '재물 운이 매우 강하게 흐르고 있습니다. 예상치 못한 수입이나 투자 성과가 기대되는 시기입니다. 재물이 자연스럽게 모이는 흐름이므로 장기적인 재테크 계획을 세우기에 좋은 때입니다.':'Financial luck is flowing very strongly. It is a time when unexpected income or investment returns are expected. Since wealth naturally accumulates, it is a good time to make long-term financial plans.',
    '재물 운이 매우 불안정한 시기입니다. 큰 재정적 손실이나 사기 피해의 위험이 있으므로 중요한 금전 거래는 반드시 전문가의 조언을 구하세요. 현금 보유를 늘리고 리스크를 최소화하는 것이 현명합니다.':'Financial luck is very unstable. There is a risk of significant financial loss or fraud, so always seek expert advice for important monetary transactions. It is wise to increase cash holdings and minimize risks.',
    '재물 운이 좋은 편입니다. 수입이 안정적으로 유지되며 절약과 투자의 균형을 잘 맞출 수 있습니다. 소소한 재물 기회들이 꾸준히 찾아오는 시기입니다.':'Financial luck is good. Income remains stable, and you can balance saving and investing well. Small financial opportunities come steadily.',
    '재물 운이 평범한 편입니다. 큰 이익보다는 현재 재정 상태를 안정적으로 유지하는 것이 중요합니다. 불필요한 지출을 줄이고 저축 습관을 기르는 것이 도움이 됩니다.':'Financial luck is average. Maintaining stable current financial status is more important than big profits. Reducing unnecessary expenses and cultivating saving habits are helpful.',
    '재물과 기회의 흐름':'Flow of Wealth and Opportunities',
    '재물복과 명예운이 좋아 안정된 삶을 누리는 기운입니다.':'The energy of good wealth fortune and honor fortune, allowing you to enjoy a stable life.',
    '전갈자리는 명왕성과 화성이 지배하는 물의 별자리입니다. 강렬한 의지와 깊이 있는 통찰력을 가지고 있습니다. 비밀을 잘 지키고 심층적인 진실을 탐구하는 능력이 탁월합니다. 집착과 질투심이 강할 수 있으므로, 신뢰를 바탕으로 한 깊은 관계를 형성하는 것이 중요합니다.':'Scorpio is a water sign ruled by Pluto and Mars. It has intense willpower and deep insight. Excellent at keeping secrets and exploring profound truths. Since obsession and jealousy can be strong, it is important to build deep relationships based on trust.',
    '점성학':'Astrology',
    '중년운 (35~50세)':'Midlife Fortune (35~50 years old)',
    '직관력과 영적 감수성이 뛰어나지만 신경과민·불안 경향에 주의가 필요합니다.':'Intuition and spiritual sensitivity are excellent, but caution is needed for nervousness and anxiety tendencies.',
    '직업 운이 매우 불안정한 시기입니다. 직장 변동이나 실직의 위험이 있을 수 있으므로 중요한 결정을 미루고 안정을 최우선으로 삼으세요. 신뢰할 수 있는 사람의 조언을 구하는 것이 도움이 됩니다.':'Career luck is very unstable. There may be risks of job changes or unemployment, so postpone important decisions and prioritize stability. Seeking advice from trustworthy people is helpful.',
    '직업 운이 순조롭게 흐르고 있습니다. 꾸준한 노력이 인정받는 시기로, 동료나 상사와의 관계도 원만합니다. 자신의 전문성을 더욱 갈고닦으면 더 큰 성과를 거둘 수 있습니다.':'Career luck is flowing smoothly. It is a time when steady efforts are recognized, and relationships with colleagues and superiors are harmonious. Further honing your expertise can lead to greater achievements.',
    '직업 운이 평범한 편입니다. 큰 변화보다는 현재 위치에서 성실하게 임하는 것이 중요합니다. 새로운 기술이나 지식을 습득하여 경쟁력을 높이는 것이 도움이 됩니다.':'Career luck is average. It is important to work diligently in your current position rather than seeking big changes. Acquiring new skills or knowledge helps increase competitiveness.',
    '직업적으로 어려움이 있을 수 있는 시기입니다. 직장 내 갈등이나 업무 부담이 증가할 수 있으므로 신중하게 행동하고 불필요한 마찰을 피하는 것이 좋습니다. 무리한 도전보다 현상 유지에 집중하세요.':'This may be a period of professional difficulties. Workplace conflicts or workload may increase, so act cautiously and avoid unnecessary friction. Focus on maintaining the status quo rather than reckless challenges.',
    '진지하고 책임감 있는 사랑을 합니다. 장기적인 관계와 안정을 추구하며, 파트너에게 든든한 지원자가 됩니다. 감정 표현이 서툴 수 있으나 깊이 헌신합니다.':'You love seriously and responsibly. You seek long-term relationships and stability, becoming a reliable supporter for your partner. Emotional expression may be awkward, but you are deeply devoted.',
    '창의력과 표현력이 풍부해지는 시기입니다. 재능을 발휘하고 새로운 것을 배우기에 좋으며, 음식·예술·교육 분야에서 기회가 생깁니다. 전반적으로 안정적이고 여유로운 대운입니다.':'A period when creativity and expressiveness flourish. Good for showcasing talents and learning new things, with opportunities in food, arts, and education fields. Overall, a stable and comfortable Major Fortune Cycle.',
    '창의성과 리더십이 필요한 분야에서 성공합니다. 연예, 예술, 경영, 교육, 정치, 이벤트 기획 분야가 잘 맞습니다. 무대 위에서 빛나는 존재감과 카리스마가 강점입니다.':'You succeed in fields requiring creativity and leadership. Entertainment, arts, management, education, politics, and event planning suit you well. Your shining presence and charisma on stage are strengths.',
    '처녀자리는 수성이 지배하는 흙의 별자리입니다. 분석력과 세심함이 뛰어나며, 완벽을 추구하는 성실한 성향입니다. 실용적이고 논리적인 사고로 문제를 해결하는 능력이 탁월합니다. 지나친 완벽주의와 자기비판에 주의하고, 있는 그대로의 자신을 인정하는 연습이 필요합니다.':'Virgo is an earth sign ruled by Mercury. It excels in analytical skills and meticulousness, with a sincere nature that pursues perfection. It has outstanding ability to solve problems with practical and logical thinking. Be cautious of excessive perfectionism and self-criticism, and practice accepting yourself as you are.',
    '천천히 신중하게 마음을 열지만, 한번 사랑에 빠지면 매우 헌신적입니다. 안정적이고 감각적인 사랑을 추구하며, 물질적 표현으로 애정을 드러냅니다.':'They open their heart slowly and carefully, but once they fall in love, they are very devoted. They seek stable and sensual love, expressing affection through material gestures.',
    '천칭자리는 금성이 지배하는 바람의 별자리입니다. 균형과 조화를 추구하며, 아름다움과 예술적 감각이 뛰어납니다. 공정함을 중시하고 타인과의 관계에서 외교적 능력을 발휘합니다. 결정을 내리기 어려워하는 우유부단함이 있어, 자신의 내면 목소리를 믿는 연습이 중요합니다.':'Libra is an air sign ruled by Venus. It pursues balance and harmony, with excellent sense of beauty and artistry. It values fairness and demonstrates diplomatic skills in relationships with others. It tends to be indecisive when making decisions, so practicing trusting your inner voice is important.',
    '첫인상·외면':'First Impression · Appearance',
    '청년운 (15~35세)':'Youth Fortune (15~35 years old)',
    '체계와 성취가 필요한 분야에서 두각을 나타냅니다. 경영, 정치, 금융, 건축, 행정, 공학 분야가 잘 맞습니다. 장기적인 목표를 향해 꾸준히 나아가는 끈기가 강점입니다.':'You stand out in fields requiring structure and achievement. Management, politics, finance, architecture, administration, and engineering suit you well. Your perseverance in steadily pursuing long-term goals is a strong point.',
    '초년운 (0~15세)':'Early Years Fortune (0~15 years old)',
    '최고 귀인성, 위기 극복':'Top Benefactor Quality, Overcoming Crisis',
    '최고의 귀인, 큰 도움과 인복':'The Greatest Benefactor, Great Help and Blessings',
    '추진력과 결단력이 강하지만 충동적 행동과 대인 갈등에 주의하세요.':'You have strong drive and decisiveness, but be cautious of impulsive actions and interpersonal conflicts.',
    '출생 연도':'Year of Birth',
    '타고난 기질과 성격의 흐름':'Innate Temperament and Personality Flow',
    '타고난 기질이 매우 조화롭고 균형 잡혀 있습니다. 어떤 환경에서도 자신의 강점을 발휘하며, 주변 사람들에게 긍정적인 영향을 미치는 타고난 리더 기질을 지니고 있습니다. 직관력과 판단력이 뛰어나 중요한 순간에 탁월한 선택을 내립니다.':'Your innate temperament is very harmonious and balanced. You demonstrate your strengths in any environment and possess a natural leadership quality that positively influences those around you. With excellent intuition and judgment, you make outstanding choices at critical moments.',
    '태양 별자리':'Sun Sign',
    '토 기운이 과잉되어 정체와 고집을 유발할 수 있습니다. 변화를 두려워하거나 지나치게 보수적인 태도가 기회를 놓치게 합니다. 황토색·중앙 배치를 줄이고 유연한 사고를 키우세요.':'Excess earth energy can cause stagnation and stubbornness. Fear of change or overly conservative attitudes may cause missed opportunities. Reduce yellow-brown and central placements, and cultivate flexible thinking.',
    '하늘의 덕, 재난 소멸':'Heaven\'s Virtue, Disaster Dissolution',
    '하늘의 덕을 받아 재난과 액운이 자연스럽게 해소됩니다.':'Receiving heaven\'s virtue, disasters and misfortunes are naturally resolved.',
    '하늘이 내린 귀인으로 어려운 상황에서 도움을 받는 강한 기운입니다.':'A strong energy of a benefactor bestowed by heaven, providing help in difficult situations.',
    '학문·연구·영성에 관심이 높아지는 시기입니다. 내면을 탐구하고 전문 지식을 쌓기에 좋으며, 예술·의료·종교 분야에서 재능이 발휘됩니다. 고독감이 들 수 있으니 소통을 늘리세요.':'This is a period of increased interest in academics, research, and spirituality. It is good for exploring your inner self and accumulating specialized knowledge, with talents expressed in art, medical, and religious fields. You may feel lonely, so increase communication.',
    '학문과 시험의 귀인, 문장 재능':'Benefactor of Academics and Exams, Literary Talent',
    '학습과 성장, 귀인의 도움을 받는 시기입니다. 자격증 취득이나 학업에 유리하며, 어른이나 스승의 지원을 받을 수 있습니다. 차분하고 신중하게 임하면 좋은 결과를 얻습니다.':'A period of learning and growth with the help of benefactors. Favorable for obtaining certifications or academic pursuits, and you may receive support from elders or teachers. Calm and careful efforts yield good results.',
    '학업·시험 운이 강하고 글재주가 뛰어나 문서·계약에 유리합니다.':'Strong fortune in academics and exams, with excellent writing skills favorable for documents and contracts.',
    '핵심 정체성':'Core Identity',
    '행운의 방향':'Lucky Direction',
    '행운의 색':'Lucky Color',
    '행운의 숫자':'Lucky Number',
    '혁신과 미래를 다루는 분야에서 빛납니다. IT, 과학, 사회운동, 방송, 인도주의 분야가 잘 맞습니다. 독창적인 아이디어와 미래를 내다보는 통찰력이 강점입니다.':'You shine in fields dealing with innovation and the future. IT, science, social movements, broadcasting, and humanitarian fields suit you well. Your original ideas and foresight are strengths.',
    '활동성과 추진력이 강해지는 시기입니다. 재물의 유동성이 크고 인간관계가 넓어집니다. 충동적인 투자나 보증은 피하고 신중한 재무 관리가 필요합니다.':'A period of increased activity and drive. Financial liquidity is high and social networks expand. Avoid impulsive investments or guarantees and practice careful financial management.',
    '활발한 재물 활동과 사교성이 높아지는 시기입니다. 사업 기회나 투자 수익이 생길 수 있으나 변동성도 큽니다. 이성 인연이 활발해지고 대인관계가 넓어집니다.':'A period of active financial activity and increased sociability. Business opportunities or investment profits may arise but volatility is also high. Romantic relationships become active and social circles widen.',
    '황소자리는 금성이 지배하는 흙의 별자리입니다. 안정과 물질적 풍요를 중시하며, 한번 결정한 것은 끝까지 밀고 나가는 끈기가 있습니다. 감각적인 즐거움과 아름다움을 사랑하며, 신뢰할 수 있는 든든한 파트너입니다. 변화에 저항하는 고집스러운 면이 있어 유연성을 기르는 것이 중요합니다.':'Taurus is an earth sign ruled by Venus. It values stability and material abundance, with perseverance to see decisions through to the end. It loves sensual pleasures and beauty, and is a reliable and steadfast partner. There is a stubborn resistance to change, so cultivating flexibility is important.',
    '🔮 무료 운세 보기 (사주 · 자미두수 · 점성학)':'🔮 Free Fortune Reading (Saju · Jaemi Dusu · Astrology)'
  },
  ja: {
    '命宮':['命宮 (命宮)','基本的な性格と人生の核心構造'],
    '兄弟':['兄弟宮 (兄弟宮)','兄弟姉妹・同僚との縁'],
    '夫妻':['夫妻宮 (夫妻宮)','配偶者・恋人との縁'],
    '子女':['子女宮 (子女宮)','子供運と創造的エネルギー'],
    '財帛':['財帛宮 (財帛宮)','財産・収入・金銭の流れ'],
    '疾厄':['疾厄宮 (疾厄宮)','健康・体質・疾病傾向'],
    '遷移':['遷移宮 (遷移宮)','移動・海外・外部活動'],
    '交友':['交友宮 (交友宮)','友人・人脈・社会的関係'],
    '官祿':['官祿宮 (官祿宮)','職業・社会的成就・名誉'],
    '田宅':['田宅宮 (田宅宮)','不動産・住居・家庭環境'],
    '福德':['福德宮 (福德宮)','精神世界・福・内面の幸福'],
    '父母':['父母宮 (父母宮)','親運・目上の人との関係'],
    '현재 나이':'現在の年齢',
    '길신':'吉神',
    '긍정적인 기운':'ポジティブなエネルギー',
    '흉신':'凶神',
    '주의가 필요한 기운':'注意が必要なエネルギー',
    '중성 신살':'中性の神殺',
    '상황에 따라 달라지는 기운':'状況によって変わるエネルギー',
    '용신':'用神',
    '희신':'喜神',
    '기신':'忌神',
    '신강(身强)':'身强 (身强)',
    '신약(身弱)':'身弱 (身弱)',
    '중화(中和)':'中和 (中和)',
    '지난 대운':'过去大运',
    '미래 대운':'未来大运',
    '현재 대운':'当前大运',
    '무료 해석':'免费解读',
    '핵심 3궁':'核心3宫',
    '핵심 3요소':'核心3要素',
    '멤버십 전용':'会员专属',
    '나머지 9궁':'其余9宫',
    '상세 해석 제공':'提供详细解读',
    '각 신살의 연애·직업·건강 영역별 심층 분석, AI 종합 해석을 멤버십에서 확인하세요.':'各神煞对爱情·职业·健康的深度分析，AI综合解读会员专享。',
    '멤버십에서 상세 해석 확인':'会员查看详细解读',
    '공궁':'空宫',
    '멤버십 전용 · 자미두수 12궁 완전 해석':'会员专属 · 紫微斗数12宫完整解读',
    '형제·자녀·질액·천이·교우·관록·전택·복덕·부모궁 + 사화 분석 + 대운·유년 연계 해석을 멤버십에서 확인하세요.':'兄弟·子女·疾厄·迁移·交友·官禄·田宅·福德·父母宫 + 四化分析 + 大运·流年连动解读，会员专享。',
    '멤버십 전용 · 심층 점성술 완전 해석':'会员专属 · 占星完整解读',
    '점성술 멤버십 배너 설명':'星盘·行运·太阳回归·心理占星·职业财富爱情深度分析·合盘·星盘地图等，会员专享。',
    "네이탈 차트 완전 해석":"完整星盘解读",
    "심리 점성학":"心理占星学",
    "직업운 심층 해석":"职业运深度解读",
    "재물운 심층 해석":"财运深度解读",
    "연애·결혼운 심층 해석":"爱情婚姻深度解读",
    "트랜짓 미래운":"行运未来运势",
    "솔라 리턴 (생일 1년 운세)":"太阳回归（生日年运）",
    "프로그레션 (내면 성장)":"推运（内在成长）",
    "시나스트리 궁합":"比较盘合盘",
    "컴포지트 관계 차트":"合成关系星盘",
    "아스트로카토그래피":"星盘地图",
    "건강 점성학":"健康占星学",
    "카르마·영혼 해석":"业力·灵魂解读",
    "역행 행성 해석":"逆行行星解读",
    "12하우스 전체 해석":"12宫完整解读",
    "행성 각도 심층 해석":"行星相位深度解读",
    "태양·달·상승궁·10행성 전체 분석, 하우스 배치, 행성 각도 해석":"太阳·月亮·上升·10行星·宫位与相位全面分析",
    "내면 상처, 반복 패턴, 불안 원인, 자기방어 방식, 치유 방향":"内心创伤·重复模式·焦虑根源·防御方式·疗愈方向",
    "10하우스·MC·6하우스 분석, 적합 직종, 커리어 전환 시기, 승진운":"第10/MC/第6宫、适合职业、转职时机与晋升运",
    "2·8하우스 분석, 수입 방식, 투자 성향, 배우자 재산, 상속·대출":"第2/8宫、收入方式·投资倾向·配偶财产·继承与贷款",
    "금성·화성·7하우스 분석, 배우자상, 결혼 시기, 이별 패턴":"金星·火星·第7宫、配偶形象·结婚时机·分手模式",
    "현재 행성이 내 차트에 주는 영향, 올해 운세, 직업·연애·재물 변화 시기":"当前行星影响、今年运势与重大变化时机",
    "생일부터 다음 생일까지 핵심 주제, 직업·연애·재물·건강운":"从生日到下个生日的核心主题：职业·爱情·财运·健康",
    "진행 태양·달·금성으로 보는 심리적 변화와 인생 단계 흐름":"通过推运太阳·月亮·金星看心理变化与人生阶段",
    "두 사람 차트 비교, 감정·대화·성적 끌림·결혼 안정성 분석":"双人星盘比较：情感·沟通·吸引力·婚姻稳定性",
    "두 사람이 만들어낸 관계 자체의 운명, 목적, 장기성 분석":"两人共同关系本身的命运·目的·长远性分析",
    "지역별 운세, 이민·유학·사업·연애에 유리한 나라와 도시":"各地区运势：移民·留学·商业·爱情最佳城市",
    "취약 신체 부위, 건강 경향, 별자리별 주의 질환 분석":"脆弱身体部位·健康倾向·各星座需注意疾病",
    "북쪽·남쪽 노드, 키론, 전생 패턴, 이번 생의 영혼 과제":"北交·南交点·凯龙·前世模式与今生灵魂课题",
    "출생차트 역행 행성의 내면화된 에너지와 특수 재능 분석":"出生星盘逆行行星的内在化能量与特殊才能",
    "인생 12개 분야(자아·재물·형제·가정·연애·건강·결혼·변화·철학·직업·인맥·영성)":"人生12领域：自我·财富·兄弟·家庭·爱情·健康·婚姻·变革·哲学·职业·人脉·灵性",
    "합·섹스타일·스퀘어·트라인·오포지션 전체 각도 분석":"合相·六分相·四分相·三分相·对分相全面分析",
    '멤버십 전용 · 심층 점성술 해석':'会员专属 · 占星深度解读',
    '띠 입니다':'生肖',
    '신강(身强)':'身強 (身强)',
    '신약(身弱)':'身弱 (身弱)',
    '중화(中和)':'中和 (中和)',
    '지난 대운':'過去の大運',
    '미래 대운':'未来の大運',
    '현재 대운':'現在の大運',
    '무료 해석':'無料解釈',
    '핵심 3궁':'核心3宮',
    '핵심 3요소':'核心3要素',
    '멤버십 전용':'メンバーシップ専用',
    '나머지 9궁':'残り9宮',
    '상세 해석 제공':'詳細解釈提供',
    '각 신살의 연애·직업·건강 영역별 심층 분석, AI 종합 해석을 멤버십에서 확인하세요.':'各神殺の恋愛・職業・健康への影響を詳しく分析。AI総合解釈はメンバーシップで。',
    '멤버십에서 상세 해석 확인':'メンバーシップで詳細確認',
    '공궁':'空宮',
    '멤버십 전용 · 자미두수 12궁 완전 해석':'会員限定 · 紫微斗数12宮完全解釈',
    '형제·자녀·질액·천이·교우·관록·전택·복덕·부모궁 + 사화 분석 + 대운·유년 연계 해석을 멤버십에서 확인하세요.':'兄弟・子女・疾厄・遷移・交友・官禄・田宅・福徳・父母宮＋四化分析＋大運・流年の連動解釈をメンバーシップで。',
    '멤버십 전용 · 심층 점성술 완전 해석':'会員限定 · 占星術完全解釈',
    '점성술 멤버십 배너 설명':'ネイタルチャート・トランジット・ソーラーリターン・心理占星術・職業・財・恋愛分析・シナストリー・アストロカルトグラフィーなど会員限定。',
    "네이탈 차트 완전 해석":"ネイタルチャート完全解釈",
    "심리 점성학":"心理占星術",
    "직업운 심층 해석":"職業運深層解釈",
    "재물운 심층 해석":"財運深層解釈",
    "연애·결혼운 심층 해석":"恋愛・結婚運深層解釈",
    "트랜짓 미래운":"トランジット未来運",
    "솔라 리턴 (생일 1년 운세)":"ソーラーリターン（誕生日年運）",
    "프로그레션 (내면 성장)":"プログレッション（内面成長）",
    "시나스트리 궁합":"シナストリー相性",
    "컴포지트 관계 차트":"コンポジットチャート",
    "아스트로카토그래피":"アストロカルトグラフィー",
    "건강 점성학":"健康占星術",
    "카르마·영혼 해석":"カルマ・魂解釈",
    "역행 행성 해석":"逆行惑星解釈",
    "12하우스 전체 해석":"12ハウス全解釈",
    "행성 각도 심층 해석":"アスペクト深層解釈",
    "태양·달·상승궁·10행성 전체 분석, 하우스 배치, 행성 각도 해석":"太陽・月・ASC・10惑星、ハウス・アスペクト全分析",
    "내면 상처, 반복 패턴, 불안 원인, 자기방어 방식, 치유 방향":"内面の傷・繰り返しパターン・不安の根源・癒しの方向",
    "10하우스·MC·6하우스 분석, 적합 직종, 커리어 전환 시기, 승진운":"10H・MC・6H、適職・転職時期・昇進運",
    "2·8하우스 분석, 수입 방식, 투자 성향, 배우자 재산, 상속·대출":"2・8ハウス、収入スタイル・投資・配偶者財産・相続・借入",
    "금성·화성·7하우스 분석, 배우자상, 결혼 시기, 이별 패턴":"金星・火星・7H、配偶者像・結婚時期・別れのパターン",
    "현재 행성이 내 차트에 주는 영향, 올해 운세, 직업·연애·재물 변화 시기":"現在の惑星影響・今年の運勢・職業・恋愛・財運変化時期",
    "생일부터 다음 생일까지 핵심 주제, 직업·연애·재물·건강운":"誕生日から次の誕生日までの核心テーマ：職業・恋愛・財・健康運",
    "진행 태양·달·금성으로 보는 심리적 변화와 인생 단계 흐름":"進行太陽・月・金星で見る心理的変化と人生段階",
    "두 사람 차트 비교, 감정·대화·성적 끌림·결혼 안정성 분석":"2人チャート比較：感情・対話・引力・結婚安定性分析",
    "두 사람이 만들어낸 관계 자체의 운명, 목적, 장기성 분석":"2人が作り出した関係の運命・目的・長期性分析",
    "지역별 운세, 이민·유학·사업·연애에 유리한 나라와 도시":"地域別運勢：移民・留学・事業・恋愛に有利な国と都市",
    "취약 신체 부위, 건강 경향, 별자리별 주의 질환 분석":"弱い身体部位・健康傾向・星座別注意疾患",
    "북쪽·남쪽 노드, 키론, 전생 패턴, 이번 생의 영혼 과제":"ノースノード・サウスノード・キロン・前世パターン・魂の課題",
    "출생차트 역행 행성의 내면화된 에너지와 특수 재능 분석":"出生チャートの逆行惑星の内面化エネルギーと特殊才能",
    "인생 12개 분야(자아·재물·형제·가정·연애·건강·결혼·변화·철학·직업·인맥·영성)":"人生12分野：自我・財・兄弟・家庭・恋愛・健康・結婚・変化・哲学・職業・人脈・霊性",
    "합·섹스타일·스퀘어·트라인·오포지션 전체 각도 분석":"コンジャンクション・セクスタイル・スクエア・トライン・オポジション全分析",
    '멤버십 전용 · 심층 점성술 해석':'会員限定 · 占星術詳細解釈',
    '띠 입니다':'干支です',
    '🔮 무료 운세 탭':'🔮 無料占いタブ',
    '12운성':'十二運星',
    'today.길(吉)':'today.吉',
    'today.대길(大吉)':'today.大吉',
    'today.소흉(小凶)':'today.小凶',
    'today.평(平)':'today.平',
    'today.흉(凶)':'today.凶',
    '※ 사주·자미두수·점성학 원국과 현재 날짜를 기반으로 자동 계산됩니다. 참고용으로 활용하세요.':'※ 四柱推命・紫微斗数・占星術の原局と現在の日付を基に自動計算されます。参考用としてご活用ください。',
    '■ 행운의 색':'■ 幸運の色',
    '● 행운의 색':'● 幸運の色',
    '✨ 자미두수 12궁 상세 해석':'✨ 紫微斗数12宮 詳細解釈',
    '✨ 천궁도 행성·하우스·상(Aspect) 분석':'✨ ホロスコープ 惑星・ハウス・アスペクト分析',
    '⭐대길 ✨길 🌀평 ⚡소흉 ⚠️흉 · ● 행운의 색':'⭐大吉 ✨吉 🌀平 ⚡小凶 ⚠️凶 · ● 幸運の色',
    '감성·본능':'感性・本能',
    '감성과 영성이 필요한 분야에서 탁월합니다. 예술, 음악, 의료, 상담, 종교, 사진 분야가 잘 맞습니다. 깊은 공감 능력과 창의적 상상력이 강점입니다.':'感性と霊性が必要な分野で優れています。芸術、音楽、医療、カウンセリング、宗教、写真の分野が適しています。深い共感力と創造的な想像力が強みです。',
    '감정과 인연의 에너지':'感情と縁のエネルギー',
    '감정적 교류에서 어려움이 있을 수 있습니다. 오해나 갈등이 생기기 쉬운 시기이므로 충동적인 감정 표현을 자제하고 신중하게 행동하는 것이 좋습니다. 혼자만의 시간을 통해 감정을 정리하세요.':'感情的な交流で困難があるかもしれません。誤解や対立が起こりやすい時期なので、衝動的な感情表現を控え、慎重に行動することが望ましいです。一人の時間を通じて感情を整理しましょう。',
    '감정적으로 깊이 연결되는 것을 원합니다. 상대를 세심하게 배려하고 보호하려 하며, 가정적인 사랑을 꿈꿉니다. 상처받으면 껍질 속으로 들어가는 경향이 있습니다.':'感情的に深く繋がることを望みます。相手を細やかに気遣い守ろうとし、家庭的な愛を夢見ています。傷つくと殻に閉じこもる傾向があります。',
    '강렬한 에너지로 추진력이 강하지만 사고·수술·구설에 주의가 필요합니다.':'強烈なエネルギーで推進力が強いですが、事故・手術・口論に注意が必要です。',
    '강한 감수성과 예술적 재능을 가지며 이성 관계가 활발합니다.':'強い感受性と芸術的才能を持ち、異性関係が活発です。',
    '강한 도전과 변화의 시기입니다. 외부 압박이나 경쟁이 심해질 수 있으나, 이를 극복하면 큰 성취를 이룰 수 있습니다. 건강 관리와 법적 문제에 각별히 주의하세요.':'強い挑戦と変化の時期です。外部からの圧力や競争が激しくなるかもしれませんが、これを乗り越えれば大きな成果を得られます。健康管理と法的問題に特に注意してください。',
    '강한 의지, 충동적 행동 주의':'強い意志、衝動的な行動に注意',
    '강한 의지력, 극단적 기운':'強い意志力、極端な気運',
    '강한 의지와 리더십이 있지만 극단적 상황이 발생할 수 있습니다.':'強い意志とリーダーシップがありますが、極端な状況が発生する可能性があります。',
    '건강 상태가 전반적으로 양호합니다. 규칙적인 생활과 적당한 운동으로 현재의 좋은 컨디션을 유지하세요. 스트레스 관리에 신경 쓰면 더욱 활기찬 생활이 가능합니다.':'健康状態は全般的に良好です。規則正しい生活と適度な運動で現在の良いコンディションを維持しましょう。ストレス管理に気を配れば、より活気ある生活が可能です。',
    '건강 운이 매우 좋지 않은 시기입니다. 만성 질환이 악화되거나 새로운 건강 문제가 발생할 수 있습니다. 즉시 전문의 상담을 받고, 과로와 스트레스를 철저히 피하세요. 몸의 신호에 귀를 기울이는 것이 중요합니다.':'健康運が非常に良くない時期です。慢性疾患が悪化したり、新たな健康問題が発生する可能性があります。すぐに専門医の相談を受け、過労やストレスを徹底的に避けてください。体のサインに耳を傾けることが重要です。',
    '건강 운이 평범한 편입니다. 특별한 이상은 없지만 과로나 스트레스에 취약할 수 있습니다. 충분한 수면과 균형 잡힌 식사로 기초 체력을 유지하는 것이 중요합니다.':'健康運は普通のほうです。特に異常はありませんが、過労やストレスに弱い可能性があります。十分な睡眠とバランスの取れた食事で基礎体力を維持することが重要です。',
    '건강에 주의가 필요한 시기입니다. 피로 누적이나 소화기 계통의 문제가 생길 수 있습니다. 무리한 활동을 자제하고 정기적인 건강 검진을 받는 것이 좋습니다. 충분한 휴식이 필수입니다.':'健康に注意が必要な時期です。疲労の蓄積や消化器系の問題が起こる可能性があります。無理な活動を控え、定期的な健康診断を受けることが望ましいです。十分な休息が必須です。',
    '게자리는 달이 지배하는 물의 별자리입니다. 감수성이 풍부하고 직관력이 뛰어나며, 가족과 가정을 무엇보다 소중히 여깁니다. 타인의 감정에 민감하게 반응하는 공감 능력이 탁월합니다. 감정 기복이 있을 수 있으며, 과거에 집착하는 경향을 의식적으로 조절하면 더 성장할 수 있습니다.':'蟹座は月が支配する水の星座です。感受性が豊かで直感力に優れ、家族や家庭を何よりも大切にします。他人の感情に敏感に反応する共感能力が卓越しています。感情の起伏があることがあり、過去への執着傾向を意識的に調整すればさらに成長できます。',
    '계산 중 오류가 발생했습니다.':'計算中にエラーが発生しました。',
    '계산 중… 잠시만 기다려주세요.':'計算中… 少々お待ちください。',
    '관재구설과 소송에서 보호받으며 관운이 좋아집니다.':'訴訟や口論から守られ、官運が良くなります。',
    '균형 잡힌 아름다운 관계를 추구합니다. 로맨틱하고 우아한 사랑을 즐기며, 파트너와의 조화를 중시합니다. 갈등을 피하려는 성향이 있어 솔직한 표현이 필요합니다.':'バランスの取れた美しい関係を追求します。ロマンチックで優雅な愛を楽しみ、パートナーとの調和を重視します。対立を避ける傾向があるため、率直な表現が必要です。',
    '균형과 조화가 필요한 분야에서 능력을 발휘합니다. 법률, 외교, 디자인, 패션, 상담, 중재 분야가 잘 맞습니다. 공정한 판단력과 미적 감각이 뛰어납니다.':'バランスと調和が必要な分野で能力を発揮します。法律、外交、デザイン、ファッション、カウンセリング、仲裁の分野が適しています。公平な判断力と美的感覚に優れています。',
    '금 기운이 과잉되어 지나친 냉정함이나 갈등을 일으킬 수 있습니다. 날카로운 언행과 무리한 경쟁을 자제하세요. 금속 소품이나 흰색 계열을 과도하게 사용하면 긴장감이 높아질 수 있습니다.':'金の気が過剰で、過度の冷静さや対立を引き起こすことがあります。鋭い言動や無理な競争は控えましょう。金属の小物や白色系を過度に使用すると緊張感が高まる可能性があります。',
    '금속의 날카로운 기운이 결단력과 재물운을 강화합니다. 서쪽 방향, 흰색·금색 계열이 길하며 계획적인 재테크와 자기 계발이 운을 높입니다. 원칙을 지키는 행동이 신뢰를 쌓습니다.':'金属の鋭い気が決断力と財運を強化します。西の方角、白色・金色系が吉で、計画的な資産運用と自己啓発が運気を高めます。原則を守る行動が信頼を築きます。',
    '기본 운세':'基本運勢',
    '기질의 균형이 무난한 편입니다. 장점과 단점이 공존하며, 환경에 따라 성격 표현이 달라질 수 있습니다. 자신의 강점을 의식적으로 계발하면 더 큰 잠재력을 발휘할 수 있습니다.':'気質のバランスは無難な方です。長所と短所が共存し、環境によって性格の表現が変わることがあります。自分の強みを意識的に伸ばせば、より大きな潜在能力を発揮できます。',
    '기질적으로 다소 불균형한 면이 있어 감정 기복이나 결정 장애를 경험할 수 있습니다. 자기 이해를 높이고 약점을 보완하는 노력이 필요합니다. 내면의 안정을 찾는 것이 중요한 과제입니다.':'気質的にやや不均衡な面があり、感情の起伏や決断障害を経験することがあります。自己理解を深め、弱点を補う努力が必要です。内面の安定を見つけることが重要な課題です。',
    '깊고 강렬한 사랑을 원합니다. 상대의 영혼까지 알고 싶어하며, 완전한 신뢰와 헌신을 요구합니다. 질투심이 강할 수 있으나, 그만큼 깊이 사랑합니다.':'深く強烈な愛を求めます。相手の魂まで知りたがり、完全な信頼と献身を要求します。嫉妬心が強いこともありますが、それだけ深く愛しています。',
    '꿈같은 로맨스를 꿈꿉니다. 상대를 이상화하는 경향이 있으며, 깊은 영혼의 교감을 원합니다. 감정적으로 민감하고 공감 능력이 뛰어나 상대의 마음을 잘 읽습니다.':'夢のようなロマンスを夢見ます。相手を理想化する傾向があり、深い魂の交流を望みます。感情的に敏感で共感能力が高く、相手の心をよく読み取ります。',
    '나무 기운이 과잉되어 균형을 흐트러뜨립니다. 지나친 고집이나 무리한 확장을 조심하세요. 동쪽 방향과 초록색 계열을 과도하게 사용하면 에너지 소모가 커질 수 있으니 절제가 필요합니다.':'木の気が過剰でバランスを乱します。過度の頑固さや無理な拡張に注意しましょう。東の方角や緑色系を過度に使うとエネルギー消耗が大きくなるため、節制が必要です。',
    '나무의 기운이 부족한 명식에 생기를 불어넣습니다. 성장·창의·도전의 에너지를 보충해 주므로 동쪽 방향, 초록색 계열, 봄철 활동이 길합니다. 새로운 시작이나 사업 확장에 유리한 시기를 잘 활용하세요.':'木の気が不足している命式に活力を与えます。成長・創造・挑戦のエネルギーを補うため、東の方角、緑色系、春の活動が吉です。新しい始まりや事業拡大に有利な時期をうまく活用しましょう。',
    '남':'男',
    '남성':'男性',
    '년주':'年柱',
    '다른 생년월일로 다시 보기':'別の生年月日で再確認',
    '달 별자리':'月の星座',
    '당신의 띠는':'あなたの干支は',
    '대운 (大運)':'大運 (大運)',
    '대지의 안정된 기운이 중심을 잡아줍니다. 중앙·황토색 계열이 길하며 부동산·저축·건강 관리에 집중하면 운이 열립니다. 신뢰와 성실함으로 주변의 지지를 얻는 것이 중요합니다.':'大地の安定した気が中心を支えます。中央・黄土色系が吉で、不動産・貯蓄・健康管理に集中すると運が開けます。信頼と誠実さで周囲の支持を得ることが重要です。',
    '대화와 지적 교감을 중시합니다. 다양한 사람에게 관심을 보이지만, 진정한 소울메이트를 찾습니다. 자유로운 관계를 선호하며 구속을 싫어합니다.':'対話と知的交流を重視します。多様な人に関心を持ちますが、本当のソウルメイトを探しています。自由な関係を好み、束縛を嫌います。',
    '독특하고 자유로운 사랑을 원합니다. 친구 같은 파트너를 선호하며, 지적 교감과 공통된 가치관을 중시합니다. 감정적 친밀감보다 정신적 연결을 더 중요하게 여깁니다.':'独特で自由な愛を求めます。友達のようなパートナーを好み、知的交流と共通の価値観を重視します。感情的な親密さより精神的なつながりをより重要視します。',
    '독특한 인상':'独特な印象',
    '돌봄과 감성이 필요한 분야에서 탁월합니다. 의료, 사회복지, 교육, 요식업, 부동산, 상담 분야가 잘 맞습니다. 사람들의 감정을 이해하고 보살피는 능력이 뛰어납니다.':'ケアと感性が必要な分野で優れています。医療、社会福祉、教育、飲食業、不動産、カウンセリング分野が適しています。人々の感情を理解し、気遣う能力に優れています。',
    '로맨틱하고 극적인 사랑을 즐깁니다. 상대에게 최고의 것을 선사하고 싶어하며, 충성스럽고 열정적인 파트너입니다. 인정받지 못하면 상처를 받습니다.':'ロマンチックで劇的な愛を楽しみます。相手に最高のものを贈りたがり、忠誠心が強く情熱的なパートナーです。認められないと傷つきます。',
    '리더십과 추진력이 필요한 분야에서 두각을 나타냅니다. 스포츠, 군경, 기업가, 개척 사업, 응급 의료 분야가 잘 맞습니다. 독립적으로 일하거나 팀을 이끄는 역할이 적합합니다.':'リーダーシップと推進力が必要な分野で頭角を現します。スポーツ、軍・警察、起業家、開拓事業、救急医療分野が適しています。独立して働くか、チームを率いる役割が向いています。',
    '말년운 (50세~)':'晩年運 (50歳～)',
    '멤버십 상세 분석':'メンバーシップ詳細分析',
    '멤버십 전용 상세 분석':'メンバーシップ専用詳細分析',
    '명예와 사회적 지위가 높아지는 시기입니다. 조직 내 승진이나 인정을 받을 기회가 생기며, 책임감과 원칙을 중시하게 됩니다. 공직·전문직에서 두각을 나타낼 수 있습니다.':'名誉と社会的地位が高まる時期です。組織内で昇進や認められる機会が生まれ、責任感と原則を重視するようになります。公職・専門職で頭角を現すことができます。',
    '몸과 마음의 균형 에너지':'身体と心のバランスエネルギー',
    '몸과 마음의 에너지가 매우 충만한 시기입니다. 체력이 넘치고 면역력도 강해 활발한 활동이 가능합니다. 이 시기에 건강한 습관을 정착시키면 오랫동안 좋은 컨디션을 유지할 수 있습니다.':'身体と心のエネルギーが非常に充実している時期です。体力があふれ、免疫力も強く活発な活動が可能です。この時期に健康的な習慣を定着させると、長期間良いコンディションを維持できます。',
    '무료 운세':'無料運勢',
    '물고기자리는 해왕성과 목성이 지배하는 물의 별자리입니다. 예민한 감수성과 깊은 공감 능력, 영적 직관이 뛰어납니다. 예술적 재능과 상상력이 풍부하며, 타인의 고통에 민감하게 반응합니다. 현실과 이상 사이에서 혼란을 겪을 수 있으므로, 경계를 설정하고 자신을 보호하는 것이 중요합니다.':'魚座は海王星と木星が支配する水の星座です。繊細な感受性と深い共感能力、霊的直感に優れています。芸術的才能と豊かな想像力を持ち、他人の苦しみに敏感に反応します。現実と理想の間で混乱を経験することがあるため、境界を設定し自分を守ることが重要です。',
    '물병자리는 천왕성과 토성이 지배하는 바람의 별자리입니다. 독창적이고 혁신적인 사고로 미래를 내다보는 능력이 있습니다. 인류애와 평등을 중시하며, 독립적이고 자유로운 정신을 가지고 있습니다. 감정적 거리감이 있을 수 있으므로, 친밀한 관계에서 따뜻함을 표현하는 연습이 도움이 됩니다.':'水瓶座は天王星と土星が支配する風の星座です。独創的で革新的な思考により未来を見通す能力があります。人類愛と平等を重視し、独立的で自由な精神を持っています。感情的な距離感があることがあるため、親密な関係で温かさを表現する練習が役立ちます。',
    '물의 지혜로운 기운이 지식과 재물의 흐름을 원활하게 합니다. 북쪽 방향, 검정·파란색 계열이 길하며 학업·연구·금융 분야에서 두각을 나타낼 수 있습니다. 유연한 사고로 기회를 포착하세요.':'水の賢い気運が知識と財の流れを円滑にします。北の方角、黒・青系統が吉で、学業・研究・金融分野で頭角を現せます。柔軟な思考でチャンスを掴みましょう。',
    '변화와 혁신을 추구하는 시기입니다. 창의적 아이디어가 넘치고 기존 틀을 벗어나려는 욕구가 강해집니다. 직업 변화나 이직을 고려할 수 있으며, 언행에 주의가 필요합니다.':'変化と革新を追求する時期です。創造的なアイデアが溢れ、既存の枠を超えようとする欲求が強まります。職業の変化や転職を考えることがあり、言動に注意が必要です。',
    '부귀와 안락의 별, 재물과 명예':'富貴と安楽の星、財と名誉',
    '분석과 정밀함이 필요한 분야에서 두각을 나타냅니다. 의료, 회계, 연구, 편집, 영양, 품질관리 분야가 잘 맞습니다. 세심한 주의력과 완벽을 추구하는 성향이 강점입니다.':'分析と精密さが必要な分野で頭角を現します。医療、会計、研究、編集、栄養、品質管理分野に適しています。細やかな注意力と完璧を追求する傾向が強みです。',
    '불 기운이 과잉되어 충동적 행동이나 과열을 유발할 수 있습니다. 감정 기복과 급한 결정을 경계하세요. 빨간색 계열과 남쪽 방향을 과도하게 접하면 스트레스가 가중될 수 있습니다.':'火の気が過剰になり衝動的な行動や過熱を引き起こすことがあります。感情の起伏や急な決断に注意してください。赤系統と南の方角を過度に接するとストレスが増加する可能性があります。',
    '불의 기운으로 열정과 표현력을 강화합니다. 남쪽 방향, 빨간색 계열이 행운을 부르며 인간관계와 명예 운이 상승합니다. 적극적인 자기 표현과 사교 활동이 운을 여는 열쇠입니다.':'火の気で情熱と表現力を強化します。南の方角、赤系統が幸運を呼び、人間関係と名誉運が上昇します。積極的な自己表現と社交活動が運を開く鍵です。',
    '사수자리는 목성이 지배하는 불의 별자리입니다. 자유를 사랑하고 철학적 사고와 모험 정신이 넘칩니다. 낙관적이고 유머 감각이 뛰어나며, 다양한 문화와 지식을 탐구하는 것을 즐깁니다. 무책임하거나 직설적인 말로 상처를 줄 수 있으므로, 세심한 배려가 필요합니다.':'射手座は木星が支配する火の星座です。自由を愛し哲学的思考と冒険精神に溢れています。楽観的でユーモアのセンスが優れ、多様な文化や知識を探求することを楽しみます。無責任や率直すぎる言葉で傷つけることがあるため、細やかな配慮が必要です。',
    '사자자리는 태양이 지배하는 불의 별자리입니다. 타고난 리더십과 카리스마로 자연스럽게 주목받습니다. 창의적이고 표현력이 풍부하며, 무대 위에서 빛나는 존재감을 발휘합니다. 자존심이 강하고 인정받고 싶은 욕구가 크므로, 겸손함을 갖추면 더욱 빛납니다.':'獅子座は太陽が支配する火の星座です。生まれながらのリーダーシップとカリスマ性で自然と注目を集めます。創造的で表現力豊かであり、舞台上で輝く存在感を発揮します。プライドが強く認められたい欲求が大きいため、謙虚さを備えるとさらに輝きます。',
    '사주 · 자미두수 · 점성학 세 시스템 통합 분석 (회원가입 불필요)':'四柱推命・紫微斗数・占星術 三システム統合分析（会員登録不要）',
    '사주 원국 기반':'四柱原局ベース',
    '사주팔자 · 자미두수 · 천궁도 전체 결과를PDF로 정리하여 제공합니다.':'四柱推命・紫微斗数・天宮図の全結果をPDFでまとめて提供します。',
    '사회적 활동과 성취 흐름':'社会的活動と達成の流れ',
    '사회적 활동과 직업 운이 매우 강한 시기입니다. 능력을 인정받고 승진이나 중요한 기회가 찾아올 수 있습니다. 새로운 프로젝트나 도전에 적극적으로 나서면 좋은 결과를 얻을 수 있습니다.':'社会的活動と職業運が非常に強い時期です。能力を認められ昇進や重要なチャンスが訪れる可能性があります。新しいプロジェクトや挑戦に積極的に取り組むと良い結果が得られます。',
    '상승궁 (ASC)':'アセンダント (ASC)',
    '생년월일을 입력해주세요.':'生年月日を入力してください。',
    '생애 에너지 흐름':'生涯エネルギーの流れ',
    '서양 천궁도 분석':'西洋天宮図分析',
    '성격과 기질이 안정적으로 발달해 있어 사회적 관계에서 신뢰를 쌓기 쉽습니다. 자신의 감정을 잘 조절하며, 목표를 향해 꾸준히 나아가는 힘이 있습니다. 다양한 상황에서 유연하게 대처하는 능력이 돋보입니다.':'性格と気質が安定的に発達しており、社会的関係で信頼を築きやすいです。自分の感情をうまくコントロールし、目標に向かって着実に進む力があります。様々な状況に柔軟に対応する能力が際立っています。',
    '소통과 정보를 다루는 분야에서 빛납니다. 언론, 교육, IT, 마케팅, 작가, 통역 분야가 잘 맞습니다. 다양한 분야를 넘나드는 멀티태스キング 능력이 강점입니다.':'コミュニケーションと情報を扱う分野で輝きます。報道、教育、IT、マーケティング、作家、通訳分野に適しています。多様な分野をまたぐマルチタスク能力が強みです。',
    '수 기운이 과잉되어 우유부단함이나 과도한 걱정을 유발할 수 있습니다. 지나친 분석과 소극적 태도를 경계하세요. 검정·파란색 계열과 북쪽 방향을 과도하게 접하면 에너지가 침체될 수 있습니다.':'水の気が過剰になり優柔不断や過度な心配を引き起こすことがあります。過剰な分析や消極的な態度に注意してください。黒・青系統と北の方角を過度に接するとエネルギーが停滞する可能性があります。',
    '시주':'時柱',
    '신강':'身強',
    '신비롭고 예민한 기운이 강하게 작동할 수 있음':'神秘的で繊細な気運が強く働くことがあります',
    '신약':'身弱',
    '심층 분석과 변화를 다루는 분야에서 탁월합니다. 심리학, 의학, 금융, 탐정, 연구, 위기관리 분야가 잘 맞습니다. 숨겨진 진실을 파헤치는 능력과 강한 집중력이 강점입니다.':'深層分析と変化を扱う分野で卓越しています。心理学、医学、金融、探偵、研究、危機管理分野に適しています。隠された真実を暴く能力と強い集中力が強みです。',
    '쌍둥이자리는 수성이 지배하는 바람의 별자리입니다. 지적 호기심이 넘치고 다재다능하며, 소통과 정보 교환에 탁월합니다. 두 가지 상반된 성향이 공존하여 상황에 따라 다른 모습을 보이기도 합니다. 언어 능력과 적응력이 뛰어나 다양한 분야에서 활약할 수 있습니다.':'双子座は水星が支配する風の星座です。知的好奇心が旺盛で多才、コミュニケーションと情報交換に優れています。二つの相反する性質が共存し、状況に応じて異なる姿を見せることもあります。言語能力と適応力が高く、多様な分野で活躍できます。',
    '안정적이고 실용적인 분야에서 능력을 발휘합니다. 금융, 부동산, 요리, 예술, 농업, 건축 분야가 잘 맞습니다. 장기적인 프로젝트를 꾸준히 완성하는 능력이 탁월합니다.':'安定的で実用的な分野で能力を発揮します。金融、不動産、料理、芸術、農業、建築分野が適しています。長期的なプロジェクトを着実に完成させる能力が優れています。',
    '안정적인 재물 축적과 내실을 다지는 시기입니다. 꾸준한 노력이 결실을 맺고 저축과 부동산 등 안정적 자산 관리에 유리합니다. 성실하게 임하면 좋은 결과를 얻습니다.':'安定した財産の蓄積と内実を固める時期です。地道な努力が実を結び、貯蓄や不動産など安定的な資産管理に有利です。誠実に取り組めば良い結果を得られます。',
    '애정 운이 좋은 편으로, 관계에서 따뜻한 교류가 이루어집니다. 진심 어린 소통이 관계를 더욱 돈독하게 만들어 줍니다. 솔직한 감정 표현이 인연을 발전시키는 열쇠가 됩니다.':'恋愛運は良好で、関係に温かい交流が生まれます。心からのコミュニケーションが関係をより強固にします。率直な感情表現が縁を発展させる鍵となります。',
    '애정 운이 평범한 편입니다. 특별한 변화보다는 현재 관계를 안정적으로 유지하는 것이 중요합니다. 상대방의 입장을 이해하려는 노력이 관계의 질을 높여줍니다.':'恋愛運は平凡な方です。特別な変化よりも現在の関係を安定的に維持することが重要です。相手の立場を理解しようとする努力が関係の質を高めます。',
    '양자리는 황도 12궁의 첫 번째 별자리로, 화성이 지배하는 불의 별자리입니다. 개척 정신과 추진력이 강하며, 새로운 일을 시작하는 데 탁월한 능력을 발휘합니다. 경쟁심이 강하고 즉흥적인 면이 있어 충동적 결정에 주의가 필요합니다. 리더십이 뛰어나고 용기 있는 행동으로 주변을 이끄는 타입입니다.':'牡羊座は黄道12宮の第一の星座で、火星が支配する火の星座です。開拓精神と推進力が強く、新しいことを始めるのに優れた能力を発揮します。競争心が強く即興的な面があり、衝動的な決断に注意が必要です。リーダーシップに優れ、勇気ある行動で周囲を導くタイプです。',
    '여':'女',
    '여성':'女性',
    '열정과 감정의 기운, 예술적 재능':'情熱と感情の気、芸術的才能',
    '열정적이고 직접적으로 감정을 표현합니다. 첫눈에 반하는 경우가 많고, 상대를 적극적으로 리드합니다. 권태기가 오면 새로운 자극이 필요합니다.':'情熱的で感情を直接的に表現します。一目惚れすることが多く、相手を積極的にリードします。マンネリ期には新しい刺激が必要です。',
    '염소자리는 토성이 지배하는 흙의 별자리입니다. 책임감이 강하고 목표를 향한 끈기와 실용적 판단력이 탁월합니다. 사회적 성공과 명예를 중시하며, 체계적이고 성실하게 기반을 쌓아갑니다. 감정 표현이 서툴고 지나치게 일에 집중하는 경향이 있어, 휴식과 감정 교류도 중요합니다.':'山羊座は土星が支配する土の星座です。責任感が強く、目標に向かう粘り強さと実用的な判断力に優れています。社会的成功と名誉を重視し、体系的かつ誠実に基盤を築いていきます。感情表現が苦手で過度に仕事に集中する傾向があるため、休息と感情交流も重要です。',
    '오늘':'今日',
    '오늘의 운세':'今日の運勢',
    '오행 분포':'五行分布',
    '오행 불균형으로 인해 기질적 갈등이 심할 수 있습니다. 충동적 행동이나 극단적 감정 반응에 주의가 필요합니다. 명상, 규칙적인 생활, 신뢰할 수 있는 조언자의 도움을 받는 것이 도움이 됩니다.':'五行の不均衡により気質的な葛藤が激しくなることがあります。衝動的な行動や極端な感情反応に注意が必要です。瞑想、規則正しい生活、信頼できる助言者の助けを受けることが有効です。',
    '올바른 연도를 입력해주세요.':'正しい年を入力してください。',
    '완벽한 파트너를 찾기 위해 신중하게 관계를 시작합니다. 실용적이고 헌신적인 사랑을 하며, 세심한 배려로 상대를 돌봅니다. 지나친 비판은 관계를 어렵게 할 수 있습니다.':'完璧なパートナーを見つけるために慎重に関係を始めます。実用的で献身的な愛をし、細やかな配慮で相手を大切にします。過度な批判は関係を難しくすることがあります。',
    '용신 분석':'用神分析',
    '용신을 보조하는 금 기운입니다. 정확하고 체계적인 행동이 운을 뒷받침합니다. 금속 소품이나 흰색 계열 인테리어가 이 기운을 강화하며, 계획적인 생활 패턴이 도움이 됩니다.':'用神を補助する金の気です。正確で体系的な行動が運を支えます。金属の小物や白系のインテリアがこの気を強化し、計画的な生活パターンが役立ちます。',
    '용신을 보조하는 나무 기운입니다. 창의적 활동과 인간관계 확장이 간접적으로 운을 돕습니다. 식물 키우기, 등산, 새벽 산책 등 목(木) 기운을 접하는 생활 습관이 에너지를 보충해 줍니다.':'用神を補助する木の気です。創造的な活動や人間関係の拡大が間接的に運を助けます。植物の栽培、登山、早朝の散歩など木の気に触れる生活習慣がエネルギーを補充します。',
    '용신을 보조하는 불 기운입니다. 밝고 활기찬 환경이 운의 흐름을 원활하게 합니다. 조명이 밝은 공간에서 활동하거나 따뜻한 색상의 소품을 활용하면 보조 에너지가 강화됩니다.':'用神を補助する火の気です。明るく活気のある環境が運の流れを円滑にします。照明が明るい空間で活動したり、暖色系の小物を活用すると補助エネルギーが強化されます。',
    '용신을 보조하는 수 기운입니다. 지식 축적과 내면 성찰이 운을 간접적으로 강화합니다. 독서, 명상, 수영 등 수(水) 기운과 연관된 활동이 보조 에너지를 활성화합니다.':'用神を補助する水の気です。知識の蓄積と内面の省察が運を間接的に強化します。読書、瞑想、水泳など水の気に関連する活動が補助エネルギーを活性化します。',
    '용신을 보조하는 토 기운입니다. 안정적인 생활 기반이 전체 운을 뒷받침합니다. 규칙적인 식사와 수면, 꾸준한 저축 습관이 이 기운을 활성화하여 운의 토대를 다집니다.':'用神を補助する土の気です。安定した生活基盤が全体の運を支えます。規則的な食事と睡眠、継続的な貯蓄習慣がこの気を活性化し、運の土台を築きます。',
    '운세 지수':'運勢指数',
    '운세를 계산하는 중입니다…':'運勢を計算中です…',
    '월주':'月柱',
    '의료·치유 분야에 재능이 있으며 건강 회복력이 강합니다.':'医療・治癒分野に才能があり、健康回復力が強いです。',
    '의술과 건강의 별, 치료 능력':'医術と健康の星、治療能力',
    '이 대운은 천간의 기운이 일간에 영향을 미치는 시기입니다. 해당 십성의 특성을 이해하고 흐름에 맞게 대응하는 것이 중요합니다.':'この大運は天干の気が日干に影響を与える時期です。該当する十星の特性を理解し、流れに合わせて対応することが重要です。',
    '이성 매력, 예술적 감각':'異性魅力、芸術的感覚',
    '이성에게 매력적으로 보이며 예술·연예 분야에 재능이 있습니다.':'異性に魅力的に映り、芸術・芸能分野に才能があります。',
    '인연의 기운이 매우 강하게 흐르고 있습니다. 새로운 만남이나 기존 관계의 깊어짐이 기대되는 시기입니다. 감정 표현이 자연스럽게 이루어지며, 상대방의 마음을 얻기에 유리한 에너지가 충만합니다.':'縁の気が非常に強く流れています。新しい出会いや既存の関係の深まりが期待できる時期です。感情表現が自然に行われ、相手の心を掴むのに有利なエネルギーが満ちています。',
    '인연의 흐름이 막혀 있는 시기입니다. 관계에서 상처를 받거나 이별의 아픔을 경험할 수 있습니다. 자신을 먼저 돌보고 내면의 상처를 치유하는 데 집중하는 것이 현명합니다.':'縁の流れが滞っている時期です。関係で傷を負ったり別れの痛みを経験することがあります。まず自分を大切にし、内面の傷を癒すことに集中するのが賢明です。',
    '일간 강약':'日干の強弱',
    '일간 강약과 오행 균형':'日干の強弱と五行のバランス',
    '일생 최고의 귀인을 만나는 기운으로 위기 시 강력한 도움을 받습니다.':'一生で最高の貴人に出会う運気で、危機の際に強力な助けを受けます。',
    '일주':'日柱',
    '일진 분석':'日運分析',
    '자립심과 독립 의지가 강해지는 시기입니다. 새로운 시작과 자기 계발에 유리하며, 경쟁 속에서 실력을 키울 수 있습니다. 다만 고집이 세질 수 있으니 협력을 잊지 마세요.':'自立心と独立意志が強くなる時期です。新しい始まりや自己啓発に有利で、競争の中で実力を伸ばせます。ただし頑固になりやすいので協力を忘れないでください。',
    '자미두수':'紫微斗数',
    '자유롭고 모험적인 사랑을 즐깁니다. 함께 성장하고 세상을 탐험할 파트너를 원합니다. 구속받는 것을 싫어하며, 정신적 교감을 매우 중시합니다.':'自由で冒険的な愛を楽しみます。共に成長し世界を探検するパートナーを求めます。束縛を嫌い、精神的な交流を非常に重視します。',
    '자유와 확장이 필요한 분야에서 성공합니다. 교육, 여행, 출판, 법률, 철학, 해외 비즈니스 분야가 잘 맞습니다. 넓은 시야와 낙관적 에너지로 새로운 기회를 만들어냅니다.':'自由と拡張が必要な分野で成功します。教育、旅行、出版、法律、哲学、海外ビジネス分野が適しています。広い視野と楽観的なエネルギーで新しい機会を生み出します。',
    '재물 손실이나 예상치 못한 지출이 발생할 수 있는 시기입니다. 충동적인 소비나 투기적 투자를 자제하고 보수적인 재정 관리가 필요합니다. 보증이나 대출에 특히 주의하세요.':'財物の損失や予期せぬ支出が発生する可能性がある時期です。衝動的な消費や投機的な投資を控え、保守的な財政管理が必要です。保証や借入には特に注意してください。',
    '재물 운이 매우 강하게 흐르고 있습니다. 예상치 못한 수입이나 투자 성과가 기대되는 시기입니다. 재물이 자연스럽게 모이는 흐름이므로 장기적인 재테크 계획을 세우기에 좋은 때입니다.':'財運が非常に強く流れています。予期せぬ収入や投資成果が期待できる時期です。財が自然に集まる流れなので、長期的な資産運用計画を立てるのに良い時です。',
    '재물 운이 매우 불안정한 시기입니다. 큰 재정적 손실이나 사기 피해의 위험이 있으므로 중요한 금전 거래는 반드시 전문가의 조언을 구하세요. 현금 보유를 늘리고 리스크를 최소화하는 것이 현명합니다.':'財運が非常に不安定な時期です。大きな財政的損失や詐欺被害の危険があるため、重要な金銭取引は必ず専門家の助言を求めてください。現金保有を増やしリスクを最小限にするのが賢明です。',
    '재물 운이 좋은 편입니다. 수입이 안정적으로 유지되며 절약과 투자의 균형을 잘 맞출 수 있습니다. 소소한 재물 기회들이 꾸준히 찾아오는 시기입니다.':'財運は良好です。収入が安定して維持され、節約と投資のバランスをうまく取れます。小さな財のチャンスが着実に訪れる時期です。',
    '재물 운이 평범한 편입니다. 큰 이익보다는 현재 재정 상태를 안정적으로 유지하는 것이 중요합니다. 불필요한 지출을 줄이고 저축 습관을 기르는 것이 도움이 됩니다.':'財運は平凡です。大きな利益よりも現在の財政状態を安定的に維持することが重要です。不必要な支出を減らし貯蓄習慣をつけることが役立ちます。',
    '재물과 기회의 흐름':'財と機会の流れ',
    '재물복과 명예운이 좋아 안정된 삶을 누리는 기운입니다.':'財運と名誉運が良く、安定した生活を享受する運気です。',
    '전갈자리는 명왕성과 화성이 지배하는 물의 별자리입니다. 강렬한 의지와 깊이 있는 통찰력을 가지고 있습니다. 비밀을 잘 지키고 심층적인 진실을 탐구하는 능력이 탁월합니다. 집착과 질투심이 강할 수 있으므로, 신뢰를 바탕으로 한 깊은 관계를 형성하는 것이 중요합니다.':'さそり座は冥王星と火星が支配する水の星座です。強烈な意志と深い洞察力を持っています。秘密を守るのが得意で、深層的な真実を探求する能力に優れています。執着や嫉妬心が強くなることがあるため、信頼に基づく深い関係を築くことが重要です。',
    '점성학':'占星術',
    '중년운 (35~50세)':'中年運（35～50歳）',
    '직관력과 영적 감수성이 뛰어나지만 신경과민·불안 경향에 주의가 필요합니다.':'直感力と霊的感受性に優れていますが、神経過敏・不安傾向に注意が必要です。',
    '직업 운이 매우 불안정한 시기입니다. 직장 변동이나 실직의 위험이 있을 수 있으므로 중요한 결정을 미루고 안정을 최우선으로 삼으세요. 신뢰할 수 있는 사람의 조언을 구하는 것이 도움이 됩니다.':'職業運が非常に不安定な時期です。職場の変動や失業の危険があるため、重要な決定は延期し安定を最優先にしてください。信頼できる人の助言を求めることが役立ちます。',
    '직업 운이 순조롭게 흐르고 있습니다. 꾸준한 노력이 인정받는 시기로, 동료나 상사와의 관계도 원만합니다. 자신의 전문성을 더욱 갈고닦으면 더 큰 성과를 거둘 수 있습니다.':'職業運が順調に流れています。着実な努力が認められる時期で、同僚や上司との関係も円満です。自分の専門性をさらに磨けばより大きな成果を得られます。',
    '직업 운이 평범한 편입니다. 큰 변화보다는 현재 위치에서 성실하게 임하는 것이 중요합니다. 새로운 기술이나 지식을 습득하여 경쟁력을 높이는 것이 도움이 됩니다.':'職業運は平凡です。大きな変化よりも現在の立場で誠実に取り組むことが重要です。新しい技術や知識を習得して競争力を高めることが役立ちます。',
    '직업적으로 어려움이 있을 수 있는 시기입니다. 직장 내 갈등이나 업무 부담이 증가할 수 있으므로 신중하게 행동하고 불필요한 마찰을 피하는 것이 좋습니다. 무리한 도전보다 현상 유지에 집중하세요.':'職業的に困難があるかもしれない時期です。職場内の対立や業務負担が増える可能性があるため慎重に行動し、不必要な摩擦を避けるのが良いです。無理な挑戦より現状維持に集中してください。',
    '진지하고 책임감 있는 사랑을 합니다. 장기적인 관계와 안정을 추구하며, 파트너에게 든든한 지원자가 됩니다. 감정 표현이 서툴 수 있으나 깊이 헌신합니다.':'真剣で責任感のある愛をします。長期的な関係と安定を求め、パートナーにとって頼もしい支援者となります。感情表現は不器用かもしれませんが深く献身します。',
    '창의력과 표현력이 풍부해지는 시기입니다. 재능을 발휘하고 새로운 것을 배우기에 좋으며, 음식·예술·교육 분야에서 기회가 생깁니다. 전반적으로 안정적이고 여유로운 대운입니다.':'創造力と表現力が豊かになる時期です。才能を発揮し新しいことを学ぶのに良く、飲食・芸術・教育分野でチャンスが訪れます。全体的に安定して余裕のある大運です。',
    '창의성과 리더십이 필요한 분야에서 성공합니다. 연예, 예술, 경영, 교육, 정치, 이벤트 기획 분야가 잘 맞습니다. 무대 위에서 빛나는 존재감과 카리스마가 강점입니다.':'創造性とリーダーシップが必要な分野で成功します。芸能、芸術、経営、教育、政治、イベント企画分野が適しています。舞台上で輝く存在感とカリスマ性が強みです。',
    '처녀자리는 수성이 지배하는 흙의 별자리입니다. 분석력과 세심함이 뛰어나며, 완벽을 추구하는 성실한 성향입니다. 실용적이고 논리적인 사고로 문제를 해결하는 능력이 탁월합니다. 지나친 완벽주의와 자기비판에 주의하고, 있는 그대로의 자신을 인정하는 연습이 필요합니다.':'乙女座は水星が支配する土の星座です。分析力と細やかさに優れ、完璧を追求する誠実な性格です。実用的で論理的な思考により問題解決能力が卓越しています。過度な完璧主義や自己批判に注意し、そのままの自分を認める練習が必要です。',
    '천천히 신중하게 마음을 열지만, 한번 사랑에 빠지면 매우 헌신적입니다. 안정적이고 감각적인 사랑을 추구하며, 물질적 표현으로 애정을 드러냅니다.':'ゆっくりと慎重に心を開きますが、一度恋に落ちると非常に献身的です。安定的で感覚的な愛を求め、物質的な表現で愛情を示します。',
    '천칭자리는 금성이 지배하는 바람의 별자리입니다. 균형과 조화를 추구하며, 아름다움과 예술적 감각이 뛰어납니다. 공정함을 중시하고 타인과의 관계에서 외교적 능력을 발휘합니다. 결정을 내리기 어려워하는 우유부단함이 있어, 자신의 내면 목소리를 믿는 연습이 중요합니다.':'天秤座は金星が支配する風の星座です。バランスと調和を追求し、美しさと芸術的感覚に優れています。公平さを重視し、他者との関係で外交的な能力を発揮します。決断が難しい優柔不断さがあり、自分の内なる声を信じる練習が重要です。',
    '첫인상·외면':'第一印象・外見',
    '청년운 (15~35세)':'青年運 (15~35歳)',
    '체계와 성취가 필요한 분야에서 두각을 나타냅니다. 경영, 정치, 금융, 건축, 행정, 공학 분야가 잘 맞습니다. 장기적인 목표를 향해 꾸준히 나아가는 끈기가 강점입니다.':'体系と成果が求められる分野で頭角を現します。経営、政治、金融、建築、行政、工学分野に適しています。長期的な目標に向かって着実に進む粘り強さが強みです。',
    '초년운 (0~15세)':'初年運 (0~15歳)',
    '최고 귀인성, 위기 극복':'最高の貴人性、危機克服',
    '최고의 귀인, 큰 도움과 인복':'最高の貴人、大きな助けと人望',
    '추진력과 결단력이 강하지만 충동적 행동과 대인 갈등에 주의하세요.':'推進力と決断力が強いですが、衝動的な行動や対人トラブルに注意してください。',
    '출생 연도':'出生年',
    '타고난 기질과 성격의 흐름':'生まれ持った気質と性格の流れ',
    '타고난 기질이 매우 조화롭고 균형 잡혀 있습니다. 어떤 환경에서도 자신의 강점을 발휘하며, 주변 사람들에게 긍정적인 영향을 미치는 타고난 리더 기질을 지니고 있습니다. 직관력과 판단력이 뛰어나 중요한 순간에 탁월한 선택을 내립니다.':'生まれ持った気質は非常に調和が取れておりバランスが良いです。どんな環境でも自分の強みを発揮し、周囲の人々に良い影響を与える生まれつきのリーダー気質を持っています。直感力と判断力に優れ、重要な瞬間に卓越した選択をします。',
    '태양 별자리':'太陽星座',
    '토 기운이 과잉되어 정체와 고집을 유발할 수 있습니다. 변화를 두려워하거나 지나치게 보수적인 태도가 기회를 놓치게 합니다. 황토색·중앙 배치를 줄이고 유연한 사고를 키우세요.':'土の気が過剰で停滞や頑固さを引き起こすことがあります。変化を恐れたり過度に保守的な態度はチャンスを逃します。黄土色や中央配置を減らし、柔軟な思考を育てましょう。',
    '하늘의 덕, 재난 소멸':'天の徳、災難消滅',
    '하늘의 덕을 받아 재난과 액운이 자연스럽게 해소됩니다.':'天の徳を受けて災難や凶運が自然に解消されます。',
    '하늘이 내린 귀인으로 어려운 상황에서 도움을 받는 강한 기운입니다.':'天が授けた貴人で、困難な状況で助けを受ける強い気運です。',
    '학문·연구·영성에 관심이 높아지는 시기입니다. 내면을 탐구하고 전문 지식을 쌓기에 좋으며, 예술·의료·종교 분야에서 재능이 발휘됩니다. 고독감이 들 수 있으니 소통을 늘리세요.':'学問・研究・精神性への関心が高まる時期です。内面を探求し専門知識を積むのに良く、芸術・医療・宗教分野で才能が発揮されます。孤独感を感じることがあるので、コミュニケーションを増やしましょう。',
    '학문과 시험의 귀인, 문장 재능':'学問と試験の貴人、文章の才能',
    '학습과 성장, 귀인의 도움을 받는 시기입니다. 자격증 취득이나 학업에 유리하며, 어른이나 스승의 지원을 받을 수 있습니다. 차분하고 신중하게 임하면 좋은 결과를 얻습니다.':'学習と成長、貴人の助けを受ける時期です。資格取得や学業に有利で、大人や師匠の支援を受けられます。落ち着いて慎重に取り組めば良い結果が得られます。',
    '학업·시험 운이 강하고 글재주가 뛰어나 문서·계약에 유리합니다.':'学業・試験運が強く、文章の才能に優れ書類・契約に有利です。',
    '핵심 정체성':'核心のアイデンティティ',
    '행운의 방향':'幸運の方向',
    '행운의 색':'幸運の色',
    '행운의 숫자':'幸運の数字',
    '혁신과 미래를 다루는 분야에서 빛납니다. IT, 과학, 사회운동, 방송, 인도주의 분야가 잘 맞습니다. 독창적인 아이디어와 미래를 내다보는 통찰력이 강점입니다.':'革新と未来を扱う分野で輝きます。IT、科学、社会運動、放送、人道主義分野に適しています。独創的なアイデアと未来を見通す洞察力が強みです。',
    '활동성과 추진력이 강해지는 시기입니다. 재물의 유동성이 크고 인간관계가 넓어집니다. 충동적인 투자나 보증은 피하고 신중한 재무 관리가 필요합니다.':'活動性と推進力が強まる時期です。財の流動性が大きく人間関係が広がります。衝動的な投資や保証は避け、慎重な財務管理が必要です。',
    '활발한 재물 활동과 사교성이 높아지는 시기입니다. 사업 기회나 투자 수익이 생길 수 있으나 변동성도 큽니다. 이성 인연이 활발해지고 대인관계가 넓어집니다.':'活発な財運活動と社交性が高まる時期です。事業機会や投資収益が得られることもありますが変動も大きいです。異性との縁が活発になり対人関係が広がります。',
    '황소자리는 금성이 지배하는 흙의 별자리입니다. 안정과 물질적 풍요를 중시하며, 한번 결정한 것은 끝까지 밀고 나가는 끈기가 있습니다. 감각적인 즐거움과 아름다움을 사랑하며, 신뢰할 수 있는 든든한 파트너입니다. 변화에 저항하는 고집스러운 면이 있어 유연성을 기르는 것이 중요합니다.':'牡牛座は金星が支配する土の星座です。安定と物質的豊かさを重視し、一度決めたことは最後までやり抜く粘り強さがあります。感覚的な楽しみと美しさを愛し、信頼できる頼もしいパートナーです。変化に抵抗する頑固な面があるため、柔軟性を養うことが重要です。',
    '🔮 무료 운세 보기 (사주 · 자미두수 · 점성학)':'🔮 無料運勢を見る (四柱推命 · 紫微斗数 · 占星学)'
  },
  zh: {
    '命宮':['命宫 (命宮)','基本性格与人生核心结构'],
    '兄弟':['兄弟宫 (兄弟宮)','兄弟姐妹·同事的缘分'],
    '夫妻':['夫妻宫 (夫妻宮)','配偶·恋人的缘分'],
    '子女':['子女宫 (子女宮)','子女运与创造性能量'],
    '財帛':['财帛宫 (財帛宮)','财富·收入·金钱流动'],
    '疾厄':['疾厄宫 (疾厄宮)','健康·体质·疾病倾向'],
    '遷移':['迁移宫 (遷移宮)','迁移·海外·外部活动'],
    '交友':['交友宫 (交友宮)','朋友·人脉·社会关系'],
    '官祿':['官禄宫 (官祿宮)','职业·社会成就·名誉'],
    '田宅':['田宅宫 (田宅宮)','房产·居住·家庭环境'],
    '福德':['福德宫 (福德宮)','精神世界·福气·内心幸福'],
    '父母':['父母宫 (父母宮)','父母运·与上级的关系'],
    '현재 나이':'当前年龄',
    '길신':'吉神',
    '긍정적인 기운':'积极的能量',
    '흉신':'凶神',
    '주의가 필요한 기운':'需要注意的能量',
    '중성 신살':'中性神煞',
    '상황에 따라 달라지는 기운':'随情况变化的能量',
    '용신':'用神',
    '희신':'喜神',
    '기신':'忌神',
    '🔮 무료 운세 탭':'🔮 免费运势标签',
    '12운성':'十二长生',
    'today.길(吉)':'today.吉',
    'today.대길(大吉)':'today.大吉',
    'today.소흉(小凶)':'today.小凶',
    'today.평(平)':'today.平',
    'today.흉(凶)':'today.凶',
    '※ 사주·자미두수·점성학 원국과 현재 날짜를 기반으로 자동 계산됩니다. 참고용으로 활용하세요.':'※ 基于四柱·紫微斗数·占星学原局和当前日期自动计算。请作为参考使用。',
    '■ 행운의 색':'■ 幸运色',
    '● 행운의 색':'● 幸运色',
    '✨ 자미두수 12궁 상세 해석':'✨ 紫微斗数十二宫详细解读',
    '✨ 천궁도 행성·하우스·상(Aspect) 분석':'✨ 星盘行星·宫位·相位(Aspect)分析',
    '⭐대길 ✨길 🌀평 ⚡소흉 ⚠️흉 · ● 행운의 색':'⭐大吉 ✨吉 🌀平 ⚡小凶 ⚠️凶 · ● 幸运色',
    '감성·본능':'感性·本能',
    '감성과 영성이 필요한 분야에서 탁월합니다. 예술, 음악, 의료, 상담, 종교, 사진 분야가 잘 맞습니다. 깊은 공감 능력과 창의적 상상력이 강점입니다.':'在需要感性和灵性的领域表现卓越。艺术、音乐、医疗、咨询、宗教、摄影领域非常适合。深厚的共感能力和创造性想象力是优势。',
    '감정과 인연의 에너지':'情感与缘分的能量',
    '감정적 교류에서 어려움이 있을 수 있습니다. 오해나 갈등이 생기기 쉬운 시기이므로 충동적인 감정 표현을 자제하고 신중하게 행동하는 것이 좋습니다. 혼자만의 시간을 통해 감정을 정리하세요.':'情感交流可能会有困难。由于容易产生误会或冲突，建议克制冲动的情绪表达，谨慎行事。通过独处时间整理情绪。',
    '감정적으로 깊이 연결되는 것을 원합니다. 상대를 세심하게 배려하고 보호하려 하며, 가정적인 사랑을 꿈꿉니다. 상처받으면 껍질 속으로 들어가는 경향이 있습니다.':'渴望情感上的深度连接。细心照顾和保护对方，梦想家庭式的爱。受伤时倾向于退回自己的壳中。',
    '강렬한 에너지로 추진력이 강하지만 사고·수술·구설에 주의가 필요합니다.':'拥有强烈的能量和推动力，但需注意事故、手术和口舌是非。',
    '강한 감수성과 예술적 재능을 가지며 이성 관계가 활발합니다.':'具有强烈的感受性和艺术才能，异性关系活跃。',
    '강한 도전과 변화의 시기입니다. 외부 압박이나 경쟁이 심해질 수 있으나, 이를 극복하면 큰 성취를 이룰 수 있습니다. 건강 관리와 법적 문제에 각별히 주의하세요.':'是强烈挑战与变化的时期。外部压力或竞争可能加剧，但克服后可取得巨大成就。请特别注意健康管理和法律问题。',
    '강한 의지, 충동적 행동 주의':'强烈意志，注意冲动行为',
    '강한 의지력, 극단적 기운':'强烈意志力，极端气场',
    '강한 의지와 리더십이 있지만 극단적 상황이 발생할 수 있습니다.':'拥有强烈的意志和领导力，但可能出现极端情况。',
    '건강 상태가 전반적으로 양호합니다. 규칙적인 생활과 적당한 운동으로 현재의 좋은 컨디션을 유지하세요. 스트레스 관리에 신경 쓰면 더욱 활기찬 생활이 가능합니다.':'整体健康状况良好。通过规律生活和适度运动保持当前良好状态。注意压力管理，可过更有活力的生活。',
    '건강 운이 매우 좋지 않은 시기입니다. 만성 질환이 악화되거나 새로운 건강 문제가 발생할 수 있습니다. 즉시 전문의 상담을 받고, 과로와 스트레스를 철저히 피하세요. 몸의 신호에 귀를 기울이는 것이 중요합니다.':'健康运非常不佳的时期。慢性病可能恶化或出现新的健康问题。请立即咨询专业医生，彻底避免过劳和压力。倾听身体信号非常重要。',
    '건강 운이 평범한 편입니다. 특별한 이상은 없지만 과로나 스트레스에 취약할 수 있습니다. 충분한 수면과 균형 잡힌 식사로 기초 체력을 유지하는 것이 중요합니다.':'健康运平凡。无特别异常，但易受过劳和压力影响。保持充足睡眠和均衡饮食以维持基础体力很重要。',
    '건강에 주의가 필요한 시기입니다. 피로 누적이나 소화기 계통의 문제가 생길 수 있습니다. 무리한 활동을 자제하고 정기적인 건강 검진을 받는 것이 좋습니다. 충분한 휴식이 필수입니다.':'需要注意健康的时期。可能出现疲劳积累或消化系统问题。建议避免过度活动，定期体检。充足休息必不可少。',
    '게자리는 달이 지배하는 물의 별자리입니다. 감수성이 풍부하고 직관력이 뛰어나며, 가족과 가정을 무엇보다 소중히 여깁니다. 타인의 감정에 민감하게 반응하는 공감 능력이 탁월합니다. 감정 기복이 있을 수 있으며, 과거에 집착하는 경향을 의식적으로 조절하면 더 성장할 수 있습니다.':'巨蟹座是月亮主宰的水象星座。感受性丰富，直觉力强，最重视家庭和亲情。对他人情绪敏感的共情能力卓越。可能有情绪波动，若有意识地调节对过去的执着，将能获得更大成长。',
    '계산 중 오류가 발생했습니다.':'计算时发生错误。',
    '계산 중… 잠시만 기다려주세요.':'计算中…请稍候。',
    '관재구설과 소송에서 보호받으며 관운이 좋아집니다.':'受到官非口舌和诉讼的保护，官运变好。',
    '균형 잡힌 아름다운 관계를 추구합니다. 로맨틱하고 우아한 사랑을 즐기며, 파트너와의 조화를 중시합니다. 갈등을 피하려는 성향이 있어 솔직한 표현이 필요합니다.':'追求平衡美好的关系。享受浪漫优雅的爱情，重视与伴侣的和谐。倾向于避免冲突，需要坦诚表达。',
    '균형과 조화가 필요한 분야에서 능력을 발휘합니다. 법률, 외교, 디자인, 패션, 상담, 중재 분야가 잘 맞습니다. 공정한 판단력과 미적 감각이 뛰어납니다.':'在需要平衡与和谐的领域发挥能力。法律、外交、设计、时尚、咨询、调解领域适合。具备公正的判断力和出色的审美感。',
    '금 기운이 과잉되어 지나친 냉정함이나 갈등을 일으킬 수 있습니다. 날카로운 언행과 무리한 경쟁을 자제하세요. 금속 소품이나 흰색 계열을 과도하게 사용하면 긴장감이 높아질 수 있습니다.':'金气过剩，可能导致过于冷静或引发冲突。请克制尖锐言行和过度竞争。过度使用金属饰品或白色系会增加紧张感。',
    '금속의 날카로운 기운이 결단력과 재물운을 강화합니다. 서쪽 방향, 흰색·금색 계열이 길하며 계획적인 재테크와 자기 계발이 운을 높입니다. 원칙을 지키는 행동이 신뢰를 쌓습니다.':'金属的锐利之气增强决断力和财运。西方、白色·金色系吉利，有计划的理财和自我提升能提升运势。遵守原则的行为积累信任。',
    '기본 운세':'基本运势',
    '기질의 균형이 무난한 편입니다. 장점과 단점이 공존하며, 환경에 따라 성격 표현이 달라질 수 있습니다. 자신의 강점을 의식적으로 계발하면 더 큰 잠재력을 발휘할 수 있습니다.':'气质平衡较为平稳。优缺点共存，性格表现随环境变化。若有意识地开发自身优势，可发挥更大潜力。',
    '기질적으로 다소 불균형한 면이 있어 감정 기복이나 결정 장애를 경험할 수 있습니다. 자기 이해를 높이고 약점을 보완하는 노력이 필요합니다. 내면의 안정을 찾는 것이 중요한 과제입니다.':'气质上有些不平衡，可能经历情绪波动或决策障碍。需要提升自我理解，弥补弱点。寻找内心安定是重要课题。',
    '깊고 강렬한 사랑을 원합니다. 상대의 영혼까지 알고 싶어하며, 완전한 신뢰와 헌신을 요구합니다. 질투심이 강할 수 있으나, 그만큼 깊이 사랑합니다.':'渴望深刻强烈的爱情。想了解对方灵魂，要求完全信任和奉献。可能嫉妒心强，但爱得深沉。',
    '꿈같은 로맨스를 꿈꿉니다. 상대를 이상화하는 경향이 있으며, 깊은 영혼의 교감을 원합니다. 감정적으로 민감하고 공감 능력이 뛰어나 상대의 마음을 잘 읽습니다.':'梦想如梦般的浪漫。倾向理想化对方，渴望深刻灵魂交流。情感敏感，具备出色的共情能力，能读懂对方心意。',
    '나무 기운이 과잉되어 균형을 흐트러뜨립니다. 지나친 고집이나 무리한 확장을 조심하세요. 동쪽 방향과 초록색 계열을 과도하게 사용하면 에너지 소모가 커질 수 있으니 절제가 필요합니다.':'木气过剩，打破平衡。注意避免过度固执或无理扩张。过度使用东方和绿色系可能消耗大量能量，需节制。',
    '나무의 기운이 부족한 명식에 생기를 불어넣습니다. 성장·창의·도전의 에너지를 보충해 주므로 동쪽 방향, 초록색 계열, 봄철 활동이 길합니다. 새로운 시작이나 사업 확장에 유리한 시기를 잘 활용하세요.':'为木气不足的命式注入生机。补充成长、创造、挑战的能量，东方、绿色系、春季活动吉利。善用有利于新开始或事业扩展的时机。',
    '남':'男',
    '남성':'男性',
    '년주':'年柱',
    '다른 생년월일로 다시 보기':'用其他生辰重新查看',
    '달 별자리':'月星座',
    '당신의 띠는':'你的属相是',
    '대운 (大運)':'大运 (大运)',
    '대지의 안정된 기운이 중심을 잡아줍니다. 중앙·황토색 계열이 길하며 부동산·저축·건강 관리에 집중하면 운이 열립니다. 신뢰와 성실함으로 주변의 지지를 얻는 것이 중요합니다.':'大地稳定的气息稳固中心。中央·黄土色系吉利，专注房地产、储蓄、健康管理可开运。以信赖和诚实赢得周围支持很重要。',
    '대화와 지적 교감을 중시합니다. 다양한 사람에게 관심을 보이지만, 진정한 소울메이트를 찾습니다. 자유로운 관계를 선호하며 구속을 싫어합니다.':'重视对话和智力交流。对各种人感兴趣，但寻找真正的灵魂伴侣。偏好自由关系，讨厌束缚。',
    '독특하고 자유로운 사랑을 원합니다. 친구 같은 파트너를 선호하며, 지적 교감과 공통된 가치관을 중시합니다. 감정적 친밀감보다 정신적 연결을 더 중요하게 여깁니다.':'渴望独特自由的爱情。偏好朋友般的伴侣，重视智力交流和共同价值观。比起情感亲密，更看重精神连接。',
    '독특한 인상':'独特印象',
    '돌봄과 감성이 필요한 분야에서 탁월합니다. 의료, 사회복지, 교육, 요식업, 부동산, 상담 분야가 잘 맞습니다. 사람들의 감정을 이해하고 보살피는 능력이 뛰어납니다.':'在需要关怀和感性的领域表现卓越。医疗、社会福利、教育、餐饮、不动产、咨询领域适合。具备理解和照顾他人情感的能力。',
    '로맨틱하고 극적인 사랑을 즐깁니다. 상대에게 최고의 것을 선사하고 싶어하며, 충성스럽고 열정적인 파트너입니다. 인정받지 못하면 상처를 받습니다.':'享受浪漫且戏剧性的爱情。想为对方献上最好的，是忠诚且热情的伴侣。不被认可时会受伤。',
    '리더십과 추진력이 필요한 분야에서 두각을 나타냅니다. 스포츠, 군경, 기업가, 개척 사업, 응급 의료 분야가 잘 맞습니다. 독립적으로 일하거나 팀을 이끄는 역할이 적합합니다.':'在需要领导力和推动力的领域表现突出。体育、军警、企业家、开拓事业、急救医疗领域适合。适合独立工作或带领团队角色。',
    '말년운 (50세~)':'晚年运 (50岁~)',
    '멤버십 상세 분석':'会员详细分析',
    '멤버십 전용 상세 분석':'会员专用详细分析',
    '명예와 사회적 지위가 높아지는 시기입니다. 조직 내 승진이나 인정을 받을 기회가 생기며, 책임감과 원칙을 중시하게 됩니다. 공직·전문직에서 두각을 나타낼 수 있습니다.':'是荣誉和社会地位提升的时期。出现组织内晋升或认可的机会，重视责任感和原则。可在公务员、专业职场中脱颖而出。',
    '몸과 마음의 균형 에너지':'身心平衡的能量',
    '몸과 마음의 에너지가 매우 충만한 시기입니다. 체력이 넘치고 면역력도 강해 활발한 활동이 가능합니다. 이 시기에 건강한 습관을 정착시키면 오랫동안 좋은 컨디션을 유지할 수 있습니다.':'这是身心能量非常充沛的时期。体力充沛，免疫力强，能够进行活跃的活动。如果在此期间养成健康的习惯，可以长时间保持良好的状态。',
    '무료 운세':'免费运势',
    '물고기자리는 해왕성과 목성이 지배하는 물의 별자리입니다. 예민한 감수성과 깊은 공감 능력, 영적 직관이 뛰어납니다. 예술적 재능과 상상력이 풍부하며, 타인의 고통에 민감하게 반응합니다. 현실과 이상 사이에서 혼란을 겪을 수 있으므로, 경계를 설정하고 자신을 보호하는 것이 중요합니다.':'双鱼座是由海王星和木星主宰的水象星座。具有敏锐的感受力和深厚的共情能力，灵性直觉出众。艺术天赋和想象力丰富，对他人的痛苦反应敏感。可能在现实与理想之间感到困惑，因此设立界限并保护自己非常重要。',
    '물병자리는 천왕성과 토성이 지배하는 바람의 별자리입니다. 독창적이고 혁신적인 사고로 미래를 내다보는 능력이 있습니다. 인류애와 평등을 중시하며, 독립적이고 자유로운 정신을 가지고 있습니다. 감정적 거리감이 있을 수 있으므로, 친밀한 관계에서 따뜻함을 표현하는 연습이 도움이 됩니다.':'水瓶座是由天王星和土星主宰的风象星座。具有独创性和创新思维，能够洞察未来。重视博爱和平等，拥有独立自由的精神。可能存在情感距离感，因此在亲密关系中练习表达温暖会有所帮助。',
    '물의 지혜로운 기운이 지식과 재물의 흐름을 원활하게 합니다. 북쪽 방향, 검정·파란색 계열이 길하며 학업·연구·금융 분야에서 두각을 나타낼 수 있습니다. 유연한 사고로 기회를 포착하세요.':'水的智慧之气使知识和财富的流动顺畅。北方方向，黑色和蓝色系为吉，能够在学业、研究、金融领域表现突出。用灵活的思维抓住机会。',
    '변화와 혁신을 추구하는 시기입니다. 창의적 아이디어가 넘치고 기존 틀을 벗어나려는 욕구가 강해집니다. 직업 변화나 이직을 고려할 수 있으며, 언행에 주의가 필요합니다.':'这是追求变化与创新的时期。创意涌现，强烈渴望打破既有框架。可能考虑职业变动或跳槽，言行需注意。',
    '부귀와 안락의 별, 재물과 명예':'富贵与安逸之星，财富与名誉',
    '분석과 정밀함이 필요한 분야에서 두각을 나타냅니다. 의료, 회계, 연구, 편집, 영양, 품질관리 분야가 잘 맞습니다. 세심한 주의력과 완벽을 추구하는 성향이 강점입니다.':'在需要分析和精密的领域表现突出。适合医疗、会计、研究、编辑、营养、质量管理等领域。细致的注意力和追求完美的性格是优势。',
    '불 기운이 과잉되어 충동적 행동이나 과열을 유발할 수 있습니다. 감정 기복과 급한 결정을 경계하세요. 빨간색 계열과 남쪽 방향을 과도하게 접하면 스트레스가 가중될 수 있습니다.':'火气过盛可能引发冲动行为或过热。注意情绪波动和仓促决定。过度接触红色系和南方方向可能加重压力。',
    '불의 기운으로 열정과 표현력을 강화합니다. 남쪽 방향, 빨간색 계열이 행운을 부르며 인간관계와 명예 운이 상승합니다. 적극적인 자기 표현과 사교 활동이 운을 여는 열쇠입니다.':'火的能量增强热情和表达力。南方方向、红色系带来好运，人际关系和名誉运提升。积极的自我表达和社交活动是开启运势的关键。',
    '사수자리는 목성이 지배하는 불의 별자리입니다. 자유를 사랑하고 철학적 사고와 모험 정신이 넘칩니다. 낙관적이고 유머 감각이 뛰어나며, 다양한 문화와 지식을 탐구하는 것을 즐깁니다. 무책임하거나 직설적인 말로 상처를 줄 수 있으므로, 세심한 배려가 필요합니다.':'射手座是由木星主宰的火象星座。热爱自由，充满哲学思考和冒险精神。乐观且幽默感强，喜欢探索多元文化和知识。可能因不负责任或直率的话语伤害他人，因此需要细心体贴。',
    '사자자리는 태양이 지배하는 불의 별자리입니다. 타고난 리더십과 카리스마로 자연스럽게 주목받습니다. 창의적이고 표현력이 풍부하며, 무대 위에서 빛나는 존재감을 발휘합니다. 자존심이 강하고 인정받고 싶은 욕구가 크므로, 겸손함을 갖추면 더욱 빛납니다.':'狮子座是由太阳主宰的火象星座。天生领导力和魅力，自然吸引关注。富有创造力和表达力，在舞台上展现耀眼存在感。自尊心强，渴望被认可，若能谦逊则更为出众。',
    '사주 · 자미두수 · 점성학 세 시스템 통합 분석 (회원가입 불필요)':'四柱 · 紫微斗数 · 占星学三系统综合分析（无需注册）',
    '사주 원국 기반':'基于四柱原局',
    '사주팔자 · 자미두수 · 천궁도 전체 결과를PDF로 정리하여 제공합니다.':'提供四柱命理 · 紫微斗数 · 天宫图全部结果的PDF整理。',
    '사회적 활동과 성취 흐름':'社会活动与成就流',
    '사회적 활동과 직업 운이 매우 강한 시기입니다. 능력을 인정받고 승진이나 중요한 기회가 찾아올 수 있습니다. 새로운 프로젝트나 도전에 적극적으로 나서면 좋은 결과를 얻을 수 있습니다.':'这是社会活动和职业运势非常强劲的时期。能力受到认可，可能获得晋升或重要机会。积极参与新项目或挑战可获得好结果。',
    '상승궁 (ASC)':'上升宫 (ASC)',
    '생년월일을 입력해주세요.':'请输入出生年月日。',
    '생애 에너지 흐름':'生命能量流',
    '서양 천궁도 분석':'西方天宫图分析',
    '성격과 기질이 안정적으로 발달해 있어 사회적 관계에서 신뢰를 쌓기 쉽습니다. 자신의 감정을 잘 조절하며, 목표를 향해 꾸준히 나아가는 힘이 있습니다. 다양한 상황에서 유연하게 대처하는 능력이 돋보입니다.':'性格和气质稳定发展，易于在社会关系中建立信任。善于调节情绪，有持续向目标前进的力量。应对各种情况的灵活能力突出。',
    '소통과 정보를 다루는 분야에서 빛납니다. 언론, 교육, IT, 마케팅, 작가, 통역 분야가 잘 맞습니다. 다양한 분야를 넘나드는 멀티태스킹 능력이 강점입니다.':'在沟通和信息处理领域表现出色。适合传媒、教育、IT、市场营销、作家、翻译等领域。跨领域多任务处理能力是优势。',
    '수 기운이 과잉되어 우유부단함이나 과도한 걱정을 유발할 수 있습니다. 지나친 분석과 소극적 태도를 경계하세요. 검정·파란색 계열과 북쪽 방향을 과도하게 접하면 에너지가 침체될 수 있습니다.':'水气过盛可能导致优柔寡断或过度担忧。警惕过度分析和消极态度。过度接触黑色、蓝色系和北方方向可能导致能量低迷。',
    '시주':'时柱',
    '신강':'身强',
    '신비롭고 예민한 기운이 강하게 작동할 수 있음':'神秘且敏感的气场可能强烈作用',
    '신약':'身弱',
    '심층 분석과 변화를 다루는 분야에서 탁월합니다. 심리학, 의학, 금융, 탐정, 연구, 위기관리 분야가 잘 맞습니다. 숨겨진 진실을 파헤치는 능력과 강한 집중력이 강점입니다.':'在深层分析与变革领域表现卓越。适合心理学、医学、金融、侦探、研究、危机管理等领域。揭示隐藏真相的能力和强大的专注力是优势。',
    '쌍둥이자리는 수성이 지배하는 바람의 별자리입니다. 지적 호기심이 넘치고 다재다능하며, 소통과 정보 교환에 탁월합니다. 두 가지 상반된 성향이 공존하여 상황에 따라 다른 모습을 보이기도 합니다. 언어 능력과 적응력이 뛰어나 다양한 분야에서 활약할 수 있습니다.':'双子座是由水星主宰的风象星座。充满智力好奇心，多才多艺，擅长沟通和信息交流。两种相反的性格共存，根据情况展现不同面貌。语言能力和适应力出色，能在多个领域活跃。',
    '안정적이고 실용적인 분야에서 능력을 발휘합니다. 금융, 부동산, 요리, 예술, 농업, 건축 분야가 잘 맞습니다. 장기적인 프로젝트를 꾸준히 완성하는 능력이 탁월합니다.':'在稳定且实用的领域发挥能力。金融、房地产、烹饪、艺术、农业、建筑领域非常适合。擅长持续完成长期项目。',
    '안정적인 재물 축적과 내실을 다지는 시기입니다. 꾸준한 노력이 결실을 맺고 저축과 부동산 등 안정적 자산 관리에 유리합니다. 성실하게 임하면 좋은 결과를 얻습니다.':'是稳定财富积累和夯实内在的时期。持续的努力结出成果，有利于储蓄和房地产等稳定资产管理。认真对待会获得好结果。',
    '애정 운이 좋은 편으로, 관계에서 따뜻한 교류가 이루어집니다. 진심 어린 소통이 관계를 더욱 돈독하게 만들어 줍니다. 솔직한 감정 표현이 인연을 발전시키는 열쇠가 됩니다.':'感情运较好，关系中有温暖的交流。真诚的沟通使关系更加稳固。坦率的情感表达是发展缘分的关键。',
    '애정 운이 평범한 편입니다. 특별한 변화보다는 현재 관계를 안정적으로 유지하는 것이 중요합니다. 상대방의 입장을 이해하려는 노력이 관계의 질을 높여줍니다.':'感情运平平。比起特别的变化，更重要的是稳定维持现有关系。努力理解对方立场能提升关系质量。',
    '양자리는 황도 12궁의 첫 번째 별자리로, 화성이 지배하는 불의 별자리입니다. 개척 정신과 추진력이 강하며, 새로운 일을 시작하는 데 탁월한 능력을 발휘합니다. 경쟁심이 강하고 즉흥적인 면이 있어 충동적 결정에 주의가 필요합니다. 리더십이 뛰어나고 용기 있는 행동으로 주변을 이끄는 타입입니다.':'白羊座是黄道十二宫的第一个星座，由火星主宰的火象星座。具有开拓精神和强烈的推动力，擅长开始新事务。竞争心强且有冲动的一面，需注意冲动决策。领导力出众，勇敢的行动带领周围人。',
    '여':'女',
    '여성':'女性',
    '열정과 감정의 기운, 예술적 재능':'热情与情感的气息，艺术才能',
    '열정적이고 직접적으로 감정을 표현합니다. 첫눈에 반하는 경우가 많고, 상대를 적극적으로 리드합니다. 권태기가 오면 새로운 자극이 필요합니다.':'热情且直接表达情感。常有一见钟情的情况，积极引导对方。感到厌倦时需要新的刺激。',
    '염소자리는 토성이 지배하는 흙의 별자리입니다. 책임감이 강하고 목표를 향한 끈기와 실용적 판단력이 탁월합니다. 사회적 성공과 명예를 중시하며, 체계적이고 성실하게 기반을 쌓아갑니다. 감정 표현이 서툴고 지나치게 일에 집중하는 경향이 있어, 휴식과 감정 교류도 중요합니다.':'摩羯座是由土星主宰的土象星座。责任感强，目标坚持力和实用判断力出色。重视社会成功与名誉，系统且诚实地打基础。情感表达笨拙，过度专注工作，休息和情感交流也很重要。',
    '오늘':'今天',
    '오늘의 운세':'今日运势',
    '오행 분포':'五行分布',
    '오행 불균형으로 인해 기질적 갈등이 심할 수 있습니다. 충동적 행동이나 극단적 감정 반응에 주의가 필요합니다. 명상, 규칙적인 생활, 신뢰할 수 있는 조언자의 도움을 받는 것이 도움이 됩니다.':'由于五行失衡，可能存在性格冲突。需注意冲动行为或极端情绪反应。冥想、规律生活、寻求可信赖顾问帮助有益。',
    '올바른 연도를 입력해주세요.':'请输入正确的年份。',
    '완벽한 파트너를 찾기 위해 신중하게 관계를 시작합니다. 실용적이고 헌신적인 사랑을 하며, 세심한 배려로 상대를 돌봅니다. 지나친 비판은 관계를 어렵게 할 수 있습니다.':'为了寻找完美伴侣，谨慎开始关系。实用且奉献的爱情，细心照顾对方。过度批评可能使关系变得困难。',
    '용신 분석':'用神分析',
    '용신을 보조하는 금 기운입니다. 정확하고 체계적인 행동이 운을 뒷받침합니다. 금속 소품이나 흰색 계열 인테리어가 이 기운을 강화하며, 계획적인 생활 패턴이 도움이 됩니다.':'辅助用神的金气。准确且系统的行动支持运势。金属饰品或白色系装饰增强此气，计划性的生活作息有帮助。',
    '용신을 보조하는 나무 기운입니다. 창의적 활동과 인간관계 확장이 간접적으로 운을 돕습니다. 식물 키우기, 등산, 새벽 산책 등 목(木) 기운을 접하는 생활 습관이 에너지를 보충해 줍니다.':'辅助用神的木气。创造性活动和人际关系扩展间接助运。养植物、登山、晨间散步等接触木气的生活习惯补充能量。',
    '용신을 보조하는 불 기운입니다. 밝고 활기찬 환경이 운의 흐름을 원활하게 합니다. 조명이 밝은 공간에서 활동하거나 따뜻한 색상의 소품을 활용하면 보조 에너지가 강화됩니다.':'辅助用神的火气。明亮活泼的环境使运势顺畅。在光线明亮的空间活动或使用暖色系饰品可增强辅助能量。',
    '용신을 보조하는 수 기운입니다. 지식 축적과 내면 성찰이 운을 간접적으로 강화합니다. 독서, 명상, 수영 등 수(水) 기운과 연관된 활동이 보조 에너지를 활성화합니다.':'辅助用神的水气。知识积累和内心反思间接增强运势。阅读、冥想、游泳等与水气相关的活动激活辅助能量。',
    '용신을 보조하는 토 기운입니다. 안정적인 생활 기반이 전체 운을 뒷받침합니다. 규칙적인 식사와 수면, 꾸준한 저축 습관이 이 기운을 활성화하여 운의 토대를 다집니다.':'辅助用神的土气。稳定的生活基础支持整体运势。规律饮食和睡眠、持续储蓄习惯激活此气，奠定运势基础。',
    '운세 지수':'运势指数',
    '운세를 계산하는 중입니다…':'正在计算运势…',
    '월주':'月柱',
    '의료·치유 분야에 재능이 있으며 건강 회복력이 강합니다.':'在医疗·治疗领域有才能，健康恢复力强。',
    '의술과 건강의 별, 치료 능력':'医术与健康之星，治疗能力',
    '이 대운은 천간의 기운이 일간에 영향을 미치는 시기입니다. 해당 십성의 특성을 이해하고 흐름에 맞게 대응하는 것이 중요합니다.':'此大运为天干之气影响日干的时期。理解该十星特性并顺应流向应对很重要。',
    '이성 매력, 예술적 감각':'异性魅力，艺术感',
    '이성에게 매력적으로 보이며 예술·연예 분야에 재능이 있습니다.':'对异性具有吸引力，在艺术·娱乐领域有才能。',
    '인연의 기운이 매우 강하게 흐르고 있습니다. 새로운 만남이나 기존 관계의 깊어짐이 기대되는 시기입니다. 감정 표현이 자연스럽게 이루어지며, 상대방의 마음을 얻기에 유리한 에너지가 충만합니다.':'缘分的气息非常强烈流动。是期待新相遇或现有关系加深的时期。情感表达自然流露，充满有利于获得对方心意的能量。',
    '인연의 흐름이 막혀 있는 시기입니다. 관계에서 상처를 받거나 이별의 아픔을 경험할 수 있습니다. 자신을 먼저 돌보고 내면의 상처를 치유하는 데 집중하는 것이 현명합니다.':'缘分的流动受阻的时期。可能在关系中受到伤害或经历分离的痛苦。明智的是先照顾自己，专注于治愈内心的伤痛。',
    '일간 강약':'日干强弱',
    '일간 강약과 오행 균형':'日干强弱与五行平衡',
    '일생 최고의 귀인을 만나는 기운으로 위기 시 강력한 도움을 받습니다.':'一生中遇见最贵人的气运，在危机时获得强力帮助。',
    '일주':'日柱',
    '일진 분석':'日辰分析',
    '자립심과 독립 의지가 강해지는 시기입니다. 새로운 시작과 자기 계발에 유리하며, 경쟁 속에서 실력을 키울 수 있습니다. 다만 고집이 세질 수 있으니 협력을 잊지 마세요.':'自立心和独立意志增强的时期。利于新的开始和自我提升，在竞争中培养实力。但可能变得固执，切勿忘记合作。',
    '자미두수':'紫微斗数',
    '자유롭고 모험적인 사랑을 즐깁니다. 함께 성장하고 세상을 탐험할 파트너를 원합니다. 구속받는 것을 싫어하며, 정신적 교감을 매우 중시합니다.':'享受自由且冒险的爱情。希望有一起成长、探索世界的伴侣。讨厌被束缚，非常重视精神交流。',
    '자유와 확장이 필요한 분야에서 성공합니다. 교육, 여행, 출판, 법률, 철학, 해외 비즈니스 분야가 잘 맞습니다. 넓은 시야와 낙관적 에너지로 새로운 기회를 만들어냅니다.':'在需要自由与扩展的领域取得成功。教育、旅游、出版、法律、哲学、海外商务领域非常适合。以宽广视野和乐观能量创造新机会。',
    '재물 손실이나 예상치 못한 지출이 발생할 수 있는 시기입니다. 충동적인 소비나 투기적 투자를 자제하고 보수적인 재정 관리가 필요합니다. 보증이나 대출에 특히 주의하세요.':'可能发生财物损失或意外支出的时期。需克制冲动消费和投机性投资，采取保守的财务管理。特别注意担保或贷款。',
    '재물 운이 매우 강하게 흐르고 있습니다. 예상치 못한 수입이나 투자 성과가 기대되는 시기입니다. 재물이 자연스럽게 모이는 흐름이므로 장기적인 재테크 계획을 세우기에 좋은 때입니다.':'财运非常强劲流动。是期待意外收入或投资成果的时期。财物自然聚集，是制定长期理财计划的好时机。',
    '재물 운이 매우 불안정한 시기입니다. 큰 재정적 손실이나 사기 피해의 위험이 있으므로 중요한 금전 거래는 반드시 전문가의 조언을 구하세요. 현금 보유를 늘리고 리스크를 최소화하는 것이 현명합니다.':'财运非常不稳定的时期。存在重大财务损失或诈骗风险，重要金钱交易务必寻求专家建议。增加现金持有，最大限度降低风险是明智之举。',
    '재물 운이 좋은 편입니다. 수입이 안정적으로 유지되며 절약과 투자의 균형을 잘 맞출 수 있습니다. 소소한 재물 기회들이 꾸준히 찾아오는 시기입니다.':'财运较好。收入稳定，能很好地平衡节约与投资。小额财运机会持续出现的时期。',
    '재물 운이 평범한 편입니다. 큰 이익보다는 현재 재정 상태를 안정적으로 유지하는 것이 중요합니다. 불필요한 지출을 줄이고 저축 습관을 기르는 것이 도움이 됩니다.':'财运一般。比起大收益，更重要的是稳定当前财务状况。减少不必要支出，养成储蓄习惯有帮助。',
    '재물과 기회의 흐름':'财物与机遇的流动',
    '재물복과 명예운이 좋아 안정된 삶을 누리는 기운입니다.':'财运与名誉运良好，享受稳定生活的气运。',
    '전갈자리는 명왕성과 화성이 지배하는 물의 별자리입니다. 강렬한 의지와 깊이 있는 통찰력을 가지고 있습니다. 비밀을 잘 지키고 심층적인 진실을 탐구하는 능력이 탁월합니다. 집착과 질투심이 강할 수 있으므로, 신뢰를 바탕으로 한 깊은 관계를 형성하는 것이 중요합니다.':'天蝎座是由冥王星和火星主宰的水象星座。拥有强烈的意志和深刻的洞察力。擅长守秘密和探究深层真相。可能有强烈的执着和嫉妒心，因此建立基于信任的深厚关系非常重要。',
    '점성학':'占星学',
    '중년운 (35~50세)':'中年运（35~50岁）',
    '직관력과 영적 감수성이 뛰어나지만 신경과민·불안 경향에 주의가 필요합니다.':'直觉力和灵性感受力出众，但需注意神经过敏和焦虑倾向。',
    '직업 운이 매우 불안정한 시기입니다. 직장 변동이나 실직의 위험이 있을 수 있으므로 중요한 결정을 미루고 안정을 최우선으로 삼으세요. 신뢰할 수 있는 사람의 조언을 구하는 것이 도움이 됩니다.':'职业运非常不稳定的时期。可能有职场变动或失业风险，重要决策宜推迟，以稳定为首要。寻求可信赖者的建议有帮助。',
    '직업 운이 순조롭게 흐르고 있습니다. 꾸준한 노력이 인정받는 시기로, 동료나 상사와의 관계도 원만합니다. 자신의 전문성을 더욱 갈고닦으면 더 큰 성과를 거둘 수 있습니다.':'职业运顺利流动。是努力得到认可的时期，与同事或上司关系融洽。进一步磨炼专业能力可取得更大成果。',
    '직업 운이 평범한 편입니다. 큰 변화보다는 현재 위치에서 성실하게 임하는 것이 중요합니다. 새로운 기술이나 지식을 습득하여 경쟁력을 높이는 것이 도움이 됩니다.':'职业运一般。比起大变动，更重要的是在现有岗位上认真工作。学习新技能或知识以提升竞争力有帮助。',
    '직업적으로 어려움이 있을 수 있는 시기입니다. 직장 내 갈등이나 업무 부담이 증가할 수 있으므로 신중하게 행동하고 불필요한 마찰을 피하는 것이 좋습니다. 무리한 도전보다 현상 유지에 집중하세요.':'职业上可能遇到困难的时期。职场冲突或工作负担可能增加，应谨慎行事，避免不必要摩擦。专注维持现状胜过盲目挑战。',
    '진지하고 책임감 있는 사랑을 합니다. 장기적인 관계와 안정을 추구하며, 파트너에게 든든한 지원자가 됩니다. 감정 표현이 서툴 수 있으나 깊이 헌신합니다.':'认真且负责任地爱。追求长期关系与稳定，是伴侣坚实的支持者。情感表达可能笨拙，但深度奉献。',
    '창의력과 표현력이 풍부해지는 시기입니다. 재능을 발휘하고 새로운 것을 배우기에 좋으며, 음식·예술·교육 분야에서 기회가 생깁니다. 전반적으로 안정적이고 여유로운 대운입니다.':'创造力和表达力丰富的时期。适合发挥才能和学习新事物，在饮食·艺术·教育领域有机会。整体大运稳定且从容。',
    '창의성과 리더십이 필요한 분야에서 성공합니다. 연예, 예술, 경영, 교육, 정치, 이벤트 기획 분야가 잘 맞습니다. 무대 위에서 빛나는 존재감과 카리스마가 강점입니다.':'在需要创造力和领导力的领域取得成功。娱乐、艺术、经营、教育、政治、活动策划领域非常适合。舞台上的存在感和魅力是优势。',
    '처녀자리는 수성이 지배하는 흙의 별자리입니다. 분석력과 세심함이 뛰어나며, 완벽을 추구하는 성실한 성향입니다. 실용적이고 논리적인 사고로 문제를 해결하는 능력이 탁월합니다. 지나친 완벽주의와 자기비판에 주의하고, 있는 그대로의 자신을 인정하는 연습이 필요합니다.':'处女座是水星主宰的土象星座。分析力和细致性出众，具有追求完美的诚实性格。以实用和逻辑思维解决问题的能力非常卓越。需注意过度完美主义和自我批评，练习接受真实的自己。',
    '천천히 신중하게 마음을 열지만, 한번 사랑에 빠지면 매우 헌신적입니다. 안정적이고 감각적인 사랑을 추구하며, 물질적 표현으로 애정을 드러냅니다.':'慢慢地谨慎地敞开心扉，但一旦坠入爱河则非常专注。追求稳定且感性的爱情，通过物质表达展现爱意。',
    '천칭자리는 금성이 지배하는 바람의 별자리입니다. 균형과 조화를 추구하며, 아름다움과 예술적 감각이 뛰어납니다. 공정함을 중시하고 타인과의 관계에서 외교적 능력을 발휘합니다. 결정을 내리기 어려워하는 우유부단함이 있어, 자신의 내면 목소리를 믿는 연습이 중요합니다.':'天秤座是金星主宰的风象星座。追求平衡与和谐，具有出众的美感和艺术感。重视公正，在与他人的关系中展现外交能力。因优柔寡断而难以做决定，练习相信内心的声音非常重要。',
    '첫인상·외면':'第一印象·外表',
    '청년운 (15~35세)':'青年运 (15~35岁)',
    '체계와 성취가 필요한 분야에서 두각을 나타냅니다. 경영, 정치, 금융, 건축, 행정, 공학 분야가 잘 맞습니다. 장기적인 목표를 향해 꾸준히 나아가는 끈기가 강점입니다.':'在需要体系和成就的领域表现突出。适合经营、政治、金融、建筑、行政、工程领域。坚持不懈地朝长期目标前进是优势。',
    '초년운 (0~15세)':'初年运 (0~15岁)',
    '최고 귀인성, 위기 극복':'最高贵人性，克服危机',
    '최고의 귀인, 큰 도움과 인복':'最强贵人，巨大帮助与人缘',
    '추진력과 결단력이 강하지만 충동적 행동과 대인 갈등에 주의하세요.':'推动力和决断力强，但需注意冲动行为和人际冲突。',
    '출생 연도':'出生年份',
    '타고난 기질과 성격의 흐름':'天生气质与性格的流动',
    '타고난 기질이 매우 조화롭고 균형 잡혀 있습니다. 어떤 환경에서도 자신의 강점을 발휘하며, 주변 사람들에게 긍정적인 영향을 미치는 타고난 리더 기질을 지니고 있습니다. 직관력과 판단력이 뛰어나 중요한 순간에 탁월한 선택을 내립니다.':'天生气质非常和谐且均衡。在任何环境中都能发挥自身优势，具有对周围人产生积极影响的天生领导气质。直觉力和判断力出众，在关键时刻做出卓越选择。',
    '태양 별자리':'太阳星座',
    '토 기운이 과잉되어 정체와 고집을 유발할 수 있습니다. 변화를 두려워하거나 지나치게 보수적인 태도가 기회를 놓치게 합니다. 황토색·중앙 배치를 줄이고 유연한 사고를 키우세요.':'土气过盛可能导致停滞和固执。害怕变化或过于保守的态度会错失机会。减少黄土色·中央布局，培养灵活思维。',
    '하늘의 덕, 재난 소멸':'天赐德，灾难消除',
    '하늘의 덕을 받아 재난과 액운이 자연스럽게 해소됩니다.':'接受天赐德，灾难和厄运自然消除。',
    '하늘이 내린 귀인으로 어려운 상황에서 도움을 받는 강한 기운입니다.':'天降贵人，是在困难情况下获得帮助的强大气场。',
    '학문·연구·영성에 관심이 높아지는 시기입니다. 내면을 탐구하고 전문 지식을 쌓기에 좋으며, 예술·의료·종교 분야에서 재능이 발휘됩니다. 고독감이 들 수 있으니 소통을 늘리세요.':'是对学问·研究·灵性兴趣增强的时期。适合探索内心和积累专业知识，在艺术·医疗·宗教领域展现才能。可能感到孤独，建议增加交流。',
    '학문과 시험의 귀인, 문장 재능':'学问与考试贵人，文字才能',
    '학습과 성장, 귀인의 도움을 받는 시기입니다. 자격증 취득이나 학업에 유리하며, 어른이나 스승의 지원을 받을 수 있습니다. 차분하고 신중하게 임하면 좋은 결과를 얻습니다.':'是学习与成长、获得贵人帮助的时期。利于取得资格证书或学业，能获得长辈或师长支持。沉着谨慎地应对可获得好结果。',
    '학업·시험 운이 강하고 글재주가 뛰어나 문서·계약에 유리합니다.':'学业·考试运强，文字才能出众，有利于文书·合同。',
    '핵심 정체성':'核心身份',
    '행운의 방향':'幸运方向',
    '행운의 색':'幸运色',
    '행운의 숫자':'幸运数字',
    '혁신과 미래를 다루는 분야에서 빛납니다. IT, 과학, 사회운동, 방송, 인도주의 분야가 잘 맞습니다. 독창적인 아이디어와 미래를 내다보는 통찰력이 강점입니다.':'在创新与未来领域闪耀。适合IT、科学、社会运动、广播、人道主义领域。独创性想法和洞察未来的能力是优势。',
    '활동성과 추진력이 강해지는 시기입니다. 재물의 유동성이 크고 인간관계가 넓어집니다. 충동적인 투자나 보증은 피하고 신중한 재무 관리가 필요합니다.':'是活跃性和推动力增强的时期。财富流动性大，人际关系广。避免冲动投资或担保，需要谨慎理财。',
    '활발한 재물 활동과 사교성이 높아지는 시기입니다. 사업 기회나 투자 수익이 생길 수 있으나 변동성도 큽니다. 이성 인연이 활발해지고 대인관계가 넓어집니다.':'是财富活动活跃和社交性增强的时期。可能出现商业机会或投资收益，但波动也大。异性缘活跃，人际关系广泛。',
    '황소자리는 금성이 지배하는 흙의 별자리입니다. 안정과 물질적 풍요를 중시하며, 한번 결정한 것은 끝까지 밀고 나가는 끈기가 있습니다. 감각적인 즐거움과 아름다움을 사랑하며, 신뢰할 수 있는 든든한 파트너입니다. 변화에 저항하는 고집스러운 면이 있어 유연성을 기르는 것이 중요합니다.':'金牛座是金星主宰的土象星座。重视稳定和物质富足，具有一旦决定就坚持到底的韧性。热爱感官享受和美丽，是值得信赖的坚实伙伴。因抵抗变化而固执，培养灵活性很重要。',
    '🔮 무료 운세 보기 (사주 · 자미두수 · 점성학)':'🔮 免费查看运势 (四柱 · 紫微斗数 · 占星学)'
  },
  es: {
    '命宮':['Palacio Vida (命宮)','Personalidad central y estructura de vida'],
    '兄弟':['Palacio Hermanos (兄弟宮)','Hermanos y compañeros'],
    '夫妻':['Palacio Cónyuge (夫妻宮)','Cónyuge y relaciones románticas'],
    '子女':['Palacio Hijos (子女宮)','Fortuna de hijos y energía creativa'],
    '財帛':['Palacio Riqueza (財帛宮)','Riqueza, ingresos y flujo financiero'],
    '疾厄':['Palacio Salud (疾厄宮)','Salud, constitución y tendencias de enfermedad'],
    '遷移':['Palacio Viajes (遷移宮)','Viajes, extranjero y actividades externas'],
    '交友':['Palacio Amigos (交友宮)','Amigos, redes y relaciones sociales'],
    '官祿':['Palacio Carrera (官祿宮)','Carrera, logros sociales y honor'],
    '田宅':['Palacio Hogar (田宅宮)','Bienes raíces, vivienda y entorno familiar'],
    '福德':['Palacio Fortuna (福德宮)','Mundo interior, bendiciones y felicidad interna'],
    '父母':['Palacio Padres (父母宮)','Fortuna de padres y relaciones con superiores'],
    '현재 나이':'Edad Actual',
    '길신':'Estrellas Auspiciosas',
    '긍정적인 기운':'Energía positiva',
    '흉신':'Estrellas Inauspiciosas',
    '주의가 필요한 기운':'Energía que requiere precaución',
    '중성 신살':'Estrellas Neutrales',
    '상황에 따라 달라지는 기운':'Energía que varía según la situación',
    '용신':'Elemento Favorable',
    '희신':'Elemento de Apoyo',
    '기신':'Elemento Desfavorable',
    '신강(身强)':'Maestro Fuerte (身强)',
    '신약(身弱)':'Maestro Débil (身弱)',
    '중화(中和)':'Maestro Equilibrado (中和)',
    '지난 대운':'Ciclo Pasado',
    '미래 대운':'Ciclo Futuro',
    '현재 대운':'Ciclo Actual',
    '무료 해석':'Lectura Gratuita',
    '핵심 3궁':'3 Palacios Principales',
    '핵심 3요소':'3 Elementos Principales',
    '멤버십 전용':'Solo Membresía',
    '나머지 9궁':'9 Palacios Restantes',
    '상세 해석 제공':'Análisis Detallado Disponible',
    '각 신살의 연애·직업·건강 영역별 심층 분석, AI 종합 해석을 멤버십에서 확인하세요.':'Análisis profundo de cada estrella en amor, carrera y salud. Interpretación IA disponible para miembros.',
    '멤버십에서 상세 해석 확인':'Ver análisis completo en Membresía',
    '공궁':'Palacio Vacío',
    '멤버십 전용 · 자미두수 12궁 완전 해석':'Solo Miembros · Lectura completa Zi Wei 12 Palacios',
    '형제·자녀·질액·천이·교우·관록·전택·복덕·부모궁 + 사화 분석 + 대운·유년 연계 해석을 멤버십에서 확인하세요.':'Palacios de Hermanos, Hijos, Salud, Viajes, Amigos, Carrera, Hogar, Fortuna y Padres + Análisis de Cuatro Transformaciones + ciclos mayores, disponibles para miembros.',
    '멤버십 전용 · 심층 점성술 완전 해석':'Solo Miembros · Astrología Completa',
    '점성술 멤버십 배너 설명':'Carta Natal · Tránsitos · Retorno Solar · Astrología Psicológica · Carrera, Riqueza y Amor · Sinastría · Astrocartografía y más — disponible para miembros.',
    "네이탈 차트 완전 해석":"Carta Natal Completa",
    "심리 점성학":"Astrología Psicológica",
    "직업운 심층 해석":"Carrera en Profundidad",
    "재물운 심층 해석":"Riqueza en Profundidad",
    "연애·결혼운 심층 해석":"Amor y Matrimonio en Profundidad",
    "트랜짓 미래운":"Tránsitos Futuros",
    "솔라 리턴 (생일 1년 운세)":"Retorno Solar (Fortuna Anual)",
    "프로그레션 (내면 성장)":"Progresiones (Crecimiento Interior)",
    "시나스트리 궁합":"Sinastría de Compatibilidad",
    "컴포지트 관계 차트":"Carta Compuesta",
    "아스트로카토그래피":"Astrocartografía",
    "건강 점성학":"Astrología Médica",
    "카르마·영혼 해석":"Lectura de Karma y Alma",
    "역행 행성 해석":"Planetas Retrógrados",
    "12하우스 전체 해석":"Lectura de 12 Casas",
    "행성 각도 심층 해석":"Aspectos Planetarios",
    "태양·달·상승궁·10행성 전체 분석, 하우스 배치, 행성 각도 해석":"Sol, Luna, Ascendente, 10 planetas, casas y aspectos",
    "내면 상처, 반복 패턴, 불안 원인, 자기방어 방식, 치유 방향":"Heridas internas, patrones repetitivos, raíces de ansiedad y camino de sanación",
    "10하우스·MC·6하우스 분석, 적합 직종, 커리어 전환 시기, 승진운":"Casas 10/MC/6, carreras adecuadas, cambio de carrera y ascenso",
    "2·8하우스 분석, 수입 방식, 투자 성향, 배우자 재산, 상속·대출":"Casas 2/8, ingresos, inversión, riqueza del cónyuge, herencia y préstamos",
    "금성·화성·7하우스 분석, 배우자상, 결혼 시기, 이별 패턴":"Venus/Marte/Casa 7, pareja ideal, matrimonio y rupturas",
    "현재 행성이 내 차트에 주는 영향, 올해 운세, 직업·연애·재물 변화 시기":"Influencias planetarias actuales, fortuna anual y momentos de cambio",
    "생일부터 다음 생일까지 핵심 주제, 직업·연애·재물·건강운":"Temas clave de cumpleaños a cumpleaños: carrera, amor, riqueza y salud",
    "진행 태양·달·금성으로 보는 심리적 변화와 인생 단계 흐름":"Evolución psicológica y etapas vitales a través del Sol, Luna y Venus progresados",
    "두 사람 차트 비교, 감정·대화·성적 끌림·결혼 안정성 분석":"Comparación de dos cartas: atracción emocional, comunicativa y estabilidad",
    "두 사람이 만들어낸 관계 자체의 운명, 목적, 장기성 분석":"Destino, propósito y potencial de la relación en sí misma",
    "지역별 운세, 이민·유학·사업·연애에 유리한 나라와 도시":"Fortuna regional: mejores países y ciudades para vivir, estudiar y trabajar",
    "취약 신체 부위, 건강 경향, 별자리별 주의 질환 분석":"Áreas corporales vulnerables, tendencias de salud y enfermedades por signo",
    "북쪽·남쪽 노드, 키론, 전생 패턴, 이번 생의 영혼 과제":"Nodos Norte/Sur, Quirón, vidas pasadas y misión del alma",
    "출생차트 역행 행성의 내면화된 에너지와 특수 재능 분석":"Energía internalizada y talentos especiales de planetas retrógrados natales",
    "인생 12개 분야(자아·재물·형제·가정·연애·건강·결혼·변화·철학·직업·인맥·영성)":"Las 12 áreas: yo, riqueza, hermanos, hogar, amor, salud, matrimonio, cambio, filosofía, carrera, redes y espíritu",
    "합·섹스타일·스퀘어·트라인·오포지션 전체 각도 분석":"Análisis completo de conjunción, sextil, cuadratura, trígono y oposición",
    '멤버십 전용 · 심층 점성술 해석':'Solo Miembros · Astrología en Profundidad',
    '띠 입니다':'Signo Zodiacal',
    '🔮 무료 운세 탭':'🔮 Pestaña de Fortuna Gratis',
    '12운성':'Doce Etapas de Vida',
    'today.길(吉)':'today.Fortuna',
    'today.대길(大吉)':'today.Gran Fortuna',
    'today.소흉(小凶)':'today.Pequeña Desgracia',
    'today.평(平)':'today.Neutral',
    'today.흉(凶)':'today.Desgracia',
    '※ 사주·자미두수·점성학 원국과 현재 날짜를 기반으로 자동 계산됩니다. 참고용으로 활용하세요.':'※ Se calcula automáticamente basado en 사주·자미두수·astrología natal y la fecha actual. Úselo solo como referencia.',
    '■ 행운의 색':'■ Color de la Suerte',
    '● 행운의 색':'● Color de la Suerte',
    '✨ 자미두수 12궁 상세 해석':'✨ Interpretación Detallada de las 12 Casas de 자미두수',
    '✨ 천궁도 행성·하우스·상(Aspect) 분석':'✨ Análisis de Planetas, Casas y Aspectos en Carta Natal',
    '⭐대길 ✨길 🌀평 ⚡소흉 ⚠️흉 · ● 행운의 색':'⭐Gran Fortuna ✨Fortuna 🌀Neutral ⚡Pequeña Desgracia ⚠️Desgracia · ● Color de la Suerte',
    '감성·본능':'Emoción e Instinto',
    '감성과 영성이 필요한 분야에서 탁월합니다. 예술, 음악, 의료, 상담, 종교, 사진 분야가 잘 맞습니다. 깊은 공감 능력과 창의적 상상력이 강점입니다.':'Sobresale en áreas que requieren sensibilidad y espiritualidad. Son adecuadas las artes, música, medicina, asesoramiento, religión y fotografía. La profunda empatía y la imaginación creativa son sus fortalezas.',
    '감정과 인연의 에너지':'Energía de Emociones y Relaciones',
    '감정적 교류에서 어려움이 있을 수 있습니다. 오해나 갈등이 생기기 쉬운 시기이므로 충동적인 감정 표현을 자제하고 신중하게 행동하는 것이 좋습니다. 혼자만의 시간을 통해 감정을 정리하세요.':'Puede haber dificultades en el intercambio emocional. Es una época propensa a malentendidos o conflictos, por lo que es recomendable controlar las expresiones impulsivas y actuar con cautela. Organice sus emociones en tiempo a solas.',
    '감정적으로 깊이 연결되는 것을 원합니다. 상대를 세심하게 배려하고 보호하려 하며, 가정적인 사랑을 꿈꿉니다. 상처받으면 껍질 속으로 들어가는 경향이 있습니다.':'Desea una conexión emocional profunda. Cuida y protege al otro con atención, soñando con un amor hogareño. Tiende a encerrarse en su caparazón cuando se hiere.',
    '강렬한 에너지로 추진력이 강하지만 사고·수술·구설에 주의가 필요합니다.':'Tiene una fuerte energía y gran impulso, pero debe tener cuidado con accidentes, cirugías y controversias.',
    '강한 감수성과 예술적 재능을 가지며 이성 관계가 활발합니다.':'Posee alta sensibilidad y talento artístico, y mantiene relaciones activas con el sexo opuesto.',
    '강한 도전과 변화의 시기입니다. 외부 압박이나 경쟁이 심해질 수 있으나, 이를 극복하면 큰 성취를 이룰 수 있습니다. 건강 관리와 법적 문제에 각별히 주의하세요.':'Es un período de fuertes desafíos y cambios. La presión externa o la competencia pueden intensificarse, pero superarlos traerá grandes logros. Preste especial atención a la salud y asuntos legales.',
    '강한 의지, 충동적 행동 주의':'Voluntad fuerte, cuidado con acciones impulsivas',
    '강한 의지력, 극단적 기운':'Voluntad fuerte, energía extrema',
    '강한 의지와 리더십이 있지만 극단적 상황이 발생할 수 있습니다.':'Tiene fuerte voluntad y liderazgo, pero pueden surgir situaciones extremas.',
    '건강 상태가 전반적으로 양호합니다. 규칙적인 생활과 적당한 운동으로 현재의 좋은 컨디션을 유지하세요. 스트레스 관리에 신경 쓰면 더욱 활기찬 생활이 가능합니다.':'El estado de salud es generalmente bueno. Mantenga la buena condición actual con una vida regular y ejercicio moderado. Controlar el estrés permitirá una vida más vigorosa.',
    '건강 운이 매우 좋지 않은 시기입니다. 만성 질환이 악화되거나 새로운 건강 문제가 발생할 수 있습니다. 즉시 전문의 상담을 받고, 과로와 스트레스를 철저히 피하세요. 몸의 신호에 귀를 기울이는 것이 중요합니다.':'Es un período con muy mala suerte en salud. Las enfermedades crónicas pueden empeorar o surgir nuevos problemas. Consulte a un especialista inmediatamente y evite el exceso de trabajo y el estrés. Es importante escuchar las señales del cuerpo.',
    '건강 운이 평범한 편입니다. 특별한 이상은 없지만 과로나 스트레스에 취약할 수 있습니다. 충분한 수면과 균형 잡힌 식사로 기초 체력을 유지하는 것이 중요합니다.':'La suerte en salud es promedio. No hay anomalías especiales, pero puede ser vulnerable al exceso de trabajo o estrés. Es importante mantener la fuerza básica con suficiente sueño y una dieta equilibrada.',
    '건강에 주의가 필요한 시기입니다. 피로 누적이나 소화기 계통의 문제가 생길 수 있습니다. 무리한 활동을 자제하고 정기적인 건강 검진을 받는 것이 좋습니다. 충분한 휴식이 필수입니다.':'Es un período que requiere atención a la salud. Puede acumular fatiga o tener problemas digestivos. Es recomendable evitar actividades excesivas y realizar chequeos regulares. El descanso suficiente es esencial.',
    '게자리는 달이 지배하는 물의 별자리입니다. 감수성이 풍부하고 직관력이 뛰어나며, 가족과 가정을 무엇보다 소중히 여깁니다. 타인의 감정에 민감하게 반응하는 공감 능력이 탁월합니다. 감정 기복이 있을 수 있으며, 과거에 집착하는 경향을 의식적으로 조절하면 더 성장할 수 있습니다.':'Cáncer es un signo de agua regido por la luna. Tiene gran sensibilidad e intuición, y valora la familia y el hogar por encima de todo. Posee una excelente empatía que responde con sensibilidad a las emociones ajenas. Puede tener altibajos emocionales y crecerá más si controla conscientemente la tendencia a aferrarse al pasado.',
    '계산 중 오류가 발생했습니다.':'Se produjo un error durante el cálculo.',
    '계산 중… 잠시만 기다려주세요.':'Calculando… por favor espere un momento.',
    '관재구설과 소송에서 보호받으며 관운이 좋아집니다.':'Se protege de disputas legales y pleitos, y la suerte en la carrera mejora.',
    '균형 잡힌 아름다운 관계를 추구합니다. 로맨틱하고 우아한 사랑을 즐기며, 파트너와의 조화를 중시합니다. 갈등을 피하려는 성향이 있어 솔직한 표현이 필요합니다.':'Busca relaciones hermosas y equilibradas. Disfruta de un amor romántico y elegante, y valora la armonía con su pareja. Tiene tendencia a evitar conflictos, por lo que se necesita una expresión honesta.',
    '균형과 조화가 필요한 분야에서 능력을 발휘합니다. 법률, 외교, 디자인, 패션, 상담, 중재 분야가 잘 맞습니다. 공정한 판단력과 미적 감각이 뛰어납니다.':'Demuestra habilidades en áreas que requieren equilibrio y armonía. Se adapta bien a los campos de derecho, diplomacia, diseño, moda, asesoramiento y mediación. Posee un juicio justo y un sentido estético sobresaliente.',
    '금 기운이 과잉되어 지나친 냉정함이나 갈등을 일으킬 수 있습니다. 날카로운 언행과 무리한 경쟁을 자제하세요. 금속 소품이나 흰색 계열을 과도하게 사용하면 긴장감이 높아질 수 있습니다.':'El exceso de energía metal puede causar frialdad excesiva o conflictos. Controle el lenguaje afilado y la competencia desmedida. El uso excesivo de objetos metálicos o colores blancos puede aumentar la tensión.',
    '금속의 날카로운 기운이 결단력과 재물운을 강화합니다. 서쪽 방향, 흰색·금색 계열이 길하며 계획적인 재테크와 자기 계발이 운을 높입니다. 원칙을 지키는 행동이 신뢰를 쌓습니다.':'La energía aguda del metal fortalece la determinación y la fortuna material. La dirección oeste y los colores blanco y dorado son auspiciosos, y la gestión financiera planificada y el desarrollo personal aumentan la suerte. Actuar con principios construye confianza.',
    '기본 운세':'Fortuna Básica',
    '기질의 균형이 무난한 편입니다. 장점과 단점이 공존하며, 환경에 따라 성격 표현이 달라질 수 있습니다. 자신의 강점을 의식적으로 계발하면 더 큰 잠재력을 발휘할 수 있습니다.':'El equilibrio del temperamento es moderado. Con coexistencia de fortalezas y debilidades, la expresión de la personalidad puede variar según el entorno. Desarrollar conscientemente sus fortalezas puede liberar un mayor potencial.',
    '기질적으로 다소 불균형한 면이 있어 감정 기복이나 결정 장애를 경험할 수 있습니다. 자기 이해를 높이고 약점을 보완하는 노력이 필요합니다. 내면의 안정을 찾는 것이 중요한 과제입니다.':'Existe cierto desequilibrio en el temperamento que puede causar altibajos emocionales o dificultades para tomar decisiones. Es necesario aumentar la auto comprensión y trabajar en compensar las debilidades. Encontrar estabilidad interior es una tarea importante.',
    '깊고 강렬한 사랑을 원합니다. 상대의 영혼까지 알고 싶어하며, 완전한 신뢰와 헌신을 요구합니다. 질투심이 강할 수 있으나, 그만큼 깊이 사랑합니다.':'Desea un amor profundo e intenso. Quiere conocer hasta el alma de la pareja y exige completa confianza y dedicación. Puede ser muy celoso, pero ama con igual profundidad.',
    '꿈같은 로맨스를 꿈꿉니다. 상대를 이상화하는 경향이 있으며, 깊은 영혼의 교감을 원합니다. 감정적으로 민감하고 공감 능력이 뛰어나 상대의 마음을 잘 읽습니다.':'Sueña con un romance de ensueño. Tiende a idealizar a la pareja y desea una profunda conexión espiritual. Es emocionalmente sensible y tiene gran capacidad de empatía para entender el corazón del otro.',
    '나무 기운이 과잉되어 균형을 흐트러뜨립니다. 지나친 고집이나 무리한 확장을 조심하세요. 동쪽 방향과 초록색 계열을 과도하게 사용하면 에너지 소모가 커질 수 있으니 절제가 필요합니다.':'El exceso de energía madera desequilibra. Cuidado con la terquedad excesiva o la expansión desmedida. El uso excesivo de la dirección este y colores verdes puede causar gran desgaste energético, por lo que se requiere moderación.',
    '나무의 기운이 부족한 명식에 생기를 불어넣습니다. 성장·창의·도전의 에너지를 보충해 주므로 동쪽 방향, 초록색 계열, 봄철 활동이 길합니다. 새로운 시작이나 사업 확장에 유리한 시기를 잘 활용하세요.':'Inyecta vitalidad a un destino con falta de energía madera. Suple energía de crecimiento, creatividad y desafío, por lo que la dirección este, colores verdes y actividades primaverales son auspiciosas. Aproveche bien los períodos favorables para nuevos comienzos o expansión de negocios.',
    '남':'Hombre',
    '남성':'Hombre',
    '년주':'Pilar Año',
    '다른 생년월일로 다시 보기':'Ver de nuevo con otra fecha de nacimiento',
    '달 별자리':'Signo Lunar',
    '당신의 띠는':'Tu signo zodiacal es',
    '대운 (大運)':'Gran Ciclo (大運)',
    '대지의 안정된 기운이 중심을 잡아줍니다. 중앙·황토색 계열이 길하며 부동산·저축·건강 관리에 집중하면 운이 열립니다. 신뢰와 성실함으로 주변의 지지를 얻는 것이 중요합니다.':'La energía estable de la tierra centra el equilibrio. La dirección central y los colores tierra amarillentos son auspiciosos, y concentrarse en bienes raíces, ahorros y cuidado de la salud abre la suerte. Es importante ganar apoyo con confianza y sinceridad.',
    '대화와 지적 교감을 중시합니다. 다양한 사람에게 관심을 보이지만, 진정한 소울메이트를 찾습니다. 자유로운 관계를 선호하며 구속을 싫어합니다.':'Valora la comunicación y la conexión intelectual. Muestra interés en diversas personas, pero busca un alma gemela verdadera. Prefiere relaciones libres y odia las ataduras.',
    '독특하고 자유로운 사랑을 원합니다. 친구 같은 파트너를 선호하며, 지적 교감과 공통된 가치관을 중시합니다. 감정적 친밀감보다 정신적 연결을 더 중요하게 여깁니다.':'Desea un amor único y libre. Prefiere una pareja tipo amigo y valora la conexión intelectual y valores compartidos. Considera más importante la conexión mental que la intimidad emocional.',
    '독특한 인상':'Impresión Única',
    '돌봄과 감성이 필요한 분야에서 탁월합니다. 의료, 사회복지, 교육, 요식업, 부동산, 상담 분야가 잘 맞습니다. 사람들의 감정을 이해하고 보살피는 능력이 뛰어납니다.':'Sobresale en áreas que requieren cuidado y sensibilidad. Se adapta bien a medicina, bienestar social, educación, gastronomía, bienes raíces y asesoramiento. Tiene gran capacidad para entender y cuidar las emociones de las personas.',
    '로맨틱하고 극적인 사랑을 즐깁니다. 상대에게 최고의 것을 선사하고 싶어하며, 충성스럽고 열정적인 파트너입니다. 인정받지 못하면 상처를 받습니다.':'Disfruta de un amor romántico y dramático. Quiere ofrecer lo mejor a la pareja y es un compañero leal y apasionado. Se hiere si no es reconocido.',
    '리더십과 추진력이 필요한 분야에서 두각을 나타냅니다. 스포츠, 군경, 기업가, 개척 사업, 응급 의료 분야가 잘 맞습니다. 독립적으로 일하거나 팀을 이끄는 역할이 적합합니다.':'Destaca en áreas que requieren liderazgo y empuje. Se adapta bien a deportes, fuerzas armadas y policiales, emprendimiento, negocios pioneros y emergencias médicas. Es adecuado para trabajar de forma independiente o liderar equipos.',
    '말년운 (50세~)':'Suerte en la Vejez (desde 50 años)',
    '멤버십 상세 분석':'Análisis Detallado de Membresía',
    '멤버십 전용 상세 분석':'Análisis Detallado Exclusivo para Membresía',
    '명예와 사회적 지위가 높아지는 시기입니다. 조직 내 승진이나 인정을 받을 기회가 생기며, 책임감과 원칙을 중시하게 됩니다. 공직·전문직에서 두각을 나타낼 수 있습니다.':'Es un período en el que aumentan el honor y el estatus social. Surgen oportunidades de ascenso o reconocimiento en la organización, y se valoran la responsabilidad y los principios. Puede destacar en cargos públicos o profesiones especializadas.',
    '몸과 마음의 균형 에너지':'Energía equilibrada del cuerpo y la mente',
    '몸과 마음의 에너지가 매우 충만한 시기입니다. 체력이 넘치고 면역력도 강해 활발한 활동이 가능합니다. 이 시기에 건강한 습관을 정착시키면 오랫동안 좋은 컨디션을 유지할 수 있습니다.':'Es un período en que la energía del cuerpo y la mente está muy llena. La resistencia física es abundante y la inmunidad es fuerte, lo que permite actividades activas. Si estableces hábitos saludables en este período, podrás mantener una buena condición durante mucho tiempo.',
    '무료 운세':'Lectura Gratuita',
    '물고기자리는 해왕성과 목성이 지배하는 물의 별자리입니다. 예민한 감수성과 깊은 공감 능력, 영적 직관이 뛰어납니다. 예술적 재능과 상상력이 풍부하며, 타인의 고통에 민감하게 반응합니다. 현실과 이상 사이에서 혼란을 겪을 수 있으므로, 경계를 설정하고 자신을 보호하는 것이 중요합니다.':'Piscis es un signo de agua gobernado por Neptuno y Júpiter. Posee una sensibilidad aguda, profunda empatía e intuición espiritual destacadas. Tiene talento artístico y una imaginación rica, y responde con sensibilidad al sufrimiento de los demás. Puede experimentar confusión entre la realidad y el ideal, por lo que es importante establecer límites y protegerse a sí mismo.',
    '물병자리는 천왕성과 토성이 지배하는 바람의 별자리입니다. 독창적이고 혁신적인 사고로 미래를 내다보는 능력이 있습니다. 인류애와 평등을 중시하며, 독립적이고 자유로운 정신을 가지고 있습니다. 감정적 거리감이 있을 수 있으므로, 친밀한 관계에서 따뜻함을 표현하는 연습이 도움이 됩니다.':'Acuario es un signo de aire gobernado por Urano y Saturno. Tiene la capacidad de prever el futuro con un pensamiento original e innovador. Valora la humanidad y la igualdad, y posee un espíritu independiente y libre. Puede haber distancia emocional, por lo que practicar expresar calidez en relaciones íntimas es útil.',
    '물의 지혜로운 기운이 지식과 재물의 흐름을 원활하게 합니다. 북쪽 방향, 검정·파란색 계열이 길하며 학업·연구·금융 분야에서 두각을 나타낼 수 있습니다. 유연한 사고로 기회를 포착하세요.':'La sabia energía del agua facilita el flujo de conocimiento y riqueza. La dirección norte y los tonos negro y azul son auspiciosos, y puedes destacar en áreas de estudio, investigación y finanzas. Captura oportunidades con un pensamiento flexible.',
    '변화와 혁신을 추구하는 시기입니다. 창의적 아이디어가 넘치고 기존 틀을 벗어나려는 욕구가 강해집니다. 직업 변화나 이직을 고려할 수 있으며, 언행에 주의가 필요합니다.':'Es un período para buscar cambio e innovación. Las ideas creativas abundan y el deseo de salir de los moldes existentes se intensifica. Puedes considerar un cambio de trabajo o empleo, y es necesario tener cuidado con tus palabras y acciones.',
    '부귀와 안락의 별, 재물과 명예':'Estrella de riqueza y confort, dinero y honor',
    '분석과 정밀함이 필요한 분야에서 두각을 나타냅니다. 의료, 회계, 연구, 편집, 영양, 품질관리 분야가 잘 맞습니다. 세심한 주의력과 완벽을 추구하는 성향이 강점입니다.':'Destacas en campos que requieren análisis y precisión. Son adecuados los sectores de medicina, contabilidad, investigación, edición, nutrición y control de calidad. La atención meticulosa y la búsqueda de la perfección son fortalezas.',
    '불 기운이 과잉되어 충동적 행동이나 과열을 유발할 수 있습니다. 감정 기복과 급한 결정을 경계하세요. 빨간색 계열과 남쪽 방향을 과도하게 접하면 스트레스가 가중될 수 있습니다.':'El exceso de energía de fuego puede provocar comportamientos impulsivos o sobrecalentamiento. Ten cuidado con los altibajos emocionales y decisiones apresuradas. El contacto excesivo con tonos rojos y la dirección sur puede aumentar el estrés.',
    '불의 기운으로 열정과 표현력을 강화합니다. 남쪽 방향, 빨간색 계열이 행운을 부르며 인간관계와 명예 운이 상승합니다. 적극적인 자기 표현과 사교 활동이 운을 여는 열쇠입니다.':'La energía del fuego fortalece la pasión y la expresividad. La dirección sur y los tonos rojos atraen la fortuna, elevando la suerte en relaciones humanas y honor. La autoexpresión activa y las actividades sociales son la clave para abrir la suerte.',
    '사수자리는 목성이 지배하는 불의 별자리입니다. 자유를 사랑하고 철학적 사고와 모험 정신이 넘칩니다. 낙관적이고 유머 감각이 뛰어나며, 다양한 문화와 지식을 탐구하는 것을 즐깁니다. 무책임하거나 직설적인 말로 상처를 줄 수 있으므로, 세심한 배려가 필요합니다.':'Sagitario es un signo de fuego gobernado por Júpiter. Ama la libertad y está lleno de pensamiento filosófico y espíritu aventurero. Es optimista y tiene un gran sentido del humor, disfrutando explorar diversas culturas y conocimientos. Puede herir con palabras irresponsables o directas, por lo que se requiere consideración cuidadosa.',
    '사자자리는 태양이 지배하는 불의 별자리입니다. 타고난 리더십과 카리스마로 자연스럽게 주목받습니다. 창의적이고 표현력이 풍부하며, 무대 위에서 빛나는 존재감을 발휘합니다. 자존심이 강하고 인정받고 싶은 욕구가 크므로, 겸손함을 갖추면 더욱 빛납니다.':'Leo es un signo de fuego gobernado por el Sol. Atrae atención naturalmente con su liderazgo innato y carisma. Es creativo y expresivo, mostrando una presencia brillante en el escenario. Tiene un fuerte orgullo y un gran deseo de ser reconocido, por lo que la humildad lo hará brillar aún más.',
    '사주 · 자미두수 · 점성학 세 시스템 통합 분석 (회원가입 불필요)':'Análisis integrado de tres sistemas: Saju · Jamidusu · Astrología (No requiere Membresía)',
    '사주 원국 기반':'Basado en el gráfico original de Saju',
    '사주팔자 · 자미두수 · 천궁도 전체 결과를PDF로 정리하여 제공합니다.':'Se proporciona un resumen en PDF con los resultados completos de Saju Palja · Jamidusu · Carta Astral Occidental.',
    '사회적 활동과 성취 흐름':'Flujo de actividades sociales y logros',
    '사회적 활동과 직업 운이 매우 강한 시기입니다. 능력을 인정받고 승진이나 중요한 기회가 찾아올 수 있습니다. 새로운 프로젝트나 도전에 적극적으로 나서면 좋은 결과를 얻을 수 있습니다.':'Es un período con una suerte muy fuerte en actividades sociales y laborales. Tus habilidades serán reconocidas y pueden llegar promociones u oportunidades importantes. Participar activamente en nuevos proyectos o desafíos puede traer buenos resultados.',
    '상승궁 (ASC)':'Ascendente (ASC)',
    '생년월일을 입력해주세요.':'Por favor, ingresa tu fecha de nacimiento.',
    '생애 에너지 흐름':'Flujo de energía vital',
    '서양 천궁도 분석':'Análisis de carta astral occidental',
    '성격과 기질이 안정적으로 발달해 있어 사회적 관계에서 신뢰를 쌓기 쉽습니다. 자신의 감정을 잘 조절하며, 목표를 향해 꾸준히 나아가는 힘이 있습니다. 다양한 상황에서 유연하게 대처하는 능력이 돋보입니다.':'La personalidad y temperamento se desarrollan de manera estable, facilitando la construcción de confianza en relaciones sociales. Controlas bien tus emociones y tienes la fuerza para avanzar constantemente hacia tus metas. Destaca tu capacidad para adaptarte con flexibilidad a diversas situaciones.',
    '소통과 정보를 다루는 분야에서 빛납니다. 언론, 교육, IT, 마케팅, 작가, 통역 분야가 잘 맞습니다. 다양한 분야를 넘나드는 멀티태스킹 능력이 강점입니다.':'Brillas en campos que manejan comunicación e información. Son adecuados los sectores de medios, educación, TI, marketing, escritura e interpretación. La capacidad multitarea que abarca diversas áreas es una fortaleza.',
    '수 기운이 과잉되어 우유부단함이나 과도한 걱정을 유발할 수 있습니다. 지나친 분석과 소극적 태도를 경계하세요. 검정·파란색 계열과 북쪽 방향을 과도하게 접하면 에너지가 침체될 수 있습니다.':'El exceso de energía de agua puede causar indecisión o preocupaciones excesivas. Ten cuidado con el análisis excesivo y la actitud pasiva. El contacto excesivo con tonos negro y azul y la dirección norte puede causar estancamiento energético.',
    '시주':'Pilar Hora',
    '신강':'Maestro Fuerte',
    '신비롭고 예민한 기운이 강하게 작동할 수 있음':'Puede operar fuertemente una energía misteriosa y sensible',
    '신약':'Maestro Débil',
    '심층 분석과 변화를 다루는 분야에서 탁월합니다. 심리학, 의학, 금융, 탐정, 연구, 위기관리 분야가 잘 맞습니다. 숨겨진 진실을 파헤치는 능력과 강한 집중력이 강점입니다.':'Sobresales en campos que manejan análisis profundo y cambios. Son adecuados los sectores de psicología, medicina, finanzas, detective, investigación y gestión de crisis. La habilidad para descubrir verdades ocultas y la fuerte concentración son fortalezas.',
    '쌍둥이자리는 수성이 지배하는 바람의 별자리입니다. 지적 호기심이 넘치고 다재다능하며, 소통과 정보 교환에 탁월합니다. 두 가지 상반된 성향이 공존하여 상황에 따라 다른 모습을 보이기도 합니다. 언어 능력과 적응력이 뛰어나 다양한 분야에서 활약할 수 있습니다.':'Géminis es un signo de aire regido por Mercurio. Está lleno de curiosidad intelectual y es versátil, destacando en la comunicación y el intercambio de información. Coexisten dos tendencias opuestas, mostrando diferentes facetas según la situación. Posee habilidades lingüísticas y adaptativas sobresalientes, pudiendo destacar en diversos campos.',
    '안정적이고 실용적인 분야에서 능력을 발휘합니다. 금융, 부동산, 요리, 예술, 농업, 건축 분야가 잘 맞습니다. 장기적인 프로젝트를 꾸준히 완성하는 능력이 탁월합니다.':'Desempeña habilidades en áreas estables y prácticas. Se adapta bien a los sectores de finanzas, bienes raíces, cocina, arte, agricultura y arquitectura. Tiene una capacidad sobresaliente para completar proyectos a largo plazo de manera constante.',
    '안정적인 재물 축적과 내실을 다지는 시기입니다. 꾸준한 노력이 결실을 맺고 저축과 부동산 등 안정적 자산 관리에 유리합니다. 성실하게 임하면 좋은 결과를 얻습니다.':'Es un período para acumular riqueza estable y fortalecer la base interna. El esfuerzo constante da frutos y es favorable para la gestión estable de activos como ahorros y bienes raíces. La sinceridad en el empeño traerá buenos resultados.',
    '애정 운이 좋은 편으로, 관계에서 따뜻한 교류가 이루어집니다. 진심 어린 소통이 관계를 더욱 돈독하게 만들어 줍니다. 솔직한 감정 표현이 인연을 발전시키는 열쇠가 됩니다.':'La suerte en el amor es buena, con intercambios cálidos en las relaciones. La comunicación sincera fortalece aún más los vínculos. La expresión honesta de los sentimientos es la clave para desarrollar la relación.',
    '애정 운이 평범한 편입니다. 특별한 변화보다는 현재 관계를 안정적으로 유지하는 것이 중요합니다. 상대방의 입장을 이해하려는 노력이 관계의 질을 높여줍니다.':'La suerte en el amor es neutral. Es importante mantener la estabilidad en la relación actual más que buscar cambios especiales. El esfuerzo por entender la posición del otro mejora la calidad de la relación.',
    '양자리는 황도 12궁의 첫 번째 별자리로, 화성이 지배하는 불의 별자리입니다. 개척 정신과 추진력이 강하며, 새로운 일을 시작하는 데 탁월한 능력을 발휘합니다. 경쟁심이 강하고 즉흥적인 면이 있어 충동적 결정에 주의가 필요합니다. 리더십이 뛰어나고 용기 있는 행동으로 주변을 이끄는 타입입니다.':'Aries es el primer signo del zodíaco, un signo de fuego regido por Marte. Tiene un fuerte espíritu pionero y empuje, destacando en iniciar cosas nuevas. Posee una gran competitividad y un lado impulsivo, por lo que debe tener cuidado con decisiones impulsivas. Es un tipo con liderazgo sobresaliente que guía a su entorno con acciones valientes.',
    '여':'Mujer',
    '여성':'Mujer',
    '열정과 감정의 기운, 예술적 재능':'Energía de pasión y emociones, talento artístico',
    '열정적이고 직접적으로 감정을 표현합니다. 첫눈에 반하는 경우가 많고, 상대를 적극적으로 리드합니다. 권태기가 오면 새로운 자극이 필요합니다.':'Expresa las emociones de manera apasionada y directa. Suele enamorarse a primera vista y lidera activamente a la pareja. Cuando llega el aburrimiento, necesita nuevos estímulos.',
    '염소자리는 토성이 지배하는 흙의 별자리입니다. 책임감이 강하고 목표를 향한 끈기와 실용적 판단력이 탁월합니다. 사회적 성공과 명예를 중시하며, 체계적이고 성실하게 기반을 쌓아갑니다. 감정 표현이 서툴고 지나치게 일에 집중하는 경향이 있어, 휴식과 감정 교류도 중요합니다.':'Capricornio es un signo de tierra regido por Saturno. Tiene un fuerte sentido de responsabilidad, perseverancia hacia metas y un juicio práctico sobresaliente. Valora el éxito social y el honor, construyendo su base de manera sistemática y sincera. Tiene dificultad para expresar emociones y tiende a concentrarse excesivamente en el trabajo, por lo que el descanso y el intercambio emocional también son importantes.',
    '오늘':'Hoy',
    '오늘의 운세':'Fortuna de hoy',
    '오행 분포':'Distribución de los Cinco Elementos',
    '오행 불균형으로 인해 기질적 갈등이 심할 수 있습니다. 충동적 행동이나 극단적 감정 반응에 주의가 필요합니다. 명상, 규칙적인 생활, 신뢰할 수 있는 조언자의 도움을 받는 것이 도움이 됩니다.':'Puede haber conflictos temperamentales severos debido al desequilibrio de los Cinco Elementos. Se debe tener cuidado con acciones impulsivas o reacciones emocionales extremas. La meditación, una vida regular y la ayuda de un consejero confiable son útiles.',
    '올바른 연도를 입력해주세요.':'Por favor, ingrese un año correcto.',
    '완벽한 파트너를 찾기 위해 신중하게 관계를 시작합니다. 실용적이고 헌신적인 사랑을 하며, 세심한 배려로 상대를 돌봅니다. 지나친 비판은 관계를 어렵게 할 수 있습니다.':'Comienza relaciones con cuidado para encontrar la pareja perfecta. Ama de manera práctica y dedicada, cuidando al otro con atención detallada. Las críticas excesivas pueden dificultar la relación.',
    '용신 분석':'Análisis del Elemento Útil',
    '용신을 보조하는 금 기운입니다. 정확하고 체계적인 행동이 운을 뒷받침합니다. 금속 소품이나 흰색 계열 인테리어가 이 기운을 강화하며, 계획적인 생활 패턴이 도움이 됩니다.':'Es la energía de metal que apoya al Elemento Útil. Las acciones precisas y sistemáticas respaldan la fortuna. Los objetos metálicos o la decoración en tonos blancos fortalecen esta energía, y un patrón de vida planificado es beneficioso.',
    '용신을 보조하는 나무 기운입니다. 창의적 활동과 인간관계 확장이 간접적으로 운을 돕습니다. 식물 키우기, 등산, 새벽 산책 등 목(木) 기운을 접하는 생활 습관이 에너지를 보충해 줍니다.':'Es la energía de madera que apoya al Elemento Útil. Las actividades creativas y la expansión de relaciones humanas ayudan indirectamente a la fortuna. Hábitos de vida que incluyen cuidar plantas, senderismo o paseos al amanecer conectan con la energía de madera y recargan la energía.',
    '용신을 보조하는 불 기운입니다. 밝고 활기찬 환경이 운의 흐름을 원활하게 합니다. 조명이 밝은 공간에서 활동하거나 따뜻한 색상의 소품을 활용하면 보조 에너지가 강화됩니다.':'Es la energía de fuego que apoya al Elemento Útil. Un ambiente brillante y animado facilita el flujo de la fortuna. Actividades en espacios bien iluminados o el uso de objetos en colores cálidos fortalecen la energía auxiliar.',
    '용신을 보조하는 수 기운입니다. 지식 축적과 내면 성찰이 운을 간접적으로 강화합니다. 독서, 명상, 수영 등 수(水) 기운과 연관된 활동이 보조 에너지를 활성화합니다.':'Es la energía de agua que apoya al Elemento Útil. La acumulación de conocimiento y la introspección fortalecen indirectamente la fortuna. Actividades relacionadas con el agua como leer, meditar o nadar activan la energía auxiliar.',
    '용신을 보조하는 토 기운입니다. 안정적인 생활 기반이 전체 운을 뒷받침합니다. 규칙적인 식사와 수면, 꾸준한 저축 습관이 이 기운을 활성화하여 운의 토대를 다집니다.':'Es la energía de tierra que apoya al Elemento Útil. Una base de vida estable respalda la fortuna general. Hábitos regulares de alimentación y sueño, y el ahorro constante activan esta energía y consolidan la base de la fortuna.',
    '운세 지수':'Índice de Fortuna',
    '운세를 계산하는 중입니다…':'Calculando la fortuna…',
    '월주':'Pilar Mes',
    '의료·치유 분야에 재능이 있으며 건강 회복력이 강합니다.':'Tiene talento en el campo médico y de sanación, y una fuerte capacidad de recuperación de la salud.',
    '의술과 건강의 별, 치료 능력':'Estrella de medicina y salud, capacidad de curación',
    '이 대운은 천간의 기운이 일간에 영향을 미치는 시기입니다. 해당 십성의 특성을 이해하고 흐름에 맞게 대응하는 것이 중요합니다.':'Este Gran Ciclo es un período en el que la energía del tronco celestial influye en el día. Es importante entender las características del décimo estrella correspondiente y responder acorde al flujo.',
    '이성 매력, 예술적 감각':'Atracción hacia el sexo opuesto, sentido artístico',
    '이성에게 매력적으로 보이며 예술·연예 분야에 재능이 있습니다.':'Se ve atractivo para el sexo opuesto y tiene talento en los campos de arte y entretenimiento.',
    '인연의 기운이 매우 강하게 흐르고 있습니다. 새로운 만남이나 기존 관계의 깊어짐이 기대되는 시기입니다. 감정 표현이 자연스럽게 이루어지며, 상대방의 마음을 얻기에 유리한 에너지가 충만합니다.':'La energía de la conexión fluye muy fuerte. Es un período en el que se esperan nuevos encuentros o un profundizamiento de relaciones existentes. La expresión emocional se realiza de manera natural y está lleno de energía favorable para ganar el corazón de la otra persona.',
    '인연의 흐름이 막혀 있는 시기입니다. 관계에서 상처를 받거나 이별의 아픔을 경험할 수 있습니다. 자신을 먼저 돌보고 내면의 상처를 치유하는 데 집중하는 것이 현명합니다.':'Es un período en el que el flujo de las relaciones está bloqueado. Puede experimentar heridas en las relaciones o el dolor de una separación. Es sabio cuidarse primero y concentrarse en sanar las heridas internas.',
    '일간 강약':'Fuerza del Día',
    '일간 강약과 오행 균형':'Fuerza del Día y equilibrio de los Cinco Elementos',
    '일생 최고의 귀인을 만나는 기운으로 위기 시 강력한 도움을 받습니다.':'Es la energía de encontrar al mejor benefactor de la vida, recibiendo ayuda poderosa en tiempos de crisis.',
    '일주':'Pilar Día',
    '일진 분석':'Análisis del Día',
    '자립심과 독립 의지가 강해지는 시기입니다. 새로운 시작과 자기 계발에 유리하며, 경쟁 속에서 실력을 키울 수 있습니다. 다만 고집이 세질 수 있으니 협력을 잊지 마세요.':'Es un período en el que la autosuficiencia y la voluntad de independencia se fortalecen. Es favorable para nuevos comienzos y desarrollo personal, y puede mejorar sus habilidades en la competencia. Sin embargo, tenga cuidado con la terquedad y no olvide la cooperación.',
    '자미두수':'Zi Wei Dou Shu',
    '자유롭고 모험적인 사랑을 즐깁니다. 함께 성장하고 세상을 탐험할 파트너를 원합니다. 구속받는 것을 싫어하며, 정신적 교감을 매우 중시합니다.':'Disfruta de un amor libre y aventurero. Busca una pareja para crecer juntos y explorar el mundo. No le gusta sentirse restringido y valora mucho la conexión espiritual.',
    '자유와 확장이 필요한 분야에서 성공합니다. 교육, 여행, 출판, 법률, 철학, 해외 비즈니스 분야가 잘 맞습니다. 넓은 시야와 낙관적 에너지로 새로운 기회를 만들어냅니다.':'Tiene éxito en áreas que requieren libertad y expansión. Se adapta bien a la educación, viajes, publicación, derecho, filosofía y negocios internacionales. Crea nuevas oportunidades con una visión amplia y energía optimista.',
    '재물 손실이나 예상치 못한 지출이 발생할 수 있는 시기입니다. 충동적인 소비나 투기적 투자를 자제하고 보수적인 재정 관리가 필요합니다. 보증이나 대출에 특히 주의하세요.':'Es un período en el que pueden ocurrir pérdidas materiales o gastos inesperados. Se necesita evitar el consumo impulsivo o inversiones especulativas y gestionar las finanzas de manera conservadora. Tenga especial cuidado con las garantías o préstamos.',
    '재물 운이 매우 강하게 흐르고 있습니다. 예상치 못한 수입이나 투자 성과가 기대되는 시기입니다. 재물이 자연스럽게 모이는 흐름이므로 장기적인 재테크 계획을 세우기에 좋은 때입니다.':'La fortuna material fluye muy fuerte. Es un período en el que se esperan ingresos inesperados o resultados de inversiones. La riqueza se acumula de manera natural, por lo que es un buen momento para planificar inversiones a largo plazo.',
    '재물 운이 매우 불안정한 시기입니다. 큰 재정적 손실이나 사기 피해의 위험이 있으므로 중요한 금전 거래는 반드시 전문가의 조언을 구하세요. 현금 보유를 늘리고 리스크를 최소화하는 것이 현명합니다.':'La fortuna material es muy inestable. Existe riesgo de grandes pérdidas financieras o fraudes, por lo que debe buscar el consejo de un experto para transacciones importantes. Es sabio aumentar la tenencia de efectivo y minimizar riesgos.',
    '재물 운이 좋은 편입니다. 수입이 안정적으로 유지되며 절약과 투자의 균형을 잘 맞출 수 있습니다. 소소한 재물 기회들이 꾸준히 찾아오는 시기입니다.':'La fortuna material es buena. Los ingresos se mantienen estables y puede equilibrar bien el ahorro y la inversión. Es un período en el que pequeñas oportunidades financieras llegan constantemente.',
    '재물 운이 평범한 편입니다. 큰 이익보다는 현재 재정 상태를 안정적으로 유지하는 것이 중요합니다. 불필요한 지출을 줄이고 저축 습관을 기르는 것이 도움이 됩니다.':'La fortuna material es neutral. Es más importante mantener la estabilidad financiera actual que obtener grandes ganancias. Reducir gastos innecesarios y cultivar el hábito del ahorro es útil.',
    '재물과 기회의 흐름':'Flujo de riqueza y oportunidades',
    '재물복과 명예운이 좋아 안정된 삶을 누리는 기운입니다.':'Es una energía con buena fortuna en riqueza y honor, disfrutando de una vida estable.',
    '전갈자리는 명왕성과 화성이 지배하는 물의 별자리입니다. 강렬한 의지와 깊이 있는 통찰력을 가지고 있습니다. 비밀을 잘 지키고 심층적인 진실을 탐구하는 능력이 탁월합니다. 집착과 질투심이 강할 수 있으므로, 신뢰를 바탕으로 한 깊은 관계를 형성하는 것이 중요합니다.':'Escorpio es un signo de agua gobernado por Plutón y Marte. Tiene una voluntad intensa y una profunda intuición. Posee una habilidad excepcional para guardar secretos y explorar verdades profundas. Puede tener tendencia a la obsesión y los celos, por lo que es importante formar relaciones profundas basadas en la confianza.',
    '점성학':'Astrología',
    '중년운 (35~50세)':'Suerte en la mediana edad (35~50 años)',
    '직관력과 영적 감수성이 뛰어나지만 신경과민·불안 경향에 주의가 필요합니다.':'Posee una gran intuición y sensibilidad espiritual, pero debe tener cuidado con la hipersensibilidad y la tendencia a la ansiedad.',
    '직업 운이 매우 불안정한 시기입니다. 직장 변동이나 실직의 위험이 있을 수 있으므로 중요한 결정을 미루고 안정을 최우선으로 삼으세요. 신뢰할 수 있는 사람의 조언을 구하는 것이 도움이 됩니다.':'Es un período de fortuna profesional muy inestable. Puede haber cambios laborales o riesgo de desempleo, por lo que debe posponer decisiones importantes y priorizar la estabilidad. Buscar el consejo de personas confiables es útil.',
    '직업 운이 순조롭게 흐르고 있습니다. 꾸준한 노력이 인정받는 시기로, 동료나 상사와의 관계도 원만합니다. 자신의 전문성을 더욱 갈고닦으면 더 큰 성과를 거둘 수 있습니다.':'La fortuna profesional fluye sin problemas. Es un período en el que el esfuerzo constante es reconocido y las relaciones con colegas y superiores son armoniosas. Perfeccionar su especialización puede conducir a mayores logros.',
    '직업 운이 평범한 편입니다. 큰 변화보다는 현재 위치에서 성실하게 임하는 것이 중요합니다. 새로운 기술이나 지식을 습득하여 경쟁력을 높이는 것이 도움이 됩니다.':'La fortuna profesional es neutral. Es importante ser diligente en la posición actual en lugar de buscar grandes cambios. Adquirir nuevas habilidades o conocimientos ayuda a aumentar la competitividad.',
    '직업적으로 어려움이 있을 수 있는 시기입니다. 직장 내 갈등이나 업무 부담이 증가할 수 있으므로 신중하게 행동하고 불필요한 마찰을 피하는 것이 좋습니다. 무리한 도전보다 현상 유지에 집중하세요.':'Puede ser un período con dificultades profesionales. Los conflictos laborales o la carga de trabajo pueden aumentar, por lo que es recomendable actuar con prudencia y evitar fricciones innecesarias. Enfóquese en mantener el statu quo en lugar de desafíos excesivos.',
    '진지하고 책임감 있는 사랑을 합니다. 장기적인 관계와 안정을 추구하며, 파트너에게 든든한 지원자가 됩니다. 감정 표현이 서툴 수 있으나 깊이 헌신합니다.':'Ama de manera seria y responsable. Busca relaciones a largo plazo y estabilidad, siendo un apoyo sólido para la pareja. Puede ser torpe en la expresión emocional, pero se entrega profundamente.',
    '창의력과 표현력이 풍부해지는 시기입니다. 재능을 발휘하고 새로운 것을 배우기에 좋으며, 음식·예술·교육 분야에서 기회가 생깁니다. 전반적으로 안정적이고 여유로운 대운입니다.':'Es un período en el que la creatividad y la expresividad aumentan. Es bueno para mostrar talentos y aprender cosas nuevas, con oportunidades en los campos de gastronomía, arte y educación. En general, es un Gran Ciclo estable y relajado.',
    '창의성과 리더십이 필요한 분야에서 성공합니다. 연예, 예술, 경영, 교육, 정치, 이벤트 기획 분야가 잘 맞습니다. 무대 위에서 빛나는 존재감과 카리스마가 강점입니다.':'Tiene éxito en áreas que requieren creatividad y liderazgo. Se adapta bien a entretenimiento, arte, gestión, educación, política y planificación de eventos. Su presencia brillante y carisma en el escenario son fortalezas.',
    '처녀자리는 수성이 지배하는 흙의 별자리입니다. 분석력과 세심함이 뛰어나며, 완벽을 추구하는 성실한 성향입니다. 실용적이고 논리적인 사고로 문제를 해결하는 능력이 탁월합니다. 지나친 완벽주의와 자기비판에 주의하고, 있는 그대로의 자신을 인정하는 연습이 필요합니다.':'Virgo es un signo de tierra regido por Mercurio. Destaca por su capacidad analítica y atención al detalle, con una naturaleza diligente que busca la perfección. Tiene una habilidad sobresaliente para resolver problemas con un pensamiento práctico y lógico. Se debe tener cuidado con el perfeccionismo excesivo y la autocrítica, y es necesario practicar el reconocimiento de uno mismo tal como es.',
    '천천히 신중하게 마음을 열지만, 한번 사랑에 빠지면 매우 헌신적입니다. 안정적이고 감각적인 사랑을 추구하며, 물질적 표현으로 애정을 드러냅니다.':'Abre su corazón lenta y cuidadosamente, pero una vez que se enamora es muy dedicado. Busca un amor estable y sensorial, y expresa su afecto a través de manifestaciones materiales.',
    '천칭자리는 금성이 지배하는 바람의 별자리입니다. 균형과 조화를 추구하며, 아름다움과 예술적 감각이 뛰어납니다. 공정함을 중시하고 타인과의 관계에서 외교적 능력을 발휘합니다. 결정을 내리기 어려워하는 우유부단함이 있어, 자신의 내면 목소리를 믿는 연습이 중요합니다.':'Libra es un signo de aire regido por Venus. Busca el equilibrio y la armonía, y posee un gran sentido de la belleza y el arte. Valora la justicia y demuestra habilidades diplomáticas en las relaciones con los demás. Tiene indecisión para tomar decisiones, por lo que es importante practicar confiar en su voz interior.',
    '첫인상·외면':'Primera impresión · Apariencia externa',
    '청년운 (15~35세)':'Suerte Juvenil (15~35 años)',
    '체계와 성취가 필요한 분야에서 두각을 나타냅니다. 경영, 정치, 금융, 건축, 행정, 공학 분야가 잘 맞습니다. 장기적인 목표를 향해 꾸준히 나아가는 끈기가 강점입니다.':'Destaca en campos que requieren estructura y logro. Se adapta bien a áreas como gestión, política, finanzas, arquitectura, administración e ingeniería. Su perseverancia para avanzar hacia objetivos a largo plazo es una fortaleza.',
    '초년운 (0~15세)':'Suerte Temprana (0~15 años)',
    '최고 귀인성, 위기 극복':'Máximo Benefactor, Superación de Crisis',
    '최고의 귀인, 큰 도움과 인복':'El mejor benefactor, gran ayuda y buena fortuna con personas',
    '추진력과 결단력이 강하지만 충동적 행동과 대인 갈등에 주의하세요.':'Tiene gran impulso y determinación, pero debe tener cuidado con acciones impulsivas y conflictos interpersonales.',
    '출생 연도':'Año de nacimiento',
    '타고난 기질과 성격의 흐름':'Flujo de temperamento y personalidad innatos',
    '타고난 기질이 매우 조화롭고 균형 잡혀 있습니다. 어떤 환경에서도 자신의 강점을 발휘하며, 주변 사람들에게 긍정적인 영향을 미치는 타고난 리더 기질을 지니고 있습니다. 직관력과 판단력이 뛰어나 중요한 순간에 탁월한 선택을 내립니다.':'El temperamento innato es muy armonioso y equilibrado. En cualquier entorno, muestra sus fortalezas y posee un temperamento de líder natural que influye positivamente en quienes lo rodean. Su intuición y juicio son excelentes, tomando decisiones sobresalientes en momentos importantes.',
    '태양 별자리':'Signo Solar',
    '토 기운이 과잉되어 정체와 고집을 유발할 수 있습니다. 변화를 두려워하거나 지나치게 보수적인 태도가 기회를 놓치게 합니다. 황토색·중앙 배치를 줄이고 유연한 사고를 키우세요.':'El exceso de energía de tierra puede causar estancamiento y terquedad. El miedo al cambio o una actitud demasiado conservadora puede hacer perder oportunidades. Reduzca el uso del color tierra amarillenta y la colocación central, y fomente un pensamiento flexible.',
    '하늘의 덕, 재난 소멸':'Virtud Celestial, Desaparición de Desastres',
    '하늘의 덕을 받아 재난과 액운이 자연스럽게 해소됩니다.':'Al recibir la virtud celestial, los desastres y la mala suerte se disuelven naturalmente.',
    '하늘이 내린 귀인으로 어려운 상황에서 도움을 받는 강한 기운입니다.':'Es una energía fuerte de un benefactor otorgado por el cielo que ayuda en situaciones difíciles.',
    '학문·연구·영성에 관심이 높아지는 시기입니다. 내면을 탐구하고 전문 지식을 쌓기에 좋으며, 예술·의료·종교 분야에서 재능이 발휘됩니다. 고독감이 들 수 있으니 소통을 늘리세요.':'Es un período de creciente interés en la academia, la investigación y la espiritualidad. Es bueno para explorar el interior y acumular conocimientos especializados, y se manifiestan talentos en arte, medicina y religión. Puede sentirse soledad, por lo que se recomienda aumentar la comunicación.',
    '학문과 시험의 귀인, 문장 재능':'Benefactor en estudios y exámenes, talento literario',
    '학습과 성장, 귀인의 도움을 받는 시기입니다. 자격증 취득이나 학업에 유리하며, 어른이나 스승의 지원을 받을 수 있습니다. 차분하고 신중하게 임하면 좋은 결과를 얻습니다.':'Es un período de aprendizaje y crecimiento con la ayuda de benefactores. Es favorable para obtener certificaciones o estudios, y puede recibir apoyo de adultos o maestros. Si se actúa con calma y prudencia, se obtendrán buenos resultados.',
    '학업·시험 운이 강하고 글재주가 뛰어나 문서·계약에 유리합니다.':'Tiene una fuerte suerte en estudios y exámenes, y gran habilidad para la escritura, lo que es favorable para documentos y contratos.',
    '핵심 정체성':'Identidad Central',
    '행운의 방향':'Dirección de la Fortuna',
    '행운의 색':'Color de la Fortuna',
    '행운의 숫자':'Número de la Fortuna',
    '혁신과 미래를 다루는 분야에서 빛납니다. IT, 과학, 사회운동, 방송, 인도주의 분야가 잘 맞습니다. 독창적인 아이디어와 미래를 내다보는 통찰력이 강점입니다.':'Brilla en campos que tratan la innovación y el futuro. Se adapta bien a IT, ciencia, movimientos sociales, radiodifusión y humanitarismo. Su fortaleza es la originalidad de ideas y la visión hacia el futuro.',
    '활동성과 추진력이 강해지는 시기입니다. 재물의 유동성이 크고 인간관계가 넓어집니다. 충동적인 투자나 보증은 피하고 신중한 재무 관리가 필요합니다.':'Es un período de aumento en la actividad y el impulso. La liquidez financiera es alta y las relaciones humanas se amplían. Se debe evitar inversiones impulsivas o avales, y se requiere una gestión financiera cuidadosa.',
    '활발한 재물 활동과 사교성이 높아지는 시기입니다. 사업 기회나 투자 수익이 생길 수 있으나 변동성도 큽니다. 이성 인연이 활발해지고 대인관계가 넓어집니다.':'Es un período de intensa actividad financiera y aumento de la sociabilidad. Pueden surgir oportunidades de negocio o ganancias de inversión, pero también hay alta volatilidad. Las relaciones amorosas se activan y las relaciones interpersonales se amplían.',
    '황소자리는 금성이 지배하는 흙의 별자리입니다. 안정과 물질적 풍요를 중시하며, 한번 결정한 것은 끝까지 밀고 나가는 끈기가 있습니다. 감각적인 즐거움과 아름다움을 사랑하며, 신뢰할 수 있는 든든한 파트너입니다. 변화에 저항하는 고집스러운 면이 있어 유연성을 기르는 것이 중요합니다.':'Tauro es un signo de tierra regido por Venus. Valora la estabilidad y la abundancia material, y tiene la perseverancia para llevar hasta el final lo que decide. Ama los placeres sensoriales y la belleza, y es un compañero confiable y sólido. Tiene un lado terco que resiste el cambio, por lo que es importante cultivar la flexibilidad.',
    '🔮 무료 운세 보기 (사주 · 자미두수 · 점성학)':'🔮 Ver fortuna gratuita (Saju · Jamidusoo · Astrología)'
  },
};
function getPalaceLabel(key) {
  const lang = gLang();
  const map = PALACE_LABELS[lang] || PALACE_LABELS.ko;
  return (map[key] || PALACE_LABELS.ko[key] || ['',''])[0];
}
function getPalaceDesc(key) {
  const lang = gLang();
  const map = PALACE_LABELS[lang] || PALACE_LABELS.ko;
  return (map[key] || PALACE_LABELS.ko[key] || ['',''])[1];
}
const PALACE_INFO = {
  '命宮': { emoji:'🌟', label:'명궁 (命宮)', desc:'기본 성격과 인생의 핵심 구조', color:'#d4af37', field:'fate' },
  '兄弟': { emoji:'👥', label:'형제궁 (兄弟宮)', desc:'형제자매·동료와의 인연', color:'#60a5fa', field:'sibling' },
  '夫妻': { emoji:'💗', label:'부처궁 (夫妻宮)', desc:'배우자·연인과의 인연', color:'#f472b6', field:'love' },
  '子女': { emoji:'👶', label:'자녀궁 (子女宮)', desc:'자녀운과 창조적 에너지', color:'#34d399', field:'child' },
  '財帛': { emoji:'💰', label:'재백궁 (財帛宮)', desc:'재물·수입·금전 흐름', color:'#fbbf24', field:'wealth' },
  '疾厄': { emoji:'🌿', label:'질액궁 (疾厄宮)', desc:'건강·체질·질병 경향', color:'#4ade80', field:'health' },
  '遷移': { emoji:'✈️', label:'천이궁 (遷移宮)', desc:'이동·해외·외부 활동', color:'#38bdf8', field:'travel' },
  '交友': { emoji:'🤝', label:'교우궁 (交友宮)', desc:'친구·인맥·사회적 관계', color:'#a78bfa', field:'friend' },
  '官祿': { emoji:'💼', label:'관록궁 (官祿宮)', desc:'직업·사회적 성취·명예', color:'#fb923c', field:'career' },
  '田宅': { emoji:'🏠', label:'전택궁 (田宅宮)', desc:'부동산·주거·가정환경', color:'#f59e0b', field:'home' },
  '福德': { emoji:'🧘', label:'복덕궁 (福德宮)', desc:'정신세계·복·내면의 행복', color:'#c084fc', field:'spirit' },
  '父母': { emoji:'👨‍👩‍👧', label:'부모궁 (父母宮)', desc:'부모운·윗사람과의 관계', color:'#94a3b8', field:'parent' },
};

// 각 별의 궁별 해석 텍스트 (무료: 1~2문장 요약)
const STAR_PALACE_DESC = {
  '紫微': {
    sibling:'자미성의 권위가 형제궁에 작용하여 형제자매 중 중심 역할을 하거나 귀한 인연을 만납니다.',
    child:'자미성의 귀한 기운이 자녀궁에 자리하여 뛰어난 자녀를 두거나 창의적 재능이 풍부합니다.',
    health:'자미성의 강한 기운이 질액궁에 있어 건강 관리에 신경 쓰면 큰 문제 없이 지낼 수 있습니다.',
    travel:'자미성의 권위가 천이궁에 작용하여 외부 활동에서 귀인을 만나고 명성을 얻을 수 있습니다.',
    friend:'자미성의 기운이 교우궁에 있어 지위 있는 인맥을 형성하고 귀인의 도움을 받습니다.',
    career:'자미성의 제왕 기운이 관록궁에 자리하여 높은 지위와 권한을 가질 수 있는 직업 구조입니다.',
    home:'자미성의 귀한 기운이 전택궁에 작용하여 좋은 주거 환경과 부동산 복이 있습니다.',
    spirit:'자미성의 고귀함이 복덕궁에 자리하여 정신적 풍요와 높은 이상을 추구합니다.',
    parent:'자미성의 권위가 부모궁에 있어 부모가 사회적으로 인정받거나 귀한 가문의 인연입니다.',
  },
  '天機': {
    sibling:'천기성의 변화 기운이 형제궁에 작용하여 형제자매와 지적 교류가 활발하지만 변화가 많습니다.',
    child:'천기성의 영리함이 자녀궁에 자리하여 총명하고 다재다능한 자녀를 두는 경향이 있습니다.',
    health:'천기성의 변화 기운이 질액궁에 있어 신경계나 정신적 피로에 주의가 필요합니다.',
    travel:'천기성의 활동적 기운이 천이궁에 작용하여 이동과 변화가 많고 해외 기회가 생깁니다.',
    friend:'천기성의 기운이 교우궁에 있어 다양하고 지적인 인맥을 형성하지만 관계 변화가 잦습니다.',
    career:'천기성의 지략이 관록궁에 자리하여 기획·분석·IT 분야에서 두각을 나타냅니다.',
    home:'천기성의 변화 기운이 전택궁에 작용하여 이사나 주거 변화가 잦을 수 있습니다.',
    spirit:'천기성의 지적 기운이 복덕궁에 자리하여 끊임없이 배우고 탐구하는 정신세계를 가집니다.',
    parent:'천기성의 기운이 부모궁에 있어 부모와 지적 교류가 활발하나 관계 변화가 있을 수 있습니다.',
  },
  '太陽': {
    sibling:'태양성의 밝은 기운이 형제궁에 작용하여 형제자매와 활발하고 공개적인 관계를 유지합니다.',
    child:'태양성의 빛나는 기운이 자녀궁에 자리하여 사교적이고 활동적인 자녀를 두는 경향입니다.',
    health:'태양성의 강한 기운이 질액궁에 있어 심장·눈 건강에 주의하고 과로를 피해야 합니다.',
    travel:'태양성의 사회적 기운이 천이궁에 작용하여 외부 활동이 활발하고 해외에서 명성을 얻습니다.',
    friend:'태양성의 기운이 교우궁에 있어 넓은 인맥을 형성하고 사회적으로 영향력 있는 친구를 둡니다.',
    career:'태양성의 빛나는 기운이 관록궁에 자리하여 공직·교육·미디어 분야에서 두각을 나타냅니다.',
    home:'태양성의 밝은 기운이 전택궁에 작용하여 밝고 활기찬 가정환경과 좋은 주거 복이 있습니다.',
    spirit:'태양성의 기운이 복덕궁에 자리하여 사회 공헌과 타인을 위한 활동에서 행복을 찾습니다.',
    parent:'태양성의 기운이 부모궁에 있어 부모가 사회적으로 활발하고 영향력 있는 분일 가능성이 높습니다.',
  },
  '武曲': {
    sibling:'무곡성의 강직한 기운이 형제궁에 작용하여 형제자매와 의리 있는 관계를 유지합니다.',
    child:'무곡성의 강한 기운이 자녀궁에 자리하여 의지가 강하고 실행력 있는 자녀를 두는 경향입니다.',
    health:'무곡성의 금속 기운이 질액궁에 있어 수술이나 외상에 주의하고 규칙적인 운동이 도움됩니다.',
    travel:'무곡성의 실행력이 천이궁에 작용하여 실무적인 목적의 이동이 많고 해외 사업 기회가 생깁니다.',
    friend:'무곡성의 기운이 교우궁에 있어 의리 있고 실력 있는 인맥을 형성합니다.',
    career:'무곡성의 재물 기운이 관록궁에 자리하여 금융·사업·기술 분야에서 탁월한 성과를 냅니다.',
    home:'무곡성의 강한 기운이 전택궁에 작용하여 부동산 투자에 강하고 안정적인 자산을 축적합니다.',
    spirit:'무곡성의 기운이 복덕궁에 자리하여 실질적인 성취와 물질적 안정에서 행복을 찾습니다.',
    parent:'무곡성의 기운이 부모궁에 있어 부모가 강직하고 실용적인 분이며 물질적 지원이 있습니다.',
  },
  '天同': {
    sibling:'천동성의 온화한 기운이 형제궁에 작용하여 형제자매와 화목하고 편안한 관계를 유지합니다.',
    child:'천동성의 복덕 기운이 자녀궁에 자리하여 온화하고 복 있는 자녀를 두는 경향입니다.',
    health:'천동성의 편안한 기운이 질액궁에 있어 건강이 비교적 양호하나 과식·나태에 주의하세요.',
    travel:'천동성의 여유로운 기운이 천이궁에 작용하여 즐거운 여행과 편안한 외부 활동이 많습니다.',
    friend:'천동성의 기운이 교우궁에 있어 편안하고 즐거운 인간관계를 형성하고 좋은 친구를 둡니다.',
    career:'천동성의 복덕 기운이 관록궁에 자리하여 복지·서비스·예술 분야에서 안정적으로 일합니다.',
    home:'천동성의 기운이 전택궁에 작용하여 편안하고 아늑한 가정환경과 안정적인 주거 복이 있습니다.',
    spirit:'천동성의 기운이 복덕궁에 자리하여 여유롭고 낙천적인 정신세계와 풍부한 복덕을 가집니다.',
    parent:'천동성의 기운이 부모궁에 있어 부모와 화목하고 편안한 관계를 유지합니다.',
  },
  '廉貞': {
    sibling:'염정성의 열정적 기운이 형제궁에 작용하여 형제자매와 강렬하지만 기복 있는 관계입니다.',
    child:'염정성의 강한 기운이 자녀궁에 자리하여 개성 강하고 열정적인 자녀를 두는 경향입니다.',
    health:'염정성의 기복 기운이 질액궁에 있어 감정 스트레스로 인한 건강 문제에 주의가 필요합니다.',
    travel:'염정성의 열정이 천이궁에 작용하여 외부 활동에서 강렬한 경험과 기복 있는 변화가 생깁니다.',
    friend:'염정성의 기운이 교우궁에 있어 강렬하고 열정적인 인간관계를 맺지만 갈등도 있을 수 있습니다.',
    career:'염정성의 카리스마가 관록궁에 자리하여 법률·정치·예술 분야에서 강한 존재감을 발휘합니다.',
    home:'염정성의 기운이 전택궁에 작용하여 주거 환경에 변화가 많고 이사를 자주 할 수 있습니다.',
    spirit:'염정성의 기운이 복덕궁에 자리하여 강렬한 욕망과 열정에서 삶의 의미를 찾습니다.',
    parent:'염정성의 기운이 부모궁에 있어 부모와 강렬하지만 기복 있는 관계를 유지합니다.',
  },
  '天府': {
    sibling:'천부성의 든든한 기운이 형제궁에 작용하여 형제자매와 안정적이고 신뢰 있는 관계입니다.',
    child:'천부성의 풍요로운 기운이 자녀궁에 자리하여 안정적이고 복 있는 자녀를 두는 경향입니다.',
    health:'천부성의 안정적 기운이 질액궁에 있어 건강이 비교적 양호하고 회복력이 강합니다.',
    travel:'천부성의 보수적 기운이 천이궁에 작용하여 안정적인 목적의 이동이 많고 해외에서도 기반을 잡습니다.',
    friend:'천부성의 기운이 교우궁에 있어 신뢰할 수 있는 든든한 인맥을 형성합니다.',
    career:'천부성의 저장 기운이 관록궁에 자리하여 재무·부동산·행정 분야에서 안정적으로 성장합니다.',
    home:'천부성의 풍요로운 기운이 전택궁에 작용하여 좋은 부동산 복과 안정적인 가정환경이 있습니다.',
    spirit:'천부성의 기운이 복덕궁에 자리하여 안정과 풍요 속에서 깊은 내면의 만족을 추구합니다.',
    parent:'천부성의 기운이 부모궁에 있어 부모가 든든하고 안정적인 지원을 해주는 좋은 인연입니다.',
  },
  '太陰': {
    sibling:'태음성의 섬세한 기운이 형제궁에 작용하여 형제자매와 감성적이고 깊은 유대를 형성합니다.',
    child:'태음성의 감성적 기운이 자녀궁에 자리하여 섬세하고 예술적 재능을 가진 자녀를 두는 경향입니다.',
    health:'태음성의 달 기운이 질액궁에 있어 호르몬·수면·감정 건강에 특별한 주의가 필요합니다.',
    travel:'태음성의 내향적 기운이 천이궁에 작용하여 조용하고 감성적인 여행을 즐기며 해외 부동산 기회가 있습니다.',
    friend:'태음성의 기운이 교우궁에 있어 섬세하고 감성적인 친구들과 깊은 우정을 나눕니다.',
    career:'태음성의 감성적 기운이 관록궁에 자리하여 예술·상담·부동산·금융 분야에서 재능을 발휘합니다.',
    home:'태음성의 기운이 전택궁에 작용하여 아름답고 감성적인 주거 환경을 추구하며 부동산 복이 있습니다.',
    spirit:'태음성의 기운이 복덕궁에 자리하여 풍부한 감성과 내면의 아름다움을 추구하는 정신세계입니다.',
    parent:'태음성의 기운이 부모궁에 있어 어머니와의 인연이 깊고 감성적인 가정환경에서 자랍니다.',
  },
  '貪狼': {
    sibling:'탐랑성의 다재다능함이 형제궁에 작용하여 형제자매와 다양하고 활발한 교류를 합니다.',
    child:'탐랑성의 매력적 기운이 자녀궁에 자리하여 다재다능하고 사교적인 자녀를 두는 경향입니다.',
    health:'탐랑성의 욕망 기운이 질액궁에 있어 과식·과음·과로에 주의하고 절제가 필요합니다.',
    travel:'탐랑성의 활동적 기운이 천이궁에 작용하여 다양한 곳을 여행하고 해외에서 새로운 기회를 만납니다.',
    friend:'탐랑성의 기운이 교우궁에 있어 다양하고 매력적인 인맥을 형성하며 사교 활동이 활발합니다.',
    career:'탐랑성의 다재다능함이 관록궁에 자리하여 예술·연예·영업·서비스 분야에서 두각을 나타냅니다.',
    home:'탐랑성의 기운이 전택궁에 작용하여 다양한 주거 경험을 하고 인테리어에 관심이 많습니다.',
    spirit:'탐랑성의 기운이 복덕궁에 자리하여 다양한 취미와 욕망을 즐기는 풍요로운 정신세계입니다.',
    parent:'탐랑성의 기운이 부모궁에 있어 부모와 다양한 활동을 함께하며 활발한 관계를 유지합니다.',
  },
  '巨門': {
    sibling:'거문성의 소통 기운이 형제궁에 작용하여 형제자매와 언쟁이나 오해가 생기기 쉬우니 소통에 주의하세요.',
    child:'거문성의 언변 기운이 자녀궁에 자리하여 말 잘하고 논리적인 자녀를 두는 경향입니다.',
    health:'거문성의 기운이 질액궁에 있어 소화기·구강 건강에 주의하고 스트레스 관리가 중요합니다.',
    travel:'거문성의 소통 기운이 천이궁에 작용하여 외부에서 언변으로 기회를 만들고 정보 수집 능력이 뛰어납니다.',
    friend:'거문성의 기운이 교우궁에 있어 지적이고 말 잘하는 인맥을 형성하나 오해가 생기지 않도록 주의하세요.',
    career:'거문성의 언변이 관록궁에 자리하여 법률·언론·교육·상담 분야에서 탁월한 능력을 발휘합니다.',
    home:'거문성의 기운이 전택궁에 작용하여 가정 내 소통 문제가 생길 수 있으니 대화에 신경 쓰세요.',
    spirit:'거문성의 기운이 복덕궁에 자리하여 지식 탐구와 진리 추구에서 정신적 만족을 찾습니다.',
    parent:'거문성의 기운이 부모궁에 있어 부모와 소통에서 오해가 생기기 쉬우니 명확한 대화가 중요합니다.',
  },
  '天相': {
    sibling:'천상성의 조화로운 기운이 형제궁에 작용하여 형제자매와 서로 돕는 따뜻한 관계입니다.',
    child:'천상성의 귀인 기운이 자녀궁에 자리하여 착하고 귀인 역할을 하는 자녀를 두는 경향입니다.',
    health:'천상성의 안정적 기운이 질액궁에 있어 건강이 비교적 양호하고 귀인의 도움으로 회복이 빠릅니다.',
    travel:'천상성의 귀인 기운이 천이궁에 작용하여 외부 활동에서 귀인을 만나고 좋은 지원을 받습니다.',
    friend:'천상성의 기운이 교우궁에 있어 귀인 같은 친구들과 서로 지지하는 따뜻한 인간관계를 형성합니다.',
    career:'천상성의 조화 기운이 관록궁에 자리하여 행정·복지·조직 관리 분야에서 안정적으로 성장합니다.',
    home:'천상성의 기운이 전택궁에 작용하여 화목하고 안정적인 가정환경과 좋은 주거 복이 있습니다.',
    spirit:'천상성의 기운이 복덕궁에 자리하여 타인을 돕고 조화를 이루는 것에서 정신적 만족을 찾습니다.',
    parent:'천상성의 기운이 부모궁에 있어 부모가 귀인 같은 존재로 좋은 지원과 보호를 받습니다.',
  },
  '天梁': {
    sibling:'천량성의 수호 기운이 형제궁에 작용하여 형제자매 중 보호자 역할을 하거나 연장자와 인연이 깊습니다.',
    child:'천량성의 지혜로운 기운이 자녀궁에 자리하여 성숙하고 지혜로운 자녀를 두는 경향입니다.',
    health:'천량성의 수호 기운이 질액궁에 있어 건강 위기에서도 귀인의 도움으로 회복하는 능력이 있습니다.',
    travel:'천량성의 지혜 기운이 천이궁에 작용하여 외부에서 귀인을 만나고 위기를 극복하는 경험을 합니다.',
    friend:'천량성의 기운이 교우궁에 있어 연장자나 멘토 같은 귀인 친구들과 깊은 인연을 맺습니다.',
    career:'천량성의 지혜가 관록궁에 자리하여 의료·법률·종교·상담 분야에서 나이 들수록 빛을 발합니다.',
    home:'천량성의 기운이 전택궁에 작용하여 안정적인 주거 환경과 부동산을 지키는 능력이 있습니다.',
    spirit:'천량성의 기운이 복덕궁에 자리하여 깊은 지혜와 정신적 수양에서 내면의 평화를 찾습니다.',
    parent:'천량성의 기운이 부모궁에 있어 부모가 지혜롭고 보호적인 분으로 큰 정신적 지주가 됩니다.',
  },
  '七殺': {
    sibling:'칠살성의 강한 기운이 형제궁에 작용하여 형제자매와 독립적이고 경쟁적인 관계를 유지합니다.',
    child:'칠살성의 돌파력이 자녀궁에 자리하여 강하고 독립적인 자녀를 두는 경향이 있습니다.',
    health:'칠살성의 강렬한 기운이 질액궁에 있어 사고·수술·외상에 주의하고 무리한 활동을 삼가세요.',
    travel:'칠살성의 개척 기운이 천이궁에 작용하여 도전적인 이동과 해외 개척 기회가 많습니다.',
    friend:'칠살성의 기운이 교우궁에 있어 강하고 독립적인 인맥을 형성하지만 갈등도 생길 수 있습니다.',
    career:'칠살성의 강력한 기운이 관록궁에 자리하여 군경·스포츠·창업 분야에서 강한 추진력을 발휘합니다.',
    home:'칠살성의 기운이 전택궁에 작용하여 주거 환경에 변화와 도전이 많고 독립적인 공간을 선호합니다.',
    spirit:'칠살성의 기운이 복덕궁에 자리하여 도전과 극복에서 삶의 의미를 찾는 강인한 정신세계입니다.',
    parent:'칠살성의 기운이 부모궁에 있어 부모와 독립적이고 강한 관계를 유지하며 일찍 자립하는 경향입니다.',
  },
  '破軍': {
    sibling:'파군성의 변화 기운이 형제궁에 작용하여 형제자매와 관계에 변화가 많고 독립적인 인연입니다.',
    child:'파군성의 혁신적 기운이 자녀궁에 자리하여 개성 강하고 창의적인 자녀를 두는 경향입니다.',
    health:'파군성의 파괴적 기운이 질액궁에 있어 건강 변화가 크고 생활 습관 개선이 중요합니다.',
    travel:'파군성의 변화 기운이 천이궁에 작용하여 잦은 이동과 새로운 환경에서의 도전이 많습니다.',
    friend:'파군성의 기운이 교우궁에 있어 인간관계에 변화가 많고 새로운 인맥을 계속 형성합니다.',
    career:'파군성의 혁신 기운이 관록궁에 자리하여 혁신·스타트업·예술 분야에서 새로운 길을 개척합니다.',
    home:'파군성의 기운이 전택궁에 작용하여 이사와 주거 변화가 많고 새로운 환경을 추구합니다.',
    spirit:'파군성의 기운이 복덕궁에 자리하여 끊임없는 변화와 새로운 도전에서 정신적 활력을 찾습니다.',
    parent:'파군성의 기운이 부모궁에 있어 부모와 관계에 변화가 많고 독립적인 성장을 추구합니다.',
  },
};

// ─── 점성학 상수 ──────────────────────────────────────────────

const SIGN_KO = ['양자리','황소자리','쌍둥이자리','게자리','사자자리','처녀자리','천칭자리','전갈자리','사수자리','염소자리','물병자리','물고기자리'];
const SIGN_EMOJI = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const SIGN_NAMES = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const toSignIdx = s => typeof s === 'number' ? s : SIGN_NAMES.indexOf(s);
function getSignName(idx) { return t(`sign.${idx}`) || SIGN_KO[idx]; }

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
const SJS_DESC_ML = {
  ko: [
    '생명력이 솟구치는 시작의 기운',  '감수성이 예민하고 배움이 깊은 단계',
    '성장과 도약을 준비하는 단계',    '실력을 발휘하며 활약하는 단계',
    '최고의 전성기, 강한 에너지',     '활동이 서서히 줄어드는 단계',
    '주의가 필요하며 조심해야 할 시기','완전한 끝맺음, 전환점의 단계',
    '저장과 안식, 내면 정리의 단계',  '에너지 소멸, 새 출발을 준비하는 단계',
    '새 생명의 씨앗, 잉태의 단계',    '보호와 양육을 받으며 성장하는 단계',
  ],
  en: [
    'Vital energy of new beginnings', 'Sensitive and deep learning stage',
    'Preparing for growth and leap',   'Actively demonstrating your abilities',
    'Peak prime, powerful energy',     'Activity gradually decreasing',
    'Caution needed, careful period',  'Complete ending, turning point',
    'Rest and inner reflection stage', 'Energy fading, preparing for new start',
    'Seed of new life, conception',    'Growing under protection and nurturing',
  ],
  ja: [
    '生命力が湧き出る始まりの気',     '感受性が豊かで学びが深い段階',
    '成長と飛躍を準備する段階',       '実力を発揮して活躍する段階',
    '最高の全盛期、強いエネルギー',   '活動が徐々に減少する段階',
    '注意が必要で慎重にすべき時期',   '完全な終わり、転換点の段階',
    '蓄積と安息、内面整理の段階',     'エネルギー消滅、新出発準備の段階',
    '新しい命の種、受胎の段階',       '保護と養育を受けて成長する段階',
  ],
  zh: [
    '生命力涌现的起始之气',           '感受性敏锐、学习深入的阶段',
    '准备成长与跃进的阶段',           '发挥实力、大展身手的阶段',
    '最高全盛期、强大能量',           '活动逐渐减少的阶段',
    '需要注意、谨慎行事的时期',       '完全结束、转折点的阶段',
    '储藏与安息、内心整理的阶段',     '能量消散、准备新出发的阶段',
    '新生命的种子、孕育的阶段',       '在保护与养育中成长的阶段',
  ],
  es: [
    'Energía vital de nuevos comienzos', 'Etapa de sensibilidad y aprendizaje profundo',
    'Preparando crecimiento y salto',    'Demostrando activamente tus habilidades',
    'Cima del apogeo, energía poderosa', 'Actividad disminuyendo gradualmente',
    'Precaución necesaria, período cuidadoso', 'Final completo, punto de inflexión',
    'Descanso y reflexión interior',     'Energía desvaneciéndose, preparando nuevo inicio',
    'Semilla de nueva vida, concepción', 'Creciendo bajo protección y cuidado',
  ],
};
function getSjsDesc(idx) {
  const lang = gLang();
  const arr = SJS_DESC_ML[lang] || SJS_DESC_ML.ko;
  return arr[idx] || SJS_DESC_ML.ko[idx];
}
const SJS_DESC = SJS_DESC_ML.ko;

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
    'sjs.0':getSjsDesc(0),'sjs.1':getSjsDesc(1),'sjs.2':getSjsDesc(2),'sjs.3':getSjsDesc(3),
    'sjs.4':getSjsDesc(4),'sjs.5':getSjsDesc(5),'sjs.6':getSjsDesc(6),'sjs.7':getSjsDesc(7),
    'sjs.8':getSjsDesc(8),'sjs.9':getSjsDesc(9),'sjs.10':getSjsDesc(10),'sjs.11':getSjsDesc(11),
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
    '■ 행운의 색':'■ 행운의 색',
    '● 행운의 색':'● 행운의 색',
    '✨ 자미두수 12궁 상세 해석':'✨ 자미두수 12궁 상세 해석',
    '✨ 천궁도 행성·하우스·상(Aspect) 분석':'✨ 천궁도 행성·하우스·상(Aspect) 분석',
    '감성과 영성이 필요한 분야에서 탁월합니다. 예술, 음악, 의료, 상담, 종교, 사진 분야가 잘 맞습니다. 깊은 공감 능력과 창의적 상상력이 강점입니다.':'감성과 영성이 필요한 분야에서 탁월합니다. 예술, 음악, 의료, 상담, 종교, 사진 분야가 잘 맞습니다. 깊은 공감 능력과 창의적 상상력이 강점입니다.',
    '감정적 교류에서 어려움이 있을 수 있습니다. 오해나 갈등이 생기기 쉬운 시기이므로 충동적인 감정 표현을 자제하고 신중하게 행동하는 것이 좋습니다. 혼자만의 시간을 통해 감정을 정리하세요.':'감정적 교류에서 어려움이 있을 수 있습니다. 오해나 갈등이 생기기 쉬운 시기이므로 충동적인 감정 표현을 자제하고 신중하게 행동하는 것이 좋습니다. 혼자만의 시간을 통해 감정을 정리하세요.',
    '감정적으로 깊이 연결되는 것을 원합니다. 상대를 세심하게 배려하고 보호하려 하며, 가정적인 사랑을 꿈꿉니다. 상처받으면 껍질 속으로 들어가는 경향이 있습니다.':'감정적으로 깊이 연결되는 것을 원합니다. 상대를 세심하게 배려하고 보호하려 하며, 가정적인 사랑을 꿈꿉니다. 상처받으면 껍질 속으로 들어가는 경향이 있습니다.',
    '강렬한 에너지로 추진력이 강하지만 사고·수술·구설에 주의가 필요합니다.':'강렬한 에너지로 추진력이 강하지만 사고·수술·구설에 주의가 필요합니다.',
    '강한 감수성과 예술적 재능을 가지며 이성 관계가 활발합니다.':'강한 감수성과 예술적 재능을 가지며 이성 관계가 활발합니다.',
    '강한 도전과 변화의 시기입니다. 외부 압박이나 경쟁이 심해질 수 있으나, 이를 극복하면 큰 성취를 이룰 수 있습니다. 건강 관리와 법적 문제에 각별히 주의하세요.':'강한 도전과 변화의 시기입니다. 외부 압박이나 경쟁이 심해질 수 있으나, 이를 극복하면 큰 성취를 이룰 수 있습니다. 건강 관리와 법적 문제에 각별히 주의하세요.',
    '강한 의지, 충동적 행동 주의':'강한 의지, 충동적 행동 주의',
    '강한 의지력, 극단적 기운':'강한 의지력, 극단적 기운',
    '강한 의지와 리더십이 있지만 극단적 상황이 발생할 수 있습니다.':'강한 의지와 리더십이 있지만 극단적 상황이 발생할 수 있습니다.',
    '건강 상태가 전반적으로 양호합니다. 규칙적인 생활과 적당한 운동으로 현재의 좋은 컨디션을 유지하세요. 스트레스 관리에 신경 쓰면 더욱 활기찬 생활이 가능합니다.':'건강 상태가 전반적으로 양호합니다. 규칙적인 생활과 적당한 운동으로 현재의 좋은 컨디션을 유지하세요. 스트레스 관리에 신경 쓰면 더욱 활기찬 생활이 가능합니다.',
    '건강 운이 매우 좋지 않은 시기입니다. 만성 질환이 악화되거나 새로운 건강 문제가 발생할 수 있습니다. 즉시 전문의 상담을 받고, 과로와 스트레스를 철저히 피하세요. 몸의 신호에 귀를 기울이는 것이 중요합니다.':'건강 운이 매우 좋지 않은 시기입니다. 만성 질환이 악화되거나 새로운 건강 문제가 발생할 수 있습니다. 즉시 전문의 상담을 받고, 과로와 스트레스를 철저히 피하세요. 몸의 신호에 귀를 기울이는 것이 중요합니다.',
    '건강 운이 평범한 편입니다. 특별한 이상은 없지만 과로나 스트레스에 취약할 수 있습니다. 충분한 수면과 균형 잡힌 식사로 기초 체력을 유지하는 것이 중요합니다.':'건강 운이 평범한 편입니다. 특별한 이상은 없지만 과로나 스트레스에 취약할 수 있습니다. 충분한 수면과 균형 잡힌 식사로 기초 체력을 유지하는 것이 중요합니다.',
    '건강에 주의가 필요한 시기입니다. 피로 누적이나 소화기 계통의 문제가 생길 수 있습니다. 무리한 활동을 자제하고 정기적인 건강 검진을 받는 것이 좋습니다. 충분한 휴식이 필수입니다.':'건강에 주의가 필요한 시기입니다. 피로 누적이나 소화기 계통의 문제가 생길 수 있습니다. 무리한 활동을 자제하고 정기적인 건강 검진을 받는 것이 좋습니다. 충분한 휴식이 필수입니다.',
    '게자리는 달이 지배하는 물의 별자리입니다. 감수성이 풍부하고 직관력이 뛰어나며, 가족과 가정을 무엇보다 소중히 여깁니다. 타인의 감정에 민감하게 반응하는 공감 능력이 탁월합니다. 감정 기복이 있을 수 있으며, 과거에 집착하는 경향을 의식적으로 조절하면 더 성장할 수 있습니다.':'게자리는 달이 지배하는 물의 별자리입니다. 감수성이 풍부하고 직관력이 뛰어나며, 가족과 가정을 무엇보다 소중히 여깁니다. 타인의 감정에 민감하게 반응하는 공감 능력이 탁월합니다. 감정 기복이 있을 수 있으며, 과거에 집착하는 경향을 의식적으로 조절하면 더 성장할 수 있습니다.',
    '관재구설과 소송에서 보호받으며 관운이 좋아집니다.':'관재구설과 소송에서 보호받으며 관운이 좋아집니다.',
    '균형 잡힌 아름다운 관계를 추구합니다. 로맨틱하고 우아한 사랑을 즐기며, 파트너와의 조화를 중시합니다. 갈등을 피하려는 성향이 있어 솔직한 표현이 필요합니다.':'균형 잡힌 아름다운 관계를 추구합니다. 로맨틱하고 우아한 사랑을 즐기며, 파트너와의 조화를 중시합니다. 갈등을 피하려는 성향이 있어 솔직한 표현이 필요합니다.',
    '균형과 조화가 필요한 분야에서 능력을 발휘합니다. 법률, 외교, 디자인, 패션, 상담, 중재 분야가 잘 맞습니다. 공정한 판단력과 미적 감각이 뛰어납니다.':'균형과 조화가 필요한 분야에서 능력을 발휘합니다. 법률, 외교, 디자인, 패션, 상담, 중재 분야가 잘 맞습니다. 공정한 판단력과 미적 감각이 뛰어납니다.',
    '금 기운이 과잉되어 지나친 냉정함이나 갈등을 일으킬 수 있습니다. 날카로운 언행과 무리한 경쟁을 자제하세요. 금속 소품이나 흰색 계열을 과도하게 사용하면 긴장감이 높아질 수 있습니다.':'금 기운이 과잉되어 지나친 냉정함이나 갈등을 일으킬 수 있습니다. 날카로운 언행과 무리한 경쟁을 자제하세요. 금속 소품이나 흰색 계열을 과도하게 사용하면 긴장감이 높아질 수 있습니다.',
    '금속의 날카로운 기운이 결단력과 재물운을 강화합니다. 서쪽 방향, 흰색·금색 계열이 길하며 계획적인 재테크와 자기 계발이 운을 높입니다. 원칙을 지키는 행동이 신뢰를 쌓습니다.':'금속의 날카로운 기운이 결단력과 재물운을 강화합니다. 서쪽 방향, 흰색·금색 계열이 길하며 계획적인 재테크와 자기 계발이 운을 높입니다. 원칙을 지키는 행동이 신뢰를 쌓습니다.',
    '기운이 좋은 날입니다. 계획한 일들이 진행되고 주변의 도움을 받기 쉬운 시기입니다.':'기운이 좋은 날입니다. 계획한 일들이 진행되고 주변의 도움을 받기 쉬운 시기입니다.',
    '기질의 균형이 무난한 편입니다. 장점과 단점이 공존하며, 환경에 따라 성격 표현이 달라질 수 있습니다. 자신의 강점을 의식적으로 계발하면 더 큰 잠재력을 발휘할 수 있습니다.':'기질의 균형이 무난한 편입니다. 장점과 단점이 공존하며, 환경에 따라 성격 표현이 달라질 수 있습니다. 자신의 강점을 의식적으로 계발하면 더 큰 잠재력을 발휘할 수 있습니다.',
    '기질적으로 다소 불균형한 면이 있어 감정 기복이나 결정 장애를 경험할 수 있습니다. 자기 이해를 높이고 약점을 보완하는 노력이 필요합니다. 내면의 안정을 찾는 것이 중요한 과제입니다.':'기질적으로 다소 불균형한 면이 있어 감정 기복이나 결정 장애를 경험할 수 있습니다. 자기 이해를 높이고 약점을 보완하는 노력이 필요합니다. 내면의 안정을 찾는 것이 중요한 과제입니다.',
    '깊고 강렬한 사랑을 원합니다. 상대의 영혼까지 알고 싶어하며, 완전한 신뢰와 헌신을 요구합니다. 질투심이 강할 수 있으나, 그만큼 깊이 사랑합니다.':'깊고 강렬한 사랑을 원합니다. 상대의 영혼까지 알고 싶어하며, 완전한 신뢰와 헌신을 요구합니다. 질투심이 강할 수 있으나, 그만큼 깊이 사랑합니다.',
    '꿈같은 로맨스를 꿈꿉니다. 상대를 이상화하는 경향이 있으며, 깊은 영혼의 교감을 원합니다. 감정적으로 민감하고 공감 능력이 뛰어나 상대의 마음을 잘 읽습니다.':'꿈같은 로맨스를 꿈꿉니다. 상대를 이상화하는 경향이 있으며, 깊은 영혼의 교감을 원합니다. 감정적으로 민감하고 공감 능력이 뛰어나 상대의 마음을 잘 읽습니다.',
    '나무 기운이 과잉되어 균형을 흐트러뜨립니다. 지나친 고집이나 무리한 확장을 조심하세요. 동쪽 방향과 초록색 계열을 과도하게 사용하면 에너지 소모가 커질 수 있으니 절제가 필요합니다.':'나무 기운이 과잉되어 균형을 흐트러뜨립니다. 지나친 고집이나 무리한 확장을 조심하세요. 동쪽 방향과 초록색 계열을 과도하게 사용하면 에너지 소모가 커질 수 있으니 절제가 필요합니다.',
    '나무의 기운이 부족한 명식에 생기를 불어넣습니다. 성장·창의·도전의 에너지를 보충해 주므로 동쪽 방향, 초록색 계열, 봄철 활동이 길합니다. 새로운 시작이나 사업 확장에 유리한 시기를 잘 활용하세요.':'나무의 기운이 부족한 명식에 생기를 불어넣습니다. 성장·창의·도전의 에너지를 보충해 주므로 동쪽 방향, 초록색 계열, 봄철 활동이 길합니다. 새로운 시작이나 사업 확장에 유리한 시기를 잘 활용하세요.',
    '당신의 띠는':'당신의 띠는','띠 입니다':'띠 입니다',
    'elem.목':'木 목','elem.화':'火 화','elem.토':'土 토','elem.금':'金 금','elem.수':'水 수',
    '대지의 안정된 기운이 중심을 잡아줍니다. 중앙·황토색 계열이 길하며 부동산·저축·건강 관리에 집중하면 운이 열립니다. 신뢰와 성실함으로 주변의 지지를 얻는 것이 중요합니다.':'대지의 안정된 기운이 중심을 잡아줍니다. 중앙·황토색 계열이 길하며 부동산·저축·건강 관리에 집중하면 운이 열립니다. 신뢰와 성실함으로 주변의 지지를 얻는 것이 중요합니다.',
    '대화와 지적 교감을 중시합니다. 다양한 사람에게 관심을 보이지만, 진정한 소울메이트를 찾습니다. 자유로운 관계를 선호하며 구속을 싫어합니다.':'대화와 지적 교감을 중시합니다. 다양한 사람에게 관심을 보이지만, 진정한 소울메이트를 찾습니다. 자유로운 관계를 선호하며 구속을 싫어합니다.',
    '독특하고 자유로운 사랑을 원합니다. 친구 같은 파트너를 선호하며, 지적 교감과 공통된 가치관을 중시합니다. 감정적 친밀감보다 정신적 연결을 더 중요하게 여깁니다.':'독특하고 자유로운 사랑을 원합니다. 친구 같은 파트너를 선호하며, 지적 교감과 공통된 가치관을 중시합니다. 감정적 친밀감보다 정신적 연결을 더 중요하게 여깁니다.',
    '독특한 인상':'독특한 인상',
    '돌봄과 감성이 필요한 분야에서 탁월합니다. 의료, 사회복지, 교육, 요식업, 부동산, 상담 분야가 잘 맞습니다. 사람들의 감정을 이해하고 보살피는 능력이 뛰어납니다.':'돌봄과 감성이 필요한 분야에서 탁월합니다. 의료, 사회복지, 교육, 요식업, 부동산, 상담 분야가 잘 맞습니다. 사람들의 감정을 이해하고 보살피는 능력이 뛰어납니다.',
    '로맨틱하고 극적인 사랑을 즐깁니다. 상대에게 최고의 것을 선사하고 싶어하며, 충성스럽고 열정적인 파트너입니다. 인정받지 못하면 상처를 받습니다.':'로맨틱하고 극적인 사랑을 즐깁니다. 상대에게 최고의 것을 선사하고 싶어하며, 충성스럽고 열정적인 파트너입니다. 인정받지 못하면 상처를 받습니다.',
    '리더십과 추진력이 필요한 분야에서 두각을 나타냅니다. 스포츠, 군경, 기업가, 개척 사업, 응급 의료 분야가 잘 맞습니다. 독립적으로 일하거나 팀을 이끄는 역할이 적합합니다.':'리더십과 추진력이 필요한 분야에서 두각을 나타냅니다. 스포츠, 군경, 기업가, 개척 사업, 응급 의료 분야가 잘 맞습니다. 독립적으로 일하거나 팀을 이끄는 역할이 적합합니다.',
    '말년운 (50세~)':'말년운 (50세~)',
    '멤버십 상세 분석':'멤버십 상세 분석',
    '명식 산출하기':'명식 산출하기',
    '명예와 사회적 지위가 높아지는 시기입니다. 조직 내 승진이나 인정을 받을 기회가 생기며, 책임감과 원칙을 중시하게 됩니다. 공직·전문직에서 두각을 나타낼 수 있습니다.':'명예와 사회적 지위가 높아지는 시기입니다. 조직 내 승진이나 인정을 받을 기회가 생기며, 책임감과 원칙을 중시하게 됩니다. 공직·전문직에서 두각을 나타낼 수 있습니다.',
    '몸과 마음의 에너지가 매우 충만한 시기입니다. 체력이 넘치고 면역력도 강해 활발한 활동이 가능합니다. 이 시기에 건강한 습관을 정착시키면 오랫동안 좋은 컨디션을 유지할 수 있습니다.':'몸과 마음의 에너지가 매우 충만한 시기입니다. 체력이 넘치고 면역력도 강해 활발한 활동이 가능합니다. 이 시기에 건강한 습관을 정착시키면 오랫동안 좋은 컨디션을 유지할 수 있습니다.',
    '물고기자리는 해왕성과 목성이 지배하는 물의 별자리입니다. 예민한 감수성과 깊은 공감 능력, 영적 직관이 뛰어납니다. 예술적 재능과 상상력이 풍부하며, 타인의 고통에 민감하게 반응합니다. 현실과 이상 사이에서 혼란을 겪을 수 있으므로, 경계를 설정하고 자신을 보호하는 것이 중요합니다.':'물고기자리는 해왕성과 목성이 지배하는 물의 별자리입니다. 예민한 감수성과 깊은 공감 능력, 영적 직관이 뛰어납니다. 예술적 재능과 상상력이 풍부하며, 타인의 고통에 민감하게 반응합니다. 현실과 이상 사이에서 혼란을 겪을 수 있으므로, 경계를 설정하고 자신을 보호하는 것이 중요합니다.',
    '물병자리는 천왕성과 토성이 지배하는 바람의 별자리입니다. 독창적이고 혁신적인 사고로 미래를 내다보는 능력이 있습니다. 인류애와 평등을 중시하며, 독립적이고 자유로운 정신을 가지고 있습니다. 감정적 거리감이 있을 수 있으므로, 친밀한 관계에서 따뜻함을 표현하는 연습이 도움이 됩니다.':'물병자리는 천왕성과 토성이 지배하는 바람의 별자리입니다. 독창적이고 혁신적인 사고로 미래를 내다보는 능력이 있습니다. 인류애와 평등을 중시하며, 독립적이고 자유로운 정신을 가지고 있습니다. 감정적 거리감이 있을 수 있으므로, 친밀한 관계에서 따뜻함을 표현하는 연습이 도움이 됩니다.',
    '물의 지혜로운 기운이 지식과 재물의 흐름을 원활하게 합니다. 북쪽 방향, 검정·파란색 계열이 길하며 학업·연구·금융 분야에서 두각을 나타낼 수 있습니다. 유연한 사고로 기회를 포착하세요.':'물의 지혜로운 기운이 지식과 재물의 흐름을 원활하게 합니다. 북쪽 방향, 검정·파란색 계열이 길하며 학업·연구·금융 분야에서 두각을 나타낼 수 있습니다. 유연한 사고로 기회를 포착하세요.',
    '변화와 혁신을 추구하는 시기입니다. 창의적 아이디어가 넘치고 기존 틀을 벗어나려는 욕구가 강해집니다. 직업 변화나 이직을 고려할 수 있으며, 언행에 주의가 필요합니다.':'변화와 혁신을 추구하는 시기입니다. 창의적 아이디어가 넘치고 기존 틀을 벗어나려는 욕구가 강해집니다. 직업 변화나 이직을 고려할 수 있으며, 언행에 주의가 필요합니다.',
    '부귀와 안락의 별, 재물과 명예':'부귀와 안락의 별, 재물과 명예',
    '분석과 정밀함이 필요한 분야에서 두각을 나타냅니다. 의료, 회계, 연구, 편집, 영양, 품질관리 분야가 잘 맞습니다. 세심한 주의력과 완벽을 추구하는 성향이 강점입니다.':'분석과 정밀함이 필요한 분야에서 두각을 나타냅니다. 의료, 회계, 연구, 편집, 영양, 품질관리 분야가 잘 맞습니다. 세심한 주의력과 완벽을 추구하는 성향이 강점입니다.',
    '불 기운이 과잉되어 충동적 행동이나 과열을 유발할 수 있습니다. 감정 기복과 급한 결정을 경계하세요. 빨간색 계열과 남쪽 방향을 과도하게 접하면 스트레스가 가중될 수 있습니다.':'불 기운이 과잉되어 충동적 행동이나 과열을 유발할 수 있습니다. 감정 기복과 급한 결정을 경계하세요. 빨간색 계열과 남쪽 방향을 과도하게 접하면 스트레스가 가중될 수 있습니다.',
    '불의 기운으로 열정과 표현력을 강화합니다. 남쪽 방향, 빨간색 계열이 행운을 부르며 인간관계와 명예 운이 상승합니다. 적극적인 자기 표현과 사교 활동이 운을 여는 열쇠입니다.':'불의 기운으로 열정과 표현력을 강화합니다. 남쪽 방향, 빨간색 계열이 행운을 부르며 인간관계와 명예 운이 상승합니다. 적극적인 자기 표현과 사교 활동이 운을 여는 열쇠입니다.',
    '사수자리는 목성이 지배하는 불의 별자리입니다. 자유를 사랑하고 철학적 사고와 모험 정신이 넘칩니다. 낙관적이고 유머 감각이 뛰어나며, 다양한 문화와 지식을 탐구하는 것을 즐깁니다. 무책임하거나 직설적인 말로 상처를 줄 수 있으므로, 세심한 배려가 필요합니다.':'사수자리는 목성이 지배하는 불의 별자리입니다. 자유를 사랑하고 철학적 사고와 모험 정신이 넘칩니다. 낙관적이고 유머 감각이 뛰어나며, 다양한 문화와 지식을 탐구하는 것을 즐깁니다. 무책임하거나 직설적인 말로 상처를 줄 수 있으므로, 세심한 배려가 필요합니다.',
    '사자자리는 태양이 지배하는 불의 별자리입니다. 타고난 리더십과 카리스마로 자연스럽게 주목받습니다. 창의적이고 표현력이 풍부하며, 무대 위에서 빛나는 존재감을 발휘합니다. 자존심이 강하고 인정받고 싶은 욕구가 크므로, 겸손함을 갖추면 더욱 빛납니다.':'사자자리는 태양이 지배하는 불의 별자리입니다. 타고난 리더십과 카리스마로 자연스럽게 주목받습니다. 창의적이고 표현력이 풍부하며, 무대 위에서 빛나는 존재감을 발휘합니다. 자존심이 강하고 인정받고 싶은 욕구가 크므로, 겸손함을 갖추면 더욱 빛납니다.',
    '사회적 활동과 직업 운이 매우 강한 시기입니다. 능력을 인정받고 승진이나 중요한 기회가 찾아올 수 있습니다. 새로운 프로젝트나 도전에 적극적으로 나서면 좋은 결과를 얻을 수 있습니다.':'사회적 활동과 직업 운이 매우 강한 시기입니다. 능력을 인정받고 승진이나 중요한 기회가 찾아올 수 있습니다. 새로운 프로젝트나 도전에 적극적으로 나서면 좋은 결과를 얻을 수 있습니다.',
    '성격과 기질이 안정적으로 발달해 있어 사회적 관계에서 신뢰를 쌓기 쉽습니다. 자신의 감정을 잘 조절하며, 목표를 향해 꾸준히 나아가는 힘이 있습니다. 다양한 상황에서 유연하게 대처하는 능력이 돋보입니다.':'성격과 기질이 안정적으로 발달해 있어 사회적 관계에서 신뢰를 쌓기 쉽습니다. 자신의 감정을 잘 조절하며, 목표를 향해 꾸준히 나아가는 힘이 있습니다. 다양한 상황에서 유연하게 대처하는 능력이 돋보입니다.',
    '소통과 정보를 다루는 분야에서 빛납니다. 언론, 교육, IT, 마케팅, 작가, 통역 분야가 잘 맞습니다. 다양한 분야를 넘나드는 멀티태스킹 능력이 강점입니다.':'소통과 정보를 다루는 분야에서 빛납니다. 언론, 교육, IT, 마케팅, 작가, 통역 분야가 잘 맞습니다. 다양한 분야를 넘나드는 멀티태스킹 능력이 강점입니다.',
    '수 기운이 과잉되어 우유부단함이나 과도한 걱정을 유발할 수 있습니다. 지나친 분석과 소극적 태도를 경계하세요. 검정·파란색 계열과 북쪽 방향을 과도하게 접하면 에너지가 침체될 수 있습니다.':'수 기운이 과잉되어 우유부단함이나 과도한 걱정을 유발할 수 있습니다. 지나친 분석과 소극적 태도를 경계하세요. 검정·파란색 계열과 북쪽 방향을 과도하게 접하면 에너지가 침체될 수 있습니다.',
    '신비롭고 예민한 기운이 강하게 작동할 수 있음':'신비롭고 예민한 기운이 강하게 작동할 수 있음',
    '심층 분석과 변화를 다루는 분야에서 탁월합니다. 심리학, 의학, 금융, 탐정, 연구, 위기관리 분야가 잘 맞습니다. 숨겨진 진실을 파헤치는 능력과 강한 집중력이 강점입니다.':'심층 분석과 변화를 다루는 분야에서 탁월합니다. 심리학, 의학, 금융, 탐정, 연구, 위기관리 분야가 잘 맞습니다. 숨겨진 진실을 파헤치는 능력과 강한 집중력이 강점입니다.',
    '쌍둥이자리는 수성이 지배하는 바람의 별자리입니다. 지적 호기심이 넘치고 다재다능하며, 소통과 정보 교환에 탁월합니다. 두 가지 상반된 성향이 공존하여 상황에 따라 다른 모습을 보이기도 합니다. 언어 능력과 적응력이 뛰어나 다양한 분야에서 활약할 수 있습니다.':'쌍둥이자리는 수성이 지배하는 바람의 별자리입니다. 지적 호기심이 넘치고 다재다능하며, 소통과 정보 교환에 탁월합니다. 두 가지 상반된 성향이 공존하여 상황에 따라 다른 모습을 보이기도 합니다. 언어 능력과 적응력이 뛰어나 다양한 분야에서 활약할 수 있습니다.',
    '안정적이고 실용적인 분야에서 능력을 발휘합니다. 금융, 부동산, 요리, 예술, 농업, 건축 분야가 잘 맞습니다. 장기적인 프로젝트를 꾸준히 완성하는 능력이 탁월합니다.':'안정적이고 실용적인 분야에서 능력을 발휘합니다. 금융, 부동산, 요리, 예술, 농업, 건축 분야가 잘 맞습니다. 장기적인 프로젝트를 꾸준히 완성하는 능력이 탁월합니다.',
    '안정적인 재물 축적과 내실을 다지는 시기입니다. 꾸준한 노력이 결실을 맺고 저축과 부동산 등 안정적 자산 관리에 유리합니다. 성실하게 임하면 좋은 결과를 얻습니다.':'안정적인 재물 축적과 내실을 다지는 시기입니다. 꾸준한 노력이 결실을 맺고 저축과 부동산 등 안정적 자산 관리에 유리합니다. 성실하게 임하면 좋은 결과를 얻습니다.',
    '애정 운이 좋은 편으로, 관계에서 따뜻한 교류가 이루어집니다. 진심 어린 소통이 관계를 더욱 돈독하게 만들어 줍니다. 솔직한 감정 표현이 인연을 발전시키는 열쇠가 됩니다.':'애정 운이 좋은 편으로, 관계에서 따뜻한 교류가 이루어집니다. 진심 어린 소통이 관계를 더욱 돈독하게 만들어 줍니다. 솔직한 감정 표현이 인연을 발전시키는 열쇠가 됩니다.',
    '애정 운이 평범한 편입니다. 특별한 변화보다는 현재 관계를 안정적으로 유지하는 것이 중요합니다. 상대방의 입장을 이해하려는 노력이 관계의 질을 높여줍니다.':'애정 운이 평범한 편입니다. 특별한 변화보다는 현재 관계를 안정적으로 유지하는 것이 중요합니다. 상대방의 입장을 이해하려는 노력이 관계의 질을 높여줍니다.',
    '약간의 주의가 필요한 날입니다. 중요한 결정이나 큰 지출은 미루는 것이 좋습니다.':'약간의 주의가 필요한 날입니다. 중요한 결정이나 큰 지출은 미루는 것이 좋습니다.',
    '양자리는 황도 12궁의 첫 번째 별자리로, 화성이 지배하는 불의 별자리입니다. 개척 정신과 추진력이 강하며, 새로운 일을 시작하는 데 탁월한 능력을 발휘합니다. 경쟁심이 강하고 즉흥적인 면이 있어 충동적 결정에 주의가 필요합니다. 리더십이 뛰어나고 용기 있는 행동으로 주변을 이끄는 타입입니다.':'양자리는 황도 12궁의 첫 번째 별자리로, 화성이 지배하는 불의 별자리입니다. 개척 정신과 추진력이 강하며, 새로운 일을 시작하는 데 탁월한 능력을 발휘합니다. 경쟁심이 강하고 즉흥적인 면이 있어 충동적 결정에 주의가 필요합니다. 리더십이 뛰어나고 용기 있는 행동으로 주변을 이끄는 타입입니다.',
    '에너지 소모가 클 수 있는 날입니다. 충동적인 행동을 자제하고 안정을 취하세요.':'에너지 소모가 클 수 있는 날입니다. 충동적인 행동을 자제하고 안정을 취하세요.',
    '열정과 감정의 기운, 예술적 재능':'열정과 감정의 기운, 예술적 재능',
    '열정적이고 직접적으로 감정을 표현합니다. 첫눈에 반하는 경우가 많고, 상대를 적극적으로 리드합니다. 권태기가 오면 새로운 자극이 필요합니다.':'열정적이고 직접적으로 감정을 표현합니다. 첫눈에 반하는 경우가 많고, 상대를 적극적으로 리드합니다. 권태기가 오면 새로운 자극이 필요합니다.',
    '염소자리는 토성이 지배하는 흙의 별자리입니다. 책임감이 강하고 목표를 향한 끈기와 실용적 판단력이 탁월합니다. 사회적 성공과 명예를 중시하며, 체계적이고 성실하게 기반을 쌓아갑니다. 감정 표현이 서툴고 지나치게 일에 집중하는 경향이 있어, 휴식과 감정 교류도 중요합니다.':'염소자리는 토성이 지배하는 흙의 별자리입니다. 책임감이 강하고 목표를 향한 끈기와 실용적 판단력이 탁월합니다. 사회적 성공과 명예를 중시하며, 체계적이고 성실하게 기반을 쌓아갑니다. 감정 표현이 서툴고 지나치게 일에 집중하는 경향이 있어, 휴식과 감정 교류도 중요합니다.',
    '오행 불균형으로 인해 기질적 갈등이 심할 수 있습니다. 충동적 행동이나 극단적 감정 반응에 주의가 필요합니다. 명상, 규칙적인 생활, 신뢰할 수 있는 조언자의 도움을 받는 것이 도움이 됩니다.':'오행 불균형으로 인해 기질적 갈등이 심할 수 있습니다. 충동적 행동이나 극단적 감정 반응에 주의가 필요합니다. 명상, 규칙적인 생활, 신뢰할 수 있는 조언자의 도움을 받는 것이 도움이 됩니다.',
    '완벽한 파트너를 찾기 위해 신중하게 관계를 시작합니다. 실용적이고 헌신적인 사랑을 하며, 세심한 배려로 상대를 돌봅니다. 지나친 비판은 관계를 어렵게 할 수 있습니다.':'완벽한 파트너를 찾기 위해 신중하게 관계를 시작합니다. 실용적이고 헌신적인 사랑을 하며, 세심한 배려로 상대를 돌봅니다. 지나친 비판은 관계를 어렵게 할 수 있습니다.',
    '용신을 보조하는 금 기운입니다. 정확하고 체계적인 행동이 운을 뒷받침합니다. 금속 소품이나 흰색 계열 인테리어가 이 기운을 강화하며, 계획적인 생활 패턴이 도움이 됩니다.':'용신을 보조하는 금 기운입니다. 정확하고 체계적인 행동이 운을 뒷받침합니다. 금속 소품이나 흰색 계열 인테리어가 이 기운을 강화하며, 계획적인 생활 패턴이 도움이 됩니다.',
    '용신을 보조하는 나무 기운입니다. 창의적 활동과 인간관계 확장이 간접적으로 운을 돕습니다. 식물 키우기, 등산, 새벽 산책 등 목(木) 기운을 접하는 생활 습관이 에너지를 보충해 줍니다.':'용신을 보조하는 나무 기운입니다. 창의적 활동과 인간관계 확장이 간접적으로 운을 돕습니다. 식물 키우기, 등산, 새벽 산책 등 목(木) 기운을 접하는 생활 습관이 에너지를 보충해 줍니다.',
    '용신을 보조하는 불 기운입니다. 밝고 활기찬 환경이 운의 흐름을 원활하게 합니다. 조명이 밝은 공간에서 활동하거나 따뜻한 색상의 소품을 활용하면 보조 에너지가 강화됩니다.':'용신을 보조하는 불 기운입니다. 밝고 활기찬 환경이 운의 흐름을 원활하게 합니다. 조명이 밝은 공간에서 활동하거나 따뜻한 색상의 소품을 활용하면 보조 에너지가 강화됩니다.',
    '용신을 보조하는 수 기운입니다. 지식 축적과 내면 성찰이 운을 간접적으로 강화합니다. 독서, 명상, 수영 등 수(水) 기운과 연관된 활동이 보조 에너지를 활성화합니다.':'용신을 보조하는 수 기운입니다. 지식 축적과 내면 성찰이 운을 간접적으로 강화합니다. 독서, 명상, 수영 등 수(水) 기운과 연관된 활동이 보조 에너지를 활성화합니다.',
    '용신을 보조하는 토 기운입니다. 안정적인 생활 기반이 전체 운을 뒷받침합니다. 규칙적인 식사와 수면, 꾸준한 저축 습관이 이 기운을 활성화하여 운의 토대를 다집니다.':'용신을 보조하는 토 기운입니다. 안정적인 생활 기반이 전체 운을 뒷받침합니다. 규칙적인 식사와 수면, 꾸준한 저축 습관이 이 기운을 활성화하여 운의 토대를 다집니다.',
    '의료·치유 분야에 재능이 있으며 건강 회복력이 강합니다.':'의료·치유 분야에 재능이 있으며 건강 회복력이 강합니다.',
    '의술과 건강의 별, 치료 능력':'의술과 건강의 별, 치료 능력',
    '이 대운은 천간의 기운이 일간에 영향을 미치는 시기입니다. 해당 십성의 특성을 이해하고 흐름에 맞게 대응하는 것이 중요합니다.':'이 대운은 천간의 기운이 일간에 영향을 미치는 시기입니다. 해당 십성의 특성을 이해하고 흐름에 맞게 대응하는 것이 중요합니다.',
    '이성 매력, 예술적 감각':'이성 매력, 예술적 감각',
    '이성에게 매력적으로 보이며 예술·연예 분야에 재능이 있습니다.':'이성에게 매력적으로 보이며 예술·연예 분야에 재능이 있습니다.',
    '인연의 기운이 매우 강하게 흐르고 있습니다. 새로운 만남이나 기존 관계의 깊어짐이 기대되는 시기입니다. 감정 표현이 자연스럽게 이루어지며, 상대방의 마음을 얻기에 유리한 에너지가 충만합니다.':'인연의 기운이 매우 강하게 흐르고 있습니다. 새로운 만남이나 기존 관계의 깊어짐이 기대되는 시기입니다. 감정 표현이 자연스럽게 이루어지며, 상대방의 마음을 얻기에 유리한 에너지가 충만합니다.',
    '인연의 흐름이 막혀 있는 시기입니다. 관계에서 상처를 받거나 이별의 아픔을 경험할 수 있습니다. 자신을 먼저 돌보고 내면의 상처를 치유하는 데 집중하는 것이 현명합니다.':'인연의 흐름이 막혀 있는 시기입니다. 관계에서 상처를 받거나 이별의 아픔을 경험할 수 있습니다. 자신을 먼저 돌보고 내면의 상처를 치유하는 데 집중하는 것이 현명합니다.',
    '일생 최고의 귀인을 만나는 기운으로 위기 시 강력한 도움을 받습니다.':'일생 최고의 귀인을 만나는 기운으로 위기 시 강력한 도움을 받습니다.',
    '자립심과 독립 의지가 강해지는 시기입니다. 새로운 시작과 자기 계발에 유리하며, 경쟁 속에서 실력을 키울 수 있습니다. 다만 고집이 세질 수 있으니 협력을 잊지 마세요.':'자립심과 독립 의지가 강해지는 시기입니다. 새로운 시작과 자기 계발에 유리하며, 경쟁 속에서 실력을 키울 수 있습니다. 다만 고집이 세질 수 있으니 협력을 잊지 마세요.',
    '자유롭고 모험적인 사랑을 즐깁니다. 함께 성장하고 세상을 탐험할 파트너를 원합니다. 구속받는 것을 싫어하며, 정신적 교감을 매우 중시합니다.':'자유롭고 모험적인 사랑을 즐깁니다. 함께 성장하고 세상을 탐험할 파트너를 원합니다. 구속받는 것을 싫어하며, 정신적 교감을 매우 중시합니다.',
    '자유와 확장이 필요한 분야에서 성공합니다. 교육, 여행, 출판, 법률, 철학, 해외 비즈니스 분야가 잘 맞습니다. 넓은 시야와 낙관적 에너지로 새로운 기회를 만들어냅니다.':'자유와 확장이 필요한 분야에서 성공합니다. 교육, 여행, 출판, 법률, 철학, 해외 비즈니스 분야가 잘 맞습니다. 넓은 시야와 낙관적 에너지로 새로운 기회를 만들어냅니다.',
    '재물 손실이나 예상치 못한 지출이 발생할 수 있는 시기입니다. 충동적인 소비나 투기적 투자를 자제하고 보수적인 재정 관리가 필요합니다. 보증이나 대출에 특히 주의하세요.':'재물 손실이나 예상치 못한 지출이 발생할 수 있는 시기입니다. 충동적인 소비나 투기적 투자를 자제하고 보수적인 재정 관리가 필요합니다. 보증이나 대출에 특히 주의하세요.',
    '재물 운이 매우 강하게 흐르고 있습니다. 예상치 못한 수입이나 투자 성과가 기대되는 시기입니다. 재물이 자연스럽게 모이는 흐름이므로 장기적인 재테크 계획을 세우기에 좋은 때입니다.':'재물 운이 매우 강하게 흐르고 있습니다. 예상치 못한 수입이나 투자 성과가 기대되는 시기입니다. 재물이 자연스럽게 모이는 흐름이므로 장기적인 재테크 계획을 세우기에 좋은 때입니다.',
    '재물 운이 매우 불안정한 시기입니다. 큰 재정적 손실이나 사기 피해의 위험이 있으므로 중요한 금전 거래는 반드시 전문가의 조언을 구하세요. 현금 보유를 늘리고 리스크를 최소화하는 것이 현명합니다.':'재물 운이 매우 불안정한 시기입니다. 큰 재정적 손실이나 사기 피해의 위험이 있으므로 중요한 금전 거래는 반드시 전문가의 조언을 구하세요. 현금 보유를 늘리고 리스크를 최소화하는 것이 현명합니다.',
    '재물 운이 좋은 편입니다. 수입이 안정적으로 유지되며 절약과 투자의 균형을 잘 맞출 수 있습니다. 소소한 재물 기회들이 꾸준히 찾아오는 시기입니다.':'재물 운이 좋은 편입니다. 수입이 안정적으로 유지되며 절약과 투자의 균형을 잘 맞출 수 있습니다. 소소한 재물 기회들이 꾸준히 찾아오는 시기입니다.',
    '재물 운이 평범한 편입니다. 큰 이익보다는 현재 재정 상태를 안정적으로 유지하는 것이 중요합니다. 불필요한 지출을 줄이고 저축 습관을 기르는 것이 도움이 됩니다.':'재물 운이 평범한 편입니다. 큰 이익보다는 현재 재정 상태를 안정적으로 유지하는 것이 중요합니다. 불필요한 지출을 줄이고 저축 습관을 기르는 것이 도움이 됩니다.',
    '재물복과 명예운이 좋아 안정된 삶을 누리는 기운입니다.':'재물복과 명예운이 좋아 안정된 삶을 누리는 기운입니다.',
    '전갈자리는 명왕성과 화성이 지배하는 물의 별자리입니다. 강렬한 의지와 깊이 있는 통찰력을 가지고 있습니다. 비밀을 잘 지키고 심층적인 진실을 탐구하는 능력이 탁월합니다. 집착과 질투심이 강할 수 있으므로, 신뢰를 바탕으로 한 깊은 관계를 형성하는 것이 중요합니다.':'전갈자리는 명왕성과 화성이 지배하는 물의 별자리입니다. 강렬한 의지와 깊이 있는 통찰력을 가지고 있습니다. 비밀을 잘 지키고 심층적인 진실을 탐구하는 능력이 탁월합니다. 집착과 질투심이 강할 수 있으므로, 신뢰를 바탕으로 한 깊은 관계를 형성하는 것이 중요합니다.',
    '중년운 (35~50세)':'중년운 (35~50세)',
    '직관력과 영적 감수성이 뛰어나지만 신경과민·불안 경향에 주의가 필요합니다.':'직관력과 영적 감수성이 뛰어나지만 신경과민·불안 경향에 주의가 필요합니다.',
    '직업 운이 매우 불안정한 시기입니다. 직장 변동이나 실직의 위험이 있을 수 있으므로 중요한 결정을 미루고 안정을 최우선으로 삼으세요. 신뢰할 수 있는 사람의 조언을 구하는 것이 도움이 됩니다.':'직업 운이 매우 불안정한 시기입니다. 직장 변동이나 실직의 위험이 있을 수 있으므로 중요한 결정을 미루고 안정을 최우선으로 삼으세요. 신뢰할 수 있는 사람의 조언을 구하는 것이 도움이 됩니다.',
    '직업 운이 순조롭게 흐르고 있습니다. 꾸준한 노력이 인정받는 시기로, 동료나 상사와의 관계도 원만합니다. 자신의 전문성을 더욱 갈고닦으면 더 큰 성과를 거둘 수 있습니다.':'직업 운이 순조롭게 흐르고 있습니다. 꾸준한 노력이 인정받는 시기로, 동료나 상사와의 관계도 원만합니다. 자신의 전문성을 더욱 갈고닦으면 더 큰 성과를 거둘 수 있습니다.',
    '직업 운이 평범한 편입니다. 큰 변화보다는 현재 위치에서 성실하게 임하는 것이 중요합니다. 새로운 기술이나 지식을 습득하여 경쟁력을 높이는 것이 도움이 됩니다.':'직업 운이 평범한 편입니다. 큰 변화보다는 현재 위치에서 성실하게 임하는 것이 중요합니다. 새로운 기술이나 지식을 습득하여 경쟁력을 높이는 것이 도움이 됩니다.',
    '직업적으로 어려움이 있을 수 있는 시기입니다. 직장 내 갈등이나 업무 부담이 증가할 수 있으므로 신중하게 행동하고 불필요한 마찰을 피하는 것이 좋습니다. 무리한 도전보다 현상 유지에 집중하세요.':'직업적으로 어려움이 있을 수 있는 시기입니다. 직장 내 갈등이나 업무 부담이 증가할 수 있으므로 신중하게 행동하고 불필요한 마찰을 피하는 것이 좋습니다. 무리한 도전보다 현상 유지에 집중하세요.',
    '진지하고 책임감 있는 사랑을 합니다. 장기적인 관계와 안정을 추구하며, 파트너에게 든든한 지원자가 됩니다. 감정 표현이 서툴 수 있으나 깊이 헌신합니다.':'진지하고 책임감 있는 사랑을 합니다. 장기적인 관계와 안정을 추구하며, 파트너에게 든든한 지원자가 됩니다. 감정 표현이 서툴 수 있으나 깊이 헌신합니다.',
    '창의력과 표현력이 풍부해지는 시기입니다. 재능을 발휘하고 새로운 것을 배우기에 좋으며, 음식·예술·교육 분야에서 기회가 생깁니다. 전반적으로 안정적이고 여유로운 대운입니다.':'창의력과 표현력이 풍부해지는 시기입니다. 재능을 발휘하고 새로운 것을 배우기에 좋으며, 음식·예술·교육 분야에서 기회가 생깁니다. 전반적으로 안정적이고 여유로운 대운입니다.',
    '창의성과 리더십이 필요한 분야에서 성공합니다. 연예, 예술, 경영, 교육, 정치, 이벤트 기획 분야가 잘 맞습니다. 무대 위에서 빛나는 존재감과 카리스마가 강점입니다.':'창의성과 리더십이 필요한 분야에서 성공합니다. 연예, 예술, 경영, 교육, 정치, 이벤트 기획 분야가 잘 맞습니다. 무대 위에서 빛나는 존재감과 카리스마가 강점입니다.',
    '처녀자리는 수성이 지배하는 흙의 별자리입니다. 분석력과 세심함이 뛰어나며, 완벽을 추구하는 성실한 성향입니다. 실용적이고 논리적인 사고로 문제를 해결하는 능력이 탁월합니다. 지나친 완벽주의와 자기비판에 주의하고, 있는 그대로의 자신을 인정하는 연습이 필요합니다.':'처녀자리는 수성이 지배하는 흙의 별자리입니다. 분석력과 세심함이 뛰어나며, 완벽을 추구하는 성실한 성향입니다. 실용적이고 논리적인 사고로 문제를 해결하는 능력이 탁월합니다. 지나친 완벽주의와 자기비판에 주의하고, 있는 그대로의 자신을 인정하는 연습이 필요합니다.',
    '천천히 신중하게 마음을 열지만, 한번 사랑에 빠지면 매우 헌신적입니다. 안정적이고 감각적인 사랑을 추구하며, 물질적 표현으로 애정을 드러냅니다.':'천천히 신중하게 마음을 열지만, 한번 사랑에 빠지면 매우 헌신적입니다. 안정적이고 감각적인 사랑을 추구하며, 물질적 표현으로 애정을 드러냅니다.',
    '천칭자리는 금성이 지배하는 바람의 별자리입니다. 균형과 조화를 추구하며, 아름다움과 예술적 감각이 뛰어납니다. 공정함을 중시하고 타인과의 관계에서 외교적 능력을 발휘합니다. 결정을 내리기 어려워하는 우유부단함이 있어, 자신의 내면 목소리를 믿는 연습이 중요합니다.':'천칭자리는 금성이 지배하는 바람의 별자리입니다. 균형과 조화를 추구하며, 아름다움과 예술적 감각이 뛰어납니다. 공정함을 중시하고 타인과의 관계에서 외교적 능력을 발휘합니다. 결정을 내리기 어려워하는 우유부단함이 있어, 자신의 내면 목소리를 믿는 연습이 중요합니다.',
    '청년운 (15~35세)':'청년운 (15~35세)',
    '체계와 성취가 필요한 분야에서 두각을 나타냅니다. 경영, 정치, 금융, 건축, 행정, 공학 분야가 잘 맞습니다. 장기적인 목표를 향해 꾸준히 나아가는 끈기가 강점입니다.':'체계와 성취가 필요한 분야에서 두각을 나타냅니다. 경영, 정치, 금융, 건축, 행정, 공학 분야가 잘 맞습니다. 장기적인 목표를 향해 꾸준히 나아가는 끈기가 강점입니다.',
    '초년운 (0~15세)':'초년운 (0~15세)',
    '최고 귀인성, 위기 극복':'최고 귀인성, 위기 극복',
    '최고의 귀인, 큰 도움과 인복':'최고의 귀인, 큰 도움과 인복',
    '추진력과 결단력이 강하지만 충동적 행동과 대인 갈등에 주의하세요.':'추진력과 결단력이 강하지만 충동적 행동과 대인 갈등에 주의하세요.',
    '타고난 기질이 매우 조화롭고 균형 잡혀 있습니다. 어떤 환경에서도 자신의 강점을 발휘하며, 주변 사람들에게 긍정적인 영향을 미치는 타고난 리더 기질을 지니고 있습니다. 직관력과 판단력이 뛰어나 중요한 순간에 탁월한 선택을 내립니다.':'타고난 기질이 매우 조화롭고 균형 잡혀 있습니다. 어떤 환경에서도 자신의 강점을 발휘하며, 주변 사람들에게 긍정적인 영향을 미치는 타고난 리더 기질을 지니고 있습니다. 직관력과 판단력이 뛰어나 중요한 순간에 탁월한 선택을 내립니다.',
    '토 기운이 과잉되어 정체와 고집을 유발할 수 있습니다. 변화를 두려워하거나 지나치게 보수적인 태도가 기회를 놓치게 합니다. 황토색·중앙 배치를 줄이고 유연한 사고를 키우세요.':'토 기운이 과잉되어 정체와 고집을 유발할 수 있습니다. 변화를 두려워하거나 지나치게 보수적인 태도가 기회를 놓치게 합니다. 황토색·중앙 배치를 줄이고 유연한 사고를 키우세요.',
    '평온하게 흘러가는 날입니다. 무리한 새 시도보다 기존 일을 꼼꼼히 마무리하세요.':'평온하게 흘러가는 날입니다. 무리한 새 시도보다 기존 일을 꼼꼼히 마무리하세요.',
    '하는 일마다 순탄하게 풀리는 날입니다. 새로운 시작이나 중요한 결정에 최적입니다.':'하는 일마다 순탄하게 풀리는 날입니다. 새로운 시작이나 중요한 결정에 최적입니다.',
    '하늘의 덕, 재난 소멸':'하늘의 덕, 재난 소멸',
    '하늘의 덕을 받아 재난과 액운이 자연스럽게 해소됩니다.':'하늘의 덕을 받아 재난과 액운이 자연스럽게 해소됩니다.',
    '하늘이 내린 귀인으로 어려운 상황에서 도움을 받는 강한 기운입니다.':'하늘이 내린 귀인으로 어려운 상황에서 도움을 받는 강한 기운입니다.',
    '학문·연구·영성에 관심이 높아지는 시기입니다. 내면을 탐구하고 전문 지식을 쌓기에 좋으며, 예술·의료·종교 분야에서 재능이 발휘됩니다. 고독감이 들 수 있으니 소통을 늘리세요.':'학문·연구·영성에 관심이 높아지는 시기입니다. 내면을 탐구하고 전문 지식을 쌓기에 좋으며, 예술·의료·종교 분야에서 재능이 발휘됩니다. 고독감이 들 수 있으니 소통을 늘리세요.',
    '학문과 시험의 귀인, 문장 재능':'학문과 시험의 귀인, 문장 재능',
    '학습과 성장, 귀인의 도움을 받는 시기입니다. 자격증 취득이나 학업에 유리하며, 어른이나 스승의 지원을 받을 수 있습니다. 차분하고 신중하게 임하면 좋은 결과를 얻습니다.':'학습과 성장, 귀인의 도움을 받는 시기입니다. 자격증 취득이나 학업에 유리하며, 어른이나 스승의 지원을 받을 수 있습니다. 차분하고 신중하게 임하면 좋은 결과를 얻습니다.',
    '학업·시험 운이 강하고 글재주가 뛰어나 문서·계약에 유리합니다.':'학업·시험 운이 강하고 글재주가 뛰어나 문서·계약에 유리합니다.',
    '혁신과 미래를 다루는 분야에서 빛납니다. IT, 과학, 사회운동, 방송, 인도주의 분야가 잘 맞습니다. 독창적인 아이디어와 미래를 내다보는 통찰력이 강점입니다.':'혁신과 미래를 다루는 분야에서 빛납니다. IT, 과학, 사회운동, 방송, 인도주의 분야가 잘 맞습니다. 독창적인 아이디어와 미래를 내다보는 통찰력이 강점입니다.',
    '활동성과 추진력이 강해지는 시기입니다. 재물의 유동성이 크고 인간관계가 넓어집니다. 충동적인 투자나 보증은 피하고 신중한 재무 관리가 필요합니다.':'활동성과 추진력이 강해지는 시기입니다. 재물의 유동성이 크고 인간관계가 넓어집니다. 충동적인 투자나 보증은 피하고 신중한 재무 관리가 필요합니다.',
    '활발한 재물 활동과 사교성이 높아지는 시기입니다. 사업 기회나 투자 수익이 생길 수 있으나 변동성도 큽니다. 이성 인연이 활발해지고 대인관계가 넓어집니다.':'활발한 재물 활동과 사교성이 높아지는 시기입니다. 사업 기회나 투자 수익이 생길 수 있으나 변동성도 큽니다. 이성 인연이 활발해지고 대인관계가 넓어집니다.',
    '기본 성격과 인생의 핵심 구조':'기본 성격과 인생의 핵심 구조',
    '재물·수입·금전 흐름':'재물·수입·금전 흐름',
    '배우자·연인과의 인연':'배우자·연인과의 인연',
    '형제자매·동료와의 인연':'형제자매·동료와의 인연',
    '자녀운과 창조적 에너지':'자녀운과 창조적 에너지',
    '건강·체질·질병 경향':'건강·체질·질병 경향',
    '이동·해외·외부 활동':'이동·해외·외부 활동',
    '친구·인맥·사회적 관계':'친구·인맥·사회적 관계',
    '직업·사회적 성취·명예':'직업·사회적 성취·명예',
    '부동산·주거·가정환경':'부동산·주거·가정환경',
    '정신세계·복·내면의 행복':'정신세계·복·내면의 행복',
    '부모운·윗사람과의 관계':'부모운·윗사람과의 관계',
    '황소자리는 금성이 지배하는 흙의 별자리입니다. 안정과 물질적 풍요를 중시하며, 한번 결정한 것은 끝까지 밀고 나가는 끈기가 있습니다. 감각적인 즐거움과 아름다움을 사랑하며, 신뢰할 수 있는 든든한 파트너입니다. 변화에 저항하는 고집스러운 면이 있어 유연성을 기르는 것이 중요합니다.':'황소자리는 금성이 지배하는 흙의 별자리입니다. 안정과 물질적 풍요를 중시하며, 한번 결정한 것은 끝까지 밀고 나가는 끈기가 있습니다. 감각적인 즐거움과 아름다움을 사랑하며, 신뢰할 수 있는 든든한 파트너입니다. 변화에 저항하는 고집스러운 면이 있어 유연성을 기르는 것이 중요합니다.',
    '12운성':'12운성','생애 에너지 흐름':'생애 에너지 흐름',
    '※ 사주·자미두수·점성학 원국과 현재 날짜를 기반으로 자동 계산됩니다. 참고용으로 활용하세요.':'※ 사주·자미두수·점성학 원국과 현재 날짜를 기반으로 자동 계산됩니다. 참고용으로 활용하세요.',
    '✅ 8글자 원국 전체 해석':'✅ 8글자 원국 전체 해석',
    '✅ AI 종합 해석 포함':'✅ AI 종합 해석 포함',
    '✅ 대운 흐름 · 세운 분석':'✅ 대운 흐름 · 세운 분석',
    '✅ 자미두수 12궁 상세 해석':'✅ 자미두수 12궁 상세 해석',
    '✅ 천궁도 행성·하우스·상(Aspect) 분석':'✅ 천궁도 행성·하우스·상(Aspect) 분석',
    '⭐대길 ✨길 🌀평 ⚡소흉 ⚠️흉 · ● 행운의 색':'⭐대길 ✨길 🌀평 ⚡소흉 ⚠️흉 · ● 행운의 색',
    '가장 필요한 기운':'가장 필요한 기운',
    '감성·본능':'감성·본능',
    '감정과 인연의 에너지':'감정과 인연의 에너지',
    '건강운':'건강운',
    '계산 중 오류가 발생했습니다.':'계산 중 오류가 발생했습니다.',
    '계산 중… 잠시만 기다려주세요.':'계산 중… 잠시만 기다려주세요.',
    '금성 현재 위치':'금성 현재 위치',
    '기본 운명 (명궁)':'기본 운명 (명궁)',
    '기본 운세':'기본 운세',
    '기신':'기신',
    '길(吉)':'길(吉)',
    '남성':'남성',
    '년주':'년주',
    '다른 생년월일로 다시 보기':'다른 생년월일로 다시 보기',
    '달 별자리':'달 별자리',
    '대길(大吉)':'대길(大吉)',
    '멤버십 전용 상세 분석':'멤버십 전용 상세 분석',
    '목성 현재 위치':'목성 현재 위치',
    '몸과 마음의 균형 에너지':'몸과 마음의 균형 에너지',
    '보조 도움 기운':'보조 도움 기운',
    '사주 · 자미두수 · 점성학 세 시스템 통합 분석 (회원가입 불필요)':'사주 · 자미두수 · 점성학 세 시스템 통합 분석 (회원가입 불필요)',
    '사주 원국 기반':'사주 원국 기반',
    '사주팔자 · 자미두수 · 천궁도 전체 결과를PDF로 정리하여 제공합니다.':'사주팔자 · 자미두수 · 천궁도 전체 결과를PDF로 정리하여 제공합니다.',
    '사회적 활동과 성취 흐름':'사회적 활동과 성취 흐름',
    '상승궁 (ASC)':'상승궁 (ASC)',
    '생년월일시를 선택하면 사주·자미두수·점성학 무료 운세를 확인합니다.':'생년월일시를 선택하면 사주·자미두수·점성학 무료 운세를 확인합니다.',
    '생년월일을 입력해주세요.':'생년월일을 입력해주세요.',
    '서양 천궁도 분석':'서양 천궁도 분석',
    '성향':'성향',
    '소흉(小凶)':'소흉(小凶)',
    '시주':'시주',
    '신강':'신강',
    '신약':'신약',
    '애정운':'애정운',
    '여성':'여성',
    '오늘':'오늘',
    '오늘의 운세':'오늘의 운세',
    '오행 분포':'오행 분포',
    '올바른 연도를 입력해주세요.':'올바른 연도를 입력해주세요.',
    '올해 성장 영역':'올해 성장 영역',
    '용신':'용신',
    '용신 분석':'용신 분석',
    '운세 지수':'운세 지수',
    '운세를 계산하는 중입니다…':'운세를 계산하는 중입니다…',
    '월주':'월주',
    '이 궁에는 주성이 없어 대궁(對宮) 성향으로 판단합니다.':'이 궁에는 주성이 없어 대궁(對宮) 성향으로 판단합니다.',
    '이번달 애정·재물':'이번달 애정·재물',
    '인연 성향 (부처궁)':'인연 성향 (부처궁)',
    '일간 강약':'일간 강약',
    '일간 강약과 오행 균형':'일간 강약과 오행 균형',
    '일간 기준 · 사주 각 기둥의 생명 단계':'일간 기준 · 사주 각 기둥의 생명 단계',
    '일주':'일주',
    '일진 분석':'일진 분석',
    '자미두수':'자미두수',
    '재물 성향 (재백궁)':'재물 성향 (재백궁)',
    '재물과 기회의 흐름':'재물과 기회의 흐름',
    '재물운':'재물운',
    '점성학':'점성학',
    '조심해야 할 기운':'조심해야 할 기운',
    '직업운':'직업운',
    '첫인상·외면':'첫인상·외면',
    '출생 연도':'출생 연도',
    '타고난 기질과 성격의 흐름':'타고난 기질과 성격의 흐름',
    '타인에게 비치는 첫인상과 외면적 태도를 나타냅니다.':'타인에게 비치는 첫인상과 외면적 태도를 나타냅니다.',
    '태양 별자리':'태양 별자리',
    '평(平)':'평(平)',
    '핵심 정체성':'핵심 정체성',
    '행운의 방향':'행운의 방향',
    '행운의 색':'행운의 색',
    '행운의 숫자':'행운의 숫자',
    '흉(凶)':'흉(凶)',
    '희신':'희신',
    '🔐 멤버십 상세 분석':'🔐 멤버십 상세 분석',
    '🔮 무료 운세':'🔮 무료 운세',
    '🔮 무료 운세 보기 (사주 · 자미두수 · 점성학)':'🔮 무료 운세 보기 (사주 · 자미두수 · 점성학)',
    '🔮 무료 운세 탭':'🔮 무료 운세 탭',
    '신살 분석':'신살 분석','대운 십성':'대운 십성','당신의 별자리는':'당신의 별자리는','입니다':'입니다',
    '원국':'원국','사주 원국의 특수 기운 분석':'사주 원국의 특수 기운 분석',
    'sinsal.천을귀인':'천을귀인','sinsal.천덕귀인':'천덕귀인','sinsal.월덕귀인':'월덕귀인',
    'sinsal.태극귀인':'태극귀인','sinsal.문창귀인':'문창귀인',
    'sinsal.천의성':'천의성','sinsal.금여성':'금여성','sinsal.화개':'화개',
    'sinsal.귀문관살':'귀문관살','sinsal.백호살':'백호살',
    'sinsal.괴강살':'괴강살','sinsal.양인살':'양인살',
    'sinsal.도화살':'도화살','sinsal.홍염살':'홍염살',
    '대운 (大運)':'대운 (大運)','현재 나이':'현재 나이','순행':'순행','역행':'역행',
    '현재 대운':'현재 대운','지난 대운':'지난 대운','미래 대운':'미래 대운',
    '세':'세','양년':'양년','대운수':'대운수','대운 십성':'대운 십성',
    'day.0':'일','day.1':'월','day.2':'화','day.3':'수','day.4':'목','day.5':'금','day.6':'토',
    '점':'점','개':'개',
    '운성.장생':'장생','운성.목욕':'목욕','운성.관대':'관대','운성.임관':'임관','운성.제왕':'제왕',
    '운성.쇠':'쇠','운성.병':'병','운성.사':'사','운성.묘':'묘','운성.절':'절','운성.태':'태','운성.양':'양',
    '비견':'비견','겁재':'겁재','식신':'식신','상관':'상관','편재':'편재','정재':'정재','편관':'편관','정관':'정관','편인':'편인','정인':'정인',
    'grade.강':'강','grade.중':'중','grade.약':'약',
    '연애 스타일':'연애 스타일','직업 적성':'직업 적성',
    '현재 행성 위치 · 지금 나에게 영향을 주는 에너지':'현재 행성 위치 · 지금 나에게 영향을 주는 에너지',
    '월의 덕, 관재 소멸':'월의 덕, 관재 소멸','강한 기운, 사고·수술 주의':'강한 기운, 사고·수술 주의',
    'sign.0':'양자리','sign.1':'황소자리','sign.2':'쌍둥이자리','sign.3':'게자리','sign.4':'사자자리','sign.5':'처녀자리','sign.6':'천칭자리','sign.7':'전갈자리','sign.8':'사수자리','sign.9':'염소자리','sign.10':'물병자리','sign.11':'물고기자리',
    'moon.intro':'감정적으로','moon.suffix':'의 에너지가 강하게 작용하여, 내면의 안정을 찾는 방식과 무의식적 반응 패턴에 영향을 줍니다.',
    'asc.mid':'의 에너지가 상승궁에 위치하여, 처음 만나는 사람들에게','asc.suffix':'을 주는 경향이 있습니다.'
  },
  en: {
    '기본 운세':'Basic Fortune','사주 원국 기반':'Based on birth chart',
    '오늘의 운세':"Today's Fortune",'일진 분석':'Daily reading',
    '용신 분석':'Yong-Shin Analysis','일간 강약과 오행 균형':'Day Master strength & element balance',
    '12운성':'12 Life Stages','생애 에너지 흐름':'Life Energy Flow','일간 기준 · 사주 각 기둥의 생명 단계':'Day Master basis · Life stage of each pillar',
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
    '⭐대길 ✨길 🌀평 ⚡소흉 ⚠️흉 · ● 행운의 색':'⭐Great ✨Good 🌀Neutral ⚡Caution ⚠️Bad · ● Lucky color',
    '오늘':'Today',
    '생년월일시를 선택하면 사주·자미두수·점성학 무료 운세를 확인합니다.':'Select your birth date & time for a free Saju · Ziwei · Astrology reading.',
    '출생 연도':'Birth Year','남성':'Male','여성':'Female',
    '🔮 무료 운세 보기 (사주 · 자미두수 · 점성학)':'🔮 View Free Fortune (Saju · Ziwei · Astrology)',
    '대길(大吉)':'Great Fortune','길(吉)':'Fortune','평(平)':'Neutral','소흉(小凶)':'Caution','흉(凶)':'Misfortune',
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
    '■ 행운의 색':'■ Lucky Color',
    '● 행운의 색':'● Lucky Color',
    '✨ 자미두수 12궁 상세 해석':'✨ Zi Wei Dou Shu 12 Palaces Detailed Interpretation',
    '✨ 천궁도 행성·하우스·상(Aspect) 분석':'✨ Natal Chart Planet, House, and Aspect Analysis',
    '감성과 영성이 필요한 분야에서 탁월합니다. 예술, 음악, 의료, 상담, 종교, 사진 분야가 잘 맞습니다. 깊은 공감 능력과 창의적 상상력이 강점입니다.':'You excel in fields that require sensitivity and spirituality. Arts, music, healthcare, counseling, religion, and photography suit you well. Your strengths lie in deep empathy and creative imagination.',
    '감정적 교류에서 어려움이 있을 수 있습니다. 오해나 갈등이 생기기 쉬운 시기이므로 충동적인 감정 표현을 자제하고 신중하게 행동하는 것이 좋습니다. 혼자만의 시간을 통해 감정을 정리하세요.':'Emotional exchanges may be challenging. This is a period prone to misunderstandings and conflicts, so it is advisable to refrain from impulsive emotional expressions and act with caution. Take time alone to organize your feelings.',
    '감정적으로 깊이 연결되는 것을 원합니다. 상대를 세심하게 배려하고 보호하려 하며, 가정적인 사랑을 꿈꿉니다. 상처받으면 껍질 속으로 들어가는 경향이 있습니다.':'You desire deep emotional connections. You carefully consider and protect others, dreaming of a loving, family-oriented relationship. When hurt, you tend to retreat into your shell.',
    '강렬한 에너지로 추진력이 강하지만 사고·수술·구설에 주의가 필요합니다.':'You have strong driving energy and momentum but need to be cautious of accidents, surgeries, and disputes.',
    '강한 감수성과 예술적 재능을 가지며 이성 관계가 활발합니다.':'You possess heightened sensitivity and artistic talent, with active romantic relationships.',
    '강한 도전과 변화의 시기입니다. 외부 압박이나 경쟁이 심해질 수 있으나, 이를 극복하면 큰 성취를 이룰 수 있습니다. 건강 관리와 법적 문제에 각별히 주의하세요.':'This is a time of strong challenges and changes. External pressure and competition may intensify, but overcoming them can lead to great achievements. Pay special attention to health management and legal matters.',
    '강한 의지, 충동적 행동 주의':'Strong willpower, caution against impulsive actions',
    '강한 의지력, 극단적 기운':'Strong willpower, extreme energies',
    '강한 의지와 리더십이 있지만 극단적 상황이 발생할 수 있습니다.':'You have strong will and leadership, but extreme situations may arise.',
    '건강 상태가 전반적으로 양호합니다. 규칙적인 생활과 적당한 운동으로 현재의 좋은 컨디션을 유지하세요. 스트레스 관리에 신경 쓰면 더욱 활기찬 생활이 가능합니다.':'Your overall health condition is good. Maintain your current good condition through regular routines and moderate exercise. Managing stress will help you live a more vibrant life.',
    '건강 운이 매우 좋지 않은 시기입니다. 만성 질환이 악화되거나 새로운 건강 문제가 발생할 수 있습니다. 즉시 전문의 상담을 받고, 과로와 스트레스를 철저히 피하세요. 몸의 신호에 귀를 기울이는 것이 중요합니다.':'This is a period of very poor health luck. Chronic illnesses may worsen or new health issues may arise. Seek immediate professional medical advice and strictly avoid overwork and stress. Listening to your body\'s signals is crucial.',
    '건강 운이 평범한 편입니다. 특별한 이상은 없지만 과로나 스트레스에 취약할 수 있습니다. 충분한 수면과 균형 잡힌 식사로 기초 체력을 유지하는 것이 중요합니다.':'Your health luck is average. No particular abnormalities, but you may be vulnerable to overwork and stress. Maintaining basic physical strength through sufficient sleep and balanced nutrition is important.',
    '건강에 주의가 필요한 시기입니다. 피로 누적이나 소화기 계통의 문제가 생길 수 있습니다. 무리한 활동을 자제하고 정기적인 건강 검진을 받는 것이 좋습니다. 충분한 휴식이 필수입니다.':'This is a time to pay attention to your health. Fatigue accumulation or digestive issues may occur. Avoid excessive activities and get regular health check-ups. Adequate rest is essential.',
    '게자리는 달이 지배하는 물의 별자리입니다. 감수성이 풍부하고 직관력이 뛰어나며, 가족과 가정을 무엇보다 소중히 여깁니다. 타인의 감정에 민감하게 반응하는 공감 능력이 탁월합니다. 감정 기복이 있을 수 있으며, 과거에 집착하는 경향을 의식적으로 조절하면 더 성장할 수 있습니다.':'Cancer is a water sign ruled by the Moon. It is rich in sensitivity and intuition, valuing family and home above all. You have excellent empathy, reacting sensitively to others\' emotions. Emotional ups and downs may occur, and consciously managing a tendency to cling to the past will help you grow.',
    '관재구설과 소송에서 보호받으며 관운이 좋아집니다.':'You are protected from disputes, lawsuits, and enjoy good official luck.',
    '균형 잡힌 아름다운 관계를 추구합니다. 로맨틱하고 우아한 사랑을 즐기며, 파트너와의 조화를 중시합니다. 갈등을 피하려는 성향이 있어 솔직한 표현이 필요합니다.':'You seek balanced and beautiful relationships. You enjoy romantic and elegant love, valuing harmony with your partner. You tend to avoid conflicts, so honest expression is necessary.',
    '균형과 조화가 필요한 분야에서 능력을 발휘합니다. 법률, 외교, 디자인, 패션, 상담, 중재 분야가 잘 맞습니다. 공정한 판단력과 미적 감각이 뛰어납니다.':'You demonstrate ability in fields requiring balance and harmony. Law, diplomacy, design, fashion, counseling, and mediation suit you well. You have excellent fair judgment and aesthetic sense.',
    '금 기운이 과잉되어 지나친 냉정함이나 갈등을 일으킬 수 있습니다. 날카로운 언행과 무리한 경쟁을 자제하세요. 금속 소품이나 흰색 계열을 과도하게 사용하면 긴장감이 높아질 수 있습니다.':'Excessive Metal energy may cause excessive coldness or conflicts. Refrain from sharp words and excessive competition. Overuse of metallic items or white tones can increase tension.',
    '금속의 날카로운 기운이 결단력과 재물운을 강화합니다. 서쪽 방향, 흰색·금색 계열이 길하며 계획적인 재테크와 자기 계발이 운을 높입니다. 원칙을 지키는 행동이 신뢰를 쌓습니다.':'The sharp energy of metal enhances decisiveness and wealth luck. The west direction and white or gold colors are auspicious. Planned financial management and self-development improve your fortune. Acting with principles builds trust.',
    '기운이 좋은 날입니다. 계획한 일들이 진행되고 주변의 도움을 받기 쉬운 시기입니다.':'This is a day with good energy. Planned matters progress smoothly, and you are likely to receive help from those around you.',
    '기질의 균형이 무난한 편입니다. 장점과 단점이 공존하며, 환경에 따라 성격 표현이 달라질 수 있습니다. 자신의 강점을 의식적으로 계발하면 더 큰 잠재력을 발휘할 수 있습니다.':'Your temperament balance is generally moderate. Strengths and weaknesses coexist, and personality expression may vary depending on the environment. Consciously developing your strengths can unleash greater potential.',
    '기질적으로 다소 불균형한 면이 있어 감정 기복이나 결정 장애를 경험할 수 있습니다. 자기 이해를 높이고 약점을 보완하는 노력이 필요합니다. 내면의 안정을 찾는 것이 중요한 과제입니다.':'There is a somewhat unbalanced temperament, which may cause emotional fluctuations or decision-making difficulties. It is necessary to enhance self-understanding and work on compensating for weaknesses. Finding inner stability is an important task.',
    '깊고 강렬한 사랑을 원합니다. 상대의 영혼까지 알고 싶어하며, 완전한 신뢰와 헌신을 요구합니다. 질투심이 강할 수 있으나, 그만큼 깊이 사랑합니다.':'You desire a deep and intense love. You want to know your partner\'s soul and demand complete trust and devotion. Jealousy may be strong, but it reflects the depth of your love.',
    '꿈같은 로맨스를 꿈꿉니다. 상대를 이상화하는 경향이 있으며, 깊은 영혼의 교감을 원합니다. 감정적으로 민감하고 공감 능력이 뛰어나 상대의 마음을 잘 읽습니다.':'You dream of a romantic, dream-like love. There is a tendency to idealize your partner, and you seek profound soul connection. Emotionally sensitive and highly empathetic, you can easily read others\' feelings.',
    '나무 기운이 과잉되어 균형을 흐트러뜨립니다. 지나친 고집이나 무리한 확장을 조심하세요. 동쪽 방향과 초록색 계열을 과도하게 사용하면 에너지 소모가 커질 수 있으니 절제가 필요합니다.':'Excessive Wood energy disrupts balance. Be cautious of stubbornness or overexpansion. Overusing the east direction and green hues may lead to energy depletion, so moderation is necessary.',
    '나무의 기운이 부족한 명식에 생기를 불어넣습니다. 성장·창의·도전의 에너지를 보충해 주므로 동쪽 방향, 초록색 계열, 봄철 활동이 길합니다. 새로운 시작이나 사업 확장에 유리한 시기를 잘 활용하세요.':'This breathes life into a chart lacking Wood energy. It replenishes growth, creativity, and challenge energies, making the east direction, green colors, and spring activities auspicious. Make good use of favorable times for new beginnings or business expansion.',
    '당신의 띠는':'Your zodiac sign is','띠 입니다':' Year',
    'elem.목':'Wood (木)','elem.화':'Fire (火)','elem.토':'Earth (土)','elem.금':'Metal (金)','elem.수':'Water (水)',
    '대지의 안정된 기운이 중심을 잡아줍니다. 중앙·황토색 계열이 길하며 부동산·저축·건강 관리에 집중하면 운이 열립니다. 신뢰와 성실함으로 주변의 지지를 얻는 것이 중요합니다.':'The stable energy of Earth grounds you. Central and earth-tone colors are auspicious, and focusing on real estate, savings, and health management will open your luck. Gaining support through trust and sincerity is important.',
    '대화와 지적 교감을 중시합니다. 다양한 사람에게 관심을 보이지만, 진정한 소울메이트를 찾습니다. 자유로운 관계를 선호하며 구속을 싫어합니다.':'You value conversation and intellectual connection. While interested in many people, you seek a true soulmate. You prefer free relationships and dislike constraints.',
    '독특하고 자유로운 사랑을 원합니다. 친구 같은 파트너를 선호하며, 지적 교감과 공통된 가치관을 중시합니다. 감정적 친밀감보다 정신적 연결을 더 중요하게 여깁니다.':'You desire a unique and free love. You prefer a partner like a friend and value intellectual rapport and shared values. Mental connection is more important than emotional intimacy.',
    '독특한 인상':'A distinctive impression',
    '돌봄과 감성이 필요한 분야에서 탁월합니다. 의료, 사회복지, 교육, 요식업, 부동산, 상담 분야가 잘 맞습니다. 사람들의 감정을 이해하고 보살피는 능력이 뛰어납니다.':'You excel in fields requiring care and sensitivity. Medical, social welfare, education, food service, real estate, and counseling are well-suited. You have a strong ability to understand and nurture others\' emotions.',
    '로맨틱하고 극적인 사랑을 즐깁니다. 상대에게 최고의 것을 선사하고 싶어하며, 충성스럽고 열정적인 파트너입니다. 인정받지 못하면 상처를 받습니다.':'You enjoy romantic and dramatic love. You want to offer the best to your partner and are loyal and passionate. You get hurt if unappreciated.',
    '리더십과 추진력이 필요한 분야에서 두각을 나타냅니다. 스포츠, 군경, 기업가, 개척 사업, 응급 의료 분야가 잘 맞습니다. 독립적으로 일하거나 팀을 이끄는 역할이 적합합니다.':'You stand out in fields requiring leadership and drive. Sports, military/police, entrepreneurship, pioneering businesses, and emergency medical services suit you well. Working independently or leading a team fits you best.',
    '말년운 (50세~)':'Later years fortune (age 50 and beyond)',
    '멤버십 상세 분석':'Membership detailed analysis',
    '명식 산출하기':'Calculating the Four Pillars chart',
    '명예와 사회적 지위가 높아지는 시기입니다. 조직 내 승진이나 인정을 받을 기회가 생기며, 책임감과 원칙을 중시하게 됩니다. 공직·전문직에서 두각을 나타낼 수 있습니다.':'This is a period when honor and social status rise. Opportunities for promotion or recognition within organizations arise, and you become more focused on responsibility and principles. You may excel in public office or professional fields.',
    '몸과 마음의 에너지가 매우 충만한 시기입니다. 체력이 넘치고 면역력도 강해 활발한 활동이 가능합니다. 이 시기에 건강한 습관을 정착시키면 오랫동안 좋은 컨디션을 유지할 수 있습니다.':'A time of abundant physical and mental energy. You have strong stamina and immunity, enabling active pursuits. Establishing healthy habits now can maintain good condition for a long time.',
    '물고기자리는 해왕성과 목성이 지배하는 물의 별자리입니다. 예민한 감수성과 깊은 공감 능력, 영적 직관이 뛰어납니다. 예술적 재능과 상상력이 풍부하며, 타인의 고통에 민감하게 반응합니다. 현실과 이상 사이에서 혼란을 겪을 수 있으므로, 경계를 설정하고 자신을 보호하는 것이 중요합니다.':'Pisces is a water sign ruled by Neptune and Jupiter. It features sensitive sensibility, deep empathy, and strong spiritual intuition. Artistic talent and imagination are abundant, and you respond sensitively to others\' suffering. You may experience confusion between reality and ideals, so setting boundaries and protecting yourself is important.',
    '물병자리는 천왕성과 토성이 지배하는 바람의 별자리입니다. 독창적이고 혁신적인 사고로 미래를 내다보는 능력이 있습니다. 인류애와 평등을 중시하며, 독립적이고 자유로운 정신을 가지고 있습니다. 감정적 거리감이 있을 수 있으므로, 친밀한 관계에서 따뜻함을 표현하는 연습이 도움이 됩니다.':'Aquarius is an air sign ruled by Uranus and Saturn. It has original and innovative thinking with the ability to foresee the future. Valuing humanity and equality, it possesses an independent and free spirit. Emotional distance may exist, so practicing warmth in close relationships is helpful.',
    '물의 지혜로운 기운이 지식과 재물의 흐름을 원활하게 합니다. 북쪽 방향, 검정·파란색 계열이 길하며 학업·연구·금융 분야에서 두각을 나타낼 수 있습니다. 유연한 사고로 기회를 포착하세요.':'The wise energy of Water facilitates the flow of knowledge and wealth. The north direction and black/blue colors are auspicious, highlighting academic, research, and financial fields. Capture opportunities with flexible thinking.',
    '변화와 혁신을 추구하는 시기입니다. 창의적 아이디어가 넘치고 기존 틀을 벗어나려는 욕구가 강해집니다. 직업 변화나 이직을 고려할 수 있으며, 언행에 주의가 필요합니다.':'This is a time to pursue change and innovation. Creative ideas overflow, and there is a strong desire to break free from existing frameworks. Career changes or job transitions may be considered, and caution in words and actions is advised.',
    '부귀와 안락의 별, 재물과 명예':'The star of wealth and comfort, symbolizing riches and honor.',
    '분석과 정밀함이 필요한 분야에서 두각을 나타냅니다. 의료, 회계, 연구, 편집, 영양, 품질관리 분야가 잘 맞습니다. 세심한 주의력과 완벽을 추구하는 성향이 강점입니다.':'You excel in fields requiring analysis and precision. Medical, accounting, research, editing, nutrition, and quality control fields suit you well. Attention to detail and a perfectionist nature are your strengths.',
    '불 기운이 과잉되어 충동적 행동이나 과열을 유발할 수 있습니다. 감정 기복과 급한 결정을 경계하세요. 빨간색 계열과 남쪽 방향을 과도하게 접하면 스트레스가 가중될 수 있습니다.':'Excessive Fire energy can cause impulsive behavior or overheating. Beware of emotional swings and hasty decisions. Overexposure to red hues and the south direction may increase stress.',
    '불의 기운으로 열정과 표현력을 강화합니다. 남쪽 방향, 빨간색 계열이 행운을 부르며 인간관계와 명예 운이 상승합니다. 적극적인 자기 표현과 사교 활동이 운을 여는 열쇠입니다.':'Enhance passion and expressiveness with the energy of fire. The southern direction and red hues invite luck, boosting relationships and honor. Active self-expression and social activities are the keys to opening your fortune.',
    '사수자리는 목성이 지배하는 불의 별자리입니다. 자유를 사랑하고 철학적 사고와 모험 정신이 넘칩니다. 낙관적이고 유머 감각이 뛰어나며, 다양한 문화와 지식을 탐구하는 것을 즐깁니다. 무책임하거나 직설적인 말로 상처를 줄 수 있으므로, 세심한 배려가 필요합니다.':'Sagittarius is a fire sign ruled by Jupiter. It loves freedom and overflows with philosophical thinking and adventurous spirit. Optimistic and witty, it enjoys exploring diverse cultures and knowledge. Careful consideration is needed as careless or blunt words may cause hurt.',
    '사자자리는 태양이 지배하는 불의 별자리입니다. 타고난 리더십과 카리스마로 자연스럽게 주목받습니다. 창의적이고 표현력이 풍부하며, 무대 위에서 빛나는 존재감을 발휘합니다. 자존심이 강하고 인정받고 싶은 욕구가 크므로, 겸손함을 갖추면 더욱 빛납니다.':'Leo is a fire sign ruled by the Sun. Naturally drawing attention with innate leadership and charisma, it is creative and expressive, shining brightly on stage. With strong pride and a great desire for recognition, humility will make it shine even more.',
    '사회적 활동과 직업 운이 매우 강한 시기입니다. 능력을 인정받고 승진이나 중요한 기회가 찾아올 수 있습니다. 새로운 프로젝트나 도전에 적극적으로 나서면 좋은 결과를 얻을 수 있습니다.':'This is a period of strong social activity and career fortune. Your abilities will be recognized, and promotions or important opportunities may arise. Actively engaging in new projects or challenges will yield good results.',
    '성격과 기질이 안정적으로 발달해 있어 사회적 관계에서 신뢰를 쌓기 쉽습니다. 자신의 감정을 잘 조절하며, 목표를 향해 꾸준히 나아가는 힘이 있습니다. 다양한 상황에서 유연하게 대처하는 능력이 돋보입니다.':'Your personality and temperament are stably developed, making it easy to build trust in social relationships. You regulate your emotions well and have the strength to steadily pursue your goals. Your ability to adapt flexibly in various situations stands out.',
    '소통과 정보를 다루는 분야에서 빛납니다. 언론, 교육, IT, 마케팅, 작가, 통역 분야가 잘 맞습니다. 다양한 분야를 넘나드는 멀티태스킹 능력이 강점입니다.':'You shine in fields involving communication and information. Careers in media, education, IT, marketing, writing, and interpretation suit you well. Your strong multitasking ability across diverse fields is a key strength.',
    '수 기운이 과잉되어 우유부단함이나 과도한 걱정을 유발할 수 있습니다. 지나친 분석과 소극적 태도를 경계하세요. 검정·파란색 계열과 북쪽 방향을 과도하게 접하면 에너지가 침체될 수 있습니다.':'Excessive water energy may cause indecisiveness or excessive worry. Beware of over-analysis and passive attitudes. Excessive exposure to black or blue tones and the northern direction can lead to energy stagnation.',
    '신비롭고 예민한 기운이 강하게 작동할 수 있음':'A strong operation of mystical and sensitive energy may occur.',
    '심층 분석과 변화를 다루는 분야에서 탁월합니다. 심리학, 의학, 금융, 탐정, 연구, 위기관리 분야가 잘 맞습니다. 숨겨진 진실을 파헤치는 능력과 강한 집중력이 강점입니다.':'You excel in fields involving deep analysis and transformation. Psychology, medicine, finance, detective work, research, and crisis management suit you well. Your ability to uncover hidden truths and strong concentration are your strengths.',
    '쌍둥이자리는 수성이 지배하는 바람의 별자리입니다. 지적 호기심이 넘치고 다재다능하며, 소통과 정보 교환에 탁월합니다. 두 가지 상반된 성향이 공존하여 상황에 따라 다른 모습을 보이기도 합니다. 언어 능력과 적응력이 뛰어나 다양한 분야에서 활약할 수 있습니다.':'Gemini is an air sign ruled by Mercury. It overflows with intellectual curiosity and versatility, excelling in communication and information exchange. Two contrasting tendencies coexist, showing different sides depending on the situation. Excellent language skills and adaptability allow you to thrive in various fields.',
    '안정적이고 실용적인 분야에서 능력을 발휘합니다. 금융, 부동산, 요리, 예술, 농업, 건축 분야가 잘 맞습니다. 장기적인 프로젝트를 꾸준히 완성하는 능력이 탁월합니다.':'You demonstrate ability in stable and practical fields. Finance, real estate, cooking, arts, agriculture, and architecture suit you well. Your skill in steadily completing long-term projects is outstanding.',
    '안정적인 재물 축적과 내실을 다지는 시기입니다. 꾸준한 노력이 결실을 맺고 저축과 부동산 등 안정적 자산 관리에 유리합니다. 성실하게 임하면 좋은 결과를 얻습니다.':'This is a time for stable wealth accumulation and solidifying your foundation. Steady efforts bear fruit, favoring stable asset management such as savings and real estate. Diligence will bring good results.',
    '애정 운이 좋은 편으로, 관계에서 따뜻한 교류가 이루어집니다. 진심 어린 소통이 관계를 더욱 돈독하게 만들어 줍니다. 솔직한 감정 표현이 인연을 발전시키는 열쇠가 됩니다.':'Love fortune is favorable, bringing warm exchanges in relationships. Sincere communication strengthens bonds. Honest emotional expression is the key to deepening connections.',
    '애정 운이 평범한 편입니다. 특별한 변화보다는 현재 관계를 안정적으로 유지하는 것이 중요합니다. 상대방의 입장을 이해하려는 노력이 관계의 질을 높여줍니다.':'Love fortune is average. Maintaining stability in current relationships is more important than special changes. Efforts to understand your partner’s perspective will improve relationship quality.',
    '약간의 주의가 필요한 날입니다. 중요한 결정이나 큰 지출은 미루는 것이 좋습니다.':'A day requiring some caution. It is best to postpone important decisions or large expenditures.',
    '양자리는 황도 12궁의 첫 번째 별자리로, 화성이 지배하는 불의 별자리입니다. 개척 정신과 추진력이 강하며, 새로운 일을 시작하는 데 탁월한 능력을 발휘합니다. 경쟁심이 강하고 즉흥적인 면이 있어 충동적 결정에 주의가 필요합니다. 리더십이 뛰어나고 용기 있는 행동으로 주변을 이끄는 타입입니다.':'Aries is the first sign of the zodiac, a fire sign ruled by Mars. It has a pioneering spirit and strong drive, excelling at starting new ventures. Competitive and impulsive, caution is needed against rash decisions. With excellent leadership and courageous actions, it naturally leads those around.',
    '에너지 소모가 클 수 있는 날입니다. 충동적인 행동을 자제하고 안정을 취하세요.':'Energy consumption may be high today. Control impulsive actions and seek stability.',
    '열정과 감정의 기운, 예술적 재능':'The energy of passion, emotion, and artistic talent.',
    '열정적이고 직접적으로 감정을 표현합니다. 첫눈에 반하는 경우가 많고, 상대를 적극적으로 리드합니다. 권태기가 오면 새로운 자극이 필요합니다.':'Passionate and direct in expressing emotions. Often falls in love at first sight and actively leads the partner. When boredom arises, new stimulation is needed.',
    '염소자리는 토성이 지배하는 흙의 별자리입니다. 책임감이 강하고 목표를 향한 끈기와 실용적 판단력이 탁월합니다. 사회적 성공과 명예를 중시하며, 체계적이고 성실하게 기반을 쌓아갑니다. 감정 표현이 서툴고 지나치게 일에 집중하는 경향이 있어, 휴식과 감정 교류도 중요합니다.':'Capricorn is an earth sign ruled by Saturn. It is highly responsible with persistence toward goals and excellent practical judgment. It values social success and honor, building a foundation systematically and diligently. Emotionally reserved and overly focused on work, rest and emotional exchange are also important.',
    '오행 불균형으로 인해 기질적 갈등이 심할 수 있습니다. 충동적 행동이나 극단적 감정 반응에 주의가 필요합니다. 명상, 규칙적인 생활, 신뢰할 수 있는 조언자의 도움을 받는 것이 도움이 됩니다.':'Severe temperament conflicts may arise due to imbalance in the five elements. Caution is needed against impulsive behavior or extreme emotional reactions. Meditation, a regular lifestyle, and trusted advisors can be helpful.',
    '완벽한 파트너를 찾기 위해 신중하게 관계를 시작합니다. 실용적이고 헌신적인 사랑을 하며, 세심한 배려로 상대를 돌봅니다. 지나친 비판은 관계를 어렵게 할 수 있습니다.':'Carefully starts relationships to find the perfect partner. Practices practical and devoted love, caring for the partner with meticulous attention. Excessive criticism can make relationships difficult.',
    '용신을 보조하는 금 기운입니다. 정확하고 체계적인 행동이 운을 뒷받침합니다. 금속 소품이나 흰색 계열 인테리어가 이 기운을 강화하며, 계획적인 생활 패턴이 도움이 됩니다.':'Metal energy supporting the essential element (Yongshin). Precise and systematic actions back your fortune. Metal accessories or white-themed interiors enhance this energy, and a planned lifestyle is beneficial.',
    '용신을 보조하는 나무 기운입니다. 창의적 활동과 인간관계 확장이 간접적으로 운을 돕습니다. 식물 키우기, 등산, 새벽 산책 등 목(木) 기운을 접하는 생활 습관이 에너지를 보충해 줍니다.':'Wood energy supporting the essential element (Yongshin). Creative activities and expanding human relationships indirectly aid your fortune. Habits involving wood energy, such as plant care, hiking, or early morning walks, replenish your energy.',
    '용신을 보조하는 불 기운입니다. 밝고 활기찬 환경이 운의 흐름을 원활하게 합니다. 조명이 밝은 공간에서 활동하거나 따뜻한 색상의 소품을 활용하면 보조 에너지가 강화됩니다.':'Fire energy supporting the essential element (Yongshin). Bright and lively environments smooth the flow of fortune. Activities in well-lit spaces or using warm-colored items strengthen this supportive energy.',
    '용신을 보조하는 수 기운입니다. 지식 축적과 내면 성찰이 운을 간접적으로 강화합니다. 독서, 명상, 수영 등 수(水) 기운과 연관된 활동이 보조 에너지를 활성화합니다.':'This is the Water energy that supports the Yongsin (useful god). Accumulating knowledge and engaging in inner reflection indirectly strengthen your fortune. Activities related to Water energy, such as reading, meditation, and swimming, activate supportive energy.',
    '용신을 보조하는 토 기운입니다. 안정적인 생활 기반이 전체 운을 뒷받침합니다. 규칙적인 식사와 수면, 꾸준한 저축 습관이 이 기운을 활성화하여 운의 토대를 다집니다.':'This is the Earth energy that supports the Yongsin (useful god). A stable living foundation underpins your overall fortune. Regular meals and sleep, along with consistent saving habits, activate this energy to build the groundwork of your luck.',
    '의료·치유 분야에 재능이 있으며 건강 회복력이 강합니다.':'You have talents in the medical and healing fields, with strong health recovery abilities.',
    '의술과 건강의 별, 치료 능력':'The star of medicine and health, healing abilities.',
    '이 대운은 천간의 기운이 일간에 영향을 미치는 시기입니다. 해당 십성의 특성을 이해하고 흐름에 맞게 대응하는 것이 중요합니다.':'This major luck cycle is a period when the energy of the Heavenly Stem influences the Day Master. It is important to understand the characteristics of the corresponding Ten Gods and respond accordingly to the flow.',
    '이성 매력, 예술적 감각':'Attraction to the opposite sex, artistic sensibility.',
    '이성에게 매력적으로 보이며 예술·연예 분야에 재능이 있습니다.':'You appear attractive to the opposite sex and have talents in the arts and entertainment fields.',
    '인연의 기운이 매우 강하게 흐르고 있습니다. 새로운 만남이나 기존 관계의 깊어짐이 기대되는 시기입니다. 감정 표현이 자연스럽게 이루어지며, 상대방의 마음을 얻기에 유리한 에너지가 충만합니다.':'The energy of relationships flows very strongly. This is a time to expect new encounters or deepening of existing bonds. Emotional expression happens naturally, and the energy is favorable for winning the heart of the other person.',
    '인연의 흐름이 막혀 있는 시기입니다. 관계에서 상처를 받거나 이별의 아픔을 경험할 수 있습니다. 자신을 먼저 돌보고 내면의 상처를 치유하는 데 집중하는 것이 현명합니다.':'This is a period when the flow of relationships is blocked. You may experience wounds or the pain of separation in relationships. It is wise to focus on self-care and healing your inner wounds first.',
    '일생 최고의 귀인을 만나는 기운으로 위기 시 강력한 도움을 받습니다.':'This energy brings the best benefactor of your life, offering powerful help in times of crisis.',
    '자립심과 독립 의지가 강해지는 시기입니다. 새로운 시작과 자기 계발에 유리하며, 경쟁 속에서 실력을 키울 수 있습니다. 다만 고집이 세질 수 있으니 협력을 잊지 마세요.':'This is a period when self-reliance and independence strengthen. It is favorable for new beginnings and self-development, allowing you to build skills amid competition. However, be mindful of stubbornness and remember to cooperate.',
    '자유롭고 모험적인 사랑을 즐깁니다. 함께 성장하고 세상을 탐험할 파트너를 원합니다. 구속받는 것을 싫어하며, 정신적 교감을 매우 중시합니다.':'You enjoy free and adventurous love. You seek a partner to grow with and explore the world together. You dislike being constrained and highly value spiritual connection.',
    '자유와 확장이 필요한 분야에서 성공합니다. 교육, 여행, 출판, 법률, 철학, 해외 비즈니스 분야가 잘 맞습니다. 넓은 시야와 낙관적 에너지로 새로운 기회를 만들어냅니다.':'You succeed in fields requiring freedom and expansion. Education, travel, publishing, law, philosophy, and overseas business suit you well. With broad vision and optimistic energy, you create new opportunities.',
    '재물 손실이나 예상치 못한 지출이 발생할 수 있는 시기입니다. 충동적인 소비나 투기적 투자를 자제하고 보수적인 재정 관리가 필요합니다. 보증이나 대출에 특히 주의하세요.':'This is a period when financial loss or unexpected expenses may occur. Avoid impulsive spending and speculative investments, and practice conservative financial management. Be especially cautious with guarantees or loans.',
    '재물 운이 매우 강하게 흐르고 있습니다. 예상치 못한 수입이나 투자 성과가 기대되는 시기입니다. 재물이 자연스럽게 모이는 흐름이므로 장기적인 재테크 계획을 세우기에 좋은 때입니다.':'Financial luck flows very strongly. Unexpected income or investment gains are expected. Wealth naturally accumulates, making this a good time to plan long-term financial strategies.',
    '재물 운이 매우 불안정한 시기입니다. 큰 재정적 손실이나 사기 피해의 위험이 있으므로 중요한 금전 거래는 반드시 전문가의 조언을 구하세요. 현금 보유를 늘리고 리스크를 최소화하는 것이 현명합니다.':'Financial luck is very unstable during this period. There is a risk of major financial loss or fraud, so always seek expert advice for important monetary transactions. Increasing cash reserves and minimizing risks is wise.',
    '재물 운이 좋은 편입니다. 수입이 안정적으로 유지되며 절약과 투자의 균형을 잘 맞출 수 있습니다. 소소한 재물 기회들이 꾸준히 찾아오는 시기입니다.':'Financial luck is relatively good. Income remains stable, and you can balance saving and investing well. Small financial opportunities come steadily.',
    '재물 운이 평범한 편입니다. 큰 이익보다는 현재 재정 상태를 안정적으로 유지하는 것이 중요합니다. 불필요한 지출을 줄이고 저축 습관을 기르는 것이 도움이 됩니다.':'Financial luck is average. Maintaining your current financial status steadily is more important than large gains. Reducing unnecessary expenses and cultivating saving habits will help.',
    '재물복과 명예운이 좋아 안정된 삶을 누리는 기운입니다.':'This energy brings wealth and honor luck, allowing you to enjoy a stable life.',
    '전갈자리는 명왕성과 화성이 지배하는 물의 별자리입니다. 강렬한 의지와 깊이 있는 통찰력을 가지고 있습니다. 비밀을 잘 지키고 심층적인 진실을 탐구하는 능력이 탁월합니다. 집착과 질투심이 강할 수 있으므로, 신뢰를 바탕으로 한 깊은 관계를 형성하는 것이 중요합니다.':'Scorpio is a water sign ruled by Pluto and Mars. It possesses intense willpower and profound insight. You excel at keeping secrets and exploring deep truths. Obsession and jealousy may be strong, so forming deep relationships based on trust is important.',
    '중년운 (35~50세)':'Midlife luck (ages 35–50).',
    '직관력과 영적 감수성이 뛰어나지만 신경과민·불안 경향에 주의가 필요합니다.':'You have excellent intuition and spiritual sensitivity but need to be cautious of nervousness and anxiety tendencies.',
    '직업 운이 매우 불안정한 시기입니다. 직장 변동이나 실직의 위험이 있을 수 있으므로 중요한 결정을 미루고 안정을 최우선으로 삼으세요. 신뢰할 수 있는 사람의 조언을 구하는 것이 도움이 됩니다.':'Career luck is very unstable during this time. There may be job changes or risk of unemployment, so postpone important decisions and prioritize stability. Seeking advice from trustworthy people will help.',
    '직업 운이 순조롭게 흐르고 있습니다. 꾸준한 노력이 인정받는 시기로, 동료나 상사와의 관계도 원만합니다. 자신의 전문성을 더욱 갈고닦으면 더 큰 성과를 거둘 수 있습니다.':'Career luck flows smoothly. This is a period when steady effort is recognized, and relationships with colleagues and superiors are harmonious. Refining your expertise further can lead to greater achievements.',
    '직업 운이 평범한 편입니다. 큰 변화보다는 현재 위치에서 성실하게 임하는 것이 중요합니다. 새로운 기술이나 지식을 습득하여 경쟁력을 높이는 것이 도움이 됩니다.':'Career luck is average. It is important to diligently fulfill your current position rather than seeking major changes. Acquiring new skills or knowledge to enhance competitiveness will be beneficial.',
    '직업적으로 어려움이 있을 수 있는 시기입니다. 직장 내 갈등이나 업무 부담이 증가할 수 있으므로 신중하게 행동하고 불필요한 마찰을 피하는 것이 좋습니다. 무리한 도전보다 현상 유지에 집중하세요.':'This is a period where you may face professional difficulties. Conflicts at work or increased workload can arise, so it is wise to act cautiously and avoid unnecessary friction. Focus on maintaining the status quo rather than taking reckless challenges.',
    '진지하고 책임감 있는 사랑을 합니다. 장기적인 관계와 안정을 추구하며, 파트너에게 든든한 지원자가 됩니다. 감정 표현이 서툴 수 있으나 깊이 헌신합니다.':'You love with seriousness and responsibility. You seek long-term relationships and stability, becoming a reliable supporter for your partner. Although you may be awkward in expressing emotions, your devotion runs deep.',
    '창의력과 표현력이 풍부해지는 시기입니다. 재능을 발휘하고 새로운 것을 배우기에 좋으며, 음식·예술·교육 분야에서 기회가 생깁니다. 전반적으로 안정적이고 여유로운 대운입니다.':'This is a time when creativity and expressiveness flourish. It’s a good period to showcase your talents and learn new things, with opportunities arising in food, art, and education fields. Overall, it is a stable and relaxed major fortune.',
    '창의성과 리더십이 필요한 분야에서 성공합니다. 연예, 예술, 경영, 교육, 정치, 이벤트 기획 분야가 잘 맞습니다. 무대 위에서 빛나는 존재감과 카리스마가 강점입니다.':'You succeed in fields requiring creativity and leadership. Entertainment, arts, management, education, politics, and event planning suit you well. Your presence shines on stage, and your charisma is a strong asset.',
    '처녀자리는 수성이 지배하는 흙의 별자리입니다. 분석력과 세심함이 뛰어나며, 완벽을 추구하는 성실한 성향입니다. 실용적이고 논리적인 사고로 문제를 해결하는 능력이 탁월합니다. 지나친 완벽주의와 자기비판에 주의하고, 있는 그대로의 자신을 인정하는 연습이 필요합니다.':'Virgo is an earth sign ruled by Mercury. It excels in analytical skills and meticulousness, with a sincere nature that pursues perfection. You have outstanding problem-solving abilities through practical and logical thinking. Beware of excessive perfectionism and self-criticism, and practice accepting yourself as you are.',
    '천천히 신중하게 마음을 열지만, 한번 사랑에 빠지면 매우 헌신적입니다. 안정적이고 감각적인 사랑을 추구하며, 물질적 표현으로 애정을 드러냅니다.':'You open your heart slowly and cautiously, but once in love, you are deeply devoted. You seek stable and sensual love, expressing affection through material gestures.',
    '천칭자리는 금성이 지배하는 바람의 별자리입니다. 균형과 조화를 추구하며, 아름다움과 예술적 감각이 뛰어납니다. 공정함을 중시하고 타인과의 관계에서 외교적 능력을 발휘합니다. 결정을 내리기 어려워하는 우유부단함이 있어, 자신의 내면 목소리를 믿는 연습이 중요합니다.':'Libra is an air sign ruled by Venus. It pursues balance and harmony, with a keen sense of beauty and artistic sensibility. You value fairness and demonstrate diplomatic skills in relationships with others. Indecisiveness can make decision-making difficult, so practicing trust in your inner voice is important.',
    '청년운 (15~35세)':'Youth Fortune (Ages 15–35)',
    '체계와 성취가 필요한 분야에서 두각을 나타냅니다. 경영, 정치, 금융, 건축, 행정, 공학 분야가 잘 맞습니다. 장기적인 목표를 향해 꾸준히 나아가는 끈기가 강점입니다.':'You stand out in fields requiring structure and achievement. Management, politics, finance, architecture, administration, and engineering suit you well. Your perseverance in steadily pursuing long-term goals is a strong point.',
    '초년운 (0~15세)':'Early Years Fortune (Ages 0–15)',
    '최고 귀인성, 위기 극복':'Highest Nobleman Star, Overcoming Crises',
    '최고의 귀인, 큰 도움과 인복':'The greatest nobleman, offering great help and blessings.',
    '추진력과 결단력이 강하지만 충동적 행동과 대인 갈등에 주의하세요.':'You possess strong drive and decisiveness but be cautious of impulsive actions and interpersonal conflicts.',
    '타고난 기질이 매우 조화롭고 균형 잡혀 있습니다. 어떤 환경에서도 자신의 강점을 발휘하며, 주변 사람들에게 긍정적인 영향을 미치는 타고난 리더 기질을 지니고 있습니다. 직관력과 판단력이 뛰어나 중요한 순간에 탁월한 선택을 내립니다.':'Your innate temperament is very harmonious and balanced. You demonstrate your strengths in any environment and have a natural leadership quality that positively influences those around you. Your intuition and judgment are excellent, enabling you to make outstanding choices at critical moments.',
    '토 기운이 과잉되어 정체와 고집을 유발할 수 있습니다. 변화를 두려워하거나 지나치게 보수적인 태도가 기회를 놓치게 합니다. 황토색·중앙 배치를 줄이고 유연한 사고를 키우세요.':'Excessive earth energy can cause stagnation and stubbornness. Fear of change or overly conservative attitudes may cause missed opportunities. Reduce yellow earth tones and central placements, and cultivate flexible thinking.',
    '평온하게 흘러가는 날입니다. 무리한 새 시도보다 기존 일을 꼼꼼히 마무리하세요.':'It is a day flowing peacefully. Rather than attempting reckless new ventures, carefully finish existing tasks.',
    '하는 일마다 순탄하게 풀리는 날입니다. 새로운 시작이나 중요한 결정에 최적입니다.':'Everything you do goes smoothly today. It is optimal for new beginnings or important decisions.',
    '하늘의 덕, 재난 소멸':'Heavenly virtue, disaster elimination.',
    '하늘의 덕을 받아 재난과 액운이 자연스럽게 해소됩니다.':'Receiving heavenly virtue, disasters and misfortunes naturally dissipate.',
    '하늘이 내린 귀인으로 어려운 상황에서 도움을 받는 강한 기운입니다.':'A nobleman sent from heaven, a strong energy that helps you in difficult situations.',
    '학문·연구·영성에 관심이 높아지는 시기입니다. 내면을 탐구하고 전문 지식을 쌓기에 좋으며, 예술·의료·종교 분야에서 재능이 발휘됩니다. 고독감이 들 수 있으니 소통을 늘리세요.':'This is a period of increased interest in scholarship, research, and spirituality. It is good for exploring your inner self and accumulating specialized knowledge, with talents manifesting in art, medicine, and religion. You may feel lonely, so increase communication.',
    '학문과 시험의 귀인, 문장 재능':'Nobleman of scholarship and exams, talent in writing.',
    '학습과 성장, 귀인의 도움을 받는 시기입니다. 자격증 취득이나 학업에 유리하며, 어른이나 스승의 지원을 받을 수 있습니다. 차분하고 신중하게 임하면 좋은 결과를 얻습니다.':'A time for learning and growth, receiving help from noble benefactors. Favorable for obtaining certifications or academic pursuits, with support from elders or teachers. Calm and careful efforts will yield good results.',
    '학업·시험 운이 강하고 글재주가 뛰어나 문서·계약에 유리합니다.':'Strong fortune in academics and exams, excellent writing skills favor documents and contracts.',
    '혁신과 미래를 다루는 분야에서 빛납니다. IT, 과학, 사회운동, 방송, 인도주의 분야가 잘 맞습니다. 독창적인 아이디어와 미래를 내다보는 통찰력이 강점입니다.':'You shine in fields dealing with innovation and the future. IT, science, social movements, broadcasting, and humanitarian work suit you well. Your originality and foresight are your strengths.',
    '활동성과 추진력이 강해지는 시기입니다. 재물의 유동성이 크고 인간관계가 넓어집니다. 충동적인 투자나 보증은 피하고 신중한 재무 관리가 필요합니다.':'This is a period when activity and drive become strong. Financial liquidity is high, and social relationships expand. Avoid impulsive investments or guarantees, and practice careful financial management.',
    '활발한 재물 활동과 사교성이 높아지는 시기입니다. 사업 기회나 투자 수익이 생길 수 있으나 변동성도 큽니다. 이성 인연이 활발해지고 대인관계가 넓어집니다.':'This is a time of active financial activity and increased sociability. Business opportunities or investment profits may arise, but volatility is also high. Romantic connections become lively, and interpersonal relationships broaden.',
    '기본 성격과 인생의 핵심 구조':'Core personality and life structure',
    '재물·수입·금전 흐름':'Wealth, income and financial flow',
    '배우자·연인과의 인연':'Spouse and romantic relationships',
    '형제자매·동료와의 인연':'Siblings and colleagues',
    '자녀운과 창조적 에너지':'Children fortune and creative energy',
    '건강·체질·질병 경향':'Health, constitution and illness tendencies',
    '이동·해외·외부 활동':'Travel, overseas and external activities',
    '친구·인맥·사회적 관계':'Friends, networks and social relations',
    '직업·사회적 성취·명예':'Career, social achievement and honor',
    '부동산·주거·가정환경':'Real estate, housing and home environment',
    '정신세계·복·내면의 행복':'Inner world, blessings and inner happiness',
    '부모운·윗사람과의 관계':'Parents fortune and relationships with superiors',
    '황소자리는 금성이 지배하는 흙의 별자리입니다. 안정과 물질적 풍요를 중시하며, 한번 결정한 것은 끝까지 밀고 나가는 끈기가 있습니다. 감각적인 즐거움과 아름다움을 사랑하며, 신뢰할 수 있는 든든한 파트너입니다. 변화에 저항하는 고집스러운 면이 있어 유연성을 기르는 것이 중요합니다.':'Taurus is an earth sign ruled by Venus. It values stability and material abundance, showing perseverance to see decisions through to the end. It loves sensual pleasures and beauty, making it a reliable and steadfast partner. However, it can be stubborn and resistant to change, so cultivating flexibility is important.',
    '신살 분석':'Special Stars','대운 십성':'Fortune Cycle Star','당신의 별자리는':'Your zodiac sign is','입니다':'',
    '원국':'Natal','사주 원국의 특수 기운 분석':'Special energy analysis of natal Saju',
    '길신':'Auspicious Stars','긍정적인 기운':'Positive energy',
    '흉신':'Inauspicious Stars','주의가 필요한 기운':'Energy requiring caution',
    '중성 신살':'Neutral Stars','상황에 따라 달라지는 기운':'Energy that varies by situation',
    'sinsal.천을귀인':'Heavenly Nobleman Star','sinsal.천덕귀인':'Heavenly Virtue Star','sinsal.월덕귀인':'Monthly Virtue Star',
    'sinsal.태극귀인':'Taiji Nobleman Star','sinsal.문창귀인':'Literary Nobleman Star',
    'sinsal.천의성':'Heavenly Physician Star','sinsal.금여성':'Golden Carriage Star','sinsal.화개':'Canopy Star',
    'sinsal.귀문관살':'Ghost Gate Star','sinsal.백호살':'White Tiger Star',
    'sinsal.괴강살':'Powerful Authority Star','sinsal.양인살':'Yang Blade Star',
    'sinsal.도화살':'Peach Blossom Star','sinsal.홍염살':'Red Charm Star',
    '대운 (大運)':'Grand Fortune Cycle','현재 나이':'Current Age','순행':'Forward','역행':'Reverse',
    '현재 대운':'Current Cycle','지난 대운':'Past Cycle','미래 대운':'Future Cycle',
    '세':'','양년':'yang yr','대운수':'cycle age','대운 십성':'Fortune Cycle Star',
    'day.0':'Sun','day.1':'Mon','day.2':'Tue','day.3':'Wed','day.4':'Thu','day.5':'Fri','day.6':'Sat',
    '점':'pts','개':'',
    '운성.장생':'Birth','운성.목욕':'Bathing','운성.관대':'Crown','운성.임관':'Official','운성.제왕':'Emperor',
    '운성.쇠':'Decline','운성.병':'Illness','운성.사':'Death','운성.묘':'Tomb','운성.절':'Void','운성.태':'Seed','운성.양':'Nurture',
    '비견':'Rob. Wealth','겁재':'Comp. Wealth','식신':'Food God','상관':'Hurt Officer','편재':'Irreg. Wealth','정재':'Reg. Wealth','편관':'7 Killings','정관':'Reg. Officer','편인':'Irreg. Resource','정인':'Reg. Resource',
    'grade.강':'High','grade.중':'Mid','grade.약':'Low',
    '연애 스타일':'Love Style','직업 적성':'Career Aptitude',
    '현재 행성 위치 · 지금 나에게 영향을 주는 에너지':'Current Planets · Energy affecting you now',
    '월의 덕, 관재 소멸':'Monthly virtue, legal troubles dispelled','강한 기운, 사고·수술 주의':'Strong energy; beware accidents & surgery',
    'sign.0':'Aries','sign.1':'Taurus','sign.2':'Gemini','sign.3':'Cancer','sign.4':'Leo','sign.5':'Virgo','sign.6':'Libra','sign.7':'Scorpio','sign.8':'Sagittarius','sign.9':'Capricorn','sign.10':'Aquarius','sign.11':'Pisces',
    'moon.intro':'Emotionally,','moon.suffix':"'s energy acts powerfully, shaping how you seek inner stability and unconscious response patterns.",
    'asc.mid':"'s energy in your Ascendant tends to give people",'asc.suffix':'as their first impression.',
    '무료 해석':'Free Reading','핵심 3궁':'Core 3 Palaces','핵심 3요소':'Core 3 Elements',
    '멤버십 전용':'Membership Only','나머지 9궁':'Remaining 9 Palaces','상세 해석 제공':'Detailed Analysis Available',
    '현재 대운':'Current Fortune Cycle','지난 대운':'Past Cycle','미래 대운':'Future Cycle',
    '멤버십에서 상세 해석 확인':'View full reading in Membership',
    '공궁':'Empty Palace',
    '멤버십 전용 · 자미두수 12궁 완전 해석':'Membership Only · Full 12-Palace Zi Wei Reading',
    '형제·자녀·질액·천이·교우·관록·전택·복덕·부모궁 + 사화 분석 + 대운·유년 연계 해석을 멤버십에서 확인하세요.':'Siblings, Children, Health, Travel, Friends, Career, Home, Fortune & Parents + Four Transformations + Major/Annual cycles — members only.',
    '멤버십 전용 · 심층 점성술 해석':'Membership Only · Astrology In-Depth',
    '멤버십 전용 · 심층 점성술 완전 해석':'Membership Only · Complete Astrology Reading',
    '점성술 멤버십 배너 설명':'Full Natal Chart, Transits, Solar Return, Psychological Astrology, Career, Wealth & Love, Synastry, Astrocartography — available for members.',
    '각 신살의 연애·직업·건강 영역별 심층 분석, AI 종합 해석을 멤버십에서 확인하세요.':'In-depth analysis of each star on love, career & health — AI insights for members.',
    '네이탈 차트 완전 해석':'Complete Natal Chart','심리 점성학':'Psychological Astrology',
    '직업운 심층 해석':'Career Fortune In-Depth','재물운 심층 해석':'Wealth Fortune In-Depth',
    '연애·결혼운 심층 해석':'Love & Marriage In-Depth','트랜짓 미래운':'Transit Fortune',
    '솔라 리턴 (생일 1년 운세)':'Solar Return (Annual Fortune)','프로그레션 (내면 성장)':'Progressions (Inner Growth)',
    '시나스트리 궁합':'Synastry Compatibility','컴포지트 관계 차트':'Composite Chart',
    '아스트로카토그래피':'Astrocartography','건강 점성학':'Medical Astrology',
    '카르마·영혼 해석':'Karma & Soul Reading','역행 행성 해석':'Retrograde Planet Reading',
    '12하우스 전체 해석':'Full 12-House Reading','행성 각도 심층 해석':'Aspects In-Depth',
    '태양·달·상승궁·10행성 전체 분석, 하우스 배치, 행성 각도 해석':'Sun, Moon, ASC & 10 planets — house placements & aspects',
    '내면 상처, 반복 패턴, 불안 원인, 자기방어 방식, 치유 방향':'Inner wounds, recurring patterns, anxiety roots & healing path',
    '10하우스·MC·6하우스 분석, 적합 직종, 커리어 전환 시기, 승진운':'10th/MC/6th house, best careers, career-change timing & promotion',
    '2·8하우스 분석, 수입 방식, 투자 성향, 배우자 재산, 상속·대출':'2nd/8th house, income style, investment, spouse wealth & loans',
    '금성·화성·7하우스 분석, 배우자상, 결혼 시기, 이별 패턴':'Venus/Mars/7th house, ideal partner, marriage timing & breakup patterns',
    '현재 행성이 내 차트에 주는 영향, 올해 운세, 직업·연애·재물 변화 시기':'Current planetary influences, this year fortune & timing of major changes',
    '생일부터 다음 생일까지 핵심 주제, 직업·연애·재물·건강운':'Key themes birthday to birthday: career, love, wealth & health',
    '진행 태양·달·금성으로 보는 심리적 변화와 인생 단계 흐름':'Psychological evolution & life stages via progressed Sun, Moon & Venus',
    '두 사람 차트 비교, 감정·대화·성적 끌림·결혼 안정성 분석':'Two-chart comparison: emotional, communication & attraction analysis',
    '두 사람이 만들어낸 관계 자체의 운명, 목적, 장기성 분석':'The relationship destiny, purpose & long-term potential',
    '지역별 운세, 이민·유학·사업·연애에 유리한 나라와 도시':'Regional fortune: best countries & cities for life, study, business & love',
    '취약 신체 부위, 건강 경향, 별자리별 주의 질환 분석':'Vulnerable body areas, health tendencies & sign-specific illness',
    '북쪽·남쪽 노드, 키론, 전생 패턴, 이번 생의 영혼 과제':'North/South nodes, Chiron, past-life patterns & soul mission',
    '출생차트 역행 행성의 내면화된 에너지와 특수 재능 분석':'Internalized energy & special talents of natal retrograde planets',
    '인생 12개 분야(자아·재물·형제·가정·연애·건강·결혼·변화·철학·직업·인맥·영성)':'All 12 life areas: self, wealth, siblings, home, love, health, marriage, change, philosophy, career, networks & spirit',
    '합·섹스타일·스퀘어·트라인·오포지션 전체 각도 분석':'Full analysis of conjunction, sextile, square, trine & opposition',
  },
  ja: {
    '기본 운세':'基本運勢','사주 원국 기반':'四柱原局より',
    '오늘의 운세':'今日の運勢','일진 분석':'日辰分析',
    '용신 분석':'用神分析','일간 강약과 오행 균형':'日干強弱と五行バランス',
    '12운성':'十二運星','생애 에너지 흐름':'生涯エネルギーの流れ','일간 기준 · 사주 각 기둥의 생명 단계':'日干基準 · 各柱の生命段階',
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
    '■ 행운의 색':'■ 幸運の色',
    '● 행운의 색':'● 幸運の色',
    '✨ 자미두수 12궁 상세 해석':'✨ 紫微斗数12宮詳細解釈',
    '✨ 천궁도 행성·하우스·상(Aspect) 분석':'✨ 天宮図の惑星・ハウス・アスペクト分析',
    '감성과 영성이 필요한 분야에서 탁월합니다. 예술, 음악, 의료, 상담, 종교, 사진 분야가 잘 맞습니다. 깊은 공감 능력과 창의적 상상력이 강점입니다.':'感性と霊性が求められる分野で優れています。芸術、音楽、医療、カウンセリング、宗教、写真の分野に適しています。深い共感能力と創造的な想像力が強みです。',
    '감정적 교류에서 어려움이 있을 수 있습니다. 오해나 갈등이 생기기 쉬운 시기이므로 충동적인 감정 표현을 자제하고 신중하게 행동하는 것이 좋습니다. 혼자만의 시간을 통해 감정을 정리하세요.':'感情的な交流に困難が生じることがあります。誤解や対立が起こりやすい時期なので、衝動的な感情表現を控え、慎重に行動することが望ましいです。一人の時間を持って感情を整理しましょう。',
    '감정적으로 깊이 연결되는 것을 원합니다. 상대를 세심하게 배려하고 보호하려 하며, 가정적인 사랑을 꿈꿉니다. 상처받으면 껍질 속으로 들어가는 경향이 있습니다.':'感情的に深くつながることを望みます。相手を細やかに気遣い守ろうとし、家庭的な愛を夢見ています。傷つくと殻に閉じこもる傾向があります。',
    '강렬한 에너지로 추진력이 강하지만 사고·수술·구설에 주의가 필요합니다.':'強烈なエネルギーで推進力が強いですが、事故・手術・口論に注意が必要です。',
    '강한 감수성과 예술적 재능을 가지며 이성 관계가 활발합니다.':'強い感受性と芸術的才能を持ち、異性関係が活発です。',
    '강한 도전과 변화의 시기입니다. 외부 압박이나 경쟁이 심해질 수 있으나, 이를 극복하면 큰 성취를 이룰 수 있습니다. 건강 관리와 법적 문제에 각별히 주의하세요.':'強い挑戦と変化の時期です。外部からの圧力や競争が激しくなることがありますが、これを乗り越えれば大きな成果を得られます。健康管理と法的問題に特に注意してください。',
    '강한 의지, 충동적 행동 주의':'強い意志、衝動的な行動に注意',
    '강한 의지력, 극단적 기운':'強い意志力、極端な気運',
    '강한 의지와 리더십이 있지만 극단적 상황이 발생할 수 있습니다.':'強い意志とリーダーシップがありますが、極端な状況が発生することがあります。',
    '건강 상태가 전반적으로 양호합니다. 규칙적인 생활과 적당한 운동으로 현재의 좋은 컨디션을 유지하세요. 스트레스 관리에 신경 쓰면 더욱 활기찬 생활이 가능합니다.':'健康状態は全般的に良好です。規則正しい生活と適度な運動で現在の良いコンディションを維持しましょう。ストレス管理に気を配れば、より活気ある生活が可能です。',
    '건강 운이 매우 좋지 않은 시기입니다. 만성 질환이 악화되거나 새로운 건강 문제가 발생할 수 있습니다. 즉시 전문의 상담을 받고, 과로와 스트레스를 철저히 피하세요. 몸의 신호에 귀를 기울이는 것이 중요합니다.':'健康運が非常に良くない時期です。慢性疾患が悪化したり、新たな健康問題が生じる可能性があります。すぐに専門医の相談を受け、過労やストレスを徹底的に避けてください。体のサインに耳を傾けることが重要です。',
    '건강 운이 평범한 편입니다. 특별한 이상은 없지만 과로나 스트레스에 취약할 수 있습니다. 충분한 수면과 균형 잡힌 식사로 기초 체력을 유지하는 것이 중요합니다.':'健康運は平凡なほうです。特に異常はありませんが、過労やストレスに弱い可能性があります。十分な睡眠とバランスの取れた食事で基礎体力を維持することが大切です。',
    '건강에 주의가 필요한 시기입니다. 피로 누적이나 소화기 계통의 문제가 생길 수 있습니다. 무리한 활동을 자제하고 정기적인 건강 검진을 받는 것이 좋습니다. 충분한 휴식이 필수입니다.':'健康に注意が必要な時期です。疲労の蓄積や消化器系の問題が起こることがあります。無理な活動を控え、定期的な健康診断を受けることが望ましいです。十分な休息が必須です。',
    '게자리는 달이 지배하는 물의 별자리입니다. 감수성이 풍부하고 직관력이 뛰어나며, 가족과 가정을 무엇보다 소중히 여깁니다. 타인의 감정에 민감하게 반응하는 공감 능력이 탁월합니다. 감정 기복이 있을 수 있으며, 과거에 집착하는 경향을 의식적으로 조절하면 더 성장할 수 있습니다.':'かに座は月が支配する水の星座です。感受性が豊かで直感力に優れ、家族や家庭を何より大切にします。他者の感情に敏感に反応する共感能力が卓越しています。感情の起伏があることがあり、過去への執着を意識的に調整すればさらに成長できます。',
    '관재구설과 소송에서 보호받으며 관운이 좋아집니다.':'官司や口論、訴訟から守られ、官運が良くなります。',
    '균형 잡힌 아름다운 관계를 추구합니다. 로맨틱하고 우아한 사랑을 즐기며, 파트너와의 조화를 중시합니다. 갈등을 피하려는 성향이 있어 솔직한 표현이 필요합니다.':'バランスの取れた美しい関係を追求します。ロマンチックで優雅な愛を楽しみ、パートナーとの調和を重視します。対立を避ける傾向があり、率直な表現が必要です。',
    '균형과 조화가 필요한 분야에서 능력을 발휘합니다. 법률, 외교, 디자인, 패션, 상담, 중재 분야가 잘 맞습니다. 공정한 판단력과 미적 감각이 뛰어납니다.':'バランスと調和が必要な分野で能力を発揮します。法律、外交、デザイン、ファッション、カウンセリング、調停の分野に適しています。公正な判断力と美的感覚に優れています。',
    '금 기운이 과잉되어 지나친 냉정함이나 갈등을 일으킬 수 있습니다. 날카로운 언행과 무리한 경쟁을 자제하세요. 금속 소품이나 흰색 계열을 과도하게 사용하면 긴장감이 높아질 수 있습니다.':'金の気が過剰で冷静さを欠いたり、対立を引き起こすことがあります。鋭い言動や無理な競争を控えましょう。金属製品や白色系の過度な使用は緊張感を高める可能性があります。',
    '금속의 날카로운 기운이 결단력과 재물운을 강화합니다. 서쪽 방향, 흰색·금색 계열이 길하며 계획적인 재테크와 자기 계발이 운을 높입니다. 원칙을 지키는 행동이 신뢰를 쌓습니다.':'金属の鋭い気が決断力と財運を強化します。西の方角、白色・金色系が吉で、計画的な資産運用と自己啓発が運を高めます。原則を守る行動が信頼を築きます。',
    '기운이 좋은 날입니다. 계획한 일들이 진행되고 주변의 도움을 받기 쉬운 시기입니다.':'気運の良い日です。計画したことが進みやすく、周囲の助けを得やすい時期です。',
    '기질의 균형이 무난한 편입니다. 장점과 단점이 공존하며, 환경에 따라 성격 표현이 달라질 수 있습니다. 자신의 강점을 의식적으로 계발하면 더 큰 잠재력을 발휘할 수 있습니다.':'気質のバランスは無難なほうです。長所と短所が共存し、環境によって性格の表現が変わることがあります。自分の強みを意識的に伸ばせば、より大きな潜在能力を発揮できます。',
    '기질적으로 다소 불균형한 면이 있어 감정 기복이나 결정 장애를 경험할 수 있습니다. 자기 이해를 높이고 약점을 보완하는 노력이 필요합니다. 내면의 안정을 찾는 것이 중요한 과제입니다.':'気質的にやや不均衡な面があり、感情の起伏や決断障害を経験することがあります。自己理解を深め、弱点を補う努力が必要です。内面の安定を見つけることが重要な課題です。',
    '깊고 강렬한 사랑을 원합니다. 상대의 영혼까지 알고 싶어하며, 완전한 신뢰와 헌신을 요구합니다. 질투심이 강할 수 있으나, 그만큼 깊이 사랑합니다.':'深く強烈な愛を求めます。相手の魂までも知りたがり、完全な信頼と献身を要求します。嫉妬心が強いこともありますが、それだけ深く愛しています。',
    '꿈같은 로맨스를 꿈꿉니다. 상대를 이상화하는 경향이 있으며, 깊은 영혼의 교감을 원합니다. 감정적으로 민감하고 공감 능력이 뛰어나 상대의 마음을 잘 읽습니다.':'夢のようなロマンスを夢見ます。相手を理想化する傾向があり、深い魂の交流を望みます。感情的に敏感で共感能力に優れ、相手の心をよく読み取ります。',
    '나무 기운이 과잉되어 균형을 흐트러뜨립니다. 지나친 고집이나 무리한 확장을 조심하세요. 동쪽 방향과 초록색 계열을 과도하게 사용하면 에너지 소모가 커질 수 있으니 절제가 필요합니다.':'木の気が過剰でバランスを乱します。過度な頑固さや無理な拡張に注意してください。東の方角や緑色系を過度に使うとエネルギー消耗が大きくなるため、節制が必要です。',
    '나무의 기운이 부족한 명식에 생기를 불어넣습니다. 성장·창의·도전의 에너지를 보충해 주므로 동쪽 방향, 초록색 계열, 봄철 활동이 길합니다. 새로운 시작이나 사업 확장에 유리한 시기를 잘 활용하세요.':'木の気が不足した命式に活気を吹き込みます。成長・創造・挑戦のエネルギーを補うため、東の方角、緑色系、春の活動が吉です。新しい始まりや事業拡大に有利な時期をうまく活用しましょう。',
    '당신의 띠는':'あなたの干支は','띠 입니다':'年生まれです',
    'elem.목':'木 もく','elem.화':'火 か','elem.토':'土 ど','elem.금':'金 きん','elem.수':'水 すい',
    '대지의 안정된 기운이 중심을 잡아줍니다. 중앙·황토색 계열이 길하며 부동산·저축·건강 관리에 집중하면 운이 열립니다. 신뢰와 성실함으로 주변의 지지를 얻는 것이 중요합니다.':'大地の安定した気が中心を支えます。中央・黄土色系が吉で、不動産・貯蓄・健康管理に集中すると運が開けます。信頼と誠実さで周囲の支持を得ることが重要です。',
    '대화와 지적 교감을 중시합니다. 다양한 사람에게 관심을 보이지만, 진정한 소울메이트를 찾습니다. 자유로운 관계를 선호하며 구속을 싫어합니다.':'対話と知的交流を重視します。多様な人に関心を示しますが、真のソウルメイトを探します。自由な関係を好み、束縛を嫌います。',
    '독특하고 자유로운 사랑을 원합니다. 친구 같은 파트너를 선호하며, 지적 교감과 공통된 가치관을 중시합니다. 감정적 친밀감보다 정신적 연결을 더 중요하게 여깁니다.':'独特で自由な愛を求めます。友人のようなパートナーを好み、知的交流と共通の価値観を重視します。感情的親密さより精神的つながりをより重要視します。',
    '독특한 인상':'独特な印象',
    '돌봄과 감성이 필요한 분야에서 탁월합니다. 의료, 사회복지, 교육, 요식업, 부동산, 상담 분야가 잘 맞습니다. 사람들의 감정을 이해하고 보살피는 능력이 뛰어납니다.':'ケアと感性が必要な分野で卓越しています。医療、社会福祉、教育、飲食、不動産、カウンセリング分野が適しています。人々の感情を理解し、思いやる能力に優れています。',
    '로맨틱하고 극적인 사랑을 즐깁니다. 상대에게 최고의 것을 선사하고 싶어하며, 충성스럽고 열정적인 파트너입니다. 인정받지 못하면 상처를 받습니다.':'ロマンチックで劇的な愛を楽しみます。相手に最高のものを提供したがり、忠誠心が強く情熱的なパートナーです。認められないと傷つきます。',
    '리더십과 추진력이 필요한 분야에서 두각을 나타냅니다. 스포츠, 군경, 기업가, 개척 사업, 응급 의료 분야가 잘 맞습니다. 독립적으로 일하거나 팀을 이끄는 역할이 적합합니다.':'リーダーシップと推進力が必要な分野で頭角を現します。スポーツ、軍警察、起業家、開拓事業、救急医療分野が適しています。独立して働くかチームを率いる役割が向いています。',
    '말년운 (50세~)':'晩年運（50歳～）',
    '멤버십 상세 분석':'メンバーシップ詳細分析',
    '명식 산출하기':'命式算出',
    '명예와 사회적 지위가 높아지는 시기입니다. 조직 내 승진이나 인정을 받을 기회가 생기며, 책임감과 원칙을 중시하게 됩니다. 공직·전문직에서 두각을 나타낼 수 있습니다.':'名誉と社会的地位が高まる時期です。組織内で昇進や認知の機会が生まれ、責任感と原則を重視するようになります。公職・専門職で頭角を現すことができます。',
    '몸과 마음의 에너지가 매우 충만한 시기입니다. 체력이 넘치고 면역력도 강해 활발한 활동이 가능합니다. 이 시기에 건강한 습관을 정착시키면 오랫동안 좋은 컨디션을 유지할 수 있습니다.':'身体と心のエネルギーが非常に充実した時期です。体力が溢れ、免疫力も強く活発な活動が可能です。この時期に健康的な習慣を定着させると長期間良好なコンディションを維持できます。',
    '물고기자리는 해왕성과 목성이 지배하는 물의 별자리입니다. 예민한 감수성과 깊은 공감 능력, 영적 직관이 뛰어납니다. 예술적 재능과 상상력이 풍부하며, 타인의 고통에 민감하게 반응합니다. 현실과 이상 사이에서 혼란을 겪을 수 있으므로, 경계를 설정하고 자신을 보호하는 것이 중요합니다.':'うお座は海王星と木星が支配する水の星座です。繊細な感受性と深い共感能力、霊的直感に優れています。芸術的才能と豊かな想像力があり、他者の苦しみに敏感に反応します。現実と理想の間で混乱を経験することがあるため、境界を設定し自己防衛することが重要です。',
    '물병자리는 천왕성과 토성이 지배하는 바람의 별자리입니다. 독창적이고 혁신적인 사고로 미래를 내다보는 능력이 있습니다. 인류애와 평등을 중시하며, 독립적이고 자유로운 정신을 가지고 있습니다. 감정적 거리감이 있을 수 있으므로, 친밀한 관계에서 따뜻함을 표현하는 연습이 도움이 됩니다.':'みずがめ座は天王星と土星が支配する風の星座です。独創的で革新的な思考により未来を見通す能力があります。人類愛と平等を重視し、独立的で自由な精神を持っています。感情的な距離感があることがあるため、親密な関係で温かさを表現する練習が役立ちます。',
    '물의 지혜로운 기운이 지식과 재물의 흐름을 원활하게 합니다. 북쪽 방향, 검정·파란색 계열이 길하며 학업·연구·금융 분야에서 두각을 나타낼 수 있습니다. 유연한 사고로 기회를 포착하세요.':'水の知恵の気が知識と財の流れを円滑にします。北の方角、黒・青色系が吉で、学業・研究・金融分野で頭角を現すことができます。柔軟な思考でチャンスを掴みましょう。',
    '변화와 혁신을 추구하는 시기입니다. 창의적 아이디어가 넘치고 기존 틀을 벗어나려는 욕구가 강해집니다. 직업 변화나 이직을 고려할 수 있으며, 언행에 주의가 필요합니다.':'変化と革新を追求する時期です。創造的なアイデアが溢れ、既存の枠を超えようとする欲求が強まります。職業の変化や転職を考えることがあり、言動に注意が必要です。',
    '부귀와 안락의 별, 재물과 명예':'富貴と安楽の星、財と名誉',
    '분석과 정밀함이 필요한 분야에서 두각을 나타냅니다. 의료, 회계, 연구, 편집, 영양, 품질관리 분야가 잘 맞습니다. 세심한 주의력과 완벽을 추구하는 성향이 강점입니다.':'分析と精密さが求められる分野で頭角を現します。医療、会計、研究、編集、栄養、品質管理分野が適しています。細やかな注意力と完璧を追求する性質が強みです。',
    '불 기운이 과잉되어 충동적 행동이나 과열을 유발할 수 있습니다. 감정 기복과 급한 결정을 경계하세요. 빨간색 계열과 남쪽 방향을 과도하게 접하면 스트레스가 가중될 수 있습니다.':'火の気が過剰で衝動的な行動や過熱を引き起こすことがあります。感情の起伏や急な決断に注意してください。赤色系と南の方角を過度に接するとストレスが増大する可能性があります。',
    '불의 기운으로 열정과 표현력을 강화합니다. 남쪽 방향, 빨간색 계열이 행운을 부르며 인간관계와 명예 운이 상승합니다. 적극적인 자기 표현과 사교 활동이 운을 여는 열쇠입니다.':'火の気によって情熱と表現力が強化されます。南の方角、赤系統が幸運を呼び、人間関係と名誉運が上昇します。積極的な自己表現と社交活動が運を開く鍵です。',
    '사수자리는 목성이 지배하는 불의 별자리입니다. 자유를 사랑하고 철학적 사고와 모험 정신이 넘칩니다. 낙관적이고 유머 감각이 뛰어나며, 다양한 문화와 지식을 탐구하는 것을 즐깁니다. 무책임하거나 직설적인 말로 상처를 줄 수 있으므로, 세심한 배려가 필요합니다.':'射手座は木星が支配する火の星座です。自由を愛し、哲学的思考と冒険心に溢れています。楽観的でユーモアのセンスに優れ、多様な文化や知識の探求を楽しみます。無責任や率直すぎる言葉で傷つけることがあるため、細やかな配慮が必要です。',
    '사자자리는 태양이 지배하는 불의 별자리입니다. 타고난 리더십과 카리스마로 자연스럽게 주목받습니다. 창의적이고 표현력이 풍부하며, 무대 위에서 빛나는 존재감을 발휘합니다. 자존심이 강하고 인정받고 싶은 욕구가 크므로, 겸손함을 갖추면 더욱 빛납니다.':'獅子座は太陽が支配する火の星座です。生まれながらのリーダーシップとカリスマ性で自然と注目を集めます。創造的で表現力豊か、舞台上で輝く存在感を発揮します。プライドが強く認められたい欲求が大きいため、謙虚さを備えるとさらに輝きます。',
    '사회적 활동과 직업 운이 매우 강한 시기입니다. 능력을 인정받고 승진이나 중요한 기회가 찾아올 수 있습니다. 새로운 프로젝트나 도전에 적극적으로 나서면 좋은 결과를 얻을 수 있습니다.':'社会的活動と職業運が非常に強い時期です。能力を認められ、昇進や重要なチャンスが訪れる可能性があります。新しいプロジェクトや挑戦に積極的に取り組むと良い結果を得られます。',
    '성격과 기질이 안정적으로 발달해 있어 사회적 관계에서 신뢰를 쌓기 쉽습니다. 자신의 감정을 잘 조절하며, 목표를 향해 꾸준히 나아가는 힘이 있습니다. 다양한 상황에서 유연하게 대처하는 능력이 돋보입니다.':'性格と気質が安定的に発達しており、社会的関係で信頼を築きやすいです。自分の感情をうまくコントロールし、目標に向かって着実に進む力があります。さまざまな状況に柔軟に対応する能力が際立っています。',
    '소통과 정보를 다루는 분야에서 빛납니다. 언론, 교육, IT, 마케팅, 작가, 통역 분야가 잘 맞습니다. 다양한 분야를 넘나드는 멀티태스킹 능력이 강점입니다.':'コミュニケーションと情報を扱う分野で輝きます。報道、教育、IT、マーケティング、作家、通訳分野が適しています。多様な分野を行き来するマルチタスク能力が強みです。',
    '수 기운이 과잉되어 우유부단함이나 과도한 걱정을 유발할 수 있습니다. 지나친 분석과 소극적 태도를 경계하세요. 검정·파란색 계열과 북쪽 방향을 과도하게 접하면 에너지가 침체될 수 있습니다.':'水の気が過剰で優柔不断や過度な心配を引き起こすことがあります。過剰な分析や消極的な態度に注意してください。黒・青系統と北の方角を過度に接するとエネルギーが沈滞する恐れがあります。',
    '신비롭고 예민한 기운이 강하게 작동할 수 있음':'神秘的で繊細な気が強く作用することがあります。',
    '심층 분석과 변화를 다루는 분야에서 탁월합니다. 심리학, 의학, 금융, 탐정, 연구, 위기관리 분야가 잘 맞습니다. 숨겨진 진실을 파헤치는 능력과 강한 집중력이 강점입니다.':'深層分析と変化を扱う分野で卓越しています。心理学、医学、金融、探偵、研究、危機管理分野が適しています。隠された真実を掘り下げる能力と強い集中力が強みです。',
    '쌍둥이자리는 수성이 지배하는 바람의 별자리입니다. 지적 호기심이 넘치고 다재다능하며, 소통과 정보 교환에 탁월합니다. 두 가지 상반된 성향이 공존하여 상황에 따라 다른 모습을 보이기도 합니다. 언어 능력과 적응력이 뛰어나 다양한 분야에서 활약할 수 있습니다.':'双子座は水星が支配する風の星座です。知的好奇心に溢れ、多才で、コミュニケーションと情報交換に優れています。二つの相反する性質が共存し、状況に応じて異なる姿を見せることがあります。言語能力と適応力が高く、多様な分野で活躍できます。',
    '안정적이고 실용적인 분야에서 능력을 발휘합니다. 금융, 부동산, 요리, 예술, 농업, 건축 분야가 잘 맞습니다. 장기적인 프로젝트를 꾸준히 완성하는 능력이 탁월합니다.':'安定的で実用的な分野で能力を発揮します。金融、不動産、料理、芸術、農業、建築分野が適しています。長期的なプロジェクトを着実に完成させる能力が卓越しています。',
    '안정적인 재물 축적과 내실을 다지는 시기입니다. 꾸준한 노력이 결실을 맺고 저축과 부동산 등 안정적 자산 관리에 유리합니다. 성실하게 임하면 좋은 결과를 얻습니다.':'安定した財産の蓄積と内実を固める時期です。地道な努力が実を結び、貯蓄や不動産など安定的な資産管理に有利です。誠実に取り組めば良い結果を得られます。',
    '애정 운이 좋은 편으로, 관계에서 따뜻한 교류가 이루어집니다. 진심 어린 소통이 관계를 더욱 돈독하게 만들어 줍니다. 솔직한 감정 표현이 인연을 발전시키는 열쇠가 됩니다.':'愛情運が良好で、関係に温かい交流が生まれます。真心のこもったコミュニケーションが関係をより強固にします。率直な感情表現が縁を発展させる鍵となります。',
    '애정 운이 평범한 편입니다. 특별한 변화보다는 현재 관계를 안정적으로 유지하는 것이 중요합니다. 상대방의 입장을 이해하려는 노력이 관계의 질을 높여줍니다.':'愛情運は平凡な方です。特別な変化よりも現在の関係を安定的に維持することが重要です。相手の立場を理解しようとする努力が関係の質を高めます。',
    '약간의 주의가 필요한 날입니다. 중요한 결정이나 큰 지출은 미루는 것이 좋습니다.':'やや注意が必要な日です。重要な決定や大きな支出は延期するのが良いでしょう。',
    '양자리는 황도 12궁의 첫 번째 별자리로, 화성이 지배하는 불의 별자리입니다. 개척 정신과 추진력이 강하며, 새로운 일을 시작하는 데 탁월한 능력을 발휘합니다. 경쟁심이 강하고 즉흥적인 면이 있어 충동적 결정에 주의가 필요합니다. 리더십이 뛰어나고 용기 있는 행동으로 주변을 이끄는 타입입니다.':'牡羊座は黄道12宮の第一の星座で、火星が支配する火の星座です。開拓精神と推進力が強く、新しいことを始めるのに卓越した能力を発揮します。競争心が強く即興的な面があり、衝動的な決定に注意が必要です。リーダーシップに優れ、勇気ある行動で周囲を導くタイプです。',
    '에너지 소모가 클 수 있는 날입니다. 충동적인 행동을 자제하고 안정을 취하세요.':'エネルギー消耗が大きくなる日です。衝動的な行動を控え、安定を心がけてください。',
    '열정과 감정의 기운, 예술적 재능':'情熱と感情の気、芸術的才能。',
    '열정적이고 직접적으로 감정을 표현합니다. 첫눈에 반하는 경우가 많고, 상대를 적극적으로 리드합니다. 권태기가 오면 새로운 자극이 필요합니다.':'情熱的で感情を直接的に表現します。一目惚れすることが多く、相手を積極的にリードします。マンネリ期には新しい刺激が必要です。',
    '염소자리는 토성이 지배하는 흙의 별자리입니다. 책임감이 강하고 목표를 향한 끈기와 실용적 판단력이 탁월합니다. 사회적 성공과 명예를 중시하며, 체계적이고 성실하게 기반을 쌓아갑니다. 감정 표현이 서툴고 지나치게 일에 집중하는 경향이 있어, 휴식과 감정 교류도 중요합니다.':'山羊座は土星が支配する土の星座です。責任感が強く、目標に向かう粘り強さと実用的判断力に優れています。社会的成功と名誉を重視し、体系的かつ誠実に基盤を築きます。感情表現が苦手で過度に仕事に集中する傾向があり、休息と感情交流も重要です。',
    '오행 불균형으로 인해 기질적 갈등이 심할 수 있습니다. 충동적 행동이나 극단적 감정 반응에 주의가 필요합니다. 명상, 규칙적인 생활, 신뢰할 수 있는 조언자의 도움을 받는 것이 도움이 됩니다.':'五行の不均衡により気質的な葛藤が激しくなることがあります。衝動的な行動や極端な感情反応に注意が必要です。瞑想、規則正しい生活、信頼できる助言者の支援が役立ちます。',
    '완벽한 파트너를 찾기 위해 신중하게 관계를 시작합니다. 실용적이고 헌신적인 사랑을 하며, 세심한 배려로 상대를 돌봅니다. 지나친 비판은 관계를 어렵게 할 수 있습니다.':'完璧なパートナーを探すために慎重に関係を始めます。実用的で献身的な愛をし、細やかな配慮で相手を大切にします。過度な批判は関係を難しくすることがあります。',
    '용신을 보조하는 금 기운입니다. 정확하고 체계적인 행동이 운을 뒷받침합니다. 금속 소품이나 흰색 계열 인테리어가 이 기운을 강화하며, 계획적인 생활 패턴이 도움이 됩니다.':'用神を補助する金の気です。正確で体系的な行動が運を支えます。金属製の小物や白系統のインテリアがこの気を強化し、計画的な生活パターンが助けになります。',
    '용신을 보조하는 나무 기운입니다. 창의적 활동과 인간관계 확장이 간접적으로 운을 돕습니다. 식물 키우기, 등산, 새벽 산책 등 목(木) 기운을 접하는 생활 습관이 에너지를 보충해 줍니다.':'用神を補助する木の気です。創造的活動と人間関係の拡大が間接的に運を助けます。植物の栽培、登山、早朝の散歩など木の気に触れる生活習慣がエネルギーを補充します。',
    '용신을 보조하는 불 기운입니다. 밝고 활기찬 환경이 운의 흐름을 원활하게 합니다. 조명이 밝은 공간에서 활동하거나 따뜻한 색상의 소품을 활용하면 보조 에너지가 강화됩니다.':'用神を補助する火の気です。明るく活気ある環境が運の流れを円滑にします。照明の明るい空間で活動したり暖色系の小物を活用すると補助エネルギーが強化されます。',
    '용신을 보조하는 수 기운입니다. 지식 축적과 내면 성찰이 운을 간접적으로 강화합니다. 독서, 명상, 수영 등 수(水) 기운과 연관된 활동이 보조 에너지를 활성화합니다.':'用神を補助する水の気です。知識の蓄積と内面の省察が運を間接的に強化します。読書、瞑想、水泳など水の気に関連する活動が補助エネルギーを活性化します。',
    '용신을 보조하는 토 기운입니다. 안정적인 생활 기반이 전체 운을 뒷받침합니다. 규칙적인 식사와 수면, 꾸준한 저축 습관이 이 기운을 활성화하여 운의 토대를 다집니다.':'用神を補助する土の気です。安定した生活基盤が全体の運を支えます。規則正しい食事と睡眠、着実な貯蓄習慣がこの気を活性化し、運の土台を築きます。',
    '의료·치유 분야에 재능이 있으며 건강 회복력이 강합니다.':'医療・癒しの分野に才能があり、健康回復力が強いです。',
    '의술과 건강의 별, 치료 능력':'医術と健康の星、治療能力',
    '이 대운은 천간의 기운이 일간에 영향을 미치는 시기입니다. 해당 십성의 특성을 이해하고 흐름에 맞게 대응하는 것이 중요합니다.':'この大運は天干の気が日干に影響を与える時期です。該当する十星の特性を理解し、流れに合わせて対応することが重要です。',
    '이성 매력, 예술적 감각':'異性の魅力、芸術的感覚',
    '이성에게 매력적으로 보이며 예술·연예 분야에 재능이 있습니다.':'異性に魅力的に映り、芸術・芸能分野に才能があります。',
    '인연의 기운이 매우 강하게 흐르고 있습니다. 새로운 만남이나 기존 관계의 깊어짐이 기대되는 시기입니다. 감정 표현이 자연스럽게 이루어지며, 상대방의 마음을 얻기에 유리한 에너지가 충만합니다.':'縁の気が非常に強く流れています。新しい出会いや既存の関係の深まりが期待される時期です。感情表現が自然に行われ、相手の心を得るのに有利なエネルギーが満ちています。',
    '인연의 흐름이 막혀 있는 시기입니다. 관계에서 상처를 받거나 이별의 아픔을 경험할 수 있습니다. 자신을 먼저 돌보고 내면의 상처를 치유하는 데 집중하는 것이 현명합니다.':'縁の流れが滞っている時期です。関係で傷ついたり別れの痛みを経験することがあります。まず自分を大切にし、内面の傷を癒すことに集中するのが賢明です。',
    '일생 최고의 귀인을 만나는 기운으로 위기 시 강력한 도움을 받습니다.':'一生で最高の貴人に出会う運気で、危機の際に強力な助けを受けます。',
    '자립심과 독립 의지가 강해지는 시기입니다. 새로운 시작과 자기 계발에 유리하며, 경쟁 속에서 실력을 키울 수 있습니다. 다만 고집이 세질 수 있으니 협력을 잊지 마세요.':'自立心と独立意志が強くなる時期です。新しい始まりと自己啓発に有利で、競争の中で実力を伸ばせます。ただし頑固になりやすいので協力を忘れないでください。',
    '자유롭고 모험적인 사랑을 즐깁니다. 함께 성장하고 세상을 탐험할 파트너를 원합니다. 구속받는 것을 싫어하며, 정신적 교감을 매우 중시합니다.':'自由で冒険的な愛を楽しみます。共に成長し世界を探検するパートナーを求めます。束縛を嫌い、精神的な交流を非常に重視します。',
    '자유와 확장이 필요한 분야에서 성공합니다. 교육, 여행, 출판, 법률, 철학, 해외 비즈니스 분야가 잘 맞습니다. 넓은 시야와 낙관적 에너지로 새로운 기회를 만들어냅니다.':'自由と拡大が必要な分野で成功します。教育、旅行、出版、法律、哲学、海外ビジネス分野が適しています。広い視野と楽観的なエネルギーで新しい機会を生み出します。',
    '재물 손실이나 예상치 못한 지출이 발생할 수 있는 시기입니다. 충동적인 소비나 투기적 투자를 자제하고 보수적인 재정 관리가 필요합니다. 보증이나 대출에 특히 주의하세요.':'財物の損失や予期せぬ支出が発生する可能性がある時期です。衝動的な消費や投機的な投資は控え、保守的な財政管理が必要です。保証や借入には特に注意してください。',
    '재물 운이 매우 강하게 흐르고 있습니다. 예상치 못한 수입이나 투자 성과가 기대되는 시기입니다. 재물이 자연스럽게 모이는 흐름이므로 장기적인 재테크 계획을 세우기에 좋은 때입니다.':'財運が非常に強く流れています。予期せぬ収入や投資成果が期待できる時期です。財が自然に集まる流れなので、長期的な資産運用計画を立てるのに良い時です。',
    '재물 운이 매우 불안정한 시기입니다. 큰 재정적 손실이나 사기 피해의 위험이 있으므로 중요한 금전 거래는 반드시 전문가의 조언을 구하세요. 현금 보유를 늘리고 리스크를 최소화하는 것이 현명합니다.':'財運が非常に不安定な時期です。大きな財政的損失や詐欺被害のリスクがあるため、重要な金銭取引は必ず専門家の助言を求めてください。現金保有を増やしリスクを最小化するのが賢明です。',
    '재물 운이 좋은 편입니다. 수입이 안정적으로 유지되며 절약과 투자의 균형을 잘 맞출 수 있습니다. 소소한 재물 기회들이 꾸준히 찾아오는 시기입니다.':'財運は良好です。収入が安定し、節約と投資のバランスをうまく取れます。小さな財運のチャンスが継続的に訪れる時期です。',
    '재물 운이 평범한 편입니다. 큰 이익보다는 현재 재정 상태를 안정적으로 유지하는 것이 중요합니다. 불필요한 지출을 줄이고 저축 습관을 기르는 것이 도움이 됩니다.':'財運は平凡です。大きな利益よりも現在の財政状態を安定させることが重要です。不必要な支出を減らし貯蓄習慣を身につけることが助けになります。',
    '재물복과 명예운이 좋아 안정된 삶을 누리는 기운입니다.':'財福と名誉運が良く安定した生活を享受する気です。',
    '전갈자리는 명왕성과 화성이 지배하는 물의 별자리입니다. 강렬한 의지와 깊이 있는 통찰력을 가지고 있습니다. 비밀을 잘 지키고 심층적인 진실을 탐구하는 능력이 탁월합니다. 집착과 질투심이 강할 수 있으므로, 신뢰를 바탕으로 한 깊은 관계를 형성하는 것이 중요합니다.':'さそり座は冥王星と火星が支配する水の星座です。強烈な意志と深い洞察力を持っています。秘密を守ることに長け、深層の真実を探求する能力が卓越しています。執着心や嫉妬心が強くなりやすいため、信頼を基盤とした深い関係を築くことが重要です。',
    '중년운 (35~50세)':'中年運（35～50歳）',
    '직관력과 영적 감수성이 뛰어나지만 신경과민·불안 경향에 주의가 필요합니다.':'直感力と霊的感受性に優れていますが、神経過敏や不安傾向に注意が必要です。',
    '직업 운이 매우 불안정한 시기입니다. 직장 변동이나 실직의 위험이 있을 수 있으므로 중요한 결정을 미루고 안정을 최우선으로 삼으세요. 신뢰할 수 있는 사람의 조언을 구하는 것이 도움이 됩니다.':'職業運が非常に不安定な時期です。職場の変動や失職の危険があるため、重要な決断は延期し安定を最優先にしてください。信頼できる人の助言を求めることが助けになります。',
    '직업 운이 순조롭게 흐르고 있습니다. 꾸준한 노력이 인정받는 시기로, 동료나 상사와의 관계도 원만합니다. 자신의 전문성을 더욱 갈고닦으면 더 큰 성과를 거둘 수 있습니다.':'職業運が順調に流れています。着実な努力が認められる時期で、同僚や上司との関係も円満です。自身の専門性をさらに磨けばより大きな成果を得られます。',
    '직업 운이 평범한 편입니다. 큰 변화보다는 현재 위치에서 성실하게 임하는 것이 중요합니다. 새로운 기술이나 지식을 습득하여 경쟁력을 높이는 것이 도움이 됩니다.':'職業運は平凡です。大きな変化よりも現状で誠実に取り組むことが重要です。新しい技術や知識を習得し競争力を高めることが助けになります。',
    '직업적으로 어려움이 있을 수 있는 시기입니다. 직장 내 갈등이나 업무 부담이 증가할 수 있으므로 신중하게 행동하고 불필요한 마찰을 피하는 것이 좋습니다. 무리한 도전보다 현상 유지에 집중하세요.':'職業的に困難が生じる時期です。職場内の対立や業務負担が増加する可能性があるため、慎重に行動し、不必要な摩擦を避けることが望ましいです。無理な挑戦よりも現状維持に集中しましょう。',
    '진지하고 책임감 있는 사랑을 합니다. 장기적인 관계와 안정을 추구하며, 파트너에게 든든한 지원자가 됩니다. 감정 표현이 서툴 수 있으나 깊이 헌신합니다.':'真剣で責任感のある愛をします。長期的な関係と安定を求め、パートナーにとって頼もしい支えとなります。感情表現は不器用なこともありますが、深く献身的です。',
    '창의력과 표현력이 풍부해지는 시기입니다. 재능을 발휘하고 새로운 것을 배우기에 좋으며, 음식·예술·교육 분야에서 기회가 생깁니다. 전반적으로 안정적이고 여유로운 대운입니다.':'創造力と表現力が豊かになる時期です。才能を発揮し、新しいことを学ぶのに適しており、食・芸術・教育分野でチャンスが訪れます。全体的に安定的で余裕のある大運です。',
    '창의성과 리더십이 필요한 분야에서 성공합니다. 연예, 예술, 경영, 교육, 정치, 이벤트 기획 분야가 잘 맞습니다. 무대 위에서 빛나는 존재감과 카리스마가 강점입니다.':'創造性とリーダーシップが求められる分野で成功します。芸能、芸術、経営、教育、政治、イベント企画の分野が適しています。舞台上で輝く存在感とカリスマ性が強みです。',
    '처녀자리는 수성이 지배하는 흙의 별자리입니다. 분석력과 세심함이 뛰어나며, 완벽을 추구하는 성실한 성향입니다. 실용적이고 논리적인 사고로 문제를 해결하는 능력이 탁월합니다. 지나친 완벽주의와 자기비판에 주의하고, 있는 그대로의 자신을 인정하는 연습이 필요합니다.':'乙女座は水星が支配する土の星座です。分析力と細やかさに優れ、完璧を追求する誠実な性格です。実用的で論理的な思考で問題を解決する能力が卓越しています。過度な完璧主義や自己批判に注意し、そのままの自分を認める練習が必要です。',
    '천천히 신중하게 마음을 열지만, 한번 사랑에 빠지면 매우 헌신적입니다. 안정적이고 감각적인 사랑을 추구하며, 물질적 표현으로 애정을 드러냅니다.':'ゆっくりと慎重に心を開きますが、一度愛に落ちると非常に献身的です。安定的で感覚的な愛を求め、物質的な表現で愛情を示します。',
    '천칭자리는 금성이 지배하는 바람의 별자리입니다. 균형과 조화를 추구하며, 아름다움과 예술적 감각이 뛰어납니다. 공정함을 중시하고 타인과의 관계에서 외교적 능력을 발휘합니다. 결정을 내리기 어려워하는 우유부단함이 있어, 자신의 내면 목소리를 믿는 연습이 중요합니다.':'天秤座は金星が支配する風の星座です。バランスと調和を追求し、美しさと芸術的感覚に優れています。公正さを重視し、他者との関係で外交的な能力を発揮します。決断が難しく優柔不断な面があるため、自分の内なる声を信じる練習が重要です。',
    '청년운 (15~35세)':'青年運（15～35歳）',
    '체계와 성취가 필요한 분야에서 두각을 나타냅니다. 경영, 정치, 금융, 건축, 행정, 공학 분야가 잘 맞습니다. 장기적인 목표를 향해 꾸준히 나아가는 끈기가 강점입니다.':'体系と達成が求められる分野で頭角を現します。経営、政治、金融、建築、行政、工学分野が適しています。長期的な目標に向かって着実に進む粘り強さが強みです。',
    '초년운 (0~15세)':'初年運（0～15歳）',
    '최고 귀인성, 위기 극복':'最高の貴人星、危機克服',
    '최고의 귀인, 큰 도움과 인복':'最高の貴人、大きな助けと人徳',
    '추진력과 결단력이 강하지만 충동적 행동과 대인 갈등에 주의하세요.':'推進力と決断力が強いですが、衝動的な行動や対人トラブルに注意してください。',
    '타고난 기질이 매우 조화롭고 균형 잡혀 있습니다. 어떤 환경에서도 자신의 강점을 발휘하며, 주변 사람들에게 긍정적인 영향을 미치는 타고난 리더 기질을 지니고 있습니다. 직관력과 판단력이 뛰어나 중요한 순간에 탁월한 선택을 내립니다.':'生まれつきの気質が非常に調和的でバランスが取れています。どんな環境でも自分の強みを発揮し、周囲の人々に良い影響を与える生まれながらのリーダー気質を持っています。直感力と判断力に優れ、重要な瞬間に卓越した選択をします。',
    '토 기운이 과잉되어 정체와 고집을 유발할 수 있습니다. 변화를 두려워하거나 지나치게 보수적인 태도가 기회를 놓치게 합니다. 황토색·중앙 배치를 줄이고 유연한 사고를 키우세요.':'土の気が過剰になると停滞や頑固さを引き起こすことがあります。変化を恐れたり過度に保守的な態度はチャンスを逃す原因となります。黄土色や中央配置を減らし、柔軟な思考を育てましょう。',
    '평온하게 흘러가는 날입니다. 무리한 새 시도보다 기존 일을 꼼꼼히 마무리하세요.':'穏やかに流れる日です。無理な新しい試みよりも既存の仕事を丁寧に仕上げましょう。',
    '하는 일마다 순탄하게 풀리는 날입니다. 새로운 시작이나 중요한 결정에 최적입니다.':'行うことすべてが順調に進む日です。新しい始まりや重要な決断に最適です。',
    '하늘의 덕, 재난 소멸':'天の徳、災難消滅',
    '하늘의 덕을 받아 재난과 액운이 자연스럽게 해소됩니다.':'天の徳を受けて災難や凶運が自然に解消されます。',
    '하늘이 내린 귀인으로 어려운 상황에서 도움을 받는 강한 기운입니다.':'天が授けた貴人として困難な状況で助けを受ける強い気運です。',
    '학문·연구·영성에 관심이 높아지는 시기입니다. 내면을 탐구하고 전문 지식을 쌓기에 좋으며, 예술·의료·종교 분야에서 재능이 발휘됩니다. 고독감이 들 수 있으니 소통을 늘리세요.':'学問・研究・精神性への関心が高まる時期です。内面を探求し専門知識を積むのに適しており、芸術・医療・宗教分野で才能が発揮されます。孤独感を感じることがあるため、コミュニケーションを増やしましょう。',
    '학문과 시험의 귀인, 문장 재능':'学問と試験の貴人、文章の才能',
    '학습과 성장, 귀인의 도움을 받는 시기입니다. 자격증 취득이나 학업에 유리하며, 어른이나 스승의 지원을 받을 수 있습니다. 차분하고 신중하게 임하면 좋은 결과를 얻습니다.':'学習と成長、貴人の助けを受ける時期です。資格取得や学業に有利で、大人や師匠の支援を受けられます。落ち着いて慎重に取り組めば良い結果が得られます。',
    '학업·시험 운이 강하고 글재주가 뛰어나 문서·계약에 유리합니다.':'学業・試験運が強く、文章力に優れているため書類・契約に有利です。',
    '혁신과 미래를 다루는 분야에서 빛납니다. IT, 과학, 사회운동, 방송, 인도주의 분야가 잘 맞습니다. 독창적인 아이디어와 미래를 내다보는 통찰력이 강점입니다.':'革新と未来を扱う分野で輝きます。IT、科学、社会運動、放送、人道主義分野が適しています。独創的なアイデアと未来を見通す洞察力が強みです。',
    '활동성과 추진력이 강해지는 시기입니다. 재물의 유동성이 크고 인간관계가 넓어집니다. 충동적인 투자나 보증은 피하고 신중한 재무 관리가 필요합니다.':'活動性と推進力が強まる時期です。財の流動性が大きくなり、人間関係が広がります。衝動的な投資や保証は避け、慎重な財務管理が必要です。',
    '활발한 재물 활동과 사교성이 높아지는 시기입니다. 사업 기회나 투자 수익이 생길 수 있으나 변동성도 큽니다. 이성 인연이 활발해지고 대인관계가 넓어집니다.':'活発な財の活動と社交性が高まる時期です。事業のチャンスや投資の利益が生まれる可能性がありますが、変動性も大きいです。異性との縁が活発になり、対人関係が広がります。',
    '신살 분석':'神殺分析','대운 십성':'大運十星','당신의 별자리는':'あなたの星座は','입니다':'です',
    '원국':'原局','사주 원국의 특수 기운 분석':'四柱原局の特殊エネルギー分析',
    '길신':'吉神','긍정적인 기운':'ポジティブなエネルギー',
    '흉신':'凶神','주의가 필요한 기운':'注意が必要なエネルギー',
    '중성 신살':'中性の神殺','상황에 따라 달라지는 기운':'状況によって変わるエネルギー',
    'sinsal.천을귀인':'天乙貴人','sinsal.천덕귀인':'天德貴人','sinsal.월덕귀인':'月德貴人',
    'sinsal.태극귀인':'太極貴人','sinsal.문창귀인':'文昌貴人',
    'sinsal.천의성':'天醫星','sinsal.금여성':'金輿星','sinsal.화개':'華蓋星',
    'sinsal.귀문관살':'鬼門関殺','sinsal.백호살':'白虎殺',
    'sinsal.괴강살':'魁罡殺','sinsal.양인살':'羊刃殺',
    'sinsal.도화살':'桃花殺','sinsal.홍염살':'紅艶殺',
    '대운 (大運)':'大運','현재 나이':'現在の年齢','순행':'順行','역행':'逆行',
    '현재 대운':'現在の大運','지난 대운':'過去の大運','미래 대운':'未来の大運',
    '세':'歳','양년':'陽年','대운수':'大運数','대운 십성':'大運十星',
    'day.0':'日','day.1':'月','day.2':'火','day.3':'水','day.4':'木','day.5':'金','day.6':'土',
    '점':'点','개':'個',
    '운성.장생':'長生','운성.목욕':'沐浴','운성.관대':'冠帶','운성.임관':'臨官','운성.제왕':'帝旺',
    '운성.쇠':'衰','운성.병':'病','운성.사':'死','운성.묘':'墓','운성.절':'絶','운성.태':'胎','운성.양':'養',
    'grade.강':'強','grade.중':'中','grade.약':'弱',
    '연애 스타일':'恋愛スタイル','직업 적성':'職業適性',
    '현재 행성 위치 · 지금 나에게 영향을 주는 에너지':'現在の惑星位置 · 影響を与えるエネルギー',
    '월의 덕, 관재 소멸':'月徳、官災消滅','강한 기운, 사고·수술 주의':'強い気、事故・手術に注意',
    'sign.0':'牡羊座','sign.1':'牡牛座','sign.2':'双子座','sign.3':'蟹座','sign.4':'獅子座','sign.5':'乙女座','sign.6':'天秤座','sign.7':'蠍座','sign.8':'射手座','sign.9':'山羊座','sign.10':'水瓶座','sign.11':'魚座',
    'moon.intro':'感情的に、','moon.suffix':'のエネルギーが強く作用し、内面の安定を求める方法と無意識の反応パターンに影響を与えます。',
    'asc.mid':'のエネルギーが上昇宮にあり、初対面の人に','asc.suffix':'という印象を与える傾向があります。',
    '무료 해석':'無料解釈','핵심 3궁':'核心3宮','핵심 3요소':'核心3要素',
    '멤버십 전용':'メンバーシップ専用','나머지 9궁':'残り9宮','상세 해석 제공':'詳細解釈提供',
    '현재 대운':'現在の大運','지난 대운':'過去の大運','미래 대운':'未来の大運',
    '멤버십에서 상세 해석 확인':'メンバーシップで詳細確認',
    '공궁':'空宮',
    '멤버십 전용 · 자미두수 12궁 완전 해석':'会員限定 · 紫微斗数12宮完全解釈',
    '형제·자녀·질액·천이·교우·관록·전택·복덕·부모궁 + 사화 분석 + 대운·유년 연계 해석을 멤버십에서 확인하세요.':'兄弟・子女・疾厄・遷移・交友・官禄・田宅・福徳・父母宮＋四化分析＋大運・流年連動解釈 — 会員限定。',
    '멤버십 전용 · 심층 점성술 해석':'会員限定 · 占星術詳細解釈',
    '멤버십 전용 · 심층 점성술 완전 해석':'会員限定 · 占星術完全解釈',
    '점성술 멤버십 배너 설명':'ネイタルチャート・トランジット・ソーラーリターン・心理占星術・職業財愛情分析・シナストリー・アストロカルトグラフィー等 — 会員限定。',
    '각 신살의 연애·직업·건강 영역별 심층 분석, AI 종합 해석을 멤버십에서 확인하세요.':'各神殺の恋愛・職業・健康への影響を深く分析。AI総合解釈は会員限定。',
    '네이탈 차트 완전 해석':'ネイタルチャート完全解釈','심리 점성학':'心理占星術',
    '직업운 심층 해석':'職業運深層解釈','재물운 심층 해석':'財運深層解釈',
    '연애·결혼운 심층 해석':'恋愛・結婚運深層解釈','트랜짓 미래운':'トランジット未来運',
    '솔라 리턴 (생일 1년 운세)':'ソーラーリターン（誕生日年運）','프로그레션 (내면 성장)':'プログレッション（内面成長）',
    '시나스트리 궁합':'シナストリー相性','컴포지트 관계 차트':'コンポジットチャート',
    '아스트로카토그래피':'アストロカルトグラフィー','건강 점성학':'健康占星術',
    '카르마·영혼 해석':'カルマ・魂解釈','역행 행성 해석':'逆行惑星解釈',
    '12하우스 전체 해석':'12ハウス全解釈','행성 각도 심층 해석':'アスペクト深層解釈',
    '기본 성격과 인생의 핵심 구조':'基本的な性格と人生の核心構造',
    '재물·수입·금전 흐름':'財産・収入・金銭の流れ',
    '배우자·연인과의 인연':'配偶者・恋人との縁',
    '형제자매·동료와의 인연':'兄弟姉妹・同僚との縁',
    '자녀운과 창조적 에너지':'子供運と創造的エネルギー',
    '건강·체질·질병 경향':'健康・体質・疾病傾向',
    '이동·해외·외부 활동':'移動・海外・外部活動',
    '친구·인맥·사회적 관계':'友人・人脈・社会的関係',
    '직업·사회적 성취·명예':'職業・社会的成就・名誉',
    '부동산·주거·가정환경':'不動産・住居・家庭環境',
    '정신세계·복·내면의 행복':'精神世界・福・内面の幸福',
    '부모운·윗사람과의 관계':'親運・目上の人との関係',
    '황소자리는 금성이 지배하는 흙의 별자리입니다. 안정과 물질적 풍요를 중시하며, 한번 결정한 것은 끝까지 밀고 나가는 끈기가 있습니다. 감각적인 즐거움과 아름다움을 사랑하며, 신뢰할 수 있는 든든한 파트너입니다. 변화에 저항하는 고집스러운 면이 있어 유연성을 기르는 것이 중요합니다.':'牡牛座は金星が支配する土の星座です。安定と物質的な豊かさを重視し、一度決めたことは最後まで押し通す粘り強さがあります。感覚的な楽しみと美しさを愛し、信頼できる頼もしいパートナーです。変化に抵抗する頑固な面があるため、柔軟性を養うことが重要です。'
  },
  zh: {
    '기본 운세':'基本運勢','사주 원국 기반':'四柱原局',
    '오늘의 운세':'今日運勢','일진 분석':'日辰分析',
    '용신 분석':'用神分析','일간 강약과 오행 균형':'日干強弱與五行平衡',
    '12운성':'十二運星','생애 에너지 흐름':'生命能量流','일간 기준 · 사주 각 기둥의 생명 단계':'日干基準 · 各柱生命階段',
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
    '■ 행운의 색':'■ 幸運的顏色',
    '● 행운의 색':'● 幸運的顏色',
    '✨ 자미두수 12궁 상세 해석':'✨ 紫微斗數十二宮詳細解析',
    '✨ 천궁도 행성·하우스·상(Aspect) 분석':'✨ 天宮圖行星·宮位·相位(Aspect)分析',
    '감성과 영성이 필요한 분야에서 탁월합니다. 예술, 음악, 의료, 상담, 종교, 사진 분야가 잘 맞습니다. 깊은 공감 능력과 창의적 상상력이 강점입니다.':'在需要感性與靈性的領域表現卓越。藝術、音樂、醫療、諮詢、宗教、攝影領域非常適合。具備深厚的共感能力與創造性想像力是優勢。',
    '감정적 교류에서 어려움이 있을 수 있습니다. 오해나 갈등이 생기기 쉬운 시기이므로 충동적인 감정 표현을 자제하고 신중하게 행동하는 것이 좋습니다. 혼자만의 시간을 통해 감정을 정리하세요.':'在情感交流上可能會有困難。此時期易生誤會或衝突，建議抑制衝動的情緒表達，謹慎行事。透過獨處時間整理情緒。',
    '감정적으로 깊이 연결되는 것을 원합니다. 상대를 세심하게 배려하고 보호하려 하며, 가정적인 사랑을 꿈꿉니다. 상처받으면 껍질 속으로 들어가는 경향이 있습니다.':'渴望情感上的深度連結。細心照顧與保護對方，夢想家庭式的愛情。受傷時傾向封閉自我。',
    '강렬한 에너지로 추진력이 강하지만 사고·수술·구설에 주의가 필요합니다.':'以強烈能量推動事務，但需注意事故、手術與口舌是非。',
    '강한 감수성과 예술적 재능을 가지며 이성 관계가 활발합니다.':'具備強烈感受性與藝術天賦，異性關係活躍。',
    '강한 도전과 변화의 시기입니다. 외부 압박이나 경쟁이 심해질 수 있으나, 이를 극복하면 큰 성취를 이룰 수 있습니다. 건강 관리와 법적 문제에 각별히 주의하세요.':'是強烈挑戰與變化的時期。外在壓力或競爭可能加劇，但克服後可獲得重大成就。特別注意健康管理與法律問題。',
    '강한 의지, 충동적 행동 주의':'意志堅強，注意衝動行為。',
    '강한 의지력, 극단적 기운':'意志力強，帶有極端氣息。',
    '강한 의지와 리더십이 있지만 극단적 상황이 발생할 수 있습니다.':'具強烈意志與領導力，但可能發生極端情況。',
    '건강 상태가 전반적으로 양호합니다. 규칙적인 생활과 적당한 운동으로 현재의 좋은 컨디션을 유지하세요. 스트레스 관리에 신경 쓰면 더욱 활기찬 생활이 가능합니다.':'整體健康狀況良好。保持規律生活與適度運動以維持良好體能。注意壓力管理，可活得更有活力。',
    '건강 운이 매우 좋지 않은 시기입니다. 만성 질환이 악화되거나 새로운 건강 문제가 발생할 수 있습니다. 즉시 전문의 상담을 받고, 과로와 스트레스를 철저히 피하세요. 몸의 신호에 귀를 기울이는 것이 중요합니다.':'健康運勢非常不佳。慢性病可能惡化或出現新健康問題。應立即諮詢專科醫師，徹底避免過勞與壓力。傾聽身體訊號非常重要。',
    '건강 운이 평범한 편입니다. 특별한 이상은 없지만 과로나 스트레스에 취약할 수 있습니다. 충분한 수면과 균형 잡힌 식사로 기초 체력을 유지하는 것이 중요합니다.':'健康運勢屬平常。無特別異常，但易受過勞與壓力影響。保持充足睡眠與均衡飲食以維持基本體力。',
    '건강에 주의가 필요한 시기입니다. 피로 누적이나 소화기 계통의 문제가 생길 수 있습니다. 무리한 활동을 자제하고 정기적인 건강 검진을 받는 것이 좋습니다. 충분한 휴식이 필수입니다.':'需注意健康的時期。可能累積疲勞或出現消化系統問題。建議避免過度勞累，定期健康檢查。充分休息不可或缺。',
    '게자리는 달이 지배하는 물의 별자리입니다. 감수성이 풍부하고 직관력이 뛰어나며, 가족과 가정을 무엇보다 소중히 여깁니다. 타인의 감정에 민감하게 반응하는 공감 능력이 탁월합니다. 감정 기복이 있을 수 있으며, 과거에 집착하는 경향을 의식적으로 조절하면 더 성장할 수 있습니다.':'巨蟹座是由月亮主宰的水象星座。感受力豐富、直覺敏銳，極重視家庭與親情。具卓越的共感能力，對他人情緒反應敏感。情緒波動較大，若能有意識調整對過去的執著，將更能成長。',
    '관재구설과 소송에서 보호받으며 관운이 좋아집니다.':'受官非口舌與訴訟保護，官運良好。',
    '균형 잡힌 아름다운 관계를 추구합니다. 로맨틱하고 우아한 사랑을 즐기며, 파트너와의 조화를 중시합니다. 갈등을 피하려는 성향이 있어 솔직한 표현이 필요합니다.':'追求平衡美好的關係。享受浪漫優雅的愛情，重視與伴侶的和諧。傾向避免衝突，需學習坦率表達。',
    '균형과 조화가 필요한 분야에서 능력을 발휘합니다. 법률, 외교, 디자인, 패션, 상담, 중재 분야가 잘 맞습니다. 공정한 판단력과 미적 감각이 뛰어납니다.':'在需要平衡與和諧的領域展現才能。法律、外交、設計、時尚、諮詢、調解等領域適合。具公正判斷力與美感。',
    '금 기운이 과잉되어 지나친 냉정함이나 갈등을 일으킬 수 있습니다. 날카로운 언행과 무리한 경쟁을 자제하세요. 금속 소품이나 흰색 계열을 과도하게 사용하면 긴장감이 높아질 수 있습니다.':'金氣過盛可能導致過度冷靜或引發衝突。請克制尖銳言行與過度競爭。過度使用金屬飾品或白色系會增加緊張感。',
    '금속의 날카로운 기운이 결단력과 재물운을 강화합니다. 서쪽 방향, 흰색·금색 계열이 길하며 계획적인 재테크와 자기 계발이 운을 높입니다. 원칙을 지키는 행동이 신뢰를 쌓습니다.':'金屬的銳利氣息強化決斷力與財運。西方方位、白色與金色系吉利，有計劃的理財與自我提升可提升運勢。守規矩的行為建立信任。',
    '기운이 좋은 날입니다. 계획한 일들이 진행되고 주변의 도움을 받기 쉬운 시기입니다.':'是氣運良好的日子。計劃中的事務順利推進，易獲得周圍的幫助。',
    '기질의 균형이 무난한 편입니다. 장점과 단점이 공존하며, 환경에 따라 성격 표현이 달라질 수 있습니다. 자신의 강점을 의식적으로 계발하면 더 큰 잠재력을 발휘할 수 있습니다.':'氣質平衡尚可。優缺點並存，性格表現隨環境而異。若有意識地培養自身優勢，能發揮更大潛力。',
    '기질적으로 다소 불균형한 면이 있어 감정 기복이나 결정 장애를 경험할 수 있습니다. 자기 이해를 높이고 약점을 보완하는 노력이 필요합니다. 내면의 안정을 찾는 것이 중요한 과제입니다.':'本質上存在些許不平衡，可能會經歷情緒波動或決策障礙。需要提升自我理解並努力彌補弱點。尋找內心的安定是重要課題。',
    '깊고 강렬한 사랑을 원합니다. 상대의 영혼까지 알고 싶어하며, 완전한 신뢰와 헌신을 요구합니다. 질투심이 강할 수 있으나, 그만큼 깊이 사랑합니다.':'渴望深刻且強烈的愛情。想了解對方的靈魂，要求完全的信任與奉獻。可能嫉妒心強，但愛得深沉。',
    '꿈같은 로맨스를 꿈꿉니다. 상대를 이상화하는 경향이 있으며, 깊은 영혼의 교감을 원합니다. 감정적으로 민감하고 공감 능력이 뛰어나 상대의 마음을 잘 읽습니다.':'夢想如夢似幻的浪漫。傾向理想化對方，渴望深層靈魂的交流。情感敏感且具高度共感能力，能讀懂對方的心意。',
    '나무 기운이 과잉되어 균형을 흐트러뜨립니다. 지나친 고집이나 무리한 확장을 조심하세요. 동쪽 방향과 초록색 계열을 과도하게 사용하면 에너지 소모가 커질 수 있으니 절제가 필요합니다.':'木氣過盛，導致失衡。請注意過於固執或過度擴張。過度使用東方方位及綠色系會消耗大量能量，需節制。',
    '나무의 기운이 부족한 명식에 생기를 불어넣습니다. 성장·창의·도전의 에너지를 보충해 주므로 동쪽 방향, 초록색 계열, 봄철 활동이 길합니다. 새로운 시작이나 사업 확장에 유리한 시기를 잘 활용하세요.':'為木氣不足的命盤注入生氣。補充成長、創意與挑戰的能量，東方方位、綠色系及春季活動皆有利。善用新開始或事業擴展的良機。',
    '당신의 띠는':'你的生肖是','띠 입니다':'年生肖',
    'elem.목':'木','elem.화':'火','elem.토':'土','elem.금':'金','elem.수':'水',
    '대지의 안정된 기운이 중심을 잡아줍니다. 중앙·황토색 계열이 길하며 부동산·저축·건강 관리에 집중하면 운이 열립니다. 신뢰와 성실함으로 주변의 지지를 얻는 것이 중요합니다.':'大地穩定的氣息為中心定下基礎。中央及黃土色系有利，專注於房地產、儲蓄與健康管理將開啟好運。以信賴與誠實獲得周遭支持至關重要。',
    '대화와 지적 교감을 중시합니다. 다양한 사람에게 관심을 보이지만, 진정한 소울메이트를 찾습니다. 자유로운 관계를 선호하며 구속을 싫어합니다.':'重視對話與智慧交流。對多樣的人群感興趣，但尋找真正的靈魂伴侶。偏好自由關係，厭惡束縛。',
    '독특하고 자유로운 사랑을 원합니다. 친구 같은 파트너를 선호하며, 지적 교감과 공통된 가치관을 중시합니다. 감정적 친밀감보다 정신적 연결을 더 중요하게 여깁니다.':'渴望獨特且自由的愛情。偏好如朋友般的伴侶，重視智慧交流與共同價值觀。精神連結比情感親密更重要。',
    '독특한 인상':'獨特的印象',
    '돌봄과 감성이 필요한 분야에서 탁월합니다. 의료, 사회복지, 교육, 요식업, 부동산, 상담 분야가 잘 맞습니다. 사람들의 감정을 이해하고 보살피는 능력이 뛰어납니다.':'在需要關懷與感性的領域表現卓越。適合醫療、社會福利、教育、餐飲、房地產及諮詢等行業。具備理解並照顧他人情感的優秀能力。',
    '로맨틱하고 극적인 사랑을 즐깁니다. 상대에게 최고의 것을 선사하고 싶어하며, 충성스럽고 열정적인 파트너입니다. 인정받지 못하면 상처를 받습니다.':'享受浪漫且戲劇性的愛情。渴望為對方獻上最好的，是忠誠且熱情的伴侶。若未被認可，容易受傷。',
    '리더십과 추진력이 필요한 분야에서 두각을 나타냅니다. 스포츠, 군경, 기업가, 개척 사업, 응급 의료 분야가 잘 맞습니다. 독립적으로 일하거나 팀을 이끄는 역할이 적합합니다.':'在需要領導力與推動力的領域嶄露頭角。適合體育、軍警、企業家、開拓事業及急救醫療等行業。適合獨立工作或帶領團隊。',
    '말년운 (50세~)':'晚年運（50歲起）',
    '멤버십 상세 분석':'會員詳細分析',
    '명식 산출하기':'計算命盤',
    '명예와 사회적 지위가 높아지는 시기입니다. 조직 내 승진이나 인정을 받을 기회가 생기며, 책임감과 원칙을 중시하게 됩니다. 공직·전문직에서 두각을 나타낼 수 있습니다.':'是名望與社會地位提升的時期。有機會在組織內升遷或獲得認可，重視責任感與原則。可在公職或專業領域展現才華。',
    '몸과 마음의 에너지가 매우 충만한 시기입니다. 체력이 넘치고 면역력도 강해 활발한 활동이 가능합니다. 이 시기에 건강한 습관을 정착시키면 오랫동안 좋은 컨디션을 유지할 수 있습니다.':'身心能量極為充沛的時期。體力充沛且免疫力強，能積極活動。若此時養成健康習慣，將長期維持良好狀態。',
    '물고기자리는 해왕성과 목성이 지배하는 물의 별자리입니다. 예민한 감수성과 깊은 공감 능력, 영적 직관이 뛰어납니다. 예술적 재능과 상상력이 풍부하며, 타인의 고통에 민감하게 반응합니다. 현실과 이상 사이에서 혼란을 겪을 수 있으므로, 경계를 설정하고 자신을 보호하는 것이 중요합니다.':'雙魚座為海王星與木星主宰的水象星座。具敏銳感受性與深厚共感能力，靈性直覺出眾。藝術天賦與豐富想像力，對他人痛苦反應敏感。易在現實與理想間迷惘，需設立界限並保護自己。',
    '물병자리는 천왕성과 토성이 지배하는 바람의 별자리입니다. 독창적이고 혁신적인 사고로 미래를 내다보는 능력이 있습니다. 인류애와 평등을 중시하며, 독립적이고 자유로운 정신을 가지고 있습니다. 감정적 거리감이 있을 수 있으므로, 친밀한 관계에서 따뜻함을 표현하는 연습이 도움이 됩니다.':'水瓶座為天王星與土星主宰的風象星座。具獨創且創新的思維，能洞察未來。重視人類愛與平等，擁有獨立自由的精神。可能有情感距離感，練習在親密關係中表達溫暖有助於改善。',
    '물의 지혜로운 기운이 지식과 재물의 흐름을 원활하게 합니다. 북쪽 방향, 검정·파란색 계열이 길하며 학업·연구·금융 분야에서 두각을 나타낼 수 있습니다. 유연한 사고로 기회를 포착하세요.':'水的智慧之氣促進知識與財富流動。北方方位及黑色、藍色系有利，能在學業、研究及金融領域表現突出。以靈活思維捕捉機會。',
    '변화와 혁신을 추구하는 시기입니다. 창의적 아이디어가 넘치고 기존 틀을 벗어나려는 욕구가 강해집니다. 직업 변화나 이직을 고려할 수 있으며, 언행에 주의가 필요합니다.':'追求變革與創新的時期。創意湧現，強烈渴望突破既有框架。可能考慮職業變動或跳槽，言行需謹慎。',
    '부귀와 안락의 별, 재물과 명예':'富貴與安樂之星，財富與名譽',
    '분석과 정밀함이 필요한 분야에서 두각을 나타냅니다. 의료, 회계, 연구, 편집, 영양, 품질관리 분야가 잘 맞습니다. 세심한 주의력과 완벽을 추구하는 성향이 강점입니다.':'在需分析與精密的領域表現突出。適合醫療、會計、研究、編輯、營養及品質管理等行業。細心與追求完美是強項。',
    '불 기운이 과잉되어 충동적 행동이나 과열을 유발할 수 있습니다. 감정 기복과 급한 결정을 경계하세요. 빨간색 계열과 남쪽 방향을 과도하게 접하면 스트레스가 가중될 수 있습니다.':'火氣過盛，易引發衝動行為或過熱狀態。警惕情緒波動與急躁決策。過度接觸紅色系與南方方位可能加重壓力。',
    '불의 기운으로 열정과 표현력을 강화합니다. 남쪽 방향, 빨간색 계열이 행운을 부르며 인간관계와 명예 운이 상승합니다. 적극적인 자기 표현과 사교 활동이 운을 여는 열쇠입니다.':'以火的氣運強化熱情與表現力。南方方向、紅色系統帶來好運，提升人際關係與名譽運。積極的自我表達與社交活動是開啟運勢的鑰匙。',
    '사수자리는 목성이 지배하는 불의 별자리입니다. 자유를 사랑하고 철학적 사고와 모험 정신이 넘칩니다. 낙관적이고 유머 감각이 뛰어나며, 다양한 문화와 지식을 탐구하는 것을 즐깁니다. 무책임하거나 직설적인 말로 상처를 줄 수 있으므로, 세심한 배려가 필요합니다.':'射手座是由木星主宰的火象星座。熱愛自由，充滿哲學思考與冒險精神。樂觀且幽默感強，喜歡探索多元文化與知識。因言語直率或不負責任可能傷害他人，需細心體貼。',
    '사자자리는 태양이 지배하는 불의 별자리입니다. 타고난 리더십과 카리스마로 자연스럽게 주목받습니다. 창의적이고 표현력이 풍부하며, 무대 위에서 빛나는 존재감을 발휘합니다. 자존심이 강하고 인정받고 싶은 욕구가 크므로, 겸손함을 갖추면 더욱 빛납니다.':'獅子座是由太陽主宰的火象星座。天生領導力與魅力，自然成為眾人焦點。創造力豐富且表現力強，在舞台上展現耀眼存在感。自尊心強且渴望被認可，若能保持謙遜將更加閃耀。',
    '사회적 활동과 직업 운이 매우 강한 시기입니다. 능력을 인정받고 승진이나 중요한 기회가 찾아올 수 있습니다. 새로운 프로젝트나 도전에 적극적으로 나서면 좋은 결과를 얻을 수 있습니다.':'社交活動與職業運勢極為強盛的時期。能力獲得認可，可能迎來升遷或重要機會。積極參與新專案或挑戰，能獲得良好成果。',
    '성격과 기질이 안정적으로 발달해 있어 사회적 관계에서 신뢰를 쌓기 쉽습니다. 자신의 감정을 잘 조절하며, 목표를 향해 꾸준히 나아가는 힘이 있습니다. 다양한 상황에서 유연하게 대처하는 능력이 돋보입니다.':'性格與氣質穩定發展，易於在社會關係中建立信任。善於調節自身情緒，具備持續朝目標前進的力量。靈活應對各種情況的能力尤為突出。',
    '소통과 정보를 다루는 분야에서 빛납니다. 언론, 교육, IT, 마케팅, 작가, 통역 분야가 잘 맞습니다. 다양한 분야를 넘나드는 멀티태스킹 능력이 강점입니다.':'在溝通與資訊處理領域閃耀。媒體、教育、資訊科技、市場行銷、作家、口譯等領域相當適合。跨足多領域的多工能力是強項。',
    '수 기운이 과잉되어 우유부단함이나 과도한 걱정을 유발할 수 있습니다. 지나친 분석과 소극적 태도를 경계하세요. 검정·파란색 계열과 북쪽 방향을 과도하게 접하면 에너지가 침체될 수 있습니다.':'水氣過盛可能導致優柔寡斷或過度擔憂。警惕過度分析與消極態度。過度接觸黑色、藍色系及北方方向，能量可能陷入低迷。',
    '신비롭고 예민한 기운이 강하게 작동할 수 있음':'神秘且敏感的氣運強烈運作中。',
    '심층 분석과 변화를 다루는 분야에서 탁월합니다. 심리학, 의학, 금융, 탐정, 연구, 위기관리 분야가 잘 맞습니다. 숨겨진 진실을 파헤치는 능력과 강한 집중력이 강점입니다.':'在深層分析與變革領域表現卓越。心理學、醫學、金融、偵探、研究、危機管理等領域相當適合。揭露隱藏真相的能力與強大專注力是優勢。',
    '쌍둥이자리는 수성이 지배하는 바람의 별자리입니다. 지적 호기심이 넘치고 다재다능하며, 소통과 정보 교환에 탁월합니다. 두 가지 상반된 성향이 공존하여 상황에 따라 다른 모습을 보이기도 합니다. 언어 능력과 적응력이 뛰어나 다양한 분야에서 활약할 수 있습니다.':'雙子座是由水星主宰的風象星座。充滿智慧好奇心，多才多藝，擅長溝通與資訊交流。兩種相反性格共存，依情況展現不同面貌。語言能力與適應力優秀，能在多領域活躍。',
    '안정적이고 실용적인 분야에서 능력을 발휘합니다. 금융, 부동산, 요리, 예술, 농업, 건축 분야가 잘 맞습니다. 장기적인 프로젝트를 꾸준히 완성하는 능력이 탁월합니다.':'在穩定且實用的領域展現能力。金融、不動產、烹飪、藝術、農業、建築等領域相當適合。持續完成長期專案的能力卓越。',
    '안정적인 재물 축적과 내실을 다지는 시기입니다. 꾸준한 노력이 결실을 맺고 저축과 부동산 등 안정적 자산 관리에 유리합니다. 성실하게 임하면 좋은 결과를 얻습니다.':'是穩定積累財富與鞏固內實的時期。持續努力結出成果，有利於儲蓄與不動產等穩定資產管理。誠實勤奮將獲得良好結果。',
    '애정 운이 좋은 편으로, 관계에서 따뜻한 교류가 이루어집니다. 진심 어린 소통이 관계를 더욱 돈독하게 만들어 줍니다. 솔직한 감정 표현이 인연을 발전시키는 열쇠가 됩니다.':'愛情運良好，關係中有溫暖交流。真誠溝通使關係更加穩固。坦率表達感情是發展緣分的關鍵。',
    '애정 운이 평범한 편입니다. 특별한 변화보다는 현재 관계를 안정적으로 유지하는 것이 중요합니다. 상대방의 입장을 이해하려는 노력이 관계의 질을 높여줍니다.':'愛情運平平。維持現有關係的穩定比特別變化更重要。努力理解對方立場能提升關係品質。',
    '약간의 주의가 필요한 날입니다. 중요한 결정이나 큰 지출은 미루는 것이 좋습니다.':'需稍加注意的一天。重要決定或大額支出宜延後。',
    '양자리는 황도 12궁의 첫 번째 별자리로, 화성이 지배하는 불의 별자리입니다. 개척 정신과 추진력이 강하며, 새로운 일을 시작하는 데 탁월한 능력을 발휘합니다. 경쟁심이 강하고 즉흥적인 면이 있어 충동적 결정에 주의가 필요합니다. 리더십이 뛰어나고 용기 있는 행동으로 주변을 이끄는 타입입니다.':'牡羊座是黃道十二宮的第一宮，由火星主宰的火象星座。具開拓精神與強烈推動力，擅長開創新事物。競爭心強且衝動，須留意衝動決策。領導力卓越，以勇敢行動帶領周遭。',
    '에너지 소모가 클 수 있는 날입니다. 충동적인 행동을 자제하고 안정을 취하세요.':'能量消耗可能較大的一天。抑制衝動行為，保持安定。',
    '열정과 감정의 기운, 예술적 재능':'熱情與情感的氣運，藝術天賦。',
    '열정적이고 직접적으로 감정을 표현합니다. 첫눈에 반하는 경우가 많고, 상대를 적극적으로 리드합니다. 권태기가 오면 새로운 자극이 필요합니다.':'熱情且直接表達情感。常有一見鍾情，積極引領對方。感情進入倦怠期時需尋求新刺激。',
    '염소자리는 토성이 지배하는 흙의 별자리입니다. 책임감이 강하고 목표를 향한 끈기와 실용적 판단력이 탁월합니다. 사회적 성공과 명예를 중시하며, 체계적이고 성실하게 기반을 쌓아갑니다. 감정 표현이 서툴고 지나치게 일에 집중하는 경향이 있어, 휴식과 감정 교류도 중요합니다.':'魔羯座是由土星主宰的土象星座。責任感強，對目標具堅持與實用判斷力。重視社會成功與名譽，系統且誠實地建立基礎。情感表達較為笨拙，過度專注工作，故休息與情感交流亦重要。',
    '오행 불균형으로 인해 기질적 갈등이 심할 수 있습니다. 충동적 행동이나 극단적 감정 반응에 주의가 필요합니다. 명상, 규칙적인 생활, 신뢰할 수 있는 조언자의 도움을 받는 것이 도움이 됩니다.':'五行失衡導致氣質衝突嚴重。需注意衝動行為與極端情緒反應。冥想、規律生活及可信賴顧問的協助有助改善。',
    '완벽한 파트너를 찾기 위해 신중하게 관계를 시작합니다. 실용적이고 헌신적인 사랑을 하며, 세심한 배려로 상대를 돌봅니다. 지나친 비판은 관계를 어렵게 할 수 있습니다.':'為尋找完美伴侶而謹慎開始關係。實用且奉獻的愛情，以細心體貼照顧對方。過度批評可能使關係陷入困難。',
    '용신을 보조하는 금 기운입니다. 정확하고 체계적인 행동이 운을 뒷받침합니다. 금속 소품이나 흰색 계열 인테리어가 이 기운을 강화하며, 계획적인 생활 패턴이 도움이 됩니다.':'輔助用神的金氣。精確且有系統的行動支撐運勢。金屬飾品或白色系室內裝潢能強化此氣運，有計劃的生活模式有助提升。',
    '용신을 보조하는 나무 기운입니다. 창의적 활동과 인간관계 확장이 간접적으로 운을 돕습니다. 식물 키우기, 등산, 새벽 산책 등 목(木) 기운을 접하는 생활 습관이 에너지를 보충해 줍니다.':'輔助用神的木氣。創意活動與擴展人際關係間接助運。種植植物、登山、清晨散步等接觸木氣的生活習慣能補充能量。',
    '용신을 보조하는 불 기운입니다. 밝고 활기찬 환경이 운의 흐름을 원활하게 합니다. 조명이 밝은 공간에서 활동하거나 따뜻한 색상의 소품을 활용하면 보조 에너지가 강화됩니다.':'輔助用神的火氣。明亮且充滿活力的環境使運勢流暢。在明亮空間活動或使用暖色系飾品可強化輔助能量。',
    '용신을 보조하는 수 기운입니다. 지식 축적과 내면 성찰이 운을 간접적으로 강화합니다. 독서, 명상, 수영 등 수(水) 기운과 연관된 활동이 보조 에너지를 활성화합니다.':'用神所輔助的水氣運。知識積累與內在省思間接強化運勢。閱讀、冥想、游泳等與水（水）氣相關的活動能激活輔助能量。',
    '용신을 보조하는 토 기운입니다. 안정적인 생활 기반이 전체 운을 뒷받침합니다. 규칙적인 식사와 수면, 꾸준한 저축 습관이 이 기운을 활성화하여 운의 토대를 다집니다.':'用神所輔助的土氣運。穩定的生活基礎支撐整體運勢。規律的飲食與睡眠、持續的儲蓄習慣能激活此氣運，奠定運勢根基。',
    '의료·치유 분야에 재능이 있으며 건강 회복력이 강합니다.':'具備醫療與療癒領域的才能，健康恢復力強。',
    '의술과 건강의 별, 치료 능력':'醫術與健康之星，治療能力',
    '이 대운은 천간의 기운이 일간에 영향을 미치는 시기입니다. 해당 십성의 특성을 이해하고 흐름에 맞게 대응하는 것이 중요합니다.':'此大運為天干之氣影響日干的時期。理解該十星特性並順應流向應對至關重要。',
    '이성 매력, 예술적 감각':'異性魅力，藝術感知',
    '이성에게 매력적으로 보이며 예술·연예 분야에 재능이 있습니다.':'對異性具吸引力，並在藝術、演藝領域有才能。',
    '인연의 기운이 매우 강하게 흐르고 있습니다. 새로운 만남이나 기존 관계의 깊어짐이 기대되는 시기입니다. 감정 표현이 자연스럽게 이루어지며, 상대방의 마음을 얻기에 유리한 에너지가 충만합니다.':'姻緣之氣流動極為強烈。期待新相遇或既有關係深化的時期。情感表達自然流露，充滿有利於獲得對方心意的能量。',
    '인연의 흐름이 막혀 있는 시기입니다. 관계에서 상처를 받거나 이별의 아픔을 경험할 수 있습니다. 자신을 먼저 돌보고 내면의 상처를 치유하는 데 집중하는 것이 현명합니다.':'姻緣流動受阻的時期。可能在關係中受傷或經歷分離之痛。明智之舉為先照顧自己，專注療癒內心創傷。',
    '일생 최고의 귀인을 만나는 기운으로 위기 시 강력한 도움을 받습니다.':'一生中遇見貴人之氣，危機時獲得強力援助。',
    '자립심과 독립 의지가 강해지는 시기입니다. 새로운 시작과 자기 계발에 유리하며, 경쟁 속에서 실력을 키울 수 있습니다. 다만 고집이 세질 수 있으니 협력을 잊지 마세요.':'自立心與獨立意志增強的時期。利於新開始與自我提升，能在競爭中培養實力。但固執可能加劇，切勿忘記合作。',
    '자유롭고 모험적인 사랑을 즐깁니다. 함께 성장하고 세상을 탐험할 파트너를 원합니다. 구속받는 것을 싫어하며, 정신적 교감을 매우 중시합니다.':'享受自由且冒險的愛情。渴望與伴侶共同成長、探索世界。厭惡束縛，非常重視精神交流。',
    '자유와 확장이 필요한 분야에서 성공합니다. 교육, 여행, 출판, 법률, 철학, 해외 비즈니스 분야가 잘 맞습니다. 넓은 시야와 낙관적 에너지로 새로운 기회를 만들어냅니다.':'在需要自由與擴展的領域成功。教育、旅遊、出版、法律、哲學、海外商務等領域相當適合。以寬廣視野與樂觀能量創造新機會。',
    '재물 손실이나 예상치 못한 지출이 발생할 수 있는 시기입니다. 충동적인 소비나 투기적 투자를 자제하고 보수적인 재정 관리가 필요합니다. 보증이나 대출에 특히 주의하세요.':'可能發生財物損失或意外支出。須抑制衝動消費與投機投資，採取保守理財。特別注意保證與貸款風險。',
    '재물 운이 매우 강하게 흐르고 있습니다. 예상치 못한 수입이나 투자 성과가 기대되는 시기입니다. 재물이 자연스럽게 모이는 흐름이므로 장기적인 재테크 계획을 세우기에 좋은 때입니다.':'財運極為強勁。期待意外收入或投資成果。財物自然聚集的流向，適合制定長期理財計劃。',
    '재물 운이 매우 불안정한 시기입니다. 큰 재정적 손실이나 사기 피해의 위험이 있으므로 중요한 금전 거래는 반드시 전문가의 조언을 구하세요. 현금 보유를 늘리고 리스크를 최소화하는 것이 현명합니다.':'財運極不穩定。存在重大財務損失或詐騙風險，重要金錢交易務必諮詢專家。增加現金持有，降低風險為明智之舉。',
    '재물 운이 좋은 편입니다. 수입이 안정적으로 유지되며 절약과 투자의 균형을 잘 맞출 수 있습니다. 소소한 재물 기회들이 꾸준히 찾아오는 시기입니다.':'財運良好。收入穩定，能平衡節約與投資。小額財運機會持續出現的時期。',
    '재물 운이 평범한 편입니다. 큰 이익보다는 현재 재정 상태를 안정적으로 유지하는 것이 중요합니다. 불필요한 지출을 줄이고 저축 습관을 기르는 것이 도움이 됩니다.':'財運平凡。重點在於穩定現有財務狀況。減少不必要支出，養成儲蓄習慣有助益。',
    '재물복과 명예운이 좋아 안정된 삶을 누리는 기운입니다.':'財富與名譽運佳，享受安定生活之氣。',
    '전갈자리는 명왕성과 화성이 지배하는 물의 별자리입니다. 강렬한 의지와 깊이 있는 통찰력을 가지고 있습니다. 비밀을 잘 지키고 심층적인 진실을 탐구하는 능력이 탁월합니다. 집착과 질투심이 강할 수 있으므로, 신뢰를 바탕으로 한 깊은 관계를 형성하는 것이 중요합니다.':'天蠍座為冥王星與火星主宰的水象星座。具強烈意志與深刻洞察力。善守秘密，擅長探究深層真相。可能有強烈執著與嫉妒心，故建立以信任為基礎的深厚關係極為重要。',
    '중년운 (35~50세)':'中年運（35～50歲）',
    '직관력과 영적 감수성이 뛰어나지만 신경과민·불안 경향에 주의가 필요합니다.':'直覺力與靈性感受力卓越，但需注意神經過敏與焦慮傾向。',
    '직업 운이 매우 불안정한 시기입니다. 직장 변동이나 실직의 위험이 있을 수 있으므로 중요한 결정을 미루고 안정을 최우선으로 삼으세요. 신뢰할 수 있는 사람의 조언을 구하는 것이 도움이 됩니다.':'職業運極不穩定。可能面臨職場變動或失業風險，重要決策宜延後，優先追求穩定。尋求可信賴者建議有助益。',
    '직업 운이 순조롭게 흐르고 있습니다. 꾸준한 노력이 인정받는 시기로, 동료나 상사와의 관계도 원만합니다. 자신의 전문성을 더욱 갈고닦으면 더 큰 성과를 거둘 수 있습니다.':'職業運順利。努力獲得認可，與同事及上司關係和諧。持續磨練專業能力可取得更大成就。',
    '직업 운이 평범한 편입니다. 큰 변화보다는 현재 위치에서 성실하게 임하는 것이 중요합니다. 새로운 기술이나 지식을 습득하여 경쟁력을 높이는 것이 도움이 됩니다.':'職業運平凡。重點在於誠實勤奮地履行現有職務。學習新技能或知識以提升競爭力有助益。',
    '직업적으로 어려움이 있을 수 있는 시기입니다. 직장 내 갈등이나 업무 부담이 증가할 수 있으므로 신중하게 행동하고 불필요한 마찰을 피하는 것이 좋습니다. 무리한 도전보다 현상 유지에 집중하세요.':'這是一段職業上可能會遇到困難的時期。職場內的衝突或工作負擔可能增加，因此建議謹慎行事，避免不必要的摩擦。與其冒險挑戰，不如專注於維持現狀。',
    '진지하고 책임감 있는 사랑을 합니다. 장기적인 관계와 안정을 추구하며, 파트너에게 든든한 지원자가 됩니다. 감정 표현이 서툴 수 있으나 깊이 헌신합니다.':'以認真且負責任的態度去愛。追求長期的關係與穩定，成為伴侶堅強的支持者。情感表達可能較為笨拙，但內心深深奉獻。',
    '창의력과 표현력이 풍부해지는 시기입니다. 재능을 발휘하고 새로운 것을 배우기에 좋으며, 음식·예술·교육 분야에서 기회가 생깁니다. 전반적으로 안정적이고 여유로운 대운입니다.':'創造力與表達力豐富的時期。適合展現才華與學習新事物，在飲食、藝術、教育領域會有機會。整體來說是穩定且從容的大運。',
    '창의성과 리더십이 필요한 분야에서 성공합니다. 연예, 예술, 경영, 교육, 정치, 이벤트 기획 분야가 잘 맞습니다. 무대 위에서 빛나는 존재감과 카리스마가 강점입니다.':'在需要創意與領導力的領域中獲得成功。娛樂、藝術、經營、教育、政治、活動策劃等領域相當適合。舞台上的存在感與魅力是強項。',
    '처녀자리는 수성이 지배하는 흙의 별자리입니다. 분석력과 세심함이 뛰어나며, 완벽을 추구하는 성실한 성향입니다. 실용적이고 논리적인 사고로 문제를 해결하는 능력이 탁월합니다. 지나친 완벽주의와 자기비판에 주의하고, 있는 그대로의 자신을 인정하는 연습이 필요합니다.':'處女座是由水星主宰的土象星座。具備卓越的分析力與細心，追求完美且誠實認真。以實用且邏輯的思考解決問題的能力出眾。需注意過度完美主義與自我批評，練習接受真實的自己。',
    '천천히 신중하게 마음을 열지만, 한번 사랑에 빠지면 매우 헌신적입니다. 안정적이고 감각적인 사랑을 추구하며, 물질적 표현으로 애정을 드러냅니다.':'慢慢且謹慎地打開心扉，但一旦陷入愛情則極為奉獻。追求穩定且感性的愛，以物質表現來展現情感。',
    '천칭자리는 금성이 지배하는 바람의 별자리입니다. 균형과 조화를 추구하며, 아름다움과 예술적 감각이 뛰어납니다. 공정함을 중시하고 타인과의 관계에서 외교적 능력을 발휘합니다. 결정을 내리기 어려워하는 우유부단함이 있어, 자신의 내면 목소리를 믿는 연습이 중요합니다.':'天秤座是由金星主宰的風象星座。追求平衡與和諧，擁有卓越的美感與藝術感知。重視公正，在人際關係中展現外交能力。因優柔寡斷而難以做決定，練習相信內心的聲音非常重要。',
    '청년운 (15~35세)':'青年運（15~35歲）',
    '체계와 성취가 필요한 분야에서 두각을 나타냅니다. 경영, 정치, 금융, 건축, 행정, 공학 분야가 잘 맞습니다. 장기적인 목표를 향해 꾸준히 나아가는 끈기가 강점입니다.':'在需要系統性與成就的領域中嶄露頭角。經營、政治、金融、建築、行政、工程等領域相當適合。朝長期目標持續前進的韌性是強項。',
    '초년운 (0~15세)':'初年運（0~15歲）',
    '최고 귀인성, 위기 극복':'最高貴人星，克服危機',
    '최고의 귀인, 큰 도움과 인복':'最強貴人，獲得巨大幫助與人緣',
    '추진력과 결단력이 강하지만 충동적 행동과 대인 갈등에 주의하세요.':'推動力與決斷力強，但需注意衝動行為與人際衝突。',
    '타고난 기질이 매우 조화롭고 균형 잡혀 있습니다. 어떤 환경에서도 자신의 강점을 발휘하며, 주변 사람들에게 긍정적인 영향을 미치는 타고난 리더 기질을 지니고 있습니다. 직관력과 판단력이 뛰어나 중요한 순간에 탁월한 선택을 내립니다.':'天生的氣質非常和諧且均衡。無論身處何種環境，都能發揮自身優勢，具備影響周圍人的天生領導氣質。直覺與判斷力優秀，在重要時刻做出卓越選擇。',
    '토 기운이 과잉되어 정체와 고집을 유발할 수 있습니다. 변화를 두려워하거나 지나치게 보수적인 태도가 기회를 놓치게 합니다. 황토색·중앙 배치를 줄이고 유연한 사고를 키우세요.':'土氣過盛可能引發停滯與固執。害怕變化或過於保守的態度會錯失良機。減少黃土色與中央配置，培養靈活思維。',
    '평온하게 흘러가는 날입니다. 무리한 새 시도보다 기존 일을 꼼꼼히 마무리하세요.':'平靜流淌的一天。與其冒險嘗試新事物，不如仔細完成既有工作。',
    '하는 일마다 순탄하게 풀리는 날입니다. 새로운 시작이나 중요한 결정에 최적입니다.':'事事順利的一天。適合新的開始或重要決策。',
    '하늘의 덕, 재난 소멸':'天德，災難消除',
    '하늘의 덕을 받아 재난과 액운이 자연스럽게 해소됩니다.':'承受天德之力，災難與厄運自然化解。',
    '하늘이 내린 귀인으로 어려운 상황에서 도움을 받는 강한 기운입니다.':'天賜貴人，於困難中獲得幫助的強大氣運。',
    '학문·연구·영성에 관심이 높아지는 시기입니다. 내면을 탐구하고 전문 지식을 쌓기에 좋으며, 예술·의료·종교 분야에서 재능이 발휘됩니다. 고독감이 들 수 있으니 소통을 늘리세요.':'對學問、研究、靈性興趣增加的時期。適合探索內心與積累專業知識，在藝術、醫療、宗教領域展現才華。可能感到孤獨，建議多與人交流。',
    '학문과 시험의 귀인, 문장 재능':'學問與考試貴人，文才天賦',
    '학습과 성장, 귀인의 도움을 받는 시기입니다. 자격증 취득이나 학업에 유리하며, 어른이나 스승의 지원을 받을 수 있습니다. 차분하고 신중하게 임하면 좋은 결과를 얻습니다.':'學習與成長，獲得貴人幫助的時期。適合考取證照或學業，能得到長輩或師長的支持。以沉穩謹慎的態度面對，將獲得良好成果。',
    '학업·시험 운이 강하고 글재주가 뛰어나 문서·계약에 유리합니다.':'學業與考試運強，文筆優秀，有利於文書與合約。',
    '혁신과 미래를 다루는 분야에서 빛납니다. IT, 과학, 사회운동, 방송, 인도주의 분야가 잘 맞습니다. 독창적인 아이디어와 미래를 내다보는 통찰력이 강점입니다.':'在創新與未來領域中閃耀。IT、科學、社會運動、廣播、人道主義領域相當適合。獨創的想法與前瞻性的洞察力是強項。',
    '활동성과 추진력이 강해지는 시기입니다. 재물의 유동성이 크고 인간관계가 넓어집니다. 충동적인 투자나 보증은 피하고 신중한 재무 관리가 필요합니다.':'這是一個活動力與推動力強烈增長的時期。財務流動性大，人際關係廣泛。需避免衝動投資或擔保，謹慎理財尤為重要。',
    '활발한 재물 활동과 사교성이 높아지는 시기입니다. 사업 기회나 투자 수익이 생길 수 있으나 변동성도 큽니다. 이성 인연이 활발해지고 대인관계가 넓어집니다.':'這是一個財務活動活躍、社交性提升的時期。可能出現商機或投資收益，但波動性亦大。異性緣分活躍，人際關係擴展。',
    '신살 분석':'神煞分析','대운 십성':'大運十星','당신의 별자리는':'您的星座是','입니다':'',
    '원국':'原局','사주 원국의 특수 기운 분석':'四柱原局特殊能量分析',
    '길신':'吉神','긍정적인 기운':'正面能量',
    '흉신':'凶神','주의가 필요한 기운':'需要注意的能量',
    '중성 신살':'中性神煞','상황에 따라 달라지는 기운':'随情况变化的能量',
    'sinsal.천을귀인':'天乙貴人','sinsal.천덕귀인':'天德貴人','sinsal.월덕귀인':'月德貴人',
    'sinsal.태극귀인':'太極貴人','sinsal.문창귀인':'文昌貴人',
    'sinsal.천의성':'天醫星','sinsal.금여성':'金輿星','sinsal.화개':'華蓋星',
    'sinsal.귀문관살':'鬼門關殺','sinsal.백호살':'白虎殺',
    'sinsal.괴강살':'魁罡殺','sinsal.양인살':'羊刃殺',
    'sinsal.도화살':'桃花殺','sinsal.홍염살':'紅艶殺',
    '대운 (大運)':'大运','현재 나이':'当前年龄','순행':'顺行','역행':'逆行',
    '현재 대운':'当前大运','지난 대운':'过去大运','미래 대운':'未来大运',
    '세':'岁','양년':'陽年','대운수':'大运数','대운 십성':'大运十星',
    'day.0':'日','day.1':'一','day.2':'二','day.3':'三','day.4':'四','day.5':'五','day.6':'六',
    '점':'分','개':'個',
    '운성.장생':'長生','운성.목욕':'沐浴','운성.관대':'冠帶','운성.임관':'臨官','운성.제왕':'帝旺',
    '운성.쇠':'衰','운성.병':'病','운성.사':'死','운성.묘':'墓','운성.절':'絶','운성.태':'胎','운성.양':'養',
    'grade.강':'强','grade.중':'中','grade.약':'弱',
    '연애 스타일':'戀愛風格','직업 적성':'職業適性',
    '현재 행성 위치 · 지금 나에게 영향을 주는 에너지':'當前行星位置 · 影響您的能量',
    '월의 덕, 관재 소멸':'月德，官災消滅','강한 기운, 사고·수술 주의':'強大氣運，注意事故與手術',
    'sign.0':'白羊座','sign.1':'金牛座','sign.2':'雙子座','sign.3':'巨蟹座','sign.4':'獅子座','sign.5':'處女座','sign.6':'天秤座','sign.7':'天蠍座','sign.8':'射手座','sign.9':'摩羯座','sign.10':'水瓶座','sign.11':'雙魚座',
    'moon.intro':'情感上，','moon.suffix':'的能量強烈作用，影響您尋求內心穩定的方式和潛意識反應模式。',
    'asc.mid':'的能量位於上升星座，給初次見面的人','asc.suffix':'的印象。',
    '무료 해석':'免费解读','핵심 3궁':'核心3宫','핵심 3요소':'核心3要素',
    '멤버십 전용':'会员专属','나머지 9궁':'其余9宫','상세 해석 제공':'提供详细解读',
    '현재 대운':'当前大运','지난 대운':'过去大运','미래 대운':'未来大运',
    '멤버십에서 상세 해석 확인':'会员查看详细解读',
    '공궁':'空宫',
    '멤버십 전용 · 자미두수 12궁 완전 해석':'会员专属 · 紫微斗数12宫完整解读',
    '형제·자녀·질액·천이·교우·관록·전택·복덕·부모궁 + 사화 분석 + 대운·유년 연계 해석을 멤버십에서 확인하세요.':'兄弟·子女·疾厄·迁移·交友·官禄·田宅·福德·父母宫＋四化分析＋大运流年连动解读 — 会员专享。',
    '멤버십 전용 · 심층 점성술 해석':'会员专属 · 占星深度解读',
    '멤버십 전용 · 심층 점성술 완전 해석':'会员专属 · 占星完整解读',
    '점성술 멤버십 배너 설명':'星盘·行运·太阳回归·心理占星·职业财富爱情深度分析·合盘·星盘地图等 — 会员专享。',
    '각 신살의 연애·직업·건강 영역별 심층 분석, AI 종합 해석을 멤버십에서 확인하세요.':'各神煞对爱情·职业·健康的深度分析，AI综合解读会员专享。',
    '네이탈 차트 완전 해석':'完整星盘解读','심리 점성학':'心理占星学',
    '직업운 심층 해석':'职业运深度解读','재물운 심층 해석':'财运深度解读',
    '연애·결혼운 심층 해석':'爱情婚姻深度解读','트랜짓 미래운':'行运未来运势',
    '솔라 리턴 (생일 1년 운세)':'太阳回归（生日年运）','프로그레션 (내면 성장)':'推运（内在成长）',
    '시나스트리 궁합':'比较盘合盘','컴포지트 관계 차트':'合成关系星盘',
    '아스트로카토그래피':'星盘地图','건강 점성학':'健康占星学',
    '카르마·영혼 해석':'业力灵魂解读','역행 행성 해석':'逆行行星解读',
    '12하우스 전체 해석':'12宫完整解读','행성 각도 심층 해석':'行星相位深度解读',
    '기본 성격과 인생의 핵심 구조':'基本性格与人生核心结构',
    '재물·수입·금전 흐름':'财富·收入·金钱流动',
    '배우자·연인과의 인연':'配偶·恋人的缘分',
    '형제자매·동료와의 인연':'兄弟姐妹·同事的缘分',
    '자녀운과 창조적 에너지':'子女运与创造性能量',
    '건강·체질·질병 경향':'健康·体质·疾病倾向',
    '이동·해외·외부 활동':'迁移·海外·外部活动',
    '친구·인맥·사회적 관계':'朋友·人脉·社会关系',
    '직업·사회적 성취·명예':'职业·社会成就·名誉',
    '부동산·주거·가정환경':'房产·居住·家庭环境',
    '정신세계·복·내면의 행복':'精神世界·福气·内心幸福',
    '부모운·윗사람과의 관계':'父母运·与上级的关系',
    '황소자리는 금성이 지배하는 흙의 별자리입니다. 안정과 물질적 풍요를 중시하며, 한번 결정한 것은 끝까지 밀고 나가는 끈기가 있습니다. 감각적인 즐거움과 아름다움을 사랑하며, 신뢰할 수 있는 든든한 파트너입니다. 변화에 저항하는 고집스러운 면이 있어 유연성을 기르는 것이 중요합니다.':'金牛座是由金星主宰的土象星座。重視穩定與物質豐裕，對已決定之事具有堅持到底的韌性。喜愛感官享受與美感，是值得信賴的堅實夥伴。因抗拒變化而顯得固執，培養柔軟性極為重要。'
  },
  es: {
    '기본 운세':'Fortuna Básica','사주 원국 기반':'Basada en la carta natal',
    '오늘의 운세':'Fortuna de Hoy','일진 분석':'Análisis diario',
    '용신 분석':'Análisis Yong-Shin','일간 강약과 오행 균형':'Fortaleza del maestro día y equilibrio de elementos',
    '12운성':'12 Etapas de Vida','생애 에너지 흐름':'Flujo de Energía Vital','일간 기준 · 사주 각 기둥의 생명 단계':'Base del maestro día · Etapa vital de cada pilar',
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
    '⭐대길 ✨길 🌀평 ⚡소흉 ⚠️흉 · ● 행운의 색':'⭐Gran fortuna ✨Buena 🌀Neutral ⚡Precaución ⚠️Mala · ● Color de suerte',
    '오늘':'Hoy',
    '생년월일시를 선택하면 사주·자미두수·점성학 무료 운세를 확인합니다.':'Selecciona tu fecha y hora de nacimiento para ver tu fortuna gratis.',
    '출생 연도':'Año de nacimiento','남성':'Hombre','여성':'Mujer',
    '🔮 무료 운세 보기 (사주 · 자미두수 · 점성학)':'🔮 Ver fortuna gratis (Saju · Ziwei · Astrología)',
    '대길(大吉)':'Gran Fortuna','길(吉)':'Buena','평(平)':'Neutral','소흉(小凶)':'Precaución','흉(凶)':'Mala',
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
    '■ 행운의 색':'■ Color de la suerte',
    '● 행운의 색':'● Color de la suerte',
    '✨ 자미두수 12궁 상세 해석':'✨ Interpretación detallada de las 12 casas en Zi Wei Dou Shu',
    '✨ 천궁도 행성·하우스·상(Aspect) 분석':'✨ Análisis de planetas, casas y aspectos en la carta natal',
    '감성과 영성이 필요한 분야에서 탁월합니다. 예술, 음악, 의료, 상담, 종교, 사진 분야가 잘 맞습니다. 깊은 공감 능력과 창의적 상상력이 강점입니다.':'Destaca en áreas que requieren sensibilidad y espiritualidad. Es ideal para el arte, la música, la medicina, la asesoría, la religión y la fotografía. Su fortaleza radica en una profunda empatía y una imaginación creativa.',
    '감정적 교류에서 어려움이 있을 수 있습니다. 오해나 갈등이 생기기 쉬운 시기이므로 충동적인 감정 표현을 자제하고 신중하게 행동하는 것이 좋습니다. 혼자만의 시간을 통해 감정을 정리하세요.':'Puede haber dificultades en el intercambio emocional. Es un período propenso a malentendidos o conflictos, por lo que es recomendable controlar las expresiones impulsivas de sentimientos y actuar con cautela. Organiza tus emociones a través de momentos de soledad.',
    '감정적으로 깊이 연결되는 것을 원합니다. 상대를 세심하게 배려하고 보호하려 하며, 가정적인 사랑을 꿈꿉니다. 상처받으면 껍질 속으로 들어가는 경향이 있습니다.':'Desea una conexión emocional profunda. Cuida y protege con esmero a los demás, soñando con un amor familiar y hogareño. Tiende a encerrarse en su caparazón cuando se siente herido.',
    '강렬한 에너지로 추진력이 강하지만 사고·수술·구설에 주의가 필요합니다.':'Con una energía intensa y gran impulso, pero debe tener cuidado con accidentes, cirugías y controversias.',
    '강한 감수성과 예술적 재능을 가지며 이성 관계가 활발합니다.':'Posee una sensibilidad fuerte y talento artístico, con relaciones amorosas activas.',
    '강한 도전과 변화의 시기입니다. 외부 압박이나 경쟁이 심해질 수 있으나, 이를 극복하면 큰 성취를 이룰 수 있습니다. 건강 관리와 법적 문제에 각별히 주의하세요.':'Es un período de fuertes desafíos y cambios. Las presiones externas o la competencia pueden intensificarse, pero superarlas traerá grandes logros. Preste especial atención a la salud y asuntos legales.',
    '강한 의지, 충동적 행동 주의':'Voluntad fuerte, cuidado con acciones impulsivas',
    '강한 의지력, 극단적 기운':'Voluntad firme, energía extrema',
    '강한 의지와 리더십이 있지만 극단적 상황이 발생할 수 있습니다.':'Fuerte voluntad y liderazgo, aunque pueden surgir situaciones extremas.',
    '건강 상태가 전반적으로 양호합니다. 규칙적인 생활과 적당한 운동으로 현재의 좋은 컨디션을 유지하세요. 스트레스 관리에 신경 쓰면 더욱 활기찬 생활이 가능합니다.':'El estado de salud es generalmente bueno. Mantenga esta buena condición con una vida regular y ejercicio moderado. Controlar el estrés permitirá una vida más vigorosa.',
    '건강 운이 매우 좋지 않은 시기입니다. 만성 질환이 악화되거나 새로운 건강 문제가 발생할 수 있습니다. 즉시 전문의 상담을 받고, 과로와 스트레스를 철저히 피하세요. 몸의 신호에 귀를 기울이는 것이 중요합니다.':'Es un período con muy mala suerte en la salud. Las enfermedades crónicas pueden empeorar o surgir nuevos problemas. Consulte a un especialista de inmediato y evite el exceso de trabajo y el estrés. Escuchar las señales del cuerpo es fundamental.',
    '건강 운이 평범한 편입니다. 특별한 이상은 없지만 과로나 스트레스에 취약할 수 있습니다. 충분한 수면과 균형 잡힌 식사로 기초 체력을 유지하는 것이 중요합니다.':'La suerte en la salud es promedio. No hay anomalías especiales, pero puede ser vulnerable al agotamiento y al estrés. Es importante mantener la resistencia básica con suficiente sueño y una dieta equilibrada.',
    '건강에 주의가 필요한 시기입니다. 피로 누적이나 소화기 계통의 문제가 생길 수 있습니다. 무리한 활동을 자제하고 정기적인 건강 검진을 받는 것이 좋습니다. 충분한 휴식이 필수입니다.':'Es un período que requiere precaución en la salud. Puede acumularse fatiga o surgir problemas digestivos. Evite actividades excesivas y realice chequeos médicos regulares. El descanso adecuado es esencial.',
    '게자리는 달이 지배하는 물의 별자리입니다. 감수성이 풍부하고 직관력이 뛰어나며, 가족과 가정을 무엇보다 소중히 여깁니다. 타인의 감정에 민감하게 반응하는 공감 능력이 탁월합니다. 감정 기복이 있을 수 있으며, 과거에 집착하는 경향을 의식적으로 조절하면 더 성장할 수 있습니다.':'Cáncer es un signo de agua regido por la luna. Tiene una sensibilidad rica y una intuición destacada, valorando la familia y el hogar por encima de todo. Posee una excelente capacidad empática para responder a las emociones ajenas. Puede experimentar altibajos emocionales y, si controla conscientemente la tendencia a aferrarse al pasado, crecerá aún más.',
    '관재구설과 소송에서 보호받으며 관운이 좋아집니다.':'Está protegido contra disputas, calumnias y litigios, y la suerte en asuntos oficiales mejora.',
    '균형 잡힌 아름다운 관계를 추구합니다. 로맨틱하고 우아한 사랑을 즐기며, 파트너와의 조화를 중시합니다. 갈등을 피하려는 성향이 있어 솔직한 표현이 필요합니다.':'Busca relaciones hermosas y equilibradas. Disfruta de un amor romántico y elegante, valorando la armonía con su pareja. Tiende a evitar conflictos, por lo que necesita expresarse con sinceridad.',
    '균형과 조화가 필요한 분야에서 능력을 발휘합니다. 법률, 외교, 디자인, 패션, 상담, 중재 분야가 잘 맞습니다. 공정한 판단력과 미적 감각이 뛰어납니다.':'Desarrolla habilidades en áreas que requieren equilibrio y armonía. Son adecuadas profesiones como derecho, diplomacia, diseño, moda, asesoría y mediación. Posee un juicio justo y un sentido estético destacado.',
    '금 기운이 과잉되어 지나친 냉정함이나 갈등을 일으킬 수 있습니다. 날카로운 언행과 무리한 경쟁을 자제하세요. 금속 소품이나 흰색 계열을 과도하게 사용하면 긴장감이 높아질 수 있습니다.':'El exceso de energía metálica puede causar frialdad excesiva o conflictos. Controle el lenguaje cortante y la competencia desmedida. El uso excesivo de objetos metálicos o colores blancos puede aumentar la tensión.',
    '금속의 날카로운 기운이 결단력과 재물운을 강화합니다. 서쪽 방향, 흰색·금색 계열이 길하며 계획적인 재테크와 자기 계발이 운을 높입니다. 원칙을 지키는 행동이 신뢰를 쌓습니다.':'La energía afilada del metal fortalece la determinación y la suerte en las finanzas. La dirección oeste y los colores blanco y dorado son auspiciosos. La planificación financiera y el desarrollo personal aumentan la fortuna. Actuar con principios genera confianza.',
    '기운이 좋은 날입니다. 계획한 일들이 진행되고 주변의 도움을 받기 쉬운 시기입니다.':'Es un día con buena energía. Los planes avanzan y es fácil recibir ayuda del entorno.',
    '기질의 균형이 무난한 편입니다. 장점과 단점이 공존하며, 환경에 따라 성격 표현이 달라질 수 있습니다. 자신의 강점을 의식적으로 계발하면 더 큰 잠재력을 발휘할 수 있습니다.':'El equilibrio del temperamento es bastante estable. Convivencia de virtudes y defectos, y la expresión de la personalidad puede variar según el entorno. Desarrollar conscientemente las fortalezas permite desplegar un mayor potencial.',
    '기질적으로 다소 불균형한 면이 있어 감정 기복이나 결정 장애를 경험할 수 있습니다. 자기 이해를 높이고 약점을 보완하는 노력이 필요합니다. 내면의 안정을 찾는 것이 중요한 과제입니다.':'Existe un cierto desequilibrio en la naturaleza, por lo que puede experimentar altibajos emocionales o dificultades para tomar decisiones. Es necesario aumentar la comprensión de uno mismo y esforzarse por compensar las debilidades. Encontrar la estabilidad interior es una tarea importante.',
    '깊고 강렬한 사랑을 원합니다. 상대의 영혼까지 알고 싶어하며, 완전한 신뢰와 헌신을 요구합니다. 질투심이 강할 수 있으나, 그만큼 깊이 사랑합니다.':'Desea un amor profundo e intenso. Quiere conocer el alma de la otra persona y exige completa confianza y dedicación. Puede ser muy celoso, pero eso refleja la profundidad de su amor.',
    '꿈같은 로맨스를 꿈꿉니다. 상대를 이상화하는 경향이 있으며, 깊은 영혼의 교감을 원합니다. 감정적으로 민감하고 공감 능력이 뛰어나 상대의 마음을 잘 읽습니다.':'Sueña con un romance de ensueño. Tiende a idealizar a la pareja y busca una conexión profunda del alma. Es emocionalmente sensible y posee una gran empatía, por lo que puede leer bien el corazón del otro.',
    '나무 기운이 과잉되어 균형을 흐트러뜨립니다. 지나친 고집이나 무리한 확장을 조심하세요. 동쪽 방향과 초록색 계열을 과도하게 사용하면 에너지 소모가 커질 수 있으니 절제가 필요합니다.':'El exceso de energía de madera desequilibra la armonía. Tenga cuidado con la terquedad excesiva o expansiones forzadas. Usar en exceso la dirección este y tonos verdes puede consumir mucha energía, por lo que se requiere moderación.',
    '나무의 기운이 부족한 명식에 생기를 불어넣습니다. 성장·창의·도전의 에너지를 보충해 주므로 동쪽 방향, 초록색 계열, 봄철 활동이 길합니다. 새로운 시작이나 사업 확장에 유리한 시기를 잘 활용하세요.':'Aporta vitalidad a una carta natal con falta de energía de madera. Suple energía de crecimiento, creatividad y desafío, por lo que son favorables la dirección este, tonos verdes y actividades primaverales. Aproveche bien este período para nuevos comienzos o expansión de negocios.',
    '당신의 띠는':'Tu signo zodiacal es','띠 입니다':' (año zodiacal)',
    'elem.목':'Madera (木)','elem.화':'Fuego (火)','elem.토':'Tierra (土)','elem.금':'Metal (金)','elem.수':'Agua (水)',
    '대지의 안정된 기운이 중심을 잡아줍니다. 중앙·황토색 계열이 길하며 부동산·저축·건강 관리에 집중하면 운이 열립니다. 신뢰와 성실함으로 주변의 지지를 얻는 것이 중요합니다.':'La energía estable de la tierra sostiene el centro. Son favorables los tonos centrales y tierra amarilla, y enfocarse en bienes raíces, ahorros y cuidado de la salud abrirá la suerte. Es importante ganar el apoyo de quienes te rodean con confianza y sinceridad.',
    '대화와 지적 교감을 중시합니다. 다양한 사람에게 관심을 보이지만, 진정한 소울메이트를 찾습니다. 자유로운 관계를 선호하며 구속을 싫어합니다.':'Valora la comunicación y el intercambio intelectual. Muestra interés por diversas personas, pero busca un alma gemela verdadera. Prefiere relaciones libres y detesta las ataduras.',
    '독특하고 자유로운 사랑을 원합니다. 친구 같은 파트너를 선호하며, 지적 교감과 공통된 가치관을 중시합니다. 감정적 친밀감보다 정신적 연결을 더 중요하게 여깁니다.':'Desea un amor único y libre. Prefiere una pareja que sea como un amigo, valorando la conexión intelectual y los valores compartidos. Da más importancia a la conexión mental que a la intimidad emocional.',
    '독특한 인상':'Impresión única',
    '돌봄과 감성이 필요한 분야에서 탁월합니다. 의료, 사회복지, 교육, 요식업, 부동산, 상담 분야가 잘 맞습니다. 사람들의 감정을 이해하고 보살피는 능력이 뛰어납니다.':'Destaca en áreas que requieren cuidado y sensibilidad. Son adecuados los campos de medicina, trabajo social, educación, gastronomía, bienes raíces y asesoría. Posee una gran habilidad para entender y cuidar las emociones de las personas.',
    '로맨틱하고 극적인 사랑을 즐깁니다. 상대에게 최고의 것을 선사하고 싶어하며, 충성스럽고 열정적인 파트너입니다. 인정받지 못하면 상처를 받습니다.':'Disfruta de un amor romántico y dramático. Quiere ofrecer lo mejor a su pareja y es leal y apasionado. Se siente herido si no recibe reconocimiento.',
    '리더십과 추진력이 필요한 분야에서 두각을 나타냅니다. 스포츠, 군경, 기업가, 개척 사업, 응급 의료 분야가 잘 맞습니다. 독립적으로 일하거나 팀을 이끄는 역할이 적합합니다.':'Destaca en áreas que requieren liderazgo y capacidad de impulso. Son adecuados los deportes, fuerzas militares y policiales, emprendimiento, negocios pioneros y atención médica de emergencia. Es apto para trabajar de forma independiente o liderar equipos.',
    '말년운 (50세~)':'Suerte en la vejez (desde los 50 años)',
    '멤버십 상세 분석':'Análisis detallado de membresía',
    '명식 산출하기':'Calcular la carta natal',
    '명예와 사회적 지위가 높아지는 시기입니다. 조직 내 승진이나 인정을 받을 기회가 생기며, 책임감과 원칙을 중시하게 됩니다. 공직·전문직에서 두각을 나타낼 수 있습니다.':'Es un período en que aumentan el honor y el estatus social. Surgen oportunidades de ascenso o reconocimiento dentro de la organización, y se valoran la responsabilidad y los principios. Puede destacar en cargos públicos o profesiones especializadas.',
    '몸과 마음의 에너지가 매우 충만한 시기입니다. 체력이 넘치고 면역력도 강해 활발한 활동이 가능합니다. 이 시기에 건강한 습관을 정착시키면 오랫동안 좋은 컨디션을 유지할 수 있습니다.':'Es un período en que la energía del cuerpo y la mente está muy llena. La resistencia física es alta y el sistema inmunológico fuerte, permitiendo actividades vigorosas. Si se establecen hábitos saludables en este tiempo, se puede mantener un buen estado durante mucho tiempo.',
    '물고기자리는 해왕성과 목성이 지배하는 물의 별자리입니다. 예민한 감수성과 깊은 공감 능력, 영적 직관이 뛰어납니다. 예술적 재능과 상상력이 풍부하며, 타인의 고통에 민감하게 반응합니다. 현실과 이상 사이에서 혼란을 겪을 수 있으므로, 경계를 설정하고 자신을 보호하는 것이 중요합니다.':'Piscis es un signo de agua regido por Neptuno y Júpiter. Posee una sensibilidad delicada, gran empatía e intuición espiritual. Tiene talento artístico y una imaginación rica, y responde con sensibilidad al sufrimiento ajeno. Puede experimentar confusión entre la realidad y el ideal, por lo que es importante establecer límites y protegerse.',
    '물병자리는 천왕성과 토성이 지배하는 바람의 별자리입니다. 독창적이고 혁신적인 사고로 미래를 내다보는 능력이 있습니다. 인류애와 평등을 중시하며, 독립적이고 자유로운 정신을 가지고 있습니다. 감정적 거리감이 있을 수 있으므로, 친밀한 관계에서 따뜻함을 표현하는 연습이 도움이 됩니다.':'Acuario es un signo de aire regido por Urano y Saturno. Tiene un pensamiento original e innovador con capacidad para prever el futuro. Valora la humanidad y la igualdad, y posee un espíritu independiente y libre. Puede mostrar distancia emocional, por lo que practicar la expresión de calidez en relaciones íntimas es beneficioso.',
    '물의 지혜로운 기운이 지식과 재물의 흐름을 원활하게 합니다. 북쪽 방향, 검정·파란색 계열이 길하며 학업·연구·금융 분야에서 두각을 나타낼 수 있습니다. 유연한 사고로 기회를 포착하세요.':'La sabia energía del agua facilita el flujo del conocimiento y la riqueza. Son favorables la dirección norte y los tonos negro y azul, destacando en estudios, investigación y finanzas. Captura oportunidades con pensamiento flexible.',
    '변화와 혁신을 추구하는 시기입니다. 창의적 아이디어가 넘치고 기존 틀을 벗어나려는 욕구가 강해집니다. 직업 변화나 이직을 고려할 수 있으며, 언행에 주의가 필요합니다.':'Es un período que busca cambio e innovación. Fluye con ideas creativas y un fuerte deseo de romper con los moldes existentes. Puede considerar cambios de trabajo o carrera, y debe tener cuidado con sus palabras y acciones.',
    '부귀와 안락의 별, 재물과 명예':'Estrella de riqueza y confort, fortuna y honor',
    '분석과 정밀함이 필요한 분야에서 두각을 나타냅니다. 의료, 회계, 연구, 편집, 영양, 품질관리 분야가 잘 맞습니다. 세심한 주의력과 완벽을 추구하는 성향이 강점입니다.':'Destaca en áreas que requieren análisis y precisión. Son adecuados los campos de medicina, contabilidad, investigación, edición, nutrición y control de calidad. La atención meticulosa y la búsqueda de la perfección son sus fortalezas.',
    '불 기운이 과잉되어 충동적 행동이나 과열을 유발할 수 있습니다. 감정 기복과 급한 결정을 경계하세요. 빨간색 계열과 남쪽 방향을 과도하게 접하면 스트레스가 가중될 수 있습니다.':'El exceso de energía de fuego puede provocar acciones impulsivas o sobrecalentamiento. Precaución con los altibajos emocionales y decisiones apresuradas. El contacto excesivo con tonos rojos y la dirección sur puede aumentar el estrés.',
    '불의 기운으로 열정과 표현력을 강화합니다. 남쪽 방향, 빨간색 계열이 행운을 부르며 인간관계와 명예 운이 상승합니다. 적극적인 자기 표현과 사교 활동이 운을 여는 열쇠입니다.':'Fortalece la energía del fuego con pasión y expresividad. La dirección sur y los tonos rojos atraen la buena suerte, elevando la fortuna en relaciones humanas y honor. La expresión activa de uno mismo y las actividades sociales son la clave para abrir el camino de la suerte.',
    '사수자리는 목성이 지배하는 불의 별자리입니다. 자유를 사랑하고 철학적 사고와 모험 정신이 넘칩니다. 낙관적이고 유머 감각이 뛰어나며, 다양한 문화와 지식을 탐구하는 것을 즐깁니다. 무책임하거나 직설적인 말로 상처를 줄 수 있으므로, 세심한 배려가 필요합니다.':'Sagitario es un signo de fuego regido por Júpiter. Ama la libertad y está lleno de pensamiento filosófico y espíritu aventurero. Es optimista, con un gran sentido del humor, y disfruta explorando diversas culturas y conocimientos. Sin embargo, puede herir con palabras irresponsables o directas, por lo que se requiere una consideración cuidadosa.',
    '사자자리는 태양이 지배하는 불의 별자리입니다. 타고난 리더십과 카리스마로 자연스럽게 주목받습니다. 창의적이고 표현력이 풍부하며, 무대 위에서 빛나는 존재감을 발휘합니다. 자존심이 강하고 인정받고 싶은 욕구가 크므로, 겸손함을 갖추면 더욱 빛납니다.':'Leo es un signo de fuego regido por el Sol. Posee un liderazgo innato y carisma que atraen naturalmente la atención. Es creativo y expresivo, brillando con presencia en el escenario. Tiene un fuerte orgullo y un gran deseo de reconocimiento, por lo que la humildad lo hará brillar aún más.',
    '사회적 활동과 직업 운이 매우 강한 시기입니다. 능력을 인정받고 승진이나 중요한 기회가 찾아올 수 있습니다. 새로운 프로젝트나 도전에 적극적으로 나서면 좋은 결과를 얻을 수 있습니다.':'Es un período con una fuerte energía para actividades sociales y profesionales. Se reconoce tu capacidad y pueden llegar promociones u oportunidades importantes. Si te involucras activamente en nuevos proyectos o desafíos, obtendrás buenos resultados.',
    '성격과 기질이 안정적으로 발달해 있어 사회적 관계에서 신뢰를 쌓기 쉽습니다. 자신의 감정을 잘 조절하며, 목표를 향해 꾸준히 나아가는 힘이 있습니다. 다양한 상황에서 유연하게 대처하는 능력이 돋보입니다.':'Tu personalidad y temperamento se desarrollan de manera estable, facilitando la construcción de confianza en las relaciones sociales. Controlas bien tus emociones y tienes la fuerza para avanzar constantemente hacia tus metas. Destaca tu habilidad para adaptarte con flexibilidad en diversas situaciones.',
    '소통과 정보를 다루는 분야에서 빛납니다. 언론, 교육, IT, 마케팅, 작가, 통역 분야가 잘 맞습니다. 다양한 분야를 넘나드는 멀티태스킹 능력이 강점입니다.':'Brillas en áreas relacionadas con la comunicación y el manejo de información. Son adecuados campos como medios de comunicación, educación, TI, marketing, escritura e interpretación. Tu capacidad multitarea que cruza diferentes áreas es una fortaleza.',
    '수 기운이 과잉되어 우유부단함이나 과도한 걱정을 유발할 수 있습니다. 지나친 분석과 소극적 태도를 경계하세요. 검정·파란색 계열과 북쪽 방향을 과도하게 접하면 에너지가 침체될 수 있습니다.':'El exceso de energía de agua puede causar indecisión o preocupaciones excesivas. Cuidado con el análisis excesivo y una actitud pasiva. La exposición excesiva a tonos negros y azules y a la dirección norte puede causar estancamiento energético.',
    '신비롭고 예민한 기운이 강하게 작동할 수 있음':'Puede activarse una energía misteriosa y sensible con gran intensidad.',
    '심층 분석과 변화를 다루는 분야에서 탁월합니다. 심리학, 의학, 금융, 탐정, 연구, 위기관리 분야가 잘 맞습니다. 숨겨진 진실을 파헤치는 능력과 강한 집중력이 강점입니다.':'Destacas en campos que requieren análisis profundo y manejo de cambios. Son adecuados la psicología, medicina, finanzas, detective, investigación y gestión de crisis. Tu habilidad para descubrir verdades ocultas y tu fuerte concentración son puntos fuertes.',
    '쌍둥이자리는 수성이 지배하는 바람의 별자리입니다. 지적 호기심이 넘치고 다재다능하며, 소통과 정보 교환에 탁월합니다. 두 가지 상반된 성향이 공존하여 상황에 따라 다른 모습을 보이기도 합니다. 언어 능력과 적응력이 뛰어나 다양한 분야에서 활약할 수 있습니다.':'Géminis es un signo de aire regido por Mercurio. Posee una curiosidad intelectual desbordante, es versátil y sobresale en la comunicación e intercambio de información. Coexisten dos tendencias opuestas, mostrando diferentes facetas según la situación. Su habilidad lingüística y adaptabilidad le permiten destacar en diversos campos.',
    '안정적이고 실용적인 분야에서 능력을 발휘합니다. 금융, 부동산, 요리, 예술, 농업, 건축 분야가 잘 맞습니다. 장기적인 프로젝트를 꾸준히 완성하는 능력이 탁월합니다.':'Desarrollas tus habilidades en áreas estables y prácticas. Son adecuados campos como finanzas, bienes raíces, cocina, arte, agricultura y arquitectura. Tu capacidad para completar proyectos a largo plazo de manera constante es excepcional.',
    '안정적인 재물 축적과 내실을 다지는 시기입니다. 꾸준한 노력이 결실을 맺고 저축과 부동산 등 안정적 자산 관리에 유리합니다. 성실하게 임하면 좋은 결과를 얻습니다.':'Es un momento para acumular riqueza estable y fortalecer la base interna. El esfuerzo constante da frutos y es favorable para la gestión segura de activos como ahorros e inmuebles. Si actúas con diligencia, obtendrás buenos resultados.',
    '애정 운이 좋은 편으로, 관계에서 따뜻한 교류가 이루어집니다. 진심 어린 소통이 관계를 더욱 돈독하게 만들어 줍니다. 솔직한 감정 표현이 인연을 발전시키는 열쇠가 됩니다.':'La fortuna en el amor es favorable, y se producen intercambios cálidos en las relaciones. La comunicación sincera fortalece aún más los vínculos. La expresión honesta de los sentimientos es la clave para desarrollar la relación.',
    '애정 운이 평범한 편입니다. 특별한 변화보다는 현재 관계를 안정적으로 유지하는 것이 중요합니다. 상대방의 입장을 이해하려는 노력이 관계의 질을 높여줍니다.':'La fortuna en el amor es promedio. Es más importante mantener la estabilidad en la relación actual que buscar cambios especiales. El esfuerzo por comprender la posición del otro mejora la calidad de la relación.',
    '약간의 주의가 필요한 날입니다. 중요한 결정이나 큰 지출은 미루는 것이 좋습니다.':'Es un día que requiere un poco de precaución. Es mejor posponer decisiones importantes o gastos grandes.',
    '양자리는 황도 12궁의 첫 번째 별자리로, 화성이 지배하는 불의 별자리입니다. 개척 정신과 추진력이 강하며, 새로운 일을 시작하는 데 탁월한 능력을 발휘합니다. 경쟁심이 강하고 즉흥적인 면이 있어 충동적 결정에 주의가 필요합니다. 리더십이 뛰어나고 용기 있는 행동으로 주변을 이끄는 타입입니다.':'Aries es el primer signo del zodíaco, un signo de fuego regido por Marte. Tiene un fuerte espíritu pionero y empuje, destacando en comenzar cosas nuevas. Posee un fuerte sentido competitivo y un lado impulsivo, por lo que debe tener cuidado con decisiones impulsivas. Es un tipo de líder con gran valentía que guía a quienes lo rodean.',
    '에너지 소모가 클 수 있는 날입니다. 충동적인 행동을 자제하고 안정을 취하세요.':'Puede ser un día de alto consumo energético. Controla los impulsos y busca estabilidad.',
    '열정과 감정의 기운, 예술적 재능':'Energía de pasión y emociones, talento artístico.',
    '열정적이고 직접적으로 감정을 표현합니다. 첫눈에 반하는 경우가 많고, 상대를 적극적으로 리드합니다. 권태기가 오면 새로운 자극이 필요합니다.':'Expresa las emociones de manera apasionada y directa. Es común enamorarse a primera vista y liderar activamente a la pareja. Cuando llega el aburrimiento, se necesita un nuevo estímulo.',
    '염소자리는 토성이 지배하는 흙의 별자리입니다. 책임감이 강하고 목표를 향한 끈기와 실용적 판단력이 탁월합니다. 사회적 성공과 명예를 중시하며, 체계적이고 성실하게 기반을 쌓아갑니다. 감정 표현이 서툴고 지나치게 일에 집중하는 경향이 있어, 휴식과 감정 교류도 중요합니다.':'Capricornio es un signo de tierra regido por Saturno. Tiene una gran responsabilidad, perseverancia hacia las metas y juicio práctico excepcional. Valora el éxito social y el honor, construyendo bases de manera sistemática y diligente. Tiene dificultad para expresar emociones y tiende a concentrarse demasiado en el trabajo, por lo que el descanso y el intercambio emocional también son importantes.',
    '오행 불균형으로 인해 기질적 갈등이 심할 수 있습니다. 충동적 행동이나 극단적 감정 반응에 주의가 필요합니다. 명상, 규칙적인 생활, 신뢰할 수 있는 조언자의 도움을 받는 것이 도움이 됩니다.':'El desequilibrio de los cinco elementos puede causar conflictos temperamentales intensos. Se debe tener cuidado con comportamientos impulsivos o reacciones emocionales extremas. La meditación, una vida ordenada y el apoyo de un consejero confiable son de gran ayuda.',
    '완벽한 파트너를 찾기 위해 신중하게 관계를 시작합니다. 실용적이고 헌신적인 사랑을 하며, 세심한 배려로 상대를 돌봅니다. 지나친 비판은 관계를 어렵게 할 수 있습니다.':'Comienza las relaciones con cautela para encontrar la pareja perfecta. Ama de manera práctica y comprometida, cuidando al otro con atención detallada. La crítica excesiva puede dificultar la relación.',
    '용신을 보조하는 금 기운입니다. 정확하고 체계적인 행동이 운을 뒷받침합니다. 금속 소품이나 흰색 계열 인테리어가 이 기운을 강화하며, 계획적인 생활 패턴이 도움이 됩니다.':'Es la energía del metal que apoya al Yongshin (espíritu vital). Las acciones precisas y sistemáticas respaldan la fortuna. Los objetos metálicos o la decoración en tonos blancos fortalecen esta energía, y un patrón de vida planificado es beneficioso.',
    '용신을 보조하는 나무 기운입니다. 창의적 활동과 인간관계 확장이 간접적으로 운을 돕습니다. 식물 키우기, 등산, 새벽 산책 등 목(木) 기운을 접하는 생활 습관이 에너지를 보충해 줍니다.':'Es la energía de la madera que apoya al Yongshin. Las actividades creativas y la expansión de relaciones humanas ayudan indirectamente a la fortuna. Hábitos de vida que incluyen cuidar plantas, hacer senderismo o pasear al amanecer, que conectan con la energía de la madera, recargan tu energía.',
    '용신을 보조하는 불 기운입니다. 밝고 활기찬 환경이 운의 흐름을 원활하게 합니다. 조명이 밝은 공간에서 활동하거나 따뜻한 색상의 소품을 활용하면 보조 에너지가 강화됩니다.':'Es la energía del fuego que apoya al Yongshin. Un ambiente brillante y vibrante facilita el flujo de la fortuna. Actividades en espacios bien iluminados o el uso de objetos en colores cálidos fortalecen la energía de apoyo.',
    '용신을 보조하는 수 기운입니다. 지식 축적과 내면 성찰이 운을 간접적으로 강화합니다. 독서, 명상, 수영 등 수(水) 기운과 연관된 활동이 보조 에너지를 활성화합니다.':'Es la energía de agua que apoya al Yongshin. La acumulación de conocimiento y la introspección fortalecen la suerte de manera indirecta. Actividades relacionadas con la energía del agua, como la lectura, la meditación y la natación, activan la energía auxiliar.',
    '용신을 보조하는 토 기운입니다. 안정적인 생활 기반이 전체 운을 뒷받침합니다. 규칙적인 식사와 수면, 꾸준한 저축 습관이 이 기운을 활성화하여 운의 토대를 다집니다.':'Es la energía de tierra que apoya al Yongshin. Una base de vida estable sostiene la suerte en general. Comer y dormir regularmente, así como el hábito constante de ahorrar, activan esta energía y consolidan la base de la suerte.',
    '의료·치유 분야에 재능이 있으며 건강 회복력이 강합니다.':'Tiene talento en el campo médico y de sanación, y una fuerte capacidad de recuperación de la salud.',
    '의술과 건강의 별, 치료 능력':'La estrella de la medicina y la salud, capacidad de curación.',
    '이 대운은 천간의 기운이 일간에 영향을 미치는 시기입니다. 해당 십성의 특성을 이해하고 흐름에 맞게 대응하는 것이 중요합니다.':'Esta gran fortuna es un período en el que la energía del tronco celestial influye en el día maestro. Es importante entender las características de la estrella de diez y responder acorde al flujo.',
    '이성 매력, 예술적 감각':'Atracción hacia el sexo opuesto, sentido artístico.',
    '이성에게 매력적으로 보이며 예술·연예 분야에 재능이 있습니다.':'Se ve atractivo para el sexo opuesto y tiene talento en áreas artísticas y de entretenimiento.',
    '인연의 기운이 매우 강하게 흐르고 있습니다. 새로운 만남이나 기존 관계의 깊어짐이 기대되는 시기입니다. 감정 표현이 자연스럽게 이루어지며, 상대방의 마음을 얻기에 유리한 에너지가 충만합니다.':'La energía de las relaciones fluye con gran intensidad. Es un período esperado para nuevos encuentros o para profundizar relaciones existentes. La expresión emocional se realiza de manera natural, y la energía favorable está llena para conquistar el corazón del otro.',
    '인연의 흐름이 막혀 있는 시기입니다. 관계에서 상처를 받거나 이별의 아픔을 경험할 수 있습니다. 자신을 먼저 돌보고 내면의 상처를 치유하는 데 집중하는 것이 현명합니다.':'Es un período en el que el flujo de las relaciones está bloqueado. Se pueden experimentar heridas emocionales o el dolor de una separación. Es sabio cuidarse primero y concentrarse en sanar las heridas internas.',
    '일생 최고의 귀인을 만나는 기운으로 위기 시 강력한 도움을 받습니다.':'Es la energía para encontrar al benefactor más importante de la vida, recibiendo ayuda poderosa en tiempos de crisis.',
    '자립심과 독립 의지가 강해지는 시기입니다. 새로운 시작과 자기 계발에 유리하며, 경쟁 속에서 실력을 키울 수 있습니다. 다만 고집이 세질 수 있으니 협력을 잊지 마세요.':'Es un período en el que la autosuficiencia y la voluntad de independencia se fortalecen. Es favorable para nuevos comienzos y desarrollo personal, y se puede mejorar la habilidad en medio de la competencia. Sin embargo, no olvides la cooperación ya que puedes volverte terco.',
    '자유롭고 모험적인 사랑을 즐깁니다. 함께 성장하고 세상을 탐험할 파트너를 원합니다. 구속받는 것을 싫어하며, 정신적 교감을 매우 중시합니다.':'Disfruta de un amor libre y aventurero. Busca un compañero para crecer juntos y explorar el mundo. No le gusta sentirse atado y valora mucho la conexión espiritual.',
    '자유와 확장이 필요한 분야에서 성공합니다. 교육, 여행, 출판, 법률, 철학, 해외 비즈니스 분야가 잘 맞습니다. 넓은 시야와 낙관적 에너지로 새로운 기회를 만들어냅니다.':'Tiene éxito en áreas que requieren libertad y expansión. Educación, viajes, publicaciones, derecho, filosofía y negocios internacionales son compatibles. Crea nuevas oportunidades con una visión amplia y energía optimista.',
    '재물 손실이나 예상치 못한 지출이 발생할 수 있는 시기입니다. 충동적인 소비나 투기적 투자를 자제하고 보수적인 재정 관리가 필요합니다. 보증이나 대출에 특히 주의하세요.':'Es un período en el que pueden ocurrir pérdidas de dinero o gastos inesperados. Se recomienda evitar consumos impulsivos o inversiones especulativas y manejar las finanzas con prudencia. Presta especial atención a garantías o préstamos.',
    '재물 운이 매우 강하게 흐르고 있습니다. 예상치 못한 수입이나 투자 성과가 기대되는 시기입니다. 재물이 자연스럽게 모이는 흐름이므로 장기적인 재테크 계획을 세우기에 좋은 때입니다.':'La suerte en el dinero fluye con gran fuerza. Es un período en el que se esperan ingresos inesperados o buenos resultados en inversiones. La riqueza se acumula de manera natural, por lo que es un buen momento para planificar finanzas a largo plazo.',
    '재물 운이 매우 불안정한 시기입니다. 큰 재정적 손실이나 사기 피해의 위험이 있으므로 중요한 금전 거래는 반드시 전문가의 조언을 구하세요. 현금 보유를 늘리고 리스크를 최소화하는 것이 현명합니다.':'La suerte en el dinero es muy inestable. Existe riesgo de grandes pérdidas financieras o fraudes, por lo que en transacciones importantes es imprescindible buscar el consejo de un experto. Es sabio aumentar la tenencia de efectivo y minimizar riesgos.',
    '재물 운이 좋은 편입니다. 수입이 안정적으로 유지되며 절약과 투자의 균형을 잘 맞출 수 있습니다. 소소한 재물 기회들이 꾸준히 찾아오는 시기입니다.':'La suerte en el dinero es favorable. Los ingresos se mantienen estables y se puede equilibrar bien el ahorro y la inversión. Es un período en el que pequeñas oportunidades financieras llegan de manera constante.',
    '재물 운이 평범한 편입니다. 큰 이익보다는 현재 재정 상태를 안정적으로 유지하는 것이 중요합니다. 불필요한 지출을 줄이고 저축 습관을 기르는 것이 도움이 됩니다.':'La suerte en el dinero es promedio. Es más importante mantener la estabilidad financiera actual que buscar grandes ganancias. Reducir gastos innecesarios y fomentar el hábito del ahorro será de ayuda.',
    '재물복과 명예운이 좋아 안정된 삶을 누리는 기운입니다.':'Es una energía que disfruta de una vida estable con buena suerte en riqueza y honor.',
    '전갈자리는 명왕성과 화성이 지배하는 물의 별자리입니다. 강렬한 의지와 깊이 있는 통찰력을 가지고 있습니다. 비밀을 잘 지키고 심층적인 진실을 탐구하는 능력이 탁월합니다. 집착과 질투심이 강할 수 있으므로, 신뢰를 바탕으로 한 깊은 관계를 형성하는 것이 중요합니다.':'Escorpio es un signo de agua gobernado por Plutón y Marte. Posee una voluntad intensa y una profunda intuición. Tiene una habilidad sobresaliente para guardar secretos y explorar verdades profundas. Puede ser muy posesivo y celoso, por lo que es importante formar relaciones profundas basadas en la confianza.',
    '중년운 (35~50세)':'Suerte en la mediana edad (35~50 años).',
    '직관력과 영적 감수성이 뛰어나지만 신경과민·불안 경향에 주의가 필요합니다.':'Posee una intuición y sensibilidad espiritual sobresalientes, pero debe tener cuidado con la hipersensibilidad y la tendencia a la ansiedad.',
    '직업 운이 매우 불안정한 시기입니다. 직장 변동이나 실직의 위험이 있을 수 있으므로 중요한 결정을 미루고 안정을 최우선으로 삼으세요. 신뢰할 수 있는 사람의 조언을 구하는 것이 도움이 됩니다.':'Es un período de gran inestabilidad laboral. Puede haber cambios en el trabajo o riesgo de desempleo, por lo que se recomienda posponer decisiones importantes y priorizar la estabilidad. Buscar el consejo de personas confiables será de ayuda.',
    '직업 운이 순조롭게 흐르고 있습니다. 꾸준한 노력이 인정받는 시기로, 동료나 상사와의 관계도 원만합니다. 자신의 전문성을 더욱 갈고닦으면 더 큰 성과를 거둘 수 있습니다.':'La suerte laboral fluye favorablemente. Es un período en el que el esfuerzo constante es reconocido, y las relaciones con colegas y superiores son armoniosas. Perfeccionar la especialización personal puede traer mayores logros.',
    '직업 운이 평범한 편입니다. 큰 변화보다는 현재 위치에서 성실하게 임하는 것이 중요합니다. 새로운 기술이나 지식을 습득하여 경쟁력을 높이는 것이 도움이 됩니다.':'La suerte laboral es promedio. Es importante cumplir con diligencia en la posición actual más que buscar grandes cambios. Adquirir nuevas habilidades o conocimientos ayudará a aumentar la competitividad.',
    '직업적으로 어려움이 있을 수 있는 시기입니다. 직장 내 갈등이나 업무 부담이 증가할 수 있으므로 신중하게 행동하고 불필요한 마찰을 피하는 것이 좋습니다. 무리한 도전보다 현상 유지에 집중하세요.':'Es un período en el que pueden surgir dificultades profesionales. Puede aumentar el conflicto en el trabajo o la carga laboral, por lo que es recomendable actuar con prudencia y evitar fricciones innecesarias. Enfócate en mantener el statu quo en lugar de asumir desafíos excesivos.',
    '진지하고 책임감 있는 사랑을 합니다. 장기적인 관계와 안정을 추구하며, 파트너에게 든든한 지원자가 됩니다. 감정 표현이 서툴 수 있으나 깊이 헌신합니다.':'Ama de manera seria y responsable. Busca relaciones a largo plazo y estabilidad, convirtiéndose en un apoyo sólido para su pareja. Puede tener dificultades para expresar sus emociones, pero se entrega profundamente.',
    '창의력과 표현력이 풍부해지는 시기입니다. 재능을 발휘하고 새로운 것을 배우기에 좋으며, 음식·예술·교육 분야에서 기회가 생깁니다. 전반적으로 안정적이고 여유로운 대운입니다.':'Es un período en el que la creatividad y la capacidad de expresión florecen. Es un buen momento para mostrar talentos y aprender cosas nuevas, con oportunidades en áreas como la gastronomía, el arte y la educación. En general, es una etapa de gran estabilidad y tranquilidad.',
    '창의성과 리더십이 필요한 분야에서 성공합니다. 연예, 예술, 경영, 교육, 정치, 이벤트 기획 분야가 잘 맞습니다. 무대 위에서 빛나는 존재감과 카리스마가 강점입니다.':'Tiene éxito en campos que requieren creatividad y liderazgo. Se adapta bien a áreas como el entretenimiento, el arte, la gestión, la educación, la política y la organización de eventos. Su presencia y carisma brillan especialmente en el escenario.',
    '처녀자리는 수성이 지배하는 흙의 별자리입니다. 분석력과 세심함이 뛰어나며, 완벽을 추구하는 성실한 성향입니다. 실용적이고 논리적인 사고로 문제를 해결하는 능력이 탁월합니다. 지나친 완벽주의와 자기비판에 주의하고, 있는 그대로의 자신을 인정하는 연습이 필요합니다.':'Virgo es un signo de tierra regido por Mercurio. Destaca por su capacidad analítica y atención al detalle, con una naturaleza diligente que busca la perfección. Posee una habilidad sobresaliente para resolver problemas con pensamiento práctico y lógico. Debe tener cuidado con el perfeccionismo excesivo y la autocrítica, y practicar el reconocimiento de sí mismo tal como es.',
    '천천히 신중하게 마음을 열지만, 한번 사랑에 빠지면 매우 헌신적입니다. 안정적이고 감각적인 사랑을 추구하며, 물질적 표현으로 애정을 드러냅니다.':'Abre su corazón lentamente y con cautela, pero una vez enamorado es muy dedicado. Busca un amor estable y sensorial, expresando su afecto a través de manifestaciones materiales.',
    '천칭자리는 금성이 지배하는 바람의 별자리입니다. 균형과 조화를 추구하며, 아름다움과 예술적 감각이 뛰어납니다. 공정함을 중시하고 타인과의 관계에서 외교적 능력을 발휘합니다. 결정을 내리기 어려워하는 우유부단함이 있어, 자신의 내면 목소리를 믿는 연습이 중요합니다.':'Libra es un signo de aire regido por Venus. Busca el equilibrio y la armonía, destacando por su sentido estético y artístico. Valora la justicia y despliega habilidades diplomáticas en sus relaciones. Puede ser indeciso al tomar decisiones, por lo que es importante practicar la confianza en su voz interior.',
    '청년운 (15~35세)':'Suerte juvenil (15~35 años)',
    '체계와 성취가 필요한 분야에서 두각을 나타냅니다. 경영, 정치, 금융, 건축, 행정, 공학 분야가 잘 맞습니다. 장기적인 목표를 향해 꾸준히 나아가는 끈기가 강점입니다.':'Destaca en campos que requieren organización y logro. Se adapta bien a la gestión, política, finanzas, arquitectura, administración e ingeniería. Su perseverancia para avanzar hacia metas a largo plazo es una fortaleza.',
    '초년운 (0~15세)':'Suerte temprana (0~15 años)',
    '최고 귀인성, 위기 극복':'Máxima influencia benéfica, superación de crisis',
    '최고의 귀인, 큰 도움과 인복':'El mejor benefactor, gran ayuda y buena fortuna',
    '추진력과 결단력이 강하지만 충동적 행동과 대인 갈등에 주의하세요.':'Tiene gran impulso y determinación, pero debe tener cuidado con acciones impulsivas y conflictos interpersonales.',
    '타고난 기질이 매우 조화롭고 균형 잡혀 있습니다. 어떤 환경에서도 자신의 강점을 발휘하며, 주변 사람들에게 긍정적인 영향을 미치는 타고난 리더 기질을 지니고 있습니다. 직관력과 판단력이 뛰어나 중요한 순간에 탁월한 선택을 내립니다.':'Posee una naturaleza innata muy armoniosa y equilibrada. Despliega sus fortalezas en cualquier entorno y tiene un talento natural para influir positivamente en quienes lo rodean. Su intuición y juicio son excelentes, permitiéndole tomar decisiones destacadas en momentos cruciales.',
    '토 기운이 과잉되어 정체와 고집을 유발할 수 있습니다. 변화를 두려워하거나 지나치게 보수적인 태도가 기회를 놓치게 합니다. 황토색·중앙 배치를 줄이고 유연한 사고를 키우세요.':'El exceso de energía de tierra puede causar estancamiento y terquedad. El miedo al cambio o una actitud demasiado conservadora puede hacerle perder oportunidades. Reduzca la presencia del color ocre y la centralidad, y cultive un pensamiento más flexible.',
    '평온하게 흘러가는 날입니다. 무리한 새 시도보다 기존 일을 꼼꼼히 마무리하세요.':'Es un día que transcurre con tranquilidad. En lugar de intentar novedades arriesgadas, es mejor finalizar cuidadosamente los asuntos pendientes.',
    '하는 일마다 순탄하게 풀리는 날입니다. 새로운 시작이나 중요한 결정에 최적입니다.':'Es un día en el que todo fluye sin obstáculos. Es ideal para nuevos comienzos o decisiones importantes.',
    '하늘의 덕, 재난 소멸':'Virtud celestial, disipación de desastres',
    '하늘의 덕을 받아 재난과 액운이 자연스럽게 해소됩니다.':'Al recibir la virtud del cielo, los desastres y la mala suerte se disuelven naturalmente.',
    '하늘이 내린 귀인으로 어려운 상황에서 도움을 받는 강한 기운입니다.':'Es una energía poderosa que brinda ayuda en situaciones difíciles, como un benefactor enviado por el cielo.',
    '학문·연구·영성에 관심이 높아지는 시기입니다. 내면을 탐구하고 전문 지식을 쌓기에 좋으며, 예술·의료·종교 분야에서 재능이 발휘됩니다. 고독감이 들 수 있으니 소통을 늘리세요.':'Es un período en el que aumenta el interés por el estudio, la investigación y la espiritualidad. Es un buen momento para explorar el interior y acumular conocimientos especializados, con talentos que se manifiestan en el arte, la medicina y la religión. Puede sentirse solitario, por lo que se recomienda aumentar la comunicación.',
    '학문과 시험의 귀인, 문장 재능':'Benefactor en estudios y exámenes, talento literario',
    '학습과 성장, 귀인의 도움을 받는 시기입니다. 자격증 취득이나 학업에 유리하며, 어른이나 스승의 지원을 받을 수 있습니다. 차분하고 신중하게 임하면 좋은 결과를 얻습니다.':'Es un período de aprendizaje y crecimiento con la ayuda de benefactores. Es favorable para obtener certificaciones o avanzar en los estudios, y se puede contar con el apoyo de adultos o maestros. Si se actúa con calma y prudencia, se obtendrán buenos resultados.',
    '학업·시험 운이 강하고 글재주가 뛰어나 문서·계약에 유리합니다.':'La suerte en estudios y exámenes es fuerte, y el talento para la escritura favorece documentos y contratos.',
    '혁신과 미래를 다루는 분야에서 빛납니다. IT, 과학, 사회운동, 방송, 인도주의 분야가 잘 맞습니다. 독창적인 아이디어와 미래를 내다보는 통찰력이 강점입니다.':'Brilla en campos que tratan la innovación y el futuro. Se adapta bien a la tecnología de la información, la ciencia, los movimientos sociales, la radiodifusión y la labor humanitaria. Su fortaleza radica en ideas originales y una visión prospectiva.',
    '활동성과 추진력이 강해지는 시기입니다. 재물의 유동성이 크고 인간관계가 넓어집니다. 충동적인 투자나 보증은 피하고 신중한 재무 관리가 필요합니다.':'Es un período en el que la actividad y la capacidad de impulso se fortalecen. La liquidez de los bienes es alta y las relaciones humanas se amplían. Es necesario evitar inversiones impulsivas o garantías y manejar las finanzas con prudencia.',
    '활발한 재물 활동과 사교성이 높아지는 시기입니다. 사업 기회나 투자 수익이 생길 수 있으나 변동성도 큽니다. 이성 인연이 활발해지고 대인관계가 넓어집니다.':'Es un momento de intensa actividad financiera y aumento de la sociabilidad. Pueden surgir oportunidades de negocio o ganancias por inversiones, aunque la volatilidad también es alta. Las relaciones amorosas se activan y las conexiones sociales se expanden.',
    '신살 분석':'Estrellas especiales','대운 십성':'Estrella del ciclo','당신의 별자리는':'Tu signo zodiacal es','입니다':'',
    '원국':'Natal','사주 원국의 특수 기운 분석':'Análisis de energía especial natal',
    '길신':'Estrellas Auspiciosas','긍정적인 기운':'Energía positiva',
    '흉신':'Estrellas Inauspiciosas','주의가 필요한 기운':'Energía que requiere precaución',
    '중성 신살':'Estrellas Neutrales','상황에 따라 달라지는 기운':'Energía que varía según la situación',
    'sinsal.천을귀인':'Estrella Noble Celestial','sinsal.천덕귀인':'Estrella de Virtud Celestial','sinsal.월덕귀인':'Estrella de Virtud Mensual',
    'sinsal.태극귀인':'Estrella Noble Taiji','sinsal.문창귀인':'Estrella Literaria',
    'sinsal.천의성':'Estrella Médico Celestial','sinsal.금여성':'Estrella del Carruaje Dorado','sinsal.화개':'Estrella del Dosel',
    'sinsal.귀문관살':'Estrella Puerta Fantasma','sinsal.백호살':'Estrella Tigre Blanco',
    'sinsal.괴강살':'Estrella de Gran Autoridad','sinsal.양인살':'Estrella Hoja Yang',
    'sinsal.도화살':'Estrella Flor de Durazno','sinsal.홍염살':'Estrella del Encanto Rojo',
    '대운 (大運)':'Gran Ciclo de Fortuna','현재 나이':'Edad actual','순행':'Directo','역행':'Inverso',
    '현재 대운':'Ciclo Actual','지난 대운':'Ciclo Pasado','미래 대운':'Ciclo Futuro',
    '세':'','양년':'año yang','대운수':'ciclo','대운 십성':'Estrella del Ciclo',
    'day.0':'Dom','day.1':'Lun','day.2':'Mar','day.3':'Mié','day.4':'Jue','day.5':'Vie','day.6':'Sáb',
    '점':'pts','개':'',
    '운성.장생':'Nac.','운성.목욕':'Crec.','운성.관대':'Corona','운성.임관':'Ascenso','운성.제왕':'Cumbre',
    '운성.쇠':'Declive','운성.병':'Debil.','운성.사':'Extinc.','운성.묘':'Reposo','운성.절':'Vacío','운성.태':'Semilla','운성.양':'Nutr.',
    '비견':'Igual Riq.','겁재':'Rob. Riq.','식신':'Dios Com.','상관':'Func. Her.','편재':'Riq. Irreg.','정재':'Riq. Reg.','편관':'7 Muertes','정관':'Func. Reg.','편인':'Rec. Irreg.','정인':'Rec. Reg.',
    'grade.강':'Alto','grade.중':'Med','grade.약':'Bajo',
    '연애 스타일':'Estilo amoroso','직업 적성':'Aptitud profesional',
    '현재 행성 위치 · 지금 나에게 영향을 주는 에너지':'Planetas actuales · Energía que te influye ahora',
    '월의 덕, 관재 소멸':'Virtud mensual, problemas legales disipados','강한 기운, 사고·수술 주의':'Energía fuerte; cuidado con accidentes y cirugías',
    'sign.0':'Aries','sign.1':'Tauro','sign.2':'Géminis','sign.3':'Cáncer','sign.4':'Leo','sign.5':'Virgo','sign.6':'Libra','sign.7':'Escorpio','sign.8':'Sagitario','sign.9':'Capricornio','sign.10':'Acuario','sign.11':'Piscis',
    'moon.intro':'Emocionalmente,','moon.suffix':' actúa con fuerza, moldeando cómo buscas la estabilidad interior y tus patrones de respuesta inconscientes.',
    'asc.mid':' en tu Ascendente tiende a dar a las personas','asc.suffix':'como primera impresión.',
    '무료 해석':'Lectura Gratuita','핵심 3궁':'3 Palacios Principales','핵심 3요소':'3 Elementos Clave',
    '멤버십 전용':'Solo Miembros','나머지 9궁':'9 Palacios Restantes','상세 해석 제공':'Análisis Detallado Disponible',
    '현재 대운':'Ciclo Actual','지난 대운':'Ciclo Pasado','미래 대운':'Ciclo Futuro',
    '멤버십에서 상세 해석 확인':'Ver lectura completa en Membresía',
    '공궁':'Palacio Vacío',
    '멤버십 전용 · 자미두수 12궁 완전 해석':'Solo Miembros · Lectura completa Zi Wei 12 Palacios',
    '형제·자녀·질액·천이·교우·관록·전택·복덕·부모궁 + 사화 분석 + 대운·유년 연계 해석을 멤버십에서 확인하세요.':'Hermanos, Hijos, Salud, Viajes, Amigos, Carrera, Hogar, Fortuna y Padres + Cuatro Transformaciones + ciclos mayores — solo miembros.',
    '멤버십 전용 · 심층 점성술 해석':'Solo Miembros · Astrología en Profundidad',
    '멤버십 전용 · 심층 점성술 완전 해석':'Solo Miembros · Astrología Completa',
    '점성술 멤버십 배너 설명':'Carta Natal, Tránsitos, Retorno Solar, Astrología Psicológica, Carrera, Riqueza y Amor, Sinastría, Astrocartografía y más — disponible para miembros.',
    '각 신살의 연애·직업·건강 영역별 심층 분석, AI 종합 해석을 멤버십에서 확인하세요.':'Análisis profundo de cada estrella en amor, carrera y salud — interpretación IA para miembros.',
    '네이탈 차트 완전 해석':'Carta Natal Completa','심리 점성학':'Astrología Psicológica',
    '직업운 심층 해석':'Carrera en Profundidad','재물운 심층 해석':'Riqueza en Profundidad',
    '연애·결혼운 심층 해석':'Amor y Matrimonio en Profundidad','트랜짓 미래운':'Tránsitos Futuros',
    '솔라 리턴 (생일 1년 운세)':'Retorno Solar (Fortuna Anual)','프로그레션 (내면 성장)':'Progresiones (Crecimiento Interior)',
    '시나스트리 궁합':'Sinastría de Compatibilidad','컴포지트 관계 차트':'Carta Compuesta',
    '아스트로카토그래피':'Astrocartografía','건강 점성학':'Astrología Médica',
    '카르마·영혼 해석':'Lectura de Karma y Alma','역행 행성 해석':'Planetas Retrógrados',
    '12하우스 전체 해석':'Lectura de 12 Casas','행성 각도 심층 해석':'Aspectos Planetarios',
    '기본 성격과 인생의 핵심 구조':'Personalidad central y estructura de vida',
    '재물·수입·금전 흐름':'Riqueza, ingresos y flujo financiero',
    '배우자·연인과의 인연':'Cónyuge y relaciones románticas',
    '형제자매·동료와의 인연':'Hermanos y compañeros',
    '자녀운과 창조적 에너지':'Fortuna de hijos y energía creativa',
    '건강·체질·질병 경향':'Salud, constitución y tendencias de enfermedad',
    '이동·해외·외부 활동':'Viajes, extranjero y actividades externas',
    '친구·인맥·사회적 관계':'Amigos, redes y relaciones sociales',
    '직업·사회적 성취·명예':'Carrera, logros sociales y honor',
    '부동산·주거·가정환경':'Bienes raíces, vivienda y entorno familiar',
    '정신세계·복·내면의 행복':'Mundo interior, bendiciones y felicidad interna',
    '부모운·윗사람과의 관계':'Fortuna de padres y relaciones con superiores',
    '황소자리는 금성이 지배하는 흙의 별자리입니다. 안정과 물질적 풍요를 중시하며, 한번 결정한 것은 끝까지 밀고 나가는 끈기가 있습니다. 감각적인 즐거움과 아름다움을 사랑하며, 신뢰할 수 있는 든든한 파트너입니다. 변화에 저항하는 고집스러운 면이 있어 유연성을 기르는 것이 중요합니다.':'Tauro es un signo de tierra regido por Venus. Valora la estabilidad y la abundancia material, y posee la perseverancia para llevar hasta el final lo que decide. Ama los placeres sensoriales y la belleza, siendo un compañero confiable y sólido. Tiene un lado terco que resiste el cambio, por lo que es importante cultivar la flexibilidad.'
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
  return { name:SJS_NAMES[idx], emoji:SJS_EMOJI[idx], desc:getSjsDesc(idx) };
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
    type:    isStrong ? t('신강(身强)') : isWeak ? t('신약(身弱)') : t('중화(中和)'),
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
  const vals = triggers.map(b => b.textContent.trim());

  // 4자리 연도 위치 기준으로 순서대로 파싱 (regex else-if 오매칭 방지)
  const yearIdx = vals.findIndex(v => /^\d{4}$/.test(v) && +v>=1900 && +v<=2100);
  if (yearIdx === -1) return null;

  const year  = +vals[yearIdx];
  const month = +vals[yearIdx + 1];
  const day   = +vals[yearIdx + 2];
  if (!month||month<1||month>12) return null;
  if (!day||day<1||day>31) return null;

  const sw = document.querySelector('button[role="switch"]');
  const unknownTime = !!(sw && sw.getAttribute('data-state')==='checked');

  let hour=12, minute=0;
  if (!unknownTime) {
    const hBtn = triggers[yearIdx + 3];
    const mBtn = triggers[yearIdx + 4];
    if (hBtn) { const v=+hBtn.textContent.trim(); if(v>=0&&v<=23) hour=v; }
    if (mBtn) { const v=+mBtn.textContent.trim(); if(v>=0&&v<=59) minute=v; }
  }

  let gender='M';
  const radioItems = [...document.querySelectorAll('button[role="radio"]')];
  for (const btn of radioItems) {
    if (btn.getAttribute('data-state')==='on') {
      const txt = btn.textContent.trim();
      if (txt==='여'||txt.includes('여성')||txt==='女') gender='F';
      break;
    }
  }
  if (document.querySelector('input[type="radio"][value="F"]:checked')) gender='F';

  return { year, month, day, hour, minute, gender, unknownTime };
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
  return `<span style="background:${c}18;color:${c};font-size:15px;font-weight:700;padding:3px 10px;border-radius:20px;border:1px solid ${c}50;box-shadow:0 0 8px ${c}30">${Math.round(pct)}${t('점')}</span>`;
}

function sectionHeader(letter, title, subtitle) {
  return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid rgba(212,175,55,0.15)">
    <span style="background:linear-gradient(135deg,rgba(212,175,55,0.2),rgba(124,106,247,0.2));color:#d4af37;font-size:14px;font-weight:800;padding:3px 9px;border-radius:8px;border:1px solid rgba(212,175,55,0.4);box-shadow:0 0 12px rgba(212,175,55,0.15);letter-spacing:0.05em">${letter}</span>
    <span style="${D.hdr}">${title}</span>
    <span style="${D.sub};font-size:15px">${subtitle}</span>
  </div>`;
}

// ─── A. 기본 운세 해석 텍스트 ──────────────────────────────────

function getFORTUNE_DETAIL() { return {
  성향: [
    { min:85, text:t('타고난 기질이 매우 조화롭고 균형 잡혀 있습니다. 어떤 환경에서도 자신의 강점을 발휘하며, 주변 사람들에게 긍정적인 영향을 미치는 타고난 리더 기질을 지니고 있습니다. 직관력과 판단력이 뛰어나 중요한 순간에 탁월한 선택을 내립니다.') },
    { min:70, text:t('성격과 기질이 안정적으로 발달해 있어 사회적 관계에서 신뢰를 쌓기 쉽습니다. 자신의 감정을 잘 조절하며, 목표를 향해 꾸준히 나아가는 힘이 있습니다. 다양한 상황에서 유연하게 대처하는 능력이 돋보입니다.') },
    { min:48, text:t('기질의 균형이 무난한 편입니다. 장점과 단점이 공존하며, 환경에 따라 성격 표현이 달라질 수 있습니다. 자신의 강점을 의식적으로 계발하면 더 큰 잠재력을 발휘할 수 있습니다.') },
    { min:30, text:t('기질적으로 다소 불균형한 면이 있어 감정 기복이나 결정 장애를 경험할 수 있습니다. 자기 이해를 높이고 약점을 보완하는 노력이 필요합니다. 내면의 안정을 찾는 것이 중요한 과제입니다.') },
    { min: 0, text:t('오행 불균형으로 인해 기질적 갈등이 심할 수 있습니다. 충동적 행동이나 극단적 감정 반응에 주의가 필요합니다. 명상, 규칙적인 생활, 신뢰할 수 있는 조언자의 도움을 받는 것이 도움이 됩니다.') },
  ],
  애정운: [
    { min:85, text:t('인연의 기운이 매우 강하게 흐르고 있습니다. 새로운 만남이나 기존 관계의 깊어짐이 기대되는 시기입니다. 감정 표현이 자연스럽게 이루어지며, 상대방의 마음을 얻기에 유리한 에너지가 충만합니다.') },
    { min:70, text:t('애정 운이 좋은 편으로, 관계에서 따뜻한 교류가 이루어집니다. 진심 어린 소통이 관계를 더욱 돈독하게 만들어 줍니다. 솔직한 감정 표현이 인연을 발전시키는 열쇠가 됩니다.') },
    { min:48, text:t('애정 운이 평범한 편입니다. 특별한 변화보다는 현재 관계를 안정적으로 유지하는 것이 중요합니다. 상대방의 입장을 이해하려는 노력이 관계의 질을 높여줍니다.') },
    { min:30, text:t('감정적 교류에서 어려움이 있을 수 있습니다. 오해나 갈등이 생기기 쉬운 시기이므로 충동적인 감정 표현을 자제하고 신중하게 행동하는 것이 좋습니다. 혼자만의 시간을 통해 감정을 정리하세요.') },
    { min: 0, text:t('인연의 흐름이 막혀 있는 시기입니다. 관계에서 상처를 받거나 이별의 아픔을 경험할 수 있습니다. 자신을 먼저 돌보고 내면의 상처를 치유하는 데 집중하는 것이 현명합니다.') },
  ],
  직업운: [
    { min:85, text:t('사회적 활동과 직업 운이 매우 강한 시기입니다. 능력을 인정받고 승진이나 중요한 기회가 찾아올 수 있습니다. 새로운 프로젝트나 도전에 적극적으로 나서면 좋은 결과를 얻을 수 있습니다.') },
    { min:70, text:t('직업 운이 순조롭게 흐르고 있습니다. 꾸준한 노력이 인정받는 시기로, 동료나 상사와의 관계도 원만합니다. 자신의 전문성을 더욱 갈고닦으면 더 큰 성과를 거둘 수 있습니다.') },
    { min:48, text:t('직업 운이 평범한 편입니다. 큰 변화보다는 현재 위치에서 성실하게 임하는 것이 중요합니다. 새로운 기술이나 지식을 습득하여 경쟁력을 높이는 것이 도움이 됩니다.') },
    { min:30, text:t('직업적으로 어려움이 있을 수 있는 시기입니다. 직장 내 갈등이나 업무 부담이 증가할 수 있으므로 신중하게 행동하고 불필요한 마찰을 피하는 것이 좋습니다. 무리한 도전보다 현상 유지에 집중하세요.') },
    { min: 0, text:t('직업 운이 매우 불안정한 시기입니다. 직장 변동이나 실직의 위험이 있을 수 있으므로 중요한 결정을 미루고 안정을 최우선으로 삼으세요. 신뢰할 수 있는 사람의 조언을 구하는 것이 도움이 됩니다.') },
  ],
  재물운: [
    { min:85, text:t('재물 운이 매우 강하게 흐르고 있습니다. 예상치 못한 수입이나 투자 성과가 기대되는 시기입니다. 재물이 자연스럽게 모이는 흐름이므로 장기적인 재테크 계획을 세우기에 좋은 때입니다.') },
    { min:70, text:t('재물 운이 좋은 편입니다. 수입이 안정적으로 유지되며 절약과 투자의 균형을 잘 맞출 수 있습니다. 소소한 재물 기회들이 꾸준히 찾아오는 시기입니다.') },
    { min:48, text:t('재물 운이 평범한 편입니다. 큰 이익보다는 현재 재정 상태를 안정적으로 유지하는 것이 중요합니다. 불필요한 지출을 줄이고 저축 습관을 기르는 것이 도움이 됩니다.') },
    { min:30, text:t('재물 손실이나 예상치 못한 지출이 발생할 수 있는 시기입니다. 충동적인 소비나 투기적 투자를 자제하고 보수적인 재정 관리가 필요합니다. 보증이나 대출에 특히 주의하세요.') },
    { min: 0, text:t('재물 운이 매우 불안정한 시기입니다. 큰 재정적 손실이나 사기 피해의 위험이 있으므로 중요한 금전 거래는 반드시 전문가의 조언을 구하세요. 현금 보유를 늘리고 리스크를 최소화하는 것이 현명합니다.') },
  ],
  건강운: [
    { min:85, text:t('몸과 마음의 에너지가 매우 충만한 시기입니다. 체력이 넘치고 면역력도 강해 활발한 활동이 가능합니다. 이 시기에 건강한 습관을 정착시키면 오랫동안 좋은 컨디션을 유지할 수 있습니다.') },
    { min:70, text:t('건강 상태가 전반적으로 양호합니다. 규칙적인 생활과 적당한 운동으로 현재의 좋은 컨디션을 유지하세요. 스트레스 관리에 신경 쓰면 더욱 활기찬 생활이 가능합니다.') },
    { min:48, text:t('건강 운이 평범한 편입니다. 특별한 이상은 없지만 과로나 스트레스에 취약할 수 있습니다. 충분한 수면과 균형 잡힌 식사로 기초 체력을 유지하는 것이 중요합니다.') },
    { min:30, text:t('건강에 주의가 필요한 시기입니다. 피로 누적이나 소화기 계통의 문제가 생길 수 있습니다. 무리한 활동을 자제하고 정기적인 건강 검진을 받는 것이 좋습니다. 충분한 휴식이 필수입니다.') },
    { min: 0, text:t('건강 운이 매우 좋지 않은 시기입니다. 만성 질환이 악화되거나 새로운 건강 문제가 발생할 수 있습니다. 즉시 전문의 상담을 받고, 과로와 스트레스를 철저히 피하세요. 몸의 신호에 귀를 기울이는 것이 중요합니다.') },
  ],
}; }

function getFortuneDetail(key, pct) {
  const list = getFORTUNE_DETAIL()[key];
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
      <div style="margin-top:8px;display:inline-flex;align-items:center;gap:4px;background:${glowColor}15;color:${glowColor};font-size:12px;font-weight:700;padding:3px 10px;border-radius:10px;border:1px solid ${glowColor}30">${lv.emoji} ${t(lv.label)}</div>
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
          <div style="background:linear-gradient(135deg,#e8d5a3,#c9a84c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:800;font-size:24px;font-family:'Cormorant Garamond',serif">${t('animal.'+b)}${t('띠 입니다')}.</div>
          <div style="color:#7a6f8a;font-size:13px;margin-top:4px">${z.years}년생 · ${dayMaster}일간</div>
          <div style="color:#c0c8e0;font-size:15px;margin-top:8px;line-height:1.7">${t('trait.'+b)}</div>
        </div>
      </div>
    </div>` : '';

  // ── 사주원국 미니 차트 (일주만 선명, 나머지 블러) ──
  const ELEM_COLOR = {'목':'#22c55e','화':'#ef4444','토':'#d97706','금':'#94a3b8','수':'#60a5fa'};
  const pillarLabels = [t('시주'), t('일주'), t('월주'), t('연주')];
  // pillars 순서: 0=시주 1=월주 2=일주 3=년주 → 표시 순서: 시,일,월,년
  const displayOrder = [0, 2, 1, 3];
  const pillarCols = displayOrder.map((idx, colIdx) => {
    const p     = saju.pillars[idx];
    const pl    = p?.pillar || {};
    const stem  = pl.stem  || '';
    const branch= pl.branch|| '';
    const sElem = STEM_ELEM[stem]  || '토';
    const bElem = BRANCH_ELEM[branch]|| '토';
    const sCol  = ELEM_COLOR[sElem] || '#94a3b8';
    const bCol  = ELEM_COLOR[bElem] || '#94a3b8';
    const sipTop = p?.stemSipsin  || '';
    const sipBot = p?.branchSipsin|| '';
    const isDay  = (idx === 2);
    const blur   = isDay ? '' : 'filter:blur(5px);user-select:none;';

    return `
      <div style="text-align:center;flex:1;min-width:0">
        <div style="font-size:11px;color:#6a7a9a;letter-spacing:0.06em;margin-bottom:6px">${pillarLabels[colIdx]}</div>
        <div style="${blur}">
          <div style="font-size:11px;color:#8a9ab8;margin-bottom:4px">${t(sipTop)||sipTop}</div>
          <div style="width:44px;height:44px;border-radius:10px;background:${sCol}22;border:1.5px solid ${sCol}66;display:flex;align-items:center;justify-content:center;margin:0 auto 4px;font-size:26px;font-weight:700;color:${sCol};font-family:'Noto Serif KR','Cormorant Garamond',serif;box-shadow:0 0 10px ${sCol}30">${stem}</div>
          <div style="width:44px;height:44px;border-radius:10px;background:${bCol}22;border:1.5px solid ${bCol}66;display:flex;align-items:center;justify-content:center;margin:0 auto 4px;font-size:26px;font-weight:700;color:${bCol};font-family:'Noto Serif KR','Cormorant Garamond',serif;box-shadow:0 0 10px ${bCol}30">${branch}</div>
          <div style="font-size:11px;color:#8a9ab8;margin-top:4px">${t(sipBot)||sipBot}</div>
        </div>
        ${isDay ? `<div style="width:4px;height:4px;border-radius:50%;background:#d4af37;margin:6px auto 0;box-shadow:0 0 6px #d4af3780"></div>` : ''}
      </div>`;
  }).join('');

  const miniChart = `
    <div style="background:rgba(13,16,32,0.6);border:1px solid rgba(212,175,55,0.15);border-radius:12px;padding:14px 10px 10px;margin-bottom:14px;position:relative;overflow:hidden">
      <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.4),transparent)"></div>
      <div style="font-size:10px;color:#5a6478;letter-spacing:0.1em;text-align:center;margin-bottom:10px">四柱八字</div>
      <div style="display:flex;gap:8px;justify-content:center">${pillarCols}</div>
      <div style="font-size:11px;color:#4a5268;text-align:center;margin-top:10px">${new URLSearchParams(location.search).get('admin')==='1' ? '' : '🔒 일주 공개 · 나머지는 멤버십에서 확인'}</div>
    </div>`;

  return `<div style="${D.wrap}">
    ${sectionHeader('A', t('기본 운세'), t('사주 원국 기반'))}
    ${miniChart}
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
    const y=d.getFullYear(), m=d.getMonth()+1, dy=d.getDate(), dow=t('day.'+d.getDay());
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
            <span style="color:${scoreColor(todayPct)};font-weight:800;font-size:26px;font-family:'Cormorant Garamond',serif">${Math.round(todayPct)}${t('점')}</span>
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
    <div style="${D.muted};margin-top:8px;text-align:center">${t('⭐대길 ✨길 🌀평 ⚡소흉 ⚠️흉 · ● 행운의 색').replace(t('● 행운의 색'),t('■ 행운의 색'))}</div>
  </div>`;
}

// ─── C. 용신 분석 ─────────────────────────────────────────────

function renderYongShin(saju) {
  const ys = computeYongShin(saju);
  const ELEM_KO  = {'목':'木 목','화':'火 화','토':'土 토','금':'金 금','수':'水 수'};
  const ELEM_CLR = {'목':'#34d399','화':'#f87171','토':'#fbbf24','금':'#94a3b8','수':'#60a5fa'};
  const getElemName = e => t('elem.'+e) || ELEM_KO[e];
  const total = ys.total || 8;

  const elemBars = Object.entries(ys.elems).map(([e, cnt]) => {
    const pct = Math.round((cnt/total)*100);
    return `<div style="margin-bottom:6px">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px">
        <span style="color:${ELEM_CLR[e]};font-size:18px;font-weight:600">${getElemName(e)}</span>
        <span style="${D.sub}">${cnt}${t('개')} · ${pct}%</span>
      </div>
      ${dGauge(pct, ELEM_CLR[e])}
    </div>`;
  }).join('');

  const YONG_DESC = {
    '용신': {
      '목': t('나무의 기운이 부족한 명식에 생기를 불어넣습니다. 성장·창의·도전의 에너지를 보충해 주므로 동쪽 방향, 초록색 계열, 봄철 활동이 길합니다. 새로운 시작이나 사업 확장에 유리한 시기를 잘 활용하세요.'),
      '화': t('불의 기운으로 열정과 표현력을 강화합니다. 남쪽 방향, 빨간색 계열이 행운을 부르며 인간관계와 명예 운이 상승합니다. 적극적인 자기 표현과 사교 활동이 운을 여는 열쇠입니다.'),
      '토': t('대지의 안정된 기운이 중심을 잡아줍니다. 중앙·황토색 계열이 길하며 부동산·저축·건강 관리에 집중하면 운이 열립니다. 신뢰와 성실함으로 주변의 지지를 얻는 것이 중요합니다.'),
      '금': t('금속의 날카로운 기운이 결단력과 재물운을 강화합니다. 서쪽 방향, 흰색·금색 계열이 길하며 계획적인 재테크와 자기 계발이 운을 높입니다. 원칙을 지키는 행동이 신뢰를 쌓습니다.'),
      '수': t('물의 지혜로운 기운이 지식과 재물의 흐름을 원활하게 합니다. 북쪽 방향, 검정·파란색 계열이 길하며 학업·연구·금융 분야에서 두각을 나타낼 수 있습니다. 유연한 사고로 기회를 포착하세요.'),
    },
    '희신': {
      '목': t('용신을 보조하는 나무 기운입니다. 창의적 활동과 인간관계 확장이 간접적으로 운을 돕습니다. 식물 키우기, 등산, 새벽 산책 등 목(木) 기운을 접하는 생활 습관이 에너지를 보충해 줍니다.'),
      '화': t('용신을 보조하는 불 기운입니다. 밝고 활기찬 환경이 운의 흐름을 원활하게 합니다. 조명이 밝은 공간에서 활동하거나 따뜻한 색상의 소품을 활용하면 보조 에너지가 강화됩니다.'),
      '토': t('용신을 보조하는 토 기운입니다. 안정적인 생활 기반이 전체 운을 뒷받침합니다. 규칙적인 식사와 수면, 꾸준한 저축 습관이 이 기운을 활성화하여 운의 토대를 다집니다.'),
      '금': t('용신을 보조하는 금 기운입니다. 정확하고 체계적인 행동이 운을 뒷받침합니다. 금속 소품이나 흰색 계열 인테리어가 이 기운을 강화하며, 계획적인 생활 패턴이 도움이 됩니다.'),
      '수': t('용신을 보조하는 수 기운입니다. 지식 축적과 내면 성찰이 운을 간접적으로 강화합니다. 독서, 명상, 수영 등 수(水) 기운과 연관된 활동이 보조 에너지를 활성화합니다.'),
    },
    '기신': {
      '목': t('나무 기운이 과잉되어 균형을 흐트러뜨립니다. 지나친 고집이나 무리한 확장을 조심하세요. 동쪽 방향과 초록색 계열을 과도하게 사용하면 에너지 소모가 커질 수 있으니 절제가 필요합니다.'),
      '화': t('불 기운이 과잉되어 충동적 행동이나 과열을 유발할 수 있습니다. 감정 기복과 급한 결정을 경계하세요. 빨간색 계열과 남쪽 방향을 과도하게 접하면 스트레스가 가중될 수 있습니다.'),
      '토': t('토 기운이 과잉되어 정체와 고집을 유발할 수 있습니다. 변화를 두려워하거나 지나치게 보수적인 태도가 기회를 놓치게 합니다. 황토색·중앙 배치를 줄이고 유연한 사고를 키우세요.'),
      '금': t('금 기운이 과잉되어 지나친 냉정함이나 갈등을 일으킬 수 있습니다. 날카로운 언행과 무리한 경쟁을 자제하세요. 금속 소품이나 흰색 계열을 과도하게 사용하면 긴장감이 높아질 수 있습니다.'),
      '수': t('수 기운이 과잉되어 우유부단함이나 과도한 걱정을 유발할 수 있습니다. 지나친 분석과 소극적 태도를 경계하세요. 검정·파란색 계열과 북쪽 방향을 과도하게 접하면 에너지가 침체될 수 있습니다.'),
    },
  };

  function yongCard(role, elem, desc) {
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
        <span style="color:${c};font-size:20px;font-weight:700;font-family:'Cormorant Garamond',serif">${elem ? getElemName(elem) : '-'}</span>
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
      ${yongCard('용신', ys.yong, '')}
      ${yongCard('희신', ys.hee,  '')}
      ${yongCard('기신', ys.gi,   '')}
    </div>
  </div>`;
}

// ─── D. 12운성 ────────────────────────────────────────────────

function renderSijunseong(saju) {
  const dayMaster = saju.pillars[2]?.pillar?.stem;
  if (!dayMaster) return '';
  const PILLAR_NAMES = [t('년주'),t('월주'),t('일주'),t('시주')];
  const PILLAR_AGE   = [t('초년운 (0~15세)'),t('청년운 (15~35세)'),t('중년운 (35~50세)'),t('말년운 (50세~)')];
  const PILLAR_COLORS = ['#a78bfa','#f472b6','#f87171','#60a5fa'];
  // 12운성 한자 대응표
  const SJS_HANJA = {
    '장생':'長生','목욕':'沐浴','관대':'冠帶','임관':'臨官','제왕':'帝旺',
    '쇠':'衰','병':'病','사':'死','묘':'墓','절':'絶','태':'胎','양':'養'
  };
  // 12운성 강도 배지 (약/중/강)
  const SJS_GRADE = {
    '장생':'강','목욕':'중','관대':'강','임관':'강','제왕':'강',
    '쇠':'약','병':'약','사':'약','묘':'약','절':'약','태':'중','양':'중'
  };
  const GRADE_STYLE = {
    '강':'background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff',
    '중':'background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff',
    '약':'background:linear-gradient(135deg,#6b7280,#4b5563);color:#fff'
  };
  // 이모지 배경 색상 (카드별)
  const EMOJI_BG = ['#7c3aed','#db2777','#dc2626','#2563eb'];

  const cards = saju.pillars.map((p, i) => {
    const sjs = getSijunseong(dayMaster, p.pillar.branch);
    if (!sjs) return '';
    const sjsIdx = SJS_NAMES.indexOf(sjs.name);
    const pc = PILLAR_COLORS[i];
    const bg = EMOJI_BG[i];
    const hanja = SJS_HANJA[sjs.name] || sjs.name;
    const grade = SJS_GRADE[sjs.name] || '중';
    const gradeStyle = GRADE_STYLE[grade];
    return `<div style="position:relative;background:linear-gradient(160deg,#13162a,#0e1020);border:1px solid ${pc}30;border-radius:16px;padding:20px 14px 18px;text-align:center;overflow:hidden;transition:transform 0.2s;">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,${pc}80,transparent)"></div>
      <div style="position:absolute;top:10px;right:10px;${gradeStyle};font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;letter-spacing:0.05em">${t('grade.'+grade)}</div>
      <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,${bg}cc,${bg}66);margin:0 auto 14px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px ${bg}50,inset 0 1px 0 rgba(255,255,255,0.15);border:2px solid ${pc}40">
        <span style="font-size:40px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.5))">${sjs.emoji}</span>
      </div>
      <div style="font-weight:800;font-size:26px;color:#f0e6d0;font-family:'Cormorant Garamond',serif;margin-bottom:2px;letter-spacing:0.02em">${t('운성.'+sjs.name)}</div>
      <div style="color:#8a7fa8;font-size:13px;margin-bottom:12px;letter-spacing:0.05em">(${hanja})</div>
      <div style="border-top:1px solid ${pc}20;padding-top:12px;margin-bottom:6px">
        <div style="font-weight:700;font-size:14px;color:${pc};margin-bottom:2px">${PILLAR_NAMES[i]}</div>
        <div style="font-size:11px;color:#6b7280;margin-bottom:8px">${PILLAR_AGE[i]}</div>
        <div style="font-size:12px;color:#9da8c0;line-height:1.6">${sjs.desc || t('sjs.'+sjsIdx)}</div>
      </div>
    </div>`;
  }).join('');

  return `<div style="${D.wrap}">
    ${sectionHeader('D', t('12운성'), t('생애 에너지 흐름'))}
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
      ${cards}
    </div>
  </div>`;
}

// ─── D2. 대운 분석 ──────────────────────────────────────────────

function renderDaewoon(saju) {
  const daewoon = saju.daewoon;
  if (!daewoon || daewoon.length === 0) return '';

  const today = new Date();
  const birthYear = saju.input.year;
  const currentAge = today.getFullYear() - birthYear;
  const gender = saju.input.gender;
  const genderLabel = gender === 'F' ? '여' : '남';

  // 순행/역행 판단 (양남음녀 순행, 음남양녀 순행)
  const dayStem = saju.pillars[2]?.pillar?.stem || '';
  const YANG_STEMS = new Set(['甲','丙','戊','庚','壬']);
  const isYang = YANG_STEMS.has(dayStem);
  const isMale = gender !== 'F';
  const isForward = (isYang && isMale) || (!isYang && !isMale);
  const flowLabel = isForward ? t('순행') : t('역행');

  // 현재 대운 찾기
  let currentIdx = -1;
  for (let i = 0; i < daewoon.length; i++) {
    const startAge = daewoon[i].age;
    const endAge = (i + 1 < daewoon.length) ? daewoon[i + 1].age : 999;
    if (currentAge >= startAge && currentAge < endAge) {
      currentIdx = i;
      break;
    }
  }
  if (currentIdx < 0) currentIdx = 0;

  const cur = daewoon[currentIdx];
  const curStartAge = cur.age;
  const curEndAge = (currentIdx + 1 < daewoon.length) ? daewoon[currentIdx + 1].age - 1 : curStartAge + 9;

  // 십성 한글 변환
  const SIPSIN_KR = {
    '比肩':'비견','劫財':'겁재','食神':'식신','傷官':'상관',
    '偏財':'편재','正財':'정재','偏官':'편관','正官':'정관',
    '偏印':'편인','正印':'정인'
  };

  // 12운성 한자
  const SJS_HANJA2 = {
    '장생':'長生','목욕':'沐浴','관대':'冠帶','임관':'臨官','제왕':'帝旺',
    '쇠':'衰','병':'病','사':'死','묘':'墓','절':'絶','태':'胎','양':'養'
  };

  // 12운성 색상
  const SJS_COLOR = {
    '장생':'#22c55e','목욕':'#60a5fa','관대':'#22c55e','임관':'#22c55e','제왕':'#f59e0b',
    '쇠':'#9ca3af','병':'#9ca3af','사':'#9ca3af','묘':'#9ca3af','절':'#9ca3af','태':'#a78bfa','양':'#a78bfa'
  };

  const stemSipsin = SIPSIN_KR[cur.stemSipsin] || cur.stemSipsin || '';
  const branchSipsin = SIPSIN_KR[cur.branchSipsin] || cur.branchSipsin || '';
  const unseong = cur.unseong || '';
  const unseongHanja = SJS_HANJA2[unseong] || unseong;
  const unseongColor = SJS_COLOR[unseong] || '#a78bfa';

  // 십성별 대운 설명
  const DAEWOON_DESC = {
    '비견': t('자립심과 독립 의지가 강해지는 시기입니다. 새로운 시작과 자기 계발에 유리하며, 경쟁 속에서 실력을 키울 수 있습니다. 다만 고집이 세질 수 있으니 협력을 잊지 마세요.'),
    '겁재': t('활동성과 추진력이 강해지는 시기입니다. 재물의 유동성이 크고 인간관계가 넓어집니다. 충동적인 투자나 보증은 피하고 신중한 재무 관리가 필요합니다.'),
    '식신': t('창의력과 표현력이 풍부해지는 시기입니다. 재능을 발휘하고 새로운 것을 배우기에 좋으며, 음식·예술·교육 분야에서 기회가 생깁니다. 전반적으로 안정적이고 여유로운 대운입니다.'),
    '상관': t('변화와 혁신을 추구하는 시기입니다. 창의적 아이디어가 넘치고 기존 틀을 벗어나려는 욕구가 강해집니다. 직업 변화나 이직을 고려할 수 있으며, 언행에 주의가 필요합니다.'),
    '편재': t('활발한 재물 활동과 사교성이 높아지는 시기입니다. 사업 기회나 투자 수익이 생길 수 있으나 변동성도 큽니다. 이성 인연이 활발해지고 대인관계가 넓어집니다.'),
    '정재': t('안정적인 재물 축적과 내실을 다지는 시기입니다. 꾸준한 노력이 결실을 맺고 저축과 부동산 등 안정적 자산 관리에 유리합니다. 성실하게 임하면 좋은 결과를 얻습니다.'),
    '편관': t('강한 도전과 변화의 시기입니다. 외부 압박이나 경쟁이 심해질 수 있으나, 이를 극복하면 큰 성취를 이룰 수 있습니다. 건강 관리와 법적 문제에 각별히 주의하세요.'),
    '정관': t('명예와 사회적 지위가 높아지는 시기입니다. 조직 내 승진이나 인정을 받을 기회가 생기며, 책임감과 원칙을 중시하게 됩니다. 공직·전문직에서 두각을 나타낼 수 있습니다.'),
    '편인': t('학문·연구·영성에 관심이 높아지는 시기입니다. 내면을 탐구하고 전문 지식을 쌓기에 좋으며, 예술·의료·종교 분야에서 재능이 발휘됩니다. 고독감이 들 수 있으니 소통을 늘리세요.'),
    '정인': t('학습과 성장, 귀인의 도움을 받는 시기입니다. 자격증 취득이나 학업에 유리하며, 어른이나 스승의 지원을 받을 수 있습니다. 차분하고 신중하게 임하면 좋은 결과를 얻습니다.')
  };
  const daewoonDesc = DAEWOON_DESC[stemSipsin] || t('이 대운은 천간의 기운이 일간에 영향을 미치는 시기입니다. 해당 십성의 특성을 이해하고 흐름에 맞게 대응하는 것이 중요합니다.');

  // 현재 대운 카드
  const currentCard = `
    <div style="background:linear-gradient(135deg,rgba(34,197,94,0.10),rgba(212,175,55,0.08));border:1px solid rgba(34,197,94,0.35);border-radius:16px;padding:20px 24px;margin-bottom:16px;position:relative;overflow:hidden">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#22c55e,#d4af37,#22c55e)"></div>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px">
        <div>
          <div style="font-size:12px;color:#8a7fa8;margin-bottom:6px;letter-spacing:0.08em">${t('현재 대운')}</div>
          <div style="display:flex;align-items:baseline;gap:8px">
            <span style="font-size:32px;font-weight:800;color:#e8d5a3;font-family:'Cormorant Garamond',serif;letter-spacing:0.02em">${ganziStr(cur.ganzi)}</span>
            <span style="font-size:18px;color:#9d8aa0">(${cur.ganzi[0]}${cur.ganzi[1]})</span>
          </div>
          <div style="font-size:14px;color:#8a7fa8;margin-top:4px">${curStartAge}${t('세')} ~ ${curEndAge}${t('세')}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:12px;color:#8a7fa8;margin-bottom:6px;letter-spacing:0.08em">${t('대운 십성')}</div>
          <div style="font-size:22px;font-weight:700;color:#e8d5a3;font-family:'Cormorant Garamond',serif">${t(stemSipsin)}</div>
          <div style="margin-top:6px">
            <span style="background:${unseongColor}22;color:${unseongColor};font-size:13px;padding:3px 10px;border-radius:20px;border:1px solid ${unseongColor}44;font-weight:600">${t('운성.'+unseong)}(${unseongHanja})</span>
          </div>
        </div>
      </div>
      <div style="margin-top:14px;padding-top:14px;border-top:1px solid rgba(212,175,55,0.15)">
        <div style="font-size:13px;color:#a0a8c0;line-height:1.7">${daewoonDesc}</div>
      </div>
    </div>`;

  // 타임라인 카드들
  const timelineCards = daewoon.map((dw, i) => {
    const isPast = i < currentIdx;
    const isCurrent = i === currentIdx;
    const isFuture = i > currentIdx;
    const dwStartAge = dw.age;
    const dwEndAge = (i + 1 < daewoon.length) ? daewoon[i + 1].age - 1 : dwStartAge + 9;
    const dwStemSipsin = SIPSIN_KR[dw.stemSipsin] || dw.stemSipsin || '';
    const dwBranchSipsin = SIPSIN_KR[dw.branchSipsin] || dw.branchSipsin || '';
    const dwUnseong = dw.unseong || '';
    const dwUnseongColor = SJS_COLOR[dwUnseong] || '#a78bfa';

    let dotColor, cardBg, cardBorder, textColor;
    if (isCurrent) {
      dotColor = '#22c55e'; cardBg = 'rgba(34,197,94,0.12)'; cardBorder = '2px solid rgba(34,197,94,0.5)'; textColor = '#e8d5a3';
    } else if (isPast) {
      dotColor = '#4b5563'; cardBg = 'rgba(30,28,50,0.4)'; cardBorder = '1px solid rgba(255,255,255,0.06)'; textColor = '#6b7280';
    } else {
      dotColor = '#eab308'; cardBg = 'rgba(234,179,8,0.10)'; cardBorder = '1px solid rgba(234,179,8,0.35)'; textColor = '#fde68a';
    }

    return `<div style="background:${cardBg};border:${cardBorder};border-radius:10px;padding:8px 4px;text-align:center;position:relative;transition:transform 0.2s">
      ${isCurrent ? '<div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#22c55e,transparent)"></div>' : ''}
      <div style="width:8px;height:8px;border-radius:50%;background:${dotColor};margin:0 auto 5px;${isCurrent ? 'box-shadow:0 0 6px #22c55e' : ''}"></div>
      <div style="font-weight:700;font-size:13px;color:${textColor};font-family:'Cormorant Garamond',serif;margin-bottom:1px">${ganziStr(dw.ganzi)}</div>
      <div style="font-size:9px;color:#6b7280;margin-bottom:4px">${dw.ganzi[0]}${dw.ganzi[1]}</div>
      <div style="font-size:9px;color:${isCurrent ? '#22c55e' : (isFuture ? '#eab308' : '#4b5563')};font-weight:600;margin-bottom:2px">${dwStartAge}~${dwEndAge}${t('세')}</div>
      <div style="font-size:9px;color:${isCurrent ? '#d4af37' : (isFuture ? '#fde68a' : '#6b7280')};margin-bottom:2px">${t(dwStemSipsin)}</div>
      <div style="font-size:9px;color:${isCurrent ? '#9da8c0' : '#4b5563'};margin-bottom:3px">${dwBranchSipsin}</div>
      <div style="display:inline-block;background:${dwUnseongColor}18;color:${dwUnseongColor};font-size:9px;padding:1px 4px;border-radius:8px;border:1px solid ${dwUnseongColor}30">${t('운성.'+dwUnseong)}</div>
    </div>`;
  }).join('');

  // 범례
  const legend = `<div style="display:flex;gap:16px;justify-content:center;margin-top:12px;font-size:12px;color:#6b7280">
    <span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:50%;background:#22c55e;display:inline-block;box-shadow:0 0 6px #22c55e80"></span>${t('현재 대운')}</span>
    <span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:50%;background:#4b5563;display:inline-block"></span>${t('지난 대운')}</span>
    <span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:50%;background:#eab308;display:inline-block;box-shadow:0 0 6px #eab30880"></span>${t('미래 대운')}</span>
  </div>`;

  return `<div style="${D.wrap}">
    ${sectionHeader('D2', t('대운 (大運)'), `${t('현재 나이')}: ${currentAge}${t('세')} · ${flowLabel}`)}
    <div style="font-size:12px;color:#6b7280;margin-bottom:12px">${genderLabel} + ${t('양년')} = ${flowLabel} · ${t('대운수')} ${cur.age}${t('세')}</div>
    ${currentCard}
    <div style="display:grid;grid-template-columns:repeat(10,1fr);gap:5px">
      ${timelineCards}
    </div>
    ${legend}
  </div>`;
}

// ─── D3. 신살 분석 ──────────────────────────────────────────────

function renderSinsal(saju) {
  const ss = saju.specialSals;
  if (!ss) return '';

  // pillars 인덱스 -> 주 이름 (0=시주, 1=일주, 2=월주, 3=년주)
  const PILLAR_LABEL = [t('시주'),t('일주'),t('월주'),t('년주')];

  // 일간/일지/월지/년지
  const dayStem   = saju.pillars[1]?.pillar?.stem || '';
  const dayBranch = saju.pillars[1]?.pillar?.branch || '';
  const monthBranch = saju.pillars[2]?.pillar?.branch || '';
  const yearBranch  = saju.pillars[3]?.pillar?.branch || '';

  // ── 추가 신살 계산 ──
  // 화개(華蓋): 년지 기준
  const HWAGAE_MAP = {'子':'辰','丑':'丑','寅':'戌','卯':'未','辰':'辰','巳':'丑','午':'戌','未':'未','申':'辰','酉':'丑','戌':'戌','亥':'未'};
  const hwagaeBranch = HWAGAE_MAP[yearBranch];
  const hwagaePillars = hwagaeBranch ? saju.pillars.reduce((acc,p,i)=>{ if(p.pillar.branch===hwagaeBranch) acc.push(i); return acc; },[]) : [];

  // 태극귀인(太極貴人): 일간 기준
  const TAEGUK_MAP = {'甲':['子','午'],'乙':['子','午'],'丙':['卯','酉'],'丁':['卯','酉'],'戊':['辰','戌','丑','未'],'己':['辰','戌','丑','未'],'庚':['寅','亥'],'辛':['寅','亥'],'壬':['卯','巳'],'癸':['卯','巳']};
  const taegukBranches = TAEGUK_MAP[dayStem] || [];
  const taegukPillars = saju.pillars.reduce((acc,p,i)=>{ if(taegukBranches.includes(p.pillar.branch)) acc.push(i); return acc; },[]);

  // 천의성(天醫星): 월지 앞 지지가 사주에 있으면
  const CHEONUI_MAP = {'子':'亥','丑':'子','寅':'丑','卯':'寅','辰':'卯','巳':'辰','午':'巳','未':'午','申':'未','酉':'申','戌':'酉','亥':'戌'};
  const cheonuiBranch = CHEONUI_MAP[monthBranch];
  const cheonuiPillars = cheonuiBranch ? saju.pillars.reduce((acc,p,i)=>{ if(p.pillar.branch===cheonuiBranch) acc.push(i); return acc; },[]) : [];

  // 귀문관살(鬼門關殺): 사주 내 특정 지지 조합
  const GUIMUN_PAIRS = [['子','酉'],['丑','午'],['寅','未'],['卯','申'],['辰','亥'],['巳','戌']];
  const allBranches = saju.pillars.map(p=>p.pillar.branch);
  let hasGuimun = false;
  for (const [a,b] of GUIMUN_PAIRS) {
    if (allBranches.includes(a) && allBranches.includes(b)) { hasGuimun = true; break; }
  }

  // ── 신살 목록 구성 ──
  // 길신 (green)
  const gilsin = [];
  const pushGil = (idxArr, name, hanja, shortDesc, fullDesc) => {
    if (idxArr && idxArr.length > 0) {
      idxArr.forEach(i => gilsin.push({ name, hanja, pillar: PILLAR_LABEL[i], shortDesc, fullDesc }));
    }
  };
  const pushGilBool = (flag, name, hanja, pillar, shortDesc, fullDesc) => {
    if (flag) gilsin.push({ name, hanja, pillar, shortDesc, fullDesc });
  };

  pushGil(hwagaePillars,      '화개',     '華蓋',     '예술, 학문, 종교적 기운',       '예술적 감각과 학문적 재능이 뛰어나며 종교·철학적 소질이 있습니다.');
  pushGil(taegukPillars,      '태극귀인', '太極貴人', t('최고의 귀인, 큰 도움과 인복'),   t('일생 최고의 귀인을 만나는 기운으로 위기 시 강력한 도움을 받습니다.'));
  pushGil(ss.munchang,        '문창귀인', '文昌貴人', t('학문과 시험의 귀인, 문장 재능'),  t('학업·시험 운이 강하고 글재주가 뛰어나 문서·계약에 유리합니다.'));
  pushGil(cheonuiPillars,     '천의성',   '天醫星',   t('의술과 건강의 별, 치료 능력'),    t('의료·치유 분야에 재능이 있으며 건강 회복력이 강합니다.'));
  pushGil(ss.geumyeo,         '금여성',   '金輿星',   t('부귀와 안락의 별, 재물과 명예'),  t('재물복과 명예운이 좋아 안정된 삶을 누리는 기운입니다.'));
  pushGil(ss.cheonul,         '천을귀인', '天乙貴人', t('최고 귀인성, 위기 극복'),         t('하늘이 내린 귀인으로 어려운 상황에서 도움을 받는 강한 기운입니다.'));
  pushGil(ss.cheonduk,        '천덕귀인', '天德貴人', t('하늘의 덕, 재난 소멸'),           t('하늘의 덕을 받아 재난과 액운이 자연스럽게 해소됩니다.'));
  pushGil(ss.wolduk,          '월덕귀인', '月德貴人', t('월의 덕, 관재 소멸'),           t('관재구설과 소송에서 보호받으며 관운이 좋아집니다.'));

  // 흉신 (red)
  const hyungsin = [];
  const pushHyung = (idxArr, name, hanja, shortDesc, fullDesc) => {
    if (idxArr && idxArr.length > 0) {
      idxArr.forEach(i => hyungsin.push({ name, hanja, pillar: PILLAR_LABEL[i], shortDesc, fullDesc }));
    }
  };
  const pushHyungBool = (flag, name, hanja, pillar, shortDesc, fullDesc) => {
    if (flag) hyungsin.push({ name, hanja, pillar, shortDesc, fullDesc });
  };

  pushHyungBool(hasGuimun,    '귀문관살', '鬼門關殺', t('원국'), t('신비롭고 예민한 기운이 강하게 작동할 수 있음'), t('직관력과 영적 감수성이 뛰어나지만 신경과민·불안 경향에 주의가 필요합니다.'));
  pushHyungBool(ss.baekho,    '백호살',   '白虎殺',   t('일주'), t('강한 기운, 사고·수술 주의'),                t('강렬한 에너지로 추진력이 강하지만 사고·수술·구설에 주의가 필요합니다.'));
  pushHyungBool(ss.goegang,   '괴강살',   '魁罡殺',   t('일주'), t('강한 의지력, 극단적 기운'),                   t('강한 의지와 리더십이 있지만 극단적 상황이 발생할 수 있습니다.'));
  pushHyung(ss.yangin,        '양인살',   '羊刃殺',   t('강한 의지, 충동적 행동 주의'),                        t('추진력과 결단력이 강하지만 충동적 행동과 대인 갈등에 주의하세요.'));

  // 중성 신살 (gray)
  const jungseong = [];
  const pushJung = (idxArr, name, hanja, shortDesc, fullDesc) => {
    if (idxArr && idxArr.length > 0) {
      idxArr.forEach(i => jungseong.push({ name, hanja, pillar: PILLAR_LABEL[i], shortDesc, fullDesc }));
    }
  };
  const pushJungBool = (flag, name, hanja, pillar, shortDesc, fullDesc) => {
    if (flag) jungseong.push({ name, hanja, pillar, shortDesc, fullDesc });
  };

  pushJung(ss.dohwa,          '도화살',   '桃花殺',   t('이성 매력, 예술적 감각'),         t('이성에게 매력적으로 보이며 예술·연예 분야에 재능이 있습니다.'));
  pushJungBool(ss.hongyeom,   '홍염살',   '紅艶殺',   t('일주'), t('열정과 감정의 기운, 예술적 재능'), t('강한 감수성과 예술적 재능을 가지며 이성 관계가 활발합니다.'));

  if (gilsin.length === 0 && hyungsin.length === 0 && jungseong.length === 0) return '';

  // ── 카드 렌더링 (다크 파스텔톤 고급 디자인) ──
  function salCard(item, glowColor, accentColor) {
    return `<div style="background:linear-gradient(135deg,#131726 0%,#161b2e 100%);border:1px solid ${glowColor}45;border-radius:14px;padding:14px 16px;position:relative;overflow:hidden;box-shadow:0 2px 14px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.04);">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,${glowColor}70,transparent)"></div>
      <div style="position:absolute;top:9px;right:11px;font-size:11px;color:${accentColor};background:${glowColor}18;padding:2px 9px;border-radius:20px;font-weight:600;border:1px solid ${glowColor}35;letter-spacing:0.3px">${item.pillar}</div>
      <div style="font-weight:700;font-size:15px;color:#e8dfc8;margin-bottom:3px">${t('sinsal.'+item.name)} <span style="font-size:12px;color:${accentColor};font-weight:400;opacity:0.9">(${item.hanja})</span></div>
      <div style="font-size:12px;color:#9d9db5;line-height:1.55">${item.shortDesc}</div>
    </div>`;
  }

  function salSection(label, emoji, count, subtitle, items, glowColor, accentColor, dotGradient) {
    if (items.length === 0) return '';
    const grid = items.length === 1
      ? `<div style="display:grid;grid-template-columns:1fr;gap:10px">${items.map(i=>salCard(i,glowColor,accentColor)).join('')}</div>`
      : `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">${items.map(i=>salCard(i,glowColor,accentColor)).join('')}</div>`;
    return `<div style="margin-bottom:20px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span style="width:24px;height:24px;border-radius:50%;background:${dotGradient};display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;box-shadow:0 0 10px ${glowColor}55;flex-shrink:0">${emoji}</span>
        <span style="font-weight:700;font-size:14px;color:#e8dfc8">${label} <span style="color:${accentColor}">(${count}${t('개')})</span></span>
        <span style="font-size:12px;color:#6b6b85">· ${subtitle}</span>
      </div>
      ${grid}
    </div>`;
  }

  // 무료판 업그레이드 유도 배너 (다크 골드 스타일)
  const upgradeBanner = `<div style="background:linear-gradient(135deg,rgba(212,175,55,0.10),rgba(251,191,36,0.06));border:1px solid rgba(212,175,55,0.30);border-radius:14px;padding:14px 18px;margin-top:4px;display:flex;align-items:center;gap:12px;position:relative;overflow:hidden">
    <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.55),transparent)"></div>
    <span style="font-size:22px;flex-shrink:0">🔐</span>
    <div>
      <div style="font-weight:700;font-size:13px;color:#d4af37;letter-spacing:0.3px">${t('멤버십 전용')} · ${t('상세 해석 제공')}</div>
      <div style="font-size:12px;color:#9d8a5a;margin-top:2px">${t('각 신살의 연애·직업·건강 영역별 심층 분석, AI 종합 해석을 멤버십에서 확인하세요.')}</div>
    </div>
  </div>`;

  // 다크 테마 래퍼 - 나머지 섹션과 동일한 배경
  return `<div style="background:linear-gradient(135deg,#0d1020 0%,#111428 50%,#0a0e1a 100%);border-radius:18px;padding:24px;border:1px solid rgba(212,175,55,0.15);box-shadow:0 4px 32px rgba(0,0,0,0.5),inset 0 1px 0 rgba(212,175,55,0.08);position:relative;overflow:hidden">
    <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.40),transparent)"></div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid rgba(212,175,55,0.12)">
      <span style="background:linear-gradient(135deg,rgba(212,175,55,0.22),rgba(251,191,36,0.12));width:38px;height:38px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;font-size:20px;border:1px solid rgba(212,175,55,0.28);box-shadow:0 0 14px rgba(212,175,55,0.18)">✨</span>
      <div>
        <div style="font-weight:800;font-size:17px;color:#e8dfc8;letter-spacing:0.5px">${t('신살 분석')}</div>
        <div style="font-size:11px;color:#6b6b85;margin-top:1px">${t('사주 원국의 특수 기운 분석')}</div>
      </div>
    </div>
    ${salSection(t('길신'), '+', gilsin.length, t('긍정적인 기운'), gilsin, '#86efac', '#4ade80', 'linear-gradient(135deg,#16a34a,#15803d)')}
    ${salSection(t('흉신'), '−', hyungsin.length, t('주의가 필요한 기운'), hyungsin, '#fca5a5', '#f87171', 'linear-gradient(135deg,#dc2626,#b91c1c)')}
    ${salSection(t('중성 신살'), '○', jungseong.length, t('상황에 따라 달라지는 기운'), jungseong, '#c4b5fd', '#a78bfa', 'linear-gradient(135deg,#7c3aed,#6d28d9)')}
    ${upgradeBanner}
  </div>`;
}

// ─── E. 자미두수 ──────────────────────────────────────────────

function renderZiweiSection(chart) {
  // 궁 카드 렌더링 함수
  function palaceCard(palaceName, isPremium) {
    const palace = chart.palaces[palaceName];
    if (!palace) return '';
    const mains = getMainStars(palace);
    const pi = PALACE_INFO[palaceName] || { emoji:'⭐', label:palaceName, desc:'', color:'#a78bfa', field:'fate' };
    const pc = pi.color;

    if (mains.length === 0) {
      return `<div style="${D.card}border-top:2px solid ${pc}40;opacity:${isPremium?'1':'0.85'}">
        <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${pc}60,transparent)"></div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <span style="font-size:22px;filter:drop-shadow(0 0 6px ${pc}80)">${pi.emoji}</span>
          <span style="color:#e8dfc8;font-weight:700;font-size:16px;font-family:'Cormorant Garamond',serif">${getPalaceLabel(palaceName)}</span>
          <span style="background:rgba(212,175,55,0.1);color:#9d8aa0;font-size:12px;padding:2px 7px;border-radius:6px;border:1px solid rgba(212,175,55,0.2)">${palace.ganZhi}</span>
        </div>
        <p style="color:#7a6f8a;font-size:14px">${t('이 궁에는 주성이 없어 대궁(對宮) 성향으로 판단합니다.')}</p>
      </div>`;
    }

    const starCards = mains.map(s => {
      const extraInfo = STAR_PALACE_DESC[s.name] || {};
      const field = pi.field;
      let content;
      if (field === 'fate') content = t(`star.${s.name}.fate`);
      else if (field === 'wealth') content = t(`star.${s.name}.wealth`);
      else if (field === 'love') content = t(`star.${s.name}.love`);
      else content = extraInfo[field] || t(`star.${s.name}.fate`);

      const siHua = s.siHua
        ? `<span style="background:${s.siHua==='化忌'?'rgba(248,113,113,0.15)':'rgba(212,175,55,0.15)'};color:${s.siHua==='化忌'?'#f87171':'#d4af37'};font-size:12px;padding:2px 7px;border-radius:8px;margin-left:6px;border:1px solid ${s.siHua==='化忌'?'rgba(248,113,113,0.3)':'rgba(212,175,55,0.3)'}">${SIHAU_LABEL[s.siHua]||s.siHua}</span>` : '';
      const bright = s.brightness ? `<span style="color:#7a6f8a;font-size:13px"> (${s.brightness})</span>` : '';
      return `<div style="padding:12px;margin-bottom:6px;background:rgba(15,12,35,0.6);border-radius:10px;border:1px solid rgba(212,175,55,0.12);border-left:3px solid ${pc}">
        <div style="display:flex;align-items:center;flex-wrap:wrap;gap:5px;margin-bottom:8px">
          <span style="background:linear-gradient(135deg,#e8d5a3,#c9a84c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:700;font-size:18px;font-family:'Cormorant Garamond',serif">${s.name}</span>${bright}${siHua}
        </div>
        <p style="color:#c8d0e8;font-size:14px;line-height:1.8;margin:0;padding:8px 10px;background:rgba(124,106,247,0.05);border-radius:8px;border-left:2px solid ${pc}40">${content}</p>
      </div>`;
    }).join('');

    return `<div style="${D.card}border-top:2px solid ${pc}40;">
      <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${pc}60,transparent)"></div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span style="font-size:22px;filter:drop-shadow(0 0 8px ${pc}80)">${pi.emoji}</span>
        <div style="flex:1">
          <div style="color:#e8dfc8;font-weight:700;font-size:16px;font-family:'Cormorant Garamond',serif">${getPalaceLabel(palaceName)}</div>
          <div style="color:#7a6f8a;font-size:12px;margin-top:1px">${getPalaceDesc(palaceName)}</div>
        </div>
        <span style="background:linear-gradient(135deg,rgba(124,106,247,0.15),rgba(212,175,55,0.1));color:#a78bfa;font-size:12px;padding:2px 8px;border-radius:8px;border:1px solid rgba(124,106,247,0.3)">${palace.ganZhi}</span>
      </div>
      ${starCards}
    </div>`;
  }

  // 무료: 명궁·재백궁·부처궁 3개 궁
  const freePalaces = ['命宮','財帛','夫妻'];
  // 유료 전용: 나머지 9개 궁
  const premiumPalaces = ['兄弟','子女','疾厄','遷移','交友','官祿','田宅','福德','父母'];

  const freePalaceCards = freePalaces.map(p => palaceCard(p, false)).join('');

  // 유료 궁들을 흐리게 미리보기로 표시
  const premiumPreviewCards = premiumPalaces.map(p => {
    const palace = chart.palaces[p];
    if (!palace) return '';
    const mains = getMainStars(palace);
    const pi = PALACE_INFO[p] || { emoji:'⭐', label:p, desc:'', color:'#a78bfa' };
    const pc = pi.color;
    const starNames = mains.length > 0 ? mains.map(s=>s.name).join('·') : t('공궁');
    return `<div style="${D.card}border-top:2px solid ${pc}30;opacity:0.55;filter:blur(0.3px);position:relative;">
      <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${pc}40,transparent)"></div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-size:20px">${pi.emoji}</span>
        <div style="flex:1">
          <div style="color:#c8b89a;font-weight:700;font-size:15px;font-family:'Cormorant Garamond',serif">${getPalaceLabel(p)}</div>
          <div style="color:#5a5f7a;font-size:11px">${getPalaceDesc(p)}</div>
        </div>
        <span style="background:rgba(124,106,247,0.08);color:#6b6f8a;font-size:11px;padding:2px 7px;border-radius:6px;border:1px solid rgba(124,106,247,0.15)">${palace.ganZhi}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;padding:8px 10px;background:rgba(15,12,35,0.4);border-radius:8px;border:1px solid rgba(212,175,55,0.08)">
        <span style="color:#d4af37;font-size:14px;font-family:'Cormorant Garamond',serif;font-weight:600">${starNames}</span>
        <span style="color:#5a5f7a;font-size:12px">· ${t('멤버십에서 상세 해석 확인')}</span>
      </div>
    </div>`;
  }).join('');

  // ── 자미두수 명반 미니 그리드 (명궁만 선명, 나머지 블러) ──
  const PALACE_ORDER = ['交友','遷移','疾厄','財帛','官祿','田宅','福德','父母','命宮','兄弟','夫妻','子女'];
  const miniZiwei = `
    <div style="background:rgba(13,16,32,0.6);border:1px solid rgba(212,175,55,0.15);border-radius:12px;padding:12px;margin-bottom:14px;position:relative;overflow:hidden">
      <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.4),transparent)"></div>
      <div style="font-size:10px;color:#5a6478;letter-spacing:0.1em;text-align:center;margin-bottom:10px">紫微斗數 命盤</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px">
        ${PALACE_ORDER.map(name => {
          const p = chart.palaces[name];
          const pi = PALACE_INFO[name] || {};
          const isLife = (name === '命宮');
          const mains = getMainStars(p || {}).map(s=>s.name||s).slice(0,2).join(' ');
          const blur = isLife ? '' : 'filter:blur(5px);user-select:none;';
          const border = isLife ? '1.5px solid #d4af37' : '1px solid rgba(255,255,255,0.06)';
          const bg = isLife ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.02)';
          return `<div style="background:${bg};border:${border};border-radius:6px;padding:5px 4px;text-align:center;${blur}">
            <div style="font-size:9px;color:#6a7898;margin-bottom:2px">${name}</div>
            <div style="font-size:10px;color:#c8b89a;font-weight:600;line-height:1.3">${mains||'空'}</div>
            <div style="font-size:9px;color:#4a5268">${p?.ganZhi||''}</div>
          </div>`;
        }).join('')}
      </div>
      <div style="font-size:11px;color:#4a5268;text-align:center;margin-top:8px">🔒 명궁 공개 · 나머지는 멤버십에서 확인</div>
    </div>`;

  const wu = chart.wuXingJu;
  return `<div style="${D.wrap}">
    ${sectionHeader('E', t('자미두수'), `${wu?.name||'命盤'} · 12궁`)}
    ${miniZiwei}

    <!-- 무료 3궁 -->
    <div style="margin-bottom:6px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 6px #22c55e80"></span>
        <span style="color:#9d8aa0;font-size:13px">${t('무료 해석')} · ${t('핵심 3궁')}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${freePalaceCards}
      </div>
    </div>

    <!-- 유료 9궁 미리보기 -->
    <div style="margin-top:14px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#d4af37;box-shadow:0 0 6px #d4af3780"></span>
        <span style="color:#9d8aa0;font-size:13px">${t('멤버십 전용')} · ${t('나머지 9궁')}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${premiumPreviewCards}
      </div>
    </div>

    <!-- 멤버십 업그레이드 배너 -->
    <div style="margin-top:16px;padding:16px 18px;background:linear-gradient(135deg,rgba(212,175,55,0.08),rgba(124,106,247,0.08));border:1px solid rgba(212,175,55,0.25);border-radius:14px;display:flex;align-items:center;gap:14px">
      <span style="font-size:28px">🔐</span>
      <div style="flex:1">
        <div style="color:#d4af37;font-weight:700;font-size:15px;margin-bottom:4px">${t('멤버십 전용 · 자미두수 12궁 완전 해석')}</div>
        <div style="color:#9d8aa0;font-size:13px;line-height:1.6">${t('형제·자녀·질액·천이·교우·관록·전택·복덕·부모궁 + 사화 분석 + 대운·유년 연계 해석을 멤버십에서 확인하세요.')}</div>
      </div>
    </div>
  </div>`;
}

// ─── F. 점성학 ────────────────────────────────────────────────

// 별자리별 상세 성격 해석 (무료 공개)
const SUN_DETAIL = [
  t('양자리는 황도 12궁의 첫 번째 별자리로, 화성이 지배하는 불의 별자리입니다. 개척 정신과 추진력이 강하며, 새로운 일을 시작하는 데 탁월한 능력을 발휘합니다. 경쟁심이 강하고 즉흥적인 면이 있어 충동적 결정에 주의가 필요합니다. 리더십이 뛰어나고 용기 있는 행동으로 주변을 이끄는 타입입니다.'),
  t('황소자리는 금성이 지배하는 흙의 별자리입니다. 안정과 물질적 풍요를 중시하며, 한번 결정한 것은 끝까지 밀고 나가는 끈기가 있습니다. 감각적인 즐거움과 아름다움을 사랑하며, 신뢰할 수 있는 든든한 파트너입니다. 변화에 저항하는 고집스러운 면이 있어 유연성을 기르는 것이 중요합니다.'),
  t('쌍둥이자리는 수성이 지배하는 바람의 별자리입니다. 지적 호기심이 넘치고 다재다능하며, 소통과 정보 교환에 탁월합니다. 두 가지 상반된 성향이 공존하여 상황에 따라 다른 모습을 보이기도 합니다. 언어 능력과 적응력이 뛰어나 다양한 분야에서 활약할 수 있습니다.'),
  t('게자리는 달이 지배하는 물의 별자리입니다. 감수성이 풍부하고 직관력이 뛰어나며, 가족과 가정을 무엇보다 소중히 여깁니다. 타인의 감정에 민감하게 반응하는 공감 능력이 탁월합니다. 감정 기복이 있을 수 있으며, 과거에 집착하는 경향을 의식적으로 조절하면 더 성장할 수 있습니다.'),
  t('사자자리는 태양이 지배하는 불의 별자리입니다. 타고난 리더십과 카리스마로 자연스럽게 주목받습니다. 창의적이고 표현력이 풍부하며, 무대 위에서 빛나는 존재감을 발휘합니다. 자존심이 강하고 인정받고 싶은 욕구가 크므로, 겸손함을 갖추면 더욱 빛납니다.'),
  t('처녀자리는 수성이 지배하는 흙의 별자리입니다. 분석력과 세심함이 뛰어나며, 완벽을 추구하는 성실한 성향입니다. 실용적이고 논리적인 사고로 문제를 해결하는 능력이 탁월합니다. 지나친 완벽주의와 자기비판에 주의하고, 있는 그대로의 자신을 인정하는 연습이 필요합니다.'),
  t('천칭자리는 금성이 지배하는 바람의 별자리입니다. 균형과 조화를 추구하며, 아름다움과 예술적 감각이 뛰어납니다. 공정함을 중시하고 타인과의 관계에서 외교적 능력을 발휘합니다. 결정을 내리기 어려워하는 우유부단함이 있어, 자신의 내면 목소리를 믿는 연습이 중요합니다.'),
  t('전갈자리는 명왕성과 화성이 지배하는 물의 별자리입니다. 강렬한 의지와 깊이 있는 통찰력을 가지고 있습니다. 비밀을 잘 지키고 심층적인 진실을 탐구하는 능력이 탁월합니다. 집착과 질투심이 강할 수 있으므로, 신뢰를 바탕으로 한 깊은 관계를 형성하는 것이 중요합니다.'),
  t('사수자리는 목성이 지배하는 불의 별자리입니다. 자유를 사랑하고 철학적 사고와 모험 정신이 넘칩니다. 낙관적이고 유머 감각이 뛰어나며, 다양한 문화와 지식을 탐구하는 것을 즐깁니다. 무책임하거나 직설적인 말로 상처를 줄 수 있으므로, 세심한 배려가 필요합니다.'),
  t('염소자리는 토성이 지배하는 흙의 별자리입니다. 책임감이 강하고 목표를 향한 끈기와 실용적 판단력이 탁월합니다. 사회적 성공과 명예를 중시하며, 체계적이고 성실하게 기반을 쌓아갑니다. 감정 표현이 서툴고 지나치게 일에 집중하는 경향이 있어, 휴식과 감정 교류도 중요합니다.'),
  t('물병자리는 천왕성과 토성이 지배하는 바람의 별자리입니다. 독창적이고 혁신적인 사고로 미래를 내다보는 능력이 있습니다. 인류애와 평등을 중시하며, 독립적이고 자유로운 정신을 가지고 있습니다. 감정적 거리감이 있을 수 있으므로, 친밀한 관계에서 따뜻함을 표현하는 연습이 도움이 됩니다.'),
  t('물고기자리는 해왕성과 목성이 지배하는 물의 별자리입니다. 예민한 감수성과 깊은 공감 능력, 영적 직관이 뛰어납니다. 예술적 재능과 상상력이 풍부하며, 타인의 고통에 민감하게 반응합니다. 현실과 이상 사이에서 혼란을 겪을 수 있으므로, 경계를 설정하고 자신을 보호하는 것이 중요합니다.'),
];

// 별자리별 연애 스타일 (무료 공개)
const SUN_LOVE = [
  t('열정적이고 직접적으로 감정을 표현합니다. 첫눈에 반하는 경우가 많고, 상대를 적극적으로 리드합니다. 권태기가 오면 새로운 자극이 필요합니다.'),
  t('천천히 신중하게 마음을 열지만, 한번 사랑에 빠지면 매우 헌신적입니다. 안정적이고 감각적인 사랑을 추구하며, 물질적 표현으로 애정을 드러냅니다.'),
  t('대화와 지적 교감을 중시합니다. 다양한 사람에게 관심을 보이지만, 진정한 소울메이트를 찾습니다. 자유로운 관계를 선호하며 구속을 싫어합니다.'),
  t('감정적으로 깊이 연결되는 것을 원합니다. 상대를 세심하게 배려하고 보호하려 하며, 가정적인 사랑을 꿈꿉니다. 상처받으면 껍질 속으로 들어가는 경향이 있습니다.'),
  t('로맨틱하고 극적인 사랑을 즐깁니다. 상대에게 최고의 것을 선사하고 싶어하며, 충성스럽고 열정적인 파트너입니다. 인정받지 못하면 상처를 받습니다.'),
  t('완벽한 파트너를 찾기 위해 신중하게 관계를 시작합니다. 실용적이고 헌신적인 사랑을 하며, 세심한 배려로 상대를 돌봅니다. 지나친 비판은 관계를 어렵게 할 수 있습니다.'),
  t('균형 잡힌 아름다운 관계를 추구합니다. 로맨틱하고 우아한 사랑을 즐기며, 파트너와의 조화를 중시합니다. 갈등을 피하려는 성향이 있어 솔직한 표현이 필요합니다.'),
  t('깊고 강렬한 사랑을 원합니다. 상대의 영혼까지 알고 싶어하며, 완전한 신뢰와 헌신을 요구합니다. 질투심이 강할 수 있으나, 그만큼 깊이 사랑합니다.'),
  t('자유롭고 모험적인 사랑을 즐깁니다. 함께 성장하고 세상을 탐험할 파트너를 원합니다. 구속받는 것을 싫어하며, 정신적 교감을 매우 중시합니다.'),
  t('진지하고 책임감 있는 사랑을 합니다. 장기적인 관계와 안정을 추구하며, 파트너에게 든든한 지원자가 됩니다. 감정 표현이 서툴 수 있으나 깊이 헌신합니다.'),
  t('독특하고 자유로운 사랑을 원합니다. 친구 같은 파트너를 선호하며, 지적 교감과 공통된 가치관을 중시합니다. 감정적 친밀감보다 정신적 연결을 더 중요하게 여깁니다.'),
  t('꿈같은 로맨스를 꿈꿉니다. 상대를 이상화하는 경향이 있으며, 깊은 영혼의 교감을 원합니다. 감정적으로 민감하고 공감 능력이 뛰어나 상대의 마음을 잘 읽습니다.'),
];

// 별자리별 직업 적성 (무료 공개)
const SUN_CAREER = [
  t('리더십과 추진력이 필요한 분야에서 두각을 나타냅니다. 스포츠, 군경, 기업가, 개척 사업, 응급 의료 분야가 잘 맞습니다. 독립적으로 일하거나 팀을 이끄는 역할이 적합합니다.'),
  t('안정적이고 실용적인 분야에서 능력을 발휘합니다. 금융, 부동산, 요리, 예술, 농업, 건축 분야가 잘 맞습니다. 장기적인 프로젝트를 꾸준히 완성하는 능력이 탁월합니다.'),
  t('소통과 정보를 다루는 분야에서 빛납니다. 언론, 교육, IT, 마케팅, 작가, 통역 분야가 잘 맞습니다. 다양한 분야를 넘나드는 멀티태스킹 능력이 강점입니다.'),
  t('돌봄과 감성이 필요한 분야에서 탁월합니다. 의료, 사회복지, 교육, 요식업, 부동산, 상담 분야가 잘 맞습니다. 사람들의 감정을 이해하고 보살피는 능력이 뛰어납니다.'),
  t('창의성과 리더십이 필요한 분야에서 성공합니다. 연예, 예술, 경영, 교육, 정치, 이벤트 기획 분야가 잘 맞습니다. 무대 위에서 빛나는 존재감과 카리스마가 강점입니다.'),
  t('분석과 정밀함이 필요한 분야에서 두각을 나타냅니다. 의료, 회계, 연구, 편집, 영양, 품질관리 분야가 잘 맞습니다. 세심한 주의력과 완벽을 추구하는 성향이 강점입니다.'),
  t('균형과 조화가 필요한 분야에서 능력을 발휘합니다. 법률, 외교, 디자인, 패션, 상담, 중재 분야가 잘 맞습니다. 공정한 판단력과 미적 감각이 뛰어납니다.'),
  t('심층 분석과 변화를 다루는 분야에서 탁월합니다. 심리학, 의학, 금융, 탐정, 연구, 위기관리 분야가 잘 맞습니다. 숨겨진 진실을 파헤치는 능력과 강한 집중력이 강점입니다.'),
  t('자유와 확장이 필요한 분야에서 성공합니다. 교육, 여행, 출판, 법률, 철학, 해외 비즈니스 분야가 잘 맞습니다. 넓은 시야와 낙관적 에너지로 새로운 기회를 만들어냅니다.'),
  t('체계와 성취가 필요한 분야에서 두각을 나타냅니다. 경영, 정치, 금융, 건축, 행정, 공학 분야가 잘 맞습니다. 장기적인 목표를 향해 꾸준히 나아가는 끈기가 강점입니다.'),
  t('혁신과 미래를 다루는 분야에서 빛납니다. IT, 과학, 사회운동, 방송, 인도주의 분야가 잘 맞습니다. 독창적인 아이디어와 미래를 내다보는 통찰력이 강점입니다.'),
  t('감성과 영성이 필요한 분야에서 탁월합니다. 예술, 음악, 의료, 상담, 종교, 사진 분야가 잘 맞습니다. 깊은 공감 능력과 창의적 상상력이 강점입니다.'),
];

// 유료판 점성술 해석 항목 목록
function getAstroPremiumItems() { return [
  {icon:'🌟', title:t('네이탈 차트 완전 해석'), desc:t('태양·달·상승궁·10행성 전체 분석, 하우스 배치, 행성 각도 해석')},
  {icon:'🧠', title:t('심리 점성학'), desc:t('내면 상처, 반복 패턴, 불안 원인, 자기방어 방식, 치유 방향')},
  {icon:'💼', title:t('직업운 심층 해석'), desc:t('10하우스·MC·6하우스 분석, 적합 직종, 커리어 전환 시기, 승진운')},
  {icon:'💰', title:t('재물운 심층 해석'), desc:t('2·8하우스 분석, 수입 방식, 투자 성향, 배우자 재산, 상속·대출')},
  {icon:'💗', title:t('연애·결혼운 심층 해석'), desc:t('금성·화성·7하우스 분석, 배우자상, 결혼 시기, 이별 패턴')},
  {icon:'🔮', title:t('트랜짓 미래운'), desc:t('현재 행성이 내 차트에 주는 영향, 올해 운세, 직업·연애·재물 변화 시기')},
  {icon:'📅', title:t('솔라 리턴 (생일 1년 운세)'), desc:t('생일부터 다음 생일까지 핵심 주제, 직업·연애·재물·건강운')},
  {icon:'🌙', title:t('프로그레션 (내면 성장)'), desc:t('진행 태양·달·금성으로 보는 심리적 변화와 인생 단계 흐름')},
  {icon:'💞', title:t('시나스트리 궁합'), desc:t('두 사람 차트 비교, 감정·대화·성적 끌림·결혼 안정성 분석')},
  {icon:'🤝', title:t('컴포지트 관계 차트'), desc:t('두 사람이 만들어낸 관계 자체의 운명, 목적, 장기성 분석')},
  {icon:'🌍', title:t('아스트로카토그래피'), desc:t('지역별 운세, 이민·유학·사업·연애에 유리한 나라와 도시')},
  {icon:'🏥', title:t('건강 점성학'), desc:t('취약 신체 부위, 건강 경향, 별자리별 주의 질환 분석')},
  {icon:'✨', title:t('카르마·영혼 해석'), desc:t('북쪽·남쪽 노드, 키론, 전생 패턴, 이번 생의 영혼 과제')},
  {icon:'🔄', title:t('역행 행성 해석'), desc:t('출생차트 역행 행성의 내면화된 에너지와 특수 재능 분석')},
  {icon:'🏠', title:t('12하우스 전체 해석'), desc:t('인생 12개 분야(자아·재물·형제·가정·연애·건강·결혼·변화·철학·직업·인맥·영성)')},
  {icon:'⚡', title:t('행성 각도 심층 해석'), desc:t('합·섹스타일·스퀘어·트라인·오포지션 전체 각도 분석')},
]; }

function renderNatalSection(natalChart, transitChart, unknownTime) {
  const find = (chart, id) => chart?.planets?.find(p=>p.id===id);
  const signName = s => SIGN_KO[toSignIdx(s)] ?? ZODIAC_KO?.[s] ?? '알 수 없음';

  const sun     = find(natalChart, 'Sun');
  const moon    = find(natalChart, 'Moon');
  const ascObj  = !unknownTime ? (natalChart?.angles?.asc ?? null) : null;
  const jupiter = find(transitChart, 'Jupiter');
  const venus   = find(transitChart, 'Venus');

  const sunIdx  = sun ? toSignIdx(sun.sign) : -1;
  const moonIdx = moon ? toSignIdx(moon.sign) : -1;
  const ascIdx  = ascObj ? toSignIdx(ascObj.sign) : -1;

  const PLANET_COLORS = {'☀️':'#fbbf24','🌙':'#c0c8e0','⬆️':'#34d399','♃':'#a78bfa','♀':'#f472b6'};

  // ── 점성학 12궁 미니 휠 (태양 별자리만 선명, 나머지 블러) ──
  const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
  const SIGN_NAMES_SHORT = ['양','황소','쌍둥이','게','사자','처녀','천칭','전갈','사수','염소','물병','물고기'];
  const miniAstro = sunIdx >= 0 ? `
    <div style="background:rgba(13,16,32,0.6);border:1px solid rgba(124,106,247,0.2);border-radius:12px;padding:12px;margin-bottom:14px;position:relative;overflow:hidden">
      <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(124,106,247,0.4),transparent)"></div>
      <div style="font-size:10px;color:#5a6478;letter-spacing:0.1em;text-align:center;margin-bottom:10px">Natal Chart · 12 Signs</div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px">
        ${Array.from({length:12},(_,i)=>{
          const isSun = (i === sunIdx);
          const blur = isSun ? '' : 'filter:blur(5px);user-select:none;';
          const border = isSun ? '1.5px solid #a78bfa' : '1px solid rgba(255,255,255,0.06)';
          const bg = isSun ? 'rgba(124,106,247,0.15)' : 'rgba(255,255,255,0.02)';
          return `<div style="background:${bg};border:${border};border-radius:6px;padding:5px 4px;text-align:center;${blur}">
            <div style="font-size:16px">${SIGN_SYMBOLS[i]}</div>
            <div style="font-size:9px;color:${isSun?'#c8b0f8':'#4a5268'};margin-top:2px">${SIGN_NAMES_SHORT[i]}</div>
          </div>`;
        }).join('')}
      </div>
      <div style="font-size:11px;color:#4a5268;text-align:center;margin-top:8px">🔒 태양 별자리 공개 · 나머지는 멤버십에서 확인</div>
    </div>` : '';

  // ── 별자리 소개 배너 ──
  const sunBanner = sunIdx >= 0 ? `
    <div style="background:linear-gradient(135deg,rgba(212,175,55,0.12),rgba(124,106,247,0.08));border:1px solid rgba(212,175,55,0.3);border-radius:14px;padding:20px 22px;margin-bottom:20px;position:relative;overflow:hidden">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.7),transparent)"></div>
      <div style="font-size:13px;color:#9d8aa0;letter-spacing:0.08em;margin-bottom:6px">${t('당신의 별자리는')}</div>
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <span style="font-size:38px;filter:drop-shadow(0 0 12px rgba(212,175,55,0.6))">${SIGN_EMOJI[sunIdx]}</span>
        <div>
          <div style="font-size:26px;font-weight:800;color:#e8dfc8;font-family:'Cormorant Garamond',serif;line-height:1.2">${getSignName(sunIdx)} <span style="font-size:16px;color:#d4af37;font-weight:600">${t('입니다')}</span></div>
          <div style="font-size:14px;color:#a89bc0;margin-top:3px">${t('sun.'+sunIdx) || ''}</div>
        </div>
      </div>
    </div>` : '';

  // ── 태양 별자리 상세 카드 ──
  const sunDetailCard = sunIdx >= 0 ? `
    <div style="background:linear-gradient(135deg,#131726,#161b2e);border:1px solid rgba(251,191,36,0.2);border-radius:12px;padding:18px;margin-bottom:14px;position:relative;overflow:hidden">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(251,191,36,0.5),transparent)"></div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <span style="font-size:26px;filter:drop-shadow(0 0 8px rgba(251,191,36,0.5))">☀️</span>
        <div>
          <div style="color:#e8dfc8;font-weight:700;font-size:16px;font-family:'Cormorant Garamond',serif">${t('태양 별자리')} <span style="color:#fbbf24">${SIGN_EMOJI[sunIdx]} ${getSignName(sunIdx)}</span></div>
          <div style="color:#9d8aa0;font-size:12px">${t('핵심 정체성')}</div>
        </div>
      </div>
      <p style="color:#c0c8e0;font-size:14px;line-height:1.8;margin:0 0 12px">${SUN_DETAIL[sunIdx] || ''}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div style="background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.15);border-radius:8px;padding:10px">
          <div style="font-size:12px;color:#d4af37;font-weight:600;margin-bottom:5px">💗 ${t('연애 스타일')}</div>
          <div style="font-size:13px;color:#b8c0d8;line-height:1.6">${SUN_LOVE[sunIdx] || ''}</div>
        </div>
        <div style="background:rgba(167,139,250,0.06);border:1px solid rgba(167,139,250,0.15);border-radius:8px;padding:10px">
          <div style="font-size:12px;color:#a78bfa;font-weight:600;margin-bottom:5px">💼 ${t('직업 적성')}</div>
          <div style="font-size:13px;color:#b8c0d8;line-height:1.6">${SUN_CAREER[sunIdx] || ''}</div>
        </div>
      </div>
    </div>` : '';

  // ── 달 별자리 카드 ──
  const moonCard = moonIdx >= 0 ? `
    <div style="background:linear-gradient(135deg,#131726,#161b2e);border:1px solid rgba(192,200,224,0.2);border-radius:12px;padding:18px;margin-bottom:14px;position:relative;overflow:hidden">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(192,200,224,0.5),transparent)"></div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <span style="font-size:26px;filter:drop-shadow(0 0 8px rgba(192,200,224,0.5))">🌙</span>
        <div>
          <div style="color:#e8dfc8;font-weight:700;font-size:16px;font-family:'Cormorant Garamond',serif">${t('달 별자리')} <span style="color:#c0c8e0">${SIGN_EMOJI[moonIdx]} ${getSignName(moonIdx)}</span></div>
          <div style="color:#9d8aa0;font-size:12px">${t('감성·본능')}</div>
        </div>
      </div>
      <p style="color:#c0c8e0;font-size:14px;line-height:1.8;margin:0">${t('moon.'+moonIdx)} ${t('moon.intro')} ${getSignName(moonIdx)}${t('moon.suffix')}</p>
    </div>` : '';

  // ── 상승궁 카드 ──
  const ascCard = ascObj && ascIdx >= 0 ? `
    <div style="background:linear-gradient(135deg,#131726,#161b2e);border:1px solid rgba(52,211,153,0.2);border-radius:12px;padding:18px;margin-bottom:14px;position:relative;overflow:hidden">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(52,211,153,0.5),transparent)"></div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <span style="font-size:26px;filter:drop-shadow(0 0 8px rgba(52,211,153,0.5))">⬆️</span>
        <div>
          <div style="color:#e8dfc8;font-weight:700;font-size:16px;font-family:'Cormorant Garamond',serif">${t('상승궁 (ASC)')} <span style="color:#34d399">${SIGN_EMOJI[ascIdx]} ${getSignName(ascIdx)}</span></div>
          <div style="color:#9d8aa0;font-size:12px">${t('첫인상·외면')}</div>
        </div>
      </div>
      <p style="color:#c0c8e0;font-size:14px;line-height:1.8;margin:0">${t('타인에게 비치는 첫인상과 외면적 태도를 나타냅니다.')} ${getSignName(ascIdx)}${t('asc.mid')} ${t('sun.'+ascIdx) || t('독특한 인상')}${t('asc.suffix')}</p>
    </div>` : '';

  // ── 현재 행성 위치 카드 ──
  const transitCard = `
    <div style="background:linear-gradient(135deg,#131726,#161b2e);border:1px solid rgba(212,175,55,0.15);border-radius:12px;padding:18px;margin-bottom:14px">
      <div style="font-size:13px;color:#9d8aa0;margin-bottom:12px;letter-spacing:0.05em">${t('현재 행성 위치 · 지금 나에게 영향을 주는 에너지')}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${jupiter ? `<div style="background:rgba(167,139,250,0.06);border:1px solid rgba(167,139,250,0.15);border-radius:8px;padding:10px">
          <div style="font-size:12px;color:#a78bfa;font-weight:600;margin-bottom:4px">♃ ${t('목성 현재 위치')} · ${t('올해 성장 영역')}</div>
          <div style="font-size:14px;color:#e8dfc8;font-weight:700">${SIGN_EMOJI[toSignIdx(jupiter.sign)]} ${getSignName(toSignIdx(jupiter.sign))}</div>
          <div style="font-size:12px;color:#9d8aa0;margin-top:3px">${t('jup.'+toSignIdx(jupiter.sign)) || ''}</div>
        </div>` : ''}
        ${venus ? `<div style="background:rgba(244,114,182,0.06);border:1px solid rgba(244,114,182,0.15);border-radius:8px;padding:10px">
          <div style="font-size:12px;color:#f472b6;font-weight:600;margin-bottom:4px">♀ ${t('금성 현재 위치')} · ${t('이번달 애정·재물')}</div>
          <div style="font-size:14px;color:#e8dfc8;font-weight:700">${SIGN_EMOJI[toSignIdx(venus.sign)]} ${getSignName(toSignIdx(venus.sign))}</div>
          <div style="font-size:12px;color:#9d8aa0;margin-top:3px">${t('ven.'+toSignIdx(venus.sign)) || ''}</div>
        </div>` : ''}
      </div>
    </div>`;

  // ── 유료 항목 미리보기 ──
  const premiumGrid = getAstroPremiumItems().map(item => `
    <div style="background:rgba(19,23,38,0.7);border:1px solid rgba(212,175,55,0.1);border-radius:8px;padding:10px 12px;display:flex;align-items:flex-start;gap:8px;opacity:0.7">
      <span style="font-size:18px;flex-shrink:0">${item.icon}</span>
      <div>
        <div style="font-size:13px;color:#c8b87a;font-weight:600;margin-bottom:2px">${item.title}</div>
        <div style="font-size:11px;color:#7a7a9a;line-height:1.4">${item.desc}</div>
      </div>
    </div>`).join('');

  return `<div style="${D.wrap}">
    ${sectionHeader('F', t('점성학'), t('서양 천궁도 분석'))}
    ${miniAstro}

    <!-- 별자리 소개 배너 -->
    ${sunBanner}

    <!-- 무료 해석 영역 -->
    <div style="font-size:12px;color:#6b7280;letter-spacing:0.06em;margin-bottom:12px;display:flex;align-items:center;gap:6px">
      <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#34d399"></span>
      ${t('무료 해석')} · ${t('핵심 3요소')}
    </div>
    ${sunDetailCard}
    ${moonCard}
    ${ascCard}
    ${transitCard}

    <!-- 유료 항목 미리보기 -->
    <div style="margin-top:20px">
      <div style="font-size:12px;color:#6b7280;letter-spacing:0.06em;margin-bottom:12px;display:flex;align-items:center;gap:6px">
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#d4af37"></span>
        ${t('멤버십 전용 · 심층 점성술 해석')} · ${getAstroPremiumItems().length}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
        ${premiumGrid}
      </div>
      <div style="background:linear-gradient(135deg,rgba(212,175,55,0.08),rgba(124,106,247,0.06));border:1px solid rgba(212,175,55,0.25);border-radius:12px;padding:16px;text-align:center;position:relative;overflow:hidden">
        <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.6),transparent)"></div>
        <div style="font-size:20px;margin-bottom:6px">🔐</div>
        <div style="color:#d4af37;font-weight:700;font-size:15px;margin-bottom:4px">${t('멤버십 전용 · 심층 점성술 완전 해석')}</div>
        <div style="color:#9d8aa0;font-size:13px;line-height:1.6">${t('점성술 멤버십 배너 설명')}</div>
      </div>
    </div>
  </div>`;
}

// ─── 입력 폼 (자동 추출 실패 시 폴백) ─────────────────────────

function inputHtml() {
  const curYear = new Date().getFullYear();
  const yearOpts = Array.from({length: curYear - 1899}, (_, i) => curYear - i)
    .map(y => `<option value="${y}">${y}</option>`).join('');
  const monthOpts = Array.from({length:12},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('');
  const dayOpts   = Array.from({length:31},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('');
  const hourOpts  = `<option value="">Unknown time</option>` +
    Array.from({length:24},(_,i)=>`<option value="${i}">${String(i).padStart(2,'0')}</option>`).join('');

  const selectStyle = 'height:40px;border-radius:10px;border:1px solid rgba(212,175,55,0.3);background:linear-gradient(135deg,#131726,#161b2e);color:#e8dfc8;padding:0 12px;font-size:17px;outline:none;cursor:pointer;';
  return `<div style="background:linear-gradient(135deg,#0d1020,#111428);border:1px solid rgba(212,175,55,0.2);border-radius:16px;padding:22px;box-shadow:0 4px 32px rgba(0,0,0,0.5),inset 0 1px 0 rgba(212,175,55,0.08);position:relative;overflow:hidden">
    <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.6),transparent)"></div>

    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">
      <select id="gf-year" style="${selectStyle}">
        <option value="">${t('출생 연도')}</option>${yearOpts}
      </select>
      <select id="gf-month" style="${selectStyle}">
        <option value="">Month</option>${monthOpts}
      </select>
      <select id="gf-day" style="${selectStyle}">
        <option value="">Day</option>${dayOpts}
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
        ${['✨ 8글자 원국 전체 해석','✨ 대운 흐름 · 세운 분석',t('✨ 자미두수 12궁 상세 해석'),t('✨ 천궁도 행성·하우스·상(Aspect) 분석'),'✨ AI 종합 해석 포함'].map(item => `
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

// ─── 관리자 원본 데이터 뷰 ────────────────────────────────────

function renderAdminData(saju, ziwei, natalChart, transitChart, input) {
  const pillars = saju?.pillars || [];
  const row = (label, val) => `<tr><td style="color:#8a9ab8;padding:4px 12px 4px 0;white-space:nowrap">${label}</td><td style="color:#e8dfc8;font-family:monospace;font-size:13px;word-break:break-all">${val}</td></tr>`;

  // 사주 8자
  const sajuRows = pillars.map((p, i) => {
    const names = ['연주','월주','일주','시주'];
    const pl = p.pillar || {};
    return row(names[i], `${pl.stem||''}${pl.branch||''} | 십성:${p.stemSipsin||'-'}/${p.branchSipsin||'-'} | 운성:${p.unseong||'-'}`);
  }).join('');

  // 자미두수 12궁 (palaces는 객체)
  const palacesObj = ziwei?.palaces || {};
  const ziweiRows = Object.entries(palacesObj).map(([name, p]) => {
    const stars = (p?.stars||[]).map(s=>s.name||s).join(', ') || '(공궁)';
    return row(name, `${p?.ganZhi||''} | ${stars}`);
  }).join('');

  // 점성술 행성
  const planets = natalChart?.planets || [];
  const planetRows = planets.map(p =>
    row(p.name||p.id, `${p.sign||''} ${p.degree?.toFixed(2)||''}° | 하우스:${p.house||'-'}${p.retrograde?' ℞':''}`)
  ).join('');

  // 하우스 커스프
  const houses = natalChart?.houses || [];
  const houseRows = houses.map((h,i) =>
    row(`${i+1}하우스`, `${h.sign||''} ${h.degree?.toFixed(2)||''}°`)
  ).join('');

  const section = (title, content) => `
    <div style="margin-bottom:16px">
      <div style="font-size:13px;font-weight:700;color:#d4af37;letter-spacing:0.08em;margin-bottom:8px;border-bottom:1px solid rgba(212,175,55,0.2);padding-bottom:4px">${title}</div>
      <table style="width:100%;border-collapse:collapse">${content}</table>
    </div>`;

  return `
    <div style="background:rgba(220,30,30,0.06);border:1px solid rgba(220,80,80,0.3);border-radius:14px;padding:18px;margin-bottom:4px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
        <span style="background:#c0392b;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:0.06em">ADMIN</span>
        <span style="color:#e8a0a0;font-size:14px;font-weight:600">원본 계산 데이터 — ${input.year}/${input.month}/${input.day} ${input.gender==='M'?'남':'여'}</span>
      </div>
      ${section('📊 사주 원국 (8자)', sajuRows)}
      ${section('🌟 자미두수 12궁', ziweiRows)}
      ${section('🪐 점성술 행성', planetRows)}
      ${section('🏠 점성술 하우스', houseRows)}
      <details style="margin-top:8px">
        <summary style="color:#7a82a8;font-size:12px;cursor:pointer">JSON 원본 데이터 보기</summary>
        <pre style="color:#6a7a9a;font-size:11px;overflow:auto;max-height:300px;margin-top:8px;background:rgba(0,0,0,0.3);padding:10px;border-radius:6px">${JSON.stringify({saju,ziwei,natalChart},null,2).slice(0,8000)}</pre>
      </details>
    </div>`;
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
      ? `<div style="text-align:right;margin-bottom:8px"><span style="${D.sub}">Born ${month}/${day}/${year} · ${gender==='F'?'Female':'Male'}</span></div>`
      : '';

    // 관리자 원본 데이터 저장
    window.__adminCalcData = { saju, ziwei, natalChart, transitChart, input: { year, month, day, hour, minute, gender, unknownTime } };

    const isAdmin = new URLSearchParams(location.search).get('admin') === '1';

    if (bodyEl) bodyEl.innerHTML = `<div style="display:flex;flex-direction:column;gap:16px">
      ${infoLine}
      ${isAdmin ? renderAdminData(saju, ziwei, natalChart, transitChart, { year, month, day, hour, minute, gender }) : ''}
      ${renderBasicFortune(saju, yp, mp, dp, gender)}
      ${renderDailyCalendar(saju, yp, mp, dp)}
      ${renderYongShin(saju)}
      ${renderSijunseong(saju)}
      ${renderDaewoon(saju)}
      ${renderSinsal(saju)}
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
  if (new URLSearchParams(location.search).get('admin') === '1') return;
  try {
    const results = document.getElementById('results');
    if (!results) return;
    if (results.children.length === 0) return;
    if (results.querySelector('#honcheon-fortune-tabs')) return;

    // 폼 데이터 저장 시도 (captureMainFormInput 성공 여부와 관계없이 항상 이동)
    const input = captureMainFormInput();
    if (input) {
      try { sessionStorage.setItem('honcheon_last_input', JSON.stringify(input)); } catch {}
    }
    window.location.href = '/fortune/' + (location.search.includes('admin=1') ? '?admin=1' : '');
  } catch(err) {
    console.error('[fortune-free] mount error:', err);
  }
}

// ─── 글로벌 이벤트 ───────────────────────────────────────────

// 계산 버튼 텍스트 (5개국어)
const CALC_BTN_TEXTS = ['명식 산출하기', 'Calculate', '命式を計算', '開始計算', 'Calcular'];

document.addEventListener('click', e => {
  if (e.target.id==='gf-calc' || e.target.closest('#gf-calc')) {
    runFortune(null).catch(console.error);
    return;
  }
  const btn = e.target.closest('button');
  if (!btn) return;

  const btnText = btn.textContent.trim();
  const isCalcBtn = CALC_BTN_TEXTS.some(txt => btnText.includes(txt));

  const captured = captureMainFormInput();
  if (captured) {
    try { sessionStorage.setItem('honcheon_last_input', JSON.stringify(captured)); } catch {}
    if (isCalcBtn) {
      if (new URLSearchParams(location.search).get('admin') === '1') return; // admin: 원본 앱 표시
      // 계산 버튼: 무료운세 페이지로 이동
      e.stopImmediatePropagation();
      window.location.href = '/fortune/';
      return;
    }
    // 그 외 버튼: 탭이 이미 마운트된 경우를 위해 tryAutoRun 직접 호출
    setTimeout(() => tryAutoRun().catch(console.error), 900);
  }
}, true);

// mount 함수를 전역에 노출 (React 렌더링 완료 후 외부에서 호출 가능)
window.honcheonMount = mount;

// MutationObserver: body 전체 관찰
new MutationObserver(() => { mount(); }).observe(document.body, { childList:true, subtree:true });
mount();

// setInterval 폴링 함수 - results 내부에 탭이 없으면 mount 실행
let _mountPoller = null;
function startMountPoller() {
  if (_mountPoller) clearInterval(_mountPoller);
  let _pollCount = 0;
  _mountPoller = setInterval(() => {
    _pollCount++;
    const results = document.getElementById('results');
    if (results && results.children.length > 0 && !results.querySelector('#honcheon-fortune-tabs')) {
      mount();
    }
    if (_pollCount >= 200) clearInterval(_mountPoller);
  }, 300);
}
startMountPoller();

document.addEventListener('click', () => { startMountPoller(); }, { capture: true, passive: true });

document.addEventListener('honcheon:langchange', () => {
  if (lastInput) runFortune(lastInput).catch(console.error);
});

// ─── 무료운세 전용 페이지 (standalone mode) ───────────────────
(function() {
  const root = document.getElementById('fortune-root');
  if (!root) return;

  root.innerHTML = `<div style="max-width:860px;margin:0 auto">
    <div id="gf-error" style="color:#f87171;font-size:16px;margin-bottom:10px;display:none;text-align:center"></div>
    <div id="gf-body" style="min-height:200px">
      <p style="color:#7a82a8;font-size:20px;text-align:center;padding:60px 0">${t('계산 중… 잠시만 기다려주세요.')}</p>
    </div>
  </div>`;

  // gf-reset 클릭 시 계산기로 복귀 (capture로 runFortune 내부 리셋보다 먼저 실행)
  root.addEventListener('click', e => {
    if (e.target.id==='gf-reset' || e.target.closest('#gf-reset')) {
      e.stopImmediatePropagation();
      window.location.href = '/app/';
    }
  }, true);

  (async () => {
    let input = null;
    try {
      const stored = sessionStorage.getItem('honcheon_last_input');
      if (stored) input = JSON.parse(stored);
    } catch {}

    if (input) {
      await runFortune(input);
    } else {
      // sessionStorage 없으면 직접 입력 폼 표시 (계산기로 돌아가지 않고)
      const bodyEl = document.getElementById('gf-body');
      if (bodyEl) bodyEl.innerHTML = inputHtml();
    }
  })();
})();
