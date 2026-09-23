import { useRef, useState, type ReactNode } from 'react'
import { uploadImage } from '../lib/upload'
import MediaTile from './MediaTile'

interface ImagePickerProps {
  value: string | null
  onChange: (url: string | null) => void
  icon: ReactNode
  tileClassName?: string
}

export default function ImagePicker({
  value,
  onChange,
  icon,
  tileClassName = 'h-16 w-16 rounded-xl',
}: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const url = await uploadImage(file)
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a foto.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <MediaTile src={value} alt="Foto" icon={icon} className={`shrink-0 ${tileClassName}`} />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:border-brand hover:text-brand disabled:opacity-50"
          >
            {uploading ? 'Enviando...' : value ? 'Trocar foto' : 'Enviar foto'}
          </button>
          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:border-red-300"
            >
              Remover
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFile}
        />
        <p className="text-[11px] text-neutral-400">JPG, PNG, WEBP ou GIF · até 5 MB</p>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  )
}
