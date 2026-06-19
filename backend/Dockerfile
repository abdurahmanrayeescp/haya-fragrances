# ============================================================
# LuxeAura Backend – Production Dockerfile
# ============================================================
# Railway sets:  Root Directory = /backend
# Build Command: pip install -r requirements.txt
# Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
#
# The CMD below is a fallback for local `docker run` usage only.
# Railway's "Start Command" field always overrides CMD.
# ============================================================

FROM python:3.11-slim

# Metadata
LABEL maintainer="LuxeAura Engineering"
LABEL description="LuxeAura Fragrance Platform – FastAPI backend"

# Prevent .pyc files and enable unbuffered stdout/stderr (important for Railway logs)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# PORT defaults to 8000 for local Docker runs.
# Railway will override this with the dynamically assigned port at runtime.
ENV PORT=8000

WORKDIR /app

# Install system dependencies required by psycopg2-binary and passlib[bcrypt]
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies first (layer-caching optimisation)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Expose the default port for local docker run documentation purposes only.
# Railway does NOT use EXPOSE to route traffic – it uses $PORT.
EXPOSE ${PORT}

# ---------------------------------------------------------------
# IMPORTANT: Use shell form (not exec form) so $PORT is expanded.
# Exec form ["uvicorn", ...] does NOT expand shell variables.
# ---------------------------------------------------------------
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
