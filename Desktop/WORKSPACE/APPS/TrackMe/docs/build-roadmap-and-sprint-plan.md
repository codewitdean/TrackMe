# TrackMe Build Roadmap and Sprint Plan

This guide explains how to build TrackMe from an empty folder into the full-stack app in this repo. It is written for a beginner-intermediate developer who knows JavaScript basics, has touched React, and is ready to connect frontend, backend, database, authentication, and charts into one product.

TrackMe is a habit tracker where a user can create habits, log progress, type natural language entries like `I ran 2 miles today`, confirm the parsed result, and view progress charts. The current stack is:

- Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn-style components, Recharts
- Backend: Node.js, Express, TypeScript, Zod, JWT auth, role-based access control
- Database: MongoDB with Mongoose

## Product Goal

Build a habit tracking app with these core workflows:

1. A visitor can register or log in.
2. A signed-in user can create, view, update, delete, search, and filter habits.
3. A signed-in user can log progress manually or through a natural language parser.
4. Saved logs update dashboard stats, charts, streaks, and recent activity.
5. An admin user can view platform-level analytics.
6. The app protects private data so users only see their own habits and logs.

## Beginner Mental Model

Think of the app as three layers:

1. Database layer: MongoDB stores users, habits, logs, parsed entries, and progress history.
2. API layer: Express receives requests, validates data, checks authentication, reads or writes MongoDB, then returns JSON.
3. UI layer: Next.js pages call the API, display forms, handle loading and errors, and render charts.

Most features follow the same flow:

```text
User clicks or submits form
Next.js calls client/services/api.ts
Express route receives request
Middleware checks auth and validates input
Controller runs business logic
Mongoose model reads or writes MongoDB
Controller returns JSON
React updates the screen
```

## Recommended Build Order

Build the app in this order. Each phase creates a stable base for the next one.

### Phase 0: Requirements and Setup

Goal: decide what TrackMe must do before writing code.

Build decisions:

- App name: TrackMe.
- Main user type: regular habit tracker user.
- Secondary user type: admin.
- Auth method: email and password with JWT.
- Data storage: MongoDB.
- API style: REST endpoints under `/api`.
- NLP approach: rule-based parser first, no paid AI dependency.

Tasks:

- Write a short README with the product idea, stack, setup commands, and API summary.
- Decide the initial routes: `/`, `/login`, `/register`, `/dashboard`, `/habits`, `/habits/:id`, `/nlp`, `/calendar`, `/admin`.
- Decide the main database collections: users, habits, habit logs, parsed NLP entries, progress history.

Done when:

- You can explain the app in one sentence.
- You know which screens and API routes must exist.
- You have a rough list of models and user workflows.

### Phase 1: Monorepo Foundation

Goal: create one repo with separate frontend and backend workspaces.

Folder structure:

```text
TrackMe/
  client/
  server/
  package.json
  README.md
```

Tasks:

- Create the root `package.json` with npm workspaces.
- Add scripts for `dev`, `build`, `typecheck`, `lint`, and `seed`.
- Create a Next.js app in `client/`.
- Create an Express TypeScript app in `server/`.
- Add `.gitignore` for `node_modules`, `.env`, `.next`, and build outputs.

Important root scripts:

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm run seed
```

Done when:

- `npm install` installs dependencies for both workspaces.
- `npm run dev:client` starts the frontend.
- `npm run dev:server` starts the backend.
- The root `npm run dev` can start both together.

### Phase 2: Backend App Shell

Goal: get Express running with basic production hygiene.

Build these files:

- `server/src/index.ts`
- `server/src/config/env.ts`
- `server/src/config/database.ts`
- `server/src/routes/index.ts`
- `server/src/middleware/errorHandler.ts`
- `server/src/utils/http.ts`

Tasks:

- Load environment variables with `dotenv`.
- Validate required env values like `PORT`, `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL`.
- Connect to MongoDB before listening for requests.
- Add `helmet`, `cors`, `express.json`, and `morgan`.
- Add `/api/health` so you can confirm the server is alive.
- Add a shared error handler so controllers can throw clean API errors.

Beginner note:

- Middleware runs before your route handler.
- A controller is just a function that receives `req` and `res`.
- A health route is useful because it proves the server works before the real features exist.

Done when:

- `GET http://localhost:4000/api/health` returns JSON.
- Invalid routes return a consistent not-found response.
- Server errors return JSON instead of crashing the app.

