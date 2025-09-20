# 📚 API Documentation

Base URL: `http://localhost:5555`

All responses follow the shape:
- success: boolean
- data: any (on success)
- error: string (on error)
- message: string (optional human-readable message)

---

## Health

GET `/health`
- 200 OK: `{ status: 'OK', message, timestamp }`

---

## 👥 Users

### GET `/api/users`
- Description: List all users
- 200: `{ success: true, data: User[], count }`

### GET `/api/users/:id`
- Description: Get one user by id
- 200: `{ success: true, data: User }`
- 404: `{ success: false, error: 'Utilisateur non trouvé' }`

### POST `/api/users`
- Description: Create a new user
- Body (JSON):
```
{
  "email": "string", // required, unique
  "name": "string"    // optional
}
```
- 201: `{ success: true, message, data: User }`
- 400: `{ success: false, error: 'Le champ email est requis' }`
- 500: `{ success: false, error: 'Un utilisateur avec cet email existe déjà' }` (ou autre message)

### PUT `/api/users/:id`
- Description: Update a user
- Body (JSON): `{ email?: string, name?: string }`
- 200: `{ success: true, message, data: User }`
- 404: `{ success: false, error: 'Utilisateur non trouvé' }`

### DELETE `/api/users/:id`
- Description: Delete a user
- 200: `{ success: true, message }`
- 404: `{ success: false, error: 'Utilisateur non trouvé' }`

---

## 📅 Events

Model (simplified):
```
Event {
  id: string,
  title: string,
  description?: string,
  startDate: Date,
  endDate?: Date,
  location?: string,
  isAllDay: boolean,
  color?: string,
  status: string,
  userId: string,
  createdAt: Date,
  updatedAt: Date,
  user?: { id, name, email }
}
```

### GET `/api/events`
- Query (optional):
  - `userId`: string
  - `startDate`: ISO string
  - `endDate`: ISO string
  - `status`: string
- 200: `{ success: true, data: Event[], count }`

### GET `/api/events/:id`
- 200: `{ success: true, data: Event }`
- 404: `{ success: false, error: 'Événement non trouvé' }`

### GET `/api/events/user/:userId/daterange`
- Query: `startDate` (ISO), `endDate` (ISO)
- 400: missing dates → `{ success: false, error }`
- 200: `{ success: true, data: Event[], count }`

### POST `/api/events`
- Validation (middleware `validateEvent`):
  - `title` required (non empty)
  - `startDate` required and valid
  - `userId` required
  - if `endDate` provided: must be > `startDate`
- Body (JSON):
```
{
  "title": "Réunion",
  "description": "Discussion projet",
  "startDate": "2025-09-21T09:00:00.000Z",
  "endDate": "2025-09-21T10:00:00.000Z", // optional
  "userId": "USER_ID"
}
```
- 201: `{ success: true, message, data: Event }`
- 400: `{ success: false, error: 'Les champs title, startDate et userId sont requis' }` (ou messages du middleware)
- 400: `{ success: false, error: 'Utilisateur non trouvé' }` (si userId invalide)

### PUT `/api/events/:id`
- Body (JSON): any updatable fields `{ title?, description?, startDate?, endDate?, location?, isAllDay?, color?, status?, userId? }`
- 200: `{ success: true, message, data: Event }`
- 404: `{ success: false, error: 'Événement non trouvé' }`

### DELETE `/api/events/:id`
- 200: `{ success: true, message }`
- 404: `{ success: false, error: 'Événement non trouvé' }`

---

## Examples (curl)

Create user:
```
curl -X POST http://localhost:5555/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"Test User"}'
```

Create event:
```
curl -X POST http://localhost:5555/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Réunion importante",
    "description": "Discussion projet",
    "startDate": "2025-09-21T09:00:00.000Z",
    "endDate": "2025-09-21T10:00:00.000Z",
    "userId": "USER_ID_HERE"
  }'
```

List events:
```
curl http://localhost:5555/api/events
```

---

## Notes
- Les dates doivent être des ISO strings valides. Si vous utilisez `<input type="datetime-local">`, convertissez la valeur locale en ISO (timezone locale) côté client avant d'envoyer (déjà géré dans `public/script.js`).
- `userId` doit référencer un utilisateur existant.
- SQLite est utilisé en développement; pour Alwaysdata/MySQL, mettez à jour `DATABASE_URL` dans `.env` et poussez le schéma (`npm run db:push`).
