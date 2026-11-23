#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$DIR"

echo "Stopping GIBRAS local services..."

if [ -f ".backend.pid" ]; then
    PID=$(cat .backend.pid)
    kill -9 "$PID" 2>/dev/null || true
    rm -f .backend.pid
    echo "Backend (PID $PID) stopped."
fi

if [ -f ".frontend.pid" ]; then
    PID=$(cat .frontend.pid)
    kill -9 "$PID" 2>/dev/null || true
    rm -f .frontend.pid
    echo "Frontend (PID $PID) stopped."
fi

# Fallback kill any processes on ports 8050 and 3050
lsof -ti:8050 | xargs kill -9 2>/dev/null || true
lsof -ti:3050 | xargs kill -9 2>/dev/null || true

echo "GIBRAS local services stopped cleanly."