### Phase 3: Database Models

Goal: define what data TrackMe stores.

Build these models:

- `User`: account information and role.
- `Habit`: habit target, category, unit, frequency, and owner.
- `HabitLog`: one completed habit entry.
- `NlpParsedEntry`: history of parsed natural language input.
- `ProgressHistory`: daily progress summary per habit.

Tasks:

- Create Mongoose schemas with timestamps.
- Add relationships using object ids.
- Add indexes for common queries.
- Add a unique index so one user cannot create duplicate habit names.
- Hash passwords before saving users.
- Add a password comparison method for login.

Beginner note:

- A model describes a MongoDB collection.
- A schema describes the shape and rules for each document.
- Store ownership fields like `createdBy` and `userId` so data can be scoped to the signed-in user.

Done when:

- You can create users, habits, logs, parsed entries, and progress records from code.
- Sensitive fields like `password` are not returned by default.
- Duplicate user emails are prevented.

### Phase 4: Validation

Goal: reject bad input before it reaches business logic.

Build these files:

- `server/src/schemas/authSchemas.ts`
- `server/src/schemas/habitSchemas.ts`
- `server/src/schemas/logSchemas.ts`
- `server/src/schemas/nlpSchemas.ts`
- `server/src/middleware/validate.ts`

Tasks:

- Use Zod to define request body schemas.
- Validate register and login inputs.
- Validate habit creation and update inputs.
- Validate habit log creation inputs.
- Validate NLP parse input.
- Return clear field-level errors.

Beginner note:

- TypeScript types help developers while coding.
- Zod validation protects the app at runtime when real users send data.
- You usually want both.

Done when:

- Empty or invalid forms return helpful API errors.
- Controllers can trust `req.body` after validation middleware runs.

### Phase 5: Authentication and Roles

Goal: let users register, log in, and access protected routes.

Build these files:

- `server/src/controllers/authController.ts`
- `server/src/routes/authRoutes.ts`
- `server/src/utils/jwt.ts`
- `server/src/middleware/auth.ts`
- `server/src/middleware/roles.ts`
- `server/src/middleware/rateLimit.ts`

Tasks:

- Register a user with name, email, password, and optional role.
- Require an admin invite code for admin registration.
- Log in by comparing password hashes.
- Sign a JWT containing safe user information.
- Add auth middleware that reads `Authorization: Bearer <token>`.
- Add role middleware for admin-only endpoints.
- Add rate limiting to auth routes.

API routes:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Done when:

- A user can register and receive a token.
- A user can log in and receive a token.
- `/api/auth/me` returns the current user when a valid token is sent.
- Protected routes reject missing or invalid tokens.
- Admin-only routes reject regular users.

### Phase 6: Habits API

Goal: build the CRUD backbone of the app.

Build these files:

- `server/src/controllers/habitController.ts`
- `server/src/routes/habitRoutes.ts`

Tasks:

- List habits for the signed-in user.
- Create a habit with name, category, target value, unit, and frequency.
- Get one habit by id.
- Update a habit.
- Delete a habit.
- Validate Mongo object ids.
- Always scope queries by `createdBy: req.user.id`.

API routes:

```text
GET    /api/habits
POST   /api/habits
GET    /api/habits/:id
PUT    /api/habits/:id
DELETE /api/habits/:id
```

Beginner note:

- The most important security habit here is ownership scoping.
- Never fetch by `_id` alone for user-owned data. Fetch by `_id` and `createdBy`.

Done when:

- Users can manage their own habits.
- Users cannot access habits owned by someone else.
- Duplicate habit names return a clean conflict error.

### Phase 7: Habit Logs and Progress History

Goal: record actual habit activity and update progress.

Build these files:

- `server/src/controllers/logController.ts`
- `server/src/routes/logRoutes.ts`
- `server/src/services/statsService.ts`

Tasks:

- List logs for the signed-in user.
- Create a log from confirmed structured data.
- If a log references an existing habit, verify the user owns it.
- If no habit id is provided, find or create a matching habit.
- After creating a log, recalculate that habit's progress for the day.
- Store daily progress in `ProgressHistory`.

API routes:

```text
GET  /api/logs
POST /api/logs
GET  /api/logs/stats
GET  /api/logs/recent
```

Beginner note:

- A log is an event: "I did this thing on this date."
- A habit is the goal: "I want to do this thing regularly."
- Progress history is a summary that makes charts easier to build.

