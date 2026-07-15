// PagoEfectivo.jsx
import { useState } from "react";
import { useAutoservicio, PASOS } from "../../../context/AutoservicioContext";
import axiosClient from "../../../api/axiosClient";

export default function PagoEfectivo() {
  const { total, carrito, reiniciarPedido } = useAutoservicio();
  const [pedidoId, setPedidoId] = useState(null);
  const [numeroJornada, setNumeroJornada] = useState(null);
  const [enviado, setEnviado] = useState(false);
  const [validado, setValidado] = useState(false);
  const [vueltoFinal, setVueltoFinal] = useState(0);

  const enviarPedidoPendiente = async () => {
    try {
      const productosFormateados = carrito.map((item) => ({
        producto_id: item.id,
        cantidad: item.cantidad,
        personalizaciones: item.personalizaciones || "",
      }));

      const res = await axiosClient.post("/v1/pedidos", {
        metodoPago: "efectivo",
        productos: productosFormateados,
      });

      if (res.data.success) {
        setPedidoId(res.data.pedido_id);
        setNumeroJornada(res.data.numeroJornada);
        setEnviado(true);
      }
    } catch (error) {
      alert(error.response?.data?.mensaje || "Error al enviar el pedido");
    }
  };

  useEffect(() => {
    if (!enviado || !pedidoId || validado) return;

    const interval = setInterval(async () => {
      try {

        const res = await axiosClient.get(`/v1/pedidos`);
        const miPedido = res.data.data.find(p => p.id === pedidoId);

        if (miPedido && miPedido.estadoPago === "validado") {
          setVueltoFinal(miPedido.vuelto);
          setValidado(true);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error al consultar estado del pago", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [enviado, pedidoId, validado]);

  // pago recibido y validado por el atendedor
  if (validado) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center animate-fade-in">
        <span className="text-6xl"></span>
        <h2 className="text-brand-400 font-display text-2xl font-bold">¡Pago Validado!</h2>
        <p className="text-white text-lg font-medium">Tu pedido es el N° {numeroJornada}</p>
        <p className="text-green-400 text-lg font-semibold mt-1">
          "Tu pedido fue validado. En este momento lo estamos preparando"
        </p>
        {vueltoFinal > 0 && (
          <p className="text-carbon-300">Retira tu vuelto de ${vueltoFinal.toLocaleString("es-CL")}</p>
        )}
        <button
          onClick={reiniciarPedido}
          className="mt-6 min-h-touch px-8 py-3 rounded-full bg-brand-500 text-carbon-900 font-bold transition-transform hover:scale-105"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  // Pantalla 2: Pedido ya enviado, esperando activamente al atendedor
  if (enviado) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
        <div className="w-16 h-16 rounded-full border-4 border-brand-500/30 border-t-brand-500 animate-spin" />
        <h3 className="text-white font-display text-xl font-bold">
          Pedido N° {numeroJornada} Registrado
        </h3>
        <p className="text-carbon-300 max-w-sm">
          Por favor, entrega el efectivo al atendedor para validar tu pedido.
        </p>
        <p className="text-brand-400 font-bold text-lg">
          Total a pagar: ${total.toLocaleString("es-CL")}
        </p>
      </div>
    );
  }

  // boton para confirmar pedido e ir a pagar a caja
  return (
    <div className="flex flex-col gap-8 max-w-md mx-auto">
      <div className="bg-carbon-800 border border-accent/20 rounded-card p-6 text-center">
        <p className="text-white font-display text-lg font-medium">
          Pagarás en efectivo directamente en caja
        </p>
        <p className="text-carbon-300 text-sm mt-2">
          Total a pagar: <span className="text-brand-400 font-semibold">${total.toLocaleString("es-CL")}</span>
        </p>
      </div>

      <button
        onClick={enviarPedidoPendiente}
        className="w-full min-h-touch-lg rounded-card bg-brand-500 text-carbon-900 font-display font-bold hover:bg-brand-400 transition-transform active:scale-95"
      >
        Confirmar y Enviar Pedido a Caja
      </button>
    </div>
  );
}