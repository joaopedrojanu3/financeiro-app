import { NextResponse, type NextRequest } from 'next/server'
import { createClient, getAuthorizedUserId } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'

export async function GET(request: NextRequest) {
    try {
        const userId = await getAuthorizedUserId(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const { searchParams } = new URL(request.url)
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 50

        const { data, error } = await supabase
            .from('transactions')
            .select(`
                *,
                categories (
                    id,
                    name,
                    icon,
                    color,
                    type
                )
            `)
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Supabase query error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ status: 'success', data: data })
    } catch (err) {
        console.error('API /transactions GET error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const userId = await getAuthorizedUserId(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const body = await request.json()

        if (!body.description || !body.amount || !body.type || !body.date) {
            return NextResponse.json({ error: 'Faltam campos obrigatórios' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('transactions')
            .insert({
                description: body.description,
                amount: body.amount,
                type: body.type,
                date: body.date,
                category_id: body.category_id || null,
                status: body.status || 'completed',
                user_id: userId
            })
            .select()
            .single()

        if (error) {
            console.error('Supabase insert error (POST /transactions):', error)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        revalidateTag('transactions')

        return NextResponse.json({
            status: 'success',
            message: 'TRANSACTION_CREATED',
            data: data
        }, { status: 201 })
    } catch (err) {
        console.error('API /transactions POST error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
