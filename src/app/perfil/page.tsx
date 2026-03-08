'use client'

import { UserCircle, Shield, CreditCard, Bell, HelpCircle, LucideIcon } from 'lucide-react'

export default function ProfilePage() {
    return (
        <div className="flex flex-col w-full px-4 h-full pb-20 pt-6">

            {/* Header Profile Info */}
            <div className="flex flex-col items-center justify-center mb-10 w-full animate-fade-in">
                <div className="w-24 h-24 bg-[#17B29F] rounded-[2rem] flex items-center justify-center text-white mb-4 shadow-lg shadow-[#17B29F]/30 transform hover:scale-105 transition-transform">
                    <UserCircle size={56} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Ricardo Almeida</h2>
                <span className="bg-[#17B29F]/10 text-[#17B29F] border border-[#17B29F]/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mt-2">
                    Premium Plan
                </span>
            </div>

            {/* Opções de Perfil */}
            <div className="flex flex-col w-full gap-3">
                <ProfileOption icon={Shield} title="Meus Dados" desc="Informações pessoais e de conta" />
                <ProfileOption icon={CreditCard} title="Assinatura e Cobrança" desc="Gerenciar plano e integrações (Stripe)" />
                <ProfileOption icon={Bell} title="Notificações" desc="Alertas de metas e gastos" />
                <ProfileOption icon={HelpCircle} title="Ajuda e Suporte" desc="Fale com a equipe" />
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
            <div className="flex flex-col items-start">
                <span className="text-base font-bold text-slate-800">{title}</span>
                <span className="text-sm font-medium text-slate-400">{desc}</span>
            </div>
        </button>
    )
}
