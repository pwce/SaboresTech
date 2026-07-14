import axiosClient from "./axiosClient";

/**
 * obtiene el catálogo completo de productos
 */
export async function obtenerProductos() {
  const { data } = await axiosClient.get("/v1/productos");
  // el backend a veces responde { success, data } y a veces el arreglo directo
  return Array.isArray(data) ? data : data.data;
}

/**
 * crea un producto nuevo en el catálogo maestro
 * @param {{ nombre: string, precio: number, categoria: string, controlaStock: boolean, imagen?: File }} producto
 */
export async function crearProducto(producto) {
  const formData = new FormData();
  formData.append("nombre", producto.nombre);
  formData.append("precio", String(producto.precio));
  formData.append("categoria", producto.categoria);
  formData.append("controlaStock", String(producto.controlaStock));
  if (producto.imagen) formData.append("imagen", producto.imagen);

  const { data } = await axiosClient.post("/v1/productos", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/**
 * activa o desactiva un producto del catálogo para la jornada de hoy
 * @param {number} id
 * @param {boolean} enJornada
 */
export async function cambiarEstadoJornadaProducto(id, enJornada) {
  const { data } = await axiosClient.patch(`/v1/productos/${id}/jornada`, { enJornada });
  return data;
}

/**
 * actualiza solo la cantidad de stock de un producto
 * @param {number} id
 * @param {number} stock
 */
export async function actualizarStockProducto(id, stock) {
  const { data } = await axiosClient.patch(`/v1/productos/${id}/stock`, { stock });
  return data;
}
