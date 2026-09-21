import { supabase } from '../lib/supabase'

async function callAdminUsers(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) throw new Error('Sessão expirada. Entre novamente.')

  const { data, error } = await supabase.functions.invoke('admin-users', {
    body,
    headers: { Authorization: `Bearer ${token}` },
  })

  if (error) {
    const message = (data as { error?: string } | null)?.error ?? error.message
    throw new Error(message)
  }
  return data as Record<string, unknown>
}

export async function createLojista(input: {
  email: string
  fullName: string
  password: string
}): Promise<{ id: string; email: string }> {
  const result = await callAdminUsers({ action: 'create_lojista', ...input })
  return result as { id: string; email: string }
}

export async function deleteAccount(userId: string): Promise<void> {
  await callAdminUsers({ action: 'delete_account', userId })
}

export async function deleteStore(storeId: string): Promise<void> {
  const { error } = await supabase.from('stores').delete().eq('id', storeId)
  if (error) throw error
}
