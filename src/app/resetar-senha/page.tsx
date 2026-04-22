import { updatePassword } from '../auth/actions'
import { KeyRound } from 'lucide-react'

export default async function ResetarSenhaPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const params = await searchParams

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
            <div className="w-full max-w-sm flex flex-col items-center relative">
                <div className="w-16 h-16 bg-[#17B29F] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#17B29F]/30 mb-6 mt-4">
                    <KeyRound size={32} />
                </div>
                
                <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Criar Nova Senha</h1>
                <p className="text-sm font-medium text-slate-500 mb-8 text-center">
                    Digite sua nova senha de acesso ao aplicativo.
                </p>

                {params?.error === 'true' && (
                    <div className="w-full bg-red-100 border border-red-200 text-red-600 text-sm font-bold p-3 rounded-xl mb-6 text-center">
                        Erro ao redefinir a senha. Verifique se as senhas coincidem ou se o link expirou.
                    </div>
                )}

                <form action={updatePassword} className="w-full flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1" htmlFor="password">Nova Senha</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#17B29F] focus:ring-2 focus:ring-[#17B29F]/20 transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1" htmlFor="confirmPassword">Confirmar Nova Senha</label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            minLength={6}
                            placeholder="Repita a senha"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#17B29F] focus:ring-2 focus:ring-[#17B29F]/20 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-2 bg-[#17B29F] hover:bg-[#139c8b] text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-[#17B29F]/20 transition-all"
                    >
                        Redefinir Senha
                    </button>
                </form>
            </div>
        </div>
    )
}
