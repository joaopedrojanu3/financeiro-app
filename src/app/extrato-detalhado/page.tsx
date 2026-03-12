'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Tag, Utensils, Home, Car, Receipt, HeartPulse, ShoppingBag, PiggyBank, Briefcase, Building, Smartphone, Dumbbell, Plane, Coffee, Music, Book, Gift, Wrench, Scissors, Monitor, Truck, Zap, Camera, Umbrella, LucideIcon, ChevronDown, ChevronRight } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { isThisMonth, parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import EditTransactionSheet from '@/components/EditTransactionSheet'

const iconMap: Record<string, LucideIcon> = {
    tag: Tag,
    utensils: Utensils,
    home: Home,
    car: Car,
    receipt: Receipt,
    'heart-pulse': HeartPulse,
    'shopping-bag': ShoppingBag,
    'piggy-bank': PiggyBank,
    briefcase: Briefcase,
    building: Building,
    smartphone: Smartphone,
    dumbbell: Dumbbell,
    plane: Plane,
    coffee: Coffee,
    music: Music,
    book: Book,
    gift: Gift,
    wrench: Wrench,
    scissors: Scissors,
    monitor: Monitor,
    truck: Truck,
    zap: Zap,
    camera: Camera,
    umbrella: Umbrella
}

export default function ExtratoDetalhadoPage() {
    const router = useRouter()
    const { transactions, loading: loadingTx } = useTransactions()
    const { categories, loading: loadingCat } = useCategories()

    const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({})
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
    const [editingTxId, setEditingTxId] = useState<string | null>(null)

    const currentMonthName = format(new Date(), 'MMMM', { locale: ptBR })
    const monthDisplay = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)

    const toggleCat = (catId: string) => {
        setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }))
    }

    const { balance, groupedData } = useMemo(() => {
        let income = 0
        let expense = 0
        const grouped: Record<string, {
            id: string,
            name: string,
            color: string,
            icon: string,
            type: 'income' | 'expense',
            total: number,
            transactions: any[]
        }> = {}

        transactions.forEach(t => {
            if (!isThisMonth(parseISO(t.date))) return
            if (filterType !== 'all' && t.type !== filterType) return

            const amount = Number(t.amount)
            if (t.type === 'income') income += amount
            if (t.type === 'expense') expense += amount

            const catId = t.category_id || 'uncategorized'
            const catObj = categories.find(c => c.id === catId)
            const catName = catObj?.name || 'Outros'
            const catColor = catObj?.color || (t.type === 'expense' ? '#3B82F6' : '#10B981')
            const catIcon = catObj?.icon || 'tag'

            if (!grouped[catId]) {
                grouped[catId] = {
                    id: catId,
                    name: catName,
                    color: catColor,
                    icon: catIcon,
                    type: t.type as 'income' | 'expense',
                    total: 0,
                    transactions: []
                }
            }

            grouped[catId].total += amount
            grouped[catId].transactions.push(t)
        })

        // Sort categories by total value descending
        const sortedGroups = Object.values(grouped).sort((a, b) => b.total - a.total)

        // Separate groups by income and expense
        const incomeGroups = sortedGroups.filter(g => g.type === 'income')
        const expenseGroups = sortedGroups.filter(g => g.type === 'expense')

        return {
            balance: income - expense,
            groupedData: [...incomeGroups, ...expenseGroups] // Receitas primeiro, depois despesas
        }
    }, [transactions, categories, filterType])

    const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
    const fmtShort = (v: number) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)

    return (
        <div className="flex flex-col w-full min-h-screen bg-[#E5F7F3] p-4 font-sans text-slate-800">
            {/* Header / Topbar */}
            <div className="flex items-center justify-between mb-6 pt-safe">
                <button onClick={() => router.push('/')} className="p-2 -ml-2 text-[#17B29F] rounded-full hover:bg-white/50 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[#17B29F] font-semibold text-sm tracking-wide">Extrato {monthDisplay}</span>
                    <span className="text-[10px] text-[#17B29F]/70 uppercase tracking-widest font-bold">Todas as contas</span>
                </div>
                <div className="w-10" />
            </div>

            {/* Balance Badge */}
            <div className="flex justify-center mb-6">
                <div className="bg-[#6DCFB6] text-white px-8 py-3 rounded-lg font-medium text-lg shadow-sm">
                    Balanço <span className="font-bold ml-1">{fmt(balance)}</span>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex w-full gap-2 mb-6">
                <button
                    onClick={() => setFilterType(prev => prev === 'all' ? 'income' : prev === 'income' ? 'expense' : 'all')}
                    className="flex flex-1 justify-center items-center gap-1 bg-white text-[#17B29F] px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm border border-[#17B29F]/20 transition-all hover:bg-[#17B29F]/5 min-w-[140px]">
                    {filterType === 'all' ? 'Ver Todos' : filterType === 'income' ? 'Apenas Receitas' : 'Apenas Despesas'} <ChevronDown size={14} />
                </button>
            </div>

            {/* List */}
            <div className="flex flex-col gap-1 pb-24">
                {groupedData.length === 0 && (
                    <div className="text-center text-slate-500 py-10 text-sm font-medium">
                        Nenhuma transação neste mês.
                    </div>
                )}

                {groupedData.map(group => {
                    const IconComp = iconMap[group.icon] || Tag
                    const isIncome = group.type === 'income'
                    const amountColor = isIncome ? 'text-[#10B981]' : 'text-[#F43F5E]'
                    const isExpanded = expandedCats[group.id]

                    return (
                        <div key={group.id} className="flex flex-col bg-transparent">
                            {/* Category Row */}
                            <div
                                onClick={() => toggleCat(group.id)}
                                className="flex items-center justify-between py-3 px-1 cursor-pointer hover:bg-white/30 rounded-lg transition-colors"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="text-slate-400">
                                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 bg-white shadow-sm" style={{ color: group.color }}>
                                            <IconComp size={16} strokeWidth={2} />
                                        </div>
                                        <span className="text-[15px] font-medium text-[#445D5A]">{group.name}</span>
                                    </div>
                                </div>
                                <div className={`text-[15px] font-medium ${amountColor}`}>
                                    {isIncome ? '' : '-'}{fmtShort(group.total)}
                                </div>
                            </div>

                            {/* Expanded Transactions */}
                            {isExpanded && (
                                <div className="flex flex-col pl-16 pr-1 pt-1 pb-3 gap-2 border-l-2 ml-4 mb-2 mt-1" style={{ borderColor: group.color }}>
                                    {group.transactions.map((tx, idx) => (
                                        <div key={tx.id || idx} onClick={() => setEditingTxId(tx.id)} className="flex justify-between items-center text-sm py-2 cursor-pointer hover:bg-white/50 transition-colors rounded-lg px-2 -mx-2">
                                            <div className="flex flex-col">
                                                <span className="text-slate-600 font-medium truncate max-w-[150px]">{tx.description}</span>
                                                <span className="text-[10px] text-slate-400">{format(parseISO(tx.date), 'dd/MM/yyyy')}</span>
                                            </div>
                                            <span className={`font-medium ${amountColor}`}>
                                                {fmtShort(Number(tx.amount))}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Floating Buttons */}
            <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-10 pointer-events-none z-50">
                <button
                    onClick={() => router.push('/lancamento/novo?type=expense')}
                    className="pointer-events-auto w-[64px] h-[64px] bg-[#E5F7F3] border-4 border-[#F43F5E] text-[#F43F5E] rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                >
                    <div className="w-5 h-1 bg-current rounded-full" />
                </button>
                <button
                    onClick={() => router.push('/lancamento/novo?type=income')}
                    className="pointer-events-auto w-[64px] h-[64px] bg-[#E5F7F3] border-4 border-[#6DCFB6] text-[#6DCFB6] rounded-full flex items-center justify-center shadow-md hover:bg-teal-50 transition-colors"
                >
                    <div className="relative w-5 h-5">
                        <div className="absolute top-2 left-0 right-0 h-1 bg-current rounded-full" />
                        <div className="absolute top-0 bottom-0 left-2 w-1 bg-current rounded-full" />
                    </div>
                </button>
            </div>

            <EditTransactionSheet 
                transaction={transactions.find(t => String(t.id) === String(editingTxId)) || null} 
                isOpen={!!editingTxId} 
                onClose={() => setEditingTxId(null)} 
            />
        </div>
    )
}
