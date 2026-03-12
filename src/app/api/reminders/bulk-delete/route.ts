import { NextResponse, type NextRequest } from 'next/server'
import { createClient, getAuthorizedUserId } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
    try {
        const userId = await getAuthorizedUserId(req)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const body = await req.json().catch(() => ({}))
        const { items } = body // Expected: Array of { id: string, occurrence_date: string }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Nenhum item válido fornecido.' }, { status: 400 })
        }

        // We use bulk insert into bill_payments to "skip" or mark them as hidden
        const recordsToInsert = items.map(item => ({
            recurring_bill_id: item.id,
            occurrence_date: item.occurrence_date,
            user_id: userId
        }))

        const { error: payErr } = await supabase
            .from('bill_payments')
            .upsert(recordsToInsert, { onConflict: 'recurring_bill_id, occurrence_date' })

        if (payErr) {
            console.error('Erro ao excluir parcelas em lote:', payErr)
            return NextResponse.json({ error: payErr.message }, { status: 500 })
        }

        revalidatePath('/')
        revalidatePath('/lembretes')

        return NextResponse.json({ success: true, message: 'Parcelas excluídas com sucesso.' })
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
