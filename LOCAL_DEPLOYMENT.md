# GIBRAS Local Deployment & Operations Runbook

**System:** Groundwater Intelligence & Borewell Risk Assessment System (GIBRAS)  
**Standard:** Government-Grade Local Deployment  
**Scope:** Kolar & Chikkaballapur Districts, Karnataka, India  

---

## 1. Prerequisites & Host Specifications

- **Operating System:** macOS (Apple Silicon M1/M2/M3/M4 or Intel), Linux (Ubuntu 22.04+), or Windows (WSL2).
- **RAM:** Minimum 8 GB (16 GB recommended).
- **Disk:** Minimum 5 GB free disk space.
- **Runtimes:**
  - Python 3.11+ (Python 3.12 recommended)
  - Node.js 18+ & npm 9+
  - Docker 24+ & Docker Compose (optional for native mode)

---

## 2. Option A: Docker Compose Deployment (Recommended for Production Parity)

```bash
# 1. Clone repository
git clone https://github.com/organization/gibras.git
cd gibras

# 2. Configure environment
cp .env.example .env

# 3. Build and launch services
docker compose up -d --build

# 4. Verify running health checks
docker compose ps
curl -s http://localhost:8000/health | jq
```

- **Frontend Application:** `http://localhost:3000`
- **Backend Swagger UI:** `http://localhost:8000/docs`
- **PostGIS Database:** `localhost:5432` (`gibras_db`)

### Shutdown & Reset:
```bash
# Stop containers
docker compose down

# Stop and purge persistent data
docker compose down -v
```

---

## 3. Option B: Native Host Execution (Recommended for Fast Local Development)

### 3.1 Backend Setup
```bash
# 1. Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
pip install -r apps/api/requirements.txt

# 3. Curate authoritative data & train ML models (if not pre-built)
python3 geospatial/ingestion/curate_authoritative_data.py
PYTHONPATH=. python3 scripts/train_and_validate_models.py

# 4. Start FastAPI server
PYTHONPATH=. uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3.2 Frontend Setup
```bash
# 1. Enter web directory
cd apps/web

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev -p 3000
```

---

## 4. Operational Health & Verification Commands

```bash
# Verify API Health & Quality Gates
curl -s http://localhost:8000/health | jq

# Verify Taluk Administrative Boundaries
curl -s http://localhost:8000/api/v1/layers/taluks | jq '.features | length'

# Run Complete Automated Test Suite
source .venv/bin/activate
pytest tests/ -v
```
