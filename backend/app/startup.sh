#!/bin/bash

# Run mock_data script to populate database
echo "Initializing mock data..."
python -m app.mock_data

# Start uvicorn server with the main application
echo "Starting uvicorn server..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload 