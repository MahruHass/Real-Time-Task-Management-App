# Architecture & Best Practices

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Browser (http://localhost:5173)                      │   │
│  │ - Auth Component (login/register)                    │   │
│  │ - Board Component (drag-and-drop)                    │   │
│  │ - CardModal Component (card details)                 │   │
│  └──────┬──────────────────────────────────┬────────────┘   │
│         │ HTTP (REST API)                  │ WebSocket       │
└─────────┼──────────────────────────────────┼────────────────┘
          │                                  │
          ▼                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Django)                          │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ HTTP Server (port 8000)                              │   │
│ │ - REST API (DRF viewsets)                            │   │
│ │ - JWT Authentication                                 │   │
│ │ - CORS middleware                                    │   │
│ └──────────────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ WebSocket Server (ASGI, Channels)                    │   │
│ │ - Board consumers (broadcast updates)                │   │
│ │ - Group messaging                                    │   │
│ │ - Real-time synchronization                          │   │
│ └──────────────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Database (SQLite dev / PostgreSQL prod)              │   │
│ │ - User, Board, List, Card, Comment models           │   │
│ │ - Relationships and constraints                      │   │
│ └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Models

### User
```
User (Django built-in)
├── id
├── username (unique)
├── email
├── password (hashed)
└── Related:
    ├── boards (owner)
    ├── assigned_cards
    └── comments (author)
```

### Board
```
Board
├── id
├── title
├── owner (FK User, nullable)
├── created_at
└── Related:
    └── lists (reverse)
```

### List
```
List
├── id
├── board (FK Board)
├── title
├── position (sort order)
└── Related:
    └── cards (reverse)
```

### Card
```
Card
├── id
├── list (FK List)
├── title
├── description
├── position (sort order within list)
├── due_date (nullable)
├── assigned_to (FK User, nullable)
├── created_at
├── updated_at
└── Related:
    ├── comments (reverse)
    └── author (reverse)
```

### Comment
```
Comment
├── id
├── card (FK Card)
├── author (FK User)
├── text
├── created_at
└── updated_at
```

## API Design

### REST Endpoints

**Auth:**
- `POST /api/register/` — Register user
- `POST /api/token/` — Get JWT tokens (access, refresh)
- `POST /api/token/refresh/` — Refresh expired token
- `GET /api/user/me/` — Get current user profile

**Boards:**
- `GET /api/boards/` — List all boards
- `POST /api/boards/` — Create board
- `GET /api/boards/{id}/` — Get board with lists & cards
- `PATCH /api/boards/{id}/` — Update board
- `DELETE /api/boards/{id}/` — Delete board

**Cards:**
- `GET /api/cards/` — List all cards
- `POST /api/cards/` — Create card
- `PATCH /api/cards/{id}/` — Update card (title, desc, due_date, assigned_to)
- `DELETE /api/cards/{id}/` — Delete card
- `POST /api/cards/{id}/add_comment/` — Add comment

**Comments:**
- `GET /api/comments/` — List comments
- `POST /api/comments/` — Create comment
- `DELETE /api/comments/{id}/` — Delete comment

### WebSocket Events

**Incoming (Client → Server):**

```python
{
    "type": "card_moved",      # Type of event
    "card_id": 1,              # Card being moved
    "list_id": 2,              # Target list
    "position": 0              # Position in list
}

{
    "type": "card_updated",
    "card_id": 1,
    "title": "New title",
    "description": "New desc"
}

{
    "type": "card_created",
    "list_id": 1,
    "title": "New card"
}

{
    "type": "card_deleted",
    "card_id": 1
}
```

**Outgoing (Server → All Clients in Board Group):**

```python
{
    "event": "card_moved",
    "card": { Card object serialized }
}

{
    "event": "card_updated",
    "card": { Card object serialized }
}

{
    "event": "card_created",
    "card": { Card object serialized }
}

{
    "event": "card_deleted",
    "card_id": 1
}
```

## Authentication Flow

### Login Flow
```
1. User enters username/password in Auth component
2. Frontend POST to /api/token/
3. Backend validates, returns {access, refresh} tokens
4. Frontend stores in localStorage
5. Frontend sets Authorization header: `Bearer {access_token}`
6. Subsequent API calls include JWT
7. DRF JWTAuthentication middleware validates token
8. Request proceeds if valid, 401 if invalid
```

### Token Refresh
```
1. When access token expires (1 hour)
2. Frontend uses refresh token to POST /api/token/refresh/
3. Backend validates refresh token, returns new access token
4. Frontend updates localStorage
5. Retry original request with new token
```

