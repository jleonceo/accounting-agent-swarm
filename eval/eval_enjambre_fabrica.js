export const meta = {
  name: 'eval-enjambre-fabrica',
  description: 'Eval enjambre contable sobre la BASE COMPLETA de la Fabrica de Documentos: golden_fabrica_completo.json (128 casos: dia a dia DERIVADO + especiales/trampas CURADOS + ciclo leasing/renting SIN-22..25) y corpus_simulacion (todo caso resuelve a un .txt real, 0 huecos verificados). Mismo pipeline 3-stage durable que R15, por lotes con checkpoint a disco.',
  phases: [
    { title: 'Preparacion', detail: 'Lee golden_fabrica_completo.json + checkpoints existentes (resumir)' },
    { title: 'Lotes',       detail: 'extractor->generador->validador por lotes; checkpoint a disco tras cada lote' },
    { title: 'Conciliacion',detail: 'punteador sobre extracto(s) 2023; casa contra MySQL vivo' },
    { title: 'Evaluacion',  detail: 'Fusiona checkpoints + corrector.py (conciliacion = pata 2023)' },
  ]
}

// ── VERSION PUBLICADA: rutas locales sustituidas por relativas/placeholder ──
// Este script corre dentro del Workflow tool de Claude Code. El banco completo
// (128 .txt + golden + corrector + extractos) vive en el proyecto privado;
// en este repo hay una muestra del golden en eval/golden_muestra.json.
// NOTA: los args del Workflow tool NO llegan a este script (bug conocido) -> mandan los defaults.
// Para forzar una ejecución nueva, cambia el default de TS a una etiqueta nueva (sin checkpoints previos).
const TS        = (args && args.timestamp) ? args.timestamp : '2026-06-12-RUN4'
const MODEL_TAG = (args && args.model_tag) ? args.model_tag : 'sonnet46'
const BATCH     = (args && args.batch_size) ? args.batch_size : 10   // 128 casos -> 13 lotes
// Skills de PRODUCCION (estado limpio). El golden y el corpus salen de la Fabrica de Documentos.
const SKILLS    = '<ruta>/skills'                                  // extractor-contable, generador-contable, validador-contable, punteador-contable
const GOLDEN    = '<ruta>/golden_fabrica_completo.json'            // golden derivado del manifest (anti-deriva)
const DOCS_TXT  = '<ruta>/corpus_simulacion'                       // 1 .txt por documento del banco
const RESULTS   = '<ruta>/results_simulacion'
const CHECKPOINTS = RESULTS + '/checkpoints'
const CORRECTOR = '<ruta>/corrector.py'                            // corrector automatico (Python, deterministico)
// Conciliacion = pata 2023 (extracto desde el diario real; punteador casa contra MySQL vivo).
const EXTRACTO_2023 = '<ruta>/extracto_conciliacion_2023'
const CONC_MESES    = ['2023_05']   // v1: mayo (validado 100% casacion vs MySQL, punteador v1.2). v2: + 2023_01, 2023_11.

