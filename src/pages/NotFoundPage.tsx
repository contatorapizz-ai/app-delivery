import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <SearchX className="h-12 w-12 text-neutral-300" strokeWidth={1.5} />
      <h1 className="text-lg font-bold text-neutral-900">Página não encontrada</h1>
      <Link to="/" className="mt-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white">
        Voltar ao início
      </Link>
    </div>
  )
}
