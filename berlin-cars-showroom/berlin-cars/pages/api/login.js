import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '../../lib/supabase'
import { signToken } from '../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' })

  const { data: admin } = await supabaseAdmin
    .from('admins')
    .select('*')
    .eq('username', username)
    .single()

  if (!admin) return res.status(401).json({ error: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, admin.password_hash)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = signToken({ id: admin.id, username: admin.username, role: 'admin' })

  res.setHeader('Set-Cookie', `admin_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7*24*3600}`)
  res.json({ success: true })
}
