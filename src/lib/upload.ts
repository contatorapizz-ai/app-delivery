import { supabase } from './supabase'

const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function uploadImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Formato não aceito. Envie uma imagem JPG, PNG, WEBP ou GIF.')
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Imagem muito grande. O tamanho máximo é 5 MB.')
  }

  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('Sessão expirada. Entre novamente.')

  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `${auth.user.id}/${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage.from('media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error

  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
}