Done when:

- Saving a log creates a database record.
- Saving a log can create a new habit when needed.
- Today's progress updates after each saved log.

### Phase 8: Dashboard Stats

Goal: convert raw logs into useful insights.

Build in `server/src/services/statsService.ts`:

- Today's completed habit count.
- Total habits.
- Completion percentage.
- Weekly progress.
- Monthly progress.
- Current streaks.
- Category distribution.
- Recent NLP entries.

Tasks:

- Use date helpers to compare days safely.
- Count unique completed habits per day.
- Build a 7-day data set for weekly charts.
- Build a 30-day data set for monthly charts.
- Calculate streaks from recent logs.
- Aggregate habits by category.

Done when:

- `/api/logs/stats` returns all dashboard data in one response.
- Dashboard data only includes the signed-in user's records.
- Empty accounts return valid zero-state data instead of errors.

### Phase 9: NLP Parser

Goal: let users enter natural habit text and convert it into structured data.

Build these files:

- `server/src/services/nlpParser.ts`
- `server/src/controllers/nlpController.ts`
- `server/src/routes/nlpRoutes.ts`

Tasks:

- Normalize input text.
- Match habit keywords like running, water, studying, sleep, meditation, workout, and walking.
- Parse quantities and units like `2 miles`, `4 cups`, `45 minutes`, and `7 hours`.
- Parse simple date phrases like `today`, `yesterday`, `last night`, and `tomorrow`.
- Return confidence and `needsConfirmation`.
- Save parsed attempts in `NlpParsedEntry`.

API route:

```text
POST /api/nlp/parse
```

Beginner note:

- Start rule-based before AI.
- Rule-based parsing is easier to test, free to run, and predictable.
- The UI should always ask the user to confirm the parse before saving.

Done when:

- `I ran 2 miles today` returns habit, quantity, unit, category, date, and confidence.
- Unknown input returns a low-confidence parse instead of failing.
- Parsed entries are stored for dashboard history.

### Phase 10: Frontend Foundation

Goal: create a usable app shell before individual pages become complex.

Build these files:

- `client/app/layout.tsx`
- `client/app/globals.css`
- `client/services/api.ts`
- `client/types/index.ts`
- `client/hooks/useAuth.tsx`
- `client/components/layout/AppShell.tsx`
- `client/components/layout/ProtectedPage.tsx`
- `client/components/layout/ThemeToggle.tsx`
- `client/components/ui/*`

Tasks:

- Configure Tailwind.
- Create reusable UI primitives like button, input, card, table, badge, dialog, tabs, and select.
- Create a typed API client around `fetch`.
- Store the JWT in localStorage.
- Add an auth hook that can log in, register, load current user, and log out.
- Add protected page behavior.
- Add layout navigation.

Beginner note:

- Keep API calls in `client/services/api.ts` instead of scattering `fetch` everywhere.
- Keep auth state in one hook so every page reads the same user/token state.

Done when:

- The frontend can call the backend.
- Users stay signed in after refresh.
- Protected pages redirect or block unauthenticated visitors.

### Phase 11: Public, Login, and Register Pages

Goal: let people enter the app.

Build these routes:

- `client/app/page.tsx`
- `client/app/login/page.tsx`
- `client/app/register/page.tsx`

Tasks:

- Build a landing page that explains the app and links to auth pages.
- Build a login form.
- Build a register form.
- Show loading states while requests run.
- Show error messages when auth fails.
- Save the token after successful auth.
- Redirect signed-in users to the dashboard.

Done when:

- A new user can register from the browser.
- An existing user can log in from the browser.
- Bad credentials show a clear error.

### Phase 12: Habits UI

Goal: let users manage habit targets visually.

Build these routes:

- `client/app/habits/page.tsx`
- `client/app/habits/[id]/page.tsx`

Tasks:

- Load habits from the API.
- Show loading, error, empty, and success states.
- Add a create-habit dialog.
- Add search and category filtering.
- Add delete action.
- Add a detail page with editable habit fields.

Done when:

- A user can create a habit and see it immediately.
- A user can filter and search the habit list.
- A user can view, edit, and delete a habit.

### Phase 13: NLP Entry UI

Goal: make natural language logging feel safe and editable.

Build this route:

- `client/app/nlp/page.tsx`

Tasks:

