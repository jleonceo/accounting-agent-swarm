# RUN3 — Análisis de fallos (CORREGIDO tras verificar en MySQL)

> Nota global **87,1/100**. Ejes: acción correcta 92,2% · asiento exacto 97,4% · **cuadre 100%** · detección revisión 100% · "frenó bien" 61% · conciliación 100%.
>
> ⚠️ **Corrección importante (regla de oro):** un primer análisis basado en los *motivos del validador* concluyó "faltan crear 4 cuentas". **Falso.** Verificado en `plan_de_cuentas`: las 4 cuentas EXISTEN (`48000002` Gastos anticipados, `52000002` Deudas c/p entidades crédito, `52700002` Intereses c/p, `13000002` Subvenciones capital). **El banco está bien; los fallos son del ENJAMBRE.** El propio validador dio motivos incorrectos → no fiarse del primer agente, verificar contra la fuente.

## Clasificación verificada de los fallos

### Extractor — variabilidad (no es el banco)
- **ACR-41000002 / 03 / 05**: el extractor cortó su propio JSON (raw truncado, confianza 0) en 3 de 8 ACR. Los `.txt` están **perfectos** (819 bytes, legibles, idénticos a los ACR que sí pasaron). → **Variabilidad del modelo extractor**, no defecto del documento. Mitigación: blindar la instrucción de salida del extractor / reintento ante extraction_failed.

### Generador — cuenta equivocada o asiento incompleto (fallo real del enjambre)
- **SIN-15** (reclasificación deuda): usó `52100002` (inexistente) en vez de `52000002` (existe, golden). Mapeo de cuenta erróneo (521 vs 520).
- **SIN-16** (devengo intereses): usó `50500001` ("bonos convertibles", madre) en vez de `52700002` (existe, golden). Cuenta conceptualmente equivocada (505 vs 527).
- **SIN-25** (opción compra leasing): devolvió **asiento vacío**. No supo el devengo `52400002` D 1000 + `47200002` D 210 / `41000009` H 1210.
- **SIN-03** (liquidación IVA): metió **líneas de más** (golden: 477 D / 472 H / 475 H, 3 líneas; generó 4 con 475 duplicada + 572).

### Validador — alucina cuentas + check estricto (fallo real del enjambre)
- **SIN-14**: frenó diciendo "crear 48000002" cuando **48000002 existe**. Alucinación / fuente de cuentas no sincronizada con MySQL.
- **SIN-17**: frenó diciendo "130 sin instancia" cuando **13000002 existe**. Igual.
- **MKT-01 / MKT-02**: CHECK 3 exige `categoria_producto` en toda VENTA; las liquidaciones de marketplace son agregadas y no lo traen. Check demasiado estricto.
- **SIN-13** (apertura): pidió desglose de saldos agregados (430/400) aunque el golden usa subcuentas existentes (43000002/40000002). Exceso de celo / zona gris.

## Lectura corregida

**El banco de pruebas está BIEN** (cuentas existen, documentos legibles). **Los 12 fallos son del enjambre**, concentrados en **operaciones poco frecuentes** (periodificación, reclasificación, devengo, subvención, leasing opción-compra, liquidación IVA, marketplace, apertura). El **núcleo (ventas/compras/cobros/pagos) es sólido**: cuadre 100%, asiento exacto 97,4%.

Reparto por subagente: **generador** 4 (SIN-15/16/25/03), **validador** 4 (SIN-14/17 + MKT-01/02) [+ SIN-13 gris], **extractor** 3 (ACR, variabilidad).

## Plan de preparación de RUN4 (requiere OK de Juan — toca skills)
1. **Generador**: corregir mapeo de cuentas (520 vs 521; 527 vs 505 vs 527); enseñar opción de compra del leasing (SIN-25); depurar liquidación de IVA (SIN-03). → RAG/skill generador.
2. **Validador**: sincronizar su comprobación de cuentas con MySQL (no afirmar "no existe" sin verificar); eximir liquidaciones de marketplace del CHECK 3. → skill validador.
3. **Extractor**: blindar la instrucción de salida / reintento ante extraction_failed (variabilidad ACR).
4. **Golden/banco**: sin cambios (verificado correcto).

> Todos los cambios de skill: VÍA C (confirmación de Juan) + puerta de no-regresión antes de RUN4.

---
*Análisis de fallos RUN3 (corregido) · TechAcces · 12/06/2026*
