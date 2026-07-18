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
 * actualiza un producto existente del catálogo maestro (nombre, precio, categoría,
 * si controla stock y/o su imagen)
 * @param {number} id
 * @param {{ nombre?: string, precio?: number, categoria?: string, controlaStock?: boolean, imagen?: File }} cambios
 */
export async function actualizarProducto(id, cambios) {
  const formData = new FormData();
  if (cambios.nombre !== undefined) formData.append("nombre", cambios.nombre);
  if (cambios.precio !== undefined) formData.append("precio", String(cambios.precio));
  if (cambios.categoria !== undefined) formData.append("categoria", cambios.categoria);
  if (cambios.controlaStock !== undefined) formData.append("controlaStock", String(cambios.controlaStock));
  if (cambios.imagen) formData.append("imagen", cambios.imagen);

  const { data } = await axiosClient.put(`/v1/productos/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data ?? data;
}

/**
 * elimina un producto del catálogo maestro de forma definitiva
 * @param {number} id
 */
export async function eliminarProducto(id) {
  const { data } = await axiosClient.delete(`/v1/productos/${id}`);
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