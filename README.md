# TrackMe

TrackMe is a full-stack habit tracker with rule-based NLP entry support. Users can type entries like `I ran 2 miles today`, review the parsed habit data, and save structured logs that drive dashboard charts and streaks.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn-style UI components, Recharts
- Backend: Node.js, Express, TypeScript, REST APIs, Zod, JWT auth, RBAC
- Database: MongoDB with Mongoose

## Project Structure

```text
client/   Next.js app, UI components, services, hooks, types
server/   Express API, controllers, routes, middleware, models, schemas, services
```

## Build Roadmap

For a beginner-intermediate, from-scratch build plan, see:

- [TrackMe Build Roadmap and Sprint Plan](docs/build-roadmap-and-sprint-plan.md)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

3. Update `server/.env`:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/trackme
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
ADMIN_INVITE_CODE=trackme-admin-demo
```

4. Start MongoDB locally, then seed demo accounts:

```bash
npm run seed
```

Demo accounts:

```text
user@trackme.demo / password123
admin@trackme.demo / password123
```

5. Run both apps:

```bash
npm run dev
```

Frontend: `http://localhost:3000`
Backend: `http://localhost:4000/api/health`

## API Routes

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Habits:

- `GET /api/habits`
- `POST /api/habits`
- `GET /api/habits/:id`
- `PUT /api/habits/:id`
- `DELETE /api/habits/:id`

Habit logs:

- `GET /api/logs`
- `POST /api/logs`
- `GET /api/logs/stats`
- `GET /api/logs/recent`

NLP:

- `POST /api/nlp/parse`

Admin:

- `GET /api/admin/analytics`

## NLP Parser

The parser is rule-based and does not require a paid AI API. It recognizes common habit keywords, units, and date phrases.

Sample entries:

- `I ran 2 miles today`
- `Drank 4 cups of water`
- `Studied JavaScript for 45 minutes`
- `Slept 7 hours last night`
- `Meditated for 10 minutes`
- `Read for 30 minutes`
- `Went to the gym for 1 hour`

If the parser cannot identify the habit, quantity, or unit, the API returns a low-confidence parse with a message asking the user to confirm or edit the result.

## Security Notes

- Passwords are hashed with bcrypt.
- JWTs protect private API routes.
- Habit and log queries are scoped by authenticated user id.
- Admin analytics requires the `admin` role.
- Auth routes include basic rate limiting.
- Secrets live in env files and are ignored by Git.

## Useful Scripts

```bash
npm run dev        # start client and server
npm run build      # build both workspaces
npm run typecheck  # TypeScript check both workspaces
npm run seed       # seed demo users and habits
```