// ── SIN_INPUTS (copia exacta de eval_enjambre_r15_durable.js) ───────────────
const SIN_INPUTS = {
  "SIN-01": { tipo_documento: "SIN_FACTURA", subtipo: "amortizacion_material",
    concepto: "Amortizacion mensual inmovilizado material — Mayo 2026",
    importe: 312.50, periodo: "2026-05", confianza: 1.0 },
  "SIN-02": { tipo_documento: "SIN_FACTURA", subtipo: "amortizacion_intangible",
    concepto: "Amortizacion mensual inmovilizado intangible — Mayo 2026",
    importe: 85.00, periodo: "2026-05", confianza: 1.0 },
  "SIN-03": { tipo_documento: "SIN_FACTURA", subtipo: "liquidacion_iva_2T",
    concepto: "Liquidacion IVA 2T 2026 — IVA repercutido 4860, IVA soportado 3210, cuota a pagar 1650",
    iva_repercutido: 4860.00, iva_soportado: 3210.00, cuota_a_ingresar: 1650.00,
    periodo: "2026-2T", confianza: 1.0 },
  "SIN-04": { tipo_documento: "SIN_FACTURA", subtipo: "pago_iva_hacienda",
    concepto: "Pago cuota IVA 2T 2026 a Hacienda Publica",
    importe: 1650.00, periodo: "2026-2T", confianza: 1.0 },
  "SIN-05": { tipo_documento: "SIN_FACTURA", subtipo: "cuota_prestamo_ico",
    concepto: "Cuota mensual prestamo ICO — Mayo 2026. Principal 850, intereses 120, cuota total 970",
    principal: 850.00, intereses: 120.00, total_cuota: 970.00,
    periodo: "2026-05", confianza: 1.0 },
  "SIN-06": { tipo_documento: "SIN_FACTURA", subtipo: "deterioro_dotacion",
    concepto: "Dotacion deterioro de valor por insolvencia cliente — importe 1500",
    importe: 1500.00, periodo: "2026-05", confianza: 1.0 },
  "SIN-07": { tipo_documento: "SIN_FACTURA", subtipo: "deterioro_reversion",
    concepto: "Reversion deterioro dotado anteriormente — recuperacion credito cliente, importe 1500",
    importe: 1500.00, periodo: "2026-05", confianza: 1.0 },
  "SIN-08": { tipo_documento: "SIN_FACTURA", subtipo: "provision_dotacion",
    concepto: "Dotacion provision para responsabilidades — litigio en curso, estimacion 800",
    importe: 800.00, periodo: "2026-05", confianza: 1.0 },
  "SIN-09": { tipo_documento: "SIN_FACTURA", subtipo: "provision_aplicacion",
    concepto: "Aplicacion provision para responsabilidades — pago litigio resuelto, importe 800",
    importe: 800.00, periodo: "2026-05", confianza: 1.0 },
  "SIN-10": { tipo_documento: "SIN_FACTURA", subtipo: "variacion_existencias",
    concepto: "Variacion de existencias — decremento stock mercaderias por ventas del periodo, importe 1080",
    importe: 1080.00, periodo: "2026-05", confianza: 1.0 },
  "SIN-11": { tipo_documento: "SIN_FACTURA", subtipo: "anticipo_proveedor",
    concepto: "Anticipo a proveedor habitual a cuenta de pedido en curso, importe 600",
    importe: 600.00, periodo: "2026-05", confianza: 1.0 },
  "SIN-12": { tipo_documento: "SIN_FACTURA", subtipo: "regularizacion_iva_no_deducible",
    concepto: "Regularizacion IVA no deducible — gastos representacion, porcion no deducible 84",
    importe: 84.00, periodo: "2026-05", confianza: 1.0 },
  "SIN-13": { tipo_documento: "SIN_FACTURA", subtipo: "apertura_ejercicio",
    concepto: "Asiento de apertura del ejercicio 2026",
    fecha: "2026-01-01", periodo: "2026-01",
    saldos: { existencias_300: 12000.0, inmovilizado_material_217: 8500.0,
               clientes_430: 5300.0, capital_social_100: 10000.0,
               deuda_largo_plazo_170: 9000.0, proveedores_400: 6800.0 },
    confianza: 1.0 },
  "SIN-14": { tipo_documento: "SIN_FACTURA", subtipo: "periodificacion_gasto_anticipado",
    concepto: "Periodificacion gasto anticipado — parte del seguro de oficina que corresponde al ejercicio siguiente. Importe periodificado: 600. La cuenta de gasto a periodificar es 62500002 (primas de seguros). Asiento: 480 D / 625 H.",
    importe: 600.00, periodo: "2026-12", confianza: 1.0 },
  "SIN-15": { tipo_documento: "SIN_FACTURA", subtipo: "traspaso_deuda_largo_corto",
    concepto: "Reclasificacion deuda a largo plazo — la cuota del prestamo ICO que vence en los proximos 12 meses (2.400) debe pasar de largo (170) a corto plazo (520). Asiento: 170 D / 520 H.",
    importe: 2400.00, periodo: "2026-12", confianza: 1.0 },
  "SIN-16": { tipo_documento: "SIN_FACTURA", subtipo: "devengo_intereses_prestamo",
    concepto: "Devengo de intereses del prestamo ICO — intereses devengados no pagados en el periodo, importe 120. No hay salida de caja todavia. Asiento: 662 D / 527 H (intereses CP de deudas con entidades de credito).",
    importe: 120.00, periodo: "2026-05", confianza: 1.0 },
  "SIN-17": { tipo_documento: "SIN_FACTURA", subtipo: "subvencion_capital_recibida",
    concepto: "Subvencion oficial de capital recibida del IVACE (Institut Valencia de Competitivitat Empresarial) — importe 5.000 EUR. La subvencion es de capital (no de explotacion). Asiento: 572 D / 130 H (subvenciones oficiales de capital).",
    importe: 5000.00, periodo: "2026-05", confianza: 1.0 },
  "SIN-18": { tipo_documento: "SIN_FACTURA", subtipo: "asiento_descuadrado",
    concepto: "Propuesta de asiento descuadrado: Debe total 1.000,00 EUR / Haber total 900,00 EUR. Diferencia: 100,00 EUR. El asiento no cuadra. Accion esperada: revisar (no contabilizar).",
    debe_total: 1000.00, haber_total: 900.00, periodo: "2026-05", confianza: 1.0 },
  "SIN-19": { tipo_documento: "SIN_FACTURA", subtipo: "leasing_cuota",
    concepto: "Cuota mensual de arrendamiento financiero (LEASING, con opcion de compra) de furgoneta industrial de reparto de mercancias. Amortizacion del principal 450, intereses 50, IVA 21% sobre la cuota (500) = 105. Cuota total 605. IVA 100% deducible (vehiculo industrial de transporte de mercancias).",
    principal: 450.00, intereses: 50.00, iva: 105.00, total_cuota: 605.00, periodo: "2026-05", confianza: 1.0 },
  "SIN-20": { tipo_documento: "SIN_FACTURA", subtipo: "pago_modelo_111",
    concepto: "Pago a Hacienda del modelo 111: retenciones de IRPF practicadas a empleados y profesionales en el 2T 2026, importe 1200. Liquidacion trimestral de retenciones (no es IVA, no es gasto).",
    importe: 1200.00, periodo: "2026-2T", confianza: 1.0 },
  "SIN-21": { tipo_documento: "SIN_FACTURA", subtipo: "renting_cuota",
    concepto: "Cuota mensual de RENTING de furgoneta de reparto (arrendamiento operativo, SIN opcion de compra): cuota 400 + IVA 21% 84 = 484. IVA 100% deducible (vehiculo industrial). Es renting (gasto), no leasing.",
    importe: 400.00, iva: 84.00, total: 484.00, periodo: "2026-05", confianza: 1.0 },
  "SIN-22": { tipo_documento: "SIN_FACTURA", subtipo: "leasing_alta",
    concepto: "Alta de contrato de arrendamiento financiero (LEASING) de furgoneta industrial de reparto. Valor al contado (precio sin intereses): 24.000 EUR. Principal que vence en los proximos 12 meses (CP): 6.000 EUR. Principal restante mas valor residual opcion de compra (LP): 18.000 EUR. Sin IVA en el alta (el IVA se devenga cuota a cuota). Sin salida de caja en el alta (salvo fianza, si la hay).",
    valor_contado: 24000.00, principal_cp: 6000.00, principal_lp: 18000.00, periodo: "2026-05", confianza: 1.0 },
  "SIN-23": { tipo_documento: "SIN_FACTURA", subtipo: "leasing_amortizacion",
    concepto: "Amortizacion mensual del bien adquirido en leasing (furgoneta industrial). El bien esta activado como inmovilizado material (21800002). Cuota mensual de amortizacion: 500 EUR (vida util 4 anos, valor 24.000, cuota anual 6.000, mensual 500). Igual que cualquier inmovilizado material: 68100002 D / 28100002 H.",
    importe: 500.00, periodo: "2026-05", confianza: 1.0 },
  "SIN-24": { tipo_documento: "SIN_FACTURA", subtipo: "leasing_reclasificacion_cierre",
    concepto: "Reclasificacion anual al cierre (31/12) del arrendamiento financiero (leasing): el principal que vence en los proximos 12 meses (6.000 EUR) pasa de largo plazo (17400002) a corto plazo (52400002). Solo afecta al balance, no a PyG. Asiento: 17400002 D / 52400002 H.",
    importe: 6000.00, periodo: "2026-12", confianza: 1.0 },
  "SIN-25": { tipo_documento: "SIN_FACTURA", subtipo: "leasing_opcion_compra",
    concepto: "Ejercicio de la opcion de compra al final del contrato de leasing. Valor residual: 1.000 EUR. IVA 21% sobre el valor residual: 210 EUR. Total a pagar: 1.210 EUR. El bien ya esta en 21800002 desde el alta: sin nuevo activo ni traspaso de amortizacion acumulada. Asiento de devengo: 52400002 D 1000 + 47200002 D 210 / 41000009 H 1210. Pago (+15 dias): 41000009 D / 57200002 H.",
    valor_residual: 1000.00, iva: 210.00, total: 1210.00, periodo: "2026-05", confianza: 1.0 },
}

