'use client'

import React, { useMemo, useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import ExtratoSheet from '@/components/ExtratoSheet'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Wallet, Utensils, Car, ShoppingBag, HeartPulse, Receipt, Minus, Plus, CalendarClock, TrendingUp, Target, Tag, Home, PiggyBank, Briefcase, Building, Smartphone, Dumbbell, Plane, Coffee, Music, Book, Gift, Wrench, Scissors, Monitor, Truck, Zap, Camera, Umbrella, LucideIcon } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { useReminders } from '@/hooks/useReminders'
import { useCategories } from '@/hooks/useCategories'
import { isThisMonth, parseISO, format, addMonths, addDays, addWeeks, addYears, isAfter, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isExtratoOpen = searchParams?.get('extrato') === 'true'

  const { transactions, loading } = useTransactions()
  const { reminders, isOccurrencePaid } = useReminders()
  const { categories } = useCategories()

  const dashboardCats = categories.filter(c => c.show_on_dashboard && c.type === 'expense')

  const [savingsGoal, setSavingsGoal] = useState<number>(0)
  const [showSavingsGoal, setShowSavingsGoal] = useState<boolean>(false)

  useEffect(() => {
    async function fetchGoal() {
      try {
        const res = await fetch('/api/user-settings')
        if (res.ok) {
          const data = await res.json()
          setSavingsGoal(data.monthly_spending_goal || 0)
          setShowSavingsGoal(data.show_savings_goal_on_dashboard ?? true)
        }
      } catch (err) {
        console.error('Erro ao buscar meta:', err)
      }
    }
    fetchGoal()
  }, [])

  // Calcula receitas e despesas do mês a partir de transações reais
  const { income, expense, chartData, catTotals } = useMemo(() => {
    let incomeCount = 0
    let expenseCount = 0
    const catTotals: Record<string, { value: number, color: string, name: string }> = {}

    transactions.forEach(t => {
      if (!isThisMonth(parseISO(t.date))) return
      const amount = Number(t.amount)
      if (t.type === 'income') incomeCount += amount
      else if (t.type === 'expense') {
        expenseCount += amount
        const catName = t.categories?.name || 'Outros'
        const catColor = t.categories?.color || '#3B82F6'
        if (!catTotals[catName]) catTotals[catName] = { value: 0, color: catColor, name: catName }
        catTotals[catName].value += amount
      }
    })

    const chart = Object.values(catTotals).map(item => ({ name: item.name, value: item.value, color: item.color }))
    if (chart.length === 0) chart.push({ name: 'Vazio', value: 1, color: '#e2e8f0' })

    return { income: incomeCount, expense: expenseCount, chartData: chart, catTotals }
  }, [transactions])

  // RENDIMENTO MÍNIMO = soma automática das contas pendentes do mês atual
  const { rendimentoMinimo, pendingCount } = useMemo(() => {
    const today = startOfDay(new Date())
    let total = 0
    let count = 0

    reminders.filter(r => r.is_active && r.type === 'expense').forEach(r => {
      const start = parseISO(r.due_date)

      if (r.frequency === 'Único') {
        const dateStr = format(start, 'yyyy-MM-dd')
        if (isThisMonth(start) && !isOccurrencePaid(r.id, dateStr)) {
          total += Number(r.amount)
          count++
        }
        return
      }

      const end = r.end_date ? parseISO(r.end_date) : null
      let current = start
      let index = 1
      const max = 60

      while (index <= max) {
        if (end && isAfter(current, end)) break
        const dateStr = format(current, 'yyyy-MM-dd')

        if (isThisMonth(current) && !isOccurrencePaid(r.id, dateStr)) {
          total += Number(r.amount)
          count++
        }

        switch (r.frequency) {
          case 'Diário': current = addDays(current, 1); break
          case 'Semanal': current = addWeeks(current, 1); break
          case 'Mensal': current = addMonths(start, index); break
          case 'Anual': current = addYears(start, index); break
          default: current = addMonths(start, index); break
        }
        index++
        if (!isThisMonth(current) && isAfter(current, today)) break
      }
    })

    return { rendimentoMinimo: total, pendingCount: count }
  }, [reminders, isOccurrencePaid])

  // Rendimento Mínimo TOTAL = apenas contas pendentes + Gastos já feitos
  const rendimentoMinimoTotal = rendimentoMinimo + expense
  const incomeCoversMinimo = rendimentoMinimoTotal > 0 ? Math.min((income / rendimentoMinimoTotal) * 100, 100) : 100
  const isIncomeSufficient = income >= rendimentoMinimoTotal

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  const currentMonthName = format(new Date(), 'MMMM', { locale: ptBR })
  const monthDisplay = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)

  // Total salvo real (receita menos TODO o custo mínimo vital e que já foi gasto)
  const totalSaved = Math.max(0, income - rendimentoMinimoTotal)
  const savingsProgress = savingsGoal > 0 ? Math.min((totalSaved / savingsGoal) * 100, 100) : 0
  return (
    <>
      <div className="flex flex-col w-full min-h-full pb-32 pt-2 bg-slate-50/30">

        {/* Gráfico Metade Superior & Resumo Interno */}
        <div className="relative w-full aspect-square max-w-[300px] mx-auto mb-14 mt-8">
          <ResponsiveContainer width="100%" height="100%" className="z-10 relative">
            <PieChart>
              <Pie data={chartData} innerRadius={105} outerRadius={125} paddingAngle={2} dataKey="value" stroke="none" cornerRadius={4}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Linhas de conexão do gráfico para os ícones */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg width="100%" height="100%" style={{ overflow: "visible" }}>
              {dashboardCats.map((cat, index) => {
                const angle = (index / dashboardCats.length) * 2 * Math.PI - Math.PI / 2
                const radiusLineStart = 126 // Borda do gráfico
                const radiusLineEnd = 145 // Chega perto do ícone

                const x1 = Math.cos(angle) * radiusLineStart
                const y1 = Math.sin(angle) * radiusLineStart
                const x2 = Math.cos(angle) * radiusLineEnd
                const y2 = Math.sin(angle) * radiusLineEnd

                return (
                  <line
                    key={`line-${cat.id}`}
                    x1={`calc(50% + ${x1}px)`}
                    y1={`calc(50% + ${y1}px)`}
                    x2={`calc(50% + ${x2}px)`}
                    y2={`calc(50% + ${y2}px)`}
                    stroke={cat.color || "#cbd5e1"}
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity={0.5}
                  />
                )
              })}
            </svg>
          </div>

          {/* Oco do Gráfico: Valores Receita e Despesa */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[12px] font-bold text-slate-400 tracking-widest uppercase mb-1">{monthDisplay}</span>
            <div className="flex flex-col items-center leading-tight">
              <span className="text-[9px] uppercase font-semibold text-[#17B29F]/80">Rendimentos</span>
              <span className="text-xl sm:text-2xl font-bold text-[#17B29F] tracking-tight">{fmt(income)}</span>
            </div>
            <div className="flex flex-col items-center leading-tight mt-1">
              <span className="text-[9px] uppercase font-semibold text-[#F03D1A]/80">Despesas</span>
              <span className="text-xl sm:text-2xl font-bold text-[#F03D1A] tracking-tight">{fmt(expense)}</span>
            </div>
          </div>

          {/* Ícones Orbitais: Dinâmicos */}
          {dashboardCats.map((cat, index) => {
            const angle = (index / dashboardCats.length) * 2 * Math.PI - Math.PI / 2
            const radius = 160 // Raio da orbita mais compacto
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius

            const IconComp = iconMap[cat.icon] || Tag

            // Calcula qual a porcentagem dessa categoria no mês com base na RECEITA (Income)
            const catExp = catTotals[cat.name]?.value || 0
            const percentage = income > 0 ? Math.round((catExp / income) * 100) : 0

            return (
              <Link
                key={cat.id}
                href={`/lancamento/novo?type=${cat.type}&categoryId=${cat.id}`}
                className="absolute flex flex-col items-center justify-center cursor-pointer transition-all transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 z-10 group"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`
                }}
              >
                <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-white/50 shadow-sm shadow-[#17B29F]/5 group-hover:bg-white group-hover:shadow-md transition-all">
                  <IconComp size={20} strokeWidth={2} style={{ color: cat.color }} />
                </div>
                {percentage > 0 && (
                  <span className="text-[10px] font-bold text-slate-500 mt-1">{percentage}%</span>
                )}
              </Link>
            )
          })}
        </div>

        {/* O restante do corpo vai direto para o Planejamento do Mês no layout inspirado do Monefy (Saldo já está no Header e Alerta no Sino) */}

        {/* ========== LEMBRETES ========== */}
        <div className="px-5 w-full flex flex-col gap-3">
          <Link href="/lembretes" className="w-full bg-[#45D1C0]/10 border border-[#45D1C0]/20 rounded-[20px] p-4 flex items-center justify-between shadow-sm hover:bg-[#45D1C0]/20 transition-colors">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#17B29F] flex items-center gap-2"><CalendarClock size={16} /> Contas a Pagar</span>
              <span className="text-[11px] text-[#17B29F]/70 font-medium">Acompanhar vencimentos e recorrências</span>
            </div>
            {pendingCount > 0 && (
              <span className="bg-[#F03D1A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                {pendingCount} Pendentes
              </span>
            )}
          </Link>

          {/* ========== PLANEJAMENTO & META ========== */}
          <div className="w-full bg-white/90 backdrop-blur-md border border-slate-100 rounded-[20px] p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-3">

            {/* Planejamento */}
            <div className="flex flex-col">
              <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2"><TrendingUp size={14} /> Mínimo Mês</span>
                <span className={`text-sm font-extrabold tracking-tight ${isIncomeSufficient ? 'text-[#17B29F]' : 'text-[#F03D1A]'}`}>
                  {fmt(rendimentoMinimoTotal)}
                </span>
              </h3>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mb-1.5 overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${isIncomeSufficient ? 'bg-[#17B29F]' : 'bg-[#F03D1A]'}`}
                  style={{ width: `${incomeCoversMinimo}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] font-medium text-slate-500">
                <span>Receitas: {fmt(income)}</span>
                <span className="flex items-center gap-1"><CalendarClock size={9} /> Falta Pagar: {fmt(rendimentoMinimo)} <Minus size={9} /> Já Gasto: {fmt(expense)}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold mt-1.5 pt-1.5 border-t border-slate-50">
                <span className="text-slate-500">Status para Cobrir o Mês:</span>
                <span className={isIncomeSufficient ? 'text-[#17B29F]' : 'text-[#F03D1A]'}>
                  {isIncomeSufficient
                    ? `Sobra ${fmt(income - rendimentoMinimoTotal)} livre`
                    : `Falta ${fmt(rendimentoMinimoTotal - income)}`}
                </span>
              </div>
            </div>

            {/* Divisor */}
            {showSavingsGoal && savingsGoal >= 0 && (
              <>
                <div className="w-full h-px bg-slate-100" />

                {/* Meta de Economia */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1.5"><Target size={12} /> Meta: {fmt(savingsGoal)}</span>
                    <span className="text-[10px] font-bold text-[#17B29F]">Salvo: {fmt(totalSaved)} ({savingsProgress.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#17B29F] rounded-full transition-all duration-1000"
                      style={{ width: `${savingsProgress}%` }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Floating Action Buttons */}
          <div className="fixed bottom-[85px] left-0 right-0 flex justify-between px-10 pointer-events-none z-[60] max-w-md mx-auto">
            <Link href="/lancamento/novo?type=expense" className="pointer-events-auto w-[64px] h-[64px] bg-white border-4 border-[#F03D1A] text-[#F03D1A] rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors">
              <Minus size={32} strokeWidth={3} />
            </Link>
            <Link href="/lancamento/novo?type=income" className="pointer-events-auto w-[64px] h-[64px] bg-white border-4 border-[#17B29F] text-[#17B29F] rounded-full flex items-center justify-center shadow-lg hover:bg-teal-50 transition-colors">
              <Plus size={32} strokeWidth={3} />
            </Link>
          </div>

        </div>
      </div>

      <ExtratoSheet isOpen={isExtratoOpen} onClose={() => router.push('/')} />
    </>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center p-10"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#17B29F] animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  )
}
