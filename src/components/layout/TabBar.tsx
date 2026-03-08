'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function TabBar() {
    const pathname = usePathname()

    // Oculta a barra de extrato se não estiver na tela inicial (Home)
    if (pathname !== '/') {
        return null
    }

    return (
        <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-100 z-40 transition-transform pb-safe rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <Link
                href="/?extrato=true"
                scroll={false}
                className="flex flex-col items-center justify-center w-full min-h-[56px] cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl"
            >
                <div className="w-10 h-1 bg-slate-200 rounded-full mb-1 mt-2" />
                <span className="text-[10px] font-extrabold tracking-widest text-[#17B29F] uppercase mb-2">
                    VER EXTRATO DE LANÇAMENTOS
                </span>
            </Link>
        </nav>
    )
}
