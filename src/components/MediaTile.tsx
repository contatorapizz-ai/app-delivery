import { useState } from 'react'

interface MediaTileProps {
  src?: string | null
  alt: string
  icon: string
  className?: string
  imgClassName?: string
  iconClassName?: string
}

export default function MediaTile({
  src,
  alt,
  icon,
  className = '',
  imgClassName = '',
  iconClassName = 'text-3xl',
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
        <div className={`grid h-full w-full place-items-center text-neutral-300 ${iconClassName}`}>
          <span aria-hidden className="opacity-70">
            {icon}
          </span>
        </div>
      )}
    </div>
  )
}
