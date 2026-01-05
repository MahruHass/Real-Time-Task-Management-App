import React, { useState, useEffect } from 'react'
import Board from './components/Board'
import Auth from './components/Auth'
import axios from 'axios'

export default function App(){
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if(token){
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    }
  }, [])

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/user/me/')
      setUser(res.data)
      setIsLoggedIn(true)
    } catch(err){
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setIsLoggedIn(false)
    }
  }

  const handleLogin = () => {
    const token = localStorage.getItem('access_token')
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    fetchUser()
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    delete axios.defaults.headers.common['Authorization']
    setIsLoggedIn(false)
    setUser(null)
  }

  if(!isLoggedIn){
    return <Auth onLogin={handleLogin} />
  }

  return (
    <div>
      <div style={{background: '#0052cc', color: '#fff', padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1 style={{margin: 0}}>Real-Time Trello Clone</h1>
        <div>
          <span style={{marginRight: 20}}>Hi, {user?.username}!</span>
          <button onClick={handleLogout} style={{padding: '8px 16px', background: '#fff', color: '#0052cc', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold'}}>Logout</button>
        </div>
      </div>
      <Board boardId={1} />
    </div>
  )
}
