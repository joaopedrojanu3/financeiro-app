import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        // Usamos o Service Role Key para garantir a deleção sem problemas de RLS complexos,
        // mas APENAS para o user.id que está logado e autenticado acima.
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 1. Deletar todas as transações do usuário
        await supabaseAdmin.from('transactions').delete().eq('user_id', user.id)

        // 2. Deletar contas recorrentes/lembretes
        await supabaseAdmin.from('recurring_bills').delete().eq('user_id', user.id)

        // (Opcional) Podemos deletar metas de economia
        await supabaseAdmin.from('savings_goals').delete().eq('user_id', user.id)

        return NextResponse.json({ success: true, message: 'Conta zerada com sucesso!' })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
