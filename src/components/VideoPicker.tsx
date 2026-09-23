import { useRef, useState } from 'react'
import { uploadVideo } from '../lib/upload'

interface VideoPickerProps {
  value: string | null
  onChange: (url: string | null) => void
}

export default function VideoPicker({ value, onChange }: VideoPickerProps) {
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
      const url = await uploadVideo(file)
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar o vídeo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {value && (
        <video src={value} controls className="max-h-48 w-full rounded-lg bg-black" />
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:border-brand hover:text-brand disabled:opacity-50"
        >
          {uploading ? 'Enviando...' : value ? 'Trocar vídeo' : 'Enviar vídeo para o Rapizz Shop'}
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
      <input ref={inputRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={handleFile} />
      <p className="text-[11px] text-neutral-400">MP4 ou WEBM · até 30 MB · opcional, aparece no Rapizz Shop</p>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
