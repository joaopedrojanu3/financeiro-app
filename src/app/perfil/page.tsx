'use client'

import { UserCircle, Shield, HelpCircle, LucideIcon, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getAdminHeaders } from '@/lib/apiClient'

export default function ProfilePage() {
    const [userName, setUserName] = useState('Buscando...')
    const [isResetting, setIsResetting] = useState(false)

    useEffect(() => {
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
                setUserName('Usuário Família')
            }
        }
        fetchUser()
    }, [])

    const handleResetData = async () => {
        if (!confirm("Tem certeza absoluta? Isso apagará TODAS as suas transações e contas recorrentes para limpar o sistema.\n\nSim, eu quero começar do zero.")) return;

        setIsResetting(true)
        try {
            const res = await fetch('/api/admin/reset', { method: 'POST' })
            if (res.ok) {
                alert('Sua conta foi zerada com sucesso! O aplicativo será recarregado.')
                window.location.href = '/'
            } else {
                const err = await res.json()
                alert(`Erro ao tentar zerar: ${err.error}`)
            }
        } catch (error) {
            alert('Não foi possível conectar ao servidor para zerar os dados.')
        } finally {
            setIsResetting(false)
        }
    }

    return (
        <div className="flex flex-col w-full px-4 h-full pb-20 pt-6">

            {/* Header Profile Info */}
            <div className="flex flex-col items-center justify-center mb-10 w-full animate-fade-in">
                <div className="w-24 h-24 bg-[#17B29F] rounded-[2rem] flex items-center justify-center text-white mb-4 shadow-lg shadow-[#17B29F]/30 transform hover:scale-105 transition-transform">
                    <UserCircle size={56} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">{userName}</h2>
            </div>

            {/* Opções de Perfil */}
            <div className="flex flex-col w-full gap-3">
                <ProfileOption icon={Shield} title="Meus Dados" desc="Informações pessoais e de conta" />
                <ProfileOption icon={HelpCircle} title="Ajuda e Suporte" desc="Fale com a equipe" />

                <button
                    onClick={handleResetData}
                    disabled={isResetting}
                    className="flex items-center w-full p-4 bg-red-50 border border-red-100/50 rounded-2xl shadow-sm hover:shadow-md hover:border-red-300 transition-all group mt-6 text-left"
                >
                    <div className="w-12 h-12 bg-red-100 group-hover:bg-red-200/50 rounded-xl flex items-center justify-center mr-4 transition-colors">
                        <Trash2 size={24} className="text-red-400 group-hover:text-red-600 transition-colors" />
                    </div>
                    <div className="flex flex-col items-start flex-1 cursor-pointer">
                        <span className="text-base font-bold text-red-600">
                            {isResetting ? 'Zerando Conta...' : 'Zerar Dados de Teste'}
                        </span>
                        <span className="text-sm font-medium text-red-400">
                            Apagar todas as transações e limpar conta
                        </span>
                    </div>
                </button>
            </div>

        </div>
    )
}

function ProfileOption({ icon: Icon, title, desc }: { icon: LucideIcon, title: string, desc: string }) {
    return (
        <button className="flex items-center w-full p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-[#45D1C0]/30 transition-all group">
            <div className="w-12 h-12 bg-slate-50 group-hover:bg-[#45D1C0]/10 rounded-xl flex items-center justify-center mr-4 transition-colors">
                <Icon size={24} className="text-slate-400 group-hover:text-[#17B29F] transition-colors" />
            </div>
            <div className="flex flex-col items-start cursor-pointer">
                <span className="text-base font-bold text-slate-800">{title}</span>
                <span className="text-sm font-medium text-slate-400">{desc}</span>
            </div>
        </button>
    )
}
