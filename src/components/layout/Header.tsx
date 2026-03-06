'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Menu, Calendar, ChevronLeft, Search, CalendarPlus } from 'lucide-react'
import { useState } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import Sidebar from './Sidebar'

export default function Header() {
    const pathname = usePathname()
    const router = useRouter()
    const [isSidebarOpen, setSidebarOpen] = useState(false)

    const { transactions } = useTransactions()

    // Calcula o saldo oficial baseado nas transações retornadas pelo SSOT
    const saldoOcial = transactions.reduce((acc, t) => {
        const amount = Number(t.amount)
        if (t.type === 'income') return acc + amount
        if (t.type === 'expense') return acc - amount
        return acc
    }, 0)


    // Função para retornar Header de acordo com a rota
    const renderHeaderContent = () => {
        switch (pathname) {
            case '/':
                return (
                    <>
                        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-900">
                            <Menu size={24} />
                        </button>
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Saldo Atual</span>
                            <span className="text-xl font-bold text-slate-900">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoOcial)}
                            </span>
                        </div>
                        <button className="p-2 -mr-2 text-slate-900">
                            <Calendar size={24} />
                        </button>
                    </>
                )
            case '/extrato':
                return (
                    <>
                        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-900">
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-base font-bold text-slate-900">Extrato Detalhado</h1>
                        <button className="p-2 -mr-2 text-slate-900">
                            <Search size={22} />
                        </button>
                    </>
                )
            case '/calendario':
                return (
                    <>
                        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-900">
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-base font-bold text-slate-900">Calendário Financeiro</h1>
                        <button className="p-2 -mr-2 text-[#17B29F]">
                            <CalendarPlus size={22} />
                        </button>
                    </>
                )
            case '/lancamento/novo':
            case '/receita/nova':
            case '/despesa/nova':
                const title = pathname.includes('receita') ? 'NOVA RECEITA' : pathname.includes('despesa') ? 'NOVA DESPESA' : 'NOVO LANÇAMENTO'
                return (
                    <>
                        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-900">
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-sm font-bold tracking-widest text-slate-900">{title}</h1>
                        <div className="w-10"></div> {/* Spacer */}
                    </>
                )
            default:
                // Exemplo genérico
                return (
                    <>
                        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-900">
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-base font-bold text-slate-900">Stitch Finance</h1>
                        <div className="w-10"></div>
                    </>
                )
        }
    }

    return (
        <>
            <header className="fixed top-0 w-full max-w-md bg-white z-40">
                <div className="flex justify-between items-center h-16 px-4 pt-safe">
                    {renderHeaderContent()}
                </div>
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        </>
    )
}
