# Project Coding Rules (Non-Obvious Only)

- **Never edit `requirements.txt` with UTF-8 tools** — it is UTF-16 encoded. Use a UTF-16-aware editor or PowerShell `Set-Content -Encoding Unicode`.
- **Do not add new tables to the `public` schema** — all models must use `MetaData(schema="laboratorio")` (see [`database.py`](database.py:20)). `init_db()` runs `create_all` on app startup via the lifespan hook.
- **New quality-control endpoints should target `control_bebida`**, not the legacy `registro_calidad`/`/api/controles` path. The frontend only consumes `control-bebida`.
- **`responsables` is a JSON string column** (`Text`), not a relation. Serialize with `json.dumps(data.responsables, ensure_ascii=False)` on write; the frontend parses it back.
- **`linea` is an integer column**: map `"linea1"` → `1`, `"linea2"` → `2` before persisting (see [`main.py`](main.py:308)).
- **Normalize turno to capitalized `Mañana`/`Tarde`/`Noche`** on write; the frontend sends lowercase/other forms.
- **Master data (marcas, tanques, responsables, sabores) is NOT in the DB** — it comes from `static/data/maestros.json`. To add a dropdown option, edit that JSON, not the database.
- **Product standards for dashboard charts** live only in `frontend/src/data/productStandards.js` (client-side). There is no backend source of truth for brix/TA/torque tolerances.
- **Frontend uses oxlint, not ESLint** — run `npm run lint` (oxlint). Config in `frontend/.oxlintrc.json`.
- **No test framework is configured** in either backend or frontend. Do not assume `pytest`/`vitest` exist.
- **`script.py`'s `extraer_datos_reporte`** parses Excel/HTML traceability reports (HTML tables) and is imported by `main.py` for `/api/parse-jarabe-excel`. It expects ≥4 `<table>` elements in a specific order.
- **Frontend API calls go through `frontend/src/services/api.js`** using a relative `/api` base (proxied by Vite in dev). Do not hardcode absolute backend URLs.