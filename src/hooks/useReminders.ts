import { useEffect, useCallback } from 'react'
import useSWR from 'swr'

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

const fetcher = async (url: string) => {
    const res = await fetch(url, { headers: getAdminHeaders() })
    if (!res.ok) throw new Error('Falha ao fecth data')
    return await res.json()
}

export function useReminders() {
    const { data: reminders, mutate: mutateReminders, isLoading: loadingRems } = useSWR<Reminder[]>('/api/reminders', fetcher, { revalidateOnFocus: true, revalidateIfStale: true })
    const { data: payments, mutate: mutatePayments, isLoading: loadingPays } = useSWR<BillPayment[]>('/api/bill-payments', fetcher, { revalidateOnFocus: true, revalidateIfStale: true })

    const loading = loadingRems || loadingPays

    useEffect(() => {
        // Realtime: escuta mudanças em recurring_bills E bill_payments
        const channel = supabase
            .channel('reminders-and-payments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'recurring_bills' }, () => mutateReminders())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bill_payments' }, () => mutatePayments())
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [mutateReminders, mutatePayments])

    // useCallback para estabilizar a referência da função no useMemo dos consumidores
    const isOccurrencePaid = useCallback((reminderId: string, occurrenceDate: string): boolean => {
        if (!payments) return false
        return payments.some(
            p => p.recurring_bill_id === reminderId && p.occurrence_date === occurrenceDate
        )
    }, [payments])

    const refetchAll = () => {
        mutateReminders()
        mutatePayments()
    }

    return { reminders: reminders || [], payments: payments || [], loading, refetch: refetchAll, isOccurrencePaid }
}
