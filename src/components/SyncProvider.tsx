'use client'

import { useEffect, useState } from 'react'
import { processQueue, getQueue } from '@/lib/offlineQueue'
import { getAdminHeaders } from '@/lib/apiClient'
import { WifiOff, ShieldCheck } from 'lucide-react'

export default function SyncProvider({ children }: { children: React.ReactNode }) {
    const [isOffline, setIsOffline] = useState(false)
    const [pendingItems, setPendingItems] = useState(0)

    useEffect(() => {
        // Inicializa estado
        setIsOffline(!navigator.onLine)
        setPendingItems(getQueue().length)

        const handleOnline = () => {
            setIsOffline(false)
            // Dispara sincronização
            processQueue(getAdminHeaders()).then(() => {
                setPendingItems(getQueue().length)
                // Usamos location.reload global para aplicar as transações aos hooks originais
                // uma vez que a fila foi esvaziada. Como PWA fará cache da tela, será rápido.
                setTimeout(() => window.location.reload(), 1500)
            })
        }

        const handleOffline = () => {
            setIsOffline(true)
        }

        // Intervalo para atualizar visualmente o número de itens na fila se fomos enviando sem fechar a página
        const interval = setInterval(() => {
            setPendingItems(getQueue().length)
        }, 3000)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
            clearInterval(interval)
        }
    }, [])

    return (
        <>
            {/* Banner de Status Offline */}
            {isOffline && (
                <div className="fixed top-[64px] left-0 right-0 z-50 bg-[#F43F5E] text-white text-[11px] font-bold py-1.5 px-4 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-2">
                        <WifiOff size={14} />
                        <span>VOCÊ ESTÁ OFFLINE</span>
                    </div>
                    {pendingItems > 0 && (
                        <div className="bg-white/20 px-2 py-0.5 rounded-full">
                            {pendingItems} pendente(s)
                        </div>
                    )}
                </div>
            )}

            {/* Banner de Sincronizando (Aparece quando a internet volta e tem items) */}
            {!isOffline && pendingItems > 0 && (
                <div className="fixed top-[64px] left-0 right-0 z-50 bg-[#17B29F] text-white text-[11px] font-bold py-1.5 px-4 flex items-center justify-center gap-2 shadow-sm animate-pulse">
                    <ShieldCheck size={14} />
                    <span>SINCRONIZANDO DADOS COM A NUVEM...</span>
                </div>
            )}

            {children}
        </>
    )
}
