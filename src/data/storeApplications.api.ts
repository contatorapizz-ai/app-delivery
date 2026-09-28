import { supabase } from '../lib/supabase'

export type StoreApprovalStatus = 'pendente' | 'aprovada' | 'bloqueada'

export interface StoreApplication {
  id: string
  owner_id: string
  name: string
  category: string
  address: string
  whatsapp: string
  approval_status: StoreApprovalStatus
  created_at: string
}

export interface StoreApplicationWithOwner extends StoreApplication {
  owner_name: string
  owner_email: string | null
}

export async function fetchMyStoreApplication(userId: string): Promise<StoreApplication | null> {
  const { data, error } = await supabase
    .from('stores')
    .select('id, owner_id, name, category, address, whatsapp, approval_status, created_at')
    .eq('owner_id', userId)
    .maybeSingle()
  if (error) throw error
  return data as StoreApplication | null
}

export async function applyAsLojista(input: {
  name: string
  category: string
  address: string
  whatsapp: string
}): Promise<StoreApplication> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('Sessão expirada. Entre novamente.')

  const { data, error } = await supabase
    .from('stores')
    .insert({
      owner_id: auth.user.id,
      name: input.name,
      category: input.category,
      address: input.address,
      whatsapp: input.whatsapp,
      approval_status: 'pendente',
      is_open: false,
    })
    .select('id, owner_id, name, category, address, whatsapp, approval_status, created_at')
    .single()
  if (error) throw error
  return data as StoreApplication
}

export async function fetchPendingStoreApplications(): Promise<StoreApplicationWithOwner[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('id, owner_id, name, category, address, whatsapp, approval_status, created_at, owner:profiles(full_name, email)')
    .eq('approval_status', 'pendente')
    .order('created_at', { ascending: true })
  if (error) throw error
  return ((data ?? []) as unknown as (StoreApplication & { owner: { full_name: string; email: string | null } | null })[]).map(
    (row) => ({ ...row, owner_name: row.owner?.full_name ?? 'Sem nome', owner_email: row.owner?.email ?? null }),
  )
}

export async function approveStoreApplication(storeId: string, ownerId: string): Promise<void> {
  const { error: storeError } = await supabase
    .from('stores')
    .update({ approval_status: 'aprovada', is_open: true })
    .eq('id', storeId)
  if (storeError) throw storeError

  const { error: roleError } = await supabase
    .from('profiles')
    .update({ role: 'lojista' })
    .eq('id', ownerId)
    .eq('role', 'cliente')
  if (roleError) throw roleError
}

export async function rejectStoreApplication(storeId: string): Promise<void> {
  const { error } = await supabase.from('stores').update({ approval_status: 'bloqueada', is_open: false }).eq('id', storeId)
  if (error) throw error
}
