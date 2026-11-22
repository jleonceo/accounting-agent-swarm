# Fichas de los cinco agentes

Cada ficha es la instrucción con la que arranca un agente: su papel, lo que no puede hacer y el formato de su
respuesta. La cabecera `tools` es la lista de herramientas que recibe, copiada tal cual. Esa lista es el permiso:
una herramienta que no aparece ahí, el agente no la puede usar.

| Ficha | Papel |
|---|---|
| [contable-extractor.md](contable-extractor.md) | lee el documento original y devuelve sus datos |
| [contable-generador.md](contable-generador.md) | propone el asiento a partir de esos datos, sin ver el documento |
| [contable-verificador.md](contable-verificador.md) | revisa el asiento sin saber quién lo propuso y sin poder escribir |
| [contable-escribano.md](contable-escribano.md) | guarda el asiento aprobado en la tabla de borradores |
| [contable-punteador.md](contable-punteador.md) | estudia las dudas que deja el motor de conciliación bancaria |

Las herramientas que empiezan por `mcp__contabilidad__` las da un servidor propio que consulta la base de datos.
Ninguna escribe en el libro diario ni borra.

## Qué se ha quitado respecto a la versión privada

- Las rutas de los ficheros del proyecto.
- El criterio contable de cada agente, que vive en documentos aparte y se queda en el proyecto privado.
- Los ejemplos de ejecución, que llevan datos del proyecto.
- Las referencias a la organización interna del proyecto y las cifras que solo se pueden comprobar en él.

El resto del texto es el de la versión privada.
