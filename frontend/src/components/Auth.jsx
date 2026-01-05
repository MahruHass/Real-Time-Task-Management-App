import React, { useState } from 'react'
import axios from 'axios'

export default function Auth({ onLogin }){
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if(isLogin){
        const res = await axios.post('/api/token/', { username, password })
        localStorage.setItem('access_token', res.data.access)
        localStorage.setItem('refresh_token', res.data.refresh)
        onLogin && onLogin()
      } else {
        await axios.post('/api/register/', { username, email, password })
        setUsername('')
        setPassword('')
        setEmail('')
        setIsLogin(true)
        setError('Registration successful! Please log in.')
      }
    } catch(err){
      setError(err.response?.data?.detail || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ddd', borderRadius: 8}}>
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      {error && <div style={{color: '#d32f2f', marginBottom: 10}}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required style={{width: '100%', padding: 10, marginBottom: 10, borderRadius: 4, border: '1px solid #ccc'}} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{width: '100%', padding: 10, marginBottom: 10, borderRadius: 4, border: '1px solid #ccc'}} />
        {!isLogin && <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{width: '100%', padding: 10, marginBottom: 10, borderRadius: 4, border: '1px solid #ccc'}} />}
        <button type="submit" disabled={loading} style={{width: '100%', padding: 10, background: '#0052cc', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold'}}>{isLogin ? 'Login' : 'Register'}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} style={{width: '100%', padding: 10, marginTop: 10, background: 'transparent', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer'}}>{isLogin ? 'Need an account? Register' : 'Already have an account? Login'}</button>
    </div>
  )
}
