import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { name, type, color, icon, show_on_dashboard } = body

        // Construir o objeto de update só com o que foi passado
        const updateData: Record<string, unknown> = {}
        if (name !== undefined) updateData.name = name
        if (type !== undefined) updateData.type = type
        if (color !== undefined) updateData.color = color
        if (icon !== undefined) updateData.icon = icon
        if (show_on_dashboard !== undefined) updateData.show_on_dashboard = show_on_dashboard

        const { data, error } = await supabase
            .from('categories')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Supabase query error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            status: 'success',
            data: data
        })

    } catch (err) {
        console.error('API /categories/[id] PUT error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ status: 'success' })
    } catch (err) {
        console.error('API /categories/[id] DELETE error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
