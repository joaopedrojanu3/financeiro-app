import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// Inicializa Supabase service role para bypass RLS nas APIs seguras
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { description, amount, type, due_date, frequency, is_active, category_id } = body

        // Validação Mínima
        if (!description || !amount || !type || !due_date || !frequency) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Delta Zero: Insert on SSOT
        const { data, error } = await supabase
            .from('recurring_bills')
            .insert({
                description,
                amount,
                type,
                due_date,
                frequency,
                is_active,
                category_id
            })
            .select()
            .single()

        if (error) {
            console.error('Supabase Error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Invalida cache da home
        revalidatePath('/')

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('recurring_bills')
            .select('*, categories(*)')
            .order('due_date', { ascending: true })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
