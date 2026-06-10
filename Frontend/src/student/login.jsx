import React, { useState } from 'react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Login failed')
      }
      const data = await res.json().catch(() => ({}))
      if (data.token) localStorage.setItem('token', data.token)
      window.location.href = '/'
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-form" style={{maxWidth:400,margin:'0 auto',padding:20}}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom:12}}>
          <label style={{display:'block',marginBottom:6}}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{width:'100%',padding:8}}
          />
        </div>

        <div style={{marginBottom:12}}>
          <label style={{display:'block',marginBottom:6}}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{width:'100%',padding:8}}
          />
        </div>

        {error && (
          <div style={{color:'crimson',marginBottom:12}}>{error}</div>
        )}

        <button type="submit" disabled={loading} style={{padding:'8px 16px'}}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

export default Login
