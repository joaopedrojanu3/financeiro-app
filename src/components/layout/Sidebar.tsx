'use client'

import { UserCircle, Wallet, Tags, RefreshCw, Settings, FileText, Info, LogOut, PiggyBank, LucideIcon, List } from 'lucide-react'
import { clsx } from 'clsx'
import Link from 'next/link'
import AdminSwitcher from '../AdminSwitcher'
import { logout } from '@/app/auth/actions'
import { useState, useEffect } from 'react'
import { getAdminHeaders } from '@/lib/apiClient'

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const [userName, setUserName] = useState('Buscando...')

    useEffect(() => {
        if (!isOpen) return;

        async function fetchUser() {
            try {
                const res = await fetch('/api/user-settings', {
                    headers: getAdminHeaders()
                })
                if (res.ok) {
                    const data = await res.json()
                    setUserName(data.full_name || 'Usuário Família')
                } else {
                    setUserName('Usuário Família')
                }
            } catch (err) {
                console.error("Erro ao buscar dados do usuário", err)
                setUserName('Usuário Família')
            }
        }

        fetchUser()
    }, [isOpen])

    return (
        <>
            {/* Overlay Escuro */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 z-50 max-w-md transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div
                className={clsx(
                    "fixed top-0 left-0 h-full w-[80%] max-w-[320px] bg-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Profile Info */}
                <div className="p-6 pt-12 border-b border-slate-100">
                    <div className="w-16 h-16 bg-[#17B29F] rounded-2xl flex items-center justify-center text-white mb-4 shadow-sm">
                        <UserCircle size={40} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 line-clamp-1">{userName}</h2>
                </div>

                {/* Switcher do Super Admin (Aparece só se for admin) */}
                <AdminSwitcher />

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    <MenuItem icon={UserCircle} label="Perfil" href="/perfil" onClick={onClose} />
                    <MenuItem icon={Wallet} label="Contas" href="/" isActive onClick={onClose} />
                    <MenuItem icon={PiggyBank} label="Quero Guardar" href="/objetivos" onClick={onClose} />
                    <MenuItem icon={Tags} label="Categorias" href="/categorias" onClick={onClose} />
                    <MenuItem icon={List} label="Extrato Detalhado" href="/extrato-detalhado" onClick={onClose} />
                </div>

                {/* Footer Logout */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                    <form action={logout}>
                        <button type="submit" className="flex w-full items-center gap-4 px-4 py-3 bg-white border border-slate-100 rounded-xl text-slate-900 font-semibold hover:bg-red-50 transition-colors cursor-pointer">
                            <LogOut size={20} className="text-red-500" />
                            Sair da conta
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

function MenuItem({ icon: Icon, label, href = "#", isActive = false, onClick }: { icon: LucideIcon, label: string, href?: string, isActive?: boolean, onClick?: () => void }) {
    return (
        <Link href={href} onClick={onClick} className={clsx(
            "flex w-full items-center gap-4 px-4 py-3 rounded-xl transition-colors font-medium text-[15px]",
            isActive
                ? "bg-[#17B29F]/10 text-[#17B29F]"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        )}>
            <Icon size={22} className={isActive ? "text-[#17B29F]" : "text-slate-500"} />
            {label}
        </Link>
    )
}
