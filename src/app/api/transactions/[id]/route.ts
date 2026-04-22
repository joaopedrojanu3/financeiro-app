import { NextResponse, type NextRequest } from 'next/server'
import { createClient, getAuthorizedUserId } from '@/lib/supabase/server'

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getAuthorizedUserId(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const { id } = await context.params
        const body = await request.json()

        const updateData: any = {}
        if (body.description) updateData.description = body.description
        if (body.amount !== undefined) updateData.amount = body.amount
        if (body.type) updateData.type = body.type
        if (body.date) updateData.date = body.date
        if (body.category_id !== undefined) updateData.category_id = body.category_id
        if (body.status) updateData.status = body.status

        const { data, error } = await supabase
            .from('transactions')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single()

        if (error) {
            console.error('Supabase update error (PUT /transactions/[id]):', error)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({
            status: 'success',
            message: 'TRANSACTION_UPDATED',
            data: data
        }, { status: 200 })
    } catch (err) {
        console.error('API /transactions/[id] PUT error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getAuthorizedUserId(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const { id } = await context.params

        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id)
            .eq('user_id', userId)

        if (error) {
            console.error('Supabase delete error (DELETE /transactions/[id]):', error)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({
            status: 'success',
            message: 'TRANSACTION_DELETED',
            data: { id }
        }, { status: 200 })
    } catch (err) {
        console.error('API /transactions/[id] DELETE error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
