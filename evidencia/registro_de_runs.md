# Registro histórico de simulaciones: la evolución real (NO es monótona)

Cada fila es una simulación completa del enjambre sobre un banco de pruebas, puntuada por un
corrector automático contra un golden set. Tres exámenes distintos a lo largo del camino:
el ciclo Python de mayo (63 casos), el ciclo JS de junio (80 casos) y la Fábrica (121-128 casos).
Las notas entre exámenes **no son comparables entre sí**: cada examen es más duro que el anterior.

| Run | Fecha | Modelo | Nota | Qué pasó de verdad |
|---|---|---|---|---|
| R_v13 | 29/05 | Sonnet | **55,7** | Falsos negativos masivos (validador con exceso de celo) + conciliación sin implementar |
| R8 | ~30/05 | Sonnet | **80,1** | Reescritura del validador + conciliación implementada |
| R9 | ~30/05 | Sonnet | **93,3** | - |
| R10 | ~30/05 | Sonnet | 89,9 | Regresión: una nota demasiado amplia sobre cuentas de gasto afectó a documentos que no eran el objetivo |
| R11 | ~30/05 | Sonnet | 94,0 | 3 correcciones quirúrgicas independientes |
| R12 | ~30/05 | Sonnet | 89,5 | Regresión: altas de tercero (NEW-*) fallan |
| **R13** | ~30/05 | Sonnet | **97,0** | Mejor nota del ciclo Python: el capítulo que cuenta la landing |
| R14 | 31/05 | Sonnet | **32,1** | **Bug del harness** (no parseaba la salida del validador). El enjambre no había empeorado 65 puntos en un día |
| R14 Opus/Sonnet | 01/06 | Opus/Sonnet | 63,8 / 65,2 | Golden con plan de terceros ficticio (**el examen estaba roto**) |
| R14-post | 01/06 | Sonnet | 67,8 | Golden alineado; acción correcta 91,2% |
| R14.5 | 02/06 | Sonnet | **35,4** | **El runner colapsa** (56 casos sin respuesta). No es el enjambre |
| R15 | 08/06 | Sonnet | 57,1 | **Golden desincronizado** con la base de datos (sufijos de cuentas migrados en MySQL pero no en el golden) |
| R15F/R17 | 08/06 | Sonnet | 53,6 / 56,8 | Un check del corrector introduce falsos positivos |
| R17-motivoV2 | 08/06 | Sonnet | 64,9 | Mejora del corrector y no del enjambre |
| R18 | 08/06 | Sonnet | **69,9** | Mejor nota del ciclo JS; los falsos positivos bajan de 4 a 1 |
| FAB | 09/06 | Sonnet | 72,4 | Primera simulación con la Fábrica de Documentos (aún con el golden viejo) |
| **RUN1** | 11/06 | Sonnet | **88,6** | Conciliación bancaria integrada (rompe el techo de 85); 2 fallos reales de 121 casos y el resto era el banco de pruebas |
| **RUN3** | 12/06 | Sonnet | **87,1** | Primera medida real con banco limpio. 12 fallos, todos del enjambre, en operaciones poco frecuentes. Un primer análisis culpó al banco ("faltan 4 cuentas"). **Falso**: verificado en MySQL, las 4 existían |
| **RUN4** | 12/06 | Sonnet | **93,3** | Arreglos quirúrgicos en los 3 agentes con puerta de no-regresión. Frenó-bien 61→80,5%, falsos negativos 10→3, 0 falsos positivos |
| Check SIN-03 | 13/06 | Sonnet | 4/4 exacto | Run acotado para verificar el último arreglo limpio (liquidación de IVA como doble asiento) |

## Cómo leer esta tabla

Las caídas grandes (32,1 · 35,4 · 53,6) no las causó el enjambre. Las causó el examen:
un bug del harness, un runner colapsado, un golden desincronizado. Esa es la lección
central de todo el proyecto: cuando evalúas un sistema LLM, **el banco de pruebas falla
más a menudo que el sistema**. Si solo miras la última nota, te cuentas una historia equivocada.

La regla que lo gobierna todo: **la simulación se adapta al sistema y nunca el sistema a la
simulación**. Cuando un caso falla, lo primero es cotejar con la fuente primaria (la base
de datos, el documento) quién tiene razón: el golden, el corrector y el harness son sospechosos
exactamente igual que el enjambre.

El cierre: **93,3/100 sobre 128 casos**. Los 6 casos que quedan abiertos son casos límite y
variabilidad del modelo, documentados en `2026-06-12-RUN4_cambios_y_tail.md`. Perseguirlos
uno a uno es el bucle de rendimientos decrecientes.


## Después del 13 de junio

Añadido el 22 de noviembre de 2026. La tabla de arriba se cerró el 13 de junio, y el examen se siguió pasando hasta
julio. Estas son las mediciones completas que vinieron después, sacadas de sus informes originales. Desde aquí se
identifican por la fecha, porque la numeración interna no coincide con la de arriba.

| Fecha | Modelo | Nota | Decisión correcta | Qué pasó |
|---|---|---|---|---|
| 21/06 | Sonnet 4.6 | 87,2 | 124 de 128 | 4 documentos parados que estaban bien |
| 22/06 | Sonnet 4.6 | 92,5 | 125 de 128 | 3 documentos parados que estaban bien |
| 22/06 | Sonnet 4.6 | 93,3 | 126 de 128 | 2 documentos parados que estaban bien |
| 24/06 | Sonnet 4.6 | 93,2 | 124 de 128 | 4 documentos parados que estaban bien |
| **27/06** | Sonnet 4.6 | **94,2** | 127 de 128 | La mejor nota con 128 casos: 1 documento parado que estaba bien |
| **20/07** | Sonnet 4.6 | **79,4** | 109 de 129 | Examen mayor, de 129 asientos y 10 extractos. 2 documentos registrados que había que parar (FAC-07 y FAC-13) y 18 parados que estaban bien |

La última medición completa es la del 20 de julio. El cierre de 93,3 de la sección anterior es el del 13 de junio.

---
*Fuente: registro de simulaciones del proyecto TechAcces · mayo-julio 2026*
