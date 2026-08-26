# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Stack
- Backend: FastAPI + SQLAlchemy 2.0 (sync ORM, not async) + PostgreSQL. Entry point [`main.py`](main.py:1).
- Frontend: React 19 + Vite 8, linted with **oxlint** (not ESLint). No test framework is configured.
- `requirements.txt` is **UTF-16 encoded** — do not edit it with standard UTF-8 tools or it will corrupt.

## Commands
- Backend: `uvicorn main:app --reload` (or `python main.py`). Serves on `127.0.0.1:8000`.
- Frontend: `cd frontend && npm run dev` (port 5173, proxies `/api` → `127.0.0.1:8000`), `npm run build`, `npm run lint` (oxlint).
- **No tests exist** in either backend or frontend.

## Architecture
- FastAPI serves the built React SPA from `frontend/dist` at `/`, `/calidad`, `/jarabe`, `/portal`, `/dashboard`. If `dist` is missing, these routes return an HTML hint instead of the app.
- Master/catalog data (marcas, tanques, responsables, etc.) is loaded from `static/data/maestros.json` at request time — **not** from the DB. Editing that JSON is the way to change dropdown options.
- Product quality standards (brix, TA, carbonatación, torque tolerances) live in `frontend/src/data/productStandards.js` and are used only client-side for the dashboard charts.

## Critical gotchas
- **Two parallel quality-control systems exist**: the legacy `registro_calidad` table (endpoint `/api/controles`) and the newer `control_bebida` table (endpoint `/api/control-bebida`). The frontend uses `control-bebida`; `/api/controles` is kept only for backwards compatibility.
- All SQLAlchemy models use `MetaData(schema="laboratorio")` — tables live in the `laboratorio` Postgres schema, not `public`.
- `responsables` fields in jarabe tables are stored as **JSON strings** (`json.dumps(...)`), not as separate rows.
- `linea` is stored as an integer: `"linea1"` → `1`, `"linea2"` → `2` (see [`main.py`](main.py:308)).
- Turno values are normalized to capitalized `Mañana`/`Tarde`/`Noche` on write.
- DB credentials come from `.env` (committed to repo) via `python-dotenv`; defaults are `postgres`/`postgres` on `localhost`.