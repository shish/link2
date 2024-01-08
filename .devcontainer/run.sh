#!/bin/sh
cd frontend
npm run dev &
cd ..
/tmp/venv/bin/flask --app backend.app run --port 8000 --debug
