import axiosClient from "./axiosClient";

/**
 * envía el pin de 4 dígitos al backend para iniciar sesión.
 * @param {string} pin - El PIN ingresado en el teclado.
 * @returns {Promise<object>} { success: true, nombre, rol, token }
 */
export async function verificarPin(pin) {
  const { data } = await axiosClient.post("/v1/auth/login", { pin });
  return data; 
}