### WebSocket Authentication (Optional)
```
Currently: No auth required for WebSocket
To add auth:
1. Client passes token in WebSocket URL query: ws://...?token=xxx
2. BoardConsumer validates token in connect()
3. Reject unauthorized connections
```

## Real-time Sync Strategy

### Broadcasting Groups
- Each board has a WebSocket group: `board_{board_id}`
- All clients viewing board join the group
- Card updates broadcast to entire group

### Sync Flow for Drag-and-Drop
```
1. User drags card in Browser A
2. React state updates optimistically (instant UI feedback)
3. Frontend sends drag event via REST PATCH /api/cards/{id}/
4. Backend saves to database
5. Backend broadcasts via WebSocket to all clients (including Browser A)
6. All browsers update state from broadcast
7. Result: Consistent state across all clients
```

### Conflict Resolution
```
Current: Last-write-wins (simple, server is source of truth)
Future options:
- Operational Transformation (like Google Docs)
- CRDT (Conflict-free Replicated Data Types)
- Version vectors with merge strategies
```

## Performance Optimization

### Frontend
- Memoization: Use `React.memo()` for Card components
- Pagination: Implement card/comment pagination
- Lazy loading: Load card details on demand
- State management: Consider Redux for complex state

### Backend
- Database indexing: Index frequently queried fields
- Query optimization: Use `select_related()` / `prefetch_related()`
- Caching: Redis cache for board/card lists
- Pagination: Limit API response sizes
- Connection pooling: For PostgreSQL

### WebSocket
- Message compression: Gzip event data
- Throttling: Limit update frequency for rapid events
- Debouncing: Batch multiple changes into single message

## Security Best Practices

### Authentication
- ✅ Use JWT with short-lived tokens (1 hour)
- ✅ Store refresh token securely (HTTPOnly cookie for prod)
- ✅ Validate all API requests
- ✅ Rate limit auth endpoints

### Authorization
- ✅ Check user permissions on update/delete
- ✅ Filter boards by owner/collaborator
- ✅ Validate WebSocket connection origin

### Data Validation
- ✅ Validate all inputs (length, type, format)
- ✅ Sanitize user input to prevent XSS
- ✅ Use Django's built-in validators

### Infrastructure
- ✅ Use HTTPS in production
- ✅ Set secure headers (X-Frame-Options, CSP)
- ✅ Enable CSRF protection
- ✅ Use environment variables for secrets
- ✅ Rotate SECRET_KEY periodically

## Deployment Considerations

### Environment-Specific Config
```python
# settings.py
import os
from decouple import config

DEBUG = config('DEBUG', default=False, cast=bool)
SECRET_KEY = config('SECRET_KEY')
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost', cast=lambda v: [s.strip() for s in v.split(',')])

# Database: SQLite for dev, PostgreSQL for prod
DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL', default='sqlite:///db.sqlite3'),
        conn_max_age=600
    )
}

# Redis for channels (production)
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [config('REDIS_URL', default='redis://localhost:6379')],
        },
    }
}
```

### Containerization (Docker)
```dockerfile
# Dockerfile
FROM python:3.13
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "taskmanager.asgi:application"]
```

### Scaling Strategy
1. **Database:** PostgreSQL with replication
2. **Cache:** Redis for session storage
3. **WebSocket:** Redis channel layer for horizontal scaling
4. **Load Balancing:** Nginx with sticky sessions
5. **Containers:** Kubernetes or Docker Swarm
6. **CDN:** CloudFlare for static assets

## Testing Strategy

### Unit Tests (Backend)
- Model tests: Business logic, constraints
- Serializer tests: Input validation, output format
- View tests: HTTP methods, permissions, status codes
- Consumer tests: WebSocket message handling

### Integration Tests
- Auth flow: Register, login, token refresh
- API workflows: Create board → list → card
- WebSocket: Multiple clients, real-time sync

### E2E Tests (Frontend)
- Register/login flows
- Drag-and-drop functionality
- Comment creation/display
- Real-time updates across tabs

### Performance Tests
- Load testing: Simulate concurrent users
- Stress testing: High message frequency
- Memory profiling: Identify leaks
- Database query analysis

## Code Quality

### Style & Formatting
- Backend: Black code formatter, Flake8 linter
- Frontend: Prettier, ESLint
- Pre-commit hooks for automated checks

### Documentation
- Docstrings for all functions/classes
- README with setup/deployment guides
- API documentation (Swagger/OpenAPI)
- Architecture diagrams

### Version Control
- Semantic versioning (MAJOR.MINOR.PATCH)
- Conventional commits (feat:, fix:, docs:)
- Feature branches with PR reviews
- Squash commits before merge
