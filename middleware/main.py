from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from contextlib import asynccontextmanager
import asyncio

# Import configuration and database
from config import logger
from database import check_db_connection, close_connections

# Import middleware
from middleware.rate_limit import RateLimitMiddleware
from middleware.request_size_limit import RequestSizeLimiter
from middleware.security_middleware import SecurityHeadersMiddleware

# Import service functions
from services.session import periodic_session_cleanup

# Import route modules
from routes import admin, users, sessions, extensions, payments, support, marketplace, shared_extensions, tokenization, hedera


# Application lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up API server")
    if not await check_db_connection():
        logger.critical("Failed to connect to database")
        raise SystemExit()
    
    # DISABLED: Automatic session cleanup - sessions should be preserved forever
    # cleanup_task = asyncio.create_task(periodic_session_cleanup())
    
    yield
    
    # DISABLED: No cleanup task to cancel
    # cleanup_task.cancel()
    logger.info("Shutting down API server")
    close_connections()

# FastAPI App
app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://www.codease.pro", "https://codease.pro", "http://localhost:3000","https://codease-test-ui.proudtree-f1f304bd.westus2.azurecontainerapps.io"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600  # Cache preflight requests for 10 minutes
)

# app.add_middleware(HTTPSRedirectMiddleware)  # redirect HTTP → HTTPS

# Add rate limiting middleware
app.add_middleware(RateLimitMiddleware)
# Add request size limit middleware
app.add_middleware(RequestSizeLimiter)
# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# Include routers from route modules
app.include_router(users.router)
app.include_router(sessions.router)
app.include_router(extensions.router)
# app.include_router(testing.router)
app.include_router(admin.router)
app.include_router(payments.router)
app.include_router(support.router)
# app.include_router(payment_test.router)
app.include_router(marketplace.router)  # Add this line
app.include_router(shared_extensions.router)  # Add shared extensions router
app.include_router(tokenization.router)  # Add tokenization router
app.include_router(hedera.router)  # Add Hedera router

# Add a root endpoint for health checks
@app.get("/")
async def root():
    return {"status": "ok", "message": "CodEase Middleware API is running"}

