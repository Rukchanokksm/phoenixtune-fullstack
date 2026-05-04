import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

// Disable body parsing — Stripe needs the raw body to verify signature
export const dynamic = 'force-dynamic'

// ─── POST /api/webhooks/stripe ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let event: Stripe.Event

  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook verification failed'
    console.error('[Stripe Webhook] Signature verification failed:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  // Always return 200 after this point — even if we can't handle the event
  try {
    const supabase = await createClient()

    switch (event.type) {
      // ── Subscription created / payment succeeded ───────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId   = session.customer as string
        const customerEmail = session.customer_email ?? session.customer_details?.email

        if (!customerId) break

        // Find user by stripe_customer_id or email
        let userId: string | null = null

        const { data: byCustomer } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (byCustomer) {
          userId = byCustomer.id
        } else if (customerEmail) {
          // Fallback: match by auth email
          const { data: authUsers } = await supabase.auth.admin.listUsers()
          const match = authUsers?.users?.find((u) => u.email === customerEmail)
          if (match) userId = match.id
        }

        if (!userId) {
          console.warn('[Stripe Webhook] checkout.session.completed — user not found for customer:', customerId)
          break
        }

        // Get subscription end date from line items (or 30 days default)
        const subscription = session.subscription
          ? await stripe.subscriptions.retrieve(session.subscription as string)
          : null

        const premiumUntil = subscription
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

        await supabase
          .from('user_profiles')
          .update({
            is_premium:          true,
            premium_until:       premiumUntil,
            stripe_customer_id:  customerId,
          })
          .eq('id', userId)

        console.log('[Stripe Webhook] Premium activated for user:', userId, 'until:', premiumUntil)
        break
      }

      // ── Subscription cancelled ─────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId   = subscription.customer as string

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!profile) {
          console.warn('[Stripe Webhook] subscription.deleted — user not found for customer:', customerId)
          break
        }

        await supabase
          .from('user_profiles')
          .update({ is_premium: false, premium_until: null })
          .eq('id', profile.id)

        console.log('[Stripe Webhook] Premium cancelled for user:', profile.id)
        break
      }

      // ── Subscription renewed / updated ─────────────────────────────────
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId   = subscription.customer as string
        const isActive     = subscription.status === 'active'
        const premiumUntil = new Date(subscription.current_period_end * 1000).toISOString()

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!profile) break

        await supabase
          .from('user_profiles')
          .update({
            is_premium:    isActive,
            premium_until: isActive ? premiumUntil : null,
          })
          .eq('id', profile.id)

        console.log('[Stripe Webhook] Subscription updated for user:', profile.id, '| active:', isActive)
        break
      }

      default:
        // Unhandled event — log and continue
        console.log('[Stripe Webhook] Unhandled event type:', event.type)
    }
  } catch (err) {
    // Log but still return 200 so Stripe doesn't retry
    console.error('[Stripe Webhook] Handler error:', err)
  }

  return NextResponse.json({ received: true })
}
