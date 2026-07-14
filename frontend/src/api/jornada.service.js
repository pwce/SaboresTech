import axiosClient from "./axiosClient";

/**
 * obtiene la jornada activa (si es que hay una en curso)
 * @returns {Promise<object|null>}
 */
export async function obtenerJornadaActiva() {
  const { data } = await axiosClient.get("/v1/jornada/activa");
  return data.data;
}

/**
 * abre una nueva jornada con los insumos y productos seleccionados
 * @param {object} insumosDisponibles
 * @param {Array} productosSeleccionados
 */
export async function abrirJornada(insumosDisponibles, productosSeleccionados) {
  const { data } = await axiosClient.post("/v1/jornada/abrir", { 
    insumosDisponibles, 
    productosSeleccionados 
  });
  return data;
}

/**
 * cierra la jornada activa
 */
export async function cerrarJornada() {
  const { data } = await axiosClient.post("/v1/jornada/cerrar");
  return data;
}

/**
 * actualiza el detalle de insumos de la jornada activa (ej: marcar un insumo como agotado)
 * @param {object} insumosDisponibles
 */
export async function actualizarInsumosJornada(insumosDisponibles) {
  const { data } = await axiosClient.patch("/v1/jornada/actualizar-insumos", { insumosDisponibles });
  return data;
}
