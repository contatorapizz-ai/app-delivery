import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { CITY_CHANGED_EVENT, getSelectedCity, setSelectedCity as setLocalCity } from '../lib/location'

export function useSelectedCity(): { city: string; setCity: (next: string) => Promise<void> } {
  const { session, profile, refreshProfile } = useAuth()
  const [localCity, setLocalCityState] = useState(getSelectedCity)

  useEffect(() => {
    function onChange() {
      setLocalCityState(getSelectedCity())
    }
    window.addEventListener(CITY_CHANGED_EVENT, onChange)
    return () => window.removeEventListener(CITY_CHANGED_EVENT, onChange)
  }, [])

  const city = (session && profile?.city) || localCity

  const setCity = useCallback(
    async (next: string) => {
      if (session) {
        const { error } = await supabase.from('profiles').update({ city: next }).eq('id', session.user.id)
        if (error) throw error
        await refreshProfile()
      } else {
        setLocalCity(next)
      }
    },
    [session, refreshProfile],
  )

  return { city, setCity }
}
