# Deployment Guide | دليل النشر

## Quick Start | بدء سريع

1. **Push to GitHub**
```bash
git remote add origin https://github.com/WWW-Alhnani-COM/riyadhstore.git
git add .
git commit -m "Ready for deployment"
git push -u origin main
```

2. **Deploy Backend (Render)**
- Connect your GitHub repo to [Render](https://render.com)
- Use the `render.yaml` blueprint (one-click deploy)
- Or create a Web Service manually:
  - **Build Command:** `pnpm install && pnpm run build`
  - **Start Command:** `node --enable-source-maps ./artifacts/api-server/dist/index.mjs`
  - **Env vars:** `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV=production`, `PORT=8080`

3. **Deploy Frontend (Vercel)**
- Import your GitHub repo on [Vercel](https://vercel.com)
- The `vercel.json` config handles everything automatically
- Or use `vercel --prod` from CLI

---

## Environment Variables | متغيرات البيئة

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Strong random string (min 32 chars) for session signing |
| `NODE_ENV` | Yes | `production` |
| `PORT` | Yes | Server port (e.g. `8080`) |
| `BASE_PATH` | No | Frontend base path (default `/`) |

```env
# Example .env
NODE_ENV=production
PORT=8080
DATABASE_URL=postgres://user:password@host:5432/dbname
SESSION_SECRET=your-very-long-random-secret-key-min-32-chars
```

---

## 1. Render (Backend + Database) | السيرفر وقاعدة البيانات

### Option A: Blueprint (One-Click) | التشغيل بنقرة واحدة

The `render.yaml` file is already configured. On Render dashboard:
1. Click **"New Blueprint Instance"**
2. Connect your GitHub repo
3. Render creates:
   - PostgreSQL database (`riyadhstore-db`)
   - API server (`riyadhstore-api`)
   - Static frontend (`riyadhstore-web`) with API proxy

### Option B: Manual Web Service | يدويا

1. Create a **Web Service** on Render
2. Connect your GitHub repo
3. **Settings:**
   - **Build Command:** `pnpm install && pnpm run build`
   - **Start Command:** `node --enable-source-maps ./artifacts/api-server/dist/index.mjs`
4. **Environment Variables:**
   - `NODE_ENV=production`
   - `PORT=8080` (Render sets this automatically)
   - `DATABASE_URL` (from your Render PostgreSQL)
   - `SESSION_SECRET` (generate with `openssl rand -hex 32`)

### After Deploy | بعد النشر

Run the seed script to create tables and default data:
```bash
# If using Render Shell
pnpm --filter @workspace/scripts run db:seed
```

Or connect to your database and run the seed SQL manually.

---

## 2. Vercel (Frontend Only) | واجهة الموقع الأمامية

The `vercel.json` file is pre-configured. On Vercel:
1. Import your GitHub repo
2. Vercel auto-detects the `vercel.json` config
3. Your frontend deploys automatically on every push

**For API calls from Vercel frontend to Render backend:**
Update your frontend API base URL. The generated API client uses `import.meta.env.VITE_API_URL` or falls back to `/api`. Add this to your Vercel environment variables:
```env
VITE_API_URL=https://riyadhstore-api.onrender.com/api
```

Then update `artifacts/store/src/lib/api.ts` (or wherever the base URL is set) to use that env variable.

---

## 3. Self-Hosting with Docker | الاستضافة الشخصية

### Docker Compose (Recommended) | الأفضل

```bash
# 1. Create .env with your secret
echo "SESSION_SECRET=$(openssl rand -hex 32)" > .env

# 2. Start PostgreSQL + API
docker compose up -d

# 3. Seed the database
docker compose exec api pnpm db:seed

# 4. Open http://localhost:8080
```

### Manual Docker Build | بناء يدوي

```bash
# Build the image
docker build -t riyadhstore .

# Run (needs DATABASE_URL env)
docker run -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e DATABASE_URL=postgres://... \
  -e SESSION_SECRET=... \
  riyadhstore
```

---

## 4. CI/CD with GitHub Actions | الاختبار الآلي

The `.github/workflows/ci.yml` runs on every push:
- Installs pnpm dependencies
- Typechecks the entire monorepo
- Builds all packages

Add deployment steps to the workflow for automatic deploys on Render/Vercel.

---

## Notes | ملاحظات

- **Session cookie** `store.sid` uses `secure: true` in production — your site must use HTTPS.
- **Default admin:** `admin@store.sa` / `admin123` (created by seed script).
- **Database:** The seed script creates tables if they don't exist. You can also use `drizzle-kit push` for schema management.
- **Images:** Product images in `artifacts/store/public/products/` are included in the built output.
- **API + Frontend together:** The Dockerfile bundles both — the API serves static files from `./dist/public` automatically in production.
