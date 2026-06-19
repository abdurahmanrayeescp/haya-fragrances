import os
import logging
from pydantic_settings import BaseSettings

logger = logging.getLogger("luxeaura.config")


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    All fields have safe defaults so the app boots locally without a .env file.
    In production (Railway), set the sensitive fields (SECRET_KEY, DATABASE_URL)
    as Railway environment variables – never commit real secrets to source control.
    """

    # ------------------------------------------------------------------
    # Core / Database
    # ------------------------------------------------------------------
    # DATABASE_URL is handled directly in database.py to support the
    # postgres:// → postgresql:// URL rewrite needed for SQLAlchemy 2.x.
    # We keep it here as well so other modules can read it via settings if needed.
    DATABASE_URL: str = ""

    # ------------------------------------------------------------------
    # JWT / Auth
    # ------------------------------------------------------------------
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION_USE_A_LONG_RANDOM_STRING_AT_LEAST_32_CHARS"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hour default

    # ------------------------------------------------------------------
    # Optional integrations (mocked by default)
    # ------------------------------------------------------------------
    SMTP_USERNAME: str = "mock_smtp_user"
    SMTP_PASSWORD: str = "mock_smtp_pass"
    RESEND_API_KEY: str = "re_mock_key"
    RAZORPAY_KEY_ID: str = "rzp_test_mock"
    RAZORPAY_SECRET: str = "rzp_secret_mock"
    CLOUDINARY_API_KEY: str = "cloud_mock_key"
    CLOUDINARY_SECRET: str = "cloud_mock_secret"

    class Config:
        # Load from .env file when present (local development).
        # On Railway, environment variables are injected directly so no file needed.
        env_file = ".env"
        env_file_encoding = "utf-8"
        # Do not raise an error for extra env vars present in the environment
        extra = "ignore"


settings = Settings()

# Warn if the default insecure secret key is in use
if settings.SECRET_KEY == "CHANGE_ME_IN_PRODUCTION_USE_A_LONG_RANDOM_STRING_AT_LEAST_32_CHARS":
    logger.warning(
        "WARNING: Using default SECRET_KEY. "
        "Set a strong SECRET_KEY environment variable before deploying to production!"
    )
