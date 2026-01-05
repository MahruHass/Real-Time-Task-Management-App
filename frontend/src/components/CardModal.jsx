import React, { useState } from 'react'
import axios from 'axios'

export default function CardModal({ card, onClose, onUpdate }){
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description)
  const [newComment, setNewComment] = useState('')

  const handleUpdate = async () => {
    try {
      await axios.patch(`/api/cards/${card.id}/`, {
        title, description
      })
      onUpdate && onUpdate()
      onClose && onClose()
    } catch(err){
      console.error(err)
    }
  }

  const handleAddComment = async () => {
    if(!newComment.trim()) return
    try {
      await axios.post(`/api/cards/${card.id}/add_comment/`, {
        text: newComment
      })
      setNewComment('')
      onUpdate && onUpdate()
    } catch(err){
      console.error(err)
    }
  }

  return (
    <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
      <div style={{background: '#fff', borderRadius: 8, padding: 20, maxWidth: 600, width: '90%', maxHeight: '90vh', overflowY: 'auto'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20}}>
          <h2>Card Details</h2>
          <button onClick={onClose} style={{background: 'none', border: 'none', fontSize: 24, cursor: 'pointer'}}>✕</button>
        </div>

        <input type="text" value={title} onChange={e => setTitle(e.target.value)} style={{width: '100%', padding: 10, fontSize: 16, marginBottom: 10, border: '1px solid #ddd', borderRadius: 4}} />

        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Add description..." style={{width: '100%', padding: 10, minHeight: 100, marginBottom: 10, border: '1px solid #ddd', borderRadius: 4}} />

        <button onClick={handleUpdate} style={{padding: '10px 20px', background: '#0052cc', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginBottom: 20}}>Save</button>

        <h3>Comments</h3>
        <div style={{marginBottom: 20}}>
          {card.comments && card.comments.map(c => (
            <div key={c.id} style={{padding: 10, background: '#f5f5f5', borderRadius: 4, marginBottom: 10}}>
              <div style={{fontWeight: 'bold'}}>{c.author.username}</div>
              <div>{c.text}</div>
              <div style={{fontSize: 12, color: '#999', marginTop: 5}}>{new Date(c.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div style={{display: 'flex', gap: 10}}>
          <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." style={{flex: 1, padding: 10, border: '1px solid #ddd', borderRadius: 4}} />
          <button onClick={handleAddComment} style={{padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer'}}>Comment</button>
        </div>
      </div>
    </div>
  )
}
