// PagoTransferencia.jsx
import { useState, useEffect } from "react";
import { useAutoservicio } from "../../../context/AutoservicioContext";
import axiosClient from "../../../api/axiosClient";
import { construirProductosPedido } from "../pedidoUtils";
import { IconExito, IconReloj, IconError } from "../../../components/Icons";

const DATOS_BANCARIOS = {
  banco: "Mercado Pago",
  tipoCuenta: "Cuenta Vista",
  rut: "12.345.678-9",
  numeroCuenta: 1234567890,
  titular: "Sabores de Carolina",
  email: "saboresdecarolinaaa@gmail.com",
};

export default function PagoTransferencia() {
  const { total, carrito, reiniciarPedido } = useAutoservicio();
  const [pedidoId, setPedidoId] = useState(null);
  const [numeroJornada, setNumeroJornada] = useState(null);
  const [enviado, setEnviado] = useState(false);
  const [validado, setValidado] = useState(false);
  const [rechazado, setRechazado] = useState(false); // NUEVO
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const enviarPedidoPendiente = async () => {
    setEnviando(true);
    setError("");
    try {
      const res = await axiosClient.post("/v1/pedidos", {
        metodoPago: "transferencia",
        productos: construirProductosPedido(carrito),
      });

      if (res.data.success) {
        setPedidoId(res.data.pedido_id);
        setNumeroJornada(res.data.numeroJornada);
        setEnviado(true);
      }
    } catch (error) {
      setError(error.response?.data?.mensaje || "Error al procesar el pedido");
    } finally {
      setEnviando(false);
    }
  };

  useEffect(() => {
    if (!enviado || !pedidoId || validado || rechazado) return;

    const interval = setInterval(async () => {
      try {
        const res = await axiosClient.get(`/v1/pedidos/${pedidoId}`);
        const miPedido = res.data.data;

        if (miPedido && miPedido.estadoPago === "validado") {
          setValidado(true);
          clearInterval(interval);
        }

        // el atendedor rechazó el comprobante
        if (miPedido && miPedido.estadoPago === "rechazado") {
          setRechazado(true);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error al consultar estado del pago", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [enviado, pedidoId, validado, rechazado]);

  // comprobante rechazado por el atendedor
    if (rechazado) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center animate-fade-in">
        <IconError className="w-16 h-16 text-red-400" />
        <h2 className="text-red-400 font-display text-2xl font-bold">Comprobante Rechazado</h2>
        <p className="text-carbon-300 max-w-sm">
          El atendedor no pudo validar tu transferencia. Acércate a caja para resolverlo o intenta nuevamente.
        </p>
        <button
          onClick={reiniciarPedido}
          className="mt-6 min-h-touch px-8 py-3 rounded-full bg-brand-500 text-carbon-900 font-bold transition-transform hover:scale-105"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

    // comprobante validado por el atendedor
    if (validado) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center animate-fade-in">
          <IconExito className="w-16 h-16 text-brand-400" />
          <h2 className="text-brand-400 font-display text-2xl font-bold">¡Comprobante Validado!</h2>
          <p className="text-white text-lg font-medium">Tu pedido es el N° {numeroJornada}</p>
          <p className="text-green-400 text-lg font-semibold mt-1">
            Tu pedido fue validado. En este momento lo estamos preparando.
          </p>
        <button
          onClick={reiniciarPedido}
          className="mt-6 min-h-touch px-8 py-3 rounded-full bg-brand-500 text-carbon-900 font-bold transition-transform hover:scale-105"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  // esperar validación del atendedor
  if (enviado) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
        <IconReloj className="w-14 h-14 text-brand-400 animate-pulse" />
        <h3 className="text-white font-display text-xl font-bold">
          Pedido N° {numeroJornada} Recibido
        </h3>
        <p className="text-yellow-400 font-semibold animate-pulse">
          Espera a que el atendedor valide tu transferencia
        </p>
        <p className="text-carbon-400 text-xs max-w-xs">
          El atendedor está comprobando la transacción en el sistema de Mercado Pago. No cierres esta ventana.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto">
      <div className="bg-carbon-800 border border-accent/20 rounded-card p-6">
        <h2 className="text-white font-display text-lg font-semibold mb-4 text-center">
          Datos para transferir
        </h2>
        <dl className="flex flex-col gap-2 text-sm">
          {Object.entries({
            Banco: DATOS_BANCARIOS.banco,
            "Tipo de cuenta": DATOS_BANCARIOS.tipoCuenta,
            Rut: DATOS_BANCARIOS.rut,
            "N° de cuenta": DATOS_BANCARIOS.numeroCuenta,
            Titular: DATOS_BANCARIOS.titular,
            Email: DATOS_BANCARIOS.email,
            Monto: `$${total.toLocaleString("es-CL")}`,
          }).map(([label, valor]) => (
            <div key={label} className="flex justify-between border-b border-carbon-700 py-1">
              <dt className="text-carbon-300">{label}</dt>
              <dd className="text-white font-medium">{valor}</dd>
            </div>
          ))}
        </dl>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-card bg-red-500/10 border border-red-500 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <button
        onClick={enviarPedidoPendiente}
        disabled={enviando}
        className="w-full min-h-touch-lg rounded-card bg-brand-500 text-carbon-900 font-display font-bold hover:bg-brand-400 transition-transform active:scale-95 disabled:opacity-60"
      >
        {enviando ? "Enviando..." : "Ya transferí, enviar pedido"}
      </button>
    </div>
  );
}
