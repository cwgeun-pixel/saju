// Stripe Webhook 처리 Edge Function
import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });

  const body = await req.text();

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2024-11-20.acacia',
  });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  switch (event.type) {

    // 결제 완료 → 구독 활성화 + 웰컴 이메일
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const subscriptionId = session.subscription as string;
      if (!userId || !subscriptionId) break;

      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      await supabase.from('subscriptions').upsert({
        user_id:                 userId,
        stripe_customer_id:      session.customer as string,
        stripe_subscription_id:  subscriptionId,
        stripe_price_id:         sub.items.data[0].price.id,
        status:                  sub.status,
        current_period_start:    new Date(sub.current_period_start * 1000).toISOString(),
        current_period_end:      new Date(sub.current_period_end   * 1000).toISOString(),
        cancel_at_period_end:    sub.cancel_at_period_end,
      }, { onConflict: 'user_id' });

      // 웰컴 이메일 — RESEND_API_KEY가 설정된 경우에만 발송
      const resendKey = Deno.env.get('RESEND_API_KEY');
      const customerEmail = session.customer_details?.email || session.customer_email;
      if (resendKey && customerEmail) {
        const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@saju0523.com';
        const welcomeHtml = `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="background:#07091a;color:#c8ccd8;font-family:-apple-system,sans-serif;margin:0;padding:20px 0;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:linear-gradient(160deg,#1a1d35,#0d102a);border-radius:12px 12px 0 0;padding:40px 32px;text-align:center;border:1px solid #1e2140;border-bottom:none;">
      <p style="color:#f59e0b;font-size:11px;letter-spacing:4px;margin:0 0 10px;text-transform:uppercase;">Trinity of Destiny</p>
      <h1 style="color:#e8e9f0;font-size:22px;margin:0;font-family:Georgia,serif;font-weight:normal;">프리미엄 멤버십에 오신 것을 환영합니다 ✦</h1>
    </div>
    <div style="background:#12152a;border:1px solid #1e2140;border-top:none;border-bottom:none;padding:36px 32px;">
      <p style="line-height:1.9;margin:0 0 24px;">안녕하세요.<br>Trinity of Destiny 프리미엄 멤버가 되셨습니다.</p>
      <p style="line-height:1.9;margin:0 0 24px;">이제 <strong style="color:#f59e0b;">AI 전체 해석 자동 생성</strong> 기능을 이용하실 수 있습니다.<br>계산기에서 생년월일시를 입력하고 <strong style="color:#f59e0b;">⭐ 전체 해석 자동 생성</strong> 버튼을 누르면<br>사주·자미두수·점성술 8개 섹션의 심층 해석을 한 번에 받으실 수 있습니다.</p>
      <p style="line-height:1.9;margin:0 0 32px;">해석이 완료되면 <strong style="color:#f59e0b;">📧 이메일로 받기</strong> 버튼으로 보고서를 이메일로도 받아보실 수 있습니다.</p>
      <div style="text-align:center;">
        <a href="https://saju0523.pages.dev/app/"
           style="display:inline-block;background:#f59e0b;color:#07091a;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:6px;letter-spacing:0.5px;">
          계산기 바로가기 →
        </a>
      </div>
    </div>
    <div style="background:#0a0d1a;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;border:1px solid #1e2140;border-top:none;">
      <p style="color:#3a3f58;font-size:12px;margin:0;">saju0523.pages.dev &nbsp;·&nbsp; ${customerEmail}</p>
    </div>
  </div>
</body>
</html>`;
        // 이메일 실패가 webhook 처리 전체를 막지 않도록 catch
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: fromEmail,
            to: customerEmail,
            subject: 'Trinity of Destiny 프리미엄 멤버십에 오신 것을 환영합니다 ✦',
            html: welcomeHtml,
          }),
        }).catch((_e) => {});
      }
      break;
    }

    // 구독 갱신/변경
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      await supabase.from('subscriptions')
        .update({
          status:               sub.status,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end:   new Date(sub.current_period_end   * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
        })
        .eq('stripe_customer_id', sub.customer as string);
      break;
    }

    // 구독 취소
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await supabase.from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_customer_id', sub.customer as string);
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
