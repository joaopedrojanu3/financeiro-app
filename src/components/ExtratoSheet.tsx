'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, SlidersHorizontal, ShoppingCart, Zap, Wallet, LucideIcon } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { parseISO, format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const categoryIcons: Record<string, LucideIcon> = {
    'shopping-cart': ShoppingCart,
    'briefcase': Zap,
    'calendar': Zap,
    'user': Zap,
    'truck': Zap,
    'monitor': Zap,
    'file-text': Zap
}

const defaultColors: Record<string, { color: string, bg: string }> = {
    'income': { color: 'text-[#17B29F]', bg: 'bg-[#17B29F]/20' },
    'expense': { color: 'text-[#F03D1A]', bg: 'bg-[#F03D1A]/20' }
}

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

export default function ExtratoSheet({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { transactions, loading } = useTransactions()
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')

    // Processa as transações para o formato de grupos por data
    const groupedTransactions = useMemo(() => {
        if (!transactions.length) return []

        const groups: Record<string, Array<{ id: string, title: string, category: string, amount: number, icon: LucideIcon, color: string, bg: string, rawColor?: string }>> = {}

        transactions.forEach(t => {
            if (filterType !== 'all' && t.type !== filterType) return;

            const date = parseISO(t.date)
            let dateLabel = ''

            if (isToday(date)) {
                dateLabel = `HOJE, ${format(date, "d 'DE' MMMM", { locale: ptBR }).toUpperCase()}`
            } else if (isYesterday(date)) {
                dateLabel = `ONTEM, ${format(date, "d 'DE' MMMM", { locale: ptBR }).toUpperCase()}`
            } else {
                dateLabel = format(date, "d 'DE' MMMM", { locale: ptBR }).toUpperCase()
            }

            if (!groups[dateLabel]) {
                groups[dateLabel] = []
            }

            // Fallback de icones e cores
            const Icon = t.categories?.icon && categoryIcons[t.categories.icon] ? categoryIcons[t.categories.icon] : Wallet
            const colorData = defaultColors[t.type]

            groups[dateLabel].push({
                id: t.id,
                title: t.description,
                category: t.categories?.name ? `${t.categories.name}` : t.type,
                amount: t.type === 'expense' ? -Number(t.amount) : Number(t.amount),
                icon: Icon,
                color: t.categories?.color ? `text-[${t.categories.color}]` : colorData.color,
                bg: colorData.bg,
                rawColor: t.categories?.color
            })
        })

        return Object.entries(groups).map(([dateGroup, items]) => ({
            dateGroup,
            items
        }))

    }, [transactions, filterType])

    const filteredTransactions = transactions.filter(t => filterType === 'all' || t.type === filterType)
    const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0)
    const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0)
    const saldoPeriodo = totalIncome - totalExpense

    return (
        <>
            {/* Overlay Escuro */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 z-[60] max-w-md mx-auto transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Bottom Sheet */}
            <div
                className={cn(
                    "fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[85vh] bg-white z-[70] rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300 ease-out",
                    isOpen ? "translate-y-0" : "translate-y-full"
                )}
            >
                {/* Drag Handle */}
                <div
                    className="w-full flex justify-center items-center py-4 cursor-pointer"
                    onClick={onClose}
                >
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>

                {/* Container de Rolagem */}
                <div className="flex-1 overflow-y-auto w-full px-4 pb-28">

                    {/* Filtros */}
                    <div className="flex w-full gap-2 mb-6 mt-4">
                        <button className="flex items-center justify-center gap-1 bg-[#45D1C0] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm text-nowrap flex-1">
                            Neste Mês <ChevronDown size={14} />
                        </button>
                        <button
                            onClick={() => setFilterType(prev => prev === 'all' ? 'income' : prev === 'income' ? 'expense' : 'all')}
                            className="flex flex-1 justify-center items-center gap-1 bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-100 min-w-[140px]">
                            {filterType === 'all' ? 'Todos os Tipos' : filterType === 'income' ? 'Só Receitas' : 'Só Despesas'} <ChevronDown size={14} />
                        </button>
                    </div>

                    {/* Card Resumo do Período */}
                    <div className={`relative w-full border rounded-2xl p-5 mb-8 overflow-hidden transition-colors ${saldoPeriodo >= 0 ? 'bg-[#45D1C0]/10 border-[#45D1C0]/20' : 'bg-[#F03D1A]/10 border-[#F03D1A]/20'
                        }`}>
                        <div className="relative z-10 flex flex-col">
                            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Saldo do Período</span>
                            <span className={`text-2xl font-bold ${saldoPeriodo >= 0 ? 'text-[#17B29F]' : 'text-[#F03D1A]'}`}>
                                R$ {saldoPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <Wallet
                            size={84}
                            className={`absolute right-[-10px] bottom-[-15px] ${saldoPeriodo >= 0 ? 'text-[#45D1C0]/20' : 'text-[#F03D1A]/20'}`}
                            strokeWidth={1}
                        />
                    </div>

                    {/* Lista de Transações */}
                    {loading && <div className="text-center text-sm text-slate-400 my-8">Carregando transações do servidor...</div>}

                    {!loading && groupedTransactions.length === 0 && (
                        <div className="text-center text-sm text-slate-400 my-8">
                            Nenhuma transação encontrada no Supabase.
                        </div>
                    )}

                    {!loading && groupedTransactions.length > 0 && (
                        <div className="flex flex-col w-full gap-6">
                            {groupedTransactions.map((group, gIdx) => (
                                <div key={gIdx} className="w-full">
                                    <h3 className="text-[11px] font-bold tracking-widest text-slate-500 uppercase mb-4 pl-1">
                                        {group.dateGroup}
                                    </h3>

                                    <div className="flex flex-col gap-5">
                                        {group.items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-4">
                                                    {/* Icon Base */}
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg}`} style={item.rawColor ? { backgroundColor: `${item.rawColor}20` } : {}}>
                                                        <item.icon size={22} className={item.color} style={item.rawColor ? { color: item.rawColor } : {}} />
                                                    </div>
                                                    {/* Textos */}
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-900">{item.title}</span>
                                                        <span className="text-[11px] font-medium text-slate-400">{item.category}</span>
                                                    </div>
                                                </div>
                                                {/* Valor */}
                                                <div className="flex items-center">
                                                    <span
                                                        className={`text-[15px] font-bold ${item.amount > 0 ? 'text-[#17B29F]' : 'text-[#F03D1A]'
                                                            }`}
                                                    >
                                                        {item.amount > 0 ? '+' : '-'} R$ {Math.abs(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Divider */}
                                    {gIdx < groupedTransactions.length - 1 && (
                                        <div className="w-full h-px bg-slate-100 mt-6" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </>
    )
}
