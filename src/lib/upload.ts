import { supabase } from './supabase'

const IMAGE_MAX_BYTES = 5 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const VIDEO_MAX_BYTES = 30 * 1024 * 1024
const VIDEO_TYPES = ['video/mp4', 'video/webm']

async function uploadToMedia(file: File): Promise<string> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('Sessão expirada. Entre novamente.')

  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
  const path = `${auth.user.id}/${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage.from('media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error

  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
}

export async function uploadImage(file: File): Promise<string> {
  if (!IMAGE_TYPES.includes(file.type)) {
    throw new Error('Formato não aceito. Envie uma imagem JPG, PNG, WEBP ou GIF.')
  }
  if (file.size > IMAGE_MAX_BYTES) {
    throw new Error('Imagem muito grande. O tamanho máximo é 5 MB.')
  }
  return uploadToMedia(file)
}

export async function uploadVideo(file: File): Promise<string> {
  if (!VIDEO_TYPES.includes(file.type)) {
    throw new Error('Formato não aceito. Envie um vídeo MP4 ou WEBM.')
  }
  if (file.size > VIDEO_MAX_BYTES) {
    throw new Error('Vídeo muito grande. O tamanho máximo é 30 MB.')
  }
  return uploadToMedia(file)
}
