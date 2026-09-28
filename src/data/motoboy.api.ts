import { supabase } from '../lib/supabase'
import type { MotoboyProfileRow, MotoboyStatus, ProfileRow } from '../types/database'

export async function fetchMyMotoboyProfile(profileId: string): Promise<MotoboyProfileRow | null> {
  const { data, error } = await supabase.from('motoboy_profiles').select('*').eq('profile_id', profileId).maybeSingle()
  if (error) throw error
  return (data as MotoboyProfileRow | null) ?? null
}

export async function registerMotoboy(profileId: string, vehicleType: string, vehiclePlate: string): Promise<void> {
  const { error } = await supabase
    .from('motoboy_profiles')
    .insert({ profile_id: profileId, vehicle_type: vehicleType, vehicle_plate: vehiclePlate || null })
  if (error) throw error

  // só promove quem ainda é 'cliente' (default) — nunca rebaixa admin/lojista
  await supabase.from('profiles').update({ role: 'motoboy' }).eq('id', profileId).eq('role', 'cliente')
}

export async function setMotoboyAvailability(profileId: string, isAvailable: boolean): Promise<void> {
  const { error } = await supabase.from('motoboy_profiles').update({ is_available: isAvailable }).eq('profile_id', profileId)
  if (error) throw error
}

export interface MotoboyWithProfile {
  motoboy: MotoboyProfileRow
  profile: ProfileRow
}

export async function fetchAllMotoboys(): Promise<MotoboyWithProfile[]> {
  const { data, error } = await supabase
    .from('motoboy_profiles')
    .select('*, profile:profiles(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return ((data ?? []) as (MotoboyProfileRow & { profile: ProfileRow | null })[])
    .filter((row): row is MotoboyProfileRow & { profile: ProfileRow } => row.profile !== null)
    .map((row) => ({ motoboy: row, profile: row.profile }))
}

export async function setMotoboyStatus(profileId: string, status: MotoboyStatus): Promise<void> {
  const { error } = await supabase.from('motoboy_profiles').update({ status }).eq('profile_id', profileId)
  if (error) throw error
}
