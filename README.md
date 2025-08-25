# Website-Making Contest Platform (MERN)

## Quick start

- Client (Vite + React + Tailwind): `cd client && npm install && npm run dev`
- Server (Express + MongoDB): `cd server && npm install && npm run dev`

Ensure MongoDB is running locally or set `MONGO_URI` in `server/.env`.

## Features

- Landing page, registration, leaderboard
- Admin login (JWT), CRUD for contestants, score updates
- Secure headers (helmet), CORS, input validation (basic)

## Seeding an admin

Temporarily set `ALLOW_SEED=1` in `server/.env`, then POST `/api/auth/seed` with `{ email, password }`. Remove the flag afterward.

## Dev proxy

Client proxies `/api/*` to `http://localhost:5000` via Vite config.
