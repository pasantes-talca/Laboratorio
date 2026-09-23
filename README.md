# Laboratorio de Calidad Talca

Aplicación interna para registrar y analizar controles de bebida terminada,
jarabes, torque, pausas, agua y saneado. Incluye una API FastAPI/PostgreSQL y
una SPA React/Vite.

## Requisitos

- Python 3.11 o superior
- Node.js 22 o superior
- PostgreSQL 14 o superior

## Instalación local

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
Copy-Item .env.example .env
cd frontend
npm ci
```

Configure las credenciales de PostgreSQL en `.env`. Desde la raíz ejecute
`alembic upgrade head` y `python main.py`. En otra terminal ejecute
`cd frontend` y `npm run dev`. La aplicación queda en el puerto 5173, la API en
el 8000 y su documentación en `/docs`.

## Seguridad

En desarrollo `API_KEY` puede quedar vacía. En producción debe configurarse una
clave larga. Las escrituras deberán enviar `X-API-Key`, `X-User` y `X-Role`.
Los roles admitidos son `operador`, `supervisor` y `administrador`; eliminar
requiere uno de los dos últimos.

El frontend puede recibir la clave mediante `VITE_API_KEY`. Para un despliegue
público se recomienda que un proxy autenticado inyecte esa credencial, evitando
publicarla en el bundle. Configure `ALLOWED_ORIGINS` con los orígenes reales.

## Datos y migraciones

El esquema usado es `laboratorio`. Antes de migrar una instalación existente,
realice un respaldo. La migración inicial adopta tablas existentes y crea sólo
las ausentes con `alembic upgrade head`.

## Verificación

```powershell
pytest
cd frontend
npm test
npm run lint
npm run build
```

## Módulos

- Control de calidad: bebida, jarabe, torque y pausas.
- Sala de jarabe: simple, terminado, saneo de tanques y dosificación.
- Agua: físico-químico, cloro, ósmosis inversa y filtro de arena.
- Área de saneado: procesos COP/CIP.
- Dashboard: filtros, tendencias y estándares BPM.

## Operación

- Realice respaldos diarios de PostgreSQL y pruebe su restauración.
- Mantenga `.env` fuera del repositorio.
- Revise los logs `laboratorio.audit` para escrituras y eliminaciones.
- Los catálogos pueden configurarse en `backend/static/data/maestros.json`; si
  no existe, se usan los valores internos.
