'use client'

import { useState, useMemo } from 'react'
import { CalendarClock, Plus, Calendar as CalendarIcon, Wallet, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useReminders, Reminder } from '@/hooks/useReminders'
import { format, parseISO, isThisMonth, addDays, addWeeks, addMonths, addYears, isAfter, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import TabBar from '@/components/layout/TabBar'
import { getAdminHeaders } from '@/lib/apiClient'

type ExpandedBill = {
    reminder: Reminder
    occurrenceDate: Date
    occurrenceDateStr: string  // yyyy-MM-dd para comparar com pagamentos
    label: string
    isPaid: boolean
}

function expandReminder(r: Reminder, isOccurrencePaid: (id: string, date: string) => boolean): ExpandedBill[] {
    const bills: ExpandedBill[] = []
    const today = startOfDay(new Date())
    const start = parseISO(r.due_date)
    const end = r.end_date ? parseISO(r.end_date) : null

    // PAGAMENTO ÚNICO: apenas 1 ocorrência na data de vencimento
    if (r.frequency === 'Único') {
        const dateStr = format(start, 'yyyy-MM-dd')
        const paid = isOccurrencePaid(r.id, dateStr)
        if (start >= today || paid) {
            bills.push({
                reminder: r,
                occurrenceDate: start,
                occurrenceDateStr: dateStr,
                label: 'Pagamento Único',
                isPaid: paid
            })
        }
        return bills
    }

    // RECORRENTE: expande todas as parcelas futuras
    const maxOccurrences = 60
    let current = start
    let index = 1

    while (index <= maxOccurrences) {
        if (end && isAfter(current, end)) break

        const dateStr = format(current, 'yyyy-MM-dd')
        const totalParcelas = end ? countOccurrences(start, end, r.frequency) : null
        const paid = isOccurrencePaid(r.id, dateStr)

        if (current >= today || paid) {
            bills.push({
                reminder: r,
                occurrenceDate: current,
                occurrenceDateStr: dateStr,
                label: totalParcelas ? `Parcela ${index}/${totalParcelas}` : 'Recorrente',
                isPaid: paid
            })
        }

        switch (r.frequency) {
            case 'Diário': current = addDays(current, 1); break
            case 'Semanal': current = addWeeks(current, 1); break
            case 'Mensal': current = addMonths(start, index); break
            case 'Anual': current = addYears(start, index); break
            default: current = addMonths(start, index); break
        }
        index++
    }

    return bills
}

function countOccurrences(start: Date, end: Date, frequency: string): number {
    let count = 0
    let current = start
    const max = 120

    while (!isAfter(current, end) && count < max) {
        count++
        switch (frequency) {
            case 'Diário': current = addDays(current, 1); break
            case 'Semanal': current = addWeeks(current, 1); break
            case 'Mensal': current = addMonths(start, count); break
            case 'Anual': current = addYears(start, count); break
            default: current = addMonths(start, count); break
        }
    }
    return count
}

export default function RemindersPage() {
    const { reminders, loading, refetch, isOccurrencePaid } = useReminders()
    const [filter, setFilter] = useState<'all' | 'thisMonth' | 'done'>('thisMonth')
    const [payingKey, setPayingKey] = useState<string | null>(null)

    // Expande todos os lembretes ativos em parcelas individuais
    const allBills = useMemo(() => {
        const bills: ExpandedBill[] = []
        reminders.filter(r => r.is_active).forEach(r => {
            bills.push(...expandReminder(r, isOccurrencePaid))
        })
        return bills.sort((a, b) => a.occurrenceDate.getTime() - b.occurrenceDate.getTime())
    }, [reminders, isOccurrencePaid])

    const pendingBills = allBills.filter(b => !b.isPaid)
    const paidBills = allBills.filter(b => b.isPaid)

    // Marca UMA parcela individual como paga
    const handleMarkAsPaid = async (bill: ExpandedBill) => {
        const key = `${bill.reminder.id}-${bill.occurrenceDateStr}`
        if (payingKey) return

        const confirmed = confirm(`Confirma o pagamento da parcela de ${format(bill.occurrenceDate, "dd/MM/yyyy")}?\nUma transação será registrada no seu saldo.`)
        if (!confirmed) return

        try {
            setPayingKey(key)

            const res = await fetch(`/api/reminders/${bill.reminder.id}`, {
                method: 'PATCH',
                headers: getAdminHeaders(),
                body: JSON.stringify({ occurrence_date: bill.occurrenceDateStr })
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Erro ao marcar como pago')
            }

            refetch()
        } catch (error) {
            console.error('Erro ao pagar:', error)
            alert('Erro ao registrar pagamento. Tente novamente.')
        } finally {
            setPayingKey(null)
        }
    }

    const totalPendente = pendingBills.reduce((acc, b) => acc + Number(b.reminder.amount), 0)

    return (
        <div className="flex flex-col w-full h-full pb-24 items-center bg-slate-50/50 min-h-[calc(100vh-64px)] pt-16">

            {/* Header */}
            <div className="w-full px-4 pt-4 pb-6 bg-white border-b border-slate-100 flex flex-col gap-1 shadow-sm">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Contas Futuras</h1>
                <p className="text-sm font-medium text-slate-400">Gerencie seus compromissos e lembretes financeiros.</p>
            </div>

            {/* Resumo */}
            <div className="w-full px-4 mt-6">
                <div className="flex w-full justify-between items-center bg-[#45D1C0] rounded-2xl p-5 shadow-lg shadow-[#45D1C0]/20 text-white relative overflow-hidden">
                    <div className="z-10 flex flex-col">
                        <span className="text-[10px] font-bold tracking-widest uppercase opacity-80 mb-1">Total Pendente</span>
                        <span className="text-3xl font-extrabold tracking-tight">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPendente)}
                        </span>
                        <span className="text-[10px] font-medium opacity-60 mt-1">{pendingBills.length} parcelas pendentes</span>
                    </div>
                    <CalendarClock size={64} className="absolute -right-4 -bottom-4 opacity-10" />
                </div>
            </div>

            {/* Filtros */}
            <div className="w-full flex gap-2 px-4 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
                    Todas Contas
                </button>
                <button onClick={() => setFilter('thisMonth')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === 'thisMonth' ? 'bg-[#F03D1A] text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
                    Este Mês
                </button>
                <button onClick={() => setFilter('done')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === 'done' ? 'bg-[#17B29F] text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
                    Finalizadas ({paidBills.length})
                </button>
            </div>

            {/* Lista */}
            <div className="w-full px-4 mt-4 flex flex-col gap-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-10 h-32 gap-3 opacity-50">
                        <div className="w-8 h-8 border-4 border-[#45D1C0] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filter === 'done' ? (
                    /* === FINALIZADAS === */
                    paidBills.length === 0 ? (
                        <div className="flex flex-col items-center justify-center bg-white p-8 rounded-2xl border border-dashed border-slate-200 mt-4 text-center">
                            <CalendarIcon size={48} className="text-slate-200 mb-3" />
                            <h3 className="text-sm font-bold text-slate-700">Nenhuma parcela paga ainda</h3>
                            <p className="text-[11px] font-medium text-slate-400 mt-1">Parcelas pagas aparecerão aqui.</p>
                        </div>
                    ) : (
                        paidBills.map((bill, idx) => (
                            <div key={`paid-${bill.reminder.id}-${idx}`} className="bg-white p-4 rounded-2xl border border-emerald-200 opacity-70 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-emerald-50 text-emerald-500">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-bold text-slate-500 line-through truncate">{bill.reminder.description}</span>
                                        <span className="text-[11px] text-slate-400 font-medium">
                                            {format(bill.occurrenceDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                        </span>
                                        <span className="text-[10px] font-bold text-emerald-500">✓ PAGA — {bill.label}</span>
                                    </div>
                                </div>
                                <span className="text-sm font-extrabold text-slate-400 flex-shrink-0 ml-2">
                                    R$ {Number(bill.reminder.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        ))
                    )
                ) : (
                    /* === TODAS CONTAS / ESTE MÊS (apenas pendentes) === */
                    (() => {
                        const bills = filter === 'thisMonth'
                            ? pendingBills.filter(b => isThisMonth(b.occurrenceDate))
                            : pendingBills

                        if (bills.length === 0) {
                            return (
                                <div className="flex flex-col items-center justify-center bg-white p-8 rounded-2xl border border-dashed border-slate-200 mt-4 text-center">
                                    <CalendarIcon size={48} className="text-slate-200 mb-3" />
                                    <h3 className="text-sm font-bold text-slate-700">
                                        {filter === 'thisMonth' ? 'Nenhuma conta para este mês' : 'Nenhuma conta futura'}
                                    </h3>
                                    <p className="text-[11px] font-medium text-slate-400 mt-1">Crie um lançamento agendado para ver as parcelas aqui.</p>
                                </div>
                            )
                        }

                        return bills.map((bill, idx) => {
                            const key = `${bill.reminder.id}-${bill.occurrenceDateStr}`
                            return (
                                <div key={`pending-${key}-${idx}`} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${bill.reminder.type === 'expense' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                            {bill.reminder.categories?.icon === 'wallet' ? <Wallet size={20} /> : <CalendarClock size={20} />}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-bold text-slate-900 truncate">{bill.reminder.description}</span>
                                            <span className="text-[11px] text-slate-400 font-medium">
                                                {format(bill.occurrenceDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-500 mt-0.5">{bill.label}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                                        <span className={`text-sm font-extrabold ${bill.reminder.type === 'expense' ? 'text-[#F03D1A]' : 'text-[#17B29F]'}`}>
                                            {bill.reminder.type === 'expense' ? '-' : '+'} R$ {Number(bill.reminder.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-md">{bill.reminder.frequency}</span>
                                        <button
                                            onClick={() => handleMarkAsPaid(bill)}
                                            disabled={payingKey === key}
                                            className="mt-1 flex items-center gap-1 text-[10px] font-bold text-white bg-[#17B29F] px-3 py-1.5 rounded-lg hover:bg-[#149485] transition-colors disabled:opacity-50"
                                        >
                                            {payingKey === key ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                            {payingKey === key ? 'Pagando...' : 'Pagar'}
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    })()
                )}
            </div>

            {/* FAB */}
            <Link href="/lancamento/novo" className="fixed bottom-24 right-4 w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform z-40">
                <Plus size={24} />
            </Link>

            <TabBar />
        </div>
    )
}
