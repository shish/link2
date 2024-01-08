Build frontend:
```
cd frontend
npm install
npm run dev    # for debugging
npm run build  # for prod
```

Backend:
```
python3 -m venv venv
./venv/bin/pip install -r backend/requirements.txt
./venv/bin/flask --app backend.app run --port 8000 --debug            # for debugging
./venv/bin/gunicorn -w 4 'backend.app:create_app()' -b 0.0.0.0:8000   # for prod
```

Migrating from v1:
```
cp /websites/link1/data/link1.sqlite ./data/link1.sqlite
./migrate.sh
```
