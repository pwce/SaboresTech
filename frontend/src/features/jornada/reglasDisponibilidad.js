// // reglasDisponibilidad.js
import { obtenerRecetaBebestible } from "./jornada.config";

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

  // no es un bebestible "sin stock fijo" como pizza, empanadas o bebidas en lata
  if (!receta) {
    return { esSinStock: false, bloqueado: false, razon: "" };
  }

  const envases = insumos?.envases || {};
  const hayEnvases =
    Number(envases.vasos) > 0 && Number(envases.tapas) > 0 && Number(envases.bombillas) > 0;

  if (!hayEnvases) {
    return {
      esSinStock: true,
      bloqueado: true,
      razon: "Falta seleccionar vasos, tapas y bombillas para la jornada.",
    };
  }

  const req = receta.requiere;

  if (req.frutas === "alguna" && !Object.values(insumos?.frutas || {}).some(Boolean)) {
    return { esSinStock: true, bloqueado: true, razon: receta.mensajeFaltante };
  }
  if (Array.isArray(req.frutas) && !req.frutas.every((f) => Boolean(insumos?.frutas?.[f]))) {
    return { esSinStock: true, bloqueado: true, razon: receta.mensajeFaltante };
  }

  if (req.leches === "alguna" && !Object.values(insumos?.leches || {}).some(Boolean)) {
    return { esSinStock: true, bloqueado: true, razon: receta.mensajeFaltante };
  }

  if (req.hielo && !insumos?.extras?.hielo) {
    return { esSinStock: true, bloqueado: true, razon: receta.mensajeFaltante };
  }

  if (Array.isArray(req.extras) && !req.extras.every((e) => Boolean(insumos?.extras?.[e]))) {
    return { esSinStock: true, bloqueado: true, razon: receta.mensajeFaltante };
  }

  return { esSinStock: true, bloqueado: false, razon: "" };
}