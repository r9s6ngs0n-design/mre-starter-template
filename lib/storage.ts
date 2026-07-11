import { createClient } from '@/lib/supabase/client'

export type StorageBucket =
  | 'listing-images'
  | 'listing-renders'
  | 'listing-floorplans'
  | 'listing-brochures'
  | 'blog-covers'
  | 'team-photos'
  | 'documents'

export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const supabase = createClient()

  if (onProgress) onProgress(10)

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: '3600',
  })

  if (error) throw error
  if (onProgress) onProgress(90)

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  if (onProgress) onProgress(100)
  return data.publicUrl
}

export async function deleteFile(bucket: StorageBucket, path: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}

export function storagePath(prefix: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase()
  return `${prefix}/${Date.now()}-${safe}`
}
