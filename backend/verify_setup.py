"""Verify backend setup without running the full server."""
import sys

print("Checking Python version...")
if sys.version_info < (3, 11):
    print(f"❌ Python 3.11+ required. You have {sys.version}")
    sys.exit(1)
print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")

print("\nChecking imports...")
try:
    import fastapi
    print(f"✅ FastAPI {fastapi.__version__}")
except ImportError:
    print("❌ FastAPI not installed. Run: pip install -r requirements.txt")
    sys.exit(1)

try:
    import pydantic
    print(f"✅ Pydantic {pydantic.__version__}")
except ImportError:
    print("❌ Pydantic not installed")
    sys.exit(1)

try:
    import uvicorn
    print(f"✅ Uvicorn {uvicorn.__version__}")
except ImportError:
    print("❌ Uvicorn not installed")
    sys.exit(1)

try:
    import supabase
    print("✅ Supabase client installed")
except ImportError:
    print("❌ Supabase client not installed")
    sys.exit(1)

try:
    import jose
    print("✅ Python-JOSE installed")
except ImportError:
    print("❌ Python-JOSE not installed")
    sys.exit(1)

try:
    import pytest
    print(f"✅ Pytest {pytest.__version__}")
except ImportError:
    print("❌ Pytest not installed")
    sys.exit(1)

print("\nChecking app module...")
try:
    from app.config import get_settings
    print("✅ App config module loads")
except Exception as e:
    print(f"❌ Error loading app: {e}")
    sys.exit(1)

print("\n" + "="*50)
print("✅ Backend setup verified!")
print("="*50)
print("\nNext steps:")
print("1. Copy .env.example to .env")
print("2. Fill in your Supabase credentials")
print("3. Run: uvicorn app.main:app --reload")
print("4. Visit: http://localhost:8000/docs")
