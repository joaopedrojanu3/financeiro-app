'use client'

import { UserCircle, Wallet, Tags, RefreshCw, Settings, FileText, Info, LogOut } from 'lucide-react'
import { clsx } from 'clsx'

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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
                    <h2 className="text-lg font-bold text-slate-900">Ricardo Almeida</h2>
                    <p className="text-sm text-slate-500">Plano Premium</p>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    <MenuItem icon={UserCircle} label="Perfil" />
                    <MenuItem icon={Wallet} label="Contas" isActive />
                    <MenuItem icon={Tags} label="Categorias" />
                    <MenuItem icon={RefreshCw} label="Moedas" />

                    <div className="h-px bg-slate-100 my-4 mx-3" />

                    <MenuItem icon={Settings} label="Configurações" />
                    <MenuItem icon={FileText} label="Exportar para CSV" />
                    <MenuItem icon={Info} label="Sobre" />
                </div>

                {/* Footer Logout */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                    <button className="flex w-full items-center gap-4 px-4 py-3 bg-white border border-slate-100 rounded-xl text-slate-900 font-semibold hover:bg-red-50 transition-colors">
                        <LogOut size={20} className="text-red-500" />
                        Sair da conta
                    </button>
                </div>
            </div>
        </>
    )
}

function MenuItem({ icon: Icon, label, isActive = false }: { icon: any, label: string, isActive?: boolean }) {
    return (
        <button className={clsx(
            "flex w-full items-center gap-4 px-4 py-3 rounded-xl transition-colors font-medium text-[15px]",
            isActive
                ? "bg-[#17B29F]/10 text-[#17B29F]"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        )}>
            <Icon size={22} className={isActive ? "text-[#17B29F]" : "text-slate-500"} />
            {label}
        </button>
    )
}
