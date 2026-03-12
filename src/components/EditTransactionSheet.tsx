'use client'

import { useState, useEffect } from 'react'
import { Calendar, Tag, ChevronDown, Check, Trash2, X, Loader2 } from 'lucide-react'
import { useTransactions, Transaction } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

interface EditTransactionSheetProps {
    transaction: Transaction | null
    isOpen: boolean
    onClose: () => void
}

export default function EditTransactionSheet({ transaction, isOpen, onClose }: EditTransactionSheetProps) {
    const { updateTransaction, deleteTransaction } = useTransactions()
    const { categories, loading: catsLoading } = useCategories()

    const [amount, setAmount] = useState('0,00')
    const [description, setDescription] = useState('')
    const [selectedCat, setSelectedCat] = useState<string>('')
    const [date, setDate] = useState('')
    const [type, setType] = useState<'income' | 'expense'>('expense')

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        if (transaction && isOpen) {
            const numAmount = Number(transaction.amount) || 0;
            const formattedAmount = new Intl.NumberFormat('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(numAmount)

            setAmount(formattedAmount)
            setDescription(transaction.description || '')
            setSelectedCat(transaction.category_id || '')
            setDate(transaction.date || '')
            setType(transaction.type || 'expense')
        }
    }, [transaction, isOpen])

    if (!isOpen || !transaction) return null

    const colorBase = type === 'income' ? '#17B29F' : '#F03D1A'
    const availableCats = categories.filter(c => c.type === type)

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
        if (isSubmitting) return

        const numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'))

        if (numericAmount <= 0) {
            alert('O valor deve ser maior que zero.')
            return
        }

        if (!description.trim()) {
            alert('A descrição é obrigatória.')
            return
        }

        try {
            setIsSubmitting(true)
            await updateTransaction(transaction.id, {
                description,
                amount: numericAmount,
                date,
                category_id: selectedCat || null
            })
            onClose()
        } catch (error) {
            console.error('Erro ao editar:', error)
            alert('Erro ao salvar as alterações.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (isDeleting) return

        if (!confirm('Tem certeza que deseja excluir este lançamento?')) return

        try {
            setIsDeleting(true)
            await deleteTransaction(transaction.id)
            onClose()
        } catch (error) {
            console.error('Erro ao excluir:', error)
            alert('Erro ao excluir o lançamento.')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-slate-900/60 z-[80] max-w-md mx-auto backdrop-blur-sm transition-all"
                onClick={onClose}
            />

            {/* Bottom Sheet */}
            <div
                className={cn(
                    "fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white z-[90] rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300 ease-out",
                    isOpen ? "translate-y-0" : "translate-y-full"
                )}
                // Limit height so we can scroll inside if needed
                style={{ maxHeight: '90vh' }}
            >
                {/* Drag Handle & Header */}
                <div className="w-full relative flex items-center justify-center p-4 border-b border-slate-100">
                    <button
                        onClick={onClose}
                        className="absolute left-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <h2 className="text-base font-bold text-slate-800 tracking-tight">Editar Lançamento</h2>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="absolute right-4 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Excluir Lançamento"
                    >
                        {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 pb-8 space-y-6">
                    {/* Valor Centralizado */}
                    <div className="flex flex-col items-center py-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Valor</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold" style={{ color: colorBase }}>R$</span>
                            <input
                                type="text"
                                value={amount}
                                onChange={handleAmountChange}
                                className="text-4xl font-extrabold tracking-tight text-slate-900 bg-transparent outline-none text-center w-[200px]"
                                inputMode="numeric"
                            />
                        </div>
                    </div>

                    {/* Descrição */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Descrição</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                            placeholder="Nome do gasto"
                            style={{ '--tw-ring-color': colorBase } as React.CSSProperties}
                        />
                    </div>

                    {/* Data */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Data</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:border-transparent outline-none transition-all"
                                style={{ '--tw-ring-color': colorBase } as React.CSSProperties}
                            />
                        </div>
                    </div>

                    {/* Categoria */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                        <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                value={selectedCat}
                                onChange={(e) => setSelectedCat(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-10 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:border-transparent outline-none appearance-none transition-all"
                                style={{ '--tw-ring-color': colorBase } as React.CSSProperties}
                            >
                                <option value="">Sem Categoria</option>
                                {availableCats.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        </div>
                    </div>

                    {/* Botão Salvar */}
                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            disabled={isSubmitting}
                            className="w-full py-4 rounded-xl text-white font-bold text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: colorBase, boxShadow: `0 4px 14px ${colorBase}40` }}
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={3} />}
                            {isSubmitting ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                        </button>
                    </div>

                </div>
            </div>
        </>
    )
}
