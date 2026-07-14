/**
 * calcula qué categorías de bebestibles sin stock fijo pueden activarse hoy,
 * según los insumos seleccionados para la jornada.
 * @param {object} insumos
 * @returns {{ hayEnvases: boolean, jugosNaturales: boolean, milkshakes: boolean, frappes: boolean }}
 */
export function calcularDisponibilidadBebestibles(insumos) {
  const envases = insumos?.envases || {};
  const hayEnvases =
    Number(envases.vasos) > 0 && Number(envases.tapas) > 0 && Number(envases.bombillas) > 0;

  const hayFruta = Object.values(insumos?.frutas || {}).some(Boolean);
  const hayLeche = Object.values(insumos?.leches || {}).some(Boolean);

  return {
    hayEnvases,
    // los jugos naturales solo requieren envases + al menos una fruta
    jugosNaturales: hayEnvases && hayFruta,
    // los milkshakes requieren envases + fruta + leche
    milkshakes: hayEnvases && hayFruta && hayLeche,
    // los frappés requieren envases + leche (el sabor específico depende de otros extras)
    frappes: hayEnvases && hayLeche,
  };
}

/**
 * texto explicativo de por qué una categoría de bebestible está bloqueada, para mostrar en la UI.
 */
export function razonBloqueo(tipo, disponibilidad) {
  if (!disponibilidad.hayEnvases) {
    return "Falta seleccionar vasos, tapas y bombillas para la jornada.";
  }
  if (tipo === "jugosNaturales") return "Falta seleccionar al menos una fruta.";
  if (tipo === "milkshakes") return "Faltan frutas y/o leche para preparar milkshakes.";
  if (tipo === "frappes") return "Falta seleccionar al menos un tipo de leche.";
  return "";
}
