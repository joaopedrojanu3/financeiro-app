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
    category_id?: string
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

    const skipOccurrence = async (id: string, dateStr: string) => {
        const res = await fetch(`/api/reminders/${id}`, {
            method: 'PATCH',
            headers: getAdminHeaders(),
            body: JSON.stringify({ occurrence_date: dateStr, action: 'skip' })
        })
        if (!res.ok) throw new Error('Erro ao pular/excluir parcela')
        refetchAll()
    }

    const deleteReminder = async (id: string) => {
        const res = await fetch(`/api/reminders/${id}`, {
            method: 'DELETE',
            headers: getAdminHeaders()
        })
        if (!res.ok) throw new Error('Erro ao excluir série')
        refetchAll()
    }

    const bulkSkipOccurrences = async (items: { id: string, occurrence_date: string }[]) => {
        const res = await fetch(`/api/reminders/bulk-delete`, {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify({ items })
        })
        if (!res.ok) throw new Error('Erro excluir parcelas lote')
        refetchAll()
    }

    const updateOccurrence = async (originalId: string, occurrenceDate: string, newData: any) => {
        // 1. Skip the original occurrence
        await skipOccurrence(originalId, occurrenceDate)

        // 2. Create a new single reminder for that specific modification
        const res = await fetch('/api/reminders', {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify({
                ...newData,
                dueDate: newData.dueDate || occurrenceDate, // use the provided date
                frequency: 'Único' // single occurrence replacing the specific month
            })
        })

        if (!res.ok) {
            const err = await res.json()
            throw new Error(err.error || 'Erro ao criar edição da parcela')
        }

        refetchAll()
    }

    return { 
        reminders: reminders || [], 
        payments: payments || [], 
        loading, 
        refetch: refetchAll, 
        isOccurrencePaid,
        skipOccurrence,
        deleteReminder,
        bulkSkipOccurrences,
        updateOccurrence
    }
}