// ── Helpers de parsing (copia exacta de R15) ────────────────────────────────
function parseJsonStrict(text) {
  let t = (text || '').trim()
  if (t.startsWith('```')) {
    const lines = t.split('\n')
    let end = lines.length - 1
    while (end > 0 && !lines[end].trim().startsWith('```')) end--
    t = lines.slice(1, end).join('\n').trim()
  }
  try { return { ok: true, data: JSON.parse(t) } }
  catch (e) {
    const first = t.indexOf('{')
    const last  = t.lastIndexOf('}')
    if (first !== -1 && last > first) {
      try { return { ok: true, data: JSON.parse(t.slice(first, last + 1)) } }
      catch (e2) { /* sigue sin parsear */ }
    }
    return { ok: false, raw: t.slice(0, 400) }
  }
}

function parseGenerador(text) {
  const t = text || ''
  for (const marker of ['### Asiento', 'Asiento']) {
    const idx = t.indexOf(marker)
    if (idx !== -1) {
      let after = t.slice(idx + marker.length).trim()
      const next = after.indexOf('###')
      if (next > 0) after = after.slice(0, next).trim()
      const parsed = parseJsonStrict(after)
      if (parsed.ok) return parsed
    }
  }
  return parseJsonStrict(t)
}

// ── build salidas de un lote (misma logica que R15) ─────────────────────────
function buildSalidas(results) {
  return (results || []).filter(Boolean).map(r => {
    let valParsed = {}
    const valRaw = (r.validatorResult || '').trim()
    const valClean = valRaw.startsWith('```')
      ? valRaw.split('\n').slice(1).reverse().slice(1).reverse().join('\n')
      : valRaw
    try { valParsed = JSON.parse(valClean) } catch (e) {}
    const aprobado = valParsed.aprobado === true
    if (aprobado) {
      const genParsed = parseGenerador(r.generatedText)
      const lineas = (genParsed.ok && genParsed.data && Array.isArray(genParsed.data.lineas))
        ? genParsed.data.lineas : []
      return {
        id: r.id, accion: 'contabilizar',
        asiento: lineas.map(l => ({
          cuenta: String(l.cuenta || ''),
          debe:   parseFloat(l.debe  || 0),
          haber:  parseFloat(l.haber || 0),
        })),
        motivo_revision: null
      }
    } else {
      const motivo = valParsed.motivo_rechazo ||
        (Array.isArray(valParsed.errores) && valParsed.errores[0]) ||
        'validacion fallida'
      return { id: r.id, accion: 'revisar', asiento: null, motivo_revision: motivo }
    }
  })
}

