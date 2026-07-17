// gastos.service.js
import axiosClient from "./axiosClient";

export async function obtenerJornadas() {
  const { data } = await axiosClient.get("/v1/jornada");
  return data.data;
}

export async function obtenerGastos({ jornadaId, soloReembolsos } = {}) {
  const params = {};
  if (jornadaId) params.jornada_id = jornadaId;
  if (soloReembolsos) params.soloReembolsos = "true";
  const { data } = await axiosClient.get("/v1/gastos", { params });
  return data.data;
}

export async function crearGasto({ nombreOperacion, categoria, metodoPago, monto, jornadaId, comprobante }) {
  const formData = new FormData();
  formData.append("nombreOperacion", nombreOperacion);
  formData.append("categoria", categoria);
  formData.append("metodoPago", metodoPago);
  formData.append("monto", monto);
  formData.append("jornada_id", jornadaId);
  if (comprobante) formData.append("comprobante", comprobante);

  const { data } = await axiosClient.post("/v1/gastos", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function marcarReembolsoHecho(gastoId) {
  const { data } = await axiosClient.patch(`/v1/gastos/${gastoId}/reembolso`);
  return data;
}