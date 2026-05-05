# CodeTrack AI - Full Stack Implementation

This is a complete production-ready implementation of CodeTrack AI, a personal coding journey tracker and revision system.

## Project Structure

```
├── backend/          # Express.js + Node.js server
├── frontend/         # Next.js React application
└── shared/           # Shared types and utilities
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your MongoDB URI and JWT secret
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`

## Features (Phase 1 - MVP)

✅ User Authentication (JWT-based)
✅ Problem CRUD Operations
✅ Dashboard with Statistics
✅ Problem Filtering and Search
✅ Responsive UI with Tailwind CSS

## Tech Stack

**Backend:**
- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Winston Logging

**Frontend:**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Zustand (State Management)
- Axios (API Client)
- React Hook Form

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login to account
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Problems
- `GET /api/problems` - List problems (with filtering)
- `POST /api/problems` - Create new problem
- `GET /api/problems/:id` - Get problem details
- `PUT /api/problems/:id` - Update problem
- `DELETE /api/problems/:id` - Delete problem
- `POST /api/problems/:id/toggle-favorite` - Toggle favorite status
- `POST /api/problems/:id/mark-for-revision` - Mark for revision

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/topic-wise` - Topic-wise breakdown
- `GET /api/analytics/daily-activity` - Daily activity log

## Database Schema

See [DATABASE SCHEMA](./PROJECT_ARCHITECTURE.md#database-schema-design) in PROJECT_ARCHITECTURE.md

## Development

### Backend Development
```bash
cd backend
npm run dev       # Start dev server
npm run build     # Build TypeScript
npm run lint      # Check code style
npm run test      # Run tests
```

### Frontend Development
```bash
cd frontend
npm run dev       # Start dev server
npm run build     # Build for production
npm run lint      # Check code style
```

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/codetrack
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Next Steps (Phase 2-4)

- [ ] Spaced repetition algorithm
- [ ] Revision scheduling
- [ ] Code syntax highlighting
- [ ] Advanced analytics
- [ ] Export to PDF/Markdown
- [ ] Dark mode
- [ ] Email notifications
- [ ] Performance optimization
- [ ] Caching with Redis

## File Structure Details

See [FOLDER STRUCTURE](./PROJECT_ARCHITECTURE.md#folder-structure) in PROJECT_ARCHITECTURE.md

## Testing APIs

Use Postman or Thunder Client to test endpoints:

1. Register/Login at `/api/auth/register` or `/api/auth/login`
2. Copy the returned token
3. Add `Authorization: Bearer <token>` header to other requests
4. Test endpoints

## Deployment

See [DEPLOYMENT CHECKLIST](./PROJECT_ARCHITECTURE.md#deployment-checklist) in PROJECT_ARCHITECTURE.md

## Common Issues

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
- Make sure MongoDB is running: `brew services start mongodb-community`
- Or use MongoDB Atlas connection string

### Port Already in Use
```
Kill existing process: lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### CORS Error
- Verify `FRONTEND_URL` in backend .env matches frontend URL

## License

MITS
