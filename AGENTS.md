# AGENTS.md

## Cursor Cloud specific instructions

### What this is
This is a **Base44** React + Vite single-page app ("Girls Glowing Up" / GGU). Only the **frontend runs locally** — the database, auth, serverless functions and file storage are all hosted on the Base44 cloud and reached over HTTP. There is no local backend, database, or `docker-compose` to run.

### Required local config (non-obvious)
The Vite dev server only proxies API calls to the Base44 backend when `VITE_BASE44_APP_BASE_URL` is set. A `.env.local` file (git-ignored) must exist at the repo root with:

```
VITE_BASE44_APP_ID=6a0e12a89992f9565c11e330
VITE_BASE44_APP_BASE_URL=https://base44.app
```

- The app id comes from `base44/.app.jsonc`. `https://base44.app` (the SDK default) and `https://app.base44.com` both serve this app's backend.
- The startup update script recreates `.env.local` only if it is missing, so it is safe to edit/override it.
- The frontend calls `/api/...` (see `src/api/base44Client.js` with `serverUrl: ''`); `@base44/vite-plugin` proxies `/api` → `VITE_BASE44_APP_BASE_URL`. On `npm run dev` you should see the log line `[base44] Proxy enabled: /api -> https://base44.app`. If you instead see `Proxy not enabled`, `.env.local` is missing.

### Run / lint / test / build
Standard scripts are in `package.json`:
- `npm run dev` — start the Vite dev server (default port `5173`).
- `npm run lint` / `npm run lint:fix` — ESLint.
- `npm run typecheck` — `tsc` against `jsconfig.json`.
- `npm run build` / `npm run preview` — production build / preview.

There is **no automated test suite** (no test runner or `test` script) in this repo.

### Known pre-existing issues (not environment problems)
`npm run lint` and `npm run typecheck` both currently report many pre-existing errors in the committed source (mostly unused-imports for lint, and loose JS typing for typecheck). These are baseline code issues, not setup problems — do not treat them as caused by your environment.

### Testing notes
- Email/password **registration sends an OTP to the user's email** (`base44.auth.register` → verify-otp). You cannot complete OTP verification or email/password login in this environment without access to a real inbox. The registration form → "Verify Your Email" OTP screen transition does exercise the full stack (frontend → proxy → Base44 backend) and is a good smoke test.
- Most routes are behind `ProtectedRoute` and redirect to `/login`; `/`, `/login`, `/register` are public.
