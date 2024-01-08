Interest Link 2
===============

A tool to help people figure out what interests they have in common, without revealing what they don't have in common


Quickstart:
===========
Open in visual studio code and accept the prompt to use a devcontainer, or use github's online IDE:

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/shish/link2)

Once the IDE is open, `cd frontend && npm run all` to start backend and frontend at once.

A built-in browser in the IDE should open automatically, with hot-reloading configured for both backend and frontend code.


Slowstart
=========
Build frontend:
---------------
```
cd frontend
npm install
npm run dev    # for debugging
npm run build  # for prod
```

Backend:
--------
```
python3 -m venv venv
./venv/bin/pip install -r backend/requirements.txt
./venv/bin/python3 -m backend.models    # create a database with example data
./venv/bin/flask --app backend.app run --port 8000 --debug            # for debugging
./venv/bin/gunicorn -w 4 'backend.app:create_app()' -b 0.0.0.0:8000   # for prod
```

Migrating from v1:
------------------
```
cp /websites/link1/data/link1.sqlite ./data/link1.sqlite
./migrate.sh
```
