import React, { useState, useEffect } from 'react'
import { X, Save, Trash2, CalendarClock, Loader2, AlertTriangle } from 'lucide-react'
import { Reminder } from '@/hooks/useReminders'
import { parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type ExpandedBill = {
    reminder: Reminder
    occurrenceDate: Date
    occurrenceDateStr: string
    label: string
    isPaid: boolean
}

interface EditReminderSheetProps {
    bill: ExpandedBill | null
    isOpen: boolean
    onClose: () => void
    onUpdate: (id: string, dateStr: string, newData: any) => Promise<void>
    onDeleteSingle: (id: string, dateStr: string) => Promise<void>
    onDeleteSeries: (id: string) => Promise<void>
}

export default function EditReminderSheet({ bill, isOpen, onClose, onUpdate, onDeleteSingle, onDeleteSeries }: EditReminderSheetProps) {
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [date, setDate] = useState('')
    
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeletingSingle, setIsDeletingSingle] = useState(false)
    const [isDeletingSeries, setIsDeletingSeries] = useState(false)

    useEffect(() => {
        if (isOpen && bill) {
            setAmount(Number(bill.reminder.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }))
            setDescription(bill.reminder.description || '')
            setDate(bill.occurrenceDateStr || '')
        }
    }, [isOpen, bill])

    if (!isOpen || !bill) return null

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '')
        if (!value) value = '0'
        const numberValue = parseInt(value, 10) / 100
        setAmount(numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }))
    }

    const handleSave = async () => {
        const numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'))
        if (!description.trim() || isNaN(numericAmount) || numericAmount <= 0) {
            alert('Preencha a descrição e um valor válido.')
            return
        }

        setIsSubmitting(true)
        try {
            await onUpdate(bill.reminder.id, bill.occurrenceDateStr, {
                description,
                amount: numericAmount,
                type: bill.reminder.type,
                dueDate: date,
                category_id: bill.reminder.category_id || null, // pass the original category exactly
            })
            onClose()
        } catch (error: any) {
            alert(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteSingleClick = async () => {
        if (!confirm('Deseja excluir APENAS ESTA PARCELA?\n\nEla vai sumir mas os próximos meses continuarão normais.')) return
        setIsDeletingSingle(true)
        try {
            await onDeleteSingle(bill.reminder.id, bill.occurrenceDateStr)
            onClose()
        } catch (err: any) {
            alert(err.message)
        } finally {
            setIsDeletingSingle(false)
        }
    }

    const handleDeleteSeriesClick = async () => {
        if (!confirm('ATENÇÃO: Deseja excluir TODA AS PARCELAS FUTURAS deste lançamento? Todas as previsões deste item serão apagadas.')) return
        setIsDeletingSeries(true)
        try {
            await onDeleteSeries(bill.reminder.id)
            onClose()
        } catch (err: any) {
            alert(err.message)
        } finally {
            setIsDeletingSeries(false)
        }
    }

    const isExpense = bill.reminder.type === 'expense'
    const colorClass = isExpense ? 'text-[#F03D1A]' : 'text-[#17B29F]'
    const borderClass = isExpense ? 'border-[#F03D1A]' : 'border-[#17B29F]'

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/40 z-[80] max-w-md mx-auto transition-opacity" onClick={onClose} />

            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white z-[90] rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300 ease-out translate-y-0">
                <div className="w-full flex justify-between items-center p-4 border-b border-slate-100">
                    <button onClick={onClose} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200">
                        <X size={20} />
                    </button>
                    <span className="font-bold text-slate-800">Detalhes da Parcela</span>
                    <button onClick={handleDeleteSeriesClick} disabled={isDeletingSeries} className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 disabled:opacity-50">
                        {isDeletingSeries ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-6 w-full max-h-[80vh] overflow-y-auto pb-12">
                    {/* Header Info */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-200">
                            <AlertTriangle size={14} className="text-amber-500" />
                            <span className="text-[11px] font-bold text-amber-600">Edição desta parcela apenas</span>
                        </div>
                        <span className="text-sm font-medium text-slate-400">Ao salvar, apenas este mês será afetado.</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Valor</label>
                            <div className="relative">
                                <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${colorClass}`}>R$</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    className={`w-full bg-slate-50 border-2 ${borderClass}/20 focus:${borderClass} rounded-2xl py-3.5 pl-12 pr-4 text-xl font-extrabold text-slate-800 transition-colors`}
                                    placeholder="0,00"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Descrição</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-slate-400 rounded-2xl py-3.5 px-4 text-base font-bold text-slate-800 transition-colors"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Data</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-slate-400 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-800 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        <button
                            onClick={handleSave}
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${isSubmitting ? 'bg-slate-400' : 'bg-slate-900 hover:bg-slate-800'}`}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {isSubmitting ? 'Salvando Parcela...' : 'Salvar Alteração da Parcela'}
                        </button>
                        
                        <button 
                            onClick={handleDeleteSingleClick}
                            disabled={isDeletingSingle}
                            className="w-full py-4 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-[0.98]"
                        >
                            {isDeletingSingle ? <Loader2 className="animate-spin" size={18} /> : null}
                            {isDeletingSingle ? 'Excluindo...' : 'Pular/Excluir Apenas Esta Parcela'}
                        </button>
                    </div>

                </div>
            </div>
        </>
    )
}
