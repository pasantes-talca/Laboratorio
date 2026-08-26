# Project Architecture Rules (Non-Obvious Only)

- **Two parallel quality-control systems coexist**: legacy `registro_calidad` (`/api/controles`) and current `control_bebida` (`/api/control-bebida`). The frontend only uses `control-bebida`; the legacy path is frozen for backwards compatibility. New work should target `control_bebida` and consider deprecating the legacy path.
- **All tables are bound to the `laboratorio` Postgres schema** via a single shared `MetaData(schema="laboratorio")` in [`database.py`](database.py:20). Any new model must use this same metadata — never `public`.
- **Schema is managed by `create_all` on startup, not migrations.** There is no Alembic. Adding/altering columns requires manual SQL; `create_all` will not modify existing tables.
- **Master/catalog data is decoupled from the DB** — it lives in `static/data/maestros.json` and is read per-request. This is a deliberate design: dropdown options are changed by editing JSON, not by DB rows.
- **Quality standards are frontend-only** (`frontend/src/data/productStandards.js`). The backend has no tolerance data; the dashboard computes compliance client-side. Any server-side validation of brix/TA/torque would need a new source of truth.
- **`responsables` is denormalized as a JSON string** in jarabe tables rather than a normalized relation — a deliberate tradeoff for simplicity. Preserve this pattern for consistency.
- **`linea` is stored as an integer** (`1`/`2`) while the frontend uses string keys `"linea1"`/`"linea2"`. The mapping happens in the backend write path.
- **The frontend is a state-driven SPA, not a router-based app** — page switching is via React state in `App.jsx`. Adding a new page means adding a state branch, not a route.
- **`script.py`'s HTML parser is tightly coupled to a specific traceability report format** (≥4 tables, fixed order). It is not a general-purpose parser; changes to the report format will break it.