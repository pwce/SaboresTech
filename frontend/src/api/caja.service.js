// caja.service.js
import axiosClient from "./axiosClient";

export async function obtenerCajaPorJornada(jornadaId) {
  const { data } = await axiosClient.get("/v1/caja", { params: { jornada_id: jornadaId } });
  return data.data;
}

export async function abrirCaja(jornadaId, saldoInicial) {
  const { data } = await axiosClient.post("/v1/caja/abrir", { jornada_id: jornadaId, saldoInicial });
  return data;
}

export async function cerrarCaja(cajaId, saldoFinalContado) {
  const { data } = await axiosClient.patch(`/v1/caja/${cajaId}/cerrar`, { saldoFinalContado });
  return data;
}

export async function obtenerHistorialCajas() {
  const { data } = await axiosClient.get("/v1/caja/historial");
  return data.data;
}