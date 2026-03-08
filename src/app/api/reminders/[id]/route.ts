import { NextResponse, type NextRequest } from 'next/server'
import { createClient, getAuthorizedUserId } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getAuthorizedUserId(req)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()

        const { id } = await context.params
        const body = await req.json().catch(() => ({}))
        const { occurrence_date } = body

        const { data: reminder, error: fetchErr } = await supabase
            .from('recurring_bills')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single()

        if (fetchErr || !reminder) {
            return NextResponse.json({ error: 'Lembrete não encontrado' }, { status: 404 })
        }

        if (occurrence_date) {
            const { data: existing } = await supabase
                .from('bill_payments')
                .select('id')
                .eq('recurring_bill_id', id)
                .eq('occurrence_date', occurrence_date)
                .single()

            if (existing) {
                return NextResponse.json({ error: 'Esta parcela já foi paga.' }, { status: 400 })
            }
        }

        const { error: txErr } = await supabase
            .from('transactions')
            .insert({
                description: `[PAGO] ${reminder.description}`,
                amount: reminder.amount,
                type: reminder.type,
                date: occurrence_date || new Date().toISOString().split('T')[0],
                category_id: reminder.category_id,
                status: 'completed',
                user_id: userId
            })

        if (txErr) {
            console.error('Erro ao criar transação:', txErr)
            return NextResponse.json({ error: txErr.message }, { status: 500 })
        }

        const { error: payErr } = await supabase
            .from('bill_payments')
            .insert({
                recurring_bill_id: id,
                occurrence_date: occurrence_date || new Date().toISOString().split('T')[0],
                user_id: userId
            })

        if (payErr) {
            console.error('Erro ao registrar pagamento:', payErr)
            return NextResponse.json({ error: payErr.message }, { status: 500 })
        }

        revalidatePath('/')
        revalidatePath('/lembretes')

        return NextResponse.json({ success: true, message: 'Parcela marcada como paga e transação criada.' })
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
