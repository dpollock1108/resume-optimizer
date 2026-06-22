import os
from dataclasses import dataclass

from fastapi import HTTPException, Request, status
from google.auth.exceptions import GoogleAuthError
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token


@dataclass(frozen=True)
class AuthenticatedUser:
    id: str
    email: str


def _development_user() -> AuthenticatedUser:
    user_id = os.getenv("DEV_USER_ID", "local-user")
    email = os.getenv("DEV_USER_EMAIL", "local@example.com")
    return AuthenticatedUser(id=user_id, email=email)


def get_authenticated_user(request: Request) -> AuthenticatedUser:
    if os.getenv("APP_ENV", "development") == "development":
        return _development_user()

    audience = os.getenv("IAP_AUDIENCE")
    if not audience:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured",
        )

    token = request.headers.get("x-goog-iap-jwt-assertion")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    try:
        claims = id_token.verify_token(
            token,
            google_requests.Request(),
            audience=audience,
            certs_url="https://www.gstatic.com/iap/verify/public_key",
        )
        if claims.get("iss") != "https://cloud.google.com/iap":
            raise ValueError("Unexpected token issuer")
        user_id = claims["sub"]
        email = claims["email"]
    except (GoogleAuthError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        ) from None

    return AuthenticatedUser(id=user_id, email=email)
