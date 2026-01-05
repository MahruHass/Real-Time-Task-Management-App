# 🚀 Quick Start Guide

## TL;DR - Get Running in 2 Minutes

### Terminal 1 - Backend
```bash
cd backend
source .venv/bin/activate  # or: python3 -m venv .venv && source .venv/bin/activate (first time)
pip install -r requirements.txt  # (first time only)
python manage.py migrate  # (first time only)
python manage.py populate_data  # (first time only)
python manage.py runserver
```
✅ Backend running on http://localhost:8000

### Terminal 2 - Frontend
```bash
cd frontend
npm install  # (first time only)
npm run dev
```
✅ Frontend running on http://localhost:5173

### Browser
Open http://localhost:5173 in your browser
Click "Register" and create an account
Start dragging cards! 🎉

---

## What You Can Do Right Now

### 1. Drag & Drop Cards
- Click and drag cards between "To Do", "In Progress", "Done" lists
- Changes sync in real-time (try opening 2 browser tabs!)

### 2. Edit Cards
- Click on any card to open the modal
- Edit the title and description
- Add comments below
- Changes broadcast to all connected clients

### 3. Add New Cards
- Type in "Add a card..." field at bottom of each list
- Press Enter or click Add button
- Card appears immediately

### 4. Test Real-Time
- Open http://localhost:5173 in 2 browser tabs
- Make changes in one tab
- Watch it update in the other tab instantly!

---

## API Testing (Optional)

### Register
```bash
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'
```

### Login (Get Token)
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"password123"}'
```

### List Boards
```bash
curl http://localhost:8000/api/boards/
```

---

## Run Tests (Optional)

```bash
cd backend
source .venv/bin/activate
python manage.py test core
```

Expected output:
```
Ran 6 tests in 1.5s
OK
```

---

## Admin Panel (Optional)

Create admin user:
```bash
cd backend
source .venv/bin/activate
python manage.py createsuperuser
```

Visit: http://localhost:8000/admin

---

## Troubleshooting

**Port 8000 in use:**
```bash
lsof -i :8000 | grep -v PID | awk '{print $2}' | xargs kill -9
```

**Port 5173 in use:**
```bash
lsof -i :5173 | grep -v PID | awk '{print $2}' | xargs kill -9
```

**Missing virtual env:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**Database issues:**
```bash
cd backend
rm db.sqlite3
python manage.py migrate
python manage.py populate_data
```

---

## File Structure Quick Ref

```
backend/                    Django API + WebSocket
├── manage.py
├── requirements.txt
└── core/
    ├── models.py           (Board, List, Card, Comment)
    ├── views.py            (REST API endpoints)
    ├── consumers.py        (WebSocket handlers)
    ├── tests.py            (Unit tests)
    └── auth_views.py       (Login/Register)

frontend/                   React app
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx             (Main app)
    ├── components/
    │   ├── Auth.jsx        (Login/Register)
    │   ├── Board.jsx       (Board + Drag-and-drop)
    │   └── CardModal.jsx   (Card details)
    └── style.css
```

---

## Key URLs

| URL | Purpose |
|-----|---------|
| http://localhost:5173 | React app |
| http://localhost:8000 | Django API |
| http://localhost:8000/admin | Admin panel |
| ws://localhost:8000/ws/boards/1 | WebSocket |

---

## Default Data (Pre-loaded)

**Board:** Sample Project Board
**Lists:** To Do, In Progress, Done
**Cards:** 6 sample cards (create, build, deploy, implement, websocket, setup)

---

## Technology Stack

**Backend:** Django 6.0 + Django Channels + DRF
**Frontend:** React 18 + Vite + react-beautiful-dnd
**Database:** SQLite (dev), PostgreSQL (prod)
**Auth:** JWT tokens (simplejwt)

---

## Next: Read These Files

1. **README.md** - Feature overview
2. **SETUP.md** - Detailed setup & testing guide
3. **ARCHITECTURE.md** - Design patterns & best practices
4. **BUILD_STATUS.md** - Complete build checklist

---

## Need Help?

Check the troubleshooting section in SETUP.md or review the architecture in ARCHITECTURE.md.

**Happy coding!** 🚀
