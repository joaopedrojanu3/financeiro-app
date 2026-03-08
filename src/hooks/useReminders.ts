import { useState, useEffect, useCallback } from 'react'

export type Reminder = {
    id: string
    description: string
    amount: number
    type: 'income' | 'expense'
    due_date: string
    frequency: string
    is_active: boolean
    end_date?: string | null
    categories?: {
        name: string
        color: string
        icon: string
    } | null
}

export type BillPayment = {
    id: string
    recurring_bill_id: string
    occurrence_date: string
    paid_at: string
}

import { createClient } from '@/lib/supabase/client'
import { getAdminHeaders } from '@/lib/apiClient'

const supabase = createClient()

export function useReminders() {
    const [reminders, setReminders] = useState<Reminder[]>([])
    const [payments, setPayments] = useState<BillPayment[]>([])
    const [loading, setLoading] = useState(true)

    const fetchAll = async () => {
        setLoading(true)

        // Busca lembretes e pagamentos DE FORMA INDEPENDENTE
        // Se um falhar, o outro ainda funciona
        try {
            const headers = getAdminHeaders()
            const res = await fetch('/api/reminders', { headers })
            if (res.ok) {
                const data = await res.json()
                setReminders(data)
            }
        } catch (err) {
            console.error('Erro buscando lembretes:', err)
        }

        try {
            const headers = getAdminHeaders()
            const res = await fetch('/api/bill-payments', { headers })
            if (res.ok) {
                const data = await res.json()
                setPayments(data)
            }
        } catch (err) {
            // bill_payments pode não existir ainda (migration v4 pendente)
            console.warn('Tabela bill_payments indisponível:', err)
        }

        setLoading(false)
    }

    useEffect(() => {
        // eslint-disable-next-line
        fetchAll()

        // Realtime: escuta mudanças em recurring_bills E bill_payments
        const channel = supabase
            .channel('reminders-and-payments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'recurring_bills' }, () => fetchAll())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bill_payments' }, () => fetchAll())
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    // useCallback para estabilizar a referência da função no useMemo dos consumidores
    const isOccurrencePaid = useCallback((reminderId: string, occurrenceDate: string): boolean => {
        return payments.some(
            p => p.recurring_bill_id === reminderId && p.occurrence_date === occurrenceDate
        )
    }, [payments])

    return { reminders, payments, loading, refetch: fetchAll, isOccurrencePaid }
}
