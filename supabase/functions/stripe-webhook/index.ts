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

    // 결제 완료 → 구독 활성화
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
