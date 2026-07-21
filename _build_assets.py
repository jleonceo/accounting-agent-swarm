# _build_assets.py - regenera los dos assets que el README ensena.
#
# AVISO ANTES DE EJECUTARLO (comprobado el 21/07/2026): ejecutarlo HOY cambia los dos ficheros
# publicados, y el cambio NO es ruido.
#
#   eval/golden_muestra.json  el publicado trae `47600002` con 978,75 en una sola linea. El
#                             golden vivo lo parte en `47600002` + `47600003` desde el SPLIT DE
#                             SEGURIDAD SOCIAL del 21/06. La muestra publicada retrata la
#                             doctrina ANTERIOR a ese split.
#   assets/curva_runs.png     122.052 bytes publicado contra 113.509 al regenerar.
#
# Y LA NUMERACION DE RUNS NO ESTA MAL, aunque lo parezca. El registro canonico
# (`Fabrica_Documentos/Manual_Preparacion_Simulaciones_Enjambre_TechAcces.md`) dice RUN3=93,7 y
# RUN4=87,2, mientras aqui figuran 87,1 y 93,3. Son DOS SERIES DISTINTAS, desplazadas una
# posicion: lo que este repo llama RUN4 (12/06, freno-bien 80,5%) es lo que el registro llama
# RUN3 (13/06, freno-bien 80,5%, global re-puntuado a 93,7). La huella que los identifica es el
# freno-bien. NO "corregir" estas cifras contra el registro sin resolver antes de que objeto
# habla cada serie.
#
# Este repo cuenta una historia que cerro el 12/06. Actualizar la curva a la historia de hoy
# (faltan RUN7 93,2, RUN8 94,2 que es la mejor marca, y RUN9) es reescribir el relato, no un
# retoque. Es una decision de Juan, no un efecto secundario de ejecutar este script.
# Uso: python _build_assets.py  (desde la raíz del repo)
import json, os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

# ── Datos: registro histórico de runs (fuente: Manual de Preparación de Simulaciones §8 + informes RUN3/RUN4) ──
# (etiqueta, nota, época, fallo_del_examen)  época: 0=Python/63 casos · 1=JS/80 casos · 2=Fábrica/121-128 casos
runs = [
    ("R_v13",  55.7, 0, False),
    ("R8",     80.1, 0, False),
    ("R9",     93.3, 0, False),
    ("R10",    89.9, 0, False),
    ("R11",    94.0, 0, False),
    ("R12",    89.5, 0, False),
    ("R13",    97.0, 0, False),
    ("R14",    32.1, 1, True),    # bug del harness: no parseaba la salida del validador
    ("R14b",   65.2, 1, True),    # golden con plan de terceros ficticio (examen roto)
    ("R14p",   67.8, 1, False),
    ("R14.5",  35.4, 1, True),    # el runner colapsa (56 casos sin respuesta)
    ("R15",    57.1, 1, True),    # golden desincronizado (sufijos de cuentas)
    ("R17",    56.8, 1, True),    # el corrector introduce falsos positivos
    ("R17m",   64.9, 1, False),
    ("R18",    69.9, 1, False),
    ("FAB",    72.4, 2, False),
    ("RUN1",   88.6, 2, False),
    ("RUN3",   87.1, 2, False),
    ("RUN4",   93.3, 2, False),
    # --- AMPLIACION 21/07/2026: la historia siguio despues de que este repo se publicara ---
    # OJO CON LAS ETIQUETAS. Los cuatro puntos de abajo vienen del registro canonico
    # (`Manual_Preparacion_Simulaciones_Enjambre_TechAcces.md`), que numera con OTRA serie: su
    # RUN3 es este RUN4 de aqui (misma corrida, freno-bien 80,5% en las dos, global re-puntuado
    # de 93,3 a 93,7). Para no tener dos "RUN4" que dicen cosas distintas, los nuevos van
    # etiquetados POR FECHA. Es feo y es honesto: renumerar el pasado publicado seria peor.
    ("21jun",  87.2, 2, True),     # deflactada: el golden aun esperaba la SS sin partir
    ("24jun",  93.2, 2, False),
    ("27jun",  94.2, 2, False),    # mejor marca hasta hoy
    ("20jul",  79.4, 2, True),     # banco AMPLIADO a 129 asientos + 10 extractos, no comparable
]

AZUL  = "#2563eb"   # nota del enjambre
ROJO  = "#dc2626"   # la nota cayó por culpa del examen, no del alumno
GRIS  = "#9ca3af"

