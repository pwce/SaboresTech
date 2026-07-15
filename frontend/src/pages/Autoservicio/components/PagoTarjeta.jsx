// PagoTarjeta.jsx
import { useEffect, useState } from "react";
import { useAutoservicio, PASOS } from "../../../context/AutoservicioContext";
import axiosClient from "../../../api/axiosClient";

const ESTADOS = {
  ESPERANDO: "esperando",
  PROCESANDO: "procesando",
  APROBADO: "aprobado",
  ERROR: "error",
};

export default function PagoTarjeta() {
  const { carrito, reiniciarPedido } = useAutoservicio();
  const [estado, setEstado] = useState(ESTADOS.ESPERANDO);
  const [numeroJornada, setNumeroJornada] = useState(null);
  const [errorMensaje, setErrorMensaje] = useState("");

  useEffect(() => {
    const t1 = setTimeout(() => setEstado(ESTADOS.PROCESANDO), 2000);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (estado !== ESTADOS.PROCESANDO) return;

    const enviarPedidoTarjeta = async () => {
      try {
        const productosFormateados = carrito.map((item) => ({
          producto_id: item.id,
          maxStock: item.stock, 
          cantidad: item.cantidad,
          personalizaciones: item.personalizaciones || "",
        }));

        const res = await axiosClient.post("/v1/pedidos", {
          metodoPago: "tarjeta",
          productos: productosFormateados,
        });

        if (res.data.success) {
          setNumeroJornada(res.data.numeroJornada);
          setEstado(ESTADOS.APROBADO);
        }
      } catch (error) {
        console.error("Error al registrar pedido con tarjeta:", error);
        setErrorMensaje(
          error.response?.data?.mensaje || "Error de comunicación con el servidor"
        );
        setEstado(ESTADOS.ERROR);
      }
    };

    const t2 = setTimeout(() => {
      enviarPedidoTarjeta();
    }, 1500);

    return () => clearTimeout(t2);
  }, [estado, carrito]);

  useEffect(() => {
    if (estado !== ESTADOS.APROBADO) return;
    
    const t3 = setTimeout(() => {
      reiniciarPedido();
    }, 5000); 
    return () => clearTimeout(t3);
  }, [estado, reiniciarPedido]);

  return (
    <div
      className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center px-6"
      onClick={estado === ESTADOS.APROBADO ? reiniciarPedido : undefined}
    >
      <div 
        className="bg-carbon-800 border border-accent/30 rounded-card p-10 max-w-sm w-full text-center flex flex-col items-center gap-5 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/*esperando tarjeta*/}
        {estado === ESTADOS.ESPERANDO && (
          <>
            <span className="text-6xl animate-pulse">💳</span>
            <p className="text-white font-display text-lg font-medium">
              Pase la tarjeta por la máquina POS
            </p>
          </>
        )}

        {/*procesando transaccion*/}
        {estado === ESTADOS.PROCESANDO && (
          <>
            <div className="w-14 h-14 rounded-full border-4 border-accent/30 border-t-accent animate-spin" />
            <p className="text-white font-display text-lg font-medium">
              Procesando tarjeta...
            </p>
          </>
        )}

        {/*muestra el numero de jornada real de la base de datos*/}
        {estado === ESTADOS.APROBADO && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center animate-bounce">
              <span className="text-green-500 text-3xl">✓</span>
            </div>
            <p className="text-green-400 font-display text-xl font-bold">¡Pago Aprobado!</p>
            
            <div className="text-white space-y-2">
              <p className="text-2xl font-black text-brand-400">Pedido N° {numeroJornada}</p>
              <p className="text-sm text-carbon-200">
                "Tu pedido fue validado. En este momento lo estamos preparando"
              </p>
            </div>
            
            <p className="text-accent text-xs animate-pulse mt-2">
              Redirigiendo al inicio en unos segundos...
            </p>
          </>
        )}

        {/*error en la transaccion/sin stock/falla tecnica*/}
        {estado === ESTADOS.ERROR && (
          <>
            <span className="text-6xl"></span>
            <p className="text-red-400 font-display text-xl font-bold">Pago Rechazado</p>
            <p className="text-carbon-300 text-sm">{errorMensaje}</p>
            <button
              onClick={reiniciarPedido}
              className="mt-4 px-6 py-2 rounded-full bg-brand-500 text-carbon-900 font-bold text-sm transition-transform hover:scale-105"
            >
              Volver a intentar
            </button>
          </>
        )}
      </div>
    </div>
  );
}