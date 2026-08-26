# Project Debug Rules (Non-Obvious Only)

- **Backend runs on `127.0.0.1:8000`**; frontend dev server on `5173` proxies `/api` to it. If the frontend shows "Frontend React no compilado", the `frontend/dist` build is missing — run `cd frontend && npm run build`.
- **DB connection is not localhost by default** — `.env` points to a remote host (`DB_HOST=10.242.4.13`). If queries fail, verify network access to that host, not just Postgres running locally.
- **Tables live in the `laboratorio` schema**, not `public`. A "relation does not exist" error usually means the schema qualifier is missing or the table was created in the wrong schema.
- **`init_db()` runs `create_all` on startup** (lifespan hook in [`main.py`](main.py:29)). It only creates missing tables; it does **not** migrate or alter existing ones. Schema changes require manual SQL.
- **Two quality tables can look identical**: `registro_calidad` (legacy, `/api/controles`) vs `control_bebida` (current, `/api/control-bebida`). If data "disappears", check which table/endpoint you're querying — the frontend only reads `control-bebida`.
- **`responsables` is a JSON string** in jarabe tables. If it renders as `["..."]` raw text in the UI, the frontend isn't parsing it; if it's `null`, the write didn't use `json.dumps`.
- **`linea` is an integer** (`1`/`2`). If a filter by `"linea1"` string returns nothing, the comparison type is wrong.
- **Turno is normalized to capitalized `Mañana`/`Tarde`/`Noche`** on write. If a query filters on lowercase or accented variants, it may miss rows.
- **`requirements.txt` is UTF-16** — if pip install fails with encoding errors, the file was corrupted by a UTF-8 editor.
- **No test framework exists** — there is no test runner to invoke; debug via manual API calls or the running dev server.