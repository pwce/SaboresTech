import { createContext, useContext, useState, useMemo } from "react";

const AutoservicioContext = createContext(null);

export const PASOS = {
  BIENVENIDA: "bienvenida",
  TIPO_SERVICIO: "tipoServicio",
  MENU: "menu",
  CARRITO: "carrito",
  PAGO: "pago",
};

export function AutoservicioProvider({ children }) {
  const [paso, setPaso] = useState(PASOS.BIENVENIDA);
  const [tipoServicio, setTipoServicio] = useState(null); 
  const [carrito, setCarrito] = useState([]);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);

  function agregarAlCarrito(item) {
    setCarrito((prev) => {
      
      const existe = prev.find((it) => it.id === item.id);
      if (existe) {
        return prev.map((it) =>
          it.id === item.id
            ? {
                ...it,
                cantidad: it.cantidad + item.cantidad,
                subtotal: it.precioUnitario * (it.cantidad + item.cantidad),
              }
            : it
        );
      }
      
      return [...prev, { ...item, subtotal: item.precioUnitario * item.cantidad }];
    });
  }

  function actualizarCantidad(itemId, delta) {
    setCarrito((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? {
              ...it,
              cantidad: Math.max(1, it.cantidad + delta),
              subtotal: it.precioUnitario * Math.max(1, it.cantidad + delta),
            }
          : it
      )
    );
  }

  function eliminarItem(itemId) {
    setCarrito((prev) => prev.filter((it) => it.id !== itemId));
  }

  function reiniciarPedido() {
    setCarrito([]);
    setTipoServicio(null);
    setPedidoConfirmado(false);
    setPaso(PASOS.BIENVENIDA);
  }

  const total = useMemo(
    () => carrito.reduce((acc, it) => acc + it.subtotal, 0),
    [carrito]
  );

  const cantidadItems = useMemo(
    () => carrito.reduce((acc, it) => acc + it.cantidad, 0),
    [carrito]
  );

  const value = {
    paso,
    setPaso,
    tipoServicio,
    setTipoServicio,
    carrito,
    agregarAlCarrito,
    actualizarCantidad,
    eliminarItem,
    total,
    cantidadItems,
    pedidoConfirmado,
    setPedidoConfirmado,
    reiniciarPedido,
  };

  return (
    <AutoservicioContext.Provider value={value}>
      {children}
    </AutoservicioContext.Provider>
  );
}

export function useAutoservicio() {
  const ctx = useContext(AutoservicioContext);
  if (!ctx) throw new Error("useAutoservicio debe usarse dentro de <AutoservicioProvider>");
  return ctx;
}