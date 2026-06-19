"""
security.py – Password hashing and JWT token utilities.

Dependencies used:
  - passlib[bcrypt]  : industry-standard password hashing (bcrypt scheme)
  - python-jose      : JWT encode / decode with full algorithm support
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

# ---------------------------------------------------------------------------
# Password hashing context
# ---------------------------------------------------------------------------
# Using bcrypt as the hashing algorithm.
# deprecated="auto" automatically upgrades old hashes on next login.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Returns True if plain_password matches the stored hashed_password."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Returns a bcrypt hash of the given plaintext password."""
    return pwd_context.hash(password)


# ---------------------------------------------------------------------------
# JWT token utilities
# ---------------------------------------------------------------------------

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a signed JWT access token.

    Args:
        data: Payload dictionary. Should include a 'sub' (subject) key.
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
        The decoded payload dict, or None if the token is invalid / expired.
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
