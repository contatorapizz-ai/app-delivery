export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'h-12 w-12 text-2xl' : size === 'sm' ? 'h-8 w-8 text-base' : 'h-10 w-10 text-xl'
  const textSize = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-xl'

  return (
    <span className="flex items-center gap-2.5">
      <span
        className={`grid ${dims} shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-red-500 via-brand to-brand-dark shadow-sm shadow-red-900/20`}
      >
        🍕
      </span>
      <span className={`${textSize} font-extrabold tracking-tight text-neutral-900`}>
        Rapizz
      </span>
    </span>
  )
}
