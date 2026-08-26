# Problemas documentados

## Backend
1. **Turno normalización inconsistente**: `control-bebida` guarda el turno tal cual (`"mañana"` queda en minúscula y sin acento) mientras `control-torque` y `control-pausas` lo capitalizan (`"Mañana"`, `"Tarde"`, `"Noche"`).
2. **Mapeo de `linea` diverge**: en `control-bebida` cualquier valor distinto de "linea1" se convierte a `2` (incluye `None`/vacío), en `control-torque` y `control-pausas` los valores desconocidos se convierten a `1`.
3. **Hora inválida**: en `control-bebida` y `control-jarabe`, `hora="99:99"` se interpreta como la hora actual; en `jarabe-simple` se guarda `NULL`.
4. **Fecha inválida**: en los POST de `jarabe-simple`, `jarabe-terminado`, `saneo-tanques`, `parte-jarabe` los valores de `fecha` que no son ISO se convierten en la fecha de hoy sin error de validación.
5. **`turno` en `control-torque`**: sólo la palabra clave "noche" se sobrescribe por el campo `noche` y se capitaliza; en otros casos se mantiene tal cual.

## Frontend
1. **Navbar.jsx**: se usaba `updateProduction` sin destructurar, causando un `ReferenceError` al cambiar el turno.

> *Hemos corregido la destructuración y agregado pruebas de regresión.*

---

**Nota**: Estos hallazgos corresponden al comportamiento real en la versión actual y están documentados para corrección futura. No se modificó el código fuente originalmente.
