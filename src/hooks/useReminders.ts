import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export type Reminder = {
    id: string
    description: string
    amount: number
    type: 'income' | 'expense'
    due_date: string
    frequency: string
    is_active: boolean
    categories?: {
        name: string
        color: string
        icon: string
    } | null
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export function useReminders() {
    const [reminders, setReminders] = useState<Reminder[]>([])
    const [loading, setLoading] = useState(true)

    const fetchReminders = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/reminders')
            if (!response.ok) throw new Error('Falha ao buscar lembretes')
            const data = await response.json()
            setReminders(data)
        } catch (error) {
            console.error('Erro buscando Lembretes:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Delta Zero SSOT: Carga inicial do banco
        fetchReminders()

        // Inscreve no canal realtime para ser reativo
        const subscription = supabase
            .channel('public:recurring_bills')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'recurring_bills' }, payload => {
                console.log('Realtime Lembretes Mudança:', payload)
                fetchReminders()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [])

    return { reminders, loading, refetch: fetchReminders }
}
