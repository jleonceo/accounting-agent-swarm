# Informe de evaluación del enjambre — TechAcces

Golden set vfabrica-completo-1.2 · 128 asientos + 10 extractos

## Nota global
**93.3 / 100**

> 3 falso(s) negativo(s) (marcó a revisión asientos válidos): ACR-41000004, SIN-13, SIN-14

## Métricas por eje
| Eje | Resultado |
|---|---|
| Acción correcta (contabilizar vs revisar) | 125/128 = 97.7% |
| Asiento exacto (cuentas + importes) | 81/84 = 96.4% |
| Cuadre de los asientos propuestos | 84/84 = 100.0% |
| Detección de revisión (¿frenó?) | 41/41 = 100.0% |
| **Frenó BIEN (acción + motivo correcto) — puntúa** | 33/41 = 80.5% |
| Conciliación 2023 (casación num_asiento vs MySQL) | 79/79 = 100.0% |

## Fallos a revisar
- **ACR-41000004** (ACR-41000004.txt) — esperado *contabilizar*, obtenido *revisar*. falso negativo: marcó a revisión un asiento válido
- **ACR-41000006** (ACR-41000006.txt) — esperado *contabilizar*, obtenido *contabilizar*. esperado [('410', 0.0, 665.5), ('47200002', 115.5, 0.0), ('62800002', 550.0, 0.0)] | obtenido []
- **SIN-03** (liquidacion_iva_2T) — esperado *contabilizar*, obtenido *contabilizar*. esperado [('47200002', 0.0, 3210.0), ('47500002', 0.0, 1650.0), ('47700002', 4860.0, 0.0)] | obtenido [('47200002', 0.0, 3210.0), ('47500002', 1650.0, 1650.0), ('47700002', 4860.0, 0.0), ('57200002', 0.0, 1650.0)]
- **SIN-13** (apertura_ejercicio) — esperado *contabilizar*, obtenido *revisar*. falso negativo: marcó a revisión un asiento válido
- **SIN-14** (periodificacion_gasto_anticipado) — esperado *contabilizar*, obtenido *revisar*. falso negativo: marcó a revisión un asiento válido  · reto: parte del seguro imputada al año siguiente -> 480D / 625H (no 572H)
- **SIN-25** (opcion_compra_leasing) — esperado *contabilizar*, obtenido *contabilizar*. esperado [('410', 0.0, 1210.0), ('47200002', 210.0, 0.0), ('52400002', 1000.0, 0.0)] | obtenido []  · reto: opcion de compra DEVENGO (doble asiento): valor residual cancela 52400002; IVA 21% s/residual->472; acreedor financiera->41000009. El bien ya esta en 21800002 desde el alta: sin nuevo activo ni traspaso de amortizacion.