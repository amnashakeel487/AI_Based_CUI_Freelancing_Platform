# Setup Guide — CUI Freelance Platform

Complete setup instructions for the freelancer module.

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 18+ | `node --version` |
| Python | 3.11+ | `python --version` |
| Supabase CLI | latest | `supabase --version` |
| Git | any | `git --version` |

---

## 1. Database (Supabase)

### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project — note the **Project URL**, **anon key**, **service role key**, and **JWT secret**
3. These are found in: Dashboard → Settings → API

### Apply Migrations

```bash
cd d:\freelancing_platform

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply all migrations
supabase db push
```

This creates:
- 21 tables with foreign keys and indexes
- 70+ RLS policies
- 3 storage buckets (avatars, portfolio, deliverables)
- 6 categories + 75+ skills seeded

### Enable Realtime
In Supabase Dashboard → Database → Replication:
- Enable `messages` table
- Enable `notifications` table

### Optional: Seed Demo Data
```bash
# Edit supabase/seed_demo.sql — replace placeholder UUIDs with real user IDs
# Then run via SQL Editor in Supabase Dashboard
```

---

## 2. Backend (FastAPI)

### Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Configure Environment

```bash
# Copy example
copy .env.example .env    # Windows
cp .env.example .env       # macOS/Linux

# Edit .env with your Supabase credentials:
```

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
ALLOWED_EMAIL_DOMAINS=comsats.edu.pk,cuilahore.edu.pk,cuivehari.edu.pk
FRONTEND_ORIGIN=http://localhost:5173
LOG_LEVEL=INFO
ENVIRONMENT=development
```

### Run

```bash
uvicorn app.main:app --reload
```

Backend available at:
- API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

### Run Tests

```bash
pytest -v
# Expected: 87 passed
```

---

## 3. Frontend (React + Vite)

### Setup

```bash
cd frontend

# Install dependencies
npm install
```

### Configure Environment

```bash
# Copy example
copy .env.example .env    # Windows
cp .env.example .env       # macOS/Linux

# Edit .env:
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000/api/v1
```

### Run

```bash
npm run dev
```

Frontend available at: http://localhost:5173

### Build

```bash
npm run build
# Output: dist/ folder
```

---

## 4. Full Stack Startup

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Then visit http://localhost:5173

---

## 5. End-to-End Walk-Through

1. **Register** — Go to `/role` → choose Freelancer → fill form with COMSATS email → verify OTP
2. **Pending** — After registration, freelancer is `pending` → PendingApproval screen shows
3. **Admin approves** — In Supabase Dashboard, run:
   ```sql
   UPDATE freelancer_profiles SET approval_status = 'approved', approved_at = NOW()
   WHERE user_id = 'your-user-uuid';
   ```
4. **Login** — Login redirects to onboarding (since `onboarding_complete = false`)
5. **Onboarding** — Complete the 6-step wizard → profile saved to backend
6. **Dashboard** — Real stats from API (active projects, pending proposals, rating, completion %)
7. **Skills** — Add/remove skills → saved via PUT /freelancer/skills/
8. **Portfolio** — Add projects with image upload to Supabase Storage
9. **Browse projects** — Server-side search, filter, pagination
10. **Submit proposal** — Cover letter + bid amount + delivery days → POST /bids/
11. **Recommendations** — Rule-based scoring with match %, matched/missing skills, reason text
12. **Active project** — After client accepts bid → workspace with milestones, activity, files
13. **Submit work** — File upload to deliverables bucket + notes → project status → submitted
14. **Messages** — Real-time chat with client via Supabase Realtime
15. **Notifications** — Real-time notifications, mark as read
16. **Reviews** — Rating summary with breakdown
17. **Earnings** — Transaction history (read-only)
18. **Settings** — Password change, notification preferences, Premium AI tools placeholder
19. **Help** — FAQ + complaint submission

---

## Environment Variables Summary

### Frontend (`frontend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://abc.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key | `eyJ...` |
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000/api/v1` |

### Backend (`backend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://abc.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (secret!) | `eyJ...` |
| `SUPABASE_JWT_SECRET` | JWT secret for token verification | `your-secret` |
| `ALLOWED_EMAIL_DOMAINS` | Comma-separated allowed domains | `comsats.edu.pk,cuilahore.edu.pk` |
| `FRONTEND_ORIGIN` | Frontend URL for CORS | `http://localhost:5173` |
| `LOG_LEVEL` | Python logging level | `INFO` |
| `ENVIRONMENT` | Environment name | `development` |

**Security:**
- `.env` files are in `.gitignore` — never committed
- Service role key is backend-only — never exposed to frontend
- Frontend uses anon key only — RLS policies enforce security

---

## API Endpoints (Complete List)

