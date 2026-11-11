# Commands Reference

Quick reference for all commands used in this project.

## Supabase CLI Commands

### Installation
```bash
# Using npm
npm install -g supabase

# Using Homebrew (macOS)
brew install supabase/tap/supabase

# Using Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Project Setup
```bash
# Initialize Supabase in project
supabase init

# Link to remote project
supabase link --project-ref YOUR_PROJECT_REF

# Check connection
supabase status
```

### Migrations
```bash
# Push all migrations
supabase db push

# Push specific migration
supabase db push --file supabase/migrations/FILENAME.sql

# Check migration status
supabase migration list

# Create new migration
supabase migration new migration_name

# Reset database (DESTRUCTIVE - dev only)
supabase db reset
```

### Database Management
```bash
# View schema differences
supabase db diff --schema public

# Pull remote schema
supabase db pull

# Connect to database
supabase db shell
```

### Local Development
```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# View logs
supabase logs db
```

---

## Frontend Commands

### Setup
```bash
cd frontend
npm install
```

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Dependencies
```bash
# Add Supabase client
npm install @supabase/supabase-js

# Add other dependencies as needed
npm install package-name
```

---

## Backend Commands (Coming in Phase 3)

### Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### Development
```bash
# Run FastAPI server
uvicorn app.main:app --reload

# Run on specific port
uvicorn app.main:app --reload --port 8000

# Run tests
pytest

# Run tests with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest app/tests/test_auth.py -v
```

### Database (from backend)
```bash
# Python shell with Supabase client
python
>>> from app.db import get_supabase_client
>>> supabase = get_supabase_client()
>>> supabase.table('profiles').select('*').execute()
```

---

## Git Commands

### Initial Setup
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### Daily Workflow
```bash
# Check status
git status

# Add files
git add .
git add specific-file.js

# Commit
git commit -m "Descriptive message"

# Push
git push

# Pull latest
git pull
```

### Branching
```bash
# Create and switch to branch
git checkout -b feature/feature-name

# Switch branches
git checkout main

# Merge branch
git merge feature/feature-name

# Delete branch
git branch -d feature/feature-name
```

---

## PowerShell Commands (Windows)

### Directory Navigation
```powershell
# List files
Get-ChildItem
ls

# Change directory
cd path\to\directory

# Create directory
New-Item -ItemType Directory -Path "folder-name"
mkdir folder-name

# Remove file
Remove-Item file.txt

# Remove directory
Remove-Item -Recurse -Force directory-name
```

### Environment Variables
```powershell
# View env var
$env:VARIABLE_NAME

# Set env var (session only)
$env:VARIABLE_NAME = "value"

