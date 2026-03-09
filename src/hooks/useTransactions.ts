'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { getAdminHeaders } from '@/lib/apiClient'
import { useRouter } from 'next/navigation'

const supabase = createClient()

export interface Category {
    id: string
    name: string
    icon: string
    color: string
    type: 'income' | 'expense'
}

export interface Transaction {
    id: string
    description: string
    amount: number
    type: 'income' | 'expense'
    date: string
    category_id: string | null
    status: 'pending' | 'completed' | 'cancelled'
    categories?: Category
}

const fetcher = async (url: string) => {
    const res = await fetch(url, { headers: getAdminHeaders() })
    if (!res.ok) throw new Error('Falha ao buscar transações')
    const json = await res.json()
    return json.data || []
}

export function useTransactions() {
    const router = useRouter()
    const { data: transactions, error, isLoading: loading, mutate } = useSWR<Transaction[]>('/api/transactions', fetcher, {
        revalidateOnFocus: true,
        revalidateIfStale: true
    })

    useEffect(() => {
        // Configuração do Supabase Realtime (Delta Zero Rule)
        const channel = supabase
            .channel('public:transactions')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'transactions' },
                () => {
                    mutate() // Invalida o cache do SWR localmente e re-busca
                    router.refresh() // Atualiza rota do Server Components se houver
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [mutate, router])

    const createTransaction = async (data: Partial<Transaction>) => {
        const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify(data)
        })

        if (!response.ok) throw new Error('Erro ao criar transação')
        return await response.json()
    }

    return {
        transactions: transactions || [],
        loading,
        error: error ? error.message : null,
        createTransaction,
        refetch: mutate
    }
}
