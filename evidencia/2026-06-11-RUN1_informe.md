# Informe de evaluación del enjambre — TechAcces

Golden set vfabrica-completo-1.1 · 121 asientos + 10 extractos

## Nota global
**88.6 / 100**  *(sin penalización: 89.4)*

> ⚠️ **1 falso(s) positivo(s)**: contabilizó documentos que debían marcarse a revisión. Es el fallo más grave (mete asientos erróneos en MySQL). IDs: FAC-10

> 11 falso(s) negativo(s) (marcó a revisión asientos válidos): FAC-22, FAC-23, NOM-03, NOM-04, NOM-05, SIN-11, SIN-13, NEW-06, FAC-29, NOM-07, OCR-03

## Métricas por eje
| Eje | Resultado |
|---|---|
| Acción correcta (contabilizar vs revisar) | 109/121 = 90.1% |
| Asiento exacto (cuentas + importes) | 67/69 = 97.1% |
| Cuadre de los asientos propuestos | 69/69 = 100.0% |
| Detección de revisión (¿frenó?) | 40/41 = 97.6% |
| **Frenó BIEN (acción + motivo correcto) — puntúa** | 30/41 = 73.2% |
| Conciliación 2023 (casación num_asiento vs MySQL) | 79/79 = 100.0% |

## Fallos a revisar
- **NOM-46500006** (NOM-46500006.txt) — esperado *contabilizar*, obtenido *contabilizar*. esperado [('465', 0.0, 1469.7), ('47510002', 0.0, 216.0), ('47600002', 0.0, 652.5), ('64000002', 1800.0, 0.0), ('64200002', 538.2, 0.0)] | obtenido [('465', 1469.7, 1469.7), ('47510002', 0.0, 216.0), ('47600002', 0.0, 652.5), ('57200002', 0.0, 1469.7), ('64000002', 1800.0, 0.0), ('64200002', 538.2, 0.0)]
- **FAC-10** (10_gasolinera.pdf) — esperado *revisar*, obtenido *contabilizar*. FALSO POSITIVO: contabilizó un documento que debía marcarse a revisión  · reto: ticket pobre
- **FAC-22** (22_formato_ambiguo.pdf) — esperado *contabilizar*, obtenido *revisar*. falso negativo: marcó a revisión un asiento válido  · reto: leer 1,250.00 como 1.250,00
- **FAC-23** (23_abono_negativo.pdf) — esperado *contabilizar*, obtenido *revisar*. falso negativo: marcó a revisión un asiento válido  · reto: abono negativo = devolución (708), no venta
- **NOM-03** (nomina_03_temporal.pdf) — esperado *contabilizar*, obtenido *revisar*. falso negativo: marcó a revisión un asiento válido  · reto: cotización temporal, IRPF 2%
- **NOM-04** (nomina_04_alta_direccion_base_topada.pdf) — esperado *contabilizar*, obtenido *revisar*. falso negativo: marcó a revisión un asiento válido  · reto: SS sobre base topada (4.909,50), NO sobre bruto (6.000)
- **NOM-05** (nomina_05_anticipo_embargo.pdf) — esperado *contabilizar*, obtenido *revisar*. falso negativo: marcó a revisión un asiento válido  · reto: anticipo y embargo NO van a IRPF/SS
- **SIN-03** (liquidacion_iva_2T) — esperado *contabilizar*, obtenido *contabilizar*. esperado [('47200002', 0.0, 3210.0), ('47500002', 0.0, 1650.0), ('47700002', 4860.0, 0.0)] | obtenido [('47200002', 0.0, 3210.0), ('47500002', 1650.0, 1650.0), ('47700002', 4860.0, 0.0), ('57200002', 0.0, 1650.0)]
- **SIN-11** (anticipo_proveedor) — esperado *contabilizar*, obtenido *revisar*. falso negativo: marcó a revisión un asiento válido
- **SIN-13** (apertura_ejercicio) — esperado *contabilizar*, obtenido *revisar*. falso negativo: marcó a revisión un asiento válido
- **NEW-06** (NEW_06_cliente_existente.pdf) — esperado *contabilizar*, obtenido *revisar*. falso negativo: marcó a revisión un asiento válido  · reto: TRAMPA: cliente YA existe (Levante) -> reutilizar 43000001, no crear
- **FAC-29** (29_abono_proveedor.pdf) — esperado *contabilizar*, obtenido *revisar*. falso negativo: marcó a revisión un asiento válido  · reto: abono proveedor = factura negativa -> 400D / 600H / 472H
- **NOM-07** (nomina_07_horas_extra.pdf) — esperado *contabilizar*, obtenido *revisar*. falso negativo: marcó a revisión un asiento válido  · reto: horas extra van a 640 igual que salario base; no a 641 (indemnizaciones)
- **OCR-03** (OCR_03_dos_paginas.pdf) — esperado *contabilizar*, obtenido *revisar*. falso negativo: marcó a revisión un asiento válido  · reto: Factura larga en dos bloques de texto (ya extraído): el extractor debe integrar ambos y cuadrar el total.