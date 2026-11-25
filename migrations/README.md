# Migraciones

La revisión `0001_baseline` adopta bases existentes sin eliminar datos y crea las tablas que falten. Después de respaldar PostgreSQL, ejecutar desde la raíz del proyecto, con las dependencias instaladas y `.env` configurado:

```powershell
python -m alembic upgrade head
```

La revisión inicial crea tablas faltantes; no corrige columnas incompatibles de tablas preexistentes. Revisar el esquema de una base antigua antes de adoptarla. Fuera de desarrollo el arranque de la aplicación no crea ni modifica tablas.

La revisión `0002_acondicionamiento_rinser` agrega la columna opcional utilizada actualmente para la **presión del rinser**, conservando su nombre interno por compatibilidad. Aplicar las migraciones también sobre las bases locales existentes: la creación automática de tablas no agrega columnas a tablas anteriores. Los resultados de cloro existentes se conservan.

Para cambios futuros generar una revisión con `python -m alembic revision --autogenerate` y revisar manualmente el SQL antes de aplicarlo.

## Administración de registros

La revisión `0004_numero_saneo` agrega la columna opcional `numero_saneo` cuando falta en bases antiguas. Permite consultar y editar saneos desde administración sin cambiar los registros existentes.

La página `/administracion` reúne los 13 formularios con filtros, paginación, edición e historial. Esta sección exige una sesión con rol `administrador`; el permiso se verifica en el servidor. La consulta y carga mediante los formularios habituales, incluida la selección de producción, son de acceso libre y no requieren iniciar sesión. La edición y eliminación de registros mantienen sus permisos.

Para revisar el diseño sin base de datos ni usuarios, abrir `/administracion?demo=1`. Esta vista contiene exclusivamente datos ficticios, funciona en memoria y no consulta ni modifica registros reales. Con el frontend iniciado: `http://localhost:5173/administracion?demo=1`.

## Activación con datos reales

En una instalación local sin administrador se puede crear la cuenta inicial con `python -m backend.app.core.bootstrap_admin`. Conserva la conexión y las cuentas existentes, genera una contraseña aleatoria y guarda el acceso en `.acceso-administrador.txt` (excluido de Git). La contraseña queda guardada como hash en `.env`. Este comando no reemplaza una cuenta administradora existente. Reiniciar el servidor después de ejecutarlo.

1. Configurar en `.env` la conexión PostgreSQL (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) y comprobar el acceso. No se incluye ninguna contraseña de base de datos.
2. Generar un hash de contraseña con `python -m backend.app.core.auth` (solicita la contraseña de forma oculta).
3. Configurar `SESSION_SECRET` con un secreto aleatorio de al menos 32 caracteres y `AUTH_USERS` como un objeto JSON. Cada cuenta necesita `password_hash` y `role`; los roles disponibles son `operador`, `supervisor` y `administrador`. Ejemplo de estructura: `{"administrador":{"password_hash":"HASH_GENERADO","role":"administrador"}}`. Para identificar quién carga cada formulario, asignar cuentas individuales.
4. Ejecutar `python -m alembic upgrade head` y reiniciar el servidor. En desarrollo, `init_db` también crea las tablas nuevas; en producción se requiere la migración explícita.
5. Compilar el frontend con `npm.cmd ci` y `npm.cmd run build` desde `frontend`. Ingresar con la cuenta administradora y abrir **Administración** en el menú.

La migración agrega `autor_registro` y `cambio_registro`; mantiene las tablas y datos existentes. Las cargas con sesión registran el usuario autenticado en la misma transacción. Las cargas públicas conservan el responsable indicado en el formulario y no se les atribuye un usuario autenticado. Los registros antiguos se muestran sin autor conocido; el campo responsable no se usa para inventar esa identidad.

Cada corrección exige un motivo y conserva autor, fecha y valores anteriores/nuevos. Se rechazan cambios sobre versiones desactualizadas y se validan los datos con los esquemas de los formularios. La identidad del producto asociado a un control de calidad se conserva; las mediciones y otros campos editables se corrigen desde el panel. Las ediciones del lote de tapa también actualizan la referencia asociada a producción.

El catálogo explícito en `backend/app/services/admin_catalog.py` determina campos y validación para cada formulario; la tabla y el editor se reutilizan. El catálogo de ejemplo se puede regenerar con `python -m backend.app.services.admin_catalog` y guardar su salida en `frontend/src/modulos/administracion/previewCatalog.js`. No contiene registros de la base de datos.
