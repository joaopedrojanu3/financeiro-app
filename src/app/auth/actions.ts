'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/login?error=true')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            data: {
                full_name: formData.get('name') as string,
            }
        }
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        redirect('/cadastro?error=true')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function resetPassword(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    if (!email) {
        redirect('/esqueci-senha?error=true')
    }

    // A URL de redirecionamento precisa apontar para a rota de callback, que fará a troca do code pela sessão
    // A variável NEXT_PUBLIC_SITE_URL normalmente deve estar configurada na Vercel
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://financeiro-app.vercel.app'
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/callback?redirect_to=/resetar-senha`,
    })

    if (error) {
        redirect('/esqueci-senha?error=true')
    }

    redirect('/esqueci-senha?success=true')
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()
    
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!password || password !== confirmPassword) {
        redirect('/resetar-senha?error=true')
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        redirect('/resetar-senha?error=true')
    }

    // Após atualizar a senha com sucesso, redireciona para o login (ou para o app)
    redirect('/login?reset_success=true')
}
