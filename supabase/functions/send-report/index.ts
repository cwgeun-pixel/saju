// 전체 AI 해석 결과를 이메일로 발송하는 Edge Function (유료 회원 전용)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SECTION_LABELS: Record<string, Record<string, string>> = {
  personality: { ko: '기본 성향',    en: 'Personality',      ja: '基本性格',      zh: '基本性格',   es: 'Personalidad'        },
  saju:        { ko: '사주 심층',    en: 'Saju',              ja: '四柱詳細',      zh: '四柱深層',   es: 'Saju'                },
  ziwei:       { ko: '자미두수 심층', en: 'Ziwei Doushu',     ja: '紫微斗數詳細',  zh: '紫微斗數深層', es: 'Ziwei Doushu'      },
  natal:       { ko: '점성술 심층',  en: 'Natal Astrology',   ja: '西洋占星術詳細', zh: '占星術深層', es: 'Astrología Natal'    },
  love:        { ko: '연애와 결혼',  en: 'Love & Marriage',   ja: '恋愛と結婚',    zh: '愛情婚姻',   es: 'Amor y Matrimonio'   },
  career:      { ko: '직업과 재물',  en: 'Career & Wealth',   ja: '仕事と財運',    zh: '職業財富',   es: 'Carrera y Riqueza'   },
  year:        { ko: '올해 운세',    en: 'Annual Flow',       ja: '今年の運勢',    zh: '今年運勢',   es: 'Flujo Anual'         },
  overall:     { ko: '세 가지 종합', en: 'Synthesis',         ja: '総合解釈',      zh: '三系綜合',   es: 'Síntesis'            },
};

const EMAIL_TITLES: Record<string, string> = {
  ko: 'Trinity of Destiny — 전체 운세 해석 보고서',
  ja: 'Trinity of Destiny — 総合運命解釈レポート',
  zh: 'Trinity of Destiny — 完整命運解讀報告',
  es: 'Trinity of Destiny — Informe Completo de Destino',
  en: 'Trinity of Destiny — Complete Destiny Interpretation Report',
};

function buildHtmlEmail(
  interpretations: Array<{ section: string; text: string }>,
  lang: string,
  userEmail: string,
): string {
  const sectionHtml = interpretations.map(({ section, text }) => {
    const sectionLabel = SECTION_LABELS[section]?.[lang] || SECTION_LABELS[section]?.en || section;
    const formattedText = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return `
      <div style="margin-bottom:32px;padding-bottom:32px;border-bottom:1px solid #1e2140;">
        <h2 style="color:#f59e0b;font-size:16px;margin:0 0 12px;font-family:Georgia,serif;letter-spacing:0.5px;">
          ✦ ${sectionLabel}
        </h2>
        <p style="color:#c8ccd8;font-size:15px;line-height:1.9;margin:0;">${formattedText}</p>
      </div>`;
  }).join('');

  const title = EMAIL_TITLES[lang] || EMAIL_TITLES.en;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="background:#07091a;color:#c8ccd8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:20px 0;">
  <div style="max-width:680px;margin:0 auto;">

    <!-- 헤더 -->
    <div style="background:linear-gradient(160deg,#1a1d35 0%,#0d102a 100%);border-radius:12px 12px 0 0;padding:40px 32px;text-align:center;border:1px solid #1e2140;border-bottom:none;">
      <p style="color:#f59e0b;font-size:11px;letter-spacing:4px;margin:0 0 10px;text-transform:uppercase;">Trinity of Destiny</p>
      <h1 style="color:#e8e9f0;font-size:22px;margin:0;font-family:Georgia,serif;font-weight:normal;">${title}</h1>
    </div>

    <!-- 본문 -->
    <div style="background:#12152a;border:1px solid #1e2140;border-top:none;border-bottom:none;padding:36px 32px;">
      ${sectionHtml}
      <div style="text-align:center;padding-top:8px;">
        <a href="https://saju0523.pages.dev/app/"
           style="display:inline-block;background:#f59e0b;color:#07091a;text-decoration:none;font-size:13px;font-weight:600;padding:10px 24px;border-radius:6px;letter-spacing:0.5px;">
          사이트에서 다시 보기 →
        </a>
      </div>
    </div>

    <!-- 푸터 -->
    <div style="background:#0a0d1a;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;border:1px solid #1e2140;border-top:none;">
      <p style="color:#3a3f58;font-size:12px;margin:0;line-height:1.6;">
        saju0523.pages.dev &nbsp;·&nbsp; ${userEmail}<br>
        본 해석은 전통적·상징적 참고 자료이며, 중요한 결정에 단독으로 사용하지 마십시오.
      </p>
    </div>

  </div>
</body>
</html>`;
}

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

    const { interpretations, language } = await req.json();
    if (!Array.isArray(interpretations) || interpretations.length === 0) {
      throw new Error('해석 데이터가 없습니다.');
    }

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) throw new Error('RESEND_API_KEY not set');

    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@saju0523.com';
    const lang = language || 'ko';
    const html = buildHtmlEmail(interpretations, lang, user.email || '');
    const subject = EMAIL_TITLES[lang] || EMAIL_TITLES.en;

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: user.email,
        subject,
        html,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.json().catch(() => ({}));
      throw new Error(err.message || `Resend API error: ${emailRes.status}`);
    }

    return new Response(JSON.stringify({ sent: true }), {
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
