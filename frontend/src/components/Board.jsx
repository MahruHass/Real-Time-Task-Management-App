import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import CardModal from './CardModal'

export default function Board({ boardId }){
  const [board, setBoard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState(null)
  const [newCardTitle, setNewCardTitle] = useState({})
  const ws = useRef(null)

  useEffect(()=>{
    fetchBoard()
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const host = window.location.host
    ws.current = new WebSocket(`${protocol}://${host}/ws/boards/${boardId}/`)
    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data)
      handleRealtimeUpdate(data)
    }
    ws.current.onerror = ()=> console.log('ws error')
    return ()=> ws.current && ws.current.close()
  }, [boardId])

  const fetchBoard = () => {
    setLoading(true)
    axios.get(`/api/boards/${boardId}/`)
      .then(res => setBoard(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  const handleRealtimeUpdate = (data) => {
    const event = data.event
    setBoard(prev => {
      if(!prev) return prev
      const updated = JSON.parse(JSON.stringify(prev))
      
      if(event === 'card_moved'){
        const card = data.card
        const fromList = updated.lists.find(l => l.cards.some(c => c.id === card.id))
        if(fromList){
          fromList.cards = fromList.cards.filter(c => c.id !== card.id)
        }
        const toList = updated.lists.find(l => l.id === card.list)
        if(toList){
          toList.cards = toList.cards.filter(c => c.id !== card.id)
          toList.cards.splice(card.position, 0, card)
          toList.cards.sort((a, b) => a.position - b.position)
        }
      } else if(event === 'card_updated'){
        const card = data.card
        const list = updated.lists.find(l => l.id === card.list)
        if(list){
          const idx = list.cards.findIndex(c => c.id === card.id)
          if(idx >= 0) list.cards[idx] = card
        }
      } else if(event === 'card_created'){
        const card = data.card
        const list = updated.lists.find(l => l.id === card.list)
        if(list){
          list.cards.push(card)
        }
      } else if(event === 'card_deleted'){
        const cardId = data.card_id
        updated.lists.forEach(l => {
          l.cards = l.cards.filter(c => c.id !== cardId)
        })
      }
      return updated
    })
  }

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result
    if(!destination) return
    if(source.droppableId === destination.droppableId && source.index === destination.index) return
    
    const cardId = draggableId.split('-')[1]
    const newListId = parseInt(destination.droppableId.split('-')[1])
    const newPosition = destination.index
    
    axios.patch(`/api/cards/${cardId}/`, {
      list: newListId,
      position: newPosition
    }).then(() => {
      if(ws.current && ws.current.readyState === WebSocket.OPEN){
        ws.current.send(JSON.stringify({
          type: 'card_moved',
          card_id: cardId,
          list_id: newListId,
          position: newPosition
        }))
      }
    }).catch(err => console.error(err))
  }

  const handleAddCard = async (listId) => {
    const title = newCardTitle[listId]?.trim()
    if(!title) return
    
    try {
      await axios.post(`/api/cards/`, {
        list: listId,
        title
      })
      setNewCardTitle({...newCardTitle, [listId]: ''})
      fetchBoard()
    } catch(err){
      console.error(err)
    }
  }

  if(loading) return <div style={{padding: 16}}>Loading...</div>
  if(!board) return <div style={{padding: 16}}>Board not found</div>

  return (
    <div style={{padding: 16}}>
      <h2>{board.title}</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{display: 'flex', gap: 16, overflowX: 'auto'}}>
          {board.lists.map(list => (
            <Droppable key={list.id} droppableId={`list-${list.id}`}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    minWidth: 272,
                    background: '#ebecf0',
                    borderRadius: 3,
                    padding: 8,
                    ...provided.droppableProps.style
                  }}
                >
                  <h3 style={{marginTop: 0}}>{list.title}</h3>
                  {list.cards.map((card, idx) => (
                    <Draggable key={card.id} draggableId={`card-${card.id}`} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => setSelectedCard(card)}
                          style={{
                            background: '#fff',
                            borderRadius: 3,
                            padding: 12,
                            marginBottom: 8,
                            boxShadow: snapshot.isDragging ? '0 5px 10px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            ...provided.draggableProps.style
                          }}
                        >
                          <div style={{fontWeight: 500}}>{card.title}</div>
                          {card.description && <div style={{fontSize: 12, color: '#666', marginTop: 4}}>{card.description.substring(0, 50)}</div>}
                          {card.comments?.length > 0 && <div style={{fontSize: 12, color: '#0052cc', marginTop: 4}}>💬 {card.comments.length}</div>}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  
                  <div style={{marginTop: 10}}>
                    <input
                      type="text"
                      placeholder="Add a card..."
                      value={newCardTitle[list.id] || ''}
                      onChange={e => setNewCardTitle({...newCardTitle, [list.id]: e.target.value})}
                      onKeyPress={e => e.key === 'Enter' && handleAddCard(list.id)}
                      style={{width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4, fontSize: 12}}
                    />
                    <button onClick={() => handleAddCard(list.id)} style={{width: '100%', marginTop: 5, padding: 6, background: '#0052cc', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>Add</button>
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={fetchBoard}
        />
      )}
    </div>
  )
}