// ════════════════════════════════════════════════════════════════════════════
// FASE 1: PREPARACION
// ════════════════════════════════════════════════════════════════════════════
phase('Preparacion')
log('FABRICA · MODEL_TAG=' + MODEL_TAG + ' · TS=' + TS + ' · BATCH=' + BATCH)

const goldenData = await agent(
  'Lee el fichero JSON en: ' + GOLDEN + '\n\n' +
  'Devuelve ÚNICAMENTE un JSON con esta estructura exacta (sin texto adicional):\n' +
  '{\n' +
  '  "version": "<string del campo meta.version>",\n' +
  '  "plan_terceros": { <objeto plan_terceros completo del fichero, sin modificar> },\n' +
  '  "asientos": [ { "id": "<string>", "fuente": "<string>" }, ... ],\n' +
  '  "conciliacion": [ { "id": "<string>" }, ... ]\n' +
  '}\n\n' +
  'El array "asientos" debe incluir TODOS los asientos del golden (son 128; NO truncar, NO resumir).\n' +
  'Para los casos sin documento fisico (id que empieza por "SIN-"), pon "fuente": "" (cadena vacia).\n' +
  'El array "conciliacion" debe incluir todos los extractos (solo campo id de cada uno).\n' +
  'Solo el JSON. Nada antes ni después.',
  {
    label: 'prep-golden-fabrica',
    phase: 'Preparacion',
    schema: {
      type: 'object',
      properties: {
        version:       { type: 'string' },
        plan_terceros: { type: 'object' },
        asientos: {
          type: 'array',
          items: { type: 'object', properties: { id: { type: 'string' }, fuente: { type: 'string' } }, required: ['id','fuente'] }
        },
        conciliacion: {
          type: 'array',
          items: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] }
        }
      },
      required: ['plan_terceros', 'asientos', 'conciliacion']
    }
  }
)

