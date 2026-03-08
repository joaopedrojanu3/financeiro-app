'use client'

import { useState, useEffect, useCallback } from 'react'
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

export function useTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true)
            const headers = getAdminHeaders()
            const response = await fetch('/api/transactions', { headers })
            if (!response.ok) throw new Error('Falha ao buscar transações')

            const result = await response.json()
            setTransactions(result.data || [])
            setError(null)
        } catch (err: unknown) {
            console.error('Error fetching transactions:', err)
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        // Carregamento inicial
        fetchTransactions()

        // Configuração do Supabase Realtime (Delta Zero Rule)
        // Qualquer alteração na tabela `transactions` invalida nosso state
        const channel = supabase
            .channel('public:transactions')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'transactions' },
                (payload) => {
                    console.log('Realtime Update Received!', payload)
                    // Recarrega as transações silenciosamente ou força um revalidate de rota (Next.js App Router)
                    fetchTransactions()
                    // Diz ao Next.js para reconstruir a página do servidor caso dependam de fetch revalidado
                    router.refresh()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchTransactions, router])

    const createTransaction = async (data: Partial<Transaction>) => {
        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: getAdminHeaders(),
                body: JSON.stringify(data)
            })

            if (!response.ok) throw new Error('Erro ao criar transação')

            // Não precisamos usar setTransactions(...) pois o Realtime + router.refresh farão o update oficial
            return await response.json()
        } catch (err) {
            throw err
        }
    }

    return {
        transactions,
        loading,
        error,
        createTransaction,
        refetch: fetchTransactions
    }
}
