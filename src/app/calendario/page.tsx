'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, ShoppingCart, Banknote } from 'lucide-react'

// Mock Data
const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']
const days = Array.from({ length: 31 }, (_, i) => i + 1)
const datesWithIncome = [2, 4, 15, 25]
const datesWithExpense = [1, 4, 8, 25]

export default function CalendarPage() {
    const [selectedDay, setSelectedDay] = useState<number>(25)

    return (
        <div className="flex flex-col w-full h-full pb-20">

            {/* Month Selector */}
            <div className="flex justify-between items-center w-full px-4 mt-6 mb-8">
                <button className="p-2 -ml-2 text-slate-800"><ChevronLeft size={20} strokeWidth={3} /></button>
                <span className="text-[17px] font-bold text-slate-900">Outubro 2023</span>
                <button className="p-2 -mr-2 text-slate-800"><ChevronRight size={20} strokeWidth={3} /></button>
            </div>

            {/* Calendar Grid */}
            <div className="px-4 mb-4">
                {/* Weekdays */}
                <div className="grid grid-cols-7 mb-4">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-[10px] font-bold tracking-widest text-[#45D1C0] uppercase">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-y-4">
                    {/* Offset mockado */}
                    <div className="col-span-3"></div>

                    {days.map(day => {
                        const hasIncome = datesWithIncome.includes(day)
                        const hasExpense = datesWithExpense.includes(day)
                        const isSelected = selectedDay === day

                        return (
                            <div key={day} className="flex flex-col items-center justify-center relative">
                                <button
                                    onClick={() => setSelectedDay(day)}
                                    className={`flex flex-col items-center justify-center w-10 h-10 rounded-xl relative transition-all ${isSelected ? 'bg-[#45D1C0] text-white shadow-md' : 'text-slate-800 focus:bg-slate-100 hover:bg-slate-50'
                                        }`}
                                >
                                    <span className="text-[15px] font-medium">{day}</span>

                                    {/* Dots */}
                                    {(hasIncome || hasExpense) && (
                                        <div className="flex gap-1 mt-[2px] absolute bottom-1">
                                            {hasIncome && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#17B29F]'}`} />}
                                            {hasExpense && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#F03D1A]'}`} />}
                                        </div>
                                    )}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Resumo do Dia e Transações */}
            <div className="flex-1 w-full bg-slate-50 border-t border-slate-100 rounded-t-[32px] px-5 py-6 flex flex-col mt-4">

                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Resumo do Dia - {selectedDay} Out</h3>
                    <button className="text-[13px] font-semibold text-[#17B29F] tracking-wide">Ver Detalhes</button>
                </div>

                <div className="flex w-full gap-4 mb-8">
                    {/* Receitas Card */}
                    <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-slate-100/50 flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="bg-green-50 p-1.5 rounded-full text-[#17B29F]">
                                <TrendingUp size={16} strokeWidth={2.5} />
                            </div>
                            <span className="text-[13px] font-semibold text-slate-500">Receitas</span>
                        </div>
                        <span className="text-xl font-bold text-slate-900 mb-2">R$ 2.500,00</span>
                        <span className="text-[11px] font-bold text-[#17B29F] flex items-center gap-1">
                            ↑ +15% vs ontem
                        </span>
                    </div>

                    {/* Despesas Card */}
                    <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-slate-100/50 flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="bg-red-50 p-1.5 rounded-full text-[#F03D1A]">
                                <TrendingDown size={16} strokeWidth={2.5} />
                            </div>
                            <span className="text-[13px] font-semibold text-slate-500">Despesas</span>
                        </div>
                        <span className="text-xl font-bold text-slate-900 mb-2">R$ 450,20</span>
                        <span className="text-[11px] font-bold text-[#F03D1A] flex items-center gap-1">
                            ↓ -5% vs ontem
                        </span>
                    </div>
                </div>

                <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase mb-4">Transações do Dia</span>

                <div className="flex flex-col gap-3">
                    {/* Item 1 */}
                    <div className="w-full bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-slate-100/50">
                        <div className="flex items-center gap-4">
                            <div className="bg-[#45D1C0]/10 w-12 h-12 rounded-xl flex items-center justify-center text-[#17B29F]">
                                <ShoppingCart size={22} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[15px] font-bold text-slate-900 mb-0.5">Supermercado</span>
                                <span className="text-[12px] font-medium text-slate-400 tracking-wide">14:30 • Alimentação</span>
                            </div>
                        </div>
                        <span className="text-[15px] font-bold text-[#F03D1A]">- R$ 320,50</span>
                    </div>

                    {/* Item 2 */}
                    <div className="w-full bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-slate-100/50">
                        <div className="flex items-center gap-4">
                            <div className="bg-[#17B29F]/10 w-12 h-12 rounded-xl flex items-center justify-center text-[#17B29F]">
                                <Banknote size={22} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[15px] font-bold text-slate-900 mb-0.5">Freelance UX/UI</span>
                                <span className="text-[12px] font-medium text-slate-400 tracking-wide">10:15 • Serviços</span>
                            </div>
                        </div>
                        <span className="text-[15px] font-bold text-[#17B29F]">+ R$ 1.200,00</span>
                    </div>
                </div>

            </div>
        </div>
    )
}
