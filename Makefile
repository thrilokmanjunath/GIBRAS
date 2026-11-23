.PHONY: all setup test lint run-api run-web docker-up docker-down clean

SHELL := /bin/bash
PYTHON := .venv/bin/python
PIP := .venv/bin/pip
UVICORN := .venv/bin/uvicorn
PYTEST := .venv/bin/pytest

all: test

setup:
	python3 -m venv .venv
	$(PIP) install -r apps/api/requirements.txt
	cd apps/web && npm install

data:
	$(PYTHON) geospatial/ingestion/curate_authoritative_data.py

train:
	PYTHONPATH=. $(PYTHON) scripts/train_and_validate_models.py

test:
	PYTHONPATH=. $(PYTEST) tests/ -v

lint:
	source .venv/bin/activate && bandit -r apps/api ml geospatial -ll || true

run-api:
	PYTHONPATH=. $(UVICORN) apps.api.main:app --host 0.0.0.0 --port 8000 --reload

run-web:
	cd apps/web && npm run dev

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down

clean:
	rm -rf .pytest_cache .ruff_cache htmlcov .coverage
	find . -type d -name "__pycache__" -exec rm -rf {} +
