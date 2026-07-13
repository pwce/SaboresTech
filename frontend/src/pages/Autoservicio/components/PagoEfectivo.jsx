import { useState } from "react";
import { useAutoservicio, PASOS } from "../../../context/AutoservicioContext";

export default function PagoEfectivo() {
  const { total, setPaso, setPedidoConfirmado, reiniciarPedido } = useAutoservicio();
  const [montoRecibido, setMontoRecibido] = useState("");
  const [validado, setValidado] = useState(false);

  const monto = Number(montoRecibido) || 0;
  const vuelto = Math.max(0, monto - total);
  const alcanza = monto >= total;

  function registrarPago() {
    if (!alcanza) return;
    setValidado(true);
    setPedidoConfirmado(true);
  }

  if (validado) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <span className="text-6xl">✅</span>
        <h2 className="text-white font-display text-2xl font-bold">¡Pedido Confirmado!</h2>
        <p className="text-carbon-300">Tu vuelto es ${vuelto.toLocaleString("es-CL")}</p>
        <button
          onClick={reiniciarPedido}
          className="mt-4 min-h-touch px-6 rounded-full bg-brand-500 text-white font-medium"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-carbon-800 border border-accent/20 rounded-card p-6 text-center">
        <p className="text-white font-display text-lg">
          Espera a que el atendedor reciba el dinero
        </p>
        <p className="text-carbon-300 text-sm mt-2">
          Total a pagar: <span className="text-brand-400 font-semibold">${total.toLocaleString("es-CL")}</span>
        </p>
      </div>

      {/*simulacion de produccion en la app del atendedor (celular)*/}
      <div className="border-t border-dashed border-accent/30 pt-6">
        <p className="text-accent text-xs uppercase tracking-wide mb-3">
          Simulación · Vista del atendedor
        </p>
        <label className="text-carbon-300 text-sm block mb-2">
          Monto recibido del cliente
        </label>
        <input
          type="number"
          inputMode="numeric"
          value={montoRecibido}
          onChange={(e) => setMontoRecibido(e.target.value)}
          placeholder="Ej: 5000"
          className="w-full min-h-touch rounded-lg bg-carbon-800 border border-accent/30 text-white px-4 mb-3"
        />
        <p className="text-white mb-4">
          Vuelto a entregar: <span className="text-brand-400 font-semibold">${vuelto.toLocaleString("es-CL")}</span>
        </p>
        <button
          onClick={registrarPago}
          disabled={!alcanza}
          className="w-full min-h-touch-lg rounded-card bg-brand-500 text-white font-display font-bold disabled:opacity-40"
        >
          Registrar pago y validar pedido
        </button>
      </div>
    </div>
  );
}
