import { useState, useEffect } from 'react'
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

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const headers = getAdminHeaders()
            const res = await fetch('/api/categories?limit=100', { headers })
            const json = await res.json()
            if (json.status === 'success') {
                setCategories(json.data)
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()

        // Realtime
        const channel = supabase.channel('public:categories')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'categories' },
                () => {
                    fetchCategories()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const toggleDashboardVisibility = async (id: string, currentVal: boolean) => {
        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: 'PUT',
                headers: getAdminHeaders(),
                body: JSON.stringify({ show_on_dashboard: !currentVal })
            })
            if (!res.ok) throw new Error('Failed to update')
            await fetchCategories()
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
            await fetchCategories()
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
            await fetchCategories()
        } catch (error) {
            console.error('Error creating category', error)
        }
    }

    return {
        categories,
        loading,
        toggleDashboardVisibility,
        deleteCategory,
        createCategory,
        refresh: fetchCategories
    }
}