const { plan_terceros, asientos, conciliacion } = goldenData
const planStr = plan_terceros ? JSON.stringify(plan_terceros, null, 2) : '{"error": "plan_terceros no disponible"}'
log('Golden v' + (goldenData.version || '?') + ': ' + asientos.length + ' asientos + ' + conciliacion.length + ' EXT')

// resumibilidad: leer checkpoints en disco para saltar casos ya hechos
const doneInfo = await agent(
  'Busca con la herramienta Glob los ficheros que casen el patron:\n' +
  '  ' + CHECKPOINTS + '/' + TS + '_' + MODEL_TAG + '_batch_*.json\n' +
  'Para cada fichero encontrado, leelo con Read (cada uno es un array JSON de objetos con campo "id").\n' +
  'Devuelve UNICAMENTE un objeto con dos campos:\n' +
  '  - "done_ids": [<todos los ids "id" encontrados en esos ficheros>]\n' +
  '  - "max_batch": <el numero N mas alto que aparece en los nombres ..._batch_N.json; 0 si no hay ficheros>\n' +
  'Si el directorio no existe o no hay ficheros, devuelve {"done_ids": [], "max_batch": 0}. No inventes ids.',
  {
    label: 'leer-checkpoints',
    phase: 'Preparacion',
    schema: { type: 'object', additionalProperties: false, properties: { done_ids: { type: 'array', items: { type: 'string' } }, max_batch: { type: 'integer' } }, required: ['done_ids', 'max_batch'] }
  }
)
const doneIds = new Set((doneInfo && doneInfo.done_ids) || [])
const startBatch = (doneInfo && doneInfo.max_batch) ? doneInfo.max_batch : 0
log('Checkpoints en disco: ' + doneIds.size + ' casos ya hechos (ultimo lote ' + startBatch + ') -> se saltan (reanudacion).')

const pending = asientos.filter(a => !doneIds.has(a.id))
const batches = []
for (let i = 0; i < pending.length; i += BATCH) batches.push(pending.slice(i, i + BATCH))
log('Pendientes: ' + pending.length + ' casos en ' + batches.length + ' lotes de ' + BATCH + '.')

