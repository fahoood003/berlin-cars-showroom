import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      router.push('/admin/dashboard')
    } else {
      setError(data.error || 'Login failed')
    }
  }

  return (
    <>
      <Head><title>Admin Login — Berlin Cars Showroom</title></Head>
      <div style={{
        minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
        background:'var(--bg)',padding:20
      }}>
        <div style={{
          background:'var(--card)',border:'1px solid var(--border)',
          borderRadius:16,padding:'40px 36px',width:'100%',maxWidth:400
        }}>
          <div style={{textAlign:'center',marginBottom:32}}>
            <div style={{
              fontFamily:'Bebas Neue',fontSize:28,letterSpacing:3,
              background:'linear-gradient(135deg,var(--gold),var(--gold2))',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
              marginBottom:4
            }}>Berlin Cars Showroom</div>
            <div style={{color:'var(--muted)',fontSize:14}}>Admin Panel</div>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{marginBottom:16}}>
              <label className="label">Username</label>
              <input className="input" type="text" value={username}
                onChange={e=>setUsername(e.target.value)} placeholder="admin" required />
            </div>
            <div style={{marginBottom:24}}>
              <label className="label">Password</label>
              <input className="input" type="password" value={password}
                onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <div className="error" style={{marginBottom:16}}>⚠️ {error}</div>}
            <button type="submit" className="btn-gold" disabled={loading}
              style={{width:'100%',justifyContent:'center',padding:'12px',fontSize:15}}>
              {loading ? 'Logging in...' : '🔐 Login'}
            </button>
          </form>

          <div style={{textAlign:'center',marginTop:20}}>
            <a href="/" style={{color:'var(--muted)',fontSize:13}}>← Back to Showroom</a>
          </div>
        </div>
      </div>
    </>
  )
}