fig, ax = plt.subplots(figsize=(12.5, 5.2), dpi=150)
x = list(range(len(runs)))
y = [r[1] for r in runs]

# bandas de época
bandas = [(0, 6, "Ciclo Python — 63 casos\n(mayo)"),
          (7, 14, "Ciclo JS — 80 casos\n(el valle: el examen se rompe)"),
          (15, 18, "La Fábrica — 121-128 casos\n(golden anti-deriva)")]
for ini, fin, etiqueta in bandas:
    ax.axvspan(ini - 0.5, fin + 0.5, color=("#f1f5f9" if ini != 7 else "#fef2f2"), zorder=0)
    ax.text((ini + fin) / 2, 8, etiqueta, ha="center", va="bottom",
            fontsize=8.5, color="#475569", linespacing=1.4)

ax.plot(x, y, color=GRIS, lw=1.2, zorder=2)
for i, (lab, nota, _, examen) in enumerate(runs):
    ax.scatter(i, nota, s=70 if not examen else 80, zorder=3,
               color=(ROJO if examen else AZUL),
               marker="o" if not examen else "X")
    ax.annotate(f"{nota:.1f}".replace(".", ","), (i, nota),
                textcoords="offset points", xytext=(0, 9),
                ha="center", fontsize=7.5,
                color=(ROJO if examen else "#1e293b"))

ax.set_xticks(x)
ax.set_xticklabels([r[0] for r in runs], fontsize=8, rotation=0)
ax.set_ylim(0, 105)
ax.set_ylabel("Nota global / 100", fontsize=9)
ax.set_title("19 simulaciones medidas — la nota NO es monótona, y eso es lo interesante",
             fontsize=11, pad=14, color="#0f172a")
ax.spines[["top", "right"]].set_visible(False)
ax.grid(axis="y", color="#e2e8f0", lw=0.6, zorder=0)

# leyenda manual
from matplotlib.lines import Line2D
ax.legend(handles=[
    Line2D([0], [0], marker="o", color="w", markerfacecolor=AZUL, markersize=8,
           label="Nota del enjambre"),
    Line2D([0], [0], marker="X", color="w", markerfacecolor=ROJO, markersize=9,
           label="La caída fue del examen (harness/golden/corrector), no del enjambre"),
], loc="upper center", bbox_to_anchor=(0.63, 1.0), fontsize=8, frameon=False)

plt.tight_layout()
os.makedirs("assets", exist_ok=True)
plt.savefig("assets/curva_runs.png", bbox_inches="tight")
print("OK assets/curva_runs.png")

# ── Muestra del golden (casos representativos, no el banco completo) ──
# El banco completo NO vive en este repo (es interno). La ruta se pasa por entorno para que el
# fichero no lleve una ruta de mi maquina dentro, que es lo que caza el escaner de repos
# publicos y lo que rompe el script para cualquier otro. Sin la variable, el script avisa y
# deja la muestra como esta en vez de reventar: quien clone esto solo quiere la curva.
SRC = os.environ.get("GOLDEN_FABRICA")
if not SRC or not os.path.isfile(SRC):
    print("AVISO: sin GOLDEN_FABRICA apuntando al banco completo, la muestra no se regenera.")
    print("       (la curva de arriba SI se ha regenerado). Uso:")
    print("       set GOLDEN_FABRICA=<ruta>\golden_fabrica_completo.json && python _build_assets.py")
    raise SystemExit(0)
g = json.load(open(SRC, encoding="utf-8"))
ids_muestra = []
prefijos = ["VEN-", "COM-", "NOM-", "FAC-23", "SIN-22", "SIN-25", "MKT-", "OCR-", "NEW-"]
vistos = set()
for a in g["asientos"]:
    for p in prefijos:
        if a["id"].startswith(p) and p not in vistos:
            ids_muestra.append(a)
            vistos.add(p)
print("Muestra:", [a["id"] for a in ids_muestra])
out = {
    "meta": {
        "nota": "MUESTRA representativa del golden set (9 de 128 casos) — el banco completo vive en el proyecto TechAcces",
        "version_origen": g["meta"]["version"],
        "descripcion_origen": g["meta"]["descripcion"],
        "tolerancia_importe": g["meta"]["tolerancia_importe"],
    },
    "asientos": ids_muestra,
}
os.makedirs("eval", exist_ok=True)
json.dump(out, open("eval/golden_muestra.json", "w", encoding="utf-8"),
          ensure_ascii=False, indent=2)
print("OK eval/golden_muestra.json")
