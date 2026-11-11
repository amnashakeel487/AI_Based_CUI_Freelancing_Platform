# CUI Freelance Platform - Backend API

FastAPI backend for the Freelancer Module of the CUI Freelancing Platform.

## Features

- ✅ JWT authentication with Supabase
- ✅ Role-based access control (freelancer, client, admin)
- ✅ Approval status enforcement for freelancers
- ✅ CORS configuration for frontend
- ✅ Comprehensive error handling
- ✅ OpenAPI documentation
- ✅ Test suite with pytest

## Tech Stack

- **Framework:** FastAPI 0.104+
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth + JWT
- **Validation:** Pydantic v2
- **Testing:** Pytest
- **Python:** 3.11+

## Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Copy example env file
copy .env.example .env

# Edit .env with your Supabase credentials
notepad .env
```

Required environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (backend only, secret!)
- `SUPABASE_JWT_SECRET` - JWT secret for token verification
- `ALLOWED_EMAIL_DOMAINS` - Comma-separated list of allowed domains
- `FRONTEND_ORIGIN` - Frontend URL for CORS

### 4. Run Development Server

```bash
uvicorn app.main:app --reload
```

API will be available at: http://localhost:8000

### 5. View Documentation

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI Schema:** http://localhost:8000/openapi.json

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app, CORS, routers
│   ├── config.py            # Settings from env variables
│   ├── db.py                # Supabase client
│   ├── deps.py              # Auth dependencies
│   ├── routers/             # API endpoints
│   │   └── auth.py          # Auth routes
│   ├── schemas/             # Pydantic models
│   │   └── auth.py          # Auth schemas
│   ├── services/            # Business logic
│   └── tests/               # Test suite
│       ├── conftest.py      # Test fixtures
│       ├── test_health.py   # Health check tests
│       └── test_auth.py     # Auth tests
├── requirements.txt         # Python dependencies
├── pytest.ini               # Pytest configuration
├── .env.example             # Example environment variables
└── .gitignore               # Git ignore rules
```

## API Endpoints

### Health & Info
- `GET /health` - Health check
- `GET /` - API information

### Authentication (`/api/v1/auth`)
- `GET /me` - Get current user profile (requires auth)
- `POST /validate-registration` - Validate email domain

### Future Endpoints (Phases 4-8)
- Profile management
- Skills & portfolio
- Projects & recommendations
- Bids (proposals)
- Messages & notifications
- Reviews & earnings
- Settings & complaints

## Testing

### Run All Tests

```bash
pytest
```

### Run with Coverage

```bash
pytest --cov=app --cov-report=html
```

View coverage report: `htmlcov/index.html`

### Run Specific Tests

```bash
# Run specific test file
pytest app/tests/test_auth.py -v

# Run specific test
pytest app/tests/test_auth.py::test_email_validation_valid_domain -v

# Run only unit tests
pytest -m unit

# Run with verbose output
pytest -v
```

### Current Test Coverage

- ✅ Health check endpoint
- ✅ Root endpoint
- ✅ Email domain validation
- ✅ JWT token validation
- ✅ CORS headers
- ⏳ /me endpoint (requires Supabase connection)
- ⏳ Role-based access (Phase 4+)
- ⏳ Approval status checks (Phase 4+)

## Authentication Flow

1. **Frontend:** User logs in via Supabase Auth
2. **Frontend:** Receives JWT token from Supabase
3. **Frontend:** Sends token in `Authorization: Bearer <token>` header
4. **Backend:** Verifies token signature with JWT secret
5. **Backend:** Loads user profile from database
6. **Backend:** Returns user data with role and approval status
7. **Frontend:** Routes user based on role and status

## Security

### What's Protected
- All routes except `/health`, `/`, and `/validate-registration` require authentication
- JWT tokens are verified on every request
- RLS policies enforce database-level security
- Service role key is never exposed to frontend

### Role-Based Access
- **Pending freelancers:** Can read own profile only
- **Approved freelancers:** Can browse projects, submit bids
- **Clients:** Can manage own projects, review bids
- **Admins:** Can access all data, approve users

### Best Practices
- ✅ Service role key only in backend `.env`
- ✅ Frontend uses anon key only
- ✅ All secrets in `.env`, never committed
- ✅ CORS restricted to frontend origin
- ✅ Input validation with Pydantic
- ✅ Error messages don't expose internals in production

## Development

### Code Style

```bash
# Format code
black app/

# Lint code
ruff check app/
```

### Adding New Endpoints

1. Create Pydantic schemas in `app/schemas/`
2. Create router in `app/routers/`
3. Add business logic in `app/services/` (if complex)
4. Write tests in `app/tests/`
5. Include router in `app/main.py`

Example:
```python
# app/routers/projects.py
from fastapi import APIRouter, Depends
from app.deps import require_approved_freelancer, CurrentUser

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("/")
async def list_projects(
    user: CurrentUser = Depends(require_approved_freelancer)
):
    # Implementation
    pass
```

### Database Queries

```python
from supabase import Client
from app.db import get_supabase

supabase: Client = get_supabase()

# Query with RLS (user context)
response = supabase.table("profiles").select("*").eq("id", user_id).execute()

# Service role bypasses RLS
response = supabase.table("profiles").select("*").execute()
```

## Troubleshooting

### Import Errors
```bash
# Make sure virtual environment is activated
.\venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Supabase Connection Errors
- Check `SUPABASE_URL` is correct
- Check `SUPABASE_SERVICE_ROLE_KEY` is valid
- Check internet connection
- Verify Supabase project is not paused

### JWT Validation Errors
- Check `SUPABASE_JWT_SECRET` matches your project
- Get JWT secret from: Supabase Dashboard → Settings → API → JWT Settings
- Ensure token is not expired

### CORS Errors
- Check `FRONTEND_ORIGIN` matches your frontend URL exactly
- Include protocol (http:// or https://)
- No trailing slash

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

## Deployment (Future)

### Environment Variables
Set all variables from `.env.example` in your deployment platform.

### Recommended Platforms
- **Railway** - Automatic deployments from Git
- **Render** - Free tier available
- **Fly.io** - Global deployment
- **AWS ECS** - Full control
- **Google Cloud Run** - Serverless

### Docker (Future)
```bash
# Build image
docker build -t cui-freelance-backend .

# Run container
docker run -p 8000:8000 --env-file .env cui-freelance-backend
```

## Contributing

### Before Committing
1. Run tests: `pytest`
2. Format code: `black app/`
3. Check linting: `ruff check app/`
4. Update tests if needed
5. Update documentation if adding features

### Commit Guidelines
- Use descriptive commit messages
- Reference issue/task numbers if applicable
- One feature/fix per commit

## Support

- **Documentation:** See `docs/` folder in project root
- **API Docs:** http://localhost:8000/docs (when running)
- **Issues:** Check test output and logs

## Phase Status

**Phase 3: Backend Foundation** ✅ COMPLETE

Current endpoints:
- ✅ Health check
- ✅ Email validation
- ✅ Get current user (requires auth)

Next phase will add:
- Profile management
- Onboarding endpoints
- Registration helpers

## License

Part of CUI Freelance Platform - Final Year Project
COMSATS University Islamabad (Vehari Campus)

---

**Version:** 0.3.0  
**Python:** 3.11+  
**FastAPI:** 0.104+  
**Last Updated:** October 17, 2026
