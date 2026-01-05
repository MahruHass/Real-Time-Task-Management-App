# Real-Time Task Management App (Trello Clone)

A full-stack Trello-like real-time task management application built with Django + Django Channels (WebSocket) backend and React + Vite frontend.

## Features

✅ **Real-time Updates** — Drag-and-drop cards with instant WebSocket broadcast to all clients
✅ **JWT Authentication** — User registration and login with token-based auth
✅ **Card Management** — Create, edit, move, delete cards across lists
✅ **Comments** — Add and view comments on cards in real-time
✅ **Due Dates & Assignees** — Track deadlines and card ownership
✅ **Drag & Drop** — Smooth drag-and-drop with `react-beautiful-dnd`
✅ **Responsive UI** — Trello-inspired card-based layout

## Quick Start

### Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py populate_data  # Load sample board/lists/cards
python manage.py runserver      # Starts on http://localhost:8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev                      # Starts on http://localhost:5173
```

Open http://localhost:5173 in your browser.

## Testing

### Register & Login

```bash
# Register a new user
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"secure123"}'

# Login and get tokens
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"secure123"}'
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/register/` | Register new user |
| `POST` | `/api/token/` | Get JWT access/refresh tokens |
| `POST` | `/api/token/refresh/` | Refresh expired access token |
| `GET` | `/api/user/me/` | Get current user profile |
| `GET/POST` | `/api/boards/` | List/create boards |
| `GET/PATCH/DELETE` | `/api/boards/{id}/` | Board detail, update, delete |
| `GET/POST` | `/api/cards/` | List/create cards |
| `PATCH` | `/api/cards/{id}/` | Update card |
| `POST` | `/api/cards/{id}/add_comment/` | Add comment to card |
| `GET/POST` | `/api/comments/` | List/create comments |

### WebSocket Events

**Client → Server:**
```json
{
  "type": "card_moved",
  "card_id": 1,
  "list_id": 2,
  "position": 0
}
```

**Server → All Clients:**
```json
{
  "event": "card_moved",
  "card": { "id": 1, "title": "...", "list": 2 }
}
```

### Run Tests

```bash
cd backend
source .venv/bin/activate
python manage.py test core
```

## Tech Stack

**Backend:**
- Django 6.0
- Django REST Framework 3.14
- Django Channels 4.0 (WebSocket)
- Django Cors Headers 4.0
- Simple JWT 5.2

**Frontend:**
- React 18.2
- Vite 5.4
- Axios 1.4
- react-beautiful-dnd 13.1 (drag-and-drop)

**Database:**
- SQLite (dev), PostgreSQL (prod recommended)

## Architecture

```
Real-Time-Task-Management-App/
├── backend/
│   ├── taskmanager/          # Django project settings
│   ├── core/                 # Main app (models, views, consumers)
│   │   ├── models.py         # Board, List, Card, Comment
│   │   ├── consumers.py      # WebSocket handlers
│   │   ├── views.py          # REST API endpoints
│   │   ├── auth_views.py     # Auth endpoints
│   │   └── tests.py          # Unit tests
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── App.jsx        # Main app, auth flow
    │   │   ├── Auth.jsx       # Login/register form
    │   │   ├── Board.jsx      # Board view, drag-and-drop
    │   │   └── CardModal.jsx  # Card detail modal
    │   ├── main.jsx
    │   └── style.css
    ├── package.json
    ├── vite.config.js
    └── index.html
```
