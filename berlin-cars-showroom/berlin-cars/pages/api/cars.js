import { supabaseAdmin } from '../../lib/supabase'
import { isAdminRequest } from '../../lib/auth'

export default async function handler(req, res) {
  const { method } = req

  // GET: public listing
  if (method === 'GET') {
    const { data: cars } = await supabaseAdmin
      .from('cars')
      .select('*, car_photos(*)')
      .order('created_at', { ascending: false })
    return res.json(cars || [])
  }

  // All other methods require admin
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })

  if (method === 'POST') {
    const { make, model, year, price, km, color, fuel, transmission,
            seats, condition, location, description, features, tags,
            badge, is_sold, is_featured, whatsapp, phone } = req.body

    const { data, error } = await supabaseAdmin.from('cars').insert([{
      make, model, year: parseInt(year), price: parseInt(price),
      km: parseInt(km), color, fuel, transmission,
      seats: parseInt(seats) || 5, condition, location,
      description, features: features || [], tags: tags || [],
      badge: badge || '', is_sold: is_sold || false,
      is_featured: is_featured || false,
      whatsapp, phone
    }]).select().single()

    if (error) return res.status(400).json({ error: error.message })
    return res.json(data)
  }

  if (method === 'PUT') {
    const { id, ...fields } = req.body
    if (!id) return res.status(400).json({ error: 'Missing id' })
    if (fields.year) fields.year = parseInt(fields.year)
    if (fields.price) fields.price = parseInt(fields.price)
    if (fields.km) fields.km = parseInt(fields.km)
    if (fields.seats) fields.seats = parseInt(fields.seats)
    fields.updated_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin.from('cars').update(fields).eq('id', id).select().single()
    if (error) return res.status(400).json({ error: error.message })
    return res.json(data)
  }

  if (method === 'DELETE') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'Missing id' })
    await supabaseAdmin.from('car_photos').delete().eq('car_id', id)
    await supabaseAdmin.from('cars').delete().eq('id', id)
    return res.json({ success: true })
  }

  res.status(405).end()
}