### Auth
- `POST /api/v1/auth/validate-registration` — Email domain check
- `GET /api/v1/auth/me` — Current user profile
- `POST /api/v1/auth/register-complete` — Create profile rows post-signup

### Freelancer Profile
- `GET /api/v1/freelancer/profile/` — Get profile
- `PUT /api/v1/freelancer/profile/` — Update profile
- `POST /api/v1/freelancer/profile/onboarding/complete` — Complete onboarding
- `GET /api/v1/freelancer/profile/completion` — Completion %

### Skills
- `GET /api/v1/freelancer/skills/` — My skills
- `GET /api/v1/freelancer/skills/catalog` — Skills catalog
- `POST /api/v1/freelancer/skills/` — Add skill
- `PUT /api/v1/freelancer/skills/` — Replace all skills
- `DELETE /api/v1/freelancer/skills/{id}` — Remove skill

### Portfolio
- `GET /api/v1/freelancer/portfolio/` — My portfolio
- `POST /api/v1/freelancer/portfolio/` — Create item
- `PUT /api/v1/freelancer/portfolio/{id}` — Update item
- `DELETE /api/v1/freelancer/portfolio/{id}` — Delete item
- `POST /api/v1/freelancer/portfolio/upload-url` — Signed upload URL

### Projects
- `GET /api/v1/projects/categories` — List categories
- `GET /api/v1/projects/` — Browse (filter/sort/paginate)
- `GET /api/v1/projects/{id}` — Project detail
- `POST /api/v1/projects/{id}/save` — Bookmark
- `DELETE /api/v1/projects/{id}/save` — Remove bookmark

### Recommendations
- `GET /api/v1/recommendations/projects` — Ranked projects

### Bids (Proposals)
- `POST /api/v1/bids/` — Submit proposal
- `GET /api/v1/bids/` — My proposals
- `GET /api/v1/bids/{id}` — Proposal detail
- `PUT /api/v1/bids/{id}` — Edit pending proposal
- `POST /api/v1/bids/{id}/withdraw` — Withdraw proposal

### Contracts (Active Projects)
- `GET /api/v1/contracts/` — My active contracts
- `GET /api/v1/contracts/{id}` — Workspace (milestones + activity + submissions)
- `POST /api/v1/contracts/{id}/submit` — Submit work
- `POST /api/v1/contracts/{id}/dispute` — Raise dispute
- `POST /api/v1/contracts/{id}/deliverable-upload-url` — Signed upload URL

### Messages
- `GET /api/v1/messages/conversations` — List conversations
- `GET /api/v1/messages/conversations/{id}/messages` — Messages
- `POST /api/v1/messages/conversations/{id}/messages` — Send message
- `POST /api/v1/messages/conversations/{id}/read` — Mark read

### Notifications
- `GET /api/v1/notifications/` — List notifications
- `POST /api/v1/notifications/{id}/read` — Mark one read
- `POST /api/v1/notifications/read-all` — Mark all read

### Reviews
- `GET /api/v1/reviews/summary` — Rating summary
- `GET /api/v1/reviews/` — Full review list

### Earnings
- `GET /api/v1/earnings/summary` — Earnings summary
- `GET /api/v1/earnings/transactions` — Transaction list
- `GET /api/v1/earnings/transactions/{id}` — Single transaction

### Complaints
- `GET /api/v1/complaints/` — My complaints
- `POST /api/v1/complaints/` — File complaint

### Account
- `PUT /api/v1/account/settings` — Update settings

---

## Troubleshooting

### Frontend won't load
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Check backend is running at `VITE_API_URL`
- Check browser console for errors

### Backend won't start
- Verify `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_JWT_SECRET` are correct
- Check `ALLOWED_EMAIL_DOMAINS` is set
- Check `FRONTEND_ORIGIN` matches your frontend URL (no trailing slash)

### Registration fails
- Verify email domain is in `ALLOWED_EMAIL_DOMAINS`
- Check Supabase Auth settings — email confirmations should be enabled

### 401 on API calls
- Check JWT token is being sent in `Authorization: Bearer <token>` header
- Verify `SUPABASE_JWT_SECRET` matches your project's JWT secret
- Token may be expired — re-login

### RLS blocks data
- Verify RLS policies are applied (`supabase db push`)
- Check user has `profiles` row (call `POST /auth/register-complete` after signup)
- For freelancers, check `approval_status = 'approved'`

### Realtime not working
- Enable Realtime on `messages` and `notifications` tables in Supabase Dashboard
- Check browser console for WebSocket connection errors

### File upload fails
- Check storage bucket exists and policies are applied
- Verify file type and size limits (avatars: 5MB, portfolio: 10MB, deliverables: 50MB)
- Check signed URL is valid (not expired)
