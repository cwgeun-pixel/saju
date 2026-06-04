// Stripe Checkout 세션 생성 Edge Function
import Stripe from 'https://esm.sh/stripe@14?target=deno&no-check';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { user_id, email } = body;
    if (!user_id || !email) throw new Error('user_id, email 필수');

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const priceId  = Deno.env.get('STRIPE_PRICE_ID');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY not set');
    if (!priceId)   throw new Error('STRIPE_PRICE_ID not set');

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 기존 Stripe Customer 확인
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user_id)
      .maybeSingle();

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { user_id },
      });
      customerId = customer.id;
    }

    // Checkout 세션 생성
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'https://saju0523.pages.dev/dashboard.html?payment=success',
      cancel_url:  'https://saju0523.pages.dev/pricing.html?payment=canceled',
      metadata: { user_id },
      subscription_data: { metadata: { user_id } },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('create-checkout error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
