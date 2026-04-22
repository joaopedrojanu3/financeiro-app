import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('redirect_to') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Retorna para uma tela de erro ou login com mensagem se falhar
    return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
