'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, PieChart, Wallet, Settings, CalendarClock } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

export default function TabBar() {
    const pathname = usePathname()

    const tabs = [
        { name: 'INÍCIO', href: '/', icon: LayoutGrid },
        { name: 'EXTRATO', href: '/extrato', icon: PieChart },
        { name: 'LEMBRETES', href: '/lembretes', icon: CalendarClock },
        { name: 'PERFIL', href: '/perfil', icon: Settings },
    ]

    return (
        <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-100 z-50">
            <div className="flex justify-around items-center h-[72px] px-2 pb-safe">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href || (tab.href !== '/' && pathname?.startsWith(tab.href))
                    const Icon = tab.icon

                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={cn(
                                'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors',
                                isActive ? 'text-[#17B29F]' : 'text-slate-400 hover:text-slate-600'
                            )}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-semibold tracking-wide">
                                {tab.name}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
