import time
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from bson import ObjectId
from database import redis
from config import RATE_LIMIT_PER_MINUTE, logger

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            client_ip = request.client.host
            minute_key = f"rate_limit:{client_ip}:{int(time.time() / 60)}"
            
            # Increment rate limit counter
            current_count = redis.incr(minute_key)
            redis.expire(minute_key, 60)
            
            if current_count > RATE_LIMIT_PER_MINUTE:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Rate limit exceeded"}
                )
            
            # Call the next middleware/endpoint
            response = await call_next(request)
            return response
            
        except Exception as e:
            # Log the full exception for debugging
            logger.error(f"Rate limit middleware error: {str(e)}", exc_info=True)
            
            # Return a generic error response
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal server error in rate limiting"}
            )