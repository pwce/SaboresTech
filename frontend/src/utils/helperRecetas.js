/**
 * tdo esto evalua si un producto/preparado se puede vender hoy basado en los insumos configurados para la jornada
 * @param {string} tipoProducto 
 * @param {Object} insumosJornada 
 * @returns {boolean}
 */
export function verificarDisponibilidadReceta(tipoProducto, insumosJornada) {
  if (!insumosJornada) return false;

  const { frutas, leches, extras, envases, crema } = insumosJornada;

  const hayVasos = envases && Number(envases.vasos) > 0;
  if (!hayVasos) return false;

  const tieneFrutasActivas = frutas ? Object.values(frutas).some(f => f === true) : false;
  const tieneLechesActivas = leches ? Object.values(leches).some(l => l === true) : false;
  const tieneCremasActivas = crema ? Object.values(crema).some(l => l === true) : false;

  switch (tipoProducto.toLowerCase()) {
    
    case 'jugo':
      return tieneFrutasActivas;

    case 'milkshake':
      return tieneFrutasActivas && tieneLechesActivas;

    case 'frappe_base':
      return tieneLechesActivas;
      return tieneCremasActivas

    // para los distintos tipos de frappes
    case 'frapuccino':
      return tieneLechesActivas && (extras?.café === true);

    case 'chocofrape':
      return tieneLechesActivas && (extras?.chocolatepolvo === true);

    case 'frappe_oreo':
      return tieneLechesActivas && (extras?.galletas_oreo === true);

    case 'frappe_matcha':
      return tieneLechesActivas && (extras?.matcha === true);

    case 'frappe_vainilla':
      return tieneLechesActivas && (extras?.vainilla === true);

    case 'frappe_chocomenta':
      return tieneLechesActivas && (extras?.chocolatepolvo === true) && (extras?.menta === true);

    case 'frappe_frutilla':

      return tieneLechesActivas && (frutas?.frutilla === true);

    default:
      return true;
  }
}