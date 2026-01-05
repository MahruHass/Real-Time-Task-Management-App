# Project Setup & Run Guide

## Prerequisites

- Python 3.8+ with pip
- Node.js 14+ with npm
- macOS (or adapt shell commands for your OS)

## Backend Setup (Django + Channels)

### 1. Create Virtual Environment

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Database Setup

```bash
python manage.py migrate
python manage.py populate_data  # Load sample board/lists/cards
python manage.py createsuperuser  # Create admin user (optional)
```

### 4. Run Development Server

```bash
python manage.py runserver
```

Server runs on: `http://localhost:8000`
Admin panel: `http://localhost:8000/admin`

### 5. Run Tests

```bash
python manage.py test core -v 2
```

## Frontend Setup (React + Vite)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

App runs on: `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

Output: `frontend/dist/`

## Testing the App

### 1. Open Frontend

Open http://localhost:5173 in your browser.

### 2. Register/Login

- Click "Need an account? Register"
- Create username, email, password
- Login with credentials

### 3. Try Features

**Drag & Drop:**
- Drag cards between lists
- See real-time updates if you open multiple browser tabs

**Edit Cards:**
- Click on a card to open modal
- Edit title/description
- Add comments
- Changes sync in real-time to other clients

**Add New Cards:**
- Type in "Add a card..." box
- Press Enter or click Add button

## API Testing with curl

### Register

```bash
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "secure123"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "secure123"
  }'
```

Response includes `access` token. Use it for authenticated requests:

```bash
curl -X GET http://localhost:8000/api/user/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### List Boards

```bash
curl http://localhost:8000/api/boards/
```

### Create Card

```bash
curl -X POST http://localhost:8000/api/cards/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "list": 1,
    "title": "New Task",
    "description": "Task description"
  }'
```

## Troubleshooting

### Port Already in Use

**Port 8000 (Django):**
```bash
lsof -i :8000 | grep -v PID | awk '{print $2}' | xargs kill -9
```

**Port 5173 (React):**
```bash
lsof -i :5173 | grep -v PID | awk '{print $2}' | xargs kill -9
```

### WebSocket Connection Error

Ensure Django server is running and CORS is configured correctly in settings.

### Tests Failing

```bash
cd backend
source .venv/bin/activate
rm db.sqlite3  # Reset database
python manage.py migrate
python manage.py test core
```

## Project Structure

```
Real-Time-Task-Management-App/
├── backend/
│   ├── taskmanager/          # Django settings & ASGI
│   │   ├── settings.py       # Configuration
│   │   ├── asgi.py           # Channels routing
│   │   └── urls.py           # URL routes
│   ├── core/                 # Main app
│   │   ├── models.py         # Board, List, Card, Comment
│   │   ├── serializers.py    # DRF serializers
│   │   ├── views.py          # REST API viewsets
│   │   ├── consumers.py      # WebSocket handlers
│   │   ├── auth_views.py     # Auth endpoints
│   │   ├── routing.py        # WebSocket routing
│   │   ├── urls.py           # API routes
│   │   ├── admin.py          # Django admin
│   │   ├── tests.py          # Unit tests
│   │   └── management/
│   │       └── commands/
│   │           └── populate_data.py  # Sample data
│   ├── manage.py
│   ├── requirements.txt
│   └── db.sqlite3            # (Generated)
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Auth.jsx       # Login/register form
    │   │   ├── Board.jsx      # Board & cards
    │   │   └── CardModal.jsx  # Card detail modal
    │   ├── App.jsx            # Main app
    │   ├── main.jsx           # Entry point
    │   └── style.css          # Global styles
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── node_modules/          # (Generated)
```

## Key Technologies

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend Framework | Django | 6.0 |
| REST API | Django REST Framework | 3.14 |
| WebSocket | Django Channels | 4.0 |
| Authentication | JWT (djangorestframework-simplejwt) | 5.2 |
| Frontend | React | 18.2 |
| Build Tool | Vite | 5.4 |
| Drag-and-Drop | react-beautiful-dnd | 13.1 |
| HTTP Client | Axios | 1.4 |
| Database | SQLite (dev) / PostgreSQL (prod) | - |

## Environment Variables

### Backend (.env or shell)

```bash
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:8000
```

## Next Steps

1. **Deploy to Production:** Follow deployment checklist in README.md
2. **Add Features:** Board permissions, labels, attachments, notifications
3. **Improve Performance:** Add pagination, caching, optimistic updates
4. **Scale:** Switch to PostgreSQL, Redis channels, container deployment
