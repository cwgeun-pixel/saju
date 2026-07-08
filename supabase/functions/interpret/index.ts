// AI 해석 Edge Function — 유료 구독자 전용, Claude API 호출
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// lang 코드 → "~로/in ~/で/以/en" 표현
const LANG_IN: Record<string, string> = {
  ko: '한국어로',
  en: 'in English',
  ja: '日本語で',
  zh: '以繁體中文',
  es: 'en Español',
};
// 언어 강제 지시문 (프롬프트 끝에 항상 붙임)
function langEnforce(lang: string): string {
  const name: Record<string, string> = {
    ko:'한국어', en:'English', ja:'日本語', zh:'繁體中文', es:'Español',
  };
  return `\n\n⚠️ CRITICAL LANGUAGE RULE: Your ENTIRE response MUST be written in ${name[lang] || 'Korean'} ONLY. Do NOT use any other language — not Korean, not Japanese, not Chinese, not English — even if the source data contains those characters. Every word of your answer must be in ${name[lang] || 'Korean'}.`;
}

const DEPTH_SENTENCES: Record<string, string> = {
  short:    '각 항목을 2~3문장으로 간결하게',
  standard: '각 항목을 4~5문장으로 구체적으로',
  premium:  '각 항목을 6~8문장으로 심층적으로, 실제 데이터에서 도출된 근거를 반드시 포함하여',
};

