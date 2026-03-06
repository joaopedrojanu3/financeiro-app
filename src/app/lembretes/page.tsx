'use client'

import { useState } from 'react'
import { CalendarClock, Plus, Calendar as CalendarIcon, Wallet } from 'lucide-react'
import Link from 'next/link'
import { useReminders } from '@/hooks/useReminders'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import TabBar from '@/components/layout/TabBar'

export default function RemindersPage() {
    const { reminders, loading } = useReminders()
    const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all')

    const sortedReminders = [...reminders].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

    return (
        <div className="flex flex-col w-full h-full pb-24 items-center bg-slate-50/50 min-h-[calc(100vh-64px)] pt-16">

            {/* Header / Title */}
            <div className="w-full px-4 pt-4 pb-6 bg-white border-b border-slate-100 flex flex-col gap-1 shadow-sm">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Contas Futuras</h1>
                <p className="text-sm font-medium text-slate-400">Gerencie seus compromissos e lembretes financeiros.</p>
            </div>

            {/* Resumo Rápido */}
            <div className="w-full px-4 mt-6">
                <div className="flex w-full justify-between items-center bg-[#45D1C0] rounded-2xl p-5 shadow-lg shadow-[#45D1C0]/20 text-white relative overflow-hidden">
                    <div className="z-10 flex flex-col">
                        <span className="text-[10px] font-bold tracking-widest uppercase opacity-80 mb-1">Total Agendado</span>
                        <span className="text-3xl font-extrabold tracking-tight">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                reminders.filter(r => r.type === 'expense' && r.is_active).reduce((acc, r) => acc + r.amount, 0)
                            )}
                        </span>
                    </div>
                    <CalendarClock size={64} className="absolute -right-4 -bottom-4 opacity-10" />
                </div>
            </div>

            {/* Filtros em Pílulas */}
            <div className="w-full flex gap-2 px-4 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
                >
                    Todas Contas
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === 'pending' ? 'bg-[#F03D1A] text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
                >
                    A Pagar
                </button>
                <button
                    onClick={() => setFilter('paid')}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === 'paid' ? 'bg-[#17B29F] text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
                >
                    Receitas / Entradas
                </button>
            </div>

            {/* Lista Assíncrona de Lembretes */}
            <div className="w-full px-4 mt-4 flex flex-col gap-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-10 h-32 gap-3 opacity-50">
                        <div className="w-8 h-8 border-4 border-[#45D1C0] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : sortedReminders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center bg-white p-8 rounded-2xl border border-dashed border-slate-200 mt-4 text-center">
                        <CalendarIcon size={48} className="text-slate-200 mb-3" />
                        <h3 className="text-sm font-bold text-slate-700">Nenhum lembrete futuro</h3>
                        <p className="text-[11px] font-medium text-slate-400 mt-1">Crie um novo lançamento e ative o botão de agendamento.</p>
                    </div>
                ) : (
                    sortedReminders
                        .filter(r => {
                            if (filter === 'all') return true
                            if (filter === 'pending') return r.type === 'expense'
                            if (filter === 'paid') return r.type === 'income'
                            return true
                        })
                        .map((reminder) => (
                            <div key={reminder.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${reminder.type === 'expense' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                        {reminder.categories?.icon === 'wallet' ? <Wallet size={20} /> : <CalendarClock size={20} />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900">{reminder.description}</span>
                                        <span className="text-[11px] font-bold text-slate-500 uppercase flex flex-col">
                                            <span className="text-slate-400">Vence dia {format(parseISO(reminder.due_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`text-base font-extrabold ${reminder.type === 'expense' ? 'text-[#F03D1A]' : 'text-[#17B29F]'}`}>
                                        {reminder.type === 'expense' ? '-' : '+'} R$ {reminder.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-md mt-1">{reminder.frequency}</span>
                                </div>
                            </div>
                        ))
                )}
            </div>

            {/* Floating Action Button para Nova Conta */}
            <Link
                href="/lancamento/novo"
                className="fixed bottom-24 right-4 w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform z-40"
            >
                <Plus size={24} />
            </Link>

            <TabBar />
        </div>
    )
}
