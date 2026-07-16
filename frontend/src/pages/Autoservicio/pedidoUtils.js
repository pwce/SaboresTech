//pedidoUtils.js
export function construirProductosPedido(carrito) {
  return carrito.map((item) => ({
    producto_id: item.productoId,
    cantidad: item.cantidad,
    personalizaciones: item.opciones?.resumen || "",
  }));
}