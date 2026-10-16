# Migraciones

La revisión `0001_baseline` adopta bases existentes sin eliminar datos y crea las
tablas que falten. Después de respaldar PostgreSQL, ejecute:

```powershell
python -m alembic upgrade head
```

Ejecute desde la raíz del proyecto, con las dependencias instaladas y `.env` configurado.
La revisión inicial crea tablas faltantes; no corrige columnas incompatibles de tablas
preexistentes. Revise el esquema de una base antigua antes de adoptarla.
Fuera de desarrollo el arranque de la aplicación no crea ni modifica tablas.

La revisión `0002_acondicionamiento_rinser` agrega el campo opcional de análisis
de cloro, expresado en ppm. Aplique `python -m alembic upgrade head` también sobre las bases locales
existentes: la creación automática de tablas no agrega columnas a tablas anteriores.
Los resultados de cloro existentes se conservan.

Para cambios futuros genere una revisión con `python -m alembic revision --autogenerate` y
revise manualmente el SQL antes de aplicarlo.
