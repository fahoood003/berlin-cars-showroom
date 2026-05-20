import { supabaseAdmin } from '../../lib/supabase'
import { isAdminRequest } from '../../lib/auth'

export const config = { api: { bodyParser: { sizeLimit: '20mb' } } }

export default async function handler(req, res) {
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'POST') {
    const { car_id, base64, filename, is_cover, sort_order } = req.body
    if (!car_id || !base64) return res.status(400).json({ error: 'Missing fields' })

    const ext = filename?.split('.').pop() || 'jpg'
    const path = `${car_id}/${Date.now()}.${ext}`

    const buffer = Buffer.from(base64.split(',')[1] || base64, 'base64')
    const contentType = base64.startsWith('data:image/png') ? 'image/png' :
                        base64.startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg'

    const { error: uploadError } = await supabaseAdmin.storage
      .from('car-photos')
      .upload(path, buffer, { contentType, upsert: false })

    if (uploadError) return res.status(400).json({ error: uploadError.message })

    const { data: { publicUrl } } = supabaseAdmin.storage.from('car-photos').getPublicUrl(path)

    const { data, error } = await supabaseAdmin.from('car_photos').insert([{
      car_id, url: publicUrl, storage_path: path,
      is_cover: is_cover || false,
      sort_order: sort_order || 0
    }]).select().single()

    if (error) return res.status(400).json({ error: error.message })
    return res.json(data)
  }

  if (req.method === 'DELETE') {
    const { id, storage_path } = req.body
    if (storage_path) {
      await supabaseAdmin.storage.from('car-photos').remove([storage_path])
    }
    await supabaseAdmin.from('car_photos').delete().eq('id', id)
    return res.json({ success: true })
  }

  res.status(405).end()
}