- Create a text input for natural entries.
- Add sample buttons for common entries.
- Call `/api/nlp/parse`.
- Show parser confidence.
- Fill an editable confirmation form.
- Let the user correct habit, quantity, unit, date, and category.
- Save the confirmed result through `/api/logs`.

Done when:

- A user can type `Drank 4 cups of water`.
- The parser fills the confirmation form.
- The user can edit the result before saving.
- Saving the result updates logs and dashboard data.

### Phase 14: Dashboard and Charts

Goal: turn data into quick feedback.

Build these files:

- `client/app/dashboard/page.tsx`
- `client/components/charts/WeeklyProgressChart.tsx`
- `client/components/charts/MonthlyProgressChart.tsx`
- `client/components/charts/CategoryDistributionChart.tsx`

Tasks:

- Load `/api/logs/stats`.
- Display top-level stat cards.
- Render weekly progress.
- Render monthly progress.
- Render category distribution.
- Show current streaks.
- Show recent NLP entries.
- Add a refresh button.

Done when:

- A new account shows helpful empty states.
- An account with logs shows meaningful charts.
- Refreshing after saving a log updates the dashboard.

### Phase 15: Calendar and Admin

Goal: add supporting views for habit history and platform analytics.

Build these routes:

- `client/app/calendar/page.tsx`
- `client/app/admin/page.tsx`

Admin backend:

- `server/src/controllers/adminController.ts`
- `server/src/routes/adminRoutes.ts`

Tasks:

- Calendar: show logs by date or a date-focused activity view.
- Admin: show total users, habits, logs, parsed entries, and role breakdown.
- Protect admin routes on the frontend with `adminOnly`.
- Protect admin routes on the backend with role middleware.

Done when:

- Regular users cannot view admin analytics.
- Admin users can view platform totals.
- Calendar/history gives users another way to review progress.

### Phase 16: Seed Data and Local Demo

Goal: make the project easy to test.

Build this file:

- `server/src/scripts/seed.ts`

Tasks:

- Create demo user and admin accounts.
- Create sample habits.
- Create sample logs.
- Clear or upsert demo data safely.
- Document credentials in the README.

Demo accounts:

```text
user@trackme.demo / password123
admin@trackme.demo / password123
```

Done when:

- `npm run seed` creates usable demo accounts.
- The dashboard has real chart data after seeding.

### Phase 17: Hardening and QA

Goal: make the app reliable enough to hand to someone else.

Tasks:

- Run `npm run typecheck`.
- Run `npm run lint`.
- Run `npm run build`.
- Test registration, login, logout, habits, NLP parsing, log saving, dashboard refresh, and admin analytics.
- Test invalid input and unauthorized access.
- Confirm each page has loading, error, and empty states.
- Confirm user-owned data cannot leak between accounts.

Minimum manual smoke test:

```text
1. Start MongoDB.
2. Run npm run seed.
3. Run npm run dev.
4. Log in as user@trackme.demo.
5. Create a habit.
6. Parse and save "I ran 2 miles today".
7. Refresh the dashboard.
8. Log out.
9. Log in as admin@trackme.demo.
10. Open the admin page.
```

Done when:

- TypeScript passes.
- Build passes.
- The smoke test works without console errors or broken screens.

## Sprint Roadmap

Use one-week sprints if you are learning while building. If you already know the stack well, each sprint can become two or three focused days.

| Sprint | Theme | Main Outcome |
| --- | --- | --- |
| 1 | Project foundation | Monorepo, Next.js, Express, MongoDB connection, health route |
| 2 | Data and auth | Models, validation, registration, login, JWT protection |
| 3 | Habit management | Habit CRUD API and habit management UI |
| 4 | Logs and progress | Log creation, progress history, stats service |
| 5 | NLP workflow | Rule-based parser, parse API, confirmation UI, save flow |
| 6 | Dashboard | Charts, streaks, recent activity, empty/loading/error states |
| 7 | Admin and calendar | Admin analytics, calendar/history, role protection |
| 8 | Polish and release | Seed data, smoke tests, README, deployment prep |

## Detailed Sprint 1 Plan

Sprint 1 is the most important sprint because it creates the foundation. Do not rush it. A clean foundation makes every later feature easier.

### Sprint 1 Goal

Create a working full-stack skeleton where:

- The frontend runs.
- The backend runs.
- The backend connects to MongoDB.
- The frontend and backend have known ports.
- The backend exposes `/api/health`.
- Root scripts can run both apps.

