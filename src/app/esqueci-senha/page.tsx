import Link from 'next/link'
import { resetPassword } from '../auth/actions'
import { KeyRound, ArrowLeft } from 'lucide-react'

export default async function EsqueciSenhaPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string; error?: string }>
}) {
    const params = await searchParams

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
            <div className="w-full max-w-sm flex flex-col items-center relative">
                <Link href="/login" className="absolute left-0 top-0 text-slate-400 hover:text-slate-600 p-2 -ml-2 -mt-2">
                    <ArrowLeft size={20} />
                </Link>

                <div className="w-16 h-16 bg-[#17B29F] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#17B29F]/30 mb-6 mt-4">
                    <KeyRound size={32} />
                </div>
                
                <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Recuperar Senha</h1>
                <p className="text-sm font-medium text-slate-500 mb-8 text-center">
                    Digite seu email e enviaremos um link para você redefinir sua senha.
                </p>

                {params?.success === 'true' && (
                    <div className="w-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-sm font-bold p-4 rounded-xl mb-6 text-center shadow-sm">
                        Verifique sua caixa de entrada (e spam) para redefinir a senha!
                    </div>
                )}

                {params?.error === 'true' && (
                    <div className="w-full bg-red-100 border border-red-200 text-red-600 text-sm font-bold p-3 rounded-xl mb-6 text-center">
                        Erro ao tentar enviar o email. Tente novamente.
                    </div>
                )}

                <form action={resetPassword} className="w-full flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1" htmlFor="email">Email cadastrado</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="seu@email.com"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#17B29F] focus:ring-2 focus:ring-[#17B29F]/20 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-2 bg-[#17B29F] hover:bg-[#139c8b] text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-[#17B29F]/20 transition-all"
                    >
                        Enviar link de recuperação
                    </button>
                </form>
            </div>
        </div>
    )
}
