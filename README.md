# LUXEAURA – Premium Perfume E-Commerce Platform

LuxeAura is a full-stack, Awwwards-style luxury perfume e-commerce platform inspired by Tom Ford, Chanel, Dior, and Le Labo. It features dark sleek aesthetics (`#0B0B0B`), gold accents (`#D4AF37`), glassmorphism cards, responsive grids, Framer Motion animations, interactive SVG analytics, and an AI fragrance profiling recommendation quiz.

---

## Technical Stack

* **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Zustand state stores, Axios client.
* **Backend**: FastAPI (Python), SQLAlchemy ORM (compatible with SQLite and PostgreSQL), Pytest, JWT Authentication.
* **Orchestration**: Docker, Docker Compose.

---

## File Structure

```text
LuxeAura/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── models/           # SQLAlchemy Database models
│   │   ├── routers/          # API route routers
│   │   ├── schemas/          # Pydantic schemas validation
│   │   ├── services/         # Recommendation AI, mock payment/email logs
│   │   ├── utils/            # Pagination & search filtering helpers
│   │   ├── main.py           # Entrypoint and database seeder
│   │   └── security.py       # bcrypt hashing and JWT tokens
│   └── tests/                # Pytest unit tests
│
├── frontend/                 # Next.js Application
│   ├── src/
│   │   ├── app/              # Catalog, detail, checkout, admin, quiz pages
│   │   ├── components/       # Hero, charts, navbar, drawers, footer
│   │   ├── store/            # Zustand auth, cart, wishlist, theme state
│   │   ├── lib/              # Axios API client
│   │   └── tests/            # Vitest unit test files
│   └── vitest.config.ts      # Vitest config
│
└── docker-compose.yml        # Multi-container orchestrator
```

---

## Setup & Running Guide

### 1. Running with Docker Compose (Recommended)

To spin up all services (PostgreSQL Database, FastAPI Backend, Next.js Frontend) in one command:

```bash
docker-compose up --build
```

* **Frontend App**: `http://localhost:3000`
* **Backend API Docs**: `http://localhost:8000/docs`

---

### 2. Manual Development Running

#### Backend Setup
1. Move to backend directory:
   ```bash
   cd backend
   ```
2. Set up virtual environment and install requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the development server (auto-creates and seeds SQLite database):
   ```bash
   uvicorn app.main:app --reload
   ```

#### Frontend Setup
1. Move to frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```
   * Open `http://localhost:3000` to view the luxury interface.

---

## Default Seed Credentials

Upon startup, the database automatically seeds the following credentials:

* **Customer User Account**:
  * Email: `sonia@luxeaura.com`
  * Password: `Customer123!`
* **Administrative Account**:
  * Email: `admin@luxeaura.com`
  * Password: `Admin123!`

---

## Testing

### Run Backend Tests (Pytest)
```bash
cd backend
pytest
```

### Run Frontend Tests (Vitest)
```bash
cd frontend
npm run test
```
