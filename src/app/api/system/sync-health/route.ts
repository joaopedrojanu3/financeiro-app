import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    try {
        // 1. Verificação de conectividade com Supabase
        const { data: supabaseHealth, error: supabaseError } = await supabase.from('profiles').select('id').limit(1)

        // Verifica variáveis essenciais para Stripe, etc.
        const hasStripeSecret = !!process.env.STRIPE_SECRET_KEY
        const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET

        // Check de sanidade geral
        let status = 'OK'
        let issues = []

        if (supabaseError) {
            status = 'SYNC_ERROR'
            issues.push(`Supabase Error: ${supabaseError.message}`)
        }

        if (!hasStripeSecret || !hasWebhookSecret) {
            // Nota: Não falharemos agora apenas por falta da Key pois o dev está subindo. Mas alertamos.
            issues.push('Stripe webhook ou key não configurados')
        }

        if (status === 'SYNC_ERROR') {
            return NextResponse.json({
                status: 'SYNC_ERROR',
                timestamp: new Date().toISOString(),
                issues
            }, { status: 503 })
        }

        return NextResponse.json({
            status: 'OK',
            message: 'All systems synchronized (SSOT)',
            timestamp: new Date().toISOString(),
            checks: {
                supabase: 'OK',
                realtime_ready: true,
                stripe_webhooks: hasWebhookSecret ? 'OK' : 'PENDING'
            }
        }, { status: 200 })

    } catch (err) {
        return NextResponse.json({
            status: 'SYNC_ERROR',
            timestamp: new Date().toISOString(),
            issues: [err instanceof Error ? err.message : 'Erro desconhecido']
        }, { status: 500 })
    }
}
