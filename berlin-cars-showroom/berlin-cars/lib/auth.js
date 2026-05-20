import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'berlin-cars-secret-change-this'

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function getTokenFromCookies(req) {
  const cookies = req.headers.cookie || ''
  const match = cookies.match(/admin_token=([^;]+)/)
  return match ? match[1] : null
}

export function isAdminRequest(req) {
  const token = getTokenFromCookies(req)
  if (!token) return false
  const payload = verifyToken(token)
  return payload && payload.role === 'admin'
}