const SECTION_PROMPT: Record<string, (lang: string, depth: string) => string> = {
  personality: (lang, depth) => `
당신은 사주명리·자미두수·서양 점성술을 통합 해석하는 전문가입니다.
아래 계산 결과를 바탕으로 이 사람의 기본 성향과 기질을 ${LANG_IN[lang] || '한국어로'} 작성하세요.
${DEPTH_SENTENCES[depth]}. 핵심 천간(일간)·자미두수 명궁 주성·태양/달/ASC 별자리를 모두 연결하여 해석하세요.
출력 형식: 마크다운 없이 자연스러운 문단 텍스트.`,

  saju: (lang, depth) => `
당신은 한국 전통 사주명리학 전문가입니다.
아래 계산 결과에서 사주 관련 데이터를 찾아 심층 해석을 ${LANG_IN[lang] || '한국어로'} 작성하세요.
다음 항목을 각각 ${DEPTH_SENTENCES[depth]} 설명하세요:
1. 일간의 특성과 오행 균형
2. 용신/희신 활용 방향
3. 대운 흐름과 현재 대운 분석
4. 세운(올해 운세)
5. 12운성 종합
출력 형식: 항목 번호와 소제목 포함, 자연스러운 문단.`,

  ziwei: (lang, depth) => `
당신은 대만 전통 자미두수(紫微斗數) 전문가입니다.
아래 계산 결과에서 자미두수 명반 데이터를 찾아 심층 해석을 ${LANG_IN[lang] || '한국어로'} 작성하세요.
다음 항목을 각각 ${DEPTH_SENTENCES[depth]} 설명하세요:
1. 명궁 주성과 기본 운명 구조
2. 재백궁·관록궁 분석 (재물·직업)
3. 부처궁 분석 (연애·결혼)
4. 사화(四化) 해석
5. 현재 대한(大限) 운세
출력 형식: 항목 번호와 소제목 포함, 자연스러운 문단.`,

  natal: (lang, depth) => `
당신은 서양 점성술 전문가입니다.
아래 계산 결과에서 네이탈 차트 데이터를 찾아 심층 해석을 ${LANG_IN[lang] || '한국어로'} 작성하세요.
다음 항목을 각각 ${DEPTH_SENTENCES[depth]} 설명하세요:
1. 태양·달·상승궁 종합 (핵심 자아)
2. 주요 행성 배치와 하우스 의미
3. 주요 어스펙트 (각도) 해석
4. 심리·내면 성장 방향
5. 2026년 트랜짓 핵심
출력 형식: 항목 번호와 소제목 포함, 자연스러운 문단.`,

  love: (lang, depth) => `
당신은 사주명리·자미두수·서양 점성술 전문가입니다.
아래 계산 결과를 바탕으로 이 사람의 연애·결혼 운을 ${LANG_IN[lang] || '한국어로'} 통합 해석하세요.
다음 항목을 각각 ${DEPTH_SENTENCES[depth]} 설명하세요:
1. 사주에서 본 연애 스타일과 배우자 인연
2. 자미두수 부처궁에서 본 결혼 시기·상대
3. 점성술에서 본 이상형과 사랑의 패턴
4. 세 시스템 공통 메시지 및 조언
출력 형식: 항목 번호와 소제목 포함.`,

  career: (lang, depth) => `
당신은 사주명리·자미두수·서양 점성술 전문가입니다.
아래 계산 결과를 바탕으로 이 사람의 직업·재물 운을 ${LANG_IN[lang] || '한국어로'} 통합 해석하세요.
다음 항목을 각각 ${DEPTH_SENTENCES[depth]} 설명하세요:
1. 사주에서 본 적합 직업군과 재물 성향
2. 자미두수 관록궁·재백궁 분석
3. 점성술 10하우스와 재물 행성 분석
4. 구체적 커리어 전략과 재물 축적 방향
출력 형식: 항목 번호와 소제목 포함.`,

  year: (lang, depth) => `
당신은 사주명리·자미두수·서양 점성술 전문가입니다.
아래 계산 결과를 바탕으로 2026년 올해 운세를 ${LANG_IN[lang] || '한국어로'} 통합 분석하세요.
다음 항목을 각각 ${DEPTH_SENTENCES[depth]} 설명하세요:
1. 사주 2026 세운 분석
2. 자미두수 2026 유년 분석
3. 점성술 2026 트랜짓 핵심
4. 상반기(1~6월) 흐름
5. 하반기(7~12월) 흐름
6. 올해의 핵심 조언 3가지
출력 형식: 항목 번호와 소제목 포함.`,

  goonghap_ohaeng: (lang, depth) => `
당신은 사주명리학 전문가입니다.
아래 두 사람의 사주 일주(日柱) 정보와 오행 관계를 바탕으로 ${LANG_IN[lang] || '한국어로'} 심층 해석하세요.
${DEPTH_SENTENCES[depth]}.
다음을 반드시 포함하세요:
- 일간(日干) 오행 상생/상극/비화가 실제 관계에서 어떤 역학을 만드는가
- 일지(日支) 합·충 여부가 일상과 감정에 미치는 구체적 영향
- 두 기운이 만났을 때 생기는 시너지 또는 긴장감의 실체
출력 형식: 소제목 없이 자연스러운 문단 텍스트.`,

  goonghap_personality: (lang, depth) => `
당신은 사주명리학 전문가입니다.
아래 두 사람의 사주 일주(日柱) 정보를 바탕으로 성격 궁합을 ${LANG_IN[lang] || '한국어로'} 분석하세요.
${DEPTH_SENTENCES[depth]}.
다음을 반드시 포함하세요:
- 각자의 일간 기질이 상대방을 만나 어떻게 변화하거나 강화되는가
- 두 사람의 소통 방식·가치관에서 맞는 부분과 충돌하는 부분
- 함께 있을 때 자연스럽게 시너지가 나는 영역
출력 형식: 소제목 없이 자연스러운 문단 텍스트.`,

  goonghap_love: (lang, depth) => `
당신은 사주명리학 전문가입니다.
아래 두 사람의 사주 일주(日柱) 정보를 바탕으로 연애·감정 궁합을 ${LANG_IN[lang] || '한국어로'} 분석하세요.
${DEPTH_SENTENCES[depth]}.
다음을 반드시 포함하세요:
- 두 사람이 서로에게 끌리는 오행적 이유
- 감정을 표현하고 받아들이는 방식의 차이와 그 조화
- 이 관계에서 사랑이 만들어내는 고유한 분위기와 색깔
출력 형식: 소제목 없이 자연스러운 문단 텍스트.`,

  goonghap_conflict: (lang, depth) => `
당신은 사주명리학 전문가입니다.
아래 두 사람의 사주 일주(日柱) 정보를 바탕으로 갈등 포인트와 극복 방법을 ${LANG_IN[lang] || '한국어로'} 분석하세요.
${DEPTH_SENTENCES[depth]}.
다음을 반드시 포함하세요:
- 오행 관계에서 비롯되는 구조적 갈등의 원인
- 두 사람이 가장 자주 부딪히는 상황과 패턴
- 갈등을 건설적으로 해소하는 구체적이고 실용적인 방법
출력 형식: 소제목 없이 자연스러운 문단 텍스트.`,

  goonghap_future: (lang, depth) => `
당신은 사주명리학 전문가입니다.
아래 두 사람의 사주 일주(日柱) 정보와 궁합 분석을 바탕으로 장기 전망과 핵심 메시지를 ${LANG_IN[lang] || '한국어로'} 종합하세요.
${DEPTH_SENTENCES[depth]}.
다음을 반드시 포함하세요:
- 시간이 흐를수록 이 관계가 어떻게 성숙하거나 변화하는가
- 두 사람이 함께 성장하기 위해 가장 중요한 한 가지
- 이 인연에서 두 사람이 서로에게 줄 수 있는 최고의 것
마지막에 '▶ 인연의 핵심 메시지:' 뒤에 이 궁합을 한 문장으로 요약하여 마무리하세요.
출력 형식: 소제목 없이 자연스러운 문단 텍스트.`,

  overall: (lang, depth) => `
당신은 사주명리·자미두수·서양 점성술을 통합 해석하는 최고 전문가입니다.
아래 계산 결과를 바탕으로 세 시스템의 공통 메시지와 차이점을 찾아 인생 전체 흐름을 ${LANG_IN[lang] || '한국어로'} 종합 해석하세요.
다음 항목을 각각 ${DEPTH_SENTENCES[depth]} 설명하세요:
1. 세 시스템이 공통으로 가리키는 이 사람의 운명적 특성
2. 이 사람의 인생 핵심 테마와 사명
3. 타고난 강점과 보완해야 할 약점
4. 인생 전반 (0~40세) vs 후반 (40세~) 흐름
5. 개운(開運)을 위한 구체적 행동 지침
출력 형식: 항목 번호와 소제목 포함. 마지막에 '핵심 한마디'로 이 사람의 운명을 한 문장으로 요약.`,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('로그인이 필요합니다.');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('인증 실패. 다시 로그인해 주세요.');

    // 구독 확인
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle();

    const isActive = sub?.status === 'active' && new Date(sub.current_period_end) > new Date();
    if (!isActive) throw new Error('SUBSCRIPTION_REQUIRED');

    const { section, language, depth, sourceText } = await req.json();
    if (!section || !sourceText) throw new Error('필수 파라미터 누락');

    const promptFn = SECTION_PROMPT[section];
    if (!promptFn) throw new Error('알 수 없는 섹션: ' + section);

    const lang = language || 'ko';
    const systemPrompt = promptFn(lang, depth || 'standard') + langEnforce(lang);
    const userMessage = `아래는 계산된 사주·자미두수·점성술 데이터입니다. 이를 바탕으로 해석을 작성해 주세요.\n\n---\n${sourceText}\n---`;

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Anthropic API error: ${response.status}`);
    }

    const result = await response.json();
    const text = result.content?.[0]?.text || '';

    return new Response(JSON.stringify({ text, model: 'claude-sonnet-4-6' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const status = err.message === 'SUBSCRIPTION_REQUIRED' ? 402 : 400;
    return new Response(JSON.stringify({ error: err.message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
