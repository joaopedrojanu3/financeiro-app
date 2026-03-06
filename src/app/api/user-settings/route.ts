import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// GET: Retorna as metas do usuário
export async function GET() {
    try {
        // Pega o primeiro perfil (por enquanto sem auth multi-user)
        const { data, error } = await supabase
            .from('user_profiles')
            .select('monthly_spending_goal, monthly_income_goal')
            .limit(1)
            .single()

        if (error) {
            // Se não existir perfil, retorna defaults
            if (error.code === 'PGRST116') {
                return NextResponse.json({
                    monthly_spending_goal: 2000,
                    monthly_income_goal: 1500
                })
            }
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// PUT: Atualiza as metas do usuário
export async function PUT(req: Request) {
    try {
        const body = await req.json()
        const { monthly_spending_goal, monthly_income_goal } = body

        // Tenta atualizar o primeiro perfil existente
        const { data: existing } = await supabase
            .from('user_profiles')
            .select('id')
            .limit(1)
            .single()

        if (existing) {
            const { data, error } = await supabase
                .from('user_profiles')
                .update({ monthly_spending_goal, monthly_income_goal })
                .eq('id', existing.id)
                .select()
                .single()

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 })
            }
            return NextResponse.json(data)
        } else {
            // Cria um perfil novo se não existir
            const { data, error } = await supabase
                .from('user_profiles')
                .insert({
                    user_id: '00000000-0000-0000-0000-000000000000',
                    monthly_spending_goal,
                    monthly_income_goal
                })
                .select()
                .single()

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 })
            }
            return NextResponse.json(data)
        }
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
