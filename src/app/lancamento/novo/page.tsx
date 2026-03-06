'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, ChevronLeft, Receipt, Utensils, Car, HeartPulse, ShoppingBag, PlusCircle, Loader2, Building, PiggyBank } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'

const defaultIncomeCats = [
    { id: '1', name: 'Salário', icon: Receipt },
    { id: '2', name: 'Alugueis', icon: Building },
    { id: '3', name: 'Rendimentos', icon: PiggyBank },
]

const defaultExpenseCats = [
    { id: '4', name: 'Contas', icon: Receipt },
    { id: '5', name: 'Comida', icon: Utensils },
    { id: '6', name: 'Transporte', icon: Car },
    { id: '7', name: 'Saúde', icon: HeartPulse },
    { id: '8', name: 'Compras', icon: ShoppingBag },
]

export default function NewTransactionPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // SSOT: Vamos buscar transações ou criar novos lembretes via hook
    const { createTransaction } = useTransactions()

    const type = searchParams.get('type') || 'expense'
    const isIncome = type === 'income'
    const colorBase = isIncome ? '#17B29F' : '#F03D1A'

    const availableCats = isIncome ? defaultIncomeCats : defaultExpenseCats

    // States
    const [amount, setAmount] = useState('0,00')
    const [description, setDescription] = useState('')
    const [selectedCat, setSelectedCat] = useState(availableCats[0]?.id)

    // Lembrete / Agendamento States
    const [isScheduled, setIsScheduled] = useState(false)
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
    const [isReminder, setIsReminder] = useState(false)
    const [frequency, setFrequency] = useState('Mensal')
    const [reminderTime, setReminderTime] = useState('09:00')

    const [submitting, setSubmitting] = useState(false)

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '')
        if (value === '') value = '0'

        const numeric = Number(value) / 100
        const formatted = new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numeric)

        setAmount(formatted)
    }

    const handleSave = async () => {
        if (submitting) return

        const numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'))

        if (numericAmount <= 0) {
            alert('Por favor, informe um valor maior que zero.')
            return
        }

        if (!description.trim()) {
            alert('Por favor, defina um nome/descrição para o lançamento.')
            return
        }

        const cat = availableCats.find(c => c.id === selectedCat)

        try {
            setSubmitting(true)

            if (isScheduled || isReminder) {
                // Delta Zero: Salva na nova tabela recurring_bills via API
                const res = await fetch('/api/reminders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        description: description,
                        amount: numericAmount,
                        type: isIncome ? 'income' : 'expense',
                        due_date: dueDate,
                        frequency: isReminder ? frequency : 'Único', // Se não for repetição, é unico
                        is_active: isReminder,
                        category_id: null // Por hora, mockup category
                    })
                })

                if (!res.ok) throw new Error('Falha ao agendar.')
            } else {
                // Lançamento imediato (Transação normal)
                await createTransaction({
                    description: description,
                    amount: numericAmount,
                    type: isIncome ? 'income' : 'expense',
                    date: dueDate,
                    category_id: null
                })
            }

            // Volta pra home após salvar SSOT
            router.push('/')
        } catch (error) {
            console.error('Falha ao salvar:', error)
            alert('Erro ao salvar lançamento.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="relative flex min-h-screen w-full max-w-md mx-auto flex-col bg-white overflow-hidden shadow-xl font-sans pb-20">
            {/* Header Mínimo Custom */}
            <div className="flex items-center bg-white px-4 py-3 justify-between border-b border-slate-100 shrink-0">
                <button onClick={() => router.back()} className="text-slate-900 flex size-10 shrink-0 items-center justify-center hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-slate-900 text-base font-bold leading-tight tracking-tight flex-1 text-center">
                    {isIncome ? 'Nova Receita' : 'Nova Despesa'}
                </h2>
                <div className="size-10"></div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col">
                {/* Top Section - Valor e Nome */}
                <div className="bg-slate-50/50 p-4 border-b border-slate-100 shrink-0">
                    <div className="flex flex-col items-center">
                        <p className="font-semibold text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: colorBase }}>VALOR</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold" style={{ color: colorBase }}>R$</span>
                            <input
                                type="text"
                                value={amount}
                                onChange={handleAmountChange}
                                className="text-slate-900 tracking-tight text-5xl font-extrabold leading-none bg-transparent outline-none text-center max-w-[250px]"
                                inputMode="numeric"
                                placeholder="0,00"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-3 text-sm focus:ring-2 outline-none transition-all placeholder:text-slate-400 font-medium"
                            placeholder="Nome do gasto (ex: Mercado, Aluguel)"
                            style={{ '--tw-ring-color': colorBase } as React.CSSProperties}
                        />
                    </div>
                </div>

                {/* Dupla Coluna: Categorias e Agendamento */}
                <div className="flex flex-1 min-h-0">
                    {/* Lista de Categorias (Scroll customizado escondido nativo via tailwind) */}
                    <div className="w-[35%] border-r border-slate-100 flex flex-col">
                        <div className="p-2 border-b border-slate-100 bg-slate-50 text-center">
                            <span className="text-[9px] font-bold text-slate-500 uppercase">CATEGORIA</span>
                        </div>
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-2">
                            {availableCats.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCat(cat.id)}
                                    className={`w-full flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${selectedCat === cat.id ? 'border-2 scale-100' : 'border-transparent hover:bg-slate-50 scale-95'}`}
                                    style={{
                                        borderColor: selectedCat === cat.id ? colorBase : 'transparent',
                                        backgroundColor: selectedCat === cat.id ? `${colorBase}1A` : undefined
                                    }}
                                >
                                    <cat.icon size={22} strokeWidth={selectedCat === cat.id ? 2.5 : 2} style={{ color: selectedCat === cat.id ? colorBase : '#64748b' }} />
                                    <span style={{ color: selectedCat === cat.id ? colorBase : '#475569' }} className="text-[10px] font-bold mt-1 text-center w-full truncate leading-tight">{cat.name}</span>
                                </button>
                            ))}
                            <button className="w-full flex flex-col items-center justify-center p-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all scale-95">
                                <PlusCircle size={22} className="text-slate-400" />
                                <span className="text-slate-500 text-[10px] font-bold mt-1 text-center leading-tight">Criar</span>
                            </button>
                        </div>
                    </div>

                    {/* Forms Right Side */}
                    <div className="flex-1 flex flex-col overflow-y-auto">
                        <div className="p-4 space-y-6">

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Agendar Pagamento</label>
                                    <label className="relative inline-flex items-center cursor-pointer scale-[0.8] origin-right">
                                        <input type="checkbox" className="sr-only peer" checked={isScheduled} onChange={(e) => setIsScheduled(e.target.checked)} />
                                        <div className={`w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`} style={{ backgroundColor: isScheduled ? colorBase : undefined }}></div>
                                    </label>
                                </div>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-3 pl-10 pr-3 text-sm font-semibold text-slate-700 focus:ring-1 outline-none"
                                        style={{ '--tw-ring-color': colorBase } as React.CSSProperties}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-5 border-t border-slate-100">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recorrência / Alerta</label>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-lg border border-slate-200 cursor-pointer" onClick={() => setIsReminder(!isReminder)}>
                                        <input
                                            type="checkbox"
                                            checked={isReminder}
                                            readOnly
                                            className="w-5 h-5 rounded border-slate-300"
                                            style={{ accentColor: colorBase }}
                                        />
                                        <span className="text-sm font-bold text-slate-700">Tornar Frequente</span>
                                    </div>

                                    {isReminder && (
                                        <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                                            <div className="space-y-1 mb-3">
                                                <span className="text-[10px] font-bold text-slate-400 ml-1">FREQUÊNCIA</span>
                                                <select
                                                    value={frequency}
                                                    onChange={(e) => setFrequency(e.target.value)}
                                                    className="w-full text-sm font-semibold bg-white border border-slate-200 rounded-lg py-3 px-3 text-slate-700 focus:ring-1 outline-none appearance-none"
                                                    style={{ '--tw-ring-color': colorBase } as React.CSSProperties}
                                                >
                                                    <option>Diário</option>
                                                    <option>Semanal</option>
                                                    <option>Mensal</option>
                                                    <option>Anual</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-slate-400 ml-1">HORÁRIO DO LEMBRETE</span>
                                                <input
                                                    type="time"
                                                    value={reminderTime}
                                                    onChange={(e) => setReminderTime(e.target.value)}
                                                    className="w-full text-sm font-semibold bg-white border border-slate-200 rounded-lg py-3 px-3 text-slate-700 focus:ring-1 outline-none"
                                                    style={{ '--tw-ring-color': colorBase } as React.CSSProperties}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions Fixas */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-white border-t border-slate-100 flex gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
                <button
                    onClick={() => router.back()}
                    className="flex-1 py-4 px-4 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm tracking-wide hover:bg-slate-50 transition-colors"
                >
                    CANCELAR
                </button>
                <button
                    onClick={handleSave}
                    disabled={submitting}
                    className="flex-[2] py-4 px-4 rounded-xl text-white font-bold text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                    style={{ backgroundColor: colorBase, boxShadow: `0 4px 20px ${colorBase}40` }}
                >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                    {submitting ? 'SALVANDO...' : 'SALVAR'}
                </button>
            </div>

            {/* Espaçamento extra para barra fixa */}
            <div className="h-[80px]"></div>
        </div>
    )
}
