import axiosClient from "./axiosClient";

/**
 * Envía el PIN de 4 dígitos al backend para iniciar sesión.
 * @param {string} pin - El PIN ingresado en el teclado.
 * @returns {Promise<object>} { success: true, nombre, rol, token }
 */
export async function verificarPin(pin) {
  // Apunta al endpoint de login que configuramos en Express
  const { data } = await axiosClient.post("/v1/auth/login", { pin });
  return data; 
}