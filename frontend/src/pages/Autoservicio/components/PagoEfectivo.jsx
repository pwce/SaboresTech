// PagoEfectivo.jsx
import { useState, useEffect } from "react";
import { useAutoservicio } from "../../../context/AutoservicioContext";
import axiosClient from "../../../api/axiosClient";
import { construirProductosPedido } from "../pedidoUtils";
import { IconExito, IconReloj, IconError } from "../../../components/Icons";

export default function PagoEfectivo({ onVolverAMetodos }) {
  const { total, carrito, reiniciarPedido } = useAutoservicio();
  const [pedidoId, setPedidoId] = useState(null);
  const [numeroJornada, setNumeroJornada] = useState(null);
  const [enviado, setEnviado] = useState(false);
  const [validado, setValidado] = useState(false);
  const [rechazado, setRechazado] = useState(false); // NUEVO
  const [vueltoFinal, setVueltoFinal] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const enviarPedidoPendiente = async () => {
      setEnviando(true);
      setError("");
      try {
        const res = await axiosClient.post("/v1/pedidos", {
          metodoPago: "efectivo",
          productos: construirProductosPedido(carrito),
        });
  
        if (res.data.success) {
          setPedidoId(res.data.pedido_id);
          setNumeroJornada(res.data.numeroJornada);
          setEnviado(true);
        }
      } catch (err) {
        setError(err.response?.data?.mensaje || "Error al enviar el pedido");
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
            setVueltoFinal(miPedido.vuelto || 0);
            setValidado(true);
            clearInterval(interval);
          }
  
          //el atendedor rechazó el pago (efectivo insuficiente/falso, etc.)
          if (miPedido && miPedido.estadoPago === "rechazado") {
            setRechazado(true);
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Error al consultar estado del pago", err);
        }
      }, 3000);
  
      return () => clearInterval(interval);
    }, [enviado, pedidoId, validado, rechazado]);
  
    // pago rechazado por el atendedor
    if (rechazado) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center animate-fade-in">
          <IconError className="w-16 h-16 text-red-400" />
          <h2 className="text-red-400 font-display text-2xl font-bold">Pago Rechazado</h2>
          <p className="text-carbon-300 max-w-sm">
            El atendedor no pudo validar tu pago. Acércate a caja para resolverlo o intenta nuevamente.
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
  
    // pago recibido y validado por el atendedor
    if (validado) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center animate-fade-in">
          <IconExito className="w-16 h-16 text-brand-400" />
          <h2 className="text-brand-400 font-display text-2xl font-bold">¡Pago Validado!</h2>
          <p className="text-white text-lg font-medium">Tu pedido es el N° {numeroJornada}</p>
          <p className="text-green-400 text-lg font-semibold mt-1">
            Tu pedido fue validado. En este momento lo estamos preparando.
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
  
    // pedido ya enviado, esperando activamente al atendedor
    if (enviado) {
      return (
        <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
          <IconReloj className="w-14 h-14 text-brand-400 animate-pulse" />
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
          {enviando ? "Enviando..." : "Confirmar y Enviar Pedido a Caja"}
        </button>
  
        <button
          onClick={onVolverAMetodos}
          className="text-carbon-300 text-sm underline"
        >
          Elegir otro método de pago
        </button>
      </div>
    );
  }
  