"""
security.py – Password hashing and JWT token utilities.

Dependencies:
  - bcrypt==4.0.1    : pinned for __about__ compatibility (4.1+ broke passlib)
  - passlib[bcrypt]  : 1.7.4 compatibility shim (suppressed version warning)
  - python-jose      : JWT encode / decode
"""
import logging
import warnings
from datetime import datetime, timedelta, timezone
from typing import Optional

# ---------------------------------------------------------------------------
# Suppress the passlib bcrypt version warning.
# passlib 1.7.4 tries to read bcrypt.__about__.__version__ which was removed
# in bcrypt 4.1+. We pin bcrypt==4.0.1 to avoid this, but add a filter as a
# belt-and-suspenders guard in case the environment has a different version.
# ---------------------------------------------------------------------------
logging.getLogger("passlib").setLevel(logging.ERROR)
warnings.filterwarnings("ignore", message=".*error reading bcrypt version.*")

import bcrypt
from jose import JWTError, jwt
from fastapi import HTTPException, status

from app.config import settings


# ---------------------------------------------------------------------------
# Password hashing – using bcrypt directly (bypasses passlib version conflicts)
# ---------------------------------------------------------------------------

def get_password_hash(password: str) -> str:
    """
    Returns a bcrypt hash of the given plaintext password.

    Raises:
        HTTPException 400: if the password exceeds bcrypt's 72-byte limit
                           (prevents a raw ValueError / 500 reaching the client).
    """
    try:
        password_bytes = password.encode("utf-8")
        # Enforce the 72-byte limit explicitly with a clean 400 error instead
        # of allowing bcrypt to raise a ValueError that becomes a 500.
        if len(password_bytes) > 72:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must not exceed 72 characters.",
            )
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password_bytes, salt).decode("utf-8")
    except HTTPException:
        raise  # re-raise our clean 400 as-is
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password hashing failed. Please try again.",
        ) from exc


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Returns True if plain_password matches the stored bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


# ---------------------------------------------------------------------------
# JWT token utilities
# ---------------------------------------------------------------------------

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a signed JWT access token.

    Args:
        data: Payload dict. Should include a 'sub' (subject / email) key.
        expires_delta: Optional custom expiry duration.

    Returns:
        Encoded JWT string.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        if expires_delta
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decodes and validates a JWT access token.

    Returns:
        The decoded payload dict, or None if invalid / expired.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError:
        return None
