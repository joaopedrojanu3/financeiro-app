'use client'

import React, { useState, useEffect } from 'react'
import { PiggyBank, Pencil, Check, X } from 'lucide-react'

export default function ObjetivosPage() {
    const [savingsGoal, setSavingsGoal] = useState<number>(0)
    const [showOnDashboard, setShowOnDashboard] = useState<boolean>(true)
    const [editingGoal, setEditingGoal] = useState(false)
    const [editValue, setEditValue] = useState('')
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)

    const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

    useEffect(() => {
        async function fetchGoal() {
            try {
                const res = await fetch('/api/user-settings')
                if (res.ok) {
                    const data = await res.json()
                    setSavingsGoal(data.monthly_spending_goal || 0)
                    setShowOnDashboard(data.show_savings_goal_on_dashboard ?? true)
                }
            } catch (err) {
                console.error('Erro ao buscar meta:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchGoal()
    }, [])

    const handleSaveGoal = async () => {
        if (editValue === '') {
            setEditingGoal(false)
            return
        }

        setSaving(true)
        try {
            // Allow 0 value explicitly
            const parsed = parseFloat(editValue.replace(/\./g, '').replace(',', '.'))
            const newGoal = isNaN(parsed) ? savingsGoal : parsed

            const res = await fetch('/api/user-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    monthly_spending_goal: newGoal,
                    show_savings_goal_on_dashboard: showOnDashboard
                })
            })
            if (res.ok) {
                setSavingsGoal(newGoal)
                setEditingGoal(false)
            }
        } catch (err) {
            console.error('Erro ao salvar meta:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleToggleShow = async () => {
        const newValue = !showOnDashboard
        setShowOnDashboard(newValue)
        try {
            await fetch('/api/user-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    monthly_spending_goal: savingsGoal,
                    show_savings_goal_on_dashboard: newValue
                })
            })
        } catch (err) {
            console.error('Erro ao salvar config:', err)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col w-full min-h-screen pt-20 px-5 bg-slate-50 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#17B29F]"></div>
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full min-h-screen pt-[80px] px-5 bg-slate-50/30">

            <div className="w-full bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm">

                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="w-16 h-16 bg-[#17B29F]/10 rounded-full flex items-center justify-center text-[#17B29F] mb-4">
                        <PiggyBank size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 text-center">Qual o seu objetivo financeiro?</h2>
                    <p className="text-sm text-slate-500 text-center mt-2">Defina um valor que deseja guardar todos os meses. Isso ajuda a organizar seu patrimônio de forma clara.</p>
                </div>

                <div className="border-t border-slate-100 pt-6 mb-2">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-600">Minha Meta Atual</span>
                        </div>
                        {!editingGoal ? (
                            <button
                                onClick={() => { setEditingGoal(true); setEditValue(savingsGoal.toString()) }}
                                className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-slate-700 px-3 py-1.5 rounded-full transition-all"
                            >
                                <Pencil size={12} /> Editar
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => setEditingGoal(false)} className="text-slate-500 hover:bg-slate-100 p-1.5 rounded-full transition-colors"><X size={16} /></button>
                                <button onClick={handleSaveGoal} disabled={saving} className="text-[#17B29F] hover:bg-[#17B29F]/10 p-1.5 rounded-full transition-colors"><Check size={16} /></button>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-end mb-4">
                        {editingGoal ? (
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-bold text-slate-400">R$</span>
                                <input
                                    type="text" value={editValue} onChange={e => setEditValue(e.target.value)}
                                    className="w-full text-3xl font-extrabold border-b-2 border-[#45D1C0] px-1 py-0 outline-none bg-transparent text-slate-900 focus:border-[#17B29F] transition-colors"
                                    inputMode="numeric" autoFocus
                                    placeholder="0.00"
                                />
                            </div>
                        ) : (
                            <span className="text-4xl font-extrabold tracking-tight text-[#17B29F]">{fmt(savingsGoal)}</span>
                        )}
                    </div>
                </div>

                {/* Toggle field */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                    <span className="text-sm font-medium text-slate-600">Mostrar meta na Tela Inicial</span>
                    <button
                        onClick={handleToggleShow}
                        className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 ${showOnDashboard ? 'bg-[#17B29F]' : 'bg-slate-300'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${showOnDashboard ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>
        </div>
    )
}
