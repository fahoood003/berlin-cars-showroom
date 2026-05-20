import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '../../lib/supabase'
import { isAdminRequest, getTokenFromCookies, verifyToken } from '../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })

  const { newPassword } = req.body
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Password too short' })

  const token = getTokenFromCookies(req)
  const payload = verifyToken(token)
  const hash = await bcrypt.hash(newPassword, 10)

  await supabaseAdmin.from('admins').update({ password_hash: hash }).eq('id', payload.id)
  res.json({ success: true })
}
