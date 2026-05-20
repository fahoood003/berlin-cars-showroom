export default function handler(req, res) {
  res.setHeader('Set-Cookie', 'admin_token=; Path=/; HttpOnly; Max-Age=0')
  res.json({ success: true })
}
