import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 50

        // Busca categorias
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .limit(limit)

        if (error) {
            console.error('Supabase query error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            status: 'success',
            data: data
        })

    } catch (err) {
        console.error('API /categories GET error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
