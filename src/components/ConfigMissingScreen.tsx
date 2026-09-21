export default function ConfigMissingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <div className="max-w-md space-y-3 rounded-2xl border border-neutral-200 bg-white p-6 text-center">
        <span className="text-4xl">⚙️</span>
        <h1 className="text-lg font-bold text-neutral-900">Configuração pendente</h1>
        <p className="text-sm text-neutral-600">
          Este app precisa das variáveis de ambiente <code className="rounded bg-neutral-100 px-1">VITE_SUPABASE_URL</code> e{' '}
          <code className="rounded bg-neutral-100 px-1">VITE_SUPABASE_PUBLISHABLE_KEY</code> configuradas no ambiente de
          build (ex: Netlify → Site settings → Environment variables) para funcionar.
        </p>
        <p className="text-xs text-neutral-400">Depois de configurar, refaça o deploy para o build pegar os valores.</p>
      </div>
    </div>
  )
}
