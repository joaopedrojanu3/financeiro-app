import { NextResponse, type NextRequest } from 'next/server'
import { createClient, getAuthorizedUserId } from '@/lib/supabase/server'

// GET: Retorna todos os pagamentos individuais registrados
export async function GET(req: NextRequest) {
    try {
        const userId = await getAuthorizedUserId(req)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('bill_payments')
            .select('*')
            .eq('user_id', userId)
            .order('occurrence_date', { ascending: true })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const userId = await getAuthorizedUserId(req)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const body = await req.json()
        const { recurring_bill_id, occurrence_date } = body

        if (!recurring_bill_id || !occurrence_date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const { error } = await supabase
            .from('bill_payments')
            .delete()
            .eq('recurring_bill_id', recurring_bill_id)
            .eq('occurrence_date', occurrence_date)
            .eq('user_id', userId)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Pagamento desfeito com sucesso.' })
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
