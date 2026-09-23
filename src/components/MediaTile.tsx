import { useState, type ReactNode } from 'react'

interface MediaTileProps {
  src?: string | null
  alt: string
  icon: ReactNode
  className?: string
  imgClassName?: string
  iconWrapClassName?: string
}

export default function MediaTile({
  src,
  alt,
  icon,
  className = '',
  imgClassName = '',
  iconWrapClassName = 'text-neutral-300',
}: MediaTileProps) {
  const [broken, setBroken] = useState(false)
  const showImage = Boolean(src) && !broken

  return (
    <div className={`overflow-hidden bg-neutral-100 ${className}`}>
      {showImage ? (
        <img
          src={src as string}
          alt={alt}
          loading="lazy"
          className={`h-full w-full object-cover ${imgClassName}`}
          onError={() => setBroken(true)}
        />
      ) : (
        <div className={`grid h-full w-full place-items-center ${iconWrapClassName}`}>{icon}</div>
      )}
    </div>
  )
}