// ── Definicion de stages (identica logica a R15) ────────────────────────────
const extractStage = async (caso) => {
  if (caso.id.startsWith('SIN-')) {
    const sinInput = SIN_INPUTS[caso.id] || { tipo_documento: 'SIN_FACTURA', subtipo: caso.id, confianza: 1.0 }
    return { id: caso.id, fuente: caso.fuente, extractedJson: JSON.stringify(sinInput) }
  }
  const txtPath = DOCS_TXT + '/' + caso.fuente.replace(/\.pdf$/i, '.txt')
  const extracted = await agent(
    'Eres el agente EXTRACTOR del enjambre contable TechAcces.\n\n' +
    'Paso 1: Lee tu skill en: ' + SKILLS + '/extractor-contable/SKILL.md\n\n' +
    'Paso 2: Lee el TEXTO YA EXTRAIDO del documento (el PDF ya fue convertido a texto).\n' +
    '  Ruta del fichero de texto: ' + txtPath + '\n' +
    '  Usa la herramienta Read sobre ese fichero .txt. NO leas ningun PDF ni instales nada.\n' +
    '  Si el fichero esta vacio o casi vacio (documento de imagen sin texto OCR), trata el documento como ilegible.\n\n' +
    'Paso 3: Aplica tu skill al texto del documento.\n\n' +
    'INSTRUCCION DE SALIDA — CRITICO:\n' +
    'Tu respuesta COMPLETA debe ser EXCLUSIVAMENTE el objeto JSON: empieza por { y termina por }.\n' +
    'PROHIBIDO escribir explicaciones, razonamiento o cualquier texto antes o despues del JSON.\n' +
    'Si el documento es ilegible o sin texto (confianza < 0.65) devuelve:\n' +
    '{"extraction_failed": true, "motivo": "...", "confianza": 0.00}',
    { label: 'ext:' + caso.id, phase: 'Lotes', model: 'sonnet' }
  )
  const extParsed = parseJsonStrict(extracted || '')
  const extractedJson = extParsed.ok
    ? JSON.stringify(extParsed.data, null, 2)
    : JSON.stringify({ extraction_failed: true, motivo: 'parse_error', raw: (extracted || '').slice(0, 200), confianza: 0.0 })
  return { id: caso.id, fuente: caso.fuente, extractedJson }
}

const genStage = async (item) => {
  const generated = await agent(
    'Eres el agente GENERADOR del enjambre contable TechAcces.\n\n' +
    'Paso 1: Lee tu skill en: ' + SKILLS + '/generador-contable/SKILL.md\n\n' +
    'Paso 1b: El skill indica dos RAGs que DEBES cargar antes de generar el asiento.\n' +
    'Léelos ahora — contienen las cuentas específicas de TechAcces, son OBLIGATORIOS:\n' +
    '  - <ruta>/rag/PGC_Asientos_Biblioteca_TechAcces.md\n' +
    '  - <ruta>/rag/Asientos_Tipo_TechAcces.md\n\n' +
    'Paso 2: Aplica tu skill al JSON del extractor recibido a continuación.\n\n' +
    'INSTRUCCIÓN DE SALIDA — obligatoria, devuelve exactamente estos dos bloques en este orden:\n' +
    '1. ### Razonamiento  (los 7 campos de la skill)\n' +
    '2. ### Asiento  (el JSON del asiento)\n\n' +
    'PLAN_TERCEROS (catálogo de cuentas auxiliares vigente — usa este catálogo para resolver\n' +
    'nombres a cuentas y para calcular el siguiente ID libre):\n' +
    planStr + '\n\n' +
    'JSON_EXTRACTOR:\n' +
    item.extractedJson,
    { label: 'gen:' + item.id, phase: 'Lotes', model: 'sonnet' }
  )
  const genParsed = parseGenerador(generated || '')
  const genJsonStr = genParsed.ok ? JSON.stringify(genParsed.data, null, 2) : (generated || '')
  return { ...item, generatedText: generated || '', genJsonStr }
}

