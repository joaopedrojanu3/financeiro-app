import { NextResponse, type NextRequest } from 'next/server'
import { createClient, getAuthorizedUserId } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const userId = await getAuthorizedUserId(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const { searchParams } = new URL(request.url)
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 100

        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', userId)
            .order('type', { ascending: false })
            .order('name', { ascending: true })
            .limit(limit)

        if (error) {
            console.error('Supabase query error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ status: 'success', data: data })
    } catch (err) {
        console.error('API /categories GET error:', err)
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
        const { name, type, color, icon, show_on_dashboard } = body

        if (!name || !type) {
            return NextResponse.json({ error: 'Name and type are required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('categories')
            .insert({
                name,
                type,
                color: color || (type === 'income' ? '#17B29F' : '#F03D1A'),
                icon: icon || 'tag',
                show_on_dashboard: show_on_dashboard ?? false,
                user_id: userId
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ status: 'success', data })
    } catch (err) {
        console.error('API /categories POST error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
