// reglasDisponibilidad.js
import { obtenerRecetaBebestible, obtenerLabelInsumo } from "./jornada.config";

export function insumoDisponible(insumos, grupo, key) {
  return grupo === "envases"
    ? Number(insumos?.[grupo]?.[key]) > 0
    : Boolean(insumos?.[grupo]?.[key]);
}

export function algunoDisponible(insumos, grupo) {
  const valores = insumos?.[grupo] || {};
  return Object.keys(valores).some((key) => insumoDisponible(insumos, grupo, key));
}


/**
 * evalúa si un producto (bebestible sin stock fijo) se puede vender hoy,
 * segun su receta específica y los insumos configurados para la jornada
 *
 * @param {string} nombreProducto
 * @param {object} insumos - insumosForm / insumosDisponibles de la jornada
 * @returns {{ esSinStock: boolean, bloqueado: boolean, razon: string }}
 */
export function evaluarDisponibilidadProducto(nombreProducto, insumos) {
  const receta = obtenerRecetaBebestible(nombreProducto);

  // no es un bebestible sin stock fijo como pizza, empanadas o bebidas en lata
  if (!receta) {
    return { esSinStock: false, bloqueado: false, razon: "" };
  }

  const hayEnvases =
    insumoDisponible(insumos, "envases", "vasos") &&
    insumoDisponible(insumos, "envases", "tapas") &&
    insumoDisponible(insumos, "envases", "bombillas");

  if (!hayEnvases) {
    return {
      esSinStock: true,
      bloqueado: true,
      razon: "Falta vasos, tapas y/o bombillas (sin seleccionar o agotados).",
    };
  }

  const req = receta.requiere;

  if (req.frutas === "alguna" && !algunoDisponible(insumos, "frutas")) {
    return { esSinStock: true, bloqueado: true, razon: receta.mensajeFaltante };
  }
  if (Array.isArray(req.frutas) && !req.frutas.every((f) => insumoDisponible(insumos, "frutas", f))) {
    return { esSinStock: true, bloqueado: true, razon: receta.mensajeFaltante };
  }

  if (req.leches === "alguna" && !algunoDisponible(insumos, "leches")) {
    return { esSinStock: true, bloqueado: true, razon: receta.mensajeFaltante };
  }

  if (req.endulzantes === "alguna" && !algunoDisponible(insumos, "endulzantes")) {
    return { esSinStock: true, bloqueado: true, razon: receta.mensajeFaltante };
  }

  if (req.hielo && !insumoDisponible(insumos, "extras", "hielo")) {
    return { esSinStock: true, bloqueado: true, razon: receta.mensajeFaltante };
  }

  if (Array.isArray(req.extras) && !req.extras.every((e) => insumoDisponible(insumos, "extras", e))) {
    return { esSinStock: true, bloqueado: true, razon: receta.mensajeFaltante };
  }

  return { esSinStock: true, bloqueado: false, razon: "" };
}

function opcionesDisponiblesDelGrupo(insumos, grupo) {
  const valores = insumos?.[grupo] || {};
  return Object.keys(valores)
    .filter((key) => insumoDisponible(insumos, grupo, key))
    .map((key) => ({ key, label: obtenerLabelInsumo(grupo, key, insumos) }));
}

export function obtenerOpcionesDisponibles(insumos) {
  if (!insumos) return null;
  return {
    frutasDisponibles: opcionesDisponiblesDelGrupo(insumos, "frutas"),
    lechesDisponibles: opcionesDisponiblesDelGrupo(insumos, "leches"),
    endulzantesDisponibles: opcionesDisponiblesDelGrupo(insumos, "endulzantes"),
  };
}
