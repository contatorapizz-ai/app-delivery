import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="text-5xl">🔎</span>
      <h1 className="text-lg font-bold text-neutral-900">Página não encontrada</h1>
      <Link to="/" className="mt-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white">
        Voltar ao início
      </Link>
    </div>
  )
}
