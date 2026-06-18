import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./luxeaura.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "7b8e9f2a4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    # Mock service credentials
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "mock_smtp_user")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "mock_smtp_pass")
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "re_mock_key")
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_mock")
    RAZORPAY_SECRET: str = os.getenv("RAZORPAY_SECRET", "rzp_secret_mock")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "cloud_mock_key")
    CLOUDINARY_SECRET: str = os.getenv("CLOUDINARY_SECRET", "cloud_mock_secret")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
