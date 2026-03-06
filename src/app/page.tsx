'use client'

import React, { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Wallet, Utensils, Car, ShoppingBag, Gamepad2, HeartPulse, Receipt, Minus, Plus } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { isThisMonth, parseISO } from 'date-fns'

export default function Dashboard() {
  const { transactions, loading } = useTransactions()

  // SSOT: Busca metas financeiras do banco de dados
  const [spendingGoal, setSpendingGoal] = useState(2000)
  const [incomeGoal, setIncomeGoal] = useState(1500)

  useEffect(() => {
    fetch('/api/user-settings')
      .then(res => res.json())
      .then(data => {
        if (data.monthly_spending_goal) setSpendingGoal(Number(data.monthly_spending_goal))
        if (data.monthly_income_goal) setIncomeGoal(Number(data.monthly_income_goal))
      })
      .catch(err => console.error('Erro ao buscar metas:', err))
  }, [])

  // Calcula valores agregados baseado de transações reais
  const { income, expense, chartData } = useMemo(() => {
    let incomeCount = 0
    let expenseCount = 0
    const catTotals: Record<string, { value: number, color: string, name: string }> = {}

    transactions.forEach(t => {
      // Delta Zero: Filtrar somente pelo mês atual
      if (!isThisMonth(parseISO(t.date))) return

      const amount = Number(t.amount)
      if (t.type === 'income') incomeCount += amount
      else if (t.type === 'expense') {
        expenseCount += amount
        // Adiciona pro grafico
        const catName = t.categories?.name || 'Outros'
        const catColor = t.categories?.color || '#3B82F6'

        if (!catTotals[catName]) {
          catTotals[catName] = { value: 0, color: catColor, name: catName }
        }
        catTotals[catName].value += amount
      }
    })

    // Converte pra array formatado do grafico
    const chart = Object.values(catTotals).map(item => ({
      name: item.name,
      value: item.value,
      color: item.color
    }))

    // Fallback pra nao quebrar grafico se vazio
    if (chart.length === 0) {
      chart.push({ name: 'Vazio', value: 1, color: '#e2e8f0' })
    }

    return { income: incomeCount, expense: expenseCount, chartData: chart }

  }, [transactions])


  return (
    <>
      <div className="flex flex-col items-center px-4 w-full h-full pb-20">

        {/* Gráfico Metade Superior */}
        <div className="relative w-full aspect-square max-w-[320px] mx-auto mt-4">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-slate-50 rounded-full">
              <Wallet size={32} className="text-slate-300" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius="75%"
                  outerRadius="95%"
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={4}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}

          {/* Centro do Gráfico */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-[#45D1C0]/10 p-3 rounded-full">
              <Wallet size={32} className="text-[#45D1C0]" />
            </div>
          </div>

          {/* Ícones Orbitais Mocks Simulando a UI da Imagem */}
          <div className="absolute top-2 left-0 flex flex-col items-center">
            <div className="bg-[#45D1C0]/10 p-3 rounded-full mb-1">
              <Utensils size={20} className="text-[#45D1C0]" />
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase">Alimentação</span>
          </div>
          <div className="absolute top-2 right-0 flex flex-col items-center">
            <div className="bg-[#45D1C0]/10 p-3 rounded-full mb-1">
              <Car size={20} className="text-[#45D1C0]" />
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase">Transporte</span>
          </div>
          <div className="absolute top-1/2 -right-4 -translate-y-1/2 flex flex-col items-center">
            <div className="bg-[#45D1C0]/10 p-3 rounded-full mb-1">
              <ShoppingBag size={20} className="text-[#45D1C0]" />
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase">Shopping</span>
          </div>
          <div className="absolute bottom-2 right-2 flex flex-col items-center">
            <div className="bg-[#45D1C0]/10 p-3 rounded-full mb-1">
              <Gamepad2 size={20} className="text-[#45D1C0]" />
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase">Lazer</span>
          </div>
          <div className="absolute bottom-2 left-2 flex flex-col items-center">
            <div className="bg-[#45D1C0]/10 p-3 rounded-full mb-1">
              <HeartPulse size={20} className="text-[#45D1C0]" />
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase">Saúde</span>
          </div>
          <div className="absolute top-1/2 -left-4 -translate-y-1/2 flex flex-col items-center">
            <div className="bg-[#45D1C0]/10 p-3 rounded-full mb-1">
              <Receipt size={20} className="text-[#45D1C0]" />
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase">Bills</span>
          </div>
        </div>

        {/* Resumo Despesas / Receitas (Live) */}
        <div className="flex w-full justify-between items-center mb-6 px-4 transition-opacity" style={{ opacity: loading ? 0.5 : 1 }}>
          <div className="flex flex-col items-center w-1/2 border-r border-slate-100">
            <span className="text-xs font-semibold text-slate-400 mb-1">Despesas</span>
            <span className="text-xl font-bold text-[#F03D1A]">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense)}
            </span>
          </div>
          <div className="flex flex-col items-center w-1/2">
            <span className="text-xs font-semibold text-slate-400 mb-1">Receitas</span>
            <span className="text-xl font-bold text-[#17B29F]">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(income)}
            </span>
          </div>
        </div>
        {/* Planejamento do Mês */}
        <div className="w-full bg-white border border-slate-100 rounded-2xl p-5 mb-8 shadow-sm">
          <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-4">Planejamento do Mês</h3>

          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-600">Meta de Gastos</span>
            <span className="text-sm font-bold text-slate-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(spendingGoal)}
            </span>
          </div>

          {/* Progress Bar Dinamica! */}
          <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${expense > spendingGoal ? 'bg-[#F03D1A]' : 'bg-[#45D1C0]'}`}
              style={{ width: `${Math.min((expense / spendingGoal) * 100, 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Rendimento Mínimo</span>
            <span className={`text-sm font-bold ${income >= incomeGoal ? 'text-[#17B29F]' : 'text-[#F03D1A]'}`}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(incomeGoal)}
            </span>
          </div>

          {/* Indicador visual do rendimento */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${income >= incomeGoal ? 'bg-[#17B29F]' : 'bg-amber-400'}`}
              style={{ width: `${Math.min((income / incomeGoal) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Botões de Ação Principais */}
        <div className="flex w-full gap-4 mt-auto p-4 md:p-0">
          <Link
            href="/lancamento/novo?type=expense"
            className="flex-1 flex items-center justify-center gap-2 bg-[#F03D1A] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-red-600 transition-colors"
          >
            <Minus size={24} />
            Despesa
          </Link>
          <Link
            href="/lancamento/novo?type=income"
            className="flex-1 flex items-center justify-center gap-2 bg-[#45D1C0] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-[#17B29F] transition-colors"
          >
            <Plus size={24} />
            Receita
          </Link>
        </div>

      </div>
    </>
  )
}
