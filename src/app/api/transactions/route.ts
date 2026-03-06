import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { revalidateTag } from 'next/cache'

// Delta Zero: Toda leitura deve vir diretamente do Supabase ou de cache validado por evento.
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 50

        // Busca todas as transações, ordenadas da mais recente para a mais antiga, incluíndo os dados da categoria relacionada
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
            .order('date', { ascending: false })
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
        console.error('API /transactions GET error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// Delta Zero: Toda mutação de dados deve passar pela API e ir pro banco (SSOT)
export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Validação mínima
        if (!body.description || !body.amount || !body.type || !body.date) {
            return NextResponse.json({ error: 'Faltam campos obrigatórios' }, { status: 400 })
        }

        // Insere a transação no banco (A Trigger do Supabase cria versão e timestamp)
        const { data, error } = await supabase
            .from('transactions')
            .insert({
                description: body.description,
                amount: body.amount,
                type: body.type,  // 'income' ou 'expense'
                date: body.date,
                category_id: body.category_id || null, // opcional
                status: body.status || 'completed'
            })
            .select()
            .single()

        if (error) {
            console.error('Supabase insert error (POST /transactions):', error)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        // Delta Zero: Após qualquer evento o sistema deve automaticamente invalidar caches do Next.js
        revalidateTag('transactions')

        // Em um sistema real, o evento global também seria disparado num webhook ou num sistema de Pub/Sub
        // Aqui o Supabase Realtime cuidará do frontend, enquanto revalidamos o cache da API/Server.

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
