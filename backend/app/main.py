"""FastAPI application entry point."""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.routers import (
    auth, freelancer_profile, freelancer_skills, freelancer_portfolio,
    projects, recommendations, bids, contracts,
    messages, notifications, reviews, earnings, complaints, account,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    settings = get_settings()
    logger.info(f"Starting CUI Freelance API in {settings.environment} mode")
    logger.info(f"Allowed email domains: {settings.allowed_domains_list}")
    yield
    # Shutdown
    logger.info("Shutting down CUI Freelance API")


# Create FastAPI application
app = FastAPI(
    title="CUI Freelance API",
    description="Backend API for CUI Freelancing Platform - Freelancer Module",
    version="0.3.0",
    lifespan=lifespan,
)

# Configure CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    
    Returns 200 OK if the service is running.
    Used by monitoring tools and load balancers.
    """
    return JSONResponse(
        content={
            "status": "healthy",
            "service": "cui-freelance-api",
            "version": "0.3.0",
        }
    )


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """
    API root endpoint.
    
    Returns basic API information and links to documentation.
    """
    return JSONResponse(
        content={
            "message": "CUI Freelance API",
            "version": "0.3.0",
            "docs": "/docs",
            "health": "/health",
        }
    )


# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(freelancer_profile.router, prefix="/api/v1")
app.include_router(freelancer_skills.router, prefix="/api/v1")
app.include_router(freelancer_portfolio.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(recommendations.router, prefix="/api/v1")
app.include_router(bids.router, prefix="/api/v1")
app.include_router(contracts.router, prefix="/api/v1")
app.include_router(messages.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(reviews.router, prefix="/api/v1")
app.include_router(earnings.router, prefix="/api/v1")
app.include_router(complaints.router, prefix="/api/v1")
app.include_router(account.router, prefix="/api/v1")


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Catch-all exception handler.
    
    Logs unexpected errors and returns a generic 500 response
    without exposing internal details in production.
    """
    logger.error(f"Unexpected error: {exc}", exc_info=True)

    if settings.is_production:
        return JSONResponse(
            status_code=500,
            content={
                "detail": "An internal error occurred. Please try again later.",
                "code": "INTERNAL_ERROR",
            },
        )
    else:
        # In development, return more details
        return JSONResponse(
            status_code=500,
            content={
                "detail": str(exc),
                "code": "INTERNAL_ERROR",
                "type": type(exc).__name__,
            },
        )
