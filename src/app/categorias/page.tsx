'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, Trash2, Tag, Utensils, Home, Car, Receipt, HeartPulse, ShoppingBag, PiggyBank, Briefcase, Building, Smartphone, Dumbbell, Plane, Coffee, Music, Book, Gift, Wrench, Scissors, Monitor, Truck, Zap, Camera, Umbrella, LucideIcon } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'

// Default available icons to choose from
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

export default function CategoriasPage() {
    const router = useRouter()
    const { categories, loading, toggleDashboardVisibility, deleteCategory, createCategory } = useCategories()
    const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense')
    const [isAdding, setIsAdding] = useState(false)
    const [newName, setNewName] = useState('')
    const [newIcon, setNewIcon] = useState('tag')
    const [newColor, setNewColor] = useState('#17B29F')

    const filtered = categories.filter(c => c.type === activeTab)

    const handleCreate = async () => {
        if (!newName.trim()) return
        await createCategory({
            name: newName,
            type: activeTab,
            icon: newIcon,
            color: newColor,
            show_on_dashboard: false
        })
        setIsAdding(false)
        setNewName('')
        setNewIcon('tag')
        setNewColor(activeTab === 'income' ? '#17B29F' : '#F03D1A')
    }

    return (
        <div className="relative flex min-h-screen w-full max-w-md mx-auto flex-col bg-slate-50 overflow-hidden shadow-xl font-sans pb-20">
            {/* Header */}
            <div className="flex items-center bg-white px-4 py-3 justify-between border-b border-slate-100 shrink-0">
                <button onClick={() => router.back()} className="text-slate-900 flex size-10 items-center justify-center hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-slate-900 text-base font-bold flex-1 text-center">Categorias</h2>
                <div className="size-10"></div>
            </div>

            {/* Tabs */}
            <div className="px-5 mt-4">
                <div className="flex bg-slate-200/50 p-1 rounded-xl">
                    <button
                        className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${activeTab === 'expense' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => { setActiveTab('expense'); setNewColor('#F03D1A') }}
                    >
                        Despesas
                    </button>
                    <button
                        className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${activeTab === 'income' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => { setActiveTab('income'); setNewColor('#17B29F') }}
                    >
                        Rendimentos
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                    </div>
                ) : (
                    <>
                        {filtered.length === 0 ? (
                            <p className="text-center text-sm text-slate-500 mt-10">Nenhuma categoria encontrada.</p>
                        ) : (
                            filtered.map(cat => {
                                const IconComp = iconMap[cat.icon] || Tag
                                return (
                                    <div key={cat.id} className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${cat.color}1A`, color: cat.color }}>
                                            <IconComp size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-900 mb-2">{cat.name}</p>
                                            {activeTab === 'expense' && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400">Mostrar na Home</span>
                                                    <button
                                                        onClick={() => toggleDashboardVisibility(cat.id, cat.show_on_dashboard)}
                                                        className={`w-10 h-5 rounded-full flex items-center transition-colors px-1 ${cat.show_on_dashboard ? 'bg-[#17B29F]' : 'bg-slate-300'}`}
                                                    >
                                                        <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${cat.show_on_dashboard ? 'translate-x-4' : 'translate-x-0'}`} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Tem certeza que deseja apagar essa categoria?')) deleteCategory(cat.id)
                                            }}
                                            className="ml-2 text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-slate-50"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )
                            })
                        )}
                    </>
                )}

                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-dashed border-slate-300 rounded-xl text-slate-500 font-bold text-sm tracking-wide mt-4 hover:bg-slate-50 transition-colors"
                    >
                        <Plus size={18} />
                        NOVA CATEGORIA
                    </button>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-xl p-4 mt-6 animate-in fade-in slide-in-from-bottom-4 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 mb-3">Criar nova {activeTab === 'income' ? 'receita' : 'despesa'}</h3>

                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Nome da Categoria"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#17B29F] outline-none mb-3"
                        />

                        <div className="flex gap-2 mb-3 items-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase w-12">Ícone:</span>
                            <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
                                {Object.keys(iconMap).map(iconName => {
                                    const I = iconMap[iconName]
                                    return (
                                        <button
                                            key={iconName}
                                            onClick={() => setNewIcon(iconName)}
                                            className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${newIcon === iconName ? 'border-[#17B29F] bg-[#17B29F]/10 text-[#17B29F]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            <I size={20} />
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="flex gap-2 mb-5 items-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase w-12">Cor:</span>
                            <div className="flex flex-1 gap-2 flex-wrap">
                                {['#F03D1A', '#17B29F', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#10B981', '#06B6D4', '#6366F1', '#D946EF', '#F97316', '#84CC16', '#334155', '#EF4444'].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setNewColor(c)}
                                        className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                                        style={{ backgroundColor: c, borderColor: newColor === c ? '#1e293b' : 'transparent' }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => setIsAdding(false)} className="flex-1 py-2 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold text-sm">
                                Cancelar
                            </button>
                            <button onClick={handleCreate} className="flex-1 py-2 rounded-lg text-white bg-[#17B29F] hover:bg-[#128a7b] font-semibold text-sm">
                                Salvar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
