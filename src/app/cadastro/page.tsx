import Link from 'next/link'
import { signup } from '../auth/actions'
import { Wallet, UserPlus } from 'lucide-react'

export default async function CadastroPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const params = await searchParams
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
            <div className="w-full max-w-sm flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20 mb-6">
                    <UserPlus size={32} />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Criar perfil</h1>
                <p className="text-sm font-medium text-slate-500 mb-8 text-center">Junte-se à família para gerenciar finanças facilmente.</p>

                {params?.error === 'true' && (
                    <div className="w-full bg-red-100 border border-red-200 text-red-600 text-sm font-bold p-3 rounded-lg mb-4 text-center">
                        Ocorreu um erro no cadastro. Verifique os dados.
                    </div>
                )}

                <form action={signup} className="w-full flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1" htmlFor="name">Como podemos te chamar?</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            placeholder="Seu nome"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1" htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="seu@email.com"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1" htmlFor="password">Senha</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="Mínimo de 6 caracteres"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-slate-900/20 transition-all"
                    >
                        Criar meu perfil
                    </button>

                    <div className="text-center mt-6">
                        <span className="text-xs font-medium text-slate-500">Já faz parte da família? </span>
                        <Link href="/login" className="text-xs font-bold text-slate-900 hover:underline">
                            Fazer login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