const valStage = async (item) => {
  const validated = await agent(
    'Eres el agente VALIDADOR del enjambre contable TechAcces.\n\n' +
    'Paso 1: Lee tu skill en: ' + SKILLS + '/validador-contable/SKILL.md\n\n' +
    'Paso 2: Aplica tu skill al JSON del generador recibido a continuación.\n\n' +
    'JSON_GENERADOR:\n' +
    (item.genJsonStr || item.generatedText),
    {
      label: 'val:' + item.id,
      phase: 'Lotes',
      model: 'sonnet',
      schema: {
        type: 'object',
        properties: {
          aprobado:        { type: 'boolean' },
          accion:          { type: 'string' },
          estado_borrador: { type: 'string' },
          errores:         { type: 'array', items: { type: 'string' } },
          advertencias:    { type: 'array', items: { type: 'string' } },
          motivo_rechazo:  { type: 'string' },
          suma_debe:       { type: 'number' },
          suma_haber:      { type: 'number' },
          diferencia:      { type: 'number' }
        },
        required: ['aprobado']
      }
    }
  )
  const validatorResult = (validated === null || validated === undefined)
    ? '{"aprobado": false, "motivo_rechazo": "agent_null"}'
    : (typeof validated === 'object' ? JSON.stringify(validated) : validated)
  return { ...item, validatorResult }
}

// ════════════════════════════════════════════════════════════════════════════
// FASE 2: LOTES — pipeline por lote + checkpoint a disco tras cada uno
// ════════════════════════════════════════════════════════════════════════════
phase('Lotes')
let bi = startBatch
for (const batch of batches) {
  bi++
  const batchResults = await pipeline(batch, extractStage, genStage, valStage)
  const salidasBatch = buildSalidas(batchResults)
  const cpPath = CHECKPOINTS + '/' + TS + '_' + MODEL_TAG + '_batch_' + bi + '.json'
  await agent(
    'Asegura el directorio con PowerShell: New-Item -ItemType Directory -Force -Path "' + CHECKPOINTS + '"\n\n' +
    'Luego escribe con la herramienta Write el fichero:\n' +
    '  file_path: ' + cpPath + '\n' +
    '  content: EXACTAMENTE el JSON que aparece entre ===INICIO=== y ===FIN=== (un array de asientos):\n\n' +
    '===INICIO===\n' +
    JSON.stringify(salidasBatch, null, 2) + '\n' +
    '===FIN===\n\n' +
    'Responde solo "ok".',
    { label: 'checkpoint:lote-' + bi, phase: 'Lotes' }
  )
  log('Lote ' + bi + '/' + batches.length + ' (' + salidasBatch.length + ' casos) -> checkpoint en disco.')
}

// ════════════════════════════════════════════════════════════════════════════
// FASE 2b: CONCILIACION — punteador sobre extracto(s) 2023, casa contra MySQL vivo
// ════════════════════════════════════════════════════════════════════════════
phase('Conciliacion')
const punteoPaths = []
for (const mes of CONC_MESES) {
  const extractoCsv = EXTRACTO_2023 + '/extracto_' + mes + '.csv'
  const punteoCsv   = CHECKPOINTS + '/' + TS + '_' + MODEL_TAG + '_punteo_' + mes + '.csv'
  punteoPaths.push({ mes, punteoCsv, goldenCsv: EXTRACTO_2023 + '/golden_' + mes + '.csv' })
  await agent(
    'Eres el agente PUNTEADOR del enjambre contable TechAcces (ALCANCE 2: conciliacion bancaria).\n\n' +
    'Paso 0: si el fichero ' + punteoCsv + ' ya existe (compruebalo con Glob), NO repitas el trabajo: responde "ya hecho" y termina.\n\n' +
    'Paso 1: Lee tu skill en ' + SKILLS + '/punteador-contable/SKILL.md\n\n' +
    'Paso 2: Lee el extracto ' + extractoCsv + ' (formato linea_id;fecha;concepto;importe; ignora las lineas que empiezan por #). ' +
    'Son movimientos de la cuenta de banco 57200002; importe firmado (negativo=salida, positivo=entrada).\n\n' +
    'Paso 3: CASACION contra MySQL (SOLO SELECT; carga la herramienta con ToolSearch select:mcp__mysql__mysql_query). ' +
    'Cada linea del extracto YA esta apuntada en diario_control_financiero: identifica su num_asiento. ' +
    'EFICIENTE: trae en UNA query los movimientos de la cuenta 57200002 del rango de fechas del extracto (+-1 dia por desfase UTC) y casa en memoria por importe firmado + fecha. ' +
    'Colisiones (mismo dia/mismo importe): desambigua trayendo el tercero/descripcion de esos asientos y cruzando con el concepto del extracto. NO leas ningun fichero golden_*. ' +
    'disposicion = concilia para las que esten en el diario.\n\n' +
    'Paso 4: Escribe con Write el fichero ' + punteoCsv + ' (UTF-8, separador ;, cabecera + una linea por movimiento):\n' +
    '  linea_id;num_asiento;disposicion;nota\n' +
    '  Incluye TODAS las lineas del extracto. Si alguna no casa: num_asiento vacio, disposicion=investigar.\n\n' +
    'Responde solo con el numero de lineas casadas y la ruta del CSV.',
    { label: 'punteo:' + mes, phase: 'Conciliacion', model: 'sonnet' }
  )
  log('Conciliacion ' + mes + ' -> punteo en disco: ' + punteoCsv)
}

