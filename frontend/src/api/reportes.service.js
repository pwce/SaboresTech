import axiosClient from "./axiosClient";

/**
 * trae el reporte de una jornada puntual: ventas por método de pago y por producto
 * @param {number} jornadaId
 */
export async function obtenerReporteJornada(jornadaId) {
  const { data } = await axiosClient.get(`/v1/reportes/jornada/${jornadaId}`);
  return data.data;
}

/**
 * trae el resumen agrupado de todas las jornadas
 * @param {"semanal"|"mensual"} tipo
 */
export async function obtenerResumenPeriodo(tipo = "semanal") {
  const { data } = await axiosClient.get("/v1/reportes/resumen", { params: { tipo } });
  return data.data;
}