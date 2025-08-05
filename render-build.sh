#!/usr/bin/env bash
# exit on error
set -o errexit

# Build do Frontend
cd frontend
npm install
npm run build
cd ..

# Build do Backend
cd backend
pip install -r requirements.txt
python manage.py collectstatic --noinput