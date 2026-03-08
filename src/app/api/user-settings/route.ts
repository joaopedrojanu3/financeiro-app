import { NextResponse, type NextRequest } from 'next/server'
import { createClient, getAuthorizedUserId } from '@/lib/supabase/server'

// GET: Retorna as metas do usuário
export async function GET(req: NextRequest) {
    try {
        const userId = await getAuthorizedUserId(req)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('user_profiles')
            .select('monthly_spending_goal, monthly_income_goal, show_savings_goal_on_dashboard, full_name, company_name, is_admin')
            .eq('user_id', userId)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({
                    monthly_spending_goal: 0,
                    monthly_income_goal: 1500,
                    show_savings_goal_on_dashboard: true,
                    full_name: null,
                    company_name: null,
                    is_admin: false
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
export async function PUT(req: NextRequest) {
    try {
        const userId = await getAuthorizedUserId(req)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const body = await req.json()
        const { monthly_spending_goal, monthly_income_goal, show_savings_goal_on_dashboard, full_name, company_name } = body

        const { data: existing } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', userId)
            .single()

        if (existing) {
            const { data, error } = await supabase
                .from('user_profiles')
                .update({ monthly_spending_goal, monthly_income_goal, show_savings_goal_on_dashboard, full_name, company_name })
                .eq('id', existing.id)
                .select()
                .single()

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 })
            }
            return NextResponse.json(data)
        } else {
            const { data, error } = await supabase
                .from('user_profiles')
                .insert({
                    user_id: userId,
                    monthly_spending_goal,
                    monthly_income_goal,
                    show_savings_goal_on_dashboard,
                    full_name,
                    company_name
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
