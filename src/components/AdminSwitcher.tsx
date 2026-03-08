'use client'

import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'

type UserProfile = {
    id: string
    user_id: string
    full_name: string
    company_name: string | null
    is_admin: boolean
}

export default function AdminSwitcher() {
    const [users, setUsers] = useState<UserProfile[]>([])
    const [selectedUserId, setSelectedUserId] = useState<string>('')
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        // Fetch users (só funciona se o usuário logado for admin)
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/system/users')
                if (res.ok) {
                    const data = await res.json()
                    setUsers(data)
                    setIsAdmin(true)

                    const stored = localStorage.getItem('selected_custom_user_id')
                    if (stored) {
                        setSelectedUserId(stored)
                    }
                }
            } catch (err) {
                console.error("Erro ao buscar usuários pro admin switcher", err)
            }
        }
        fetchUsers()
    }, [])

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        setSelectedUserId(val)

        if (val) {
            localStorage.setItem('selected_custom_user_id', val)
        } else {
            localStorage.removeItem('selected_custom_user_id')
        }

        // Recarrega a página para reler os dados de todas as APIs
        window.location.reload()
    }

    if (!isAdmin || users.length === 0) return null

    return (
        <div className="mx-4 mt-6 mb-2 p-3 bg-slate-100 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2 text-slate-700">
                <Users size={16} />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Super Admin</span>
            </div>

            <select
                value={selectedUserId}
                onChange={handleSelect}
                className="w-full bg-white border border-slate-200 text-sm font-semibold text-slate-700 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[#17B29F]/20"
            >
                <option value="">Minha Conta (Padrão)</option>
                <optgroup label="Contas Familiares">
                    {users.map(u => (
                        <option key={u.user_id} value={u.user_id}>
                            {u.full_name || 'Usuário sem nome'} {u.is_admin ? '(Admin)' : ''}
                        </option>
                    ))}
                </optgroup>
            </select>
        </div>
    )
}
