# RUN4 — cambios aplicados y tail (12/06/2026)

**Nota: 93,3/100** (RUN3 = 87,1). Frenó-bien **61→80,5%**, acción 92→98%, asiento exacto 96,4%, FN **10→3**, **0 FP**, cuadre 100%, conciliación 100%. Sin regresiones de fondo.
Informe del corrector: `2026-06-12-RUN4_sonnet46_fabrica_informe.md` · Salida: `2026-06-12-RUN4_sonnet46_fabrica_salida.json`.

## Cambios aplicados (con OK de Juan — "arréglalo todo")

### Skills (producción)
- **generador-contable v2.8:** sección FINANCIERO préstamo bancario (reclasificación LP→CP `170→520` NUNCA 521; devengo intereses acumulados `662→527` NUNCA 505/banco) [SIN-15/16] · plantilla E opción de compra robusta (campos `valor_residual`/`iva`/`total` o `importe_opcion`, NUNCA asiento vacío) [SIN-25] · PASO -1 reforzado: descuadre del extractor gana a ILEGIBLE-por-confianza-0.50 [NOM-06], referencia placeholder = ausente [FAC-16], fecha imposible → FECHA_INVALIDA [FAC-19], base/desglose ausente → FALTA_DATO [FAC-25], NIF-IVA intracomunitario ausente → FALTA_DATO [FAC-33] · PASO 0: motivo de PROPUESTA_ALTA limpio sin avisos secundarios [NEW-05], pre-check de duplicado por referencia antes de proponer alta [FAC-24].
- **validador-contable v2.2:** CHECK 2 prohíbe afirmar que una cuenta "no existe" sin ejecutar la query a `plan_de_cuentas` (mata la alucinación de SIN-14/17 sobre 48000002/13000002) · CHECK 3 exime `categoria_producto` si `tipo_documento_origen=LIQUIDACION_MARKETPLACE` (atado al campo del extractor, no a canal_venta) [MKT-01/02].
- **extractor-contable v1.11:** blindaje anti-truncado (emite `extraction_failed` limpio en vez de JSON roto) [ACR/F8] · opción de compra del leasing: principal/intereses null + `tiene_opcion=true` NO es FALTA_DATO [SIN-25].

### Instrumento (medida — defectos verificados, NO gaming)
- **corrector.py:** patrones `FORMATO_INVALIDO` (`cif z-`, `z-00000000`, `no es prefijo`) [FAC-32] + `IVA_INCORRECTO` [FAC-08]. Verificado: 8/8 tests del clasificador.
- **golden FAC-08:** `COLISION_IDENTIDAD` → `IVA_INCORRECTO` (el flag contradecía sus propios datos: no había segunda identidad; el caso es IVA 10% mal aplicado).
- **runner (SIN-16):** defecto de banco — el input instruía `Asiento: 662 D / 505 H` pero golden+PGC = **527** (intereses CP de deudas con entidades de crédito; 505 es de bonos). Corregido a 527.

## Tail NO cerrado (6 casos) — IMPORTANTE para próximas simulaciones
- **SIN-03** (liquidación IVA): emite líneas de más (475 como debe+haber + 572 banco). **NO se aplicó** el fix de REGLA DOBLE ASIENTO para liquidación IVA (era el F4 del primer guion, se omitió). **Es el único de arreglo limpio pendiente.**
- **SIN-25** (opción de compra): sigue devolviendo asiento vacío `[]` pese a la plantilla E. Raíz esquiva → relanzar aislado con logging del razonamiento del generador antes de tocar nada más.
- **SIN-14** (periodificación): el validador sigue frenando un asiento válido pese al endurecimiento del CHECK 2. Variabilidad del modelo, no falta de regla.
- **SIN-13** (apertura): exceso de celo, freno no codificado en ninguna regla.
- **ACR-41000004 / ACR-41000006**: variabilidad del extractor (truncado / asiento vacío); el blindaje no la eliminó del todo.

## NO tocado a propósito
Golden de los casos "ILEGIBLE + otro defecto" (Patrón A: FAC-09 y similares). Cambiarlo para que pasen sería **doblar la regla de medir** (`simulacion-adapta-al-sistema`). Decisión caso a caso de Juan si se retoma.

## Recomendación
Cerrar el enjambre contable en **93,3**: el tail son edge cases + ruido de modelo; perseguirlo uno a uno es el bucle de rendimientos decrecientes. Si se quiere subir un poco más sin RUN entero: arreglar SIN-03.
