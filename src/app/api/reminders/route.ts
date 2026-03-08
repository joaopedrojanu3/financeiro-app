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
        const body = await req.json()
        const { description, amount, type, due_date, frequency, is_active, category_id, end_date } = body

        if (!description || !amount || !type || !due_date || !frequency) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const insertData: Record<string, unknown> = {
            description,
            amount,
            type,
            due_date,
            frequency,
            is_active,
            category_id,
            user_id: userId
        }

        if (end_date) {
            insertData.end_date = end_date
        }

        const { data, error } = await supabase
            .from('recurring_bills')
            .insert(insertData)
            .select()
            .single()

        if (error) {
            console.error('Supabase Error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        revalidatePath('/')

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        const userId = await getAuthorizedUserId(req)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('recurring_bills')
            .select('*, categories(*)')
            .eq('user_id', userId)
            .order('due_date', { ascending: true })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
