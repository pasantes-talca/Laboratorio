# Project Documentation Rules (Non-Obvious Only)

- **`main.py` is the single backend entry point** — it contains all FastAPI routes, Pydantic schemas, and the SPA-serving logic. There is no separate `routes/` or `schemas/` package.
- **`database.py` holds all SQLAlchemy models** in one file, all bound to the `laboratorio` schema. There is no migrations directory; schema is created via `create_all` on startup.
- **`script.py` is a standalone HTML-table parser** (`extraer_datos_reporte`) used by the `/api/parse-jarabe-excel` endpoint. It is not a general Excel library — it expects a specific traceability report HTML structure with ≥4 tables.
- **`static/data/maestros.json` is the source of truth for dropdowns** (marcas, tanques, responsables, sabores), not the database. It is read fresh on every request.
- **`frontend/src/data/productStandards.js` is the only place quality tolerances live** (brix, TA, carbonatación, torque). It is client-side only and drives the dashboard charts; the backend has no copy.
- **The frontend is a single-page app** with page switching via React state in `App.jsx` (`calidad`, `jarabe`, `dashboard`), not a router. `PortalPage.jsx` exists but is not wired into `App.jsx`.
- **`frontend/src/services/api.js` centralizes all API calls** using a relative `/api` base. All backend endpoints are consumed through this module.
- **`ProductionContext.jsx` persists active production state to `localStorage`** under key `calidad_active_production` (linea, turno, sabor, etc.) — this drives the sidebar/modal defaults.
- **`requirements.txt` is UTF-16 encoded** — reading it with a UTF-8 tool shows garbled/spaced text; that is expected, not corruption.