# accounting-agent-swarm

Enjambre de tres agentes Claude para automatizar contabilidad real, desarrollado con
evaluación continua: golden set, corrector automático, puertas de no-regresión y
verificador independiente.

→ Página del proyecto: **[jleonceo.github.io/accounting-agent-swarm](https://jleonceo.github.io/accounting-agent-swarm)** (el capítulo de mayo)

---

## La historia en una imagen

![Curva de las 19 simulaciones](assets/curva_runs.png)

Diecinueve simulaciones medidas entre mayo y junio de 2026, sobre tres exámenes cada vez
más duros. Lo que más me ha enseñado este proyecto no son los récords, son las caídas.

Las tres peores notas de la curva (32,1 · 35,4 · 57,1) no las causó el enjambre. Las causó
el examen: un bug del harness que no parseaba la salida del validador, un runner que colapsó
a mitad de ejecución dejando 56 casos sin respuesta, un golden set que se había quedado
desincronizado con la base de datos. El enjambre no empeoró 65 puntos en un día: lo que se
rompió fue el instrumento de medida.

Esa es la lección que me llevo: **cuando evalúas un sistema LLM, el banco de pruebas falla
más a menudo que el sistema**. Si solo miras la última nota, te cuentas una historia equivocada.

## Qué hace el enjambre

Cuatro agentes especializados, cada uno con su skill:

```
documento (.pdf/.txt) → EXTRACTOR → json → GENERADOR → asiento → VALIDADOR → borrador / revisión
extracto bancario     → PUNTEADOR → conciliación contra MySQL vivo
```

- **extractor-contable**: lee facturas, nóminas y extractos; devuelve JSON estructurado. Si el documento es ilegible, lo dice (no inventa).
- **generador-contable**: del JSON al asiento completo según el PGC 2007, con las cuentas reales de la empresa.
- **validador-contable**: verifica cuadre, integridad y coherencia. Decide si se contabiliza o se frena a revisión manual.
- **punteador-contable**: concilia el extracto bancario contra el diario real en MySQL, línea a línea.

El enjambre **propone, no ejecuta**: los asientos van a una tabla de borradores y los
inserta un humano tras revisarlos. La autonomía es proporcional al riesgo de reversibilidad.

## Cómo se mide

Un corrector automático en Python puntúa cada simulación contra un golden set de respuestas
esperadas, en cinco ejes: acción correcta (¿contabilizar o frenar?), asiento exacto (cuentas
e importes al céntimo), cuadre, calidad del freno (frenar está bien solo si el motivo es el
correcto) y conciliación bancaria (casación contra la base de datos en vivo, no contra un fichero).

La regla que lo gobierna todo: **la simulación se adapta al sistema, nunca el sistema a la
simulación**. Ningún golden, skill o dato se toca para que un test pase.

## Las tres épocas

**1. El ciclo Python (mayo, 63 casos).** De 55,7 a 97,0 en seis iteraciones. Cada regresión
enseñó algo concreto: una nota demasiado amplia en un prompt afecta a casos que no eran el
objetivo; describir la lógica no basta, hay que decir la acción esperada. Es el capítulo que
cuenta la [landing](https://jleonceo.github.io/accounting-agent-swarm).

**2. El valle (principios de junio, 80 casos).** El examen creció y se rompió varias veces:
harness con bugs, golden desincronizado, corrector que metía falsos positivos. Semanas de
arreglar el instrumento de medida más que el sistema medido. Frustrante y, visto con
distancia, la parte más valiosa del proyecto.

**3. La Fábrica (junio, 121-128 casos).** La solución estructural al valle: un generador de
documentos sintéticos donde **el documento, el asiento esperado y el movimiento bancario
nacen del mismo manifest**. El golden ya no puede desincronizarse de los datos porque ambos
son la misma cosa. Con el banco por fin fiable, la nota volvió a medir al enjambre: 72,4 →
88,6 → 87,1 → **93,3**.

## El estado actual (cierre, 13/06/2026)

| Eje | Resultado |
|---|---|
| Acción correcta (contabilizar vs revisar) | 125/128 = 97,7% |
| Asiento exacto (cuentas + importes) | 81/84 = 96,4% |
| Cuadre de los asientos propuestos | 84/84 = 100% |
| Frenó bien (acción + motivo correcto) | 33/41 = 80,5% |
| Conciliación (casación contra MySQL vivo) | 79/79 = 100% |
| Falsos positivos (asientos erróneos colados) | **0** |

Nota global: **93,3/100**, y la decisión de cerrar ahí. Los seis casos que quedan abiertos
son casos límite (la opción de compra de un leasing, un asiento de apertura) y variabilidad
del modelo; están documentados caso a caso en [evidencia/](evidencia/), sin maquillar.
Perseguirlos uno a uno es el bucle de rendimientos decrecientes.

Un detalle del cierre que resume el método: en RUN3, el validador frenó dos asientos
alegando que sus cuentas "no existían". Un primer análisis le creyó y concluyó que faltaba
crear 4 cuentas. Verificado contra MySQL: las 4 existían. El que fallaba era el validador,
que se las inventaba. Desde entonces tiene prohibido afirmar que una cuenta no existe sin
ejecutar la consulta. No fiarse del primer agente; verificar contra la fuente.

## Qué hay en este repo

```
evidencia/
  registro_de_runs.md            ← las 19 simulaciones, una a una, con su causa real
  2026-06-11-RUN1_informe.md     ← informes del corrector, tal cual salieron
  2026-06-12-RUN3_analisis_fallos.md
  2026-06-12-RUN4_informe.md
  2026-06-12-RUN4_cambios_y_tail.md  ← qué se cambió y qué NO se cerró (honesto)
eval/
  eval_enjambre_fabrica.js       ← el runner real (rutas locales saneadas)
  golden_muestra.json            ← 9 casos representativos del golden de 128
assets/curva_runs.png
index.html · styles.css · script.js  ← la landing (capítulo de mayo)
```

Los datos son de TechAcces SL, una empresa **ficticia** creada para este proyecto: ~17.000
líneas de diario en MySQL, tres ejercicios contables, terceros y nóminas sintéticos.
El problema contable es real; el dinero no.

## El capítulo anterior

Este enjambre nació de [llm-eval-contable](https://github.com/jleonceo/llm-eval-contable):
la evaluación de una sola skill contable (50 casos, de 66% a 100% en 6 iteraciones).
Allí está explicado desde cero qué es una skill y por qué hay que examinarla.

## Repos relacionados

Este enjambre es una pieza de un trabajo mayor sobre sistemas con varios agentes. Las piezas hermanas:

- [orquestacion-enjambres-ia](https://github.com/jleonceo/orquestacion-enjambres-ia): el enrutado, cómo se decide a qué agente va cada petición sin romper al crecer.
- [gobernanza-skills-analiticas](https://github.com/jleonceo/gobernanza-skills-analiticas): el método que gobierna a este enjambre, con golden sets y puertas de no-regresión.
- [verificacion-determinista-ia](https://github.com/jleonceo/verificacion-determinista-ia): el guardarraíl que recomprueba la coherencia de los datos sin IA.
- [agent-memory-governance](https://github.com/jleonceo/agent-memory-governance): que la memoria del agente no se convierta en un vertedero.
- [tu-primer-asistente-ia-web](https://github.com/jleonceo/tu-primer-asistente-ia-web): qué es un asistente de IA, para quien empieza de cero.
- [tesoreria-forecast-ia](https://github.com/jleonceo/tesoreria-forecast-ia): previsión de caja por descomposición con backtesting, más ratios y aging.
- [control-interno-fraude-ia](https://github.com/jleonceo/control-interno-fraude-ia): detección de fraude contable con aritmética, dentro de un marco de control interno.

---

Construido por [Juan Luis León Rodríguez](https://juanluisleon.vercel.app) · mayo-junio 2026
