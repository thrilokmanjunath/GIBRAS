#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$DIR"

echo "=========================================================="
echo " Starting GIBRAS Platform (Native Local Execution)"
echo " Scope: Kolar & Chikkaballapur Districts, Karnataka"
echo "=========================================================="

# Check Python environment
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r apps/api/requirements.txt
else
    source .venv/bin/activate
fi

# Ensure data and models exist
if [ ! -f "data/curated/historical_borewell_observations.parquet" ]; then
    echo "Curating authoritative hydrogeological data..."
    python3 geospatial/ingestion/curate_authoritative_data.py
fi

if [ ! -f "ml/saved_models/failure_model.joblib" ]; then
    echo "Training and validating ML models..."
    PYTHONPATH=. python3 scripts/train_and_validate_models.py
fi

# Start FastAPI Backend in background
echo "Launching FastAPI Backend on http://127.0.0.1:8050..."
PORT=8050 PYTHONPATH=. .venv/bin/uvicorn apps.api.main:app --host 127.0.0.1 --port 8050 > .backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > .backend.pid
echo "Backend running (PID: $BACKEND_PID)"

# Wait for backend to be healthy
echo "Waiting for Backend health check..."
for i in {1..30}; do
    if curl -s http://127.0.0.1:8050/health | grep -q "HEALTHY"; then
        echo "Backend is healthy!"
        break
    fi
    sleep 1
done

# Start Next.js Frontend
echo "Launching Next.js Web Portal on http://localhost:3050..."
cd apps/web
npm run dev > ../../.frontend.log 2>&1 &
FRONTEND_PID=$!
cd "$DIR"
echo $FRONTEND_PID > .frontend.pid
echo "Frontend running (PID: $FRONTEND_PID)"

echo ""
echo "=========================================================="
echo " GIBRAS is running successfully!"
echo " Web Portal:   http://localhost:3050"
echo " API Docs:     http://localhost:8050/docs"
echo " Health Check: http://localhost:8050/health"
echo " To stop:      ./scripts/stop_local.sh"
echo "=========================================================="