### Sprint 1 Backlog

1. Create root workspace files.
2. Create `client/` Next.js app.
3. Create `server/` Express TypeScript app.
4. Add environment config.
5. Add database connection.
6. Add health route.
7. Add shared error handling.
8. Add README setup instructions.

### Sprint 1 Day-by-Day

#### Day 1: Repo and Tooling

Tasks:

- Create the root folder.
- Initialize npm.
- Add npm workspaces.
- Install `concurrently`.
- Add root scripts.
- Create `.gitignore`.

Commands:

```bash
npm init -y
npm install -D concurrently
```

Root scripts to create:

```json
{
  "dev": "concurrently \"npm run dev --workspace server\" \"npm run dev --workspace client\"",
  "dev:client": "npm run dev --workspace client",
  "dev:server": "npm run dev --workspace server",
  "build": "npm run build --workspace server && npm run build --workspace client",
  "typecheck": "npm run typecheck --workspace server && npm run typecheck --workspace client"
}
```

Acceptance criteria:

- `npm install` works from the root.
- The repo has separate `client` and `server` workspaces.

#### Day 2: Frontend Starter

Tasks:

- Create the Next.js app.
- Add TypeScript.
- Add Tailwind CSS.
- Add base global styles.
- Replace starter content with a simple TrackMe landing page.

Beginner focus:

- Learn the difference between `app/layout.tsx` and `app/page.tsx`.
- Keep the first page simple. You only need proof that Next.js works.

Acceptance criteria:

- `npm run dev:client` starts on `http://localhost:3000`.
- The browser shows a TrackMe page.

#### Day 3: Backend Starter

Tasks:

- Create `server/package.json`.
- Install Express, TypeScript, ts-node-dev, dotenv, cors, helmet, morgan, zod, mongoose.
- Create `server/src/index.ts`.
- Add JSON parsing, CORS, security headers, and request logging.
- Add `/api/health`.

Acceptance criteria:

- `npm run dev:server` starts on `http://localhost:4000`.
- `GET /api/health` returns `{ "status": "ok" }` or similar.

#### Day 4: Environment and MongoDB

Tasks:

- Create `server/.env.example`.
- Create `server/src/config/env.ts`.
- Create `server/src/config/database.ts`.
- Connect to MongoDB before starting the server.

Example env:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/trackme
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
ADMIN_INVITE_CODE=trackme-admin-demo
```

Acceptance criteria:

- Server logs a successful MongoDB connection.
- Server fails clearly if required env values are missing.

#### Day 5: Error Handling and Documentation

Tasks:

- Add `AppError`.
- Add `asyncHandler`.
- Add `notFoundHandler`.
- Add `errorHandler`.
- Update README setup steps.
- Run the first full smoke test.

Acceptance criteria:

- Unknown routes return JSON.
- Thrown app errors return JSON with a status code.
- Root `npm run dev` starts both frontend and backend.
- README explains how to install, configure env, and run the app.

### Sprint 1 Definition of Done

Sprint 1 is done only when:

- `npm run dev:client` works.
- `npm run dev:server` works.
- `npm run dev` works from the root.
- `/api/health` responds.
- MongoDB connection works.
- Missing env values produce understandable errors.
- README setup is accurate enough for another person to follow.

## Beginner Build Rules

Use these rules throughout the project:

- Build one vertical slice at a time. For example: backend route, API client method, page UI, then smoke test.
- Keep controllers thin. Put reusable logic in services.
- Validate all request bodies with Zod.
- Protect private routes on both backend and frontend.
- Scope user-owned database queries by user id.
- Add loading, error, empty, and success states to every data page.
- Prefer boring, predictable code over clever code.
- Test with real browser clicks, not only by reading code.

## What to Avoid

- Do not build charts before logs exist.
- Do not build admin UI before role protection exists.
- Do not trust frontend-only protection for private data.
- Do not skip seed data. Seed data makes demos and testing much easier.
- Do not let the NLP parser save directly without user confirmation.
- Do not store JWT secrets or database URLs in committed files.

## Final Release Checklist

Before calling TrackMe ready:

- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run build` passes.
- README setup works from a clean install.
- Demo accounts can log in.
- User-owned data is scoped correctly.
- Admin page is admin-only.
- NLP parse and save flow works.
- Dashboard charts update after logs are saved.
- Empty states look intentional.
- Error states are understandable.
