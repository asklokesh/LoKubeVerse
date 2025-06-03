#!/bin/bash
set -e

echo "Starting K8s-Dash Backend..."

# Wait for database to be ready
echo "Waiting for database..."
while ! pg_isready -h db -p 5432 -U postgres; do
    sleep 1
done
echo "Database is ready!"

# Initialize database tables
echo "Initializing database..."
python init_db.py

# Start the application
echo "Starting FastAPI application..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload 