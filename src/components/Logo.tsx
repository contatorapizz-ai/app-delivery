import logoLockup from '../brand/logo-lockup.svg?url'

export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const height = size === 'lg' ? 'h-11' : size === 'sm' ? 'h-7' : 'h-9'

  return <img src={logoLockup} alt="Rapizz" className={`${height} w-auto`} />
}
