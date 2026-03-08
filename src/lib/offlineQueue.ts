export type OfflineRequest = {
    id: string
    url: string
    method: string
    body: any
    timestamp: number
}

const QUEUE_KEY = 'stitch_offline_queue'

export function saveToQueue(url: string, method: string, body: any) {
    if (typeof window === 'undefined') return

    const item: OfflineRequest = {
        id: crypto.randomUUID(),
        url,
        method,
        body,
        timestamp: Date.now()
    }

    const currentQueue = getQueue()
    currentQueue.push(item)
    localStorage.setItem(QUEUE_KEY, JSON.stringify(currentQueue))
}

export function getQueue(): OfflineRequest[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(QUEUE_KEY)
    if (!stored) return []
    try {
        return JSON.parse(stored)
    } catch {
        return []
    }
}

export function removeFromQueue(id: string) {
    if (typeof window === 'undefined') return
    const currentQueue = getQueue()
    const newQueue = currentQueue.filter(item => item.id !== id)
    localStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue))
}

export async function processQueue(adminHeaders: HeadersInit = {}) {
    if (typeof window === 'undefined' || !navigator.onLine) return

    const queue = getQueue()
    if (queue.length === 0) return

    console.log(`[Offline Sync] Processando ${queue.length} itens da fila...`)

    for (const item of queue) {
        try {
            const res = await fetch(item.url, {
                method: item.method,
                headers: {
                    'Content-Type': 'application/json',
                    ...adminHeaders
                },
                body: JSON.stringify(item.body)
            })

            if (res.ok) {
                removeFromQueue(item.id)
                console.log(`[Offline Sync] Sincronizado: ${item.url}`)
            } else {
                console.error(`[Offline Sync] Falha ao sincronizar: ${item.url}`, await res.text())
            }
        } catch (err) {
            console.error(`[Offline Sync] Erro de rede ao sincronizar: ${item.url}`, err)
            // Para de tentar processar se houver falha de rede fatal no loop
            break
        }
    }
}