# Load from .env file (requires dotenv)
Get-Content .env | ForEach-Object {
  if ($_ -match '^(.+?)=(.+)$') {
    [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
  }
}
```

---

## Database Direct Access

### Using psql
```bash
# Connect to Supabase database
psql -h db.YOUR_PROJECT_REF.supabase.co -U postgres -d postgres

# Run SQL file
psql -h db.YOUR_PROJECT_REF.supabase.co -U postgres -d postgres -f file.sql

# With specific database
psql -h db.YOUR_PROJECT_REF.supabase.co -U postgres -d postgres -c "SELECT * FROM profiles;"
```

### Common psql Commands
```sql
-- List tables
\dt

-- Describe table
\d table_name

-- List databases
\l

-- Quit
\q

-- Execute SQL file
\i path/to/file.sql
```

---

## Testing Commands

### Frontend Testing (when added)
```bash
cd frontend

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Backend Testing
```bash
cd backend

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test
pytest app/tests/test_bids.py::test_approved_freelancer_can_bid -v

# Run with coverage
pytest --cov=app

# Generate HTML coverage report
pytest --cov=app --cov-report=html
open htmlcov/index.html
```

---

## Troubleshooting Commands

### Check Node/npm Version
```bash
node --version
npm --version
```

### Check Python Version
```bash
python --version
pip --version
```

### Clear npm Cache
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Clear Python Cache
```bash
# Windows
Remove-Item -Recurse -Force __pycache__, .pytest_cache, *.pyc

# macOS/Linux
find . -type d -name "__pycache__" -exec rm -r {} +
find . -type f -name "*.pyc" -delete
```

### Check Port Usage
```bash
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# macOS/Linux
lsof -i :8000
lsof -i :5173
```

### Kill Process on Port
```bash
# Windows (use PID from netstat)
taskkill /PID <PID> /F

# macOS/Linux
kill -9 $(lsof -ti:8000)
```

---

## Environment Setup Commands

### Create .env Files
```bash
# Frontend
cd frontend
copy .env.example .env
# Edit .env with your values

# Backend
cd backend
copy .env.example .env
# Edit .env with your values
```

### Install System Dependencies
```bash
# Python (Windows - using Scoop)
scoop install python

# Python (macOS - using Homebrew)
brew install python

# Node.js (Windows - using Scoop)
scoop install nodejs

# Node.js (macOS - using Homebrew)
brew install node
```

---

## Deployment Commands (Future)

### Frontend Deployment
```bash
# Build production bundle
cd frontend
npm run build

# Deploy to Vercel
npm install -g vercel
vercel --prod

# Deploy to Netlify
npm install -g netlify-cli
netlify deploy --prod
```

### Backend Deployment
```bash
# Using Docker (future)
docker build -t cui-freelance-backend .
docker run -p 8000:8000 cui-freelance-backend

# Using a platform (Railway, Render, etc.)
# Follow platform-specific instructions
```

---

## Backup & Restore

### Backup Supabase Database
```bash
# Dump schema and data
pg_dump -h db.YOUR_PROJECT_REF.supabase.co -U postgres -d postgres --clean --if-exists > backup.sql

# Schema only
pg_dump -h db.YOUR_PROJECT_REF.supabase.co -U postgres -d postgres --schema-only > schema.sql

# Data only
pg_dump -h db.YOUR_PROJECT_REF.supabase.co -U postgres -d postgres --data-only > data.sql
```

### Restore Database
```bash
psql -h db.YOUR_PROJECT_REF.supabase.co -U postgres -d postgres < backup.sql
```

---

## Logs & Monitoring

### View Supabase Logs
```bash
# In Supabase Dashboard
# Logs → Postgres Logs / API Logs / Auth Logs
```

### View Application Logs
```bash
# Frontend (browser console)
# Open browser DevTools → Console

# Backend (terminal)
# Logs appear in terminal where uvicorn is running

# Or write to file
uvicorn app.main:app --reload > logs/app.log 2>&1
```

---

## Quick Start (All Commands)

```bash
# 1. Clone/navigate to project
cd d:\freelancing_platform

# 2. Setup database
supabase link --project-ref YOUR_PROJECT_REF
supabase db push

# 3. Setup frontend
cd frontend
npm install
copy .env.example .env
# Edit .env
npm run dev
# Frontend runs on http://localhost:5173

# 4. Setup backend (Phase 3+)
cd ../backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
copy .env.example .env
# Edit .env
uvicorn app.main:app --reload
# Backend runs on http://localhost:8000
```

---

## Help Commands

```bash
# Supabase help
supabase help
supabase migration help

# npm help
npm help
npm help install

# Python/pip help
python --help
pip --help

# Git help
git --help
git commit --help
```

---

## Useful Aliases (Optional)

Add to your PowerShell profile (`$PROFILE`):

```powershell
# Project shortcuts
function goto-project { cd d:\freelancing_platform }
function goto-frontend { cd d:\freelancing_platform\frontend }
function goto-backend { cd d:\freelancing_platform\backend }

# Common commands
function dev-frontend { cd d:\freelancing_platform\frontend; npm run dev }
function dev-backend { cd d:\freelancing_platform\backend; .\venv\Scripts\activate; uvicorn app.main:app --reload }
function test-backend { cd d:\freelancing_platform\backend; pytest -v }

# Git shortcuts
function gs { git status }
function ga { git add . }
function gc { param($msg) git commit -m $msg }
function gp { git push }
```

Then reload: `. $PROFILE`
