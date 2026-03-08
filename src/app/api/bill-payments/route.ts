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