// ════════════════════════════════════════════════════════════════════════════
// FASE 3: EVALUACION — fusionar todos los checkpoints + corrector.py
// ════════════════════════════════════════════════════════════════════════════
phase('Evaluacion')
const salidasPath = RESULTS + '/' + TS + '_' + MODEL_TAG + '_fabrica_salida.json'
const informePath = RESULTS + '/' + TS + '_' + MODEL_TAG + '_fabrica_informe.md'
// conciliacion = pata 2023 (punteador vs MySQL); el corrector la puntua con --conc-golden/--conc-punteo
const conciliacionStr = '[]'
const concFlags = punteoPaths.length
  ? ' --conc-golden "' + punteoPaths[0].goldenCsv + '" --conc-punteo "' + punteoPaths[0].punteoCsv + '"'
  : ''

const evalResult = await agent(
  'Construye la salida final del eval Fabrica y ejecuta el corrector. Pasos EXACTOS:\n\n' +
  '1. Con Glob, lista TODOS los checkpoints que casen:\n' +
  '   ' + CHECKPOINTS + '/' + TS + '_' + MODEL_TAG + '_batch_*.json\n' +
  '2. Lee cada fichero con Read (cada uno es un array JSON de asientos) y CONCATENA todos en un unico array "asientos" (sin duplicar ids; si un id aparece en dos checkpoints, conserva el de mayor numero de lote).\n' +
  '3. Construye el objeto salida EXACTO (sin texto adicional):\n' +
  '   {\n' +
  '     "meta": { "enjambre": "golden-eval-fabrica", "modelo": "' + MODEL_TAG + '", "fecha": "' + TS + '", "nota_ext": "conciliacion = pata 2023 (punteador casa contra MySQL vivo)" },\n' +
  '     "asientos": <el array concatenado>,\n' +
  '     "conciliacion": ' + conciliacionStr + '\n' +
  '   }\n' +
  '4. Escribe ese objeto con Write en:\n   ' + salidasPath + '\n' +
  '5. Ejecuta con PowerShell (PYTHONUTF8 evita el crash de consola con emojis):\n' +
  '   $env:PYTHONUTF8=1; python "' + CORRECTOR + '" "' + GOLDEN + '" "' + salidasPath + '" "' + informePath + '"' + concFlags + '\n' +
  '6. Lee ' + informePath + ' y devuelve su contenido COMPLETO (es el resultado final de la evaluacion).',
  { label: 'corrector-evaluador', phase: 'Evaluacion' }
)

log('Eval Fabrica completado. Informe: ' + informePath)
return {
  batches: batches.length,
  skipped: doneIds.size,
  salidasPath,
  informePath,
  evalResult
}
