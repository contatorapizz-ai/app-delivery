import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { ADDRESS_CHANGED_EVENT, getLocalAddress, setLocalAddress } from '../lib/location'

export function useMyAddress(): { address: string; setAddress: (next: string) => Promise<void> } {
  const { session, profile, refreshProfile } = useAuth()
  const [localAddress, setLocalAddressState] = useState(getLocalAddress)

  useEffect(() => {
    function onChange() {
      setLocalAddressState(getLocalAddress())
    }
    window.addEventListener(ADDRESS_CHANGED_EVENT, onChange)
    return () => window.removeEventListener(ADDRESS_CHANGED_EVENT, onChange)
  }, [])

  const address = (session && profile?.address) || localAddress

  const setAddress = useCallback(
    async (next: string) => {
      if (session) {
        const { error } = await supabase.from('profiles').update({ address: next }).eq('id', session.user.id)
        if (error) throw error
        await refreshProfile()
      } else {
        setLocalAddress(next)
      }
    },
    [session, refreshProfile],
  )

  return { address, setAddress }
}
