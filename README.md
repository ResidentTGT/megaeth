# MegaETH Leaderboard

Two-project app for viewing the MegaETH leaderboard:

- `backend/` - Fastify + TypeScript API.
- `frontend/` - Vite + React + TypeScript UI.

The backend fetches the full leaderboard from `https://terminal.megaeth.com/leaderboard`, parses the embedded Next.js payload, caches the result in memory for 60 seconds, and exposes it through `GET /leaderboard`.

## Local Development

Install dependencies:

```bash
npm install
```

Run both apps:

```bash
npm run dev
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:4000/health`
- Backend leaderboard: `http://localhost:4000/leaderboard`

## Checks

```bash
npm run typecheck
npm run build
```

## Deploy Option A: Render Backend + Vercel Frontend

This is the recommended demo setup.

### 1. Push to GitHub

Create a GitHub repository and push this project.

### 2. Deploy Backend on Render

Use the included `render.yaml` as a Render Blueprint, or create a Web Service manually.

Manual Render settings:

- Service type: `Web Service`
- Runtime: `Node`
- Build command:

```bash
npm ci && npm run build -w backend
```

- Start command:

```bash
npm run start -w backend
```

- Health check path:

```text
/health
```

Environment variables:

```text
NODE_VERSION=22.13.1
LEADERBOARD_CACHE_TTL_MS=60000
FRONTEND_ORIGIN=https://your-frontend-domain.vercel.app
```

Render will give the backend a URL like:

```text
https://your-backend.onrender.com
```

### 3. Deploy Frontend on Vercel

Create a Vercel project from the same GitHub repository.

Recommended Vercel settings:

- Root directory: `frontend`
- Framework preset: `Vite`
- Build command:

```bash
npm run build
```

- Output directory:

```text
dist
```

Environment variables:

```text
VITE_API_URL=https://your-backend.onrender.com
```

After Vercel gives you the frontend URL, put that exact URL into Render's `FRONTEND_ORIGIN` and redeploy the backend.

## Deploy Option B: Render Only

You can host both parts on Render:

- Backend as a Web Service.
- Frontend as a Static Site.

Frontend Render settings:

- Root directory: `frontend`
- Build command:

```bash
npm install && npm run build
```

- Publish directory:

```text
dist
```

- Environment variable:

```text
VITE_API_URL=https://your-backend.onrender.com
```

Then set the frontend Render URL as `FRONTEND_ORIGIN` on the backend service and redeploy it.

## Notes

- Render free web services can spin down after idle time. The first request after that can be slow.
- The backend cache is in memory. It resets when the server restarts.
- `FRONTEND_ORIGIN` accepts a comma-separated list if you need multiple frontend domains.
