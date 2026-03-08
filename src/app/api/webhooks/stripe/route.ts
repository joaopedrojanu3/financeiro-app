import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

// Instanciando Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-02-25.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
    try {
        const bodyText = await req.text()
        const signature = req.headers.get('stripe-signature') as string

        let event: Stripe.Event

        try {
            event = stripe.webhooks.constructEvent(bodyText, signature, webhookSecret)
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            console.error(`❌ Erro de Webhook:`, errorMessage)
            return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 })
        }

        // Regra Delta Zero: Operações CRUD via webhook -> Supabase
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                // Marcar usuário como Premium no BD oficial
                const { error } = await supabase
                    .from('profiles')
                    .update({ plan_type: 'premium', updated_at: new Date().toISOString() })
                    .eq('stripe_customer_id', session.customer) // Assumindo relação prévia

                if (error) {
                    console.error('SSOT Error Updating Profile:', error)
                    return NextResponse.json({ error: 'DB Sync Failed' }, { status: 500 })
                }
                break
            }
            case 'payment_intent.succeeded': {
                // Dispararia evento global: PAYMENT_CONFIRMED (Supabase Realtime / DB Triggers cuidarão disso)
                console.log('Payment Succeeded')
                break
            }
            case 'payment_intent.payment_failed': {
                // Dispararia evento global: PAYMENT_FAILED
                console.log('Payment Failed')
                break
            }
            default:
                console.log(`Unhandled event type ${event.type
                    }`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Unhandled Server Error Syncing Stripe:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
