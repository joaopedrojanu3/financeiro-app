import Link from 'next/link'
import { login } from '../auth/actions'
import { Wallet } from 'lucide-react'

export default function LoginPage({
    searchParams,
}: {
    searchParams: { error?: string }
}) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
            <div className="w-full max-w-sm flex flex-col items-center">
                <div className="w-16 h-16 bg-[#45D1C0] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#45D1C0]/30 mb-6">
                    <Wallet size={32} />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Bem-vindo de volta!</h1>
                <p className="text-sm font-medium text-slate-500 mb-8 text-center">Entre para acessar as finanças da família.</p>

                {searchParams?.error === 'true' && (
                    <div className="w-full bg-red-100 border border-red-200 text-red-600 text-sm font-bold p-3 rounded-lg mb-4 text-center">
                        Email ou senha inválidos. Tente novamente.
                    </div>
                )}

                <form action={login} className="w-full flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1" htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="seu@email.com"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#45D1C0] focus:ring-2 focus:ring-[#45D1C0]/20 transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1" htmlFor="password">Senha</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="Sua senha secreta"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#45D1C0] focus:ring-2 focus:ring-[#45D1C0]/20 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-2 bg-[#45D1C0] hover:bg-[#3bb8a8] text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-[#45D1C0]/20 transition-all"
                    >
                        Entrar no app
                    </button>

                    <div className="text-center mt-6">
                        <span className="text-xs font-medium text-slate-500">Não tem uma conta? </span>
                        <Link href="/cadastro" className="text-xs font-bold text-[#45D1C0] hover:underline">
                            Criar perfil
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
