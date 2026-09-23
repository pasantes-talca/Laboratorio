# Migraciones

La revisión `0001_baseline` adopta bases existentes sin eliminar datos y crea las
tablas que falten. Después de respaldar PostgreSQL, ejecute:

```powershell
alembic upgrade head
```

Para cambios futuros genere una revisión con `alembic revision --autogenerate` y
revise manualmente el SQL antes de aplicarlo.
