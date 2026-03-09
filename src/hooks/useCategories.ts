import { useEffect } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { getAdminHeaders } from '@/lib/apiClient'

const supabase = createClient()

export interface Category {
    id: string
    name: string
    type: 'income' | 'expense'
    color: string
    icon: string
    show_on_dashboard: boolean
    created_at?: string
    updated_at?: string
}

const fetcher = async (url: string) => {
    const res = await fetch(url, { headers: getAdminHeaders() })
    const json = await res.json()
    return json.status === 'success' ? json.data : []
}

export function useCategories() {
    const { data: categories, isLoading: loading, mutate } = useSWR<Category[]>('/api/categories?limit=100', fetcher, {
        revalidateOnFocus: true,
        revalidateIfStale: true
    })

    useEffect(() => {
        // Realtime
        const channel = supabase.channel('public:categories')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'categories' },
                () => {
                    mutate()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [mutate])

    const toggleDashboardVisibility = async (id: string, currentVal: boolean) => {
        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: 'PUT',
                headers: getAdminHeaders(),
                body: JSON.stringify({ show_on_dashboard: !currentVal })
            })
            if (!res.ok) throw new Error('Failed to update')
            await mutate()
        } catch (error) {
            console.error('Error toggling category visibility', error)
        }
    }

    const deleteCategory = async (id: string) => {
        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
                headers: getAdminHeaders()
            })
            if (!res.ok) throw new Error('Failed to delete')
            await mutate()
        } catch (error) {
            console.error('Error deleting category', error)
        }
    }

    const createCategory = async (category: Partial<Category>) => {
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: getAdminHeaders(),
                body: JSON.stringify(category)
            })
            if (!res.ok) throw new Error('Failed to create')
            await mutate()
        } catch (error) {
            console.error('Error creating category', error)
        }
    }

    return {
        categories: categories || [],
        loading,
        toggleDashboardVisibility,
        deleteCategory,
        createCategory,
        refresh: mutate
    }
}
